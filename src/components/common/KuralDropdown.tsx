import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, TextInput, View, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ChevronDown } from 'lucide-react-native';
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
  searchable?: boolean;
  searchPlaceholder?: string;
  closeLabel?: string;
}

export const KuralDropdown: React.FC<KuralDropdownProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = '',
  disabled = false,
  containerStyle,
  searchable = false,
  searchPlaceholder = 'Search options',
  closeLabel = 'Close',
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

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const renderItems = useMemo(() => {
    if (!placeholder) return items;
    return [{ label: placeholder, value: '' }, ...items];
  }, [items, placeholder]);
  const selectedItem = renderItems.find((item) => item.value === selectedValue);
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return renderItems;
    return renderItems.filter((item) => item.label.toLocaleLowerCase().includes(normalizedQuery));
  }, [query, renderItems]);

  if (searchable) {
    return (
      <View style={containerStyle}>
        {label ? (
          <KuralText variant="caption" style={globalStyles.fieldLabel}>
            {label}
          </KuralText>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled, expanded: isOpen }}
          disabled={disabled}
          onPress={() => setIsOpen(true)}
          style={[
            globalStyles.pickerWrapper,
            disabled && globalStyles.disabledPicker,
            { borderColor: selectedValue ? theme.colors.primary : theme.colors.surface },
          ]}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12 }}
          >
            <KuralText variant="bodyNormal">{selectedItem?.label || placeholder}</KuralText>
            <ChevronDown size={18} color={theme.colors.primary} />
          </View>
        </Pressable>
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 20 }}
            onPress={() => setIsOpen(false)}
          >
            <Pressable
              accessibilityRole="menu"
              onPress={(event) => event.stopPropagation()}
              style={{
                maxHeight: '80%',
                backgroundColor: theme.colors.surfaceElevated,
                borderRadius: theme.layout.borderRadius.large,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                gap: 12,
              }}
            >
              <TextInput
                autoFocus
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={theme.colors.disabledText}
                accessibilityLabel={searchPlaceholder}
                style={globalStyles.inputField}
              />
              <FlatList
                keyboardShouldPersistTaps="handled"
                data={filteredItems}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                renderItem={({ item, index }) => (
                  <Pressable
                    accessibilityRole="menuitem"
                    onPress={() => {
                      onValueChange(item.value, index);
                      setQuery('');
                      setIsOpen(false);
                    }}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.colors.border,
                    }}
                  >
                    <KuralText variant="bodyNormal">{item.label}</KuralText>
                  </Pressable>
                )}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsOpen(false)}
                style={{ alignSelf: 'flex-end', padding: 10 }}
              >
                <KuralText
                  variant="bodyNormal"
                  style={{ color: theme.colors.primary, fontWeight: '700' }}
                >
                  {closeLabel}
                </KuralText>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    );
  }

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
          accessibilityLabel={label}
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
