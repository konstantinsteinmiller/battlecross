<script setup lang="ts">
import { QUESTS, ERRANDS, TOWNS, MAP, FACTION_COLOR, ITEM_BY_ID, IMG, t, zoneName, npcName, factionName, enemyName, plantName, itemName, CLASSES, className, type ClassId, type TownId } from '../data'
import { CAGES } from '@/game/data/cages'
import ItemIcon from '../components/ItemIcon.vue'

const SPEAKER: Record<string, string> = { goblinKing: 'goblinKing', warlord: 'warlord', dwarf: 'dwarf', oracle: 'oracle', dragon: 'dragon', archDemon: 'archDemon' }
const portrait = (sp: string): string | null => (SPEAKER[sp] ? `${IMG}portraits/${SPEAKER[sp]}.webp` : null)

/** What a world flag changes, read off who needs it. */
const effectsOf = (flag: string): string[] => {
  const out: string[] = []
  for (const town of Object.keys(TOWNS) as TownId[]) {
    for (const n of TOWNS[town].npcs) {
      const role = n.role === 'trainer' && n.cls ? `${className(n.cls as ClassId)} trainer` : n.role === 'shop' ? 'merchant' : n.role
      if (n.needs?.includes(flag)) out.push(`＋ ${npcName(n.id)} (${role}) appears in ${zoneName(town)}`)
      if (n.not?.includes(flag)) out.push(`－ ${npcName(n.id)} (${role}) leaves ${zoneName(town)}`)
    }
  }
  for (const node of MAP) {
    if (node.trainer?.not?.includes(flag)) out.push(`－ The hidden ${className(node.trainer.cls)} teacher is no longer in ${zoneName(node.id)}`)
    if (node.needs?.includes(flag)) out.push(`＋ ${zoneName(node.id)} opens`)
  }
  if (flag === 'oracleSlain') out.push('＋ The Keeper of Hours is found on Dragon\'s Peak instead')
  if (flag === 'oakhavenFallen') out.push('Oakhaven becomes a ruin under the Syndicate')
  if (flag.startsWith('end')) out.push('Decides the ending')
  return out
}
const stepText = (s: (typeof ERRANDS)[number]['steps'][number]): string => {
  switch (s.kind) {
    case 'slay': return `Defeat ${s.n} × ${enemyName(s.enemy!)}${s.place ? ` in ${zoneName(s.place)}` : ''}`
    case 'gather': return `Gather ${s.n} × ${plantName(s.plant!)}`
    case 'clear': return `Clear ${zoneName(s.place!)}`
    case 'visit': return `Go to ${zoneName(s.place!)}`
    case 'bring': return `Bring ${itemName(ITEM_BY_ID[s.item!]!)}`
    case 'pieces': return `Find ${s.n} pieces of the treasure map`
    case 'dig': return `Dig where the map says, in ${zoneName(s.place!)}`
    case 'talk': return `Talk to ${npcName(s.npc!)}`
  }
}
const errandTitle = (id: string, giver: string): string => (t(`errand.${id}.title`) !== id ? t(`errand.${id}.title`) : `${npcName(giver)}'s test`)
</script>

<template>
  <div class="page wrap">
    <h1 class="gold-text">Quests & Fateful Choices</h1>
    <p class="muted lead">Six major quests end in a permanent choice. Each one moves your standing with the three factions — the Iron Order, the Ashen Syndicate and the Circle of Aether — and changes who trades and teaches where. Below them: every errand, test and favour.</p>

    <div class="section-title"><h2>The six decisions</h2></div>
    <div class="stack">
      <section v-for="(q, n) in QUESTS" :key="q.id" class="panel quest">
        <img v-if="portrait(q.speaker)" :src="portrait(q.speaker)!" class="qp" alt="" />
        <div class="qb">
          <div class="dim small">Quest {{ n + 1 }} · end of {{ zoneName(q.node) }}</div>
          <h2 class="display gold-text">{{ t(`quest.${q.id}.title`) }}</h2>
          <div class="choices">
            <div v-for="c in q.choices" :key="c.id" class="choice" :class="c.tone">
              <div class="cl">“{{ t(`quest.${q.id}.${c.id}.label`) }}”</div>
              <div class="row small">
                <span v-if="c.needs?.attrs" class="chip">Needs {{ Object.entries(c.needs.attrs).map(([a, v]) => `${v} ${a.toUpperCase()}`).join(', ') }}</span>
                <span v-if="c.needs?.rep" class="chip">Needs {{ Object.entries(c.needs.rep).map(([f, v]) => `${factionName(f)} +${v}`).join(', ') }}</span>
                <span v-if="c.needs?.level" class="chip">Needs level {{ c.needs.level }}</span>
                <span v-for="(v, f) in c.rep" :key="f" class="chip" :style="{ color: FACTION_COLOR[f] }">{{ factionName(f) }} {{ v! > 0 ? '+' : '' }}{{ v }}</span>
                <span v-if="c.gold" class="chip">+{{ c.gold }} gold</span>
                <span v-if="c.item" class="row"><ItemIcon :id="c.item" :size="28" /></span>
              </div>
              <ul class="fx small"><li v-for="e in c.flags.flatMap(effectsOf)" :key="e">{{ e }}</li></ul>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="section-title"><h2>Errands, tests & favours</h2></div>
    <div class="grid g2">
      <div v-for="e in ERRANDS" :key="e.id" class="panel tight">
        <h3 class="display">{{ errandTitle(e.id, e.giver) }}</h3>
        <div class="small muted">For {{ npcName(e.giver) }}</div>
        <ol class="small"><li v-for="(s, i) in e.steps" :key="i">{{ stepText(s) }}</li></ol>
        <div class="row small">
          <span v-if="e.reward.gold" class="chip">+{{ e.reward.gold }} gold</span>
          <span v-if="e.reward.xp" class="chip">+{{ Math.round(e.reward.xp * 100) }}% of a level</span>
          <span v-for="f in e.reward.flags ?? []" :key="f" class="chip unlock">🔓 {{ f.startsWith('found') ? className(f.slice(5).toLowerCase() as ClassId) + ' lessons' : f === 'collectorOpen' ? 'Alder Vane\'s shop' : f === 'mirelaOpen' ? 'Mirela\'s shop' : f }}</span>
        </div>
      </div>
    </div>

    <div class="section-title"><h2>Cages</h2><span class="dim small">find the key glinting somewhere in the zone</span></div>
    <div class="grid g3">
      <div v-for="c in CAGES" :key="c.zone" class="panel tight">
        <h3 class="display">{{ npcName(c.npc) }}</h3>
        <div class="small">{{ c.kind === 'iron' ? 'Iron' : 'Wooden' }} cage in <b>{{ zoneName(c.zone) }}</b> → moves to {{ zoneName(c.town) }}</div>
        <div v-if="c.found" class="small unlock">Teaches {{ className(c.found.slice(5).toLowerCase() as ClassId) }} — no master's test needed</div>
        <div v-else-if="c.npc === 'freedPeddler'" class="small dim">Opens a trinket/hands/feet stall</div>
        <div v-else class="small dim">Has a favour to ask</div>
      </div>
    </div>

    <div class="section-title"><h2>Every day</h2></div>
    <div class="grid g3">
      <div class="panel"><h3 class="display">📋 Town boards</h3><p class="small">Each town's notice board posts three tasks a day: a hunt in the zones around the town, a gathering, or escorting the caravan between Sunford and Oakhaven (double pay). Gold plus a fifth of a level each.</p></div>
      <div class="panel"><h3 class="display">📜 Faction contracts</h3><p class="small">The factions post daily contracts. Full standing (+5) grants a blessing: Order +5% max health, Syndicate +10% kill gold, Circle +10% mana regeneration — and gifts of their gear.</p></div>
      <div class="panel"><h3 class="display">🏛 The Colosseum</h3><p class="small">Opens with the Goblin King's quest. Wave after wave; a new weekly board every Monday.</p></div>
      <div class="panel"><h3 class="display">🗺 Captain Rook's map</h3><p class="small">Six pieces of a treasure map hide in the world. Elder Mara knows the story; dig in the Ashen Crags for half a level of experience and the chest.</p></div>
    </div>
  </div>
</template>

<style scoped>
.lead { max-width: 900px; }
.quest { display: flex; gap: 22px; align-items: flex-start; }
.qp { width: 150px; height: 150px; object-fit: contain; flex: none; filter: drop-shadow(0 6px 16px rgba(0,0,0,.6)); }
.qb { flex: 1; }
.choices { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; }
.choice { background: rgba(0,0,0,.28); border-radius: 12px; padding: 12px; border-left: 3px solid var(--muted); }
.choice.noble { border-color: #ffd84a; }
.choice.ruthless { border-color: #ff5a6a; }
.choice.cunning { border-color: #5fd8ff; }
.cl { font-weight: 800; margin-bottom: 6px; }
.fx { list-style: none; padding-left: 0; margin: 8px 0 0; color: var(--muted); }
.unlock { color: #ffcf7a; }
@media (max-width: 760px) { .quest { flex-direction: column; } }
</style>
