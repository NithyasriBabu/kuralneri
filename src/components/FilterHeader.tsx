import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { PaalRecord, IyalRecord, AdhigaramRecord } from 'src/types/types';

// Atomic Common Components UI imports
import { KuralText } from 'src/components/common/KuralText';
import { KuralInput } from 'src/components/common/KuralInput';
import { KuralDropdown } from 'src/components/common/KuralDropdown';
import { useTranslation } from 'src/content/translation';

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
  const [isExpanded, setIsExpanded] = useState(false);

  const { t: tChrome } = useTranslation('uiChrome', 'filters');
  const { t: tFilter } = useTranslation('uiChrome', 'filters');

  const hasActiveFilters =
    searchQuery.trim().length > 0 || selectedPaal > 0 || selectedIyal > 0 || selectedAdhigaram > 0;

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
    label: `${a.name} (${a.translation})`,
    value: a.id,
  }));
  return (
    <View style={globalStyles.container}>
      <View style={componentStyles.filterToolbar}>
        <View style={componentStyles.filterResultCountContainer}>
          <KuralText
            variant="caption"
            style={componentStyles.filterResultCount}
            accessibilityLabel={`${totalRecords}. ${tChrome('resultCountTooltip')}`}
            accessibilityLiveRegion="polite"
          >
            {totalRecords}
          </KuralText>
        </View>
        <View style={componentStyles.filterSearchShell}>
          <Search size={18} color={theme.colors.textSecondary} />
          <KuralInput
            accessibilityLabel={tChrome('search')}
            placeholder={tChrome('searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={componentStyles.filterSearchInput}
          />
        </View>
        <Pressable
          onPress={() => setIsExpanded((value) => !value)}
          style={({ pressed }) => [
            componentStyles.filterToggleButton,
            isExpanded && componentStyles.filterToggleButtonActive,
            pressed && { opacity: 0.75 },
          ]}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityLabel={tFilter('advancedFilters')}
        >
          <SlidersHorizontal size={20} color={theme.colors.primary} />
          {isWidescreen ? (
            <KuralText variant="caption" style={componentStyles.filterToolbarButtonText}>
              {tFilter('filterButton')}
            </KuralText>
          ) : null}
          {activeFilterCount > 0 ? (
            <View style={componentStyles.filterToggleBadge}>
              <KuralText style={componentStyles.filterToggleBadgeText}>
                {activeFilterCount}
              </KuralText>
            </View>
          ) : null}
        </Pressable>
        {hasActiveFilters ? (
          <Pressable
            onPress={clearAllFilters}
            accessibilityRole="button"
            accessibilityLabel={tFilter('clear')}
            style={({ pressed }) => [
              componentStyles.filterClearButton,
              pressed && { opacity: 0.75 },
            ]}
          >
            <X size={20} color={theme.colors.primary} />
            {isWidescreen ? (
              <KuralText variant="caption" style={componentStyles.filterClearButtonText}>
                {tFilter('clear')}
              </KuralText>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      {/* Main Collapsible Filter Tray Box Section */}
      {Boolean(isExpanded) && (
        <View style={componentStyles.collapsibleContent}>
          <View
            style={[
              globalStyles.dropdownContainer,
              isWidescreen ? globalStyles.row : globalStyles.column,
            ]}
          >
            {/* Tier 1: Section Selector (Paal) */}
            <KuralDropdown
              label={tFilter('section')}
              placeholder={tFilter('allSections')}
              placeholderValue={0}
              items={mappedPaalOptions}
              selectedValue={selectedPaal}
              onValueChange={(val) => selectPaal(val, 0)}
              containerStyle={
                isWidescreen ? globalStyles.flexItem : componentStyles.filterDropdown
              }
            />

            {/* Tier 2: Sub-section Selector (Iyal) */}
            <KuralDropdown
              label={tFilter('subsection')}
              placeholder={tFilter('allSubsections')}
              placeholderValue={0}
              items={mappedIyalOptions}
              selectedValue={selectedIyal}
              onValueChange={(val) => selectIyal(val, 0)}
              containerStyle={
                isWidescreen ? globalStyles.flexItem : componentStyles.filterDropdown
              }
            />

            {/* Tier 3: Chapter Selector (Adhigaram) */}
            <KuralDropdown
              label={tFilter('chapter')}
              placeholder={tFilter('allChapters')}
              placeholderValue={0}
              items={mappedAdhigaramOptions}
              selectedValue={selectedAdhigaram}
              onValueChange={(val) => selectAdhigaram(val, 0)}
              containerStyle={
                isWidescreen ? globalStyles.flexItem : componentStyles.filterDropdown
              }
            />
          </View>
        </View>
      )}
    </View>
  );
}
