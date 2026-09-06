import axios, { type AxiosInstance } from 'axios';

import { appConfig, getApiBaseUrl } from '@/core/config';

/**
 * Creates the shared Axios client.
 * Base URL and timeout come from core config/env — not from features.
 */
export function createApiClient(): AxiosInstance {
  return axios.create({
    baseURL: getApiBaseUrl(),
    timeout: appConfig.httpTimeoutMs,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}

/** Lazy singleton — constructed on first use so missing env fails at call time. */
let client: AxiosInstance | undefined;

export function getApiClient(): AxiosInstance {
  if (!client) {
    client = createApiClient();
  }
  return client;
}
