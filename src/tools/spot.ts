import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SpotApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerSpotTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool('cex.spot.list_currencies', 'List all currencies supported on Gate.com', {}, async () => {
    try {
      const { body } = await new SpotApi(createClient()).listCurrencies();
      return textContent(body);
    } catch (e) { return errorContent(e); }
  });

  server.tool(
    'cex.spot.get_currency',
    'Get details of a single currency',
    { currency: z.string().describe('Currency symbol e.g. BTC') },
    async ({ currency }) => {
      try {
        const { body } = await new SpotApi(createClient()).getCurrency(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool('cex.spot.list_currency_pairs', 'List all available spot trading pairs', {}, async () => {
    try {
      const { body } = await new SpotApi(createClient()).listCurrencyPairs();
      return textContent(body);
    } catch (e) { return errorContent(e); }
  });

  server.tool(
    'cex.spot.get_currency_pair',
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
    'cex.spot.get_spot_tickers',
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
    'cex.spot.get_spot_order_book',
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
    'cex.spot.get_spot_trades',
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
    'cex.spot.get_spot_candlesticks',
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
    'cex.spot.get_spot_fee',
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
    'cex.spot.get_spot_accounts',
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
    'cex.spot.list_spot_orders',
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
    'cex.spot.create_spot_order',
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
        if (type === 'market') order.timeInForce = 'ioc';
        if (account) order.account = account;
        if (text) order.text = text;
        const { body } = await new SpotApi(createClient()).createOrder(order as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.get_spot_order',
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
    'cex.spot.cancel_spot_order',
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
    'cex.spot.amend_spot_order',
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
    'cex.spot.cancel_all_spot_orders',
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
    'cex.spot.list_spot_my_trades',
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
    'cex.spot.list_all_open_orders',
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
    'cex.spot.list_spot_price_triggered_orders',
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

  server.tool(
    'cex.spot.list_spot_account_book',
    'Query spot account transaction history (requires authentication)',
    {
      currency: z.string().optional().describe('Filter by currency'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(1000).optional(),
    },
    async ({ currency, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new SpotApi(createClient()).listSpotAccountBook(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.get_spot_batch_fee',
    'Get fee rates for multiple currency pairs at once (requires authentication)',
    { currency_pairs: z.string().describe('Comma-separated currency pairs e.g. BTC_USDT,ETH_USDT') },
    async ({ currency_pairs }) => {
      try {
        requireAuth();
        const { body } = await new SpotApi(createClient()).getBatchSpotFee(currency_pairs);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.create_spot_batch_orders',
    'Create multiple spot orders in a single request (requires authentication) — always confirm the details with the user before calling this tool',
    {
      orders: z.array(z.object({
        currency_pair: z.string(),
        side: z.enum(['buy', 'sell']),
        amount: z.string(),
        price: z.string().optional(),
        type: z.enum(['limit', 'market']).optional(),
        account: z.enum(['spot', 'margin', 'unified']).optional(),
        text: z.string().optional(),
      })).describe('Array of orders to create'),
    },
    async ({ orders }) => {
      try {
        requireAuth();
        const mapped = orders.map(o => {
          const order: Record<string, unknown> = { currencyPair: o.currency_pair, side: o.side, amount: o.amount };
          if (o.price) order.price = o.price;
          if (o.type) order.type = o.type;
          if (o.type === 'market') order.timeInForce = 'ioc';
          if (o.account) order.account = o.account;
          if (o.text) order.text = o.text;
          return order;
        });
        const { body } = await new SpotApi(createClient()).createBatchOrders(mapped as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.cancel_spot_batch_orders',
    'Cancel multiple spot orders in a single request (requires authentication) — always confirm with the user before calling this tool',
    {
      orders: z.array(z.object({
        currency_pair: z.string(),
        id: z.string().describe('Order ID'),
        account: z.string().optional(),
      })).describe('Array of orders to cancel'),
    },
    async ({ orders }) => {
      try {
        requireAuth();
        const mapped = orders.map(o => {
          const item: Record<string, unknown> = { currencyPair: o.currency_pair, id: o.id };
          if (o.account) item.account = o.account;
          return item;
        });
        const { body } = await new SpotApi(createClient()).cancelBatchOrders(mapped as never, {});
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.create_spot_price_triggered_order',
    'Create a price-triggered (stop) spot order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      trigger_price: z.string().describe('Price that activates the order'),
      trigger_rule: z.enum(['>=', '<=']).describe('>= fires when price rises to trigger_price; <= fires when price drops'),
      trigger_expiration: z.number().int().optional().describe('Trigger expiration in seconds'),
      order_side: z.enum(['buy', 'sell']),
      order_amount: z.string(),
      order_price: z.string().describe('Order execution price'),
      order_type: z.enum(['limit', 'market']).optional(),
      order_account: z.enum(['normal', 'margin', 'unified']).optional(),
      order_tif: z.enum(['gtc', 'ioc']).optional(),
      order_text: z.string().optional(),
    },
    async ({ currency_pair, trigger_price, trigger_rule, trigger_expiration,
             order_side, order_amount, order_price, order_type, order_account, order_tif, order_text }) => {
      try {
        requireAuth();
        const trigger: Record<string, unknown> = { price: trigger_price, rule: trigger_rule === '>=' ? 1 : 2 };
        if (trigger_expiration !== undefined) trigger.expiration = trigger_expiration;
        const put: Record<string, unknown> = { side: order_side, price: order_price, amount: order_amount, account: order_account ?? 'normal' };
        if (order_type) put.type = order_type;
        if (order_tif) put.timeInForce = order_tif;
        if (order_text) put.text = order_text;
        const payload = { market: currency_pair, trigger, put };
        const { body } = await new SpotApi(createClient()).createSpotPriceTriggeredOrder(payload as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.get_spot_price_triggered_order',
    'Get details of a price-triggered spot order (requires authentication)',
    { order_id: z.string().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new SpotApi(createClient()).getSpotPriceTriggeredOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.cancel_spot_price_triggered_order',
    'Cancel a single price-triggered spot order (requires authentication) — always confirm with the user before calling this tool',
    { order_id: z.string().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new SpotApi(createClient()).cancelSpotPriceTriggeredOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.cancel_spot_price_triggered_order_list',
    'Cancel all price-triggered spot orders (requires authentication) — always confirm with the user before calling this tool',
    {
      currency_pair: z.string().optional().describe('Only cancel orders for this pair'),
      account: z.enum(['normal', 'margin', 'unified']).optional(),
    },
    async ({ currency_pair, account }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.market = currency_pair;
        if (account) opts.account = account;
        const { body } = await new SpotApi(createClient()).cancelSpotPriceTriggeredOrderList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.spot.countdown_cancel_all_spot',
    'Set a countdown timer to cancel all spot orders (safety kill-switch, requires authentication)',
    {
      timeout: z.number().int().describe('Countdown in seconds; 0 disables the timer'),
      currency_pair: z.string().optional().describe('Limit cancellation to this pair'),
    },
    async ({ timeout, currency_pair }) => {
      try {
        requireAuth();
        const task: Record<string, unknown> = { timeout };
        if (currency_pair) task.currencyPair = currency_pair;
        const { body } = await new SpotApi(createClient()).countdownCancelAllSpot(task as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
