import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from './Text';
import { Card } from './Card';
import { Badge } from './Badge';
import { Colors, Spacing, Radii } from '../theme';
import { formatINR } from '../../utils/formatters';

export interface FundFlowHop {
  source: string;
  target: string;
  amount_inr: number;
  statutory_sla_days: number;
  days_elapsed: number;
  status: 'NORMAL' | 'DELAYED' | 'FLAGGED';
  transferred_at: string;
}

export interface FundFlowStepperProps {
  sanctionedAmountInr?: number;
  disbursedAmountInr?: number;
  hops?: FundFlowHop[];
  onViewFullWebFlow?: () => void;
  isHindi?: boolean;
}

const DEFAULT_HOPS: FundFlowHop[] = [
  {
    source: 'MoSPI Central Treasury',
    target: 'State Nodal Treasury',
    amount_inr: 5000000,
    statutory_sla_days: 15,
    days_elapsed: 11,
    status: 'NORMAL',
    transferred_at: '12 Apr 2024',
  },
  {
    source: 'State Nodal Treasury',
    target: 'District SNA Account',
    amount_inr: 5000000,
    statutory_sla_days: 30,
    days_elapsed: 22,
    status: 'NORMAL',
    transferred_at: '04 May 2024',
  },
  {
    source: 'District SNA Account',
    target: 'Implementing Agency',
    amount_inr: 4750000,
    statutory_sla_days: 45,
    days_elapsed: 52,
    status: 'DELAYED',
    transferred_at: '25 Jun 2024',
  },
  {
    source: 'Implementing Agency',
    target: 'Executing Contractor',
    amount_inr: 3800000,
    statutory_sla_days: 30,
    days_elapsed: 20,
    status: 'NORMAL',
    transferred_at: '18 Sep 2024',
  },
];

export const FundFlowStepper: React.FC<FundFlowStepperProps> = ({
  sanctionedAmountInr = 5000000,
  disbursedAmountInr = 3800000,
  hops = DEFAULT_HOPS,
  onViewFullWebFlow,
  isHindi = false,
}) => {
  return (
    <Card style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text variant="title" color={Colors.primaryDark}>
            {isHindi ? 'पीएफएमएस निधि प्रवाह श्रृंखला' : 'PFMS Statutory Fund Flow'}
          </Text>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'मंत्रालय से संविदाकार तक वास्तविक संवितरण' : 'Ministry to Contractor disbursement chain'}
          </Text>
        </View>
        <Badge
          label={isHindi ? 'सत्यापित' : 'PFMS Live'}
          variant="success"
          size="sm"
        />
      </View>

      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'स्वीकृत राशि' : 'Sanctioned'}
          </Text>
          <Text variant="bodyLarge" style={styles.boldText} color={Colors.primaryDark}>
            {formatINR(sanctionedAmountInr, true)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'संवितरित राशि' : 'Disbursed'}
          </Text>
          <Text variant="bodyLarge" style={styles.boldText} color={Colors.secondaryDark}>
            {formatINR(disbursedAmountInr, true)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'एसएनए शेष' : 'SNA Balance'}
          </Text>
          <Text variant="bodyLarge" style={styles.boldText} color={Colors.warning}>
            {formatINR(Math.max(0, sanctionedAmountInr - disbursedAmountInr), true)}
          </Text>
        </View>
      </View>

      {/* Vertical Stepper Hops */}
      <View style={styles.stepperContainer}>
        {hops.map((hop, idx) => {
          const isDelayed = hop.status === 'DELAYED';
          const isLast = idx === hops.length - 1;

          return (
            <View key={idx} style={styles.stepRow}>
              {/* Stepper Node Icon & Connecting Line */}
              <View style={styles.indicatorCol}>
                <View style={[styles.circleNode, isDelayed && styles.circleDelayed]}>
                  <Text style={styles.nodeIndex}>{idx + 1}</Text>
                </View>
                {!isLast && <View style={[styles.lineSegment, isDelayed && styles.lineDelayed]} />}
              </View>

              {/* Hop Content */}
              <View style={styles.contentCol}>
                <View style={styles.hopTitleRow}>
                  <Text variant="bodyMedium" style={styles.boldText} color={Colors.textPrimary}>
                    {hop.source} → {hop.target}
                  </Text>
                  <Badge
                    label={isDelayed ? (isHindi ? 'विलंबित' : 'SLA Breach') : (isHindi ? 'सामान्य' : 'On Schedule')}
                    variant={isDelayed ? 'warning' : 'success'}
                    size="sm"
                  />
                </View>

                <Text variant="bodyLarge" style={styles.amountText} color={Colors.primaryDark}>
                  {formatINR(hop.amount_inr)}
                </Text>

                <View style={styles.metaRow}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {isHindi ? 'हस्तांतरण तिथि' : 'Date'}: {hop.transferred_at}
                  </Text>
                  <Text
                    variant="caption"
                    color={isDelayed ? Colors.warning : Colors.secondaryDark}
                    style={styles.boldText}
                  >
                    {hop.days_elapsed}d / {hop.statutory_sla_days}d SLA
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {onViewFullWebFlow && (
        <TouchableOpacity
          onPress={onViewFullWebFlow}
          style={styles.webLinkBtn}
          accessibilityRole="button"
          accessibilityLabel="View full fund flow diagram"
        >
          <Text variant="bodySmall" color={Colors.primaryDark} style={styles.boldText}>
            {isHindi ? 'पूर्ण संके डायग्राम वेब पर देखें →' : 'View Full Interactive Sankey Diagram on Web →'}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  summaryStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.md,
    marginBottom: Spacing.md,
  },
  summaryItem: {
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  stepperContainer: {
    gap: Spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  circleNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDelayed: {
    backgroundColor: Colors.warning,
  },
  nodeIndex: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  lineSegment: {
    width: 2,
    flex: 1,
    minHeight: 36,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    marginVertical: 2,
  },
  lineDelayed: {
    backgroundColor: Colors.warning,
    opacity: 0.6,
  },
  contentCol: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  hopTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  amountText: {
    fontWeight: '800',
    marginVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webLinkBtn: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
});
