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

it('distributes compact options evenly across the control', () => {
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
    (node) => typeof node.props.onPress === 'function' && node.props.style?.flexBasis === 0,
  );
  expect(optionButtons).toHaveLength(4);
  for (const button of optionButtons) {
    expect(button.props.style.flexGrow).toBe(1);
    expect(button.props.style.minWidth).toBe(0);
  }
  act(() => renderer.unmount());
});

it('renders a font-specific preview when an option provides one', () => {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <KuralSegmentedControl
        options={[
          {
            label: 'Mukta Malar',
            value: 'mukta',
          },
        ]}
        selected="mukta"
        onSelect={jest.fn()}
        renderOption={(option) => (
          <span style={{ fontFamily: 'MuktaMalar-Regular' }}>{option.label}</span>
        )}
      />,
    );
  });

  const preview = renderer.root.findByType('span');
  expect(preview.props.style).toEqual({ fontFamily: 'MuktaMalar-Regular' });
  act(() => renderer.unmount());
});
