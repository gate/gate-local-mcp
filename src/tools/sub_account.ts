import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { SubAccountApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerSubAccountTools(server: McpServer): void {

  server.tool(
    'list_sub_accounts',
    'List all sub-accounts (requires authentication)',
    { type: z.string().optional().describe('Filter by type: 0=normal, 1=pool') },
    async ({ type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (type) opts.type = type;
        const { body } = await new SubAccountApi(createClient()).listSubAccounts(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_sub_account',
    'Create a new sub-account (requires authentication) — always confirm the details with the user before calling this tool',
    {
      login_name: z.string().describe('Sub-account login name'),
      password: z.string().optional().describe('Sub-account password'),
      email: z.string().optional().describe('Sub-account email'),
      remark: z.string().optional().describe('Remark/note'),
    },
    async ({ login_name, password, email, remark }) => {
      try {
        requireAuth();
        const account: Record<string, unknown> = { loginName: login_name };
        if (password) account.password = password;
        if (email) account.email = email;
        if (remark) account.remark = remark;
        const { body } = await new SubAccountApi(createClient()).createSubAccounts(account as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_sub_account',
    'Get details of a sub-account (requires authentication)',
    { user_id: z.number().int().describe('Sub-account user ID') },
    async ({ user_id }) => {
      try {
        requireAuth();
        const { body } = await new SubAccountApi(createClient()).getSubAccount(user_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'lock_sub_account',
    'Lock a sub-account to disable login and trading (requires authentication) — always confirm with the user before calling this tool',
    { user_id: z.number().int().describe('Sub-account user ID') },
    async ({ user_id }) => {
      try {
        requireAuth();
        const { body } = await new SubAccountApi(createClient()).lockSubAccount(user_id);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'unlock_sub_account',
    'Unlock a previously locked sub-account (requires authentication) — always confirm with the user before calling this tool',
    { user_id: z.number().int().describe('Sub-account user ID') },
    async ({ user_id }) => {
      try {
        requireAuth();
        const { body } = await new SubAccountApi(createClient()).unlockSubAccount(user_id);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_sub_account_keys',
    'List API keys for a sub-account (requires authentication)',
    { user_id: z.number().int().describe('Sub-account user ID') },
    async ({ user_id }) => {
      try {
        requireAuth();
        const { body } = await new SubAccountApi(createClient()).listSubAccountKeys(user_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'get_sub_account_key',
    'Get details of a specific API key for a sub-account (requires authentication)',
    {
      user_id: z.number().int().describe('Sub-account user ID'),
      key: z.string().describe('API key'),
    },
    async ({ user_id, key }) => {
      try {
        requireAuth();
        const { body } = await new SubAccountApi(createClient()).getSubAccountKey(user_id, key);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_sub_account_keys',
    'Create API keys for a sub-account (requires authentication) — always confirm the permissions with the user before calling this tool',
    {
      user_id: z.number().int().describe('Sub-account user ID'),
      name: z.string().optional().describe('API key name/label'),
      ip_whitelist: z.array(z.string()).optional().describe('Allowed IP addresses'),
    },
    async ({ user_id, name, ip_whitelist }) => {
      try {
        requireAuth();
        const keyConfig: Record<string, unknown> = {};
        if (name) keyConfig.name = name;
        if (ip_whitelist) keyConfig.ipWhitelist = ip_whitelist;
        const { body } = await new SubAccountApi(createClient()).createSubAccountKeys(user_id, keyConfig as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'delete_sub_account_key',
    'Delete an API key from a sub-account (requires authentication) — always confirm with the user before calling this tool',
    {
      user_id: z.number().int().describe('Sub-account user ID'),
      key: z.string().describe('API key to delete'),
    },
    async ({ user_id, key }) => {
      try {
        requireAuth();
        const { body } = await new SubAccountApi(createClient()).deleteSubAccountKeys(user_id, key);
        return textContent(body ?? { success: true });
      } catch (e) { return errorContent(e); }
    }
  );
}
