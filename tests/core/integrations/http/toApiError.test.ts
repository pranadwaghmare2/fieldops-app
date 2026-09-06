import { toApiError } from '@/core/integrations/http';
import { ApiErrorKind } from '@/core/types';

describe('toApiError', () => {
  it('maps axios-like 422 field errors', () => {
    const err = {
      isAxiosError: true,
      message: 'Request failed',
      response: {
        status: 422,
        data: { message: 'Invalid', errors: { title: 'Too short' } },
      },
    };
    expect(toApiError(err)).toMatchObject({
      kind: ApiErrorKind.Http,
      status: 422,
      fieldErrors: { title: 'Too short' },
    });
  });

  it('maps network failure without response', () => {
    const err = {
      isAxiosError: true,
      message: 'Network Error',
      response: undefined,
    };
    expect(toApiError(err)).toMatchObject({ kind: ApiErrorKind.Network });
  });

  it('maps 409 current as opaque payload', () => {
    const current = { id: 'wo-1', version: 2 };
    const err = {
      isAxiosError: true,
      message: 'Conflict',
      response: {
        status: 409,
        data: { message: 'Stale version', current },
      },
    };
    expect(toApiError(err)).toMatchObject({
      kind: ApiErrorKind.Http,
      status: 409,
      current,
    });
  });

  it('marks 500 as retryable', () => {
    const err = {
      isAxiosError: true,
      message: 'Server error',
      response: { status: 500, data: { message: 'Chaos' } },
    };
    expect(toApiError(err)).toMatchObject({
      kind: ApiErrorKind.Http,
      status: 500,
      isRetryable: true,
    });
  });
});
