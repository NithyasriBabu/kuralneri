import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Text,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useKuralFeed } from 'src/hooks/useKuralFeed';
import KuralCard from 'src/components/KuralCard';

export default function KuralListView() {
  const [kuralsPerPage, setKuralsPerPage] = useState<number>(10);
  const limitOptions = [10, 20, 30, 50, 100];

  const {
    kurals,
    loading,
    page,
    hasMore,
    totalPages,
    visiblePageNumbers,
    nextPage,
    prevPage,
    goToPage,
  } = useKuralFeed(kuralsPerPage);

  const listRef = useRef<FlatList>(null);

  const handlePageJump = (targetPage: number) => {
    goToPage(targetPage);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <View style={styles.centeredLoader}>
          <ActivityIndicator size="large" color="#344E41" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={kurals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <KuralCard kural={item} />}
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
          {/* Column 1: Centered Page Counter Context */}
          <View style={styles.metaColumnLeft}>
            <Text style={styles.pageIndicator}>
              Page {page} of {totalPages}
            </Text>
          </View>

          {/* Column 2: Centered Inline Button Badges Cluster */}
          <View style={styles.metaColumnRight}>
            <View style={styles.badgeCluster}>
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
    marginBottom: 15,
    textAlign: 'center',
  },
  listPadding: {
    paddingHorizontal: 20,
    paddingBottom: 165,
  },
  centeredLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: {
    backgroundColor: '#344E41', // Deep forest canvas
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
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 6,
  },
  metaColumnLeft: {
    flex: 1,
    alignItems: 'flex-start', // Anchors the counter naturally on the left half layout boundary
  },
  metaColumnRight: {
    flex: 1,
    alignItems: 'flex-end', // Anchors the selection blocks cleanly on the right half layout boundary
  },
  pageIndicator: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    fontWeight: 'bold',
    color: '#DAD7CD',
  },
  badgeCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  limitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'transparent', // Seamless blending into the pagination container
    borderWidth: 1,
    borderColor: '#4A6153', // Subtle internal framework framing lines
    marginLeft: 6,
    minWidth: 32,
    alignItems: 'center',
  },
  limitBadgeActive: {
    backgroundColor: '#A3B18A', // High contrast active fill color
    borderColor: '#A3B18A',
  },
  limitBadgeText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#DAD7CD', // Earthy text tone
  },
  limitBadgeTextActive: {
    color: '#344E41', // Flipped theme contrast for active row elements
  },
});
