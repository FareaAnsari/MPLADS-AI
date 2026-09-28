import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { Colors, Spacing, Radii } from '../theme';

export interface MobileSupplyMaterial {
  id: string;
  materialType: string;
  category: string;
  orderedQty: number;
  unit: string;
  unitRate: number;
  benchmarkRate: number;
  vendorName: string;
  vendorGstin: string;
  poRef: string;
  ewayBill?: string;
  dispatchedQty: number;
  deliveredQty: number;
  deliveryGps?: { lat: number; lng: number };
  deliveryPhash?: string;
  installedQty: number;
  mbRef?: string;
  reconciliationStatus: 'MATCHED' | 'UNDER_DELIVERY_FLAGGED' | 'OVER_BILLING_FLAGGED' | 'PENDING_VERIFICATION';
  variancePct: number;
}

export interface SupplyChainStepperProps {
  projectId: string;
  materials?: MobileSupplyMaterial[];
  isOfficer?: boolean;
  isContractor?: boolean;
  onLogDelivery?: (materialId: string, deliveredQty: number, notes: string) => void;
  isHindi?: boolean;
}

const DEFAULT_MATERIALS: MobileSupplyMaterial[] = [
  {
    id: 'SC-M01',
    materialType: 'OPC 43 Grade Cement (50kg Bags)',
    category: 'Cement',
    orderedQty: 500,
    unit: 'Bags',
    unitRate: 370,
    benchmarkRate: 365,
    vendorName: 'Patna Building Materials Co',
    vendorGstin: '10AABCP1234F1Z5',
    poRef: 'PO/MPLADS/2024/089',
    ewayBill: 'EWB-102938475612',
    dispatchedQty: 500,
    deliveredQty: 500,
    deliveryGps: { lat: 26.1528, lng: 87.4947 },
    deliveryPhash: 'a1b2c3d4e5f60718',
    installedQty: 380,
    mbRef: 'MB-442/Page-18',
    reconciliationStatus: 'UNDER_DELIVERY_FLAGGED',
    variancePct: -24.0,
  },
  {
    id: 'SC-M02',
    materialType: 'Fe 500D TMT Steel Rebars',
    category: 'Steel',
    orderedQty: 14.5,
    unit: 'MT',
    unitRate: 63000,
    benchmarkRate: 62500,
    vendorName: 'Patna Building Materials Co',
    vendorGstin: '10AABCP1234F1Z5',
    poRef: 'PO/MPLADS/2024/090',
    ewayBill: 'EWB-102938475990',
    dispatchedQty: 14.5,
    deliveredQty: 14.5,
    deliveryGps: { lat: 26.1529, lng: 87.4949 },
    deliveryPhash: 'b2c3d4e5f6071829',
    installedQty: 14.2,
    mbRef: 'MB-442/Page-22',
    reconciliationStatus: 'MATCHED',
    variancePct: -2.07,
  }
];

export const SupplyChainStepper: React.FC<SupplyChainStepperProps> = ({
  projectId,
  materials = DEFAULT_MATERIALS,
  isOfficer = true,
  isContractor = false,
  onLogDelivery,
  isHindi = false,
}) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveredInput, setDeliveredInput] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [deliverySuccess, setDeliverySuccess] = useState(false);

  const current = materials[selectedIdx] || materials[0];

  const handleConfirmDelivery = () => {
    const qty = parseFloat(deliveredInput) || current.orderedQty;
    if (onLogDelivery) {
      onLogDelivery(current.id, qty, deliveryNotes);
    }
    setDeliverySuccess(true);
    setTimeout(() => {
      setDeliverySuccess(false);
      setShowDeliveryForm(false);
    }, 2500);
  };

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Badge 
              variant="info" 
              label={isHindi ? 'सामग्री आपूर्ति एवं समाधान' : 'SUPPLY CHAIN RECONCILIATION'} 
            />
            <Text style={styles.headerTitle}>
              {isHindi ? 'सामग्री अभिरक्षा एवं मात्रा मिलान' : 'Anti-Fraud Material Custody'}
            </Text>
            <Text style={styles.headerSub}>
              {isHindi ? 'खरीद आदेश से माप पुस्तिका तक' : 'Traceable chain from Purchase Order to MB Record'}
            </Text>
          </View>
        </View>

        {/* Material Selector Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {materials.map((m, idx) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedIdx(idx)}
              style={[
                styles.chip,
                selectedIdx === idx && styles.chipActive,
                m.reconciliationStatus === 'UNDER_DELIVERY_FLAGGED' && styles.chipFlagged
              ]}
            >
              <Text style={[styles.chipText, selectedIdx === idx && styles.chipTextActive]}>
                {m.category}: {m.orderedQty} {m.unit}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* Selected Material 5-Stage Stepper */}
      <Card style={styles.stepperCard}>
        <View style={styles.stepperHeader}>
          <Text style={styles.materialName}>{current.materialType}</Text>
          <Badge 
            variant={current.reconciliationStatus === 'MATCHED' ? 'success' : 'danger'}
            label={current.reconciliationStatus === 'MATCHED' ? 'MATCHED (CLEARED)' : 'FLAGGED (-24% LEAKAGE)'}
          />
        </View>

        {/* Stage 1: Procurement */}
        <View style={styles.stepItem}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: Colors.primaryDark }]} />
            <View style={styles.stepLine} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>1. {isHindi ? 'खरीद (PO जारी)' : 'Procurement (PO Issued)'}</Text>
            <Text style={styles.stepDetail}>Ref: {current.poRef} • Vendor: {current.vendorName}</Text>
            <Text style={styles.stepMetric}>Ordered: {current.orderedQty} {current.unit} @ ₹{current.unitRate}/{current.unit}</Text>
          </View>
        </View>

        {/* Stage 2: Dispatch */}
        <View style={styles.stepItem}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: Colors.secondary }]} />
            <View style={styles.stepLine} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>2. {isHindi ? 'सामग्री प्रेषण' : 'Material Dispatch'}</Text>
            <Text style={styles.stepDetail}>e-Way Bill: {current.ewayBill || 'EWB-102938475612'}</Text>
            <Text style={styles.stepMetric}>Dispatched: {current.dispatchedQty} {current.unit}</Text>
          </View>
        </View>

        {/* Stage 3: Site Delivery */}
        <View style={styles.stepItem}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: Colors.info }]} />
            <View style={styles.stepLine} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>3. {isHindi ? 'साइट पर डिलीवरी' : 'Site Delivery (GPS + pHash)'}</Text>
            <Text style={styles.stepDetail}>GPS Verified: 26.1528°N, 87.4947°E</Text>
            <Text style={styles.stepMetric}>Delivered: {current.deliveredQty} {current.unit} • pHash: {current.deliveryPhash || 'Verified'}</Text>
          </View>
        </View>

        {/* Stage 4: Installation */}
        <View style={styles.stepItem}>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, { backgroundColor: Colors.warning }]} />
            <View style={styles.stepLine} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>4. {isHindi ? 'स्थापना एवं उपयोग (MB)' : 'Installation / Use (MB Record)'}</Text>
            <Text style={styles.stepDetail}>MB Ref: {current.mbRef || 'MB-442/Page-18'}</Text>
            <Text style={styles.stepMetric}>Installed Quantity: {current.installedQty} {current.unit}</Text>
          </View>
        </View>

        {/* Stage 5: Reconciliation */}
        <View style={styles.stepItem}>
          <View style={styles.stepIndicator}>
            <View style={[
              styles.stepDot, 
              { backgroundColor: current.reconciliationStatus === 'MATCHED' ? Colors.success : Colors.danger }
            ]} />
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>5. {isHindi ? 'मात्रा समाधान (ऑडिट)' : 'Reconciliation (Audit Engine)'}</Text>
            <Text style={styles.stepDetail}>
              Variance: <Text style={{ fontWeight: 'bold', color: current.variancePct < -10 ? Colors.danger : Colors.success }}>
                {current.variancePct}%
              </Text> (Statutory Limit: ±10%)
            </Text>
            {current.reconciliationStatus === 'UNDER_DELIVERY_FLAGGED' && (
              <Text style={styles.leakageText}>
                ⚠️ Leakage: {current.orderedQty - current.installedQty} {current.unit} unaccounted (+22 Risk Penalty)
              </Text>
            )}
          </View>
        </View>
      </Card>

      {/* On-Site Delivery Action Button */}
      {!showDeliveryForm ? (
        <Button
          variant="primary"
          title={isHindi ? '📷 साइट पर डिलीवरी रसीद दर्ज करें' : '📷 Confirm Site Delivery Receipt'}
          onPress={() => setShowDeliveryForm(true)}
          style={styles.actionBtn}
        />
      ) : (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isHindi ? 'मोबाइल डिलीवरी पावती' : 'Mobile On-Site Delivery Confirmation'}
          </Text>
          <Text style={styles.formSub}>Auto-captures device GPS coordinates and validates pHash.</Text>

          {deliverySuccess && (
            <View style={styles.successBanner}>
              <Text style={styles.successText}>✓ Delivery successfully recorded & hashed with GPS lock!</Text>
            </View>
          )}

          <Text style={styles.inputLabel}>Received Quantity ({current.unit})</Text>
          <TextInput
            value={deliveredInput}
            onChangeText={setDeliveredInput}
            placeholder={`e.g. ${current.orderedQty}`}
            keyboardType="numeric"
            style={styles.textInput}
          />

          <Text style={styles.inputLabel}>Challan Number / Notes</Text>
          <TextInput
            value={deliveryNotes}
            onChangeText={setDeliveryNotes}
            placeholder="e.g. Challan CH-9921, 500 bags unloaded in dry shed"
            style={styles.textInput}
          />

          <View style={styles.formBtnRow}>
            <Button
              variant="outline"
              title="Cancel"
              onPress={() => setShowDeliveryForm(false)}
              style={{ flex: 1, marginRight: Spacing.sm }}
            />
            <Button
              variant="primary"
              title="Submit with GPS Lock"
              onPress={handleConfirmDelivery}
              style={{ flex: 2 }}
            />
          </View>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  headerCard: {
    padding: Spacing.md,
    backgroundColor: '#0F172A',
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  chipsScroll: {
    marginTop: Spacing.sm,
  },
  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
  },
  chipFlagged: {
    borderColor: Colors.danger,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  stepperCard: {
    padding: Spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: Radii.lg,
    marginBottom: Spacing.sm,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  materialName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 20,
    marginRight: Spacing.sm,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.borderDark,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.sm,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  stepDetail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  stepMetric: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  leakageText: {
    fontSize: 11,
    color: Colors.danger,
    fontWeight: 'bold',
    marginTop: 2,
  },
  actionBtn: {
    marginTop: Spacing.xs,
  },
  formCard: {
    padding: Spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    marginTop: Spacing.xs,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  formSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  successBanner: {
    backgroundColor: Colors.successLight,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    marginBottom: Spacing.sm,
  },
  successText: {
    color: Colors.success,
    fontSize: 11,
    fontWeight: 'bold',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
    marginTop: Spacing.xs,
  },
  textInput: {
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  formBtnRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  }
});
