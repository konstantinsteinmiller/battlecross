// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import { heroChoiceDue, heroChoiceShown, type HeroChoiceGate } from '@/game/heroChoice'

/**
 * The hero choice (roadmap #71): a brand-new save picks the boy or the girl
 * hero once, before the first fight moves; a returning save never sees it and
 * plays the boy hero it always had; the pick is in the one save object and
 * reaches the gendered lines.
 */

type P = typeof import('@/game/state/profile')
let p: P

beforeEach(async () => {
  drainAndResetModules()
  await holdGameState()
  p = await import('@/game/state/profile')
  p.initProfile()
})
afterEach(() => { drainPersist() })

describe('the hero in the save', () => {
  it('a new save is the boy hero until a pick', () => {
    expect(p.profile.hero.gender).toBe('m')
    expect(p.needsHeroChoice()).toBe(true)
  })

  it('a save from before the choice loads as the boy hero, and a bad value too', async () => {
    const gs = await holdGameState()
    const { HERO_KEY } = await import('@/keys')
    p.saveProfile()
    const old = { ...(gs.getState(HERO_KEY) as Record<string, unknown>) }
    delete old.gender
    gs.setState(HERO_KEY, old)
    p.loadProfile()
    expect(p.profile.hero.gender).toBe('m')
    gs.setState(HERO_KEY, { ...old, gender: 'x' })
    p.loadProfile()
    expect(p.profile.hero.gender).toBe('m')
  })

  it('the pick is saved in the one object and read back; the choice is not asked again', () => {
    p.pickHero('f')
    expect(p.profile.hero.gender).toBe('f')
    expect(p.profile.tips[p.HERO_PICKED_TIP]).toBe(true)
    expect(p.needsHeroChoice()).toBe(false)
    // A reload before the first kill: still the girl hero, still not asked.
    p.loadProfile()
    expect(p.profile.hero.gender).toBe('f')
    expect(p.isFreshProfile()).toBe(true)
    expect(p.needsHeroChoice()).toBe(false)
  })

  it('a returning player is never asked, picked or not', () => {
    p.profile.stats.kills = 3
    expect(p.needsHeroChoice()).toBe(false)
    p.profile.stats.kills = 0
    p.profile.level = 4
    expect(p.needsHeroChoice()).toBe(false)
  })

  it('the character page switches the hero and saves it; the lines follow', async () => {
    const { heroForm } = await import('@/i18n/gendered')
    p.setHeroGender('f')
    expect(heroForm.value).toBe('f')
    p.loadProfile()
    expect(p.profile.hero.gender).toBe('f')
    p.setHeroGender('m')
    expect(heroForm.value).toBe('m')
    expect(p.profile.hero.gender).toBe('m')
  })
})

describe('when the choice is on screen', () => {
  const base: HeroChoiceGate = { needs: true, screen: 'zone', node: 'plains', loading: false, splashGone: true, adShowing: false, darkBlocking: false }

  it('a new save on its opening fight, once the loader is gone', () => {
    expect(heroChoiceShown(base)).toBe(true)
    expect(heroChoiceShown({ ...base, splashGone: false })).toBe(false)
    expect(heroChoiceDue({ ...base, splashGone: false })).toBe(true)
  })

  it('never for a save that has picked or played, nor anywhere but the opening fight', () => {
    expect(heroChoiceDue({ ...base, needs: false })).toBe(false)
    expect(heroChoiceDue({ ...base, screen: 'town', node: 'sunford' })).toBe(false)
    expect(heroChoiceDue({ ...base, screen: 'map' })).toBe(false)
    expect(heroChoiceDue({ ...base, loading: true })).toBe(false)
  })

  it('waits under an ad (the first-load interstitial goes first) and under the dark-mode notice', () => {
    expect(heroChoiceShown({ ...base, adShowing: true })).toBe(false)
    expect(heroChoiceDue({ ...base, adShowing: true })).toBe(true)
    expect(heroChoiceShown({ ...base, darkBlocking: true })).toBe(false)
  })
})
