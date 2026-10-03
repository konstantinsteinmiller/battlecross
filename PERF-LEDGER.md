# Performance ledger

One entry per experiment: what was tried, how it was measured, what it cost or
bought, and whether it stayed. Null results are recorded too, so an idea is not
re-tried every time somebody has it.

## How to measure

- Probe: `?perfprobe=1` publishes `window.__perf` / `window.__perfProbe`
  (`src/use/usePerfProbe.ts`): p50 / p95 / p99 of the work inside one frame
  callback, the RAF interval, long tasks, the heap slope.
- Scene: a staged fight that lasts the whole window. `?preview=1` gives
  `window.__preview`: `hero({ level: 19, cls: 'aegis' })`, `build('tundra')`,
  `cut(shot)`, `stage({ pack: 'finale', gap: 3.5 })`, then every unit's health is
  multiplied so nobody dies, `bot(true)`, `hold(false)`. Six seconds of warm-up,
  `__perfProbe.reset()`, 24 seconds of recording.
- Profile: phone portrait 390 × 780, touch, CPU throttled 4× over CDP
  (`Emulation.setCPUThrottlingRate`), `?scenery=low` and `?scenery=full`.
- Caveat for this machine: headless Chrome draws through SwiftShader (software
  GL), so the frame's cost is dominated by rasterising in the GPU process and
  swings with whatever else the machine is doing. Use it to catch a regression
  of tens of percent, not of a few. For the script's own share, take a CPU
  profile (`Profiler.start` over CDP) and read self time by file.

## 2026-10-03: combat look (rigs, choreography, trails, impacts, previews, bars)

Roadmap #38, #39, #40, #43, #44. What changed on the frame:

| | Before | After |
| --- | --- | --- |
| Bones in a humanoid rig | 10 | 26–33 (elbows, knees, neck, feet, weapon, face, hair) |
| Triangles, hero | ~2.3 k (estimate) | 2.6–3.2 k (tested ≤ 3.2 k); 1.7–2.2 k on a weak device |
| Triangles, standard human enemy | ~2.3 k (estimate) | 1.5–2.2 k (tested ≤ 2.2 k); 1.3–1.8 k on a weak device |
| Draws per character | 3 | 3 |
| Swing trails | none | 1 draw for all (22 trails, 10 on a weak device) |
| Shaped sprites (sparks, cut marks) | none | 1 instanced draw (380, 180 on a weak device) |
| Ground previews | 2 draws each | 1 instanced draw for all |
| Health bars | 1 instanced draw | 1 instanced draw (frames drawn in the fragment shader) |
| Rings, aim preview | 10 meshes | 8 meshes, one shader |

Frame work, phone profile, 4× CPU throttle, the Frost Jarl's court (boss, 4–8
foes, the hero fighting on the reference player):

| Run | Scenery | Frames in 24 s | Work p50 | Work p95 | Interval p50 |
| --- | --- | --- | --- | --- | --- |
| before | low | 138 | 45.8 ms | 90.1 ms | 83.4 ms |
| before | full | 133 | 45.9 ms | 74.4 ms | 83.4 ms |
| after (machine busy: four other jobs) | low | 103 | 49.9 ms | 83.0 ms | 100.1 ms |
| after (machine busy) | full | 120 | 46.4 ms | 79.9 ms | 100.0 ms |
| after (machine quiet) | low | 154 | 37.6 ms | 70.1 ms | 83.3 ms |
| after (machine quiet) | full | 144 | 41.4 ms | 70.5 ms | 83.4 ms |

Read: no regression that this rig can see; the spread between two "after" runs
(busy and quiet machine) is larger than the spread between before and after.

CPU profile of the same fight (12 s, no throttle, main thread): 80 % idle;
`three` 3.7 %; `gfx/rigs/anim.ts` 0.2 %; `gfx/vfx.ts` 0.1 %; `gfx/trails.ts`
< 0.05 %; `modes/zoneMode.ts` 0.3 %. The new layers are not where a frame goes.

Kept. Things done so that it stays cheap:

- The pose is a flat array of ~48 numbers per humanoid; a frame samples one
  clip, blends once and writes the bones. No per-frame allocation in `animate`,
  `trackUnit`, the trails, the sprites, the previews or the bars.
- Trails, sprites, previews and bars upload only the part of their buffers in
  use (`addUpdateRange`), and are skipped entirely when empty.
- At most 6 full impacts a frame (3 on a weak device); the rest are a flash.
- Fixed pools everywhere a fight can spam: a swing past the trail cap takes
  over the oldest trail, a sprite past the cap recycles a slot. Previews and
  bars are the two that must never be dropped, so those two GROW.
- The new programs (trails, sprites, previews, marks) are left visible and
  empty until their first update, so the zone's warm-up render compiles them
  instead of the first blow of a fight.

Not measured: a real phone's GPU. The preview and bar shaders do more per pixel
than the flat fills they replace (a boss's 8 m slam covers most of a phone's
screen for a second). If a device shows it, the first thing to cut is the
chevron and hatch terms in `gfx/telegraphs.ts`, behind `sceneQuality() === 'low'`.

## 2026-10-03: elevation (roadmap #57)

What changed on the frame: the ground mesh has real heights and normals (same
vertex count); ledges add a few instanced draws (brow stones, steps, kerbs) on
zones that have one; ground marks (hero / target rings, aim previews) and the
attack previews are fine grids (16 × 16) whose vertices read the height field
from a float texture in the vertex shader (`gfx/ground.ts`); everything else
that stands on the ground calls `groundAt(x, z)`, four array reads.

Method: the Frost Jarl's court as above, phone 390 × 780, 4× CPU throttle,
`?scenery=low`. A/B arm: `?relief=0` (DEV only) lays the place flat with
everything else identical. Arms interleaved, two runs each.

| Run | Frames in 24 s | Work p50 | Work p95 | Interval p50 |
| --- | --- | --- | --- | --- |
| before (morning, old build, machine busy) | 132 | 42.8 ms | 81.1 ms | 83.4 ms |
| flat, run 1 | 37 | 72.1 ms | 133.5 ms | 150.0 ms |
| relief, run 1 | 15 | 60.9 ms | 114.3 ms | 133.4 ms |
| flat, run 2 | 31 | 67.9 ms | 106.6 ms | 133.3 ms |
| relief, run 2 | 48 | 62.4 ms | 98.3 ms | 116.7 ms |

Read: relief and flat are inside each other's noise. The whole build is
slower than in the morning in BOTH arms; that drop is not the relief (the flat
arm has it too) and arrived with other work in the tree since (characters
with more gear slots, the town rebuild); it needs its own look.

Deterministic counts, one frame of the same fight (no throttle):

| | Draw calls | Triangles | CPU per `render()` |
| --- | --- | --- | --- |
| flat, low | 77 | 129 150 | 1.93 ms |
| relief, low | 77 | 129 150 | 1.43 ms |
| flat, full | 84 | 171 302 | 1.91 ms |
| relief, full | 86 | 173 462 | 2.08 ms |

CPU profile (12 s, no throttle): 83 % idle; no file of the levels work above
0.1 % self time. Hiding every ground-reading material (the marks and the
previews) changed frames in 5 s from 24 to 25: the vertex texture reads are
not where a frame goes.

Kept. Not measured: a real phone GPU's cost of the vertex texture fetch (four
per vertex on ~2.6 k mark / preview vertices). If a device shows it, the
first cut is the tessellation (`TESS` in `telegraphs.ts`, the marks' 16 × 16
plane) behind `sceneQuality() === 'low'`.


## 2026-10-03: towns (houses, props, interiors, town life)

Roadmap #41, #42. What a town costs now (`gfx/townView.ts`, `houses.ts`,
`townProps.ts`; the sim's `townLife.ts`):

| | Before | After |
| --- | --- | --- |
| Town geometry (houses, props, fences, cobbles), whole town | ~1 k tris (pillow houses) | 49–56 k tris lit at full, 40–45 k on a weak device (+ 7–11 k in outline hulls) |
| Draws, whole town | 3 | merged per 20 m quarter (lit + hull + glow), + 3 per room's cut, + 1 per room, + 2 per dummy / animal, + 1 cobbles, + 1 smoke, + 1 bubbles |
| Drawn per frame, phone portrait | — | +28–35 draws, +53–73 k tris (in-session A/B, town view shown vs hidden) |
| People in Sunford | 7 statues | 7 cast + 7 folk (3 on a weak device), all walking a routine |

Frame work, phone 390 × 780, touch, 4× CPU throttle, Sunford (no fight):

| Run | Scenery | Frames in 24 s | Work p50 | Work p95 | Interval p50 |
| --- | --- | --- | --- | --- | --- |
| before | low | 380 | 26.1 ms | 47.7 ms | 50 ms |
| before | full | 364 | 28.3 ms | 46.1 ms | 50 ms |
| after (machine busy: 10–13 of 20 budget workers in use) | low | 215 | 42.4 ms | 65.8 ms | 66.7 ms |
| after (machine busy) | full | 145 | 55.2 ms | 87.7 ms | 83.4 ms |

In-session A/B on the same page (town view shown vs hidden, same units, low,
three rounds of 12 s): p50 35.0 / 36.6 / 58.2 ms shown, 34.3 / 47.4 / 54.4 ms
hidden; the spread between rounds is larger than between arms.

CPU profile (Sunford, 10 s, no throttle): 76 % idle; `gfx/townView.ts` 0.1 %,
`sim/townLife.ts` 0.1 %, `rigs/townClips.ts` < 0.05 %. What the town adds is
raster (SwiftShader draws in software): more triangles and more people.

Kept. Done so that it stays cheap: one merged mesh per quarter of the town;
small details carry no outline hull; faces flush against a wall are never
built; a room's furniture is drawn only while it can be seen (the cut open,
or the hero at its door); smoke is alpha puffs from one instanced draw (none
on a weak device), bubbles one instanced draw; a weak device keeps only the
`lite` folk, paves the square only, and drops pickets, braces, jetty joists,
vegetables and half the shingle rows. Not measured on a real phone GPU.

## 2026-10-03: the playtest pass, measured and bisected (perf gate)

Several workers saw the phone profile slow down during the day and none could
place it. This entry finds where it went, fixes what it found, and names the
rest.

### Method

- Same rig as above: headless Chrome (SwiftShader), phone portrait 390 × 780,
  touch, 4× CPU throttle, `?scenery=low` and `full`. Own dev servers, one per
  checkpoint (a `git worktree` each, no HMR, no file watcher, own dep cache).
- Scenes: (a) the Frost Jarl's court (the staged fight above), (b) Sunford's
  square with its folk, (c) a plains fight by the river and a ledge (pack 1),
  (d) the world map open, (e) the hero's book on the bag page.
- Deterministic counts first, of one frame of the live mode: draw calls,
  triangles, program switches, texture binds and uploads, buffer bytes (every
  GL call wrapped in the page), and overdraw: every material keeps its vertex
  stage, depth and order but writes 1/255 additively; the frame is read back,
  so "layers" = fragments passing the depth test per screen pixel (also per
  object). Then the unthrottled cost of one `render()` and of the raster it
  queues (a 1-pixel read waits for it).
- Frozen-frame A/B for every render change (`scripts/perf-still.mjs`): both
  builds build the same place, hold the world, pin `Math.random`, put the
  camera on the same spots (start, every pack, six townsfolk) and compare
  calls, triangles and pixels. A change that draws less and changes no pixel
  is proven by that alone.
- Time: the probe (`?perfprobe=1`), 6 s warm-up, 24 s recorded, three arms
  interleaved (A B C, C B A, A B C), three rounds, GL counting off; CPU
  profiles and timeline traces at 4× (self time by function, main-thread time
  per game frame by kind) to attribute it.

### Bisect: what each checkpoint cost (one live frame, `low`)

| Checkpoint | Court calls / tris | Plains calls / tris | Sunford calls / tris | What it brought to the frame |
| --- | --- | --- | --- | --- |
| `779df68` (morning) | 82 / 134 k | 78 / 134 k | 51 / 75 k | the far land sheet (D36) is already here |
| `f213166` interface | 88 / 135 k | 76 / 133 k | 51 / 75 k | — |
| `6ee554e` levels | 85 / 129 k | 73 / 130 k | 51 / 75 k | water, bridges, caves (one zone-wide mesh each) |
| `d7d1c0f` dialogue | 83 / 129 k | 80 / 137 k | 50 / 65 k | pins, bubbles (DOM) |
| `f8e971e` combat look | 80 / 129 k | 80 / 137 k | 50 / 65 k | rigs, trails, bars: no visible change in counts |
| `66f8b9d` elevation (+ the town kit) | 84 / 130 k | 85 / 153 k | 55 / 91 k | ledges; the building kit landed in this checkpoint |
| `f5a1fa3` relief | 89 / 139 k | 90 / 157 k | 61 / 90 k | relief tells (crest stones, hollow tufts) |
| `c441c7b` towns (+ onboarding) | 93 / 139 k | 93 / 157 k | 60 / 88 k | town life; `LessonLayer`, the coach's new ticker |
| `4d7c975` HEAD | 89 / 137 k | 89 / 155 k | 70 / 89 k | taprooms, overheard talk |

The GPU side of a fight barely moved all day (court +9 % calls, +2 %
triangles); the plains and the town grew (+14 % / +16 % and +37 % / +19 %).
Most of the time went elsewhere. CPU profiles at 4×, morning vs HEAD, court:

| Main-thread cost found (4× CPU) | Introduced | Cost |
| --- | --- | --- |
| `CoachLayer` HUD ticker reads `innerWidth` every frame even with nothing to show: a forced style + layout | `c441c7b` / `e1804ed` | 30 ms per s |
| `getAnimations()` once per damage number (`FloatLayer`) and bar blink (`FBar`): a forced style recalc each | before the morning | 28 ms per s |
| `LessonLayer` idle: six breathing rings, a glow and an SVG tapping finger animate forever at opacity 0 | `c441c7b` | Sunford 21.5 → 27.3 game frames/s with it hidden |
| The scene-graph walk: ~400 static scenery tiles recomposed every frame, plus the bones of off-screen rigs | grew with every content wave | 31 ms per s (`updateMatrixWorld` self) |
| three re-derives a program each time the draw order alternates between an instanced and a plain mesh of one shared material | before the morning; more tiles, more often | ~15 ms per s (`getParameters`, `getProgram`) |

And the raster (deterministic): 2.55 layers of fragments for one layer of
picture. The far land sheet (renderOrder −3, drawn first) lay a hand's breadth
under the detailed ground and was shaded under every pixel of it: one full
screen of fragments, present since the morning.

### Fixes kept

Each proven by its own measurement. Frozen frames pixel-identical (0 px
differ) in tundra, plains, crags and Sunford, phone `low` and `full`, desktop
1100 × 650.

| Fix | Proof |
| --- | --- |
| The far land sheet leaves out its quads under the detailed ground, keeping a cell's margin round the edge (`gfx/terrain.ts`) | overdraw 2.55 → 1.56 layers; raster 38.0 → 31.6 ms (court low, unthrottled). In-session: hiding the sheet saved 8 of 47 ms, drawing it after the ground only 2 (SwiftShader barely early-z's) |
| Rigs culled by the camera frustum (a sphere round each unit with room for a weapon, a cape, a knock-up), not only by the reach circle, and not posed when out (`modes/zoneMode.ts`) | frozen frames: −3 to −18 calls, −5 to −18 k tris (Sunford −18 calls) |
| The still world culled by its world BOX instead of three's sphere (a flat 15 m tile's sphere reaches 10 m up and down): scenery tiles; the ground in 30 m and the land sheet in 60 m tiles (shared vertices, own index: no seams); level props and water in 30 m tiles; the town's quarters, its fences and cobbles (`gfx/cull.ts` new, `terrain.ts`, `levelProps.ts`, `townView.ts`) | in-session box vs sphere, court: −12 calls, −21 k tris, frame 38.1 → 34.2 ms. Frozen frames with the two above: court spots 64–90 → 50–78 calls, 117–141 k → 72–107 k tris; Sunford 61–91 → 39–74 calls, 90–103 k → 38–72 k tris |
| Still meshes and hidden rigs skip the per-frame matrix walk (`matrixAutoUpdate` / `matrixWorldAutoUpdate` off) | `updateMatrixWorld` self 30.7 → 16.6 ms per s (4× profile, court) |
| Instanced scenery and props get material objects of their own (`celVCInst`, `glowVCInst`, `outlineMat(…, true)`): the same shader and program, no re-derivation when the draw order alternates (`gfx/cel.ts`) | `getParameters` 10.6 → < 5 ms per s; pixels identical |
| `CoachLayer` ticker returns when no hint is up (one line, `components/hud/CoachLayer.vue`) | its 30 ms per s of self time gone from the profile |
| Damage numbers, screen pulses and bar blinks cancel their own last animation instead of asking `getAnimations()` (`FloatLayer.vue`, `FBar.vue`) | `getAnimations` 28 ms per s → gone |
| `LessonLayer` with nothing to show: `visibility: hidden` once its fades are done, every loop paused; a done-tick still pops (`components/onboarding/LessonLayer.vue`) | Sunford trace: 21.5 → 24.5 game frames/s at 4×; style + layerize + pre-paint 11.2 → 9.3 ms per frame |

Per frame after all of it (one live frame, same scenes, before → after):

| Scene | Calls | Triangles | Overdraw (layers) | Raster wait, unthrottled |
| --- | --- | --- | --- | --- |
| court low | 91 → 76 | 139 k → 89 k | 2.55 → 1.53 | 40.7 → 29.1 ms |
| court full | 102 → 81 | 189 k → 112 k | 2.54 → 1.50 | 48.8 → 32.4 ms |
| plains low | 88 → 59 | 157 k → 91 k | 2.54 → 1.58 | 43.2 → 26.1 ms |
| plains full | 106 → 67 | 221 k → 119 k | 2.54 → 1.58 | 55.2 → 32.9 ms |
| Sunford low | 70 → 43 | 91 k → 45 k | 2.62 → 1.76 | 37.1 → 21.4 ms |
| Sunford full | 91 → 56 | 139 k → 72 k | 2.95 → 2.06 | 43.5 → 29.2 ms |

Texture uploads per frame (the bone textures of the rigs drawn): 18 → 14 in
the court, 16 → 6 in Sunford.

### Frame work, phone 4×, three rounds interleaved (median of the rounds' p50)

| Scene | HEAD before | After | Morning (`779df68`) |
| --- | --- | --- | --- |
| court low | 58.0 ms (p95 110) | **42.3 ms** (p95 70) | 50.8 ms (p95 101) |
| court full | 57.9 ms (p95 110) | **43.0 ms** (p95 73) | 44.4 ms (p95 81) |
| plains low | 43.4 ms (p95 79) | **26.1 ms** (p95 43) | 32.7 ms (p95 55) |
| Sunford low | 35.7 ms (p95 53) | **19.7 ms** (p95 28) | 23.6 ms (p95 37) |
| Sunford full | 42.1 ms (p95 64) | **24.9 ms** (p95 36) | 23.6 ms (p95 35) |

The court on `low` is below the morning's 46 ms; in every round of every scene
the fixed build was ahead of HEAD. Draws in a fight on `low`: 59–76.

### Not fixed here (other owners' files), measured

Frames per second in the town still trail the morning (recorded frames,
Sunford low: 516 vs 616) though the game loop's own work is lower: the rest
is DOM.

- `dialog/NpcPins.vue`: the pins' infinite bob and "new" animations cost
  ~4–5 game frames/s in Sunford at 4× (24.2 → 27.8 with them stopped, 29.0
  with the pins hidden): every frame re-layerizes the page
  (`PaintArtifactCompositor::Update` 4.3 → 2.6 ms per frame). To try: bob the
  pin in its own transform from the ticker (written every frame anyway), or
  step it on threes like the map's parts.
- `onboarding/LessonLayer.vue` while a lesson IS up: the tapping finger is an
  SVG animated inside an element with `filter: drop-shadow`, so the filter
  repaints every frame. Over the world map (84 composited layers) that is
  ~440 ms per second of layerization at 4×; the map alone (lesson hidden)
  leaves the main thread 25 % idle. To try: the shadow drawn inside the SVG,
  or the hand animated as one transform.
- The map and the book themselves are fine: both are unmounted when not shown
  (`v-if`); the map's moving parts already step on threes and are composited;
  the book's 3D doll is off on `low` and costs ~5.5 ms per 30-fps doll frame
  at 4× on `full`, the page holding 60 fps.

### Tried, not kept

- Drawing the land sheet after the ground (early-z): 46.9 → 45.0 ms, inside
  the noise; the cut above replaced it.
- 15 m tiles for the ground, the sheet and the props: more draws (tundra
  spot 0: 64 → 91), measured while each tile's box was still the whole
  sheet's (three's `computeBoundingBox` ignores the index; fixed in
  `gfx/cull.ts`); not re-measured at 15 m after the fix. 30 / 60 m kept for
  fewer draws.
- Splitting every town quarter into tiles: a house across a seam became two
  draws; only the town-wide kits (fences, cobbles) are split.

### What only a real phone GPU can tell

SwiftShader rasterises in software, so its frame is roughly proportional to
triangles and fragments; a phone's tiler is far cheaper per vertex and pays
for fragments and bandwidth instead. The overdraw cut (one screen of the
ground's fragments) should carry over; the triangle cuts matter less there;
the draw-call and main-thread cuts (CPU) everywhere. Not measured: the ground
shader's derivative terms (`fwidth`, contours) per fragment, the outline
hulls, DOM layer costs under GPU raster, and a thermal run.

## 2026-10-03: the boot after the playtest pass (loader first, again)

The production boot had grown: `boot:adopted` 3.1 → 4.9 s and a 1.7 s task at
4× CPU on the coordinator's run; boot chunk 869 → 1 252 kB, scene chunk 196 →
356 kB.

### Method

Production builds (obfuscated, as shipped) of the morning (`779df68`, a
worktree), HEAD and the fix, each served by its own `vite preview`; headless
Chrome, phone portrait, 4× CPU; boot marks, every long task, console errors and
external requests; the three builds interleaved, three runs each. To say what
fills a task: a timeline trace with the V8 sampler of an unminified,
unobfuscated twin build, samples cut by task. This session's machine was
slower than the coordinator's (the morning build adopts at 3.8–4.6 s here, not
3.1 s), so compare within the table.

### What filled the boot (HEAD, 4× CPU)

| Task | Cause |
| --- | --- |
| ~1.0 s inside the build | the warm-up: the whole place drawn in ONE render (every buffer uploaded, every program's uniforms read back) |
| ~1.5 s right after `built` | the warm-up's tail, the music switching songs (a second song, a second convolution reverb) and the HUD mounting, chained through promise continuations into one task |
| ~0.7 s on the first live frame | programs compiled on that frame: the zone's haze was only set at the first resize (every program rebuilt with fog), and the precompile kept ONE representative per material type, so every custom shader after the first (rings, bars, previews, water) waited for its first frame |
| ~0.5 s during the loader | the scene's mount started the DEFAULT music track; the boot then switched to the place's track |
| ~0.2 s | the level props built in one piece; the hero's rig built in the same slice as the enemies' list |

### Fixes kept

| Fix | Effect |
| --- | --- |
| The haze is set when the terrain is built; a resize updates it in place (`zoneMode.ts`, `terrain.ts`) | no recompile of every program on the first frame |
| The precompile tells custom shaders apart (`boot.ts`, minimal edit) | measured in the dev build: programs created after the warm-up 1 → 0 |
| The warm-up draws a few meshes per render, sliced, into ONE pixel (scissor + viewport); then compiles the see-through variant of every fading material (kept as copies for the visit, so three does not free the opaque program); then reads every program's uniforms, one a slice | the 1.0 s task gone; no first-frame compile |
| The level props build in slices (`LevelProps.build` is async); the hero's rig is a prewarm job of its own | no build task over ~0.4 s |
| Yields at the end of the warm-up and after `built`; the first number formatter built during the loader (`boot.ts`) | the HUD mount is its own task (~0.4 s), not chained to the music and the warm-up |
| The music starts after the first frame, in the place's own track, AudioContext and song in two tasks (`GameScene.vue`, minimal edit) | one song set up instead of two; it was the loader's longest task. On a phone the context waits for the first tap anyway |
| Lazy chunks, fetched in the background after the first frame: the town's view (`gfx/townLoader.ts`), the world map, the hero's book (with its doll), the trade, trainer and healer screens (`components/screens/chunks.ts`, `GameModals.vue`); obfuscator excludes for the three loader modules (`vite.config.ts`) | boot chunk 1 254 → 1 177 kB, scene chunk 356 → 190 kB (morning 196); new chunks townView 84, WorldMap 66, HeroBook 32, trade screens 23 kB |

Boot, 4× CPU, phone, medians of three interleaved runs:

| Build | Loader | `boot:adopted` | Longest task | Errors / external requests |
| --- | --- | --- | --- | --- |
| morning (`779df68`) | 726 ms | 4 619 ms | 1 230 ms | 0 / none |
| HEAD before | 805 ms | 5 491 ms | 1 573 ms (+ a 0.7 s first frame) | 0 / none |
| after | 736 ms | 5 075 ms | 425 ms | 0 / none |

The lazy chunks load in the obfuscated build (200, no console error); e2e 94 / 94.

### Not reached, and why

- `boot:adopted` is 0.4 s behind the morning on this machine (≈ 3.4 s on the
  coordinator's): the build itself has more to do. The hero's rig alone
  (26–33 bones, gear parts) is a ~0.3 s job at 4× CPU, the relief and the
  level features add to the plan, and slicing costs its yields. Next: build
  rig templates in slices (`RigBuilder.build` merges every part in one go).
- The boot chunk is 1 177 kB, not ~900: three.js is ~650 kB of it, and the
  growth is game code the first fight needs (rigs and clips, level props,
  relief, zone features). What could still leave needs edits in the sim and
  the flow: the town's simulation (`sim/town.ts`, `sim/townLife.ts`, ~35 kB
  minified, imported by `zoneGen`, `director` and `step`) and the dialogue
  (`data/dialogs`, `dialog/*`, `talk.ts`, ~25 kB, imported by `flow.ts`).
- The music's first song still costs ~0.35 s at 4× on its own task (a
  convolution reverb's impulse computed and handed to a `ConvolverNode`, the
  piano's wave tables): `audio/voices.ts` could build those in slices ahead
  of time.

## 2026-10-03: interiors and the towns' small stories (roadmap #62)

Every room now tells what it is (`gfx/interiors.ts` new, `houses.ts`,
`townProps.ts`, `townView.ts`, `sim/town.ts`): a furniture kit (bevelled
boxes, turned legs, drawers with knobs, cloth folded in its vertex colours),
a story per room (a family's home, the taproom, the healer's, a shop, a school
for each class, the fallen town's broken versions), one or two family homes
per town walked into, and street scenes (wash day, a broken cart, chalk on the
square, spilled apples, a cat asleep in a window or on a step).

How it stays cheap:

| Choice | Effect |
| --- | --- |
| Each room in two merged kits: its furniture (lit + outline + glow, as before) and its CLUTTER (lit + glow, no outline) | the clutter is drawn only while the front is lifted; never built on `low` |
| A room behind a closed front is drawn only from its doorstep (4 m across, 1 m in to 5 m out; was 7 × 9 m round the door) | fewer rooms drawn while walking the streets (the family homes added rooms) |
| Family homes: the first two ambient homes of the deep rows (4 × 4 cells) | each one's front and roof are their own 3 draws (they fade); no more than two a town |
| Street scenes are props in the town's quarter kits, the cat in the house's own kit | no new draws |

Method: frozen frames (`scripts/perf-still.mjs`), the shipping tree before
the change (`git archive HEAD`, own `vite` on 5409) against the change (5408),
the same seven camera spots per town (the start, the packs, six townsfolk),
phone portrait 390 × 780.

| Scene | Draw calls before → after (7 spots) | Triangles before → after |
| --- | --- | --- |
| Sunford low | start 40 → 38; 37–74 → 38–76 | start 45.7 k → 45.7 k; 37.8–72.3 k → 33.8–73.1 k |
| Sunford full | start 53 → 57; 50–108 → 50–112 | 57.5–110.1 k → 53.3–115.4 k |
| Oakhaven low | start 44 → 44; 44–66 → 44–69 | 47.1–70.7 k → 45.6–73.4 k |
| Oakhaven full | 57–74 → 57–80 | 71.0–101.3 k → 69.6–104.0 k |
| Ironhold low | start 37 → 37; 37–52 → 37–60 | 44.0–59.7 k → 44.0–60.5 k |
| Ironhold full | 47–59 → 47–67 | 60.6–87.7 k → 60.7–88.3 k |

The largest rises are where the hero stands in a room with its front lifted
(Ironhold spot 5: +8 calls, +5 k triangles: the room and its clutter) and where
two family homes are in view (Oakhaven spots 1 and 4: +6, their fronts). On
`low` Sunford stays at the perf pass's ~43 at the start (38).

A room's size, for the record (`tests/game/interiors.test.ts` keeps it under
budget): furniture < 16 k triangles, clutter < 9 k.

Frame time: NOT measured. The probe runs (`?perfprobe=1`, 4× CPU, phone,
6 s + 24 s, both builds interleaved, three rounds) ran at 3–4 game frames a
second on a machine at 66–80 % load from other sessions (34–40 Chrome
processes), two of six recorded no frames; the numbers (63–81 ms p50 for both
builds alike) say nothing. To redo on a quiet machine: the same three rounds,
Sunford `low` and `full`, the start spot and a spot in the taproom.

Not done: a camp by a road in the zones (scenery props there are scattered by
the hundred: a camp would need a placement of its own); the smith's cot and
apron are in his forge but barely read through the dark mouth from the street.

## 2026-10-03: rooms arranged by a layout (roadmap #68), stalls turned to their customers (#67)

The rooms' furniture is now placed by a small layout (`gfx/roomLayout.ts`):
against walls and in corners, clear of doorways, windows (above the sill), the
people's places and the stair's foot, with the way from the door to each kept
open. Same kits as before (furniture merged per room, clutter merged and drawn
only while the front is lifted), so the frame is unchanged:

| Scene (`low`, frozen frames, HEAD → this) | Draw calls | Triangles |
| --- | --- | --- |
| Sunford, 7 spots | 38–76 → 38–76 (every spot equal) | 33.8–73.1 k → 34.0–73.1 k |
| Oakhaven, 7 spots | 44–69 → 44–69 (every spot equal) | 45.6–73.4 k → 45.6–72.6 k |

The layout runs when a town is built (a 10 cm walking grid per room, cached
between pieces): `tests/game/roomLayout.test.ts` arranges every room of the
three towns twice over in ~0.5 s.
