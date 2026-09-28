import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  Button,
  ErrorState,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useProjectDetailQuery } from '../../../src/features/projects/queries';
import { useProjectRiskQuery, useSLABottleneckQuery } from '../../../src/features/intelligence/queries';
import { formatINR, formatPercentage, formatRiskScore } from '../../../src/utils/formatters';

export default function OfficerProjectDetailScreen() {
  const router = useRouter();
  const { id, projectId } = useLocalSearchParams<{ id?: string | string[]; projectId?: string }>();
  const { t, isHindi } = useTranslation();

  const rawId = projectId || (Array.isArray(id) ? id.join('/') : (id || ''));
  const workId = decodeURIComponent(rawId);

  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useProjectDetailQuery(workId || '');

  const {
    data: riskData,
    isLoading: isRiskLoading,
  } = useProjectRiskQuery(workId || '');

  const {
    data: slaData,
    isLoading: isSlaLoading,
  } = useSLABottleneckQuery(workId || '');

  if (isProjectLoading) {
    return (
      <Screen>
        <View style={styles.centerBox}>
          <Text variant="body" color={Colors.textSecondary}>
            {t('common.loading')}
          </Text>
        </View>
      </Screen>
    );
  }

  if (projectError || !project) {
    return (
      <Screen>
        <ErrorState
          title={t('errors.notFound')}
          message={projectError?.message || t('projects.noProjectsDesc')}
          onRetry={refetchProject}
        />
      </Screen>
    );
  }

  const riskAssessment = riskData?.riskScore !== undefined
    ? formatRiskScore(riskData.riskScore, isHindi)
    : null;

  const expenditureRatio = project.sanctionedAmountInr > 0
    ? (project.disbursedAmountInr / project.sanctionedAmountInr) * 100
    : 0;

  const scoreBreakdown = riskData?.scoreBreakdown || {
    costAnomalyScore: 0,
    timeDelayScore: 0,
    duplicateRiskScore: 0,
    clusterDensityScore: 0,
  };

  return (
    <Screen scrollable>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Badge label={project.workCategory} variant="secondary" size="md" />
          <Badge
            label={project.currentStage.replace(/_/g, ' ')}
            variant={project.currentStage.includes('COMPLETION') ? 'success' : 'primary'}
            size="md"
          />
        </View>

        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {project.workTitle}
        </Text>

        <Text variant="caption" color={Colors.textMuted}>
          {t('projects.workId')}: {project.workId} · {project.state} ({project.constituency || 'District Nodal Cell'})
        </Text>
      </View>

      {/* Financial Breakdown Card */}
      <Card style={styles.sectionCard}>
        <Text variant="title" style={styles.cardHeading}>
          {t('citizen.financialOverview')}
        </Text>

        <View style={styles.financialRow}>
          <View style={styles.col}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('projects.sanctionedAmount')}
            </Text>
            <Text variant="bodyLarge" color={Colors.primaryDark} style={styles.bold}>
              {formatINR(project.sanctionedAmountInr)}
            </Text>
          </View>

          <View style={styles.col}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('projects.disbursedAmount')}
            </Text>
            <Text variant="bodyLarge" color={Colors.secondaryDark} style={styles.bold}>
              {formatINR(project.disbursedAmountInr)}
            </Text>
          </View>
        </View>

        <View style={styles.progressBox}>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'संवितरण अनुपात' : 'Disbursement Ratio'}: {formatPercentage(expenditureRatio)}
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, expenditureRatio))}%` },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* AI Statutory Risk Intelligence Section */}
      <Card style={styles.sectionCard}>
        <View style={styles.riskHeader}>
          <Text variant="title" style={styles.cardHeading}>
            {t('risk.title')}
          </Text>
          {riskAssessment && (
            <Badge
              label={`${riskAssessment.label} (${riskAssessment.score}/100)`}
              variant={riskAssessment.variant}
              size="sm"
            />
          )}
        </View>

        <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
          {t('officer.riskDrivers')}
        </Text>

        <View style={styles.signalsGrid}>
          <View style={styles.signalItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.outlierDeviation')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {Math.round(scoreBreakdown.costAnomalyScore)}/100
            </Text>
          </View>

          <View style={styles.signalItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.timelineDelay')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {Math.round(scoreBreakdown.timeDelayScore)}/100
            </Text>
          </View>

          <View style={styles.signalItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.duplicatePhotoRisk')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {Math.round(scoreBreakdown.duplicateRiskScore)}/100
            </Text>
          </View>

          <View style={styles.signalItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.geographicClustering')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {Math.round(scoreBreakdown.clusterDensityScore)}/100
            </Text>
          </View>
        </View>

        {riskData?.primaryRiskReason && (
          <View style={styles.riskReasonBox}>
            <Text variant="caption" color={Colors.danger} style={styles.bold}>
              {isHindi ? 'पहचाना गया जोखिम विचलन' : 'Identified Deviation Factor'}:
            </Text>
            <Text variant="caption" color={Colors.textPrimary}>
              {riskData.primaryRiskReason}
            </Text>
          </View>
        )}
      </Card>

      {/* SLA Workflow Status Card */}
      {slaData && (
        <Card style={styles.sectionCard}>
          <View style={styles.slaHeader}>
            <Text variant="title" style={styles.cardHeading}>
              {t('officer.slaMonitorAction')}
            </Text>
            <Badge
              label={slaData.isBottleneck ? 'SLA Bottleneck' : 'Within Benchmark'}
              variant={slaData.isBottleneck ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.slaMetricsRow}>
            <View style={styles.col}>
              <Text variant="caption" color={Colors.textMuted}>
                {t('officer.slaAgingDays')}
              </Text>
              <Text variant="bodyLarge" style={styles.bold}>
                {Math.round(slaData.daysInCurrentStage)} days
              </Text>
            </View>

            <View style={styles.col}>
              <Text variant="caption" color={Colors.textMuted}>
                {t('officer.expectedBenchmark')}
              </Text>
              <Text variant="bodyLarge" style={styles.bold}>
                {Math.round(slaData.expectedBenchmarkDays)} days
              </Text>
            </View>

            <View style={styles.col}>
              <Text variant="caption" color={Colors.textMuted}>
                {t('officer.delayRatio')}
              </Text>
              <Text variant="bodyLarge" color={slaData.isBottleneck ? Colors.warning : Colors.success} style={styles.bold}>
                {slaData.delayRatio.toFixed(2)}x
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Operational Actions Card */}
      <Card style={styles.actionsCard}>
        <Text variant="title" color={Colors.primaryDark} style={{ marginBottom: Spacing.sm }}>
          {isHindi ? 'अधिकारी कार्य निष्पादन' : 'Officer Operational Actions'}
        </Text>

        <Button
          title={t('officer.inspectionUpdateTitle')}
          variant="primary"
          onPress={() =>
            router.push({
              pathname: '/(officer)/inspections',
              params: { workId: project.workId },
            })
          }
          style={styles.actionBtn}
          accessibilityLabel={t('officer.inspectionUpdateTitle')}
        />

        <Button
          title={t('officer.reviewEvidenceAction')}
          variant="outline"
          onPress={() =>
            router.push({
              pathname: '/(officer)/evidence',
              params: { projectId: project.workId },
            })
          }
          style={styles.actionBtn}
          accessibilityLabel={t('officer.reviewEvidenceAction')}
        />
      </Card>

      <Button
        title={t('common.back')}
        variant="ghost"
        onPress={() => router.back()}
        style={styles.backBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  title: {
    marginVertical: Spacing.xs,
  },
  sectionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeading: {
    marginBottom: Spacing.xs,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  col: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  progressBox: {
    marginTop: Spacing.xs,
  },
  progressBarBg: {
    height: 8,
    borderRadius: Radii.sm,
    backgroundColor: Colors.borderLight,
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  signalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  signalItem: {
    width: '47%',
    padding: Spacing.xs,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.sm,
  },
  riskReasonBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.riskHighBg,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  slaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  slaMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  actionsCard: {
    padding: Spacing.md,
    backgroundColor: Colors.borderLight,
    borderColor: Colors.borderDark,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    marginBottom: Spacing.xs,
  },
  backBtn: {
    marginVertical: Spacing.lg,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
