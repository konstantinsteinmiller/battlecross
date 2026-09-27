import { computed, reactive } from 'vue'
import { isGamePaused } from '@/use/useGamePause'
import { hud } from './hud'

/**
 * Full-screen feedback levels (written by the HUD event drain, decayed and
 * painted by `ScreenFx.vue` every frame) and the toast queue.
 */
export const screenFx = {
  hurt: 0,
  flash: 0,
  flashColor: '#ffffff'
}

/** Below this share of max HP the health bar turns red (HudBars). 40 %, not
 *  30: a playtester saw the low-health overlay one turn before dying. */
export const LOW_HP = 0.4

/**
 * The low-health warning is LIVE: under `LOW_HP` in actual play. Not while
 * beaming in or out, not dead, and not under a modal, an ad or a paused tab
 * (all of which hold `isGamePaused`; the hub unmounts the HUD outright).
 *
 * The health bar's heartbeat (HudBars) and the red edge vignette (ScreenFx)
 * both key their CSS animations on this one flag, so they start in the same
 * frame, beat in step, and restart in step after every pause.
 */
export const lowHealthLive = computed(() =>
  hud.phase === 'play' && hud.hp > 0 && hud.hp < hud.maxHp * LOW_HP && !isGamePaused.value
)

export interface Toast {
  id: number
  key: string
  params: Record<string, string | number>
  color: string
}

export const toasts = reactive<Toast[]>([])
let nextToast = 1

export const pushToast = (key: string, params: Record<string, string | number> = {}, color = '#ffffff'): void => {
  const t: Toast = { id: nextToast++, key, params, color }
  toasts.push(t)
  if (toasts.length > 3) toasts.shift()
  setTimeout(() => {
    const i = toasts.findIndex(x => x.id === t.id)
    if (i >= 0) toasts.splice(i, 1)
  }, 2600)
}
