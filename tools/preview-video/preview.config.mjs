/**
 * ─── Battlecross preview-video configuration ────────────────────────────────
 *
 *   pnpm preview:video                          # every format, both scenarios
 *   pnpm preview:video --formats 10s            # one deliverable
 *   pnpm preview:video --formats crazygames     # the portal cut
 *   pnpm preview:video --scenarios success      # one scenario, every format
 *   pnpm preview:video --url-param feed=pure    # nothing but the world (below)
 *   pnpm preview:video --no-clean               # with the whole HUD on
 *   pnpm preview:video --only-setup             # stop on the opening frame
 *   pnpm preview:video --help
 *
 * Output, one folder per quality — each a complete, uniformly named set:
 *
 *   preview-videos/lossless/<scenario>-<format>-<orientation>-<W>x<H>.mp4 (+ .png poster)
 *   preview-videos/high/…     the same clips as upload-ready H.264 4:2:0
 */

/**
 * ── The two cuts ──
 *
 * The HUD, the menus, the damage numbers and the control lessons are DOM, and
 * the recorder hides DOM by CSS. What it cannot reach is what the RENDERER
 * paints: health bars over heads, the ring under the hero, the ring on the
 * target. The game gates those behind `?feed=`.
 *
 * `feed=preview` (the default) KEEPS them. They are wordless, and they are how
 * a viewer reads a fight: who is being hit, how close the boss is. No portal
 * rule this game ships against forbids the game's own playfield (CrazyGames
 * bans logos, promotional text, cursors and black bars).
 *
 * `--url-param feed=pure` hides them too: the world and nothing else, for a
 * spec that says "no UI of any kind".
 */
const PURE = process.argv.join(' ').includes('feed=pure')

export default {
  // The port-ownership check: a stale dev server of another game answers a
  // fetch perfectly happily, and you end up with a recording of their game.
  title: 'Battlecross',

  // The DEV server, not a production build: `window.__preview` and the feed
  // flag are both `import.meta.env.DEV` only.
  //
  // Port 2069 is this pipeline's own — 2194 is `pnpm dev`, 5412 / 5414 are the
  // QA scripts'. The dev server never talks to the leaderboard
  // (`.env.development` blanks its URL), so a recorded win posts nothing.
  server: {
    mode: 'dev',
    port: 2069,
    command: 'pnpm',
    args: ['exec', 'vite', '--port', '{port}', '--strictPort'],
    // Its own dependency cache: sharing `node_modules/.vite` with a running
    // `pnpm dev` makes each re-optimise the other's modules mid-take.
    env: { VITE_CACHE_DIR: 'node_modules/.vite-preview' },
    // The recording page never hears hot reload: a save in the editor in the
    // middle of a 900-frame capture would navigate the page out from under it.
    hotReload: false
  },

  // ── The deliverables ──
  //
  // Sizes are output PIXELS; the game sees width/dpr × height/dpr CSS px.
  //
  // THE DPR CAP: the renderer clamps its pixel ratio (`dprCap()` in
  // `src/game/engine/renderer.ts`): 2 on a fine pointer, 1.6 on a coarse one,
  // 1 on a weak device. So every orientation records at dpr 2 with touch
  // emulation OFF, portrait ones included — the scene composes by aspect
  // alone, the HUD is hidden, and a "phone" context would hand back a 1.6×
  // canvas scaled up to the clip. `device=normal` (below) pins the rest.
  formats: {
    '10s': {
      durationMs: 10_000,
      orientations: {
        portrait: { width: 720, height: 1280, dpr: 2, isMobile: false, hasTouch: false },
        landscape: { width: 1280, height: 720, dpr: 2, isMobile: false, hasTouch: false }
      }
    },

    // MP4 · H.264 · 30 s · 1920x1080 + 1080x1920. A different STORY, not a
    // longer one: three places, cut.
    '30s': {
      durationMs: 30_000,
      orientations: {
        portrait: { width: 1080, height: 1920, dpr: 2, isMobile: false, hasTouch: false },
        landscape: { width: 1920, height: 1080, dpr: 2, isMobile: false, hasTouch: false }
      },
      scenarios: { success: 'success-30s', fail: 'fail-30s' }
    },

    // CrazyGames: "15-20 seconds maximum", 1080p landscape 16:9 AND portrait
    // 2:3 — 1080x1620, NOT 9:16 — 50 MB cap, no sound. `high` only: a lossless
    // 16 s 1080p master is far past the cap and is not what gets uploaded.
    // docs.crazygames.com/requirements/game-covers/
    crazygames: {
      durationMs: 16_000,
      // `high` is the upload; `balanced` rides along because a second encoder
      // on the same captured frames is nearly free and halves the file if a
      // bitrate cap ever turns up.
      quality: ['high', 'balanced'],
      orientations: {
        landscape: { width: 1920, height: 1080, dpr: 2, isMobile: false, hasTouch: false },
        portrait: { width: 1080, height: 1620, dpr: 2, isMobile: false, hasTouch: false }
      }
    },

    // Poki's animated thumbnail: 1:1, "4 to 6 seconds", "50fps or higher",
    // muted, 100 MB. Keep the action centred — the camera follows the hero, so
    // it is. developers.poki.com/guide/your-game-page
    poki: {
      durationMs: 5_000,
      fps: 60,
      quality: ['high', 'balanced'],
      orientations: {
        square: { width: 1080, height: 1080, dpr: 2, isMobile: false, hasTouch: false }
      }
    }
  },

  scenarios: ['success', 'fail'],

  fps: 30,
  // Two files from ONE capture. `lossless` (qp 0, yuv444p) is the archive —
  // Safari and QuickTime refuse 4:4:4 and every portal validator is stricter
  // still; `high` (crf 14, yuv420p) is the upload.
  quality: ['lossless', 'high'],
  outDir: 'preview-videos',
  capture: 'virtual',

  // The clock pins WHEN each frame is sampled; this pins WHAT is drawn in it.
  // The simulation has its own seeded generator, but the view pulls
  // `Math.random` for particles, camera shake and the scatter of damage
  // numbers. `_drive.mjs` re-seeds from this value at the top of every take,
  // after the real-time staging has burned an unknowable number of draws.
  seedRandom: 7,

  clean: {
    enabled: true,
    // The scene's canvas by name, plus the three full-screen moments that are
    // FEEL, not interface: the white flash of a win, the red edge of a hit,
    // the low-health pulse.
    keep: ['canvas.game-canvas', '.float-layer__flash', '.float-layer__hurt', '.float-layer__low'],
    // Nothing in this game draws text on a canvas; left on as a belt.
    suppressCanvasText: true,
    urlParams: { feed: PURE ? 'pure' : 'preview' }
  },

  urlParams: {
    // The scripting handle (`window.__preview`), on EVERY recording URL — a
    // `--no-clean` take is driven the same way a clean one is. It also holds
    // the result screen back, so a clip can run past a boss's fall.
    preview: '1',
    // Pin the device class and the scenery. A recorder that spends 200 ms of
    // wall time on a frame looks exactly like a weak phone to the game, and a
    // software-rendered Chrome is classed as one outright: without the pins a
    // take renders at 1× with half the props.
    device: 'normal',
    scenery: 'full'
  },

  async onPageReady() { /* the scenarios boot the game themselves — see _drive.mjs */ }
}
