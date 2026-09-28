import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  Button,
  EmptyState,
  ErrorState,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useAuthStore } from '../../../src/store/authStore';
import { useProjectDetailQuery } from '../../../src/features/projects/queries';
import { useProjectRiskQuery } from '../../../src/features/intelligence/queries';
import { formatINR, formatPercentage, formatRiskScore } from '../../../src/utils/formatters';

export default function CitizenProjectDetailScreen() {
  const router = useRouter();
  const { id, projectId } = useLocalSearchParams<{ id?: string | string[]; projectId?: string }>();
  const { t, isHindi } = useTranslation();
  const { user, status } = useAuthStore();
  const isAuthenticated = status === 'AUTHENTICATED' && user !== null;

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

  const handleEvidenceAction = () => {
    if (!isAuthenticated) {
      Alert.alert(
        isHindi ? 'नागरिक पंजीकरण आवश्यक' : 'Citizen Registration Required',
        isHindi
          ? 'MoSPI नियमों के अनुसार, भू-सत्यापन और साक्ष्य प्रस्तुत करने के लिए नागरिक पंजीकरण और लॉगिन अनिवार्य है।'
          : 'Under MoSPI anti-tampering directives, citizen verification & physical evidence submission require mandatory registration and login.',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: isHindi ? 'लॉगिन / रजिस्टर' : 'Login / Register',
            onPress: () => router.push('/(auth)'),
          },
        ]
      );
      return;
    }

    router.push({
      pathname: '/(citizen)/evidence/submit',
      params: { projectId: project.workId },
    });
  };

  return (
    <Screen scrollable>
      {/* Header Info */}
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
          {t('projects.workId')}: {project.workId}
        </Text>
      </View>

      {/* Location & Authority Card */}
      <Card style={styles.sectionCard}>
        <Text variant="title" style={styles.cardSectionHeading}>
          {isHindi ? 'स्थान एवं प्रशासनिक विवरण' : 'Location & Authority Details'}
        </Text>

        <View style={styles.infoRow}>
          <Text variant="bodySmall" color={Colors.textSecondary}>
            {t('projects.state')}:
          </Text>
          <Text variant="bodySmall" style={styles.bold}>
            {project.state}
          </Text>
        </View>

        {project.constituency && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {isHindi ? 'निर्वाचन क्षेत्र' : 'Constituency'}:
            </Text>
            <Text variant="bodySmall" style={styles.bold}>
              {project.constituency}
            </Text>
          </View>
        )}

        {project.mpName && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {t('projects.mpName')}:
            </Text>
            <Text variant="bodySmall" style={styles.bold}>
              {project.mpName}
            </Text>
          </View>
        )}

        {project.idaOffice && (
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color={Colors.textSecondary}>
              {isHindi ? 'कार्यान्वयन एजेंसी (IDA)' : 'Implementing Agency (IDA)'}:
            </Text>
            <Text variant="bodySmall" style={styles.bold}>
              {project.idaOffice}
            </Text>
          </View>
        )}
      </Card>

      {/* Financial Allocation & Disbursement */}
      <Card style={styles.sectionCard}>
        <Text variant="title" style={styles.cardSectionHeading}>
          {t('citizen.financialOverview')}
        </Text>

        <View style={styles.financialGrid}>
          <View style={styles.financialCol}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('projects.sanctionedAmount')}
            </Text>
            <Text variant="bodyLarge" color={Colors.primaryDark} style={styles.bold}>
              {formatINR(project.sanctionedAmountInr)}
            </Text>
          </View>

          <View style={styles.financialCol}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('projects.disbursedAmount')}
            </Text>
            <Text variant="bodyLarge" color={Colors.secondaryDark} style={styles.bold}>
              {formatINR(project.disbursedAmountInr)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'संवितरण अनुपात' : 'Disbursement Ratio'}: {formatPercentage(expenditureRatio)}
          </Text>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, Math.max(0, expenditureRatio))}%` },
              ]}
            />
          </View>
        </View>
      </Card>

      {/* Public-Safe AI Risk Assessment */}
      <Card style={styles.sectionCard}>
        <View style={styles.riskHeaderRow}>
          <Text variant="title" style={styles.cardSectionHeading}>
            {t('citizen.publicRiskAssessment')}
          </Text>
          {riskAssessment && (
            <Badge
              label={`${riskAssessment.label} (${riskAssessment.score}/100)`}
              variant={riskAssessment.variant}
              size="sm"
            />
          )}
        </View>

        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.riskNotice}>
          {t('citizen.riskEvaluationNotice')}
        </Text>

        {riskData?.primaryRiskReason && (
          <View style={styles.riskSignalBox}>
            <Text variant="caption" color={Colors.danger} style={styles.bold}>
              {isHindi ? 'पहचाना गया जोखिम संकेत' : 'Identified Risk Signal'}:
            </Text>
            <Text variant="caption" color={Colors.textPrimary}>
              {riskData.primaryRiskReason}
            </Text>
          </View>
        )}
      </Card>

      {/* Evidence Submission Action Button */}
      <Card style={styles.ctaCard}>
        <Text variant="title" color={Colors.primaryDark}>
          {t('citizen.submitEvidenceForWork')}
        </Text>
        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.ctaDesc}>
          {isAuthenticated
            ? t('citizen.evidenceFormSubtitle')
            : isHindi
            ? 'नागरिक सत्यापन के लिए पंजीकरण व लॉगिन अनिवार्य है।'
            : 'Statutory verification requires citizen registration & login under MoSPI guidelines.'}
        </Text>
        <Button
          title={isAuthenticated ? t('evidence.submitEvidence') : isHindi ? 'सत्यापन हेतु लॉगिन करें' : 'Login / Register to Verify'}
          variant="primary"
          onPress={handleEvidenceAction}
          style={styles.submitCtaButton}
          accessibilityLabel={t('evidence.submitEvidence')}
          accessibilityHint="Navigates to on-site physical evidence submission form"
        />
      </Card>

      <Button
        title={t('common.back')}
        variant="ghost"
        onPress={() => router.back()}
        style={styles.backButton}
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
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardSectionHeading: {
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  bold: {
    fontWeight: '700',
  },
  financialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  financialCol: {
    flex: 1,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressBarBackground: {
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
  riskHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  riskNotice: {
    marginVertical: Spacing.xs,
  },
  riskSignalBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.riskHighBg,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  ctaCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  ctaDesc: {
    marginVertical: Spacing.xs,
  },
  submitCtaButton: {
    marginTop: Spacing.sm,
  },
  backButton: {
    marginVertical: Spacing.lg,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
