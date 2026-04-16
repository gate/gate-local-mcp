/**
 * E2E tests for new launch tools: Hodler Airdrop (4) + CandyDrop (6).
 *
 * Hodler Airdrop tools:
 *   cex_launch_get_hodler_airdrop_project_list
 *   cex_launch_hodler_airdrop_order
 *   cex_launch_get_hodler_airdrop_user_order_records
 *   cex_launch_get_hodler_airdrop_user_airdrop_records
 *
 * CandyDrop tools:
 *   cex_launch_get_candy_drop_activity_list_v4
 *   cex_launch_register_candy_drop_v4
 *   cex_launch_get_candy_drop_activity_rules_v4
 *   cex_launch_get_candy_drop_task_progress_v4
 *   cex_launch_get_candy_drop_participation_records_v4
 *   cex_launch_get_candy_drop_airdrop_records_v4
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
  return tools.find(t => t.name === name);
}

function requireTool(name: string): ToolInfo {
  const tool = findTool(name);
  expect(tool, `Tool ${name} should exist`).toBeDefined();
  return tool!;
}

// ============================================================================
// Hodler Airdrop: tool existence
// ============================================================================
describe('Hodler Airdrop tools exist', () => {
  const hodlerTools = [
    'cex_launch_get_hodler_airdrop_project_list',
    'cex_launch_hodler_airdrop_order',
    'cex_launch_get_hodler_airdrop_user_order_records',
    'cex_launch_get_hodler_airdrop_user_airdrop_records',
  ];

  for (const name of hodlerTools) {
    test(`${name} is registered`, () => {
      expect(findTool(name), `${name} should exist`).toBeDefined();
    });
  }
});

// ============================================================================
// Hodler Airdrop: write tool description
// ============================================================================
describe('Hodler Airdrop write tools are marked State-changing', () => {
  test('cex_launch_hodler_airdrop_order description contains State-changing', () => {
    const tool = requireTool('cex_launch_hodler_airdrop_order');
    expect(tool.description).toContain('State-changing');
  });
});

// ============================================================================
// Hodler Airdrop: auth error check
// ============================================================================
describe('Hodler Airdrop auth errors', () => {
  test('cex_launch_hodler_airdrop_order returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_launch_hodler_airdrop_order',
        arguments: { hodler_id: 1 },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });
});

// ============================================================================
// CandyDrop: tool existence
// ============================================================================
describe('CandyDrop tools exist', () => {
  const candyDropTools = [
    'cex_launch_get_candy_drop_activity_list_v4',
    'cex_launch_register_candy_drop_v4',
    'cex_launch_get_candy_drop_activity_rules_v4',
    'cex_launch_get_candy_drop_task_progress_v4',
    'cex_launch_get_candy_drop_participation_records_v4',
    'cex_launch_get_candy_drop_airdrop_records_v4',
  ];

  for (const name of candyDropTools) {
    test(`${name} is registered`, () => {
      expect(findTool(name), `${name} should exist`).toBeDefined();
    });
  }
});

// ============================================================================
// CandyDrop: write tool description
// ============================================================================
describe('CandyDrop write tools are marked State-changing', () => {
  test('cex_launch_register_candy_drop_v4 description contains State-changing', () => {
    const tool = requireTool('cex_launch_register_candy_drop_v4');
    expect(tool.description).toContain('State-changing');
  });
});

// ============================================================================
// CandyDrop: auth error check
// ============================================================================
describe('CandyDrop auth errors', () => {
  test('cex_launch_register_candy_drop_v4 returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_launch_register_candy_drop_v4',
        arguments: { currency: 'BTC' },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });
});
