import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { messages } from '@/core/constants';
import { Button, Text } from '@/core/integrations/ui';
import { colours, spacing } from '@/core/theme';

type ListMessageProps = {
  message: string;
};

export function ListLoadingState() {
  return (
    <View style={styles.center} accessibilityLabel="Loading work orders">
      <ActivityIndicator color={colours.primary} />
    </View>
  );
}

export function ListEmptyState({ message }: ListMessageProps) {
  return (
    <View style={styles.center}>
      <Text role="body" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

type FilteredEmptyProps = {
  onClearFilters: () => void;
};

export function ListFilteredEmptyState({ onClearFilters }: FilteredEmptyProps) {
  return (
    <View style={styles.center}>
      <Text role="body" style={styles.message}>
        {messages.listEmptyFiltered}
      </Text>
      <View style={styles.action}>
        <Button variant="secondary" size="sm" onPress={onClearFilters}>
          {messages.clearFilters}
        </Button>
      </View>
    </View>
  );
}

type ErrorProps = {
  message: string;
  onRetry: () => void;
};

export function ListErrorState({ message, onRetry }: ErrorProps) {
  return (
    <View style={styles.center}>
      <Text role="body" style={[styles.message, styles.error]}>
        {message || messages.listError}
      </Text>
      <View style={styles.action}>
        <Button variant="primary" size="sm" onPress={onRetry}>
          {messages.retry}
        </Button>
      </View>
    </View>
  );
}

type FooterProps = {
  isVisible: boolean;
};

export function ListLoadMoreFooter({ isVisible }: FooterProps) {
  if (!isVisible) {
    return <View style={styles.footerSpacer} />;
  }
  return (
    <View style={styles.footer} accessibilityLabel="Loading more work orders">
      <ActivityIndicator color={colours.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[8],
  },
  message: {
    textAlign: 'center',
    color: colours.fgMuted,
  },
  error: {
    color: colours.danger,
  },
  action: {
    marginTop: spacing[4],
  },
  footer: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerSpacer: {
    height: 48,
  },
});
