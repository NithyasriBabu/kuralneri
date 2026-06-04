import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
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

  return (
    <Text style={[baseStyle, style]} {...props}>
      {children}
    </Text>
  );
};
