# Outstanding decisions and questions

Things only the owner can settle. Each has a default that is in effect until
answered. Answered items move to the decision table in
[`game-implementation-plan.md`](./game-implementation-plan.md) and are removed
here.

Last updated: 2026-10-06.

## Needs an answer

### 1. Portrait crop

Painted portraits are cut to the bust with no margin under it. Keep that, or
ship them with a 10 % margin?

- **In effect:** cut to the bust.
- **Recommended:** keep; look at `/#/models` → Painted vs drawn if in doubt.

### 2. Painted item details

Rust, rivets and buckles are what tell four swords apart, but they can vary
between re-rolls.

- **In effect:** accepted.
- **Recommended:** accept; fix a drifting item in its prompt.

### 3. A test row on the predecessor's live leaderboard

"Servo773490", score 328, written by an early dev run of this repo. Delete it
from the old game's database?

- **In effect:** left in place.
- **Recommended:** delete it.

### 4. `VITE_GEMINI_API_KEY` in the local `.env`

Nothing in this repo reads it and it does not reach the bundle. Remove it?

- **In effect:** left in place.
- **Recommended:** remove it, or rename it without the `VITE_` prefix.

### 5. The predecessor's git history

The repository carries it. Keep it, or restart the history at the Battlecross
baseline?

- **In effect:** kept.
- **Recommended:** keep unless the repo goes public.

### 8. Weak builds

A Chrono-Weaver-only hero and a late-game Aegis-only hero clear fewer zones
than the other classes. Buff them, or accept (the game is about mixing
classes)?

- **In effect:** accepted.
- **Recommended:** a small buff to Chrono-Weaver's damage.

### 9. Music

One code-composed soundtrack. Commission or generate authored tracks
(`sound-todo.md` lists the drop-in names)?

- **In effect:** code-composed.
- **Recommended:** listen first; authored tracks before the first big portal
  submission if it falls short.

### 29. GameMonetize leaderboard

The build makes no request to our Cloudflare Worker (GameMonetize
re-distributes the archive to many partner sites): it ships the baked board
like Poki (rank chip, no top-100 list, no names). Live board instead?

- **In effect:** baked.
- **Recommended:** keep baked.

### 30. GameMonetize ad order

The midgame interstitial runs on Continue / Retry after the result screen has
closed, never over it. Move it in front of the result screen on this portal?

- **In effect:** after, on Continue.
- **Recommended:** keep; the result jingle and loot reveal are not cut.

### 33. German and Dutch choice screen

"Dein Held" / "Jouw held" stay masculine before the player has chosen.
"Deine Heldin oder dein Held"?

- **In effect:** masculine.
- **Recommended:** keep; it is the neutral generic there.

### 34. Slavic small talk

Feminine variants cover what is said to and about the hero; idle town chatter
that never addresses the hero was left out.

- **In effect:** left out.
- **Recommended:** keep.

### 35. Nudges (#69)

In town, should the gate and the road out hop too when the player stands
about? The bag hops only when it holds an upgrade; should it also hop when it
is nearly full?

- **In effect:** neither.
- **Recommended:** add the gate; leave the bag as is.

### 36. Soundfont credit in the game

The boss music ("The Last Light") is rendered with FluidR3_GM samples
(CC BY 3.0): the credit is in `CREDITS.md`. Also show it in the game (a
settings or about line) or on the portal pages?

- **In effect:** `CREDITS.md` only.
- **Recommended:** one line in each portal's description; an in-game line if
  a credits screen ever exists.

### 37. Where "The Last Light" plays

It replaces the synthesized boss theme in every boss fight (a 45 s loop of its
driving sections). Keep it there, or use it elsewhere (the finale only, a
zone)?

- **In effect:** every boss fight.
- **Recommended:** keep.

## Defaults taken in the playtest pass, overrule any

The full table is in `game-implementation-plan.md` section 6.

### 10. Dialogue presentation

Speech bubbles over heads with the world still running and the choices in a
list at the bottom, or a Gothic-style letterboxed camera with subtitles?

- **In effect:** bubbles, choices at the bottom.
- **Recommended:** keep; it reads on a phone.

### 12. Trading rules

Items stay unique, sell-back 25 %, merchants never run out of gold, same-visit
buy-back. Finite merchant gold or stock?

- **In effect:** unlimited.
- **Recommended:** keep.

### 16. Battle buttons on touch

Six skills fill three columns from the bottom-right (skill 1 nearest the
thumb), the two flasks sit on the row above, the dodge roll left of the
bottom row.

- **In effect:** as described.
- **Recommended:** play it on a phone and say if the flasks should be nearer.

### 19. Mana potion price

At the healer: 20 + 6 × hero level gold.

- **In effect:** 20 + 6 × level.
- **Recommended:** keep.

### 20. Over-levelled optional champion

Appears in 6–16 % of visits, by zone.

- **In effect:** 6–16 %.
- **Recommended:** keep; raise if players never meet one.

### 21. World map info card on desktop

It can cover a neighbouring place. Dock it in the table margin on wide
screens?

- **In effect:** over the map.
- **Recommended:** move it to the margin.

### 24. Three small gifts in conversations

Elder Mara 60 gold, Madam Ash 250 gold, a copper band from Tilly at
Charisma 8.

- **In effect:** in.
- **Recommended:** keep.

### 25. Sword thrust

It reads weakly when the hero faces away, so it is the rarer fourth beat of
the combo. Keep, or a third cut instead?

- **In effect:** kept, rare.
- **Recommended:** watch a fight and say.

### 26. Critical-hit impact size

Large when the camera is close. Calmer?

- **In effect:** large.
- **Recommended:** watch a fight and say.

### 28. Backdrops

Three paintings; the healer reuses the trade table, the character page the
satchel.

- **In effect:** three.
- **Recommended:** keep.

## Needs an action from the owner before a submission

### A. Portal ids

Create the game on the remaining portals and put each id in its env / config
file: Poki (P4D), Playgama, Wavedash, Glitch.

- **Why it waits:** every id is blank on purpose (the predecessor's were
  removed). `pnpm deploy:poki` refuses to run without one. GameMonetize: done.

### C. The remaining release checks

Say "go" for them: the hydration proof against the built bundle and the
Playgama storage path, and CrazyGames / Playgama / Poki arms for
`scripts/portal-qa.mjs`.

- **Why it waits:** deferred work, listed in the plan.

Cover images for every portal (roadmap #1) are being painted.
