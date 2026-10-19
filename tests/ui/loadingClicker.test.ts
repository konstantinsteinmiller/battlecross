// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { MONSTER_KINDS, bindInput, monsterAt, pickHero } from '@/utils/loadingClicker/logic'

describe('loading clicker rules', () => {
  it('runs the monsters in the set order, then loops with a tougher round', () => {
    const order = ['goblin', 'treant', 'elemental', 'golem', 'wolf', 'dragon', 'demon', 'wraith', 'titan']
    expect(order.map((_, i) => monsterAt(i).kind)).toEqual(order)
    expect(monsterAt(MONSTER_KINDS.length)).toMatchObject({ kind: 'goblin', round: 1 })
    expect(monsterAt(0).kind).toBe('goblin')
    expect(monsterAt(MONSTER_KINDS.length).hp).toBeGreaterThan(monsterAt(0).hp)
  })
  it('never gets easier, and stays finite', () => {
    for (let i = 1; i < 200; i++) expect(monsterAt(i).hp).toBeGreaterThanOrEqual(monsterAt(i - 1).hp)
    expect(Number.isFinite(monsterAt(1e9).hp)).toBe(true)
    expect(monsterAt(0).hp).toBe(3)
  })
  it('the first load is always the man; later loads flip a coin', () => {
    expect(pickHero(true, () => 0.99)).toBe('male')
    expect(pickHero(false, () => 0.2)).toBe('male')
    expect(pickHero(false, () => 0.8)).toBe('female')
  })
})

describe('loading clicker input', () => {
  const setup = () => {
    let hits = 0
    const off = bindInput(window, () => { hits++ })
    return { hits: () => hits, off }
  }
  const down = (target: EventTarget, init: PointerEventInit = {}) =>
    target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, ...init }))
  it('a click anywhere (far from any canvas) is one attack, even if a layer stops propagation', () => {
    const s = setup()
    const layer = document.createElement('div')
    layer.addEventListener('pointerdown', e => e.stopPropagation())
    document.body.append(layer)
    down(document.body)
    down(layer)
    expect(s.hits()).toBe(2)
    s.off(); layer.remove()
  })
  it('any plain key is one attack; held keys, modifiers and shortcuts are not', () => {
    const s = setup()
    const key = (init: KeyboardEventInit) => window.dispatchEvent(new KeyboardEvent('keydown', init))
    key({ key: 'a' })
    key({ key: ' ' })
    expect(s.hits()).toBe(2)
    key({ key: 'a', repeat: true }); key({ key: 'Shift' }); key({ key: 'r', ctrlKey: true }); key({ key: 'l', metaKey: true })
    expect(s.hits()).toBe(2)
    s.off()
  })
  it('stops listening once removed', () => {
    const s = setup()
    s.off()
    down(document.body)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(s.hits()).toBe(0)
  })
})
