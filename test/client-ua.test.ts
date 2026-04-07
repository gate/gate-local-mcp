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

describe('Custom X-Gate-* headers', () => {
  beforeEach(() => {
    clearMcpClientInfoForTests();
  });

  test('all 5 custom headers present with correct values (full context)', () => {
    setMcpClientInfoForTests('cursor', '0.45.6');
    let headers: Record<string, unknown> = {};
    toolContext.run('cex_spot_list_currencies', () => {
      const client = createClient();
      headers = client.defaultHeaders;
    });
    expect(headers['X-Gate-Agent']).toBe('cursor');
    expect(headers['X-Gate-Agent-Version']).toBe('0.45.6');
    expect(headers['X-Gate-MCP-Tools-Name']).toBe('cex_spot_list_currencies');
    expect(headers['X-Gate-MCP-Name']).toBe('gate-local-mcp');
    expect(headers['X-Gate-MCP-Version']).toBe(pkgVersion);
  });

  test('empty client info produces empty string headers (not undefined)', () => {
    const client = createClient();
    const headers = client.defaultHeaders;
    expect(headers['X-Gate-Agent']).toBe('');
    expect(headers['X-Gate-Agent-Version']).toBe('');
  });

  test('empty tool context produces empty X-Gate-MCP-Tools-Name', () => {
    setMcpClientInfoForTests('claude-desktop', '1.2.3');
    const client = createClient();
    const headers = client.defaultHeaders;
    expect(headers['X-Gate-MCP-Tools-Name']).toBe('');
    expect(headers['X-Gate-Agent']).toBe('claude-desktop');
  });

  test('X-Gate-MCP-Name and X-Gate-MCP-Version are always fixed', () => {
    const client1 = createClient();
    setMcpClientInfoForTests('windsurf', '3.0');
    let headers2: Record<string, unknown> = {};
    toolContext.run('cex_fx_list_fx_contracts', () => {
      headers2 = createClient().defaultHeaders;
    });
    expect(client1.defaultHeaders['X-Gate-MCP-Name']).toBe('gate-local-mcp');
    expect(client1.defaultHeaders['X-Gate-MCP-Version']).toBe(pkgVersion);
    expect(headers2['X-Gate-MCP-Name']).toBe('gate-local-mcp');
    expect(headers2['X-Gate-MCP-Version']).toBe(pkgVersion);
  });

  test('different tool calls produce different X-Gate-MCP-Tools-Name', () => {
    setMcpClientInfoForTests('cursor', '0.45.6');
    let h1: Record<string, unknown> = {};
    let h2: Record<string, unknown> = {};
    toolContext.run('cex_spot_list_currencies', () => {
      h1 = createClient().defaultHeaders;
    });
    toolContext.run('cex_fx_list_fx_contracts', () => {
      h2 = createClient().defaultHeaders;
    });
    expect(h1['X-Gate-MCP-Tools-Name']).toBe('cex_spot_list_currencies');
    expect(h2['X-Gate-MCP-Tools-Name']).toBe('cex_fx_list_fx_contracts');
    // agent headers stay the same across tool calls
    expect(h1['X-Gate-Agent']).toBe('cursor');
    expect(h2['X-Gate-Agent']).toBe('cursor');
  });

  test('User-Agent 6-segment format is preserved alongside custom headers', () => {
    setMcpClientInfoForTests('cline', '2.0.0');
    let headers: Record<string, unknown> = {};
    toolContext.run('cex_spot_get_spot_tickers', () => {
      headers = createClient().defaultHeaders;
    });
    const ua = headers['User-Agent'] as string;
    const parts = splitUA(ua);
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe('gate-local-mcp');
    expect(parts[2]).toBe('cex_spot_get_spot_tickers');
    expect(parts[3]).toBe('cline');
    expect(parts[4]).toBe('2.0.0');
    // custom headers also correct
    expect(headers['X-Gate-Agent']).toBe('cline');
    expect(headers['X-Gate-MCP-Tools-Name']).toBe('cex_spot_get_spot_tickers');
  });
});
