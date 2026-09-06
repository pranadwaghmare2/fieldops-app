/**
 * Reads public Expo env for the mock API base URL.
 * Physical devices need a LAN IP, not localhost — see `.env.example`.
 */
export function getApiBaseUrl(): string {
  const url = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new Error(
      'EXPO_PUBLIC_API_URL is missing. Copy .env.example to .env and set the mock API base URL.',
    );
  }
  return url.replace(/\/+$/, '');
}
