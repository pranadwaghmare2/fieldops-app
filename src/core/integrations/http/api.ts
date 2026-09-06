import type { Priority, Status } from '@/core/constants';
import type { User, WorkOrder } from '@/core/domain';

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

export type WorkOrdersListResult = {
  data: WorkOrder[];
  nextCursor: string | null;
};

export const workOrdersApi = {
  list(_params: WorkOrdersListParams = {}): Promise<WorkOrdersListResult> {
    throw new Error('workOrdersApi.list not implemented yet');
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
