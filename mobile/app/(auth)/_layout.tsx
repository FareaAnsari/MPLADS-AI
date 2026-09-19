import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../src/ui/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.textInverse,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Identity & Authentication',
        }}
      />
    </Stack>
  );
}
