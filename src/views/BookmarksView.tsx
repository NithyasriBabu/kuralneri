import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePaginatedKuralFeed } from 'src/hooks/usePaginatedKuralFeed';
import { FilterHeader } from 'src/components/FilterHeader';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { KuralPaginationBar } from 'src/components/common/KuralPaginationBar';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { useTranslation } from 'src/content/translation';

interface BookmarksViewProps {
  onKuralPress?: (kuralId: number) => void;
}

export default function BookmarksView({ onKuralPress }: BookmarksViewProps) {
  const [limitOptions, setLimitOptions] = useState<number[]>([10, 20, 30, 50, 100]);
  const [bookmarkLimit, setBookmarkLimit] = useState<number>(10);

  const { width } = useWindowDimensions();
  const { theme, componentStyles } = useTheme();
  const { settings } = useSettings();
  const { t } = useTranslation('uiChrome', 'cards');
  const listRef = useRef<FlatList>(null);

  const {
    kurals,
    loading,
    page,
    hasMore,
    totalPages,
    totalRecords,
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
    visiblePageNumbers,
    kuralFrom,
    kuralTo,
    updateKuralBookmarkStatus,
  } = usePaginatedKuralFeed(bookmarkLimit, true, width);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;

  const getGridConfig = () => {
    if (width > 1024) return { columns: 3, wrapperStyle: componentStyles.kuralListGridColumnThird };
    if (width > 600) return { columns: 2, wrapperStyle: componentStyles.kuralListGridColumnHalf };
    return { columns: 1, wrapperStyle: componentStyles.kuralListGridColumnFull };
  };

  const { columns, wrapperStyle } = getGridConfig();

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

  if (loading) {
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

      {totalRecords === 0 ? (
        <FeaturePlaceholder
          icon="🔖"
          title={t('noBookmarksTitle')}
          subtitle={t('noBookmarksSubtitle')}
          body={t('noBookmarksBody')}
        />
      ) : (
        <FlatList
          ref={listRef}
          data={kurals}
          key={`bookmarks-grid-${columns}`}
          numColumns={columns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[componentStyles.kuralListCardWrapper, wrapperStyle]}>
              <KuralCardShell
                kural={item}
                onPress={onKuralPress ? () => onKuralPress(item.id) : undefined}
                onBookmarkToggle={async (nextBookmarked) => {
                  const next = await setKuralBookmarkStatus(item.id, nextBookmarked);
                  updateKuralBookmarkStatus(item.id, next);
                }}
              />
            </View>
          )}
          contentContainerStyle={componentStyles.kuralListPadding}
        />
      )}
      {totalRecords > 0 && (
        <KuralPaginationBar
          page={page}
          totalPages={totalPages}
          hasMore={hasMore}
          loading={loading}
          visiblePageNumbers={visiblePageNumbers}
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
