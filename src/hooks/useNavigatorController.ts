import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { useSettings } from 'src/context/SettingsContext';
import { useTranslation } from 'src/content/translation';
import { isGuruEnabled } from 'src/config/featureFlags';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { COMPACT_NAV_BREAKPOINT } from 'src/theme/layout.constants';
import { TabType } from 'src/types/types';
import {
  DEFAULT_WEB_TAB,
  formatWebRoute,
  isSupportedWebRouteHash,
  parseWebRoute,
  type RouteState,
} from 'src/data/webRoutes';

const TABS = [
  { id: TabType.Home, titleKey: 'homeTitle', icon: '🏠' },
  { id: TabType.Explore, titleKey: 'exploreTitle', icon: '🔍' },
  { id: TabType.Bookmarks, titleKey: 'bookmarksTitle', icon: '🔖' },
  { id: TabType.Learn, titleKey: 'learnTitle', icon: '📈' },
  { id: TabType.Guru, titleKey: 'guruTitle', icon: '🤖' },
  { id: TabType.Settings, titleKey: 'settingsTitle', icon: '⚙' },
] as const;

function isTabAvailable(tabId: TabType): boolean {
  return tabId !== TabType.Guru || isGuruEnabled();
}

function sanitizeRouteState(routeState: RouteState): RouteState {
  if (routeState.kind === 'tab' && !isTabAvailable(routeState.tabId)) {
    return { kind: 'tab', tabId: DEFAULT_WEB_TAB };
  }

  return routeState;
}

interface NavigatorTabViewModel {
  id: TabType;
  icon: string;
  label: string;
  tooltip: string;
  accessibilityLabel: string;
  isActive: boolean;
  isTamilLabel: boolean;
}

function getInitialRoute(): RouteState {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return parseWebRoute(window.location.hash);
  }

  return { kind: 'tab', tabId: DEFAULT_WEB_TAB };
}

export function useNavigatorController() {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { t } = useTranslation('uiChrome', 'navigation');
  const [routeState, setRouteState] = useState<RouteState>(() =>
    sanitizeRouteState(getInitialRoute()),
  );

  const activeTab = routeState.kind === 'kural' ? TabType.Explore : routeState.tabId;
  const isWidescreen = theme.layout.isWideScreen;
  const isCompactNavigation = theme.layout.screenWidth < COMPACT_NAV_BREAKPOINT;
  const navLabelToggle = settings.langToggles.navLabels;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const syncRoute = () => {
      const rawRoute = parseWebRoute(window.location.hash);
      const nextRoute = sanitizeRouteState(rawRoute);
      setRouteState(nextRoute);

      const wasSanitized =
        rawRoute.kind !== nextRoute.kind ||
        (rawRoute.kind === 'tab' && nextRoute.kind === 'tab' && rawRoute.tabId !== nextRoute.tabId);

      if (!window.location.hash || !isSupportedWebRouteHash(window.location.hash) || wasSanitized) {
        window.history.replaceState(null, '', formatWebRoute(nextRoute));
      }
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const handleTabPress = useCallback((tabId: TabType) => {
    if (!isTabAvailable(tabId)) {
      setRouteState({ kind: 'tab', tabId: DEFAULT_WEB_TAB });
      if (Platform.OS === 'web') {
        window.location.hash = formatWebRoute({ kind: 'tab', tabId: DEFAULT_WEB_TAB });
      }
      return;
    }

    setRouteState({ kind: 'tab', tabId });
    if (Platform.OS === 'web') {
      window.location.hash = formatWebRoute({ kind: 'tab', tabId });
    }
  }, []);

  const handleKuralPress = useCallback((kuralId: number) => {
    setRouteState({ kind: 'kural', kuralId });
    if (Platform.OS === 'web') {
      window.location.hash = formatWebRoute({ kind: 'kural', kuralId });
    }
  }, []);

  const handleDetailBack = useCallback(() => {
    handleTabPress(TabType.Explore);
  }, [handleTabPress]);

  const navTabs = useMemo<NavigatorTabViewModel[]>(
    () =>
      TABS.filter((tab) => isTabAvailable(tab.id)).map((tab) => {
        const label = t(tab.titleKey);
        const showLabel = !isCompactNavigation && (navLabelToggle.tamil || navLabelToggle.english);
        return {
          id: tab.id,
          icon: tab.icon,
          label: showLabel ? label : '',
          tooltip: label,
          accessibilityLabel: label,
          isActive: activeTab === tab.id,
          isTamilLabel: navLabelToggle.tamil && !navLabelToggle.english,
        };
      }),
    [activeTab, isCompactNavigation, navLabelToggle.english, navLabelToggle.tamil, t],
  );

  return {
    activeTab,
    handleDetailBack,
    handleKuralPress,
    handleTabPress,
    isCompactNavigation,
    isWidescreen,
    screenWidth: theme.layout.screenWidth,
    navTabs,
    routeState,
  };
}
