import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBookmarkFeed } from 'src/hooks/useBookmarkFeed';
import { FilterHeader } from 'src/components/FilterHeader';
import KuralCard from 'src/components/KuralCard';
import { FeaturePlaceholder } from 'src/components/common/FeaturePlaceholder';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';

interface BookmarksViewProps {
  onKuralPress?: (kuralId: number) => void;
}

export default function BookmarksView({ onKuralPress }: BookmarksViewProps) {
  const [limitOptions, setLimitOptions] = useState<number[]>([10, 20, 30, 50, 100]);
  const [bookmarkLimit, setBookmarkLimit] = useState<number>(10);

  const { width } = useWindowDimensions();
  const { theme, componentStyles } = useTheme();
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
  } = useBookmarkFeed(bookmarkLimit, width);

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
          title="No bookmarks yet"
          subtitle="Saved verses"
          body="Tap the bookmark icon on any kural card to save it here for quick access."
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
              <KuralCard
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
        <View style={componentStyles.kuralListPaginationContainer}>
          <View style={componentStyles.kuralListRibbonRow}>
            <TouchableOpacity
              style={[
                componentStyles.kuralListStepperButton,
                page === 1 && componentStyles.kuralListStepperButtonDisabled,
              ]}
              onPress={() => handlePageJump(page - 1)}
              disabled={page === 1}
            >
              <Text style={componentStyles.kuralListStepperButtonText}>‹</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={componentStyles.kuralListNumberRowPadding}
              style={componentStyles.kuralListNumberScrollView}
            >
              {visiblePageNumbers.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    componentStyles.kuralListNumberButton,
                    page === num && componentStyles.kuralListNumberButtonActive,
                  ]}
                  onPress={() => handlePageJump(num)}
                >
                  <Text
                    style={[
                      componentStyles.kuralListNumberText,
                      page === num && componentStyles.kuralListNumberTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                componentStyles.kuralListStepperButton,
                !hasMore && componentStyles.kuralListStepperButtonDisabled,
              ]}
              onPress={() => handlePageJump(page + 1)}
              disabled={!hasMore}
            >
              <Text style={componentStyles.kuralListStepperButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={componentStyles.kuralListMetaRow}>
            <View style={componentStyles.kuralListMetaColumnLeft}>
              {!hasActiveFilters && (
                <Text style={componentStyles.kuralListMetaText}>
                  Kurals {kuralFrom} - {kuralTo}
                </Text>
              )}
            </View>
            <View style={componentStyles.kuralListMetaColumnCenter}>
              <Text style={componentStyles.kuralListMetaText}>
                Page {page} of {totalPages}
              </Text>
            </View>
            <View style={componentStyles.kuralListMetaColumnRight}>
              {limitOptions.length > 0 && (
                <View style={componentStyles.kuralListBadgeCluster}>
                  <Text style={componentStyles.kuralListLimitTitleText}>
                    {width > 520 ? 'Kurals per page:' : 'Per page:'}
                  </Text>
                  {limitOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        componentStyles.kuralListLimitBadge,
                        bookmarkLimit === opt && componentStyles.kuralListLimitBadgeActive,
                      ]}
                      onPress={() => setBookmarkLimit(opt)}
                    >
                      <Text
                        style={[
                          componentStyles.kuralListLimitBadgeText,
                          bookmarkLimit === opt && componentStyles.kuralListLimitBadgeTextActive,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
