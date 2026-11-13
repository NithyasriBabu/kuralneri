import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ThemeProvider, useTheme } from '../ThemeContextProvider';
import { KuralText } from 'src/components/common/KuralText';

let mockWidth = 390;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: mockWidth, height: 800, scale: 1, fontScale: 1 }),
}));
jest.mock('src/context/SettingsContext', () => {
  const { DEFAULT_SETTINGS } = jest.requireActual('src/types/settings');
  const updateSettings = jest.fn();
  return { useSettings: () => ({ settings: DEFAULT_SETTINGS, updateSettings }) };
});

it('updates layout width when resizing within the same breakpoint', () => {
  let width = 0;
  function Probe(): null {
    width = useTheme().theme.layout.screenWidth;
    return null;
  }
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
  });
  expect(width).toBe(390);
  mockWidth = 650;
  act(() => {
    renderer.update(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
  });
  expect(width).toBe(650);
  act(() => renderer.unmount());
});

it('keeps Tamil card line heights proportional to the selected text size', () => {
  let compactStyle: TextStyle = {};
  let cardStyle: TextStyle = {};
  function Probe(): null {
    const styles = useTheme().componentStyles;
    compactStyle = StyleSheet.flatten(styles.compactKuralTamil) ?? {};
    cardStyle = StyleSheet.flatten(styles.kuralCardTamil) ?? {};
    return null;
  }

  let renderer: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
  });

  expect(Number(compactStyle.lineHeight)).toBeGreaterThan(Number(compactStyle.fontSize) * 1.5);
  expect(Number(cardStyle.lineHeight)).toBeGreaterThan(Number(cardStyle.fontSize) * 1.5);
  act(() => renderer.unmount());
});

it('applies clipping-safe line height to both English and Tamil text', () => {
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <ThemeProvider>
        <KuralText style={{ fontSize: 20, lineHeight: 10 }}>English</KuralText>
        <KuralText isTamil style={{ fontSize: 20, lineHeight: 10 }}>
          தமிழ்
        </KuralText>
      </ThemeProvider>,
    );
  });

  const textNodes = renderer.root.findAllByType(Text);
  const englishStyle = StyleSheet.flatten(textNodes[0].props.style);
  const tamilStyle = StyleSheet.flatten(textNodes[1].props.style);
  expect(englishStyle.lineHeight).toBeGreaterThanOrEqual(29);
  expect(tamilStyle.lineHeight).toBeGreaterThanOrEqual(33);
  act(() => renderer.unmount());
});
