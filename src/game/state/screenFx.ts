import { reactive } from 'vue'

/**
 * Full-screen feedback levels (written by the HUD event drain, decayed and
 * painted by `ScreenFx.vue` every frame) and the toast queue.
 */
export const screenFx = {
  hurt: 0,
  flash: 0,
  flashColor: '#ffffff'
}

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
