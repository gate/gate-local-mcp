import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { OptionsApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerOptionsTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool(
    'cex_options_list_options_underlyings',
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
    'cex_options_list_options_expirations',
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
    'cex_options_list_options_contracts',
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
    'cex_options_get_options_contract',
    'Get details of a single options contract',
    { contract: z.string().describe('Options contract name e.g. BTC_USDT-20241227-50000-C') },
    async ({ contract }) => {
      try {
        const { body } = await new OptionsApi(createClient()).getOptionsContract(contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_order_book',
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
    'cex_options_list_options_tickers',
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
    'cex_options_list_options_underlying_tickers',
    'Get ticker data for all contracts under an underlying',
    { underlying: z.string().describe('Underlying asset e.g. BTC_USDT') },
    async ({ underlying }) => {
      try {
        const { body } = await new OptionsApi(createClient()).listOptionsUnderlyingTickers(underlying);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_candlesticks',
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

  server.tool(
    'cex_options_list_options_underlying_candlesticks',
    'Get candlestick data for an options underlying index',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      interval: z.enum(['1m', '5m', '15m', '30m', '1h', '1d']).optional(),
      limit: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix seconds)'),
      to: z.number().optional().describe('End time (Unix seconds)'),
    },
    async ({ underlying, interval, limit, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new OptionsApi(createClient()).listOptionsUnderlyingCandlesticks(underlying, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_settlements',
    'List options settlement history for an underlying',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix seconds)'),
      to: z.number().optional().describe('End time (Unix seconds)'),
    },
    async ({ underlying, limit, offset, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new OptionsApi(createClient()).listOptionsSettlements(underlying, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_get_options_settlement',
    'Get a single options settlement record',
    {
      contract: z.string().describe('Options contract name'),
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      at: z.number().int().describe('Settlement time (Unix seconds)'),
    },
    async ({ contract, underlying, at }) => {
      try {
        const { body } = await new OptionsApi(createClient()).getOptionsSettlement(contract, underlying, at);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_trades',
    'List public options trades',
    {
      contract: z.string().optional().describe('Filter by contract'),
      type: z.enum(['C', 'P']).optional().describe('C = call, P = put'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix seconds)'),
      to: z.number().optional().describe('End time (Unix seconds)'),
    },
    async ({ contract, type, limit, offset, from, to }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (type) opts.type = type;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new OptionsApi(createClient()).listOptionsTrades(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'cex_options_list_options_account',
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
    'cex_options_list_options_account_book',
    'List options account change history (requires authentication)',
    {
      underlying: z.string().optional().describe('Filter by underlying'),
      type: z.string().optional().describe('Change type filter'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix seconds)'),
      to: z.number().optional().describe('End time (Unix seconds)'),
    },
    async ({ underlying, type, limit, offset, from, to }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (underlying) opts.underlying = underlying;
        if (type) opts.type = type;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new OptionsApi(createClient()).listOptionsAccountBook(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_my_options_settlements',
    'List personal options settlement history (requires authentication)',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix seconds)'),
      to: z.number().optional().describe('End time (Unix seconds)'),
    },
    async ({ underlying, contract, limit, offset, from, to }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new OptionsApi(createClient()).listMyOptionsSettlements(underlying, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_positions',
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
    'cex_options_get_options_position',
    'Get a single options position (requires authentication)',
    { contract: z.string().describe('Options contract name') },
    async ({ contract }) => {
      try {
        requireAuth();
        const { body } = await new OptionsApi(createClient()).getOptionsPosition(contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_position_close',
    'List options position close history (requires authentication)',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix seconds)'),
      to: z.number().optional().describe('End time (Unix seconds)'),
    },
    async ({ underlying, contract, limit, offset, from, to }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new OptionsApi(createClient()).listOptionsPositionClose(underlying, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_options_orders',
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
    'cex_options_create_options_order',
    'Create an options order (requires authentication) — always confirm the details with the user before calling this tool',
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
    'cex_options_cancel_options_order',
    'Cancel an options order (requires authentication) — always confirm with the user before calling this tool',
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
    'cex_options_get_options_order',
    'Get a single options order (requires authentication)',
    { order_id: z.number().int().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new OptionsApi(createClient()).getOptionsOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_cancel_options_orders',
    'Cancel all open options orders matching filters (requires authentication)',
    {
      underlying: z.string().optional().describe('Filter by underlying'),
      contract: z.string().optional().describe('Filter by contract'),
    },
    async ({ underlying, contract }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (underlying) opts.underlying = underlying;
        if (contract) opts.contract = contract;
        const { body } = await new OptionsApi(createClient()).cancelOptionsOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_countdown_cancel_all_options',
    'Countdown cancel all options orders — resets on each call; orders cancelled if timeout reached (requires authentication)',
    {
      timeout: z.number().int().describe('Countdown seconds; 0 = cancel the countdown'),
      contract: z.string().optional().describe('Restrict to a specific contract'),
      underlying: z.string().optional().describe('Restrict to a specific underlying'),
    },
    async ({ timeout, contract, underlying }) => {
      try {
        requireAuth();
        const { CountdownCancelAllOptionsTask } = await import('gate-api');
        const task = new CountdownCancelAllOptionsTask();
        task.timeout = timeout;
        if (contract) task.contract = contract;
        if (underlying) task.underlying = underlying;
        const { body } = await new OptionsApi(createClient()).countdownCancelAllOptions(task);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_get_options_mmp',
    'Get options MMP (Market Maker Protection) settings (requires authentication)',
    { underlying: z.string().optional().describe('Filter by underlying') },
    async ({ underlying }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (underlying) opts.underlying = underlying;
        const { body } = await new OptionsApi(createClient()).getOptionsMMP(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_set_options_mmp',
    'Set options MMP configuration (requires authentication)',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
      window: z.number().int().optional().describe('MMP window in milliseconds'),
      frozen_period: z.number().int().optional().describe('Freeze period in milliseconds'),
      qty_limit: z.string().optional().describe('Max quantity per window'),
      delta_limit: z.string().optional().describe('Max delta per window'),
    },
    async ({ underlying, window, frozen_period, qty_limit, delta_limit }) => {
      try {
        requireAuth();
        const { OptionsMMP } = await import('gate-api');
        const mmp = new OptionsMMP();
        mmp.underlying = underlying;
        if (window !== undefined) mmp.window = window;
        if (frozen_period !== undefined) mmp.frozenPeriod = frozen_period;
        if (qty_limit !== undefined) mmp.qtyLimit = qty_limit;
        if (delta_limit !== undefined) mmp.deltaLimit = delta_limit;
        const { body } = await new OptionsApi(createClient()).setOptionsMMP(mmp);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_reset_options_mmp',
    'Reset options MMP — unfreeze the market maker (requires authentication)',
    {
      underlying: z.string().describe('Underlying asset e.g. BTC_USDT'),
    },
    async ({ underlying }) => {
      try {
        requireAuth();
        const { OptionsMMPReset } = await import('gate-api');
        const reset = new OptionsMMPReset();
        reset.underlying = underlying;
        const { body } = await new OptionsApi(createClient()).resetOptionsMMP(reset);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_options_list_my_options_trades',
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
