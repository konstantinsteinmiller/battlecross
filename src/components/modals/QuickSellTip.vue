<template lang="pug">
  FModal.qs(:model-value="true" :title="t('quickSell.title')" :is-closable="false" surface="parchment" tone="gold")
    div.qs__body(data-quick-sell-tip)
      p.qs__lead {{ t('quickSell.lead') }}
      ul.qs__rows
        //- A mouse: the keys.
        li.qs__row(v-if="!touch")
          span.qs__keys(aria-hidden="true")
            kbd.qs__key Shift
            span.qs__plus +
            kbd.qs__key {{ t('quickSell.click') }}
          span.qs__text {{ t('quickSell.shift') }}
        //- The switch above the bag: every device.
        li.qs__row
          span.qs__keys(aria-hidden="true")
            span.qs__switch
              span.qs__knob
              | {{ t('quickSell.title') }}
          span.qs__text {{ t('quickSell.toggle') }}
        li.qs__row.is-note
          span.qs__text {{ t('quickSell.undo') }}
    template(#footer)
      div.qs__foot
        FButton(:label="t('close')" type="success" size="md" attention data-quick-sell-close @click="emit('close')")
        p.qs__space(v-if="!touch") {{ t('quickSell.space') }}
</template>

<script setup lang="ts">
/**
 * The quick-sell lightbox: what the shortcut is and how to use it, read at leisure and closed with the button, SPACE or
 * Escape. Shown once (`data/quickSell.ts`).
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import { useMedia } from '@/components/game/useMedia'

const emit = defineEmits<{ (e: 'close'): void }>()
const { t } = useI18n()
/** A finger has no Shift: the switch is the way. */
const touch = useMedia('(pointer: coarse)')
const onKey = (e: KeyboardEvent): void => {
  if (e.key === ' ' || e.code === 'Space' || e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    emit('close')
  }
}
onMounted(() => window.addEventListener('keydown', onKey, true))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey, true))
</script>

<style scoped lang="sass">
.qs__body
  display: flex
  flex-direction: column
  gap: 0.6rem
  color: var(--bc-on)
.qs__lead
  margin: 0
  font-size: clamp(0.9rem, 3.6vmin, 1.1rem)
  line-height: 1.3
  font-weight: 700
.qs__rows
  display: flex
  flex-direction: column
  gap: 0.5rem
  margin: 0
  padding: 0
  list-style: none
.qs__row
  display: flex
  align-items: center
  gap: 0.7rem
  padding: 0.4rem 0.6rem
  border-radius: var(--bc-r-md)
  background: rgba(0, 0, 0, 0.1)
  &.is-note
    background: none
    padding-block: 0.1rem
    opacity: 0.85
.qs__keys
  display: flex
  align-items: center
  gap: 0.3rem
  flex: 0 0 auto
.qs__key
  min-width: 2.2rem
  padding: 0.25rem 0.6rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-bottom-width: 4px
  border-radius: 0.45rem
  background: var(--bc-paper-hi)
  color: var(--bc-ink)
  font: inherit
  font-size: 0.85rem
  font-weight: 800
  text-align: center
.qs__plus
  font-weight: 800
.qs__switch
  display: inline-flex
  align-items: center
  gap: 0.4rem
  padding: 0.2rem 0.7rem 0.2rem 0.25rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 999px
  background: var(--bc-gold-hi)
  color: var(--bc-ink)
  font-size: 0.8rem
  font-weight: 800
.qs__knob
  width: 1rem
  height: 1rem
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: var(--bc-paper-hi)
.qs__text
  font-size: clamp(0.8rem, 3.2vmin, 1rem)
  line-height: 1.3
.qs__foot
  display: flex
  flex-direction: column
  padding-bottom: 0.7rem
  align-items: center
  gap: 0.3rem
.qs__space
  margin: 0
  font-size: 0.72rem
  opacity: 0.7
</style>
