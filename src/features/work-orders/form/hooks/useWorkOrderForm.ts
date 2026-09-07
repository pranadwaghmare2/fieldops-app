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
  WorkOrderFormConflict,
  WorkOrderFormParams,
  WorkOrderFormValues,
} from '../types';
import type {
  ConflictFieldKey,
  ConflictPicks,
  ConflictSide,
} from '../utils/conflictSnapshot';
import {
  applyConflictPicks,
  buildConflictSnapshot,
  defaultConflictPicks,
  unresolvedConflictKeys,
} from '../utils/conflictSnapshot';
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
  const [conflict, setConflict] = useState<WorkOrderFormConflict | null>(null);
  const [mergePicks, setMergePicks] = useState<ConflictPicks>({});
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [mergeNotice, setMergeNotice] = useState<string | null>(null);
  const [hasHydratedEdit, setHasHydratedEdit] = useState(mode === 'create');
  // Read inside the mutation error handler, which is not re-created per render.
  const isMergeOpenRef = useRef(false);

  useEffect(() => {
    isMergeOpenRef.current = isMergeOpen;
  }, [isMergeOpen]);

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

  const resolveAssigneeName = useCallback(
    (assigneeId: string | null) =>
      assigneeOptions.find((option) => option.value === assigneeId)?.label ??
      'Unassigned',
    [assigneeOptions],
  );

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
      // Field errors live on the form behind the sheet — close it so they show.
      setIsMergeOpen(false);
      setFormBanner(error.message || null);
      return;
    }
    if (isApiErrorStatus<WorkOrder>(error, HttpStatus.Conflict)) {
      const current = error.current;
      if (current == null) {
        // Defensive: mock-api always attaches `current`; fall back to a banner.
        setFormBanner(error.message || messages.conflictWhy);
        return;
      }
      const rows = buildConflictSnapshot(
        current,
        form.getValues(),
        resolveAssigneeName,
      );
      setConflict({
        message: error.message.trim() || messages.conflictWhy,
        rows,
        current,
      });
      // A fresh conflict invalidates any picks made against the older snapshot.
      setMergePicks(defaultConflictPicks(rows));
      setMergeNotice(isMergeOpenRef.current ? messages.conflictMergeStale : null);
      setFormBanner(null);
      return;
    }
    setIsMergeOpen(false);
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
      setIsMergeOpen(false);
      setMergeNotice(null);
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

  /**
   * Retries the write with the technician's values. Never disabled by a conflict
   * count: the race ends as soon as no other writer wins between the 409 and this
   * PATCH, and the server owns the increment, so we send `current.version` as-is.
   */
  const onKeepMine = useCallback(() => {
    const values = form.getValues();
    const nextVersion =
      conflict?.current.version ?? nextVersionFromConflict(updateMutation.error);
    if (nextVersion == null) {
      setFormBanner(messages.formSubmitError);
      return;
    }
    versionRef.current = nextVersion;
    setConflict(null);
    setIsMergeOpen(false);
    setMergeNotice(null);
    updateMutation.mutate({ values, version: nextVersion });
  }, [conflict, form, updateMutation]);

  /**
   * Adopts the server copy as the new base after an explicit confirm, then the
   * technician re-applies their change on top of it (reload-and-re-apply).
   */
  const onLoadTheirs = useCallback(() => {
    const current = conflict?.current ?? currentFromConflict(updateMutation.error);
    if (current == null) {
      return;
    }
    Alert.alert(
      messages.conflictLoadTheirs,
      messages.conflictLoadTheirsConfirm,
      [
        { text: messages.cancel, style: 'cancel' },
        {
          text: messages.conflictLoadTheirs,
          onPress: () => {
            versionRef.current = current.version;
            form.reset(workOrderToFormValues(current));
            setConflict(null);
            setIsMergeOpen(false);
            setMergeNotice(null);
            setFormBanner(null);
          },
        },
      ],
    );
  }, [conflict, form, updateMutation.error]);

  const onOpenMerge = useCallback(() => {
    if (conflict == null) {
      return;
    }
    setMergePicks(defaultConflictPicks(conflict.rows));
    setMergeNotice(null);
    setIsMergeOpen(true);
  }, [conflict]);

  const onCancelMerge = useCallback(() => {
    // Cancel leaves both the banner and the typed form untouched.
    setIsMergeOpen(false);
    setMergeNotice(null);
  }, []);

  const onPickSide = useCallback((key: ConflictFieldKey, side: ConflictSide) => {
    // Radio semantics: one side replaces the other, so "both" is unreachable.
    setMergePicks((previous) => ({ ...previous, [key]: side }));
    setMergeNotice(null);
  }, []);

  const onUseAllFrom = useCallback(
    (side: ConflictSide) => {
      if (conflict == null) {
        return;
      }
      const picks: ConflictPicks = {};
      for (const row of conflict.rows) {
        picks[row.key] = row.isSame ? 'yours' : side;
      }
      setMergePicks(picks);
      setMergeNotice(null);
    },
    [conflict],
  );

  /**
   * Writes the merged result into the form before the PATCH so the technician
   * keeps the resolved values on screen even if this attempt also conflicts.
   */
  const onApplyMerge = useCallback(() => {
    if (conflict == null) {
      return;
    }
    if (unresolvedConflictKeys(conflict.rows, mergePicks).length > 0) {
      setMergeNotice(messages.conflictMergeUnresolved);
      return;
    }
    const merged = applyConflictPicks(
      form.getValues(),
      conflict.current,
      mergePicks,
    );
    const version = conflict.current.version;
    form.reset(merged);
    versionRef.current = version;
    setMergeNotice(null);
    // Sheet stays open across the retry: if this attempt also conflicts, the
    // error handler rebuilds the rows in place instead of losing the context.
    updateMutation.mutate({ values: merged, version });
  }, [conflict, form, mergePicks, updateMutation]);

  const onRetryLoad = useCallback(() => {
    void detailQuery.refetch();
  }, [detailQuery]);

  const isSubmitting =
    form.formState.isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending;

  const merge = useMemo(
    () => ({
      isOpen: isMergeOpen,
      picks: mergePicks,
      unresolvedKeys:
        conflict == null
          ? []
          : unresolvedConflictKeys(conflict.rows, mergePicks),
      notice: mergeNotice,
    }),
    [conflict, isMergeOpen, mergeNotice, mergePicks],
  );

  return {
    mode,
    form,
    loadUi,
    isSubmitting,
    formBanner,
    conflict,
    merge,
    assigneeOptions,
    onSubmit,
    onKeepMine,
    onLoadTheirs,
    onOpenMerge,
    onCancelMerge,
    onPickSide,
    onUseAllFrom,
    onApplyMerge,
    onRetryLoad,
  };
}
