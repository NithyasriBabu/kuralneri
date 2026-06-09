import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { usePaginatedKuralFeed } from 'src/hooks/usePaginatedKuralFeed';

import { FilterHeader } from 'src/components/FilterHeader';
import KuralCardShell from 'src/components/KuralCard/KuralCardShell';
import { setKuralBookmarkStatus } from 'src/data/services';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';

interface KuralListViewProps {
  onKuralPress?: (kuralId: number) => void;
}

export default function KuralListView({ onKuralPress }: KuralListViewProps) {
  const [kuralsPerPage, setKuralsPerPage] = useState<number>(10);
  const DEFAULT_LIMIT_OPTIONS = [10, 20, 30, 50, 100];
  const [limitOptions, setLimitOptions] = useState<number[]>(DEFAULT_LIMIT_OPTIONS);

  const { width } = useWindowDimensions();
  const { theme, componentStyles } = useTheme();
  const { settings } = useSettings();
  const { sectionHeaders: headerToggle } = settings.langToggles;

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

      <View style={componentStyles.kuralListPaginationContainer}>
        <View style={componentStyles.kuralListRibbonRow}>
          <TouchableOpacity
            style={[
              componentStyles.kuralListStepperButton,
              page === 1 && componentStyles.kuralListStepperButtonDisabled,
            ]}
            onPress={() => handlePageJump(page - 1)}
            disabled={page === 1 || loading}
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
                disabled={loading}
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
            disabled={!hasMore || loading}
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
                      kuralsPerPage === opt && componentStyles.kuralListLimitBadgeActive,
                    ]}
                    onPress={() => setKuralsPerPage(opt)}
                  >
                    <Text
                      style={[
                        componentStyles.kuralListLimitBadgeText,
                        kuralsPerPage === opt && componentStyles.kuralListLimitBadgeTextActive,
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
    </SafeAreaView>
  );
}
