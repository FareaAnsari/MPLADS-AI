import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, Button, LinearBottomTabs } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { mobileTenderService, MobileTender, MobileContract } from '../../../src/services/tenderService';

export default function OfficerTendersScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const [activeTab, setActiveTab] = useState<'tenders' | 'contracts'>('tenders');
  const [tenders, setTenders] = useState<MobileTender[]>([]);
  const [contracts, setContracts] = useState<MobileContract[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [tList, cList] = await Promise.all([
        mobileTenderService.getTenders(),
        mobileTenderService.getContracts(),
      ]);
      setTenders(tList);
      setContracts(cList);
    } catch {
      // Handled in service fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const formatLakhs = (amt: number) => {
    return `₹${(amt / 100000).toFixed(2)} Lakh`;
  };

  return (
    <Screen safeAreaEdges={['top']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="title" style={styles.headerTitle}>
            {isHindi ? 'ई-खरीद एवं निविदा रजिस्टर' : 'E-Procurement & Tenders'}
          </Text>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi
              ? 'जीएफआर 2017 निविदाएं, बोली मूल्यांकन एवं अनुबंध'
              : 'GFR 2017 Tenders, Bid Evaluation & Contract Agreements'}
          </Text>
        </View>

        {/* Provenance Badge */}
        <View style={styles.provenanceBox}>
          <Text style={styles.provenanceText}>
            ℹ️ {isHindi ? 'टियर 3: निविदा एवं बोली मूल्यांकन डेमो डेटा' : 'Tier 3: Illustrative Tendering & Bid Matrix (Linked to Works)'}
          </Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tenders' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tenders')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'tenders' && styles.tabButtonTextActive,
              ]}
            >
              {isHindi ? 'सक्रिय निविदाएं' : 'Active Tenders'} ({tenders.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'contracts' && styles.tabButtonActive]}
            onPress={() => setActiveTab('contracts')}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'contracts' && styles.tabButtonTextActive,
              ]}
            >
              {isHindi ? 'अनुबंध' : 'Contracts'} ({contracts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'tenders' ? (
          <View style={styles.listContainer}>
            {tenders.map((tItem) => {
              const hasAnomaly = tItem.scrutiny_signals && tItem.scrutiny_signals.length > 0;
              return (
                <Card
                  key={tItem.tender_id}
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: '/(officer)/tenders/[id]',
                      params: { id: tItem.tender_id },
                    })
                  }
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.idRow}>
                      <Text style={styles.tenderId}>{tItem.tender_id}</Text>
                      <Badge
                        variant={
                          tItem.status === 'AWARDED'
                            ? 'success'
                            : tItem.status === 'BIDDING_OPEN'
                            ? 'info'
                            : 'warning'
                        }
                        label={tItem.status.replace('_', ' ')}
                      />
                    </View>
                    <Text variant="bodySmall" style={styles.workTitle}>
                      {tItem.work_title}
                    </Text>
                  </View>

                  <View style={styles.cardDetails}>
                    <View style={styles.detailRow}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        {isHindi ? 'श्रेणी' : 'Category'}:
                      </Text>
                      <Text variant="caption" style={styles.boldText}>
                        {tItem.category}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        {isHindi ? 'अनुमानित लागत' : 'Estimated Cost'}:
                      </Text>
                      <Text variant="caption" style={[styles.boldText, { color: Colors.primaryDark }]}>
                        {formatLakhs(tItem.estimated_cost)}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        {isHindi ? 'स्थान' : 'District'}:
                      </Text>
                      <Text variant="caption" style={styles.boldText}>
                        {tItem.district}, {tItem.state}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Text variant="caption" color={Colors.textSecondary}>
                        {isHindi ? 'बोलियां प्राप्त' : 'Bids Received'}:
                      </Text>
                      <Text variant="caption" style={styles.boldText}>
                        {tItem.bid_count} {isHindi ? 'बोलियां' : 'Bids'}
                      </Text>
                    </View>
                  </View>

                  {hasAnomaly && (
                    <View style={styles.anomalyBadge}>
                      <Text style={styles.anomalyText}>
                        ⚠️ {tItem.scrutiny_signals.length} {isHindi ? 'एआई बोली विसंगति संकेत' : 'AI Scrutiny Observations'}
                      </Text>
                    </View>
                  )}

                  <Button
                    title={isHindi ? 'बोली एवं जांच विवरण देखें →' : 'View Bids & Scrutiny →'}
                    variant="outline"
                    onPress={() =>
                      router.push({
                        pathname: '/(officer)/tenders/[id]',
                        params: { id: tItem.tender_id },
                      })
                    }
                    style={styles.cardBtn}
                  />
                </Card>
              );
            })}
          </View>
        ) : (
          /* Contracts Tab */
          <View style={styles.listContainer}>
            {contracts.map((cItem) => (
              <Card key={cItem.contract_id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.idRow}>
                    <Text style={styles.tenderId}>{cItem.contract_id}</Text>
                    <Badge variant="success" label={cItem.status} />
                  </View>
                  <Text variant="bodySmall" style={styles.workTitle}>
                    {cItem.work_title}
                  </Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text variant="caption" color={Colors.textSecondary}>
                      {isHindi ? 'संविदाकार' : 'Contractor'}:
                    </Text>
                    <Text variant="caption" style={styles.boldText}>
                      {cItem.vendor_name}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="caption" color={Colors.textSecondary}>
                      {isHindi ? 'अनुबंध राशि' : 'Contract Value'}:
                    </Text>
                    <Text variant="caption" style={[styles.boldText, { color: Colors.success }]}>
                      {formatLakhs(cItem.contract_value)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text variant="caption" color={Colors.textSecondary}>
                      {isHindi ? 'माप पुस्तिका' : 'MB Record'}:
                    </Text>
                    <Text variant="caption" style={styles.boldText}>
                      {cItem.measurement_book_ref || 'Pending'}
                    </Text>
                  </View>
                </View>

                <Button
                  title={isHindi ? '🚚 आपूर्ति श्रृंखला ट्रैक करें' : '🚚 Track Material Supply Chain'}
                  variant="primary"
                  onPress={() => router.push('/(officer)/supply-chain')}
                  style={styles.cardBtn}
                />
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Officer Bottom Navigation */}
      <LinearBottomTabs
        activeTab="tenders"
        onTabPress={(tabId) => {
          if (tabId === 'dashboard') router.replace('/(officer)');
          else if (tabId === 'verification') router.replace('/(officer)/verification');
          else if (tabId === 'supply') router.replace('/(officer)/supply-chain');
        }}
        tabs={[
          { id: 'dashboard', label: isHindi ? 'डैशबोर्ड' : 'Dashboard', icon: 'speedometer-outline' },
          { id: 'tenders', label: isHindi ? 'निविदाएं' : 'Tenders', icon: 'document-text-outline' },
          { id: 'supply', label: isHindi ? 'आपूर्ति' : 'Supply', icon: 'cube-outline' },
          { id: 'verification', label: isHindi ? 'सत्यापन' : 'Verify', icon: 'shield-checkmark-outline' },
        ]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 90,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  provenanceBox: {
    backgroundColor: '#FEF3C7',
    padding: Spacing.xs,
    borderRadius: Radii.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  provenanceText: {
    fontSize: 10,
    color: '#92400E',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: 3,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  tabButtonActive: {
    backgroundColor: Colors.primaryDark,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    gap: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderColor: Colors.borderLight,
    borderWidth: 1,
    borderRadius: Radii.lg,
  },
  cardHeader: {
    marginBottom: Spacing.xs,
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
  workTitle: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  cardDetails: {
    marginVertical: Spacing.xs,
    gap: 3,
    backgroundColor: Colors.borderLight,
    padding: Spacing.xs,
    borderRadius: Radii.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boldText: {
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  anomalyBadge: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    padding: Spacing.xs,
    borderRadius: Radii.sm,
    marginVertical: Spacing.xs,
  },
  anomalyText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B45309',
  },
  cardBtn: {
    marginTop: Spacing.xs,
  },
});
