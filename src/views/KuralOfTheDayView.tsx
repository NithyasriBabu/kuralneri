import React from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useKuralOfTheDay } from 'src/hooks/useKuralOfTheDay';
import { useTheme } from 'src/theme/ThemeContextProvider';
import KuralCard from 'src/components/KuralCard';

export default function KuralOfTheDayView() {
  const { kural, loading, error } = useKuralOfTheDay();
  const { theme, componentStyles } = useTheme();

  return (
    <ScrollView
      style={componentStyles.kuralOfTheDayScreen}
      contentContainerStyle={componentStyles.kuralOfTheDayContent}
    >
      {/* Dual Language Header */}
      <View style={componentStyles.kuralOfTheDayHeader}>
        <Text style={componentStyles.kuralOfTheDayTamilHeader}>இன்றைய அதிகாரம் & குறள்</Text>
        <Text style={componentStyles.kuralOfTheDayEnglishHeader}>Wisdom of the Day</Text>
      </View>

      {loading && (
        <View style={componentStyles.kuralOfTheDayCentered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {error && (
        <View style={componentStyles.kuralOfTheDayCentered}>
          <Text style={componentStyles.kuralOfTheDayErrorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && kural && (
        <View style={componentStyles.kuralOfTheDayFeedWrapper}>
          <KuralCard kural={kural} showComments={true} />
        </View>
      )}
    </ScrollView>
  );
}
