/**
 * Abbreviation map applied to tool names at registration time.
 * Add entries here to shorten tool names globally (keeps source readable,
 * reduces wire-level name length for clients with character limits).
 */
export const NAME_ABBREVIATIONS: Record<string, string> = {
  futures:               'fx',
  sub_account:           'sa',
  dual_mode:             'dual',
  dual_comp:             'dual',
  flash_swap:            'fc',
  multi_collateral_loan: 'mcl',
};

/**
 * Apply NAME_ABBREVIATIONS to a tool name, replacing every occurrence of each
 * long word with its abbreviation.
 */
export function sanitizeToolName(name: string): string {
  return Object.entries(NAME_ABBREVIATIONS).reduce(
    (n, [long, short]) => n.replaceAll(long, short),
    name,
  );
}

/**
 * Convert a JavaScript value to a compact JSON string for MCP tool responses.
 */
export function toText(value: unknown): string {
  return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2);
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

const WRITE_VERBS = new Set([
  'create', 'cancel', 'amend', 'update', 'set',
  'delete', 'lock', 'unlock', 'add', 'countdown',
  'swap', 'place', 'change', 'stop', 'repay', 'operate',
  'confirm', 'send', 'upload',
]);

/**
 * Returns true if the tool name refers to a state-mutating (write) operation.
 * Tool names follow the pattern cex_{module}_{verb}_{rest}, so the verb is always
 * the third underscore-separated segment (index 2).
 */
export function isWriteTool(name: string): boolean {
  return WRITE_VERBS.has(name.split('_')[2] ?? '');
}
