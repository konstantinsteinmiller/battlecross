import {
  CanvasTexture, RepeatWrapping, ClampToEdgeWrapping, SRGBColorSpace, LinearMipmapLinearFilter, LinearFilter, type Texture
} from 'three'
import { mulberry32 } from '../sim/rng'
import { TEXTURE_FILES } from '../assets/overrides'

/**
 * Canvas-baked textures. The world is coloured by vertex colours (per zone
 * theme); the only maps are a GREYSCALE ground detail (painterly blotches and
 * speckle, so one texture serves every theme) and the soft sprites the effects
 * use. Baked once, at boot, from the loader (`boot.ts`), never lazily by the
 * render loop.
 *
 * `public/images/textures/ground.webp|png|jpg` replaces the ground detail (see
 * `game/assets/overrides.ts`); a file that fails to decode keeps the baked one.
 */

let groundTex: Texture | null = null
let glowTex: Texture | null = null
let ringTex: Texture | null = null
let softTex: Texture | null = null

const make = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void): Texture => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d', { willReadFrequently: true })!
  draw(g)
  const t = new CanvasTexture(c)
  t.wrapS = RepeatWrapping
  t.wrapT = RepeatWrapping
  t.colorSpace = SRGBColorSpace
  t.minFilter = LinearMipmapLinearFilter
  t.magFilter = LinearFilter
  t.anisotropy = 4
  return t
}

const overrideImages = new Map<string, HTMLImageElement>()

/** Load the drop-in detail maps. Awaited by the boot loader BEFORE anything
 *  bakes; a file that fails to decode keeps its procedural version. */
export const loadTextureOverrides = async (): Promise<void> => {
  await Promise.all([...TEXTURE_FILES].map(async ([name, url]) => {
    const img = new Image()
    img.src = url
    try {
      await img.decode()
      overrideImages.set(name, img)
    } catch (e) {
      console.warn(`[textures] drop-in "${name}" could not be decoded — keeping the procedural one`, e)
    }
  }))
}

/** A tiling greyscale ground detail: big soft blotches, small speckles, a few
 *  hand-drawn tufts. Mid-grey averages to ~0.9 so the vertex colour reads true. */
const drawGround = (g: CanvasRenderingContext2D): void => {
  const S = 256
  const img = overrideImages.get('ground')
  if (img) { g.drawImage(img, 0, 0, S, S); return }
  g.fillStyle = '#e6e6e6'
  g.fillRect(0, 0, S, S)
  const rng = mulberry32(4711)
  // Soft blotches, wrapped at the edges so the tile repeats without a seam.
  for (let n = 0; n < 26; n++) {
    const x = rng() * S
    const y = rng() * S
    const r = 18 + rng() * 34
    const light = rng() > 0.5
    for (const ox of [-S, 0, S]) {
      for (const oy of [-S, 0, S]) {
        const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r)
        grad.addColorStop(0, light ? 'rgba(255,255,255,0.5)' : 'rgba(170,170,170,0.42)')
        grad.addColorStop(1, light ? 'rgba(255,255,255,0)' : 'rgba(170,170,170,0)')
        g.fillStyle = grad
        g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2)
      }
    }
  }
  // Tufts: three short strokes fanning up.
  g.lineCap = 'round'
  for (let n = 0; n < 34; n++) {
    const x = 8 + rng() * (S - 16)
    const y = 8 + rng() * (S - 16)
    g.strokeStyle = rng() > 0.5 ? 'rgba(255,255,255,0.75)' : 'rgba(150,150,150,0.6)'
    g.lineWidth = 2
    for (let k = -1; k <= 1; k++) {
      g.beginPath()
      g.moveTo(x, y)
      g.lineTo(x + k * 3.5, y - 5 - rng() * 3)
      g.stroke()
    }
  }
  // Speckle.
  for (let n = 0; n < 240; n++) {
    g.fillStyle = rng() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(140,140,140,0.45)'
    g.beginPath()
    g.arc(rng() * S, rng() * S, 0.6 + rng() * 1.4, 0, Math.PI * 2)
    g.fill()
  }
}

export const groundDetail = (): Texture => (groundTex ??= make(256, 256, drawGround))

/** Soft radial glow (particles, pickups, flashes). White, additive. */
export const glowTexture = (): Texture => {
  if (glowTex) return glowTex
  glowTex = make(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.25, 'rgba(255,255,255,0.85)')
    grad.addColorStop(0.6, 'rgba(255,255,255,0.25)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
  })
  glowTex.wrapS = glowTex.wrapT = ClampToEdgeWrapping
  return glowTex
}

/** A soft dark disc: blob shadows. */
export const softDisc = (): Texture => {
  if (softTex) return softTex
  softTex = make(64, 64, (g) => {
    const grad = g.createRadialGradient(32, 32, 4, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.55, 'rgba(255,255,255,0.75)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
  })
  softTex.wrapS = softTex.wrapT = ClampToEdgeWrapping
  return softTex
}

/** Thin ring (shockwaves, target rings). White, additive. */
export const ringTexture = (): Texture => {
  if (ringTex) return ringTex
  ringTex = make(128, 128, (g) => {
    g.clearRect(0, 0, 128, 128)
    g.beginPath()
    g.arc(64, 64, 54, 0, Math.PI * 2)
    g.lineWidth = 10
    g.strokeStyle = 'rgba(255,255,255,1)'
    g.shadowColor = 'rgba(255,255,255,0.9)'
    g.shadowBlur = 8
    g.stroke()
  })
  ringTex.wrapS = ringTex.wrapT = ClampToEdgeWrapping
  return ringTex
}

/** Bake every shared texture now (called from the boot loader). */
export const bakeTextures = (): void => {
  groundDetail()
  glowTexture()
  softDisc()
  ringTexture()
}
