# Mega Droid — comic prompts (for Gemini)

This is the story from [`story-arc.md`](./story-arc.md) as a comic, one prompt
per page, ready to run in Gemini's image generation. It covers 6 character
reference sheets, a cover and 28 pages. Pages 25–29 (the second shift) are
read between pages 15 and 16.

## How to use

1. **Make the reference sheets first** (R1–R6). Save the images.
2. For every page, **start the message with the STYLE block**, then the
   **CHARACTER blocks** the page lists, then the **page prompt**.
3. **Attach the matching reference sheets** as images. The STYLE block
   already tells Gemini to copy only the character designs from them. That
   matters more than anything else for consistency.
   - `pnpm art:comic` does steps 2 and 3 automatically and drives Gemini
     itself (see the header of `tools/art-comic.mjs`).
4. **Lettering:** Gemini's text rendering is hit and miss. Two modes:
   - **LETTERED:** keep the `Lettering:` lines in the prompt; the text is
     short on purpose.
   - **BLANK (recommended for final pages):** replace each page's
     `Lettering:` section with *"Draw the speech bubbles and caption boxes
     empty, with no text."* Then letter the pages yourself.
5. If a page comes back crowded, ask for **"the same page, fewer details,
   bigger panels"**, or split it in two.

---

## STYLE block (paste first, every time)

```
A single comic book page, portrait, 2:3 aspect ratio, with clean panel
borders and white gutters. Art style: bright, bold cartoon comic, clean
thick ink outlines, cel-shading with soft gradients, and chunky, rounded,
toy-like low-poly robots with chibi proportions. It feels like a
Saturday-morning cartoon in a neon cyberpunk city. Lighting is cinematic
neon with a strict colour code: red glow on anything the skull villain has
taken over, cyan for the lab and its helpers, amber for the hero's own
glow, and each district in its own colour once it is free. No humans
anywhere: every character is a robot or android. Signs and screens in the
city show only icons and glyphs, never readable words. Speech-bubble
styles: the villain's bubbles are ornate, deep red with gilded scrollwork
corners and a jagged tail, lettered in a bold serif. The AI assistant
speaks in small rounded cyan caption boxes with a tiny globe icon. The
hero's yelps are bouncy comic sound-effect lettering. The small helper
bot's bubbles contain a single icon, never words.
HERO RULE, on every panel: the white hero Flux always wears a CLOSED helmet.
Show the V-brow crown, one antenna blade, a dark visor band with two amber
eye-lights, and a white armoured jaw guard. There is never a face, skin,
chin or mouth under or inside his helmet.
TEXT RULE: the only words anywhere on the page are the exact lines given
under "Lettering", each used once, in the bubble type named there. Never
letter any other words: no labels, no notes, and nothing else from these
instructions.
The attached images are CHARACTER REFERENCES only. Copy the character
designs from them exactly, and ignore their words, bubbles, story and
panel layout.
```

## CHARACTER blocks (paste the ones each page lists)

**[FLUX]**
```
FLUX, the hero: a small chibi combat android about three heads tall, in
glossy pearl-white armour plates over a dark graphite undersuit. His head is
an original design, not a round helmet: a swept-back crown with a V-shaped
brow, a wraparound dark visor band with two glowing AMBER eye-lights, a jaw
guard, and one single blade-shaped antenna. His right forearm is a chunky
arm cannon (buster) whose muzzle glows amber when it charges. A round amber
reactor glows in his chest, beside a small cyan disc slotted into a chest
port. He never speaks; he shows emotion through posture and his eye-lights.
He has NO face, ever: no eyes, eyelids, nose or mouth drawn on him, and no
gold or skin-coloured faceplate. The visor is always a dark glass band.
Below the visor is a pearl-white armoured jaw guard: no skin, no chin and
no mouth line. Nothing on his head is orange or skin-coloured.
When he is asleep or powered down, the two eye-lights are simply dark or
dim behind it. The V-brow crown and the single antenna blade are always
visible.
```

**[PIP]**
```
PIP, the helper bot: a small round white hover-robot, as big as a
basketball, with a cyan band around its middle, one big dark eye socket with
a glowing cyan pupil, a tiny antenna with a glowing pink bulb on top, and a
glowing cyan ring floating just beneath it. It is cute and expressive: its
eye goes wide with alarm and squints with joy.
```

**[ATLAS]**
```
ATLAS, the AI assistant: a small holographic cyan armillary sphere, three
thin glowing rings orbiting a bright little core, about the size of an
apple. It floats beside Flux's shoulder or appears as an icon at the edge of
his vision. It has no face. It glows cyan normally and flickers red when
something attacks it.
```

**[GAUSS]**
```
PROF. GAUSS: an elderly female android scientist, a head taller than Flux,
thin and slightly stooped, in a long white lab coat. A brass coil turns
slowly under a glass cap on top of her head. She has round lens rings over
gently glowing cyan eyes, a smooth non-human face, and a cane shaped like a
tuning fork. She is kind, clever and dignified.
```

**[VEX]**
```
DR. VEX, the villain: a rogue AI that appears as a giant RED hologram, a
grinning robotic skull faceplate made of glitchy red light with scan-lines.
Two floating red claw-hands gesture theatrically beside it, and a
glitch-pixel monocle sits over one eye socket. It is pompous, vain and
theatrical, like a showman doctor. It is comedic, never gory.
```

**[MK-I]**
```
DR. VEX MK-I, the villain's robot body: a large hovering capsule-shaped war
machine with a skull-like faceplate, a glass dome on top with Vex's red
hologram flickering inside, and big mechanical claws on both sides. Its
armour is black and crimson, with glowing red seams. It floats above the
ground with thrusters underneath.
```

**[SCRAPPER]**
```
THE SCRAPPER: a hulking yellow junkyard crane robot, much bigger than Flux,
built from mismatched industrial parts. It has a hammer fist on one arm and a
horseshoe magnet claw on the other, and a visor that glows RED while it is
controlled (warm yellow once freed).
```

**[MASTERS]** (use only the ones on the page)
```
The Core Masters are humanoid robots built on Flux's chibi frame, but bigger
(1.35×), with stern eyes and element weapon arms. While the villain controls
them, their eyes and chest core glow RED; once freed they return to their
own colour.
- BLAZE MASTER: orange-red armour, a crest of three stacked flame cones on
  its helmet, flared flame-nozzle forearm cannons. Loud, proud. Freed colour:
  orange.
- FROST MASTER: ice-blue armour, a crown of ice crystals, crystal blades on
  its forearms. Calm, exact. Freed colour: ice blue.
- VOLT MASTER: yellow armour, a zig-zag lightning antenna of three tilted
  cones, coil gauntlets with glowing balls. Twitchy, fast. Freed colour:
  yellow-white.
- GALE MASTER: mint-teal armour, fan fins either side of its helmet, a small
  propeller hub on top, a flowing wing cape. Free spirit. Freed colour: mint.
```

**[SECOND-SHIFT]** (the outer works' Masters; use only the ones on the page)
```
The second shift: five more Core Masters, the foremen of the valley's outer
works. They are built on the same chibi frame as the first four, bigger
than Flux (1.35×), with stern eyes and tool weapon arms. While the villain
controls them, their eyes and chest core glow RED; once freed they return
to their own colour.
- MAGNET MASTER: cobalt-blue armour with silver trim, a horseshoe crown over
  its helmet with glowing pole tips, one red and one blue pole plate on its
  chest (those two stay red and blue either way), and horseshoe gauntlets
  for hands. Stubborn, two-sided. Freed colour: cobalt.
- DRILL MASTER: ochre armour over dark brown, hazard stripes on its
  shoulders, a banded steel drill cone with a small lamp as its crest, and
  steel drill bits for forearms. Quiet, patient. Freed colour: ochre.
- TIDE MASTER: deep sea-blue armour with navy plates and yellow diving trim,
  a dorsal fin over its helmet, a round diver's visor ring, bubble tanks on
  its back, and a lance on each forearm with a bubble at its tip.
  Easygoing. Freed colour: sea blue.
- NEON MASTER: dark charcoal armour piped with HOT-PINK neon tubes, a neon
  halo over its helmet, a glowing visor stripe, and a blade of light on each
  forearm. A show-off. Freed colour: hot pink.
- ROTOR MASTER: lime-green and white armour, a rotor mast with two blades on
  its helmet, pilot goggles, two ducted fans on its back, and a little rotor
  on each fist. Restless, happiest up high. Freed colour: lime.
```

**[MACHINES]** (the rank-and-file enemies)
```
The villain's machines are mass-produced, cartoonish robots in industrial
colours with glowing red eyes: HARDHAT (a small robot hiding under a big
hard hat, peeking out), SHIELD TROOPER (a soldier bot with a big riot
shield), ROTOR DRONE (a flying bot with a helicopter rotor), STOMPER (a
squat hopping bot), GEAR ROLLER (a bot riding a big gear wheel), GUARDROID
(a heavy brute bot with huge fists), WALL CANNON (a turret in a wall), and
CRATE GOLEM (a supply crate that unfolds into a rock-throwing golem).
```

**[SHIFT-MACHINES]** (the outer works' enemies)
```
The villain's outer-works machines, cartoonish like the rest, with glowing
red eyes: POLAR PUP (a floating orb in a blue shell that splits open, red
inside, to fire), MOLE DRILLER (a burrowing bot with a drill nose that
bursts up out of the floor), PUFFER MINE (a round drifting sea mine that
swells up before it bursts), GLOW STALKER (a dark, lanky bot in the
shadows, showing only two glowing eyes) and HORNET ROTOR (a small,
wasp-like attack drone that spins up red and dives).
```

---

## Reference sheets

### R1 · Flux

```
[STYLE] [FLUX]
A character reference sheet (not a comic page), landscape 3:2, on a plain
light-grey background. It shows Flux in a front view, a side view and a back
view, standing neutral, plus four expression close-ups of his head (visor
eye-lights: happy (curved), determined (narrow), surprised (wide round),
hurt (squeezed shut with little stars)). It also shows one action pose
charging his arm cannon with an amber glow. It includes colour swatches for
pearl white, graphite and amber. No text except small labels.
```

### R2 · Pip and Atlas

```
[STYLE] [PIP] [ATLAS]
A character reference sheet, landscape 3:2, plain light-grey background.
Pip appears in front and side views with three expressions (wide-eyed alarm,
happy squint, curious tilt), plus one example of Pip's icon speech bubble
containing a heart icon. Atlas appears in three states: calm cyan and
spinning, tilted toward a threat, and glitching red with broken rings. Next
to Atlas is one example of its cyan caption box with a tiny globe icon.
```

### R3 · Prof. Gauss

```
[STYLE] [GAUSS]
A character reference sheet, landscape 3:2, plain light-grey background.
Gauss appears in front, side and back views leaning on her tuning-fork cane,
with a close-up of her head showing the brass coil under the glass cap and
the round lens rings. It also shows two poses: pulling a big lever
urgently, and resting a hand gently on something at knee height.
```

### R4 · Dr. Vex and the Mk-I

```
[STYLE] [VEX] [MK-I]
A character reference sheet, landscape 3:2, dark background. It shows Vex's
red hologram skull face with its floating claw-hands in four expressions:
smug grin, theatrical announcement with arms wide, furious with the monocle
popping out, and glitching apart in static. It shows the Mk-I war machine in
front and three-quarter views with the dome closed, plus one damaged view
with a cracked dome. It includes one example of Vex's ornate red-and-gold
speech bubble.
```

### R5 · The Scrapper and the four Masters

```
[STYLE] [SCRAPPER] [MASTERS]
A character lineup sheet, landscape 3:2, plain light-grey background. From
left to right stand the Scrapper, Blaze Master, Frost Master, Volt Master
and Gale Master, full body and front view, all to scale next to a small
Flux silhouette for size. Draw each one twice, top row CONTROLLED (red
glowing eyes and chest core) and bottom row FREED (eyes in its own colour,
relaxed pose).
```

### R6 · The second shift

```
[STYLE] [SECOND-SHIFT] [SHIFT-MACHINES]
A character lineup sheet, landscape 3:2, plain light-grey background. From
left to right stand Magnet Master, Drill Master, Tide Master, Neon Master
and Rotor Master, full body and front view, all to scale next to a small
Flux silhouette for size. Draw each one twice, top row CONTROLLED (red
glowing eyes and chest core) and bottom row FREED (eyes in its own colour,
relaxed pose). Along the bottom edge, smaller, the five outer-works machines
stand in a row: Polar Pup (shell closed and open), Mole Driller, Puffer Mine
(small and swollen), Glow Stalker and Hornet Rotor.
```

---

## Cover

**Characters:** FLUX, ATLAS, VEX, MACHINES

```
[STYLE] [FLUX] [ATLAS] [VEX] [MACHINES]
A comic book COVER, portrait 2:3, full bleed, no panels. It is night on a
rain-slick neon street in a cyberpunk android city. Flux is in the
foreground, mid-slide on wet asphalt toward the viewer, his arm cannon
raised and charging a bright amber shot, his visor eye-lights streaking
amber. Atlas floats at his shoulder. Behind him a Shield Trooper and two
Rotor Drones with red eyes close in. Towering above the street, giant
holo-billboards show Vex's grinning red skull face, whose glow turns the
whole sky crimson. Neon reflects in the puddles. Leave clear empty space at
the top for a title logo.
Lettering: title area at top: "MEGA DROID".
```

---

## Part 1 — Wake-Up Call

### Page 1 · Cyber City

**Characters:** none (city establishing shots)

```
[STYLE]
Comic page with 3 panels.
Panel 1 (wide splash, top half): Dusk over Cyber City, a bowl-shaped neon
android city. Six districts ring the valley, each glowing in its own colour:
a yellow junkyard with a giant crane, an orange refinery with three flaming
chimneys, white ice-blue domes, a yellow-white lightning tower spire, and
mint floating sky-docks with small airships. In the centre is a cyan-glowing
lab dome. Beams of light hop from tower to tower in a ring. On a cliff to the
north-west stands a white, calm Control Spire.
Panel 2: A street level in the downtown district. Friendly worker robots
walk under colourful holo-signs (icons only), and a little delivery drone
zips by. Everything is peaceful and bright.
Panel 3: A close-up of the white Control Spire's tip, with a tiny red spark
blinking at its very top, ominous.
Lettering: Panel 1 caption box (cyan, globe icon): "Log start."
```

### Page 2 · The Red Signal

**Characters:** VEX, MASTERS (Blaze Master)

```
[STYLE] [VEX] [MASTERS]
Comic page with 4 panels.
Panel 1: The Control Spire's tip flashes blinding red. Vex's giant red
hologram skull face glitches into the sky above it, its claw-hands spread
wide like a showman.
Panel 2 (wide): A red shock-ring rolls out from the Spire across the whole
valley. Everything it passes (billboards, windows, the light beams between
towers) flips from its own colour to red. The left of the panel is still
colourful and the right is already crimson.
Panel 3: A close-up of Blaze Master's face in a refinery. Its orange eyes
flicker, then lock RED.
Panel 4: On the street, the friendly worker robots freeze in confusion as
the security machines around them turn red-eyed and raise their weapons.
Lettering: Panel 1, Vex's ornate bubble: "Diagnosis: this valley is SICK.
The cure… is ME!"
```

### Page 3 · The lab

**Characters:** GAUSS, PIP, FLUX (asleep), ATLAS (as a disc)

```
[STYLE] [GAUSS] [PIP] [FLUX]
Comic page with 5 panels. Inside a high-tech lab dome under flashing red
alarm light.
Panel 1: Wide shot of the lab. The dome's glowing panels turn red one by one.
Gauss stands at a console, Pip hides behind it with only its big eye
showing, and Flux stands asleep inside a glass capsule, eye-lights dark,
chest reactor dim.
Panel 2: A close-up of Gauss's arm as a crackle of red lightning climbs up
it. She looks at it, alarmed.
Panel 3: Gauss turns to the sleeping Flux with a determined look.
Panel 4: A close-up of Gauss's hand pressing a small glowing cyan data-disc
into a port on Flux's chest.
Panel 5: Gauss hauls down a big lever on Flux's capsule. Steam bursts out
and the glass slides down.
Lettering: Panel 1, Pip's bubble: a skull icon. Panel 5 SFX: "KA-CHUNK!"
"HSSSS!"
```

### Page 4 · Safe mode and wake-up

**Characters:** GAUSS, PIP, FLUX (first person), ATLAS

```
[STYLE] [GAUSS] [PIP] [ATLAS]
Comic page with 5 panels.
Panel 1: Gauss steps into a second capsule and slaps a panel inside. The
glass seals.
Panel 2: Frost races across the capsule glass. The red lightning hits the
frost and fizzles out. Behind the frost, Gauss's eyes dim to a calm blue
glow, and a heartbeat light glows at the capsule's base.
Panel 3: A FIRST-PERSON view through Flux's eyes: black, with blurry eyelid
bars opening onto the frosted capsule.
Panel 4: First person, sharper now: Pip's huge cyan eye pops right into the
frame, wide with excitement. Around the frame's edges, a heads-up display
boots up, with a segmented health bar and a small "Lv 1" tag. A little cyan
globe (Atlas) spins up in the corner.
Panel 5: First person: Pip projects a cyan hologram map of the valley.
Ten districts show red, and on the cliff sits a black fortress inside a red
shield dome. One junkyard district blinks cyan.
Lettering: Panel 4, Atlas caption: "Core online. Good morning, Flux."
Panel 5, Atlas caption: "Scrapyard first. One relay at a time." Panel 2 SFX:
"krrrsshh…" and a soft "ba-dum".
```

### Page 5 · Into the Scrapyard

**Characters:** FLUX, PIP, ATLAS, MACHINES (Hardhat)

```
[STYLE] [FLUX] [PIP] [ATLAS] [MACHINES]
Comic page with 4 panels.
Panel 1: Flux steps onto a round teleporter pad. Pip spins the pad's ring and
a cyan beam column rises around Flux.
Panel 2 (wide): Flux lands in a beam of light in the Scrapyard at night:
junk canyons of crushed cars under a broken neon overpass, red lamps on
crusher machines, a red billboard with Vex's face.
Panel 3: A Hardhat robot peeks out from under its hard hat. A cyan scan-line
sweeps over it, and a small scan card beside it shows the Hardhat's
silhouette with an eye icon and a crosshair icon.
Panel 4: Flux blasts the Hardhat just as it peeks. It pops apart into bolts
and springs.
Lettering: Panel 3, Atlas caption: "Hardhat. Shoot when it peeks." Panel 4
SFX: "PEW!" "POP!"
```

### Page 6 · The Scrapper

**Characters:** FLUX, ATLAS, SCRAPPER, VEX

```
[STYLE] [FLUX] [ATLAS] [SCRAPPER] [VEX]
Comic page with 5 panels.
Panel 1: A heavy boss shutter door marked with a big skull, red beacons
spinning, and red warning chevrons on the floor. Flux stands small before
it.
Panel 2: The shutter rises. The Scrapper looms in a junk arena, visor
glowing red, hammer fist raised. In the corner a small red hologram of Vex
throws its claw-hands out like a ringmaster.
Panel 3: The Scrapper slams its hammer fist down. Flux is knocked back,
tumbling with little stars around his head.
Panel 4: Flux, back on his feet, holds his arm cannon steady as a huge amber
charge builds up.
Panel 5: The charged shot hits the Scrapper square in the chest. Sparks
everywhere.
Lettering: Panel 1, Atlas caption: "Core Master signal. It's… big." Panel 2,
Vex's ornate bubble: "Warm up act! The SCRAPPER!" Panel 3, Flux SFX
lettering: "KLONK!" Panel 5 SFX: "KA-BOOM!"
```

### Page 7 · Freed

**Characters:** FLUX, ATLAS, SCRAPPER, PIP, VEX

```
[STYLE] [FLUX] [ATLAS] [SCRAPPER] [PIP] [VEX]
Comic page with 4 panels.
Panel 1: A red computer chip bursts out of the Scrapper's chest in a ring of
glowing orbs and shatters.
Panel 2: The Scrapper kneels. Its visor fades from red to a warm yellow, and
it gently sets its hammer down. Flux lowers his cannon.
Panel 3 (wide): Far across the junkyard, a relay tower lights up bright
yellow, and a beam of light shoots from it toward the next district on the
horizon.
Panel 4: Back in the lab, Flux stands with Pip spinning happily. Behind
them, on the lab's screens, Vex's red face glitches on, smirking.
Lettering: Panel 3, Atlas caption: "Relay one lit. Nine to go." Panel 4,
Pip's bubble: a check icon. Panel 4, Vex's ornate bubble: "A junk crane?
How… adorable."
```

---

## Part 2 — Heat and Ice

### Page 8 · Blaze Refinery

**Characters:** FLUX, ATLAS, MACHINES, VEX, MASTERS (Blaze)

```
[STYLE] [FLUX] [ATLAS] [MACHINES] [VEX] [MASTERS]
Comic page with 5 panels. Setting: a refinery district of molten channels,
red-hot chimneys, orange neon turned blood red, and heat haze.
Panel 1 (wide): Flux on a catwalk above a glowing lava channel, silhouetted
against fire.
Panel 2: Flux dashes past a wall of nozzles as a sheet of flame fires right
behind him, and his armour tail gets singed.
Panel 3: Flux fights a Shield Trooper and a Gear Roller, both glowing with a
fiery orange coating.
Panel 4: A boss arena. Blaze Master strikes a proud pose, flame crest
roaring, eyes red. Vex's hologram beside it gestures grandly like a boxing
announcer.
Panel 5: A flame wave rolls across the arena floor toward Flux.
Lettering: Panel 1, Atlas caption: "Refinery. It runs hot. Mind the vents."
Panel 2, Flux SFX: "YEOWCH!" Panel 4, Vex's ornate bubble: "The oldest! The
hottest! BLAZE MASTER!"
```

### Page 9 · Blaze Master freed

**Characters:** FLUX, ATLAS, MASTERS (Blaze), VEX

```
[STYLE] [FLUX] [ATLAS] [MASTERS] [VEX]
Comic page with 4 panels.
Panel 1: Flux dodges a leaping slam from Blaze Master. The ground cracks and
flames burst up.
Panel 2: Flux's charged amber shot hits Blaze Master's chest core. The red
chip shatters in a ring of orbs.
Panel 3: Blaze Master kneels. Its flame crest cools from red-hot to calm
orange. It thumps a fist to its chest in respect toward Flux.
Panel 4: Flux's arm cannon glows orange with a new flame pattern (the copied
weapon). In an inset, Vex's face on a lab screen is irritated, one eye
twitching.
Lettering: Panel 4, Atlas caption: "Flame Wave copied." Panel 4 inset, Vex's
ornate bubble: "Side effect noted. Increasing the dose."
```

### Page 10 · Cryo Plant

**Characters:** FLUX, ATLAS, VEX, MASTERS (Frost)

```
[STYLE] [FLUX] [ATLAS] [VEX] [MASTERS]
Comic page with 5 panels. Setting: white domes stained red from inside,
fog, frost on neon signs.
Panel 1 (wide): Giant coolant pipes climb a cliff out of the plant, running
uphill into red clouds toward the distant black fortress.
Panel 2: Flux, breath-like steam venting from his jaw guard, walks through
icy fog.
Panel 3: Frost Master stands in a dome arena, crystal crown glowing red.
Vex's hologram gives a smug wink.
Panel 4: Flux fires an orange Flame Wave. It melts through Frost Master's
wall of ice.
Panel 5: Frost Master kneels. The red drains out of its crystal crown,
leaving clear ice blue. At its feet sits a glowing data core.
Lettering: Panel 1, Atlas caption: "Coolant's flowing uphill. To the
Fortress." Panel 3, Vex's ornate bubble: "Chill, little droid. FROST
MASTER!" Panel 2, Flux SFX: "Brrr-zzt!" Panel 5, Atlas caption: "It left us
something."
```

### Page 11 · The Blueprint

**Characters:** FLUX, PIP, ATLAS, VEX

```
[STYLE] [FLUX] [PIP] [ATLAS] [VEX]
Comic page with 5 panels. In the dark lab.
Panel 1: Pip slots the data core into the console. A cyan wireframe hologram
rises: a skull-faced capsule war machine with claws, turning slowly, with
five coloured lines (yellow, orange, ice-blue, yellow-white, mint) feeding
into it from the edges.
Panel 2: Pip's eye goes wide. Its bubble shows a skull icon.
Panel 3: A second hologram file opens: two glowing program icons side by
side, one red, one cyan, their branches growing from the same root like a
family tree. Atlas's rings freeze mid-spin.
Panel 4: A close-up of Flux looking down at the small cyan disc in his
chest.
Panel 5: Vex bursts onto every lab screen at once, delighted, claw-hands
clasped.
Lettering: Panel 3, Atlas caption: "…I was written from its first draft."
Panel 4, Atlas caption: "It's building a body. Out of our valley." Panel 5,
Vex's ornate bubble: "My sketches! Magnificent, aren't I?"
```

---

## Part 3 — Storm Front

### Page 12 · Volt Tower: the neon downtown

**Characters:** FLUX, ATLAS, MACHINES

```
[STYLE] [FLUX] [ATLAS] [MACHINES]
Comic page with 4 panels. Setting: dense cyberpunk downtown at night, in
heavy rain, with holo-billboards everywhere showing Vex's red face, and a
huge lightning-tower spire spitting red arcs in the distance.
Panel 1 (wide splash): Flux sprints down a rain-slick neon street toward the
viewer, eye-lights streaking amber, neon reflected in puddles.
Panel 2: Two Rotor Drones swoop down from above, red eyes glaring.
Panel 3: A Shield Trooper steps out from an alley. Flux slides under its
swing across the wet asphalt, spraying water.
Panel 4: Flux plants his feet and fires a crackling charged shot. The
Trooper's shield shatters.
Lettering: Panel 3 SFX: "SKRRRT!" Panel 4 SFX: "KRAKOOM!"
```

### Page 13 · Vex tries for Atlas

**Characters:** FLUX (first person), ATLAS, VEX

```
[STYLE] [ATLAS] [VEX]
Comic page with 5 panels, all first person through Flux's visor, with the
heads-up display visible.
Panel 1: The HUD edges start filling with red static. Atlas's cyan globe
icon flickers red and its rings crack.
Panel 2: Vex's grinning red face floods in from the edges of the view,
claw-hands reaching toward the viewer.
Panel 3: At the bottom of the view, Flux's chest reactor pulses a bright
AMBER, and a wave of amber light pushes outward.
Panel 4: The amber wave shoves the red static back out of the HUD. Vex
recoils, its glitch-pixel monocle popping off in shock.
Panel 5: A calm view again. Atlas's cyan globe spins steadily, whole.
Lettering: Panel 1, Atlas caption (glitchy text): "Flux… something's in
the—" Panel 2, Vex's ornate bubble: "Let's see what's in that empty head…"
Panel 4, Vex's ornate bubble: "Unwritable?! How RUDE." Panel 5, Atlas
caption: "…You kept it out. Thank you."
```

### Page 14 · Volt Master

**Characters:** FLUX, ATLAS, MASTERS (Volt), VEX

```
[STYLE] [FLUX] [ATLAS] [MASTERS] [VEX]
Comic page with 5 panels. Setting: the top of the lightning tower, with a
storm around it.
Panel 1: Volt Master blinks into the arena in a flash, zig-zag antenna
sparking red. Vex's hologram does jazz hands with its claws.
Panel 2: Chain lightning arcs from Volt Master's coil gauntlets. Flux gets
zapped, his outline flashing like an X-ray.
Panel 3: Flux fires an ice-blue lance that pierces through the lightning.
Panel 4: Volt Master's antenna stops sparking red and turns yellow-white.
It gives Flux a quick salute and blinks away in a flash.
Panel 5: Back in the lab, Vex's face on the screens stutters and glitches,
forcing a smile.
Lettering: Panel 1, Vex's ornate bubble: "Blink and you'll miss it! VOLT
MASTER!" Panel 2, Flux SFX: "BZZZT!" Panel 4, Atlas caption: "The signal's
lost its power station." Panel 5, Vex's glitchy bubble: "I am…
per-fect-ly… FINE."
```

### Page 15 · Sky Docks

**Characters:** FLUX, ATLAS, MASTERS (Gale), VEX

```
[STYLE] [FLUX] [ATLAS] [MASTERS] [VEX]
Comic page with 5 panels. Setting: floating docking pads high in the sky,
with airships and wind.
Panel 1 (wide): A convoy of airships with red running lights crosses in
front of a huge moon, all heading toward the distant black fortress spire.
Panel 2: Flux leaps across a gap between two floating pads, the wind
tugging at him.
Panel 3: Gale Master spreads its wing cape in a tornado of feathers, eyes
red. Vex's hologram behind it looks a little desperate.
Panel 4: Flux's crackling yellow Thunder Arc strikes Gale Master mid-dive.
Panel 5: Gale Master's cape flares back to mint. In the background, the
whole airship convoy turns around and sails away from the fortress.
Lettering: Panel 1, Atlas caption: "Every part for its body goes through
here." Panel 3, Vex's ornate bubble: "Next, please! GALE MASTER, blow
him away!" Panel 2, Flux SFX: "Whoa-oa-oa!" Panel 5, Atlas caption: "No more
parts reach the Fortress."
```

---

## Part 3b — The Second Shift

### Page 25 · Polarity Works

**Characters:** FLUX, ATLAS, PIP, VEX, SECOND-SHIFT (Magnet), SHIFT-MACHINES
(Polar Pup)

```
[STYLE] [FLUX] [ATLAS] [PIP] [VEX] [SECOND-SHIFT] [SHIFT-MACHINES]
Comic page with 5 panels.
Panel 1: In the lab, Pip's hologram of the valley. Five relays glow in
yellow, orange, ice blue, yellow-white and mint, but the red shield dome over
the black fortress stays whole. At the valley's edge five more relays flare
red, and five red supply lines run from them into the fortress. On the lab
screens Vex's face smirks.
Panel 2 (wide): A steel foundry at night: casting halls, red-hot pours, red
and blue pole lamps along magnet rails. A huge claw casting swings from a
crane shuttle over the pour, heading for the distant fortress.
Panel 3: Flux is dragged along a magnet rail, chevrons glowing under his
feet, as he shoots a polarity panel to flip it. Beside him a Polar Pup's
blue shell splits open red to fire.
Panel 4: Magnet Master in the casting hall, cobalt armour, the pole tips of
its horseshoe crown glowing RED, homing horseshoe missiles curving toward
Flux. Vex's hologram presents it like a ringmaster. Flux charges a big amber
shot.
Panel 5: Magnet Master lowers its horseshoe. Its pole tips flip from red back
to cobalt and silver, and behind it a tram glides along the magnet rail
instead of a claw. Flux's arm cannon glows cobalt.
Lettering: Panel 1, Vex's ornate bubble: "Fine! I have MORE Masters." Panel
1, Pip's bubble: a skull icon. Panel 2, Atlas caption: "A foundry. It's
casting claws." Panel 4, Vex's ornate bubble: "Attractive, isn't it? MAGNET
MASTER!" Panel 5, Atlas caption: "The foundry's cold. No more claws."
```

### Page 26 · Deep Mine

**Characters:** FLUX, ATLAS, VEX, SECOND-SHIFT (Drill), SHIFT-MACHINES (Mole
Driller)

```
[STYLE] [FLUX] [ATLAS] [VEX] [SECOND-SHIFT] [SHIFT-MACHINES]
Comic page with 5 panels.
Panel 1 (wide): A mine headframe over a deep shaft at night, red cage lamps
glowing, ore carts climbing a track toward the distant black fortress.
Panel 2: Deep in the shaft two mine cages pass each other, one going up and
one going down. Flux rides one. In the gallery beside it a Mole Driller
bursts up out of the floor on a red marker.
Panel 3: Drill Master erupts out of the arena floor in a spray of rock, its
drill-bit crest spinning RED. Vex's hologram leans in like a doctor with a
stethoscope.
Panel 4: Flux fires a cobalt Magnet Pull horseshoe. It clamps onto Drill
Master's drill arm and yanks it off balance.
Panel 5: Drill Master kneels. Its drill-bit crest stops spinning and glows
ochre. Behind it, the mine cages carry stranded worker-bots up into
daylight.
Lettering: Panel 1, Atlas caption: "Ore for its armor. Dug right here."
Panel 3, Vex's ornate bubble: "Time for a deep check-up! DRILL MASTER!"
Panel 4, Atlas caption: "Magnet Pull hurts this one!" Panel 5, Atlas
caption: "The mine's quiet. No more ore."
```

### Page 27 · Tidewater Locks

**Characters:** FLUX, ATLAS, VEX, SECOND-SHIFT (Tide), SHIFT-MACHINES
(Puffer Mine)

```
[STYLE] [FLUX] [ATLAS] [VEX] [SECOND-SHIFT] [SHIFT-MACHINES]
Comic page with 5 panels.
Panel 1 (wide): A harbour of locks and canals at night. A convoy of barges
with red running lights moves up the canal toward the distant fortress, and
the tide creeps up a flight of stone steps.
Panel 2: Flux wades knee-deep through a flooded lock while Puffer Mines drift
and swell around him. He shoots a glowing valve on the lock wall.
Panel 3: Tide Master rises out of the water, its fin crest glowing RED, its
lances raised, a tidal wave rolling up behind it. Vex's hologram swings a
claw like a game-show host.
Panel 4: Flux fires an ochre Drill Bomb. It bores through the spray and
bursts against Tide Master's chest.
Panel 5: Tide Master's fin crest drains from red to sea blue, and it swings
the great lock gates shut. The barges stay moored, and the water runs clean.
Lettering: Panel 1, Atlas caption: "Barges now. Vex found another way."
Panel 3, Vex's ornate bubble: "Wave goodbye, droid! TIDE MASTER!" Panel 4,
Atlas caption: "Drill Bomb hurts this one!" Panel 5, Atlas caption: "Locks
shut. The barges stay home."
```

### Page 28 · Blackout Boulevard

**Characters:** FLUX, ATLAS, VEX, SECOND-SHIFT (Neon), SHIFT-MACHINES (Glow
Stalker)

```
[STYLE] [FLUX] [ATLAS] [VEX] [SECOND-SHIFT] [SHIFT-MACHINES]
Comic page with 5 panels.
Panel 1 (wide): Rooftops over a blacked-out downtown at night. Only Vex's
red billboards are lit, and bridges of light flicker across the open air
between the roofs.
Panel 2: A light bridge blinks out under Flux's feet and he leaps for the
next roof. In the dark beside him, a Glow Stalker's two eyes glint.
Panel 3: Neon Master strikes a pose on a rooftop, its neon tubes glowing
RED, throwing a blade of light like a boomerang. Vex's hologram frames the
shot with its claw-hands like a film director.
Panel 4: Flux fires a sea-blue Bubble Lance. A big bubble rolls along the
roof and bursts against Neon Master.
Panel 5: Neon Master's tubes flip to hot pink. Block by block the boulevard
lights up, windows coming back on, while Vex's billboards go dark.
Lettering: Panel 1, Atlas caption: "Lights out. Except Vex's face." Panel 3,
Vex's ornate bubble: "Lights! Camera! NEON MASTER!" Panel 4, Atlas caption:
"Bubble Lance hurts this one!" Panel 5, Atlas caption: "Lights on. Vex lost
its screens."
```

### Page 29 · Rotor Run

**Characters:** FLUX, ATLAS, VEX, SECOND-SHIFT (Rotor), SHIFT-MACHINES
(Hornet Rotor)

```
[STYLE] [FLUX] [ATLAS] [VEX] [SECOND-SHIFT] [SHIFT-MACHINES]
Comic page with 5 panels.
Panel 1 (wide): A sky airfield high above the valley. Swarms of cargo drones
with red rotor lights stream toward the distant fortress spire.
Panel 2: Flux rides a cargo quadcopter across an open span in a crosswind,
while Hornet Rotors spin up red and dive at him.
Panel 3: Rotor Master hovers in a swarm of drones, the rotors on its helmet
whirling RED, a downdraft blasting Flux back. Vex's hologram presents it,
grand but sweating.
Panel 4: Flux throws a hot-pink Neon Blade. It cuts through the drone swarm
and hits Rotor Master on its way back.
Panel 5: Rotor Master's rotors spin down from red to lime. The cargo drones
turn round and fly down to a crowd of waving worker-bots.
Lettering: Panel 1, Atlas caption: "Drones. Its last supply line." Panel 3,
Vex's ornate bubble: "The grand finale! ROTOR MASTER!" Panel 4, Atlas
caption: "Neon Blade hurts this one!" Panel 5, Atlas caption: "Every line's
cut. Vex is alone."
```

### Page 16 · The Breach

**Characters:** FLUX, PIP, ATLAS, VEX

```
[STYLE] [FLUX] [PIP] [ATLAS] [VEX]
Comic page with 4 panels.
Panel 1: In the lab, Pip projects a big hologram of the valley. Flux and the
Atlas globe watch. On the lab screens Vex panics, clutching its skull.
Panel 2 (wide, the biggest panel): The valley at night. Ten relay towers
across the valley each fire a thick beam of light, in yellow, orange, ice
blue, yellow-white, mint, cobalt, ochre, sea blue, hot pink and lime. All
ten meet at one point on the red shield dome over the black fortress, and
the shield cracks like glass.
Panel 3: The shield shatters. Vex's giant hologram face tears apart in red
static, mid-scream.
Panel 4: Pip spins in joy, its bubble showing an unlocked-padlock icon.
Flux clenches his fist.
Lettering: Panel 1, Vex's ornate bubble: "Ten relays?! Nurse! NURSE!" Panel
3, Vex's torn bubble: "No, no, NO! That shield was PATENTED!" Panel 4, Atlas
caption: "Shield's down. The Fortress is open."
Panel 2 SFX: "KRAAASH!"
```

---

## Part 4 — The Fortress

### Page 17 · Inside the Fortress

**Characters:** FLUX, ATLAS, MACHINES, VEX

```
[STYLE] [FLUX] [ATLAS] [MACHINES] [VEX]
Comic page with 5 panels. Setting: the Vex Fortress, halls of black glass
with glowing red veins and a skull motif everywhere.
Panel 1 (wide): Flux walks down a vast hall lined with EMPTY robot assembly
bays: unfinished armour frames with missing plates and missing claws, dry
coolant pipes, dead power rails, empty freight racks, empty ore bins, dark
screens and empty drone cradles. The body parts the villain never got.
Panel 2: A Guardroid and a Shield Trooper charge. Flux parries the Guardroid's
huge fist, sparks flying.
Panel 3: Flux climbs a ladder up a vertical shaft inside the spire while a
crusher slams just below his feet.
Panel 4: Every screen in the hall lights up with Vex in a doctor's pose,
claw-hands spread in welcome.
Panel 5: Flux reaches a giant skull-shaped boss shutter at the top,
glowing red.
Lettering: Panel 1, Atlas caption: "Half-built. You did that." Panel 3,
Flux SFX: "Yikes!" Panel 4, Vex's ornate bubble: "Welcome to my clinic!
Take a seat… FOREVER!"
```

### Page 18 · The Mk-I

**Characters:** FLUX, ATLAS, MK-I, VEX

```
[STYLE] [FLUX] [ATLAS] [MK-I] [VEX]
Comic page with 5 panels. Setting: a round arena at the peak of the spire,
tall windows all around showing the night valley, with ten relay lights
glowing in their colours around the ring.
Panel 1 (big): The Mk-I descends from above on red thrusters, claws spread,
Vex's hologram grinning inside the glass dome.
Panel 2: A close-up of Flux, eye-lights narrow, determined.
Panel 3: The Mk-I throws a flame burst. Flux slides under it.
Panel 4: The Mk-I fires an ice volley. Flux blocks with an arm up, shards
bouncing off.
Panel 5: Flux's charged amber shot slams into the Mk-I's dome. A crack
spreads across the glass.
Lettering: Panel 1, Vex's ornate bubble: "Behold! My new body! Mark ONE!"
Panel 2, Atlas caption: "That's Vex. The real one." Panel 3, Atlas caption:
"Fire!" Panel 4, Atlas caption: "Ice!" Panel 5 SFX: "KRRACK!"
```

### Page 19 · The relays hold

**Characters:** FLUX, ATLAS, MK-I, VEX, MASTERS and SECOND-SHIFT (all nine,
tiny, far away)

```
[STYLE] [FLUX] [ATLAS] [MK-I] [VEX] [MASTERS] [SECOND-SHIFT]
Comic page with 5 panels.
Panel 1: The damaged Mk-I rears up, its cracked dome crackling. Vex, furious,
monocle flying off, sends out a huge red pulse.
Panel 2 (wide): Seen from outside the spire, a red shock-ring rolls out
across the whole valley.
Panel 3 (wide): The red ring hits the ten coloured relay towers across the
valley and SHATTERS against them like a wave on rocks. Every relay stays in
its own colour. In two tiny group insets, the freed Masters look up, their
eyes staying in their own colours: Blaze, Frost, Volt and Gale in one, and
Magnet, Drill, Tide, Neon and Rotor in the other.
Panel 4: Inside, Vex's hologram clutches its skull with both claw-hands in
disbelief.
Panel 5: Flux raises his cannon, charging, with Atlas glowing steady at his
shoulder.
Lettering: Panel 1, Vex's ornate bubble: "Masters! OBEY your doctor!"
Panel 4, Vex's cracking bubble: "Why won't they LISTEN?!" Panel 5, Atlas
caption: "Because they're free."
```

### Page 20 · The fall and the empty Spire

**Characters:** FLUX, ATLAS, MK-I, VEX

```
[STYLE] [FLUX] [ATLAS] [MK-I] [VEX]
Comic page with 5 panels.
Panel 1: Flux's full charged shot, huge and amber, blasts through the Mk-I's
dome.
Panel 2: The Mk-I sinks, trailing sparks and smoke, its dome shattered. Vex's
hologram is tiny and crackling.
Panel 3: A tiny red spark slips out of the broken dome and races up the
spire's antenna into the night sky.
Panel 4: Flux stands before the spire's giant control core, dark and
silent. The Atlas globe floats over it, and the core begins to glow cyan.
Panel 5: The Atlas globe drifts back to Flux's shoulder. The control core
goes dark again. Flux gives a small nod.
Lettering: Panel 2, Vex's small bubble: "I'll get… a second opinion…"
Panel 4, Atlas caption: "The Spire's empty. I could run all of it."
Panel 5, Atlas caption: "…No. They can run themselves."
```

---

## Part 5 — Sunrise

### Page 21 · The valley wakes

**Characters:** MASTERS, SECOND-SHIFT, MACHINES (friendly worker-bots)

```
[STYLE] [MASTERS] [SECOND-SHIFT]
Comic page with 4 panels.
Panel 1 (wide): Seen from high above, the red glow rolls back into the black
fortress and vanishes.
Panel 2: One relay tower after another flips from red to its own colour
across the valley: yellow, orange, ice blue, yellow-white, mint, cobalt,
ochre, sea blue, hot pink, lime.
Panel 3: Airships lift from the sky-docks with mint sails. Friendly
worker-bots pour out into the streets, waving.
Panel 4: The nine freed Masters stand on a ridge together, each in its own
colour, looking toward the lab dome: Blaze, Frost, Volt and Gale in front,
Magnet, Drill, Tide, Neon and Rotor beside them.
Lettering: none (a wordless page).
```

### Page 22 · Gauss wakes

**Characters:** FLUX, PIP, ATLAS, GAUSS

```
[STYLE] [FLUX] [PIP] [ATLAS] [GAUSS]
Comic page with 5 panels. In the lab, in warm morning light.
Panel 1: Flux beams in on the teleporter pad in a cyan column.
Panel 2: The frost on Gauss's capsule cracks and melts, dripping. The
heartbeat light glows steady.
Panel 3: The glass slides down. Gauss steps out, leaning on her tuning-fork
cane, eyes brightening to cyan.
Panel 4: Pip spins happy circles around her, its bubble showing a heart
icon.
Panel 5: Gauss rests a hand gently on Flux's crown. Her eyes go to the small
cyan disc in his chest, and she smiles. The Atlas globe glows warmly.
Lettering: Panel 5, Gauss's regular soft speech bubble: "Welcome home. Both
of you."
```

### Page 23 · Dawn over Cyber City

**Characters:** FLUX, ATLAS, PIP, GAUSS

```
[STYLE] [FLUX] [ATLAS] [PIP] [GAUSS]
Comic page with 2 panels.
Panel 1 (full-width splash, 80 % of the page): Dawn over Cyber City. Every
district glows in its own colour for the first time: yellow, orange, ice
blue, yellow-white, mint, cobalt, ochre, sea blue, hot pink, lime. On the
far cliff the black fortress spire stands
dark, crowned with one calm WHITE light. In the foreground, on the lab
dome's balcony, stand Flux, Gauss and Pip, seen from behind, looking out,
with the tiny cyan Atlas globe at Flux's shoulder.
Panel 2 (thin strip at the bottom): A close-up of the sky over the fortress.
A tiny red spark blinks once among the fading stars.
Lettering: Panel 2, Atlas caption: "Flux… did you see that spark?" Bottom
corner: "THE END?"
```

### Page 24 · Sting (optional, for New Game+)

**Characters:** VEX

```
[STYLE] [VEX]
Comic page with 3 panels on a pure black background.
Panel 1: Black, with one single red pixel glowing in the centre.
Panel 2: Glitch blocks assemble around the pixel into half of a red skull
faceplate.
Panel 3: Vex's full red skull face, grinning in the dark, a brand-new
monocle clicking into place.
Lettering: Panel 3, Vex's ornate bubble: "The doctor… is IN."
```
