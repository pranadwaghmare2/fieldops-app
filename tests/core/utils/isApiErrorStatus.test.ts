import { ApiErrorKind, HttpStatus } from '@/core/types';
import { isApiErrorStatus } from '@/core/utils';

describe('isApiErrorStatus', () => {
  it('narrows when status matches', () => {
    const error = {
      kind: ApiErrorKind.Http,
      status: HttpStatus.NotFound,
      message: 'missing',
    };
    expect(isApiErrorStatus(error, HttpStatus.NotFound)).toBe(true);
    expect(isApiErrorStatus(error, HttpStatus.Conflict)).toBe(false);
  });
});
