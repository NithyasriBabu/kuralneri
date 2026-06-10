import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePaginatedKuralFeed } from 'src/hooks/usePaginatedKuralFeed';

import { FilterHeader } from 'src/components/FilterHeader';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralPaginationBar } from 'src/components/common/KuralPaginationBar';
import { KuralRecord } from 'src/types/types';

interface KuralListViewProps {
  onKuralPress?: (kuralId: number) => void;
}

interface KuralListCardProps {
  kural: KuralRecord;
  baseWrapperStyle: StyleProp<ViewStyle>;
  gridWrapperStyle: StyleProp<ViewStyle>;
  onKuralPress?: (kuralId: number) => void;
  updateKuralBookmarkStatus: (kuralId: number, newStatus: boolean) => void;
}

const KuralListCard = React.memo(function KuralListCard({
  kural,
  baseWrapperStyle,
  gridWrapperStyle,
  onKuralPress,
  updateKuralBookmarkStatus,
}: KuralListCardProps) {
  const handlePress = useCallback(() => {
    onKuralPress?.(kural.id);
  }, [kural.id, onKuralPress]);

  const handleBookmarkToggle = useCallback(
    async (newStatus: boolean) => {
      await setKuralBookmarkStatus(kural.id, newStatus);
      updateKuralBookmarkStatus(kural.id, newStatus);
    },
    [kural.id, updateKuralBookmarkStatus],
  );

  return (
    <View style={[baseWrapperStyle, gridWrapperStyle]}>
      <KuralCardShell
        kural={kural}
        onPress={onKuralPress ? handlePress : undefined}
        onBookmarkToggle={handleBookmarkToggle}
      />
    </View>
  );
});

export default function KuralListView({ onKuralPress }: KuralListViewProps) {
  const [kuralsPerPage, setKuralsPerPage] = useState<number>(10);
  const DEFAULT_LIMIT_OPTIONS = [10, 20, 30, 50, 100];
  const [limitOptions, setLimitOptions] = useState<number[]>(DEFAULT_LIMIT_OPTIONS);

  const { theme, componentStyles } = useTheme();
  const screenWidth = theme.layout.screenWidth;

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
    kuralFrom,
    kuralTo,
  } = usePaginatedKuralFeed(kuralsPerPage, false);

  const listRef = useRef<FlatList>(null);
  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;

  const getGridConfig = () => {
    if (screenWidth > 1024)
      return { columns: 3, wrapperStyle: componentStyles.kuralListGridColumnThird };
    if (screenWidth > 600)
      return { columns: 2, wrapperStyle: componentStyles.kuralListGridColumnHalf };
    return { columns: 1, wrapperStyle: componentStyles.kuralListGridColumnFull };
  };

  const { columns, wrapperStyle } = getGridConfig();

  const handlePageJump = (targetPage: number) => {
    goToPage(targetPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
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
            <KuralListCard
              kural={item}
              baseWrapperStyle={componentStyles.kuralListCardWrapper}
              gridWrapperStyle={wrapperStyle}
              onKuralPress={onKuralPress}
              updateKuralBookmarkStatus={updateKuralBookmarkStatus}
            />
          )}
          contentContainerStyle={componentStyles.kuralListPadding}
        />
      )}
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
        selectedLimit={kuralsPerPage}
        onSelectLimit={setKuralsPerPage}
      />
    </SafeAreaView>
  );
}
