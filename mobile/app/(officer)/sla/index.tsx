import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
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
import { useSLABottleneckQuery } from '../../../src/features/intelligence/queries';
import { useOfficerProjectsQuery } from '../../../src/features/officer/queries';

export default function OfficerSLAMonitorScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();

  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useOfficerProjectsQuery({ limit: 10 });

  const { data: heroSla } = useSLABottleneckQuery('WRK-2024-001');

  const projects = projectsData?.projects || [];

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {t('officer.slaMonitorAction')}
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          {t('officer.slaMonitorDesc')}
        </Text>
      </View>

      {/* SLA Overview Hero Card */}
      {heroSla && (
        <Card style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <Text variant="title">
              {isHindi ? 'नोडल चरण समय-सीमा स्थिति' : 'Milestone Bottleneck Assessment'}
            </Text>
            <Badge
              label={heroSla.isBottleneck ? 'Bottleneck Detected' : 'Within Benchmark'}
              variant={heroSla.isBottleneck ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text variant="caption" color={Colors.textMuted}>
                {t('officer.slaAgingDays')}
              </Text>
              <Text variant="h2" color={Colors.primaryDark}>
                {Math.round(heroSla.daysInCurrentStage)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text variant="caption" color={Colors.textMuted}>
                {t('officer.expectedBenchmark')}
              </Text>
              <Text variant="h2" color={Colors.textSecondary}>
                {Math.round(heroSla.expectedBenchmarkDays)}
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text variant="caption" color={Colors.textMuted}>
                {t('officer.delayRatio')}
              </Text>
              <Text variant="h2" color={heroSla.isBottleneck ? Colors.warning : Colors.success}>
                {heroSla.delayRatio.toFixed(2)}x
              </Text>
            </View>
          </View>

          <Text variant="caption" color={Colors.textSecondary} style={{ marginTop: Spacing.xs }}>
            {isHindi ? 'जिम्मेदार प्राधिकारी' : 'Responsible Authority'}: <Text variant="caption" style={styles.bold}>{heroSla.responsibleRole}</Text>
          </Text>
        </Card>
      )}

      {/* Projects Milestone Aging List */}
      <Text variant="title" style={styles.sectionHeading}>
        {isHindi ? 'जिला परियोजना चरण स्थिति' : 'District Project Milestone Aging'}
      </Text>

      {isLoading ? (
        <Text variant="bodySmall" color={Colors.textSecondary}>
          {t('common.loading')}
        </Text>
      ) : error ? (
        <ErrorState
          title={t('errors.network')}
          onRetry={refetch}
        />
      ) : projects.length > 0 ? (
        <View style={styles.projectsList}>
          {projects.map((proj) => {
            const isDelayed = proj.currentStage.includes('PROPOSAL') || proj.currentStage.includes('SANCTION');
            return (
              <Card
                key={proj.workId}
                interactive
                onPress={() => router.push(`/(officer)/projects/${proj.workId}` as any)}
                style={styles.projectCard}
              >
                <View style={styles.cardHeader}>
                  <Badge label={proj.workId} variant="secondary" size="sm" />
                  <Badge
                    label={isDelayed ? 'Review Milestone' : 'On Track'}
                    variant={isDelayed ? 'warning' : 'success'}
                    size="sm"
                  />
                </View>

                <Text variant="bodyLarge" style={styles.workTitle}>
                  {proj.workTitle}
                </Text>

                <Text variant="caption" color={Colors.textSecondary}>
                  {t('projects.stage')}: <Text variant="caption" style={styles.bold}>{proj.currentStage.replace(/_/g, ' ')}</Text>
                </Text>

                <View style={styles.footerRow}>
                  <Text variant="caption" color={Colors.textMuted}>
                    {proj.idaOffice || 'District Planning Cell'}
                  </Text>
                  <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
                    {t('common.next')} →
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      ) : null}

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
  title: {
    marginVertical: Spacing.xs,
  },
  heroCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  metricItem: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
  },
  sectionHeading: {
    marginBottom: Spacing.sm,
  },
  projectsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  backBtn: {
    marginVertical: Spacing.lg,
  },
});
