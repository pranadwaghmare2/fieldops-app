import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  InfiniteData,
  UseInfiniteQueryOptions,
  UseMutationOptions,
  UseQueryOptions,
} from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export { queryKeys } from './keys';

/**
 * QueryClient accessor — features use this instead of importing TanStack directly.
 * Needed for optimistic cache writes and invalidation in ViewModels.
 */
export function useAppQueryClient() {
  return useQueryClient();
}

/**
 * App QueryClient defaults — tune in DECISIONS.md if needed.
 * Features use wrappers below instead of importing TanStack directly.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
}

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * Provides a stable QueryClient for the Expo root layout.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [client] = useState(() => createAppQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

/** Thin typed wrapper so features never import `@tanstack/react-query`. */
export function useAppQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[],
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useQuery(options);
}

export function useAppMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TContext>) {
  return useMutation(options);
}

export function useAppInfiniteQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = InfiniteData<TQueryFnData>,
  TQueryKey extends readonly unknown[] = readonly unknown[],
  TPageParam = unknown,
>(
  options: UseInfiniteQueryOptions<
    TQueryFnData,
    TError,
    TData,
    TQueryKey,
    TPageParam
  >,
) {
  return useInfiniteQuery(options);
}
