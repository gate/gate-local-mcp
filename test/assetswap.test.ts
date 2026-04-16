/**
 * E2E tests for the assetswap tool module (7 tools).
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

function findTool(name: string): ToolInfo | undefined {
  return tools.find((t) => t.name === name);
}

function requireTool(name: string): ToolInfo {
  const tool = findTool(name);
  expect(tool, `Tool ${name} should exist`).toBeDefined();
  return tool!;
}

// ============================================================================
// Tool existence: read tools
// ============================================================================
describe('Assetswap read tools exist', () => {
  const readTools = [
    'cex_assetswap_list_asset_swap_assets',
    'cex_assetswap_get_asset_swap_config',
    'cex_assetswap_evaluate_asset_swap',
    'cex_assetswap_list_asset_swap_orders_v1',
    'cex_assetswap_preview_asset_swap_order_v1',
    'cex_assetswap_get_asset_swap_order_v1',
  ];

  for (const name of readTools) {
    test(`${name} is registered`, () => {
      requireTool(name);
    });
  }
});

// ============================================================================
// Tool existence: write tool
// ============================================================================
describe('Assetswap write tool exists', () => {
  test('cex_assetswap_create_asset_swap_order_v1 is registered', () => {
    requireTool('cex_assetswap_create_asset_swap_order_v1');
  });
});

// ============================================================================
// Write tool description convention
// ============================================================================
describe('Assetswap write tool description', () => {
  test('cex_assetswap_create_asset_swap_order_v1 description contains "State-changing"', () => {
    const tool = requireTool('cex_assetswap_create_asset_swap_order_v1');
    expect(tool.description).toContain('State-changing');
  });
});

// ============================================================================
// Auth checks
// ============================================================================
describe('Assetswap auth guards', () => {
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

  test('cex_assetswap_evaluate_asset_swap returns auth error without credentials', async () => {
    const result = await noAuthClient.callTool({
      name: 'cex_assetswap_evaluate_asset_swap',
      arguments: {},
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('GATE_API_KEY');
  });

  test('cex_assetswap_create_asset_swap_order_v1 returns auth error without credentials', async () => {
    const result = await noAuthClient.callTool({
      name: 'cex_assetswap_create_asset_swap_order_v1',
      arguments: {
        from: [{ asset: 'USDT', amount: '10' }],
        to: [{ asset: 'BTC', amount: '0.0001' }],
      },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('GATE_API_KEY');
  });
});
