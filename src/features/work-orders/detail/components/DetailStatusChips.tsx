import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/core/integrations/ui';
import type { Status } from '@/core/types';
import { colours, radius, spacing } from '@/core/theme';

import { STATUS_LABELS, STATUS_OPTIONS } from '../constants/detailUi';

type DetailStatusChipsProps = {
  current: Status;
  isDisabled: boolean;
  onChange: (status: Status) => void;
};

/**
 * Inline status chips for optimistic status writes on detail.
 */
export function DetailStatusChips({
  current,
  isDisabled,
  onChange,
}: DetailStatusChipsProps) {
  return (
    <View style={styles.row}>
      {STATUS_OPTIONS.map((status) => {
        const isSelected = status === current;
        return (
          <Pressable
            key={status}
            onPress={() => onChange(status)}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            accessibilityLabel={STATUS_LABELS[status]}
            style={[
              styles.chip,
              isSelected ? styles.chipSelected : null,
              isDisabled ? styles.chipDisabled : null,
            ]}
          >
            <Text
              role="label"
              style={isSelected ? styles.chipTextSelected : styles.chipText}
            >
              {STATUS_LABELS[status]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colours.surface,
  },
  chipSelected: {
    borderColor: colours.primary,
    backgroundColor: colours.primary,
  },
  chipDisabled: {
    opacity: 0.6,
  },
  chipText: {
    color: colours.fg,
  },
  chipTextSelected: {
    color: colours.primaryFg,
  },
});
