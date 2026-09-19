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
import { useContractorDashboardQuery } from '../../src/features/contractor';
import { useTranslation } from '../../src/i18n';
import { ProjectEntity } from '../../src/domain/entities';

export default function ContractorDashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    data: dashboard,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useContractorDashboardQuery();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
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
              {t('contractor.dashboard.loading')}
            </Text>
          </View>
        ) : isError ? (
          <ErrorState
            title={t('contractor.errors.dashboardFailed')}
            message={error?.message || t('contractor.errors.generic')}
            onRetry={refetch}
          />
        ) : !dashboard ? (
          <EmptyState
            title={t('contractor.dashboard.emptyTitle')}
            description={t('contractor.dashboard.emptyDescription')}
          />
        ) : (
          <>
            {/* Contractor Profile Card */}
            <Card style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <Badge
                  label={t('contractor.dashboard.portalBadge')}
                  variant="primary"
                  size="sm"
                />
                <Text variant="caption" color={Colors.textMuted}>
                  {dashboard.contractor.contractorId}
                </Text>
              </View>

              <Text variant="h2" color={Colors.textPrimary} style={styles.companyName}>
                {dashboard.contractor.companyName}
              </Text>
              <Text variant="bodyMedium" color={Colors.textSecondary}>
                {t('contractor.profile.contactPerson')}:{' '}
                <Text variant="bodyMedium" style={styles.contactHighlight}>
                  {dashboard.contractor.fullName}
                </Text>
              </Text>
              {dashboard.contractor.jurisdictionState ? (
                <Text variant="caption" color={Colors.textMuted}>
                  {dashboard.contractor.jurisdictionState}
                </Text>
              ) : null}
            </Card>

            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('contractor.dashboard.assignedWorks')}
                </Text>
                <Text variant="h1" color={Colors.primaryDark} style={styles.metricVal}>
                  {dashboard.metrics.assignedProjectsCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('contractor.dashboard.assignedWorks')}
                </Text>
              </Card>

              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('contractor.dashboard.activeWorks')}
                </Text>
                <Text variant="h1" color={Colors.info} style={styles.metricVal}>
                  {dashboard.metrics.activeWorksCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('contractor.dashboard.activeWorks')}
                </Text>
              </Card>

              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('contractor.dashboard.pendingSubmissions')}
                </Text>
                <Text
                  variant="h1"
                  color={
                    dashboard.metrics.pendingSubmissionsCount > 0
                      ? Colors.warning
                      : Colors.success
                  }
                  style={styles.metricVal}
                >
                  {dashboard.metrics.pendingSubmissionsCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('contractor.dashboard.pendingSubmissions')}
                </Text>
              </Card>

              <Card style={styles.metricCard}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('contractor.dashboard.openIssues')}
                </Text>
                <Text
                  variant="h1"
                  color={
                    dashboard.metrics.reportedIssuesCount > 0
                      ? Colors.danger
                      : Colors.textSecondary
                  }
                  style={styles.metricVal}
                >
                  {dashboard.metrics.reportedIssuesCount}
                </Text>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('contractor.dashboard.openIssues')}
                </Text>
              </Card>
            </View>

            {/* Total Contract Value Summary Card */}
            <Card style={styles.valueCard}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('contractor.dashboard.totalContractValue')}
              </Text>
              <Text variant="h2" color={Colors.primary} style={styles.valueText}>
                {formatCurrency(dashboard.metrics.totalContractValueInr)}
              </Text>
            </Card>

            {/* Assigned Projects Header Row */}
            <View style={styles.sectionHeaderRow}>
              <Text variant="title" color={Colors.textPrimary}>
                {t('contractor.dashboard.recentAssignedTitle')}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(contractor)/projects')}
                accessibilityRole="button"
                accessibilityLabel={t('contractor.projects.assignedList')}
              >
                <Text variant="bodySmall" color={Colors.primary} style={styles.boldText}>
                  {t('citizen.viewAll')} →
                </Text>
              </TouchableOpacity>
            </View>

            {/* Assigned Works List */}
            {dashboard.assignedProjects.length === 0 ? (
              <EmptyState
                title={t('contractor.dashboard.emptyTitle')}
                description={t('contractor.dashboard.emptyDescription')}
              />
            ) : (
              dashboard.assignedProjects.map((p: ProjectEntity) => (
                <TouchableOpacity
                  key={p.workId}
                  onPress={() =>
                    router.push(`/(contractor)/projects/${p.workId}` as any)
                  }
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

                    <Text
                      variant="bodyLarge"
                      color={Colors.textPrimary}
                      style={styles.projectTitle}
                    >
                      {p.workTitle}
                    </Text>

                    <View style={styles.projectCardFooter}>
                      <Text variant="caption" color={Colors.textMuted}>
                        {p.workId} • {p.constituency ? `${p.constituency}, ` : ''}{p.state}
                      </Text>
                      <Text
                        variant="bodySmall"
                        color={Colors.primaryDark}
                        style={styles.boldText}
                      >
                        {formatCurrency(p.sanctionedAmountInr)}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
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
  profileCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  companyName: {
    fontWeight: '700',
    marginBottom: 2,
  },
  contactHighlight: {
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
  valueCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  valueText: {
    fontWeight: '800',
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  boldText: {
    fontWeight: '700',
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
