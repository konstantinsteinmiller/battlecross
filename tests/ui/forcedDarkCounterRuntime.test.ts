// @vitest-environment jsdom
// The counter's DOM side: it writes the planned declarations (inline, !important), follows the app's re-renders,
// leaves `data-bc-raw` subtrees alone, and puts everything back when stopped. jsdom has no layout, so
// `getClientRects` is stubbed to "visible" and the paint worklet is a fake that only has to register.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type Counter = typeof import('@/utils/forcedDarkCounter')

const CREAM = 'rgb(243, 231, 201)'
const INK = 'rgb(27, 22, 38)'

const settle = async (): Promise<void> => {
  for (let i = 0; i < 4; i++) await new Promise(r => setTimeout(r, 5))
}

// jsdom's style engine rejects `paint()` in background-image/border-image-source, so what the counter
// WRITES is recorded at the setProperty call instead of read back from the element.
const writes: { style: CSSStyleDeclaration; prop: string; value: string; priority: string }[] = []
const wrote = (el: HTMLElement, prop: string): string | undefined =>
  writes.filter(w => w.style === el.style && w.prop === prop).pop()?.value

let counter: Counter
const load = async (worklet: boolean): Promise<Counter> => {
  vi.resetModules()
  vi.stubGlobal('CSS', worklet ? { paintWorklet: { addModule: () => Promise.resolve() } } : {})
  return import('@/utils/forcedDarkCounter')
}

beforeEach(() => {
  writes.length = 0
  const setProperty = CSSStyleDeclaration.prototype.setProperty
  vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty').mockImplementation(function (this: CSSStyleDeclaration, prop: string, value: string | null, priority?: string | null) {
    writes.push({ style: this, prop, value: String(value), priority: priority ?? '' })
    return setProperty.call(this, prop, value, priority ?? '')
  })
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue([{}] as unknown as DOMRectList)
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number)
  vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
})

afterEach(() => {
  counter?.stopCounter()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('forcedDarkCounter runtime', () => {
  it('paints a panel and its ink text with the authored colours, then restores the style attribute', async () => {
    counter = await load(true)
    document.body.innerHTML = `<div id="a" style="background-color: ${CREAM}; color: ${INK}">Hello</div>`
    const a = document.getElementById('a')!
    const before = a.style.cssText
    expect(await counter.startCounter()).toBe(true)
    await settle()
    expect(counter.counterUsesPaint()).toBe(true)
    expect(wrote(a, 'background-image')).toBe('paint(bc-p0), paint(bc-p1)')
    expect(a.style.getPropertyValue('--bc-p0')).toBe('27 22 38 1')
    expect(a.style.getPropertyValue('--bc-p1')).toBe('243 231 201 1')
    expect(a.style.getPropertyValue('color')).toBe('transparent')
    // !important, so a game rule with !important cannot undo it.
    expect(a.style.getPropertyPriority('--bc-p0')).toBe('important')
    expect(a.style.getPropertyPriority('color')).toBe('important')
    expect(document.head.querySelector('style[data-bc-fix]')!.textContent).toContain(':where(img){filter:brightness(1.41)}')
    expect(counter.counterStats().planned).toBeGreaterThan(0)

    counter.stopCounter()
    expect(a.style.cssText).toBe(before)
    expect(document.head.querySelector('style[data-bc-fix]')).toBeNull()
    expect(counter.isCounterRunning()).toBe(false)
  })

  it('picks up nodes the app adds later and re-plans a changed class', async () => {
    counter = await load(true)
    document.body.innerHTML = '<div id="host"></div>'
    await counter.startCounter()
    await settle()
    const host = document.getElementById('host')!
    const late = document.createElement('div')
    late.setAttribute('style', `background-color: ${CREAM}`)
    host.appendChild(late)
    await settle()
    expect(wrote(late, 'background-image')).toBe('paint(bc-p0)')

    // The game rewriting a colour-bearing style is re-planned from the NEW authored value.
    late.style.setProperty('background-color', 'rgb(10, 20, 30)')
    await settle()
    expect(late.style.getPropertyValue('--bc-p0')).toBe('10 20 30 1')
  })

  it('leaves data-bc-raw subtrees and the guard\'s sentinel alone', async () => {
    counter = await load(true)
    document.body.innerHTML =
      `<div data-bc-raw><div id="raw" style="background-color: ${INK}"></div></div>` +
      `<div id="probe" data-fdmg-sentinel style="background-color: rgb(254, 253, 252)"></div>`
    await counter.startCounter()
    await settle()
    expect(wrote(document.getElementById('raw')!, 'background-image')).toBeUndefined()
    expect(wrote(document.getElementById('probe')!, 'background-image')).toBeUndefined()
  })

  it('does not rewrite when only geometry changes', async () => {
    counter = await load(true)
    document.body.innerHTML = `<div id="bar" style="background-color: ${CREAM}; width: 40%"></div>`
    await counter.startCounter()
    await settle()
    const planned = counter.counterStats().planned
    const bar = document.getElementById('bar')!
    for (let i = 41; i < 60; i++) bar.style.width = `${i}%`
    await settle()
    expect(counter.counterStats().planned).toBe(planned)
  })

  it('without the worklet it pre-corrects colours and never writes paint()', async () => {
    counter = await load(false)
    document.body.innerHTML = `<div id="a" style="background-color: ${CREAM}"></div>`
    await counter.startCounter()
    await settle()
    const a = document.getElementById('a')!
    expect(counter.counterUsesPaint()).toBe(false)
    expect(wrote(a, 'background-image')).toBeUndefined()
    expect(a.style.getPropertyValue('background-color')).toMatch(/^rgba?\(/)
    expect(a.style.getPropertyValue('background-color').replace(/\s/g, '')).not.toBe(CREAM.replace(/\s/g, ''))
  })

  it('start is idempotent and stop is safe when never started', async () => {
    counter = await load(true)
    counter.stopCounter()
    expect(await counter.startCounter()).toBe(true)
    expect(await counter.startCounter()).toBe(true)
    counter.stopCounter()
    expect(counter.isCounterRunning()).toBe(false)
  })
})
