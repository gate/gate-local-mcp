import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

const hasCredentials = Boolean(process.env.GATE_API_KEY && process.env.GATE_API_SECRET);

describe('futures tools', () => {
  let client: Client | null = null;

  beforeAll(async () => {
    client = await createTestClient();
  });

  afterAll(async () => {
    await client?.close();
  });

  test('list_futures_contracts returns a non-empty array for usdt', async () => {
    const result = await client.callTool({
      name: 'list_futures_contracts',
      arguments: { settle: 'usdt' },
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { text: string }).text;
    const contracts = JSON.parse(text);
    expect(Array.isArray(contracts)).toBe(true);
    expect(contracts.length).toBeGreaterThan(0);
  });

  test('list_futures_tickers returns ticker data for BTC_USDT', async () => {
    const result = await client.callTool({
      name: 'list_futures_tickers',
      arguments: { settle: 'usdt', contract: 'BTC_USDT' },
    });
    expect(result.isError).toBeFalsy();
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('BTC_USDT');
  });

  test('list_futures_accounts returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'list_futures_accounts',
        arguments: { settle: 'usdt' },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });

  test.skipIf(!hasCredentials)('list_futures_accounts returns data with credentials', async () => {
    const result = await client.callTool({
      name: 'list_futures_accounts',
      arguments: { settle: 'usdt' },
    });
    expect(result.isError).toBeFalsy();
    expect(result.content.length).toBeGreaterThan(0);
  });
});
