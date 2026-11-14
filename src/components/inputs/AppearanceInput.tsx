import { KuralSegmentedControl, KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { InputItem } from 'src/components/common/InputItem';
import { ThemeMode } from 'src/types/settings';

export interface AppearanceInputProps {
  label: string;
  helperText?: string;
  options: KuralSegmentedOption<ThemeMode>[];
  selected: ThemeMode;
  onSelect: (value: ThemeMode) => void;
}

export function AppearanceInput({ label, helperText, options, selected, onSelect }: AppearanceInputProps) {
  return (
    <InputItem label={label} helperText={helperText}>
      <KuralSegmentedControl options={options} selected={selected} onSelect={onSelect} />
    </InputItem>
  );
}
