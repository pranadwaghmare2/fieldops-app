import type { WorkOrdersListParams } from '@/core/integrations/http';
import type { CursorPage, WorkOrder } from '@/core/types';

import type { StatusFilter } from '../types';

/**
 * Builds GET /work-orders query params from UI filter state.
 * Omits blank `q` and omits `status` when filter is `all`.
 */
export function toListApiParams(input: {
  q: string;
  status: StatusFilter;
  limit: number;
}): WorkOrdersListParams {
  const trimmed = input.q.trim();
  const params: WorkOrdersListParams = { limit: input.limit };
  if (trimmed !== '') {
    params.q = trimmed;
  }
  if (input.status !== 'all') {
    params.status = input.status;
  }
  return params;
}

/**
 * Merges infinite-query pages into one list for FlatList.
 * Order follows page order from the server cursor stream.
 */
export function flattenWorkOrderPages(
  pages: CursorPage<WorkOrder>[] | undefined,
): WorkOrder[] {
  if (pages == null || pages.length === 0) {
    return [];
  }
  return pages.flatMap((page) => page.data);
}

/**
 * Guard against double fetchNextPage while a page is already in flight.
 */
export function canFetchNextPage(input: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}): boolean {
  return input.hasNextPage && !input.isFetchingNextPage;
}
