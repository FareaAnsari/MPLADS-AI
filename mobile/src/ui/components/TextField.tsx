import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Spacing, Radii, Typography } from '../theme';
import { Text } from './Text';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  hint,
  error,
  required = false,
  containerStyle,
  inputStyle,
  placeholder,
  value,
  editable = true,
  secureTextEntry,
  ...props
}) => {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text variant="bodySmall" color={Colors.textSecondary} style={styles.label}>
          {label}
          {required && <Text variant="bodySmall" color={Colors.danger}> *</Text>}
        </Text>
      </View>

      <TextInput
        style={[
          styles.input,
          hasError && styles.inputError,
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        editable={editable}
        secureTextEntry={secureTextEntry}
        accessibilityLabel={`${label}${required ? ', required' : ''}`}
        accessibilityHint={hint || (hasError ? `Error: ${error}` : undefined)}
        accessibilityState={{ disabled: !editable }}
        {...props}
      />

      {hasError ? (
        <Text variant="caption" color={Colors.danger} style={styles.feedbackText}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" color={Colors.textMuted} style={styles.feedbackText}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    marginBottom: Spacing.xs,
  },
  label: {
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.borderDark,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 44, // Minimum 44px accessible touch target
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.riskHighBg,
  },
  inputDisabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
    color: Colors.disabledText,
  },
  feedbackText: {
    marginTop: Spacing.xs,
  },
});
