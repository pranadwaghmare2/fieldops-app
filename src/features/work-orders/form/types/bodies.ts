import type { Priority } from '@/core/types';

/**
 * Create body for POST /work-orders — no `status`.
 */
export type CreateWorkOrderBody = {
  title: string;
  site: string;
  priority: Priority;
  dueAt: string;
  description?: string;
  assigneeId?: string | null;
  checklist?: { id?: string; label: string; done: boolean }[];
};

/**
 * PATCH body — full form fields plus concurrency `version`, never `status`.
 */
export type UpdateWorkOrderBody = {
  title: string;
  site: string;
  priority: Priority;
  dueAt: string;
  description: string;
  assigneeId: string | null;
  checklist: { id?: string; label: string; done: boolean }[];
  version: number;
};
