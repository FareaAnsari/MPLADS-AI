import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  Button,
  TextField,
  EmptyState,
  ErrorState,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useOfficerDashboardQuery, useReviewEvidenceMutation } from '../../../src/features/officer/queries';
import { useCitizenEvidenceHistoryQuery } from '../../../src/features/citizen/queries';
import { formatDateIN } from '../../../src/utils/formatters';

export default function OfficerEvidenceReviewScreen() {
  const { projectId: filterProjectId } = useLocalSearchParams<{ projectId?: string }>();
  const { t, isHindi } = useTranslation();

  const [reviewNotesMap, setReviewNotesMap] = useState<Record<string, string>>({});
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);

  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useOfficerDashboardQuery();

  const reviewMutation = useReviewEvidenceMutation();

  const rawQueue = dashboardData?.pendingEvidenceQueue || [];
  const pendingEvidence = filterProjectId
    ? rawQueue.filter((e: any) => e.project_id?.toLowerCase() === (filterProjectId as string).toLowerCase())
    : rawQueue;

  const handleDecision = async (
    evidenceId: string,
    decision: 'ACCEPTED' | 'REJECTED' | 'NEEDS_INFO'
  ) => {
    try {
      setActiveDecisionId(evidenceId);
      const notes = reviewNotesMap[evidenceId] || '';

      await reviewMutation.mutateAsync({
        evidenceId,
        decision,
        reviewNotes: notes.trim() || undefined,
      });

      Alert.alert(
        t('officer.decisionRecorded'),
        `${decision}: ${isHindi ? 'निर्णय वैधानिक लेज़र पर सुरक्षित रूप से दर्ज किया गया।' : 'Decision recorded on statutory ledger.'}`
      );
      refetch();
    } catch (err: any) {
      Alert.alert(t('errors.generic'), err.message || 'Failed to record evidence review');
    } finally {
      setActiveDecisionId(null);
    }
  };

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
            {t('officer.reviewEvidenceAction')}
          </Text>
          <Text variant="body" color={Colors.textSecondary}>
            {t('officer.reviewEvidenceDesc')}
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
        ) : pendingEvidence.length === 0 ? (
          <EmptyState
            title={isHindi ? 'कोई लंबित साक्ष्य नहीं है' : 'No Pending Evidence Awaiting Review'}
            description={
              isHindi
                ? 'आपके अधिकार क्षेत्र में सभी नागरिक साक्ष्य वर्तमान में सत्यापित हैं।'
                : 'All ground evidence submissions in your district jurisdiction have been reviewed.'
            }
          />
        ) : (
          <FlatList
            data={pendingEvidence}
            keyExtractor={(item) => item.evidence_id || String(Math.random())}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const evidenceId = item.evidence_id;
              const isVerified = item.verification_result?.verified ?? false;
              const distanceMeters = item.verification_result?.distance_to_project_meters ?? 0;
              const isPendingCurrent = activeDecisionId === evidenceId && reviewMutation.isPending;

              return (
                <Card style={styles.evidenceCard}>
                  <View style={styles.cardHeader}>
                    <Badge label={evidenceId} variant="secondary" size="sm" />
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

                  {/* Real GPS Coordinates & Photo Preview */}
                  {item.latitude && item.longitude && (
                    <View style={styles.coordsSnippet}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        📍 {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                      </Text>
                      {item.is_live_camera_capture && (
                        <Badge label="Live Camera" variant="info" size="sm" />
                      )}
                    </View>
                  )}

                  <TextField
                    label={t('officer.reviewNotes')}
                    placeholder={t('officer.reviewNotesPlaceholder')}
                    value={reviewNotesMap[evidenceId] || ''}
                    onChangeText={(text) =>
                      setReviewNotesMap((prev) => ({ ...prev, [evidenceId]: text }))
                    }
                    containerStyle={styles.notesInput}
                    accessibilityLabel={t('officer.reviewNotes')}
                  />

                  {/* Operational Decision Buttons */}
                  <View style={styles.decisionGroup}>
                    <Button
                      title={t('officer.acceptEvidence')}
                      variant="primary"
                      size="sm"
                      loading={isPendingCurrent}
                      onPress={() => handleDecision(evidenceId, 'ACCEPTED')}
                      style={styles.decisionBtn}
                    />
                    <Button
                      title={t('officer.requestMoreInfo')}
                      variant="secondary"
                      size="sm"
                      disabled={isPendingCurrent}
                      onPress={() => handleDecision(evidenceId, 'NEEDS_INFO')}
                      style={styles.decisionBtn}
                    />
                    <Button
                      title={t('officer.rejectEvidence')}
                      variant="danger"
                      size="sm"
                      disabled={isPendingCurrent}
                      onPress={() => handleDecision(evidenceId, 'REJECTED')}
                      style={styles.decisionBtn}
                    />
                  </View>
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
  bold: {
    fontWeight: '700',
  },
  notesInput: {
    marginVertical: Spacing.xs,
  },
  decisionGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  decisionBtn: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  coordsSnippet: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xs,
    borderRadius: Radii.sm,
    marginVertical: Spacing.xs,
  },
});
