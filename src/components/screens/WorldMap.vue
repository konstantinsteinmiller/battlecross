<template lang="pug">
  div.wmap(
    :class="{ 'is-paused': isGamePaused, 'is-rushing': rushing, 'is-moving': moving, 'is-alarm': alarm, 'wmap--low': low, 'wmap--tiny': scale < 0.47 }"
    @pointerdown.capture="skipWalk"
  )
    div.wmap__top
      div.wmap__hero-chip
        span.wmap__face
          Portrait(look="hero")
        span.wmap__who
          span.wmap__level {{ t('hud.level', { n: profile.level }) }}
          span.wmap__gold(@pointerdown="registerQaAdTap()")
            IconCoin.wmap__coin
            | {{ fmt(profile.gold) }}
      //- The title, and under it the next goal (roadmap #2).
      div.wmap__head
        h1.wmap__title {{ t('map.title') }}
        GoalTracker.wmap__goal
      HudMenu(@options="emit('options')")
    //- The table the sheet lies on. The sheet is always drawn whole, at one
    //- scale: where the screen is too small for it, the table scrolls.
    div.wmap__sheet(
      ref="sheet"
      dir="ltr"
      :class="{ 'is-pannable': pannable, 'is-dragging': dragging }"
      @pointerdown="dragStart"
      @click.capture="dragClick"
    )
      div.wmap__paper(:style="{ '--u': `${scale}px` }")
        span.wmap__shade(aria-hidden="true")
        div.wmap__world
          //- Everything on the sheet, inside its margin: a plain rectangle, so the
          //- torn edge costs nothing while things move.
          div.wmap__clip
            div.wmap__map(ref="mapEl" @click.self="walkToPoint")
              img.wmap__plate(v-if="painted" :src="painted" alt="" draggable="false")
              canvas.wmap__plate(v-else ref="plateEl")
              //- The travelled roads, over the worn beds the plate carries.
              svg.wmap__layer.wmap__roads(:viewBox="VIEW" aria-hidden="true" focusable="false")
                g(v-for="r in roads" :key="r.key")
                  template(v-if="r.open")
                    path.road__case(:d="r.d")
                    path.road__way(:d="r.d")
                    path.road__step(:d="r.d")
                g(v-html="bridges")
              svg.wmap__layer.wmap__decor(:viewBox="VIEW" aria-hidden="true" focusable="false" v-html="decor")
              span.region(
                v-for="r in MAP_REGIONS"
                :key="r.id"
                :class="{ 'region--sea': r.sea }"
                :style="{ left: `${r.x / 16}%`, top: `${r.y / 9}%`, '--rot': `${r.rot}deg` }"
                aria-hidden="true"
              ) {{ t(`map.region.${r.id}`) }}
              //- The fog over the land of places not open yet: he cannot walk into it.
              canvas.wmap__fog(ref="fogEl" aria-hidden="true")
              //- Where he was sent, and the way he takes.
              svg.wmap__layer.wmap__trail(v-if="trail" :viewBox="VIEW" aria-hidden="true" focusable="false")
                path(:d="trail")
              span.wmap__dest(v-if="dest" aria-hidden="true" :style="{ left: `${dest[0] / 16}%`, top: `${dest[1] / 9}%` }")
              span.wmap__foot(v-for="i in FEET" :key="'f' + i" ref="feetEls" aria-hidden="true")
              span.wmap__dust(v-for="i in DUSTS" :key="'d' + i" ref="dustEls" aria-hidden="true")
              button.node(
                v-for="n in nodes"
                :key="n.id"
                type="button"
                :data-node="n.id"
                :class="[`node--${n.kind}`, { 'is-locked': !n.open, 'is-cleared': n.cleared, 'is-here': n.here, 'is-selected': selected === n.id, 'is-next': n.open && !n.cleared, 'is-veiled': n.veil === 'wait', 'is-lifting': n.veil === 'lift', 'is-fresh': n.fresh }]"
                :style="{ left: `${n.x}%`, top: `${n.y}%` }"
                :aria-label="t(`node.${n.id}.name`)"
                @click="pick(n.id)"
              )
                svg.node__ring(viewBox="0 0 100 100" aria-hidden="true" focusable="false")
                  ellipse(cx="50" cy="81" rx="45" ry="19")
                svg.node__art(viewBox="0 0 100 100" aria-hidden="true" focusable="false" v-html="n.art")
                svg.node__clouds(v-if="n.clouds" viewBox="0 0 100 100" aria-hidden="true" focusable="false" v-html="n.clouds")
                span.node__lock(v-if="!n.open" aria-hidden="true")
                  GameIcon(name="lock")
                span.node__badge.node__badge--done(v-if="n.cleared && n.kind !== 'town'" aria-hidden="true")
                  GameIcon(name="check")
                span.node__badge.node__badge--quest(v-else-if="n.decision" aria-hidden="true")
                  GameIcon(name="chat")
                span.node__badge.node__badge--trainer(v-if="n.trainer" aria-hidden="true")
                  GameIcon(name="book")
                span.node__skulls(v-if="n.open && n.danger > 0" aria-hidden="true")
                  GameIcon(v-for="k in n.danger" :key="k" name="skull")
                span.node__spark(v-if="n.fresh" aria-hidden="true")
                span.node__label
                  span.node__new(v-if="n.isNew") {{ t('map.new') }}
                  //- A town and the colosseum say what they are; a zone is the default.
                  GameIcon.node__kind(v-if="n.kind !== 'zone'" :name="n.kind === 'town' ? 'home' : 'trophy'")
                  | {{ t(`node.${n.id}.name`) }}
              //- What was met instead of a fight: a chest at his feet, a merchant beside him.
              div.wmap__find(v-if="find" aria-hidden="true" :class="[`wmap__find--${find.kind}`, { 'is-open': find.open }]" :style="{ '--hx': find.x, '--hy': find.y }")
                GameIcon(v-if="find.kind === 'chest'" name="chest")
                Portrait(v-else look="peddler")
                span.wmap__gain(v-for="(g, k) in gains" :key="g.id" :style="{ '--k': k }") {{ g.text }}
              //- The hero: walks wherever he is steered, faces the way he goes.
              div.wmap__hero(ref="heroEl" aria-hidden="true")
                span.wmap__hero-shadow
                span.wmap__hero-body
                  Portrait(look="hero")
                span.wmap__alert(v-if="alarm") !
              //- The sky: each cloud and each flight of birds is moved as its own layer.
              div.wmap__layer.wmap__sky(aria-hidden="true")
                span.sky-cloud(
                  v-for="(c, i) in SKY_CLOUDS"
                  :key="i"
                  :class="`sky-cloud--${i}`"
                  :style="{ top: `${c.y / 9}%`, '--k': c.k, animationDuration: `${c.secs}s`, animationDelay: `${c.start}s` }"
                )
                  svg(viewBox="-40 -40 80 44" focusable="false" v-html="skyCloud")
                span.sky-birds.sky-birds--0
                  svg(viewBox="-60 -36 76 72" focusable="false" v-html="birds5")
                span.sky-birds.sky-birds--1
                  svg(viewBox="-60 -36 76 72" focusable="false" v-html="birds3")
          svg.wmap__layer.wmap__frame(:viewBox="VIEW" aria-hidden="true" focusable="false" v-html="frame")
    div.wmap__bottom
      FButton(v-if="canReturn" :label="t('map.back')" type="secondary" size="sm" icon="back" icon-position="left" @click="closeMap")
      MenuButtons(board)
    Transition(name="hint")
      span.wmap__skip(v-if="rushing") {{ t('map.skip') }}
    Transition(name="hint")
      span.wmap__skip.wmap__hint(v-if="hint && !rushing && !showCard") {{ t(touch ? 'map.walkTouch' : 'map.walkMouse') }}
    //- Steering on a touch screen: a stick in the corner of the sheet.
    div.mstick(v-if="touch" aria-hidden="true" :class="{ 'is-on': stick.on }" @pointerdown.prevent="stickDown")
      span.mstick__knob(:style="{ transform: `translate(${stick.x * 72}%, ${stick.y * 72}%)` }")
    //- The beat before an encounter.
    span.wmap__flash(v-if="alarm" aria-hidden="true")
    //- The picked place.
    Transition(name="card")
      //- Docked away from the picked place, so it never covers it.
      div.card(v-if="showCard && sel" :key="sel.id" :class="{ 'card--top': !side && cardTop, 'card--side': side, 'card--left': side && sel.x > 50 }")
        button.card__close(type="button" :aria-label="t('close')" @click="selected = ''")
          GameIcon(name="close")
        div.card__head
          h2.card__name {{ t(`node.${sel.id}.name`) }}
          span.card__meta(v-if="sel.zone") {{ t('map.levels', { min: sel.zone.min, max: sel.zone.max }) }}
          span.card__meta(v-else-if="sel.kind === 'arena'") {{ t('map.arenaBest', { n: profile.world.arenaBest }) }}
          span.card__meta(v-else) {{ t('map.town') }}
        p.card__desc {{ t(`node.${sel.id}.desc`) }}
        p.card__warn(v-if="sel.open && sel.danger > 0")
          GameIcon.card__skull(v-for="k in sel.danger" :key="k" name="skull")
          | {{ t(`map.danger.${sel.danger}`) }}
        div.card__drops(v-if="drops.length")
          span.card__drop(v-for="d in drops" :key="d.id" :class="{ owned: d.owned }" :title="t(`item.${d.id}.name`)")
            ItemIcon(:id="d.id" :dim="!d.owned")
        p.card__quest(v-if="questLine") {{ questLine }}
        div.card__actions
          FButton(v-if="trainer" :label="t('map.trainer', { cls: t(`class.${trainer.cls}.name`) })" type="secondary" size="sm" icon="book" @click="visitHiddenTrainer(sel.id)")
          FButton(v-if="sel.open" :label="t(sel.kind === 'town' ? 'map.enter' : sel.kind === 'arena' ? 'map.fight' : sel.cleared ? 'map.again' : 'map.travel')" type="success" size="md" :icon="sel.kind === 'town' ? 'home' : 'sword'" attention @click="go(sel.id)")
          p.card__locked(v-else)
            GameIcon.card__lock(name="lock")
            | {{ t(sel.id === 'arena' ? 'map.lockedArena' : sel.id === 'rift' ? 'map.lockedRift' : 'map.locked') }}
</template>

<script setup lang="ts">
/**
 * The world map (GDD §3.1): a drawn sheet of the realm with every zone, town
 * and the colosseum on it. A place opens when a neighbour has been cleared;
 * nothing is level-gated — skulls warn how far above the hero a zone starts,
 * and the player may walk in anyway.
 *
 * The sheet is built from `screens/map/`: the terrain plate (one SVG image, or
 * the painted `images/ui/map.webp` in its place), the roads, a landmark per
 * place and what lives round them. The places are real buttons laid over it.
 * A place not reached yet lies under cloud, which parts the first time its
 * road opens.
 *
 * The hero walks the sheet freely (roadmap #67, after Battleheart Legacy):
 * steered with WASD / the arrows or the stick, or sent to a spot with a click
 * or a tap; a tap on a place walks him there. The ground he may walk is the
 * walk mask (`map/walk.ts`): no sea, no mountain wall, no fog over a place
 * not open yet; roads are quicker. Reaching a place opens its card. Off the
 * roads (and now and then on them) something may jump out
 * (`data/encounters.ts`): a fight in the region, a chest, a merchant.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { MAP, NODE_BY_ID, ZONES, dangerOf, nodeOpen, type NodeId } from '@/game/data/zones'
import { itemsOfZone, type ZoneId } from '@/game/data/items'
import { QUEST_BY_ID } from '@/game/data/quests'
import { encountersAllowed, regionOf, rollEncounter, type EncounterSpec } from '@/game/data/encounters'
import { profile, flagSet, markTip, saveProfile, setMapPos } from '@/game/state/profile'
import { closeMap, flow, hiddenTrainer, meetMerchant, openFoundChest, startEncounter, travel, visitHiddenTrainer } from '@/game/flow'
import { hud } from '@/game/state/hud'
import { input } from '@/game/boot'
import { UI_ART } from '@/game/assets/overrides'
import { sceneQuality } from '@/game/engine/quality'
import { sfx } from '@/game/audio/sfx'
import { registerQaAdTap } from '@/use/useQaAdTrigger'
import { isGamePaused } from '@/use/useGamePause'
import { fmt } from '@/utils/format'
import GameIcon from '@/components/icons/GameIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import HudMenu from '@/components/hud/HudMenu.vue'
import MenuButtons from '@/components/hud/MenuButtons.vue'
import { MAP_H, MAP_W, type Pt } from './map/geo'
import { ROADS, nodeAt } from './map/roads'
import { mapBridgesSvg, mapPlateUrl } from './map/terrain'
import { cloudCover, landmarkSvg } from './map/landmarks'
import { MAP_REGIONS, SKY_CLOUDS, birdsSvg, decorSvg, frameSvg, skyCloudSvg, tearClip } from './map/life'
import { GH, GW, findPath, fogCells, nearestWalkable, stepWalk, walkMask } from './map/walk'
import { mapClock } from './map/session'
import GoalTracker from '@/components/hud/GoalTracker.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
const { t } = useI18n()

/** The terrain drawing, decoded once for every visit to the map. */
let plateLoad: Promise<HTMLImageElement> | null = null
const plateImage = (): Promise<HTMLImageElement> => (plateLoad ||= new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => { plateLoad = null; reject(new Error('the map plate did not load')) }
  img.src = mapPlateUrl()
}))

const VIEW = `0 0 ${MAP_W} ${MAP_H}`
/** The painted sheet, when there is one (`images/ui/map.webp`). */
const painted = UI_ART.get('map') ?? ''
const low = sceneQuality() === 'low'
const calm = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const decor = computed(() => decorSvg({ title: t('gameName'), compass: [t('map.compass.n'), t('map.compass.e'), t('map.compass.s'), t('map.compass.w')] }))
const bridges = mapBridgesSvg()
const skyCloud = skyCloudSvg()
const birds5 = birdsSvg(5)
const birds3 = birdsSvg(3)
const frame = frameSvg()
const tear = tearClip()
const CLOUDS_NEAR = cloudCover(false)
const CLOUDS_FAR = cloudCover(true)

const selected = ref<NodeId | ''>('')
/** The picked place's card is up (a place is picked first, its card shows when he gets there). */
const cardOpen = ref(false)
const cleared = computed(() => new Set(profile.world.cleared))
const flags = computed(() => flagSet())
const isOpen = (id: NodeId): boolean => nodeOpen(id, cleared.value, flags.value)

// ── Cloud cover ──────────────────────────────────────────────────────────────
// A place the player has seen open keeps no cloud. Remembered among the save's
// one-time flags, so the cloud parts once per place, ever.
const seenKey = (id: NodeId): string => `mapSeen.${id}`
/** Places whose cloud is parting on this visit: waiting their turn, or lifting. */
const veil = reactive(new Map<NodeId, 'wait' | 'lift'>())
/** Places that opened on this visit: they sparkle. */
const fresh = reactive(new Set<NodeId>())
const timers: number[] = []
const later = (ms: number, fn: () => void): void => { timers.push(window.setTimeout(fn, ms)) }

const unveil = (): void => {
  // The two places a new save starts with were never under cloud.
  const todo = MAP.map(n => n.id).filter(id => id !== 'sunford' && id !== 'plains' && isOpen(id) && !profile.tips[seenKey(id)])
  if (!todo.length) return
  for (const id of todo) profile.tips[seenKey(id)] = true
  saveProfile()
  if (calm) { for (const id of todo) fresh.add(id); return }
  todo.forEach((id, i) => {
    veil.set(id, 'wait')
    later(700 + i * 380, () => {
      veil.set(id, 'lift')
      if (i < 3) sfx('uiPoint')
      later(820, () => { veil.delete(id); fresh.add(id) })
    })
  })
}

// ── The places ───────────────────────────────────────────────────────────────
interface NodeView {
  id: NodeId
  kind: 'zone' | 'town' | 'arena'
  x: number
  y: number
  open: boolean
  cleared: boolean
  here: boolean
  danger: number
  /** A major decision still waits at the end of this zone. */
  decision: boolean
  /** A hidden trainer is found here. */
  trainer: boolean
  /** Open and never entered. */
  isNew: boolean
  fresh: boolean
  veil: 'wait' | 'lift' | ''
  art: string
  clouds: string
  zone?: (typeof ZONES)[ZoneId]
}

/** The place the hero stands at ('' out in the wilds). */
const hereNode = ref<NodeId | ''>('')

const nodes = computed<NodeView[]>(() => MAP.map((n) => {
  const zone = n.kind === 'zone' ? ZONES[n.id as ZoneId] : undefined
  const open = isOpen(n.id)
  const done = cleared.value.has(n.id)
  const state = veil.get(n.id) ?? ''
  // A place with an open road to it shows through thin cloud; the far ones lie deep.
  const near = n.links.some(l => NODE_BY_ID[l] && isOpen(l))
  return {
    id: n.id,
    kind: n.kind,
    x: n.at[0] * 100,
    y: n.at[1] * 100,
    open,
    cleared: done,
    here: hereNode.value === n.id,
    danger: zone ? dangerOf(zone, profile.level) : 0,
    decision: open && !!n.quest && !!QUEST_BY_ID[n.quest] && !profile.quests.done[n.quest],
    trainer: !!hiddenTrainer(n.id),
    isNew: open && !done && !state && !(profile.world.visits[n.id] ?? 0) && (n.kind !== 'arena' || profile.world.arenaBest === 0),
    fresh: fresh.has(n.id),
    veil: state,
    art: landmarkSvg(n.id, { locked: !open, ruined: n.id === 'oakhaven' && flags.value.has('oakhavenFallen') }),
    clouds: !open ? (near ? CLOUDS_NEAR : CLOUDS_FAR) : state ? CLOUDS_NEAR : '',
    zone
  }
}))

const sel = computed(() => nodes.value.find(n => n.id === selected.value) ?? null)
const drops = computed(() => {
  const s = sel.value
  if (!s?.zone) return []
  return itemsOfZone(s.zone.id).map(i => ({ id: i.id, owned: profile.inv.items.includes(i.id) }))
})
const trainer = computed(() => (sel.value ? hiddenTrainer(sel.value.id) : null))
const questLine = computed(() => {
  const q = sel.value ? NODE_BY_ID[sel.value.id]?.quest : undefined
  if (!q || !QUEST_BY_ID[q]) return ''
  const done = profile.quests.done[q]
  return done ? t('map.questDone', { quest: t(`quest.${q}.title`), choice: t(`quest.${q}.${done}.label`) }) : t('map.questOpen', { quest: t(`quest.${q}.title`) })
})
/** Back into the town the hero is standing in. */
const canReturn = computed(() => NODE_BY_ID[flow.node]?.kind === 'town')

const roads = computed(() => ROADS.map(r => ({ key: r.key, d: r.d, open: isOpen(r.a) && isOpen(r.b) })))

// ── The ground he may walk, and the fog over the rest ────────────────────────
const mask = computed(() => walkMask(isOpen))
const fogEl = ref<HTMLCanvasElement | null>(null)
/** Cells drawn per fog pixel block: the canvas is scaled up smooth (soft edges for free). */
const FOG_PX = 4
const drawFog = (): void => {
  const c = fogEl.value
  if (!c) return
  const cells = fogCells(isOpen)
  c.width = GW * FOG_PX
  c.height = GH * FOG_PX
  const g = c.getContext('2d')
  if (!g) return
  g.clearRect(0, 0, c.width, c.height)
  // A cloud bank: a blue-grey lip under a white top, both made of round puffs.
  for (const [dy, fill] of [[0.55, '#b9c8e6'], [0, '#f6f9ff']] as const) {
    g.fillStyle = fill
    g.beginPath()
    for (let k = 0; k < cells.length; k++) {
      if (!cells[k]) continue
      const x = ((k % GW) + 0.5) * FOG_PX
      const y = (Math.floor(k / GW) + 0.5 + dy) * FOG_PX
      // Each puff a little different, by its cell: no grid shows.
      const r = FOG_PX * (0.95 + ((k * 2654435761) >>> 28) / 40)
      g.moveTo(x + r, y)
      g.arc(x, y, r, 0, Math.PI * 2)
    }
    g.fill()
  }
}

// ── The drawn terrain ────────────────────────────────────────────────────────
// The plate is a large vector drawing. Left as an image it is drawn again,
// shape by shape, under everything that moves; baked once into a canvas at the
// size it is shown, a frame costs a copy of pixels.
const plateEl = ref<HTMLCanvasElement | null>(null)
let plateJob = 0
const bakePlate = async (): Promise<void> => {
  const job = ++plateJob
  const img = await plateImage()
  const c = plateEl.value
  if (!c || job !== plateJob) return
  const wide = MAP_W * scale.value
  // Device pixels, within reason: a 4K tablet does not need a 20 MB plate.
  const k = Math.min(window.devicePixelRatio || 1, low ? 1.5 : 2, 2600 / wide)
  const w = Math.max(1, Math.round(wide * k))
  const h = Math.max(1, Math.round(MAP_H * scale.value * k))
  if (c.width === w && c.height === h && c.dataset.baked) return
  c.width = w
  c.height = h
  c.getContext('2d')?.drawImage(img, 0, 0, w, h)
  c.dataset.baked = '1'
}

// ── The sheet on the table ───────────────────────────────────────────────────
const sheet = ref<HTMLElement | null>(null)
const mapEl = ref<HTMLElement | null>(null)
const heroEl = ref<HTMLElement | null>(null)
/** Screen px per sheet unit. */
const scale = ref(0.5)
const pannable = ref(false)
/** A short, wide screen (a phone on its side): the card stands BESIDE the picked place. */
const side = ref(false)
/** Smaller than this and the landmarks stop reading: fill the table and pan instead. */
const MIN_FIT = 0.5
const MAX_ZOOM = 1.05

const fit = (): void => {
  const el = sheet.value
  if (!el || !el.clientWidth || !el.clientHeight) return
  const w = el.clientWidth
  const h = el.clientHeight
  const contain = Math.min(w / MAP_W, h / MAP_H)
  const cover = Math.max(w / MAP_W, h / MAP_H)
  const s = contain >= MIN_FIT ? contain : Math.min(cover, MAX_ZOOM)
  scale.value = Math.round(s * 10000) / 10000
  pannable.value = MAP_W * s > w + 1 || MAP_H * s > h + 1
  side.value = window.innerHeight <= 520 && window.innerWidth > window.innerHeight * 1.2
}

/** Bring a spot of the sheet to the middle of the table (`fy`: how far down it). */
const centreOn = (p: Pt, fy = 0.5, smooth = false): void => {
  const el = sheet.value
  if (!el) return
  el.scrollTo({ left: p[0] * scale.value - el.clientWidth / 2, top: p[1] * scale.value - el.clientHeight * fy, behavior: smooth && !calm ? 'smooth' : 'auto' })
}

/** Keep the walking hero in the middle part of the table (cheap: two scroll writes). */
const follow = (p: Pt): void => {
  const el = sheet.value
  if (!el || !pannable.value) return
  const x = p[0] * scale.value - el.scrollLeft
  const y = p[1] * scale.value - el.scrollTop
  const bx = el.clientWidth * 0.3
  const by = el.clientHeight * 0.3
  if (x < bx) el.scrollLeft -= bx - x
  else if (x > el.clientWidth - bx) el.scrollLeft += x - (el.clientWidth - bx)
  if (y < by) el.scrollTop -= by - y
  else if (y > el.clientHeight - by) el.scrollTop += y - (el.clientHeight - by)
}

// Dragging the sheet with a mouse (a finger scrolls it natively).
const dragging = ref(false)
let drag: { x: number; y: number; left: number; top: number } | null = null
let swallowClick = false
const dragMove = (e: PointerEvent): void => {
  const el = sheet.value
  if (!drag || !el) return
  const dx = e.clientX - drag.x
  const dy = e.clientY - drag.y
  if (!dragging.value && Math.hypot(dx, dy) < 6) return
  dragging.value = true
  el.scrollLeft = drag.left - dx
  el.scrollTop = drag.top - dy
}
const dragEnd = (): void => {
  window.removeEventListener('pointermove', dragMove)
  window.removeEventListener('pointerup', dragEnd)
  window.removeEventListener('pointercancel', dragEnd)
  // The click that ends a drag is not a pick.
  swallowClick = dragging.value
  dragging.value = false
  drag = null
  if (swallowClick) window.setTimeout(() => { swallowClick = false }, 0)
}
const dragStart = (e: PointerEvent): void => {
  const el = sheet.value
  if (!el || e.pointerType !== 'mouse' || e.button !== 0 || !pannable.value) return
  drag = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop }
  window.addEventListener('pointermove', dragMove)
  window.addEventListener('pointerup', dragEnd)
  window.addEventListener('pointercancel', dragEnd)
}
const dragClick = (e: MouseEvent): void => {
  if (!swallowClick) return
  swallowClick = false
  e.stopPropagation()
  e.preventDefault()
}

// ── The hero on the map ──────────────────────────────────────────────────────
/** Where the hero stands at a place: in front of it, a step to the left. */
const REST: Pt = [-42, 14]
const restAt = (id: NodeId): Pt => { const p = nodeAt(id); return [p[0] + REST[0], p[1] + REST[1]] }
/** Sheet units a second, off the roads and on them. */
const SPEED_LAND = 150
const SPEED_ROAD = 235
/** On the way to a place the player chose to enter: brisk. */
const RUSH = 1.8
/** He is at a place within this of its spot. */
const ARRIVE = 62
/** Nothing jumps out this close to a place. */
const SAFE = 110

/** His spot on the sheet (sheet units), kept here and written to the save when he stops. */
const hero = { x: 0, y: 0, facing: 1 }
const moving = ref(false)
/** On the way to the place picked for travel (Travel walks him there first). */
const rushing = ref(false)
/** The spot he was sent to (a click, a tap), shown as a mark. */
const dest = ref<Pt | null>(null)
/** The way there, drawn as a trail. */
const trail = ref('')
let path: Pt[] | null = null
let pathI = 0
let onArrive: (() => void) | null = null
/** A place picked from afar: its card opens when he gets there. */
let pending: NodeId | '' = ''

const placeHero = (): void => {
  const el = heroEl.value
  if (!el) return
  el.style.setProperty('--hx', String(Math.round(hero.x * 10) / 10))
  el.style.setProperty('--hy', String(Math.round(hero.y * 10) / 10))
  el.style.setProperty('--face', String(hero.facing))
}
const keepPos = (): void => { setMapPos(hero.x / MAP_W, hero.y / MAP_H) }

const clearPath = (): void => {
  path = null
  pathI = 0
  onArrive = null
  dest.value = null
  trail.value = ''
}

/** Send him along the ground to a spot. False: there is no way there. */
const sendTo = (to: Pt, then: (() => void) | null = null): boolean => {
  const target = nearestWalkable(mask.value, to)
  if (!target) return false
  const way = findPath(mask.value, [hero.x, hero.y], target)
  if (!way) return false
  path = way
  pathI = 1
  onArrive = then
  dest.value = target
  trail.value = 'M' + way.map(p => `${Math.round(p[0])} ${Math.round(p[1])}`).join('L')
  return true
}

// ── Footprints and dust ──────────────────────────────────────────────────────
const FEET = 12
const DUSTS = 6
const feetEls = ref<HTMLElement[]>([])
const dustEls = ref<HTMLElement[]>([])
let footI = 0
let dustI = 0
let footSide = 1
let sinceFoot = 0
let sinceDust = 99
const mark = (el: HTMLElement | undefined, x: number, y: number, rot: number, frames: Keyframe[], ms: number): void => {
  if (!el || calm) return
  el.style.setProperty('--fx', String(Math.round(x)))
  el.style.setProperty('--fy', String(Math.round(y)))
  el.style.setProperty('--fr', `${Math.round(rot)}deg`)
  el.getAnimations().forEach(a => a.cancel())
  el.animate(frames, { duration: ms, easing: 'ease-out', fill: 'forwards' })
}
const footprint = (dx: number, dy: number): void => {
  const l = Math.hypot(dx, dy) || 1
  footSide = -footSide
  const ox = (-dy / l) * 4 * footSide
  const oy = (dx / l) * 4 * footSide
  mark(feetEls.value[footI++ % FEET], hero.x + ox, hero.y + oy, (Math.atan2(dy, dx) * 180) / Math.PI + 90,
    [{ opacity: 0.75 }, { opacity: 0.75, offset: 0.4 }, { opacity: 0 }], low ? 900 : 1800)
}
const dust = (): void => {
  if (low) return
  mark(dustEls.value[dustI++ % DUSTS], hero.x - hero.facing * 8, hero.y - 2, 0,
    [{ opacity: 0.8, transform: 'translate(calc(var(--u) * var(--fx)), calc(var(--u) * var(--fy))) scale(0.4)' },
      { opacity: 0, transform: 'translate(calc(var(--u) * var(--fx)), calc(var(--u) * (var(--fy) - 10))) scale(1.6)' }], 700)
}

// ── Steering by touch: a stick in the corner ─────────────────────────────────
const touch = computed(() => hud.device === 'touch')
const stick = reactive({ on: false, x: 0, y: 0, id: -1, cx: 0, cy: 0 })
const STICK_R = 44
const stickMove = (e: PointerEvent): void => {
  if (!stick.on || e.pointerId !== stick.id) return
  let dx = e.clientX - stick.cx
  let dy = e.clientY - stick.cy
  const l = Math.hypot(dx, dy)
  if (l > STICK_R) { dx = (dx / l) * STICK_R; dy = (dy / l) * STICK_R }
  stick.x = dx / STICK_R
  stick.y = dy / STICK_R
}
const stickUp = (e: PointerEvent): void => {
  if (e.pointerId !== stick.id) return
  stick.on = false
  stick.x = 0
  stick.y = 0
  stick.id = -1
}
const stickDown = (e: PointerEvent): void => {
  const el = e.currentTarget as HTMLElement
  const r = el.getBoundingClientRect()
  stick.on = true
  stick.id = e.pointerId
  stick.cx = r.left + r.width / 2
  stick.cy = r.top + r.height / 2
  el.setPointerCapture?.(e.pointerId)
  stickMove(e)
}

// ── Encounters ───────────────────────────────────────────────────────────────
/** When something jumps out; one clock for the whole session (a fight and back
 *  does not reset it). */
const clock = mapClock()
/** The beat before an encounter: the "!" over his head. */
const alarm = ref(false)
/** What was found instead of a fight: a chest at his feet, or a merchant beside him. */
const find = ref<{ kind: 'chest' | 'merchant'; x: number; y: number; open: boolean } | null>(null)
/** The floating "+gold" / "+XP" over a found chest. */
const gains = ref<Array<{ id: number; text: string }>>([])
let gainId = 0

const encounterSeed = (): number => (Math.imul(Math.round(hero.x), 73856093) ^ Math.imul(Math.round(hero.y), 19349663) ^ Math.imul(profile.stats.runs + 1, 83492791) ^ Math.round(clock.since * 1000)) >>> 0

const encounter = (): void => {
  const spec: EncounterSpec = rollEncounter(regionOf(mask.value.owner(hero.x, hero.y)), profile.level, encounterSeed())
  clearPath()
  selected.value = ''
  cardOpen.value = false
  pending = ''
  keepPos()
  saveProfile()
  alarm.value = true
  sfx('alert')
  later(calm ? 250 : 950, () => {
    alarm.value = false
    if (spec.kind === 'fight' || spec.kind === 'elite') { void startEncounter(spec); return }
    if (spec.kind === 'chest') {
      find.value = { kind: 'chest', x: hero.x + 26 * hero.facing, y: hero.y + 4, open: false }
      later(450, () => {
        if (!find.value) return
        find.value.open = true
        const r = openFoundChest(spec)
        sfx('chest')
        gains.value = [{ id: ++gainId, text: t('encounter.gold', { n: r.gold }) }, { id: ++gainId, text: t('encounter.xp', { n: r.xp }) }]
        later(1900, () => { find.value = null; gains.value = [] })
      })
      return
    }
    find.value = { kind: 'merchant', x: hero.x + 34 * hero.facing, y: hero.y, open: false }
    later(500, () => meetMerchant(spec))
  })
}
// The merchant goes on his way when his wares are closed.
watch(() => flow.modal, (m, was) => { if (was === 'shop' && !m && find.value?.kind === 'merchant') find.value = null })

// ── The walk, frame by frame ─────────────────────────────────────────────────
const hint = ref(false)
let frameId = 0
let lastT = 0
let stillFor = 0

const nearestPlace = (x: number, y: number): { id: NodeId; d: number } => {
  let best: NodeId = 'plains'
  let bd = Infinity
  for (const n of MAP) {
    const p = nodeAt(n.id)
    const d = Math.hypot(p[0] - x, p[1] - y)
    if (d < bd) { bd = d; best = n.id }
  }
  return { id: best, d: bd }
}

/** He came to a place (or left one): its card, the grace after leaving.
 *  `silent`: where he stands when the map opens (no card pops up). */
const notePlace = (silent = false): void => {
  const near = nearestPlace(hero.x, hero.y)
  const at: NodeId | '' = near.d < ARRIVE && isOpen(near.id) ? near.id : ''
  if (at === hereNode.value) return
  const was = hereNode.value
  hereNode.value = at
  if (was) {
    // Out of a place: a breath before the wilds answer.
    clock.calm()
    if (selected.value === was && !rushing.value) { cardOpen.value = false; selected.value = '' }
  }
  // Coming up to a place opens its card, unless he is on his way somewhere else.
  // (Not a place he is only passing on his way to a spot he was sent to.)
  if (at && !silent && !rushing.value && (pending ? pending === at : !path)) {
    keepPos()
    selected.value = at
    cardOpen.value = true
    pending = ''
    sfx('mapMove')
  }
}

const blocked = (): boolean => isGamePaused.value || !!flow.modal || !!flow.talk || flow.loading || alarm.value || !!find.value

/** DEV: what the walk is doing, for browser checks (folds out of a build). */
const debug = import.meta.env.DEV ? { frames: 0, blocked: false, hero, path: (): Pt[] | null => path, mask: () => mask.value } : null
if (debug && typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__wmap = debug

const tick = (now: number): void => {
  frameId = requestAnimationFrame(tick)
  if (debug) { debug.frames++; debug.blocked = blocked() }
  const dt = Math.min(0.05, lastT ? (now - lastT) / 1000 : 0)
  lastT = now
  if (blocked()) { if (moving.value) moving.value = false; return }
  let vx = 0
  let vy = 0
  const keys = input.keysMoving
  if (keys || (stick.on && Math.hypot(stick.x, stick.y) > 0.18)) {
    // Steering takes over from any errand.
    if (path) { clearPath(); pending = '' }
    vx = keys ? input.moveX : stick.x
    vy = keys ? -input.moveY : stick.y
  } else if (path) {
    const p = path[pathI]!
    const dx = p[0] - hero.x
    const dy = p[1] - hero.y
    const d = Math.hypot(dx, dy)
    if (d < 3) {
      if (++pathI >= path.length) {
        const done = onArrive
        clearPath()
        done?.()
      }
    } else { vx = dx / d; vy = dy / d }
  }
  const l = Math.hypot(vx, vy)
  let movedNow = false
  if (l > 0.01) {
    const k = Math.min(1, l)
    const ux = vx / l
    const uy = vy / l
    const onRoad = mask.value.road(hero.x, hero.y)
    const speed = (onRoad ? SPEED_ROAD : SPEED_LAND) * (rushing.value ? RUSH : 1) * k * dt
    // A step on the way never overshoots its turn.
    const cap = path ? Math.hypot(path[pathI]![0] - hero.x, path[pathI]![1] - hero.y) : Infinity
    const s = Math.min(speed, cap)
    const next = stepWalk(mask.value, [hero.x, hero.y], ux * s, uy * s)
    const moved = Math.hypot(next[0] - hero.x, next[1] - hero.y)
    if (moved > 0.01) {
      movedNow = true
      if (Math.abs(ux) > 0.2) hero.facing = ux < 0 ? -1 : 1
      hero.x = next[0]
      hero.y = next[1]
      sinceFoot += moved
      sinceDust += moved
      if (sinceFoot > 17) { sinceFoot = 0; footprint(ux, uy) }
      if (!onRoad && sinceDust > 46) { sinceDust = 0; dust() }
      placeHero()
      follow(next)
      if (!profile.tips.mapWalked) markTip('mapWalked')
      hint.value = false
    } else if (path) {
      // Stuck against something the straight line did not see: give up the errand.
      clearPath()
    }
  }
  if (movedNow !== moving.value) {
    if (movedNow) sinceDust = 99
    moving.value = movedNow
  }
  if (movedNow) {
    stillFor = 0
    notePlace()
  } else if ((stillFor += dt) > 0.6 && stillFor - dt <= 0.6) {
    // He stopped: the save learns where.
    keepPos()
    saveProfile()
  }
  // Something jumps out? Not near a place, not on the way to one he chose to
  // enter, and not before the first town has been reached.
  const near = nearestPlace(hero.x, hero.y)
  const allowed = encountersAllowed(profile.world.cleared) && !rushing.value && near.d > SAFE
  if (clock.step(dt, movedNow, mask.value.road(hero.x, hero.y), allowed)) encounter()
}

// ── Picking, walking, going ──────────────────────────────────────────────────
/** The card docks at the far end of the sheet from the picked place. */
const cardTop = computed(() => (sel.value ? sel.value.y > 52 : false))
const showCard = computed(() => !!sel.value && cardOpen.value)
/** How far down the table a place is brought with no card open. */
const cardless = 0.56

const pick = (id: NodeId): void => {
  if (rushing.value || alarm.value) return
  sfx('mapMove')
  // The same place again: its card closes (or, on the way there, nothing).
  if (selected.value === id) {
    if (cardOpen.value) { selected.value = ''; cardOpen.value = false }
    return
  }
  selected.value = id
  const p = nodeAt(id)
  const there = Math.hypot(p[0] - hero.x, p[1] - hero.y) < ARRIVE
  // A place not open shows why at once; an open one is walked to.
  if (!isOpen(id) || there || !sendTo(restAt(id), () => { keepPos(); if (selected.value === id) { cardOpen.value = true; pending = '' } })) {
    cardOpen.value = true
    pending = ''
  } else {
    cardOpen.value = false
    pending = id
  }
  if (cardOpen.value && pannable.value) centreOn(p, side.value ? 0.56 : (NODE_BY_ID[id]?.at[1] ?? 0) * 100 > 52 ? 0.74 : 0.3, true)
}

/** A click or a tap on open ground: walk there. */
const walkToPoint = (e: MouseEvent): void => {
  if (rushing.value || alarm.value || find.value) return
  const el = mapEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  const to: Pt = [((e.clientX - r.left) / r.width) * MAP_W, ((e.clientY - r.top) / r.height) * MAP_H]
  selected.value = ''
  cardOpen.value = false
  pending = ''
  if (!sendTo(to)) { sfx('denied'); return }
  sfx('mapMove')
}

/** A tap during the walk to a place being entered: there at once. */
let skipRush: (() => void) | null = null
const skipWalk = (): void => { if (rushing.value) skipRush?.() }

/** Travel: to the place's door first (brisk, and a tap skips it), then the veil. */
const go = async (id: NodeId): Promise<void> => {
  if (rushing.value || flow.loading) return
  cardOpen.value = false
  const p = nodeAt(id)
  if (Math.hypot(p[0] - hero.x, p[1] - hero.y) >= ARRIVE && !calm) {
    const arrived = await new Promise<boolean>((resolve) => {
      rushing.value = true
      if (!sendTo(restAt(id), () => resolve(true))) resolve(false)
      skipRush = () => {
        const r = restAt(id)
        hero.x = r[0]
        hero.y = r[1]
        placeHero()
        clearPath()
        resolve(true)
      }
    })
    rushing.value = false
    skipRush = null
    if (!arrived) { cardOpen.value = true; return }
  }
  selected.value = ''
  keepPos()
  await travel(id)
}

const onKey = (e: KeyboardEvent): void => {
  if (rushing.value) { skipWalk(); return }
  if (e.code === 'Escape' && selected.value) { selected.value = ''; cardOpen.value = false }
}
/**
 * Tab walks the focus from place to place here. In a fight it is the "next
 * target" key, and the game's key handler (on the window) cancels it: so the
 * map takes it first, on the way down, and lets the browser do the rest.
 */
const onTab = (e: KeyboardEvent): void => { if (e.code === 'Tab') e.stopPropagation() }

// The land opens as places open: the fog is drawn again after the cloud lifts.
watch(() => [...cleared.value].join() + [...flags.value].join(), () => { later(calm ? 0 : 1800, drawFog) })

let observer: ResizeObserver | null = null
onMounted(async () => {
  fit()
  // Where he was walking, or, back from a place, a step in front of it.
  const pos = profile.world.pos
  let start: Pt = [pos[0] * MAP_W, pos[1] * MAP_H]
  const near = nearestPlace(start[0], start[1])
  if (near.d < 2) start = restAt(near.id)
  if (!mask.value.ok(start[0], start[1])) start = nearestWalkable(mask.value, start, 20) ?? restAt(profile.world.at)
  hero.x = start[0]
  hero.y = start[1]
  placeHero()
  notePlace(true)
  // Back on the map from a visit: a breath before anything jumps out.
  clock.calm()
  if (!painted) void bakePlate().catch(() => {})
  drawFog()
  hint.value = !profile.tips.mapWalked
  await nextTick()
  centreOn(start, cardless)
  if (sheet.value && typeof ResizeObserver !== 'undefined') {
    observer = new ResizeObserver(() => {
      fit()
      if (!painted) void bakePlate().catch(() => {})
      void nextTick(() => centreOn(selected.value ? nodeAt(selected.value) : [hero.x, hero.y], cardless))
    })
    observer.observe(sheet.value)
  }
  window.addEventListener('keydown', onKey)
  window.addEventListener('keydown', onTab, true)
  window.addEventListener('pointermove', stickMove)
  window.addEventListener('pointerup', stickUp)
  window.addEventListener('pointercancel', stickUp)
  frameId = requestAnimationFrame(tick)
  unveil()
})
onBeforeUnmount(() => {
  keepPos()
  observer?.disconnect()
  plateJob++
  for (const id of timers) window.clearTimeout(id)
  cancelAnimationFrame(frameId)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('keydown', onTab, true)
  window.removeEventListener('pointermove', stickMove)
  window.removeEventListener('pointerup', stickUp)
  window.removeEventListener('pointercancel', stickUp)
  dragEnd()
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

// The map's own names for the interface tokens it is drawn with (`theme.sass`).
.wmap
  --m-ink: var(--bc-ink, #1b1626)
  --m-paper: var(--bc-paper, #f8e9c4)
  --m-paper-hi: var(--bc-paper-hi, #fff8e3)
  --m-paper-lo: var(--bc-paper-lo, #ecd3a0)
  --m-paper-ink: var(--bc-paper-ink, #45301f)
  --m-paper-ink-soft: var(--bc-paper-ink-soft, #7d5f41)
  --m-road: #f8e4aa
  --m-step: #b88a52
  --pad: clamp(0.5rem, 2.2vmin, 1rem)
  position: absolute
  inset: 0
  display: flex
  flex-direction: column
  padding: calc(env(safe-area-inset-top, 0px) + var(--pad)) calc(env(safe-area-inset-right, 0px) + var(--pad)) calc(env(safe-area-inset-bottom, 0px) + var(--pad)) calc(env(safe-area-inset-left, 0px) + var(--pad))
  gap: var(--pad)
  // The cartographer's table: walnut boards.
  background: repeating-linear-gradient(90deg, transparent 0 7.4rem, rgba(var(--bc-ink-rgb, 27, 22, 38), 0.35) 7.4rem 7.6rem), linear-gradient(180deg, var(--bc-wood, #523624) 0%, var(--bc-wood-lo, #3d2719) 62%, var(--bc-wood-deep, #28190f) 100%)
  font-family: var(--font-ui)
  color: var(--bc-text, #fff)
  user-select: none
  -webkit-user-select: none
.wmap__top
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto
  align-items: center
  gap: var(--pad)
.wmap__hero-chip
  display: flex
  align-items: center
  gap: 0.4rem
.wmap__face
  width: clamp(2.4rem, 10vmin, 3.4rem)
.wmap__who
  display: flex
  flex-direction: column
  font-size: clamp(0.72rem, 3vmin, 1rem)
  line-height: 1.15
  text-shadow: var(--bc-text-outline-thin, 0 2px 0 #1b1626)
.wmap__gold
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: var(--bc-text-gold, #ffe36a)
.wmap__coin
  width: 1em
  height: 1em
.wmap__head
  display: flex
  flex-direction: column
  align-items: center
  gap: 0.2rem
  min-width: 0
.wmap__goal
  max-width: 100%
.wmap__title
  max-width: 100%
  margin: 0
  text-align: center
  font-size: clamp(0.95rem, 4.4vmin, 1.7rem)
  line-height: 1.1
  text-shadow: var(--bc-text-outline, 0 3px 0 #1b1626)
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis

// ── The table and the sheet ──────────────────────────────────────────────────
.wmap__sheet
  position: relative
  flex: 1 1 auto
  min-height: 0
  display: flex
  overflow: auto
  overscroll-behavior: contain
  -webkit-overflow-scrolling: touch
  touch-action: pan-x pan-y
  scrollbar-width: none
  border-radius: clamp(0.5rem, 2.2vmin, 1rem)
  &::-webkit-scrollbar
    display: none
  // A sheet larger than the table is looked at through a window.
  // The edge is always there (clear on a table the sheet fits on), so the
  // table's size does not change with what is on it.
  border: var(--bc-ol, 3px) solid transparent
  &.is-pannable
    border-color: var(--m-ink)
    box-shadow: 0 var(--bc-press, 4px) 0 var(--m-ink)
    background: #56c4ea
    cursor: grab
  &.is-dragging
    cursor: grabbing
.wmap__paper
  position: relative
  flex: 0 0 auto
  margin: auto
  width: calc(var(--u) * 1600)
  height: calc(var(--u) * 900)
// The sheet's shadow on the table: the same torn outline, a step lower.
.wmap__shade
  position: absolute
  inset: 0
  transform: translateY(calc(var(--u) * 9))
  background: rgba(var(--bc-ink-rgb, 27, 22, 38), 0.55)
  clip-path: v-bind(tear)
.is-pannable .wmap__shade
  display: none
.wmap__world
  position: absolute
  inset: 0
// The tear bites at most 15 units into the sheet: clipped a unit inside that,
// nothing shows past the torn edge and no shape has to be cut along it.
.wmap__clip
  position: absolute
  inset: calc(var(--u) * 16)
  overflow: hidden
  border-radius: calc(var(--u) * 8)
.wmap__map
  position: absolute
  left: calc(var(--u) * -16)
  top: calc(var(--u) * -16)
  width: calc(var(--u) * 1600)
  height: calc(var(--u) * 900)
  background: #56c4ea
.wmap__plate, .wmap__layer
  position: absolute
  inset: 0
  display: block
  width: 100%
  height: 100%
  pointer-events: none
  user-select: none
  -webkit-user-drag: none
.wmap__layer
  overflow: hidden

// ── Roads ────────────────────────────────────────────────────────────────────
.wmap__roads path
  fill: none
  stroke-linecap: round
  stroke-linejoin: round
.road__case
  stroke: #2a1c30
  stroke-width: 14
.road__way
  stroke: var(--m-road)
  stroke-width: 9
// Footprints down the middle.
.road__step
  stroke: var(--m-step)
  stroke-width: 3
  stroke-dasharray: 0.1 11

// ── The lettering of the country ─────────────────────────────────────────────
.region
  position: absolute
  transform: translate(-50%, -50%) rotate(var(--rot))
  color: rgba(var(--bc-paper-ink-rgb, 69, 48, 31), 0.82)
  font-size: clamp(0.5rem, calc(var(--u) * 21), 1.3rem)
  letter-spacing: 0.16em
  text-transform: uppercase
  white-space: nowrap
  // Lettered on the paper: a pale halo keeps it readable over any terrain.
  text-shadow: 0 0.09em 0 rgba(255, 248, 227, 0.8), 0.09em 0 0 rgba(255, 248, 227, 0.8), -0.09em 0 0 rgba(255, 248, 227, 0.8), 0 -0.09em 0 rgba(255, 248, 227, 0.8), 0 0 0.4em rgba(255, 248, 227, 0.9)
  pointer-events: none
.region--sea
  color: rgba(255, 255, 255, 0.95)
  text-shadow: 0 0.09em 0 rgba(23, 63, 156, 0.5), 0.09em 0 0 rgba(23, 63, 156, 0.5), -0.09em 0 0 rgba(23, 63, 156, 0.5), 0 -0.09em 0 rgba(23, 63, 156, 0.5)
.wmap--tiny .region
  display: none

// ── A place ──────────────────────────────────────────────────────────────────
.node
  // Never under a finger's width, however small the sheet is drawn.
  --s: max(2.75rem, calc(var(--u) * 120))
  position: absolute
  z-index: 2
  width: var(--s)
  height: var(--s)
  // Its spot on the sheet is the landmark's foot: the box's 50 %, 80 %.
  margin: calc(var(--s) * -0.8) 0 0 calc(var(--s) * -0.5)
  padding: 0
  border: 0
  background: none
  color: inherit
  font: inherit
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transform-origin: 50% 80%
  transition: transform var(--bc-t-release, 320ms) var(--bc-ease-bounce, cubic-bezier(0.34, 1.7, 0.5, 1))
  &:hover, &:focus-visible, &.is-selected
    z-index: 3
  &:active
    transition-duration: var(--bc-t-press, 70ms)
    transform: scale(1.04, 0.92)
  &:focus
    outline: none
.is-rushing .node
  pointer-events: none
.node__ring, .node__art, .node__clouds
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  overflow: visible
  pointer-events: none
.node__ring ellipse
  fill: none
  stroke: var(--bc-white, #fff)
  stroke-width: 5
  opacity: 0
  transform-box: fill-box
  transform-origin: center
// Only where there is a pointer to hover with: on a touch screen the last
// place tapped would keep its ring.
@media (hover: hover)
  .node:hover .node__ring ellipse
    opacity: 0.7
.node:focus-visible .node__ring ellipse
  opacity: 1
  stroke-width: 7
.is-selected .node__ring ellipse
  opacity: 1
  stroke: var(--bc-gold-hi, #ffe978)
  stroke-width: 7
  animation: node-ring 1.1s steps(5) infinite alternate
// A place that is open and not done yet stirs.
.is-next .node__art
  animation: node-bob 2.6s ease-in-out infinite
.is-selected .node__art
  animation: node-bob 1.1s ease-in-out infinite
.is-lifting .node__art
  animation: node-pop 0.8s var(--bc-ease-pop, cubic-bezier(0.2, 1.4, 0.4, 1))

// What moves on a landmark (classes written by `map/landmarks.ts`). Drawn "on
// threes", like the cel animation it imitates: a part inside an SVG is painted
// again for every step it takes, and a few steps a second read as hand-made
// where sixty would only cost.
.node__art
  :deep(.lm-flag)
    transform-box: fill-box
    transform-origin: 0% 50%
    animation: lm-flag 0.9s steps(3) infinite alternate
  :deep(.lm-smoke)
    transform-box: fill-box
    transform-origin: center
    opacity: 0
    animation: lm-smoke 3.6s steps(14) infinite
  :deep(.lm-smoke--1)
    animation-delay: -1.2s
  :deep(.lm-smoke--2)
    animation-delay: -2.4s
  :deep(.lm-glow)
    animation: lm-glow 1.5s steps(4) infinite alternate
  :deep(.lm-glow--fire)
    transform-box: fill-box
    transform-origin: 50% 100%
    animation: lm-fire 0.44s steps(2) infinite alternate
  :deep(.lm-bob)
    animation: lm-bob 2.4s steps(6) infinite alternate

// Cloud over a place not reached: it drifts, and parts when the road opens.
.node__clouds
  opacity: 0.96
  :deep(.cl)
    animation: cl-drift 6s steps(8) infinite alternate
  :deep(.cl--b), :deep(.cl--d)
    animation-direction: alternate-reverse
    animation-duration: 7.5s
.is-lifting .node__clouds
  :deep(.cl)
    animation: cl-part 0.8s ease-in forwards
  :deep(.cl--a)
    --to: -70px, -8px
  :deep(.cl--b)
    --to: 70px, 4px
  :deep(.cl--c)
    --to: -20px, 46px
  :deep(.cl--d)
    --to: 40px, -50px

// The small signs on a place.
.node__lock, .node__badge
  position: absolute
  display: flex
  align-items: center
  justify-content: center
  width: max(1.05rem, 26%)
  aspect-ratio: 1
  border: var(--bc-ol-thin, 2px) solid var(--m-ink)
  border-radius: 50%
  box-shadow: 0 2px 0 var(--m-ink)
  color: var(--bc-white, #fff)
  pointer-events: none
  // The painted icon (an img) or the vector one.
  svg, img
    display: block
    width: 62%
    height: 62%
.node__lock
  left: 50%
  top: 58%
  transform: translate(-50%, -50%)
  +cel.tone('stone')
  +cel.fill(48%, 88%)
.node__badge
  right: 2%
  top: 18%
.node__badge--done
  +cel.tone('green')
  +cel.fill(48%, 88%)
.node__badge--quest
  +cel.tone('gold')
  +cel.fill(48%, 88%)
  animation: badge-nudge 1.6s ease-in-out infinite
.node__badge--trainer
  top: 46%
  right: -4%
  +cel.tone('blue')
  +cel.fill(48%, 88%)
.node__skulls
  position: absolute
  left: 0
  top: 20%
  display: flex
  gap: 1px
  padding: 0.1em 0.22em
  border: var(--bc-ol-thin, 2px) solid var(--m-ink)
  border-radius: var(--bc-r-pill, 999px)
  background: var(--bc-red, #ff5a4f)
  box-shadow: 0 2px 0 var(--m-ink)
  color: var(--bc-white, #fff)
  pointer-events: none
  svg, img
    width: max(0.56rem, calc(var(--s) * 0.15))
    height: max(0.56rem, calc(var(--s) * 0.15))
// A burst over a place that has just opened.
.node__spark
  position: absolute
  left: 50%
  top: 40%
  width: 150%
  aspect-ratio: 1
  margin: -75% 0 0 -75%
  background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0 8%, transparent 9%), conic-gradient(from 0deg, transparent 0 4%, rgba(255, 233, 120, 0.95) 5% 7%, transparent 8% 16%, rgba(255, 233, 120, 0.95) 17% 19%, transparent 20% 29%, rgba(255, 233, 120, 0.95) 30% 32%, transparent 33% 41%, rgba(255, 233, 120, 0.95) 42% 44%, transparent 45% 54%, rgba(255, 233, 120, 0.95) 55% 57%, transparent 58% 66%, rgba(255, 233, 120, 0.95) 67% 69%, transparent 70% 79%, rgba(255, 233, 120, 0.95) 80% 82%, transparent 83% 91%, rgba(255, 233, 120, 0.95) 92% 94%, transparent 95%)
  border-radius: 50%
  -webkit-mask: radial-gradient(circle, transparent 0 22%, #000 24% 60%, transparent 70%)
  mask: radial-gradient(circle, transparent 0 22%, #000 24% 60%, transparent 70%)
  opacity: 0
  pointer-events: none
  animation: node-spark 1s ease-out 1 both

// The name, on a slip of paper under the landmark.
.node__label
  position: absolute
  left: 50%
  top: 102%
  transform: translateX(-50%)
  width: max-content
  max-width: max(6.6rem, calc(var(--u) * 250))
  text-wrap: balance
  padding: 0.1em 0.5em 0.16em
  border: var(--bc-ol-thin, 2px) solid var(--m-ink)
  border-radius: var(--bc-r-sm, 0.55rem)
  background: var(--m-paper-hi)
  box-shadow: 0 2px 0 var(--m-ink)
  color: var(--m-paper-ink)
  font-size: clamp(0.58rem, calc(var(--u) * 21), 1.05rem)
  line-height: 1.1
  text-align: center
  pointer-events: none
.node__kind
  display: inline-block
  width: 0.92em
  height: 0.92em
  margin-inline-end: 0.28em
  vertical-align: -0.1em
.is-locked .node__label
  border-color: rgba(var(--bc-ink-rgb, 27, 22, 38), 0.55)
  background: #e6dfd3
  box-shadow: none
  color: var(--m-paper-ink-soft)
.is-here .node__label
  background: var(--bc-gold-hi, #ffe978)
.is-selected .node__label
  background: var(--bc-gold, #ffc526)
.node__new
  position: absolute
  left: -1.1em
  top: -1.4em
  padding: 0.05em 0.4em 0.1em
  border: var(--bc-ol-thin, 2px) solid var(--m-ink)
  border-radius: var(--bc-r-pill, 999px)
  background: var(--bc-pink, #f55ac6)
  color: var(--bc-white, #fff)
  font-size: 0.78em
  line-height: 1.1
  transform: rotate(-9deg)
  animation: badge-nudge 1.4s ease-in-out infinite

// ── The hero ─────────────────────────────────────────────────────────────────
.wmap__hero
  --h: max(2rem, calc(var(--u) * 62))
  --hx: 0
  --hy: 0
  position: absolute
  left: 0
  top: 0
  z-index: 4
  width: 0
  height: 0
  transform: translate(calc(var(--u) * var(--hx)), calc(var(--u) * var(--hy)))
  pointer-events: none
.wmap__hero-shadow
  position: absolute
  left: calc(var(--h) * -0.36)
  top: calc(var(--h) * -0.1)
  width: calc(var(--h) * 0.72)
  height: calc(var(--h) * 0.2)
  border-radius: 50%
  background: rgba(var(--bc-ink-rgb, 27, 22, 38), 0.4)
  animation: hero-shadow 1.5s ease-in-out infinite
.wmap__hero-body
  position: absolute
  left: calc(var(--h) * -0.5)
  bottom: 0
  width: var(--h)
  animation: hero-hop 1.5s ease-in-out infinite
  // He faces the way he walks (`--face`: 1 right, -1 left); the body's own
  // hop and walk are transforms of their own.
  :deep(.portrait)
    transform: scaleX(var(--face, 1))
    transition: transform 140ms ease-out
.is-moving
  .wmap__hero-body
    animation: hero-walk 0.3s ease-in-out infinite alternate
  .wmap__hero-shadow
    animation: none
// The "!" over his head: something jumps out.
.wmap__alert
  position: absolute
  --a: max(1.5rem, calc(var(--h) * 0.6))
  left: calc(var(--a) * -0.5)
  bottom: calc(var(--h) * 1.06)
  width: var(--a)
  height: calc(var(--a) * 1.25)
  display: flex
  align-items: center
  justify-content: center
  border: var(--bc-ol, 3px) solid var(--m-ink)
  border-radius: var(--bc-r-md, 0.8rem)
  background: var(--bc-red, #ff5a4f)
  box-shadow: 0 3px 0 var(--m-ink)
  color: var(--bc-white, #fff)
  font-size: calc(var(--a) * 0.9)
  font-weight: 900
  line-height: 1
  text-shadow: var(--bc-text-outline-thin, 0 2px 0 #1b1626)
  animation: alert-pop 0.42s var(--bc-ease-bounce, cubic-bezier(0.34, 1.7, 0.5, 1)) both
.is-alarm
  .wmap__hero-body
    animation: hero-startle 0.5s ease-out both
  .wmap__map
    animation: map-jolt 0.36s ease-out 0.1s both
// The beat: the edges of the screen flush red, once.
.wmap__flash
  position: absolute
  inset: 0
  z-index: 7
  pointer-events: none
  background: radial-gradient(ellipse at 50% 50%, transparent 46%, rgba(214, 44, 56, 0.5) 100%)
  animation: flash-beat 0.95s ease-out both

// Footprints and dust, laid where he walked (`mark` in the script).
.wmap__foot, .wmap__dust
  position: absolute
  left: 0
  top: 0
  z-index: 3
  opacity: 0
  pointer-events: none
.wmap__foot
  width: calc(var(--u) * 5)
  height: calc(var(--u) * 8)
  margin: calc(var(--u) * -4) 0 0 calc(var(--u) * -2.5)
  border-radius: 50% 50% 45% 45%
  background: rgba(92, 58, 34, 0.55)
  transform: translate(calc(var(--u) * var(--fx)), calc(var(--u) * var(--fy))) rotate(var(--fr))
.wmap__dust
  width: calc(var(--u) * 16)
  height: calc(var(--u) * 11)
  margin: calc(var(--u) * -9) 0 0 calc(var(--u) * -8)
  border: 2px solid rgba(var(--bc-ink-rgb, 27, 22, 38), 0.35)
  border-radius: 50%
  background: #f3e2bd
  transform: translate(calc(var(--u) * var(--fx)), calc(var(--u) * var(--fy)))

// The fog over places not open yet: a low cloud bank, scaled up soft.
.wmap__fog
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  opacity: 0.74
  pointer-events: none
  transition: opacity 600ms ease-out

// Where he is going, and the way.
.wmap__trail path
  fill: none
  stroke: var(--bc-gold-hi, #ffe978)
  stroke-width: 5
  stroke-linecap: round
  stroke-linejoin: round
  stroke-dasharray: 2 13
  filter: drop-shadow(0 1.5px 0 rgba(42, 28, 48, 0.75))
.wmap__dest
  position: absolute
  z-index: 3
  width: calc(var(--u) * 26)
  height: calc(var(--u) * 12)
  margin: calc(var(--u) * -6) 0 0 calc(var(--u) * -13)
  border: max(2px, calc(var(--u) * 3)) solid var(--bc-gold, #ffc526)
  border-radius: 50%
  box-shadow: 0 0 0 1px var(--m-ink), inset 0 0 0 1px var(--m-ink)
  pointer-events: none
  animation: dest-pulse 0.9s ease-in-out infinite alternate

// What was found: a chest that springs open, a merchant who steps up.
.wmap__find
  --h: max(1.7rem, calc(var(--u) * 46))
  position: absolute
  left: 0
  top: 0
  z-index: 4
  width: 0
  height: 0
  transform: translate(calc(var(--u) * var(--hx)), calc(var(--u) * var(--hy)))
  pointer-events: none
  > svg, > img.game-icon, > .portrait
    position: absolute
    max-width: none
    left: calc(var(--h) * -0.5)
    bottom: 0
    width: var(--h)
    height: var(--h)
    animation: find-pop 0.5s var(--bc-ease-bounce, cubic-bezier(0.34, 1.7, 0.5, 1)) both
  > svg, > img
    color: var(--bc-gold, #ffc526)
    filter: drop-shadow(0 2px 0 var(--m-ink)) drop-shadow(1px 0 0 var(--m-ink)) drop-shadow(-1px 0 0 var(--m-ink))
.wmap__find--chest.is-open > svg, .wmap__find--chest.is-open > img
  animation: chest-burst 0.5s var(--bc-ease-bounce, cubic-bezier(0.34, 1.7, 0.5, 1)) both
.wmap__gain
  position: absolute
  left: 50%
  bottom: calc(var(--h) * (1.1 + var(--k) * 0.55))
  transform: translateX(-50%)
  width: max-content
  color: var(--bc-text-gold, #ffe36a)
  font-size: max(0.8rem, calc(var(--u) * 22))
  text-shadow: var(--bc-text-outline, 0 2px 0 #1b1626)
  animation: gain-rise 1.8s ease-out both
  animation-delay: calc(var(--k) * 0.15s)

// The stick (touch screens): steer with the thumb in the sheet's corner.
.mstick
  position: absolute
  left: calc(env(safe-area-inset-left, 0px) + var(--pad) * 2)
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad) * 3 + clamp(2.9rem, 13vmin, 4rem))
  z-index: 6
  width: clamp(5.2rem, 22vmin, 7rem)
  aspect-ratio: 1
  border: var(--bc-ol, 3px) solid rgba(var(--bc-ink-rgb, 27, 22, 38), 0.7)
  border-radius: 50%
  background: radial-gradient(circle, rgba(255, 248, 227, 0.4) 0 55%, rgba(255, 248, 227, 0.22) 56% 100%)
  touch-action: none
  &.is-on
    background: radial-gradient(circle, rgba(255, 248, 227, 0.55) 0 55%, rgba(255, 248, 227, 0.32) 56% 100%)
.mstick__knob
  position: absolute
  left: 28%
  top: 28%
  width: 44%
  height: 44%
  border: var(--bc-ol, 3px) solid var(--m-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-paper-hi, #fff8e3) 0 46%, var(--bc-paper, #f8e9c4) 46% 86%, var(--bc-paper-lo, #ecd3a0) 86%)
  box-shadow: 0 3px 0 var(--m-ink)
  pointer-events: none
.wmap__hint
  max-width: min(86%, 26rem)
  text-align: center
.wmap__skip
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad) * 3 + clamp(2.9rem, 13vmin, 4rem))
  z-index: 6
  transform: translateX(-50%)
  padding: 0.2em 0.8em 0.26em
  border: var(--bc-ol-thin, 2px) solid var(--m-ink)
  border-radius: var(--bc-r-pill, 999px)
  background: rgba(var(--bc-ink-rgb, 27, 22, 38), 0.78)
  font-size: clamp(0.66rem, 2.6vmin, 0.86rem)
  pointer-events: none

// ── What lives on the sheet (classes written by `map/life.ts`) ───────────────
.sky-cloud, .sky-birds
  position: absolute
  left: 0
  top: 0
  will-change: transform
  svg
    display: block
    width: 100%
    overflow: visible
.sky-cloud
  width: calc(var(--u) * 80 * var(--k))
  opacity: 0.92
  animation: sky-drift 120s linear infinite
.sky-birds
  width: calc(var(--u) * 76)
.sky-birds--0
  animation: sky-fly-a 52s linear infinite
.sky-birds--1
  animation: sky-fly-b 68s linear -20s infinite
.wmap__decor, .wmap__sky
  :deep(.lf-spin)
    transform-origin: 0 0
    animation: lf-spin 9s steps(45) infinite
  :deep(.lf-bob)
    animation: lm-bob 2.2s steps(6) infinite alternate
  :deep(.lf-bob--slow)
    animation-duration: 3.1s
  :deep(.lf-fire)
    transform-origin: 0 0
    animation: lm-fire 0.44s steps(2) infinite alternate
  :deep(.lf-blink)
    animation: lf-blink 3.4s steps(8) infinite
  :deep(.lf-wave)
    opacity: 0
    animation: lf-wave 4.2s steps(12) infinite
  :deep(.lf-wave--1)
    animation-delay: -1.1s
  :deep(.lf-wave--2)
    animation-delay: -2.3s
  :deep(.lf-wave--3)
    animation-delay: -3.2s
  :deep(.lf-flap)
    transform-box: fill-box
    transform-origin: center
    animation: lf-flap 0.46s steps(2) infinite alternate
  :deep(.lf-flap--1)
    animation-delay: -0.15s
  :deep(.lf-flap--2)
    animation-delay: -0.3s
  :deep(.lf-text)
    fill: var(--m-paper-ink)
    font-family: var(--font-ui)
    font-size: 21px
  :deep(.lf-text--n)
    fill: var(--bc-red-lo, #d62c38)
    font-size: 28px
  :deep(.lf-text--title)
    fill: var(--bc-white, #fff)
    stroke: #2a1c30
    stroke-width: 5px
    stroke-linejoin: round
    paint-order: stroke
    font-size: 29px
    letter-spacing: 0.04em

.wmap__bottom
  display: flex
  align-items: center
  justify-content: space-between
  gap: var(--pad)
  min-height: clamp(2.9rem, 13vmin, 4rem)
  > :last-child
    margin-left: auto

// ── The picked place's card: a slip of parchment in a leather rim ────────────
.card
  --bc-on: var(--m-paper-ink)
  --bc-on-soft: var(--m-paper-ink-soft)
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad))
  transform: translateX(-50%)
  width: min(calc(100% - 2 * var(--pad)), 30rem)
  max-height: 62%
  overflow-y: auto
  padding: clamp(0.8rem, 3.2vmin, 1.2rem)
  border: var(--bc-ol-thick, 4px) solid var(--m-ink)
  border-radius: var(--bc-r-lg, 1.15rem)
  background: linear-gradient(180deg, var(--m-paper-hi) 0, var(--m-paper-hi) 0.9rem, var(--m-paper) 0.9rem, var(--m-paper) calc(100% - 0.8rem), var(--m-paper-lo) calc(100% - 0.8rem), var(--m-paper-lo) 100%)
  box-shadow: inset 0 0 0 0.3rem var(--bc-leather, #b8743a), inset 0 0 0 calc(0.3rem + 2px) var(--m-ink), 0 6px 0 var(--m-ink)
  color: var(--m-paper-ink)
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.4vmin, 0.55rem)
  z-index: 5
  +cel.scrollbar
.card__close
  +cel.tone('red')
  +cel.fill(48%, 88%)
  +cel.focus-ring
  position: absolute
  right: 0.6rem
  top: 0.6rem
  width: clamp(2rem, 8vmin, 2.5rem)
  height: clamp(2rem, 8vmin, 2.5rem)
  padding: 0.4rem
  border-radius: var(--bc-r-sm, 0.55rem)
  border: var(--bc-ol, 3px) solid var(--m-ink)
  box-shadow: 0 var(--bc-press-sm, 3px) 0 var(--m-ink)
  color: var(--bc-white, #fff)
  cursor: pointer
  svg
    display: block
    width: 100%
    height: 100%
.card__head
  display: flex
  flex-wrap: wrap
  align-items: baseline
  gap: 0.1rem 0.6rem
  padding-right: 2.8rem
.card__name
  margin: 0
  font-size: clamp(1.05rem, 4.6vmin, 1.5rem)
  line-height: 1.1
.card__meta
  color: var(--bc-gold-deep, #9a5206)
  font-size: clamp(0.78rem, 3.2vmin, 1rem)
.card__desc, .card__quest, .card__warn, .card__locked
  margin: 0
  font-size: clamp(0.78rem, 3.2vmin, 0.98rem)
  line-height: 1.3
.card__warn
  display: flex
  align-items: center
  gap: 0.2em
  color: var(--bc-red-lo, #d62c38)
.card__skull, .card__lock
  width: 1.1em
  height: 1.1em
  flex: 0 0 auto
.card__quest
  color: var(--bc-purple-deep, #461f96)
.card__drops
  display: flex
  flex-wrap: wrap
  gap: 0.35rem
.card__drop
  width: clamp(2rem, 8.6vmin, 2.7rem)
  &.owned
    filter: drop-shadow(0 0 0.25rem var(--bc-green-lo, #27a648))
.card__actions
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: flex-end
  gap: 0.5rem
  margin-top: 0.2rem
  // Room for the buttons' depth plates.
  padding-bottom: var(--bc-press, 4px)
.card__locked
  display: flex
  align-items: center
  gap: 0.4em
  color: var(--m-paper-ink-soft)
.card--top
  top: calc(env(safe-area-inset-top, 0px) + var(--pad) + clamp(3rem, 13vmin, 4.4rem))
  bottom: auto
  max-height: 46%
// On a short, wide screen there is no room above or below the picked place:
// the card takes the half of the screen it is not in, top to bottom.
.card--side
  left: auto
  right: calc(env(safe-area-inset-right, 0px) + var(--pad))
  top: calc(env(safe-area-inset-top, 0px) + var(--pad))
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad))
  transform: none
  width: min(46%, 23rem)
  max-height: none
  &.card--left
    left: calc(env(safe-area-inset-left, 0px) + var(--pad))
    right: auto
  .card__actions
    margin-top: auto
.card-enter-active, .card-leave-active
  transition: opacity 180ms ease-out, transform 220ms cubic-bezier(0.2, 1.3, 0.4, 1)
.card-enter-from, .card-leave-to
  opacity: 0
  transform: translateX(-50%) translateY(1.2rem)
.card--top.card-enter-from, .card--top.card-leave-to
  transform: translateX(-50%) translateY(-1.2rem)
.card--side.card-enter-from, .card--side.card-leave-to
  transform: translateX(1.2rem)
.card--side.card--left.card-enter-from, .card--side.card--left.card-leave-to
  transform: translateX(-1.2rem)
.hint-enter-active, .hint-leave-active
  transition: opacity 200ms ease-out
.hint-enter-from, .hint-leave-to
  opacity: 0

// ── Motion ───────────────────────────────────────────────────────────────────
@keyframes node-bob
  0%, 100%
    transform: translateY(0)
  50%
    transform: translateY(-3.5%)
@keyframes node-pop
  0%
    transform: scale(0.7)
  55%
    transform: scale(1.14)
  100%
    transform: scale(1)
@keyframes node-ring
  from
    transform: scale(1)
  to
    transform: scale(1.1)
@keyframes node-spark
  0%
    opacity: 0
    transform: scale(0.3) rotate(0deg)
  25%
    opacity: 1
  100%
    opacity: 0
    transform: scale(1.15) rotate(40deg)
@keyframes badge-nudge
  0%, 100%
    translate: 0 0
  50%
    translate: 0 -14%
@keyframes lm-flag
  from
    transform: skewY(-9deg) scaleX(0.84)
  to
    transform: skewY(7deg) scaleX(1)
@keyframes lm-smoke
  0%
    opacity: 0
    transform: translate(0, 0) scale(0.5)
  18%
    opacity: 0.95
  100%
    opacity: 0
    transform: translate(7px, -24px) scale(1.9)
@keyframes lm-glow
  from
    opacity: 0.5
  to
    opacity: 1
@keyframes lm-fire
  from
    transform: scale(1, 1)
  to
    transform: scale(0.9, 1.14)
@keyframes lm-bob
  from
    transform: translateY(0)
  to
    transform: translateY(-3.5px)
@keyframes cl-drift
  from
    transform: translateX(-2.5px)
  to
    transform: translateX(2.5px)
@keyframes cl-part
  to
    opacity: 0
    transform: translate(var(--to))
@keyframes hero-hop
  0%, 55%, 100%
    transform: translateY(0) scale(1, 1)
  66%
    transform: translateY(0) scale(1.06, 0.92)
  80%
    transform: translateY(-22%) scale(0.97, 1.04)
  92%
    transform: translateY(0) scale(1.05, 0.94)
@keyframes hero-shadow
  0%, 66%, 92%, 100%
    transform: scale(1)
  80%
    transform: scale(0.74)
@keyframes hero-walk
  from
    transform: translateY(0) rotate(-5deg)
  to
    transform: translateY(-12%) rotate(5deg)
@keyframes hero-startle
  0%
    transform: translateY(0) scale(1)
  30%
    transform: translateY(-34%) scale(0.92, 1.1)
  60%
    transform: translateY(0) scale(1.12, 0.88)
  100%
    transform: translateY(0) scale(1)
@keyframes alert-pop
  from
    opacity: 0
    transform: translateY(30%) scale(0.3)
  to
    opacity: 1
    transform: translateY(0) scale(1)
@keyframes map-jolt
  0%, 100%
    transform: translate(0, 0)
  25%
    transform: translate(-0.4%, 0.3%)
  50%
    transform: translate(0.35%, -0.25%)
  75%
    transform: translate(-0.2%, 0.15%)
@keyframes flash-beat
  0%
    opacity: 0
  20%
    opacity: 1
  100%
    opacity: 0
@keyframes dest-pulse
  from
    transform: scale(0.85)
  to
    transform: scale(1.1)
@keyframes find-pop
  from
    opacity: 0
    transform: translateY(40%) scale(0.2)
  to
    opacity: 1
    transform: translateY(0) scale(1)
@keyframes chest-burst
  0%
    transform: scale(1)
  40%
    transform: scale(1.35, 0.8)
  100%
    transform: scale(1)
    filter: drop-shadow(0 0 0.6rem rgba(255, 233, 120, 0.95))
@keyframes gain-rise
  0%
    opacity: 0
    translate: 0 40%
  15%
    opacity: 1
  100%
    opacity: 0
    translate: 0 -120%
@keyframes lf-spin
  to
    transform: rotate(360deg)
@keyframes lf-blink
  0%, 100%
    opacity: 0.15
  50%
    opacity: 0.75
@keyframes lf-wave
  0%, 100%
    opacity: 0
    transform: translateX(-8px)
  50%
    opacity: 0.95
    transform: translateX(8px)
@keyframes sky-drift
  from
    transform: translateX(calc(var(--u) * -200))
  to
    transform: translateX(calc(var(--u) * 1700))
@keyframes sky-fly-a
  from
    transform: translate(calc(var(--u) * -80), calc(var(--u) * 560))
  to
    transform: translate(calc(var(--u) * 1720), calc(var(--u) * 140))
@keyframes sky-fly-b
  from
    transform: translate(calc(var(--u) * 1700), calc(var(--u) * 800)) scaleX(-1)
  to
    transform: translate(calc(var(--u) * -120), calc(var(--u) * 590)) scaleX(-1)
@keyframes lf-flap
  from
    transform: scaleY(1)
  to
    transform: scaleY(0.15)

// A weak phone keeps the map and drops what only decorates it.
.wmap--low
  .sky-cloud--3, .sky-cloud--4, .sky-birds--1, .wmap__decor :deep(.lf-wave), .node__art :deep(.lm-smoke)
    display: none
  .node__art :deep(.lm-glow), .node:not(.is-lifting) .node__clouds :deep(.cl), .is-next .node__art
    animation: none

// Nothing moves under a window, an ad or a hidden tab.
.wmap.is-paused
  &, & *, & :deep(*)
    animation-play-state: paused !important

@media (prefers-reduced-motion: reduce)
  .wmap
    &, & *, & :deep(*)
      animation: none !important
  .node, .card-enter-active, .card-leave-active
    transition: none
  .node__spark
    display: none
  // A sky that does not drift would sit in a heap at the sheet's edge.
  .wmap__sky
    display: none
</style>
