# Art to-do: what a painted file replaces

Everything the game draws today is made in code: low-poly rigs, vector icons,
canvas textures. That is the placeholder set. A file dropped into `public/`
under the name of the thing it replaces takes over at the next build, with no
code change (`src/game/assets/overrides.ts`; the folders are scanned by
`assetOverridesPlugin` in `vite.config.ts`).

Rules for every file:

- `.webp` preferred (`.png` / `.jpg` are read too). The file NAME is the id
  in the tables below, exactly, case included: `ironBroadsword.webp`.
- Square, transparent background for icons. The pipeline (`art-sheets/README.md`)
  writes them at **192 × 192** (drawn at 40 to 72 px, so 192 covers 2.5×
  screens); a hand-made file may be up to 256. Portraits the same, head and
  shoulders, cut to the bust with no margin under it.
- Run `pnpm compress-folder-with-backup` afterwards (originals go to the gitignored `public-backup/`, never beside the art, or they would ship). The compressor's
  `*-original.*` backups are ignored by the build.
- Style: GDD §2 and `game-and-feel-reference.jpg`. Chunky, cute, low-poly,
  two-tone cel shading, thick dark outline (RGB 15, 12, 25), no gradients
  that fight the cel look, readable at 40 px.

The painter's round trip (reference sheets cut from the game's own drawings,
prompts, slicer) is in [`art-sheets/README.md`](./art-sheets/README.md):
`pnpm art:export`, `pnpm art:desk`, `pnpm art:slice`, `pnpm art:status`.

Check a drop: start `pnpm dev`, open `/#/models` → **Painted vs drawn**, or
the bag / a trainer / the map. A file
that fails to decode keeps the placeholder and logs one warning.

## Item icons — `public/images/items/<id>.webp` (44)

The frame colour around the icon is the tier's and stays code-drawn; paint
the object only.

| Slot | Ids |
| --- | --- |
| Main hand (14) | `rustedShortsword` `apprenticeStaff` `scoutsHandgun` `ironBroadsword` `vipinsStiletto` `aetherCarbine` `ashenGreatsword` `archmageWand` `chronoBlade` `bloodForgedAxe` `voidCannon` `dragonSmasher` `bladeOfTheUnbound` `aetheriumDestroyer` |
| Off hand (8) | `woodenBuckler` `tomeOfNovices` `ironShield` `syringeOfTheAdept` `aethericBattery` `aegisTowerShield` `orbOfEternalFlame` `shieldOfTheFallen` |
| Body (12) | `paddedTunic` `leatherDoublet` `chainmailVest` `scholarsRobe` `reinforcedPlate` `assassinsGarb` `chronoWeaverCloak` `bloodSoakedPlate` `exoArmorChassis` `dragonscaleHauberk` `vestmentsOfSovereign` `armorOfTheTitan` |
| Trinket (10) | `copperBand` `ringOfMending` `bandOfSwiftness` `castersEmblem` `infiltratorsCharm` `timekeepersHourglass` `ringOfTheVampyre` `sovereignsSignet` `heartOfTheMountain` `ringOfAbsolutePower` |

## Skill icons — `public/images/skills/<id>.webp` (48)

Square for active skills, the same square for passives (the game masks a
passive to a circle). One accent colour per class.

| Class (accent) | Ids, in unlock order |
| --- | --- |
| Aegis Knight (gold `#ffd84a`) | `shieldSlam` `aegisAura` `radiantStrike` `fortitude` `tauntingCry` `holyBastion` |
| Shadowblade (violet `#9c7bff`) | `shadowstep` `lethality` `venomousBlade` `evasion` `smokeBomb` `danceOfBlades` |
| Pyromancer (orange `#ff7a3a`) | `fireball` `cauterize` `flamePillar` `pyromaniac` `combustion` `cataclysm` |
| Grand Sovereign (amber `#ffb04a`) | `royalGuard` `inspiringPresence` `commandFocus` `sovereignsTribute` `bannerOfVictory` `armyOfTheRealm` |
| Chrono-Weaver (cyan `#5fd8ff`) | `temporalStasis` `hasteField` `timeDistort` `paradoxShift` `entropy` `chronoRewind` |
| Blood Alchemist (crimson `#ff4a6a`) | `sanguineFlask` `bloodTransmutation` `essenceHarvest` `hemophilia` `mutagenicRage` `philosophersCrucible` |
| Aether-Tech (teal `#4ff0c8`) | `aetherPistol` `deployTurret` `ventHeat` `thermalOverload` `orbitalBeam` `exoSuit` |
| Geomancer (sand `#c79a5a`) | `stoneSpike` `earthBarrier` `seismicShock` `earthenSkin` `petrify` `tectonicRupture` |

Content note: the Blood Alchemist reads as alchemy (vials, red "essence"),
never as gore or self-harm. Portals rate this game for 13 and under.

## Portraits — `public/images/portraits/<look>.webp`

Shown round, in dialogues, shops, trainers and the hero frame.

- The hero: `hero` (one portrait; the code-drawn one follows the gear worn).
- Quest speakers: `goblinKing` `warlord` `dwarf` `oracle` `dragon` `archDemon`
- Townsfolk: `smith` `peddler` `elder` `healer` `goblinTrader` `fence` `tinker`
  `captain`
- Trainers: `trainerAegis` `trainerShadow` `trainerPyro` `trainerSovereign`
  `trainerChrono` `trainerBlood` `trainerAether` `trainerGeo`

## UI — `public/images/ui/<name>.webp`

| Name | What | Size |
| --- | --- | --- |
| `map` | The world map's parchment (the nodes, roads and labels are drawn over it; node positions are in `src/game/data/zones.ts`, `MAP[].at`, as fractions of the sheet) | 1376 × 768 from the pipeline (any 16:9 up to 2048 wide), stretched to the sheet |
| `coin` | The gold coin beside every price | 64 × 64 from the pipeline (up to 128) |

## Textures — `public/images/textures/<name>.webp`

| Name | What |
| --- | --- |
| `ground` | Tiling GREYSCALE detail multiplied over each zone's ground colours (256 × 256, must tile, average brightness about 90 %) |

## Not replaceable by a file (yet)

- **3D characters and props.** The rigs are built in code
  (`src/game/gfx/rigs`, `terrain.ts`) to GDD §2.1's budgets. Replacing them
  with authored `.glb` models needs a loader seam; it is not a drop-in.
- **Status icons** (33, `src/components/art/glyphs.ts`, `status.*`): vector
  only. Add a `statuses` folder to `OVERRIDE_DIRS` in `vite.config.ts` and a
  `STATUS_ART` map next to `SKILL_ART` when painted ones exist.
- **The logo and app icons**: generated, see `store-art/brand/logo-final.mjs`
  and `pnpm icons`.

## Store art (not in the bundle)

Cover images and thumbnails per portal are tracked in `roadmap.md` (#1, #21).
The gameplay clips come from `pnpm preview:video`.
