import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Pressable,
  Text,
  useColorScheme,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import {
  useFonts,
  MuktaMalar_400Regular,
  MuktaMalar_700Bold,
} from '@expo-google-fonts/mukta-malar';
import { Catamaran_400Regular, Catamaran_700Bold } from '@expo-google-fonts/catamaran';
import { ArimaMadurai_400Regular, ArimaMadurai_700Bold } from '@expo-google-fonts/arima-madurai';

import { Inter_400Regular } from '@expo-google-fonts/inter';
import { Merriweather_400Regular } from '@expo-google-fonts/merriweather';
import { SourceSerifPro_400Regular } from '@expo-google-fonts/source-serif-pro';

import { setupDatabase } from 'src/data/database';
import TabNavigator from 'src/views/Navigator';
import { ThemeProvider, useTheme } from 'src/theme/ThemeContextProvider';
import { SettingsProvider, useSettings } from 'src/context/SettingsContext';

import { ErrorBoundary, ErrorFallback } from 'src/components/common/ErrorBoundary';
import { APP_COPY } from 'src/app/app.constants';
import i18n from 'src/content/i18n';
import { isDevCrashRoute, navigateToHomeRoute } from 'src/dev/devCrash';
import { getNativeThemeColors } from 'src/theme/nativeTheme.constants';

function ThemedApp() {
  const { settingsReady } = useSettings();
  const [fontsLoaded] = useFonts({
    'MuktaMalar-Regular': MuktaMalar_400Regular,
    'MuktaMalar-Bold': MuktaMalar_700Bold,
    'Catamaran-Regular': Catamaran_400Regular,
    'Catamaran-Bold': Catamaran_700Bold,
    'ArimaMadurai-Regular': ArimaMadurai_400Regular,
    'ArimaMadurai-Bold': ArimaMadurai_700Bold,
    'Inter-Regular': Inter_400Regular,
    'Merriweather-Regular': Merriweather_400Regular,
    'SourceSerif-Regular': SourceSerifPro_400Regular,
    'SourceSerif-Bold': SourceSerifPro_400Regular,
  });

  return <AppContent fontsLoaded={fontsLoaded} settingsReady={settingsReady} />;
}

interface AppContentProps {
  fontsLoaded: boolean;
  settingsReady: boolean;
}

function AppContent({ fontsLoaded, settingsReady }: AppContentProps) {
  const { theme, componentStyles } = useTheme();

  if (isDevCrashRoute('root')) {
    throw new Error(APP_COPY.rootCrash);
  }

  if (!fontsLoaded || !settingsReady) {
    return (
      <View
        style={[
          componentStyles.kuralOfTheDayCentered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar style={theme.dark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={theme.dark ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <TabNavigator />
    </SafeAreaProvider>
  );
}

function DatabaseBootstrapGate({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const nativeTheme = getNativeThemeColors(isDark);
  const loadingMessage = i18n.t('common:bootingEngine');
  const databaseErrorMessage = i18n.t('common:couldNotLoadDatabaseLayers');
  const retryLabel = i18n.t('common:retry');
  const [bootKey, setBootKey] = useState(0);
  const [bootStatus, setBootStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [logMessage, setLogMessage] = useState(loadingMessage);
  const [bootError, setBootError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const initApp = async () => {
      setBootStatus('loading');
      setBootError(null);
      setLogMessage(loadingMessage);

      try {
        const result = await setupDatabase((message) => {
          if (cancelled) return;
          setLogMessage(message);
          console.log(`[DB SYSTEM]: ${message}`);
        });

        if (!cancelled) {
          setBootStatus('ready');
          console.log('[DB SYSTEM]:', result);
        }
      } catch (error) {
        if (cancelled) return;
        setBootStatus('error');
        setBootError(error instanceof Error ? error : new Error(databaseErrorMessage));
      }
    };

    void initApp();
    return () => {
      cancelled = true;
    };
  }, [bootKey, databaseErrorMessage, loadingMessage]);

  if (bootStatus === 'error' && bootError) {
    return (
      <View style={bootstrapStyles.shell(isDark)}>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={nativeTheme.background}
        />
        <View style={bootstrapStyles.card(isDark)}>
          <Text style={bootstrapStyles.title(isDark)}>{databaseErrorMessage}</Text>
          <Text style={bootstrapStyles.body(isDark)}>{bootError.message}</Text>
          <Text style={bootstrapStyles.log(isDark)}>{logMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setBootKey((value) => value + 1)}
            style={({ pressed }) => [
              bootstrapStyles.button(isDark),
              pressed && bootstrapStyles.pressed,
            ]}
          >
            <Text style={bootstrapStyles.buttonText(isDark)}>{retryLabel}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (bootStatus !== 'ready') {
    return (
      <View style={bootstrapStyles.shell(isDark)}>
        <StatusBar
          style={isDark ? 'light' : 'dark'}
          backgroundColor={nativeTheme.background}
        />
        <View style={bootstrapStyles.card(isDark)}>
          <ActivityIndicator
            size="large"
            color={nativeTheme.loading}
          />
          <Text style={bootstrapStyles.log(isDark)}>{logMessage}</Text>
        </View>
      </View>
    );
  }

  return (
    <SettingsProvider key={bootKey}>
      <ThemeProvider>{children}</ThemeProvider>
    </SettingsProvider>
  );
}

export default function App() {
  const [appRemountKey, setAppRemountKey] = useState(0);

  return (
      <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error(APP_COPY.rootErrorBoundary, error, errorInfo.componentStack);
      }}
      fallback={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => {
            if (isDevCrashRoute('root')) {
              navigateToHomeRoute();
            }
            setAppRemountKey((current) => current + 1);
            resetErrorBoundary();
          }}
          title={APP_COPY.appCrashedTitle}
          message={APP_COPY.appCrashedMessage}
          primaryActionLabel={APP_COPY.retryApp}
        />
      )}
    >
      <DatabaseBootstrapGate key={appRemountKey}>
        <ThemedApp />
      </DatabaseBootstrapGate>
    </ErrorBoundary>
  );
}

const bootstrapStyles = {
  shell: (isDark: boolean): ViewStyle => ({
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: getNativeThemeColors(isDark).background,
  }),
  card: (isDark: boolean): ViewStyle => ({
    width: '100%',
    maxWidth: 560,
    borderRadius: 20,
    padding: 24,
    backgroundColor: getNativeThemeColors(isDark).surface,
    borderWidth: 1,
    borderColor: getNativeThemeColors(isDark).border,
    gap: 12,
  }),
  title: (isDark: boolean): TextStyle => ({
    color: getNativeThemeColors(isDark).title,
  }),
  body: (isDark: boolean): TextStyle => ({
    color: getNativeThemeColors(isDark).body,
  }),
  log: (isDark: boolean): TextStyle => ({
    color: getNativeThemeColors(isDark).secondary,
  }),
  button: (isDark: boolean): ViewStyle => ({
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: getNativeThemeColors(isDark).primary,
  }),
  pressed: {
    opacity: 0.9,
  } as ViewStyle,
  buttonText: (isDark: boolean): TextStyle => ({
    color: getNativeThemeColors(isDark).primaryInverse,
  }),
};
