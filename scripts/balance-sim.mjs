/**
 * The balance simulation's tables: a whole campaign on paper for each player
 * profile (`src/game/sim/balance.ts`), with the game's own tables.
 *
 *   node scripts/balance-sim.mjs            all profiles, mission by mission
 *   node scripts/balance-sim.mjs --bosses   the Core Masters only
 *
 * The module is TypeScript: a bare Vite (no project config, so none of its
 * plugins run; no build, no server port) loads it.
 */
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const bossesOnly = process.argv.includes('--bosses')
const vite = await createServer({
  configFile: false,
  root: fileURLToPath(new URL('..', import.meta.url)),
  resolve: { alias: { '@': fileURLToPath(new URL('../src', import.meta.url)) } },
  server: { middlewareMode: true, hmr: false },
  appType: 'custom',
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true }
})
try {
  const sim = await vite.ssrLoadModule('/src/game/sim/balance.ts')
  const runs = [sim.REFERENCE, sim.AD_EVERY_ROUND, sim.NO_ADS].map(p => ({ p, rows: sim.simulate(p) }))
  for (const { p, rows } of runs) {
    console.log(`\n── ${p.name} (×3 every ${p.adEvery || '—'}, spends ${Math.round(p.spend * 100)}%, ${p.jobsPerSector} jobs/sector)`)
    console.table(rows.filter(r => !bossesOnly || r.kind !== 'job'))
  }
  const [ref, ad, none] = runs.map(r => r.rows)
  console.log('\nThe every-round ad player\'s edge over the reference (time-to-kill ratio):')
  console.table(sim.bossEdge(ref, ad).map((b, i) => ({ sector: b.sector, boss: b.edge, foes: sim.foeEdge(ref, ad)[i].edge })))
  console.log('The reference\'s edge over a player who never watches an ad:')
  console.table(sim.bossEdge(none, ref).map((b, i) => ({ sector: b.sector, boss: b.edge, foes: sim.foeEdge(none, ref)[i].edge })))
} finally {
  await vite.close()
}
