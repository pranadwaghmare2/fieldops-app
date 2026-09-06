import { Alert, StyleSheet, View } from 'react-native';

import { messages } from '@/core/constants';
import {
  Controller,
  useFieldArray,
  type UseFormReturn,
} from '@/core/integrations/form';
import { Button, SurfaceCard, Text, TextField } from '@/core/integrations/ui';
import { colours, spacing } from '@/core/theme';

import { ChecklistCheckbox } from './ChecklistCheckbox';
import type { WorkOrderFormMode, WorkOrderFormValues } from '../types';

type ChecklistFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>;
  mode: WorkOrderFormMode;
  isDisabled: boolean;
};

/**
 * Dynamic checklist editor — add/remove (confirm)/reorder; checkbox done in edit.
 */
export function ChecklistFields({
  form,
  mode,
  isDisabled,
}: ChecklistFieldsProps) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'checklist',
  });

  const onRemove = (index: number) => {
    Alert.alert(messages.deleteChecklistTitle, messages.deleteChecklistConfirm, [
      { text: messages.cancel, style: 'cancel' },
      {
        text: messages.remove,
        style: 'destructive',
        onPress: () => {
          remove(index);
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Text role="heading">Checklist</Text>
      {fields.map((field, index) => (
        <SurfaceCard key={field.id} style={styles.rowCard}>
          <View style={styles.row}>
            {mode === 'edit' ? (
              <Controller
                control={form.control}
                name={`checklist.${index}.done`}
                render={({ field: doneField }) => (
                  <ChecklistCheckbox
                    isChecked={doneField.value}
                    isDisabled={isDisabled}
                    onPress={() => {
                      doneField.onChange(!doneField.value);
                    }}
                    accessibilityLabel={`Checklist item ${index + 1} done`}
                  />
                )}
              />
            ) : null}
            <View style={styles.fieldGrow}>
              <Controller
                control={form.control}
                name={`checklist.${index}.label`}
                render={({ field: labelField, fieldState }) => (
                  <TextField
                    label={`Item ${index + 1}`}
                    value={labelField.value}
                    onChangeText={labelField.onChange}
                    errorMessage={fieldState.error?.message}
                    editable={!isDisabled}
                  />
                )}
              />
            </View>
            <View style={styles.sideActions}>
              <Button
                variant="secondary"
                size="sm"
                isDisabled={isDisabled || index === 0}
                onPress={() => {
                  move(index, index - 1);
                }}
                accessibilityLabel={`Move item ${index + 1} up`}
              >
                Up
              </Button>
              <Button
                variant="secondary"
                size="sm"
                isDisabled={isDisabled || index === fields.length - 1}
                onPress={() => {
                  move(index, index + 1);
                }}
                accessibilityLabel={`Move item ${index + 1} down`}
              >
                Down
              </Button>
              <Button
                variant="ghost"
                size="sm"
                isDisabled={isDisabled}
                onPress={() => onRemove(index)}
                accessibilityLabel={`Remove item ${index + 1}`}
              >
                Remove
              </Button>
            </View>
          </View>
        </SurfaceCard>
      ))}
      <Button
        variant="secondary"
        size="md"
        isDisabled={isDisabled || fields.length >= 10}
        onPress={() => {
          append({ label: '', done: false });
        }}
      >
        Add item
      </Button>
      {form.formState.errors.checklist?.message != null ||
      form.formState.errors.checklist?.root?.message != null ? (
        <Text role="caption" style={styles.danger}>
          {form.formState.errors.checklist?.message ??
            form.formState.errors.checklist?.root?.message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[3],
  },
  rowCard: {
    padding: spacing[3],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    flexWrap: 'wrap',
  },
  fieldGrow: {
    flex: 1,
    minWidth: 160,
  },
  sideActions: {
    gap: spacing[2],
    justifyContent: 'center',
  },
  danger: {
    color: colours.danger,
  },
});
