import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { KuralText } from 'src/components/common/KuralText';
import { KuralInput } from 'src/components/common/KuralInput';
import { KuralButton } from 'src/components/common/KuralButton';
import { AuthorNote } from 'src/types/types';
import { deleteUserNote, saveUserNote } from 'src/data/services';
import { useTranslation } from 'src/content/translation';

export interface KuralUserNotesProps {
  kuralId: number;
  notes?: AuthorNote[];
}

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(noteDate: string): string {
  const date = new Date(`${noteDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? noteDate : date.toLocaleDateString();
}

export default React.memo(function KuralUserNotes({ kuralId, notes }: KuralUserNotesProps) {
  const { componentStyles } = useTheme();
  const { settings } = useSettings();
  const { t } = useTranslation('uiChrome', 'cards');
  const today = getLocalDateString();

  const initialUserNotes = useMemo(
    () => (notes ?? []).filter((note) => note.note_source === 'user'),
    [notes],
  );

  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<AuthorNote[]>(initialUserNotes);

  useEffect(() => {
    setUserNotes(initialUserNotes);
  }, [initialUserNotes]);

  const sortedUserNotes = useMemo(
    () =>
      [...userNotes].sort((a, b) => {
        const left = a.updated_at ?? a.note_date ?? '';
        const right = b.updated_at ?? b.note_date ?? '';
        return left < right ? 1 : left > right ? -1 : 0;
      }),
    [userNotes],
  );

  const currentNote = useMemo(
    () => sortedUserNotes.find((note) => note.note_date === today) ?? null,
    [sortedUserNotes, today],
  );

  const historyNotes = useMemo(
    () => sortedUserNotes.filter((note) => note.note_date !== today),
    [sortedUserNotes, today],
  );

  useEffect(() => {
    setDraft(currentNote?.note_text ?? '');
  }, [currentNote?.note_text, currentNote?.note_date]);

  const persist = async () => {
    setSaving(true);
    try {
      const saved = await saveUserNote(kuralId, draft);
      if (!saved) return;

      setStatusText(t('notesSavedToday'));
      setUserNotes((current) => {
        const withoutToday = current.filter((note) => note.note_date !== saved.note_date);
        return [saved, ...withoutToday].sort((a, b) => {
          const left = a.updated_at ?? a.note_date ?? '';
          const right = b.updated_at ?? b.note_date ?? '';
          return left < right ? 1 : left > right ? -1 : 0;
        });
      });
    } finally {
      setSaving(false);
    }
  };

  const removeTodayNote = async () => {
    setSaving(true);
    try {
      await deleteUserNote(kuralId);
      setDraft('');
      setStatusText(null);
      setUserNotes((current) => current.filter((note) => note.note_date !== today));
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setDraft('');
    setStatusText(null);
  };

  return (
    <View style={componentStyles.userNotesSection}>
      <View style={componentStyles.userNotesTitleRow}>
        <KuralText style={componentStyles.userNotesTitle}>{t('myNotes')}</KuralText>
        {statusText ? (
          <KuralText style={componentStyles.userNotesHistoryDate}>{statusText}</KuralText>
        ) : null}
      </View>

      <View style={componentStyles.userNotesEditorCard}>
        <KuralInput
          value={draft}
          multiline
          numberOfLines={4}
          placeholder={t('notePlaceholder')}
          onChangeText={(value) => {
            setDraft(value);
            setStatusText(null);
          }}
          containerStyle={componentStyles.userNotesInput}
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
          spellCheck={settings.langToggles.uiChrome.english}
        />

        <View style={componentStyles.userNotesActionsRow}>
          <KuralButton
            title={currentNote ? t('editNote') : t('addNote')}
            onPress={persist}
            loading={saving}
            disabled={!draft.trim().length}
          />
          <KuralButton
            title={t('clearNote')}
            variant="secondary"
            onPress={handleClear}
            disabled={!draft.trim().length || saving}
          />
          {currentNote ? (
            <KuralButton
              title={t('deleteNote')}
              variant="secondary"
              onPress={removeTodayNote}
              loading={saving}
            />
          ) : null}
        </View>

        {currentNote ? (
          <KuralText style={componentStyles.userNotesHistoryDate}>
            {t('noteDateLabel')}: {formatDisplayDate(currentNote.note_date ?? today)}
          </KuralText>
        ) : (
          <KuralText style={componentStyles.userNotesEmptyText}>{t('noUserNotes')}</KuralText>
        )}
      </View>

      {historyNotes.length > 0 ? (
        <View style={componentStyles.userNotesHistoryList}>
          <KuralText style={componentStyles.userNotesTitle}>{t('noteHistory')}</KuralText>
          {historyNotes.map((note) => (
            <View
              key={`${note.note_date}-${note.updated_at}-${note.note_text}`}
              style={componentStyles.userNotesHistoryItem}
            >
              <View style={componentStyles.userNotesHistoryMeta}>
                <KuralText style={componentStyles.userNotesHistoryDate}>
                  {formatDisplayDate(note.note_date ?? today)}
                </KuralText>
              </View>
              <KuralText style={componentStyles.userNotesHistoryBody}>{note.note_text}</KuralText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
});
