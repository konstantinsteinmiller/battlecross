/**
 * ─── A town's simulation, as one lazy chunk (roadmap #142) ──────────────────
 *
 * Everything the simulation needs only inside a town: laying it out
 * (`town.ts`, `townGen.ts`) and its people's day (`townLife.ts`). The first
 * fight of a new player never needs it, so it stays out of the engine chunk:
 * `townSimLoader.ts` fetches it (on the idle queue, and awaited before a town
 * is built) and hands it to `townHooks.ts`, which the engine reads it through.
 */
export { generateTown } from './townGen'
export { townCanTalk } from './town'
export { spawnTownPeople, stepTownLife, townAddress, townGreet } from './townLife'
