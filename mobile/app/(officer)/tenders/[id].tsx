import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, Button } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { mobileTenderService, MobileTender } from '../../../src/services/tenderService';

export default function OfficerTenderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isHindi } = useTranslation();
  const [tender, setTender] = useState<MobileTender | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id) {
      mobileTenderService.getTenderById(id).then((data) => {
        setTender(data);
        setLoading(false);
      });
    }
  }, [id]);

  const formatLakhs = (amt: number) => {
    return `₹${(amt / 100000).toFixed(2)} Lakh`;
  };

  if (!tender) {
    return (
      <Screen safeAreaEdges={['top']} style={styles.screen}>
        <View style={styles.center}>
          <Text>{isHindi ? 'लोड हो रहा है...' : 'Loading tender details...'}</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen safeAreaEdges={['top']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Back Link */}
        <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backText}>← {isHindi ? 'निविदा सूची पर वापस जाएं' : 'Back to Tenders List'}</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.idRow}>
            <Text style={styles.tenderId}>{tender.tender_id}</Text>
            <Badge
              variant={tender.status === 'AWARDED' ? 'success' : 'warning'}
              label={tender.status.replace('_', ' ')}
            />
          </View>
          <Text variant="title" style={styles.title}>
            {tender.work_title}
          </Text>
          <Text variant="caption" color={Colors.textSecondary}>
            {tender.district}, {tender.state} • {isHindi ? 'अनुमान' : 'Estimate'}: {formatLakhs(tender.estimated_cost)}
          </Text>

          <View style={styles.provenanceChip}>
            <Text style={styles.provenanceText}>
              ℹ️ {isHindi ? 'टियर 3: बोली मूल्यांकन मैट्रिक्स' : 'Tier 3: Illustrative Bidder Evaluation Matrix'}
            </Text>
          </View>
        </Card>

        {/* AI Bidder Scrutiny Section */}
        {tender.scrutiny_signals && tender.scrutiny_signals.length > 0 && (
          <View style={styles.scrutinySection}>
            <Text variant="title" style={styles.sectionTitle}>
              🛡️ {isHindi ? 'एआई बोली विसंगति अवलोकन' : 'AI Bidder Scrutiny Observations'}
            </Text>

            {tender.scrutiny_signals.map((sig, idx) => (
              <Card key={idx} style={styles.scrutinyCard}>
                <View style={styles.scrutinyHeader}>
                  <Text style={styles.scrutinyTitle}>{sig.title}</Text>
                  <Badge variant={sig.severity === 'HIGH' ? 'danger' : 'warning'} label={sig.severity} />
                </View>
                <Text variant="caption" style={styles.scrutinyObs}>
                  {sig.observation}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Comparative Bids Matrix */}
        <View style={styles.bidsSection}>
          <Text variant="title" style={styles.sectionTitle}>
            📊 {isHindi ? 'तुलनात्मक बोली विवरण' : 'Comparative Bids Matrix'} ({tender.bids.length})
          </Text>

          {tender.bids.map((bid) => {
            const isWinner = bid.status === 'SELECTED';
            return (
              <Card
                key={bid.bid_id}
                style={[styles.bidCard, isWinner && styles.winnerBidCard]}
              >
                <View style={styles.bidHeader}>
                  <View>
                    <Text style={styles.bidRank}>{bid.financial_rank || 'Bid'}</Text>
                    <Text variant="bodySmall" style={styles.bidVendor}>
                      {bid.vendor_name}
                    </Text>
                  </View>
                  <Badge
                    variant={isWinner ? 'success' : 'default'}
                    label={isWinner ? (isHindi ? 'चयनित (L1)' : 'AWARDED (L1)') : bid.status}
                  />
                </View>

                <View style={styles.bidRow}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {isHindi ? 'उद्धृत राशि' : 'Quoted Amount'}:
                  </Text>
                  <Text variant="caption" style={[styles.boldText, { color: Colors.primaryDark }]}>
                    {formatLakhs(bid.bid_amount)}
                  </Text>
                </View>

                <View style={styles.bidRow}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {isHindi ? 'अनुमान से अंतर' : 'Variance vs Estimate'}:
                  </Text>
                  <Text
                    variant="caption"
                    style={[
                      styles.boldText,
                      {
                        color: bid.is_suspiciously_low
                          ? Colors.danger
                          : bid.variance_from_estimate_pct < 0
                          ? Colors.success
                          : Colors.textSecondary,
                      },
                    ]}
                  >
                    {bid.variance_from_estimate_pct > 0 ? '+' : ''}
                    {bid.variance_from_estimate_pct}%
                    {bid.is_suspiciously_low && ' ⚠️ Low'}
                  </Text>
                </View>

                <View style={styles.bidRow}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {isHindi ? 'तकनीकी स्कोर' : 'Technical Score'}:
                  </Text>
                  <Text variant="caption" style={styles.boldText}>
                    {bid.technical_score} / 100
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Downstream Supply Chain Action */}
        {tender.status === 'AWARDED' && (
          <Button
            title={isHindi ? '🚚 सामग्री आपूर्ति एवं डिलीवरी ट्रैक करें' : '🚚 Track Material Supply Chain'}
            variant="primary"
            onPress={() => router.push('/(officer)/supply-chain')}
            style={styles.actionBtn}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    marginBottom: Spacing.sm,
  },
  backText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerCard: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: Radii.lg,
    marginBottom: Spacing.md,
  },
  idRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  tenderId: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  provenanceChip: {
    backgroundColor: '#FEF3C7',
    padding: 4,
    borderRadius: Radii.sm,
    marginTop: Spacing.xs,
  },
  provenanceText: {
    fontSize: 9,
    color: '#92400E',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  scrutinySection: {
    marginBottom: Spacing.md,
  },
  scrutinyCard: {
    padding: Spacing.sm,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: Radii.md,
    marginBottom: Spacing.xs,
  },
  scrutinyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scrutinyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400E',
    flex: 1,
  },
  scrutinyObs: {
    fontSize: 11,
    color: '#78350F',
    lineHeight: 16,
  },
  bidsSection: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  bidCard: {
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: Radii.md,
  },
  winnerBidCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  bidRank: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primaryDark,
  },
  bidVendor: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  bidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  actionBtn: {
    marginTop: Spacing.sm,
  },
});
