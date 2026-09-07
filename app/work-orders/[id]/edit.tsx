import { Stack, useLocalSearchParams } from 'expo-router';

import { WorkOrderFormScreen } from '@/features/work-orders/form/screens/WorkOrderFormScreen';

import { useStackHeaderBack } from '../stackHeaderBack';

/**
 * Edit route shell — Screen 3 edit mode.
 */
export default function WorkOrderEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workOrderId = typeof id === 'string' ? id : '';
  const header = useStackHeaderBack('Edit work order');

  return (
    <>
      <Stack.Screen options={header} />
      <WorkOrderFormScreen mode="edit" id={workOrderId} />
    </>
  );
}
