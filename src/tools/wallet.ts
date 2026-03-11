import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WalletApi, SubAccountTransfer, SubAccountToSubAccount } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerWalletTools(server: McpServer): void {
  server.tool(
    'cex_wallet_get_total_balance',
    'Get total account balance across all wallets (requires authentication)',
    {
      currency: z.string().optional().describe('Quote currency for conversion (default: USDT)'),
    },
    async ({ currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new WalletApi(createClient()).getTotalBalance(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_list_withdrawals',
    'List withdrawal history (requires authentication)',
    {
      currency: z.string().optional().describe('Filter by currency'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ currency, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new WalletApi(createClient()).listWithdrawals(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_list_deposits',
    'List deposit history (requires authentication)',
    {
      currency: z.string().optional().describe('Filter by currency'),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ currency, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new WalletApi(createClient()).listDeposits(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_get_deposit_address',
    'Get deposit address for a currency (requires authentication)',
    { currency: z.string().describe('Currency symbol e.g. USDT') },
    async ({ currency }) => {
      try {
        requireAuth();
        const { body } = await new WalletApi(createClient()).getDepositAddress(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_create_transfer',
    'Transfer funds between accounts (requires authentication) — always confirm the amount, source, and destination with the user before calling this tool',
    {
      currency: z.string().describe('Currency to transfer'),
      from: z.enum(['spot', 'margin', 'futures', 'delivery', 'options']).describe('Source account'),
      to: z.enum(['spot', 'margin', 'futures', 'delivery', 'options']).describe('Destination account'),
      amount: z.string().describe('Transfer amount'),
      currency_pair: z.string().optional().describe('Required for margin account transfers'),
      settle: z.string().optional().describe('Required for futures account transfers'),
    },
    async ({ currency, from, to, amount, currency_pair, settle }) => {
      try {
        requireAuth();
        const transfer: Record<string, unknown> = { currency, from, to, amount };
        if (currency_pair) transfer.currencyPair = currency_pair;
        if (settle) transfer.settle = settle;
        const { body } = await new WalletApi(createClient()).transfer(transfer as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_list_sub_account_balances',
    'List sub-account balances (requires authentication)',
    { sub_uid: z.string().optional().describe('Filter by sub-account UID') },
    async ({ sub_uid }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (sub_uid) opts.subUid = sub_uid;
        const { body } = await new WalletApi(createClient()).listSubAccountBalances(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_get_wallet_fee',
    'Get trading fee rates (requires authentication)',
    {
      currency_pair: z.string().optional().describe('Filter by currency pair'),
      settle: z.enum(['BTC', 'USDT', 'USD']).optional().describe('Futures settlement currency'),
    },
    async ({ currency_pair, settle }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency_pair) opts.currencyPair = currency_pair;
        if (settle) opts.settle = settle;
        const { body } = await new WalletApi(createClient()).getTradeFee(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_create_sub_account_transfer',
    'Transfer between main account and sub-account (requires authentication) — always confirm the amount with the user before calling this tool',
    {
      sub_account: z.string().describe('Sub-account user ID'),
      currency: z.string().describe('Currency name e.g. USDT'),
      amount: z.string().describe('Transfer amount'),
      direction: z.enum(['to', 'from']).describe('to: transfer to sub-account; from: transfer from sub-account'),
      sub_account_type: z.string().optional().describe('Sub-account trading account type: spot/futures/delivery/options'),
      client_order_id: z.string().optional().describe('Custom client order ID to prevent duplicate transfers'),
    },
    async ({ sub_account, currency, amount, direction, sub_account_type, client_order_id }) => {
      try {
        requireAuth();
        const transfer = new SubAccountTransfer();
        transfer.subAccount = sub_account;
        transfer.currency = currency;
        transfer.amount = amount;
        transfer.direction = direction;
        if (sub_account_type) transfer.subAccountType = sub_account_type;
        if (client_order_id) transfer.clientOrderId = client_order_id;
        const { body } = await new WalletApi(createClient()).transferWithSubAccount(transfer);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_create_sub_account_to_sub_account_transfer',
    'Transfer between two sub-accounts under the same main account (requires authentication) — always confirm the amount with the user before calling this tool',
    {
      currency: z.string().describe('Currency name e.g. USDT'),
      sub_account_from: z.string().describe('Source sub-account user ID'),
      sub_account_from_type: z.string().describe('Source sub-account type: spot/futures/delivery'),
      sub_account_to: z.string().describe('Target sub-account user ID'),
      sub_account_to_type: z.string().describe('Target sub-account type: spot/futures/delivery'),
      amount: z.string().describe('Transfer amount'),
    },
    async ({ currency, sub_account_from, sub_account_from_type, sub_account_to, sub_account_to_type, amount }) => {
      try {
        requireAuth();
        const transfer = new SubAccountToSubAccount();
        transfer.currency = currency;
        transfer.subAccountFrom = sub_account_from;
        transfer.subAccountFromType = sub_account_from_type;
        transfer.subAccountTo = sub_account_to;
        transfer.subAccountToType = sub_account_to_type;
        transfer.amount = amount;
        const { body } = await new WalletApi(createClient()).subAccountToSubAccount(transfer);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_get_transfer_order_status',
    'Query main-sub account transfer status (requires authentication)',
    {
      client_order_id: z.string().optional().describe('Client specified custom ID'),
      tx_id: z.string().optional().describe('Transaction ID returned by the transfer API'),
    },
    async ({ client_order_id, tx_id }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (client_order_id) opts.clientOrderId = client_order_id;
        if (tx_id) opts.txId = tx_id;
        const { body } = await new WalletApi(createClient()).getTransferOrderStatus(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_list_currency_chains',
    'List chains supported for a currency',
    { currency: z.string().describe('Currency symbol e.g. USDT') },
    async ({ currency }) => {
      try {
        const { body } = await new WalletApi(createClient()).listCurrencyChains(currency);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_wallet_list_withdraw_status',
    'Get withdrawal status for all currencies (requires authentication)',
    { currency: z.string().optional().describe('Filter by currency') },
    async ({ currency }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new WalletApi(createClient()).listWithdrawStatus(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
