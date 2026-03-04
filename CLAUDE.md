# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build   # tsc → dist/ (required before npm start)
npm run dev     # run directly with tsx (no build step, useful during development)
npm start       # node dist/index.js
```

There are no tests configured. Type-checking happens via `tsc` during build.

## Architecture

This is an MCP (Model Context Protocol) server that exposes the Gate.com REST API v4 to any MCP-compatible client over stdio.

**Entry point** (`src/index.ts`): creates an `McpServer`, calls all nine `register*Tools()` functions, then connects a `StdioServerTransport`. No HTTP server — communication is entirely over stdin/stdout.

**Client** (`src/client.ts`): `createClient()` instantiates a `gate-api` `ApiClient` using `GATE_BASE_URL` (default `https://api.gateio.ws`) and optionally sets API key/secret from `GATE_API_KEY`/`GATE_API_SECRET`. `requireAuth()` throws a descriptive error if credentials are absent — call it at the top of any private tool handler.

**Utils** (`src/utils.ts`): `textContent(value)` and `errorContent(err)` produce the standard MCP content response shapes. Every tool handler must return one of these — never throw to the MCP runtime.

**Tool modules** (`src/tools/*.ts`): each file exports a single `register*Tools(server: McpServer): void` function. Inside, tools are registered with `server.tool(name, description, zodSchema, handler)`. Modules: `spot`, `futures`, `delivery`, `margin`, `wallet`, `account`, `options`, `earn`, `flash_swap`.

## Conventions when adding tools

- MCP parameter names use **snake_case**; gate-api option/object keys use **camelCase** — translate at the call site.
- gate-api is CommonJS; import with named imports e.g. `import { SpotApi } from 'gate-api'`.
- Instantiate a new API class per call: `new SpotApi(createClient())`.
- Optional parameters: build an `opts` object (`Record<string, unknown>`) and only set keys when the value is defined.
- The `settle` parameter for futures/delivery/options is always `z.enum(['btc', 'usdt'])` — reuse the module-level `settleSchema` pattern.
