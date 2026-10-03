// The build's index.html transforms and the GameMonetize env file, read the
// way Vite reads them. Node environment on purpose: `vite.config.ts` and
// `loadEnv` pull in esbuild, which refuses to run under jsdom.

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it, vi } from 'vitest'

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8')

describe('.env.gamemonetize.local', () => {
  // The env file is gitignored (`*.local`), so this runs where it exists.
  it.runIf(existsSync(resolve(ROOT, '.env.gamemonetize.local')))('.env.gamemonetize.local is self-contained', async () => {
    const { loadEnv } = await import('vite')
    const env = loadEnv('gamemonetize', ROOT, '')
    expect(env.VITE_APP_GAME_MONETIZE).toBe('true')
    for (const f of ['VITE_APP_CRAZY_WEB', 'VITE_APP_GAMEPIX', 'VITE_APP_PLAYGAMA', 'VITE_APP_GAME_DISTRIBUTION', 'VITE_APP_YANDEX', 'VITE_APP_POKI', 'VITE_APP_GLITCH', 'VITE_APP_ITCH', 'VITE_APP_WAVEDASH']) {
      expect(env[f], f).not.toBe('true')
    }
    // No live leaderboard (and no signing secret) on GameMonetize: the board
    // is baked, and the release makes no request but the SDK's.
    // Read from the FILE: the suite blanks both in process.env (vitest.config),
    // which would make a check through loadEnv vacuous.
    const file = read('.env.gamemonetize.local')
    expect(file).toMatch(/^VITE_LEADERBOARD_URL=\s*$/m)
    expect(file).toMatch(/^VITE_LEADERBOARD_SECRET=\s*$/m)
    // The game id stays blank until the game exists on GameMonetize; the
    // release gate refuses to pack without it.
    expect(file).toMatch(/^VITE_GAME_ID=/m)
  })
})

// ─── The opt-outs survive the build, in every mode ───────────────────────────
//
// Build-time html transforms (the per-portal SDK strips, the CSP injection,
// GameMonetize's comment strip) run regexes over index.html; one that spans a
// comment can eat the metas next to it. Run the real config's transforms for
// each build mode over the real index.html.
describe('forced dark mode — the opt-outs survive every build mode', () => {
  const MODES = ['production', 'crazy-web', 'gamemonetize', 'gamepix', 'poki', 'playgama', 'yandex', 'itch', 'glitch', 'wavedash', 'game-distribution']

  const transform = async (mode: string): Promise<string> => {
    const { default: configFn } = await import('../../vite.config')
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const cfg = (configFn as any)({ mode, command: 'build' })
    log.mockRestore(); warn.mockRestore()
    const plugins = (cfg.plugins as any[]).flat(Infinity).filter(Boolean)
    const hooks: { order: string; fn: (html: string, ctx: any) => any }[] = []
    for (const p of plugins) {
      const h = p.transformIndexHtml
      if (!h) continue
      if (typeof h === 'function') hooks.push({ order: 'normal', fn: h })
      else hooks.push({ order: h.order ?? 'normal', fn: h.handler })
    }
    const rank: Record<string, number> = { pre: 0, normal: 1, post: 2 }
    hooks.sort((a, b) => rank[a.order]! - rank[b.order]!)
    let html = read('index.html')
    for (const { fn } of hooks) {
      const out = await fn(html, { path: '/index.html', filename: resolve(ROOT, 'index.html') })
      if (typeof out === 'string') html = out
      else if (out && typeof out === 'object' && 'html' in out) html = out.html
    }
    return html
  }

  it.each(MODES)('%s', async (mode) => {
    const html = await transform(mode)
    expect(html).toContain('<meta name="color-scheme" content="dark only">')
    expect(html).toContain('<meta name="darkreader-lock">')
    expect(html).toContain('<title>Battlecross</title>')
  })

  it('the GameMonetize index.html carries no developer comments naming other portals', async () => {
    const html = await transform('gamemonetize')
    expect(html).not.toContain('<!--')
    for (const other of ['playgama', 'Playgama', 'youtube', 'ytgame', 'crazygames', 'gamepix', 'poki']) expect(html, other).not.toContain(other)
  })
})
