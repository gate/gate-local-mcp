# gate-mcp 快速入门指南

一个 MCP（模型上下文协议）服务器，将完整的 [Gate](https://www.gate.com) API v4 暴露给任何兼容 MCP 的客户端（Claude Desktop、Cursor、Windsurf、OpenAI Agents 等）。

## 功能特性

- **200 个工具**，覆盖现货、合约、交割、杠杆、钱包、账户、期权、理财、闪兑、统一账户和子账户 API
- **公开端点零配置** — 行情数据、价格、订单簿无需任何凭证即可使用
- **认证端点** — 设置 `GATE_API_KEY` + `GATE_API_SECRET` 环境变量后，交易、钱包和账户工具自动启用
- **测试网支持** — 设置 `GATE_BASE_URL` 即可切换到测试网端点
- **模块过滤** — 通过 `GATE_MODULES` 环境变量或 `--modules` CLI 参数只加载所需模块，将工具数量控制在限制范围内
- **只读模式** — 设置 `GATE_READONLY=true` 或传入 `--readonly` 禁用所有写操作工具

---

## 前置要求

- **Node.js 18+** — [安装指南](https://nodejs.org/en/download)。通过 `node --version` 验证版本。
- **[Gate](https://www.gate.com) 账户** — 仅私有/交易工具需要。公开行情数据无需账户。

---

## 获取 API 密钥

1. 登录 [https://www.gate.com](https://www.gate.com)
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
| `GATE_MODULES` | 否 | 全部模块 | 需要加载的模块列表，逗号分隔（例如 `spot,futures`） |
| `GATE_READONLY` | 否 | `false` | 设为 `true` 时禁用所有写操作（下单/划转）工具 |

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

## 模块过滤

默认情况下会注册全部 200 个工具（11 个模块）。Cursor 等客户端在工具数量超过 80 个时会发出警告——使用模块过滤可以只加载所需内容。

**通过 MCP 配置（推荐）：**

```json
{
  "mcpServers": {
    "gate": {
      "command": "npx",
      "args": ["-y", "gate-mcp"],
      "env": {
        "GATE_MODULES": "spot,futures",
        "GATE_API_KEY": "你的-api-key",
        "GATE_API_SECRET": "你的-api-secret"
      }
    }
  }
}
```

**只读模式**（移除所有下单/划转工具）：

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

**可用模块及工具数量：**

| 模块 | 总工具数 | 只读工具数 |
|---|---|---|
| `spot` | 28 | 18 |
| `futures` | 64 | 36 |
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

标有 `*` 的工具需要认证。工具名称格式为 `cex_{模块}_{操作}`，部分模块名有缩写（`futures` → `fx`、`flash_swap` → `fc`、`sub_account` → `sa`）。

### 现货 Spot（28 个工具）
`cex_spot_list_currencies`、`cex_spot_get_currency`、`cex_spot_list_currency_pairs`、`cex_spot_get_currency_pair`、`cex_spot_get_spot_tickers`、`cex_spot_get_spot_order_book`、`cex_spot_get_spot_trades`、`cex_spot_get_spot_candlesticks`、`cex_spot_get_spot_fee`\*、`cex_spot_get_spot_accounts`\*、`cex_spot_list_spot_account_book`\*、`cex_spot_list_spot_orders`\*、`cex_spot_create_spot_order`\*、`cex_spot_get_spot_order`\*、`cex_spot_cancel_spot_order`\*、`cex_spot_amend_spot_order`\*、`cex_spot_cancel_all_spot_orders`\*、`cex_spot_create_spot_batch_orders`\*、`cex_spot_cancel_spot_batch_orders`\*、`cex_spot_get_spot_batch_fee`\*、`cex_spot_list_spot_my_trades`\*、`cex_spot_list_all_open_orders`\*、`cex_spot_list_spot_price_triggered_orders`\*、`cex_spot_create_spot_price_triggered_order`\*、`cex_spot_get_spot_price_triggered_order`\*、`cex_spot_cancel_spot_price_triggered_order`\*、`cex_spot_cancel_spot_price_triggered_order_list`\*、`cex_spot_countdown_cancel_all_spot`\*

### 合约 Futures（64 个工具）— 前缀：`cex_fx_`
`cex_fx_list_fx_contracts`、`cex_fx_get_fx_contract`、`cex_fx_get_fx_order_book`、`cex_fx_get_fx_candlesticks`、`cex_fx_get_fx_tickers`、`cex_fx_get_fx_funding_rate`、`cex_fx_get_fx_trades`、`cex_fx_list_contract_stats`、`cex_fx_get_fx_premium_index`、`cex_fx_list_batch_fx_funding_rates`、`cex_fx_list_fx_insurance_ledger`、`cex_fx_get_index_constituents`、`cex_fx_list_liquidated_orders`、`cex_fx_get_fx_accounts`\*、`cex_fx_list_fx_account_book`\*、`cex_fx_list_fx_positions`\*、`cex_fx_list_positions_timerange`\*、`cex_fx_get_fx_position`\*、`cex_fx_get_leverage`\*、`cex_fx_get_fx_fee`\*、`cex_fx_list_fx_risk_limit_tiers`、`cex_fx_get_fx_risk_limit_table`\*、`cex_fx_list_fx_orders`\*、`cex_fx_create_fx_order`\*、`cex_fx_create_fx_bbo_order`\*、`cex_fx_get_fx_order`\*、`cex_fx_amend_fx_order`\*、`cex_fx_cancel_fx_order`\*、`cex_fx_cancel_all_fx_orders`\*、`cex_fx_create_fx_batch_orders`\*、`cex_fx_cancel_fx_batch_orders`\*、`cex_fx_amend_batch_fx_orders`\*、`cex_fx_get_fx_orders_with_time_range`\*、`cex_fx_list_fx_my_trades`\*、`cex_fx_get_fx_my_trades_timerange`\*、`cex_fx_list_position_close`\*、`cex_fx_list_fx_liq_orders`\*、`cex_fx_list_auto_deleverages`\*、`cex_fx_update_fx_position_leverage`\*、`cex_fx_update_fx_contract_position_leverage`\*、`cex_fx_update_fx_position_margin`\*、`cex_fx_update_fx_position_risk_limit`\*、`cex_fx_update_fx_position_cross_mode`\*、`cex_fx_update_fx_dual_position_cross_mode`\*、`cex_fx_set_fx_dual`\*、`cex_fx_set_position_mode`\*、`cex_fx_get_fx_dual_position`\*、`cex_fx_update_fx_dual_position_margin`\*、`cex_fx_update_fx_dual_position_leverage`\*、`cex_fx_update_fx_dual_position_risk_limit`\*、`cex_fx_countdown_cancel_all_fx`\*、`cex_fx_create_trail_order`\*、`cex_fx_get_trail_orders`\*、`cex_fx_get_trail_order_detail`\*、`cex_fx_update_trail_order`\*、`cex_fx_stop_trail_order`\*、`cex_fx_stop_all_trail_orders`\*、`cex_fx_get_trail_order_change_log`\*、`cex_fx_list_price_triggered_orders`\*、`cex_fx_create_fx_price_triggered_order`\*、`cex_fx_get_fx_price_triggered_order`\*、`cex_fx_update_fx_price_triggered_order`\*、`cex_fx_cancel_fx_price_triggered_order`\*、`cex_fx_cancel_fx_price_triggered_order_list`\*

### 交割 Delivery（11 个工具）
`cex_delivery_list_delivery_contracts`、`cex_delivery_get_delivery_contract`、`cex_delivery_list_delivery_order_book`、`cex_delivery_list_delivery_candlesticks`、`cex_delivery_list_delivery_tickers`、`cex_delivery_list_delivery_accounts`\*、`cex_delivery_list_delivery_positions`\*、`cex_delivery_list_delivery_orders`\*、`cex_delivery_create_delivery_order`\*、`cex_delivery_cancel_delivery_order`\*、`cex_delivery_get_my_delivery_trades`\*

### 杠杆 Margin（5 个工具）
`cex_margin_list_margin_accounts`\*、`cex_margin_list_margin_account_book`\*、`cex_margin_get_auto_repay_status`\*、`cex_margin_set_auto_repay`\*、`cex_margin_get_margin_transferable`\*

### 钱包 Wallet（12 个工具）
`cex_wallet_list_currency_chains`、`cex_wallet_get_total_balance`\*、`cex_wallet_list_withdrawals`\*、`cex_wallet_list_deposits`\*、`cex_wallet_get_deposit_address`\*、`cex_wallet_create_transfer`\*、`cex_wallet_list_sa_balances`\*、`cex_wallet_get_wallet_fee`\*、`cex_wallet_create_sa_transfer`\*、`cex_wallet_create_sa_to_sa_transfer`\*、`cex_wallet_get_transfer_order_status`\*、`cex_wallet_list_withdraw_status`\*

### 账户 Account（10 个工具）
`cex_account_get_account_detail`\*、`cex_account_get_account_rate_limit`\*、`cex_account_get_debit_fee`\*、`cex_account_set_debit_fee`\*、`cex_account_get_account_main_keys`\*、`cex_account_list_stp_groups`\*、`cex_account_create_stp_group`\*、`cex_account_list_stp_group_users`\*、`cex_account_add_stp_group_users`\*、`cex_account_delete_stp_group_user`\*

### 期权 Options（13 个工具）
`cex_options_list_options_underlyings`、`cex_options_list_options_expirations`、`cex_options_list_options_contracts`、`cex_options_get_options_contract`、`cex_options_list_options_order_book`、`cex_options_list_options_tickers`、`cex_options_list_options_candlesticks`、`cex_options_list_options_account`\*、`cex_options_list_options_positions`\*、`cex_options_list_options_orders`\*、`cex_options_create_options_order`\*、`cex_options_cancel_options_order`\*、`cex_options_list_my_options_trades`\*

### 理财 Earn（25 个工具）
`cex_earn_rate_list_eth2`、`cex_earn_list_dual_investment_plans`、`cex_earn_list_structured_products`、`cex_earn_find_coin`、`cex_earn_list_uni_currencies`、`cex_earn_get_uni_currency`、`cex_earn_list_uni_chart`、`cex_earn_list_uni_rate`、`cex_earn_swap_eth2`\*、`cex_earn_list_dual_orders`\*、`cex_earn_place_dual_order`\*、`cex_earn_list_dual_balance`\*、`cex_earn_list_structured_orders`\*、`cex_earn_place_structured_order`\*、`cex_earn_swap_staking_coin`\*、`cex_earn_order_list`\*、`cex_earn_award_list`\*、`cex_earn_asset_list`\*、`cex_earn_list_user_uni_lends`\*、`cex_earn_create_uni_lend`\*、`cex_earn_change_uni_lend`\*、`cex_earn_list_uni_lend_records`\*、`cex_earn_get_uni_interest`\*、`cex_earn_list_uni_interest_records`\*、`cex_earn_get_uni_interest_status`\*

### 闪兑 Flash Swap（5 个工具）— 前缀：`cex_fc_`
`cex_fc_list_fc_currency_pairs`、`cex_fc_preview_fc_order`\*、`cex_fc_create_fc_order`\*、`cex_fc_list_fc_orders`\*、`cex_fc_get_fc_order`\*

### 统一账户 Unified（16 个工具）
`cex_unified_list_currency_discount_tiers`、`cex_unified_get_unified_accounts`\*、`cex_unified_list_unified_currencies`\*、`cex_unified_get_unified_mode`\*、`cex_unified_set_unified_mode`\*、`cex_unified_get_unified_risk_units`\*、`cex_unified_get_unified_borrowable`\*、`cex_unified_get_unified_transferable`\*、`cex_unified_get_unified_estimate_rate`\*、`cex_unified_list_unified_loans`\*、`cex_unified_create_unified_loan`\*、`cex_unified_list_unified_loan_records`\*、`cex_unified_list_unified_loan_interest_records`\*、`cex_unified_get_user_leverage_currency_setting`\*、`cex_unified_set_user_leverage_currency_setting`\*、`cex_unified_set_unified_collateral`\*

### 子账户 Sub-Account（11 个工具）— 前缀：`cex_sa_`
`cex_sa_list_sas`\*、`cex_sa_create_sa`\*、`cex_sa_get_sa`\*、`cex_sa_lock_sa`\*、`cex_sa_unlock_sa`\*、`cex_sa_list_sa_keys`\*、`cex_sa_get_sa_key`\*、`cex_sa_create_sa_key`\*、`cex_sa_update_sa_key`\*、`cex_sa_get_sa_unified_mode`\*、`cex_sa_delete_sa_key`\*

---

## 警告：写操作风险

下单、撤单、划转资金、修改账户设置等写操作工具会**立即且不可撤销地**作用于你的 Gate 真实账户。一旦提交，错误的交易对、方向（买/卖）、数量或价格均无法撤回。

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
- 尽可能在 Gate 的 API 密钥设置中启用 **IP 白名单**。
- 该服务器完全运行在本地机器上。凭证仅发送至 `api.gateio.ws`（或你配置的基础地址），不会传输至其他任何地方。

---

## 常见问题排查

**报错"Authentication required"（需要认证）**
`GATE_API_KEY` 或 `GATE_API_SECRET` 未设置或不正确。请确认环境变量已正确配置，且密钥在 Gate 上拥有所需权限。

**Agent 中工具未出现 / 锤子图标缺失**
编辑配置后，请完全退出并重启 Agent 应用。使用 JSON 验证器检查配置文件是否有语法错误。在终端运行 `npx --version` 确认 `npx` 可正常访问。

**报错"spawn npx ENOENT"**
Node.js 未安装或未加入 PATH。请安装 Node.js 18+ 并通过 `node --version` 和 `npx --version` 验证。

**频率限制报错**
Gate 对各端点有请求频率限制，请避免短时间内频繁调用同一工具。可使用 `get_account_rate_limit` 查看当前限制。

**直接验证服务器是否正常运行**

```bash
# 获取 BTC/USDT 行情（公开接口，无需认证）
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}
{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"cex_spot_get_spot_tickers","arguments":{"currency_pair":"BTC_USDT"}}}' | npx -y gate-mcp 2>/dev/null | tail -1
```
