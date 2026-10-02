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
