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
