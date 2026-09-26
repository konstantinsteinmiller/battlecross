// ─── Browser defaults that fight the game ───────────────────────────────────
//
// A browser treats the page as a document: right-click opens a menu, holding
// the right button and moving the mouse is a MOUSE GESTURE in Opera and
// Vivaldi (hold right + drag down opened a new tab in the middle of the
// shield lesson, whose block is "hold the right button"), holding right and
// clicking left is a ROCKER gesture (history back / forward), the wheel with
// the right button held switches tabs, the middle button starts autoscroll,
// the thumb buttons go back and forward in history, a drag lifts an image, a
// long press selects text or opens a callout, and `/` or `'` opens Firefox's
// quick find. In a game every one of those is a player thrown out of it.
//
// Installed once on `window`, in the CAPTURE phase, so no component's
// stopPropagation can let one slip past, and cancelling only the default: the
// game's own handlers still get every event. Text fields keep their menus,
// selection and keys.
//
// What a page cannot cancel is left alone on purpose: browser shortcuts
// (Ctrl+W, Ctrl+T, F5), Esc leaving fullscreen or a pointer lock, and
// Firefox's Shift + right-click menu, which opens with Shift held no matter
// what the page does (the reason block is never taught as Shift + mouse).

const editable = (t: EventTarget | null): boolean => {
  const el = t as HTMLElement | null
  if (!el || typeof el.tagName !== 'string') return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable === true
}

/** Remove the browser defaults listed above; returns the uninstaller. */
export const installBrowserGuard = (): (() => void) => {
  const opts: AddEventListenerOptions = { capture: true, passive: false }
  let altAlone = false

  const cancel = (e: Event) => {
    if (!editable(e.target)) e.preventDefault()
  }
  // Every button but the left: consuming the press is what keeps Opera's
  // mouse and rocker gestures from starting (the menu itself only fires on
  // release, after the gesture has already run); middle stops autoscroll,
  // the thumb buttons stop history navigation, which happens on release.
  const onButton = (e: MouseEvent) => {
    if (e.button !== 0 && !editable(e.target)) e.preventDefault()
  }
  const onWheel = (e: WheelEvent) => {
    // Wheel with the right button held switches tabs in gesture browsers.
    if ((e.buttons & 2) !== 0) e.preventDefault()
  }
  const onTouchStart = (e: TouchEvent) => {
    // A second finger is a pinch to the browser and a second thumb to the
    // game. Only a cancelable event is cancelled: one that arrives while the
    // browser already pans is not, and cancelling it anyway only logs an
    // intervention warning.
    if (e.touches.length > 1 && e.cancelable) e.preventDefault()
  }
  const onKeyDown = (e: KeyboardEvent) => {
    altAlone = e.key === 'Alt'
    if (editable(e.target)) return
    // Firefox's quick find (`/` and `'`), and F1's browser help page.
    if (e.code === 'Slash' || e.code === 'Quote' || e.code === 'F1') e.preventDefault()
  }
  const onKeyUp = (e: KeyboardEvent) => {
    // Alt pressed and released alone focuses the menu bar (Firefox and Edge
    // on Windows), and the next keys go to the menu instead of the game.
    if (e.key === 'Alt' && altAlone && !editable(e.target)) e.preventDefault()
    altAlone = false
  }

  const add: Array<[EventTarget, string, EventListener]> = [
    [window, 'contextmenu', cancel],
    [window, 'mousedown', onButton as EventListener],
    [window, 'mouseup', onButton as EventListener],
    [window, 'auxclick', cancel],
    [window, 'wheel', onWheel as EventListener],
    [window, 'dragstart', cancel],
    [window, 'selectstart', cancel],
    [window, 'keydown', onKeyDown as EventListener],
    [window, 'keyup', onKeyUp as EventListener],
    [document, 'touchstart', onTouchStart as EventListener],
    // Safari's own pinch events.
    [document, 'gesturestart', cancel],
    [document, 'gesturechange', cancel]
  ]
  for (const [t, type, fn] of add) t.addEventListener(type, fn, opts)
  return () => {
    for (const [t, type, fn] of add) t.removeEventListener(type, fn, opts)
  }
}
