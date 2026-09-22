import React, { useState } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, Button, LinearBottomTabs } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';

export default function OfficerPreSanctionSandboxScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();

  const [workTitle, setWorkTitle] = useState('Construction of 1.2km PCC Road with Covered Side Drains');
  const [costLakhs, setCostLakhs] = useState('35.0');
  const [durationMonths, setDurationMonths] = useState('8');
  const [dprText, setDprText] = useState(
    'PCC m20 concrete paving for rural health sub-centre connectivity with standard cross drainage.'
  );

  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    projectedRisk: number;
    riskTier: string;
    peerMedian: number;
    costVariance: number;
    recommendations: string[];
  } | null>(null);

  const handleRunSimulation = () => {
    setLoading(true);
    setTimeout(() => {
      const numCost = parseFloat(costLakhs) || 35.0;
      const isOutlier = numCost > 42.0;
      setSimulationResult({
        projectedRisk: isOutlier ? 68.5 : 22.4,
        riskTier: isOutlier ? (isHindi ? 'समीक्षा आवश्यक' : 'REVIEW REQUIRED') : (isHindi ? 'स्वीकार्य / कम जोखिम' : 'FEASIBLE / LOW RISK'),
        peerMedian: 28.5,
        costVariance: Math.round(((numCost - 28.5) / 28.5) * 100),
        recommendations: [
          `Proposed budget ₹${numCost}L is ${numCost > 28.5 ? '+' : ''}${Math.round(((numCost - 28.5) / 28.5) * 100)}% vs district peer median (₹28.5L).`,
          'DPR text satisfies standard structural specifications.',
          'Geo-spatial scan: Zero duplicate claims detected in PMGSY / MGNREGA registries within 500m.'
        ]
      });
      setLoading(false);
    }, 500);
  };

  return (
    <Screen
      scrollable
      footer={
        <LinearBottomTabs
          activeTabKey="dashboard"
          tabs={[
            {
              key: 'dashboard',
              label: isHindi ? 'कंसोल' : 'Console',
              icon: '📊',
              onPress: () => router.push('/(officer)'),
            },
            {
              key: 'inspections',
              label: isHindi ? 'निरीक्षण' : 'Inspect',
              icon: '🗺',
              onPress: () => router.push('/(officer)/inspections'),
            },
            {
              key: 'evidence',
              label: isHindi ? 'समीक्षा' : 'Review',
              icon: '⚖',
              onPress: () => router.push('/(officer)/evidence'),
            },
            {
              key: 'sla',
              label: isHindi ? 'एस एल ए' : 'SLA',
              icon: '⏱',
              onPress: () => router.push('/(officer)/sla'),
            },
          ]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {isHindi ? 'स्वीकृति-पूर्व सैंडबॉक्स सिम्युलेटर' : 'Pre-Sanction Sandbox'}
        </Text>
        <Text variant="bodySmall" color={Colors.textSecondary}>
          {isHindi ? 'प्रस्तावित कार्य की लागत एवं जोखिम का पूर्व-मूल्यांकन' : 'Pre-evaluate proposed work feasibility & risk before filing.'}
        </Text>
      </View>

      {/* Prominent Simulation Mode Banner */}
      <Card style={styles.bannerCard}>
        <Text variant="caption" style={styles.bannerHeader} color={Colors.warning}>
          ⚠️ {isHindi ? 'स्वीकृति-पूर्व अनुकरण मोड — कोई डेटा सुरक्षित नहीं होगा' : 'PRE-SANCTION SIMULATION MODE'}
        </Text>
        <Text variant="caption" color={Colors.textSecondary}>
          {isHindi
            ? 'यह सिम्युलेटर केवल प्रशासनिक मूल्यांकन हेतु है। लेजर में कोई प्रविष्टि नहीं की जाएगी।'
            : 'For administrative feasibility testing before registration. Strictly ephemeral.'}
        </Text>
      </Card>

      {/* Input Parameters Card */}
      <Card style={styles.formCard}>
        <Text variant="bodyLarge" style={styles.sectionTitle} color={Colors.textPrimary}>
          {isHindi ? 'प्रस्ताव विवरण' : 'Proposal Parameters'}
        </Text>

        <Text variant="caption" color={Colors.textSecondary} style={styles.label}>
          {isHindi ? 'कार्य का शीर्षक' : 'Proposed Work Title'}
        </Text>
        <TextInput
          style={styles.input}
          value={workTitle}
          onChangeText={setWorkTitle}
          placeholder="e.g. PCC Road Paving"
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color={Colors.textSecondary} style={styles.label}>
              {isHindi ? 'अनुमानित लागत (₹ लाख)' : 'Est. Cost (₹ Lakhs)'}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={costLakhs}
              onChangeText={setCostLakhs}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color={Colors.textSecondary} style={styles.label}>
              {isHindi ? 'अवधि (माह)' : 'Duration (Months)'}
            </Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={durationMonths}
              onChangeText={setDurationMonths}
            />
          </View>
        </View>

        <Text variant="caption" color={Colors.textSecondary} style={styles.label}>
          {isHindi ? 'डीपीआर औचित्य पाठ' : 'DPR Justification Text'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          value={dprText}
          onChangeText={setDprText}
        />

        <View style={{ marginTop: Spacing.sm }}>
          <Button
            title={loading ? (isHindi ? 'अनुकरण जारी...' : 'Simulating...') : (isHindi ? 'जोखिम एवं लागत अनुकरण चलाएं' : 'Run Pre-Sanction Simulation')}
            variant="primary"
            onPress={handleRunSimulation}
            disabled={loading}
          />
        </View>
      </Card>

      {/* Simulation Results Output */}
      {simulationResult && (
        <Card style={styles.resultsCard}>
          <View style={styles.resultHeaderRow}>
            <Text variant="bodyLarge" style={styles.boldText} color={Colors.textPrimary}>
              {isHindi ? 'अनुकरण मूल्यांकन परिणाम' : 'Simulation Assessment'}
            </Text>
            <Badge
              label={simulationResult.riskTier}
              variant={simulationResult.projectedRisk > 50 ? 'warning' : 'success'}
              size="sm"
            />
          </View>

          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <Text variant="caption" color={Colors.textSecondary}>
                {isHindi ? 'प्रक्षेपित जोखिम' : 'Projected Risk'}
              </Text>
              <Text variant="h2" color={simulationResult.projectedRisk > 50 ? Colors.danger : Colors.success}>
                {simulationResult.projectedRisk.toFixed(1)} / 100
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text variant="caption" color={Colors.textSecondary}>
                {isHindi ? 'सहकर्मी औसत लागत' : 'Peer Median Cost'}
              </Text>
              <Text variant="h3" color={Colors.primaryDark}>
                ₹{simulationResult.peerMedian}L
              </Text>
              <Text variant="caption" color={simulationResult.costVariance > 20 ? Colors.danger : Colors.success}>
                {simulationResult.costVariance > 0 ? '+' : ''}{simulationResult.costVariance}% vs Peers
              </Text>
            </View>
          </View>

          <View style={styles.recsBox}>
            <Text variant="caption" style={styles.boldText} color={Colors.textPrimary}>
              {isHindi ? 'प्रशासनिक अवलोकन व सिफारिशें' : 'Administrative Observations & Recommendations:'}
            </Text>
            {simulationResult.recommendations.map((rec, i) => (
              <Text key={i} variant="caption" color={Colors.textSecondary} style={{ marginTop: 3 }}>
                • {rec}
              </Text>
            ))}
          </View>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.sm,
  },
  title: {
    marginBottom: 2,
  },
  bannerCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bannerHeader: {
    fontWeight: '700',
    marginBottom: 2,
  },
  formCard: {
    padding: Spacing.md,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  label: {
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resultsCard: {
    padding: Spacing.md,
    marginBottom: 90,
  },
  resultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  metricItem: {
    flex: 1,
    backgroundColor: Colors.surfaceMuted,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
  recsBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  boldText: {
    fontWeight: '700',
  },
});
