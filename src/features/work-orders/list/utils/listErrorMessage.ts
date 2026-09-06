import { messages } from '@/core/constants';
import { isApiError } from '@/core/utils';

/**
 * User-facing list error copy: prefer API/transport `message`, never `kind`.
 */
export function toListErrorMessage(error: unknown): string {
  if (isApiError(error) && error.message.trim() !== '') {
    return error.message;
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return messages.listError;
}
