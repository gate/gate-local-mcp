import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { EarnApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerEarnTools(server: McpServer): void {
  // ── Dual Investment ───────────────────────────────────────────────────────

  server.tool(
    'cex.earn.list_dual_investment_plans',
    'List dual investment plans',
    {
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ limit, offset }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new EarnApi(createClient()).listDualInvestmentPlans(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.earn.list_dual_orders',
    'List dual investment orders (requires authentication)',
    {
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new EarnApi(createClient()).listDualOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.earn.list_dual_balance',
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
    'cex.earn.list_structured_products',
    'List structured products',
    {
      status: z.enum(['in_progress', 'will_begin', 'waiting', 'done']).describe('Product status'),
      type: z.string().optional().describe('Product type'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ status, type, limit, offset }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (type) opts.type = type;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new EarnApi(createClient()).listStructuredProducts(status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex.earn.list_structured_orders',
    'List structured product orders (requires authentication)',
    {
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new EarnApi(createClient()).listStructuredOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
