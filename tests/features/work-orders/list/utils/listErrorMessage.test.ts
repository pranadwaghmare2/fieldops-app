import { messages } from '@/core/constants';
import { ApiErrorKind } from '@/core/types';

import { toListErrorMessage } from '@/features/work-orders/list/utils/listErrorMessage';

describe('toListErrorMessage', () => {
  it('uses ApiError.message for network and http (never kind)', () => {
    expect(
      toListErrorMessage({
        kind: ApiErrorKind.Network,
        message: 'Network Error',
      }),
    ).toBe('Network Error');
    expect(
      toListErrorMessage({
        kind: ApiErrorKind.Http,
        message: 'Boom from mock-api',
        status: 500,
        retryable: true,
      }),
    ).toBe('Boom from mock-api');
  });

  it('falls back when message missing', () => {
    expect(toListErrorMessage(null)).toBe(messages.listError);
    expect(toListErrorMessage(new Error(''))).toBe(messages.listError);
    expect(toListErrorMessage(new Error('plain'))).toBe('plain');
  });
});
