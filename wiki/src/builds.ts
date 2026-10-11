/**
 * The guide builds. Each is a level-30 plan: where the 117 attribute points
 * (5 in each to start, 3 per level) go, the eight actives, the four passives,
 * the gear and the story choices that help it. The skill path (which skill at
 * which level, from which trainer) is NOT written here: the planner derives
 * it from these numbers, so a balance change re-routes every guide.
 *
 * `tests/wiki/builds.test.ts` holds every build to the game's own rules.
 * Add a build: append it here, the site lists it on the next deploy.
 */
import type { AttrBlock } from '@/game/data/attributes'
import type { EquipSlot } from '@/game/data/items'

export interface GuideBuild {
  id: string
  name: string
  tagline: string
  /** The fantasy, in a word or two (the filter chips). */
  roles: string[]
  difficulty: 1 | 2 | 3
  /** The classes it draws from, main first. */
  classes: string[]
  attrs: AttrBlock
  actives: string[]
  passives: string[]
  gear: Partial<Record<EquipSlot, string>>
  /** Story choices that help it. */
  choices: string[]
  intro: string
  playstyle: string[]
  /** Rotation: the order things are pressed in a real fight. */
  rotation: string[]
  strengths: string[]
  weaknesses: string[]
  /** Leveling notes by stretch; the exact skill path is generated. */
  leveling: { range: string; text: string }[]
  /** A swap that changes its flavour. */
  variants?: string[]
  patch?: string
}

const A = (str: number, dex: number, int: number, end: number, skl: number, cha: number): AttrBlock => ({ str, dex, int, end, skl, cha })

export const BUILDS: GuideBuild[] = [
  {
    id: 'inferno-glass-cannon',
    name: 'Inferno Glass Cannon',
    tagline: 'Everything burns. Nothing survives long enough to touch you — hopefully.',
    roles: ['Glass Cannon', 'Burst', 'Area Damage'],
    difficulty: 2,
    classes: ['pyro', 'elementalist'],
    attrs: A(5, 5, 77, 5, 20, 5),
    actives: ['fireball', 'flamePillar', 'firecracker', 'combustion', 'ringOfFire', 'cataclysm', 'phoenixFlight', 'frostfireComet'],
    passives: ['pyromaniac', 'everflame', 'wildfire', 'smolderingCore'],
    gear: { main: 'archmageWand', off: 'orbOfEternalFlame', head: 'hatOfTheStarweaver', body: 'vestmentsOfSovereign', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'ringOfAbsolutePower', trinket2: 'castersEmblem' },
    choices: ['Heart of Ironhold: give the core to the Circle (18 INT) — the Aether-Works sells T5 off-hands', 'Keep the Circle friendly for the trainer discount and the mana blessing'],
    intro: 'The purest power fantasy in Battlecross: every point in Intelligence, every passive feeding fire. Burns stack from Fireball, Firecracker and the Pillar; Combustion cashes them in, and Wildfire spreads what is left. Endurance stays at 5 — your health bar is a rumour.',
    playstyle: ['Open every pack from max range: Ring of Fire on the pack, Firecracker on the biggest one.', 'Pyromaniac turns every spell crit into shorter fire cooldowns — Everflame and Emberweave Gloves push spell crit up.', 'Phoenix Flight is your escape AND a nuke: fly out of melee into the far side of the pack.'],
    rotation: ['Ring of Fire', 'Firecracker', 'Fireball ×2', 'Combustion', 'Cataclysm when ≥4 enemies', 'Phoenix Flight to reposition'],
    strengths: ['Highest area damage in the game', 'Packs melt before reaching you', 'Fire cooldowns shrink with crits'],
    weaknesses: ['Two hits from a T6 elite and you are done', 'Fire-resistant elementals in the Crags', 'Mana hungry before Smoldering Core'],
    leveling: [
      { range: '1–6', text: 'Fireball from Ember Wren in Sunford. Put everything in INT. Free the caged peddler in the plains for cheap trinkets.' },
      { range: '7–13', text: 'Flame Pillar and Firecracker. Apprentice Staff → Archmage Wand from the Ironhold Mines boss.' },
      { range: '14–22', text: 'Combustion and Ring of Fire make the build. Choose the Circle at the Heart of Ironhold.' },
      { range: '23–30', text: 'Cataclysm, Phoenix Flight and Frostfire Comet from the Elementalist master in Silverbridge. Farm the Citadel chests for the Orb of Eternal Flame.' }
    ],
    variants: ['Swap Smoldering Core for Searing Light (Lightbringer) once CHA allows it: +12% spell crit.', 'Swap Frostfire Comet for Combustion-heavy Fan the Flames for even faster detonations.']
  },
  {
    id: 'necropolis-legion',
    name: 'Necropolis Legion',
    tagline: 'Why fight? Guards, archers, wolves, turrets and the risen dead fight for you.',
    roles: ['Summoner', 'Army', 'Safe'],
    difficulty: 1,
    classes: ['sovereign', 'soulwarden', 'beastcaller', 'aether'],
    attrs: A(5, 5, 12, 24, 11, 60),
    actives: ['royalGuard', 'callArchers', 'callTheFallen', 'callWolf', 'callBear', 'deployTurret', 'armyOfTheRealm', 'summonChampion'],
    passives: ['inspiringPresence', 'warMarshal', 'leaderOfThePack', 'kindredSpirits'],
    gear: { main: 'apprenticeStaff', off: 'shieldOfTheFallen', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'duelistsGrips', feet: 'stormstrideGreaves', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Defend Oakhaven — Lord Castellan (Sovereign) keeps teaching in his hall', 'Dragon pact needs 25 CHA — you will have it', 'Charisma also lowers every shop and trainer price'],
    intro: 'A cross-class necromancer-king. Sovereign guards and archers hold the line, Beastcaller wolves and a bear flank, an Aether turret covers the gap, and the Soul Warden raises the fallen enemies as allies. Charisma multiplies every minion (+2% damage per point), and four passives all feed the army.',
    playstyle: ['Summon before the pack aggroes: Royal Guard, Call Archers, Call Wolf, Deploy Turret.', 'Call the Fallen after the first kills — dead enemies stand up on your side.', 'Army of the Realm and Summon Champion for elites and bosses.'],
    rotation: ['Royal Guard', 'Call Archers', 'Call Wolf', 'Call Bear', 'Deploy Turret', 'Call the Fallen after kills', 'Army of the Realm on elites', 'Summon Champion on bosses'],
    strengths: ['Easiest build to play — the army tanks', 'Charisma = cheaper shops, more quest gold', 'Scales with every minion passive'],
    weaknesses: ['Slow pack clear between summons', 'Bosses with big area attacks wipe the army', 'Needs CHA 36 for the Champion'],
    leveling: [
      { range: '1–8', text: 'Royal Guard (Oakhaven or Silverbridge) and Call Wolf (Beastcaller: pass Rowan\'s test in Silverbridge). Pure CHA.' },
      { range: '9–15', text: 'Call Archers, Call the Fallen, Deploy Turret. Free Briar in the Hollows and keep the herb pouch full for Rowan\'s test.' },
      { range: '16–25', text: 'Call Bear, War Marshal, Army of the Realm. The Sovereign\'s Signet drops in Dragon\'s Peak.' },
      { range: '26–30', text: 'Summon Champion and Leader of the Pack: the full legion.' }
    ],
    variants: ['Replace Deploy Turret with Procession of Souls for an all-undead flavour.', 'Swap Kindred Spirits for Wild Kinship if you lean on the beasts.']
  },
  {
    id: 'unbreakable-paladin',
    name: 'Unbreakable Paladin',
    tagline: 'Holy steel, a tower shield and light that heals. You are the wall.',
    roles: ['Tank', 'Sustain', 'Melee'],
    difficulty: 1,
    classes: ['aegis', 'lightbringer'],
    attrs: A(36, 5, 10, 44, 7, 15),
    actives: ['shieldSlam', 'radiantStrike', 'tauntingCry', 'holyChains', 'holyBastion', 'retribution', 'mendingLight', 'dawnShield'],
    passives: ['aegisAura', 'fortitude', 'bulwark', 'unbreakable'],
    gear: { main: 'dragonSmasher', off: 'shieldOfTheFallen', head: 'wyrmguardGreathelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfTheVampyre' },
    choices: ['Defend Oakhaven: Master Odo sells T4–T5 armour', 'Shatter the Ironhold core: the Order Quartermaster sells T5 armour', 'Give the throne to the Order (+5% max health blessing at full standing)'],
    intro: 'The classic holy knight. Holy Chains drags every enemy in, Taunting Cry makes them hit you, Retribution pays it back with interest. Bulwark reflects every block, Fortitude and Unbreakable kick in when the big hits come. Mending Light and Dawn Shield from the Lightbringer close the gap.',
    playstyle: ['Pull the whole pack with Holy Chains, then Taunting Cry.', 'Retribution after taking hits — it deals Strength plus 150% of what you took.', 'Holy Bastion reflects half the damage of a boss special.'],
    rotation: ['Holy Chains', 'Taunting Cry', 'Shield Slam', 'Radiant Strike', 'Retribution', 'Dawn Shield / Mending Light when low', 'Holy Bastion on telegraphs'],
    strengths: ['Hardest build to kill', 'Excellent for first-time players', 'Strong reflect damage'],
    weaknesses: ['Slow kills on big packs', 'Mana tight early', 'Gear heavy (plate everywhere)'],
    leveling: [
      { range: '1–8', text: 'Shield Slam from Ser Aldric in Sunford. STR and END evenly; a Wooden Buckler from the plains.' },
      { range: '9–17', text: 'Aegis Aura, Radiant Strike, Fortitude, Shield Throw → Holy Chains. Free Sister Aurelle (Sunken Temple cage) for Lightbringer lessons, or pass Auriel\'s test.' },
      { range: '18–27', text: 'Holy Bastion, Bulwark, Retribution. Aegis Tower Shield from the Tundra.' },
      { range: '28–30', text: 'Unbreakable. Farm the Dread Fortress boss for the Shield of the Fallen.' }
    ]
  },
  {
    id: 'timelock-maestro',
    name: 'Timelock Maestro',
    tagline: 'Freeze time, lull them to sleep, turn them on each other. They never get a turn.',
    roles: ['Crowd Control', 'Control Mage', 'Support'],
    difficulty: 3,
    classes: ['chrono', 'bard', 'lightbringer'],
    attrs: A(5, 5, 40, 15, 30, 22),
    actives: ['temporalStasis', 'timeBubble', 'paradoxShift', 'timeLoop', 'timeStop', 'lullaby', 'charmingSerenade', 'blindingFlash'],
    passives: ['foresight', 'entropy', 'frozenMoment', 'virtuoso'],
    gear: { main: 'archmageWand', off: 'tomeOfNovices', head: 'hatOfTheStarweaver', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free the oracle: the Keeper of Hours stays in the Sunken Temple', 'Slay the oracle instead for the Timekeeper\'s Hourglass early (and find the Keeper on Dragon\'s Peak)'],
    intro: 'The control fantasy. Time Bubble slows the pack, Lullaby sleeps the front line, Charming Serenade and Paradox Shift make them fight each other, Blinding Flash fears the rest. Entropy and Foresight shorten everything so a chain never ends; Frozen Moment adds random freezes on hit.',
    playstyle: ['Never let two disables overlap — chain them: Bubble → Lullaby → Serenade → Flash.', 'Temporal Stasis is for the one elite that matters.', 'Time Stop at 60 s cooldown is your “win the fight” button.'],
    rotation: ['Time Bubble', 'Lullaby (cone)', 'Charming Serenade', 'Paradox Shift', 'Time Loop', 'Blinding Flash when surrounded', 'Temporal Stasis on the elite', 'Time Stop on bosses'],
    strengths: ['Packs never touch you', 'Charm makes elites kill their own', 'Very low cooldowns'],
    weaknesses: ['Low raw damage — kills take time', 'Hard to play well', 'Hidden class: Chrono opens late (Sunken Temple)'],
    leveling: [
      { range: '1–10', text: 'Start as a Bard (Lark Merriweather in Silverbridge) or Pyromancer for damage; Lullaby at 7.' },
      { range: '11–19', text: 'Charming Serenade, Blinding Flash (Lightbringer). Clear the Sunken Temple to meet the Keeper of Hours.' },
      { range: '20–30', text: 'Respec into the full Chrono line: Paradox Shift, Time Loop, Frozen Moment, Time Stop.' }
    ]
  },
  {
    id: 'nightblade-assassin',
    name: 'Nightblade Assassin',
    tagline: 'Mark, step behind, crit. The pack leader dies before the fight starts.',
    roles: ['Crit', 'Assassin', 'Single Target'],
    difficulty: 2,
    classes: ['shadow', 'windrunner'],
    attrs: A(5, 50, 5, 17, 35, 5),
    actives: ['shadowstep', 'shadowMark', 'venomousBlade', 'starFan', 'grapplingHook', 'smokeBomb', 'danceOfBlades', 'nightshadeMist'],
    passives: ['lethality', 'silentStrike', 'bladeRhythm', 'skyHunter'],
    gear: { main: 'bladeOfTheUnbound', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'infiltratorsCharm', trinket2: 'ringOfAbsolutePower' },
    choices: ['Betray Oakhaven: the Black Market sells T4 weapons and trinkets', 'Side with the Syndicate for +10% kill gold at full standing'],
    intro: 'A Diablo-style trap-free assassin: Shadow Mark makes a target take 25% more, Shadowstep lands behind it for a backstab, and Blade Rhythm turns every crit into shorter cooldowns. Sky Hunter from the Windrunner adds crit and boss damage. The Blade of the Unbound (crits cut cooldowns by 1 s) is the dream weapon.',
    playstyle: ['Shadow Mark the leader, Shadowstep behind it, Venomous Blade on.', 'Smoke Bomb doubles your next hit — use it before Dance of Blades.', 'Nightshade Mist confuses the rest while you work.'],
    rotation: ['Venomous Blade (buff)', 'Shadow Mark', 'Shadowstep', 'Smoke Bomb', 'Dance of Blades', 'Star Fan / Grappling Hook to finish', 'Nightshade Mist for packs'],
    strengths: ['Deletes elites and bosses', 'Huge crit chance and damage', 'Mobile'],
    weaknesses: ['Weak to large packs before Nightshade Mist', 'Low health', 'Needs good timing'],
    leveling: [
      { range: '1–8', text: 'Shadowstep from Nettle Quickhand (Sunford). DEX first, SKL second.' },
      { range: '9–18', text: 'Evasion, Grappling Hook, Smoke Bomb, Silent Strike. Vipin\'s Stiletto from the Outskirts.' },
      { range: '19–30', text: 'Shadow Mark, Dance of Blades, Blade Rhythm, Nightshade Mist. Pass Sefa\'s test for Sky Hunter.' }
    ]
  },
  {
    id: 'glacier-shatterlord',
    name: 'Glacier Shatterlord',
    tagline: 'Chill, freeze, shatter. Frozen targets take 150% more from Frost Shatter.',
    roles: ['Melee', 'Crowd Control', 'Burst'],
    difficulty: 2,
    classes: ['frostwarden', 'geo'],
    attrs: A(38, 5, 34, 25, 10, 5),
    actives: ['frostCleave', 'rimeLance', 'glacialCharge', 'rimeField', 'frostShatter', 'avalancheLeap', 'absoluteZero', 'frostArmor'],
    passives: ['wintersBite', 'shatterpoint', 'iceborn', 'frozenHeart'],
    gear: { main: 'chronoBlade', off: 'aegisTowerShield', head: 'wyrmguardGreathelm', body: 'dragonscaleHauberk', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Ivor Hask from the Tundra\'s iron cage — skip Halvard\'s test', 'Chrono Blade (Sunken Temple) adds a 10% freeze on hit'],
    intro: 'Frost melee with a simple loop: everything you hit is chilled (Winter\'s Bite), Glacial Charge and Rime Field freeze, Frost Shatter deals +50% to chilled and +150% to frozen. Shatterpoint adds 20% damage to everything chilled. Absolute Zero freezes a whole screen and shields you.',
    playstyle: ['Glacial Charge in, Rime Field under the pack, Frost Shatter while they are frozen.', 'Frost Armor slows anything that hits you.', 'Iceborn makes you immune to knockback — stand in the middle.'],
    rotation: ['Glacial Charge', 'Rime Field', 'Frost Shatter', 'Frost Cleave ×2', 'Avalanche Leap', 'Absolute Zero → Frost Shatter'],
    strengths: ['Freeze-shatter burst is huge', 'Tanky through slows and shields', 'Fun, readable combo'],
    weaknesses: ['Frost giants in the Tundra resist slows', 'Needs both STR and INT', 'Secret class (cage or test)'],
    leveling: [
      { range: '1–10', text: 'Start Geomancer (Stone Spike, Seismic Shock) — STR and INT, same as the end build.' },
      { range: '11–16', text: 'Pass Halvard Rimeheart\'s test (10 fire elementals in the Crags + 3 Frostmint) or free Ivor in the Tundra.' },
      { range: '17–30', text: 'Respec into Frostwarden: Frost Shatter at 16, Avalanche Leap 22, Absolute Zero 28.' }
    ]
  },
  {
    id: 'overclock-gunslinger',
    name: 'Overclock Gunslinger',
    tagline: 'Run hot on purpose. Overheat = +100% crit damage.',
    roles: ['Ranged', 'Crit', 'Tech'],
    difficulty: 3,
    classes: ['aether', 'windrunner'],
    attrs: A(5, 18, 27, 17, 45, 5),
    actives: ['aetherPistol', 'ventHeat', 'shockGrenade', 'orbitalBeam', 'arcCoil', 'exoSuit', 'rocketJump', 'arrowStorm'],
    passives: ['coolantLoop', 'thermalOverload', 'precisionOptics', 'thermalPlating'],
    gear: { main: 'aetheriumDestroyer', off: 'aethericBattery', head: 'hatOfTheStarweaver', body: 'exoArmorChassis', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Give the Ironhold core to the Circle: Tinker Voss sells T5 aether-works', 'The Aetherium Destroyer drops from the Void Lord in the Rift'],
    intro: 'The Aether-Tech\'s heat gauge is a weapon, not a limit. Thermal Overload doubles crit damage while overheated, Thermal Plating turns heat into armour, Coolant Loop drains it fast. Arc Coil chains, Orbital Beam deletes, and the Windrunner\'s Arrow Storm covers the area the guns miss.',
    playstyle: ['Fire until overheated on purpose, then Vent Heat point-blank (250%).', 'Exo Suit for 15 s of rockets and armour.', 'Rocket Jump away from melee, Shock Grenade to stun.'],
    rotation: ['Aether Pistol spam', 'Arc Coil', 'Shock Grenade', 'Orbital Beam', 'Overheat → Vent Heat', 'Exo Suit for big fights'],
    strengths: ['Best ranged single target', 'Unique heat mini-game', 'Strong pierce with Precision Optics'],
    weaknesses: ['Overheat lock if you misjudge', 'Gear spread across late zones', 'Hard'],
    leveling: [
      { range: '1–10', text: 'Gearwright Pim in Ironhold or Professor Sprocket in Silverbridge. Scout\'s Handgun from the Hollows boss.' },
      { range: '11–21', text: 'Coolant Loop, Thermal Overload, Shock Grenade, Orbital Beam. Aether Carbine from the Outskirts boss.' },
      { range: '22–30', text: 'Arc Coil, Exo Suit, Thermal Plating. Windrunner Arrow Storm via Sefa\'s test.' }
    ]
  },
  {
    id: 'crimson-berserker',
    name: 'Crimson Berserker',
    tagline: 'Pay in blood. The lower your health, the harder you hit — and you drink it back.',
    roles: ['Berserker', 'Lifesteal', 'High Risk'],
    difficulty: 3,
    classes: ['blood'],
    attrs: A(17, 5, 30, 45, 10, 10),
    actives: ['sanguineFlask', 'essenceWard', 'essenceHarvest', 'enfeeblingTonic', 'homunculus', 'mutagenicRage', 'philosophersCrucible', 'grandTransmutation'],
    passives: ['bloodTransmutation', 'vitalReserve', 'hemophilia', 'adrenalCatalyst'],
    gear: { main: 'bloodForgedAxe', off: 'syringeOfTheAdept', head: 'wyrmguardGreathelm', body: 'bloodSoakedPlate', hands: 'duelistsGrips', feet: 'stormstrideGreaves', trinket1: 'ringOfTheVampyre', trinket2: 'ringOfAbsolutePower' },
    choices: ['Betray Oakhaven: Doctor Sangrel teaches in the ruined chapel from level 10', 'Otherwise meet him after clearing the Citadel of the Void'],
    intro: 'The Blood Alchemist spends health instead of mana. Adrenal Catalyst adds 30% damage under 30% health, Hemophilia makes life drain 40% stronger, Mutagenic Rage gives 60% attack speed and 20% life steal. Live at the edge on purpose.',
    playstyle: ['Sanguine Flask spam costs health — Essence Harvest heals it back.', 'Mutagenic Rage before a pack, then melee with the Blood-Forged Axe.', 'Grand Transmutation turns 25% of enemy health into your healing.'],
    rotation: ['Mutagenic Rage', 'Sanguine Flask ×2', 'Enfeebling Tonic', 'Essence Harvest', 'Philosopher\'s Crucible', 'Essence Ward when too low', 'Grand Transmutation'],
    strengths: ['No mana problems', 'Massive sustain once ramped', 'Strong single-class build'],
    weaknesses: ['Burst damage can one-shot you at low health', 'Blood class opens late unless you betray Oakhaven'],
    leveling: [
      { range: '1–10', text: 'Level as an Aegis Knight (END + STR) for safety.' },
      { range: '10–20', text: 'Betray Oakhaven for early Blood lessons, or wait for the Citadel.' },
      { range: '20–30', text: 'Adrenal Catalyst, Philosopher\'s Crucible, Grand Transmutation.' }
    ]
  },
  {
    id: 'tectonic-juggernaut',
    name: 'Tectonic Juggernaut',
    tagline: 'Walls of rock, the ground opening, bosses crumbling. +20% vs bosses.',
    roles: ['Boss Killer', 'Bruiser', 'Crowd Control'],
    difficulty: 1,
    classes: ['geo', 'aegis'],
    attrs: A(45, 5, 27, 25, 10, 5),
    actives: ['stoneSpike', 'boulderRoll', 'seismicShock', 'sinkhole', 'petrify', 'geodeShell', 'tectonicRupture', 'shieldThrow'],
    passives: ['bedrock', 'earthenSkin', 'mountainBreaker', 'crumble'],
    gear: { main: 'dragonSmasher', off: 'aegisTowerShield', head: 'ironcladHelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'forgeplateGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Shatter the Ironhold core (Order armourers, T5 plate)', 'Slay the Void Dragon: the Dragon Smasher is its drop'],
    intro: 'The Geomancer as a walking earthquake. Seismic Shock and Sinkhole knock down, Petrify makes a boss take 30% more, Crumble adds damage to everything knocked down, Mountain Breaker and the Dragon Smasher stack boss damage. Earthen Skin turns Strength into armour.',
    playstyle: ['Petrify the boss, then unload.', 'Seismic Shock → Sinkhole keeps packs on the floor.', 'Geode Shell when the hits come; it explodes for 300%.'],
    rotation: ['Petrify', 'Sinkhole', 'Seismic Shock', 'Stone Spike', 'Boulder Roll', 'Tectonic Rupture', 'Geode Shell'],
    strengths: ['Very safe and very strong', 'Best boss damage multiplier', 'Available from Sunford'],
    weaknesses: ['Slow-ish movement', 'Two attributes to raise'],
    leveling: [
      { range: '1–12', text: 'Harrow Flint in Sunford teaches from level 1. Stone Spike, Boulder Roll, Seismic Shock.' },
      { range: '13–22', text: 'Sinkhole, Earthen Skin, Mountain Breaker, Petrify.' },
      { range: '23–30', text: 'Geode Shell, Tectonic Rupture, Crumble; Shield Throw from the Aegis for a ranged poke.' }
    ]
  },
  {
    id: 'alpha-of-the-wild-hunt',
    name: 'Alpha of the Wild Hunt',
    tagline: 'A wolf pack, a bear, a hawk and a howl that makes them all go wild.',
    roles: ['Summoner', 'Beastmaster', 'Hybrid'],
    difficulty: 1,
    classes: ['beastcaller', 'windrunner', 'sovereign'],
    attrs: A(5, 12, 5, 30, 15, 50),
    actives: ['callWolf', 'wolfPounce', 'callHawk', 'callBear', 'spiritStampede', 'alphaHowl', 'wildHunt', 'galeArrow'],
    passives: ['wildKinship', 'packTactics', 'leaderOfThePack', 'inspiringPresence'],
    gear: { main: 'aetherCarbine', off: 'ironShield', head: 'stalkersHood', body: 'vestmentsOfSovereign', hands: 'duelistsGrips', feet: 'pathfindersBoots', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Pass Old Rowan\'s test (12 spiders in the Woods + 2 Moonbells) — opens around level 7', 'Spare the Goblin King with the pact (CHA 8)'],
    intro: 'A ranger who brings the forest. Pack Tactics gives 5% damage per beast, Leader of the Pack and Inspiring Presence make them faster. Alpha Howl enrages the pack, Wild Hunt calls three more wolves. Call Hawk marks a target 15% vulnerable for the pack.',
    playstyle: ['Wolves + bear up before the fight, hawk on the target.', 'Alpha Howl at the start of every big fight.', 'Gale Arrow pushes away anything that reaches you.'],
    rotation: ['Call Wolf ×2', 'Call Bear', 'Call Hawk', 'Alpha Howl', 'Wolf Pounce', 'Spirit Stampede', 'Wild Hunt'],
    strengths: ['Fast early game (wolves at level 1)', 'Very safe', 'Hawk vulnerability + pack bonus'],
    weaknesses: ['Beasts die to area bosses', 'Needs the secret master'],
    leveling: [
      { range: '1–7', text: 'Royal Guard from a Sovereign trainer; head to Silverbridge for Rowan\'s test.' },
      { range: '7–20', text: 'Call Wolf, Wolf Pounce, Call Hawk, Call Bear, Pack Bond.' },
      { range: '20–30', text: 'Pack Tactics, Alpha Howl, Leader of the Pack, Wild Hunt.' }
    ]
  },
  {
    id: 'dawnbringer-saint',
    name: 'Dawnbringer Saint',
    tagline: 'Heal through anything, smite everything. Death is optional (once every two minutes).',
    roles: ['Healer', 'Sustain', 'Caster'],
    difficulty: 1,
    classes: ['lightbringer'],
    attrs: A(5, 5, 40, 25, 10, 32),
    actives: ['sunbolt', 'mendingLight', 'lanceOfLight', 'dawnShield', 'dawnSanctuary', 'blindingFlash', 'sunfall', 'haloOfDawn'],
    passives: ['kindledHope', 'haloWard', 'guardianLight', 'searingLight'],
    gear: { main: 'archmageWand', off: 'tomeOfNovices', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Sister Aurelle from the Sunken Temple cage: she teaches in Sunford', 'Or pass Sister Auriel\'s test in Silverbridge (10 cultists in the Crags + 5 Sunpetals)'],
    intro: 'The holy caster. Sunbolt and Lance of Light deal damage and heal, Dawn Sanctuary is a healing zone that hurts enemies, Sunfall marks a target 20% vulnerable, Halo of Dawn is ten seconds of damage + healing around you. Guardian Light prevents death once every two minutes.',
    playstyle: ['Stand in Dawn Sanctuary; fight from it.', 'Sunfall the strongest enemy, then Lance through the line.', 'Blinding Flash when surrounded.'],
    rotation: ['Dawn Sanctuary', 'Sunfall', 'Lance of Light', 'Sunbolt', 'Halo of Dawn', 'Mending Light / Dawn Shield as needed'],
    strengths: ['Self-sufficient, few potions needed', 'Death save', 'Good damage with Searing Light crits'],
    weaknesses: ['Secret class — needs a cage or a test', 'Slow early leveling'],
    leveling: [
      { range: '1–12', text: 'Pyromancer for damage; collect Sunpetals.' },
      { range: '13–20', text: 'Pass Auriel\'s test: Sunbolt, Mending Light, Lance of Light, Dawn Shield.' },
      { range: '20–30', text: 'Guardian Light, Sunfall, Searing Light, Halo of Dawn.' }
    ]
  },
  {
    id: 'hundred-fists-monk',
    name: 'Hundred Fists',
    tagline: 'No weapon. No armour worth mentioning. Chi, speed, and a mountain-breaking palm.',
    roles: ['Melee', 'Combo', 'Evasion'],
    difficulty: 2,
    classes: ['ironmonk'],
    attrs: A(5, 45, 5, 35, 17, 10),
    actives: ['palmStrike', 'flyingKick', 'tigerStance', 'craneStance', 'hundredFists', 'risingDragon', 'whirlwindKick', 'mountainPalm'],
    passives: ['ironBody', 'flowingFists', 'cranesGrace', 'tigersFury'],
    gear: { main: 'vipinsStiletto', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'bandOfSwiftness', trinket2: 'ringOfAbsolutePower' },
    choices: ['Any — the Iron Monk is taught openly in Silverbridge'],
    intro: 'Build chi with every hit (Flowing Fists adds a 25% chance per hit), spend it on Rising Dragon and Mountain Palm, which deal +50–60% per chi. Tiger Stance for damage, Crane Stance for defence — switch at a 4 s cooldown.',
    playstyle: ['Flying Kick in, Palm Strike, Hundred Fists to bank chi.', 'Mountain Palm with full chi.', 'Crane Stance when an elite swings.'],
    rotation: ['Tiger Stance', 'Flying Kick', 'Palm Strike', 'Hundred Fists', 'Whirlwind Kick', 'Rising Dragon', 'Mountain Palm (full chi)'],
    strengths: ['Fast, rhythmic and fun', 'High dodge', 'Silverbridge teaches it from day one'],
    weaknesses: ['Melee only', 'Needs chi management'],
    leveling: [
      { range: '1–10', text: 'Master Oru Stillwater in Silverbridge. DEX + END.' },
      { range: '10–20', text: 'Flowing Fists, Hundred Fists, Rising Dragon, Crane\'s Grace.' },
      { range: '20–30', text: 'Whirlwind Kick, Tiger\'s Fury, Mountain Palm.' }
    ]
  },
  {
    id: 'prismatic-reactor',
    name: 'Prismatic Reactor',
    tagline: 'Fire, frost, lightning, stone — each element sets off the next. +25% reaction damage.',
    roles: ['Caster', 'Area Damage', 'Combo'],
    difficulty: 2,
    classes: ['elementalist'],
    attrs: A(5, 5, 50, 22, 30, 5),
    actives: ['prismBolt', 'frostLance', 'chainSpark', 'rollingBoulder', 'thunderSnow', 'prismaticNova', 'frostfireComet', 'elementalConvergence'],
    passives: ['elementalHarmony', 'smolderingCore', 'spellweave', 'prismaticWard'],
    gear: { main: 'archmageWand', off: 'orbOfEternalFlame', head: 'hatOfTheStarweaver', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Give the Ironhold core to the Circle (needs 18 INT)'],
    intro: 'A pure Elementalist that mixes everything. Prism Bolt burns AND slows, Thunder Snow chills and strikes, Frostfire Comet is both at once. Elemental Harmony adds 25% to every reaction; Spellweave cuts mana costs and adds crit.',
    playstyle: ['Alternate elements: Frost Lance → Prism Bolt → Chain Spark.', 'Thunder Snow on the pack, Prismatic Nova when they reach you.', 'Elemental Convergence: 12 strikes over 6 s.'],
    rotation: ['Thunder Snow', 'Frost Lance', 'Chain Spark', 'Prism Bolt', 'Frostfire Comet', 'Prismatic Nova', 'Elemental Convergence'],
    strengths: ['Strong area and good safety', 'Taught openly in Silverbridge', 'Mana-efficient'],
    weaknesses: ['Less burst than the pure Pyromancer'],
    leveling: [
      { range: '1–10', text: 'Magistra Iris Fourwinds in Silverbridge. INT, then SKL.' },
      { range: '10–20', text: 'Smoldering Core, Rolling Boulder, Thunder Snow, Spellweave, Prismatic Nova.' },
      { range: '20–30', text: 'Prismatic Ward, Frostfire Comet, Elemental Convergence.' }
    ]
  },
  {
    id: 'stormstrider-ranger',
    name: 'Stormstrider Ranger',
    tagline: 'Never stand still. Kite, dash, pierce, rain arrows.',
    roles: ['Ranged', 'Kiting', 'Mobility'],
    difficulty: 2,
    classes: ['windrunner'],
    attrs: A(5, 45, 5, 22, 35, 5),
    actives: ['galeArrow', 'zephyrDash', 'piercingGale', 'cycloneSnare', 'updraftLeap', 'arrowStorm', 'galeSpirits', 'skyrender'],
    passives: ['fleetfoot', 'keenEye', 'swiftDraw', 'skyHunter'],
    gear: { main: 'voidCannon', off: 'aethericBattery', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'bandOfSwiftness', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Kestrel Vane from the Ashen Crags iron cage — teaches in Oakhaven', 'Or pass Sefa Galewing\'s test (12 bandit archers in the Outskirts + 3 Swiftfern)'],
    intro: 'The kiter. Fleetfoot and Treads of the Horizon make you the fastest thing on the field, Keen Eye pierces, Swift Draw shortens cooldowns. Cyclone Snare roots a pack, Arrow Storm rains on it, Skyrender is a line nuke that launches enemies.',
    playstyle: ['Zephyr Dash away, shoot back.', 'Cyclone Snare → Arrow Storm.', 'Line up Skyrender through a whole pack.'],
    rotation: ['Cyclone Snare', 'Arrow Storm', 'Piercing Gale', 'Gale Arrow', 'Gale Spirits', 'Skyrender', 'Zephyr Dash / Updraft Leap to escape'],
    strengths: ['Hardest to hit', 'Great pierce clear', 'Strong boss damage'],
    weaknesses: ['Punishes standing still', 'Low health'],
    leveling: [
      { range: '1–9', text: 'Shadowblade from Sunford (DEX), then Sefa\'s test in Silverbridge.' },
      { range: '9–20', text: 'Cyclone Snare, Keen Eye, Updraft Leap, Swift Draw, Arrow Storm.' },
      { range: '20–30', text: 'Gale Spirits, Sky Hunter, Skyrender.' }
    ]
  },
  {
    id: 'warbard-conductor',
    name: 'War-Bard Conductor',
    tagline: 'Your songs make the army stronger, your finale charms the whole room.',
    roles: ['Support', 'Summoner', 'Crowd Control'],
    difficulty: 2,
    classes: ['bard', 'sovereign'],
    attrs: A(5, 5, 5, 27, 30, 45),
    actives: ['sharpNote', 'marchingSong', 'balladOfValor', 'hymnOfMending', 'crescendo', 'grandFinale', 'royalGuard', 'callArchers'],
    passives: ['longRefrain', 'virtuoso', 'standingOvation', 'warMarshal'],
    gear: { main: 'aetherCarbine', off: 'tomeOfNovices', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'duelistsGrips', feet: 'pathfindersBoots', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Defend Oakhaven (Lord Castellan teaches Sovereign in town)'],
    intro: 'A bard leading a small army. Ballad of Valor and Marching Song buff you AND your guards and archers, Long Refrain makes songs 30% longer, Crescendo grows with every ally around. Grand Finale charms everything for 3 s and hits for 560%.',
    playstyle: ['Songs before the fight: Marching Song, Ballad of Valor.', 'Guards and archers up.', 'Crescendo in the middle of the scrum, Grand Finale to end it.'],
    rotation: ['Royal Guard', 'Call Archers', 'Ballad of Valor', 'Marching Song', 'Sharp Note', 'Crescendo', 'Grand Finale', 'Hymn of Mending'],
    strengths: ['Strong and safe', 'Charm on a big area', 'Cheap shop prices (CHA)'],
    weaknesses: ['Lots of buttons', 'Songs must be kept up'],
    leveling: [
      { range: '1–10', text: 'Lark Merriweather in Silverbridge + Royal Guard. CHA first.' },
      { range: '10–20', text: 'Long Refrain, Ballad of Valor, Charming Serenade, Virtuoso.' },
      { range: '20–30', text: 'Crescendo, Standing Ovation, Grand Finale.' }
    ]
  },
  {
    id: 'deathless-bastion',
    name: 'Deathless Bastion',
    tagline: 'Every defensive cooldown in the game on one bar. Try to kill it.',
    roles: ['Tank', 'Immortal', 'Hybrid'],
    difficulty: 2,
    classes: ['aegis', 'chrono', 'blood', 'geo'],
    attrs: A(22, 5, 24, 36, 25, 5),
    actives: ['shieldSlam', 'essenceWard', 'essenceHarvest', 'chronoRewind', 'holyBastion', 'frostArmor', 'geodeShell', 'craneStance'],
    passives: ['unbreakable', 'fortitude', 'timeDistort', 'frozenHeart'],
    gear: { main: 'dragonSmasher', off: 'shieldOfTheFallen', head: 'wyrmguardGreathelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Shatter the Ironhold core and give the throne to the Order', 'The Shield of the Fallen adds a 3 s death save'],
    intro: 'The ultimate “I refuse to die” build. Chrono Rewind sends you 4 s back in time, Time Distort delays 30% of damage, Holy Bastion reflects, Geode Shell and Essence Ward shield, Unbreakable and Fortitude trigger on low health and big hits, and the Shield of the Fallen saves you from a fatal blow. Gear supplies a big chunk of the attributes.',
    playstyle: ['Rotate shields so one is always up.', 'Chrono Rewind right after a big hit lands.', 'Damage comes from Geode Shell bursts and the Dragon Smasher.'],
    rotation: ['Frost Armor', 'Geode Shell', 'Shield Slam', 'Essence Harvest', 'Holy Bastion on telegraph', 'Essence Ward', 'Chrono Rewind after big hits'],
    strengths: ['Survives the Void Lord on a bad day', 'Great for hardcore-style play'],
    weaknesses: ['Slow kills', 'Needs the late Chrono and Blood teachers'],
    leveling: [
      { range: '1–15', text: 'Aegis Knight leveling (see Unbreakable Paladin).' },
      { range: '16–25', text: 'Frost Armor, Geode Shell, Essence Ward as their teachers open.' },
      { range: '25–30', text: 'Chrono Rewind once the Keeper of Hours is found; respec into the hybrid.' }
    ]
  },
  {
    id: 'lantern-reaper',
    name: 'Lantern Reaper',
    tagline: 'Wisps hunt, souls rise, and the dead march on in a procession behind you.',
    roles: ['Summoner', 'Caster', 'Necromancer'],
    difficulty: 2,
    classes: ['soulwarden'],
    attrs: A(5, 5, 45, 27, 5, 30),
    actives: ['wispBolt', 'callTheFallen', 'soulBond', 'spiritLantern', 'hauntingWail', 'releaseSouls', 'wispSwarm', 'processionOfSouls'],
    passives: ['kindredSpirits', 'restlessSouls', 'wardensVigil', 'lanternKeeper'],
    gear: { main: 'archmageWand', off: 'tomeOfNovices', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Any — Warden Odalys teaches openly in Silverbridge'],
    intro: 'A Soul Warden caster: Restless Souls gives a 15% chance for each kill to rise as a friendly spirit, Call the Fallen raises three at once. Release Souls detonates your spirits for damage and healing. Procession of Souls buffs every spirit\'s attack by 50%.',
    playstyle: ['Kill fast early in the fight to build spirits.', 'Haunting Wail fears when surrounded.', 'Release Souls when spirits are about to expire.'],
    rotation: ['Wisp Swarm', 'Wisp Bolt', 'Call the Fallen', 'Soul Bond', 'Spirit Lantern', 'Procession of Souls', 'Release Souls'],
    strengths: ['Snowballs through packs', 'Taught from day one'],
    weaknesses: ['Weak on lone bosses', 'Spirits time out'],
    leveling: [
      { range: '1–10', text: 'Warden Odalys in Silverbridge. INT first.' },
      { range: '10–20', text: 'Restless Souls, Spirit Lantern, Haunting Wail, Warden\'s Vigil.' },
      { range: '20–30', text: 'Lantern Keeper, Wisp Swarm, Procession of Souls.' }
    ]
  },
  {
    id: 'dragonslayer',
    name: 'Dragonslayer',
    tagline: 'Built for one job: bosses. Boss damage from three sources, crit from two.',
    roles: ['Boss Killer', 'Crit', 'Hybrid'],
    difficulty: 2,
    classes: ['geo', 'windrunner', 'shadow'],
    attrs: A(5, 30, 25, 25, 27, 5),
    actives: ['stoneSpike', 'petrify', 'shadowMark', 'shadowstep', 'piercingGale', 'skyrender', 'seismicShock', 'zephyrDash'],
    passives: ['mountainBreaker', 'skyHunter', 'lethality', 'crumble'],
    gear: { main: 'dragonSmasher', off: 'ironShield', head: 'stalkersHood', body: 'dragonscaleHauberk', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Slay the Void Dragon', 'Claim the throne yourself (level 28) for the Unbound ending'],
    intro: 'Mountain Breaker (+20%), Sky Hunter (+15%) and the Dragon Smasher (+25%) stack boss damage. Petrify and Shadow Mark stack vulnerability. Two marks, a Skyrender, a Shadowstep backstab: bosses fall in seconds. The gear carries the Strength, so the points go to DEX, SKL and a real health bar.',
    playstyle: ['Petrify + Shadow Mark the boss, then everything.', 'Zephyr Dash out of telegraphs.', 'Packs are the weakness — use Seismic Shock.'],
    rotation: ['Shadow Mark', 'Petrify', 'Shadowstep', 'Skyrender', 'Piercing Gale', 'Stone Spike', 'Seismic Shock on adds'],
    strengths: ['Shortest boss kills in the game', 'Weekly Colosseum boss waves'],
    weaknesses: ['Glass-jawed against packs', 'Three trainers to visit'],
    leveling: [
      { range: '1–12', text: 'Geomancer from Sunford: Stone Spike, Seismic Shock.' },
      { range: '12–22', text: 'Shadowblade (Shadowstep), Mountain Breaker, Petrify, Shadow Mark.' },
      { range: '22–30', text: 'Windrunner via Sefa\'s test: Sky Hunter and Skyrender.' }
    ]
  },
  {
    id: 'phoenix-chronomancer',
    name: 'Phoenix Chronomancer',
    tagline: 'Echo every fireball. Time magic makes the fire happen twice.',
    roles: ['Caster', 'Burst', 'Combo'],
    difficulty: 3,
    classes: ['pyro', 'chrono'],
    attrs: A(5, 5, 55, 17, 30, 5),
    actives: ['fireball', 'echoBolt', 'timeLoop', 'hasteField', 'firecracker', 'combustion', 'timeBubble', 'phoenixFlight'],
    passives: ['pyromaniac', 'everflame', 'entropy', 'foresight'],
    gear: { main: 'archmageWand', off: 'orbOfEternalFlame', head: 'hatOfTheStarweaver', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Slay the oracle for the Timekeeper\'s Hourglass at level 20'],
    intro: 'A cooldown engine: Entropy shortens every cooldown when you cast, Foresight and the Hourglass cut more, Pyromaniac cuts fire cooldowns on crits. Echo Bolt and Time Loop repeat their damage; Time Bubble holds the pack inside your Firecracker blasts.',
    playstyle: ['Haste Field first.', 'Time Bubble the pack, Firecracker + Fireball into it.', 'Time Loop the elite — it repeats 50% of the damage.'],
    rotation: ['Haste Field', 'Time Bubble', 'Firecracker', 'Fireball', 'Echo Bolt', 'Time Loop', 'Combustion'],
    strengths: ['Very low cooldowns', 'Good mix of control and damage'],
    weaknesses: ['Chrono opens late (Sunken Temple)', 'Squishy'],
    leveling: [
      { range: '1–17', text: 'Pyromancer.' },
      { range: '17–30', text: 'Find the Keeper of Hours; add Echo Bolt, Haste Field, Time Bubble, Time Loop, Entropy.' }
    ]
  }
]

export const BUILD_BY_ID: Record<string, GuideBuild> = Object.fromEntries(BUILDS.map(b => [b.id, b]))
