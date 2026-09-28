import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Text } from './Text';
import { Colors, Spacing, Radii } from '../theme';
import { useUnreadNotificationCountQuery } from '../../features/notifications';
import { useTranslation } from '../../i18n';

interface NotificationBellProps {
  color?: string;
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  color = Colors.textPrimary,
  size = 22,
}) => {
  const { data: unreadCount = 0 } = useUnreadNotificationCountQuery();
  const { t } = useTranslation();

  const handlePress = () => {
    router.push('/notifications');
  };

  const label =
    unreadCount > 0
      ? `${t('notifications.title')}, ${unreadCount} ${t('notifications.unread')}`
      : t('notifications.title');

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={t('notifications.viewAll')}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={[styles.bellIcon, { fontSize: size, color }]}>🔔</Text>
      {unreadCount > 0 && (
        <View style={styles.badge} testID="notification-unread-badge">
          <Text variant="caption" style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bellIcon: {
    lineHeight: 24,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    backgroundColor: Colors.danger,
    borderRadius: Radii.full,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
});
