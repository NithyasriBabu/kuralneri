import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from 'src/components/common/KuralText';
import { SettingsItem } from 'src/components/settings/SettingsItem';

export interface KuralSegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface KuralSegmentedControlProps<T extends string> {
  options: KuralSegmentedOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  label?: string;
  helperText?: string;
  shrinkToContent?: boolean;
}

export function KuralSegmentedControl<T extends string>({
  options,
  selected,
  onSelect,
  label,
  helperText,
  shrinkToContent = false,
}: KuralSegmentedControlProps<T>) {
  const { theme } = useTheme();
  const useSingleColumnMobileGrid =
    !shrinkToContent &&
    theme.layout.screenWidth > 0 &&
    theme.layout.screenWidth <= 600 &&
    options.length > 2;

  const control = (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          width: '100%',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.layout.borderRadius.medium,
          overflow: shrinkToContent ? 'visible' : 'hidden',
          gap: shrinkToContent ? 6 : 0,
          alignSelf: 'stretch',
          alignItems: 'stretch',
        }}
      >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={{
              flexGrow: shrinkToContent ? 0 : 1,
              flexShrink: 1,
              flexBasis: useSingleColumnMobileGrid
                ? '100%'
                : shrinkToContent
                  ? 'auto'
                  : 0,
              minWidth: useSingleColumnMobileGrid
                ? '100%'
                : shrinkToContent
                  ? undefined
                  : 0,
              alignSelf: 'stretch',
              minHeight: theme.layout.minHeights.button,
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
                width: shrinkToContent ? undefined : '100%',
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

  return label ? (
    <SettingsItem label={label} helperText={helperText} style={{ marginTop: 8 }}>
      {control}
    </SettingsItem>
  ) : (
    <View style={{ marginTop: 8, width: '100%', alignSelf: 'stretch' }}>{control}</View>
  );
}
