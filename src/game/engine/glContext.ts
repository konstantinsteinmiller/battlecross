import { ref } from 'vue'
import { acquireAppPause } from '@/use/useGamePause'

/**
 * WebGL context loss — the iPhone case.
 *
 * iOS drops a page's GL context when the app goes to the background for long,
 * when a video ad or a call takes the GPU, or under memory pressure. three.js
 * already calls `preventDefault()` on `webglcontextlost` (which is what allows
 * a restore) and re-uploads textures, geometry and programs lazily once the
 * context comes back. What it cannot do is decide what the GAME does in
 * between, and with nothing listening the player saw a frozen or black canvas
 * and left — the leading suspect for iOS sessions a fraction of Android's.
 *
 * So: the simulation pauses for as long as the context is gone, and a veil
 * offers Resume. If the browser restores the context the veil goes away by
 * itself; if it never does, Resume reloads the page, and the save (written at
 * every checkpoint) puts the player back on the world map.
 */

/** True while the context is lost. */
export const glLost = ref(false)

let release: (() => void) | null = null

export const watchContextLoss = (canvas: HTMLCanvasElement): void => {
  canvas.addEventListener('webglcontextlost', () => {
    glLost.value = true
    release ??= acquireAppPause()
  })
  canvas.addEventListener('webglcontextrestored', () => {
    glLost.value = false
    release?.()
    release = null
  })
}

/** The veil's button: if the context is still gone, start over from the save. */
export const recoverFromContextLoss = (): void => {
  if (glLost.value) window.location.reload()
}
