import { onMounted, onUnmounted } from 'vue'

/**
 * ─── The HUD scale: one number for every control ────────────────────────────
 *
 * Every HUD size is `clamp(floor, N vmin, ceiling)`. On a small phone the
 * floors (in rem) win and the controls stop shrinking with the screen, so a
 * 590 × 335 landscape is covered by buttons made for a 390 px-tall one. The
 * HUD therefore multiplies each of those sizes by `--hud-s`, a unitless
 * number set on `:root` here: 1 from `HUD_FULL_VMIN` up (nothing changes on a
 * normal phone, a tablet or a desktop), falling in a straight line to
 * `HUD_MIN_SCALE` at `HUD_SMALL_VMIN` and below.
 *
 * Tap targets keep their own floors in the stylesheets (`HUD_TAP_PX`): a
 * control never gets smaller than that, however small the screen, and a
 * control whose picture shrinks below it gains an invisible hit area.
 * Text never goes below `HUD_MIN_FONT_PX`.
 */
export const HUD_FULL_VMIN = 390
export const HUD_SMALL_VMIN = 335
export const HUD_MIN_SCALE = 0.66
/** The smallest primary tap target (css px); secondary chips go to `HUD_TAP_SMALL_PX`. */
export const HUD_TAP_PX = 36
export const HUD_TAP_SMALL_PX = 28
export const HUD_MIN_FONT_PX = 10

/** The scale for a viewport of `w` × `h` css px. */
export const hudScale = (w: number, h: number): number => {
  const vmin = Math.min(w, h)
  const k = (vmin - HUD_SMALL_VMIN) / (HUD_FULL_VMIN - HUD_SMALL_VMIN)
  return HUD_MIN_SCALE + (1 - HUD_MIN_SCALE) * Math.min(1, Math.max(0, k))
}

/** Keep `--hud-s` on the document in step with the viewport (mount once, in the game view). */
export const useHudScale = (): void => {
  const apply = (): void => {
    const vv = window.visualViewport
    const s = hudScale(vv?.width ?? window.innerWidth, vv?.height ?? window.innerHeight)
    document.documentElement.style.setProperty('--hud-s', s.toFixed(3))
  }
  onMounted(() => {
    apply()
    window.addEventListener('resize', apply)
    window.addEventListener('orientationchange', apply)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', apply)
    window.removeEventListener('orientationchange', apply)
    document.documentElement.style.removeProperty('--hud-s')
  })
}
