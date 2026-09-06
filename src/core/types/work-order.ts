import type { Priority, Status } from '@/core/constants';

/** Assignee expanded on read from the mock API. */
export type User = {
  id: string;
  name: string;
  role: 'technician' | 'supervisor';
};

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

/**
 * Work order shared model — mirrors mock-api `WorkOrder`.
 * `version` must be sent back on PATCH.
 */
export type WorkOrder = {
  id: string;
  reference: string;
  title: string;
  site: string;
  description: string;
  status: Status;
  priority: Priority;
  assigneeId: string | null;
  assignee: User | null;
  dueAt: string;
  checklist: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
  version: number;
};
