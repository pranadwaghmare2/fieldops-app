import { Status } from '@/core/types';

import type { StatusFilter } from '../types';

/**
 * FlatList row / window tuning for the work-order list.
 * Fixed row height enables getItemLayout for cheaper scroll measurement.
 */
export const ROW_HEIGHT = 104;

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
