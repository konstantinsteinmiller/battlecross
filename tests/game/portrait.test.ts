// The boss portrait on the objective card (src/game/models/portrait.ts). The
// GPU half (one draw into a render target, an async read) needs a browser;
// what can go wrong in plain arithmetic is pinned here: the pixels the render
// target hands back are linear, premultiplied and upside down, and the bust
// has to frame a tall humanoid and Dr. Vex's wide capsule alike.

import { describe, expect, it } from 'vitest'
import {
  PORTRAIT_FOV, bossPortrait, cachedBossPortrait, portraitFraming, toImageBytes
} from '@/game/models/portrait'

/** A size×size RGBA buffer filled with one pixel value. */
const fill = (size: number, px: [number, number, number, number]): Uint8Array => {
  const out = new Uint8Array(size * size * 4)
  for (let i = 0; i < out.length; i += 4) out.set(px, i)
  return out
}

describe('the render target pixels become an upright sRGB image', () => {
  it('flips the rows: the GPU reads bottom-up, ImageData is top-down', () => {
    const src = fill(2, [0, 0, 0, 0])
    src.set([255, 0, 0, 255], 0) // bottom-left in GL terms
    const out = toImageBytes(src, 2)
    // Now the first pixel of the LAST row.
    expect([...out.slice(8, 12)]).toEqual([255, 0, 0, 255])
    expect([...out.slice(0, 4)]).toEqual([0, 0, 0, 0])
  })

  it('encodes linear colour as sRGB (the render target skips the output encoding)', () => {
    const out = toImageBytes(fill(1, [128, 0, 255, 255]), 1)
    // Linear 0.5 is sRGB 188; the ends stay put.
    expect([...out]).toEqual([188, 0, 255, 255])
  })

  it('un-premultiplies an edge pixel, so outlines keep their colour instead of darkening', () => {
    // Half covered: the multisample resolve averaged linear 0.5 with the
    // transparent clear, which stores 64 at alpha 128.
    const edge = toImageBytes(fill(1, [64, 64, 64, 128]), 1)
    const solid = toImageBytes(fill(1, [128, 128, 128, 255]), 1)
    expect([...edge.slice(0, 3)]).toEqual([...solid.slice(0, 3)])
    expect(edge[3]).toBe(128)
  })

  it('leaves the background fully transparent', () => {
    expect([...toImageBytes(fill(2, [0, 0, 0, 0]), 2)].every(v => v === 0)).toBe(true)
  })
})

describe('the bust framing', () => {
  const frame = (min: [number, number, number], max: [number, number, number]) => {
    const v = portraitFraming({ x: min[0], y: min[1], z: min[2] }, { x: max[0], y: max[1], z: max[2] })
    const [px, py, pz] = v.position
    const [tx, ty, tz] = v.target
    return { v, dist: Math.hypot(px - tx, py - ty, pz - tz) }
  }
  // Rest-pose bounding boxes of the real rigs (buildBossRig), rounded.
  const MASTER: [[number, number, number], [number, number, number]] = [[-0.41, 0.01, -0.23], [0.41, 1.67, 0.25]]
  const VEX: [[number, number, number], [number, number, number]] = [[-1.16, -0.72, -1.07], [1.16, 1.15, 1.07]]

  it('aims at the upper body of a tall rig: head, crest and shoulders', () => {
    const { v } = frame(...MASTER)
    const size = (1.67 - 0.01) * 0.66
    expect(v.target[1]).toBeCloseTo(1.67 - size / 2, 5)
    // The frame's lower edge sits above the hips (0.62 on the masters' skeleton).
    expect(v.target[1] - size / 2).toBeGreaterThan(0.55)
  })

  it('takes nearly all of a wide rig: Dr. Vex\'s face is the middle of his capsule', () => {
    const { v } = frame(...VEX)
    const size = (1.16 * 2) * 0.8
    expect(v.target[1] + size / 2).toBeCloseTo(1.15, 5)
    // The skull faceplate spans about y -0.4 .. 0.5: all of it in frame.
    expect(v.target[1] - size / 2).toBeLessThan(-0.4)
  })

  it('stands in front of the rig and backs off until the frame fits the lens', () => {
    for (const [min, max] of [MASTER, VEX]) {
      const { v, dist } = frame(min, max)
      expect(v.position[2]).toBeGreaterThan(max[2])
      const size = Math.max((max[1] - min[1]) * 0.66, (max[0] - min[0]) * 0.8)
      // Measured from the rig's front face, the frame still fits the lens.
      const front = dist - (max[2] - (min[2] + max[2]) / 2)
      const half = Math.atan((size / 2) / front) * 180 / Math.PI
      expect(half).toBeLessThanOrEqual(PORTRAIT_FOV / 2)
    }
  })
})

describe('bossPortrait without a GPU', () => {
  it('resolves null, caches nothing and shares one job per boss', async () => {
    const a = bossPortrait('vexMk1')
    expect(bossPortrait('vexMk1')).toBe(a)
    await expect(a).resolves.toBeNull()
    expect(cachedBossPortrait('vexMk1')).toBeNull()
  })
})
