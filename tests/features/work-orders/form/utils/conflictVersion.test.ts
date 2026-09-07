import { ApiErrorKind, HttpStatus } from '@/core/types';
import type { ApiError, WorkOrder } from '@/core/types';

import {
  currentFromConflict,
  nextVersionFromConflict,
} from '@/features/work-orders/form/utils/conflictVersion';

describe('conflictVersion', () => {
  it('returns current.version from a 409 ApiError', () => {
    const error: ApiError<WorkOrder> = {
      kind: ApiErrorKind.Http,
      status: HttpStatus.Conflict,
      message: 'Stale',
      current: { id: 'wo-1', version: 4 } as WorkOrder,
    };
    expect(nextVersionFromConflict(error)).toBe(4);
    expect(currentFromConflict(error)?.version).toBe(4);
  });

  it('returns undefined for non-409 errors', () => {
    expect(
      nextVersionFromConflict({
        kind: ApiErrorKind.Http,
        status: HttpStatus.InternalServerError,
        message: 'Chaos',
      }),
    ).toBeUndefined();
  });
});
