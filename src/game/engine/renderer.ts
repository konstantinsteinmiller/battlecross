import {
  WebGLRenderer, SRGBColorSpace, NoToneMapping, PerspectiveCamera
} from 'three'
import { deviceClass } from '@/use/deviceProfile'
import { perfFlag, IOS_LEGACY } from '@/use/perfVariants'
import { isAppleTouch } from '@/use/deviceProfile'
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

/** Device-pixel-ratio cap. A 3× phone rendering at 3× fills 9× the pixels of
 *  1× for a picture that a cel-shaded, outlined style barely benefits from. */
export const dprCap = (): number => {
  if (perfFlag('dpr1')) return 1
  const weak = deviceClass() === 'weak'
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
  if (weak) return 1
  if (!IOS_LEGACY && isAppleTouch()) return 1.5
  return coarse ? 1.6 : 2
}

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
