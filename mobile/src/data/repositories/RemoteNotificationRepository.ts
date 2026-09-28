import { INotificationRepository } from '../../domain/interfaces';
import {
  NotificationEntity,
  NotificationPreferencesEntity,
  DeviceRegistrationEntity,
} from '../../domain/entities';
import { apiClient } from '../remote/apiClient';
import { ApiEndpoints } from '../../config/api';
import {
  NotificationDTO,
  UnreadCountResponseDTO,
  NotificationPreferencesResponseDTO,
  DeviceRegistrationResponseDTO,
} from '../remote/dto';
import { DataMappers } from '../remote/mappers';

export class RemoteNotificationRepository implements INotificationRepository {
  async getNotifications(category?: string): Promise<NotificationEntity[]> {
    const params: Record<string, string> = {};
    if (category) {
      params.category = category;
    }

    const data = await apiClient.get<NotificationDTO[]>(ApiEndpoints.notifications.feed, {
      params,
    });

    return (data || []).map(DataMappers.mapNotificationDTOToEntity);
  }

  async getUnreadCount(): Promise<number> {
    const data = await apiClient.get<UnreadCountResponseDTO>(
      ApiEndpoints.notifications.unreadCount
    );
    return data.unread_count || 0;
  }

  async markAsRead(notificationId: string): Promise<NotificationEntity> {
    const data = await apiClient.post<NotificationDTO>(
      ApiEndpoints.notifications.markRead(notificationId)
    );
    return DataMappers.mapNotificationDTOToEntity(data);
  }

  async registerDevice(
    device: DeviceRegistrationEntity
  ): Promise<{ status: string; deviceId: string }> {
    const data = await apiClient.post<DeviceRegistrationResponseDTO>(
      ApiEndpoints.notifications.devices,
      {
        push_token: device.pushToken,
        device_id: device.deviceId,
        platform: device.platform,
        app_version: device.appVersion,
      }
    );

    return {
      status: data.status,
      deviceId: data.device_id,
    };
  }

  async unregisterDevice(
    deviceId: string
  ): Promise<{ status: string; deviceId: string }> {
    const data = await apiClient.delete<{ status: string; device_id: string }>(
      ApiEndpoints.notifications.deviceDetail(deviceId)
    );

    return {
      status: data.status,
      deviceId: data.device_id,
    };
  }

  async getPreferences(): Promise<NotificationPreferencesEntity> {
    const data = await apiClient.get<NotificationPreferencesResponseDTO>(
      ApiEndpoints.notifications.preferences
    );
    return DataMappers.mapNotificationPreferencesDTOToEntity(data);
  }

  async updatePreferences(
    preferences: Partial<NotificationPreferencesEntity>
  ): Promise<NotificationPreferencesEntity> {
    const data = await apiClient.put<NotificationPreferencesResponseDTO>(
      ApiEndpoints.notifications.preferences,
      {
        push_enabled: preferences.pushEnabled,
        evidence_updates: preferences.evidenceUpdates,
        risk_alerts: preferences.riskAlerts,
        sla_alerts: preferences.slaAlerts,
        inspection_updates: preferences.inspectionUpdates,
        project_milestones: preferences.projectMilestones,
      }
    );
    return DataMappers.mapNotificationPreferencesDTOToEntity(data);
  }
}
