import type { CursorPage, WorkOrder } from '@/core/types';

/**
 * Structural mirror of TanStack infinite-query list cache.
 * Lives in types so utils stay behaviour-only.
 */
export type InfiniteListData = {
  pages: CursorPage<WorkOrder>[];
  pageParams: unknown[];
};
