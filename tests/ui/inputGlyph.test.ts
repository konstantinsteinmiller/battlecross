import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import InputGlyph from '@/components/hud/InputGlyph.vue'
import ControlHints from '@/components/hud/ControlHints.vue'
import ControlsPanel from '@/components/hud/ControlsPanel.vue'
import {
  FINGERTIP, FINGER_HOLD, HAND, INFINITY, INF_HAND_SCALE, INF_POINTS, INF_SAMPLES, MOUSE_HOLD
} from '@/components/hud/glyphGeometry'
import { hud } from '@/game/state/hud'

// The legend asks the game which hand is on the controls; the game itself
// (renderer, missions) has no business in a glyph test.
const device = vi.hoisted(() => ({ value: 'touch' as 'touch' | 'mouse' }))
vi.mock('@/game/boot', () => ({ input: { get device() { return device.value } } }))

/**
 * ─── The coach's glyphs must read in one frozen frame ───────────────────────
 *
 * The blind playtest saw the game one still frame at a time, and there two
 * glyphs said nothing. The phone tester never learned to move: the ghost
 * joystick was "a dashed-circle icon", and Slide's arrow looked like "walk".
 * Neither tester ever held fire: the hold glyph's meaning lived in its fill
 * animation, so every still showed a finger (or a mouse) and read as "tap".
 *
 * Now touch "move" is a finger tracing an ∞, and a hold is a timer ring that
 * STANDS three quarters full. jsdom has no layout and runs no animation, which
 * suits the point: what is asserted here is what a frame shows with every
 * animation stopped.
 */

const nums = (list: string): number[] => list.split(';').map(Number)
const points = (d: string): Array<[number, number]> =>
  d.replace(/^M/, '').replace(/Z$/, '').split('L').map(p => p.split(' ').map(Number) as [number, number])

describe('the ∞ the move finger traces', () => {
  const times = nums(INFINITY.keyTimes)
  const shares = nums(INFINITY.keyPoints)
  const offsets = nums(INFINITY.dashOffsets)
  const [dash, gap] = INFINITY.dashArray.split(' ').map(Number) as [number, number]
  const loop = dash + gap

  it('is one closed loop, keyed from start to finish', () => {
    expect(points(INFINITY.d)).toHaveLength(INF_SAMPLES)
    expect(INFINITY.d.endsWith('Z')).toBe(true)
    for (const list of [times, shares, offsets]) expect(list).toHaveLength(INF_SAMPLES + 1)
    expect([times[0], times.at(-1)]).toEqual([0, 1])
    expect([shares[0], shares.at(-1)]).toEqual([0, 1])
    for (let i = 1; i <= INF_SAMPLES; i++) {
      expect(times[i]!).toBeGreaterThan(times[i - 1]!)
      expect(shares[i]!).toBeGreaterThan(shares[i - 1]!)
    }
  })

  it('keeps the streak\'s head under the fingertip the whole way round', () => {
    // The dash covers [s − streak, s] when its offset is streak − s, and the
    // finger is at s = share × loop at the same key time.
    for (let i = 0; i <= INF_SAMPLES; i++) {
      expect(Math.abs(offsets[i]! - (INFINITY.dashRest - shares[i]! * loop))).toBeLessThan(0.05)
    }
    // A streak, not the whole loop lit.
    expect(dash / loop).toBeGreaterThan(0.15)
    expect(dash / loop).toBeLessThan(0.35)
  })

  it('moves the finger along the ∞ itself, measured from where it rests', () => {
    const loopPts = points(INFINITY.d)
    const motion = points(INFINITY.motion)
    const [rx, ry] = INF_POINTS[0]!
    expect(motion[0]).toEqual([0, 0])
    motion.forEach(([x, y], i) => {
      expect(x + rx).toBeCloseTo(loopPts[i]![0], 1)
      expect(y + ry).toBeCloseTo(loopPts[i]![1], 1)
    })
    // The hand's own transform holds the fingertip at rest; the motion adds the rest.
    expect(INFINITY.hand).toBe(`translate(${rx} ${ry}) scale(${INF_HAND_SCALE}) translate(${-FINGERTIP.x} ${-FINGERTIP.y})`)
  })

  it('rests at the bottom of the right loop, where the hand hangs below the ∞', () => {
    const [rx, ry] = INF_POINTS[0]!
    const xs = INF_POINTS.map(p => p[0])
    const mid = (Math.min(...xs) + Math.max(...xs)) / 2
    expect(rx).toBeGreaterThan(mid)
    for (const [, y] of INF_POINTS) expect(ry).toBeGreaterThanOrEqual(y)
  })

  it('eases through the crossing and swings round the loop ends', () => {
    // Key times are even, so a segment's length is the finger's speed there.
    const xs = INF_POINTS.map(p => p[0])
    const lo = Math.min(...xs)
    const hi = Math.max(...xs)
    const mid = (lo + hi) / 2
    const speed = INF_POINTS.map((p, i) => {
      const q = INF_POINTS[(i + 1) % INF_SAMPLES]!
      return { x: (p[0] + q[0]) / 2, v: Math.hypot(q[0] - p[0], q[1] - p[1]) }
    })
    const mean = (vs: number[]) => vs.reduce((a, b) => a + b, 0) / vs.length
    const crossing = mean(speed.filter(s => Math.abs(s.x - mid) < (hi - lo) * 0.08).map(s => s.v))
    const ends = mean(speed.filter(s => Math.abs(s.x - mid) > (hi - lo) * 0.44).map(s => s.v))
    expect(crossing).toBeLessThan(ends * 0.8)
  })

  it('never lets the hand leave the glyph\'s box', () => {
    // The hand's outline (stroke 9) round its rounded rects, thumb rotated.
    const out = 4.5
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity
    for (const r of HAND) {
      const rad = r.rx + out
      let cs: Array<[number, number]> = [[r.x + r.rx, r.y + r.rx], [r.x + r.width - r.rx, r.y + r.height - r.rx]]
      cs = [cs[0]!, cs[1]!, [cs[0]![0], cs[1]![1]], [cs[1]![0], cs[0]![1]]]
      const m = r.transform?.match(/rotate\((-?[\d.]+) ([\d.]+) ([\d.]+)\)/)
      if (m) {
        const a = (Number(m[1]) * Math.PI) / 180
        const [ox, oy] = [Number(m[2]), Number(m[3])]
        cs = cs.map(([x, y]) => [ox + (x - ox) * Math.cos(a) - (y - oy) * Math.sin(a), oy + (x - ox) * Math.sin(a) + (y - oy) * Math.cos(a)])
      }
      for (const [x, y] of cs) {
        x0 = Math.min(x0, x - rad); x1 = Math.max(x1, x + rad)
        y0 = Math.min(y0, y - rad); y1 = Math.max(y1, y + rad)
      }
    }
    const [, , w, h] = INFINITY.viewBox.split(' ').map(Number) as [number, number, number, number]
    const s = INF_HAND_SCALE
    // Between two samples the fingertip is on the chord, so the samples bound it.
    for (const [x, y] of INF_POINTS) {
      expect(x + (x0 - FINGERTIP.x) * s).toBeGreaterThanOrEqual(0)
      expect(x + (x1 - FINGERTIP.x) * s).toBeLessThanOrEqual(w)
      expect(y + (y0 - FINGERTIP.y) * s).toBeGreaterThanOrEqual(0)
      expect(y + (y1 - FINGERTIP.y) * s).toBeLessThanOrEqual(h)
    }
  })
})

describe('the hold ring', () => {
  const ring = (paths: typeof FINGER_HOLD) => Object.fromEntries(paths.map(p => [p.cls, p]))

  it.each([['finger', FINGER_HOLD, 70, 16, 28], ['mouse', MOUSE_HOLD, 70, 58, 54]] as const)(
    '%s: stands three quarters full, from twelve clockwise, with a tick at twelve',
    (_, paths, cx, cy, r) => {
      const p = ring(paths)
      // 270° clockwise: large arc + sweep flags, twelve o'clock to nine.
      expect(p['hold-arc']!.d).toBe(`M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx - r} ${cy}`)
      expect(p['hold-edge']!.d).toBe(p['hold-arc']!.d)
      // The tick stands on the ring at twelve, outside it (a stopwatch's crown).
      expect(p['hold-tick']!.d).toBe(`M${cx} ${cy - r - 9}V${cy - r + 1}`)
      // Only the sweep is animated, so only it is measured in pathLength units.
      expect(paths.filter(q => q.len).map(q => q.cls)).toEqual(['hold-ring'])
    })

  it('is wider than the finger, which hides only its bottom', () => {
    // The old ring (r 20) sat inside the finger's outline: a still showed a
    // cyan sliver over the fingertip, nothing more.
    const finger = HAND[0]!
    expect(28 - 5.5).toBeGreaterThan(finger.width / 2 + 4.5)
  })
})

describe('InputGlyph in a frozen frame', () => {
  const classes = (w: ReturnType<typeof mount>) => w.findAll('[class]').flatMap(e => e.classes())

  it('draws touch "move" as a finger on an ∞, moving on one clock and resting for reduced motion', () => {
    const w = mount(InputGlyph, { props: { kind: 'infinity' } })
    expect(w.find('svg').attributes('viewBox')).toBe(INFINITY.viewBox)
    // SMIL only runs on SVG-namespaced elements with their camelCase attributes.
    expect(w.find('animateMotion').element.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(w.find('path.inf-guide').attributes('d')).toBe(INFINITY.d)
    // In motion: the finger and the streak share key times and duration.
    const live = w.find('g.inf-live')
    const motion = live.find('animateMotion')
    const dash = live.find('animate')
    expect(motion.attributes('path')).toBe(INFINITY.motion)
    expect(motion.attributes('keyPoints')).toBe(INFINITY.keyPoints)
    expect(motion.attributes('calcMode')).toBe('linear')
    expect(dash.attributes('attributeName')).toBe('stroke-dashoffset')
    for (const k of ['keyTimes', 'dur', 'calcMode', 'repeatCount'] as const) {
      expect(dash.attributes(k)).toBe(motion.attributes(k))
    }
    // At rest: the same finger, not animated.
    const rest = w.find('g.inf-rest')
    expect(rest.find('animateMotion').exists()).toBe(false)
    expect(rest.find('animate').exists()).toBe(false)
    expect(rest.find('g[transform]').attributes('transform')).toBe(INFINITY.hand)
    expect(rest.findAll('.hand-fill rect')).toHaveLength(HAND.length)
    // Not the dashed circle the playtest could not read.
    expect(w.find('.stick-rim').exists()).toBe(false)
  })

  it('shows a hold as a standing timer ring, and a tap never does', () => {
    const hold = classes(mount(InputGlyph, { props: { kind: 'finger', mode: 'hold' } }))
    const tap = classes(mount(InputGlyph, { props: { kind: 'finger', mode: 'tap' } }))
    for (const c of ['hold-track', 'hold-arc', 'hold-tick']) {
      expect(hold).toContain(c)
      expect(tap).not.toContain(c)
    }
    expect(hold).toContain('hold-press')
    expect(tap).toContain('ripple')
    expect(hold).not.toContain('ripple')
  })

  it('does the same for the mouse: hold to charge vs click to shoot', () => {
    const hold = classes(mount(InputGlyph, { props: { kind: 'mouse', button: 'left', hold: true } }))
    const click = classes(mount(InputGlyph, { props: { kind: 'mouse', button: 'left', click: true } }))
    for (const c of ['hold-arc', 'hold-tick']) {
      expect(hold).toContain(c)
      expect(click).not.toContain(c)
    }
    expect(click).toContain('ripple')
  })

  it('still draws the old joystick for any caller that asks for it', () => {
    expect(mount(InputGlyph, { props: { kind: 'joystick' } }).find('.stick-knob').exists()).toBe(true)
  })

  it('switches the ∞ to its resting pose under reduced motion, and never animates the standing ring', () => {
    // No CSS engine in jsdom: the contract is read off the stylesheet itself.
    const src = readFileSync(resolve(__dirname, '../../src/components/hud/InputGlyph.vue'), 'utf8').replace(/\r\n/g, '\n')
    const reduced = src.slice(src.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/\.inf-live\s+display: none/)
    expect(reduced).toMatch(/\.inf-rest\s+display: inline/)
    const rule = (sel: string) => src.match(new RegExp(`\\n${sel.replace('.', '\\.')}\\n((?:  .*\\n)+)`))?.[1] ?? ''
    for (const sel of ['.hold-arc', '.hold-edge', '.hold-tick', '.hold-track']) {
      expect(rule(sel), sel).not.toMatch(/animation/)
    }
  })
})

describe('where the coach and the pause menu draw it', () => {
  const phase = hud.phase
  const i18n = () => createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })

  afterEach(() => {
    hud.hints = []
    hud.phase = phase
    device.value = 'touch'
  })

  it('the coach teaches touch "move" with the ∞ finger, pips and all', () => {
    hud.phase = 'play'
    hud.pointerFree = false
    hud.hints = [{ id: 'move', family: 'touch', count: 1, goal: 3, flash: 0, done: false }]
    const w = mount(ControlHints, { global: { plugins: [i18n()] } })
    const hint = w.find('.hint.move.touch')
    expect(hint.exists()).toBe(true)
    expect(hint.find('path.inf-guide').exists()).toBe(true)
    expect(hint.find('.stick-rim').exists()).toBe(false)
    expect(hint.findAll('.pip')).toHaveLength(3)
    expect(hint.findAll('.pip.on')).toHaveLength(1)
    expect(hint.attributes('aria-label')).toBe(en.tips.moveTouch)
  })

  it('the pause legend opens on the same ∞ for touch, and on WASD for keys', () => {
    device.value = 'touch'
    const touch = mount(ControlsPanel, { global: { plugins: [i18n()] } })
    const first = touch.find('.row')
    expect(first.attributes('data-row')).toBe('move')
    expect(first.find('.input.infinity path.inf-guide').exists()).toBe(true)
    // Charge is a hold: its row shows the standing ring, fire's tap does not.
    expect(touch.find('[data-row="charge"] .hold-arc').exists()).toBe(true)
    expect(touch.find('[data-row="fire"] .hold-arc').exists()).toBe(false)

    device.value = 'mouse'
    const keys = mount(ControlsPanel, { global: { plugins: [i18n()] } })
    expect(keys.find('[data-row="move"] .input.wasd').exists()).toBe(true)
    expect(keys.find('[data-row="charge"] .hold-arc').exists()).toBe(true)
  })
})
