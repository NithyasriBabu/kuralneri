import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabConfig, TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { ThemeToggle } from 'src/components/common/ThemeToggle';

import KuralListView from 'src/views/KuralListView';
import BookmarksView from 'src/views/BookmarksView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';
import KuralDetailView from 'src/views/KuralDetailView';

const TABS: TabConfig[] = [
  { id: TabType.Home, label: 'Home', icon: '🏠' },
  { id: TabType.Explore, label: 'Explore', icon: '🔍' },
  { id: TabType.Bookmarks, label: 'Bookmarks', icon: '🔖' },
  { id: TabType.Learn, label: 'Learn', icon: '📈' },
  { id: TabType.Guru, label: 'Guru', icon: '🤖' },
];

type RouteState = { kind: 'tab'; tabId: TabType } | { kind: 'kural'; kuralId: number };

const DEFAULT_TAB: TabType = TabType.Home;

function parsePath(pathname: string): RouteState {
  const path = pathname.replace(/^\/+|\/+$/g, '');
  const segments = path ? path.split('/') : [];

  if (segments[0]?.toUpperCase() === 'KURAL' && segments[1]) {
    const kuralId = Number(segments[1]);
    if (Number.isFinite(kuralId) && kuralId > 0) {
      return { kind: 'kural', kuralId };
    }
  }

  const candidate = segments[0]?.toUpperCase() as TabType | undefined;
  if (candidate && TABS.some((t) => t.id === candidate)) {
    return { kind: 'tab', tabId: candidate };
  }

  return { kind: 'tab', tabId: DEFAULT_TAB };
}

export default function TabNavigator() {
  const { width } = useWindowDimensions();
  const isWidescreen = width > 768;
  const { componentStyles } = useTheme();

  const initialRoute: RouteState =
    Platform.OS === 'web' && typeof window !== 'undefined'
      ? parsePath(window.location.pathname)
      : { kind: 'tab', tabId: DEFAULT_TAB };

  const [activeTab, setActiveTab] = useState<TabType>(
    initialRoute.kind === 'kural' ? TabType.Explore : initialRoute.tabId,
  );
  const [routeState, setRouteState] = useState<RouteState>(initialRoute);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 1. Read initial browser path on cold boot and hydrate the in-app route state.
    const initialRoute = parsePath(window.location.pathname);
    setRouteState(initialRoute);
    setActiveTab(initialRoute.kind === 'kural' ? TabType.Explore : initialRoute.tabId);

    // 2. Handle browser Back/Forward arrow buttons
    const handlePopState = () => {
      const nextRoute = parsePath(window.location.pathname);
      setRouteState(nextRoute);
      setActiveTab(nextRoute.kind === 'kural' ? TabType.Explore : nextRoute.tabId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler for changing tabs
  const handleTabPress = (tabId: TabType) => {
    setActiveTab(tabId);
    setRouteState({ kind: 'tab', tabId });

    // Update web address URL bar without forcing a hard page reload
    if (Platform.OS === 'web') {
      window.history.pushState(null, '', `/${tabId}`);
    }
  };

  const handleKuralPress = (kuralId: number) => {
    setActiveTab(TabType.Explore);
    setRouteState({ kind: 'kural', kuralId });

    if (Platform.OS === 'web') {
      window.history.pushState(null, '', `/KURAL/${kuralId}`);
    }
  };

  const handleDetailBack = () => {
    handleTabPress(TabType.Explore);
  };

  const renderActiveScreen = () => {
    if (routeState.kind === 'kural') {
      return <KuralDetailView kuralId={routeState.kuralId} onBack={handleDetailBack} />;
    }

    switch (activeTab) {
      case TabType.Home:
        return <KuralOfTheDayView />;
      case TabType.Explore:
        return <KuralListView onKuralPress={handleKuralPress} />;
      case TabType.Bookmarks:
        return <BookmarksView onKuralPress={handleKuralPress} />;
      case TabType.Learn:
        return (
          <FeaturePlaceholder
            icon="📈"
            title="Learn"
            subtitle="Study Path"
            body="This area is reserved for future learning tools like topic tags, patterns, and guided study flows."
          />
        );
      case TabType.Guru:
        return (
          <FeaturePlaceholder
            icon="🤖"
            title="Guru"
            subtitle="Commentary Companion"
            body="The guided interpreter experience will live here once the reasoning and retrieval layers are connected."
          />
        );
      default:
        return <KuralOfTheDayView />;
    }
  };

  const renderNavigationLinks = () => {
    return TABS.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <TouchableOpacity
          key={tab.id}
          activeOpacity={1}
          style={[componentStyles.navTabButton, isActive && componentStyles.navTabButtonActive]}
          onPress={() => handleTabPress(tab.id)}
        >
          <KuralText
            variant="bodyNormal"
            style={[componentStyles.navTabIcon, { opacity: isActive ? 1 : 0.7 }]}
          >
            {tab.icon}
          </KuralText>
          <KuralText
            variant="caption"
            style={[componentStyles.navTabText, isActive && componentStyles.navTabTextActive]}
          >
            {tab.label}
          </KuralText>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={componentStyles.navShell} edges={['top', 'left', 'right', 'bottom']}>
      <View style={componentStyles.navToggleDock}>
        <ThemeToggle />
      </View>

      {isWidescreen && (
        <View style={[componentStyles.navNavbarContainer, componentStyles.navTopPlacement]}>
          {renderNavigationLinks()}
        </View>
      )}

      <View style={componentStyles.navCanvasWrapper}>
        <View style={componentStyles.navFullWidthColumn}>{renderActiveScreen()}</View>
      </View>

      {!isWidescreen && (
        <View style={[componentStyles.navNavbarContainer, componentStyles.navBottomPlacement]}>
          {renderNavigationLinks()}
        </View>
      )}
    </SafeAreaView>
  );
}
