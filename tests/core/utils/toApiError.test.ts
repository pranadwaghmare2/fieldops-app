import { ApiErrorKind, HttpStatus } from '@/core/types';
import { toApiError } from '@/core/utils';

describe('toApiError', () => {
  it('maps 422 field errors from TransportFailure', () => {
    expect(
      toApiError({
        message: 'Invalid',
        status: HttpStatus.UnprocessableEntity,
        data: { message: 'Invalid', errors: { title: 'Too short' } },
      }),
    ).toMatchObject({
      kind: ApiErrorKind.Http,
      status: HttpStatus.UnprocessableEntity,
      fieldErrors: { title: 'Too short' },
    });
  });

  it('maps failure without status as network', () => {
    expect(toApiError({ message: 'Network Error' })).toMatchObject({
      kind: ApiErrorKind.Network,
      message: 'Network Error',
    });
  });

  it('maps 409 current as opaque payload', () => {
    const current = { id: 'wo-1', version: 2 };
    expect(
      toApiError({
        message: 'Stale version',
        status: HttpStatus.Conflict,
        data: { message: 'Stale version', current },
      }),
    ).toMatchObject({
      kind: ApiErrorKind.Http,
      status: HttpStatus.Conflict,
      current,
    });
  });

  it('marks 500 as retryable', () => {
    expect(
      toApiError({
        message: 'Chaos',
        status: HttpStatus.InternalServerError,
        data: { message: 'Chaos' },
      }),
    ).toMatchObject({
      kind: ApiErrorKind.Http,
      status: HttpStatus.InternalServerError,
      isRetryable: true,
    });
  });

  it('passes through existing ApiError', () => {
    const err = { kind: ApiErrorKind.Http, message: 'x', status: 400 };
    expect(toApiError(err)).toBe(err);
  });
});
