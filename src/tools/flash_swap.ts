import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { FlashSwapApi } from 'gate-api';
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
}
