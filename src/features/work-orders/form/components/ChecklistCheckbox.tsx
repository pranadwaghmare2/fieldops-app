import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/core/integrations/ui';
import { colours, radius, spacing } from '@/core/theme';

type ChecklistCheckboxProps = {
  isChecked: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
};

/**
 * Token checkbox for checklist done — not a Switch (brief wireframe ☑/☐).
 */
export function ChecklistCheckbox({
  isChecked,
  isDisabled = false,
  onPress,
  accessibilityLabel,
}: ChecklistCheckboxProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.box,
        isChecked ? styles.boxChecked : null,
        isDisabled ? styles.boxDisabled : null,
      ]}
      hitSlop={spacing[2]}
    >
      {isChecked ? (
        <Text role="label" style={styles.mark}>
          ✓
        </Text>
      ) : (
        <View />
      )}
    </Pressable>
  );
}

const BOX = 22;

const styles = StyleSheet.create({
  box: {
    width: BOX,
    height: BOX,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colours.border,
    borderRadius: radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.bg,
  },
  boxChecked: {
    borderColor: colours.primary,
    backgroundColor: colours.primary,
  },
  boxDisabled: {
    opacity: 0.5,
  },
  mark: {
    color: colours.primaryFg,
    fontSize: 14,
    lineHeight: 16,
  },
});
