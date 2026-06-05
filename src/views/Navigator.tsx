import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { TabConfig, TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';

import KuralListView from 'src/views/KuralListView';
import BookmarksView from 'src/views/BookmarksView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';
import KuralDetailView from 'src/views/KuralDetailView';
import SettingsView from 'src/views/SettingsView';

const TABS: TabConfig[] = [
  { id: TabType.Home, label: 'Home', icon: '🏠' },
  { id: TabType.Explore, label: 'Explore', icon: '🔍' },
  { id: TabType.Bookmarks, label: 'Bookmarks', icon: '🔖' },
  { id: TabType.Learn, label: 'Learn', icon: '📈' },
  { id: TabType.Guru, label: 'Guru', icon: '🤖' },
  { id: TabType.Settings, label: 'Settings', icon: '⚙' },
];

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
  if (candidate && TABS.some((t) => t.id === candidate)) {
    return { kind: 'tab', tabId: candidate };
  }

  return { kind: 'tab', tabId: DEFAULT_TAB };
}

// ─── greeting banner ─────────────────────────────────────────────────────────

function GreetingBanner() {
  const { settings } = useSettings();
  const { theme } = useTheme();

  if (!settings.userName) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'மதிய வணக்கம்' : 'மாலை வணக்கம்';
  const greetingEn = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View
      style={{
        paddingHorizontal: theme.layout.screenPadding,
        paddingTop: 10,
        paddingBottom: 4,
      }}
    >
      <KuralText
        isTamil
        variant="bodyNormal"
        style={{ color: theme.colors.primary, fontWeight: '700' }}
      >
        {greeting}, {settings.userName}!
      </KuralText>
      <KuralText variant="caption" style={{ color: theme.colors.textSecondary }}>
        {greetingEn}, {settings.userName}!
      </KuralText>
    </View>
  );
}

// ─── navigator ───────────────────────────────────────────────────────────────

export default function TabNavigator() {
  const { width } = useWindowDimensions();
  const isWidescreen = width > 768;
  const { componentStyles } = useTheme();
  const { settings } = useSettings();

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

    const initial = parsePath(window.location.pathname);
    setRouteState(initial);
    setActiveTab(initial.kind === 'kural' ? TabType.Explore : initial.tabId);

    const handlePopState = () => {
      const next = parsePath(window.location.pathname);
      setRouteState(next);
      setActiveTab(next.kind === 'kural' ? TabType.Explore : next.tabId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabPress = (tabId: TabType) => {
    setActiveTab(tabId);
    setRouteState({ kind: 'tab', tabId });
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

  const handleDetailBack = () => handleTabPress(TabType.Explore);

  const renderActiveScreen = () => {
    if (routeState.kind === 'kural') {
      return <KuralDetailView kuralId={routeState.kuralId} onBack={handleDetailBack} />;
    }

    switch (activeTab) {
      case TabType.Home:
        return (
          <View style={{ flex: 1 }}>
            <GreetingBanner />
            <KuralOfTheDayView />
          </View>
        );
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
            body="Reserved for learning tools like topic tags, patterns, and guided study flows."
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
      case TabType.Settings:
        return <SettingsView />;
      default:
        return <KuralOfTheDayView />;
    }
  };

  // Resolve nav label based on langToggles.navLabels
  const getTabLabel = (tab: TabConfig): string => {
    const toggle = settings.langToggles.navLabels;
    if (toggle.english) return tab.label;
    // tamil-only: we don't have Tamil tab labels in the type yet, fall back to label
    return tab.label;
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
            {getTabLabel(tab)}
          </KuralText>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView style={componentStyles.navShell} edges={['top', 'left', 'right', 'bottom']}>
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
