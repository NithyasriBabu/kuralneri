import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, Pressable, View } from 'react-native';
import { Bookmark, Bot, Home, Search, Settings } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { ErrorBoundary, ErrorFallback } from 'src/components/common/ErrorBoundary';
import { useTranslation } from 'src/content/translation';
import { isDevCrashRoute, navigateToHomeRoute } from 'src/dev/devCrash';
import { useNavigatorController } from 'src/hooks/useNavigatorController';
import { isGuruEnabled } from 'src/config/featureFlags';

import KuralListView from 'src/views/KuralListView';
import BookmarksView from 'src/views/BookmarksView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';
import KuralDetailView from 'src/views/KuralDetailView';
import GuruView from 'src/views/GuruView';
import SettingsView from 'src/views/SettingsView';

// ─── navigator ───────────────────────────────────────────────────────────────

export default function TabNavigator() {
  const { componentStyles, theme } = useTheme();
  const { t } = useTranslation('uiChrome', 'navigation');
  const {
    handleDetailBack,
    handleKuralPress,
    handleTabPress,
    isCompactNavigation,
    isWidescreen,
    navTabs,
    routeState,
  } =
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
        return isGuruEnabled() ? <GuruView {...kuralNavigationProps} /> : <KuralOfTheDayView />;
      case TabType.Settings:
        return <SettingsView />;
      default:
        return <KuralOfTheDayView />;
    }
  };

  const renderNavigationLinks = () =>
    navTabs.map((tab) => (
      <NavTabButton
        key={tab.id}
        tab={tab}
        compact={isCompactNavigation}
        onPress={() => handleTabPress(tab.id)}
        componentStyles={componentStyles}
        theme={theme}
      />
    ));

  return (
    <SafeAreaView
      testID="print-shell"
      style={componentStyles.navShell}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {isWidescreen && (
        <View
          testID="app-navigation"
          style={[componentStyles.navNavbarContainer, componentStyles.navTopPlacement]}
        >
          {renderNavigationLinks()}
        </View>
      )}

      <View testID="print-canvas" style={componentStyles.navCanvasWrapper}>
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
          <View testID="print-screen" style={componentStyles.navFullWidthColumn}>
            {renderActiveScreen()}
          </View>
        </ErrorBoundary>
      </View>

      {!isWidescreen && (
        <View
          testID="app-navigation"
          style={[componentStyles.navNavbarContainer, componentStyles.navBottomPlacement]}
        >
          {renderNavigationLinks()}
        </View>
      )}
    </SafeAreaView>
  );
}

interface NavTabButtonProps {
  tab: {
    id: TabType;
    icon: string;
    label: string;
    tooltip: string;
    accessibilityLabel: string;
    isActive: boolean;
    isTamilLabel: boolean;
  };
  compact: boolean;
  onPress: () => void;
  componentStyles: ReturnType<typeof useTheme>['componentStyles'];
  theme: ReturnType<typeof useTheme>['theme'];
}

function NavTabButton({ tab, compact, onPress, componentStyles, theme }: NavTabButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const showTooltip = compact && Platform.OS === 'web' && isHovered;
  const hasLabel = tab.label.length > 0;
  const iconProps = {
    size: 20,
    strokeWidth: tab.isActive ? 2.5 : 2,
    color: tab.isActive ? theme.colors.primary : theme.colors.textSecondary,
  };
  const iconByTab = {
    [TabType.Home]: <Home {...iconProps} />,
    [TabType.Explore]: <Search {...iconProps} />,
    [TabType.Bookmarks]: <Bookmark {...iconProps} />,
    [TabType.Guru]: <Bot {...iconProps} />,
    [TabType.Settings]: <Settings {...iconProps} />,
    [TabType.Learn]: <Search {...iconProps} />,
  };

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {showTooltip ? (
        <View
          pointerEvents="none"
            style={{
              position: 'absolute',
              top: -36,
              left: '50%',
              transform: [{ translateX: -40 }],
              zIndex: 10,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: theme.colors.surfaceElevated,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
        >
          <KuralText variant="caption" style={{ color: theme.colors.textPrimary }}>
            {tab.tooltip}
          </KuralText>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={tab.accessibilityLabel}
        accessibilityState={{ selected: tab.isActive }}
        onPress={onPress}
        onHoverIn={Platform.OS === 'web' ? () => setIsHovered(true) : undefined}
        onHoverOut={Platform.OS === 'web' ? () => setIsHovered(false) : undefined}
        style={({ pressed }) => [
          componentStyles.navTabButton,
          tab.isActive && componentStyles.navTabButtonActive,
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {iconByTab[tab.id]}
          {hasLabel ? (
            <KuralText
              variant="caption"
              isTamil={tab.isTamilLabel}
              style={[componentStyles.navTabText, tab.isActive && componentStyles.navTabTextActive]}
            >
              {tab.label}
            </KuralText>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}
