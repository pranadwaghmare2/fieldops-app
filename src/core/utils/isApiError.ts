import { ApiErrorKind, type ApiError } from '@/core/types';

/**
 * Narrows unknown values to {@link ApiError}.
 * Pure — no Axios / http imports.
 */
export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null || !('kind' in value)) {
    return false;
  }
  const kind = (value as { kind: unknown }).kind;
  return kind === ApiErrorKind.Network || kind === ApiErrorKind.Http;
}
