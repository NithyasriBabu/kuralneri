import React, { useState } from 'react';
import { Pressable, StyleSheet, ActivityIndicator, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContextProvider';
import { KuralText } from './KuralText';

interface KuralButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const KuralButton: React.FC<KuralButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  // 1. FIXED: Destructure the 'theme' container out first
  const { theme } = useTheme();
  const { colors, layout } = theme; // Pull tokens safely out of the active theme instance

  const [isHovered, setIsHovered] = useState(false);

  const buttonConfig =
    variant === 'primary' ? colors.interactive.primaryButton : colors.interactive.secondaryButton;
  const primaryTextColor = theme.dark ? colors.background : colors.surfaceElevated;

  // Safe cursor interaction bindings for web engines
  const webHoverHandlers =
    Platform.OS === 'web'
      ? {
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
        }
      : {};

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      {...webHoverHandlers} // Safely unpack web-only handlers
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: layout.minHeights.button,
          borderRadius: layout.borderRadius.medium,
          backgroundColor: disabled
            ? buttonConfig.disabled
            : pressed
              ? buttonConfig.active
              : isHovered
                ? buttonConfig.hover
                : buttonConfig.default,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? primaryTextColor : colors.primary} />
      ) : (
        <KuralText
          variant="bodyNormal"
          style={{
            color:
              variant === 'primary'
                ? primaryTextColor
                : disabled
                  ? colors.disabledText
                  : colors.primary,
            fontWeight: '600',
          }}
        >
          {title}
        </KuralText>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
});
