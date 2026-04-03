import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { CrossExApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerCrossExTools(server: McpServer): void {
  // ── Public market data ────────────────────────────────────────────────────

  server.tool(
    'cex_cross_ex_list_crossex_rule_symbols',
    '[R] List CrossEx rule symbols (public).',
    {
      symbols: z.string().optional().describe('Filter by symbol(s), comma-separated'),
    },
    async ({ symbols }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (symbols !== undefined) opts.symbols = symbols;
        const { body } = await new CrossExApi(createClient()).listCrossexRuleSymbols(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_rule_risk_limits',
    '[R] List CrossEx rule risk limits for a symbol (public).',
    {
      symbols: z.string().describe('Symbol name'),
    },
    async ({ symbols }) => {
      try {
        const { body } = await new CrossExApi(createClient()).listCrossexRuleRiskLimits(symbols);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_transfer_coins',
    '[R] List coins available for CrossEx transfer (public).',
    {
      coin: z.string().optional().describe('Filter by coin symbol'),
    },
    async ({ coin }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (coin !== undefined) opts.coin = coin;
        const { body } = await new CrossExApi(createClient()).listCrossexTransferCoins(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_get_crossex_fee',
    '[R] Get CrossEx trading fee information (public).',
    {},
    async () => {
      try {
        const { body } = await new CrossExApi(createClient()).getCrossexFee();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_get_crossex_interest_rate',
    '[R] Get CrossEx interest rates (public).',
    {
      coin: z.string().optional().describe('Filter by coin symbol'),
      exchange_type: z.string().optional().describe('Exchange type filter'),
    },
    async ({ coin, exchange_type }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (coin !== undefined) opts.coin = coin;
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        const { body } = await new CrossExApi(createClient()).getCrossexInterestRate(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_coin_discount_rate',
    '[R] List CrossEx coin discount rates (public).',
    {
      coin: z.string().optional().describe('Filter by coin symbol'),
      exchange_type: z.string().optional().describe('Exchange type filter'),
    },
    async ({ coin, exchange_type }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (coin !== undefined) opts.coin = coin;
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        const { body } = await new CrossExApi(createClient()).listCrossexCoinDiscountRate(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Transfers (requires authentication) ──────────────────────────────────

  server.tool(
    'cex_cross_ex_list_crossex_transfers',
    '[R] List CrossEx transfer history.',
    {
      coin: z.string().optional().describe('Filter by coin symbol'),
      order_id: z.string().optional().describe('Filter by order ID'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ coin, order_id, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (coin !== undefined) opts.coin = coin;
        if (order_id !== undefined) opts.orderId = order_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexTransfers(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_create_crossex_transfer',
    '[W] Create a CrossEx transfer State-changing.',
    {
      coin: z.string().describe('Coin symbol e.g. USDT'),
      amount: z.string().describe('Transfer amount'),
      from: z.string().describe('Source account'),
      to: z.string().describe('Destination account'),
      text: z.string().optional().describe('Optional memo'),
    },
    async ({ coin, amount, from, to, text }) => {
      try {
        requireAuth();
        const { CrossexTransferRequest } = await import('gate-api');
        const req = new CrossexTransferRequest();
        req.coin = coin;
        req.amount = amount;
        req.from = from;
        req.to = to;
        if (text !== undefined) req.text = text;
        const { body } = await new CrossExApi(createClient()).createCrossexTransfer({ crossexTransferRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Orders (requires authentication) ─────────────────────────────────────

  server.tool(
    'cex_cross_ex_list_crossex_open_orders',
    '[R] List open CrossEx orders.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      exchange_type: z.string().optional().describe('Exchange type filter'),
      business_type: z.string().optional().describe('Business type filter'),
    },
    async ({ symbol, exchange_type, business_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        if (business_type !== undefined) opts.businessType = business_type;
        const { body } = await new CrossExApi(createClient()).listCrossexOpenOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_create_crossex_order',
    '[W] Create a CrossEx order State-changing.',
    {
      symbol: z.string().describe('Symbol e.g. BTC_USDT'),
      side: z.enum(['BUY', 'SELL']).describe('Order side'),
      type: z.enum(['LIMIT', 'MARKET']).optional().describe('Order type (default LIMIT)'),
      qty: z.string().optional().describe('Order quantity'),
      price: z.string().optional().describe('Order price (required for LIMIT)'),
      quote_qty: z.string().optional().describe('Quote quantity (for market buy by amount)'),
      time_in_force: z.enum(['GTC', 'IOC', 'FOK', 'POC']).optional(),
      reduce_only: z.boolean().optional(),
      position_side: z.enum(['LONG', 'SHORT', 'NONE']).optional(),
      text: z.string().optional().describe('Custom order note'),
    },
    async ({ symbol, side, type, qty, price, quote_qty, time_in_force, reduce_only, position_side, text }) => {
      try {
        requireAuth();
        const { CrossexOrderRequest } = await import('gate-api');
        const req = new CrossexOrderRequest();
        req.symbol = symbol;
        req.side = side as unknown as typeof CrossexOrderRequest.Side[keyof typeof CrossexOrderRequest.Side];
        if (type !== undefined) req.type = type as unknown as typeof CrossexOrderRequest.Type[keyof typeof CrossexOrderRequest.Type];
        if (qty !== undefined) req.qty = qty;
        if (price !== undefined) req.price = price;
        if (quote_qty !== undefined) req.quoteQty = quote_qty;
        if (time_in_force !== undefined) req.timeInForce = time_in_force as unknown as typeof CrossexOrderRequest.TimeInForce[keyof typeof CrossexOrderRequest.TimeInForce];
        if (reduce_only !== undefined) req.reduceOnly = (reduce_only ? 'true' : 'false') as unknown as typeof CrossexOrderRequest.ReduceOnly[keyof typeof CrossexOrderRequest.ReduceOnly];
        if (position_side !== undefined) req.positionSide = position_side as unknown as typeof CrossexOrderRequest.PositionSide[keyof typeof CrossexOrderRequest.PositionSide];
        if (text !== undefined) req.text = text;
        const { body } = await new CrossExApi(createClient()).createCrossexOrder({ crossexOrderRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_get_crossex_order',
    '[R] Get details of a CrossEx order.',
    {
      order_id: z.string().describe('Order ID'),
    },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new CrossExApi(createClient()).getCrossexOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_update_crossex_order',
    '[W] Update an open CrossEx order State-changing.',
    {
      order_id: z.string().describe('Order ID'),
      qty: z.string().optional().describe('New quantity'),
      price: z.string().optional().describe('New price'),
    },
    async ({ order_id, qty, price }) => {
      try {
        requireAuth();
        const { CrossexOrderUpdateRequest } = await import('gate-api');
        const req = new CrossexOrderUpdateRequest();
        if (qty !== undefined) req.qty = qty;
        if (price !== undefined) req.price = price;
        const { body } = await new CrossExApi(createClient()).updateCrossexOrder(order_id, { crossexOrderUpdateRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_cancel_crossex_order',
    '[W] Cancel a CrossEx order State-changing.',
    {
      order_id: z.string().describe('Order ID'),
    },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new CrossExApi(createClient()).cancelCrossexOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_history_orders',
    '[R] List CrossEx order history.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ symbol, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexHistoryOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_history_trades',
    '[R] List CrossEx trade history.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ symbol, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexHistoryTrades(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Convert (requires authentication) ────────────────────────────────────

  server.tool(
    'cex_cross_ex_create_crossex_convert_quote',
    '[W] Get a conversion quote for CrossEx State-changing.',
    {
      exchange_type: z.string().describe('Exchange type'),
      from_coin: z.string().describe('Source coin e.g. BTC'),
      to_coin: z.string().describe('Target coin e.g. USDT'),
      from_amount: z.string().describe('Amount to convert'),
    },
    async ({ exchange_type, from_coin, to_coin, from_amount }) => {
      try {
        requireAuth();
        const { CrossexConvertQuoteRequest } = await import('gate-api');
        const req = new CrossexConvertQuoteRequest();
        req.exchangeType = exchange_type;
        req.fromCoin = from_coin;
        req.toCoin = to_coin;
        req.fromAmount = from_amount;
        const { body } = await new CrossExApi(createClient()).createCrossexConvertQuote({ crossexConvertQuoteRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_create_crossex_convert_order',
    '[W] Execute a CrossEx conversion order using a quote State-changing.',
    {
      quote_id: z.string().describe('Quote ID from create_crossex_convert_quote'),
    },
    async ({ quote_id }) => {
      try {
        requireAuth();
        const { CrossexConvertOrderRequest } = await import('gate-api');
        const req = new CrossexConvertOrderRequest();
        req.quoteId = quote_id;
        const { body } = await new CrossExApi(createClient()).createCrossexConvertOrder({ crossexConvertOrderRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Account (requires authentication) ────────────────────────────────────

  server.tool(
    'cex_cross_ex_get_crossex_account',
    '[R] Get CrossEx account information.',
    {
      exchange_type: z.string().optional().describe('Exchange type filter'),
    },
    async ({ exchange_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        const { body } = await new CrossExApi(createClient()).getCrossexAccount(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_update_crossex_account',
    '[W] Update CrossEx account settings State-changing.',
    {
      position_mode: z.string().optional().describe('Position mode e.g. hedge or one-way'),
      account_mode: z.string().optional().describe('Account mode'),
      exchange_type: z.string().optional().describe('Exchange type'),
    },
    async ({ position_mode, account_mode, exchange_type }) => {
      try {
        requireAuth();
        const { CrossexAccountUpdateRequest } = await import('gate-api');
        const req = new CrossexAccountUpdateRequest();
        if (position_mode !== undefined) req.positionMode = position_mode;
        if (account_mode !== undefined) req.accountMode = account_mode;
        if (exchange_type !== undefined) req.exchangeType = exchange_type;
        const { body } = await new CrossExApi(createClient()).updateCrossexAccount({ crossexAccountUpdateRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_account_book',
    '[R] List CrossEx account ledger/book entries.',
    {
      coin: z.string().optional().describe('Filter by coin symbol'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ coin, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (coin !== undefined) opts.coin = coin;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexAccountBook(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Positions (requires authentication) ──────────────────────────────────

  server.tool(
    'cex_cross_ex_list_crossex_positions',
    '[R] List open CrossEx positions.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      exchange_type: z.string().optional().describe('Exchange type filter'),
    },
    async ({ symbol, exchange_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        const { body } = await new CrossExApi(createClient()).listCrossexPositions(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_margin_positions',
    '[R] List open CrossEx margin positions.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      exchange_type: z.string().optional().describe('Exchange type filter'),
    },
    async ({ symbol, exchange_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        const { body } = await new CrossExApi(createClient()).listCrossexMarginPositions(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_adl_rank',
    '[R] List CrossEx auto-deleverage ranks for a symbol.',
    {
      symbol: z.string().describe('Symbol name'),
    },
    async ({ symbol }) => {
      try {
        requireAuth();
        const { body } = await new CrossExApi(createClient()).listCrossexAdlRank(symbol);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_get_crossex_positions_leverage',
    '[R] Get leverage settings for CrossEx positions.',
    {
      symbols: z.string().optional().describe('Filter by symbol(s), comma-separated'),
    },
    async ({ symbols }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbols !== undefined) opts.symbols = symbols;
        const { body } = await new CrossExApi(createClient()).getCrossexPositionsLeverage(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_update_crossex_positions_leverage',
    '[W] Update leverage for CrossEx positions State-changing.',
    {
      symbol: z.string().describe('Symbol name'),
      leverage: z.string().describe('Leverage value e.g. "10"'),
    },
    async ({ symbol, leverage }) => {
      try {
        requireAuth();
        const { CrossexLeverageRequest } = await import('gate-api');
        const req = new CrossexLeverageRequest();
        req.symbol = symbol;
        req.leverage = leverage;
        const { body } = await new CrossExApi(createClient()).updateCrossexPositionsLeverage({ crossexLeverageRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_get_crossex_margin_positions_leverage',
    '[R] Get leverage settings for CrossEx margin positions.',
    {
      symbols: z.string().optional().describe('Filter by symbol(s), comma-separated'),
    },
    async ({ symbols }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbols !== undefined) opts.symbols = symbols;
        const { body } = await new CrossExApi(createClient()).getCrossexMarginPositionsLeverage(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_update_crossex_margin_positions_leverage',
    '[W] Update leverage for CrossEx margin positions State-changing.',
    {
      symbol: z.string().describe('Symbol name'),
      leverage: z.string().describe('Leverage value e.g. "10"'),
    },
    async ({ symbol, leverage }) => {
      try {
        requireAuth();
        const { CrossexLeverageRequest } = await import('gate-api');
        const req = new CrossexLeverageRequest();
        req.symbol = symbol;
        req.leverage = leverage;
        const { body } = await new CrossExApi(createClient()).updateCrossexMarginPositionsLeverage({ crossexLeverageRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_close_crossex_position',
    '[W] Close a CrossEx position State-changing.',
    {
      symbol: z.string().describe('Symbol name'),
      position_side: z.string().optional().describe('Position side: LONG, SHORT, or NONE'),
    },
    async ({ symbol, position_side }) => {
      try {
        requireAuth();
        const { CrossexClosePositionRequest } = await import('gate-api');
        const req = new CrossexClosePositionRequest();
        req.symbol = symbol;
        if (position_side !== undefined) req.positionSide = position_side;
        const { body } = await new CrossExApi(createClient()).closeCrossexPosition({ crossexClosePositionRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_history_positions',
    '[R] List CrossEx position history.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ symbol, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexHistoryPositions(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_history_margin_positions',
    '[R] List CrossEx margin position history.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ symbol, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexHistoryMarginPositions(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_cross_ex_list_crossex_history_margin_interests',
    '[R] List CrossEx margin interest history.',
    {
      symbol: z.string().optional().describe('Filter by symbol'),
      exchange_type: z.string().optional().describe('Exchange type filter'),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).optional(),
    },
    async ({ symbol, exchange_type, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (symbol !== undefined) opts.symbol = symbol;
        if (exchange_type !== undefined) opts.exchangeType = exchange_type;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new CrossExApi(createClient()).listCrossexHistoryMarginInterests(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
