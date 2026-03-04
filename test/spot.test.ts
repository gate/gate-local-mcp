import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const hasCredentials = Boolean(process.env.GATE_API_KEY && process.env.GATE_API_SECRET);

describe('spot tools', () => {
  let client: Client | null = null;

  beforeAll(async () => {
    client = await createTestClient();
  });

  afterAll(async () => {
    await client?.close();
  });

  test('list_tickers returns data for BTC_USDT', async () => {
    const result = await client.callTool({
      name: 'list_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('BTC_USDT');
  });

  test('list_currency_pairs returns a non-empty array', async () => {
    const result = await client.callTool({
      name: 'list_currency_pairs',
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { text: string }).text;
    const pairs = JSON.parse(text);
    expect(Array.isArray(pairs)).toBe(true);
    expect(pairs.length).toBeGreaterThan(0);
  });

  test('list_order_book returns asks and bids for BTC_USDT', async () => {
    const result = await client.callTool({
      name: 'list_order_book',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('asks');
    expect(text).toContain('bids');
  });

  test('list_spot_accounts returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'list_spot_accounts',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });

  test.skipIf(!hasCredentials)('list_spot_accounts returns data with credentials', async () => {
    const result = await client.callTool({
      name: 'list_spot_accounts',
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    expect(result.content.length).toBeGreaterThan(0);
  });
});
