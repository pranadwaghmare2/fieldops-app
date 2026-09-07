import { messages } from '@/core/constants';
import { toUserErrorMessage } from '@/core/utils';

/**
 * Detail error copy — prefers backend/transport message.
 */
export function toDetailErrorMessage(
  error: unknown,
  fallback: string = messages.detailError,
): string {
  return toUserErrorMessage(error, fallback);
}
