/**
 * THE CINEMATIC TRAILER (roadmap #X1) — `pnpm cinematic-trailer`.
 *
 * About 72 s at 1920x1080, cut on the beat of the game's own boss theme
 * ("Trial of Blades", 112 BPM: a beat is 0.536 s, every cut lands on one).
 * Three acts, the hero a different class in nearly every shot, so the range
 * of the game shows:
 *
 *   ACT 1, the call      the Goblin King ("No deals. Your raids end here."),
 *                        the Elder Treant, the siege of Oakhaven ("The gate
 *                        stays shut.")
 *   ACT 2, the montage   one bar per place: the Ashen Crags, the Iron
 *                        Colossus, the Frost Jarl, the Naga Oracle, the
 *                        colosseum's waves, the Void Warden — then a boss
 *                        falls and the loot beams go up
 *   ACT 3, the climax    the Void Dragon ("I don't bargain with dragons."),
 *                        the Arch-Demon falls ("I'll take it myself."), the
 *                        chest, and the Void Lord waiting in the rift
 *
 * Every fight is the game's own: the place is built as the game builds it, the
 * fight is STAGED (the hero put a few metres short of the pack, health bars set
 * where the story needs them) and then played by the balance suite's reference
 * player — enemies and hero behave exactly as in a run. No text: the recorder's
 * clean feed hides the speech bubbles and the HUD; the hero's lines are his
 * own recordings, laid under the picture by the mix step
 * (`tools/preview-video/cinematic-trailer.mjs`), which reads the cue file this
 * scenario writes.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { boot, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

/** One beat of the boss theme, ms. */
export const BEAT = 60_000 / 112
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
/** Where the mix step finds the voice cues. */
export const CUES = resolve(ROOT, 'preview-videos', 'cinematic-cues.json')

const bossDown = () => {
  const s = /** @type {any} */ (window).__preview.state()
  // The finale's fall IS the visit's victory (a branch boss elsewhere does not count).
  return s.ended === 'victory' || (!!s.boss && !s.boss.alive)
}

/**
 * The shot list. `beats`: the shot's length on the music's grid. `vo`: a line
 * of the hero's and when in the shot it starts (ms; 'kill' = 0.7 s after the
 * boss falls). `preroll`: ms played off camera after the cut (the colosseum's
 * first waves walk in). Built LAST first, so the hero each place is built with
 * is the hero who fights in it.
 */
export const SHOTS = [
  { id: 'hollows', node: 'hollows', hero: { level: 5, cls: 'aegis' }, stage: { pack: 'finale', gap: 3.0, heroHp: 0.95, bossHp: 0.055, foeHp: 0.2 }, beats: 12, vo: ['dlg.quest.goblinKing.slay.say', 500] },
  { id: 'woods', node: 'woods', hero: { level: 8, cls: 'shadow' }, stage: { pack: 'finale', gap: 3.2, heroHp: 0.9, bossHp: 0.35, foeHp: 0.4 }, beats: 8 },
  { id: 'outskirts', node: 'outskirts', hero: { level: 10, cls: 'sovereign' }, stage: { pack: 'finale', gap: 2.4, heroHp: 0.9, bossHp: 0.06, foeHp: 0.12 }, beats: 10, vo: ['dlg.quest.siege.defend.say', 300] },
  { id: 'crags', node: 'crags', hero: { level: 13, cls: 'pyro' }, stage: { pack: 1, gap: 3.0, heroHp: 0.9, foeHp: 0.7 }, beats: 4 },
  { id: 'mines', node: 'mines', hero: { level: 15, cls: 'aether' }, stage: { pack: 'finale', gap: 4.2, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'tundra', node: 'tundra', hero: { level: 19, cls: 'geo' }, stage: { pack: 'finale', gap: 3.8, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'temple', node: 'temple', hero: { level: 20, cls: 'chrono' }, stage: { pack: 'finale', gap: 3.6, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'arena', node: 'arena', hero: { level: 15, cls: 'sovereign' }, preroll: 4200, beats: 6 },
  { id: 'citadel', node: 'citadel', hero: { level: 23, cls: 'blood' }, stage: { pack: 'finale', gap: 3.6, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'loot', node: 'tundra', hero: { level: 19, cls: 'pyro', bare: true }, stage: { pack: 'finale', gap: 3.0, heroHp: 0.9, bossHp: 0.05, foeHp: 0.05 }, beats: 14 },
  { id: 'peak', node: 'peak', hero: { level: 25, cls: 'aegis' }, stage: { pack: 'finale', gap: 5.0, heroHp: 0.85, bossHp: 0.11 }, beats: 22, vo: ['dlg.quest.dragon.slay.say', 700] },
  { id: 'fortress', node: 'fortress', hero: { level: 30, cls: 'pyro', bare: true }, stage: { pack: 'finale', gap: 4.0, heroHp: 0.75, bossHp: 0.16, foeHp: 0.2 }, beats: 32, vo: ['dlg.quest.throne.claim.say', 'kill'] },
  { id: 'rift', node: 'rift', hero: { level: 30, cls: 'shadow' }, stage: { pack: 'finale', gap: 6.5, heroHp: 1, bossHp: 1 }, beats: 14 }
]

/** The trailer's length: every shot's beats, on the grid. */
export const TRAILER_MS = Math.round(SHOTS.reduce((n, s) => n + s.beats, 0) * BEAT)

/** Play the page clock off camera (the recorder's clock is armed in record()). */
const preroll = (ctx, ms) => ctx.evaluate(async (ms) => {
  const dt = 1000 / 30
  for (let i = 0; i < Math.max(1, Math.round(ms / dt)); i++) {
    /** @type {any} */ (window).__vclock?.step(dt)
    await Promise.resolve()
  }
}, ms)

export default {
  id: 'success',
  label: 'Cinematic trailer',

  async setup(ctx) {
    await boot(ctx)
    ctx.built = {}
    for (const s of [...SHOTS].reverse()) {
      await hero(ctx, s.hero)
      ctx.built[s.id] = await build(ctx, s.node)
    }
    const first = SHOTS[0]
    await cutTo(ctx, ctx.built[first.id], first.stage)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    const cues = []
    const now = () => Math.round(t.spent())
    // Written as each cue happens: the recorder stops the scenario on the last frame.
    mkdirSync(dirname(CUES), { recursive: true })
    const save = () => writeFileSync(CUES, JSON.stringify({ fps: ctx.fps, durationMs: ctx.durationMs, cues }, null, 2))
    save()
    await roll(ctx)
    let end = 0
    for (let i = 0; i < SHOTS.length; i++) {
      const s = SHOTS[i]
      if (i > 0) {
        await cutTo(ctx, ctx.built[s.id], s.stage ?? {})
        if (s.preroll) await preroll(ctx, s.preroll)
      }
      ctx.beat(s.id)
      const start = now()
      end += s.beats * BEAT
      if (s.vo && s.vo[1] !== 'kill') {
        await t.until(start + s.vo[1])
        cues.push({ id: s.vo[0], ms: now(), shot: s.id })
        save()
      }
      if (s.vo && s.vo[1] === 'kill') {
        const fell = await t.untilState(end - 2500, bossDown, `${s.id}: the boss falls`)
        await logState(ctx, fell ? `${s.id}: boss down` : `${s.id}: boss still up (stage lower)`)
        await t.wait(700)
        cues.push({ id: s.vo[0], ms: now(), shot: s.id })
        save()
        await t.wait(900)
        ctx.beat('poster')
      }
      await t.until(end)
      await logState(ctx, `end of ${s.id}`)
    }
    await t.until(ctx.durationMs)
    ctx.log.info(`voice cues: ${cues.map(c => `${c.id}@${(c.ms / 1000).toFixed(2)}s`).join(', ')} → ${CUES}`)
  }
}
