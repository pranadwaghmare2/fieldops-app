import { Priority } from '@/core/types';

/** Priority Select options for create/edit form. */
export const PRIORITY_OPTIONS: { label: string; value: Priority }[] = [
  { label: 'Low', value: Priority.Low },
  { label: 'Medium', value: Priority.Medium },
  { label: 'High', value: Priority.High },
  { label: 'Urgent', value: Priority.Urgent },
];
