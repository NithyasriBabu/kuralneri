import { Platform } from 'react-native';

export const DEV_ROOT_CRASH_PATH = '#/__dev__/crash/root';
export const DEV_SCREEN_CRASH_PATH = '#/__dev__/crash/screen';

export type DevCrashKind = 'root' | 'screen';

export function getDevCrashKind(): DevCrashKind | null {
  if (!__DEV__ || Platform.OS !== 'web' || typeof window === 'undefined') return null;

  const hash = window.location.hash.replace(/\/+$/, '') || '#/';
  if (hash === DEV_ROOT_CRASH_PATH) return 'root';
  if (hash === DEV_SCREEN_CRASH_PATH) return 'screen';
  return null;
}

export function isDevCrashRoute(kind: DevCrashKind): boolean {
  return getDevCrashKind() === kind;
}

export function navigateToHomeRoute(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.location.hash = '#/HOME';
}
