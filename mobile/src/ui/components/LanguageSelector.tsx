import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors, Spacing, Radii } from '../theme';
import { Text } from './Text';
import { useAppStore, SupportedLanguage } from '../../store/appStore';
import { useTranslation } from '../../i18n';

export interface LanguageSelectorProps {
  style?: ViewStyle;
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  style,
  compact = false,
}) => {
  const { language, setLanguage } = useAppStore();
  const { t } = useTranslation();

  const handleSelect = (lang: SupportedLanguage) => {
    if (language !== lang) {
      setLanguage(lang);
    }
  };

  return (
    <View
      style={[styles.container, compact && styles.containerCompact, style]}
      accessibilityRole="radiogroup"
      accessibilityLabel="Language selection"
    >
      <TouchableOpacity
        style={[
          styles.option,
          compact && styles.optionCompact,
          language === 'en' && styles.optionActive,
        ]}
        onPress={() => handleSelect('en')}
        accessibilityRole="radio"
        accessibilityState={{ selected: language === 'en' }}
        accessibilityLabel="English"
        accessibilityHint="Switches interface language to English"
        activeOpacity={0.7}
      >
        <Text
          variant={compact ? 'caption' : 'bodySmall'}
          color={language === 'en' ? Colors.surface : Colors.textPrimary}
          style={language === 'en' ? styles.activeText : styles.inactiveText}
        >
          English
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.option,
          compact && styles.optionCompact,
          language === 'hi' && styles.optionActive,
        ]}
        onPress={() => handleSelect('hi')}
        accessibilityRole="radio"
        accessibilityState={{ selected: language === 'hi' }}
        accessibilityLabel="हिंदी (Hindi)"
        accessibilityHint="Switches interface language to Hindi"
        activeOpacity={0.7}
      >
        <Text
          variant={compact ? 'caption' : 'bodySmall'}
          color={language === 'hi' ? Colors.surface : Colors.textPrimary}
          style={language === 'hi' ? styles.activeText : styles.inactiveText}
        >
          हिंदी
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.borderLight,
    borderRadius: Radii.md,
    padding: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.borderDark,
  },
  containerCompact: {
    padding: 2,
    borderRadius: Radii.sm,
  },
  option: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.sm,
    minHeight: 44, // 44px touch target requirement
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCompact: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minHeight: 36,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  activeText: {
    fontWeight: '700',
  },
  inactiveText: {
    fontWeight: '500',
  },
});
