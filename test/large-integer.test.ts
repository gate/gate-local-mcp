/**
 * Validates that large order IDs (> Number.MAX_SAFE_INTEGER) are transmitted
 * without precision loss through the MCP stdio transport.
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
  return new Promise<{ port: number; getLastPath: () => string | null; close: () => Promise<void> }>(
    (resolve) => {
      let lastPath: string | null = null;

      const server = createServer((req: IncomingMessage, res: ServerResponse) => {
        lastPath = req.url ?? null;
        const body = getStub(req.url ?? '');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(body);
      });

      server.listen(0, '127.0.0.1', () => {
        const { port } = server.address() as { port: number };
        resolve({
          port,
          getLastPath: () => lastPath,
          close: () => new Promise<void>((r) => server.close(() => r())),
        });
      });
    }
  );
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
});
