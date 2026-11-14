import { ViewStyle } from 'react-native';

import { KuralDropdown } from 'src/components/common/KuralDropdown';
import { KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { InputItem } from 'src/components/common/InputItem';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { getColorSchemeSwatches } from 'src/theme/styles';
import { ColorScheme } from 'src/types/settings';

export interface ColorSchemeInputProps {
  label: string;
  helperText?: string;
  options: KuralSegmentedOption<ColorScheme>[];
  selected: ColorScheme;
  onSelect: (value: ColorScheme) => void;
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function ColorSchemeInput({
  label,
  helperText,
  options,
  selected,
  onSelect,
  accessibilityLabel,
  style,
}: ColorSchemeInputProps) {
  const { theme } = useTheme();
  return (
    <InputItem label={label} helperText={helperText} style={style}>
      <KuralDropdown
        accessibilityLabel={accessibilityLabel}
        items={options.map((option) => ({
          ...option,
          swatchColors: getColorSchemeSwatches(option.value, theme.dark ? 'dark' : 'light'),
        }))}
        selectedValue={selected}
        onValueChange={(value) => onSelect(value as ColorScheme)}
        showItemLabels={false}
      />
    </InputItem>
  );
}
