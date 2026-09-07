import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import {
  DateTimePicker,
  type DateTimePickerEvent,
} from '@/core/integrations/datetime';
import { Button, Text } from '@/core/integrations/ui';
import { colours, radius, spacing } from '@/core/theme';
import { formatDisplayDateTime } from '@/core/utils';

export type DueDateFieldProps = {
  /** ISO 8601 string — the wire format the API expects. */
  value: string;
  onChange: (isoValue: string) => void;
  errorMessage?: string;
  isDisabled?: boolean;
};

/** Empty or unparseable field opens on the next whole hour rather than "now". */
function initialDate(value: string): Date {
  const ms = Date.parse(value);
  if (!Number.isNaN(ms)) {
    return new Date(ms);
  }
  const next = new Date();
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next;
}

/** Keeps the picked day but takes hours/minutes from the second (time) step. */
function withTimeFrom(day: Date, time: Date): Date {
  const merged = new Date(day);
  merged.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return merged;
}

/**
 * Native due-date control. The technician picks from the system UI while the
 * form value stays ISO 8601, so nothing downstream has to parse a typed string.
 *
 * @remarks Platform shapes differ: iOS renders the picker inline (so it is held
 * in a sheet with an explicit Done), Android opens modal dialogs, which means
 * date and time must be requested in two chained steps.
 */
export function DueDateField({
  value,
  onChange,
  errorMessage,
  isDisabled = false,
}: DueDateFieldProps) {
  const [step, setStep] = useState<'date' | 'time' | null>(null);
  const [draft, setDraft] = useState<Date>(() => initialDate(value));

  const open = () => {
    setDraft(initialDate(value));
    setStep('date');
  };

  const commit = (next: Date) => {
    setStep(null);
    onChange(next.toISOString());
  };

  const onAndroidChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (event.type === 'dismissed' || selected == null) {
      setStep(null);
      return;
    }
    // First dialog fixes the day, then a second dialog fixes the time.
    if (step === 'date') {
      setDraft(withTimeFrom(selected, draft));
      setStep('time');
      return;
    }
    commit(withTimeFrom(draft, selected));
  };

  return (
    <View>
      <Text role="label" style={styles.label}>
        Due date
      </Text>
      <Pressable
        onPress={open}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel="Due date"
        accessibilityValue={{ text: value === '' ? 'Not set' : value }}
        accessibilityState={{ disabled: isDisabled }}
        style={[
          styles.control,
          errorMessage != null && styles.controlError,
          isDisabled && styles.controlDisabled,
        ]}
      >
        <Text role="body" style={value === '' ? styles.placeholder : undefined}>
          {value === '' ? 'Select a due date' : formatDisplayDateTime(value)}
        </Text>
      </Pressable>
      {errorMessage != null ? (
        <Text role="caption" style={styles.error}>
          {errorMessage}
        </Text>
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={step !== null} transparent animationType="slide">
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <DateTimePicker
                value={draft}
                mode="datetime"
                display="inline"
                onChange={(_event, selected) => {
                  if (selected != null) {
                    setDraft(selected);
                  }
                }}
              />
              <Button variant="primary" size="md" onPress={() => commit(draft)}>
                Done
              </Button>
              <Button
                variant="secondary"
                size="md"
                onPress={() => setStep(null)}
              >
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
      ) : step !== null ? (
        <DateTimePicker value={draft} mode={step} onChange={onAndroidChange} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing[2],
    color: colours.fgMuted,
  },
  control: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
    backgroundColor: colours.bg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
  },
  controlError: {
    borderColor: colours.danger,
  },
  controlDisabled: {
    backgroundColor: colours.surface,
  },
  placeholder: {
    color: colours.fgMuted,
  },
  error: {
    marginTop: spacing[1],
    color: colours.danger,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  sheet: {
    backgroundColor: colours.bg,
    borderTopLeftRadius: radius,
    borderTopRightRadius: radius,
    padding: spacing[4],
    gap: spacing[2],
  },
});
