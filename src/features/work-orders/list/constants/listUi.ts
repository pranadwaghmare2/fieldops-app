import { Status } from '@/core/types';
import { spacing } from '@/core/theme';

import type { StatusFilter } from '../types';

/**
 * FlatList row / window tuning for the work-order list.
 * Fixed stride (surface card height + gap) enables getItemLayout.
 */
export const ROW_CONTENT_HEIGHT = 104;
/** Gap between surface cards — spacing[2]. */
export const ROW_GAP = spacing[2];
/** Total FlatList item stride for getItemLayout. */
export const ROW_STRIDE = ROW_CONTENT_HEIGHT + ROW_GAP;

export const LIST_WINDOW_SIZE = 7;
export const LIST_MAX_TO_RENDER_PER_BATCH = 8;
export const LIST_INITIAL_NUM_TO_RENDER = 10;

/** Status filter chip values including "all". */
export const STATUS_FILTER_OPTIONS: readonly StatusFilter[] = [
  'all',
  Status.Open,
  Status.InProgress,
  Status.Blocked,
  Status.Done,
];

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  [Status.Open]: 'Open',
  [Status.InProgress]: 'In progress',
  [Status.Blocked]: 'Blocked',
  [Status.Done]: 'Done',
};
