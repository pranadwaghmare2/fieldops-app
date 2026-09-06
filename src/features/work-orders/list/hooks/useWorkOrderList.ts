import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';

import { appConfig } from '@/core/config';
import { workOrdersApi } from '@/core/integrations/http';
import { queryKeys, useAppInfiniteQuery } from '@/core/integrations/query';

import type {
  StatusFilter,
  UseWorkOrderListResult,
  WorkOrderListUi,
} from '../types';
import { toListErrorMessage } from '../utils/listErrorMessage';
import {
  canFetchNextPage,
  flattenWorkOrderPages,
  toListApiParams,
} from '../utils/listParams';

/**
 * List ViewModel — owns filter state, infinite query, and navigation handlers.
 * Search draft + debounce live in WorkOrderSearchBar; this hook only receives settled `q`.
 */
export function useWorkOrderList(): UseWorkOrderListResult {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchResetNonce, setSearchResetNonce] = useState(0);
  const [isSearchDebouncing, setIsSearchDebouncing] = useState(false);

  const listFilters = useMemo(
    () =>
      toListApiParams({
        q,
        status: statusFilter,
        limit: appConfig.pageSize,
      }),
    [q, statusFilter],
  );

  const query = useAppInfiniteQuery({
    queryKey: queryKeys.workOrders.list(listFilters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      workOrdersApi.list({
        ...listFilters,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  const {
    data,
    error,
    isPending,
    isError,
    isFetching,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = query;

  const items = useMemo(
    () => flattenWorkOrderPages(data?.pages),
    [data?.pages],
  );

  const hasFilters = q.trim() !== '' || statusFilter !== 'all';
  const hasData = data != null;

  // Pull-to-refresh: refetch with existing data — not a full-screen spinner.
  const isPullRefreshing = isRefetching && hasData && !isFetchingNextPage;

  // Search debounce or filter/search request (not load-more, not pull-refresh).
  const isFilterFetching =
    isSearchDebouncing ||
    (isFetching && !isFetchingNextPage && !isPullRefreshing);

  const ui: WorkOrderListUi = useMemo(() => {
    if (isPending && !hasData && !isSearchDebouncing) {
      return { status: 'loading' };
    }
    if (isFilterFetching && (hasData || isSearchDebouncing || isPending)) {
      return { status: 'fetching' };
    }
    if (isError && !hasData) {
      // Prefer backend/transport message; never surface ApiError.kind.
      return { status: 'error', message: toListErrorMessage(error) };
    }
    if (items.length === 0) {
      return hasFilters ? { status: 'emptyFiltered' } : { status: 'empty' };
    }
    return { status: 'success', items };
  }, [
    error,
    hasData,
    hasFilters,
    isError,
    isFilterFetching,
    isPending,
    isSearchDebouncing,
    items,
  ]);

  const onQueryChange = useCallback((next: string) => {
    setQ(next);
  }, []);

  const onSearchPendingChange = useCallback((isPendingSearch: boolean) => {
    setIsSearchDebouncing(isPendingSearch);
  }, []);

  const onStatusChange = useCallback((status: StatusFilter) => {
    setStatusFilter(status);
  }, []);

  const onClearFilters = useCallback(() => {
    setStatusFilter('all');
    setQ('');
    setSearchResetNonce((n) => n + 1);
  }, []);

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (
      canFetchNextPage({
        hasNextPage: Boolean(hasNextPage),
        isFetchingNextPage,
      })
    ) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onPressRow = useCallback(
    (id: string) => {
      // Typed routes regenerate after new app/ files; Href keeps push typed until then.
      router.push(`/work-orders/${id}` as Href);
    },
    [router],
  );

  const onPressCreate = useCallback(() => {
    router.push('/work-orders/new' as Href);
  }, [router]);

  return {
    ui,
    searchResetNonce,
    statusFilter,
    isRefreshing: isPullRefreshing,
    isFetchingNextPage,
    onQueryChange,
    onSearchPendingChange,
    onStatusChange,
    onClearFilters,
    onRetry,
    onRefresh,
    onEndReached,
    onPressRow,
    onPressCreate,
  };
}
