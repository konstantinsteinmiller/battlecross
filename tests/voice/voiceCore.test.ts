// Only English is voiced in full. Every other language ships just the core
// lines (data/voice-core.json), so the build stays under the portal's size
// limit and a language never holds a file outside the core.

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { coreIdsOf, fullLangsOf, voiceBaseId, voicedIn, type VoiceCoreSpec } from '@/game/audio/voiceCore'
import { voiceFileId } from '@/game/audio/voiceTodo'
import { conversationOf, decisionOf } from '@/game/data/dialogs'
import { INTRO_NARRATION } from '@/game/data/dialogs/intro'
import { CAPTIVE_BARKS } from '@/game/data/dialogs/captives'
import { BOSS_BARKS } from '@/game/data/dialogs/bosses'
import { BREAKING_BEATS, BREAKING_TALK } from '@/game/data/dialogs/breaking'
import { SIEGE_BARKS } from '@/game/data/dialogs/siege'
import { ROAD_NPCS } from '@/game/data/mentor'
import { CAMP_THANKS } from '@/game/sim/camp'
import { linesOf } from '@/game/dialog/manifest'
import type { ConversationDef } from '@/game/dialog/types'

const ROOT = resolve(__dirname, '../..')
const spec: VoiceCoreSpec = JSON.parse(readFileSync(resolve(ROOT, 'data/voice-core.json'), 'utf8'))
const manifest = JSON.parse(readFileSync(resolve(ROOT, 'data/voice-manifest.json'), 'utf8'))
const ids: string[] = manifest.lines.map((l: { id: string }) => l.id)
const core = new Set(coreIdsOf(spec, ids))

describe('voice core list', () => {
  it('stays within its limit, twins included', () => {
    expect(core.size).toBeGreaterThan(0)
    expect(core.size).toBeLessThanOrEqual(spec.max)
  })

  it('names only lines that exist, and gives each core girl-hero line its boy base', () => {
    for (const id of spec.include) expect(ids, id).toContain(id)
    for (const id of core) if (id.endsWith('__f')) expect(core.has(voiceBaseId(id)), id).toBe(true)
  })

  it('holds the learn, goodbye, quest, ending and bark lines, and no small talk or epilogue notes', () => {
    for (const id of ['dlg.hero.train', 'dlg.hero.bye', 'dlg.hero.train__f', 'dlg.quest.goblinKing.ask.1', 'dlg.quest.throne.claim.2', 'ending.order.text', 'ending.more', 'dlg.bark.goblinKing.horn.1', 'dlg.bark.dragon.takeoff.1', 'dlg.elderMara.map.2'])
      expect(core.has(id), id).toBe(true)
    for (const id of core) expect(id).not.toMatch(/smalltalk|ending\.note|dlg\.sunfordGambler/)
  })

  // The core is a hand-kept pattern list, so a new speaker of the tutorial or
  // the afterplay's story was silent in every language but English until
  // someone remembered a pattern (Nettle on the road, #136). Derived from the
  // game's own data: every line these scenes can speak is core.
  const mustBeCore: Array<[string, readonly ConversationDef[]]> = [
    ['the intro', INTRO_NARRATION],
    ['the first visit\'s road teachers', ROAD_NPCS.map(n => conversationOf(n.id)).filter((c): c is ConversationDef => !!c)],
    ['the freed captives and the camp\'s thanks', CAPTIVE_BARKS],
    ['the bosses\' barks', BOSS_BARKS],
    ['the afterplay\'s story beats', BREAKING_BEATS],
    ['the afterplay\'s fort and scout', BREAKING_TALK],
    ['the siege', SIEGE_BARKS],
    ['the seal decision', [decisionOf('seal')!]]
  ]
  for (const [what, convs] of mustBeCore) {
    it(`holds every line of ${what}`, () => {
      expect(convs.length, what).toBeGreaterThan(0)
      const missing = convs.flatMap(c => linesOf(c).map(l => l.id)).filter(id => ids.includes(id) && !core.has(id))
      expect(missing, `not core: ${missing.slice(0, 5).join(', ')}`).toEqual([])
    })
  }

  it('holds the camp\'s thanks', () => expect(core.has(CAMP_THANKS)).toBe(true))

  const filesOf = (lang: string): string[] => {
    const dir = resolve(ROOT, 'public/audio/voice', lang)
    return existsSync(dir) ? readdirSync(dir) : []
  }

  it('voices English and German in full, and the rest by the core', () => {
    expect(fullLangsOf(spec)).toEqual(['en', 'de'])
    expect(voicedIn(spec, core, 'de', 'dlg.sunfordGambler.hello.1')).toBe(true)
    expect(voicedIn(spec, core, 'en', 'dlg.sunfordGambler.hello.1')).toBe(true)
    expect(voicedIn(spec, core, 'fr', 'dlg.sunfordGambler.hello.1')).toBe(false)
    expect(voicedIn(spec, core, 'fr', 'dlg.hero.train')).toBe(true)
  })

  for (const lang of ['fr', 'es', 'ru', 'ja', 'pt', 'zh']) {
    it(`${lang}: public/audio/voice/${lang} holds only core files`, () => {
      expect(fullLangsOf(spec)).not.toContain(lang)
      const outside = filesOf(lang).filter(f => !core.has(voiceFileId(f)))
      expect(outside, `outside the core: ${outside.slice(0, 5).join(', ')}`).toEqual([])
    })
  }

  it('de: public/audio/voice/de holds only files of lines that exist', () => {
    const known = new Set(ids)
    const stray = filesOf('de').filter(f => !known.has(voiceFileId(f)))
    expect(stray, `no such line: ${stray.slice(0, 5).join(', ')}`).toEqual([])
  })
})
