import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { installBrowserGuard } from '@/use/useBrowserGuard'

// The guard cancels browser DEFAULTS only: menus, gestures, autoscroll,
// history buttons, drag, selection, quick find. Text fields keep theirs, the
// left button keeps its default, and the uninstaller removes every listener.
const fire = <T extends Event>(target: EventTarget, e: T): T => {
  target.dispatchEvent(e)
  return e
}
const mouse = (type: string, button: number, buttons = 0) =>
  new MouseEvent(type, { button, buttons, bubbles: true, cancelable: true })
const key = (type: string, code: string, k: string) =>
  new KeyboardEvent(type, { code, key: k, bubbles: true, cancelable: true })

describe('browser guard', () => {
  let remove: () => void
  let field: HTMLInputElement
  beforeEach(() => {
    remove = installBrowserGuard()
    field = document.createElement('input')
    document.body.appendChild(field)
  })
  afterEach(() => {
    remove()
    field.remove()
  })

  it('cancels every context menu outside text fields', () => {
    expect(fire(document.body, new MouseEvent('contextmenu', { bubbles: true, cancelable: true })).defaultPrevented).toBe(true)
    expect(fire(field, new MouseEvent('contextmenu', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false)
  })

  it('consumes the right, middle and thumb buttons, never the left', () => {
    for (const b of [1, 2, 3, 4]) {
      expect(fire(document.body, mouse('mousedown', b)).defaultPrevented).toBe(true)
      expect(fire(document.body, mouse('mouseup', b)).defaultPrevented).toBe(true)
    }
    expect(fire(document.body, mouse('mousedown', 0)).defaultPrevented).toBe(false)
    expect(fire(document.body, mouse('mouseup', 0)).defaultPrevented).toBe(false)
    expect(fire(document.body, mouse('auxclick', 1)).defaultPrevented).toBe(true)
  })

  it('stops wheel tab-switching only while the right button is held', () => {
    const held = new WheelEvent('wheel', { deltaY: 100, buttons: 2, bubbles: true, cancelable: true })
    const free = new WheelEvent('wheel', { deltaY: 100, buttons: 0, bubbles: true, cancelable: true })
    expect(fire(document.body, held).defaultPrevented).toBe(true)
    expect(fire(document.body, free).defaultPrevented).toBe(false)
  })

  it('cancels drag and selection outside text fields', () => {
    expect(fire(document.body, new Event('dragstart', { bubbles: true, cancelable: true })).defaultPrevented).toBe(true)
    expect(fire(document.body, new Event('selectstart', { bubbles: true, cancelable: true })).defaultPrevented).toBe(true)
    expect(fire(field, new Event('selectstart', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false)
  })

  it('keeps quick find, F1 and a lone Alt away from the browser', () => {
    expect(fire(document.body, key('keydown', 'Slash', '/')).defaultPrevented).toBe(true)
    expect(fire(document.body, key('keydown', 'Quote', "'")).defaultPrevented).toBe(true)
    expect(fire(document.body, key('keydown', 'F1', 'F1')).defaultPrevented).toBe(true)
    expect(fire(field, key('keydown', 'Slash', '/')).defaultPrevented).toBe(false)
    fire(document.body, key('keydown', 'AltLeft', 'Alt'))
    expect(fire(document.body, key('keyup', 'AltLeft', 'Alt')).defaultPrevented).toBe(true)
    // Alt used as a modifier (Alt+Tab, the cheat chords) is not touched.
    fire(document.body, key('keydown', 'AltLeft', 'Alt'))
    fire(document.body, key('keydown', 'KeyK', 'k'))
    expect(fire(document.body, key('keyup', 'AltLeft', 'Alt')).defaultPrevented).toBe(false)
  })

  it('leaves game keys to the game', () => {
    expect(fire(document.body, key('keydown', 'KeyW', 'w')).defaultPrevented).toBe(false)
  })

  it('uninstalls every listener', () => {
    remove()
    expect(fire(document.body, new MouseEvent('contextmenu', { bubbles: true, cancelable: true })).defaultPrevented).toBe(false)
    expect(fire(document.body, mouse('mousedown', 2)).defaultPrevented).toBe(false)
    remove = installBrowserGuard()
  })
})
