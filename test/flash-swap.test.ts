import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

describe('flash swap tools', () => {
  let client: Client | null = null;

  beforeAll(async () => {
    client = await createTestClient();
  });

  afterAll(async () => {
    await client?.close();
  });

  test('cex_fc_preview_fc_order_v1 returns response for valid input', async () => {
    const result = await client!.callTool({
      name: 'cex_fc_preview_fc_order_v1',
      arguments: { sell_asset: 'BTC', buy_asset: 'USDT', sell_amount: '0.001' },
    });
    // Tool should return a response (may be a quote or an API error depending on env)
    expect(result.content).toBeDefined();
    expect(Array.isArray(result.content)).toBe(true);
    expect(result.content.length).toBeGreaterThan(0);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toBeTruthy();
  });

  test('cex_fc_preview_fc_order_v1 rejects when both amounts missing', async () => {
    const result = await client!.callTool({
      name: 'cex_fc_preview_fc_order_v1',
      arguments: { sell_asset: 'BTC', buy_asset: 'USDT' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('Either sell_amount or buy_amount must be provided');
  });

  test('cex_fc_create_fc_order rejects expired preview_id', async () => {
    const result = await client!.callTool({
      name: 'cex_fc_create_fc_order',
      arguments: {
        preview_id: 'expired_test_id',
        sell_currency: 'BTC',
        sell_amount: '0.001',
        buy_currency: 'USDT',
        buy_amount: '100',
      },
    });
    // API should return error for invalid/expired preview_id
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toBeTruthy();
  });

  test('cex_fc_create_fc_order requires authentication', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_fc_create_fc_order',
        arguments: {
          preview_id: 'test',
          sell_currency: 'BTC',
          sell_amount: '0.001',
          buy_currency: 'USDT',
          buy_amount: '100',
        },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('authentication');
    } finally {
      await noAuthClient.close();
    }
  });
});
