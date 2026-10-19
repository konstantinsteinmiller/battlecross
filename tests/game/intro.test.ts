import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BUILD_CAP_S, FINALE_AT, HOLD_SKIP_S, INTRO_BELT, INTRO_CASTS, INTRO_LENGTH, INTRO_LINES, SCENE_AT,
  createHoldSkip, createIntroClock, lineAt, titleAt, veilAt
} from '@/game/intro/script'
import { SKILL_BY_ID } from '@/game/data/skills'
import { SPOKEN } from '@/game/data/dialogs'
import { linesOf } from '@/game/dialog/manifest'
import { CARDS } from '@/game/audio/voiceCards'
import en from '@/i18n/locales/en'

/**
 * ─── The intro (roadmap #130) ────────────────────────────────────────────────
 *
 * Behind a build flag, lazy, at most 25 seconds, skipped by holding Space or
 * the button for 1.5 s, narrated in every shipped language.
 */

const SRC = resolve(__dirname, '../../src')
const read = (p: string): string => readFileSync(resolve(SRC, p), 'utf8')

describe('the flag', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

  it('is off unless the build says VITE_INTRO_ENABLED=true', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_INTRO_ENABLED', '')
    expect((await import('@/game/intro/state')).INTRO_ENABLED).toBe(false)
    vi.resetModules()
    vi.stubEnv('VITE_INTRO_ENABLED', 'false')
    expect((await import('@/game/intro/state')).INTRO_ENABLED).toBe(false)
    vi.resetModules()
    vi.stubEnv('VITE_INTRO_ENABLED', 'true')
    expect((await import('@/game/intro/state')).INTRO_ENABLED).toBe(true)
  })

  it('reads the env as a literal comparison, so a build with it off folds every branch away', () => {
    expect(read('game/intro/state.ts')).toContain("import.meta.env.VITE_INTRO_ENABLED === 'true'")
  })

  it('the switch module pulls nothing in but Vue (it sits on the startup path)', () => {
    const imports = [...read('game/intro/state.ts').matchAll(/^import\s+[^'"]*from\s+['"]([^'"]+)['"]/gm)].map(m => m[1])
    expect(imports).toEqual(['vue'])
  })

  it('the scene never mounts or fetches the intro with the flag off: both chunks only behind INTRO_ENABLED, never imported statically', () => {
    const scene = read('views/GameScene.vue')
    // The overlay: an async component, mounted only while it plays.
    expect(scene).toContain("defineAsyncComponent(() => import('@/components/screens/intro/IntroLayer.vue'))")
    expect(scene).toMatch(/IntroLayer\(v-if="introOn"\)/)
    expect(scene).toContain('const introOn = computed(() => INTRO_ENABLED && introPlaying.value)')
    // The runner: a dynamic import inside the player, which returns first when the flag is off.
    const play = scene.slice(scene.indexOf('const playIntro'), scene.indexOf('const replayIntro'))
    expect(play).toMatch(/if \(!INTRO_ENABLED \|\| introPlaying\.value\) return[\s\S]*import\('@\/game\/intro\/runner'\)/)
    // The first boot asks the flag before anything else.
    expect(scene).toMatch(/if \(INTRO_ENABLED && !PREVIEW_ON && isFreshProfile\(\) && profile\.tips\[INTRO_TIP\] !== true\)/)
    // No static import of either chunk anywhere in the app.
    const files: string[] = []
    const walk = (dir: string): void => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = resolve(dir, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.(ts|vue)$/.test(e.name)) files.push(p)
      }
    }
    walk(SRC)
    const offenders = files.filter((f) => {
      if (/[\\/]intro[\\/]|IntroLayer\.vue$/.test(f)) return false
      const src = readFileSync(f, 'utf8')
      return /^import\s+(?!type\b)[^'"]*from\s+['"][^'"]*(intro\/runner|IntroLayer\.vue)['"]/m.test(src)
    })
    expect(offenders).toEqual([])
  })

  it('every env file the repo documents ships it off', () => {
    const ex = readFileSync(resolve(__dirname, '../../.env.example'), 'utf8')
    expect(ex).toMatch(/^VITE_INTRO_ENABLED=false$/m)
  })
})

describe('the script', () => {
  it('lasts at most 25 seconds', () => {
    expect(INTRO_LENGTH).toBeLessThanOrEqual(25)
    for (const l of INTRO_LINES) expect(l.at).toBeLessThan(INTRO_LENGTH)
    for (const c of INTRO_CASTS) expect(c.at).toBeLessThan(INTRO_LENGTH)
  })

  it('shows a full build: five skills in the belt, every cast from it, the finale last', () => {
    expect(INTRO_BELT).toHaveLength(5)
    for (const id of INTRO_BELT) expect(SKILL_BY_ID[id]?.kind, id).toBe('active')
    for (const c of INTRO_CASTS) expect(c.slot).toBeLessThan(INTRO_BELT.length)
    expect(new Set(INTRO_CASTS.map(c => c.slot)).size).toBe(INTRO_BELT.length)
    const last = INTRO_CASTS[INTRO_CASTS.length - 1]!
    expect(last.at).toBe(FINALE_AT)
    expect(INTRO_BELT[last.slot]).toBe('cataclysm')
    // A slot is not cast again before its cooldown is over.
    const at: Record<number, number> = {}
    for (const c of INTRO_CASTS) {
      if (at[c.slot] !== undefined) expect(c.at - at[c.slot]!, `slot ${c.slot}`).toBeGreaterThanOrEqual(SKILL_BY_ID[INTRO_BELT[c.slot]!]!.cd)
      at[c.slot] = c.at
    }
  })

  it('gives each narration line time to be said before the next (about 2.6 words a second)', () => {
    const text = (id: string): string => id.split('.').reduce<any>((o, k) => o?.[k], en)
    for (let i = 0; i < INTRO_LINES.length; i++) {
      const words = text(INTRO_LINES[i]!.id).split(/\s+/).length
      const until = INTRO_LINES[i + 1]?.at ?? INTRO_LENGTH
      expect(until - INTRO_LINES[i]!.at, INTRO_LINES[i]!.id).toBeGreaterThanOrEqual(words / 2.6)
    }
  })

  it('subtitles: each line holds until the next, none after the end; the title opens and closes it', () => {
    expect(lineAt(0)).toBe(-1)
    expect(lineAt(INTRO_LINES[0]!.at)).toBe(0)
    expect(lineAt(INTRO_LINES[1]!.at - 0.01)).toBe(0)
    expect(lineAt(INTRO_LENGTH - 0.01)).toBe(INTRO_LINES.length - 1)
    expect(lineAt(INTRO_LENGTH)).toBe(-1)
    expect(titleAt(1)).toBe(true)
    expect(titleAt(SCENE_AT + 2)).toBe(false)
    expect(titleAt(INTRO_LENGTH - 0.5)).toBe(true)
  })

  it('stays black until the place is built, then fades in, and out again at the end', () => {
    expect(veilAt(SCENE_AT + 2, false)).toBe(1)
    expect(veilAt(1, true)).toBe(1)
    expect(veilAt(SCENE_AT + 2, true)).toBe(0)
    expect(veilAt(INTRO_LENGTH, true)).toBe(1)
  })

  it('the clock holds at the scene until the place is built, and ends at the length', () => {
    const c = createIntroClock()
    for (let i = 0; i < 200; i++) c.tick(0.05, false)
    expect(c.t).toBe(SCENE_AT)
    expect(c.done).toBe(false)
    for (let i = 0; i < 1000; i++) c.tick(0.05, true)
    expect(c.t).toBe(INTRO_LENGTH)
    expect(c.done).toBe(true)
    // A long stall (a tab in the background) is one tenth of a second, not a jump.
    const d = createIntroClock()
    d.tick(5, true)
    expect(d.t).toBeCloseTo(0.1)
    expect(BUILD_CAP_S).toBeGreaterThan(SCENE_AT)
  })
})

describe('hold to skip', () => {
  const run = (h: ReturnType<typeof createHoldSkip>, seconds: number, step = 1 / 60): boolean => {
    let done = false
    for (let t = 0; t < seconds - 1e-9; t += step) done = h.tick(step) || done
    return done
  }

  it('skips after 1.5 s held, the ring filling on the way', () => {
    expect(HOLD_SKIP_S).toBe(1.5)
    const h = createHoldSkip()
    h.press()
    expect(run(h, 0.75)).toBe(false)
    expect(h.progress).toBeCloseTo(0.5, 1)
    expect(run(h, 0.8)).toBe(true)
    expect(h.done).toBe(true)
    expect(h.progress).toBe(1)
  })

  it('a tap, or a hold let go too soon, never skips: the ring drains back', () => {
    const h = createHoldSkip()
    h.press()
    run(h, 1.2)
    h.release()
    expect(h.holding).toBe(false)
    expect(run(h, 2)).toBe(false)
    expect(h.progress).toBe(0)
    // Pressed again, it needs the whole 1.5 s again.
    h.press()
    expect(run(h, 1.4)).toBe(false)
    expect(run(h, 0.15)).toBe(true)
  })

  it('a dropped frame does not count as a long hold', () => {
    const h = createHoldSkip()
    h.press()
    expect(h.tick(3)).toBe(false)
  })
})

describe('the narration', () => {
  const intro = SPOKEN.find(c => c.id === 'intro')!

  it('is in the voice manifest, in its own narrator\'s voice, with a card', () => {
    expect(intro).toBeTruthy()
    expect(linesOf(intro).map(l => l.id)).toEqual(INTRO_LINES.map(l => l.id))
    expect(intro.voice).toBe('chronicler')
    expect(CARDS.chronicler?.gender).toBe('male')
  })

  it('is a voiced core line in every voiced language (data/voice-core.json)', () => {
    const core = JSON.parse(readFileSync(resolve(__dirname, '../../data/voice-core.json'), 'utf8')) as { patterns: string[] }
    for (const l of INTRO_LINES) expect(core.patterns.some(p => new RegExp(p).test(l.id)), l.id).toBe(true)
  })

  it('every visible word of it is in every shipped locale (skip, hints, subtitles)', async () => {
    const keys = ['intro.narrator', 'intro.skip', 'intro.holdKey', 'intro.holdTouch', 'intro.replay', ...INTRO_LINES.map(l => l.id)]
    const dir = resolve(SRC, 'i18n/locales')
    const files = readdirSync(dir).filter(f => f.endsWith('.ts'))
    expect(files.length).toBeGreaterThan(30)
    for (const f of files) {
      const msgs = (await import(/* @vite-ignore */ resolve(dir, f))).default
      for (const k of keys) {
        const v = k.split('.').reduce<any>((o, p) => o?.[p], msgs)
        expect(typeof v === 'string' && v.trim().length > 0, `${f}: ${k}`).toBe(true)
      }
      expect(String(msgs.intro.holdKey), `${f}: intro.holdKey`).toContain('{key}')
    }
  })
})
