import type { ApiSuccess, WorkOrder } from '@/core/types';

import type { InfiniteListData } from '../types';

/**
 * Merges a partial work-order patch into a detail success envelope.
 */
export function patchWorkOrderInDetail(
  prev: ApiSuccess<WorkOrder> | undefined,
  patch: Partial<WorkOrder>,
): ApiSuccess<WorkOrder> | undefined {
  if (prev == null) {
    return undefined;
  }
  return { data: { ...prev.data, ...patch } };
}

/**
 * Patches the matching work order across every cached list page.
 */
export function patchWorkOrderInLists(
  prev: InfiniteListData | undefined,
  id: string,
  patch: Partial<WorkOrder>,
): InfiniteListData | undefined {
  if (prev == null) {
    return undefined;
  }
  return {
    ...prev,
    pages: prev.pages.map((page) => ({
      ...page,
      data: page.data.map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    })),
  };
}

/**
 * Drops a work order id from every cached list page (after DELETE).
 */
export function removeWorkOrderFromLists(
  prev: InfiniteListData | undefined,
  id: string,
): InfiniteListData | undefined {
  if (prev == null) {
    return undefined;
  }
  return {
    ...prev,
    pages: prev.pages.map((page) => ({
      ...page,
      data: page.data.filter((item) => item.id !== id),
    })),
  };
}
