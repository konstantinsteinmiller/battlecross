// ─── Game cheats no-op stub (Poki release build) ─────────────────────────────
//
// Replaces `@/game/cheats` via `resolve.alias` in `vite.config.ts` whenever
// `platformPolicy.devTools` is false — today, the Poki release, which must be a
// clean build ("no debug code, no dev artifacts"). See `useCheats.stub.ts`.
// Must mirror the real module's export surface.

export const registerGameCheats = (): void => {}
