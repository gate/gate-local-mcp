import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SquareApi } from 'gate-api';
import { createClient } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerSquareTools(server: McpServer): void {
  server.tool(
    'cex_square_list_square_ai_search',
    '[R] Search Gate Square content using AI (posts, analysis, signals).',
    {
      keyword: z.string().optional().describe('Search keyword'),
      currency: z.string().optional().describe('Filter by currency symbol e.g. BTC'),
      time_range: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).optional().describe('Time range filter: 0=all, 1=1d, 2=7d, 3=30d'),
      sort: z.union([z.literal(0), z.literal(1)]).optional().describe('Sort order: 0=relevance, 1=time'),
      limit: z.number().int().optional().describe('Max results'),
      page: z.number().int().optional().describe('Page number'),
    },
    async ({ keyword, currency, time_range, sort, limit, page }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (keyword !== undefined) opts.keyword = keyword;
        if (currency !== undefined) opts.currency = currency;
        if (time_range !== undefined) opts.timeRange = time_range;
        if (sort !== undefined) opts.sort = sort;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        const { body } = await new SquareApi(createClient()).listSquareAiSearch(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_square_list_live_replay',
    '[R] List live stream replays from Gate Square.',
    {
      tag: z.string().optional().describe('Filter by tag'),
      coin: z.string().optional().describe('Filter by coin symbol'),
      sort: z.enum(['hot', 'new']).optional().describe('Sort order: hot or new'),
      limit: z.number().int().optional().describe('Max results'),
    },
    async ({ tag, coin, sort, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (tag !== undefined) opts.tag = tag;
        if (coin !== undefined) opts.coin = coin;
        if (sort !== undefined) opts.sort = sort;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new SquareApi(createClient()).listLiveReplay(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
