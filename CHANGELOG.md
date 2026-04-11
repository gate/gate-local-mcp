# Changelog

All notable changes to this project will be documented in this file.

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
