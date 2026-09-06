import { Stack } from 'expo-router';

/**
 * Nested stack for work-order detail / create placeholders.
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
