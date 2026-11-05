import type { AttrBlock } from './attributes'
import { ITEM_BY_ID, ITEMS, EQUIP_SLOTS, slotOf, type EquipSlot, type ItemDef } from './items'
import { attrWeights, itemScore } from './upgrade'

/**
 * ─── The Goblin King's hoard (roadmap, the first-clear pick) ─────────────────
 *
 * The first time the Goblin King falls, the finale chest does not roll a piece
 * of gear at random: three pieces are laid out and the hero keeps one. Which
 * three is not luck. They are the pieces of the early game that this build
 * wants most, by the same weighted score behind every green "better" arrow
 * (`data/upgrade.ts`), judged by how far each one lifts its slot over what is
 * worn there (an empty slot counts its whole worth), in three different slots
 * so the cards are three different decisions, never three helmets.
 *
 * A weapon that scales with the build's strongest attribute gets a small edge
 * (the "fight style"): a hero who put everything into dexterity is shown the
 * dagger before the broadsword.
 *
 * Pure: no profile, no Vue, no randomness, so a test pins it and a reload
 * shows the same three cards.
 */

export interface HoardInput {
  level: number
  attrs: Readonly<AttrBlock>
  equipped: Readonly<Record<EquipSlot, string | null>>
  /** Everything the hero owns (the bag, worn or not) and what this visit has found. */
  owned: readonly string[]
  /** Upgrade levels by item id (a worn +3 is measured as it is). */
  ups?: Readonly<Record<string, number>>
}

export type HoardWhy = 'style' | 'empty' | 'upgrade'

export interface HoardPick {
  id: string
  /** How far it lifts its slot over what is worn (an empty slot: its whole score). */
  gain: number
  /** The card the build wants most. */
  best: boolean
  /** Why it was chosen: a weapon in the build's own style, a bare slot, a better piece. */
  why: HoardWhy
  /** The piece worn in its slot that it would replace ('' for a bare slot). */
  over: string
}

/** The most the Hollows' hoard goes up to: Common to Rare, a little above the hero's level. */
const MAX_TIER = 3
const LEVEL_SLACK = 3
/** Where a piece can never come from: a forge, a ladder, a siege, an Infernal twin. */
const NEVER = new Set(['smith', 'arena', 'siege', 'infernal'])
/** A weapon of the build's own strongest attribute. */
const STYLE_EDGE = 4

const lvl = (ups: HoardInput['ups'], id: string): number => ups?.[id] ?? 0

/** The worn piece a new one in `slot` would replace: a bare slot if there is one, else the weakest worn. */
const replaced = (it: ItemDef, input: HoardInput, w: ReturnType<typeof attrWeights>): { id: string; score: number } => {
  let worst = { id: '', score: 0 }
  let found = false
  for (const s of EQUIP_SLOTS) {
    if (slotOf(s) !== it.slot) continue
    const id = input.equipped[s]
    const worn = id ? ITEM_BY_ID[id] : undefined
    if (!worn) return { id: '', score: 0 }
    const sc = itemScore(worn, w, lvl(input.ups, id!))
    if (!found || sc < worst.score) { worst = { id: id!, score: sc }; found = true }
  }
  return worst
}

const candidates = (input: HoardInput, tier: number, slack: number): ItemDef[] => {
  const have = new Set([...input.owned, ...EQUIP_SLOTS.map(s => input.equipped[s]).filter((x): x is string => !!x)])
  return ITEMS.filter(it =>
    it.tier <= tier && it.level <= input.level + slack && !have.has(it.id) && !it.infernal && !it.set && !NEVER.has(it.drop.src))
}

/**
 * Up to three pieces for this hero, the best fit first. Fewer only when the
 * early game has nothing left that he lacks.
 */
export const kingHoardPicks = (input: HoardInput): HoardPick[] => {
  const w = attrWeights(input.attrs)
  const top = Math.max(...(Object.values(w) as number[]))
  const topAttrs = new Set((Object.keys(w) as Array<keyof typeof w>).filter(a => w[a] >= top - 1e-9))
  let pool = candidates(input, MAX_TIER, LEVEL_SLACK)
  if (pool.length < 6) pool = candidates(input, MAX_TIER + 1, LEVEL_SLACK + 2)

  const scored = pool.map((it): HoardPick & { slot: string; raw: number } => {
    const r = replaced(it, input, w)
    const style = !!it.weapon && topAttrs.has(it.weapon.scale)
    const raw = itemScore(it, w) + (style ? STYLE_EDGE : 0)
    const gain = raw - r.score
    return { id: it.id, gain, best: false, why: style ? 'style' : r.id ? 'upgrade' : 'empty', over: r.id, slot: it.slot, raw }
  })
  // Only what would help; if nothing does (a fully geared hero), what is least bad.
  const helpful = scored.filter(s => s.gain > 0)
  const ranked = (helpful.length >= 3 ? helpful : scored).sort((a, b) => b.gain - a.gain || b.raw - a.raw || a.id.localeCompare(b.id))

  const out: HoardPick[] = []
  const slots = new Set<string>()
  for (const s of ranked) {
    if (slots.has(s.slot)) continue
    slots.add(s.slot)
    out.push({ id: s.id, gain: Math.round(s.gain * 10) / 10, best: false, why: s.why, over: s.over })
    if (out.length === 3) break
  }
  if (out[0]) out[0].best = true
  return out
}
