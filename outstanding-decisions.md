# Outstanding decisions and questions

Things only the owner can settle. Each has a default that is in effect until
answered. Answered items move to the decision table in
[`game-implementation-plan.md`](./game-implementation-plan.md) and are removed
here.

Last updated: 2026-10-03.

## Needs an answer

| # | Question | In effect now | Recommended |
| --- | --- | --- | --- |
| 1 | **Portrait crop.** Painted portraits are cut to the bust with no margin under it. Keep that, or ship them with a 10 % margin? | Cut to the bust | Keep; look at `/#/models` → Painted vs drawn if in doubt |
| 2 | **Painted item details** (rust, rivets, buckles) are what tell four swords apart, but they can vary between re-rolls. | Accepted | Accept; fix a drifting item in its prompt |
| 3 | **A test row on the predecessor's live leaderboard** ("Servo773490", score 328), written by an early dev run of this repo. Delete it from the old game's database? | Left in place | Delete it |
| 4 | **`VITE_GEMINI_API_KEY` in the local `.env`.** Nothing in this repo reads it and it does not reach the bundle. Remove it? | Left in place | Remove it, or rename it without the `VITE_` prefix |
| 5 | **The repository carries the predecessor's git history.** Keep it, or restart the history at the Battlecross baseline? | Kept | Keep unless the repo goes public |
| 7 | **Rewarded ads.** The code is dormant, not deleted. Bring rewarded placements back for roadmap #18 / #19? | Off | Decide with the first retention numbers |
| 8 | **Weak builds.** A Chrono-Weaver-only hero and a late-game Aegis-only hero clear fewer zones than the other classes. Buff them, or accept (the game is about mixing classes)? | Accepted | Small buff to Chrono-Weaver's damage |
| 9 | **Music.** One code-composed soundtrack. Commission or generate authored tracks (`sound-todo.md` lists the drop-in names)? | Code-composed | Listen first; authored tracks before the first big portal submission if it falls short |
| 29 | **GameMonetize leaderboard.** The build makes no request to our Cloudflare Worker (GameMonetize re-distributes the archive to many partner sites): it ships the baked board like Poki (rank chip, no top-100 list, no names). Live board instead? | Baked | Keep baked |
| 30 | **GameMonetize ad order.** The midgame interstitial runs on Continue / Retry after the result screen has closed, never over it. Move it in front of the result screen on this portal? | After, on Continue | Keep; the result jingle and loot reveal are not cut |
| 31 | **Voice for the girl hero.** About 75 hero lines would need a second, female take. Record them, or let the girl use the boy's lines? | The boy's lines | Record them once the voice cast is final |
| 32 | **A line the girl has no take for** plays the boy's recording. Silence instead? | The boy's recording | Keep until #31 is done |
| 33 | **German and Dutch choice screen.** "Dein Held" / "Jouw held" stay masculine before the player has chosen. "Deine Heldin oder dein Held"? | Masculine | Keep; it is the neutral generic there |
| 34 | **Slavic small talk.** Feminine variants cover what is said to and about the hero; idle town chatter that never addresses the hero was left out. | Left out | Keep |
| 35 | **Nudges (#69).** In town, should the gate and the road out hop too when the player stands about? The bag hops only when it holds an upgrade; should it also hop when it is nearly full? | Neither | Add the gate; leave the bag as is |

## Defaults taken in the playtest pass, overrule any

The full table is in `game-implementation-plan.md` section 6.

| # | Question | In effect now | Recommended |
| --- | --- | --- | --- |
| 10 | **Dialogue presentation.** Speech bubbles over heads with the world still running and the choices in a list at the bottom, or a Gothic-style letterboxed camera with subtitles? | Bubbles, choices at the bottom | Keep; it reads on a phone |
| 12 | **Trading rules.** Items stay unique, sell-back 25 %, merchants never run out of gold, same-visit buy-back. Finite merchant gold or stock? | Unlimited | Keep |
| 16 | **Battle buttons on touch.** Six skills fill three columns from the bottom-right (skill 1 nearest the thumb), the two flasks sit on the row above. | As described | Play it on a phone and say if the flasks should be nearer |
| 19 | **Mana potion price** at the healer: 20 + 6 × hero level gold. | 20 + 6 × level | Keep |
| 20 | **Over-levelled optional champion** appears in 6–16 % of visits, by zone. | 6–16 % | Keep; raise if players never meet one |
| 21 | **World map info card on desktop** can cover a neighbouring place. Dock it in the table margin on wide screens? | Over the map | Move it to the margin |
| 24 | **Three small gifts in conversations:** Elder Mara 60 gold, Madam Ash 250 gold, a copper band from Tilly at Charisma 8. | In | Keep |
| 25 | **Sword thrust.** It reads weakly when the hero faces away, so it is the rarer fourth beat of the combo. Keep, or a third cut instead? | Kept, rare | Watch a fight and say |
| 26 | **Critical-hit impact size** is large when the camera is close. Calmer? | Large | Watch a fight and say |
| 28 | **Backdrops:** three paintings; the healer reuses the trade table, the character page the satchel. | Three | Keep |

## Needs an action from the owner before a submission

| # | What | Why it waits |
| --- | --- | --- |
| A | Create the game on the remaining portals and put each id in its env / config file: Poki (P4D), Playgama, Wavedash, Glitch | Every id is blank on purpose (the predecessor's were removed). `pnpm deploy:poki` refuses to run without one. GameMonetize: done |
| C | Say "go" for the remaining release checks: the hydration proof against the built bundle and the Playgama storage path, and CrazyGames / Playgama / Poki arms for `scripts/portal-qa.mjs` | Deferred work, listed in the plan |

Cover images for every portal (roadmap #1) are being painted.
