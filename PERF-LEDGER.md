# Perf ledger

Every performance change is measured before it is kept. A change that cannot
show a win on the numbers below is reverted, however plausible it sounded.

## Procedure

1. Build the bundle you ship: `npx vite build --outDir <dir>` (or a platform
   mode). Never measure the dev server.
2. Run `node scripts/perf-mission.mjs --dist <dir> --throttle 4 --seconds 20`.
   It plays the first mission with an in-page driver (walk, turn, fire), under
   CDP CPU throttling, and reads the in-page probe (`?perfprobe=1`,
   `src/use/usePerfProbe.ts`). The game loop feeds it: `frameStart`/`frameEnd`,
   plus a `step` (simulation) and a `draw` phase (`src/game/engine/app.ts`).
3. For a candidate change, add a `?perf=<flag>` baseline arm
   (`src/use/perfVariants.ts`) that switches the change OFF, and run the arms
   INTERLEAVED: `--arms base,<flag> --reps 3`. Compare medians. Interleaving
   is not optional on a shared machine: background load drifts during a run,
   and alternating the arms spreads that drift over both.
4. Primary metric: p95 work-per-frame. Guard metric: the RAF interval. A win
   on work that loses on interval is not a win, because it moved cost to the
   GPU.
5. Record the result here, including the losses.

Load-independent numbers (draw calls, triangles) come from the renderer's
`info` in a dev session. They are exact, so they need no A/B.

## Baseline (2026-09-24, before any optimization)

Desktop, unthrottled, built web bundle, first mission:

| work p50 | work p95 | interval p50 / p95 | long tasks |
| --- | --- | --- | --- |
| 4.7 ms | 6.1 ms | 16.7 / 16.9 ms (60 fps locked) | 3 in 20 s |

The step/draw split under 4× throttle was ~2.5 ms simulation against ~22 ms
draw. **Rendering is the cost; the simulation is cheap.** At the tutorial's
start view the world pass was **130 draw calls and 447 K triangles**, and
302 K of those triangles were level geometry. Every room was drawn, because
distance culling (fog range) kept them all: the rooms are close together.

## Entries

### 1. Portal culling — KEPT

Rooms are only drawn when the player can see them. The walls are 4.2 m tall
and the eye is at 1.6 m, so a room is only visible through a door. Visible =
the player's room, then out through open doors that are on screen, two doors
deep, still capped by fog.
- Enemies in hidden rooms are hidden too.
- Static props (chests, crates, barrels, data cores) hang under their room's
  mesh group, so they vanish with it.
- Corridor ownership moved to the room a corridor leaves, and door frames
  moved to their own always-visible group, so a shut door hides exactly the
  room behind it.
- Portals only hold while the eye is below the wall tops. The beam-in (from
  7 m) and beam-out (to 9 m) see over every wall, so they show every room.
  The first cut missed this: crates and doors floated in the sky on beam-out,
  seen in the WebKit run of the cross-browser matrix.

Code: `Mission.updateRoomCulling`, `Mission.propParent`, `levelMesh.ts`.
Baseline arm: `?perf=noportal`.

- Exact: start view **130 → 66 draw calls, 447 K → 114 K triangles**.
- A/B at 4× throttle, 3 interleaved reps, 20 s each: medians of work p50
  **33.6 ms (portal) vs 61.0 ms (noportal)**, p95 70.9 vs 94.5. Portal won all
  3 pairs. The absolute numbers are inflated: the machine sat at 99 % CPU from
  other applications during the run. The ratio is the finding.

### 2. Obfuscation cost — measured, then FIXED (entry 4)

The production obfuscator (stringArray, no control-flow flattening) against an
unobfuscated twin, 4× throttle: work p50 16.6 vs 14.4 ms, about 13 %. Most of
that turned out to be three.js itself going through the obfuscator; see
entry 4.

### 3. Boot: loader first, one build, time-sliced — KEPT

Measured with `scripts/boot-timeline.mjs` (User Timing `boot:*` marks,
long-task observer, the loader fill sampled every frame).

What was wrong:
- `GameScene` mounted before priming finished, and its fallback built the
  whole first sector a SECOND time, synchronously, without the shader
  precompile. The primed copy was thrown away.
- The prime started before the loader had painted, and the build was one
  450 ms task on desktop, so the bar did not move for most of it.
- The first live frame uploaded every mesh to the GPU: a 460 ms hitch at 4×,
  exactly as the player gained control.

What changed:
- `adoptBootMode` makes the scene wait for the prepared mode. It never builds
  its own copy.
- `afterPaint` puts the loader on screen before any heavy work.
- `Mission.create`, `buildLevel` and `spawnEncounters` are time-sliced
  (`engine/slicer.ts`, 12 ms wall-clock budget, `scheduler.yield` or a
  MessageChannel, never timers) and report fine-grained progress.
- The shader programs are created one material at a time and their readiness
  is polled. A final `compileAsync` would re-derive every material in one
  500 ms task.
- The GPU warm-up happens off-screen from above, one room per render.
- The loader bar is ONE fill animated by `transform` under a segment mask, so
  it moves on the compositor through any long task. The static HTML splash
  creeps from the first byte, and the Vue loader continues from its position.
- The "taking too long" hint fires on a real stall (no progress for 6 s),
  not after a fixed 5 s.

Numbers (dev server, desktop, 1×): long tasks 1150 ms total (longest 450) →
402 ms (longest 176); the bar first moves at 374 ms instead of 629. At 4×,
production build: the loader shows at ~0.6 s, the mission is ready at ~6.9 s,
and the longest bar standstill is ~0.8 s, down from over 2 s.

### 4. The obfuscator was rewriting three.js — FIXED

`vite-plugin-javascript-obfuscator` does
`exclude ? handleMatcher(exclude) : defaultExcludeMatcher`. The project's own
exclude list therefore REPLACED the default `/node_modules/`, and every vendor
library went through the stringArray pass. Adding `/node_modules/` back:
- the engine chunk shrank from 1003 KB (320 KB gz) to 787 KB (228 KB gz);
- at 4×, the mission was ready at ~6.9 s instead of 10.0 s;
- the loader appeared at 0.6 s instead of 1.55 s.

### 5. Hub → mission: pause the lab while the sector builds — KEPT

A Deploy tap shows the beam overlay at once (`MissionLoading.vue`) and builds
the mission behind it, time-sliced. The lab loop is paused for the build,
because the overlay covers it anyway. Build time: 11.9 s → 5.8 s at 4×, and
1.47 → 1.28 s at 1×.

## Open hypotheses (not applied, not measured)

- The inverted-hull outline doubles every decor and character triangle.
  Dropping it on far rooms, or on flat level decor, is the next biggest lever
  on triangles.
- The rounded kit uses 14–16 radial segments on pilasters and pillars; 10
  may read the same at game distance.
- Repeated props could be instanced.
