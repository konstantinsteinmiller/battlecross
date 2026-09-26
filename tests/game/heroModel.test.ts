// Flux's model (src/game/models/hero.ts) after his redesign, asserted
// without a GPU: the full body and the first-person arm build for every kit
// the gear can put on him, keep the bones the animations pose, stay in the
// old model's vertex budget and never produce a broken vertex (a NaN, or a
// normal the outline hull cannot push along). The starter kit IS the default
// look, and that look is pearl armour, a graphite suit and a warm plasma —
// not the blue helmet and skin face he started with. His head lights (eyes,
// antenna tip) are the brand's amber under every kit; only the body's glows
// follow the cannon.

import { describe, expect, it } from 'vitest'
import { Color, SRGBColorSpace, type BufferGeometry } from 'three'
import {
  buildHero, buildViewmodel, animateHeroIdle, animateHeroVictory, DEFAULT_HERO_COLORS, HERO_EYE, type HeroColors
} from '@/game/models/hero'
import type { Rig } from '@/game/models/kit'
import { BASES, BASE_BY_ID, type Slot } from '@/game/data/items'
import { WEAPONS, WEAPON_IDS, type WeaponId } from '@/game/data/weapons'
import { PAL } from '@/game/models/palette'
import { heroColors } from '@/game/state/profile'

/** The bones `animateHeroIdle` / `animateHeroVictory` pose. */
const BONES = ['hips', 'spine', 'chest', 'head', 'shoulderL', 'elbowL', 'shoulderR', 'elbowR', 'hipL', 'kneeL', 'hipR', 'kneeR']

/** A kit composed the way `profile.heroColors()` does it: starter look, item tints, then a copied weapon's arm. */
const kit = (...ids: string[]): HeroColors => {
  const c: HeroColors = { ...DEFAULT_HERO_COLORS }
  for (const id of ids) {
    const tint = BASE_BY_ID[id]?.tint
    if (tint) Object.assign(c, Object.fromEntries(Object.entries(tint).filter(([, v]) => v)))
    const w = WEAPONS[id as WeaponId]
    if (w) Object.assign(c, { buster: w.shell, core: w.color })
  }
  return c
}

const idsOf = (slot: Slot): string[] => BASES.filter(b => b.slot === slot).map(b => b.id)
const ARMS = [...idsOf('buster'), ...WEAPON_IDS]

/** Vertices a renderer or the outline hull would choke on. */
const brokenVertices = (g: BufferGeometry): number => {
  const p = g.attributes.position!
  const n = g.attributes.normal!
  let bad = 0
  for (let i = 0; i < p.count; i++) {
    const v = [p.getX(i), p.getY(i), p.getZ(i), n.getX(i), n.getY(i), n.getZ(i)]
    if (!v.every(Number.isFinite) || Math.hypot(v[3]!, v[4]!, v[5]!) < 0.5) bad++
  }
  return bad
}

const hsl = (hex: string) => new Color(hex).getHSL({ h: 0, s: 0, l: 0 }, SRGBColorSpace)

/** A vertex colour (linear) as a comparable key. */
const colourKey = (r: number, g: number, b: number): string => [r, g, b].map(x => x.toFixed(3)).join(',')
const keyOf = (hex: string): string => {
  const c = new Color(hex)
  return colourKey(c.r, c.g, c.b)
}

/** The colours of the unlit (glow) parts, per bone they ride on. */
const glowsByBone = (rig: Rig): Record<string, Set<string>> => {
  const g = rig.mesh.geometry
  const group = g.groups.find(x => x.materialIndex === 1)!
  const col = g.attributes.color!
  const skin = g.attributes.skinIndex!
  const names = rig.mesh.skeleton.bones.map(b => b.name)
  const out: Record<string, Set<string>> = {}
  for (let i = group.start; i < group.start + group.count; i++) {
    const v = g.index!.getX(i)
    const bone = names[skin.getX(v)]!
    ;(out[bone] ??= new Set()).add(colourKey(col.getX(v), col.getY(v), col.getZ(v)))
  }
  return out
}

const dispose = (rig: Rig): void => {
  rig.mesh.geometry.dispose()
  if (rig.outline && rig.outline.geometry !== rig.mesh.geometry) rig.outline.geometry.dispose()
}

describe('the default look', () => {
  it('is what a new player wears: the starter kit composes to DEFAULT_HERO_COLORS', () => {
    expect(heroColors()).toEqual(DEFAULT_HERO_COLORS)
    expect(kit('helm_scout', 'body_light', 'arm_standard', 'boots_basic')).toEqual(DEFAULT_HERO_COLORS)
  })

  it('is pearl armour on a graphite suit with a warm plasma, not blue', () => {
    for (const slot of ['main', 'accent', 'buster'] as const) {
      const { s, l } = hsl(DEFAULT_HERO_COLORS[slot])
      expect(l, slot).toBeGreaterThan(0.85)
      expect(s, slot).toBeLessThan(0.3)
    }
    const core = hsl(DEFAULT_HERO_COLORS.core)
    expect(core.h * 360).toBeGreaterThan(25) // amber/orange: warm, but clear of Vex's red
    expect(core.h * 360).toBeLessThan(50)
    expect(core.s).toBeGreaterThan(0.8)
    const suit = hsl(PAL.heroSuit)
    expect(suit.l).toBeLessThan(0.35)
    expect(suit.s).toBeLessThan(0.2)
  })

  it('has no skin face and no blue armour left anywhere on the model', () => {
    const rig = buildHero()
    const col = rig.mesh.geometry.attributes.color!
    const c = new Color()
    const olds = ['#ffd2a8', '#2468f0', '#4fd8ff'].map(h => new Color(h))
    let hits = 0
    for (let i = 0; i < col.count; i++) {
      c.setRGB(col.getX(i), col.getY(i), col.getZ(i))
      if (olds.some(o => Math.abs(o.r - c.r) + Math.abs(o.g - c.g) + Math.abs(o.b - c.b) < 0.03)) hits++
    }
    expect(hits).toBe(0)
    dispose(rig)
  })

  it('leaves the lab its old blue and cyan (Pip still wears them)', () => {
    expect(PAL.labBlue).toBe('#2468f0')
    expect(PAL.labCyan).toBe('#4fd8ff')
  })
})

describe('gear tints', () => {
  it('are hex colours, and every item in a slot looks different', () => {
    for (const slot of ['buster', 'helmet', 'chest'] as const) {
      const seen = new Set<string>()
      for (const id of idsOf(slot)) {
        const tint = BASE_BY_ID[id]!.tint
        expect(tint, id).toBeDefined()
        for (const v of Object.values(tint!)) expect(v, id).toMatch(/^#[0-9a-f]{6}$/i)
        const key = JSON.stringify(tint)
        expect(seen.has(key), `${id} repeats another ${slot}`).toBe(false)
        seen.add(key)
      }
    }
  })

  it('paint only the slot their piece owns', () => {
    for (const id of idsOf('helmet')) expect(Object.keys(BASE_BY_ID[id]!.tint!), id).toEqual(['main'])
    for (const id of idsOf('chest')) expect(Object.keys(BASE_BY_ID[id]!.tint!), id).toEqual(['accent'])
    for (const id of idsOf('buster')) expect(Object.keys(BASE_BY_ID[id]!.tint!).sort(), id).toEqual(['buster', 'core'])
  })
})

describe('the full-body rig', () => {
  it('builds cleanly for every helmet × chest × arm cannon / copied weapon, head lights unchanged', () => {
    const base = buildHero()
    const headLights = glowsByBone(base).head
    dispose(base)
    let kits = 0
    for (const helm of idsOf('helmet')) {
      for (const chest of idsOf('chest')) {
        for (const arm of ARMS) {
          const rig = buildHero(kit(helm, chest, arm))
          expect(brokenVertices(rig.mesh.geometry), `${helm} ${chest} ${arm}`).toBe(0)
          expect(glowsByBone(rig).head, `${helm} ${chest} ${arm}`).toEqual(headLights)
          dispose(rig)
          kits++
        }
      }
    }
    expect(kits).toBe(4 * 4 * 10)
  })

  it('keeps the eyes and antenna tip amber for every cannon and weapon; the body glows follow its core', () => {
    // At the default look the body's plasma IS the eyes' amber: one colour all over.
    expect(HERO_EYE).toBe(DEFAULT_HERO_COLORS.core)
    const eye = keyOf(HERO_EYE)
    for (const arm of ARMS) {
      const c = kit(arm)
      const rig = buildHero(c)
      const glows = glowsByBone(rig)
      expect(glows.head!.has(eye), arm).toBe(true)
      if (c.core !== HERO_EYE) expect(glows.head!.has(keyOf(c.core)), `${arm}: the face took the weapon's colour`).toBe(false)
      // Reactor + fin edges on the chest, vents + muzzle on the cannon arm.
      expect(glows.chest!.has(keyOf(c.core)), arm).toBe(true)
      expect(glows.elbowR!.has(keyOf(c.core)), arm).toBe(true)
      dispose(rig)
    }
  })

  it('keeps the bones the idle and victory poses drive, and both poses move them', () => {
    const rig = buildHero()
    expect(Object.keys(rig.bones).sort()).toEqual([...BONES].sort())
    animateHeroIdle(rig, 1.3)
    const idleHead = rig.bones.head!.quaternion.clone()
    expect(idleHead.angleTo(rig.rest.head!.q)).toBeGreaterThan(0.01)
    animateHeroVictory(rig, 1)
    // The buster goes up: the cannon arm swings far past its rest.
    expect(rig.bones.shoulderR!.quaternion.angleTo(rig.rest.shoulderR!.q)).toBeGreaterThan(2)
    dispose(rig)
  })

  it('stays within the old model’s budget (11.7k vertices, 21.2k triangles)', () => {
    const rig = buildHero()
    const g = rig.mesh.geometry
    expect(g.attributes.position!.count).toBeLessThan(13_000)
    expect(g.index!.count / 3).toBeLessThan(24_000)
    // One skinned mesh (toon + glow groups) plus one outline: 3 draw calls.
    expect(g.groups.map(x => x.materialIndex)).toEqual([0, 1])
    expect(rig.outline).not.toBeNull()
    dispose(rig)
  })
})

describe('the first-person arm', () => {
  it('builds for every arm cannon and copied weapon, and recolours in place', () => {
    const vm = buildViewmodel()
    expect(`#${vm.coreColor.getHexString()}`).toBe(DEFAULT_HERO_COLORS.core)
    for (const arm of ARMS) {
      const c = kit(arm)
      const fresh = buildViewmodel(c)
      // The arm and its glow parts (vertex-coloured); the core, halo and barrier are plain FX meshes.
      fresh.root.traverse((o) => {
        const g = (o as { geometry?: BufferGeometry }).geometry
        if (g?.attributes.color) expect(brokenVertices(g), arm).toBe(0)
      })
      vm.setColors(c)
      // The resting glow is the kit's plasma; the mission returns to it after every charge.
      expect(vm.coreColor.getHexString(), arm).toBe(new Color(c.core).getHexString())
      expect(vm.coreMat.color.getHexString(), arm).toBe(new Color(c.core).getHexString())
    }
  })

  it('stays light: the arm is well under two thousand vertices', () => {
    const vm = buildViewmodel()
    const arm = vm.root.children[0] as unknown as { geometry: BufferGeometry }
    expect(arm.geometry.attributes.position!.count).toBeLessThan(2000)
  })
})
