import { isApiError } from './isApiError';

/**
 * User-facing error copy: prefer API/transport `message`, never `kind`.
 */
export function toUserErrorMessage(error: unknown, fallback: string): string {
  if (isApiError(error) && error.message.trim() !== '') {
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return fallback;
}
