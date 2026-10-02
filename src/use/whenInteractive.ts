// ─── "The player can act now" — the moment a strict ready signal may fire ───
//
// Playgama's `game_ready` is ALSO YouTube Playables' `gameReady()` (Bridge
// forwards it on the archive Playgama sends there), and Playables is strict
// about the moment: `gameReady()` only "when the game is ready for
// interaction", and it "MUST NOT" be called while non-interactable elements
// are on screen — a splash, a loader, a scripted intro. (YouTube's own loading
// spinner stays up until it arrives, so late costs a moment; early is a
// certification finding.)
//
// So the caller waits for the loading layers to LEAVE (see FLogoProgress) and
// this waits for the scene to hand over control: a zone or a town the player can
// act in, or the world map. Capped, because a ready signal
// that never fires is worse than a slightly early one — Playgama rejects a game
// that never sends it, and YouTube's spinner would never lift.

import { watch } from 'vue'
import { hud } from '@/game/state/hud'

/** Longest the ready signal waits on the scene once the loader has gone. */
export const INTERACTIVE_CAP_MS = 8000

/** Does the current scene take player input? */
export const isSceneInteractive = (): boolean => hud.phase === 'play' || hud.phase === 'town' || hud.phase === 'map'

/**
 * Run `fn` once, as soon as the scene takes input — now, if it already does.
 * Never later than `capMs`.
 */
export const whenInteractive = (fn: () => void, capMs = INTERACTIVE_CAP_MS): void => {
  if (isSceneInteractive()) { fn(); return }
  let done = false
  const finish = (): void => {
    if (done) return
    done = true
    stop()
    clearTimeout(cap)
    fn()
  }
  const stop = watch(() => hud.phase, () => { if (isSceneInteractive()) finish() })
  const cap = setTimeout(finish, capMs)
}
