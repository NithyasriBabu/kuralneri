import React, { useRef, useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useKuralFeed } from 'src/hooks/useKuralFeed';

import { FilterHeader } from 'src/components/FilterHeader';
import KuralCard from 'src/components/KuralCard';

export default function KuralListView() {
  const [kuralsPerPage, setKuralsPerPage] = useState<number>(10);
  const DEFAULT_LIMIT_OPTIONS = [10, 20, 30, 50, 100];
  const [limitOptions, setLimitOptions] = useState<number[]>(DEFAULT_LIMIT_OPTIONS);

  const { width } = useWindowDimensions();

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

    // Pagination callbacks
    nextPage,
    prevPage,
    goToPage,
    visiblePageNumbers,
    kuralFrom,
    kuralTo,
  } = useKuralFeed(kuralsPerPage, width);

  const listRef = useRef<FlatList>(null);
  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;

  const getGridConfig = () => {
    if (width > 1024) return { columns: 3, wrapperStyle: styles.gridColumnThird };
    if (width > 600) return { columns: 2, wrapperStyle: styles.gridColumnHalf };
    return { columns: 1, wrapperStyle: styles.gridColumnFull };
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <FilterHeader
        screenWidth={width}
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
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color="#344E41" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={kurals}
          key={`grid-${columns}`}
          numColumns={columns}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.cardContainerWrapper, wrapperStyle]}>
              <KuralCard kural={item} />
            </View>
          )}
          contentContainerStyle={styles.listPadding}
        />
      )}

      <View style={styles.paginationContainer}>
        <View style={styles.ribbonRow}>
          <TouchableOpacity
            style={[styles.stepperButton, page === 1 && styles.stepperButtonDisabled]}
            onPress={() => handlePageJump(page - 1)}
            disabled={page === 1 || loading}
          >
            <Text style={styles.stepperButtonText}>‹</Text>
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.numberRowPadding}
            style={styles.numberScrollView}
          >
            {visiblePageNumbers.map((num) => (
              <TouchableOpacity
                key={num}
                style={[styles.numberButton, page === num && styles.numberButtonActive]}
                onPress={() => handlePageJump(num)}
                disabled={loading}
              >
                <Text style={[styles.numberText, page === num && styles.numberTextActive]}>
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.stepperButton, !hasMore && styles.stepperButtonDisabled]}
            onPress={() => handlePageJump(page + 1)}
            disabled={!hasMore || loading}
          >
            <Text style={styles.stepperButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaColumnLeft}>
            {!hasActiveFilters && (
              <Text style={styles.metaText}>
                Kurals {kuralFrom} - {kuralTo}
              </Text>
            )}
          </View>
          <View style={styles.metaColumnCenter}>
            <Text style={styles.metaText}>
              Page {page} of {totalPages}
            </Text>
          </View>
          <View style={styles.metaColumnRight}>
            {limitOptions.length > 0 && (
              <View style={styles.badgeCluster}>
                <Text style={styles.limitTitleText}>
                  {width > 520 ? 'Kurals per page:' : 'Per page:'}
                </Text>
                {limitOptions.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.limitBadge, kuralsPerPage === opt && styles.limitBadgeActive]}
                    onPress={() => setKuralsPerPage(opt)}
                  >
                    <Text
                      style={[
                        styles.limitBadgeText,
                        kuralsPerPage === opt && styles.limitBadgeTextActive,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DAD7CD',
  },
  header: {
    fontSize: 28,
    fontFamily: 'MuktaMalar_700Bold',
    color: '#344E41',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
  listPadding: {
    paddingHorizontal: 10,
    paddingBottom: 165,
  },
  cardContainerWrapper: {
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  gridColumnFull: {
    flex: 1,
  },
  gridColumnHalf: {
    flex: 0.5,
  },
  gridColumnThird: {
    flex: 0.333,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    backgroundColor: '#344E41',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
    paddingBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  ribbonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4A6153',
    paddingBottom: 10,
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#A3B18A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: '#4A6153',
    opacity: 0.3,
  },
  stepperButtonText: {
    color: '#344E41',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: Platform.OS === 'ios' ? 24 : 28,
  },
  numberScrollView: {
    flex: 1,
    marginHorizontal: 8,
  },
  numberRowPadding: {
    paddingHorizontal: 4,
    flexGrow: 1,
    justifyContent: 'center',
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  numberButtonActive: {
    backgroundColor: '#A3B18A',
  },
  numberText: {
    fontFamily: 'Inter_400Regular',
    color: '#A3B18A',
    fontSize: 14,
    fontWeight: '600',
  },
  numberTextActive: {
    color: '#344E41',
    fontWeight: 'bold',
  },
  // 🎯 RECONSTRUCTED TRIPLE-COLUMN SPATIAL LAYOUT
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 6,
  },
  metaColumnLeft: {
    flex: 1,
    alignItems: 'flex-start', // Push telemetry strings to left margin edge
  },
  metaColumnCenter: {
    flex: 1,
    alignItems: 'center', // Center page status context dead-middle
  },
  metaColumnRight: {
    flex: 1,
    alignItems: 'flex-end', // Flush badges structure to right edge margin
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DAD7CD',
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitTitleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    fontWeight: 'bold',
    color: '#DAD7CD',
    marginRight: 6,
  },
  limitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A6153',
    marginLeft: 4,
    minWidth: 30,
    alignItems: 'center',
  },
  limitBadgeActive: {
    backgroundColor: '#A3B18A',
    borderColor: '#A3B18A',
  },
  limitBadgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#DAD7CD',
  },
  limitBadgeTextActive: {
    color: '#344E41',
  },
});
