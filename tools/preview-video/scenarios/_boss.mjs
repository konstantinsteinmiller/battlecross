/**
 * The boss-fight clips for the YouTube Shorts cut (`formats.shorts`, portrait 1080×1920, 24 s): one factory for the two stories the
 * portal clips tell, so each boss is a few lines.
 *
 *   win(...)   the hero is already in the boss's court, the adds fall, the boss goes down on a freeze-frame, the flash and the chest
 *   fail(...)  the hero takes the court apart, has the boss at a sliver, and falls one hit short with no potion on the belt
 *
 * Beats are anchored on STATE (the boss is dead / the hero is down), bounded by the clock; read the log lines: they are the proof
 * the kill (or the fall) landed in the clip, and the staging numbers below are what to move when it did not.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { boot, botOn, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

/**
 * The Short's sound log: every sound the fight asked for, on the clip's clock (the page's clock is the recorder's virtual one, one
 * frame = 1000/fps ms), written for `shorts-audio.mjs`, which voices them with the game's own synth and lays the boss theme under.
 * @returns {() => Promise<void>} call it at the end of the take
 */
const logSounds = async (ctx, id) => {
  const page0 = await ctx.evaluate(() => performance.now())
  const taken = (await ctx.evaluate(() => /** @type {any} */ (window).__preview.sfxLog())).length
  return async () => {
    const log = await ctx.evaluate(() => /** @type {any} */ (window).__preview.sfxLog())
    const events = log.slice(taken).filter((e) => e.t >= page0).map((e) => ({ name: e.name, ms: Math.round(e.t - page0), pan: e.pan, gain: e.gain }))
    const out = resolve(ROOT, 'preview-videos', 'shorts-audio', `${id}.json`)
    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, JSON.stringify({ fps: ctx.fps, durationMs: ctx.durationMs, events }, null, 2))
  }
}

/** @param {{ id: string, label: string, node: string, cls: string, level: number, potions?: number, bossHp: number, heroHp?: number, foeHp?: number, gap?: number, firstPhase?: string[] }} o */
export const win = (o) => ({
  id: o.id,
  label: o.label,
  async setup(ctx) {
    await boot(ctx)
    await hero(ctx, { level: o.level, cls: o.cls, potions: o.potions ?? 2 })
    const shot = await build(ctx, o.node)
    await cutTo(ctx, shot, { pack: 'finale', gap: o.gap ?? 3.8, heroHp: o.heroHp ?? 0.8, bossHp: o.bossHp, foeHp: o.foeHp ?? 0.7 })
    await botOn(ctx, true)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },
  async record(ctx) {
    const t = budget(ctx)
    const save = await logSounds(ctx, o.id)
    await roll(ctx)
    ctx.beat('court')
    // Runs in the page, so the first phase's kinds are written into the function (a closure does not cross over).
    const won = eval(`() => {
      const s = window.__preview.state()
      // The whole fight is won (a boss with two phases, a king and his mount, falls twice).
      return s.ended === 'victory' || (!!s.boss && !s.boss.alive && !${JSON.stringify(o.firstPhase ?? [])}.includes(s.boss.kind))
    }`)
    const fell = await t.untilState(ctx.durationMs * 0.8, won, 'the fight is won')
    await logState(ctx, fell ? 'the boss is down' : 'the boss still stands (stage him lower)')
    await t.wait(320)
    ctx.beat('poster')
    await t.until(ctx.durationMs)
    await save()
    await logState(ctx, 'last frame')
  }
})

/** @param {{ id: string, label: string, node: string, cls: string, level: number, bossHp: number, heroHp?: number, foeHp?: number, gap?: number }} o */
export const fail = (o) => ({
  id: o.id,
  label: o.label,
  async setup(ctx) {
    await boot(ctx)
    await hero(ctx, { level: o.level, cls: o.cls, potions: 0 })
    const shot = await build(ctx, o.node)
    // Out of his depth, not on a knife edge: a hero well under the boss's level at full health goes down in the clip whichever way a
    // blow lands, while the boss shows a good chunk of damage taken (a bar that was winnable is what makes the fall hurt).
    const heroHp = o.heroHp ?? 1
    await cutTo(ctx, shot, { pack: 'finale', gap: o.gap ?? 3.6, heroHp, bossHp: o.bossHp, foeHp: o.foeHp ?? 0.9, potions: 0 })
    await botOn(ctx, true)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },
  async record(ctx) {
    const t = budget(ctx)
    const save = await logSounds(ctx, o.id)
    await roll(ctx)
    ctx.beat('exchange')
    const fell = await t.untilState(ctx.durationMs * 0.86, () => !(/** @type {any} */ (window).__preview.state().hero.alive), 'the hero falls')
    await logState(ctx, fell ? 'the hero is down' : 'the hero still stands (stage him lower)')
    await t.until(ctx.durationMs)
    await save()
    await logState(ctx, 'last frame')
  }
})
