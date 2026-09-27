import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createI18n } from 'vue-i18n'
import en from '@/i18n/locales/en'
import ChargeDemo from '@/components/hud/ChargeDemo.vue'
import LessonLayer from '@/components/hud/LessonLayer.vue'
import {
  DEMO_ANCHOR, DEMO_CLIP, DEMO_H, DEMO_ORB, DEMO_PRESS, DEMO_R1, DEMO_RING, DEMO_T, DEMO_W, EMPTY, HAND, MOUSE_BUTTONS,
  MOUSE_MID, DEMO_MOUSE_SCALE, chargeDemo, demoTargetY, onMouseButton, type DemoAnim
} from '@/components/hud/glyphGeometry'
import { CHARGE_L1, CHARGE_L2, PERFECT_DELAY, PERFECT_LEN, baseStats, chargeInfo } from '@/game/sim/stats'
import { hud, tickHud } from '@/game/state/hud'
import type { LessonView } from '@/game/sim/lessons'

/**
 * ─── The charge lesson's demo ───────────────────────────────────────────────
 *
 * A wordless film on the training drone: a finger held on the play area (the
 * left mouse button held on desktop), the crosshair's two rings filling round
 * it in the game's own stage times, the shot growing small → medium → big,
 * let go — it flies into the target and bursts. A wrong try replays a quick
 * tap whose pellet skips off; the player's own hold drives it live.
 *
 * jsdom runs no SMIL, so the film is checked where it lives: in the key
 * times and values bound to its `<animate>` elements.
 */

// The game, reduced to what the HUD reads: one mission whose charge a test sets.
const game = vi.hoisted(() => ({ mission: null as unknown }))
vi.mock('@/game/boot', () => ({ currentMission: () => game.mission, input: { device: 'touch' } }))
// Each mounted demo registers a HUD ticker: none may outlive its test.
enableAutoUnmount(afterEach)

/** A linear SMIL track's value at time t (s). */
const sample = (a: DemoAnim, t: number): number => {
  const ks = a.keyTimes.split(';').map(Number)
  const vs = a.values.split(';').map(Number)
  const f = t / parseFloat(a.dur)
  let i = 0
  while (i < ks.length - 2 && ks[i + 1]! <= f) i++
  if (a.calcMode === 'discrete') return vs[i]!
  const span = ks[i + 1]! - ks[i]!
  const k = span > 0 ? Math.min(1, Math.max(0, (f - ks[i]!) / span)) : 1
  return vs[i]! + (vs[i + 1]! - vs[i]!) * k
}
/** A discrete track's value at time t. */
const at = (a: DemoAnim, t: number): string => {
  const ks = a.keyTimes.split(';').map(Number)
  const vs = a.values.split(';')
  const f = t / parseFloat(a.dur)
  let i = 0
  while (i < ks.length - 1 && ks[i + 1]! <= f) i++
  return vs[i]!
}
/** One component of a translate track ("x y" values): 0 = x, 1 = y. */
const comp = (a: DemoAnim, i: 0 | 1): DemoAnim => ({ ...a, values: a.values.split(';').map(v => v.split(' ')[i]).join(';') })
const T = DEMO_T

describe('the demo\'s film matches the game', () => {
  it('fills the rings in the crosshair\'s stage times and lets go in the PERFECT window', () => {
    expect(T.l1 - T.press).toBeCloseTo(CHARGE_L1, 6)
    expect(T.l2 - T.press).toBeCloseTo(CHARGE_L2, 6)
    expect(T.perfect - T.l2).toBeCloseTo(PERFECT_DELAY, 6)
    const held = T.release - T.press
    const info = chargeInfo(held, baseStats())
    expect(info.level).toBe(2)
    expect(info.perfect).toBe(true)
    expect(held).toBeLessThan(CHARGE_L2 + PERFECT_DELAY + PERFECT_LEN)
    // One loop, press to pause, in 2.5–3 s.
    expect(T.loop).toBeGreaterThanOrEqual(2.5)
    expect(T.loop).toBeLessThanOrEqual(3)
    expect(T.hit + T.burst).toBeLessThan(T.loop - 0.3)
  })

  it.each([['touch', 'up'], ['touch', 'down'], ['mouse', 'up'], ['mouse', 'down']] as const)(
    '%s / %s: every SMIL track is well keyed (0 → 1, never backwards, one value per key)', (device, aim) => {
      const g = chargeDemo(device, aim)
      const tracks = { ...g.loop, ...g.clip }
      for (const [name, a] of Object.entries(tracks)) {
        const ks = a.keyTimes.split(';').map(Number)
        expect(a.values.split(';'), name).toHaveLength(ks.length)
        expect(ks[0], name).toBe(0)
        if (a.calcMode === 'linear') expect(ks.at(-1), name).toBe(1)
        for (let i = 1; i < ks.length; i++) expect(ks[i]!, name).toBeGreaterThanOrEqual(ks[i - 1]!)
        for (const k of ks) expect(k, name).toBeLessThanOrEqual(1)
      }
      for (const a of Object.values(g.loop)) expect(a.dur).toBe(`${T.loop}s`)
      for (const a of Object.values(g.clip)) expect(a.dur).toBe(`${DEMO_CLIP.dur}s`)
    })

  it('press: the finger comes down and stays down until the release; a dimple and a ripple under it', () => {
    const L = chargeDemo('touch', 'up').loop
    const lift = (t: number) => sample(comp(L.finger, 1), t)
    // Hovering over the glass, then down on it until the release, then up.
    expect(lift(0)).toBeLessThan(-5)
    for (const t of [T.press + 0.01, T.l1, T.l2, T.release - 0.01]) expect(Math.abs(lift(t)), `t ${t}`).toBeLessThan(0.5)
    expect(lift(T.release + 0.2)).toBeLessThan(-5)
    expect(sample(L.dimple, T.press + 0.3)).toBeGreaterThan(8)
    expect(sample(L.dimple, T.release + 0.2)).toBe(0)
    expect(sample(L.rippleO, T.press + 0.02)).toBeGreaterThan(0.8)
    expect(sample(L.rippleR, T.press + 0.3)).toBeGreaterThan(sample(L.rippleR, T.press + 0.02))
    // Desktop: the button sinks and stays sunk.
    const M = chargeDemo('mouse', 'up').loop
    const sink = (t: number) => sample(comp(M.button, 1), t)
    expect(sink(0.05)).toBe(0)
    for (const t of [T.press + 0.02, T.l1, T.l2, T.release - 0.01]) expect(sink(t)).toBeCloseTo(3, 5)
    expect(sink(T.release + 0.2)).toBe(0)
  })

  it('ring stage 1 then stage 2, in the crosshair\'s colours, flicker and gold at full', () => {
    const L = chargeDemo('touch', 'up').loop
    // Before the press both rings are empty (past 100: no round-cap dot).
    expect(sample(L.l1, 0.1)).toBe(EMPTY)
    // Stage 1: the inner ring fills, the outer waits.
    expect(sample(L.l1, T.press + CHARGE_L1 / 2)).toBeCloseTo(EMPTY / 2, 0)
    expect(sample(L.l2, T.press + CHARGE_L1 / 2)).toBe(EMPTY)
    expect(sample(L.l1, T.l1)).toBeCloseTo(0, 1)
    // Stage 2: the outer ring fills while the inner stays full.
    expect(sample(L.l2, (T.l1 + T.l2) / 2)).toBeCloseTo(EMPTY / 2, 0)
    expect(sample(L.l1, (T.l1 + T.l2) / 2)).toBe(0)
    expect(sample(L.l2, T.l2)).toBeCloseTo(0, 1)
    // Colours: green inner, cyan outer; full flickers white / blue; PERFECT gold.
    expect(at(L.l1Color, T.l1)).toBe(DEMO_RING.l1)
    expect(at(L.l2Color, (T.l1 + T.l2) / 2)).toBe(DEMO_RING.l2)
    expect(at(L.l2Color, T.l2 + 0.01)).toBe(DEMO_RING.full)
    expect(at(L.l2Color, T.l2 + 0.06)).toBe(DEMO_RING.full2)
    expect(at(L.l2Color, T.perfect + 0.01)).toBe(DEMO_RING.perfect)
    expect(at(L.l1Color, T.perfect + 0.01)).toBe(DEMO_RING.perfect)
    // Gone at the release, reset for the next take.
    expect(sample(L.ringO, T.release + 0.3)).toBe(0)
    expect(sample(L.l1, T.loop - 0.01)).toBe(EMPTY)
  })

  it('the glow grows stronger at each stage', () => {
    const L = chargeDemo('touch', 'up').loop
    const o = (t: number) => sample(L.glowO, t)
    const r = (t: number) => sample(L.glowR, t)
    expect(o(0.1)).toBe(0)
    expect(o(T.l1 + 0.2)).toBeGreaterThan(o(T.l1 - 0.2))
    expect(o(T.l2 + 0.03)).toBeGreaterThan(o(T.l1 + 0.2))
    expect(o(T.release)).toBeGreaterThanOrEqual(0.9)
    expect(r(T.l2 + 0.1)).toBeGreaterThan(r(T.l1 + 0.1))
    expect(r(T.l1 + 0.1)).toBeGreaterThan(r(T.press + 0.2))
    expect(o(T.release + 0.3)).toBe(0)
  })

  it('the shot: small, then medium at level 1, then big with its halo at full — as the real shots look', () => {
    const L = chargeDemo('touch', 'up').loop
    const [c0, c1, c2] = DEMO_ORB.core
    const core = (t: number) => sample(L.core, t)
    expect(core(0.1)).toBe(0)
    expect(core(T.press + 0.3)).toBeGreaterThanOrEqual(c0)
    expect(core(T.press + 0.3)).toBeLessThan(c1)
    expect(core(T.l1 + 0.2)).toBeCloseTo(c1, 0)
    expect(core(T.l2 + 0.13)).toBeCloseTo(c2, 0)
    expect(sample(L.halo, T.l2 + 0.13)).toBeGreaterThan(sample(L.halo, T.l1 + 0.2))
    // Sizes keep the ratios of the real shots (combat.ts: r 0.085 / 0.15 / 0.24).
    expect(c1 / c0).toBeCloseTo(0.15 / 0.085, 0)
    expect(c2 / c0).toBeCloseTo(0.24 / 0.085, 0)
    expect(at(L.coreColor, T.press + 0.2)).toBe('#fff6b0')
    expect(at(L.coreColor, T.l1 + 0.1)).toBe('#eaffb0')
    expect(at(L.coreColor, T.l2 + 0.05)).toBe('#e6fbff')
  })

  it.each(['up', 'down'] as const)('release (%s): the big shot flies into the target, and bursts there', (aim) => {
    const g = chargeDemo('touch', aim)
    const L = g.loop
    const dy = (t: number) => sample(comp(L.fly, 1), t)
    expect(dy(T.release)).toBe(0)
    expect(dy(T.hit)).toBeCloseTo(demoTargetY('touch', aim) - DEMO_ORB.y, 1)
    // Up to the drone above the card, down to the crate below it.
    if (aim === 'up') expect(g.target.y).toBeLessThan(0)
    else expect(g.target.y).toBeGreaterThan(DEMO_H.touch)
    expect(g.target.x).toBe(DEMO_ORB.x)
    expect(sample(L.core, T.hit - 0.01)).toBeCloseTo(DEMO_ORB.core[2], 5)
    expect(sample(L.core, T.hit + 0.05)).toBe(0)
    expect(sample(L.flashO, T.hit + 0.02)).toBeGreaterThan(0.8)
    expect(sample(L.burstR, T.hit + 0.3)).toBeGreaterThan(sample(L.burstR, T.hit + 0.02))
    expect(sample(L.streakO, (T.release + T.hit) / 2)).toBeGreaterThan(0.5)
  })

  it('the quick tap: a short press, and a small pellet that skips off the target', () => {
    const C = chargeDemo('touch', 'up').clip
    const dy = (t: number) => sample(comp(C.pellet, 1), t)
    const dx = (t: number) => sample(comp(C.pellet, 0), t)
    expect(dy(DEMO_CLIP.bounce)).toBeCloseTo(demoTargetY('touch', 'up') - DEMO_ORB.y, 1)
    // …and comes back off it, sideways.
    expect(dy(DEMO_CLIP.fade)).toBeGreaterThan(dy(DEMO_CLIP.bounce))
    expect(dx(DEMO_CLIP.fade)).toBeGreaterThan(0)
    expect(sample(C.rimO, DEMO_CLIP.bounce + 0.01)).toBeGreaterThan(0.8)
    expect(sample(C.pelletO, DEMO_CLIP.dur - 0.1)).toBe(0)
    // The tap is short: down at `tap`, up by `lift`.
    expect(DEMO_CLIP.lift - DEMO_CLIP.tap).toBeLessThan(0.15)
  })
})

describe('ChargeDemo on screen', () => {
  afterEach(() => { game.mission = null })

  it('touch: a finger on the play area, a dimple and ripple at the fingertip, the rings round it, the shot beside', () => {
    const w = mount(ChargeDemo, { props: { device: 'touch' } })
    const loop = w.find('svg.cd-loop')
    expect(loop.attributes('viewBox')).toBe(`0 0 ${DEMO_W} ${DEMO_H.touch}`)
    expect(loop.findAll('.hand-fill rect')).toHaveLength(HAND.length)
    for (const sel of ['circle.cd-dimple', 'circle.cd-ripple']) {
      const c = loop.find(sel)
      expect([Number(c.attributes('cx')), Number(c.attributes('cy'))], sel).toEqual([DEMO_PRESS.x, DEMO_PRESS.y])
    }
    // No mouse, and no invented fire button.
    expect(loop.find('.body').exists()).toBe(false)
    // SMIL runs only on SVG-namespaced elements, with their camelCase attributes.
    const l1 = loop.find('path.cd-l1')
    const fill = l1.findAll('animate').find(a => a.attributes('attributeName') === 'stroke-dashoffset')!
    expect(fill.element.namespaceURI).toBe('http://www.w3.org/2000/svg')
    const g = chargeDemo('touch', 'up')
    expect(fill.attributes('keyTimes')).toBe(g.loop.l1.keyTimes)
    expect(fill.attributes('values')).toBe(g.loop.l1.values)
    expect(fill.attributes('repeatCount')).toBe('indefinite')
    expect(loop.find('path.cd-l2').attributes('d')).toBe(g.ring2)
    // The track sits at the inner ring's radius, round the press point, and
    // outside the fading ring group: every frame of the film shows a timer ring.
    expect(Number(loop.find('circle.cd-track').attributes('r'))).toBe(DEMO_R1)
    expect(loop.find('g.cd-ring circle.cd-track').exists()).toBe(false)
    // The shot, its streak, its burst.
    for (const sel of ['circle.cd-core', 'circle.cd-halo', 'path.cd-streak', 'circle.cd-burst', 'path.cd-sparks']) {
      expect(loop.find(sel).exists(), sel).toBe(true)
    }
    expect(loop.find('g.cd-shot animateTransform').attributes('values')).toBe(g.loop.fly.values)
  })

  it('desktop: the mouse with its LEFT button sinking, the ripple from that button\'s centre', () => {
    const w = mount(ChargeDemo, { props: { device: 'mouse' } })
    const loop = w.find('svg.cd-loop')
    expect(loop.attributes('viewBox')).toBe(`0 0 ${DEMO_W} ${DEMO_H.mouse}`)
    expect(loop.find('.hand-fill').exists()).toBe(false)
    expect(loop.find('path.hot').attributes('d')).toBe(MOUSE_BUTTONS.left.d)
    expect(loop.find('path.btn').attributes('d')).toBe(MOUSE_BUTTONS.right.d)
    expect(loop.find('path.hot animateTransform').attributes('values')).toBe(chargeDemo('mouse', 'up').loop.button.values)
    // The ripple, back in the mouse's own box, is on the left face.
    const c = loop.find('circle.cd-ripple')
    const mx = (Number(c.attributes('cx')) - DEMO_PRESS.x) / DEMO_MOUSE_SCALE + MOUSE_MID.x
    const my = (Number(c.attributes('cy')) - DEMO_PRESS.y) / DEMO_MOUSE_SCALE + MOUSE_MID.y
    expect(onMouseButton('left', mx, my)).toBe(true)
    expect(onMouseButton('right', mx, my)).toBe(false)
  })

  it('the edge bubble\'s cut keeps the input and its rings, not the shot', () => {
    const w = mount(ChargeDemo, { props: { device: 'touch', compact: true } })
    const loop = w.find('svg.cd-loop')
    expect(loop.attributes('viewBox')).toBe(chargeDemo('touch', 'up').compactViewBox)
    expect(loop.find('path.cd-l1').exists()).toBe(true)
    expect(loop.find('.hand-fill').exists()).toBe(true)
    for (const sel of ['.cd-core', '.cd-streak', '.cd-burst']) expect(w.find(sel).exists(), sel).toBe(false)
  })

  it('a clip key swaps the film for the quick tap, played once, and back', async () => {
    const w = mount(ChargeDemo, { props: { device: 'touch', clip: 0 } })
    expect(w.find('svg.cd-clip').exists()).toBe(false)
    await w.setProps({ clip: 1 })
    const clip = w.find('svg.cd-clip')
    expect(clip.exists()).toBe(true)
    expect(w.find('svg.cd-loop').exists()).toBe(false)
    // Played once and held: no repeat, frozen at the end.
    for (const a of clip.findAll('animate, animateTransform')) {
      expect(a.attributes('repeatCount')).toBeUndefined()
      expect(a.attributes('fill')).toBe('freeze')
    }
    // A small pellet (the quick shot's size), the target's skin flaring.
    expect(Number(clip.find('.cd-pellet circle.cd-core').attributes('r'))).toBe(DEMO_ORB.core[0])
    expect(clip.find('path.cd-rim').attributes('d')).toBe(chargeDemo('touch', 'up').rim)
    // The ring stays empty: nothing charged.
    expect(clip.find('.cd-l1').exists()).toBe(false)
    await w.setProps({ clip: 0 })
    expect(w.find('svg.cd-loop').exists()).toBe(true)
  })

  it('live: while the player really holds fire, the still follows that charge; letting go resumes the film', () => {
    const combat = { charging: false, charge: 0 }
    game.mission = { combat, stats: baseStats() }
    const w = mount(ChargeDemo, { props: { device: 'touch' }, attachTo: document.body })
    const root = w.find('.charge-demo').element as HTMLElement
    const still = w.find('svg.cd-still').element as SVGSVGElement
    tickHud(0.016)
    expect(root.classList.contains('live')).toBe(false)
    // A tap too short for the crosshair's ring does not take over.
    combat.charging = true
    combat.charge = 0.03
    tickHud(0.016)
    expect(root.classList.contains('live')).toBe(false)
    // Half way to level 1.
    combat.charge = CHARGE_L1 / 2
    tickHud(0.016)
    expect(root.classList.contains('live')).toBe(true)
    expect(Number(still.style.getPropertyValue('--l1'))).toBeCloseTo(EMPTY / 2, 3)
    expect(Number(still.style.getPropertyValue('--l2'))).toBeCloseTo(EMPTY, 3)
    expect(still.dataset.state).toBe('s0')
    const small = Number(still.style.getPropertyValue('--orb'))
    // Level 1 and a bit: inner full, outer filling, the shot medium.
    combat.charge = (CHARGE_L1 + CHARGE_L2) / 2
    tickHud(0.016)
    expect(Number(still.style.getPropertyValue('--l1'))).toBe(0)
    expect(Number(still.style.getPropertyValue('--l2'))).toBeCloseTo(EMPTY / 2, 3)
    expect(still.dataset.state).toBe('s1')
    const medium = Number(still.style.getPropertyValue('--orb'))
    expect(medium).toBeGreaterThan(small)
    // Inside the PERFECT window: gold, and the shot at full size.
    combat.charge = CHARGE_L2 + PERFECT_DELAY + PERFECT_LEN / 2
    tickHud(0.016)
    expect(still.dataset.state).toBe('perfect')
    expect(Number(still.style.getPropertyValue('--orb'))).toBe(1)
    expect(Number(still.style.getPropertyValue('--glow'))).toBeGreaterThan(0.9)
    // Let go: back to the film, the still's own pose restored.
    combat.charging = false
    tickHud(0.016)
    expect(root.classList.contains('live')).toBe(false)
    expect(still.style.getPropertyValue('--l1')).toBe('')
    expect(still.dataset.state).toBe('rest')
  })

  it('reduced motion: the still pose — pressed, rings well on, a big shot aimed at the target — breathing slowly', () => {
    const w = mount(ChargeDemo, { props: { device: 'touch' } })
    const still = w.find('svg.cd-still')
    // Still: nothing in it is SMIL-animated.
    expect(still.findAll('animate, animateTransform')).toHaveLength(0)
    expect(still.find('circle.cd-dimple').exists()).toBe(true)
    expect(still.find('.hand-fill').exists()).toBe(true)
    expect(still.find('path.cd-trail').attributes('d')).toBe(chargeDemo('touch', 'up').flight)
    expect(Number(still.find('circle.cd-core').attributes('r'))).toBe(DEMO_ORB.core[2])
    // The mouse's still has its button pushed in.
    const m = mount(ChargeDemo, { props: { device: 'mouse' } }).find('svg.cd-still path.hot')
    expect(m.classes()).toContain('down')
    expect(m.attributes('transform')).toBe('translate(0 3)')
    // The stylesheet: the film and the clip hide, the still shows; its rest
    // pose has the inner ring full and the outer three quarters; only light moves.
    const src = readFileSync(resolve(__dirname, '../../src/components/hud/ChargeDemo.vue'), 'utf8').replace(/\r\n/g, '\n')
    const reduced = src.slice(src.indexOf('@media (prefers-reduced-motion: reduce)'))
    expect(reduced).toMatch(/\.cd-loop, \.cd-clip\n\s+display: none/)
    expect(reduced).toMatch(/\.cd-still\n\s+display: block/)
    expect(reduced).toMatch(/animation: cd-breathe 3\.2s/)
    expect(src).toMatch(/--l1: 0\n\s+--l2: 25\n/)
    const breathe = src.match(/@keyframes cd-breathe\n((?:  .*\n)+)/)?.[1] ?? ''
    expect(breathe).toMatch(/opacity/)
    expect(breathe).not.toMatch(/transform/)
  })
})

// ─── On the lesson card ─────────────────────────────────────────────────────

const view = (over: Partial<LessonView> = {}): LessonView => ({ id: 'charge', nudge: 0, done: false, slot: 1, color: '#ffffff', ...over })
const i18n = () => createI18n({ legacy: false, locale: 'en', fallbackLocale: 'en', messages: { en } })

describe('LessonLayer: the charge and crate lessons show the demo', () => {
  const saved = { phase: hud.phase, device: hud.device, pointerFree: hud.pointerFree }
  beforeEach(() => {
    hud.phase = 'play'
    hud.pointerFree = false
    hud.device = 'touch'
  })
  afterEach(() => {
    hud.lesson = null
    Object.assign(hud, saved)
    game.mission = null
    vi.useRealTimers()
  })
  const layer = () => mount(LessonLayer, { global: { plugins: [i18n()] }, attachTo: document.body })

  it('the drone: the demo on the card (aimed up), its cut in the edge bubble, the sentence for screen readers', () => {
    hud.lesson = view()
    const w = layer()
    const card = w.find('.card')
    expect(card.find('.demo-box .charge-demo.touch.up').exists()).toBe(true)
    expect(card.find('.charge-demo:not(.compact)').exists()).toBe(true)
    expect(w.find('.edge .charge-demo.compact').exists()).toBe(true)
    expect(card.attributes('aria-label')).toBe(en.lesson.charge)
    // The old static glyph and its bolt are gone.
    expect(card.find('.hold-arc').exists()).toBe(false)
    expect(card.find('.act').exists()).toBe(false)
  })

  it('desktop shows the mouse demo; the crate aims the shot down; other lessons keep their glyphs', () => {
    hud.device = 'mouse'
    hud.lesson = view()
    const w = layer()
    expect(w.find('.card .charge-demo.mouse').exists()).toBe(true)
    expect(w.find('.card .charge-demo path.hot').attributes('d')).toBe(MOUSE_BUTTONS.left.d)
    hud.lesson = view({ id: 'crate' })
    const c = layer()
    expect(c.find('.card .charge-demo.down').exists()).toBe(true)
    expect(c.find('.card').attributes('aria-label')).toBe(en.lesson.crate)
    hud.lesson = view({ id: 'weapon' })
    const k = layer()
    expect(k.find('.charge-demo').exists()).toBe(false)
    expect(k.find('.card svg.glyph').exists()).toBe(true)
  })

  it('a wrong try: the card replays a quick tap, shakes and slashes as the pellet bounces, then the film again', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    hud.lesson = view()
    const w = layer()
    expect(w.find('.cd-clip').exists()).toBe(false)
    hud.lesson = view({ nudge: 1 })
    await nextTick()
    vi.advanceTimersByTime(20)
    await nextTick()
    expect(w.find('.card').classes()).toContain('nudge')
    expect(w.find('.demo-box .no').exists()).toBe(true)
    expect(w.find('.card .cd-clip').exists()).toBe(true)
    expect(w.find('.card .cd-loop').exists()).toBe(false)
    // The shake and slash wait for the bounce.
    expect(w.find('.demo-box').attributes('style')).toContain(`--bounce: ${DEMO_CLIP.bounce}s`)
    const src = readFileSync(resolve(__dirname, '../../src/components/hud/LessonLayer.vue'), 'utf8').replace(/\r\n/g, '\n')
    expect(src).toMatch(/\.nudge \.glyph-box\.demo-box\n\s+animation: nudge-shake 0\.45s ease-in-out var\(--bounce, 0s\)/)
    expect(src).toMatch(/\.demo-box \.no\n\s+opacity: 0\n\s+animation-delay: var\(--bounce, 0s\)/)
    // A second try replays it from the top (a new key).
    const first = w.find('.card .cd-clip').element
    hud.lesson = view({ nudge: 2 })
    await nextTick()
    vi.advanceTimersByTime(20)
    await nextTick()
    expect(w.find('.card .cd-clip').element).not.toBe(first)
    // The clip ends: the film is back and the shake is over.
    vi.advanceTimersByTime(DEMO_CLIP.dur * 1000 + 50)
    await nextTick()
    expect(w.find('.card .cd-clip').exists()).toBe(false)
    expect(w.find('.card .cd-loop').exists()).toBe(true)
    expect(w.find('.card').classes()).not.toContain('nudge')
  })

  it('sizes the demo to read at a glance: its rings ~24 vmin on a phone, ~126 px on a 1280 × 720 desktop', () => {
    const src = readFileSync(resolve(__dirname, '../../src/components/hud/LessonLayer.vue'), 'utf8').replace(/\r\n/g, '\n')
    const touchW = src.match(/\n\.glyph-box\.demo-box\n(?: {2}.*\n)*? {2}width: clamp\((\d+)px, ([\d.]+)vmin, (\d+)px\)/)
    const mouseW = src.match(/\n\.mouse \.glyph-box\.demo-box\n(?: {2}.*\n)*? {2}width: clamp\((\d+)px, ([\d.]+)vmin, (\d+)px\)/)
    expect(touchW && mouseW).toBeTruthy()
    const clampW = (m: RegExpMatchArray, vmin: number) => Math.min(Number(m[3]), Math.max(Number(m[1]), (Number(m[2]) * vmin) / 100))
    // The rings' outer edge (r2 41 + its navy edge) across the 156-unit box.
    const ring = (width: number) => (2 * (41 + 4.5) * width) / DEMO_W
    for (const vmin of [360, 412]) {
      const r = ring(clampW(touchW!, vmin))
      expect((r / vmin) * 100, `phone ${vmin}`).toBeGreaterThanOrEqual(22)
      expect((r / vmin) * 100, `phone ${vmin}`).toBeLessThanOrEqual(26)
    }
    const desk = ring(clampW(mouseW!, 720))
    expect(desk).toBeGreaterThanOrEqual(110)
    expect(desk).toBeLessThanOrEqual(140)
    // The edge bubble stays small.
    expect(src).toMatch(/\n\.edge\n(?: {2}.*\n)*? {2}width: clamp\(62px, 12vmin, 84px\)/)
  })

  it('learned: the check pops and the demo goes', () => {
    hud.lesson = view({ done: true })
    const w = layer()
    expect(w.find('.card .check').exists()).toBe(true)
    expect(w.find('.card .charge-demo').exists()).toBe(false)
  })

  it('pins the shot\'s column under the drone\'s bubble, never over the drone, and keeps the card on screen', async () => {
    // A camera that maps world metres straight to pixels: x → 400 + 100x,
    // y → 300 − 100y (jsdom's window is 1024 × 768); the drone 5 m ahead,
    // its bubble 0.8 round.
    const drone = { x: 0, y: 1.8 }
    game.mission = {
      camera: { fov: 60, aspect: 1024 / 768 },
      player: { x: 0, z: 0, yaw: 0 },
      combat: { charging: false, charge: 0 },
      stats: baseStats(),
      lessonAnchors: (out: Float32Array) => { out[0] = drone.x; out[1] = drone.y; out[2] = -5; return 1 },
      lessonInRoom: () => true,
      project: (x: number, y: number, _z: number, o: { x: number; y: number; visible: boolean }) => {
        o.x = Math.round(400 + 100 * x)
        o.y = Math.round(300 - 100 * y)
        o.visible = true
      }
    }
    hud.lesson = view()
    const w = layer()
    const card = w.find('.card').element as HTMLElement
    // jsdom lays nothing out: the card's box is given (no ResizeObserver here,
    // so the layer reads it off the card).
    const size = { w: 200, h: 128 }
    Object.defineProperty(card, 'offsetWidth', { get: () => size.w })
    Object.defineProperty(card, 'offsetHeight', { get: () => size.h })
    const pos = () => card.style.transform.match(/translate3d\(([-\d.]+)px, ([-\d.]+)px/)!.slice(1).map(Number) as [number, number]
    tickHud(0.016)
    // The bubble's lowest point is at y 300 − 100 · (1.8 − 0.8) = 200: the card
    // starts 6 px under it, its shot column (DEMO_ANCHOR of its width) on the drone.
    let [x, y] = pos()
    expect(x).toBeCloseTo(400 - 200 * DEMO_ANCHOR, 3)
    expect(y).toBe(206)
    expect(card.style.opacity).toBe('1')
    expect(w.find('.card .charge-demo').classes()).toContain('up')
    // A drone near the left edge: the card stays on screen, 8 px in…
    drone.x = -3.4
    tickHud(0.016)
    ;[x] = pos()
    expect(x).toBe(8)
    // …and near the right edge.
    drone.x = 6.2
    tickHud(0.016)
    ;[x] = pos()
    expect(x).toBeLessThanOrEqual(1024 - 8 - 200)
    drone.x = 0
    // No room under a close drone: the card goes over its bubble and the
    // demo's shot flies DOWN into it.
    size.h = 250
    drone.y = -2
    tickHud(0.016)
    await nextTick()
    ;[, y] = pos()
    // Bubble top at 300 + 200 − 80 = 420; the card ends 15 % of its height above it.
    expect(y).toBeCloseTo(420 - 250 * 1.15, 3)
    expect(y + 250).toBeLessThan(420)
    expect(w.find('.card .charge-demo').classes()).toContain('down')
    // Room below again: back under it, the shot flying up.
    drone.y = 1.8
    tickHud(0.016)
    await nextTick()
    ;[, y] = pos()
    expect(y).toBe(206)
    expect(w.find('.card .charge-demo').classes()).toContain('up')
    // The crate (on the floor, its top at y 400): the card over it, the shot
    // column on it…
    size.h = 128
    drone.y = -1
    hud.lesson = view({ id: 'crate' })
    await nextTick()
    tickHud(0.016)
    ;[x, y] = pos()
    expect(x).toBeCloseTo(400 - 200 * DEMO_ANCHOR, 3)
    expect(y).toBeCloseTo(400 - 128 * 1.15, 3)
    expect(w.find('.card .charge-demo').classes()).toContain('down')
    // …and never off the top of the screen.
    drone.y = 2
    tickHud(0.016)
    ;[, y] = pos()
    expect(y).toBe(8)
  })
})
