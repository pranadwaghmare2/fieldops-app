import type { Priority, Status } from '@/core/constants';
import type { CursorPage, User, WorkOrder } from '@/core/types';

import { getApiClient } from './client';
import { toApiError } from './toApiError';

/**
 * Work-order HTTP port — method bodies filled when features land.
 * Features call these; they never call Axios directly.
 */
export type WorkOrdersListParams = {
  limit?: number;
  cursor?: string | null;
  status?: Status;
  priority?: Priority;
  assigneeId?: string;
  q?: string;
};

/** Drop null/undefined/empty so Axios does not send empty query keys. */
function compactParams(
  params: WorkOrdersListParams,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (params.limit != null) out.limit = params.limit;
  if (params.cursor != null && params.cursor !== '') out.cursor = params.cursor;
  if (params.status != null) out.status = params.status;
  if (params.priority != null) out.priority = params.priority;
  if (params.assigneeId != null) out.assigneeId = params.assigneeId;
  if (params.q != null && params.q !== '') out.q = params.q;
  return out;
}

export const workOrdersApi = {
  /**
   * Cursor-paginated work-order list. `nextCursor` is null when no more pages.
   */
  async list(
    params: WorkOrdersListParams = {},
  ): Promise<CursorPage<WorkOrder>> {
    try {
      const client = getApiClient();
      const { data } = await client.get<{
        data: WorkOrder[];
        nextCursor: string | null;
      }>('/work-orders', {
        params: compactParams(params),
      });
      return { data: data.data, nextCursor: data.nextCursor };
    } catch (error) {
      throw toApiError(error);
    }
  },
  get(_id: string): Promise<WorkOrder> {
    throw new Error('workOrdersApi.get not implemented yet');
  },
  create(_body: unknown): Promise<WorkOrder> {
    throw new Error('workOrdersApi.create not implemented yet');
  },
  patch(_id: string, _body: unknown): Promise<WorkOrder> {
    throw new Error('workOrdersApi.patch not implemented yet');
  },
  setStatus(_id: string, _status: Status): Promise<WorkOrder> {
    throw new Error('workOrdersApi.setStatus not implemented yet');
  },
};

export const usersApi = {
  list(): Promise<User[]> {
    throw new Error('usersApi.list not implemented yet');
  },
};
