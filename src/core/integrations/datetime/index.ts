/**
 * Date/time integration — wraps `@react-native-community/datetimepicker`
 * (bundled in Expo Go, so no prebuild is required).
 * Vendor details stay inside this port: features import `DateTimePicker`
 * and `DateTimePickerEvent` from here, never the package path.
 */
export { default as DateTimePicker } from '@react-native-community/datetimepicker';

export type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
