import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { P2PApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerP2PTools(server: McpServer): void {
  // ── Account ───────────────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_get_user_info',
    'Get P2P merchant account info for the authenticated user (requires authentication)',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new P2PApi(createClient()).p2pMerchantAccountGetUserInfo();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_counterparty_user_info',
    'Get P2P merchant info for a counterparty by their user ID (requires authentication)',
    {
      biz_uid: z.string().describe('Counterparty user ID'),
    },
    async ({ biz_uid }) => {
      try {
        requireAuth();
        const { body } = await new P2PApi(createClient()).p2pMerchantAccountGetCounterpartyUserInfo(biz_uid);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_myself_payment',
    'Get available payment methods for the authenticated P2P merchant (requires authentication)',
    {
      fiat: z.string().optional().describe('Filter by fiat currency e.g. USD'),
    },
    async ({ fiat }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (fiat !== undefined) opts.fiat = fiat;
        const { body } = await new P2PApi(createClient()).p2pMerchantAccountGetMyselfPayment(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Transactions ──────────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_get_pending_transactions',
    'List pending P2P transactions (requires authentication)',
    {
      crypto_currency: z.string().describe('Crypto currency e.g. USDT'),
      fiat_currency: z.string().describe('Fiat currency e.g. USD'),
      order_tab: z.string().optional().describe('Order tab filter'),
      select_type: z.string().optional().describe('Selection type filter'),
      status: z.string().optional().describe('Transaction status filter'),
      txid: z.number().int().optional().describe('Filter by transaction ID'),
      start_time: z.number().optional().describe('Start time (Unix timestamp in milliseconds)'),
      end_time: z.number().optional().describe('End time (Unix timestamp in milliseconds)'),
    },
    async ({ crypto_currency, fiat_currency, order_tab, select_type, status, txid, start_time, end_time }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (order_tab !== undefined) opts.orderTab = order_tab;
        if (select_type !== undefined) opts.selectType = select_type;
        if (status !== undefined) opts.status = status;
        if (txid !== undefined) opts.txid = txid;
        if (start_time !== undefined) opts.startTime = start_time;
        if (end_time !== undefined) opts.endTime = end_time;
        const { body } = await new P2PApi(createClient()).p2pMerchantTransactionGetPendingTransactionList(crypto_currency, fiat_currency, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_completed_transactions',
    'List completed P2P transactions (requires authentication)',
    {
      crypto_currency: z.string().describe('Crypto currency e.g. USDT'),
      fiat_currency: z.string().describe('Fiat currency e.g. USD'),
      select_type: z.string().optional().describe('Selection type filter'),
      status: z.string().optional().describe('Transaction status filter'),
      txid: z.number().int().optional().describe('Filter by transaction ID'),
      start_time: z.number().optional().describe('Start time (Unix timestamp in milliseconds)'),
      end_time: z.number().optional().describe('End time (Unix timestamp in milliseconds)'),
      query_dispute: z.number().int().optional().describe('Filter by dispute status'),
      page: z.number().int().min(1).optional(),
      per_page: z.number().int().min(1).optional(),
    },
    async ({ crypto_currency, fiat_currency, select_type, status, txid, start_time, end_time, query_dispute, page, per_page }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (select_type !== undefined) opts.selectType = select_type;
        if (status !== undefined) opts.status = status;
        if (txid !== undefined) opts.txid = txid;
        if (start_time !== undefined) opts.startTime = start_time;
        if (end_time !== undefined) opts.endTime = end_time;
        if (query_dispute !== undefined) opts.queryDispute = query_dispute;
        if (page !== undefined) opts.page = page;
        if (per_page !== undefined) opts.perPage = per_page;
        const { body } = await new P2PApi(createClient()).p2pMerchantTransactionGetCompletedTransactionList(crypto_currency, fiat_currency, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_transaction_details',
    'Get details of a specific P2P transaction (requires authentication)',
    {
      txid: z.number().int().describe('Transaction ID'),
      channel: z.string().optional().describe('Channel filter'),
    },
    async ({ txid, channel }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (channel !== undefined) opts.channel = channel;
        const { body } = await new P2PApi(createClient()).p2pMerchantTransactionGetTransactionDetails(txid, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_confirm_payment',
    'Confirm payment for a P2P transaction (requires authentication) — always confirm with the user before calling this tool',
    {
      trade_id: z.string().describe('Trade ID'),
      payment_method: z.string().describe('Payment method used'),
    },
    async ({ trade_id, payment_method }) => {
      try {
        requireAuth();
        const { InlineObject10 } = await import('gate-api');
        const payload = new InlineObject10();
        payload.tradeId = trade_id;
        payload.paymentMethod = payment_method;
        const { body } = await new P2PApi(createClient()).p2pMerchantTransactionConfirmPayment({ inlineObject10: payload });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_confirm_receipt',
    'Confirm receipt of payment for a P2P transaction (requires authentication) — always confirm with the user before calling this tool',
    {
      trade_id: z.string().describe('Trade ID'),
    },
    async ({ trade_id }) => {
      try {
        requireAuth();
        const { InlineObject11 } = await import('gate-api');
        const payload = new InlineObject11();
        payload.tradeId = trade_id;
        const { body } = await new P2PApi(createClient()).p2pMerchantTransactionConfirmReceipt({ inlineObject11: payload });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_cancel_transaction',
    'Cancel a P2P transaction (requires authentication) — always confirm with the user before calling this tool',
    {
      trade_id: z.string().describe('Trade ID'),
      reason_id: z.string().describe('Cancellation reason ID'),
      reason_memo: z.string().describe('Cancellation reason memo'),
    },
    async ({ trade_id, reason_id, reason_memo }) => {
      try {
        requireAuth();
        const { InlineObject12 } = await import('gate-api');
        const payload = new InlineObject12();
        payload.tradeId = trade_id;
        payload.reasonId = reason_id;
        payload.reasonMemo = reason_memo;
        const { body } = await new P2PApi(createClient()).p2pMerchantTransactionCancel({ inlineObject12: payload });
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Ads / Order Book ──────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_place_ad_order',
    'Place a P2P advertisement order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      currency_type: z.string().describe('Crypto currency e.g. USDT'),
      exchange_type: z.string().describe('Fiat currency e.g. USD'),
      type: z.string().describe('Trade type: buy or sell'),
      unit_price: z.string().describe('Price per unit'),
      number: z.string().describe('Total quantity to trade'),
      min_amount: z.string().describe('Minimum order amount'),
      max_amount: z.string().describe('Maximum order amount'),
      pay_type: z.string().optional().describe('Payment type'),
      pay_type_json: z.string().optional().describe('Payment type JSON'),
      rate_fixed: z.string().optional().describe('Fixed rate flag'),
      oid: z.string().optional().describe('External order ID'),
      tier_limit: z.string().optional().describe('Tier limit'),
      verified_limit: z.string().optional().describe('KYC verification requirement'),
      reg_time_limit: z.string().optional().describe('Account age requirement'),
      advertisers_limit: z.string().optional().describe('Advertisers limit'),
      hide_payment: z.string().optional().describe('Hide payment method flag'),
      expire_min: z.string().optional().describe('Payment window in minutes'),
      trade_tips: z.string().optional().describe('Trading tips message'),
      auto_reply: z.string().optional().describe('Auto-reply message'),
      min_completed_limit: z.string().optional(),
      max_completed_limit: z.string().optional(),
      completed_rate_limit: z.string().optional().describe('Minimum completion rate'),
      user_country_limit: z.string().optional(),
      user_order_limit: z.string().optional(),
      rate_reference_id: z.string().optional(),
      rate_offset: z.string().optional(),
      float_trend: z.string().optional(),
    },
    async ({ currency_type, exchange_type, type, unit_price, number, min_amount, max_amount,
             pay_type, pay_type_json, rate_fixed, oid, tier_limit, verified_limit, reg_time_limit,
             advertisers_limit, hide_payment, expire_min, trade_tips, auto_reply,
             min_completed_limit, max_completed_limit, completed_rate_limit,
             user_country_limit, user_order_limit, rate_reference_id, rate_offset, float_trend }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (pay_type !== undefined) opts.payType = pay_type;
        if (pay_type_json !== undefined) opts.payTypeJson = pay_type_json;
        if (rate_fixed !== undefined) opts.rateFixed = rate_fixed;
        if (oid !== undefined) opts.oid = oid;
        if (tier_limit !== undefined) opts.tierLimit = tier_limit;
        if (verified_limit !== undefined) opts.verifiedLimit = verified_limit;
        if (reg_time_limit !== undefined) opts.regTimeLimit = reg_time_limit;
        if (advertisers_limit !== undefined) opts.advertisersLimit = advertisers_limit;
        if (hide_payment !== undefined) opts.hidePayment = hide_payment;
        if (expire_min !== undefined) opts.expireMin = expire_min;
        if (trade_tips !== undefined) opts.tradeTips = trade_tips;
        if (auto_reply !== undefined) opts.autoReply = auto_reply;
        if (min_completed_limit !== undefined) opts.minCompletedLimit = min_completed_limit;
        if (max_completed_limit !== undefined) opts.maxCompletedLimit = max_completed_limit;
        if (completed_rate_limit !== undefined) opts.completedRateLimit = completed_rate_limit;
        if (user_country_limit !== undefined) opts.userCountryLimit = user_country_limit;
        if (user_order_limit !== undefined) opts.userOrderLimit = user_order_limit;
        if (rate_reference_id !== undefined) opts.rateReferenceId = rate_reference_id;
        if (rate_offset !== undefined) opts.rateOffset = rate_offset;
        if (float_trend !== undefined) opts.floatTrend = float_trend;
        const { body } = await new P2PApi(createClient()).p2pMerchantBooksPlaceBizPushOrder(
          currency_type, exchange_type, type, unit_price, number, min_amount, max_amount, opts
        );
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_update_ad_status',
    'Update the status of a P2P advertisement (requires authentication)',
    {
      adv_no: z.number().int().describe('Advertisement number'),
      adv_status: z.number().int().describe('New status: 1=online, 0=offline'),
      trade_type: z.string().optional().describe('Trade type filter'),
    },
    async ({ adv_no, adv_status, trade_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (trade_type !== undefined) opts.tradeType = trade_type;
        const { body } = await new P2PApi(createClient()).p2pMerchantBooksAdsUpdateStatus(adv_no, adv_status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_ad_detail',
    'Get details of a P2P advertisement (requires authentication)',
    {
      adv_no: z.string().describe('Advertisement number'),
    },
    async ({ adv_no }) => {
      try {
        requireAuth();
        const { body } = await new P2PApi(createClient()).p2pMerchantBooksAdsDetail(adv_no);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_list_my_ads',
    'List my own P2P advertisements (requires authentication)',
    {
      asset: z.string().optional().describe('Filter by crypto asset e.g. USDT'),
      fiat_unit: z.string().optional().describe('Filter by fiat currency e.g. USD'),
      trade_type: z.string().optional().describe('Filter by trade type: buy or sell'),
    },
    async ({ asset, fiat_unit, trade_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (asset !== undefined) opts.asset = asset;
        if (fiat_unit !== undefined) opts.fiatUnit = fiat_unit;
        if (trade_type !== undefined) opts.tradeType = trade_type;
        const { body } = await new P2PApi(createClient()).p2pMerchantBooksMyAdsList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_list_ads',
    'List all available P2P advertisements for a given asset and fiat pair (requires authentication)',
    {
      asset: z.string().describe('Crypto asset e.g. USDT'),
      fiat_unit: z.string().describe('Fiat currency e.g. USD'),
      trade_type: z.string().describe('Trade type: buy or sell'),
    },
    async ({ asset, fiat_unit, trade_type }) => {
      try {
        requireAuth();
        const { body } = await new P2PApi(createClient()).p2pMerchantBooksAdsList(asset, fiat_unit, trade_type);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Chat ──────────────────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_get_chat_messages',
    'Get chat messages for a P2P transaction (requires authentication)',
    {
      txid: z.number().int().describe('Transaction ID'),
      last_received: z.number().int().optional().describe('Last received message ID for pagination'),
      first_received: z.number().int().optional().describe('First received message ID for pagination'),
    },
    async ({ txid, last_received, first_received }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (last_received !== undefined) opts.lastreceived = last_received;
        if (first_received !== undefined) opts.firstreceived = first_received;
        const { body } = await new P2PApi(createClient()).p2pMerchantChatGetChatsList(txid, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_send_chat_message',
    'Send a chat message in a P2P transaction (requires authentication)',
    {
      txid: z.number().int().describe('Transaction ID'),
      message: z.string().describe('Message text'),
      type: z.number().int().optional().describe('Message type (0=text, 1=image)'),
    },
    async ({ txid, message, type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (type !== undefined) opts.type = type;
        const { body } = await new P2PApi(createClient()).p2pMerchantChatSendChatMessage(txid, message, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_upload_chat_file',
    'Upload an image file for P2P chat (requires authentication)',
    {
      image_content_type: z.string().describe('Image MIME type e.g. image/jpeg'),
      base64_img: z.string().describe('Base64-encoded image data'),
    },
    async ({ image_content_type, base64_img }) => {
      try {
        requireAuth();
        const { body } = await new P2PApi(createClient()).p2pMerchantChatUploadChatFile(image_content_type, base64_img);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
