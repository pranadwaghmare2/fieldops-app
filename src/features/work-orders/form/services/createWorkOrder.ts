import { httpPost } from '@/core/integrations/http';
import type { ApiSuccess, WorkOrder } from '@/core/types';

import type { CreateWorkOrderBody } from '../types';

/**
 * Creates a work order. Pass-through success envelope.
 */
export function createWorkOrder(
  body: CreateWorkOrderBody,
): Promise<ApiSuccess<WorkOrder>> {
  return httpPost<ApiSuccess<WorkOrder>>('/work-orders', body);
}
