// Each Master's signature colour (`data/signature.ts`) is the one colour it
// is known by everywhere, and no two Masters read alike.

import { describe, expect, it } from 'vitest'
import { MASTER_COLOR, RESERVED_COLOR, SECTOR_COLOR } from '@/game/data/signature'
import { BOSSES } from '@/game/data/bosses'
import { WEAPONS, WEAPON_IDS } from '@/game/data/weapons'
import { SECTORS } from '@/game/data/regions'
import { SECTOR_GLOW } from '@/game/models/diorama'

/** CIE76 ΔE between two sRGB hex colours (D65). */
const lab = (hex: string): [number, number, number] => {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92))
  const [r, g, b] = c as [number, number, number]
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}
const dE = (a: string, b: string) => {
  const [p, q] = [lab(a), lab(b)]
  return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])
}
/** Apart enough to tell at a glance on a small icon or a relay lamp. */
const MIN_DE = 24

describe('signature colours', () => {
  const masters = Object.entries(MASTER_COLOR).filter(([id]) => id !== 'vexMk1')

  it('no two Masters read alike, and none reads as Vex red or the lab cyan', () => {
    for (let i = 0; i < masters.length; i++) {
      for (let j = i + 1; j < masters.length; j++) {
        const [a, ca] = masters[i]!
        const [b, cb] = masters[j]!
        expect(dE(ca, cb), `${a} vs ${b}`).toBeGreaterThanOrEqual(MIN_DE)
      }
      const [id, c] = masters[i]!
      expect(dE(c, RESERVED_COLOR.vex), `${id} vs Vex`).toBeGreaterThanOrEqual(MIN_DE)
      expect(dE(c, RESERVED_COLOR.lab), `${id} vs lab cyan`).toBeGreaterThanOrEqual(MIN_DE)
    }
  })

  it('the boss tint, the copied weapon, the relay glow and the sector all wear it', () => {
    for (const [id, c] of Object.entries(MASTER_COLOR)) expect(BOSSES[id as keyof typeof BOSSES].color, id).toBe(c)
    for (const w of WEAPON_IDS) expect(WEAPONS[w].color, w).toBe(MASTER_COLOR[WEAPONS[w].from!])
    for (const s of SECTORS) {
      expect(SECTOR_COLOR[s.id], s.id).toBe(MASTER_COLOR[s.boss])
      if (s.id !== 'fortress') expect(SECTOR_GLOW[s.id], s.id).toBe(MASTER_COLOR[s.boss])
    }
  })
})
