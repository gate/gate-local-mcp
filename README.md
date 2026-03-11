# gate-local-mcp

A local (stdio) MCP server that exposes the full [Gate](https://www.gate.com) API v4 to any MCP-compatible client (Claude Desktop, etc.).

**Quickstart guides:** [English](docs/quickstart.md) · [中文](docs/quickstart_zh.md)

> **Looking for the remote MCP server?** If you need HTTP/SSE-based remote access instead of local stdio, see [gate/gate-mcp](https://github.com/gate/gate-mcp).

## Features

- **161 tools** covering Spot, Futures, Delivery, Margin, Wallet, Account, Options, Earn, Flash Swap, Unified, and Sub-Account APIs
- **Zero config for public endpoints** — market data, tickers, order books work without any credentials
- **Authenticated endpoints** — trading, wallet, and account tools activate automatically when `GATE_API_KEY` + `GATE_API_SECRET` env vars are set
- **Testnet support** — set `GATE_BASE_URL` to use the testnet endpoint
- **Module filtering** — load only the modules you need via `GATE_MODULES` or `--modules`; use `GATE_READONLY` or `--readonly` to restrict to read-only tools

## Quick Start (Claude Desktop)

### Public endpoints only (no auth required)

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"]
    }
  }
}
```

### With authentication (trading, wallet, account)

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_API_KEY": "your-api-key",
        "GATE_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

### Testnet with credentials

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_BASE_URL": "https://api-testnet.gateapi.io",
        "GATE_API_KEY": "your-testnet-key",
        "GATE_API_SECRET": "your-testnet-secret"
      }
    }
  }
}
```

## Module Filtering

By default all 161 tools (11 modules) are registered. To reduce the tool count (e.g. Cursor warns above 80), restrict to specific modules:

**CLI flags:**
```bash
# Load only spot and futures tools (73 tools)
GATE_API_KEY=... npx gate-mcp --modules=spot,futures

# Load futures tools in read-only mode (26 tools)
npx gate-mcp --modules=futures --readonly
```

**MCP config (env vars):**
```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_MODULES": "spot,futures",
        "GATE_READONLY": "true",
        "GATE_API_KEY": "your-api-key",
        "GATE_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

**Available modules:** `spot`, `futures`, `delivery`, `margin`, `wallet`, `account`, `options`, `earn`, `flash_swap`, `unified`, `sub_account`

| Module | Total | Read-only |
|---|---|---|
| spot | 28 | 18 |
| futures | 45 | 26 |
| delivery | 11 | 9 |
| margin | 5 | 4 |
| wallet | 12 | 9 |
| account | 10 | 6 |
| options | 13 | 11 |
| earn | 5 | 5 |
| flash_swap | 5 | 4 |
| unified | 16 | 12 |
| sub_account | 11 | 5 |

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GATE_API_KEY` | No | — | API key for authenticated endpoints |
| `GATE_API_SECRET` | No | — | API secret for authenticated endpoints |
| `GATE_BASE_URL` | No | `https://api.gateio.ws` | Override base URL (e.g. for testnet) |
| `GATE_MODULES` | No | all modules | Comma-separated list of modules to load (e.g. `spot,futures`) |
| `GATE_READONLY` | No | `false` | Set to `true` to disable all write (order/transfer) tools |

## Available Tools

Tools marked `*` require authentication (`GATE_API_KEY` + `GATE_API_SECRET`).

### Spot (28 tools)
`cex_spot_list_currencies`, `cex_spot_get_currency`, `cex_spot_list_currency_pairs`, `cex_spot_get_currency_pair`, `cex_spot_get_spot_tickers`, `cex_spot_get_spot_order_book`, `cex_spot_get_spot_trades`, `cex_spot_get_spot_candlesticks`, `cex_spot_get_spot_fee`\*, `cex_spot_get_spot_accounts`\*, `cex_spot_list_spot_account_book`\*, `cex_spot_list_spot_orders`\*, `cex_spot_create_spot_order`\*, `cex_spot_get_spot_order`\*, `cex_spot_cancel_spot_order`\*, `cex_spot_amend_spot_order`\*, `cex_spot_cancel_all_spot_orders`\*, `cex_spot_create_spot_batch_orders`\*, `cex_spot_cancel_spot_batch_orders`\*, `cex_spot_get_spot_batch_fee`\*, `cex_spot_list_spot_my_trades`\*, `cex_spot_list_all_open_orders`\*, `cex_spot_list_spot_price_triggered_orders`\*, `cex_spot_create_spot_price_triggered_order`\*, `cex_spot_get_spot_price_triggered_order`\*, `cex_spot_cancel_spot_price_triggered_order`\*, `cex_spot_cancel_spot_price_triggered_order_list`\*, `cex_spot_countdown_cancel_all_spot`\*

### Futures (45 tools) — prefix abbreviated to `cex_fx_`
`cex_fx_list_fx_contracts`, `cex_fx_get_fx_contract`, `cex_fx_get_fx_order_book`, `cex_fx_get_fx_candlesticks`, `cex_fx_get_fx_tickers`, `cex_fx_get_fx_funding_rate`, `cex_fx_get_fx_trades`, `cex_fx_list_contract_stats`, `cex_fx_get_fx_premium_index`, `cex_fx_get_fx_accounts`\*, `cex_fx_list_fx_account_book`\*, `cex_fx_get_fx_fee`\*, `cex_fx_list_fx_positions`\*, `cex_fx_get_fx_position`\*, `cex_fx_get_leverage`\*, `cex_fx_update_fx_position_leverage`\*, `cex_fx_update_fx_position_margin`\*, `cex_fx_update_fx_position_risk_limit`\*, `cex_fx_list_fx_orders`\*, `cex_fx_create_fx_order`\*, `cex_fx_get_fx_order`\*, `cex_fx_cancel_fx_order`\*, `cex_fx_cancel_all_fx_orders`\*, `cex_fx_amend_fx_order`\*, `cex_fx_create_fx_batch_orders`\*, `cex_fx_cancel_fx_batch_orders`\*, `cex_fx_get_fx_orders_with_time_range`\*, `cex_fx_list_fx_my_trades`\*, `cex_fx_get_fx_my_trades_timerange`\*, `cex_fx_list_position_close`\*, `cex_fx_list_fx_liq_orders`\*, `cex_fx_list_price_triggered_orders`\*, `cex_fx_create_fx_price_triggered_order`\*, `cex_fx_get_fx_price_triggered_order`\*, `cex_fx_cancel_fx_price_triggered_order`\*, `cex_fx_cancel_fx_price_triggered_order_list`\*, `cex_fx_countdown_cancel_all_fx`\*, `cex_fx_list_fx_risk_limit_tiers`\*, `cex_fx_set_fx_dual`\*, `cex_fx_get_fx_dual_position`\*, `cex_fx_update_fx_dual_position_margin`\*, `cex_fx_update_fx_dual_position_leverage`\*, `cex_fx_update_fx_dual_position_risk_limit`\*, `cex_fx_update_fx_position_cross_mode`\*, `cex_fx_update_fx_dual_position_cross_mode`\*

### Delivery (11 tools)
`cex_delivery_list_delivery_contracts`, `cex_delivery_get_delivery_contract`, `cex_delivery_list_delivery_order_book`, `cex_delivery_list_delivery_candlesticks`, `cex_delivery_list_delivery_tickers`, `cex_delivery_list_delivery_accounts`\*, `cex_delivery_list_delivery_positions`\*, `cex_delivery_list_delivery_orders`\*, `cex_delivery_create_delivery_order`\*, `cex_delivery_cancel_delivery_order`\*, `cex_delivery_get_my_delivery_trades`\*

### Margin (5 tools)
`cex_margin_list_margin_accounts`\*, `cex_margin_list_margin_account_book`\*, `cex_margin_get_auto_repay_status`\*, `cex_margin_set_auto_repay`\*, `cex_margin_get_margin_transferable`\*

### Wallet (12 tools)
`cex_wallet_list_currency_chains`, `cex_wallet_get_total_balance`\*, `cex_wallet_list_withdrawals`\*, `cex_wallet_list_deposits`\*, `cex_wallet_get_deposit_address`\*, `cex_wallet_create_transfer`\*, `cex_wallet_list_sa_balances`\*, `cex_wallet_get_wallet_fee`\*, `cex_wallet_create_sa_transfer`\*, `cex_wallet_create_sa_to_sa_transfer`\*, `cex_wallet_get_transfer_order_status`\*, `cex_wallet_list_withdraw_status`\*

### Account (10 tools)
`cex_account_get_account_detail`\*, `cex_account_get_account_rate_limit`\*, `cex_account_get_debit_fee`\*, `cex_account_set_debit_fee`\*, `cex_account_get_account_main_keys`\*, `cex_account_list_stp_groups`\*, `cex_account_create_stp_group`\*, `cex_account_list_stp_group_users`\*, `cex_account_add_stp_group_users`\*, `cex_account_delete_stp_group_user`\*

### Options (13 tools)
`cex_options_list_options_underlyings`, `cex_options_list_options_expirations`, `cex_options_list_options_contracts`, `cex_options_get_options_contract`, `cex_options_list_options_order_book`, `cex_options_list_options_tickers`, `cex_options_list_options_candlesticks`, `cex_options_list_options_account`\*, `cex_options_list_options_positions`\*, `cex_options_list_options_orders`\*, `cex_options_create_options_order`\*, `cex_options_cancel_options_order`\*, `cex_options_list_my_options_trades`\*

### Earn (5 tools)
`cex_earn_list_dual_investment_plans`, `cex_earn_list_structured_products`, `cex_earn_list_dual_orders`\*, `cex_earn_list_dual_balance`\*, `cex_earn_list_structured_orders`\*

### Flash Swap (5 tools) — prefix abbreviated to `cex_fc_`
`cex_fc_list_fc_currency_pairs`, `cex_fc_preview_fc_order`\*, `cex_fc_create_fc_order`\*, `cex_fc_list_fc_orders`\*, `cex_fc_get_fc_order`\*

### Unified Account (16 tools)
`cex_unified_list_currency_discount_tiers`, `cex_unified_get_unified_accounts`\*, `cex_unified_list_unified_currencies`\*, `cex_unified_get_unified_mode`\*, `cex_unified_set_unified_mode`\*, `cex_unified_get_unified_risk_units`\*, `cex_unified_get_unified_borrowable`\*, `cex_unified_get_unified_transferable`\*, `cex_unified_get_unified_estimate_rate`\*, `cex_unified_list_unified_loans`\*, `cex_unified_create_unified_loan`\*, `cex_unified_list_unified_loan_records`\*, `cex_unified_list_unified_loan_interest_records`\*, `cex_unified_get_user_leverage_currency_setting`\*, `cex_unified_set_user_leverage_currency_setting`\*, `cex_unified_set_unified_collateral`\*

### Sub-Account (11 tools) — prefix abbreviated to `cex_sa_`
`cex_sa_list_sas`\*, `cex_sa_create_sa`\*, `cex_sa_get_sa`\*, `cex_sa_lock_sa`\*, `cex_sa_unlock_sa`\*, `cex_sa_list_sa_keys`\*, `cex_sa_get_sa_key`\*, `cex_sa_create_sa_key`\*, `cex_sa_update_sa_key`\*, `cex_sa_get_sa_unified_mode`\*, `cex_sa_delete_sa_key`\*

*\* Requires authentication (`GATE_API_KEY` + `GATE_API_SECRET`)*

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Development mode (no build step)
npm run dev
```

## Local smoke test

```bash
# List all tools
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node dist/index.js

# Get BTC_USDT ticker (public, no auth)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"cex_spot_get_spot_tickers","arguments":{"currency_pair":"BTC_USDT"}}}' | node dist/index.js
```

## License

MIT
