import type { UseFormReturn } from '@/core/integrations/form';
import type { WorkOrder } from '@/core/types';

import type {
  ConflictFieldKey,
  ConflictFieldRow,
  ConflictPicks,
  ConflictSide,
} from '../utils/conflictSnapshot';
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

/**
 * Active 409 conflict: why the write was rejected, the field-by-field snapshot,
 * and the server copy whose `version` any retry must send back verbatim.
 */
export type WorkOrderFormConflict = {
  message: string;
  rows: ConflictFieldRow[];
  current: WorkOrder;
};

/**
 * Merge modal state. `unresolvedKeys` is empty only when every differing field
 * has exactly one chosen side, which is what unblocks Apply.
 */
export type WorkOrderFormMerge = {
  isOpen: boolean;
  picks: ConflictPicks;
  unresolvedKeys: ConflictFieldKey[];
  notice: string | null;
};

export type UseWorkOrderFormResult = {
  mode: WorkOrderFormMode;
  form: UseFormReturn<WorkOrderFormValues>;
  loadUi: WorkOrderFormLoadUi;
  isSubmitting: boolean;
  formBanner: string | null;
  conflict: WorkOrderFormConflict | null;
  merge: WorkOrderFormMerge;
  assigneeOptions: { label: string; value: string | null }[];
  onSubmit: () => void;
  onKeepMine: () => void;
  onLoadTheirs: () => void;
  onOpenMerge: () => void;
  onCancelMerge: () => void;
  onPickSide: (key: ConflictFieldKey, side: ConflictSide) => void;
  onUseAllFrom: (side: ConflictSide) => void;
  onApplyMerge: () => void;
  onRetryLoad: () => void;
};
