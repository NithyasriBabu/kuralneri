import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { KuralRecord } from 'src/types/database.types';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#A3B18A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  kuralNumber: {
    color: '#3A5A40',
    fontWeight: 'bold',
    marginBottom: 5,
    fontSize: 12,
  },
  tamilText: {
    fontFamily: 'MuktaMalar_400Regular',
    fontSize: 18,
    color: '#344E41',
    lineHeight: 26,
  },
  translationText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#344E41',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
