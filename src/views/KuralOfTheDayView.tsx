import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useKuralOfTheDay } from 'src/hooks/useKuralOfTheDay';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import KuralCard from 'src/components/KuralCard';
import { KuralRecord } from 'src/types/types';

export default function KuralOfTheDayView() {
  const { kural, loading, error } = useKuralOfTheDay();
  const { theme, componentStyles } = useTheme();
  const [displayKural, setDisplayKural] = useState<KuralRecord | null>(null);

  useEffect(() => {
    setDisplayKural(kural);
  }, [kural]);

  const handleBookmarkToggle = async (nextBookmarked: boolean) => {
    if (!displayKural) return;
    const next = await setKuralBookmarkStatus(displayKural.id, nextBookmarked);
    setDisplayKural({ ...displayKural, is_bookmarked: next });
  };

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

      {!loading && !error && displayKural && (
        <View style={componentStyles.kuralOfTheDayFeedWrapper}>
          <KuralCard
            kural={displayKural}
            showComments={true}
            onBookmarkToggle={handleBookmarkToggle}
          />
        </View>
      )}
    </ScrollView>
  );
}
