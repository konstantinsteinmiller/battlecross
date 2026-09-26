import {
  Color, DirectionalLight, Fog, HemisphereLight, PerspectiveCamera, Scene, WebGLRenderTarget,
  type WebGLRenderer
} from 'three'
import { buildBossRig, poseBoss, type BossId } from './bosses'
import type { Rig } from './kit'
import { getRenderer, hasRenderer } from '../engine/renderer'

/**
 * ─── Boss portraits ──────────────────────────────────────────────────────────
 *
 * The objective card says "Defeat Scrapper", and a playtester still took a
 * Guardroid for the boss: a name is not a face. So the card shows a small
 * round portrait, drawn ONCE per boss per session from the real rig
 * (`buildBossRig`), read back to a PNG data URL and cached here.
 *
 * It borrows the game's renderer for a single draw into a small render
 * target of its own, so the canvas size is never touched, and the render
 * target and clear colour are put back before anything else draws.
 *
 * No new shaders. The stage copies the mission's light rig (one hemisphere,
 * one sun, a linear fog), and a render-target draw is the exact program
 * variant `Mission.warmUp` already compiled for every machine in the sector
 * (a render target outputs linear colour, so its programs differ from the
 * screen's). The fog is there for that match and starts far beyond the
 * camera, so it tints nothing. A different stage would compile new programs
 * mid-mission, and a compile is a stall.
 *
 * The rest is kept off the frame: the rig is built in one idle slot and
 * drawn in another, the pixels come back through an async read that polls a
 * fence rather than blocking on the GPU, and the PNG is encoded in a third.
 */

/** Pixels on a side: the card's largest badge (46 px) on a 2-3× screen. */
export const PORTRAIT_SIZE = 128
/** Narrow lens (vertical degrees): flatter, like a portrait lens, and
 *  nothing bulges. */
export const PORTRAIT_FOV = 24
const FOV = PORTRAIT_FOV
/** A three-quarter turn, so faces and crests read as shapes, not flat masks. */
const YAW = 0.35

const urls = new Map<BossId, string>()
const pending = new Map<BossId, Promise<string | null>>()

/** The finished portrait, or null while it is not rendered yet. */
export const cachedBossPortrait = (id: BossId): string | null => urls.get(id) ?? null

/**
 * The boss's portrait as a PNG data URL. The first call renders it (spread
 * over idle time); later calls share that promise and then the cache.
 * Resolves null where it cannot be drawn (no renderer, a lost context, no 2D
 * canvas); a later mission may try again.
 */
export const bossPortrait = (id: BossId): Promise<string | null> => {
  const hit = urls.get(id)
  if (hit) return Promise.resolve(hit)
  let job = pending.get(id)
  if (!job) {
    job = renderPortrait(id)
      .then((url) => {
        if (url) urls.set(id, url)
        return url
      })
      .catch((e: unknown) => {
        console.warn('[portrait] could not draw', id, e)
        return null
      })
      .finally(() => { pending.delete(id) })
    pending.set(id, job)
  }
  return job
}

type IdleWindow = { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }

/** Wait for the main thread to be idle (capped, so a busy fight cannot
 *  starve it forever); Safari has no `requestIdleCallback`, so a timer. */
const idle = (): Promise<void> => new Promise((resolve) => {
  const ric = typeof window !== 'undefined' ? (window as IdleWindow).requestIdleCallback : undefined
  if (ric) ric(() => resolve(), { timeout: 1500 })
  else setTimeout(resolve, 80)
})

const lost = (r: WebGLRenderer): boolean => r.getContext().isContextLost()

const renderPortrait = async (id: BossId): Promise<string | null> => {
  await idle()
  if (!hasRenderer() || lost(getRenderer())) return null
  const r = getRenderer()

  // Slot 1: the rig at rest-idle, on a stage lit like a mission (the
  // Scrapyard's sky and sun, the key swung round to the front-left).
  const rig = buildBossRig(id)
  poseBoss(rig, id, 0, 'idle', 0)
  const scene = new Scene()
  scene.fog = new Fog(0x000000, 1000, 2000)
  const sun = new DirectionalLight(0xfff4dc, 1.3)
  sun.position.set(-0.5, 1, 0.9)
  scene.add(new HemisphereLight(0xe6f3ff, 0x4a4f6a, 1.1), sun, rig.root)
  const cam = new PerspectiveCamera(FOV, 1, 0.05, 50)
  const geo = rig.mesh.geometry
  geo.computeBoundingBox()
  const box = geo.boundingBox!
  const view = portraitFraming(box.min, box.max)
  cam.position.set(view.position[0], view.position[1], view.position[2])
  cam.lookAt(view.target[0], view.target[1], view.target[2])
  const rt = new WebGLRenderTarget(PORTRAIT_SIZE, PORTRAIT_SIZE, { samples: 4 })

  try {
    // Slot 2: one draw, then the async read.
    await idle()
    if (lost(r)) return null
    const prevTarget = r.getRenderTarget()
    const prevColor = r.getClearColor(new Color())
    const prevAlpha = r.getClearAlpha()
    try {
      r.setRenderTarget(rt)
      r.setClearColor(0x000000, 0)
      r.clear()
      r.render(scene, cam)
    } finally {
      r.setClearColor(prevColor, prevAlpha)
      r.setRenderTarget(prevTarget)
    }
    const raw = new Uint8Array(PORTRAIT_SIZE * PORTRAIT_SIZE * 4)
    await r.readRenderTargetPixelsAsync(rt, 0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE, raw)

    // Slot 3: to sRGB, upright, PNG.
    await idle()
    return encodePng(toImageBytes(raw, PORTRAIT_SIZE), PORTRAIT_SIZE)
  } finally {
    rt.dispose()
    disposeRig(rig)
  }
}

/** Everything the rig owns. The outline material is NOT the rig's: `outlineMat`
 *  shares one per thickness with every machine on screen. */
const disposeRig = (rig: Rig): void => {
  rig.mesh.geometry.dispose()
  if (rig.outline && rig.outline.geometry !== rig.mesh.geometry) rig.outline.geometry.dispose()
  rig.material.dispose()
  rig.glowMaterial.dispose()
  rig.mesh.skeleton.dispose()
}

const encodePng = (bytes: Uint8ClampedArray<ArrayBuffer>, size: number): string | null => {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.putImageData(new ImageData(bytes, size, size), 0, 0)
  return canvas.toDataURL('image/png')
}

type V3 = { x: number; y: number; z: number }

/**
 * Where the camera stands for a bust of a rig with this rest-pose bounding
 * box. The frame is square: the top two thirds of a tall rig (head, crest,
 * shoulders), or most of a wide one (Dr. Vex's capsule is its face). The
 * camera turns by `YAW` around the frame's centre, a touch above it, and
 * backs off until the frame fills the lens, measured from the rig's front.
 */
export const portraitFraming = (min: V3, max: V3): { position: [number, number, number]; target: [number, number, number] } => {
  const h = max.y - min.y
  const w = max.x - min.x
  const size = Math.max(h * 0.66, w * 0.8)
  const cx = (min.x + max.x) / 2
  const cy = max.y - size / 2
  const cz = (min.z + max.z) / 2
  const dist = (size / 2) / Math.tan((FOV * Math.PI) / 360) * 1.05 + (max.z - cz)
  return {
    position: [cx + Math.sin(YAW) * dist, cy + dist * 0.08, cz + Math.cos(YAW) * dist],
    target: [cx, cy, cz]
  }
}

/** Linear 0..1 → an sRGB byte. */
const srgbByte = (v: number): number => {
  const l = v >= 1 ? 1 : v <= 0 ? 0 : v
  return Math.round((l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055) * 255)
}
/** The same for the common case, a fully covered pixel. */
const SRGB_LUT = Uint8Array.from({ length: 256 }, (_, i) => srgbByte(i / 255))

/**
 * What the render target holds → what `ImageData` wants.
 *
 * The target stores LINEAR colour (a render-target draw skips the output
 * encoding), bottom row first, and its edges come out PREMULTIPLIED: the
 * multisample resolve averages covered samples with the transparent clear.
 * `ImageData` is sRGB, top row first and straight alpha, so each pixel is
 * un-premultiplied (in linear, where the average was taken), encoded, and its
 * row flipped. Transparent pixels stay all zero.
 */
export const toImageBytes = (src: Uint8Array, size: number): Uint8ClampedArray<ArrayBuffer> => {
  const out = new Uint8ClampedArray(size * size * 4)
  const row = size * 4
  for (let y = 0; y < size; y++) {
    const from = (size - 1 - y) * row
    const to = y * row
    for (let x = 0; x < row; x += 4) {
      const a = src[from + x + 3]!
      if (a === 0) continue
      for (let c = 0; c < 3; c++) {
        const v = src[from + x + c]!
        out[to + x + c] = a === 255 ? SRGB_LUT[v]! : srgbByte(v / a)
      }
      out[to + x + 3] = a
    }
  }
  return out
}
