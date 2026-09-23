import { getRenderer } from './engine/renderer'
import { createInput } from './engine/input'
import { bakeTextures } from './world/textures'
import { Mission, setupFromQuest } from './sim/mission'
import { HubMode } from './sim/hub'
import { app, type GameMode } from './engine/app'
import { initProfile } from './state/profile'
import { registerModeFactories, createBootMode, ensureJobs } from './flow'
import { installSynth } from './audio/synth'

/**
 * ─── Boot priming ────────────────────────────────────────────────────────────
 *
 * Called by the LOADER (`useAssets.preloadAssets`) while the splash is up:
 * loads the profile, creates the renderer, bakes the shared canvas textures,
 * builds the FIRST scene (a resumed mission, the tutorial, or the hub — never
 * a menu) and compiles its shaders. By the time the splash clears, the first
 * frame is ready to draw.
 *
 * The prepared mode is parked here and adopted by `GameScene.vue` on mount.
 */

export const input = createInput()

registerModeFactories(
  (quest, snapshot) => new Mission(setupFromQuest(quest, snapshot), input),
  () => new HubMode()
)

let prepared: GameMode | null = null
let primed: Promise<void> | null = null

const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()))

export const primeGame = (onProgress: (p01: number) => void): Promise<void> => {
  if (primed) return primed
  primed = (async () => {
    initProfile()
    ensureJobs()
    installSynth()
    const renderer = getRenderer()
    onProgress(0.05)
    bakeTextures()
    onProgress(0.2)
    await nextFrame()
    const mode = createBootMode()
    onProgress(0.55)
    await nextFrame()
    try {
      await renderer.compileAsync(mode.scene, mode.camera)
      if (mode instanceof Mission) await renderer.compileAsync(mode.vmScene, mode.vmCamera)
    } catch (e) {
      console.warn('[boot] shader precompile failed (will compile on first draw)', e)
    }
    onProgress(1)
    prepared = mode
  })()
  return primed
}

/** Hand the pre-built first mode to the scene (once). */
export const takePreparedMode = (): GameMode | null => {
  const m = prepared
  prepared = null
  return m
}

/** Fallback if the loader never primed (e.g. its cap fired first). */
export const fallbackMode = (): GameMode => {
  initProfile()
  ensureJobs()
  return createBootMode()
}

/** The live mission, if the active mode is one (HUD components read it). */
export const currentMission = (): Mission | null => (app.mode instanceof Mission ? app.mode : null)
export const currentHub = (): HubMode | null => (app.mode instanceof HubMode ? app.mode : null)
