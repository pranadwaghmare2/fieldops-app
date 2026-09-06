import { memo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/core/integrations/ui';
import { spacing } from '@/core/theme';

import {
  STATUS_FILTER_LABELS,
  STATUS_FILTER_OPTIONS,
} from '../constants/listUi';
import type { StatusFilter } from '../types';

type WorkOrderStatusFilterProps = {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
};

/**
 * Horizontal status chips. Memoized so search keystrokes do not re-render it.
 */
export const WorkOrderStatusFilter = memo(function WorkOrderStatusFilter({
  value,
  onChange,
}: WorkOrderStatusFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {STATUS_FILTER_OPTIONS.map((option) => {
        const isSelected = option === value;
        return (
          <View key={option} style={styles.chip}>
            <Button
              size="sm"
              variant={isSelected ? 'primary' : 'secondary'}
              onPress={() => onChange(option)}
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter ${STATUS_FILTER_LABELS[option]}`}
            >
              {STATUS_FILTER_LABELS[option]}
            </Button>
          </View>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  chip: {
    flexShrink: 0,
  },
});
