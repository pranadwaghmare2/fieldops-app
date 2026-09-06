/**
 * Query key factory — features import keys from here, never invent string keys.
 * Expand when work-order queries are implemented.
 */
export const queryKeys = {
  root: ['fieldops'] as const,
  workOrders: {
    all: ['fieldops', 'work-orders'] as const,
    lists: () => [...queryKeys.workOrders.all, 'list'] as const,
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.workOrders.lists(), filters] as const,
    details: () => [...queryKeys.workOrders.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.workOrders.details(), id] as const,
  },
  users: {
    all: ['fieldops', 'users'] as const,
  },
};
