import {
  WebGLRenderer, SRGBColorSpace, NoToneMapping, PerspectiveCamera
} from 'three'
import { deviceClass } from '@/use/deviceProfile'
import { perfFlag } from '@/use/perfVariants'
import { watchContextLoss } from './glContext'

/**
 * The one WebGL renderer, owned by a module singleton rather than by the
 * scene component.
 *
 * The loader (`useAssets.preloadAssets` → `boot.primeGame`) has to build the
 * first scene and compile its shaders WHILE the splash is up, and that is only
 * possible if the renderer exists before `GameScene.vue` mounts. So the canvas
 * is created here, detached, and the scene component simply adopts it into
 * its container when it mounts.
 */
let renderer: WebGLRenderer | null = null

/**
 * The canvas draws at the screen's OWN pixel ratio (outstanding question 43):
 * drawn lower and stretched up, a 3× phone shows a soft picture. A device that
 * cannot keep up gives up effects instead (`engine/effectsLadder.ts`), never
 * resolution.
 *
 * The old caps (1× weak, 1.5× iPhone, 1.6× touch, 2× else) lost their A/B
 * (`PERF-LEDGER.md`, 2026-10-06). `?perf=dpr1` draws at 1× for profiling.
 */
export const dprCap = (): number => (perfFlag('dpr1') ? 1 : Infinity)

/** The screen's pixel ratio right now (zoom changes it), within `dprCap`. */
export const screenDpr = (): number => {
  const d = typeof window === 'undefined' ? 1 : window.devicePixelRatio
  return Math.min(d > 0 && Number.isFinite(d) ? d : 1, dprCap())
}

/**
 * ─── The drawing buffer, one buffer pixel per screen pixel (#Perf2) ──────────
 *
 * Playtesters at `devicePixelRatio` 2.8125, 1.875 and 0.667 saw a soft
 * picture. The ratio itself was honoured; the SIZE was not: the buffer was
 * `floor(clientHeight × dpr)` with `clientHeight` rounded to whole CSS pixels,
 * so a 2400-pixel-tall screen at 1.875 (853.33 CSS px) got a 1599-row buffer,
 * which the compositor stretched by 1/1599 over the whole picture. Every row
 * was resampled: soft everywhere, though only by a fraction of a pixel.
 *
 * So the buffer is sized in DEVICE pixels: the exact count the browser
 * reports for the canvas box (`devicePixelContentBoxSize`) where it can, else
 * the box's fractional CSS size × dpr, rounded (the caller then snaps the CSS
 * size so that CSS × dpr is that whole number, `snapCss`). Never fewer pixels
 * than the screen has there, at any ratio: below 1 (a desktop zoomed out to
 * 67 %) the buffer is the screen's own pixels too, not more and not fewer.
 *
 * three sizes the canvas as `floor(width × ratio)` and its viewport as
 * `round`/`floor` of the same product, so the logical width handed to it is
 * the buffer width over the ratio plus a quarter pixel: both land on the
 * buffer width exactly, with no float error able to drop the last column.
 */
export interface CanvasFit {
  /** three's pixel ratio. */
  ratio: number
  /** three's logical size (CSS px, fractional). */
  width: number
  height: number
  /** The drawing buffer, in device pixels. */
  bufferW: number
  bufferH: number
  /** Set the canvas's CSS size to these (px), or '' to leave it filling its box. */
  cssW: string
  cssH: string
}

export const fitCanvas = (cssW: number, cssH: number, dpr: number, deviceW = 0, deviceH = 0): CanvasFit => {
  const ratio = dpr > 0 && Number.isFinite(dpr) ? dpr : 1
  const exact = deviceW > 0 && deviceH > 0
  const bufferW = Math.max(1, exact ? Math.round(deviceW) : Math.round(Math.max(0, cssW) * ratio))
  const bufferH = Math.max(1, exact ? Math.round(deviceH) : Math.round(Math.max(0, cssH) * ratio))
  return {
    ratio,
    width: (bufferW + 0.25) / ratio,
    height: (bufferH + 0.25) / ratio,
    bufferW,
    bufferH,
    // Without the device box the browser places a 100 % canvas on whatever
    // fraction its box comes to; a CSS size of buffer / dpr maps it 1:1.
    cssW: exact ? '' : `${bufferW / ratio}px`,
    cssH: exact ? '' : `${bufferH / ratio}px`
  }
}

/** The last fit applied (telemetry, the perf meter). */
let lastFit: CanvasFit | null = null
export const canvasFit = (): CanvasFit | null => lastFit

/**
 * MSAA where it is cheap and visible: at DPR ≥ 1.5 the outlines are already
 * smooth, and on a weak GPU the extra samples cost real frames — except below
 * 1×, where the buffer is a fraction of the window (a desktop zoomed out) and
 * the steps it would leave are a whole CSS pixel and more.
 */
export const wantsMsaa = (dpr: number, weak: boolean): boolean => dpr < 1.5 && (!weak || dpr < 1)

export const getRenderer = (): WebGLRenderer => {
  if (renderer) return renderer
  const canvas = document.createElement('canvas')
  canvas.className = 'game-canvas'
  watchContextLoss(canvas)
  const dpr = screenDpr()
  renderer = new WebGLRenderer({
    canvas,
    antialias: wantsMsaa(dpr, deviceClass() === 'weak'),
    alpha: false,
    powerPreference: 'high-performance',
    stencil: false,
    preserveDrawingBuffer: false
  })
  // The info-log reads after every link are synchronous: each new program
  // stalls the main thread until the GPU has compiled it. Dev keeps them
  // (shader errors are worth seeing); a build does not pay for them.
  renderer.debug.checkShaderErrors = !import.meta.env.PROD
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NoToneMapping
  renderer.autoClear = false
  renderer.shadowMap.enabled = false
  renderer.info.autoReset = false
  sizeRenderer(window.innerWidth, window.innerHeight)
  return renderer
}

export const hasRenderer = (): boolean => renderer !== null

/**
 * Size the buffer to the canvas box: `w` × `h` CSS px (fractional is fine),
 * and the box's device pixels when the browser reported them (`fitCanvas`).
 * The ratio is read again every time: a zoom or a move to another screen
 * changes it.
 */
export const sizeRenderer = (w: number, h: number, deviceW = 0, deviceH = 0): CanvasFit => {
  const r = getRenderer()
  const fit = fitCanvas(Math.max(1, w), Math.max(1, h), screenDpr(), perfFlag('dpr1') ? 0 : deviceW, perfFlag('dpr1') ? 0 : deviceH)
  r.setDrawingBufferSize(fit.width, fit.height, fit.ratio)
  const style = r.domElement.style
  if (style) { style.width = fit.cssW; style.height = fit.cssH }
  lastFit = fit
  return fit
}

export const resizeRenderer = (camera: PerspectiveCamera, w: number, h: number, deviceW = 0, deviceH = 0): void => {
  const fit = sizeRenderer(w, h, deviceW, deviceH)
  // The FOV is the mode's own (the follow camera keeps a fixed narrow one and
  // fits the view by distance, `engine/camera.ts`).
  camera.aspect = fit.bufferW / fit.bufferH
  camera.updateProjectionMatrix()
}
