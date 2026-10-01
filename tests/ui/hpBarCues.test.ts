// @vitest-environment jsdom
// ─── The health bar answers every hit ────────────────────────────────────────
//
// A playtester never looked at the health bar. Now a hit leaves the lost chunk
// standing as a light "damage ghost" that drains after ~0.4 s (the fighting
// game's recent-damage segment), flashes and kicks the bar (never more often
// than KICK_GAP), and the first real damage in a profile flies a glow into the
// heart and swells the bar — once, saved through the profile's tips.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import {
  HpGhost, GHOST_HOLD, GHOST_DRAIN, KICK_GAP, rateGate, claimFirstHit, FIRST_HIT_TIP
} from '@/components/hud/hpCues'
import { profile } from '@/game/state/profile'
import { hud, tickHud } from '@/game/state/hud'
import { getState } from '@/use/useGameState'
import { TUTORIAL_KEY } from '@/keys'
import HudBars from '@/components/hud/HudBars.vue'

describe('HpGhost: the lost chunk holds, then drains', () => {
  it('stands at the old top for the hold, then drains to the fill', () => {
    const g = new HpGhost()
    g.reset(100)
    g.hit(100, 70)
    expect(g.showing).toBe(true)
    expect(g.step(GHOST_HOLD - 0.05)).toBe(100) // still standing
    const mid = g.step(0.05 + GHOST_DRAIN / 2)
    expect(mid).toBeLessThan(100)
    expect(mid).toBeGreaterThan(70)
    g.step(GHOST_DRAIN)
    expect(g.top).toBe(70)
    expect(g.showing).toBe(false)
  })

  it('a hit inside the hold keeps the top where the run began and restarts the hold', () => {
    const g = new HpGhost()
    g.reset(100)
    g.hit(100, 80)
    g.step(GHOST_HOLD - 0.1)
    g.hit(80, 60)
    g.step(GHOST_HOLD - 0.05)
    expect(g.top).toBe(100) // the whole run, still standing
    g.step(0.05 + GHOST_DRAIN + 0.01)
    expect(g.top).toBe(60)
  })

  it('a hit while draining holds it where it got to', () => {
    const g = new HpGhost()
    g.reset(100)
    g.hit(100, 50)
    g.step(GHOST_HOLD + GHOST_DRAIN / 2)
    const at = g.top
    g.hit(50, 40)
    g.step(GHOST_HOLD - 0.05)
    expect(g.top).toBe(at)
  })

  it('a rise (a gel, a revive) clears it', () => {
    const g = new HpGhost()
    g.reset(100)
    g.hit(100, 30)
    g.reset(80)
    expect(g.showing).toBe(false)
  })
})

describe('rate limits and the once-per-profile cue', () => {
  it('the kick fires at most once per KICK_GAP', () => {
    const gate = rateGate(KICK_GAP)
    expect(gate(10)).toBe(true)
    expect(gate(10 + KICK_GAP / 2)).toBe(false)
    expect(gate(10 + KICK_GAP + 0.001)).toBe(true)
  })

  it('the first-hit cue is claimed once per profile, and saved at once', () => {
    profile.tips = {}
    expect(claimFirstHit()).toBe(true)
    expect(claimFirstHit()).toBe(false)
    expect(profile.tips[FIRST_HIT_TIP]).toBe(true)
    expect((getState(TUTORIAL_KEY, {}) as Record<string, unknown>)[FIRST_HIT_TIP]).toBe(true)
  })
})

describe('HudBars wiring', () => {
  const animate = vi.fn(() => ({ cancel: () => {} }) as unknown as Animation)
  const had = Object.getOwnPropertyDescriptor(Element.prototype, 'animate')
  const bars = () => mount(HudBars, {
    global: { plugins: [createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })] }
  })
  const hitTo = async (hp: number) => {
    hud.hp = hp
    await nextTick()
  }
  const ghostOf = (w: ReturnType<typeof bars>) => w.get('.ghost').element as HTMLElement
  const orbAnimated = () => animate.mock.contexts.filter(c => (c as Element).classList?.contains('hit-orb')).length

  enableAutoUnmount(afterEach)
  beforeEach(() => {
    Object.defineProperty(Element.prototype, 'animate', { configurable: true, writable: true, value: animate })
    animate.mockClear()
    profile.tips = {}
    hud.phase = 'play'
    hud.maxHp = 100
    hud.hp = 100
  })
  afterEach(() => {
    if (had) Object.defineProperty(Element.prototype, 'animate', had)
    else delete (Element.prototype as { animate?: unknown }).animate
    hud.phase = 'boot'
  })

  it('a hit shows the ghost at the old top, and it drains after the hold', async () => {
    const w = bars()
    await hitTo(70)
    tickHud(1 / 60)
    const el = ghostOf(w)
    expect(el.style.opacity).toBe('1')
    expect(el.style.height).toBe('100%')
    tickHud(GHOST_HOLD - 0.1)
    expect(el.style.height).toBe('100%')
    tickHud(0.1 + GHOST_DRAIN / 2)
    expect(parseFloat(el.style.height)).toBeLessThan(100)
    tickHud(GHOST_DRAIN)
    expect(el.style.opacity).toBe('0')
  })

  it('the first hit flies the glow and swells the bar, once per profile', async () => {
    bars()
    await hitTo(80)
    expect(orbAnimated()).toBe(1)
    expect(profile.tips[FIRST_HIT_TIP]).toBe(true)
    await new Promise(r => setTimeout(r, (KICK_GAP + 0.05) * 1000))
    await hitTo(60)
    expect(orbAnimated()).toBe(1) // not again
    // …but the bar still kicks on every (rate-limited) hit.
    const barKicks = animate.mock.contexts.filter(c => (c as Element).classList?.contains('hp')).length
    expect(barKicks).toBeGreaterThanOrEqual(3) // kick + swell, then a kick
  })

  it('no cue outside live play (beaming in, a resumed snapshot)', async () => {
    hud.phase = 'beamIn'
    bars()
    await hitTo(50)
    expect(animate).not.toHaveBeenCalled()
    expect(profile.tips[FIRST_HIT_TIP]).toBeUndefined()
  })
})
