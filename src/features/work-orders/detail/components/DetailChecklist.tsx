import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/core/integrations/ui';
import type { ChecklistItem } from '@/core/types';
import { colours, radius, spacing } from '@/core/theme';

type DetailChecklistProps = {
  items: ChecklistItem[];
  onPressItem: () => void;
};

/**
 * Read-only checklist with token checkbox marks (brief ☑/☐).
 */
export function DetailChecklist({ items, onPressItem }: DetailChecklistProps) {
  if (items.length === 0) {
    return (
      <Text role="caption" style={styles.empty}>
        No checklist items.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={onPressItem}
          accessibilityRole="button"
          accessibilityLabel={`${item.done ? 'Done' : 'Not done'}: ${item.label}. Edit to update checklist.`}
          style={styles.row}
        >
          <View style={[styles.box, item.done ? styles.boxChecked : null]}>
            {item.done ? (
              <Text role="label" style={styles.mark}>
                ✓
              </Text>
            ) : null}
          </View>
          <Text role="body" style={styles.label}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const BOX = 22;

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  box: {
    width: BOX,
    height: BOX,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg,
  },
  boxChecked: {
    borderColor: colours.primary,
    backgroundColor: colours.primary,
  },
  mark: {
    color: colours.primaryFg,
    fontSize: 14,
    lineHeight: 16,
  },
  label: {
    flex: 1,
  },
  empty: {
    color: colours.fgMuted,
  },
});
