import { sqliteLocalDataSource } from '../data/local/sqliteLocalDataSource';
import {
  OutboxItemEntity,
  CitizenEvidenceEntity,
  InspectionUpdateEntity,
} from '../domain/entities';
import { logger } from '../utils/logger';

export class OutboxService {
  /**
   * Generates a stable client-side idempotency key.
   */
  static generateIdempotencyKey(prefix: string, userId: string, entityId: string): string {
    return `${prefix}-${userId}-${entityId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  /**
   * Queue an offline evidence submission.
   */
  static async queueEvidenceSubmission(
    userId: string,
    role: string,
    evidence: CitizenEvidenceEntity
  ): Promise<OutboxItemEntity<CitizenEvidenceEntity>> {
    const idempotencyKey = this.generateIdempotencyKey('evidence', userId, evidence.projectId);

    logger.info('OutboxService', `Queueing evidence submission for project ${evidence.projectId}`);

    return sqliteLocalDataSource.enqueueMutation<CitizenEvidenceEntity>({
      userId,
      role,
      entityType: 'EVIDENCE',
      entityId: evidence.projectId,
      operation: 'CREATE',
      payload: evidence,
      idempotencyKey,
    });
  }

  /**
   * Queue an offline inspection update.
   */
  static async queueInspectionUpdate(
    userId: string,
    role: string,
    inspection: InspectionUpdateEntity
  ): Promise<OutboxItemEntity<InspectionUpdateEntity>> {
    const idempotencyKey = this.generateIdempotencyKey('inspection', userId, inspection.workId);

    logger.info('OutboxService', `Queueing inspection update for project ${inspection.workId}`);

    return sqliteLocalDataSource.enqueueMutation<InspectionUpdateEntity>({
      userId,
      role,
      entityType: 'INSPECTION',
      entityId: inspection.workId,
      operation: 'UPDATE',
      payload: inspection,
      idempotencyKey,
    });
  }

  /**
   * Get pending mutation count for the authenticated user.
   */
  static async getPendingCount(userId: string): Promise<number> {
    const items = await sqliteLocalDataSource.getPendingMutations(userId);
    return items.length;
  }

  /**
   * Fetch all pending outbox items.
   */
  static async getPendingItems(userId: string): Promise<OutboxItemEntity[]> {
    return sqliteLocalDataSource.getPendingMutations(userId);
  }

  /**
   * Calculate bounded exponential backoff in ms.
   */
  static getBackoffDelayMs(attemptCount: number): number {
    const baseDelay = 1000; // 1s
    const maxDelay = 60000; // 60s
    const delay = baseDelay * Math.pow(2, attemptCount);
    return Math.min(delay, maxDelay);
  }
}
