// Every platform stage's secret room is a puzzle the runtime can actually
// solve (`sim/secrets.ts`). The four stages were designed in parallel with
// the puzzle runtime, against the builder's signature alone, so this holds
// them to its rules: at least one button, the puzzle not solved on arrival,
// and a solution reachable by pressing the buttons — for many seeds (the
// seed picks the kind and the colours) and both mirror sides.

import { describe, expect, it } from 'vitest'
import { generateStage } from '@/game/world/stages'
import { generateClimb } from '@/game/world/climbGen'
import { initialState, press, solved } from '@/game/sim/secrets'
import type { SecretSpec } from '@/game/world/levelGen'
import type { SectorId } from '@/game/world/themes'

const STAGES: SectorId[] = ['blaze', 'cryo', 'volt', 'gale', 'magnet', 'drill', 'tide', 'neon', 'rotor', 'fortress']

/** Breadth-first over button presses: can the puzzle be solved at all? Each
 *  button has at most four states, so the space stays tiny. */
const solvable = (spec: SecretSpec): boolean => {
  const start = initialState(spec)
  const seen = new Set([start.join(',')])
  const queue = [start]
  while (queue.length) {
    const s = queue.shift()!
    if (solved(spec, s)) return true
    for (let i = 0; i < spec.buttons.length; i++) {
      const next = s.slice()
      next[i] = press(spec, next, i)
      const key = next.join(',')
      if (seen.has(key)) continue
      seen.add(key)
      queue.push(next)
    }
  }
  return false
}

const check = (secrets: SecretSpec[] | undefined, label: string): void => {
  expect(secrets?.length, `${label}: a secret`).toBeGreaterThanOrEqual(1)
  for (const s of secrets!) {
    expect(s.buttons.length, `${label}: buttons`).toBeGreaterThan(0)
    expect(solved(s, initialState(s)), `${label}: not solved on arrival (${s.kind})`).toBe(false)
    expect(solvable(s), `${label}: solvable (${s.kind})`).toBe(true)
  }
}

describe('stage secrets are fair puzzles', () => {
  for (const sector of STAGES) {
    it(`${sector}: every seed's secret starts unsolved and can be solved`, () => {
      for (let seed = 0; seed < 40; seed++) check(generateStage(sector, seed).terrain!.secrets, `${sector} #${seed}`)
    })
  }

  it('the Tower Run\'s too', () => {
    for (let seed = 0; seed < 40; seed++) check(generateClimb(seed).terrain!.secrets, `climb #${seed}`)
  })
})
