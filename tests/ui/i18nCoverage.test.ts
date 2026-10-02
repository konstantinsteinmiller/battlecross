import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import en from '@/i18n/locales/en'
import { ITEMS } from '@/game/data/items'
import { SKILLS, CLASS_IDS } from '@/game/data/skills'
import { ENEMIES } from '@/game/data/enemies'
import { MAP, TOWNS } from '@/game/data/zones'
import { QUESTS, FACTIONS, EPILOGUE_FLAGS } from '@/game/data/quests'
import { ATTRS } from '@/game/data/attributes'
import { ACTIONS } from '@/game/engine/keyBindings'
import { LESSONS } from '@/game/coach'
import { GLYPHS } from '@/components/art/glyphs'
import { CONVERSATIONS, conversationOf, decisionOf } from '@/game/data/dialogs'
import { linesOf } from '@/game/dialog/manifest'
import { END_LINE } from '@/game/dialog/runner'

/**
 * Every string the game can put on screen has an English source.
 *
 * Two halves: the keys written out in the code (`t('pause.title')`), found by
 * reading the sources; and the keys BUILT from data (`item.<id>.name`,
 * `skill.<id>.desc`…), derived from the same tables the game reads — so a new
 * item, skill, enemy or quest without its text fails here, not in front of a
 * player. The other locales are held to the English shape by the parity test.
 */

const ROOT = resolve(__dirname, '../..')

const get = (key: string): unknown => {
  let cur: unknown = en
  for (const part of key.split('.')) {
    if (cur === null || typeof cur !== 'object') return undefined
    cur = (cur as Record<string, unknown>)[part]
  }
  return cur
}
const has = (key: string): boolean => typeof get(key) === 'string' && (get(key) as string).length > 0

const walk = (dir: string, out: string[] = []): string[] => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'locales') walk(p, out) } else if (/\.(vue|ts)$/.test(name)) out.push(p)
  }
  return out
}

describe('i18n coverage', () => {
  it('every literal key in the sources exists in English', () => {
    const missing: string[] = []
    const re = /(?:\b|\$)te?\(\s*'([A-Za-z][\w-]*(?:\.[\w-]+)*)'/g
    for (const file of walk(join(ROOT, 'src'))) {
      const src = readFileSync(file, 'utf8')
      for (const m of src.matchAll(re)) {
        const key = m[1]!
        if (!has(key)) missing.push(`${key}  (${file.slice(ROOT.length + 1)})`)
      }
    }
    expect([...new Set(missing)]).toEqual([])
  })

  it('every item, skill, class and attribute has its text', () => {
    const missing: string[] = []
    const need = (k: string): void => { if (!has(k)) missing.push(k) }
    for (const i of ITEMS) {
      need(`item.${i.id}.name`)
      for (const mod in i.mods) need(`mod.${mod}`)
      need(`slot.${i.slot}`)
      need(`tier.${i.tier}`)
      need(`source.${i.drop.src}`)
    }
    for (const s of SKILLS) {
      need(`skill.${s.id}.name`)
      need(`skill.${s.id}.desc`)
    }
    for (const c of CLASS_IDS) { need(`class.${c}.name`); need(`class.${c}.desc`) }
    for (const a of ATTRS) { need(`attr.${a}.name`); need(`attr.${a}.short`); need(`attr.${a}.desc`); need(`mod.${a}`) }
    for (const f of FACTIONS) need(`faction.${f}`)
    expect(missing).toEqual([])
  })

  it('a skill description only quotes numbers its table has', () => {
    const bad: string[] = []
    for (const s of SKILLS) {
      const text = String(get(`skill.${s.id}.desc`) ?? '')
      for (const m of text.matchAll(/\{(\w+)\}/g)) if (!(m[1]! in s.p)) bad.push(`${s.id}: {${m[1]}}`)
    }
    expect(bad).toEqual([])
  })

  it('every enemy, place, townsperson and quest has its text', () => {
    const missing: string[] = []
    const need = (k: string): void => { if (!has(k)) missing.push(k) }
    for (const e of ENEMIES) need(`enemy.${e.id}`)
    for (const n of MAP) { need(`node.${n.id}.name`); need(`node.${n.id}.desc`) }
    for (const town of Object.values(TOWNS)) {
      for (const n of town.npcs) {
        need(`npc.${n.id}.name`)
        // The shop window's own one-liner under the keeper's name. Everything
        // else a townsperson says is a line of their conversation (below).
        if (n.role === 'shop') need(`npc.${n.id}.talk`)
        if (!conversationOf(n.id)) missing.push(`a conversation for ${n.id}`)
      }
    }
    for (const n of MAP) {
      if (!n.trainer) continue
      need(`npc.${n.trainer.npc}.name`)
      if (!conversationOf(n.trainer.npc)) missing.push(`a conversation for ${n.trainer.npc}`)
    }
    for (const q of QUESTS) {
      // The map shows a quest's title and the label of the choice made; the
      // decision itself is spoken (`dlg.quest.<id>`).
      need(`quest.${q.id}.title`)
      for (const c of q.choices) need(`quest.${q.id}.${c.id}.label`)
      if (!decisionOf(q.id)) missing.push(`a decision conversation for ${q.id}`)
    }
    for (const k of ['order', 'syndicate', 'circle', 'free', 'unbound']) { need(`ending.${k}.title`); need(`ending.${k}.text`) }
    for (const f of EPILOGUE_FLAGS) need(`ending.note.${f}`)
    expect(missing).toEqual([])
  })

  it('every spoken line has its text: a dialogue line\'s id is its key', () => {
    const missing: string[] = []
    const need = (k: string): void => { if (!has(k)) missing.push(k) }
    need(END_LINE.id)
    for (const c of CONVERSATIONS) {
      need(c.name)
      for (const l of linesOf(c)) need(l.id)
      for (const n of Object.values(c.nodes)) for (const ch of n.choices) if (ch.note) need(ch.note.key)
    }
    // What the choice list says about a locked choice, and the gift toasts.
    for (const k of ['attr', 'level', 'rep', 'gold', 'full', 'other']) need(`dlg.ui.needs.${k}`)
    for (const k of ['hero', 'leave', 'topics', 'gotGold', 'gotItem', 'hint']) need(`dlg.ui.${k}`)
    need('hud.gold')
    expect([...new Set(missing)]).toEqual([])
  })

  it('the coach, the controls page and the key bindings have their sentences', () => {
    const missing: string[] = []
    const need = (k: string): void => { if (!has(k)) missing.push(k) }
    for (const l of LESSONS) { need(`coach.${l.id}.touch`); need(`coach.${l.id}.mouse`) }
    for (const a of ACTIONS) need(`options.actions.${a}`)
    expect(missing).toEqual([])
  })

  it('every status has a name and a drawing; every item kind and skill has a drawing', () => {
    const missing: string[] = []
    const statuses = Object.keys(get('status') as Record<string, string>)
    for (const s of statuses) if (!(`status.${s}` in GLYPHS)) missing.push(`glyph status.${s}`)
    for (const s of SKILLS) if (!(`skill.${s.id}` in GLYPHS)) missing.push(`glyph skill.${s.id}`)
    for (const i of ITEMS) if (!(i.kind in GLYPHS)) missing.push(`glyph ${i.kind}`)
    expect(missing).toEqual([])
  })
})
