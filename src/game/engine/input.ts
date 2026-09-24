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
 *   • RIGHT side (and the mouse's left button): press = shoot and start
 *     charging when a shot is wanted (`fireMode`); hold still to charge,
 *     release to fire the charge. The moment the press DRAGS it becomes a
 *     look instead: the charge is dropped (`fireCancelled`), never fired.
 *     Out of fire mode a drag looks and a short tap walks / interacts.
 *     (Deciding fire-vs-look at the press used to make a drag near any enemy
 *     a charge — the camera simply would not move.)
 *   • HUD buttons write straight into the record (`blockHeld`, `slideQueued`…).
 *
 * Desktop: WASD move (↑ / ↓ too), ← / → turn, mouse drag looks, click = tap /
 * fire, Space = fire, RMB (or Shift) = block, Q = slide, 1/2 = weapons,
 * H = tank, E = interact. The coach only ever SHOWS one input per action.
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
  /** Fire button state (touch press on the right side, LMB, Space). */
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
}

/** Best first guess before any pointer event arrives, so the very first
 *  control hint on a phone already names the touch controls. */
const guessDevice = (): Input['device'] => {
  if (typeof navigator !== 'undefined' && mobileCheck()) return 'touch'
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse'
}

export const createInput = (): Input => ({
  moveX: 0, moveY: 0, turn: 0, lookDX: 0, lookDY: 0, taps: [],
  fireHeld: false, firePressed: false, fireReleased: false, fireCancelled: false, fireX: 0, fireY: 0,
  blockHeld: false, blockPressed: false, slideQueued: false, weaponQueued: 0, tankQueued: false,
  interactQueued: false, swipe: 0, pauseQueued: false, mapQueued: false,
  joyActive: false, joyOriginX: 0, joyOriginY: 0, joyX: 0, joyY: 0,
  touched: false, device: guessDevice()
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
  i.swipe = 0
  i.pauseQueued = false
  i.mapQueued = false
}

export interface InputOptions {
  /** Whether a right-side press should be reported as a FIRE press (combat /
   *  a target in sight) rather than as a look/tap gesture. Read per press. */
  fireMode: () => boolean
  /** Joystick radius in CSS px. */
  joyRadius?: number
}

const TAP_MAX_MS = 280
const TAP_MAX_MOVE = 14
/** A fire press that travels this far becomes a look drag (px). */
const DRAG_TO_LOOK_MOUSE = 10
const DRAG_TO_LOOK_TOUCH = 16

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

  const onDown = (e: PointerEvent) => {
    input.touched = true
    input.device = e.pointerType === 'mouse' ? 'mouse' : 'touch'
    const r = rect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (e.pointerType === 'mouse') {
      if (e.button === 2) {
        input.blockHeld = true
        input.blockPressed = true
        return
      }
      if (e.button !== 0) return
    }
    const leftZone = e.pointerType !== 'mouse' && x < r.width * 0.45
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
    try { surface.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    e.preventDefault()
  }

  const onMove = (e: PointerEvent) => {
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
      const dx = x - lookLastX
      const dy = y - lookLastY
      lookLastX = x
      lookLastY = y
      lookMoved += Math.abs(dx) + Math.abs(dy)
      if (lookIsFire && Math.hypot(x - lookStartX, y - lookStartY) > (e.pointerType === 'mouse' ? DRAG_TO_LOOK_MOUSE : DRAG_TO_LOOK_TOUCH)) {
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
      e.preventDefault()
    }
  }

  const onUp = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button === 2) {
      input.blockHeld = false
      return
    }
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
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const dt = performance.now() - lookStartT
      if (lookIsFire) {
        input.fireHeld = false
        input.fireReleased = true
      } else if (dt < TAP_MAX_MS && lookMoved < TAP_MAX_MOVE) {
        input.taps.push({ x, y })
      }
      lookId = null
    }
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
        input.fireHeld = true
        input.firePressed = true
        input.fireX = rect().width / 2
        input.fireY = rect().height / 2
        e.preventDefault()
        break
      case 'ShiftLeft':
      case 'ShiftRight':
        input.blockHeld = true
        input.blockPressed = true
        break
      case 'KeyQ':
      case 'ControlLeft':
        input.slideQueued = true
        break
      case 'Digit1':
        input.weaponQueued = 1
        break
      case 'Digit2':
        input.weaponQueued = 2
        break
      case 'KeyH':
        input.tankQueued = true
        break
      case 'KeyE':
      case 'KeyF':
        input.interactQueued = true
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
    if (e.code === 'Space') {
      input.fireHeld = false
      input.fireReleased = true
    }
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
      input.fireReleased = true
    }
    input.blockHeld = false
    input.joyActive = false
    joyId = null
    lookId = null
  }

  const onContext = (e: Event) => e.preventDefault()

  surface.addEventListener('pointerdown', onDown, { passive: false })
  surface.addEventListener('pointermove', onMove, { passive: false })
  surface.addEventListener('pointerup', onUp)
  surface.addEventListener('pointercancel', onUp)
  surface.addEventListener('contextmenu', onContext)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  return () => {
    surface.removeEventListener('pointerdown', onDown)
    surface.removeEventListener('pointermove', onMove)
    surface.removeEventListener('pointerup', onUp)
    surface.removeEventListener('pointercancel', onUp)
    surface.removeEventListener('contextmenu', onContext)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
  }
}
