# Repository Guidelines

## Project Structure & Module Organization
`src/` contains the MCP server and tool registrations. `src/index.ts` is the stdio entrypoint, `src/client.ts` and `src/utils.ts` hold shared API logic, and `src/tools/` groups Gate API surfaces by domain (`spot.ts`, `futures.ts`, `wallet.ts`, etc.). Tests live in `test/`, with helpers in `test/helpers/` and shared env bootstrapping in `test/setup.ts`. Build output goes to `dist/`. Design notes and implementation plans live under `docs/`.

## Build, Test, and Development Commands
Run `npm install` to sync dependencies. Use `npm run build` to compile TypeScript into `dist/`. Use `npm run dev` to start the MCP server directly from `src/index.ts` with `tsx` during development. Use `npm start` to run the compiled server. Use `npm test` to execute the Vitest suite. For a manual smoke test, build first and then pipe JSON-RPC requests into `node dist/index.js` as shown in [README.md](/Users/revil/projects/local-mcp/README.md).

## Coding Style & Naming Conventions
This repo uses ESM TypeScript with 2-space indentation, semicolons, and single quotes. Keep filenames lowercase; use underscores only when the external API naming is already established, such as `flash_swap.ts`. Export clear verb-based registration functions like `registerSpotTools`. Match Gate API terminology in tool names and keep imports using explicit `.js` specifiers from TypeScript sources.

## Testing Guidelines
Vitest is the test runner. Add tests under `test/*.test.ts`; follow the existing domain split such as `spot.test.ts` and `futures.test.ts`. Prefer integration-style tests through the MCP client helper in `test/helpers/mcp-client.ts`. Run `npm test` before opening a PR. No coverage gate is configured yet, but new tools should ship with corresponding tests for success cases and auth-sensitive behavior where applicable.

## Commit & Pull Request Guidelines
Follow the Conventional Commits pattern already in history: `test: add futures tool integration tests`, `chore: add .worktrees/ to .gitignore`. Keep subjects imperative and scoped by change type (`feat`, `fix`, `test`, `chore`). PRs should describe the API area touched, list any required environment variables, and include example requests or screenshots only when behavior visible to MCP clients changes.

## Security & Configuration Tips
Never commit real `GATE_API_KEY` or `GATE_API_SECRET` values. Use `.env.test` for local test credentials loaded by Vitest, and prefer Gate testnet via `GATE_BASE_URL` when validating authenticated workflows.
