import { reactive } from 'vue'

/** The one hover card on the page (a skill's or an item's, Diablo-style). */
export const tip = reactive<{ kind: '' | 'skill' | 'item'; id: string; x: number; y: number }>({ kind: '', id: '', x: 0, y: 0 })

export const showTip = (kind: 'skill' | 'item', id: string, e: MouseEvent): void => {
  tip.kind = kind
  tip.id = id
  tip.x = e.clientX
  tip.y = e.clientY
}
export const moveTip = (e: MouseEvent): void => { tip.x = e.clientX; tip.y = e.clientY }
export const hideTip = (): void => { tip.kind = '' }
