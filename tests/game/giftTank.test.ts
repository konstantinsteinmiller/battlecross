// ─── Gel for the road ────────────────────────────────────────────────────────
//
// A rewarded video on the Missions tab packs one Repair Gel for the next
// mission (`inv.giftTank`). The mission that begins next (never a resume)
// claims it as he lands: one gel, over the cap if need be, the flag cleared
// and saved, so the gift is paid exactly once. The UI half is
// tests/ui/giftTank.test.ts.

import { beforeEach, describe, expect, it } from 'vitest'
import { claimGiftTank, computeStats, loadProfile, profile, saveProfile } from '@/game/state/profile'
import { getState, setStates } from '@/use/useGameState'
import { INVENTORY_KEY } from '@/keys'

const cap = () => computeStats().tanksMax

beforeEach(() => {
  profile.hero.skills = {}
  profile.inv.tanks = 1
  profile.inv.giftTank = false
})

describe('the gift tank', () => {
  it('does nothing when no gift is packed', () => {
    expect(claimGiftTank()).toBe(false)
    expect(profile.inv.tanks).toBe(1)
  })

  it('adds one gel at the next mission start, even one over the cap', () => {
    profile.inv.tanks = cap()
    profile.inv.giftTank = true
    expect(claimGiftTank()).toBe(true)
    expect(profile.inv.tanks).toBe(cap() + 1)
    expect(profile.inv.giftTank).toBe(false)
  })

  it('is paid once: the flag clears and the save holds the gel, not the flag', () => {
    profile.inv.giftTank = true
    claimGiftTank()
    const saved = getState(INVENTORY_KEY) as { tanks: number; giftTank: boolean }
    expect(saved.giftTank).toBe(false)
    expect(saved.tanks).toBe(2)
    // The mission after that starts with what he carries, nothing more.
    expect(claimGiftTank()).toBe(false)
    expect(profile.inv.tanks).toBe(2)
  })

  it('survives a reload while it waits', () => {
    profile.inv.giftTank = true
    saveProfile()
    profile.inv.giftTank = false
    loadProfile()
    expect(profile.inv.giftTank).toBe(true)
  })

  it('reads a save from before the gift as "none packed"', () => {
    saveProfile()
    const { giftTank: _gone, ...old } = getState(INVENTORY_KEY) as Record<string, unknown>
    setStates({ [INVENTORY_KEY]: old })
    loadProfile()
    expect(profile.inv.giftTank).toBe(false)
    setStates({ [INVENTORY_KEY]: { ...old, giftTank: 'yes' } })
    loadProfile()
    expect(profile.inv.giftTank).toBe(false)
  })
})

describe('the mission claims it where a new mission lands', () => {
  // The scene half is too heavy to build here; pin the hook's shape instead:
  // only a fresh mission (no resume snapshot) claims, at the beam-in's end.
  it('is guarded by the resume snapshot, at the handover to play', async () => {
    const { readFileSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const src = readFileSync(resolve(__dirname, '../../src/game/sim/mission.ts'), 'utf8')
    const beamIn = src.slice(src.indexOf('private stepBeamIn('))
    const hook = beamIn.slice(0, beamIn.indexOf('\n  }\n'))
    expect(hook).toContain("if (!this.setup.snapshot && claimGiftTank())")
    expect(hook.indexOf("hud.phase = 'play'")).toBeLessThan(hook.indexOf('claimGiftTank()'))
  })
})
