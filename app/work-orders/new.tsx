import { Stack } from 'expo-router';

import { WorkOrderFormScreen } from '@/features/work-orders/form/screens/WorkOrderFormScreen';

import { useStackHeaderBack } from './stackHeaderBack';

/**
 * Create route shell — Screen 3 create mode.
 */
export default function WorkOrderCreateRoute() {
  const header = useStackHeaderBack('Create work order');

  return (
    <>
      <Stack.Screen options={header} />
      <WorkOrderFormScreen mode="create" />
    </>
  );
}
