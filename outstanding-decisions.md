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

## Needs an action from the owner before a submission

| # | What | Why it waits |
| --- | --- | --- |
| A | Create this game in each portal and put its id in the matching env / config file: Poki (P4D), Playgama, Wavedash, GameMonetize, GameDistribution, Glitch | Every id is blank on purpose; the predecessor's were removed. `pnpm deploy:poki` refuses to run without one |
| B | Run the painting round (`art-sheets/README.md`) | No painted art exists yet; the game ships its vector and low-poly placeholders until then |
| C | Say "go" for the remaining release checks: the hydration proof against the built bundle and the Playgama storage path, and CrazyGames / Playgama / Poki arms for `scripts/portal-qa.mjs` | Deferred work, listed in the plan |
