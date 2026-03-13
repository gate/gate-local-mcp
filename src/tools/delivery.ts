import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { DeliveryApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent, ORDER_SOURCE_TEXT } from '../utils.js';

// Delivery (expiring futures) only supports 'usdt' settlement
const settleSchema = z.literal('usdt').describe('Settlement currency (only usdt supported)');

export function registerDeliveryTools(server: McpServer): void {
  // ── Public tools ──────────────────────────────────────────────────────────

  server.tool(
    'cex_delivery_list_delivery_contracts',
    'List all delivery (expiring futures) contracts',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        const { body } = await new DeliveryApi(createClient()).listDeliveryContracts(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_delivery_contract',
    'Get a single delivery contract',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
    },
    async ({ settle, contract }) => {
      try {
        const { body } = await new DeliveryApi(createClient()).getDeliveryContract(settle, contract);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_order_book',
    'Get delivery contract order book',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).listDeliveryOrderBook(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_candlesticks',
    'Get delivery contract candlestick data',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      interval: z.enum(['1m', '5m', '15m', '30m', '1h', '4h', '8h', '1d']).optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, interval, limit }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (interval) opts.interval = interval;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).listDeliveryCandlesticks(settle, contract, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_tickers',
    'Get delivery contract tickers',
    {
      settle: settleSchema,
      contract: z.string().optional().describe('Filter by contract'),
    },
    async ({ settle, contract }) => {
      try {
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        const { body } = await new DeliveryApi(createClient()).listDeliveryTickers(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  // ── Private tools ─────────────────────────────────────────────────────────

  server.tool(
    'cex_delivery_list_delivery_accounts',
    'Get delivery account balance (requires authentication)',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).listDeliveryAccounts(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_positions',
    'List delivery positions (requires authentication)',
    { settle: settleSchema },
    async ({ settle }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).listDeliveryPositions(settle);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_list_delivery_orders',
    'List delivery orders (requires authentication)',
    {
      settle: settleSchema,
      status: z.enum(['open', 'finished']),
      contract: z.string().optional(),
      limit: z.number().int().optional(),
      offset: z.number().int().optional(),
    },
    async ({ settle, status, contract, limit, offset }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        if (offset !== undefined) opts.offset = offset;
        const { body } = await new DeliveryApi(createClient()).listDeliveryOrders(settle, status, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_create_delivery_order',
    'Create a delivery order (requires authentication) — always confirm the details with the user before calling this tool',
    {
      settle: settleSchema,
      contract: z.string().describe('Contract name'),
      size: z.number().int().describe('Order size (negative = short)'),
      price: z.string().describe('Order price'),
      tif: z.enum(['gtc', 'ioc', 'poc', 'fok']).optional(),
      reduce_only: z.boolean().optional(),
      close: z.boolean().optional(),
    },
    async ({ settle, contract, size, price, tif, reduce_only, close }) => {
      try {
        requireAuth();
        const order: Record<string, unknown> = { contract, size, price };
        if (tif) order.tif = tif;
        if (reduce_only !== undefined) order.reduceOnly = reduce_only;
        if (close !== undefined) order.close = close;
        order.text = ORDER_SOURCE_TEXT;
        const { body } = await new DeliveryApi(createClient()).createDeliveryOrder(settle, order as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_cancel_delivery_order',
    'Cancel a delivery order (requires authentication) — always confirm with the user before calling this tool',
    {
      settle: settleSchema,
      order_id: z.string().describe('Order ID'),
    },
    async ({ settle, order_id }) => {
      try {
        requireAuth();
        const { body } = await new DeliveryApi(createClient()).cancelDeliveryOrder(settle, order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_delivery_get_my_delivery_trades',
    'Get personal delivery trading history (requires authentication)',
    {
      settle: settleSchema,
      contract: z.string().optional(),
      limit: z.number().int().optional(),
    },
    async ({ settle, contract, limit }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (contract) opts.contract = contract;
        if (limit !== undefined) opts.limit = limit;
        const { body } = await new DeliveryApi(createClient()).getMyDeliveryTrades(settle, opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
