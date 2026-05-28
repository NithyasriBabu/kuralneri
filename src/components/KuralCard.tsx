import React from 'react';
import { Text, View } from 'react-native';

import { kuralCardStyles as styles } from 'src/styles/styles';
import { KuralRecord } from 'src/types/types';

interface KuralCardProps {
  kural: KuralRecord;
}

export default React.memo(function KuralCard({ kural }: KuralCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.kuralNumber}>
        Kural #{kural.id} • {kural.paal_name} — {kural.adhikaram_name}
      </Text>

      <Text style={styles.tamilText}>{kural.line1}</Text>
      <Text style={styles.tamilText}>{kural.line2}</Text>

      <Text style={styles.translationText}>{kural.translation || kural.explanation}</Text>
    </View>
  );
});
