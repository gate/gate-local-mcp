import { ApiClient } from 'gate-api';
import { createRequire } from 'module';
import { AsyncLocalStorage } from 'async_hooks';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const DEFAULT_BASE_URL = 'https://api.gateio.ws';
const _require = createRequire(import.meta.url);
const { version } = _require('../package.json') as { version: string };
const MCP_NAME = 'gate-local-mcp';
const UA_BASE = `${MCP_NAME}/${version}`;

export const toolContext = new AsyncLocalStorage<string>();

let mcpClientName = '';
let mcpClientVersion = '';

/**
 * 绑定 McpServer 的 oninitialized：客户端发送 `notifications/initialized` 后，
 * 从 getClientVersion() 刷新缓存的 clientInfo。
 */
export function bindClientInfoUpdater(mcpServer: McpServer): void {
  mcpServer.server.oninitialized = () => {
    const clientVersion = mcpServer.server.getClientVersion();
    if (clientVersion) {
      mcpClientName = clientVersion.name ?? '';
      mcpClientVersion = clientVersion.version ?? '';
    }
  };
}

/** 仅单测：清空缓存的 MCP 客户端信息 */
export function clearMcpClientInfoForTests(): void {
  mcpClientName = '';
  mcpClientVersion = '';
}

/** 仅单测：模拟 oninitialized 后的客户端信息 */
export function setMcpClientInfoForTests(name: string, versionStr: string): void {
  mcpClientName = name;
  mcpClientVersion = versionStr;
}

export function createClient(): ApiClient {
  const baseUrl = process.env.GATE_BASE_URL ?? DEFAULT_BASE_URL;
  const client = new ApiClient(`${baseUrl}/api/v4`);
  const toolName = toolContext.getStore() ?? '';
  const origUA = client.defaultHeaders?.['User-Agent'] ?? '';

  // 固定 6 段：gate-local-mcp/{版本}/{工具名}/{Agent}/{Agent版本}/{SDK原始UA}，空段保留
  const userAgent = `${UA_BASE}/${toolName}/${mcpClientName}/${mcpClientVersion}/${origUA}`;
  client.defaultHeaders = {
    ...client.defaultHeaders,
    'User-Agent': userAgent,
    'X-Gate-Agent': mcpClientName,
    'X-Gate-Agent-Version': mcpClientVersion,
    'X-Gate-MCP-Tools-Name': toolName,
    'X-Gate-MCP-Name': MCP_NAME,
    'X-Gate-MCP-Version': version,
  };

  const key = process.env.GATE_API_KEY;
  const secret = process.env.GATE_API_SECRET;
  if (key && secret) {
    client.setApiKeySecret(key, secret);
  }
  return client;
}

export function isAuthenticated(): boolean {
  return Boolean(process.env.GATE_API_KEY && process.env.GATE_API_SECRET);
}

export function requireAuth(): void {
  if (!isAuthenticated()) {
    throw new Error(
      'This tool requires authentication. Set GATE_API_KEY and GATE_API_SECRET environment variables.'
    );
  }
}
