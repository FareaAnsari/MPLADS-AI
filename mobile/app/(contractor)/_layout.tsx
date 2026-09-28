import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../../src/ui/theme';
import { Text, LanguageSelector, NotificationBell } from '../../src/ui/components';
import { useTranslation } from '../../src/i18n';

export default function ContractorLayout() {
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
            <NotificationBell color={Colors.textInverse} size={20} />
            <LanguageSelector compact />
          </View>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('navigation.contractorPortal'),
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
          title: t('contractor.projects.title'),
        }}
      />
      <Stack.Screen
        name="projects/[id]"
        options={{
          title: t('contractor.projectDetail.title'),
        }}
      />
      <Stack.Screen
        name="projects/[...id]"
        options={{
          title: t('contractor.projectDetail.title'),
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
