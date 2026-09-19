import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  EmptyState,
  ErrorState,
  Button,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useSystemRiskOverviewQuery, useRiskProjectsQuery } from '../../../src/features/intelligence/queries';
import { formatRiskScore, formatNumberIN } from '../../../src/utils/formatters';
import { RiskAssessmentEntity } from '../../../src/domain/entities';

const RISK_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'COST_ANOMALY'];

export default function OfficerRiskDashboardScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();

  const [activeFilter, setActiveFilter] = useState('ALL');

  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useSystemRiskOverviewQuery();

  const minRiskScore = activeFilter === 'CRITICAL' ? 90 : activeFilter === 'HIGH' ? 70 : undefined;
  const anomalyFlag = activeFilter === 'COST_ANOMALY' ? 'HIGH_RISK_COST_DEVIATION' : undefined;

  const {
    data: riskProjectsData,
    isLoading: isProjectsLoading,
    error: projectsError,
    refetch: refetchProjects,
    isRefetching,
  } = useRiskProjectsQuery({
    minRiskScore,
    anomalyFlag,
    limit: 50,
  });

  const projects = riskProjectsData?.projects || [];
  const riskDist = overviewData?.riskDistribution || {
    highRiskCount: 0,
    reviewRequiredCount: 0,
    normalCount: 0,
  };

  const renderRiskProjectItem = ({ item }: { item: RiskAssessmentEntity }) => {
    const riskInfo = formatRiskScore(item.riskScore, isHindi);

    return (
      <Card
        interactive
        onPress={() => router.push(`/(officer)/risk/${item.workId}` as any)}
        style={styles.projectCard}
        accessibilityRole="button"
        accessibilityLabel={`${item.workId}, ${riskInfo.label}, Score: ${item.riskScore}`}
      >
        <View style={styles.cardHeader}>
          <Badge label={item.workId} variant="secondary" size="sm" />
          <Badge
            label={`${riskInfo.label} (${item.riskScore}/100)`}
            variant={riskInfo.variant}
            size="sm"
          />
        </View>

        <Text variant="bodyLarge" style={styles.workTitle}>
          {item.workId} · {item.anomalyFlag.replace(/_/g, ' ')}
        </Text>

        {item.topContributingFactor && (
          <Text variant="caption" color={Colors.textSecondary} style={{ marginVertical: Spacing.xs }}>
            {t('risk.topContributingFactor')}: <Text variant="caption" style={styles.bold}>{item.topContributingFactor}</Text>
          </Text>
        )}

        <View style={styles.cardFooter}>
          <Text variant="caption" color={Colors.textMuted}>
            {t('risk.systemSignalOnly')}
          </Text>
          <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
            {t('common.next')} →
          </Text>
        </View>
      </Card>
    );
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        {/* Header & Subtitle */}
        <View style={styles.header}>
          <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
            {t('risk.title')}
          </Text>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {t('risk.dashboardSubtitle')}
          </Text>
        </View>

        {/* Fairness Safeguard Banner */}
        <View style={styles.fairnessBanner}>
          <Text variant="caption" color={Colors.primaryDark} style={styles.bold}>
            ⚖ {t('risk.fairnessNotice')}
          </Text>
        </View>

        {/* Risk Distribution Grid */}
        <Card style={styles.distributionCard}>
          <Text variant="title" style={styles.distHeading}>
            {isHindi ? 'राष्ट्रीय एवं जिला जोखिम वितरण' : 'Risk Distribution Overview'}
          </Text>

          <View style={styles.distGrid}>
            <View style={styles.distBox}>
              <Text variant="caption" color={Colors.danger} style={styles.bold}>
                {t('risk.highRisk')}
              </Text>
              <Text variant="h2" color={Colors.danger}>
                {formatNumberIN(riskDist.highRiskCount)}
              </Text>
            </View>

            <View style={styles.distBox}>
              <Text variant="caption" color={Colors.warning} style={styles.bold}>
                {t('risk.mediumRisk')}
              </Text>
              <Text variant="h2" color={Colors.warning}>
                {formatNumberIN(riskDist.reviewRequiredCount)}
              </Text>
            </View>

            <View style={styles.distBox}>
              <Text variant="caption" color={Colors.success} style={styles.bold}>
                {t('risk.lowRisk')}
              </Text>
              <Text variant="h2" color={Colors.success}>
                {formatNumberIN(riskDist.normalCount)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {RISK_FILTERS.map((f) => {
            const isSelected = activeFilter === f;
            const label =
              f === 'ALL'
                ? t('risk.allAssessedProjects')
                : f === 'CRITICAL'
                ? t('risk.filterCritical')
                : f === 'HIGH'
                ? t('risk.filterHigh')
                : t('risk.filterCostAnomaly');

            return (
              <TouchableOpacity
                key={f}
                style={[styles.pill, isSelected && styles.pillSelected]}
                onPress={() => setActiveFilter(f)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  variant="caption"
                  color={isSelected ? Colors.surface : Colors.textPrimary}
                  style={isSelected ? styles.bold : undefined}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Risk Projects List */}
        {isProjectsLoading ? (
          <View style={styles.centerBox}>
            <Text variant="body" color={Colors.textSecondary}>
              {t('common.loading')}
            </Text>
          </View>
        ) : projectsError ? (
          <ErrorState
            title={t('errors.network')}
            onRetry={refetchProjects}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title={t('projects.noProjectsFound')}
            description={t('projects.noProjectsDesc')}
            actionLabel={t('citizen.resetFilters')}
            onAction={() => setActiveFilter('ALL')}
          />
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.workId}
            renderItem={renderRiskProjectItem}
            contentContainerStyle={styles.listContent}
            onRefresh={refetchProjects}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xs,
  },
  title: {
    marginBottom: 2,
  },
  fairnessBanner: {
    padding: Spacing.xs,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.sm,
  },
  distributionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  distHeading: {
    marginBottom: Spacing.xs,
  },
  distGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distBox: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  listContent: {
    gap: Spacing.sm,
    paddingBottom: Spacing['2xl'],
  },
  projectCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  workTitle: {
    fontWeight: '600',
    marginVertical: Spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
