import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { WithdrawalApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerWithdrawalTools(server: McpServer): void {
  server.tool(
    'cex_withdrawal_withdraw',
    'Withdraw. If the recipient on-chain address is also Gate, no transaction fee will be charged. State-changing',
    {
      currency: z.string().describe('Currency name, e.g. USDT'),
      amount: z.string().describe('Withdrawal amount'),
      chain: z.string().describe('Blockchain network e.g. ETH, TRX'),
      address: z.string().optional().describe('Withdrawal address'),
      memo: z.string().optional().describe('Additional remarks for the withdrawal (e.g. tag, payment ID)'),
      withdraw_order_id: z.string().optional().describe('User-defined withdrawal order number for idempotent requests'),
    },
    async ({ currency, amount, chain, address, memo, withdraw_order_id }) => {
      try {
        requireAuth();
        const { LedgerRecord } = await import('gate-api');
        const req = new LedgerRecord();
        req.currency = currency;
        req.amount = amount;
        req.chain = chain;
        if (address !== undefined) req.address = address;
        if (memo !== undefined) req.memo = memo;
        if (withdraw_order_id !== undefined) req.withdrawOrderId = withdraw_order_id;
        const { body } = await new WithdrawalApi(createClient()).withdraw(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_withdrawal_withdraw_push_order',
    'UID transfer. Transfers between main spot accounts. Both parties cannot be sub-accounts. State-changing',
    {
      receive_uid: z.number().int().describe('Recipient user ID'),
      currency: z.string().describe('Currency name, e.g. USDT'),
      amount: z.string().describe('Transfer amount'),
    },
    async ({ receive_uid, currency, amount }) => {
      try {
        requireAuth();
        const { UidPushWithdrawal } = await import('gate-api');
        const req = new UidPushWithdrawal();
        req.receiveUid = receive_uid;
        req.currency = currency;
        req.amount = amount;
        const { body } = await new WithdrawalApi(createClient()).withdrawPushOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_withdrawal_cancel_withdrawal',
    'Cancel withdrawal with specified ID. State-changing',
    {
      withdrawal_id: z.string().describe('Withdrawal record ID'),
    },
    async ({ withdrawal_id }) => {
      try {
        requireAuth();
        const { body } = await new WithdrawalApi(createClient()).cancelWithdrawal(withdrawal_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
