/**
 * Verifies that all order-placement tools force text='local_mcp' in the
 * request body sent to the Gate REST API, regardless of user input.
 *
 * Strategy: mock HTTP server captures the raw request body; we assert
 * the parsed JSON contains text='local_mcp' (or every element does for
 * batch endpoints).
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => { raw += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { resolve(raw); }
    });
    req.on('error', reject);
  });
}

function startMockServer() {
  return new Promise<{
    port: number;
    getLastBody: () => unknown;
    close: () => Promise<void>;
  }>((resolve) => {
    let lastBody: unknown = null;

    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      lastBody = await readBody(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      // Return a minimal response that gate-api can parse without throwing
      res.end(JSON.stringify(
        Array.isArray(lastBody)
          ? (lastBody as unknown[]).map(() => ({ id: '1', status: 'open', text: 'local_mcp' }))
          : { id: '1', status: 'open', text: 'local_mcp' }
      ));
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({
        port,
        getLastBody: () => lastBody,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

describe('order placement tools force text=local_mcp in request body', () => {
  let mock: Awaited<ReturnType<typeof startMockServer>>;
  let client: Client;

  beforeAll(async () => {
    mock = await startMockServer();
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

  test('cex_spot_create_spot_order: body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_spot_create_spot_order',
      arguments: { currency_pair: 'BTC_USDT', side: 'buy', amount: '0.001' },
    });
    const body = mock.getLastBody() as Record<string, unknown>;
    expect(body.text).toBe('local_mcp');
  });

  test('cex_spot_create_spot_batch_orders: every order body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_spot_create_spot_batch_orders',
      arguments: {
        orders: [
          { currency_pair: 'BTC_USDT', side: 'buy', amount: '0.001', price: '50000' },
          { currency_pair: 'ETH_USDT', side: 'sell', amount: '0.01', price: '3000' },
        ],
      },
    });
    const body = mock.getLastBody() as Record<string, unknown>[];
    expect(Array.isArray(body)).toBe(true);
    body.forEach(order => expect(order.text).toBe('local_mcp'));
  });

  test('cex_fx_create_fx_order: body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_fx_create_fx_order',
      arguments: { settle: 'usdt', contract: 'BTC_USDT', size: '1', price: '50000' },
    });
    const body = mock.getLastBody() as Record<string, unknown>;
    expect(body.text).toBe('local_mcp');
  });

  test('cex_fx_create_fx_batch_orders: every order body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_fx_create_fx_batch_orders',
      arguments: {
        settle: 'usdt',
        orders: [
          { contract: 'BTC_USDT', size: '1', price: '50000' },
          { contract: 'ETH_USDT', size: '2', price: '3000' },
        ],
      },
    });
    const body = mock.getLastBody() as Record<string, unknown>[];
    expect(Array.isArray(body)).toBe(true);
    body.forEach(order => expect(order.text).toBe('local_mcp'));
  });

  test('cex_fx_create_fx_bbo_order: body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_fx_create_fx_bbo_order',
      arguments: { settle: 'usdt', contract: 'BTC_USDT', size: 1, direction: 'long', level: 1 },
    });
    const body = mock.getLastBody() as Record<string, unknown>;
    expect(body.text).toBe('local_mcp');
  });

  test('cex_delivery_create_delivery_order: body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_delivery_create_delivery_order',
      arguments: { settle: 'usdt', contract: 'BTC_USDT_20241227', size: 1, price: '50000' },
    });
    const body = mock.getLastBody() as Record<string, unknown>;
    expect(body.text).toBe('local_mcp');
  });

  test('cex_options_create_options_order: body.text = local_mcp', async () => {
    await client.callTool({
      name: 'cex_options_create_options_order',
      arguments: { contract: 'BTC_USDT-20241227-50000-C', size: 1, price: '100' },
    });
    const body = mock.getLastBody() as Record<string, unknown>;
    expect(body.text).toBe('local_mcp');
  });
});
