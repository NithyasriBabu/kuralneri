import { Platform } from 'react-native';

import { TabType } from 'src/types/types';

export type RouteState = { kind: 'tab'; tabId: TabType } | { kind: 'kural'; kuralId: number };

export const DEFAULT_WEB_TAB: TabType = TabType.Home;
export const WEB_ROUTE_PREFIX = '#/';

function normalizeRouteValue(value: string): string {
  return value.trim().replace(/^#?\/+|\/+$/g, '');
}

export function parseWebRoute(hashValue: string): RouteState {
  const route = normalizeRouteValue(hashValue);
  const segments = route ? route.split('/') : [];
  const head = segments[0]?.toUpperCase();

  if (head === 'KURAL' && segments[1]) {
    const kuralId = Number(segments[1]);
    if (Number.isFinite(kuralId) && kuralId > 0) {
      return { kind: 'kural', kuralId };
    }
    return { kind: 'tab', tabId: DEFAULT_WEB_TAB };
  }

  const candidate = head as TabType | undefined;
  if (candidate && Object.values(TabType).includes(candidate)) {
    return { kind: 'tab', tabId: candidate };
  }

  return { kind: 'tab', tabId: DEFAULT_WEB_TAB };
}

export function formatWebRoute(routeState: RouteState): string {
  if (routeState.kind === 'kural') {
    return `${WEB_ROUTE_PREFIX}KURAL/${routeState.kuralId}`;
  }

  return `${WEB_ROUTE_PREFIX}${routeState.tabId}`;
}

export function getDefaultWebRoute(): string {
  return `${WEB_ROUTE_PREFIX}${DEFAULT_WEB_TAB}`;
}

export function isSupportedWebRouteHash(hashValue: string): boolean {
  const route = normalizeRouteValue(hashValue);
  const segments = route ? route.split('/') : [];
  const head = segments[0]?.toUpperCase();

  if (!head) return false;
  if (head === 'KURAL') {
    const kuralId = Number(segments[1]);
    return Number.isFinite(kuralId) && kuralId > 0;
  }

  return Object.values(TabType).includes(head as TabType);
}

export function isWebRoutePlatform(): boolean {
  return Platform.OS === 'web';
}
