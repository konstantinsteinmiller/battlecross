/**
 * SUCCESS, 30 s — "three places, one hero growing."
 *
 * A different story from the short cut, not a longer one: the game's range.
 * Three prebuilt places, hard cuts between them, the same hero a tier
 * stronger in each.
 *
 *   0–8     Sunford Plains (green): a goblin pack, the first skills
 *   8–17    Ashen Crags (lava): fire elementals and cultists, a harder fight,
 *           the hero's bar drops and a potion goes down
 *   17–30   Frostbite Tundra (snow): the Frost Jarl, the kill at about 25 s,
 *           the chest and the coins
 *
 * Each shot is built in `setup()` (a place is real work to build), so a cut
 * is one frame. The hero is re-made per shot at the level its zone is played
 * at, exactly as the balance tests do.
 */

import { boot, botOn, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

export default {
  id: 'success',
  label: 'Three places, one hero growing',

  async setup(ctx) {
    await boot(ctx)
    // Built in the order they are needed LAST first: the hero each place is
    // built with is the hero that fights in it.
    await hero(ctx, { level: 18, cls: 'pyro', potions: 3 })
    const tundra = await build(ctx, 'tundra')
    await hero(ctx, { level: 12, cls: 'pyro', potions: 3 })
    const crags = await build(ctx, 'crags')
    await hero(ctx, { level: 3, cls: 'pyro', potions: 3 })
    const plains = await build(ctx, 'plains')
    ctx.shots = { plains, crags, tundra }

    await cutTo(ctx, plains, { pack: 1, gap: 3.6, heroHp: 1 })
    await botOn(ctx, true)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    const { crags, tundra } = ctx.shots
    await roll(ctx)
    ctx.beat('plains')
    await t.until(8000)
    await logState(ctx, 'leaving the plains')

    await cutTo(ctx, crags, { pack: 1, gap: 3.6, heroHp: 0.55, foeHp: 0.8 })
    ctx.beat('crags')
    await t.until(17_000)
    await logState(ctx, 'leaving the crags')

    await cutTo(ctx, tundra, { pack: 'finale', gap: 3.8, heroHp: 0.75, bossHp: 0.07, foeHp: 0.15 })
    ctx.beat('tundra')
    const fell = await t.untilState(26_500, () => {
      const s = /** @type {any} */ (window).__preview.state()
      return !!s.boss && !s.boss.alive
    }, 'the Jarl falls')
    await logState(ctx, fell ? 'the Jarl is down' : 'the Jarl still stands (stage him lower)')
    await t.wait(320)
    ctx.beat('poster')
    await t.until(ctx.durationMs)
    await logState(ctx, 'last frame')
  }
}
