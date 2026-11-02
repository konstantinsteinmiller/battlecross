# #178 — Why players leave around the opening boss, and what keeps them

Structured browser report. Generated 2026-11-02 from a real-browser walkthrough of the first visit
(`scripts/tutorial-funnel.mjs`), the code paths around the boss and its chest, and a web search on
first-session retention. Raw data: `tf-desktop/funnel.json`, `tf-phone/funnel.json` (+ screenshots per step).

## 1. Bottom line

The strongest, code-confirmed cause of "95 % leave right before the boss or right after the boss chest" is
a **finish line in the wrong place**: before #177, the moment the boss fell the goal became *"Take your loot
and leave"* (the goal chip steps aside for the Leave button itself, which shows the chest count), the chest sat right there, and the way on (the teachers' camp, the
cage, the broken caravan) was behind rock with **no cue at all**. Opening the chest was the natural last
action, and Leave was the only offered next action. That is a player-built exit ramp.

Fixed and seen working in the browser (desktop and phone portrait):
* Leave stays hidden until the teachers are out of the cage.
* New goal chip "Free the caged teachers" from the second the boss is down.
* Gold chevrons lead from the player to the key, then the cage, and the way is strewn with wheels and
  splintered spokes that lead to the broken caravan.

What is **not** known: the real reason a particular Poki player closes the tab. Nothing here reads real player
data. To find out, the first visit now reports its own funnel (section 6), so the next Poki playtest answers
it directly.

## 2. What was measured, and what was not

| | |
|---|---|
| Browser | real Chrome (headless, software GL), new save, boy hero, English |
| Devices | desktop 1280×720 mouse; phone portrait 390×844 touch (`isMobile`); phone landscape 844×390 touch (see section 8) |
| Walked | boot + hero choice → dummy → first pack → boss in view → boss down → finale chest → key → cage → Leave → result window → world map |
| Recorded at every step | screenshot, goal chip text, lessons shown, Leave button (rect, inside viewport), chest prompt, modal, hero health, camp state |
| **Skipped with damage** | the fights themselves. Time-to-boss and boss difficulty are **not** measured here (`tests/game/tutorialAid` and the "mercy" rule cover the boss) |
| **Not measured** | real playtime, ad timing inside the Poki SDK, audio, a real hand on a real phone |

## 3. The timeline a player walks (desktop; phone portrait matches)

| # | Step | Goal chip | Lessons | Leave button | Notes |
|---|---|---|---|---|---|
| 1 | Boot, hero choice | Knock down the training dummy | move | – | hero choice holds the fight still |
| 2 | First seconds | Knock down the training dummy | move | – | |
| 3 | Dummy down | (zone badge counts the packs) | chest, move | – | goal chip hides on purpose during "clear" |
| 4 | First pack | – | skill | – | |
| 5 | Boss in view | – | skill | – | boss plate shows once it wakes |
| 6 | **Boss down** | **Free the caged teachers** | – | **hidden** | was: goal "Take your loot and leave" = the Leave button |
| 7–8 | **Finale chest opens / open** | Free the caged teachers | – | hidden | chevrons + wheels + spokes on screen |
| 9 | Key taken | Free the caged teachers | – | hidden | "Open E" prompt at the cage |
| 10 | Cage open | – | – | **Leave appears** | teachers step out, thank the hero |
| 11 | Result window | – | – | – | "Victory! First clear!", Level 3, 2 gear upgrades with Equip |
| 12 | World map | Travel to Sunford | – | – | see finding F4 |

## 4. Findings

**F1 — Exit ramp after the boss (cause, fixed).** Old flow: boss down → goal "Take your loot and leave" (shown
as the Leave button with its chest count). The camp (cage, teachers, fire, caravan) lies behind the boss's floor with nothing pointing at it.
Fixed by #177 (see section 1). Evidence: screenshots `*/06-boss-down.png`, `*/08-finale-chest-open.png`.

**F2 — The camp's story is invisible from the chest (cause, fixed).** Players had no reason to look past the
chest. Wheels, spokes and the caravan now form a visible trail that ends at the wagon; the chevrons make it
unmissable. Evidence: `tf-phone/phone/08-finale-chest-open.png` shows the chevrons, the goal chip, a wheel
and spokes, and the camp fire in one phone-portrait frame.

**F3 — No ad stands in the way (ruled out).** `adPacing.breakAllowed` blocks the interstitial after the
opening fight, after defeats and before decisions, so the result window → Continue → map path has no ad on the
first visit. This was checked in code, not in the Poki SDK.

**F4 — The map after the first clear gives three calls to action (partly fixed).** The result window says
"New on the map: Goblin Hollows, Whispering Woods", the map marks both with glowing NEW tags, and the goal chip
says "Travel to Sunford" (where the teachers and the smith are). On phone portrait the whole realm is squeezed
into a ~390×220 strip with about 15 overlapping labels (`tf-phone/phone/12-map.png`). Done: the goal's place
now gets the same bobbing arrow a sought teacher's place has. Not done: see recommendation R2.

**F5 — The result window is sound (checked).** It fits 390×844 and 1280×720 without scrolling, the Continue
button is inside the viewport, and the new-gear rows have clear Equip buttons.

**F6 — Funnel was blind (fixed).** Nothing recorded where a leaving player stopped. See section 6.

## 5. What the research says (web search, 2026-11-02)

Practitioner sources, not controlled evidence; none is specific to Poki.
* End the first experience on a **win and a clear next goal**, and show what unlocks next
  ([Unity: 10 FTUE tips](https://unity.com/how-to/10-first-time-user-experience-tips-games),
  [PocketGamer.biz on FTUE](https://www.pocketgamer.biz/pgc-digital-how-to-enhance-the-first-time-user-experience)).
* Find the step with the largest loss with a **funnel through the first session**, then playtest that step
  ([devtodev](https://www.devtodev.com/resources/articles/how-to-analyze-first-player-session),
  [bugnet](https://bugnet.io/blog/how-to-improve-day-one-retention-in-your-game)).
* Confusing onboarding, an early difficulty wall and a slow start are the usual culprits; removing one step or
  one click can matter ([bugnet](https://bugnet.io/blog/what-to-do-when-your-day-one-retention-is-low)).
* Place ads at completion/failure moments rather than interrupting play
  ([juegostudio](https://www.juegostudio.com/blog/html5-game-platform)).
* Successful run-based adventure games (Archero, Survivor.io) pay out at the boss and put the choice of power
  right there: Archero offers a blessing before the first big boss and a skill-for-health gamble after it
  ([urgametips](https://urgametips.com/archero-beginner-faqs-tips-guide/),
  [easegame](https://easegame.com/blog/from-easy-dodging-to-no-escape-archero-difficulty-guide)).
  The reward and the "what next" come from the same screen.

## 6. Instrumentation added (so the next playtest answers "where")

`trackFtue(step)` sends each step once per page load, with the seconds into the fight: `boss_seen`,
`hero_fell`, `boss_down`, `finale_open`, `chest_open`, `key_taken`, `cage_open`, `leave_pressed`. They land in
the analytics ring (`window.__analytics()` on a device) and in whatever event sink the portal offers
(`useAnalytics` → `analyticsSink`). Read the **last step reached** per session: that is the drop-off point.
Pinned by `tests/game/ftueFunnel.test.ts`. Not verified: that Poki's build actually forwards these (its sink
probe is the existing one; check in the Poki inspector before the next playtest).

## 7. Recommendations

| | Change | Status |
|---|---|---|
| R1 | Hold Leave until the teachers are free; chevrons + goal chip + trail to the camp | **done** (#177) |
| R2 | Make the map's next step one thing: on a first map visit dim the other NEW tags, and on phone portrait zoom/pan the map to the hero's region instead of showing the whole realm in a strip | proposed |
| R3 | Put the reward and the next step on the result window itself: a line "Next: Sunford — your teachers are waiting" and a preview of the first new skill (needs copy in 39 locales) | proposed, needs owner copy |
| R4 | A short celebration beat when the cage opens (the teachers thanking the hero already happens) with the goal chip switching to "Take your loot and leave" only then | partly there (Leave appears); polish proposed |
| R5 | Read the real funnel from the Poki playtest, then A/B: boss one pack earlier, the cage offered before the chest | needs real data |
| R6 | A phone-portrait pass on the world map labels (about 15 overlapping labels in a 390 px strip) | proposed |

## 8. Open items

* Phone landscape (844×390) is in the run queue; its data lands in `tf-landscape/` when it finishes.
* The fights, the boss's difficulty and real hands-on feel were not driven; do a short human playtest of the
  first visit on a phone with the new flow.
* The sharpness probe (`blur-probe.mjs image`) crashed on this machine, so the screenshots were checked by eye.
