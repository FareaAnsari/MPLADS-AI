import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '../../src/ui/theme';
import { LanguageSelector } from '../../src/ui/components';
import { useTranslation } from '../../src/i18n';

export default function OfficerLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <View style={styles.headerRight}>
            <LanguageSelector compact />
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('navigation.districtOfficer'),
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="projects/index"
        options={{
          title: t('officer.totalDistrictWorks'),
        }}
      />
      <Stack.Screen
        name="projects/[id]"
        options={{
          title: t('projects.title'),
        }}
      />
      <Stack.Screen
        name="risk/index"
        options={{
          title: t('risk.title'),
        }}
      />
      <Stack.Screen
        name="risk/[id]"
        options={{
          title: t('risk.title'),
        }}
      />
      <Stack.Screen
        name="evidence/index"
        options={{
          title: t('officer.reviewEvidenceAction'),
        }}
      />
      <Stack.Screen
        name="inspections/index"
        options={{
          title: t('officer.inspectionRouterAction'),
        }}
      />
      <Stack.Screen
        name="sla/index"
        options={{
          title: t('officer.slaMonitorAction'),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: Spacing.xs,
  },
});
