import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { UnifiedApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerUnifiedTools(server: McpServer): void {

  server.tool(
    'list_unified_accounts',
    'Get unified account balances and info (requires authentication)',
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
    'list_unified_currencies',
    'List currencies supported in unified account (requires authentication)',
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
    'get_unified_mode',
    'Get current unified account mode (requires authentication)',
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
    'set_unified_mode',
    'Switch unified account mode (requires authentication) — always confirm with the user before calling this tool',
    {
      mode: z.string().describe('Mode: classic, multi_currency, or portfolio'),
    },
    async ({ mode }) => {
      try {
        requireAuth();
        const { body } = await new UnifiedApi(createClient()).setUnifiedMode({ mode } as never);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_unified_risk_units',
    'Get risk unit details for portfolio margin mode (requires authentication)',
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
    'get_unified_borrowable',
    'Get maximum borrowable amount for a currency in unified account (requires authentication)',
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
    'get_unified_transferable',
    'Get maximum transferable amount for a currency in unified account (requires authentication)',
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
    'get_unified_estimate_rate',
    'Get estimated borrow interest rates for currencies (requires authentication)',
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
    'list_unified_loans',
    'List active loans in unified account (requires authentication)',
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
    'create_unified_loan',
    'Borrow or repay in unified account (requires authentication) — always confirm the details with the user before calling this tool',
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
    'list_unified_loan_records',
    'Get borrow/repay history in unified account (requires authentication)',
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
    'list_unified_loan_interest_records',
    'Get interest charge history in unified account (requires authentication)',
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
    'list_currency_discount_tiers',
    'List currency discount tiers for unified account collateral',
    {},
    async () => {
      try {
        const { body } = await new UnifiedApi(createClient()).listCurrencyDiscountTiers();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_user_leverage_currency_setting',
    'Get leverage settings for currencies in unified account (requires authentication)',
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
    'set_user_leverage_currency_setting',
    'Set leverage for a currency in unified account (requires authentication) — always confirm with the user before calling this tool',
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
    'set_unified_collateral',
    'Enable or disable currencies as collateral in unified account (requires authentication)',
    {
      enable_list: z.array(z.string()).optional().describe('Currencies to enable as collateral'),
      disable_list: z.array(z.string()).optional().describe('Currencies to disable as collateral'),
    },
    async ({ enable_list, disable_list }) => {
      try {
        requireAuth();
        const req: Record<string, unknown> = {};
        if (enable_list) req.enableList = enable_list;
        if (disable_list) req.disableList = disable_list;
        const { body } = await new UnifiedApi(createClient()).setUnifiedCollateral(req as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
