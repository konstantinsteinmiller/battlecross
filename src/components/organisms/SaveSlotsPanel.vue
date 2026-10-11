<script setup lang="ts">
/**
 * Pause menu → Save and Pause menu → Load: the four manual save slots
 * (`game/state/saveSlots.ts`). Anything that replaces something — saving over
 * a slot, loading one — arms on the first tap and acts on the second, like the
 * healer's respec.
 *
 * Nothing on this page may change size when a slot is armed or saved into:
 * the columns follow the screen, never the content; a button keeps its width
 * and its word (it only turns red); the "sure?" goes where the slot's details
 * were, in the space they held; the load warning's line is always reserved.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FButton from '@/components/atoms/FButton.vue'
import { bcp47For } from '@/i18n/localeTag'
import { sfx } from '@/game/audio/sfx'
import { SLOT_COUNT, loadSlot, saveToSlot, slotSummaries } from '@/game/state/saveSlots'

const props = defineProps<{
  mode: 'save' | 'load'
}>()

const { t, locale }: any = useI18n({ useScope: 'global' })

/** The slot waiting for its confirming tap. */
const armed = ref<number | null>(null)
/** The slot just saved into (a short "Saved" on its button). */
const justSaved = ref<number | null>(null)
let savedTimer: ReturnType<typeof setTimeout> | null = null
/** A load is under way (the game is about to restart). */
const loading = ref(false)

watch(() => props.mode, () => { armed.value = null })

const dateFmt = computed(() => {
  try {
    return new Intl.DateTimeFormat(bcp47For(locale.value), { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  }
})

const rows = computed(() => Array.from({ length: SLOT_COUNT }, (_, i) => {
  const s = slotSummaries.value[i]
  return {
    i,
    empty: !s,
    level: s ? t('options.saves.level', { n: s.level }) : '',
    place: s?.place ? t(`node.${s.place}.name`) : '',
    when: s ? dateFmt.value.format(new Date(s.savedAt)) : ''
  }
}))

const onSave = (i: number, empty: boolean): void => {
  if (!empty && armed.value !== i) { armed.value = i; sfx('uiClick'); return }
  armed.value = null
  saveToSlot(i)
  justSaved.value = i
  if (savedTimer) clearTimeout(savedTimer)
  savedTimer = setTimeout(() => { justSaved.value = null }, 1800)
}

const onLoad = async (i: number): Promise<void> => {
  if (loading.value) return
  if (armed.value !== i) { armed.value = i; sfx('uiClick'); return }
  armed.value = null
  loading.value = true
  await loadSlot(i)
}

const saveLabel = (i: number, empty: boolean): string =>
  justSaved.value === i ? t('options.saves.saved') : empty ? t('options.saves.save') : t('options.saves.overwriteAsk')
</script>

<template lang="pug">
  div.slots
    p.slots__hint {{ mode === 'save' ? t('options.saves.saveHint') : t('options.saves.loadHint') }}
    ul.slots__list
      li.slot(v-for="r in rows" :key="r.i" :class="{ 'is-empty': r.empty }" :data-slot="r.i")
        div.slot__text
          span.slot__name {{ t('options.saves.slot', { n: r.i + 1 }) }}
          //- Two lines, always: the details, "empty", or the "sure?".
          span.slot__sub
            span.slot__ask(v-if="armed === r.i") {{ t('options.saves.confirm') }}
            span.slot__info(v-else-if="r.empty") {{ t('options.saves.empty') }}
            template(v-else)
              span.slot__info {{ r.place ? t('options.saves.levelAt', { level: r.level, place: r.place }) : r.level }}
              span.slot__when {{ r.when }}
        FButton.slot__act(
          v-if="mode === 'save'"
          :label="saveLabel(r.i, r.empty)"
          :type="armed === r.i ? 'danger' : justSaved === r.i ? 'success' : 'primary'"
          size="sm"
          @click="onSave(r.i, r.empty)"
        )
        FButton.slot__act(
          v-else
          :label="t('options.saves.load')"
          :type="armed === r.i ? 'danger' : 'primary'"
          size="sm"
          :is-disabled="r.empty || loading"
          @click="onLoad(r.i)"
        )
    //- Its line is held even while hidden: arming a slot moves nothing.
    p.slots__hint.slots__warn(v-if="mode === 'load'" :class="{ 'is-on': armed !== null }") {{ t('options.saves.loadWarn') }}
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.slots
  display: flex
  flex-direction: column
  gap: 0.4rem
  // A set width: the window never resizes to what a button happens to say.
  width: min(100%, 30rem)
  margin-inline: auto
  padding: 0.25rem 0.5rem
.slots__hint
  margin: 0
  color: var(--bc-on-soft)
  font-size: clamp(0.66rem, 2.8vmin, 0.8rem)
  line-height: 1.25
  text-align: start
.slots__warn
  visibility: hidden
  color: var(--bc-red-deep)
  &.is-on
    visibility: visible
.slots__list
  display: grid
  grid-template-columns: 1fr
  gap: 6px 10px
  margin: 0
  padding: 0
  list-style: none
.slot
  display: flex
  align-items: center
  justify-content: space-between
  gap: 8px
  padding: 5px 8px
  +cel.cell
  // Clears the button's depth plate.
  padding-bottom: calc(5px + var(--bc-press))
.slot__text
  display: flex
  flex-direction: column
  flex: 1 1 auto
  min-width: 0
  text-align: start
.slot__sub
  display: flex
  flex-direction: column
  // Two lines of details, held whether they are there or not.
  height: calc(2 * 1.2 * clamp(0.64rem, 2.5vmin, 0.78rem))
  font-size: clamp(0.64rem, 2.5vmin, 0.78rem)
.slot__ask
  color: var(--bc-red-deep)
  font-size: clamp(0.64rem, 2.5vmin, 0.78rem)
  line-height: 1.2
  display: -webkit-box
  -webkit-line-clamp: 2
  -webkit-box-orient: vertical
  overflow: hidden
.slot__name
  color: var(--bc-on)
  font-size: clamp(0.76rem, 3vmin, 0.92rem)
  line-height: 1.2
.slot__info, .slot__when
  color: var(--bc-on-soft)
  font-size: clamp(0.64rem, 2.5vmin, 0.78rem)
  line-height: 1.2
  overflow: hidden
  text-overflow: ellipsis
  white-space: nowrap
.slot.is-empty .slot__info
  font-style: italic
// One width for every word the button says (save, overwrite, saved, load).
.slot__act
  flex: 0 0 auto
  width: 9.5rem

// A short landscape screen (a phone on its side): two columns, by the screen alone.
@media (max-height: 30rem) and (min-width: 36rem)
  .slots
    width: min(100%, 44rem)
  .slots__list
    grid-template-columns: 1fr 1fr
</style>
