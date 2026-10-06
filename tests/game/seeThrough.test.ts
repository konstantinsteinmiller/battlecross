import { describe, expect, it } from 'vitest'
import { PerspectiveCamera, Vector3, Vector4 } from 'three'
import { celVC, celVCInst, outlineMat, updateSeeThrough } from '@/game/gfx/cel'

/**
 * See-through scenery (D89): the instanced scenery and its outlines open a
 * hole round the hero where they stand between the camera and them; nothing
 * else does (a rig, the ground, a house).
 */

describe('see-through scenery (D89)', () => {
  it('is the instanced scenery and its outlines only', () => {
    expect('SEE_THROUGH' in celVCInst().defines).toBe(true)
    expect('SEE_THROUGH' in outlineMat(undefined, undefined, true).defines).toBe(true)
    expect('SEE_THROUGH' in celVC().defines).toBe(false)
    expect('SEE_THROUGH' in outlineMat().defines).toBe(false)
  })

  it('follows the hero: their spot on screen, their depth, open while they live', () => {
    const cam = new PerspectiveCamera(40, 16 / 9, 0.1, 200)
    cam.position.set(4, 14, 18)
    cam.lookAt(new Vector3(4, 0.9, 2))
    cam.updateMatrixWorld()
    updateSeeThrough(cam, 4, 0, 2, true, 16 / 9)
    const see = celVCInst().uniforms.uSee!.value as Vector4
    // Looked at straight on: the middle of the screen, about the camera's distance away.
    expect(Math.abs(see.x)).toBeLessThan(0.01)
    expect(Math.abs(see.y)).toBeLessThan(0.01)
    expect(see.z).toBeCloseTo(Math.hypot(0, 14 - 0.9, 16), 1)
    expect(see.w).toBe(1)
    // The outlines read the very same hole.
    expect(outlineMat(undefined, undefined, true).uniforms.uSee).toBe(celVCInst().uniforms.uSee)
    updateSeeThrough(cam, 4, 0, 2, false, 16 / 9)
    expect(see.w).toBe(0)
  })
})
