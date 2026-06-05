import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
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

        {showComments && kural.notes && kural.notes.length > 0 && (
          <View style={{ marginTop: 16 }}>
            <View style={componentStyles.commentaryDivider} />
            <Text style={componentStyles.kuralCardNumber}>உரை / Commentary</Text>

            {kural.notes.map((note) => (
              <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
                <Text style={componentStyles.kuralCardNumber}>
                  {note.author_name} ({note.author_code})
                </Text>
                <Text style={componentStyles.kuralCardTranslation}>{note.note_text}</Text>
              </View>
            ))}
          </View>
        )}
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
