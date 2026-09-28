import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  EmptyState,
  ErrorState,
  OfflineBanner,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useMPProjectDetailQuery } from '../../../src/features/mp';
import { useTranslation } from '../../../src/i18n';
import { MPMilestoneEntity } from '../../../src/domain/entities';

export default function MPProjectDetailScreen() {
  const { id, projectId } = useLocalSearchParams<{ id?: string | string[]; projectId?: string }>();
  const { t } = useTranslation();

  const rawId = projectId || (Array.isArray(id) ? id.join('/') : (id || ''));
  const workId = decodeURIComponent(rawId);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useMPProjectDetailQuery(workId);

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
              {t('mp.project.loading')}
            </Text>
          </View>
        ) : isError ? (
          <ErrorState
            title={t('mp.errors.projectDetailFailed')}
            message={error?.message || t('mp.errors.generic')}
            onRetry={refetch}
          />
        ) : !data ? (
          <EmptyState
            title={t('mp.project.notFoundTitle')}
            description={t('mp.project.notFoundDesc')}
          />
        ) : (
          <>
            {/* Project Header Overview */}
            <Card style={styles.headerCard}>
              <View style={styles.headerRow}>
                <Badge label={data.project.workCategory} variant="neutral" size="sm" />
                <Badge label={data.project.currentStage} variant="primary" size="sm" />
              </View>

              <Text variant="h2" color={Colors.textPrimary} style={styles.projectTitle}>
                {data.project.workTitle}
              </Text>

              {data.project.workDescription ? (
                <Text variant="bodySmall" color={Colors.textSecondary} style={styles.description}>
                  {data.project.workDescription}
                </Text>
              ) : null}

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text variant="caption" color={Colors.textMuted}>
                    {t('projects.workId')}
                  </Text>
                  <Text variant="bodySmall" color={Colors.textPrimary} style={styles.boldText}>
                    {data.project.workId}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Text variant="caption" color={Colors.textMuted}>
                    {t('mp.dashboard.constituencyLabel')}
                  </Text>
                  <Text variant="bodySmall" color={Colors.textPrimary} style={styles.boldText}>
                    {data.project.constituency || 'General'}
                  </Text>
                </View>

                <View style={styles.metaItem}>
                  <Text variant="caption" color={Colors.textMuted}>
                    {t('projects.state')}
                  </Text>
                  <Text variant="bodySmall" color={Colors.textPrimary} style={styles.boldText}>
                    {data.project.state}
                  </Text>
                </View>

                {data.project.idaOffice ? (
                  <View style={styles.metaItem}>
                    <Text variant="caption" color={Colors.textMuted}>
                      {t('mp.project.idaOffice')}
                    </Text>
                    <Text variant="bodySmall" color={Colors.textPrimary} style={styles.boldText}>
                      {data.project.idaOffice}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>

            {/* Financial Oversight Summary */}
            <Card style={styles.financialCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
                {t('mp.financial.title')}
              </Text>

              <View style={styles.financialGrid}>
                <View style={styles.financialCol}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {t('mp.financial.sanctioned')}
                  </Text>
                  <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.boldText}>
                    {formatCurrency(data.financials.sanctionedAmountInr)}
                  </Text>
                </View>

                <View style={styles.financialCol}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {t('mp.financial.disbursed')}
                  </Text>
                  <Text variant="bodyLarge" color={Colors.primary} style={styles.boldText}>
                    {formatCurrency(data.financials.disbursedAmountInr)}
                  </Text>
                </View>

                <View style={styles.financialCol}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {t('mp.financial.expenditure')}
                  </Text>
                  <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.boldText}>
                    {formatCurrency(data.financials.expenditureInr)}
                  </Text>
                </View>

                <View style={styles.financialCol}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {t('mp.financial.balance')}
                  </Text>
                  <Text variant="bodyLarge" color={Colors.textSecondary} style={styles.boldText}>
                    {formatCurrency(data.financials.remainingBalanceInr)}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, data.financials.utilizationPercentage)}%`,
                    },
                  ]}
                />
              </View>

              <View style={styles.utilizationRow}>
                <Text variant="caption" color={Colors.textSecondary}>
                  {t('mp.financial.utilizationRate')}
                </Text>
                <Text variant="caption" color={Colors.primaryDark} style={styles.boldText}>
                  {data.financials.utilizationPercentage}%
                </Text>
              </View>
            </Card>

            {/* Workflow Milestones Progress Timeline */}
            <Card style={styles.milestonesCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
                {t('mp.progress.milestonesTitle')}
              </Text>

              <View style={styles.timelineContainer}>
                {data.milestones.map((m: MPMilestoneEntity, idx: number) => {
                  return (
                    <View key={m.stageId} style={styles.timelineStep}>
                      <View style={styles.timelineIndicatorCol}>
                        <View
                          style={[
                            styles.timelineDot,
                            m.isCompleted && styles.dotCompleted,
                            m.isCurrent && styles.dotCurrent,
                          ]}
                        >
                          <Text style={styles.dotIcon}>
                            {m.isCompleted ? '✓' : m.isCurrent ? '•' : '○'}
                          </Text>
                        </View>
                        {idx < data.milestones.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              m.isCompleted && styles.lineCompleted,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.timelineContentCol}>
                        <View style={styles.milestoneHeader}>
                          <Text
                            variant="bodyMedium"
                            color={m.isCompleted || m.isCurrent ? Colors.textPrimary : Colors.textMuted}
                            style={m.isCurrent ? styles.boldText : undefined}
                          >
                            {m.stageName}
                          </Text>
                          <Badge
                            label={m.status}
                            variant={
                              m.isCompleted
                                ? 'success'
                                : m.isCurrent
                                ? 'primary'
                                : 'neutral'
                            }
                            size="sm"
                          />
                        </View>

                        <Text variant="caption" color={Colors.textMuted}>
                          {t('mp.progress.benchmark')}: {m.benchmarkDays}{' '}
                          {t('mp.progress.days')}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* High-Level Authorized Risk Oversight */}
            <Card style={styles.riskCard}>
              <View style={styles.riskCardHeader}>
                <Text variant="title" color={Colors.textPrimary}>
                  {t('mp.risk.title')}
                </Text>
                <Badge
                  label={`${t('mp.risk.level')}: ${data.riskOversight.riskLevel}`}
                  variant={getRiskBadgeVariant(data.riskOversight.riskLevel) as any}
                  size="sm"
                />
              </View>

              <Text variant="bodySmall" color={Colors.textSecondary} style={styles.riskSignal}>
                {data.riskOversight.primaryRiskSignal || t('mp.risk.normalSignal')}
              </Text>

              {data.riskOversight.attentionRequired ? (
                <View style={styles.attentionBanner}>
                  <Text variant="caption" color={Colors.danger} style={styles.boldText}>
                    ⚠️ {t('mp.risk.attentionRequiredNotice')}
                  </Text>
                </View>
              ) : null}
            </Card>

            {/* Public Verified Evidence Summary */}
            <Card style={styles.evidenceCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionTitle}>
                {t('mp.project.publicEvidenceTitle')}
              </Text>

              {data.publicEvidence.length === 0 ? (
                <Text variant="bodySmall" color={Colors.textMuted}>
                  {t('mp.project.noEvidenceRecords')}
                </Text>
              ) : (
                data.publicEvidence.map((ev, i) => (
                  <View key={ev.evidence_id || i} style={styles.evidenceRow}>
                    <Text variant="bodySmall" color={Colors.textPrimary} style={styles.boldText}>
                      📷 {ev.evidence_id}
                    </Text>
                    <Badge
                      label={ev.verification_status || 'VERIFIED'}
                      variant="success"
                      size="sm"
                    />
                  </View>
                ))
              )}
            </Card>
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
  headerCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    fontWeight: '700',
    marginTop: 2,
  },
  description: {
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  metaItem: {
    minWidth: '45%',
  },
  boldText: {
    fontWeight: '700',
  },
  financialCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  financialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  financialCol: {
    minWidth: '45%',
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
  milestonesCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
  },
  timelineContainer: {
    paddingLeft: Spacing.xs,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    marginRight: Spacing.sm,
    width: 24,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotCurrent: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dotIcon: {
    fontSize: 10,
    color: Colors.textInverse,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: Colors.success,
  },
  timelineContentCol: {
    flex: 1,
    paddingBottom: Spacing.xs,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  riskCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  riskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskSignal: {
    lineHeight: 18,
    marginTop: 2,
  },
  attentionBanner: {
    backgroundColor: Colors.riskHighBg,
    padding: Spacing.xs,
    borderRadius: Radii.sm,
    marginTop: Spacing.xs,
  },
  evidenceCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
});
