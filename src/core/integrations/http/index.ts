/**
 * HTTP integration port — Axios client + thin verbs only.
 * Feature resource URLs live in feature services. ApiError mapping lives in core/utils.
 */
export { createApiClient, getApiClient } from './client';
export { compactParams } from './compactParams';
export {
  httpDelete,
  httpGet,
  httpPatch,
  httpPost,
  httpPut,
} from './verbs';
