/**
 * Kind of normalized transport failure.
 * Values match historical string kinds for compatibility with existing caches.
 */
export enum ApiErrorKind {
  Network = 'network',
  Http = 'http',
}

/** Successful payload wrapper used by API ports and features. */
export type ApiSuccess<TData> = {
  data: TData;
};

/**
 * Normalized transport failure.
 * Conflict body is generic — callers use `ApiError<WorkOrder>` for 409,
 * not a hard-coded WorkOrder field on the shared type.
 */
export type ApiError<TConflict = unknown> = {
  kind: ApiErrorKind;
  status?: number;
  message: string;
  fieldErrors?: Record<string, string>;
  current?: TConflict;
  /** True when retry is safe (e.g. chaos 500 on status writes). */
  isRetryable?: boolean;
};

/** Cursor list page — success data plus pagination cursor. */
export type CursorPage<TItem> = ApiSuccess<TItem[]> & {
  nextCursor: string | null;
};
