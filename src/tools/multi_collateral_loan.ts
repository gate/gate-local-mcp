import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MultiCollateralLoanApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

const collateralCurrencySchema = z.object({
  currency: z.string().optional(),
  amount: z.string().optional(),
});

export function registerMultiCollateralLoanTools(server: McpServer): void {
  server.tool(
    'cex_multi_collateral_loan_list_multi_collateral_orders',
    'List multi-collateral loan orders (requires authentication)',
    {
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      sort: z.string().optional().describe('Sort field'),
      order_type: z.string().optional().describe('Order type filter'),
    },
    async ({ page, limit, sort, order_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        if (sort !== undefined) opts.sort = sort;
        if (order_type !== undefined) opts.orderType = order_type;
        const { body } = await new MultiCollateralLoanApi(createClient()).listMultiCollateralOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_create_multi_collateral',
    'Create a new multi-collateral loan order (requires authentication) — always confirm details with the user before calling this tool',
    {
      borrow_currency: z.string().describe('Currency to borrow e.g. USDT'),
      borrow_amount: z.string().describe('Amount to borrow'),
      order_id: z.string().optional().describe('Custom order ID'),
      order_type: z.string().optional().describe('Order type'),
      fixed_type: z.string().optional().describe('Fixed rate type'),
      fixed_rate: z.string().optional().describe('Fixed interest rate'),
      auto_renew: z.boolean().optional().describe('Auto-renew on expiry'),
      auto_repay: z.boolean().optional().describe('Auto-repay on maturity'),
      collateral_currencies: z.array(collateralCurrencySchema).optional().describe('Collateral currencies and amounts'),
    },
    async ({ borrow_currency, borrow_amount, order_id, order_type, fixed_type, fixed_rate, auto_renew, auto_repay, collateral_currencies }) => {
      try {
        requireAuth();
        const { CreateMultiCollateralOrder, CollateralCurrency } = await import('gate-api');
        const req = new CreateMultiCollateralOrder();
        req.borrowCurrency = borrow_currency;
        req.borrowAmount = borrow_amount;
        if (order_id !== undefined) req.orderId = order_id;
        if (order_type !== undefined) req.orderType = order_type;
        if (fixed_type !== undefined) req.fixedType = fixed_type;
        if (fixed_rate !== undefined) req.fixedRate = fixed_rate;
        if (auto_renew !== undefined) req.autoRenew = auto_renew;
        if (auto_repay !== undefined) req.autoRepay = auto_repay;
        if (collateral_currencies) {
          req.collateralCurrencies = collateral_currencies.map(c => {
            const cc = new CollateralCurrency();
            if (c.currency !== undefined) cc.currency = c.currency;
            if (c.amount !== undefined) cc.amount = c.amount;
            return cc;
          });
        }
        const { body } = await new MultiCollateralLoanApi(createClient()).createMultiCollateral(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_get_multi_collateral_order_detail',
    'Get details of a multi-collateral loan order (requires authentication)',
    { order_id: z.string().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new MultiCollateralLoanApi(createClient()).getMultiCollateralOrderDetail(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_list_multi_repay_records',
    'List multi-collateral loan repayment records (requires authentication)',
    {
      type: z.string().describe('Repayment type'),
      borrow_currency: z.string().optional().describe('Filter by borrow currency'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
    },
    async ({ type, borrow_currency, page, limit, from, to }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (borrow_currency !== undefined) opts.borrowCurrency = borrow_currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new MultiCollateralLoanApi(createClient()).listMultiRepayRecords(type, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_repay_multi_collateral_loan',
    'Repay a multi-collateral loan (requires authentication) — always confirm repayment details with the user before calling this tool',
    {
      order_id: z.number().int().describe('Order ID to repay'),
      repay_items: z.array(z.object({
        currency: z.string().optional().describe('Repayment currency'),
        amount: z.string().optional().describe('Repayment amount'),
        repaid_all: z.boolean().describe('Repay full outstanding balance'),
      })).describe('Repayment items'),
    },
    async ({ order_id, repay_items }) => {
      try {
        requireAuth();
        const { RepayMultiLoan, MultiLoanRepayItem } = await import('gate-api');
        const req = new RepayMultiLoan();
        req.orderId = order_id;
        req.repayItems = repay_items.map(item => {
          const r = new MultiLoanRepayItem();
          r.repaidAll = item.repaid_all;
          if (item.currency !== undefined) r.currency = item.currency;
          if (item.amount !== undefined) r.amount = item.amount;
          return r;
        });
        const { body } = await new MultiCollateralLoanApi(createClient()).repayMultiCollateralLoan(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_list_multi_collateral_records',
    'List collateral adjustment records for multi-collateral loans (requires authentication)',
    {
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      from: z.number().optional().describe('Start time (Unix timestamp in seconds)'),
      to: z.number().optional().describe('End time (Unix timestamp in seconds)'),
      collateral_currency: z.string().optional().describe('Filter by collateral currency'),
    },
    async ({ page, limit, from, to, collateral_currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (collateral_currency !== undefined) opts.collateralCurrency = collateral_currency;
        const { body } = await new MultiCollateralLoanApi(createClient()).listMultiCollateralRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_operate_multi_collateral',
    'Adjust collateral for a multi-collateral loan (requires authentication) — always confirm with the user before calling this tool',
    {
      order_id: z.number().int().describe('Order ID'),
      type: z.string().describe('Operation type: append or redeem'),
      collaterals: z.array(collateralCurrencySchema).optional().describe('Collateral currencies and amounts to adjust'),
    },
    async ({ order_id, type, collaterals }) => {
      try {
        requireAuth();
        const { CollateralAdjust, CollateralCurrency } = await import('gate-api');
        const req = new CollateralAdjust();
        req.orderId = order_id;
        req.type = type;
        if (collaterals) {
          req.collaterals = collaterals.map(c => {
            const cc = new CollateralCurrency();
            if (c.currency !== undefined) cc.currency = c.currency;
            if (c.amount !== undefined) cc.amount = c.amount;
            return cc;
          });
        }
        const { body } = await new MultiCollateralLoanApi(createClient()).operateMultiCollateral(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_list_user_currency_quota',
    'Get user quota for a specific currency in multi-collateral loans (requires authentication)',
    {
      type: z.string().describe('Quota type: borrow or collateral'),
      currency: z.string().describe('Currency symbol e.g. USDT'),
    },
    async ({ type, currency }) => {
      try {
        requireAuth();
        const { body } = await new MultiCollateralLoanApi(createClient()).listUserCurrencyQuota(type, currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_list_multi_collateral_currencies',
    'List all supported currencies for multi-collateral loans (public)',
    {},
    async () => {
      try {
        const { body } = await new MultiCollateralLoanApi(createClient()).listMultiCollateralCurrencies();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_get_multi_collateral_ltv',
    'Get LTV (Loan-to-Value) ratios for multi-collateral loans (public)',
    {},
    async () => {
      try {
        const { body } = await new MultiCollateralLoanApi(createClient()).getMultiCollateralLtv();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_get_multi_collateral_fix_rate',
    'Get available fixed interest rates for multi-collateral loans (public)',
    {},
    async () => {
      try {
        const { body } = await new MultiCollateralLoanApi(createClient()).getMultiCollateralFixRate();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_multi_collateral_loan_get_multi_collateral_current_rate',
    'Get current interest rates for specified currencies in multi-collateral loans (public)',
    {
      currencies: z.array(z.string()).describe('List of currency symbols to query rates for'),
      vip_level: z.string().optional().describe('VIP level for rate lookup'),
    },
    async ({ currencies, vip_level }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (vip_level !== undefined) opts.vipLevel = vip_level;
        const { body } = await new MultiCollateralLoanApi(createClient()).getMultiCollateralCurrentRate(currencies, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
