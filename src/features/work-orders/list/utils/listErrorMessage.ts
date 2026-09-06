import { messages } from '@/core/constants';
import { toUserErrorMessage } from '@/core/utils';

/**
 * List error copy — prefers backend/transport message.
 */
export function toListErrorMessage(error: unknown): string {
  return toUserErrorMessage(error, messages.listError);
}
