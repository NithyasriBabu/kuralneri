import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';

import { TabConfig, TabType } from 'src/types/types';
import { navStyles } from 'src/styles/styles';

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
        return <Text>Fav</Text>;
      case TabType.Learn:
        return <Text>Learn</Text>;
      case TabType.Guru:
        return <Text>Guru</Text>;
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
          style={[navStyles.tabButton, isActive && navStyles.activeTabButton]}
          onPress={() => handleTabPress(tab.id)}
        >
          <Text style={{ fontSize: 16, opacity: isActive ? 1 : 0.7 }}>{tab.icon}</Text>
          <Text style={[navStyles.tabText, isActive && navStyles.activeTabText]}>{tab.label}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#344E41' }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {isWidescreen && (
        <View style={[navStyles.navbarContainer, navStyles.topPlacement]}>
          {renderNavigationLinks()}
        </View>
      )}

      <View style={navStyles.canvasWrapper}>
        <View style={navStyles.fullWidthColumn}>{renderActiveScreen()}</View>
      </View>

      {!isWidescreen && (
        <View style={[navStyles.navbarContainer, navStyles.bottomPlacement]}>
          {renderNavigationLinks()}
        </View>
      )}
    </SafeAreaView>
  );
}
