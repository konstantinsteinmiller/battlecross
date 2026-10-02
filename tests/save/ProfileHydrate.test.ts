// @vitest-environment jsdom
// ─── The profile is hydrated from the ONE state blob — and only from it ─────
//
// Everything the game remembers lives in one object, `bcross_state`, written
// to localStorage (and mirrored to the portal's cloud) as ONE entry. These
// pin the three things that make a returning player a returning player:
//
//   1. a developed save in the blob is what the game boots with — never the
//      first-timer defaults;
//   2. a cloud save that arrives AFTER boot (a slow SDK, a retried read)
//      replaces what is in memory, without a reload;
//   3. a checkpoint writes one blob, holding every field, and nothing else
//      under the game's prefix.
//
// The same scenario is run end to end in a real browser against a stubbed
// portal SDK by `scripts/hydrate-check.mjs`.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'

const STATE_KEY = 'bcross_state'

/** A save some hours in: level 9, the Hollows decided, gear worn, skills from two classes. */
const DEVELOPED = {
  bc_version: 1,
  bc_level: 9,
  bc_gold: 1234,
  bc_story: 3,
  bc_quests_done: 5,
  bc_hero: {
    xp: 410,
    attrs: { str: 14, dex: 7, int: 9, end: 12, skl: 5, cha: 8 },
    points: 2,
    learned: ['shieldSlam', 'fireball', 'aegisAura'],
    active: ['shieldSlam', 'fireball', '', '', '', ''],
    passive: ['aegisAura', '', '']
  },
  bc_inventory: {
    items: ['rustedShortsword', 'woodenBuckler', 'paddedTunic', 'ironBroadsword', 'copperBand'],
    equipped: { main: 'ironBroadsword', off: 'woodenBuckler', body: 'paddedTunic', trinket1: 'copperBand', trinket2: null },
    fresh: ['copperBand'],
    potions: 4
  },
  bc_quests: { done: { goblinKing: 'pact' }, rep: { order: 0, syndicate: 1, circle: 0 } },
  bc_world: { cleared: ['plains', 'sunford', 'hollows', 'woods'], flags: ['goblinPact', 'arenaOpen'], at: 'sunford', visits: { plains: 3, hollows: 1 }, arenaBest: 4 },
  bc_stats: { kills: 180, deaths: 2, runs: 9, playSeconds: 2600, bestLevel: 9, xpEarned: 9000 },
  bc_tutorial: { 'hint:move:touch': 3, endingSeen: true }
}

const boot = async () => {
  await holdGameState()
  const profileMod = await import('@/game/state/profile')
  const state = await import('@/use/useGameState')
  return { ...profileMod, state }
}

beforeEach(() => { drainAndResetModules() })
afterEach(() => { drainPersist() })

describe('booting from the state blob', () => {
  it('a device with no save boots a first-timer', async () => {
    const { initProfile, isFreshProfile, profile } = await boot()
    initProfile()
    expect(isFreshProfile()).toBe(true)
    expect(profile.level).toBe(1)
    expect(profile.hero.learned).toEqual(['shieldSlam'])
    expect(profile.inv.equipped.main).toBe('rustedShortsword')
    expect(profile.world.at).toBe('plains')
  })

  it('a developed save is what the game boots with — never the defaults', async () => {
    localStorage.setItem(STATE_KEY, JSON.stringify(DEVELOPED))
    const { initProfile, isFreshProfile, profile, lifetimeXp, isNodeOpen, hasFlag, totalAttrs } = await boot()
    initProfile()
    expect(isFreshProfile()).toBe(false)
    expect(profile.level).toBe(9)
    expect(profile.gold).toBe(1234)
    expect(profile.hero.xp).toBe(410)
    expect(profile.hero.points).toBe(2)
    expect(profile.hero.attrs.str).toBe(14)
    expect(profile.hero.learned).toEqual(['shieldSlam', 'fireball', 'aegisAura'])
    expect(profile.hero.active.slice(0, 2)).toEqual(['shieldSlam', 'fireball'])
    expect(profile.hero.passive[0]).toBe('aegisAura')
    expect(profile.inv.equipped).toEqual(DEVELOPED.bc_inventory.equipped)
    expect(profile.inv.potions).toBe(4)
    expect(profile.quests.done).toEqual({ goblinKing: 'pact' })
    expect(profile.quests.rep.syndicate).toBe(1)
    expect(profile.world.cleared).toEqual(['plains', 'sunford', 'hollows', 'woods'])
    expect(profile.world.at).toBe('sunford')
    expect(profile.world.arenaBest).toBe(4)
    expect(profile.stats.kills).toBe(180)
    expect(lifetimeXp()).toBe(9000)
    // …and it is what the rules read: the arena is open, the pact holds, the
    // gear's stats are on the hero.
    expect(hasFlag('goblinPact')).toBe(true)
    expect(isNodeOpen('arena')).toBe(true)
    expect(isNodeOpen('outskirts')).toBe(true)
    expect(isNodeOpen('fortress')).toBe(false)
    expect(totalAttrs().str).toBeGreaterThan(14)
  })

  it('the profile holds COPIES: play never edits the blob behind the save\'s back', async () => {
    localStorage.setItem(STATE_KEY, JSON.stringify(DEVELOPED))
    const { initProfile, profile, state } = await boot()
    initProfile()
    profile.hero.learned.push('stoneSpike')
    profile.world.cleared.push('crags')
    expect((state.getState('bc_hero') as { learned: string[] }).learned).toEqual(['shieldSlam', 'fireball', 'aegisAura'])
    expect((state.getState('bc_world') as { cleared: string[] }).cleared).not.toContain('crags')
  })

  it('drops what the game no longer knows instead of crashing on it', async () => {
    localStorage.setItem(STATE_KEY, JSON.stringify({
      ...DEVELOPED,
      bc_level: 99,
      bc_gold: -50,
      bc_hero: { ...DEVELOPED.bc_hero, learned: ['shieldSlam', 'laserEyes'], active: ['laserEyes', 'aegisAura'], attrs: { str: 'x' } },
      bc_inventory: { items: ['rustedShortsword', 'plasmaRifle'], equipped: { main: 'plasmaRifle', off: 'ironShield', body: 'rustedShortsword' }, potions: 40 },
      bc_world: { cleared: ['plains', 'moonbase'], at: 'moonbase' }
    }))
    const { initProfile, profile } = await boot()
    initProfile()
    expect(profile.level).toBe(30)
    expect(profile.gold).toBe(0)
    expect(profile.hero.learned).toEqual(['shieldSlam'])
    // An unknown skill, and a passive in an active slot, leave the slot empty.
    expect(profile.hero.active).toEqual(['', '', '', '', '', ''])
    expect(profile.hero.attrs.str).toBe(5)
    expect(profile.inv.items).toEqual(['rustedShortsword'])
    // Not owned, not known, or in the wrong slot: unequipped.
    expect(profile.inv.equipped).toMatchObject({ main: null, off: null, body: null })
    expect(profile.inv.potions).toBe(5)
    expect(profile.world.cleared).toEqual(['plains'])
    expect(profile.world.at).toBe('plains')
  })

  it('survives a blob that is not JSON', async () => {
    localStorage.setItem(STATE_KEY, '{not json')
    const { initProfile, isFreshProfile } = await boot()
    expect(() => initProfile()).not.toThrow()
    expect(isFreshProfile()).toBe(true)
  })
})

describe('a cloud save that lands after boot', () => {
  it('replaces the first-timer in memory, without a reload', async () => {
    const { initProfile, isFreshProfile, profile, state } = await boot()
    const { saveDataVersion } = await import('@/use/useSaveStatus')
    const { nextTick } = await import('vue')
    initProfile()
    expect(isFreshProfile()).toBe(true)

    // What a strategy's hydrate does: the blob lands in storage, the in-memory
    // state is reloaded from it, and the data version is bumped.
    localStorage.setItem(STATE_KEY, JSON.stringify(DEVELOPED))
    state.reloadGameState()
    saveDataVersion.value++
    await nextTick()

    expect(isFreshProfile()).toBe(false)
    expect(profile.level).toBe(9)
    expect(profile.world.cleared).toContain('hollows')
    expect(profile.inv.equipped.main).toBe('ironBroadsword')
  })
})

describe('a checkpoint', () => {
  it('writes ONE blob holding every field, and nothing else under the game\'s prefix', async () => {
    const { initProfile, profile, saveProfile, state } = await boot()
    initProfile()
    profile.gold = 77
    profile.world.cleared.push('plains')
    profile.hero.learned.push('fireball')
    saveProfile()
    state.flushPersist()

    const keys = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)!)
    expect(keys.filter(k => k.startsWith('bc_'))).toEqual([])
    expect(keys).toContain(STATE_KEY)
    const blob = JSON.parse(localStorage.getItem(STATE_KEY)!) as Record<string, unknown>
    for (const k of ['bc_version', 'bc_level', 'bc_gold', 'bc_story', 'bc_quests_done', 'bc_hero', 'bc_inventory', 'bc_quests', 'bc_world', 'bc_stats', 'bc_tutorial']) {
      expect(blob, k).toHaveProperty(k)
    }
    expect(blob.bc_gold).toBe(77)
    expect((blob.bc_world as { cleared: string[] }).cleared).toEqual(['plains'])
    for (const k of Object.keys(blob)) expect(k.startsWith('bc_'), k).toBe(true)
  })

  it('round-trips: what was saved is what the next boot reads', async () => {
    const first = await boot()
    first.initProfile()
    first.grantXp(900)
    first.profile.gold = 500
    first.gainItem('ironBroadsword')
    first.clearNode('plains')
    first.saveProfile()
    first.state.flushPersist()
    const level = first.profile.level
    const xp = first.profile.hero.xp
    expect(level).toBeGreaterThan(1)

    drainAndResetModules()
    const second = await boot()
    second.initProfile()
    expect(second.profile.level).toBe(level)
    expect(second.profile.hero.xp).toBe(xp)
    expect(second.profile.hero.points).toBe((level - 1) * 3)
    expect(second.profile.gold).toBe(500)
    expect(second.profile.inv.items).toContain('ironBroadsword')
    expect(second.profile.world.cleared).toEqual(['plains'])
    expect(second.isFreshProfile()).toBe(false)
  })
})
