/**
 * The combination lab: every skill gets tags read off its own numbers (what
 * it does: summons, freezes, burns, crits...) and its passive modifiers (what
 * it feeds). Two skills synergise when one FEEDS what the other DOES, or when
 * one sets up the condition the other pays off (a freeze before a shatter,
 * a mark before a burst). Scored over all pairs of the 192 skills.
 */
import { SKILLS, skillName, type SkillDef } from './data'

export type Tag =
  | 'summon' | 'stun' | 'freeze' | 'slow' | 'knock' | 'confuse' | 'fear' | 'charm' | 'taunt'
  | 'burn' | 'fire' | 'chill' | 'aoe' | 'burst' | 'dot' | 'heal' | 'shield' | 'lifesteal'
  | 'vuln' | 'weaken' | 'mobility' | 'buff' | 'crit' | 'cdr' | 'mana' | 'heat' | 'hpcost' | 'boss' | 'tank' | 'song' | 'chi'

export const TAG_LABEL: Record<Tag, string> = {
  summon: 'Summon', stun: 'Stun', freeze: 'Freeze', slow: 'Slow', knock: 'Knockdown', confuse: 'Confuse', fear: 'Fear', charm: 'Charm',
  taunt: 'Taunt', burn: 'Burn', fire: 'Fire', chill: 'Chill', aoe: 'Area', burst: 'Burst', dot: 'Damage over time', heal: 'Healing',
  shield: 'Shield', lifesteal: 'Life steal', vuln: 'Vulnerability', weaken: 'Weaken', mobility: 'Mobility', buff: 'Buff', crit: 'Critical',
  cdr: 'Cooldowns', mana: 'Mana economy', heat: 'Heat', hpcost: 'Blood price', boss: 'Boss killer', tank: 'Toughness', song: 'Song', chi: 'Chi'
}

export const TAG_COLOR: Record<Tag, string> = {
  summon: '#7fe07a', stun: '#ffd84a', freeze: '#a8e4ff', slow: '#7fb8ff', knock: '#c79a5a', confuse: '#d88aff', fear: '#9c7bff', charm: '#ff8ad8',
  taunt: '#ffb04a', burn: '#ff7a3a', fire: '#ff5a2a', chill: '#bfe8ff', aoe: '#ffc46a', burst: '#ff4a6a', dot: '#b8e04a', heal: '#6bffb0',
  shield: '#8ad8ff', lifesteal: '#ff4a6a', vuln: '#ff9a7a', weaken: '#b0a0ff', mobility: '#c4f05a', buff: '#ffe08a', crit: '#ff6b5a',
  cdr: '#5fd8ff', mana: '#50aaff', heat: '#ff8a4a', hpcost: '#d02040', boss: '#ffd84a', tank: '#c9d2e3', song: '#ff8ad8', chi: '#5fd08a'
}

/** What a skill DOES (its effect tags). */
const doesOf = (s: SkillDef): Set<Tag> => {
  const p = s.p
  const o = new Set<Tag>()
  const id = s.id
  if (s.kind === 'active') {
    if ('max' in p || 'archers' in p || 'wolves' in p || ('hp' in p && id === 'summonChampion') || id === 'homunculus' || id === 'deployTurret' ||
      'life' in p || id === 'galeSpirits' || id === 'callHawk' || id === 'processionOfSouls') o.add('summon')
    if ('stun' in p) o.add('stun')
    if ('freeze' in p || id === 'temporalStasis' || id === 'petrify' || id === 'timeStop') o.add('freeze')
    if ('slow' in p) o.add('slow')
    if ('down' in p || 'air' in p || 'airborne' in p || 'push' in p || 'up' in p || id === 'shieldShove') o.add('knock')
    if ('confuse' in p) o.add('confuse')
    if ('fear' in p) o.add('fear')
    if ('charm' in p || id === 'charmingSerenade' || id === 'lullaby') o.add('charm')
    if (id === 'tauntingCry' || id === 'retribution' || id === 'holyChains') o.add('taunt')
    if ('burn' in p || s.fire) o.add('burn')
    if (s.fire) o.add('fire')
    if (s.cls === 'frostwarden' || id === 'frostLance' || id === 'thunderSnow' || id === 'frostfireComet') o.add('chill')
    if ((s.radius ?? 0) >= 2.5 || 'radius' in p || 'cone' in p || 'stars' in p || 'jumps' in p || 'bounces' in p || 'width' in p) o.add('aoe')
    if ((p.dmg ?? 0) >= 300 || (p.dmg ?? 0) >= 200 && s.cd <= 14) o.add('burst')
    if ('poison' in p || 'burnDur' in p || ('dur' in p && 'dmg' in p && s.target === 'ground')) o.add('dot')
    if ('heal' in p || 'regen' in p || id === 'mendingLight' || id === 'hymnOfMending') o.add('heal')
    if ('shield' in p || id === 'essenceWard' || id === 'holyBastion' || id === 'chronoRewind') o.add('shield')
    if ('steal' in p) o.add('lifesteal')
    if ('vuln' in p || 'shred' in p || id === 'shadowMark') o.add('vuln')
    if ('weak' in p || 'weaken' in p) o.add('weaken')
    if (['shadowstep', 'rocketJump', 'zephyrDash', 'updraftLeap', 'flyingKick', 'grapplingHook', 'avalancheLeap', 'phoenixFlight', 'glacialCharge', 'smokeBomb'].includes(id) || 'move' in p) o.add('mobility')
    if ('def' in p || 'atk' in p || 'speed' in p || 'buff' in p || 'rage' in p || id === 'mutagenicRage' || id === 'exoSuit' || id === 'tigerStance' || id === 'craneStance') o.add('buff')
    if ('heat' in p || s.cls === 'aether') o.add('heat')
    if (s.hpCost) o.add('hpcost')
    if (s.cls === 'bard' && 'dur' in p && 'radius' in p) o.add('song')
    if ('chi' in p || 'per' in p && s.cls === 'ironmonk') o.add('chi')
    if (s.target === 'enemy' && (p.dmg ?? 0) >= 140) o.add('burst')
  }
  return o
}

/** What a skill FEEDS (passive modifiers and payoff conditions). */
const feedsOf = (s: SkillDef): Set<Tag> => {
  const m = s.mods ?? {}
  const p = s.p
  const o = new Set<Tag>()
  const has = (k: string): boolean => k in m
  if (has('minionDamage') || has('minionHp') || has('minionAttackSpeed') || has('tribute') || has('loyalty') || has('packDamage') || has('soulRise')) o.add('summon')
  if (has('igniteBonus') || has('pyromaniac') || has('wildfire') || has('cauterize')) o.add('burn')
  if (has('pyromaniac')) o.add('fire')
  if (has('chillDamage') || has('chillOnHit') || has('freezeOnHit')) o.add('chill')
  if (has('critChance') || has('critDamage') || has('spellCrit') || has('critCooldown') || has('overheatCrit')) o.add('crit')
  if (has('cdr') || has('entropy') || has('critCooldown')) o.add('cdr')
  if (has('manaDiscount') || has('bloodToMana') || has('maxMana')) o.add('mana')
  if (has('heatDissipation') || has('heatBuildCut') || has('overheatCrit') || has('heatArmor')) o.add('heat')
  if (has('lifeDrainPct') || has('bleedHeal') || has('lowHealthDamage') || has('maxHpPct') || has('hpRegen')) o.add('hpcost')
  if (has('bossDamage')) o.add('boss')
  if (has('backstab')) o.add('vuln')
  if (has('reactionDamage')) { o.add('burn'); o.add('chill') }
  if (has('songLength')) o.add('song')
  if (has('chiOnHit')) o.add('chi')
  if (has('healPower')) o.add('heal')
  if (has('armorPct') || has('physReduction') || has('damageReduction') || has('block') || has('fortitude') || has('lastStand') || has('dodge') || has('timeDistort')) o.add('tank')
  if (has('crumble')) o.add('knock')
  if (has('stunDurationCut') || has('knockbackImmune')) o.add('tank')
  // Actives that pay off a condition the other skill sets.
  if (s.kind === 'active') {
    if ('frozen' in p || 'chilled' in p) o.add('chill')
    if ('pct' in p && s.fire) o.add('burn') // Fan the Flames / Combustion detonate burns
    if (s.id === 'commandFocus' || s.id === 'alphaHowl' || s.id === 'packBond' || s.id === 'royalRally' || s.id === 'bannerOfVictory' || s.id === 'processionOfSouls' || s.id === 'balladOfValor') o.add('summon')
    if (s.id === 'crescendo' || s.id === 'grandFinale') o.add('song')
    if (s.id === 'hundredFists' || s.id === 'risingDragon' || s.id === 'mountainPalm' || s.id === 'whirlwindKick') o.add('chi')
    if ('cdr' in p) o.add('cdr')
    if (s.id === 'releaseSouls') o.add('summon')
  }
  return o
}

export interface SkillTags { does: Set<Tag>; feeds: Set<Tag> }
export const TAGS: Record<string, SkillTags> = Object.fromEntries(SKILLS.map(s => [s.id, { does: doesOf(s), feeds: feedsOf(s) }]))
export const tagsOf = (s: SkillDef): Tag[] => [...new Set([...TAGS[s.id]!.does, ...TAGS[s.id]!.feeds])]

/** Set-up → payoff: one skill makes the condition another profits from. */
const SETUP: Partial<Record<Tag, Tag[]>> = {
  freeze: ['burst', 'chill'], stun: ['burst', 'vuln'], slow: ['aoe', 'dot'], knock: ['aoe', 'burst'], taunt: ['aoe', 'tank'],
  vuln: ['burst', 'summon'], weaken: ['tank'], fear: ['summon'], charm: ['aoe'], confuse: ['aoe'], chill: ['burst']
}

export interface Pair { a: SkillDef; b: SkillDef; score: number; why: string[] }

/** Why two skills work together, and how much. */
export const pairScore = (a: SkillDef, b: SkillDef): Pair => {
  const A = TAGS[a.id]!, B = TAGS[b.id]!
  const why: string[] = []
  let score = 0
  const na = skillName(a), nb = skillName(b)
  for (const t of A.feeds) if (B.does.has(t)) { score += 3; why.push(`${na} empowers ${TAG_LABEL[t].toLowerCase()} — ${nb} delivers it`) }
  for (const t of B.feeds) if (A.does.has(t)) { score += 3; why.push(`${nb} empowers ${TAG_LABEL[t].toLowerCase()} — ${na} delivers it`) }
  for (const [s, pays] of Object.entries(SETUP) as [Tag, Tag[]][]) {
    if (A.does.has(s) && pays.some(p => B.does.has(p) || B.feeds.has(p))) { score += 1.5; why.push(`${na}'s ${TAG_LABEL[s].toLowerCase()} sets up ${nb}`) }
    if (B.does.has(s) && pays.some(p => A.does.has(p) || A.feeds.has(p))) { score += 1.5; why.push(`${nb}'s ${TAG_LABEL[s].toLowerCase()} sets up ${na}`) }
  }
  if (a.cls !== b.cls) score += 0.25 // the lab rewards a cross-class find a little
  return { a, b, score, why }
}

/** The best partners of one skill, over every other skill in the game. */
export const partnersOf = (s: SkillDef, n = 12): Pair[] =>
  SKILLS.filter(o => o.id !== s.id).map(o => pairScore(s, o)).filter(p => p.score >= 3).sort((x, y) => y.score - x.score).slice(0, n)

/** Every scored pair across all 192 skills (computed once, ~18k pairs). */
let allPairs: Pair[] | null = null
export const ALL_PAIRS = (): Pair[] => {
  if (allPairs) return allPairs
  const out: Pair[] = []
  for (let i = 0; i < SKILLS.length; i++) for (let j = i + 1; j < SKILLS.length; j++) {
    const p = pairScore(SKILLS[i]!, SKILLS[j]!)
    if (p.score >= 4.5) out.push(p)
  }
  // At most three pairs per skill, so one strong enabler does not fill the list.
  const used: Record<string, number> = {}
  allPairs = out.sort((x, y) => y.score - x.score).filter(p => {
    if ((used[p.a.id] ?? 0) >= 3 || (used[p.b.id] ?? 0) >= 3) return false
    used[p.a.id] = (used[p.a.id] ?? 0) + 1
    used[p.b.id] = (used[p.b.id] ?? 0) + 1
    return true
  })
  return allPairs
}

/** How well a whole bar hangs together (0..100). */
export const barSynergy = (ids: string[]): { score: number; top: Pair[] } => {
  const sk = ids.map(i => SKILLS.find(s => s.id === i)!).filter(Boolean)
  const pairs: Pair[] = []
  for (let i = 0; i < sk.length; i++) for (let j = i + 1; j < sk.length; j++) pairs.push(pairScore(sk[i]!, sk[j]!))
  const total = pairs.reduce((a, p) => a + Math.min(p.score, 9), 0)
  const score = Math.max(0, Math.min(100, Math.round((total / Math.max(1, sk.length * 3.2)) * 20)))
  return { score, top: pairs.filter(p => p.score >= 3).sort((x, y) => y.score - x.score).slice(0, 6) }
}
