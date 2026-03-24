---
name: gate-mcp-tool-conventions
description: Use when adding, renaming, or reviewing tools in the Gate MCP server (local-mcp project). Enforces SDK-aligned tool naming, write-verb detection correctness, and e2e test count updates. Trigger on any tool registration in src/tools/*.ts.
---

# Gate MCP Tool Conventions

Read [references/naming-rules.md](references/naming-rules.md) for the full naming derivation table, module abbreviation map, and write-verb list.

## Checklist for every new tool

### 1. Derive the tool name from the SDK method

Look up the SDK method in `node_modules/gate-api/dist/api/*.d.ts`. Strip the class/instance prefix and convert to snake_case:

```
{SDK method (CamelCase, no class prefix)} → cex_{module_abbr}_{snake_case}
```

**P2P exception:** SDK uses `p2pMerchant{Category}{Verb}` — strip `p2pMerchant`, keep `{category}_{verb}` order as-is. Do NOT reorder to verb-first.

See [references/naming-rules.md](references/naming-rules.md) for examples and the full module abbreviation map.

### 2. Check write-verb detection

After naming, verify the tool is classified correctly:

- `isWriteTool` checks **index 2 OR index 3** (0-based) against `WRITE_VERBS`
- If a new write tool's verb lands at index 2 or 3 → no changes needed
- If the verb is not in `WRITE_VERBS` → add it to **both**:
  - `src/utils.ts` → `WRITE_VERBS` set
  - `tests/e2e.cjs` → `WRITE_VERBS` set (must stay in sync)

### 3. Update e2e test MODULE_COUNTS

In `tests/e2e.cjs`, update the entry for the affected module:

```js
const MODULE_COUNTS = {
  mymodule: { total: N+1, readonly: R, write: W },
  //                ^^^^ increment total; increment write if write tool
};
```

`readonly` = `total` − `write`.

### 4. Build and test

```bash
npm run build
node tests/e2e.cjs   # must show N/N passed, 0 FAILED
```

Fix any failures before committing.

---

## Updating this skill

When a new naming rule or convention is established — e.g., a new SDK that uses a different prefix pattern, a new module abbreviation, a new write verb, or a change to the index check rule — update [references/naming-rules.md](references/naming-rules.md) with the rule and an example. Add a step to the checklist above if it requires a new action.
