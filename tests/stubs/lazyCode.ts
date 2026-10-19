import { installTownSim } from '@/game/sim/townHooks'
import * as townCode from '@/game/sim/townCode'
import { installTalkCode } from '@/game/talk'
import * as talkCode from '@/game/talkCode'

/**
 * ─── The lazy chunks, loaded up front ───────────────────────────────────────
 *
 * The town's simulation and the conversations' code are chunks of their own
 * in the game (roadmap #142), installed by their loaders before a town is
 * built or a talk begins. A test that builds a town or talks to someone
 * imports this file first: the same code, installed at once, so every call is
 * as synchronous as it was before the split. After `vi.resetModules()` call
 * `installLazyCode()` again from the fresh registry.
 */
installTownSim(townCode)
installTalkCode(talkCode)

export const installLazyCode = async (): Promise<void> => {
  const [hooks, town, talk, code] = await Promise.all([
    import('@/game/sim/townHooks'), import('@/game/sim/townCode'), import('@/game/talk'), import('@/game/talkCode')
  ])
  hooks.installTownSim(town)
  talk.installTalkCode(code)
}
