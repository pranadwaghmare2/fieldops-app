/**
 * Formats an ISO date for list/detail display (locale short date).
 * Keep pure — no React, no I/O.
 */
export function formatDisplayDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return iso;
  }
  return new Date(ms).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
