import { KuralSegmentedControl, KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { InputItem } from 'src/components/common/InputItem';
import { FONT_SIZE_MULTIPLIERS, FontSizeScale } from 'src/types/settings';

export interface FontSizeInputProps {
  label: string;
  helperText?: string;
  options: KuralSegmentedOption<FontSizeScale>[];
  selected: FontSizeScale;
  onSelect: (value: FontSizeScale) => void;
}

export function FontSizeInput({ label, helperText, options, selected, onSelect }: FontSizeInputProps) {
  return (
    <InputItem label={label} helperText={helperText}>
      <KuralSegmentedControl
        options={options}
        selected={selected}
        onSelect={onSelect}
        shrinkToContent
        optionFontSizes={{
          small: Math.round(12 * FONT_SIZE_MULTIPLIERS.small),
          medium: Math.round(12 * FONT_SIZE_MULTIPLIERS.medium),
          large: Math.round(12 * FONT_SIZE_MULTIPLIERS.large),
          xlarge: Math.round(12 * FONT_SIZE_MULTIPLIERS.xlarge),
        }}
      />
    </InputItem>
  );
}
