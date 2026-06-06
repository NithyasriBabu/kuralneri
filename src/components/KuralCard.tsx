import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';

import { KuralRecord } from 'src/types/types';
import { KuralText } from './common/KuralText';

interface KuralCardProps {
  kural: KuralRecord;
  showComments?: boolean;
  onPress?: () => void;
  onBookmarkToggle?: (nextBookmarked: boolean) => void | Promise<void>;
  bookmarkLoading?: boolean;
}

export default React.memo(function KuralCard({
  kural,
  showComments,
  onPress,
  onBookmarkToggle,
  bookmarkLoading,
}: KuralCardProps) {
  const { theme, componentStyles } = useTheme();
  const { settings } = useSettings();
  const {
    kuralCard: cardToggle,
    commentary: commentaryToggle,
    sectionHeaders: headerToggle,
  } = settings.langToggles;

  const [othersExpanded, setOthersExpanded] = useState(false);

  const preferredAuthorCode = settings.preferredAuthorCode;

  const filterLabel = (tamil: string, english: string): string => {
    if (commentaryToggle.tamil && commentaryToggle.english) return `${tamil} / ${english}`;
    if (commentaryToggle.tamil) return tamil;
    return english;
  };

  const handleBookmarkPress = async () => {
    if (!onBookmarkToggle) return;
    await onBookmarkToggle(!Boolean(kural.is_bookmarked));
  };

  return (
    <View style={componentStyles.kuralCard}>
      <Pressable onPress={onPress} disabled={!onPress} style={componentStyles.kuralCardPressable}>
        {headerToggle.tamil && (
          <View style={componentStyles.kuralCardHeaderRow}>
            <KuralText
              style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}
            >
              குறள் #{kural.id} • {kural.paal_name} — {kural.iyal_name} - {kural.adhikaram_name}
            </KuralText>
          </View>
        )}
        {headerToggle.english && (
          <View style={componentStyles.kuralCardHeaderRow}>
            <KuralText
              style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}
            >
              Kural #{kural.id} • {kural.paal_english_name} — {kural.iyal_english_name} —{' '}
              {kural.adhikaram_english_name}
            </KuralText>
          </View>
        )}

        <Text style={componentStyles.kuralCardTamil}>{kural.line1}</Text>
        <Text style={componentStyles.kuralCardTamil}>{kural.line2}</Text>

        {cardToggle.english && (
          <>
            <Text style={componentStyles.kuralCardTranslation}>{kural.translation}</Text>
            <Text style={componentStyles.kuralCardTranslation}>{kural.explanation}</Text>
          </>
        )}

        {showComments &&
          kural.notes &&
          kural.notes.length > 0 &&
          (() => {
            const preferred = preferredAuthorCode
              ? kural.notes.find((n) => n.author_code === preferredAuthorCode)
              : null;
            const others = preferredAuthorCode
              ? kural.notes.filter((n) => n.author_code !== preferredAuthorCode)
              : kural.notes;

            return (
              <View style={{ marginTop: 16 }}>
                <View style={componentStyles.commentaryDivider} />
                <KuralText style={componentStyles.kuralCardNumber}>
                  {filterLabel('உரை', 'Commentary')}
                </KuralText>

                {preferred ? (
                  <View style={componentStyles.commentaryNoteBlock}>
                    <KuralText style={componentStyles.kuralCardNumber}>
                      {preferred.author_name} ({preferred.author_code})
                    </KuralText>
                    <Text style={componentStyles.kuralCardTranslation}>{preferred.note_text}</Text>
                  </View>
                ) : (
                  others.map((note) => (
                    <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
                      <KuralText style={componentStyles.kuralCardNumber}>
                        {note.author_name} ({note.author_code})
                      </KuralText>
                      <KuralText style={componentStyles.kuralCardTranslation}>
                        {note.note_text}
                      </KuralText>
                    </View>
                  ))
                )}

                {/* Other commentaries — only shown when a preferred is set */}
                {preferred && others.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    <Pressable
                      onPress={() => setOthersExpanded((v) => !v)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                    >
                      <KuralText style={componentStyles.kuralCardNumber}>
                        {filterLabel('மற்ற உரைகள்', 'Other Commentaries')} ({others.length})
                      </KuralText>
                      <KuralText style={[componentStyles.kuralCardNumber, { fontSize: 10 }]}>
                        {othersExpanded ? '▲' : '▼'}
                      </KuralText>
                    </Pressable>

                    {othersExpanded &&
                      others.map((note) => (
                        <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
                          <KuralText style={componentStyles.kuralCardNumber}>
                            {note.author_name} ({note.author_code})
                          </KuralText>
                          <KuralText style={componentStyles.kuralCardTranslation}>
                            {note.note_text}
                          </KuralText>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            );
          })()}
      </Pressable>

      {onBookmarkToggle && (
        <Pressable
          onPress={handleBookmarkPress}
          disabled={bookmarkLoading}
          style={[
            componentStyles.kuralCardBookmarkButton,
            Boolean(kural.is_bookmarked) && componentStyles.kuralCardBookmarkButtonActive,
            bookmarkLoading && componentStyles.kuralCardBookmarkButtonDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={kural.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          <Bookmark
            size={18}
            color={kural.is_bookmarked ? theme.colors.primary : theme.colors.textSecondary}
            fill={kural.is_bookmarked ? theme.colors.accent : 'transparent'}
          />
        </Pressable>
      )}
    </View>
  );
});
