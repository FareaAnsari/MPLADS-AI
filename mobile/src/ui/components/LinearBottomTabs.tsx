import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { Colors, Spacing, Radii, Shadows } from '../theme';

export interface TabItem {
  key: string;
  label: string;
  icon: string;
  badge?: number | string;
  onPress: () => void;
}

export interface LinearBottomTabsProps {
  tabs: TabItem[];
  activeTabKey: string;
  style?: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DOCK_PADDING = 6;
const TAB_HEIGHT = 56;

// Spring animation configuration for the Linear snappy feel
const SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
};

function TabButton({
  tab,
  isActive,
  index,
  totalTabs,
  tabWidth,
  onPress,
}: {
  tab: TabItem;
  isActive: boolean;
  index: number;
  totalTabs: number;
  tabWidth: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const activeAnim = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    activeAnim.value = withSpring(isActive ? 1 : 0, SPRING_CONFIG);
  }, [isActive]);

  const animatedItemStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      activeAnim.value,
      [0, 1],
      [0, -2],
      Extrapolation.CLAMP
    );
    const iconScale = interpolate(
      activeAnim.value,
      [0, 1],
      [1, 1.15],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale: iconScale }],
    };
  });

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      activeAnim.value,
      [0, 1],
      [0.7, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const handlePress = () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Haptics fallback
    }
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.tabButton, { width: tabWidth }]}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={[styles.tabInner, animatedItemStyle]}>
        <Animated.View style={iconAnimatedStyle}>
          <Text style={styles.iconText}>{tab.icon}</Text>
        </Animated.View>

        <Animated.View style={labelAnimatedStyle}>
          <Text
            variant="caption"
            color={isActive ? Colors.primaryDark : Colors.textSecondary}
            style={[styles.labelText, isActive && styles.labelActive]}
            numberOfLines={1}
          >
            {tab.label}
          </Text>
        </Animated.View>

        {tab.badge !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{tab.badge}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function LinearBottomTabs({
  tabs,
  activeTabKey,
  style,
}: LinearBottomTabsProps) {
  const activeIndex = tabs.findIndex((t) => t.key === activeTabKey);
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;
  
  // Calculate width per tab based on container
  const containerWidth = Math.min(SCREEN_WIDTH - 32, 420);
  const availableWidth = containerWidth - DOCK_PADDING * 2;
  const tabWidth = availableWidth / tabs.length;

  const indicatorTranslateX = useSharedValue(safeActiveIndex * tabWidth);

  useEffect(() => {
    indicatorTranslateX.value = withSpring(
      safeActiveIndex * tabWidth,
      SPRING_CONFIG
    );
  }, [safeActiveIndex, tabWidth]);

  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorTranslateX.value }],
      width: tabWidth,
    };
  });

  const renderContent = () => (
    <View style={styles.contentContainer}>
      {/* Sliding Active Pill Indicator */}
      <Animated.View
        style={[
          styles.activeIndicatorPill,
          indicatorAnimatedStyle,
        ]}
      />

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((tab, idx) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={tab.key === activeTabKey}
            index={idx}
            totalTabs={tabs.length}
            tabWidth={tabWidth}
            onPress={tab.onPress}
          />
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.outerWrapper, style]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={85} tint="systemMaterialLight" style={styles.dockContainer}>
          {renderContent()}
        </BlurView>
      ) : (
        <View style={[styles.dockContainer, styles.fallbackContainer]}>
          {renderContent()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 20,
    paddingHorizontal: Spacing.md,
  },
  dockContainer: {
    width: Math.min(SCREEN_WIDTH - 32, 420),
    height: TAB_HEIGHT,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...Shadows.lg,
    shadowColor: '#002B49',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
  },
  fallbackContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.borderLight,
    borderWidth: 1,
  },
  contentContainer: {
    flex: 1,
    padding: DOCK_PADDING,
    position: 'relative',
    justifyContent: 'center',
  },
  activeIndicatorPill: {
    position: 'absolute',
    top: DOCK_PADDING,
    left: DOCK_PADDING,
    height: TAB_HEIGHT - DOCK_PADDING * 2,
    backgroundColor: 'rgba(11, 79, 108, 0.12)', // Subtle Linear-style active tint
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(11, 79, 108, 0.18)',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  tabButton: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
    textAlign: 'center',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  labelActive: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: Colors.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
