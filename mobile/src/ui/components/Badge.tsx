import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radii } from '../theme';
import { Text } from './Text';

export interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'riskLow' | 'riskMedium' | 'riskHigh' | 'riskCritical';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: Colors.primaryLight, text: Colors.textInverse };
      case 'secondary':
        return { bg: Colors.secondaryLight, text: Colors.textInverse };
      case 'success':
      case 'riskLow':
        return { bg: Colors.riskLowBg, text: Colors.riskLow };
      case 'warning':
      case 'riskMedium':
        return { bg: Colors.riskMediumBg, text: Colors.riskMedium };
      case 'danger':
      case 'riskHigh':
        return { bg: Colors.riskHighBg, text: Colors.riskHigh };
      case 'riskCritical':
        return { bg: Colors.riskCriticalBg, text: Colors.dangerLight };
      case 'info':
        return { bg: Colors.infoLight, text: Colors.info };
      case 'neutral':
      default:
        return { bg: Colors.borderLight, text: Colors.textSecondary };
    }
  };

  const { bg, text } = getBadgeColors();

  return (
    <View
      style={[
        styles.badge,
        size === 'sm' ? styles.sm : styles.md,
        { backgroundColor: bg },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
    >
      <Text
        variant="caption"
        color={text}
        style={{ fontWeight: '600' }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: {
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
  },
  md: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
  },
});
