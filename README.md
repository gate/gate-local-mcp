# gate-local-mcp

A local (stdio) MCP server that exposes the full [Gate](https://www.gate.com) API v4 to any MCP-compatible client (Claude Desktop, etc.).

**Quickstart guides:** [English](docs/quickstart.md) · [中文](docs/quickstart_zh.md)

> **Looking for the remote MCP server?** If you need HTTP/SSE-based remote access instead of local stdio, see [gate/gate-mcp](https://github.com/gate/gate-mcp).

## Features

- **384 tools** covering Spot, Futures, Delivery, Margin, Wallet, Account, Options, Earn, Flash Swap, Unified, Sub-Account, Multi-Collateral Loan, P2P, TradFi, CrossEx, Alpha, Rebate, Activity, Coupon, Launch, Square, and Welfare APIs
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

By default all 384 tools (22 modules) are registered. To reduce the tool count (e.g. Cursor warns above 80), restrict to specific modules:

**CLI flags:**
```bash
# Load only spot and futures tools (95 tools)
GATE_API_KEY=... npx gate-mcp --modules=spot,futures

# Load futures tools in read-only mode (36 tools)
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

**Available modules:** `spot`, `futures`, `delivery`, `margin`, `wallet`, `account`, `options`, `earn`, `flash_swap`, `unified`, `sub_account`, `multi_collateral_loan`, `p2p`, `tradfi`, `crossex`, `alpha`, `rebate`, `activity`, `coupon`, `launch`, `square`, `assetswap`, `bot`, `withdrawal`

| Module | Total | Read-only |
|---|---|---|
| spot | 31 | 19 |
| futures | 64 | 36 |
| delivery | 29 | 20 |
| margin | 20 | 17 |
| wallet | 22 | 18 |
| account | 10 | 6 |
| options | 29 | 22 |
| earn | 41 | 26 |
| flash_swap | 7 | 5 |
| unified | 22 | 17 |
| sub_account | 11 | 5 |
| multi_collateral_loan | 12 | 9 |
| p2p | 17 | 10 |
| tradfi | 18 | 12 |
| crossex | 31 | 21 |
| alpha | 9 | 7 |
| rebate | 9 | 9 |
| activity | 3 | 3 |
| coupon | 2 | 2 |
| launch | 15 | 12 |
| square | 2 | 2 |
| assetswap | 7 | 2 |
| bot | 10 | 3 |
| withdrawal | 3 | 0 |

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

### Spot (31 tools)
`cex_spot_list_currencies`, `cex_spot_get_currency`, `cex_spot_list_currency_pairs`, `cex_spot_get_currency_pair`, `cex_spot_get_spot_tickers`, `cex_spot_get_spot_order_book`, `cex_spot_get_spot_trades`, `cex_spot_get_spot_candlesticks`, `cex_spot_get_spot_insurance_history`, `cex_spot_get_spot_fee`\*, `cex_spot_get_spot_accounts`\*, `cex_spot_list_spot_orders`\*, `cex_spot_create_spot_order`\*, `cex_spot_get_spot_order`\*, `cex_spot_cancel_spot_order`\*, `cex_spot_amend_spot_order`\*, `cex_spot_cancel_all_spot_orders`\*, `cex_spot_list_spot_my_trades`\*, `cex_spot_list_all_open_orders`\*, `cex_spot_list_spot_price_triggered_orders`\*, `cex_spot_list_spot_account_book`\*, `cex_spot_get_spot_batch_fee`\*, `cex_spot_create_spot_batch_orders`\*, `cex_spot_amend_spot_batch_orders`\*, `cex_spot_cancel_spot_batch_orders`\*, `cex_spot_create_cross_liquidate_order`\*, `cex_spot_create_spot_price_triggered_order`\*, `cex_spot_get_spot_price_triggered_order`\*, `cex_spot_cancel_spot_price_triggered_order`\*, `cex_spot_cancel_spot_price_triggered_order_list`\*, `cex_spot_countdown_cancel_all_spot`\*

### Futures (64 tools) — prefix abbreviated to `cex_fx_`
`cex_fx_list_fx_contracts`, `cex_fx_get_fx_contract`, `cex_fx_get_fx_order_book`, `cex_fx_get_fx_candlesticks`, `cex_fx_get_fx_tickers`, `cex_fx_get_fx_funding_rate`, `cex_fx_get_fx_trades`, `cex_fx_list_contract_stats`, `cex_fx_get_fx_premium_index`, `cex_fx_list_batch_fx_funding_rates`, `cex_fx_list_fx_insurance_ledger`, `cex_fx_get_index_constituents`, `cex_fx_list_liquidated_orders`, `cex_fx_get_fx_accounts`\*, `cex_fx_list_fx_account_book`\*, `cex_fx_list_fx_positions`\*, `cex_fx_list_positions_timerange`\*, `cex_fx_get_fx_position`\*, `cex_fx_get_leverage`\*, `cex_fx_get_fx_fee`\*, `cex_fx_list_fx_risk_limit_tiers`\*, `cex_fx_get_fx_risk_limit_table`\*, `cex_fx_list_fx_orders`\*, `cex_fx_create_fx_order`\*, `cex_fx_create_fx_bbo_order`\*, `cex_fx_get_fx_order`\*, `cex_fx_amend_fx_order`\*, `cex_fx_cancel_fx_order`\*, `cex_fx_cancel_all_fx_orders`\*, `cex_fx_create_fx_batch_orders`\*, `cex_fx_cancel_fx_batch_orders`\*, `cex_fx_amend_fx_batch_orders`\*, `cex_fx_get_fx_orders_with_time_range`\*, `cex_fx_list_fx_my_trades`\*, `cex_fx_get_fx_my_trades_timerange`\*, `cex_fx_list_position_close`\*, `cex_fx_list_fx_liq_orders`\*, `cex_fx_list_auto_deleverages`\*, `cex_fx_update_fx_position_leverage`\*, `cex_fx_update_fx_contract_position_leverage`\*, `cex_fx_update_fx_position_margin`\*, `cex_fx_update_fx_position_risk_limit`\*, `cex_fx_update_fx_position_cross_mode`\*, `cex_fx_update_fx_dual_position_cross_mode`\*, `cex_fx_set_fx_dual`\*, `cex_fx_set_position_mode`\*, `cex_fx_get_fx_dual_position`\*, `cex_fx_update_fx_dual_position_margin`\*, `cex_fx_update_fx_dual_position_leverage`\*, `cex_fx_update_fx_dual_position_risk_limit`\*, `cex_fx_countdown_cancel_all_fx`\*, `cex_fx_create_trail_order`\*, `cex_fx_get_trail_orders`\*, `cex_fx_get_trail_order_detail`\*, `cex_fx_update_trail_order`\*, `cex_fx_stop_trail_order`\*, `cex_fx_stop_all_trail_orders`\*, `cex_fx_get_trail_order_change_log`\*, `cex_fx_list_price_triggered_orders`\*, `cex_fx_create_fx_price_triggered_order`\*, `cex_fx_get_fx_price_triggered_order`\*, `cex_fx_update_fx_price_triggered_order`\*, `cex_fx_cancel_fx_price_triggered_order`\*, `cex_fx_cancel_fx_price_triggered_order_list`\*

### Delivery (29 tools) — prefix abbreviated to `cex_dc_`
`cex_dc_list_dc_contracts`, `cex_dc_get_dc_contract`, `cex_dc_list_dc_order_book`, `cex_dc_list_dc_candlesticks`, `cex_dc_list_dc_tickers`, `cex_dc_list_dc_trades`, `cex_dc_list_dc_insurance_ledger`, `cex_dc_list_dc_risk_limit_tiers`, `cex_dc_list_dc_accounts`\*, `cex_dc_list_dc_positions`\*, `cex_dc_list_dc_orders`\*, `cex_dc_create_dc_order`\*, `cex_dc_cancel_dc_order`\*, `cex_dc_cancel_dc_orders`\*, `cex_dc_get_my_dc_trades`\*, `cex_dc_list_dc_account_book`\*, `cex_dc_get_dc_position`\*, `cex_dc_update_dc_position_margin`\*, `cex_dc_update_dc_position_leverage`\*, `cex_dc_update_dc_position_risk_limit`\*, `cex_dc_get_dc_order`\*, `cex_dc_list_dc_position_close`\*, `cex_dc_list_dc_liquidates`\*, `cex_dc_list_dc_settlements`\*, `cex_dc_list_price_triggered_dc_orders`\*, `cex_dc_create_price_triggered_dc_order`\*, `cex_dc_get_price_triggered_dc_order`\*, `cex_dc_cancel_price_triggered_dc_order_list`\*, `cex_dc_cancel_price_triggered_dc_order`\*

### Margin (20 tools)
`cex_margin_get_market_margin_tier`, `cex_margin_list_uni_currency_pairs`, `cex_margin_get_uni_currency_pair`, `cex_margin_list_margin_accounts`\*, `cex_margin_list_margin_account_book`\*, `cex_margin_get_auto_repay_status`\*, `cex_margin_set_auto_repay`\*, `cex_margin_get_margin_transferable`\*, `cex_margin_list_funding_accounts`\*, `cex_margin_get_user_margin_tier`\*, `cex_margin_set_user_market_leverage`\*, `cex_margin_list_margin_user_account`\*, `cex_margin_list_cross_margin_loans`\*, `cex_margin_list_cross_margin_repayments`\*, `cex_margin_list_uni_loans`\*, `cex_margin_create_uni_loan`\*, `cex_margin_list_uni_loan_records`\*, `cex_margin_list_uni_loan_interest_records`\*, `cex_margin_get_uni_borrowable`\*, `cex_margin_get_margin_uni_estimate_rate`\*

### Wallet (22 tools)
`cex_wallet_list_currency_chains`, `cex_wallet_get_total_balance`\*, `cex_wallet_list_withdrawals`\*, `cex_wallet_list_deposits`\*, `cex_wallet_get_deposit_address`\*, `cex_wallet_create_transfer`\*, `cex_wallet_list_sa_balances`\*, `cex_wallet_get_wallet_fee`\*, `cex_wallet_create_sa_transfer`\*, `cex_wallet_create_sa_to_sa_transfer`\*, `cex_wallet_get_transfer_order_status`\*, `cex_wallet_list_withdraw_status`\*, `cex_wallet_list_sa_transfers`\*, `cex_wallet_list_sa_margin_balances`\*, `cex_wallet_list_sa_fx_balances`\*, `cex_wallet_list_sa_cross_margin_balances`\*, `cex_wallet_list_saved_address`\*, `cex_wallet_list_small_balance`\*, `cex_wallet_convert_small_balance`\*, `cex_wallet_list_small_balance_history`\*, `cex_wallet_list_push_orders`\*, `cex_wallet_get_low_cap_exchange_list`\*

### Account (10 tools)
`cex_account_get_account_detail`\*, `cex_account_get_account_rate_limit`\*, `cex_account_get_debit_fee`\*, `cex_account_set_debit_fee`\*, `cex_account_get_account_main_keys`\*, `cex_account_list_stp_groups`\*, `cex_account_create_stp_group`\*, `cex_account_list_stp_group_users`\*, `cex_account_add_stp_group_users`\*, `cex_account_delete_stp_group_user`\*

### Options (29 tools)
`cex_options_list_options_underlyings`, `cex_options_list_options_expirations`, `cex_options_list_options_contracts`, `cex_options_get_options_contract`, `cex_options_list_options_order_book`, `cex_options_list_options_tickers`, `cex_options_list_options_underlying_tickers`, `cex_options_list_options_candlesticks`, `cex_options_list_options_underlying_candlesticks`, `cex_options_list_options_settlements`, `cex_options_get_options_settlement`, `cex_options_list_options_trades`, `cex_options_list_options_account`\*, `cex_options_list_options_account_book`\*, `cex_options_list_my_options_settlements`\*, `cex_options_list_options_positions`\*, `cex_options_get_options_position`\*, `cex_options_list_options_position_close`\*, `cex_options_list_options_orders`\*, `cex_options_create_options_order`\*, `cex_options_amend_options_order`\*, `cex_options_cancel_options_order`\*, `cex_options_get_options_order`\*, `cex_options_cancel_options_orders`\*, `cex_options_countdown_cancel_all_options`\*, `cex_options_get_options_mmp`\*, `cex_options_set_options_mmp`\*, `cex_options_reset_options_mmp`\*, `cex_options_list_my_options_trades`\*

### Earn (29 tools)
`cex_earn_list_dual_investment_plans`, `cex_earn_list_structured_products`, `cex_earn_find_coin`, `cex_earn_list_uni_currencies`, `cex_earn_get_uni_currency`, `cex_earn_list_uni_chart`, `cex_earn_list_uni_rate`, `cex_earn_list_earn_fixed_term_products`, `cex_earn_list_earn_fixed_term_products_by_asset`, `cex_earn_list_dual_orders`\*, `cex_earn_place_dual_order`\*, `cex_earn_list_dual_balance`\*, `cex_earn_list_structured_orders`\*, `cex_earn_place_structured_order`\*, `cex_earn_swap_staking_coin`\*, `cex_earn_order_list`\*, `cex_earn_award_list`\*, `cex_earn_asset_list`\*, `cex_earn_list_user_uni_lends`\*, `cex_earn_create_uni_lend`\*, `cex_earn_change_uni_lend`\*, `cex_earn_list_uni_lend_records`\*, `cex_earn_get_uni_interest`\*, `cex_earn_list_uni_interest_records`\*, `cex_earn_get_uni_interest_status`\*, `cex_earn_list_earn_fixed_term_lends`\*, `cex_earn_create_earn_fixed_term_lend`\*, `cex_earn_create_earn_fixed_term_pre_redeem`\*, `cex_earn_list_earn_fixed_term_history`\*

### Flash Swap (7 tools) — prefix abbreviated to `cex_fc_`
`cex_fc_list_fc_currency_pairs`, `cex_fc_preview_fc_multi_currency_many_to_one_order`, `cex_fc_preview_fc_multi_currency_one_to_many_order`, `cex_fc_list_fc_orders`\*, `cex_fc_get_fc_order`\*, `cex_fc_create_fc_multi_currency_many_to_one_order`\*, `cex_fc_create_fc_multi_currency_one_to_many_order`\*

### Unified Account (22 tools)
`cex_unified_list_currency_discount_tiers`, `cex_unified_list_loan_margin_tiers`, `cex_unified_get_unified_accounts`\*, `cex_unified_list_unified_currencies`\*, `cex_unified_get_unified_mode`\*, `cex_unified_set_unified_mode`\*, `cex_unified_get_unified_risk_units`\*, `cex_unified_get_unified_borrowable`\*, `cex_unified_get_unified_borrowable_list`\*, `cex_unified_get_unified_transferable`\*, `cex_unified_get_unified_transferables`\*, `cex_unified_get_unified_estimate_rate`\*, `cex_unified_get_history_loan_rate`\*, `cex_unified_list_unified_loans`\*, `cex_unified_create_unified_loan`\*, `cex_unified_list_unified_loan_records`\*, `cex_unified_list_unified_loan_interest_records`\*, `cex_unified_get_user_leverage_currency_setting`\*, `cex_unified_get_user_leverage_currency_config`\*, `cex_unified_set_user_leverage_currency_setting`\*, `cex_unified_set_unified_collateral`\*, `cex_unified_calculate_portfolio_margin`\*

### Sub-Account (11 tools) — prefix abbreviated to `cex_sa_`
`cex_sa_list_sas`\*, `cex_sa_create_sa`\*, `cex_sa_get_sa`\*, `cex_sa_lock_sa`\*, `cex_sa_unlock_sa`\*, `cex_sa_list_sa_keys`\*, `cex_sa_get_sa_key`\*, `cex_sa_create_sa_key`\*, `cex_sa_update_sa_key`\*, `cex_sa_get_sa_unified_mode`\*, `cex_sa_delete_sa_key`\*

### Multi-Collateral Loan (12 tools) — prefix: `cex_mcl_`
`cex_mcl_list_multi_collateral_orders`\*, `cex_mcl_create_multi_collateral`\*, `cex_mcl_get_multi_collateral_order_detail`\*, `cex_mcl_list_multi_repay_records`\*, `cex_mcl_repay_mcl`\*, `cex_mcl_list_multi_collateral_records`\*, `cex_mcl_operate_multi_collateral`\*, `cex_mcl_list_user_currency_quota`\*, `cex_mcl_list_multi_collateral_currencies`\*, `cex_mcl_get_multi_collateral_ltv`\*, `cex_mcl_get_multi_collateral_fix_rate`\*, `cex_mcl_get_multi_collateral_current_rate`\*

### P2P (17 tools)
`cex_p2p_get_user_info`\*, `cex_p2p_get_counterparty_user_info`\*, `cex_p2p_get_myself_payment`\*, `cex_p2p_get_pending_transactions`\*, `cex_p2p_get_completed_transactions`\*, `cex_p2p_get_transaction_details`\*, `cex_p2p_confirm_payment`\*, `cex_p2p_confirm_receipt`\*, `cex_p2p_cancel_transaction`\*, `cex_p2p_place_ad_order`\*, `cex_p2p_update_ad_status`\*, `cex_p2p_get_ad_detail`\*, `cex_p2p_list_my_ads`\*, `cex_p2p_list_ads`\*, `cex_p2p_get_chat_messages`\*, `cex_p2p_send_chat_message`\*, `cex_p2p_upload_chat_file`\*

### TradFi (18 tools) — prefix: `cex_tradfi_`
`cex_tradfi_query_categories`, `cex_tradfi_query_symbols`, `cex_tradfi_query_symbol_kline`, `cex_tradfi_query_symbol_ticker`, `cex_tradfi_query_symbol_detail`\*, `cex_tradfi_query_mt5_account_info`\*, `cex_tradfi_query_user_assets`\*, `cex_tradfi_query_transaction`\*, `cex_tradfi_create_transaction`\*, `cex_tradfi_query_order_list`\*, `cex_tradfi_create_tradfi_order`\*, `cex_tradfi_update_order`\*, `cex_tradfi_delete_order`\*, `cex_tradfi_query_order_history_list`\*, `cex_tradfi_query_position_list`\*, `cex_tradfi_update_position`\*, `cex_tradfi_close_position`\*, `cex_tradfi_query_position_history_list`\*

### CrossEx (31 tools) — prefix abbreviated to `cex_crx_`
`cex_crx_list_crx_rule_symbols`, `cex_crx_list_crx_rule_risk_limits`, `cex_crx_list_crx_transfer_coins`, `cex_crx_get_crx_fee`, `cex_crx_get_crx_interest_rate`, `cex_crx_list_crx_coin_discount_rate`, `cex_crx_list_crx_transfers`\*, `cex_crx_create_crx_transfer`\*, `cex_crx_list_crx_open_orders`\*, `cex_crx_create_crx_order`\*, `cex_crx_get_crx_order`\*, `cex_crx_update_crx_order`\*, `cex_crx_cancel_crx_order`\*, `cex_crx_list_crx_history_orders`\*, `cex_crx_list_crx_history_trades`\*, `cex_crx_create_crx_convert_quote`\*, `cex_crx_create_crx_convert_order`\*, `cex_crx_get_crx_account`\*, `cex_crx_update_crx_account`\*, `cex_crx_list_crx_account_book`\*, `cex_crx_list_crx_positions`\*, `cex_crx_list_crx_margin_positions`\*, `cex_crx_list_crx_adl_rank`\*, `cex_crx_get_crx_positions_leverage`\*, `cex_crx_update_crx_positions_leverage`\*, `cex_crx_get_crx_margin_positions_leverage`\*, `cex_crx_update_crx_margin_positions_leverage`\*, `cex_crx_close_crx_position`\*, `cex_crx_list_crx_history_positions`\*, `cex_crx_list_crx_history_margin_positions`\*, `cex_crx_list_crx_history_margin_interests`\*

### Alpha (9 tools)
`cex_alpha_list_alpha_currencies`, `cex_alpha_list_alpha_tickers`, `cex_alpha_list_alpha_tokens`, `cex_alpha_list_alpha_accounts`\*, `cex_alpha_list_alpha_account_book`\*, `cex_alpha_list_alpha_orders`\*, `cex_alpha_get_alpha_order`\*, `cex_alpha_quote_alpha_order`\*, `cex_alpha_place_alpha_order`\*

### Rebate (9 tools)
`cex_rebate_partner_transaction_history`\*, `cex_rebate_partner_commissions_history`\*, `cex_rebate_partner_sub_list`\*, `cex_rebate_broker_commission_history`\*, `cex_rebate_broker_transaction_history`\*, `cex_rebate_user_info`\*, `cex_rebate_get_partner_application_recent`\*, `cex_rebate_get_partner_eligibility`\*, `cex_rebate_user_sub_relation`\*

### Activity (3 tools)
`cex_activity_list_activities`, `cex_activity_list_activity_types`, `cex_activity_get_my_activity_entry`\*

### Coupon (2 tools)
`cex_coupon_list_user_coupons`\*, `cex_coupon_get_user_coupon_detail`\*

### Launch (15 tools)
`cex_launch_list_launch_pool_projects`, `cex_launch_create_launch_pool_order`\*, `cex_launch_redeem_launch_pool`\*, `cex_launch_list_launch_pool_pledge_records`\*, `cex_launch_list_launch_pool_reward_records`\*, `cex_launch_get_hodler_airdrop_project_list`, `cex_launch_hodler_airdrop_order`\*, `cex_launch_get_hodler_airdrop_user_order_records`\*, `cex_launch_get_hodler_airdrop_user_airdrop_records`\*, `cex_launch_get_candy_drop_activity_list_v4`, `cex_launch_register_candy_drop_v4`\*, `cex_launch_get_candy_drop_activity_rules_v4`, `cex_launch_get_candy_drop_task_progress_v4`\*, `cex_launch_get_candy_drop_participation_records_v4`\*, `cex_launch_get_candy_drop_airdrop_records_v4`\*

### Square (2 tools)
`cex_square_list_square_ai_search`, `cex_square_list_live_replay`

### Assetswap (7 tools)
`cex_assetswap_list_asset_swap_assets`, `cex_assetswap_get_asset_swap_config`, `cex_assetswap_evaluate_asset_swap`\*, `cex_assetswap_create_asset_swap_order_v1`\*, `cex_assetswap_list_asset_swap_orders_v1`\*, `cex_assetswap_preview_asset_swap_order_v1`\*, `cex_assetswap_get_asset_swap_order_v1`\*

### Bot (10 tools)
`cex_bot_get_ai_hub_strategy_recommend`, `cex_bot_post_ai_hub_spot_grid_create`\*, `cex_bot_post_ai_hub_margin_grid_create`\*, `cex_bot_post_ai_hub_infinite_grid_create`\*, `cex_bot_post_ai_hub_fx_grid_create`\*, `cex_bot_post_ai_hub_spot_martingale_create`\*, `cex_bot_post_ai_hub_contract_martingale_create`\*, `cex_bot_get_ai_hub_portfolio_running`\*, `cex_bot_get_ai_hub_portfolio_detail`\*, `cex_bot_post_ai_hub_portfolio_stop`\*

### Withdrawal (3 tools)
`cex_withdrawal_withdraw`\*, `cex_withdrawal_withdraw_push_order`\*, `cex_withdrawal_cancel_withdrawal`\*

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
