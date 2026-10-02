<template lang="pug">
  ul.choices(:aria-label="t('dlg.ui.topics')")
    li(v-for="(c, i) in choices" :key="c.id")
      button.choice(
        type="button"
        :class="[c.tone ? `choice--${c.tone}` : '', { 'choice--end': c.icon === 'end', 'is-locked': c.locked.length > 0, 'is-used': c.used, 'is-focus': i === focus, 'is-denied': denied === c.id }]"
        :aria-disabled="c.locked.length > 0"
        :data-choice="c.id"
        @click="pick(c)"
        @pointerenter="hover($event, i)"
        @animationend="denied = ''"
      )
        //- The number key that says it (desktop only).
        span.choice__key(v-if="keys && i < 9" aria-hidden="true") {{ i + 1 }}
        span.choice__icon(v-if="iconOf(c)" aria-hidden="true")
          GameIcon(:name="iconOf(c)")
        span.choice__body
          span.choice__text(dir="auto") {{ t(c.text) }}
          span.choice__sub(v-if="c.locked.length")
            GameIcon.choice__lock(name="lock")
            span {{ lockText(c) }}
          span.choice__sub(v-else-if="c.note") {{ t(c.note.key, noteParams(c)) }}
</template>

<script setup lang="ts">
/**
 * What the hero can say (Gothic-style): the topics as a list, "End" last. A
 * choice that opens a window, pays or decides carries a glyph; a decision's
 * choices keep their tone colours; a locked one stays on the list and says
 * what is missing. Used one-time topics are gone, used permanent ones dimmed.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ChoiceView } from '@/game/dialog/runner'
import type { LockReason } from '@/game/dialog/types'
import type { GameIconName } from '@/components/icons/iconNames'
import GameIcon from '@/components/icons/GameIcon.vue'
import { fmt } from '@/utils/format'

defineProps<{
  choices: ChoiceView[]
  /** The choice the keys are on (-1: none). */
  focus: number
  /** Show the number keys. */
  keys: boolean
}>()
const emit = defineEmits<{ (e: 'pick', id: string): void; (e: 'update:focus', i: number): void }>()
const { t } = useI18n()
const denied = ref('')

const ICON: Record<string, GameIconName> = {
  trade: 'shop', train: 'book', heal: 'flask', quest: 'map', gift: 'gift', buy: 'coin', end: 'back'
}
const TONE_ICON: Record<string, GameIconName> = { noble: 'shield', ruthless: 'skull', cunning: 'star' }
const iconOf = (c: ChoiceView): GameIconName | undefined =>
  (c.icon === 'decision' ? TONE_ICON[c.tone ?? 'noble'] : c.icon ? ICON[c.icon] : undefined)

const reason = (r: LockReason): string => {
  switch (r.kind) {
    case 'attr': return t('dlg.ui.needs.attr', { n: r.n, attr: t(`attr.${r.attr}.name`) })
    case 'level': return t('dlg.ui.needs.level', { n: r.n })
    case 'rep': return t('dlg.ui.needs.rep', { faction: t(`faction.${r.faction}`), n: r.n })
    case 'gold': return t('dlg.ui.needs.gold', { n: fmt(r.n) })
    case 'full': return t('dlg.ui.needs.full')
    default: return t('dlg.ui.needs.other')
  }
}
const lockText = (c: ChoiceView): string => c.locked.map(reason).join(' · ')
const noteParams = (c: ChoiceView): Record<string, string | number> => {
  const out: Record<string, string | number> = {}
  for (const k in c.note?.params) {
    const v = c.note!.params![k]!
    out[k] = typeof v === 'number' ? fmt(v) : v
  }
  return out
}

const pick = (c: ChoiceView): void => {
  // A locked choice answers with a shake (and the layer with a sound).
  if (c.locked.length) denied.value = c.id
  emit('pick', c.id)
}
/** The mouse moves the highlight; a finger does not leave one behind. */
const hover = (e: PointerEvent, i: number): void => {
  if (e.pointerType === 'mouse') emit('update:focus', i)
}
</script>

<style scoped lang="sass">
.choices
  margin: 0
  padding: 0
  list-style: none
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.3vmin, 0.5rem)
  font-family: var(--font-ui)
.choice
  --c-hi: var(--bc-paper-hi)
  --c: var(--bc-paper)
  --c-lo: var(--bc-paper-lo)
  --on: var(--bc-paper-ink)
  --on-soft: var(--bc-paper-ink-soft)
  --mark: var(--bc-leather)
  position: relative
  box-sizing: border-box
  width: 100%
  // 44 px at the least, whatever the root font size is.
  min-height: max(2.75rem, 44px)
  display: flex
  align-items: center
  gap: 0.6em
  padding: 0.4em 0.85em 0.5em 0.7em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-md)
  background: linear-gradient(180deg, var(--c-hi) 0, var(--c-hi) 42%, var(--c) 42%, var(--c) calc(100% - 0.32em), var(--c-lo) calc(100% - 0.32em), var(--c-lo) 100%)
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink)
  color: var(--on)
  font: inherit
  font-size: clamp(0.84rem, 3.5vmin, 1.04rem)
  line-height: 1.2
  text-align: start
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  user-select: none
  -webkit-user-select: none
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), box-shadow 120ms ease-out
  &:focus
    outline: none
  &:active:not(.is-locked)
    transition-duration: var(--bc-t-press)
    transform: translateY(var(--bc-press-sm)) scale(1.01, 0.97)
    box-shadow: 0 0 0 var(--bc-ink)
// The one the keys (or the mouse) are on: a gold ring, nudged toward the reader.
.choice.is-focus
  box-shadow: 0 var(--bc-press-sm) 0 var(--bc-ink), 0 0 0 3px var(--bc-gold), var(--bc-glow-gold)
  transform: translateX(0.25em)
[dir="rtl"] .choice.is-focus
  transform: translateX(-0.25em)
.choice__key
  flex: 0 0 auto
  display: inline-grid
  place-items: center
  min-width: 1.5em
  height: 1.5em
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: var(--bc-r-xs)
  background: var(--bc-white)
  box-shadow: 0 2px 0 var(--bc-ink)
  color: var(--bc-ink)
  font-size: 0.74em
  line-height: 1
.choice__icon
  flex: 0 0 auto
  width: 1.5em
  height: 1.5em
  color: var(--mark)
.choice__body
  flex: 1 1 auto
  min-width: 0
  display: flex
  flex-direction: column
  gap: 0.1em
.choice__text
  overflow-wrap: anywhere
.choice__sub
  display: inline-flex
  align-items: center
  gap: 0.3em
  color: var(--on-soft)
  font-size: 0.8em
.choice__lock
  flex: 0 0 auto
  width: 1em
  height: 1em

// A decision keeps its tone: noble gold, ruthless red, cunning purple.
.choice--noble
  --c-hi: var(--bc-gold-hi)
  --c: var(--bc-gold)
  --c-lo: var(--bc-gold-lo)
  --on: var(--bc-ink)
  --on-soft: var(--bc-gold-deep)
  --mark: var(--bc-gold-deep)
.choice--ruthless
  --c-hi: var(--bc-red-hi)
  --c: var(--bc-red)
  --c-lo: var(--bc-red-lo)
  --on: var(--bc-white)
  --on-soft: var(--bc-white)
  --mark: var(--bc-white)
.choice--cunning
  --c-hi: var(--bc-purple-hi)
  --c: var(--bc-purple)
  --c-lo: var(--bc-purple-lo)
  --on: var(--bc-white)
  --on-soft: var(--bc-white)
  --mark: var(--bc-white)
.choice--ruthless .choice__text, .choice--cunning .choice__text
  text-shadow: var(--bc-text-outline-thin)
// "End": the quiet one.
.choice--end
  --c-hi: var(--bc-stone-hi)
  --c: var(--bc-stone)
  --c-lo: var(--bc-stone-lo)
  --on: var(--bc-white)
  --mark: var(--bc-white)
  .choice__text
    text-shadow: var(--bc-text-outline-thin)
// Said before (a permanent topic): still there, a shade paler.
.choice.is-used:not(.is-focus)
  filter: saturate(0.7) brightness(0.96)
  .choice__text
    opacity: 0.78
// Locked: no hue, and it says why.
.choice.is-locked
  // (No highlight band: it would run through the words like a strike-out.)
  --c-hi: var(--bc-off-hi)
  --c: var(--bc-off-hi)
  --c-lo: var(--bc-off-lo)
  --on: var(--bc-ink)
  --on-soft: var(--bc-ink)
  --mark: var(--bc-off-deep)
  cursor: default
  .choice__text
    text-shadow: none
    opacity: 0.92
.choice.is-denied
  animation: choice-no 320ms linear

@keyframes choice-no
  0%, 100%
    transform: none
  20%, 60%
    transform: translateX(-0.3em)
  40%, 80%
    transform: translateX(0.3em)
@media (prefers-reduced-motion: reduce)
  .choice
    transition: none
  .choice.is-denied
    animation: none
</style>
