import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useKuralOfTheDay } from 'src/hooks/useKuralOfTheDay';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { KuralRecord } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { useTranslation } from 'src/content/translation';

export default function KuralOfTheDayView() {
  const { kural, loading, error } = useKuralOfTheDay();
  const { theme, componentStyles } = useTheme();
  const { settings } = useSettings();
  const { sectionHeaders: headerToggle } = settings.langToggles;
  const { tSingle } = useTranslation('uiChrome', 'cards');
  const userNameTamil = settings.userNameTamil || settings.userName;

  const [displayKural, setDisplayKural] = useState<KuralRecord | null>(null);

  const hour = new Date().getHours();
  const greetingKey: 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' =
    hour < 12 ? 'greetingMorning' : hour < 17 ? 'greetingAfternoon' : 'greetingEvening';

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
              {tSingle(greetingKey, 'tamil')}, {userNameTamil}!
            </KuralText>
          )}
          {headerToggle.english && (
            <KuralText style={componentStyles.kuralOfTheDayEnglishHeader}>
              {tSingle(greetingKey, 'english')}, {settings.userName}
            </KuralText>
          )}
        </View>
      )}

      <View style={componentStyles.kuralOfTheDayHeader}>
        {headerToggle.tamil && (
          <KuralText style={componentStyles.kuralOfTheDayTamilHeader}>
            {tSingle('kuralOfTheDay', 'tamil')}
          </KuralText>
        )}
        {headerToggle.english && (
          <KuralText style={componentStyles.kuralOfTheDayEnglishHeader}>
            {tSingle('kuralOfTheDay', 'english')}
          </KuralText>
        )}
      </View>

      {loading && (
        <View style={componentStyles.kuralOfTheDayCentered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {error && (
        <View style={componentStyles.kuralOfTheDayCentered}>
          <KuralText style={componentStyles.kuralOfTheDayErrorText}>{error}</KuralText>
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
