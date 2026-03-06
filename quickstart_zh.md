# gate-mcp 快速入门指南

一个 MCP（模型上下文协议）服务器，将完整的 [Gate.com](https://www.gate.com) API v4 暴露给任何兼容 MCP 的客户端（Claude Desktop、Cursor、Windsurf、OpenAI Agents 等）。

## 功能特性

- **148 个工具**，覆盖现货、合约、交割、杠杆、钱包、账户、期权、理财、闪兑、统一账户和子账户 API
- **公开端点零配置** — 行情数据、价格、订单簿无需任何凭证即可使用
- **认证端点** — 设置 `GATE_API_KEY` + `GATE_API_SECRET` 环境变量后，交易、钱包和账户工具自动启用
- **测试网支持** — 设置 `GATE_BASE_URL` 即可切换到测试网端点

---

## 前置要求

- **Node.js 18+** — [安装指南](https://nodejs.org/en/download)。通过 `node --version` 验证版本。
- **[Gate.com](https://www.gate.com) 账户** — 仅私有/交易工具需要。公开行情数据无需账户。

---

## 获取 API 密钥

1. 登录 [gate.com](https://www.gate.com)
2. 点击右上角的**头像**（个人头像图片）
3. 在下拉菜单中选择 **API 管理**
4. 创建新的 API 密钥 — 仅授予所需权限（持仓监控只需要开只读权限）
5. 复制 **Key** 和 **Secret**（Secret 仅显示一次）
6. 可选：限制特定 IP 地址以提高安全性

---

## Agent 配置

选择你使用的 Agent，按以下步骤操作。所有配置均使用 `npx -y gate-mcp`，无需手动安装。

### Claude Desktop

配置文件路径：
- **macOS**：`~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**：`%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**：`~/.config/Claude/claude_desktop_config.json`

**仅公开端点（无需 API 密钥）：**

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

**带认证（交易、钱包、账户工具）：**

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_API_KEY": "你的-api-key",
        "GATE_API_SECRET": "你的-api-secret"
      }
    }
  }
}
```

编辑完成后，**完全退出并重启** Claude Desktop。聊天输入框中出现锤子图标即表示 MCP 工具已加载成功。

---

### Claude Code（命令行）

```bash
claude mcp add gate -e GATE_API_KEY=你的key -e GATE_API_SECRET=你的secret -- npx -y gate-mcp
```

或直接在项目的 `.claude/settings.json` 中添加：

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_API_KEY": "你的-api-key",
        "GATE_API_SECRET": "你的-api-secret"
      }
    }
  }
}
```

---

### Cursor

1. 打开 **Cursor 设置**（macOS 快捷键 ⌘+Shift+J）
2. 进入 **MCP** 标签页
3. 点击 **Add new global MCP server**，粘贴以下内容：

```json
{
  "gate": {
    "command": "npx",
    "args": ["-y", "gate-mcp"],
    "env": {
      "GATE_API_KEY": "你的-api-key",
      "GATE_API_SECRET": "你的-api-secret"
    }
  }
}
```

或直接编辑 `~/.cursor/mcp.json`，填入相同内容。重启 Cursor 后，工具将在 Composer 的 **Agent** 标签页中可用。

---

### Windsurf

编辑 `~/.codeium/windsurf/mcp_config.json`：

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_API_KEY": "你的-api-key",
        "GATE_API_SECRET": "你的-api-secret"
      }
    }
  }
}
```

保存后重启 Windsurf。

---

### OpenAI Agents SDK（Python）

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
                "GATE_API_KEY": "你的-api-key",
                "GATE_API_SECRET": "你的-api-secret",
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

编辑 `~/.codex/config.toml`：

```toml
[mcp_servers.gate]
command = "npx"
args = ["-y", "gate-mcp"]

[mcp_servers.gate.env]
GATE_API_KEY = "你的-api-key"
GATE_API_SECRET = "你的-api-secret"
```

---

### 任意 stdio MCP 客户端

服务器通过 stdin/stdout 使用 JSON-RPC 按照 MCP 规范通信。启动命令：

```bash
GATE_API_KEY=你的key GATE_API_SECRET=你的secret npx -y gate-mcp
```

---

## 环境变量

| 变量 | 是否必填 | 默认值 | 说明 |
|---|---|---|---|
| `GATE_API_KEY` | 否 | — | 认证端点所需的 API Key |
| `GATE_API_SECRET` | 否 | — | 认证端点所需的 API Secret |
| `GATE_BASE_URL` | 否 | `https://api.gateio.ws` | 覆盖 API 基础地址（如测试网） |

### 测试网配置

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_BASE_URL": "https://api-testnet.gateapi.io",
        "GATE_API_KEY": "你的测试网-api-key",
        "GATE_API_SECRET": "你的测试网-api-secret"
      }
    }
  }
}
```

---

## 示例提问

连接到 Agent 后，可以尝试以下提问：

**行情数据 — 无需 API 密钥**
```
BTC/USDT 当前价格和 24 小时成交量是多少？
今天现货涨幅前 10 的币种有哪些？
给我 ETH/USDT 最近两天的 4 小时 K 线数据。
BTC 永续合约当前资金费率是多少？
SOL_USDT 的盘口深度如何？
```

**持仓与账户 — 需要 API 密钥**
```
我所有资产的总余额是多少？
显示我当前的现货挂单。
查询我的 BTC 和 ETH 钱包余额。
我当前的合约持仓和未实现盈亏是多少？
查看我最近 30 天的充值记录。
```

**交易操作 — 需要 API 密钥，请谨慎使用**
```
以 60000 USDT 限价买入 0.01 BTC。
取消我所有 ETH/USDT 的挂单。
现货买入 1000 USDT 需要支付多少手续费？
预览闪兑：用 100 USDT 换 USDC。
```

---

## 可用工具列表

标有 `*` 的工具需要认证。

### 现货 Spot（19 个工具）
`list_currencies`、`get_currency`、`list_currency_pairs`、`get_currency_pair`、`list_tickers`、`list_order_book`、`list_trades`、`list_candlesticks`、`get_fee`*、`list_spot_accounts`*、`list_orders`*、`create_order`*、`get_order`*、`cancel_order`*、`amend_order`*、`cancel_orders`*、`list_my_trades`*、`list_all_open_orders`*、`list_spot_price_triggered_orders`*

### 合约 Futures（16 个工具）
`list_futures_contracts`、`get_futures_contract`、`list_futures_order_book`、`list_futures_candlesticks`、`list_futures_tickers`、`list_futures_funding_rate_history`、`list_futures_accounts`*、`list_positions`*、`get_position`*、`list_futures_orders`*、`create_futures_order`*、`get_futures_order`*、`cancel_futures_order`*、`amend_futures_order`*、`get_my_futures_trades`*、`list_position_close`*、`list_price_triggered_orders`*

### 交割 Delivery（11 个工具）
`list_delivery_contracts`、`get_delivery_contract`、`list_delivery_order_book`、`list_delivery_candlesticks`、`list_delivery_tickers`、`list_delivery_accounts`*、`list_delivery_positions`*、`list_delivery_orders`*、`create_delivery_order`*、`cancel_delivery_order`*、`get_my_delivery_trades`*

### 杠杆 Margin（5 个工具）
`list_margin_accounts`*、`list_margin_account_book`*、`get_auto_repay_status`*、`set_auto_repay`*、`get_margin_transferable`*

### 钱包 Wallet（9 个工具）
`get_total_balance`*、`list_withdrawals`*、`list_deposits`*、`get_deposit_address`*、`transfer`*、`list_sub_account_balances`*、`get_trade_fee`*、`list_currency_chains`、`list_withdraw_status`*

### 账户 Account（3 个工具）
`get_account_detail`*、`get_account_rate_limit`*、`get_debit_fee`*

### 期权 Options（13 个工具）
`list_options_underlyings`、`list_options_expirations`、`list_options_contracts`、`list_options_order_book`、`list_options_tickers`、`list_options_candlesticks`、`list_options_account`*、`list_options_positions`*、`list_options_orders`*、`create_options_order`*、`cancel_options_order`*、`list_my_options_trades`*

### 理财 Earn（5 个工具）
`list_dual_investment_plans`、`list_dual_orders`*、`list_dual_balance`*、`list_structured_products`、`list_structured_orders`*

### 闪兑 Flash Swap（5 个工具）
`list_flash_swap_currency_pairs`、`preview_flash_swap_order`*、`create_flash_swap_order`*、`list_flash_swap_orders`*、`get_flash_swap_order`*

---

## 警告：写操作风险

下单、撤单、划转资金、修改账户设置等写操作工具会**立即且不可撤销地**作用于你的 Gate.com 真实账户。一旦提交，错误的交易对、方向（买/卖）、数量或价格均无法撤回。

使用任何写操作工具前，请务必：
- 在确认前仔细核对交易对、买卖方向、数量和价格
- 在正式使用前，通过测试网（`GATE_BASE_URL=https://api-testnet.gateapi.io`）验证工作流
- 仅授予 API 密钥实际所需的最小权限——如无交易需求，请使用只读密钥
- 切勿在无人工审核的情况下自动循环执行写操作

**本软件作者对因误用或不当使用写操作工具所造成的任何财务损失不承担任何责任。**

---

## 安全注意事项

- 切勿将 API 密钥硬编码在源文件中或提交到 git。请使用环境变量。
- 如果只需要行情数据或持仓监控，请创建**只读**密钥，无需交易权限。
- 尽可能在 Gate.com 的 API 密钥设置中启用 **IP 白名单**。
- 该服务器完全运行在本地机器上。凭证仅发送至 `api.gateio.ws`（或你配置的基础地址），不会传输至其他任何地方。

---

## 常见问题排查

**报错"Authentication required"（需要认证）**
`GATE_API_KEY` 或 `GATE_API_SECRET` 未设置或不正确。请确认环境变量已正确配置，且密钥在 Gate.com 上拥有所需权限。

**Agent 中工具未出现 / 锤子图标缺失**
编辑配置后，请完全退出并重启 Agent 应用。使用 JSON 验证器检查配置文件是否有语法错误。在终端运行 `npx --version` 确认 `npx` 可正常访问。

**报错"spawn npx ENOENT"**
Node.js 未安装或未加入 PATH。请安装 Node.js 18+ 并通过 `node --version` 和 `npx --version` 验证。

**频率限制报错**
Gate.com 对各端点有请求频率限制，请避免短时间内频繁调用同一工具。可使用 `get_account_rate_limit` 查看当前限制。

**直接验证服务器是否正常运行**

```bash
# 获取 BTC/USDT 行情（公开接口，无需认证）
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"list_tickers","arguments":{"currency_pair":"BTC_USDT"}}}' | npx -y gate-mcp 2>/dev/null | tail -1
```
