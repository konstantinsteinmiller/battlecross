<template lang="pug">
  div.wmap(:style="sheetArt ? { '--sheet': `url(${sheetArt})` } : undefined")
    div.wmap__top
      div.wmap__hero
        span.wmap__face
          Portrait(look="hero")
        span.wmap__who
          span.wmap__level {{ t('hud.level', { n: profile.level }) }}
          span.wmap__gold(@pointerdown="registerQaAdTap()")
            IconCoin.wmap__coin
            | {{ fmt(profile.gold) }}
      h1.wmap__title {{ t('map.title') }}
      HudMenu(@options="emit('options')")
    div.wmap__sheet(ref="sheet" @click.self="selected = ''")
      svg.wmap__links(viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true")
        line(
          v-for="l in links"
          :key="l.key"
          :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2"
          :class="{ open: l.open }"
          vector-effect="non-scaling-stroke"
        )
      button.node(
        v-for="n in nodes"
        :key="n.id"
        type="button"
        :data-node="n.id"
        :class="[`node--${n.kind}`, { 'is-locked': !n.open, 'is-cleared': n.cleared, 'is-here': n.here, 'is-selected': selected === n.id, 'is-next': n.open && !n.cleared }]"
        :style="{ left: `${n.x}%`, top: `${n.y}%`, '--tint': n.tint }"
        :aria-label="t(`node.${n.id}.name`)"
        @click="pick(n.id)"
      )
        span.node__chip
          GameIcon.node__icon(:name="n.icon")
        span.node__check(v-if="n.cleared && n.kind !== 'town'" aria-hidden="true")
          GameIcon(name="check")
        span.node__skulls(v-if="n.open && n.danger > 0" aria-hidden="true")
          GameIcon(v-for="k in n.danger" :key="k" name="skull")
        span.node__here(v-if="n.here" aria-hidden="true")
          Portrait(look="hero")
        span.node__label {{ t(`node.${n.id}.name`) }}
    div.wmap__bottom
      FButton(v-if="canReturn" :label="t('map.back')" type="secondary" size="sm" icon="back" icon-position="left" @click="closeMap")
      MenuButtons(board)
    //- The picked place.
    Transition(name="card")
      //- Docked away from the picked place, so it never covers it.
      div.card(v-if="sel" :key="sel.id" :class="{ 'card--top': sel.y > 52 }")
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
 * The world map (GDD §3.1): a parchment with every zone, town and the
 * colosseum on it. A place opens when a neighbour has been cleared; nothing
 * is level-gated — skulls warn how far above the hero a zone starts, and the
 * player may walk in anyway.
 */
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MAP, NODE_BY_ID, ZONES, dangerOf, nodeOpen, type NodeId, type ThemeId } from '@/game/data/zones'
import { itemsOfZone, type ZoneId } from '@/game/data/items'
import { QUEST_BY_ID } from '@/game/data/quests'
import { profile, flagSet } from '@/game/state/profile'
import { closeMap, flow, hiddenTrainer, travel, visitHiddenTrainer } from '@/game/flow'
import { UI_ART } from '@/game/assets/overrides'
import { sfx } from '@/game/audio/sfx'
import { registerQaAdTap } from '@/use/useQaAdTrigger'
import { fmt } from '@/utils/format'
import type { GameIconName } from '@/components/icons/iconNames'
import GameIcon from '@/components/icons/GameIcon.vue'
import IconCoin from '@/components/icons/IconCoin.vue'
import FButton from '@/components/atoms/FButton.vue'
import Portrait from '@/components/art/Portrait.vue'
import ItemIcon from '@/components/art/ItemIcon.vue'
import HudMenu from '@/components/hud/HudMenu.vue'
import MenuButtons from '@/components/hud/MenuButtons.vue'

const emit = defineEmits<{ (e: 'options'): void }>()
const { t } = useI18n()
const sheetArt = UI_ART.get('map') ?? ''

/** The ink a place is drawn in. */
const THEME_TINT: Record<ThemeId, string> = {
  plains: '#6fbf4a', cave: '#8a7a9a', forest: '#2f9a5a', farm: '#d8b04a', ash: '#e0603a', mine: '#b0803a', snow: '#8fd0f0',
  temple: '#3fc0b0', void: '#8a5ae0', peak: '#7a8ab8', fortress: '#c0364a', rift: '#b04adf', town: '#4a8af0', ruin: '#6a5a7a', arena: '#f0a020'
}

const selected = ref<NodeId | ''>('')
const cleared = computed(() => new Set(profile.world.cleared))
const flags = computed(() => flagSet())

interface NodeView {
  id: NodeId
  kind: 'zone' | 'town' | 'arena'
  x: number
  y: number
  open: boolean
  cleared: boolean
  here: boolean
  danger: number
  tint: string
  icon: GameIconName
  zone?: (typeof ZONES)[ZoneId]
}

const nodes = computed<NodeView[]>(() => MAP.map((n) => {
  const zone = n.kind === 'zone' ? ZONES[n.id as ZoneId] : undefined
  const open = nodeOpen(n.id, cleared.value, flags.value)
  const theme: ThemeId = zone ? zone.theme : n.kind === 'arena' ? 'arena' : n.id === 'oakhaven' && flags.value.has('oakhavenFallen') ? 'ruin' : 'town'
  return {
    id: n.id,
    kind: n.kind,
    x: n.at[0] * 100,
    y: n.at[1] * 100,
    open,
    cleared: cleared.value.has(n.id),
    here: profile.world.at === n.id,
    danger: zone ? dangerOf(zone, profile.level) : 0,
    tint: THEME_TINT[theme],
    icon: !open ? 'lock' : n.kind === 'town' ? 'home' : n.kind === 'arena' ? 'trophy' : 'sword',
    zone
  }
}))

const links = computed(() => {
  const out: Array<{ key: string; x1: number; y1: number; x2: number; y2: number; open: boolean }> = []
  const seen = new Set<string>()
  for (const n of MAP) {
    for (const l of n.links) {
      const key = [n.id, l].sort().join('-')
      const o = NODE_BY_ID[l]
      if (seen.has(key) || !o) continue
      seen.add(key)
      out.push({
        key, x1: n.at[0] * 100, y1: n.at[1] * 100, x2: o.at[0] * 100, y2: o.at[1] * 100,
        open: nodeOpen(n.id, cleared.value, flags.value) && nodeOpen(o.id, cleared.value, flags.value)
      })
    }
  }
  return out
})

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

const pick = (id: NodeId): void => {
  sfx('mapMove')
  selected.value = selected.value === id ? '' : id
}
const go = (id: NodeId): void => {
  selected.value = ''
  void travel(id)
}
</script>

<style scoped lang="sass">
$ink: #3a2a1c
$outline: 0 2px 0 #0f1a30, 1px 0 0 #0f1a30, -1px 0 0 #0f1a30, 0 -1px 0 #0f1a30
.wmap
  --pad: clamp(0.5rem, 2.2vmin, 1rem)
  position: absolute
  inset: 0
  display: flex
  flex-direction: column
  padding: calc(env(safe-area-inset-top, 0px) + var(--pad)) calc(env(safe-area-inset-right, 0px) + var(--pad)) calc(env(safe-area-inset-bottom, 0px) + var(--pad)) calc(env(safe-area-inset-left, 0px) + var(--pad))
  gap: var(--pad)
  background: radial-gradient(circle at 50% 30%, #3a3168 0%, #1b1626 80%)
  font-family: var(--font-ui)
  color: #fff
  user-select: none
  -webkit-user-select: none
.wmap__top
  display: grid
  grid-template-columns: auto minmax(0, 1fr) auto
  align-items: center
  gap: var(--pad)
.wmap__hero
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
  text-shadow: $outline
.wmap__gold
  display: inline-flex
  align-items: center
  gap: 0.2em
  color: #ffe066
.wmap__coin
  width: 1em
  height: 1em
.wmap__title
  margin: 0
  text-align: center
  font-size: clamp(0.95rem, 4.4vmin, 1.7rem)
  line-height: 1.1
  text-shadow: 0 3px 0 #0f1a30
  white-space: nowrap
  overflow: hidden
  text-overflow: ellipsis
// The parchment. Painted with gradients until `images/ui/map.webp` exists.
.wmap__sheet
  position: relative
  flex: 1 1 auto
  min-height: 0
  border-radius: clamp(0.6rem, 2.6vmin, 1.2rem)
  border: 3px solid #0f1a30
  box-shadow: 0 4px 0 #0f1a30, inset 0 0 0 3px #f6e7bd, inset 0 0 4rem rgba(120, 80, 30, 0.45)
  background: var(--sheet, radial-gradient(ellipse at 22% 78%, rgba(111, 191, 74, 0.5) 0%, rgba(111, 191, 74, 0) 26%), radial-gradient(ellipse at 44% 52%, rgba(47, 154, 90, 0.45) 0%, rgba(47, 154, 90, 0) 24%), radial-gradient(ellipse at 44% 34%, rgba(224, 96, 58, 0.4) 0%, rgba(224, 96, 58, 0) 22%), radial-gradient(ellipse at 68% 28%, rgba(143, 208, 240, 0.6) 0%, rgba(143, 208, 240, 0) 24%), radial-gradient(ellipse at 84% 18%, rgba(138, 90, 224, 0.45) 0%, rgba(138, 90, 224, 0) 26%), radial-gradient(ellipse at 80% 62%, rgba(63, 192, 176, 0.4) 0%, rgba(63, 192, 176, 0) 22%), linear-gradient(160deg, #ecd9a8 0%, #dcc188 55%, #c9a66b 100%)) center / cover no-repeat
  overflow: hidden
.wmap__links
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  pointer-events: none
  line
    stroke: rgba(58, 42, 28, 0.28)
    stroke-width: 3
    stroke-dasharray: 2 9
    stroke-linecap: round
    &.open
      stroke: $ink
      stroke-dasharray: 9 8
.node
  --s: clamp(2.3rem, 9.6vmin, 3.6rem)
  position: absolute
  width: var(--s)
  height: var(--s)
  margin: calc(var(--s) * -0.5) 0 0 calc(var(--s) * -0.5)
  padding: 0
  border: 0
  background: none
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform 120ms ease-out
  &:active
    transform: scale(0.92)
.node__chip
  position: absolute
  inset: 0
  display: flex
  align-items: center
  justify-content: center
  border-radius: 50%
  border: 3px solid #0f1a30
  background: radial-gradient(circle at 40% 30%, color-mix(in srgb, var(--tint) 60%, #ffffff), var(--tint) 62%, color-mix(in srgb, var(--tint) 70%, #0f1a30))
  box-shadow: 0 0.22em 0 #0f1a30
  color: #fff
.node--town .node__chip
  border-radius: 28%
.node__icon
  width: 56%
  height: 56%
  filter: drop-shadow(0 2px 0 rgba(15, 26, 48, 0.7))
.is-locked .node__chip
  background: #8a7f72
  color: #d8cfc0
  opacity: 0.8
.is-next .node__chip
  animation: node-next 1.4s ease-in-out infinite
.is-selected .node__chip
  box-shadow: 0 0 0 3px #ffffff, 0 0.22em 0 3px #0f1a30
.node__check
  position: absolute
  right: -12%
  top: -12%
  width: 44%
  height: 44%
  padding: 6%
  border-radius: 50%
  border: 2px solid #0f1a30
  background: #3fd060
  color: #fff
  svg
    display: block
    width: 100%
    height: 100%
.node__skulls
  position: absolute
  left: 50%
  top: -34%
  transform: translateX(-50%)
  display: flex
  gap: 1px
  color: #e0303a
  filter: drop-shadow(0 1px 0 #fff)
  svg
    width: calc(var(--s) * 0.3)
    height: calc(var(--s) * 0.3)
.node__here
  position: absolute
  left: 50%
  bottom: 78%
  width: 74%
  margin-left: -37%
  animation: node-here 1.1s ease-in-out infinite alternate
  pointer-events: none
.node__label
  position: absolute
  left: 50%
  top: 104%
  transform: translateX(-50%)
  width: max-content
  max-width: clamp(4.6rem, 24vmin, 9rem)
  color: $ink
  font-size: clamp(0.56rem, 2.3vmin, 0.86rem)
  line-height: 1.05
  text-align: center
  text-shadow: 0 1px 0 rgba(255, 244, 210, 0.9), 1px 0 0 rgba(255, 244, 210, 0.9), -1px 0 0 rgba(255, 244, 210, 0.9)
  pointer-events: none
.is-locked .node__label
  opacity: 0.6
.wmap__bottom
  display: flex
  align-items: center
  justify-content: space-between
  gap: var(--pad)
  min-height: clamp(2.9rem, 13vmin, 4rem)
  > :last-child
    margin-left: auto
// The card rises over the bottom bar; it never covers the whole sheet.
.card
  position: absolute
  left: 50%
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad))
  transform: translateX(-50%)
  width: min(calc(100% - 2 * var(--pad)), 30rem)
  max-height: 62%
  overflow-y: auto
  padding: clamp(0.7rem, 3vmin, 1.1rem)
  border-radius: clamp(0.7rem, 3vmin, 1.2rem)
  border: 3px solid #0f1a30
  background: linear-gradient(180deg, #3d4c8c, #252e60)
  box-shadow: 0 5px 0 #0f1a30, inset 0 2px 0 rgba(255, 255, 255, 0.18)
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.4vmin, 0.55rem)
  z-index: 5
.card__close
  position: absolute
  right: 0.45rem
  top: 0.45rem
  width: clamp(2rem, 8vmin, 2.5rem)
  height: clamp(2rem, 8vmin, 2.5rem)
  padding: 0.4rem
  border-radius: 50%
  border: 2px solid #0f1a30
  background: #e0404a
  color: #fff
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
  padding-right: 2.6rem
.card__name
  margin: 0
  font-size: clamp(1.05rem, 4.6vmin, 1.5rem)
  line-height: 1.1
  text-shadow: 0 2px 0 #0f1a30
.card__meta
  color: #ffe066
  font-size: clamp(0.78rem, 3.2vmin, 1rem)
.card__desc, .card__quest, .card__warn, .card__locked
  margin: 0
  font-size: clamp(0.78rem, 3.2vmin, 0.98rem)
  line-height: 1.3
  color: #dfe6ff
.card__warn
  display: flex
  align-items: center
  gap: 0.2em
  color: #ff9a9a
.card__skull, .card__lock
  width: 1.1em
  height: 1.1em
  flex: 0 0 auto
.card__quest
  color: #ffe9a8
.card__drops
  display: flex
  flex-wrap: wrap
  gap: 0.35rem
.card__drop
  width: clamp(2rem, 8.6vmin, 2.7rem)
  &.owned
    filter: drop-shadow(0 0 0.3rem #5dff7a)
.card__actions
  display: flex
  flex-wrap: wrap
  align-items: center
  justify-content: flex-end
  gap: 0.5rem
  margin-top: 0.2rem
.card__locked
  display: flex
  align-items: center
  gap: 0.4em
  color: #c9d2ee
.card--top
  top: calc(env(safe-area-inset-top, 0px) + var(--pad) + clamp(3rem, 13vmin, 4.4rem))
  bottom: auto
  max-height: 46%
.card-enter-active, .card-leave-active
  transition: opacity 180ms ease-out, transform 220ms cubic-bezier(0.2, 1.3, 0.4, 1)
.card-enter-from, .card-leave-to
  opacity: 0
  transform: translateX(-50%) translateY(1.2rem)
.card--top.card-enter-from, .card--top.card-leave-to
  transform: translateX(-50%) translateY(-1.2rem)
@keyframes node-next
  0%, 100%
    box-shadow: 0 0.22em 0 #0f1a30, 0 0 0 0 rgba(255, 233, 168, 0.9)
  50%
    box-shadow: 0 0.22em 0 #0f1a30, 0 0 0 0.5em rgba(255, 233, 168, 0)
@keyframes node-here
  from
    transform: translateY(0)
  to
    transform: translateY(-14%)
@media (prefers-reduced-motion: reduce)
  .is-next .node__chip, .node__here
    animation: none
</style>
