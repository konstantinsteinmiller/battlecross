// Stage the cover plate: Flux (third-person body) on the pad, the Scrapper
// looming behind him, a low heroic camera; the game loop stopped, one frame.
const b = await mod('/src/game/boot.ts')
const { app } = await mod('/src/game/engine/app.ts')
const { getRenderer } = await mod('/src/game/engine/renderer.ts')
const H = await mod('/src/game/models/hero.ts')
const K = await mod('/src/game/models/kit.ts')
const m = b.currentMission()
app.setWanted(false)
await new Promise(r => setTimeout(r, 200))
const st = document.createElement('style')
st.textContent = '.scene-root > :not(.canvas-host) { display: none !important } .exit-skip, .toasts { display: none !important }'
document.head.appendChild(st)

const P = window.__plate || { dist: 3.4, camY: 0.75, side: -0.55, bossBack: 4.2, bossSide: 1.6, lookY: 1.55, fov: 58, dir: 0 }
const p = m.player
// The camera's side of him: along `dir` (radians, 0 = the player's view).
const vx = -Math.sin(p.yaw + (P.dir ?? 0))
const vz = -Math.cos(p.yaw + (P.dir ?? 0))
// Stepped off the pad toward the lens (`fwd` m); still on its plate if not.
const fwd = P.fwd ?? 0
const F = { x: p.x + vx * fwd, y: p.y + (fwd > 1.2 ? 0 : 0.32), z: p.z + vz * fwd }
const sx = Math.cos(p.yaw + (P.dir ?? 0)) // right of that direction
const sz = -Math.sin(p.yaw + (P.dir ?? 0))
const C = { x: F.x + vx * P.dist + sx * P.side, y: F.y + P.camY, z: F.z + vz * P.dist + sz * P.side }
// Flux faces the lens, a little turned.
const v = m.exitView
const hr = v.heroRoot
hr.visible = true
hr.scale.setScalar(1)
hr.position.set(F.x, F.y, F.z)
const faceCam = Math.atan2(C.x - F.x, C.z - F.z) + (P.turn ?? 0.35)
hr.rotation.set(0, 0, 0)
hr.quaternion.setFromAxisAngle({ x: 0, y: 1, z: 0, isVector3: true }, faceCam)
H.animateHeroHop(v.hero, 0.45, 0, 0.3)
// Cannon arm up and forward, the other arm braced, a lean into it.
K.pose(v.hero, 'shoulderR', -1.35, 0.25, 0.15)
K.pose(v.hero, 'elbowR', -0.25, 0, 0)
K.pose(v.hero, 'shoulderL', -0.35, 0, -0.55)
K.pose(v.hero, 'elbowL', -1.1, 0, 0)
K.pose(v.hero, 'chest', 0.08, -0.25, 0)
K.pose(v.hero, 'head', -0.12, 0.2, 0)
v.heroShadow.visible = true
v.heroShadow.position.set(F.x, F.y + 0.035, F.z)
// The Scrapper behind him, facing him (and the lens).
const e = m.boss
e.offstage = false
e.root.visible = true
e.x = e.px = F.x - vx * P.bossBack + sx * P.bossSide
e.z = e.pz = F.z - vz * P.bossBack + sz * P.bossSide
e.y = e.py = 0
e.yaw = Math.atan2(C.x - e.x, C.z - e.z) - 0.2
e.state = 'tele'
e.attack = P.bossAttack ?? 'slam'
e.st = 0.5
e.teleDur = 1
// The supporting cast: two machines flanking, a little behind; nothing else.
const extras = m.enemies.filter(o => o !== e && (o.kind === 'hardhat' || o.kind === 'trooper'))
const spots = P.extras ?? [[-2.6, 2.4], [2.9, 1.2]]
m.enemies.forEach(o => { if (o !== e) o.root.visible = false })
extras.slice(0, spots.length).forEach((o, i) => {
  const [side, back] = spots[i]
  o.root.visible = true
  o.x = o.px = F.x - vx * back + sx * side
  o.z = o.pz = F.z - vz * back + sz * side
  o.y = o.py = 0
  o.yaw = Math.atan2(F.x - o.x, F.z - o.z)
  o.state = 'engage'
  o.awake = true
})
const L = { x: F.x + (e.x - F.x) * (P.lookMix ?? 0.3), y: F.y + P.lookY, z: F.z + (e.z - F.z) * (P.lookMix ?? 0.3) }
m.debugCam = [C.x, C.y, C.z, L.x, L.y, L.z]
m.hud = m.hud
const cam = m.camera
cam.fov = P.fov
cam.updateProjectionMatrix()
m.render(1, 1 / 60)
if (Math.abs(cam.fov - P.fov) > 0.01) { cam.fov = P.fov; cam.updateProjectionMatrix() }
cam.position.set(C.x, C.y, C.z)
cam.lookAt(L.x, L.y, L.z)
e.root.scale.setScalar(P.bossScale ?? 1.7)
cam.updateMatrixWorld()
m.level.sky.position.copy(cam.position)
const r = getRenderer()
r.clear()
r.render(m.scene, cam)
return { F, C, boss: [e.x, e.z], yaw: p.yaw }
