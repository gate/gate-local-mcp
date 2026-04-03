import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { P2pApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerP2PTools(server: McpServer): void {
  // ── Account ───────────────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_get_user_info',
    '[R] Get P2P merchant account info for the authenticated user. Requires auth.',
    {},
    async () => {
      try {
        requireAuth();
        const { body } = await new P2pApi(createClient()).p2pMerchantAccountGetUserInfo();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_counterparty_user_info',
    '[R] Get P2P merchant info for a counterparty by their user ID. Requires auth.',
    {
      biz_uid: z.string().describe('Counterparty user ID'),
    },
    async ({ biz_uid }) => {
      try {
        requireAuth();
        const { GetCounterpartyUserInfoRequest } = await import('gate-api');
        const req = new GetCounterpartyUserInfoRequest();
        req.bizUid = biz_uid;
        const { body } = await new P2pApi(createClient()).p2pMerchantAccountGetCounterpartyUserInfo(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_myself_payment',
    '[R] Get available payment methods for the authenticated P2P merchant. Requires auth.',
    {
      fiat: z.string().optional().describe('Filter by fiat currency e.g. USD'),
    },
    async ({ fiat }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (fiat !== undefined) {
          const { GetMyselfPaymentRequest } = await import('gate-api');
          const req = new GetMyselfPaymentRequest();
          req.fiat = fiat;
          opts.getMyselfPaymentRequest = req;
        }
        const { body } = await new P2pApi(createClient()).p2pMerchantAccountGetMyselfPayment(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Transactions ──────────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_get_pending_transaction_list',
    '[R] List pending P2P transactions. Requires auth.',
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
        const { GetPendingTransactionListRequest } = await import('gate-api');
        const req = new GetPendingTransactionListRequest();
        req.cryptoCurrency = crypto_currency;
        req.fiatCurrency = fiat_currency;
        if (order_tab !== undefined) req.orderTab = order_tab;
        if (select_type !== undefined) req.selectType = select_type;
        if (status !== undefined) req.status = status;
        if (txid !== undefined) req.txid = txid;
        if (start_time !== undefined) req.startTime = start_time;
        if (end_time !== undefined) req.endTime = end_time;
        const { body } = await new P2pApi(createClient()).p2pMerchantTransactionGetPendingTransactionList(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_completed_transaction_list',
    '[R] List completed P2P transactions. Requires auth.',
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
        const { GetCompletedTransactionListRequest } = await import('gate-api');
        const req = new GetCompletedTransactionListRequest();
        req.cryptoCurrency = crypto_currency;
        req.fiatCurrency = fiat_currency;
        if (select_type !== undefined) req.selectType = select_type;
        if (status !== undefined) req.status = status;
        if (txid !== undefined) req.txid = txid;
        if (start_time !== undefined) req.startTime = start_time;
        if (end_time !== undefined) req.endTime = end_time;
        if (query_dispute !== undefined) req.queryDispute = query_dispute;
        if (page !== undefined) req.page = page;
        if (per_page !== undefined) req.perPage = per_page;
        const { body } = await new P2pApi(createClient()).p2pMerchantTransactionGetCompletedTransactionList(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_get_transaction_details',
    '[R] Get details of a specific P2P transaction. Requires auth.',
    {
      txid: z.number().int().describe('Transaction ID'),
      channel: z.string().optional().describe('Channel filter'),
    },
    async ({ txid, channel }) => {
      try {
        requireAuth();
        const { GetTransactionDetailsRequest } = await import('gate-api');
        const req = new GetTransactionDetailsRequest();
        req.txid = txid;
        if (channel !== undefined) req.channel = channel;
        const { body } = await new P2pApi(createClient()).p2pMerchantTransactionGetTransactionDetails(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_transaction_confirm_payment',
    '[R] Confirm payment for a P2P transaction. Requires auth.',
    {
      trade_id: z.string().describe('Trade ID'),
      payment_method: z.string().describe('Payment method used'),
    },
    async ({ trade_id, payment_method }) => {
      try {
        requireAuth();
        const { ConfirmPayment } = await import('gate-api');
        const req = new ConfirmPayment();
        req.tradeId = trade_id;
        req.paymentMethod = payment_method;
        const { body } = await new P2pApi(createClient()).p2pMerchantTransactionConfirmPayment(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_transaction_confirm_receipt',
    '[R] Confirm receipt of payment for a P2P transaction. Requires auth.',
    {
      trade_id: z.string().describe('Trade ID'),
    },
    async ({ trade_id }) => {
      try {
        requireAuth();
        const { ConfirmReceipt } = await import('gate-api');
        const req = new ConfirmReceipt();
        req.tradeId = trade_id;
        const { body } = await new P2pApi(createClient()).p2pMerchantTransactionConfirmReceipt(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_transaction_cancel',
    '[R] Cancel a P2P transaction. Requires auth.',
    {
      trade_id: z.string().describe('Trade ID'),
      reason_id: z.string().optional().describe('Cancellation reason ID'),
      reason_memo: z.string().optional().describe('Cancellation reason memo'),
    },
    async ({ trade_id, reason_id, reason_memo }) => {
      try {
        requireAuth();
        const { CancelOrder } = await import('gate-api');
        const req = new CancelOrder();
        req.tradeId = trade_id;
        if (reason_id !== undefined) req.reasonId = reason_id;
        if (reason_memo !== undefined) req.reasonMemo = reason_memo;
        const { body } = await new P2pApi(createClient()).p2pMerchantTransactionCancel(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Ads / Order Book ──────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_place_biz_push_order',
    '[R] Place a P2P advertisement order. Requires auth.',
    {
      currency_type: z.string().describe('Crypto currency e.g. USDT'),
      exchange_type: z.string().describe('Fiat currency e.g. USD'),
      type: z.string().describe('Trade type: buy or sell'),
      unit_price: z.string().describe('Price per unit'),
      number: z.string().describe('Total quantity to trade'),
      pay_type: z.string().describe('Payment type'),
      min_amount: z.string().describe('Minimum order amount'),
      max_amount: z.string().describe('Maximum order amount'),
      pay_type_json: z.string().optional().describe('Payment type JSON'),
      rate_fixed: z.string().optional().describe('Fixed rate flag'),
      oid: z.string().optional().describe('External order ID'),
      tier_limit: z.string().optional().describe('Tier limit'),
      verified_limit: z.string().optional().describe('KYC verification requirement'),
      reg_time_limit: z.string().optional().describe('Account age requirement'),
      advertisers_limit: z.string().optional(),
      hide_payment: z.string().optional(),
      expire_min: z.string().optional().describe('Payment window in minutes'),
      trade_tips: z.string().optional(),
      auto_reply: z.string().optional(),
      min_completed_limit: z.string().optional(),
      max_completed_limit: z.string().optional(),
      completed_rate_limit: z.string().optional(),
      user_country_limit: z.string().optional(),
      user_order_limit: z.string().optional(),
      rate_reference_id: z.string().optional(),
      rate_offset: z.string().optional(),
      float_trend: z.string().optional(),
    },
    async ({ currency_type, exchange_type, type, unit_price, number, pay_type, min_amount, max_amount,
             pay_type_json, rate_fixed, oid, tier_limit, verified_limit, reg_time_limit,
             advertisers_limit, hide_payment, expire_min, trade_tips, auto_reply,
             min_completed_limit, max_completed_limit, completed_rate_limit,
             user_country_limit, user_order_limit, rate_reference_id, rate_offset, float_trend }) => {
      try {
        requireAuth();
        const { PlaceBizPushOrder } = await import('gate-api');
        const req = new PlaceBizPushOrder();
        req.currencyType = currency_type;
        req.exchangeType = exchange_type;
        req.type = type;
        req.unitPrice = unit_price;
        req.number = number;
        req.payType = pay_type;
        req.minAmount = min_amount;
        req.maxAmount = max_amount;
        if (pay_type_json !== undefined) req.payTypeJson = pay_type_json;
        if (rate_fixed !== undefined) req.rateFixed = rate_fixed;
        if (oid !== undefined) req.oid = oid;
        if (tier_limit !== undefined) req.tierLimit = tier_limit;
        if (verified_limit !== undefined) req.verifiedLimit = verified_limit;
        if (reg_time_limit !== undefined) req.regTimeLimit = reg_time_limit;
        if (advertisers_limit !== undefined) req.advertisersLimit = advertisers_limit;
        if (hide_payment !== undefined) req.hidePayment = hide_payment;
        if (expire_min !== undefined) req.expireMin = expire_min;
        if (trade_tips !== undefined) req.tradeTips = trade_tips;
        if (auto_reply !== undefined) req.autoReply = auto_reply;
        if (min_completed_limit !== undefined) req.minCompletedLimit = min_completed_limit;
        if (max_completed_limit !== undefined) req.maxCompletedLimit = max_completed_limit;
        if (completed_rate_limit !== undefined) req.completedRateLimit = completed_rate_limit;
        if (user_country_limit !== undefined) req.userCountryLimit = user_country_limit;
        if (user_order_limit !== undefined) req.userOrderLimit = user_order_limit;
        if (rate_reference_id !== undefined) req.rateReferenceId = rate_reference_id;
        if (rate_offset !== undefined) req.rateOffset = rate_offset;
        if (float_trend !== undefined) req.floatTrend = float_trend;
        const { body } = await new P2pApi(createClient()).p2pMerchantBooksPlaceBizPushOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_ads_update_status',
    '[R] Update the status of a P2P advertisement. Requires auth.',
    {
      adv_no: z.number().int().describe('Advertisement number'),
      adv_status: z.number().int().describe('New status: 1=online, 0=offline'),
      trade_type: z.string().optional().describe('Trade type filter'),
    },
    async ({ adv_no, adv_status, trade_type }) => {
      try {
        requireAuth();
        const { AdsUpdateStatus } = await import('gate-api');
        const req = new AdsUpdateStatus();
        req.advNo = adv_no;
        req.advStatus = adv_status;
        const opts: Record<string, unknown> = {};
        if (trade_type !== undefined) opts.tradeType = trade_type;
        const { body } = await new P2pApi(createClient()).p2pMerchantBooksAdsUpdateStatus(req, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_ads_detail',
    '[R] Get details of a P2P advertisement. Requires auth.',
    {
      adv_no: z.string().describe('Advertisement number'),
    },
    async ({ adv_no }) => {
      try {
        requireAuth();
        const { AdsDetailRequest } = await import('gate-api');
        const req = new AdsDetailRequest();
        req.advNo = adv_no;
        const { body } = await new P2pApi(createClient()).p2pMerchantBooksAdsDetail(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_my_ads_list',
    '[R] List my own P2P advertisements. Requires auth.',
    {
      asset: z.string().optional().describe('Filter by crypto asset e.g. USDT'),
      fiat_unit: z.string().optional().describe('Filter by fiat currency e.g. USD'),
      trade_type: z.string().optional().describe('Filter by trade type: buy or sell'),
    },
    async ({ asset, fiat_unit, trade_type }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (asset !== undefined || fiat_unit !== undefined || trade_type !== undefined) {
          const { MyAdsListRequest } = await import('gate-api');
          const req = new MyAdsListRequest();
          if (asset !== undefined) req.asset = asset;
          if (fiat_unit !== undefined) req.fiatUnit = fiat_unit;
          if (trade_type !== undefined) req.tradeType = trade_type;
          opts.myAdsListRequest = req;
        }
        const { body } = await new P2pApi(createClient()).p2pMerchantBooksMyAdsList(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_ads_list',
    '[R] List all available P2P advertisements for a given asset and fiat pair. Requires auth.',
    {
      asset: z.string().describe('Crypto asset e.g. USDT'),
      fiat_unit: z.string().describe('Fiat currency e.g. USD'),
      trade_type: z.string().describe('Trade type: buy or sell'),
    },
    async ({ asset, fiat_unit, trade_type }) => {
      try {
        requireAuth();
        const { AdsListRequest } = await import('gate-api');
        const req = new AdsListRequest();
        req.asset = asset;
        req.fiatUnit = fiat_unit;
        req.tradeType = trade_type;
        const { body } = await new P2pApi(createClient()).p2pMerchantBooksAdsList(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Chat ──────────────────────────────────────────────────────────────────

  server.tool(
    'cex_p2p_get_chats_list',
    '[R] Get chat messages for a P2P transaction. Requires auth.',
    {
      txid: z.number().int().describe('Transaction ID'),
      last_received: z.number().int().optional().describe('Last received message ID for pagination'),
      first_received: z.number().int().optional().describe('First received message ID for pagination'),
    },
    async ({ txid, last_received, first_received }) => {
      try {
        requireAuth();
        const { GetChatsListRequest } = await import('gate-api');
        const req = new GetChatsListRequest();
        req.txid = txid;
        if (last_received !== undefined) req.lastreceived = last_received;
        if (first_received !== undefined) req.firstreceived = first_received;
        const { body } = await new P2pApi(createClient()).p2pMerchantChatGetChatsList(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_send_chat_message',
    '[R] Send a chat message in a P2P transaction. Requires auth.',
    {
      txid: z.number().int().describe('Transaction ID'),
      message: z.string().describe('Message text'),
      type: z.number().int().optional().describe('Message type (0=text, 1=image)'),
    },
    async ({ txid, message, type }) => {
      try {
        requireAuth();
        const { SendChatMessageRequest } = await import('gate-api');
        const req = new SendChatMessageRequest();
        req.txid = txid;
        req.message = message;
        if (type !== undefined) req.type = type;
        const { body } = await new P2pApi(createClient()).p2pMerchantChatSendChatMessage(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_p2p_upload_chat_file',
    '[R] Upload an image file for P2P chat. Requires auth.',
    {
      image_content_type: z.string().describe('Image MIME type e.g. image/jpeg'),
      base64_img: z.string().describe('Base64-encoded image data'),
    },
    async ({ image_content_type, base64_img }) => {
      try {
        requireAuth();
        const { UploadChatFile } = await import('gate-api');
        const req = new UploadChatFile();
        req.imageContentType = image_content_type;
        req.base64Img = base64_img;
        const { body } = await new P2pApi(createClient()).p2pMerchantChatUploadChatFile(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
