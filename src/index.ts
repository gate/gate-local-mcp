#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { sanitizeToolName } from './utils.js';
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

const server = new McpServer({
  name: 'gate',
  version: '0.1.0',
});

// Apply NAME_ABBREVIATIONS to every tool name at registration time.
const _registerTool = server.tool.bind(server);
(server as any).tool = (name: string, ...args: unknown[]) =>
  (_registerTool as (name: string, ...rest: unknown[]) => void)(sanitizeToolName(name), ...args);

registerSpotTools(server);
registerFuturesTools(server);
registerDeliveryTools(server);
registerMarginTools(server);
registerWalletTools(server);
registerAccountTools(server);
registerOptionsTools(server);
registerEarnTools(server);
registerFlashSwapTools(server);
registerUnifiedTools(server);
registerSubAccountTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
