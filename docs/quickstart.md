# gate-mcp Quickstart Guide

An MCP (Model Context Protocol) server that exposes the full [Gate](https://www.gate.com) API v4 to any MCP-compatible client (Claude Desktop, Cursor, Windsurf, OpenAI Agents, and more).

## Features

- **181 tools** covering Spot, Futures, Delivery, Margin, Wallet, Account, Options, Earn, Flash Swap, Unified, and Sub-Account APIs
- **Zero config for public endpoints** — market data, tickers, order books work without any credentials
- **Authenticated endpoints** — trading, wallet, and account tools activate automatically when `GATE_API_KEY` + `GATE_API_SECRET` env vars are set
- **Testnet support** — set `GATE_BASE_URL` to use the testnet endpoint
- **Module filtering** — load only the modules you need via `GATE_MODULES` env var or `--modules` CLI flag to stay within tool count limits
- **Read-only mode** — set `GATE_READONLY=true` or pass `--readonly` to disable all write tools

---

## Prerequisites

- **Node.js 18+** — [Installation guide](https://nodejs.org/en/download). Verify with `node --version`.
- A **[Gate](https://www.gate.com) account** — only needed for private/trading tools. Public market data works without credentials.

---

## Getting API Keys

1. Log in to [https://www.gate.com](https://www.gate.com)
2. Click your **avatar** (profile picture) in the top-right corner
3. Select **API Management** from the dropdown menu
4. Create a new API key — grant only the permissions you need (read-only is enough for portfolio monitoring)
5. Copy the **key** and **secret** (the secret is shown only once)
6. Optionally restrict to specific IP addresses for extra security

---

## Agent Setup

Pick your agent and follow the steps below. All configs use `npx -y gate-mcp` so no manual install is needed.

### Claude Desktop

Config file location:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

**Public endpoints only (no API key):**

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

**With authentication (trading, wallet, account tools):**

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

After editing the file, **fully quit and restart** Claude Desktop. A hammer icon in the chat input confirms MCP tools are loaded.

---

### Claude Code (CLI)

```bash
claude mcp add gate -e GATE_API_KEY=your-key -e GATE_API_SECRET=your-secret -- npx -y gate-mcp
```

Or add directly to `.claude/settings.json` in your project:

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

---

### Cursor

1. Open **Cursor Settings** (⌘+Shift+J on macOS)
2. Go to the **MCP** tab
3. Click **Add new global MCP server** and paste:

```json
{
  "gate": {
    "command": "npx",
    "args": ["-y", "gate-mcp"],
    "env": {
      "GATE_API_KEY": "your-api-key",
      "GATE_API_SECRET": "your-api-secret"
    }
  }
}
```

Or edit `~/.cursor/mcp.json` directly with the same content. Restart Cursor. The tools will be available in the **Agent** tab of Composer.

---

### Windsurf

Edit `~/.codeium/windsurf/mcp_config.json`:

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

Restart Windsurf after saving.

---

### OpenAI Agents SDK (Python)

```bash
pip install openai-agents
```

```python
import asyncio
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async def main():
    gate = MCPServerStdio(
        params={
            "command": "npx",
            "args": ["-y", "gate-mcp"],
            "env": {
                "GATE_API_KEY": "your-api-key",
                "GATE_API_SECRET": "your-api-secret",
            },
        }
    )

    agent = Agent(
        name="Trading Assistant",
        instructions="You have access to Gate via MCP tools. Help with market data and portfolio queries.",
        mcp_servers=[gate],
    )

    async with gate:
        result = await Runner.run(agent, "What is the current BTC/USDT price and 24h change?")
        print(result.final_output)

asyncio.run(main())
```

---

### OpenAI Codex CLI

Edit `~/.codex/config.toml`:

```toml
[mcp_servers.gate]
command = "npx"
args = ["-y", "gate-mcp"]

[mcp_servers.gate.env]
GATE_API_KEY = "your-api-key"
GATE_API_SECRET = "your-api-secret"
```

---

### Any stdio MCP client

The server communicates over stdin/stdout using JSON-RPC per the MCP spec. Start it with:

```bash
GATE_API_KEY=your-key GATE_API_SECRET=your-secret npx -y gate-mcp
```

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `GATE_API_KEY` | No | — | API key for authenticated endpoints |
| `GATE_API_SECRET` | No | — | API secret for authenticated endpoints |
| `GATE_BASE_URL` | No | `https://api.gateio.ws` | Override base URL (e.g. for testnet) |
| `GATE_MODULES` | No | all modules | Comma-separated list of modules to load (e.g. `spot,futures`) |
| `GATE_READONLY` | No | `false` | Set to `true` to disable all write (order/transfer) tools |

### Testnet

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

---

## Module Filtering

By default all 181 tools (11 modules) are registered. Clients like Cursor warn when a server provides more than 80 tools — use module filtering to load only what you need.

**Via MCP config (recommended):**

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_MODULES": "spot,futures",
        "GATE_API_KEY": "your-api-key",
        "GATE_API_SECRET": "your-api-secret"
      }
    }
  }
}
```

**Read-only mode** (removes all order/transfer tools):

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_MODULES": "spot,futures",
        "GATE_READONLY": "true"
      }
    }
  }
}
```

**Available modules and tool counts:**

| Module | Total tools | Read-only tools |
|---|---|---|
| `spot` | 28 | 18 |
| `futures` | 45 | 26 |
| `delivery` | 11 | 9 |
| `margin` | 5 | 4 |
| `wallet` | 12 | 9 |
| `account` | 10 | 6 |
| `options` | 13 | 11 |
| `earn` | 25 | 19 |
| `flash_swap` | 5 | 4 |
| `unified` | 16 | 12 |
| `sub_account` | 11 | 5 |

---

## Example Prompts

Once connected to your agent, try these:

**Market data — no API key needed**
```
What's the current BTC/USDT price and 24h volume?
Show me the top 10 spot gainers today.
Give me 4-hour ETH/USDT candles for the last 2 days.
What's the current BTC perpetual futures funding rate?
Show the order book depth for SOL_USDT.
```

**Portfolio & account — API key required**
```
What's my total balance across all assets?
Show my open spot orders.
List my BTC and ETH wallet balances.
What are my current futures positions and unrealised PnL?
Show my deposit history for the last 30 days.
```

**Trading — API key required, use with care**
```
Place a limit buy for 0.01 BTC at 60000 USDT.
Cancel all my open ETH/USDT orders.
What trading fee will I pay on a 1000 USDT spot order?
Preview a flash swap: sell 100 USDT for USDC.
```

---

## Available Tools

Tools marked `*` require authentication. Tool names use the convention `cex_{module}_{action}` — some module names are abbreviated (`futures` → `fx`, `flash_swap` → `fc`, `sub_account` → `sa`).

### Spot (28 tools)
`cex_spot_list_currencies`, `cex_spot_get_currency`, `cex_spot_list_currency_pairs`, `cex_spot_get_currency_pair`, `cex_spot_get_spot_tickers`, `cex_spot_get_spot_order_book`, `cex_spot_get_spot_trades`, `cex_spot_get_spot_candlesticks`, `cex_spot_get_spot_fee`\*, `cex_spot_get_spot_accounts`\*, `cex_spot_list_spot_account_book`\*, `cex_spot_list_spot_orders`\*, `cex_spot_create_spot_order`\*, `cex_spot_get_spot_order`\*, `cex_spot_cancel_spot_order`\*, `cex_spot_amend_spot_order`\*, `cex_spot_cancel_all_spot_orders`\*, `cex_spot_create_spot_batch_orders`\*, `cex_spot_cancel_spot_batch_orders`\*, `cex_spot_get_spot_batch_fee`\*, `cex_spot_list_spot_my_trades`\*, `cex_spot_list_all_open_orders`\*, `cex_spot_list_spot_price_triggered_orders`\*, `cex_spot_create_spot_price_triggered_order`\*, `cex_spot_get_spot_price_triggered_order`\*, `cex_spot_cancel_spot_price_triggered_order`\*, `cex_spot_cancel_spot_price_triggered_order_list`\*, `cex_spot_countdown_cancel_all_spot`\*

### Futures (45 tools) — prefix: `cex_fx_`
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

### Earn (25 tools)
`cex_earn_rate_list_eth2`, `cex_earn_list_dual_investment_plans`, `cex_earn_list_structured_products`, `cex_earn_find_coin`, `cex_earn_list_uni_currencies`, `cex_earn_get_uni_currency`, `cex_earn_list_uni_chart`, `cex_earn_list_uni_rate`, `cex_earn_swap_eth2`\*, `cex_earn_list_dual_orders`\*, `cex_earn_place_dual_order`\*, `cex_earn_list_dual_balance`\*, `cex_earn_list_structured_orders`\*, `cex_earn_place_structured_order`\*, `cex_earn_swap_staking_coin`\*, `cex_earn_order_list`\*, `cex_earn_award_list`\*, `cex_earn_asset_list`\*, `cex_earn_list_user_uni_lends`\*, `cex_earn_create_uni_lend`\*, `cex_earn_change_uni_lend`\*, `cex_earn_list_uni_lend_records`\*, `cex_earn_get_uni_interest`\*, `cex_earn_list_uni_interest_records`\*, `cex_earn_get_uni_interest_status`\*

### Flash Swap (5 tools) — prefix: `cex_fc_`
`cex_fc_list_fc_currency_pairs`, `cex_fc_preview_fc_order`\*, `cex_fc_create_fc_order`\*, `cex_fc_list_fc_orders`\*, `cex_fc_get_fc_order`\*

### Unified Account (16 tools)
`cex_unified_list_currency_discount_tiers`, `cex_unified_get_unified_accounts`\*, `cex_unified_list_unified_currencies`\*, `cex_unified_get_unified_mode`\*, `cex_unified_set_unified_mode`\*, `cex_unified_get_unified_risk_units`\*, `cex_unified_get_unified_borrowable`\*, `cex_unified_get_unified_transferable`\*, `cex_unified_get_unified_estimate_rate`\*, `cex_unified_list_unified_loans`\*, `cex_unified_create_unified_loan`\*, `cex_unified_list_unified_loan_records`\*, `cex_unified_list_unified_loan_interest_records`\*, `cex_unified_get_user_leverage_currency_setting`\*, `cex_unified_set_user_leverage_currency_setting`\*, `cex_unified_set_unified_collateral`\*

### Sub-Account (11 tools) — prefix: `cex_sa_`
`cex_sa_list_sas`\*, `cex_sa_create_sa`\*, `cex_sa_get_sa`\*, `cex_sa_lock_sa`\*, `cex_sa_unlock_sa`\*, `cex_sa_list_sa_keys`\*, `cex_sa_get_sa_key`\*, `cex_sa_create_sa_key`\*, `cex_sa_update_sa_key`\*, `cex_sa_get_sa_unified_mode`\*, `cex_sa_delete_sa_key`\*

---

## Warning: Write Operations

Tools that place orders, cancel orders, transfer funds, or change account settings execute **immediately and irreversibly** against your live Gate account. Mistakes — such as wrong size, price, or direction — cannot be undone once submitted.

Before using any write tool, always:
- Double-check the currency pair, side (buy/sell), amount, and price before confirming
- Use the testnet (`GATE_BASE_URL=https://api-testnet.gateapi.io`) to test workflows before going live
- Grant your API key only the permissions you actually need — if you don't intend to trade, use a read-only key
- Never run write operations in an automated loop without a human review step

**The authors of this software take no responsibility for financial losses caused by unintended or erroneous use of write tools.**

---

## Security Notes

- Never hardcode API keys in source files or commit them to git. Use environment variables.
- Create a **read-only** key if you only need market data or portfolio monitoring — no trading permissions needed.
- Enable **IP whitelisting** on your Gate API key when possible.
- This server runs entirely on your local machine. Credentials are sent only to `api.gateio.ws` (or your configured base URL) and nowhere else.

---

## Troubleshooting

**"Authentication required" error**
`GATE_API_KEY` or `GATE_API_SECRET` are missing or incorrect. Verify the env vars are set and the key has the required permissions on Gate.

**Tools not appearing in agent / hammer icon missing**
Fully quit and restart the agent app after editing config. Check the config file for JSON syntax errors with a JSON validator. Ensure `npx` is accessible (`npx --version` in terminal).

**"spawn npx ENOENT"**
Node.js is not installed or not on PATH. Install Node.js 18+ and verify with `node --version` and `npx --version`.

**Rate limit errors**
Gate enforces per-endpoint rate limits. Avoid rapid repeated calls. Use `get_account_rate_limit` to check your current limits.

**Verify the server works directly**

```bash
# Fetch BTC/USDT ticker (public, no auth needed)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"cex_spot_get_spot_tickers","arguments":{"currency_pair":"BTC_USDT"}}}' | npx -y gate-mcp 2>/dev/null | tail -1
```
