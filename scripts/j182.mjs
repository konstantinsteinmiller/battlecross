import fs from 'node:fs'
import { edit } from './_edit.mjs'

const f = 'src/game/sim/camp.ts'
let s = fs.readFileSync(f, 'utf8')
const crlf = s.includes('\r\n')
s = s.replace(/\r\n/g, '\n')

// 1. The doc comment: the camp is on the boss's floor now.
s = s.replace(/\/\*\*\n \* ─── The rescued teachers' camp \(roadmap #156\)[\s\S]*?\n \*\/\n/, `/**
 * ─── The rescued teachers' camp (roadmap #156, moved by #182) ────────────────
 *
 * The first visit's boss floor holds a small encampment, so the player stumbles
 * on it DURING the fight: a big cage with three of Sunford's teachers in it (the
 * Aegis knight, the pyromancer and the Soul Warden) to the RIGHT of where the
 * boss stands, the broken-down caravan to its LEFT, the camp fire a little
 * BELOW it, and a track of fallen wheels and splinters leading from below the
 * floor to the caravan. The finale's chest stays where it was. They are the very
 * people the hero meets in Sunford again (their ids, looks and voices), held
 * here by the bandits.
 *
 * The boss drops the cage's golden key as it falls (it arcs to the ground and
 * must be picked up); the cage opens once the key is in hand: they step out, the
 * knight thanks the hero in one line (\`dlg.bark.trainerAegis.freed.1\`) and they
 * settle round the fire, where each teaches (their lessons only, no small talk)
 * and the first lesson bought here is free (\`lesson.camp\`). The road teacher,
 * Nettle, walks over to the fire as soon as the boss falls. Nobody waits on any of
 * it: leaving the visit leaves them, and they are found in Sunford whatever
 * happened here (the town lists them unconditionally).
 *
 * The cage is the place's \`cage\` chest (\`cages.ts\` locks and opens it), three
 * cells wide; its people are captives that stay (\`CaptiveState.stay\`). Nothing
 * is carved: every piece stands on the floor's open ground, outside the ring the
 * boss's pack spawns in, and none stands on another.
 */
`)
// 2. The old extra room above the finale is gone.
s = s.replace(/\/\*\* Rows of rock added above the first visit's chain for the camp\. \*\/\nexport const CAMP_ROOM = 18\n\/\*\* The camp's radius[\s\S]*?const CAMP_GAP = 3\.6\n/, "/** Rows of rock added above the first visit's chain for the camp: none since #182 (the camp stands on the boss's floor). */\nexport const CAMP_ROOM = 0\n")
// 3. carveCamp -> placeCamp, dressCamp, debris
const a = s.indexOf('/**\n * Cut the camp out of the rock above the finale')
const b = s.indexOf('// ─── The camp in the world')
if (a < 0 || b < 0) throw new Error('anchors')
const mid = `/** The seconds a dropped key takes to fall to the ground; it cannot be picked up before. */
export const KEY_DROP_T = 0.75

/** Is this cell open ground a piece may stand on (not rock, water, a block or sealed)? */
const openCell = (p: { w: number; h: number; solid: Uint8Array; kind: Uint8Array; sealed: Uint8Array }, i: number, j: number): boolean => {
  if (i < 2 || j < 2 || i >= p.w - 2 || j >= p.h - 2) return false
  const k = j * p.w + i
  return !p.solid[k] && p.kind[k] === K_GROUND && !p.sealed[k]
}

/**
 * Stand the cage on the boss's floor, to the right of where the boss stands: three
 * cells across in the boss's row (as far out as the floor holds three open
 * cells and the one in front of the door), its door facing the camera. Nothing is
 * carved. Returns the cage (a chest), the place its key falls when the boss is
 * not found, and the cage's cells.
 */
export const placeCamp = (p: {
  w: number; h: number; solid: Uint8Array; trail: Uint8Array; kind: Uint8Array; sealed: Uint8Array
  boss: { x: number; z: number }
}): { chest: Omit<ChestPlan, 'id'>; key: { x: number; z: number }; bi: number; bj: number; ci: number; cj: number; cells: number[] } | null => {
  const { w, kind } = p
  const bi = Math.floor(p.boss.x / CELL)
  const bj = Math.floor(p.boss.z / CELL)
  for (const side of [5, 4, 3]) {
    const ci = bi + side
    const ok = [-1, 0, 1].every(d => openCell(p, ci + d, bj)) && [-1, 0, 1].every(d => openCell(p, ci + d, bj + 1))
    if (!ok) continue
    const cells: number[] = []
    for (const d of [-1, 0, 1]) {
      const k = bj * w + ci + d
      kind[k] = K_BLOCK
      cells.push(k)
    }
    return {
      chest: { x: cx(ci), z: cx(bj), tier: 'iron', role: 'cage', sx: cx(ci), sz: cx(bj + 1), door: -1, guard: -1 },
      key: { x: cx(bi), z: cx(bj + 1) },
      bi, bj, ci, cj: bj, cells
    }
  }
  return null
}

/** Where the fire may stand, tried in turn (cells from the boss: a little below it). */
const FIRE_AT: ReadonlyArray<readonly [number, number]> = [[0, 4], [1, 4], [-1, 4], [0, 5], [2, 4], [-2, 4]]
/** Where the caravan may stand, tried in turn (cells from the boss: to its left; two across, three along). */
const WAGON_AT: ReadonlyArray<readonly [number, number, number]> = [[-6, -1, 0], [-5, -1, 0], [-7, -1, 0], [-6, 0, 0], [-5, 0, 0]]
/** The places round the fire the teachers keep (cells from it): the three, then Nettle. */
const SPOT_AT: ReadonlyArray<readonly [number, number]> = [[-1, 1], [1, 1], [0, 1], [-1, 0], [1, 0], [-2, 1], [2, 1], [0, -1], [-1, -1], [1, -1], [-2, 0], [2, 0]]
/** The wreckage on the way in, in cells from the boss: from below the floor towards the caravan (left, and a little above the boss's row), thicker towards it. */
const DEBRIS_AT: ReadonlyArray<readonly [number, number, 'wheel' | 'spikes']> = [
  [-0.8, 6.0, 'spikes'], [-1.7, 5.2, 'wheel'], [-2.3, 4.3, 'spikes'], [-2.9, 3.4, 'wheel'], [-3.3, 2.6, 'spikes'], [-3.7, 1.9, 'wheel']
]

/**
 * The fire and the broken-down caravan (set pieces: they keep their cells, and the
 * dresser takes either back if it would cut anything off), the track of wreckage
 * between them, and the teachers' places round the fire.
 */
export const dressCamp = (d: Dresser, p: {
  w: number; h: number; solid: Uint8Array; kind: Uint8Array; sealed: Uint8Array
  bi: number; bj: number; ci: number; cj: number; cells: readonly number[]; key: { x: number; z: number }
}): CampPlan => {
  const { w, solid, kind, bi, bj } = p
  let fi = bi
  let fj = bj + 4
  for (const [di, dj] of FIRE_AT) {
    if (d.stand('fire', bi + di, bj + dj, 0, { clear: 0 })) { fi = bi + di; fj = bj + dj; break }
  }
  for (const [di, dj, a] of WAGON_AT) if (d.stand('wagon', bi + di, bj + dj, a, { clear: 0 })) break
  // What fell off the caravan (#177, #182): dice-free, on open ground only, never on a piece.
  for (const [dx, dz, kd] of DEBRIS_AT) {
    const i = Math.round(bi + dx)
    const j = Math.round(bj + dz)
    if (!d.free(i, j, 0)) continue
    d.lay(kd, cx(bi + dx - 0.5), cx(bj + dz - 0.5), 0.7 * (dx + 9))
  }
  const keyK = Math.floor(p.key.z / CELL) * w + Math.floor(p.key.x / CELL)
  const spots: Array<{ x: number; z: number }> = []
  for (const [di, dj] of SPOT_AT) {
    if (spots.length >= 4) break
    const i = fi + di
    const j = fj + dj
    const k = j * w + i
    if (!openCell(p, i, j) || k === keyK || !d.free(i, j, 0)) continue
    spots.push({ x: cx(i), z: cx(j) })
  }
  // Too crowded round the fire (it never is on the seeds tried): the fire's own cell and its neighbours.
  while (spots.length < 4) spots.push({ x: cx(fi + spots.length - 2), z: cx(fj) })
  // Nettle comes in from the south edge of the floor, the way the hero came.
  let entry = { x: cx(bi), z: cx(bj + 3) }
  for (const [di, dj] of [[0, 6], [1, 6], [-1, 6], [0, 5], [1, 5], [-1, 5], [2, 5]] as const) {
    if (openCell(p, bi + di, bj + dj) && !solid[(bj + dj) * w + bi + di]) { entry = { x: cx(bi + di), z: cx(bj + dj) }; break }
  }
  void kind
  return { x: cx(fi), z: cx(fj), cells: [...p.cells], fire: { x: cx(fi), z: cx(fj) }, spots, entry }
}

`
s = s.slice(0, a) + mid + s.slice(b)
// 4. imports
s = s.replace("import { carveLine } from './layouts'\n", '')
s = s.replace("import { face, setGoal, stop, walk } from './actors'", "import { face, setGoal, stop, walk } from './actors'\nimport { nearestOpen } from './grid'")
s = s.replace("import { CELL } from './grid'\n", "import { CELL } from './grid'\nimport { applyStatus } from './world'\n")
// 5. populateCamp: the key waits for the boss; the caged are untouchable
s = s.replace("  sim.cageKey = key ? { x: key.x, z: key.z, taken: false } : null\n  sim.captives = []\n  const n = plan.spots[3] ?? plan.fire", "  // The boss drops it when it falls (#182): until then it is nowhere (\`drop\` -1).\n  sim.cageKey = key ? { x: key.x, z: key.z, taken: false, drop: -1 } : null\n  sim.captives = []\n  const n = plan.spots[3] ?? plan.fire")
s = s.replace("    u.x = u.px = x\n    u.z = u.pz = z\n    u.rooted = true\n    const spot = plan.spots[q] ?? plan.fire", "    u.x = u.px = x\n    u.z = u.pz = z\n    u.rooted = true\n    // The boss fights beside them now: nothing may touch them behind the bars.\n    applyStatus(sim, u, 'invulnerable', 1e9, 1, u, { quiet: true })\n    const spot = plan.spots[q] ?? plan.fire")
// 6. stepCamp: the key drop
s = s.replace("export const stepCamp = (sim: Sim, dt: number): void => {\n  const c = sim.camp\n  if (!c || sim.ended !== 'victory') return\n", `export const stepCamp = (sim: Sim, dt: number): void => {
  const c = sim.camp
  if (!c || sim.ended !== 'victory') return
  dropKey(sim, dt)
`)
s = s.replace("/** Every step: once the boss is down, Nettle walks over to the fire. */", `/**
 * The boss's key (#182): where the boss fell (or the nearest open ground to it), arcing down
 * for \`KEY_DROP_T\` seconds; it can be picked up once it has landed.
 */
const dropKey = (sim: Sim, dt: number): void => {
  const k = sim.cageKey
  if (!k || k.taken || k.drop === undefined) return
  if (k.drop < 0) {
    // Where the boss lay: the dead leader of the finale's pack, else the planned place.
    const g = sim.groups.find(q => q.boss)
    const boss = g ? sim.units.find(u => u.group === g.id && !u.alive && u.kind === g.boss) : undefined
    let x = boss?.x ?? k.x
    let z = boss?.z ?? k.z
    const out: [number, number] = [x, z]
    if (nearestOpen(sim.grid, x, z, out, 4)) { x = out[0]; z = out[1] }
    k.x = x
    k.z = z
    k.drop = 0
    sim.emit({ t: 'cageKeyDrop', x, z })
    return
  }
  if (k.drop < KEY_DROP_T) k.drop = Math.min(KEY_DROP_T, k.drop + dt)
}

/** Every step: once the boss is down, Nettle walks over to the fire. */`)
// 7. where the way to the teachers leads: nowhere until the key has dropped
s = s.replace("  if (sim.cageKey && !sim.cageKey.taken) return { id: -2, x: sim.cageKey.x, z: sim.cageKey.z }", "  // Before the boss drops it the key is nowhere: the way leads to the cage's door.\n  if (sim.cageKey && !sim.cageKey.taken && (sim.cageKey.drop ?? KEY_DROP_T) >= 0) return { id: -2, x: sim.cageKey.x, z: sim.cageKey.z }")
fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s)

// cages.ts: the key's drop; its pickup waits for the landing
edit('src/game/sim/cages.ts', "export interface CageKeyState {\n  x: number\n  z: number\n  taken: boolean\n}", "export interface CageKeyState {\n  x: number\n  z: number\n  taken: boolean\n  /** The first visit's camp (#182): seconds since the boss dropped it; -1 not yet dropped; absent: a key that lies about from the start. */\n  drop?: number\n}")
edit('src/game/sim/herbs.ts', "  if (key && !key.taken && Math.hypot(key.x - u.x, key.z - u.z) <= PICK_REACH) {", "  // A key the boss drops lies still only once it has landed (#182).\n  if (key && !key.taken && (key.drop === undefined || key.drop >= KEY_DROP_T) && Math.hypot(key.x - u.x, key.z - u.z) <= PICK_REACH) {")
edit('src/game/sim/types.ts', "  | { t: 'cageKey'; x: number; z: number }", "  | { t: 'cageKey'; x: number; z: number }\n  /** The boss let the camp's key fall (#182). */\n  | { t: 'cageKeyDrop'; x: number; z: number }")
// zoneGen: no extra room, the camp on the boss floor
const Z = 'src/game/sim/zoneGen.ts'
edit(Z, "import { CAMP_ROOM, carveCamp, dressCamp, type CampPlan } from './camp'", "import { CAMP_ROOM, dressCamp, placeCamp, type CampPlan } from './camp'")
edit(Z, "  // The first visit's camp (#156): cut out above the finale, its cage a chest.\n  const campCut = o.tutorial && !o.bare ? carveCamp({ w: Wd, h, solid, trail, kind, sealed, fin: cs[n]! }) : null", "  // The first visit's camp (#156, #182): on the boss's floor, its cage (right of the boss) a chest.\n  const finalePack = packs.find(q => q.finale)\n  const campCut = o.tutorial && !o.bare && finalePack ? placeCamp({ w: Wd, h, solid, trail, kind, sealed, boss: { x: finalePack.x, z: finalePack.z } }) : null")
edit(Z, "dressCamp(dresser, { w: Wd, solid, kind, ...campCut, fin: cs[n]! })", "dressCamp(dresser, { w: Wd, h, solid, kind, sealed, ...campCut })")
edit(Z, "    campAvoid.push(campCut.key, campCut.chest)\n    for (let dj = -8; dj <= 8; dj += 2) for (let di = -8; di <= 8; di += 2) if (Math.hypot(di, dj) <= 8) campAvoid.push({ x: cx0(campCut.ci + di), z: cx0(campCut.cj + dj) })", "    campAvoid.push(campCut.key, campCut.chest)\n    for (let dj = -9; dj <= 9; dj += 2) for (let di = -9; di <= 9; di += 2) if (Math.hypot(di, dj) <= 9) campAvoid.push({ x: cx0(campCut.bi + di), z: cx0(campCut.bj + dj) })")
// director: the camp's fire is not the pack's own fire
edit('src/game/sim/director.ts', "    const fire = plan.dressing?.find(d => d.kind === 'fire' && Math.hypot(d.x - p.x, d.z - p.z) < p.r)", "    // (The first visit's camp fire is the teachers', not a fire the boss's pack sits round.)\n    const fire = plan.dressing?.find(d => d.kind === 'fire' && Math.hypot(d.x - p.x, d.z - p.z) < p.r && !(plan.camp && d.x === plan.camp.fire.x && d.z === plan.camp.fire.z))")
console.log('ok')
