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
  trad_fi:               'tradfi',
  cross_ex:              'crx',
  crossex:               'crx',
  delivery:              'dc',
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
 * Wrap an error in the standard MCP tool content response format.
 * For HTTP errors (Axios), includes status code, Gate API error body,
 * and response headers (e.g. x-gate-trace-id) to aid debugging.
 */
export function errorContent(err: unknown) {
  // Axios errors carry a `response` property with full HTTP details
  const response = (err as { response?: { status?: number; data?: unknown; headers?: Record<string, unknown> } }).response;
  if (response) {
    const { status, data, headers = {} } = response;
    const relevantHeaders: Record<string, unknown> = {};
    for (const key of Object.keys(headers)) {
      if (key.toLowerCase().startsWith('x-') || key.toLowerCase() === 'content-type') {
        relevantHeaders[key] = headers[key];
      }
    }
    const detail: Record<string, unknown> = { status, body: data };
    if (Object.keys(relevantHeaders).length > 0) detail.headers = relevantHeaders;
    return { content: [{ type: 'text' as const, text: `Error: ${toText(detail)}` }], isError: true };
  }
  const message = err instanceof Error ? err.message : String(err);
  return { content: [{ type: 'text' as const, text: `Error: ${message}` }], isError: true };
}

const WRITE_VERBS = new Set([
  'create', 'cancel', 'amend', 'update', 'set',
  'delete', 'lock', 'unlock', 'add', 'countdown',
  'swap', 'place', 'change', 'stop', 'repay', 'operate',
  'confirm', 'send', 'upload', 'close', 'reset', 'quote', 'convert', 'redeem',
]);

/**
 * Returns true if the tool name refers to a state-mutating (write) operation.
 * Tool names follow the pattern cex_{module}_{verb}_{rest}, so the verb is always
 * the third underscore-separated segment (index 2).
 */
/** Identifies orders placed via this MCP server in Gate API order records. */
export const ORDER_SOURCE_TEXT = 'local_mcp';

export function isWriteTool(name: string): boolean {
  const parts = name.split('_');
  // Verb is at index 2 for most tools (cex_{module}_{verb}_...).
  // Some SDK-based names place a category word at index 2 with the verb at index 3
  // (e.g. cex_p2p_transaction_cancel), so check both positions.
  return WRITE_VERBS.has(parts[2] ?? '') || WRITE_VERBS.has(parts[3] ?? '');
}
