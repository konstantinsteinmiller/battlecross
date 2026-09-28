import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/**
 * ─── Drag to scroll a horizontal strip with the mouse ────────────────────────
 *
 * Touch scrolls a strip natively; a mouse cannot (no drag, and a plain wheel
 * scrolls vertically). This lets a mouse drag it like a finger, and turns a
 * vertical wheel into sideways scrolling while over it. A press that moves
 * less than DRAG_SLOP is still a click; a real drag swallows the click that
 * would end it, so letting go over a card never selects it. Touch and pen
 * are left to the browser.
 */

/** Pixels a press may wander and still be a click. */
export const DRAG_SLOP = 6

/**
 * The scrollLeft that shows a child whole (with `pad` px to spare), moving as
 * little as possible: unchanged when it is already in view. A child wider
 * than the view lines up with its left edge.
 */
export const revealLeft = (scrollLeft: number, viewW: number, childLeft: number, childW: number, pad = 12): number => {
  const lo = childLeft - pad
  const hi = childLeft + childW + pad - viewW
  if (lo < scrollLeft) return Math.max(0, lo)
  if (hi > scrollLeft) return Math.min(lo, hi)
  return scrollLeft
}

/** Scroll `child` of the strip `el` into view (only sideways, only as far as needed). */
export const revealIn = (el: HTMLElement, child: HTMLElement, smooth = true): void => {
  const left = revealLeft(el.scrollLeft, el.clientWidth, child.offsetLeft - el.offsetLeft, child.offsetWidth)
  if (Math.abs(left - el.scrollLeft) < 1) return
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({ left, behavior: smooth && !calm ? 'smooth' : 'auto' })
}

export const useDragScroll = (strip: Ref<HTMLElement | null>): void => {
  let id = -1
  let x0 = 0
  let left0 = 0
  let dragged = false

  const down = (e: PointerEvent) => {
    dragged = false
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const el = strip.value
    if (!el || el.scrollWidth <= el.clientWidth) return
    id = e.pointerId
    x0 = e.clientX
    left0 = el.scrollLeft
  }
  const move = (e: PointerEvent) => {
    const el = strip.value
    if (e.pointerId !== id || !el) return
    const dx = e.clientX - x0
    if (!dragged && Math.abs(dx) < DRAG_SLOP) return
    if (!dragged) {
      dragged = true
      try { el.setPointerCapture(id) } catch { /* the pointer is already gone */ }
      el.classList.add('dragging')
    }
    el.scrollLeft = left0 - dx
  }
  const up = (e: PointerEvent) => {
    if (e.pointerId !== id) return
    id = -1
    strip.value?.classList.remove('dragging')
    // The click (if any) comes right after this; past it, nothing to swallow.
    if (dragged) setTimeout(() => { dragged = false }, 0)
  }
  // A drag ends in a click on whatever is under the pointer: not a selection.
  const click = (e: MouseEvent) => {
    if (!dragged) return
    dragged = false
    e.preventDefault()
    e.stopPropagation()
  }
  const wheel = (e: WheelEvent) => {
    const el = strip.value
    if (!el || e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return
    const max = el.scrollWidth - el.clientWidth
    if (max <= 0) return
    // At an end, let the wheel scroll the page instead.
    if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max - 1)) return
    e.preventDefault()
    el.scrollLeft += e.deltaY
  }

  onMounted(() => {
    const el = strip.value
    if (!el) return
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('click', click, true)
    el.addEventListener('wheel', wheel, { passive: false })
  })
  onBeforeUnmount(() => {
    const el = strip.value
    if (!el) return
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
    el.removeEventListener('click', click, true)
    el.removeEventListener('wheel', wheel)
  })
}
