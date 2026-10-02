# GAME DESIGN DOCUMENT: Battlecross
**Genre:** Single-Player Isometric Action RPG  
**Target Platform:** PC / Mobile / Console  
**Visual Style:** 3D Stylized Chibi / Cel-Shaded Vector Aesthetic (Battleheart Legacy Style)  

---

## 1. Executive Summary & Core Pillars

### 1.1 Overview
*Battlecross* is a spiritual successor to *Battleheart Legacy*. It features touch/click-and-drag real-time tactical combat, an open-ended multi-class skill system, and a non-linear world map. It expands upon the original formula by introducing a reactive narrative engine, permanent quest choices, and innovative class archetypes.

### 1.2 Core Pillars
1. **Tactical "Juicy" Real-Time Combat:** Touch/click-and-drag line movement, precise skill targeting, instant feedback, screen shake, hit-stop, and heavy particle visuals.
2. **Absolute Multi-Classing Freedom:** Unrestricted character progression. Players mix and match skills and passives from any unlocked class as long as they meet attribute requirements.
3. **High-Risk Open-World Exploration:** Map nodes are unlocked freely. Players can venture into high-level lethal zones early to claim high-tier loot or die trying.
4. **Consequential Narrative:** Every major quest features branching outcomes that alter NPC fates, town availability, visual world states, and endgame conditions.

---

## 2. Technical Art Style & Visual Polish Specification (AI / Tech Spec)

This section provides explicit instructions, parameters, and shader setups required for an AI coding agent, shader compiler, or procedural generation system to reproduce the signature *Battleheart Legacy* aesthetic.

### 2.1 Character & Prop Geometry Specs
* **Proportion Ratio:** 
  * Head-to-Height Ratio: 1 : 2.2 (Squat Chibi / Nendoroid style).
  * Limbs: Stubby, no distinct fingers or toes; mitten-style hands and rounded foot capsules.
  * Eyes: Large, expressive vector-style ovals (occupying 35% of facial area).
* **Poly Count Targets:**
  * Player / Humanoid Hero: 1,200 – 1,800 triangles.
  * Standard Monster: 800 – 1,500 triangles.
  * Boss Monster: 3,000 – 5,000 triangles.
  * Environment Props: 100 – 400 triangles.

```
+-------------------------------------------------------+
|                CHIBI PROPORTION SPEC                  |
|                                                       |
|                     .---------.                       |
|                    /   HEAD    \    <-- 45% Total Ht  |
|                   |  O     O   |                      |
|                    \  -----   /                       |
|                     '---------'                       |
|                      /| torso |\    <-- 30% Total Ht  |
|                     / |       | \                     |
|                    o  |_______|  o  <-- Stubby Arms   |
|                       /       \                       |
|                      /         \    <-- 25% Total Ht  |
|                     (____) (____)   <-- Capsule Feet  |
+-------------------------------------------------------+
```

### 2.2 Cel-Shading & Rendering Pipeline
To achieve the clean, flat-shaded vector look in 3D:

* **Shading Model:** 2-Tone Step Ramp Cel Shader (No smooth Phong/Blinn specular highlight transitions).
  * `Light Intensity Threshold = 0.45`
  * `Shadow Color = Base Texture * 0.65 (tinted toward deep purple/blue)`
  * `Highlight Color = Base Texture * 1.25 (flattened step)`
* **Outline Renderer:** Inverted Hull (Backface Extrusion) Shader or Custom Post-Process Depth/Normal Edge Detection.
  * `Outline Width = 0.035 units (constant screenspace scaling)`
  * `Outline Color = RGBA(15, 12, 25, 255) (Deep Dark Charcoal, never pure black)`
* **Texture Maps:**
  * Albedo Texture ONLY. No normal maps, no roughness/metallic maps.
  * High-contrast, clean vector lines baked directly into the base color map.
  * Bright, saturated pastel color palettes (HSV: Saturation 60-85%, Value 75-100%).

### 2.3 Combat "Juice" & Game Feel Parameters
Every action must provide immediate visual and auditory feedback.

```
       [ PLAYER ATTACK ]
              │
              ▼
   ┌──────────────────────┐
   │ Hit-Stop (0.06s)     │ --> Freeze time for attacker & victim
   └──────────┬───────────┘
              │
              ├──────────────────────────┐
              ▼                          ▼
   ┌──────────────────────┐   ┌──────────────────────┐
   │ Screen Shake         │   │ Dynamic Particle     │
   │ (Intensity 0.25)     │   │ Impact Burst         │
   └──────────┬───────────┘   └──────────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Bouncing Floating    │
   │ Combat Text          │
   └──────────────────────┘
```

1. **Hit-Stop (Frame Freeze):**
   * Light Attacks: Freeze game time (`Time.timeScale = 0.01`) for `0.04 seconds`.
   * Heavy / Critical Attacks: Freeze game time for `0.08 seconds`.
   * Boss Finishing Blows: Freeze game time for `0.25 seconds` with zoom-in.
2. **Camera Shake:**
   * Trauma-based camera shake formula: `Offset = Random(-1, 1) * Trauma^2`.
   * Light Hit: `Trauma += 0.2` (decay rate 1.5/sec).
   * Critical/Explosion: `Trauma += 0.6` (decay rate 1.5/sec).
3. **Floating Damage Text:**
   * Dynamic scale curve: Text spawns at scale `1.5x`, bounces to `2.0x` in 0.05s, drops to `1.0x`, then floats upward while fading out over `0.6s`.
   * Color Coding: Normal = `#FFFFFF`, Critical = `#FFD700` (Gold, 1.4x size), Heal = `#32CD32` (Green), Mana = `#1E90FF` (Blue), Status Effect = `#9370DB` (Purple).
4. **Animation Bounciness (Squash & Stretch):**
   * Idle animation: Breathing scale modulation Y-axis `1.0 -> 1.05`, X-axis `1.0 -> 0.97` over 1.2s ping-pong.
   * Landing / Skill Cast: Squash Y-axis down to `0.8` scale for 0.08s before snapping back to `1.0` with overshooting elastic movement (`Elastic Out` easing).

---

## 3. Game Structure & Narrative Engine

### 3.1 Gameplay Loop
1. **World Map Navigation:** Nodes connected by paths. Unlocked nodes can be visited at any time regardless of recommended level.
2. **Combat Encounters:** Wave-based or arena-style clearing within isometric stages.
3. **Loot & Town Hubs:** Collect materials, purchase/equip gear, assign attribute points upon level up.
4. **Skill Mentors:** Find hidden trainers in towns or dungeons to unlock new Class Skill Trees.

### 3.2 Branching Narrative & Consequential Quests
Unlike *Battleheart Legacy*, player decisions permanently impact world state nodes on the main map.

* **Faction Alignment System:** 
  * *The Iron Order* (Lawful, Tank/Holy focus) vs. *The Ashen Syndicate* (Outlaw, Rogue/Shadow focus) vs. *The Circle of Aether* (Arcane focus).
* **Dynamic World Node Example:**
  * **Quest:** *The Siege of Oakhaven*
  * **Choice A (Defend Oakhaven):** Oakhaven remains a prosperous trade hub with high-tier Armorers. The Ashen Syndicate becomes hostile across all world nodes.
  * **Choice B (Betray Oakhaven to Syndicate):** Oakhaven turns into a ruined, monster-infested node with rare black-market skill trainers (unlocking *Blood Alchemist*). Armor merchants are destroyed.

---

## 4. Character Progression & Multi-Classing System

### 4.1 Attribute System
Upon leveling up, the player earns **3 Stat Points** to distribute across six core attributes:

1. **Strength (STR):** Increases Physical Melee Damage, Heavy Armor Affinity, and Block Chance.
2. **Dexterity (DEX):** Increases Critical Strike Chance, Attack Speed, Movement Speed, and Dual-Wield Efficiency.
3. **Intelligence (INT):** Increases Spell Power, Max Mana, Mana Regeneration, and Elemental Resistances.
4. **Endurance (END):** Increases Max Health, Health Regeneration, Physical Defense, and Stun Resistance.
5. **Skill (SKL):** Increases Critical Hit Damage multiplier, Cooldown Reduction, and Ranged Weapon Damage.
6. **Charisma (CHA):** Increases Minion Damage, Shop Buy/Sell Discounts, Quest Rewards, and Unique Dialogue/Bribe options.

### 4.2 Class Unlock Rules
* Players start as a generic **Novice**.
* Visiting a Class Trainer unlocks their Skill Tree.
* Skill slots: **6 Active Skill Slots** and **3 Passive Skill Slots**.
* Skills have dual prerequisites: **Player Level** and **Specific Stat Thresholds**.

---

## 5. Character Classes & Complete Skill Trees

The game features **8 Character Classes**: 4 Reimagined Classics and 4 Brand-New Archetypes.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AVAILABLE CLASSES                             │
├───────────────────────────────┬────────────────────────────────────────┤
│ REIMAGINED CLASSICS           │ NOVEL NEW ARCHETYPES                   │
├───────────────────────────────┼────────────────────────────────────────┤
│ 1. Aegis Knight (Tank/Holy)   │ 5. Chrono-Weaver (Time Manipulation)   │
│ 2. Shadowblade (Crit/Stealth) │ 6. Blood Alchemist (Self-Mutilation)   │
│ 3. Pyromancer (AoE/Burn)      │ 7. Aether-Tech (Turrets/Guns)          │
│ 4. Grand Sovereign (Minions)  │ 8. Geomancer (Terrain/Earth Shaper)    │
└───────────────────────────────┴────────────────────────────────────────┘
```

---

### 5.1 Class 1: Aegis Knight (Reimagined Classic)
Focuses on defensive survivability, holy damage, and crowd control.

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shield Slam** | Active | Lv 1 | 5 STR | 6s | Strikes an enemy with a shield, dealing $120\%$ STR physical damage and stunning for 2s. |
| **Aegis Aura** | Passive | Lv 3 | 8 STR, 6 END | Passive | Increases Armor by $20\%$ and Physical Damage Reduction by $10\%$. |
| **Radiant Strike**| Active | Lv 5 | 10 STR, 8 INT | 8s | A holy strike dealing $180\%$ Holy damage and healing the player for $30\%$ of damage dealt. |
| **Fortitude** | Passive | Lv 8 | 12 END | Passive | Whenever taking a hit greater than $15\%$ max HP, gain a shield equal to $20\%$ max HP for 5s. (20s ICD) |
| **Taunting Cry** | Active | Lv 12 | 16 STR, 14 END | 15s | Forces all enemies in a wide radius to attack you for 5s while boosting Defense by $40\%$. |
| **Holy Bastion** | Active | Lv 20 | 25 STR, 20 END | 45s | Become invulnerable for 4s. Reflects $50\%$ of all incoming damage back to attackers. |

---

### 5.2 Class 2: Shadowblade (Reimagined Classic)
Focuses on burst damage, critical hits, stealth, and high mobility.

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shadowstep** | Active | Lv 1 | 5 DEX | 5s | Teleport behind target enemy, delivering an attack that deals $150\%$ DEX physical damage. |
| **Lethality** | Passive | Lv 3 | 8 DEX, 6 SKL | Passive | Increases Critical Strike Chance by $15\%$ and Critical Damage by $30\%$. |
| **Venomous Blade**| Active | Lv 6 | 12 DEX | 10s | Envenoms weapons for 8s. Attacks deal bonus $40\%$ Poison damage over 4s (stacks up to 5 times). |
| **Evasion** | Passive | Lv 9 | 15 DEX | Passive | Grants $20\%$ chance to completely dodge any incoming attack. Successful dodge grants $+30\%$ Move Speed for 2s. |
| **Smoke Bomb** | Active | Lv 14 | 18 DEX, 12 SKL | 20s | Vanish into stealth for 4s. Next attack from stealth is a guaranteed Critical Strike dealing $+100\%$ extra damage. |
| **Dance of Blades**| Active | Lv 22 | 28 DEX, 22 SKL | 35s | Slash frantically across screen, striking up to 8 random targets for $300\%$ DEX physical damage each in 1.5s. Invulnerable during execution. |

---

### 5.3 Class 3: Pyromancer (Reimagined Classic)
Focuses on explosive area-of-effect elemental damage and high burning damage over time.

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Fireball** | Active | Lv 1 | 5 INT | 3s | Launches a flaming projectile that explodes on impact, dealing $140\%$ INT Fire damage to nearby enemies. |
| **Cauterize** | Passive | Lv 4 | 9 INT | Passive | Enemies affected by your burn effects deal $15\%$ reduced damage to you. |
| **Flame Pillar** | Active | Lv 7 | 13 INT | 10s | Summons a fiery column under targeted ground, dealing $220\%$ INT Fire damage over 3s and knocking enemies airborne. |
| **Pyromaniac** | Passive | Lv 11 | 17 INT, 10 SKL | Passive | Every critical spell hit reduces active fire skill cooldowns by 1.5s. |
| **Combustion** | Active | Lv 16 | 22 INT | 16s | Instantly detonates all active Burn effects on nearby targets, dealing $100\%$ of remaining burn damage instantly in an AoE explosion. |
| **Cataclysm** | Active | Lv 24 | 30 INT | 40s | Summons a meteor shower for 6s. Deals $450\%$ total INT Fire damage across the arena, burning the ground. |

---

### 5.4 Class 4: Grand Sovereign (Reimagined Classic / Minion Master)
Focuses on summoning loyal minions, commanding battlefields, and charisma-based buffs.

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Summon Royal Guard**| Active | Lv 1 | 5 CHA | 12s | Summons an armored knight minion that taunts enemies and deals $50\%$ player damage. Max 2 active. |
| **Inspiring Presence**| Passive| Lv 3 | 8 CHA | Passive | Minions gain $+25\%$ Attack Speed and $+20\%$ Max Health. |
| **Command: Focus** | Active | Lv 6 | 11 CHA | 6s | Commands all active minions to focus a target, increasing their movement speed by $100\%$ and attack by $50\%$ for 4s. |
| **Sovereign's Tribute**| Passive| Lv 10 | 15 CHA, 10 END| Passive | $15\%$ of all damage dealt to the player is split evenly among active minions. |
| **Banner of Victory**| Active | Lv 15 | 20 CHA | 22s | Plants a banner increasing player and minion Damage by $35\%$ and Health Regen by $5\%$ per second inside the radius. |
| **Army of the Realm** | Active | Lv 25 | 30 CHA | 50s | Summons 2 Archer Minions, 2 Guard Minions, and 1 Mage Minion for 20s. |

---

### 5.5 Class 5: Chrono-Weaver (NOVEL NEW CLASS)
Manipulates time: delays damage, speeds up game tempo, freezes enemies, and rewinds locations/health.

```
       [ CHRONO-WEAVER COMBAT MECHANIC ]
                       │
        ┌──────────────┴──────────────┐
        ▼                             ▼
 ┌───────────────┐             ┌───────────────┐
 | TIME DISTORT  |             | TIME REWIND   |
 | Delays 70% of |             | Reverts HP to |
 | incoming hit  |             | status from   |
 | over 6 sec    |             | 4 sec ago     |
 └───────────────┘             └───────────────┘
```

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Temporal Stasis**| Active | Lv 1 | 5 INT, 5 SKL | 10s | Freezes a single target in time for 3.5s. Target cannot act or be damaged during stasis. |
| **Haste Field** | Active | Lv 4 | 9 SKL, 7 INT | 14s | Creates a zone for 6s. Player inside gains $+40\%$ Movement Speed and $+30\%$ Attack/Cast Speed. |
| **Time Distort** | Passive | Lv 8 | 13 INT, 11 SKL| Passive | $30\%$ of all incoming damage is delayed and dealt slowly over 6 seconds instead of instantly. |
| **Paradox Shift** | Active | Lv 13 | 18 INT, 14 SKL| 18s | Swap locations with targeted enemy. Deals $160\%$ INT Temporal damage and confuses surrounding foes for 3s. |
| **Entropy** | Passive | Lv 18 | 24 SKL, 18 INT| Passive | Every skill cast grants a stack of *Accelerate* ($+3\%$ Cooldown Reduction, up to 10 stacks). |
| **Chrono Rewind** | Active | Lv 25 | 30 INT, 25 SKL| 40s | Rewinds player position, HP, and Mana to whatever status they held 4 seconds prior. Cleanses all debuffs. |

---

### 5.6 Class 6: Blood Alchemist (NOVEL NEW CLASS)
Uses HP as a resource alongside Mana. High risk/high reward class centered on self-mutilation, explosive chemical concoctions, and life drain.

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sanguine Flask** | Active | Lv 1 | 5 END | 4s | Costs $10\%$ Current HP. Throws a flask dealing $160\%$ END Acid damage in an AoE and melting enemy armor by $15\%$. |
| **Blood Transmutation**| Passive| Lv 4 | 8 END, 7 INT | Passive | Converting damage taken into resource: $10\%$ of all physical damage taken is restored as Mana. |
| **Essence Harvest**| Active | Lv 7 | 12 END, 10 INT| 8s | Drains blood from all nearby wounded enemies, dealing $120\%$ INT damage and healing player for $50\%$ of damage dealt. |
| **Hemophilia** | Passive | Lv 12 | 16 END | Passive | Increases life drain effects by $40\%$. Attacks against bleeding targets heal player for $3\%$ max HP. |
| **Mutagenic Rage** | Active | Lv 17 | 22 END, 16 STR| 25s | Costs $25\%$ Current HP. Increases Attack Speed by $60\%$, Life Steal by $20\%$, and Move Speed by $30\%$ for 10s. |
| **Philosopher's Crucible**| Active| Lv 24 | 30 END, 22 INT| 45s | Creates a boiling pool of blood for 8s. Enemies inside suffer $200\%$ INT damage per second; player inside is unkillable (HP cannot drop below 1). |

---

### 5.7 Class 7: Aether-Tech / Gunsmith (NOVEL NEW CLASS)
Focuses on firearm weaponry, mechanical deployable turrets, heat management mechanics, and long-range precision strikes.

```
       [ AETHER-TECH HEAT MECHANIC ]
  0%                              100% (OVERHEAT)
  [======== Heat Gauge ========|!]
   │                            │
   ▼                            ▼
  Normal Attacks               Skill Lockout for 5s,
  +0% Damage                   BUT +100% Critical Damage
```

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Aether Pistol** | Active | Lv 1 | 5 SKL | 2s | Fires a rapid-energy projectile dealing $110\%$ SKL Ranged Piercing damage. Generates $10\%$ Heat. |
| **Deploy Turret** | Active | Lv 4 | 9 SKL, 6 INT | 12s | Deploys an automated turret for 10s that shoots nearest target for $45\%$ SKL damage per shot. Max 2 turrets. |
| **Vent Heat** | Active | Lv 8 | 12 SKL | 10s | Vents current heat gauge in a cone in front of you. Deals Fire damage scaled directly with heat level (up to $250\%$). |
| **Thermal Overload**| Passive| Lv 13 | 17 SKL, 12 INT| Passive | When Heat reaches $100\%$, enter *Overheat*: Cannot fire basic shots for 5s, but Critical Damage is boosted by $+100\%$. |
| **Orbital Beam** | Active | Lv 19 | 24 SKL, 18 INT| 30s | Calls down an Aether Satellite laser targeting a designated spot, dealing $400\%$ INT/SKL Beam damage over 4s. |
| **Automaton Exo-Suit**| Active | Lv 26 | 32 SKL | 50s | Equips an Aether Powered Exo-Suit for 15s. Grants $+50\%$ Armor, infinite ammo/zero heat generation, and rocket salvos. |

---

### 5.8 Class 8: Geomancer / Earth Shaper (NOVEL NEW CLASS)
Focuses on altering battlegrounds, building stone walls/barriers, trapping enemies, petrification, and physical impact scaling with armor.

| Skill Name | Type | Level Req | Stat Req | Cooldown | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stone Spike** | Active | Lv 1 | 5 STR, 5 INT | 4s | Earth spike erupts under target dealing $130\%$ STR physical damage and slowing movement by $40\%$ for 3s. |
| **Earth Barrier** | Active | Lv 5 | 10 STR | 12s | Eructs an impenetrable stone wall on the battlefield for 6s, blocking enemy pathfinding and projectile attacks. |
| **Seismic Shock** | Active | Lv 9 | 14 STR, 10 INT| 11s | Stomps the ground, sending shockwaves outward. Deals $180\%$ STR damage in an AoE and knocks down all non-boss enemies. |
| **Earthen Skin** | Passive | Lv 14 | 18 STR, 14 END| Passive | Gain bonus Armor equal to $25\%$ of your total Strength. Physical status effects (Knockback/Stun) duration reduced by $50\%$. |
| **Petrify** | Active | Lv 20 | 25 INT, 20 STR| 22s | Turns target enemy to solid stone for 5s. Target takes $30\%$ increased physical damage from all hits while petrified. |
| **Tectonic Rupture**| Active| Lv 26 | 30 STR, 25 INT| 40s | Shatters the ground arena-wide. Deals $500\%$ physical damage over 5s and creates impassable rubble terrain for 8s. |

---

## 6. Items & Equipment Catalog

The equipment system scales across 6 distinct level tiers matching the world map areas.

### 6.1 Equipment Categories & Slots
Players feature **5 Equipment Slots**:
1. **Main Hand:** Swords, Daggers, Staves, Firearms, Greatswords, Warhammers.
2. **Off Hand:** Shields, Orbs, Tomes, Pistol Dual-Wield, Blood Flasks.
3. **Body Armor:** Robes (INT/CHA), Leather (DEX/SKL), Plate (STR/END).
4. **Trinket / Ring 1:** Attribute & Passive Modifiers.
5. **Trinket / Ring 2:** Attribute & Passive Modifiers.

---

### 6.2 Equipment Tiers & Drop Zones

| Tier | Level Range | Associated World Map Zones | Monster Types |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Lv 1 - 5 | Sunford Plains, Goblin Hollows | Goblins, Bandits, Wolves |
| **Tier 2** | Lv 6 - 10 | Whispering Woods, Oakhaven Outskirts | Treants, Spiders, Outlaw Captains |
| **Tier 3** | Lv 11 - 15 | Ashen Crags, Ironhold Mines | Fire Elementals, Iron Golems, Cultists |
| **Tier 4** | Lv 16 - 20 | Frostbite Tundra, Sunken Temple | Frost Giants, Naga, Necromancers |
| **Tier 5** | Lv 21 - 25 | Citadel of the Void, Dragon’s Peak | Void Stalkers, Wyverns, High Demons |
| **Tier 6 (Legendary)**| Lv 26 - 30+ | Dread Fortress, Endgame Bosses / World Bosses | Elite Bosses, Arch-Demons, Void Lords |

---

### 6.3 Comprehensive Item Master Database

#### Weapons (Main Hand)

| Item Name | Tier | Req Level | Primary Stats | Unique Passive Effect | Drop Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Rusted Shortsword** | T1 | Lv 1 | +4 STR, +2 DEX | None | Sunford Plains (Goblin Drop) |
| **Apprentice Staff** | T1 | Lv 1 | +5 INT | $+5\%$ Spell Mana Discount | Sunford Plains (Chest) |
| **Scout's Handgun** | T1 | Lv 2 | +5 SKL | $+5\%$ Attack Speed | Goblin Hollows Boss |
| **Iron Broadsword** | T2 | Lv 6 | +12 STR, +5 END | $+5\%$ Block Chance | Whispering Woods |
| **Vipin’s Stiletto** | T2 | Lv 8 | +16 DEX, +8 SKL | $+10\%$ Critical Damage | Oakhaven Outskirts |
| **Aether Carbine** | T2 | Lv 10 | +18 SKL, +10 INT | Heat buildup reduced by $10\%$ | Oakhaven Boss Drop |
| **Ashen Greatsword** | T3 | Lv 12 | +28 STR, +12 END | Attacks apply a 15 damage Fire Burn | Ashen Crags |
| **Archmage Wand** | T3 | Lv 14 | +32 INT, +10 SKL | Cooldown Reduction $+8\%$ | Ironhold Mines Boss |
| **Chrono Blade** | T4 | Lv 17 | +35 DEX, +25 INT | Attacks have $10\%$ chance to freeze foe | Sunken Temple |
| **Blood Forged Axe** | T4 | Lv 19 | +45 STR, +20 END | $+8\%$ Life Steal on physical hit | Frostbite Tundra Boss |
| **Void Cannon** | T5 | Lv 22 | +55 SKL, +30 INT | Shots pierce through up to 2 enemies | Citadel of the Void |
| **Dragon Smasher** | T5 | Lv 25 | +65 STR, +35 END | $+25\%$ Bonus damage vs Bosses | Dragon’s Peak Boss |
| **Blade of the Unbound**| T6 | Lv 28 | +80 STR, +60 DEX | Critical hits reduce all cooldowns by 1s | Endgame Boss (Dread Fortress) |
| **Aetherium Destroyer** | T6 | Lv 30 | +90 SKL, +50 INT | Fires an extra energy blast every 3rd shot| World Boss: Void Lord |

---

#### Off-Hand Items

| Item Name | Tier | Req Level | Primary Stats | Unique Passive Effect | Drop Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Wooden Buckler** | T1 | Lv 1 | +3 END, +1 STR | $+5\%$ Block Chance | Sunford Plains |
| **Tome of Novices** | T1 | Lv 2 | +4 INT | $+10$ Max Mana | Goblin Hollows |
| **Iron Shield** | T2 | Lv 7 | +10 END, +8 STR | $+10\%$ Block Chance | Whispering Woods |
| **Syringe of the Adept**| T2 | Lv 9 | +12 END, +6 INT | Sanguine Flask damage increased $+15\%$ | Oakhaven Outskirts |
| **Aetheric Battery** | T3 | Lv 13 | +20 SKL, +14 INT | Heat dissipation speed $+25\%$ | Ironhold Mines |
| **Aegis Tower Shield** | T4 | Lv 18 | +35 END, +20 STR | Reflects 20 damage on successful block | Frostbite Tundra |
| **Orb of Eternal Flame**| T5 | Lv 23 | +48 INT | Fire Spells ignite targets for $+25\%$ bonus | Citadel of the Void |
| **Shield of the Fallen**| T6 | Lv 29 | +65 END, +40 STR | Taking fatal damage grants 3s invulnerability (120s CD) | Dread Fortress Boss |

---

#### Body Armor

| Item Name | Tier | Req Level | Primary Stats | Armor Value | Drop Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Padded Tunic** | T1 | Lv 1 | +2 END | 8 Armor | Sunford Plains |
| **Leather Doublet** | T1 | Lv 3 | +4 DEX, +2 SKL | 14 Armor | Goblin Hollows |
| **Chainmail Vest** | T2 | Lv 6 | +10 STR, +6 END | 28 Armor | Whispering Woods |
| **Scholar's Robe** | T2 | Lv 8 | +14 INT, +6 CHA | 18 Armor | Oakhaven Outskirts |
| **Reinforced Plate** | T3 | Lv 12 | +22 STR, +16 END | 55 Armor | Ashen Crags |
| **Assassin's Garb** | T3 | Lv 14 | +26 DEX, +14 SKL | 40 Armor | Ironhold Mines |
| **Chrono-Weaver Cloak**| T4 | Lv 17 | +32 INT, +20 SKL | 48 Armor | Sunken Temple |
| **Blood-Soaked Plate** | T4 | Lv 19 | +38 END, +24 STR | 85 Armor | Frostbite Tundra |
| **Exo-Armor Chassis** | T5 | Lv 23 | +45 SKL, +30 STR | 110 Armor | Citadel of the Void |
| **Dragonscale Hauberk** | T5 | Lv 25 | +55 STR, +40 END | 140 Armor | Dragon's Peak Boss |
| **Vestments of Sovereign**| T6 | Lv 28 | +60 CHA, +50 INT | 110 Armor | Dread Fortress |
| **Armor of the Titan** | T6 | Lv 30 | +85 STR, +85 END | 220 Armor | World Boss Drop |

---

#### Trinkets & Rings

| Item Name | Tier | Req Level | Primary Stats | Special Passive Effect | Drop Location |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Copper Band** | T1 | Lv 2 | +3 STR or DEX | $+2\%$ Move Speed | Sunford Plains |
| **Ring of Mending** | T2 | Lv 7 | +8 END | $+3$ Health Regen per second | Whispering Woods |
| **Band of Swiftness** | T2 | Lv 9 | +10 DEX | $+8\%$ Attack Speed | Oakhaven Outskirts |
| **Caster's Emblem** | T3 | Lv 13 | +16 INT | $+5\%$ Spell Critical Chance | Ironhold Mines |
| **Infiltrator's Charm**| T3 | Lv 15 | +18 SKL | Moves silently; $+10\%$ Backstab Damage | Ashen Crags |
| **Timekeeper's Hourglass**| T4 | Lv 18 | +22 INT, +15 SKL | Reduces all skill cooldowns by $10\%$ | Sunken Temple |
| **Ring of the Vampyre** | T4 | Lv 20 | +25 END | $+5\%$ Life Steal on all damage | Frostbite Tundra |
| **Sovereign’s Signet** | T5 | Lv 24 | +30 CHA | Minions deal $+20\%$ extra damage | Dragon's Peak |
| **Heart of the Mountain**| T5 | Lv 25 | +35 STR, +20 END | Gain Knockback Immunity | Citadel of the Void |
| **Ring of Absolute Power**| T6 | Lv 30 | +25 All Stats | $+15\%$ Damage Dealt, $+15\%$ Damage Reduction | Dread Fortress Secret Chest |

---

## 7. Controls & User Interface Layout

```
+-------------------------------------------------------------------+
| [PORTRAIT / HP / MANA BAR]                       [PAUSE / MENU]   |
|                                                                   |
|                                                                   |
|                                                                   |
|                         ( ISOMETRIC ARENA )                       |
|                                                                   |
|              [PLAYER] ---- (Touch Drag Vector) ---> [ENEMY]       |
|                                                                   |
|                                                                   |
|                                                                   |
| [SKILL 1] [SKILL 2] [SKILL 3] [SKILL 4] [SKILL 5] [SKILL 6]       |
+-------------------------------------------------------------------+
```

1. **Touch / Mouse Drag Mechanics:**
   * Tapping/Clicking ground moves character to destination point.
   * Dragging a line from Player to an Enemy establishes a **Target-Lock Auto-Attack**.
   * Dragging a line from a Skill Button onto the ground/enemy casts directed positional skills (e.g., *Fireball*, *Earth Barrier*).
2. **Interface Response:**
   * Skills glow with a golden outline when active and ready.
   * On cooldown, skill buttons display a darkened radial clock fill with numeric cooldown countdown timers in seconds.