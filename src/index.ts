#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
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
