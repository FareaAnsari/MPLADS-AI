import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  TextField,
  EmptyState,
  ErrorState,
  OfflineBanner,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useContractorProjectsQuery } from '../../../src/features/contractor';
import { useTranslation } from '../../../src/i18n';
import { ProjectEntity } from '../../../src/domain/entities';

const CATEGORIES = [
  'ALL',
  'Drinking Water',
  'Education',
  'Health & Family Welfare',
  'Sanitation',
  'Roads, Pathways and Bridges',
  'Other Public Facilities',
];

export default function ContractorProjectsListScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const queryParams = {
    search: search.trim() || undefined,
    workCategory: selectedCategory === 'ALL' ? undefined : selectedCategory,
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useContractorProjectsQuery(queryParams);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const renderItem = ({ item }: { item: ProjectEntity }) => {
    const isCompleted = item.currentStage.includes('COMPLETION');

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(contractor)/projects/[...id]',
            params: { id: item.workId },
          } as any)
        }
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${item.workTitle}, Category: ${item.workCategory}, Sanctioned: ${formatCurrency(
          item.sanctionedAmountInr
        )}, Stage: ${item.currentStage}`}
        testID={`contractor-project-card-${item.workId}`}
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Badge label={item.workCategory} variant="neutral" size="sm" />
            <Badge
              label={item.currentStage}
              variant={isCompleted ? 'success' : 'primary'}
              size="sm"
            />
          </View>

          <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.title}>
            {item.workTitle}
          </Text>

          {item.workDescription ? (
            <Text
              variant="bodySmall"
              color={Colors.textSecondary}
              numberOfLines={2}
              style={styles.description}
            >
              {item.workDescription}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            <Text variant="caption" color={Colors.textMuted}>
              {item.workId} • {item.constituency ? `${item.constituency}, ` : ''}{item.state}
            </Text>
            <View style={styles.financialCol}>
              <Text variant="caption" color={Colors.textSecondary}>
                {t('contractor.projects.contractValue')}
              </Text>
              <Text variant="bodySmall" color={Colors.primaryDark} style={styles.boldText}>
                {formatCurrency(item.sanctionedAmountInr)}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Screen style={styles.screen} scrollable={false}>
      <OfflineBanner />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextField
          label={t('common.search')}
          value={search}
          onChangeText={setSearch}
          placeholder={t('contractor.projects.searchPlaceholder')}
          accessibilityLabel={t('contractor.projects.searchPlaceholder')}
        />
      </View>

      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => setSelectedCategory(cat)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={cat}
              >
                <Text
                  variant="caption"
                  color={isSelected ? Colors.textInverse : Colors.textSecondary}
                  style={styles.pillText}
                >
                  {cat === 'ALL'
                    ? t('common.filter') + ': ' + t('citizen.allCategories')
                    : cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main List Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text variant="bodyMedium" color={Colors.textSecondary}>
            {t('common.loading')}
          </Text>
        </View>
      ) : isError ? (
        <ErrorState
          title={t('contractor.errors.projectsFailed')}
          message={error?.message || t('contractor.errors.generic')}
          onRetry={refetch}
        />
      ) : !data || data.projects.length === 0 ? (
        <EmptyState
          title={t('contractor.projects.noProjectsFound')}
          description={t('contractor.projects.noProjectsDesc')}
        />
      ) : (
        <FlatList
          data={data.projects}
          keyExtractor={(item) => item.workId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  filterRow: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radii.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontWeight: '600',
  },
  listContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: Spacing['2xl'],
  },
  card: {
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
  },
  description: {
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.xs,
  },
  financialCol: {
    alignItems: 'flex-end',
  },
  boldText: {
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
