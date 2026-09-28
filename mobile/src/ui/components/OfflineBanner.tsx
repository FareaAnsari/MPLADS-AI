import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Text } from './Text';
import { Badge } from './Badge';
import { Colors, Spacing, Radii } from '../theme';
import { useTranslation } from '../../i18n';
import { SyncEngine } from '../../services/syncEngine';
import { OutboxService } from '../../services/outboxService';
import { useAuthStore } from '../../store/authStore';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const { user, status } = useAuthStore();
  const isAuthenticated = status === 'AUTHENTICATED';
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Check initial connection
    NetInfo.fetch().then((state) => {
      setIsOffline(!state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
      if (state.isConnected && isAuthenticated && user) {
        checkPending();
      }
    });

    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [isAuthenticated, user]);

  const checkPending = async () => {
    if (user?.id) {
      try {
        const count = await OutboxService.getPendingCount(user.id);
        setPendingCount(count);
      } catch {
        setPendingCount(0);
      }
    }
  };

  const handleManualSync = async () => {
    if (isSyncing || isOffline) return;
    setIsSyncing(true);
    try {
      await SyncEngine.sync();
      await checkPending();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOffline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        isOffline ? styles.offlineBg : styles.pendingBg,
      ]}
      accessibilityRole="alert"
      accessibilityLabel={
        isOffline
          ? t('offline.offlineNotice')
          : pendingCount > 0
          ? `${pendingCount} ${t('offline.itemsPendingSync')}`
          : t('offline.syncing')
      }
    >
      <View style={styles.contentRow}>
        <Text variant="caption" style={styles.icon}>
          {isOffline ? '📡' : isSyncing ? '🔄' : '📤'}
        </Text>
        <Text variant="caption" color={Colors.textPrimary} style={styles.text}>
          {isOffline
            ? t('offline.offlineNotice')
            : isSyncing
            ? t('offline.syncing')
            : `${pendingCount} ${t('offline.itemsPendingSync')}`}
        </Text>
      </View>

      {!isOffline && pendingCount > 0 && !isSyncing && (
        <TouchableOpacity
          onPress={handleManualSync}
          style={styles.syncBtn}
          accessibilityRole="button"
          accessibilityLabel={t('offline.syncNow')}
        >
          <Badge label={t('offline.syncNow')} variant="primary" size="sm" />
        </TouchableOpacity>
      )}

      {isSyncing && (
        <ActivityIndicator size="small" color={Colors.primaryDark} style={styles.spinner} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  offlineBg: {
    backgroundColor: '#FEF3C7', // Warm amber highlight
  },
  pendingBg: {
    backgroundColor: '#E0F2FE', // Calm blue highlight
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  icon: {
    fontSize: 14,
  },
  text: {
    fontWeight: '600',
    flexShrink: 1,
  },
  syncBtn: {
    marginLeft: Spacing.sm,
  },
  spinner: {
    marginLeft: Spacing.sm,
  },
});
