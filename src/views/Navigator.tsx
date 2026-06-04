import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabConfig, TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';

import KuralListView from 'src/views/KuralListView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';

const TABS: TabConfig[] = [
  { id: TabType.Home, label: 'Home', icon: '🏠' },
  { id: TabType.Explore, label: 'Explore', icon: '🔍' },
  { id: TabType.Favorites, label: 'Favorites', icon: '❤️' },
  { id: TabType.Learn, label: 'Learn', icon: '📈' },
  { id: TabType.Guru, label: 'Guru', icon: '🤖' },
];

export default function TabNavigator() {
  const { width } = useWindowDimensions();
  const isWidescreen = width > 768;
  const { componentStyles } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>(TabType.Home);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // 1. Read initial browser path on cold boot (e.g., myapp.com/explore -> opens Explore tab)
    const currentPath = window.location.pathname.replace('/', '') as TabType;
    if (TABS.some((t) => t.id === currentPath)) {
      setActiveTab(currentPath);
    }

    // 2. Handle browser Back/Forward arrow buttons
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '') as TabType;
      if (TABS.some((t) => t.id === path)) {
        setActiveTab(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler for changing tabs
  const handleTabPress = (tabId: TabType) => {
    setActiveTab(tabId);

    // Update web address URL bar without forcing a hard page reload
    if (Platform.OS === 'web') {
      window.history.pushState(null, '', `/${tabId}`);
    }
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case TabType.Home:
        return <KuralOfTheDayView />;
      case TabType.Explore:
        return <KuralListView />;
      case TabType.Favorites:
        return (
          <FeaturePlaceholder
            icon="❤️"
            title="Favorites"
            subtitle="Saved Verses"
            body="This tab will hold the kurals you want to revisit, annotate, or keep close as personal anchors."
          />
        );
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
