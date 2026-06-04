import React from 'react';
import { TextInput, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';

interface KuralInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  onClear?: () => void;
  value: string;
}

export const KuralInput: React.FC<KuralInputProps> = ({
  containerStyle,
  onClear,
  value,
  ...props
}) => {
  const { globalStyles, theme } = useTheme();

  return (
    <TextInput
      style={[globalStyles.inputField, containerStyle]}
      placeholderTextColor={theme.colors.disabledText}
      value={value}
      {...props}
    />
  );
};
