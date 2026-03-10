import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { MarginApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerMarginTools(server: McpServer): void {
  server.tool(
    'cex.margin.list_margin_accounts',
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
    'cex.margin.list_margin_account_book',
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
    'cex.margin.get_auto_repay_status',
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
    'cex.margin.set_auto_repay',
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
    'cex.margin.get_margin_transferable',
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
}
