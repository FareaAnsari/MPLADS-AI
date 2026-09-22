import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Card, Badge, LanguageSelector } from '../src/ui/components';
import { Colors, Spacing } from '../src/ui/theme';
import { useTranslation } from '../src/i18n';
import { useAuthStore } from '../src/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { t, isHindi } = useTranslation();
  const { loginAsRole } = useAuthStore();

  return (
    <Screen>
      <View style={styles.topBar}>
        <Badge
          label={`${t('common.governmentOfIndia')} · MoSPI`}
          variant="primary"
          size="md"
        />
        <LanguageSelector compact />
      </View>

      <View style={styles.header}>
        <Text variant="h1" color={Colors.primaryDark} style={styles.title}>
          {t('common.appName')}
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          {t('common.tagline')}
        </Text>
      </View>


      <Text variant="title" style={styles.sectionHeading}>
        {isHindi ? 'भूमिका नेविगेशन मॉड्यूल' : 'Role Navigation Modules'}
      </Text>

      <View style={styles.buttonGroup}>
        <Button
          title={t('navigation.citizenPortal')}
          variant="primary"
          onPress={() => {
            router.push('/(citizen)');
          }}
          style={styles.navButton}
          accessibilityLabel={t('navigation.citizenPortal')}
          accessibilityHint="Navigates to public Citizen Transparency Portal"
        />
        <Button
          title={t('navigation.districtOfficer')}
          variant="secondary"
          onPress={async () => {
            await loginAsRole('DISTRICT_OFFICER');
            router.push('/(officer)');
          }}
          style={styles.navButton}
          accessibilityLabel={t('navigation.districtOfficer')}
          accessibilityHint="Navigates to District Officer Inspection Console"
        />
        <Button
          title={t('navigation.mpOffice')}
          variant="outline"
          onPress={async () => {
            await loginAsRole('MP_OFFICE');
            router.push('/(mp)');
          }}
          style={styles.navButton}
          accessibilityLabel={t('navigation.mpOffice')}
          accessibilityHint="Navigates to Member of Parliament Constituency Intelligence"
        />
        <Button
          title={t('navigation.contractorPortal')}
          variant="outline"
          onPress={async () => {
            await loginAsRole('CONTRACTOR');
            router.push('/(contractor)');
          }}
          style={styles.navButton}
          accessibilityLabel={t('navigation.contractorPortal')}
          accessibilityHint="Navigates to Contractor Opportunities Module"
        />
        <Button
          title={t('auth.title')}
          variant="ghost"
          onPress={() => router.push('/(auth)')}
          style={styles.navButton}
          accessibilityLabel={t('auth.title')}
          accessibilityHint="Navigates to Role Authentication Gateway"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  title: {
    marginTop: Spacing.xs,
  },
  statusCard: {
    marginBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    marginTop: Spacing.xs,
  },
  sectionHeading: {
    marginBottom: Spacing.md,
  },
  buttonGroup: {
    gap: Spacing.md,
  },
  navButton: {
    width: '100%',
  },
});
