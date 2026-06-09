import React from 'react';
import { View, Platform, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from 'src/theme/ThemeContextProvider';

import { KuralText } from 'src/components/common/KuralText';

export interface DropdownItem {
  label: string;
  value: string | number;
}

interface KuralDropdownProps {
  label?: string;
  items: DropdownItem[];
  selectedValue: string | number;
  onValueChange: (itemValue: string | number, itemIndex: number) => void;
  placeholder?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

export const KuralDropdown: React.FC<KuralDropdownProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = '',
  disabled = false,
  containerStyle,
}) => {
  const { theme, globalStyles } = useTheme();
  const pickerTextColor = theme.colors.textPrimary;
  const pickerBackgroundColor = theme.colors.surfaceElevated;

  const webStyles = {
    outlineStyle: 'none',
    borderWidth: 0,
    cursor: 'pointer',
    paddingRight: 10,
    color: pickerTextColor,
    backgroundColor: pickerBackgroundColor,
  };

  const renderItems = React.useMemo(() => {
    if (!placeholder) return items;
    return [{ label: placeholder, value: '' }, ...items];
  }, [items, placeholder]);

  return (
    <View style={[containerStyle]}>
      {label && (
        <KuralText
          variant="caption"
          style={[globalStyles.fieldLabel, disabled && { color: theme.colors.disabledText }]}
        >
          {label}
        </KuralText>
      )}
      <View
        style={[
          globalStyles.pickerWrapper,
          disabled && { backgroundColor: theme.colors.interactive.card.disabled, opacity: 0.5 },
          { borderColor: selectedValue ? theme.colors.primary : theme.colors.surface },
        ]}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={[
            globalStyles.pickerPrimitive,
            { color: pickerTextColor, backgroundColor: pickerBackgroundColor },
            Platform.OS === 'web' && (webStyles as any),
          ]}
          itemStyle={{
            color: pickerTextColor,
            fontFamily: /[\u0B80-\u0BFF]/.test(label || '')
              ? theme.typography.fonts.tamil
              : theme.typography.fonts.english,
          }}
          dropdownIconColor={disabled ? theme.colors.disabledText : theme.colors.primary}
          mode="dropdown"
        >
          {renderItems.map((item, index) => (
            <Picker.Item
              key={`${item.value}-${index}`}
              label={item.label}
              value={item.value}
              color={item.value === '' ? theme.colors.disabledText : pickerTextColor}
              style={{
                fontSize: theme.typography.sizes.bodyNormal,
                fontFamily: /[\u0B80-\u0BFF]/.test(item.label)
                  ? theme.typography.fonts.tamil
                  : theme.typography.fonts.english,
              }}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};
