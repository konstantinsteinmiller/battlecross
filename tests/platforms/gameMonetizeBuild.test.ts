// @vitest-environment jsdom
// The GameMonetize build, Step 0 of its release audit: the pieces that make
// `vite build --mode gamemonetize` a GameMonetize build and keep GameMonetize
// out of every other one. Most of them are build-time branches no unit test
// can import (they are DCE'd per platform by design), so they are pinned by
// SOURCE here and proven on the built bundle by `scripts/portal-qa.mjs` and
// `scripts/gamemonetize-release.mjs`.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8')
const exportsOf = (rel: string): string[] => {
  const src = read(rel)
  const names = [...src.matchAll(/^export\s+(?:const|function|let)\s+(\w+)/gm)].map((m) => m[1]!)
  if (/^export\s+default\b/m.test(src)) names.push('default')
  return names.sort()
}

describe('GameMonetize build wiring', () => {
  it('the platform module is a descriptor and nothing else', () => {
    // `platforms/index.ts` imports every descriptor statically; one re-export
    // of the plugin here puts the SDK URL into every build's module graph.
    const src = read('src/platforms/gamemonetize/index.ts')
    expect(src).not.toMatch(/^export\s*\{/m)
    expect(src).not.toMatch(/from '@\//)
    expect(src).toContain("envFlag: 'GAME_MONETIZE'")
  })

  it('no child-directed ad flag anywhere in the GameMonetize path (Tauri / app-store only)', async () => {
    const { platform } = await import('@/platforms/gamemonetize')
    expect(platform.capabilities.childDirectedAdSignal).toBe(false)
    expect(read('src/utils/gameMonetizePlugin.ts')).not.toMatch(/tagForChildDirectedTreatment\s*:/)
  })

  it('the plugin makes no request of its own besides the SDK (no ad-block probe)', () => {
    const src = read('src/utils/gameMonetizePlugin.ts')
    expect(src).not.toMatch(/\bfetch\(/)
    expect(src).not.toContain('googlesyndication.com')
    expect(src).not.toContain('2mdn.net')
    expect(src).toContain("'https://api.gamemonetize.com/sdk.js'")
  })

  it('every other build swaps the plugin AND the provider for stubs', () => {
    const cfg = read('vite.config.ts')
    const block = cfg.slice(cfg.indexOf("env.VITE_APP_GAME_MONETIZE === 'true' ? {} : {"))
    const end = block.indexOf('}),')
    const aliases = block.slice(0, end)
    expect(aliases).toContain("'@/use/ads/GameMonetizeProvider'")
    expect(aliases).toContain("'@/utils/gameMonetizePlugin'")
    expect(aliases).toContain('gameMonetizePlugin.stub.ts')
  })

  it('the plugin stub exports exactly what the real plugin exports', () => {
    expect(exportsOf('src/utils/gameMonetizePlugin.stub.ts')).toEqual(exportsOf('src/utils/gameMonetizePlugin.ts'))
    // …and names no GameMonetize URL or SDK global itself.
    const stub = read('src/utils/gameMonetizePlugin.stub.ts')
    expect(stub).not.toContain('gamemonetize.com')
    expect(stub).not.toContain('SDK_OPTIONS')
  })

  it('the exactly-one-platform assertion knows the flag', () => {
    expect(read('vite.config.ts')).toMatch(/PLATFORM_FLAGS = \[[^\]]*'VITE_APP_GAME_MONETIZE'/)
  })

  it('both resolvers have a GameMonetize arm on a static env literal', () => {
    expect(read('src/platforms/resolveAdProvider.ts')).toContain("import.meta.env.VITE_APP_GAME_MONETIZE === 'true') return createGameMonetizeProvider()")
    expect(read('src/platforms/resolveSaveStrategy.ts')).toMatch(/import\.meta\.env\.VITE_APP_GAME_MONETIZE === 'true'\) \{[\s\S]*?GameMonetizeStrategy/)
  })

  it('the build is refused for upload without a game id', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    expect(pkg.scripts['build:gamemonetize']).toContain('scripts/gamemonetize-release.mjs')
    const gate = read('scripts/gamemonetize-release.mjs')
    expect(gate).toMatch(/fail\('game id'/)
  })

})

// ─── The ad layer → pause bridge ─────────────────────────────────────────────
//
// The plugin PUBLISHES `isPortalAdOpen`; App.vue's one watcher turns it into
// the platform pause. A plugin that drove the gate itself, or a second watcher,
// is how a game ends up resumed under an ad (or paused behind one that is gone).

vi.mock('@/use/useUser', () => ({ isGameMonetize: true }))
vi.mock('@/use/useMatch', () => {
  const { ref } = require('vue')
  return { isDebug: ref(false) }
})
vi.mock('@/utils/save/GameMonetizeStrategy', () => ({ GameMonetizeStrategy: class {} }))

const emit = (name: string): void => {
  const onEvent = (window as any).SDK_OPTIONS?.onEvent
  if (typeof onEvent === 'function') onEvent({ name })
}

describe('GameMonetize ad layer → pause gate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubEnv('VITE_GAME_ID', 'test-game')
    delete (window as any).sdk
    delete (window as any).SDK_OPTIONS
  })
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.unstubAllEnvs()
    delete (window as any).sdk
    delete (window as any).SDK_OPTIONS
    document.getElementById('gamemonetize-sdk')?.remove()
  })

  const init = async () => {
    vi.resetModules()
    const pause = await import('@/use/useGamePause')
    const plugin = await import('@/utils/gameMonetizePlugin')
    ;(window as any).sdk = { showBanner: vi.fn() }
    const ready = plugin.gameMonetizePlugin()
    emit('SDK_READY')
    await ready
    return { pause, plugin }
  }

  it('SDK_GAME_PAUSE / SDK_GAME_START move the published ref and nothing else', async () => {
    const { pause } = await init()
    emit('SDK_GAME_PAUSE')
    expect(pause.isPortalAdOpen.value).toBe(true)
    // The plugin does not drive the gate: that is App.vue's watcher.
    expect(pause.isPlatformPaused.value).toBe(false)
    expect(pause.isAdShowing.value).toBe(false)
    emit('SDK_GAME_START')
    expect(pause.isPortalAdOpen.value).toBe(false)
  })

  it('an ad cycle that ends on the hard cap lowers the ref itself', async () => {
    const { pause, plugin } = await init()
    const done = plugin.showMidgameAdGM()
    emit('SDK_GAME_PAUSE')               // the ad opened…
    expect(pause.isPortalAdOpen.value).toBe(true)
    await vi.advanceTimersByTimeAsync(46_000)  // …and the SDK never said it closed
    await done
    expect(pause.isPortalAdOpen.value).toBe(false)
  })

  it('SDK_OPTIONS carries the game id and the callback, and no child-directed flag', async () => {
    await init()
    const opts = (window as any).SDK_OPTIONS
    expect(opts.gameId).toBe('test-game')
    expect(typeof opts.onEvent).toBe('function')
    expect(Object.keys(opts).sort()).toEqual(['gameId', 'onEvent'])
  })

  it('App.vue holds the ONE watcher, and it turns the ref into the platform pause', () => {
    const app = read('src/App.vue')
    expect(app.match(/watch\(isPortalAdOpen/g)?.length).toBe(1)
    expect(app).toMatch(/watch\(isPortalAdOpen, \(open\) => \{ if \(open\) pauseGame\(\); else resumeGame\(\) \}/)
    // …and no plugin drives the gate on GameMonetize's behalf.
    expect(read('src/utils/gameMonetizePlugin.ts')).not.toMatch(/\bpauseGame\(|\bresumeGame\(|isAdShowing\.value/)
  })
})
