import type { WorkOrder } from '@/core/types';

import type { WorkOrderFormValues } from '../types';

/**
 * Maps a loaded work order into form values (status stays off the form).
 */
export function workOrderToFormValues(order: WorkOrder): WorkOrderFormValues {
  return {
    title: order.title,
    site: order.site,
    priority: order.priority,
    assigneeId: order.assigneeId,
    dueAt: order.dueAt,
    description: order.description,
    checklist: order.checklist.map((item) => ({
      id: item.id,
      label: item.label,
      done: item.done,
    })),
  };
}
