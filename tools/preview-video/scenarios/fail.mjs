/**
 * FAIL — "one hit short."
 *
 * The loss a viewer believes they would have won: the hero takes the Ember
 * Lord's court apart, has the boss at a sliver — and falls with it still
 * standing. No potion left on the belt.
 *
 *   0.00        in the lava field, the Ember Lord's bar already low
 *   0.00–0.50   the hero wins the exchange: the adds drop
 *   0.50–0.80   the boss at a sliver; the hero's own bar is gone
 *   0.80–1.00   the fall
 *
 * The same sheet plays every format (beats are fractions). The fight is
 * staged to be genuinely out of reach — a Shadowblade (fast, fragile) with a
 * sliver of health and no potions against a boss a level above — because a fight on a knife
 * edge is decided by which way one blow lands and would not repeat take to
 * take. "Out of reach" is still only a potion away, which is the point.
 *
 * WHY THE CRAGS. Lava and fire elementals are the most different picture from
 * the success clip's cave, so the two covers do not look like the same clip.
 */

import { boot, botOn, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

export default {
  id: 'fail',
  label: 'One hit short',

  async setup(ctx) {
    await boot(ctx)
    await hero(ctx, { level: 8, cls: 'shadow', potions: 0 })
    const shot = await build(ctx, 'crags')
    // The court takes about 2.7 % of this hero's health per second (measured
    // on the 10 s take). Staged so the fall lands a little past the middle of
    // the clip, whatever its length: 5 s → 8 %, 10 s → 15 %, 16 s → 24 %.
    const heroHp = Math.max(0.06, (ctx.durationMs / 1000) * 0.55 * 0.027)
    await cutTo(ctx, shot, { pack: 'finale', gap: 3.4, heroHp, bossHp: 0.5, foeHp: 0.9, potions: 0 })
    await botOn(ctx, true)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    const clip = ctx.durationMs
    await roll(ctx)
    ctx.beat('exchange')

    const fell = await t.untilState(clip * 0.86, () => !(/** @type {any} */ (window).__preview.state().hero.alive), 'the hero falls')
    await logState(ctx, fell ? 'the hero is down' : 'the hero still stands (stage him lower)')

    // No poster beat: the opening frame — a rogue in a ring of fire, the boss
    // over him — is the better card, and CrazyGames asks for the cover to BE
    // the opening frame.
    await t.until(clip)
    await logState(ctx, 'last frame')
  }
}
