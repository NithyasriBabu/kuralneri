import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { KuralSegmentedControl } from '../KuralSegmentedControl';

jest.mock('src/theme/ThemeContextProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        accent: '#ddd',
        surface: '#fff',
        textPrimary: '#111',
        textSecondary: '#555',
      },
      layout: {
        borderRadius: { medium: 8 },
        isWideScreen: false,
        minHeights: { button: 48 },
        screenWidth: 390,
      },
      typography: {
        fonts: { english: 'Inter', tamil: 'Tamil' },
        sizes: { bodyNormal: 15, caption: 12 },
      },
    },
  }),
}));

it('stacks multi-option segmented controls in one column on small screens', () => {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <KuralSegmentedControl
        options={[
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
          { label: 'Three', value: 'three' },
        ]}
        selected="one"
        onSelect={jest.fn()}
      />,
    );
  });

  const optionButtons = renderer.root.findAll(
    (node) => typeof node.props.onPress === 'function' && node.props.style?.flexBasis === '100%',
  );
  expect(optionButtons).toHaveLength(3);
  for (const button of optionButtons) {
    expect(button.props.style.flexBasis).toBe('100%');
    expect(button.props.style.minWidth).toBe('100%');
  }
  act(() => renderer.unmount());
});

it('can shrink short options to their text content', () => {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <KuralSegmentedControl
        options={[
          { label: 'S', value: 'small' },
          { label: 'M', value: 'medium' },
          { label: 'L', value: 'large' },
          { label: 'XL', value: 'xlarge' },
        ]}
        selected="medium"
        onSelect={jest.fn()}
        shrinkToContent
      />,
    );
  });

  const optionButtons = renderer.root.findAll(
    (node) => typeof node.props.onPress === 'function' && node.props.style?.flexBasis === 'auto',
  );
  expect(optionButtons).toHaveLength(4);
  act(() => renderer.unmount());
});
