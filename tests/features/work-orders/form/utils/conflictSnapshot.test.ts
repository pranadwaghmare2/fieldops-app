import type { WorkOrder } from '@/core/types';
import { Priority, Status } from '@/core/types';
import {
  applyConflictPicks,
  buildConflictSnapshot,
  defaultConflictPicks,
  unresolvedConflictKeys,
} from '@/features/work-orders/form/utils/conflictSnapshot';
import type { WorkOrderFormValues } from '@/features/work-orders/form/validations/workOrderFormSchema';

const theirs: WorkOrder = {
  id: 'wo_1',
  reference: 'WO-2610',
  title: 'Server title value',
  site: 'Shared Site',
  description: 'Shared description',
  status: Status.Open,
  priority: Priority.High,
  assigneeId: 'u_2',
  assignee: { id: 'u_2', name: 'Server Tech', role: 'technician' },
  dueAt: '2026-08-22T12:00:00.000Z',
  checklist: [{ id: 'ck_1', label: 'Server step', done: false }],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  version: 4,
};

const yours: WorkOrderFormValues = {
  title: 'My local title value',
  site: 'Shared Site',
  priority: Priority.Urgent,
  assigneeId: 'u_2',
  dueAt: '2026-08-23T12:00:00.000Z',
  description: 'Shared description',
  checklist: [{ label: 'My step', done: true }],
};

const resolveAssignee = (assigneeId: string | null) =>
  assigneeId === 'u_2' ? 'Server Tech' : 'Unassigned';

describe('conflict snapshot', () => {
  it('flags fields that match on both sides so they need no decision', () => {
    const rows = buildConflictSnapshot(theirs, yours, resolveAssignee);
    const same = rows.filter((row) => row.isSame).map((row) => row.key);

    expect(same).toEqual(['site', 'assigneeId', 'description']);
  });

  it('requires an explicit pick for every differing field', () => {
    const rows = buildConflictSnapshot(theirs, yours, resolveAssignee);
    const picks = defaultConflictPicks(rows);

    // Matching fields pre-resolve; differing ones block Apply until decided.
    expect(unresolvedConflictKeys(rows, picks)).toEqual([
      'title',
      'priority',
      'dueAt',
      'checklist',
    ]);
    expect(unresolvedConflictKeys(rows, { ...picks, title: 'theirs' })).toEqual([
      'priority',
      'dueAt',
      'checklist',
    ]);
  });

  it('applies exactly one side per field and takes the checklist as a whole list', () => {
    const merged = applyConflictPicks(yours, theirs, {
      title: 'theirs',
      priority: 'yours',
      dueAt: 'yours',
      checklist: 'theirs',
    });

    expect(merged.title).toBe('Server title value');
    expect(merged.priority).toBe(Priority.Urgent);
    expect(merged.dueAt).toBe(yours.dueAt);
    expect(merged.checklist).toEqual([
      { id: 'ck_1', label: 'Server step', done: false },
    ]);
  });

  it('keeps local values for fields with no recorded pick', () => {
    const merged = applyConflictPicks(yours, theirs, { title: 'theirs' });

    expect(merged.site).toBe('Shared Site');
    expect(merged.dueAt).toBe(yours.dueAt);
    expect(merged.checklist).toEqual(yours.checklist);
  });
});
