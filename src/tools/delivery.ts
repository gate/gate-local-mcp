import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeliveryApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent, ORDER_SOURCE_TEXT } from '../utils.js';

// Delivery (expiring futures) only supports 'usdt' settlement
const settleSchema = z.literal('usdt').describe('Settlement currency (only usdt supported)');

export function registerDeliveryTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool(
    'cex_delivery_list_delivery_contracts',
    'List all delivery (expiring futures) contracts',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        const { body } = await new DeliveryApi(createClient()).listDeliveryContracts(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_delivery_contract',
    'Get a single delivery contract',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
    },
    async ({ settle, contract }) => {
      try {
        const { body } = await new DeliveryApi(createClient()).getDeliveryContract(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_order_book',
    'Get delivery contract order book',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).listDeliveryOrderBook(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_candlesticks',
    'Get delivery contract candlestick data',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      interval: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '8h', '1d']).optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, interval, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).listDeliveryCandlesticks(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_tickers',
    'Get delivery contract tickers',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
    },
    async ({ settle, contract }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        const { body } = await new DeliveryApi(createClient()).listDeliveryTickers(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'cex_delivery_list_delivery_accounts',
    'Get delivery account balance (requires authentication)',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).listDeliveryAccounts(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_positions',
    'List delivery positions (requires authentication)',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).listDeliveryPositions(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_orders',
    'List delivery orders (requires authentication)',
    {
      settle: settleSchema,
      status: z.enum(['open', 'finished']),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, status, contract, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new DeliveryApi(createClient()).listDeliveryOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_create_delivery_order',
    'Create a delivery order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      size: z.number().int().describe('Order size (negative = short)'),
      price: z.string().describe('Order price'),
      tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional(),
      reduce_only: z.boolean().optional(),
      close: z.boolean().optional(),
    },
    async ({ settle, contract, size, price, tif, reduce_only, close }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = { contract, size, price };
        if (tif) order.tif = tif;
        if (reduce_only !== undefined) order.reduceOnly = reduce_only;
        if (close !== undefined) order.close = close;
        order.text = ORDER_SOURCE_TEXT;
        const { body } = await new DeliveryApi(createClient()).createDeliveryOrder(settle, order as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_cancel_delivery_order',
    'Cancel a delivery order (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).cancelDeliveryOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_my_delivery_trades',
    'Get personal delivery trading history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).getMyDeliveryTrades(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_trades',
    'List delivery contract public trade history',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      limit: z.number().int().optional().describe('Max results'),
      last_id: z.string().optional().describe('Pagination cursor'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
    },
    async ({ settle, contract, limit, last_id, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (last_id !== undefined) opts.lastId = last_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new DeliveryApi(createClient()).listDeliveryTrades(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_insurance_ledger',
    'Get delivery insurance fund history',
    {
      settle: settleSchema,
      limit: z.number().int().optional().describe('Max results'),
    },
    async ({ settle, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).listDeliveryInsuranceLedger(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_risk_limit_tiers',
    'List delivery contract risk limit tiers',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Contract name'),
      limit: z.number().int().optional().describe('Max results'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ settle, contract, limit, offset }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract !== undefined) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new DeliveryApi(createClient()).listDeliveryRiskLimitTiers(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_account_book',
    'Get delivery account book / fund flow records (requires authentication)',
    {
      settle: settleSchema,
      limit: z.number().int().optional().describe('Max results'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      type: z.enum(['dnw', 'pnl', 'fee', 'refr', 'fund', 'point_dnw', 'point_fee', 'point_refr']).optional().describe('Filter by record type'),
    },
    async ({ settle, limit, from, to, type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (type !== undefined) opts.type = type;
        const { body } = await new DeliveryApi(createClient()).listDeliveryAccountBook(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_delivery_position',
    'Get a single delivery position (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).getDeliveryPosition(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_update_delivery_position_margin',
    'Update delivery position margin (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      change: z.string().describe('Margin change amount (positive to add, negative to reduce)'),
    },
    async ({ settle, contract, change }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).updateDeliveryPositionMargin(settle, contract, change);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_update_delivery_position_leverage',
    'Update delivery position leverage (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      leverage: z.string().describe('New leverage value'),
    },
    async ({ settle, contract, leverage }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).updateDeliveryPositionLeverage(settle, contract, leverage);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_update_delivery_position_risk_limit',
    'Update delivery position risk limit (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      risk_limit: z.string().describe('New risk limit value'),
    },
    async ({ settle, contract, risk_limit }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).updateDeliveryPositionRiskLimit(settle, contract, risk_limit);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_cancel_delivery_orders',
    'Cancel all open delivery orders for a contract (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      side: z.enum(['ask', 'bid']).optional().describe('Cancel only ask or bid side'),
    },
    async ({ settle, contract, side }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (side !== undefined) opts.side = side;
        const { body } = await new DeliveryApi(createClient()).cancelDeliveryOrders(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_delivery_order',
    'Get a single delivery order (requires authentication)',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).getDeliveryOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_position_close',
    'List delivery position close history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      limit: z.number().int().optional().describe('Max results'),
    },
    async ({ settle, contract, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract !== undefined) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).listDeliveryPositionClose(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_liquidates',
    'List delivery liquidation history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      limit: z.number().int().optional().describe('Max results'),
      at: z.number().int().optional().describe('Specify a particular time point'),
    },
    async ({ settle, contract, limit, at }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract !== undefined) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (at !== undefined) opts.at = at;
        const { body } = await new DeliveryApi(createClient()).listDeliveryLiquidates(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_settlements',
    'List delivery settlement history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      limit: z.number().int().optional().describe('Max results'),
      at: z.number().int().optional().describe('Specify a particular time point'),
    },
    async ({ settle, contract, limit, at }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract !== undefined) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (at !== undefined) opts.at = at;
        const { body } = await new DeliveryApi(createClient()).listDeliverySettlements(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_price_triggered_delivery_orders',
    'List delivery price-triggered orders (requires authentication)',
    {
      settle: settleSchema,
      status: z.enum(['open', 'finished']).describe('Order status filter'),
      contract: z.string().optional().describe('Filter by contract'),
      limit: z.number().int().optional().describe('Max results'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ settle, status, contract, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract !== undefined) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new DeliveryApi(createClient()).listPriceTriggeredDeliveryOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_create_price_triggered_delivery_order',
    'Create a delivery price-triggered order (requires authentication) — always confirm details with the user before calling',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      trigger_price: z.string().describe('Price that activates the order'),
      trigger_rule: z.enum(['>=', '<=']).describe('>= fires when price rises; <= fires when it drops'),
      trigger_expiration: z.number().int().optional().describe('Trigger expiration in seconds'),
      order_size: z.number().describe('Order size (negative = short)'),
      order_price: z.string().describe('Execution price; "0" for market'),
      order_tif: z.enum(['gtc', 'ioc']).optional(),
      order_reduce_only: z.boolean().optional(),
      order_close: z.boolean().optional(),
    },
    async ({ settle, contract, trigger_price, trigger_rule, trigger_expiration,
             order_size, order_price, order_tif, order_reduce_only, order_close }) => {
      try {
        requireAuth();
        const trigger: Record<string, unknown> = { price: trigger_price, rule: trigger_rule === '>=' ? 1 : 2 };
        if (trigger_expiration !== undefined) trigger.expiration = trigger_expiration;
        const initial: Record<string, unknown> = { contract, size: order_size, price: order_price };
        initial.tif = order_tif ?? 'gtc';
        if (order_reduce_only !== undefined) initial.reduceOnly = order_reduce_only;
        if (order_close !== undefined) initial.close = order_close;
        const { body } = await new DeliveryApi(createClient()).createPriceTriggeredDeliveryOrder(settle, { initial, trigger } as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_cancel_price_triggered_delivery_order_list',
    'Cancel all delivery price-triggered orders for a contract (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).cancelPriceTriggeredDeliveryOrderList(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_price_triggered_delivery_order',
    'Get a single delivery price-triggered order (requires authentication)',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).getPriceTriggeredDeliveryOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_cancel_price_triggered_delivery_order',
    'Cancel a single delivery price-triggered order (requires authentication)',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).cancelPriceTriggeredDeliveryOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
