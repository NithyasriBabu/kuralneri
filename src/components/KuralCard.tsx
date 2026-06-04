import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralRecord } from 'src/types/types';

interface KuralCardProps {
  kural: KuralRecord;
  showComments?: boolean;
}

export default React.memo(function KuralCard({ kural, showComments }: KuralCardProps) {
  const { componentStyles } = useTheme();

  return (
    <View style={componentStyles.kuralCard}>
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
    </View>
  );
});
