import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { EarnApi, EarnUniApi, FixedTermLendRequest, InlineObject } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerEarnTools(server: McpServer): void {
  // ── Dual Investment ───────────────────────────────────────────────────────

  server.tool(
    'cex_earn_list_dual_investment_plans',
    'List dual investment plans',
    {
      plan_id: z.number().int().optional().describe('Filter by plan ID'),
    },
    async ({ plan_id }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (plan_id !== undefined) opts.planId = plan_id;
        const { body } = await new EarnApi(createClient()).listDualInvestmentPlans(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_dual_orders',
    'List dual investment orders (requires authentication)',
    {
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
    },
    async ({ from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new EarnApi(createClient()).listDualOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_dual_balance',
    'Get dual investment balance (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new EarnApi(createClient()).listDualBalance();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Structured Products ───────────────────────────────────────────────────

  server.tool(
    'cex_earn_list_structured_products',
    'List structured products',
    {
      status: z.enum(['in_progress', 'will_begin', 'waiting', 'done']).describe('Product status'),
      type: z.string().optional().describe('Product type'),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
    },
    async ({ status, type, page, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (type) opts.type = type;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new EarnApi(createClient()).listStructuredProducts(status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_structured_orders',
    'List structured product orders (requires authentication)',
    {
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
    },
    async ({ from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new EarnApi(createClient()).listStructuredOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_place_structured_order',
    'Purchase a structured product (requires authentication)',
    {
      pid: z.string().optional().describe('Product ID'),
      amount: z.string().optional().describe('Investment amount'),
    },
    async ({ pid, amount }) => {
      try {
        requireAuth();
        const { StructuredBuy } = await import('gate-api');
        const order = new StructuredBuy();
        if (pid !== undefined) order.pid = pid;
        if (amount !== undefined) order.amount = amount;
        const { body } = await new EarnApi(createClient()).placeStructuredOrder(order);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Staking ───────────────────────────────────────────────────────────────

  server.tool(
    'cex_earn_find_coin',
    'Search for staking coins',
    {
      cointype: z.string().optional().describe('Coin type filter'),
    },
    async ({ cointype }) => {
      try {
        const { FindCoin } = await import('gate-api');
        const req = new FindCoin();
        if (cointype !== undefined) req.cointype = cointype;
        const { body } = await new EarnApi(createClient()).findCoin(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_order_list',
    'List staking orders (requires authentication)',
    {
      pid: z.number().int().optional().describe('Product ID'),
      coin: z.string().optional().describe('Coin name'),
      type: z.number().int().optional().describe('Order type'),
      page: z.number().int().optional(),
    },
    async ({ pid, coin, type, page }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (pid !== undefined) opts.pid = pid;
        if (coin !== undefined) opts.coin = coin;
        if (type !== undefined) opts.type = type;
        if (page !== undefined) opts.page = page;
        const { body } = await new EarnApi(createClient()).orderList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_award_list',
    'List staking awards (requires authentication)',
    {
      pid: z.number().int().optional().describe('Product ID'),
      coin: z.string().optional().describe('Coin name'),
      page: z.number().int().optional(),
    },
    async ({ pid, coin, page }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (pid !== undefined) opts.pid = pid;
        if (coin !== undefined) opts.coin = coin;
        if (page !== undefined) opts.page = page;
        const { body } = await new EarnApi(createClient()).awardList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_asset_list',
    'List staking assets (requires authentication)',
    {
      coin: z.string().optional().describe('Coin name filter'),
    },
    async ({ coin }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (coin !== undefined) opts.coin = coin;
        const { body } = await new EarnApi(createClient()).assetList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Earn Uni (Simple Earn) ─────────────────────────────────────────────────

  server.tool(
    'cex_earn_list_uni_currencies',
    'List currencies available for Simple Earn lending',
    {},
    async () => {
      try {
        const { body } = await new EarnUniApi(createClient()).listUniCurrencies();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_get_uni_currency',
    'Get details of a Simple Earn lending currency',
    {
      currency: z.string().describe('Currency name'),
    },
    async ({ currency }) => {
      try {
        const { body } = await new EarnUniApi(createClient()).getUniCurrency(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_user_uni_lends',
    'List user Simple Earn lending records (requires authentication)',
    {
      currency: z.string().optional(),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
    },
    async ({ currency, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new EarnUniApi(createClient()).listUserUniLends(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_create_uni_lend',
    'Create a Simple Earn lending order (requires authentication)',
    {
      currency: z.string().describe('Currency to lend'),
      amount: z.string().describe('Amount to lend'),
      type: z.enum(['lend', 'redeem']).describe('lend or redeem'),
      min_rate: z.string().optional().describe('Minimum lending rate'),
    },
    async ({ currency, amount, type, min_rate }) => {
      try {
        requireAuth();
        const { CreateUniLend } = await import('gate-api');
        const req = new CreateUniLend();
        req.currency = currency;
        req.amount = amount;
        req.type = type === 'lend' ? CreateUniLend.Type.Lend : CreateUniLend.Type.Redeem;
        if (min_rate !== undefined) req.minRate = min_rate;
        const { body } = await new EarnUniApi(createClient()).createUniLend(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_change_uni_lend',
    'Modify a Simple Earn lending order (requires authentication)',
    {
      currency: z.string().optional().describe('Currency'),
      min_rate: z.string().optional().describe('New minimum lending rate'),
    },
    async ({ currency, min_rate }) => {
      try {
        requireAuth();
        const { PatchUniLend } = await import('gate-api');
        const req = new PatchUniLend();
        if (currency !== undefined) req.currency = currency;
        if (min_rate !== undefined) req.minRate = min_rate;
        const { body } = await new EarnUniApi(createClient()).changeUniLend(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_uni_lend_records',
    'List Simple Earn lending history (requires authentication)',
    {
      currency: z.string().optional(),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      type: z.enum(['lend', 'redeem']).optional(),
    },
    async ({ currency, page, limit, from, to, type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (type !== undefined) opts.type = type;
        const { body } = await new EarnUniApi(createClient()).listUniLendRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_get_uni_interest',
    'Get Simple Earn interest for a currency (requires authentication)',
    {
      currency: z.string().describe('Currency name'),
    },
    async ({ currency }) => {
      try {
        requireAuth();
        const { body } = await new EarnUniApi(createClient()).getUniInterest(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_uni_interest_records',
    'List Simple Earn interest history (requires authentication)',
    {
      currency: z.string().optional(),
      page: z.number().int().optional(),
      limit: z.number().int().optional(),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
    },
    async ({ currency, page, limit, from, to }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new EarnUniApi(createClient()).listUniInterestRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_get_uni_interest_status',
    'Get Simple Earn interest reinvestment status for a currency (requires authentication)',
    {
      currency: z.string().describe('Currency name'),
    },
    async ({ currency }) => {
      try {
        requireAuth();
        const { body } = await new EarnUniApi(createClient()).getUniInterestStatus(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_uni_chart',
    'Get Simple Earn lending rate chart data',
    {
      from: z.number().describe('Start time (Unix timestamp)'),
      to: z.number().describe('End time (Unix timestamp)'),
      asset: z.string().describe('Asset name'),
    },
    async ({ from, to, asset }) => {
      try {
        const { body } = await new EarnUniApi(createClient()).listUniChart(from, to, asset);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_uni_rate',
    'Get Simple Earn current lending rates for all currencies',
    {},
    async () => {
      try {
        const { body } = await new EarnUniApi(createClient()).listUniRate();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_place_dual_order',
    'Place a dual investment order (requires authentication)',
    {
      plan_id: z.string().describe('Plan ID'),
      amount: z.string().describe('Investment amount'),
      text: z.string().optional().describe('Custom order comment'),
    },
    async ({ plan_id, amount, text }) => {
      try {
        requireAuth();
        const { PlaceDualInvestmentOrderParams } = await import('gate-api');
        const params = new PlaceDualInvestmentOrderParams();
        params.planId = plan_id;
        params.amount = amount;
        if (text !== undefined) params.text = text;
        const { body } = await new EarnApi(createClient()).placeDualOrder(params);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_swap_staking_coin',
    'Swap staking coins (requires authentication)',
    {
      coin: z.string().describe('Coin name'),
      side: z.number().int().describe('1 = stake, 2 = redeem'),
      amount: z.string().describe('Amount'),
      pid: z.number().int().optional().describe('Product ID'),
    },
    async ({ coin, side, amount, pid }) => {
      try {
        requireAuth();
        const { SwapCoin } = await import('gate-api');
        const req = new SwapCoin();
        req.coin = coin;
        req.side = side;
        req.amount = amount;
        if (pid !== undefined) req.pid = pid;
        const { body } = await new EarnApi(createClient()).swapStakingCoin(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Fixed-Term ────────────────────────────────────────────────────────────

  server.tool(
    'cex_earn_list_earn_fixed_term_products',
    'List fixed-term earn products',
    {
      page: z.number().int().describe('Page number'),
      limit: z.number().int().describe('Results per page'),
      asset: z.string().optional().describe('Filter by asset symbol e.g. USDT'),
      type: z.number().int().optional().describe('Product type filter'),
    },
    async ({ page, limit, asset, type }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (asset !== undefined) opts.asset = asset;
        if (type !== undefined) opts.type = type;
        const { body } = await new EarnApi(createClient()).listEarnFixedTermProducts(page, limit, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_earn_fixed_term_products_by_asset',
    'List fixed-term earn products for a specific asset',
    {
      asset: z.string().describe('Asset symbol e.g. USDT'),
      type: z.string().optional().describe('Product type filter'),
    },
    async ({ asset, type }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (type !== undefined) opts.type = type;
        const { body } = await new EarnApi(createClient()).listEarnFixedTermProductsByAsset(asset, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_earn_fixed_term_lends',
    'List fixed-term earn lend orders (requires authentication)',
    {
      order_type: z.string().describe('Order type filter'),
      page: z.number().int().describe('Page number'),
      limit: z.number().int().describe('Results per page'),
      product_id: z.number().int().optional().describe('Filter by product ID'),
      order_id: z.number().int().optional().describe('Filter by order ID'),
      asset: z.string().optional().describe('Filter by asset symbol'),
      sub_business: z.number().int().optional().describe('Sub-business type filter'),
      business_filter: z.string().optional().describe('Business filter string'),
    },
    async ({ order_type, page, limit, product_id, order_id, asset, sub_business, business_filter }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (product_id !== undefined) opts.productId = product_id;
        if (order_id !== undefined) opts.orderId = order_id;
        if (asset !== undefined) opts.asset = asset;
        if (sub_business !== undefined) opts.subBusiness = sub_business;
        if (business_filter !== undefined) opts.businessFilter = business_filter;
        const { body } = await new EarnApi(createClient()).listEarnFixedTermLends(order_type, page, limit, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_create_earn_fixed_term_lend',
    'Create a fixed-term earn lend order (requires authentication)',
    {
      product_id: z.number().int().describe('Product ID to lend into'),
      amount: z.string().describe('Lend amount'),
      year_rate: z.string().optional().describe('Target annual rate'),
      reinvest_status: z.number().int().optional().describe('Auto-reinvest flag'),
      redeem_account_type: z.number().int().optional().describe('Redemption account type'),
      financial_rate_id: z.number().int().optional().describe('Financial rate ID'),
      sub_business: z.number().int().optional().describe('Sub-business type'),
    },
    async ({ product_id, amount, year_rate, reinvest_status, redeem_account_type, financial_rate_id, sub_business }) => {
      try {
        requireAuth();
        const req = new FixedTermLendRequest();
        req.productId = product_id;
        req.amount = amount;
        if (year_rate !== undefined) req.yearRate = year_rate;
        if (reinvest_status !== undefined) req.reinvestStatus = reinvest_status;
        if (redeem_account_type !== undefined) req.redeemAccountType = redeem_account_type;
        if (financial_rate_id !== undefined) req.financialRateId = financial_rate_id;
        if (sub_business !== undefined) req.subBusiness = sub_business;
        const { body } = await new EarnApi(createClient()).createEarnFixedTermLend({ fixedTermLendRequest: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_create_earn_fixed_term_pre_redeem',
    'Pre-redeem a fixed-term earn order (requires authentication)',
    {
      order_id: z.string().describe('Order ID to pre-redeem'),
    },
    async ({ order_id }) => {
      try {
        requireAuth();
        const req = new InlineObject();
        req.orderId = order_id;
        const { body } = await new EarnApi(createClient()).createEarnFixedTermPreRedeem({ inlineObject: req });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_earn_list_earn_fixed_term_history',
    'List fixed-term earn order history (requires authentication)',
    {
      type: z.string().describe('History type filter'),
      page: z.number().int().describe('Page number'),
      limit: z.number().int().describe('Results per page'),
      product_id: z.number().int().optional().describe('Filter by product ID'),
      order_id: z.string().optional().describe('Filter by order ID'),
      asset: z.string().optional().describe('Filter by asset symbol'),
      start_at: z.number().optional().describe('Start time (Unix timestamp)'),
      end_at: z.number().optional().describe('End time (Unix timestamp)'),
      sub_business: z.number().int().optional().describe('Sub-business type filter'),
      business_filter: z.string().optional().describe('Business filter string'),
    },
    async ({ type, page, limit, product_id, order_id, asset, start_at, end_at, sub_business, business_filter }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (product_id !== undefined) opts.productId = product_id;
        if (order_id !== undefined) opts.orderId = order_id;
        if (asset !== undefined) opts.asset = asset;
        if (start_at !== undefined) opts.startAt = start_at;
        if (end_at !== undefined) opts.endAt = end_at;
        if (sub_business !== undefined) opts.subBusiness = sub_business;
        if (business_filter !== undefined) opts.businessFilter = business_filter;
        const { body } = await new EarnApi(createClient()).listEarnFixedTermHistory(type, page, limit, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
