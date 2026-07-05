import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { useSettings } from 'src/context/SettingsContext';
import { useTranslation } from 'src/content/translation';
import { useTheme } from 'src/theme/ThemeContextProvider';
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
  const [routeState, setRouteState] = useState<RouteState>(getInitialRoute);

  const activeTab = routeState.kind === 'kural' ? TabType.Explore : routeState.tabId;
  const isWidescreen = theme.layout.isWideScreen;
  const navLabelToggle = settings.langToggles.navLabels;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const syncRoute = () => {
      const nextRoute = parseWebRoute(window.location.hash);
      setRouteState(nextRoute);

      if (!window.location.hash || !isSupportedWebRouteHash(window.location.hash)) {
        window.history.replaceState(
          null,
          '',
          formatWebRoute({ kind: 'tab', tabId: DEFAULT_WEB_TAB }),
        );
      }
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  const handleTabPress = useCallback((tabId: TabType) => {
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
