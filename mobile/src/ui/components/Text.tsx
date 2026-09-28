import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography } from '../theme';

export interface TextProps extends RNTextProps {
  variant?: keyof typeof Typography;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color = Colors.textPrimary,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const variantStyle = Typography[variant] || Typography.body;

  return (
    <RNText
      style={[
        variantStyle,
        { color, textAlign: align },
        style,
      ]}
      accessibilityRole="text"
      {...props}
    >
      {children}
    </RNText>
  );
};
