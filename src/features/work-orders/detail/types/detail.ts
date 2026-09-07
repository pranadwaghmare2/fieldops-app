import type { Status, WorkOrder } from '@/core/types';

/**
 * Discriminated UI state for the work-order detail screen.
 * Loading, not-found, error, and success stay distinguishable.
 */
export type WorkOrderDetailUi =
  | { status: 'loading' }
  | { status: 'notFound'; message: string }
  | { status: 'error'; message: string }
  | { status: 'success'; workOrder: WorkOrder };

/** ViewModel contract returned by `useWorkOrderDetail`. */
export type UseWorkOrderDetailResult = {
  ui: WorkOrderDetailUi;
  /** Backend-first status failure text; null when no status error. */
  statusErrorMessage: string | null;
  isStatusPending: boolean;
  isDeleting: boolean;
  onChangeStatus: (status: Status) => void;
  onRetryStatus: () => void;
  onRetryLoad: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onChecklistPress: () => void;
};
