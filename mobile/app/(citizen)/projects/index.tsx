import React, { useState, useMemo } from 'react';
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
  Button,
} from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { useProjectsQuery } from '../../../src/features/projects/queries';
import { ProjectEntity } from '../../../src/domain/entities';
import { formatINR } from '../../../src/utils/formatters';

const FILTER_STATES = ['All', 'Bihar', 'Maharashtra', 'Punjab', 'Delhi', 'Uttar Pradesh'];

export default function CitizenProjectsListScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');

  const {
    data,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useProjectsQuery({
    state: selectedState !== 'All' ? selectedState : undefined,
    limit: 100,
  });

  const filteredProjects = useMemo(() => {
    const list = data?.projects || [];
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        p.workTitle.toLowerCase().includes(q) ||
        p.workId.toLowerCase().includes(q) ||
        p.workCategory.toLowerCase().includes(q) ||
        (p.mpName && p.mpName.toLowerCase().includes(q))
    );
  }, [data?.projects, searchQuery]);

  const renderProjectItem = ({ item }: { item: ProjectEntity }) => (
    <Card
      interactive
      onPress={() => router.push(`/(citizen)/projects/${item.workId}` as any)}
      style={styles.projectCard}
      accessibilityRole="button"
      accessibilityLabel={`${item.workTitle}, ${item.workId}, ${item.state}`}
      accessibilityHint="Navigates to detailed project view"
    >
      <View style={styles.cardHeader}>
        <Badge label={item.workCategory} variant="secondary" size="sm" />
        <Badge
          label={item.currentStage.replace(/_/g, ' ')}
          variant={item.currentStage.includes('COMPLETION') ? 'success' : 'primary'}
          size="sm"
        />
      </View>

      <Text variant="bodyLarge" color={Colors.textPrimary} style={styles.workTitle}>
        {item.workTitle}
      </Text>

      <Text variant="caption" color={Colors.textMuted} style={styles.metaText}>
        {t('projects.workId')}: {item.workId} · {item.state} {item.constituency ? `(${item.constituency})` : ''}
      </Text>

      {item.mpName && (
        <Text variant="caption" color={Colors.textSecondary}>
          {t('projects.mpName')}: <Text variant="caption" style={styles.bold}>{item.mpName}</Text>
        </Text>
      )}

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
        {/* Search Bar */}
        <TextField
          label=""
          placeholder={t('citizen.projectSearchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchContainer}
          accessibilityLabel={t('citizen.projectSearchPlaceholder')}
        />

        {/* State Filter Pills */}
        <View style={styles.filterScrollWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={FILTER_STATES}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterPillsContainer}
            renderItem={({ item }) => {
              const isSelected = selectedState === item;
              const label = item === 'All' ? t('citizen.allStates') : item;
              return (
                <TouchableOpacity
                  style={[styles.pill, isSelected && styles.pillSelected]}
                  onPress={() => setSelectedState(item)}
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

        {/* Project List / States */}
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
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title={t('projects.noProjectsFound')}
            description={t('projects.noProjectsDesc')}
            actionLabel={t('citizen.resetFilters')}
            onAction={() => {
              setSearchQuery('');
              setSelectedState('All');
            }}
          />
        ) : (
          <FlatList
            data={filteredProjects}
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
    minHeight: 44, // 44px a11y touch target
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
  workTitle: {
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
