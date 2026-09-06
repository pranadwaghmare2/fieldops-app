/** Work order status values — must match mock-api wire strings. */
export enum Status {
  Open = 'open',
  InProgress = 'in_progress',
  Blocked = 'blocked',
  Done = 'done',
}

/** Priority values — must match mock-api wire strings. */
export enum Priority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export const STATUSES = Object.values(Status);
export const PRIORITIES = Object.values(Priority);
