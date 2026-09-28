import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/config/queryClient';
import { ErrorBoundary } from '../src/ui/components/ErrorBoundary';
import { AuthGuard } from '../src/ui/components/AuthGuard';
import { Colors } from '../src/ui/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthGuard>
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: Colors.primary,
                },
                headerTintColor: Colors.textInverse,
                headerTitleStyle: {
                  fontWeight: '700',
                  fontSize: 18,
                },
                contentStyle: {
                  backgroundColor: Colors.background,
                },
              }}
            >
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(auth)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(citizen)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(officer)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(mp)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(contractor)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="notifications/index"
                options={{
                  title: 'Notification Center',
                  headerBackTitle: 'Back',
                }}
              />
            </Stack>

          </AuthGuard>
        </ErrorBoundary>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
