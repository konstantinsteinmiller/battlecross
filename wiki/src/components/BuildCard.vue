<script setup lang="ts">
import { computed } from 'vue'
import type { GuideBuild } from '../builds'
import { CLASSES, ATTR_SHORT, ATTR_COLOR, classIcon, className, type ClassId } from '../data'
import { statFocus } from '../synergy'
import SkillIcon from './SkillIcon.vue'

const props = defineProps<{ build: GuideBuild }>()
const stars = (n: number): string => '★'.repeat(n) + '☆'.repeat(3 - n)
const focus = computed(() => statFocus(props.build.actives, props.build.attrs))
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
    <div class="skills act">
      <SkillIcon v-for="id in build.actives" :key="id" :id="id" :size="34" />
    </div>
    <div class="skills pas">
      <SkillIcon v-for="id in build.passives" :key="id" :id="id" :size="30" />
      <span class="focus" :style="{ color: ATTR_COLOR[focus.attr] }" :title="`${focus.on} of ${focus.total} damage skills scale with ${ATTR_SHORT[focus.attr]}`">
        {{ ATTR_SHORT[focus.attr] }} focus {{ focus.pct }}%
      </span>
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
.skills { display: grid; gap: 6px; }
.act { grid-template-columns: repeat(8, minmax(0, 34px)); margin: 10px 0 6px; }
.pas { grid-template-columns: repeat(4, minmax(0, 30px)) 1fr; align-items: center; margin-bottom: 12px; }
.focus { justify-self: end; font-family: var(--display); font-size: 13px; }
.roles { gap: 6px; }
</style>
