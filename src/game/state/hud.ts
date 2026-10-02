import { shallowReactive } from 'vue'

/**
 * ─── The reactivity firewall ─────────────────────────────────────────────────
 *
 * The sim never touches Vue. The live mode writes a SHALLOW reactive mirror
 * (`hud`) at a throttled rate (≤ 15 Hz) for the parts of the HUD that are fine
 * to update through Vue (bars, labels, button states), and pushes per-frame
 * work (damage numbers, cooldown clocks, the joystick, the drag line's DOM
 * markers) to tickers the HUD components register — those are direct DOM
 * writes, never reactive.
 */

export type Phase = 'boot' | 'play' | 'won' | 'dead' | 'town' | 'map'

export interface SkillSlotView {
  /** Skill id, or '' for an empty slot. */
  id: string
  /** Ready to cast now (off cooldown, enough mana, not locked out). */
  ready: boolean
  /** Not enough mana (the button dims blue rather than grey). */
  noMana: boolean
  /** Locked by a status (overheat, stun, silence). */
  locked: boolean
  /** A buff from this skill is running: the button keeps its glow. */
  active: boolean
}

const emptySlot = (): SkillSlotView => ({ id: '', ready: false, noMana: false, locked: false, active: false })

export const hud = shallowReactive({
  phase: 'boot' as Phase,
  hp: 100,
  maxHp: 100,
  shield: 0,
  mana: 30,
  maxMana: 30,
  /** Heat 0..100 (Aether-Tech); -1 hides the gauge. */
  heat: -1,
  overheated: false,
  level: 1,
  xp01: 0,
  gold: 0,
  potions: 0,
  potionsMax: 0,
  potionReady: true,
  /** The six active slots. Replaced whole on a change. */
  skills: [emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot(), emptySlot()] as SkillSlotView[],
  /** Status icons on the hero (ids, e.g. 'stun', 'burn', 'haste'). */
  statuses: [] as string[],
  /** The locked target: its name key, level, health and whether it is elite. */
  targetKey: '',
  targetLevel: 0,
  targetHp01: 0,
  targetElite: false,
  /** Boss bar ('' = none). */
  bossKey: '',
  bossHp01: 0,
  /** Zone progress: enemy groups cleared of the total, or the wave number. */
  zoneKey: '',
  zoneLevel: 0,
  groupsDone: 0,
  groupsTotal: 0,
  wave: 0,
  /** An NPC is in reach (town): its name key for the prompt, '' for none. */
  interactKey: '',
  /** The hand in use: keycaps show on prompts only for mouse + keys. */
  device: 'mouse' as 'touch' | 'mouse',
  /** The control coach's glyphs on screen (`game/coach.ts`). */
  hints: [] as Array<{ id: string; kind: string; pips: number; done: number; flash: number }>
})

/**
 * Per-frame values the HUD paints with direct DOM writes from its ticker —
 * NOT reactive, so a number that changes every frame never re-renders a
 * component. Written by the live mode's HUD sync.
 */
export const hudLive = {
  /** Cooldown left / total per active slot (seconds). */
  cd: [0, 0, 0, 0, 0, 0],
  cdMax: [1, 1, 1, 1, 1, 1],
  potionCd: 0,
  potionCdMax: 1,
  /** The hero on screen (surface px), for hints drawn around them. */
  heroX: 0,
  heroY: 0,
  /** Where a coach glyph points (surface px) and whether it has a target. */
  hintX: 0,
  hintY: 0,
  hintOn: false
}

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

/** GDD §2.3 colour coding of floating text. */
export type TextKind = 'normal' | 'crit' | 'heal' | 'mana' | 'status' | 'hurt' | 'gold' | 'xp'

export type HudEvent =
  /** A number over a unit (surface px are resolved at draw time from x/y/z). */
  | { t: 'num'; x: number; y: number; z: number; amount: number; kind: TextKind }
  /** A word over a unit (an i18n key: "Stunned", "Dodge", "Blocked"). */
  | { t: 'word'; x: number; y: number; z: number; key: string; kind: TextKind }
  | { t: 'toast'; key: string; params?: Record<string, string | number>; icon?: string }
  | { t: 'flash'; color: string; strength: number }
  | { t: 'hurt'; strength: number }

export const hudEvents: HudEvent[] = []
export const pushHud = (e: HudEvent): void => {
  if (hudEvents.length < 96) hudEvents.push(e)
}
