#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { sanitizeToolName, isWriteTool } from './utils.js';
import { parseConfig, ModuleName } from './config.js';
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

const config = parseConfig();

const server = new McpServer({
  name: 'gate',
  version: '0.1.0',
});

// Monkey-patch server.tool: apply name sanitization + readonly filter
const _registerTool = server.tool.bind(server);
(server as any).tool = (name: string, ...args: unknown[]) => {
  const sanitized = sanitizeToolName(name);
  if (config.readonly && isWriteTool(sanitized)) return;
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
  sub_account: registerSubAccountTools,
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
