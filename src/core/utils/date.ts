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

/**
 * Formats an ISO date for the due-date field (locale short date + time).
 * Time is shown because the urgent rule is hour-based (due within 48 hours),
 * so a date-only label would hide why validation passes or fails.
 */
export function formatDisplayDateTime(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) {
    return iso;
  }
  return new Date(ms).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
