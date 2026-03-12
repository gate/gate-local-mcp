import { ApiClient } from 'gate-api';
import { createRequire } from 'module';

const DEFAULT_BASE_URL = 'https://api.gateio.ws';
const _require = createRequire(import.meta.url);
const { version } = _require('../package.json') as { version: string };
const USER_AGENT = `gate-local-mcp/${version}`;

export function createClient(): ApiClient {
  const baseUrl = process.env.GATE_BASE_URL ?? DEFAULT_BASE_URL;
  const client = new ApiClient(`${baseUrl}/api/v4`);
  client.defaultHeaders = { ...client.defaultHeaders, 'User-Agent': USER_AGENT };
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
