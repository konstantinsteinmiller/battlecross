// @vitest-environment jsdom
import { appendFileSync } from 'node:fs'
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

vi.mock('virtual:asset-overrides', () => ({ default: { sfx: [], music: [], textures: [], items: [], skills: [], portraits: [], ui: [] } }))

// The sequencer's audio graph: a context that counts instead of sounding.
const fake = vi.hoisted(() => {
  interface Src { t0: number; t1: number }
  const state = { oscs: [] as Src[], outs: 0, now: 0 }
  const param = () => {
    const p: Record<string, unknown> = { value: 0 }
    for (const k of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) p[k] = () => p
    return p
  }
  const node = (extra: Record<string, unknown> = {}) => ({
    connect: (d: unknown) => d,
    disconnect: () => {},
    addEventListener: () => {},
    ...extra
  })
  const source = (track: boolean) => {
    const s: Src = { t0: 0, t1: Infinity }
    if (track) state.oscs.push(s)
    return node({
      type: 'sine', frequency: param(), detune: param(), buffer: null, loop: false,
      setPeriodicWave: () => {},
      start: (t = 0) => { s.t0 = t },
      stop: (t = 0) => { s.t1 = t }
    })
  }
  const ctx = {
    sampleRate: 8000,
    get currentTime () { return state.now },
    destination: node(),
    createOscillator: () => source(true),
    createBufferSource: () => source(false),
    createGain: () => node({ gain: param() }),
    createBiquadFilter: () => node({ type: 'lowpass', frequency: param(), Q: param(), gain: param() }),
    createStereoPanner: () => node({ pan: param() }),
    createConvolver: () => node({ buffer: null }),
    createDynamicsCompressor: () => node(),
    createBuffer: (_c: number, len: number) => { const d = new Float32Array(len); return { getChannelData: () => d } },
    createPeriodicWave: () => ({})
  }
  return { state, ctx, node }
})

vi.mock('@/game/audio/engine', () => ({
  audio: () => ({ ctx: fake.ctx, music: fake.node(), sfx: fake.node(), voice: fake.node() }),
  audioAllowed: () => true
}))

import { getSong, songSeconds, stepSeconds, makeOut, playStep, SONG_IDS, PERCUSSION, OSC_BUDGET, OSC_BUDGET_BOSS, type Ev, type Song, type SongId } from '@/game/audio/songs'
import { songFor, shouldRotate, keepsPlaying, playMusic, playJingle, stopMusic, currentMusic, isMusicRunning, ROTATION_SIZE, ROTATE_AFTER_S } from '@/game/audio/music'
import { trackForTheme, THEME_IDS } from '@/game/audio/themes'
import { ZONES, TOWNS } from '@/game/data/zones'
import { useMusic, setMusicTrack, setBossMusic, isBossMusic } from '@/use/useSound'
import useUser from '@/use/useUser'
import { setPlatformAudioMuted } from '@/use/useGamePauseAudio'

const SONGS = SONG_IDS.map(getSong)
const of = (kind: Song['kind']): Song[] => SONGS.filter(s => s.kind === kind)
const AREAS = of('area')
const TRAVEL = of('travel')
const LOOPS = SONGS.filter(s => s.kind !== 'jingle')
const BOSS = getSong('boss')

/** Every note with the step it starts on. */
const notes = (s: Song): Array<Ev & { at: number }> => s.steps.flatMap((evs, at) => evs.map(e => ({ ...e, at })))
const pitched = (s: Song): Array<Ev & { at: number }> => notes(s).filter(e => !PERCUSSION.has(e.i))
/** `MUSIC_DIAG=<file> vitest run …` writes the measured figures (oscillator peaks, off-chord notes) to a file. */
const diag = (line: string): void => {
  if (process.env.MUSIC_DIAG) appendFileSync(process.env.MUSIC_DIAG, line + '\n')
}
const inKey = (s: Song, m: number): boolean => s.key.mode.includes((((m - s.key.tonic) % 12) + 12) % 12)

describe('which zone plays what', () => {
  it('every zone theme has an area theme of its own kind', () => {
    const used = new Set([...Object.values(ZONES), ...Object.values(TOWNS)].map(z => z.theme))
    expect(used.size).toBeGreaterThan(0)
    for (const theme of used) expect(THEME_IDS, theme).toContain(theme)
    for (const theme of THEME_IDS) {
      const id = trackForTheme(theme)
      expect(SONG_IDS, theme).toContain(id)
      expect(getSong(id).kind, theme).toBe('area')
    }
  })

  it('no area theme is left without a zone', () => {
    const played = new Set(THEME_IDS.map(trackForTheme))
    for (const s of AREAS) expect(played.has(s.id as never), s.id).toBe(true)
  })

  it('the towns play the town theme (the "Calm" music style is that theme everywhere)', () => {
    expect(trackForTheme('town')).toBe('town')
  })
})

describe('music rotation', () => {
  it('there is exactly one travelling piece, and it is not an area theme', () => {
    expect(TRAVEL).toHaveLength(1)
    expect(ROTATION_SIZE).toBe(TRAVEL.length + 1)
  })

  it('alternates the area theme with the travelling piece, for every area', () => {
    const travel = TRAVEL[0]!.id
    for (const a of AREAS) {
      expect([0, 1, 2, 3].map(s => songFor(a.id as never, s)), a.id).toEqual([a.id, travel, a.id, travel])
    }
  })

  it('the boss fight has its own song at every slot and never rotates away', () => {
    for (const s of [0, 1, 2]) expect(songFor('boss', s)).toBe('boss')
    expect(shouldRotate('boss', 'boss', 999)).toBe(false)
    expect(shouldRotate('town', 'boss', 999)).toBe(false)
  })

  it('hands over only once a song has played long enough — which one pass of any of them is', () => {
    expect(shouldRotate('meadow', 'meadow', ROTATE_AFTER_S - 1)).toBe(false)
    expect(shouldRotate('meadow', 'meadow', ROTATE_AFTER_S)).toBe(true)
    for (const s of [...AREAS, ...TRAVEL]) expect(shouldRotate('meadow', s.id, songSeconds(s)), s.id).toBe(true)
  })

  it('the travelling piece carries across areas; the area theme follows the area', () => {
    const travel = TRAVEL[0]!.id
    expect(keepsPlaying('meadow', travel, 1)).toBe(true)
    expect(keepsPlaying('town', travel, 1)).toBe(true)
    expect(keepsPlaying('meadow', 'town', 0)).toBe(false)
    expect(keepsPlaying('town', 'town', 0)).toBe(true)
    // A boss fight always takes over, and always gives the floor back.
    expect(keepsPlaying('boss', travel, 1)).toBe(false)
    expect(keepsPlaying('town', 'boss', 1)).toBe(false)
    expect(keepsPlaying('town', null, 0)).toBe(false)
  })
})

describe('the score: structure', () => {
  it('every song is whole bars of well-formed notes', () => {
    for (const s of SONGS) {
      expect(s.steps.length, s.id).toBe(s.bars * s.barSteps)
      expect([12, 16], s.id).toContain(s.barSteps)
      expect(s.loopBar, s.id).toBeGreaterThanOrEqual(0)
      expect(s.loopBar, s.id).toBeLessThan(s.bars)
      expect(notes(s).length, s.id).toBeGreaterThan(0)
      for (const e of notes(s)) {
        expect(Number.isFinite(e.m) && Number.isInteger(e.len) && e.len > 0 && e.v > 0 && e.v <= 1, `${s.id}/${e.i}@${e.at}`).toBe(true)
        if (!PERCUSSION.has(e.i)) expect(e.m >= 24 && e.m <= 96, `${s.id}/${e.i}@${e.at} pitch ${e.m}`).toBe(true)
      }
    }
  })

  it('the area themes and the travelling piece are slow, and long enough not to loop audibly fast', () => {
    for (const s of [...AREAS, ...TRAVEL]) {
      expect(s.bpm, s.id).toBeGreaterThanOrEqual(60)
      expect(s.bpm, s.id).toBeLessThanOrEqual(92)
      expect(songSeconds(s), s.id).toBeGreaterThanOrEqual(55)
      expect(s.loopBar, s.id).toBe(0)
    }
  })

  it('the boss is faster than every area theme, and repeats from its first full section, not its intro', () => {
    expect(BOSS.bpm).toBeGreaterThanOrEqual(100)
    expect(BOSS.bpm).toBeLessThanOrEqual(120)
    for (const s of AREAS) expect(BOSS.bpm, s.id).toBeGreaterThan(s.bpm)
    expect(BOSS.loopBar).toBeGreaterThan(0)
    expect((BOSS.bars - BOSS.loopBar) * BOSS.barSteps * stepSeconds(BOSS)).toBeGreaterThanOrEqual(55)
  })

  it('the jingles are short', () => {
    expect(of('jingle').map(s => s.id).sort()).toEqual(['defeat', 'victory'])
    for (const s of of('jingle')) expect(songSeconds(s), s.id).toBeLessThan(9)
  })
})

describe('the score: instrumentation', () => {
  it('every area theme has strings (solo or section) AND a piano', () => {
    for (const s of [...AREAS, ...TRAVEL]) {
      const insts = new Set(notes(s).map(e => e.i))
      expect(insts.has('violin') || insts.has('strings'), s.id).toBe(true)
      expect(insts.has('piano'), s.id).toBe(true)
    }
  })

  it('every looping song has a melody', () => {
    for (const s of LOOPS) expect(notes(s).filter(e => e.lead).length, s.id).toBeGreaterThan(20)
  })

  it('percussion is occasional in the area themes: a minority of the notes, and silent for whole sections', () => {
    for (const s of [...AREAS, ...TRAVEL]) {
      const all = notes(s)
      const perc = all.filter(e => PERCUSSION.has(e.i))
      expect(perc.length / all.length, s.id).toBeLessThan(0.3)
      const bars = new Set(perc.map(e => Math.floor(e.at / s.barSteps)))
      expect(bars.size / s.bars, s.id).toBeLessThanOrEqual(0.6)
    }
  })

  it('the boss theme has the big drums; the area themes leave them alone or barely touch them', () => {
    expect(notes(BOSS).filter(e => e.i === 'taiko').length).toBeGreaterThan(60)
    for (const s of AREAS) expect(notes(s).filter(e => e.i === 'taiko').length, s.id).toBeLessThan(20)
  })
})

describe('the score: harmony', () => {
  it('every pitched note is in its song\'s key, or is marked as leaving it on purpose', () => {
    for (const s of SONGS) {
      expect(s.key.mode.length, s.id).toBe(7)
      for (const e of pitched(s)) expect(inKey(s, e.m) || e.x === 1, `${s.id}: ${e.i} plays ${e.m} at step ${e.at}, outside ${s.key.name}`).toBe(true)
    }
  })

  it('a mark is only ever on a note that really is outside the key, and marks are rare', () => {
    for (const s of SONGS) {
      const all = pitched(s)
      const marked = all.filter(e => e.x)
      for (const e of marked) expect(inKey(s, e.m), `${s.id}: ${e.i} ${e.m} at ${e.at} is marked but in key`).toBe(false)
      expect(marked.length / all.length, s.id).toBeLessThan(0.06)
    }
  })

  it('the tune sits on the harmony: a melody note held a beat or more is a note of the chord under it', () => {
    const faults: string[] = []
    for (const s of LOOPS) {
      const all = pitched(s)
      const held = all.filter(e => e.lead && e.len >= 4)
      const off: string[] = []
      for (const e of held) {
        // The harmony is what the accompaniment sounds in the half-bar the note
        // starts in (no song changes chord faster than that) and while it is held:
        // an arpeggio or an oom-pah spells its chord over the half-bar, not at once.
        const half = s.barSteps / 2
        const from = Math.floor(e.at / half) * half
        const to = Math.max(from + half, e.at + e.len)
        const chord = new Set(all.filter(a => !a.lead && a.at < to && a.at + a.len > from).map(a => a.m % 12))
        if (chord.size > 0 && !chord.has(e.m % 12)) off.push(`${e.i} ${e.m} bar ${Math.floor(e.at / s.barSteps)}+${e.at % s.barSteps}`)
      }
      diag(`${s.id}: ${off.length}/${held.length} held melody notes off the chord — ${off.join(', ')}`)
      // The rest are suspensions, appoggiaturas and passing notes: allowed, but they are the exception.
      if (off.length / held.length > 0.15) faults.push(`${s.id}: ${off.length}/${held.length} off the chord — ${off.join(', ')}`)
    }
    expect(faults).toEqual([])
  })

  it('the tune moves like a tune: mostly by step or third, never by more than an octave', () => {
    for (const s of LOOPS) {
      for (const inst of new Set(notes(s).filter(e => e.lead).map(e => e.i))) {
        // One voice of the melody (the top line where the piano doubles in octaves).
        const line = notes(s).filter(e => e.lead && e.i === inst).sort((a, b) => a.at - b.at || b.m - a.m).filter((e, i, arr) => i === 0 || arr[i - 1]!.at !== e.at)
        let small = 0
        let joins = 0
        for (let i = 1; i < line.length; i++) {
          const a = line[i - 1]!
          const b = line[i]!
          // Only within a phrase: a rest of a bar or more is a new entry.
          if (b.at - (a.at + a.len) >= s.barSteps) continue
          const leap = Math.abs(b.m - a.m)
          expect(leap, `${s.id}/${inst}: ${a.m}→${b.m} at step ${b.at}`).toBeLessThanOrEqual(12)
          joins++
          if (leap <= 4) small++
        }
        if (joins > 8) expect(small / joins, `${s.id}/${inst}`).toBeGreaterThanOrEqual(0.6)
      }
    }
  })

  it('the string section leads its voices: chords of three or four, each voice moving a fourth at most, no parallel fifths or octaves', () => {
    const faults: string[] = []
    for (const s of SONGS) {
      const chords = new Map<number, Array<Ev & { at: number }>>()
      for (const e of notes(s).filter(n => n.i === 'strings')) chords.set(e.at, [...(chords.get(e.at) ?? []), e])
      const seq = [...chords.entries()].sort((a, b) => a[0] - b[0]).map(([at, c]) => ({ at, end: at + Math.max(...c.map(e => e.len)), m: c.map(e => e.m).sort((a, b) => a - b) }))
      for (const c of seq) expect(c.m.length, `${s.id}@${c.at}`).toBeLessThanOrEqual(4)
      for (let i = 1; i < seq.length; i++) {
        const a = seq[i - 1]!
        const b = seq[i]!
        // Voice leading is between chords that follow on, not across a section's rest.
        if (b.at - a.end > 2 || a.m.length !== b.m.length) continue
        const where = `${s.id} bar ${Math.floor(b.at / s.barSteps)}: ${a.m} → ${b.m}`
        for (let v = 0; v < a.m.length; v++) {
          if (Math.abs(b.m[v]! - a.m[v]!) > 5) faults.push(`${where}: voice ${v} leaps`)
          for (let w = v + 1; w < a.m.length; w++) {
            const before = (a.m[w]! - a.m[v]!) % 12
            const after = (b.m[w]! - b.m[v]!) % 12
            const moved = b.m[v] !== a.m[v] && Math.sign(b.m[v]! - a.m[v]!) === Math.sign(b.m[w]! - a.m[w]!)
            if (moved && before === after && (before === 7 || before === 0)) faults.push(`${where}: parallel ${before === 7 ? 'fifths' : 'octaves'}`)
          }
        }
      }
    }
    expect(faults).toEqual([])
  })
})

describe('the score: what it costs to play', () => {
  /** Play two passes through the counting context; the most oscillators alive at once. */
  const peakOscillators = (s: Song): number => {
    fake.state.oscs.length = 0
    const out = makeOut(fake.ctx as unknown as BaseAudioContext, fake.ctx.destination as unknown as AudioNode, s)
    const spb = stepSeconds(s)
    let t = 0.05
    for (let pass = 0; pass < (s.kind === 'jingle' ? 1 : 2); pass++) {
      for (let step = pass === 0 ? 0 : s.loopBar * s.barSteps; step < s.steps.length; step++) {
        playStep(out, s, step, t, spb)
        t += spb
      }
    }
    const edges = fake.state.oscs.flatMap(o => [[o.t0, 1], [o.t1, -1]] as Array<[number, number]>)
      .filter(e => Number.isFinite(e[0]))
      .sort((a, b) => a[0] - b[0] || a[1] - b[1])
    // Shared LFOs never stop: they are alive throughout.
    const always = fake.state.oscs.filter(o => !Number.isFinite(o.t1)).length
    let live = 0
    let peak = 0
    for (const [, d] of edges) {
      live += d
      if (live > peak) peak = live
    }
    out.dispose()
    return peak + always
  }

  it('no song ever sounds more oscillators than a mid-range phone can carry', () => {
    const over: string[] = []
    for (const s of SONGS) {
      const peak = peakOscillators(s)
      expect(peak, s.id).toBeGreaterThan(2)
      diag(`${s.id}: peaks at ${peak} oscillators`)
      if (peak > (s.kind === 'boss' ? OSC_BUDGET_BOSS : OSC_BUDGET)) over.push(`${s.id} peaks at ${peak} oscillators`)
    }
    expect(over).toEqual([])
  })

  it('every voice stops its sources: nothing but the shared LFOs is left running', () => {
    for (const s of SONGS) {
      peakOscillators(s)
      expect(fake.state.oscs.filter(o => !Number.isFinite(o.t1)).length, s.id).toBeLessThanOrEqual(4)
    }
  })
})

describe('the sequencer: boss fight in and out', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    stopMusic(0)
    vi.runOnlyPendingTimers()
  })
  afterEach(() => {
    stopMusic(0)
    vi.useRealTimers()
  })

  it('switches to the boss theme, stays on it when asked again, and returns to the area theme', () => {
    playMusic('meadow')
    expect(currentMusic()).toBe('meadow')
    playMusic('boss')
    expect(currentMusic()).toBe('boss')
    expect(isMusicRunning()).toBe(true)
    const before = fake.state.oscs.length
    playMusic('boss')
    playMusic('boss')
    expect(currentMusic()).toBe('boss')
    expect(fake.state.oscs.length, 'asking again must not restart the song').toBe(before)
    playMusic('meadow')
    expect(currentMusic()).toBe('meadow')
  })

  it('a boss fight that interrupts the travelling piece ends on the zone\'s own theme', () => {
    playMusic('ember')
    // Let the theme play out and hand over.
    const pass = songSeconds(getSong('ember'))
    for (let t = 0; t < pass + 2; t += 0.1) {
      fake.state.now += 0.1
      vi.advanceTimersByTime(100)
    }
    expect(currentMusic()).toBe('journey')
    playMusic('boss')
    expect(currentMusic()).toBe('boss')
    playMusic('ember')
    expect(currentMusic()).toBe('ember')
  })
})

describe('setBossMusic', () => {
  let wrapper: ReturnType<typeof mount> | null = null

  const start = (): ReturnType<typeof useMusic> => {
    let api!: ReturnType<typeof useMusic>
    wrapper = mount(defineComponent({
      setup () {
        api = useMusic()
        api.initMusic()
        return () => null
      }
    }))
    api.startBattleMusic()
    return api
  }
  /** What the sequencer is playing after a call (the composable asks the real sequencer). */
  const now = (): SongId | null => currentMusic()

  beforeEach(async () => {
    HTMLMediaElement.prototype.pause = () => {}
    wrapper?.unmount()
    wrapper = null
    setPlatformAudioMuted(false)
    useUser().userMusicTrack.value = 'trance'
    setBossMusic(false)
    setMusicTrack('town')
    await nextTick()
    stopMusic(0)
  })

  it('switches to the boss theme and back to the zone\'s track', () => {
    setMusicTrack('wildwood')
    start()
    expect(now()).toBe('wildwood')
    setBossMusic(true)
    expect(isBossMusic()).toBe(true)
    expect(now()).toBe('boss')
    setBossMusic(false)
    expect(now()).toBe('wildwood')
  })

  it('is idempotent: calling it every frame neither restarts nor stacks the song', () => {
    setMusicTrack('frost')
    start()
    setBossMusic(true)
    const before = fake.state.oscs.length
    for (let i = 0; i < 10; i++) setBossMusic(true)
    expect(now()).toBe('boss')
    expect(fake.state.oscs.length).toBe(before)
    for (let i = 0; i < 10; i++) setBossMusic(false)
    expect(now()).toBe('frost')
  })

  it('a new place has no boss awake: changing the track clears it, even to the same track', () => {
    setMusicTrack('deep')
    start()
    setBossMusic(true)
    setMusicTrack('sanctum')
    expect(isBossMusic()).toBe(false)
    expect(now()).toBe('sanctum')
    setBossMusic(true)
    setMusicTrack('sanctum') // a retry of the same zone
    expect(isBossMusic()).toBe(false)
    expect(now()).toBe('sanctum')
  })

  it('never starts music that was not playing', () => {
    setMusicTrack('bastion')
    setBossMusic(true) // no music was started
    expect(isMusicRunning()).toBe(false)
  })

  it('respects the mute: nothing sounds while muted, and the boss theme is what comes back', async () => {
    setMusicTrack('bastion')
    start()
    setPlatformAudioMuted(true)
    await nextTick()
    expect(isMusicRunning()).toBe(false)
    setBossMusic(true)
    expect(isMusicRunning()).toBe(false)
    setPlatformAudioMuted(false)
    await nextTick()
    expect(now()).toBe('boss')
  })

  it('a result jingle ends the fight music; the next start plays the zone\'s own theme again', () => {
    setMusicTrack('ember')
    const api = start()
    setBossMusic(true)
    expect(now()).toBe('boss')
    playJingle('defeat')
    expect(isMusicRunning()).toBe(false)
    // The retry: same zone, so the track "changes" to itself, then the start.
    setMusicTrack('ember')
    api.startBattleMusic()
    expect(isBossMusic()).toBe(false)
    expect(now()).toBe('ember')
  })

  it('the "Calm" music style keeps the town theme through a boss fight', () => {
    useUser().userMusicTrack.value = 'cozy'
    setMusicTrack('ember')
    start()
    expect(now()).toBe('town')
    setBossMusic(true)
    expect(now()).toBe('town')
    setBossMusic(false)
    expect(now()).toBe('town')
  })
})
