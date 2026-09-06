import { httpGet } from '@/core/integrations/http';
import type { ApiSuccess, WorkOrder } from '@/core/types';

/**
 * Loads one work order by id. Pass-through envelope — no mapping.
 */
export function getWorkOrder(id: string): Promise<ApiSuccess<WorkOrder>> {
  return httpGet<ApiSuccess<WorkOrder>>(`/work-orders/${id}`);
}
