#!/usr/bin/env node
/**
 * E2E test suite for gate-mcp server tool registration.
 * Tests module filtering (--modules / GATE_MODULES) and readonly mode (--readonly / GATE_READONLY).
 *
 * Run: node tests/e2e.js
 */

'use strict';

const { execSync } = require('child_process');

const MCP_INIT = JSON.stringify({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '1.0' } },
});
const MCP_LIST = JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} });
const PAYLOAD = `${MCP_INIT}\n${MCP_LIST}\n`;

// Verb is at index 2 for most tools (cex_{module}_{verb}_...).
// Some SDK-based names place a category word at index 2 with the verb at index 3
// (e.g. cex_p2p_transaction_cancel), so check both positions.
const WRITE_VERBS = new Set([
  'create', 'cancel', 'amend', 'update', 'set',
  'delete', 'lock', 'unlock', 'add', 'countdown',
  'swap', 'place', 'change', 'stop', 'repay', 'operate',
  'confirm', 'send', 'upload', 'close', 'reset', 'quote', 'convert', 'redeem', 'calculate',
]);

function isWrite(toolName) {
  const parts = toolName.split('_');
  return WRITE_VERBS.has(parts[2]) || WRITE_VERBS.has(parts[3]);
}

function runServer(args = '', env = {}) {
  const out = execSync(`printf '%s\n' '${MCP_INIT}' '${MCP_LIST}' | node dist/index.js ${args}`, {
    env: { ...process.env, ...env },
    shell: '/bin/sh',
  }).toString().trim().split('\n').pop();
  return JSON.parse(out).result.tools;
}

function getTools(args, env) {
  const tools = runServer(args, env);
  return {
    count: tools.length,
    names: tools.map(t => t.name),
    modules: [...new Set(tools.map(t => t.name.split('_')[1]))],
    writeCount: tools.filter(t => isWrite(t.name)).length,
    readCount: tools.filter(t => !isWrite(t.name)).length,
  };
}

// ── Test runner ───────────────────────────────────────────────────────────────

let pass = 0, fail = 0;

function expect(label, actual, expected, hint = '') {
  const ok = actual === expected;
  const marker = ok ? '✓' : '✗';
  const detail = ok ? '' : `  → expected ${expected}, got ${actual}${hint ? '  (' + hint + ')' : ''}`;
  console.log(`  ${marker} ${label}${detail}`);
  ok ? pass++ : fail++;
}

function expectAllMatch(label, names, prefix) {
  const bad = names.filter(n => !n.startsWith(prefix));
  const ok = bad.length === 0;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok ? '' : `  → unexpected tools: ${bad.join(', ')}`}`);
  ok ? pass++ : fail++;
}

function expectNoWrite(label, names) {
  const bad = names.filter(isWrite);
  const ok = bad.length === 0;
  console.log(`  ${ok ? '✓' : '✗'} ${label}${ok ? '' : `  → write tools still present: ${bad.join(', ')}`}`);
  ok ? pass++ : fail++;
}

// ── Test groups ───────────────────────────────────────────────────────────────

console.log('\n── Baseline ─────────────────────────────────────────────────────────────');
{
  const t = getTools();
  expect('loads all 384 tools by default', t.count, 384);
  expect('has 22 modules', t.modules.length, 22);
  expect('has 117 write tools', t.writeCount, 117);
  expect('has 267 read tools', t.readCount, 267);
}

console.log('\n── --readonly / GATE_READONLY ───────────────────────────────────────────');
{
  const cli = getTools('--readonly');
  expect('--readonly: 267 tools', cli.count, 267);
  expectNoWrite('--readonly: no write tools', cli.names);

  const env = getTools('', { GATE_READONLY: 'true' });
  expect('GATE_READONLY=true: 267 tools', env.count, 267);
  expectNoWrite('GATE_READONLY=true: no write tools', env.names);
}

console.log('\n── Per-module filtering (--modules) ─────────────────────────────────────');
const MODULE_COUNTS = {
  spot:        { total: 31, readonly: 19, write: 12 },
  futures:     { total: 64, readonly: 36, write: 28 },
  delivery:    { total: 29, readonly: 20, write:  9 },
  margin:      { total: 20, readonly: 17, write:  3 },
  wallet:      { total: 22, readonly: 18, write:  4 },
  account:     { total: 10, readonly:  6, write:  4 },
  options:     { total: 29, readonly: 22, write:  7 },
  earn:        { total: 29, readonly: 22, write:  7 },
  flash_swap:  { total:  7, readonly:  5, write:  2 },
  unified:     { total: 22, readonly: 17, write:  5 },  // calculate is write
  sub_account:           { total: 11, readonly:  5, write:  6 },
  p2p:                   { total: 17, readonly: 10, write:  7 },
  tradfi:                { total: 18, readonly: 12, write:  6 },
  crossex:               { total: 31, readonly: 21, write: 10 },
  alpha:                 { total:  9, readonly:  7, write:  2 },
  rebate:                { total:  9, readonly:  9, write:  0 },
  multi_collateral_loan: { total: 12, readonly:  9, write:  3 },
  activity:              { total:  3, readonly:  3, write:  0 },
  coupon:                { total:  2, readonly:  2, write:  0 },
  launch:                { total: 15, readonly: 12, write:  3 },
  square:                { total:  2, readonly:  2, write:  0 },
  assetswap:             { total:  7, readonly:  2, write:  5 },
  bot:                   { total: 10, readonly:  3, write:  7 },
  withdrawal:            { total:  3, readonly:  0, write:  3 },
};

// Abbreviation map (mirrors src/utils.ts NAME_ABBREVIATIONS)
const ABBREV = { futures: 'fx', sub_account: 'sa', dual_mode: 'dual', dual_comp: 'dual', flash_swap: 'fc', multi_collateral_loan: 'mcl', alpha: 'alpha', crossex: 'crx', delivery: 'dc' };
function modulePrefix(mod) {
  const abbr = Object.entries(ABBREV).reduce((s, [l, r]) => s.replaceAll(l, r), mod);
  return `cex_${abbr}_`;
}

for (const [mod, counts] of Object.entries(MODULE_COUNTS)) {
  console.log(`\n  [${mod}]`);
  const prefix = modulePrefix(mod);

  const all = getTools(`--modules=${mod}`);
  expect(`total tools`, all.count, counts.total);
  expectAllMatch(`all tools have prefix ${prefix}`, all.names, prefix);
  expect(`write tool count`, all.writeCount, counts.write);

  const ro = getTools(`--modules=${mod} --readonly`);
  expect(`readonly tool count`, ro.count, counts.readonly);
  expectNoWrite(`no write tools in readonly mode`, ro.names);
}

console.log('\n── Per-module filtering (GATE_MODULES env var) ──────────────────────────');
{
  const t = getTools('', { GATE_MODULES: 'spot' });
  expect('GATE_MODULES=spot: 31 tools', t.count, 31);
  expectAllMatch('all tools prefixed cex_spot_', t.names, 'cex_spot_');

  const t2 = getTools('', { GATE_MODULES: 'spot,futures' });
  expect('GATE_MODULES=spot,futures: 95 tools', t2.count, 95);
}

console.log('\n── Combined module + readonly ───────────────────────────────────────────');
{
  const t1 = getTools('--modules=spot,futures --readonly');
  expect('spot+futures --readonly: 55 tools', t1.count, 55);
  expectNoWrite('no write tools', t1.names);

  const t2 = getTools('', { GATE_MODULES: 'wallet,unified,sub_account' });
  expect('wallet+unified+sub_account: 55 tools', t2.count, 55);
}

console.log('\n── CLI flag formats ─────────────────────────────────────────────────────');
{
  const eq  = getTools('--modules=spot');
  const spc = getTools('--modules spot');
  expect('--modules=spot same as --modules spot', eq.count, spc.count);
}

console.log('\n── Unknown module handling ──────────────────────────────────────────────');
{
  let stderr = '';
  try {
    execSync(`printf '%s\n' '${MCP_INIT}' '${MCP_LIST}' | GATE_MODULES=spot,unknown node dist/index.js`, {
      env: { ...process.env }, shell: '/bin/sh', stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch (e) {
    stderr = e.stderr?.toString() ?? '';
  }
  // If no throw, capture stderr separately
  if (!stderr) {
    try {
      const r = execSync(
        `printf '%s\n' '${MCP_INIT}' '${MCP_LIST}' | GATE_MODULES=spot,unknown node dist/index.js 2>&1 >/dev/null`,
        { env: { ...process.env }, shell: '/bin/sh' }
      );
      stderr = r.toString();
    } catch(e) { stderr = e.stdout?.toString() ?? ''; }
  }
  const warned = stderr.includes('Unknown module "unknown"');
  console.log(`  ${warned ? '✓' : '✗'} unknown module name logs a warning`);
  warned ? pass++ : fail++;

  // Should still load valid modules
  const t = getTools('', { GATE_MODULES: 'spot,unknown' });
  expect('valid modules still load despite unknown name', t.count, 31);
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(72)}`);
const total = pass + fail;
console.log(`${pass}/${total} passed${fail > 0 ? `  (${fail} FAILED)` : ''}`);
if (fail > 0) process.exit(1);
