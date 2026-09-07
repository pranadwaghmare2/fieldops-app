import type { WorkOrder } from '@/core/types';

import type { WorkOrderFormValues } from '../validations/workOrderFormSchema';

/** Which copy of a field wins during a merge. */
export type ConflictSide = 'yours' | 'theirs';

/** Editable fields a 409 can disagree on. */
export type ConflictFieldKey =
  | 'title'
  | 'site'
  | 'priority'
  | 'assigneeId'
  | 'dueAt'
  | 'description'
  | 'checklist';

/** One comparison row rendered in the conflict banner and merge modal. */
export type ConflictFieldRow = {
  key: ConflictFieldKey;
  label: string;
  yours: string;
  theirs: string;
  isSame: boolean;
};

/** Chosen side per field. A missing entry means "not decided yet". */
export type ConflictPicks = Partial<Record<ConflictFieldKey, ConflictSide>>;

/**
 * Checklist is compared as a whole list: item-level merge is deliberately out of
 * scope, so the technician picks one list rather than reconciling ids.
 */
function describeChecklist(items: { label: string; done: boolean }[]): string {
  if (items.length === 0) {
    return 'No items';
  }
  const labels = items.map(
    (item) => `${item.done ? 'done' : 'open'} · ${item.label.trim()}`,
  );
  return `${items.length} item${items.length === 1 ? '' : 's'} — ${labels.join('; ')}`;
}

/**
 * Builds the optimistic-concurrency snapshot for a 409: one row per editable
 * field with a same/differs flag, so the merge modal only demands a decision
 * where the two copies actually disagree.
 */
export function buildConflictSnapshot(
  theirs: WorkOrder,
  yours: WorkOrderFormValues,
  resolveAssignee: (assigneeId: string | null) => string,
): ConflictFieldRow[] {
  const rows: Omit<ConflictFieldRow, 'isSame'>[] = [
    {
      key: 'title',
      label: 'Title',
      yours: yours.title.trim(),
      theirs: theirs.title,
    },
    { key: 'site', label: 'Site', yours: yours.site.trim(), theirs: theirs.site },
    {
      key: 'priority',
      label: 'Priority',
      yours: yours.priority,
      theirs: theirs.priority,
    },
    {
      key: 'assigneeId',
      label: 'Assignee',
      yours: resolveAssignee(yours.assigneeId),
      theirs: resolveAssignee(theirs.assigneeId),
    },
    { key: 'dueAt', label: 'Due', yours: yours.dueAt.trim(), theirs: theirs.dueAt },
    {
      key: 'description',
      label: 'Description',
      yours: yours.description.trim(),
      theirs: theirs.description,
    },
    {
      key: 'checklist',
      label: 'Checklist',
      yours: describeChecklist(yours.checklist),
      theirs: describeChecklist(theirs.checklist),
    },
  ];

  return rows.map((row) => ({ ...row, isSame: row.yours === row.theirs }));
}

/**
 * Identical fields need no decision, so they pre-resolve to `yours` (same bytes
 * either way). Differing fields stay unresolved to force an explicit choice.
 */
export function defaultConflictPicks(rows: ConflictFieldRow[]): ConflictPicks {
  const picks: ConflictPicks = {};
  for (const row of rows) {
    if (row.isSame) {
      picks[row.key] = 'yours';
    }
  }
  return picks;
}

/** Differing fields with no side chosen yet — Apply stays blocked while non-empty. */
export function unresolvedConflictKeys(
  rows: ConflictFieldRow[],
  picks: ConflictPicks,
): ConflictFieldKey[] {
  return rows
    .filter((row) => !row.isSame && picks[row.key] == null)
    .map((row) => row.key);
}

/**
 * Builds merged form values from per-field picks. A field with no recorded pick
 * keeps the local value, so a partial merge can never silently adopt server text.
 */
export function applyConflictPicks(
  yours: WorkOrderFormValues,
  theirs: WorkOrder,
  picks: ConflictPicks,
): WorkOrderFormValues {
  const takeTheirs = (key: ConflictFieldKey) => picks[key] === 'theirs';

  return {
    title: takeTheirs('title') ? theirs.title : yours.title,
    site: takeTheirs('site') ? theirs.site : yours.site,
    priority: takeTheirs('priority') ? theirs.priority : yours.priority,
    assigneeId: takeTheirs('assigneeId') ? theirs.assigneeId : yours.assigneeId,
    dueAt: takeTheirs('dueAt') ? theirs.dueAt : yours.dueAt,
    description: takeTheirs('description') ? theirs.description : yours.description,
    checklist: takeTheirs('checklist')
      ? theirs.checklist.map((item) => ({
          id: item.id,
          label: item.label,
          done: item.done,
        }))
      : yours.checklist,
  };
}
