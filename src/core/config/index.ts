import appConfigJson from './app.config.json';
import { getApiBaseUrl } from './env';

export type AppConfig = {
  httpTimeoutMs: number;
  searchDebounceMs: number;
  pageSize: number;
};

/** Typed app config from JSON — timeouts, debounce, page size. */
export const appConfig: AppConfig = appConfigJson;

export { getApiBaseUrl };
