import axios from 'axios';

import type { TransportFailure } from '@/core/types';

/**
 * Extracts a vendor-agnostic {@link TransportFailure} from an unknown catch value.
 * Axios shapes stay inside this http-port helper.
 */
export function toTransportFailure(error: unknown): TransportFailure {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;
    const messageFromBody =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : undefined;
    const message = messageFromBody || error.message || 'Request failed';

    if (error.response == null) {
      return { message };
    }

    return { message, status, data };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Request failed' };
}
