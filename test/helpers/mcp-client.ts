import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

export async function createTestClient(env?: Record<string, string | undefined>) {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['dist/index.js'],
    env: { ...process.env, ...env } as Record<string, string>,
  });
  const client = new Client({ name: 'test-client', version: '1.0' });
  await client.connect(transport);
  return client;
}
