import { describe, expect, it } from 'vitest'
import { MIMIC_PAY, countTaskDeeds, mimicTask, postTasks, taskGold } from '@/game/townTasks'

/** #225: once the hero has met a mimic, a board may ask for 2 or 3 of them, anywhere, for a big purse. */
describe('the mimic hunt on the notice board', () => {
  it('is posted only after a mimic was met, on about half the days', () => {
    let withIt = 0
    for (let d = 0; d < 40; d++) {
      const day = `2026-01-${d}`
      expect(postTasks('sunford', day, ['plains', 'hollows'], false, false).some(t => t.enemy === 'mimic')).toBe(false)
      if (postTasks('sunford', day, ['plains', 'hollows'], false, true).some(t => t.enemy === 'mimic')) withIt++
    }
    expect(withIt).toBeGreaterThan(8)
    expect(withIt).toBeLessThan(32)
  })
  it('asks for two or three, counts a mimic killed in any zone, and pays four times a hunt', () => {
    const t = mimicTask('sunford', 'x')
    expect([2, 3]).toContain(t.n)
    expect(t.zone).toBe('')
    countTaskDeeds([t], { zone: 'plains', kills: { mimic: 1 } })
    countTaskDeeds([t], { zone: 'woods', kills: { mimic: 5 } })
    expect(t.have).toBe(t.n)
    expect(MIMIC_PAY * taskGold(5)).toBeGreaterThan(taskGold(5) * 3)
  })
})
