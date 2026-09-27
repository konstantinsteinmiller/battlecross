import type { GameIconName } from '@/components/icons/iconNames'

/**
 * ─── The three circuit boards ────────────────────────────────────────────────
 *
 * Every level grants one Skill Chip. Chips are socketed into nodes on three
 * boards — Buster (offense), Armor (defense), Core (utility & special weapons).
 * A node opens once its requirement node holds at least `reqRank` chips, so
 * each board reads as a circuit you power up from the input terminal outward.
 *
 * `pos` is the node's cell on the board's 3×3 layout (col, row), which the
 * Circuits screen uses to draw the traces.
 */

export type Board = 'buster' | 'armor' | 'core'

export interface SkillNode {
  id: string
  board: Board
  ranks: number
  req: { id: string; rank: number } | null
  icon: GameIconName
  pos: [number, number]
}

export const SKILLS: SkillNode[] = [
  // ── Buster ──
  { id: 'rapid', board: 'buster', ranks: 5, req: null, icon: 'rate', pos: [1, 0] },
  { id: 'quickCharge', board: 'buster', ranks: 3, req: { id: 'rapid', rank: 1 }, icon: 'bolt', pos: [0, 1] },
  { id: 'megaCharge', board: 'buster', ranks: 5, req: { id: 'rapid', rank: 1 }, icon: 'flare', pos: [2, 1] },
  { id: 'perfectTiming', board: 'buster', ranks: 3, req: { id: 'quickCharge', rank: 1 }, icon: 'star', pos: [0, 2] },
  { id: 'piercing', board: 'buster', ranks: 1, req: { id: 'megaCharge', rank: 2 }, icon: 'range', pos: [2, 2] },
  { id: 'giga', board: 'buster', ranks: 1, req: { id: 'megaCharge', rank: 3 }, icon: 'rocket', pos: [1, 2] },
  // ── Armor ──
  { id: 'frame', board: 'armor', ranks: 5, req: null, icon: 'heart', pos: [1, 0] },
  { id: 'barrier', board: 'armor', ranks: 3, req: { id: 'frame', rank: 1 }, icon: 'shield', pos: [0, 1] },
  { id: 'autoRepair', board: 'armor', ranks: 3, req: { id: 'frame', rank: 1 }, icon: 'plus', pos: [2, 1] },
  { id: 'parry', board: 'armor', ranks: 3, req: { id: 'barrier', rank: 1 }, icon: 'star', pos: [0, 2] },
  { id: 'spikes', board: 'armor', ranks: 3, req: { id: 'barrier', rank: 2 }, icon: 'bomb', pos: [1, 2] },
  { id: 'lastStand', board: 'armor', ranks: 1, req: { id: 'autoRepair', rank: 2 }, icon: 'skull', pos: [2, 2] },
  // ── Core ──
  { id: 'cells', board: 'core', ranks: 5, req: null, icon: 'bolt', pos: [1, 0] },
  { id: 'mastery', board: 'core', ranks: 5, req: { id: 'cells', rank: 1 }, icon: 'flame', pos: [0, 1] },
  { id: 'boosters', board: 'core', ranks: 3, req: { id: 'cells', rank: 1 }, icon: 'dodge', pos: [2, 1] },
  { id: 'efficient', board: 'core', ranks: 3, req: { id: 'mastery', rank: 1 }, icon: 'snowflake', pos: [0, 2] },
  { id: 'magnet', board: 'core', ranks: 3, req: { id: 'boosters', rank: 1 }, icon: 'coin', pos: [2, 2] },
  { id: 'tankCap', board: 'core', ranks: 2, req: { id: 'magnet', rank: 2 }, icon: 'flask', pos: [1, 2] }
]

export const SKILL_BY_ID: Record<string, SkillNode> = Object.fromEntries(SKILLS.map(s => [s.id, s]))

export const BOARDS: Board[] = ['buster', 'armor', 'core']

export const nodeUnlocked = (node: SkillNode, ranks: Record<string, number>): boolean =>
  !node.req || (ranks[node.req.id] ?? 0) >= node.req.rank

export const canRankUp = (node: SkillNode, ranks: Record<string, number>, chips: number): boolean =>
  chips > 0 && nodeUnlocked(node, ranks) && (ranks[node.id] ?? 0) < node.ranks

/** Respec price in bolts: grows with how many chips are socketed. */
export const respecCost = (ranks: Record<string, number>): number => {
  const n = Object.values(ranks).reduce((a, b) => a + b, 0)
  return n === 0 ? 0 : 60 + n * 25
}
