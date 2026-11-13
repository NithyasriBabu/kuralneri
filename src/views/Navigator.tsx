import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Platform, Pressable, useWindowDimensions, View } from 'react-native';
import { Bookmark, Bot, Home, Search, Settings, X } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { TabType } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { KuralButton } from 'src/components/common/KuralButton';
import { ErrorBoundary, ErrorFallback } from 'src/components/common/ErrorBoundary';
import { useTranslation } from 'src/content/translation';
import { isDevCrashRoute, navigateToHomeRoute } from 'src/dev/devCrash';
import { useNavigatorController } from 'src/hooks/useNavigatorController';
import { isGuruEnabled } from 'src/config/featureFlags';
import { useSettings } from 'src/context/SettingsContext';
import {
  CoachMarkProvider,
  CoachTarget,
  CoachTargetRect,
} from 'src/context/CoachMarkContext';

import KuralListView from 'src/views/KuralListView';
import BookmarksView from 'src/views/BookmarksView';
import KuralOfTheDayView from 'src/views/KuralOfTheDayView';
import KuralDetailView from 'src/views/KuralDetailView';
import GuruView from 'src/views/GuruView';
import SettingsView from 'src/views/SettingsView';

// ─── navigator ───────────────────────────────────────────────────────────────

interface TabNavigatorProps {
  onNativeKuralPress?: (kuralId: number) => void;
}

const COACH_DONE_STEP = 99;
const COACH_STEPS = [
  { value: 0, tab: TabType.Home, targetId: 'nav-HOME', bodyKey: 'homeCardBody' },
  { value: 1, tab: TabType.Home, targetId: 'home-bookmark', titleKey: 'bookmarkTipTitle', bodyKey: 'bookmarkTipBody' },
  { value: 2, tab: TabType.Explore, targetId: 'nav-EXPLORE', bodyKey: 'exploreCardBody' },
  { value: 3, tab: TabType.Bookmarks, targetId: 'nav-BOOKMARKS', bodyKey: 'bookmarksCardBody' },
  { value: 5, tab: TabType.Bookmarks, targetId: 'bookmarks-remove-one', titleKey: 'bookmarkRemoveTipTitle', bodyKey: 'bookmarkRemoveTipBody' },
  { value: 6, tab: TabType.Bookmarks, targetId: 'bookmarks-clear-all', titleKey: 'bookmarkClearTipTitle', bodyKey: 'bookmarkClearTipBody' },
  { value: 7, tab: TabType.Settings, targetId: 'nav-SETTINGS', bodyKey: 'settingsCardBody' },
  { value: 8, tab: TabType.Settings, targetId: 'settings-name', titleKey: 'settingsNameTipTitle', bodyKey: 'settingsNameTipBody' },
  { value: 9, tab: TabType.Settings, targetId: 'settings-name-tamil', titleKey: 'settingsTamilNameTipTitle', bodyKey: 'settingsTamilNameTipBody' },
  { value: 10, tab: TabType.Settings, targetId: 'settings-author', titleKey: 'settingsAuthorTipTitle', bodyKey: 'settingsAuthorTipBody' },
  { value: 11, tab: TabType.Settings, targetId: 'settings-self-notes', titleKey: 'settingsNotesTipTitle', bodyKey: 'settingsNotesTipBody' },
  { value: 12, tab: TabType.Settings, targetId: 'settings-color-scheme', titleKey: 'settingsColorTipTitle', bodyKey: 'settingsColorTipBody' },
  { value: 13, tab: TabType.Settings, targetId: 'settings-appearance', titleKey: 'settingsAppearanceTipTitle', bodyKey: 'settingsAppearanceTipBody' },
  { value: 14, tab: TabType.Settings, targetId: 'settings-font-size', titleKey: 'settingsSizeTipTitle', bodyKey: 'settingsSizeTipBody' },
  { value: 15, tab: TabType.Settings, targetId: 'settings-list-view', titleKey: 'settingsListTipTitle', bodyKey: 'settingsListTipBody' },
  { value: 16, tab: TabType.Settings, targetId: 'settings-tamil-font', titleKey: 'settingsTamilFontTipTitle', bodyKey: 'settingsTamilFontTipBody' },
  { value: 17, tab: TabType.Settings, targetId: 'settings-english-font', titleKey: 'settingsEnglishFontTipTitle', bodyKey: 'settingsEnglishFontTipBody' },
  { value: 18, tab: TabType.Settings, targetId: 'settings-language-display', titleKey: 'settingsLanguageTipTitle', bodyKey: 'settingsLanguageTipBody' },
  { value: 19, tab: TabType.Settings, targetId: 'settings-fallback-language', titleKey: 'settingsFallbackTipTitle', bodyKey: 'settingsFallbackTipBody' },
  { value: 20, tab: TabType.Settings, targetId: 'settings-restart-tips', titleKey: 'settingsRestartTipTitle', bodyKey: 'settingsRestartTipBody' },
  { value: 21, tab: TabType.Settings, targetId: 'settings-reset-data', titleKey: 'settingsResetTipTitle', bodyKey: 'settingsResetTipBody' },
] as const;

export default function TabNavigator({ onNativeKuralPress }: TabNavigatorProps) {
  const { componentStyles, theme } = useTheme();
  const { t } = useTranslation('uiChrome', 'navigation');
  const { t: tOnboarding } = useTranslation('uiChrome', 'onboarding');
  const { settings, updateSettings } = useSettings();
  const { height: windowHeight } = useWindowDimensions();
  const [coachTargetRect, setCoachTargetRect] = React.useState<CoachTargetRect | null>(null);
  const {
    handleKuralPress,
    handleTabPress,
    isCompactNavigation,
    isWidescreen,
    navTabs,
    routeState,
  } = useNavigatorController();
  const handleKuralSelect =
    Platform.OS === 'web' || !onNativeKuralPress ? handleKuralPress : onNativeKuralPress;
  const kuralNavigationProps = { onKuralPress: handleKuralSelect };
  const routeResetKey =
    routeState.kind === 'tab' ? routeState.tabId : `KURAL-${routeState.kuralId}`;
  const [visitedTabs, setVisitedTabs] = React.useState<Set<TabType>>(
    () => new Set([routeState.kind === 'tab' ? routeState.tabId : TabType.Explore]),
  );
  const coachStep = settings.onboardingStep;
  const coachIndex = COACH_STEPS.findIndex((step) => step.value === coachStep);
  const coach =
    settings.onboardingStatus === 'completed' && coachIndex >= 0
      ? COACH_STEPS[coachIndex]
      : undefined;

  React.useEffect(() => setCoachTargetRect(null), [coach?.targetId]);

  React.useEffect(() => {
    if (coach) handleTabPress(coach.tab);
  }, [coach, handleTabPress]);

  React.useEffect(() => {
    if (routeState.kind !== 'tab') return;
    setVisitedTabs((current) => {
      if (current.has(routeState.tabId)) return current;
      return new Set([...current, routeState.tabId]);
    });
  }, [routeState]);

  const renderTabScreen = (tabId: TabType) => {
    if (isDevCrashRoute('screen')) {
      throw new Error('Synthetic screen crash for error boundary verification.');
    }

    switch (tabId) {
      case TabType.Home:
        return (
          <View style={{ flex: 1 }}>
            <KuralOfTheDayView
              highlightBookmark={coach?.targetId === 'home-bookmark'}
              addTutorialBookmark={coach?.targetId === 'home-bookmark'}
            />
          </View>
        );
      case TabType.Explore:
        return <KuralListView {...kuralNavigationProps} />;
      case TabType.Bookmarks:
        return <BookmarksView {...kuralNavigationProps} coachTarget={coach?.targetId} />;
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
        coachActive={coach?.targetId === `nav-${tab.id}`}
        compact={isCompactNavigation}
        onPress={() => handleTabPress(tab.id)}
        componentStyles={componentStyles}
        theme={theme}
      />
    ));

  const tooltipPlacement = coachTargetRect
    ? coachTargetRect.y + coachTargetRect.height + 230 <= windowHeight
      ? { top: coachTargetRect.y + coachTargetRect.height + 8 }
      : { bottom: Math.max(8, windowHeight - coachTargetRect.y + 8) }
    : isWidescreen
      ? { top: 76 }
      : { bottom: 76 };

  return (
    <CoachMarkProvider activeTarget={coach?.targetId} setTargetRect={setCoachTargetRect}>
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
            {routeState.kind === 'kural' ? <KuralDetailView kuralId={routeState.kuralId} /> : null}
            {navTabs.map((tab) =>
              visitedTabs.has(tab.id) ? (
                <View
                  key={tab.id}
                  style={{
                    flex: 1,
                    display:
                      routeState.kind === 'tab' && routeState.tabId === tab.id ? 'flex' : 'none',
                  }}
                >
                  {renderTabScreen(tab.id)}
                </View>
              ) : null,
            )}
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

      {coach ? (
        <View
          accessibilityRole="alert"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            ...tooltipPlacement,
            zIndex: 100,
            padding: 16,
            gap: 10,
            borderRadius: theme.layout.borderRadius.large,
            borderWidth: 1,
            borderColor: theme.colors.primary,
            backgroundColor: theme.colors.surfaceElevated,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={tOnboarding('tipDismiss')}
            onPress={() => updateSettings({ onboardingStep: COACH_DONE_STEP })}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
              padding: 8,
              zIndex: 2,
            }}
          >
            <X size={20} color={theme.colors.textSecondary} />
          </Pressable>
          <KuralText variant="bodyLarge" style={{ color: theme.colors.primary, fontWeight: '800' }}>
            {'titleKey' in coach
              ? tOnboarding(coach.titleKey)
              : navTabs.find((tab) => tab.id === coach.tab)?.label}
          </KuralText>
          <KuralText variant="bodyNormal" style={{ color: theme.colors.textPrimary }}>
            {tOnboarding(coach.bodyKey)}
          </KuralText>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            {coachIndex > 0 ? (
              <KuralButton
                title={tOnboarding('tipBack')}
                variant="secondary"
                onPress={() =>
                  updateSettings({ onboardingStep: COACH_STEPS[coachIndex - 1].value })
                }
              />
            ) : null}
            <KuralButton
              title={
                coachIndex === COACH_STEPS.length - 1
                  ? tOnboarding('tipDone')
                  : tOnboarding('tipNext')
              }
              onPress={() =>
                updateSettings({
                  onboardingStep:
                    coachIndex === COACH_STEPS.length - 1
                      ? COACH_DONE_STEP
                      : COACH_STEPS[coachIndex + 1].value,
                })
              }
            />
          </View>
        </View>
      ) : null}
    </SafeAreaView>
    </CoachMarkProvider>
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
  coachActive: boolean;
  compact: boolean;
  onPress: () => void;
  componentStyles: ReturnType<typeof useTheme>['componentStyles'];
  theme: ReturnType<typeof useTheme>['theme'];
}

function NavTabButton({
  tab,
  coachActive,
  compact,
  onPress,
  componentStyles,
  theme,
}: NavTabButtonProps) {
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
    <CoachTarget id={`nav-${tab.id}`} style={{ flex: 1, position: 'relative' }}>
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
          coachActive && {
            backgroundColor: theme.colors.accent,
            borderColor: theme.colors.primary,
            borderWidth: 2,
          },
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
    </CoachTarget>
  );
}
