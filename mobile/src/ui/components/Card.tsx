import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TouchableOpacity,
  GestureResponderEvent,
} from 'react-native';
import { Colors, Spacing, Radii, Shadows } from '../theme';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  bordered?: boolean;
  interactive?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: 'default' | 'highlighted' | 'warning' | 'risk' | 'success';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = ({
  elevated = true,
  bordered = true,
  interactive = false,
  onPress,
  variant = 'default',
  disabled = false,
  style,
  children,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const variantStyle = (() => {
    switch (variant) {
      case 'highlighted':
        return styles.highlighted;
      case 'warning':
        return styles.warning;
      case 'risk':
        return styles.risk;
      case 'success':
        return styles.success;
      default:
        return null;
    }
  })();

  const cardStyles = [
    styles.card,
    bordered && styles.bordered,
    elevated && Shadows.sm,
    variantStyle,
    disabled && styles.disabled,
    style,
  ];

  if (interactive || onPress) {
    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        activeOpacity={0.75}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        {...(props as any)}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={cardStyles}
      accessibilityRole={accessibilityRole || 'none'}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlighted: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.borderLight,
  },
  warning: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningLight,
  },
  risk: {
    borderColor: Colors.danger,
    backgroundColor: Colors.riskHighBg,
  },
  success: {
    borderColor: Colors.success,
    backgroundColor: Colors.riskLowBg,
  },
  disabled: {
    opacity: 0.6,
  },
});
