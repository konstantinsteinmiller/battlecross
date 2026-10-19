# Outstanding decisions and questions

Things only the owner can settle. Each has a default that is in effect until
answered. Answered items move to the decision table in
[`game-implementation-plan.md`](./game-implementation-plan.md) and are removed
here.

Last updated: 2026-10-19 (63 answered: D149).

## Needs an answer

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

### 44. Quality names (#90, D98)

Item tiers become quality names. Common, Uncommon, Rare, Epic and Legendary
fit five of the six tiers. What is tier 5 (orange) called?

- **In effect:** Common, Uncommon, Rare, Epic, Heroic, Legendary.
- **Recommended:** keep, or name another word for tier 5.

### 45. Gambler prizes and the hero's level (#91, #92, D113)

Every legendary needs hero level 28–30, every epic 17–20. A prize won at level
6 waits in the bag a long time.

- **In effect:** a random item of that quality the hero does not own yet,
  worn at its own level.
- **Recommended:** keep (a long-term goal in the bag).

### 46. The four secret classes (#86, D109)

- **In effect:** Windrunner (bow), Frostwarden (ice blade), Lightbringer
  (holy healer), Beastcaller (beast companions).
- **Recommended:** keep. Other options: Stormcaller, Bard, Iron Monk
  (decision report).

### 47. Where the memory gambler stands (#91, D110)

- **In effect:** the market of the new big town, Silverbridge.
- **Recommended:** keep.

### 48. The item battle: is the gambler's item shown? (#92, D111)

- **In effect:** its picture and quality show; its coin value is revealed
  only after both items are laid.
- **Recommended:** keep (fully shown, the player just lays the cheapest item
  that beats it).

### 49. A sharp world map on phones (#81, #94, D116)

The free Gemini app returns 1376 px. A full-screen map on a 3× phone needs
about 2500 px.

- **In effect:** paint it as four overlapping quarters, stitched to about
  2600 px, checked by the blur probe.
- **Recommended:** keep.

### 50. Where equipment is upgraded (#90, D99)

- **In effect:** an Upgrade button on the equipment page, in any town.
- **Recommended:** keep (a blacksmith to walk up to is the alternative).

Decision report for #78–#94: https://claude.ai/artifact/QkADooVg1f8ndUYurrpaYi

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

### 60. The first minute: five features that could make it addictive (#136)

Built for #136 now (the minimum you asked for): the three-plate puzzle, a new
gambler with a fast mini-game, the Shadowblade teacher stepping in after the
first two goblins, and the tutorial boss's arrow rain, spear line and gnome
helpers. Five bigger features that fit this game are proposed; none is built.
Pick any.

1. **The Lucky Stranger (a rolling first-hour "next reward" ladder).** A
   visible five-rung track in the HUD (kill 2 goblins, open the chest, pull
   the plates, win a round at the gambler, learn Shadowstep). Each rung pays at
   once and the next one is always in sight, so the first minute never has a
   dead stretch. *Why it fits:* the game already has goals, a coach and
   contracts; this chains them into one hook. *Cost:* medium; no new art
   beyond rung icons. *Risk:* feels like a checklist if the rewards are flat.
2. **Fishing with a lent rod (your idea, made a loop).** An NPC angler hands
   over a pre-given rod and shows one cast. Fishing is a timing mini-game
   (tension ring, three bite types); fish are visible only in the fish
   trader's window, sell for coins or trade for gear one tier above the zone.
   A "fish of the day" gives a first-hour bonus. *Why it fits:* Silverbridge
   has a river and quay; a calm counterweight to combat. *Cost:* high (new
   window, 12 fish, 12 icons, 2 NPCs, voice). *Risk:* must stay out of the
   tutorial's first 30 s or it splits attention.
3. **The Wager Totem (a risk-it streak on every pack).** After a pack dies, a
   totem offers "double or nothing": keep the loot, or fight a harder
   mirror-pack for twice the drops. Three wins in a row pay a chest of the
   next tier. *Why it fits:* the combat already has telegraphs and packs;
   it adds a choice per fight without a new system. *Cost:* medium. *Risk:*
   a loss must feel fair, so the harder pack needs its own preview.
4. **A companion egg in the tutorial.** A cracked egg lies behind the chest;
   it hatches after the boss into a small pet that fights beside the hero
   and grows with the number of zones cleared. *Why it fits:* the game has
   a mystery-egg idea in the playbook and strong creature art. *Cost:* high
   (pet rig, AI, save). *Risk:* a pet that blocks lanes or dies annoys.
5. **A dungeon-in-a-minute preview ("Glimpse of the Deep").** After the
   boss, a 60-second scripted run with every class's best skill unlocked
   (a taste of the late game), ending on a locked door that opens at level 10.
   *Why it fits:* #130's trailer-style intro shows the same idea in play;
   it answers "what is the rest of the game?" directly. *Cost:* medium;
   reuses skills and a fixed arena. *Risk:* power fantasy then a drop; keep
   it short and clearly labelled.

- **In effect:** none of the five; only the minimum set above.
- **Recommended:** 1 first (cheap, lifts retention at once), then 3, then 2.

### 61. Buffs do not stack, and the hero cannot buff anyone but himself and his minions (wiki support and buffer builds)

Found while measuring the Hymnkeeper Warden and Choirmaster Warlord guide
builds. Two gaps cap what a support or buffer build can be:

1. **Same-kind buffs take the strongest, they do not add.** Ballad of Valor
   (+30% damage), Banner of Victory (+35%), Command Focus (+50%) and Grand
   Finale (+15%) are all "damage up": a second one only refreshes the first.
   Only different kinds add (damage up plus Alpha Howl's enrage, attack speed,
   haste, defence). Songs are 13 s long on 18-22 s cooldowns, so the aura has
   gaps. The Choirmaster build works around it, but a "stack every buff" fantasy
   is mostly one buff.
2. **There is nobody to heal.** Heals and shields (Mending Light, Dawn Shield,
   Healing Power) only reach the hero; the area heals reach his minions. A
   support build is a self-healer with a court, not a team healer.

- **In effect:** as is; the guide says so in both entries.
- **Recommended:** let each buff kind stack to a cap (for example two sources,
  second at half strength) and add one party-wide cooldown skill that makes a
  minion untargetable or immune for a few seconds.

### 62. The item gap-fill: 105 new pieces, drop tables and strength versus endurance (items-gap-audit.md)

The audit found 105 empty cells in the line x slot x quality matrix and filled
each with a fixed piece (nine icon sheets, `sheet-items-fill-1` to `-9`, still
to be painted; the procedural icons stand in). Three things are the owner's:

1. **Bigger tables.** Every zone's chest table roughly doubled (7-10 pieces to
   15-19); the first finds are unchanged (a chest draws something the hero
   does not own yet), but collecting a whole zone takes longer. The Dread
   Fortress's boss now pays one of eight legendaries (it was four), so a full
   set takes eight finale kills. The Void Rift is untouched.
2. **Strength and endurance share heavy gear.** A plate that leads with
   endurance and carries strength serves both builds (as it always did); only
   weapons are split by what the blow scales on (END now has maces and axes at
   every quality). Strictly separate lines would need a twin of each heavy piece.
3. **Shops list more.** Armourers and weaponsmiths read the catalogue, so each
   shelf of a quality shows about twice as many pieces.

- **In effect:** as built.
- **Recommended:** keep; move a few Fortress boss legendaries to the Rift's
  boss if eight kills feels long.

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


## Samsung dark mode fix: what to verify on the phone

The fix is built and covered by tests, but only a Samsung phone can show whether it works on the real game. Deploy a
test build (not a portal), then on the Samsung phone with the browser's dark mode ON:

1. Open the build with `?samsungfix=0`. Take full screenshots of each screen below. This is the "before".
2. Open it with no query on a fresh profile (or Options > "Run the colour check again"). Play past the first fight; on
   the map or in the town the card "Quick colour check" appears after about 2.5 seconds. The two squares must look
   different (that is what dark mode does to the right one): tap "No, they look different". If they look the same on
   your phone, dark mode is not recolouring the page and the fix is not needed.
3. Open it with `?samsungfix=1` (forces the fix on and skips the card). Take the same screenshots. This is the "after".
4. Screens to capture, before and after: the hero choice; the opening fight HUD (health, skill bar, goal, top status);
   the pause menu and Options (the "Fix colours (Samsung dark mode)" select is there); the results screen; the world
   map and a place card; the town; a conversation bubble; the shop, the smith (forge), the alchemist, the bag, the
   skills page, the character page, the trainer; a toast; a tooltip (long-press an item).
5. What "after" should look like: identical to the game on a normal phone: cream pages with dark brown text, gold
   rims, blue ribbons, red and green buttons, bars with their real colours, shadows under panels and outlines round
   HUD text, icons and item art at their normal brightness.
6. Report anything still wrong with the screen name. Known gaps to look at first: inline SVG glyphs that follow the
   text colour (a few small icons), text underlines, anything shown in a video, and the colours of items that change
   while an animation runs (they are repainted when the animation ends).
7. Performance: play the opening fight for a minute with the fix on. If the frame rate drops compared with step 1, say
   so; the counter can be switched off in Options at any time.
