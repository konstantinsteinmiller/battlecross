// ─── The hurt sound, from its side ───────────────────────────────────────────
//
// A hit's sound tells where it came from (`state/damageFeed.ts` →
// `sfx('hurt', pan, gain, muffle)` → the synth): stereo-panned by the source's
// bearing, and low-passed when the source is behind, so front and back differ.
// It goes through the SAME sfx bus as every other sound (no second context,
// so the mute and the ad-audio gates hold), respects the mute, and is
// throttled to one every 130 ms. The audio graph is faked node by node.

import { beforeEach, describe, expect, it, vi } from 'vitest'

interface FakeNode {
  kind: string
  to: FakeNode[]
  connect: (n: FakeNode) => FakeNode
  disconnect: () => void
  [k: string]: unknown
}
const param = (value = 0) => ({
  value,
  setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), setTargetAtTime: vi.fn()
})
const g = vi.hoisted(() => ({
  nodes: [] as unknown[],
  playable: true,
  ctx: null as unknown,
  bus: null as unknown
}))
const node = (kind: string, extra: Record<string, unknown> = {}): FakeNode => {
  const n: FakeNode = {
    kind,
    to: [],
    connect(d: FakeNode) { n.to.push(d); return d },
    disconnect() {},
    ...extra
  }
  g.nodes.push(n)
  return n
}
const makeCtx = () => ({
  currentTime: 10,
  state: 'running',
  createStereoPanner: () => node('panner', { pan: param() }),
  createBiquadFilter: () => node('filter', { type: 'lowpass', frequency: param(350), Q: param(1) }),
  createGain: () => node('gain', { gain: param(1) }),
  createOscillator: () => node('osc', { type: 'sine', frequency: param(440), setPeriodicWave: vi.fn(), start: vi.fn(), stop: vi.fn() }),
  createBufferSource: () => node('src', { buffer: null, loop: false, start: vi.fn(), stop: vi.fn() })
})

vi.mock('@/game/audio/engine', () => ({
  audio: () => (g.ctx ? { ctx: g.ctx, sfx: g.bus, music: {} } : null),
  canPlay: () => g.playable,
  noise: () => ({}),
  pulse: () => null,
  midiHz: (m: number) => 440 * Math.pow(2, (m - 69) / 12)
}))
vi.mock('@/use/useAssets', () => ({ registerOneShotSource: vi.fn() }))
vi.mock('@/game/assets/overrides', () => ({ SFX_FILES: new Map() }))

import { installSynth, muffleHz } from '@/game/audio/synth'
import { sfx, setSfxPlayer } from '@/game/audio/sfx'
import { feedDamage, damageFeed } from '@/game/state/damageFeed'
import { registerOneShotSource } from '@/use/useAssets'

type Ctx = ReturnType<typeof makeCtx>
const ctx = (): Ctx => g.ctx as Ctx
const of = (kind: string) => (g.nodes as FakeNode[]).filter(n => n.kind === kind)
const pans = () => of('panner').map(n => (n.pan as { value: number }).value)
/** The muffle's low-pass: straight into the bus (a noise voice's own colour
 *  filter feeds its gain instead). */
const muffles = () => of('filter').filter(n => n.to.includes(g.bus as FakeNode))

/** The audio clock runs on across cases: the synth's throttle remembers. */
let clock = 0
beforeEach(() => {
  g.ctx = makeCtx()
  g.bus = node('bus')
  g.nodes.length = 0
  g.playable = true
  clock += 100 // clear of the last case's throttle
  ctx().currentTime = clock
  damageFeed.clear()
  installSynth()
})

describe('pan and muffle by bearing', () => {
  it('a hit from the right pans right, unfiltered', () => {
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 10, 0, 10, 100)
    expect(muffles()).toHaveLength(0)
    const p = pans()
    expect(p.length).toBeGreaterThan(0)
    expect(Math.max(...p)).toBeGreaterThan(0.7) // the impact at the full pan
    expect(p.every(v => v > 0)).toBe(true) // Flux's blip half way, same side
  })

  it('a hit from the left pans left', () => {
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, -10, 0, 10, 100)
    expect(Math.min(...pans())).toBeLessThan(-0.7)
  })

  it('a hit from behind is low-passed through one filter into the SAME sfx bus', () => {
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 3, 10, 10, 100) // behind, a little right
    const filters = muffles()
    expect(filters).toHaveLength(1)
    const f = filters[0]!
    expect(f.type).toBe('lowpass')
    expect((f.frequency as { value: number }).value).toBeLessThan(4000)
    expect(f.to).toEqual([g.bus])
    // Every panned voice of it routes into the filter, none around it.
    for (const pn of of('panner')) expect(pn.to).toEqual([f])
  })

  it('dead behind is fully muffled; the cutoff opens toward the side', () => {
    expect(muffleHz(1)).toBeCloseTo(850, 6)
    expect(muffleHz(0)).toBeCloseTo(16000, 6)
    expect(muffleHz(0.5)).toBeGreaterThan(muffleHz(1))
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 0, 10, 10, 100)
    expect((muffles()[0]!.frequency as { value: number }).value).toBeCloseTo(850, 3)
  })

  it('a hit in front is not muffled, a hit behind is: the two sound different', () => {
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 0, -10, 10, 100)
    expect(muffles()).toHaveLength(0)
    ctx().currentTime += 1
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 0, 10, 10, 100)
    expect(muffles()).toHaveLength(1)
  })

  it('every voice is a registered one-shot (an ad or a mute hard-stops it)', () => {
    vi.mocked(registerOneShotSource).mockClear()
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 0, 10, 10, 100)
    const voices = of('osc').length + of('src').length
    expect(voices).toBeGreaterThan(0)
    expect(vi.mocked(registerOneShotSource)).toHaveBeenCalledTimes(voices)
  })

  it('the muffle ends with its sound: the next plain sound is not filtered', () => {
    sfx('hurt', 0, 1, 1)
    expect(muffles()).toHaveLength(1)
    sfx('bolt', 0.5)
    expect(muffles()).toHaveLength(1)
    expect(of('panner').at(-1)!.to).toEqual([g.bus])
  })
})

describe('throttle and mute', () => {
  const voices = () => of('osc').length + of('src').length

  it('at most one hurt every ~130 ms', () => {
    sfx('hurt', 0.5)
    const one = voices()
    expect(one).toBeGreaterThan(0)
    ctx().currentTime += 0.1
    sfx('hurt', -0.5)
    expect(voices()).toBe(one) // dropped
    ctx().currentTime += 0.04
    sfx('hurt', -0.5)
    expect(voices()).toBe(one * 2) // 140 ms after the first: plays
  })

  it('the whizz warning plays at most every half second', () => {
    sfx('whizz', 0.6, 1, 0.5)
    const one = voices()
    expect(one).toBeGreaterThan(0)
    ctx().currentTime += 0.3
    sfx('whizz', -0.6)
    expect(voices()).toBe(one)
    ctx().currentTime += 0.25
    sfx('whizz', -0.6)
    expect(voices()).toBe(one * 2)
  })

  it('muted (or under an ad): nothing is built at all', () => {
    g.playable = false
    feedDamage({ x: 0, z: 0, yaw: 0 }, null, 0, 10, 10, 100)
    expect(g.nodes).toHaveLength(0)
  })

  it('a suspended context plays nothing either', () => {
    ctx().state = 'suspended'
    sfx('hurt', 0.5, 1, 1)
    expect(g.nodes).toHaveLength(0)
  })

  it('no synth installed: silent, never a throw', () => {
    setSfxPlayer(null)
    expect(() => feedDamage({ x: 0, z: 0, yaw: 0 }, null, 0, 10, 10, 100)).not.toThrow()
    expect(g.nodes).toHaveLength(0)
  })
})
