import {
  ApiErrorKind,
  HttpStatus,
  type ApiError,
  type TransportFailure,
} from '@/core/types';
import { isApiError } from '@/core/utils/isApiError';

/**
 * True when value looks like a TransportFailure (message required).
 */
function isTransportFailure(value: unknown): value is TransportFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as { message: unknown }).message === 'string'
  );
}

/** Read string `message` from a JSON error body when present. */
function messageFromData(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}

/** 422 `errors` map when shape matches. */
function fieldErrorsFromData(data: unknown): Record<string, string> | undefined {
  if (
    typeof data === 'object' &&
    data !== null &&
    'errors' in data &&
    typeof (data as { errors: unknown }).errors === 'object' &&
    (data as { errors: unknown }).errors !== null
  ) {
    return (data as { errors: Record<string, string> }).errors;
  }
  return undefined;
}

/** Opaque 409 `current` when present. */
function currentFromData(data: unknown): unknown | undefined {
  if (typeof data === 'object' && data !== null && 'current' in data) {
    return (data as { current: unknown }).current;
  }
  return undefined;
}

/**
 * Apply status-specific fields onto an Http {@link ApiError} in one switch.
 */
function applyHttpStatusDetails(
  result: ApiError,
  status: number,
  data: unknown,
): void {
  switch (status) {
    case HttpStatus.UnprocessableEntity: {
      const fieldErrors = fieldErrorsFromData(data);
      if (fieldErrors != null) {
        result.fieldErrors = fieldErrors;
      }
      break;
    }
    case HttpStatus.Conflict: {
      const current = currentFromData(data);
      if (current !== undefined) {
        result.current = current;
      }
      break;
    }
    case HttpStatus.InternalServerError:
      // Chaos 500 on status writes is safe to retry.
      result.isRetryable = true;
      break;
    default:
      break;
  }
}

/**
 * Maps vendor-agnostic transport failures into {@link ApiError}.
 * Axios stays in the http port (`toTransportFailure`).
 */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isTransportFailure(error)) {
    const message = messageFromData(error.data, error.message) || error.message;
    const status = error.status;

    // No HTTP status → network / timeout / offline-style failure.
    if (status == null) {
      return { kind: ApiErrorKind.Network, message };
    }

    const result: ApiError = {
      kind: ApiErrorKind.Http,
      status,
      message,
    };
    applyHttpStatusDetails(result, status, error.data);
    return result;
  }

  if (error instanceof Error) {
    return { kind: ApiErrorKind.Network, message: error.message };
  }

  return { kind: ApiErrorKind.Network, message: 'Request failed' };
}
