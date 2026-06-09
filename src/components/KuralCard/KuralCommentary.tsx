import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { KuralText } from 'src/components/common/KuralText';
import { AuthorNote } from 'src/types/types';
import { formatTranslation, useTranslation } from 'src/content/translation';

export interface KuralCommentaryProps {
  notes?: AuthorNote[];
  preferredAuthorCode: string | null;
}

export default React.memo(function KuralCommentary({
  notes,
  preferredAuthorCode,
}: KuralCommentaryProps) {
  const { componentStyles } = useTheme();
  const { settings } = useSettings();
  const { t } = useTranslation('uiChrome', 'cards');
  const [othersExpanded, setOthersExpanded] = useState(false);

  if (!notes || notes.length === 0) {
    return null;
  }

  const preferred = preferredAuthorCode
    ? notes.find((n) => n.author_code === preferredAuthorCode)
    : null;
  const others = preferredAuthorCode
    ? notes.filter((n) => n.author_code !== preferredAuthorCode)
    : notes;
  const authorToggle = settings.langToggles.uiChrome;

  const renderAuthorName = (note: AuthorNote): string => {
    const tamilName = note.author_name_tamil || note.author_name;
    return formatTranslation(tamilName, note.author_name, authorToggle);
  };

  return (
    <View style={{ marginTop: 16 }}>
      <View style={componentStyles.commentaryDivider} />
      <KuralText style={componentStyles.kuralCardNumber}>{t('commentary')}</KuralText>

      {preferred ? (
        <View style={componentStyles.commentaryNoteBlock}>
          <KuralText style={componentStyles.kuralCardNumber}>
            {renderAuthorName(preferred)} ({preferred.author_code})
          </KuralText>
          <KuralText style={componentStyles.kuralCardTranslation}>{preferred.note_text}</KuralText>
        </View>
      ) : (
        others.map((note) => (
          <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
            <KuralText style={componentStyles.kuralCardNumber}>
              {renderAuthorName(note)} ({note.author_code})
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
              {t('otherCommentaries')} ({others.length})
            </KuralText>
            <KuralText style={[componentStyles.kuralCardNumber, { fontSize: 10 }]}>
              {othersExpanded ? '▲' : '▼'}
            </KuralText>
          </Pressable>

          {othersExpanded &&
            others.map((note) => (
              <View key={note.author_id} style={componentStyles.commentaryNoteBlock}>
                <KuralText style={componentStyles.kuralCardNumber}>
                  {renderAuthorName(note)} ({note.author_code})
                </KuralText>
                <KuralText style={componentStyles.kuralCardTranslation}>{note.note_text}</KuralText>
              </View>
            ))}
        </View>
      )}
    </View>
  );
});
