#!/usr/bin/env node
import { createRequire } from 'module';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Patch MCP SDK stdio deserialization to handle large integers (> Number.MAX_SAFE_INTEGER).
// ReadBuffer.readMessage() calls deserializeMessage() via local closure (not exports),
// so we must override the prototype method to intercept JSON parsing.
// json-bigint with storeAsString:true preserves large integers as strings.
const _require = createRequire(import.meta.url);
const JSONbig = _require('json-bigint')({ storeAsString: true });
// Use subpaths without dist/cjs/ prefix — the SDK exports map routes them correctly
const stdioShared = _require('@modelcontextprotocol/sdk/shared/stdio.js');
const { JSONRPCMessageSchema } = _require('@modelcontextprotocol/sdk/types.js');
stdioShared.ReadBuffer.prototype.readMessage = function (this: { _buffer?: Buffer }) {
  if (!this._buffer) return null;
  const index = this._buffer.indexOf('\n');
  if (index === -1) return null;
  const line = this._buffer.toString('utf8', 0, index).replace(/\r$/, '');
  this._buffer = this._buffer.subarray(index + 1);
  return JSONRPCMessageSchema.parse(JSONbig.parse(line));
};
import { sanitizeToolName, isWriteTool } from './utils.js';
import { parseConfig, ModuleName } from './config.js';
import { bindClientInfoUpdater, toolContext } from './client.js';
import { registerSpotTools } from './tools/spot.js';
import { registerFuturesTools } from './tools/futures.js';
import { registerDeliveryTools } from './tools/delivery.js';
import { registerMarginTools } from './tools/margin.js';
import { registerWalletTools } from './tools/wallet.js';
import { registerAccountTools } from './tools/account.js';
import { registerOptionsTools } from './tools/options.js';
import { registerEarnTools } from './tools/earn.js';
import { registerFlashSwapTools } from './tools/flash_swap.js';
import { registerUnifiedTools } from './tools/unified.js';
import { registerSubAccountTools } from './tools/sub_account.js';
import { registerP2PTools } from './tools/p2p.js';
import { registerTradFiTools } from './tools/trad_fi.js';
import { registerCrossExTools } from './tools/cross_ex.js';
import { registerAlphaTools } from './tools/alpha.js';
import { registerRebateTools } from './tools/rebate.js';
import { registerMultiCollateralLoanTools } from './tools/multi_collateral_loan.js';
import { registerActivityTools } from './tools/activity.js';
import { registerCouponTools } from './tools/coupon.js';
import { registerLaunchTools } from './tools/launch.js';
import { registerSquareTools } from './tools/square.js';
import { registerAssetswapTools } from './tools/assetswap.js';
import { registerBotTools } from './tools/bot.js';
import { registerWithdrawalTools } from './tools/withdrawal.js';

const config = parseConfig();

const server = new McpServer({
  name: 'gate',
  version: '0.1.0',
});

bindClientInfoUpdater(server);

// Monkey-patch server.tool: apply name sanitization, readonly filter, and tool-name UA injection
const _registerTool = server.tool.bind(server);
(server as any).tool = (name: string, ...args: unknown[]) => {
  const sanitized = sanitizeToolName(name);
  if (config.readonly && isWriteTool(sanitized)) return;
  // Wrap the handler (last arg) to run inside toolContext so createClient() picks up the tool name
  const handler = args[args.length - 1] as (...a: unknown[]) => unknown;
  args[args.length - 1] = (...hArgs: unknown[]) => toolContext.run(sanitized, () => handler(...hArgs));
  (_registerTool as (name: string, ...rest: unknown[]) => void)(sanitized, ...args);
};

const MODULE_REGISTRY: Record<ModuleName, (server: McpServer) => void> = {
  spot:        registerSpotTools,
  futures:     registerFuturesTools,
  delivery:    registerDeliveryTools,
  margin:      registerMarginTools,
  wallet:      registerWalletTools,
  account:     registerAccountTools,
  options:     registerOptionsTools,
  earn:        registerEarnTools,
  flash_swap:  registerFlashSwapTools,
  unified:     registerUnifiedTools,
  sub_account:           registerSubAccountTools,
  p2p:                   registerP2PTools,
  tradfi:                registerTradFiTools,
  crossex:               registerCrossExTools,
  alpha:                 registerAlphaTools,
  rebate:                registerRebateTools,
  multi_collateral_loan: registerMultiCollateralLoanTools,
  activity:              registerActivityTools,
  coupon:                registerCouponTools,
  launch:                registerLaunchTools,
  square:                registerSquareTools,
  assetswap:             registerAssetswapTools,
  bot:                   registerBotTools,
  withdrawal:            registerWithdrawalTools,
};

const modulesToLoad = config.modules ?? new Set(Object.keys(MODULE_REGISTRY) as ModuleName[]);

for (const name of modulesToLoad) {
  MODULE_REGISTRY[name](server);
}

if (config.modules || config.readonly) {
  const moduleList = config.modules ? [...config.modules].join(', ') : 'all';
  console.error(`[gate-mcp] Modules: ${moduleList} | Readonly: ${config.readonly}`);
}

const transport = new StdioServerTransport();
await server.connect(transport);
