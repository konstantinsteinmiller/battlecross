import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { __resetIdleQueue, idleNow, idleTask, idleWaiting, rerankIdle, setIdleHold, startIdleQueue } from '@/utils/idleQueue'

// ─── The background loads after the first frame (roadmap #142) ──────────────

/** A task that records when it ran and resolves at once. */
const recorder = (): { ran: string[]; task: (k: string) => () => Promise<void> } => {
  const ran: string[] = []
  return { ran, task: (k: string) => async () => { ran.push(k) } }
}

/** Let the queue run everything it has (idle callbacks are timers here). */
const drain = async (): Promise<void> => { for (let i = 0; i < 40; i++) await vi.advanceTimersByTimeAsync(200) }

describe('the idle queue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // An idle period is a timer in the test: deterministic, and it proves the
    // queue goes through requestIdleCallback when the browser has one.
    vi.stubGlobal('requestIdleCallback', (cb: () => void) => setTimeout(cb, 10) as unknown as number)
    vi.stubGlobal('cancelIdleCallback', (h: number) => clearTimeout(h))
    __resetIdleQueue()
  })
  afterEach(() => {
    __resetIdleQueue()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('runs nothing before the first frame starts it', async () => {
    const r = recorder()
    idleTask('a', r.task('a'))
    await drain()
    expect(r.ran).toEqual([])
    startIdleQueue()
    await drain()
    expect(r.ran).toEqual(['a'])
  })

  it('runs at most two tasks at a time, lowest rank first, in queue order on a tie', async () => {
    let inFlight = 0
    let most = 0
    const ran: string[] = []
    const slow = (k: string) => async () => {
      inFlight++
      most = Math.max(most, inFlight)
      await new Promise(resolve => setTimeout(resolve, 300))
      ran.push(k)
      inFlight--
    }
    idleTask('late', slow('late'), 30)
    idleTask('first', slow('first'), 1)
    idleTask('tieA', slow('tieA'), 5)
    idleTask('tieB', slow('tieB'), 5)
    startIdleQueue()
    await drain()
    expect(ran).toEqual(['first', 'tieA', 'tieB', 'late'])
    expect(most).toBe(2)
  })

  it('queues a key once, keeps the better rank, and never runs a finished key again', async () => {
    const r = recorder()
    idleTask('x', r.task('x'), 40)
    idleTask('y', r.task('y'), 20)
    idleTask('x', r.task('x-again'), 10)
    expect(idleWaiting()).toEqual(['x', 'y'])
    startIdleQueue()
    await drain()
    idleTask('x', r.task('x-third'), 1)
    await drain()
    expect(r.ran).toEqual(['x', 'y'])
  })

  it('re-ranks what is still waiting (a new place)', () => {
    const r = recorder()
    idleTask('book', r.task('book'), 1)
    idleTask('trade', r.task('trade'), 2)
    rerankIdle({ book: 9, trade: 0, unknown: 0 })
    expect(idleWaiting()).toEqual(['trade', 'book'])
  })

  it('jumps the queue on demand, and the caller can wait on the load', async () => {
    const r = recorder()
    idleTask('a', r.task('a'), 1)
    idleTask('b', r.task('b'), 2)
    await idleNow('b')
    expect(r.ran).toEqual(['b'])
    expect(idleWaiting()).toEqual(['a'])
    await expect(idleNow('nothing')).resolves.toBeUndefined()
  })

  it('a quiet task runs alone, one after another, and lets a plain task of a worse rank go first', async () => {
    let inFlight = 0
    const log: string[] = []
    const slow = (k: string) => async () => {
      log.push(`+${k}:${inFlight}`)
      inFlight++
      await new Promise(resolve => setTimeout(resolve, 300))
      inFlight--
    }
    idleTask('art1', slow('art1'), 1, { quiet: true })
    idleTask('art2', slow('art2'), 2, { quiet: true })
    idleTask('chunk', slow('chunk'), 30)
    startIdleQueue()
    await drain()
    // The first art had the connection to itself; the chunk went in beside
    // it (a plain task), and the second art waited until nothing was in flight.
    expect(log[0]).toBe('+art1:0')
    expect(log).toContain('+chunk:1')
    expect(log.indexOf('+art2:0')).toBeGreaterThan(log.indexOf('+chunk:1'))
    expect(idleWaiting()).toEqual([])
  })

  it('drops a task that fails, so a later ask loads it again', async () => {
    let tries = 0
    idleTask('flaky', async () => { tries++; throw new Error('offline') })
    startIdleQueue()
    await drain()
    expect(tries).toBe(1)
    idleTask('flaky', async () => { tries++ })
    await drain()
    expect(tries).toBe(2)
  })
})

describe('the screens on the background queue', () => {
  beforeEach(() => { __resetIdleQueue() })
  afterEach(() => { __resetIdleQueue() })

  it('a field fetches the book, then the map, before any table; a town its conversation and tables first', async () => {
    const { queueScreens, SCREEN_CHUNKS, SCREEN_ORDER, screenTask } = await import('@/components/screens/chunks')
    // Every screen is in both orders, once.
    for (const order of Object.values(SCREEN_ORDER)) expect([...order].sort()).toEqual(Object.keys(SCREEN_CHUNKS).sort())
    queueScreens('field')
    expect(idleWaiting().slice(0, 3)).toEqual(['heroBook', 'worldMap', 'dialog'].map(n => screenTask(n as never)))
    expect(idleWaiting().slice(-6)).toEqual(['memory', 'itemBattle', 'cups', 'whack', 'ring', 'arm'].map(n => screenTask(n as never)))
    // Arriving in a town re-ranks what is still waiting.
    queueScreens('town')
    expect(idleWaiting().slice(0, 2)).toEqual([screenTask('dialog'), screenTask('trade')])
  })
})

// ─── Held while play struggles (#Perf1) ─────────────────────────────────────

describe('the idle queue under a struggling frame rate (#Perf1)', () => {
  let timedOut = true
  beforeEach(() => {
    vi.useFakeTimers()
    // A device at 3-9 fps: every idle callback arrives by its timeout.
    if (typeof window === 'undefined') vi.stubGlobal('window', globalThis)
    vi.stubGlobal('requestIdleCallback', (cb: (d: { didTimeout: boolean }) => void) => setTimeout(() => cb({ didTimeout: timedOut }), 10) as unknown as number)
    vi.stubGlobal('cancelIdleCallback', (h: number) => clearTimeout(h))
    __resetIdleQueue()
    timedOut = true
  })
  afterEach(() => {
    __resetIdleQueue()
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('forces nothing in on the timeout while held, and runs once the hold lifts', async () => {
    let struggling = true
    setIdleHold(() => struggling)
    const r = recorder()
    idleTask('a', r.task('a'))
    idleTask('b', r.task('b'))
    startIdleQueue()
    await drain()
    expect(r.ran).toEqual([])
    struggling = false
    await drain()
    expect(r.ran).toEqual(['a', 'b'])
  })

  it('a genuine idle period still runs a task while held', async () => {
    setIdleHold(() => true)
    timedOut = false
    const r = recorder()
    idleTask('a', r.task('a'))
    startIdleQueue()
    await drain()
    expect(r.ran).toEqual(['a'])
  })

  it('a window about to open is not held', async () => {
    setIdleHold(() => true)
    const r = recorder()
    idleTask('screen', r.task('screen'))
    startIdleQueue()
    await drain()
    expect(r.ran).toEqual([])
    await idleNow('screen')
    expect(r.ran).toEqual(['screen'])
  })

  it('the scene holds the queue only while the loop runs under ~30 fps', () => {
    const src = readFileSync(join(__dirname, '../../src/views/GameScene.vue'), 'utf8')
    expect(src).toMatch(/setIdleHold\(\(\) => app\.running && app\.frameMs > IDLE_HOLD_MS\)/)
  })
})
