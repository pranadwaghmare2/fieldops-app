import type { UseFormReturn } from '@/core/integrations/form';

import type { WorkOrderFormValues } from '../validations/workOrderFormSchema';

export type WorkOrderFormMode = 'create' | 'edit';

export type WorkOrderFormParams = {
  mode: WorkOrderFormMode;
  id?: string;
};

/**
 * Discriminated load state for edit prefills (create is always ready).
 */
export type WorkOrderFormLoadUi =
  | { status: 'ready' }
  | { status: 'loading' }
  | { status: 'error'; message: string };

export type WorkOrderFormConflict = {
  message: string;
};

export type UseWorkOrderFormResult = {
  mode: WorkOrderFormMode;
  form: UseFormReturn<WorkOrderFormValues>;
  loadUi: WorkOrderFormLoadUi;
  isSubmitting: boolean;
  formBanner: string | null;
  conflict: WorkOrderFormConflict | null;
  assigneeOptions: { label: string; value: string | null }[];
  onSubmit: () => void;
  onKeepMine: () => void;
  onLoadTheirs: () => void;
  onRetryLoad: () => void;
};
