// ─── gameMonetizePlugin no-op stub (non-GameMonetize builds only) ───────────
//
// Replaces `@/utils/gameMonetizePlugin` on every build except GameMonetize's,
// via `resolve.alias` in `vite.config.ts`. Same mechanism, and the same reason,
// as `yandexPlugin.stub.ts` / `pokiPlugin.stub.ts`.
//
// `GameMonetizeProvider` was already stub-swapped, which closed the STATIC
// path. `main.ts` still reaches the real module through
// `await import('@/utils/gameMonetizePlugin')` behind an env-literal `if`, and
// on an obfuscated build that `if` is not a guarantee: the stringArray pass
// hoists literals (the SDK URL among them) into its table before esbuild folds
// the env comparison. The alias removes the EVIDENCE, not just the call — so no
// other portal's archive can name GameMonetize's SDK, whatever the obfuscator
// decides on a given run.
//
// Must match the real module's FULL export surface
// (`tests/platforms/gameMonetizeBuild.test.ts` holds the two to the same
// names). No GameMonetize URL or SDK identifier anywhere in this file.

import { ref } from 'vue'
import type { Ref } from 'vue'
import type { SaveStrategy } from '@/utils/save/types'
import { LocalStorageStrategy } from '@/utils/save/LocalStorageStrategy'

export const isGmSdkActive: Ref<boolean> = ref(false)
export const isGmAdsBlocked: Ref<boolean> = ref(false)
export const isGmRewardedFilled: Ref<boolean> = ref(false)
export const isGmAdCoolingDown: Ref<boolean> = ref(false)

export const gameMonetizePlugin = async (): Promise<void> => {}
export const createGameMonetizeSaveStrategy = (): SaveStrategy => new LocalStorageStrategy()
export const showRewardedAdGM = async (_onImpression?: () => void): Promise<boolean> => false
export const showMidgameAdGM = async (_onImpression?: () => void): Promise<void> => {}
export const preloadRewardedGM = (): void => {}

const useGameMonetize = () => ({
  isGmSdkActive,
  isGmAdsBlocked,
  isGmRewardedFilled,
  isGmAdCoolingDown,
  gameMonetizePlugin,
  createGameMonetizeSaveStrategy,
  showRewardedAdGM,
  showMidgameAdGM,
  preloadRewardedGM,
  onSdkEvent: (_name: string, _listener: (event: any) => void): (() => void) => () => {}
})

export default useGameMonetize
