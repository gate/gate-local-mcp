/**
 * Verify upgrade tool registration completeness.
 *
 * Ensures the total tool count, per-module counts by prefix, and every
 * individual new tool name are correctly registered after the upgrade.
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

function toolsByPrefix(prefix: string): ToolInfo[] {
  return tools.filter(t => t.name.startsWith(prefix));
}

// ============================================================================
// Total tool count
// ============================================================================
describe('Total tool count', () => {
  test('total registered tools = 428', () => {
    expect(tools.length).toBe(428);
  });
});

// ============================================================================
// Per-module tool counts by prefix
// ============================================================================
describe('Module tool counts', () => {
  test('assetswap module: 7 tools (cex_assetswap_)', () => {
    expect(toolsByPrefix('cex_assetswap_').length).toBe(7);
  });

  test('bot module: 10 tools (cex_bot_)', () => {
    expect(toolsByPrefix('cex_bot_').length).toBe(10);
  });

  test('withdrawal module: 3 tools (cex_withdrawal_)', () => {
    expect(toolsByPrefix('cex_withdrawal_').length).toBe(3);
  });

  test('launch module: 15 tools (cex_launch_)', () => {
    expect(toolsByPrefix('cex_launch_').length).toBe(15);
  });

  test('earn module: 41 tools (cex_earn_)', () => {
    expect(toolsByPrefix('cex_earn_').length).toBe(41);
  });

  test('welfare module: 0 tools (no cex_welfare_ prefix)', () => {
    expect(toolsByPrefix('cex_welfare_').length).toBe(0);
  });
});

// ============================================================================
// Individual new tool names existence
// ============================================================================
describe('New assetswap tools (7)', () => {
  const names = [
    'cex_assetswap_list_asset_swap_assets',
    'cex_assetswap_get_asset_swap_config',
    'cex_assetswap_evaluate_asset_swap',
    'cex_assetswap_create_asset_swap_order_v1',
    'cex_assetswap_list_asset_swap_orders_v1',
    'cex_assetswap_preview_asset_swap_order_v1',
    'cex_assetswap_get_asset_swap_order_v1',
  ];

  for (const name of names) {
    test(`${name} is registered`, () => {
      expect(tools.find(t => t.name === name), `${name} should exist`).toBeDefined();
    });
  }
});

describe('New bot tools (10)', () => {
  // Note: futures_grid_create is sanitized to fx_grid_create by NAME_ABBREVIATIONS
  const names = [
    'cex_bot_get_ai_hub_strategy_recommend',
    'cex_bot_post_ai_hub_spot_grid_create',
    'cex_bot_post_ai_hub_margin_grid_create',
    'cex_bot_post_ai_hub_infinite_grid_create',
    'cex_bot_post_ai_hub_fx_grid_create',
    'cex_bot_post_ai_hub_spot_martingale_create',
    'cex_bot_post_ai_hub_contract_martingale_create',
    'cex_bot_get_ai_hub_portfolio_running',
    'cex_bot_get_ai_hub_portfolio_detail',
    'cex_bot_post_ai_hub_portfolio_stop',
  ];

  for (const name of names) {
    test(`${name} is registered`, () => {
      expect(tools.find(t => t.name === name), `${name} should exist`).toBeDefined();
    });
  }
});

describe('New withdrawal tools (3)', () => {
  const names = [
    'cex_withdrawal_withdraw',
    'cex_withdrawal_withdraw_push_order',
    'cex_withdrawal_cancel_withdrawal',
  ];

  for (const name of names) {
    test(`${name} is registered`, () => {
      expect(tools.find(t => t.name === name), `${name} should exist`).toBeDefined();
    });
  }
});

describe('New launch tools (10 new)', () => {
  const names = [
    'cex_launch_get_hodler_airdrop_project_list',
    'cex_launch_hodler_airdrop_order',
    'cex_launch_get_hodler_airdrop_user_order_records',
    'cex_launch_get_hodler_airdrop_user_airdrop_records',
    'cex_launch_get_candy_drop_activity_list_v4',
    'cex_launch_register_candy_drop_v4',
    'cex_launch_get_candy_drop_activity_rules_v4',
    'cex_launch_get_candy_drop_task_progress_v4',
    'cex_launch_get_candy_drop_participation_records_v4',
    'cex_launch_get_candy_drop_airdrop_records_v4',
  ];

  for (const name of names) {
    test(`${name} is registered`, () => {
      expect(tools.find(t => t.name === name), `${name} should exist`).toBeDefined();
    });
  }
});

describe('New earn tools (4 dual enhancements)', () => {
  const names = [
    'cex_earn_get_dual_order_refund_preview',
    'cex_earn_place_dual_order_refund',
    'cex_earn_modify_dual_order_reinvest',
    'cex_earn_get_dual_project_recommend',
  ];

  for (const name of names) {
    test(`${name} is registered`, () => {
      expect(tools.find(t => t.name === name), `${name} should exist`).toBeDefined();
    });
  }
});
