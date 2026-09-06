/** Work order status values — must match mock-api. */
export const STATUSES = ['open', 'in_progress', 'blocked', 'done'] as const;
export type Status = (typeof STATUSES)[number];

/** Priority values — must match mock-api. */
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];
