import { Priority } from '@/core/types';
import { z } from '@/core/integrations/form';

const HOUR_MS = 60 * 60 * 1000;
const URGENT_DUE_WINDOW_MS = 48 * HOUR_MS;

const checklistItemSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, 'Every checklist item needs a label.'),
  done: z.boolean(),
});

/**
 * Client Zod schema for create/edit — mirrors documented mock-api rules.
 * Undocumented server-only rules arrive as 422 and map via applyServerFieldErrors.
 */
export const workOrderFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(8, 'Title must be at least 8 characters.')
      .max(120, 'Title must be at most 120 characters.'),
    site: z.string().trim().min(1, 'Site is required.'),
    priority: z.nativeEnum(Priority),
    assigneeId: z.string().nullable(),
    dueAt: z.string().trim().min(1, 'A valid due date is required.'),
    description: z.string(),
    checklist: z
      .array(checklistItemSchema)
      .max(10, 'Maximum of 10 checklist items.'),
  })
  .superRefine((values, ctx) => {
    const dueMs = Date.parse(values.dueAt);
    if (Number.isNaN(dueMs)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueAt'],
        message: 'A valid due date is required.',
      });
      return;
    }
    // Cross-field: urgent orders must be due within 48 hours of now.
    if (
      values.priority === Priority.Urgent &&
      dueMs - Date.now() > URGENT_DUE_WINDOW_MS
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['dueAt'],
        message: 'Urgent work orders must be due within 48 hours.',
      });
    }
  });

export type WorkOrderFormValues = z.infer<typeof workOrderFormSchema>;

export const defaultWorkOrderFormValues: WorkOrderFormValues = {
  title: '',
  site: '',
  priority: Priority.Medium,
  assigneeId: null,
  dueAt: '',
  description: '',
  checklist: [],
};
