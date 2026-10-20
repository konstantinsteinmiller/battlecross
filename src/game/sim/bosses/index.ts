import { isControlled } from '../combat'
import type { Sim } from '../world'
import type { Action, Unit } from '../types'
import { SCRIPTED, runCharge, stepCharge, stepExit } from './kit'
import { TUSKER_SCRIPTS } from './tusker'
import { SKYFIRE_SCRIPTS } from './skyfire'
import { HELLGATE_SCRIPTS } from './hellgate'
import { SHATTERLAKE_SCRIPTS } from './shatterlake'
import { CHIMERA_SCRIPTS } from './chimera'
import { CENTAUR_SCRIPTS } from './centaur'
import { CYCLOPS_SCRIPTS } from './cyclops'
import { SPHINX_SCRIPTS } from './sphinx'
import { LEVIATHAN_SCRIPTS } from './leviathan'
import { HYDRA_SCRIPTS } from './hydra'
import { ELDER_DRAGON_SCRIPTS } from './elderDragon'

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
 *   hellgate     the Arch-Demon (Dread Fortress): a sword wave, hellfire
 *                pillars, a dive whose shadow hunts and locks (the blade
 *                sticks); at 55 % a ring of fire closes in; three dives at 25 %
 *   shatterlake  the Frost Jarl (Frostpeak Tundra): hammerfall raises ice
 *                spikes, a shoulder charge that shatters on them (dazed); at
 *                half the ice breaks and a glacier grinds across, one gap in it
 *
 * The Breaking's bosses (afterplay §5, phase 5), each teaching one thing:
 *
 *   chimera      the Chimera (Wildwood): three heads, each glowing its colour
 *                before its move; at 60 % two glow at once (read the safe
 *                side); at 30 % the serpent tail is cut off and fights alone
 *   centaur      the Centaur Warchief (Outskirts): keeps its distance and
 *                shoots, tramples whoever closes in; raiders and spears at
 *                60 %; at 30 % it rears before each charge — lure it into a
 *                hay wagon
 *   cyclops      the Cyclops (Mines): armoured but for its eye, which only a
 *                missed boulder or a beam it slams into opens; at 60 % it
 *                covers it; at 30 % blind, it goes for the last noise
 *
 * And the last four (afterplay §5.4-5.7, phase 7):
 *
 *   sphinx       the Sphinx (Temple): claws and sand; at 60 % and 30 % she flies
 *                up and asks a riddle of coloured plates, stepped in order
 *   leviathan    the Leviathan (Citadel): a flooded hall with six islands; it
 *                surfaces to bite, a tidal wave to shelter from; islands sink
 *                at 60 %, it grabs at 30 %
 *   hydra        the Hydra (Fortress): every blow lands on a head; a cut stump
 *                grows two unless fire sears it (braziers for every build);
 *                no heads, and the body is open
 *   elderDragon  the Elder Dragon (Rift, the final fight): breath, tail, gust;
 *                at 70 % in the air behind rune stones; a void ring at 40 %;
 *                at 15 % the rift holds it 30 s, or it heals to 30 %
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
  /** Every step, whatever it is doing: what runs on by itself (a ring of fire, a glacier). */
  tick?(sim: Sim, u: Unit, dt: number): void
  /** In the air: the script flies it (true while it holds the turn). */
  air?(sim: Sim, u: Unit, dt: number, tgt: Unit | null): boolean
  /** Once, on its first step (asleep or not): its arena's props (`raiseProps`). */
  arena?(sim: Sim, u: Unit): void
  /**
   * What a competent player does about the fight's puzzle right now (the
   * reference bot reads it): walk to a spot (a riddle's plate, cover from a
   * wave), or hit a unit that is not the boss. Null: just fight.
   */
  botGoal?(sim: Sim, u: Unit): BotGoal | null
}

/** A spot to stand on, or a unit to strike (`attack`, its id). */
export interface BotGoal { x: number; z: number; attack?: number }

export const BOSS_SCRIPTS: Record<string, BossScript> = {
  ...TUSKER_SCRIPTS,
  ...SKYFIRE_SCRIPTS,
  ...HELLGATE_SCRIPTS,
  ...SHATTERLAKE_SCRIPTS,
  ...CHIMERA_SCRIPTS,
  ...CENTAUR_SCRIPTS,
  ...CYCLOPS_SCRIPTS,
  ...SPHINX_SCRIPTS,
  ...LEVIATHAN_SCRIPTS,
  ...HYDRA_SCRIPTS,
  ...ELDER_DRAGON_SCRIPTS
}

/** Its arena, once: what stands in it is up before the hero comes in sight. */
export const setArena = (sim: Sim, u: Unit): void => {
  const b = u.boss!
  b.marks.push('arena')
  BOSS_SCRIPTS[b.script]?.arena?.(sim, u)
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
  for (const k in b.cd) if (b.cd[k]! > 0) b.cd[k]! -= dt
  if (b.mode !== 'gone') s.tick?.(sim, u, dt)
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
