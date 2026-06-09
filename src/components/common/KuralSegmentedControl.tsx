import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from 'src/components/common/KuralText';

export interface KuralSegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface KuralSegmentedControlProps<T extends string> {
  options: KuralSegmentedOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  containerStyle?: ViewStyle;
}

export function KuralSegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
  containerStyle,
}: KuralSegmentedControlProps<T>) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.layout.borderRadius.medium,
          overflow: 'hidden',
          alignSelf: 'flex-end',
        },
        containerStyle,
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: active ? theme.colors.accent : 'transparent',
            }}
          >
            <KuralText
              variant="caption"
              style={{
                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                fontWeight: active ? '700' : '400',
              }}
            >
              {opt.label}
            </KuralText>
          </Pressable>
        );
      })}
    </View>
  );
}
