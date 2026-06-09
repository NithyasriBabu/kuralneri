import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

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

import { KuralText } from 'src/components/common/KuralText';
import { ErrorBoundary, ErrorFallback } from 'src/components/common/ErrorBoundary';
import { useTranslation } from 'src/content/translation';
import { isDevCrashRoute, navigateToHomeRoute } from 'src/dev/devCrash';

// --------------------------------------------------------------------------
// BOOT: waits for database, fonts, and settings before rendering the app
// --------------------------------------------------------------------------
function ThemedApp() {
  const { settingsReady } = useSettings();
  const { t } = useTranslation('uiChrome', 'common');
  const bootMessage = t('bootingEngine');
  const databaseErrorMessage = t('couldNotLoadDatabaseLayers');
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState(bootMessage);

  let [fontsLoaded] = useFonts({
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

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    async function initApp() {
      try {
        await setupDatabase((msg) => {
          setLogMessage(msg);
          console.log(`[DB SYSTEM]: ${msg}`);
        });
        timeoutId = setTimeout(() => setDbReady(true), 600);
      } catch {
        setError(databaseErrorMessage);
      }
    }

    initApp();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ThemeProvider>
      <AppContent
        dbReady={dbReady}
        fontsLoaded={fontsLoaded}
        settingsReady={settingsReady}
        error={error}
        logMessage={logMessage}
      />
    </ThemeProvider>
  );
}

// --------------------------------------------------------------------------
// INNER ROOT: renders loader / error / app
// --------------------------------------------------------------------------
interface AppContentProps {
  dbReady: boolean;
  fontsLoaded: boolean;
  settingsReady: boolean;
  error: string | null;
  logMessage: string;
}

function AppContent({ dbReady, fontsLoaded, settingsReady, error, logMessage }: AppContentProps) {
  const { theme, componentStyles } = useTheme();

  if (isDevCrashRoute('root')) {
    throw new Error('Synthetic root crash for error boundary verification.');
  }

  if (error) {
    return (
      <View
        style={[
          componentStyles.kuralOfTheDayCentered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <KuralText variant="bodyLarge" style={componentStyles.kuralOfTheDayErrorText}>
          {error}
        </KuralText>
      </View>
    );
  }

  if (!dbReady || !fontsLoaded || !settingsReady) {
    return (
      <View
        style={[
          componentStyles.kuralOfTheDayCentered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {fontsLoaded && (
          <KuralText variant="bodyNormal" style={styles.loadingText}>
            {logMessage}
          </KuralText>
        )}
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <TabNavigator />
    </SafeAreaProvider>
  );
}

// --------------------------------------------------------------------------
// APEX: SettingsProvider first so ThemedApp can read settings
// --------------------------------------------------------------------------
export default function App() {
  const [appRemountKey, setAppRemountKey] = useState(0);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('[RootErrorBoundary]', error, errorInfo.componentStack);
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
          title="App crashed"
          message="A critical error stopped the app shell. Retry to reload the providers and screens."
          primaryActionLabel="Retry app"
        />
      )}
    >
      <SettingsProvider key={appRemountKey}>
        <ThemedApp />
      </SettingsProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
});
