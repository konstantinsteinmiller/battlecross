# #178 — Why players leave around the opening boss, and what keeps them

Structured browser report. Generated 2026-11-02 from a real-browser walkthrough of the first visit
(`scripts/tutorial-funnel.mjs`), the code paths around the boss and its chest, and a web search on
first-session retention. Raw data: `tf-desktop/funnel.json`, `tf-phone/funnel.json`, `tf-landscape/funnel.json` (+ screenshots per step).

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
| Devices | desktop 1280×720 mouse; phone portrait 390×844 touch (`isMobile`); phone landscape 844×390 touch |
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

**F5 — The result window is sound in portrait and desktop (checked).** It fits 390×844 and 1280×720 without
scrolling, the Continue button is inside the viewport, and the new-gear rows have clear Equip buttons.

**F7 — In phone landscape the result window hides what makes a player want to go on (new).** At 844×390 the
window shows the stats and Continue (`tf-landscape/landscape/11-results.png`); the two gear rows with their
Equip buttons and the "New on the map" line are below the fold, inside a scroll. A landscape player sees the
stats and a green Continue, and nothing about the reward or the next place. Recommendation R3 should therefore
also move the next-step line above the stats on short screens. The camp scene itself is fine in landscape: the
chevrons, the goal chip and the wheel trail are all in frame (`tf-landscape/landscape/08-finale-chest-open.png`).

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
| R2 | Make the map's next step one thing: on a first map visit the goal's place keeps its tags and a bobbing arrow, every other place loses its NEW flag and level pill and a locked one fades | **done** (zoom/pan of the strip not built: the decluttering does the job at lower risk) |
| R3 | Put the next step on the result window above the stats: "Next: Sunford, where teachers and shops are waiting" (first wins only; 39 locales) | **done** (a preview of the first new skill is not built) |
| R7 | The first visit now holds a little of the rest of the world: two plants, a first ore node and the plains' piece of the treasure map (own random streams, clear of the camp), so the world shows it has more than fights | **done** |
| R8 | #180: after the cage opens the goal is "Learn a free skill from the teachers" (chevrons lead to the nearest teacher); Leave comes only once the camp's free lesson is taken, and is skipped if no teacher could teach this hero anything | **done** |
| R4 | A celebration beat when the cage opens: a golden burst over each teacher as the door swings, the knight's thanks, then the goal chip becomes "Learn a free skill from the teachers" and, once learned, Leave appears | **done** |
| R5 | Read the real funnel from the Poki playtest, then A/B: boss one pack earlier, the cage offered before the chest | **cannot be done from here**: needs real player data (the events that will give it are in) |
| R6 | A phone-portrait pass on the world map labels (about 15 overlapping labels in a 390 px strip) | **done** with R2 (off-goal places go quiet for a new player) |

## 8. Open items

* The fights, the boss's difficulty and real hands-on feel were not driven; do a short human playtest of the
  first visit on a phone with the new flow.
* The sharpness probe (`blur-probe.mjs image`) crashed on this machine, so the screenshots were checked by eye.

## 9. #181 — A depth preview of the class diversity without overwhelming a new player

**The situation.** 16 base classes (4 taught openly in Sunford, 4 in Silverbridge, 4 secret ones found through a
master's test, 4 more taught openly) plus 4 prestige hybrids; a hero may learn skills from any class (8 active and
4 passive slots), and every class now has six locked endgame skills. That is a lot of depth, and the right amount of
it for a player who stays. For a Poki player in minute three, any of it shown as a list is noise.

**Principles (from the research in section 5 and the funnel above).**
* Show depth by *doing*, not by listing: one thing to look at, one to try.
* Never more than **three** choices on screen at once; reveal the rest as a curiosity gap ("more teachers wait in
  Silverbridge"), not a catalogue.
* The preview should end in a **decision the player owns**, because choosing a style is the first hook of a
  build game (Archero offers a blessing before the first big boss and a skill choice after it).
* Every preview must cost the player **zero extra taps** on the path they are already on.

**Ranked ideas.**

| # | Idea | Overwhelm risk | Effort | Why |
|---|---|---|---|---|
| D1 | **Pick one of three** for the camp's free lesson (#180): the three rescued teachers each offer their first skill as a card with its icon, its class colour and a one-line *style* ("Shield: hit back harder", "Fire: burn it all", "Spirits: fight with the fallen"). The free lesson becomes the player's first build choice. | very low | low (the teachers and the free lesson exist; it is a presentation of what #180 already does) | the preview *is* the decision: three classes, one pick, free |
| D2 | **A 3-second demo on tap**: tapping a skill card plays its animation on a straw dummy in a small viewport (the sim and the dummy exist). | low | medium | seeing beats reading; costs no text and no locales |
| D3 | **Locked silhouettes** in the teachers' skill list: the next two skills of a class appear as dark icons with a level, the six endgame ones as a single sealed row "after the demon king" (non-clickable, as built). | low | low | a curiosity gap, and it tells a new player there is more without explaining it |
| D4 | **A "classes seen" row** on the skills page: 16 small class emblems, the ones met lit, the rest dark with "?"; the first dark one pulses once after the second town. | low | low | collecting is a hook; the count (3/16) is the preview |
| D5 | **A second-class nudge**: after the first level-up, a single line from a teacher in the next town, "Try a trick from another school: it all combines." with a free swap of one slot (needs a free-swap rule). | medium | medium | explicit permission to mix, which a new player does not assume |
| D6 | A full class codex with every skill of every class | high | medium | for those who ask for it, behind a button; never shown unasked |

**Recommendation.** Do D1 first (it rides on #180 and is nearly free), D3 and D4 next (cheap curiosity gaps), D2 only if
the first three show up as drop-off or low second-class uptake in the funnel. Leave D5 and D6 until a player has
learned two skills. Measure with new events: `class_preview_pick` (which of three), `second_class_learned` (did a hero learn
from a class other than the first), `classes_seen` at the end of session one. If `second_class_learned` stays under about a
third of players who learn a second skill, add D5.

**Not built here**: this is a proposal; nothing in section 9 is in the game yet.

## 10. #171 — Healing shamans and a fire-pit boss: does it help retention or overwhelm a Poki player?

**What it asks.** (a) A boss whose first phase is destroying healing shamans, so the boss is not constantly
out-healing the hero; (b) a harder fight where the player kites the boss onto fire pits that pressure plates arm,
each activation costing the boss 10 % of its health, the boss leaping out so one activation cannot grill it.

**What the game already has.** 13 scripted boss modules (centaur, chimera, cyclops, elder dragon, hellgate, hydra,
leviathan, shatter lake, skyfire, sphinx, tusker and others), pressure plates and plate puzzles in the level generator,
and a mercy rule that cuts boss damage when the first fight goes badly. So the *infrastructure* exists; the question is fit.

**Assessment.**

| | (a) Healing shamans (kill the healers first) | (b) Kite the boss onto plate-armed fire pits |
|---|---|---|
| Retention value | high: a clear, readable rule ("break the green beams, then the boss"), a classic that casual players learn in one attempt; fixes a real frustration (a boss that out-heals a weak build) | high for those who master it, **low for a first session**: it is a skill-expression fight |
| Overwhelm risk on Poki | low if telegraphed (green beams from each shaman to the boss, the boss shielded while one lives) | **high** on touch: kiting needs fine stick control while watching plates and pits; a new player has two new ideas at once (plates arm pits, the boss must stand in them) |
| Fit to the first minutes | not in the tutorial boss; fine from the second or third zone | never before the player has beaten two bosses |
| Failure mode | a boss that is *untouchable* until the adds die and no cue says so | an unwinnable-feeling fight; players quit at exactly the point #178 is trying to fix |

**Verdict.** Yes to (a): it is the better retention play and the lower risk. (b) is a good *optional depth* fight, but
as a mandatory kill for Poki's mostly casual, often-touch audience it would raise the quit rate. Build it so the boss
**can be beaten without the pits** (they are a big damage bonus and a mastery bonus, not the only way), place it after the
first two zones, and give it a one-line, one-time hint in the fight ("Lure it onto the fire!") rather than a lesson. Ship
(a) first, read the `boss_seen` → `boss_down` and `hero_fell` events per boss in the next Poki playtest, and only then
decide on (b). **Not built here**: this is an assessment; no boss was changed.
