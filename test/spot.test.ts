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

  test('cex_spot_get_spot_tickers returns data for BTC_USDT', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_tickers',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('BTC_USDT');
  });

  test('cex_spot_list_currency_pairs returns a non-empty array', async () => {
    const result = await client.callTool({
      name: 'cex_spot_list_currency_pairs',
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { text: string }).text;
    const pairs = JSON.parse(text);
    expect(Array.isArray(pairs)).toBe(true);
    expect(pairs.length).toBeGreaterThan(0);
  });

  test('cex_spot_get_spot_order_book returns asks and bids for BTC_USDT', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_order_book',
      arguments: { currency_pair: 'BTC_USDT' },
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('asks');
    expect(text).toContain('bids');
  });

  test('cex_spot_get_spot_accounts returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_spot_get_spot_accounts',
        arguments: {},
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });

  test.skipIf(!hasCredentials)('cex_spot_get_spot_accounts returns data with credentials', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_accounts',
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    expect(result.content.length).toBeGreaterThan(0);
  });

  // ── AC-9 ~ AC-12: e2e pagination tests ──────────────────────────────────

  test.skipIf(!hasCredentials)('AC-9: default pagination returns accounts + pagination structure', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_accounts',
      arguments: {},
    });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data).toHaveProperty('accounts');
    expect(Array.isArray(data.accounts)).toBe(true);
    expect(data).toHaveProperty('pagination');
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('total_pages');
    expect(data.pagination.page).toBe(1);
    expect(data.pagination.limit).toBe(10);
  });

  test.skipIf(!hasCredentials)('AC-10: currency specified returns accounts without pagination', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_accounts',
      arguments: { currency: 'USDT' },
    });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data).toHaveProperty('accounts');
    expect(data).not.toHaveProperty('pagination');
  });

  test.skipIf(!hasCredentials)('AC-11: custom limit=5 returns at most 5 accounts', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_accounts',
      arguments: { page: 1, limit: 5 },
    });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.pagination.limit).toBe(5);
    expect(data.accounts.length).toBeLessThanOrEqual(5);
  });

  test.skipIf(!hasCredentials)('AC-12: limit=2000 is capped to 1000', async () => {
    const result = await client.callTool({
      name: 'cex_spot_get_spot_accounts',
      arguments: { limit: 2000 },
    });
    expect(result.isError).toBeFalsy();
    const data = JSON.parse((result.content[0] as { text: string }).text);
    expect(data.pagination.limit).toBe(1000);
  });
});
