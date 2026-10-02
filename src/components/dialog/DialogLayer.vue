<template lang="pug">
  div.dialog(
    v-show="active"
    ref="root"
    :class="[`dialog--${talk.stage}`, { 'has-list': listUp, 'has-close': canLeave }]"
  )
    div.dialog__shade(aria-hidden="true")
    //- A tap anywhere: finish the line, then the next one.
    button.dialog__tap(type="button" :aria-label="t('ui.next')" :disabled="!canTap" @click="advance")
    div.dialog__safe(ref="safe")
      //- In the world: the line floats over its speaker's head.
      SpeechBubble.dialog__float(
        v-if="talk.stage === 'world' && talk.line"
        :key="talk.beat"
        ref="bubble"
        :text="text"
        :name="name"
        :tone="who"
        :emotion="talk.line.emotion"
        :cue="cue"
        tail
      )
      //- The speaker is not in the scene: a portrait and the line beside it.
      div.dialog__card(v-if="talk.stage === 'portrait'")
        p.dialog__title(v-if="talk.title") {{ t(talk.title) }}
        div.dialog__speaker(v-if="talk.line" :key="talk.beat" :class="`by-${who}`")
          span.dialog__face(v-if="who !== 'narrator'")
            Portrait(:look="who === 'hero' ? 'hero' : look" :ring="who === 'hero' ? 'var(--bc-blue-hi)' : 'var(--bc-gold)'")
          SpeechBubble.dialog__line(
            ref="bubble"
            :text="text"
            :name="name"
            :tone="who"
            :emotion="talk.line.emotion"
            :cue="cue"
          )
        TalkOutcome.dialog__outcome(v-if="talk.outcome" :choice="talk.outcome")
      div.dialog__bottom(v-show="listUp" ref="bottom")
        p.dialog__warn(v-if="talk.final && talk.phase === 'choices'") {{ t('quest.final') }}
        ChoiceList(
          v-if="talk.phase === 'choices'"
          :choices="talk.choices"
          :focus="focus"
          :keys="hud.device === 'mouse'"
          @update:focus="focus = $event"
          @pick="pick"
        )
        div.dialog__go(v-else-if="mustConfirm")
          FButton(:label="t('ui.continue')" type="success" size="md" attention @click="next")
      button.dialog__close(v-if="canLeave" type="button" :aria-label="t('dlg.ui.leave')" @click="leave")
        GameIcon(name="close")
</template>

<script setup lang="ts">
/**
 * ─── The conversation layer (D37) ────────────────────────────────────────────
 *
 * Draws `talk` (`game/talk.ts`) over the running scene: no window, no pause.
 *
 *   • in a town the spoken line is a SPEECH BUBBLE over the speaker's head,
 *     projected every frame from the scene (`ZoneMode.speakerAnchor`), clamped
 *     to the safe area and kept clear of the list of topics;
 *   • where the speaker is not in the scene — a quest's decision after a
 *     fight, a hidden trainer met on the map — the same bubble sits beside a
 *     portrait at the top;
 *   • the hero's topics are a list at the bottom (beside the speakers on a
 *     short landscape screen: `ZoneMode` frames the camera for the same split).
 *
 * A line types itself out; a tap, a click, Space or Enter completes it and
 * then moves on. 1–9 and the arrows + Enter choose a topic. Esc (or the close
 * button) takes a polite leave, except inside a quest decision. A line with a
 * recording (`audio/speech.ts`) is spoken and moves on by itself; one without
 * is paced by its text, with a soft blip.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { flow } from '@/game/flow'
import { talk, talkLeave, talkNext, talkPick } from '@/game/talk'
import { currentZone } from '@/game/boot'
import { hud } from '@/game/state/hud'
import { isDense, TYPE_CPS, TYPE_CPS_DENSE, voiceSeed } from '@/game/dialog/pacing'
import { speakLine, speechBlip, stopSpeech } from '@/game/audio/speech'
import { isAnyModalOpen } from '@/use/useModalState'
import FButton from '@/components/atoms/FButton.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import Portrait from '@/components/art/Portrait.vue'
import SpeechBubble from './SpeechBubble.vue'
import ChoiceList from './ChoiceList.vue'
import TalkOutcome from './TalkOutcome.vue'

const { t, te, locale } = useI18n()

const root = ref<HTMLElement | null>(null)
const safe = ref<HTMLElement | null>(null)
const bottom = ref<HTMLElement | null>(null)
const bubble = ref<InstanceType<typeof SpeechBubble> | null>(null)

/** The conversation has the screen: no window over it (the shop it opened,
 *  the controls page, Options). */
const active = computed(() => !!flow.talk && talk.on && !flow.modal && !isAnyModalOpen.value)

const who = computed<'npc' | 'hero' | 'narrator'>(() => {
  const by = talk.line?.by
  return by === 'hero' ? 'hero' : by === 'narrator' ? 'narrator' : 'npc'
})
/** The portrait of whoever speaks (a named third party brings their own). */
const look = computed(() => {
  const by = talk.line?.by
  return by && by !== 'npc' && by !== 'hero' && by !== 'narrator' ? by : talk.conv?.look ?? 'elder'
})
const text = computed(() => (talk.line ? t(talk.line.id) : ''))
const name = computed(() => {
  const l = talk.line
  if (!l || !talk.conv || l.by === 'narrator') return ''
  if (l.by === 'hero') return t('dlg.ui.hero')
  if (l.by === 'npc') return t(talk.conv.name)
  return te(`npc.${l.by}.name`) ? t(`npc.${l.by}.name`) : te(`enemy.${l.by}`) ? t(`enemy.${l.by}`) : ''
})

/** The whole line is on screen. */
const typed = ref(false)
/** The last line of a decision's outcome waits for a deliberate Continue (its
 *  rewards are on screen): a stray tap must not skip it. */
const mustConfirm = computed(() => !!talk.outcome && talk.phase === 'line' && !talk.more && typed.value)
const canTap = computed(() => talk.phase === 'line' && !mustConfirm.value)
const cue = computed(() => talk.phase === 'line' && typed.value && !mustConfirm.value && !talk.leaving)
const listUp = computed(() => talk.phase === 'choices' || mustConfirm.value)
const canLeave = computed(() => !talk.final && !talk.outcome && !talk.leaving)

// ─── The typewriter and the voice ────────────────────────────────────────────

let t0 = 0
let cps = TYPE_CPS
let shown = 0
let total = 0
let doneAt = 0
/** When the recording ends (ms, `performance.now`); 0 = a text-paced line. */
let audioEnd = 0
let seed = 0.5
let lineNo = 0
/** A line is up whose bubble has not been set going yet. */
let pending = true
/** Seconds a farewell stays up after it has typed itself out. */
const LEAVE_HOLD_MS = 850
const AFTER_AUDIO_MS = 320

const finishTyping = (now: number): void => {
  shown = total
  bubble.value?.reveal(Infinity)
  typed.value = true
  doneAt = now
}

/** A new line is up: type it, and speak it if it has a recording. */
const begin = (): void => {
  const l = talk.line
  const b = bubble.value
  if (!l || !b) return
  const mine = ++lineNo
  pending = false
  total = b.length()
  shown = 0
  typed.value = total === 0
  t0 = performance.now()
  doneAt = t0
  cps = isDense(text.value) ? TYPE_CPS_DENSE : TYPE_CPS
  audioEnd = 0
  seed = voiceSeed(l.by === 'npc' ? talk.conv?.look ?? '' : l.by)
  b.reveal(0)
  if (talk.stage === 'world' && who.value !== 'narrator') currentZone()?.speakerBeat(who.value)
  void speakLine(l.id, locale.value).then((sec) => {
    if (sec <= 0 || mine !== lineNo) return
    // Spoken: the text keeps pace with the voice, and the line moves on with it.
    const now = performance.now()
    audioEnd = now + sec * 1000
    if (!typed.value) { cps = Math.max(8, total / (sec * 0.9)); t0 = now - (shown / cps) * 1000 }
  })
}

const tickType = (now: number): void => {
  if (pending || (talk.phase !== 'line' && typed.value)) return
  if (!typed.value) {
    const n = Math.min(total, Math.floor(((now - t0) / 1000) * cps))
    if (n !== shown) {
      shown = n
      bubble.value?.reveal(n)
      // No recording: a soft blip every few letters stands in for the voice.
      if (!audioEnd && n % 3 === 1) speechBlip(seed, talk.line?.emotion === 'whisper' ? 0.5 : 1)
    }
    if (n >= total) finishTyping(now)
    return
  }
  if (talk.phase !== 'line' || mustConfirm.value) return
  // A spoken line moves on when the voice has finished; a farewell by itself.
  if (audioEnd ? now > audioEnd + AFTER_AUDIO_MS : talk.leaving && now > doneAt + LEAVE_HOLD_MS) next()
}

// ─── Where the bubble sits ───────────────────────────────────────────────────

const anchor = { x: 0, y: 0 }
const other = { x: 0, y: 0 }
const feet = { x: 0, y: 0 }
/** How close to the bubble's edge its tail may sit. */
const TAIL_MIN = 22
const TAIL_GAP = 2
const GAP = 8

const place = (): void => {
  if (talk.stage !== 'world') return
  const el = bubble.value?.el
  const s = safe.value
  const r = root.value
  if (!el || !s || !r) return
  const zone = currentZone()
  const W = s.clientWidth
  const H = s.clientHeight
  const bw = el.offsetWidth
  const bh = el.offsetHeight
  // The list of topics: beside the speakers on a short landscape screen
  // (the same breakpoint as `ZoneMode`'s framing), under them elsewhere.
  const b = bottom.value
  const list = b && b.offsetHeight > 0 ? b : null
  const side = r.clientHeight < 480 && r.clientWidth > r.clientHeight
  const maxRight = list && side ? list.offsetLeft - GAP : W
  const maxBottom = list && !side ? list.offsetTop - GAP : H
  const me = who.value
  let has = false
  if (zone && me !== 'narrator') has = zone.speakerAnchor(me, anchor)
  // Surface pixels → the safe box's own.
  const ax = has ? anchor.x - s.offsetLeft : Math.min(W, maxRight) / 2
  let ay = has ? anchor.y - s.offsetTop : bh + TAIL_GAP + H * 0.12
  const left = Math.max(0, Math.min(maxRight - bw, ax - bw / 2))
  // Whoever stands nearer the camera is LOWER on screen, and a bubble over
  // their head would cover the other's face: theirs hangs under their feet
  // instead, its tail pointing up. (Not while the list is up: it is down there.)
  let under = false
  if (has && zone && me !== 'narrator' && !list && zone.speakerAnchor(me === 'hero' ? 'npc' : 'hero', other) && anchor.y > other.y + 4) {
    if (zone.speakerAnchor(me, feet, true) && feet.y - s.offsetTop + TAIL_GAP + bh <= maxBottom) {
      under = true
      ay = feet.y - s.offsetTop
    }
  }
  let top = under ? ay + TAIL_GAP : ay - bh - TAIL_GAP
  if (top + bh > maxBottom) top = maxBottom - bh
  if (top < 0) top = 0
  el.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(top)}px, 0)`
  el.style.setProperty('--tail-x', `${Math.round(Math.max(TAIL_MIN, Math.min(bw - TAIL_MIN, ax - left)))}px`)
  el.classList.toggle('tail-up', under)
  // The tail only when the bubble really is clear of whoever it points at.
  el.classList.toggle('no-tail', !has || (under ? top < ay - 2 : top + bh > ay + 2))
  el.classList.add('is-placed')
}

/** The list is longer than its box (a short screen, long words): it scrolls,
 *  and fades out at the bottom while there is more below. */
const moreBelow = (): void => {
  const b = bottom.value
  if (b) b.classList.toggle('more-below', b.scrollHeight - b.clientHeight - b.scrollTop > 6)
}

let raf = 0
let frames = 0
const frame = (now: number): void => {
  raf = requestAnimationFrame(frame)
  if (!active.value) return
  tickType(now)
  place()
  if ((frames++ & 7) === 0) moreBelow()
}

// ─── Input ───────────────────────────────────────────────────────────────────

const focus = ref(-1)
/** When the layer last became the active one: the key that closed a window
 *  over it (Esc, Enter) is not an answer to the conversation. */
let armedAt = 0

const next = (): void => {
  stopSpeech()
  talkNext()
}

/** A tap / Space / Enter on a line: show it whole first, then move on. */
const advance = (): void => {
  if (talk.phase !== 'line') return
  if (!typed.value) { finishTyping(performance.now()); return }
  if (mustConfirm.value) return
  next()
}

const pick = (id: string): void => {
  stopSpeech()
  talkPick(id)
}

const leave = (): void => {
  stopSpeech()
  talkLeave()
}

const typing = (e: KeyboardEvent): boolean => {
  const tag = (e.target as HTMLElement | null)?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const onKey = (e: KeyboardEvent): void => {
  if (!active.value || typing(e) || performance.now() - armedAt < 140) return
  const k = e.code
  if (k === 'Escape') {
    e.preventDefault()
    if (!e.repeat) leave()
    return
  }
  const go = k === 'Space' || k === 'Enter' || k === 'NumpadEnter'
  if (talk.phase === 'line') {
    if (!go) return
    e.preventDefault()
    if (e.repeat) return
    if (mustConfirm.value) next()
    else advance()
    return
  }
  if (talk.phase !== 'choices') return
  const n = talk.choices.length
  const digit = /^(?:Digit|Numpad)([1-9])$/.exec(k)
  if (digit) {
    const c = talk.choices[Number(digit[1]) - 1]
    if (c && !e.repeat) { e.preventDefault(); focus.value = Number(digit[1]) - 1; pick(c.id) }
  } else if (k === 'ArrowDown' || k === 'ArrowRight') {
    e.preventDefault()
    focus.value = (focus.value + 1) % n
  } else if (k === 'ArrowUp' || k === 'ArrowLeft') {
    e.preventDefault()
    focus.value = focus.value <= 0 ? n - 1 : focus.value - 1
  } else if (go) {
    e.preventDefault()
    if (e.repeat) return
    const c = talk.choices[focus.value]
    if (c) pick(c.id)
    else focus.value = 0
  }
}

// A new line: the bubble is a new element, so wait for it (and until then
// nothing of the old line's state counts for the new one).
watch(() => talk.beat, () => { pending = true; typed.value = false; void nextTick(begin) }, { flush: 'sync' })
// The list comes up: the keys start on the first topic (a finger needs no highlight).
watch(() => talk.phase, (p) => {
  if (p === 'choices') {
    focus.value = hud.device === 'mouse' ? 0 : -1
    // The line stays up behind the list, whole.
    if (!typed.value) finishTyping(performance.now())
  }
})
watch(active, (on) => {
  armedAt = on ? performance.now() : Infinity
  if (!on) stopSpeech()
}, { immediate: true })

onMounted(() => {
  window.addEventListener('keydown', onKey)
  raf = requestAnimationFrame(frame)
  void nextTick(begin)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  cancelAnimationFrame(raf)
  stopSpeech()
})
</script>

<style scoped lang="sass">
.dialog
  --pad: clamp(0.5rem, 2.2vmin, 1rem)
  position: absolute
  inset: 0
  z-index: 30
  overflow: hidden
  font-family: var(--font-ui)
  pointer-events: none
  user-select: none
  -webkit-user-select: none
// The scene dims a little where the list sits; a portrait conversation dims
// all of it (there is a result screen's worth of scene, or the map, behind).
.dialog__shade
  position: absolute
  inset: 0
  background: linear-gradient(0deg, rgba(var(--bc-ink-rgb), 0.62) 0, rgba(var(--bc-ink-rgb), 0.28) 30%, rgba(var(--bc-ink-rgb), 0) 56%)
  opacity: 0
  transition: opacity 260ms ease-out
.has-list .dialog__shade
  opacity: 1
.dialog--portrait .dialog__shade
  background: rgba(var(--bc-ink-rgb), 0.58)
  opacity: 1
.dialog__tap
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  margin: 0
  padding: 0
  border: 0
  background: none
  pointer-events: auto
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  &:disabled
    cursor: default
  &:focus
    outline: none
.dialog__safe
  position: absolute
  top: calc(env(safe-area-inset-top, 0px) + var(--pad))
  right: calc(env(safe-area-inset-right, 0px) + var(--pad))
  bottom: calc(env(safe-area-inset-bottom, 0px) + var(--pad))
  left: calc(env(safe-area-inset-left, 0px) + var(--pad))
.dialog__float
  position: absolute
  top: 0
  left: 0
  width: max-content
  max-width: min(21rem, 100%)
  visibility: hidden
  will-change: transform
  &.is-placed
    visibility: visible
  &.no-tail :deep(.bubble__tail)
    display: none

// ── The speaker is not in the scene ──
.dialog__card
  position: absolute
  top: 0
  left: 50%
  transform: translateX(-50%)
  width: min(34rem, 100%)
  display: flex
  flex-direction: column
  gap: clamp(0.5rem, 2.2vmin, 0.9rem)
  box-sizing: border-box
// Room for the close button beside the line.
.has-close .dialog__card
  padding-inline-end: calc(max(2.75rem, 44px) + 0.4rem)
.dialog__title
  align-self: center
  margin: 0
  padding: 0.2em 1.1em 0.26em
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: var(--bc-r-pill)
  background: linear-gradient(180deg, var(--bc-red-hi) 0, var(--bc-red-hi) 46%, var(--bc-red) 46%, var(--bc-red) 86%, var(--bc-red-lo) 86%)
  box-shadow: var(--bc-drop)
  color: var(--bc-text)
  text-shadow: var(--bc-text-outline)
  font-size: clamp(0.95rem, 4.2vmin, 1.35rem)
  line-height: 1.2
  text-align: center
.dialog__speaker
  display: flex
  align-items: flex-start
  gap: clamp(0.4rem, 2vmin, 0.8rem)
  &.by-hero
    flex-direction: row-reverse
  &.by-narrator
    justify-content: center
.dialog__face
  flex: 0 0 auto
  width: clamp(3.2rem, 15vmin, 5rem)
  margin-top: 0.5em
  animation: face-in 260ms var(--bc-ease-pop) both
.dialog__line
  flex: 0 1 auto
  min-width: 0
.by-npc .dialog__line :deep(.bubble__body)
  transform-origin: 0 30%
.by-hero .dialog__line :deep(.bubble__body)
  transform-origin: 100% 30%
// The bubble points at the face beside it.
.by-npc .dialog__line :deep(.bubble__body)::before, .by-hero .dialog__line :deep(.bubble__body)::before
  content: ''
  position: absolute
  top: 0.95em
  inset-inline-start: 0
  width: 0.8em
  height: 0.8em
  border: var(--bc-ol) solid var(--bc-ink)
  border-top-color: transparent
  border-inline-end-color: transparent
  background: var(--paper)
  transform: translate(-58%, 0) rotate(45deg)
  clip-path: polygon(-10% -10%, -10% 110%, 110% 110%)
[dir="rtl"] .by-npc .dialog__line :deep(.bubble__body)::before
  transform: translate(58%, 0) rotate(-45deg)
  clip-path: polygon(110% -10%, 110% 110%, -10% 110%)
.by-hero .dialog__line :deep(.bubble__body)::before
  inset-inline-start: auto
  inset-inline-end: 0
  border-inline-end-color: var(--bc-ink)
  border-inline-start-color: transparent
  transform: translate(58%, 0) rotate(-45deg)
  clip-path: polygon(110% -10%, 110% 110%, -10% 110%)
[dir="rtl"] .by-hero .dialog__line :deep(.bubble__body)::before
  transform: translate(-58%, 0) rotate(45deg)
  clip-path: polygon(-10% -10%, -10% 110%, 110% 110%)
.dialog__outcome
  pointer-events: none

// ── What the hero can say ──
.dialog__bottom
  position: absolute
  left: 50%
  bottom: 0
  transform: translateX(-50%)
  box-sizing: border-box
  width: min(34rem, 100%)
  max-height: 58%
  display: flex
  flex-direction: column
  gap: clamp(0.3rem, 1.3vmin, 0.5rem)
  // Room for the focus ring and the drop shadow inside the scroll box.
  padding: 4px 6px 6px
  overflow-x: hidden
  overflow-y: auto
  overscroll-behavior: contain
  scrollbar-width: thin
  pointer-events: auto
  touch-action: pan-y
.dialog__bottom.more-below
  -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 2.2rem), transparent 100%)
  mask-image: linear-gradient(180deg, #000 calc(100% - 2.2rem), transparent 100%)
.dialog__bottom > :deep(.choices)
  animation: list-in 240ms var(--bc-ease-out) both
.dialog__warn
  margin: 0
  color: var(--bc-text-bad)
  text-shadow: var(--bc-text-outline-thin)
  font-size: clamp(0.74rem, 3vmin, 0.92rem)
  text-align: center
.dialog__go
  display: flex
  justify-content: center
  padding-bottom: 0.3rem
.dialog__close
  position: absolute
  top: 0
  inset-inline-end: 0
  width: max(2.75rem, 44px)
  height: max(2.75rem, 44px)
  box-sizing: border-box
  padding: 0.6rem
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-stone-hi) 0, var(--bc-stone-hi) 46%, var(--bc-stone) 46%, var(--bc-stone) 100%)
  box-shadow: var(--bc-drop)
  color: var(--bc-white)
  pointer-events: auto
  cursor: pointer
  touch-action: manipulation
  -webkit-tap-highlight-color: transparent
  transition: transform var(--bc-t-release) var(--bc-ease-bounce)
  &:active
    transition-duration: var(--bc-t-press)
    transform: translateY(var(--bc-press-sm)) scale(1.02, 0.95)
  &:focus
    outline: none
  &:focus-visible
    box-shadow: var(--bc-focus)

// A short landscape screen (a phone on its side): the list goes BESIDE the
// speakers, and the camera (`ZoneMode.talkFrame`) leaves that half free.
@media (orientation: landscape) and (max-height: 479.98px)
  .dialog__bottom
    left: auto
    right: 0
    transform: none
    width: 46%
    max-height: 100%
  .dialog__float
    max-width: min(21rem, 52%)
  .dialog__card
    left: 0
    transform: none
    width: 52%
    padding-inline-end: 0
  // (Physical sides: the list is on the right in every writing direction.)
  .dialog__close
    inset-inline-end: auto
    left: 0
    top: auto
    bottom: 0

@keyframes list-in
  from
    opacity: 0
    transform: translateY(0.7rem)
@keyframes face-in
  from
    opacity: 0
    transform: scale(0.7)
@media (prefers-reduced-motion: reduce)
  .dialog__bottom > :deep(.choices), .dialog__face
    animation: none
</style>
