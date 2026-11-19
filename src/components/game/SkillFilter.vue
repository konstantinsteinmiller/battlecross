<template lang="pug">
  div.sf(ref="root" :class="{ 'is-on': count > 0 }" data-skill-filter)
    //- Wide codex (desktop, tablet): every choice is one tap, in a single compact strip.
    div.sf__strip(role="group" :aria-label="t('skills.filter.button')")
      button.sf__chip.sf__chip--kind(
        v-for="k in KINDS"
        :key="k"
        type="button"
        :class="{ 'is-on': model.kind === k }"
        :aria-pressed="model.kind === k"
        :aria-label="t(`skills.${k}`)"
        :title="t(`skills.${k}`)"
        :data-kind="k"
        @click="setKind(k)"
      )
        span.sf__shape(:class="`is-${k}`")
      button.sf__chip.sf__chip--kind(
        type="button"
        :class="{ 'is-on': model.learned }"
        :aria-pressed="model.learned"
        :aria-label="t('skills.known')"
        :title="t('skills.known')"
        data-kind="learned"
        @click="emit('update:model', { ...model, learned: !model.learned })"
      )
        span.sf__ic
          GameIcon(name="check")
      span.sf__sep(aria-hidden="true")
      button.sf__chip.sf__chip--attr(
        v-for="a in ATTRS"
        :key="a"
        type="button"
        :class="{ 'is-on': model.attrs.includes(a) }"
        :style="{ '--c': ATTR_COLOR[a] }"
        :aria-pressed="model.attrs.includes(a)"
        :aria-label="t('skill.scales', { attr: t(`attr.${a}.name`) })"
        :title="t('skill.scales', { attr: t(`attr.${a}.name`) })"
        :data-attr="a"
        @click="toggleAttr(a)"
      ) {{ t(`attr.${a}.short`) }}
      button.sf__clear(v-if="count" type="button" :aria-label="t('skills.filter.clear')" :title="t('skills.filter.clear')" data-filter-clear @click="clear")
        span.sf__ic
          GameIcon(name="close")

    //- Narrow codex (phones): one small button; it opens a panel over the page (two taps), so no row is added.
    button.sf__open(type="button" :aria-expanded="open" :aria-label="t('skills.filter.button')" data-filter-open @click="toggle")
      span.sf__open-text {{ t('skills.filter.button') }}
      span.sf__count(v-if="count") {{ count }}
      span.sf__ic.sf__chev
        GameIcon(name="down")

    Teleport(to="body")
      div.sf__panel(v-if="open" ref="panel" role="dialog" :aria-label="t('skills.filter.button')" :style="panelStyle" data-filter-panel)
        p.sf__cap {{ t('skills.filter.type') }}
        div.sf__row
          button.sf__pill(
            v-for="k in KINDS"
            :key="k"
            type="button"
            :class="{ 'is-on': model.kind === k }"
            :aria-pressed="model.kind === k"
            @click="setKind(k)"
          ) {{ t(`skills.${k}`) }}
          button.sf__pill(type="button" :class="{ 'is-on': model.learned }" :aria-pressed="model.learned" @click="emit('update:model', { ...model, learned: !model.learned })") {{ t('skills.known') }}
        p.sf__cap {{ t('skills.filter.scales') }}
        div.sf__row
          button.sf__pill.sf__pill--attr(
            v-for="a in ATTRS"
            :key="a"
            type="button"
            :class="{ 'is-on': model.attrs.includes(a) }"
            :style="{ '--c': ATTR_COLOR[a] }"
            :aria-pressed="model.attrs.includes(a)"
            @click="toggleAttr(a)"
          ) {{ t(`attr.${a}.short`) }}
        button.sf__pill.sf__pill--clear(type="button" :disabled="!count" @click="clear") {{ t('skills.filter.clear') }}
</template>

<script setup lang="ts">
/**
 * The skill codex's filter: only active or only passive skills, only learned ones, only those that scale with one
 * (or several) of the six attributes. A wide codex shows it as a single strip of small chips; a narrow one (a phone)
 * as one button that opens a panel, so it never adds a row to a page that has none to spare. The page does the
 * filtering (`SkillsPage`); this only holds the choice.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ATTRS, ATTR_COLOR, type Attr } from '@/game/data/attributes'
import GameIcon from '@/components/icons/GameIcon.vue'

export interface SkillFilterState { kind: '' | 'active' | 'passive'; attrs: Attr[]; learned: boolean }

const KINDS = ['active', 'passive'] as const
const props = defineProps<{ model: SkillFilterState }>()
const emit = defineEmits<{ (e: 'update:model', v: SkillFilterState): void }>()
const { t } = useI18n()

const count = computed(() => (props.model.kind ? 1 : 0) + props.model.attrs.length + (props.model.learned ? 1 : 0))
const setKind = (k: 'active' | 'passive'): void => emit('update:model', { ...props.model, kind: props.model.kind === k ? '' : k })
const toggleAttr = (a: Attr): void => emit('update:model', {
  ...props.model,
  attrs: props.model.attrs.includes(a) ? props.model.attrs.filter(x => x !== a) : [...props.model.attrs, a]
})
const clear = (): void => emit('update:model', { kind: '', attrs: [], learned: false })

// ── The phone panel: fixed under its button, closed by a tap anywhere else ───
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const open = ref(false)
const panelStyle = ref<Record<string, string>>({})
const place = (): void => {
  const b = root.value?.querySelector<HTMLElement>('.sf__open')
  if (!b) return
  const r = b.getBoundingClientRect()
  const w = Math.min(window.innerWidth - 16, 17 * 16)
  const left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w))
  const room = window.innerHeight - r.bottom - 8
  // Under the button when it fits, else above it.
  panelStyle.value = room >= 180 || room >= r.top
    ? { left: `${left}px`, top: `${r.bottom + 4}px`, width: `${w}px`, maxHeight: `${Math.max(120, room)}px` }
    : { left: `${left}px`, bottom: `${window.innerHeight - r.top + 4}px`, width: `${w}px`, maxHeight: `${Math.max(120, r.top - 8)}px` }
}
const onAway = (e: Event): void => {
  const n = e.target as Node
  if (panel.value?.contains(n) || root.value?.querySelector('.sf__open')?.contains(n)) return
  close()
}
const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') close() }
const close = (): void => { open.value = false }
const toggle = (): void => { open.value = !open.value }
watch(open, (v) => {
  window.removeEventListener('pointerdown', onAway, true)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', close)
  if (!v) return
  place()
  void nextTick(() => {
    window.addEventListener('pointerdown', onAway, true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', close)
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onAway, true)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', close)
})
</script>

<style scoped lang="sass">
@use '@/assets/css/cel'

.sf
  display: flex
  align-items: center
  flex: 0 0 auto
  min-width: 0
.sf__strip
  display: flex
  align-items: center
  gap: 0.2rem
.sf__sep
  width: 2px
  align-self: stretch
  margin: 0.15rem 0.1rem
  border-radius: 1px
  background: rgba(var(--bc-paper-ink-rgb), 0.28)
.sf__chip
  display: grid
  place-items: center
  min-width: 1.7rem
  height: 1.7rem
  padding: 0 0.3rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-sm)
  background: var(--bc-paper)
  color: var(--bc-ink)
  +cel.label
  font-size: 0.62rem
  line-height: 1
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  opacity: 0.72
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), opacity 120ms ease-out
  +cel.focus-ring
  &:active
    transition-duration: var(--bc-t-press)
    transform: scale(0.92)
  &.is-on
    opacity: 1
    background: var(--bc-gold-hi)
    box-shadow: 0 2px 0 var(--bc-ink)
  @media (hover: hover)
    &:hover
      opacity: 1
.sf__chip--attr
  background: color-mix(in srgb, var(--c) 40%, var(--bc-paper))
  &.is-on
    background: var(--c)
.sf__ic
  display: block
  width: 0.95rem
  height: 0.95rem
// An active skill is a square socket, a passive one a round socket: the chip draws the same shapes.
.sf__shape
  display: block
  width: 0.85rem
  height: 0.85rem
  border: 2px solid currentColor
  &.is-active
    border-radius: 22%
  &.is-passive
    border-radius: 50%
.sf__clear
  display: grid
  place-items: center
  width: 1.5rem
  height: 1.5rem
  margin-inline-start: 0.1rem
  padding: 0.28rem
  border: 0
  border-radius: 50%
  background: transparent
  color: var(--bc-paper-ink-soft)
  cursor: pointer
  +cel.focus-ring

// The phone button: hidden while the strip fits.
.sf__open
  display: none
  align-items: center
  gap: 0.3rem
  height: 1.9rem
  padding: 0 0.55rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: var(--bc-paper)
  color: var(--bc-ink)
  +cel.label
  font-size: 0.7rem
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring
.sf.is-on .sf__open
  background: var(--bc-gold-hi)
.sf__count
  display: grid
  place-items: center
  min-width: 1.1rem
  height: 1.1rem
  border-radius: 50%
  background: var(--bc-ink)
  color: var(--bc-white)
  font-size: 0.62rem
.sf__chev
  width: 0.8rem
  height: 0.8rem
@container (max-width: 36rem)
  .sf__strip
    display: none
  .sf__open
    display: inline-flex

// The panel is teleported to the body: its own, unscoped look below.
</style>

<style lang="sass">
.sf__panel
  position: fixed
  z-index: var(--bc-z-veil, 90)
  display: flex
  flex-direction: column
  gap: 0.35rem
  box-sizing: border-box
  padding: 0.55rem 0.65rem 0.65rem
  overflow-y: auto
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: var(--bc-paper-hi)
  box-shadow: var(--bc-drop)
  color: var(--bc-ink)
  .sf__cap
    margin: 0
    font-size: 0.68rem
    opacity: 0.7
  .sf__row
    display: flex
    flex-wrap: wrap
    gap: 0.3rem
  .sf__pill
    min-height: 2.2rem
    padding: 0 0.75rem
    border: var(--bc-ol-thin) solid var(--bc-ink)
    border-radius: var(--bc-r-pill)
    background: var(--bc-paper)
    color: var(--bc-ink)
    font: inherit
    font-size: 0.8rem
    cursor: pointer
    touch-action: manipulation
    &.is-on
      background: var(--bc-gold-hi)
      box-shadow: 0 2px 0 var(--bc-ink)
    &.sf__pill--attr
      min-width: 3rem
      background: color-mix(in srgb, var(--c) 40%, var(--bc-paper))
      &.is-on
        background: var(--c)
    &--clear
      align-self: flex-end
      margin-top: 0.1rem
    &:disabled
      opacity: 0.45
</style>
