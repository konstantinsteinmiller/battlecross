import { onUnmounted, reactive, ref, type Ref } from 'vue'
import { prefersReducedMotion, shake } from './fx'

/**
 * ─── Drag and drop for the big screens ───────────────────────────────────────
 *
 * An item is dragged from the bag onto a socket, a ware across the trade
 * table, a skill onto the loadout. One implementation for mouse and touch, on
 * pointer events:
 *
 *   mouse / pen   the drag begins once the pointer has moved `MOVE_PX` with
 *                 the button down. A press that never moves stays a click.
 *   touch         the drag begins after a LONG PRESS (`HOLD_MS` without
 *                 moving). A finger that moves first is scrolling the bag,
 *                 and the browser keeps that gesture: drag and drop never
 *                 breaks scrolling.
 *
 * What may be dropped where is the caller's: a drop target is any element
 * with `data-drop="<zone>"`; `accepts(payload, zone)` lights it up while the
 * drag is on, and `onDrop(payload, zone)` does the deed (returning `false`
 * when the rules refuse it after all). A drop that is not accepted shakes the
 * target. The thing under the finger is the caller's too: an element bound to
 * `ghost`, which this moves with `transform` only.
 */

export interface DragOptions<T> {
  /** May this be dropped on that zone? (Drives the highlight and the shake.) */
  accepts: (payload: T, zone: string) => boolean
  /** It was dropped on a zone that accepts it. `false`: refused after all. */
  onDrop: (payload: T, zone: string) => boolean | void
  /** The drag began (a sound, a selection). */
  onStart?: (payload: T) => void
}

export interface DragState<T> {
  /** A drag is in progress. */
  active: boolean
  payload: T | null
  /** The zone under the pointer ('' when over none). */
  over: string
  /** That zone would take the payload. */
  overOk: boolean
}

/** Travel before a mouse press becomes a drag. */
export const MOVE_PX = 6
/** A touch must rest this long to pick the thing up… */
export const HOLD_MS = 280
/** …without drifting further than this (a drift is a scroll). */
export const HOLD_SLOP_PX = 9

export const useDrag = <T>(opts: DragOptions<T>): {
  state: DragState<T>
  ghost: Ref<HTMLElement | null>
  /** Bind to a draggable element: `v-on="drag.handle(payload)"`. */
  handle: (payload: T) => { pointerdown: (e: PointerEvent) => void }
  cancel: () => void
} => {
  const state = reactive({ active: false, payload: null, over: '', overOk: false }) as DragState<T>
  const ghost = ref<HTMLElement | null>(null)

  let pending: T | null = null
  let pointerId = -1
  let sx = 0
  let sy = 0
  let lx = 0
  let ly = 0
  let hold = 0
  let touch = false
  let overEl: HTMLElement | null = null

  const place = (): void => {
    const el = ghost.value
    if (el) el.style.transform = `translate3d(${lx}px, ${ly}px, 0)`
  }

  const hit = (): void => {
    const under = typeof document.elementFromPoint === 'function' ? document.elementFromPoint(lx, ly) : null
    const el = (under as HTMLElement | null)?.closest<HTMLElement>('[data-drop]') ?? null
    overEl = el
    const zone = el?.dataset.drop ?? ''
    if (zone !== state.over) {
      state.over = zone
      state.overOk = !!zone && state.payload !== null && opts.accepts(state.payload as T, zone)
    }
  }

  const begin = (): void => {
    if (pending === null) return
    state.payload = pending as DragState<T>['payload']
    state.active = true
    document.documentElement.classList.add('is-dragging')
    if (touch && !prefersReducedMotion()) { try { navigator.vibrate?.(10) } catch { /* not allowed */ } }
    opts.onStart?.(pending)
    // The ghost mounts with `state.active`: place it once it exists.
    requestAnimationFrame(() => { place(); hit() })
  }

  const swallowClick = (e: Event): void => { e.stopPropagation(); e.preventDefault() }

  const end = (): void => {
    window.clearTimeout(hold)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointercancel', onCancel)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('contextmenu', onMenu, true)
    document.documentElement.classList.remove('is-dragging')
    pending = null
    pointerId = -1
    overEl = null
    state.active = false
    state.payload = null
    state.over = ''
    state.overOk = false
  }

  const onMove = (e: PointerEvent): void => {
    if (e.pointerId !== pointerId) return
    lx = e.clientX
    ly = e.clientY
    if (!state.active) {
      const far = Math.hypot(lx - sx, ly - sy)
      if (touch) {
        // The finger is scrolling: this press is not a pick-up.
        if (far > HOLD_SLOP_PX) end()
      } else if (far > MOVE_PX) begin()
      return
    }
    place()
    hit()
  }

  const onUp = (e: PointerEvent): void => {
    if (e.pointerId !== pointerId) return
    if (!state.active) { end(); return }
    lx = e.clientX
    ly = e.clientY
    hit()
    const payload = state.payload as T
    const zone = state.over
    const el = overEl
    // The release of a drag is not a click on whatever it was let go over.
    window.addEventListener('click', swallowClick, { capture: true, once: true })
    window.setTimeout(() => window.removeEventListener('click', swallowClick, true), 80)
    end()
    if (!zone) return
    const ok = opts.accepts(payload, zone) && opts.onDrop(payload, zone) !== false
    if (!ok && el) shake(el)
  }

  const onCancel = (e: PointerEvent): void => {
    if (e.pointerId === pointerId) end()
  }

  /** While a thing is held, the page under the finger must not scroll. */
  const onTouchMove = (e: TouchEvent): void => {
    if (state.active && e.cancelable) e.preventDefault()
  }
  /** A long press is ours: no context menu, no "save image". */
  const onMenu = (e: Event): void => { e.preventDefault() }

  const handle = (payload: T): { pointerdown: (e: PointerEvent) => void } => ({
    pointerdown: (e: PointerEvent): void => {
      if (pointerId !== -1 || (e.pointerType === 'mouse' && e.button !== 0)) return
      pending = payload
      pointerId = e.pointerId
      touch = e.pointerType === 'touch'
      sx = lx = e.clientX
      sy = ly = e.clientY
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onCancel)
      if (touch) {
        window.addEventListener('touchmove', onTouchMove, { passive: false })
        window.addEventListener('contextmenu', onMenu, true)
        hold = window.setTimeout(begin, HOLD_MS)
      }
    }
  })

  onUnmounted(end)
  return { state, ghost, handle, cancel: end }
}
