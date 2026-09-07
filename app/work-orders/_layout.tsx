import { Stack } from 'expo-router';

/**
 * Nested stack for work-order detail / create / edit.
 * List lives at `/`; these screens always show a Back control (see stackHeaderBack).
 */
export default function WorkOrdersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    />
  );
}
