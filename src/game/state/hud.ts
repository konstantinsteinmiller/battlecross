import { shallowReactive } from 'vue'

/**
 * ─── The reactivity firewall ─────────────────────────────────────────────────
 *
 * The sim never touches Vue. It writes a SHALLOW reactive mirror (`hud`) at a
 * throttled rate (≤ 15 Hz) for the parts of the HUD that are fine to update
 * through Vue (labels, objective text, button states), and it pushes transient
 * per-frame work (damage numbers, crosshair ring, joystick) to a ticker the
 * HUD component registers — those are direct DOM writes, never reactive.
 */

export type Phase = 'boot' | 'beamIn' | 'play' | 'beamOut' | 'dead' | 'done' | 'hub'

export interface CompassMarker {
  /** Bearing relative to the view, radians, 0 = straight ahead, + = right. */
  bearing: number
  kind: 'objective' | 'exit' | 'enemy' | 'chest' | 'boss'
  dist: number
}

export const hud = shallowReactive({
  phase: 'boot' as Phase,
  hp: 100,
  maxHp: 100,
  we: 28,
  maxWe: 28,
  power: 100,
  maxPower: 100,
  level: 1,
  xp01: 0,
  bolts: 0,
  /** Combat engaged (lock-on active). */
  combat: false,
  /** Name/level of the locked target, empty when none. */
  targetName: '',
  targetLevel: 0,
  targetHp01: 0,
  targetElite: false,
  /** Boss bar. */
  bossName: '',
  bossHp01: 0,
  /** Contextual interact prompt (i18n key + params), empty when none. */
  interactKey: '',
  /** Objective tracker line (i18n key + params). */
  objectiveKey: '',
  objectiveParams: {} as Record<string, string | number>,
  objectiveDone: false,
  compass: [] as CompassMarker[],
  /** Weapon slots: id or '' + WE cost + ready flag. */
  weapons: [
    { id: '', cost: 0, ready: false, color: '#ffffff' },
    { id: '', cost: 0, ready: false, color: '#ffffff' }
  ],
  tanks: 0,
  slideReady: true,
  blockHeld: false,
  /** Tutorial tip id (i18n key), '' when none. */
  tip: '',
  /** Sector / mission title card. */
  titleKey: '',
  titleSub: '',
  titleShownAt: 0
})

export type HudTicker = (dt: number) => void
const tickers = new Set<HudTicker>()
/** Register a per-frame HUD callback (direct DOM writes). Returns a remover. */
export const addHudTicker = (fn: HudTicker): (() => void) => {
  tickers.add(fn)
  return () => { tickers.delete(fn) }
}
export const tickHud = (dt: number): void => {
  for (const fn of tickers) fn(dt)
}

// ─── Transient events (drained by the HUD ticker) ───────────────────────────

export type HudEvent =
  | { t: 'damage'; x: number; y: number; z: number; amount: number; crit: boolean; weak: boolean; toPlayer: boolean }
  | { t: 'text'; x: number; y: number; z: number; key: string; color: string; params?: Record<string, string | number> }
  | { t: 'toast'; key: string; params?: Record<string, string | number>; color?: string; icon?: string }
  | { t: 'flash'; color: string; strength: number }
  | { t: 'hurt'; strength: number }

export const hudEvents: HudEvent[] = []
export const pushHud = (e: HudEvent): void => {
  if (hudEvents.length < 64) hudEvents.push(e)
}
