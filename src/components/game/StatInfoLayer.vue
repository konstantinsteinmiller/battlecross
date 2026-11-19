<template lang="pug">
  Teleport(to="body")
    div.sinfo(v-if="statInfo.id" :class="{ 'is-modal': statInfo.modal }" data-stat-info @pointerdown.self="closeStatInfo")
      article.sinfo__card(
        ref="card"
        :class="{ 'is-wait': !statInfo.modal && !pos.left }"
        :style="[{ '--c': tint }, pos]"
        role="dialog"
        :aria-label="title"
        :data-stat="statInfo.id"
      )
        button.sinfo__close(v-if="statInfo.modal" type="button" :aria-label="t('close')" @click="closeStatInfo")
          span.sinfo__x
            GameIcon(name="close")
        header.sinfo__head
          span.sinfo__badge(v-if="attr") {{ t(`attr.${statInfo.id}.short`) }}
          h3.sinfo__title {{ title }}
        section.sinfo__sec
          h4 {{ t('statinfo.h.does') }}
          p {{ t(`statinfo.${statInfo.id}.does`, params) }}
        section.sinfo__sec
          h4 {{ t('statinfo.h.fights') }}
          p {{ t(`statinfo.${statInfo.id}.fights`, params) }}
        section.sinfo__sec
          h4 {{ t('statinfo.h.source') }}
          ul.sinfo__tags
            li.sinfo__tag(v-for="s in sources" :key="s.raw" :style="s.attr ? { '--a': ATTR_COLOR[s.attr] } : undefined")
              | {{ t(`statinfo.src.${s.tag}`) }}
              b.sinfo__tag-attr(v-if="s.attr") {{ t(`attr.${s.attr}.short`) }}
        section.sinfo__sec
          h4 {{ t('statinfo.h.synergy') }}
          p {{ t(`statinfo.${statInfo.id}.synergy`, params) }}
        p.sinfo__cap(v-if="attr") {{ t('statinfo.cap') }}
</template>

<script setup lang="ts">
/**
 * The stat info card (hover for a mouse, tap for a finger): what a stat does, how it plays in a fight, where it comes
 * from and what it works with. The text is `statinfo.*` in i18n, its numbers the rules' own (`statInfoParams`).
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ATTR_COLOR, type Attr } from '@/game/data/attributes'
import { SOURCES, isAttrId, statInfoParams } from '@/game/data/statInfo'
import GameIcon from '@/components/icons/GameIcon.vue'
import { closeStatInfo, statInfo } from './statInfoState'

const { t } = useI18n()
const card = ref<HTMLElement | null>(null)
const pos = ref<Record<string, string>>({})
const params = statInfoParams()

/** Each derived stat takes the colour of the attribute that mostly raises it (gold where none does). */
const TINT: Record<string, Attr> = {
  health: 'end', mana: 'int', armor: 'end', resist: 'int', crit: 'dex', critDamage: 'skl', attackSpeed: 'dex', moveSpeed: 'dex',
  cdr: 'skl', block: 'str', hpRegen: 'end', damage: 'str'
}
const attr = computed(() => (statInfo.id && isAttrId(statInfo.id) ? (statInfo.id as Attr) : null))
const tint = computed(() => {
  const a = attr.value ?? TINT[statInfo.id]
  return a ? ATTR_COLOR[a] : 'var(--bc-gold)'
})
const title = computed(() => (!statInfo.id ? '' : attr.value ? t(`attr.${attr.value}.name`) : t(`stat.${statInfo.id}`)))
const sources = computed(() => (statInfo.id ? SOURCES[statInfo.id] : []).map((raw) => {
  const [tag, a] = raw.split(':')
  return { raw, tag: tag!, attr: a && isAttrId(a) ? (a as Attr) : null }
}))

/** Beside the row (left when there is room, else right), kept on screen; a tapped card is centred by its style. */
const place = (): void => {
  const el = card.value
  const r = statInfo.rect
  if (!el || !r || statInfo.modal) { pos.value = {}; return }
  const w = el.offsetWidth
  const h = el.offsetHeight
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Beside the row, on the left, when there is room (the stat list on the right edge) ...
  if (r.left - w - 12 >= 8) {
    pos.value = { left: `${r.left - w - 12}px`, top: `${Math.max(8, Math.min(vh - h - 8, (r.top + r.bottom) / 2 - h / 2))}px` }
    return
  }
  // ... else under it (over it when that is not left), never over the row itself: a wide row keeps its numbers in view.
  const x = Math.max(8, Math.min(vw - w - 8, (r.left + r.right) / 2 - w / 2))
  const below = r.bottom + 8
  const y = below + h <= vh - 8 ? below : r.top - 8 - h >= 8 ? r.top - 8 - h : Math.max(8, vh - h - 8)
  pos.value = { left: `${x}px`, top: `${y}px` }
}
watch(() => [statInfo.id, statInfo.modal], () => { pos.value = {}; void nextTick(place) })

const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape' && statInfo.id) { e.stopPropagation(); closeStatInfo() } }
onMounted(() => {
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('resize', closeStatInfo)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey, true)
  window.removeEventListener('resize', closeStatInfo)
  closeStatInfo()
})
</script>

<style lang="sass">
.sinfo
  position: fixed
  inset: 0
  z-index: calc(var(--bc-z-veil, 90) + 5)
  pointer-events: none
  &.is-modal
    display: flex
    align-items: center
    justify-content: center
    padding: 0.75rem
    background: rgba(var(--bc-ink-rgb), 0.5)
    pointer-events: auto
.sinfo__card
  position: fixed
  box-sizing: border-box
  width: min(27rem, calc(100vw - 1rem))
  max-height: calc(100vh - 1rem)
  padding: 0.7rem 0.85rem 0.8rem
  overflow-y: auto
  overscroll-behavior: contain
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: var(--bc-paper-hi)
  box-shadow: var(--bc-drop)
  color: var(--bc-ink)
  text-align: start
  animation: sinfo-in 140ms var(--bc-ease-pop, ease-out)
  // Under the pointer it is only to be read: the mouse passes through it.
  pointer-events: none
.sinfo__card.is-wait
  opacity: 0
  animation: none
.sinfo.is-modal .sinfo__card
  position: relative
  pointer-events: auto
  max-height: calc(100vh - 1.5rem)
.sinfo__head
  display: flex
  align-items: center
  gap: 0.5rem
  margin: 0 0 0.45rem
  padding-inline-end: 2.4rem
.sinfo__badge
  display: grid
  place-items: center
  min-width: 2.4rem
  height: 2.4rem
  padding: 0 0.3rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 28%
  background: var(--c)
  color: var(--bc-ink)
  font-size: 0.8rem
  font-weight: 800
.sinfo__title
  margin: 0
  padding: 0.1em 0.6em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: linear-gradient(180deg, color-mix(in srgb, var(--c) 66%, var(--bc-white)) 0, color-mix(in srgb, var(--c) 66%, var(--bc-white)) 46%, var(--c) 46%, var(--c) 100%)
  font-size: clamp(1rem, 3.6vmin, 1.25rem)
  font-weight: 800
  line-height: 1.2
.sinfo__sec
  margin-top: 0.5rem
  h4
    margin: 0 0 0.15rem
    color: color-mix(in srgb, var(--c) 55%, var(--bc-ink))
    font-size: 0.7rem
    letter-spacing: 0.04em
    text-transform: uppercase
  p
    margin: 0
    font-size: clamp(0.78rem, 2.9vmin, 0.92rem)
    line-height: 1.32
.sinfo__tags
  display: flex
  flex-wrap: wrap
  gap: 0.25rem
  margin: 0
  padding: 0
  list-style: none
.sinfo__tag
  display: inline-flex
  align-items: center
  gap: 0.3rem
  padding: 0.12rem 0.55rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--bc-paper)
  font-size: 0.74rem
.sinfo__tag-attr
  padding: 0 0.35rem
  border-radius: var(--bc-r-pill)
  background: var(--a)
  font-size: 0.66rem
.sinfo__cap
  margin: 0.55rem 0 0
  padding-top: 0.35rem
  border-top: 2px dashed rgba(var(--bc-ink-rgb), 0.25)
  font-size: 0.72rem
  opacity: 0.75
.sinfo__close
  position: absolute
  top: 0.35rem
  right: 0.35rem
  z-index: 2
  display: grid
  place-items: center
  width: 2.5rem
  height: 2.5rem
  padding: 0
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-paper)
  color: var(--bc-ink)
  cursor: pointer
  touch-action: manipulation
.sinfo__x
  display: block
  width: 1.2rem
  height: 1.2rem
@keyframes sinfo-in
  from
    opacity: 0
    transform: translateY(0.3rem) scale(0.97)
  to
    opacity: 1
    transform: none
@media (prefers-reduced-motion: reduce)
  .sinfo__card
    animation: none
</style>
