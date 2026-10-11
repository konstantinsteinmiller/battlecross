<script setup lang="ts">
import { computed } from 'vue'
import { SKILL_BY_ID, CLASSES, skillIcon, skillName, classIcon } from '../data'
import { showTip, moveTip, hideTip } from '../tip'

const props = withDefaults(defineProps<{ id: string; size?: number; dim?: boolean; label?: boolean }>(), { size: 52 })
const s = computed(() => SKILL_BY_ID[props.id])
const icon = computed(() => (s.value ? skillIcon(s.value) : null))
const color = computed(() => (s.value ? CLASSES[s.value.cls].color : '#888'))
</script>

<template>
  <span v-if="s" class="skill" :class="{ dim, passive: s.kind === 'passive' }" :style="{ '--c': color, '--s': size + 'px' }"
    @mouseenter="showTip('skill', id, $event)" @mousemove="moveTip" @mouseleave="hideTip">
    <span class="frame">
      <img v-if="icon" :src="icon" :alt="skillName(s)" loading="lazy" />
      <span v-else class="glyph">
        <img :src="classIcon(s.cls)" alt="" loading="lazy" />
        <b>{{ skillName(s).split(' ').map(w => w[0]).join('').slice(0, 2) }}</b>
      </span>
    </span>
    <span v-if="label" class="lbl">{{ skillName(s) }}</span>
  </span>
</template>

<style scoped>
.skill { display: inline-flex; flex-direction: column; align-items: center; gap: 4px; cursor: help; vertical-align: middle; }
.frame {
  width: var(--s); height: var(--s); border-radius: 12px; overflow: hidden; position: relative; display: block;
  box-shadow: 0 0 0 2px var(--c), 0 0 14px color-mix(in srgb, var(--c) 45%, transparent), inset 0 0 0 1px rgba(0,0,0,.6);
  background: radial-gradient(circle at 50% 35%, color-mix(in srgb, var(--c) 45%, #1a1426), #120e1a);
  transition: transform .12s, box-shadow .12s;
}
.passive .frame { border-radius: 50%; }
.skill:hover .frame { transform: scale(1.08); box-shadow: 0 0 0 2px #fff6c2, 0 0 22px var(--c); }
.frame > img { width: 100%; height: 100%; object-fit: cover; display: block; }
.glyph { position: absolute; inset: 0; display: grid; place-items: center; }
.glyph img { position: absolute; width: 74%; height: 74%; object-fit: contain; opacity: .35; filter: saturate(1.3); }
.glyph b { position: relative; font-family: var(--display); font-weight: 400; color: #fff; font-size: calc(var(--s) * .34); text-shadow: 0 2px 0 rgba(0,0,0,.7); }
.dim { opacity: .35; filter: grayscale(.8); }
.lbl { font-size: 11.5px; font-weight: 700; color: var(--muted); max-width: calc(var(--s) + 34px); text-align: center; line-height: 1.15; }
</style>
