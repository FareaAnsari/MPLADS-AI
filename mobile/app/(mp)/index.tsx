import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
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
import { useMPDashboardQuery } from '../../src/features/mp';
import { useTranslation } from '../../src/i18n';
import { ProjectEntity } from '../../src/domain/entities';

export default function MPDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMPDashboardQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'success';
    }
  };

  return (
    <Screen style={styles.screen} scrollable={false}>
      <OfflineBanner />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text variant="bodyMedium" color={Colors.textSecondary}>
              {t('mp.dashboard.loading')}
            </Text>
          </View>
        ) : isError ? (
          <ErrorState
            title={t('mp.errors.dashboardFailed')}
            message={error?.message || t('mp.errors.generic')}
            onRetry={refetch}
          />
        ) : !dashboard ? (
          <EmptyState
            title={t('mp.dashboard.emptyTitle')}
            description={t('mp.dashboard.emptyDescription')}
          />
        ) : (
          <>
            {/* Constituency Jurisdiction Header */}
            <Card style={styles.jurisdictionCard}>
              <View style={styles.jurisdictionHeaderRow}>
                <Badge
                  label={t('mp.dashboard.oversightBadge')}
                  variant="primary"
                  size="sm"
                />
                <Text variant="caption" color={Colors.textMuted}>
                  {dashboard.mp.state}
                </Text>
              </View>

              <Text variant="h2" color={Colors.textPrimary} style={styles.mpName}>
                {dashboard.mp.fullName}
              </Text>
              <Text variant="bodyMedium" color={Colors.textSecondary}>
                {t('mp.dashboard.constituencyLabel')}:{' '}
                <Text variant="bodyMedium" style={styles.constituencyHighlight}>
                  {dashboard.mp.constituency}
                </Text>
              </Text>
            </Card>

            {/* High-Level Oversight Metrics Grid */}
            <View style={styles.metricsGrid}>
              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('mp.dashboard.totalProjects')}
                </Text>
                <Text variant="h1" color={Colors.primaryDark} style={styles.metricVal}>
                  {dashboard.metrics.totalConstituencyProjects}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('mp.dashboard.inConstituency')}
                </Text>
              </Card>

              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('mp.dashboard.activeWorks')}
                </Text>
                <Text variant="h1" color={Colors.info} style={styles.metricVal}>
                  {dashboard.metrics.activeCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('mp.dashboard.underImplementation')}
                </Text>
              </Card>

              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('mp.dashboard.completedWorks')}
                </Text>
                <Text variant="h1" color={Colors.success} style={styles.metricVal}>
                  {dashboard.metrics.completedCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('mp.dashboard.verifiedCompleted')}
                </Text>
              </Card>

              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('mp.dashboard.attentionWorks')}
                </Text>
                <Text
                  variant="h1"
                  color={
                    dashboard.metrics.highRiskAttentionCount > 0
                      ? Colors.danger
                      : Colors.textSecondary
                  }
                  style={styles.metricVal}
                >
                  {dashboard.metrics.highRiskAttentionCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('mp.dashboard.requiresReview')}
                </Text>
              </Card>
            </View>

            {/* Financial Oversight Progress */}
            <Card style={styles.financialCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
                {t('mp.financial.title')}
              </Text>

              <View style={styles.financialStatsRow}>
                <View>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {t('mp.financial.sanctioned')}
                  </Text>
                  <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.boldText}>
                    {formatCurrency(dashboard.metrics.totalSanctionedInr)}
                  </Text>
                </View>

                <View style={styles.alignRight}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {t('mp.financial.disbursed')}
                  </Text>
                  <Text variant="bodyLarge" color={Colors.primary} style={styles.boldText}>
                    {formatCurrency(dashboard.metrics.totalDisbursedInr)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, dashboard.metrics.utilizationPercentage)}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.utilizationRow}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('mp.financial.utilizationRate')}
                </Text>
                <Text variant="caption" color={Colors.primaryDark} style={styles.boldText}>
                  {dashboard.metrics.utilizationPercentage}%
                </Text>
              </View>
            </Card>

            {/* Risk Distribution Breakdown */}
            <Card style={styles.riskCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
                {t('mp.risk.constituencyDistribution')}
              </Text>
              <Text variant="caption" color={Colors.textSecondary} style={styles.riskSub}>
                {t('mp.risk.distributionExplanation')}
              </Text>

              <View style={styles.riskPillsRow}>
                <View style={[styles.riskPill, { borderColor: Colors.success }]}>
                  <Text variant="caption" color={Colors.success} style={styles.boldText}>
                    {t('mp.risk.low')}: {dashboard.riskDistribution.low}
                  </Text>
                </View>

                <View style={[styles.riskPill, { borderColor: Colors.warning }]}>
                  <Text variant="caption" color={Colors.warning} style={styles.boldText}>
                    {t('mp.risk.medium')}: {dashboard.riskDistribution.medium}
                  </Text>
                </View>

                <View style={[styles.riskPill, { borderColor: Colors.danger }]}>
                  <Text variant="caption" color={Colors.danger} style={styles.boldText}>
                    {t('mp.risk.high')}: {dashboard.riskDistribution.high}
                  </Text>
                </View>

                <View style={[styles.riskPill, { borderColor: Colors.riskCritical }]}>
                  <Text variant="caption" color={Colors.riskCritical} style={styles.boldText}>
                    {t('mp.risk.critical')}: {dashboard.riskDistribution.critical}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Quick Link to Constituency Projects */}
            <View style={styles.sectionHeaderRow}>
              <Text variant="title" color={Colors.textPrimary}>
                {t('mp.projects.recentWorks')}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(mp)/projects')}
                accessibilityRole="button"
                accessibilityLabel={t('mp.projects.viewAll')}
              >
                <Text variant="bodySmall" color={Colors.primary} style={styles.boldText}>
                  {t('mp.projects.viewAll')} →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Project Cards */}
            {dashboard.recentProjects.map((p: ProjectEntity) => (
              <TouchableOpacity
                key={p.workId}
                onPress={() => router.push(`/(mp)/projects/${p.workId}` as any)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`${p.workTitle}, ${p.currentStage}, ${formatCurrency(
                  p.sanctionedAmountInr
                )}`}
              >
                <Card style={styles.projectCard}>
                  <View style={styles.projectCardHeader}>
                    <Badge label={p.workCategory} variant="neutral" size="sm" />
                    <Badge label={p.currentStage} variant="primary" size="sm" />
                  </View>

                  <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.projectTitle}>
                    {p.workTitle}
                  </Text>

                  <View style={styles.projectCardFooter}>
                    <Text variant="caption" color={Colors.textMuted}>
                      {p.workId}
                    </Text>
                    <Text variant="bodySmall" color={Colors.primaryDark} style={styles.boldText}>
                      {formatCurrency(p.sanctionedAmountInr)}
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jurisdictionCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  jurisdictionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  mpName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  constituencyHighlight: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  metricVal: {
    marginVertical: 4,
    fontWeight: '800',
  },
  financialCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  financialStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  boldText: {
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginVertical: Spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.full,
  },
  utilizationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  riskCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  riskSub: {
    marginBottom: Spacing.sm,
  },
  riskPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  riskPill: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  projectCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    fontWeight: '600',
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
});
