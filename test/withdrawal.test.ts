/**
 * E2E tests for the withdrawal tool module (3 tools).
 *
 * Verifies tool registration, description conventions, and auth guards.
 */
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

interface ToolInfo {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

let client: Client;
let tools: ToolInfo[];

beforeAll(async () => {
  client = await createTestClient();
  const result = await client.listTools();
  tools = result.tools as ToolInfo[];
});

afterAll(async () => {
  await client?.close();
});

function requireTool(name: string): ToolInfo {
  const tool = tools.find((t) => t.name === name);
  expect(tool, `Tool ${name} should exist`).toBeDefined();
  return tool!;
}

// ============================================================================
// Tool existence
// ============================================================================
describe('Withdrawal tools exist', () => {
  const allTools = [
    'cex_withdrawal_withdraw',
    'cex_withdrawal_withdraw_push_order',
    'cex_withdrawal_cancel_withdrawal',
  ];

  for (const name of allTools) {
    test(`${name} is registered`, () => {
      requireTool(name);
    });
  }
});

// ============================================================================
// Description convention
// ============================================================================
describe('Withdrawal tool descriptions contain "State-changing"', () => {
  const allTools = [
    'cex_withdrawal_withdraw',
    'cex_withdrawal_withdraw_push_order',
    'cex_withdrawal_cancel_withdrawal',
  ];

  for (const name of allTools) {
    test(`${name} description contains "State-changing"`, () => {
      const tool = requireTool(name);
      expect(tool.description).toContain('State-changing');
    });
  }
});

// ============================================================================
// Auth checks
// ============================================================================
describe('Withdrawal auth guards', () => {
  let noAuthClient: Client;

  beforeAll(async () => {
    noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
  });

  afterAll(async () => {
    await noAuthClient?.close();
  });

  test('cex_withdrawal_withdraw returns auth error without credentials', async () => {
    const result = await noAuthClient.callTool({
      name: 'cex_withdrawal_withdraw',
      arguments: { currency: 'USDT', amount: '1', chain: 'ETH' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('GATE_API_KEY');
  });

  test('cex_withdrawal_withdraw_push_order returns auth error without credentials', async () => {
    const result = await noAuthClient.callTool({
      name: 'cex_withdrawal_withdraw_push_order',
      arguments: { receive_uid: 123, currency: 'USDT', amount: '1' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('GATE_API_KEY');
  });

  test('cex_withdrawal_cancel_withdrawal returns auth error without credentials', async () => {
    const result = await noAuthClient.callTool({
      name: 'cex_withdrawal_cancel_withdrawal',
      arguments: { withdrawal_id: '123' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('GATE_API_KEY');
  });
});
