import { httpPost } from '@/core/integrations/http';
import type { ApiSuccess, Status, WorkOrder } from '@/core/types';

/**
 * Changes work-order status. Body is `{ status }` only (not PATCH).
 */
export function updateWorkOrderStatus(
  id: string,
  status: Status,
): Promise<ApiSuccess<WorkOrder>> {
  return httpPost<ApiSuccess<WorkOrder>>(`/work-orders/${id}/status`, {
    status,
  });
}
