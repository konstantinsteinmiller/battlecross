// @vitest-environment node
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The store copy has hard limits on the portals' forms: 150 characters for
 * the short description, 500 for the long one. A form that silently truncates
 * mid-sentence is how a listing ends in "and make choices that resh".
 */

const text = readFileSync(resolve(__dirname, '../../description.md'), 'utf8').replace(/\r\n/g, '\n')

const section = (title: string): { stated: number; limit: number; body: string } => {
  const m = new RegExp(`## ${title} \\((\\d+) / (\\d+) chars\\)\\n\\n([\\s\\S]*?)\\n\\n## `).exec(text)
  if (!m) throw new Error(`description.md has no "## ${title} (n / limit chars)" section`)
  return { stated: Number(m[1]), limit: Number(m[2]), body: m[3]!.replace(/\n/g, ' ').trim() }
}

describe('description.md', () => {
  it.each([['Short description', 150], ['Description', 500]] as const)('%s fits its %i characters, and says how long it is', (title, limit) => {
    const s = section(title)
    expect(s.limit).toBe(limit)
    expect(s.body.length).toBeLessThanOrEqual(limit)
    expect(s.stated).toBe(s.body.length)
  })

  it('has the sections a portal form asks for', () => {
    for (const h of ['## How to play', '## Controls', '## Features', '## Tags']) expect(text).toContain(h)
  })

  it('describes this game', () => {
    expect(text).toMatch(/^# Battlecross\n/)
    expect(text).not.toMatch(/Flux|android|robot|machine|cannon|circuit|sector/i)
  })
})
