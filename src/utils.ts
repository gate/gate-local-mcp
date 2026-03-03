/**
 * Convert a JavaScript value to a compact JSON string for MCP tool responses.
 */
export function toText(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/**
 * Wrap a value in the standard MCP tool content response format.
 */
export function textContent(value: unknown) {
  return { content: [{ type: 'text' as const, text: toText(value) }] };
}

/**
 * Wrap an error message in the standard MCP tool content response format.
 */
export function errorContent(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}
