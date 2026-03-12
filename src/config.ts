export const VALID_MODULES = [
  'spot', 'futures', 'delivery', 'margin', 'wallet',
  'account', 'options', 'earn', 'flash_swap', 'unified', 'sub_account',
  'p2p', 'tradfi', 'crossex', 'alpha',
] as const;

export type ModuleName = typeof VALID_MODULES[number];

export interface ServerConfig {
  /** null means all modules */
  modules: Set<ModuleName> | null;
  readonly: boolean;
}

export function parseConfig(): ServerConfig {
  // --- readonly ---
  let readonly = process.env.GATE_READONLY === 'true';
  if (process.argv.includes('--readonly')) readonly = true;

  // --- modules ---
  // CLI flag: --modules=spot,futures  OR  --modules spot,futures
  let modulesRaw: string | undefined = process.env.GATE_MODULES;

  const flagIndex = process.argv.findIndex(a => a.startsWith('--modules'));
  if (flagIndex !== -1) {
    const arg = process.argv[flagIndex];
    if (arg.includes('=')) {
      modulesRaw = arg.split('=')[1];
    } else if (process.argv[flagIndex + 1] && !process.argv[flagIndex + 1].startsWith('--')) {
      modulesRaw = process.argv[flagIndex + 1];
    } else {
      console.error(`[gate-mcp] --modules flag requires a value (e.g. --modules=spot,futures). Loading all modules.`);
    }
  }

  if (!modulesRaw || modulesRaw.trim() === '') {
    return { modules: null, readonly };
  }

  const requested = modulesRaw.split(',').map(s => s.trim().toLowerCase());
  const valid = new Set<ModuleName>();
  for (const name of requested) {
    if ((VALID_MODULES as readonly string[]).includes(name)) {
      valid.add(name as ModuleName);
    } else {
      console.error(`[gate-mcp] Unknown module "${name}" — ignored. Valid modules: ${VALID_MODULES.join(', ')}`);
    }
  }

  if (valid.size === 0) {
    console.error('[gate-mcp] No valid modules specified — loading all modules.');
    return { modules: null, readonly };
  }

  return { modules: valid, readonly };
}
