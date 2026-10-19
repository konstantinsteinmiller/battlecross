// Only English is voiced in full. Every other language ships just the core
// lines (data/voice-core.json), so the build stays under the portal's size
// limit and a language never holds a file outside the core.

import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { coreIdsOf, voiceBaseId, type VoiceCoreSpec } from '@/game/audio/voiceCore'
import { voiceFileId } from '@/game/audio/voiceTodo'

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

  for (const lang of ['de', 'fr', 'es', 'ru', 'ja', 'pt', 'zh']) {
    it(`${lang}: public/audio/voice/${lang} holds only core files`, () => {
      const dir = resolve(ROOT, 'public/audio/voice', lang)
      const files = existsSync(dir) ? readdirSync(dir) : []
      const outside = files.filter(f => !core.has(voiceFileId(f)))
      expect(outside, `outside the core: ${outside.slice(0, 5).join(', ')}`).toEqual([])
    })
  }
})
