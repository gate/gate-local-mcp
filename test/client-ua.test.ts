import { describe, test, expect, beforeEach } from 'vitest';
import { createRequire } from 'module';
import {
  createClient,
  toolContext,
  bindClientInfoUpdater,
  clearMcpClientInfoForTests,
  setMcpClientInfoForTests,
} from '../src/client.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const _require = createRequire(import.meta.url);
const { version: pkgVersion } = _require('../package.json') as { version: string };

/** 与下游解析一致：前 5 次切分，第 6 段保留 SDK UA 中可能存在的 `/` */
function splitUA(ua: string): string[] {
  return ua.split('/', 6);
}

describe('User-Agent header', () => {
  beforeEach(() => {
    clearMcpClientInfoForTests();
  });

  test('includes gate-local-mcp version prefix', () => {
    const client = createClient();
    const ua = client.defaultHeaders['User-Agent'] as string;
    expect(ua).toMatch(/^gate-local-mcp\/\d+\.\d+\.\d+/);
  });

  test('includes tool name when called within toolContext', () => {
    let ua = '';
    toolContext.run('cex_spot_get_spot_tickers', () => {
      const client = createClient();
      ua = client.defaultHeaders['User-Agent'] as string;
    });
    const parts = splitUA(ua);
    expect(parts[2]).toBe('cex_spot_get_spot_tickers');
  });

  test('omits tool name when called outside toolContext (empty tool segment)', () => {
    const client = createClient();
    const ua = client.defaultHeaders['User-Agent'] as string;
    const parts = splitUA(ua);
    expect(parts[0]).toBe('gate-local-mcp');
    expect(parts[1]).toBe(pkgVersion);
    expect(parts[2]).toBe('');
  });

  describe('6-segment format (split /, 6)', () => {
    test('all fields including MCP client info', () => {
      setMcpClientInfoForTests('cursor', '0.45.6');
      let ua = '';
      toolContext.run('cex_spot_list_currencies', () => {
        const client = createClient();
        ua = client.defaultHeaders['User-Agent'] as string;
      });
      const parts = splitUA(ua);
      expect(parts).toHaveLength(6);
      expect(parts[0]).toBe('gate-local-mcp');
      expect(parts[1]).toBe(pkgVersion);
      expect(parts[2]).toBe('cex_spot_list_currencies');
      expect(parts[3]).toBe('cursor');
      expect(parts[4]).toBe('0.45.6');
      // 第 6 段为 SDK 原始 UA（可能含 `/`，当前 gate-api 常为空）
      expect(typeof parts[5]).toBe('string');
    });

    test('empty MCP client info keeps empty agent segments (//)', () => {
      let ua = '';
      toolContext.run('cex_fx_list_fx_contracts', () => {
        const client = createClient();
        ua = client.defaultHeaders['User-Agent'] as string;
      });
      const parts = splitUA(ua);
      expect(parts).toHaveLength(6);
      expect(parts[2]).toBe('cex_fx_list_fx_contracts');
      expect(parts[3]).toBe('');
      expect(parts[4]).toBe('');
    });

    test('clientInfo.name is passed through unchanged (spaces preserved)', () => {
      setMcpClientInfoForTests('my mcp client', '1.0');
      const client = createClient();
      const ua = client.defaultHeaders['User-Agent'] as string;
      const parts = splitUA(ua);
      expect(parts[3]).toBe('my mcp client');
      expect(parts[4]).toBe('1.0');
    });
  });

  test('bindClientInfoUpdater wires oninitialized on underlying Server', () => {
    const mcp = new McpServer({ name: 'gate', version: '0.1.0' });
    bindClientInfoUpdater(mcp);
    expect(typeof mcp.server.oninitialized).toBe('function');
  });
});
