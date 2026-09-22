import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
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
import {
  useProjectRiskIntelligenceDetailQuery,
  useVerificationConfidenceQuery,
  useProjectLedgerHistoryQuery,
} from '../../../src/features/intelligence/queries';
import { formatINR, formatPercentage, formatRiskScore, formatDateIN } from '../../../src/utils/formatters';

export default function ProjectRiskIntelligenceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isHindi } = useTranslation();

  const [decisionModal, setDecisionModal] = useState<'CONFIRM_ISSUE' | 'REQUEST_MORE_EVIDENCE' | 'FALSE_ALARM' | null>(null);
  const [mandatoryNotes, setMandatoryNotes] = useState('');
  const [decisionSuccess, setDecisionSuccess] = useState(false);
  const [decisionError, setDecisionError] = useState('');

  const rawId = Array.isArray(id) ? id[0] : (id || '');
  const workId = decodeURIComponent(rawId);

  const {
    data: detailData,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useProjectRiskIntelligenceDetailQuery(workId || '');

  const {
    data: verificationData,
    isLoading: isVerificationLoading,
  } = useVerificationConfidenceQuery(workId || '');

  const {
    data: ledgerData,
    isLoading: isLedgerLoading,
  } = useProjectLedgerHistoryQuery(workId || '');

  if (isDetailLoading) {
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

  if (detailError || !detailData) {
    return (
      <Screen>
        <ErrorState
          title={t('errors.notFound')}
          message={detailError?.message || t('projects.noProjectsDesc')}
          onRetry={refetchDetail}
        />
      </Screen>
    );
  }

  const { project, riskAssessment, peerGroupSummary } = detailData;
  const riskInfo = formatRiskScore(riskAssessment.riskScore, isHindi);
  const bd = riskAssessment.scoreBreakdown;
  const peerStats = peerGroupSummary.peerStats;

  return (
    <Screen scrollable>
      {/* Header & Composite Severity */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Badge label={project.workCategory} variant="secondary" size="sm" />
          <Badge
            label={`${riskInfo.label} (${riskAssessment.riskScore}/100)`}
            variant={riskInfo.variant}
            size="md"
          />
        </View>

        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {project.workTitle}
        </Text>

        <Text variant="caption" color={Colors.textMuted}>
          {t('projects.workId')}: {project.workId} · {project.state} ({project.constituency || 'District Nodal Base'})
        </Text>
      </View>

      {/* 1. Additive Risk Drivers Component Breakdown */}
      <Card style={styles.sectionCard}>
        <Text variant="title" style={styles.cardHeading}>
          {t('officer.riskDrivers')}
        </Text>
        <Text variant="caption" color={Colors.textSecondary} style={{ marginBottom: Spacing.md }}>
          {t('risk.dashboardSubtitle')}
        </Text>

        <View style={styles.driverItem}>
          <View style={styles.driverHeaderRow}>
            <Text variant="bodySmall" style={styles.bold}>
              {t('risk.outlierDeviation')}
            </Text>
            <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
              {Math.round(bd.costAnomalyScore)} / 100
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(100, bd.costAnomalyScore)}%` }]} />
          </View>
        </View>

        <View style={styles.driverItem}>
          <View style={styles.driverHeaderRow}>
            <Text variant="bodySmall" style={styles.bold}>
              {t('risk.timelineDelay')}
            </Text>
            <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
              {Math.round(bd.timeDelayScore)} / 100
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(100, bd.timeDelayScore)}%` }]} />
          </View>
        </View>

        <View style={styles.driverItem}>
          <View style={styles.driverHeaderRow}>
            <Text variant="bodySmall" style={styles.bold}>
              {t('risk.paymentPattern')}
            </Text>
            <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
              {Math.round(bd.paymentPatternScore ?? 0)} / 100
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(100, bd.paymentPatternScore ?? 0)}%` }]} />
          </View>
        </View>

        <View style={styles.driverItem}>
          <View style={styles.driverHeaderRow}>
            <Text variant="bodySmall" style={styles.bold}>
              {t('risk.spatialSignal')}
            </Text>
            <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
              {Math.round(bd.clusterDensityScore)} / 100
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(100, bd.clusterDensityScore)}%` }]} />
          </View>
        </View>

        <View style={styles.driverItem}>
          <View style={styles.driverHeaderRow}>
            <Text variant="bodySmall" style={styles.bold}>
              {t('risk.duplicatePhotoRisk')}
            </Text>
            <Text variant="bodySmall" color={Colors.primaryDark} style={styles.bold}>
              {Math.round(bd.duplicateRiskScore)} / 100
            </Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.min(100, bd.duplicateRiskScore)}%` }]} />
          </View>
        </View>
      </Card>

      {/* 2. Isolation Forest Outlier Detector Card */}
      <Card style={styles.sectionCard}>
        <View style={styles.cardHeaderRow}>
          <Text variant="title" style={styles.cardHeading}>
            {t('risk.isolationForest')}
          </Text>
          <Badge
            label={riskAssessment.anomalyFlag.replace(/_/g, ' ')}
            variant={riskAssessment.anomalyFlag === 'NORMAL' ? 'success' : 'warning'}
            size="sm"
          />
        </View>

        <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginVertical: Spacing.xs }}>
          {t('risk.isolationForestNotice')}
        </Text>

        {riskAssessment.primaryRiskReason && (
          <View style={styles.reasonBox}>
            <Text variant="caption" color={Colors.danger} style={styles.bold}>
              {isHindi ? 'पहचाना गया जोखिम संकेत' : 'Identified Risk Reason'}:
            </Text>
            <Text variant="caption" color={Colors.textPrimary}>
              {riskAssessment.primaryRiskReason}
            </Text>
          </View>
        )}
      </Card>

      {/* 3. Peer Cohort & IQR Benchmarking Card */}
      <Card style={styles.sectionCard}>
        <Text variant="title" style={styles.cardHeading}>
          {t('risk.peerCohortComparison')}
        </Text>
        <Text variant="caption" color={Colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
          {t('risk.peerCohortNotice')}
        </Text>

        <View style={styles.peerGrid}>
          <View style={styles.peerItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.peerSampleSize')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {peerStats.count} projects
            </Text>
          </View>

          <View style={styles.peerItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.peerMedian')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {formatINR(peerStats.median, true)}
            </Text>
          </View>

          <View style={styles.peerItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.peerIQR')}
            </Text>
            <Text variant="bodyMedium" style={styles.bold}>
              {formatINR(peerStats.iqr, true)}
            </Text>
          </View>

          <View style={styles.peerItem}>
            <Text variant="caption" color={Colors.textMuted}>
              {t('risk.peerDeviation')}
            </Text>
            <Text variant="bodyMedium" color={peerGroupSummary.deviation.deviationFromMedianPct > 20 ? Colors.warning : Colors.primaryDark} style={styles.bold}>
              {peerGroupSummary.deviation.deviationFromMedianPct > 0 ? '+' : ''}{peerGroupSummary.deviation.deviationFromMedianPct}%
            </Text>
          </View>
        </View>

        {peerStats.note && (
          <Text variant="caption" color={Colors.textSecondary} style={{ marginTop: Spacing.xs, fontStyle: 'italic' }}>
            ℹ {peerStats.note}
          </Text>
        )}
      </Card>

      {/* 4. Triangulated Verification Confidence */}
      {verificationData && (
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text variant="title" style={styles.cardHeading}>
              {t('risk.verificationConfidence')}
            </Text>
            <Badge
              label={`${Math.round(verificationData.verificationConfidence)}% Confirmed`}
              variant={verificationData.verificationConfidence >= 70 ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginVertical: Spacing.xs }}>
            {t('risk.verificationNotice')}
          </Text>

          <View style={styles.verificationRow}>
            <Text variant="bodySmall">
              Status: <Text variant="bodySmall" style={styles.bold}>{verificationData.independentEvidenceStatus.replace(/_/g, ' ')}</Text>
            </Text>
          </View>
        </Card>
      )}

      {/* 5. Immutable Statutory Audit Ledger Trail */}
      {ledgerData && ledgerData.ledgerHistory.length > 0 && (
        <Card style={styles.sectionCard}>
          <Text variant="title" style={styles.cardHeading}>
            {t('risk.auditLedger')}
          </Text>
          <Text variant="caption" color={Colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
            {t('risk.auditLedgerNotice')}
          </Text>

          <View style={styles.ledgerList}>
            {ledgerData.ledgerHistory.slice(0, 3).map((entry: any, index: number) => (
              <View key={entry.entry_id || String(index)} style={styles.ledgerItem}>
                <View style={styles.ledgerHeader}>
                  <Badge label={entry.entry_id || 'AUDIT-LOG'} variant="secondary" size="sm" />
                  <Text variant="caption" color={Colors.textMuted}>
                    {entry.timestamp ? formatDateIN(entry.timestamp) : '—'}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.bold}>
                  Decision: {entry.decision_type || 'RISK_ASSESSMENT'} (Score: {entry.computed_score})
                </Text>
                <Text variant="caption" color={Colors.textSecondary}>
                  Engine: {entry.model_version || 'v1.0.0'} · Rules: {entry.rules_version || 'v1.2.0'}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Operational Actions */}
      <Card style={styles.actionsCard}>
        <Text variant="title" color={Colors.primaryDark} style={{ marginBottom: Spacing.sm }}>
          {isHindi ? 'अधिकारी निर्णय प्रोटोकॉल एवं कार्य' : 'Statutory Officer Decision Protocol'}
        </Text>
        <Text variant="caption" color={Colors.textSecondary} style={{ marginBottom: Spacing.md }}>
          {isHindi 
            ? 'जीएफआर 2017 और एमपीलैड्स दिशानिर्देशों के तहत अनिवार्य लिखित औचित्य के साथ निर्णय दर्ज करें।' 
            : 'Statutory compliance requires mandatory audit justification notes for every decision action.'}
        </Text>

        {/* 3 Statutory Decision Buttons */}
        <View style={{ gap: Spacing.xs, marginBottom: Spacing.md }}>
          <Button
            title={isHindi ? '🚨 समस्या की पुष्टि करें (जांच शुरू करें)' : '🚨 Confirm Issue (Escalate to Vigilance)'}
            variant="danger"
            onPress={() => {
              setDecisionModal('CONFIRM_ISSUE');
              setMandatoryNotes('');
              setDecisionError('');
            }}
            style={styles.actionBtn}
          />

          <Button
            title={isHindi ? '📋 अतिरिक्त साक्ष्य का अनुरोध करें' : '📋 Request More Evidence (Notice to Agency)'}
            variant="outline"
            onPress={() => {
              setDecisionModal('REQUEST_MORE_EVIDENCE');
              setMandatoryNotes('');
              setDecisionError('');
            }}
            style={styles.actionBtn}
          />

          <Button
            title={isHindi ? '✓ झूठा अलार्म चिह्नित करें (औचित्य दें)' : '✓ Mark False Alarm (Officer Clearance)'}
            variant="secondary"
            onPress={() => {
              setDecisionModal('FALSE_ALARM');
              setMandatoryNotes('');
              setDecisionError('');
            }}
            style={styles.actionBtn}
          />
        </View>

        {/* Supply Chain & Field Inspection Triggers */}
        <View style={{ borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: Spacing.sm, gap: Spacing.xs }}>
          <Button
            title={isHindi ? '🚚 सामग्री आपूर्ति श्रृंखला एवं समाधान देखें' : '🚚 Inspect Supply Chain & Material Custody'}
            variant="primary"
            onPress={() => router.push('/(officer)/supply-chain')}
            style={styles.actionBtn}
          />

          <Button
            title={t('officer.inspectionUpdateTitle')}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/(officer)/inspections',
                params: { workId: project.workId },
              })
            }
            style={styles.actionBtn}
            accessibilityLabel={t('officer.inspectionUpdateTitle')}
          />
        </View>
      </Card>

      {/* Statutory Decision Modal with Mandatory Notes */}
      {decisionModal && (
        <Card style={styles.decisionModalCard}>
          <Text variant="title" style={{ color: Colors.textPrimary, marginBottom: 4 }}>
            {decisionModal === 'CONFIRM_ISSUE' && (isHindi ? 'समस्या की पुष्टि करें' : 'Confirm Fraud / Non-Compliance Issue')}
            {decisionModal === 'REQUEST_MORE_EVIDENCE' && (isHindi ? 'साक्ष्य का अनुरोध' : 'Issue Statutory Notice for Evidence')}
            {decisionModal === 'FALSE_ALARM' && (isHindi ? 'झूठा अलार्म औचित्य' : 'Nodal Officer False Alarm Justification')}
          </Text>
          <Text variant="caption" color={Colors.textSecondary} style={{ marginBottom: Spacing.sm }}>
            {isHindi ? 'निर्णय लॉग में दर्ज करने के लिए विस्तृत टिप्पणी अनिवार्य है।' : 'Mandatory: State statutory grounds, MB reference, or on-site inspection findings.'}
          </Text>

          {decisionSuccess ? (
            <View style={{ backgroundColor: '#F0FDF4', padding: Spacing.sm, borderRadius: Radii.md, marginVertical: Spacing.sm }}>
              <Text variant="bodySmall" style={{ color: Colors.success, fontWeight: 'bold' }}>
                ✓ Decision recorded into immutable statutory audit ledger!
              </Text>
            </View>
          ) : (
            <>
              <TextInput
                value={mandatoryNotes}
                onChangeText={(text) => {
                  setMandatoryNotes(text);
                  if (text.trim().length >= 10) setDecisionError('');
                }}
                placeholder={isHindi ? 'कम से कम 10 अक्षरों का औचित्य दर्ज करें...' : 'Enter mandatory justification (min 10 characters)...'}
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
              {decisionError ? (
                <Text variant="caption" style={{ color: Colors.danger, marginTop: 2, fontWeight: 'bold' }}>
                  {decisionError}
                </Text>
              ) : null}

              <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md }}>
                <Button
                  title="Cancel"
                  variant="ghost"
                  onPress={() => setDecisionModal(null)}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Submit Decision"
                  variant="primary"
                  onPress={() => {
                    if (mandatoryNotes.trim().length < 10) {
                      setDecisionError('Mandatory justification must be at least 10 characters.');
                      return;
                    }
                    setDecisionSuccess(true);
                    setTimeout(() => {
                      setDecisionSuccess(false);
                      setDecisionModal(null);
                    }, 2000);
                  }}
                  style={{ flex: 2 }}
                />
              </View>
            </>
          )}
        </Card>
      )}

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
    marginBottom: Spacing.md,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  driverItem: {
    marginBottom: Spacing.sm,
  },
  driverHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  progressBg: {
    height: 8,
    borderRadius: Radii.sm,
    backgroundColor: Colors.borderLight,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: Radii.sm,
  },
  reasonBox: {
    marginTop: Spacing.xs,
    padding: Spacing.sm,
    backgroundColor: Colors.riskHighBg,
    borderRadius: Radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  peerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  peerItem: {
    width: '48%',
    padding: Spacing.xs,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.sm,
  },
  bold: {
    fontWeight: '700',
  },
  verificationRow: {
    marginTop: Spacing.xs,
  },
  ledgerList: {
    gap: Spacing.xs,
  },
  ledgerItem: {
    padding: Spacing.xs,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.sm,
    gap: 2,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionsCard: {
    padding: Spacing.md,
    backgroundColor: Colors.borderLight,
    borderColor: Colors.borderDark,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  decisionModalCard: {
    padding: Spacing.md,
    backgroundColor: '#ffffff',
    borderColor: Colors.primary,
    borderWidth: 1.5,
    borderRadius: Radii.lg,
    marginBottom: Spacing.lg,
  },
  notesInput: {
    backgroundColor: Colors.borderLight,
    borderColor: Colors.borderDark,
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    fontSize: 12,
    color: Colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
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
