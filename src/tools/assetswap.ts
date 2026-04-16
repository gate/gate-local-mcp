import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { AssetswapApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

export function registerAssetswapTools(server: McpServer): void {
  server.tool(
    'cex_assetswap_list_asset_swap_assets',
    'List available asset swap assets.',
    {},
    async () => {
      try {
        const { body } = await new AssetswapApi(createClient()).listAssetSwapAssets();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_assetswap_get_asset_swap_config',
    'Get asset swap configuration.',
    {},
    async () => {
      try {
        const { body } = await new AssetswapApi(createClient()).getAssetSwapConfig();
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_assetswap_evaluate_asset_swap',
    'Evaluate assets available for swapping.',
    {
      max_evaluate_value: z.number().optional().describe('Maximum evaluation value'),
      cursor: z.string().optional().describe('Pagination cursor'),
      size: z.number().int().optional().describe('Results per page'),
    },
    async ({ max_evaluate_value, cursor, size }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (max_evaluate_value !== undefined) opts.maxEvaluateValue = max_evaluate_value;
        if (cursor !== undefined) opts.cursor = cursor;
        if (size !== undefined) opts.size = size;
        const { body } = await new AssetswapApi(createClient()).evaluateAssetSwap(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_assetswap_create_asset_swap_order_v1',
    'Create an asset swap order. State-changing',
    {
      from: z.array(z.object({
        asset: z.string().describe('Source asset name'),
        amount: z.string().describe('Amount to swap'),
      })).describe('List of source assets'),
      to: z.array(z.object({
        asset: z.string().describe('Target asset name'),
        amount: z.string().describe('Target amount'),
      })).describe('List of target assets'),
    },
    async ({ from, to }) => {
      try {
        requireAuth();
        const { OrderCreateV1Req, CreateParam } = await import('gate-api');
        const req = new OrderCreateV1Req();
        req.from = from.map(f => { const p = new CreateParam(); p.asset = f.asset; p.amount = f.amount; return p; });
        req.to = to.map(t => { const p = new CreateParam(); p.asset = t.asset; p.amount = t.amount; return p; });
        const { body } = await new AssetswapApi(createClient()).createAssetSwapOrderV1(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_assetswap_list_asset_swap_orders_v1',
    'List asset swap orders.',
    {
      from: z.number().optional().describe('Start time (Unix timestamp)'),
      to: z.number().optional().describe('End time (Unix timestamp)'),
      status: z.number().int().optional().describe('Order status filter'),
      offset: z.number().int().optional().describe('Offset'),
      size: z.number().int().optional().describe('Results per page'),
      sort_mode: z.number().int().optional().describe('Sort mode'),
      order_by: z.number().int().optional().describe('Order by field'),
    },
    async ({ from, to, status, offset, size, sort_mode, order_by }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (from !== undefined) opts.from = from;
        if (to !== undefined) opts.to = to;
        if (status !== undefined) opts.status = status;
        if (offset !== undefined) opts.offset = offset;
        if (size !== undefined) opts.size = size;
        if (sort_mode !== undefined) opts.sortMode = sort_mode;
        if (order_by !== undefined) opts.orderBy = order_by;
        const { body } = await new AssetswapApi(createClient()).listAssetSwapOrdersV1(opts);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_assetswap_preview_asset_swap_order_v1',
    'Preview an asset swap order before creating.',
    {
      from: z.array(z.object({
        asset: z.string().describe('Source asset name'),
        amount: z.string().describe('Amount to swap'),
      })).describe('List of source assets'),
      to: z.array(z.object({
        asset: z.string().describe('Target asset name'),
        ratio: z.string().describe('Target allocation ratio'),
      })).describe('List of target assets'),
    },
    async ({ from, to }) => {
      try {
        requireAuth();
        const { OrderPreviewV1Req, PreviewFromParam, PreviewToParam } = await import('gate-api');
        const req = new OrderPreviewV1Req();
        req.from = from.map(f => { const p = new PreviewFromParam(); p.asset = f.asset; p.amount = f.amount; return p; });
        req.to = to.map(t => { const p = new PreviewToParam(); p.asset = t.asset; p.ratio = t.ratio; return p; });
        const { body } = await new AssetswapApi(createClient()).previewAssetSwapOrderV1(req);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_assetswap_get_asset_swap_order_v1',
    'Get details of a specific asset swap order.',
    {
      order_id: z.string().describe('Asset swap order ID'),
    },
    async ({ order_id }) => {
      try {
        requireAuth();
        const { body } = await new AssetswapApi(createClient()).getAssetSwapOrderV1(order_id);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
