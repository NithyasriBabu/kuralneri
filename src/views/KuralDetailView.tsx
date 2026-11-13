import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getKuralById, setKuralBookmarkStatus } from 'src/data/services';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { KuralRecord } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import { useTranslation } from 'src/content/translation';

interface KuralDetailViewProps {
  kuralId: number;
}

export default function KuralDetailView({ kuralId }: KuralDetailViewProps) {
  const { theme, componentStyles } = useTheme();
  const { settings } = useSettings();
  const { kuralCard: headerToggle } = settings.langToggles;
  const { t: tCards, tSingle } = useTranslation('kuralCard', 'cards');
  const [kural, setKural] = useState<KuralRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadKural = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getKuralById(kuralId);
        if (isMounted) {
          setKural(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(tCards('kuralLoadFailed'));
        }
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadKural();

    return () => {
      isMounted = false;
    };
  }, [kuralId, tCards]);

  const handleBookmarkToggle = async (nextBookmarked: boolean) => {
    if (!kural) return;
    try {
      setSavingBookmark(true);
      const next = await setKuralBookmarkStatus(kural.id, nextBookmarked);
      setKural({ ...kural, is_bookmarked: next });
    } finally {
      setSavingBookmark(false);
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <ScrollView
        testID="print-scroll-container"
        style={componentStyles.kuralOfTheDayScreen}
        contentContainerStyle={componentStyles.kuralOfTheDayContent}
      >
        <View style={componentStyles.kuralOfTheDayHeader}>
          {headerToggle.tamil && (
            <KuralText style={componentStyles.kuralOfTheDayTamilHeader}>
              {tSingle('kuralDetail', 'tamil')} #{kuralId}
            </KuralText>
          )}
          {headerToggle.english && (
            <KuralText style={componentStyles.kuralOfTheDayEnglishHeader}>
              {tSingle('kuralDetail', 'english')} #{kuralId}
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

        {!loading && !error && kural && (
          <View style={componentStyles.kuralOfTheDayFeedWrapper}>
            <KuralCardShell
              kural={kural}
              showComments
              showUserNotes
              onBookmarkToggle={handleBookmarkToggle}
              bookmarkLoading={savingBookmark}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
