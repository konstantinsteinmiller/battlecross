import { isControlled } from '../combat'
import type { Sim } from '../world'
import type { Action, Unit } from '../types'
import { SCRIPTED, runCharge, stepCharge, stepExit } from './kit'
import { TUSKER_SCRIPTS } from './tusker'
import { SKYFIRE_SCRIPTS } from './skyfire'

/**
 * ─── Scripted bosses (#74) ───────────────────────────────────────────────────
 *
 * A boss whose def names a `script` fights by it: the script decides its
 * phases and its signature moves; whatever it leaves alone (a basic swing, the
 * def's plain abilities) the generic AI does as for any enemy. The scripts:
 *
 *   tusker       the Goblin King's war boar (Goldfield Hollows): gore charges
 *                that pin or daze, a war horn, the King leaping off at half
 *   kingAfoot    the Goblin King on foot: triple dashes, a bomb ring, and at
 *                half Tusker charging back in once
 *   tuskerCameo  that one charge, then gone
 *   skyfire      the Void Dragon (Dragonspine Peak): a sweeping breath; at 60 %
 *                it takes off for strafing runs that leave fire, then crashes
 *                down dazed; enraged at 30 %, a second flight at 15 %
 */

export interface BossScript {
  /** Health fractions at which phase 2, 3 … begin (descending). */
  phases: number[]
  /** A phase begins: its spectacle, its change of the field. */
  onPhase?(sim: Sim, u: Unit, phase: number): void
  /** Free to act: start a signature move (true), or leave the turn to the generic AI (false). */
  think(sim: Sim, u: Unit, tgt: Unit, dt: number): boolean
  /** A scripted move lands (a charge's wind-up is the kit's). */
  land?(sim: Sim, u: Unit, act: Action): void
  /** In the air: the script flies it (true while it holds the turn). */
  air?(sim: Sim, u: Unit, dt: number, tgt: Unit | null): boolean
}

export const BOSS_SCRIPTS: Record<string, BossScript> = {
  ...TUSKER_SCRIPTS,
  ...SKYFIRE_SCRIPTS
}

export { SCRIPTED }

/**
 * The boss's turn, before the generic AI. True: the script used the turn
 * (a run, a flight, a phase's spectacle, a move begun); false: fight on as
 * any enemy does.
 */
export const stepBoss = (sim: Sim, u: Unit, dt: number, tgt: Unit | null): boolean => {
  const b = u.boss!
  const s = BOSS_SCRIPTS[b.script]
  if (!s) return false
  b.modeT += dt
  if (b.next > 0) b.next -= dt
  switch (b.mode) {
    case 'gone':
      return true
    case 'exit':
      stepExit(sim, u, dt)
      return true
    case 'charge':
      stepCharge(sim, u, dt)
      return true
    case 'air':
      return s.air ? s.air(sim, u, dt, tgt) : (b.mode = '', false)
    case 'dazed':
      if (isControlled(u)) return true
      b.mode = ''
      break
  }
  if (isControlled(u) || u.action) return false
  // The next phase, once it is free to show it.
  const line = s.phases[b.phase - 1]
  if (line !== undefined && u.hp <= u.s.maxHp * line) {
    b.phase++
    u.phase = b.phase
    sim.emit({ t: 'bossPhase', unit: u.id, phase: b.phase })
    s.onPhase?.(sim, u, b.phase)
    if (u.action || b.mode) return true
  }
  if (!tgt || u.aiT > 0) return false
  return s.think(sim, u, tgt, dt)
}

/** A scripted action lands. */
export const landScripted = (sim: Sim, u: Unit, act: Action): void => {
  if (act.id === 'charge' && u.boss) { runCharge(sim, u); return }
  const s = u.boss ? BOSS_SCRIPTS[u.boss.script] : undefined
  s?.land?.(sim, u, act)
}
