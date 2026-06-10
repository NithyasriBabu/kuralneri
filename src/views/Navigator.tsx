import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { ErrorBoundary, ErrorFallback } from 'src/components/common/ErrorBoundary';
import { useTranslation } from 'src/content/translation';
import { isDevCrashRoute, navigateToHomeRoute } from 'src/dev/devCrash';
import { useNavigatorController } from 'src/hooks/useNavigatorController';

import KuralListView from 'src/views/KuralListView';
import BookmarksView from 'src/views/BookmarksView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';
import KuralDetailView from 'src/views/KuralDetailView';
import GuruView from 'src/views/GuruView';
import SettingsView from 'src/views/SettingsView';

// ─── navigator ───────────────────────────────────────────────────────────────

export default function TabNavigator() {
  const { componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'navigation');
  const { handleDetailBack, handleKuralPress, handleTabPress, isWidescreen, navTabs, routeState } =
    useNavigatorController();
  const kuralNavigationProps = { onKuralPress: handleKuralPress };
  const routeResetKey =
    routeState.kind === 'tab' ? routeState.tabId : `KURAL-${routeState.kuralId}`;

  const renderActiveScreen = () => {
    if (isDevCrashRoute('screen')) {
      throw new Error('Synthetic screen crash for error boundary verification.');
    }

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
        return <KuralListView {...kuralNavigationProps} />;
      case TabType.Bookmarks:
        return <BookmarksView {...kuralNavigationProps} />;
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
        return <GuruView {...kuralNavigationProps} />;
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
        <ErrorBoundary
          resetKeys={[routeState.kind, routeResetKey]}
          onError={(error, errorInfo) => {
            console.error('[NavigatorErrorBoundary]', error, errorInfo.componentStack);
          }}
          fallback={({ error, resetErrorBoundary }) => (
            <ErrorFallback
              error={error}
              resetErrorBoundary={resetErrorBoundary}
              title="Screen crashed"
              message="This section failed to render. Try again or return home."
              primaryActionLabel="Try again"
              secondaryActionLabel="Go home"
              onSecondaryAction={() => {
                navigateToHomeRoute();
                handleTabPress(TabType.Home);
              }}
            />
          )}
        >
          <View style={componentStyles.navFullWidthColumn}>{renderActiveScreen()}</View>
        </ErrorBoundary>
      </View>

      {!isWidescreen && (
        <View style={[componentStyles.navNavbarContainer, componentStyles.navBottomPlacement]}>
          {renderNavigationLinks()}
        </View>
      )}
    </SafeAreaView>
  );
}
