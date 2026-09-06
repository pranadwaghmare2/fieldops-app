import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { messages } from '@/core/constants';
import {
  queryKeys,
  useAppMutation,
  useAppQuery,
  useAppQueryClient,
} from '@/core/integrations/query';
import type { ApiSuccess, Status, WorkOrder } from '@/core/types';
import { HttpStatus } from '@/core/types';
import { isApiErrorStatus } from '@/core/utils';

import {
  deleteWorkOrder,
  getWorkOrder,
  updateWorkOrderStatus,
} from '../services';
import type {
  UseWorkOrderDetailResult,
  WorkOrderDetailUi,
} from '../types';
import { toDetailErrorMessage } from '../utils/detailErrorMessage';
import {
  patchWorkOrderInDetail,
  patchWorkOrderInLists,
  removeWorkOrderFromLists,
} from '../utils/patchWorkOrderCaches';
import type { InfiniteListData } from '../types';

type StatusMutationContext = {
  previousDetail: ApiSuccess<WorkOrder> | undefined;
  previousLists: [readonly unknown[], InfiniteListData | undefined][];
  targetStatus: Status;
};

/**
 * Detail ViewModel — load record, optimistic status, delete with confirm.
 */
export function useWorkOrderDetail(id: string): UseWorkOrderDetailResult {
  const router = useRouter();
  const queryClient = useAppQueryClient();
  const lastFailedStatusRef = useRef<Status | null>(null);
  const [statusErrorMessage, setStatusErrorMessage] = useState<string | null>(
    null,
  );

  const detailQuery = useAppQuery({
    queryKey: queryKeys.workOrders.detail(id),
    queryFn: () => getWorkOrder(id),
    enabled: id.trim() !== '',
  });

  const statusMutation = useAppMutation({
    mutationFn: (status: Status) => updateWorkOrderStatus(id, status),
    onMutate: async (status): Promise<StatusMutationContext> => {
      setStatusErrorMessage(null);
      await queryClient.cancelQueries({
        queryKey: queryKeys.workOrders.detail(id),
      });
      await queryClient.cancelQueries({
        queryKey: queryKeys.workOrders.lists(),
      });

      const previousDetail = queryClient.getQueryData<ApiSuccess<WorkOrder>>(
        queryKeys.workOrders.detail(id),
      );
      const previousLists = queryClient.getQueriesData<InfiniteListData>({
        queryKey: queryKeys.workOrders.lists(),
      }) as StatusMutationContext['previousLists'];

      // Optimistic: show new status immediately on detail + matching list rows.
      queryClient.setQueryData<ApiSuccess<WorkOrder>>(
        queryKeys.workOrders.detail(id),
        (prev) => patchWorkOrderInDetail(prev, { status }),
      );
      queryClient.setQueriesData<InfiniteListData>(
        { queryKey: queryKeys.workOrders.lists() },
        (prev) => patchWorkOrderInLists(prev, id, { status }),
      );

      return { previousDetail, previousLists, targetStatus: status };
    },
    onError: (error, _status, context) => {
      if (context?.previousDetail !== undefined) {
        queryClient.setQueryData(
          queryKeys.workOrders.detail(id),
          context.previousDetail,
        );
      }
      if (context?.previousLists != null) {
        for (const [key, data] of context.previousLists) {
          queryClient.setQueryData(key, data);
        }
      }
      lastFailedStatusRef.current = context?.targetStatus ?? null;
      setStatusErrorMessage(
        toDetailErrorMessage(error, messages.statusUpdateFailed),
      );
    },
    onSuccess: (envelope) => {
      lastFailedStatusRef.current = null;
      setStatusErrorMessage(null);
      queryClient.setQueryData(queryKeys.workOrders.detail(id), envelope);
      queryClient.setQueriesData<InfiniteListData>(
        { queryKey: queryKeys.workOrders.lists() },
        (prev) =>
          patchWorkOrderInLists(prev, id, {
            status: envelope.data.status,
            version: envelope.data.version,
            updatedAt: envelope.data.updatedAt,
          }),
      );
    },
  });

  const deleteMutation = useAppMutation({
    mutationFn: () => deleteWorkOrder(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.workOrders.detail(id) });
      queryClient.setQueriesData<InfiniteListData>(
        { queryKey: queryKeys.workOrders.lists() },
        (prev) => removeWorkOrderFromLists(prev, id),
      );
      router.replace('/' as Href);
    },
  });

  const ui: WorkOrderDetailUi = useMemo(() => {
    if (detailQuery.isPending) {
      return { status: 'loading' };
    }
    if (detailQuery.isError) {
      const err = detailQuery.error;
      if (isApiErrorStatus(err, HttpStatus.NotFound)) {
        return {
          status: 'notFound',
          message: toDetailErrorMessage(err, messages.detailNotFound),
        };
      }
      return {
        status: 'error',
        message: toDetailErrorMessage(err, messages.detailError),
      };
    }
    if (detailQuery.data == null) {
      return {
        status: 'error',
        message: messages.detailError,
      };
    }
    return { status: 'success', workOrder: detailQuery.data.data };
  }, [
    detailQuery.data,
    detailQuery.error,
    detailQuery.isError,
    detailQuery.isPending,
  ]);

  const onChangeStatus = useCallback(
    (status: Status) => {
      if (ui.status !== 'success' || ui.workOrder.status === status) {
        return;
      }
      statusMutation.mutate(status);
    },
    [statusMutation, ui],
  );

  const onRetryStatus = useCallback(() => {
    const target = lastFailedStatusRef.current;
    if (target == null) {
      return;
    }
    statusMutation.mutate(target);
  }, [statusMutation]);

  const onRetryLoad = useCallback(() => {
    void detailQuery.refetch();
  }, [detailQuery]);

  const onEdit = useCallback(() => {
    router.push(`/work-orders/${id}/edit` as Href);
  }, [id, router]);

  const onDelete = useCallback(() => {
    Alert.alert(messages.deleteWorkOrderTitle, messages.deleteWorkOrderConfirm, [
      { text: messages.cancel, style: 'cancel' },
      {
        text: messages.delete,
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate();
        },
      },
    ]);
  }, [deleteMutation]);

  const onChecklistPress = useCallback(() => {
    Alert.alert(messages.edit, messages.checklistEditHint);
  }, []);

  return {
    ui,
    statusErrorMessage,
    isStatusPending: statusMutation.isPending,
    isDeleting: deleteMutation.isPending,
    onChangeStatus,
    onRetryStatus,
    onRetryLoad,
    onEdit,
    onDelete,
    onChecklistPress,
  };
}
