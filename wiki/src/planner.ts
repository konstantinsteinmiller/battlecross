/**
 * The planner's engine: a build in, the game's own numbers out. Stats come
 * from `heroStats` (the function the fight uses), requirements from
 * `meetsSkill`, and the skill path from replaying the build's attribute plan
 * level by level.
 */
import { heroStats, sumBuild, type HeroBuild } from '@/game/sim/stats'
import { meetsSkill, SKILL_BY_ID, type SkillDef } from '@/game/data/skills'
import { ATTRS, ATTR_START, POINTS_PER_LEVEL, type Attr, type AttrBlock } from '@/game/data/attributes'
import { EQUIP_SLOTS, ITEM_BY_ID, noGear, type EquipSlot } from '@/game/data/items'
import { MAX_LEVEL } from '@/game/data/progression'
import { teachersOf, type Teacher } from './data'

export interface Plan {
  level: number
  attrs: AttrBlock
  actives: string[]
  passives: string[]
  gear: Partial<Record<EquipSlot, string>>
  upgrades?: Record<string, number>
  blessings?: ('order' | 'syndicate' | 'circle')[]
}

export const pointsAt = (level: number): number => ATTR_START * 6 + POINTS_PER_LEVEL * (level - 1)
export const spentOf = (a: AttrBlock): number => ATTRS.reduce((s, k) => s + a[k], 0)

const equippedOf = (p: Plan, level = p.level): Record<EquipSlot, string | null> => {
  const e = noGear()
  for (const s of EQUIP_SLOTS) {
    const id = p.gear[s]
    const it = id ? ITEM_BY_ID[id] : undefined
    e[s] = it && it.level <= level ? it.id : null
  }
  return e
}

export const toHeroBuild = (p: Plan): HeroBuild => ({
  level: p.level,
  attrs: p.attrs,
  equipped: equippedOf(p),
  passives: p.passives,
  blessings: p.blessings,
  upgrades: p.upgrades
})

export const statsOf = (p: Plan) => heroStats(toHeroBuild(p))
export const totalsOf = (p: Plan): AttrBlock => sumBuild(toHeroBuild(p)).attrs

export interface Problem { kind: 'points' | 'skill' | 'gear' | 'slots'; text: string; id?: string }

export const problemsOf = (p: Plan): Problem[] => {
  const out: Problem[] = []
  const budget = pointsAt(p.level)
  const spent = spentOf(p.attrs)
  if (spent > budget) out.push({ kind: 'points', text: `${spent - budget} attribute points over the level-${p.level} budget (${budget}).` })
  for (const a of ATTRS) if (p.attrs[a] < ATTR_START) out.push({ kind: 'points', text: `${a.toUpperCase()} cannot go below ${ATTR_START}.` })
  const totals = totalsOf(p)
  for (const id of [...p.actives, ...p.passives]) {
    const s = SKILL_BY_ID[id]
    if (s && !meetsSkill(s, p.level, totals)) out.push({ kind: 'skill', id, text: `Requirements not met: ${id}` })
  }
  for (const s of EQUIP_SLOTS) {
    const it = p.gear[s] ? ITEM_BY_ID[p.gear[s]!] : undefined
    if (it && it.level > p.level) out.push({ kind: 'gear', id: it.id, text: `Needs level ${it.level}: ${it.id}` })
  }
  return out
}

/** The attributes the hero has spent at `level`, if he spends toward the
 *  plan's final split evenly the whole way (largest remainder). */
export const attrsAtLevel = (final: AttrBlock, level: number, finalLevel: number): AttrBlock => {
  const extra = ATTRS.map(a => Math.max(0, final[a] - ATTR_START))
  const total = extra.reduce((s, v) => s + v, 0)
  const have = Math.min(total, POINTS_PER_LEVEL * (level - 1))
  if (total === 0) return { ...final }
  const want = extra.map(v => (v * have) / total)
  const got = want.map(Math.floor)
  let left = have - got.reduce((s, v) => s + v, 0)
  const order = want.map((v, i) => [v - Math.floor(v), i] as const).sort((x, y) => y[0] - x[0])
  for (const [, i] of order) { if (left <= 0) break; got[i]!++; left-- }
  void finalLevel
  return Object.fromEntries(ATTRS.map((a, i) => [a, ATTR_START + got[i]!])) as AttrBlock
}

export interface PathStep { skill: SkillDef; level: number; teacher: Teacher | null; attrsAt: AttrBlock }

/** The order the build's skills are learned in, and where. */
export const skillPath = (p: Plan): PathStep[] => {
  const steps: PathStep[] = []
  for (const id of [...p.actives, ...p.passives]) {
    const s = SKILL_BY_ID[id]
    if (!s) continue
    let found: PathStep | null = null
    for (let L = s.level; L <= MAX_LEVEL; L++) {
      const attrs = attrsAtLevel(p.attrs, L, p.level)
      const plan: Plan = { ...p, level: L, attrs, passives: p.passives.filter(x => x !== id) }
      const totals = totalsOf(plan)
      if (!meetsSkill(s, L, totals)) continue
      const teacher = teachersOf(s.cls).find(t => t.at <= L) ?? null
      if (!teacher) continue
      found = { skill: s, level: L, teacher, attrsAt: attrs }
      break
    }
    if (!found) {
      const teacher = teachersOf(s.cls)[0] ?? null
      found = { skill: s, level: Math.max(s.level, p.level), teacher, attrsAt: p.attrs }
    }
    steps.push(found)
  }
  return steps.sort((a, b) => a.level - b.level || a.skill.level - b.skill.level)
}

// ─── Share links ─────────────────────────────────────────────────────────────

export const encodePlan = (p: Plan): string => {
  const a = ATTRS.map(k => p.attrs[k]).join('.')
  const g = EQUIP_SLOTS.map(s => p.gear[s] ?? '').join('.')
  const u = Object.entries(p.upgrades ?? {}).filter(([, v]) => v > 0).map(([k, v]) => `${k}:${v}`).join('.')
  return [p.level, a, p.actives.join('.'), p.passives.join('.'), g, (p.blessings ?? []).join('.'), u].join('~')
}

export const decodePlan = (s: string): Plan | null => {
  try {
    const [lv, a, act, pas, g, bl, up] = s.split('~')
    const n = (a ?? '').split('.').map(Number)
    if (n.length !== 6 || n.some(x => !Number.isFinite(x))) return null
    const attrs = Object.fromEntries(ATTRS.map((k, i) => [k, n[i]!])) as Record<Attr, number>
    const gl = (g ?? '').split('.')
    const gear: Partial<Record<EquipSlot, string>> = {}
    EQUIP_SLOTS.forEach((sl, i) => { if (gl[i] && ITEM_BY_ID[gl[i]!]) gear[sl] = gl[i] })
    const upgrades: Record<string, number> = {}
    for (const kv of (up ?? '').split('.').filter(Boolean)) { const [k, v] = kv.split(':'); if (k) upgrades[k] = Number(v) || 0 }
    return {
      level: Math.max(1, Math.min(MAX_LEVEL, Number(lv) || 1)),
      attrs,
      actives: (act ?? '').split('.').filter(x => SKILL_BY_ID[x]?.kind === 'active').slice(0, 8),
      passives: (pas ?? '').split('.').filter(x => SKILL_BY_ID[x]?.kind === 'passive').slice(0, 4),
      gear,
      blessings: (bl ?? '').split('.').filter(x => x === 'order' || x === 'syndicate' || x === 'circle') as Plan['blessings'],
      upgrades
    }
  } catch { return null }
}

export const emptyPlan = (): Plan => ({
  level: 30,
  attrs: { str: 5, dex: 5, int: 5, end: 5, skl: 5, cha: 5 },
  actives: [],
  passives: [],
  gear: {}
})
