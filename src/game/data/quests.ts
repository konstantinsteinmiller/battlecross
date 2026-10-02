import type { AttrBlock } from './attributes'
import type { NodeId } from './zones'

/**
 * ─── Consequential quests (GDD §3.2) ─────────────────────────────────────────
 *
 * Six major quests. Each is decided ONCE, at the end of its zone, and the
 * decision is permanent: it writes world-state flags and faction reputation
 * that change who trades and teaches where, what a town looks like, who
 * ambushes the hero on the road, and how the story ends.
 *
 * The text lives in i18n: `quest.<id>.title`, `.intro`, `.ask`, and per choice
 * `quest.<id>.<choice>.label` / `.result`.
 */

export type FactionId = 'order' | 'syndicate' | 'circle'
export const FACTIONS: readonly FactionId[] = ['order', 'syndicate', 'circle']

export const FACTION_COLOR: Record<FactionId, string> = {
  order: '#ffd84a',
  syndicate: '#9c7bff',
  circle: '#5fd8ff'
}

/** Reputation runs −5..5. */
export const REP_MIN = -5
export const REP_MAX = 5
/** At or above: that faction's trainers charge less. At or below the negative:
 *  its people hunt the hero on the roads. */
export const REP_FRIEND = 2
export const REP_HOSTILE = -2
export const FRIEND_DISCOUNT = 0.2

/** Who ambushes the hero when a faction turns hostile. */
export const AMBUSH_KIND: Record<FactionId, string | null> = {
  order: 'orderGuard',
  syndicate: 'syndicateBlade',
  circle: 'cultist'
}

export interface ChoiceDef {
  id: string
  /** What the hero must be for the option to be offered at all. */
  needs?: {
    attrs?: Partial<AttrBlock>
    flags?: string[]
    rep?: Partial<Record<FactionId, number>>
    level?: number
  }
  flags: string[]
  rep?: Partial<Record<FactionId, number>>
  gold?: number
  /** A specific item handed over. */
  item?: string
  /** The speaker's mood for the portrait. */
  tone: 'noble' | 'ruthless' | 'cunning'
}

export interface QuestDef {
  id: string
  /** The zone whose finale brings the decision. */
  node: NodeId
  /** Who speaks in the decision dialogue (a rig look). */
  speaker: string
  choices: ChoiceDef[]
}

export const QUESTS: readonly QuestDef[] = [
  {
    id: 'goblinKing', node: 'hollows', speaker: 'goblinKing',
    choices: [
      { id: 'slay', flags: ['goblinSlain', 'arenaOpen'], rep: { order: 1 }, gold: 120, tone: 'noble' },
      // A silver tongue turns a warlord into a trading partner.
      { id: 'pact', needs: { attrs: { cha: 8 } }, flags: ['goblinPact', 'arenaOpen'], rep: { syndicate: 1 }, tone: 'cunning' },
      { id: 'ransom', flags: ['goblinRansom', 'arenaOpen'], rep: { syndicate: 1, order: -1 }, gold: 420, tone: 'ruthless' }
    ]
  },
  {
    // GDD §3.2: The Siege of Oakhaven.
    id: 'siege', node: 'outskirts', speaker: 'warlord',
    choices: [
      // Defend: a prosperous trade hub; the Ashen Syndicate turns hostile everywhere.
      { id: 'defend', flags: ['oakhavenSaved'], rep: { order: 2, syndicate: -3 }, gold: 300, tone: 'noble' },
      // Betray: a ruin with a black market and the Blood Alchemist; no armourers.
      { id: 'betray', flags: ['oakhavenFallen'], rep: { syndicate: 3, order: -3 }, gold: 900, tone: 'ruthless' }
    ]
  },
  {
    id: 'core', node: 'mines', speaker: 'dwarf',
    choices: [
      { id: 'destroy', flags: ['coreOrder'], rep: { order: 2 }, gold: 400, tone: 'noble' },
      { id: 'study', needs: { attrs: { int: 18 } }, flags: ['coreCircle'], rep: { circle: 2 }, tone: 'cunning' },
      { id: 'sell', needs: { rep: { syndicate: 1 } }, flags: ['coreSold'], rep: { syndicate: 1, order: -1, circle: -1 }, gold: 2600, tone: 'ruthless' }
    ]
  },
  {
    id: 'oracle', node: 'temple', speaker: 'oracle',
    choices: [
      { id: 'free', flags: ['oracleFreed'], rep: { circle: 2 }, tone: 'noble' },
      { id: 'slay', flags: ['oracleSlain'], rep: { order: 1, circle: -2 }, item: 'timekeepersHourglass', gold: 800, tone: 'ruthless' }
    ]
  },
  {
    id: 'dragon', node: 'peak', speaker: 'dragon',
    choices: [
      { id: 'slay', flags: ['dragonSlain'], rep: { order: 1 }, gold: 1500, tone: 'noble' },
      // The dragon fights at the hero's side in the Dread Fortress.
      { id: 'pact', needs: { attrs: { cha: 25 } }, flags: ['dragonPact'], rep: { order: -2, circle: 1 }, tone: 'cunning' }
    ]
  },
  {
    id: 'throne', node: 'fortress', speaker: 'archDemon',
    choices: [
      { id: 'order', needs: { rep: { order: 2 } }, flags: ['throneDone', 'endOrder'], rep: { order: 2 }, tone: 'noble' },
      { id: 'syndicate', needs: { rep: { syndicate: 2 } }, flags: ['throneDone', 'endSyndicate'], rep: { syndicate: 2 }, tone: 'ruthless' },
      { id: 'circle', needs: { rep: { circle: 2 } }, flags: ['throneDone', 'endCircle'], rep: { circle: 2 }, tone: 'cunning' },
      { id: 'shatter', flags: ['throneDone', 'endFree'], tone: 'noble' },
      { id: 'claim', needs: { level: 28 }, flags: ['throneDone', 'endUnbound'], rep: { order: -2, syndicate: -2, circle: -2 }, tone: 'ruthless' }
    ]
  }
]

export const QUEST_BY_ID: Readonly<Record<string, QuestDef>> = Object.fromEntries(QUESTS.map(q => [q.id, q]))
export const questOfNode = (node: string): QuestDef | undefined => QUESTS.find(q => q.node === node)

export interface QuestHero {
  level: number
  attrs: AttrBlock
  flags: ReadonlySet<string>
  rep: Record<FactionId, number>
}

/** May this hero pick that option? */
export const choiceOpen = (c: ChoiceDef, h: QuestHero): boolean => {
  const n = c.needs
  if (!n) return true
  if (n.level && h.level < n.level) return false
  if (n.attrs) for (const k in n.attrs) if (h.attrs[k as keyof AttrBlock] < (n.attrs[k as keyof AttrBlock] ?? 0)) return false
  if (n.flags && !n.flags.every(f => h.flags.has(f))) return false
  if (n.rep) for (const k in n.rep) if (h.rep[k as FactionId] < (n.rep[k as FactionId] ?? 0)) return false
  return true
}

/** The ending the save has reached, or '' before the throne is decided. */
export const endingOf = (flags: ReadonlySet<string>): '' | 'order' | 'syndicate' | 'circle' | 'free' | 'unbound' => {
  if (flags.has('endOrder')) return 'order'
  if (flags.has('endSyndicate')) return 'syndicate'
  if (flags.has('endCircle')) return 'circle'
  if (flags.has('endFree')) return 'free'
  if (flags.has('endUnbound')) return 'unbound'
  return ''
}

/** Epilogue lines the ending screen adds for what the hero did on the way
 *  (i18n: `ending.note.<flag>`), in story order. */
export const EPILOGUE_FLAGS: readonly string[] = [
  'goblinPact', 'goblinSlain', 'goblinRansom', 'oakhavenSaved', 'oakhavenFallen', 'coreOrder', 'coreCircle', 'coreSold',
  'oracleFreed', 'oracleSlain', 'dragonPact', 'dragonSlain'
]
