import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FlashSwapApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerFlashSwapTools(server: McpServer): void {
  server.tool(
    'list_flash_swap_currency_pairs',
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
    'preview_flash_swap_order',
    'Preview a flash swap order to get a quote (requires authentication)',
    {
      sell_currency: z.string().describe('Currency to sell e.g. USDT'),
      sell_amount: z.string().optional().describe('Amount to sell (specify either sell_amount or buy_amount)'),
      buy_currency: z.string().describe('Currency to buy e.g. BTC'),
      buy_amount: z.string().optional().describe('Amount to buy'),
    },
    async ({ sell_currency, sell_amount, buy_currency, buy_amount }) => {
      try {
        requireAuth();
        const preview: Record<string, unknown> = { sellCurrency: sell_currency, buyCurrency: buy_currency };
        if (sell_amount) preview.sellAmount = sell_amount;
        if (buy_amount) preview.buyAmount = buy_amount;
        const { body } = await new FlashSwapApi(createClient()).previewFlashSwapOrder(preview as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'create_flash_swap_order',
    'Execute a flash swap order (requires authentication) — always confirm the swap details with the user before calling this tool',
    {
      preview_id: z.string().describe('Preview ID from preview_flash_swap_order'),
      sell_currency: z.string().describe('Currency to sell'),
      sell_amount: z.string().describe('Amount to sell'),
      buy_currency: z.string().describe('Currency to buy'),
      buy_amount: z.string().describe('Amount to buy'),
    },
    async ({ preview_id, sell_currency, sell_amount, buy_currency, buy_amount }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = {
          previewId: preview_id,
          sellCurrency: sell_currency,
          sellAmount: sell_amount,
          buyCurrency: buy_currency,
          buyAmount: buy_amount,
        };
        const { body } = await new FlashSwapApi(createClient()).createFlashSwapOrder(order as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'list_flash_swap_orders',
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
    'get_flash_swap_order',
    'Get details of a flash swap order (requires authentication)',
    { order_id: z.number().int().describe('Order ID') },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new FlashSwapApi(createClient()).getFlashSwapOrder(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
