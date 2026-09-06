import { type ApiError, type HttpStatus } from '@/core/types';

import { isApiError } from './isApiError';

/**
 * True when value is an {@link ApiError} with the given HTTP status.
 */
export function isApiErrorStatus<TConflict = unknown>(
  error: unknown,
  status: HttpStatus,
): error is ApiError<TConflict> {
  return isApiError(error) && error.status === status;
}
