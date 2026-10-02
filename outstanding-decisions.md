# Outstanding decisions and questions

Things only the owner can settle. Each has a default that is in effect until
answered. Answered items move to the decision table in
[`game-implementation-plan.md`](./game-implementation-plan.md) and are removed
here.

Last updated: 2026-10-02.

## Needs an answer

| # | Question | In effect now | Recommended |
| --- | --- | --- | --- |
| 1 | **Portrait crop.** Painted portraits are cut to the bust with no margin under it. Keep that, or ship them with a 10 % margin? | Cut to the bust | Decide on the first painted portrait sheet, in `/#/models` → Painted vs drawn |
| 2 | **Item prompts add details the placeholder drawings do not show** (rust, rivets, buckles), which is what tells four swords apart but can vary between re-rolls. Accept, or differentiate the drawings first? | Accepted | Accept; fix a drifting item in its prompt |
| 3 | **A test row on the predecessor's live leaderboard** ("Servo773490", score 328), written by an early dev run of this repo. Delete it from the old game's database? | Left in place | Delete it |
| 4 | **`VITE_GEMINI_API_KEY` in the local `.env`.** Nothing in this repo reads it and it does not reach the bundle. Remove it? | Left in place | Remove it, or rename it without the `VITE_` prefix |
| 5 | **The pushed repository carries the predecessor's git history.** Keep it, or restart the history at the Battlecross baseline? | Kept | Keep unless the repo goes public |
| 6 | **GitHub default branch** is probably still `battlecross-build`. Switch to `main`? | Unchanged | Switch to `main` |
| 7 | **Rewarded ads.** The code is dormant, not deleted. Bring rewarded placements back for roadmap #18 / #19? | Off | Decide with the first retention numbers |
| 8 | **Weak builds.** A Chrono-Weaver-only hero and a late-game Aegis-only hero clear fewer zones than the other classes. Buff them, or accept (the game is about mixing classes)? | Accepted | Small buff to Chrono-Weaver's damage |
| 9 | **Music.** One code-composed soundtrack. Commission or generate authored tracks (`sound-todo.md` lists the drop-in names)? | Code-composed | Authored tracks before the first portal submission |

## Playtest pass (roadmap #37 to #60): defaults taken, overrule any

The full table is in `game-implementation-plan.md` section 6 (D36 to D46).
The ones most worth a look before much is built on them:

| # | Question | In effect now | Recommended |
| --- | --- | --- | --- |
| 10 | **Dialogue presentation.** Speech bubbles over heads with the world still running and the choices in a list at the bottom, or a Gothic-style letterboxed camera with subtitles? | Bubbles over heads, choices at the bottom | Keep; it reads on a phone |
| 12 | **Trading rules.** Items stay unique (owned or not), sell-back 25 %, merchants never run out of gold. Added: buying back what was sold in the same visit. Want finite merchant gold or stock? | Unlimited | Keep; finite gold annoys on a phone |
| 16 | **Order of the battle buttons on touch.** The bar now holds eight (six skills, health flask, mana flask): skills fill three columns from the bottom-right corner, so skill 1 is nearest the thumb, and the two flasks sit on the row above. Before, the potion was top-right with skill 1 beside it. | Skill 1 at the thumb, flasks above | Play it on a phone and say if the flasks should be nearer |
| 18 | **After the boss falls.** The hero now walks to the finale chest and opens it by himself, then the result screen comes. Keeping control instead would let the player go back for chests they missed, but the visit would need an explicit "leave" (an exit, or a button). | Automatic walk to the chest | Keep control, with a "Leave" button that appears after the boss: exploring is the point of the new chests |
| 19 | **Mana potion price** at the healer: 20 + 6 × hero level gold each. | 20 + 6 × level | Keep, re-check when the balance pass runs |
| 20 | **How often the over-levelled optional champion appears:** 6 to 16 % of visits, by zone. | 6–16 % | Keep; raise if players never meet one |
| 21 | **World map info card on desktop.** It docks top or bottom centre of the map and can cover a neighbouring place. Dock it in the table margin beside the map instead? | Over the map | Move it to the margin on wide screens |
| 22 | **The hero's speech bubble** is labelled "You". Should the hero have a name (fixed, or chosen by the player)? | "You" | Keep until a name-entry step exists |
| 23 | **Voice-over fallback.** When a language has no recording for a line, the English recording plays under the translated text. Silence instead? | English recording | Keep: a voice is better than none |
| 24 | **Three small gifts in conversations** are new rewards: Elder Mara 60 gold, Madam Ash 250 gold, a copper band from Tilly at Charisma 8. | In | Keep; covered by the balance re-check |
| 25 | **Sword thrust.** Straight-ahead strikes read weakly when the hero faces away from the camera (the head hides them), so the thrust is the rarer fourth beat of the sword combo. Keep it or drop it for a third cut? | Kept, rare | Watch a fight and say |
| 26 | **Critical-hit impact size.** It is large when the camera is close. Calmer? | Large | Watch a fight and say |

## Needs an action from the owner before a submission

| # | What | Why it waits |
| --- | --- | --- |
| A | Create this game in each portal and put its id in the matching env / config file: Poki (P4D), Playgama, Wavedash, GameMonetize, GameDistribution, Glitch | Every id is blank on purpose; the predecessor's were removed. `pnpm deploy:poki` refuses to run without one |
| B | Run the painting round (`art-sheets/README.md`) | No painted art exists yet; the game ships its vector and low-poly placeholders until then |
| C | Say "go" for the remaining release checks: the hydration proof against the built bundle and the Playgama storage path, and CrazyGames / Playgama / Poki arms for `scripts/portal-qa.mjs` | Deferred work, listed in the plan |
