/**
 * FAIL, 30 s — "under-levelled and greedy."
 *
 * The game's third pillar, as a story: recommended levels are shown, never
 * enforced. A hero who wins comfortably at home walks into a zone far above
 * him and learns why the map draws skulls on it.
 *
 *   0–9     Sunford Plains: a clean win, the hero untouched
 *   9–19    Whispering Woods: a harder fight, won, the bar half gone
 *   19–30   Frostbite Tundra at level 9 (the zone starts at 16): the giants
 *           do not care. The hero falls at about 26 s with the pack standing.
 */

import { boot, botOn, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

export default {
  id: 'fail',
  label: 'Under-levelled and greedy',

  async setup(ctx) {
    await boot(ctx)
    await hero(ctx, { level: 9, cls: 'shadow', potions: 0 })
    const tundra = await build(ctx, 'tundra')
    await hero(ctx, { level: 7, cls: 'shadow', potions: 1 })
    const woods = await build(ctx, 'woods')
    await hero(ctx, { level: 3, cls: 'shadow', potions: 1 })
    const plains = await build(ctx, 'plains')
    ctx.shots = { plains, woods, tundra }

    await cutTo(ctx, plains, { pack: 1, gap: 3.6, heroHp: 1 })
    await botOn(ctx, true)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    const { woods, tundra } = ctx.shots
    await roll(ctx)
    ctx.beat('plains')
    await t.until(9000)
    await logState(ctx, 'leaving the plains')

    await cutTo(ctx, woods, { pack: 1, gap: 3.6, heroHp: 0.7 })
    ctx.beat('woods')
    await t.until(19_000)
    await logState(ctx, 'leaving the woods')

    await cutTo(ctx, tundra, { pack: 'finale', gap: 3.6, heroHp: 0.2, potions: 0 })
    ctx.beat('tundra')
    const fell = await t.untilState(27_500, () => !(/** @type {any} */ (window).__preview.state().hero.alive), 'the hero falls')
    await logState(ctx, fell ? 'the hero is down' : 'the hero still stands (stage him lower)')
    await t.until(ctx.durationMs)
    await logState(ctx, 'last frame')
  }
}
