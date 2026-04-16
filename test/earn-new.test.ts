/**
 * E2E tests for new dual investment enhancement tools in the earn module.
 *
 * Tools under test:
 *   cex_earn_get_dual_order_refund_preview
 *   cex_earn_place_dual_order_refund
 *   cex_earn_modify_dual_order_reinvest
 *   cex_earn_get_dual_project_recommend
 */
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { createTestClient } from './helpers/mcp-client.js';
import type { Client } from '@modelcontextprotocol/sdk/client/index.js';

interface ToolInfo {
  name: string;
  description?: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
}

let client: Client;
let tools: ToolInfo[];

beforeAll(async () => {
  client = await createTestClient();
  const result = await client.listTools();
  tools = result.tools as ToolInfo[];
});

afterAll(async () => {
  await client?.close();
});

function findTool(name: string): ToolInfo | undefined {
  return tools.find(t => t.name === name);
}

function requireTool(name: string): ToolInfo {
  const tool = findTool(name);
  expect(tool, `Tool ${name} should exist`).toBeDefined();
  return tool!;
}

// ============================================================================
// Tool existence
// ============================================================================
describe('Dual investment enhancement tools exist', () => {
  const dualTools = [
    'cex_earn_get_dual_order_refund_preview',
    'cex_earn_place_dual_order_refund',
    'cex_earn_modify_dual_order_reinvest',
    'cex_earn_get_dual_project_recommend',
  ];

  for (const name of dualTools) {
    test(`${name} is registered`, () => {
      expect(findTool(name), `${name} should exist`).toBeDefined();
    });
  }
});

// ============================================================================
// Parameter schemas
// ============================================================================
describe('Dual investment tool parameters', () => {
  test('cex_earn_get_dual_order_refund_preview has required order_id', () => {
    const tool = requireTool('cex_earn_get_dual_order_refund_preview');
    expect(tool.inputSchema.properties).toHaveProperty('order_id');
    expect(tool.inputSchema.required).toContain('order_id');
  });

  test('cex_earn_place_dual_order_refund has required order_id and req_id', () => {
    const tool = requireTool('cex_earn_place_dual_order_refund');
    expect(tool.inputSchema.properties).toHaveProperty('order_id');
    expect(tool.inputSchema.properties).toHaveProperty('req_id');
    expect(tool.inputSchema.required).toContain('order_id');
    expect(tool.inputSchema.required).toContain('req_id');
  });
});

// ============================================================================
// Write tool descriptions contain "State-changing"
// ============================================================================
describe('Dual investment write tools are marked State-changing', () => {
  test('cex_earn_place_dual_order_refund description contains State-changing', () => {
    const tool = requireTool('cex_earn_place_dual_order_refund');
    expect(tool.description).toContain('State-changing');
  });

  test('cex_earn_modify_dual_order_reinvest description contains State-changing', () => {
    const tool = requireTool('cex_earn_modify_dual_order_reinvest');
    expect(tool.description).toContain('State-changing');
  });
});

// ============================================================================
// Auth error checks
// ============================================================================
describe('Dual investment auth errors', () => {
  test('cex_earn_place_dual_order_refund returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_earn_place_dual_order_refund',
        arguments: { order_id: '123', req_id: 'req1' },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });

  test('cex_earn_modify_dual_order_reinvest returns auth error without credentials', async () => {
    const noAuthClient = await createTestClient({
      GATE_API_KEY: undefined,
      GATE_API_SECRET: undefined,
    });
    try {
      const result = await noAuthClient.callTool({
        name: 'cex_earn_modify_dual_order_reinvest',
        arguments: { order_id: 1 },
      });
      expect(result.isError).toBe(true);
      const text = (result.content[0] as { text: string }).text;
      expect(text).toContain('GATE_API_KEY');
    } finally {
      await noAuthClient.close();
    }
  });
});

// ============================================================================
// Read-only tool (no auth required for calling)
// ============================================================================
describe('Dual investment read tools', () => {
  test('cex_earn_get_dual_project_recommend is a read operation', () => {
    const tool = requireTool('cex_earn_get_dual_project_recommend');
    // Read tools should NOT contain "State-changing" in description
    expect(tool.description).not.toContain('State-changing');
  });
});
