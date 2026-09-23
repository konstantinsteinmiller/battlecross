<template lang="pug">
  div.lab
    div.host(ref="host")
    div.bar
      button(v-for="m in models" :key="m" :class="{ on: m === current }" @click="current = m") {{ m }}
</template>

<script setup lang="ts">
/**
 * DEV-ONLY turntable for every procedural model (route `/models`). Lets the
 * art be iterated on and screenshotted without playing into a mission.
 */
import { onMounted, onUnmounted, ref, watch } from 'vue'
import {
  Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, Color, Group, GridHelper, type Object3D
} from 'three'
import { getRenderer } from '@/game/engine/renderer'
import { buildHero, animateHeroIdle, buildViewmodel } from '@/game/models/hero'
import { buildDoor, buildTeleporter, buildCrate, buildBarrel, buildChest, buildBolt, buildCapsule, buildDataCore } from '@/game/models/props'
import { THEMES } from '@/game/world/themes'
import { bakeTextures } from '@/game/world/textures'
import type { Rig } from '@/game/models/kit'
import { buildEnemyRig, poseHardhat, poseTrooper, poseHeli, poseHopper, poseRoller, poseBrute, poseTurret, type EnemyKind } from '@/game/models/enemies'

const host = ref<HTMLElement | null>(null)
const ENEMIES: EnemyKind[] = ['hardhat', 'trooper', 'heli', 'hopper', 'roller', 'brute', 'turret']
const models = ['hero', 'viewmodel', 'props', 'enemies', ...ENEMIES]
let enemyRigs: Array<{ kind: EnemyKind; rig: Rig }> = []
const hashQuery = new URLSearchParams(location.hash.split('?')[1] ?? '')
const current = ref(hashQuery.get('m') ?? 'hero')
/** Fixed turntable angle in degrees (`#/models?m=hero&angle=0`); spins when absent. */
const fixedAngle = hashQuery.has('angle') ? Number(hashQuery.get('angle')) * Math.PI / 180 : null
const zoom = Number(hashQuery.get('zoom') ?? 1)

const scene = new Scene()
scene.background = new Color('#8fc8ff')
const camera = new PerspectiveCamera(35, 1, 0.05, 100)
scene.add(new HemisphereLight('#e6f3ff', '#6b5f4f', 1.05))
const sun = new DirectionalLight('#fff4dc', 1.25)
sun.position.set(0.45, 1, 0.3)
scene.add(sun)
const grid = new GridHelper(10, 20, 0x335577, 0x557799)
scene.add(grid)
const stage = new Group()
scene.add(stage)
let rig: Rig | null = null
let raf = 0
const t0 = performance.now()

const show = (name: string) => {
  stage.clear()
  rig = null
  enemyRigs = []
  const th = THEMES.scrapyard
  if (name === 'hero') {
    rig = buildHero()
    stage.add(rig.root)
    camera.position.set(0, 1.0, 4.2 / zoom)
    camera.lookAt(0, zoom > 1.5 ? 1.15 : 0.78, 0)
  } else if (name === 'viewmodel') {
    const vm = buildViewmodel()
    vm.root.scale.setScalar(3)
    vm.root.position.y = 1
    stage.add(vm.root)
    camera.position.set(1.5, 1.6, 2.5)
    camera.lookAt(0, 1, 0)
  } else if (name === 'enemies' || (ENEMIES as string[]).includes(name)) {
    const kinds = name === 'enemies' ? ENEMIES : [name as EnemyKind]
    kinds.forEach((kind, i) => {
      const r = buildEnemyRig(kind)
      r.root.position.set((i - (kinds.length - 1) / 2) * 2.1, kind === 'heli' ? 1.6 : 0, 0)
      stage.add(r.root)
      enemyRigs.push({ kind, rig: r })
    })
    if (kinds.length > 1) {
      camera.position.set(0, 2.4, 11)
      camera.lookAt(0, 1.0, 0)
    } else {
      const h = enemyRigs[0]!.rig.height
      camera.position.set(0, h * 0.75 + 0.4, h * 2.2 + 1.2)
      camera.lookAt(0, h * 0.5, 0)
    }
  } else {
    const items: Object3D[] = [
      buildDoor(th, false).root, buildDoor(th, true).root, buildTeleporter(th).root, buildCrate(th).root,
      buildBarrel(th).root, buildChest(th, 'prototype').root, buildBolt().root, buildCapsule('hp', true).root,
      buildCapsule('we', false).root, buildDataCore().root
    ]
    items.forEach((o, i) => {
      o.position.set((i % 5) * 3.4 - 6.8, i === 6 || i > 6 ? 0.5 : 0, Math.floor(i / 5) * 4 - 2)
      stage.add(o)
    })
    camera.position.set(0, 7, 13)
    camera.lookAt(0, 0.8, 0)
  }
}

const loop = () => {
  raf = requestAnimationFrame(loop)
  const t = (performance.now() - t0) / 1000
  if (rig) animateHeroIdle(rig, t)
  for (const { kind, rig: r } of enemyRigs) {
    if (kind === 'hardhat') poseHardhat(r, 0.5 + 0.5 * Math.sin(t * 1.5), t, 0)
    else if (kind === 'trooper') poseTrooper(r, 0.5 + 0.5 * Math.sin(t), 0.5 - 0.5 * Math.sin(t), t, 0.3)
    else if (kind === 'heli') poseHeli(r, t, 0.1, t * 25)
    else if (kind === 'hopper') poseHopper(r, Math.sin(t * 2), t)
    else if (kind === 'roller') poseRoller(r, t * 3, t, 0.4)
    else if (kind === 'brute') poseBrute(r, t, 0.2, Math.sin(t) > 0 ? 1 : -1, Math.sin(t * 2), 0)
    else if (kind === 'turret') poseTurret(r, 0.2 + Math.sin(t) * 0.2, 0)
  }
  if (enemyRigs.length > 1) stage.rotation.y = fixedAngle ?? Math.sin(t * 0.4) * 0.5
  if (current.value !== 'props' && enemyRigs.length <= 1) stage.rotation.y = fixedAngle ?? t * 0.6
  const r = getRenderer()
  r.clear()
  r.render(scene, camera)
}

onMounted(() => {
  bakeTextures()
  const r = getRenderer()
  host.value!.appendChild(r.domElement)
  const resize = () => {
    const w = host.value!.clientWidth
    const h = host.value!.clientHeight
    r.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()
  window.addEventListener('resize', resize)
  show(current.value)
  loop()
})
watch(current, show)
onUnmounted(() => cancelAnimationFrame(raf))
</script>

<style scoped lang="sass">
.lab
  position: fixed
  inset: 0
.host
  position: absolute
  inset: 0
  :deep(canvas)
    width: 100%
    height: 100%
    display: block
.bar
  position: absolute
  left: 8px
  top: 8px
  display: flex
  gap: 6px
  button
    padding: 4px 10px
    background: #1f2a44
    color: #fff
    border-radius: 6px
    &.on
      background: #3cc8ff
      color: #000
</style>
