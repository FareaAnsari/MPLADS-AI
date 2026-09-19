import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Screen,
  Text,
  Card,
  Badge,
  TextField,
  EmptyState,
  ErrorState,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useOfficerProjectsQuery } from '../../../src/features/officer/queries';
import { ProjectEntity } from '../../../src/domain/entities';
import { formatINR } from '../../../src/utils/formatters';

const CATEGORY_FILTERS = ['All', 'Drinking Water Infrastructure', 'Roads & Bridges', 'Healthcare Facility', 'Sanitation Facility'];

export default function OfficerProjectsListScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useOfficerProjectsQuery({
    search: search.trim() || undefined,
    workCategory: selectedCategory !== 'All' ? selectedCategory : undefined,
    limit: 50,
  });

  const projects = data?.projects || [];

  const renderProjectItem = ({ item }: { item: ProjectEntity }) => (
    <Card
      interactive
      onPress={() => router.push(`/(officer)/projects/${item.workId}` as any)}
      style={styles.projectCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.workTitle}, ${item.workId}`}
    >
      <View style={styles.cardHeader}>
        <Badge label={item.workCategory} variant="secondary" size="sm" />
        <Badge
          label={item.currentStage.replace(/_/g, ' ')}
          variant={item.currentStage.includes('COMPLETION') ? 'success' : 'primary'}
          size="sm"
        />
      </View>

      <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.titleText}>
        {item.workTitle}
      </Text>

      <Text variant="caption" color={Colors.textMuted} style={styles.metaText}>
        {t('projects.workId')}: {item.workId} · {item.state} {item.constituency ? `(${item.constituency})` : ''}
      </Text>

      <View style={styles.footerRow}>
        <View>
          <Text variant="caption" color={Colors.textMuted}>
            {t('citizen.sanctioned')}
          </Text>
          <Text variant="bodyMedium" color={Colors.primaryDark} style={styles.bold}>
            {formatINR(item.sanctionedAmountInr)}
          </Text>
        </View>

        <View style={styles.disbursedCol}>
          <Text variant="caption" color={Colors.textMuted}>
            {t('citizen.disbursed')}
          </Text>
          <Text variant="bodyMedium" color={Colors.secondaryDark} style={styles.bold}>
            {formatINR(item.disbursedAmountInr)}
          </Text>
        </View>

        <Text variant="bodySmall" color={Colors.primaryDark} style={styles.arrow}>
          {t('common.next')} →
        </Text>
      </View>
    </Card>
  );

  return (
    <Screen scrollable={false}>
      <View style={styles.container}>
        {/* Search Field */}
        <TextField
          label=""
          placeholder={t('citizen.projectSearchPlaceholder')}
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchContainer}
          accessibilityLabel={t('citizen.projectSearchPlaceholder')}
        />

        {/* Category Filter Pills */}
        <View style={styles.filterScrollWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORY_FILTERS}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterPillsContainer}
            renderItem={({ item }) => {
              const isSelected = selectedCategory === item;
              const label = item === 'All' ? t('officer.allCategories') : item;
              return (
                <TouchableOpacity
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedCategory(item)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={label}
                  activeOpacity={0.7}
                >
                  <Text
                    variant="caption"
                    color={isSelected ? Colors.surface : Colors.textPrimary}
                    style={isSelected ? styles.bold : undefined}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Project List */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <Text variant="body" color={Colors.textSecondary}>
              {t('common.loading')}
            </Text>
          </View>
        ) : error ? (
          <ErrorState
            title={t('errors.network')}
            onRetry={refetch}
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title={t('projects.noProjectsFound')}
            description={t('projects.noProjectsDesc')}
            actionLabel={t('citizen.resetFilters')}
            onAction={() => {
              setSearch('');
              setSelectedCategory('All');
            }}
          />
        ) : (
          <FlatList
            data={projects}
            keyExtractor={(item) => item.workId}
            renderItem={renderProjectItem}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={isRefetching}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    marginBottom: Spacing.xs,
  },
  filterScrollWrapper: {
    marginBottom: Spacing.md,
  },
  filterPillsContainer: {
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radii.full,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: Colors.borderDark,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  bold: {
    fontWeight: '700',
  },
  listContent: {
    gap: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },
  projectCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  titleText: {
    fontWeight: '600',
    marginVertical: Spacing.xs,
  },
  metaText: {
    marginBottom: Spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  disbursedCol: {
    alignItems: 'flex-end',
  },
  arrow: {
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
