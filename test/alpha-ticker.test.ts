/**
 * Validates that cex_alpha_list_alpha_tickers returns the actual API fields
 * (currency, last, change_percentage, base_volume, etc.) instead of empty
 * objects {}.
 *
 * Root cause: gate-api SDK declares listAlphaTickers response type as
 * Array<Ticker2>, but Ticker2 is designed for a completely different response
 * structure. ObjectSerializer discards all real fields since none match the
 * Ticker2 model attribute map, producing [{}] instead of the real data.
 *
 * Fix: use response.data (raw axios response) instead of body (SDK-deserialized).
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const ACTUAL_API_RESPONSE = [
  {
    currency: 'memeboxtrump',
    last: '0.0001',
    change: '5.2',
    volume: '1000000',
    market_cap: '100',
  },
  {
    currency: 'testcoin',
    last: '1.23',
    change: '-2.1',
    volume: '500000',
    market_cap: '615000',
  },
];

function startMockServer() {
  return new Promise<{
    port: number;
    close: () => Promise<void>;
  }>((resolve) => {
    const server = createServer((_req: IncomingMessage, res: ServerResponse) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(ACTUAL_API_RESPONSE));
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({
        port,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}

describe('cex_alpha_list_alpha_tickers — SDK model mismatch', () => {
  let mock: Awaited<ReturnType<typeof startMockServer>>;
  let client: Client;

  beforeAll(async () => {
    mock = await startMockServer();
    client = await createTestClient({
      GATE_BASE_URL: `http://127.0.0.1:${mock.port}`,
    });
  });

  afterAll(async () => {
    await (client as any)?.close?.();
    await mock.close();
  });

  test('response contains actual API fields, not empty objects', async () => {
    const result = await client.callTool({
      name: 'cex_alpha_list_alpha_tickers',
      arguments: {},
    });

    const text = (result.content as Array<{ type: string; text: string }>)
      .find((c) => c.type === 'text')?.text ?? '';

    // Must contain real field names from the actual API response
    expect(text).toContain('currency');
    expect(text).toContain('memeboxtrump');
    expect(text).toContain('change');
    expect(text).toContain('volume');
    expect(text).toContain('marketCap');
  });

  test('response is not empty objects due to wrong SDK model', async () => {
    const result = await client.callTool({
      name: 'cex_alpha_list_alpha_tickers',
      arguments: {},
    });

    const text = (result.content as Array<{ type: string; text: string }>)
      .find((c) => c.type === 'text')?.text ?? '';

    // If Ticker2 deserialization was used, all fields would be lost → [{}]
    // The response must not be a list of empty objects
    expect(text).not.toBe('[{}]');
    expect(text).not.toMatch(/^\[\{\},\s*\{\}\]$/);
    expect(text).not.toContain('"label"');         // Ticker2 field — should not appear
    expect(text).not.toContain('"highest_price"'); // Ticker2 field — should not appear
  });

  test('all returned items have the expected ticker fields', async () => {
    const result = await client.callTool({
      name: 'cex_alpha_list_alpha_tickers',
      arguments: {},
    });

    const text = (result.content as Array<{ type: string; text: string }>)
      .find((c) => c.type === 'text')?.text ?? '';

    const parsed = JSON.parse(text);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);

    for (const ticker of parsed) {
      expect(ticker).toHaveProperty('currency');
      expect(ticker).toHaveProperty('last');
      expect(ticker).toHaveProperty('change');
      expect(ticker).toHaveProperty('volume');
      expect(ticker).toHaveProperty('marketCap');
    }
  });
});
