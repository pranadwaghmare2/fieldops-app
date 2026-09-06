import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text } from '@/core/integrations/ui';
import { colours, spacing } from '@/core/theme';

/**
 * Create placeholder — full Screen 3 lands later.
 */
export default function WorkOrderCreatePlaceholder() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text role="title">Create work order</Text>
        <Text role="body" style={styles.body}>
          Coming next
        </Text>
        <Button variant="secondary" onPress={() => router.back()}>
          Back
        </Button>
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
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    gap: spacing[4],
  },
  body: {
    color: colours.fgMuted,
  },
});
