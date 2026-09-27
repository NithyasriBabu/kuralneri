/** @jest-environment jsdom */
import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { Platform } from 'react-native';
import { useNavigatorController } from '../useNavigatorController';
import { TabType } from 'src/types/types';

let mockGuruEnabled = false;
jest.mock('src/config/featureFlags', () => ({ isGuruEnabled: () => mockGuruEnabled }));
jest.mock('src/context/SettingsContext', () => ({
  useSettings: () => ({
    settings: { langToggles: { navLabels: { tamil: false, english: true } } },
  }),
}));
jest.mock('src/content/translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('src/theme/ThemeContextProvider', () => ({
  useTheme: () => ({ theme: { layout: { isWideScreen: false, screenWidth: 390 } } }),
}));

let controller: ReturnType<typeof useNavigatorController>;
let renderer: ReactTestRenderer;
function Harness(): null {
  controller = useNavigatorController();
  return null;
}

beforeEach(() => {
  mockGuruEnabled = false;
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
  window.history.replaceState(null, '', '/#/HOME');
});
afterEach(() => {
  act(() => renderer?.unmount());
});

it('hides Guru and redirects an initial direct link when disabled', () => {
  window.history.replaceState(null, '', '/#/GURU');
  act(() => {
    renderer = create(<Harness />);
  });
  expect(controller.navTabs.some((tab) => tab.id === TabType.Guru)).toBe(false);
  expect(controller.routeState).toEqual({ kind: 'tab', tabId: TabType.Home });
  expect(window.location.hash).toBe('#/HOME');
});

it('blocks later hash navigation and programmatic navigation to disabled Guru', () => {
  act(() => {
    renderer = create(<Harness />);
  });
  act(() => {
    window.history.replaceState(null, '', '/#/GURU');
    window.dispatchEvent(new Event('hashchange'));
  });
  expect(window.location.hash).toBe('#/HOME');
  act(() => controller.handleTabPress(TabType.Guru));
  expect(controller.routeState).toEqual({ kind: 'tab', tabId: TabType.Home });
  act(() => controller.handleKuralPress(423));
  expect(controller.routeState).toEqual({ kind: 'kural', kuralId: 423 });
});

it('retains experimental Guru when explicitly enabled', () => {
  mockGuruEnabled = true;
  window.history.replaceState(null, '', '/#/GURU');
  act(() => {
    renderer = create(<Harness />);
  });
  expect(controller.navTabs.some((tab) => tab.id === TabType.Guru)).toBe(true);
  expect(controller.routeState).toEqual({ kind: 'tab', tabId: TabType.Guru });
});

it('blocks disabled Guru on native too', () => {
  Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
  act(() => {
    renderer = create(<Harness />);
  });
  act(() => controller.handleTabPress(TabType.Guru));
  expect(controller.routeState).toEqual({ kind: 'tab', tabId: TabType.Home });
});
