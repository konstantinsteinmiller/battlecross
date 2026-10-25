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

## Afterplay phase 2 (invasion overlay): defaults chosen, change freely

- Once the afterplay is open, every zone is entered as its invaded version only (the campaign version is gone).
  Invaded zones open in the order of their level bands: Plains and Hollows at once, each next one when the one
  before it is won (flag `invaded:<zone>`). The phase 3 quest chain may replace this rule.
- Random map encounters in the afterplay use the invaded roster and band, and also pay the 2.2× XP.
- Until phases 4/5/7 add them, new enemies and bosses fight as stand-ins (hellhound = wolf, gargoyle = iron golem,
  harpy = wyvern, Chimera = Elder Treant, Elder Dragon = Void Lord, and so on; `STAND_INS` in `data/invasion.ts`).
- The pylon aura (+20 % damage) works on every enemy in an invaded zone, not only on "demons".
- The pylon chest is not a physical chest: when the last pylon falls, its gold (0.6× a finale purse) and one unowned
  tier-5 item spill out where it stood. There is no Demonglass yet (phase 8).
- The Reborn bosses keep their campaign names plus "Reborn" (the Ember Lord is "the Ember Lord Infernal").

## Afterplay phase 3 (story B0–B5 and the fort): defaults chosen, change freely

- B0 (the rift screams) is told on the world map, as a portrait conversation by the intro's storyteller with a
  red flash, right after the Rift is won (and on the next map for a save that beat it before the update). There is
  no in-zone camera cut yet.
- Any afterplay win of a zone counts as purging it once Scout Wren has spoken (flag `purged<Zone>`); phase 2 may
  narrow it to invaded visits. B3/B4/B5 follow the purges (Plains + Hollows; Woods at level 34; Outskirts at 38).
  B5 sets `siegeDue` for the siege (phase 6) to pick up; there is no story siege yet.
- Sunford, Oakhaven and Ironhold are overrun (ruins, two survivors by a fire, nobody to trade with) until both
  zones of their road are purged (Sunford: Plains + Hollows; Oakhaven: Woods + Outskirts; Ironhold: Crags + Mines),
  then rebuilt with shops a tier higher. No wandering demons in overrun towns (towns have no combat).
- Silverbridge's masters stay in Silverbridge (the "stays open" default); they do not move to the fort until B7.
- Rescued Sunford people (Aegis, Pyro, Shadow and Geo teachers, smith, peddler, both gamblers, healer; the
  herbalist at B4) work at the fort AND go home once Sunford is rebuilt, like the masters who teach in two towns.
- If Oakhaven fell, Elder Mara runs the fort (no new character), and the Syndicate's fence trades there.
- The fort's way to the map is the walled town's east gate; the south road stands for the siege gate.
- Scout Wren's bounties (errands) and the Mysterious Wanderer are not built yet (later phases).

## Afterplay phase 4 (the new enemies): defaults chosen, change freely

- Twelve new enemy defs; the thirteenth of §6, the demon pylon, is phase 2's and unchanged. All rank "normal".
- Looks are placeholder recolours of rigs that already pass the coplanar and budget tests: hellhound / frost
  hellhound = the wolf with the howler's back row turned into a glowing mane; gargoyle = a grey stone golem
  (the golem rig, not humanoid as §6 says: it reads as a statue); harpy and drake hatchling = small wyverns;
  corrupted treant = a treant in ash and bruise; sphinx acolyte = a sand-gold beast (cat-like); sea-demon and
  hydra spawn = recoloured naga (one head: the two-headed snake waits for the painted pass); centaur raider,
  cyclops brute, demon miner = humanoid looks (no horse body under the raider, no single eye on the brute yet).
- No enemy descriptions: the game has no bestiary text (only names), so only the 12 names were added, in every locale.
- The Rift's "every new mythic as a lone elite" (§4 note in `data/invasion.ts`) is NOT done: unclear whether it means
  the 12 new kinds or the 7 new bosses, and elite versions would need defs of their own. The Rift roster is unchanged.
- Numbers: the hellhound's leap leaves 3 s of burning ground (frost: slowing ground); the gargoyle wakes at 4 m
  and slams at once, and is not woken by its pack; the harpy flies off from a hero within 2.6 m; the cyclops brute
  reels 1.8 s after its slam and takes +50 %; the sea-demon dives for 2 s every 9 s; the hydra spawn splits once
  into two pieces at 40 % health each that pay no kill reward (like summons).
- Enemy barks for the new kinds: none (optional per the design).

## Afterplay phase 5 (Chimera, Centaur Warchief, Cyclops): defaults chosen, change freely

- Arena props (2 stone pillars, 3 hay wagons, 4 support beams) are raised by each boss's script as solid cells
  round its home when the zone loads (the kit's temporary walls, drawn by `WallRocks`, already standing, no
  quake), not laid by the zone generator. One cell each (1.5 m), always with open ground all round, never on
  or next to a chest. Wagons and beams break when charged into; pillars stand.
- The Wildwood's invaded finale is now a boss (the campaign's was the elite Elder Treant), so its invaded
  layout is laid as a boss arena and no longer matches the campaign's clearings. Outskirts and Mines keep theirs.
- Chimera: each head's glow is a coloured ring at the head's place plus the ground warning; a real glowing
  head on the rig waits for the painted pass. P2 pairs: each head owns a third of the ground round it (lion
  ahead, goat back-left, serpent back-right), two glow, the dark head's third is safe; the safe third never
  repeats twice running. No pairs after the tail is cut (30 %): only the lion and the goat are left.
- Centaur Warchief: a hay wagon stuns it in every phase, not only phase 3 (phase 3 adds the rear-up, 1.4 s,
  and makes it charge from any range instead of only when the hero is within 5 m). "Circles the arena at
  speed" (P2) is done as +30 % move speed with its usual keep-away; there is no scripted circling path.
  The rider is the Goblin King's saddle trick: a humanoid on a horse-coloured wolf body (placeholder).
- Cyclops: "only the eye takes damage" is a guard: every blow is cut to 20 % while the eye is shut. Before
  60 % the eye is also open while the eye beam burns (it fires from the eye); from 60 % only the dazes
  (missed boulder, beam slam) open it. A charge into plain rock staggers it 0.6 s with the eye shut.
  Blind (30 %): any hero movement that is not a dodge roll is noise, standing still is silent; a hero
  within 2.8 m is felt and fought as usual. Cyclops health is 6 × (not 9 ×) the boss base so the fight lands
  at about a minute for the reference player (the 80 % guard makes it tankier than its number says).
- Each boss shouts an intro, a line at each phase change and a death line (12 lines). The death line is
  sent as the boss falls (`combat.ts`, `DEATH_BARKS`).
- Boss unique drops (Chimera Mane, Tri-Fang, Warchief's Longbow-gun, Hoofbreaker greaves, Eye of the Deep,
  Beam-Splitter) are phase 8: no hook was added beyond the boss's normal finale chest.
- Balance finding, not changed: a geared Shadow at the top of an afterplay band kills any afterplay boss
  in about 5 s, the Reborn ones included (Frost Jarl Reborn: 5 s; Chimera 4 s; Cyclops 5 s). The other
  classes take 30-70 s. The phase 5 bot tests use Aegis, Pyro and Blood. Now addressed in part:
  see "Shadow afterplay balance" below.

## Shadow afterplay balance: fixed (boss-only damage cut)

Measured with the bot (geared, top of each afterplay band, seed 7; `tests/game/shadowAfterplay.test.ts`).
It is not an afterplay problem: the bot's gear stops at level-30 items, and the same geared Shadow kills
the campaign's Demon King in 4 s. The burst came from three things that stack:

- Dance of Blades put all eight strikes (Thousand Cuts: sixteen) into a lone boss, 300 % DEX each: about
  half the boss's health in 1.5 s, untouchable. Fixed: a boss takes one strike per dance. Packs are struck
  exactly as before. The tooltip claimed "{dmg}% in total", but the code dealt {dmg}% per strike (as GDD
  §5.2 says), so the tooltip now says "{dmg}% each. A boss takes only one strike." in all 39 locales.
- Attack speed and the crit multiplier had no cap, and #110 doubled the DEX and SKL points behind them.
  A geared Shadow swung 3.6-4.3x as fast for 3.5-4x crits (at the 75 % crit cap). New caps:
  `CAPS.attackSpeed` 1.8 and `CAPS.critMult` 2.5 (`data/attributes.ts`). A levelled-only build at 30 sits
  at 1.8 / 2.4, so the ungeared campaign Shadow is unchanged. These caps also hit the other DEX classes
  (geared Windrunner and Iron Monk were at 2-20 s; now 11-42 s) and trim Aether a little.
- Boss fight in seconds, Shadow, before → after: Chimera 4 → 7, Centaur 5 → 8, Cyclops 5 → 6, Frost Jarl
  Reborn 5 → 12, Sphinx 14 → 15, Leviathan 6 → 19, Void Dragon Reborn 4 → 22, Hydra 13 → 21, Elder
  Dragon 3 → 19, Demon King (campaign, geared 30) 4 → 7. Pyro for comparison: 28-93; Blood 40-87.
- **Decided (owner): a boss-only damage cut.** `SHADOW_BOSS_DAMAGE` 0.34 in `sim/combat.ts`: the hero's
  damage on a `rank: 'boss'` target is cut by the share of her active slots that are Shadowblade or
  Demonhunter skills (a pure Shadow kit deals 0.34x, a half-Shadow mix 0.67x, any other kit 1x). Normal
  enemies, champions and packs take the full blow, so campaign play outside boss fights is unchanged. No
  tooltip text changed. Boss fight in seconds, geared Shadow, capped → now: Chimera 7 → 22, Centaur 8 → 24,
  Cyclops 6 → 54, Frost Jarl Reborn 12 → 38, Sphinx 15 → 23, Leviathan 19 → 60, Void Dragon Reborn 22 → 61,
  Hydra 21 → 32, Elder Dragon 19 → 31 (mean 38 s). Demon King (campaign fortress, geared, top level) 7 → 32
  (Pyro 29, Blood 61, Aegis 68); ungeared, Shadow loses that fight before and after, as do Pyro and Aegis.
  Demonhunter (prestige): Leviathan 60 s, Elder Dragon 36 s (were 8-17), still within 0.75x its parents.
  The regression test now holds every fight at 18-75 s and the mean at 25-60 s. Change the constant to
  retune; 0.38 gave 19-60 s.

## Afterplay phase 6 (the Siege of Bastion): defaults chosen, change freely

- Entry: the fort's commander (Captain Hale, or Elder Mara when Oakhaven fell) has a "Let's man the walls."
  topic once B5 is done; it opens the siege window (tiers, wins, banked Marks, Ring the bell). The bell is a
  banner on the world map's fort node and on its card ("Siege!"), not a prop in the fort town: the town
  generator is untouched. A bell prop stands in the siege's own yard instead.
- The story's siege (B5's `siegeDue`) is fought on Normal and cannot be lost: the gate holds at its last
  splinter and a fallen hero gets up again on the spot. It is "held" either way it ends (`siegeHeld`), and from
  then on the siege is repeatable. The bell rings after every 2 invaded zone wins once the siege is held; a
  siege (won or lost) resets the count. Nothing is forced.
- The siege runs as an encounter (built behind the veil, Continue lands on the map at the fort, Retry fights the
  same siege again) on a colosseum-style visit with its own fixed map: the fort's wall across the top (built
  stone), the gate in its middle, a yard, three lanes joined by a cross way half-way down. A save slot taken
  mid-siege keeps the hero, not the siege (it is fought in one sitting).
- Enemy level: the hero's (never under 38) + 1, + 3 on Hard (and +30 % health), + 6 on Nightmare (+30 %
  health too, and two mythic elite pairs: cyclops brutes in wave 6, centaur raiders in wave 9, at 3× health).
  Nightmare opens with flag `brk10` or `riftAjar` (phase 7 sets them).
- Waves as §8.3; the fifth wave's captain rotates siege by siege: a centaur raider captain (4× health), then
  the Ember Lord Reborn (2.5×). The Siege Lord is the pit lord tinted infernal, named "Siege Lord", 6× health
  and +30 % damage, with two doom knights. Bosses and elites are champion elites (Marks), not boss-rank units:
  their bar is the siege HUD's, not the boss plate. Gargoyles "leap onto the walls" = they land in the yard at
  the wall beside the gate. Harpies go for the ballistas while one stands. Wave 8's sappers run at the
  nearest ballista (else the gate) and blow up (a ballista is destroyed; the gate loses 2.5 %); a sapper
  that blows up pays nothing. The fifth wave's captain, the Siege Lord and the elites come for the hero
  himself when he is within 16 m (a duel, not a race to the gate); everyone else fights whoever of the
  hero's side stands within 6.5 m, and otherwise the gate. Wave sizes are about 1.6× a first guess (17 to
  45 enemies a wave) so a wave lasts about 30-60 s against the reference player.
- Spawning: packets of up to 4 every 3.5 s while fewer than 28 (18 on a low device) are alive, militia counted.
- Numbers: the gate has 400 blows of a normal enemy of the siege's level and shrugs off half of every blow
  (oak and iron; a ram's and a sapper's land whole); the build phase is 15 s (Ready skips it), and there is
  one before wave 1 too; a siege starts with 5 Marks in hand. A ram has 6× a normal enemy's health, walks at
  1.15 m/s and takes 3.5 % of the gate every 3 s at the gate. A ballista bolt hits for
  30 % of a normal enemy's health and pierces 3, every 2 s, 17 m reach. A cauldron's patch burns for 3.5 % of
  a normal enemy's health per half second plus a burn, for the rest of the siege. A barricade is the doc's flat
  400 health or 20 s (enemies pressed against it chew it down). Militia are two of the Sovereign's royal guards
  (the hero's own minion stats), at most four alive.
- Placement: each placed defence goes to the first free lane, the middle one first (no lane picker); three
  ballista platforms and three cauldron stands stand in the field from the start, empty until built.
- Rewards: a win's purse is §11's 4k/6k/9k at level 45, scaled by level like a finale's purse; XP is 1/1.3/1.6
  of a level; one tier 5 (Normal) or tier 6 (Hard, Nightmare) piece not owned yet. "Triple the purse" is not
  offered on a siege (its purse is sized already). No gold is lost on a defeat. Kills pay ×2.2 XP.
- Things that do not exist yet are kept as hooks: Demonglass won is counted in `meta.siege.glass` (phase 8
  adds the material); the milestone items (Bastion Banner, Wallwarden's Plate, Gatebreaker, Crown of the Last
  Bastion) are owed in `meta.siege.owed` and handed over once phase 8 defines them (`claimOwedSiegeItems`,
  not yet called on load); the fifth passive slot is the world flag `fifthPassive` (`fifthPassiveOpen()`),
  but the loadout still has 4 passive slots: wiring the 5th into the skill bar is open; the Demonhunter trial
  key is the flag `demonhunterKey` for phase 10. Banked Marks have nothing to buy yet (fort banner colours,
  Demonglass: a later shop).
- Second wind (rewarded) is offered in a siege when the hero falls (not when the gate falls). No other ad
  placement was added; the interstitial comes on Continue after the result screen as everywhere.
- Music and sounds: the siege plays the colosseum's track; horn, ram, ballista and gate sounds reuse synth
  recipes (`alert`, `bossIntro`, `shootBow`, `hitHeavy`). The siege track and its SFX are P11's.
- Defence icons are glyphs (range, flame, shield, squad, anvil) until the painted set.
- Balance (`tests/game/siegeBalance.test.ts`, the reference bot at level 40, geared, going for rams, buying
  repair under 75 % then ballista, militia, cauldrons, a barricade, and skipping every build phase): Normal is
  won by Aegis, Pyro and Blood in 10 / 6.5 / 8 min with 46 / 80 / 78 % of the gate left; Hard is lost by all
  three (waves 5, 9, 8). With the 15 s build phases a player's Normal siege runs about 9-12.5 min (§8.1 says
  12-15). Whether Hard is too hard for a human is open.

## Afterplay phase 7 (Sphinx, Leviathan, Hydra, Elder Dragon, story B6–B10): defaults chosen, change freely

- Sphinx: the riddle's plates are coloured glowing discs on the floor (sun gold, moon silver, eye violet, wave
  teal), not solid props and not the zone generator's `plates`. Four symbols at 60 %, five at 30 %; 16 s to step
  the sequence (too slow counts as wrong); sand blades sweep every 3.2 s while stepping. No wings on her rig yet
  (a sand-gold lioness with a lapis headdress).
- Leviathan: the flood is a water sheet within 13 m of its home that slows the hero by half (a dodge roll is not
  slowed); the six islands are one-cell rocks (solid: you shelter in their lee, you do not stand on them). It moves
  under the water to the island nearest the hero. The tidal wave comes every 14 s (12 s from 60 %) with one gap
  near the hero. Islands sink every 6 s from 60 %, never the last two. "Mash to break free" is not built: the
  grab simply holds 2 s. The Leviathan Scale's water walk is only the flag `leviathanScale`.
- Hydra: every blow lands on the weakest head (each 6 % of the body's health); any fire blow, a burn tick
  included, sears one stump; a brazier is knocked over by the Hydra's own slam (lure it), leaving a 12 s burning
  patch that sears every stump of a Hydra standing in it. 0 heads: dazed and open 6 s at +50 %; a round never
  takes the body past a phase line (at least three rounds); new heads rise 2.5 s untouchable. Cap 7 heads on
  every device (the sim does not know the low tier, so the doc's 5 on low is not built). Heads are not drawn
  one by one: the rig is the dragon without wings.
- Elder Dragon: four phases (70 / 40 / 15 %). In the air it hovers over its field and breathes down lanes
  (three per flight, then lands dazed 4 s, 13 s on the ground, up again); the three rune stones rise at 70 %. The
  void ring closes from 15 m to 9 m at 40 % and holds to the end. At 15 % it hangs rooted and takes +25 % for
  30 s; if it lives, it heals to 30 % and phase 3 goes on (as often as needed). Recolour plus the dragon's
  horns; no extra horns or flame mane yet.
- Story: B6 Crags+Mines at 42, B7 Tundra+Temple at 46, B8 Citadel at 50, B9 Fortress at 54, B10 Peak+Rift at 57
  (the Elder Dragon is in the Rift, as `data/invasion.ts` has it; Dragonspine Peak only has to be purged). The
  siege is not a gate for B6. Each step is told on the world map as B1 is (two lines by its speaker); B7's
  speaker is the Oracle if `oracleFreed`, else the new Sunken Priest; B9's is the Arch-Demon's ghost if the
  throne was claimed (`endUnbound`), else Madam Ash. The ghost uses the Arch-Demon's own voice, no FX chain.
- Rewards are flags only until their phases: `infernalForge` (B6), `oracleLens` (B7, nothing on the map yet),
  `leviathanScale` (B8), `hydraKey` (B9). B10 sets `brk10` (opens Nightmare); the decision (`quest.seal`, put by
  the Chronicler on the map after the win) sets `riftSealed` or `riftAjar`. "Sealer of the Rift" is a toast
  only (the game has no titles); there are no credits roll and no colosseum demon waves yet. Boss uniques and the
  mythic Heart / Dragonbone Greatsword stay phase 8. The fort's rumour lists still end at the siege.
- Voice core: to stay at the 300-line cap, the four bosses' mid-fight barks, the fort's three "dragon is dead"
  lines and the hero's two seal answers are English-only (excluded in `data/voice-core.json`).
  Changed in phase 10: the owner raised the cap to 320, so these 13 lines are core again (the `exclude` list
  is empty) and were voiced in de, fr, es, ru, ja, pt, zh with phase 10's VO job.
- Balance (bot at the band's top, geared): Sphinx 81 / 60 / 62 s (Aegis / Pyro / Blood), Leviathan
  112 / 60 / 81 s, Hydra 106 / 28 / 87 s, Elder Dragon 101 / 44 / 68 s.

## Afterplay phase 8 (items, materials, capstones): defaults chosen, change freely

- Boss uniques: the 14 named pieces of §5 (two per new boss, a set), tier 6 at the boss's level (37–57), the
  Elder Dragon's pair tier 7 (mythic). Budgets grow past the legendaries' with level. They drop only from the
  invaded finale: the first kill hands over both plus 3 Mythic Ichor (the Chimera also its 600 Demonglass), a
  repeat kill one piece in five and 1 Ichor. Kept out of shops, gamblers, chests and the campaign's finales.
  There is no flail kind: the Many-Headed Flail is drawn as a hammer. "Eye of the Deep: +crit vs dazed" is
  +8 % crit and Crumble (more damage to slowed/knocked-down foes), since the game has no "dazed" for players to read.
- Set bonuses: the game has no skill schools, so "+20 % to one skill school" is each set's element raised
  with a modifier that exists (Chimera spell crit + crit, Centaur pierce + attack speed, Cyclops Crumble,
  Sphinx cooldowns, Leviathan Shatterpoint, Hydra burns, Elder Dragon +15 % damage).
- Mythics: only four are named anywhere (Gatebreaker, Crown of the Last Bastion, Heart of the Elder Dragon,
  Dragonbone Greatsword); the "seven" of §2.4 is short three, not invented. Bastion Banner (an off-hand tome,
  +5 % minion damage/health/speed: there are no "allies" besides minions) and Wallwarden's Plate are tier 6.
- Infernal twins: one for every campaign unique (45 pieces), id `<id>Infernal`, +30 levels, attributes,
  armour and the flat pools ×1.9 but effects (percentages, procs) unchanged, and one of 8 demon affixes taken
  in turn (more damage to demons / mythic beasts / pylons, life from demons, less fire / shadow / demon damage,
  extra Demonglass). Icon: the original's, filtered red-black. Name: "<name> · Infernal", derived per locale by
  the locale loader (no second copy of 45 names in 39 files). They drop in invaded zones (a tenth of the pieces
  that drop, hashed so the fight's dice are unchanged; a Reborn finale drops its zone's boss twins), are sold
  by the fort's tier 4–5 shops after B6 at 3× price, and a smith in any town remakes an owned unique as its
  twin after B6 (1.5k–14k gold by tier + 40 Demonglass). The original goes into the fire; the twin keeps its
  upgrade levels, heroic ranks and slot. The count is kept (`inv.infernalForged`) for the Hexsmith (phase 10).
- Heroic+: the smith's gold levels have had no top since #149, so "+6..+10" became five Heroic ranks on top
  of them (afterplay only, worn pieces, in a town): +6 % attributes/armour each, 8k/14k/21k/30k/40k gold,
  20/35/50/70/100 Demonglass, and 1/2/3 Ichor for the last three.
- Materials: Demonglass and Mythic Ichor live in the ore pouch (cap 9999, never mined, no recipes) and a
  smith buys them (60 / 900 gold). A demon slain in an invaded zone leaves 1 (Glassfinder: a chance of 2), the
  pylons' chest 10, a siege win its 50/80/120 straight into the pouch. Not shown on the result screen yet (the
  bag's Ore tab shows them).
- Marks shop: the siege window trades 5 banked Marks for 25 Demonglass. Fort banner colours are not built
  (the fort has no banner prop to recolour).
- Hooks: on every load the profile hands over what is owed (`claimAfterplayDues`: owed siege pieces, the old
  `meta.siege.glass`, the Leviathan Scale for a save with B8's flag, given once even if sold). The fifth
  passive slot appears in every loadout row (skills page, trainer) once `fifthPassive` is set; a 5th passive
  without the flag is dropped on load. B6 `infernalForge`: Infernal smithing and stock. B7 `oracleLens`: an
  invaded zone's map card names its boss and shows its two pieces. B8 `leviathanScale`: the Scale (body
  armour) is put in the bag; its "water walk" is "the Leviathan's flood does not slow you" (rivers stay solid:
  walking on them would need the grid and the pathing changed). B9 `hydraKey`: the invaded Rift opens only
  with the key ("opens the Rift's heart"), so it now also waits for level 54.
- Capstones: the 16 of §2.3, level 45, 15k, no ranks, each its class's top signature skill run with far larger
  numbers (Bastion Wall = Retribution, Cinder Sun = Cataclysm, …). The Frostwarden's is "Endless Winter": its
  level-28 skill is already called Absolute Zero. "Only at the fort, only by a rescued trainer": the four
  classes whose teachers were rescued (Aegis, Pyromancer, Shadowblade, Geomancer) learn it only at Bastion
  Crossing; the twelve whose teachers were never taken learn it from their own trainer at home. No capstone
  tome token (the Chimera's) is built. Icons: the signature skill's, in a gold ring, until painted.
- Not built: fort shop stock "scaled to hero level" (the fort keeps tiers 4–5), any balance pass on the new
  items with the bot.

## Afterplay phase 9 (fair mini-games): defaults chosen, change freely

- Three games at the fort's fair corner, each with a new barker who appears with the other gamblers
  (`rescuedGamblers`): Pip (Whack-a-Imp), Old Bess (Ring Toss), Hob the Forgemaster's apprentice (Arm-Wrestle).
  The Fishing Derby is not built (no fishing). Rules in `game/fair.ts`, purse in `state/fair.ts`, windows are
  DOM/CSS modals (one rAF loop, transforms only, pointerdown taps, 1–9 / Space keys). No 3D props (barrels,
  wooden hydra, arm table) in the fort yet: the existing gamblers have none either; they belong to the art pass.
- Fee for every game: `20 + 3 × level` gold, rounded to 5 (155 at level 45). A plain win pays the fee doubled.
- Top prize (§11): 600 gold at level 31 rising to 1,200 at 60, a tenth of a level of XP, 10 Demonglass, plus a
  rare (tier 3) trinket not owned yet (Whack-a-Imp, Ring Toss) or 1 Mythic Ichor (Arm-Wrestle; Ichor is taken
  as the "Heroic+ material"). Demonglass and Ichor go straight into the pouch (phase 8's `addOres`).
- Cap (Q9): each game pays its top prize in full 5 times, then the top prize is its gold only until 5 more
  zones are won (any zone win counts, invaded or not). "Full-prize plays" are counted as top prizes, not as
  every round. The Arm-Wrestle discount is also withheld while capped.
- Whack-a-Imp: 3 lives; 3 wins in a row for the top prize. Imps every 0.55 s down to 0.35 s; gold imps 12 %
  (+4 % per win in the row).
- Ring Toss: 5 rings, 3 heads at three distances swaying across the middle; a head takes a ring within ±0.09
  power of its distance and within 30 % of its sway from the middle. Ringed heads in a row score 1, 2, 3…
  (perfect = 15). Score 3+ returns the fee, 6+ pays ×2, 10+ ×4, 15 is the top prize. A perfect round sets
  the flag `ringPerfect` (with the Leviathan: the Tidecaller, phase 10) even when the prize is capped.
- Arm-Wrestle: beat 0.9 s down to 0.6 s by the row; window ±0.08 s, Strength adds up to +0.06 s at 300 total
  Strength. On-beat tap +12 %, off-beat −8 %, a beat let pass −5 %, 30 s limit. Third win in a row: 20 % off the
  smith's upgrades until the cap next reopens (5 zone wins); fifth: the top prize and the flag `armStreak5`
  (the Hexsmith's "streak 5", phase 10).
- Leaving a game mid-round loses it (Ring Toss: untossed rings count as misses).
- Barkers' talk: hello (with the rules), who, the game, a parting line. No hero topic of their own, so no new
  hero lines. Their 24 lines are voiced in English only (not core; the core list stays at its cap).
- SFX reuse existing sounds (hitBlunt, block, swing, coin, lootRare); the doc's "4 mini-game SFX sets" are
  left for the audio pass.

## Afterplay phase 10 (the prestige classes): defaults chosen, change freely

- The four hybrids (Demonhunter, Dragoon, Hexsmith, Tidecaller) are full `ClassId`s (20 in all), but kept out
  of `CLASS_IDS` / `SKILLS` (the sixteen with twelve skills each), like the capstones: `PRESTIGE_IDS`,
  `PRESTIGE_SKILLS`, `ALL_CLASS_IDS`. No capstones for them (the doc defines none).
- Kits (two actives, one passive, hero levels 40/41/43, not cut by the skill level scale):
  Demonhunter: Hunter's Mark (holy bolt, target +20 % damage taken, a demon +40 %), Demon's Bane (passive
  +25 % vs demons, −15 % from them), Silver Volley (line, +50 % to demons and the marked).
  Dragoon: Skyfall Leap (0.8 s out of reach, then lands with a knockdown), Dragon Blood (+12 % boss damage,
  +8 % health, no knockback), Dragon Lance (spear line).
  Hexsmith: Hex Turret (a turret that drains the nearest foe each second, 40 % back as health), Soul Forge
  (passive health, regen, reduction), Hex Bolt (costs 8 % health, heals 30 % of the hit, weakens).
  Tidecaller: Tidal Wave (line, knockback, soak = slow, so Shatterpoint/Seaborn read it), Seaborn
  (passive +15 % vs chilled), Undertow (whirlpool that pulls in).
- Bars: the trial passed AND a skill of each parent known (`learnBlock` 'trial' / 'parents').
- Trials are derived from the save, never stored: `demonhunterKey` (siege); `dragonDeathless` (new flag:
  Elder Dragon killed in a visit with no Second wind taken); Hexsmith = 5 Infernal forgings + `armStreak5`;
  Tidecaller = `leviathanSlain` (new flag, or `brk8` for older saves) + `ringPerfect`. Old saves that
  already did a deed get the class at once (except the deathless dragon, which old saves cannot prove).
- The Mysterious Wanderer stands in the fort (by the inn) once any trial is passed (derived `wandererCame`),
  one NPC teaching all four: the trainer window grows class tabs. A toast announces him after the visit
  that passes a trial (a siege or boss win); trials passed in town (fair, forge) just make him appear.
- The class grid on the skills page hides a prestige class until its trial is passed.
- Icons: each prestige skill reuses a parent skill's drawing in the class colour; the four class emblems
  get their own painter sheet (`sheet-icons-prestige`, blurbs ready, not painted yet).
- His talk: hello, who, trial (what the four deeds are), train, and one line each for the rift sealed /
  ajar. Voiced in English only (not core).
- Balance: the reference player is held to its parents (wins, boss fight < 120 s, no quicker than 0.75 ×
  the faster parent). Boss fights (Leviathan / Elder Dragon): Demonhunter 8 / 17 s, Dragoon 59 / 32 s,
  Hexsmith 23 / 25 s, Tidecaller 62 / 45 s. Note the existing Shadowblade already kills both in 6 / 3 s:
  it sets the quick end, and the Demonhunter follows it (worth a look in a balance pass).

## #153-#155 (dialog truce, tutorial potion stop, boss chevrons and mercy): defaults chosen, change freely

- **#153 What "invincible and untargetable" means.** A conversation sets a
  truce flag on the hero (`sim/truce.ts`): he counts as out of reach (no blow
  lands, no foe picks him, nothing asleep wakes on him) and no status a foe
  casts lands. It is set and lifted only in `ZoneMode.setTalk`, which every
  end of a conversation goes through (goodbye, a decision, travelling away).
  A window a conversation opened (a shop) keeps it until the talk ends.
- **#153 Watchdog.** Every 3 s: a hero under a truce while no conversation and
  no window (`flow.talk`, `flow.modal`) is open has it lifted, with a console
  warning. Plain menus (pause, character) do not make him untouchable.
- **#154 Once a visit.** The potion stop comes the first time the hero drops
  below 35 % with a flask in stock and off cooldown, in the opening fight only.
  It does not come again in that visit (it teaches the flask; it is not a
  pause). While it holds the world is frozen; the pause menu still opens; the
  flask button, a click or Q is the only order taken.
- **#155 "Shield Bash" is Shield Slam** (`shieldSlam`, the starting stun), and
  the "tutorial boss" is the opening fight's finale leader, the Bandit Chief
  (an elite, not a boss rank).
- **#155 Chevrons.** The gold ground chevrons lead along the walked way to the
  Bandit Chief whenever the hero is out of a fight in the opening level, the
  dummy is done and the Chief has not woken. They stop once the fight starts.
- **#155 Struggling**, counted from the moment the Chief wakes: the hero fell
  in the fight, or he has lost a full health bar in it (potions included, so
  what was poured away counts), or after 60 s the Chief still has more than
  half its health. The health and time tests wait 10 s. **Not using Shield
  Slam often**: fewer than one cast per 20 s of fight. Both true: every enemy
  blow in the visit lands 65 % lighter (`sim.foeHitMul`), once, logged to the
  console with the numbers (`[tutorial] the boss shows mercy`).

## #156 (the rescued teachers' camp past the tutorial boss): defaults chosen, change freely

- **Where the camp is.** Up the screen from the Bandit Chief's floor, joined
  to it by a worn way: a round of open ground (radius 5.2 cells, about 45 %
  of the boss floor's area) cut into 18 rows of rock added above the first
  visit's chain. The chain itself, its packs and its edge are exactly as
  before (the opening-fight balance specs are unchanged); later visits to
  the plains have no camp.
- **The big cage** is the place's `cage` chest, three cells wide, its door in
  the middle cell, drawn in wood. The golden key lies two steps in front of
  the door, on the way in. The cage opens only once the boss is down (before
  that a tap on it shows "Locked", like the finale's chest before its fight).
- **Who is in it:** Ser Aldric (Aegis, the speaker, in the middle), Ember Wren
  (Pyromancer) and the Soul Warden master. The roadmap's "Pyromancer from
  Sunford" is `trainerPyro`. Nettle (Shadow) walks from wherever she stands
  to the fire as soon as the boss falls; if she never came into the opening
  (the hero already knew her skill) she steps in at the camp's edge and walks
  over. A walk that is held up longer than 30 s ends with her blinking in.
- **The thanks** is one voiced bark over the knight's head as they step out
  (`dlg.bark.trainerAegis.freed.1`, in the core voice list), not a
  conversation. Left shut, nobody says anything and the three stay behind
  the bars until the hero leaves.
- **"Only teaching dialogs":** a rescued teacher in the camp opens the
  trainer's window straight away (no greeting, no topics). Nettle keeps her
  own short teaching talk. Their Sunford conversations are untouched, so the
  first "hello" in town is still their first meeting there.
- **The free lesson** is the first skill bought from any of the three rescued
  teachers in the camp (price 0, the base struck through), once per save
  (`profile.tips.campGift`). Nettle's own gift (Shadowstep) does not spend it,
  and she does not give the camp's free lesson. Ranks are not covered.
- **Moving to Sunford** needs no state: the four are in Sunford's list
  unconditionally, so leaving the first visit, cage opened or not, finds
  them there. The camp's chest is saved as `plains:camp`, never as
  `plains:cage`, so it frees no peddler.
- **The caravan** is a new set piece (`wagon`, 2 × 3 cells): a heavy bed on
  three wheels, the fourth fallen beside it, a stone under that corner, torn
  canvas, a crate, a barrel, the snapped shaft and a spilled sack.

## Afterplay phase 11 (the integration pass): defaults chosen, change freely

- **Under-levelled danger (GDD pillar 3) came back with an "outmatched" rule.** The balance spec (16 classes at
  level 4 in the Crags, at most 1 may win) had failed since commit 5653cb3: 4–5 classes won. No single change
  caused it (bisected: enemies, items, zone shapes, bot, mana costs and elixirs each moved it by one). New rule in
  `sim/spawn.ts`: a foe more than 4 levels above the hero hits +15 % harder per extra level (`OUTMATCH_FREE`,
  `OUTMATCH_STEP`). Zones near the hero's level are untouched, and every reference-curve spec still passes. Now
  0 of 16 win.
- **A charged blow (#147) on a structure is a plain heavy blow**, not a share of its health. The siege gate
  (and ballistas, the escort caravan) took 40–55 % of their health per elite cone, so the bot's Aegis lost a
  Normal siege in wave 10 (gate 53 % → 0 in 43 s). It holds again (the siege spec passes for Aegis, Pyro and Blood).
- **The Hydra's headless window is 7 s** (was 6). A geared Aegis took 124 s on the Fortress boss (the limit is
  120): with no fire it cannot sear stumps and lives off the open window. The limit was left as it is.
- **White on the blue tone:** `blueContrast.test` wanted white on `--bc-blue` at 4.5:1, while the owner's
  `blueTokens.test` pins the light blue (#3fa4ff, 2.6:1 with white). The owner's blue stands. The test now
  checks what carries the label: its ink outline (white on ink, ink on the base and the lit band at 4.5:1, the low band at 3:1).
- The Poki zip is `dist/battlecross-poki.zip` (the owner's rename); the stale test was updated. Hex colours in
  FTabs, ItemCard and SiegeHud now use theme tokens (FTabs' masks use `black`).
- **Siege HUD on a phone held upright:** the gate bar and the wave and Marks row now sit under the zone card and the
  objective chip (they were behind them).
- **Chevrons (#155) with the camp (#156):** across 30 seeds the Bandit Chief is the only boss group, and the way is
  always found. The path search is 0.01–0.1 ms, every 0.4 s.
- **Voice re-judge is not broken.** The 19 lines still failing really fail (wrong words heard, or too long). The
  earlier "23 would pass" were shipped by the `voice:gen` run between the two passes (36 → 19 failing). Core
  coverage of 314: de 312, fr 305, es 312, ru 312, ja 314, pt 310, zh 314. No GPU retry was run: each of those
  lines already has 2–24 failed takes.
- `levels.test` "visits differ" times out (30 s) under a full parallel run and passes alone (48 s of work on a
  busy machine). Open: raise its timeout or split it.

## #Perf1-#Perf3 (slow PowerVR / Mali phones, fractional pixel ratios): defaults chosen, change freely

- **The resolution stays native on every device.** The fill cost of DPR 1.875-2
  on a PowerVR GE832x is real (an emulated phone drew a frame in ~33 ms at 1×
  and ~66 ms at 1.875×, SwiftShader), but the house rule wins: never below the
  screen's own ratio. The other costs were cut first: a weak GPU now starts on
  the effects ladder's last rung (no scenery outlines, half the particles, no
  motes: -30 % GPU frame time in the emulated tutorial). **Open:** if the next
  Poki playtests still show a GE832x under ~20 fps (the new `perf_sample`
  events say), the remaining choice is a 1.5× cap for that one GPU family
  only, which the sharpness rule forbids today. Say if you want it.
- **The see-through dither stays.** Its `discard` turns off a PowerVR's
  hidden-surface removal for the scenery that uses it (one baked material for
  all of it); measured ~10 % of the emulated frame, likely more on a real
  tile-based GPU. Splitting the bake into "see-through" and "plain" kinds (a few
  more draws per tile) is the next lever, not done blind: wait for playtest
  numbers.
- **Background loads wait while play runs under ~30 fps.** The screens' code,
  town code and early art (~140 loads, ~520 kB of script) no longer run on the
  idle callback's 2.5 s timeout during the first fight; they come in real idle
  periods or when the loop pauses (menu, result, map). A window opened before
  its chunk arrived loads it on open (`idleNow`), as before. Possible cost: a
  first-time slow-phone player may wait a moment on the first map or trade
  window.
- **A weak GPU on a desktop (Intel HD 4600) also starts without scenery
  outlines** and climbs back after 8 s of fast frames. At a ratio below 1×
  (a zoomed-out desktop) it now gets MSAA, since the buffer is small there.
- **Telemetry:** `perf_sample` analytics events (Poki `customEvent`) at 30 s
  and 120 s of play: fps, first steady second, rung, tier, DPR, buffer, CSS
  size, draws, triangles, cores and the GPU name. `?perfhud=1` shows the same
  on screen in any build.

## Glitch banner image (3840x1240) is blurry
The current banner is an upscale of a 1376x444 painting and fails the blur probe (BLURRY 0.052). Options: paint a new wide master at 3:1, at least ~2.5k wide (e.g. Gemini, clash scene) and rerun the cover script, or upload it as is. Portrait covers in store-art/covers/glitch/ are SHARP.

## 44 voice lines fail QA after two retries (2026-10-21)

de 26, fr 7, ru 4, pt 4, es 2, ja 1 (list: the failures in the last `voice:gen --retry 2` run; voice-todo.md shows the counts). They play as silent bubbles. About half fail only because Whisper mishears invented names (Chronoweber, Ägis, Sunford), so the take may be fine; the rest run 1.5× too long or slur. Options: listen and mark good ones `LOOSE`, add respellings in tools/voice/collect.mjs and regenerate, or ship them silent.

## iOS full-version unlock: reviewer shortcut and a device test (2026-10-26)

The demo/unlock is built (`app-store-submission.md`, "In-App Purchase") but was written without a Mac: the Swift plugin is uncompiled and no purchase was ever made. Two things only you can settle. (1) App Review starts a fresh save and has to play to the Goblin King to see the offer; do you want a reviewer shortcut (for example a long-press in Options that sets the Goblin King's flag), or accept the few fights? In effect: no shortcut. (2) Run one TestFlight build through the "How to test" list before the iOS submission.
