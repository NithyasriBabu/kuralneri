import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useKuralOfTheDay } from 'src/hooks/useKuralOfTheDay';
import KuralCard from 'src/components/KuralCard';

export default function KuralOfTheDayView() {
  const { kural, loading, error } = useKuralOfTheDay();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Dual Language Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.tamilHeader}>இன்றைய அதிகாரம் & குறள்</Text>
        <Text style={styles.englishHeader}>Wisdom of the Day</Text>
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#344E41" />
        </View>
      )}

      {error && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && kural && (
        <View style={styles.feedWrapper}>
          <KuralCard kural={kural} showComments={true} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6', // Calm background layer
  },
  contentContainer: {
    padding: 20,
  },
  headerContainer: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#A3B18A', // Accent surface line tint
    paddingBottom: 8,
  },
  tamilHeader: {
    fontFamily: 'MuktaMalar-Bold',
    fontSize: 22,
    color: '#344E41', // Deep scholarly green
  },
  englishHeader: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#6B7A68',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
  },
  feedWrapper: {
    marginTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontFamily: 'Inter',
    color: '#D90429',
    textAlign: 'center',
    fontSize: 14,
  },
});
