// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { ATTR_START } from '@/game/data/attributes'
import { SKILLS } from '@/game/data/skills'

/** Build presets and the healer's respec (roadmap #14, D64 / D65). */

type P = typeof import('@/game/state/profile')
let p: P
beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => { drainPersist() })

describe('build presets', () => {
  it('save the loadout and the gear, and put them back on', () => {
    expect(p.savePreset(0)).toBe(true)
    const worn = { ...p.profile.inv.equipped }
    const active = [...p.profile.hero.active]
    p.unequip('main')
    p.profile.hero.active = active.map(() => '')
    expect(p.loadPreset(0)).toEqual([])
    expect(p.profile.inv.equipped).toEqual(worn)
    expect(p.profile.hero.active).toEqual(active)
  })

  it('leave out what is no longer owned or allowed, and say what', () => {
    p.savePreset(1)
    const sword = p.profile.inv.equipped.main!
    p.profile.inv.items = p.profile.inv.items.filter(i => i !== sword)
    p.profile.inv.equipped.main = null
    p.profile.hero.learned = p.profile.hero.learned.filter(s => s !== 'shieldSlam')
    expect(p.loadPreset(1)!.sort()).toEqual([sword, 'shieldSlam'].sort())
    expect(p.profile.inv.equipped.main).toBeNull()
    expect(p.profile.hero.active).not.toContain('shieldSlam')
  })

  it('an empty preset loads nothing; a name is trimmed and kept through a reload', () => {
    expect(p.loadPreset(1)).toBeNull()
    p.savePreset(0)
    p.renamePreset(0, '   Tank    build that is far too long   ')
    expect(p.profile.meta.presets[0]!.name.length).toBeLessThanOrEqual(p.PRESET_NAME_MAX)
    expect(p.profile.meta.presets[0]!.name.startsWith('Tank build')).toBe(true)
    p.saveProfile()
    p.loadProfile()
    expect(p.profile.meta.presets[0]!.name.startsWith('Tank build')).toBe(true)
    expect(p.profile.meta.presets[1]).toBeNull()
  })
})

describe('respec at the healer', () => {
  it('gives every spent point back; the first is free, then 50 + 25 per level', () => {
    p.profile.level = 10
    p.profile.hero.points = 30
    expect(p.respecRefund()).toBe(0)
    expect(p.respec()).toBe(false)
    p.spendPoint('str', 10)
    p.spendPoint('end', 5)
    expect(p.respecRefund()).toBe(15)
    expect(p.respecCost()).toBe(0)
    expect(p.respec()).toBe(true)
    expect(p.profile.hero.points).toBe(30)
    expect(p.profile.hero.attrs.str).toBe(ATTR_START)
    expect(p.respecCost()).toBe(p.RESPEC_BASE + p.RESPEC_PER_LEVEL * 10)
    p.spendPoint('dex', 4)
    p.profile.gold = 10
    expect(p.respec()).toBe(false)
    p.profile.gold = 1000
    expect(p.respec()).toBe(true)
    expect(p.profile.gold).toBe(1000 - 300)
    expect(p.profile.meta.respecs).toBe(2)
  })

  it('a slotted skill whose requirement the reset breaks goes to the bench, and is named first', () => {
    const needy = SKILLS.find(s => s.kind === 'active' && Object.values(s.req).some(v => (v ?? 0) > ATTR_START) && s.level <= 30)!
    p.profile.level = Math.max(needy.level, 1)
    p.profile.hero.points = 200
    for (const [a, v] of Object.entries(needy.req)) p.spendPoint(a as never, Math.max(0, (v ?? 0) - ATTR_START))
    p.profile.hero.learned.push(needy.id)
    expect(p.setSlot('active', 1, needy.id)).toBe(true)
    expect(p.respecBenched()).toContain(needy.id)
    p.respec()
    expect(p.profile.hero.active).not.toContain(needy.id)
    expect(p.profile.hero.learned).toContain(needy.id)
  })
})
