/**
 * THE CINEMATIC TRAILER (roadmap #X1, recut in #125) — `pnpm cinematic-trailer`.
 *
 * About 86 s at 1920x1080, cut on the bars of its own score, "The Last Light"
 * (`tools/score-render/score.mjs`, the trailer edit: 112 BPM, a beat is
 * 0.536 s; every shot is whole bars, so each cut lands on a downbeat and each
 * section of the music on its act). Fewer boss fights than the first cut, and
 * the rest of the game between them:
 *
 *   ACT 1, the call      the hero walks out of Sunford; at the smith's he buys
 *                        his gear; Tusker gores him into the rock and the
 *                        Goblin King leaps off; the Elder Treant; the caravan
 *                        on the road to Oakhaven and the bandits who come for it
 *   ACT 2, the build     the hero's book: active and passive skills tapped
 *                        into the loadout, the stat points spent, a heroic and
 *                        two legendary pieces put on
 *   ACT 3, the montage   a bar or two per place: the Ashen Crags, the Iron
 *                        Colossus, the Frost Jarl's ice spikes, the Naga
 *                        Oracle, the colosseum, the Void Warden — then a chest
 *                        that holds a legendary and a heroic piece, and a boss
 *                        that falls into its loot beams
 *   ACT 4, the climax    the Void Dragon's strafing runs, the Arch-Demon's
 *                        gate of fire and his fall, the Void Lord in the rift
 *
 * Every fight is the game's own: the place is built as the game builds it, the
 * fight is STAGED (the hero put a few metres short of the pack, health bars set
 * where the story needs them) and then played by the balance suite's reference
 * player — enemies and hero behave exactly as in a run. The book and the shop
 * are the game's own screens, tapped as a player taps them (a ring shows each
 * tap). No speech bubbles and no HUD: the recorder's clean feed hides them,
 * and is lifted only while a screen is up. The hero speaks a few of his lines
 * (`say`, his English voice files); the mix lays them over the music. The
 * frame recorder hears nothing, so this scenario LOGS every sound the game
 * asks for (`sfxLog`) on the clip's clock, and the mix step
 * (`tools/preview-video/cinematic-trailer.mjs`) voices them offline from the
 * game's own synth.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { boot, budget, cutTo, hero, logState, roll, settleOpening } from './_drive.mjs'

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

/** The loadout shot's taps: three actives, a second class's skill, two passives. */
const LOADOUT_TAPS = [
  { at: 300, sel: '.codex__path .node:not(.is-round):not(.is-locked)', n: 0 }, { at: 750, sel: '[data-drop="active:0"]' },
  { at: 1350, sel: '.codex__path .node:not(.is-round):not(.is-locked)', n: 1 }, { at: 1800, sel: '[data-drop="active:1"]' },
  { at: 2400, sel: '.codex__path .node:not(.is-round):not(.is-locked)', n: 2 }, { at: 2850, sel: '[data-drop="active:2"]' },
  { at: 3500, sel: '.codex__classes .emblem', n: 2 },
  { at: 4200, sel: '.codex__path .node:not(.is-round):not(.is-locked)', n: 0 }, { at: 4650, sel: '[data-drop="active:3"]' },
  { at: 5300, sel: '.codex__path .node.is-round:not(.is-locked)', n: 0 }, { at: 5750, sel: '[data-drop="passive:0"]' },
  { at: 6400, sel: '.codex__classes .emblem', n: 0 },
  { at: 6950, sel: '.codex__path .node.is-round:not(.is-locked)', n: 0 }, { at: 7400, sel: '[data-drop="passive:1"]' }
]

/**
 * The shot list. `beats`: the shot's length on the music's grid. `hold`: the
 * boss's fall is the shot's moment (wait for it, then a beat on the poster
 * frame). `preroll`: ms played off camera after the cut (the colosseum's
 * first waves walk in). `walk`: no fight, the hero walks this route (town
 * cells, `sim/town.ts`: the main road runs down column 19 to the gate).
 * `escort`: the place is the caravan's road in that zone's land (#85), the
 * cart pulled up beside the hero. `chest`: no fight, the hero walks to the
 * nearest chest, which holds these pieces. `ui`: no world, one of the game's
 * screens over the shot named `on` — `book` sets the hero's gold, points,
 * bag and loadout first, `taps` are clicks at `at` ms (the `n`th match of
 * `sel`). `say`: the hero's voice line `id` at `at` ms. `cues`: at `at` ms
 * into the shot, the scripted boss's health is set or a move readied
 * (`boss`), or the reference player's dodging turned down or up (`dodge`,
 * 0..1). Built LAST first, so the hero each place is built with is the hero
 * who fights in it.
 */
export const SHOTS = [
  // ── intro ──
  { id: 'sunford', node: 'sunford', hero: { level: 30, cls: 'aegis' }, walk: [[17, 11], [17, 19], [19, 22], [19, 33]], beats: 8 },
  // ── the call ──
  { id: 'shop', ui: { on: 'sunford', modal: 'shop', npc: 'sunfordSmith', book: { gold: 4000 },
    taps: [{ at: 350, sel: '.trade__shelf .ware:not(.is-owned)', n: 1 }, { at: 1250, sel: '.trade__act' }, { at: 2100, sel: '.trade__shelf .ware:not(.is-owned)', n: 2 }, { at: 3000, sel: '.trade__act' }] },
    hero: { level: 8, cls: 'aegis', bare: true }, beats: 8, say: { at: 150, id: 'dlg.hero.trade' } },
  // Tusker's first charge carries the knight into the rock (he takes it); at half the King leaps off.
  { id: 'hollows', node: 'hollows', hero: { level: 5, cls: 'aegis' }, stage: { pack: 'finale', gap: 6.5, heroHp: 0.95, bossHp: 0.6, foeHp: 0.2 }, beats: 12,
    cues: [{ at: 0, dodge: 0 }, { at: 3800, dodge: 0.7 }, { at: 4400, boss: { hp: 0.49 } }], say: { at: 500, id: 'dlg.quest.goblinKing.slay.say' } },
  { id: 'woods', node: 'woods', hero: { level: 8, cls: 'shadow' }, stage: { pack: 'finale', gap: 3.2, heroHp: 0.9, bossHp: 0.35, foeHp: 0.4 }, beats: 4 },
  // The bandits of the first ambush come out for the cart; the hero cuts them down beside it.
  { id: 'caravan', node: 'outskirts', escort: true, hero: { level: 12, cls: 'sovereign' }, stage: { pack: 0, gap: 3.0, heroHp: 0.9, foeHp: 0.35 }, beats: 8 },
  // ── the build ──
  { id: 'loadout', ui: { on: 'sunford', modal: 'skills', book: { active: ['', '', '', '', '', ''], passive: ['', '', ''] }, taps: LOADOUT_TAPS },
    hero: { level: 30, cls: 'pyro' }, beats: 16 },
  { id: 'stats', ui: { on: 'sunford', modal: 'character', book: { points: 12 },
    taps: [0, 0, 1, 0, 2, 0, 3, 1, 0, 4].map((n, i) => ({ at: 250 + i * 360, sel: '.attr__plus', n })) },
    hero: { level: 30, cls: 'aegis' }, beats: 8 },
  { id: 'equip', ui: { on: 'sunford', modal: 'inventory', book: { items: ['bladeOfTheUnbound', 'shieldOfTheFallen', 'dragonscaleHauberk'] },
    taps: [{ at: 250, sel: '.bag__grid .item-cell:not(.is-worn)', n: 0 }, { at: 900, sel: '.equip__card .bag__actions > :last-child' },
      { at: 1600, sel: '.bag__grid .item-cell:not(.is-worn)', n: 0 }, { at: 2250, sel: '.equip__card .bag__actions > :last-child' },
      { at: 2950, sel: '.bag__grid .item-cell:not(.is-worn)', n: 0 }, { at: 3600, sel: '.equip__card .bag__actions > :last-child' }] },
    hero: { level: 30, cls: 'aegis', bare: true }, beats: 8 },
  // ── the montage ──
  { id: 'crags', node: 'crags', hero: { level: 13, cls: 'pyro' }, stage: { pack: 1, gap: 3.0, heroHp: 0.9, foeHp: 0.7 }, beats: 4 },
  { id: 'mines', node: 'mines', hero: { level: 15, cls: 'aether' }, stage: { pack: 'finale', gap: 4.2, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  // Hammerfall raises the ice where the hero stood; his charge shatters on it and he reels.
  { id: 'tundra', node: 'tundra', hero: { level: 19, cls: 'geo' }, stage: { pack: 'finale', gap: 6.5, heroHp: 0.9, bossHp: 0.8, foeHp: 0.6 }, beats: 8,
    cues: [{ at: 0, boss: { ready: ['hammer'], hold: ['charge'] } }, { at: 1600, boss: { ready: ['charge'], hold: ['hammer'] } }] },
  { id: 'temple', node: 'temple', hero: { level: 20, cls: 'chrono' }, stage: { pack: 'finale', gap: 3.6, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  { id: 'arena', node: 'arena', hero: { level: 15, cls: 'sovereign' }, preroll: 4200, beats: 4 },
  { id: 'citadel', node: 'citadel', hero: { level: 23, cls: 'blood' }, stage: { pack: 'finale', gap: 3.6, heroHp: 0.9, bossHp: 0.6, foeHp: 0.6 }, beats: 4 },
  // ── the loot ──
  { id: 'chest', node: 'woods', hero: { level: 30, cls: 'shadow', bare: true }, chest: ['armorOfTheTitan', 'orbOfEternalFlame'], beats: 8 },
  { id: 'loot', node: 'tundra', hero: { level: 19, cls: 'pyro', bare: true }, stage: { pack: 'finale', gap: 3.0, heroHp: 0.9, bossHp: 0.05, foeHp: 0.05 }, beats: 4 },
  // ── the climax: a breath, then it takes to the sky; strafing runs that leave the field burning ──
  { id: 'peak', node: 'peak', hero: { level: 25, cls: 'aegis' }, stage: { pack: 'finale', gap: 6.0, heroHp: 0.85, bossHp: 0.64 }, beats: 16,
    cues: [{ at: 1200, boss: { hp: 0.59 } }], say: { at: 300, id: 'dlg.quest.dragon.slay.say' } },
  // The gate of fire closes in; the dive comes; the blade sticks and he falls.
  // The hero starts on the far side of him: what he backs off into is open
  // floor, not the tall rocks between the camera and the field's south edge.
  { id: 'fortress', node: 'fortress', hero: { level: 30, cls: 'pyro', bare: true }, stage: { pack: 'finale', gap: -5.0, heroHp: 0.85, bossHp: 0.3, foeHp: 0.2 }, beats: 24, hold: true,
    cues: [{ at: 2500, boss: { hp: 0.2 } }, { at: 6500, boss: { hp: 0.03 } }] },
  // ── the rift ──
  { id: 'rift', node: 'rift', hero: { level: 30, cls: 'shadow' }, stage: { pack: 'finale', gap: 6.5, heroHp: 1, bossHp: 1 }, beats: 8, say: { at: 700, id: 'dlg.quest.throne.claim.say' } }
]

/** The trailer's length: every shot's beats, on the grid. */
export const TRAILER_MS = Math.round(SHOTS.reduce((n, s) => n + s.beats, 0) * BEAT)

/** A town cell's centre in world metres (`sim/grid.ts`: CELL = 1.5). */
const cellAt = ([i, j]) => [(i + 0.5) * 1.5, (j + 0.5) * 1.5]

/** The clean feed on (the world alone) or lifted (a screen of the game's is the shot). */
const cleanFeed = (ctx, on) => ctx.evaluate((on) => {
  const el = document.getElementById('__preview_clean')
  if (el) el.media = on ? '' : 'not all'
}, on)

/** Put the hero on a shot's walk or at its chest, or hand him back to the reference player. */
const direct = async (ctx, s) => {
  if (s.ui) return
  if (s.walk) return ctx.evaluate((pts) => /** @type {any} */ (window).__preview.walk(pts), s.walk.map(cellAt))
  if (s.chest) {
    const ok = await ctx.evaluate((items) => /** @type {any} */ (window).__preview.chest(items), s.chest)
    if (!ok) ctx.log.warn(`${s.id}: no chest the hero may open`)
    return
  }
  await ctx.evaluate(() => { const p = /** @type {any} */ (window).__preview; p.dodge(0.7); p.bot(true) })
  if (s.escort && !(await ctx.evaluate(() => /** @type {any} */ (window).__preview.caravan()))) ctx.log.warn(`${s.id}: no caravan`)
}

/** One of the game's screens up for a shot (over the shot it is opened on). */
const openScreen = (ctx, s) => ctx.evaluate(({ ui, h }) => {
  const p = /** @type {any} */ (window).__preview
  p.hero(h)
  if (ui.book) p.book(ui.book)
  p.open(ui.modal, ui.npc)
}, { ui: s.ui, h: s.hero })

/** A player's tap: a ring where the finger lands, then the click itself. */
const tap = (ctx, { sel, n = 0 }) => ctx.evaluate(({ sel, n }) => {
  const el = /** @type {HTMLElement|undefined} */ ([...document.querySelectorAll(sel)][n])
  if (!el) return false
  if (!document.getElementById('__trailer_tap_css')) {
    const css = document.createElement('style')
    css.id = '__trailer_tap_css'
    css.textContent = '@keyframes __tap{0%{transform:translate(-50%,-50%) scale(.4);opacity:.95}100%{transform:translate(-50%,-50%) scale(1.6);opacity:0}}' +
      '.__tap{position:fixed;z-index:2147483647;width:64px;height:64px;border-radius:50%;border:4px solid #ffe9a8;box-shadow:0 0 18px #ffb84a,inset 0 0 12px #ffb84a;pointer-events:none;animation:__tap .55s ease-out forwards}'
    document.head.appendChild(css)
  }
  const r = el.getBoundingClientRect()
  const ring = document.createElement('div')
  ring.className = '__tap'
  ring.style.left = `${r.left + r.width / 2}px`
  ring.style.top = `${r.top + r.height / 2}px`
  document.body.appendChild(ring)
  setTimeout(() => ring.remove(), 700)
  const target = el.tagName === 'BUTTON' ? el : (el.querySelector('button') ?? el)
  target.click()
  return true
}, { sel, n })

/** A shot's cue, now. */
const cue = (ctx, c) => ctx.evaluate((c) => {
  const p = /** @type {any} */ (window).__preview
  if (c.dodge !== undefined) p.dodge(c.dodge)
  if (c.boss) p.boss(c.boss)
}, c)

/** Play the page clock off camera (the recorder's clock is armed in record()). */
const preroll = (ctx, ms) => ctx.evaluate(async (ms) => {
  const dt = 1000 / 30
  for (let i = 0; i < Math.max(1, Math.round(ms / dt)); i++) {
    /** @type {any} */ (window).__vclock?.step(dt)
    await Promise.resolve()
  }
}, ms)

/** Cut to a shot: its place (a screen's shot, the place behind the screen), staged. */
const cutToShot = async (ctx, s) => {
  if (s.ui) {
    await cutTo(ctx, ctx.built[s.ui.on], {})
    await openScreen(ctx, s)
    await cleanFeed(ctx, false)
  } else {
    await cleanFeed(ctx, true)
    await cutTo(ctx, ctx.built[s.id], s.stage ?? {})
  }
}

export default {
  id: 'success',
  label: 'Cinematic trailer',

  async setup(ctx) {
    await boot(ctx)
    ctx.built = {}
    for (const s of [...SHOTS].reverse()) {
      if (s.ui) continue
      await hero(ctx, s.hero)
      ctx.built[s.id] = await ctx.evaluate(({ node, escort }) => /** @type {any} */ (window).__preview.build(node, { escort }), { node: s.node, escort: !!s.escort })
      ctx.log.info(`built ${s.node}${s.escort ? ' (escort)' : ''} as shot ${ctx.built[s.id]}`)
    }
    const first = SHOTS[0]
    await hero(ctx, first.hero)
    await cutToShot(ctx, first)
    await direct(ctx, first)
    await settleOpening(ctx)
    await logState(ctx, 'opening frame')
  },

  async record(ctx) {
    const t = budget(ctx)
    /** Every sound on the clip's clock: { name, ms, pan, gain, shot }. */
    const events = []
    /** The hero's lines on the clip's clock: { id, ms, shot } (the mix lays them). */
    const voices = []
    // Written as the shots go: the recorder stops the scenario on the last frame.
    mkdirSync(dirname(SOUNDS), { recursive: true })
    const save = () => writeFileSync(SOUNDS, JSON.stringify({ fps: ctx.fps, durationMs: ctx.durationMs, events, voices }, null, 2))
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
        if (!s.ui) await hero(ctx, s.hero)
        await cutToShot(ctx, s)
        if (s.preroll) await preroll(ctx, s.preroll)
      }
      // A walk, a chest, or a fight for the reference player (the first shot's walk starts again from its first point).
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
        events.push({ name: last ? 'trailerSub' : 'trailerHit', ms: Math.round(clip0), pan: 0, gain: s.walk || s.ui ? 0.5 : 0.9, shot: s.id })
      }
      if (SHOTS[i + 1]?.id === 'peak') events.push({ name: 'trailerRiser', ms: Math.round(clip0 + s.beats * BEAT - 3100), pan: 0, gain: 0.4, shot: s.id })
      if (s.say) voices.push({ id: s.say.id, ms: Math.round(clip0 + s.say.at), shot: s.id })
      end += s.beats * BEAT
      // The shot's moments in time order: the boss's cues and a screen's taps.
      const moments = [...(s.cues ?? []).map(c => ({ at: c.at, c })), ...(s.ui?.taps ?? []).map(p => ({ at: p.at, p }))].sort((a, b) => a.at - b.at)
      for (const m of moments) {
        if (m.at > 0) await t.until(clip0 + m.at)
        if (m.c) await cue(ctx, m.c)
        else if (!(await tap(ctx, m.p))) ctx.log.warn(`${s.id}: nothing to tap at ${m.p.sel} #${m.p.n ?? 0}`)
        else if (m.p) events.push({ name: 'trailerHit', ms: Math.round(t.spent()), pan: 0, gain: 0.18, shot: s.id })
      }
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
