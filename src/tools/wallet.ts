import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WalletApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerWalletTools(server: McpServer): void {
  server.tool(
    'cex.wallet.get_total_balance',
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
    'cex.wallet.list_withdrawals',
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
    'cex.wallet.list_deposits',
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
    'cex.wallet.get_deposit_address',
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
    'cex.wallet.create_transfer',
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
    'cex.wallet.list_sub_account_balances',
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
    'cex.wallet.get_trade_fee',
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
    'cex.wallet.list_currency_chains',
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
    'cex.wallet.list_withdraw_status',
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
