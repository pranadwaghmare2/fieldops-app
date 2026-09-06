import { Status } from '@/core/types';
import {
  canFetchNextPage,
  flattenWorkOrderPages,
  toListApiParams,
} from '@/features/work-orders/list/utils/listParams';

describe('toListApiParams', () => {
  it('omits q when blank/whitespace and omits status when all', () => {
    expect(toListApiParams({ q: '  ', status: 'all', limit: 20 })).toEqual({
      limit: 20,
    });
    expect(
      toListApiParams({ q: 'pump', status: Status.Open, limit: 20 }),
    ).toEqual({
      limit: 20,
      q: 'pump',
      status: Status.Open,
    });
  });
});

describe('flattenWorkOrderPages', () => {
  it('flattens pages in order', () => {
    const pages = [
      { data: [{ id: '1' } as never], nextCursor: 'a' },
      { data: [{ id: '2' } as never], nextCursor: null },
    ];
    expect(flattenWorkOrderPages(pages).map((w) => w.id)).toEqual(['1', '2']);
  });

  it('returns empty array for undefined pages', () => {
    expect(flattenWorkOrderPages(undefined)).toEqual([]);
  });
});

describe('canFetchNextPage', () => {
  it('guards double fetchNextPage', () => {
    expect(
      canFetchNextPage({ hasNextPage: true, isFetchingNextPage: false }),
    ).toBe(true);
    expect(
      canFetchNextPage({ hasNextPage: true, isFetchingNextPage: true }),
    ).toBe(false);
    expect(
      canFetchNextPage({ hasNextPage: false, isFetchingNextPage: false }),
    ).toBe(false);
  });
});
