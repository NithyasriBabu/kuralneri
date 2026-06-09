import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, FlatList, ActivityIndicator, useWindowDimensions } from 'react-native';
import { usePaginatedKuralFeed } from 'src/hooks/usePaginatedKuralFeed';

import { FilterHeader } from 'src/components/FilterHeader';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralPaginationBar } from 'src/components/common/KuralPaginationBar';

interface KuralListViewProps {
  onKuralPress?: (kuralId: number) => void;
}

export default function KuralListView({ onKuralPress }: KuralListViewProps) {
  const [kuralsPerPage, setKuralsPerPage] = useState<number>(10);
  const DEFAULT_LIMIT_OPTIONS = [10, 20, 30, 50, 100];
  const [limitOptions, setLimitOptions] = useState<number[]>(DEFAULT_LIMIT_OPTIONS);

  const { width } = useWindowDimensions();
  const { theme, componentStyles } = useTheme();

  const {
    kurals,
    loading,
    page,
    hasMore,
    totalPages,
    totalRecords,

    // Filtering parameters
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
    updateKuralBookmarkStatus,

    // Pagination callbacks
    goToPage,
    visiblePageNumbers,
    kuralFrom,
    kuralTo,
  } = usePaginatedKuralFeed(kuralsPerPage, false, width);

  const listRef = useRef<FlatList>(null);
  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;

  const getGridConfig = () => {
    if (width > 1024) return { columns: 3, wrapperStyle: componentStyles.kuralListGridColumnThird };
    if (width > 600) return { columns: 2, wrapperStyle: componentStyles.kuralListGridColumnHalf };
    return { columns: 1, wrapperStyle: componentStyles.kuralListGridColumnFull };
  };

  const { columns, wrapperStyle } = getGridConfig();

  const handlePageJump = (targetPage: number) => {
    goToPage(targetPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const onBookmarkToggleCallback = (kuralId: number) => async (newStatus: boolean) => {
    await setKuralBookmarkStatus(kuralId, newStatus);
    updateKuralBookmarkStatus(kuralId, newStatus);
  };

  useEffect(() => {
    if (!totalRecords || totalRecords == 0) {
      setLimitOptions([]);
    } else {
      setLimitOptions(DEFAULT_LIMIT_OPTIONS.filter((opt) => opt <= totalRecords));
    }
  }, [totalRecords]);

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

      {loading ? (
        <View style={componentStyles.kuralListCenteredLoader}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={kurals}
          key={`grid-${columns}`}
          numColumns={columns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[componentStyles.kuralListCardWrapper, wrapperStyle]}>
              <KuralCardShell
                kural={item}
                onPress={onKuralPress ? () => onKuralPress(item.id) : undefined}
                onBookmarkToggle={onBookmarkToggleCallback(item.id)}
              />
            </View>
          )}
          contentContainerStyle={componentStyles.kuralListPadding}
        />
      )}
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
        selectedLimit={kuralsPerPage}
        onSelectLimit={setKuralsPerPage}
      />
    </SafeAreaView>
  );
}
