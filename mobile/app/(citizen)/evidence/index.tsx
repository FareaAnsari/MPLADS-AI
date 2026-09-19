import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  Button,
  EmptyState,
  ErrorState,
} from '../../../src/ui/components';
import { Colors, Spacing } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useCitizenEvidenceHistoryQuery } from '../../../src/features/citizen/queries';
import { formatDateIN } from '../../../src/utils/formatters';

export default function CitizenEvidenceHubScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useCitizenEvidenceHistoryQuery();

  const evidenceList = data?.evidence || [];

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
            {t('citizen.evidenceHub')}
          </Text>
          <Text variant="body" color={Colors.textSecondary}>
            {t('citizen.evidenceHubDesc')}
          </Text>
        </View>

        <Button
          title={`+ ${t('evidence.submitEvidence')}`}
          variant="primary"
          onPress={() => router.push('/(citizen)/evidence/submit')}
          style={styles.newSubmissionButton}
          accessibilityLabel={t('evidence.submitEvidence')}
          accessibilityHint="Opens new geotagged evidence submission form"
        />

        <View style={styles.sectionHeader}>
          <Text variant="title">
            {t('citizen.submissionsCount')} ({evidenceList.length})
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <Text variant="body" color={Colors.textSecondary}>
              {t('common.loading')}
            </Text>
          </View>
        ) : error ? (
          <ErrorState
            title={t('errors.network')}
            onRetry={refetch}
          />
        ) : evidenceList.length === 0 ? (
          <EmptyState
            title={t('citizen.noEvidenceRecords')}
            description={t('citizen.noEvidenceRecordsDesc')}
            actionLabel={t('evidence.submitEvidence')}
            onAction={() => router.push('/(citizen)/evidence/submit')}
          />
        ) : (
          <FlatList
            data={evidenceList}
            keyExtractor={(item) => item.evidence_id || item.id || String(Math.random())}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isVerified = item.verification_result?.verified ?? false;
              const distanceMeters = item.verification_result?.distance_to_project_meters ?? 0;
              const status = item.verification_result?.signal_code || 'PENDING';

              return (
                <Card style={styles.evidenceCard}>
                  <View style={styles.cardHeader}>
                    <Badge
                      label={item.evidence_id || 'Evidence Record'}
                      variant="secondary"
                      size="sm"
                    />
                    <Badge
                      label={isVerified ? t('evidence.verifiedMatch') : t('evidence.locationInconsistent')}
                      variant={isVerified ? 'success' : 'danger'}
                      size="sm"
                    />
                  </View>

                  <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.projectRef}>
                    {t('projects.workId')}: {item.project_id}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text variant="caption" color={Colors.textMuted}>
                      {t('citizen.distanceToSite')}: <Text variant="caption" style={styles.bold}>{Math.round(distanceMeters)}m</Text>
                    </Text>
                    <Text variant="caption" color={Colors.textMuted}>
                      {item.timestamp_captured ? formatDateIN(item.timestamp_captured) : '—'}
                    </Text>
                  </View>

                  {item.is_live_camera_capture !== undefined && (
                    <Text variant="caption" color={Colors.textSecondary} style={styles.cameraTag}>
                      {item.is_live_camera_capture
                        ? `✓ ${t('citizen.liveCameraLabel')}`
                        : '⚠ File Upload'}
                    </Text>
                  )}
                </Card>
              );
            }}
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
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  newSubmissionButton: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  listContent: {
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  evidenceCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  projectRef: {
    fontWeight: '600',
    marginVertical: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  cameraTag: {
    marginTop: Spacing.xs,
  },
  bold: {
    fontWeight: '700',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
