// @vitest-environment jsdom
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The game canvas must never draw below the display's own pixel ratio
 * (render-sharpness rule): a buffer drawn small and stretched up reads soft on
 * a 3× phone. A weak device gives up effects (`effectsLadder`), never pixels.
 */

const ratios: number[] = []
/** Every drawing buffer the renderer was given: [width, height] in device px. */
const buffers: Array<[number, number]> = []
let weak = false

vi.mock('three', async (orig) => ({
  ...(await orig<typeof import('three')>()),
  WebGLRenderer: class {
    debug = { checkShaderErrors: true }
    shadowMap = { enabled: true }
    info = { autoReset: true }
    outputColorSpace = ''
    toneMapping = 0
    autoClear = true
    domElement = { style: { width: '', height: '' } }
    setPixelRatio (r: number): void { ratios.push(r) }
    setSize (): void {}
    // three's own arithmetic: floor(width × ratio).
    setDrawingBufferSize (w: number, h: number, r: number): void { ratios.push(r); buffers.push([Math.floor(w * r), Math.floor(h * r)]) }
  }
}))
vi.mock('@/use/deviceProfile', () => ({ deviceClass: () => (weak ? 'weak' : 'normal') }))
vi.mock('@/game/engine/glContext', () => ({ watchContextLoss: () => {} }))

describe('render sharpness: the canvas draws at native pixel ratio', () => {
  const dpr0 = window.devicePixelRatio
  beforeEach(() => { vi.resetModules(); ratios.length = 0; buffers.length = 0 })
  afterEach(() => { Object.defineProperty(window, 'devicePixelRatio', { value: dpr0, configurable: true }) })

  for (const dpr of [0.6666667, 1, 1.25, 1.5, 1.825, 1.875, 2, 2.8125, 3])
    for (const w of [false, true])
      it(`dpr ${dpr}, ${w ? 'weak' : 'normal'} device → pixel ratio ${dpr}`, async () => {
        weak = w
        Object.defineProperty(window, 'devicePixelRatio', { value: dpr, configurable: true })
        const { getRenderer, resizeRenderer } = await import('@/game/engine/renderer')
        getRenderer()
        resizeRenderer({ aspect: 1, updateProjectionMatrix: () => {} } as never, 390, 844)
        expect(ratios.length).toBeGreaterThan(0)
        for (const r of ratios) expect(r).toBeGreaterThanOrEqual(dpr)
        // The buffer is the box's device pixels, never fewer (#Perf2).
        const [bw, bh] = buffers[buffers.length - 1]!
        expect(bw).toBeGreaterThanOrEqual(Math.floor(390 * dpr))
        expect(bh).toBeGreaterThanOrEqual(Math.floor(844 * dpr))
      })

  it('nothing in the game lowers the pixel ratio behind the renderer\'s back', () => {
    // Only the renderer module and the dev benches may set a pixel ratio.
    const allowed = new Set(['engine/renderer.ts', 'gfx/fxBench.ts', 'gfx/rigs/bench.ts'])
    const root = join(__dirname, '../../src/game')
    const walk = (d: string): string[] => readdirSync(d).flatMap((f) => {
      const p = join(d, f)
      return statSync(p).isDirectory() ? walk(p) : [p]
    })
    const offenders = walk(root)
      .filter((p) => /\.(ts|vue)$/.test(p))
      .map((p) => p.slice(root.length + 1).replace(/\\/g, '/'))
      .filter((rel) => !allowed.has(rel) && /setPixelRatio|setDrawingBufferSize/.test(readFileSync(join(root, rel), 'utf8')))
    expect(offenders).toEqual([])
  })
})
