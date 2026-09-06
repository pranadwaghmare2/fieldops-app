import { toApiError } from '@/core/utils';

import { getApiClient } from './client';
import { compactParams } from './compactParams';
import { toTransportFailure } from './toTransportFailure';

/**
 * GET — returns response body as `T`. Params are compacted before send.
 * Failures throw normalized {@link ApiError} via transport failure mapping.
 */
export async function httpGet<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const client = getApiClient();
    const { data } = await client.get<T>(path, {
      params: compactParams(params),
    });
    return data;
  } catch (error) {
    throw toApiError(toTransportFailure(error));
  }
}

/**
 * POST — returns response body as `T`.
 */
export async function httpPost<T>(path: string, body?: unknown): Promise<T> {
  try {
    const client = getApiClient();
    const { data } = await client.post<T>(path, body);
    return data;
  } catch (error) {
    throw toApiError(toTransportFailure(error));
  }
}

/**
 * PATCH — returns response body as `T`.
 */
export async function httpPatch<T>(path: string, body?: unknown): Promise<T> {
  try {
    const client = getApiClient();
    const { data } = await client.patch<T>(path, body);
    return data;
  } catch (error) {
    throw toApiError(toTransportFailure(error));
  }
}

/**
 * PUT — returns response body as `T`.
 */
export async function httpPut<T>(path: string, body?: unknown): Promise<T> {
  try {
    const client = getApiClient();
    const { data } = await client.put<T>(path, body);
    return data;
  } catch (error) {
    throw toApiError(toTransportFailure(error));
  }
}

/**
 * DELETE — returns response body as `T`.
 */
export async function httpDelete<T>(
  path: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    const client = getApiClient();
    const { data } = await client.delete<T>(path, {
      params: compactParams(params),
    });
    return data;
  } catch (error) {
    throw toApiError(toTransportFailure(error));
  }
}
