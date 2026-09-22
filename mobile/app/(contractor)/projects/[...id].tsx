import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  Button,
  TextField,
  EmptyState,
  ErrorState,
  OfflineBanner,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import {
  useContractorProjectDetailQuery,
  useSubmitProgressUpdateMutation,
  useReportIssueMutation,
} from '../../../src/features/contractor';
import { useTranslation } from '../../../src/i18n';
import {
  ContractorMilestoneEntity,
  ContractorProgressUpdateEntity,
  ContractorIssueEntity,
} from '../../../src/domain/entities';

const ISSUE_CATEGORIES = [
  { key: 'MATERIAL_DELAY', labelKey: 'contractor.issues.categoryMaterialDelay' },
  { key: 'SITE_ACCESS', labelKey: 'contractor.issues.categorySiteAccess' },
  { key: 'APPROVAL_DEPENDENCY', labelKey: 'contractor.issues.categoryApprovalDependency' },
  { key: 'WEATHER_BLOCKER', labelKey: 'contractor.issues.categoryWeatherBlocker' },
  { key: 'TECHNICAL_ISSUE', labelKey: 'contractor.issues.categoryTechnicalIssue' },
  { key: 'OTHER', labelKey: 'contractor.issues.categoryOther' },
];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function ContractorProjectDetailScreen() {
  const { id, projectId } = useLocalSearchParams<{ id?: string | string[]; projectId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  const rawId = projectId || (Array.isArray(id) ? id.join('/') : (id || ''));
  const workId = decodeURIComponent(rawId);

  const {
    data: detail,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useContractorProjectDetailQuery(workId);

  const submitProgressMutation = useSubmitProgressUpdateMutation();
  const reportIssueMutation = useReportIssueMutation();

  // Progress Update Modal State
  const [isProgressModalVisible, setProgressModalVisible] = useState(false);
  const [progressPercentInput, setProgressPercentInput] = useState('');
  const [milestoneStageInput, setMilestoneStageInput] = useState('');
  const [progressRemarksInput, setProgressRemarksInput] = useState('');
  const [fieldObservationsInput, setFieldObservationsInput] = useState('');
  const [progressFormError, setProgressFormError] = useState<string | null>(null);

  // Issue Report Modal State
  const [isIssueModalVisible, setIssueModalVisible] = useState(false);
  const [selectedIssueCategory, setSelectedIssueCategory] = useState('MATERIAL_DELAY');
  const [issueTitleInput, setIssueTitleInput] = useState('');
  const [issueDescriptionInput, setIssueDescriptionInput] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('MEDIUM');
  const [issueFormError, setIssueFormError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleOpenProgressModal = () => {
    setProgressPercentInput(
      detail ? String(detail.reportedProgressPercent) : '0'
    );
    setMilestoneStageInput(detail?.project.currentStage || '');
    setProgressRemarksInput('');
    setFieldObservationsInput('');
    setProgressFormError(null);
    setProgressModalVisible(true);
  };

  const handleOpenIssueModal = () => {
    setSelectedIssueCategory('MATERIAL_DELAY');
    setIssueTitleInput('');
    setIssueDescriptionInput('');
    setSelectedSeverity('MEDIUM');
    setIssueFormError(null);
    setIssueModalVisible(true);
  };

  const handleSubmitProgress = async () => {
    if (!workId) return;
    const numericProgress = parseFloat(progressPercentInput.trim());

    if (isNaN(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      setProgressFormError(t('contractor.progress.percentageInvalid'));
      return;
    }

    if (!progressRemarksInput.trim()) {
      setProgressFormError(t('contractor.progress.remarksRequired'));
      return;
    }

    setProgressFormError(null);

    try {
      await submitProgressMutation.mutateAsync({
        workId: workId,
        payload: {
          progressPercentage: numericProgress,
          milestoneStage: milestoneStageInput.trim() || undefined,
          remarks: progressRemarksInput.trim(),
          fieldObservations: fieldObservationsInput.trim() || undefined,
        },
      });

      setProgressModalVisible(false);
      Alert.alert(t('common.done'), t('contractor.progress.submitSuccess'));
    } catch (err: any) {
      setProgressFormError(
        err?.response?.data?.detail || t('contractor.errors.progressSubmitFailed')
      );
    }
  };

  const handleSubmitIssue = async () => {
    if (!workId) return;

    if (!issueTitleInput.trim()) {
      setIssueFormError('Issue summary is required.');
      return;
    }

    if (!issueDescriptionInput.trim()) {
      setIssueFormError('Detailed issue description is required.');
      return;
    }

    setIssueFormError(null);

    try {
      await reportIssueMutation.mutateAsync({
        workId: workId,
        payload: {
          category: selectedIssueCategory,
          title: issueTitleInput.trim(),
          description: issueDescriptionInput.trim(),
          severity: selectedSeverity,
        },
      });

      setIssueModalVisible(false);
      Alert.alert(t('common.done'), t('contractor.issues.reportSuccess'));
    } catch (err: any) {
      setIssueFormError(
        err?.response?.data?.detail || t('contractor.errors.issueReportFailed')
      );
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      default:
        return 'neutral';
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
              {t('contractor.projectDetail.loading')}
            </Text>
          </View>
        ) : isError ? (
          <ErrorState
            title={t('contractor.projectDetail.notFoundTitle')}
            message={error?.message || t('contractor.projectDetail.notFoundDesc')}
            onRetry={refetch}
          />
        ) : !detail ? (
          <EmptyState
            title={t('contractor.projectDetail.notFoundTitle')}
            description={t('contractor.projectDetail.notFoundDesc')}
          />
        ) : (
          <>
            {/* Project Header Identity */}
            <Card style={styles.headerCard}>
              <View style={styles.headerRow}>
                <Badge label={detail.project.workCategory} variant="neutral" size="sm" />
                <Badge label={detail.project.currentStage} variant="primary" size="sm" />
              </View>

              <Text variant="h2" color={Colors.textPrimary} style={styles.projectTitle}>
                {detail.project.workTitle}
              </Text>

              <Text variant="caption" color={Colors.textMuted} style={styles.metaText}>
                {detail.project.workId} • {detail.project.constituency ? `${detail.project.constituency}, ` : ''}{detail.project.state}
              </Text>

              {detail.project.workDescription ? (
                <Text variant="bodyMedium" color={Colors.textSecondary} style={styles.descText}>
                  {detail.project.workDescription}
                </Text>
              ) : null}
            </Card>

            {/* Contract & Assignment Scope Card */}
            <Card style={styles.sectionCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionHeading}>
                {t('contractor.projectDetail.contractScope')}
              </Text>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" color={Colors.textSecondary}>
                  {t('contractor.projectDetail.contractValue')}
                </Text>
                <Text variant="bodyLarge" color={Colors.primaryDark} style={styles.boldText}>
                  {formatCurrency(detail.contractValueInr)}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text variant="bodySmall" color={Colors.textSecondary}>
                  {t('contractor.projectDetail.sanctionedAmount')}
                </Text>
                <Text variant="bodyMedium" color={Colors.textPrimary} style={styles.boldText}>
                  {formatCurrency(detail.project.sanctionedAmountInr)}
                </Text>
              </View>
            </Card>

            {/* Implementation Progress Section */}
            <Card style={styles.sectionCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionHeading}>
                {t('contractor.projectDetail.progressSection')}
              </Text>

              {/* Reported vs Verified Progress Comparison */}
              <View style={styles.progressComparisonRow}>
                <View style={styles.progressCol}>
                  <Badge
                    label={t('contractor.progress.reportedBadge')}
                    variant="primary"
                    size="sm"
                  />
                  <Text variant="h1" color={Colors.primary} style={styles.progressVal}>
                    {detail.reportedProgressPercent}%
                  </Text>
                </View>

                <View style={styles.progressColRight}>
                  <Badge
                    label={t('contractor.progress.verifiedBadge')}
                    variant="success"
                    size="sm"
                  />
                  <Text variant="h1" color={Colors.success} style={styles.progressVal}>
                    {detail.verifiedProgressPercent}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, detail.reportedProgressPercent)}%`,
                    },
                  ]}
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtonsRow}>
                <View style={styles.actionCol}>
                  <Button
                    title={t('contractor.projectDetail.updateProgressAction')}
                    variant="primary"
                    onPress={handleOpenProgressModal}
                    accessibilityLabel={t('contractor.projectDetail.updateProgressAction')}
                  />
                </View>
                <View style={styles.actionCol}>
                  <Button
                    title={t('contractor.projectDetail.reportIssueAction')}
                    variant="outline"
                    onPress={handleOpenIssueModal}
                    accessibilityLabel={t('contractor.projectDetail.reportIssueAction')}
                  />
                </View>
              </View>
            </Card>

            {/* Milestones List */}
            <Card style={styles.sectionCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionHeading}>
                {t('contractor.projectDetail.milestonesTitle')}
              </Text>

              {detail.milestones.length === 0 ? (
                <Text variant="bodySmall" color={Colors.textMuted}>
                  No milestones specified for this work package.
                </Text>
              ) : (
                detail.milestones.map((m: ContractorMilestoneEntity) => (
                  <View key={m.stageId} style={styles.milestoneItem}>
                    <View style={styles.milestoneHeader}>
                      <Text variant="bodyMedium" color={Colors.textPrimary} style={styles.boldText}>
                        {m.stageName}
                      </Text>
                      <Badge
                        label={m.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'}
                        variant={m.isCompleted ? 'success' : 'primary'}
                        size="sm"
                      />
                    </View>
                    <View style={styles.milestoneFooter}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        Target: {m.targetPercent}%
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </Card>

            {/* Progress Update History */}
            <Card style={styles.sectionCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionHeading}>
                {t('contractor.projectDetail.recentUpdatesTitle')}
              </Text>

              {detail.progressHistory.length === 0 ? (
                <Text variant="bodySmall" color={Colors.textMuted}>
                  {t('contractor.projectDetail.noUpdatesRecorded')}
                </Text>
              ) : (
                detail.progressHistory.map((u: ContractorProgressUpdateEntity) => (
                  <View key={u.submissionId} style={styles.updateItem}>
                    <View style={styles.updateHeader}>
                      <Badge
                        label={`${u.reportedProgressPercent}%`}
                        variant="primary"
                        size="sm"
                      />
                      <Text variant="caption" color={Colors.textMuted}>
                        {formatDate(u.submittedAt)}
                      </Text>
                    </View>
                    <Text variant="bodySmall" color={Colors.textPrimary} style={styles.remarksText}>
                      {u.remarks}
                    </Text>
                    {u.fieldObservations ? (
                      <Text variant="caption" color={Colors.textSecondary}>
                        Obs: {u.fieldObservations}
                      </Text>
                    ) : null}
                    <Text variant="caption" color={Colors.textMuted} style={styles.refText}>
                      Ref: {u.auditRef}
                    </Text>
                  </View>
                ))
              )}
            </Card>

            {/* Site Issues List */}
            <Card style={styles.sectionCard}>
              <Text variant="title" color={Colors.textPrimary} style={styles.sectionHeading}>
                {t('contractor.projectDetail.issuesTitle')}
              </Text>

              {detail.issues.length === 0 ? (
                <Text variant="bodySmall" color={Colors.textMuted}>
                  {t('contractor.projectDetail.noIssuesReported')}
                </Text>
              ) : (
                detail.issues.map((issue: ContractorIssueEntity) => (
                  <View key={issue.issueId} style={styles.issueItem}>
                    <View style={styles.issueHeader}>
                      <Badge
                        label={issue.severity}
                        variant={getSeverityBadgeVariant(issue.severity)}
                        size="sm"
                      />
                      <Badge label={issue.status} variant="neutral" size="sm" />
                    </View>
                    <Text variant="bodyMedium" color={Colors.textPrimary} style={styles.boldText}>
                      {issue.title}
                    </Text>
                    <Text variant="bodySmall" color={Colors.textSecondary}>
                      {issue.description}
                    </Text>
                    <Text variant="caption" color={Colors.textMuted} style={styles.refText}>
                      Category: {issue.category} • {formatDate(issue.reportedAt)}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </ScrollView>

      {/* Progress Update Modal */}
      <Modal
        visible={isProgressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text variant="h2" color={Colors.textPrimary} style={styles.modalHeading}>
              {t('contractor.progress.updateTitle')}
            </Text>

            {progressFormError ? (
              <Card style={styles.errorBanner}>
                <Text variant="bodySmall" color={Colors.danger}>
                  {progressFormError}
                </Text>
              </Card>
            ) : null}

            <TextField
              label={t('contractor.progress.percentageLabel')}
              value={progressPercentInput}
              onChangeText={setProgressPercentInput}
              keyboardType="numeric"
              placeholder="e.g. 75"
              accessibilityLabel={t('contractor.progress.percentageLabel')}
            />

            <TextField
              label={t('contractor.progress.milestoneLabel')}
              value={milestoneStageInput}
              onChangeText={setMilestoneStageInput}
              placeholder="e.g. Foundation Completed"
              accessibilityLabel={t('contractor.progress.milestoneLabel')}
            />

            <TextField
              label={t('contractor.progress.remarksLabel')}
              value={progressRemarksInput}
              onChangeText={setProgressRemarksInput}
              placeholder={t('contractor.progress.remarksPlaceholder')}
              multiline
              numberOfLines={3}
              accessibilityLabel={t('contractor.progress.remarksLabel')}
            />

            <TextField
              label={t('contractor.progress.fieldObservationsLabel')}
              value={fieldObservationsInput}
              onChangeText={setFieldObservationsInput}
              placeholder={t('contractor.progress.fieldObservationsPlaceholder')}
              multiline
              numberOfLines={2}
              accessibilityLabel={t('contractor.progress.fieldObservationsLabel')}
            />

            <View style={styles.modalButtonsRow}>
              <View style={styles.modalBtnCol}>
                <Button
                  title={t('common.cancel')}
                  variant="outline"
                  onPress={() => setProgressModalVisible(false)}
                />
              </View>
              <View style={styles.modalBtnCol}>
                <Button
                  title={
                    submitProgressMutation.isPending
                      ? t('contractor.progress.submitting')
                      : t('contractor.progress.submitAction')
                  }
                  variant="primary"
                  loading={submitProgressMutation.isPending}
                  onPress={handleSubmitProgress}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Issue Report Modal */}
      <Modal
        visible={isIssueModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIssueModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text variant="h2" color={Colors.textPrimary} style={styles.modalHeading}>
              {t('contractor.issues.reportTitle')}
            </Text>

            {issueFormError ? (
              <Card style={styles.errorBanner}>
                <Text variant="bodySmall" color={Colors.danger}>
                  {issueFormError}
                </Text>
              </Card>
            ) : null}

            {/* Category Selector Pills */}
            <Text variant="caption" color={Colors.textSecondary} style={styles.inputLabel}>
              {t('contractor.issues.categoryLabel')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPillsScroll}
            >
              {ISSUE_CATEGORIES.map((cat) => {
                const isSelected = selectedIssueCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setSelectedIssueCategory(cat.key)}
                  >
                    <Text
                      variant="caption"
                      color={isSelected ? Colors.textInverse : Colors.textSecondary}
                    >
                      {t(cat.labelKey as any)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TextField
              label={t('contractor.issues.titleLabel')}
              value={issueTitleInput}
              onChangeText={setIssueTitleInput}
              placeholder={t('contractor.issues.titlePlaceholder')}
              accessibilityLabel={t('contractor.issues.titleLabel')}
            />

            <TextField
              label={t('contractor.issues.descriptionLabel')}
              value={issueDescriptionInput}
              onChangeText={setIssueDescriptionInput}
              placeholder={t('contractor.issues.descriptionPlaceholder')}
              multiline
              numberOfLines={3}
              accessibilityLabel={t('contractor.issues.descriptionLabel')}
            />

            {/* Severity Selector */}
            <Text variant="caption" color={Colors.textSecondary} style={styles.inputLabel}>
              {t('contractor.issues.severityLabel')}
            </Text>
            <View style={styles.severityRow}>
              {SEVERITIES.map((sev) => {
                const isSelected = selectedSeverity === sev;
                return (
                  <TouchableOpacity
                    key={sev}
                    style={[styles.sevPill, isSelected && styles.sevPillActive]}
                    onPress={() => setSelectedSeverity(sev)}
                  >
                    <Text
                      variant="caption"
                      color={isSelected ? Colors.textInverse : Colors.textSecondary}
                    >
                      {sev}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalButtonsRow}>
              <View style={styles.modalBtnCol}>
                <Button
                  title={t('common.cancel')}
                  variant="outline"
                  onPress={() => setIssueModalVisible(false)}
                />
              </View>
              <View style={styles.modalBtnCol}>
                <Button
                  title={
                    reportIssueMutation.isPending
                      ? t('contractor.issues.submitting')
                      : t('contractor.issues.submitAction')
                  }
                  variant="primary"
                  loading={reportIssueMutation.isPending}
                  onPress={handleSubmitIssue}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  metaText: {
    marginBottom: Spacing.xs,
  },
  descText: {
    lineHeight: 20,
  },
  sectionCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  sectionHeading: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  progressComparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.xs,
  },
  progressCol: {
    alignItems: 'flex-start',
  },
  progressColRight: {
    alignItems: 'flex-end',
  },
  progressVal: {
    fontWeight: '800',
    marginTop: 4,
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
  actionButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionCol: {
    flex: 1,
  },
  milestoneItem: {
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 4,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  updateItem: {
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 4,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remarksText: {
    lineHeight: 18,
  },
  refText: {
    marginTop: 2,
  },
  issueItem: {
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: 4,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    maxHeight: '90%',
  },
  modalHeading: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  errorBanner: {
    backgroundColor: Colors.riskHighBg,
    borderColor: Colors.danger,
    borderWidth: 1,
    padding: Spacing.xs,
  },
  inputLabel: {
    marginTop: Spacing.xs,
    fontWeight: '600',
  },
  categoryPillsScroll: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    backgroundColor: Colors.borderLight,
  },
  pillActive: {
    backgroundColor: Colors.primary,
  },
  severityRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginVertical: Spacing.xs,
  },
  sevPill: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.sm,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
  },
  sevPillActive: {
    backgroundColor: Colors.primary,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  modalBtnCol: {
    flex: 1,
  },
});
