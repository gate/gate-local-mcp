import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { CouponApi } from 'gate-api';
import { createClient, requireAuth } from '../client.js';
import { textContent, errorContent } from '../utils.js';

const couponTypeSchema = z.enum([
  'position_voucher', 'tradfi_position_voucher', 'contract_bonus', 'contract_bonus_new',
  'commission_rebate', 'hold_bonus', 'point', 'financial_rate', 'robot_bonus',
  'loss_protection_copier', 'vip_card', 'interest_voucher', 'p2p', 'cash',
  'crypto_loan_interest', 'copy_trading', 'alpha_voucher', 'etf_voucher',
]);

export function registerCouponTools(server: McpServer): void {
  server.tool(
    'cex_coupon_list_user_coupons',
    '[R] List user coupons with optional filters.',
    {
      expired: z.union([z.literal(0), z.literal(1)]).optional().describe('0 = active, 1 = expired'),
      limit: z.number().int().optional().describe('Max number of results'),
      last_id: z.number().int().optional().describe('Pagination cursor — last coupon ID from previous page'),
      expire_time: z.number().optional().describe('Filter coupons expiring before this Unix timestamp'),
      order_by: z.enum(['latest', 'expired']).optional().describe('Sort order'),
      type: couponTypeSchema.optional().describe('Filter by coupon type'),
      is_task_coupon: z.union([z.literal(0), z.literal(1)]).optional().describe('1 = task coupons only'),
    },
    async ({ expired, limit, last_id, expire_time, order_by, type, is_task_coupon }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (expired !== undefined) opts.expired = expired;
        if (limit !== undefined) opts.limit = limit;
        if (last_id !== undefined) opts.lastId = last_id;
        if (expire_time !== undefined) opts.expireTime = expire_time;
        if (order_by !== undefined) opts.orderBy = order_by;
        if (type !== undefined) opts.type = type;
        if (is_task_coupon !== undefined) opts.isTaskCoupon = is_task_coupon;
        const { body } = await new CouponApi(createClient()).listUserCoupons(opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );

  server.tool(
    'cex_coupon_get_user_coupon_detail',
    '[R] Get detail of a specific user coupon.',
    {
      coupon_type: couponTypeSchema.describe('Coupon type'),
      detail_id: z.number().int().describe('Coupon detail ID'),
      is_task_coupon: z.union([z.literal(0), z.literal(1)]).optional().describe('1 = task coupon'),
    },
    async ({ coupon_type, detail_id, is_task_coupon }) => {
      try {
        requireAuth();
        const opts: Record<string, unknown> = {};
        if (is_task_coupon !== undefined) opts.isTaskCoupon = is_task_coupon;
        const { body } = await new CouponApi(createClient()).getUserCouponDetail(coupon_type, detail_id, opts as never);
        return textContent(body);
      } catch (e) { return errorContent(e); }
    }
  );
}
