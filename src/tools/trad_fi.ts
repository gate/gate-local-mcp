import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { TradFiApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerTradFiTools(server: McpServer): void {
  // ── Market data (public) ──────────────────────────────────────────────────

  server.tool(
    'cex_trad_fi_query_categories',
    'List all TradFi instrument categories',
    {},
    async () => {
      try {
        const { body } = await new TradFiApi(createClient()).queryCategories();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_symbols',
    'List all available TradFi trading symbols',
    {},
    async () => {
      try {
        const { body } = await new TradFiApi(createClient()).querySymbols();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_symbol_detail',
    'Get contract/instrument details for a TradFi symbol',
    {
      symbols: z.string().describe('Symbol name e.g. AAPL'),
    },
    async ({ symbols }) => {
      try {
        const { body } = await new TradFiApi(createClient()).querySymbolDetail(symbols);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_symbol_kline',
    'Get kline/OHLCV data for a TradFi symbol',
    {
      symbol: z.string().describe('Symbol name e.g. AAPL'),
      kline_type: z.enum(['1m', '15m', '1h', '4h', '1d', '7d', '30d']).describe('Kline interval'),
      begin_time: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      end_time: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      limit: z.number().int().optional().describe('Number of data points'),
    },
    async ({ symbol, kline_type, begin_time, end_time, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (begin_time !== undefined) opts.beginTime = begin_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new TradFiApi(createClient()).querySymbolKline(symbol, kline_type, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_symbol_ticker',
    'Get latest ticker for a TradFi symbol',
    {
      symbol: z.string().describe('Symbol name e.g. AAPL'),
    },
    async ({ symbol }) => {
      try {
        const { body } = await new TradFiApi(createClient()).querySymbolTicker(symbol);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Account (requires authentication) ────────────────────────────────────

  server.tool(
    'cex_trad_fi_query_mt5_account_info',
    'Get MT5 account information (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new TradFiApi(createClient()).queryMt5AccountInfo();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_user_assets',
    'Get TradFi account asset balances (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new TradFiApi(createClient()).queryUserAssets();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Transactions ──────────────────────────────────────────────────────────

  server.tool(
    'cex_trad_fi_query_transaction',
    'List TradFi account transaction history (requires authentication)',
    {
      begin_time: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      end_time: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      type: z.enum(['deposit', 'withdraw', 'dividend', 'fill_negative']).optional().describe('Transaction type filter'),
      page: z.number().int().min(1).optional(),
      page_size: z.number().int().min(1).optional(),
    },
    async ({ begin_time, end_time, type, page, page_size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (begin_time !== undefined) opts.beginTime = begin_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (type !== undefined) opts.type = type;
        if (page !== undefined) opts.page = page;
        if (page_size !== undefined) opts.pageSize = page_size;
        const { body } = await new TradFiApi(createClient()).queryTransaction(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_create_transaction',
    'Create a TradFi deposit or withdrawal transaction (requires authentication) — always confirm with the user before calling this tool',
    {
      asset: z.string().describe('Asset symbol e.g. USDT'),
      change: z.string().describe('Amount to transfer'),
      type: z.enum(['deposit', 'withdraw']).describe('Transaction type'),
    },
    async ({ asset, change, type }) => {
      try {
        requireAuth();
        const { InlineObject1 } = await import('gate-api');
        const req = new InlineObject1();
        req.asset = asset;
        req.change = change;
        req.type = type as unknown as typeof InlineObject1.Type[keyof typeof InlineObject1.Type];
        const { body } = await new TradFiApi(createClient()).createTransaction(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Orders ────────────────────────────────────────────────────────────────

  server.tool(
    'cex_trad_fi_query_order_list',
    'List open TradFi orders (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new TradFiApi(createClient()).queryOrderList();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_create_tradfi_order',
    'Create a TradFi order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      symbol: z.string().describe('Symbol name e.g. AAPL'),
      side: z.number().int().min(1).max(2).describe('Order side: 1=buy, 2=sell'),
      price: z.string().describe('Order price'),
      price_type: z.enum(['trigger', 'market']).describe('Price type: trigger or market'),
      volume: z.string().describe('Order volume'),
      price_tp: z.string().optional().describe('Take-profit price'),
      price_sl: z.string().optional().describe('Stop-loss price'),
    },
    async ({ symbol, side, price, price_type, volume, price_tp, price_sl }) => {
      try {
        requireAuth();
        const { InlineObject2 } = await import('gate-api');
        const req = new InlineObject2();
        req.symbol = symbol;
        req.side = side as unknown as typeof InlineObject2.Side[keyof typeof InlineObject2.Side];
        req.price = price;
        req.priceType = price_type as unknown as typeof InlineObject2.PriceType[keyof typeof InlineObject2.PriceType];
        req.volume = volume;
        if (price_tp !== undefined) req.priceTp = price_tp;
        if (price_sl !== undefined) req.priceSl = price_sl;
        const { body } = await new TradFiApi(createClient()).createTradFiOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_update_order',
    'Update an open TradFi order (requires authentication) — always confirm the new values with the user before calling this tool',
    {
      order_id: z.string().describe('Order ID'),
      price: z.string().describe('New order price'),
      price_tp: z.string().nullable().optional().describe('New take-profit price (null to remove)'),
      price_sl: z.string().nullable().optional().describe('New stop-loss price (null to remove)'),
    },
    async ({ order_id, price, price_tp, price_sl }) => {
      try {
        requireAuth();
        const { InlineObject3 } = await import('gate-api');
        const req = new InlineObject3();
        req.price = price;
        if (price_tp !== undefined) req.priceTp = price_tp;
        if (price_sl !== undefined) req.priceSl = price_sl;
        const { body } = await new TradFiApi(createClient()).updateOrder(order_id as unknown as number, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_delete_order',
    'Cancel/delete an open TradFi order (requires authentication) — always confirm with the user before calling this tool',
    {
      order_id: z.string().describe('Order ID'),
    },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new TradFiApi(createClient()).deleteOrder(order_id as unknown as number);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_order_history_list',
    'List TradFi order history (requires authentication)',
    {
      begin_time: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      end_time: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      symbol: z.string().optional().describe('Filter by symbol'),
      side: z.number().int().min(1).max(2).optional().describe('Filter by side: 1=buy, 2=sell'),
    },
    async ({ begin_time, end_time, symbol, side }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (begin_time !== undefined) opts.beginTime = begin_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (symbol !== undefined) opts.symbol = symbol;
        if (side !== undefined) opts.side = side;
        const { body } = await new TradFiApi(createClient()).queryOrderHistoryList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Positions ─────────────────────────────────────────────────────────────

  server.tool(
    'cex_trad_fi_query_position_list',
    'List open TradFi positions (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new TradFiApi(createClient()).queryPositionList();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_update_position',
    'Update take-profit or stop-loss for a TradFi position (requires authentication) — always confirm with the user before calling this tool',
    {
      position_id: z.number().int().describe('Position ID'),
      price_tp: z.string().nullable().optional().describe('New take-profit price (null to remove)'),
      price_sl: z.string().nullable().optional().describe('New stop-loss price (null to remove)'),
    },
    async ({ position_id, price_tp, price_sl }) => {
      try {
        requireAuth();
        const { InlineObject4 } = await import('gate-api');
        const req = new InlineObject4();
        if (price_tp !== undefined) req.priceTp = price_tp;
        if (price_sl !== undefined) req.priceSl = price_sl;
        const { body } = await new TradFiApi(createClient()).updatePosition(position_id, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_close_position',
    'Close a TradFi position (requires authentication) — always confirm with the user before calling this tool',
    {
      position_id: z.number().int().describe('Position ID'),
      close_type: z.number().int().min(1).max(2).describe('Close type: 1=market close, 2=limit close'),
      close_volume: z.string().nullable().optional().describe('Volume to close (null for full close)'),
    },
    async ({ position_id, close_type, close_volume }) => {
      try {
        requireAuth();
        const { InlineObject5 } = await import('gate-api');
        const req = new InlineObject5();
        req.closeType = close_type as unknown as typeof InlineObject5.CloseType[keyof typeof InlineObject5.CloseType];
        if (close_volume !== undefined) req.closeVolume = close_volume;
        const { body } = await new TradFiApi(createClient()).closePosition(position_id, req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_trad_fi_query_position_history_list',
    'List TradFi position history (requires authentication)',
    {
      begin_time: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      end_time: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      symbol: z.string().optional().describe('Filter by symbol'),
      position_dir: z.enum(['Long', 'Short']).optional().describe('Filter by position direction'),
    },
    async ({ begin_time, end_time, symbol, position_dir }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (begin_time !== undefined) opts.beginTime = begin_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (symbol !== undefined) opts.symbol = symbol;
        if (position_dir !== undefined) opts.positionDir = position_dir;
        const { body } = await new TradFiApi(createClient()).queryPositionHistoryList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
