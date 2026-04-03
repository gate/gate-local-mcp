import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { RebateApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerRebateTools(server: McpServer): void {
  server.tool(
    'cex_rebate_partner_transaction_history',
    '[R] Get partner rebate transaction history. Requires auth.',
    {
      currency_pair: z.string().optional().describe('Filter by currency pair e.g. BTC_USDT'),
      user_id: z.number().int().optional().describe('Filter by sub-user ID'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional().describe('Max results per page (default 100, max 100)'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ currency_pair, user_id, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair !== undefined) opts.currencyPair = currency_pair;
        if (user_id !== undefined) opts.userId = user_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new RebateApi(createClient()).partnerTransactionHistory(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_partner_commissions_history',
    '[R] Get partner rebate commission history. Requires auth.',
    {
      currency: z.string().optional().describe('Filter by currency symbol'),
      user_id: z.number().int().optional().describe('Filter by sub-user ID'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional().describe('Max results per page (default 100, max 100)'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ currency, user_id, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (user_id !== undefined) opts.userId = user_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new RebateApi(createClient()).partnerCommissionsHistory(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_partner_sub_list',
    '[R] Get list of partner sub-users. Requires auth.',
    {
      user_id: z.number().int().optional().describe('Filter by sub-user ID'),
      limit: z.number().int().optional().describe('Max results per page (default 100, max 100)'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ user_id, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (user_id !== undefined) opts.userId = user_id;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new RebateApi(createClient()).partnerSubList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_broker_commission_history',
    '[R] Get broker rebate commission history. Requires auth.',
    {
      user_id: z.number().int().optional().describe('Filter by sub-user ID'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional().describe('Max results per page (default 100, max 100)'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ user_id, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (user_id !== undefined) opts.userId = user_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new RebateApi(createClient()).rebateBrokerCommissionHistory(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_broker_transaction_history',
    '[R] Get broker rebate transaction history. Requires auth.',
    {
      user_id: z.number().int().optional().describe('Filter by sub-user ID'),
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      limit: z.number().int().optional().describe('Max results per page (default 100, max 100)'),
      offset: z.number().int().optional().describe('Pagination offset'),
    },
    async ({ user_id, from, to, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (user_id !== undefined) opts.userId = user_id;
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new RebateApi(createClient()).rebateBrokerTransactionHistory(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_user_info',
    '[R] Get rebate user info. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new RebateApi(createClient()).rebateUserInfo();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_get_partner_application_recent',
    '[R] Get most recent partner application status. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new RebateApi(createClient()).getPartnerApplicationRecent();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_get_partner_eligibility',
    '[R] Check partner eligibility status. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new RebateApi(createClient()).getPartnerEligibility();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_user_sub_relation',
    '[R] Query the relationship between users and their referrers. Requires auth.',
    {
      user_id_list: z.string().describe('Comma-separated list of user IDs to query'),
    },
    async ({ user_id_list }) => {
      try {
        requireAuth();
        const { body } = await new RebateApi(createClient()).userSubRelation(user_id_list);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_rebate_get_partner_agent_data_aggregated',
    '[R] Get aggregated partner agent data. Requires auth.',
    {
      start_date: z.string().optional().describe('Start date e.g. 2024-01-01'),
      end_date: z.string().optional().describe('End date e.g. 2024-01-31'),
      business_type: z.number().int().optional().describe('Business type filter (0-8)'),
    },
    async ({ start_date, end_date, business_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (start_date !== undefined) opts.startDate = start_date;
        if (end_date !== undefined) opts.endDate = end_date;
        if (business_type !== undefined) opts.businessType = business_type;
        const { body } = await new RebateApi(createClient()).getPartnerAgentDataAggregated(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
