import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { messages } from '@/core/constants';
import { Button, Text } from '@/core/integrations/ui';
import { colours, radius, spacing } from '@/core/theme';

import type {
  ConflictFieldKey,
  ConflictFieldRow,
  ConflictSide,
  WorkOrderFormMerge,
} from '../types';

export type ConflictMergeModalProps = {
  rows: ConflictFieldRow[];
  merge: WorkOrderFormMerge;
  isSubmitting: boolean;
  onPickSide: (key: ConflictFieldKey, side: ConflictSide) => void;
  onUseAllFrom: (side: ConflictSide) => void;
  onApplyMerge: () => void;
  onCancelMerge: () => void;
};

type ChoiceProps = {
  label: string;
  value: string;
  isSelected: boolean;
  onPress: () => void;
};

/** One side of a field, behaving as a radio: selecting it deselects the other. */
function Choice({ label, value, isSelected, onPress }: ChoiceProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${label}: ${value || 'empty'}`}
      accessibilityState={{ checked: isSelected, selected: isSelected }}
      style={[styles.choice, isSelected && styles.choiceSelected]}
    >
      <Text role="label" style={isSelected ? styles.choiceLabelOn : undefined}>
        {label}
      </Text>
      <Text role="caption" style={styles.muted}>
        {value || '—'}
      </Text>
    </Pressable>
  );
}

/**
 * Field-by-field 409 resolution. Only differing fields are listed, and Apply
 * stays disabled until each has a side, so no field is resolved by accident.
 */
export function ConflictMergeModal({
  rows,
  merge,
  isSubmitting,
  onPickSide,
  onUseAllFrom,
  onApplyMerge,
  onCancelMerge,
}: ConflictMergeModalProps) {
  const changed = rows.filter((row) => !row.isSame);
  const isApplyDisabled = isSubmitting || merge.unresolvedKeys.length > 0;

  return (
    <Modal
      visible={merge.isOpen}
      animationType="slide"
      transparent
      onRequestClose={onCancelMerge}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text role="heading">{messages.conflictMergeTitle}</Text>
          <Text role="caption" style={styles.muted}>
            {messages.conflictMergeIntro}
          </Text>

          <View style={styles.bulkActions}>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onUseAllFrom('yours')}
              isDisabled={isSubmitting}
            >
              {messages.conflictMergeUseAllMine}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onUseAllFrom('theirs')}
              isDisabled={isSubmitting}
            >
              {messages.conflictMergeUseAllTheirs}
            </Button>
          </View>

          <ScrollView contentContainerStyle={styles.list}>
            {changed.map((row) => (
              <View key={row.key} style={styles.field}>
                <Text role="label">{row.label}</Text>
                <Choice
                  label={messages.conflictYours}
                  value={row.yours}
                  isSelected={merge.picks[row.key] === 'yours'}
                  onPress={() => onPickSide(row.key, 'yours')}
                />
                <Choice
                  label={messages.conflictTheirs}
                  value={row.theirs}
                  isSelected={merge.picks[row.key] === 'theirs'}
                  onPress={() => onPickSide(row.key, 'theirs')}
                />
              </View>
            ))}
          </ScrollView>

          {merge.notice != null ? (
            <Text role="caption" style={styles.danger}>
              {merge.notice}
            </Text>
          ) : null}

          <Button
            variant="primary"
            size="lg"
            onPress={onApplyMerge}
            isDisabled={isApplyDisabled}
            isLoading={isSubmitting}
          >
            {messages.conflictMergeApply}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onPress={onCancelMerge}
            isDisabled={isSubmitting}
          >
            {messages.cancel}
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  sheet: {
    backgroundColor: colours.bg,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    padding: spacing[4],
    gap: spacing[3],
    maxHeight: '90%',
  },
  bulkActions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  list: {
    gap: spacing[4],
    paddingBottom: spacing[2],
  },
  field: {
    gap: spacing[2],
  },
  choice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
    padding: spacing[3],
    gap: spacing[1],
  },
  choiceSelected: {
    borderColor: colours.primary,
    borderWidth: 1,
    backgroundColor: colours.surface,
  },
  choiceLabelOn: {
    color: colours.primary,
  },
  muted: {
    color: colours.fgMuted,
  },
  danger: {
    color: colours.danger,
  },
});
