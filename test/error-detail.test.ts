/**
 * Verifies that HTTP error responses from Gate API are fully surfaced:
 * - HTTP status code
 * - Gate API error body (e.g. {"label":"INVALID_PARAM_VALUE","message":"..."})
 * - Response headers (e.g. x-gate-trace-id)
 *
 * Strategy: mock HTTP server returns a 400 with a Gate-style error body
 * and a trace-id header; we assert all three appear in the MCP error response.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const GATE_ERROR_BODY = { label: 'INVALID_PARAM_VALUE', message: 'Invalid currency pair' };
const TRACE_ID = 'test-trace-abc123';

function startErrorMockServer() {
  return new Promise<{ port: number; close: () => Promise<void> }>((resolve) => {
    const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
      res.writeHead(400, {
        'Content-Type': 'application/json',
        'X-Gate-Trace-Id': TRACE_ID,
      });
      res.end(JSON.stringify(GATE_ERROR_BODY));
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({ port, close: () => new Promise<void>((r) => server.close(() => r())) });
    });
  });
}

describe('HTTP error responses include full Gate API detail', () => {
  let mock: Awaited<ReturnType<typeof startErrorMockServer>>;
  let client: Client;

  beforeAll(async () => {
    mock = await startErrorMockServer();
    client = await createTestClient({
      GATE_BASE_URL: `http://127.0.0.1:${mock.port}`,
    });
  });

  afterAll(async () => {
    await (client as any)?.close?.();
    await mock.close();
  });

  test('error response contains HTTP status code', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('"status": 400');
  });

  test('error response contains Gate API error body', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('INVALID_PARAM_VALUE');
    expect(text).toContain('Invalid currency pair');
  });

  test('error response contains x-gate-trace-id header', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain(TRACE_ID);
  });
});
