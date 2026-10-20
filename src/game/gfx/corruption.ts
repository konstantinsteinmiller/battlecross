import { Color, InstancedMesh, Mesh, MeshBasicMaterial, type BufferAttribute, type Object3D } from 'three'
import { CORRUPT_HEX, CORRUPT_MIX } from '../data/invasion'
import type { Theme } from './terrain'

/**
 * ─── The corruption of an invaded zone (afterplay §3, §14) ───────────────────
 *
 * Shader-free: once a visit's ground, scenery and props are built, every
 * vertex colour they carry is blended toward dried blood (`CORRUPT_HEX`, by
 * `CORRUPT_MIX`) in place, before the still meshes are baked. Nothing is
 * added: the draw calls stay what they were. What glows (lava, crystals,
 * embers, decals) keeps its own light. The mood is the theme's, darkened
 * toward the same red, its motes turned to the ash theme's embers.
 */

const EMBER = '#ff8a3a'

/** An invaded zone's foes (`u.infernal`): their surface multiplied toward blood, and an ember rim. */
export const INFERNAL_TINT = '#ffc0b4'
export const INFERNAL_RIM = '#ff3a1a'
const _a = new Color()
const _b = new Color()

const mix = (hex: string, t: number, to = CORRUPT_HEX): string => '#' + _a.set(hex).lerp(_b.set(to), t).getHexString()

/** A theme's mood, invaded. */
export const corruptTheme = (t: Theme): Theme => ({
  ...t,
  sky: mix(t.sky, 0.45),
  ambient: mix(t.ambient, 0.25, '#ffb8a8'),
  shadow: mix(t.shadow, CORRUPT_MIX),
  rim: mix(t.rim, CORRUPT_MIX),
  ground: [mix(t.ground[0], CORRUPT_MIX), mix(t.ground[1], CORRUPT_MIX)],
  trail: mix(t.trail, CORRUPT_MIX),
  mote: EMBER
})

const blend = (attr: Pick<BufferAttribute, 'array' | 'itemSize' | 'needsUpdate'>, to: Color, t: number): void => {
  const arr = attr.array as Float32Array
  const k = 1 - t
  for (let i = 0; i + 2 < arr.length; i += attr.itemSize) {
    arr[i] = arr[i]! * k + to.r * t
    arr[i + 1] = arr[i + 1]! * k + to.g * t
    arr[i + 2] = arr[i + 2]! * k + to.b * t
  }
  attr.needsUpdate = true
}

/**
 * Blend the vertex colours (and instance colours) of everything under `root`
 * toward the corruption, once per geometry (a lit mesh and its outline share
 * one). Glowing and decal materials (plain `MeshBasicMaterial`) are left lit.
 */
export const corruptColors = (root: Object3D, hex = CORRUPT_HEX, t = CORRUPT_MIX): number => {
  const to = new Color(hex)
  const done = new WeakSet<object>()
  let n = 0
  root.traverse((o) => {
    const m = o as Mesh
    if (!m.isMesh || m.material instanceof MeshBasicMaterial) return
    const g = m.geometry
    const col = g?.getAttribute('color') as BufferAttribute | undefined
    if (col && col.itemSize === 3 && !done.has(col)) {
      done.add(col)
      blend(col, to, t)
      n++
    }
    const inst = (o as InstancedMesh).isInstancedMesh ? (o as InstancedMesh).instanceColor : null
    if (inst && !done.has(inst)) {
      done.add(inst)
      blend(inst, to, t)
      n++
    }
  })
  return n
}
