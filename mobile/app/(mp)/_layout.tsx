import React from 'react';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '../../src/ui/theme';
import { LanguageSelector, NotificationBell } from '../../src/ui/components';
import { useTranslation } from '../../src/i18n';

export default function MPLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => (
          <View style={styles.headerRight}>
            <NotificationBell color={Colors.textInverse} size={20} />
            <LanguageSelector compact />
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('navigation.mpOffice'),
          headerBackVisible: true,
        }}
      />
      <Stack.Screen
        name="projects/index"
        options={{
          title: t('mp.projects.title'),
        }}
      />
      <Stack.Screen
        name="projects/[id]"
        options={{
          title: t('mp.project.detailTitle'),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginRight: Spacing.xs,
  },
});
