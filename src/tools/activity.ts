import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { ActivityApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerActivityTools(server: McpServer): void {
  server.tool(
    'cex_activity_get_my_activity_entry',
    '[R] Get current user activity entry and participation status. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new ActivityApi(createClient()).getMyActivityEntry();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_activity_list_activities',
    '[R] List available activities with optional filters.',
    {
      recommend_type: z.string().optional().describe('Filter by recommendation type'),
      type_ids: z.string().optional().describe('Comma-separated activity type IDs to filter by'),
      keywords: z.string().optional().describe('Search keywords'),
      page: z.number().int().optional().describe('Page number (default 1)'),
      page_size: z.number().int().optional().describe('Number of results per page'),
      sort_by: z.string().optional().describe('Sort field'),
    },
    async ({ recommend_type, type_ids, keywords, page, page_size, sort_by }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (recommend_type !== undefined) opts.recommendType = recommend_type;
        if (type_ids !== undefined) opts.typeIds = type_ids;
        if (keywords !== undefined) opts.keywords = keywords;
        if (page !== undefined) opts.page = page;
        if (page_size !== undefined) opts.pageSize = page_size;
        if (sort_by !== undefined) opts.sortBy = sort_by;
        const { body } = await new ActivityApi(createClient()).listActivities(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_activity_list_activity_types',
    '[R] List all available activity types.',
    {},
    async () => {
      try {
        const { body } = await new ActivityApi(createClient()).listActivityTypes();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
