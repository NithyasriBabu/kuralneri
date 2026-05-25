import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { setupDatabase } from './src/db/database';

import {
  useFonts,
  MuktaMalar_400Regular,
  MuktaMalar_700Bold,
} from '@expo-google-fonts/mukta-malar';
import { Inter_400Regular } from '@expo-google-fonts/inter';
import thirukkuralData from './api/thirukkural.json';

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessage, setLogMessage] = useState('Booting Kuralneri engine...');

  let [fontsLoaded] = useFonts({ MuktaMalar_400Regular, MuktaMalar_700Bold, Inter_400Regular });

  useEffect(() => {
    async function initApp() {
      try {
        await setupDatabase((msg) => {
          setLogMessage(msg); // Keeps your UI spinner text updated

          // 1. Standard log (intercepted by Metro if connection is active)
          console.log(`[DB SYSTEM]: ${msg}`);

          // 2. FORCED TERMINAL STREAM: Metro config captures table logs
          // explicitly when passed through console.info or console.warn
          console.info(`>>> Command Line Sync: ${msg}`);
        });

        // Short delay so the user can visually confirm completion
        setTimeout(() => setDbReady(true), 600);

        // setDbReady(true);
      } catch (err) {
        setError('Could not load database layers.');
      }
    }

    initApp();
  }, []);

  if (!dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ marginTop: 8 }}>Configuring Kuralneri Database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>குறள்நெறி</Text>
      <FlatList
        data={thirukkuralData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.kuralNumber}>{item.id}</Text>
            <Text style={styles.tamilText}>{item.line1}</Text>
            <Text style={styles.tamilText}>{item.line2}</Text>
            <Text style={styles.translationText}>{item.translation}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DAD7CD', padding: 20 },
  header: {
    fontSize: 28,
    fontFamily: 'MuktaMalar_700Bold',
    color: '#344E41',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#A3B18A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  kuralNumber: { color: '#3A5A40', fontWeight: 'bold', marginBottom: 5 },
  tamilText: {
    fontFamily: 'MuktaMalar_400Regular',
    fontSize: 18,
    color: '#344E41',
    lineHeight: 26,
  },
  translationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#344E41',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
