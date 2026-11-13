import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  type HostInstance,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';

import { KuralText } from 'src/components/common/KuralText';
import { useTranslation } from 'src/content/translation';
import { useTheme } from 'src/theme/ThemeContextProvider';

export interface DropdownItem {
  label: string;
  value: string | number;
}

interface DropdownAnchor {
  height: number;
  width: number;
  x: number;
  y: number;
}

interface KuralDropdownProps {
  label?: string;
  items: DropdownItem[];
  selectedValue: string | number;
  onValueChange: (itemValue: string | number, itemIndex: number) => void;
  placeholder?: string;
  placeholderValue?: string | number;
  disabled?: boolean;
  containerStyle?: ViewStyle;
}

const VIEWPORT_MARGIN = 8;
const MENU_GAP = 4;
const MAX_MENU_HEIGHT = 320;
const OPTION_HEIGHT = 48;

export const KuralDropdown: React.FC<KuralDropdownProps> = ({
  label,
  items,
  selectedValue,
  onValueChange,
  placeholder = '',
  placeholderValue = '',
  disabled = false,
  containerStyle,
}) => {
  const { height: viewportHeight, width: viewportWidth } = useWindowDimensions();
  const { theme, globalStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'common');
  const fieldRef = useRef<HostInstance>(null);
  const [anchor, setAnchor] = useState<DropdownAnchor | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const options = useMemo<DropdownItem[]>(
    () =>
      placeholder ? [{ label: placeholder, value: placeholderValue }, ...items] : items,
    [items, placeholder, placeholderValue],
  );
  const selectedItem = options.find((item) => item.value === selectedValue);
  const selectedLabel = selectedItem?.label ?? placeholder;

  const openDropdown = () => {
    if (disabled) return;
    setIsOpen(true);
    fieldRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
    });
  };

  const closeDropdown = () => setIsOpen(false);

  const selectOption = (item: DropdownItem, index: number) => {
    onValueChange(item.value, index);
    closeDropdown();
  };

  const desiredMenuHeight = Math.min(MAX_MENU_HEIGHT, options.length * OPTION_HEIGHT + 2);
  const availableBelow = anchor
    ? viewportHeight - anchor.y - anchor.height - MENU_GAP - VIEWPORT_MARGIN
    : 0;
  const availableAbove = anchor ? anchor.y - MENU_GAP - VIEWPORT_MARGIN : 0;
  const opensAbove = availableBelow < Math.min(180, desiredMenuHeight) && availableAbove > availableBelow;
  const menuMaxHeight = Math.max(
    OPTION_HEIGHT,
    Math.min(desiredMenuHeight, opensAbove ? availableAbove : availableBelow),
  );
  const menuWidth = anchor
    ? Math.min(anchor.width, viewportWidth - VIEWPORT_MARGIN * 2)
    : 0;
  const menuLeft = anchor
    ? Math.min(
        Math.max(anchor.x, VIEWPORT_MARGIN),
        viewportWidth - menuWidth - VIEWPORT_MARGIN,
      )
    : 0;
  const menuTop = anchor
    ? opensAbove
      ? Math.max(VIEWPORT_MARGIN, anchor.y - menuMaxHeight - MENU_GAP)
      : anchor.y + anchor.height + MENU_GAP
    : 0;

  return (
    <View style={containerStyle}>
      {label ? (
        <KuralText
          variant="caption"
          style={[globalStyles.fieldLabel, disabled && globalStyles.disabledLabel]}
        >
          {label}
        </KuralText>
      ) : null}

      <View ref={fieldRef} collapsable={false}>
        <Pressable
          onPress={isOpen ? closeDropdown : openDropdown}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled, expanded: isOpen }}
          style={({ pressed }) => [
            globalStyles.dropdownField,
            isOpen && globalStyles.dropdownFieldOpen,
            disabled && globalStyles.dropdownFieldDisabled,
            pressed && !disabled && globalStyles.dropdownFieldPressed,
          ]}
        >
          <KuralText
            numberOfLines={1}
            style={[
              globalStyles.dropdownFieldText,
              selectedItem?.value === placeholderValue && globalStyles.pickerPlaceholderText,
            ]}
          >
            {selectedLabel}
          </KuralText>
          {isOpen ? (
            <ChevronUp size={18} color={theme.colors.primary} />
          ) : (
            <ChevronDown size={18} color={theme.colors.primary} />
          )}
        </Pressable>
      </View>

      <Modal
        visible={isOpen && anchor !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeDropdown}
      >
        <View style={globalStyles.dropdownOverlay} onAccessibilityEscape={closeDropdown}>
          <Pressable
            style={globalStyles.dropdownBackdrop}
            onPress={closeDropdown}
            accessibilityLabel={t('closeDropdown')}
          />
          <View
            style={[
              globalStyles.dropdownMenu,
              {
                left: menuLeft,
                maxHeight: menuMaxHeight,
                top: menuTop,
                width: menuWidth,
              },
            ]}
          >
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              {options.map((item, index) => {
                const isSelected = item.value === selectedValue;
                return (
                  <Pressable
                    key={`${String(item.value)}-${index}`}
                    onPress={() => selectOption(item, index)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      globalStyles.dropdownOption,
                      index > 0 && globalStyles.dropdownOptionBorder,
                      isSelected && globalStyles.dropdownOptionSelected,
                      pressed && globalStyles.dropdownOptionPressed,
                    ]}
                  >
                    <KuralText
                      numberOfLines={2}
                      style={[
                        globalStyles.dropdownOptionText,
                        isSelected && globalStyles.dropdownOptionSelectedText,
                      ]}
                    >
                      {item.label}
                    </KuralText>
                    {isSelected ? <Check size={18} color={theme.colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};
