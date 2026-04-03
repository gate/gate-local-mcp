import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { LaunchApi, CreateOrderV4, RedeemV4 } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerLaunchTools(server: McpServer): void {
  server.tool(
    'cex_launch_list_launch_pool_projects',
    '[R] List launch pool projects with optional filters.',
    {
      status: z.number().int().optional().describe('Project status filter'),
      mortgage_coin: z.string().optional().describe('Filter by mortgage coin symbol'),
      search_coin: z.string().optional().describe('Search by coin symbol'),
      limit_rule: z.number().int().optional().describe('Limit rule filter'),
      sort_type: z.number().int().optional().describe('Sort type'),
      page: z.number().int().optional().describe('Page number'),
      page_size: z.number().int().optional().describe('Results per page'),
    },
    async ({ status, mortgage_coin, search_coin, limit_rule, sort_type, page, page_size }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (status !== undefined) opts.status = status;
        if (mortgage_coin !== undefined) opts.mortgageCoin = mortgage_coin;
        if (search_coin !== undefined) opts.searchCoin = search_coin;
        if (limit_rule !== undefined) opts.limitRule = limit_rule;
        if (sort_type !== undefined) opts.sortType = sort_type;
        if (page !== undefined) opts.page = page;
        if (page_size !== undefined) opts.pageSize = page_size;
        const { body } = await new LaunchApi(createClient()).listLaunchPoolProjects(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_create_launch_pool_order',
    '[W] Create a launch pool pledge order. Requires auth. State-changing.',
    {
      pid: z.number().int().describe('Project ID'),
      rid: z.number().int().describe('Rule ID'),
      amount: z.string().describe('Pledge amount'),
    },
    async ({ pid, rid, amount }) => {
      try {
        requireAuth();
        const req = new CreateOrderV4();
        req.pid = pid;
        req.rid = rid;
        req.amount = amount;
        const { body } = await new LaunchApi(createClient()).createLaunchPoolOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_redeem_launch_pool',
    '[W] Redeem a launch pool pledge. Requires auth. State-changing.',
    {
      pid: z.number().int().describe('Project ID'),
      rid: z.number().int().describe('Rule ID'),
      amount: z.string().describe('Redeem amount'),
    },
    async ({ pid, rid, amount }) => {
      try {
        requireAuth();
        const req = new RedeemV4();
        req.pid = pid;
        req.rid = rid;
        req.amount = amount;
        const { body } = await new LaunchApi(createClient()).redeemLaunchPool(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_list_launch_pool_pledge_records',
    '[R] List launch pool pledge records. Requires auth.',
    {
      page: z.number().int().optional().describe('Page number'),
      page_size: z.number().int().optional().describe('Results per page'),
      type: z.number().int().optional().describe('Record type filter'),
      start_time: z.string().optional().describe('Start time (ISO 8601 or Unix timestamp string)'),
      end_time: z.string().optional().describe('End time (ISO 8601 or Unix timestamp string)'),
      coin: z.string().optional().describe('Filter by coin symbol'),
    },
    async ({ page, page_size, type, start_time, end_time, coin }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page !== undefined) opts.page = page;
        if (page_size !== undefined) opts.pageSize = page_size;
        if (type !== undefined) opts.type = type;
        if (start_time !== undefined) opts.startTime = start_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (coin !== undefined) opts.coin = coin;
        const { body } = await new LaunchApi(createClient()).listLaunchPoolPledgeRecords(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_list_launch_pool_reward_records',
    '[R] List launch pool reward records. Requires auth.',
    {
      page: z.number().int().optional().describe('Page number'),
      page_size: z.number().int().optional().describe('Results per page'),
      start_time: z.number().optional().describe('Start time (Unix timestamp)'),
      end_time: z.number().optional().describe('End time (Unix timestamp)'),
      coin: z.string().optional().describe('Filter by coin symbol'),
    },
    async ({ page, page_size, start_time, end_time, coin }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (page !== undefined) opts.page = page;
        if (page_size !== undefined) opts.pageSize = page_size;
        if (start_time !== undefined) opts.startTime = start_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (coin !== undefined) opts.coin = coin;
        const { body } = await new LaunchApi(createClient()).listLaunchPoolRewardRecords(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
