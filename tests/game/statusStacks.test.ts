import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { Status } from '@/game/sim/types'
import { CHI_BEADS, CHI_SPENDERS, heroStatusView, showsCount, targetStackView } from '@/game/state/statusView'
import { CHI_MAX } from '@/game/sim/heroSkills'

const st = (id: string, n = 1): Status => ({ id: id as Status['id'], t: 5, dur: 5, v: 1, n, src: 1 })

describe('#152: stacks reach the HUD', () => {
  it('chi always shows its count, even at one bead', () => {
    expect(showsCount({ id: 'chi', n: 1 })).toBe(true)
    expect(showsCount({ id: 'haste', n: 1 })).toBe(false)
  })

  it('stacking statuses lead the hero row, so six plain buffs never hide them', () => {
    const row = heroStatusView([...['haste', 'regen', 'damageUp', 'defenseUp', 'focus', 'reflect'].map(id => st(id)), st('accelerate', 4), st('chi', 3)])
    expect(row.slice(0, 2)).toEqual([{ id: 'accelerate', n: 4 }, { id: 'chi', n: 3 }])
  })

  it('the target shows what is stacked on it, and nothing else', () => {
    expect(targetStackView([st('poison', 3), st('slow')])).toEqual([{ id: 'poison', n: 3 }])
    expect(targetStackView(undefined)).toEqual([])
  })

  it('every skill that spends chi is listed, and the bead count matches the sim', () => {
    expect(CHI_BEADS).toBe(CHI_MAX)
    const src = readFileSync('src/game/sim/heroSkills.ts', 'utf8')
    const spenders = [...src.matchAll(/\n  (\w+): \(c\) => \{(?:(?!\n  \w+: \(c\)).)*?spendChi\(c\)/gs)].map(m => m[1])
    expect(new Set(spenders)).toEqual(new Set(CHI_SPENDERS))
  })
})
