import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { getKuralById, setKuralBookmarkStatus } from 'src/data/services';
import KuralCard from 'src/components/KuralCard';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralRecord } from 'src/types/types';

interface KuralDetailViewProps {
  kuralId: number;
  onBack?: () => void;
}

export default function KuralDetailView({ kuralId, onBack }: KuralDetailViewProps) {
  const { theme, componentStyles } = useTheme();
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
          setError('திருக்குறளைப் பதிவிறக்க முடியவில்லை / Failed to load Kural.');
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
  }, [kuralId]);

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
    <ScrollView
      style={componentStyles.kuralOfTheDayScreen}
      contentContainerStyle={componentStyles.kuralOfTheDayContent}
    >
      <View style={componentStyles.kuralOfTheDayHeader}>
        <Text style={componentStyles.kuralOfTheDayTamilHeader}>குறள் #{kuralId}</Text>
        <Text style={componentStyles.kuralOfTheDayEnglishHeader}>Kural Detail</Text>
      </View>

      {onBack && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onBack}
          style={{
            alignSelf: 'flex-start',
            marginBottom: 14,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 999,
            backgroundColor: theme.colors.accent,
          }}
        >
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontWeight: '700',
              fontFamily: theme.typography.fonts.english,
            }}
          >
            Back to Explore
          </Text>
        </TouchableOpacity>
      )}

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
          <KuralCard
            kural={kural}
            showComments
            onBookmarkToggle={handleBookmarkToggle}
            bookmarkLoading={savingBookmark}
          />
        </View>
      )}
    </ScrollView>
  );
}
