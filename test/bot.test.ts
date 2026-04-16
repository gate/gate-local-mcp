/**
 * E2E tests for the bot tool module (10 tools).
 *
 * Verifies tool registration, description conventions, required params, and auth guards.
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
describe('Bot read tools exist', () => {
  const readTools = [
    'cex_bot_get_ai_hub_strategy_recommend',
    'cex_bot_get_ai_hub_portfolio_running',
    'cex_bot_get_ai_hub_portfolio_detail',
  ];

  for (const name of readTools) {
    test(`${name} is registered`, () => {
      requireTool(name);
    });
  }
});

// ============================================================================
// Tool existence: write tools
// ============================================================================
describe('Bot write tools exist', () => {
  const writeTools = [
    'cex_bot_post_ai_hub_spot_grid_create',
    'cex_bot_post_ai_hub_margin_grid_create',
    'cex_bot_post_ai_hub_infinite_grid_create',
    'cex_bot_post_ai_hub_fx_grid_create',
    'cex_bot_post_ai_hub_spot_martingale_create',
    'cex_bot_post_ai_hub_contract_martingale_create',
    'cex_bot_post_ai_hub_portfolio_stop',
  ];

  for (const name of writeTools) {
    test(`${name} is registered`, () => {
      requireTool(name);
    });
  }
});

// ============================================================================
// Write tool description convention
// ============================================================================
describe('Bot write tool descriptions contain "State-changing"', () => {
  const writeTools = [
    'cex_bot_post_ai_hub_spot_grid_create',
    'cex_bot_post_ai_hub_margin_grid_create',
    'cex_bot_post_ai_hub_infinite_grid_create',
    'cex_bot_post_ai_hub_fx_grid_create',
    'cex_bot_post_ai_hub_spot_martingale_create',
    'cex_bot_post_ai_hub_contract_martingale_create',
    'cex_bot_post_ai_hub_portfolio_stop',
  ];

  for (const name of writeTools) {
    test(`${name} description contains "State-changing"`, () => {
      const tool = requireTool(name);
      expect(tool.description).toContain('State-changing');
    });
  }
});

// ============================================================================
// Required params
// ============================================================================
describe('Bot tool required params', () => {
  test('cex_bot_get_ai_hub_portfolio_detail requires strategy_id and strategy_type', () => {
    const tool = requireTool('cex_bot_get_ai_hub_portfolio_detail');
    const required = tool.inputSchema.required ?? [];
    expect(required).toContain('strategy_id');
    expect(required).toContain('strategy_type');
  });
});

// ============================================================================
// Auth checks
// ============================================================================
describe('Bot auth guards', () => {
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

  test('cex_bot_post_ai_hub_spot_grid_create returns auth error without credentials', async () => {
    const result = await noAuthClient.callTool({
      name: 'cex_bot_post_ai_hub_spot_grid_create',
      arguments: { market: 'BTC_USDT', create_params: '{}' },
    });
    expect(result.isError).toBe(true);
    const text = (result.content[0] as { text: string }).text;
    expect(text).toContain('GATE_API_KEY');
  });
});
