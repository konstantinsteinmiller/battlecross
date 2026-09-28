# Sound — drop-in list

Every sound in the game is synthesized: chiptune recipes in
`src/game/audio/synth.ts` and a composed score in `src/game/audio/songs.ts`
(sequenced by `music.ts`).
A file dropped in with the right name REPLACES that one sound. The synth stays
as the fallback for anything missing, so files can arrive one at a time.

- **How:** put the file in the folder below, named exactly as listed. It is
  picked up at build time (dev reloads by itself). No code change and no
  manifest edit.
- **Format:** `.mp3` plays everywhere. `.ogg` is smaller but needs iOS 17+.
  `.m4a` (AAC) also works. Ship ONE file per name.
- **SFX:** mono, 44.1 kHz, peak −3 dBFS, no leading silence, 96 kbps is
  plenty. Style: 8/16-bit console blips and bursts (pulse and noise), punchy,
  under 0.6 s unless noted.
- **Music:** stereo, 44.1 kHz, about −16 LUFS integrated, 128 kbps,
  seamless loop (no fade at either end). Originals only: no melodies taken
  from existing games. Area themes: upbeat blue-bomber-era chiptune/rock,
  140–170 BPM for sectors.
- **Rotation:** outside a boss fight the game does not loop one theme — it
  rotates *area theme → `drift` → `circuit`*, moving on at the end of a pass
  once a song has played ≥ 45 s. A dropped-in rotation song plays whole
  passes the same way, so a 30 s file plays twice. `boss` loops for as long
  as the fight lasts.
- **Hear / measure the composed score:** `node tools/music-render.mjs --out
  <dir>` renders every song to mp3 and prints its loudness; keep a
  replacement within ~1 LU of the song it replaces.
- All audio routes through the game's volume, mute, pause and ad gates
  automatically.

## Music — `public/audio/music/`

| File | Plays | Notes |
| --- | --- | --- |
| `hub.mp3` | Gauss's lab (hub), and everywhere when the player picks "Calm Circuits" | calm, 100–115 BPM, 60–90 s loop |
| `scrapyard.mp3` | Scrapyard sector (tutorial) | driving, minor, 150 BPM |
| `blaze.mp3` | Blaze Refinery | hot, aggressive, 160 BPM |
| `cryo.mp3` | Cryo Plant | cool, dorian, 144 BPM |
| `volt.mp3` | Volt Tower | electric, syncopated, 155 BPM |
| `gale.mp3` | Sky Docks | airy, lydian, 150 BPM |
| `fortress.mp3` | Vex Fortress (final sector) | dark, phrygian, 165 BPM |
| `drift.mp3` | rotation song 2, everywhere but boss fights | "Neon Drift": synthwave, 100 BPM, A minor, ~60 s |
| `circuit.mp3` | rotation song 3, everywhere but boss fights | "Deep Circuit": lo-fi, swung, 84 BPM, ~60 s |
| `intro.mp3` | the intro cutscene | "Wake-Up Call": action, 150 BPM, E minor; scored to the cutscene's 57 s (one 16th = 0.1 s, so 1 s = 2.5 beats; the full section map is in `songs.ts`), so a file must keep that timing to line up. Its cues: the run 0–3.2 s, the slide in half time 3.2–5.6, the charge 5.6–8.0, the release hit at 8.0, silence 8.1–9.2, the rewind 9.2–10.8, the valley 11–14.6 (G, then C), hits on the Spire's flash 14.6 and on Blaze's cut-in 19.4 (and 20.3), Vex's motif at 15.0 and 17.4, the lab 21–28.4 (thinner 24.4–26.0 for the disc, which clicks in at 25.5), the lever hit 28.4, safe mode 31–36 (cold, heartbeat every 1.3 s from 34.4), the wake-up 36–49 (the HUD boots 41.2, the riff returns 46), the beam 49–54.8 (the column rises 52.2), the flash chord at 54.8 ringing to 57, then a loopable groove bar from 57.6. Loops (from 57.6 s) if anything holds |
| `boss.mp3` | every Core Master fight | "Overload": cinematic, 140 BPM, D minor — taiko, low-string ostinato, brass, choir; 50–60 s loop |
| `victory.mp3` | results screen, mission won | one-shot fanfare, 2–3 s, NOT looped |
| `defeat.mp3` | results screen, mission failed | one-shot sting, 2–3 s, NOT looped |

## SFX — `public/audio/sfx/`

**Buster and combat (Flux)**

| File | Plays when |
| --- | --- |
| `shoot.mp3` | quick buster pellet (very frequent — keep it short and soft, < 0.12 s) |
| `charge1.mp3` | charge reaches level 1 (ping) |
| `charge2.mp3` | charge reaches full (brighter ping) |
| `chargeShot.mp3` | level-1 charged shot released |
| `chargeShotBig.mp3` | full / Giga charged shot released (big, ~0.5 s) |
| `crit.mp3` | a critical or perfect-timing hit |
| `hit.mp3` | a shot hits a machine |
| `hitHeavy.mp3` | a charged shot hits |
| `tink.mp3` | a shot bounces off a guard (Hardhat helmet) |
| `guardBreak.mp3` | a full charge breaks an enemy guard |
| `block.mp3` | Flux blocks with the shield |
| `parry.mp3` | perfect parry (crisp, rewarding) |
| `guardCrack.mp3` | Flux's block breaks (out of Power) |
| `slide.mp3` | Flux slides |
| `hurt.mp3` | Flux takes damage (played panned toward the hit's source, muffled from behind) |
| `death.mp3` | Flux goes down (~1 s) |
| `tank.mp3` | a Repair Gel is used (refill arpeggio) |

**Machines**

| File | Plays when |
| --- | --- |
| `alert.mp3` | an enemy notices Flux (the "!" moment) |
| `enemyShot.mp3` | an enemy fires |
| `whizz.mp3` | an enemy shot about to hit Flux from off-screen (a short air-rip, ~0.2 s; played panned to its side) |
| `lob.mp3` | an enemy or boss lobs an arcing shot |
| `jump.mp3` | a hopper jumps |
| `stomp.mp3` | a heavy landing or boss slam (low, with a shockwave feel) |
| `dash.mp3` | an enemy or boss dashes |
| `bonk.mp3` | a melee impact |
| `punch.mp3` | a brute or boss swing |
| `explode.mp3` | a machine is destroyed (~0.5 s) |

**World and pickups**

| File | Plays when |
| --- | --- |
| `bolt.mp3` | bolt (currency) pickup — very frequent, tiny |
| `heal.mp3` | health capsule pickup |
| `energy.mp3` | weapon-energy pickup |
| `borrowGet.mp3` | a borrowed-weapon capsule is taken ("weapon get": rising arpeggio past the octave, a held top note, ~0.8 s — grander than any pickup) |
| `borrowSpent.mp3` | the borrowed weapon's last charge is spent (short falling blip + puff, ~0.25 s) |
| `door.mp3` | a shutter door slides open |
| `chestOpen.mp3` | a supply chest opens |
| `objective.mp3` | objective progress or completion |
| `beamIn.mp3` | teleport in at mission start (~0.8 s) |
| `beamOut.mp3` | teleport out (~0.8 s) — no longer played: the exit drone replaced the beam-out |
| `droneArrive.mp3` | the exit drone flies in over the walls (falling whoosh + low motor, ~1.5 s) |
| `droneHum.mp3` | one pulse of the exit drone's rotors (~0.6 s swell; re-triggered every 0.4 s while it hovers, so it must loop-overlap cleanly) |
| `droneHumHi.mp3` | the same rotor pulse spun up for the climb out (~0.5 s, re-triggered every 0.3 s) |
| `deckLand.mp3` | Flux lands on the drone's deck (hollow metal clunk) |
| `liftOff.mp3` | the drone lifts off with Flux, under the LEVEL CLEARED banner (rising rush + arpeggio, ~1.3 s) |
| `bossIntro.mp3` | Core Master name card (~1 s) |
| `levelUp.mp3` | level up (~1 s fanfare) |
| `trapHiss.mp3` | a corridor flame jet warns before its burst (gas hiss, ~0.7 s) |
| `flameJet.mp3` | the flame jet bursts across the corridor (roar, ~0.9 s) |
| `bladeWhoosh.mp3` | a swinging blade comes down past the corridor's middle (swell, ~0.4 s) |
| `trapClick.mp3` | the tutorial's pressure plate gives under a foot (click + clunk) |

**Hub and UI**

| File | Plays when |
| --- | --- |
| `loot.mp3` | a Workshop reward is claimed (Supply Drop) |
| `weapon.mp3` | a special weapon is equipped (Hero tab) |
| `attrPick.mp3` | one level-up upgrade picked while more are waiting (short "ting"; the last pick plays `levelUp`) |
| `denied.mp3` | an action is not possible (not enough bolts, …) |
| `uiClick.mp3` | UI tap |
| `uiOpen.mp3` | a panel or modal opens |

**Intro cutscene** (`src/game/story/introScript.ts`, first launch and Options → Replay intro)

| File | Plays when |
| --- | --- |
| `synthPulse.mp3` | the cold open's rain hiss under the score (~2.7 s) |
| `tapeRewind.mp3` | the freeze frame rewinds into Atlas's log (tape stop, then a spool-back, ~0.8 s) |
| `relayChime.mp3` | a beam hops from relay to relay over the valley (soft bell) |
| `vexGlitch.mp3` | Dr. Vex's face glitches on: three falling square notes over a crushed noise sweep (~0.5 s) |
| `relayOut.mp3` | a relay goes red under the Red Signal (short falling blip) |
| `alarm.mp3` | the lab's red alarm (two-tone, ~0.9 s) |
| `capsule.mp3` | Gauss throws the capsule lever (heavy clunk, then a steam hiss, ~1 s) |
| `freeze.mp3` | frost races over the stasis capsule (icy crackle falling in pitch, ~0.7 s) |
| `heartbeat.mp3` | the stasis capsule's heartbeat light (soft, low lub-dub) |
| `pipChirp.mp3` | Pip pops into Flux's view (two-note chirp) |
| `bootUp.mp3` | Flux's HUD boots (rising boot chime, then the health bar's tick-fill, ~0.8 s) |

**Stays synthesized:** the buster **charge hum**. It is re-pitched every frame
while the button is held, so a sample cannot stand in for it.
