import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../theme';
import { Text } from './Text';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Notice',
  message = 'Unable to complete statutory request. Please check your connection and retry.',
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      <View style={styles.iconCircle}>
        <Text variant="h2" color={Colors.danger}>
          ⚠
        </Text>
      </View>
      <Text variant="title" align="center" color={Colors.danger} style={styles.title}>
        {title}
      </Text>
      <Text variant="bodySmall" align="center" color={Colors.textSecondary} style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button
          title="Retry Connection"
          variant="secondary"
          size="sm"
          onPress={onRetry}
          style={styles.retryButton}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.riskHighBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  message: {
    marginBottom: Spacing.lg,
    maxWidth: 300,
  },
  retryButton: {
    minWidth: 150,
  },
});
