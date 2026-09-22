import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, Button, LinearBottomTabs } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { mobileTenderService, MobileTender } from '../../../src/services/tenderService';

export default function ContractorTendersScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const [tenders, setTenders] = useState<MobileTender[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const data = await mobileTenderService.getTenders();
      setTenders(data);
    } catch {
      // Handled
    } finally {
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

  const handleExpressInterest = (tItem: MobileTender) => {
    Alert.alert(
      isHindi ? 'निविदा रुचि दर्ज' : 'Statutory e-Procurement Portal Notice',
      isHindi
        ? `निविदा ${tItem.tender_id} के लिए आधिकारिक बोली केवल राज्य/केंद्रीय ई-प्रोक्योरमेंट पोर्टल (CPPP/GeM) पर दर्ज की जा सकती है।`
        : `Official bids for ${tItem.tender_id} must be formally submitted through designated statutory portals (CPPP / GeM) under GFR 2017 rules.`
    );
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
            {isHindi ? 'खुली निविदाएं एवं अवसर' : 'Open Tenders & Works'}
          </Text>
          <Text variant="caption" color={Colors.textSecondary}>
            {isHindi ? 'संविदाकार ई-खरीद भागीदारी पोर्टल' : 'Contractor E-Procurement Participation Portal'}
          </Text>
        </View>

        {/* Provenance Badge */}
        <View style={styles.provenanceBox}>
          <Text style={styles.provenanceText}>
            ℹ️ {isHindi ? 'टियर 3: प्रदर्शित निविदा एवं कार्य अवसर' : 'Tier 3: Illustrative Tenders & Work Opportunities'}
          </Text>
        </View>

        {/* Tender Cards */}
        <View style={styles.listContainer}>
          {tenders.map((tItem) => (
            <Card key={tItem.tender_id} style={styles.card}>
              <View style={styles.idRow}>
                <Text style={styles.tenderId}>{tItem.tender_id}</Text>
                <Badge
                  variant={tItem.status === 'BIDDING_OPEN' ? 'info' : 'warning'}
                  label={tItem.status.replace('_', ' ')}
                />
              </View>

              <Text variant="bodySmall" style={styles.workTitle}>
                {tItem.work_title}
              </Text>

              <View style={styles.cardDetails}>
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
                    {isHindi ? 'अंतिम तिथि' : 'Closing Date'}:
                  </Text>
                  <Text variant="caption" style={styles.boldText}>
                    {tItem.submission_deadline}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text variant="caption" color={Colors.textSecondary}>
                    {isHindi ? 'जिला' : 'District'}:
                  </Text>
                  <Text variant="caption" style={styles.boldText}>
                    {tItem.district}, {tItem.state}
                  </Text>
                </View>
              </View>

              <View style={styles.btnRow}>
                <Button
                  title={isHindi ? '📋 विवरण देखें' : '📋 View Details'}
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: '/(officer)/tenders/[id]',
                      params: { id: tItem.tender_id },
                    })
                  }
                  style={{ flex: 1 }}
                />
                <Button
                  title={isHindi ? 'बोली जानकारी' : 'Bid Portal Info'}
                  variant="primary"
                  onPress={() => handleExpressInterest(tItem)}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      {/* Contractor Bottom Tabs */}
      <LinearBottomTabs
        activeTab="tenders"
        onTabPress={(tabId) => {
          if (tabId === 'dashboard') router.replace('/(contractor)');
          else if (tabId === 'supply') router.replace('/(contractor)/supply-chain');
        }}
        tabs={[
          { id: 'dashboard', label: isHindi ? 'डैशबोर्ड' : 'Dashboard', icon: 'grid-outline' },
          { id: 'tenders', label: isHindi ? 'निविदाएं' : 'Tenders', icon: 'document-text-outline' },
          { id: 'supply', label: isHindi ? 'आपूर्ति' : 'Supply Chain', icon: 'cube-outline' },
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
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
});
