import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { BASH_SKILL } from '@/game/coach/tutorialAid'
import { SKILL_BY_ID } from '@/game/data/skills'

/**
 * The shield-bash lesson (roadmap #216): on the tutorial level the first telegraphed blow of a foe within reach stops the
 * world, lights the stun skill's button and says to stun the attack with it, until the hero casts it.
 */
const src = (p: string): string => readFileSync(resolve(__dirname, '../../src', p), 'utf8')

describe('the shield-bash lesson', () => {
  it('teaches the skill the opening boss is built around, which the hero has from the start', () => {
    expect(BASH_SKILL).toBe('shieldSlam')
    expect(SKILL_BY_ID[BASH_SKILL]).toBeTruthy()
    expect(SKILL_BY_ID[BASH_SKILL]!.cls).toBe('aegis')
  })

  it('is armed by a telegraph on the tutorial level only, once, never over the dodge lesson or for a lane charge', () => {
    const z = src('game/modes/zoneMode.ts')
    const arm = z.slice(z.indexOf('private armBashLesson'), z.indexOf('private beginBashStop'))
    for (const part of ['!this.tutorialLevel', 'this.bashDone', 'this.dodgeStop', "t.shape !== 'cone'", 'this.bashSlotOf() < 0', 'BASH_REACH']) expect(arm, part).toContain(part)
    expect(z).toContain('this.armBashLesson(e.tele)')
    // Answered by the skill's own cast, remembered, and never a dead end.
    const hold = z.slice(z.indexOf('private holdForBash'), z.indexOf('/** The way out'))
    expect(hold).toContain('castSkill(this.sim, hud.bashSlot, null)')
    expect(hold).toContain('markTip(BASH_TIP)')
    expect(hold).toContain('BASH_HOLD_MAX_S')
  })

  it('lights the skill\'s button and says it in every locale', () => {
    expect(src('components/hud/SkillBar.vue')).toContain('data-bash-spot')
    const dir = resolve(__dirname, '../../src/i18n/locales')
    const files = readdirSync(dir).filter(f => f.endsWith('.ts'))
    expect(files.length).toBeGreaterThan(30)
    for (const f of files) {
      const text = readFileSync(resolve(dir, f), 'utf8')
      const m = text.match(/bashStop'?:\s*(['"])(.*)\1,/)
      expect(m, f).toBeTruthy()
      expect(m![2], f).toContain('{skill}')
    }
  })
})
