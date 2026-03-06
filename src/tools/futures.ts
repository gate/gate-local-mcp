import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FuturesApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

const settleSchema = z.enum(['btc', 'usdt']).describe('Settlement currency: btc or usdt');

export function registerFuturesTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool(
    'list_futures_contracts',
    'List all perpetual futures contracts',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        const { body } = await new FuturesApi(createClient()).listFuturesContracts(settle, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_futures_contract',
    'Get details of a single futures contract',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
    },
    async ({ settle, contract }) => {
      try {
        const { body } = await new FuturesApi(createClient()).getFuturesContract(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_futures_order_book',
    'Get futures order book',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listFuturesOrderBook(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_futures_candlesticks',
    'Get futures candlestick/OHLCV data',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      interval: z.enum(['10s', '1m', '5m', '15m', '30m', '1h', '4h', '8h', '1d', '7d']).optional(),
      limit: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
    },
    async ({ settle, contract, interval, limit, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new FuturesApi(createClient()).listFuturesCandlesticks(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_futures_tickers',
    'Get ticker information for futures contracts',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract name'),
    },
    async ({ settle, contract }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        const { body } = await new FuturesApi(createClient()).listFuturesTickers(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_futures_funding_rate_history',
    'Get funding rate history for a futures contract',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listFuturesFundingRateHistory(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'list_futures_accounts',
    'Get futures account balances (requires authentication)',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).listFuturesAccounts(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_positions',
    'List all open futures positions (requires authentication)',
    {
      settle: settleSchema,
      holding: z.boolean().optional().describe('Only return positions with non-zero size'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, holding, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (holding !== undefined) opts.holding = holding;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).listPositions(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_position',
    'Get a single futures position (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getPosition(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_futures_orders',
    'List futures orders (requires authentication)',
    {
      settle: settleSchema,
      status: z.enum(['open', 'finished']).describe('Order status'),
      contract: z.string().optional().describe('Filter by contract'),
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
        const { body } = await new FuturesApi(createClient()).listFuturesOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_futures_order',
    'Create a futures order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      size: z.string().describe('Order size in contracts (negative = short)'),
      price: z.string().describe('Order price (0 for market orders)'),
      tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional().describe('Time in force'),
      reduce_only: z.boolean().optional().describe('Reduce-only order'),
      close: z.boolean().optional().describe('Close position'),
      text: z.string().optional().describe('Custom reference text'),
    },
    async ({ settle, contract, size, price, tif, reduce_only, close, text }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = { contract, size, price };
        if (tif) order.tif = tif;
        if (reduce_only !== undefined) order.reduceOnly = reduce_only;
        if (close !== undefined) order.close = close;
        if (text) order.text = text;
        const { body } = await new FuturesApi(createClient()).createFuturesOrder(settle, order as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_futures_order',
    'Get a futures order by ID (requires authentication)',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getFuturesOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_futures_order',
    'Cancel a futures order (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).cancelFuturesOrder(settle, order_id, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'amend_futures_order',
    'Amend an open futures order (requires authentication) — always confirm the new values with the user before calling this tool',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
      size: z.string().optional().describe('New order size'),
      price: z.string().optional().describe('New order price'),
    },
    async ({ settle, order_id, size, price }) => {
      try {
        requireAuth();
        const amendment: Record<string, unknown> = {};
        if (size !== undefined) amendment.size = size;
        if (price) amendment.price = price;
        const { body } = await new FuturesApi(createClient()).amendFuturesOrder(settle, order_id, amendment as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_my_futures_trades',
    'Get personal futures trading history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, contract, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).getMyTrades(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_position_close',
    'List position close history (requires authentication)',
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
        const { body } = await new FuturesApi(createClient()).listPositionClose(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_price_triggered_orders',
    'List futures price-triggered orders (requires authentication)',
    {
      settle: settleSchema,
      status: z.enum(['open', 'finished']),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, status, contract, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listPriceTriggeredOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Additional public tools ────────────────────────────────────────────────

  server.tool(
    'list_futures_trades',
    'Get recent public trades for a futures contract',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      limit: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
    },
    async ({ settle, contract, limit, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new FuturesApi(createClient()).listFuturesTrades(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_contract_stats',
    'Get contract statistics (open interest, long/short ratio, etc.)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      interval: z.enum(['5m', '15m', '30m', '1h', '4h', '1d']).optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, from, interval, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listContractStats(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_futures_premium_index',
    'Get premium index (mark price minus index price) history for a contract',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      interval: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '8h', '1d', '7d']).optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, from, to, interval, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listFuturesPremiumIndex(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Additional private tools ───────────────────────────────────────────────

  server.tool(
    'list_futures_account_book',
    'Get futures account transaction/ledger history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      type: z.string().optional().describe('Entry type filter e.g. dnw, pnl, fee, refr, fund'),
    },
    async ({ settle, contract, from, to, limit, offset, type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (type) opts.type = type;
        const { body } = await new FuturesApi(createClient()).listFuturesAccountBook(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_futures_fee',
    'Get futures trading fee rates (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        const { body } = await new FuturesApi(createClient()).getFuturesFee(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_leverage',
    'Get current leverage for a futures position (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getLeverage(settle, contract, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'update_position_leverage',
    'Update leverage for a futures position (requires authentication) — always confirm the new leverage with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      leverage: z.string().describe('New leverage value; 0 for cross-margin mode'),
      cross_leverage_limit: z.string().optional().describe('Cross-margin leverage limit (only when leverage=0)'),
    },
    async ({ settle, contract, leverage, cross_leverage_limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (cross_leverage_limit) opts.crossLeverageLimit = cross_leverage_limit;
        const { body } = await new FuturesApi(createClient()).updatePositionLeverage(settle, contract, leverage, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'update_position_margin',
    'Add or reduce margin for a futures position (requires authentication) — always confirm the amount with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      change: z.string().describe('Margin change amount; positive to add, negative to reduce'),
    },
    async ({ settle, contract, change }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).updatePositionMargin(settle, contract, change);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'update_position_risk_limit',
    'Update the risk limit for a futures position (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      risk_limit: z.string().describe('New risk limit value'),
    },
    async ({ settle, contract, risk_limit }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).updatePositionRiskLimit(settle, contract, risk_limit);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_futures_orders',
    'Cancel all open futures orders (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Only cancel orders for this contract'),
      side: z.enum(['ask', 'bid']).optional().describe('Only cancel ask (sell) or bid (buy) orders'),
    },
    async ({ settle, contract, side }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (side) opts.side = side;
        const { body } = await new FuturesApi(createClient()).cancelFuturesOrders(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_batch_futures_orders',
    'Create multiple futures orders in a single request (requires authentication) — always confirm the details with the user before calling this tool',
    {
      settle: settleSchema,
      orders: z.array(z.object({
        contract: z.string(),
        size: z.string().describe('Order size in contracts (negative = short)'),
        price: z.string().describe('Order price; "0" for market'),
        tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional(),
        reduce_only: z.boolean().optional(),
        close: z.boolean().optional(),
        text: z.string().optional(),
      })).describe('Array of futures orders to create'),
    },
    async ({ settle, orders }) => {
      try {
        requireAuth();
        const mapped = orders.map(o => {
          const order: Record<string, unknown> = { contract: o.contract, size: o.size, price: o.price };
          if (o.tif) order.tif = o.tif;
          if (o.reduce_only !== undefined) order.reduceOnly = o.reduce_only;
          if (o.close !== undefined) order.close = o.close;
          if (o.text) order.text = o.text;
          return order;
        });
        const { body } = await new FuturesApi(createClient()).createBatchFuturesOrder(settle, mapped as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_batch_futures_orders',
    'Cancel multiple futures orders by ID in a single request (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      order_ids: z.array(z.string()).describe('Array of order IDs to cancel'),
    },
    async ({ settle, order_ids }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).cancelBatchFutureOrders(settle, order_ids, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_futures_orders_with_time_range',
    'Get futures orders filtered by time range (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, contract, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).getOrdersWithTimeRange(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_my_futures_trades_with_time_range',
    'Get personal futures trade history filtered by time range (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      role: z.enum(['maker', 'taker']).optional(),
    },
    async ({ settle, contract, from, to, limit, offset, role }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (role) opts.role = role;
        const { body } = await new FuturesApi(createClient()).getMyTradesWithTimeRange(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_liquidates',
    'Get personal futures liquidation history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, contract, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).listLiquidates(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_futures_price_triggered_order',
    'Get details of a futures price-triggered order (requires authentication)',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getPriceTriggeredOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_futures_price_triggered_order',
    'Create a futures price-triggered order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      trigger_price: z.string().describe('Price that activates the order'),
      trigger_rule: z.enum(['>=', '<=']).describe('>= fires when price rises to trigger_price; <= fires when it drops'),
      trigger_expiration: z.number().int().optional().describe('Trigger expiration in seconds'),
      order_size: z.number().describe('Order size (negative = short)'),
      order_price: z.string().describe('Execution price; "0" for market'),
      order_tif: z.enum(['gtc', 'ioc']).optional(),
      order_reduce_only: z.boolean().optional(),
      order_close: z.boolean().optional(),
      order_text: z.string().optional(),
    },
    async ({ settle, contract, trigger_price, trigger_rule, trigger_expiration,
             order_size, order_price, order_tif, order_reduce_only, order_close, order_text }) => {
      try {
        requireAuth();
        const trigger: Record<string, unknown> = { price: trigger_price, rule: trigger_rule === '>=' ? 1 : 2 };
        if (trigger_expiration !== undefined) trigger.expiration = trigger_expiration;
        const initial: Record<string, unknown> = { contract, size: order_size, price: order_price };
        if (order_tif) initial.tif = order_tif;
        if (order_reduce_only !== undefined) initial.reduceOnly = order_reduce_only;
        if (order_close !== undefined) initial.close = order_close;
        if (order_text) initial.text = order_text;
        const { body } = await new FuturesApi(createClient()).createPriceTriggeredOrder(settle, { initial, trigger } as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_futures_price_triggered_order',
    'Cancel a single futures price-triggered order (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).cancelPriceTriggeredOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_futures_price_triggered_order_list',
    'Cancel all futures price-triggered orders (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Only cancel orders for this contract'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        const { body } = await new FuturesApi(createClient()).cancelPriceTriggeredOrderList(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'countdown_cancel_all_futures',
    'Set a countdown timer to cancel all futures orders (safety kill-switch, requires authentication)',
    {
      settle: settleSchema,
      timeout: z.number().int().describe('Countdown in seconds; 0 disables the timer'),
      contract: z.string().optional().describe('Limit cancellation to this contract'),
    },
    async ({ settle, timeout, contract }) => {
      try {
        requireAuth();
        const task: Record<string, unknown> = { timeout };
        if (contract) task.contract = contract;
        const { body } = await new FuturesApi(createClient()).countdownCancelAllFutures(settle, task as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
