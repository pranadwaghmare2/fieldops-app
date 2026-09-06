/**
 * User-facing copy for distinguishable empty / error states.
 */
export const messages = {
  listEmpty: 'No work orders yet.',
  listEmptyFiltered: 'No work orders match these filters.',
  listError: 'Could not load work orders.',
  detailNotFound: 'Work order not found.',
  detailError: 'Could not load this work order.',
  statusUpdateFailed: 'Status update failed. Your previous status was restored.',
  retry: 'Retry',
  clearFilters: 'Clear filters',
} as const;
