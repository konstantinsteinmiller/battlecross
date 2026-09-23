import {
  Scene, PerspectiveCamera, Color, HemisphereLight, DirectionalLight, Fog, Group, Mesh, MeshBasicMaterial,
  AdditiveBlending, CylinderGeometry, DoubleSide, type BufferGeometry
} from 'three'
import type { GameMode } from '../engine/app'
import { getRenderer } from '../engine/renderer'
import { buildHero, animateHeroIdle, animateHeroVictory } from '../models/hero'
import { buildPip, animatePip } from '../models/npc'
import { buildTeleporter } from '../models/props'
import { rcyl, rbox, torus, sph, ell, cap, xform, paint, paintBy, merge, lathe } from '../models/kit'
import { toonVC, glowVC, outlineMat } from '../models/toon'
import { THEMES } from '../world/themes'
import type { Rig } from '../models/kit'
import { heroColors } from '../state/profile'
import { Particles } from '../fx/particles'
import { makeBlobShadow } from '../fx/markers'
import { tickHud } from '../state/hud'

/**
 * ─── The hub backdrop ────────────────────────────────────────────────────────
 *
 * Prof. Gauss's lab: a round platform under a dome of glowing panels, the
 * teleporter pad with Cobalt idling on it (in his current gear colours) and
 * Pip bobbing beside him. It is a stage for the hub menus, not a walkable
 * town — the camera frames Cobalt beside the UI and sways gently.
 */
export class HubMode implements GameMode {
  scene = new Scene()
  camera = new PerspectiveCamera(40, 1, 0.1, 200)
  private hero: Rig
  private heroRoot = new Group()
  private pip: Rig
  private pipRoot = new Group()
  private fx = new Particles(300)
  private t = 0
  private victoryT = -1
  private ring: Mesh

  constructor() {
    const th = THEMES.scrapyard
    this.scene.background = new Color('#0e1c3f')
    this.scene.fog = new Fog(new Color('#0e1c3f'), 18, 46)
    this.scene.add(new HemisphereLight(new Color('#dbe8ff'), new Color('#1a2340'), 1.1))
    const key = new DirectionalLight(new Color('#ffffff'), 1.25)
    key.position.set(0.6, 1, 0.9)
    const rim = new DirectionalLight(new Color('#7fd6ff'), 0.7)
    rim.position.set(-1, 0.6, -0.8)
    this.scene.add(key, rim)
    this.scene.add(this.buildLab())

    const pad = buildTeleporter(th)
    this.scene.add(pad.root)
    this.ring = pad.ring
    ;(pad.ringMat as MeshBasicMaterial).opacity = 0.12

    this.hero = buildHero(heroColors())
    this.heroRoot.add(this.hero.root)
    this.heroRoot.position.set(0, 0.38, 0)
    this.heroRoot.rotation.y = 0.25
    this.scene.add(this.heroRoot, makeBlobShadow(0.55))

    this.pip = buildPip()
    this.pipRoot.add(this.pip.root)
    this.pipRoot.position.set(-1.25, 1.7, 0.4)
    this.scene.add(this.pipRoot)
    this.scene.add(this.fx.points)
  }

  private buildLab(): Group {
    const g = new Group()
    const toon: BufferGeometry[] = []
    const glow: BufferGeometry[] = []
    // Floor: a big rounded disc with rings
    toon.push(xform(paint(rcyl(9, 0.4, 0.2, 48), '#26365f'), [0, -0.2, 0]))
    toon.push(xform(paint(torus(3.2, 0.06, 6, 48), '#3a5a9a'), [0, 0.01, 0], [Math.PI / 2, 0, 0]))
    toon.push(xform(paint(torus(5.6, 0.06, 6, 64), '#3a5a9a'), [0, 0.01, 0], [Math.PI / 2, 0, 0]))
    // Back wall: curved panels in a half ring behind the pad
    for (let k = 0; k < 11; k++) {
      const a = Math.PI + (k / 10) * Math.PI
      const x = Math.cos(a) * 8.2
      const z = Math.sin(a) * 8.2
      toon.push(paintBy(xform(rbox(2.6, 6, 0.5, 0.35), [x, 3, z], [0, -a - Math.PI / 2, 0]), (_x, y) => (y > 5.3 ? '#4fd8ff' : y < 0.7 ? '#1c2a50' : '#2f4580')))
      glow.push(xform(paint(cap(0.07, 3.2, 8, 2), k % 2 ? '#7ff4ff' : '#ffd84a'), [Math.cos(a) * 7.9, 3.2, Math.sin(a) * 7.9]))
      toon.push(xform(paint(rcyl(0.32, 6.4, 0.12, 12), '#5d6a82'), [Math.cos(a + 0.14) * 8.1, 3.2, Math.sin(a + 0.14) * 8.1]))
    }
    // Consoles either side
    for (const s of [-1, 1]) {
      toon.push(xform(paint(rbox(1.6, 1.1, 0.9, 0.35), '#3b4458'), [s * 3.6, 0.55, -2.4], [0, -s * 0.5, 0]))
      toon.push(xform(paint(rbox(1.4, 0.8, 0.12, 0.4), '#1d2438'), [s * 3.55, 1.45, -2.65], [-0.35, -s * 0.5, 0]))
      glow.push(xform(paint(rbox(1.2, 0.6, 0.05, 0.5), s > 0 ? '#3cff9a' : '#3cc8ff'), [s * 3.55, 1.47, -2.58], [-0.35, -s * 0.5, 0]))
      // Glass capsule tubes with glowing fluid
      toon.push(xform(paint(rcyl(0.55, 0.35, 0.12, 20), '#5d6a82'), [s * 5.4, 0.18, -0.6]))
      toon.push(xform(paint(rcyl(0.55, 0.35, 0.12, 20), '#5d6a82'), [s * 5.4, 3.3, -0.6]))
      glow.push(xform(paint(lathe([[0, 0], [0.42, 0.05], [0.42, 2.6], [0, 2.65]], 20), s > 0 ? '#7fffc8' : '#8ab8ff'), [s * 5.4, 0.35, -0.6]))
      toon.push(xform(paint(sph(0.35, 14, 10), '#9aa7bd'), [s * 5.4, 1.6, -0.6]))
    }
    // Ceiling lamp ring
    glow.push(xform(paint(torus(3.6, 0.09, 6, 48), '#bff3ff'), [0, 7.2, 0], [Math.PI / 2, 0, 0]))
    toon.push(xform(paint(ell(1.4, 0.4, 1.4, 20, 10), '#2f4580'), [0, 7.6, 0]))
    const geo = merge(toon)
    g.add(new Mesh(geo, toonVC()))
    const ol = new Mesh(geo, outlineMat(0.03))
    ol.renderOrder = -1
    g.add(ol)
    g.add(new Mesh(merge(glow), glowVC()))
    // Soft light shaft over the pad
    const shaft = new Mesh(
      new CylinderGeometry(1.2, 1.6, 7, 24, 1, true),
      new MeshBasicMaterial({ color: new Color('#7ff4ff'), transparent: true, opacity: 0.07, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, toneMapped: false })
    )
    shaft.position.y = 3.6
    g.add(shaft)
    return g
  }

  /** Rebuild Cobalt in his current gear colours (after equipping). */
  refreshHero(): void {
    this.heroRoot.remove(this.hero.root)
    this.hero.mesh.geometry.dispose()
    this.hero = buildHero(heroColors())
    this.heroRoot.add(this.hero.root)
    this.fx.riseRing(0, 0.4, 0, '#7ff4ff', 0.8, 18)
  }

  /** A little cheer (level up, new weapon). */
  celebrate(): void {
    this.victoryT = 0
    this.fx.riseRing(0, 0.4, 0, '#ffd84a', 0.9, 26)
  }

  update(dt: number): void {
    this.t += dt
    if (this.victoryT >= 0) {
      this.victoryT += dt
      if (this.victoryT > 2.4) this.victoryT = -1
    }
    this.fx.update(dt)
    if (Math.random() < dt * 6) {
      const a = Math.random() * Math.PI * 2
      this.fx.emit({ x: Math.cos(a) * 0.8, y: 0.4, z: Math.sin(a) * 0.8, vy: 0.8 + Math.random(), color: '#7ff4ff', size: 0.12, sizeEnd: 0.02, life: 1.4 })
    }
  }

  render(_alpha: number, dt: number): void {
    if (this.victoryT >= 0) animateHeroVictory(this.hero, this.victoryT)
    else animateHeroIdle(this.hero, this.t)
    animatePip(this.pip, this.t)
    this.pipRoot.position.y = 1.7 + Math.sin(this.t * 1.7) * 0.12
    this.ring.rotation.y += dt * 0.5
    // Frame Cobalt beside the menus: right third in landscape, upper half in portrait.
    const cam = this.camera
    const portrait = cam.aspect < 1
    const sway = Math.sin(this.t * 0.25) * 0.35
    if (portrait) {
      // The menu sheet covers the lower ~60 %: aim low so Cobalt stands in
      // the upper band of the screen.
      cam.position.set(sway * 0.6, 1.2, 7.2)
      cam.lookAt(0, -0.95, 0)
      cam.fov = 46
    } else {
      cam.position.set(-1.6 + sway, 1.5, 5.6)
      cam.lookAt(-1.7, 1.0, 0)
      cam.fov = 38
    }
    cam.updateProjectionMatrix()
    const r = getRenderer()
    r.clear()
    r.render(this.scene, cam)
    tickHud(dt)
  }

  resize(w: number, h: number): void {
    this.fx.setScale(h * getRenderer().getPixelRatio(), this.camera.fov)
  }

  dispose(): void {
    this.fx.dispose()
    this.scene.traverse((o) => {
      const m = o as Mesh
      if (m.geometry) m.geometry.dispose()
    })
  }
}
