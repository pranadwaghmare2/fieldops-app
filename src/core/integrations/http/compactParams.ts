/**
 * Drop null/undefined/empty-string query keys so Axios does not send empties.
 */
export function compactParams(
  params?: Record<string, unknown>,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (params == null) {
    return out;
  }
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') {
      continue;
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      out[key] = value;
    }
  }
  return out;
}
