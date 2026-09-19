import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Card, Badge, ErrorState } from '../../src/ui/components';
import { Colors, Spacing, Radii } from '../../src/ui/theme';
import { useTranslation } from '../../src/i18n';
import { useAuthStore } from '../../src/store/authStore';
import { useDatasetSummaryQuery, useProjectsQuery } from '../../src/features/projects/queries';
import { formatINR, formatNumberIN } from '../../src/utils/formatters';

export default function CitizenHomeScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const { user } = useAuthStore();

  const {
    data: summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useDatasetSummaryQuery();

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    refetch: refetchProjects,
  } = useProjectsQuery({ limit: 3 });

  const onRefresh = () => {
    refetchSummary();
    refetchProjects();
  };

  const isRefreshing = isSummaryLoading || isProjectsLoading;

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Badge
          label={t('common.ministry')}
          variant="primary"
          size="sm"
          style={styles.badge}
        />
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {user?.name ? `${t('citizen.welcome')}, ${user.name}` : t('citizen.welcome')}
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          {t('citizen.dashboardSubtitle')}
        </Text>
      </View>

      {/* National / Area Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text variant="title" color={Colors.textPrimary}>
            {t('citizen.nationalOverview')}
          </Text>
          <Badge label={t('common.online')} variant="success" size="sm" />
        </View>

        {summaryError ? (
          <ErrorState
            title={t('errors.network')}
            onRetry={refetchSummary}
          />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('citizen.totalWorks')}
              </Text>
              <Text variant="h2" color={Colors.primary}>
                {summary ? formatNumberIN(summary.totalWorksIndexed) : '—'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('citizen.totalSanctioned')}
              </Text>
              <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.boldText}>
                {summary ? formatINR(summary.totalSanctionedInr, true) : '—'}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('citizen.totalDisbursed')}
              </Text>
              <Text variant="bodyLarge" color={Colors.secondaryDark} style={styles.boldText}>
                {summary ? formatINR(summary.totalDisbursedInr, true) : '—'}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Action Gateway Cards */}
      <Text variant="title" style={styles.sectionHeading}>
        {isHindi ? 'नागरिक क्रियाएं' : 'Citizen Actions'}
      </Text>

      <View style={styles.actionCardsGroup}>
        <Card
          interactive
          onPress={() => router.push('/(citizen)/projects')}
          style={styles.actionCard}
          accessibilityLabel={t('citizen.exploreProjects')}
          accessibilityHint={t('citizen.exploreProjectsDesc')}
        >
          <View style={styles.actionCardRow}>
            <View style={styles.iconCircle}>
              <Text variant="h3">🏛</Text>
            </View>
            <View style={styles.actionCardContent}>
              <Text variant="title" color={Colors.primaryDark}>
                {t('citizen.exploreProjects')}
              </Text>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.exploreProjectsDesc')}
              </Text>
            </View>
          </View>
        </Card>

        <Card
          interactive
          onPress={() => router.push('/(citizen)/evidence')}
          style={styles.actionCard}
          accessibilityLabel={t('citizen.evidenceHub')}
          accessibilityHint={t('citizen.evidenceHubDesc')}
        >
          <View style={styles.actionCardRow}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.riskLowBg }]}>
              <Text variant="h3">📷</Text>
            </View>
            <View style={styles.actionCardContent}>
              <Text variant="title" color={Colors.primaryDark}>
                {t('citizen.evidenceHub')}
              </Text>
              <Text variant="bodySmall" color={Colors.textSecondary}>
                {t('citizen.evidenceHubDesc')}
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Recent Monitored Projects Section */}
      <View style={styles.recentSectionHeader}>
        <Text variant="title" style={styles.sectionHeading}>
          {t('citizen.recentProjects')}
        </Text>
        <Button
          title={t('citizen.viewAll')}
          variant="ghost"
          size="sm"
          onPress={() => router.push('/(citizen)/projects')}
        />
      </View>

      {projectsData?.projects && projectsData.projects.length > 0 ? (
        <View style={styles.projectsList}>
          {projectsData.projects.map((proj) => (
            <Card
              key={proj.workId}
              interactive
              onPress={() => router.push(`/(citizen)/projects/${proj.workId}` as any)}
              style={styles.projectCard}
              accessibilityLabel={`${proj.workTitle}, ${proj.workId}`}
            >
              <View style={styles.projectHeaderRow}>
                <Badge label={proj.workCategory} variant="secondary" size="sm" />
                <Badge label={proj.currentStage} variant="primary" size="sm" />
              </View>

              <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.projectTitle}>
                {proj.workTitle}
              </Text>

              <Text variant="caption" color={Colors.textMuted}>
                {t('projects.workId')}: {proj.workId} · {proj.state}
              </Text>

              <View style={styles.projectFooterRow}>
                <Text variant="bodySmall" color={Colors.textSecondary}>
                  {t('citizen.sanctioned')}: <Text variant="bodySmall" style={styles.boldText}>{formatINR(proj.sanctionedAmountInr)}</Text>
                </Text>
                <Text variant="bodySmall" color={Colors.primaryDark}>
                  {t('common.next')} →
                </Text>
              </View>
            </Card>
          ))}
        </View>
      ) : null}

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
  badge: {
    marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },
  title: {
    marginVertical: Spacing.xs,
  },
  summaryCard: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.surface,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statItem: {
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  sectionHeading: {
    marginBottom: Spacing.sm,
  },
  actionCardsGroup: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  actionCard: {
    padding: Spacing.md,
  },
  actionCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardContent: {
    flex: 1,
  },
  recentSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  projectsList: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  projectCard: {
    padding: Spacing.md,
  },
  projectHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  projectTitle: {
    fontWeight: '600',
    marginVertical: Spacing.xs,
  },
  projectFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backButton: {
    marginVertical: Spacing.lg,
  },
});
