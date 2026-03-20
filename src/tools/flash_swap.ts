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
} from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerFlashSwapTools(server: McpServer): void {
  server.tool(
    'cex_flash_swap_list_flash_swap_currency_pairs',
    'List all supported flash swap currency pairs',
    {
      currency: z.string().optional().describe('Filter by currency symbol'),
    },
    async ({ currency }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (currency) opts.currency = currency;
        const { body } = await new FlashSwapApi(createClient()).listFlashSwapCurrencyPair(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_list_flash_swap_orders',
    'List flash swap order history (requires authentication)',
    {
      status: z.number().int().optional().describe('Order status: 1=success, 2=failed'),
      sell_currency: z.string().optional(),
      buy_currency: z.string().optional(),
      limit: z.number().int().optional(),
      page: z.number().int().optional(),
    },
    async ({ status, sell_currency, buy_currency, limit, page }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (status !== undefined) opts.status = status;
        if (sell_currency) opts.sellCurrency = sell_currency;
        if (buy_currency) opts.buyCurrency = buy_currency;
        if (limit !== undefined) opts.limit = limit;
        if (page !== undefined) opts.page = page;
        const { body } = await new FlashSwapApi(createClient()).listFlashSwapOrders(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_flash_swap_get_flash_swap_order',
    'Get details of a flash swap order (requires authentication)',
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
    'Create a multi-currency many-to-one flash swap order (requires authentication)',
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
    'Preview a multi-currency many-to-one flash swap order',
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
    'Create a multi-currency one-to-many flash swap order (requires authentication)',
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
    'Preview a multi-currency one-to-many flash swap order',
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
}
