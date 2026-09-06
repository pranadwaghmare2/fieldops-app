import { Status } from '@/core/types';

/** Labels for detail status chips — match list filter wording. */
export const STATUS_LABELS: Record<Status, string> = {
  [Status.Open]: 'Open',
  [Status.InProgress]: 'In progress',
  [Status.Blocked]: 'Blocked',
  [Status.Done]: 'Done',
};

export const STATUS_OPTIONS = [
  Status.Open,
  Status.InProgress,
  Status.Blocked,
  Status.Done,
] as const;
