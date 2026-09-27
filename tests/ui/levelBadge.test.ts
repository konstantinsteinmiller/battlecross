// ─── The level is a rank badge, not a coin ───────────────────────────────────
//
// From a playtest. The level number sat in a gold radial-gradient disc, in a
// dark pill, right beside the Bolts pill with its gold nut, and testers read
// the "1" as a second currency. The badge is now a teal shield with a pointed
// foot (rank insignia, neither the coin's circle nor the nut's hexagon), with
// the XP bar starting in the same teal so the two read as one piece. The hub's
// top bar wears the same badge.
//
// jsdom has no layout or paint, so this holds the stylesheet itself: the
// `.lv-num` rule of each surface, nested `&::before` face included.

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (rel: string): string => readFileSync(resolve(__dirname, '../..', rel), 'utf8').replace(/\r\n/g, '\n')

/** A top-level sass rule of the SFC's style block, nested lines included. */
const rule = (src: string, selector: string): string => {
  const style = src.slice(src.indexOf('<style'))
  const lines = style.split('\n')
  const start = lines.findIndex(l => l === selector)
  expect(start, `${selector} rule`).toBeGreaterThan(-1)
  const end = lines.findIndex((l, i) => i > start && /^\S/.test(l))
  return lines.slice(start, end).join('\n')
}

/** The coin look: the gold disc's stops, the Bolts gold, a round badge. */
const GOLD = /#fff3a0|#ffd23a|#e08a00|#ffd84a/i
const TEAL = '#3fe6c6'

describe.each([
  ['the mission HUD', 'src/components/hud/TopStatus.vue'],
  ['the hub top bar', 'src/components/hub/HubScreen.vue']
])('the level badge on %s', (_where, path) => {
  const src = read(path)

  it('is still the level number, in its badge', () => {
    expect(src).toMatch(/span\.lv-num \{\{ (hud|profile)\.level \}\}/)
  })

  it('is not styled as a coin: no gold, no radial disc, nothing round', () => {
    const badge = rule(src, '.lv-num')
    expect(badge).not.toMatch(GOLD)
    expect(badge).not.toContain('radial-gradient')
    expect(badge).not.toMatch(/border-radius:\s*50%/)
  })

  it('is a teal shield with a pointed foot', () => {
    const badge = rule(src, '.lv-num')
    expect(badge).toContain('clip-path: polygon(0 0, 100% 0, 100% 64%, 50% 100%, 0 64%)')
    expect(badge).toContain(TEAL)
  })

  it('shares its teal with the XP bar, which runs on into the XP green', () => {
    const fill = rule(src, '.xp-fill')
    expect(fill).toMatch(new RegExp(`linear-gradient\\(90deg, ${TEAL}, #9dff5a\\)`))
  })
})

describe('the mission HUD keeps the two apart', () => {
  const src = read('src/components/hud/TopStatus.vue')

  it('gives the level no pill of its own, so it no longer mirrors the Bolts pill', () => {
    const lvl = rule(src, '.lvl')
    expect(lvl).not.toContain('border-radius: 999px')
    expect(lvl).not.toContain('background')
    // the Bolts pill is unchanged: the gold nut in a dark pill
    expect(rule(src, '.bolts')).toContain('border-radius: 999px')
    expect(rule(src, '.bolt-icon')).toContain('#ffd84a')
  })

  it('tucks the XP bar under the badge', () => {
    const xp = rule(src, '.xp')
    expect(xp).toMatch(/margin-left: -\d+px/)
    expect(xp).toMatch(/padding-left: \d+px/)
  })
})
