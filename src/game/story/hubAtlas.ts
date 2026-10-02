import { profile, markTip } from '../state/profile'
import { SECTOR_BY_ID } from '../data/regions'
import type { SectorId } from '../world/themes'
import { Scene, type Beat } from './vexScene'
import { hubSceneUi } from './hubSceneUi'

/**
 * ─── Atlas on the mission board (#117) ───────────────────────────────────────
 *
 * Two of Atlas's lines belong to the Lab, where it has no bubble of its own:
 * a sector's floor level the first time ever it is selected ("{sector} runs
 * level 9 and up."), and "They'll outclass you. Train first." when Flux is
 * under that level (once per Lab visit and sector: advice before deploying,
 * not a nag). They show in the scene bubble (`SceneBubble.vue`), on a clock
 * of their own, and give way at once to a Vex scene.
 */

/** The sectors with a floor line (`atlas.hint.floor.<id>`): every one after the Scrapyard. */
const FLOOR_LINES: ReadonlySet<string> = new Set(['blaze', 'cryo', 'volt', 'gale', 'magnet', 'drill', 'tide', 'neon', 'rotor', 'fortress'])

let scene: Scene | null = null
let raf = 0
let last = 0
const warned = new Set<SectorId>()

const stop = (): void => {
  cancelAnimationFrame(raf)
  scene?.skip()
  scene = null
}

const loop = (now: number): void => {
  const dt = Math.min(0.1, (now - last) / 1000)
  last = now
  // A Vex scene owns the bubble: Atlas's hint steps aside.
  if (!scene || hubSceneUi.active) return stop()
  if (!scene.update(dt)) { scene = null; return }
  raf = requestAnimationFrame(loop)
}

/** The lines a selected sector earns right now (pure: what, not when). */
export const boardLines = (id: SectorId, level: number, tips: Record<string, unknown>, warnedNow: ReadonlySet<SectorId>): Beat[] => {
  const beats: Beat[] = []
  const floor = SECTOR_BY_ID[id].levels[0]
  if (FLOOR_LINES.has(id) && !tips[`atlas:floor:${id}`]) {
    beats.push({ atlas: `atlas.hint.floor.${id}`, params: { sector: `sector.${id}` }, gap: 0.4 })
  }
  if (level < floor && !warnedNow.has(id)) beats.push({ atlas: 'atlas.hint.underLevel' })
  return beats
}

/** A sector was selected on the board: Atlas says what it earns, if anything. */
export const sectorSelected = (id: SectorId): void => {
  if (hubSceneUi.active || !profile.world.unlocked.includes(id)) return
  const beats = boardLines(id, profile.level, profile.tips, warned)
  if (!beats.length) return
  if (beats.some(b => 'atlas' in b && b.atlas.startsWith('atlas.hint.floor.'))) markTip(`atlas:floor:${id}`)
  if (profile.level < SECTOR_BY_ID[id].levels[0]) warned.add(id)
  stop()
  scene = new Scene(beats, 'top')
  last = performance.now()
  raf = requestAnimationFrame(loop)
}

/** The Lab opens: the under-level advice may be given again; nothing is speaking. */
export const boardOpened = (): void => {
  warned.clear()
  stop()
}

/** The Lab closes (a mission starts): whatever Atlas was saying ends. */
export const boardClosed = (): void => stop()
