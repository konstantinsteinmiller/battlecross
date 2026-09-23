import { getRenderer } from './engine/renderer'
import { createInput } from './engine/input'
import { bakeTextures } from './world/textures'
import { Mission, type MissionSetup } from './sim/mission'
import { app, type GameMode } from './engine/app'

/**
 * ─── Boot priming ────────────────────────────────────────────────────────────
 *
 * Called by the LOADER (`useAssets.preloadAssets`) while the splash is up:
 * creates the renderer, bakes the shared canvas textures, builds the first
 * scene and compiles its shaders. By the time the splash clears, the first
 * frame is ready to draw — nothing is generated lazily by the render loop.
 *
 * The prepared mode is parked here and adopted by `GameScene.vue` on mount.
 */

export const input = createInput()

let prepared: GameMode | null = null
let primed: Promise<void> | null = null

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()))

export const firstMissionSetup = (): MissionSetup => ({
  sector: 'scrapyard',
  seed: 20260923,
  rooms: 8,
  boss: true,
  enemyLevel: 1,
  tutorial: true,
  encounters: {
    kinds: [['hardhat', 3], ['trooper', 2], ['heli', 1.5], ['roller', 1], ['hopper', 0.8], ['turret', 0.8], ['brute', 0.5]],
    element: 'none',
    density: 0.85,
    eliteChance: 0.05
  }
})

/** The live mission, if the active mode is one (HUD components read it). */
export const currentMission = (): Mission | null => (app.mode instanceof Mission ? app.mode : null)

export const primeGame = (onProgress: (p01: number) => void): Promise<void> => {
  if (primed) return primed
  primed = (async () => {
    const renderer = getRenderer()
    onProgress(0.05)
    bakeTextures()
    onProgress(0.2)
    await nextFrame()
    const mission = new Mission(firstMissionSetup(), input)
    onProgress(0.55)
    await nextFrame()
    try {
      await renderer.compileAsync(mission.scene, mission.camera)
      await renderer.compileAsync(mission.vmScene, mission.vmCamera)
    } catch (e) {
      console.warn('[boot] shader precompile failed (will compile on first draw)', e)
    }
    onProgress(1)
    prepared = mission
  })()
  return primed
}

/** Hand the pre-built first mode to the scene (once). */
export const takePreparedMode = (): GameMode | null => {
  const m = prepared
  prepared = null
  return m
}
