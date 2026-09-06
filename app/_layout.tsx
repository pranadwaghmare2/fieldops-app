import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '../global.css';

/**
 * Root layout — providers land in a later task once integrations exist.
 * Keep this file free of business logic.
 */
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
