import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from 'src/components/common/KuralText';
import { AuthorNote } from 'src/types/types';

export interface KuralCommentaryProps {
  notes?: AuthorNote[];
  preferredAuthorCode: string | null;
  commentaryToggle: { tamil: boolean; english: boolean };
}

export default React.memo(function KuralCommentary({
  notes,
  preferredAuthorCode,
  commentaryToggle,
}: KuralCommentaryProps) {
  const { componentStyles } = useTheme();
  const [othersExpanded, setOthersExpanded] = useState(false);

  const filterLabel = (tamil: string, english: string): string => {
    if (commentaryToggle.tamil && commentaryToggle.english) return `${tamil} / ${english}`;
    if (commentaryToggle.tamil) return tamil;
    return english;
  };

  if (!notes || notes.length === 0) {
    return null;
  }

  const preferred = preferredAuthorCode
    ? notes.find((n) => n.author_code === preferredAuthorCode)
    : null;
  const others = preferredAuthorCode
    ? notes.filter((n) => n.author_code !== preferredAuthorCode)
    : notes;

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
            <KuralText style={componentStyles.kuralCardTranslation}>{note.note_text}</KuralText>
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
                <KuralText style={componentStyles.kuralCardTranslation}>{note.note_text}</KuralText>
              </View>
            ))}
        </View>
      )}
    </View>
  );
});
