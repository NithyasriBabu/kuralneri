import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ThemeProvider, useTheme } from '../ThemeContextProvider';

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
  let renderer: ReactTestRenderer;
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
