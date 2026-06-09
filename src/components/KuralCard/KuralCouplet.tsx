import React from 'react';
import { View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from '../common/KuralText';
import { KuralRecord } from 'src/types/types';
import { useTranslation } from 'src/content/translation';

export interface KuralCoupletProps {
  kural: KuralRecord;
  cardToggle: { english: boolean };
  headerToggle: { tamil: boolean; english: boolean };
}

export default React.memo(function KuralCouplet({
  kural,
  cardToggle,
  headerToggle,
}: KuralCoupletProps) {
  const { componentStyles } = useTheme();
  const { t } = useTranslation('uiChrome', 'cards');

  return (
    <View>
      {headerToggle.tamil && (
        <View style={componentStyles.kuralCardHeaderRow}>
          <KuralText style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}>
            குறள் #{kural.id} • {kural.paal_name} — {kural.iyal_name} - {kural.adhikaram_name}
          </KuralText>
        </View>
      )}
      {headerToggle.english && (
        <View style={componentStyles.kuralCardHeaderRow}>
          <KuralText style={[componentStyles.kuralCardNumber, componentStyles.kuralCardHeaderText]}>
            Kural #{kural.id} • {kural.paal_english_name} — {kural.iyal_english_name} —{' '}
            {kural.adhikaram_english_name}
          </KuralText>
        </View>
      )}

      <KuralText isTamil style={componentStyles.kuralCardTamil}>
        {kural.line1}
      </KuralText>
      <KuralText isTamil style={componentStyles.kuralCardTamil}>
        {kural.line2}
      </KuralText>

      {cardToggle.english && (
        <>
          <KuralText style={componentStyles.kuralCardTranslation}>{t('translation')}</KuralText>
          <KuralText style={componentStyles.kuralCardTranslation}>{kural.translation}</KuralText>
          <KuralText style={componentStyles.kuralCardTranslation}>{t('explanation')}</KuralText>
          <KuralText style={componentStyles.kuralCardTranslation}>{kural.explanation}</KuralText>
        </>
      )}
    </View>
  );
});
