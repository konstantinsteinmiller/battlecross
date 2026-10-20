import type { LevelTier } from '../data/zones'
import { shallowReactive } from 'vue'
import { ACTIVE_SLOTS } from '../data/skills'
import type { StatusChip } from './statusView'

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
  /** The colosseum's weekly modifier ('' elsewhere, roadmap #10). */
  arenaMod: '' as string,
  /** Kills pay double XP now (the rested pool, roadmap #9). */
  rested: false,
  gold: 0,
  potions: 0,
  potionsMax: 0,
  potionReady: true,
  /** The opening fight's potion stop (#154): the world waits for a drink; an arrow bounces on the flask. */
  potionStop: false,
  /** Mana potions in stock, how many the belt holds, and whether one can be drunk now. */
  manaPotions: 0,
  manaPotionMax: 0,
  manaPotionReady: true,
  /** The third flask (#87): the elixir it pours ('' none), how many of it,
   *  how many kinds are carried, and whether one can be drunk now. */
  elixir: '',
  elixirs: 0,
  elixirKinds: 0,
  elixirReady: true,
  /** The six active slots. Replaced whole on a change. */
  skills: Array.from({ length: ACTIVE_SLOTS }, emptySlot) as SkillSlotView[],
  /** Status icons on the hero, with stack counts (`statusView.ts`). */
  statuses: [] as StatusChip[],
  /** Stacks on the locked target (poison …). */
  targetStacks: [] as StatusChip[],
  /** The hero's chi beads (Iron Monk), shown on the skills that spend them. */
  chi: 0,
  /** The locked target: its name key, level, health and whether it is elite. */
  targetKey: '',
  targetLevel: 0,
  /** How the target's level sits against the hero's (its badge's colour, #77). */
  targetTier: 'match' as LevelTier,
  targetHp01: 0,
  targetElite: false,
  /** Boss bar ('' = none): its level, that level's tier, its phase lines (#77). */
  bossKey: '',
  bossHp01: 0,
  bossLevel: 0,
  bossTier: 'match' as LevelTier,
  bossPhases: [] as number[],
  /** Zone progress: enemy groups cleared of the total, or the wave number. */
  zoneKey: '',
  zoneLevel: 0,
  groupsDone: 0,
  groupsTotal: 0,
  wave: 0,
  /** An NPC is in reach (town): its name key for the prompt, '' for none. */
  interactKey: '',
  /** A chest the hero can open is in reach (zone): its tier ('wood' | 'iron' |
   *  'gold') for the "Open" prompt, '' for none. */
  interactChest: '',
  /** An ore outcrop is in reach and no chest is (#99): its metal for the
   *  "Mine" prompt, '' for none. */
  interactOre: '',
  /**
   * The colosseum's announcement (#117): a wave begins (its number; a
   * champion wave; the next prize and its wave), or a milestone falls
   * (`prize`: its mythic is the hero's now; `milestone`: already owned).
   * `id` changes with every announcement, so the banner plays again.
   */
  arenaBanner: null as null | { id: number; kind: 'wave' | 'prize' | 'milestone'; n: number; champion: boolean; item: string; at: number },
  /** The town square's notice board is in reach (#85): the "Read" prompt. */
  interactBoard: false,
  /** A won zone: the Leave button is up; the finale's chest is open; chests still closed here. */
  canLeave: false,
  finaleOpen: false,
  chestsLeft: 0,
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
  cd: Array.from({ length: ACTIVE_SLOTS }, () => 0),
  cdMax: Array.from({ length: ACTIVE_SLOTS }, () => 1),
  potionCd: 0,
  potionCdMax: 1,
  manaPotionCd: 0,
  manaPotionCdMax: 1,
  elixirCd: 0,
  elixirCdMax: 1,
  rollCd: 0,
  rollCdMax: 1,
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
  /** `icon`: an item id (its icon, its tier-coloured name, the "better" arrow);
   *  `at`: where it dropped — its icon flies from there to the bag. */
  | { t: 'toast'; key: string; params?: Record<string, string | number>; icon?: string; at?: { x: number; y: number; z: number } }
  | { t: 'flash'; color: string; strength: number }
  | { t: 'hurt'; strength: number }

export const hudEvents: HudEvent[] = []

/** A boss's shout at a beat of its fight (#74), for `BossBarkLayer` to say: the latest wins. */
let bark: { unit: number; key: string } | null = null
export const sayBark = (unit: number, key: string): void => { bark = { unit, key } }
export const takeBark = (): { unit: number; key: string } | null => {
  const b = bark
  bark = null
  return b
}
export const pushHud = (e: HudEvent): void => {
  if (hudEvents.length < 96) hudEvents.push(e)
}
