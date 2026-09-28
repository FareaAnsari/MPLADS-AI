import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, SupplyChainStepper, Button } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';

export default function OfficerSupplyChainScreen() {
  const router = useRouter();
  const { isHindi } = useTranslation();

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Badge 
            variant="info" 
            label={isHindi ? 'जिला निगरानी प्रकोष्ठ' : 'DISTRICT TECHNICAL CELL'} 
          />
          <Text style={styles.title}>
            {isHindi ? 'सामग्री आपूर्ति श्रृंखला एवं समाधान' : 'Supply Chain & Material Audit'}
          </Text>
          <Text style={styles.subtitle}>
            {isHindi 
              ? 'खरीद आदेश से लेकर माप पुस्तिका सत्यापन तक सामग्री का सत्यापन।' 
              : 'Verifying physical material custody from procurement PO to on-site MB measurement.'}
          </Text>
        </View>

        {/* Project Reference Card */}
        <Card style={styles.projectCard}>
          <Text style={styles.projectLabel}>Inspecting Project Site:</Text>
          <Text style={styles.projectName}>
            Construction of 1.2km PCC Road with Side Drainage, Raniganj
          </Text>
          <Text style={styles.projectCode}>Code: MPLADS/2024/BR/001 • Araria, Bihar</Text>
        </Card>

        {/* Vertical Stepper & Material Reconciliation */}
        <SupplyChainStepper 
          projectId="WRK-2024-BR01-001"
          isOfficer={true}
          isHindi={isHindi}
        />

        {/* Back to Officer Console */}
        <Button
          variant="outline"
          title={isHindi ? 'वापस जाएं' : 'Back to Officer Dashboard'}
          onPress={() => router.back()}
          style={styles.backBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  projectCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  projectLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  projectName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  projectCode: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  backBtn: {
    marginTop: Spacing.md,
  }
});
