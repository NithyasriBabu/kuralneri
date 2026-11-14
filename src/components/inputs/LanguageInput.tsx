import { KuralSegmentedControl, KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { InputItem } from 'src/components/common/InputItem';
import { TranslationLocale } from 'src/types/settings';

export interface LanguageInputProps {
  label: string;
  helperText?: string;
  options: KuralSegmentedOption<TranslationLocale>[];
  selected: TranslationLocale;
  onSelect: (value: TranslationLocale) => void;
}

export function LanguageInput({ label, helperText, options, selected, onSelect }: LanguageInputProps) {
  return (
    <InputItem label={label} helperText={helperText}>
      <KuralSegmentedControl options={options} selected={selected} onSelect={onSelect} />
    </InputItem>
  );
}
