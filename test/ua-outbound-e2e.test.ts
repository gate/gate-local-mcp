/**
 * 端到端：真实 stdio MCP 会话 + mock HTTP，断言出站 Gate API 请求的 User-Agent。
 */
import { describe, test, expect } from 'vitest';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

describe('E2E outbound User-Agent', () => {
  test('tools/call sends 6-segment UA and custom X-Gate-* headers after initialized', async () => {
    let capturedUa: string | undefined;
    let capturedHeaders: Record<string, string | undefined> = {};

    const httpServer = createServer((req, res) => {
      if (req.method === 'GET' && req.url?.startsWith('/api/v4/spot/currencies')) {
        capturedUa = req.headers['user-agent'];
        capturedHeaders = {
          'x-gate-agent': req.headers['x-gate-agent'] as string | undefined,
          'x-gate-agent-version': req.headers['x-gate-agent-version'] as string | undefined,
          'x-gate-mcp-tools-name': req.headers['x-gate-mcp-tools-name'] as string | undefined,
          'x-gate-mcp-name': req.headers['x-gate-mcp-name'] as string | undefined,
          'x-gate-mcp-version': req.headers['x-gate-mcp-version'] as string | undefined,
        };
        res.setHeader('Content-Type', 'application/json');
        res.end('[]');
        return;
      }
      res.statusCode = 404;
      res.end();
    });

    await new Promise<void>((resolve, reject) => {
      httpServer.listen(0, '127.0.0.1', () => resolve());
      httpServer.on('error', reject);
    });

    const addr = httpServer.address();
    if (!addr || typeof addr === 'string') {
      httpServer.close();
      throw new Error('expected TCP address');
    }

    const base = `http://127.0.0.1:${addr.port}`;

    const transport = new StdioClientTransport({
      command: 'node',
      args: ['dist/index.js'],
      cwd: projectRoot,
      env: {
        ...process.env,
        GATE_BASE_URL: base,
        GATE_MODULES: 'spot',
        NODE_NO_WARNINGS: '1',
      } as Record<string, string>,
    });

    const client = new Client({ name: 'e2e-ua-client', version: '2.3.4' });

    try {
      await client.connect(transport);
      await client.callTool({ name: 'cex_spot_list_currencies', arguments: {} });
    } finally {
      await client.close().catch(() => {});
      httpServer.close();
    }

    // User-Agent 6-segment format
    expect(capturedUa).toBeDefined();
    const ua = capturedUa as string;
    const parts = ua.split('/', 6);
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe('gate-local-mcp');
    expect(parts[1]).toMatch(/^\d+\.\d+\.\d+$/);
    expect(parts[2]).toBe('cex_spot_list_currencies');
    expect(parts[3]).toBe('e2e-ua-client');
    expect(parts[4]).toBe('2.3.4');
    expect(typeof parts[5]).toBe('string');

    // Custom X-Gate-* headers
    expect(capturedHeaders['x-gate-agent']).toBe('e2e-ua-client');
    expect(capturedHeaders['x-gate-agent-version']).toBe('2.3.4');
    expect(capturedHeaders['x-gate-mcp-tools-name']).toBe('cex_spot_list_currencies');
    expect(capturedHeaders['x-gate-mcp-name']).toBe('gate-local-mcp');
    expect(capturedHeaders['x-gate-mcp-version']).toMatch(/^\d+\.\d+\.\d+$/);
  }, 30_000);
});
