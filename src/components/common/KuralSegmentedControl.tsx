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
  const useSingleColumnMobileGrid =
    !theme.layout.isWideScreen && theme.layout.screenWidth > 0 && theme.layout.screenWidth < 360 && options.length > 2;
  const useTwoColumnMobileGrid = !theme.layout.isWideScreen && options.length > 2 && !useSingleColumnMobileGrid;

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: '100%',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.layout.borderRadius.medium,
          overflow: 'hidden',
          alignSelf: 'stretch',
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
              flexGrow: 1,
              flexBasis: useSingleColumnMobileGrid
                ? '100%'
                : useTwoColumnMobileGrid
                  ? '50%'
                  : 0,
              minWidth: useSingleColumnMobileGrid
                ? '100%'
                : useTwoColumnMobileGrid
                  ? '50%'
                  : 0,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              paddingVertical: 10,
              backgroundColor: active ? theme.colors.accent : 'transparent',
            }}
          >
            <KuralText
              variant="caption"
              style={{
                width: '100%',
                flexShrink: 1,
                color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
                fontWeight: active ? '700' : '400',
                textAlign: 'center',
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
