# Gate MCP Tool Naming Reference

## Derivation: SDK method → tool name

Strip the class prefix, convert CamelCase to snake_case, prepend `cex_{module_abbr}_`.

```
SDK class method                        → tool name
─────────────────────────────────────────────────────────────────
SpotApi.listCurrencyPairs               → cex_spot_list_currency_pairs
FuturesApi.getFuturesOrder              → cex_fx_get_fx_order
P2pApi.p2pMerchantTransactionCancel     → cex_p2p_transaction_cancel
P2pApi.p2pMerchantBooksAdsList          → cex_p2p_ads_list
P2pApi.p2pMerchantChatGetChatsList      → cex_p2p_get_chats_list
DeliveryApi.listDeliveryContracts       → cex_dc_list_dc_contracts
```

**P2P special case:** SDK uses `p2pMerchant{Category}{Verb}` — strip `p2pMerchant`, keep category+verb as-is in snake_case. Do NOT reorder to put the verb first.

## Module abbreviation map

| Module folder    | Abbreviation | Example prefix  |
|-----------------|-------------|-----------------|
| spot            | spot        | cex_spot_       |
| futures         | fx          | cex_fx_         |
| delivery        | dc          | cex_dc_         |
| margin          | margin      | cex_margin_     |
| wallet          | wallet      | cex_wallet_     |
| account         | account     | cex_account_    |
| options         | options     | cex_options_    |
| earn            | earn        | cex_earn_       |
| flash_swap      | fc          | cex_fc_         |
| unified         | unified     | cex_unified_    |
| sub_account     | sa          | cex_sa_         |
| p2p             | p2p         | cex_p2p_        |
| tradfi          | tradfi      | cex_tradfi_     |
| crossex         | crx         | cex_crx_        |
| alpha           | alpha       | cex_alpha_      |
| rebate          | rebate      | cex_rebate_     |
| multi_collateral_loan | mcl   | cex_mcl_        |
| activity        | activity    | cex_activity_   |
| coupon          | coupon      | cex_coupon_     |
| launch          | launch      | cex_launch_     |

## Write verbs (src/utils.ts WRITE_VERBS)

A tool is a "write" tool if any of the name segments at **index 2 or index 3** (0-based) matches a write verb:

```
create  cancel   amend    update   set
delete  lock     unlock   add      countdown
swap    place    change   stop     repay
operate confirm  send     upload   close
reset   quote    convert  redeem
```

**When to add a new verb:** If a new tool performs a state-mutating operation and its verb does not appear in this list, add it to both:
- `src/utils.ts` → `WRITE_VERBS` set
- `tests/e2e.cjs` → `WRITE_VERBS` set (both must stay in sync)

**Index check rule:** index 2 covers standard tools (`cex_{module}_{verb}_...`); index 3 covers SDK-category-prefixed tools (`cex_{module}_{category}_{verb}_...`) like P2P. Do NOT extend beyond index 3 — if a tool requires index 4+, reconsider the name.

## E2E test MODULE_COUNTS

After adding tools, update `tests/e2e.cjs` → `MODULE_COUNTS`:

```js
const MODULE_COUNTS = {
  spot: { total: N, readonly: N, write: N },
  // ...
};
```

- `total` = all tools in the module
- `write` = tools where `isWrite(name)` is true
- `readonly` = total − write
