import axios from 'axios';

import { ApiErrorKind, type ApiError } from '@/core/types';
import { isApiError } from '@/core/utils';

/**
 * Maps unknown transport failures into {@link ApiError}.
 * Axios shapes stay inside the http port. Conflict `current` stays opaque.
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const message =
      (typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof (data as { message: unknown }).message === 'string' &&
        (data as { message: string }).message) ||
      error.message ||
      'Request failed';

    // No HTTP response → network / timeout / offline.
    if (error.response == null) {
      return { kind: ApiErrorKind.Network, message };
    }

    const result: ApiError = {
      kind: ApiErrorKind.Http,
      status,
      message,
    };

    if (
      status === 422 &&
      typeof data === 'object' &&
      data !== null &&
      'errors' in data &&
      typeof (data as { errors: unknown }).errors === 'object' &&
      (data as { errors: unknown }).errors !== null
    ) {
      result.fieldErrors = (data as { errors: Record<string, string> }).errors;
    }

    if (
      status === 409 &&
      typeof data === 'object' &&
      data !== null &&
      'current' in data
    ) {
      result.current = (data as { current: unknown }).current;
    }

    // Chaos 500 on status writes is safe to retry.
    if (status === 500) {
      result.isRetryable = true;
    }

    return result;
  }

  if (error instanceof Error) {
    return { kind: ApiErrorKind.Network, message: error.message };
  }

  return { kind: ApiErrorKind.Network, message: 'Request failed' };
}
