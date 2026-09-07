/**
 * User-facing copy for distinguishable empty / error states.
 */
export const messages = {
  listEmpty: 'No work orders yet.',
  listEmptyFiltered: 'No work orders match these filters.',
  listError: 'Could not load work orders.',
  detailNotFound: 'Work order not found.',
  detailError: 'Could not load this work order.',
  statusUpdateFailed: 'Status update failed. Your previous status was restored.',
  retry: 'Retry',
  clearFilters: 'Clear filters',
  checklistEditHint: 'Edit this work order to update the checklist.',
  deleteWorkOrderConfirm: 'Delete this work order? This cannot be undone.',
  deleteChecklistConfirm: 'Remove this checklist item?',
  conflictKeepMine: 'Keep mine & save',
  conflictLoadTheirs: 'Load theirs',
  conflictBanner:
    'Someone else saved this work order. Your typed values are still here.',
  conflictWhy:
    'This work order changed on the server since you loaded it, so the save was rejected (stale version). Nothing you typed was lost.',
  conflictLoadTheirsConfirm:
    'Replace your form with the server copy? You can edit again from that copy.',
  conflictMerge: 'Merge field by field',
  conflictMergeTitle: 'Resolve conflict',
  conflictMergeIntro: 'Pick one copy per changed field. You cannot keep both.',
  conflictMergeApply: 'Apply & save',
  conflictMergeUseAllMine: 'Use all mine',
  conflictMergeUseAllTheirs: 'Use all theirs',
  conflictMergeUnresolved: 'Choose a copy for every changed field to continue.',
  conflictMergeStale:
    'The server changed again while you were choosing. Review the new values and pick again.',
  conflictYours: 'Yours',
  conflictTheirs: 'Theirs',
  conflictSame: 'Same on both',
  conflictNoDifferences: 'Both copies match — saving adopts the latest version.',
  formSubmitError: 'Could not save this work order.',
  deleteWorkOrderTitle: 'Delete work order',
  deleteChecklistTitle: 'Remove item',
  cancel: 'Cancel',
  delete: 'Delete',
  remove: 'Remove',
  edit: 'Edit',
  save: 'Save',
  create: 'Create work order',
} as const;
