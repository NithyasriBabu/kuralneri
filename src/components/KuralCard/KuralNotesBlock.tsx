import React from 'react';
import { View } from 'react-native';

import { ErrorBoundary, ErrorFallback } from 'src/components/common/ErrorBoundary';
import { useSettings } from 'src/context/SettingsContext';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useTranslation } from 'src/content/translation';
import { useKuralNotes } from 'src/hooks/useKuralNotes';
import KuralCommentary from 'src/components/KuralCard/KuralCommentary';
import KuralUserNotes from 'src/components/KuralCard/KuralUserNotes';

interface KuralNotesBlockProps {
  kuralId: number;
  preferredAuthorCode: string | null;
  showComments?: boolean;
  showUserNotes?: boolean;
}

function NotesContent({
  kuralId,
  preferredAuthorCode,
  showComments,
  showUserNotes,
}: KuralNotesBlockProps) {
  const { notes, error } = useKuralNotes(kuralId);

  if (error) throw error;

  return (
    <View>
      {showComments ? (
        <KuralCommentary notes={notes} preferredAuthorCode={preferredAuthorCode} />
      ) : null}
      {showUserNotes ? <KuralUserNotes kuralId={kuralId} notes={notes} /> : null}
    </View>
  );
}

export default function KuralNotesBlock({
  kuralId,
  preferredAuthorCode,
  showComments = false,
  showUserNotes = false,
}: KuralNotesBlockProps) {
  const { theme } = useTheme();
  const { settings } = useSettings();
  const { t } = useTranslation('uiChrome', 'cards');
  const notesKey = `${kuralId}-${preferredAuthorCode ?? 'none'}-${showComments}-${showUserNotes}`;

  if (!settings.selfNotesEnabled && !showComments) return null;

  return (
    <ErrorBoundary
      resetKeys={[notesKey]}
      fallback={({ error, resetErrorBoundary }) => (
        <ErrorFallback
          error={error}
          resetErrorBoundary={resetErrorBoundary}
          title={t('notesLoadFailed')}
          message={t('notesLoadFailedBody')}
          primaryActionLabel={t('retryNotes')}
          secondaryActionLabel={t('dismissNotes')}
          onSecondaryAction={resetErrorBoundary}
        />
      )}
      onError={(error) => {
        console.error('[NotesBoundary]', error);
      }}
    >
      <View
        style={{
          marginTop: theme.layout.gridGap,
        }}
      >
        <NotesContent
          kuralId={kuralId}
          preferredAuthorCode={preferredAuthorCode}
          showComments={showComments}
          showUserNotes={showUserNotes && settings.selfNotesEnabled}
        />
      </View>
    </ErrorBoundary>
  );
}
