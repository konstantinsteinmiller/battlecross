import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { HUD_FULL_VMIN, HUD_MIN_SCALE, HUD_MIN_FONT_PX, HUD_SMALL_VMIN, HUD_TAP_PX, HUD_TAP_SMALL_PX, hudScale } from '@/use/useHudScale'

const REM = 16
/** `clamp(min rem, N vmin, max rem)` at a viewport, in css px, times the HUD scale (what the stylesheet computes). */
const fluid = (minRem: number, vmin: number, maxRem: number, w: number, h: number): number => {
  const base = Math.min(Math.max(minRem * REM, (vmin / 100) * Math.min(w, h)), maxRem * REM)
  return base * hudScale(w, h)
}
const SMALL: Array<[number, number]> = [[590, 335], [568, 320], [640, 360], [667, 375]]
const NORMAL: Array<[number, number]> = [[390, 844], [844, 390], [932, 430], [1024, 768], [1366, 768], [1920, 1080]]

describe('the HUD scale token', () => {
  it('is 1 on a normal phone, a tablet and a desktop: nothing there changes', () => {
    for (const [w, h] of NORMAL) expect(hudScale(w, h)).toBe(1)
  })
  it('falls to its floor on a very small viewport, in a straight line', () => {
    expect(hudScale(590, 335)).toBeCloseTo(HUD_MIN_SCALE, 5)
    expect(hudScale(568, 320)).toBe(HUD_MIN_SCALE)
    expect(hudScale(320, 658)).toBe(HUD_MIN_SCALE)
    let last = 0
    for (let v = 300; v <= 420; v += 5) {
      const s = hudScale(900, v)
      expect(s).toBeGreaterThanOrEqual(last)
      last = s
    }
    expect(hudScale(900, (HUD_FULL_VMIN + HUD_SMALL_VMIN) / 2)).toBeCloseTo((1 + HUD_MIN_SCALE) / 2, 5)
  })
  it('makes the play buttons at least 30 % smaller on a 590 x 335 screen than the old fixed floors', () => {
    // Old sizes: the 2.9 rem floor of the skill / menu buttons (46 px at 335).
    const before = Math.max(2.9 * REM, 0.145 * 335)
    const after = Math.max(HUD_TAP_PX, fluid(2.9, 14.5, 4.9, 590, 335))
    expect(after).toBeLessThanOrEqual(before * 0.8)
    // The joystick: 5.6 rem floor before, a 64 px picture now.
    expect(Math.max(64, fluid(5.6, 30, 8.4, 590, 335))).toBeLessThanOrEqual(Math.max(5.6 * REM, 0.3 * 335) * 0.75)
  })
  it('never lets a primary tap target fall under the floor, at any size', () => {
    for (const [w, h] of [...SMALL, ...NORMAL, [320, 568] as [number, number]]) {
      expect(Math.max(HUD_TAP_PX, fluid(2.9, 14.5, 4.9, w, h))).toBeGreaterThanOrEqual(HUD_TAP_PX)
    }
  })
})

const HUD_FILES = ['hud/GameHud', 'hud/SkillBar', 'hud/MenuButtons', 'hud/HudMenu', 'hud/HeroFrame', 'hud/GoalTracker', 'hud/TopStatus', 'hud/ZoneBadge', 'hud/TouchStick', 'hud/LeaveButton', 'hud/NudgeLayer', 'hud/CoachLayer', 'onboarding/LessonLayer']
const src = (f: string): string => readFileSync(`src/components/${f}.vue`, 'utf8')

describe('the HUD stylesheets use the token', () => {
  it('scales every size-like clamp() by --hud-s', () => {
    for (const f of HUD_FILES) {
      const bad = src(f).split('\n').filter(l => /^\s*(--[\w-]+|width|height|min-height|min-width|font-size|gap|top|bottom|left|right):.*clamp\(/.test(l) && !/calc\(clamp\([^()]*\) \* var\(--hud-s, 1\)\)/.test(l))
      expect(bad, f).toEqual([])
    }
  })
  it('keeps the tap floors: 36 px for the play buttons, 30 px pictures with a halo for the corner chips', () => {
    expect(src('hud/SkillBar')).toMatch(/--btn: max\(36px, calc\(clamp\(2\.9rem/)
    expect(src('hud/MenuButtons')).toMatch(/width: max\(36px, calc\(clamp\(2\.9rem/)
    const menu = src('hud/HudMenu')
    expect(menu).toMatch(/width: max\(30px, calc\(/)
    expect(menu).toMatch(/inset: -3px/)
    expect(menu).toMatch(/gap: max\(6px, /)
    expect(HUD_TAP_SMALL_PX).toBe(28)
  })
  it('keeps text at 10 px or more', () => {
    for (const f of HUD_FILES) {
      for (const l of src(f).split('\n')) if (/^\s*font-size:.*hud-s/.test(l)) expect(l, f).toContain(`max(${HUD_MIN_FONT_PX}px, `)
    }
  })
})
