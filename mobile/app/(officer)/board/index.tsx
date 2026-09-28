import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Card, Badge, Button, LinearBottomTabs } from '../../../src/ui/components';
import { Colors, Spacing, Radii } from '../../../src/ui/theme';
import { useTranslation } from '../../../src/i18n';
import { formatINR } from '../../../src/utils/formatters';

type KanbanCol = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

interface ProjectItem {
  workId: string;
  workTitle: string;
  state: string;
  constituency?: string;
  workCategory: string;
  currentStage: string;
  sanctionedAmountInr: number;
  riskScore: number;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  // 1. TO DO / SANCTIONED
  {
    workId: 'WRK-2024-BR01-002',
    workTitle: 'Solar High-Mast Street Lighting Installation, Forbesganj',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Energy',
    currentStage: 'TODO',
    sanctionedAmountInr: 1800000,
    riskScore: 15,
  },
  {
    workId: 'WRK-2024-BR01-005',
    workTitle: 'Deep Solar Tubewell Installation & Sub-Canal Channeling',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Drinking Water',
    currentStage: 'TODO',
    sanctionedAmountInr: 2400000,
    riskScore: 18,
  },
  {
    workId: 'WRK-2024-MH02-006',
    workTitle: 'Community Health Sub-Centre Building & Pharmacy Shed',
    state: 'Maharashtra',
    constituency: 'Pune',
    workCategory: 'Health & Sanitation',
    currentStage: 'TODO',
    sanctionedAmountInr: 3900000,
    riskScore: 20,
  },

  // 2. IN PROGRESS (EXECUTION)
  {
    workId: 'WRK-2024-BR01-001',
    workTitle: 'Construction of High School Science Lab Block',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Education',
    currentStage: 'IN_PROGRESS',
    sanctionedAmountInr: 5000000,
    riskScore: 24,
  },
  {
    workId: 'WRK-2024-BR01-007',
    workTitle: 'PCC Concrete Road Paving from Main Chowk to Raniganj Health Post',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Roads & Pathways',
    currentStage: 'IN_PROGRESS',
    sanctionedAmountInr: 4200000,
    riskScore: 28,
  },
  {
    workId: 'WRK-2024-MH02-008',
    workTitle: 'Solar Grid Linkage & Computer Education Lab, Haveli',
    state: 'Maharashtra',
    constituency: 'Pune',
    workCategory: 'Education',
    currentStage: 'IN_PROGRESS',
    sanctionedAmountInr: 3600000,
    riskScore: 32,
  },

  // 3. DONE / COMPLETED
  {
    workId: 'WRK-2024-BR01-004',
    workTitle: 'Paved CC Road from Block Chowk to Primary Health Centre',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Roads & Pathways',
    currentStage: 'DONE',
    sanctionedAmountInr: 4500000,
    riskScore: 8,
  },
  {
    workId: 'WRK-2024-MH02-009',
    workTitle: 'Senior Citizens Recreation Shed & Community Paving',
    state: 'Maharashtra',
    constituency: 'Pune',
    workCategory: 'Community Infrastructure',
    currentStage: 'DONE',
    sanctionedAmountInr: 2800000,
    riskScore: 11,
  },

  // 4. BLOCKED / SLA STALLED
  {
    workId: 'WRK-2024-BR01-003',
    workTitle: 'Community Drinking Water RO Purification Plant',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Drinking Water',
    currentStage: 'BLOCKED',
    sanctionedAmountInr: 3200000,
    riskScore: 78,
  },
  {
    workId: 'WRK-2024-BR01-010',
    workTitle: 'Drainage Culvert & Retaining Wall Paving near River Basin',
    state: 'Bihar',
    constituency: 'Araria',
    workCategory: 'Roads & Pathways',
    currentStage: 'BLOCKED',
    sanctionedAmountInr: 3800000,
    riskScore: 82,
  },
];

export default function OfficerKanbanBoardScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const [selectedCol, setSelectedCol] = useState<KanbanCol>('IN_PROGRESS');
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const columns: { key: KanbanCol; label: string; count: number }[] = [
    {
      key: 'TODO',
      label: isHindi ? 'स्वीकृत' : 'To Do',
      count: projects.filter((p) => p.currentStage === 'TODO' || p.currentStage === 'RECOMMENDED').length,
    },
    {
      key: 'IN_PROGRESS',
      label: isHindi ? 'प्रगति पर' : 'In Progress',
      count: projects.filter((p) => p.currentStage === 'IN_PROGRESS').length,
    },
    {
      key: 'DONE',
      label: isHindi ? 'पूर्ण' : 'Done',
      count: projects.filter((p) => p.currentStage === 'DONE' || p.currentStage.includes('COMPLETION')).length,
    },
    {
      key: 'BLOCKED',
      label: isHindi ? 'रुका हुआ' : 'Blocked',
      count: projects.filter((p) => p.currentStage === 'BLOCKED' || p.riskScore >= 75).length,
    },
  ];

  const handleMoveStage = (workId: string) => {
    Alert.alert(
      isHindi ? 'कार्य स्थिति बदलें' : 'Update Milestone Stage',
      isHindi ? 'इस कार्य को किस चरण में स्थानांतरित करना चाहते हैं?' : 'Select target execution stage for this project:',
      [
        {
          text: isHindi ? 'स्वीकृत (To Do)' : 'To Do / Sanctioned',
          onPress: () => updateStage(workId, 'TODO'),
        },
        {
          text: isHindi ? 'प्रगति पर (In Progress)' : 'In Progress',
          onPress: () => updateStage(workId, 'IN_PROGRESS'),
        },
        {
          text: isHindi ? 'पूर्ण (Done)' : 'Completed & Certified',
          onPress: () => updateStage(workId, 'DONE'),
        },
        {
          text: isHindi ? 'रुका हुआ (Blocked)' : 'Blocked / SLA Stalled',
          style: 'destructive',
          onPress: () => updateStage(workId, 'BLOCKED'),
        },
        { text: isHindi ? 'रद्द करें' : 'Cancel', style: 'cancel' },
      ]
    );
  };

  const updateStage = async (workId: string, newStage: KanbanCol) => {
    setUpdatingId(workId);
    setProjects((prev) =>
      prev.map((p) => (p.workId === workId ? { ...p, currentStage: newStage } : p))
    );
    try {
      await fetch(`http://localhost:8000/api/v1/projects/${encodeURIComponent(workId)}/stage?new_stage=${newStage}`, {
        method: 'PATCH',
      });
    } catch {
      // Offline fallback
    } finally {
      setUpdatingId(null);
    }
  };

  const currentList = projects.filter((p) => {
    if (selectedCol === 'BLOCKED') return p.currentStage === 'BLOCKED' || p.riskScore >= 75;
    if (selectedCol === 'DONE') return p.currentStage === 'DONE' || p.currentStage.includes('COMPLETION');
    if (selectedCol === 'TODO') return p.currentStage === 'TODO' || p.currentStage === 'RECOMMENDED';
    return p.currentStage === 'IN_PROGRESS';
  });

  return (
    <Screen
      scrollable={false}
      footer={
        <LinearBottomTabs
          activeTabKey="inspections"
          tabs={[
            {
              key: 'dashboard',
              label: isHindi ? 'कंसोल' : 'Console',
              icon: '📊',
              onPress: () => router.push('/(officer)'),
            },
            {
              key: 'inspections',
              label: isHindi ? 'निरीक्षण' : 'Inspect',
              icon: '🗺',
              onPress: () => router.push('/(officer)/inspections'),
            },
            {
              key: 'evidence',
              label: isHindi ? 'समीक्षा' : 'Review',
              icon: '⚖',
              onPress: () => router.push('/(officer)/evidence'),
            },
            {
              key: 'sla',
              label: isHindi ? 'एस एल ए' : 'SLA',
              icon: '⏱',
              onPress: () => router.push('/(officer)/sla'),
            },
          ]}
        />
      }
    >
      <View style={styles.header}>
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          {isHindi ? 'कार्य निष्पादन कानबन बोर्ड' : 'Project Execution Kanban'}
        </Text>
        <Text variant="bodySmall" color={Colors.textSecondary}>
          {isHindi ? 'चरण-वार प्रगति ट्रैक करें एवं स्थिति अपडेट करें' : 'Track stage-wise milestones and update status.'}
        </Text>
      </View>

      {/* 4-Tab Stage Switcher */}
      <View style={styles.tabBar}>
        {columns.map((col) => (
          <TouchableOpacity
            key={col.key}
            onPress={() => setSelectedCol(col.key)}
            style={[styles.tabItem, selectedCol === col.key && styles.tabItemActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedCol === col.key }}
          >
            <Text
              variant="caption"
              style={[styles.tabLabel, selectedCol === col.key && styles.tabLabelActive]}
            >
              {col.label} ({col.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Cards Stream */}
      <FlatList
        data={currentList}
        keyExtractor={(item) => item.workId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isHighRisk = item.riskScore >= 70;

          return (
            <Card style={[styles.card, isHighRisk && styles.cardDanger]}>
              <View style={styles.cardHeader}>
                <Badge label={item.workCategory} variant="secondary" size="sm" />
                <Badge
                  label={`Risk ${item.riskScore}/100`}
                  variant={isHighRisk ? 'danger' : item.riskScore > 40 ? 'warning' : 'success'}
                  size="sm"
                />
              </View>

              <Text variant="bodyLarge" style={styles.cardTitle} color={Colors.textPrimary}>
                {item.workTitle}
              </Text>

              <Text variant="caption" color={Colors.textSecondary}>
                {item.workId} • {item.constituency ? `${item.constituency}, ` : ''}{item.state}
              </Text>

              <View style={styles.cardFooter}>
                <Text variant="bodyMedium" style={styles.boldText} color={Colors.primaryDark}>
                  {formatINR(item.sanctionedAmountInr)}
                </Text>

                <Button
                  title={isHindi ? 'स्थिति बदलें ▾' : 'Move Stage ▾'}
                  variant="outline"
                  size="sm"
                  onPress={() => handleMoveStage(item.workId)}
                />
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.sm - 2,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  tabItemActive: {
    backgroundColor: Colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabLabel: {
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  listContainer: {
    gap: Spacing.md,
    paddingBottom: 90,
  },
  card: {
    padding: Spacing.md,
  },
  cardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontWeight: '700',
    marginVertical: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  boldText: {
    fontWeight: '700',
  },
});
