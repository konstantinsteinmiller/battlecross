import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import { ITEMS, SMITHED } from '@/game/data/items'
import { SKILLS, ENDGAME_SKILLS, CLASS_IDS, PRESTIGE_IDS } from '@/game/data/skills'
import { ENEMIES } from '@/game/data/enemies'
import { REBORN } from '@/game/data/invasion'
import { MAP, TOWNS, FALLBACK_TRAINERS } from '@/game/data/zones'
import { CAGES } from '@/game/data/cages'
import { ERRANDS } from '@/game/data/errands'
import { FACTIONS, QUESTS } from '@/game/data/quests'
import { PLANTS } from '@/game/data/plants'
import { ORE_LEVEL } from '@/game/data/ores'
import { ELIXIRS } from '@/game/data/elixirs'
import { ARENA_MODS } from '@/game/arenaWeek'

// ─── Every label the UI builds from game data exists ─────────────────────────
//
// The screens ask for `item.<id>.name`, `enemy.<id>`, `npc.<id>.name` … built from the data's ids. A data entry without
// its label shows the raw key on screen ("enemy.on.reborn.frostJarl"), and the locale parity test cannot see it (it
// compares locales with English, and English lacks the key too).

const has = (k: string): boolean => {
  let cur: any = en
  for (const p of k.split('.')) cur = cur?.[p]
  return typeof cur === 'string'
}
const missing = (keys: string[]): string[] => keys.filter(k => !has(k))

describe('labels for what the data defines', () => {
  it('items, skills, classes', () => {
    expect(missing([...ITEMS, ...SMITHED].map(i => `item.${i.id}.name`))).toEqual([])
    expect(missing([...SKILLS, ...ENDGAME_SKILLS].flatMap(s => [`skill.${s.id}.name`, `skill.${s.id}.desc`]))).toEqual([])
    expect(missing([...CLASS_IDS, ...PRESTIGE_IDS].flatMap(c => [`class.${c}.name`, `class.${c}.desc`]))).toEqual([])
  })
  it('enemies, and the reborn leaders of the second arc', () => {
    expect(missing(ENEMIES.map(e => `enemy.${e.id}`))).toEqual([])
    expect(missing([...REBORN].map(r => `invasion.reborn.${r}`))).toEqual([])
  })
  it('places and people', () => {
    expect(missing(MAP.flatMap(n => [`node.${n.id}.name`, `node.${n.id}.desc`]))).toEqual([])
    const npcs = new Set<string>()
    for (const t of Object.values(TOWNS)) for (const n of t.npcs) npcs.add(n.id)
    for (const f of FALLBACK_TRAINERS) npcs.add(f.npc)
    for (const c of CAGES) npcs.add(c.npc)
    expect(missing([...npcs].map(n => `npc.${n}.name`))).toEqual([])
  })
  it('quests, errands, factions, plants, ores, elixirs, arena mods', () => {
    expect(missing(QUESTS.map(q => `quest.${q.id}.title`))).toEqual([])
    expect(missing(ERRANDS.map(e => `errand.${e.id}.title`))).toEqual([])
    expect(missing(FACTIONS.map(f => `faction.${f}`))).toEqual([])
    expect(missing(PLANTS.map(p => `plant.${p.id}.name`))).toEqual([])
    expect(missing(Object.keys(ORE_LEVEL).map(o => `ore.${o}.name`))).toEqual([])
    expect(missing(ELIXIRS.flatMap(e => [`elixir.${e.id}.name`, `elixir.${e.id}.desc`]))).toEqual([])
    expect(missing(ARENA_MODS.flatMap(m => [`ladder.mod.${m}`, `ladder.modDesc.${m}`]))).toEqual([])
  })
})
