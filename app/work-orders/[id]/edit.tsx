import { Stack, useLocalSearchParams } from 'expo-router';

import { WorkOrderFormScreen } from '@/features/work-orders/form/screens/WorkOrderFormScreen';

/**
 * Edit route shell — Screen 3 edit mode.
 */
export default function WorkOrderEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workOrderId = typeof id === 'string' ? id : '';

  return (
    <>
      <Stack.Screen options={{ title: 'Edit work order' }} />
      <WorkOrderFormScreen mode="edit" id={workOrderId} />
    </>
  );
}
