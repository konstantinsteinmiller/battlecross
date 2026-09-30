import { describe, expect, it } from 'vitest'
import { tryStun, STUN_CHAIN, STUN_CHAIN_MAX, STUN_IMMUNE } from '@/game/sim/enemies'
import type { Enemy } from '@/game/sim/world'

// Charged shots from afar used to stunlock a machine forever. Stuns now
// halve along a chain and the one past STUN_CHAIN_MAX is shrugged off.
const foe = (): Enemy => ({ state: 'engage', st: 0, stunT: 0, stunN: 0, stunAge: 99, stunImmune: 0, ring: { visible: true } }) as unknown as Enemy

describe('stun diminishing returns', () => {
  it('halves each stun in a chain, then resists and turns immune', () => {
    const e = foe()
    expect(tryStun(e, 1).dur).toBe(1)
    e.state = 'engage'
    e.stunAge = 1
    expect(tryStun(e, 1).dur).toBe(0.5)
    e.state = 'engage'
    e.stunAge = 1
    expect(tryStun(e, 1).dur).toBe(0.25)
    e.state = 'engage'
    e.stunAge = 1
    const r = tryStun(e, 1)
    expect(r.resisted).toBe(true)
    expect(e.state).toBe('engage')
    expect(e.stunImmune).toBe(STUN_IMMUNE)
    expect(tryStun(e, 1).dur).toBe(0)
    expect(STUN_CHAIN_MAX).toBe(3)
  })
  it('a quiet stretch resets the chain', () => {
    const e = foe()
    tryStun(e, 1)
    e.stunAge = STUN_CHAIN + 0.1
    e.state = 'engage'
    expect(tryStun(e, 1).dur).toBe(1)
  })
})
