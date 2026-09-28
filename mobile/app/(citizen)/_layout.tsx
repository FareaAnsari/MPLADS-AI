import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '../../src/ui/theme';
import { Text, LanguageSelector } from '../../src/ui/components';
import { useTranslation } from '../../src/i18n';

export default function CitizenLayout() {
  const { t } = useTranslation();
  const router = useRouter();

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
          title: t('navigation.citizenPortal'),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
              style={styles.headerLeftBtn}
              accessibilityLabel={t('common.back')}
              accessibilityRole="button"
            >
              <Text variant="bodyMedium" color={Colors.textInverse} style={styles.backText}>
                ‹ {t('common.back')}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="projects/index"
        options={{
          title: t('citizen.exploreProjects'),
        }}
      />
      <Stack.Screen
        name="projects/[id]"
        options={{
          title: t('projects.title'),
        }}
      />
      <Stack.Screen
        name="projects/[...id]"
        options={{
          title: t('projects.title'),
        }}
      />
      <Stack.Screen
        name="evidence/index"
        options={{
          title: t('citizen.evidenceHub'),
        }}
      />
      <Stack.Screen
        name="evidence/submit"
        options={{
          title: t('citizen.evidenceFormTitle'),
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: Spacing.xs,
  },
  headerLeftBtn: {
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.sm,
    justifyContent: 'center',
  },
  backText: {
    fontWeight: '700',
    fontSize: 16,
  },
});
