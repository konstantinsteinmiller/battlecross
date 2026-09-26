/**
 * ─── Input → intents ─────────────────────────────────────────────────────────
 *
 * Raw pointer / keyboard events are folded into ONE mutable `Input` record the
 * sim reads once per step. Nothing here knows about enemies or the HUD — the
 * sim decides what a tap MEANS (fire vs. walk-to vs. interact); this layer only
 * reports that a tap happened and where.
 *
 * Touch model (Blades + a buster):
 *   • LEFT ~45 % of the screen: a floating joystick spawns under the thumb.
 *   • RIGHT side: press = shoot and start charging when a shot is wanted
 *     (`fireMode`); hold still to charge, release to fire the charge. The
 *     moment the press DRAGS it becomes a look instead: the charge is dropped
 *     (`fireCancelled`), never fired. Out of fire mode a drag looks and a
 *     short tap walks / interacts. (Deciding fire-vs-look at the press used
 *     to make a drag near any enemy a charge — the camera would not move.)
 *   • HUD buttons write straight into the record (`blockHeld`, `slideQueued`…).
 *
 * Desktop — a first-person shooter, so the mouse is CAPTURED (pointer lock):
 *   • The first click on the scene captures the mouse (that click fires
 *     nothing). Moving the mouse looks, the left button shoots (hold to
 *     charge, release to fire the charge), the right button blocks.
 *   • WASD moves (↑ / ↓ too), ← / → turn, Space slides (the dodge), 1/2 fire
 *     the special weapons, H drinks a tank, E interacts, B beams out, Tab
 *     switches target. Q still slides and Shift still blocks, untaught: the
 *     coach only ever SHOWS one input per action. Ctrl no longer slides —
 *     Ctrl+W, with W held for walking, closes the tab.
 *   • Esc releases the capture (the browser owns that key while it is
 *     captured); the scene treats a lost capture as "pause".
 *   • Where the capture is refused (a sandboxed embed, an old browser), the
 *     mouse falls back to the touch model: drag to look, click to fire.
 *
 * Mouse buttons are read from MOUSE events, not pointer events: a second
 * button pressed while the first is held (block while charging) arrives as a
 * `pointermove`, never as a `pointerdown`, by the Pointer Events spec.
 */

import { mobileCheck } from '@/utils/function'

export interface Input {
  // Movement (joystick or keys), x = strafe right, y = forward. |v| ≤ 1.
  moveX: number
  moveY: number
  /** Keyboard turning (← / →): −1..1, + = turn right. */
  turn: number
  /** Accumulated look delta in pixels since last consume. */
  lookDX: number
  lookDY: number
  /** Screen-space taps since last consume (CSS px, relative to the surface). */
  taps: Array<{ x: number; y: number }>
  /** Fire button state (touch press on the right side, the left mouse button). */
  fireHeld: boolean
  firePressed: boolean
  fireReleased: boolean
  /** The press turned into a look drag: drop the charge without firing it. */
  fireCancelled: boolean
  /** Screen position of the current fire press (aim hint for free-aim). */
  fireX: number
  fireY: number
  blockHeld: boolean
  blockPressed: boolean
  slideQueued: boolean
  weaponQueued: 0 | 1 | 2
  tankQueued: boolean
  interactQueued: boolean
  beamQueued: boolean
  swipe: -1 | 0 | 1
  pauseQueued: boolean
  mapQueued: boolean
  // Joystick visual state (read by the HUD)
  joyActive: boolean
  joyOriginX: number
  joyOriginY: number
  joyX: number
  joyY: number
  /** True once the player has provided any real input (onboarding, Poki gate). */
  touched: boolean
  /** Last input device family, for control hints. */
  device: 'touch' | 'mouse'
  /** Desktop: the mouse is captured — movement looks, the left button fires. */
  locked: boolean
  /** The capture is refused here (or unsupported): the mouse drags to look. */
  lockRefused: boolean
}

/** Best first guess before any pointer event arrives, so the very first
 *  control hint on a phone already names the touch controls. */
const guessDevice = (): Input['device'] => {
  if (typeof navigator !== 'undefined' && mobileCheck()) return 'touch'
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse'
}

const lockSupported = (): boolean =>
  typeof document !== 'undefined' && 'pointerLockElement' in document &&
  typeof HTMLElement !== 'undefined' && typeof HTMLElement.prototype.requestPointerLock === 'function'

export const createInput = (): Input => ({
  moveX: 0, moveY: 0, turn: 0, lookDX: 0, lookDY: 0, taps: [],
  fireHeld: false, firePressed: false, fireReleased: false, fireCancelled: false, fireX: 0, fireY: 0,
  blockHeld: false, blockPressed: false, slideQueued: false, weaponQueued: 0, tankQueued: false,
  interactQueued: false, beamQueued: false, swipe: 0, pauseQueued: false, mapQueued: false,
  joyActive: false, joyOriginX: 0, joyOriginY: 0, joyX: 0, joyY: 0,
  touched: false, device: guessDevice(), locked: false, lockRefused: !lockSupported()
})

/**
 * Reset the one-shot edges after the sim consumed them.
 *
 * NOT the look deltas: those are applied by the mission's RENDER, which runs
 * after this every frame and zeroes them itself. Clearing them here threw the
 * drag away on every frame that ran a logic step — at 60 Hz nearly all of
 * them — so the camera only moved on the odd step-less frame and felt stuck.
 */
export const consumeEdges = (i: Input): void => {
  i.taps.length = 0
  i.firePressed = false
  i.fireReleased = false
  i.fireCancelled = false
  i.blockPressed = false
  i.slideQueued = false
  i.weaponQueued = 0
  i.tankQueued = false
  i.interactQueued = false
  i.beamQueued = false
  i.swipe = 0
  i.pauseQueued = false
  i.mapQueued = false
}

export interface InputOptions {
  /** Whether a right-side press should be reported as a FIRE press (combat /
   *  a target in sight) rather than as a look/tap gesture. Read per press. */
  fireMode: () => boolean
  /** Whether capturing the mouse makes sense right now (a mission in play,
   *  nothing on top of it). Read on every click. */
  canLock?: () => boolean
  /** The capture was lost without the game asking (Esc, a system dialog). */
  onLockLost?: () => void
  /** Joystick radius in CSS px. */
  joyRadius?: number
}

const TAP_MAX_MS = 280
const TAP_MAX_MOVE = 14
/** A fire press that travels this far becomes a look drag (px). */
const DRAG_TO_LOOK_MOUSE = 10
const DRAG_TO_LOOK_TOUCH = 16
/** One captured mouse event moving further than this is a platform glitch
 *  (Chrome and Firefox both emit the odd huge `movementX` right after the
 *  capture engages or the window regains focus) — dropped, not applied. */
const LOOK_SPIKE = 280
/** A refused capture this soon after the player released one is the browser's
 *  re-capture cooldown, not a refusal of the feature. */
const RELOCK_COOLDOWN_MS = 2500

// ─── Pointer lock (module state: there is one document) ─────────────────────

let lockEl: HTMLElement | null = null
let releasing = false
let lastUnlockAt = -1e9
let lastLockAt = -1e9
/** The pending request rode a real gesture, and not the post-release
 *  cooldown — so a refusal of it means the platform refuses captures. */
let requestCounts = false

/** The mouse is captured by the game right now. */
export const isPointerLocked = (): boolean =>
  typeof document !== 'undefined' && !!lockEl && document.pointerLockElement === lockEl

/** The capture ended within the last `ms` (so an Esc keydown that arrives
 *  with it is the release, not a second press). */
export const unlockedRecently = (ms = 400): boolean => performance.now() - lastUnlockAt < ms

/** Hand the mouse back (a modal, the hub, an ad). Not treated as "lost". */
export const releasePointerLock = (): void => {
  if (!isPointerLocked()) return
  releasing = true
  document.exitPointerLock()
}

/**
 * Capture the mouse, if the platform allows it. Must run inside a user
 * gesture (a click or a key press, or within a few seconds of one). A refusal
 * right after the player released the capture is Chrome's cooldown, so only
 * a refusal with no recent release switches the mouse to drag-look for good.
 */
export const requestPointerLock = (input: Input): void => {
  const el = lockEl
  if (!el || input.lockRefused || isPointerLocked()) return
  // Without a live gesture (e.g. the pause menu closed by Esc, which is not
  // one) the browser says no by rule; do not ask, and do not count it.
  const activation = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation
  if (activation && !activation.isActive) return
  requestCounts = performance.now() - lastUnlockAt >= RELOCK_COOLDOWN_MS
  const refuse = () => {
    if (requestCounts && !isPointerLocked()) input.lockRefused = true
  }
  try {
    const r = (el.requestPointerLock as (o?: unknown) => Promise<void> | void).call(el)
    if (r && typeof (r as Promise<void>).catch === 'function') (r as Promise<void>).catch(refuse)
  } catch {
    refuse()
  }
}

export const attachInput = (surface: HTMLElement, input: Input, opts: InputOptions): (() => void) => {
  const keys = new Set<string>()
  const joyR = opts.joyRadius ?? 56
  let joyId: number | null = null
  let lookId: number | null = null
  let lookStartX = 0
  let lookStartY = 0
  let lookLastX = 0
  let lookLastY = 0
  let lookStartT = 0
  let lookMoved = 0
  let lookIsFire = false
  /** Unlocked mouse fallback: a left-button press in progress. */
  let mouseDrag = false
  let skipNextLook = false
  /** Last touch press: a touch also emits compatibility mouse events. */
  let lastTouchAt = -1e9
  lockEl = surface

  const rect = () => surface.getBoundingClientRect()

  const updateKeysMove = () => {
    if (input.joyActive) return
    let x = 0
    let y = 0
    if (keys.has('KeyA')) x -= 1
    if (keys.has('KeyD')) x += 1
    if (keys.has('KeyW') || keys.has('ArrowUp')) y += 1
    if (keys.has('KeyS') || keys.has('ArrowDown')) y -= 1
    // ← / → TURN: the keyboard-only way to look around (a trackpad player
    // who never finds the drag still has one).
    input.turn = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0)
    const l = Math.hypot(x, y)
    input.moveX = l > 0 ? x / l : 0
    input.moveY = l > 0 ? y / l : 0
  }

  // ── The look / fire gesture shared by touch and the unlocked mouse ──
  const gestureDown = (x: number, y: number) => {
    lookStartX = lookLastX = x
    lookStartY = lookLastY = y
    lookStartT = performance.now()
    lookMoved = 0
    lookIsFire = opts.fireMode()
    if (lookIsFire) {
      input.fireHeld = true
      input.firePressed = true
      input.fireX = x
      input.fireY = y
    }
  }
  const gestureMove = (x: number, y: number, mouse: boolean) => {
    const dx = x - lookLastX
    const dy = y - lookLastY
    lookLastX = x
    lookLastY = y
    lookMoved += Math.abs(dx) + Math.abs(dy)
    if (lookIsFire && Math.hypot(x - lookStartX, y - lookStartY) > (mouse ? DRAG_TO_LOOK_MOUSE : DRAG_TO_LOOK_TOUCH)) {
      // It is a drag after all: look, and drop the charge unfired. The
      // travel so far counts, so the view does not lag the finger.
      lookIsFire = false
      input.fireHeld = false
      input.fireCancelled = true
      input.lookDX += x - lookStartX
      input.lookDY += y - lookStartY
    } else if (!lookIsFire) {
      input.lookDX += dx
      input.lookDY += dy
    } else {
      input.fireX = x
      input.fireY = y
    }
  }
  const gestureUp = (x: number, y: number) => {
    const dt = performance.now() - lookStartT
    if (lookIsFire) {
      input.fireHeld = false
      input.fireReleased = true
    } else if (dt < TAP_MAX_MS && lookMoved < TAP_MAX_MOVE) {
      input.taps.push({ x, y })
    }
  }

  // ── Touch / pen: pointer events ──
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    input.touched = true
    input.device = 'touch'
    lastTouchAt = performance.now()
    const r = rect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const leftZone = x < r.width * 0.45
    if (leftZone && joyId === null) {
      joyId = e.pointerId
      input.joyActive = true
      input.joyOriginX = x
      input.joyOriginY = y
      input.joyX = 0
      input.joyY = 0
      try { surface.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      e.preventDefault()
      return
    }
    if (lookId !== null) return
    lookId = e.pointerId
    gestureDown(x, y)
    try { surface.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    e.preventDefault()
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    const r = rect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (e.pointerId === joyId) {
      let dx = x - input.joyOriginX
      let dy = y - input.joyOriginY
      const l = Math.hypot(dx, dy)
      // Drag the origin along when the thumb overshoots, so the stick never
      // "sticks" at the rim — the Brawl Stars / Blades floating-stick feel.
      if (l > joyR) {
        const k = (l - joyR) / l
        input.joyOriginX += dx * k
        input.joyOriginY += dy * k
        dx = x - input.joyOriginX
        dy = y - input.joyOriginY
      }
      input.joyX = dx / joyR
      input.joyY = dy / joyR
      const mag = Math.min(1, Math.hypot(input.joyX, input.joyY))
      // Small dead zone, then an ease so fine steps are possible.
      const dz = 0.12
      const eased = mag < dz ? 0 : Math.pow((mag - dz) / (1 - dz), 1.25)
      const nx = mag > 0 ? input.joyX / mag : 0
      const ny = mag > 0 ? input.joyY / mag : 0
      input.moveX = nx * eased
      input.moveY = -ny * eased
      e.preventDefault()
      return
    }
    if (e.pointerId === lookId) {
      gestureMove(x, y, false)
      e.preventDefault()
    }
  }

  const onUp = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return
    if (e.pointerId === joyId) {
      joyId = null
      input.joyActive = false
      input.moveX = 0
      input.moveY = 0
      updateKeysMove()
      return
    }
    if (e.pointerId === lookId) {
      const r = rect()
      gestureUp(e.clientX - r.left, e.clientY - r.top)
      lookId = null
    }
  }

  // ── Mouse: captured (FPS) or, where refused, drag-to-look ──
  const onMouseDown = (e: MouseEvent) => {
    if (performance.now() - lastTouchAt < 900) return
    input.touched = true
    input.device = 'mouse'
    if (e.button === 1) { e.preventDefault(); return } // no autoscroll
    if (e.button === 2) {
      // The press is the game's: no menu, no mouse or rocker gesture (hold
      // right + drag down opened a new tab in Opera mid-block). A gesture
      // draws with a free cursor, so a free mouse is captured by this press
      // too, as by a left click; unlike that one, it still blocks.
      e.preventDefault()
      if (!input.locked && !input.lockRefused && (opts.canLock?.() ?? false)) requestPointerLock(input)
      input.blockHeld = true
      input.blockPressed = true
      return
    }
    if (e.button !== 0) return
    if (input.locked) {
      input.fireHeld = true
      input.firePressed = true
      const r = rect()
      input.fireX = r.width / 2
      input.fireY = r.height / 2
      return
    }
    // Not captured yet: this click captures (and fires nothing).
    if (!input.lockRefused && (opts.canLock?.() ?? false)) {
      requestPointerLock(input)
      return
    }
    const r = rect()
    mouseDrag = true
    gestureDown(e.clientX - r.left, e.clientY - r.top)
  }

  const onMouseMove = (e: MouseEvent) => {
    if (input.locked) {
      if (skipNextLook) { skipNextLook = false; return }
      const dx = e.movementX || 0
      const dy = e.movementY || 0
      if (Math.abs(dx) > LOOK_SPIKE || Math.abs(dy) > LOOK_SPIKE) return
      input.lookDX += dx
      input.lookDY += dy
      return
    }
    if (!mouseDrag) return
    const r = rect()
    gestureMove(e.clientX - r.left, e.clientY - r.top, true)
  }

  const onMouseUp = (e: MouseEvent) => {
    if (e.button === 2) {
      input.blockHeld = false
      return
    }
    if (e.button !== 0) return
    if (input.locked) {
      if (input.fireHeld) {
        input.fireHeld = false
        input.fireReleased = true
      }
      return
    }
    if (!mouseDrag) return
    mouseDrag = false
    const r = rect()
    gestureUp(e.clientX - r.left, e.clientY - r.top)
  }

  const onLockChange = () => {
    const locked = document.pointerLockElement === surface
    if (locked === input.locked) return
    input.locked = locked
    if (locked) {
      lastLockAt = performance.now()
      skipNextLook = true
      mouseDrag = false
      input.device = 'mouse'
      return
    }
    lastUnlockAt = performance.now()
    // A held charge dies with the capture; the shield drops.
    if (input.fireHeld) {
      input.fireHeld = false
      input.fireCancelled = true
    }
    input.blockHeld = false
    const asked = releasing
    releasing = false
    if (!asked) opts.onLockLost?.()
  }

  const onLockError = () => {
    if (requestCounts && !isPointerLocked()) input.lockRefused = true
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    input.touched = true
    input.device = 'mouse'
    if (e.repeat && keys.has(e.code)) return
    keys.add(e.code)
    switch (e.code) {
      case 'Space':
      case 'KeyQ':
        input.slideQueued = true
        e.preventDefault()
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        input.blockHeld = true
        input.blockPressed = true
        break
      case 'Digit1':
      case 'Numpad1':
        input.weaponQueued = 1
        break
      case 'Digit2':
      case 'Numpad2':
        input.weaponQueued = 2
        break
      case 'KeyH':
        input.tankQueued = true
        break
      case 'KeyE':
      case 'KeyF':
        input.interactQueued = true
        break
      case 'KeyB':
        input.beamQueued = true
        break
      case 'Tab':
        input.swipe = 1
        e.preventDefault()
        break
      case 'Escape':
      case 'KeyP':
        input.pauseQueued = true
        break
      case 'KeyM':
        input.mapQueued = true
        break
    }
    updateKeysMove()
  }

  const onKeyUp = (e: KeyboardEvent) => {
    keys.delete(e.code)
    if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') input.blockHeld = false
    updateKeysMove()
  }

  const onBlur = () => {
    keys.clear()
    input.moveX = 0
    input.moveY = 0
    input.turn = 0
    if (input.fireHeld) {
      input.fireHeld = false
      input.fireCancelled = true
    }
    input.blockHeld = false
    input.joyActive = false
    joyId = null
    lookId = null
    mouseDrag = false
  }

  const onContext = (e: Event) => e.preventDefault()

  surface.addEventListener('pointerdown', onDown, { passive: false })
  surface.addEventListener('pointermove', onMove, { passive: false })
  surface.addEventListener('pointerup', onUp)
  surface.addEventListener('pointercancel', onUp)
  surface.addEventListener('mousedown', onMouseDown)
  document.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  surface.addEventListener('contextmenu', onContext)
  document.addEventListener('pointerlockchange', onLockChange)
  document.addEventListener('pointerlockerror', onLockError)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  return () => {
    releasePointerLock()
    if (lockEl === surface) lockEl = null
    surface.removeEventListener('pointerdown', onDown)
    surface.removeEventListener('pointermove', onMove)
    surface.removeEventListener('pointerup', onUp)
    surface.removeEventListener('pointercancel', onUp)
    surface.removeEventListener('mousedown', onMouseDown)
    document.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    surface.removeEventListener('contextmenu', onContext)
    document.removeEventListener('pointerlockchange', onLockChange)
    document.removeEventListener('pointerlockerror', onLockError)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
  }
}

/** When the capture last engaged (ms, `performance.now()`); for tests / QA. */
export const lastPointerLockAt = (): number => lastLockAt
