/**
 * THE CINEMATIC TRAILER (roadmap #X1) — `pnpm cinematic-trailer`.
 *
 * About 86 s at 1920x1080, cut on the bars of its own score, "The Last Light"
 * (`tools/score-render/score.mjs`: 112 BPM, a beat is 0.536 s; every shot is
 * whole bars, so each cut lands on a downbeat and each section of the music on
 * its act). The score is also the game's boss-fight music.
 * Three acts, the hero a different class in nearly every shot, so the range
 * of the game shows:
 *
 *   ACT 1, the call      the hero walks out of Sunford down its main road;
 *                        the Goblin King, the Elder Treant, the siege of
 *                        Oakhaven
 *   ACT 2, the montage   one bar per place: the Ashen Crags, the Iron
 *                        Colossus, the Frost Jarl, the Naga Oracle, the
 *                        colosseum's waves, the Void Warden — then a boss
 *                        falls and the loot beams go up
 *   ACT 3, the climax    back in Sunford, round the well in the square,
 *                        then the Void Dragon, the Arch-Demon falls, the
 *                        chest, and the Void Lord waiting in the rift
 *
 * Every fight is the game's own: the place is built as the game builds it, the
 * fight is STAGED (the hero put a few metres short of the pack, health bars set
 * where the story needs them) and then played by the balance suite's reference
 * player — enemies and hero behave exactly as in a run. No text: the recorder's
 * clean feed hides the speech bubbles and the HUD. No voice either: the sound
 * is the music and the fights' own sound effects. The frame recorder hears
 * nothing, so this scenario LOGS every sound the game asks for (`sfxLog`) on
 * the clip's clock, and the mix step (`tools/preview-video/cinematic-trailer.mjs`)
 * voices them offline from the game's own synth.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { boot, budget, build, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

/** One beat of the boss theme, ms. */
export const BEAT = 60_000 / 112
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
/** Where the mix step finds the fights' sounds, on the clip's clock. */
export const SOUNDS = resolve(ROOT, 'preview-videos', 'cinematic-sfx.json')

const bossDown = () => {
  const s = /** @type {any} */ (window).__preview.state()
  // The finale's fall IS the visit's victory (a branch boss elsewhere does not count).
  return s.ended === 'victory' || (!!s.boss && !s.boss.alive)
}

/**
 * The shot list. `beats`: the shot's length on the music's grid. `hold`: the
 * boss's fall is the shot's moment (wait for it, then a beat on the poster
 * frame). `preroll`: ms played off camera after the cut (the colosseum's
 * first waves walk in). `walk`: no fight, the hero walks this route (town
 * cells, `sim/town.ts`: the square is columns 14–24, rows 9–20, the fountain
 * at row 14, the main road runs down column 19 to the green and the gate). Built LAST
 * first, so the hero each place is built with is the hero who fights in it.
 */
export const SHOTS = [
  { id: 'sunford', node: 'sunford', hero: { level: 30, cls: 'aegis' }, walk: [[17, 11], [17, 19], [19, 22], [19, 33]], beats: 8 },
  { id: 'hollows', node: 'hollows', hero: { level: 5, cls: 'aegis' }, stage: { pack: 'finale', gap: 3.0, heroHp: 0.95, bossHp: 0.055, foeHp: 0.2 }, beats: 12 },
  { id: 'woods', node: 'woods', hero: { level: 8, cls: 'shadow' }, stage: { pack: 'finale', gap: 3.2, heroHp: 0.9, bossHp: 0.35, foeHp: 0.4 }, beats: 8 },
  { id: 'outskirts', node: 'outskirts', hero: { level: 10, cls: 'sovereign' }, stage: { pack: 'finale', gap: 2.4, heroHp: 0.9, bossHp: 0.06, foeHp: 0.12 }, beats: 12 },
  { id: 'crags', node: 'crags', hero: { level: 13, cls: 'pyro' }, stage: { pack: 1, gap: 3.0, heroHp: 0.9, foeHp: 0.7 }, beats: 4 },
  { id: 'mines', node: 'mines', hero: { level: 15, cls: 'aether' }, stage: { pack: 'finale', gap: 4.2, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'tundra', node: 'tundra', hero: { level: 19, cls: 'geo' }, stage: { pack: 'finale', gap: 3.8, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'temple', node: 'temple', hero: { level: 20, cls: 'chrono' }, stage: { pack: 'finale', gap: 3.6, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'arena', node: 'arena', hero: { level: 15, cls: 'sovereign' }, preroll: 4200, beats: 8 },
  { id: 'citadel', node: 'citadel', hero: { level: 23, cls: 'blood' }, stage: { pack: 'finale', gap: 3.6, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'loot', node: 'tundra', hero: { level: 19, cls: 'pyro', bare: true }, stage: { pack: 'finale', gap: 3.0, heroHp: 0.9, bossHp: 0.05, foeHp: 0.05 }, beats: 12 },
  { id: 'square', node: 'sunford', hero: { level: 25, cls: 'sovereign' }, walk: [[16, 18], [16, 11], [22, 11], [22, 18], [16, 18]], beats: 8 },
  { id: 'peak', node: 'peak', hero: { level: 25, cls: 'aegis' }, stage: { pack: 'finale', gap: 5.0, heroHp: 0.85, bossHp: 0.11 }, beats: 24 },
  { id: 'fortress', node: 'fortress', hero: { level: 30, cls: 'pyro', bare: true }, stage: { pack: 'finale', gap: 4.0, heroHp: 0.75, bossHp: 0.16, foeHp: 0.2 }, beats: 32, hold: true },
  { id: 'rift', node: 'rift', hero: { level: 30, cls: 'shadow' }, stage: { pack: 'finale', gap: 6.5, heroHp: 1, bossHp: 1 }, beats: 16 }
]

/** The trailer's length: every shot's beats, on the grid. */
export const TRAILER_MS = Math.round(SHOTS.reduce((n, s) => n + s.beats, 0) * BEAT)

/** A town cell's centre in world metres (`sim/grid.ts`: CELL = 1.5). */
const cellAt = ([i, j]) => [(i + 0.5) * 1.5, (j + 0.5) * 1.5]

/** Put the hero on a shot's walk, or hand him back to the reference player. */
const direct = (ctx, s) => s.walk
  ? ctx.evaluate((pts) => /** @type {any} */ (window).__preview.walk(pts), s.walk.map(cellAt))
  : ctx.evaluate(() => /** @type {any} */ (window).__preview.bot(true))

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
    await cutTo(ctx, ctx.built[first.id], first.stage ?? {})
    if (first.walk) await direct(ctx, first)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    /** Every sound on the clip's clock: { name, ms, pan, gain, shot }. */
    const events = []
    // Written as the shots go: the recorder stops the scenario on the last frame.
    mkdirSync(dirname(SOUNDS), { recursive: true })
    const save = () => writeFileSync(SOUNDS, JSON.stringify({ fps: ctx.fps, durationMs: ctx.durationMs, events }, null, 2))
    /** The page's clock right now (the recorder's virtual clock: one frame = 1000/fps ms). */
    const pageNow = () => ctx.evaluate(() => performance.now())
    /** What the page played since `from` (page clock), laid on the clip at `clipAt`. */
    let taken = 0
    const collect = async (shot, page0, clip0) => {
      const log = await ctx.evaluate(() => /** @type {any} */ (window).__preview.sfxLog())
      for (const e of log.slice(taken)) {
        // Sounds of the cut and the preroll happened off camera.
        if (e.t >= page0) events.push({ name: e.name, ms: Math.round(clip0 + e.t - page0), pan: e.pan, gain: e.gain, shot })
      }
      taken = log.length
      save()
    }
    // The boot and the off-camera staging made sounds too: not the clip's.
    taken = (await ctx.evaluate(() => /** @type {any} */ (window).__preview.sfxLog())).length
    save()
    await roll(ctx)
    let end = 0
    for (let i = 0; i < SHOTS.length; i++) {
      const s = SHOTS[i]
      if (i > 0) {
        await cutTo(ctx, ctx.built[s.id], s.stage ?? {})
        if (s.preroll) await preroll(ctx, s.preroll)
      }
      // A walk, or a fight for the reference player (the first shot's walk starts again from its first point).
      await direct(ctx, s)
      ctx.beat(s.id)
      // The first shot rolls from frame 0 (its opening was settled before the clock was armed).
      const page0 = await pageNow()
      const clip0 = t.spent()
      // What a trailer cut rides on (the mix voices these, `tools/sfx-render/sweeteners.js`):
      // air pulled into the cut, a cinematic hit on it; a riser into the dragon, a sub drop for the last word.
      if (i > 0) {
        const last = i === SHOTS.length - 1
        events.push({ name: 'trailerWhoosh', ms: Math.max(0, Math.round(clip0 - 380)), pan: 0, gain: 0.8, shot: s.id })
        events.push({ name: last ? 'trailerSub' : 'trailerHit', ms: Math.round(clip0), pan: 0, gain: s.walk ? 0.5 : 0.9, shot: s.id })
      }
      if (SHOTS[i + 1]?.id === 'peak') events.push({ name: 'trailerRiser', ms: Math.round(clip0 + s.beats * BEAT - 3100), pan: 0, gain: 0.4, shot: s.id })
      end += s.beats * BEAT
      if (s.hold) {
        const fell = await t.untilState(end - 2500, bossDown, `${s.id}: the boss falls`)
        await logState(ctx, fell ? `${s.id}: boss down` : `${s.id}: boss still up (stage lower)`)
        await t.wait(1600)
        ctx.beat('poster')
      }
      // A frame short of the cut first: the last shot never returns from its end.
      await t.until(end - 2000 / ctx.fps)
      await collect(s.id, i === 0 ? page0 - clip0 : page0, i === 0 ? 0 : clip0)
      await t.until(end)
      await collect(s.id, i === 0 ? page0 - clip0 : page0, i === 0 ? 0 : clip0)
    }
    await t.until(ctx.durationMs)
  }
}
