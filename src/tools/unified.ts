import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { UnifiedApi, UnifiedPortfolioInput, MockSpotBalance, MockSpotOrder, MockFuturesPosition, MockFuturesOrder, MockOptionsPosition, MockOptionsOrder } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerUnifiedTools(server: McpServer): void {

  server.tool(
    'cex_unified_get_unified_accounts',
    '[R] Get unified account balances and info. Requires auth.',
    {
      currency: z.string().optional().describe('Filter by currency'),
      sub_uid: z.string().optional().describe('Sub-account UID'),
    },
    async ({ currency, sub_uid }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (sub_uid) opts.subUid = sub_uid;
        const { body } = await new UnifiedApi(createClient()).listUnifiedAccounts(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_list_unified_currencies',
    '[R] List currencies supported in unified account. Requires auth.',
    { currency: z.string().optional().describe('Filter by currency') },
    async ({ currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new UnifiedApi(createClient()).listUnifiedCurrencies(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_mode',
    '[R] Get current unified account mode. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedMode();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_set_unified_mode',
    '[W] Switch unified account mode. Requires auth. State-changing.',
    {
      mode: z.string().describe('Mode: classic, multi_currency, portfolio, or single_currency'),
      usdt_futures: z.boolean().optional().describe('Enable USDT futures in unified account'),
      spot_hedge: z.boolean().optional().describe('Enable spot hedging'),
      use_funding: z.boolean().optional().describe('Enable funding balance as margin'),
      options: z.boolean().optional().describe('Enable options trading'),
    },
    async ({ mode, usdt_futures, spot_hedge, use_funding, options }) => {
      try {
        requireAuth();
        const req: Record<string, unknown> = { mode };
        const settings: Record<string, unknown> = {};
        if (usdt_futures !== undefined) settings.usdtFutures = usdt_futures;
        if (spot_hedge !== undefined) settings.spotHedge = spot_hedge;
        if (use_funding !== undefined) settings.useFunding = use_funding;
        if (options !== undefined) settings.options = options;
        if (Object.keys(settings).length > 0) req.settings = settings;
        const { body } = await new UnifiedApi(createClient()).setUnifiedMode(req as never);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_risk_units',
    '[R] Get risk unit details for portfolio margin mode. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedRiskUnits();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_borrowable',
    '[R] Get maximum borrowable amount for a currency in unified account. Requires auth.',
    { currency: z.string().describe('Currency symbol e.g. USDT') },
    async ({ currency }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedBorrowable(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_transferable',
    '[R] Get maximum transferable amount for a currency in unified account. Requires auth.',
    { currency: z.string().describe('Currency symbol e.g. USDT') },
    async ({ currency }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedTransferable(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_estimate_rate',
    '[R] Get estimated borrow interest rates for currencies. Requires auth.',
    { currencies: z.array(z.string()).describe('List of currency symbols e.g. ["BTC","USDT"]') },
    async ({ currencies }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedEstimateRate(currencies);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_list_unified_loans',
    '[R] List active loans in unified account. Requires auth.',
    {
      currency: z.string().optional().describe('Filter by currency'),
      type: z.string().optional().describe('Loan type: platform or margin'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ currency, type, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (type) opts.type = type;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new UnifiedApi(createClient()).listUnifiedLoans(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_create_unified_loan',
    '[W] Borrow or repay in unified account. Requires auth. State-changing.',
    {
      currency: z.string().describe('Currency to borrow/repay'),
      type: z.enum(['borrow', 'repay']),
      amount: z.string().describe('Amount to borrow or repay'),
      repaid_all: z.boolean().optional().describe('Repay full outstanding balance (repay only)'),
      text: z.string().optional().describe('Custom remark'),
    },
    async ({ currency, type, amount, repaid_all, text }) => {
      try {
        requireAuth();
        const loan: Record<string, unknown> = { currency, type, amount };
        if (repaid_all !== undefined) loan.repaidAll = repaid_all;
        if (text) loan.text = text;
        const { body } = await new UnifiedApi(createClient()).createUnifiedLoan(loan as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_list_unified_loan_records',
    '[R] Get borrow/repay history in unified account. Requires auth.',
    {
      currency: z.string().optional(),
      type: z.string().optional().describe('borrow or repay'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ currency, type, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (type) opts.type = type;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new UnifiedApi(createClient()).listUnifiedLoanRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_list_unified_loan_interest_records',
    '[R] Get interest charge history in unified account. Requires auth.',
    {
      currency: z.string().optional(),
      type: z.string().optional().describe('Loan type'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ currency, type, from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (type) opts.type = type;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new UnifiedApi(createClient()).listUnifiedLoanInterestRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_list_currency_discount_tiers',
    '[R] List currency discount tiers for unified account collateral.',
    {},
    async () => {
      try {
        const { body } = await new UnifiedApi(createClient()).listCurrencyDiscountTiers();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_user_leverage_currency_setting',
    '[R] Get leverage settings for currencies in unified account. Requires auth.',
    { currency: z.string().optional().describe('Filter by currency') },
    async ({ currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new UnifiedApi(createClient()).getUserLeverageCurrencySetting(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_set_user_leverage_currency_setting',
    '[W] Set leverage for a currency in unified account. Requires auth. State-changing.',
    {
      currency: z.string().describe('Currency symbol e.g. BTC'),
      leverage: z.string().describe('Leverage value'),
    },
    async ({ currency, leverage }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).setUserLeverageCurrencySetting({ currency, leverage } as never);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_set_unified_collateral',
    '[W] Set collateral currencies for unified account. Requires auth. State-changing.',
    {
      collateral_type: z.union([z.literal(0), z.literal(1)]).describe('0 = all currencies as collateral; 1 = custom currencies (use enable_list/disable_list)'),
      enable_list: z.array(z.string()).optional().describe('Currencies to enable as collateral (only valid when collateral_type=1)'),
      disable_list: z.array(z.string()).optional().describe('Currencies to disable as collateral (only valid when collateral_type=1)'),
    },
    async ({ collateral_type, enable_list, disable_list }) => {
      try {
        requireAuth();
        const req: Record<string, unknown> = { collateralType: collateral_type };
        if (enable_list) req.enableList = enable_list;
        if (disable_list) req.disableList = disable_list;
        const { body } = await new UnifiedApi(createClient()).setUnifiedCollateral(req as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_transferables',
    '[R] Get transferable amounts for specified currencies in unified account. Requires auth.',
    {
      currencies: z.string().describe('Comma-separated currency symbols e.g. BTC,USDT'),
    },
    async ({ currencies }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedTransferables(currencies);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_unified_borrowable_list',
    '[R] Get borrowable amounts for a list of currencies in unified account. Requires auth.',
    {
      currencies: z.array(z.string()).describe('List of currency symbols e.g. ["BTC","USDT"]'),
    },
    async ({ currencies }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUnifiedBorrowableList(currencies);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_list_loan_margin_tiers',
    '[R] List loan margin tiers for unified account.',
    {},
    async () => {
      try {
        const { body } = await new UnifiedApi(createClient()).listLoanMarginTiers();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_user_leverage_currency_config',
    '[R] Get leverage configuration for a specific currency. Requires auth.',
    {
      currency: z.string().describe('Currency symbol e.g. BTC'),
    },
    async ({ currency }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).getUserLeverageCurrencyConfig(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_get_history_loan_rate',
    '[R] Get historical loan rates for a currency. Requires auth.',
    {
      currency: z.string().describe('Currency symbol e.g. USDT'),
      tier: z.string().optional().describe('Tier filter'),
      page: z.number().int().optional().describe('Page number'),
      limit: z.number().int().optional().describe('Max results'),
    },
    async ({ currency, tier, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (tier !== undefined) opts.tier = tier;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new UnifiedApi(createClient()).getHistoryLoanRate(currency, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_unified_calculate_portfolio_margin',
    '[W] Calculate portfolio margin for hypothetical positions. Requires auth. State-changing.',
    {
      spot_balances: z.array(z.object({
        currency: z.string(),
        equity: z.string(),
      })).optional().describe('Hypothetical spot balances'),
      spot_orders: z.array(z.object({
        currency_pairs: z.string(),
        order_price: z.string(),
        count: z.string().optional(),
        left: z.string(),
      })).optional().describe('Hypothetical spot orders'),
      futures_positions: z.array(z.object({
        contract: z.string(),
        size: z.string(),
      })).optional().describe('Hypothetical futures positions'),
      futures_orders: z.array(z.object({
        contract: z.string(),
        size: z.string(),
        left: z.string(),
      })).optional().describe('Hypothetical futures orders'),
      options_positions: z.array(z.object({
        options_name: z.string(),
        size: z.string(),
      })).optional().describe('Hypothetical options positions'),
      options_orders: z.array(z.object({
        options_name: z.string(),
        size: z.string(),
        left: z.string(),
      })).optional().describe('Hypothetical options orders'),
      spot_hedge: z.boolean().optional().describe('Whether spot hedge is enabled'),
    },
    async ({ spot_balances, spot_orders, futures_positions, futures_orders, options_positions, options_orders, spot_hedge }) => {
      try {
        requireAuth();
        const input = new UnifiedPortfolioInput();
        if (spot_balances) input.spotBalances = spot_balances.map(b => { const m = new MockSpotBalance(); m.currency = b.currency; m.equity = b.equity; return m; });
        if (spot_orders) input.spotOrders = spot_orders.map(o => { const m = new MockSpotOrder(); m.currencyPairs = o.currency_pairs; m.orderPrice = o.order_price; m.left = o.left; if (o.count) m.count = o.count; return m; });
        if (futures_positions) input.futuresPositions = futures_positions.map(p => { const m = new MockFuturesPosition(); m.contract = p.contract; m.size = p.size; return m; });
        if (futures_orders) input.futuresOrders = futures_orders.map(o => { const m = new MockFuturesOrder(); m.contract = o.contract; m.size = o.size; m.left = o.left; return m; });
        if (options_positions) input.optionsPositions = options_positions.map(p => { const m = new MockOptionsPosition(); m.optionsName = p.options_name; m.size = p.size; return m; });
        if (options_orders) input.optionsOrders = options_orders.map(o => { const m = new MockOptionsOrder(); m.optionsName = o.options_name; m.size = o.size; m.left = o.left; return m; });
        if (spot_hedge !== undefined) input.spotHedge = spot_hedge;
        const { body } = await new UnifiedApi(createClient()).calculatePortfolioMargin(input);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
