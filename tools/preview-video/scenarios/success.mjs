/**
 * SUCCESS — "the Goblin King falls."
 *
 * The clip in one sentence: a small hero wades into a pack, the screen fills
 * with fire, and the boss goes down on a freeze-frame.
 *
 *   0.00        already swinging: the hero is in the King's court, his goblins
 *               on him, the King's bar barely scratched
 *   0.00–0.45   fire clears the court (Fireball, Flame Pillar: the Pyromancer's
 *               effects read best at thumbnail size)
 *   0.45–0.72   the King alone: the burst, and the finishing blow — hit-stop
 *               and a camera punch. This is the shot.
 *   0.72–1.00   the win: the flash, the chest, the coins
 *
 * Beats are FRACTIONS of `ctx.durationMs`, so this one sheet plays the 5 s
 * Poki square, the 10 s preview and the 16 s CrazyGames cut: the fight is
 * staged shorter (the King starts lower) for the short ones. The 30 s trailer
 * is a different story — `success-30s`.
 *
 * WHY THE HOLLOWS. The first boss a player meets, in the darkest place of the
 * first tier: fire lights the whole frame, and the King is twice the hero's
 * size, so "small hero, big monster" reads in a still.
 */

import { boot, botOn, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

/** Where the King's health starts, by clip length: the kill lands at ~0.7. */
const kingAt = (ctx) => (ctx.durationMs <= 6000 ? 0.07 : ctx.durationMs <= 11_000 ? 0.2 : 0.32)

export default {
  id: 'success',
  label: 'The Goblin King falls',

  async setup(ctx) {
    await boot(ctx)
    await hero(ctx, { level: 8, cls: 'pyro', potions: 2 })
    const shot = await build(ctx, 'hollows')
    await cutTo(ctx, shot, { pack: 'finale', gap: 3.6, heroHp: 0.8, bossHp: kingAt(ctx), foeHp: 0.7 })
    // Already fighting on frame 0: the reference player locks a target and the
    // world runs for a moment, then freezes on the opening picture.
    await botOn(ctx, true)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    const clip = ctx.durationMs
    await roll(ctx)
    ctx.beat('court')

    // ── The court is cleared, then the King ──
    // Nothing to script: the reference player uses every skill as it comes up,
    // which is what a good player does. The beat is anchored on the kill.
    const fell = await t.untilState(clip * 0.8, () => {
      const s = /** @type {any} */ (window).__preview.state()
      return !!s.boss && !s.boss.alive
    }, 'the King falls')
    await logState(ctx, fell ? 'the King is down' : 'the King still stands (stage him lower)')

    // The cover: a third of a second after the blow, the hit-stop over, the
    // King mid-fall and the flash still in the air.
    await t.wait(320)
    ctx.beat('poster')

    // ── The win ── the flash, the chest, the coins: let it play out.
    await t.until(clip)
    await logState(ctx, 'last frame')
  }
}
