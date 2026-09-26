// The start pad's light column (src/game/models/props.ts, `setBeamView`).
// Standing at the rim of a lit column tinted part of a phone screen behind a
// hard vertical edge (blind playtest, 2026-09-24). The column now has soft
// edges; it is full only while beaming, gone while the camera is on or
// beside the pad, and faint from afar. The hub never drives it and keeps
// its plain tube.

import { describe, expect, it } from 'vitest'
import { ShaderLib } from 'three'
import { buildTeleporter, type PadMesh } from '@/game/models/props'
import { THEMES } from '@/game/world/themes'

const DT = 1 / 60
/** Drives the column for `s` seconds at one camera distance and beam state. */
const run = (pad: PadMesh, dist: number, active: boolean, s: number): void => {
  for (let k = Math.round(s / DT); k > 0; k--) pad.setBeamView(dist, active, DT)
}
const pad = (): PadMesh => buildTeleporter(THEMES.scrapyard)

describe("the pad's light column", () => {
  it('is full through the beam-in, then dies away from a camera on the pad', () => {
    const p = pad()
    run(p, 0, true, 1.15)
    expect(p.ringMat.opacity).toBeCloseTo(0.85)
    expect(p.ring.visible).toBe(true)
    // The beam-in is over: a fade, not a pop…
    run(p, 0, false, 0.2)
    expect(p.ringMat.opacity).toBeGreaterThan(0.4)
    expect(p.ringMat.opacity).toBeLessThan(0.85)
    // …down to nothing, and then no draw at all (from inside, even a blank
    // column is a transparent pass over the whole screen).
    run(p, 0, false, 1)
    expect(p.ringMat.opacity).toBe(0)
    expect(p.ring.visible).toBe(false)
  })

  it('stays gone within about 2 m of the pad, and is faint further off', () => {
    const p = pad()
    for (const d of [0, 0.5, 0.9, 1.3, 1.8]) {
      run(p, d, false, 0.5)
      expect(p.ringMat.opacity, `${d} m from the axis`).toBe(0)
    }
    for (let k = 0; k < 90; k++) {
      p.setBeamView(6, false, DT)
      expect(p.ringMat.opacity).toBeGreaterThan(0.09)
      expect(p.ringMat.opacity).toBeLessThan(0.27)
    }
    expect(p.ring.visible).toBe(true)
  })

  it('never lights with the camera at its wall, even while beaming', () => {
    const p = pad()
    run(p, 0.9, true, 0.5)
    expect(p.ringMat.opacity).toBe(0)
    run(p, 5, true, 0.5)
    expect(p.ringMat.opacity).toBeCloseTo(0.85)
  })

  it("patches its soft edges into three's own basic shader, idle until driven", () => {
    const p = pad()
    const sh = {
      vertexShader: ShaderLib.basic.vertexShader,
      fragmentShader: ShaderLib.basic.fragmentShader,
      uniforms: {} as Record<string, { value: number }>
    }
    p.ringMat.onBeforeCompile(sh as never, null as never)
    // Every splice point exists in this three version (a miss would be a
    // silent no-op: the column would lose its soft edges without an error).
    expect(sh.vertexShader).toContain('varying vec3 vColV;')
    expect(sh.vertexShader).toMatch(/#include <fog_vertex>\s*vec4 colW = modelMatrix/)
    expect(sh.fragmentShader).toContain('uniform float uSoft;')
    expect(sh.fragmentShader).toMatch(/diffuseColor\.a \*= mix\( 1\.0, colSoft, uSoft \);\s*#include <opaque_fragment>/)
    // The hub's tube: the patch sits idle until the mission drives the column.
    expect(sh.uniforms.uSoft!.value).toBe(0)
    p.setBeamView(4, false, DT)
    expect(sh.uniforms.uSoft!.value).toBe(1)
  })
})
