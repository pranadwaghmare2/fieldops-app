import { Priority } from '@/core/types';

import type { WorkOrderFormValues } from '@/features/work-orders/form/types';
import { workOrderFormSchema } from '@/features/work-orders/form/validations/workOrderFormSchema';

function validBase(
  overrides: Partial<WorkOrderFormValues> = {},
): WorkOrderFormValues {
  return {
    title: 'Pump Skid B fault',
    site: 'Harbour Point',
    priority: Priority.Medium,
    assigneeId: null,
    dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    description: '',
    checklist: [],
    ...overrides,
  };
}

describe('workOrderFormSchema', () => {
  it('rejects title shorter than 8 characters', () => {
    const result = workOrderFormSchema.safeParse(
      validBase({ title: 'short' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects urgent priority when due is more than 48 hours away', () => {
    const result = workOrderFormSchema.safeParse(
      validBase({
        priority: Priority.Urgent,
        dueAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      }),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.path[0] === 'dueAt'),
      ).toBe(true);
    }
  });

  it('accepts urgent priority when due is within 48 hours', () => {
    const result = workOrderFormSchema.safeParse(
      validBase({
        priority: Priority.Urgent,
        dueAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      }),
    );
    expect(result.success).toBe(true);
  });

  it('rejects more than 10 checklist items', () => {
    const checklist = Array.from({ length: 11 }, (_, i) => ({
      label: `Item ${i + 1}`,
      done: false,
    }));
    const result = workOrderFormSchema.safeParse(validBase({ checklist }));
    expect(result.success).toBe(false);
  });

  it('rejects empty checklist labels', () => {
    const result = workOrderFormSchema.safeParse(
      validBase({
        checklist: [{ label: '   ', done: false }],
      }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects invalid dueAt strings', () => {
    const result = workOrderFormSchema.safeParse(
      validBase({ dueAt: 'not-a-date' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects title longer than 120 characters', () => {
    const result = workOrderFormSchema.safeParse(
      validBase({ title: 'x'.repeat(121) }),
    );
    expect(result.success).toBe(false);
  });
});
