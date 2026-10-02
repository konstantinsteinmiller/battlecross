/**
 * ─── Driving Battlecross for a recording ─────────────────────────────────────
 *
 * Everything the scenario sheets share. A scenario is a beat sheet; this file
 * is how a beat is made to happen: boot the game on a seeded save with the
 * world frozen, give the hero a build, prebuild the places the clip is shot
 * in, arrange a fight in front of the camera, and hand the hero to the balance
 * suite's reference player (`src/game/sim/bot.ts`) — the same scripted hero
 * the balance tests play every zone with, so what is filmed is how the game
 * actually plays.
 *
 * The game's side of it is `window.__preview` (`src/game/previewFeed.ts`,
 * DEV only, installed on `?preview=1`).
 *
 * WHY STAGE AND NOT FAST-FORWARD. A zone is a walk of a minute or more to its
 * boss; a clip has ten seconds. So the hero is PUT a few metres short of the
 * pack the clip is about, health bars are set to where the story needs them
 * (invisible in a clean feed), and the take starts on the first swing. The
 * simulation is seeded (`sim/rng.ts`, never `Math.random`), so the same
 * staging plays the same fight on every take.
 *
 * THE RESULT SCREEN is held back while `?preview=1` is on (`flow.finishVisit`
 * returns early), so a clip may run through a boss's fall into the chest and
 * the coins without a window opening over it.
 */

/** A save that is past every first-time moment: nothing is taught in a clip. */
export const saveFixture = (over = {}) => {
  const tips = {}
  for (const lesson of ['move', 'target', 'skill', 'aim', 'potion']) {
    for (const family of ['touch', 'mouse']) tips[`hint:${lesson}:${family}`] = 9
  }
  return {
    bc_version: 1,
    bc_level: 5,
    bc_gold: 250,
    bc_story: 1,
    bc_quests_done: 1,
    bc_world: { cleared: ['plains', 'sunford'], flags: [], at: 'sunford', visits: {}, arenaBest: 0 },
    bc_stats: { kills: 30, deaths: 0, runs: 3, playSeconds: 300, bestLevel: 5, xpEarned: 900 },
    bc_tutorial: tips,
    // Silent at the source as well as at the browser (`--mute-audio`): no
    // audio clock runs beside the one the recorder owns.
    bc_user_sound_volume: 0,
    bc_user_music_volume: 0,
    bc_mobile_mute: true,
    bc_user_haptics: false,
    bc_user_language: 'en',
    bc_user_language_chosen: true,
    ...over
  }
}

/** Written into the page BEFORE the app's first line, so the game boots into
 *  it. `useGameState` reads `bcross_state` once, at module load. */
export const seedSaveScript = (save) => {
  try { localStorage.setItem('bcross_state', JSON.stringify(save)) } catch { /* private mode */ }
}

// ─── Boot ────────────────────────────────────────────────────────────────────

/**
 * Navigate with the save seeded, wait out every curtain, freeze the world.
 *
 * From here to the first recorded frame nothing moves unless this file moves
 * it: without the freeze the scene's own loop keeps running while `setup()`
 * talks to the page, and where the fight stands depends on how busy the
 * machine was.
 */
export const boot = async (ctx, { save } = {}) => {
  // The runner has already opened the page at the FULL recording URL — the
  // resolved port and every parameter (the config's, the format's, the clean
  // feed's, the scenario's, `--url-param`). Reuse it: rebuilding it from the
  // config silently drops them, and the clip records with the wrong feed
  // while every log line looks right.
  const current = typeof ctx.page.url === 'function' ? ctx.page.url() : ''
  if (!/^https?:/.test(current)) {
    throw new Error(`preview-video: boot() expected the runner to have opened the recording URL, but the page is at "${current}".`)
  }
  const url = current.split('#')[0]

  await ctx.page.addInitScript(seedSaveScript, save ?? saveFixture())
  // Bounce through about:blank first: the router is on HASH history in dev, so
  // a `goto` back to the same address is a same-document navigation — the
  // document is never rebuilt and the init scripts never run.
  await ctx.page.goto('about:blank')
  await ctx.page.goto(url, { waitUntil: 'domcontentloaded' })

  // The seam, then the curtains. "Hidden" is not "gone": the clean feed has
  // hidden the splash, and a hidden splash still owns the screen for its fade.
  await ctx.waitFor(() => !!(/** @type {any} */ (window).__preview), null, { timeout: 90_000 })
  await ctx.waitFor(() => {
    const stat = document.getElementById('static-splash')
    return (!stat || stat.classList.contains('hidden')) && !document.querySelector('.splash-backdrop')
  }, null, { timeout: 60_000 })
  // The display face: it only shows in a `--no-clean` take, but a take must
  // not depend on when a font arrived.
  await ctx.evaluate(() => document.fonts.ready.then(() => true))

  const info = await ctx.evaluate(() => {
    const w = /** @type {any} */ (window)
    w.__preview.hold(true)
    const c = document.querySelector('canvas.game-canvas')
    return { feed: w.__preview.feed, canvas: c ? [c.width, c.height] : null, dpr: window.devicePixelRatio }
  })
  ctx.log.info(`feed ${info.feed}, canvas ${info.canvas ? info.canvas.join('x') : 'MISSING'} at dpr ${info.dpr}`)
  if (info.canvas && ctx.variant && info.canvas[0] !== ctx.variant.width) {
    ctx.log.warn(`the canvas is ${info.canvas[0]} px wide, the clip ${ctx.variant.width}: the picture will be scaled (pin ?device=normal and record without touch emulation)`)
  }
  return url
}

// ─── Staging ─────────────────────────────────────────────────────────────────

/** The hero as a level-appropriate build of one class (nothing is saved). */
export const hero = (ctx, { level, cls, potions = 3 }) =>
  ctx.evaluate((o) => { /** @type {any} */ (window).__preview.hero(o) }, { level, cls, potions })

/**
 * Prebuild a place and return its shot index. Building is real work (the
 * terrain, the rigs, the shader warm-up), so every place a clip cuts to is
 * built in `setup()` and a cut is then one frame.
 */
export const build = async (ctx, node) => {
  const shot = await ctx.evaluate((node) => /** @type {any} */ (window).__preview.build(node), node)
  ctx.log.info(`built ${node} as shot ${shot}`)
  return shot
}

/** Hard cut to a prebuilt shot, and arrange the fight in it. */
export const cutTo = (ctx, shot, stage = {}) =>
  ctx.evaluate(({ shot, stage }) => {
    const p = /** @type {any} */ (window).__preview
    p.cut(shot)
    p.stage(stage)
  }, { shot, stage })

/** The reference player takes (or gives back) the hero. */
export const botOn = (ctx, on = true) =>
  ctx.evaluate((on) => { /** @type {any} */ (window).__preview.bot(on) }, on)

export const snapshot = (ctx) => ctx.evaluate(() => /** @type {any} */ (window).__preview.state())

/** One line of state for the log: the beat sheet is checked against these. */
export const logState = async (ctx, label) => {
  const s = await snapshot(ctx)
  const boss = s.boss ? `${s.boss.kind} ${(s.boss.hp01 * 100).toFixed(0)}%${s.boss.alive ? '' : ' DOWN'}` : 'no boss'
  ctx.log.info(`${label}: hero ${(s.hero.hp01 * 100).toFixed(0)}%${s.hero.alive ? '' : ' DOWN'}, ${boss}, ${s.foesAwake} awake, sim ${s.simTime.toFixed(1)} s${s.ended ? ', ' + s.ended : ''}`)
  return s
}

/**
 * Let the world go. Called at the top of `record()`: the take starts from the
 * same random state every time, whatever the real-time staging burned.
 */
export const roll = (ctx, { seed = 7 } = {}) =>
  ctx.evaluate((seed) => {
    const w = /** @type {any} */ (window)
    w.__vseed?.reseed(seed)
    w.__preview.bot(true)
    w.__preview.hold(false)
  }, seed)

/** Freeze at the end of `setup()` with the picture the take opens on. */
export const settleOpening = async (ctx) => {
  // A few real frames so the cut-to place has drawn (and its rigs have posed),
  // then hold: the opening frame is the last thing `setup()` leaves on screen.
  await ctx.evaluate(() => { /** @type {any} */ (window).__preview.hold(false) })
  await ctx.wait(350)
  await ctx.evaluate(() => { /** @type {any} */ (window).__preview.hold(true) })
}

/**
 * The clip's clock for `record()`, which cannot overrun the clip.
 *
 * Time is read off the frames actually captured (`ctx.frame()`), so waits
 * and state-anchored steps (`until`) share one account: a beat that took
 * longer than planned eats into the next wait instead of pushing the sheet
 * past the last frame.
 */
export const budget = (ctx) => {
  const total = Math.max(1000, Number(ctx.durationMs) || 10_000)
  const spent = () => (ctx.frame() * 1000) / ctx.fps
  return {
    async wait(ms) {
      const take = Math.min(Math.max(0, ms), total - spent())
      if (take > 0) await ctx.wait(take)
      return spent() < total
    },
    /** Wait until `at` ms into the clip (no-op if already past it). */
    until(at) { return this.wait(Math.max(0, at - spent())) },
    /**
     * Advance the clip until `fn` is true in the page, but never past `at`
     * ms. Hit-stop stretches engine time (a boss's last blow holds the world
     * for a quarter of a second), so beats are anchored on STATE and only
     * bounded by the clock. Resolves to whether the state was reached.
     */
    async untilState(at, fn, label) {
      const room = Math.min(at, total) - spent()
      if (room <= 0) return false
      return ctx.stepUntil(fn, { timeoutMs: room, label })
    },
    left: () => total - spent(),
    spent
  }
}
