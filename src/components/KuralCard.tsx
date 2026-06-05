import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralRecord } from 'src/types/types';

interface KuralCardProps {
  kural: KuralRecord;
  showComments?: boolean;
  onPress?: () => void;
}

export default React.memo(function KuralCard({ kural, showComments, onPress }: KuralCardProps) {
  const { componentStyles } = useTheme();

  const content = (
    <>
      <Text style={componentStyles.kuralCardNumber}>
        Kural #{kural.id} • {kural.paal_name} — {kural.adhikaram_name}
      </Text>

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
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Open Kural ${kural.id}`}
        style={[componentStyles.kuralCard, componentStyles.kuralCardInteractive]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={componentStyles.kuralCard}>{content}</View>;
});
