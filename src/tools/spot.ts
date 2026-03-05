import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SpotApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerSpotTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool('list_currencies', 'List all currencies supported on Gate.com', {}, async () => {
    try {
      const { body } = await new SpotApi(createClient()).listCurrencies();
      return textContent(body);
    } catch (e) { return errorContent(e); }
  });

  server.tool(
    'get_currency',
    'Get details of a single currency',
    { currency: z.string().describe('Currency symbol e.g. BTC') },
    async ({ currency }) => {
      try {
        const { body } = await new SpotApi(createClient()).getCurrency(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool('list_currency_pairs', 'List all available spot trading pairs', {}, async () => {
    try {
      const { body } = await new SpotApi(createClient()).listCurrencyPairs();
      return textContent(body);
    } catch (e) { return errorContent(e); }
  });

  server.tool(
    'get_currency_pair',
    'Get details of a single currency pair',
    { currency_pair: z.string().describe('Currency pair e.g. BTC_USDT') },
    async ({ currency_pair }) => {
      try {
        const { body } = await new SpotApi(createClient()).getCurrencyPair(currency_pair);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_tickers',
    'Get ticker information for one or all currency pairs',
    {
      currency_pair: z.string().optional().describe('Limit to this pair e.g. BTC_USDT; omit for all'),
      timezone: z.enum(['utc0', 'utc8', 'all']).optional(),
    },
    async ({ currency_pair, timezone }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        if (timezone) opts.timezone = timezone;
        const { body } = await new SpotApi(createClient()).listTickers(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_order_book',
    'Get the order book for a currency pair',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      limit: z.number().int().min(1).max(5000).optional().describe('Number of price levels (default 10)'),
      with_id: z.boolean().optional().describe('Include order book ID'),
    },
    async ({ currency_pair, limit, with_id }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (with_id !== undefined) opts.withId = with_id;
        const { body } = await new SpotApi(createClient()).listOrderBook(currency_pair, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_trades',
    'Get recent trades for a currency pair',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      limit: z.number().int().min(1).max(1000).optional(),
    },
    async ({ currency_pair, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new SpotApi(createClient()).listTrades(currency_pair, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_candlesticks',
    'Get candlestick/OHLCV data for a currency pair',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      interval: z.enum(['10s', '1m', '5m', '15m', '30m', '1h', '4h', '8h', '1d', '7d', '30d']).optional().describe('Candlestick interval (default 30m)'),
      limit: z.number().int().min(1).max(1000).optional(),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
    },
    async ({ currency_pair, interval, limit, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new SpotApi(createClient()).listCandlesticks(currency_pair, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_fee',
    'Query user trading fee rates (requires authentication)',
    { currency_pair: z.string().optional().describe('Currency pair to query fee for') },
    async ({ currency_pair }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        const { body } = await new SpotApi(createClient()).getFee(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'list_spot_accounts',
    'List spot account balances (requires authentication)',
    { currency: z.string().optional().describe('Filter by currency symbol') },
    async ({ currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new SpotApi(createClient()).listSpotAccounts(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_orders',
    'List spot orders (requires authentication)',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      status: z.enum(['open', 'finished']).optional().describe('Order status (default: open)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(1000).optional(),
    },
    async ({ currency_pair, status, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new SpotApi(createClient()).listOrders(currency_pair, status ?? 'open', opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_order',
    'Create a spot order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      side: z.enum(['buy', 'sell']),
      amount: z.string().describe('Order amount'),
      price: z.string().optional().describe('Order price (omit for market orders)'),
      type: z.enum(['limit', 'market']).optional().describe('Order type (default: limit)'),
      account: z.enum(['spot', 'margin', 'unified']).optional(),
      text: z.string().optional().describe('Custom order reference text (prefix with t-)'),
    },
    async ({ currency_pair, side, amount, price, type, account, text }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = { currencyPair: currency_pair, side, amount };
        if (price) order.price = price;
        if (type) order.type = type;
        if (account) order.account = account;
        if (text) order.text = text;
        const { body } = await new SpotApi(createClient()).createOrder(order as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_order',
    'Get details of a spot order (requires authentication)',
    {
      order_id: z.string().describe('Order ID'),
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
    },
    async ({ order_id, currency_pair }) => {
      try {
        requireAuth();
        const { body } = await new SpotApi(createClient()).getOrder(order_id, currency_pair, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_order',
    'Cancel a single spot order (requires authentication) — always confirm with the user before calling this tool',
    {
      order_id: z.string().describe('Order ID'),
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
    },
    async ({ order_id, currency_pair }) => {
      try {
        requireAuth();
        const { body } = await new SpotApi(createClient()).cancelOrder(order_id, currency_pair, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'amend_order',
    'Amend (modify) an open spot order (requires authentication) — always confirm the new values with the user before calling this tool',
    {
      order_id: z.string().describe('Order ID'),
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      amount: z.string().optional().describe('New order amount'),
      price: z.string().optional().describe('New order price'),
    },
    async ({ order_id, currency_pair, amount, price }) => {
      try {
        requireAuth();
        const patch: Record<string, unknown> = {};
        if (amount) patch.amount = amount;
        if (price) patch.price = price;
        const { body } = await new SpotApi(createClient()).amendOrder(order_id, patch as never, { currencyPair: currency_pair });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_orders',
    'Cancel all open orders for a currency pair (requires authentication) — always confirm with the user before calling this tool',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      side: z.enum(['buy', 'sell']).optional().describe('Cancel only buy or sell orders'),
    },
    async ({ currency_pair, side }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = { currencyPair: currency_pair };
        if (side) opts.side = side;
        const { body } = await new SpotApi(createClient()).cancelOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_my_trades',
    'List personal trading history (requires authentication)',
    {
      currency_pair: z.string().optional().describe('Filter by currency pair'),
      limit: z.number().int().min(1).max(1000).optional(),
      page: z.number().int().min(1).optional(),
    },
    async ({ currency_pair, limit, page }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        const { body } = await new SpotApi(createClient()).listMyTrades(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_all_open_orders',
    'List all open orders across all pairs (requires authentication)',
    { page: z.number().int().min(1).optional(), limit: z.number().int().min(1).max(100).optional() },
    async ({ page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new SpotApi(createClient()).listAllOpenOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_spot_price_triggered_orders',
    'List price-triggered (stop) orders (requires authentication)',
    {
      status: z.enum(['open', 'finished']).describe('Order status'),
      currency_pair: z.string().optional(),
      limit: z.number().int().optional(),
    },
    async ({ status, currency_pair, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.market = currency_pair;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new SpotApi(createClient()).listSpotPriceTriggeredOrders(status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
