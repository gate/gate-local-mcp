/**
 * Verify that GATE_READONLY=true filters out new write tools
 * while keeping read-only tools accessible.
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
let toolNames: Set<string>;

beforeAll(async () => {
  client = await createTestClient({ GATE_READONLY: 'true' });
  const result = await client.listTools();
  tools = result.tools as ToolInfo[];
  toolNames = new Set(tools.map(t => t.name));
});

afterAll(async () => {
  await client?.close();
});

// ============================================================================
// Write tools must NOT be present in readonly mode
// ============================================================================
describe('assetswap write tools filtered', () => {
  test('cex_assetswap_create_asset_swap_order_v1 is NOT present', () => {
    expect(toolNames.has('cex_assetswap_create_asset_swap_order_v1')).toBe(false);
  });
});

describe('bot write tools filtered', () => {
  const botWriteTools = [
    'cex_bot_post_ai_hub_spot_grid_create',
    'cex_bot_post_ai_hub_margin_grid_create',
    'cex_bot_post_ai_hub_infinite_grid_create',
    'cex_bot_post_ai_hub_fx_grid_create',
    'cex_bot_post_ai_hub_spot_martingale_create',
    'cex_bot_post_ai_hub_contract_martingale_create',
    'cex_bot_post_ai_hub_portfolio_stop',
  ];

  for (const name of botWriteTools) {
    test(`${name} is NOT present`, () => {
      expect(toolNames.has(name)).toBe(false);
    });
  }
});

describe('withdrawal tools all filtered', () => {
  test('all 3 withdrawal tools are NOT present', () => {
    const withdrawalTools = tools.filter(t => t.name.startsWith('cex_withdrawal_'));
    expect(withdrawalTools.length).toBe(0);
  });
});

describe('launch write tools filtered', () => {
  const launchWriteTools = [
    'cex_launch_hodler_airdrop_order',
    'cex_launch_register_candy_drop_v4',
  ];

  for (const name of launchWriteTools) {
    test(`${name} is NOT present`, () => {
      expect(toolNames.has(name)).toBe(false);
    });
  }
});

describe('earn write tools filtered', () => {
  const earnWriteTools = [
    'cex_earn_place_dual_order_refund',
    'cex_earn_modify_dual_order_reinvest',
  ];

  for (const name of earnWriteTools) {
    test(`${name} is NOT present`, () => {
      expect(toolNames.has(name)).toBe(false);
    });
  }
});

// ============================================================================
// Read tools must still be present in readonly mode
// ============================================================================
describe('read-only tools remain accessible', () => {
  test('cex_assetswap_list_asset_swap_assets IS present', () => {
    expect(toolNames.has('cex_assetswap_list_asset_swap_assets')).toBe(true);
  });

  test('cex_bot_get_ai_hub_strategy_recommend IS present', () => {
    expect(toolNames.has('cex_bot_get_ai_hub_strategy_recommend')).toBe(true);
  });

  test('cex_earn_get_dual_project_recommend IS present', () => {
    expect(toolNames.has('cex_earn_get_dual_project_recommend')).toBe(true);
  });

  // Regression guard for CR-701: list_withdraw_status must NOT be filtered
  test('cex_wallet_list_withdraw_status IS present (not falsely filtered)', () => {
    expect(toolNames.has('cex_wallet_list_withdraw_status')).toBe(true);
  });
});
