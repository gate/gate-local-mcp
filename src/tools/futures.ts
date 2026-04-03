import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  FuturesApi,
  FuturesPositionCrossMode,
  UpdateDualCompPositionCrossModeRequest,
  BatchFundingRatesRequest,
  FuturesBBOOrder,
  CreateTrailOrder,
  StopTrailOrder,
  StopAllTrailOrders,
  UpdateTrailOrder,
  BatchAmendOrderReq,
  FuturesUpdatePriceTriggeredOrder,
} from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent, ORDER_SOURCE_TEXT } from '../utils.js';

const settleSchema = z.enum(['btc', 'usdt']).describe('Settlement currency: btc or usdt');

export function registerFuturesTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool(
    'cex_futures_list_futures_contracts',
    '[R] List all perpetual futures contracts.',
    {
      settle: settleSchema,
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, limit, offset }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).listFuturesContracts(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_contract',
    '[R] Get details of a single futures contract.',
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
    'cex_futures_get_futures_order_book',
    '[R] Get futures order book.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      interval: z.string().optional().describe('Price grouping interval e.g. 0, 0.1, 0.01'),
      limit: z.number().int().optional(),
      with_id: z.boolean().optional().describe('Include order book ID in response'),
    },
    async ({ settle, contract, interval, limit, with_id }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        if (with_id !== undefined) opts.withId = with_id;
        const { body } = await new FuturesApi(createClient()).listFuturesOrderBook(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_candlesticks',
    '[R] Get futures candlestick/OHLCV data.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      interval: z.enum(['10s', '1m', '5m', '15m', '30m', '1h', '4h', '8h', '1d', '7d']).optional(),
      limit: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      timezone: z.string().optional().describe('Timezone for candle alignment e.g. Asia/Shanghai'),
    },
    async ({ settle, contract, interval, limit, from, to, timezone }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (timezone) opts.timezone = timezone;
        const { body } = await new FuturesApi(createClient()).listFuturesCandlesticks(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_tickers',
    '[R] Get ticker information for futures contracts.',
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
    'cex_futures_get_futures_funding_rate',
    '[R] Get funding rate history for a futures contract.',
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
        const { body } = await new FuturesApi(createClient()).listFuturesFundingRateHistory(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_trades',
    '[R] Get recent public trades for a futures contract.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      last_id: z.string().optional().describe('Pagination cursor — return records after this trade ID'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
    },
    async ({ settle, contract, limit, offset, last_id, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (last_id) opts.lastId = last_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new FuturesApi(createClient()).listFuturesTrades(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_list_contract_stats',
    '[R] Get contract statistics (open interest, long/short ratio, etc.).',
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
    'cex_futures_get_futures_premium_index',
    '[R] Get premium index (mark price minus index price) history for a contract.',
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

  server.tool(
    'cex_futures_list_batch_futures_funding_rates',
    '[R] Get current funding rates for multiple contracts in one request.',
    {
      settle: settleSchema,
      contracts: z.array(z.string()).describe('List of contract names e.g. ["BTC_USDT","ETH_USDT"]'),
    },
    async ({ settle, contracts }) => {
      try {
        const req = new BatchFundingRatesRequest();
        req.contracts = contracts;
        const { body } = await new FuturesApi(createClient()).listBatchFuturesFundingRates(settle, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_list_futures_insurance_ledger',
    '[R] Get futures insurance fund history.',
    {
      settle: settleSchema,
      limit: z.number().int().optional(),
    },
    async ({ settle, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listFuturesInsuranceLedger(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_index_constituents',
    '[R] Get constituent assets and weights for a futures index.',
    {
      settle: settleSchema,
      index: z.string().describe('Index name e.g. BTC_USDT'),
    },
    async ({ settle, index }) => {
      try {
        const { body } = await new FuturesApi(createClient()).getIndexConstituents(settle, index);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_list_liquidated_orders',
    '[R] Get public market-wide liquidation order history.',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, from, to, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FuturesApi(createClient()).listLiquidatedOrders(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'cex_futures_get_futures_accounts',
    '[R] Get futures account balances. Requires auth.',
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
    'cex_futures_list_futures_account_book',
    '[R] Get futures account transaction/ledger history. Requires auth.',
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
    'cex_futures_list_futures_positions',
    '[R] List all open futures positions. Requires auth.',
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
    'cex_futures_list_positions_timerange',
    '[R] Get position history for a contract filtered by time range. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, contract, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).listPositionsTimerange(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_position',
    '[R] Get a single futures position. Requires auth.',
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
    'cex_futures_get_leverage',
    '[R] Get current leverage for a futures position. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      pos_margin_mode: z.string().describe('Position margin mode filter'),
      dual_side: z.string().describe('Dual side filter: dual_long or dual_short'),
    },
    async ({ settle, contract, pos_margin_mode, dual_side }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getLeverage(settle, contract, pos_margin_mode, dual_side);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_fee',
    '[R] Get futures trading fee rates. Requires auth.',
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
    'cex_futures_list_futures_risk_limit_tiers',
    '[R] Get risk limit tiers for a futures contract.',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Contract name e.g. BTC_USDT'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, contract, limit, offset }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new FuturesApi(createClient()).listFuturesRiskLimitTiers(settle, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_risk_limit_table',
    '[R] Get a specific risk limit tier table by table ID. Requires auth.',
    {
      settle: settleSchema,
      table_id: z.string().describe('Risk limit table ID'),
    },
    async ({ settle, table_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getFuturesRiskLimitTable(settle, table_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_list_futures_orders',
    '[R] List futures orders. Requires auth.',
    {
      settle: settleSchema,
      status: z.enum(['open', 'finished']).describe('Order status'),
      contract: z.string().optional().describe('Filter by contract'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      last_id: z.string().optional().describe('Pagination cursor — return records after this order ID'),
    },
    async ({ settle, status, contract, limit, offset, last_id }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (last_id) opts.lastId = last_id;
        const { body } = await new FuturesApi(createClient()).listFuturesOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_create_futures_order',
    '[W] Create a futures order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      size: z.string().describe('Order size in contracts (negative = short)'),
      price: z.string().describe('Order price (0 for market orders)'),
      tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional().describe('Time in force'),
      reduce_only: z.boolean().optional().describe('Reduce-only order'),
      close: z.boolean().optional().describe('Close position'),
      iceberg: z.number().int().optional().describe('Iceberg order display size'),
      auto_size: z.string().optional().describe('Auto size strategy: close_long or close_short'),
      stp_act: z.string().optional().describe('Self-trade prevention action: cn, co, cb, -'),
      market_order_slip_ratio: z.string().optional().describe('Market order slippage tolerance ratio'),
      pos_margin_mode: z.string().optional().describe('Position margin mode'),
    },
    async ({ settle, contract, size, price, tif, reduce_only, close, iceberg, auto_size, stp_act, market_order_slip_ratio, pos_margin_mode }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = { contract, size, price };
        order.tif = tif ?? (price === '0' ? 'ioc' : 'gtc');
        if (reduce_only !== undefined) order.reduceOnly = reduce_only;
        if (close !== undefined) order.close = close;
        if (iceberg !== undefined) order.iceberg = iceberg;
        if (auto_size !== undefined) order.autoSize = auto_size;
        if (stp_act !== undefined) order.stpAct = stp_act;
        if (market_order_slip_ratio !== undefined) order.marketOrderSlipRatio = market_order_slip_ratio;
        if (pos_margin_mode !== undefined) order.posMarginMode = pos_margin_mode;
        order.text = ORDER_SOURCE_TEXT;
        const { body } = await new FuturesApi(createClient()).createFuturesOrder(settle, order as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_create_futures_bbo_order',
    '[W] Create a BBO futures order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      size: z.number().int().describe('Order size in contracts (negative = short)'),
      direction: z.string().describe('Order direction: long or short'),
      level: z.number().int().describe('BBO level (1 = best bid/offer)'),
      tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional(),
      reduce_only: z.boolean().optional(),
      close: z.boolean().optional(),
    },
    async ({ settle, contract, size, direction, level, tif, reduce_only, close }) => {
      try {
        requireAuth();
        const order = new FuturesBBOOrder();
        order.contract = contract;
        order.size = size;
        order.direction = direction;
        order.level = level;
        if (tif !== undefined) order.tif = tif as unknown as FuturesBBOOrder.Tif;
        if (reduce_only !== undefined) order.reduceOnly = reduce_only;
        if (close !== undefined) order.close = close;
        order.text = ORDER_SOURCE_TEXT;
        const { body } = await new FuturesApi(createClient()).createFuturesBBOOrder(settle, order, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_order',
    '[R] Get a futures order by ID. Requires auth.',
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
    'cex_futures_amend_futures_order',
    '[W] Amend an open futures order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
      size: z.string().optional().describe('New order size'),
      price: z.string().optional().describe('New order price'),
      amend_text: z.string().optional().describe('Custom amendment note'),
    },
    async ({ settle, order_id, size, price, amend_text }) => {
      try {
        requireAuth();
        const amendment: Record<string, unknown> = {};
        if (size !== undefined) amendment.size = size;
        if (price) amendment.price = price;
        if (amend_text !== undefined) amendment.amendText = amend_text;
        const { body } = await new FuturesApi(createClient()).amendFuturesOrder(settle, order_id, amendment as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_cancel_futures_order',
    '[W] Cancel a futures order. Requires auth. State-changing.',
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
    'cex_futures_cancel_all_futures_orders',
    '[W] Cancel all open futures orders. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract to cancel orders for'),
      side: z.enum(['ask', 'bid']).optional().describe('Only cancel ask (sell) or bid (buy) orders'),
      exclude_reduce_only: z.boolean().optional().describe('Exclude reduce-only orders from cancellation'),
      text: z.string().optional().describe('Only cancel orders with this text label'),
    },
    async ({ settle, contract, side, exclude_reduce_only, text }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (side) opts.side = side;
        if (exclude_reduce_only !== undefined) opts.excludeReduceOnly = exclude_reduce_only;
        if (text) opts.text = text;
        const { body } = await new FuturesApi(createClient()).cancelFuturesOrders(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_create_futures_batch_orders',
    '[W] Create multiple futures orders in a single request. Requires auth. State-changing. Single → create_futures_order.',
    {
      settle: settleSchema,
      orders: z.array(z.object({
        contract: z.string(),
        size: z.string().describe('Order size in contracts (negative = short)'),
        price: z.string().describe('Order price; "0" for market'),
        tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional(),
        reduce_only: z.boolean().optional(),
        close: z.boolean().optional(),
      })).describe('Array of futures orders to create'),
    },
    async ({ settle, orders }) => {
      try {
        requireAuth();
        const mapped = orders.map(o => {
          const order: Record<string, unknown> = { contract: o.contract, size: o.size, price: o.price };
          order.tif = o.tif ?? (o.price === '0' ? 'ioc' : 'gtc');
          if (o.reduce_only !== undefined) order.reduceOnly = o.reduce_only;
          if (o.close !== undefined) order.close = o.close;
          order.text = ORDER_SOURCE_TEXT;
          return order;
        });
        const { body } = await new FuturesApi(createClient()).createBatchFuturesOrder(settle, mapped as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_cancel_futures_batch_orders',
    '[W] Cancel multiple futures orders by ID in a single request. Requires auth. State-changing. Single → cancel_futures_order.',
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
    'cex_futures_amend_futures_batch_orders',
    '[W] Amend multiple futures orders in a single request. Requires auth. State-changing. Single → amend_futures_order.',
    {
      settle: settleSchema,
      orders: z.array(z.object({
        order_id: z.string().optional().describe('Order ID to amend'),
        size: z.string().optional().describe('New size'),
        price: z.string().optional().describe('New price'),
        text: z.string().optional(),
        amend_text: z.string().optional().describe('Reason for amendment'),
      })).describe('Array of order amendments'),
    },
    async ({ settle, orders }) => {
      try {
        requireAuth();
        const reqs = orders.map(o => {
          const req = new BatchAmendOrderReq();
          if (o.order_id !== undefined) req.orderId = o.order_id as unknown as number;
          if (o.size) req.size = o.size;
          if (o.price) req.price = o.price;
          if (o.text) req.text = o.text;
          if (o.amend_text) req.amendText = o.amend_text;
          return req;
        });
        const { body } = await new FuturesApi(createClient()).amendBatchFutureOrders(settle, reqs, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_orders_with_time_range',
    '[R] Get futures orders filtered by time range. Requires auth.',
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
    'cex_futures_list_futures_my_trades',
    '[R] Get personal futures trading history. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
      order: z.number().int().optional().describe('Filter by order ID'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      last_id: z.string().optional().describe('Pagination cursor — return records after this trade ID'),
    },
    async ({ settle, contract, order, limit, offset, last_id }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (order !== undefined) opts.order = order;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (last_id) opts.lastId = last_id;
        const { body } = await new FuturesApi(createClient()).getMyTrades(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_my_trades_timerange',
    '[R] Get personal futures trade history filtered by time range. Requires auth.',
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
    'cex_futures_list_position_close',
    '[R] List position close history. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      side: z.string().optional().describe('Position side: long or short'),
      pnl: z.string().optional().describe('Filter by profit/loss: win or loss'),
    },
    async ({ settle, contract, limit, offset, from, to, side, pnl }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (side) opts.side = side;
        if (pnl) opts.pnl = pnl;
        const { body } = await new FuturesApi(createClient()).listPositionClose(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_list_futures_liq_orders',
    '[R] Get personal futures liquidation history. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      at: z.number().optional().describe('Timestamp snapshot — return liquidations at this time'),
    },
    async ({ settle, contract, from, to, limit, offset, at }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (at !== undefined) opts.at = at;
        const { body } = await new FuturesApi(createClient()).listLiquidates(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_list_auto_deleverages',
    '[R] Get personal auto-deleverage history. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      at: z.number().optional().describe('Timestamp snapshot'),
    },
    async ({ settle, contract, from, to, limit, offset, at }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (at !== undefined) opts.at = at;
        const { body } = await new FuturesApi(createClient()).listAutoDeleverages(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_position_leverage',
    '[W] Update leverage for a futures position. Requires auth. State-changing.',
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
    'cex_futures_update_futures_contract_position_leverage',
    '[W] Update position leverage with explicit margin mode. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      leverage: z.string().describe('New leverage value'),
      margin_mode: z.string().describe('Margin mode: isolated or cross'),
      dual_side: z.string().optional().describe('Dual side: long or short'),
    },
    async ({ settle, contract, leverage, margin_mode, dual_side }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (dual_side) opts.dualSide = dual_side;
        const { body } = await new FuturesApi(createClient()).updateContractPositionLeverage(settle, contract, leverage, margin_mode, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_position_margin',
    '[W] Add or reduce margin for a futures position. Requires auth. State-changing.',
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
    'cex_futures_update_futures_position_risk_limit',
    '[W] Update the risk limit for a futures position. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      risk_limit: z.number().describe('New risk limit value'),
    },
    async ({ settle, contract, risk_limit }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).updatePositionRiskLimit(settle, contract, risk_limit as unknown as string);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_position_cross_mode',
    '[W] Switch a single-mode position between isolated and cross margin. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      mode: z.enum(['CROSS', 'ISOLATED']).describe('Margin mode to set: CROSS or ISOLATED'),
    },
    async ({ settle, contract, mode }) => {
      try {
        requireAuth();
        const crossMode = new FuturesPositionCrossMode();
        crossMode.contract = contract;
        crossMode.mode = mode;
        const { body } = await new FuturesApi(createClient()).updatePositionCrossMode(settle, crossMode);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_dual_comp_position_cross_mode',
    '[W] Switch a dual-mode position between isolated and cross margin. Requires auth. State-changing. Single-mode → update_futures_position_cross_mode.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      mode: z.enum(['CROSS', 'ISOLATED']).describe('Margin mode to set: CROSS or ISOLATED'),
    },
    async ({ settle, contract, mode }) => {
      try {
        requireAuth();
        const req = new UpdateDualCompPositionCrossModeRequest();
        req.contract = contract;
        req.mode = mode;
        const { body } = await new FuturesApi(createClient()).updateDualCompPositionCrossMode(settle, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_set_futures_dual_mode',
    '[W] Enable or disable dual-mode (hedge mode) for a futures account. Requires auth. State-changing.',
    {
      settle: settleSchema,
      dual_mode: z.boolean().describe('true to enable dual/hedge mode, false to disable'),
    },
    async ({ settle, dual_mode }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).setDualMode(settle, dual_mode);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_set_position_mode',
    '[W] Set account-level position mode. Requires auth. State-changing.',
    {
      settle: settleSchema,
      position_mode: z.string().describe('Position mode e.g. single_mode or dual_long_short_mode'),
    },
    async ({ settle, position_mode }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).setPositionMode(settle, position_mode);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_dual_mode_position',
    '[R] Get dual-mode positions for a contract. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
    },
    async ({ settle, contract }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getDualModePosition(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_dual_mode_position_margin',
    '[W] Add or reduce margin for a dual-mode position. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      change: z.string().describe('Margin change amount; positive to add, negative to reduce'),
      dual_side: z.enum(['long', 'short']).describe('Which side of the dual-mode position to adjust'),
    },
    async ({ settle, contract, change, dual_side }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).updateDualModePositionMargin(settle, contract, change, dual_side);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_dual_mode_position_leverage',
    '[W] Update leverage for a dual-mode position. Requires auth. State-changing.',
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
        const { body } = await new FuturesApi(createClient()).updateDualModePositionLeverage(settle, contract, leverage, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_dual_mode_position_risk_limit',
    '[W] Update the risk limit for a dual-mode position. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      risk_limit: z.number().describe('New risk limit value'),
    },
    async ({ settle, contract, risk_limit }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).updateDualModePositionRiskLimit(settle, contract, risk_limit as unknown as string);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_countdown_cancel_all_futures',
    '[W] Set a countdown timer to cancel all futures orders (safety kill-switch, Requires auth). State-changing.',
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

  // ── Trail Orders ──────────────────────────────────────────────────────────

  server.tool(
    'cex_futures_create_trail_order',
    '[W] Create a trailing stop order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name e.g. BTC_USDT'),
      amount: z.string().describe('Order size'),
      activation_price: z.string().optional().describe('Price that activates the trailing stop'),
      is_gte: z.boolean().optional().describe('true = activate when price >= activation_price'),
      price_type: z.number().int().optional().describe('Price type: 1=mark, 2=index, 3=last'),
      price_offset: z.string().optional().describe('Trailing offset from the activation price'),
      reduce_only: z.boolean().optional(),
      text: z.string().optional(),
    },
    async ({ settle, contract, amount, activation_price, is_gte, price_type, price_offset, reduce_only, text }) => {
      try {
        requireAuth();
        const req = new CreateTrailOrder();
        req.contract = contract;
        req.amount = amount;
        if (activation_price) req.activationPrice = activation_price;
        if (is_gte !== undefined) req.isGte = is_gte;
        if (price_type !== undefined) req.priceType = price_type as unknown as CreateTrailOrder.PriceType;
        if (price_offset) req.priceOffset = price_offset;
        if (reduce_only !== undefined) req.reduceOnly = reduce_only;
        if (text) req.text = text;
        const { body } = await new FuturesApi(createClient()).createTrailOrder(settle, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_trail_orders',
    '[R] List trail orders. Requires auth.',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      is_finished: z.boolean().optional(),
      start_at: z.number().optional().describe('Start time (Unix timestamp)'),
      end_at: z.number().optional().describe('End time (Unix timestamp)'),
      page_num: z.number().int().optional(),
      page_size: z.number().int().optional(),
    },
    async ({ settle, contract, is_finished, start_at, end_at, page_num, page_size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (is_finished !== undefined) opts.isFinished = is_finished;
        if (start_at !== undefined) opts.startAt = start_at;
        if (end_at !== undefined) opts.endAt = end_at;
        if (page_num !== undefined) opts.pageNum = page_num;
        if (page_size !== undefined) opts.pageSize = page_size;
        const { body } = await new FuturesApi(createClient()).getTrailOrders(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_trail_order_detail',
    '[R] Get details of a single trail order. Requires auth.',
    {
      settle: settleSchema,
      id: z.number().int().describe('Trail order ID'),
    },
    async ({ settle, id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getTrailOrderDetail(settle, id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_trail_order',
    '[W] Update an existing trail order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      id: z.number().describe('Trail order ID'),
      amount: z.string().optional().describe('New order size'),
      activation_price: z.string().optional().describe('New activation price'),
      price_offset: z.string().optional().describe('New trailing price offset'),
      price_type: z.number().int().optional().describe('Price type: 0=default, 1=mark, 2=index, 3=last'),
    },
    async ({ settle, id, amount, activation_price, price_offset, price_type }) => {
      try {
        requireAuth();
        const req = new UpdateTrailOrder();
        req.id = BigInt(id);
        if (amount) req.amount = amount;
        if (activation_price) req.activationPrice = activation_price;
        if (price_offset) req.priceOffset = price_offset;
        if (price_type !== undefined) req.priceType = price_type as unknown as UpdateTrailOrder.PriceType;
        const { body } = await new FuturesApi(createClient()).updateTrailOrder(settle, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_stop_trail_order',
    '[W] Stop a specific trail order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      id: z.number().describe('Trail order ID'),
      text: z.string().optional().describe('Stop reason text'),
    },
    async ({ settle, id, text }) => {
      try {
        requireAuth();
        const req = new StopTrailOrder();
        req.id = BigInt(id);
        if (text) req.text = text;
        const { body } = await new FuturesApi(createClient()).stopTrailOrder(settle, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_stop_all_trail_orders',
    '[W] Stop all trail orders. Requires auth. State-changing.',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Only stop trail orders for this contract'),
      related_position: z.number().int().optional().describe('Related position filter: 1 or 2'),
    },
    async ({ settle, contract, related_position }) => {
      try {
        requireAuth();
        const req = new StopAllTrailOrders();
        if (contract) req.contract = contract;
        if (related_position !== undefined) req.relatedPosition = related_position as unknown as StopAllTrailOrders.RelatedPosition;
        const { body } = await new FuturesApi(createClient()).stopAllTrailOrders(settle, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_trail_order_change_log',
    '[R] Get change log for a trail order. Requires auth.',
    {
      settle: settleSchema,
      id: z.number().int().describe('Trail order ID'),
      page_num: z.number().int().optional(),
      page_size: z.number().int().optional(),
    },
    async ({ settle, id, page_num, page_size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page_num !== undefined) opts.pageNum = page_num;
        if (page_size !== undefined) opts.pageSize = page_size;
        const { body } = await new FuturesApi(createClient()).getTrailOrderChangeLog(settle, id, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Price-triggered orders ─────────────────────────────────────────────────

  server.tool(
    'cex_futures_list_price_triggered_orders',
    '[R] List futures price-triggered orders. Requires auth.',
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
        const { body } = await new FuturesApi(createClient()).listPriceTriggeredOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_create_futures_price_triggered_order',
    '[W] Create a futures price-triggered order. Requires auth. State-changing.',
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
      order_type: z.enum(['close-long-position', 'close-short-position', 'plan-close-long-position', 'plan-close-short-position']).optional().describe('Order type: close-long-position (position TP/SL close all long), close-short-position (position TP/SL close all short), plan-close-long-position (plan TP/SL close all or partial long), plan-close-short-position (plan TP/SL close all or partial short)'),
    },
    async ({ settle, contract, trigger_price, trigger_rule, trigger_expiration,
             order_size, order_price, order_tif, order_reduce_only, order_close, order_text, order_type }) => {
      try {
        requireAuth();
        const trigger: Record<string, unknown> = { price: trigger_price, rule: trigger_rule === '>=' ? 1 : 2 };
        if (trigger_expiration !== undefined) trigger.expiration = trigger_expiration;
        const initial: Record<string, unknown> = { contract, size: order_size, price: order_price };
        initial.tif = order_tif ?? 'gtc';
        if (order_reduce_only !== undefined) initial.reduceOnly = order_reduce_only;
        if (order_close !== undefined) initial.close = order_close;
        if (order_text) initial.text = order_text;
        const params: Record<string, unknown> = { initial, trigger };
        if (order_type) params.orderType = order_type;
        const { body } = await new FuturesApi(createClient()).createPriceTriggeredOrder(settle, params as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_get_futures_price_triggered_order',
    '[R] Get details of a futures price-triggered order. Requires auth.',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).getPriceTriggeredOrder(settle, order_id as unknown as number);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_update_futures_price_triggered_order',
    '[W] Update an existing futures price-triggered order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
      size: z.number().int().optional().describe('New order size'),
      price: z.string().optional().describe('New execution price'),
      trigger_price: z.string().optional().describe('New trigger price'),
      price_type: z.number().int().optional().describe('Trigger price type: 0=last, 1=mark, 2=index'),
      auto_size: z.string().optional(),
      close: z.boolean().optional(),
    },
    async ({ settle, order_id, size, price, trigger_price, price_type, auto_size, close }) => {
      try {
        requireAuth();
        const req = new FuturesUpdatePriceTriggeredOrder();
        req.orderId = BigInt(order_id);
        if (size !== undefined) req.size = size;
        if (price) req.price = price;
        if (trigger_price) req.triggerPrice = trigger_price;
        if (price_type !== undefined) req.priceType = price_type as unknown as FuturesUpdatePriceTriggeredOrder.PriceType;
        if (auto_size) req.autoSize = auto_size;
        if (close !== undefined) req.close = close;
        const { body } = await new FuturesApi(createClient()).updatePriceTriggeredOrder(settle, order_id as unknown as number, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_cancel_futures_price_triggered_order',
    '[W] Cancel a single futures price-triggered order. Requires auth. State-changing.',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new FuturesApi(createClient()).cancelPriceTriggeredOrder(settle, order_id as unknown as number);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_futures_cancel_futures_price_triggered_order_list',
    '[W] Cancel all futures price-triggered orders. Requires auth. State-changing.',
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

}
