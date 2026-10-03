import { EQUIP_SLOTS, ITEM_BY_ID, type EquipSlot } from '../data/items'
import { SKILL_BY_ID, meetsSkill, skillsOf, type ClassId } from '../data/skills'
import { MAP, NODE_BY_ID, TOWNS, type NodeId, type TownId } from '../data/zones'
import { buyCost, canEquip, equippedIn, isNodeOpen, learnBlock, profile, totalAttrs } from '../state/profile'
import { revealed, type RevealId } from './reveal'
import type { FeatureId } from './state'

/**
 * ─── Where each feature lesson points (roadmap #52) ──────────────────────────
 *
 * For every feature, the next thing to do on the screen the player is on —
 * as selectors of the elements to point at, so the layer that draws it
 * (`LessonLayer.vue`) and the tests read the same answer. Null: the feature
 * is not to be taught here (or there is nothing to do with it yet).
 *
 *   tap    a finger taps it (a mouse clicks it), a ring breathes round it;
 *          `rings` breathes round every match (the six "+"), `glow` lights a
 *          part of the screen to look at (the green and red numbers);
 *   drag   a ghost of the thing rides a hand from `from` to `to`
 *          (the mouse's way; a finger is taught tap, then tap);
 *   world  drawn in the scene by the coach (the way to a trainer).
 *
 * `here` says the lesson acts on this screen itself, not on a button that
 * leads to it: such a lesson goes first.
 */

export interface Ghost { item?: string; skill?: string }
export type Step =
  | { kind: 'world'; here: true }
  | { kind: 'tap'; at: string; last?: boolean; rings?: string; glow?: string; here: boolean }
  | { kind: 'drag'; from: string; to: string; ghost: Ghost; glow?: string; here: true }

/** What a lesson reads of the game besides the save. */
export interface FeatureCtx {
  screen: string
  modal: string
  /** The conversation in progress ('' none), its phase, the speaker's role. */
  talk: string
  talkPhase: string
  npcRole: string
  trainerCls: string
  /** The town the hero is in ('' elsewhere). */
  node: string
  family: 'touch' | 'mouse'
  dom: {
    has(sel: string): boolean
    attr(sel: string, name: string): string | null
    all(sel: string, name: string): string[]
  }
}

/** Base order: the first wins when two could start. */
export const FEATURE_ORDER: readonly FeatureId[] = ['teach', 'learn', 'buy', 'travel', 'talk', 'slot', 'equip', 'attr']

const BOOK = new Set(['character', 'skills', 'inventory'])
type Panel = 'character' | 'skills' | 'inventory'
const REVEAL_OF: Record<Panel, RevealId> = { character: 'hero', skills: 'skills', inventory: 'bag' }

/** The way to a page of the hero's book: its tab when the book is open on
 *  another page, else its HUD button (once that button has been revealed). */
const toPanel = (p: Panel, c: FeatureCtx): Step | null => {
  if (BOOK.has(c.modal)) return c.modal === p ? null : { kind: 'tap', at: `.book__tab[data-page="${p}"]`, here: false }
  const calmTown = c.screen === 'town' && !c.modal && !c.talk
  const calmMap = c.screen === 'map' && !c.modal
  if (!(calmTown || calmMap) || !revealed(REVEAL_OF[p])) return null
  return { kind: 'tap', at: `[data-coach="menu-${p}"]`, here: false }
}

/** Is `a` an upgrade on `b` (or `b` nothing)? A higher tier, or the same tier for a higher level. */
const better = (a: string, b: string | null): boolean => {
  if (!b) return true
  const x = ITEM_BY_ID[a]
  const y = ITEM_BY_ID[b]
  if (!x || !y) return false
  return x.tier > y.tier || (x.tier === y.tier && x.level > y.level)
}

/** The first piece in the bag that fills an empty slot or beats what is worn
 *  there (new finds first), and the socket it goes in. */
export const equipCandidate = (): { id: string; slot: EquipSlot } | null => {
  const inv = profile.inv
  const ids = [...inv.fresh, ...inv.items.filter(id => !inv.fresh.includes(id))]
  for (const id of ids) {
    const it = ITEM_BY_ID[id]
    if (!it || equippedIn(id) || !canEquip(id)) continue
    let slot: EquipSlot
    if (it.slot === 'trinket') {
      const free = !inv.equipped.trinket1 ? 'trinket1' : !inv.equipped.trinket2 ? 'trinket2' : null
      if (free) return { id, slot: free }
      // Both worn: the weaker one makes way.
      slot = better(inv.equipped.trinket1!, inv.equipped.trinket2) ? 'trinket2' : 'trinket1'
    } else slot = it.slot as EquipSlot
    if (EQUIP_SLOTS.includes(slot) && better(id, inv.equipped[slot])) return { id, slot }
  }
  return null
}

/** A learned skill that is in no slot (and could be), and the slot to put it in. */
export const slotCandidate = (): { id: string; kind: 'active' | 'passive'; slot: number } | null => {
  const h = profile.hero
  const attrs = totalAttrs()
  for (const id of h.learned) {
    const s = SKILL_BY_ID[id]
    if (!s || h.active.includes(id) || h.passive.includes(id) || !meetsSkill(s, profile.level, attrs)) continue
    const slots = s.kind === 'active' ? h.active : h.passive
    const free = slots.indexOf('')
    return { id, kind: s.kind, slot: free >= 0 ? free : slots.length - 1 }
  }
  return null
}

/** The next place on the map: a town not yet walked into, else the nearest
 *  open zone not yet cleared. */
export const nextPlace = (): NodeId | null => {
  const cleared = new Set(profile.world.cleared)
  const open = MAP.filter(n => n.kind !== 'arena' && !cleared.has(n.id) && isNodeOpen(n.id))
  return (open.find(n => n.kind === 'town') ?? open[0])?.id ?? null
}

/** The cheapest ware on the shelf the hero can buy and wear. */
const cheapestWare = (c: FeatureCtx): string | null => {
  let best: string | null = null
  let cost = Infinity
  for (const id of c.dom.all('.ware:not(.is-owned)[data-item]', 'data-item')) {
    const it = ITEM_BY_ID[id]
    const k = buyCost(id)
    if (!it || k > profile.gold || it.level > profile.level) continue
    if (k < cost) { cost = k; best = id }
  }
  return best
}

const townHasTrainer = (node: string): boolean => {
  const t = TOWNS[node as TownId]
  return !!t && t.npcs.some(n => n.role === 'trainer')
}

export const stepOf = (id: FeatureId, c: FeatureCtx): Step | null => {
  const touch = c.family === 'touch'
  switch (id) {
    case 'talk':
      return c.screen === 'town' && !c.modal && !c.talk && townHasTrainer(c.node) ? { kind: 'world', here: true } : null
    case 'teach':
      return c.talk === 'npc' && c.npcRole === 'trainer' && c.talkPhase === 'choices' && !c.modal && c.dom.has('[data-choice="train"]')
        ? { kind: 'tap', at: '[data-choice="train"]', here: true }
        : null
    case 'learn': {
      if (c.modal !== 'trainer' || !c.trainerCls) return null
      const s = skillsOf(c.trainerCls as ClassId).find(k => learnBlock(k.id) === '')
      if (!s) return null
      return c.dom.has(`.lesson.is-sel[data-skill="${s.id}"]`)
        ? { kind: 'tap', at: '.trainer__actions button', glow: '.trade__deal', here: true }
        : { kind: 'tap', at: `.lesson[data-skill="${s.id}"]`, here: true }
    }
    case 'slot': {
      const k = slotCandidate()
      if (!k) return null
      if (c.modal !== 'skills') return toPanel('skills', c)
      const node = `.node[data-skill="${k.id}"]`
      const sock = `[data-drop="${k.kind}:${k.slot}"]`
      if (!c.dom.has(node)) {
        const cls = SKILL_BY_ID[k.id]!.cls
        return { kind: 'tap', at: `[data-cls="${cls}"]`, here: true }
      }
      if (!touch) return { kind: 'drag', from: node, to: sock, ghost: { skill: k.id }, here: true }
      return c.dom.has(`.node.is-sel[data-skill="${k.id}"]`)
        ? { kind: 'tap', at: sock, here: true }
        : { kind: 'tap', at: node, here: true }
    }
    case 'equip': {
      const k = equipCandidate()
      if (!k) return null
      if (c.modal !== 'inventory') return toPanel('inventory', c)
      const cell = `.bag__grid [data-item="${k.id}"]`
      const sock = `.doll__socket[data-slot="${k.slot}"]`
      const held = c.dom.attr('.equip', 'data-sel') === k.id
      if (!touch) return { kind: 'drag', from: cell, to: sock, ghost: { item: k.id }, glow: held ? '[data-coach="equip-stats"]' : undefined, here: true }
      return held
        ? { kind: 'tap', at: sock, glow: '[data-coach="equip-stats"]', here: true }
        : { kind: 'tap', at: cell, here: true }
    }
    case 'attr':
      if (profile.hero.points <= 0) return null
      if (c.modal !== 'character') return toPanel('character', c)
      return { kind: 'tap', at: '.attr__plus', rings: '.attr__plus', here: true }
    case 'travel': {
      if (c.screen !== 'map' || c.modal) return null
      // After the first victory: the road has somewhere to go.
      if (!profile.world.cleared.some(n => NODE_BY_ID[n as NodeId]?.kind === 'zone')) return null
      const next = nextPlace()
      if (!next) return null
      const picked = c.dom.attr('.node.is-selected', 'data-node')
      if (picked === next && c.dom.has('.card__actions button')) return { kind: 'tap', at: '.card__actions button', last: true, here: true }
      return { kind: 'tap', at: `.node[data-node="${next}"]`, here: true }
    }
    case 'buy': {
      if (c.modal !== 'shop') return null
      const id = cheapestWare(c)
      if (!id) return null
      return c.dom.has(`.ware.is-sel[data-item="${id}"]`) || c.dom.has(`.ware[aria-pressed="true"][data-item="${id}"]`)
        ? { kind: 'tap', at: '.shop__actions .trade__act', glow: '.trade__deal', here: true }
        : { kind: 'tap', at: `.ware[data-item="${id}"]`, here: true }
    }
  }
}

/** The features that could be taught on this screen, in the order they go. */
export const wantedHere = (c: FeatureCtx, learned: (id: FeatureId) => boolean): FeatureId[] => {
  const out: Array<{ id: FeatureId; here: boolean; k: number }> = []
  FEATURE_ORDER.forEach((id, k) => {
    if (learned(id)) return
    const s = stepOf(id, c)
    if (s) out.push({ id, here: s.here, k })
  })
  out.sort((a, b) => Number(b.here) - Number(a.here) || a.k - b.k)
  return out.map(o => o.id)
}
