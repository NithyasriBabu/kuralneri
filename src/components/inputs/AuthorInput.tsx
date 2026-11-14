import { KuralSegmentedControl, KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import { InputItem } from 'src/components/common/InputItem';

export interface AuthorInputProps {
  label: string;
  helperText?: string;
  options: KuralSegmentedOption<string>[];
  selected: string;
  onSelect: (value: string) => void;
}

export function AuthorInput({ label, helperText, options, selected, onSelect }: AuthorInputProps) {
  return (
    <InputItem label={label} helperText={helperText}>
      <KuralSegmentedControl options={options} selected={selected} onSelect={onSelect} />
    </InputItem>
  );
}
