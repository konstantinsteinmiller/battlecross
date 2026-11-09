<template lang="pug">
  div.mini(v-if="dots.length" role="img" :aria-label="t('hud.minimap')" :style="{ '--ratio': ratio }" data-town-minimap)
    //- The bare layout of the town: its houses and walls, drawn once from the sim's grid.
    canvas.mini__map(ref="canvasEl" aria-hidden="true")
    span.mini__dot(
      v-for="d in dots"
      :key="d.id"
      :class="[`mini__dot--${d.kind}`, { 'has-skill': !!d.skill }]"
      :style="{ left: `${d.x}%`, top: `${d.y}%`, '--c': d.color }"
    )
      //- A teacher wears the emblem of the class they teach.
      SkillIcon.mini__skill(v-if="d.skill" :id="d.skill")
      GameIcon(v-else :name="d.icon")
    i.mini__hero(ref="heroEl" aria-hidden="true")
</template>

<script setup lang="ts">
/**
 * A small map of the town (#167): the town's houses and walls, an icon where
 * each trader, smith, healer, alchemist and elder stands, and the emblem of
 * the class a teacher teaches (the class's first skill, in its colour), so the
 * right teacher is found at a glance. A dot is the hero. The layout is painted
 * once when the place changes; the icons are rebuilt when a conversation ends;
 * the hero's dot moves from the HUD ticker, never through Vue.
 */
import { nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { addHudTicker } from '@/game/state/hud'
import { flow, npcById } from '@/game/flow'
import { currentZone } from '@/game/boot'
import { CELL, isSolidAt } from '@/game/sim/grid'
import { dialogWorld, npcPin, type NpcPin } from '@/game/talk'
import { CLASSES, skillsOf } from '@/game/data/skills'
import type { GameIconName } from '@/components/icons/iconNames'
import GameIcon from '@/components/icons/GameIcon.vue'
import SkillIcon from '@/components/art/SkillIcon.vue'

const { t } = useI18n()

interface Dot { id: string; kind: NpcPin; icon: GameIconName; skill: string; color: string; x: number; y: number }
const dots = shallowRef<Dot[]>([])
const ratio = ref(1)
const heroEl = ref<HTMLElement | null>(null)
const canvasEl = ref<HTMLCanvasElement | null>(null)

const ICON: Record<NpcPin, GameIconName | null> = { quest: 'chat', shop: 'anvil', trainer: 'book', healer: 'heart', alchemist: 'flask', gambler: 'coin', talk: null }

/** Paint the town's solid ground (houses, walls, stones) over its paths. */
const paint = (): void => {
  const zone = currentZone()
  const cv = canvasEl.value
  if (!zone || !cv) return
  const g = zone.sim.grid
  const px = 4 * Math.min(3, Math.max(1, Math.round(window.devicePixelRatio || 1)))
  cv.width = g.w * px
  cv.height = g.h * px
  const ctx = cv.getContext('2d')
  if (!ctx) return
  const css = getComputedStyle(cv)
  const ground = css.getPropertyValue('--bc-paper-lo').trim() || 'rgb(230, 210, 170)'
  const solid = css.getPropertyValue('--bc-paper-ink').trim() || 'rgb(80, 60, 40)'
  ctx.fillStyle = ground
  ctx.fillRect(0, 0, cv.width, cv.height)
  ctx.fillStyle = solid
  ctx.globalAlpha = 0.55
  for (let j = 0; j < g.h; j++) {
    for (let i = 0; i < g.w; i++) {
      if (isSolidAt(g, (i + 0.5) * CELL, (j + 0.5) * CELL)) ctx.fillRect(i * px, j * px, px, px)
    }
  }
  ctx.globalAlpha = 1
}

let seen: unknown = null
const rebuild = (): void => {
  const zone = currentZone()
  const placeChanged = zone !== seen
  seen = zone
  const out: Dot[] = []
  if (zone && zone.setup.kind === 'town') {
    const g = zone.sim.grid
    ratio.value = g.h / g.w
    const w = dialogWorld()
    for (const u of zone.sim.units) {
      const def = u.npc ? npcById(u.npc) : null
      if (!def) continue
      const pin = npcPin(def, w)
      const trains = pin.kind === 'trainer' && def.cls ? skillsOf(def.cls)[0] : undefined
      const icon = pin.kind === 'shop' && def.stock && def.stock.slots.every(s => s === 'trinket') ? 'gem' : ICON[pin.kind]
      // Folk with no trade, and masters not yet earned, are not on the map.
      if (!icon) continue
      out.push({
        id: def.id, kind: pin.kind, icon, skill: trains?.id ?? '', color: def.cls ? CLASSES[def.cls].color : '',
        x: (100 * u.x) / (g.w * CELL), y: (100 * u.z) / (g.h * CELL)
      })
    }
  }
  dots.value = out
  if (placeChanged) void nextTick(paint)
}

let remove: (() => void) | null = null
onMounted(() => {
  rebuild()
  remove = addHudTicker(() => {
    const zone = currentZone()
    if (zone !== seen) rebuild()
    const hero = zone?.sim.hero?.unit
    const el = heroEl.value
    if (!zone || !hero || !el) return
    const g = zone.sim.grid
    el.style.left = `${(100 * hero.x) / (g.w * CELL)}%`
    el.style.top = `${(100 * hero.z) / (g.h * CELL)}%`
  })
})
onUnmounted(() => remove?.())
watch(() => [flow.talk, flow.modal], ([talking, modal]) => { if (!talking && !modal) rebuild() })
</script>

<style scoped lang="sass">
.mini
  --size: clamp(98px, 30vmin, 188px)
  // Icons are a fixed size (never a share of the map's width and height, which stretched them on a wide town).
  --dot: clamp(11px, calc(var(--size) * 0.1), 22px)
  position: relative
  box-sizing: border-box
  width: var(--size)
  height: calc(var(--size) * var(--ratio, 1))
  margin: calc(clamp(0.2rem, 1vmin, 0.5rem) * var(--hud-s, 1)) 0 0
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-md, 10px)
  background: var(--bc-paper-lo)
  box-shadow: var(--bc-drop)
  color: var(--bc-paper-ink)
  pointer-events: none
  overflow: hidden
.mini__map
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  image-rendering: pixelated
.mini__dot
  position: absolute
  display: grid
  place-items: center
  width: var(--dot)
  height: var(--dot)
  transform: translate(-50%, -50%)
  border: 1.5px solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-blue)
  color: var(--bc-paper-hi)
  > :deep(svg), > :deep(img)
    width: 68%
    height: 68%
  // A teacher: the class's emblem fills the whole dot, in the class's colour.
  &.has-skill
    width: calc(var(--dot) * 1.15)
    height: calc(var(--dot) * 1.15)
    border-color: var(--c)
    background: var(--c)
    > :deep(*)
      width: 100%
      height: 100%
.mini__dot--quest
  background: var(--bc-gold)
  color: var(--bc-ink)
.mini__dot--healer
  background: var(--bc-red)
.mini__dot--alchemist
  background: var(--bc-green)
.mini__dot--gambler
  background: var(--bc-gold-deep)
.mini__hero
  position: absolute
  width: calc(var(--dot) * 0.55)
  height: calc(var(--dot) * 0.55)
  transform: translate(-50%, -50%)
  border: 1.5px solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-green)
  box-shadow: 0 0 0 2px var(--bc-green-hi)
</style>
