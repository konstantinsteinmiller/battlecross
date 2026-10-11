<script setup lang="ts">
import type { GuideBuild } from '../builds'
import { CLASSES, classIcon, className, type ClassId } from '../data'
import SkillIcon from './SkillIcon.vue'

defineProps<{ build: GuideBuild }>()
const stars = (n: number): string => '★'.repeat(n) + '☆'.repeat(3 - n)
</script>

<template>
  <a :href="'#/builds/' + build.id" class="panel hover-lift card" :style="{ '--c': CLASSES[build.classes[0] as ClassId].color }">
    <div class="glow"></div>
    <div class="row between">
      <div class="row classes">
        <img v-for="c in build.classes" :key="c" :src="classIcon(c as ClassId)" :title="className(c as ClassId)" alt="" />
      </div>
      <span class="diff" :title="'Difficulty ' + build.difficulty + '/3'">{{ stars(build.difficulty) }}</span>
    </div>
    <h3 class="display">{{ build.name }}</h3>
    <p class="muted small tag">{{ build.tagline }}</p>
    <div class="row skills">
      <SkillIcon v-for="id in build.actives.slice(0, 6)" :key="id" :id="id" :size="36" />
    </div>
    <div class="row roles">
      <span v-for="r in build.roles" :key="r" class="chip">{{ r }}</span>
    </div>
  </a>
</template>

<style scoped>
.card { display: block; color: var(--ink); position: relative; overflow: hidden; }
.card:hover { color: var(--ink); }
.glow { position: absolute; inset: -40% -40% auto auto; width: 240px; height: 240px; background: radial-gradient(circle, color-mix(in srgb, var(--c) 35%, transparent), transparent 70%); pointer-events: none; }
.classes img { width: 30px; height: 30px; object-fit: contain; }
.classes { gap: 4px; }
.diff { color: var(--gold); letter-spacing: 2px; }
h3 { margin: 10px 0 4px; font-size: 23px; color: #fff; }
.tag { min-height: 42px; }
.skills { gap: 7px; margin: 10px 0 12px; }
.roles { gap: 6px; }
</style>
