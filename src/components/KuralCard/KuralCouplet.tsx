import React from 'react';
import { View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from '../common/KuralText';
import { HighlightedText } from '../common/HighlightedText';
import { KuralRecord } from 'src/types/types';
import { useTranslation } from 'src/content/translation';

export interface KuralCoupletProps {
  kural: KuralRecord;
  cardToggle: { english: boolean };
  headerToggle: { tamil: boolean; english: boolean };
  compact?: boolean;
  compactFields?: {
    taxonomy: boolean;
    translation: boolean;
    explanation: boolean;
  };
  showTransliteration?: boolean;
  showTranslation?: boolean;
  showExplanation?: boolean;
  searchQuery?: string;
}

export default React.memo(function KuralCouplet({
  kural,
  cardToggle,
  headerToggle,
  compact = false,
  compactFields,
  showTransliteration = true,
  showTranslation = true,
  showExplanation = true,
  searchQuery,
}: KuralCoupletProps) {
  const { componentStyles } = useTheme();
  const { t } = useTranslation('kuralCard', 'cards');

  if (compact) {
    const tamilTaxonomy = `${kural.paal_name} › ${kural.iyal_name} › ${kural.adhikaram_name}`;
    const englishTaxonomy = `${kural.paal_english_name} › ${kural.iyal_english_name} › ${kural.adhikaram_english_name}`;
    const taxonomy =
      headerToggle.tamil && headerToggle.english
        ? `${tamilTaxonomy} · ${englishTaxonomy}`
        : headerToggle.tamil
          ? tamilTaxonomy
          : englishTaxonomy;

    return (
      <View style={componentStyles.compactKuralLayout}>
        <View style={componentStyles.compactKuralNumberBadge}>
          <KuralText style={componentStyles.compactKuralNumber}>{kural.id}</KuralText>
        </View>
        <View style={componentStyles.compactKuralBody}>
          <HighlightedText
            text={kural.line1}
            query={searchQuery}
            isTamil
            style={componentStyles.compactKuralTamil}
          />
          <HighlightedText
            text={kural.line2}
            query={searchQuery}
            isTamil
            style={componentStyles.compactKuralTamil}
          />
          {showTransliteration ? (
            <>
              <HighlightedText
                text={kural.transliteration1}
                query={searchQuery}
                style={componentStyles.compactKuralTransliteration}
              />
              <HighlightedText
                text={kural.transliteration2}
                query={searchQuery}
                style={componentStyles.compactKuralTransliteration}
              />
            </>
          ) : null}

          {compactFields?.taxonomy ? (
            <HighlightedText
              text={taxonomy}
              query={searchQuery}
              style={componentStyles.compactKuralTaxonomy}
              numberOfLines={1}
            />
          ) : null}
          {showTranslation && compactFields?.translation ? (
            <HighlightedText
              text={kural.translation}
              query={searchQuery}
              style={componentStyles.compactKuralSupportingText}
              numberOfLines={2}
            />
          ) : null}
          {showExplanation && compactFields?.explanation ? (
            <HighlightedText
              text={kural.explanation}
              query={searchQuery}
              style={componentStyles.compactKuralSupportingText}
              numberOfLines={2}
            />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View>
      {headerToggle.tamil && (
        <View style={componentStyles.kuralCardHeaderRow}>
          <HighlightedText
            text={`குறள் #${kural.id} • ${kural.paal_name} • ${kural.iyal_name} • ${kural.adhikaram_name}`}
            query={searchQuery}
            style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}
          />
        </View>
      )}
      {headerToggle.english && (
        <View style={componentStyles.kuralCardHeaderRow}>
          <HighlightedText
            text={`Kural #${kural.id} • ${kural.paal_english_name} • ${kural.iyal_english_name} • ${kural.adhikaram_english_name}`}
            query={searchQuery}
            style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}
          />
        </View>
      )}

      <HighlightedText
        text={kural.line1}
        query={searchQuery}
        isTamil
        style={componentStyles.kuralCardTamil}
      />
      <HighlightedText
        text={kural.line2}
        query={searchQuery}
        isTamil
        style={componentStyles.kuralCardTamil}
      />
      {showTransliteration ? (
        <View style={componentStyles.kuralCardTransliterationBlock}>
          <HighlightedText
            text={kural.transliteration1}
            query={searchQuery}
            style={componentStyles.kuralCardTransliteration}
          />
          <HighlightedText
            text={kural.transliteration2}
            query={searchQuery}
            style={componentStyles.kuralCardTransliteration}
          />
        </View>
      ) : null}

      {showTranslation && (
        <>
          <KuralText style={componentStyles.kuralCardTranslation}>{t('translation')}</KuralText>
          <HighlightedText
            text={kural.translation}
            query={searchQuery}
            style={componentStyles.kuralCardTranslation}
          />
        </>
      )}
      {showExplanation && (
        <>
          <KuralText style={componentStyles.kuralCardTranslation}>{t('explanation')}</KuralText>
          <HighlightedText
            text={kural.explanation}
            query={searchQuery}
            style={componentStyles.kuralCardTranslation}
          />
        </>
      )}
    </View>
  );
});
