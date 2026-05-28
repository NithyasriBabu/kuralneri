import React from 'react';
import { Text, View } from 'react-native';

import { kuralCardStyles as styles } from 'src/styles/styles';
import { KuralRecord } from 'src/types/types';

interface KuralCardProps {
  kural: KuralRecord;
  showComments?: boolean;
}

export default React.memo(function KuralCard({ kural, showComments }: KuralCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.kuralNumber}>
        Kural #{kural.id} • {kural.paal_name} — {kural.adhikaram_name}
      </Text>

      <Text style={styles.tamilText}>{kural.line1}</Text>
      <Text style={styles.tamilText}>{kural.line2}</Text>

      <Text style={styles.translationText}>{kural.translation || kural.explanation}</Text>

      {showComments && kural.notes && kural.notes.length > 0 && (
        <View style={styles.commentaryWrapper}>
          <View style={styles.divider} />
          <Text style={styles.commentaryHeader}>உரை / Commentary</Text>

          {kural.notes.map((note) => (
            <View key={note.author_id} style={styles.noteBlock}>
              <Text style={styles.authorBadge}>
                {note.author_name} ({note.author_code})
              </Text>
              <Text style={styles.noteText}>{note.note_text}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});
