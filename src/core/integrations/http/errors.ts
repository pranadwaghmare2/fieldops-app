import type { WorkOrder } from '@/core/domain';

/**
 * Normalized transport error — features never read Axios error shapes.
 * Swap Axios later without changing callers.
 */
export type ApiError = {
  kind: 'network' | 'http';
  status?: number;
  message: string;
  fieldErrors?: Record<string, string>;
  current?: WorkOrder;
  /** Status writes that fail with 500 are safe to retry. */
  isRetryable?: boolean;
};

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'kind' in value &&
    ((value as ApiError).kind === 'network' || (value as ApiError).kind === 'http')
  );
}
