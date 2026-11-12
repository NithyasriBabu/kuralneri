import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ChevronDown, ChevronUp, FilterX, X } from 'lucide-react-native';
import { useTheme } from 'src/theme/ThemeContextProvider';
import { PaalRecord, IyalRecord, AdhigaramRecord } from 'src/types/types';

// Atomic Common Components UI imports
import { KuralText } from 'src/components/common/KuralText';
import { KuralInput } from 'src/components/common/KuralInput';
import { KuralDropdown } from 'src/components/common/KuralDropdown';
import { KuralIconButton } from 'src/components/common/KuralIconButton';
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
  const [isExpanded, setIsExpanded] = useState(isWidescreen);

  const { t, pair } = useTranslation('uiChrome', 'filters');

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
  const selectedPaalLabel = mappedPaalOptions.find((item) => item.value === selectedPaal)?.label;
  const selectedIyalLabel = mappedIyalOptions.find((item) => item.value === selectedIyal)?.label;
  const selectedAdhigaramLabel = mappedAdhigaramOptions.find(
    (item) => item.value === selectedAdhigaram,
  )?.label;
  const activeChips = [
    searchQuery.trim()
      ? { key: 'search', label: searchQuery.trim(), clear: () => setSearchQuery('') }
      : null,
    selectedPaal > 0
      ? { key: 'paal', label: selectedPaalLabel ?? t('section'), clear: () => selectPaal(0, 0) }
      : null,
    selectedIyal > 0
      ? { key: 'iyal', label: selectedIyalLabel ?? t('subsection'), clear: () => selectIyal(0, 0) }
      : null,
    selectedAdhigaram > 0
      ? {
          key: 'adhigaram',
          label: selectedAdhigaramLabel ?? t('chapter'),
          clear: () => selectAdhigaram(0, 0),
        }
      : null,
  ].filter((chip): chip is NonNullable<typeof chip> => chip !== null);

  return (
    <View style={globalStyles.container}>
      {/* Accordion Expansion Trigger Bar */}
      <TouchableOpacity
        style={componentStyles.accordionHeader}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={t('advancedFilters')}
      >
        <View style={componentStyles.accordionLeft}>
          <KuralText variant="bodyNormal" style={componentStyles.accordionTitle}>
            {hasActiveFilters ? t('searchAndFiltersActive') : t('searchAndFilterVerses')}
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
          <KuralText
            variant="caption"
            style={componentStyles.counterText}
            accessibilityLiveRegion="polite"
          >
            {t('found')} {totalRecords}
          </KuralText>
          {isExpanded ? (
            <ChevronUp size={16} color={theme.colors.textSecondary} />
          ) : (
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      <View style={componentStyles.filterPersistentSearch}>
        <KuralText variant="caption" style={globalStyles.fieldLabel}>
          {t('search')}
        </KuralText>
        <KuralInput
          accessibilityLabel={t('search')}
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {activeChips.length > 0 ? (
        <View style={componentStyles.filterChipRow}>
          {activeChips.map((chip) => (
            <TouchableOpacity
              key={chip.key}
              onPress={chip.clear}
              accessibilityRole="button"
              accessibilityLabel={`${t('removeFilter')} ${chip.label}`}
              style={componentStyles.filterChip}
            >
              <KuralText variant="caption" style={componentStyles.filterChipText} numberOfLines={1}>
                {chip.label}
              </KuralText>
              <X size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

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
              label={t('section')}
              placeholder={t('allSections')}
              items={mappedPaalOptions}
              selectedValue={selectedPaal}
              onValueChange={(val) => selectPaal(val, 0)}
              containerStyle={isWidescreen ? globalStyles.flexItem : undefined}
            />

            {/* Tier 2: Sub-section Selector (Iyal) */}
            <KuralDropdown
              label={t('subsection')}
              placeholder={t('allSubsections')}
              items={mappedIyalOptions}
              selectedValue={selectedIyal}
              onValueChange={(val) => selectIyal(val, 0)}
              containerStyle={isWidescreen ? globalStyles.flexItem : undefined}
              searchable
              searchPlaceholder={t('searchOptions')}
              closeLabel={t('close')}
            />

            {/* Tier 3: Chapter Selector (Adhigaram) */}
            <KuralDropdown
              label={t('chapter')}
              placeholder={t('allChapters')}
              items={mappedAdhigaramOptions}
              selectedValue={selectedAdhigaram}
              onValueChange={(val) => selectAdhigaram(val, 0)}
              containerStyle={isWidescreen ? globalStyles.flexItem : undefined}
              searchable
              searchPlaceholder={t('searchOptions')}
              closeLabel={t('close')}
            />

            {/* Clear Filters Action Trigger */}
            {Boolean(hasActiveFilters) && (
              <KuralIconButton
                icon={<FilterX />}
                label={pair('clearAllFilters').visible}
                tooltip={pair('clearAllFilters').hover}
                onPress={clearAllFilters}
                size="sm"
                style={isWidescreen ? { marginTop: 22 } : { marginTop: 8 }}
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
}
