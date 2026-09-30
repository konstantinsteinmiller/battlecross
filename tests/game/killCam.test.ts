import { describe, expect, it } from 'vitest'
import { wantsKillCam, KILLCAM_CHANCE, type KillCamCheck } from '@/game/sim/killCam'
import { FreezeDirector, SKIP_PRESSES, type FreezeSpec } from '@/game/sim/freezeCam'

const ok = (o: Partial<KillCamCheck> = {}): KillCamCheck => ({
  enabled: true, tutorial: false, boss: false, mini: false, kind: 'roller', seen: new Set(),
  sliding: false, airborne: false, hazardNear: false, alertNear: false, busy: false, roll: 0, ...o
})

describe('kill-cam rules', () => {
  it('fires on a lucky roll of an ordinary kill', () => {
    expect(wantsKillCam(ok())).toBe(true)
    expect(wantsKillCam(ok({ roll: KILLCAM_CHANCE + 0.01 }))).toBe(false)
  })
  it('never on bosses, mini-bosses or in the tutorial', () => {
    expect(wantsKillCam(ok({ boss: true }))).toBe(false)
    expect(wantsKillCam(ok({ mini: true }))).toBe(false)
    expect(wantsKillCam(ok({ tutorial: true }))).toBe(false)
  })
  it('never while Flux is in a hurry', () => {
    for (const k of ['sliding', 'airborne', 'hazardNear', 'alertNear', 'busy'] as const) {
      expect(wantsKillCam(ok({ [k]: true }))).toBe(false)
    }
  })
  it('once per kind per mission, and never when switched off', () => {
    expect(wantsKillCam(ok({ seen: new Set(['roller']) }))).toBe(false)
    expect(wantsKillCam(ok({ seen: new Set(['heli']) }))).toBe(true)
    expect(wantsKillCam(ok({ enabled: false }))).toBe(false)
  })
})

const spec = (o: Partial<FreezeSpec> = {}): FreezeSpec => ({
  kind: 'kill', dur: 2, frame: 'shoulder', hx: 0, hy: 0, hz: 0, hyaw: 0, tx: 0, ty: 1, tz: -5, skippable: true, fx: '', ...o
})

describe('freeze director', () => {
  it('ends on time', () => {
    const d = new FreezeDirector()
    d.start(spec())
    expect(d.update(1, false)).toBeNull()
    expect(d.update(1.01, false)).toBe('kill')
    expect(d.active).toBe(false)
  })
  it('a skippable shot ends on the second press, never the first', () => {
    const d = new FreezeDirector()
    d.start(spec())
    expect(d.update(0.1, true)).toBeNull()
    expect(SKIP_PRESSES).toBe(2)
    expect(d.update(0.1, true)).toBe('kill')
  })
  it('an unskippable one ignores presses; a held one waits for end()', () => {
    const d = new FreezeDirector()
    d.start(spec({ skippable: false, dur: Infinity, frame: 'fp', kind: 'lesson' }))
    for (let i = 0; i < 20; i++) expect(d.update(1, true)).toBeNull()
    expect(d.frame(null, 0.016)).toBeNull()
    expect(d.end()).toBe('lesson')
  })
  it('the shoulder shot sits behind Flux, away from the subject, and looks toward it', () => {
    const d = new FreezeDirector()
    d.start(spec())
    const v = d.frame(null, 0.016)!
    expect(v.z).toBeGreaterThan(0)
    expect(v.tz).toBeLessThan(0)
  })
})
