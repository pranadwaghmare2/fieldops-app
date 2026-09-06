import { compactParams } from '@/core/integrations/http';

describe('compactParams', () => {
  it('omits null, undefined, and empty string', () => {
    expect(
      compactParams({
        limit: 20,
        cursor: null,
        q: '',
        status: 'open',
        missing: undefined,
      }),
    ).toEqual({ limit: 20, status: 'open' });
  });

  it('returns empty object for undefined params', () => {
    expect(compactParams(undefined)).toEqual({});
  });
});
