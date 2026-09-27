<template lang="pug">
  FModal(:model-value="open" :title="t('levelUp.title')" :is-closable="false")
    div.lu(ref="root" :class="{ busy, finished: allDone }")
      div.top
        //- The level being SPENT, not the level reached: with three banked it
        //- reads 4, then 5, then 6 — and a check once all of them are spent.
        div.badge(:class="{ done: allDone }")
          span.b-win
            //- Both numbers share one grid cell, so the old rolls out as the
            //- new rolls in (an odometer), with no gap between them.
            Transition(name="roll")
              span.n(v-if="!allDone" :key="badgeLevel") {{ fmt(badgeLevel) }}
              span.n.ok(v-else key="ok")
                GameIcon(name="check")
          //- Picks still to spend, the notification-dot way.
          span.left(v-if="remaining > 0" :key="remaining" aria-hidden="true") {{ fmt(remaining) }}
          span.burst.big(v-if="allDone" aria-hidden="true")
            i(v-for="k in 10" :key="k" :style="{ '--k': k }")
        //- One pip per banked level-up: grey with its level to come, gold and
        //- pulsing for the one being spent, the chosen stat's glyph once spent.
        div.pips(
          role="progressbar"
          aria-valuemin="0"
          :aria-valuemax="total"
          :aria-valuenow="shown"
          :aria-label="progressLabel"
        )
          span.more.spent(v-if="win.before" aria-hidden="true") +{{ fmt(win.before) }}
          span.pip(v-for="p in pips" :key="p.i" :class="p.cls" aria-hidden="true")
            GameIcon(v-if="p.attr" :name="ATTR_ICON[p.attr]")
            span.pn(v-else) {{ fmt(p.level) }}
          span.more(v-if="win.after" aria-hidden="true") +{{ fmt(win.after) }}
      p.sub {{ t('levelUp.pick') }}
      //- Each stat sits straight over its own card, so the "+N" chip flies
      //- straight up into the number it raises.
      div.readout
        div.stat(v-for="a in ATTRS" :key="a" :class="[a, { bump: bump === a }]")
          span.s-ico
            GameIcon(:name="ATTR_ICON[a]")
          span.sr {{ t(`hero.stat.${a}`) }}
          span.s-val {{ fmt(valueOf(a)) }}
          span.s-next(v-if="previewAttr === a && !busy" aria-hidden="true") → {{ fmt(previewValue) }}
      div.cards
        button.card(
          v-for="(a, i) in ATTRS"
          :key="a"
          type="button"
          :class="[a, { picked: picked === a, dim: picked !== '' && picked !== a }]"
          :aria-disabled="busy ? 'true' : 'false'"
          :aria-keyshortcuts="String(i + 1)"
          @click="pick(a)"
          @pointerenter="hover($event, a)"
          @pointerleave="unhover(a)"
          @focus="focusPreview($event, a)"
          @blur="unhover(a)"
        )
          //- Keyed by the deal: a pick that leaves more to spend re-deals the
          //- faces, so the screen visibly moves on to the next level. The
          //- button itself stays, and keeps the keyboard focus.
          span.face(:key="deal" :style="{ '--i': i }")
            span.key(aria-hidden="true") {{ i + 1 }}
            span.ico
              GameIcon(:name="ATTR_ICON[a]")
            span.name {{ t(`attr.${a}.name`) }}
            span.gain +{{ fmt(ATTR_GAIN[a]) }}
            span.desc {{ t(`attr.${a}.desc`) }}
            span.burst(v-if="picked === a" aria-hidden="true")
              i(v-for="k in 8" :key="k" :style="{ '--k': k }")
      div.chips
        span.c-ico
          GameIcon(name="chip")
        span {{ t('levelUp.chip') }}
      div.flyer(v-if="flyer" :key="flyer.id" :class="flyer.attr" :style="flyer.style" aria-hidden="true")
        span.f-ico
          GameIcon(:name="ATTR_ICON[flyer.attr]")
        span +{{ fmt(ATTR_GAIN[flyer.attr]) }}
      span.sr(role="status" aria-live="polite") {{ announce }}
</template>

<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FModal from '@/components/molecules/FModal.vue'
import GameIcon from '@/components/icons/GameIcon.vue'
import { flow } from '@/game/flow'
import { profile, chooseAttr, computeStats } from '@/game/state/profile'
import { ATTR_GAIN, ATTR_ICON, type Attr } from '@/game/data/progression'
import type { PlayerStats } from '@/game/sim/stats'
import { currentHub } from '@/game/boot'
import { sfx } from '@/game/audio/sfx'
import { formatCount } from '@/utils/localeNumber'
import { PICK_PACE, PICK_PACE_REDUCED, pickLevels, pipWindow, type PickPace } from './levelUpPick'

/**
 * Level-up: the Blades attribute pick (HP / Weapon Energy / Power). Opens in
 * the hub (never mid-fight) while picks are pending.
 *
 * It has to answer three questions without a sentence: how many picks, which
 * one is this, and did that click count. The old modal answered none — after
 * a pick it redrew the same three cards under the same badge, and a player
 * with three level-ups banked thought the click had missed. So: one pip per
 * banked level-up that ticks off as it is spent, a badge showing the level
 * being SPENT, and a fixed beat per pick (`levelUpPick.ts`) — the card presses
 * in, "+N" flies to its stat, the stat counts up, the cards re-deal — with
 * input locked for the beat so a double-click can never spend two. The last
 * pick holds a finished state (every pip ticked, a check) before it closes.
 */
const { t, locale } = useI18n()
const ATTRS: Attr[] = ['hp', 'we', 'power']
const open = computed(() => flow.modal === 'levelUp')
const fmt = (n: number) => formatCount(Math.round(n), locale.value)
const root = ref<HTMLElement | null>(null)

/** Picks spent since this opening (saved the moment they are clicked). */
const spent = ref(0)
/** Picks the screen SHOWS as spent: `spent`, a flight later. The pips, the
 *  badge and the count all follow this, so they change when the chip lands. */
const shown = ref(0)
/** The stat chosen for each spent pick, in order (the ticked pips' glyphs). */
const chosen = ref<Attr[]>([])
const busy = ref(false)
const picked = ref<Attr | ''>('')
/** Bumped to re-deal the card faces (they are keyed by it). */
const deal = ref(0)
const bump = ref<Attr | ''>('')
const previewAttr = ref<Attr | ''>('')
const announce = ref('')
const flyer = ref<{ id: number; attr: Attr; style: Record<string, string> } | null>(null)
/** A stat mid count-up; `null` shows the live value. */
const counter = reactive<Record<Attr, number | null>>({ hp: null, we: null, power: null })

// Counted as spent + pending rather than frozen at open, so a cloud hydrate
// that lands mid-modal redraws the row instead of desyncing it.
const total = computed(() => spent.value + Math.max(0, profile.hero.pendingAttrs))
const remaining = computed(() => Math.max(0, total.value - shown.value))
const allDone = computed(() => total.value > 0 && shown.value >= total.value)
const levels = computed(() => pickLevels(profile.level, total.value))
const badgeLevel = computed(() => levels.value[Math.min(shown.value, total.value - 1)] ?? profile.level)
const win = computed(() => pipWindow(total.value, shown.value))
const pips = computed(() => {
  const out: Array<{ i: number; level: number; attr: Attr | null; cls: unknown[] }> = []
  for (let i = win.value.start; i < win.value.end; i++) {
    const isSpent = i < shown.value
    const attr = isSpent ? chosen.value[i] ?? null : null
    out.push({
      i,
      level: levels.value[i] ?? profile.level,
      attr,
      cls: [attr ?? '', { spent: isSpent, active: i === shown.value && !allDone.value }]
    })
  }
  return out
})
const progressLabel = computed(() =>
  (remaining.value > 0 ? t('hero.attrPending', { n: remaining.value }) : t('levelUp.title')))

const statOf = (s: PlayerStats, a: Attr): number => (a === 'hp' ? s.maxHp : a === 'we' ? s.maxWe : s.maxPower)
const stats = computed(() => computeStats())
const valueOf = (a: Attr): number => counter[a] ?? statOf(stats.value, a)
/** What the hovered / focused card would make its stat — computed, not
 *  `value + gain`, because Frame ranks scale max HP by a percentage. */
const previewValue = computed(() => {
  const a = previewAttr.value
  if (!a) return 0
  return statOf(computeStats({ ...profile.hero.attrs, [a]: profile.hero.attrs[a] + 1 }), a)
})

// ─── The beat ────────────────────────────────────────────────────────────────

let timers: ReturnType<typeof setTimeout>[] = []
let raf = 0
let flyId = 0
const later = (ms: number, fn: () => void): void => { timers.push(setTimeout(fn, ms)) }
const stopAll = (): void => {
  for (const id of timers) clearTimeout(id)
  timers = []
  if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf)
  raf = 0
}
const reducedMotion = (): boolean =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** The "+N" chip, from the card to its stat. Coordinates are relative to the
 *  modal body, which scrolls: both ends are measured in the same frame. */
const launch = (a: Attr, pace: PickPace): void => {
  const host = root.value
  if (!host || pace.fly < 200) return
  const card = host.querySelector(`.card.${a}`)
  const stat = host.querySelector(`.stat.${a}`)
  if (!card || !stat) return
  const h = host.getBoundingClientRect()
  const c = card.getBoundingClientRect()
  const s = stat.getBoundingClientRect()
  flyer.value = {
    id: ++flyId,
    attr: a,
    style: {
      '--x0': `${c.left + c.width / 2 - h.left}px`,
      '--y0': `${c.top + c.height * 0.4 - h.top}px`,
      '--x1': `${s.left + s.width / 2 - h.left}px`,
      '--y1': `${s.top + s.height / 2 - h.top}px`,
      '--fly': `${pace.fly}ms`
    }
  }
}

/** Tick a stat from `from` to `to`. The closing timeout snaps it even when a
 *  background tab starves requestAnimationFrame, so a stale number never sticks. */
const countUp = (a: Attr, from: number, to: number, ms: number): void => {
  if (ms > 0 && typeof requestAnimationFrame === 'function') {
    const t0 = performance.now()
    const step = (now: number): void => {
      const k = Math.min(1, Math.max(0, (now - t0) / ms))
      counter[a] = from + (to - from) * (1 - Math.pow(1 - k, 3))
      raf = k < 1 ? requestAnimationFrame(step) : 0
    }
    raf = requestAnimationFrame(step)
  }
  later(ms, () => {
    if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf)
    raf = 0
    counter[a] = null
  })
}

/** The chip lands: the pick becomes visible everywhere at once. */
const land = (a: Attr, from: number, to: number, last: boolean, pace: PickPace): void => {
  flyer.value = null
  shown.value = spent.value
  bump.value = a
  countUp(a, from, to, pace.count)
  announce.value = t('levelUp.granted', { stat: t(`hero.stat.${a}`), from: fmt(from), to: fmt(to) })
  later(Math.max(pace.count, 240) + 40, () => { if (bump.value === a) bump.value = '' })
  if (last) {
    // Every pip ticked and the badge a check: hold it long enough to be SEEN
    // before the modal goes, instead of vanishing under the finger.
    later(pace.hold, () => { flow.modal = '' })
    return
  }
  picked.value = ''
  deal.value++
}

const pick = (a: Attr): void => {
  if (!open.value || busy.value || allDone.value) return
  const from = statOf(computeStats(), a)
  if (!chooseAttr(a)) {
    sfx('denied')
    return
  }
  const to = statOf(computeStats(), a)
  chosen.value[spent.value] = a
  spent.value++
  const last = profile.hero.pendingAttrs <= 0
  const pace = reducedMotion() ? PICK_PACE_REDUCED : PICK_PACE
  busy.value = true
  picked.value = a
  counter[a] = from
  launch(a, pace)
  sfx(last ? 'levelUp' : 'attrPick')
  currentHub()?.celebrate()
  later(pace.fly, () => land(a, from, to, last, pace))
  // The last pick never unlocks: it only closes.
  if (!last) later(pace.lock, () => { busy.value = false })
}

// ─── Input ───────────────────────────────────────────────────────────────────

const hover = (e: PointerEvent, a: Attr): void => { if (e.pointerType === 'mouse') previewAttr.value = a }
/** Keyboard focus only: a tap focuses the button too, and a preview left
 *  stuck on the card just tapped reads like a second, pending pick. */
const focusPreview = (e: FocusEvent, a: Attr): void => {
  const el = e.currentTarget as HTMLElement | null
  let keyboard = false
  try { keyboard = !!el?.matches(':focus-visible') } catch { /* engine without :focus-visible */ }
  if (keyboard) previewAttr.value = a
}
const unhover = (a: Attr): void => { if (previewAttr.value === a) previewAttr.value = '' }

/** 1 / 2 / 3 pick the card in that place (by physical key, so AZERTY's
 *  unshifted "&é\"" row works too); ←/→ walk the focus and Enter / Space
 *  press the focused card natively. */
const DIGITS: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 }
const stepFocus = (d: number): void => {
  const cards = Array.from(root.value?.querySelectorAll<HTMLButtonElement>('.card') ?? [])
  if (!cards.length) return
  const cur = cards.findIndex(c => c === document.activeElement)
  const next = cur < 0 ? (d > 0 ? 0 : cards.length - 1) : (cur + d + cards.length) % cards.length
  cards[next]?.focus()
}
const onKey = (e: KeyboardEvent): void => {
  if (!open.value || e.ctrlKey || e.altKey || e.metaKey) return
  const n = DIGITS[e.code]
  if (n !== undefined) {
    e.preventDefault()
    const a = ATTRS[n]
    if (a && !e.repeat) pick(a)
    return
  }
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    e.preventDefault()
    stepFocus(e.code === 'ArrowLeft' ? -1 : 1)
  }
}

const reset = (): void => {
  stopAll()
  spent.value = 0
  shown.value = 0
  chosen.value = []
  busy.value = false
  picked.value = ''
  bump.value = ''
  previewAttr.value = ''
  announce.value = ''
  flyer.value = null
  counter.hp = null
  counter.we = null
  counter.power = null
}

watch(open, (o) => {
  reset()
  window.removeEventListener('keydown', onKey)
  if (!o) return
  // Nothing to spend (a stale button, a hydrate that already spent them):
  // never show an empty pick.
  if (profile.hero.pendingAttrs <= 0) {
    flow.modal = ''
    return
  }
  deal.value++
  window.addEventListener('keydown', onKey)
}, { immediate: true })

// Picks taken away underneath an idle modal (a cloud hydrate): close rather
// than sit on a finished row nobody can finish. Mid-beat, the beat closes it.
watch(() => profile.hero.pendingAttrs, (p) => {
  if (open.value && !busy.value && p <= 0) flow.modal = ''
})

onUnmounted(() => {
  stopAll()
  window.removeEventListener('keydown', onKey)
})
</script>

<style scoped lang="sass">
// Each stat's colours: card gradient top, bottom, and the glow / accent.
// Set once on `.hp` / `.we` / `.power`, whatever wears the class — card,
// stat, spent pip, flying chip — so the four always match.
$attrs: (hp: (#ff8a8a, #d0303f, #ff6b7a), we: (#8ad8ff, #1f7fd0, #5cc8ff), power: (#b8ff8a, #2f9a3f, #8fe86a))
@each $a, $c in $attrs
  .#{$a}
    --c1: #{nth($c, 1)}
    --c2: #{nth($c, 2)}
    --glow: #{nth($c, 3)}

.lu
  position: relative
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(6px, 1.5vmin, 10px)
  color: #fff
  font-family: var(--font-ui)
.sr
  position: absolute
  width: 1px
  height: 1px
  overflow: hidden
  clip: rect(0 0 0 0)
  white-space: nowrap

// ─── Badge + pips ────────────────────────────────────────────────────────────
.top
  display: flex
  flex-direction: column
  align-items: center
  gap: clamp(6px, 1.4vmin, 10px)
.badge
  position: relative
  flex: 0 0 auto
  width: clamp(56px, 13vmin, 88px)
  height: clamp(56px, 13vmin, 88px)
  border-radius: 50%
  background: radial-gradient(circle at 40% 30%, #fff3a0, #ffd23a 50%, #e08a00)
  border: 4px solid #141a33
  box-shadow: 0 0 24px rgba(255, 210, 58, 0.6)
  animation: lu-bob 2.4s ease-in-out infinite
  &.done
    background: radial-gradient(circle at 40% 30%, #f0ffff, #7ff4ff 50%, #1f9fd0)
    box-shadow: 0 0 30px rgba(127, 244, 255, 0.85)
    animation: lu-finish 0.55s cubic-bezier(0.2, 1.6, 0.4, 1) both
// The rolling number is clipped to the disc; the count dot and the burst are not.
.b-win
  position: absolute
  inset: 0
  display: grid
  place-items: center
  border-radius: 50%
  overflow: hidden
.n
  grid-area: 1 / 1
  font-family: var(--font-pixel)
  font-size: clamp(18px, 4.4vmin, 28px)
  color: #141a33
  &.ok
    width: 56%
    height: 56%
.left
  position: absolute
  top: -6px
  right: -8px
  min-width: 1.9em
  height: 1.9em
  padding: 0 0.35em
  display: grid
  place-items: center
  border-radius: 999px
  border: 3px solid #141a33
  background: #ff3e5e
  color: #fff
  font-family: var(--font-pixel)
  font-size: clamp(9px, 2vmin, 12px)
  animation: lu-pop 0.4s cubic-bezier(0.2, 1.8, 0.4, 1) both
.pips
  display: flex
  align-items: center
  gap: clamp(4px, 1.1vmin, 8px)
  padding: 4px clamp(6px, 1.6vmin, 10px)
  border-radius: 999px
  background: rgba(0, 0, 0, 0.3)
.pip, .more
  --s: clamp(22px, 5.4vmin, 32px)
  flex: 0 0 auto
  height: var(--s)
  display: grid
  place-items: center
  border-radius: 8px
  border: 2px solid #141a33
  font-family: var(--font-pixel)
  font-size: clamp(8px, 1.9vmin, 11px)
.pip
  width: var(--s)
  background: #2a3a66
  color: #9fb4e6
  transition: transform 0.2s
  svg
    width: 64%
    height: 64%
  &.active
    background: radial-gradient(circle at 40% 30%, #fff3a0, #ffd23a 55%, #e08a00)
    color: #141a33
    animation: lu-pulse 0.9s ease-in-out infinite
  &.spent
    background: linear-gradient(var(--c1, #7ff4ff), var(--c2, #1f7fd0))
    color: #fff
    animation: lu-tick 0.45s cubic-bezier(0.2, 1.8, 0.4, 1) both
.more
  padding: 0 0.35em
  border-style: dashed
  border-color: rgba(159, 180, 230, 0.5)
  color: #9fb4e6
  &.spent
    color: #7ff4ff
.sub
  margin: 0
  font-size: clamp(13px, 2.8vmin, 17px)

// ─── Stat readout + cards (one 3-column grid, so each stat tops its card) ───
.readout, .cards
  display: grid
  grid-template-columns: repeat(3, minmax(0, 1fr))
  gap: clamp(6px, 1.6vmin, 12px)
  width: min(88vw, 470px)
.stat
  display: flex
  align-items: center
  justify-content: center
  gap: 4px
  min-width: 0
  padding: 4px 6px
  border-radius: 999px
  border: 2px solid rgba(255, 255, 255, 0.08)
  background: rgba(0, 0, 0, 0.32)
  font-family: var(--font-pixel)
  font-size: clamp(9px, 2.1vmin, 13px)
  white-space: nowrap
  transition: border-color 0.2s, box-shadow 0.2s
  &.bump
    border-color: var(--glow)
    box-shadow: 0 0 14px var(--glow)
    animation: lu-bump 0.45s cubic-bezier(0.2, 1.6, 0.4, 1)
    .s-val
      color: #fff9c8
.s-ico
  flex: 0 0 auto
  width: clamp(13px, 3vmin, 19px)
  height: clamp(13px, 3vmin, 19px)
  color: var(--glow)
.s-next
  color: #b8ff8a
.card
  position: relative
  display: flex
  padding: 0
  border: 0
  background: none
  color: #fff
  font: inherit
  cursor: pointer
  -webkit-tap-highlight-color: transparent
  perspective: 600px
  &:focus-visible
    outline: none
    .face
      outline: 3px solid #fff
      outline-offset: 2px
  &[aria-disabled='true']
    cursor: default
.face
  position: relative
  flex: 1
  display: flex
  flex-direction: column
  align-items: center
  gap: 3px
  padding: clamp(8px, 1.8vmin, 12px) 6px
  border-radius: 14px
  border: 3px solid #141a33
  background: linear-gradient(var(--c1), var(--c2))
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35), inset 0 3px 0 rgba(255, 255, 255, 0.25)
  transition: transform 0.12s, filter 0.2s, opacity 0.2s
  // Dealt in, staggered left to right — on open and after every pick.
  // `backwards`, not `both`: a held end frame would pin `transform: none`
  // over the hover lift, the press and the dimmed scale-down below.
  animation: lu-deal 0.34s cubic-bezier(0.2, 1.3, 0.4, 1) backwards
  animation-delay: calc(var(--i) * 60ms)
@media (hover: hover)
  .card:not([aria-disabled='true']):hover .face
    transform: translateY(-3px)
    filter: brightness(1.1)
.card:not([aria-disabled='true']):active .face
  transform: translateY(3px)
.card.picked .face
  z-index: 2
  animation: lu-press 0.38s ease-out both
  animation-delay: 0s
.card.dim .face
  opacity: 0.4
  transform: scale(0.94)
  filter: saturate(0.5)
.finished .cards
  opacity: 0.55
  transition: opacity 0.3s
.key
  display: none
  position: absolute
  top: 4px
  left: 5px
  min-width: 1.7em
  height: 1.7em
  place-items: center
  border-radius: 4px
  border: 1px solid rgba(255, 255, 255, 0.45)
  background: rgba(0, 0, 0, 0.3)
  font-family: var(--font-pixel)
  font-size: 8px
// Keycaps only where a keyboard is the likely input.
@media (hover: hover) and (pointer: fine)
  .key
    display: grid
.ico
  width: clamp(26px, 6vmin, 36px)
  height: clamp(26px, 6vmin, 36px)
.name
  font-size: clamp(12px, 2.6vmin, 15px)
  text-align: center
.gain
  font-family: var(--font-pixel)
  font-size: clamp(12px, 2.8vmin, 16px)
  color: #fff9c8
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.35)
.desc
  font-size: clamp(9px, 2vmin, 12px)
  opacity: 0.9
  text-align: center
  line-height: 1.2
.chips
  display: flex
  align-items: center
  gap: 6px
  font-size: clamp(11px, 2.4vmin, 14px)
  color: #7ff4ff
.c-ico
  width: 1.3em
  height: 1.3em

// ─── Juice: sparks, the flying chip ──────────────────────────────────────────
.burst
  --step: 45deg
  --dist: -46px
  position: absolute
  left: 50%
  top: 38%
  width: 0
  height: 0
  pointer-events: none
  i
    position: absolute
    left: -4px
    top: -4px
    width: 8px
    height: 8px
    border-radius: 50%
    background: #fff9c8
    box-shadow: 0 0 8px #fff
    animation: lu-spark 0.5s ease-out both
  &.big
    --step: 36deg
    --dist: -58px
    top: 50%
    i
      background: #eaffff
      box-shadow: 0 0 10px #7ff4ff
      animation-duration: 0.7s
.flyer
  position: absolute
  left: 0
  top: 0
  z-index: 5
  display: flex
  align-items: center
  gap: 3px
  padding: 3px 8px
  border-radius: 999px
  border: 2px solid #141a33
  background: linear-gradient(var(--c1), var(--c2))
  box-shadow: 0 0 16px var(--glow)
  color: #fff
  font-family: var(--font-pixel)
  font-size: clamp(10px, 2.4vmin, 14px)
  white-space: nowrap
  pointer-events: none
  animation: lu-fly var(--fly, 380ms) cubic-bezier(0.45, 0, 0.6, 1) both
.f-ico
  width: 1.2em
  height: 1.2em

// The badge's number rolls up to the next level.
.roll-enter-active, .roll-leave-active
  transition: transform 0.16s ease, opacity 0.16s ease
.roll-enter-from
  transform: translateY(70%)
  opacity: 0
.roll-leave-to
  transform: translateY(-70%)
  opacity: 0

// ─── Short viewports (landscape phones): badge and pips share one row ───────
@media (max-height: 520px)
  .lu
    gap: 6px
  .top
    flex-direction: row
    gap: 14px
  .badge
    width: 46px
    height: 46px
    border-width: 3px
  .n
    font-size: 16px
  .face
    padding: 6px 4px
    gap: 2px
  .ico
    width: 24px
    height: 24px
// A landscape phone with its browser bars showing: the secondary text goes
// first, the glyphs and numbers stay.
@media (max-height: 400px)
  .sub
    display: none
@media (max-height: 330px)
  .desc
    display: none

@media (prefers-reduced-motion: reduce)
  .badge, .badge.done, .pip.active, .pip.spent, .left, .face, .card.picked .face, .stat.bump
    animation: none
  .card.dim .face, .card:not([aria-disabled='true']):active .face
    transform: none
  .flyer, .burst
    display: none
  .roll-enter-active, .roll-leave-active
    transition: none

@keyframes lu-bob
  50%
    transform: scale(1.06) rotate(5deg)
@keyframes lu-finish
  0%
    transform: scale(0.7)
  60%
    transform: scale(1.22)
  100%
    transform: scale(1)
@keyframes lu-pop
  0%
    transform: scale(0)
  100%
    transform: scale(1)
@keyframes lu-pulse
  0%, 100%
    transform: scale(1.08)
    box-shadow: 0 0 0 0 rgba(255, 210, 58, 0.7)
  50%
    transform: scale(1.18)
    box-shadow: 0 0 0 5px rgba(255, 210, 58, 0)
@keyframes lu-tick
  0%
    transform: scale(1.6)
    filter: brightness(2)
  100%
    transform: scale(1)
    filter: none
@keyframes lu-bump
  0%, 100%
    transform: scale(1)
  40%
    transform: scale(1.14)
@keyframes lu-deal
  0%
    transform: rotateY(90deg) scale(0.8)
    opacity: 0
  100%
    transform: none
    opacity: 1
@keyframes lu-press
  0%
    transform: scale(1)
  25%
    transform: scale(0.88) translateY(3px)
    filter: brightness(1.9)
  60%
    transform: scale(1.07)
    filter: brightness(1.35)
  100%
    transform: scale(1)
    filter: brightness(1.15)
@keyframes lu-spark
  0%
    transform: rotate(calc(var(--k) * var(--step))) translateY(0) scale(1)
    opacity: 1
  100%
    transform: rotate(calc(var(--k) * var(--step))) translateY(var(--dist)) scale(0.2)
    opacity: 0
@keyframes lu-fly
  0%
    transform: translate(var(--x0), var(--y0)) translate(-50%, -50%) scale(0.6)
    opacity: 0
  25%
    transform: translate(var(--x0), calc(var(--y0) - 18px)) translate(-50%, -50%) scale(1.25)
    opacity: 1
  100%
    transform: translate(var(--x1), var(--y1)) translate(-50%, -50%) scale(0.85)
    opacity: 0.9
</style>
