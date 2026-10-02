<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import FTabs, { type TabOption } from '@/components/atoms/FTabs.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { sfx } from '@/game/audio/sfx'
import { acquireModalOpen } from '@/use/useModalState'

const { t } = useI18n()

/**
 * ─── The window (D41) ────────────────────────────────────────────────────────
 *
 * A page in a stitched leather rim, riveted at the corners, under a coloured
 * title ribbon (or a row of folder tabs). Two pages:
 *
 *   • `parchment` — warm cream, brown ink. THE house style: every window is
 *     parchment unless it says otherwise.
 *   • `wood` — a dark walnut page with light lettering. Only for a window
 *     written before the parchment (white text set straight on the page),
 *     until it is rebuilt.
 *
 * The page re-declares the `--bc-on*` and `--bc-cell*` tokens, so whatever
 * is slotted in (and every F control) reads right on either without knowing
 * which one it is on.
 */
interface Props {
  modelValue: boolean | any
  title?: string
  isClosable?: boolean
  tabs?: TabOption[]
  activeTab?: string | number
  /** The page the content sits on. */
  surface?: 'parchment' | 'wood'
  /** The title ribbon's colour. */
  tone?: 'gold' | 'blue' | 'green' | 'red' | 'purple'
}

const props = withDefaults(defineProps<Props>(), {
  isClosable: true,
  tabs: () => [],
  surface: 'parchment',
  tone: 'gold'
})

const emit = defineEmits(['update:modelValue', 'update:activeTab'])

// Root is a <Teleport>, so class/style passed by parents can't auto-inherit and
// Vue warns about extraneous attrs. Opt out and forward $attrs explicitly.
defineOptions({ inheritAttrs: false })



// ─── Header / content overlap ───────────────────────────────────────────────
//
// The ribbon header deliberately overhangs the frame's top edge (that's the
// look). Previously the content slot compensated with a hard-coded
// `pt-6 sm:pt-7 md:pt-9`, which is a guess: it was too small when the title
// wrapped to two lines or the tab row grew, and the first row of content ended
// up UNDER the ribbon.
//
// Now the header's real height is measured with a ResizeObserver and published
// as `--fmodal-header-overlap`. The content slot pads by exactly the amount the
// header actually overhangs, so an overlap is impossible at any viewport, in
// any language, at any font size.
const headerRef = ref<HTMLElement | null>(null)
const headerOverlap = ref(0)
let observer: ResizeObserver | null = null

/** How far the header dips INTO the frame, in px. The header sits above the
 *  frame and is pulled down by this much (see `--fmodal-header-dip`), so the
 *  content must clear exactly that plus a small breathing gap. A ribbon hangs
 *  over the frame's edge; folder tabs stand ON it and do not dip at all. */
const HEADER_DIP_RATIO = 0.55

const measureHeader = (): void => {
  const el = headerRef.value
  if (!el || (props.tabs && props.tabs.length > 0)) { headerOverlap.value = 0; return }
  const h = el.getBoundingClientRect().height
  headerOverlap.value = h > 0 ? Math.round(h * HEADER_DIP_RATIO) : 0
}

const attachObserver = async (): Promise<void> => {
  await nextTick()
  if (!headerRef.value) return
  observer?.disconnect()
  observer = new ResizeObserver(measureHeader)
  observer.observe(headerRef.value)
  measureHeader()
}

// ─── Modal-open signal (CrazyGames gameplayStop/Start) ──────────────────────
// Centralised here so every FModal consumer participates without per-modal
// wiring. Refcounted; held once per open, dropped on close or unmount.
let releaseModalOpen: (() => void) | null = null
const markOpen = (): void => { if (!releaseModalOpen) releaseModalOpen = acquireModalOpen() }
const markClosed = (): void => { releaseModalOpen?.(); releaseModalOpen = null }

watch(() => props.modelValue, (open, prev) => {
  if (open && !prev) sfx('uiOpen')
  else if (!open && prev) sfx('uiClose')
  if (open) { markOpen(); void attachObserver() } else { markClosed(); observer?.disconnect() }
})

// Re-measure when the header's content changes (title text, tab set).
watch(() => [props.title, props.tabs?.length], () => { void nextTick(measureHeader) })

onMounted(() => {
  if (props.modelValue) { markOpen(); void attachObserver() }
})
onUnmounted(() => {
  markClosed()
  observer?.disconnect()
  observer = null
})

const close = (): void => emit('update:modelValue', false)
const onClose = (): void => {
  sfx('uiClick')
  close()
}
const handleTabChange = (val: string | number): void => emit('update:activeTab', val)
</script>

<template lang="pug">
  //- Teleport to body so `position: fixed` isn't trapped by an ancestor
  //- transform, which would promote that ancestor to a containing block.
  Teleport(to="body")
    Transition(
      name="pop"
      appear
      enter-active-class="transition-all duration-[380ms] ease-[cubic-bezier(0.18,0.89,0.32,1.28)]"
      leave-active-class="transition-all duration-[180ms] ease-[cubic-bezier(0.6,-0.28,0.735,0.045)]"
      enter-from-class="opacity-0 scale-90 translate-y-6"
      leave-to-class="opacity-0 scale-90 translate-y-6"
    )
      div.f-modal(
        v-if="modelValue"
        v-bind="$attrs"
        :class="[`f-modal--${surface}`, `ribbon-${tone}`, { 'is-closable': isClosable }]"
        :style="{ '--fmodal-header-overlap': headerOverlap + 'px' }"
        role="dialog"
        aria-modal="true"
      )
        //- Backdrop
        div.f-modal__backdrop(@click="isClosable && close()")

        div.f-modal__container
          //- Header (title ribbon or tab bar). Lives IN the layout flow so it
          //- can never be pushed above the viewport's top edge.
          div.f-modal__header(
            v-if="(tabs && tabs.length > 0) || title"
            ref="headerRef"
          )
            FTabs(
              v-if="tabs && tabs.length > 0"
              :model-value="activeTab"
              :options="tabs"
              @update:model-value="handleTabChange"
            )
            div.f-modal__ribbon(v-else-if="title")
              //- The ribbon's folded tails, behind its face.
              svg.f-modal__ribbon-tail.is-left(viewBox="0 0 20 24" preserveAspectRatio="none" aria-hidden="true" focusable="false")
                path(d="M20 1.500H2l6 10.500-6 10.500h18z" vector-effect="non-scaling-stroke")
              svg.f-modal__ribbon-tail.is-right(viewBox="0 0 20 24" preserveAspectRatio="none" aria-hidden="true" focusable="false")
                path(d="M20 1.500H2l6 10.500-6 10.500h18z" vector-effect="non-scaling-stroke")
              span.f-modal__ribbon-shadow(aria-hidden="true")
              span.f-modal__ribbon-body
                span.f-modal__ribbon-text {{ title }}

          //- Frame
          div.f-modal__frame-wrap
            span.f-modal__frame-shadow(aria-hidden="true")
            div.f-modal__frame
              button.f-modal__close(
                v-if="isClosable"
                type="button"
                :aria-label="t('close')"
                @click="onClose"
              )
                span.f-modal__close-shadow(aria-hidden="true")
                span.f-modal__close-body
                  GameIcon.f-modal__close-icon(name="close")

              //- The rim's ornaments: a stitched seam and a rivet in each corner.
              span.f-modal__stitch(aria-hidden="true")
              span.f-modal__rivet.is-tl(aria-hidden="true")
              span.f-modal__rivet.is-tr(aria-hidden="true")
              span.f-modal__rivet.is-bl(aria-hidden="true")
              span.f-modal__rivet.is-br(aria-hidden="true")

              //- The page inside the rim.
              div.f-modal__page
                //- A flourish in each lower corner of the page.
                svg.f-modal__flourish.is-left(viewBox="0 0 24 24" aria-hidden="true" focusable="false")
                  path(d="M2 2v13c0 4 3 7 7 7h13M6 8c0 5 3 8 8 8M6 3.500a2 2 0 1 0 .01 0M20.500 18a2 2 0 1 0 .01 0")
                svg.f-modal__flourish.is-right(viewBox="0 0 24 24" aria-hidden="true" focusable="false")
                  path(d="M2 2v13c0 4 3 7 7 7h13M6 8c0 5 3 8 8 8M6 3.500a2 2 0 1 0 .01 0M20.500 18a2 2 0 1 0 .01 0")

                //- Scrollable content. Top padding is the MEASURED header
                //- overhang plus a gap — never a guess.
                div.f-modal__content
                  slot

                //- Footer — pinned, collapses out of layout when empty.
                div.f-modal__footer
                  slot(name="footer")
</template>

<style scoped lang="sass">
@use '@/assets/css/cel'

.f-modal
  // The ribbon's ramp.
  +cel.tone('gold')
  // The rim's width and the close button's size, shared by the rules below.
  --fmodal-rim: clamp(0.36rem, 1.5vw, 0.6rem)
  --fmodal-close: clamp(2.1rem, 8.5vw, 2.75rem)
  --fmodal-tail: clamp(0.65rem, 3.2vw, 1.2rem)
  --fmodal-r: clamp(0.9rem, 4.4vw, 1.8rem)
  position: fixed
  inset: 0
  // Above the result overlay (`FReward`, z-100) and below the ad-blocker
  // explainer (z-150) and the splash (z-200). The shop is opened FROM the
  // result screen — at z-50 it rendered behind it and the player got a blurred
  // rectangle with the result buttons floating on top.
  z-index: var(--bc-z-modal)
  display: flex
  align-items: center
  justify-content: center
  padding: calc(clamp(0.4rem, 2vw, 1rem) + env(safe-area-inset-top, 0px)) calc(clamp(0.4rem, 2vw, 1rem) + env(safe-area-inset-right, 0px)) calc(clamp(0.4rem, 2vw, 1rem) + env(safe-area-inset-bottom, 0px)) calc(clamp(0.4rem, 2vw, 1rem) + env(safe-area-inset-left, 0px))
  font-family: var(--font-ui)

.ribbon-blue
  +cel.tone('blue')
.ribbon-green
  +cel.tone('green')
.ribbon-red
  +cel.tone('red')
.ribbon-purple
  +cel.tone('purple')

.f-modal__backdrop
  position: absolute
  inset: 0
  background-color: var(--bc-backdrop)
  backdrop-filter: blur(4px)

.f-modal__container
  position: relative
  display: flex
  flex-direction: column
  width: 100%
  max-width: min(42rem, 96vw)
  max-height: 100%

.f-modal__header
  position: relative
  z-index: 20
  display: flex
  flex-shrink: 0
  justify-content: center
  // The ribbon dips into the frame by HEADER_DIP_RATIO of its own height; the
  // negative margin removes that dip from the layout flow so the frame starts
  // underneath it.
  margin-bottom: calc(var(--fmodal-header-overlap, 0px) * -1)
// The close button hangs off the frame's corner: the header keeps clear of it
// on both sides, so the title stays centred.
.is-closable .f-modal__header
  padding-inline: calc(var(--fmodal-close) * 0.62)

// ── The title ribbon ─────────────────────────────────────────────────────────
.f-modal__ribbon
  position: relative
  // Its tails hang outside it: leave them room.
  max-width: calc(100% - var(--fmodal-tail) * 2)

.f-modal__ribbon-tail
  position: absolute
  top: 26%
  width: calc(var(--fmodal-tail) + var(--bc-ol-thick) * 2)
  height: 86%
  overflow: visible
  path
    fill: var(--c-lo)
    stroke: var(--bc-ink)
    stroke-width: 3
    stroke-linejoin: round
  &.is-left
    right: calc(100% - var(--bc-ol-thick) * 2)
  &.is-right
    left: calc(100% - var(--bc-ol-thick) * 2)
    transform: scaleX(-1)

.f-modal__ribbon-shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press))
  border: var(--bc-ol-thick) solid var(--bc-ink)
  border-radius: clamp(0.5rem, 2.2vw, 0.85rem)
  background-color: var(--c-deep)

.f-modal__ribbon-body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  min-height: 2.25rem
  padding: clamp(0.3rem, 1.4vw, 0.55rem) clamp(1rem, 5.5vw, 2.5rem)
  border: var(--bc-ol-thick) solid var(--bc-ink)
  border-radius: clamp(0.5rem, 2.2vw, 0.85rem)
  +cel.fill(44%, 88%)
  overflow: hidden
  &::before
    +cel.glint(0.2em, 0.6em, min(30%, 4rem), 0.3em)

.f-modal__ribbon-text
  position: relative
  +cel.label
  font-weight: 900
  text-transform: uppercase
  letter-spacing: 0.04em
  text-align: center
  text-wrap: balance
  overflow-wrap: anywhere
  font-size: clamp(0.95rem, 4.4vw, 1.75rem)
  line-height: 1.15

// ── The frame: a leather rim round the page ──────────────────────────────────
.f-modal__frame-wrap
  position: relative
  display: flex
  flex: 1 1 auto
  flex-direction: column
  // `min-height: 0` lets the inner scroll container actually scroll instead of
  // stretching the frame to fit its content.
  min-height: 0

.f-modal__frame-shadow
  position: absolute
  inset: 0
  transform: translateY(clamp(5px, 1.4vw, 8px))
  border: var(--bc-ol-thick) solid var(--bc-ink)
  border-radius: var(--fmodal-r)
  background-color: var(--bc-leather-deep)

.f-modal__frame
  position: relative
  display: flex
  flex: 1 1 auto
  flex-direction: column
  min-height: 0
  padding: var(--fmodal-rim)
  border: var(--bc-ol-thick) solid var(--bc-ink)
  border-radius: var(--fmodal-r)
  // Two-tone leather: a lit band along the top edge, a shadow lip at the foot.
  background: linear-gradient(180deg, var(--bc-leather-hi) 0, var(--bc-leather-hi) 1.4rem, var(--bc-leather) 1.4rem, var(--bc-leather) calc(100% - 1.1rem), var(--bc-leather-lo) calc(100% - 1.1rem), var(--bc-leather-lo) 100%)

// The seam: a dashed thread down the middle of the rim.
.f-modal__stitch
  position: absolute
  inset: calc(var(--fmodal-rim) / 2 - 1px)
  border: 2px dashed var(--bc-stitch)
  border-radius: calc(var(--fmodal-r) - var(--fmodal-rim) / 2 - var(--bc-ol-thick))
  opacity: 0.85
  pointer-events: none

.f-modal__rivet
  position: absolute
  z-index: 2
  width: calc(var(--fmodal-rim) + 0.3rem)
  height: calc(var(--fmodal-rim) + 0.3rem)
  border: var(--bc-ol-thin) solid var(--bc-ink)
  border-radius: 50%
  background: linear-gradient(180deg, var(--bc-brass-hi) 0, var(--bc-brass-hi) 46%, var(--bc-brass-lo) 46%, var(--bc-brass-lo) 100%)
  pointer-events: none
  --at: calc(var(--fmodal-r) * 0.29 - 0.15rem)
  &.is-tl
    top: var(--at)
    left: var(--at)
  &.is-tr
    top: var(--at)
    right: var(--at)
  &.is-bl
    bottom: var(--at)
    left: var(--at)
  &.is-br
    bottom: var(--at)
    right: var(--at)
// The close button sits on that corner.
.is-closable .f-modal__rivet.is-tr
  display: none

.f-modal__page
  position: relative
  display: flex
  flex: 1 1 auto
  flex-direction: column
  min-height: 0
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: calc(var(--fmodal-r) - var(--fmodal-rim) - var(--bc-ol-thick))
  overflow: hidden

// The walnut page (windows written for light text).
.f-modal--wood .f-modal__page
  background: linear-gradient(180deg, var(--bc-wood-hi) 0, var(--bc-wood-hi) 0.5rem, var(--bc-wood) 0.5rem, var(--bc-wood) calc(100% - 0.45rem), var(--bc-wood-lo) calc(100% - 0.45rem), var(--bc-wood-lo) 100%)
  color: var(--bc-text)

// The parchment page, and what ink is used on it.
.f-modal--parchment .f-modal__page
  --bc-on: var(--bc-paper-ink)
  --bc-on-soft: var(--bc-paper-ink-soft)
  --bc-on-mute: var(--bc-paper-ink-soft)
  --bc-on-accent: var(--bc-gold-deep)
  --bc-on-good: var(--bc-green-deep)
  --bc-on-bad: var(--bc-red-lo)
  --bc-cell: rgba(var(--bc-paper-ink-rgb), 0.11)
  --bc-cell-alt: rgba(var(--bc-paper-ink-rgb), 0.05)
  --bc-rule: rgba(var(--bc-paper-ink-rgb), 0.24)
  background: linear-gradient(180deg, var(--bc-paper-hi) 0, var(--bc-paper-hi) 0.5rem, var(--bc-paper) 0.5rem, var(--bc-paper) calc(100% - 0.45rem), var(--bc-paper-lo) calc(100% - 0.45rem), var(--bc-paper-lo) 100%)
  color: var(--bc-paper-ink)

.f-modal__flourish
  position: absolute
  bottom: 0.3rem
  width: clamp(1.1rem, 4.6vw, 1.7rem)
  height: clamp(1.1rem, 4.6vw, 1.7rem)
  pointer-events: none
  path
    fill: none
    stroke: var(--bc-paper-deep)
    stroke-width: 2
    stroke-linecap: round
    stroke-linejoin: round
  &.is-left
    left: 0.3rem
  &.is-right
    right: 0.3rem
    transform: scaleX(-1)
.f-modal--wood .f-modal__flourish path
  stroke: var(--bc-wood-hi)

.f-modal__content
  position: relative
  flex: 1 1 auto
  min-height: 0
  overflow-y: auto
  overscroll-behavior: contain
  text-align: center
  // The measured header overhang plus a breathing gap. This is the fix for the
  // "header overlaps the content" bug — it is derived, not guessed.
  padding-top: calc(var(--fmodal-header-overlap, 0px) + clamp(0.6rem, 2.4vw, 1.1rem))
  padding-bottom: clamp(0.4rem, 1.6vw, 0.75rem)
  padding-inline: clamp(0.5rem, 3vw, 1.5rem)
  +cel.scrollbar

.f-modal__footer
  position: relative
  flex-shrink: 0
  display: flex
  justify-content: center
  gap: clamp(0.4rem, 2.4vw, 1rem)
  // Room under the buttons for their depth plates.
  padding-bottom: calc(clamp(0.4rem, 1.6vw, 0.75rem) + var(--bc-press))
  padding-inline: clamp(0.5rem, 3vw, 1.5rem)

  &:empty
    display: none

// ── The close button ─────────────────────────────────────────────────────────
.f-modal__close
  +cel.tone('red')
  position: absolute
  top: 0
  right: 0
  z-index: 30
  // Overhang the frame corner, scaled with the viewport so it never collides
  // with the content on a small screen.
  translate: 20% -36%
  width: var(--fmodal-close)
  height: var(--fmodal-close)
  min-width: 2.1rem
  min-height: 2.1rem
  padding: 0
  border: 0
  border-radius: clamp(0.5rem, 2vw, 0.75rem)
  background: none
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  +cel.focus-ring

  &:hover .f-modal__close-body
    filter: brightness(1.08)
  &:active .f-modal__close-body
    transition-duration: var(--bc-t-press)
    transition-timing-function: ease-out
    transform: translateY(var(--bc-press-sm)) scale(1.04, 0.92)

.f-modal__close-shadow
  position: absolute
  inset: 0
  transform: translateY(var(--bc-press-sm))
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: clamp(0.5rem, 2vw, 0.75rem)
  background-color: var(--c-deep)

.f-modal__close-body
  position: relative
  display: flex
  align-items: center
  justify-content: center
  width: 100%
  height: 100%
  border: var(--bc-ol) solid var(--bc-ink)
  border-radius: clamp(0.5rem, 2vw, 0.75rem)
  +cel.fill(48%, 88%)
  color: var(--bc-text)
  overflow: hidden
  transition: transform var(--bc-t-release) var(--bc-ease-bounce), filter 120ms ease-out
  &::before
    +cel.glint(10%, 14%, 40%, 12%)

  // Nested to outrank `GameIcon`'s own `.game-icon` rule, which has the same
  // specificity a flat class selector would.
  .f-modal__close-icon
    position: relative
    width: 48%
    height: 48%
    filter: drop-shadow(0 2px 0 var(--bc-ink)) drop-shadow(1px 0 0 var(--bc-ink)) drop-shadow(-1px 0 0 var(--bc-ink)) drop-shadow(0 -1px 0 var(--bc-ink))

// ─── Short viewports (landscape phone, embedded iframe) ─────────────────────
// Claim the full short axis so the header is never pushed off-screen and the
// dead space above the modal collapses.
@media (max-height: 520px)
  .f-modal
    --fmodal-rim: 0.3rem
    align-items: stretch
    padding-block: calc(0.3rem + env(safe-area-inset-top, 0px)) calc(0.45rem + env(safe-area-inset-bottom, 0px))

  .f-modal__container
    max-width: min(46rem, 98vw)
    max-height: 100%

  .f-modal__frame
    border-width: var(--bc-ol)

  .f-modal__ribbon-text
    font-size: clamp(0.85rem, 3.4vh, 1.2rem)
</style>
