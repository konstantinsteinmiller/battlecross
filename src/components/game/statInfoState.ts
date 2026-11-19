import { reactive } from 'vue'
import type { StatInfoId } from '@/game/data/statInfo'

/**
 * Which stat's info card is open, and where (the hero sheets' stat rows, `StatInfoLayer.vue`). A mouse rests on a row to see
 * it beside the row; a finger (or the keyboard) taps the row to open it as a card of its own, closed by a tap away. One
 * state for the whole book, so two cards are never up at once.
 */
export interface StatInfoState {
  id: StatInfoId | ''
  /** The row it belongs to (viewport pixels), for the hover card to stand beside. */
  rect: { left: number; right: number; top: number; bottom: number } | null
  /** Opened by a tap: a centred card with its own close button, instead of one beside the row. */
  modal: boolean
}

export const statInfo = reactive<StatInfoState>({ id: '', rect: null, modal: false })

let timer = 0
const HOVER_MS = 140

const open = (id: StatInfoId, el: Element, modal: boolean): void => {
  const r = el.getBoundingClientRect()
  statInfo.id = id
  statInfo.rect = { left: r.left, right: r.right, top: r.top, bottom: r.bottom }
  statInfo.modal = modal
}

export const closeStatInfo = (): void => {
  window.clearTimeout(timer)
  statInfo.id = ''
  statInfo.rect = null
  statInfo.modal = false
}

/** The listeners for one stat row: `v-on="statInfoOn('crit')"`. */
export const statInfoOn = (id: StatInfoId): Record<string, (e: Event) => void> => ({
  pointerenter: (e: Event) => {
    if ((e as PointerEvent).pointerType !== 'mouse' || statInfo.modal) return
    const el = e.currentTarget as Element
    window.clearTimeout(timer)
    timer = window.setTimeout(() => open(id, el, false), HOVER_MS)
  },
  pointerleave: (e: Event) => {
    if ((e as PointerEvent).pointerType !== 'mouse' || statInfo.modal) return
    window.clearTimeout(timer)
    if (statInfo.id === id) closeStatInfo()
  },
  // A tap (touch, pen) or the keyboard: the card opens by itself, and the same row again puts it away.
  click: (e: Event) => {
    if ((e as PointerEvent).pointerType === 'mouse') return
    if (statInfo.modal && statInfo.id === id) closeStatInfo()
    else open(id, e.currentTarget as Element, true)
  },
  keydown: (e: Event) => {
    const k = (e as KeyboardEvent).key
    if (k !== 'Enter' && k !== ' ') return
    e.preventDefault()
    if (statInfo.modal && statInfo.id === id) closeStatInfo()
    else open(id, e.currentTarget as Element, true)
  }
})
