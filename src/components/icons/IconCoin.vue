<script setup lang="ts">
import { UI_ART } from '@/game/assets/overrides'

// The coin is drawn; `public/images/ui/coin.webp` replaces it.
const src = UI_ART.get('coin') ?? ''
</script>

<template lang="pug">
  //- Sized by the caller (e.g. `class="w-4 h-4"`).
  img(v-if="src" :src="src" alt="" draggable="false")
  svg(v-else viewBox="0 0 24 24" aria-hidden="true" focusable="false")
    circle(cx="12" cy="12.6" r="9.6" fill="#0f1a30")
    circle(cx="12" cy="11.4" r="9.6" fill="#f0a020" stroke="#0f1a30" stroke-width="1.6")
    circle(cx="12" cy="11.4" r="6.6" fill="#ffd84a")
    path(d="M12 7.2l1.3 2.8 3 .3-2.2 2 .7 3-2.800-1.600-2.800 1.600.7-3-2.200-2 3-.3z" fill="#f0a020")
    path(d="M6.600 8.400a6.600 6.600 0 0 1 4-3.200" fill="none" stroke="#fff6c8" stroke-width="1.400" stroke-linecap="round")
</template>
