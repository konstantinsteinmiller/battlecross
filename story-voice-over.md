# Mega Droid — voice-over prep

These are notes for recording English voice-overs later. The story and every
beat are in [`story-arc.md`](./story-arc.md), and this file uses the same
lines. Nothing here is implemented.

## Principles

- **VO adds to the picture and never carries it.** Every line also has a
  glyph and an i18n subtitle, so the game plays the same with sound off,
  which is the default at first launch before the first tap.
- **Short lines.** Atlas: ≤ 7 words, about 2 s. Vex: ≤ 8 words, about 3 s.
  Barks: under 0.6 s.
- **Robots, not humans.** Every voice gets a processing chain (below). A
  clean human read breaks the cast rule "No humans, everyone is an android".
- **Drop-in, like the rest of the audio.** It follows `sound-todo.md`: a file
  with the right name replaces the fallback. If no VO file exists, the line
  plays silent with its subtitle; Flux's barks fall back to a synth chirp.

## Open decisions

1. **Which locales get English VO?** Options:
   - **(a) All locales, with localized subtitles.** This is the
     recommendation. The processed robot voices read as character sound,
     and most web-portal players are used to English VO.
   - **(b) The English locale only;** other locales get subtitles and the
     synth chirps.

   Barks are fine in English everywhere (they're onomatopoeia), but see
   `story-arc.md` §9 for localizing their subtitles.
2. **Does Gauss speak?** She has one optional line at the end. It is
   recommended: it's the emotional payoff, and it costs one actor session.
3. **The folder.** The drop-in loader today covers `public/audio/music/` and
   `public/audio/sfx/`. VO needs a third folder, `public/audio/vo/`,
   registered the same way. That is a small code change when the time comes.

## File specs

Specs follow `sound-todo.md`, plus a few rules just for voice:

- mono, 44.1 kHz, `.mp3`, 96 kbps;
- peak −3 dBFS, with dialogue normalized to about −18 LUFS short-term so it
  sits over the music;
- no leading silence, and a 50 ms tail at most;
- file name = the **VO id** below + `.mp3` (e.g. `atlas_core_online.mp3`).

When a VO file is playing, the game ducks the music by about 6 dB, and it
never ducks during an ad (the global audio gates already handle that).

---

## Cast and direction

### Atlas: Flux's field AI

- **Voice:** gender-neutral to slightly low, calm, precise and warm
  underneath. Think a mission-control navigator who's also your friend.
  Dry humour by *understatement* ("It's… big."). Never shouts, not even at
  critical HP, where it goes **tighter and faster**, not louder.
- **Processing:** a light band-pass (300 Hz–6 kHz) and a subtle short
  chorus/doubler, so it reads as "in your helmet". A soft digital
  **pre-chirp** (a 60 ms cyan blip) on each line, so players learn that the
  blip means Atlas.
- **Glitch variant** (Volt Tower): the same lines, with bit-crush, stutter
  edits and a pitch wobble. Record them clean; the glitch is post-processing.
- **Range across the story:** helpful and neutral (Prologue), then a quiet
  identity wobble at the midpoint ("…I was written from its first draft."),
  then shaken but grateful after the Volt Tower, then steady, a little proud,
  at the finale. Its choice at the Spire should sound like a decision, not a
  sacrifice.

### Dr. Vex: the showman doctor

- **Voice:** big, theatrical and pompous. A game-show host crossed with a
  vain surgeon. It relishes its words and stretches the big ones ("Maaag-
  nificent"). The comedy villain energy should be over the top but never
  scary: the audience is all ages.
- **Avoid:** imitating any specific film villain's voice or catchphrases. We
  want the archetype, not an impression.
- **Processing:** two layers. The main read is pitched down about 2
  semitones, and under it sits the same read bit-crushed and pitched down an
  octave at −12 dB. On top go a gated square-wave buzz under the consonants
  and the Vex motif sting (the three falling square notes from the synth) on
  the first bubble of each scene.
- **Range across the story:** smug and amused (Prologue and Act I), then
  irritated (Volt Tower and hub glitches), then panicking (the Breach), then
  unravelling (Mk-I phase 2), then small and crackling (the defeat line).
  The glitch amount is post-processing, so record every line clean and
  theatrical.
- **The laugh:** record 3 takes of "Mwa-ha-HA!" (short, medium, and
  maniacal) for bubbles that end in a laugh.

### Flux: barks only

- **Voice:** youthful, bright and bouncy. A plucky little robot, never pained
  or gory, and every yelp should be funny. Cartoon timing.
- **Processing:** a light ring-mod or formant shift for a metallic edge, and
  a tiny synth **tail** that matches the hit type (see the bark table).
- **Record** 3 takes of each bark, and let the game pick at random.

### Prof. Gauss: one line (optional)

- **Voice:** elderly, gentle, clever and a little amused. A grandmother who
  built half the city.
- **Processing:** a very light metallic shimmer, softer than Atlas.

### Pip: no VO

Pip stays synth chirps and glyphs, as `story.md` has it. Its two-note chirp
lives in `sound-todo.md`.

---

## Script

The i18n keys are proposals; they get added to `en.ts` and all 20 other
locales when this is implemented. "Max" is the cap on the delivered length.

### Intro cutscene

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_log_start` | `atlas.intro.log` | Atlas | "Log start." | Flat, clinical. Starts the rewind. | 1.0 s |
| `vex_diagnosis` | `vex.intro.diagnosis` | Vex | "Diagnosis: this valley is SICK. The cure… is ME!" | A grand reveal. A pause before "is ME", which is huge. | 3.5 s |
| `atlas_core_online` | `atlas.intro.online` | Atlas | "Core online. Good morning, Flux." | Soft, the first words he ever hears. Warm on "Flux". | 2.2 s |
| `atlas_scrapyard_first` | `atlas.intro.plan` | Atlas | "Scrapyard first. One relay at a time." | Matter-of-fact. The mission in one breath. | 2.2 s |

### Prologue: Scrapyard

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_boss_signal_first` | `atlas.boss.signalFirst` | Atlas | "Core Master signal. It's… big." | Deadpan understatement, with a pause before "big". | 2.2 s |
| `vex_present_scrapper` | `vex.present.scrapper` | Vex | "Warm up act! The SCRAPPER!" | A ringmaster, a bit dismissive. | 2.5 s |
| `atlas_relay_one` | `atlas.story.relayOne` | Atlas | "Relay one lit. Four to go." | The first small win. A hint of a smile. | 2.0 s |
| `vex_hub_scrapper` | `vex.hub.scrapper` | Vex | "A junk crane? How… adorable." | Mock-sweet, patronizing. | 2.5 s |

### Act I: Heat and Ice

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_blaze_beamin` | `atlas.sector.blaze` | Atlas | "Refinery. It runs hot. Mind the vents." | Brisk briefing. | 2.4 s |
| `vex_present_blaze` | `vex.present.blaze` | Vex | "The oldest! The hottest! BLAZE MASTER!" | A full boxing-announcer build. | 3.0 s |
| `atlas_no_weakness` | `atlas.boss.noWeak` | Atlas | "No weak spot I can see. Stay moving." | Focused. | 2.2 s |
| `atlas_weapon_copied` | `atlas.story.copied` | Atlas | "{weapon} copied." | Crisp. *Record one per weapon:* Scrap Burst, Flame Wave, Ice Lance, Thunder Arc, Gale Guard. | 1.6 s |
| `vex_hub_blaze` | `vex.hub.blaze` | Vex | "Side effect noted. Increasing the dose." | Clinical and irritated, like a doctor annoyed at a chart. | 2.8 s |
| `atlas_cryo_beamin` | `atlas.sector.cryo` | Atlas | "Coolant's flowing uphill. To the Fortress." | Noticing something, suspicious. | 2.4 s |
| `vex_present_frost` | `vex.present.frost` | Vex | "Chill, little droid. FROST MASTER!" | Smug about the pun. | 2.8 s |
| `atlas_left_something` | `atlas.story.dataCore` | Atlas | "It left us something." | Curious, quiet. | 1.6 s |

### Midpoint: the Blueprint

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_first_draft` | `atlas.story.firstDraft` | Atlas | "…I was written from its first draft." | The quietest line in the game. Unsettled. | 2.6 s |
| `atlas_building_body` | `atlas.story.body` | Atlas | "It's building a body. Out of our valley." | Recovering, resolve coming back. | 2.6 s |
| `vex_sketches` | `vex.hub.blueprint` | Vex | "My sketches! Magnificent, aren't I?" | Preening, delighted to be noticed. | 2.8 s |

### Act II: Storm Front

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_something_in` | `atlas.volt.hack` | Atlas | "Flux… something's in the—" | Record clean and cut off mid-word. The glitch is post. | 2.0 s |
| `vex_empty_head` | `vex.volt.hack` | Vex | "Let's see what's in that empty head…" | Creepy-playful, a burglar humming. | 2.8 s |
| `vex_unwritable` | `vex.volt.fail` | Vex | "Unwritable?! How RUDE." | Scandalized. The monocle pops. | 2.2 s |
| `atlas_kept_it_out` | `atlas.volt.thanks` | Atlas | "…You kept it out. Thank you." | Shaken, then sincere. Their bond line. | 2.4 s |
| `vex_present_volt` | `vex.present.volt` | Vex | "Blink and you'll miss it! VOLT MASTER!" | Fast and zappy. | 2.8 s |
| `atlas_power_station` | `atlas.story.voltFreed` | Atlas | "The signal's lost its power station." | Satisfied. | 2.2 s |
| `vex_perfectly_fine` | `vex.hub.volt` | Vex | "I am… per-fect-ly… FINE." | Forced calm that cracks on "FINE". Post adds stutter. | 2.8 s |
| `atlas_docks_beamin` | `atlas.sector.gale` | Atlas | "Every part for its body goes through here." | A briefing with purpose. | 2.4 s |
| `vex_present_gale` | `vex.present.gale` | Vex | "Last one! GALE MASTER, blow him away!" | Desperate showmanship. | 3.0 s |
| `atlas_no_more_parts` | `atlas.story.galeFreed` | Atlas | "No more parts reach the Fortress." | Quiet triumph. | 2.2 s |
| `vex_patented` | `vex.hub.breach` | Vex | "No, no, NO! That shield was PATENTED!" | Full tantrum. Post adds the static tear. | 3.0 s |
| `atlas_shield_down` | `atlas.story.breach` | Atlas | "Shield's down. The Fortress is open." | Steady; this is it. | 2.2 s |

### Act III: The Fortress

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_half_built` | `atlas.fortress.bays` | Atlas | "Half-built. You did that." | Proud, understated. | 1.8 s |
| `vex_clinic` | `vex.fortress.welcome` | Vex | "Welcome to my clinic! Take a seat… FOREVER!" | A villain host, relishing it. Laugh optional. | 3.2 s |
| `vex_behold` | `vex.mk1.intro` | Vex | "Behold! My new body! Mark ONE!" | The peak of vanity. | 2.8 s |
| `atlas_the_real_one` | `atlas.mk1.intro` | Atlas | "That's Vex. The real one." | Low and focused. | 1.8 s |
| `atlas_call_fire` … | `atlas.mk1.fire` / `.ice` / `.volt` / `.wind` / `.scrap` | Atlas | "Fire!" "Ice!" "Volt!" "Wind!" "Scrap!" | Sharp call-outs, on the beat of the telegraph. | 0.6 s |
| `vex_obey` | `vex.mk1.obey` | Vex | "Masters! OBEY your doctor!" | Commanding, strained. | 2.4 s |
| `vex_listen` | `vex.mk1.listen` | Vex | "Why won't they LISTEN?!" | Cracking, genuine confusion under the rage. | 2.2 s |
| `atlas_because_free` | `atlas.mk1.free` | Atlas | "Because they're free." | Calm, almost gentle. The thesis of the game. | 1.8 s |
| `vex_second_opinion` | `vex.mk1.defeat` | Vex | "I'll get… a second opinion…" | Small, fading, still smug under it. | 2.6 s |

### Ending

| VO id | Key | Who | Line | Direction | Max |
| --- | --- | --- | --- | --- | --- |
| `atlas_could_run_it` | `atlas.ending.spire` | Atlas | "The Spire's empty. I could run all of it." | Tempted. A slow realization, not greed. | 2.8 s |
| `atlas_run_themselves` | `atlas.ending.choice` | Atlas | "…No. They can run themselves." | A decision; peace. | 2.2 s |
| `gauss_welcome_home` | `gauss.ending.home` | Gauss | "Welcome home. Both of you." | Warm, tired and proud. *Optional.* | 2.4 s |
| `atlas_spark` | `atlas.ending.spark` | Atlas | "Flux… did you see that spark?" | Light and curious; a hook, not dread. | 2.2 s |
| `vex_doctor_in` | `vex.sting.doctorIn` | Vex | "The doctor… is IN." | Whispered, then a slow grin. *NG+ only.* | 2.2 s |

### Atlas: field warnings

| VO id | Key | Line | Direction | Max |
| --- | --- | --- | --- | --- |
| `atlas_boss_ahead` | `atlas.warn.boss` | "Core Master ahead." | Alert. | 1.4 s |
| `atlas_weak_to` | `atlas.warn.weakTo` | "{boss}. {weapon} hurts it." | Tactical. *Record per pairing* (5 Masters × their weapon), or record the halves and splice them. | 2.2 s |
| `atlas_use_gel_first` | `atlas.warn.gelFirst` | "Plating's cracking. Use a gel." | Concerned, a clear instruction. | 2.0 s |
| `atlas_use_gel` | `atlas.warn.gel` | "Gel." | A quick nudge. | 0.6 s |
| `atlas_critical_first` | `atlas.warn.criticalFirst` | "Critical! Back off!" | Tight and fast, **not** loud. | 1.2 s |
| `atlas_critical` | `atlas.warn.critical` | "Critical!" | Tight. | 0.7 s |
| `atlas_no_gel` | `atlas.warn.noGel` | "No gel left. Play it safe." | Worried and calm. | 1.8 s |
| `atlas_we_low` | `atlas.warn.weLow` | "Weapon energy low. Buster's free." | Practical. | 2.0 s |
| `atlas_we_empty` | `atlas.warn.weEmpty` | "Tank's dry." | Dry (pun intended). | 0.9 s |
| `atlas_borrowed_last` | `atlas.warn.borrowedLast` | "Last shot of {weapon}." | A heads-up. *Record per weapon.* | 1.6 s |
| `atlas_trap_flame` | `atlas.warn.flame` | "Vents. Wait for it… or slide." | Coaching, with a pause for "wait for it". | 2.2 s |
| `atlas_trap_blade` | `atlas.warn.blade` | "Blade. Go right after it." | Coaching. | 1.8 s |
| `atlas_crusher` | `atlas.warn.crusher` | "Crusher. Watch the lamp." | Coaching. | 1.6 s |
| `atlas_ladder` | `atlas.warn.ladder` | "Ladder. Push toward the wall." | Coaching. | 1.8 s |
| `atlas_pit` | `atlas.warn.pit` | "Long drop. Time the lift." | Coaching. | 1.6 s |
| `atlas_locator` | `atlas.hint.locator` | "Objective's that way." | Casual. | 1.4 s |
| `atlas_rescue_near` | `atlas.hint.rescue` | "Worker-bot signal. Faint. Close." | Hopeful. | 2.0 s |
| `atlas_upgrade` | `atlas.hint.upgrade` | "That's an upgrade." | Pleased. | 1.2 s |
| `atlas_level_up` | `atlas.hint.levelUp` | "New chip compiled." | Proud. | 1.4 s |
| `atlas_objective_done` | `atlas.hint.done` | "Done. Call the drone when ready." | Relaxed. | 2.0 s |
| `atlas_under_level` | `atlas.hint.underLevel` | "They'll outclass you. Train first." | An honest warning. | 1.8 s |
| `atlas_sector_floor` | `atlas.hint.floor` | "{sector} runs level {n} and up." | A briefing. *Record per sector.* | 2.0 s |
| `atlas_system_down` | `atlas.warn.down` | "Rebooting… Pip's got you." | Reassuring. | 1.8 s |
| `atlas_switch` | `atlas.hint.switch` | "Switch. Try it." | *Reserved until the level kit has levers.* | 1.0 s |

### Atlas: machine scans (first sighting)

| VO id | Key | Line | Max |
| --- | --- | --- | --- |
| `atlas_scan_hardhat` | `atlas.scan.hardhat` | "Hardhat. Shoot when it peeks." | 1.8 s |
| `atlas_scan_trooper` | `atlas.scan.trooper` | "Shield. Charge through it." | 1.6 s |
| `atlas_scan_heli` | `atlas.scan.heli` | "Rotor Drone. Look up." | 1.4 s |
| `atlas_scan_hopper` | `atlas.scan.hopper` | "Stomper. Move off the ring." | 1.6 s |
| `atlas_scan_roller` | `atlas.scan.roller` | "Gear Roller. Sidestep it." | 1.6 s |
| `atlas_scan_brute` | `atlas.scan.brute` | "Guardroid. Parry, then punish." | 1.8 s |
| `atlas_scan_turret` | `atlas.scan.turret` | "Wall Cannon. Keep moving." | 1.6 s |
| `atlas_scan_golem` | `atlas.scan.golem` | "That crate's breathing. Get close." | 2.0 s |
| `atlas_scan_elite` | `atlas.scan.elite` | "Gold ring. Elite. Careful." | 1.6 s |
| `atlas_scan_fire` / `_ice` / `_volt` / `_wind` | `atlas.scan.fire` … | "Fire-coated. It shrugs off fire." (and the same for each element) | 2.0 s |

### Flux: damage barks

Record 3 takes each. Each file is `flux_<type>_<n>.mp3` (e.g.
`flux_light_1.mp3`), and the keys are `flux.hurt.<type>.<n>`. The synth
tail is added in post.

| Type | Takes to record | Synth tail | Max |
| --- | --- | --- | --- |
| `light` | "Oof!" · "Ow!" · "Hey!" | a short tick | 0.4 s |
| `heavy` | "KLONK!" · "Arrgh!" · "Whoa-oa!" | a metal clang | 0.6 s |
| `fire` | "Yeowch!" · "Hot-hot-hot!" | a sizzle | 0.6 s |
| `ice` | "Brrr-zzt!" · "Ch-chilly!" | a crystal tinkle | 0.6 s |
| `volt` | "Bzzzt!" · "Zzap!" | a static crackle | 0.5 s |
| `wind` | "Whoa-oa-oa!" | a whoosh | 0.7 s |
| `trap` | "Yikes!" · "Not cool!" | none | 0.5 s |
| `crusher` | "Squonk!" | a squeaky-toy squash | 0.5 s |
| `pit` | "Wha— aaaa!" | a Doppler fall | 1.0 s |
| `lowHp` | "Nnngh!" | a low servo whine | 0.6 s |
| `down` | "Uh-oh…" | a power-down sweep | 0.9 s |
| `parry` | "Ha!" | a bright ping | 0.3 s |
| `gel` | "Aaah~" | a rising refill shimmer | 0.7 s |

**Direction for all barks:** comedy first. Think of a cartoon robot getting
bonked, never a real injury. Keep the energy up even on "Uh-oh…", which
should sound like "oops, I'll be back", not dying.

---

## Recording checklist

- [ ] Decide the VO locale policy (open decision 1).
- [ ] Decide on Gauss's line (open decision 2).
- [ ] Cast 3 voices (Atlas, Vex, Flux), plus Gauss if yes. Flux's barks can
      be one short session.
- [ ] Record clean, dry reads, at least 3 takes each, and keep the raw
      files. Glitch and robot processing are done in post, so they can be
      re-tuned.
- [ ] Build one processing preset per character, so a line recorded later
      matches.
- [ ] Deliver to `public/audio/vo/` with the VO ids above, once the loader
      supports that folder (open decision 3).
- [ ] Check the durations against the "Max" column. Bubbles and subtitles
      hold for the line's length, and never less than 1.8 s.
