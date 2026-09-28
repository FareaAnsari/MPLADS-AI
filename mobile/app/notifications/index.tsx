import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Screen,
  Text,
  Card,
  Badge,
  EmptyState,
  ErrorState,
  OfflineBanner,
} from '../../src/ui/components';
import { Colors, Spacing, Radii } from '../../src/ui/theme';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
} from '../../src/features/notifications';
import { NotificationEntity } from '../../src/domain/entities';
import { NotificationService } from '../../src/services/notificationService';
import { useTranslation } from '../../src/i18n';

type CategoryFilter = 'ALL' | 'EVIDENCE' | 'RISK' | 'SLA' | 'INSPECTION' | 'PROJECT' | 'SYSTEM';

const CATEGORIES: { key: CategoryFilter; labelKey: string }[] = [
  { key: 'ALL', labelKey: 'notifications.categoryAll' },
  { key: 'EVIDENCE', labelKey: 'notifications.categoryEvidence' },
  { key: 'RISK', labelKey: 'notifications.categoryRisk' },
  { key: 'SLA', labelKey: 'notifications.categorySla' },
  { key: 'INSPECTION', labelKey: 'notifications.categoryInspection' },
  { key: 'PROJECT', labelKey: 'notifications.categoryProject' },
  { key: 'SYSTEM', labelKey: 'notifications.categorySystem' },
];

export default function NotificationCenterScreen() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('ALL');
  const [pushStatus, setPushStatus] = useState<{ granted: boolean; status: string; isSimulator: boolean } | null>(null);

  const categoryParam = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useNotificationsQuery(categoryParam);

  const markAsReadMutation = useMarkNotificationReadMutation();

  useEffect(() => {
    // Check push status on mount
    NotificationService.requestPermissions().then(setPushStatus);
  }, []);

  const handleEnablePush = async () => {
    const res = await NotificationService.requestPermissions();
    setPushStatus(res);
    if (res.granted) {
      await NotificationService.registerDeviceForPush();
    }
  };

  const handleNotificationPress = (item: NotificationEntity) => {
    // Optimistically mark as read if not already read
    if (!item.readAt) {
      markAsReadMutation.mutate(item.id);
    }

    // Route safely via RBAC NotificationRouter
    NotificationService.handleNotificationNavigation({
      notificationId: item.id,
      type: item.type,
      category: item.category,
      entityType: item.entityType,
      entityId: item.entityId,
      deepLink: item.deepLink,
    });
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'RISK':
        return 'danger';
      case 'SLA':
        return 'warning';
      case 'EVIDENCE':
        return 'primary';
      case 'INSPECTION':
        return 'info';
      case 'PROJECT':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'RISK':
        return '⚠️';
      case 'SLA':
        return '⏱️';
      case 'EVIDENCE':
        return '📷';
      case 'INSPECTION':
        return '📋';
      case 'PROJECT':
        return '🏗️';
      default:
        return '📢';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return t('notifications.justNow');
      if (diffMins < 60) return `${diffMins} ${t('notifications.minutesAgo')}`;
      if (diffHours < 24) return `${diffHours} ${t('notifications.hoursAgo')}`;
      return `${diffDays} ${t('notifications.daysAgo')}`;
    } catch {
      return dateString;
    }
  };

  const renderItem = ({ item }: { item: NotificationEntity }) => {
    const isUnread = !item.readAt;
    const timeFormatted = formatRelativeTime(item.createdAt);

    const accessibilityLabelText = `${
      isUnread ? t('notifications.unreadState') : t('notifications.readState')
    }. ${t('notifications.category')}: ${item.category}. ${item.title}. ${item.body}. ${timeFormatted}.`;

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabelText}
        accessibilityHint={t('notifications.tapToOpen')}
        testID={`notification-card-${item.id}`}
      >
        <Card
          style={[
            styles.card,
            isUnread && styles.unreadCard,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.categoryRow}>
              <Text style={styles.categoryIcon}>{getCategoryIcon(item.category)}</Text>
              <Badge
                label={item.category}
                variant={getCategoryBadgeVariant(item.category) as any}
                size="sm"
              />
            </View>

            <View style={styles.headerRight}>
              <Text variant="caption" color={Colors.textMuted}>
                {timeFormatted}
              </Text>
              {isUnread && (
                <View
                  style={styles.unreadDot}
                  accessibilityLabel={t('notifications.unread')}
                  testID="unread-indicator-dot"
                />
              )}
            </View>
          </View>

          <Text
            variant="bodyLarge"
            color={Colors.textPrimary}
            style={[styles.title, isUnread && styles.unreadTitle]}
          >
            {item.title}
          </Text>

          <Text
            variant="bodyMedium"
            color={Colors.textSecondary}
            numberOfLines={2}
            style={styles.body}
          >
            {item.body}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Screen style={styles.screen} scrollable={false}>
      <OfflineBanner />

      {/* Permission banner if push disabled on real device */}
      {pushStatus && !pushStatus.granted && !pushStatus.isSimulator && (
        <View style={styles.permissionBanner}>
          <Text variant="bodyMedium" color={Colors.textPrimary} style={styles.bannerText}>
            {t('notificationPermissions.bannerExplanation')}
          </Text>
          <TouchableOpacity
            style={styles.enableBtn}
            onPress={handleEnablePush}
            accessibilityRole="button"
            accessibilityLabel={t('notificationPermissions.enableButton')}
          >
            <Text variant="bodySmall" color={Colors.textInverse} style={styles.enableBtnText}>
              {t('notificationPermissions.enableButton')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Filter Pills */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={t(cat.labelKey)}
              >
                <Text
                  variant="bodySmall"
                  color={isSelected ? Colors.textInverse : Colors.textSecondary}
                  style={styles.filterText}
                >
                  {t(cat.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text variant="bodyMedium" color={Colors.textSecondary}>
            {t('notifications.loading')}
          </Text>
        </View>
      ) : isError ? (
        <ErrorState
          title={t('notifications.errorTitle')}
          message={error?.message || t('notifications.errorDescription')}
          onRetry={refetch}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          title={t('notifications.emptyTitle')}
          description={t('notifications.emptyDescription')}
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </Screen>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  permissionBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  bannerText: {
    flex: 1,
    marginRight: Spacing.sm,
    fontSize: 13,
  },
  enableBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.sm,
  },
  enableBtnText: {
    fontWeight: '600',
  },
  categoriesContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  categoriesScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryIcon: {
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  body: {
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
