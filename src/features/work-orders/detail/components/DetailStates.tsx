import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { messages } from '@/core/constants';
import { Button, Text } from '@/core/integrations/ui';
import { colours, spacing } from '@/core/theme';

type DetailLoadingProps = {
  label?: string;
};

export function DetailLoadingState({ label = 'Loading…' }: DetailLoadingProps) {
  return (
    <View style={styles.center} accessibilityLabel={label}>
      <ActivityIndicator color={colours.primary} />
    </View>
  );
}

type DetailMessageStateProps = {
  message: string;
  onRetry?: () => void;
};

export function DetailErrorState({ message, onRetry }: DetailMessageStateProps) {
  return (
    <View style={styles.center}>
      <Text role="body" style={styles.message}>
        {message}
      </Text>
      {onRetry != null ? (
        <Button variant="secondary" size="sm" onPress={onRetry}>
          {messages.retry}
        </Button>
      ) : null}
    </View>
  );
}

export function DetailNotFoundState({
  message,
}: {
  message: string;
}) {
  return (
    <View style={styles.center}>
      <Text role="body" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    gap: spacing[4],
  },
  message: {
    textAlign: 'center',
    color: colours.fgMuted,
  },
});
