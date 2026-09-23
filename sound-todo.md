# Sound — drop-in list

Every sound in the game is synthesized: chiptune recipes in
`src/game/audio/synth.ts` and a composed score in `src/game/audio/music.ts`.
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
  seamless loop (no fade at either end). Style: upbeat blue-bomber-era
  chiptune/rock, 140–170 BPM for sectors. Originals only: no melodies taken
  from existing games.
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
| `boss.mp3` | every Core Master fight | urgent, 170 BPM, 30–60 s loop |
| `victory.mp3` | results screen, mission won | one-shot fanfare, 2–3 s, NOT looped |
| `defeat.mp3` | results screen, mission failed | one-shot sting, 2–3 s, NOT looped |

## SFX — `public/audio/sfx/`

**Buster and combat (Cobalt)**

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
| `block.mp3` | Cobalt blocks with the shield |
| `parry.mp3` | perfect parry (crisp, rewarding) |
| `guardCrack.mp3` | Cobalt's block breaks (out of Power) |
| `slide.mp3` | Cobalt slides |
| `hurt.mp3` | Cobalt takes damage |
| `death.mp3` | Cobalt goes down (~1 s) |
| `tank.mp3` | a Repair Tank is used (refill arpeggio) |

**Machines**

| File | Plays when |
| --- | --- |
| `alert.mp3` | an enemy notices Cobalt (the "!" moment) |
| `enemyShot.mp3` | an enemy fires |
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
| `door.mp3` | a shutter door slides open |
| `chestOpen.mp3` | a supply chest opens |
| `objective.mp3` | objective progress or completion |
| `beamIn.mp3` | teleport in at mission start (~0.8 s) |
| `beamOut.mp3` | teleport out (~0.8 s) |
| `bossIntro.mp3` | Core Master name card (~1 s) |
| `levelUp.mp3` | level up (~1 s fanfare) |

**Hub and UI**

| File | Plays when |
| --- | --- |
| `loot.mp3` | a Workshop reward is claimed (Supply Drop) |
| `weapon.mp3` | a special weapon is equipped (Hero tab) |
| `denied.mp3` | an action is not possible (not enough bolts, …) |
| `uiClick.mp3` | UI tap |
| `uiOpen.mp3` | a panel or modal opens |

**Stays synthesized:** the buster **charge hum**. It is re-pitched every frame
while the button is held, so a sample cannot stand in for it.
