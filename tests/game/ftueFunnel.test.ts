import { beforeEach, describe, expect, it } from 'vitest'
import { __resetAnalytics, analyticsLog, trackFtue } from '@/use/useAnalytics'

/** The first visit's funnel (#178): each step is sent once, in order, with its seconds. */
describe('trackFtue', () => {
  beforeEach(() => __resetAnalytics())

  it('sends each step once, however often it is reached', () => {
    trackFtue('boss_seen', { at: 80 })
    trackFtue('boss_seen', { at: 95 })
    trackFtue('boss_down', { at: 120 })
    trackFtue('finale_open', { at: 126 })
    trackFtue('finale_open', { at: 127 })
    const steps = analyticsLog().filter(r => r.event === 'ftue_step').map(r => r.props.step)
    expect(steps).toEqual(['boss_seen', 'boss_down', 'finale_open'])
    expect(analyticsLog()[0]!.props.at).toBe(80)
  })
})
