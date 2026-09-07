import {
  patchWorkOrderInDetail,
  patchWorkOrderInLists,
  removeWorkOrderFromLists,
} from '@/features/work-orders/detail/utils/patchWorkOrderCaches';
import type { InfiniteListData } from '@/features/work-orders/detail/types';
import { Priority, Status } from '@/core/types';
import type { ApiSuccess, CursorPage, WorkOrder } from '@/core/types';


function makeWorkOrder(overrides: Partial<WorkOrder> = {}): WorkOrder {
  return {
    id: 'wo-1',
    reference: 'WO-1',
    title: 'Pump Skid B fault',
    site: 'Harbour Point',
    description: 'desc',
    status: Status.Open,
    priority: Priority.High,
    assigneeId: null,
    assignee: null,
    dueAt: '2026-08-22T00:00:00.000Z',
    checklist: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    version: 1,
    ...overrides,
  };
}

describe('patchWorkOrderCaches', () => {
  it('patches status and version on detail envelope', () => {
    const prev: ApiSuccess<WorkOrder> = { data: makeWorkOrder() };
    const next = patchWorkOrderInDetail(prev, {
      status: Status.InProgress,
      version: 2,
    });
    expect(next?.data.status).toBe(Status.InProgress);
    expect(next?.data.version).toBe(2);
    expect(next?.data.title).toBe('Pump Skid B fault');
  });

  it('returns undefined when detail prev is undefined', () => {
    expect(
      patchWorkOrderInDetail(undefined, { status: Status.Done }),
    ).toBeUndefined();
  });

  it('patches matching row across two list pages', () => {
    const page1: CursorPage<WorkOrder> = {
      data: [makeWorkOrder({ id: 'wo-1' }), makeWorkOrder({ id: 'wo-2' })],
      nextCursor: 'c1',
    };
    const page2: CursorPage<WorkOrder> = {
      data: [makeWorkOrder({ id: 'wo-3', status: Status.Blocked })],
      nextCursor: null,
    };
    const prev: InfiniteListData = {
      pages: [page1, page2],
      pageParams: [null, 'c1'],
    };

    const next = patchWorkOrderInLists(prev, 'wo-1', {
      status: Status.Done,
      version: 3,
    });

    expect(next?.pages[0]?.data[0]?.status).toBe(Status.Done);
    expect(next?.pages[0]?.data[0]?.version).toBe(3);
    expect(next?.pages[0]?.data[1]?.status).toBe(Status.Open);
    expect(next?.pages[1]?.data[0]?.status).toBe(Status.Blocked);
  });

  it('no-ops when list id is missing', () => {
    const prev: InfiniteListData = {
      pages: [
        {
          data: [makeWorkOrder({ id: 'wo-2' })],
          nextCursor: null,
        },
      ],
      pageParams: [null],
    };
    const next = patchWorkOrderInLists(prev, 'wo-missing', {
      status: Status.Done,
    });
    expect(next?.pages[0]?.data[0]?.status).toBe(Status.Open);
  });

  it('removes work order from list pages', () => {
    const prev: InfiniteListData = {
      pages: [
        {
          data: [
            makeWorkOrder({ id: 'wo-1' }),
            makeWorkOrder({ id: 'wo-2' }),
          ],
          nextCursor: null,
        },
      ],
      pageParams: [null],
    };
    const next = removeWorkOrderFromLists(prev, 'wo-1');
    expect(next?.pages[0]?.data).toHaveLength(1);
    expect(next?.pages[0]?.data[0]?.id).toBe('wo-2');
  });

  it('returns undefined when list prev is undefined', () => {
    expect(
      patchWorkOrderInLists(undefined, 'wo-1', { status: Status.Done }),
    ).toBeUndefined();
    expect(removeWorkOrderFromLists(undefined, 'wo-1')).toBeUndefined();
  });
});
