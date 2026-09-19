import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Button,
  Card,
  Badge,
  ErrorState,
} from '../../src/ui/components';
import { Colors, Spacing, Radii } from '../../src/ui/theme';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { useOfficerDashboardQuery } from '../../src/features/officer/queries';
import { formatNumberIN } from '../../src/utils/formatters';

export default function OfficerDashboardScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const { user } = useAuthStore();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useOfficerDashboardQuery();

  const officer = data?.officer || {
    fullName: user?.name || 'District Planning Officer',
    jurisdictionDistrict: 'Araria',
    jurisdictionState: 'Bihar',
    inspectorId: 'insp-01',
  };

  const metrics = data?.metrics || {
    totalDistrictProjects: 0,
    inProgressCount: 0,
    completedCount: 0,
    highRiskCount: 0,
    pendingEvidenceCount: 0,
    slaBottlenecksCount: 0,
  };

  return (
    <Screen scrollable>
      {/* Jurisdiction & Officer Header */}
      <View style={styles.header}>
        <Badge
          label={`${t('officer.jurisdiction')}: ${officer.jurisdictionDistrict || 'District'}, ${officer.jurisdictionState || 'State'}`}
          variant="primary"
          size="md"
          style={styles.jurisdictionBadge}
        />
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {officer.fullName}
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          {t('officer.dashboardSubtitle')}
        </Text>
      </View>

      {/* District Operational Metrics Card */}
      <Card style={styles.metricsCard}>
        <View style={styles.metricsHeader}>
          <Text variant="title">
            {isHindi ? 'जिला परिचालन अवलोकन' : 'District Operational Metrics'}
          </Text>
          <Badge
            label={officer.inspectorId ? `${t('officer.assignedInspectorId')}: ${officer.inspectorId}` : t('common.online')}
            variant="secondary"
            size="sm"
          />
        </View>

        {isLoading ? (
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {t('common.loading')}
          </Text>
        ) : error ? (
          <ErrorState
            title={t('errors.network')}
            onRetry={refetch}
          />
        ) : (
          <View style={styles.gridContainer}>
            <View style={styles.statBox}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('officer.totalDistrictWorks')}
              </Text>
              <Text variant="h2" color={Colors.primaryDark}>
                {formatNumberIN(metrics.totalDistrictProjects)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('officer.inProgressWorks')}
              </Text>
              <Text variant="h2" color={Colors.primary}>
                {formatNumberIN(metrics.inProgressCount)}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('officer.completedWorks')}
              </Text>
              <Text variant="h2" color={Colors.success}>
                {formatNumberIN(metrics.completedCount)}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Urgent Operational Attention Queue */}
      <Text variant="title" style={styles.sectionHeading}>
        {t('officer.attentionQueue')}
      </Text>

      <View style={styles.queueContainer}>
        {/* Pending Evidence */}
        <Card
          interactive
          onPress={() => router.push('/(officer)/evidence')}
          style={[styles.queueCard, metrics.pendingEvidenceCount > 0 && styles.queueCardAlert]}
          accessibilityLabel={`${t('officer.pendingEvidenceReview')}: ${metrics.pendingEvidenceCount}`}
        >
          <View style={styles.queueRow}>
            <View style={styles.queueLeft}>
              <Text variant="bodyLarge" style={styles.boldText}>
                {t('officer.pendingEvidenceReview')}
              </Text>
              <Text variant="caption" color={Colors.textSecondary}>
                {isHindi ? 'नागरिकों द्वारा प्रस्तुत साक्ष्य सत्यापन की प्रतीक्षा में' : 'Citizen ground submissions awaiting formal review'}
              </Text>
            </View>
            <Badge
              label={String(metrics.pendingEvidenceCount)}
              variant={metrics.pendingEvidenceCount > 0 ? 'warning' : 'secondary'}
              size="md"
            />
          </View>
        </Card>

        {/* High Risk Alerts */}
        <Card
          interactive
          onPress={() => router.push('/(officer)/projects')}
          style={[styles.queueCard, metrics.highRiskCount > 0 && styles.queueCardDanger]}
          accessibilityLabel={`${t('officer.highRiskAlerts')}: ${metrics.highRiskCount}`}
        >
          <View style={styles.queueRow}>
            <View style={styles.queueLeft}>
              <Text variant="bodyLarge" style={styles.boldText}>
                {t('officer.highRiskAlerts')}
              </Text>
              <Text variant="caption" color={Colors.textSecondary}>
                {isHindi ? 'एआई जोखिम इंजन द्वारा चिह्नित उच्च विचलन परियोजनाएं' : 'Projects flagged with severe risk or cost anomalies'}
              </Text>
            </View>
            <Badge
              label={String(metrics.highRiskCount)}
              variant={metrics.highRiskCount > 0 ? 'danger' : 'success'}
              size="md"
            />
          </View>
        </Card>

        {/* SLA Bottlenecks */}
        <Card
          interactive
          onPress={() => router.push('/(officer)/sla')}
          style={styles.queueCard}
          accessibilityLabel={`${t('officer.slaBottlenecks')}: ${metrics.slaBottlenecksCount}`}
        >
          <View style={styles.queueRow}>
            <View style={styles.queueLeft}>
              <Text variant="bodyLarge" style={styles.boldText}>
                {t('officer.slaBottlenecks')}
              </Text>
              <Text variant="caption" color={Colors.textSecondary}>
                {isHindi ? 'वैधानिक समय-सीमा से अधिक विलंबित चरण' : 'Milestones exceeding statutory SLA timeline benchmarks'}
              </Text>
            </View>
            <Badge
              label={String(metrics.slaBottlenecksCount)}
              variant="warning"
              size="md"
            />
          </View>
        </Card>
      </View>

      {/* Operational Gateway Actions */}
      <Text variant="title" style={styles.sectionHeading}>
        {isHindi ? 'अधिकारी परिचालन मॉड्यूल' : 'Officer Operational Modules'}
      </Text>

      <View style={styles.actionsGrid}>
        <Card
          interactive
          onPress={() => router.push('/(officer)/projects')}
          style={styles.actionCard}
        >
          <Text variant="h3">📁</Text>
          <Text variant="title" color={Colors.primaryDark} style={{ marginTop: Spacing.xs }}>
            {t('officer.totalDistrictWorks')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {isHindi ? 'जिले में स्वीकृत सभी विकास कार्यों का अन्वेषण और निरीक्षण करें।' : 'Browse and inspect all projects in your district jurisdiction.'}
          </Text>
        </Card>

        <Card
          interactive
          onPress={() => router.push('/(officer)/inspections')}
          style={styles.actionCard}
        >
          <Text variant="h3">🗺</Text>
          <Text variant="title" color={Colors.primaryDark} style={{ marginTop: Spacing.xs }}>
            {t('officer.inspectionRouterAction')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {t('officer.inspectionRouterDesc')}
          </Text>
        </Card>

        <Card
          interactive
          onPress={() => router.push('/(officer)/evidence')}
          style={styles.actionCard}
        >
          <Text variant="h3">⚖</Text>
          <Text variant="title" color={Colors.primaryDark} style={{ marginTop: Spacing.xs }}>
            {t('officer.reviewEvidenceAction')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {t('officer.reviewEvidenceDesc')}
          </Text>
        </Card>

        <Card
          interactive
          onPress={() => router.push('/(officer)/sla')}
          style={styles.actionCard}
        >
          <Text variant="h3">⏱</Text>
          <Text variant="title" color={Colors.primaryDark} style={{ marginTop: Spacing.xs }}>
            {t('officer.slaMonitorAction')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {t('officer.slaMonitorDesc')}
          </Text>
        </Card>
      </View>

      <Button
        title={t('common.back')}
        variant="ghost"
        onPress={() => router.replace('/')}
        style={styles.backButton}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  jurisdictionBadge: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  title: {
    marginVertical: Spacing.xs,
  },
  metricsCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  statBox: {
    flex: 1,
  },
  sectionHeading: {
    marginBottom: Spacing.sm,
  },
  queueContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  queueCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  queueCardAlert: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
  },
  queueCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  queueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  queueLeft: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  boldText: {
    fontWeight: '700',
  },
  actionsGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    padding: Spacing.md,
  },
  backButton: {
    marginVertical: Spacing.lg,
  },
});
