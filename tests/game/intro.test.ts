// The intro cutscene, "Wake-Up Call" (story-arc.md § 1, story.md § Intro).
//
// The script is pure data and pure functions of time, so it is checked without
// a GPU: the shots tile the 17 s, every event fires exactly once when the
// game loop steps through it, and the overlays land where the story says.
// The director (`flow.ts`) is checked with fake modes: first-timers only, the
// tutorial builds behind it, watching and skipping both record it, a skip
// before the build is done holds the mission beam overlay, and a cloud save
// with progress arriving mid-intro ends it.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { drainAndResetModules, drainPersist, holdGameState } from '../stubs/drainPersist'
import {
  SHOTS, INTRO_END, SKIP_AFTER, EVENTS, eventsBetween, overlayAt, streetTime, shotIndexAt, FREEZE_AT
} from '@/game/story/introScript'

const h = vi.hoisted(() => ({ modes: [] as unknown[] }))

vi.mock('@/use/useAds', () => ({ showMidgameAd: async () => {} }))
vi.mock('@/use/useAdGate', () => ({ canShowInterstitial: () => false, markInterstitialShown: () => {} }))
vi.mock('@/use/useCrazyGames', () => ({ triggerHappytime: () => {} }))
vi.mock('@/game/engine/app', () => ({ app: { setMode: (m: unknown) => { h.modes.push(m) }, setWanted: () => {} } }))
vi.mock('@/use/useLeaderboard', () => ({ reportRun: async () => {} }))
vi.mock('@/use/usePortalLeaderboard', () => ({ joinPortalBoard: async () => {}, reportPortalBest: async () => {} }))

describe('the intro script', () => {
  it('six shots tile the cutscene, under the 18 s cap', () => {
    expect(SHOTS.map(s => s.id)).toEqual(['coldOpen', 'valley', 'lab', 'safeMode', 'wakeUp', 'beam'])
    expect(SHOTS[0]!.start).toBe(0)
    for (let i = 1; i < SHOTS.length; i++) expect(SHOTS[i]!.start).toBe(SHOTS[i - 1]!.end)
    expect(SHOTS[SHOTS.length - 1]!.end).toBe(INTRO_END)
    expect(INTRO_END).toBeLessThanOrEqual(18)
    expect(SKIP_AFTER).toBe(0.5)
    expect(shotIndexAt(3.49)).toBe(0)
    expect(shotIndexAt(3.5)).toBe(1)
    expect(shotIndexAt(16.9)).toBe(5)
  })

  it('stepping at 60 Hz fires every event exactly once, in order', () => {
    const fired: number[] = []
    let t = 0
    while (t < INTRO_END) {
      const t1 = Math.min(INTRO_END, t + 1 / 60)
      for (const e of eventsBetween(t, t1)) fired.push(e.at)
      t = t1
    }
    expect(fired.length).toBe(EVENTS.length)
    expect([...fired].sort((a, b) => a - b)).toEqual(fired)
  })

  it('every shot has its screen-reader line at its start', () => {
    for (const s of SHOTS) {
      expect(EVENTS.some(e => e.kind === 'line' && e.shot === s.id && Math.abs(e.at - s.start) < 1e-9)).toBe(true)
    }
  })

  it('Atlas speaks first; the Scrapyard theme lands on the flash', () => {
    const voiced = EVENTS.filter(e => e.kind === 'atlas' || e.kind === 'vex')
    expect(voiced[0]).toMatchObject({ kind: 'atlas', key: 'logStart' })
    const music = EVENTS.find(e => e.kind === 'music')
    expect(music).toMatchObject({ track: 'scrapyard' })
  })

  it('the cold open freezes on the release, then the tape rewinds it to the start', () => {
    expect(streetTime(1)).toBe(1)
    expect(streetTime(FREEZE_AT + 0.1)).toBe(FREEZE_AT)
    expect(streetTime(3.46)).toBe(0)
  })

  it('overlays: in from black, the eyelids, the HUD boot, the white flash and the logo', () => {
    expect(overlayAt(0).black).toBe(1)
    expect(overlayAt(1).black).toBe(0)
    expect(overlayAt(3.2).rewind).toBeGreaterThan(0.9)
    expect(overlayAt(11.1).eyelid).toBe(1)
    expect(overlayAt(12.2).eyelid).toBe(0)
    expect(overlayAt(12).hp).toBe(0)
    expect(overlayAt(14).hp).toBe(1)
    expect(overlayAt(14).lv).toBe(1)
    expect(overlayAt(INTRO_END).flash).toBe(1)
    expect(overlayAt(INTRO_END).logo).toBe(1)
    expect(overlayAt(8).flash).toBe(0)
  })
})

// ─── The director ────────────────────────────────────────────────────────────

interface FakeIntro {
  opts: { replay: boolean; onStart: () => void; onEnd: (skipped: boolean) => void }
  aborted: boolean
  skip(): void
  abort(): void
}

const load = async (world?: Record<string, unknown>) => {
  const gs = await holdGameState()
  const keys = await import('@/keys')
  if (world) gs.setStates({ [keys.WORLD_KEY]: world })
  const prof = await import('@/game/state/profile')
  prof.loadProfile()
  const flowMod = await import('@/game/flow')
  flowMod.__resetIntro()
  const intros: FakeIntro[] = []
  const builds: Array<{ quest: { template: string }; resolve: (m: unknown) => void; mode: { disposed: boolean; dispose(): void } }> = []
  const hubMode = { hub: true }
  flowMod.registerModeFactories(
    (quest) => new Promise((resolve) => {
      const mode = { disposed: false, dispose() { this.disposed = true } }
      builds.push({ quest: quest as { template: string }, resolve: () => resolve(mode as never), mode })
    }),
    () => hubMode as never,
    (opts) => {
      const i: FakeIntro = {
        opts, aborted: false,
        skip() { opts.onEnd(true) },
        abort() { this.aborted = true }
      }
      intros.push(i)
      return i as never
    }
  )
  return { gs, keys, prof, flowMod, intros, builds, hubMode }
}

const settle = async () => {
  for (let k = 0; k < 5; k++) {
    await nextTick()
    await Promise.resolve()
  }
}

describe('the intro director', () => {
  beforeEach(() => {
    drainAndResetModules()
    h.modes.length = 0
  })
  afterEach(() => drainPersist())

  it('a first-timer boots into the intro; the tutorial builds behind it once it starts', async () => {
    const { flowMod, intros, builds } = await load()
    expect(flowMod.bootTarget()).toEqual({ kind: 'intro' })
    await flowMod.createBootMode()
    expect(flowMod.flow.screen).toBe('intro')
    expect(intros).toHaveLength(1)
    expect(builds).toHaveLength(0)
    intros[0]!.opts.onStart()
    expect(builds).toHaveLength(1)
    expect(builds[0]!.quest.template).toBe('tutorial')
  })

  it('watched to the end: recorded as seen, then the tutorial takes over', async () => {
    const { flowMod, intros, builds, prof, gs, keys } = await load()
    await flowMod.createBootMode()
    intros[0]!.opts.onStart()
    builds[0]!.resolve(null)
    await settle()
    intros[0]!.opts.onEnd(false)
    await settle()
    expect(prof.profile.world.seen).toContain('intro')
    expect(gs.getState<{ seen: string[] }>(keys.WORLD_KEY)?.seen).toContain('intro')
    expect(flowMod.flow.screen).toBe('mission')
    expect(h.modes.at(-1)).toBe(builds[0]!.mode)
    expect(flowMod.flow.loading).toBe(false)
  })

  it('skipped before the build is done: the beam overlay holds until it is', async () => {
    const { flowMod, intros, builds, prof } = await load()
    await flowMod.createBootMode()
    intros[0]!.opts.onStart()
    intros[0]!.skip()
    await settle()
    expect(prof.profile.world.seen).toContain('intro')
    expect(flowMod.flow.loading).toBe(true)
    expect(flowMod.flow.screen).toBe('intro')
    builds[0]!.resolve(null)
    await settle()
    expect(flowMod.flow.loading).toBe(false)
    expect(flowMod.flow.screen).toBe('mission')
  })

  it('never shows again once seen, nor past the tutorial, nor over a resume point', async () => {
    const seen = await load({ unlocked: ['scrapyard'], bosses: [], tutorialDone: false, selected: 'scrapyard', seen: ['intro'] })
    expect(seen.flowMod.bootTarget()).toMatchObject({ kind: 'mission', snapshot: null })
    drainAndResetModules()
    const done = await load({ unlocked: ['scrapyard', 'blaze'], bosses: ['scrapper'], tutorialDone: true, selected: 'blaze' })
    expect(done.flowMod.bootTarget()).toEqual({ kind: 'hub' })
    // An old save past the tutorial is migrated: the beat is behind it.
    expect(done.prof.profile.world.seen).toContain('intro')
  })

  it('a build without the intro (VITE_APP_INTRO=false) boots the tutorial', async () => {
    const { flowMod } = await load()
    expect(flowMod.bootTarget(false)).toMatchObject({ kind: 'mission', snapshot: null })
  })

  it('a cloud save with progress arriving mid-intro ends it and goes where the save says', async () => {
    const { flowMod, intros, builds, gs, keys, prof, hubMode } = await load()
    await flowMod.createBootMode()
    intros[0]!.opts.onStart()
    // The cloud read lands: this player finished the tutorial on another device.
    gs.setStates({ [keys.WORLD_KEY]: { unlocked: ['scrapyard', 'blaze'], bosses: ['scrapper'], tutorialDone: true, selected: 'blaze' } })
    prof.loadProfile()
    const { saveDataVersion } = await import('@/use/useSaveStatus')
    saveDataVersion.value++
    await settle()
    expect(intros[0]!.aborted).toBe(true)
    expect(flowMod.flow.screen).toBe('hub')
    expect(h.modes.at(-1)).toBe(hubMode)
    // The tutorial built behind it is thrown away once it lands.
    builds[0]!.resolve(null)
    await settle()
    expect(builds[0]!.mode.disposed).toBe(true)
  })

  it('a replay from the hub ends back in the hub, and never builds a mission', async () => {
    const { flowMod, intros, builds, hubMode } = await load({ unlocked: ['scrapyard'], bosses: ['scrapper'], tutorialDone: true, selected: 'scrapyard' })
    await flowMod.createBootMode()
    expect(flowMod.flow.screen).toBe('hub')
    flowMod.replayIntro()
    expect(flowMod.flow.screen).toBe('intro')
    expect(intros[0]!.opts.replay).toBe(true)
    intros[0]!.opts.onStart()
    intros[0]!.opts.onEnd(false)
    await settle()
    expect(builds).toHaveLength(0)
    expect(flowMod.flow.screen).toBe('hub')
    expect(h.modes.at(-1)).toBe(hubMode)
  })
})

describe('the intro score ("Wake-Up Call")', () => {
  it('is scored to the picture: one 16th is 0.1 s, and the big hits land on the cutscene beats', async () => {
    const { getSong, songSeconds } = await import('@/game/audio/songs')
    const { FREEZE_AT, SPIRE_FLASH, LEVER_AT, FLASH_FROM, FLASH_FULL } = await import('@/game/story/introScript')
    const s = getSong('intro')
    expect(60 / s.bpm / 4).toBeCloseTo(0.1, 6)
    expect(songSeconds(s)).toBeGreaterThanOrEqual(INTRO_END)
    const hitAt = (sec: number, slack = 0.15) => s.steps.some((evs, i) => Math.abs(i * 0.1 - sec) <= slack && evs.some(e => e.i === 'hit'))
    expect(hitAt(FREEZE_AT - 0.1)).toBe(true) // the charge shot's release
    expect(hitAt(SPIRE_FLASH)).toBe(true)
    expect(hitAt(LEVER_AT)).toBe(true)
    expect(hitAt((FLASH_FROM + FLASH_FULL) / 2 + 0.1)).toBe(true)
    // The freeze is silence: nothing new between the release and the rewind.
    const quiet = s.steps.slice(Math.ceil(FREEZE_AT * 10), 29).every(evs => evs.length === 0)
    expect(quiet).toBe(true)
  })
})
