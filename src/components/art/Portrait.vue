<template lang="pug">
  span.portrait(:style="{ '--ring': ring }")
    img.portrait__img(v-if="src" :src="src" alt="" draggable="false")
    svg.portrait__svg(v-else viewBox="0 0 48 48" aria-hidden="true" focusable="false")
      //- bust
      path(d="M5 49c0-11 8-16 19-16s19 5 19 16z" :fill="l.top")
      path(v-if="l.cape" d="M5 49c0-9 5-14 12-15l-3 15zM43 49c0-9-5-14-12-15l3 15z" :fill="l.cape")
      path(d="M17 34l7 7 7-7" fill="none" :stroke="l.trim" stroke-width="2.4")
      //- ears
      g(v-if="l.ears === 'goblin'" :fill="l.skin")
        path(d="M12 20L1 14l9 13z")
        path(d="M36 20l11-6-9 13z")
      g(v-else-if="l.ears === 'pointy'" :fill="l.skin")
        path(d="M12 19l-5-6 4 11z")
        path(d="M36 19l5-6-4 11z")
      //- horns sit behind the head
      g(v-if="l.head === 'horns'" fill="#efe6cf")
        path(d="M14 13C9 11 6 6 7 2c3 3 7 4 11 6z")
        path(d="M34 13c5-2 8-7 7-11-3 3-7 4-11 6z")
      //- a ponytail swings out behind the head, tied with a ribbon
      g(v-if="ponytail")
        path(d="M31 10c7-3 13 2 13 9 0 6-3 11-7 14 1-6 0-11-4-15z" :fill="l.hair")
        path(d="M34.500 12.500c3 0 6 2 7 5" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.200" stroke-linecap="round")
        circle(cx="32.500" cy="10.500" r="2.400" :fill="ribbon")
        path(d="M32.500 10.500l-3.600-2.800v5.200zM32.500 10.500l3.400-3.400 0.800 5.200z" :fill="ribbon")
      //- head
      circle(cx="24" cy="22" r="13" :fill="l.skin")
      //- hair and headgear
      path(v-if="hairCap" d="M10.5 22a13.5 13.5 0 0 1 27 0c-2-5-5-7-8-8-2 3-8 5-13 4-3 0-5 2-6 4z" :fill="l.hair")
      path(v-if="l.head === 'long'" d="M11 20c-2 8-1 14 1 18l4-3c-2-5-2-10-1-15zM37 20c2 8 1 14-1 18l-4-3c2-5 2-10 1-15z" :fill="l.hair")
      //- the ponytail's side locks and swept fringe
      path(v-if="l.head === 'ponytail'" d="M11 20c-1.500 5-1 9 .500 12l2.500-1.500c-1-3.500-1-7-.500-10.500zM37 20c1.500 5 1 9-.500 12l-2.500-1.500c1-3.500 1-7 .500-10.500zM12 17c3-5 9-7 15-5-4 1-8 4-10 9z" :fill="l.hair")
      circle(v-if="l.head === 'bun'" cx="24" cy="7" r="5" :fill="l.hair")
      path(v-if="l.head === 'spiky'" d="M12 14l1-8 5 5 3-8 4 7 5-6 1 8 5-3-2 9z" :fill="l.hair")
      path(v-if="l.head === 'hood'" d="M7 33C4 15 13 4 24 4s20 11 17 29l-5-3c2-10-3-16-12-16s-14 6-12 16z" :fill="l.hair")
      path(v-if="l.head === 'bandana'" d="M10.6 19c4-4 9-6 13.4-6s9.400 2 13.400 6l-0.600 4c-4-3-8-4-12.800-4s-8.800 1-12.800 4zM37 20l8 1-6 5z" :fill="l.hair")
      path(v-if="l.head === 'cap'" d="M10 18c1-8 7-11 14-11s13 3 14 11c-4-2-9-3-14-3s-10 1-14 3zM34 16l10 3-9 2z" :fill="l.hair")
      path(v-if="l.head === 'wizard'" d="M5 19c6-3 12-4 19-4s13 1 19 4l-5 3c-4-2-9-3-14-3s-10 1-14 3zM13 16L23 0l12 16z" :fill="l.hair")
      g(v-if="l.head === 'helm'")
        path(d="M10 24C9 13 15 7 24 7s15 6 14 17l-5-1v-5H15v5z" :fill="metal")
        path(d="M24 7v11" fill="none" stroke="#1b1626" stroke-width="2")
      g(v-if="l.head === 'greathelm'")
        path(d="M10 34V20C10 11 16 6 24 6s14 5 14 14v14l-14 5z" :fill="metal")
        path(d="M15 22h18M24 22v14" fill="none" stroke="#1b1626" stroke-width="3" stroke-linecap="round")
      g(v-if="l.head === 'crown'")
        path(d="M12 15l-1-11 6 5 7-8 7 8 6-5-1 11z" fill="#ffd24a")
        circle(cx="24" cy="10" r="1.800" fill="#ff5a6a")
      g(v-if="l.head === 'goggles'")
        rect(x="10" y="14" width="28" height="4" :fill="l.trim")
        circle(cx="18" cy="16" r="4.600" fill="#bff4ff")
        circle(cx="30" cy="16" r="4.600" fill="#bff4ff")
      //- face
      g(v-if="l.head !== 'greathelm'")
        ellipse(cx="19" cy="24" rx="2.300" ry="3" :fill="eye")
        ellipse(cx="29" cy="24" rx="2.300" ry="3" :fill="eye")
        g(v-if="!l.eyeGlow" fill="#ffffff")
          circle(cx="19.800" cy="23" r="0.900")
          circle(cx="29.800" cy="23" r="0.900")
        //- a girl's lashes at the outer corners
        path(v-if="l.fem" d="M17 21.700l-1.900-1.300M17.800 21.100l-1-1.700M31 21.700l1.900-1.300M30.200 21.100l1-1.700" fill="none" stroke="#1b1626" stroke-width="1.100" stroke-linecap="round")
        g(v-if="l.head !== 'skull'" fill="#ff8f8f" opacity="0.5")
          circle(cx="14.500" cy="28" r="2.200")
          circle(cx="33.500" cy="28" r="2.200")
        path(v-if="l.head === 'skull'" d="M24 27l-1.500 3h3z" fill="#1b1626")
        path(v-else-if="!l.beard" d="M21.500 30.500q2.500 2 5 0" fill="none" stroke="#1b1626" stroke-width="1.500" stroke-linecap="round")
      path(v-if="l.beard" d="M12 26c1 10 6 15 12 15s11-5 12-15c-3 4-7 5-12 5s-9-1-12-5z" :fill="l.beard")
</template>

<script setup lang="ts">
/**
 * A speaker's face: a chibi bust drawn from the same `Look` their 3D rig is
 * built from, so the goblin king in a dialogue is the goblin king in the cave.
 * `public/images/portraits/<look>.webp` replaces it.
 */
import { computed } from 'vue'
import { LOOKS, heroLook } from '@/game/gfx/rigs/looks'
import type { Look } from '@/game/gfx/rigs/humanoid'
import { PORTRAIT_ART } from '@/game/assets/overrides'
import { heroGenderOfId, heroOutfit, heroOutfitOfId, heroPortraitId, heroSampleEquipped } from '@/game/art/heroPortrait'
import { profile } from '@/game/state/profile'

const props = withDefaults(defineProps<{
  /** A look id, `hero` (the player's hero as dressed now), or `hero-<outfit>`
   *  / `hero-f-<outfit>` (the boy or the girl hero in one outfit family: the
   *  hero choice, the art bench). */
  look: string
  ring?: string
  /** Dev benches: the vector bust even when a painted file exists. */
  drawn?: boolean
}>(), { ring: '#ffd24a', drawn: false })

const base: Look = { skin: '#e2b08a', hair: '#5a3b24', head: 'short', top: '#4a5fd6', bottom: '#3a4a6a', trim: '#c9a24a', outfit: 'tunic', held: 'none', off: 'none' }
/** Speakers that are not two-legged rigs. */
const CREATURES: Record<string, Partial<Look>> = {
  oracle: { skin: '#58c8b0', hair: '#2a6a7a', head: 'crown', top: '#2a6a7a', trim: '#ffe9a8', eyeGlow: '#ffe9a8', ears: 'pointy' },
  dragon: { skin: '#7a4ad8', hair: '#3a2a6a', head: 'horns', top: '#4a2a9a', trim: '#ffd84a', eyeGlow: '#ffd84a', ears: 'pointy' },
  voidLord: { skin: '#3a2a6a', hair: '#1c1234', head: 'horns', top: '#1c1234', trim: '#a45cff', eyeGlow: '#d28bff' }
}

const l = computed<Look>(() => {
  if (props.look === 'hero') return heroLook(profile.inv.equipped, profile.hero.gender)
  // `hero-<outfit>` / `hero-f-<outfit>`: the boy or the girl hero in one
  // outfit family, bare-headed — the reference bust the painted portrait of
  // that family is made from.
  const family = heroOutfitOfId(props.look)
  if (family) return heroLook(heroSampleEquipped(family), heroGenderOfId(props.look) ?? 'm')
  return LOOKS[props.look] ?? { ...base, ...(CREATURES[props.look] ?? {}) }
})
// The hero's painted portrait follows the outfit family (one painting each,
// `hero-tunic` … `hero-plate` for the boy, `hero-f-tunic` … for the girl);
// the vector bust follows every piece worn and stays the fallback (the girl
// is never shown the boy's painting, or the other way round). The painting
// shows no headgear.
const artId = computed(() => (props.look === 'hero' ? heroPortraitId(heroOutfit(profile.inv.equipped), profile.hero.gender) : props.look))
const src = computed(() => (props.drawn ? '' : PORTRAIT_ART.get(artId.value) ?? ''))
const hairCap = computed(() => ['short', 'long', 'bun', 'spiky', 'ponytail', 'crown', 'horns', 'goggles'].includes(l.value.head))
/** The girl hero's ponytail: bare-headed, and below any helmet that leaves room for it. */
const ponytail = computed(() => l.value.head === 'ponytail' || (l.value.style === 'ponytail' && l.value.head !== 'greathelm' && l.value.head !== 'hood'))
const ribbon = computed(() => l.value.ribbon ?? '#e0505e')
const metal = computed(() => l.value.metal ?? '#c9d3e4')
const eye = computed(() => l.value.eyeGlow ?? '#241a2e')
</script>

<style scoped lang="sass">
.portrait
  position: relative
  display: block
  width: 100%
  aspect-ratio: 1
  flex: 0 0 auto
  border-radius: 50%
  overflow: hidden
  background: radial-gradient(circle at 50% 30%, #5a6fb8 0%, #2a2f5a 80%)
  box-shadow: inset 0 0 0 0.16em var(--ring), 0 0 0 0.12em #0f1a30, 0 0.2em 0 0.12em #0f1a30
  user-select: none
.portrait__svg, .portrait__img
  position: absolute
  inset: 0
  width: 100%
  height: 100%
  object-fit: cover
  pointer-events: none
.portrait__svg
  :deep(path), :deep(circle), :deep(ellipse), :deep(rect)
    stroke-linejoin: round
</style>
