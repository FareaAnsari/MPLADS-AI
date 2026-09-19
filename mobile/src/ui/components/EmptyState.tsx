import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing } from '../theme';
import { Text } from './Text';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]} accessibilityRole="text">
      <View style={styles.iconCircle}>
        <Text variant="h2" color={Colors.textMuted}>
          ℹ
        </Text>
      </View>
      <Text variant="title" align="center" color={Colors.textPrimary} style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySmall" align="center" color={Colors.textSecondary} style={styles.description}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
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
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  description: {
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 140,
  },
});
