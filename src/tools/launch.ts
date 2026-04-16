import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { LaunchApi, CreateOrderV4, RedeemV4 } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerLaunchTools(server: McpServer): void {
  server.tool(
    'cex_launch_list_launch_pool_projects',
    'List launch pool projects with optional filters',
    {
      status: z.number().int().optional().describe('Project status: 0=All, 1=In progress, 2=Warming up, 3=Ended, 4=In progress + Warming up'),
      mortgage_coin: z.string().optional().describe('Staking currency exact match'),
      search_coin: z.string().optional().describe('Reward currency & name fuzzy match'),
      limit_rule: z.number().int().optional().describe('Limit rule: 0=Normal pool, 1=Newbie pool'),
      sort_type: z.number().int().optional().describe('Sort type: 1=Max APR descending, 2=Max APR ascending'),
      page: z.number().int().optional().describe('Page number, starting from 1'),
      page_size: z.number().int().optional().describe('Items per page, default 10, max 30'),
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
    'Create a launch pool pledge order State-changing',
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
    'Redeem a launch pool pledge State-changing',
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
    'List launch pool pledge records.',
    {
      page: z.number().int().optional().describe('Page number, starting from 1'),
      page_size: z.number().int().optional().describe('Items per page, default 10, max 30'),
      type: z.number().int().optional().describe('Type: 1=Staking, 2=Redemption'),
      start_time: z.string().optional().describe('Start time, format: YYYY-MM-DD HH:MM:SS'),
      end_time: z.string().optional().describe('End time, format: YYYY-MM-DD HH:MM:SS'),
      coin: z.string().optional().describe('Staking currency'),
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
    'List launch pool reward records.',
    {
      page: z.number().int().optional().describe('Page number, starting from 1'),
      page_size: z.number().int().optional().describe('Items per page, default 10, max 30'),
      start_time: z.number().optional().describe('Start timestamp in seconds'),
      end_time: z.number().optional().describe('End timestamp in seconds'),
      coin: z.string().optional().describe('Reward currency'),
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

  // ── Hodler Airdrop ───────────────────────────────────────────────────────

  server.tool(
    'cex_launch_get_hodler_airdrop_project_list',
    'List Hodler airdrop projects.',
    {
      status: z.string().optional().describe('Project status filter'),
      keyword: z.string().optional().describe('Search keyword'),
      join: z.string().optional().describe('Join status filter'),
      page: z.number().int().optional().describe('Page number'),
      size: z.number().int().optional().describe('Results per page'),
    },
    async ({ status, keyword, join, page, size }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (status !== undefined) opts.status = status;
        if (keyword !== undefined) opts.keyword = keyword;
        if (join !== undefined) opts.join = join;
        if (page !== undefined) opts.page = page;
        if (size !== undefined) opts.size = size;
        const { body } = await new LaunchApi(createClient()).getHodlerAirdropProjectList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_hodler_airdrop_order',
    'Place a Hodler airdrop order. State-changing',
    {
      hodler_id: z.number().int().describe('Hodler airdrop project ID'),
    },
    async ({ hodler_id }) => {
      try {
        requireAuth();
        const { HodlerAirdropV4OrderRequest } = await import('gate-api');
        const req = new HodlerAirdropV4OrderRequest();
        req.hodlerId = hodler_id;
        const { body } = await new LaunchApi(createClient()).hodlerAirdropOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_get_hodler_airdrop_user_order_records',
    'List Hodler airdrop user order records.',
    {
      keyword: z.string().optional().describe('Search keyword'),
      start_timest: z.number().optional().describe('Start time (Unix timestamp)'),
      end_timest: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional().describe('Page number'),
      size: z.number().int().optional().describe('Results per page'),
    },
    async ({ keyword, start_timest, end_timest, page, size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (keyword !== undefined) opts.keyword = keyword;
        if (start_timest !== undefined) opts.startTimest = start_timest;
        if (end_timest !== undefined) opts.endTimest = end_timest;
        if (page !== undefined) opts.page = page;
        if (size !== undefined) opts.size = size;
        const { body } = await new LaunchApi(createClient()).getHodlerAirdropUserOrderRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_get_hodler_airdrop_user_airdrop_records',
    'List Hodler airdrop user airdrop records.',
    {
      keyword: z.string().optional().describe('Search keyword'),
      start_timest: z.number().optional().describe('Start time (Unix timestamp)'),
      end_timest: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional().describe('Page number'),
      size: z.number().int().optional().describe('Results per page'),
    },
    async ({ keyword, start_timest, end_timest, page, size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (keyword !== undefined) opts.keyword = keyword;
        if (start_timest !== undefined) opts.startTimest = start_timest;
        if (end_timest !== undefined) opts.endTimest = end_timest;
        if (page !== undefined) opts.page = page;
        if (size !== undefined) opts.size = size;
        const { body } = await new LaunchApi(createClient()).getHodlerAirdropUserAirdropRecords(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── CandyDrop ────────────────────────────────────────────────────────────

  server.tool(
    'cex_launch_get_candy_drop_activity_list_v4',
    'List CandyDrop activities.',
    {
      status: z.string().optional().describe('Activity status filter'),
      rule_name: z.string().optional().describe('Rule name filter'),
      register_status: z.string().optional().describe('Registration status filter'),
      currency: z.string().optional().describe('Currency filter'),
      limit: z.number().int().optional().describe('Results per page'),
      offset: z.number().int().optional().describe('Offset'),
    },
    async ({ status, rule_name, register_status, currency, limit, offset }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (status !== undefined) opts.status = status;
        if (rule_name !== undefined) opts.ruleName = rule_name;
        if (register_status !== undefined) opts.registerStatus = register_status;
        if (currency !== undefined) opts.currency = currency;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new LaunchApi(createClient()).getCandyDropActivityListV4(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_register_candy_drop_v4',
    'Register for a CandyDrop activity. State-changing',
    {
      activity_id: z.number().int().optional().describe('CandyDrop activity ID'),
      currency: z.string().describe('Currency symbol'),
    },
    async ({ activity_id, currency }) => {
      try {
        requireAuth();
        const { CandyDropV4RegisterReqCd02 } = await import('gate-api');
        const req = new CandyDropV4RegisterReqCd02();
        if (activity_id !== undefined) req.activityId = activity_id;
        req.currency = currency;
        const { body } = await new LaunchApi(createClient()).registerCandyDropV4(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_get_candy_drop_activity_rules_v4',
    'Get CandyDrop activity rules.',
    {
      activity_id: z.string().optional().describe('Activity ID'),
      currency: z.string().optional().describe('Currency filter'),
    },
    async ({ activity_id, currency }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (activity_id !== undefined) opts.activityId = activity_id;
        if (currency !== undefined) opts.currency = currency;
        const { body } = await new LaunchApi(createClient()).getCandyDropActivityRulesV4(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_get_candy_drop_task_progress_v4',
    'Get CandyDrop task progress.',
    {
      activity_id: z.string().optional().describe('Activity ID'),
      currency: z.string().optional().describe('Currency filter'),
    },
    async ({ activity_id, currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (activity_id !== undefined) opts.activityId = activity_id;
        if (currency !== undefined) opts.currency = currency;
        const { body } = await new LaunchApi(createClient()).getCandyDropTaskProgressV4(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_get_candy_drop_participation_records_v4',
    'List CandyDrop participation records.',
    {
      currency: z.string().optional().describe('Currency filter'),
      status: z.string().optional().describe('Status filter'),
      start_time: z.number().optional().describe('Start time (Unix timestamp)'),
      end_time: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional().describe('Page number'),
      limit: z.number().int().optional().describe('Results per page'),
    },
    async ({ currency, status, start_time, end_time, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (status !== undefined) opts.status = status;
        if (start_time !== undefined) opts.startTime = start_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new LaunchApi(createClient()).getCandyDropParticipationRecordsV4(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_launch_get_candy_drop_airdrop_records_v4',
    'List CandyDrop airdrop records.',
    {
      currency: z.string().optional().describe('Currency filter'),
      start_time: z.number().optional().describe('Start time (Unix timestamp)'),
      end_time: z.number().optional().describe('End time (Unix timestamp)'),
      page: z.number().int().optional().describe('Page number'),
      limit: z.number().int().optional().describe('Results per page'),
    },
    async ({ currency, start_time, end_time, page, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency !== undefined) opts.currency = currency;
        if (start_time !== undefined) opts.startTime = start_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new LaunchApi(createClient()).getCandyDropAirdropRecordsV4(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
