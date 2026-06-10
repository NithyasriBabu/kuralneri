import React, { useMemo } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from './KuralText';
import { useTranslation } from 'src/content/translation';
import { KuralIconButton } from 'src/components/common/KuralIconButton';

interface KuralPaginationBarProps {
  page: number;
  totalPages: number;
  hasMore: boolean;
  loading?: boolean;
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
  onPageJump,
  showRange,
  rangeStart,
  rangeEnd,
  limitOptions,
  selectedLimit,
  onSelectLimit,
}: KuralPaginationBarProps) {
  const { theme, componentStyles } = useTheme();
  const screenWidth = theme.layout.screenWidth;
  const { t, pair, formatPageStatus, formatRangeStatus } = useTranslation('uiChrome', 'pagination');
  const visiblePageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = screenWidth > 1024 ? 7 : screenWidth > 600 ? 5 : 3;

    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = startPage + maxVisible - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages, screenWidth]);

  return (
    <View style={componentStyles.kuralListPaginationContainer}>
      <View style={componentStyles.kuralListRibbonRow}>
        <KuralIconButton
          icon={<ChevronLeft />}
          label={pair('previousPage').visible}
          tooltip={pair('previousPage').hover}
          onPress={() => onPageJump(page - 1)}
          disabled={page === 1 || loading}
          size="sm"
        />

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

        <KuralIconButton
          icon={<ChevronRight />}
          label={pair('nextPage').visible}
          tooltip={pair('nextPage').hover}
          onPress={() => onPageJump(page + 1)}
          disabled={!hasMore || loading}
          size="sm"
        />
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
                {t(screenWidth > 520 ? 'kuralsPerPage' : 'perPage')}
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
