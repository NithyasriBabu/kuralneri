import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleProp, View, ViewStyle } from 'react-native';
import { Eraser } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePaginatedKuralFeed } from 'src/hooks/usePaginatedKuralFeed';
import { FilterHeader } from 'src/components/FilterHeader';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { KuralIconButton } from 'src/components/common/KuralIconButton';
import { KuralPaginationBar } from 'src/components/common/KuralPaginationBar';
import { setKuralBookmarkStatus } from 'src/data/services';
import { clearAllBookmarks } from 'src/data/services/settingsService';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useTranslation } from 'src/content/translation';
import { CoachTarget } from 'src/context/CoachMarkContext';

interface BookmarksViewProps {
  onKuralPress?: (kuralId: number) => void;
  coachTarget?: string;
}

interface BookmarkListCardProps {
  kural: React.ComponentProps<typeof KuralCardShell>['kural'];
  wrapperStyle: StyleProp<ViewStyle>;
  searchQuery: string;
  onKuralPress?: (kuralId: number) => void;
  highlightBookmark: boolean;
  bookmarkCoachTargetId?: string;
}

const BookmarkListCard = React.memo(function BookmarkListCard({
  kural,
  wrapperStyle,
  searchQuery,
  onKuralPress,
  highlightBookmark,
  bookmarkCoachTargetId,
}: BookmarkListCardProps) {
  const handlePress = useCallback(() => {
    onKuralPress?.(kural.id);
  }, [kural.id, onKuralPress]);

  const handleBookmarkToggle = useCallback(
    async (nextBookmarked: boolean) => {
      await setKuralBookmarkStatus(kural.id, nextBookmarked);
    },
    [kural.id],
  );

  return (
    <View style={wrapperStyle}>
      <KuralCardShell
        kural={kural}
        displayContext="bookmarks"
        onPress={onKuralPress ? handlePress : undefined}
        onBookmarkToggle={handleBookmarkToggle}
        searchQuery={searchQuery}
        highlightBookmark={highlightBookmark}
        bookmarkCoachTargetId={bookmarkCoachTargetId}
      />
    </View>
  );
});

export default function BookmarksView({
  onKuralPress,
  coachTarget,
}: BookmarksViewProps) {
  const [limitOptions, setLimitOptions] = useState<number[]>([10, 20, 30, 50, 100]);
  const [bookmarkLimit, setBookmarkLimit] = useState<number>(10);

  const { theme, componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'cards');
  const { t: tSettings, pair } = useTranslation('uiChrome', 'settings');
  const listRef = useRef<FlatList>(null);

  const {
    kurals,
    loading,
    loadingMore,
    page,
    hasMore,
    totalPages,
    totalRecords,
    searchPending,
    searchQuery,
    setSearchQuery,
    selectedPaal,
    selectPaal,
    paalOptions,
    selectedIyal,
    selectIyal,
    iyalOptions,
    selectedAdhigaram,
    selectAdhigaram,
    adhigaramOptions,
    clearAllFilters,
    goToPage,
    loadNextPage,
    refresh,
    kuralFrom,
    kuralTo,
  } = usePaginatedKuralFeed(bookmarkLimit, true);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;
  const useInfiniteScroll = theme.layout.screenWidth <= 600;

  const getGridConfig = () => {
    if (theme.layout.screenWidth > 1024)
      return { columns: 3, wrapperStyle: componentStyles.kuralListGridColumnThird };
    if (theme.layout.screenWidth > 600)
      return { columns: 2, wrapperStyle: componentStyles.kuralListGridColumnHalf };
    return { columns: 1, wrapperStyle: componentStyles.kuralListGridColumnFull };
  };

  const gridConfig = getGridConfig();
  const { columns, wrapperStyle } = gridConfig;

  useEffect(() => {
    if (!totalRecords) {
      setLimitOptions([]);
      return;
    }

    const allowed = [10, 20, 30, 50, 100].filter((opt) => opt <= totalRecords);
    setLimitOptions(allowed);
    if (!allowed.includes(bookmarkLimit)) {
      setBookmarkLimit(allowed[0] ?? 10);
    }
  }, [totalRecords, bookmarkLimit]);

  const handlePageJump = (targetPage: number) => {
    goToPage(targetPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleClearBookmarks = () => {
    Alert.alert(tSettings('clearAllBookmarks'), tSettings('clearBookmarksPrompt'), [
      { text: tSettings('cancel'), style: 'cancel' },
      {
        text: tSettings('confirmReset'),
        style: 'destructive',
        onPress: async () => {
          await clearAllBookmarks();
          await refresh();
        },
      },
    ]);
  };

  if (loading || searchPending) {
    return (
      <SafeAreaView
        style={componentStyles.kuralListScreen}
        edges={['top', 'left', 'right', 'bottom']}
      >
        <View style={componentStyles.kuralListCenteredLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={componentStyles.kuralListScreen}
      edges={['top', 'left', 'right', 'bottom']}
    >
      <FilterHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedPaal={selectedPaal}
        selectPaal={selectPaal}
        selectedIyal={selectedIyal}
        selectIyal={selectIyal}
        selectedAdhigaram={selectedAdhigaram}
        selectAdhigaram={selectAdhigaram}
        paalOptions={paalOptions}
        iyalOptions={iyalOptions}
        adhigaramOptions={adhigaramOptions}
        clearAllFilters={clearAllFilters}
        totalRecords={totalRecords}
      />

      <View
        style={{
          paddingHorizontal: theme.layout.screenPadding,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <CoachTarget id="bookmarks-clear-all">
        <KuralIconButton
          icon={<Eraser />}
          label={pair('clearAllBookmarks').visible}
          tooltip={pair('clearAllBookmarks').hover}
          onPress={handleClearBookmarks}
          disabled={totalRecords === 0}
        />
        </CoachTarget>
      </View>

      {totalRecords === 0 ? (
        <FeaturePlaceholder
          icon="🔖"
          title={t('noBookmarksTitle')}
          subtitle={t('noBookmarksSubtitle')}
          body={t('noBookmarksBody')}
        />
      ) : (
        <FlatList
          testID="print-scroll-container"
          ref={listRef}
          data={kurals}
          key={`bookmarks-grid-${columns}`}
          numColumns={columns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <BookmarkListCard
              kural={item}
              wrapperStyle={[
                componentStyles.kuralListCardWrapper,
                wrapperStyle,
              ]}
              searchQuery={searchQuery}
              onKuralPress={onKuralPress}
              highlightBookmark={coachTarget === 'bookmarks-remove-one' && index === 0}
              bookmarkCoachTargetId={index === 0 ? 'bookmarks-remove-one' : undefined}
            />
          )}
          onEndReached={useInfiniteScroll ? loadNextPage : undefined}
          onEndReachedThreshold={0.45}
          ListFooterComponent={
            useInfiniteScroll && loadingMore ? (
              <View style={componentStyles.kuralListLoadMoreIndicator}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            ) : undefined
          }
          contentContainerStyle={componentStyles.kuralListPadding}
        />
      )}
      {totalRecords > 0 && !useInfiniteScroll && (
        <KuralPaginationBar
          page={page}
          totalPages={totalPages}
          hasMore={hasMore}
          loading={loading}
          onPageJump={handlePageJump}
          showRange={!hasActiveFilters}
          rangeStart={kuralFrom}
          rangeEnd={kuralTo}
          limitOptions={limitOptions}
          selectedLimit={bookmarkLimit}
          onSelectLimit={setBookmarkLimit}
        />
      )}
    </SafeAreaView>
  );
}
