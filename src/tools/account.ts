import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { AccountApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerAccountTools(server: McpServer): void {
  server.tool(
    'get_account_detail',
    'Get account profile and configuration (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).getAccountDetail();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_account_rate_limit',
    'Get account API rate limit information (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).getAccountRateLimit();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_debit_fee',
    'Get debit fee configuration (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).getDebitFee();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
