import { describe, expect, it } from 'vitest'
import { BREATHER, MAX_IGNORED, NUDGE_TIMING, Nudger, type NudgeCand } from '@/game/coach/nudge'

/**
 * The nudges toward the next goal (roadmap #69): soft, one at a time, gone
 * when the player gets going, backing off when ignored, never during a fight
 * or a window, and a glow instead of a hop for reduced motion.
 */

const bounce: NudgeCand = { id: 'bounce:menu-map', kind: 'bounce' }
const edge: NudgeCand = { id: 'edge:goal', kind: 'edge' }
const crumbs: NudgeCand = { id: 'crumbs:goal', kind: 'crumbs' }
const peek: NudgeCand = { id: 'peek:chest', kind: 'peek' }

/** Run the scheduler for `secs`, 10 steps a second; returns what was up at the end, and every id that showed. */
const run = (n: Nudger, t0: number, secs: number, cands: NudgeCand[], o: { blocked?: boolean; first?: boolean; reduced?: boolean } = {}) => {
  const seen = new Set<string>()
  let out = n.step({ now: t0, dt: 0, blocked: !!o.blocked, cands, firstTimer: o.first ?? false, reduced: o.reduced })
  for (let t = 0.1; t <= secs + 1e-6; t += 0.1) {
    out = n.step({ now: t0 + t, dt: 0.1, blocked: !!o.blocked, cands, firstTimer: o.first ?? false, reduced: o.reduced })
    if (out.active) seen.add(out.active.id)
  }
  return { out, seen, end: t0 + secs }
}

describe('nudges: soft pulls toward the next goal', () => {
  it('nothing at first; a cue only after the player has made no progress for a while (sooner for a first-timer)', () => {
    const vet = new Nudger()
    expect(run(vet, 0, NUDGE_TIMING.bounce.vet - 0.5, [bounce]).out.active).toBeNull()
    expect(run(vet, 20, 1, [bounce]).out.active?.id).toBe('bounce:menu-map')
    const first = new Nudger()
    expect(run(first, 0, NUDGE_TIMING.bounce.first + 0.2, [bounce], { first: true }).out.active?.id).toBe('bounce:menu-map')
    expect(NUDGE_TIMING.bounce.first).toBeLessThan(NUDGE_TIMING.bounce.vet)
  })

  it('one nudge at a time, the most useful first', () => {
    // The scheduler holds one `active` cue by construction; what matters is
    // which comes first, and that each runs its course before the next.
    const n2 = new Nudger()
    let firstShown = ''
    for (let t = 0; t < 40; t += 0.1) {
      const o = n2.step({ now: t, dt: 0.1, blocked: false, cands: [bounce, edge, crumbs], firstTimer: false })
      if (o.active && !firstShown) firstShown = o.active.id
    }
    expect(firstShown).toBe('bounce:menu-map')
  })

  it('it shows for a few seconds only, and comes back no sooner than its gap', () => {
    const n = new Nudger()
    run(n, 0, NUDGE_TIMING.bounce.vet + 0.2, [bounce])
    expect(n.active?.id).toBe('bounce:menu-map')
    const down = run(n, NUDGE_TIMING.bounce.vet + 0.2, NUDGE_TIMING.bounce.show + 0.2, [bounce])
    expect(down.out.active).toBeNull()
    // Within the gap it stays down, however idle the player is.
    const again = run(n, down.end, NUDGE_TIMING.bounce.gap - 1, [bounce])
    expect(again.seen.size).toBe(0)
    // After it, it may come back.
    expect(run(n, again.end, NUDGE_TIMING.bounce.vet + 2, [bounce]).seen.size).toBe(1)
  })

  it(`backs off for the visit after ${MAX_IGNORED} ignored showings; a new visit starts over`, () => {
    const n = new Nudger()
    let shows = 0
    let was = false
    for (let t = 0; t < 400; t += 0.1) {
      const o = n.step({ now: t, dt: 0.1, blocked: false, cands: [bounce], firstTimer: false })
      if (o.active && !was) shows++
      was = !!o.active
    }
    expect(shows).toBe(MAX_IGNORED)
    expect(n.backedOff('bounce:menu-map')).toBe(true)
    n.visit()
    expect(n.backedOff('bounce:menu-map')).toBe(false)
  })

  it('a player who goes on standing about meets the next, stronger cue — after a breather, never back to back', () => {
    const n = new Nudger()
    const shown: Array<[string, number]> = []
    let was = ''
    for (let t = 0; t < 60; t += 0.1) {
      const o = n.step({ now: t, dt: 0.1, blocked: false, cands: [edge, crumbs], firstTimer: false })
      const id = o.active?.id ?? ''
      if (id && id !== was) shown.push([id, t])
      was = id
    }
    expect(shown[0]![0]).toBe('edge:goal')
    expect(shown.map(s => s[0])).toContain('crumbs:goal')
    // Each cue starts at least a breather after the one before it ended.
    for (let i = 1; i < shown.length; i++) {
      const prev = shown[i - 1]!
      expect(shown[i]![1] - (prev[1] + NUDGE_TIMING[prev[0].startsWith('edge') ? 'edge' : 'crumbs'].show)).toBeGreaterThanOrEqual(BREATHER - 0.15)
    }
  })

  it('progress (closer to the goal, a goal done) takes the cue down and restarts the wait', () => {
    const n = new Nudger()
    run(n, 0, NUDGE_TIMING.bounce.vet + 0.5, [bounce])
    expect(n.active).not.toBeNull()
    n.progress()
    expect(n.active).toBeNull()
    expect(n.idle).toBe(0)
    expect(run(n, 50, NUDGE_TIMING.bounce.vet - 1, [bounce]).seen.size).toBe(0)
  })

  it('doing the thing retires the nudge for good, across visits', () => {
    const n = new Nudger()
    n.used('bounce:menu-map')
    n.visit()
    expect(run(n, 0, 60, [bounce]).seen.size).toBe(0)
  })

  it('never during a fight, a conversation or a window: and the wait does not run on meanwhile', () => {
    const n = new Nudger()
    expect(run(n, 0, 60, [bounce, edge], { blocked: true }).seen.size).toBe(0)
    expect(n.idle).toBe(0)
    // Up, then a window opens: it goes at once.
    run(n, 100, NUDGE_TIMING.bounce.vet + 0.5, [bounce])
    expect(n.active).not.toBeNull()
    expect(n.step({ now: 200, dt: 0.1, blocked: true, cands: [bounce], firstTimer: false }).active).toBeNull()
  })

  it('a cue whose target is gone (the chest opened, the button left) ends without counting as ignored', () => {
    const n = new Nudger()
    run(n, 0, NUDGE_TIMING.bounce.vet + 0.5, [bounce])
    expect(n.step({ now: 20, dt: 0.1, blocked: false, cands: [], firstTimer: false }).active).toBeNull()
    expect(n.backedOff('bounce:menu-map')).toBe(false)
  })

  it('the camera peek comes once a zone at most, and never with reduced motion', () => {
    const n = new Nudger()
    expect(run(n, 0, 60, [peek]).seen.has('peek:chest')).toBe(true)
    expect(run(n, 100, 120, [peek]).seen.size).toBe(0)
    const calm = new Nudger()
    expect(run(calm, 0, 60, [peek], { reduced: true }).seen.size).toBe(0)
  })

  it('reduced motion: the same cues as a glow, not a hop', () => {
    const n = new Nudger()
    const { out } = run(n, 0, NUDGE_TIMING.bounce.vet + 0.5, [bounce], { reduced: true })
    expect(out.active?.id).toBe('bounce:menu-map')
    expect(out.style).toBe('glow')
    expect(run(new Nudger(), 0, NUDGE_TIMING.bounce.vet + 0.5, [bounce]).out.style).toBe('bounce')
  })

  it('the timings: short for 10–15 year olds, a first-timer sooner, and every cue gone within seconds', () => {
    for (const [k, t] of Object.entries(NUDGE_TIMING)) {
      expect(t.first, k).toBeLessThanOrEqual(t.vet)
      expect(t.vet, k).toBeLessThanOrEqual(20)
      expect(t.show, k).toBeLessThanOrEqual(6)
    }
    // The edge arrow and the map's way come within the 12–20 s the brief asks (sooner for a first-timer).
    expect(NUDGE_TIMING.edge.vet).toBeGreaterThanOrEqual(12)
    expect(NUDGE_TIMING.mapWay.vet).toBe(15)
  })
})
