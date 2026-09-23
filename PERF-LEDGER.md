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

### 2. Obfuscation cost — measured, no change

The production obfuscator (stringArray, no control-flow flattening) against an
unobfuscated twin, 4× throttle: work p50 16.6 vs 14.4 ms, about 13 %. It is
paid on the portal builds that obfuscate. Keep the light profile, and never
enable `controlFlowFlattening` on game modules.

## Open hypotheses (not applied, not measured)

- The inverted-hull outline doubles every decor and character triangle.
  Dropping it on far rooms, or on flat level decor, is the next biggest lever
  on triangles.
- The rounded kit uses 14–16 radial segments on pilasters and pillars; 10
  may read the same at game distance.
- Repeated props could be instanced.
