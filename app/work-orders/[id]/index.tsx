import { Stack, useLocalSearchParams } from 'expo-router';

import { WorkOrderDetailScreen } from '@/features/work-orders/detail/screens/WorkOrderDetailScreen';

import { useStackHeaderBack } from '../stackHeaderBack';

/**
 * Detail route shell — Screen 2 (`/work-orders/[id]`).
 */
export default function WorkOrderDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workOrderId = typeof id === 'string' ? id : '';
  const header = useStackHeaderBack('Work order');

  return (
    <>
      <Stack.Screen options={header} />
      <WorkOrderDetailScreen id={workOrderId} />
    </>
  );
}
