import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen, Text, Button, Card, Badge } from '../../src/ui/components';
import { Colors, Spacing } from '../../src/ui/theme';
import { useAuthStore } from '../../src/store/authStore';
import { UserRole } from '../../src/domain/entities';

export default function AuthScreen() {
  const router = useRouter();
  const { loginAsRole, user, status, logout } = useAuthStore();
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);

  const handleSelectRoleLogin = async (role: UserRole) => {
    setLoadingRole(role);
    try {
      await loginAsRole(role);
      // Route to designated role portal upon successful session creation
      switch (role) {
        case 'CITIZEN':
          router.replace('/(citizen)');
          break;
        case 'DISTRICT_OFFICER':
          router.replace('/(officer)');
          break;
        case 'MP_OFFICE':
          router.replace('/(mp)');
          break;
        case 'CONTRACTOR':
          router.replace('/(contractor)');
          break;
        default:
          router.replace('/');
          break;
      }
    } catch (err: any) {
      Alert.alert('Authentication Error', err.message || 'Failed to authenticate');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Badge label="Development Authentication Mode" variant="warning" size="md" />
        <Text variant="h2" color={Colors.primaryDark} style={styles.title}>
          Statutory Access Gateway
        </Text>
        <Text variant="body" color={Colors.textSecondary}>
          Role-isolated authentication architecture backed by Expo SecureStore. Select an authorized identity to establish a session.
        </Text>
      </View>

      {status === 'AUTHENTICATED' && user && (
        <Card style={styles.activeSessionCard}>
          <Text variant="title">Active Session</Text>
          <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginVertical: Spacing.xs }}>
            Signed in as: <Text variant="bodyMedium">{user.name}</Text> ({user.role})
          </Text>
          <Button
            title="Sign Out & Clear Session"
            variant="danger"
            size="sm"
            onPress={logout}
            style={{ marginTop: Spacing.sm }}
          />
        </Card>
      )}

      <Text variant="title" style={styles.sectionHeading}>
        Select Authorized Test Role
      </Text>

      <View style={styles.buttonGroup}>
        <Button
          title="Sign in as Citizen"
          variant="primary"
          loading={loadingRole === 'CITIZEN'}
          onPress={() => handleSelectRoleLogin('CITIZEN')}
        />
        <Button
          title="Sign in as District Officer (Araria Cell)"
          variant="secondary"
          loading={loadingRole === 'DISTRICT_OFFICER'}
          onPress={() => handleSelectRoleLogin('DISTRICT_OFFICER')}
        />
        <Button
          title="Sign in as MP Constituency Office"
          variant="outline"
          loading={loadingRole === 'MP_OFFICE'}
          onPress={() => handleSelectRoleLogin('MP_OFFICE')}
        />
        <Button
          title="Sign in as Registered Contractor"
          variant="outline"
          loading={loadingRole === 'CONTRACTOR'}
          onPress={() => handleSelectRoleLogin('CONTRACTOR')}
        />
      </View>

      <Button
        title="Return to Home"
        variant="ghost"
        onPress={() => router.replace('/')}
        style={{ marginTop: Spacing.xl }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  title: {
    marginTop: Spacing.xs,
  },
  activeSessionCard: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.borderLight,
  },
  sectionHeading: {
    marginBottom: Spacing.md,
  },
  buttonGroup: {
    gap: Spacing.md,
  },
});
