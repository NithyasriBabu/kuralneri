import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';

import { KuralRecord } from 'src/types/types';

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

  const [othersExpanded, setOthersExpanded] = useState(false);

  const preferredAuthorCode = settings.preferredAuthorCode;

  const handleBookmarkPress = async () => {
    if (!onBookmarkToggle) return;
    await onBookmarkToggle(!Boolean(kural.is_bookmarked));
  };

  return (
    <View style={componentStyles.kuralCard}>
      <Pressable onPress={onPress} disabled={!onPress} style={componentStyles.kuralCardPressable}>
        <View style={componentStyles.kuralCardHeaderRow}>
          <Text style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}>
            Kural #{kural.id} • {kural.paal_name} — {kural.adhikaram_name}
          </Text>
        </View>

        <Text style={componentStyles.kuralCardTamil}>{kural.line1}</Text>
        <Text style={componentStyles.kuralCardTamil}>{kural.line2}</Text>

        <Text style={componentStyles.kuralCardTranslation}>
          {kural.translation || kural.explanation}
        </Text>

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

                {/* Primary commentary */}
                <Text style={componentStyles.kuralCardNumber}>உரை / Commentary</Text>
                {preferred ? (
                  <View style={componentStyles.commentaryNoteBlock}>
                    <Text style={componentStyles.kuralCardNumber}>
                      {preferred.author_name} ({preferred.author_code})
                    </Text>
                    <Text style={componentStyles.kuralCardTranslation}>{preferred.note_text}</Text>
                  </View>
                ) : (
                  others.map((note) => (
                    <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
                      <Text style={componentStyles.kuralCardNumber}>
                        {note.author_name} ({note.author_code})
                      </Text>
                      <Text style={componentStyles.kuralCardTranslation}>{note.note_text}</Text>
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
                      <Text style={componentStyles.kuralCardNumber}>
                        மற்ற உரைகள் / Other Commentaries ({others.length})
                      </Text>
                      <Text style={[componentStyles.kuralCardNumber, { fontSize: 10 }]}>
                        {othersExpanded ? '▲' : '▼'}
                      </Text>
                    </Pressable>

                    {othersExpanded &&
                      others.map((note) => (
                        <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
                          <Text style={componentStyles.kuralCardNumber}>
                            {note.author_name} ({note.author_code})
                          </Text>
                          <Text style={componentStyles.kuralCardTranslation}>{note.note_text}</Text>
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
