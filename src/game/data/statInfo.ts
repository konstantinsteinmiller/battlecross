import { ATTRS, ATTR_EFFECTS, CAPS, type Attr } from './attributes'
import { HP_BASE, HP_PER_LEVEL, MANA_PER_LEVEL } from '../sim/stats'

/**
 * ─── What each stat is, for the info cards (the sheets' hover / tap cards and the wiki) ────────────────────────
 *
 * Every attribute (STR … CHA) and every derived stat of the character sheet has a card of four parts, in i18n as
 * `statinfo.<id>.{does,fights,synergy}` plus where it comes from (`SOURCES`, short tags: `statinfo.src.<tag>`). The
 * numbers in the text are never typed into it: they are the rules' own constants (`ATTR_EFFECTS`, `CAPS`,
 * `sim/stats.ts`), passed in as `{params}`, so a balance change shows on the card by itself.
 */

/** The derived stats (the same keys as `STATS` in `components/game/heroSheet.ts`; a test holds the two together). */
export const DERIVED_STATS = [
  'damage', 'health', 'mana', 'armor', 'resist', 'crit', 'critDamage', 'attackSpeed', 'moveSpeed', 'cdr', 'block', 'dodge', 'hpRegen'
] as const
export type DerivedStat = typeof DERIVED_STATS[number]
export type StatInfoId = Attr | DerivedStat
export const STAT_INFO_IDS: readonly StatInfoId[] = [...ATTRS, ...DERIVED_STATS]
export const isAttrId = (id: string): id is Attr => (ATTRS as readonly string[]).includes(id)

/** A rate in whole percent, trimmed (0.008 → "0.8"). */
const pc = (v: number): string => String(+(v * 100).toFixed(2))
const num = (v: number): string => String(+v.toFixed(2))

/** The rules' numbers a card's text may use. */
export const statInfoParams = (): Record<string, string> => {
  const E = ATTR_EFFECTS
  return {
    block: pc(E.str.blockPerPoint),
    plate: pc(E.str.plateArmorPerPoint),
    crit: pc(E.dex.critPerPoint),
    as: pc(E.dex.attackSpeedPerPoint),
    ms: pc(E.dex.moveSpeedPerPoint),
    dual: pc(E.dex.dualWieldPerPoint),
    mana: num(E.int.manaPerPoint),
    manaRegen: num(E.int.manaRegenPerPoint),
    res: pc(E.int.resistPerPoint),
    hp: num(E.end.hpPerPoint),
    hpRegen: num(E.end.hpRegenPerPoint),
    armor: num(E.end.armorPerPoint),
    stun: pc(E.end.stunResistPerPoint),
    cd: pc(E.skl.critDamagePerPoint),
    cdr: pc(E.skl.cdrPerPoint),
    minion: pc(E.cha.minionPerPoint),
    disc: pc(E.cha.discountPerPoint),
    reward: pc(E.cha.rewardPerPoint),
    hpBase: num(HP_BASE),
    hpLevel: num(HP_PER_LEVEL),
    manaLevel: num(MANA_PER_LEVEL),
    capCrit: pc(CAPS.crit),
    capCritDmg: pc(CAPS.critMult),
    capAs: pc(CAPS.attackSpeed),
    capMs: num(CAPS.moveSpeed),
    capCdr: pc(CAPS.cdr),
    capBlock: pc(CAPS.block),
    capDodge: pc(CAPS.dodge),
    capRes: pc(CAPS.resist),
    capDisc: pc(CAPS.discount),
    capStun: pc(CAPS.stunResist)
  }
}

/** Where a stat comes from: short tags (`statinfo.src.<tag>`); `points:<attr>` is the attribute points that raise it. */
export type SourceTag = 'points' | 'level' | 'gear' | 'passive' | 'forge' | 'blessing' | 'elixir' | 'weapon'
export const SOURCES: Record<StatInfoId, readonly string[]> = {
  str: ['points', 'gear', 'passive'],
  dex: ['points', 'gear', 'passive'],
  int: ['points', 'gear', 'passive'],
  end: ['points', 'gear', 'passive'],
  skl: ['points', 'gear', 'passive'],
  cha: ['points', 'gear', 'passive'],
  damage: ['weapon', 'points', 'level', 'gear', 'forge', 'passive'],
  health: ['points:end', 'level', 'gear', 'passive', 'blessing'],
  mana: ['points:int', 'level', 'gear', 'passive'],
  armor: ['gear', 'forge', 'points:end', 'points:str', 'passive', 'elixir'],
  resist: ['points:int'],
  crit: ['points:dex', 'gear', 'passive'],
  critDamage: ['points:skl', 'gear', 'passive'],
  attackSpeed: ['points:dex', 'gear', 'passive'],
  moveSpeed: ['points:dex', 'gear', 'passive'],
  cdr: ['points:skl', 'gear', 'passive'],
  block: ['points:str', 'gear', 'passive'],
  dodge: ['gear', 'passive'],
  hpRegen: ['points:end', 'gear', 'passive']
}
