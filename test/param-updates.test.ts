/**
 * Verify parameter schema updates for existing tools.
 *
 * These tests start the real MCP server and inspect inputSchema.properties
 * to confirm that new parameters were added to existing tools.
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
  const tool = tools.find(t => t.name === name);
  expect(tool, `Tool ${name} should exist`).toBeDefined();
  return tool!;
}

// ============================================================================
// Earn: cex_earn_list_dual_investment_plans — 6 new params
// ============================================================================
describe('cex_earn_list_dual_investment_plans parameter updates', () => {
  const expectedProps = ['coin', 'type', 'quote_currency', 'sort', 'page', 'page_size'];

  for (const prop of expectedProps) {
    test(`has property: ${prop}`, () => {
      const tool = requireTool('cex_earn_list_dual_investment_plans');
      const props = tool.inputSchema.properties ?? {};
      expect(props).toHaveProperty(prop);
    });
  }

  test('has all 6 new params', () => {
    const tool = requireTool('cex_earn_list_dual_investment_plans');
    const props = Object.keys(tool.inputSchema.properties ?? {});
    for (const prop of expectedProps) {
      expect(props).toContain(prop);
    }
  });
});

// ============================================================================
// Earn: cex_earn_list_dual_orders — 3 new params
// ============================================================================
describe('cex_earn_list_dual_orders parameter updates', () => {
  const expectedProps = ['type', 'status', 'coin'];

  for (const prop of expectedProps) {
    test(`has property: ${prop}`, () => {
      const tool = requireTool('cex_earn_list_dual_orders');
      const props = tool.inputSchema.properties ?? {};
      expect(props).toHaveProperty(prop);
    });
  }

  test('has all 3 new params', () => {
    const tool = requireTool('cex_earn_list_dual_orders');
    const props = Object.keys(tool.inputSchema.properties ?? {});
    for (const prop of expectedProps) {
      expect(props).toContain(prop);
    }
  });
});

// ============================================================================
// Wallet: cex_wallet_list_sa_balances — 2 new params
// ============================================================================
describe('cex_wallet_list_sa_balances parameter updates', () => {
  const expectedProps = ['page', 'limit'];

  for (const prop of expectedProps) {
    test(`has property: ${prop}`, () => {
      const tool = requireTool('cex_wallet_list_sa_balances');
      const props = tool.inputSchema.properties ?? {};
      expect(props).toHaveProperty(prop);
    });
  }

  test('has all 2 new params', () => {
    const tool = requireTool('cex_wallet_list_sa_balances');
    const props = Object.keys(tool.inputSchema.properties ?? {});
    for (const prop of expectedProps) {
      expect(props).toContain(prop);
    }
  });
});
