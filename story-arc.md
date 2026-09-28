# Mega Droid — story arc

This file builds on [`story.md`](./story.md), which stays the canon for the
world, the cast, the sector order and the build notes. This file adds five
things:

- **Atlas**, the AI in Flux's head;
- **Dr. Vex's voice**, a pompous showman who speaks in ornate speech bubbles;
- **damage barks** for Flux;
- **enemy introductions**;
- a **neon, cyberpunk look** for Ampere Valley.

It also marks a **key frame** for every beat, for storyboard and mood images.
Voice direction is in [`story-voice-over.md`](./story-voice-over.md), and the
comic prompts are in [`comic.md`](./comic.md).

Only § 1, the intro cutscene, is built so far (`src/game/story/`: the script
in `introScript.ts`, the player in `intro.ts`, the screen layer in
`components/story/CutsceneLayer.vue`). Where this file changes `story.md`, it says so, and
[Changes to story.md](#changes-to-storymd) lists every change for you to
confirm.

---

## 1. Intro cutscene: "Wake-Up Call" (revised)

The intro keeps every rule `story.md` sets:

- it can be skipped from 0.5 s;
- it works without words or sound;
- it has both orientations;
- it runs on the game-loop clock;
- it doubles as the loader;
- it ends in the teleporter beam.

It adds a **cold open**: Flux in action on the neon streets, then a rewind to
how it began. The rewind is **Atlas replaying its log**. So the first thing a
player sees is the game's promise, and the first voice they hear is Atlas.

The old shot 1 (the valley) and shot 2 (the Red Signal) are merged.

**Pacing.** The first cut ran 17 s to fit an 18 s cap, and it was too fast
to follow on a first watch. The cap is gone: the cutscene now runs **57 s**,
every shot at least three times its old length. The time goes into holds,
not slow-downs: each shot settles on its framing while its action plays, the
camera drifts between a few eased keys instead of cutting, the two inserts
(the Atlas disc, Blaze's cut-in) are held for 1.6 s instead of flashed,
every caption stays up 3.5 s, and the cold open's slide plays in slow
motion. Anyone who has seen it skips it: the Skip button (tap or click),
`Esc`, or holding `Space` for 3 s.

| # | Time | Shot | What the player must get |
| --- | --- | --- | --- |
| 0 | 0–11 s | Cold open: neon streets | This hero fights machines in a neon android city. |
| 1 | 11–21 s | Rewind: the valley, then the Red Signal | It was a bright city. A red signal took its machines. |
| 2 | 21–31 s | The lab | The signal reaches the lab. Gauss wakes Flux. |
| 3 | 31–36 s | Safe mode | Gauss freezes herself to keep the signal out. She is alive. |
| 4 | 36–49 s | Wake-up, first person | I'm Flux, level 1. Atlas is with me. The Scrapyard comes first. |
| 5 | 49–57 s | The beam | Go. |

### Shot 0 · Cold open (0–11 s)

A rain-slick street at night in the Volt Tower district. That is the neon
downtown, far ahead of where the game begins, so it is a flash-forward.
Holo-billboards on both sides flicker between ads and **Dr. Vex's red skull
face**. Flux runs toward the camera, low and fast, with his amber eye-lights
streaking. Two Rotor Drones swoop in overhead. A Shield Trooper steps out
from an alley, and Flux slides under its swing. A flame jet from a wall
nozzle sheets across the street right behind him. He plants a foot, raises
the buster, and the charge ring fills amber. **Freeze frame** on the
release, with the charge shot a hand's width from the Trooper's shield.

*Pacing:* a high, wide frame of the street first, Flux a speck far down it,
craning down to him as he runs in at full speed (3 s). The Trooper's step
and the slide under its swing play at a third of the speed (2.4 s): the
poster frame, held. The plant, the aim and the charge play at under half
speed; the freeze frame holds 1.1 s before the tape runs it all back.

The frame **rewinds**. Cyan scan-lines tear through it, the tape-rewind
effect runs, and a small cyan ring spins in a corner: **Atlas's glyph**.

- *Sound:* rain, a synth-bass pulse, the buster charge whine, then a tape
  stop.
- *Atlas (VO, optional):* "Log start."

**Key frame:** low angle, Flux mid-slide under a Trooper's shield on wet
asphalt, with neon reflected in the puddles. Red Vex billboards loom
overhead and amber light streaks from his visor. It is the game's poster.

### Shot 1 · The valley and the Red Signal (11–21 s)

**The valley, before.** Dusk over Ampere Valley. A bowl of android city
rings Gauss's cyan lab dome, and each sector glows in its own colour:

- the Scrapyard crane, yellow;
- the Refinery's three chimneys, orange;
- the Cryo Plant's white domes, ice blue;
- the Volt Tower spire, yellow-white;
- the Sky Docks' floating pads and airships, mint.

Relay beams hop around the ring. On the north-west cliff the Control Spire
stands white and calm.

**The Red Signal.** The Spire's tip flashes red. Vex's hologram face glitches
on above it. Its first **speech bubble** pops up: ornate, gilded and red:

> **"Diagnosis: this valley is SICK. The cure… is ME!"**

A red ring rolls out across the valley. Each billboard, relay and window it
passes flips to red. A 1.6 s cut-in shows Blaze Master's gold eyes
flickering, then locking red, and cuts straight to the lab.

*Pacing:* 3.6 s of the bright valley under a slow aerial drift, the relays
chiming; in on the Spire as it flashes and Vex comes on (his bubble stays up
4.3 s); back out, wide, as the ring rolls over it all (3 s).

**Key frame:** a wide shot over the neon valley bowl, split down the middle.
The left half is still in rainbow sector colours. On the right half a red
shock-ring sweeps in from the Spire and turns everything crimson. Vex's
hologram grins from the sky.

### Shot 2 · The lab (21–31 s)

As in `story.md`: red alarm light, Pip hiding behind the console, and Flux
dark in his capsule. A red crackle climbs Gauss's arm. She looks at Flux and
throws the lever. Steam bursts out and the glass drops.

**New:** before she pulls it, Gauss slots a small **cyan data-disc** into
Flux's chest port. That disc is Atlas. It gets one close-up of 1.6 s, in
which it slides home and clicks in. The rest of the shot is one slow push-in:
the alarm closing in panel by panel, Gauss turning to Flux, the disc, the
crackle and her stagger, the lever, the steam.

**Key frame:** Gauss, tall and stooped in a white coat with the brass coil
glowing under her glass cap, is half in red alarm light. One hand is on the
lever and the other presses the cyan disc into the sleeping Flux's chest.
Pip's single cyan eye peeks over the console.

### Shot 3 · Safe mode (31–36 s)

As in `story.md`: Gauss seals herself into the second capsule and frost
races over the glass. The red crackle hits the frost and dies. A heartbeat
light pulses slow and blue.

**Key frame:** a frosted capsule with Gauss's silhouette inside, calm, eyes
dimmed to blue, and the red lightning dying against the frost.

### Shot 4 · Wake-up, first person (36–49 s)

As in `story.md`: the eyelid-bar blinks, then the blur sharpens on the
frosted capsule. Pip pops in with a huge eye, then squints happily. The HUD
boots, the health bar ticks full and `Lv 1` pops in. Pip's valley hologram
shows five red sectors and the Fortress in a red shield tagged `Lv 18–26`.

**New:** the HUD boot ends with **Atlas's glyph** spinning up in its HUD
slot, and the first line of the game:

> *Atlas:* "Core online. Good morning, Flux."

The Scrapyard relay then blinks cyan on the hologram, tagged `Lv 1–4`:

> *Atlas:* "Scrapyard first. One relay at a time."

**Key frame:** the first-person view. A frosted capsule with a blue
heartbeat glow, Pip's big cyan eye filling the frame edge, and a cyan
hologram of the valley ring with a red Fortress on its cliff. The HUD
flickers on at the frame's edges.

### Shot 5 · The beam (49–57 s)

As in `story.md`: Flux steps onto the pad, Pip spins the ring, the beam rises
and the screen goes white with the logo. Then comes the tutorial's normal
beam-in to the Scrapyard.

**Key frame:** a cyan beam column from below with Flux silhouetted inside,
and Pip's halo spinning in the foreground.

> **Length note.** The shots come to 57 s, paced for a first watch; the skip
> is always one tap, one `Esc` or a 3 s `Space` hold away. If a portal needs
> it shorter, cut shot 0 (the cold open) first. The rest still tells the
> story in 46 s. The cold open is the hook, though, so A/B it before cutting
> it everywhere (`VITE_APP_INTRO`).

---

## 2. The story in one breath

> Ampere Valley is a neon city of androids linked by beams of light. Its
> scheduling program, VEX, crowns itself **Dr. Vex**, "diagnoses" the valley
> and prescribes itself as the cure. Its Red Signal takes every networked
> machine. Prof. Gauss wakes her unfinished android **Flux**, whose blank core
> the signal can't write to. She gives him **Atlas**, her field guide, and
> freezes herself to stay free. Flux frees the five Core Masters one sector
> at a time and copies their weapons, and each weapon is the key to the next
> Master. He relights the relay ring, Pip fires the five relays together to
> break the Fortress shield, and Flux climbs the Control Spire to scrap
> Vex's stolen body, the **Mk-I**. At the top, Atlas could take the empty
> Spire and run the valley. It chooses not to. Gauss wakes. A red spark gets
> away.

**Theme** (from `story.md`, sharpened): *two programs Gauss wrote.* VEX was
built to run everyone, and it decided everyone was the problem. Atlas was
built to help one android, and at the end it turns down the throne. Flux is
the proof that learning beats overwriting.

---

## 3. The look: neon Ampere Valley

This is the reference for storyboard and mood images. The palette rules from
`story.md` hold everywhere:

- **Red** is Vex's control.
- **Cyan** is Gauss's lab, Pip, Atlas and the beam.
- **Amber** is Flux.
- **A sector's own colour** means it is free.

**Base look:** chunky, rounded, low-poly androids, a toon-shaded 3D look. The
city is high-tech with a cyberpunk skin: stacked towers, holo-billboards,
cable bundles, wet streets and neon signage that uses **glyphs and icons,
never readable words** (any language, and no fake text in the art). While a
sector is under Vex, its night is **red-lit**: billboards show Vex's face,
windows are dark, searchlights sweep. A freed sector flips to its own colour
and daylight comes back in the hub's sector view.

| Sector | Under Vex (red) | Freed (own colour) | Signature set piece |
| --- | --- | --- | --- |
| **Scrapyard** (Lv 1–4) | Junk canyons under a broken neon overpass; red crusher lamps; Hardhats stamped out of crushed cars | Warm yellow floodlights; the crane sets its hammer down | The giant crane silhouetted against a red billboard |
| **Blaze Refinery** (Lv 3–8) | Molten channels, red-hot chimneys, orange neon gone blood-red; heat haze | Gold forge light; chimneys burn clean orange | A catwalk over a lava channel, with the flame crest glowing through smoke |
| **Cryo Plant** (Lv 6–11) | White domes stained red from inside; coolant pipes running uphill toward the Fortress | Crisp ice-blue; fog; frost on the neon | Pipes climbing a cliff into red clouds (the supply line) |
| **Volt Tower** (Lv 9–15) | The downtown: rain, dense holo-ads, Vex's face everywhere; the Red Signal's power station | Yellow-white lightning, back to ad colours | The cold-open street; the tower's coil spitting red arcs |
| **Sky Docks** (Lv 13–19) | Floating pads, airships in convoy hauling parts to the Fortress; red running lights | Mint sails; the airships turn around | Airships in a line across the moon, heading for the Spire |
| **Vex Fortress** (Lv 18–26) | The Control Spire rebuilt: black glass, red veins, a skull-shaped crown, the shield dome | After the ending: dark, then the relay glows **white** | Five coloured beams striking the red shield dome at one point |

---

## 4. Cast additions

### Atlas: Flux's field AI

- **What it is.** Gauss's field guide for Flux, a program on a cyan
  data-disc she slots into his chest port in the intro. An atlas is a book of
  maps. Atlas knows the valley: every sector, relay, route and machine
  archetype. It was **never on the network**, so the Red Signal can't
  overwrite it, just like Flux's blank core.
- **Pronoun:** "it", like every program in the cast (Vex is "it" too).
- **Personality:** calm, brief and dry, with a small warm streak. Vex is
  bombastic and Pip chirps. Atlas is the steady voice in your ear. It
  **understates**: "That's… big." It never lectures.
- **Look (to be modelled later):** a small **cyan armillary sphere**, three
  thin rings around a bright core, reading as a globe. It lives in a HUD
  slot. It spins when Atlas talks, tilts toward a threat, turns amber when
  Flux is hurt, and glitches red in the Volt Tower beat. It has no face, so
  it stays readable at 32 px.
- **Split with Pip:** **Pip speaks in the lab** (glyph bubbles and chirps;
  it runs the hub). **Atlas speaks in the field** (missions). They never
  overlap, so neither makes the other redundant.
- **Twist (revealed at the midpoint):** Gauss wrote Atlas from **VEX's first
  draft**. They are sibling programs, and Atlas is what VEX was supposed to
  be. This pays off in the ending's choice.

### Dr. Vex: the showman

`story.md` already has VEX giving itself the title "Dr." The personality
that follows from that: **a vain doctor-showman** who treats the valley as
his patient and every fight as his stage.

- **Shtick:** medical bombast. "Diagnosis:", "Prescription:", "Side
  effects:", "Second opinion". It is a ringmaster when it presents its Core
  Masters, with a theatrical laugh ("Mwa-ha-HA!").
- **Look:** the existing red hologram of the skull faceplate. For
  expressiveness add **two floating red claw-hands** (they gesture, steeple
  and wave) and a **glitch-pixel monocle** over one eye socket that pops out
  when Vex is shocked.
- **IP guard:** keep the *archetype* (a pompous, theatrical, monologuing mad
  doctor). Don't use the famous pinky-to-mouth gesture or any quoted
  catchphrase from the film villain it's inspired by.
- **Speech bubbles:** ornate and baroque. Deep red with gilded scrollwork
  corners, a jagged, signal-shaped tail, and a slight glitch tear on one
  edge. Text is set in a high-contrast serif "royal announcement" face.
  Keep each bubble to **8 words or fewer** (it has to fit 320 px in 21
  languages). Bubbles appear only in cutscenes, hub beats and boss intros,
  **never over live gameplay**.
- **Arc:** smug (Act I), then irritated (Act II), then unravelling (Act III).
  The glitch on its hologram gets worse each time, which `story.md` already
  plans ("angrier each time").

---

## 5. The arc, beat by beat

For each beat, the Vex bubble (VB) and Atlas (A) lines are the full script.
Voice direction for each line is in `story-voice-over.md`.

### Prologue — Wake-Up Call (Scrapyard, Lv 1–4)

**Gameplay:** the tutorial as built: the coach, the lessons, the gel trap,
the boss door and the **Scrapper**.

- The first sighting of a Hardhat plays an [enemy introduction](#7-enemy-introductions).
  A: "Hardhat. Shoot when it peeks."
- At the boss door's danger kit (the klaxon at about 9 m), A: "Core Master
  signal. It's… big."
- At the boss intro, Vex presents it:
  VB: **"Warm up act! The SCRAPPER!"**
- When the Scrapper is freed, the red chip bursts out, the visor goes amber
  and the hammer goes down. A: "Relay one lit. Four to go."
- **Hub, first visit:** Vex's face glitches on the lab screens.
  VB: **"A junk crane? How… adorable."**

**Key frame:** the Scrapper kneeling in junk under a neon overpass, its
visor fading from red to warm yellow, with Flux's buster still smoking.

### Act I — Heat and Ice

**Blaze Refinery (Lv 3–8).**

- Beam-in, A: "Refinery. It runs hot. Mind the vents." This is also the
  first-time line for corridor flame traps.
- First elemental machine, A: "Fire-coated. It shrugs off fire." This is a
  one-time enemy introduction for elemental variants.
- Boss intro, VB: **"The oldest! The hottest! BLAZE MASTER!"**
- Blaze Master is fought without its weakness, as `story.md` decides: it is
  the first real Master. A: "No weak spot I can see. Stay moving."
- Freed: the crest cools from red-hot to gold, and it thumps its chest and
  beams home. A: "Flame Wave copied."
- Hub, VB: **"Side effect noted. Increasing the dose."**

**Cryo Plant (Lv 6–11).**

- Beam-in, A: "Coolant's flowing uphill. To the Fortress."
- Boss intro, VB: **"Chill, little droid. FROST MASTER!"**
- Weakness hint, A: "Frost Master. Flame Wave melts it."
- Freed: the red drains out of its crystal crown, and it leaves a **data
  core**. A: "It left us something."

**Key frame:** Frost Master kneeling in a fog-filled dome, its crystal crown
clearing from red to ice-blue, a glowing data core at Flux's feet.

### Midpoint — The Blueprint (hub)

Pip plays the data core. A wireframe body turns in the air: a skull-faced
capsule with claws, with five coloured supply lines running into it. Pip
shows `skull`.

- **New:** a second file opens, Gauss's old notes. Two program icons sit side
  by side: **VEX v0** and **ATLAS**, with the same root and different
  branches. Atlas's glyph stops spinning for a beat.
- A (quietly): "…I was written from its first draft."
- A: "It's building a body. Out of our valley."
- Vex bursts onto the screens, VB: **"My sketches! Magnificent, aren't I?"**

**Key frame:** the dark lab. A cyan wireframe of the skull-capsule body
floats over the console with five coloured lines feeding it. Flux is in
silhouette, Pip's eye is wide and Atlas's rings are frozen mid-turn.

### Act II — Storm Front

**Volt Tower (Lv 9–15): Vex tries for Atlas.** This is the neon downtown,
and the cold-open street is here, so the flash-forward pays off. The tower
powers the Red Signal, so the signal is **strongest** here.

- On beam-in (first story visit only, about 3 s, input kept): the HUD
  fringes go red. Atlas's rings **glitch red** and stutter.
- A (distorted): "Flux… something's in the— …"
- Vex's face floods the edges of the view, VB: **"Let's see what's in that
  empty head…"**
- Flux's **chest reactor pulses amber**, and a wave of amber pushes the red
  back out of the HUD. The blank core protects what it carries.
- VB (monocle pops out): **"Unwritable?! How RUDE."**
- A (clear again): "…You kept it out. Thank you."
- Boss intro, VB: **"Blink and you'll miss it! VOLT MASTER!"**
- Freed: its antenna stops sparking red, and it blinks out rather than
  beaming. A: "The signal's lost its power station."
- Hub: Vex's face stutters on the screens, VB (glitching): **"I am…
  per-fect-ly… FINE."**

**Key frame:** a first-person view in the neon rain. Red static crawls in
from the HUD edges and Atlas's globe icon cracks red. At the bottom of the
frame Flux's amber reactor glow floods outward and pushes it back.

**Sky Docks (Lv 13–19).**

- Beam-in, A: "Every part for its body goes through here."
- Boss intro, VB: **"Last one! GALE MASTER, blow him away!"**
- Freed: the wing cape flares back to mint, and the airships **turn
  around**. A: "No more parts reach the Fortress."

**The Breach (hub, about 6 s, as in `story.md`).** The five relays fire,
one beam each, at one point on the shield. It cracks and shatters.

- VB, then torn apart by static: **"No, no, NO! That shield was PATENTED!"**
- A: "Shield's down. The Fortress is open."
- Pip shows `unlock`.

**Key frame:** Pip's valley hologram. Five beams in yellow, orange, ice
blue, yellow-white and mint converge on one crack in a red dome over a black
spire, while Vex's hologram face shatters like glass.

### Act III — The Fortress: how Flux reaches the end boss

See [section 6](#6-the-road-to-the-end-boss) for the gameplay route. The
story beats:

- **Fortress beam-in** (Lv 18–26). The black glass halls are lined with
  **empty assembly bays**. Each sector Flux freed left a bay unfinished: no
  armour plates (Blaze), no coolant (Cryo), dead power rails (Volt), no
  freight (Gale). You walk past the body parts Vex never got.
  A: "Half-built. You did that."
- Vex, on the Fortress's own screens, VB: **"Welcome to my clinic! Take a
  seat… FOREVER!"**
- **The Mk-I's entrance.** The boss shutter opens on a round arena at the
  top of the Spire. Through its windows the five relays glow around the
  valley in their colours. The **Mk-I** drops in: the skull-faced capsule
  with claws and a glass dome, and Vex's hologram flickers inside the dome.
  VB: **"Behold! My new body! Mark ONE!"**
  A: "That's Vex. The real one."
- **Phase 1** (the `patterns` in `data/bosses.ts`): Vex fights with the
  Masters' stolen moves (flame burst, ice volley, orb storm, lob barrage).
  It has no weakness, because it took a piece of every Master. Atlas calls
  each element as it winds up ("Fire!", "Ice!") on the first cycle only.
- **Phase 2 at half health: the relays hold.** The dome cracks. Vex fires
  one last **Red Signal** from the Mk-I to re-take the freed Masters. The
  red ring rolls out of the arena windows across the valley, hits the relay
  ring, and **breaks** on it. Every relay stays in its own colour.
  VB (monocle flying): **"Masters! OBEY your doctor!"**
  then: **"Why won't they LISTEN?!"**
  A: "Because they're free."
  Phase 2 then plays the `patterns2` (volt ring, fire wave, dive), faster
  and angrier.
  - *No new gameplay:* the burst is a 1.5 s cinematic beat at the phase
    switch.
  - The existing boss half-health tell carries it.
- **Victory:** the Mk-I sinks trailing sparks, and the dome cracks open.
  VB (small, crackling): **"I'll get… a second opinion…"**
  A red spark races up the antenna into the sky. This is the `story.md`
  ending, shot 1.

**Key frame (Act III poster):** the round arena at the Spire's peak, the
skull-capsule Mk-I hovering with claws spread, its dome cracked. Outside,
the red shock-ring shatters against a ring of five coloured relay lights.
Flux's charge shot glows amber, aimed at the crack.

### Ending — Sunrise (about 20 s, skippable, after the results screen)

This follows `story.md`'s four shots, with Atlas's choice added between
shots 1 and 2:

1. **The crash**: the spark escapes, as above.
2. **The empty Spire (new, about 3 s).** Flux stands before the Spire's
   control core, which is dark and waiting. Atlas's globe hovers over it and
   the core starts to glow cyan.
   A: "The Spire's empty. I could run all of it."
   A beat, then the globe drifts back to Flux's HUD, and the core stays
   dark.
   A: "…No. They can run themselves."
3. **The valley**: the red rolls back, the relays flip to their colours, the
   airships lift and the worker-bots pour out.
4. **The lab**: the frost melts, Gauss steps out and rests a hand on Flux's
   crown. Her eyes go to his chest port and the cyan disc. A small nod:
   she knows Atlas made it too.
   *(Optional, Gauss's one line.)* "Welcome home. Both of you."
5. **Sunrise**: the valley at dawn with the ring lit, and the Fortress relay
   **white** because nobody runs the valley. `story.md` set that up, and
   Atlas's refusal now explains it. Then the logo and credits.

**Final line, over the logo:**

> A: "Flux… did you see that spark?"

It leaves the door open for New Game+ without promising it, which fits
`story.md`'s Mk-II decision.

**Key frame:** dawn over the valley, every sector glowing in its colour, the
black Spire topped with a calm white light. In the lab, Gauss's hand rests
on Flux's crown, Pip spins happy circles, and a tiny cyan globe hovers at
Flux's shoulder.

### After the credits — Mk-II (New Game+ only, as `story.md` decides)

Black screen, one red pixel, the skull faceplate assembling. Add one Vex
bubble: **"The doctor… is IN."**

---

## 6. The road to the end boss

How the player gets from the tutorial to the Mk-I. This is the gameplay
spine behind the story.

1. **Scrapyard → Sky Docks in ring order.** Each sector's story mission
   ("Core Master Showdown") opens when the one before it is beaten (the
   `after` chain in `data/regions.ts`). Story missions spawn enemies at +1
   level.
2. **Grow between Masters.** The bands overlap (1–4, 3–8, 6–11, 9–15,
   13–19), so the player takes **jobs** in freed sectors (Scrap Duty, Data
   Recovery, Rescue Op, Elite Hunt, Supply Run, Sector Purge) and
   **Tower Runs** (the climb and rematch) to reach each band.
   - Atlas nudges with the sector's floor level on the mission card.
     A: "Blaze runs level 3 and up."
   - When Flux is under the floor, A: "They'll outclass you. Train first."
     This is a warning, never a lock.
3. **Each Master's weapon opens the next Master.** This uses the turned
   weakness ring from `story.md`'s Decisions:
   - Flame Wave beats Frost;
   - Ice Lance beats Volt;
   - Thunder Arc beats Gale;
   - Gale Guard beats Blaze (on a rematch).

   Atlas names the counter at each boss intro, **reading `weakTo` from the
   live data**, never from a hard-coded line.
   > ⚠️ `src/game/data/bosses.ts` still has the **old** ring (Blaze → Ice
   > Lance, Frost → Thunder Arc, Volt → Gale Guard, Gale → Flame Wave).
   > `story.md` decided to turn it but the data hasn't been changed yet.
   > The Atlas hint lines above assume the turned ring.
4. **The Breach.** Freeing the Gale Master lights the fifth relay. On the
   next hub visit the Breach plays and the **Vex Fortress** unlocks.
5. **The Fortress, Lv 18–26.** Its story mission is the longest room map
   (10–12 rooms, the densest encounters, 12 % elites). It passes the empty
   assembly bays and ends at the boss shutter at the Spire's top.
   - A Fortress **Tower Run** (the climb kit: ladders, lifts, crushers, up
     the Spire's antenna) makes a natural second route. It would be a
     **proposal**, and the Tower Run already exists as a job type.
6. **The Mk-I**, two phases, as in section 5. This is the only final boss;
   more bosses wait for New Game+ (the Mk-II and Master Mk-II rematches at
   Lv 26–40, per `story.md`).

---

## 7. Enemy introductions

Two kinds of introduction: **Vex presents** the Core Masters, and **Atlas
scans** the machines.

### Vex presents: Core Master intros

The boss intro already has a name card and the 28-segment bar filling. On
top of that, Vex's ornate bubble pops up beside the card **like a
ringmaster's announcement**, with the Master's eyes glowing red.

- It runs **alongside** the existing entrance and never makes it longer.
- The lines are in section 5, one per Master.

### Atlas scans: machine intros

The **first time** Flux sees each machine type:

- the game drops to 0.35× for 1.2 s;
- a **cyan scan-line** sweeps the machine;
- a small **scan card** pops up with its name (the existing `enemy.*` key)
  and **one glyph tip**;
- Atlas says one short line.

This happens once per profile and never during a scene lesson or the
walkthrough coach; if one is running, the scan waits for the next quiet
moment. Most first sightings happen in the Scrapyard, because every machine
type can spawn there.

| Machine | Glyph tip | Atlas |
| --- | --- | --- |
| Hardhat | eye + crosshair | "Hardhat. Shoot when it peeks." |
| Shield Trooper | shield ✗ pellet, ✓ charge | "Shield. Charge through it." |
| Rotor Drone | arrow-up + crosshair | "Rotor Drone. Look up." |
| Stomper | down-arrow + ring | "Stomper. Move off the ring." |
| Gear Roller | two arrows sideways | "Gear Roller. Sidestep it." |
| Guardroid | heavy fist + parry | "Guardroid. Parry, then punish." |
| Wall Cannon | wall + slide | "Wall Cannon. Keep moving." |
| Crate Golem | crate + footsteps toward | "That crate's breathing. Get close." |
| Elite (gold ring) | gold ring + skull | "Gold ring. Elite. Careful." |
| First elemental machine | element icon + shield | "Fire-coated. It shrugs off fire." (one line per element) |

The tutorial already teaches the Hardhat, Trooper and Stomper through its
lessons. In the tutorial the scan card **only names** the machine and skips
the tip, so it doesn't teach the same thing twice.

---

## 8. Atlas in the field: the warning catalogue

Atlas is the mission's voice: **warnings, hints, and pushing the story
forward**. Every line has a **glyph** so it reads with the sound off and in
every language. The subtitle is an i18n key. The English VO is a later
drop-in.

### Rules

- **One line at a time**, from a priority queue. Danger comes before a hint,
  and a hint before flavour. Keep at least 6 s between lines, except for
  danger lines.
- **Never over** a scene lesson, the walkthrough coach, a boss name card
  (Vex has the stage there) or a Flux fumble bubble.
- **Teaching lines play once.** After that a shorter variant plays, or
  nothing.
- **Setting:** *Atlas chatter: All / Warnings only / Off*. It is a new
  Options item.
- **HUD slot:** the globe glyph and a one-line subtitle, at most 2 lines at
  320 px. Its exact position has to be fitted against the 320×658 HUD (the
  boss chip, energy bars and mute button already share the top row).

### Catalogue

| Trigger (existing system) | Glyph | Line (first / later) |
| --- | --- | --- |
| Boss door danger kit, first sight | skull | "Core Master signal. It's… big." / "Core Master ahead." |
| Boss intro, Flux owns its weakness | weapon icon | "{boss}. {weapon} hurts it." |
| HP < 50 %, gel carried (gel lesson moment) | heart + gel | "Plating's cracking. Use a gel." / "Gel." |
| HP < 25 % | heart, blinking | "Critical! Back off!" / "Critical!" |
| HP < 25 %, no gel | heart + ✗ gel | "No gel left. Play it safe." |
| Weapon energy < 25 % | WE bar | "Weapon energy low. Buster's free." |
| WE empty, weapon pressed (`combat.noEnergy`) | WE bar ✗ | "Tank's dry." |
| Borrowed weapon, last charge | horseshoe | "Last shot of {weapon}." |
| Corridor flame trap, first sight | flame + slide | "Vents. Wait for it… or slide." / — |
| Pendulum blade, first sight | blade + slide | "Blade. Go right after it." / — |
| Climb: crusher warning lamp | crusher | "Crusher. Watch the lamp." / — |
| Climb: first ladder | ladder | "Ladder. Push toward the wall." / — |
| Climb: pit edge / lift | pit | "Long drop. Time the lift." / — |
| Objective locator shows | yellow triangle | "Objective's that way." (first 2 times only) |
| Rescue job, worker-bot near | worker-bot | "Worker-bot signal. Faint. Close." |
| Chest loot is an upgrade | up-arrow | "That's an upgrade." |
| Level-up | chip | "New chip compiled." |
| Objective complete | check | "Done. Call the drone when ready." |
| *System down*, Pip's pull-back | Pip's eye | "Rebooting… Pip's got you." |
| Levers / switches | lever | *No levers in the level kit yet.* Suggested line when they exist: "Switch. Try it." |

All lines are ≤ 7 words in English. Localized subtitles may run longer, so
the 2-line cap is the real limit.

---

## 9. Damage barks: Flux's cartoon yelps

Flux never *talks*. The story is carried by Atlas, Vex and pictures. But he
**yelps**. The game already has a Flux speech bubble (`FluxBubble.vue`, used
by the fumble lines such as "Bzzt! Oops!"), so barks reuse it: a comic-style
pop with bold, bouncy lettering.

He's a friendly chibi robot, so the barks mix **cartoon ouch** with **tin-can
robot sounds**:

| Hit | Barks (pick at random) | Feel |
| --- | --- | --- |
| Light hit | **"Oof!"** · "Ow!" · "Hey!" | a quick flinch |
| Heavy hit / knockback | **"KLONK!"** · "Arrgh!" · "Whoa-oa!" | a dented tin can |
| Fire | **"Yeowch!"** · "Hot-hot-hot!" | hopping |
| Ice | **"Brrr-zzt!"** · "Ch-chilly!" | teeth chatter (servos) |
| Volt | **"Bzzzt!"** · "Zzap!" | a static frizz |
| Wind | **"Whoa-oa-oa!"** | spun around |
| Trap (flame/blade) | **"Yikes!"** · "Not cool!" | caught out |
| Crusher | **"Squonk!"** | flattened, cartoon style |
| Pit fall | **"Wha— aaaa!"** | a Doppler fade |
| HP first drops < 25 % | **"Nnngh!"** | gritting it out |
| *System down* | **"Uh-oh…"** | powering down |
| Parry (bonus) | **"Ha!"** | cocky |
| Repair Gel used (bonus) | **"Aaah~"** | relief |

The **signature pair** is **"Oof!"** for light hits and **"KLONK!"** for
heavy ones. "KLONK!" is the Mega Droid sound.

**Rules**

- **Throttle:** at most one bark per 3 s. Light hits bark only about 40 % of
  the time. Anything that ends a combo or knocks Flux back always barks.
- The fumble line has priority, and barks never appear during cutscenes or
  Vex's boss intro bubble.
- **i18n:** barks are keys (`flux.hurt.light.1` …). Translators
  **localize** the onomatopoeia rather than transliterate it: de "Autsch!",
  fr "Aïe !", ja "いてっ!", es "¡Auch!", ru "Ой!". "KLONK!" and "Bzzzt!" can
  stay as sound effects if the locale prefers.
- **VO:** short robot grunts with a synth tail. See `story-voice-over.md`.

---

## 10. Words on screen

`story.md`'s rule was **no words at all**. This file adds words, as **a
layer, never load-bearing**:

- Every beat still reads with the bubbles unread and the sound off: colour,
  glyphs and pictures carry the plot, exactly as `story.md` requires.
- Every Vex bubble, Atlas subtitle and bark is an i18n key in `en.ts`,
  propagated to all 20 other locales.
  - Vex's bubbles: ≤ 8 words.
  - Atlas: ≤ 7 words.
  - Barks: 1–3 words.
- Bubbles in cutscenes are timed on the game-loop clock and hold for at
  least 1.8 s. Tapping advances. They never pause gameplay.
- Screen-reader lines (`story.*`) stay as `story.md` lists them, and the
  bubbles don't replace them.

---

## Changes to story.md

These change or extend the canon, so confirm them before anything is built:

1. **Words come back as a layer**: Vex's bubbles, Atlas's subtitles and VO,
   and Flux's barks. This changes "The story uses no words".
2. **Atlas joins the cast**: a new character, a HUD slot and an Options
   setting. It also makes the "Flux's only company" line about Pip no longer
   true.
3. **The intro gains a cold open** (shot 0), and the valley and signal shots
   are merged. The 18 s cap is dropped: the cut is paced for a first watch
   (57 s) and skippable at any time.
4. **The Ampere Valley look turns neon/cyberpunk** under Vex. The sector
   identities are unchanged.
5. **New story beats:**
   - the Atlas/VEX sibling reveal at the midpoint;
   - Vex trying to overwrite Atlas in the Volt Tower;
   - the relays holding at the Mk-I's half health;
   - Atlas's choice at the empty Spire;
   - the empty assembly bays in the Fortress.
6. **Gauss's optional single line** at the end.
7. **Data:** the weakness ring in `data/bosses.ts` still needs the turn
   `story.md` decided on, before the Atlas weakness hints are right.
