import React from 'react';
import { View, ViewProps } from 'react-native';

import { KuralText } from 'src/components/common/KuralText';
import { useTheme } from 'src/theme/ThemeContextProvider';

interface InputItemProps extends ViewProps {
  label: string;
  helperText?: string;
  children: React.ReactNode;
}

export function InputItem({ label, helperText, children, style, ...props }: InputItemProps) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          width: '100%',
          alignSelf: 'stretch',
          gap: 8,
          paddingVertical: 10,
        },
        style,
      ]}
      {...props}
    >
      <View style={{ width: '100%' }}>
        <KuralText
          variant="bodyNormal"
          style={{ color: theme.colors.textPrimary, fontWeight: '600' }}
        >
          {label}
        </KuralText>
        {helperText ? (
          <KuralText variant="caption" style={{ color: theme.colors.textSecondary, marginTop: 2 }}>
            {helperText}
          </KuralText>
        ) : null}
      </View>
      {children}
    </View>
  );
}
