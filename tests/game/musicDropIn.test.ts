// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'

/**
 * A recorded file dropped into public/audio/music/<song id>.ogg replaces that
 * composed piece (sound-todo.md, roadmap #16): the sequencer streams it
 * through the music bus instead of composing the song.
 */

vi.mock('virtual:asset-overrides', () => ({ default: { sfx: [], music: ['unmade.ogg'], textures: [], items: [], skills: [], portraits: [], ui: [] } }))

const played = vi.hoisted(() => ({ urls: [] as string[], oscs: 0 }))

vi.mock('@/game/audio/engine', () => {
  const param = (): Record<string, unknown> => {
    const p: Record<string, unknown> = { value: 0 }
    for (const k of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) p[k] = () => p
    return p
  }
  const node = (extra: Record<string, unknown> = {}): Record<string, unknown> => ({ connect: (d: unknown) => d, disconnect: () => {}, ...extra })
  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    destination: node(),
    createGain: () => node({ gain: param() }),
    createMediaElementSource: () => node(),
    createOscillator: () => { played.oscs++; return node({ type: 'sine', frequency: param(), detune: param(), start: () => {}, stop: () => {}, addEventListener: () => {}, setPeriodicWave: () => {} }) },
    createBufferSource: () => node({ buffer: null, start: () => {}, stop: () => {}, addEventListener: () => {} }),
    createBiquadFilter: () => node({ frequency: param(), Q: param(), gain: param() }),
    createStereoPanner: () => node({ pan: param() }),
    createConvolver: () => node({ buffer: null }),
    createDynamicsCompressor: () => node(),
    createBuffer: (_c: number, len: number) => { const d = new Float32Array(len); return { getChannelData: () => d } },
    createPeriodicWave: () => ({})
  }
  return { audio: () => ({ ctx, music: node(), sfx: node(), voice: node() }), audioAllowed: () => true }
})

class FakeAudio {
  loop = false
  preload = ''
  currentTime = 0
  duration = 60
  constructor (readonly src: string) { played.urls.push(src) }
  play (): Promise<void> { return Promise.resolve() }
  pause (): void {}
  addEventListener (): void {}
}
vi.stubGlobal('Audio', FakeAudio)

describe('a dropped-in music file', () => {
  it('replaces its composed piece: the void streams unmade.ogg and composes nothing', async () => {
    const { MUSIC_FILES } = await import('@/game/assets/overrides')
    expect(MUSIC_FILES.get('unmade')).toMatch(/audio\/music\/unmade\.ogg$/)
    const { playMusic, stopMusic } = await import('@/game/audio/music')
    const { trackForTheme } = await import('@/game/audio/themes')
    played.oscs = 0
    playMusic(trackForTheme('void'))
    expect(played.urls.some(u => u.endsWith('audio/music/unmade.ogg'))).toBe(true)
    expect(played.oscs).toBe(0)
    stopMusic(0)
  })

  it('a piece with no file is composed as before', async () => {
    const { playMusic, stopMusic } = await import('@/game/audio/music')
    played.urls.length = 0
    played.oscs = 0
    playMusic('town')
    expect(played.urls).toEqual([])
    expect(played.oscs).toBeGreaterThan(0)
    stopMusic(0)
  })
})
