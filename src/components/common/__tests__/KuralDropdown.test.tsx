import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Text } from 'react-native';

import { KuralDropdown } from '../KuralDropdown';

jest.mock('src/components/common/KuralText', () => ({
  KuralText: require('react-native').Text,
}));
jest.mock('src/content/translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('react-native/Libraries/Modal/Modal', () => ({
  __esModule: true,
  default: ({ children, visible }: { children: React.ReactNode; visible: boolean }) =>
    visible ? children : null,
}));
jest.mock('lucide-react-native', () => ({
  Check: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
}));
jest.mock('src/theme/ThemeContextProvider', () => ({
  useTheme: () => ({
    theme: { colors: { primary: '#344E41' } },
    globalStyles: {
      disabledLabel: {},
      dropdownBackdrop: {},
      dropdownField: {},
      dropdownFieldDisabled: {},
      dropdownFieldOpen: {},
      dropdownFieldPressed: {},
      dropdownFieldText: {},
      dropdownMenu: {},
      dropdownOption: {},
      dropdownOptionBorder: {},
      dropdownOptionPressed: {},
      dropdownOptionSelected: {},
      dropdownOptionSelectedText: {},
      dropdownOptionText: {},
      dropdownOverlay: {},
      fieldLabel: {},
      pickerPlaceholderText: {},
    },
  }),
}));

let renderer: ReactTestRenderer;

afterEach(() => {
  act(() => renderer?.unmount());
});

it('shows the selected option and opens from its anchored field', () => {
  const onValueChange = jest.fn();
  act(() => {
    renderer = create(
      <KuralDropdown
        accessibilityLabel="Chapter"
        placeholder="All Chapters"
        placeholderValue={0}
        items={[
          { label: 'First Chapter', value: 1 },
          { label: 'Second Chapter', value: 2 },
        ]}
        selectedValue={2}
        onValueChange={onValueChange}
      />,
      {
        createNodeMock: (element: React.ReactElement) =>
          (element.props as { collapsable?: boolean }).collapsable === false
            ? {
                measureInWindow: (
                  callback: (x: number, y: number, width: number, height: number) => void,
                ) => callback(10, 20, 240, 48),
              }
            : {},
      },
    );
  });

  expect(renderer.root.findAllByType(Text).some((node) => node.props.children === 'Second Chapter'))
    .toBe(true);

  const trigger = renderer.root.findAll(
    (node) => node.props.accessibilityLabel === 'Chapter' && typeof node.props.onPress === 'function',
  )[0];
  act(() => trigger.props.onPress());
  expect(
    renderer.root.findAll(
      (node) => node.props.accessibilityLabel === 'Chapter' && typeof node.props.onPress === 'function',
    )[0].props.accessibilityState,
  ).toEqual({ disabled: false, expanded: true });
  expect(onValueChange).not.toHaveBeenCalled();
});
