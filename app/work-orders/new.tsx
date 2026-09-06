import { Stack } from 'expo-router';

import { WorkOrderFormScreen } from '@/features/work-orders/form/screens/WorkOrderFormScreen';

/**
 * Create route shell — Screen 3 create mode.
 */
export default function WorkOrderCreateRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Create work order' }} />
      <WorkOrderFormScreen mode="create" />
    </>
  );
}
