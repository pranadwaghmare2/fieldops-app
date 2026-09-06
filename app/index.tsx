import { StyleSheet, Text, View } from 'react-native';

/**
 * Placeholder home route. Feature screens replace this later.
 */
export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FieldOps</Text>
      <Text style={styles.body}>Foundation scaffold. Start mock-api, then build screens.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
});
