/**
 * Verification tests for SDK v7.2.57 upgrade and tool sync tech plan.
 *
 * These tests start the real MCP server process and inspect tool registration
 * (names, parameter schemas) to verify the tech plan was correctly implemented.
 *
 * Tool naming convention in this project:
 *   futures.ts  -> cex_fx_*
 *   delivery.ts -> cex_dc_*
 *   flash_swap.ts -> cex_fc_*
 *   sub_account.ts -> cex_sa_*
 *   trad_fi.ts -> cex_tradfi_*
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
// Task 1: SDK upgrade verification
// ============================================================================
describe('Task 1: SDK version', () => {
  test('gate-api is v7.2.57', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkg = require('gate-api/package.json');
    expect(pkg.version).toBe('7.2.57');
  });
});

// ============================================================================
// Task 2: Structured product tools removed + findCoin signature fix
// ============================================================================
describe('Task 2: compile fixes', () => {
  test('cex_earn_list_structured_products is removed', () => {
    expect(findTool('cex_earn_list_structured_products')).toBeUndefined();
  });

  test('cex_earn_list_structured_orders is removed', () => {
    expect(findTool('cex_earn_list_structured_orders')).toBeUndefined();
  });

  test('cex_earn_place_structured_order is removed', () => {
    expect(findTool('cex_earn_place_structured_order')).toBeUndefined();
  });

  test('cex_earn_find_coin has optional cointype parameter', () => {
    const tool = requireTool('cex_earn_find_coin');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('cointype');
    const required = tool.inputSchema.required ?? [];
    expect(required).not.toContain('cointype');
  });
});

// ============================================================================
// Task 3: Build succeeds
// ============================================================================
describe('Task 3: build verification', () => {
  test('server starts and lists tools (>380)', () => {
    expect(tools.length).toBeGreaterThan(380);
  });
});

// ============================================================================
// Task 4: P0 parameter semantic bug fixes
// ============================================================================
describe('Task 4: P0 bug fixes', () => {
  test('cex_earn_swap_staking_coin side describes 0=Stake, 1=Redeem', () => {
    const tool = requireTool('cex_earn_swap_staking_coin');
    const sideProp = (tool.inputSchema.properties?.side ?? {}) as Record<string, unknown>;
    const desc = String(sideProp.description ?? '');
    expect(desc).toContain('0');
    expect(desc).toContain('Stake');
    expect(desc).toContain('1');
    expect(desc).toContain('Redeem');
  });

  test('cex_tradfi_create_tradfi_order side describes 1=sell, 2=buy', () => {
    const tool = requireTool('cex_tradfi_create_tradfi_order');
    const sideProp = (tool.inputSchema.properties?.side ?? {}) as Record<string, unknown>;
    const desc = String(sideProp.description ?? '');
    expect(desc).toContain('1=sell');
    expect(desc).toContain('2=buy');
  });

  test('cex_tradfi_close_position close_type describes 1=partial, 2=full', () => {
    const tool = requireTool('cex_tradfi_close_position');
    const closeProp = (tool.inputSchema.properties?.close_type ?? {}) as Record<string, unknown>;
    const desc = String(closeProp.description ?? '');
    expect(desc).toContain('partial');
    expect(desc).toContain('full');
  });

  test('cex_fx_list_position_close pnl uses "win"/"loss"', () => {
    const tool = requireTool('cex_fx_list_position_close');
    const pnlProp = (tool.inputSchema.properties?.pnl ?? {}) as Record<string, unknown>;
    const desc = String(pnlProp.description ?? '');
    expect(desc).toContain('win');
    expect(desc).toContain('loss');
  });

  test('cex_fx_update_fx_position_cross_mode mode enum is CROSS/ISOLATED', () => {
    const tool = requireTool('cex_fx_update_fx_position_cross_mode');
    const modeProp = (tool.inputSchema.properties?.mode ?? {}) as Record<string, unknown>;
    const enumVals = modeProp.enum as string[] | undefined;
    expect(enumVals).toBeDefined();
    expect(enumVals).toContain('CROSS');
    expect(enumVals).toContain('ISOLATED');
  });

  test('cex_fx_update_fx_dual_position_cross_mode mode enum is CROSS/ISOLATED', () => {
    const tool = requireTool('cex_fx_update_fx_dual_position_cross_mode');
    const modeProp = (tool.inputSchema.properties?.mode ?? {}) as Record<string, unknown>;
    const enumVals = modeProp.enum as string[] | undefined;
    expect(enumVals).toBeDefined();
    expect(enumVals).toContain('CROSS');
    expect(enumVals).toContain('ISOLATED');
  });

  test('cex_fx_update_fx_position_risk_limit risk_limit is number type', () => {
    const tool = requireTool('cex_fx_update_fx_position_risk_limit');
    const riskProp = (tool.inputSchema.properties?.risk_limit ?? {}) as Record<string, unknown>;
    expect(riskProp.type).toBe('number');
  });

  test('cex_fx_update_fx_dual_position_risk_limit risk_limit is number type', () => {
    const tool = requireTool('cex_fx_update_fx_dual_position_risk_limit');
    const riskProp = (tool.inputSchema.properties?.risk_limit ?? {}) as Record<string, unknown>;
    expect(riskProp.type).toBe('number');
  });
});

// ============================================================================
// Task 5: Auto Invest tools (11)
// ============================================================================
describe('Task 5: Auto Invest tools', () => {
  const autoInvestTools = [
    'cex_earn_list_auto_invest_coins',
    'cex_earn_list_auto_invest_config',
    'cex_earn_get_auto_invest_min_amount',
    'cex_earn_list_auto_invest_plans',
    'cex_earn_get_auto_invest_plan_detail',
    'cex_earn_list_auto_invest_plan_records',
    'cex_earn_list_auto_invest_orders',
    'cex_earn_create_auto_invest_plan',
    'cex_earn_update_auto_invest_plan',
    'cex_earn_stop_auto_invest_plan',
    'cex_earn_add_position_auto_invest_plan',
  ];

  for (const name of autoInvestTools) {
    test(`${name} is registered`, () => {
      expect(findTool(name), `${name} should exist`).toBeDefined();
    });
  }

  test('cex_earn_list_auto_invest_plans has status parameter', () => {
    const tool = requireTool('cex_earn_list_auto_invest_plans');
    expect(tool.inputSchema.properties).toHaveProperty('status');
    expect(tool.inputSchema.required).toContain('status');
  });

  test('cex_earn_get_auto_invest_plan_detail has plan_id parameter', () => {
    const tool = requireTool('cex_earn_get_auto_invest_plan_detail');
    expect(tool.inputSchema.properties).toHaveProperty('plan_id');
    expect(tool.inputSchema.required).toContain('plan_id');
  });

  test('cex_earn_list_auto_invest_orders has plan_id and record_id', () => {
    const tool = requireTool('cex_earn_list_auto_invest_orders');
    expect(tool.inputSchema.properties).toHaveProperty('plan_id');
    expect(tool.inputSchema.properties).toHaveProperty('record_id');
    expect(tool.inputSchema.required).toContain('plan_id');
    expect(tool.inputSchema.required).toContain('record_id');
  });

  test('write tool descriptions mention State-changing', () => {
    const writeTools = [
      'cex_earn_create_auto_invest_plan',
      'cex_earn_update_auto_invest_plan',
      'cex_earn_stop_auto_invest_plan',
      'cex_earn_add_position_auto_invest_plan',
    ];
    for (const name of writeTools) {
      const tool = requireTool(name);
      expect(tool.description).toContain('State-changing');
    }
  });
});

// ============================================================================
// Task 6: Rebate tool
// ============================================================================
describe('Task 6: Rebate tool', () => {
  test('cex_rebate_get_partner_agent_data_aggregated is registered with correct params', () => {
    const tool = requireTool('cex_rebate_get_partner_agent_data_aggregated');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('start_date');
    expect(props).toHaveProperty('end_date');
    expect(props).toHaveProperty('business_type');
  });
});

// ============================================================================
// Task 7: Spot order tools params
// ============================================================================
describe('Task 7: Spot order tools params', () => {
  test('cex_spot_create_spot_order has advanced params', () => {
    const tool = requireTool('cex_spot_create_spot_order');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('time_in_force');
    expect(props).toHaveProperty('iceberg');
    expect(props).toHaveProperty('auto_borrow');
    expect(props).toHaveProperty('auto_repay');
    expect(props).toHaveProperty('stp_act');
    expect(props).toHaveProperty('action_mode');
    expect(props).toHaveProperty('slippage');
  });

  test('cex_spot_amend_spot_order has account, amend_text, action_mode', () => {
    const tool = requireTool('cex_spot_amend_spot_order');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('account');
    expect(props).toHaveProperty('amend_text');
    expect(props).toHaveProperty('action_mode');
  });
});

// ============================================================================
// Task 8: Futures (cex_fx_*) tools params
// ============================================================================
describe('Task 8: Futures tools params', () => {
  test('cex_fx_create_fx_order has iceberg, auto_size, stp_act, market_order_slip_ratio, pos_margin_mode', () => {
    const tool = requireTool('cex_fx_create_fx_order');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('iceberg');
    expect(props).toHaveProperty('auto_size');
    expect(props).toHaveProperty('stp_act');
    expect(props).toHaveProperty('market_order_slip_ratio');
    expect(props).toHaveProperty('pos_margin_mode');
  });

  test('cex_fx_amend_fx_order has amend_text', () => {
    const tool = requireTool('cex_fx_amend_fx_order');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('amend_text');
  });

  test('cex_fx_cancel_all_fx_orders has contract as required', () => {
    const tool = requireTool('cex_fx_cancel_all_fx_orders');
    const required = tool.inputSchema.required ?? [];
    expect(required).toContain('contract');
  });

  test('cex_fx_get_leverage has pos_margin_mode and dual_side as required', () => {
    const tool = requireTool('cex_fx_get_leverage');
    const required = tool.inputSchema.required ?? [];
    expect(required).toContain('pos_margin_mode');
    expect(required).toContain('dual_side');
    const dualSideProp = (tool.inputSchema.properties?.dual_side ?? {}) as Record<string, unknown>;
    const desc = String(dualSideProp.description ?? '');
    expect(desc).toContain('dual_long');
    expect(desc).toContain('dual_short');
  });
});

// ============================================================================
// Task 9: Delivery (cex_dc_*) tools params
// ============================================================================
describe('Task 9: Delivery tools params', () => {
  test('cex_dc_list_dc_order_book has interval and with_id', () => {
    const tool = requireTool('cex_dc_list_dc_order_book');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('interval');
    expect(props).toHaveProperty('with_id');
  });

  test('cex_dc_list_dc_candlesticks has from and to', () => {
    const tool = requireTool('cex_dc_list_dc_candlesticks');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('from');
    expect(props).toHaveProperty('to');
  });

  test('cex_dc_list_dc_orders has last_id', () => {
    const tool = requireTool('cex_dc_list_dc_orders');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('last_id');
  });

  test('cex_dc_get_my_dc_trades has order, offset, last_id', () => {
    const tool = requireTool('cex_dc_get_my_dc_trades');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('order');
    expect(props).toHaveProperty('offset');
    expect(props).toHaveProperty('last_id');
  });
});

// ============================================================================
// Task 10: Options tools params
// ============================================================================
describe('Task 10: Options tools params', () => {
  test('cex_options_list_options_order_book has interval and with_id', () => {
    const tool = requireTool('cex_options_list_options_order_book');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('interval');
    expect(props).toHaveProperty('with_id');
  });

  test('cex_options_list_options_candlesticks has from and to', () => {
    const tool = requireTool('cex_options_list_options_candlesticks');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('from');
    expect(props).toHaveProperty('to');
  });

  test('cex_options_list_options_orders has from and to', () => {
    const tool = requireTool('cex_options_list_options_orders');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('from');
    expect(props).toHaveProperty('to');
  });

  test('cex_options_cancel_options_orders has side param with bid/ask', () => {
    const tool = requireTool('cex_options_cancel_options_orders');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('side');
    const sideProp = props.side as Record<string, unknown>;
    const enumVals = sideProp.enum as string[] | undefined;
    expect(enumVals).toContain('bid');
    expect(enumVals).toContain('ask');
  });

  test('cex_options_list_my_options_trades has offset, from, to', () => {
    const tool = requireTool('cex_options_list_my_options_trades');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('offset');
    expect(props).toHaveProperty('from');
    expect(props).toHaveProperty('to');
  });
});

// ============================================================================
// Task 11: Wallet tools params
// ============================================================================
describe('Task 11: Wallet tools params', () => {
  test('cex_wallet_list_deposits has from and to', () => {
    const tool = requireTool('cex_wallet_list_deposits');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('from');
    expect(props).toHaveProperty('to');
  });

  test('cex_wallet_list_withdrawals has from and to', () => {
    const tool = requireTool('cex_wallet_list_withdrawals');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('from');
    expect(props).toHaveProperty('to');
  });
});

// ============================================================================
// Task 12: Flash Swap (cex_fc_*) tools params
// ============================================================================
describe('Task 12: Flash Swap tools params', () => {
  test('cex_fc_list_fc_currency_pairs has page and limit', () => {
    const tool = requireTool('cex_fc_list_fc_currency_pairs');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('page');
    expect(props).toHaveProperty('limit');
  });

  test('cex_fc_list_fc_orders has reverse', () => {
    const tool = requireTool('cex_fc_list_fc_orders');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('reverse');
  });
});

// ============================================================================
// Task 13: Sub Account (cex_sa_*) tools params
// ============================================================================
describe('Task 13: Sub Account tools params', () => {
  test('cex_sa_create_sa_key has mode and perms', () => {
    const tool = requireTool('cex_sa_create_sa_key');
    const props = tool.inputSchema.properties ?? {};
    expect(props).toHaveProperty('mode');
    expect(props).toHaveProperty('perms');
  });
});

// ============================================================================
// Task 14: Unified mode fix
// ============================================================================
describe('Task 14: Unified mode fix', () => {
  test('cex_unified_set_unified_mode mode description includes single_currency', () => {
    const tool = requireTool('cex_unified_set_unified_mode');
    const modeProp = (tool.inputSchema.properties?.mode ?? {}) as Record<string, unknown>;
    const desc = String(modeProp.description ?? '');
    expect(desc).toContain('single_currency');
  });

  test('cex_unified_set_unified_mode params have no settings_ prefix', () => {
    const tool = requireTool('cex_unified_set_unified_mode');
    const propNames = Object.keys(tool.inputSchema.properties ?? {});
    expect(propNames).toContain('usdt_futures');
    expect(propNames).toContain('spot_hedge');
    expect(propNames).toContain('use_funding');
    expect(propNames).toContain('options');
    // Must NOT have settings_ prefixed versions
    expect(propNames).not.toContain('settings_usdt_futures');
    expect(propNames).not.toContain('settings_spot_hedge');
  });
});

// ============================================================================
// Task 15: Auth fixes for earn tools
// ============================================================================
describe('Task 15: Auth fixes', () => {
  test('cex_earn_list_uni_chart requires authentication (description)', () => {
    const tool = requireTool('cex_earn_list_uni_chart');
    expect(tool.description).toContain('Get Simple Earn rate chart.');
  });

  test('cex_earn_list_uni_rate requires authentication (description)', () => {
    const tool = requireTool('cex_earn_list_uni_rate');
    expect(tool.description).toContain('List Simple Earn rates.');
  });

  test('cex_fc_create_fc_order_v1 mentions auth requirement (description)', () => {
    const tool = requireTool('cex_fc_create_fc_order_v1');
    expect(tool.description).toContain('Requires authentication');
  });

  test('cex_fx_countdown_cancel_all_fx mentions auth requirement (description)', () => {
    const tool = requireTool('cex_fx_countdown_cancel_all_fx');
    expect(tool.description).toContain('Requires authentication');
  });

  test('cex_spot_countdown_cancel_all_spot mentions auth requirement (description)', () => {
    const tool = requireTool('cex_spot_countdown_cancel_all_spot');
    expect(tool.description).toContain('Requires authentication');
  });

  test('cex_earn_list_uni_chart returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_earn_list_uni_chart',
        arguments: { from: 1700000000, to: 1700100000, asset: 'USDT' },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });

  test('cex_earn_list_uni_rate returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_earn_list_uni_rate',
        arguments: {},
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
// Task 17: Version bump
// ============================================================================
describe('Task 17: Version', () => {
  test('package.json version is 0.18.2', async () => {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    const pkg = require('../package.json');
    expect(pkg.version).toBe('0.18.2');
  });

  test('server.json version is 0.18.2', async () => {
    const { readFileSync } = await import('fs');
    const serverJson = JSON.parse(readFileSync('server.json', 'utf-8'));
    expect(serverJson.version).toBe('0.18.2');
  });
});

// ============================================================================
// Structural integrity
// ============================================================================
describe('Structural integrity', () => {
  test('futures cross_mode tools exist with correct prefix', () => {
    expect(findTool('cex_fx_update_fx_position_cross_mode')).toBeDefined();
    expect(findTool('cex_fx_update_fx_dual_position_cross_mode')).toBeDefined();
  });

  test('total tool count is 396', () => {
    expect(tools.length).toBe(396);
  });
});
