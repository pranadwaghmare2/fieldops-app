import { ApiErrorKind } from '@/core/types';
import { isApiError } from '@/core/utils';

describe('isApiError', () => {
  it('accepts network and http kinds', () => {
    expect(isApiError({ kind: ApiErrorKind.Network, message: 'x' })).toBe(true);
    expect(
      isApiError({ kind: ApiErrorKind.Http, message: 'x', status: 500 }),
    ).toBe(true);
  });

  it('rejects plain errors and unrelated objects', () => {
    expect(isApiError(new Error('x'))).toBe(false);
    expect(isApiError({ kind: 'other', message: 'x' })).toBe(false);
    expect(isApiError(null)).toBe(false);
  });
});
