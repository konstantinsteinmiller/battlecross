// The Samsung dark-mode counter, pure parts: the fitted fallback model, the css parsers, and the planner that
// turns one box's computed style into the routes measured on the phone (paint worklet backgrounds and borders,
// clipped text, brightness-restored images, drop-shadow filters).

import { describe, expect, it } from 'vitest'
import {
  LIGHT_KEEP_Y,
  observe,
  parseColor,
  parseGradient,
  parseShadows,
  pickTextShadows,
  planBox,
  precorrect,
  reachableLuma,
  ringBands,
  SAMSUNG_30,
  splitTop,
  withPremultipliedBlends,
} from '@/utils/forcedDarkCounter'
import { isSamsungUa } from '@/utils/forcedDarkCounter/ua'
import type { Computed, Gradient, PlanEnv } from '@/utils/forcedDarkCounter'
import { styleChangeMatters } from '@/utils/forcedDarkCounter/runtime'

const luma = (c: number[]) => 0.299 * c[0]! + 0.587 * c[1]! + 0.114 * c[2]!

describe('fallback model (used only when the paint worklet is missing)', () => {
  const KEEP = { bg: 1, text: 0.7, border: 1, shadow: 1, gradTop: 1, gradBottom: 1 } as const
  let seed = 12345
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32
  // Independent oracle: some input luma whose UNCLAMPED inverse candidate fits 0..255 and observes the target.
  const feasible = (role: keyof typeof KEEP, t: number[]): boolean => {
    const yt = luma(t)
    for (let yv = 0; yv <= 255; yv += 0.25) {
      const c = t.map(v => yv + (v - yt) / KEEP[role])
      if (c.some(v => v < -0.5 || v > 255.5)) continue
      const o = observe(role, c.map(v => Math.round(Math.max(0, Math.min(255, v)))) as [number, number, number])
      if (Math.max(...o.map((v, k) => Math.abs(v - t[k]!))) <= 3.5) return true
    }
    return false
  }

  it('precorrect shows the target whenever any in-range colour can, for every role', () => {
    let checked = 0
    let infeasible = 0
    for (const role of ['bg', 'text', 'border', 'shadow', 'gradTop', 'gradBottom'] as const) {
      const [lo, hi] = reachableLuma(role)
      let n = 0
      while (n < 600) {
        const t = [(rnd() * 256) | 0, (rnd() * 256) | 0, (rnd() * 256) | 0] as [number, number, number]
        const y = luma(t)
        if (y < lo + 1 || y > hi - 1) continue
        n++
        const o = observe(role, precorrect(role, t).rgb)
        const err = Math.max(...o.map((v, k) => Math.abs(v - t[k]!)))
        if (err <= 4) continue
        expect(feasible(role, t), `${role} ${t} should be feasible`).toBe(false)
        infeasible++
      }
      checked += n
    }
    // The rest need a channel beyond 0..255.
    expect(infeasible).toBeLessThan(checked * 0.5)
  })

  it('keeps light text as authored', () => {
    expect(LIGHT_KEEP_Y).toBe(217)
    const o = observe('text', [250, 250, 250])
    expect(o[0]).toBeGreaterThan(245)
  })
})

describe('css parsers', () => {
  const lin = (css: string, w = 100, h = 100) => parseGradient(css, w, h) as Extract<Gradient, { kind: 'linear' }>
  it('parses a two-stop gradient', () => {
    const g = lin('linear-gradient(180deg, rgb(44, 79, 138) 0%, rgb(27, 47, 88) 100%)', 340, 44)
    expect(g.angle).toBe(180)
    expect(g.repeating).toBe(false)
    expect(g.stops.map(s => s.rgb)).toEqual([[44, 79, 138], [27, 47, 88]])
    expect(g.stops[1]).toMatchObject({ f: 1, p: 0 })
  })
  it('fills implicit stop positions and keeps alpha', () => {
    const g = lin('linear-gradient(rgb(1, 2, 3), rgba(4, 5, 6, 0.5) 40%, rgb(7, 8, 9))')
    expect(g.angle).toBe(180)
    expect(g.stops.map(s => s.f)).toEqual([0, 0.4, 1])
    expect(g.stops[1]!.a).toBe(0.5)
  })
  it('keeps px stops as px (so they survive a resize) and reads side keywords', () => {
    const g = lin('linear-gradient(to right, rgb(0, 0, 0) 10px, rgb(255, 255, 255) 50px)', 100, 20)
    expect(g.angle).toBe(90)
    expect(g.stops.map(s => [s.f, s.p])).toEqual([[0, 10], [0, 50]])
    expect(lin('linear-gradient(0.25turn, #fff, #000, rgb(1,2,3))', 10, 10).angle).toBe(90)
  })
  it('reads the calc() positions getComputedStyle prints for mixed stops (the modal page gradient)', () => {
    const g = lin(
      'linear-gradient(rgb(255, 248, 227) 0px, rgb(255, 248, 227) 8px, rgb(248, 233, 196) 8px, rgb(248, 233, 196) calc(100% - 7.2px), rgb(236, 211, 160) calc(100% - 7.2px), rgb(236, 211, 160) 100%)',
      645,
      611
    )
    expect(g.stops).toHaveLength(6)
    expect(g.stops.map(s => [s.f, s.p])).toEqual([[0, 0], [0, 8], [0, 8], [1, -7.2], [1, -7.2], [1, 0]])
    expect(g.stops[2]!.rgb).toEqual([248, 233, 196])
  })
  it('parses radial gradients: shape, size, position', () => {
    const a = parseGradient('radial-gradient(circle at 50% 30%, rgb(1, 2, 3) 0%, rgb(4, 5, 6) 78%)') as Extract<Gradient, { kind: 'radial' }>
    expect(a).toMatchObject({ kind: 'radial', shape: 'circle', cx: '50%', cy: '30%', size: ['fc'] })
    expect(a.stops.map(s => s.f)).toEqual([0, 0.78])
    const b = parseGradient('radial-gradient(ellipse 80% 70% at 50% 55%, rgba(1, 2, 3, 0.28) 0px, rgba(1, 2, 3, 0.78) 100%)') as Extract<Gradient, { kind: 'radial' }>
    expect(b).toMatchObject({ shape: 'ellipse', cx: '50%', cy: '55%', size: ['80%', '70%'] })
    const c = parseGradient('radial-gradient(closest-side, rgb(1, 2, 3), rgb(4, 5, 6))') as Extract<Gradient, { kind: 'radial' }>
    expect(c).toMatchObject({ shape: 'ellipse', size: ['cs'], cx: '50%' })
    const d = parseGradient('radial-gradient(rgb(1, 2, 3), rgb(4, 5, 6))') as Extract<Gradient, { kind: 'radial' }>
    expect(d).toMatchObject({ shape: 'ellipse', size: ['fc'] })
  })
  it('parses conic gradients and expands a repeating one over the turn', () => {
    const a = parseGradient('conic-gradient(from 90deg at 50% 50%, rgb(1, 2, 3) 0deg, rgb(4, 5, 6) 180deg)') as Extract<Gradient, { kind: 'conic' }>
    expect(a).toMatchObject({ kind: 'conic', from: 90 })
    expect(a.stops.map(s => s.f)).toEqual([0, 0.5])
    const r = parseGradient('repeating-conic-gradient(from 0deg, rgb(1, 2, 3) 0deg 9deg, rgb(4, 5, 6) 9deg 30deg)') as Extract<Gradient, { kind: 'conic' }>
    expect(r.stops.length).toBeGreaterThan(20)
    expect(r.stops[r.stops.length - 1]!.f).toBeGreaterThan(0.95)
  })
  it('parses repeating linear gradients', () => {
    expect(lin('repeating-linear-gradient(115deg, rgb(1, 2, 3) 0px, rgb(1, 2, 3) 4px, rgb(4, 5, 6) 4px, rgb(4, 5, 6) 8px)').repeating).toBe(true)
  })
  it('refuses what it cannot draw', () => {
    expect(parseGradient('repeating-radial-gradient(circle, rgb(1,2,3), rgb(4,5,6))')).toBeNull()
    expect(parseGradient('linear-gradient(rgb(1,2,3), 30%, rgb(4,5,6))')).toBeNull()
    expect(parseGradient('url(x.png)')).toBeNull()
  })
  it('parses colours and shadow lists', () => {
    expect(parseColor('rgba(1, 2, 3, 0.5)')).toEqual({ rgb: [1, 2, 3], a: 0.5 })
    expect(parseColor('color(srgb 1 0 0)')!.rgb[0]).toBe(255)
    expect(parseColor('#fc0')!.rgb).toEqual([255, 204, 0])
    expect(splitTop('a(1,2), b, c(3, (4,5))')).toEqual(['a(1,2)', 'b', 'c(3, (4,5))'])
    const { parts } = parseShadows('rgba(0, 0, 0, 0.5) 0px 4px 8px 0px, rgb(27, 22, 38) 1px 0px 0px 0px inset')
    expect(parts).toHaveLength(2)
    expect(parts[0]).toMatchObject({ x: 0, y: 4, blur: 8, inset: false })
    expect(parts[1]!.inset).toBe(true)
  })
  it('recognises Samsung Internet only', () => {
    expect(isSamsungUa('Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 SamsungBrowser/30.0 Chrome/143.0 Mobile Safari/537.36')).toBe(true)
    expect(isSamsungUa('Mozilla/5.0 (Windows NT 10.0) Chrome/143.0 Safari/537.36')).toBe(false)
  })
})

const box = (over: Partial<Computed> = {}): Computed => ({
  backgroundColor: 'rgba(0, 0, 0, 0)',
  backgroundImage: 'none',
  backgroundSize: 'auto',
  backgroundPosition: '0% 0%',
  backgroundRepeat: 'repeat',
  backgroundOrigin: 'padding-box',
  backgroundClip: 'border-box',
  color: 'rgb(255, 255, 255)',
  filter: 'none',
  boxShadow: 'none',
  textShadow: 'none',
  position: 'static',
  borderWidth: [0, 0, 0, 0],
  borderColor: ['rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)', 'rgb(0, 0, 0)'],
  borderRadius: [0, 0, 0, 0],
  hasBorderImage: false,
  width: 200,
  height: 60,
  hasText: false,
  leaf: false,
  isImg: false,
  isField: false,
  ...over,
})

const env = (over: Partial<PlanEnv> = {}): PlanEnv => ({
  model: SAMSUNG_30,
  paint: true,
  pseudo: false,
  allowShadows: true,
  inherited: null,
  inheritedShadow: null,
  slot: () => 'before',
  ...over,
})

const CREAM = 'rgb(243, 231, 201)'

describe('planBox: paint worklet routes', () => {
  it('paints a solid background with the authored colour, no model', () => {
    const { decls } = planBox(box({ backgroundColor: CREAM }), env())
    expect(decls.get('--bc-p0')).toBe('243 231 201 1')
    expect(decls.get('background-image')).toBe('paint(bc-p0)')
    expect(decls.get('background-color')).toBe('transparent')
    expect(decls.get('background-origin')).toBe('border-box')
  })

  it('paints a gradient above the colour, stops untouched', () => {
    const { decls } = planBox(
      box({ backgroundColor: CREAM, backgroundImage: 'linear-gradient(180deg, rgb(44, 79, 138) 0%, rgb(27, 47, 88) 100%)' }),
      env()
    )
    expect(decls.get('--bc-p0')).toBe('L 180 0 | 44 79 138 1 0 0, 27 47 88 1 1 0')
    expect(decls.get('--bc-p1')).toBe('243 231 201 1')
    expect(decls.get('background-image')).toBe('paint(bc-p0), paint(bc-p1)')
  })

  it('draws the border through border-image: paint, per side, and never recolours border-color', () => {
    const gold = 'rgb(255, 197, 38)'
    const { decls } = planBox(box({ borderWidth: [3, 3, 3, 3], borderColor: [gold, gold, gold, gold], borderRadius: [10, 10, 10, 10] }), env())
    expect(decls.get('border-image-source')).toBe('paint(bc-border)')
    expect(decls.get('border-image-slice')).toBe('50%')
    expect(decls.get('border-image-width')).toBe('50%')
    expect(decls.get('--bc-bw')).toBe('3 3 3 3')
    expect(decls.get('--bc-bc')).toBe('255 197 38 1 | 255 197 38 1 | 255 197 38 1 | 255 197 38 1')
    expect(decls.get('--bc-rad')).toBe('10 10 10 10')
    expect([...decls.keys()].some(k => /^border-(top|left)-color$/.test(k))).toBe(false)
  })

  it('does not touch a fully transparent, borderless box', () => {
    expect(planBox(box(), env()).decls.size).toBe(0)
  })
})

describe('planBox: gradients', () => {
  it('writes radial and conic gradients for the worklet with sizeless positions', () => {
    const radial = planBox(
      box({ backgroundImage: 'radial-gradient(circle at 50% 30%, rgb(90, 111, 184) 0%, rgb(42, 47, 90) 80%)' }),
      env()
    ).decls
    expect(radial.get('--bc-p0')).toBe('R c 50% 30% fc | 90 111 184 1 0 0, 42 47 90 1 0.8 0')
    const conic = planBox(
      box({ backgroundImage: 'conic-gradient(from 0deg at 50% 50%, rgba(27, 22, 38, 0) 270deg, rgba(27, 22, 38, 0.8) 0deg)' }),
      env()
    ).decls
    expect(conic.get('--bc-p0')).toMatch(/^C 0 50% 50% \| /)
  })

  it('blends stops of different alpha in premultiplied space (CSS does, a canvas gradient does not)', () => {
    const g = parseGradient('linear-gradient(rgba(0, 0, 0, 0), rgb(200, 100, 0))') as Extract<Gradient, { kind: 'linear' }>
    const out = withPremultipliedBlends(g.stops)
    expect(out).toHaveLength(9)
    // Halfway the colour is already the full colour at half alpha, not a darkened mix with transparent black.
    const mid = out[4]!
    expect(mid.a).toBeCloseTo(0.5, 5)
    expect(mid.rgb[0]).toBeCloseTo(200, 3)
    expect(mid.rgb[1]).toBeCloseTo(100, 3)
    expect(withPremultipliedBlends(parseGradient('linear-gradient(rgb(1, 2, 3), rgb(4, 5, 6))')!.stops)).toHaveLength(2)
  })
})

describe('planBox: text', () => {
  const ink = 'rgb(27, 22, 38)'
  it('clips dark text to a painted fill and hides the glyph colour', () => {
    const { decls, textColor } = planBox(box({ hasText: true, color: ink }), env())
    expect(decls.get('color')).toBe('transparent')
    expect(decls.get('--bc-p0')).toBe('27 22 38 1')
    expect(decls.get('background-image')).toBe('paint(bc-p0)')
    expect(decls.get('background-clip')).toBe('text')
    expect(textColor).toMatchObject({ route: 'clip' })
  })

  it('layers the text clip on top of the element\'s own background', () => {
    const { decls } = planBox(box({ hasText: true, color: ink, backgroundColor: CREAM }), env())
    expect(decls.get('background-image')).toBe('paint(bc-p0), paint(bc-p1)')
    expect(decls.get('--bc-p0')).toBe('27 22 38 1')
    expect(decls.get('--bc-p1')).toBe('243 231 201 1')
    expect(decls.get('background-clip')).toBe('text, border-box')
  })

  it('leaves light text alone', () => {
    const { decls } = planBox(box({ hasText: true, color: 'rgb(250, 250, 250)' }), env())
    expect(decls.has('color')).toBe(false)
  })

  it('gives a child of clipped text its own clip with the inherited colour', () => {
    const { decls } = planBox(
      box({ hasText: true, color: 'rgba(0, 0, 0, 0)' }),
      env({ inherited: { color: { rgb: [27, 22, 38], a: 1 }, route: 'clip' } })
    )
    expect(decls.get('--bc-p0')).toBe('27 22 38 1')
  })

  it('does not double-correct a child of pre-corrected text', () => {
    const { decls } = planBox(
      box({ hasText: true, color: 'rgb(200, 200, 200)' }),
      env({ inherited: { color: { rgb: [50, 50, 50], a: 1 }, route: 'color' } })
    )
    expect(decls.has('color')).toBe(false)
  })

  it('without the worklet: flat gradient clip for very dark ink, pre-corrected color otherwise', () => {
    const dark = planBox(box({ hasText: true, color: ink }), env({ paint: false })).decls
    expect(dark.get('background-image')).toMatch(/^linear-gradient\(/)
    expect(dark.get('background-clip')).toBe('text')
    const mid = planBox(box({ hasText: true, color: 'rgb(120, 90, 60)' }), env({ paint: false })).decls
    expect(mid.get('color')).toMatch(/^rgba\(/)
    expect(mid.get('background-clip')).toBeUndefined()
  })

  it('never clips a field\'s text', () => {
    const { decls } = planBox(box({ hasText: true, isField: true, color: ink }), env())
    expect(decls.get('background-clip')).toBeUndefined()
    expect(decls.get('color')).toMatch(/^rgba\(/)
  })
})

describe('planBox: images', () => {
  const art = 'url("https://x/ui.webp")'
  it('a leaf with a background image gets brightness, and its paints are divided by the gain', () => {
    const { decls, layerSlot } = planBox(box({ leaf: true, backgroundImage: art }), env())
    expect(decls.get('filter')).toBe('brightness(2)')
    expect(decls.get('background-image')).toBe(art)
    expect(layerSlot).toBeNull()
    const withBg = planBox(box({ leaf: true, backgroundImage: art, backgroundColor: 'rgb(200, 100, 50)' }), env()).decls
    expect(withBg.get('--bc-p0')).toBe('100 50 25 1')
  })

  it('a container moves the image onto a brightened pseudo layer; overlay gradients ride inside it', () => {
    const p = planBox(
      box({
        hasText: false,
        backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%), ${art}`,
        backgroundSize: 'auto, cover',
        backgroundPosition: '0% 0%, 50% 50%',
        backgroundRepeat: 'repeat, no-repeat',
      }),
      env()
    )
    expect(p.layerSlot).toBe('before')
    expect(p.decls.get('--bc-bgi')).toBe(`paint(bc-p0), ${art}`)
    expect(p.decls.get('--bc-gbg')).toBe('2')
    expect(p.decls.get('background-image')).toBe('none')
    expect(p.decls.get('position')).toBe('relative')
    expect(p.decls.get('filter')).toBeUndefined()
  })

  it('no free pseudo-element: the image is left as authored', () => {
    const p = planBox(box({ backgroundImage: art }), env({ slot: () => null }))
    expect(p.layerSlot).toBeNull()
    expect(p.decls.get('background-image')).toBeUndefined()
  })

  it('<img> only gets an inline filter when the game set its own', () => {
    expect(planBox(box({ isImg: true, filter: 'brightness(1.41)' }), env()).decls.has('filter')).toBe(false)
    expect(planBox(box({ isImg: true, filter: 'none' }), env()).decls.get('filter')).toBe('brightness(1.41)')
    expect(planBox(box({ isImg: true, filter: 'saturate(1.2)' }), env()).decls.get('filter')).toBe('saturate(1.2) brightness(1.41)')
  })
})

describe('planBox: shadows', () => {
  it('turns box-shadow into drop-shadow and removes the grey original', () => {
    const { decls, usesFilterShadow } = planBox(box({ boxShadow: 'rgb(27, 22, 38) 0px 4px 0px 0px' }), env())
    expect(decls.get('filter')).toBe('drop-shadow(0px 4px 0px rgba(27,22,38,1))')
    expect(decls.get('box-shadow')).toBe('none')
    expect(usesFilterShadow).toBe(true)
  })

  it('halves the blur radius into a drop-shadow deviation and drops inset parts', () => {
    const { decls } = planBox(box({ boxShadow: 'rgba(0, 0, 0, 0.4) 0px 8px 12px 0px, rgb(255, 255, 255) 0px 1px 0px 0px inset' }), env())
    expect(decls.get('filter')).toBe('drop-shadow(0px 8px 6px rgba(0,0,0,0.4))')
  })

  it('keeps a text outline to its axis-aligned parts', () => {
    const outline =
      'rgb(27, 22, 38) 0px 1.6px 0px, rgb(27, 22, 38) 1.1px 0px 0px, rgb(27, 22, 38) -1.1px 0px 0px, rgb(27, 22, 38) 0px -1.1px 0px, ' +
      'rgb(27, 22, 38) 0.8px 0.8px 0px, rgb(27, 22, 38) -0.8px 0.8px 0px'
    const kept = pickTextShadows(parseShadows(outline).parts)
    expect(kept).toHaveLength(4)
    expect(kept.every(p => p.x === 0 || p.y === 0)).toBe(true)
    const { decls } = planBox(box({ hasText: true, color: 'rgb(255, 255, 255)', textShadow: outline }), env())
    expect(decls.get('filter')!.match(/drop-shadow/g)).toHaveLength(4)
  })

  it('does not shadow a box with its own paint (the filter would outline the whole box)', () => {
    const { decls } = planBox(box({ hasText: true, color: 'rgb(255, 255, 255)', backgroundColor: CREAM, textShadow: 'rgb(0, 0, 0) 0px 1px 0px' }), env())
    expect(decls.has('filter')).toBe(false)
  })

  it('a child that only inherits its parent\'s text-shadow adds no second filter', () => {
    const sh = 'rgb(27, 22, 38) 0px 1px 0px'
    const { decls } = planBox(box({ hasText: true, color: 'rgb(255, 255, 255)', textShadow: sh }), env({ inheritedShadow: sh }))
    expect(decls.has('filter')).toBe(false)
  })

  it('stops adding shadow filters once the budget is spent', () => {
    const { decls } = planBox(box({ boxShadow: 'rgb(0, 0, 0) 0px 4px 0px 0px' }), env({ allowShadows: false }))
    expect(decls.has('filter')).toBe(false)
    expect(decls.get('box-shadow')).toBe('none') // the grey original goes either way
  })

  it('paints zero-offset spread rings in the worklet: outer ones as border-image outset, inset ones as a layer', () => {
    const ink = 'rgb(15, 26, 48)'
    const ring = 'rgb(255, 197, 38)'
    const { decls, usesFilterShadow } = planBox(
      box({
        width: 60,
        height: 60,
        borderRadius: [30, 30, 30, 30],
        backgroundColor: 'rgb(40, 60, 120)',
        boxShadow: `${ring} 0px 0px 0px 3px inset, ${ink} 0px 0px 0px 2px, ${ink} 0px 3px 0px 2px`,
      }),
      env()
    )
    expect(decls.get('--bc-ins')).toBe('0 3 255 197 38 1')
    expect(decls.get('--bc-rings')).toBe('0 2 15 26 48 1')
    expect(decls.get('border-image-source')).toBe('paint(bc-border)')
    expect(decls.get('border-image-outset')).toBe('2px')
    expect(decls.get('border-image-slice')).toBe('50%')
    expect(decls.get('background-image')).toBe('paint(bc-inset), paint(bc-p0)')
    // The 3 px extrusion is a drop-shadow of the ringed silhouette.
    expect(decls.get('filter')).toBe('drop-shadow(0px 3px 0px rgba(15,26,48,1))')
    expect(decls.get('box-shadow')).toBe('none')
    expect(usesFilterShadow).toBe(true)
  })

  it('draws offset and blurred inset shadows in the same worklet layer', () => {
    const { decls } = planBox(
      box({
        backgroundColor: CREAM,
        borderRadius: [12, 12, 12, 12],
        boxShadow: 'rgba(120, 70, 25, 0.5) 0px 0px 16px 2.4px inset, rgba(255, 255, 255, 0.18) 6.4px 0px 0px 0px inset',
      }),
      env()
    )
    expect(decls.get('--bc-insx')).toBe('0 0 16 2.4 120 70 25 0.5 | 6.4 0 0 0 255 255 255 0.18')
    expect(decls.get('--bc-ins')).toBe('')
    expect(decls.get('background-image')).toBe('paint(bc-inset), paint(bc-p0)')
    expect(decls.get('box-shadow')).toBe('none')
  })

  it('stacks nested rings into bands, topmost colour first, and merges equal neighbours', () => {
    const rings = parseShadows('rgb(255, 255, 255) 0px 0px 0px 2px, rgb(0, 0, 0) 0px 0px 0px 4px, rgb(0, 0, 0) 0px 0px 0px 6px').parts
    const bands = ringBands(rings)
    expect(bands.map(b => [b.from, b.to, b.color.rgb.join()])).toEqual([[0, 2, '255,255,255'], [2, 6, '0,0,0']])
  })
})

describe('planBox: no worklet', () => {
  it('falls back to pre-corrected colours for background and border', () => {
    const { decls } = planBox(
      box({ backgroundColor: CREAM, borderWidth: [2, 2, 2, 2], borderColor: Array(4).fill('rgb(255, 197, 38)') as string[] }),
      env({ paint: false })
    )
    expect(decls.get('background-color')).toMatch(/^rgba\(/)
    expect(decls.get('background-color')).not.toBe(CREAM)
    expect(decls.has('background-image')).toBe(false)
    expect(decls.get('border-top-color')).toMatch(/^rgba\(/)
    expect(decls.has('border-image-source')).toBe(false)
  })
})

describe('observer filter', () => {
  it('ignores geometry-only style writes (the HUD rewrites widths every frame)', () => {
    expect(styleChangeMatters('width: 40%;', 'width: 41%;')).toBe(false)
    expect(styleChangeMatters('transform: translate(1px, 2px);', 'transform: translate(3px, 2px);')).toBe(false)
    expect(styleChangeMatters('--hp: 40%;', '--hp: 41%;')).toBe(false)
  })
  it('an element the counter already rewrote re-plans on any variable change (a cooldown sweep reads --cd)', () => {
    expect(styleChangeMatters('--cd: 0.4;', '--cd: 0.5;', true)).toBe(true)
    // ...but not for its own bookkeeping variables.
    expect(styleChangeMatters('--bc-p0: 1 2 3 1;', '--bc-p0: 1 2 3 0.5;', true)).toBe(false)
  })
  it('notices colour-bearing writes, including colour custom properties', () => {
    expect(styleChangeMatters('width: 40%;', 'width: 40%; background-color: red;')).toBe(true)
    expect(styleChangeMatters('color: red;', 'color: blue;')).toBe(true)
    expect(styleChangeMatters('--tone-color: red;', '--tone-color: blue;')).toBe(true)
    expect(styleChangeMatters('background-image: url("data:image/png;base64,AAAA");', 'background-image: url("data:image/png;base64,BBBB");')).toBe(true)
  })
})
