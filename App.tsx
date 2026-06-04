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
import { KuralText } from 'src/components/common/KuralText';

// --------------------------------------------------------------------------
// INNER ROOT: Consumes the Theme Context directly for loaders and errors
// --------------------------------------------------------------------------
function AppContent() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState('Booting Kuralneri engine...');

  const { theme, componentStyles } = useTheme();

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
          console.info(`>>> Command Line Sync: ${msg}`);
        });

        // Small semantic delay for smooth asset caching completion
        timeoutId = setTimeout(() => setDbReady(true), 600);
      } catch (err) {
        setError('Could not load database layers.');
      }
    }

    initApp();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // 1. Fatal Boot Crash Handler View
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

  // 2. App Engine Bootstrapper Initialization view
  if (!dbReady || !fontsLoaded) {
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

  // 3. Main Operational App Thread Launch
  return (
    <SafeAreaProvider>
      <TabNavigator />
    </SafeAreaProvider>
  );
}

// --------------------------------------------------------------------------
// APEX CONTAINER: Mounts the Theme Context Provider first
// --------------------------------------------------------------------------
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    marginTop: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
});
