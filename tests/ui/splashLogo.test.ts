// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { injectSplashArt, SPLASH_ART_PX } from '../../src/game/art/splashArt'

// ─── The boot splash is drawn twice and must be the same picture ───────────
//
// `index.html` paints a static splash before any script runs; `FLogoProgress`
// takes over when Vue mounts and cross-fades the static one away. The hand-over
// is only invisible if the two are the same picture, at the same size, in the
// same place. They used not to be: the static copy was a simplified emblem
// with half the title, so the logo visibly changed as the loader took over.
//
// Now the lockup (two swords crossed behind a shield over the BATTLE /
// CROSS wordmark) is ONE inline SVG of paths, pasted into both files. This
// pins the two copies to each other, byte for byte, and pins every sizing and
// colour rule of the two layouts to each other, rule for rule. A browser
// check of the hand-over (boxes and pixels) is in the logo redesign notes;
// what a unit test can hold is that nobody edits one copy and not the other.

const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8')
const html = read('index.html')
const vue = read('src/components/atoms/FLogoProgress.vue')
const manifest = JSON.parse(read('public/manifest.json')) as { name: string; short_name: string; description: string; background_color: string }

const staticSvg = /<div class="s-logo"[^>]*>(<svg[\s\S]*?<\/svg>)<\/div>/.exec(html)?.[1] ?? ''
const loaderSvg = /h1\.logo\(.*\)\n\s*(<svg[\s\S]*?<\/svg>)\n/.exec(vue)?.[1] ?? ''

/** `prop: value` pairs of a plain CSS rule in index.html's <style>. */
const cssRule = (selector: string): Record<string, string> => {
  const css = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? ''
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const body = new RegExp(`(?:^|\\n|\\})\\s*${esc}\\s*\\{([^{}]*)\\}`).exec(css)?.[1]
  if (body === undefined) throw new Error(`index.html has no rule for ${selector}`)
  return Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
    const i = d.indexOf(':')
    return [d.slice(0, i).trim(), d.slice(i + 1).trim()]
  }))
}

/** `prop: value` pairs of an indented-sass rule in FLogoProgress (optionally one nested block down). */
const sassRule = (selector: string, nested?: string): Record<string, string> => {
  const style = /<style[^>]*lang="sass">([\s\S]*?)<\/style>/.exec(vue)?.[1] ?? ''
  const lines = style.split('\n')
  const at = lines.findIndex((l) => l === selector)
  if (at < 0) throw new Error(`FLogoProgress has no rule for ${selector}`)
  const block: string[] = []
  for (const l of lines.slice(at + 1)) {
    if (l.trim() && !l.startsWith('  ')) break
    block.push(l)
  }
  let pick = block.filter((l) => /^ {2}[a-z-]+: /.test(l))
  if (nested) {
    const n = block.findIndex((l) => l === `  ${nested}`)
    if (n < 0) throw new Error(`FLogoProgress has no ${nested} under ${selector}`)
    pick = []
    for (const l of block.slice(n + 1)) {
      if (!l.startsWith('    ')) break
      pick.push(l)
    }
  }
  return Object.fromEntries(pick.map((l) => {
    const i = l.indexOf(':')
    return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
  }))
}

const only = (rule: Record<string, string>, keys: string[]): Record<string, string> =>
  Object.fromEntries(keys.map((k) => [k, rule[k]]))

describe('the splash lockup', () => {
  it('is in both places', () => {
    expect(staticSvg.length).toBeGreaterThan(1000)
    expect(loaderSvg.length).toBeGreaterThan(1000)
  })

  it('is byte-identical in the static splash and in FLogoProgress', () => {
    expect(loaderSvg).toBe(staticSvg)
  })

  it('is the generated lockup, pasted as it is (node store-art/brand/logo-final.mjs)', () => {
    // The store covers lay store-art/brand/logo-lockup.svg over the art, so a
    // splash that drifted from it would show players a different logo.
    expect(staticSvg).toBe(read('store-art/brand/logo-lockup.svg'))
  })

  it('carries no id: during the cross-fade both copies are in the document at once', () => {
    // A duplicated id makes url(#…) / <use href="#…"> resolve into the OTHER
    // copy, which is then removed from under it.
    expect(staticSvg).not.toMatch(/\sid=/)
    expect(staticSvg).not.toMatch(/url\(|href=|<use\b/)
  })

  it('is paths, not text: nothing reflows before the bundled fonts load', () => {
    expect(staticSvg).not.toMatch(/<text\b|font-family|font-size/)
  })

  it('requests nothing (Poki forbids external requests; this paints before any script)', () => {
    const withoutNs = staticSvg.replace('xmlns="http://www.w3.org/2000/svg"', '')
    expect(withoutNs).not.toMatch(/https?:|<image\b|@import/)
  })

  it('stays small: it is on the critical path twice (index.html and the loader chunk)', () => {
    expect(staticSvg.length).toBeLessThan(5000)
  })

  it('is decoration for assistive tech; the wrapper carries the name', () => {
    expect(staticSvg).toMatch(/^<svg [^>]*aria-hidden="true"/)
    expect(html).toMatch(/<div class="s-logo" role="img" aria-label="Battlecross">/)
    expect(vue).toMatch(/h1\.logo\(:aria-label="t\('gameName'\)"[ )]/)
  })

  it('is named what the page and the installed app are named', () => {
    // The tab title, the iOS home-screen title, the PWA name and the logo's
    // accessible name are one string.
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]
    expect(title).toBe('Battlecross')
    expect(/<meta name="apple-mobile-web-app-title" content="([^"]*)">/.exec(html)?.[1]).toBe(title)
    expect(/<div class="s-logo" role="img" aria-label="([^"]*)">/.exec(html)?.[1]).toBe(title)
    expect(manifest.name).toBe(title)
    expect(manifest.short_name).toBe(title)
  })

  it('declares the aspect ratio its viewBox has, in both layouts', () => {
    const [, w, h] = /viewBox="0 0 (\d+) (\d+)"/.exec(staticSvg) ?? []
    expect(cssRule('.s-logo')['aspect-ratio']).toBe(`${w} / ${h}`)
    expect(sassRule('.logo')['aspect-ratio']).toBe(`${w} / ${h}`)
  })
})

describe('the two layouts are the same, rule for rule', () => {
  it('centre the column the same way (a flex layer, no half-pixel transform)', () => {
    const keys = ['position', 'inset', 'display', 'align-items', 'justify-content']
    expect(only(sassRule('.loader'), keys)).toEqual(only(cssRule('#static-splash'), keys))
    expect(sassRule('.loader').transform).toBeUndefined()
  })

  it('size the column the same', () => {
    const keys = ['position', 'display', 'flex-direction', 'align-items', 'gap', 'width']
    expect(only(sassRule('.card'), keys)).toEqual(only(cssRule('.s-card'), keys))
  })

  it('size the lockup the same', () => {
    expect(only(sassRule('.logo'), ['width', 'aspect-ratio'])).toEqual(only(cssRule('.s-logo'), ['width', 'aspect-ratio']))
    expect(sassRule('.logo', ':deep(svg)')).toEqual(cssRule('.s-logo svg'))
  })

  it('draw the bar the same', () => {
    expect(sassRule('.bar')).toEqual(cssRule('.s-bar'))
    expect(sassRule('.track, .lit')).toEqual(cssRule('.s-track, .s-lit'))
    expect(sassRule('.track')).toEqual(cssRule('.s-track'))
    expect(sassRule('.lit')).toEqual(cssRule('.s-lit'))
    const fill = ['width', 'height', 'background', 'transform-origin']
    expect(only(sassRule('.fill'), fill)).toEqual(only(cssRule('.s-fill'), fill))
  })

  it('paint the same backdrop and the same grid', () => {
    expect(sassRule('.splash-backdrop').background).toBe(cssRule('#static-splash').background)
    const grid = ['inset', 'background-image', 'background-size']
    expect(only(sassRule('.backdrop-grid'), grid)).toEqual(only(cssRule('.s-grid'), grid))
    // Same loop (duration, easing), under each file's own keyframes name.
    const loop = (a: string) => a.split(' ').slice(1).join(' ')
    expect(loop(sassRule('.backdrop-grid').animation)).toBe(loop(cssRule('.s-grid').animation))
  })

  it('end the backdrop in the page colour, so nothing flashes at the edges', () => {
    const edge = /(#[0-9a-f]{6}) 100%\)$/i.exec(cssRule('#static-splash').background)?.[1]
    expect(edge).toBeTruthy()
    expect(cssRule('body')['background-color']).toBe(edge)
    expect(manifest.background_color).toBe(edge)
  })
})

describe('the backdrop is the scrolling tile of the game\'s things (#64)', () => {
  const tile = read('store-art/brand/splash-tile.svg')

  it('is the generated tile, in both places (node store-art/brand/splash-tile.mjs)', async () => {
    const { tileUrl } = await import('../../store-art/brand/splash-tile.mjs')
    expect(cssRule('.s-grid')['background-image']).toBe(tileUrl(tile))
    expect(sassRule('.backdrop-grid')['background-image']).toBe(tileUrl(tile))
  })

  it('is white outlines only, inline, and small: it paints before any script or image', () => {
    expect(tile).toMatch(/<g fill="none" stroke="#fff" stroke-opacity="[.\d]+"/)
    expect(tile).not.toMatch(/https?:(?!\/\/www\.w3\.org\/2000\/svg)|<image\b|href=/)
    expect(cssRule('.s-grid')['background-image'].length).toBeLessThan(2000)
  })

  it('scrolls exactly one tile toward the bottom right per loop, so the loop has no seam', () => {
    const size = /^(\d+)px \1px$/.exec(cssRule('.s-grid')['background-size'])?.[1]
    expect(size).toBeTruthy()
    expect(cssRule('.s-grid').inset).toBe(`-${size}px 0 0 -${size}px`)
    expect(html).toContain(`@keyframes s-pan { to { transform: translate3d(${size}px, ${size}px, 0); } }`)
    expect(vue).toMatch(new RegExp(`@keyframes grid-pan\\n {2}to\\n {4}transform: translate3d\\(${size}px, ${size}px, 0\\)`))
    // Slowly: a tile takes tens of seconds.
    expect(Number(/^s-pan (\d+)s linear infinite$/.exec(cssRule('.s-grid').animation)?.[1])).toBeGreaterThanOrEqual(30)
  })

  it('stops for players who ask for less motion', () => {
    expect(html).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[^}]*\.s-grid \{ animation: none; \}/)
    expect(vue).toMatch(/@media \(prefers-reduced-motion: reduce\)\n {2}\.backdrop-grid, \.mascot\n {4}animation: none/)
  })
})

describe('the loader mechanics survive the restyle', () => {
  it('the static bar creeps on the compositor, from nothing, by transform', () => {
    expect(cssRule('.s-fill').transform).toBe('scaleX(0)')
    expect(cssRule('.s-fill').animation).toMatch(/^s-creep /)
    expect(html).toMatch(/@keyframes s-creep \{\s*to \{ transform: scaleX\(0\.1\); \}/)
  })

  it('the Vue bar starts where the static one got to, and only ever creeps forward from there', () => {
    expect(vue).toContain("readScaleX(document.querySelector('#static-splash .s-fill'))")
    expect(vue).toMatch(/div\.fill\(:style="fillStyle"\)/)
    const creepTo = Number(/const CREEP_TO = ([\d.]+)/.exec(vue)?.[1])
    const staticEnd = Number(/@keyframes s-creep \{\s*to \{ transform: scaleX\(([\d.]+)\)/.exec(html)?.[1])
    expect(creepTo).toBeGreaterThan(staticEnd)
  })

  it('the grid pan continues in phase instead of restarting under the cross-fade', () => {
    expect(vue).toMatch(/continuePan\(staticSplash\.querySelector\('\.s-grid'\), gridEl\.value\)/)
    expect(vue).toMatch(/div\.backdrop-grid\(ref="gridEl"/)
  })

  it('the 28-cell bar is gone from both (it was a MegaMan health bar)', () => {
    for (const src of [html, vue]) {
      expect(src).not.toMatch(/\/ 28\)|28-cell|helm/i)
    }
  })
})

describe('the store copy describes this game', () => {
  const meta = /<meta name="description" content="([^"]*)">/.exec(html)?.[1] ?? ''

  it.each([['index.html meta description', meta], ['manifest description', manifest.description]])('%s is about the RPG, not the predecessor', (_, text) => {
    expect(text).toMatch(/RPG/)
    expect(text).not.toMatch(/Flux|android|robot|machine|cannon|circuit/i)
  })

  it('says the same thing in both places', () => {
    expect(manifest.description).toBe(meta)
  })
})

// The painted badge and mascot (#65) are written into the static splash by the
// build when public/images/logo/ has them (the source page keeps the drawn
// lockup, which stays the fallback), and drawn by FLogoProgress from LOGO_ART.
// The letters are always the code-drawn ones.
describe('the painted badge and mascot (#65)', () => {
  const files = ['emblem.webp', 'mascot.webp', 'logo_512x512.png']

  it('changes nothing until the paintings exist', () => {
    expect(injectSplashArt(html, ['logo_512x512.png'])).toBe(html)
  })

  it('preloads both in <head> and lays them in the lockup box at their real size', () => {
    const out = injectSplashArt(html, files)
    const head = out.slice(0, out.indexOf('<style>'))
    expect(head).toContain('<link rel="preload" as="image" href="/images/logo/emblem.webp" fetchpriority="high">')
    expect(head).toContain('<link rel="preload" as="image" href="/images/logo/mascot.webp" fetchpriority="high">')
    expect(out).toContain('<div class="s-logo has-art" role="img" aria-label="Battlecross"><img class="s-emblem" src="/images/logo/emblem.webp"')
    for (const img of out.match(/<img class="s-(emblem|mascot)"[^>]*>/g) ?? []) {
      expect(img).toContain(`width="${SPLASH_ART_PX}" height="${SPLASH_ART_PX}"`)
      expect(img).toContain('alt=""')
    }
    expect(out.match(/<img class="s-/g)).toHaveLength(2)
    // The drawn lockup is still there: the letters, and the badge as fallback.
    expect(out).toContain(staticSvg)
  })

  it('keeps the drawn badge when only the mascot is painted', () => {
    expect(injectSplashArt(html, ['mascot.webp'])).toContain('<div class="s-logo" role="img"')
  })

  it('places them identically in both copies', () => {
    expect(sassRule('.emblem')).toEqual(cssRule('.s-emblem'))
    // Same rule but the keyframes' name (each file names its own).
    const unnamed = (rule: Record<string, string>) => ({ ...rule, animation: rule.animation?.replace(/^\S+ /, '') })
    expect(unnamed(sassRule('.mascot'))).toEqual(unnamed(cssRule('.s-mascot')))
    expect(sassRule('.emblem, .mascot')).toEqual(cssRule('.s-emblem, .s-mascot'))
    expect(cssRule('.s-logo')).toMatchObject({ position: 'relative' })
    expect(html).toContain('.s-logo.has-art svg > g > :nth-child(-n+6) {')
    expect(vue).toContain('.logo.has-art :deep(svg > g > :nth-child(-n+6))')
  })

  it('hides exactly the drawn badge: six shapes, then the letters', () => {
    // Top-level shapes: the two sword groups (folded to one token), then paths.
    const body = staticSvg.replace(/^<svg[^>]*><g[^>]*>/, '').replace(/<g transform="rotate[^"]*">[\s\S]*?<\/g>/g, '<SWORD>')
    const shapes = body.match(/<SWORD>|<path\b[^>]*>/g) ?? []
    expect(shapes.slice(0, 2)).toEqual(['<SWORD>', '<SWORD>'])
    expect(shapes.slice(2, 6).every((p) => p.startsWith('<path') && !p.includes('matrix('))).toBe(true)
    expect(shapes[6]).toContain('matrix(1 0 -.213 1')
  })

  it('the mascot bobs by transform alone, and rests for less motion', () => {
    expect(cssRule('.s-mascot')).toMatchObject({ 'will-change': 'transform' })
    const keys = /@keyframes s-bob \{([^\n]*)\}\n/.exec(html)?.[1] ?? ''
    expect(keys).toMatch(/transform:/)
    expect(keys.replace(/transform: [^;]*;/g, '')).not.toMatch(/[a-z-]+:/)
    expect(html).toMatch(/@media \(prefers-reduced-motion: reduce\) \{(\s*\.[a-z-]+ \{[^}]*\})*\s*\.s-mascot \{ animation: none; \}/)
  })

  it('pans the tile on a promoted layer in both copies', () => {
    expect(cssRule('.s-grid')['will-change']).toBe('transform')
    expect(sassRule('.backdrop-grid')['will-change']).toBe('transform')
  })
})
