import { track } from '@/use/useAnalytics'
import { deviceClass, deviceRenderer } from '@/use/deviceProfile'
import { canvasFit, getRenderer, hasRenderer } from './renderer'
import { fxLevel } from './effectsLadder'

/**
 * ─── What a playtest device reports (#Perf1–#Perf3) ──────────────────────────
 *
 * Nobody here holds the phones that are slow; the owner reads their numbers
 * from Poki playtests. So the game reports them itself, through the portal's
 * own event pipe (`track` → Poki `customEvent`, GamePix, a host's `gtag`):
 * one `perf_sample` after 30 s of play and one after 120 s, each with the
 * frame rate of the last ten seconds, the second play first ran steady, the
 * effects rung, the device class, the pixel ratio, the drawing buffer, draws
 * and triangles per frame, the cores and the GPU's name.
 *
 * The same numbers show in the perf meter (`FPerfMeter`, `?perfhud=1` or the
 * debug flag) and on `window.__bcPerf()` under `?perfhud=1`.
 *
 * Fed by the game loop's frames only (`engine/app.ts`): a paused game, an ad
 * or a menu is not counted as slow play.
 */

/** Seconds of play after which a sample is sent. */
export const SAMPLE_AT = [30, 120] as const
/** Seconds kept. */
const KEEP = 130

const perSec: number[] = []
let secStart = -1
let inSec = 0
let played = 0
let steadyAt = -1
const sent = new Set<number>()
let lastCalls = 0
let lastTris = 0
let lastFrames = 0
let calls = 0
let tris = 0

/**
 * The first second from which play ran steady: the first five-second window
 * whose slowest second is at least 75 % of its fastest, and stays so. -1
 * until there is one. Pure, for the tests.
 */
export const firstSteady = (fps: readonly number[]): number => {
  for (let i = 0; i + 5 <= fps.length; i++) {
    const w = fps.slice(i, i + 5)
    const hi = Math.max(...w)
    if (hi > 0 && Math.min(...w) >= hi * 0.75) return i
  }
  return -1
}

/** "ANGLE (ARM, Mali-G57 MC2, OpenGL ES 3.2)" → "ARM, Mali-G57 MC2": the
 *  part that names the GPU, within the event pipe's 64 characters. */
export const shortGpu = (s: string): string =>
  s.replace(/^ANGLE \(/, '').replace(/\)$/, '')
    .replace(/,\s*(OpenGL ES|OpenGL|Direct3D|Vulkan|D3D|Metal)[^,]*$/i, '')
    .replace(/\s*\(0x[0-9a-f]+\)/i, '')
    .replace(/\s*Direct3D\S*.*$/i, '')
    .trim().slice(0, 64)

export interface PerfSnapshot {
  fps: number
  played: number
  steadyAt: number
  fx: number
  tier: string
  dpr: number
  bufW: number
  bufH: number
  cssW: number
  cssH: number
  calls: number
  tris: number
  cores: number
  gpu: string
}

const avgFps = (n: number): number => {
  const w = perSec.slice(-n)
  return w.length ? Math.round(w.reduce((a, b) => a + b, 0) / w.length) : 0
}

export const perfSnapshot = (): PerfSnapshot => {
  const fit = canvasFit()
  let tier = 'normal'
  try { tier = deviceClass() } catch { /* no WebGL to ask */ }
  return {
    fps: avgFps(10),
    played,
    steadyAt,
    fx: fxLevel(),
    tier,
    dpr: Math.round((typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1) * 10000) / 10000,
    bufW: fit?.bufferW ?? 0,
    bufH: fit?.bufferH ?? 0,
    cssW: fit ? Math.round(fit.width) : 0,
    cssH: fit ? Math.round(fit.height) : 0,
    calls,
    tris,
    cores: typeof navigator === 'undefined' ? 0 : navigator.hardwareConcurrency ?? 0,
    gpu: shortGpu(deviceRenderer())
  }
}

/** One frame of the game loop, at `now` (ms, the RAF timestamp). */
export const notePerfFrame = (now: number): void => {
  if (secStart < 0) secStart = now
  inSec++
  if (now - secStart < 1000) return
  // A gap of whole seconds (a pause between frames that are fed) is not play.
  const gap = now - secStart
  if (gap < 2000) {
    perSec.push(inSec)
    if (perSec.length > KEEP) perSec.shift()
    played++
    if (steadyAt < 0 && perSec.length === played) steadyAt = firstSteady(perSec)
    sampleCalls()
    for (const at of SAMPLE_AT) {
      if (played >= at && !sent.has(at)) {
        sent.add(at)
        const s = perfSnapshot()
        track('perf_sample', { at, ...s })
      }
    }
  }
  secStart = now
  inSec = 0
}

/** Draws and triangles per frame over the last second (three's counters run
 *  on: `info.autoReset` is off, `engine/renderer.ts`). */
const sampleCalls = (): void => {
  if (!hasRenderer()) return
  const info = getRenderer().info
  const frames = info.render.frame - lastFrames
  if (frames > 0) {
    calls = Math.round((info.render.calls - lastCalls) / frames)
    tris = Math.round((info.render.triangles - lastTris) / frames)
  }
  lastFrames = info.render.frame
  lastCalls = info.render.calls
  lastTris = info.render.triangles
}

/** Is the perf meter asked for on the URL (`?perfhud=1`)? */
export const perfHudOn = (): boolean => {
  try { return new URLSearchParams(window.location.search).has('perfhud') } catch { return false }
}

/** `window.__bcPerf()` for a browser check, under `?perfhud=1` only. */
export const exposePerf = (): void => {
  if (!perfHudOn()) return
  ;(window as unknown as Record<string, unknown>).__bcPerf = () => ({ ...perfSnapshot(), perSec: [...perSec] })
}

/** Test seam. */
export const __resetPerfReport = (): void => {
  perSec.length = 0
  secStart = -1
  inSec = 0
  played = 0
  steadyAt = -1
  sent.clear()
  lastCalls = lastTris = lastFrames = calls = tris = 0
}
