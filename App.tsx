import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import {
  useFonts,
  MuktaMalar_400Regular,
  MuktaMalar_700Bold,
} from '@expo-google-fonts/mukta-malar';
import { Inter_400Regular } from '@expo-google-fonts/inter';

import { setupDatabase } from 'src/data/database';
import TabNavigator from 'src/views/Navigator';
import { ThemeProvider, useTheme } from 'src/theme/ThemeContextProvider';
import { SettingsProvider, useSettings } from 'src/context/SettingsContext';

import { KuralText } from 'src/components/common/KuralText';

// --------------------------------------------------------------------------
// BRIDGE: reads settings and passes display tokens down into ThemeProvider
// --------------------------------------------------------------------------
function ThemedApp() {
  const { settings, settingsReady } = useSettings();
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState('Booting Kuralneri engine...');

  let [fontsLoaded] = useFonts({
    'MuktaMalar-Regular': MuktaMalar_400Regular,
    'MuktaMalar-Bold': MuktaMalar_700Bold,
    'Inter-Regular': Inter_400Regular,
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
        setError('Could not load database layers.');
      }
    }

    initApp();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ThemeProvider
      fontSizeScale={settings.fontSizeScale}
      tamilFont={settings.tamilFont}
      customBackground={settings.customBackground}
      customForeground={settings.customForeground}
    >
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
  return (
    <SettingsProvider>
      <ThemedApp />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
});
