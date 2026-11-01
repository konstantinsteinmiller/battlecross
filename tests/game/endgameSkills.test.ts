import { describe, expect, it } from 'vitest'
import { ENDGAME_SKILLS, ENDGAME_LEVELS, SKILL_BY_ID, endgameOf, skillsOf, FIXED_EFFECT, scalingOf } from '@/game/data/skills'
import { Sim } from '@/game/sim/world'
import { createHero, castSkill } from '@/game/sim/hero'
import { spawnEnemy } from '@/game/sim/spawn'
import { stepSim } from '@/game/sim/step'
import { generateArena } from '@/game/sim/zoneGen'
import { applyPlan } from '@/game/sim/director'
import { startAttrs } from '@/game/data/attributes'
import { HERO_SKILLS } from '@/game/sim/heroSkills'

/**
 * The endgame skills (#168): six per class at levels 30, 34, 37, 40, 43 and
 * 46 (four actives, two passives), kept out of the class's twelve, each active
 * with a handler that does something to a pack of goblins.
 */

const WAVE1 = ['aegis', 'shadow', 'pyro', 'sovereign', 'chrono', 'blood', 'aether', 'geo', 'windrunner', 'frostwarden', 'lightbringer', 'beastcaller', 'elementalist', 'soulwarden', 'ironmonk', 'bard'] as const

describe('the data', () => {
  it('each class of the first wave has six: four actives and two passives, at the six levels, for a lot of its own stat', () => {
    for (const cls of WAVE1) {
      const six = endgameOf(cls)
      expect(six, cls).toHaveLength(6)
      expect(six.map(s => s.level), cls).toEqual([...ENDGAME_LEVELS])
      expect(six.filter(s => s.kind === 'active'), cls).toHaveLength(4)
      expect(six.filter(s => s.kind === 'passive'), cls).toHaveLength(2)
      for (const s of six) {
        expect(s.endgame, s.id).toBe(true)
        expect(SKILL_BY_ID[s.id], s.id).toBe(s)
        expect(Object.values(s.req).some(v => v >= 40), s.id).toBe(true)
        expect(skillsOf(cls).some(x => x.id === s.id), `${s.id} stays out of the twelve`).toBe(false)
      }
    }
    expect(new Set(ENDGAME_SKILLS.map(s => s.id)).size).toBe(ENDGAME_SKILLS.length)
  })

  it('a passive carries mods, an active carries a handler, and a fixed-effect skill reads no scaling', () => {
    for (const s of ENDGAME_SKILLS) {
      if (s.kind === 'passive') expect(Object.keys(s.mods ?? {}).length, s.id).toBeGreaterThan(0)
      else expect(HERO_SKILLS[s.id], s.id).toBeTypeOf('function')
      expect(FIXED_EFFECT.has(s.id) ? scalingOf(s) : 'x').toBe(FIXED_EFFECT.has(s.id) ? null : 'x')
    }
  })
})

/** A hero with the skill and three tough goblins close by; what a cast changes. */
const cast = (id: string, secs = 4): { before: number; after: number; mine: number; buffs: number; stunned: number; sim: Sim } => {
  const def = SKILL_BY_ID[id]!
  const plan = generateArena(7)
  const sim = new Sim({ seed: 7, w: plan.w, h: plan.h, level: 40, difficulty: 1, mode: 'zone', zone: 'plains' })
  applyPlan(sim, plan)
  const attrs = { ...startAttrs(), str: 60, dex: 60, int: 60, end: 60, skl: 60, cha: 60 }
  createHero(sim, {
    build: { level: 46, attrs, equipped: { main: null, off: null, body: null, trinket1: null, trinket2: null }, passives: [] },
    skills: [id], x: plan.start.x, z: plan.start.z, xpInto: 0, potions: 3
  })
  const u = sim.hero.unit
  u.mana = 9999
  u.hp = u.s.maxHp * 0.5
  const foes = [0, 1, 2].map(i => {
    const e = spawnEnemy(sim, 'goblin', u.x + 1.8 + i * 0.4, u.z + 0.8)!
    e.awake = true
    e.s.maxHp = 1e6
    e.hp = e.s.maxHp
    return e
  })
  const total = (): number => foes.reduce((n, e) => n + e.hp, 0)
  const before = total()
  const hp0 = u.hp
  castSkill(sim, 0, { x: foes[0]!.x, z: foes[0]!.z })
  for (let t = 0; t < secs; t += 1 / 30) { stepSim(sim, plan, 1 / 30); sim.events.length = 0 }
  void def
  void hp0
  return {
    before, after: total(), sim,
    mine: sim.units.filter(m => m.alive && m.team === 0 && m.ownerId === u.id).length,
    buffs: u.statuses.length + u.shield,
    stunned: foes.filter(e => e.statuses.some(s => s.id === 'stun')).length
  }
}

describe('what each active does', () => {
  it('the damage skills hurt a pack of goblins', () => {
    for (const id of ['timeShear', 'echoVolley', 'timeCollapse', 'bloodTide', 'leechingMist', 'exsanguinate', 'plasmaCannon', 'droneSwarm', 'gravityWell', 'ionStorm', 'aftershock', 'crystalLance', 'cataclysmQuake', 'earthsplitter', 'judgmentHammer', 'phantomRush', 'bladeVortex', 'execution', 'infernoWave', 'sunSpear', 'ashenVeil', 'supernova', 'zephyrBarrage', 'cycloneRip', 'hurricaneRain', 'glacierSlam', 'iceComet', 'whiteout', 'divineSmite', 'cleansingNova', 'consecration', 'solarJudgment', 'rendingPounce', 'thunderStampede', 'pyroclasm', 'stormcall', 'elementalCataclysm', 'soulRend', 'wailOfTheDamned', 'reapersHarvest', 'dragonFist', 'stormOfBlows', 'celestialPalm', 'discordantChord', 'sirenSong', 'magnumOpus']) {
      const r = cast(id)
      expect(r.after, id).toBeLessThan(r.before)
    }
  })

  it('the buffs and shields leave the hero stronger', () => {
    for (const id of ['sanguineAegis', 'mountainsEmbrace', 'guardiansVow', 'crusadersWrath', 'veilOfNight', 'imperialAscension', 'galeVeil', 'frozenBulwark', 'spiritOfTheWild', 'primordialSurge', 'diamondBody', 'anthemOfWar']) {
      expect(cast(id).buffs, id).toBeGreaterThan(0)
    }
  })

  it('the Sovereign calls a vanguard, and a decree stuns the pack', () => {
    expect(cast('summonVanguard').mine).toBeGreaterThanOrEqual(3)
    expect(cast('decreeOfSilence', 0.8).stunned).toBe(3)
    expect(cast('stasisField', 0.8).stunned).toBe(3)
    expect(cast('summonPack').mine).toBeGreaterThanOrEqual(3)
    // The standard bearer needs minions to bless: with none it is a harmless cast.
    expect(() => cast('standardBearer')).not.toThrow()
  })
})

describe('the balance band', () => {
  // Damage per second of cooldown (all hits of a cast added up) stays in one band, so no class's endgame
  // damage skill outruns the others; the ones that mostly do something else (a shield with a sting, a
  // damage-over-time ground field) are not measured here.
  const SIDE = new Set(['anthemOfWar', 'ashenVeil', 'consecration', 'cataclysmQuake', 'sirenSong', 'gravityWell', 'cleansingNova', 'wailOfTheDamned', 'echoVolley', 'bloodTide', 'leechingMist', 'exsanguinate'])
  it('every direct-damage active deals 15 to 40 damage per second of cooldown', () => {
    for (const s of ENDGAME_SKILLS) {
      if (s.kind !== 'active' || !s.p.dmg || SIDE.has(s.id)) continue
      const total = s.p.dmg * (s.p.hits ?? s.p.strikes ?? 1)
      expect(total / s.cd, s.id).toBeGreaterThanOrEqual(15)
      expect(total / s.cd, s.id).toBeLessThanOrEqual(40)
    }
  })
  it('the long cooldowns are the big ones: an ultimate (cooldown 45+) outhits the first active of the same class', () => {
    for (const cls of ['aegis', 'shadow', 'pyro', 'chrono', 'geo', 'aether', 'windrunner', 'lightbringer']) {
      const acts = endgameOf(cls as never).filter(s => s.kind === 'active' && s.p.dmg)
      const last = acts[acts.length - 1]!
      expect(last.p.dmg * (last.p.hits ?? last.p.strikes ?? 1), cls).toBeGreaterThan(acts[0]!.p.dmg * (acts[0]!.p.hits ?? acts[0]!.p.strikes ?? 1))
    }
  })
})
