import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useSettings } from 'src/context/SettingsContext';
import { useTranslation } from 'src/content/translation';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabType } from 'src/types/types';

const TABS = [
  { id: TabType.Home, titleKey: 'homeTitle', icon: '🏠' },
  { id: TabType.Explore, titleKey: 'exploreTitle', icon: '🔍' },
  { id: TabType.Bookmarks, titleKey: 'bookmarksTitle', icon: '🔖' },
  { id: TabType.Learn, titleKey: 'learnTitle', icon: '📈' },
  { id: TabType.Guru, titleKey: 'guruTitle', icon: '🤖' },
  { id: TabType.Settings, titleKey: 'settingsTitle', icon: '⚙' },
] as const;

type RouteState = { kind: 'tab'; tabId: TabType } | { kind: 'kural'; kuralId: number };

const DEFAULT_TAB: TabType = TabType.Home;

function parsePath(pathname: string): RouteState {
  const path = pathname.replace(/^\/+|\/+$/g, '');
  const segments = path ? path.split('/') : [];

  if (segments[0]?.toUpperCase() === 'KURAL' && segments[1]) {
    const kuralId = Number(segments[1]);
    if (Number.isFinite(kuralId) && kuralId > 0) return { kind: 'kural', kuralId };
  }

  const candidate = segments[0]?.toUpperCase() as TabType | undefined;
  if (candidate && TABS.some((tab) => tab.id === candidate)) {
    return { kind: 'tab', tabId: candidate };
  }

  return { kind: 'tab', tabId: DEFAULT_TAB };
}

function getInitialRoute(): RouteState {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return parsePath(window.location.pathname);
  }

  return { kind: 'tab', tabId: DEFAULT_TAB };
}

export function useNavigatorController() {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { t } = useTranslation('uiChrome', 'navigation');
  const [routeState, setRouteState] = useState<RouteState>(getInitialRoute);

  const activeTab = routeState.kind === 'kural' ? TabType.Explore : routeState.tabId;
  const isWidescreen = theme.layout.isWideScreen;
  const navLabelToggle = settings.langToggles.navLabels;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const syncRoute = () => {
      setRouteState(parsePath(window.location.pathname));
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    return () => window.removeEventListener('popstate', syncRoute);
  }, []);

  const handleTabPress = useCallback((tabId: TabType) => {
    setRouteState({ kind: 'tab', tabId });
    if (Platform.OS === 'web') {
      window.history.pushState(null, '', `/${tabId}`);
    }
  }, []);

  const handleKuralPress = useCallback((kuralId: number) => {
    setRouteState({ kind: 'kural', kuralId });
    if (Platform.OS === 'web') {
      window.history.pushState(null, '', `/KURAL/${kuralId}`);
    }
  }, []);

  const handleDetailBack = useCallback(() => {
    handleTabPress(TabType.Explore);
  }, [handleTabPress]);

  const navTabs = TABS.map((tab) => {
    const label = navLabelToggle.tamil || navLabelToggle.english ? t(tab.titleKey) : null;
    return {
      id: tab.id,
      icon: tab.icon,
      label,
      isActive: activeTab === tab.id,
      isTamilLabel: navLabelToggle.tamil && !navLabelToggle.english,
    };
  });

  return {
    activeTab,
    handleDetailBack,
    handleKuralPress,
    handleTabPress,
    isWidescreen,
    screenWidth: theme.layout.screenWidth,
    navTabs,
    routeState,
  };
}
