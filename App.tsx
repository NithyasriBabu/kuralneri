import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

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
import i18n from 'src/content/i18n';
import { isDevCrashRoute, navigateToHomeRoute } from 'src/dev/devCrash';

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
    throw new Error('Synthetic root crash for error boundary verification.');
  }

  if (!fontsLoaded || !settingsReady) {
    return (
      <View
        style={[
          componentStyles.kuralOfTheDayCentered,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <TabNavigator />
    </SafeAreaProvider>
  );
}

function DatabaseBootstrapGate({ children }: { children: React.ReactNode }) {
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
      <View style={styles.bootstrapShell}>
        <View style={styles.bootstrapCard}>
          <Text style={styles.bootstrapTitle}>{databaseErrorMessage}</Text>
          <Text style={styles.bootstrapBody}>{bootError.message}</Text>
          <Text style={styles.bootstrapLog}>{logMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setBootKey((value) => value + 1)}
            style={({ pressed }) => [
              styles.bootstrapButton,
              pressed && styles.bootstrapButtonPressed,
            ]}
          >
            <Text style={styles.bootstrapButtonText}>{retryLabel}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (bootStatus !== 'ready') {
    return (
      <View style={styles.bootstrapShell}>
        <View style={styles.bootstrapCard}>
          <ActivityIndicator size="large" color="#344E41" />
          <Text style={styles.bootstrapLog}>{logMessage}</Text>
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
      <DatabaseBootstrapGate key={appRemountKey}>
        <ThemedApp />
      </DatabaseBootstrapGate>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  bootstrapShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAF9F6',
  },
  bootstrapCard: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 20,
    padding: 24,
    backgroundColor: '#DAD7CD',
    borderWidth: 1,
    borderColor: '#A3B18A',
    gap: 12,
  },
  bootstrapTitle: {
    color: '#344E41',
  },
  bootstrapBody: {
    color: '#2A3F34',
  },
  bootstrapLog: {
    color: '#3A5A40',
  },
  bootstrapButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#344E41',
  },
  bootstrapButtonPressed: {
    opacity: 0.9,
  },
  bootstrapButtonText: {
    color: '#FAF9F6',
  },
});
