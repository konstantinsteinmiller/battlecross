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

export const getRenderer = (): WebGLRenderer => {
  if (renderer) return renderer
  const canvas = document.createElement('canvas')
  canvas.className = 'game-canvas'
  watchContextLoss(canvas)
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap())
  renderer = new WebGLRenderer({
    canvas,
    // MSAA only where it is cheap and visible: at DPR ≥ 1.5 the outlines are
    // already smooth, and on a weak GPU the extra samples cost real frames.
    antialias: dpr < 1.5 && deviceClass() !== 'weak',
    alpha: false,
    powerPreference: 'high-performance',
    stencil: false,
    preserveDrawingBuffer: false
  })
  // The info-log reads after every link are synchronous: each new program
  // stalls the main thread until the GPU has compiled it. Dev keeps them
  // (shader errors are worth seeing); a build does not pay for them.
  renderer.debug.checkShaderErrors = !import.meta.env.PROD
  renderer.setPixelRatio(dpr)
  renderer.outputColorSpace = SRGBColorSpace
  renderer.toneMapping = NoToneMapping
  renderer.autoClear = false
  renderer.shadowMap.enabled = false
  renderer.info.autoReset = false
  const w = Math.max(1, window.innerWidth)
  const h = Math.max(1, window.innerHeight)
  renderer.setSize(w, h, false)
  return renderer
}

export const hasRenderer = (): boolean => renderer !== null

export const resizeRenderer = (camera: PerspectiveCamera, w: number, h: number): void => {
  const r = getRenderer()
  const width = Math.max(1, Math.floor(w))
  const height = Math.max(1, Math.floor(h))
  r.setSize(width, height, false)
  // The FOV is the mode's own (the follow camera keeps a fixed narrow one and
  // fits the view by distance, `engine/camera.ts`).
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}
