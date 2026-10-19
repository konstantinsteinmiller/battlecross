import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * ─── The town's simulation and the conversations stay lazy (roadmap #142) ───
 *
 * Neither is needed for a new player's first fight, so neither may be pulled
 * into the engine or the scene chunk by a static import: they arrive through
 * their loaders (`sim/townSimLoader.ts`, `talkLoader.ts`), on the idle queue
 * or awaited before a town is built. A static import from any of the modules
 * below would quietly put them back on the boot path.
 */

const SRC = resolve(__dirname, '../../src')
const read = (p: string): string => readFileSync(resolve(SRC, p), 'utf8')

/** Value imports (not `import type`) of a file's source. */
const valueImports = (src: string): string[] =>
  [...src.matchAll(/^import\s+(?!type\b)[^'"]*?from\s+['"]([^'"]+)['"]/gm)].map(m => m[1]!)

/** Engine- and scene-side modules that reach a town or a conversation. */
const ENGINE = [
  'game/flow.ts', 'game/talk.ts', 'game/modes/zoneMode.ts', 'game/sim/step.ts', 'game/sim/director.ts',
  'game/sim/zoneGen.ts', 'game/gfx/terrain.ts', 'components/hud/GameHud.vue', 'components/dialog/NpcPins.vue'
]
const LAZY = /(sim\/town|sim\/townLife|sim\/townGen|sim\/townCode|\/townLife|\.\/town|\.\/townGen|\.\/townCode|data\/dialogs|dialog\/runner|dialog\/conditions|talkCode|OverheardLayer\.vue)$/

describe('the lazy chunks of a town and of a conversation', () => {
  it.each(ENGINE)('%s imports neither statically', (file) => {
    const src = read(file)
    expect(valueImports(src).filter(p => LAZY.test(p))).toEqual([])
  })

  it('a conversation started before its code is here waits for it, then begins', async () => {
    const talk = await import('@/game/talk')
    expect(talk.talkCodeReady()).toBeNull()
    expect(talk.conversationOf('sunfordSmith')).toBeUndefined()
    const { loadTalk } = await import('@/game/talkLoader')
    await loadTalk()
    expect(talk.talkCodeReady()).not.toBeNull()
    expect(talk.conversationOf('sunfordSmith')?.id).toBe('sunfordSmith')
  })

  it('the town code loads once, and the town is laid by it', async () => {
    const hooks = await import('@/game/sim/townHooks')
    expect(hooks.townSimReady()).toBeNull()
    expect(() => hooks.townSim()).toThrow()
    const { loadTownSim } = await import('@/game/sim/townSimLoader')
    const a = await loadTownSim()
    expect(await loadTownSim()).toBe(a)
    expect(hooks.townSim().generateTown).toBeTypeOf('function')
  })
})
