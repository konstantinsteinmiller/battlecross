import { AFTER_BOSS_DROPS, ITEM_BY_ID, infernalsOfZone, type ZoneId } from '../data/items'
import type { Mods } from '../data/mods'
import { BOSS_GLASS, DEMON_GLASS, DEMON_KINDS, ICHOR_FIRST, ICHOR_REPEAT, INFERNAL_SHARE, MYTHIC_KINDS, REPEAT_DROP } from '../data/relics'
import type { DamageType, Unit } from './types'
import type { Sim } from './world'

/**
 * ─── The afterplay's gear in a fight (docs/gdd-afterplay.md §2.4, phase 8) ───
 *
 *   affixes    an Infernal piece's demon affix: more damage to demons, mythic
 *              beasts and pylons, life from demons, less from fire, shadow and
 *              demons (`dealDamage` asks `relicOffence` / `relicDefence`);
 *   drops      an invaded visit's tables: the Infernal twins of the zone's
 *              uniques (a tenth of the pieces that drop), and its boss's pair;
 *   materials  a demon slain leaves Demonglass, a boss Mythic Ichor, both
 *              into the visit's pouch (`h.ores`, banked like ore).
 *
 * Rolls that are new here are hashed from the visit's seed and the unit, not
 * drawn from the fight's dice, so every fight plays as it did before.
 */

/** A number in [0, 1) fixed for this visit and this unit (and a salt). */
export const unitRoll = (sim: Sim, u: Unit, salt = 0): number => {
  let x = (sim.seed ^ Math.imul(u.id + 1, 0x9e3779b1) ^ Math.imul(salt + 7, 0x85ebca6b)) >>> 0
  x = Math.imul(x ^ (x >>> 16), 0x7feb352d) >>> 0
  x = Math.imul(x ^ (x >>> 15), 0x846ca68b) >>> 0
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

export const isDemon = (u: Unit): boolean => DEMON_KINDS.has(u.kind)
export const isMythicBeast = (u: Unit): boolean => MYTHIC_KINDS.has(u.kind)

/** The hero's affixes on a blow he deals: the factor on it. */
export const relicOffence = (m: Mods, tgt: Unit): number => {
  let k = 1
  if (isDemon(tgt)) k *= 1 + (m.demonBane ?? 0)
  if (isMythicBeast(tgt)) k *= 1 + (m.beastBane ?? 0)
  if (tgt.kind === 'demonPylon') k *= 1 + (m.pylonBreaker ?? 0)
  return k
}

/** The hero's affixes on a blow he takes: the factor on it. */
export const relicDefence = (m: Mods, src: Unit | null, type: DamageType): number => {
  let k = 1
  if (type === 'fire') k *= 1 - Math.min(0.8, m.fireWard ?? 0)
  if (type === 'shadow') k *= 1 - Math.min(0.8, m.shadowWard ?? 0)
  if (src && isDemon(src)) k *= 1 - Math.min(0.8, m.demonWard ?? 0)
  return k
}

/** Life the hero draws from a blow on a demon (a share of what it dealt). */
export const relicSteal = (m: Mods | undefined, tgt: Unit): number => (m && isDemon(tgt) ? m.demonLeech ?? 0 : 0)

/** An invaded visit's tables: its Infernal twins, and the finale's pieces. Called once it is populated. */
export const armRelicDrops = (sim: Sim): void => {
  const zone = sim.zone as ZoneId
  const infernal = infernalsOfZone(zone)
  const after = AFTER_BOSS_DROPS[zone]
  sim.dropTable.infernal = infernal
  sim.dropTable.after = after ? [...after] : []
  if (after) sim.dropTable.boss = [...after]
  else {
    // A Reborn finale: the twins of its campaign boss's pieces, or of any of the zone's.
    const boss = infernal.filter(id => ITEM_BY_ID[ITEM_BY_ID[id]!.infernal!]?.drop.src === 'boss')
    sim.dropTable.boss = boss.length ? boss : infernal
  }
}

/** Should the piece this kill drops be an Infernal twin (a tenth of them, §11)? */
export const dropsInfernal = (sim: Sim, u: Unit): boolean =>
  sim.invaded && !!sim.dropTable.infernal?.length && unitRoll(sim, u, 1) < INFERNAL_SHARE

const addPouch = (sim: Sim, id: string, n: number): void => {
  if (n > 0) sim.hero.ores[id] = (sim.hero.ores[id] ?? 0) + n
}

/** A demon slain in an invaded visit: its Demonglass (one, a second for the Glassfinder's luck). */
export const demonGlass = (sim: Sim, u: Unit): void => {
  if (!sim.invaded || !isDemon(u)) return
  const extra = unitRoll(sim, u, 2) < (sim.hero.unit.s.mods.glassFinder ?? 0) ? 1 : 0
  addPouch(sim, 'demonglass', DEMON_GLASS + extra)
}

/**
 * An afterplay boss falls: the first kill hands over both its pieces, its
 * Mythic Ichor and its Demonglass; a repeat kill one piece in five and an
 * Ichor. Returns the pieces dropped (the caller tells the loot).
 */
export const afterBossSpoils = (sim: Sim, u: Unit): string[] => {
  const all = sim.dropTable.after ?? []
  if (!sim.invaded || !all.length) return []
  const h = sim.hero
  const fresh = all.filter(id => !sim.owned.has(id) && !h.items.includes(id))
  let got: string[] = []
  if (fresh.length) {
    got = fresh
    addPouch(sim, 'ichor', ICHOR_FIRST)
    addPouch(sim, 'demonglass', BOSS_GLASS[u.kind] ?? 0)
  } else {
    if (unitRoll(sim, u, 3) < REPEAT_DROP) got = [all[Math.floor(unitRoll(sim, u, 4) * all.length)]!]
    addPouch(sim, 'ichor', ICHOR_REPEAT)
  }
  for (const id of got) h.items.push(id)
  return got
}
