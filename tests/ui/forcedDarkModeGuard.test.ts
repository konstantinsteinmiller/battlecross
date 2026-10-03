// @vitest-environment jsdom
// The forced-dark-mode guard (forced-dark-mode-guard skill): prevention in
// index.html, detection, and the blocking notice that holds the game while an
// overrider repaints it — and lets go by itself when the overrider is gone.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'

const ROOT = resolve(__dirname, '../..')
const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8')

// jsdom resolves no real cascade for the sentinel probe, so detection runs on
// the structural markers only here (`sentinel: false`). The retry ladder is a
// single immediate check; re-checks come from the MutationObserver.
const START = { sentinel: false, retryLadderMs: [0], debounceMs: 10 } as const

const addDarkReader = (): HTMLElement => {
  const s = document.createElement('style')
  s.className = 'darkreader darkreader--sync'
  document.head.appendChild(s)
  return s
}

describe('forced dark mode — prevention', () => {
  it('index.html ships the opt-outs before any script runs', () => {
    const html = read('index.html')
    expect(html).toContain('<meta name="color-scheme" content="dark only">')
    expect(html).toContain('<meta name="darkreader-lock">')
  })

  it('the global stylesheet opts out of forced colours and declares the scheme with `only`', () => {
    const css = read('src/assets/css/components.sass')
    expect(css).toMatch(/color-scheme: dark only/)
    expect(css).toMatch(/forced-color-adjust: none/)
  })

  it('the old silent "extension guard" is gone (it disabled Dark Reader sheets and fought the detector)', () => {
    expect(() => read('src/use/useExtensionGuard.ts')).toThrow()
    expect(read('src/App.vue')).not.toContain('useExtensionGuard')
  })

  it('main.ts starts the guard and App.vue mounts the notice', () => {
    expect(read('src/main.ts')).toContain('startForcedDarkModeGuard(')
    expect(read('src/App.vue')).toMatch(/^\s+ForcedDarkModeModal$/m)
  })
})

describe('forced dark mode — guard and notice', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetModules()
  })
  afterEach(async () => {
    const g = await import('@/use/useForcedDarkModeGuard')
    g.__resetForcedDarkModeGuard()
    document.head.querySelectorAll('style.darkreader, meta[name="darkreader-lock"]').forEach(n => n.remove())
    document.body.innerHTML = ''
    vi.useRealTimers()
  })

  const settle = async (ms = 50) => { await vi.advanceTimersByTimeAsync(ms) }

  it('a clean page is not blocked, and the runtime opt-out is applied', async () => {
    const g = await import('@/use/useForcedDarkModeGuard')
    g.startForcedDarkModeGuard(START)
    await settle()
    expect(g.isForcedDarkBlocking.value).toBe(false)
    expect(document.querySelector('meta[name="darkreader-lock"]')).not.toBeNull()
    let cleared = false
    void g.whenForcedDarkGuardClear().then(() => { cleared = true })
    await settle()
    expect(cleared).toBe(true)
  })

  it('Dark Reader blocks; removing it clears the block by itself', async () => {
    const g = await import('@/use/useForcedDarkModeGuard')
    const sheet = addDarkReader()
    g.startForcedDarkModeGuard(START)
    await settle()
    expect(g.isForcedDarkBlocking.value).toBe(true)
    let cleared = false
    void g.whenForcedDarkGuardClear().then(() => { cleared = true })
    await settle(2000)
    expect(cleared).toBe(false)   // a live block always waits

    sheet.remove()                 // the player switched it off
    await settle()
    expect(g.isForcedDarkBlocking.value).toBe(false)
    expect(cleared).toBe(true)
  })

  it('the notice shows, holds the game, and "Continue at own risk" lets go (memory only)', async () => {
    const g = await import('@/use/useForcedDarkModeGuard')
    const modal = await import('@/use/useModalState')
    const { default: ForcedDarkModeModal } = await import('@/components/organisms/ForcedDarkModeModal.vue')
    addDarkReader()
    g.startForcedDarkModeGuard(START)
    await settle()

    const i18n = createI18n({ legacy: false, locale: 'en', messages: { en } })
    const w = mount(ForcedDarkModeModal, { global: { plugins: [i18n], stubs: { teleport: true, GameIcon: true } } })
    await settle()
    expect(w.find('[role="alertdialog"]').exists()).toBe(true)
    expect(w.text()).toContain('Please turn off dark mode for this game')
    expect(w.text()).toContain('Dark Reader: click its icon')
    // The game stands still behind it (an app-side modal hold, which also
    // keeps the portal gameplay bracket closed).
    expect(modal.isAnyModalOpen.value).toBe(true)

    const storageBefore = window.localStorage.length
    await w.find('button.fdm__continue').trigger('click')
    await settle()
    expect(g.isForcedDarkBlocking.value).toBe(false)
    expect(w.find('[role="alertdialog"]').exists()).toBe(false)
    expect(modal.isAnyModalOpen.value).toBe(false)
    // Never persisted: a reload asks again (CrazyGames rejects extra keys).
    expect(window.localStorage.length).toBe(storageBefore)
    w.unmount()
  })

  it('every forcedDark key the notice uses exists in English', () => {
    const fd = (en as any).forcedDark
    for (const k of ['title', 'body', 'waiting', 'continueAnyway']) expect(fd[k], k).toBeTruthy()
    for (const k of ['darkReader', 'extension', 'chromiumFlag', 'samsung', 'forcedColors', 'firefoxColors']) expect(fd.hint[k], k).toBeTruthy()
    expect(fd.hint.chromiumFlag).toContain('{flagUrl}')
    // vue-i18n reads `@` as a linked message and `|` as plural forms.
    expect(JSON.stringify(fd)).not.toMatch(/[@|]/)
  })
})

// (The build-mode survival half lives in tests/platforms/buildHtmlSurvival.test.ts:
// it loads vite.config.ts, whose esbuild refuses to run under jsdom.)
