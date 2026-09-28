import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { sqliteLocalDataSource } from '../data/local/sqliteLocalDataSource';
import { OutboxService } from './outboxService';
import { apiClient } from '../data/remote/apiClient';
import { ApiEndpoints } from '../config/api';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { OutboxItemEntity, SyncState } from '../domain/entities';
import { logger } from '../utils/logger';

export class SyncEngine {
  private static isSyncing = false;
  private static unsubscribeNetInfo: (() => void) | null = null;
  private static syncState: SyncState = 'ONLINE';

  /**
   * Initializes network connectivity listener and auto-sync trigger.
   */
  static startMonitoring(): void {
    if (this.unsubscribeNetInfo) {
      return;
    }

    logger.info('SyncEngine', 'Starting network connectivity monitoring');

    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const isConnected = !!(state.isConnected && state.isInternetReachable !== false);

      if (isConnected && this.syncState === 'OFFLINE') {
        this.syncState = 'ONLINE';
        logger.info('SyncEngine', 'Network restored. Triggering automatic synchronization.');
        this.sync();
      } else if (!isConnected) {
        this.syncState = 'OFFLINE';
        logger.info('SyncEngine', 'Device is offline.');
      }
    });
  }

  /**
   * Stop network listener on app teardown.
   */
  static stopMonitoring(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
  }

  /**
   * Get current sync engine state.
   */
  static getSyncState(): SyncState {
    return this.syncState;
  }

  /**
   * Run synchronization of all pending outbox mutations.
   */
  static async sync(): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (this.isSyncing) {
      logger.info('SyncEngine', 'Sync already in progress. Skipping duplicate run.');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const { user, status } = useAuthStore.getState();
    if (status !== 'AUTHENTICATED' || !user) {
      logger.info('SyncEngine', 'No active authenticated session. Aborting sync.');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      this.syncState = 'OFFLINE';
      logger.info('SyncEngine', 'Cannot sync while device is offline.');
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    this.isSyncing = true;
    this.syncState = 'SYNCING';

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    try {
      const pendingItems = await sqliteLocalDataSource.getPendingMutations(user.id);
      logger.info('SyncEngine', `Found ${pendingItems.length} pending mutations for user ${user.id}`);

      for (const item of pendingItems) {
        // Enforce user isolation
        if (item.userId !== user.id) {
          continue;
        }

        processed++;
        await sqliteLocalDataSource.updateMutationStatus(item.id, 'PROCESSING', {
          lastAttemptAt: new Date().toISOString(),
          attemptCount: item.attemptCount + 1,
        });

        try {
          await this.executeMutation(item);
          await sqliteLocalDataSource.updateMutationStatus(item.id, 'SUCCEEDED');
          await sqliteLocalDataSource.deleteMutation(item.id);
          succeeded++;
          logger.info('SyncEngine', `Successfully processed mutation ${item.id} (${item.entityType})`);
        } catch (error: any) {
          failed++;
          const status = error.response?.status;
          const errorMessage = error.message || 'Network submission failed';

          if (status === 403) {
            // Permanent failure due to lack of permissions
            await sqliteLocalDataSource.updateMutationStatus(item.id, 'FAILED_PERMANENT', {
              errorCode: 'FORBIDDEN',
              errorMessage: 'Permission denied for this operation.',
            });
          } else if (status === 409) {
            // Conflict state
            await sqliteLocalDataSource.updateMutationStatus(item.id, 'CONFLICT', {
              errorCode: 'CONFLICT',
              errorMessage: 'Conflict with authoritative server state.',
            });
          } else {
            // Retryable error with backoff
            const delayMs = OutboxService.getBackoffDelayMs(item.attemptCount + 1);
            const nextRetry = new Date(Date.now() + delayMs).toISOString();

            await sqliteLocalDataSource.updateMutationStatus(item.id, 'FAILED_RETRYABLE', {
              errorCode: status ? String(status) : 'NETWORK_ERROR',
              errorMessage,
              nextRetryAt: nextRetry,
            });
          }
        }
      }

      this.syncState = failed > 0 ? 'SYNC_FAILED' : 'SYNC_COMPLETE';
    } catch (error) {
      logger.error('SyncEngine', 'Fatal error during synchronization run', error);
      this.syncState = 'SYNC_FAILED';
    } finally {
      this.isSyncing = false;
    }

    return { processed, succeeded, failed };
  }

  /**
   * Dispatches outbox mutation to authoritative backend endpoint.
   */
  private static async executeMutation(item: OutboxItemEntity): Promise<any> {
    if (item.entityType === 'EVIDENCE') {
      const response = await apiClient.post<any>(ApiEndpoints.citizen.submitEvidence, {
        project_id: item.payload.projectId,
        latitude: item.payload.latitude,
        longitude: item.payload.longitude,
        timestamp_captured: item.payload.timestampCaptured,
        is_live_camera_capture: item.payload.isLiveCameraCapture,
        image_base64: item.payload.imageBase64,
      });
      return response;
    } else if (item.entityType === 'INSPECTION') {
      const response = await apiClient.post<any>(
        ApiEndpoints.officer.updateInspection(item.entityId),
        {
          inspection_status: item.payload.inspectionStatus,
          observations: item.payload.observations,
          physical_progress_percent: item.payload.physicalProgressPercent,
        }
      );
      return response;
    }

    throw new Error(`Unsupported outbox entity type: ${item.entityType}`);
  }
}
