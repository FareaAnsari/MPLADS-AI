import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  Button,
  TextField,
  ErrorState,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useOptimizedInspectionsQuery } from '../../../src/features/intelligence/queries';
import { useUpdateInspectionMutation } from '../../../src/features/officer/queries';
import { formatINR } from '../../../src/utils/formatters';

const STATUS_OPTIONS = ['COMPLETED', 'IN_PROGRESS', 'ANOMALY_FOUND'];

export default function OfficerInspectionsScreen() {
  const router = useRouter();
  const { workId: initialWorkId } = useLocalSearchParams<{ workId?: string }>();
  const { t, isHindi } = useTranslation();

  const [workId, setWorkId] = useState<string>(
    (Array.isArray(initialWorkId) ? initialWorkId[0] : initialWorkId) || 'WRK-2024-001'
  );
  const [inspectionStatus, setInspectionStatus] = useState<string>('IN_PROGRESS');
  const [observations, setObservations] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<string>('75');
  const [validationError, setValidationError] = useState<string | null>(null);

  const {
    data: planData,
    isLoading: isPlanLoading,
    error: planError,
    refetch: refetchPlan,
  } = useOptimizedInspectionsQuery();

  const updateMutation = useUpdateInspectionMutation();

  const handleInspectionSubmit = async () => {
    setValidationError(null);
    if (!workId.trim()) {
      setValidationError(isHindi ? 'कृपया कार्य आईडी दर्ज करें।' : 'Work ID is required.');
      return;
    }
    if (!observations.trim()) {
      setValidationError(isHindi ? 'कृपया भौतिक निरीक्षण अवलोकन दर्ज करें।' : 'Field observations are required.');
      return;
    }

    try {
      const progress = parseFloat(progressPercent);

      await updateMutation.mutateAsync({
        workId: workId.trim(),
        inspectionStatus,
        observations: observations.trim(),
        physicalProgressPercent: isNaN(progress) ? undefined : progress,
      });

      Alert.alert(
        t('officer.inspectionRecorded'),
        isHindi
          ? 'स्थल निरीक्षण रिपोर्ट वैधानिक लेज़र पर सुरक्षित रूप से दर्ज कर ली गई है।'
          : 'Official site inspection record has been securely recorded on the statutory ledger.'
      );
      setObservations('');
    } catch (err: any) {
      Alert.alert(t('errors.generic'), err.message || 'Failed to record site inspection');
    }
  };

  const routes = planData?.routes || [];

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {t('officer.inspectionRouterAction')}
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          {t('officer.inspectionRouterDesc')}
        </Text>
      </View>

      {/* Record New Inspection Form Card */}
      <Card style={styles.formCard}>
        <Text variant="title" style={styles.cardHeading}>
          {t('officer.inspectionUpdateTitle')}
        </Text>

        <TextField
          label={t('projects.workId')}
          value={workId}
          onChangeText={setWorkId}
          placeholder="e.g. WRK-2024-001"
          required
          accessibilityLabel={t('projects.workId')}
        />

        {/* Status Option Buttons */}
        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.statusLabel}>
          {t('officer.inspectionStatusLabel')} *
        </Text>
        <View style={styles.statusButtonGroup}>
          {STATUS_OPTIONS.map((opt) => {
            const isSelected = inspectionStatus === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.statusBtn, isSelected && styles.statusBtnSelected]}
                onPress={() => setInspectionStatus(opt)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  variant="caption"
                  color={isSelected ? Colors.surface : Colors.textPrimary}
                  style={isSelected ? styles.bold : undefined}
                >
                  {opt.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextField
          label={t('officer.physicalObservationsLabel')}
          value={observations}
          onChangeText={setObservations}
          placeholder={isHindi ? 'ऑन-साइट संरचनात्मक प्रगति और गुणवत्ता का विवरण दर्ज करें...' : 'Enter on-site physical progress, milestone status, and notes...'}
          multiline
          numberOfLines={3}
          required
          containerStyle={{ marginTop: Spacing.sm }}
          accessibilityLabel={t('officer.physicalObservationsLabel')}
        />

        <TextField
          label={t('officer.physicalProgressLabel')}
          value={progressPercent}
          onChangeText={setProgressPercent}
          placeholder="0 - 100"
          keyboardType="numeric"
          accessibilityLabel={t('officer.physicalProgressLabel')}
        />

        {validationError && (
          <Text variant="caption" color={Colors.danger} style={styles.errorText}>
            {validationError}
          </Text>
        )}

        <Button
          title={t('officer.saveInspection')}
          variant="primary"
          loading={updateMutation.isPending}
          onPress={handleInspectionSubmit}
          style={styles.submitBtn}
          accessibilityLabel={t('officer.saveInspection')}
        />
      </Card>

      {/* Inspection Optimizer Itinerary Section */}
      <Text variant="title" style={styles.sectionHeading}>
        {isHindi ? 'इष्टतम निरीक्षण कार्यक्रम' : 'Assigned Inspection Route Itinerary'}
      </Text>

      {isPlanLoading ? (
        <Text variant="bodySmall" color={Colors.textSecondary}>
          {t('common.loading')}
        </Text>
      ) : planError ? (
        <ErrorState
          title={t('errors.network')}
          onRetry={refetchPlan}
        />
      ) : routes.length > 0 ? (
        <View style={styles.routesList}>
          {routes.slice(0, 5).map((item, idx) => (
            <Card key={item.workId || String(idx)} style={styles.routeCard}>
              <View style={styles.routeHeader}>
                <Badge label={`Stop #${item.inspectionPriorityRank}`} variant="primary" size="sm" />
                <Badge
                  label={`${Math.round(item.distanceFromBaseKm || 12)} km`}
                  variant="secondary"
                  size="sm"
                />
              </View>

              <Text variant="bodyLarge" style={styles.workTitle}>
                {t('projects.workId')}: {item.workId}
              </Text>

              <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginVertical: Spacing.xs }}>
                {t('inspections.recommendedAction')}: <Text variant="bodySmall" style={styles.bold}>{item.recommendedAction}</Text>
              </Text>

              <View style={styles.routeFooter}>
                <Text variant="caption" color={Colors.textMuted}>
                  {t('citizen.disbursed')}: {formatINR(item.disbursedAmountInr)}
                </Text>
                <Button
                  title={isHindi ? 'चयन करें' : 'Select Work'}
                  variant="ghost"
                  size="sm"
                  onPress={() => setWorkId(item.workId)}
                />
              </View>
            </Card>
          ))}
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
  formCard: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  cardHeading: {
    marginBottom: Spacing.sm,
  },
  statusLabel: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  statusButtonGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  statusBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bold: {
    fontWeight: '700',
  },
  errorText: {
    marginVertical: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
  sectionHeading: {
    marginBottom: Spacing.sm,
  },
  routesList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  routeCard: {
    padding: Spacing.md,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workTitle: {
    fontWeight: '700',
    marginVertical: Spacing.xs,
  },
  routeFooter: {
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
