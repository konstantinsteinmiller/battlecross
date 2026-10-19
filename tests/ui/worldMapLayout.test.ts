import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'

/**
 * The world map's controls never cover each other or a place (goal chip, corner
 * HUD buttons, card close, node buttons). jsdom has no layout, so the check
 * runs in a real browser: `scripts/map-overlap-audit.mjs` against a dev server.
 *   MAP_AUDIT_URL=http://localhost:5173 pnpm vitest run tests/ui/worldMapLayout.test.ts
 */
const url = process.env.MAP_AUDIT_URL
const SIZES = '880x495@1.5,844x390@3,568x320@2,390x844@3,1024x768@2,1280x720@1,1920x1080@1'

describe.runIf(!!url)('world map layout (real browser)', () => {
  for (const locale of ['pl-PL', 'de-DE', 'ru-RU']) {
    it(`nothing reachable is covered, ${locale}`, () => {
      const r = spawnSync(process.execPath, ['scripts/map-overlap-audit.mjs', '--url', url!, '--locale', locale, '--sizes', SIZES, '--card'], { encoding: 'utf8' })
      const out = r.stdout + r.stderr
      expect(r.status, out).toBe(0)
      expect(out.match(/^  (REACH|BLOCK).*$/gm) ?? [], out).toEqual([])
    }, 240000)
  }
})

describe('world map layout contract', () => {
  it('the audit script is shipped', () => {
    expect(spawnSync(process.execPath, ['--check', 'scripts/map-overlap-audit.mjs']).status).toBe(0)
  })
})
