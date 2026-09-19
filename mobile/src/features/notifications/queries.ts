import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RemoteNotificationRepository } from '../../data/repositories/RemoteNotificationRepository';
import {
  NotificationEntity,
  NotificationPreferencesEntity,
  DeviceRegistrationEntity,
} from '../../domain/entities';
import { QueryKeys } from '../../data/remote/queryKeys';

const notificationRepository = new RemoteNotificationRepository();

export const useNotificationsQuery = (category?: string) => {
  return useQuery<NotificationEntity[]>({
    queryKey: QueryKeys.notifications.list(category),
    queryFn: () => notificationRepository.getNotifications(category),
  });
};

export const useUnreadNotificationCountQuery = () => {
  return useQuery<number>({
    queryKey: QueryKeys.notifications.unreadCount(),
    queryFn: () => notificationRepository.getUnreadCount(),
    refetchInterval: 60000, // Background poll every 60s
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      notificationRepository.markAsRead(notificationId),
    onSuccess: (updatedNotification) => {
      // Invalidate both list and unread count
      queryClient.invalidateQueries({ queryKey: QueryKeys.notifications.all });
    },
  });
};

export const useNotificationPreferencesQuery = () => {
  return useQuery<NotificationPreferencesEntity>({
    queryKey: QueryKeys.notifications.preferences(),
    queryFn: () => notificationRepository.getPreferences(),
  });
};

export const useUpdateNotificationPreferencesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreferencesEntity>) =>
      notificationRepository.updatePreferences(preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.notifications.preferences(),
      });
    },
  });
};

export const useRegisterDeviceMutation = () => {
  return useMutation({
    mutationFn: (device: DeviceRegistrationEntity) =>
      notificationRepository.registerDevice(device),
  });
};

export const useUnregisterDeviceMutation = () => {
  return useMutation({
    mutationFn: (deviceId: string) =>
      notificationRepository.unregisterDevice(deviceId),
  });
};
