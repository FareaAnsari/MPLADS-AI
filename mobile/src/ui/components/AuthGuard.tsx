import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../theme';
import { Text } from './Text';

interface Props {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<Props> = ({ children }) => {
  const { status, user, restoreSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    restoreSession();
  }, []);

  useEffect(() => {
    if (status === 'RESTORING_SESSION') return;

    const inAuthGroup = segments[0] === '(auth)';
    const inCitizenGroup = segments[0] === '(citizen)';
    const inOfficerGroup = segments[0] === '(officer)';
    const inMPGroup = segments[0] === '(mp)';
    const inContractorGroup = segments[0] === '(contractor)';

    if (status === 'UNAUTHENTICATED' || status === 'SESSION_EXPIRED') {
      // Unauthenticated users trying to access role-specific route groups are redirected to auth
      if (inCitizenGroup || inOfficerGroup || inMPGroup || inContractorGroup) {
        router.replace('/(auth)');
      }
    } else if (status === 'AUTHENTICATED' && user) {
      // Role enforcement check: Prevent cross-role route intrusion
      if (inOfficerGroup && user.role !== 'DISTRICT_OFFICER') {
        router.replace('/');
      } else if (inMPGroup && user.role !== 'MP_OFFICE') {
        router.replace('/');
      } else if (inContractorGroup && user.role !== 'CONTRACTOR') {
        router.replace('/');
      }
    }
  }, [status, user, segments]);

  if (status === 'RESTORING_SESSION') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text variant="bodySmall" color={Colors.textSecondary} style={{ marginTop: 12 }}>
          Verifying Statutory Security Session...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
