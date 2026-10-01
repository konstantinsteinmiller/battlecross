// @vitest-environment jsdom
// Retry from checkpoint (the Fortress): the defeat screen offers it, free,
// when a checkpoint is kept, and the retry point survives a reload and a retry
// without ever nesting.

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive } from 'vue'
import { retryPointOf, type MissionSnapshot } from '@/game/state/profile'

const snap = (o: Partial<MissionSnapshot> = {}): MissionSnapshot => ({
  quest: { id: 'q', sector: 'fortress' } as never,
  killed: [1, 2], opened: [], doors: [3], collected: [], progress: 0,
  x: 1, z: 2, yaw: 0, hp: 40, we: 10, bolts: 5, xp: 6, kills: 2, t: 30, done: false,
  ...o
})

describe('the retry point', () => {
  it('a reload keeps the checkpoint it carried', () => {
    const cp = snap({ atCheckpoint: true, hp: 200 })
    expect(retryPointOf(snap({ checkpoint: cp }))).toBe(cp)
  })

  it('a retry keeps the checkpoint it started from, without nesting', () => {
    const inner = snap({ atCheckpoint: true })
    const cp = snap({ atCheckpoint: true, hp: 200, checkpoint: inner })
    const kept = retryPointOf(cp)!
    expect(kept.hp).toBe(200)
    expect(kept.checkpoint).toBeUndefined()
  })

  it('no checkpoint, no retry point', () => {
    expect(retryPointOf(snap())).toBeNull()
  })
})

const g = vi.hoisted(() => ({ mission: null as null | Record<string, unknown> }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string) => k }) }))
vi.mock('@/game/boot', () => ({ currentMission: () => g.mission }))
vi.mock('@/game/flow', () => ({ flow: reactive({ modal: 'defeat', quest: null }) }))
vi.mock('@/use/useAdGate', () => ({ claimReward: vi.fn(), canOfferReward: { value: false }, adInFlight: { value: false } }))
vi.mock('@/use/useSound', () => ({ resumeMusicAfterAd: vi.fn() }))
vi.mock('@/platforms/capabilities', () => ({ platformPolicy: { freeOptionFirst: false } }))

describe('the defeat screen', () => {
  const load = async () => (await import('@/components/modals/DefeatModal.vue')).default
  const stubs = {
    FModal: { template: '<div><slot /><slot name="footer" /></div>' },
    FButton: { props: ['label'], emits: ['click'], template: '<button class="fb" @click="$emit(\'click\')">{{ label }}<slot /></button>' }
  }

  it('offers the retry where a checkpoint is kept, and it retries', async () => {
    const retry = vi.fn()
    g.mission = { canRetryCheckpoint: true, retryFromCheckpoint: retry, xp: 0, bolts: 0 }
    const w = mount(await load(), { global: { stubs } })
    const b = w.findAll('.fb').find(x => x.text() === 'defeat.retryCheckpoint')
    expect(b).toBeTruthy()
    await b!.trigger('click')
    expect(retry).toHaveBeenCalled()
  })

  it('does not offer it anywhere else', async () => {
    g.mission = { canRetryCheckpoint: false, xp: 0, bolts: 0 }
    const w = mount(await load(), { global: { stubs } })
    expect(w.findAll('.fb').some(x => x.text() === 'defeat.retryCheckpoint')).toBe(false)
  })
})
