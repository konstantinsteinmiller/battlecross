// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * #Perf1-#Perf3: the playtest devices land in the lowest tier from their first
 * frame, the buffer is exactly the screen's pixels at fractional ratios, and
 * a device at 1-3 fps can still step its effects down.
 */

let gpu = 'normal'
vi.mock('@/use/deviceProfile', async (orig) => ({
  ...(await orig<typeof import('@/use/deviceProfile')>()),
  deviceClass: () => gpu,
  deviceRenderer: () => ''
}))
vi.mock('@/game/engine/quality', () => ({ sceneQuality: () => 'full' }))

describe('the playtest GPUs are weak devices (#Perf1-#Perf3)', () => {
  it.each([
    'ANGLE (Imagination Technologies, PowerVR Rogue GE8320, OpenGL ES 3.2)',
    'ANGLE (Imagination Technologies, PowerVR Rogue GE8322, OpenGL ES 3.2)',
    'ANGLE (ARM, Mali-G57 MC2, OpenGL ES 3.2)',
    'ANGLE (Intel, Intel(R) HD Graphics 4600 (0x00000416) Direct3D11 vs_5_0 ps_5_0, D3D11)'
  ])('%s → weak', async (s) => {
    const { classifyRenderer } = await vi.importActual<typeof import('@/use/deviceProfile')>('@/use/deviceProfile')
    expect(classifyRenderer(s)).toBe('weak')
  })

  it.each([
    'ANGLE (Qualcomm, Adreno (TM) 740, OpenGL ES 3.2)',
    'ANGLE (ARM, Mali-G710 MC10, OpenGL ES 3.2)',
    'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)'
  ])('%s → normal', async (s) => {
    const { classifyRenderer } = await vi.importActual<typeof import('@/use/deviceProfile')>('@/use/deviceProfile')
    expect(classifyRenderer(s)).toBe('normal')
  })
})

describe('the effects ladder starts where the device is (#Perf1)', () => {
  beforeEach(async () => {
    const { __resetEffectsLadder } = await import('@/game/engine/effectsLadder')
    __resetEffectsLadder()
  })

  it('a weak GPU starts on the last rung, from its first frame', async () => {
    gpu = 'weak'
    const { fxLevel, FX_TOP } = await import('@/game/engine/effectsLadder')
    expect(fxLevel()).toBe(FX_TOP)
  })

  it('a capable GPU starts with everything', async () => {
    gpu = 'normal'
    const { fxLevel } = await import('@/game/engine/effectsLadder')
    expect(fxLevel()).toBe(0)
  })

  it('a device at 2 fps steps down within seconds, counting real frame time', async () => {
    gpu = 'normal'
    const { fxLevel, stepEffectsLadder } = await import('@/game/engine/effectsLadder')
    // 6 s of 0.5 s frames: two rungs. (Fed the clamped 0.1 s step this took 40 s.)
    for (let i = 0; i < 12; i++) stepEffectsLadder(0.5)
    expect(fxLevel()).toBeGreaterThanOrEqual(2)
  })

  it('the loop feeds it the real interval, not the clamped step', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const src = readFileSync(join(__dirname, '../../src/game/engine/app.ts'), 'utf8')
    expect(src).toMatch(/stepEffectsLadder\(dtMs \/ 1000\)/)
  })
})

describe('the drawing buffer at fractional pixel ratios (#Perf2)', () => {
  // three: canvas = floor(width × ratio); viewport = round / floor of the same.
  const three = (v: number, r: number): [number, number] => [Math.floor(v * r), Math.round(v * r)]

  it.each([
    // [css w, css h, dpr, device w, device h]: the playtest screens.
    [384, 853.3333, 1.875, 720, 1600],
    [384, 853.3333, 2.8125, 1080, 2400],
    [394.5205, 876.7123, 1.825, 720, 1600],
    [2880, 1620, 0.6666667, 1920, 1080],
    [412, 915, 2, 824, 1830]
  ])('%s×%s @%s with the device box → exactly %s×%s', async (cw, ch, dpr, dw, dh) => {
    const { fitCanvas } = await import('@/game/engine/renderer')
    const f = fitCanvas(cw, ch, dpr, dw, dh)
    expect([f.bufferW, f.bufferH]).toEqual([dw, dh])
    expect(three(f.width, f.ratio)).toEqual([dw, dw])
    expect(three(f.height, f.ratio)).toEqual([dh, dh])
    expect(f.cssW).toBe('')
  })

  it.each([
    [384, 853.3333, 1.875],
    [384, 853.3333, 2.8125],
    [394.52, 876.71, 1.825],
    [2880, 1620, 0.6666667],
    [1366, 768, 1]
  ])('%s×%s @%s without it: rounded, never below, CSS snapped to buffer ÷ dpr', async (cw, ch, dpr) => {
    const { fitCanvas } = await import('@/game/engine/renderer')
    const f = fitCanvas(cw, ch, dpr)
    expect(f.bufferH).toBe(Math.round(ch * dpr))
    expect(f.bufferH).toBeGreaterThanOrEqual(Math.floor(ch * dpr))
    expect(three(f.height, f.ratio)[0]).toBe(f.bufferH)
    expect(parseFloat(f.cssH) * dpr).toBeCloseTo(f.bufferH, 6)
  })

  it('the old sizing lost a row at 1.875 (the bug), the new one does not', async () => {
    const { fitCanvas } = await import('@/game/engine/renderer')
    // A 1600-row screen at 1.875 is 853.33 CSS px; clientHeight said 853.
    expect(Math.floor(853 * 1.875)).toBe(1599)
    expect(fitCanvas(384, 853.3333, 1.875).bufferH).toBe(1600)
  })

  it('MSAA: a capable screen under 1.5×, and a weak one only below 1×', async () => {
    const { wantsMsaa } = await import('@/game/engine/renderer')
    expect(wantsMsaa(1, false)).toBe(true)
    expect(wantsMsaa(1, true)).toBe(false)
    expect(wantsMsaa(0.6666667, true)).toBe(true)
    expect(wantsMsaa(1.875, false)).toBe(false)
  })

  it('the scene sizes from the device box and hears ratio changes', async () => {
    const { readFileSync } = await import('node:fs')
    const { join } = await import('node:path')
    const src = readFileSync(join(__dirname, '../../src/game/engine/app.ts'), 'utf8')
    expect(src).toContain("box: 'device-pixel-content-box'")
    expect(src).toContain('devicePixelContentBoxSize')
    expect(src).toMatch(/matchMedia\(`\(resolution: /)
  })
})

describe('what a playtest reports (#Perf1-#Perf3)', () => {
  it('the first steady second', async () => {
    const { firstSteady } = await import('@/game/engine/perfReport')
    expect(firstSteady([2, 1, 3, 2, 9, 10, 9, 10, 9, 10])).toBe(4)
    expect(firstSteady([60, 60, 59, 60, 60])).toBe(0)
    expect(firstSteady([1, 2])).toBe(-1)
  })

  it('the GPU name fits the event pipe', async () => {
    const { shortGpu } = await import('@/game/engine/perfReport')
    expect(shortGpu('ANGLE (Imagination Technologies, PowerVR Rogue GE8320, OpenGL ES 3.2)')).toBe('Imagination Technologies, PowerVR Rogue GE8320')
    expect(shortGpu('ANGLE (ARM, Mali-G57 MC2, OpenGL ES 3.2)')).toBe('ARM, Mali-G57 MC2')
    expect(shortGpu('ANGLE (Intel, Intel(R) HD Graphics 4600 (0x00000416) Direct3D11 vs_5_0 ps_5_0, D3D11)')).toBe('Intel, Intel(R) HD Graphics 4600')
  })

  it('sends one sample at 30 s and one at 120 s of play, with tier, pixels and GPU', async () => {
    const { __resetPerfReport, notePerfFrame } = await import('@/game/engine/perfReport')
    const { analyticsLog, __resetAnalytics } = await import('@/use/useAnalytics')
    __resetAnalytics()
    __resetPerfReport()
    let t = 0
    for (let i = 0; i < 125 * 10; i++) { notePerfFrame(t); t += 100 }
    const s = analyticsLog().filter(e => e.event === 'perf_sample')
    expect(s.map(e => e.props.at)).toEqual([30, 120])
    expect(s[0]!.props.fps).toBe(10)
    for (const k of ['tier', 'fx', 'dpr', 'bufW', 'bufH', 'gpu', 'steadyAt', 'calls', 'tris']) expect(s[0]!.props).toHaveProperty(k)
  })
})
