import { httpPatch } from '@/core/integrations/http';
import type { ApiSuccess, WorkOrder } from '@/core/types';

import type { UpdateWorkOrderBody } from '../types';

/**
 * Patches a work order with optimistic-concurrency `version`.
 */
export function updateWorkOrder(
  id: string,
  body: UpdateWorkOrderBody,
): Promise<ApiSuccess<WorkOrder>> {
  return httpPatch<ApiSuccess<WorkOrder>>(`/work-orders/${id}`, body);
}
