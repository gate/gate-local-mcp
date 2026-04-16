/**
 * Verify the welfare module has been completely removed.
 *
 * No tool with the cex_welfare_ prefix should exist, and specific
 * previously-known welfare tools must be absent.
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

describe('Welfare module completely removed', () => {
  test('no tool has cex_welfare_ prefix', () => {
    const welfareTools = tools.filter(t => t.name.startsWith('cex_welfare_'));
    expect(welfareTools).toHaveLength(0);
  });

  test('cex_welfare_get_user_identity does not exist', () => {
    expect(tools.find(t => t.name === 'cex_welfare_get_user_identity')).toBeUndefined();
  });

  test('cex_welfare_get_beginner_task_list does not exist', () => {
    expect(tools.find(t => t.name === 'cex_welfare_get_beginner_task_list')).toBeUndefined();
  });
});
