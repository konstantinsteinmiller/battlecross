// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { buildCsp } from '@/platforms/csp'
import { CLICKER_MARKER, clickerInline, injectClicker } from '../../scripts/clickerInline.mjs'

describe('the mini-game is part of the first HTML document', () => {
  const root = process.cwd()
  const html = readFileSync(resolve(root, 'index.html'), 'utf8')
  const inline = clickerInline(root)
  const page = injectClicker(html, inline)

  it('index.html is the source: a canvas on the splash, the marker right after the splash markup', () => {
    expect(html).toContain('<canvas class="s-play" id="s-play" aria-hidden="true"></canvas>')
    expect(html.indexOf(CLICKER_MARKER)).toBeGreaterThan(html.indexOf('id="s-play"'))
    expect(html.indexOf(CLICKER_MARKER)).toBeLessThan(html.indexOf('<div id="app">'))
  })
  it('the built page carries the script after the canvas and before the app, once, and closes cleanly', () => {
    expect(page).not.toContain(CLICKER_MARKER)
    expect(page.split(inline.tag)).toHaveLength(2)
    expect(page.indexOf(inline.tag)).toBeGreaterThan(page.indexOf('id="s-play"'))
    expect(page.indexOf(inline.tag)).toBeLessThan(page.indexOf('<div id="app">'))
    expect(inline.code).not.toMatch(/<\/script/i)
    expect(inline.code).toContain('__bcClicker')
    expect(inline.code).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/)
  })
  it('stays small: the page gains a few KB', () => {
    expect(gzipSync(inline.code).length).toBeLessThan(15_000)
  })
  it('the policy names its hash only where inline scripts would otherwise be blocked', () => {
    const strict = buildCsp({}, [inline.hash])
    expect(strict).toContain(inline.hash)
    expect(inline.hash).toBe(`'sha256-${createHash('sha256').update(inline.code).digest('base64')}'`)
    // 'unsafe-inline' builds: a hash would switch that keyword off, so none is added.
    for (const flag of ['VITE_APP_GLITCH', 'VITE_APP_GAMEPIX', 'VITE_APP_GAME_MONETIZE', 'VITE_APP_PLAYGAMA']) {
      expect(buildCsp({ [flag]: 'true' }, [inline.hash])).not.toContain('sha256-')
    }
  })
})
