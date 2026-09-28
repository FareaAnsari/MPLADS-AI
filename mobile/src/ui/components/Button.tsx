import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, Radii, Shadows } from '../theme';
import { Text } from './Text';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  onPress,
  ...props
}) => {
  const isInteractive = !disabled && !loading;

  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: Colors.secondary,
          borderColor: Colors.secondary,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: Colors.borderDark,
          borderWidth: 1.5,
        };
      case 'danger':
        return {
          backgroundColor: Colors.danger,
          borderColor: Colors.danger,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        };
      case 'primary':
      default:
        return {
          backgroundColor: Colors.primary,
          borderColor: Colors.primary,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return Colors.disabledText;
    switch (variant) {
      case 'outline':
        return Colors.textPrimary;
      case 'ghost':
        return Colors.primary;
      case 'primary':
      case 'secondary':
      case 'danger':
      default:
        return Colors.textInverse;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingVertical: Spacing.xs + 2, paddingHorizontal: Spacing.md };
      case 'lg':
        return { paddingVertical: Spacing.md + 2, paddingHorizontal: Spacing['2xl'] };
      case 'md':
      default:
        return { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg };
    }
  };

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        getContainerStyle(),
        getSizeStyle(),
        disabled && styles.disabled,
        pressed && isInteractive && styles.pressed,
        variant === 'primary' && isInteractive && Shadows.sm,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <Text
          variant={size === 'sm' ? 'caption' : 'button'}
          color={getTextColor()}
          align="center"
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
