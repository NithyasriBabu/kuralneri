import React from 'react';
import { StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';

interface KuralTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'bodyLarge' | 'bodyNormal' | 'caption';
  isTamil?: boolean;
}

export const KuralText: React.FC<KuralTextProps> = ({
  variant = 'bodyNormal',
  isTamil,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  // Automatically detect Tamil character set strings to route typography files correctly
  const containsTamil =
    isTamil || (typeof children === 'string' && /[\u0B80-\u0BFF]/.test(children));

  const baseStyle: TextStyle = {
    fontFamily: containsTamil ? theme.typography.fonts.tamil : theme.typography.fonts.english,
    fontSize: theme.typography.sizes[variant],
    color: variant === 'caption' ? theme.colors.textSecondary : theme.colors.textPrimary,
  };
  const resolvedStyle = StyleSheet.flatten([baseStyle, style]) ?? baseStyle;
  const fontSize = typeof resolvedStyle.fontSize === 'number' ? resolvedStyle.fontSize : 15;
  const safeLineHeight = Math.ceil(fontSize * (containsTamil ? 1.65 : 1.45));
  const requestedLineHeight =
    typeof resolvedStyle.lineHeight === 'number' ? resolvedStyle.lineHeight : 0;
  const clippingSafeStyle: TextStyle = {
    lineHeight: Math.max(requestedLineHeight, safeLineHeight),
    includeFontPadding: true,
  };

  return (
    <Text style={[baseStyle, style, clippingSafeStyle]} {...props}>
      {children}
    </Text>
  );
};
