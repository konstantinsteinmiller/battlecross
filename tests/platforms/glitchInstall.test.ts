import { describe, expect, it } from 'vitest'
import { connectGlitch, type GlitchConnectDeps } from '@/utils/glitchInstall'

const TITLE = '6bf480b2-e4ce-43ba-9489-90b1d520c29b'
const BASE = `https://api.glitch.fun/api/titles/${TITLE}/installs`

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

const memStorage = (seed: Record<string, string> = {}) => {
  const m = new Map(Object.entries(seed))
  return {
    map: m,
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k)
  }
}

type Call = { url: string; body: Record<string, unknown> }

const setup = (
  route: (url: string, call: number) => Response | Promise<Response>,
  opts: { search?: string; storage?: ReturnType<typeof memStorage> } = {}
) => {
  const calls: Call[] = []
  const storage = opts.storage ?? memStorage()
  const deps: GlitchConnectDeps = {
    titleId: TITLE,
    token: 'tok',
    search: new URLSearchParams(opts.search ?? ''),
    storage,
    fetch: (async (url: string, init?: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init?.body ?? '{}')) })
      return route(url, calls.length)
    }) as typeof fetch,
    gameVersion: '0.4.2',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    sessionId: 'sess-1',
    sleep: async () => {}
  }
  return { deps, calls, storage }
}

describe('connectGlitch', () => {
  it('first launch: creates an install, validates it and persists both ids', async () => {
    const { deps, calls, storage } = setup((url) =>
      url.endsWith('/validate') ? json({ valid: true }) : json({ data: { id: 'inst-1' } })
    )
    const r = await connectGlitch(deps)
    expect(r.ok).toBe(true)
    expect(calls[0].url).toBe(BASE)
    expect(calls[0].body).toMatchObject({ platform: 'web', session_id: 'sess-1', game_version: '0.4.2', build_type: 'production' })
    expect(calls[1].url).toBe(`${BASE}/inst-1/validate`)
    expect(storage.map.get('glitch_install_id')).toBe('inst-1')
    expect(storage.map.get('glitch_user_install_id')).toBe(calls[0].body.user_install_id)
  })

  it('second launch reuses stored ids — no new install', async () => {
    const storage = memStorage({ glitch_install_id: 'inst-1', glitch_user_install_id: 'u-1' })
    const { deps, calls } = setup(() => json({ valid: true }), { storage })
    const r = await connectGlitch(deps)
    expect(r).toMatchObject({ ok: true, installId: 'inst-1', userInstallId: 'u-1' })
    expect(calls).toHaveLength(1)
  })

  it('INSTALL_NOT_FOUND re-creates the install under the same key and validates again', async () => {
    const storage = memStorage({ glitch_install_id: 'gone', glitch_user_install_id: 'u-1' })
    const { deps, calls } = setup(
      (url) => {
        if (url.endsWith('/gone/validate')) return json({ valid: false, reason: 'INSTALL_NOT_FOUND' }, 404)
        if (url.endsWith('/validate')) return json({ valid: true })
        return json({ data: { id: 'inst-2' } })
      },
      { storage }
    )
    const r = await connectGlitch(deps)
    expect(r).toMatchObject({ ok: true, installId: 'inst-2' })
    expect(calls[1].body.user_install_id).toBe('u-1')
    expect(storage.map.get('glitch_install_id')).toBe('inst-2')
  })

  it('launcher ids win; install_id without user_install_id never posts a guessed key', async () => {
    const { deps, calls } = setup(() => json({ valid: true }), { search: '?install_id=url-inst' })
    const r = await connectGlitch(deps)
    expect(r).toMatchObject({ ok: true, installId: 'url-inst', userInstallId: null })
    expect(calls.map((c) => c.url)).toEqual([`${BASE}/url-inst/validate`])
  })

  it('license denial blocks play with the reason', async () => {
    const storage = memStorage({ glitch_install_id: 'inst-1', glitch_user_install_id: 'u-1' })
    const { deps } = setup(() => json({ valid: false, reason: 'TRIAL_EXPIRED' }, 403), { storage })
    expect(await connectGlitch(deps)).toEqual({ ok: false, reason: 'TRIAL_EXPIRED' })
  })

  it('retries network loss, then succeeds', async () => {
    const storage = memStorage({ glitch_install_id: 'inst-1', glitch_user_install_id: 'u-1' })
    const { deps, calls } = setup(
      (_url, n) => {
        if (n === 1) throw new TypeError('offline')
        if (n === 2) return json({}, 503)
        return json({ valid: true })
      },
      { storage }
    )
    expect((await connectGlitch(deps)).ok).toBe(true)
    expect(calls).toHaveLength(3)
  })

  it('gives up with NETWORK after repeated failures', async () => {
    const { deps } = setup(() => { throw new TypeError('offline') })
    expect(await connectGlitch(deps)).toEqual({ ok: false, reason: 'NETWORK' })
  })
})
