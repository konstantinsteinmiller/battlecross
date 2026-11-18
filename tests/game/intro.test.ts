import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  BUILD_CAP_S, FADE_IN_S, FADE_OUT_AT, FIREBALLS, INTRO_ACTS, INTRO_BEAST, INTRO_DRAGON, INTRO_LENGTH, INTRO_MAGE, LABEL_AT, PRE_S, SCENE_AT,
  INTRO_ZOOMS, createIntroClock, labelAt, veilAt
} from '@/game/intro/script'
import { ENEMY_BY_ID, MINIONS } from '@/game/data/enemies'
import { SKILL_BY_ID } from '@/game/data/skills'
import { LOOKS } from '@/game/gfx/rigs/looks'

/**
 * ─── The intro (roadmap #130, the film of #183) ──────────────────────────────
 *
 * Behind a build flag, lazy, after the hero choice (whose click gives the page
 * focus), skipped by one tap or Space, and over with "A few hours later…". It
 * opens with the player's own fight against the dragon (#217): two fireballs
 * and he is out; then the two heroes, the camera on the dragon, which fights back.
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
    expect(scene).toContain("defineAsyncComponent(() => import('@/components/screens/intro/IntroLayer.vue'))")
    expect(scene).toMatch(/IntroLayer\(v-if="introOn \|\| introBoot"\)/)
    expect(scene).toContain('const introOn = computed(() => INTRO_ENABLED && introPlaying.value)')
    const play = scene.slice(scene.indexOf('const playIntro'), scene.indexOf('const onHeroPicked'))
    expect(play).toMatch(/if \(!INTRO_ENABLED \|\| introPlaying\.value\) return[\s\S]*import\('@\/game\/intro\/runner'\)/)
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

  it('every env file the repo documents ships it on (#183 follow-up: all builds)', () => {
    const ex = readFileSync(resolve(__dirname, '../../.env.example'), 'utf8')
    expect(ex).toMatch(/^VITE_INTRO_ENABLED=true$/m)
  })
})

describe('the order: the hero choice first, then the film (#183)', () => {
  const scene = read('views/GameScene.vue')

  it('the boot no longer plays the intro in front of the first scene', () => {
    expect(scene).not.toMatch(/await playIntro\(first\)/)
  })

  it('the hero choice\'s end starts it for a save that has not seen it', () => {
    expect(scene).toMatch(/HeroChoice\(v-if="!introOn" @done="onHeroPicked"\)/)
    const handler = scene.slice(scene.indexOf('const onHeroPicked'), scene.indexOf('/** "Watch the intro"'))
    expect(handler).toMatch(/INTRO_ENABLED && !PREVIEW_ON && profile\.tips\[INTRO_TIP\] !== true\) void playIntro\(\)/)
  })

  it('the choice says it is done only once its pick is made, never when it just steps aside', () => {
    const choice = read('components/screens/hero/HeroChoice.vue')
    expect(choice).toContain("defineEmits<{ (e: 'done'): void }>()")
    expect(choice.match(/emit\('done'\)/g)).toHaveLength(1)
    expect(choice).toMatch(/stage\.value = 'done'; emit\('done'\)/)
  })
})

describe('the first boot (#189)', () => {
  it("a new save with the intro on builds the intro's scene first, never the opening level, behind the hero choice", () => {
    const flowSrc = read('game/flow.ts')
    const boot = flowSrc.slice(flowSrc.indexOf('export const createBootMode'), flowSrc.indexOf('export const startFirstLevel'))
    expect(boot).toMatch(/INTRO_ENABLED && !PREVIEW_ON && isFreshProfile\(\) && profile\.tips\[INTRO_TIP\] !== true/)
    expect(boot.indexOf("import('./intro/runner')")).toBeGreaterThan(0)
    expect(boot.indexOf('prepareIntro')).toBeLessThan(boot.indexOf('buildNode(node, onProgress)'))
  })

  it('the film plays on that scene, and the opening level is built behind its last black', () => {
    const runner = read('game/intro/runner.ts')
    expect(runner).toMatch(/export const prepareIntro/)
    expect(runner).toMatch(/const pre = prepared/)
    expect(runner).toMatch(/building\.then\(\(lvl\) => enterFirstLevel\(lvl\)\)/)
    // …built when the screen is black and the game's loop is stopped, never beside a live scene (the ground is a global).
    expect(runner).toMatch(/introView\.veil >= 1\) \{\s*app\.setWanted\(false\)\s*building = buildFirstLevel\(\)/)
    expect(read('game/flow.ts')).toMatch(/export const startFirstLevel = async \(\): Promise<void> => \{\s*const mode = await buildNode\('plains'/)
  })

  it('only the dragon is left in the picture and no wave can come, and the camera is pulled back', () => {
    const runner = read('game/intro/runner.ts')
    expect(runner).toMatch(/for \(const e of \[\.\.\.sim\.units\]\) if \(e\.team === 1\) sim\.dismiss\(e\)\s*sim\.wave\.rest = 1e9/)
    expect(INTRO_ZOOMS[0]!.to).toBeGreaterThan(1.1)
  })

  it('the sounds are gated while it plays and ungated when it ends', () => {
    const runner = read('game/intro/runner.ts')
    expect(runner).toMatch(/setSfxGate\(soundGate\(\)\)/)
    expect(runner).toMatch(/setSfxGate\(null\)/)
  })
})

describe('the music: the fight\'s own cue (#209)', () => {
  const runner = read('game/intro/runner.ts')

  it('starts with the film on both paths (the boot\'s scene, a replay\'s), cut to the film\'s clock', () => {
    // …which starts when the player's part is over (#217): the place's own music until then.
    expect(runner).toMatch(/const cueTime = \(\): number => clock\.t - PRE_S - INTRO_FIGHT_AT/)
    expect(runner).toMatch(/if \(pre\) \{ startGameMusic\(\)/)
    expect(runner).toMatch(/if \(!cueOn && t >= PRE_S\) \{ cueOn = true; startIntroMusic\(cueTime\) \}/)
  })

  it('stops when the film ends or is skipped, and the place\'s music is named only once it is over', () => {
    const fin = runner.slice(runner.indexOf('const finish = '), runner.indexOf('end = finish'))
    expect(fin).toMatch(/stopIntroMusic\(clock\.done \? CUE_OUT_END_S : CUE_OUT_SKIP_S\)/)
    // The place's track is set by what follows the film (`settleAfterIntro`, or the opening level's `enter`), never at its start.
    expect(runner.match(/setMusicTrack\(/g)).toHaveLength(1)
    expect(runner).toMatch(/export const settleAfterIntro[^\n]*\n\s*if \(mode instanceof ZoneMode\) setMusicTrack/)
  })
})

describe('the script', () => {
  it('is the players fight and then a film of at most 12 seconds', () => {
    expect(INTRO_LENGTH - PRE_S).toBeLessThanOrEqual(12)
    expect(INTRO_LENGTH - PRE_S).toBeGreaterThanOrEqual(10)
    expect(PRE_S).toBeLessThanOrEqual(8)
  })

  it('opens with the dragons two fireballs, the second knocking the player out, before the two heroes arrive (#217)', () => {
    const fires = INTRO_ACTS.filter(b => b.act === 'fire')
    expect(fires.map(b => b.at)).toEqual([...FIREBALLS])
    expect(FIREBALLS).toHaveLength(2)
    for (const b of fires) { expect(b.who).toBe('dragon'); expect(b.at).toBeLessThan(PRE_S) }
    // Nothing of the two heroes happens until the player's part is over.
    for (const b of INTRO_ACTS.filter(b => b.who !== 'dragon')) expect(b.at).toBeGreaterThanOrEqual(PRE_S)
  })

  it('the dragon fights back in the film: it answers both heroes and stomps, and falls only at the slay (#217)', () => {
    const slay = INTRO_ACTS.find(b => b.act === 'slay')!
    const counters = INTRO_ACTS.filter(b => b.act === 'counter')
    expect(counters.map(b => b.who).sort()).toEqual(['beast', 'mage'])
    for (const b of [...counters, INTRO_ACTS.find(b => b.act === 'stomp')!]) { expect(b).toBeTruthy(); expect(b.at).toBeLessThan(slay.at) }
  })

  it('the film frames the hero and the dragon together, and the player has the hero until the knock-out (#217)', () => {
    const runner = read('game/intro/runner.ts')
    expect(runner).toContain('m.camShot = frameBoth(cast.hero, cast.dragon)')
    expect(read('game/modes/zoneMode.ts')).toContain('const shot = this.camShot ?? ')
    // The game's own input walks him (not a fresh one nobody reaches), and the surface is live under the film until he is out.
    expect(runner).toContain('ZoneMode.create(setup(), gameInput, NONE)')
    expect(runner).toContain('introPlayable.value = false')
    expect(read('views/GameScene.vue')).toContain('v-show="(!introOn || introPlayable)')
  })

  it('has its beats in order, inside the film, the dragon falling before they leave', () => {
    const times = INTRO_ACTS.map(b => b.at)
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    for (const b of INTRO_ACTS) { expect(b.at).toBeGreaterThanOrEqual(0); expect(b.at).toBeLessThan(INTRO_LENGTH) }
    const slay = INTRO_ACTS.find(b => b.act === 'slay')!
    const flee = INTRO_ACTS.find(b => b.act === 'flee')!
    expect(slay.at).toBeLessThan(flee.at)
    expect(INTRO_ACTS.filter(b => b.act === 'slay')).toHaveLength(1)
    // Both heroes show their school before the dragon falls: the elementalist's fire, frost, lightning and storm, the beast caller's pack and hawk.
    const before = INTRO_ACTS.filter(b => b.at < slay.at)
    for (const a of ['roar', 'summon', 'close', 'slap']) expect(before.some(b => b.act === a), a).toBe(true)
    // A calm film (#189): a handful of slaps, no spell storm, and the one in the snow gets up after they have gone.
    expect(before.filter(b => b.act === 'slap').length).toBeGreaterThanOrEqual(4)
    expect(INTRO_ACTS.find(b => b.act === 'rise')!.at).toBeGreaterThan(flee.at)
  })

  it('uses only what the game has: the drake, the two masters\' looks, the minions and the skills whose poses it borrows', () => {
    expect(ENEMY_BY_ID[INTRO_DRAGON]).toBeTruthy()
    expect(LOOKS[INTRO_MAGE]).toBeTruthy()
    expect(LOOKS[INTRO_BEAST]).toBeTruthy()
    for (const m of ['packWolf', 'packBear', 'packHawk']) expect(MINIONS[m], m).toBeTruthy()
    for (const s of ['wildHunt', 'fireball', 'frostLance', 'callHawk', 'chainSpark', 'elementalConvergence']) expect(SKILL_BY_ID[s], s).toBeTruthy()
  })

  it('stays black until the place is built, fades in, and goes dark for the label', () => {
    expect(veilAt(0, false)).toBe(1)
    expect(veilAt(5, false)).toBe(1)
    expect(veilAt(0, true)).toBe(1)
    expect(veilAt(FADE_IN_S, true)).toBe(0)
    expect(veilAt(5, true)).toBe(0)
    expect(veilAt(FADE_OUT_AT, true)).toBe(0)
    expect(veilAt(LABEL_AT + 0.5, true)).toBe(1)
    expect(veilAt(INTRO_LENGTH, true)).toBe(1)
  })

  it('"A few hours later…" appears on the dark and is fully up before the end', () => {
    expect(labelAt(LABEL_AT - 0.01)).toBe(0)
    expect(labelAt(LABEL_AT + 0.25)).toBeGreaterThan(0)
    expect(labelAt(LABEL_AT + 0.5)).toBe(1)
    expect(LABEL_AT + 0.5).toBeLessThan(INTRO_LENGTH - 1)
  })

  it('the clock holds at the scene until the place is built, and ends at the length', () => {
    const c = createIntroClock()
    c.tick(0.05, false)
    expect(c.t).toBe(SCENE_AT)
    for (let i = 0; i < 400; i++) c.tick(0.1, true)
    expect(c.t).toBe(INTRO_LENGTH)
    expect(c.done).toBe(true)
    expect(BUILD_CAP_S).toBeLessThanOrEqual(15)
  })

  it('a dropped frame does not jump the film', () => {
    const c = createIntroClock()
    c.tick(5, true)
    expect(c.t).toBeLessThanOrEqual(0.1 + 1e-9)
  })
})

describe('skipping', () => {
  it('is one tap on the button, or Space, both ending the film at once', () => {
    const layer = read('components/screens/intro/IntroLayer.vue')
    expect(layer).toContain('@click="skipIntro"')
    expect(layer).toMatch(/e\.code !== 'Space'/)
    expect(layer).toMatch(/if \(!e\.repeat && introView\.canSkip\) skipIntro\(\)/)
    // Not once the label and the load are up (#189): the button goes, and Space does nothing.
    expect(layer).toContain('introBoot && introView.canSkip')
    expect(layer).toContain("addEventListener('keydown', onDown, true)")
    const runner = read('game/intro/runner.ts')
    expect(runner).toMatch(/export const skipIntro = \(\): void => \{ if \(introView\.t < NO_SKIP_AT\) end\?\.\(\) \}/)
  })

  it('writes the one flag when it ends or is skipped, and nothing else of the profile', () => {
    const runner = read('game/intro/runner.ts')
    expect(runner).toContain('profile.tips[INTRO_TIP] = true')
    expect(runner).not.toMatch(/profile\.(level|hero|inv)\s*=/)
  })
})

describe('the words', () => {
  it('"A few hours later…" and the skip are in every shipped locale', async () => {
    const dir = resolve(SRC, 'i18n/locales')
    const files = readdirSync(dir).filter(f => f.endsWith('.ts'))
    expect(files.length).toBeGreaterThan(30)
    for (const f of files) {
      const msgs = (await import(/* @vite-ignore */ resolve(dir, f))).default
      for (const k of ['intro.skip', 'intro.later']) {
        // (He wakes a few hours later, not a month: no locale still says a month.)
        const v = k.split('.').reduce<any>((o, p) => o?.[p], msgs)
        expect(typeof v === 'string' && v.trim().length > 0, `${f}: ${k}`).toBe(true)
      }
    }
  })
})

describe('the waking after the film', () => {
  it('lays the hero on the opening level\'s ground and lets him get up before any order is his', () => {
    const zone = read('game/modes/zoneMode.ts')
    expect(read('game/intro/runner.ts')).toContain('introWake.pending = true')
    expect(zone).toContain('if (first && this.wakeT < 0) this.handleInput()')
    expect(zone).toContain("applyStatus(this.sim, u, 'knockdown', 1e9")
    expect(zone).toContain("removeStatus(u, 'knockdown')")
  })
})

describe('the film never touches the save', () => {
  it("its scene banks no XP or gold: the save stays a first-timer's, so the opening level is the tutorial", () => {
    const zone = read('game/modes/zoneMode.ts')
    expect(zone).toMatch(/bankRunXp\(\): void \{\s*if \(!this\.banksRun\) return/)
    expect(zone).toMatch(/bankRunGold\(\): void \{\s*if \(!this\.banksRun\) return/)
    expect(read('game/intro/runner.ts')).toMatch(/ZoneMode\.create\(setup\(\), gameInput, NONE\)\s*[^\n]*\n\s*m\.banksRun = false/)
  })
})
