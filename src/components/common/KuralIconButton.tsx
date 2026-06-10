import React, { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';

import { KuralText } from './KuralText';

interface KuralIconButtonProps {
  icon: ReactNode;
  label: string;
  tooltip?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function KuralIconButton({
  icon,
  label,
  tooltip,
  onPress,
  variant = 'secondary',
  disabled = false,
  loading = false,
  size = 'md',
  style,
  labelStyle,
}: KuralIconButtonProps) {
  const { theme } = useTheme();
  const { colors, layout } = theme;
  const [isHovered, setIsHovered] = useState(false);

  const buttonConfig =
    variant === 'primary' ? colors.interactive.primaryButton : colors.interactive.secondaryButton;
  const iconSize = size === 'sm' ? 16 : 18;
  const hoverText = tooltip && isHovered ? tooltip : '';

  const webHandlers =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        }
      : {};

  return (
    <View style={styles.wrapper}>
      {hoverText ? (
        <View
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <KuralText variant="caption" style={{ color: colors.textPrimary }}>
            {hoverText}
          </KuralText>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tooltip ? `${label}. ${tooltip}` : label}
        onPress={onPress}
        disabled={disabled || loading}
        {...webHandlers}
        style={({ pressed }) => [
          styles.base,
          {
            borderRadius: layout.borderRadius.medium,
            backgroundColor: disabled
              ? buttonConfig.disabled
              : pressed
                ? buttonConfig.active
                : isHovered
                  ? buttonConfig.hover
                  : buttonConfig.default,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: size === 'sm' ? 10 : 12,
            paddingVertical: size === 'sm' ? 8 : 10,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? colors.background : colors.primary}
          />
        ) : (
          <View style={styles.contentRow}>
            <View style={{ transform: [{ scale: size === 'sm' ? 0.95 : 1 }] }}>
              {React.isValidElement(icon)
                ? React.cloneElement(
                    icon as React.ReactElement<{ size?: number; color?: string }>,
                    {
                      size: iconSize,
                      color: variant === 'primary' ? colors.background : colors.primary,
                    },
                  )
                : icon}
            </View>
            <KuralText
              variant="caption"
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color:
                    variant === 'primary'
                      ? colors.background
                      : disabled
                        ? colors.disabledText
                        : colors.primary,
                },
                labelStyle,
              ]}
            >
              {label}
            </KuralText>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  base: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    top: -34,
    zIndex: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderRadius: 999,
  },
});
