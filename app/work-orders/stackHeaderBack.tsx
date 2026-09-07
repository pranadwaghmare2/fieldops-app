import { Pressable, Text } from 'react-native';
import { useRouter, type Href } from 'expo-router';

import { colours } from '@/core/theme';

/**
 * Header Back for work-order routes entered from `/` (outside this stack).
 * Falls back to list when the nested stack has no history.
 */
export function useStackHeaderBack(title: string) {
  const router = useRouter();

  return {
    title,
    headerLeft: () => (
      <Pressable
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/' as Href);
        }}
        accessibilityRole="button"
        accessibilityLabel="Back to work orders"
        hitSlop={8}
        style={{ paddingHorizontal: 8, paddingVertical: 4 }}
      >
        <Text style={{ color: colours.primary, fontSize: 17 }}>Back</Text>
      </Pressable>
    ),
  };
}
