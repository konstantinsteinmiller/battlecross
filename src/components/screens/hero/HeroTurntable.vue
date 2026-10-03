<template lang="pug">
  div.turntable(ref="host" :class="{ 'is-grabbed': grabbed }" @pointerdown="onDown")
</template>

<script setup lang="ts">
/**
 * ─── The hero on a turntable (D39) ───────────────────────────────────────────
 *
 * The paper-doll's centre: the hero's own 3D rig — built by the game's rig
 * factory from the gear he wears (`heroLook`), animated by the game's own
 * idle — turning slowly on a small renderer of its own. A drag turns him by
 * hand. What is put on in a socket shows on him at once (the rig is rebuilt
 * when the look changes) and he squashes and springs as it lands.
 *
 * It is a guest on the device: a few hundred pixels, at most 1.5× density,
 * 30 frames a second, nothing drawn while the tab is hidden, and the whole
 * renderer and its context are released when the page closes. `emit('fail')`
 * hands over to the drawn portrait: no WebGL to spare, or a lost context.
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { PerspectiveCamera, Scene, SRGBColorSpace, WebGLRenderer } from 'three'
import { updateCelFrame } from '@/game/gfx/cel'
import { makeBlobShadow } from '@/game/gfx/markers'
import { makeRigView, type RigView } from '@/game/gfx/rigs'
import { animate, squash } from '@/game/gfx/rigs/anim'
import { heroLook, lookKey } from '@/game/gfx/rigs/looks'
import type { Unit } from '@/game/sim/types'
import { profile } from '@/game/state/profile'
import { prefersReducedMotion } from '@/components/game/fx'

const emit = defineEmits<{ (e: 'fail'): void }>()
const host = ref<HTMLElement | null>(null)
const grabbed = ref(false)

/** A unit for the rig to read: a hero standing still, facing the camera. */
const standIn = (): Unit => ({
  id: 1, kind: 'hero', team: 0, rank: 'hero', level: 1, x: 0, z: 0, px: 0, pz: 0, vx: 0, vz: 0, facing: 0, r: 0.45, h: 1.45,
  hp: 10, mana: 0, shield: 0, shieldT: 0, alive: true, deadT: 0,
  s: { atkStyle: 'melee', atkHeavy: false, dual: 0, maxHp: 10 } as Unit['s'],
  statuses: [], targetId: 0, hasGoal: false, goalX: 0, goalZ: 0, path: [], pathI: 0, repathT: 0, attackCd: 0, action: null,
  cds: [], ai: 'idle', aiT: 0, homeX: 0, homeZ: 0, group: -1, awake: true, ownerId: 0, life: -1, kx: 0, kz: 0,
  anim: 'idle', animT: 1, animStyle: 0, flinch: 0, swings: 0, phase: 1, icd: {}
} as unknown as Unit)

let renderer: WebGLRenderer | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let view: RigView | null = null
let unit: Unit | null = null
let raf = 0
let last = 0
let time = 0
/** Where he faces, and how fast he is turning by himself (radians a second). */
let yaw = -0.35
let spin = 0.45
let idleAt = 0

const FRAME = 1 / 30

/**
 * Proof that he is really on screen. Some GPU / driver pairs give a second
 * WebGL context that draws nothing and raises no error (an empty plinth on
 * the owner's machine). Right after a frame — in the same task, so the
 * drawing buffer is still there — the canvas is read back; if a few frames in
 * a row came out empty, the drawn portrait takes over.
 */
let checks = 0
let blanks = 0
const MAX_CHECKS = 6
const isBlank = (): boolean => {
  if (!renderer) return true
  const gl = renderer.getContext()
  const w = gl.drawingBufferWidth
  const h = gl.drawingBufferHeight
  if (w < 2 || h < 2) return true
  // A cross through the middle, where he stands, is plenty: 2 lines of pixels.
  const row = new Uint8Array(w * 4)
  const col = new Uint8Array(h * 4)
  gl.readPixels(0, Math.floor(h * 0.45), w, 1, gl.RGBA, gl.UNSIGNED_BYTE, row)
  gl.readPixels(Math.floor(w / 2), 0, 1, h, gl.RGBA, gl.UNSIGNED_BYTE, col)
  for (let i = 3; i < row.length; i += 4) if (row[i]! > 8) return false
  for (let i = 3; i < col.length; i += 4) if (col[i]! > 8) return false
  return true
}
const verify = (): boolean => {
  if (checks >= MAX_CHECKS) return true
  checks++
  if (!isBlank()) { checks = MAX_CHECKS; return true }
  if (++blanks >= 3) {
    if (import.meta.env.DEV) console.debug('[turntable] the 3D figure drew nothing: showing the portrait instead')
    stop()
    emit('fail')
    return false
  }
  return true
}

const build = (): void => {
  if (!scene) return
  if (view) { scene.remove(view.rig.root); view.rig.material.dispose() }
  unit = standIn()
  unit.facing = yaw
  view = makeRigView(unit, heroLook(profile.inv.equipped, profile.hero.gender))
  view.yaw = yaw
  scene.add(view.rig.root)
  // A breath of standing first, so the springs are settled when he appears.
  for (let i = 0; i < 20; i++) animate(view, unit, 0, 0, i / 60, 1 / 60)
}

const draw = (): void => {
  const el = host.value
  if (!renderer || !scene || !camera || !el) return
  const w = Math.max(1, el.clientWidth)
  const h = Math.max(1, el.clientHeight)
  const c = renderer.domElement
  const dpr = Math.min(1.5, window.devicePixelRatio || 1)
  if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
    renderer.setPixelRatio(dpr)
    renderer.setSize(w, h, false)
  }
  // Frame the whole figure (1.5 m with his headgear) with room for a weapon
  // held out as he turns, his feet on the plinth near the bottom.
  camera.aspect = w / h
  const tan = Math.tan((camera.fov * Math.PI) / 360)
  const dist = Math.max(2 / (2 * tan), 0.95 / (2 * tan * camera.aspect))
  const seen = 2 * dist * tan
  const aim = seen * 0.38
  camera.position.set(0, aim + dist * 0.16, dist)
  camera.lookAt(0, aim, 0)
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld()
  updateCelFrame(camera, dist)
  renderer.render(scene, camera)
  verify()
}

const tick = (now: number): void => {
  raf = requestAnimationFrame(tick)
  if (document.hidden || !view || !unit) return
  const dt = Math.min(0.1, (now - last) / 1000)
  if (dt < FRAME - 0.002) return
  last = now
  time += dt
  if (!grabbed.value && now > idleAt && !prefersReducedMotion()) yaw += spin * dt
  unit.facing = yaw
  animate(view, unit, 0, 0, time, dt)
  draw()
}

// ── Turned by hand ───────────────────────────────────────────────────────────
let px = 0
const onMove = (e: PointerEvent): void => {
  yaw += (e.clientX - px) * 0.012
  px = e.clientX
}
const onUp = (): void => {
  grabbed.value = false
  // He keeps still a moment where he was left, then turns on by himself.
  idleAt = performance.now() + 2500
  window.removeEventListener('pointermove', onMove)
  window.removeEventListener('pointerup', onUp)
  window.removeEventListener('pointercancel', onUp)
}
const onDown = (e: PointerEvent): void => {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  grabbed.value = true
  px = e.clientX
  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointercancel', onUp)
}

const onLost = (e: Event): void => {
  e.preventDefault()
  stop()
  emit('fail')
}

const stop = (): void => {
  cancelAnimationFrame(raf)
  raf = 0
  onUp()
  if (view && scene) { scene.remove(view.rig.root); view.rig.material.dispose() }
  view = null
  if (renderer) {
    renderer.domElement.removeEventListener('webglcontextlost', onLost)
    renderer.dispose()
    renderer.forceContextLoss()
    renderer.domElement.remove()
  }
  renderer = null
  scene = null
  camera = null
}

onMounted(() => {
  const el = host.value
  if (!el) return
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
  } catch {
    renderer = null
  }
  if (!renderer || !renderer.getContext()) { emit('fail'); return }
  renderer.outputColorSpace = SRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none'
  renderer.domElement.addEventListener('webglcontextlost', onLost)
  el.appendChild(renderer.domElement)
  scene = new Scene()
  camera = new PerspectiveCamera(26, 1, 0.1, 40)
  scene.add(makeBlobShadow(0.5))
  try {
    build()
  } catch (e) {
    console.warn('[turntable] the hero rig could not be built', e)
    stop()
    emit('fail')
    return
  }
  draw()
  raf = requestAnimationFrame(tick)
})
onUnmounted(stop)

// New gear, or the other hero picked on the character page: a new rig (built
// from the same look the fight would use).
watch(() => lookKey(heroLook(profile.inv.equipped, profile.hero.gender)), () => {
  try { build() } catch { /* the old rig stays */ }
})

/** Something was put on: he squashes and springs back. */
defineExpose({ react: (): void => { if (view) squash(view, 0.28) } })
</script>

<style scoped lang="sass">
.turntable
  position: relative
  width: 100%
  height: 100%
  cursor: grab
  touch-action: none
  &.is-grabbed
    cursor: grabbing
</style>
