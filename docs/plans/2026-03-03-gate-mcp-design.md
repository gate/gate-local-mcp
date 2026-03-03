# Gate MCP Server — Design Plan (2026-03-03)

## Summary

MCP server exposing Gate.com API v4 to any MCP-compatible client. Zero config for public endpoints; authenticated endpoints activate via `GATE_API_KEY` + `GATE_API_SECRET` env vars.

## Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Language | TypeScript/Node.js | MCP SDK is TS-first; matches Gate's official SDK language |
| Gate SDK | `gate-api` v7.2.26 | Official, actively maintained, handles HMAC-SHA512 signing |
| Tool naming | snake_case | Follows MCP convention |
| Auth | Env vars | Standard, works with npx and MCP client env config |
| Base URL | `GATE_BASE_URL` env var | Allows testnet or custom endpoints |
| Distribution | `npx -y gate-mcp` | Zero-install; published to npm as `gate-mcp` |

## Architecture

```
src/
  index.ts         Entry point: creates MCP server, registers tools, starts stdio transport
  client.ts        Gate SDK client factory — reads env vars, configures ApiClient
  utils.ts         textContent/errorContent helpers
  tools/
    spot.ts        SpotApi (19 tools)
    futures.ts     FuturesApi (17 tools)
    delivery.ts    DeliveryApi (11 tools)
    margin.ts      MarginApi (5 tools)
    wallet.ts      WalletApi (9 tools)
    account.ts     AccountApi (3 tools)
    options.ts     OptionsApi (13 tools)
    earn.ts        EarnApi (5 tools)
    flash_swap.ts  FlashSwapApi (5 tools)
```

## Verification Results

- Build: clean (no TypeScript errors)
- Tool count: 86 tools registered
- Public tool test: `list_tickers` for BTC_USDT returns live data
- Auth guard: returns clear error message when credentials not set
