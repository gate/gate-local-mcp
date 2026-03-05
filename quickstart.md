# gate-mcp Quickstart Guide

An MCP (Model Context Protocol) server that exposes the full [Gate.com](https://www.gate.com) API v4 to any MCP-compatible client (Claude Desktop, Cursor, Windsurf, OpenAI Agents, and more).

## Features

- **86 tools** covering Spot, Futures, Delivery, Margin, Wallet, Account, Options, Earn, and Flash Swap APIs
- **Zero config for public endpoints** — market data, tickers, order books work without any credentials
- **Authenticated endpoints** — trading, wallet, and account tools activate automatically when `GATE_API_KEY` + `GATE_API_SECRET` env vars are set
- **Testnet support** — set `GATE_BASE_URL` to use the testnet endpoint

---

## Prerequisites

- **Node.js 18+** — [Installation guide](https://nodejs.org/en/download). Verify with `node --version`.
- A **[Gate.com](https://www.gate.com) account** — only needed for private/trading tools. Public market data works without credentials.

---

## Getting API Keys

1. Log in to [gate.com](https://www.gate.com)
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
        instructions="You have access to Gate.com via MCP tools. Help with market data and portfolio queries.",
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

Tools marked with `*` require authentication.

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

---

## Security Notes

- Never hardcode API keys in source files or commit them to git. Use environment variables.
- Create a **read-only** key if you only need market data or portfolio monitoring — no trading permissions needed.
- Enable **IP whitelisting** on your Gate.com API key when possible.
- This server runs entirely on your local machine. Credentials are sent only to `api.gateio.ws` (or your configured base URL) and nowhere else.

---

## Troubleshooting

**"Authentication required" error**
`GATE_API_KEY` or `GATE_API_SECRET` are missing or incorrect. Verify the env vars are set and the key has the required permissions on Gate.com.

**Tools not appearing in agent / hammer icon missing**
Fully quit and restart the agent app after editing config. Check the config file for JSON syntax errors with a JSON validator. Ensure `npx` is accessible (`npx --version` in terminal).

**"spawn npx ENOENT"**
Node.js is not installed or not on PATH. Install Node.js 18+ and verify with `node --version` and `npx --version`.

**Rate limit errors**
Gate.com enforces per-endpoint rate limits. Avoid rapid repeated calls. Use `get_account_rate_limit` to check your current limits.

**Verify the server works directly**

```bash
# Fetch BTC/USDT ticker (public, no auth needed)
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_tickers","arguments":{"currency_pair":"BTC_USDT"}}}' | npx -y gate-mcp 2>/dev/null | tail -1
```
