/** Escape `%`, `_`, and `\` for safe use in SQL ILIKE patterns. */
export function escapeIlikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export function toIlikeContainsPattern(value: string): string {
  return `%${escapeIlikePattern(value.trim())}%`;
}
