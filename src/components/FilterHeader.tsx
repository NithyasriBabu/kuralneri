import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { useSettings } from 'src/context/SettingsContext';
import { PaalRecord, IyalRecord, AdhigaramRecord } from 'src/types/types';

// Atomic Common Components UI imports
import { KuralText } from 'src/components/common/KuralText';
import { KuralInput } from 'src/components/common/KuralInput';
import { KuralDropdown } from 'src/components/common/KuralDropdown';
import { KuralButton } from 'src/components/common/KuralButton';

interface FilterHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedPaal: number;
  selectPaal: (value: any, index: number) => void;
  paalOptions: PaalRecord[];

  selectedIyal: number;
  selectIyal: (value: any, index: number) => void;
  iyalOptions: IyalRecord[];

  selectedAdhigaram: number;
  selectAdhigaram: (value: any, index: number) => void;
  adhigaramOptions: AdhigaramRecord[];

  clearAllFilters: () => void;
  totalRecords: number;
}

export function FilterHeader({
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
  // Query our single-source-of-truth style engine
  const { theme, globalStyles, componentStyles } = useTheme();

  const isWidescreen = theme.layout.isWideScreen;
  const [isExpanded, setIsExpanded] = useState(isWidescreen);

  const { settings } = useSettings();
  const { filterLabels: filterToggle } = settings.langToggles;

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;

  const activeFilterCount = [
    searchQuery.trim().length > 0,
    selectedPaal > 0,
    selectedIyal > 0,
    selectedAdhigaram > 0,
  ].filter(Boolean).length;

  // Format dataset arrays explicitly into the structured DropdownItem[] contracts
  const mappedPaalOptions = paalOptions.map((p) => ({
    label: `${p.name} (${p.translation})`,
    value: p.id,
  }));

  const mappedIyalOptions = iyalOptions.map((i) => ({
    label: `${i.name} (${i.translation})`,
    value: i.id,
  }));

  const mappedAdhigaramOptions = adhigaramOptions.map((a) => ({
    label: `${a.id}. ${a.name} (${a.translation})`,
    value: a.id,
  }));

  const filterLabel = (tamil: string, english: string): string => {
    if (filterToggle.tamil && filterToggle.english) return `${tamil} / ${english}`;
    if (filterToggle.tamil) return tamil;
    return english;
  };

  return (
    <View style={globalStyles.container}>
      {/* Accordion Expansion Trigger Bar */}
      <TouchableOpacity
        style={componentStyles.accordionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
      >
        <View style={componentStyles.accordionLeft}>
          <KuralText variant="bodyNormal" style={componentStyles.accordionTitle}>
            {hasActiveFilters
              ? filterLabel('தேடல் & வடிகட்டி செயலில்', 'Search & Filters Active')
              : filterLabel('தேடல் & வடிகட்டி', 'Search & Filter Verses')}
          </KuralText>
          {Boolean(hasActiveFilters) && (
            <View style={componentStyles.filterBadge}>
              <KuralText variant="caption" style={componentStyles.filterBadgeText}>
                {activeFilterCount}
              </KuralText>
            </View>
          )}
        </View>

        <View style={componentStyles.accordionRight}>
          <KuralText variant="caption" style={componentStyles.counterText}>
            {filterLabel('கண்டறியப்பட்டது', 'Found')} {totalRecords}
          </KuralText>
          <KuralText variant="caption" style={componentStyles.chevronIcon}>
            {isExpanded ? '▲' : '▼'}
          </KuralText>
        </View>
      </TouchableOpacity>

      {/* Main Collapsible Filter Tray Box Section */}
      {Boolean(isExpanded) && (
        <View style={componentStyles.collapsibleContent}>
          <View
            style={[
              globalStyles.dropdownContainer,
              isWidescreen ? globalStyles.row : globalStyles.column,
            ]}
          >
            {/* 🔍 Search Input Sub-Block */}
            <View style={[globalStyles.fieldGroup, isWidescreen && globalStyles.flexItem]}>
              <KuralText
                variant="caption"
                style={[globalStyles.fieldLabel, hasSearchQuery && globalStyles.disabledLabel]}
              >
                {filterLabel('தேடல்', 'Search')}
              </KuralText>
              <KuralInput
                placeholder="Search Kurals by text, meaning, or ID (1-1330)..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onClear={() => setSearchQuery('')}
              />
            </View>

            {/* Tier 1: Section Selector (Paal) */}
            <KuralDropdown
              label={filterLabel('பால்', 'Section')}
              placeholder="All Sections"
              items={mappedPaalOptions}
              selectedValue={selectedPaal}
              onValueChange={(val) => selectPaal(val, 0)}
              disabled={hasSearchQuery}
              containerStyle={isWidescreen ? globalStyles.flexItem : undefined}
            />

            {/* Tier 2: Sub-section Selector (Iyal) */}
            <KuralDropdown
              label={filterLabel('இயல்', 'Sub-section')}
              placeholder="All Sub-sections"
              items={mappedIyalOptions}
              selectedValue={selectedIyal}
              onValueChange={(val) => selectIyal(val, 0)}
              disabled={hasSearchQuery}
              containerStyle={isWidescreen ? globalStyles.flexItem : undefined}
            />

            {/* Tier 3: Chapter Selector (Adhigaram) */}
            <KuralDropdown
              label={filterLabel('அதிகாரம்', 'Chapter')}
              placeholder="All Chapters"
              items={mappedAdhigaramOptions}
              selectedValue={selectedAdhigaram}
              onValueChange={(val) => selectAdhigaram(val, 0)}
              disabled={hasSearchQuery}
              containerStyle={isWidescreen ? globalStyles.flexItem : undefined}
            />

            {/* Clear Filters Action Trigger */}
            {Boolean(hasActiveFilters) && (
              <KuralButton
                title="Clear All Filters"
                variant="secondary"
                onPress={clearAllFilters}
                style={isWidescreen ? { marginTop: 22 } : { marginTop: 8 }}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}
