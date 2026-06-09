import React from 'react';
import { Pressable, View } from 'react-native';
import { Bookmark } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { useTranslation } from 'src/content/translation';

import { KuralRecord } from 'src/types/types';
import KuralCouplet from 'src/components/KuralCard/KuralCouplet';
import KuralCommentary from 'src/components/KuralCard/KuralCommentary';

export interface KuralCardShellProps {
  kural: KuralRecord;
  showComments?: boolean;
  onPress?: () => void;
  onBookmarkToggle?: (nextBookmarked: boolean) => void | Promise<void>;
  bookmarkLoading?: boolean;
}

export default React.memo(function KuralCardShell({
  kural,
  showComments,
  onPress,
  onBookmarkToggle,
  bookmarkLoading,
}: KuralCardShellProps) {
  const { theme, componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'common');
  const { settings } = useSettings();

  const handleBookmarkPress = async () => {
    if (!onBookmarkToggle) return;
    await onBookmarkToggle(!Boolean(kural.is_bookmarked));
  };

  const { kuralCard: cardToggle, sectionHeaders: headerToggle } = settings.langToggles;
  const preferredAuthorCode = settings.preferredAuthorCode;

  return (
    <View style={componentStyles.kuralCard}>
      <Pressable onPress={onPress} disabled={!onPress} style={componentStyles.kuralCardPressable}>
        <KuralCouplet kural={kural} cardToggle={cardToggle} headerToggle={headerToggle} />

        {showComments && (
          <KuralCommentary notes={kural.notes} preferredAuthorCode={preferredAuthorCode} />
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
          accessibilityLabel={kural.is_bookmarked ? t('removeBookmark') : t('addBookmark')}
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
