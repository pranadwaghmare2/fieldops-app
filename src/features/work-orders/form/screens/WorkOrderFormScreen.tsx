import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { messages } from '@/core/constants';
import { Controller } from '@/core/integrations/form';
import {
  Button,
  ScreenShell,
  Select,
  Text,
  TextField,
} from '@/core/integrations/ui';
import { colours, spacing } from '@/core/theme';
import { Priority } from '@/core/types';

import { ChecklistFields } from '../components/ChecklistFields';
import { ConflictBanner } from '../components/ConflictBanner';
import { ConflictMergeModal } from '../components/ConflictMergeModal';
import { DueDateField } from '../components/DueDateField';
import { PRIORITY_OPTIONS } from '../constants/formUi';
import { useWorkOrderForm } from '../hooks/useWorkOrderForm';
import type { WorkOrderFormMode } from '../types';

type WorkOrderFormScreenProps = {
  mode: WorkOrderFormMode;
  id?: string;
};

/**
 * Shared create/edit form — mode from route; fields in brief order.
 */
export function WorkOrderFormScreen({ mode, id }: WorkOrderFormScreenProps) {
  const {
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
  } = useWorkOrderForm({ mode, id });

  if (loadUi.status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <ScreenShell>
          <View style={styles.center}>
            <Text role="body" style={styles.muted}>
              Loading…
            </Text>
          </View>
        </ScreenShell>
      </SafeAreaView>
    );
  }

  if (loadUi.status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
        <ScreenShell>
          <View style={styles.center}>
            <Text role="body" style={styles.muted}>
              {loadUi.message}
            </Text>
            <Button variant="secondary" size="md" onPress={onRetryLoad}>
              {messages.retry}
            </Button>
          </View>
        </ScreenShell>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <ScreenShell>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {conflict != null ? (
              <ConflictBanner
                conflict={conflict}
                isDisabled={isSubmitting}
                isSubmitting={isSubmitting}
                onKeepMine={onKeepMine}
                onLoadTheirs={onLoadTheirs}
                onOpenMerge={onOpenMerge}
              />
            ) : null}

            {formBanner != null ? (
              <Text role="caption" style={styles.danger}>
                {formBanner}
              </Text>
            ) : null}

            <Controller
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <TextField
                  label="Title"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={fieldState.error?.message}
                  editable={!isSubmitting}
                />
              )}
            />

            <Controller
              control={form.control}
              name="site"
              render={({ field, fieldState }) => (
                <TextField
                  label="Site"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={fieldState.error?.message}
                  editable={!isSubmitting}
                />
              )}
            />

            <View>
              <Text role="label" style={styles.fieldLabel}>
                Priority
              </Text>
            <Controller
              control={form.control}
              name="priority"
              render={({ field, fieldState }) => (
                <Select
                  options={PRIORITY_OPTIONS}
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Cross-field: urgent ↔ due window must re-check after priority flips.
                    void form.trigger('dueAt');
                  }}
                  errorMessage={fieldState.error?.message}
                  disabled={isSubmitting}
                  accessibilityLabel="Priority"
                />
              )}
            />
            </View>

            <View>
              <Text role="label" style={styles.fieldLabel}>
                Assignee
              </Text>
              <Controller
                control={form.control}
                name="assigneeId"
                render={({ field, fieldState }) => (
                  <Select
                    options={assigneeOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    errorMessage={fieldState.error?.message}
                    disabled={isSubmitting}
                    accessibilityLabel="Assignee"
                  />
                )}
              />
            </View>

            <Controller
              control={form.control}
              name="dueAt"
              render={({ field, fieldState }) => (
                <DueDateField
                  value={field.value}
                  onChange={(isoValue) => {
                    field.onChange(isoValue);
                    // Cross-field: re-check the urgent 48h window on each pick.
                    if (form.getValues('priority') === Priority.Urgent) {
                      void form.trigger('dueAt');
                    }
                  }}
                  errorMessage={fieldState.error?.message}
                  isDisabled={isSubmitting}
                />
              )}
            />

            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <TextField
                  label="Description"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={fieldState.error?.message}
                  multiline
                  editable={!isSubmitting}
                />
              )}
            />

            <ChecklistFields
              form={form}
              mode={mode}
              isDisabled={isSubmitting}
            />

            <Button
              variant="primary"
              size="lg"
              onPress={onSubmit}
              isDisabled={isSubmitting}
              isLoading={isSubmitting}
            >
              {mode === 'create' ? messages.create : messages.save}
            </Button>
          </ScrollView>
        </ScreenShell>
      </KeyboardAvoidingView>

      {conflict != null ? (
        <ConflictMergeModal
          rows={conflict.rows}
          merge={merge}
          isSubmitting={isSubmitting}
          onPickSide={onPickSide}
          onUseAllFrom={onUseAllFrom}
          onApplyMerge={onApplyMerge}
          onCancelMerge={onCancelMerge}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colours.bg,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[4],
  },
  muted: {
    color: colours.fgMuted,
    textAlign: 'center',
  },
  danger: {
    color: colours.danger,
  },
  fieldLabel: {
    marginBottom: spacing[2],
    color: colours.fgMuted,
  },
});
