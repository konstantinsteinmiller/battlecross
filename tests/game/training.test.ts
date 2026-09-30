import { describe, expect, it } from 'vitest'
import { Training, INTRO_FOR, HELP_AFTER, type TrainHost, type TrainId } from '@/game/sim/training'
import { DemoDriver, chargeDemo, blockDemo, DEMO_SKIP } from '@/game/sim/demo'
import { createInput } from '@/game/engine/input'

// Every lesson room runs intro → card (time frozen) → demo → try, a hint
// every HELP_AFTER while stuck, and a tick once done. The gap has no card.
const host = () => {
  const log: string[] = []
  let demo = false
  const h: TrainHost = {
    say: (l) => { log.push(`say:${l}`) },
    freezeForCard: (id) => { log.push(`freeze:${id}`) },
    unfreeze: () => { log.push('unfreeze') },
    startDemo: (id: TrainId) => { log.push(`demo:${id}`); demo = id !== 'gel'; return demo },
    demoOver: () => !demo
  }
  return { h, log, endDemo: () => { demo = false } }
}

describe('training rooms', () => {
  it('runs intro, card, demo, try in order', () => {
    const { h, log, endDemo } = host()
    const tr = new Training(h)
    tr.enter('charge', 0)
    expect(tr.phase).toBe('intro')
    expect(log).toEqual(['say:train.charge'])
    tr.update(INTRO_FOR + 0.01, true)
    expect(tr.phase).toBe('card')
    expect(log).toContain('freeze:charge')
    tr.dismissCard(3)
    expect(log).toContain('unfreeze')
    expect(tr.phase).toBe('demo')
    endDemo()
    tr.update(5, true)
    expect(tr.phase).toBe('try')
  })

  it('hints every HELP_AFTER while the player is stuck, stops once done', () => {
    const { h, log } = host()
    const tr = new Training(h)
    tr.enter('gel', 0)
    tr.update(INTRO_FOR + 0.1, true)
    tr.dismissCard(2) // gel's demo is 'none' in this host: straight to try
    expect(tr.phase).toBe('try')
    tr.update(2 + HELP_AFTER + 0.1, true)
    tr.update(2 + 2 * HELP_AFTER + 0.2, true)
    expect(log.filter(l => l === 'say:help.gel')).toHaveLength(2)
    tr.complete('gel')
    tr.update(2 + 5 * HELP_AFTER, true)
    expect(log.filter(l => l === 'say:help.gel')).toHaveLength(2)
    expect(tr.phase).toBe('done')
  })

  it('the gap is wordless: no card', () => {
    const { h, log } = host()
    const tr = new Training(h)
    tr.enter('gap', 0)
    tr.update(INTRO_FOR + 0.1, true)
    expect(tr.phase).toBe('try')
    expect(log.some(l => l.startsWith('freeze'))).toBe(false)
  })

  it('a lesson already done only shows its tick', () => {
    const { h, log } = host()
    const tr = new Training(h)
    tr.complete('block')
    tr.enter('block', 0)
    expect(tr.phase).toBe('done')
    expect(log).toEqual([])
  })
})

describe('demo driver', () => {
  it('holds fire past the charge, then releases it', () => {
    const d = new DemoDriver()
    const inp = createInput()
    d.start(chargeDemo(null, false))
    let released = false
    let held = false
    for (let i = 0; i < 240 && d.active; i++) {
      d.step(1 / 60, inp)
      held ||= inp.fireHeld
      released ||= inp.fireReleased
      inp.fireReleased = false
    }
    expect(held).toBe(true)
    expect(released).toBe(true)
    expect(d.active).toBe(false)
    expect(inp.fireHeld).toBe(false)
  })

  it('emits its demo shots and ignores the player\'s stick', () => {
    const d = new DemoDriver()
    const inp = createInput()
    d.start(blockDemo(null, 0.6))
    let shots = 0
    for (let i = 0; i < 400 && d.active; i++) {
      inp.moveY = 1
      d.step(1 / 60, inp)
      shots += d.emits.filter(e => e === 'shot').length
      expect(inp.moveY).toBe(0)
    }
    expect(shots).toBe(4)
  })

  it('two real presses skip it', () => {
    const d = new DemoDriver()
    const inp = createInput()
    d.start(chargeDemo(null, true))
    for (let k = 0; k < DEMO_SKIP; k++) {
      inp.anyPressed = true
      d.step(1 / 60, inp)
      inp.anyPressed = false
    }
    expect(d.active).toBe(false)
    expect(inp.fireHeld).toBe(false)
  })
})
