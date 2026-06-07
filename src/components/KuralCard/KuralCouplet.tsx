import React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from 'src/theme/ThemeContextProvider';
import { KuralText } from '../common/KuralText';
import { KuralRecord } from 'src/types/types';

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

      <Text style={componentStyles.kuralCardTamil}>{kural.line1}</Text>
      <Text style={componentStyles.kuralCardTamil}>{kural.line2}</Text>

      {cardToggle.english && (
        <>
          <Text style={componentStyles.kuralCardTranslation}>Translation:</Text>
          <Text style={componentStyles.kuralCardTranslation}>{kural.translation}</Text>
          <Text style={componentStyles.kuralCardTranslation}>Explanation:</Text>
          <Text style={componentStyles.kuralCardTranslation}>{kural.explanation}</Text>
        </>
      )}
    </View>
  );
});
