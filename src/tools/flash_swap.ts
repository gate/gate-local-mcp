import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  FlashSwapApi,
  FlashSwapMultiCurrencyManyToOneOrderCreateReq,
  FlashSwapMultiCurrencyManyToOneOrderPreviewReq,
  FlashSwapMultiCurrencyOneToManyOrderCreateReq,
  FlashSwapMultiCurrencyOneToManyOrderPreviewReq,
  FlashSwapMultiCurrencyCreateParam,
  FlashSwapMultiCurrencyPreviewParam,
  FlashSwapOrderRequest,
  FlashSwapOrderCreateReq,
} from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerFlashSwapTools(server: McpServer): void {
  server.tool(
    'cex_flash_swap_list_flash_swap_currency_pairs',
    '[R] List all supported flash swap currency pairs.',
    {
      currency: z.string().optional().describe('Filter by currency symbol'),
      page: z.number().int().optional().describe('Page number'),
      limit: z.number().int().optional().describe('Results per page'),
    },
    async ({ currency, page, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        if (page !== undefined) opts.page = page;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new FlashSwapApi(createClient()).listFlashSwapCurrencyPair(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_list_flash_swap_orders',
    '[R] List flash swap order history. Requires auth.',
    {
      status: z.number().int().optional().describe('Order status: 1=success, 2=failed'),
      sell_currency: z.string().optional(),
      buy_currency: z.string().optional(),
      limit: z.number().int().optional(),
      page: z.number().int().optional(),
      reverse: z.boolean().optional().describe('Reverse order of results'),
    },
    async ({ status, sell_currency, buy_currency, limit, page, reverse }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (status !== undefined) opts.status = status;
        if (sell_currency) opts.sellCurrency = sell_currency;
        if (buy_currency) opts.buyCurrency = buy_currency;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        if (reverse !== undefined) opts.reverse = reverse;
        const { body } = await new FlashSwapApi(createClient()).listFlashSwapOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_get_flash_swap_order',
    '[R] Get details of a flash swap order. Requires auth.',
    { order_id: z.string().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new FlashSwapApi(createClient()).getFlashSwapOrder(order_id as unknown as number);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  const multiParamSchema = z.array(z.object({
    sell_asset: z.string().describe('Asset to sell'),
    sell_amount: z.string().describe('Amount to sell'),
    buy_asset: z.string().describe('Asset to buy'),
    buy_amount: z.string().describe('Amount to buy'),
  })).describe('List of swap params');

  const multiPreviewParamSchema = z.array(z.object({
    sell_asset: z.string().describe('Asset to sell'),
    sell_amount: z.string().optional().describe('Amount to sell'),
    buy_asset: z.string().describe('Asset to buy'),
    buy_amount: z.string().optional().describe('Amount to buy'),
  })).describe('List of swap preview params');

  server.tool(
    'cex_flash_swap_create_flash_swap_multi_currency_many_to_one_order',
    '[W] Create a multi-currency many-to-one flash swap order. Requires auth. State-changing.',
    { params: multiParamSchema },
    async ({ params }) => {
      try {
        requireAuth();
        const req = new FlashSwapMultiCurrencyManyToOneOrderCreateReq();
        req.params = params.map(p => {
          const item = new FlashSwapMultiCurrencyCreateParam();
          item.sellAsset = p.sell_asset;
          item.sellAmount = p.sell_amount;
          item.buyAsset = p.buy_asset;
          item.buyAmount = p.buy_amount;
          return item;
        });
        const { body } = await new FlashSwapApi(createClient()).createFlashSwapMultiCurrencyManyToOneOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_preview_flash_swap_multi_currency_many_to_one_order',
    '[R] Preview a multi-currency many-to-one flash swap order.',
    { params: multiPreviewParamSchema },
    async ({ params }) => {
      try {
        const req = new FlashSwapMultiCurrencyManyToOneOrderPreviewReq();
        req.params = params.map(p => {
          const item = new FlashSwapMultiCurrencyPreviewParam();
          item.sellAsset = p.sell_asset;
          item.buyAsset = p.buy_asset;
          if (p.sell_amount !== undefined) item.sellAmount = p.sell_amount;
          if (p.buy_amount !== undefined) item.buyAmount = p.buy_amount;
          return item;
        });
        const { body } = await new FlashSwapApi(createClient()).previewFlashSwapMultiCurrencyManyToOneOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_create_flash_swap_multi_currency_one_to_many_order',
    '[W] Create a multi-currency one-to-many flash swap order. Requires auth. State-changing.',
    { params: multiParamSchema },
    async ({ params }) => {
      try {
        requireAuth();
        const req = new FlashSwapMultiCurrencyOneToManyOrderCreateReq();
        req.params = params.map(p => {
          const item = new FlashSwapMultiCurrencyCreateParam();
          item.sellAsset = p.sell_asset;
          item.sellAmount = p.sell_amount;
          item.buyAsset = p.buy_asset;
          item.buyAmount = p.buy_amount;
          return item;
        });
        const { body } = await new FlashSwapApi(createClient()).createFlashSwapMultiCurrencyOneToManyOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_preview_flash_swap_multi_currency_one_to_many_order',
    '[R] Preview a multi-currency one-to-many flash swap order.',
    { params: multiPreviewParamSchema },
    async ({ params }) => {
      try {
        const req = new FlashSwapMultiCurrencyOneToManyOrderPreviewReq();
        req.params = params.map(p => {
          const item = new FlashSwapMultiCurrencyPreviewParam();
          item.sellAsset = p.sell_asset;
          item.buyAsset = p.buy_asset;
          if (p.sell_amount !== undefined) item.sellAmount = p.sell_amount;
          if (p.buy_amount !== undefined) item.buyAmount = p.buy_amount;
          return item;
        });
        const { body } = await new FlashSwapApi(createClient()).previewFlashSwapMultiCurrencyOneToManyOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_create_flash_swap_order',
    '[W] Create a single-currency flash swap order. Requires auth. State-changing.',
    {
      preview_id: z.string().describe('Preview result ID returned by preview endpoint'),
      sell_currency: z.string().describe('Currency to sell e.g. BTC'),
      sell_amount: z.string().describe('Amount to sell'),
      buy_currency: z.string().describe('Currency to buy e.g. USDT'),
      buy_amount: z.string().describe('Amount to buy'),
    },
    async ({ preview_id, sell_currency, sell_amount, buy_currency, buy_amount }) => {
      try {
        requireAuth();
        const req = new FlashSwapOrderRequest();
        req.previewId = preview_id;
        req.sellCurrency = sell_currency;
        req.sellAmount = sell_amount;
        req.buyCurrency = buy_currency;
        req.buyAmount = buy_amount;
        const { body } = await new FlashSwapApi(createClient()).createFlashSwapOrder(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_preview_flash_swap_order_v1',
    '[R] Preview flash swap order quote. New endpoint → preview_flash_swap_order.',
    {
      sell_asset: z.string().describe('Asset to sell e.g. BTC'),
      buy_asset: z.string().describe('Asset to buy e.g. USDT'),
      sell_amount: z.string().optional().describe('Amount to sell (provide either sell_amount or buy_amount)'),
      buy_amount: z.string().optional().describe('Amount to buy (provide either sell_amount or buy_amount)'),
    },
    async ({ sell_asset, buy_asset, sell_amount, buy_amount }) => {
      try {
        if (sell_amount === undefined && buy_amount === undefined) {
          return errorContent(new Error('Either sell_amount or buy_amount must be provided'));
        }
        const opts: Record<string, unknown> = {};
        if (sell_amount !== undefined) opts.sellAmount = sell_amount;
        if (buy_amount !== undefined) opts.buyAmount = buy_amount;
        const { body } = await new FlashSwapApi(createClient()).previewFlashSwapOrderV1(sell_asset, buy_asset, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_create_flash_swap_order_v1',
    '[W] Place a flash swap order. Requires auth. State-changing. New endpoint → create_flash_swap_order.',
    {
      sell_asset: z.string().describe('Asset to sell e.g. BTC'),
      sell_amount: z.string().describe('Amount to sell'),
      buy_asset: z.string().describe('Asset to buy e.g. USDT'),
      buy_amount: z.string().describe('Amount to buy'),
      quote_id: z.string().optional().describe('Quote ID from preview'),
      hedge_type: z.number().int().optional().describe('Hedge type'),
      client_req_id: z.string().optional().describe('Client request ID for idempotency'),
      request_time_ms: z.number().int().optional().describe('Request timestamp in milliseconds'),
    },
    async ({ sell_asset, sell_amount, buy_asset, buy_amount, quote_id, hedge_type, client_req_id, request_time_ms }) => {
      try {
        requireAuth();
        const req = new FlashSwapOrderCreateReq();
        req.sellAsset = sell_asset;
        req.sellAmount = sell_amount;
        req.buyAsset = buy_asset;
        req.buyAmount = buy_amount;
        if (quote_id !== undefined) req.quoteId = quote_id;
        if (hedge_type !== undefined) req.hedgeType = hedge_type;
        if (client_req_id !== undefined) req.clientReqId = client_req_id;
        if (request_time_ms !== undefined) req.requestTimeMs = request_time_ms;
        const { body } = await new FlashSwapApi(createClient()).createFlashSwapOrderV1(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
