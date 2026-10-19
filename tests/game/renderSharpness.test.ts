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
    setPixelRatio (r: number): void { ratios.push(r) }
    setSize (): void {}
  }
}))
vi.mock('@/use/deviceProfile', () => ({ deviceClass: () => (weak ? 'weak' : 'normal') }))
vi.mock('@/game/engine/glContext', () => ({ watchContextLoss: () => {} }))

describe('render sharpness: the canvas draws at native pixel ratio', () => {
  const dpr0 = window.devicePixelRatio
  beforeEach(() => { vi.resetModules(); ratios.length = 0 })
  afterEach(() => { Object.defineProperty(window, 'devicePixelRatio', { value: dpr0, configurable: true }) })

  for (const dpr of [1, 1.25, 1.5, 2, 3])
    for (const w of [false, true])
      it(`dpr ${dpr}, ${w ? 'weak' : 'normal'} device → pixel ratio ${dpr}`, async () => {
        weak = w
        Object.defineProperty(window, 'devicePixelRatio', { value: dpr, configurable: true })
        const { getRenderer, resizeRenderer } = await import('@/game/engine/renderer')
        getRenderer()
        resizeRenderer({ aspect: 1, updateProjectionMatrix: () => {} } as never, 390, 844)
        expect(ratios.length).toBeGreaterThan(0)
        for (const r of ratios) expect(r).toBeGreaterThanOrEqual(dpr)
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
