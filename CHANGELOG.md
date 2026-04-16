# Changelog

All notable changes to this project will be documented in this file.

## [0.19.0] - 2026-04-16

### Added

- **SDK upgrade**: `gate-api` v7.2.57 → v7.2.67 (2 new API classes, 14 new methods, 86 new models)
- **Assetswap module** (`src/tools/assetswap.ts`): 7 tools for one-click asset swap — list assets, get config, evaluate, create/preview/query orders
- **Bot module** (`src/tools/bot.ts`): 10 tools for AI quantitative trading — strategy recommend, grid/martingale strategy creation, portfolio management
- **Withdrawal module** (`src/tools/withdrawal.ts`): 3 tools — withdraw, UID push transfer, cancel withdrawal
- **Launch module**: 10 new tools — Hodler Airdrop (4: project list, order, user order/airdrop records) + CandyDrop (6: activity list, register, rules, progress, participation/airdrop records)
- **Earn module**: 4 new dual investment tools — refund preview, place refund, modify reinvest, project recommend
- **Earn parameter expansion**: `listDualInvestmentPlans` +6 params (coin, type, quote_currency, sort, page, page_size); `listDualOrders` +3 params (type, status, coin)
- **Wallet parameter expansion**: `listSubAccountBalances` +2 params (page, limit)
- `WRITE_TOOL_OVERRIDES` mechanism for tools with non-standard naming that can't be detected by verb position
- Comprehensive test suite: 8 new test files (~120 test cases) covering tool registration, auth guards, readonly filtering, parameter updates

### Removed

- **Welfare module** (`src/tools/welfare.ts`): 2 tools removed (`cex_welfare_get_user_identity`, `cex_welfare_get_beginner_task_list`)

### Changed

- `WRITE_VERBS` extended with `post`, `register`, `modify` for new write tool detection
- Tool descriptions enriched with enum values, default values, and range limits (earn, launch, wallet, withdrawal modules)
- README updated with new module documentation

### Fixed

- `isWriteTool()` false positive: `withdraw` verb removed from `WRITE_VERBS` to prevent `cex_wallet_list_withdraw_status` from being incorrectly filtered in readonly mode
- `isWriteTool()` false negative: `cex_launch_hodler_airdrop_order` added to `WRITE_TOOL_OVERRIDES` to ensure correct readonly filtering

## [0.18.3] - 2026-04-11

### Added

- `cex_spot_get_spot_accounts` pagination support: new `page` and `limit` parameters for on-demand paging
- Default `page=1`, `limit=10`, max `limit=1000` (silently capped)
- When `currency` is specified, pagination is disabled and returns the specified currency directly
- Response includes `pagination` metadata (page/limit/total/total_pages)

## [0.18.2] - 2026-04-02

### Changed

- Refine and improve existing tools

## [0.18.1] - 2026-04-01

### Changed

- Initial release with spot, futures, delivery, margin, wallet, account, options, earn, and flash swap tools
