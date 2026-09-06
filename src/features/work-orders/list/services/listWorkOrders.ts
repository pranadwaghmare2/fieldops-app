import { httpGet } from '@/core/integrations/http';
import type { CursorPage, WorkOrder } from '@/core/types';

import type { WorkOrdersListParams } from '../types';

/**
 * Fetches one cursor page of work orders.
 * Pass-through to http adapter — no error/success mapping here.
 */
export function listWorkOrders(
  params: WorkOrdersListParams = {},
): Promise<CursorPage<WorkOrder>> {
  return httpGet<CursorPage<WorkOrder>>(
    '/work-orders',
    params as Record<string, unknown>,
  );
}
