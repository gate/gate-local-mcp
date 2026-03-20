import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WelfareApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerWelfareTools(server: McpServer): void {
  server.tool(
    'cex_welfare_get_user_identity',
    'Get user identity and welfare eligibility status (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new WelfareApi(createClient()).getUserIdentity();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_welfare_get_beginner_task_list',
    'Get beginner task list and completion status (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new WelfareApi(createClient()).getBeginnerTaskList();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
