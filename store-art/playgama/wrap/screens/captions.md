# Wrap gameplay screenshots

For the Wrap form: Game Images → Gameplay screenshots, one caption each, in
this order. Each file is 1920×1080 PNG (at most 1.3 MB), a frame of real
gameplay with the real HUD and English UI.

| File | Caption |
| --- | --- |
| `1-charged-shot.png` | Charge your cannon and blast rogue machines |
| `2-parry.png` | Block and parry right as the warning ring closes |
| `3-scrapper-boss.png` | Take down each sector's boss |
| `4-flame-wave.png` | Win boss weapons: fire, ice, lightning, wind and scrap |
| `5-supply-chest.png` | Crack open supply chests for new gear |
| `6-hub-flux.png` | Upgrade your gear and wire new skills |

What each one shows:

1. Volt Tower: a charged cannon shot about to hit a striding Guardroid, with
   the lock-on brackets and the Guardroid's level and health bar.
2. Cryo Plant: the white warning ring closes over a Guardroid's combo while
   Flux's hex shield is up. This is the parry window.
3. Scrapyard arena: the Scrapper is hit by a charged shot ("PERFECT!", 106
   damage), with the boss marker and the "Defeat Scrapper" objective.
4. Vex Fortress: a Flame Wave fireball rolls into a Guardroid. The cannon is
   tinted red while the weapon is equipped.
5. Sky Docks: a legendary supply chest opens with its gold rarity beam and the
   loot toast.
6. Hub: Flux on the teleporter pad with a helper drone, beside the Flux tab (name plate,
   special weapons, cannons, systems and upgrades).

The frames were staged in a dev build: a seeded save, the camera placed and
the simulation stepped frame by frame. The game's dev hooks were used only to
set up each scene, and nothing from them is visible in the frames. The machines
are mid-stride or mid-attack in every shot.
`node scripts/render-thumbnail.mjs --set playgama --sheet` adds these files
to `previews/sheet.png`.
