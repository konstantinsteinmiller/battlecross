/**
 * ─── Input → intents ─────────────────────────────────────────────────────────
 *
 * Raw pointer / keyboard events are folded into ONE mutable `Input` record the
 * mode reads once per step. Nothing here knows about heroes or enemies: this
 * layer reports THAT a tap happened and where, that a pointer is held and where
 * it is now; the mode decides what it means (walk there, lock that goblin).
 *
 * The scene surface (GDD §7):
 *   • a short press that does not travel is a TAP: walk to the spot, or lock
 *     the enemy under it;
 *   • a press that travels is a DRAG: the mode draws the line from the hero to
 *     the pointer, walks after it, and locks the enemy it is released on;
 *   • on a phone or tablet a resting JOYSTICK sits bottom-left; a press on it
 *     grabs it. Everywhere else stays tap / drag, so both models coexist and
 *     neither has to be chosen in a menu.
 *
 * Tap or drag is decided by TRAVEL, never at the press: a finger that lands
 * and then moves is a drag, however near an enemy it landed.
 *
 * Skill buttons are DOM (the HUD): they write `skillTap` for a tap and drive
 * `aim` while a finger drags from a button onto the field.
 *
 * Keys are bound through `keyBindings.ts` (physical keys, rebindable).
 */

import { mobileCheck } from '@/utils/function'
import { actionForCode, codesFor, type Action } from './keyBindings'
import { observeKey } from './keyLabels'

export interface Input {
  /** Movement from the joystick or the keys, in SCREEN space: x right, y up.
   *  |v| ≤ 1. */
  moveX: number
  moveY: number
  /** Taps on the scene since last consume (CSS px, relative to the surface). */
  taps: Array<{ x: number; y: number }>
  /** A scene pointer is down right now (not the joystick's). */
  held: boolean
  /** …and has travelled far enough to be a drag. */
  dragging: boolean
  /** Where that pointer is (surface px), and where it went down. */
  ptrX: number
  ptrY: number
  ptrX0: number
  ptrY0: number
  /** A drag was let go this step, at (`dropX`, `dropY`). */
  dropped: boolean
  dropX: number
  dropY: number
  /** The mouse over the scene (desktop highlight); -1 when it is not. */
  hoverX: number
  hoverY: number
  /** A skill slot tapped (0..5), or -1. */
  skillTap: number
  /** A skill being aimed by a drag from its button: its slot, where the finger
   *  is on the surface, and whether it has left the button. */
  aimSlot: number
  aimX: number
  aimY: number
  aimLive: boolean
  /** An aim released this step over the field (-1: none). */
  aimDrop: number
  aimDropX: number
  aimDropY: number
  potionQueued: boolean
  interactQueued: boolean
  targetQueued: boolean
  pauseQueued: boolean
  /** A panel key: '' or 'map' | 'character' | 'inventory' | 'skills'. */
  panelQueued: '' | 'map' | 'character' | 'inventory' | 'skills'
  /** Any fresh press this step — a touch, a mouse button, a key. */
  anyPressed: boolean
  // Joystick visual state (read by the HUD)
  joyActive: boolean
  joyOriginX: number
  joyOriginY: number
  joyX: number
  joyY: number
  /** The resting stick's centre and grab radius (surface px); 0 radius = none. */
  joyHomeX: number
  joyHomeY: number
  joyHomeR: number
  /** True once the player has provided any real input (onboarding, Poki gate). */
  touched: boolean
  /** Last input device family, for control hints. */
  device: 'touch' | 'mouse'
  /** Whether the keys are steering right now (the coach counts it). */
  keysMoving: boolean
}

/** Best first guess before any pointer event arrives, so the very first
 *  control hint on a phone already shows the touch controls. */
const guessDevice = (): Input['device'] => {
  if (typeof navigator !== 'undefined' && mobileCheck()) return 'touch'
  return typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches ? 'touch' : 'mouse'
}

/**
 * A phone or tablet: the touch controls are THE controls here, whatever input
 * arrives. The UA check covers phones; `pointer: coarse` with touch points
 * covers an iPad asking for the desktop site. A touch-screen laptop (a fine
 * primary pointer) stays a desktop.
 */
export const touchFirst = (): boolean => {
  if (typeof navigator === 'undefined') return false
  if (mobileCheck()) return true
  return (navigator.maxTouchPoints ?? 0) > 0 &&
    typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches
}

export const createInput = (): Input => ({
  moveX: 0, moveY: 0, taps: [],
  held: false, dragging: false, ptrX: 0, ptrY: 0, ptrX0: 0, ptrY0: 0,
  dropped: false, dropX: 0, dropY: 0, hoverX: -1, hoverY: -1,
  skillTap: -1, aimSlot: -1, aimX: 0, aimY: 0, aimLive: false, aimDrop: -1, aimDropX: 0, aimDropY: 0,
  potionQueued: false, interactQueued: false, targetQueued: false, pauseQueued: false, panelQueued: '',
  anyPressed: false,
  joyActive: false, joyOriginX: 0, joyOriginY: 0, joyX: 0, joyY: 0, joyHomeX: 0, joyHomeY: 0, joyHomeR: 0,
  touched: false, device: guessDevice(), keysMoving: false
})

/** Reset the one-shot edges after the mode consumed them. */
export const consumeEdges = (i: Input): void => {
  i.taps.length = 0
  i.dropped = false
  i.skillTap = -1
  i.aimDrop = -1
  i.potionQueued = false
  i.interactQueued = false
  i.targetQueued = false
  i.pauseQueued = false
  i.panelQueued = ''
  i.anyPressed = false
}

export interface InputOptions {
  /** Joystick radius in CSS px. */
  joyRadius?: number
}

const TAP_MAX_MS = 320
/** A press that travels this far is a drag (px). */
const DRAG_MOUSE = 8
const DRAG_TOUCH = 14
/** Keys that are never "a press" for a skip: modifiers, and F1 / F2. */
const NOT_A_PRESS = new Set(['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight', 'F1', 'F2'])

const SKILL_ACTIONS: Partial<Record<Action, number>> = {
  skill1: 0, skill2: 1, skill3: 2, skill4: 3, skill5: 4, skill6: 5
}

export const attachInput = (surface: HTMLElement, input: Input, opts: InputOptions = {}): (() => void) => {
  const keys = new Set<string>()
  const joyR = opts.joyRadius ?? 52
  let joyId: number | null = null
  let ptrId: number | null = null
  let downAt = 0
  const touchOnly = touchFirst()

  const rect = () => surface.getBoundingClientRect()
  /** Any key bound to the action is down (see `keyBindings.ts`). */
  const down = (a: Action): boolean => codesFor(a).some(c => keys.has(c))

  const updateKeysMove = () => {
    if (input.joyActive) return
    let x = 0
    let y = 0
    if (down('left')) x -= 1
    if (down('right')) x += 1
    if (down('up')) y += 1
    if (down('down')) y -= 1
    const l = Math.hypot(x, y)
    input.moveX = l > 0 ? x / l : 0
    input.moveY = l > 0 ? y / l : 0
    input.keysMoving = l > 0
  }

  /** Point the stick at a finger position (surface px). */
  const stickTo = (x: number, y: number) => {
    let dx = x - input.joyOriginX
    let dy = y - input.joyOriginY
    const l = Math.hypot(dx, dy)
    // Drag the origin along when the thumb overshoots, so the stick never
    // "sticks" at the rim — the floating-stick feel.
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
    const dz = 0.14
    const eased = mag < dz ? 0 : Math.pow((mag - dz) / (1 - dz), 1.2)
    const nx = mag > 0 ? input.joyX / mag : 0
    const ny = mag > 0 ? input.joyY / mag : 0
    input.moveX = nx * eased
    input.moveY = -ny * eased
  }

  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const touch = e.pointerType !== 'mouse' || touchOnly
    input.touched = true
    input.anyPressed = true
    input.device = touch ? 'touch' : 'mouse'
    const r = rect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const onHome = touch && input.joyHomeR > 0 && Math.hypot(x - input.joyHomeX, y - input.joyHomeY) <= input.joyHomeR
    if (onHome && joyId === null) {
      joyId = e.pointerId
      input.joyActive = true
      // Grabbed by its centre, so the first touch is already a push in the
      // finger's direction.
      input.joyOriginX = input.joyHomeX
      input.joyOriginY = input.joyHomeY
      input.joyX = 0
      input.joyY = 0
      stickTo(x, y)
      try { surface.setPointerCapture(e.pointerId) } catch { /* ignore */ }
      e.preventDefault()
      return
    }
    if (ptrId !== null) return
    ptrId = e.pointerId
    downAt = performance.now()
    input.held = true
    input.dragging = false
    input.ptrX = input.ptrX0 = x
    input.ptrY = input.ptrY0 = y
    try { surface.setPointerCapture(e.pointerId) } catch { /* ignore */ }
    e.preventDefault()
  }

  const onMove = (e: PointerEvent) => {
    const r = rect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (e.pointerId === joyId) {
      stickTo(x, y)
      e.preventDefault()
      return
    }
    if (e.pointerType === 'mouse' && !touchOnly) {
      input.hoverX = x
      input.hoverY = y
    }
    if (e.pointerId !== ptrId) return
    input.ptrX = x
    input.ptrY = y
    if (!input.dragging) {
      const lim = e.pointerType === 'mouse' ? DRAG_MOUSE : DRAG_TOUCH
      if (Math.hypot(x - input.ptrX0, y - input.ptrY0) > lim) input.dragging = true
    }
    e.preventDefault()
  }

  const onUp = (e: PointerEvent) => {
    if (e.pointerId === joyId) {
      joyId = null
      input.joyActive = false
      input.moveX = 0
      input.moveY = 0
      updateKeysMove()
      return
    }
    if (e.pointerId !== ptrId) return
    ptrId = null
    const r = rect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    if (input.dragging) {
      input.dropped = true
      input.dropX = x
      input.dropY = y
    } else if (e.type !== 'pointercancel' && performance.now() - downAt < TAP_MAX_MS) {
      input.taps.push({ x, y })
    } else if (e.type !== 'pointercancel') {
      // A long still press is a tap too: a slow finger still wants to go there.
      input.taps.push({ x, y })
    }
    input.held = false
    input.dragging = false
  }

  const onLeave = () => {
    input.hoverX = -1
    input.hoverY = -1
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement | null)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
    input.touched = true
    if (!touchOnly) {
      input.device = 'mouse'
      // Every real key teaches the layout its label (`keyLabels.ts`).
      observeKey(e)
    }
    if (e.repeat && keys.has(e.code)) return
    keys.add(e.code)
    if (!e.repeat && !NOT_A_PRESS.has(e.code)) input.anyPressed = true
    const a = actionForCode(e.code)
    if (a !== null) {
      const slot = SKILL_ACTIONS[a]
      if (slot !== undefined) input.skillTap = slot
      else if (a === 'potion') input.potionQueued = true
      else if (a === 'interact') input.interactQueued = true
      else if (a === 'target') { input.targetQueued = true; e.preventDefault() }
      else if (a === 'map') input.panelQueued = 'map'
      else if (a === 'character') input.panelQueued = 'character'
      else if (a === 'inventory') input.panelQueued = 'inventory'
      else if (a === 'skills') input.panelQueued = 'skills'
      else if (a === 'up' || a === 'down' || a === 'left' || a === 'right') {
        // The arrows and Space must not scroll a portal's page under the game.
        if (e.code.startsWith('Arrow')) e.preventDefault()
      }
    } else if (e.code === 'Escape' || e.code === 'KeyP') {
      input.pauseQueued = true
    }
    updateKeysMove()
  }

  const onKeyUp = (e: KeyboardEvent) => {
    keys.delete(e.code)
    updateKeysMove()
  }

  const onBlur = () => {
    keys.clear()
    input.moveX = 0
    input.moveY = 0
    input.keysMoving = false
    input.joyActive = false
    input.held = false
    input.dragging = false
    joyId = null
    ptrId = null
  }

  const onContext = (e: Event) => e.preventDefault()

  surface.addEventListener('pointerdown', onDown, { passive: false })
  surface.addEventListener('pointermove', onMove, { passive: false })
  surface.addEventListener('pointerup', onUp)
  surface.addEventListener('pointercancel', onUp)
  surface.addEventListener('pointerleave', onLeave)
  surface.addEventListener('contextmenu', onContext)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)

  return () => {
    surface.removeEventListener('pointerdown', onDown)
    surface.removeEventListener('pointermove', onMove)
    surface.removeEventListener('pointerup', onUp)
    surface.removeEventListener('pointercancel', onUp)
    surface.removeEventListener('pointerleave', onLeave)
    surface.removeEventListener('contextmenu', onContext)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', onBlur)
  }
}
