import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Text } from '@/core/integrations/ui';
import type { WorkOrder } from '@/core/types';
import { colours, radius, spacing } from '@/core/theme';
import { formatDisplayDate } from '@/core/utils';

import {
  ROW_CONTENT_HEIGHT,
  ROW_GAP,
  STATUS_FILTER_LABELS,
} from '../constants/listUi';

type WorkOrderListRowProps = {
  item: WorkOrder;
  onPress: (id: string) => void;
};

/**
 * Memoized list row — surface card (brief token role for list rows).
 */
export const WorkOrderListRow = memo(function WorkOrderListRow({
  item,
  onPress,
}: WorkOrderListRowProps) {
  const dueLabel = formatDisplayDate(item.dueAt);
  const assigneeName = item.assignee?.name ?? 'Unassigned';
  const statusLabel = STATUS_FILTER_LABELS[item.status];

  return (
    <Pressable
      onPress={() => onPress(item.id)}
      accessibilityRole="button"
      accessibilityLabel={`${item.reference} ${item.title}`}
      style={styles.row}
    >
      <View style={styles.top}>
        <Text role="label" style={styles.reference}>
          {item.reference}
        </Text>
        <Badge status={item.status}>{statusLabel}</Badge>
      </View>
      <Text role="body" numberOfLines={1} style={styles.title}>
        {item.title}
      </Text>
      <Text role="caption" numberOfLines={1} style={styles.muted}>
        {item.site}
      </Text>
      <Text role="caption" numberOfLines={1} style={styles.muted}>
        Due {dueLabel} · {assigneeName}
      </Text>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    height: ROW_CONTENT_HEIGHT,
    marginBottom: ROW_GAP,
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colours.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing[2],
    marginBottom: spacing[1],
  },
  reference: {
    flexShrink: 1,
  },
  title: {
    marginBottom: spacing[1],
  },
  muted: {
    color: colours.fgMuted,
  },
});
