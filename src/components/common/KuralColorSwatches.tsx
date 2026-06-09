import React from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from 'src/components/common/KuralText';

interface KuralColorSwatchesProps {
  presets: string[];
  selected: string;
  onSelect: (value: string) => void;
  defaultLabel: string;
}

export function KuralColorSwatches({
  presets,
  selected,
  onSelect,
  defaultLabel,
}: KuralColorSwatchesProps) {
  const { theme } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {presets.map((color, index) => {
        const isSelected = color === selected;
        const isEmpty = color === '';
        return (
          <Pressable
            key={`${color}-${index}`}
            onPress={() => onSelect(color)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isEmpty ? theme.colors.background : color,
              borderWidth: isSelected ? 3 : 1,
              borderColor: isSelected ? theme.colors.primary : theme.colors.border,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isEmpty && (
              <KuralText
                variant="caption"
                style={{ fontSize: 9, color: theme.colors.textSecondary }}
              >
                {defaultLabel}
              </KuralText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
