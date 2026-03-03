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
    'Create a futures order (requires authentication)',
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
    'Cancel a futures order (requires authentication)',
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
    'Amend an open futures order (requires authentication)',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
      size: z.number().int().optional().describe('New order size'),
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
}
