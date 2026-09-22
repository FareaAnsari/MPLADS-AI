import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, SupplyChainStepper, Button } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useAuthStore } from '../../../src/store/authStore';

export default function ContractorSupplyChainScreen() {
  const router = useRouter();
  const { isHindi } = useAuthStore();

  return (
    <Screen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Badge 
            variant="info" 
            label={isHindi ? 'ठेकेदार एवं विक्रेता पोर्टल' : 'CONTRACTOR & VENDOR PORTAL'} 
          />
          <Text style={styles.title}>
            {isHindi ? 'सामग्री आपूर्ति एवं रसीद पावती' : 'Material Delivery & Supply Record'}
          </Text>
          <Text style={styles.subtitle}>
            {isHindi 
              ? 'डिलीवरी पावती दर्ज करें और माप पुस्तिका मिलान की स्थिति देखें।' 
              : 'Log on-site delivery proofs with GPS lock and monitor material reconciliation.'}
          </Text>
        </View>

        {/* Vendor Standing KPI Banner */}
        <Card style={styles.vendorCard}>
          <Text style={styles.vendorTitle}>Vendor Accountability Track</Text>
          <View style={styles.kpiRow}>
            <View style={styles.kpiBox}>
              <Text style={styles.kpiValue}>91.6%</Text>
              <Text style={styles.kpiLabel}>On-Time Delivery</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={[styles.kpiValue, { color: Colors.primary[600] }]}>-2.8%</Text>
              <Text style={styles.kpiLabel}>Avg Variance</Text>
            </View>
            <View style={styles.kpiBox}>
              <Text style={[styles.kpiValue, { color: Colors.success[600] }]}>88/100</Text>
              <Text style={styles.kpiLabel}>Vendor Standing</Text>
            </View>
          </View>
        </Card>

        {/* Vertical Stepper with Mobile Camera Delivery Upload */}
        <SupplyChainStepper 
          projectId="WRK-2024-BR01-001"
          isContractor={true}
          isHindi={isHindi}
        />

        {/* Back */}
        <Button
          variant="outline"
          label={isHindi ? 'वापस जाएं' : 'Back to Contractor Dashboard'}
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
    backgroundColor: Colors.neutral[50],
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
    color: Colors.neutral[900],
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.neutral[600],
    marginTop: 2,
    lineHeight: 18,
  },
  vendorCard: {
    padding: Spacing.md,
    backgroundColor: Colors.neutral[900],
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
  },
  vendorTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiBox: {
    alignItems: 'center',
    flex: 1,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  kpiLabel: {
    fontSize: 10,
    color: Colors.neutral[400],
    marginTop: 2,
  },
  backBtn: {
    marginTop: Spacing.md,
  }
});
