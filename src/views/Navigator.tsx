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
  { id: TabType.Home, label: 'Home', tamilLabel: 'முகப்பு', icon: '🏠' },
  { id: TabType.Explore, label: 'Explore', tamilLabel: 'தேடல்', icon: '🔍' },
  { id: TabType.Bookmarks, label: 'Bookmarks', tamilLabel: 'சேமிப்பு', icon: '🔖' },
  { id: TabType.Learn, label: 'Learn', tamilLabel: 'கற்றல்', icon: '📈' },
  { id: TabType.Guru, label: 'Guru', tamilLabel: 'குரு', icon: '🤖' },
  { id: TabType.Settings, label: 'Settings', tamilLabel: 'அமைப்பு', icon: '⚙' },
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

  const getTabLabel = (tab: TabConfig): string | null => {
    const toggle = settings.langToggles.navLabels;
    if (toggle.tamil && toggle.english) return `${tab.tamilLabel} / ${tab.label}`;
    if (toggle.tamil) return tab.tamilLabel;
    if (toggle.english) return tab.label;
    return null;
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
          {(() => {
            const label = getTabLabel(tab);
            return label ? (
              <KuralText
                variant="caption"
                isTamil={
                  settings.langToggles.navLabels.tamil && !settings.langToggles.navLabels.english
                }
                style={[componentStyles.navTabText, isActive && componentStyles.navTabTextActive]}
              >
                {label}
              </KuralText>
            ) : null;
          })()}
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
