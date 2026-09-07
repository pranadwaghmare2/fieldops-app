import { useRouter, type Href } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { messages } from '@/core/constants';
import {
  applyServerFieldErrors,
  createZodResolver,
  useAppForm,
} from '@/core/integrations/form';
import {
  queryKeys,
  useAppMutation,
  useAppQuery,
  useAppQueryClient,
} from '@/core/integrations/query';
import type { ApiSuccess, WorkOrder } from '@/core/types';
import { HttpStatus } from '@/core/types';
import { isApiError, isApiErrorStatus } from '@/core/utils';

import {
  createWorkOrder,
  getWorkOrder,
  listUsers,
  updateWorkOrder,
} from '../services';
import type {
  UseWorkOrderFormResult,
  WorkOrderFormParams,
  WorkOrderFormValues,
} from '../types';
import {
  currentFromConflict,
  nextVersionFromConflict,
} from '../utils/conflictVersion';
import { workOrderToFormValues } from '../utils/formMappers';
import {
  defaultWorkOrderFormValues,
  workOrderFormSchema,
} from '../validations/workOrderFormSchema';

/**
 * Shared create/edit ViewModel — mode from route; one Zod schema.
 */
export function useWorkOrderForm({
  mode,
  id,
}: WorkOrderFormParams): UseWorkOrderFormResult {
  const router = useRouter();
  const queryClient = useAppQueryClient();
  const versionRef = useRef<number | null>(null);
  const [formBanner, setFormBanner] = useState<string | null>(null);
  const [conflict, setConflict] = useState<{ message: string } | null>(null);
  const [hasHydratedEdit, setHasHydratedEdit] = useState(mode === 'create');

  const form = useAppForm<WorkOrderFormValues>({
    // Port resolver cast keeps Zod/RHF generics stable across versions.
    resolver: createZodResolver(workOrderFormSchema) as never,
    defaultValues: defaultWorkOrderFormValues,
  });

  const usersQuery = useAppQuery({
    queryKey: queryKeys.users.all,
    queryFn: listUsers,
  });

  const detailQuery = useAppQuery({
    queryKey: queryKeys.workOrders.detail(id ?? ''),
    queryFn: () => getWorkOrder(id as string),
    enabled: mode === 'edit' && Boolean(id),
  });

  useEffect(() => {
    if (mode !== 'edit' || detailQuery.data == null || hasHydratedEdit) {
      return;
    }
    const order = detailQuery.data.data;
    versionRef.current = order.version;
    form.reset(workOrderToFormValues(order));
    setHasHydratedEdit(true);
  }, [detailQuery.data, form, hasHydratedEdit, mode]);

  const assigneeOptions = useMemo(() => {
    const users = usersQuery.data?.data ?? [];
    return [
      { label: 'Unassigned', value: null as string | null },
      ...users.map((user) => ({ label: user.name, value: user.id })),
    ];
  }, [usersQuery.data]);

  const loadUi = useMemo(() => {
    if (mode === 'create') {
      return { status: 'ready' as const };
    }
    if (detailQuery.isPending && !hasHydratedEdit) {
      return { status: 'loading' as const };
    }
    if (detailQuery.isError && !hasHydratedEdit) {
      return {
        status: 'error' as const,
        message: isApiError(detailQuery.error)
          ? detailQuery.error.message || messages.detailError
          : messages.detailError,
      };
    }
    return { status: 'ready' as const };
  }, [
    detailQuery.error,
    detailQuery.isError,
    detailQuery.isPending,
    hasHydratedEdit,
    mode,
  ]);

  const applyUnknownFieldErrors = useCallback(
    (fieldErrors: Record<string, string>) => {
      const known = new Set([
        'title',
        'site',
        'priority',
        'assigneeId',
        'dueAt',
        'description',
        'checklist',
      ]);
      const unknownMessages = Object.entries(fieldErrors)
        .filter(([field]) => !known.has(field))
        .map(([, message]) => message);
      if (unknownMessages.length > 0) {
        setFormBanner(unknownMessages.join(' '));
      }
    },
    [],
  );

  const toCreateBody = useCallback((values: WorkOrderFormValues) => {
    return {
      title: values.title,
      site: values.site,
      priority: values.priority,
      dueAt: values.dueAt,
      description: values.description,
      assigneeId: values.assigneeId,
      checklist: values.checklist.map((item) => ({
        id: item.id,
        label: item.label,
        done: item.done,
      })),
    };
  }, []);

  const toUpdateBody = useCallback(
    (values: WorkOrderFormValues, version: number) => {
      return {
        ...toCreateBody(values),
        description: values.description,
        assigneeId: values.assigneeId,
        version,
      };
    },
    [toCreateBody],
  );

  const createMutation = useAppMutation({
    mutationFn: (values: WorkOrderFormValues) =>
      createWorkOrder(toCreateBody(values)),
    onSuccess: (envelope) => {
      queryClient.setQueryData(
        queryKeys.workOrders.detail(envelope.data.id),
        envelope,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workOrders.lists(),
      });
      router.replace(`/work-orders/${envelope.data.id}` as Href);
    },
    onError: (error) => {
      handleSubmitError(error);
    },
  });

  const updateMutation = useAppMutation({
    mutationFn: (payload: { values: WorkOrderFormValues; version: number }) => {
      if (id == null) {
        throw new Error('Missing work order id');
      }
      return updateWorkOrder(id, toUpdateBody(payload.values, payload.version));
    },
    onSuccess: (envelope: ApiSuccess<WorkOrder>) => {
      setConflict(null);
      setFormBanner(null);
      versionRef.current = envelope.data.version;
      queryClient.setQueryData(
        queryKeys.workOrders.detail(envelope.data.id),
        envelope,
      );
      void queryClient.invalidateQueries({
        queryKey: queryKeys.workOrders.lists(),
      });
      router.back();
    },
    onError: (error) => {
      handleSubmitError(error);
    },
  });

  function handleSubmitError(error: unknown) {
    if (isApiErrorStatus(error, HttpStatus.UnprocessableEntity)) {
      if (error.fieldErrors != null) {
        applyServerFieldErrors(form, error.fieldErrors);
        applyUnknownFieldErrors(error.fieldErrors);
      }
      setFormBanner(error.message || null);
      return;
    }
    if (isApiErrorStatus(error, HttpStatus.Conflict)) {
      setConflict({
        message: error.message.trim() || messages.conflictBanner,
      });
      setFormBanner(null);
      return;
    }
    setFormBanner(
      isApiError(error) && error.message.trim() !== ''
        ? error.message
        : messages.formSubmitError,
    );
  }

  const submitValues = useCallback(
    (values: WorkOrderFormValues) => {
      setFormBanner(null);
      setConflict(null);
      if (mode === 'create') {
        createMutation.mutate(values);
        return;
      }
      const version = versionRef.current;
      if (version == null) {
        setFormBanner(messages.formSubmitError);
        return;
      }
      updateMutation.mutate({ values, version });
    },
    [createMutation, mode, updateMutation],
  );

  const onSubmit = useCallback(() => {
    void form.handleSubmit(submitValues)();
  }, [form, submitValues]);

  const onKeepMine = useCallback(() => {
    const values = form.getValues();
    // Use last conflict's current.version from the mutation error if available.
    const lastError = updateMutation.error;
    const nextVersion = nextVersionFromConflict(lastError);
    if (nextVersion == null) {
      setFormBanner(messages.formSubmitError);
      return;
    }
    versionRef.current = nextVersion;
    setConflict(null);
    updateMutation.mutate({ values, version: nextVersion });
  }, [form, updateMutation]);

  const onLoadTheirs = useCallback(() => {
    const current = currentFromConflict(updateMutation.error);
    if (current == null) {
      return;
    }
    Alert.alert(messages.conflictLoadTheirs, messages.conflictBanner, [
      { text: messages.cancel, style: 'cancel' },
      {
        text: messages.conflictLoadTheirs,
        onPress: () => {
          versionRef.current = current.version;
          form.reset(workOrderToFormValues(current));
          setConflict(null);
          setFormBanner(null);
        },
      },
    ]);
  }, [form, updateMutation.error]);

  const onRetryLoad = useCallback(() => {
    void detailQuery.refetch();
  }, [detailQuery]);

  const isSubmitting =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  return {
    mode,
    form,
    loadUi,
    isSubmitting,
    formBanner,
    conflict,
    assigneeOptions,
    onSubmit,
    onKeepMine,
    onLoadTheirs,
    onRetryLoad,
  };
}
