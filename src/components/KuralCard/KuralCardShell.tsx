import React, { useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { useTranslation } from 'src/content/translation';

import { KuralRecord } from 'src/types/types';
import { KuralText } from 'src/components/common/KuralText';
import KuralCouplet from 'src/components/KuralCard/KuralCouplet';
import KuralNotesBlock from 'src/components/KuralCard/KuralNotesBlock';
import { CoachTarget } from 'src/context/CoachMarkContext';

export interface KuralCardShellProps {
  kural: KuralRecord;
  displayContext?: 'selected' | 'explore' | 'bookmarks';
  showUserNotes?: boolean;
  onPress?: () => void;
  onBookmarkToggle?: (nextBookmarked: boolean) => void | Promise<void>;
  bookmarkLoading?: boolean;
  searchQuery?: string;
  highlightBookmark?: boolean;
  bookmarkCoachTargetId?: string;
}

export default React.memo(function KuralCardShell({
  kural,
  displayContext = 'selected',
  showUserNotes = false,
  onPress,
  onBookmarkToggle,
  bookmarkLoading,
  searchQuery,
  highlightBookmark = false,
  bookmarkCoachTargetId,
}: KuralCardShellProps) {
  const { theme, componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'common');
  const { settings } = useSettings();

  const bookmarkPending = useRef(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [bookmarkError, setBookmarkError] = useState(false);
  const bookmarkBusy = bookmarkLoading || savingBookmark;

  const handleBookmarkPress = async (): Promise<void> => {
    if (!onBookmarkToggle || bookmarkLoading || bookmarkPending.current) return;
    bookmarkPending.current = true;
    setSavingBookmark(true);
    setBookmarkError(false);
    try {
      await onBookmarkToggle(!Boolean(kural.is_bookmarked));
    } catch {
      setBookmarkError(true);
    } finally {
      bookmarkPending.current = false;
      setSavingBookmark(false);
    }
  };

  const bookmarkWebProps =
    Platform.OS === 'web'
      ? { title: kural.is_bookmarked ? t('removeBookmark') : t('addBookmark') }
      : {};

  const cardToggle = {
    tamil: settings.language === 'tamil',
    english: settings.language === 'english',
  };
  const preferredAuthorCode = settings.preferredAuthorCode;
  const compact = displayContext === 'explore';
  const isTamil = settings.language === 'tamil';
  const shouldShowComments =
    isTamil &&
    (displayContext === 'selected' ||
      (displayContext === 'bookmarks' && Boolean(preferredAuthorCode)));
  const shouldShowUserNotes = displayContext === 'selected' && showUserNotes;
  const showTranslation = displayContext === 'selected' && !isTamil;
  const showExplanation = !isTamil && displayContext !== 'explore';

  return (
    <View style={[componentStyles.kuralCard, compact && componentStyles.kuralCardCompact]}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          componentStyles.kuralCardPressable,
          compact && componentStyles.kuralCardPressableCompact,
        ]}
      >
        <KuralCouplet
          kural={kural}
          cardToggle={cardToggle}
          headerToggle={cardToggle}
          compact={compact}
          compactFields={{
            taxonomy: false,
            translation: false,
            explanation: false,
          }}
          showTransliteration={!isTamil}
          showTranslation={showTranslation}
          showExplanation={showExplanation}
          searchQuery={searchQuery}
        />
      </Pressable>

      {shouldShowComments || shouldShowUserNotes ? (
        <KuralNotesBlock
          kuralId={kural.id}
          preferredAuthorCode={preferredAuthorCode}
          showComments={shouldShowComments}
          showUserNotes={shouldShowUserNotes}
        />
      ) : null}

      {bookmarkError && (
        <KuralText variant="caption" accessibilityRole="alert" accessibilityLiveRegion="polite">
          {t('bookmarkSaveFailed')}
        </KuralText>
      )}

      {onBookmarkToggle && (
        <CoachTarget
          id={bookmarkCoachTargetId ?? ''}
        >
        <Pressable
          onPress={handleBookmarkPress}
          disabled={bookmarkBusy}
          {...bookmarkWebProps}
          style={[
            componentStyles.kuralCardBookmarkButton,
            Boolean(kural.is_bookmarked) && componentStyles.kuralCardBookmarkButtonActive,
            bookmarkBusy && componentStyles.kuralCardBookmarkButtonDisabled,
            highlightBookmark && {
              borderWidth: 3,
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.accent,
            },
          ]}
          accessibilityState={{ disabled: Boolean(bookmarkBusy), busy: savingBookmark }}
          accessibilityRole="button"
          accessibilityLabel={kural.is_bookmarked ? t('removeBookmark') : t('addBookmark')}
        >
          <Bookmark
            size={18}
            color={kural.is_bookmarked ? theme.colors.primary : theme.colors.textSecondary}
            fill={kural.is_bookmarked ? theme.colors.accent : 'transparent'}
          />
        </Pressable>
        </CoachTarget>
      )}
    </View>
  );
});
