<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useUser, { isMobileLandscape } from '@/use/useUser'
import { setI18nLocale } from '@/i18n'
import FModal from '@/components/molecules/FModal.vue'
import FButton from '@/components/atoms/FButton.vue'
import FSlider from '@/components/atoms/FSlider.vue'
import FSelect from '@/components/atoms/FSelect.vue'
import { LANGUAGES, LANGUAGE_AUTONYMS, DIFFICULTY } from '@/utils/enums'
import { bcp47For } from '@/i18n/localeTag'
import { hapticsAvailable, hapticsEnabled, setHapticsEnabled } from '@/use/useHaptics'
import { touchFirst } from '@/game/engine/input'
import { ACTIONS, bindKey, bindingsChanged, isBindable, primaryCode, resetBindings, type Action } from '@/game/engine/keyBindings'
import { keyboard, keyLabel, LAYOUTS, setAutoLayout, setManualLayout, type Layout } from '@/game/engine/keyLabels'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Global scope so the Options UI strings resolve from the shared locale
// bundles (src/i18n/locales/*) — same source as the rest of the game.
const { t, locale }: any = useI18n({ useScope: 'global' })
const appI18n: any = (window as any).__i18n

const {
  setSettingValue,
  userLanguage,
  userDifficulty,
  userSoundVolume,
  userMusicVolume,
  userMusicTrack
} = useUser()

const currentTab = ref('general')

// The dropdown shows the language ON SCREEN, not the stored setting: a
// first-time player on a German portal saw German text with "English"
// selected, and picking English then changed nothing (#115). A pick is always
// the player's choice and always applied, even when it equals the stored one.
const chooseLanguage = (code: string): void => {
  setSettingValue('language', code)
  if (appI18n) void setI18nLocale(appI18n, code)
  else locale.value = code
}

watch(userLanguage, async (newValue: string) => {
  if (appI18n) {
    await setI18nLocale(appI18n, newValue)
  } else {
    locale.value = newValue
  }
})

const isMobile = computed(() => {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
})

const tabs = computed(() => {
  const list = [
    { value: 'general', label: t('options.general') },
    // Gameplay: how the game plays (difficulty, vibration), apart from
    // language and sound.
    { value: 'gameplay', label: t('options.gameplay') }
  ]
  if (isMobile.value) return list
  const desk = list.concat({ label: t('options.audio'), value: 'audio' })
  // Keyboard layout and rebinding: a keyboard player's tab, never a phone's.
  return touchFirst() ? desk : desk.concat({ label: t('pause.controls'), value: 'controls' })
})

// Native-name dropdown — every option legible regardless of the active locale.
const languagesList = computed(() =>
  LANGUAGES.map(loc => ({
    value: loc,
    label: LANGUAGE_AUTONYMS[loc] ?? loc,
    lang: bcp47For(loc)
  }))
)

const difficultyList = computed(() => [
  { value: DIFFICULTY.EASY, label: t('options.difficulties.easy') },
  { value: DIFFICULTY.MEDIUM, label: t('options.difficulties.medium') },
  { value: DIFFICULTY.HARD, label: t('options.difficulties.hard') }
])

const difficultyHint = computed(() => t('options.difficultyHints.' + userDifficulty.value))

// Music mood — the zone's own theme (default), or the calm town theme everywhere.
const musicTrackList = computed(() => [
  { value: 'trance', label: t('options.musicTracks.trance') },
  { value: 'cozy', label: t('options.musicTracks.cozy') }
])

// ─── Vibration ──────────────────────────────────────────────────────────────
//
// `hapticsAvailable` is resolved once at module load and is false on every
// desktop and on every iPhone — `navigator.vibrate` is absent on iOS Safari
// entirely, and desktop Chrome ships it as a silent no-op. The row is therefore
// hidden rather than disabled: a settings control that provably cannot do
// anything on this device teaches the player that the settings lie.
//
// An `FSelect` rather than a bespoke switch, because every other control on
// this tab is one and the modal has no toggle atom — a one-off switch here
// would be the only control in the game that looks like that.
const hapticsList = computed(() => [
  { value: 'on', label: t('options.on') },
  { value: 'off', label: t('options.off') }
])

// ─── Controls: keyboard layout + key rebinding ──────────────────────────────
//
// Keys are PHYSICAL (`engine/keyBindings.ts`); the layout only decides what
// they are called (`engine/keyLabels.ts`). Auto-detect on: the detected
// layout names them; off: the one picked here does.
const layoutList = LAYOUTS.map(l => ({ value: l, label: l.toUpperCase() }))
const detectedName = computed(() => (keyboard.detected ?? 'qwerty').toUpperCase())
const pickLayout = (v: string): void => { if ((LAYOUTS as string[]).includes(v)) setManualLayout(v as Layout) }

/** The action waiting for its new key, if any. */
const capturing = ref<Action | null>(null)
const onCapture = (e: KeyboardEvent): void => {
  const a = capturing.value
  if (!a) return
  // Ours alone: the game's own key handler must not also act on this press.
  e.preventDefault()
  e.stopImmediatePropagation()
  if (e.code === 'Escape') { stopCapture(); return }
  if (!isBindable(e.code)) return
  bindKey(a, e.code)
  stopCapture()
}
const stopCapture = (): void => {
  capturing.value = null
  window.removeEventListener('keydown', onCapture, true)
}
const startCapture = (a: Action): void => {
  if (capturing.value === a) { stopCapture(); return }
  capturing.value = a
  window.addEventListener('keydown', onCapture, true)
}
watch(currentTab, stopCapture)
onUnmounted(stopCapture)
</script>

<template lang="pug">
  FModal(
    :model-value="isOpen"
    :is-closable="false"
    :title="t('options.title')"
    :tabs="tabs"
    surface="parchment"
    v-model:activeTab="currentTab"
    @update:model-value="emit('close')"
  )
    div(v-if="currentTab === 'general'")
      //- Landscape mobile lays the controls out in 2 columns so all of them
      //- (language, difficulty + hint, the two sliders, music track) fit the
      //- short viewport without the SAVE & CLOSE footer overlapping them.
      div(:class="isMobileLandscape ? 'grid grid-cols-2 gap-x-4 gap-y-1 p-1 items-start' : 'flex flex-col gap-2 p-2'")
        div(class="z-[20] flex flex-col gap-2")
          FSelect(
            :label="t('options.language')"
            :options="languagesList"
            :model-value="locale"
            @update:model-value="chooseLanguage($event)"
          )
        hr.opt-rule(v-if="!isMobileLandscape")
        FSlider.px-4(class="!py-1 !pb-3 w-full max-w-[min(20rem,90%)]" :model-value="userSoundVolume" @update:modelValue="setSettingValue('sound', $event)" :label="t('options.soundEffects')" :min="0" :max="1" :step="0.01")
        FSlider.px-4(class="!py-1 !pb-2 w-full max-w-[min(20rem,90%)]" :model-value="userMusicVolume" @update:modelValue="setSettingValue('music', $event)" :label="t('options.music')" :min="0" :max="1" :step="0.01")
        div(class="z-[5] flex flex-col gap-1")
          FSelect(
            :label="t('options.musicTrack')"
            :options="musicTrackList"
            :model-value="userMusicTrack"
            @update:model-value="setSettingValue('musicTrack', $event)"
          )

    div(v-else-if="currentTab === 'gameplay'").flex.flex-col.gap-2.p-2
      div(class="z-[20] flex flex-col gap-1")
        FSelect(
          :label="t('options.difficulty')"
          :options="difficultyList"
          :model-value="userDifficulty"
          @update:model-value="setSettingValue('difficulty', $event)"
        )
        p.opt-hint {{ difficultyHint }}
      //- Vibration: phones only (hidden where there is no motor).
      div(v-if="hapticsAvailable" class="z-[1] flex flex-col gap-1")
        FSelect(
          :label="t('options.haptics')"
          :options="hapticsList"
          :model-value="hapticsEnabled ? 'on' : 'off'"
          @update:model-value="setHapticsEnabled($event === 'on')"
        )

    div(v-else-if="currentTab === 'audio'").flex.flex-col.justify-between.items-center
      FSlider.px-4(class="!py-1 !pb-3 w-full max-w-[min(20rem,90%)]" :model-value="userSoundVolume" @update:modelValue="setSettingValue('sound', $event)" :label="t('options.soundEffects')" :min="0" :max="1" :step="0.01")
      FSlider.px-4(class="!py-1 !pb-2 w-full max-w-[min(20rem,90%)]" :model-value="userMusicVolume" @update:modelValue="setSettingValue('music', $event)" :label="t('options.music')" :min="0" :max="1" :step="0.01")
      div(class="z-[5] flex flex-col gap-1 w-full max-w-[min(20rem,100%)]")
        FSelect(
          :label="t('options.musicTrack')"
          :options="musicTrackList"
          :model-value="userMusicTrack"
          @update:model-value="setSettingValue('musicTrack', $event)"
        )
      hr.opt-rule

    div(v-else-if="currentTab === 'controls'").flex.flex-col.gap-2.p-2
      div(class="z-[20] flex flex-col gap-1")
        FSelect(
          :label="t('options.keyboard.auto')"
          :options="hapticsList"
          :model-value="keyboard.auto ? 'on' : 'off'"
          @update:model-value="setAutoLayout($event === 'on')"
        )
        p.opt-hint(v-if="keyboard.auto") {{ t('options.keyboard.detected', { layout: detectedName }) }}
      div(v-if="!keyboard.auto" class="z-[10] flex flex-col gap-1")
        FSelect(
          :label="t('options.keyboard.layout')"
          :options="layoutList"
          :model-value="keyboard.manual"
          @update:model-value="pickLayout"
        )
      hr.opt-rule
      div.flex.items-center.justify-between.px-1
        span.opt-head {{ t('options.keyboard.bindings') }}
        button.reset-keys(type="button" :disabled="!bindingsChanged()" @click="resetBindings()") {{ t('options.keyboard.reset') }}
      p.opt-hint(v-if="capturing") {{ t('options.keyboard.press') }}
      ul.bindings
        li.bind-row(v-for="a in ACTIONS" :key="a")
          span.bind-name {{ t(`options.actions.${a}`) }}
          button.bind-key(type="button" :class="{ waiting: capturing === a }" @click="startCapture(a)") {{ capturing === a ? '…' : keyLabel(primaryCode(a)) }}

    template(#footer)
      div.flex.flex-wrap.items-center.justify-center.gap-2
        FButton(class="px-6 sm:px-8" @click="emit('close')") {{ t('options.close') }}
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.opt-hint
  margin: 0
  padding-inline: 0.25rem
  color: var(--bc-on-soft)
  font-size: clamp(0.66rem, 2.8vmin, 0.8rem)
  line-height: 1.25
  text-align: start
.opt-rule
  width: 100%
  margin: 0.3rem 0
  border: 0
  border-top: 2px dashed var(--bc-rule)
.opt-head
  color: var(--bc-on)
  font-size: clamp(0.76rem, 3vmin, 0.92rem)
.bindings
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr))
  gap: 4px 12px
  max-height: min(46vh, 22rem)
  overflow-y: auto
  margin: 0
  padding: 0 4px 4px
  list-style: none
  +cel.scrollbar
.bind-row
  display: flex
  align-items: center
  justify-content: space-between
  gap: 8px
  padding: 3px 6px
  +cel.cell
.bind-name
  color: var(--bc-on)
  font-size: clamp(0.7rem, 2.4vmin, 0.84rem)
  line-height: 1.2
  text-align: start
// A key cap: pale, ink-edged, standing on its own shadow.
.bind-key
  min-width: 2.4em
  height: 1.9em
  padding: 0 0.45em
  border-radius: 0.4em
  background: var(--bc-steel-hi)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  box-shadow: 0 0.18em 0 var(--bc-ink)
  color: var(--bc-ink)
  font-family: var(--font-ui)
  font-size: 0.72rem
  cursor: pointer
  +cel.focus-ring
  &:active
    transform: translateY(0.12em)
    box-shadow: 0 0.06em 0 var(--bc-ink)
  &.waiting
    background: var(--bc-gold)
    animation: key-wait 0.9s ease-in-out infinite
.reset-keys
  +cel.tone('blue')
  padding: 2px 10px
  border-radius: var(--bc-r-sm)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  +cel.fill(46%, 100%)
  box-shadow: 0 2px 0 var(--bc-ink)
  +cel.label
  font-size: 0.72rem
  cursor: pointer
  +cel.focus-ring
  &:disabled
    +cel.tone('off')
    opacity: 0.7
    cursor: default
@keyframes key-wait
  50%
    transform: scale(1.08)
</style>
