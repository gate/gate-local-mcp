import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
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

  server.tool(
    'set_debit_fee',
    'Enable or disable GT debit fee (requires authentication)',
    { enabled: z.boolean().describe('true to pay fees with GT, false to disable') },
    async ({ enabled }) => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).setDebitFee({ enabled } as never);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_account_main_keys',
    'Get main account API key info (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).getAccountMainKeys();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_stp_groups',
    'List Self-Trade Prevention (STP) groups (requires authentication)',
    { name: z.string().optional().describe('Filter by group name') },
    async ({ name }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (name) opts.name = name;
        const { body } = await new AccountApi(createClient()).listSTPGroups(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_stp_group',
    'Create a Self-Trade Prevention (STP) group (requires authentication)',
    { name: z.string().describe('STP group name') },
    async ({ name }) => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).createSTPGroup({ name } as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_stp_group_users',
    'List users in an STP group (requires authentication)',
    { stp_id: z.number().int().describe('STP group ID') },
    async ({ stp_id }) => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).listSTPGroupsUsers(stp_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'add_stp_group_users',
    'Add users to an STP group (requires authentication)',
    {
      stp_id: z.number().int().describe('STP group ID'),
      user_ids: z.array(z.number().int()).describe('List of user IDs to add'),
    },
    async ({ stp_id, user_ids }) => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).addSTPGroupUsers(stp_id, user_ids);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'delete_stp_group_user',
    'Remove a user from an STP group (requires authentication)',
    {
      stp_id: z.number().int().describe('STP group ID'),
      user_id: z.number().int().describe('User ID to remove'),
    },
    async ({ stp_id, user_id }) => {
      try {
        requireAuth();
        const { body } = await new AccountApi(createClient()).deleteSTPGroupUsers(stp_id, user_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
