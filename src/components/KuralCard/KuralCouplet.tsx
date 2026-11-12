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
  searchQuery?: string;
}

export default React.memo(function KuralCouplet({
  kural,
  cardToggle,
  headerToggle,
  compact = false,
  compactFields,
  searchQuery,
}: KuralCoupletProps) {
  const { componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'cards');

  return (
    <View>
      {headerToggle.tamil && (!compact || compactFields?.taxonomy) && (
        <View style={componentStyles.kuralCardHeaderRow}>
          <HighlightedText
            text={`குறள் #${kural.id} • ${kural.paal_name} • ${kural.iyal_name} • ${kural.adhikaram_name}`}
            query={searchQuery}
            style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}
          />
        </View>
      )}
      {headerToggle.english && (!compact || compactFields?.taxonomy) && (
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

      {cardToggle.english && (!compact || compactFields?.translation) && (
        <>
          <KuralText style={componentStyles.kuralCardTranslation}>{t('translation')}</KuralText>
          <HighlightedText
            text={kural.translation}
            query={searchQuery}
            style={componentStyles.kuralCardTranslation}
          />
        </>
      )}
      {cardToggle.english && (!compact || compactFields?.explanation) && (
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
