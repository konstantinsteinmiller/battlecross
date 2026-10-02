import type { Material, Mesh, Object3D } from 'three'
import { getRenderer } from './engine/renderer'
import { createInput } from './engine/input'
import { afterPaint, createSlicer, yieldToBrowser } from './engine/slicer'
import { app, type GameMode } from './engine/app'
import { bakeTextures, loadTextureOverrides } from './gfx/textures'
import { ZoneMode } from './modes/zoneMode'
import { initProfile } from './state/profile'
import { hud } from './state/hud'
import { bindInput, createBootMode, setPrecompile } from './flow'
import { installSynth, loadSfxOverrides } from './audio/synth'

/**
 * ─── Boot priming ────────────────────────────────────────────────────────────
 *
 * Called by the LOADER (`useAssets.preloadAssets`) while the splash is up:
 * loads the profile, creates the renderer, bakes the shared canvas textures,
 * builds the FIRST scene (the opening fight for a new player, the last town
 * for a returning one — never a menu) and compiles its shaders. By the time
 * the splash clears, the first frame is ready to draw.
 *
 * Three rules, each one a measured failure before it was a rule:
 * - The loader PAINTS FIRST. Nothing heavy starts until the splash has been
 *   on screen for a frame, so the player gets feedback before the work.
 * - The build is time-sliced (`ZoneMode.create`), so the bar keeps moving.
 * - The scene NEVER builds its own copy. `GameScene` waits on `adoptBootMode`
 *   for the prepared mode; a second "just in case" build would double the
 *   load on exactly the slow devices it was meant to protect.
 */

export const input = createInput()
bindInput(input)
// The HUD knows which hand is on the controls from its first frame (a phone's
// stick must be there to grab before the first step of the simulation runs).
hud.device = input.device

/**
 * Compile a scene's shader programs off the critical frame. `compileAsync`
 * waits for the GPU asynchronously, but first derives the parameters and
 * cache key of EVERY material and assembles every new program's source, all
 * synchronously — one long task on a throttled CPU. So programs are created
 * one material at a time (sliced; the GPU still compiles them in parallel),
 * and readiness is polled directly rather than through a final `compileAsync`,
 * which would re-derive everything in one task again.
 */
const precompile = async (mode: GameMode, onProgress: (f01: number) => void = () => {}): Promise<void> => {
  try {
    const slice = createSlicer(12)
    const renderer = getRenderer()
    const seen = new Set<string>()
    const reps: Object3D[] = []
    mode.scene.traverse((o) => {
      const mat = (o as Mesh).material as Material | Material[] | undefined
      if (!mat) return
      // One representative per (material program, kind of object): a skinned
      // mesh and an instanced mesh need different programs of the same material.
      const kind = (o as { isSkinnedMesh?: boolean }).isSkinnedMesh ? 's' : (o as { isInstancedMesh?: boolean }).isInstancedMesh ? 'i' : 'm'
      const key = kind + (Array.isArray(mat) ? mat : [mat]).map(m => m.type + (m.transparent ? 't' : '') + Object.keys(m.defines ?? {}).join()).join()
      if (seen.has(key)) return
      seen.add(key)
      reps.push(o)
    })
    const pending = new Set<Material>()
    // `compile` walks only what is visible: something hidden until its moment
    // would compile on its first draw, mid-play. Shown for the call, with its
    // hidden ancestors, then put back.
    const hidden: Object3D[] = []
    for (let i = 0; i < reps.length; i++) {
      hidden.length = 0
      for (let o: Object3D | null = reps[i]!; o; o = o.parent) if (!o.visible) { hidden.push(o); o.visible = true }
      try {
        for (const m of renderer.compile(reps[i]!, mode.camera, mode.scene)) pending.add(m)
      } finally {
        for (const o of hidden) o.visible = false
      }
      onProgress(((i + 1) / reps.length) * 0.8)
      await slice()
    }
    // KHR_parallel_shader_compile: poll completion without blocking.
    const started = performance.now()
    await new Promise<void>((resolve) => {
      const check = () => {
        for (const m of pending) {
          const prog = (renderer.properties.get(m) as { currentProgram?: { isReady(): boolean } }).currentProgram
          if (!prog || prog.isReady()) pending.delete(m)
        }
        // Capped: a driver that never reports completion must not hold the boot.
        if (pending.size === 0 || performance.now() - started > 8000) resolve()
        else setTimeout(check, 16)
      }
      check()
    })
    onProgress(1)
  } catch (e) {
    console.warn('[boot] shader precompile failed (will compile on first draw)', e)
  }
}
setPrecompile(precompile)

let prepared: GameMode | null = null
let primed: Promise<void> | null = null

export const primeGame = (onProgress: (p01: number) => void): Promise<void> => {
  if (primed) return primed
  primed = (async () => {
    // The loader is on screen before any of the work below starts.
    await afterPaint()
    // Boot milestones as User Timing marks: free, and they line up in the
    // DevTools Performance panel (and `scripts/boot-timeline.mjs`).
    performance.mark('boot:prime-start')
    initProfile()
    installSynth()
    // Drop-in files (only those that exist; see game/assets/overrides.ts).
    loadSfxOverrides()
    onProgress(0.03)
    await yieldToBrowser()
    getRenderer()
    onProgress(0.07)
    await loadTextureOverrides()
    bakeTextures()
    onProgress(0.1)
    await yieldToBrowser()
    performance.mark('boot:build-start')
    const mode = await createBootMode((p) => onProgress(0.1 + p * 0.9))
    performance.mark('boot:built')
    onProgress(1)
    prepared = mode
    performance.mark('boot:primed')
  })()
  return primed
}

/** Hand the pre-built first mode to the scene (once). */
export const takePreparedMode = (): GameMode | null => {
  const m = prepared
  prepared = null
  return m
}

/** Longest the scene waits on priming before building its own scene. */
const ADOPT_CAP_MS = 20000

/**
 * The first scene for `GameScene`: the loader's prepared mode, once priming
 * has finished (starting it if nothing has). Capped, so a prime that hangs
 * ends in a direct build rather than a black screen forever.
 */
export const adoptBootMode = async (): Promise<GameMode> => {
  const p = primed ?? primeGame(() => {})
  await Promise.race([
    p.catch((e) => console.error('[boot] priming failed', e)),
    new Promise((resolve) => setTimeout(resolve, ADOPT_CAP_MS))
  ])
  const m = takePreparedMode()
  performance.mark(m ? 'boot:adopted' : 'boot:fallback-build')
  if (m) return m
  initProfile()
  return createBootMode()
}

/** The live zone / town, if one is up (HUD components read it). */
export const currentZone = (): ZoneMode | null => (app.mode instanceof ZoneMode ? app.mode : null)
