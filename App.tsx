import { StyleSheet, Text, View, FlatList, SafeAreaView } from 'react-native';
import {
  useFonts,
  MuktaMalar_400Regular,
  MuktaMalar_700Bold,
} from '@expo-google-fonts/mukta-malar';
import { Inter_400Regular } from '@expo-google-fonts/inter';

export default function App() {
  let [fontsLoaded] = useFonts({ MuktaMalar_400Regular, MuktaMalar_700Bold, Inter_400Regular });
  if (!fontsLoaded) return null;

  // Mock data for the sprint finish
  const mockKurals = [
    {
      id: 1,
      tamil: 'அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.',
      translation:
        "A, as its first of letters, every speech maintains; The Primal Deity is first through all the world's domains.",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>குறள்நெறி</Text>
      <FlatList
        data={mockKurals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.kuralNumber}>{item.id}</Text>
            <Text style={styles.tamilText}>{item.tamil}</Text>
            <Text style={styles.translationText}>{item.translation}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#DAD7CD', padding: 20 },
  header: {
    fontSize: 28,
    fontFamily: 'MuktaMalar_700Bold',
    color: '#344E41',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#A3B18A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
  },
  kuralNumber: { color: '#3A5A40', fontWeight: 'bold', marginBottom: 5 },
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
