import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useKuralOfTheDay } from 'src/hooks/useKuralOfTheDay';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { KuralRecord } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';

export default function KuralOfTheDayView() {
  const { kural, loading, error } = useKuralOfTheDay();
  const { theme, componentStyles } = useTheme();
  const { settings } = useSettings();
  const { sectionHeaders: headerToggle } = settings.langToggles;

  const [displayKural, setDisplayKural] = useState<KuralRecord | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'காலை வணக்கம்' : hour < 17 ? 'மதிய வணக்கம்' : 'மாலை வணக்கம்';
  const greetingEn = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
      {settings.userName && (
        <View
          style={{
            paddingBottom: 10,
          }}
        >
          {headerToggle.tamil && (
            <KuralText style={componentStyles.kuralOfTheDayTamilHeader}>
              {greeting}, {settings.userName}!
            </KuralText>
          )}
          {headerToggle.english && (
            <KuralText style={componentStyles.kuralOfTheDayEnglishHeader}>
              {greetingEn}, {settings.userName}
            </KuralText>
          )}
        </View>
      )}

      <View style={componentStyles.kuralOfTheDayHeader}>
        {headerToggle.tamil && (
          <KuralText style={componentStyles.kuralOfTheDayTamilHeader}>இன்றைய குறள்</KuralText>
        )}
        {headerToggle.english && (
          <KuralText style={componentStyles.kuralOfTheDayEnglishHeader}>Kural of the Day</KuralText>
        )}
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
          <KuralCardShell
            kural={displayKural}
            showComments={true}
            onBookmarkToggle={handleBookmarkToggle}
          />
        </View>
      )}
    </ScrollView>
  );
}
