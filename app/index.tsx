import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colours, spacing } from '@/core/theme';
import { Text } from '@/core/integrations/ui';

/**
 * Placeholder home — proves UI integration + theme tokens.
 * Work-order list screen replaces this later.
 */
export default function Index() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text role="title">FieldOps</Text>
        <Text role="body" style={styles.body}>
          Foundation ready. Run `npm run mock-api`, set EXPO_PUBLIC_API_URL, then build screens.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colours.bg,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
  },
  body: {
    marginTop: spacing[2],
    textAlign: 'center',
    color: colours.fgMuted,
  },
});
