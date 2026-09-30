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
// What a page cannot cancel is left alone on purpose (while the mouse is
// captured, the navigation guard at the bottom makes back and close harmless
// instead): browser shortcuts (Ctrl+W, Ctrl+T, F5), browser-side mouse
// gestures (Opera, Vivaldi), Esc leaving fullscreen or a pointer lock, and
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
  // Every button but the left: consuming the press stops gestures that run
  // in the page (extensions that honour it; the menu itself only fires on
  // release, after a gesture has already run) — Opera's own gestures run in
  // the browser and ignore it, see the navigation guard below. Middle stops
  // autoscroll, the thumb buttons stop history navigation, on release.
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
    // Firefox's quick find (`/` and `'`), F1's browser help page, and F2
    // (the game's mute key), which Vivaldi answers with its Quick Commands.
    if (e.code === 'Slash' || e.code === 'Quote' || e.code === 'F1' || e.code === 'F2') e.preventDefault()
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

// ─── While the mouse is captured: no leaving by accident ────────────────────
//
// Cancelling the press above is not enough in every browser. Opera (and
// Vivaldi) recognise mouse and rocker gestures in the BROWSER, before the page
// sees the press, so no `preventDefault` reaches them: hold the left button to
// charge and press the right to block, and Opera's rocker gesture goes BACK;
// hold right to block and look down-right, and the tab closes. Gesture
// extensions (Brave, Chrome) do the same from a content script. Those are
// exactly the shooter's own chords, so they cannot be designed away.
//
// What a page CAN do is make the result harmless while the mouse is captured
// (the only time nobody means to leave: the cursor is gone, so there is no back
// button or tab strip to click):
//   • a same-document history entry on top, so "back" lands on the game's own
//     entry — the page stays, and the entry is put back for the next one;
//   • a `beforeunload` confirmation, so a gesture's (or Ctrl+W's) close asks
//     first instead of throwing the run away.
// Both come off when the capture is handed back on purpose (a modal, the hub)
// and, after a short grace, when it is LOST (Esc, or a gesture that broke it:
// the stroke finishes after the capture is gone). A new-tab gesture only moves
// focus, which pauses the game like any alt-tab.
//
// Not on the Playgama build: that archive is also the YouTube Playables one,
// served from a URL that is not ours, and the router there never touches the
// history at all (see `router/index.ts`).

const GUARD_KEY = '__captureGuard'
const navGuardAllowed = (): boolean =>
  import.meta.env.VITE_APP_PLAYGAMA !== 'true' && typeof window !== 'undefined' && typeof history !== 'undefined'

let navArmed = false
/** The `beforeunload` confirmation is up (only while the mouse is captured). */
let confirmArmed = false
let navGraceTimer: ReturnType<typeof setTimeout> | null = null
let popListening = false

const onGuardedPage = (): boolean => {
  const s = history.state as Record<string, unknown> | null
  return !!s && s[GUARD_KEY] === true
}
/** Push the guard entry. Keeps the router's own state fields (hash history
 *  reads its `position` on popstate; same position = no navigation). */
const pushGuard = () => {
  try {
    history.pushState({ ...(history.state as object | null), [GUARD_KEY]: true }, '')
  } catch { /* a sandbox without history access: nothing to guard */ }
}
// "Back" while armed arrived on the entry below the guard: put it back. Also
// covers a re-arm that raced the disarm's own `history.back()`.
const onPopState = () => {
  if (navArmed && !onGuardedPage()) pushGuard()
}
const onBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault()
  e.returnValue = ''
}

/** Back and close must not end the run by accident. `confirmClose` adds the
 *  leave-page confirmation: only while the mouse is really captured, since a
 *  portal page must never meet a dialog the player did not ask for. Without
 *  it only the history entry is kept (live play with the pointer lock refused
 *  or lost — a portal iframe without `allow-pointer-lock` — where the right
 *  button still blocks and so still starts rocker gestures). */
export const armNavigationGuard = (confirmClose = true): void => {
  if (!navGuardAllowed()) return
  if (navGraceTimer !== null) {
    clearTimeout(navGraceTimer)
    navGraceTimer = null
  }
  if (confirmClose && !confirmArmed) {
    confirmArmed = true
    window.addEventListener('beforeunload', onBeforeUnload)
  } else if (!confirmClose && confirmArmed) {
    confirmArmed = false
    window.removeEventListener('beforeunload', onBeforeUnload)
  }
  if (navArmed) return
  navArmed = true
  if (!popListening) {
    window.addEventListener('popstate', onPopState)
    popListening = true
  }
  if (!onGuardedPage()) pushGuard()
}

/** The capture ended. `graceMs` keeps the guard up that long (a lost capture:
 *  the gesture that broke it may still be finishing); 0 disarms now. */
export const disarmNavigationGuard = (graceMs = 0): void => {
  if (!navArmed) return
  if (graceMs > 0) {
    if (navGraceTimer === null) {
      navGraceTimer = setTimeout(() => {
        navGraceTimer = null
        disarmNavigationGuard(0)
      }, graceMs)
    }
    return
  }
  if (navGraceTimer !== null) {
    clearTimeout(navGraceTimer)
    navGraceTimer = null
  }
  navArmed = false
  if (confirmArmed) {
    confirmArmed = false
    window.removeEventListener('beforeunload', onBeforeUnload)
  }
  // Step off the guard entry, so the browser's back button leaves the game in
  // one press again once the player has the cursor back.
  if (onGuardedPage()) history.back()
}

/** For tests. */
export const isNavigationGuardArmed = (): boolean => navArmed
/** For tests. */
export const isCloseConfirmArmed = (): boolean => confirmArmed
