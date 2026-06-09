import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { useTranslation } from 'src/content/translation';
import { useNavigatorController } from 'src/hooks/useNavigatorController';

import KuralListView from 'src/views/KuralListView';
import BookmarksView from 'src/views/BookmarksView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';
import KuralDetailView from 'src/views/KuralDetailView';
import SettingsView from 'src/views/SettingsView';

// ─── navigator ───────────────────────────────────────────────────────────────

export default function TabNavigator() {
  const { componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'navigation');
  const { handleDetailBack, handleKuralPress, handleTabPress, isWidescreen, navTabs, routeState } =
    useNavigatorController();

  const renderActiveScreen = () => {
    if (routeState.kind === 'kural') {
      return <KuralDetailView kuralId={routeState.kuralId} onBack={handleDetailBack} />;
    }

    switch (routeState.tabId) {
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
            title={t('learnTitle')}
            subtitle={t('learnSubtitle')}
            body={t('learnBody')}
          />
        );
      case TabType.Guru:
        return (
          <FeaturePlaceholder
            icon="🤖"
            title={t('guruTitle')}
            subtitle={t('guruSubtitle')}
            body={t('guruBody')}
          />
        );
      case TabType.Settings:
        return <SettingsView />;
      default:
        return <KuralOfTheDayView />;
    }
  };

  const renderNavigationLinks = () =>
    navTabs.map((tab) => (
      <TouchableOpacity
        key={tab.id}
        activeOpacity={1}
        style={[componentStyles.navTabButton, tab.isActive && componentStyles.navTabButtonActive]}
        onPress={() => handleTabPress(tab.id)}
      >
        {tab.label ? (
          <KuralText
            variant="caption"
            isTamil={tab.isTamilLabel}
            style={[componentStyles.navTabText, tab.isActive && componentStyles.navTabTextActive]}
          >
            {tab.label}
          </KuralText>
        ) : null}
      </TouchableOpacity>
    ));

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
