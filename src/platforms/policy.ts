// ─── Platform policy: portal rules that shape the UI and what a build ships ──
//
// Pure — no `import.meta.env`, no Vue, no `window` — so the SAME rules are read
// by `vite.config.ts` (which decides what gets aliased out of a build) and by
// the app (through the build-time `platformPolicy` in `capabilities.ts`).
// Adding a portal rule means adding a field here, not another scattered
// `VITE_APP_*` check in a component.

export interface PolicyInput {
  isPoki: boolean
  /**
   * `VITE_POKI_QA_TOOLS=true`: a QA twin of the Poki build that keeps the dev
   * tooling (cheats, the debug toggle, the 30-tap interstitial) so a tester can
   * prove ads in the Inspector without playing past the pacing floor. Never a
   * release: the deploy tool's release gates refuse an artifact carrying it.
   */
  qaTools?: boolean
}

export interface PlatformPolicy {
  /**
   * Poki: "the free/standard continue must be in the primary position and
   * equal or larger than the rewarded option" (integrate-poki REQUIREMENTS §3).
   * So wherever a free choice and a rewarded one sit side by side — the result
   * screen's Continue vs. Double bolts, the defeat screen's Retreat vs. Reboot
   * (ad) — the free one renders FIRST and is never the smaller of the two.
   */
  freeOptionFirst: boolean
  /**
   * Does dev tooling ship? The `localStorage.cheat` cheats, the typed "cmarc"
   * debug toggle and the hidden 30-tap QA interstitial. Poki's hard
   * requirements ask for a clean build — "no debug code, no dev artifacts"
   * (REQUIREMENTS §1 row 10) — so its release build carries none of it: the
   * modules are aliased to stubs, and the `cheat` flag no longer turns on
   * debug mode.
   */
  devTools: boolean
}

export const resolvePlatformPolicy = ({ isPoki, qaTools = false }: PolicyInput): PlatformPolicy => ({
  freeOptionFirst: isPoki,
  devTools: !isPoki || qaTools
})

/**
 * The dev-tooling modules a build without `devTools` swaps for no-op stubs:
 * import specifier → project-relative stub path. Each stub mirrors its real
 * module's exports, so every importer still resolves.
 */
export const DEV_TOOL_STUBS = {
  '@/use/useCheats': 'src/use/useCheats.stub.ts',
  '@/game/cheats': 'src/game/cheats.stub.ts',
  '@/use/useQaAdTrigger': 'src/use/useQaAdTrigger.stub.ts'
} as const

/** The `resolve.alias` entries a build with this policy needs for its dev
 *  tooling (project-relative stub paths; `vite.config.ts` makes them absolute).
 *  Empty when the tooling ships. */
export const devToolAliases = (policy: PlatformPolicy): Record<string, string> =>
  (policy.devTools ? {} : { ...DEV_TOOL_STUBS })
