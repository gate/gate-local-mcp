import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AlphaApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerAlphaTools(server: McpServer): void {
  // ── Public ────────────────────────────────────────────────────────────────

  server.tool(
    'cex_alpha_list_alpha_currencies',
    'List Alpha currencies.',
    {
      currency: z.string().optional().describe('Filter by currency symbol'),
      limit: z.number().int().optional().describe('Max results per page'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ currency, limit, page }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        const { body } = await new AlphaApi(createClient()).listAlphaCurrencies(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_list_alpha_tickers',
    'List Alpha tickers.',
    {
      currency: z.string().optional().describe('Filter by currency symbol'),
      limit: z.number().int().optional().describe('Max results per page'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ currency, limit, page }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        const { body } = await new AlphaApi(createClient()).listAlphaTickers(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_list_alpha_tokens',
    'List Alpha tokens.',
    {
      chain: z.string().optional().describe('Filter by blockchain network'),
      launch_platform: z.string().optional().describe('Filter by launch platform'),
      address: z.string().optional().describe('Filter by token contract address'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ chain, launch_platform, address, page }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (chain !== undefined) opts.chain = chain;
        if (launch_platform !== undefined) opts.launchPlatform = launch_platform;
        if (address !== undefined) opts.address = address;
        if (page !== undefined) opts.page = page;
        const { body } = await new AlphaApi(createClient()).listAlphaTokens(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Authenticated ─────────────────────────────────────────────────────────

  server.tool(
    'cex_alpha_list_alpha_accounts',
    'List Alpha balances.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new AlphaApi(createClient()).listAlphaAccounts();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_list_alpha_account_book',
    'List Alpha ledger entries.',
    {
      from: z.number().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional().describe('Page number'),
      limit: z.number().int().optional().describe('Max results per page'),
    },
    async ({ from, to, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (to !== undefined) opts.to = to;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new AlphaApi(createClient()).listAlphaAccountBook(from, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_list_alpha_orders',
    'List Alpha orders.',
    {
      currency: z.string().optional().describe('Filter by currency symbol'),
      side: z.string().optional().describe('Filter by order side: buy or sell'),
      status: z.number().int().optional().describe('Filter by order status'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional().describe('Max results per page'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ currency, side, status, from, to, limit, page }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (side !== undefined) opts.side = side;
        if (status !== undefined) opts.status = status;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        const { body } = await new AlphaApi(createClient()).listAlphaOrder(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_get_alpha_order',
    'Get Alpha order.',
    {
      order_id: z.string().describe('Order ID'),
    },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new AlphaApi(createClient()).getAlphaOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_quote_alpha_order',
    'Get a price quote for an Alpha order State-changing',
    {
      currency: z.string().describe('Currency symbol to trade'),
      side: z.string().describe('Order side: buy or sell'),
      amount: z.string().describe('Order amount'),
      gas_mode: z.string().optional().describe('Gas fee mode'),
      slippage: z.string().optional().describe('Allowed slippage percentage'),
    },
    async ({ currency, side, amount, gas_mode, slippage }) => {
      try {
        requireAuth();
        const { QuoteRequest } = await import('gate-api');
        const req = new QuoteRequest();
        req.currency = currency;
        req.side = side;
        req.amount = amount;
        if (gas_mode !== undefined) req.gasMode = gas_mode;
        if (slippage !== undefined) req.slippage = slippage;
        const { body } = await new AlphaApi(createClient()).quoteAlphaOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_alpha_place_alpha_order',
    'Place an Alpha order State-changing',
    {
      currency: z.string().describe('Currency symbol to trade'),
      side: z.string().describe('Order side: buy or sell'),
      amount: z.string().describe('Order amount'),
      quote_id: z.string().describe('Quote ID obtained from cex_alpha_quote_alpha_order'),
      gas_mode: z.string().optional().describe('Gas fee mode'),
      slippage: z.string().optional().describe('Allowed slippage percentage'),
    },
    async ({ currency, side, amount, quote_id, gas_mode, slippage }) => {
      try {
        requireAuth();
        const { PlaceOrderRequest } = await import('gate-api');
        const req = new PlaceOrderRequest();
        req.currency = currency;
        req.side = side;
        req.amount = amount;
        req.quoteId = quote_id;
        if (gas_mode !== undefined) req.gasMode = gas_mode;
        if (slippage !== undefined) req.slippage = slippage;
        const { body } = await new AlphaApi(createClient()).placeAlphaOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
