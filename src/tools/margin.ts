import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MarginApi, MarginMarketLeverage, MarginUniApi, CreateUniLoan } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerMarginTools(server: McpServer): void {
  server.tool(
    'cex_margin_list_margin_accounts',
    'List margin accounts (requires authentication)',
    { currency_pair: z.string().optional().describe('Filter by currency pair') },
    async ({ currency_pair }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        const { body } = await new MarginApi(createClient()).listMarginAccounts(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_margin_account_book',
    'List margin account balance change history (requires authentication)',
    {
      currency: z.string().optional(),
      currency_pair: z.string().optional(),
      type: z.string().optional().describe('Change type filter'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ currency, currency_pair, type, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (currency_pair) opts.currencyPair = currency_pair;
        if (type) opts.type = type;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new MarginApi(createClient()).listMarginAccountBook(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_auto_repay_status',
    'Get auto-repay status for margin loans (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new MarginApi(createClient()).getAutoRepayStatus();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_set_auto_repay',
    'Enable or disable auto-repay for margin loans (requires authentication) — always confirm with the user before calling this tool',
    {
      status: z.enum(['on', 'off']).describe('Auto-repay status'),
    },
    async ({ status }) => {
      try {
        requireAuth();
        const { body } = await new MarginApi(createClient()).setAutoRepay(status);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_margin_transferable',
    'Get the maximum amount transferable for a margin currency (requires authentication)',
    {
      currency: z.string().describe('Currency symbol'),
      currency_pair: z.string().optional().describe('Filter by currency pair'),
    },
    async ({ currency, currency_pair }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        const { body } = await new MarginApi(createClient()).getMarginTransferable(currency, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_funding_accounts',
    'List margin funding accounts (requires authentication)',
    { currency: z.string().optional().describe('Filter by currency') },
    async ({ currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new MarginApi(createClient()).listFundingAccounts(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_user_margin_tier',
    'Get user margin tier details for a currency pair (requires authentication)',
    { currency_pair: z.string().describe('Currency pair e.g. BTC_USDT') },
    async ({ currency_pair }) => {
      try {
        requireAuth();
        const { body } = await new MarginApi(createClient()).getUserMarginTier(currency_pair);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_set_user_market_leverage',
    'Set leverage for a margin currency pair (requires authentication) — always confirm with the user before calling this tool',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
      leverage: z.string().describe('Leverage value'),
    },
    async ({ currency_pair, leverage }) => {
      try {
        requireAuth();
        const req = new MarginMarketLeverage();
        req.currencyPair = currency_pair;
        req.leverage = leverage;
        const { body } = await new MarginApi(createClient()).setUserMarketLeverage(req);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_margin_user_account',
    'Get user margin account info (requires authentication)',
    { currency_pair: z.string().optional().describe('Filter by currency pair') },
    async ({ currency_pair }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        const { body } = await new MarginApi(createClient()).listMarginUserAccount(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_cross_margin_loans',
    'List cross-margin borrow history (requires authentication)',
    {
      status: z.number().int().describe('Loan status: 1=failed, 2=borrowed, 3=repaid'),
      currency: z.string().optional().describe('Filter by currency'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      reverse: z.boolean().optional().describe('Return results in reverse order (newest first)'),
    },
    async ({ status, currency, limit, offset, reverse }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (reverse !== undefined) opts.reverse = reverse;
        const { body } = await new MarginApi(createClient()).listCrossMarginLoans(status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_cross_margin_repayments',
    'List cross-margin repayment history (requires authentication)',
    {
      currency: z.string().optional().describe('Filter by currency'),
      loan_id: z.string().optional().describe('Filter by loan ID'),
      limit: z.number().int().min(1).max(100).optional(),
      offset: z.number().int().min(0).optional(),
      reverse: z.boolean().optional().describe('Return results in reverse order (newest first)'),
    },
    async ({ currency, loan_id, limit, offset, reverse }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (loan_id) opts.loanId = loan_id;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        if (reverse !== undefined) opts.reverse = reverse;
        const { body } = await new MarginApi(createClient()).listCrossMarginRepayments(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_uni_loans',
    'List uni margin borrow/repay records (requires authentication)',
    {
      currency_pair: z.string().optional().describe('Filter by currency pair'),
      currency: z.string().optional().describe('Filter by currency'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ currency_pair, currency, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        if (currency) opts.currency = currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new MarginUniApi(createClient()).listUniLoans(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_create_uni_loan',
    'Borrow or repay in uni margin (requires authentication) — always confirm the details with the user before calling this tool',
    {
      currency: z.string().describe('Currency to borrow/repay'),
      type: z.enum(['borrow', 'repay']).describe('Operation type'),
      amount: z.string().describe('Amount'),
      repaid_all: z.boolean().optional().describe('Repay full outstanding balance (repay only)'),
      currency_pair: z.string().optional().describe('Currency pair'),
    },
    async ({ currency, type, amount, repaid_all, currency_pair }) => {
      try {
        requireAuth();
        const req = new CreateUniLoan();
        req.currency = currency;
        req.type = type as unknown as CreateUniLoan.Type;
        req.amount = amount;
        if (repaid_all !== undefined) req.repaidAll = repaid_all;
        if (currency_pair) req.currencyPair = currency_pair;
        const { body } = await new MarginUniApi(createClient()).createUniLoan(req);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_uni_loan_records',
    'List uni margin borrow/repay history (requires authentication)',
    {
      type: z.string().optional().describe('Filter by type: borrow or repay'),
      currency: z.string().optional().describe('Filter by currency'),
      currency_pair: z.string().optional().describe('Filter by currency pair'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    },
    async ({ type, currency, currency_pair, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (type) opts.type = type;
        if (currency) opts.currency = currency;
        if (currency_pair) opts.currencyPair = currency_pair;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new MarginUniApi(createClient()).listUniLoanRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_uni_loan_interest_records',
    'List uni margin interest charge records (requires authentication)',
    {
      currency_pair: z.string().optional().describe('Filter by currency pair'),
      currency: z.string().optional().describe('Filter by currency'),
      page: z.number().int().min(1).optional(),
      limit: z.number().int().min(1).max(100).optional(),
      from: z.number().int().optional().describe('Start time (Unix timestamp seconds)'),
      to: z.number().int().optional().describe('End time (Unix timestamp seconds)'),
    },
    async ({ currency_pair, currency, page, limit, from, to }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        if (currency) opts.currency = currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        const { body } = await new MarginUniApi(createClient()).listUniLoanInterestRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_uni_borrowable',
    'Get maximum borrowable amount for a currency in uni margin (requires authentication)',
    {
      currency: z.string().describe('Currency symbol e.g. USDT'),
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
    },
    async ({ currency, currency_pair }) => {
      try {
        requireAuth();
        const { body } = await new MarginUniApi(createClient()).getUniBorrowable(currency, currency_pair);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_margin_uni_estimate_rate',
    'Get estimated borrow rates for currencies in uni margin (requires authentication)',
    { currencies: z.array(z.string()).describe('List of currencies e.g. ["BTC","USDT"]') },
    async ({ currencies }) => {
      try {
        requireAuth();
        const { body } = await new MarginUniApi(createClient()).getMarginUniEstimateRate(currencies);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_market_margin_tier',
    'Get margin leverage tiers for a currency pair',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
    },
    async ({ currency_pair }) => {
      try {
        const { body } = await new MarginApi(createClient()).getMarketMarginTier(currency_pair);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_list_uni_currency_pairs',
    'List all currency pairs supported for unified margin lending',
    {},
    async () => {
      try {
        const { body } = await new MarginUniApi(createClient()).listUniCurrencyPairs();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_margin_get_uni_currency_pair',
    'Get details of a specific unified margin currency pair',
    {
      currency_pair: z.string().describe('Currency pair e.g. BTC_USDT'),
    },
    async ({ currency_pair }) => {
      try {
        const { body } = await new MarginUniApi(createClient()).getUniCurrencyPair(currency_pair);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
