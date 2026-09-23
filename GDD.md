# Mega Adventure — game design document

## One line

A first-person action-RPG in the shape of *The Elder Scrolls: Blades*: take a
mission, teleport into a sector, explore it room by room, blast machine
enemies with a charge buster, loot chests, level up and spend Skill Chips on
circuit boards. The cast is original chunky, rounded androids in the spirit of
the 8-bit blue-bomber era (Mega Man 2–6), rebuilt as smooth low-poly 3D.

No town building and no endless dungeon (the Abyss is cut). What stays is the
Blades loop: **mission → explore → fight → loot → level → next mission**.

## Setting

Ampere Valley was an android city run by six Core Masters, robot foremen that
each ran a sector (refinery, cryo plant, power tower and so on). The rogue AI
**Dr. Vex** reprogrammed them and filled the sectors with hostile machines.

The player is **Cobalt**, a blue combat android with an arm buster, woken by
his maker **Prof. Gauss** (an elderly android scientist). His support unit
**Pip** is a small hovering helper bot. It runs the mission terminal, hands out
jobs and says the tutorial lines.

No humans and no fantasy creatures. Everyone is an android or a machine.

> **IP guard.** Every name, silhouette and palette is original. The game
> evokes the classic look (big round helmet, arm cannon, segmented vertical
> health bar, weapon-copy, boss shutters, beam-in teleport, orb-ring death
> burst) but never ships a Capcom name or a 1:1 character copy. Enemies are
> *archetypes*: the helmet-hider, the shield trooper, the heli drone, the
> hopper, the wheel roller and the heavy brute.

## The loop

```
Hub (mission terminal)  →  pick story mission or job  →  beam in
   ↑                                                        ↓
   │        explore rooms · open doors · smash crates · open chests
   │        enemies notice you → lock-on combat → kill → XP / bolts / loot
   │        objective done → beam out
   │                                                        ↓
   └──  results (XP, bolts, items) → level up → Skill Chip + attribute pick
        → equip / upgrade gear → spend chips on circuits → next mission
```

## Controls

| Action | Touch | Desktop |
| --- | --- | --- |
| Move | floating joystick on the **left half** | WASD / arrow keys |
| Look | drag on the **right half** | mouse drag (right half or anywhere w/o joystick) / arrow ← → when not moving |
| Walk to point | **tap the floor** (Blades' signature). A* path over the nav grid, a ground ring marks the target | click floor |
| Interact | tap the door / chest / NPC / item (or the contextual ⓔ button) | click it, or `E` |
| Fire | **tap** anywhere in combat → quick buster shot at the locked target | left click / `Space` |
| Charge shot | **hold** → the ring around the crosshair fills (lv1 → lv2). Release at full = Charged Shot. Release inside the **perfect flash** window = critical | hold LMB / `Space` |
| Block / Parry | hold the **shield** button (bottom-left). Blocking while an enemy's attack ring closes = **Parry**: projectiles reflect, melee staggers | hold RMB / `Shift` |
| Slide | **Slide** button, or a fast swipe down on the left half. Short dash with i-frames | `Q` / `Ctrl` |
| Special weapons | two slot buttons (right side), cost Weapon Energy | `1` / `2` |
| Repair Tank | tank button, full heal, limited count | `H` |
| Switch target | horizontal swipe on the right half during combat | `Tab` |
| Pause / map | ⏸ top-right | `Esc` / `P`, `M` |

**Combat lock-on.** Once an enemy has noticed Cobalt and is within 16 m, the
camera soft-locks onto the nearest engaged enemy: yaw eases toward it and look
drag is suppressed so a hold-to-charge is never mistaken for a look drag.
Movement stays live, so circle-strafing around projectiles is the MegaMan-style
skill layered on the Blades rhythm. When the last engaged enemy dies the lock
releases and free look comes back.

## Combat rules

| Rule | Value |
| --- | --- |
| Quick shot | 1 pellet, dmg `buster × 1.0`, fire cooldown 0.22 s, 3 pellets max in flight (classic cap) |
| Charge | lv1 at 0.55 s (dmg × 2.2, pierces), lv2 **full** at 1.2 s (dmg × 4, staggers, breaks guards). Skill `Quick Charge` shortens both |
| Perfect release | a window of 0.22 s that opens 0.1 s after full charge. Release inside it for a **crit** (× 1.5, gold burst, hit-stop) |
| Block | while held: frontal damage × 0.25, costs **Power** (stamina) = 40 % of the blocked damage. At 0 Power the guard breaks and Cobalt is stunned for 0.6 s |
| Parry | block pressed within the enemy telegraph's last **0.28 s** (the ring is nearly closed and flashes white). Projectile → reflected at 2× damage. Melee → enemy stunned for 1.6 s, taking × 1.5 damage |
| Slide | 0.28 s dash of 4.2 m, i-frames 0.2 s, cost 25 Power, cooldown 0.7 s |
| Power | 100 base, regenerates 22/s when not blocking (1 s delay after spending) |
| Weapon Energy (WE) | 28 segments base (the classic bar). Special weapons spend it. Refilled by WE capsules and by leveling |
| Health | 28 segments shown; internally `maxHp` (100 base), the bar draws `ceil(hp / maxHp × 28)` segments |
| Hit-stun on Cobalt | 0.25 s flinch, 0.8 s i-frames with blink (classic) |
| Weakness | every Core Master is weak to one special weapon (× 2.5 dmg + stagger). Elemental enemies are weak to the counter element (× 1.75) |
| Invulnerable states | Hardhat hidden, Shield Trooper guarding from the front: shots **deflect** with a "tink" and a diagonal ricochet. Charged lv2 breaks a guard |

Enemies **telegraph** every attack with a shrinking ring above them: orange
means block, red means unblockable (slide out of it). The ring's last 0.28 s
flashes white. That is the parry window.

## Enemies (archetypes)

| Id | Name | Behaviour | Teaches |
| --- | --- | --- | --- |
| `hardhat` | Hardhat | Hides under an invulnerable helmet, peeks, fires a 3-way spread, hides again | patience and timing |
| `trooper` | Shield Trooper | Guards the front with a big shield, lowers it to fire a 3-round burst, sometimes hops | charge shots break guards, parry the burst |
| `heli` | Rotor Drone | Hovers at head height, swoops in for a ram (blockable melee) | parry melee |
| `hopper` | Stomper | One-eyed hopping walker. Leaps and lands with an AoE stomp (red: unblockable) | slide out of red rings |
| `roller` | Gear Roller | Rolls in a straight charge, stuns itself on walls | sidestep and punish |
| `brute` | Guardroid | Big and slow: two-hit punch combo plus a ground slam | block, then parry |
| `turret` | Wall Cannon | Stationary, lobs arcing shells | move while shooting |

Region variants tint the same rig and add an element: **Blaze** (fire, burn
DoT), **Cryo** (ice, slow), **Volt** (electric, chain). **Elites** have a gold
trim, × 2.5 HP, one affix (shielded, swift, volatile, regenerating) and a name
tag.

### Core Masters (bosses)

A boss room sits behind a double shutter door. The fight opens with a name
card, and the boss has 3 or 4 patterns with a phase change at 50 % HP.

| Boss | Sector | Patterns | Drops weapon | Weak to |
| --- | --- | --- | --- | --- |
| Scrapper (mini, tutorial) | Scrapyard | charge, scrap toss, stomp | **Scrap Burst** (3-way spread) | — |
| Blaze Master | Blaze Refinery | fire wave, leaping slam, flame ring | **Flame Wave** (ground fire, burn DoT) | Ice Lance |
| Frost Master | Cryo Plant | ice lance volley, freeze floor, dash | **Ice Lance** (piercing, freezes) | Thunder Arc |
| Volt Master | Volt Tower | chain lightning, orb storm, teleport | **Thunder Arc** (chains to 3) | Gale Guard |
| Gale Master | Sky Docks | tornado push, feather blades, dive | **Gale Guard** (orbiting shield, throwable) | Flame Wave |
| Dr. Vex Mk-I | Vex Fortress | every pattern above, 3 phases | — (credits + New Game+) | none |

## Progression

- **XP and level.** XP comes from kills, quests and first-time chest opens. The
  curve is `xpToNext(L) = round(60 × L^1.55)`, level cap 40. Every level-up
  gives **+1 Skill Chip** and a pick of one attribute: **+10 Max HP**,
  **+4 Max WE** or **+10 Power** (the Blades triad). The levelled stat is also
  refilled.
- **Enemy level** comes from the sector's base level plus the player's level
  (Blades-style soft scaling): `clamp(regionMin, playerLevel ± 1, regionMax)`.
- **Bolts** are the single currency (Poki-safe). They drop from enemies, crates
  and chests and are spent in the Workshop.

### Skill system — the three circuit boards

Skill Chips are spent on nodes. Each node has ranks, and a node unlocks once
the node before it has at least one rank. Respec costs bolts.

**Buster Circuit (offense)**

| Node | Ranks | Effect / rank |
| --- | --- | --- |
| Rapid Pellets | 5 | quick-shot dmg +10 % |
| Quick Charge | 3 | charge time −10 % |
| Mega Charge | 5 | charged dmg +12 % |
| Perfect Timing | 3 | perfect window +25 %, crit × +0.15 |
| Piercing Core | 1 | charged lv1 also breaks guards |
| Giga Buster | 1 | a 3rd charge level (hold 2 s): × 7 dmg, splash |

**Armor Circuit (defense)**

| Node | Ranks | Effect / rank |
| --- | --- | --- |
| Reinforced Frame | 5 | max HP +8 % |
| Barrier Tuning | 3 | block Power cost −15 %, block dmg −5 % |
| Parry Protocol | 3 | parry window +0.05 s, parry stun +0.3 s |
| Auto-Repair | 3 | regen 1 % max HP/s out of combat |
| Spike Plating | 3 | reflect 15 % of blocked dmg |
| Last Stand | 1 | once per mission survive a lethal hit at 1 HP |

**Core Circuit (utility and special weapons)**

| Node | Ranks | Effect / rank |
| --- | --- | --- |
| Energy Cells | 5 | max WE +3 segments |
| Weapon Mastery | 5 | special weapon dmg +10 % |
| Efficient Cores | 3 | WE cost −10 % |
| Slide Boosters | 3 | slide cooldown −15 %, cost −5 |
| Bolt Magnet | 3 | bolts +15 %, pickup radius +40 % |
| Tank Capacity | 2 | +1 Repair Tank capacity |
| Scanner | 1 | chests and objectives on the pause map, enemy HP numbers |

**Special weapons** (the MegaMan "weapon copy") are separate from the boards.
Each one comes from a boss, is equipped in one of **2 slots** and levels up
through use (kills with that weapon grant weapon XP, 3 ranks). Equipping one
tints Cobalt's arm cannon in its colour, as the classic did.

### Gear (loot)

| Slot | Main stat |
| --- | --- |
| Buster (arm cannon) | damage, plus charge speed / fire rate rolls |
| Helmet | armor + HP |
| Chest | armor + HP |
| Boots | armor + slide / move speed |
| Chip × 2 | pure affixes (crit, WE regen, bolts, element resist) |

Rarity (weights at drop time): Standard 60 % (white), Tuned 28 % (blue),
Prototype 10 % (purple), Legendary 2 % (orange). An item has an item level (the
enemy or quest level) and 0–3 affixes by rarity. Gear **recolours Cobalt's
model** in the Hero screen and in the first-person arm.

**Workshop:** upgrade an item (+1 level, cost `25 × lvl^1.4` bolts, max +10),
salvage an item for bolts, buy a Repair Tank (150 bolts), refill tanks.

## Missions

- **Story missions**, one chain per sector: reach the sector core → defeat the
  Core Master. Beating a boss unlocks its weapon and the next sector.
- **Jobs**, the repeatable Blades jobs. The terminal shows 3 at a time. Taking
  one generates a fresh map from `(sector, seed)`. Templates:
  - *Scrap Duty*: destroy N (6–12) enemies of type X.
  - *Data Recovery*: collect N (3–5) data cores scattered across rooms.
  - *Rescue*: find the stranded worker-bot and escort it to the exit beacon.
  - *Elite Hunt*: defeat the named elite.
  - *Supply Run*: open N (3–4) supply chests.
  - *Purge*: clear every room.
- **Rewards:** XP + bolts + one item roll (rarity bias grows with difficulty).
  A rewarded ad offers **×2 bolts** on the results screen.

The **first mission** (tutorial: "Wake-Up Call", Scrapyard) starts with no menu.
The player beams straight in and Pip's one-line tips teach move → look → fire
→ charge → block/parry → chest → mini-boss. It should take about 4 minutes.
Losing is possible, but damage is scaled down to 60 % until the mini-boss.

### Maps

Maps are generated procedurally on a cell grid with 3 m cells:

- 6–11 rooms (rectangles of 3×3 to 7×7 cells), connected into a spanning tree
  plus 1–2 loops by 1-cell corridors. Doors are sliding shutters between rooms
  and corridors (the boss door is a double shutter).
- Room roles: `start` (teleporter pad), `combat`, `treasure` (chest, sometimes
  locked behind an elite), `objective` (data core, rescue bot), `boss`, `exit`.
- Walls, pillars, pipes, crates and barrels come from the sector theme, with
  wall panels and light strips for readability.
- Navigation uses the same grid for circle-vs-grid collision, grid ray line of
  sight, and A* for tap-to-move and enemy chase.

### Hub

After a mission the game goes to the **Hub**. It is a UI screen over a live 3D
backdrop of Cobalt idling on the teleporter pad in Gauss's lab. The tabs are
**Missions** (sector map plus the job board), **Hero** (gear, stats, 3D paper
doll), **Circuits** (skills) and **Workshop**. The Hub is a menu, not a town:
there is no building.

Death means **Mission failed**: the player keeps the XP and bolts earned and
loses the quest progress. The options are *Revive* (rewarded ad, once per
mission, full HP) or *Retreat to Hub*.

## Art direction

- **Low poly, rounded, never cubey.** Everything is built from capsules,
  spheres, lathes and tori at modest segment counts (8–16) with **smooth
  normals**. The shading is **toon** (3-step gradient ramp) with **inverted-hull
  outlines** (dark navy, never pure black). Proportions follow the classic
  sprite era: big head and helmet, round shoulders, oversized boots and
  forearms, short torso.
- Palette: saturated primaries on light, clean sector backdrops. Cobalt is
  `#1f6bff` / `#39c6ff` with a skin-tone face and big eyes. Enemies read by
  silhouette and by a signature colour (Hardhat yellow, Trooper green, Drone
  red, Stomper purple, Roller orange, Brute steel).
- VFX: pooled additive sprites for pellets, charge glow, sparks, ring shocks,
  bolt pickups and the **orb-ring death burst**. Hit-flash is a white emissive
  pulse. Damage numbers are pooled DOM elements. Screenshake, hit-stop on crits
  and parries.
- Audio: all SFX and music are synthesized at runtime, chiptune-style (square
  and triangle waves plus noise), with drop-in override files under
  `public/audio` (Phase 3).

## Feel (the non-negotiables)

- Tap-fire must hit **the same frame** and a charged release must feel heavy:
  a muzzle flash, recoil on the arm, hit-stop and a camera kick.
- Every enemy attack is readable a beat ahead (telegraph ring plus a body wind-up).
- Loot pops: chests burst open with light shafts, items fly out, and rarity
  sets the colour of the beam.
- Level-up is an event: a full-screen flash, a jingle and the attribute pick.
- The first 10 seconds are already gameplay.

## Deliberately not in the game

Town building, the endless Abyss, lockpicking minigame, crafting from
materials, PvP arena, timers/energy systems, a second currency.

## Standard requirements block

> In GENERAL for all work: Do your work on a high-fidelity basis, don't do
> just good enough. Make the interactions feel good, add vfx juice where
> applicable (optimize to not overload the CPU/GPU). Don't take shortcuts.
> After planning, write the plan into `game-implementation-plan.md` to
> continue from if a session ends unexpectedly.
> The game starts right into the first scene, no main menu.
> Fully responsive: all mobile orientations, min portrait 320×658px, tablet
> and desktop up to fullscreen. No fixed px where avoidable — use %, vw/vh.
> Respect safe-area insets. Images are not selectable/draggable like normal
> web content but must allow drag and click events for game logic.
> Optimize for web-game standards: fast jump into gameplay (hot-path
> loading), delay uncritical assets until after first paint.
> Save ALL state variables in one object named `mega_adventure_state`.
