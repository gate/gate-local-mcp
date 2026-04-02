/**
 * Validates that:
 * 1. Large order IDs (> Number.MAX_SAFE_INTEGER) are transmitted without
 *    precision loss through the MCP stdio transport.
 * 2. The User-Agent header sent to Gate API includes the tool name in the
 *    format gate-local-mcp/<version>/<tool_name>.
 *
 * Without the ReadBuffer patch in src/index.ts, JSON.parse would silently
 * truncate 144115188075947640 → 144115188075947648 before the tool handler
 * ever sees it, causing the wrong order to be acted on.
 *
 * Strategy: spin up a mock HTTP server and point GATE_BASE_URL at it.
 * The gate-api client will send requests there; we assert the captured URL
 * path contains the exact large integer string.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const LARGE_ORDER_ID = '144115188075947640';

// Minimal response bodies that let gate-api parse without throwing.
const ORDER_STUB = JSON.stringify({ id: 1, status: 'cancelled', contract: 'BTC_USDT-20241227-50000-C' });
const FUTURES_STUB = JSON.stringify({ id: 1, status: 'cancelled', contract: 'BTC_USDT', settle: 'usdt' });

function startMockServer(getStub: (path: string) => string) {
  return new Promise<{
    port: number;
    getLastPath: () => string | null;
    getLastUserAgent: () => string | null;
    getLastHeaders: () => Record<string, string | undefined>;
    close: () => Promise<void>;
  }>((resolve) => {
    let lastPath: string | null = null;
    let lastUserAgent: string | null = null;
    let lastHeaders: Record<string, string | undefined> = {};

    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      lastPath = req.url ?? null;
      lastUserAgent = (req.headers['user-agent'] as string) ?? null;
      lastHeaders = {
        'x-gate-agent': req.headers['x-gate-agent'] as string | undefined,
        'x-gate-agent-version': req.headers['x-gate-agent-version'] as string | undefined,
        'x-gate-mcp-tools-name': req.headers['x-gate-mcp-tools-name'] as string | undefined,
        'x-gate-mcp-name': req.headers['x-gate-mcp-name'] as string | undefined,
        'x-gate-mcp-version': req.headers['x-gate-mcp-version'] as string | undefined,
      };
      const body = getStub(req.url ?? '');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(body);
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({
        port,
        getLastPath: () => lastPath,
        getLastUserAgent: () => lastUserAgent,
        getLastHeaders: () => lastHeaders,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

describe('large integer order ID — end-to-end precision', () => {
  let mock: Awaited<ReturnType<typeof startMockServer>>;
  let client: Client;

  beforeAll(async () => {
    mock = await startMockServer((path) =>
      path.includes('/futures/') ? FUTURES_STUB : ORDER_STUB
    );

    client = await createTestClient({
      GATE_BASE_URL: `http://127.0.0.1:${mock.port}`,
      // Provide dummy credentials so requireAuth() passes
      GATE_API_KEY: 'test-key',
      GATE_API_SECRET: 'test-secret-that-is-long-enough-for-hmac',
    });
  });

  afterAll(async () => {
    await (client as any)?.close?.();
    await mock.close();
  });

  test('cex_options_cancel_options_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_options_cancel_options_order',
      arguments: { order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    // Guard against a truncated ID sneaking through
    expect(path).not.toContain('144115188075947648');
  });

  test('cex_options_get_options_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_options_get_options_order',
      arguments: { order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    expect(path).not.toContain('144115188075947648');
  });

  test('cex_fx_cancel_fx_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_fx_cancel_fx_order',
      arguments: { settle: 'usdt', order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    expect(path).not.toContain('144115188075947648');
  });

  test('cex_fx_get_fx_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_fx_get_fx_order',
      arguments: { settle: 'usdt', order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    expect(path).not.toContain('144115188075947648');
  });

  test('cex_fx_cancel_fx_price_triggered_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_fx_cancel_fx_price_triggered_order',
      arguments: { settle: 'usdt', order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    expect(path).not.toContain('144115188075947648');
  });

  test('cex_fx_get_fx_price_triggered_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_fx_get_fx_price_triggered_order',
      arguments: { settle: 'usdt', order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    expect(path).not.toContain('144115188075947648');
  });

  test('cex_fc_get_flash_swap_order: request URL contains exact large order ID', async () => {
    await client.callTool({
      name: 'cex_fc_get_flash_swap_order',
      arguments: { order_id: LARGE_ORDER_ID },
    });

    const path = mock.getLastPath();
    expect(path).not.toBeNull();
    expect(path).toContain(LARGE_ORDER_ID);
    expect(path).not.toContain('144115188075947648');
  });
});

describe('User-Agent includes tool name', () => {
  let mock: Awaited<ReturnType<typeof startMockServer>>;
  let client: Client;

  beforeAll(async () => {
    mock = await startMockServer(() => JSON.stringify({ id: 1, status: 'open' }));
    client = await createTestClient({
      GATE_BASE_URL: `http://127.0.0.1:${mock.port}`,
      GATE_API_KEY: 'test-key',
      GATE_API_SECRET: 'test-secret-that-is-long-enough-for-hmac',
    });
  });

  afterAll(async () => {
    await (client as any)?.close?.();
    await mock.close();
  });

  test('User-Agent is 6-segment format with tool + MCP clientInfo (split /, 6)', async () => {
    await client.callTool({
      name: 'cex_spot_get_spot_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });

    const ua = mock.getLastUserAgent();
    expect(ua).not.toBeNull();
    // createTestClient uses Client({ name: 'test-client', version: '1.0' })
    const parts = (ua as string).split('/', 6);
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe('gate-local-mcp');
    expect(parts[1]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(parts[2]).toBe('cex_spot_get_spot_tickers');
    expect(parts[3]).toBe('test-client');
    expect(parts[4]).toBe('1.0');
    expect(typeof parts[5]).toBe('string');
  });

  test('different tools produce different User-Agent tool segments', async () => {
    await client.callTool({ name: 'cex_spot_list_currencies', arguments: {} });
    const ua1 = mock.getLastUserAgent();

    await client.callTool({ name: 'cex_spot_list_currency_pairs', arguments: {} });
    const ua2 = mock.getLastUserAgent();

    expect(ua1).toContain('cex_spot_list_currencies');
    expect(ua2).toContain('cex_spot_list_currency_pairs');
    expect(ua1).not.toEqual(ua2);
  });

  test('custom X-Gate-* headers are sent with correct values', async () => {
    await client.callTool({
      name: 'cex_spot_get_spot_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });

    const headers = mock.getLastHeaders();
    // createTestClient uses Client({ name: 'test-client', version: '1.0' })
    expect(headers['x-gate-agent']).toBe('test-client');
    expect(headers['x-gate-agent-version']).toBe('1.0');
    expect(headers['x-gate-mcp-tools-name']).toBe('cex_spot_get_spot_tickers');
    expect(headers['x-gate-mcp-name']).toBe('gate-local-mcp');
    expect(headers['x-gate-mcp-version']).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('different tools produce different X-Gate-MCP-Tools-Name', async () => {
    await client.callTool({ name: 'cex_spot_list_currencies', arguments: {} });
    const h1 = mock.getLastHeaders();

    await client.callTool({ name: 'cex_spot_list_currency_pairs', arguments: {} });
    const h2 = mock.getLastHeaders();

    expect(h1['x-gate-mcp-tools-name']).toBe('cex_spot_list_currencies');
    expect(h2['x-gate-mcp-tools-name']).toBe('cex_spot_list_currency_pairs');
    // agent headers stay consistent across calls
    expect(h1['x-gate-agent']).toBe('test-client');
    expect(h2['x-gate-agent']).toBe('test-client');
  });
});
