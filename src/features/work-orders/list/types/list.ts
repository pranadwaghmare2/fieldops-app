import type { Status } from '@/core/constants';
import type { WorkOrder } from '@/core/types';

/** Status chip filter including “show all”. */
export type StatusFilter = Status | 'all';

/**
 * Discriminated UI state for the work-order list screen.
 * Empty and error stay distinct from each other and from filtered empty.
 * `fetching` = search debounce or filter/search request in flight (header stays visible).
 */
export type WorkOrderListUi =
  | { status: 'loading' }
  | { status: 'fetching' }
  | { status: 'empty' }
  | { status: 'emptyFiltered' }
  | { status: 'error'; message: string }
  | { status: 'success'; items: WorkOrder[] };

/** ViewModel contract returned by `useWorkOrderList`. */
export type UseWorkOrderListResult = {
  ui: WorkOrderListUi;
  searchResetNonce: number;
  statusFilter: StatusFilter;
  isRefreshing: boolean;
  isFetchingNextPage: boolean;
  onQueryChange: (q: string) => void;
  onSearchPendingChange: (isPending: boolean) => void;
  onStatusChange: (status: StatusFilter) => void;
  onClearFilters: () => void;
  onRetry: () => void;
  onRefresh: () => void;
  onEndReached: () => void;
  onPressRow: (id: string) => void;
  onPressCreate: () => void;
};
