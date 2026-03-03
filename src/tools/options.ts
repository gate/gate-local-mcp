import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { OptionsApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerOptionsTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool(
    'list_options_underlyings',
    'List all options underlying assets',
    {},
    async () => {
      try {
        const { body } = await new OptionsApi(createClient()).listOptionsUnderlyings();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_expirations',
    'List option expiration dates for an underlying',
    { underlying: z.string().describe('Underlying asset e.g. BTC_USDT') },
    async ({ underlying }) => {
      try {
        const { body } = await new OptionsApi(createClient()).listOptionsExpirations(underlying);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_contracts',
    'List all options contracts for an underlying',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      expiration: z.number().optional().describe('Filter by expiration timestamp'),
    },
    async ({ underlying, expiration }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (expiration !== undefined) opts.expiration = expiration;
        const { body } = await new OptionsApi(createClient()).listOptionsContracts(underlying, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_order_book',
    'Get options order book',
    {
      contract: z.string().describe('Options contract name'),
      limit: z.number().int().optional(),
    },
    async ({ contract, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new OptionsApi(createClient()).listOptionsOrderBook(contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_tickers',
    'Get options tickers for an underlying',
    { underlying: z.string().describe('Underlying asset e.g. BTC_USDT') },
    async ({ underlying }) => {
      try {
        const { body } = await new OptionsApi(createClient()).listOptionsTickers(underlying);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_candlesticks',
    'Get options candlestick data',
    {
      contract: z.string().describe('Options contract name'),
      interval: z.enum(['1m', '5m', '15m', '30m', '1h', '1d']).optional(),
      limit: z.number().int().optional(),
    },
    async ({ contract, interval, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new OptionsApi(createClient()).listOptionsCandlesticks(contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'list_options_account',
    'Get options account balance (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new OptionsApi(createClient()).listOptionsAccount();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_positions',
    'List options positions (requires authentication)',
    { underlying: z.string().optional().describe('Filter by underlying') },
    async ({ underlying }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (underlying) opts.underlying = underlying;
        const { body } = await new OptionsApi(createClient()).listOptionsPositions(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_options_orders',
    'List options orders (requires authentication)',
    {
      status: z.enum(['open', 'finished']),
      underlying: z.string().optional(),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ status, underlying, contract, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (underlying) opts.underlying = underlying;
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new OptionsApi(createClient()).listOptionsOrders(status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_options_order',
    'Create an options order (requires authentication)',
    {
      contract: z.string().describe('Options contract name'),
      size: z.number().int().describe('Order size (negative = short)'),
      price: z.string().optional().describe('Order price (omit for market)'),
      tif: z.enum(['gtc', 'ioc', 'poc']).optional(),
      reduce_only: z.boolean().optional(),
      close: z.boolean().optional(),
    },
    async ({ contract, size, price, tif, reduce_only, close }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = { contract, size };
        if (price) order.price = price;
        if (tif) order.tif = tif;
        if (reduce_only !== undefined) order.reduceOnly = reduce_only;
        if (close !== undefined) order.close = close;
        const { body } = await new OptionsApi(createClient()).createOptionsOrder(order as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cancel_options_order',
    'Cancel an options order (requires authentication)',
    { order_id: z.number().int().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new OptionsApi(createClient()).cancelOptionsOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_my_options_trades',
    'List personal options trading history (requires authentication)',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
    },
    async ({ underlying, contract, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new OptionsApi(createClient()).listMyOptionsTrades(underlying, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
