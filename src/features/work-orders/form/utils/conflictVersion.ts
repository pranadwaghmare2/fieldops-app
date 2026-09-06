import type { WorkOrder } from '@/core/types';
import { HttpStatus } from '@/core/types';
import { isApiErrorStatus } from '@/core/utils';

/**
 * Reads server `version` from a 409 conflict error for Keep-mine retry.
 */
export function nextVersionFromConflict(
  error: unknown,
): number | undefined {
  if (!isApiErrorStatus<WorkOrder>(error, HttpStatus.Conflict)) {
    return undefined;
  }
  const version = error.current?.version;
  return typeof version === 'number' ? version : undefined;
}

/**
 * Current work order payload from a 409, if present.
 */
export function currentFromConflict(
  error: unknown,
): WorkOrder | undefined {
  if (!isApiErrorStatus<WorkOrder>(error, HttpStatus.Conflict)) {
    return undefined;
  }
  return error.current;
}
