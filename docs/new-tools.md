## Account (10 tools)

| Tool | Description |
|---|---|
| `cex_account_get_account_detail` | Get account profile and configuration (requires authentication) |
| `cex_account_get_account_rate_limit` | Get account API rate limit information (requires authentication) |
| `cex_account_get_debit_fee` | Get debit fee configuration (requires authentication) |
| `cex_account_set_debit_fee` | Enable or disable GT debit fee (requires authentication) |
| `cex_account_get_account_main_keys` | Get main account API key info (requires authentication) |
| `cex_account_list_stp_groups` | List Self-Trade Prevention (STP) groups (requires authentication) |
| `cex_account_create_stp_group` | Create a Self-Trade Prevention (STP) group (requires authentication) |
| `cex_account_list_stp_group_users` | List users in an STP group (requires authentication) |
| `cex_account_add_stp_group_users` | Add users to an STP group (requires authentication) |
| `cex_account_delete_stp_group_user` | Remove a user from an STP group (requires authentication) |

---

## Delivery (11 tools)

| Tool | Description |
|---|---|
| `cex_delivery_list_delivery_contracts` | List all delivery (expiring futures) contracts |
| `cex_delivery_get_delivery_contract` | Get a single delivery contract |
| `cex_delivery_list_delivery_order_book` | Get delivery contract order book |
| `cex_delivery_list_delivery_candlesticks` | Get delivery contract candlestick data |
| `cex_delivery_list_delivery_tickers` | Get delivery contract tickers |
| `cex_delivery_list_delivery_accounts` | Get delivery account balance (requires authentication) |
| `cex_delivery_list_delivery_positions` | List delivery positions (requires authentication) |
| `cex_delivery_list_delivery_orders` | List delivery orders (requires authentication) |
| `cex_delivery_create_delivery_order` | Create a delivery order (requires authentication) |
| `cex_delivery_cancel_delivery_order` | Cancel a delivery order (requires authentication) |
| `cex_delivery_get_my_delivery_trades` | Get personal delivery trading history (requires authentication) |

---

## Earn (25 tools)

| Tool | Description |
|---|---|
| `cex_earn_rate_list_eth2` | Get ETH2 swap rate list |
| `cex_earn_list_dual_investment_plans` | List dual investment plans |
| `cex_earn_list_structured_products` | List structured products |
| `cex_earn_find_coin` | Search for staking coins |
| `cex_earn_list_uni_currencies` | List currencies available for Simple Earn lending |
| `cex_earn_get_uni_currency` | Get details of a Simple Earn lending currency |
| `cex_earn_list_uni_chart` | Get Simple Earn lending rate chart data |
| `cex_earn_list_uni_rate` | Get Simple Earn current lending rates for all currencies |
| `cex_earn_swap_eth2` | Swap ETH to ETH2 or ETH2 to ETH (requires authentication) |
| `cex_earn_list_dual_orders` | List dual investment orders (requires authentication) |
| `cex_earn_place_dual_order` | Place a dual investment order (requires authentication) |
| `cex_earn_list_dual_balance` | Get dual investment balance (requires authentication) |
| `cex_earn_list_structured_orders` | List structured product orders (requires authentication) |
| `cex_earn_place_structured_order` | Purchase a structured product (requires authentication) |
| `cex_earn_swap_staking_coin` | Swap staking coins (requires authentication) |
| `cex_earn_order_list` | List staking orders (requires authentication) |
| `cex_earn_award_list` | List staking awards (requires authentication) |
| `cex_earn_asset_list` | List staking assets (requires authentication) |
| `cex_earn_list_user_uni_lends` | List user Simple Earn lending records (requires authentication) |
| `cex_earn_create_uni_lend` | Create a Simple Earn lending order (requires authentication) |
| `cex_earn_change_uni_lend` | Modify a Simple Earn lending order (requires authentication) |
| `cex_earn_list_uni_lend_records` | List Simple Earn lending history (requires authentication) |
| `cex_earn_get_uni_interest` | Get Simple Earn interest for a currency (requires authentication) |
| `cex_earn_list_uni_interest_records` | List Simple Earn interest history (requires authentication) |
| `cex_earn_get_uni_interest_status` | Get Simple Earn interest reinvestment status (requires authentication) |

---

## Flash Swap (5 tools)

| Tool | Description |
|---|---|
| `cex_fc_list_fc_currency_pairs` | List all supported flash swap currency pairs |
| `cex_fc_preview_fc_order` | Preview a flash swap order to get a quote (requires authentication) |
| `cex_fc_create_fc_order` | Execute a flash swap order (requires authentication) |
| `cex_fc_list_fc_orders` | List flash swap order history (requires authentication) |
| `cex_fc_get_fc_order` | Get details of a flash swap order (requires authentication) |

---

## Margin (5 tools)

| Tool | Description |
|---|---|
| `cex_margin_list_margin_accounts` | List margin accounts (requires authentication) |
| `cex_margin_list_margin_account_book` | List margin account balance change history (requires authentication) |
| `cex_margin_get_auto_repay_status` | Get auto-repay status for margin loans (requires authentication) |
| `cex_margin_set_auto_repay` | Enable or disable auto-repay for margin loans (requires authentication) |
| `cex_margin_get_margin_transferable` | Get the maximum transferable amount for a margin currency (requires authentication) |

---

## Options (13 tools)

| Tool | Description |
|---|---|
| `cex_options_list_options_underlyings` | List all options underlying assets |
| `cex_options_list_options_expirations` | List option expiration dates for an underlying |
| `cex_options_list_options_contracts` | List all options contracts for an underlying |
| `cex_options_get_options_contract` | Get details of a single options contract |
| `cex_options_list_options_order_book` | Get options order book |
| `cex_options_list_options_tickers` | Get options tickers for an underlying |
| `cex_options_list_options_candlesticks` | Get options candlestick data |
| `cex_options_list_options_account` | Get options account balance (requires authentication) |
| `cex_options_list_options_positions` | List options positions (requires authentication) |
| `cex_options_list_options_orders` | List options orders (requires authentication) |
| `cex_options_create_options_order` | Create an options order (requires authentication) |
| `cex_options_cancel_options_order` | Cancel an options order (requires authentication) |
| `cex_options_list_my_options_trades` | List personal options trading history (requires authentication) |

---

## Futures (9 tools)

| Tool | Description |
|---|---|
| `cex_fx_list_price_triggered_orders` | List futures price-triggered orders (requires authentication) |
| `cex_fx_create_fx_price_triggered_order` | Create a futures price-triggered order (requires authentication) |
| `cex_fx_get_fx_price_triggered_order` | Get details of a futures price-triggered order (requires authentication) |
| `cex_fx_cancel_fx_price_triggered_order` | Cancel a single futures price-triggered order (requires authentication) |
| `cex_fx_cancel_fx_price_triggered_order_list` | Cancel all futures price-triggered orders for a contract (requires authentication) |
| `cex_fx_get_fx_orders_with_time_range` | Get futures orders filtered by time range (requires authentication) |
| `cex_fx_get_fx_my_trades_timerange` | Get personal futures trade history filtered by time range (requires authentication) |
| `cex_fx_list_fx_liq_orders` | Get personal futures liquidation history (requires authentication) |
| `cex_fx_countdown_cancel_all_fx` | Set a countdown timer to cancel all futures orders — safety kill-switch (requires authentication) |

---

## Spot (7 tools)

| Tool | Description |
|---|---|
| `cex_spot_list_all_open_orders` | List all open orders across all currency pairs (requires authentication) |
| `cex_spot_list_spot_price_triggered_orders` | List spot price-triggered orders (requires authentication) |
| `cex_spot_create_spot_price_triggered_order` | Create a spot price-triggered order (requires authentication) |
| `cex_spot_get_spot_price_triggered_order` | Get details of a spot price-triggered order (requires authentication) |
| `cex_spot_cancel_spot_price_triggered_order` | Cancel a single spot price-triggered order (requires authentication) |
| `cex_spot_cancel_spot_price_triggered_order_list` | Cancel all spot price-triggered orders (requires authentication) |
| `cex_spot_countdown_cancel_all_spot` | Set a countdown timer to cancel all spot orders — safety kill-switch (requires authentication) |

---

## Unified (10 tools)

| Tool | Description |
|---|---|
| `cex_unified_list_currency_discount_tiers` | List currency discount tiers for unified account collateral |
| `cex_unified_list_unified_currencies` | List currencies supported in unified account (requires authentication) |
| `cex_unified_get_unified_transferable` | Get maximum transferable amount for a currency (requires authentication) |
| `cex_unified_get_unified_estimate_rate` | Get estimated borrow interest rates for currencies (requires authentication) |
| `cex_unified_create_unified_loan` | Borrow or repay in unified account (requires authentication) |
| `cex_unified_list_unified_loan_records` | Get borrow/repay history in unified account (requires authentication) |
| `cex_unified_list_unified_loan_interest_records` | Get interest charge history in unified account (requires authentication) |
| `cex_unified_get_user_leverage_currency_setting` | Get leverage settings for currencies in unified account (requires authentication) |
| `cex_unified_set_user_leverage_currency_setting` | Set leverage for a currency in unified account (requires authentication) |
| `cex_unified_set_unified_collateral` | Enable or disable currencies as collateral in unified account (requires authentication) |

