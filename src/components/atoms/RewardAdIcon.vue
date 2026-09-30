<script setup lang="ts">
/**
 * The "a video follows this click" mark, prepended to rewarded buttons: a
 * film clapper, THE convention for "this plays a video". Vector only — the
 * old runtime probe for a painted bitmap requested a file that did not exist,
 * which is a red 404 in every portal QA console (drop-ins are discovered at
 * build time now, `game/assets/overrides.ts`).
 */
</script>

<template lang="pug">
  //- Drawn as a filled silhouette rather than a stroked outline so it
  //- survives the ~16 px it renders at inside a button label.
  svg.reward-ad-icon(viewBox="0 0 24 18" fill="currentColor" aria-hidden="true" focusable="false")
    path(d="M2.6 5.6h18.8c.66 0 1.2.54 1.2 1.2v8.4c0 .66-.54 1.2-1.2 1.2H2.6c-.66 0-1.2-.54-1.2-1.2V6.8c0-.66.54-1.2 1.2-1.2Z")
    path(d="M1.7 4.4 20.4 1.05a1 1 0 0 1 1.16.81l.24 1.36L2.4 6.6l-.7-1.34a.95.95 0 0 1 0-.86Z")
    path(d="m7 2.55 1.3 2.3-2.2.4-1.3-2.3zM13 1.5l1.3 2.3-2.2.4-1.3-2.3z" fill="#0d1526")
    path(d="M10.1 8.5v5l4.4-2.5z" fill="#0d1526")
</template>

<style scoped lang="sass">
.reward-ad-icon
  flex: 0 0 auto
  // 4:3, matching the authored frame, so the bitmap and the fallback occupy
  // exactly the same box and the label never reflows when the art lands.
  height: 1.15em
  width: calc(1.15em * 4 / 3)
  object-fit: contain
  user-select: none
  -webkit-user-drag: none
</style>
