import { StyleSheet, View } from 'react-native';

import { messages } from '@/core/constants';
import { Button, SurfaceCard, Text } from '@/core/integrations/ui';
import { colours, spacing } from '@/core/theme';

import type { WorkOrderFormConflict } from '../types';

export type ConflictBannerProps = {
  conflict: WorkOrderFormConflict;
  isDisabled: boolean;
  isSubmitting: boolean;
  onKeepMine: () => void;
  onLoadTheirs: () => void;
  onOpenMerge: () => void;
};

/**
 * 409 banner: says why the save was rejected, shows only the fields that
 * actually differ, and offers the three resolutions. Merge is hidden when the
 * copies match because there would be nothing to decide.
 */
export function ConflictBanner({
  conflict,
  isDisabled,
  isSubmitting,
  onKeepMine,
  onLoadTheirs,
  onOpenMerge,
}: ConflictBannerProps) {
  const changed = conflict.rows.filter((row) => !row.isSame);

  return (
    <SurfaceCard style={styles.card}>
      <Text role="heading">{messages.conflictBanner}</Text>
      <Text role="caption" style={styles.muted}>
        {conflict.message}
      </Text>

      {changed.length === 0 ? (
        <Text role="caption" style={styles.muted}>
          {messages.conflictNoDifferences}
        </Text>
      ) : (
        <View style={styles.rows}>
          {changed.map((row) => (
            <View key={row.key} style={styles.row}>
              <Text role="label">{row.label}</Text>
              <Text role="caption" style={styles.muted}>
                {`${messages.conflictYours}: ${row.yours || '—'}`}
              </Text>
              <Text role="caption" style={styles.muted}>
                {`${messages.conflictTheirs}: ${row.theirs || '—'}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Button
          variant="primary"
          size="md"
          onPress={onKeepMine}
          isDisabled={isDisabled}
          isLoading={isSubmitting}
        >
          {messages.conflictKeepMine}
        </Button>
        {changed.length > 0 ? (
          <Button
            variant="secondary"
            size="md"
            onPress={onOpenMerge}
            isDisabled={isDisabled}
          >
            {messages.conflictMerge}
          </Button>
        ) : null}
        <Button
          variant="secondary"
          size="md"
          onPress={onLoadTheirs}
          isDisabled={isDisabled}
        >
          {messages.conflictLoadTheirs}
        </Button>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: colours.warning,
    gap: spacing[2],
  },
  muted: {
    color: colours.fgMuted,
  },
  rows: {
    gap: spacing[2],
  },
  row: {
    gap: spacing[1],
  },
  actions: {
    gap: spacing[2],
  },
});
