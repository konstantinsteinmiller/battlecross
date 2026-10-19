import { describe, expect, it } from 'vitest'
import { ENEMIES, chargedFor, CHARGED_ELITE_AREA, CHARGED_FLOOR, CHARGED_RARITY, CHARGED_TELE, coneArea } from '@/game/data/enemies'
import { FRAG } from '@/game/gfx/telegraphs'
import { setupRun } from '@/game/sim/bot'
import { spawnEnemy } from '@/game/sim/spawn'
import { startAbility } from '@/game/sim/abilities'
import { stepSim } from '@/game/sim/step'

/** Boss and elite CHARGED attacks (#147). */

const ranked = ENEMIES.filter(e => e.rank === 'boss' || e.rank === 'elite')
const chargedOf = (e: (typeof ENEMIES)[number]) => e.abilities.find(a => a.charged)
const SPECIAL = ['slam', 'smash', 'cone', 'line', 'charge', 'shot', 'volley', 'lob', 'barrage', 'leap', 'blink']

describe('charged attacks (#147)', () => {
  it('every boss and elite has exactly one, with a long wind-up', () => {
    for (const e of ranked) {
      if (e.script === 'tuskerCameo') continue
      const c = e.abilities.filter(a => a.charged)
      expect(c.length, e.id).toBe(1)
      expect(c[0]!.windup, e.id).toBeGreaterThanOrEqual(2)
      const normal = e.abilities.filter(a => !a.charged && a.kind === 'cone' && a.fx === 'breath')
      for (const n of normal) expect(coneArea(c[0]!), e.id).toBeGreaterThan(coneArea(n) * 1.5)
    }
  })

  it('damage floor: 50 % of the hero\'s life for a boss, 35 % for an elite', () => {
    for (const e of ranked) {
      const c = chargedOf(e)
      if (!c) continue
      expect(c.pct!, e.id).toBeGreaterThanOrEqual(e.rank === 'boss' ? CHARGED_FLOOR.boss : CHARGED_FLOOR.elite)
    }
  })

  it('is three times as rare as the unit\'s normal specials', () => {
    for (const e of ranked) {
      const c = chargedOf(e)
      if (!c) continue
      const sp = e.abilities.filter(a => !a.charged && SPECIAL.includes(a.kind))
      const mean = sp.length ? sp.reduce((n, a) => n + a.cd, 0) / sp.length : 10
      expect(c.cd / mean, e.id).toBeCloseTo(CHARGED_RARITY, 1)
    }
  })

  it('an elite\'s area is about 40 % smaller than a boss\'s of the same make', () => {
    for (const elite of ranked.filter(e => e.rank === 'elite' && chargedOf(e))) {
      const ratio = coneArea(chargedOf(elite)!) / coneArea(chargedFor(elite, 'boss'))
      expect(ratio, elite.id).toBeCloseTo(CHARGED_ELITE_AREA, 2)
      expect(1 - ratio, elite.id).toBeGreaterThan(0.35)
      expect(1 - ratio, elite.id).toBeLessThan(0.45)
    }
  })

  it('the preview is drawn dark red to violet, not the plain red of other warnings', () => {
    const [nr, , nb] = CHARGED_TELE.near
    const [fr, , fb] = CHARGED_TELE.far
    expect(nr).toBeGreaterThan(nb) // red at the caster
    expect(fb).toBeGreaterThan(fr) // violet at the far edge
    expect(nr).toBeLessThan(1) // dark
    expect(FRAG).toContain('bool charged')
    expect(FRAG).toContain(`vec3(${CHARGED_TELE.far.map(n => n.toFixed(2)).join(', ')})`)
  })

  it('lands for at least the floor of the hero\'s max health, and raises a charged preview', () => {
    for (const id of ['voidDragon', 'voidDrake']) {
      const def = ENEMIES.find(e => e.id === id)!
      const { sim, plan } = setupRun({ zone: 'peak', level: 20, cls: 'aegis', seed: 5 })
      const hero = sim.hero.unit
      const u = spawnEnemy(sim, id, sim.hero.unit.x + 3, sim.hero.unit.z)!
      const a = (ENEMIES.find(e => e.id === u.kind)!).abilities.findIndex(q => q.charged)
      const ab = ENEMIES.find(e => e.id === u.kind)!.abilities[a]!
      u.x = hero.x + 3
      u.z = hero.z
      u.awake = true
      hero.hp = hero.s.maxHp
      hero.shield = 0
      sim.events.length = 0
      startAbility(sim, u, ab, a, hero)
      const tele = sim.events.find(e => e.t === 'tele')
      expect(tele && tele.t === 'tele' && tele.tele.charged).toBe(true)
      const before = hero.hp
      for (let i = 0; i < 30 * (ab.windup + 0.5); i++) stepSim(sim, plan, 1 / 30)
      const lost = before - Math.max(0, hero.hp)
      expect(lost / hero.s.maxHp, u.kind).toBeGreaterThanOrEqual(u.rank === 'boss' ? CHARGED_FLOOR.boss : CHARGED_FLOOR.elite)
    }
  })
})
