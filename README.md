# gate-mcp

An MCP (Model Context Protocol) server that exposes the full [Gate.com](https://www.gate.io) API v4 to any MCP-compatible client (Claude Desktop, etc.).

## Features

- **86 tools** covering Spot, Futures, Delivery, Margin, Wallet, Account, Options, Earn, and Flash Swap APIs
- **Zero config for public endpoints** — market data, tickers, order books work without any credentials
- **Authenticated endpoints** — trading, wallet, and account tools activate automatically when `GATE_API_KEY` + `GATE_API_SECRET` env vars are set
- **Testnet support** — set `GATE_BASE_URL` to use the testnet endpoint

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

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GATE_API_KEY` | No | — | API key for authenticated endpoints |
| `GATE_API_SECRET` | No | — | API secret for authenticated endpoints |
| `GATE_BASE_URL` | No | `https://api.gateio.ws` | Override base URL (e.g. for testnet) |

## Available Tools

### Spot (19 tools)
`list_currencies`, `get_currency`, `list_currency_pairs`, `get_currency_pair`, `list_tickers`, `list_order_book`, `list_trades`, `list_candlesticks`, `get_fee`*, `list_spot_accounts`*, `list_orders`*, `create_order`*, `get_order`*, `cancel_order`*, `amend_order`*, `cancel_orders`*, `list_my_trades`*, `list_all_open_orders`*, `list_spot_price_triggered_orders`*

### Futures (16 tools)
`list_futures_contracts`, `get_futures_contract`, `list_futures_order_book`, `list_futures_candlesticks`, `list_futures_tickers`, `list_futures_funding_rate_history`, `list_futures_accounts`*, `list_positions`*, `get_position`*, `list_futures_orders`*, `create_futures_order`*, `get_futures_order`*, `cancel_futures_order`*, `amend_futures_order`*, `get_my_futures_trades`*, `list_position_close`*, `list_price_triggered_orders`*

### Delivery (11 tools)
`list_delivery_contracts`, `get_delivery_contract`, `list_delivery_order_book`, `list_delivery_candlesticks`, `list_delivery_tickers`, `list_delivery_accounts`*, `list_delivery_positions`*, `list_delivery_orders`*, `create_delivery_order`*, `cancel_delivery_order`*, `get_my_delivery_trades`*

### Margin (5 tools)
`list_margin_accounts`*, `list_margin_account_book`*, `get_auto_repay_status`*, `set_auto_repay`*, `get_margin_transferable`*

### Wallet (9 tools)
`get_total_balance`*, `list_withdrawals`*, `list_deposits`*, `get_deposit_address`*, `transfer`*, `list_sub_account_balances`*, `get_trade_fee`*, `list_currency_chains`, `list_withdraw_status`*

### Account (3 tools)
`get_account_detail`*, `get_account_rate_limit`*, `get_debit_fee`*

### Options (13 tools)
`list_options_underlyings`, `list_options_expirations`, `list_options_contracts`, `list_options_order_book`, `list_options_tickers`, `list_options_candlesticks`, `list_options_account`*, `list_options_positions`*, `list_options_orders`*, `create_options_order`*, `cancel_options_order`*, `list_my_options_trades`*

### Earn (5 tools)
`list_dual_investment_plans`, `list_dual_orders`*, `list_dual_balance`*, `list_structured_products`, `list_structured_orders`*

### Flash Swap (5 tools)
`list_flash_swap_currency_pairs`, `preview_flash_swap_order`*, `create_flash_swap_order`*, `list_flash_swap_orders`*, `get_flash_swap_order`*

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
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_tickers","arguments":{"currency_pair":"BTC_USDT"}}}' | node dist/index.js
```

## License

MIT
