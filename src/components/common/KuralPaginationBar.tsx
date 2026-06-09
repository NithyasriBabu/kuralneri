import React from 'react';
import { ScrollView, TouchableOpacity, View, useWindowDimensions } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from './KuralText';
import { useTranslation } from 'src/content/translation';

interface KuralPaginationBarProps {
  page: number;
  totalPages: number;
  hasMore: boolean;
  loading?: boolean;
  visiblePageNumbers: number[];
  onPageJump: (targetPage: number) => void;
  showRange: boolean;
  rangeStart: number;
  rangeEnd: number;
  limitOptions: number[];
  selectedLimit: number;
  onSelectLimit: (limit: number) => void;
}

export function KuralPaginationBar({
  page,
  totalPages,
  hasMore,
  loading = false,
  visiblePageNumbers,
  onPageJump,
  showRange,
  rangeStart,
  rangeEnd,
  limitOptions,
  selectedLimit,
  onSelectLimit,
}: KuralPaginationBarProps) {
  const { theme, componentStyles } = useTheme();
  const { width } = useWindowDimensions();
  const { t, formatPageStatus, formatRangeStatus } = useTranslation('uiChrome', 'pagination');

  return (
    <View style={componentStyles.kuralListPaginationContainer}>
      <View style={componentStyles.kuralListRibbonRow}>
        <TouchableOpacity
          style={[
            componentStyles.kuralListStepperButton,
            page === 1 && componentStyles.kuralListStepperButtonDisabled,
          ]}
          onPress={() => onPageJump(page - 1)}
          disabled={page === 1 || loading}
        >
          <KuralText style={componentStyles.kuralListStepperButtonText}>‹</KuralText>
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
              onPress={() => onPageJump(num)}
              disabled={loading}
            >
              <KuralText
                style={[
                  componentStyles.kuralListNumberText,
                  page === num && componentStyles.kuralListNumberTextActive,
                ]}
              >
                {num}
              </KuralText>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            componentStyles.kuralListStepperButton,
            !hasMore && componentStyles.kuralListStepperButtonDisabled,
          ]}
          onPress={() => onPageJump(page + 1)}
          disabled={!hasMore || loading}
        >
          <KuralText style={componentStyles.kuralListStepperButtonText}>›</KuralText>
        </TouchableOpacity>
      </View>

      <View style={componentStyles.kuralListMetaRow}>
        <View style={componentStyles.kuralListMetaColumnLeft}>
          {showRange && (
            <KuralText style={componentStyles.kuralListMetaText}>
              {formatRangeStatus(rangeStart, rangeEnd)}
            </KuralText>
          )}
        </View>
        <View style={componentStyles.kuralListMetaColumnCenter}>
          <KuralText style={componentStyles.kuralListMetaText}>
            {formatPageStatus(page, totalPages)}
          </KuralText>
        </View>
        <View style={componentStyles.kuralListMetaColumnRight}>
          {limitOptions.length > 0 && (
            <View style={componentStyles.kuralListBadgeCluster}>
              <KuralText style={componentStyles.kuralListLimitTitleText}>
                {t(width > 520 ? 'kuralsPerPage' : 'perPage')}
              </KuralText>
              {limitOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    componentStyles.kuralListLimitBadge,
                    selectedLimit === opt && componentStyles.kuralListLimitBadgeActive,
                  ]}
                  onPress={() => onSelectLimit(opt)}
                >
                  <KuralText
                    style={[
                      componentStyles.kuralListLimitBadgeText,
                      selectedLimit === opt && componentStyles.kuralListLimitBadgeTextActive,
                    ]}
                  >
                    {opt}
                  </KuralText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
