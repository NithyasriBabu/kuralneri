import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { commonStyles as styles } from 'src/styles/styles';
import { PaalRecord, IyalRecord, AdhigaramRecord } from 'src/types/types';

interface FilterHeaderProps {
  screenWidth: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedPaal: number;
  selectPaal: (value: unknown) => void;
  paalOptions: PaalRecord[];

  selectedIyal: number;
  selectIyal: (value: unknown) => void;
  iyalOptions: IyalRecord[];

  selectedAdhigaram: number;
  selectAdhigaram: (value: unknown) => void;
  adhigaramOptions: AdhigaramRecord[];

  clearAllFilters: () => void;
  totalRecords: number;
}

export function FilterHeader({
  screenWidth,
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
  totalRecords,
}: FilterHeaderProps) {
  const isWidescreen = screenWidth > 768;
  const [isExpanded, setIsExpanded] = useState(isWidescreen);

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  // Calculate dynamic count for badges safely (React Native crashes if raw booleans are rendered as text strings)
  const activeFilterCount = [
    searchQuery.trim().length > 0,
    selectedPaal > 0,
    selectedIyal > 0,
    selectedAdhigaram > 0,
  ].filter(Boolean).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={styles.accordionLeft}>
          <Text style={styles.accordionTitle}>
            {hasActiveFilters ? 'Search & Filters Active' : 'Search & Filter Verses'}
          </Text>
          {Boolean(hasActiveFilters) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </View>

        <View style={styles.accordionRight}>
          <Text style={styles.counterText}>Found {totalRecords}</Text>
          <Text style={styles.chevronIcon}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>
      {Boolean(isExpanded) && (
        <View style={styles.collapsibleContent}>
          <View style={[styles.dropdownContainer, isWidescreen ? styles.row : styles.column]}>
            {/* 🔍 Search Input Bar */}
            <View style={[styles.fieldGroup, isWidescreen && styles.flexItem]}>
              <Text style={[styles.label, hasSearchQuery && styles.disabledLabel]}>Search</Text>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search Kurals by text, meaning, or ID (1-1330)..."
                  placeholderTextColor="#888"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>
            {/* Tier 1: Paal Selector */}
            <View style={[styles.fieldGroup, isWidescreen && styles.flexItem]}>
              <Text style={[styles.label, hasSearchQuery && styles.disabledLabel]}>
                Section (பால் / Paal)
              </Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedPaal}
                  onValueChange={selectPaal}
                  enabled={!hasSearchQuery}
                  style={styles.picker}
                >
                  <Picker.Item label="All Sections" value={0} />
                  {paalOptions.map((paal) => (
                    <Picker.Item
                      key={paal.id}
                      label={`${paal.name} (${paal.translation})`}
                      value={paal.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Tier 2: Iyal Selector */}
            <View style={[styles.fieldGroup, isWidescreen && styles.flexItem]}>
              <Text style={[styles.label, hasSearchQuery && styles.disabledLabel]}>
                Sub-section (இயல் / Iyal)
              </Text>
              <View style={[styles.pickerWrapper]}>
                <Picker
                  selectedValue={selectedIyal}
                  onValueChange={selectIyal}
                  enabled={!hasSearchQuery}
                  style={styles.picker}
                >
                  <Picker.Item label="All Sub-sections" value={0} />
                  {iyalOptions.map((iyal) => (
                    <Picker.Item
                      key={iyal.id}
                      label={`${iyal.name} (${iyal.translation})`}
                      value={iyal.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Tier 3: Adhigaram Selector */}
            <View style={[styles.fieldGroup, isWidescreen && styles.flexItem]}>
              <Text style={[styles.label, hasSearchQuery && styles.disabledLabel]}>
                Chapter (அதிகாரம் / Adhigaram)
              </Text>
              <View style={[styles.pickerWrapper]}>
                <Picker
                  selectedValue={selectedAdhigaram}
                  onValueChange={selectAdhigaram}
                  enabled={!hasSearchQuery}
                  style={styles.picker}
                >
                  <Picker.Item label="All Chapters" value={0} />
                  {adhigaramOptions.map((adhigaram) => (
                    <Picker.Item
                      key={adhigaram.id}
                      label={`${adhigaram.id}. ${adhigaram.name} (${adhigaram.translation})`}
                      value={adhigaram.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
            {Boolean(hasActiveFilters) && (
              <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
