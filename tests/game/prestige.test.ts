// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import {
  ALL_CLASS_IDS, CLASSES, CLASS_IDS, PRESTIGE_IDS, PRESTIGE_SKILLS, SKILLS, SKILL_BY_ID, capstoneOf, isPrestige, skillsOf
} from '@/game/data/skills'
import {
  ARM_STREAK, DRAGON_DEATHLESS, HEX_FORGED, LEVIATHAN_SLAIN, RING_PERFECT, WANDERER_FLAG, knowsParents, prestigeDerived,
  trialFlag, trialPassed, trialsPassed, visitTrialFlags
} from '@/game/data/prestige'
import { DEMONHUNTER_KEY } from '@/game/data/siege'
import { ARM_STREAK_FLAG, RING_PERFECT_FLAG } from '@/game/state/fair'
import { TOWNS } from '@/game/data/zones'
import { conversationOf } from '@/game/data/dialogs'
import { INVASION } from '@/game/data/invasion'
import { HERO_SKILLS } from '@/game/sim/heroSkills'
import { botThink, referenceBuild, setupRun } from '@/game/sim/bot'
import { stepSim } from '@/game/sim/step'
import { kill, reviveHero } from '@/game/sim/combat'
import { hasGlyph } from '@/components/art/glyphs'
import en from '@/i18n/locales/en'
import type { ZoneId } from '@/game/data/items'
import type { ClassId } from '@/game/data/skills'

/**
 * Afterplay phase 10 (docs/gdd-afterplay.md §10): the four prestige classes —
 * their kits, the trials that open them (read off what the save already
 * holds), the Mysterious Wanderer who teaches them, the save, and the
 * reference player clearing the last bosses with each.
 */

describe('the prestige classes (data)', () => {
  it('four hybrids of two of the sixteen, three skills each (two actives, a passive), no capstone; twenty in all', () => {
    expect(PRESTIGE_IDS).toEqual(['demonhunter', 'dragoon', 'hexsmith', 'tidecaller'])
    expect(ALL_CLASS_IDS).toHaveLength(20)
    expect(CLASSES.demonhunter.parents).toEqual(['shadow', 'lightbringer'])
    expect(CLASSES.dragoon.parents).toEqual(['windrunner', 'aegis'])
    expect(CLASSES.hexsmith.parents).toEqual(['aether', 'blood'])
    expect(CLASSES.tidecaller.parents).toEqual(['frostwarden', 'elementalist'])
    for (const c of PRESTIGE_IDS) {
      expect(isPrestige(c)).toBe(true)
      const kit = skillsOf(c)
      expect(kit.map(s => s.kind).sort(), c).toEqual(['active', 'active', 'passive'])
      expect(capstoneOf(c)).toBeUndefined()
      for (const p of CLASSES[c].parents!) expect(CLASS_IDS).toContain(p)
      for (const s of kit) {
        expect(SKILL_BY_ID[s.id]).toBe(s)
        expect(SKILLS.includes(s)).toBe(false)
        // The afterplay's: hero levels 40–43, not cut by the skill level scale.
        expect(s.level).toBeGreaterThanOrEqual(40)
        expect(s.level).toBeLessThanOrEqual(43)
        expect(s.color).toBe(CLASSES[c].color)
        if (s.kind === 'active') expect(HERO_SKILLS[s.id], s.id).toBeTypeOf('function')
        else expect(Object.keys(s.mods ?? {}).length, s.id).toBeGreaterThan(0)
        // An icon of its own name (a parent's drawing, in the class colour).
        expect(hasGlyph(`skill.${s.id}`), s.id).toBe(true)
        // Every number the tooltip prints is one the skill has.
        const desc = (en.skill as Record<string, { desc: string }>)[s.id]!.desc
        for (const m of desc.matchAll(/\{(\w+)\}/g)) expect(s.p[m[1]!], `${s.id} {${m[1]}}`).toBeDefined()
      }
    }
    expect(PRESTIGE_SKILLS).toHaveLength(12)
    for (const c of CLASS_IDS) expect(capstoneOf(c)?.cls).toBe(c)
  })

  it('the trial flags are the ones the siege and the fair games set', () => {
    expect(RING_PERFECT).toBe(RING_PERFECT_FLAG)
    expect(ARM_STREAK).toBe(ARM_STREAK_FLAG)
  })

  it('each trial reads its own deeds, and a passed trial brings the Wanderer', () => {
    const w = (flags: string[], forged = 0) => ({ flags: new Set(flags), forged })
    expect(trialsPassed(w([]))).toEqual([])
    expect(prestigeDerived(w([]))).toEqual([])
    expect(trialPassed('demonhunter', w([DEMONHUNTER_KEY]))).toBe(true)
    expect(trialPassed('dragoon', w([DRAGON_DEATHLESS]))).toBe(true)
    expect(trialPassed('dragoon', w(['brk10']))).toBe(false)
    // The Hexsmith: both halves.
    expect(trialPassed('hexsmith', w([ARM_STREAK], HEX_FORGED - 1))).toBe(false)
    expect(trialPassed('hexsmith', w([], HEX_FORGED))).toBe(false)
    expect(trialPassed('hexsmith', w([ARM_STREAK], HEX_FORGED))).toBe(true)
    // The Tidecaller: the Leviathan (its own flag, or B8 for a save from before) and a perfect round.
    expect(trialPassed('tidecaller', w([RING_PERFECT]))).toBe(false)
    expect(trialPassed('tidecaller', w([LEVIATHAN_SLAIN]))).toBe(false)
    expect(trialPassed('tidecaller', w([LEVIATHAN_SLAIN, RING_PERFECT]))).toBe(true)
    expect(trialPassed('tidecaller', w(['brk8', RING_PERFECT]))).toBe(true)
    expect(prestigeDerived(w([DEMONHUNTER_KEY]))).toEqual([WANDERER_FLAG, trialFlag('demonhunter')])
  })

  it('a won visit: the Leviathan slain, the Elder Dragon slain only without a fall', () => {
    expect(visitTrialFlags(true, { leviathan: 1 }, 2)).toEqual([LEVIATHAN_SLAIN])
    expect(visitTrialFlags(true, { elderDragon: 1 }, 0)).toEqual([DRAGON_DEATHLESS])
    expect(visitTrialFlags(true, { elderDragon: 1 }, 1)).toEqual([])
    expect(visitTrialFlags(false, { elderDragon: 1, leviathan: 1 }, 0)).toEqual([])
  })

  it('Second wind counts a fall', () => {
    const { sim } = setupRun({ zone: 'plains', level: 5, cls: 'aegis', seed: 3 })
    const u = sim.hero.unit
    kill(sim, u, null)
    sim.ended = 'defeat'
    expect(reviveHero(sim)).toBe(true)
    expect(sim.hero.falls).toBe(1)
  })

  it('knowing a skill of each parent', () => {
    const known = new Set(['shadowstep'])
    expect(knowsParents('demonhunter', id => known.has(id))).toBe(false)
    known.add('sunbolt')
    expect(knowsParents('demonhunter', id => known.has(id))).toBe(true)
  })

  it('the Mysterious Wanderer stands in the fort once a trial is passed, teaches the four, and has his say', () => {
    const n = TOWNS.bastion.npcs.find(x => x.id === 'mysteriousWanderer')!
    expect(n.role).toBe('trainer')
    expect(n.needs).toEqual([WANDERER_FLAG])
    expect(n.classes).toEqual(PRESTIGE_IDS)
    const conv = conversationOf('mysteriousWanderer')!
    expect(JSON.stringify(conv.nodes)).toContain('dlg.mysteriousWanderer.trial.')
    // How the rift was left moves him.
    expect(conv.greet.map(g => g.id)).toEqual(expect.arrayContaining(['sealed', 'ajar']))
  })

  it('the reference build of a prestige class plays its three over its parents\' kits', () => {
    for (const c of PRESTIGE_IDS) {
      const { build, skills } = referenceBuild({ cls: c, level: 50, geared: true })
      const own = skillsOf(c)
      for (const s of own.filter(k => k.kind === 'active')) expect(skills, c).toContain(s.id)
      expect(build.passives, c).toContain(own.find(k => k.kind === 'passive')!.id)
      const parents = CLASSES[c].parents!
      expect(skills.some(id => parents.includes(SKILL_BY_ID[id]!.cls as never)), c).toBe(true)
    }
  })
})

describe('through the profile and the save', () => {
  type P = typeof import('@/game/state/profile')
  let p: P
  const STATE_KEY = 'bcross_state'

  beforeEach(() => { drainAndResetModules() })
  afterEach(() => { drainPersist() })

  const boot = async (blob?: Record<string, unknown>): Promise<void> => {
    if (blob) localStorage.setItem(STATE_KEY, JSON.stringify(blob))
    await holdGameState()
    p = await import('@/game/state/profile')
    p.initProfile()
  }

  /** A save from before phase 10: the siege's trial key won (phase 6), Shadowblade and Lightbringer known. */
  const OLD = {
    bc_version: 3,
    bc_level: 50,
    bc_gold: 200000,
    bc_hero: { xp: 0, attrs: { str: 60, dex: 60, int: 60, end: 60, skl: 60, cha: 60 }, points: 0, learned: ['shadowstep'], active: ['shadowstep'], passive: ['', '', '', ''], ranks: {} },
    bc_inventory: { items: [], equipped: {} },
    bc_world: { cleared: ['plains'], flags: ['brk1', 'brk2', DEMONHUNTER_KEY], at: 'bastion', afterplay: true }
  }

  it('an old save that already won the trial has the Demonhunter at once; the bars are the trial and the parents', async () => {
    await boot(OLD)
    expect(p.flagSet().has(WANDERER_FLAG)).toBe(true)
    expect(p.flagSet().has(trialFlag('demonhunter'))).toBe(true)
    expect(p.flagSet().has(trialFlag('dragoon'))).toBe(false)
    // Lightbringer not yet known: the parents bar.
    expect(p.learnBlock('huntersMark')).toBe('parents')
    // A trial not passed.
    expect(p.learnBlock('skyfallLeap')).toBe('trial')
    p.profile.hero.learned.push('sunbolt')
    expect(p.learnBlock('huntersMark')).toBe('')
    expect(p.learnSkill('huntersMark')).toBe(true)
    expect(p.knows('huntersMark')).toBe(true)
  })

  it('the trials\' flags and a prestige skill learned keep through a save round trip', async () => {
    await boot({ ...OLD, bc_world: { ...OLD.bc_world, flags: ['brk1', 'brk2'] } })
    expect(p.flagSet().has(WANDERER_FLAG)).toBe(false)
    p.profile.world.flags.push(DRAGON_DEATHLESS, LEVIATHAN_SLAIN, RING_PERFECT)
    p.profile.hero.learned.push('galeArrow', 'shieldSlam')
    expect(p.learnSkill('skyfallLeap')).toBe(true)
    p.saveProfile()
    p.loadProfile()
    expect(p.knows('skyfallLeap')).toBe(true)
    expect(p.profile.hero.active).toContain('skyfallLeap')
    const f = p.flagSet()
    expect(f.has(trialFlag('dragoon'))).toBe(true)
    expect(f.has(trialFlag('tidecaller'))).toBe(true)
    expect(f.has(trialFlag('hexsmith'))).toBe(false)
    // Derived, never stored.
    expect(p.profile.world.flags).not.toContain(WANDERER_FLAG)
  })

  it('the Hexsmith opens with the fifth Infernal forging once the Arm-Wrestle streak is won', async () => {
    await boot({ ...OLD, bc_world: { ...OLD.bc_world, flags: ['brk1', 'brk2', ARM_STREAK] } })
    p.profile.inv.infernalForged = HEX_FORGED - 1
    expect(p.flagSet().has(trialFlag('hexsmith'))).toBe(false)
    p.profile.inv.infernalForged = HEX_FORGED
    expect(p.flagSet().has(trialFlag('hexsmith'))).toBe(true)
  })
})

// The yardstick of the last bosses (tests/game/afterplayBosses2.test.ts):
// a geared reference player of the band clears the invaded zone well inside
// 120 s of boss fight. A prestige class plays over its parents' kits, so it is
// held to them: it wins, and it is no quicker than 0.75 × its faster parent
// (the sixteen already span 3–112 s: the Shadowblade is the quick end).
describe('the prestige classes against the last bosses (the reference player)', () => {
  const ZONES: Array<{ zone: ZoneId; boss: string }> = [
    { zone: 'citadel', boss: 'leviathan' },
    { zone: 'rift', boss: 'elderDragon' }
  ]
  const fightOf = (zone: ZoneId, boss: string, cls: ClassId): { won: boolean; fight: number } => {
    const { sim, plan } = setupRun({ zone, level: INVASION[zone].max, cls, geared: true, invaded: true, seed: 7, potions: 5 })
    const b = sim.units.find(u => u.kind === boss)!
    let think = 0
    let woke = -1
    while (!sim.ended && sim.time < 900) {
      think -= 1 / 30
      if (think <= 0) { think = 0.2; botThink(sim) }
      stepSim(sim, plan, 1 / 30)
      sim.events.length = 0
      if (woke < 0 && b.awake) woke = sim.time
    }
    return { won: sim.ended === 'victory' && !b.alive, fight: woke >= 0 ? sim.time - woke : 0 }
  }
  for (const { zone, boss } of ZONES) for (const cls of PRESTIGE_IDS) {
    it(`${zone}: a geared ${cls} clears the ${boss} inside 120 s, no quicker than its parents`, () => {
      const me = fightOf(zone, boss, cls)
      const parents = CLASSES[cls].parents!.map(p => fightOf(zone, boss, p).fight)
      // eslint-disable-next-line no-console
      console.log(`[phase 10 bot] ${zone} ${cls}: the boss fight ${Math.round(me.fight)} s (parents ${parents.map(Math.round).join(' / ')} s)`)
      expect(me.won).toBe(true)
      expect(me.fight).toBeLessThan(120)
      expect(me.fight).toBeGreaterThanOrEqual(0.75 * Math.min(...parents))
    }, 240_000)
  }
})
