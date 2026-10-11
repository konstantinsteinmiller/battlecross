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
    tagline: 'Holy steel, a tower shield, and every hit paid back in Strength.',
    roles: ['Tank', 'Melee', 'Reflect'],
    difficulty: 1,
    classes: ['aegis', 'geo'],
    attrs: A(46, 5, 8, 43, 5, 10),
    actives: ['shieldSlam', 'radiantStrike', 'shieldThrow', 'shieldShove', 'stoneSpike', 'tauntingCry', 'holyBastion', 'retribution'],
    passives: ['aegisAura', 'fortitude', 'bulwark', 'unbreakable'],
    gear: { main: 'dragonSmasher', off: 'shieldOfTheFallen', head: 'wyrmguardGreathelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Defend Oakhaven: Master Odo sells T4–T5 armour', 'Shatter the Ironhold core: the Order Quartermaster sells T5 armour', 'Give the throne to the Order (+5% max health blessing at full standing)'],
    intro: 'The classic holy knight, all in on Strength. Every damage skill — Shield Slam, Radiant Strike, Shield Throw, Shield Shove, Stone Spike and Retribution — scales with STR, and so does plate armour, so the stat that hits hardest also makes you hardest to kill. Endurance comes second for the health pool; Taunting Cry and Holy Bastion are pure utility and want no stat at all.',
    playstyle: ['Taunting Cry pulls the pack onto you, then Shield Shove sends the front line flying.', 'Retribution after taking hits — it deals Strength plus 150% of what you took.', 'Holy Bastion reflects half the damage of a boss special; Bulwark reflects every block.'],
    rotation: ['Taunting Cry', 'Shield Shove', 'Shield Slam', 'Radiant Strike', 'Shield Throw', 'Retribution', 'Holy Bastion on telegraphs', 'Stone Spike on runners'],
    strengths: ['Hardest build to kill', 'One stat does everything', 'Great for first-time players'],
    weaknesses: ['Slow kills on big packs', 'Gear heavy (plate everywhere)'],
    leveling: [
      { range: '1–8', text: 'Shield Slam from Ser Aldric in Sunford, Stone Spike from Harrow Flint next door. STR first, END second.' },
      { range: '9–17', text: 'Aegis Aura, Radiant Strike, Fortitude, Shield Throw, Taunting Cry, Shield Shove.' },
      { range: '18–27', text: 'Holy Bastion, Bulwark, Retribution. Aegis Tower Shield from the Tundra.' },
      { range: '28–30', text: 'Unbreakable. Farm the Dread Fortress boss for the Shield of the Fallen.' }
    ],
    variants: ['Swap Stone Spike for Holy Chains (END) if you want a pull instead of a poke.']
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
    tagline: 'Chill, freeze, shatter — every blow on Strength. Frozen targets take 150% more.',
    roles: ['Melee', 'Crowd Control', 'Burst'],
    difficulty: 2,
    classes: ['frostwarden', 'geo'],
    attrs: A(47, 5, 28, 27, 5, 5),
    actives: ['frostCleave', 'glacialCharge', 'frostShatter', 'avalancheLeap', 'seismicShock', 'sinkhole', 'boulderRoll', 'absoluteZero'],
    passives: ['wintersBite', 'shatterpoint', 'iceborn', 'frozenHeart'],
    gear: { main: 'dragonSmasher', off: 'aegisTowerShield', head: 'wyrmguardGreathelm', body: 'dragonscaleHauberk', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Ivor Hask from the Tundra\'s iron cage — skip Halvard\'s test', 'Slay the Void Dragon for the Dragon Smasher'],
    intro: 'Frost melee on one stat. The Frostwarden\'s strikes and the Geomancer\'s earth all scale with Strength: Winter\'s Bite chills everything you hit, Glacial Charge freezes, Seismic Shock and Sinkhole knock the pack down, and Frost Shatter deals +50% to chilled and +150% to frozen. Intelligence is only bought to the bar Absolute Zero asks — its freeze and shield matter more than its damage.',
    playstyle: ['Glacial Charge in, Seismic Shock, Frost Shatter while they are frozen.', 'Sinkhole holds a pack in place for Avalanche Leap.', 'Iceborn makes you immune to knockback — stand in the middle.'],
    rotation: ['Glacial Charge', 'Seismic Shock', 'Frost Shatter', 'Frost Cleave ×2', 'Sinkhole', 'Avalanche Leap', 'Absolute Zero → Frost Shatter'],
    strengths: ['Freeze-shatter burst is huge', 'Strength feeds damage AND plate armour', 'Knockdowns everywhere'],
    weaknesses: ['Frost giants in the Tundra shrug off slows', 'Secret class (cage or test)'],
    leveling: [
      { range: '1–10', text: 'Start Geomancer from Harrow Flint in Sunford: Stone Spike, Boulder Roll, Seismic Shock. Pure STR.' },
      { range: '11–16', text: 'Pass Halvard Rimeheart\'s test (10 fire elementals in the Crags + 3 Frostmint) or free Ivor in the Tundra. Sinkhole at 12.' },
      { range: '17–30', text: 'Frost Shatter, Shatterpoint, Avalanche Leap, Iceborn; raise INT only to about 28 for Absolute Zero at 28.' }
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
    name: 'Crimson Blood-Witch',
    tagline: 'Pay in blood, cast in Intelligence, drink it all back.',
    roles: ['Lifesteal', 'Caster', 'High Risk'],
    difficulty: 3,
    classes: ['blood', 'soulwarden'],
    attrs: A(12, 5, 45, 40, 10, 5),
    actives: ['essenceHarvest', 'enfeeblingTonic', 'philosophersCrucible', 'grandTransmutation', 'wispBolt', 'hauntingWail', 'sanguineFlask', 'essenceWard'],
    passives: ['bloodTransmutation', 'vitalReserve', 'hemophilia', 'adrenalCatalyst'],
    gear: { main: 'archmageWand', off: 'syringeOfTheAdept', head: 'seersCirclet', body: 'bloodSoakedPlate', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'ringOfTheVampyre', trinket2: 'ringOfAbsolutePower' },
    choices: ['Betray Oakhaven: Doctor Sangrel teaches in the ruined chapel from level 10', 'Otherwise meet him after clearing the Citadel of the Void'],
    intro: 'The Blood Alchemist\'s big spells — Essence Harvest, Enfeebling Tonic, the Crucible and Grand Transmutation — all scale with Intelligence, and so do the Soul Warden\'s Wisp Bolt and Haunting Wail. So INT is the damage stat; Endurance is second, because the blood skills cost health and the passives (Hemophilia, Vital Reserve, Adrenal Catalyst) turn a big health pool into sustain and +30% damage at low health.',
    playstyle: ['Sanguine Flask and Essence Ward cost health — Essence Harvest heals it back.', 'Haunting Wail fears the pack while the Crucible burns.', 'Grand Transmutation turns 25% of enemy health into your healing.'],
    rotation: ['Enfeebling Tonic', 'Philosopher\'s Crucible', 'Essence Harvest', 'Wisp Bolt', 'Haunting Wail when surrounded', 'Essence Ward when low', 'Grand Transmutation'],
    strengths: ['Health is a second mana bar', 'Huge sustain once ramped', 'One damage stat'],
    weaknesses: ['Burst damage can kill you at low health', 'Blood class opens late unless you betray Oakhaven'],
    leveling: [
      { range: '1–10', text: 'Warden Odalys in Silverbridge: Wisp Bolt. INT first, END second.' },
      { range: '10–20', text: 'Betray Oakhaven for early Blood lessons, or wait for the Citadel. Essence Harvest, Enfeebling Tonic, Hemophilia.' },
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
    classes: ['lightbringer', 'soulwarden', 'blood'],
    attrs: A(5, 5, 45, 29, 5, 28),
    actives: ['sunbolt', 'lanceOfLight', 'sunfall', 'haloOfDawn', 'blindingFlash', 'essenceHarvest', 'spiritLantern', 'dawnSanctuary'],
    passives: ['kindledHope', 'haloWard', 'guardianLight', 'searingLight'],
    gear: { main: 'archmageWand', off: 'tomeOfNovices', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Sister Aurelle from the Sunken Temple cage: she teaches in Sunford', 'Or pass Sister Auriel\'s test in Silverbridge (10 cultists in the Crags + 5 Sunpetals)'],
    intro: 'A holy caster whose healing comes FROM its damage, so it all rides on Intelligence: Lance of Light, Halo of Dawn, the Blood Alchemist\'s Essence Harvest and the Soul Warden\'s Spirit Lantern deal INT damage and heal you while they do. Charisma is bought only to the bars of Guardian Light and Halo of Dawn — the death save is worth it.',
    playstyle: ['Stand in Dawn Sanctuary or Spirit Lantern and fight from it.', 'Sunfall the strongest enemy, then Lance through the line.', 'Blinding Flash when surrounded.'],
    rotation: ['Dawn Sanctuary', 'Sunfall', 'Lance of Light', 'Sunbolt', 'Essence Harvest', 'Spirit Lantern', 'Halo of Dawn'],
    strengths: ['Self-sufficient, few potions needed', 'Death save', 'Heals scale with the damage stat'],
    weaknesses: ['Secret class — needs a cage or a test', 'Slow early leveling'],
    leveling: [
      { range: '1–12', text: 'Warden Odalys (Silverbridge): Wisp Bolt, Spirit Lantern. INT first; collect Sunpetals.' },
      { range: '13–20', text: 'Pass Auriel\'s test: Sunbolt, Lance of Light, Kindled Hope. Essence Harvest from Sangrel once found.' },
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
    tagline: 'Never stand still. Kite, dash, pierce — all on Dexterity.',
    roles: ['Ranged', 'Kiting', 'Mobility'],
    difficulty: 2,
    classes: ['windrunner', 'shadow'],
    attrs: A(5, 50, 5, 22, 30, 5),
    actives: ['galeArrow', 'piercingGale', 'skyrender', 'starFan', 'grapplingHook', 'updraftLeap', 'arrowStorm', 'zephyrDash'],
    passives: ['fleetfoot', 'keenEye', 'swiftDraw', 'skyHunter'],
    gear: { main: 'voidCannon', off: 'aethericBattery', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'bandOfSwiftness', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Kestrel Vane from the Ashen Crags iron cage — teaches in Oakhaven', 'Or pass Sefa Galewing\'s test (12 bandit archers in the Outskirts + 3 Swiftfern)'],
    intro: 'The kiter. Gale Arrow, Piercing Gale, Updraft Leap and Skyrender scale with Dexterity, and so do the Shadowblade\'s Star Fan and Grappling Hook — and DEX also gives crit, attack speed and move speed. Skill is raised to Skyrender\'s bar and brings crit damage and shorter cooldowns along.',
    playstyle: ['Zephyr Dash away, shoot back.', 'Star Fan into a pack, Arrow Storm on it.', 'Line up Skyrender through a whole pack.'],
    rotation: ['Arrow Storm', 'Piercing Gale', 'Star Fan', 'Gale Arrow', 'Grappling Hook to slow a runner', 'Skyrender', 'Zephyr Dash / Updraft Leap to escape'],
    strengths: ['Hardest to hit', 'Great pierce clear', 'DEX is damage, crit and speed at once'],
    weaknesses: ['Punishes standing still', 'Low health'],
    leveling: [
      { range: '1–9', text: 'Shadowblade from Nettle Quickhand (Sunford): Star Fan. Pure DEX, then Sefa\'s test in Silverbridge.' },
      { range: '9–20', text: 'Piercing Gale, Keen Eye, Updraft Leap, Swift Draw, Arrow Storm.' },
      { range: '20–30', text: 'Sky Hunter, Skyrender.' }
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
    tagline: 'Every point in Endurance. Health is your armour, your weapon and your mana.',
    roles: ['Tank', 'Immortal', 'Hybrid'],
    difficulty: 2,
    classes: ['aegis', 'blood', 'ironmonk'],
    attrs: A(10, 8, 14, 70, 5, 10),
    actives: ['holyChains', 'sanguineFlask', 'homunculus', 'mutagenicRage', 'essenceWard', 'holyBastion', 'tauntingCry', 'craneStance'],
    passives: ['unbreakable', 'fortitude', 'hemophilia', 'vitalReserve'],
    gear: { main: 'dragonSmasher', off: 'shieldOfTheFallen', head: 'wyrmguardGreathelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfTheVampyre' },
    choices: ['Shatter the Ironhold core and give the throne to the Order (+5% max health)', 'The Shield of the Fallen adds a 3 s death save'],
    intro: 'The “I refuse to die” build, on one stat. Holy Chains, Sanguine Flask, the Homunculus and Mutagenic Rage all scale with Endurance, and Endurance is also health (20 per point), regeneration, armour and stun resistance. The rest of the bar is stat-free defence: Essence Ward, Holy Bastion, Taunting Cry and Crane Stance. The plate gear supplies the Strength the Aegis bars ask.',
    playstyle: ['Taunting Cry + Holy Chains: everything comes to you.', 'Mutagenic Rage for attack speed and 20% life steal.', 'Rotate Essence Ward and Holy Bastion so one is always up.'],
    rotation: ['Crane Stance', 'Holy Chains', 'Taunting Cry', 'Mutagenic Rage', 'Sanguine Flask', 'Homunculus', 'Holy Bastion on telegraph', 'Essence Ward when low'],
    strengths: ['The biggest health bar in the game', 'One stat does everything', 'Sustain from Hemophilia and the Vampyre ring'],
    weaknesses: ['Slow kills', 'Needs the Blood teacher'],
    leveling: [
      { range: '1–12', text: 'Crane Stance from Master Oru (Silverbridge) and pure END; Holy Chains and Taunting Cry from the Aegis trainers.' },
      { range: '12–20', text: 'Fortitude, Vital Reserve, Hemophilia; Blood lessons as soon as Sangrel is found.' },
      { range: '20–30', text: 'Mutagenic Rage, Holy Bastion, Unbreakable.' }
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
    tagline: 'Built for one job: bosses. Boss damage from three sources, every hit on Dexterity.',
    roles: ['Boss Killer', 'Crit', 'Hybrid'],
    difficulty: 2,
    classes: ['windrunner', 'shadow', 'geo'],
    attrs: A(5, 30, 25, 25, 27, 5),
    actives: ['shadowMark', 'petrify', 'shadowstep', 'skyrender', 'piercingGale', 'starFan', 'danceOfBlades', 'zephyrDash'],
    passives: ['mountainBreaker', 'skyHunter', 'lethality', 'crumble'],
    gear: { main: 'dragonSmasher', off: 'ironShield', head: 'stalkersHood', body: 'dragonscaleHauberk', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Slay the Void Dragon', 'Claim the throne yourself (level 28) for the Unbound ending'],
    intro: 'Mountain Breaker (+20%), Sky Hunter (+15%) and the Dragon Smasher (+25%) stack boss damage; Petrify and Shadow Mark stack vulnerability and need no stat. Every damage skill — Shadowstep, Star Fan, Dance of Blades, Piercing Gale, Skyrender — scales with Dexterity, which also brings the crit. The Geomancer passives and the Smasher ask for Strength, and the plate gear supplies all of it, so your own points go to DEX, the bars and a real health pool.',
    playstyle: ['Petrify + Shadow Mark the boss, then everything.', 'Zephyr Dash out of telegraphs.', 'Dance of Blades clears the adds around the boss.'],
    rotation: ['Shadow Mark', 'Petrify', 'Shadowstep', 'Skyrender', 'Piercing Gale', 'Dance of Blades', 'Star Fan to finish'],
    strengths: ['Shortest boss kills in the game', 'Strong in the weekly Colosseum'],
    weaknesses: ['Plain packs take longer', 'Three trainers to visit'],
    leveling: [
      { range: '1–12', text: 'Shadowblade from Sunford: Shadowstep, Star Fan. DEX first.' },
      { range: '12–22', text: 'Geomancer passives (Mountain Breaker) and Petrify; Shadow Mark at 18.' },
      { range: '22–30', text: 'Windrunner via Sefa\'s test: Sky Hunter and Skyrender; Dance of Blades.' }
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
  },
  {
    id: 'thousand-cuts',
    name: 'Thousand Cuts',
    tagline: 'Pure Dexterity glass cannon. Five points of Endurance and a prayer.',
    roles: ['Glass Cannon', 'Crit', 'Melee'],
    difficulty: 3,
    classes: ['shadow', 'ironmonk', 'windrunner'],
    attrs: A(5, 67, 5, 5, 30, 5),
    actives: ['shadowstep', 'starFan', 'flyingKick', 'hundredFists', 'danceOfBlades', 'nightshadeMist', 'piercingGale', 'skyrender'],
    passives: ['lethality', 'bladeRhythm', 'keenEye', 'skyHunter'],
    gear: { main: 'bladeOfTheUnbound', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'bandOfSwiftness', trinket2: 'ringOfAbsolutePower' },
    choices: ['Betray Oakhaven: the Black Market sells T4 weapons and trinkets early', 'Claim the throne yourself — this build already lives dangerously'],
    intro: 'Every spare point goes into Dexterity: crit chance, attack speed, move speed AND the damage of all eight actives. Skill sits at exactly the bar Skyrender and Nightshade Mist ask, Endurance stays at its starting 5. Blade Rhythm and the Blade of the Unbound turn every crit into shorter cooldowns, so the bar never stops spinning.',
    playstyle: ['Never take a hit: Shadowstep in, Dance of Blades, Flying Kick out.', 'Nightshade Mist confuses the pack so nothing targets you.', 'Hundred Fists is your single-target delete button.'],
    rotation: ['Nightshade Mist', 'Shadowstep', 'Dance of Blades', 'Hundred Fists', 'Star Fan', 'Piercing Gale', 'Skyrender', 'Flying Kick to leave'],
    strengths: ['Highest crit uptime in the game', 'Cooldowns refresh on crit', 'Fast'],
    weaknesses: ['About 1,000 health at level 30', 'One mistake ends the run'],
    leveling: [
      { range: '1–10', text: 'Nettle Quickhand in Sunford: Shadowstep, Star Fan. Only DEX until Skill is needed.' },
      { range: '10–22', text: 'Iron Monk in Silverbridge for Flying Kick and Hundred Fists; Lethality, Grappling Hook while leveling.' },
      { range: '22–30', text: 'Blade Rhythm, Dance of Blades, Sky Hunter, Nightshade Mist, Skyrender.' }
    ]
  },
  {
    id: 'orbital-artillery',
    name: 'Orbital Artillery',
    tagline: 'Pure Skill glass cannon: beams from orbit, coils that chain, and no armour at all.',
    roles: ['Glass Cannon', 'Ranged', 'Tech'],
    difficulty: 3,
    classes: ['aether', 'windrunner'],
    attrs: A(5, 14, 5, 5, 79, 9),
    actives: ['aetherPistol', 'ventHeat', 'shockGrenade', 'orbitalBeam', 'arcCoil', 'cycloneSnare', 'arrowStorm', 'galeSpirits'],
    passives: ['thermalOverload', 'precisionOptics', 'keenEye', 'virtuoso'],
    gear: { main: 'aetheriumDestroyer', off: 'aethericBattery', head: 'hatOfTheStarweaver', body: 'exoArmorChassis', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Give the Ironhold core to the Circle: Tinker Voss sells T5 aether-works', 'The Aetherium Destroyer drops from the Void Lord'],
    intro: 'Skill is crit damage and cooldown reduction, and it is the damage stat of the Aether-Tech AND of the Windrunner\'s area skills. Put almost everything into it: Orbital Beam and Arrow Storm land for absurd numbers, Thermal Overload doubles crit damage while overheated, Virtuoso adds 25% crit damage on top.',
    playstyle: ['Cyclone Snare roots the pack; Orbital Beam and Arrow Storm on top of it.', 'Overheat on purpose for Thermal Overload, then Vent Heat.', 'Gale Spirits shoot while you reposition.'],
    rotation: ['Cyclone Snare', 'Orbital Beam', 'Arrow Storm', 'Arc Coil', 'Aether Pistol to overheat', 'Vent Heat', 'Gale Spirits'],
    strengths: ['The biggest numbers in the game', 'Huge range', '60% cooldown reduction cap within reach'],
    weaknesses: ['Tissue-paper health', 'Overheat lock if mistimed'],
    leveling: [
      { range: '1–10', text: 'Gearwright Pim (Ironhold) or Professor Sprocket (Silverbridge): Aether Pistol. Pure SKL.' },
      { range: '10–20', text: 'Shock Grenade, Thermal Overload, Precision Optics, Orbital Beam; Sefa\'s test for Cyclone Snare.' },
      { range: '20–30', text: 'Arc Coil, Arrow Storm, Gale Spirits; Virtuoso from the Bard master.' }
    ]
  },
  {
    id: 'starfall-archmage',
    name: 'Starfall Archmage',
    tagline: 'Pure Intelligence glass cannon: meteors, comets, frozen time — the ultimates of four schools.',
    roles: ['Glass Cannon', 'Caster', 'Ultimates'],
    difficulty: 3,
    classes: ['pyro', 'elementalist', 'chrono', 'lightbringer'],
    attrs: A(5, 5, 64, 5, 22, 16),
    actives: ['echoBolt', 'chainSpark', 'sunfall', 'frostfireComet', 'cataclysm', 'phoenixFlight', 'elementalConvergence', 'timeStop'],
    passives: ['everflame', 'spellweave', 'elementalHarmony', 'searingLight'],
    gear: { main: 'archmageWand', off: 'orbOfEternalFlame', head: 'hatOfTheStarweaver', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free the oracle so the Keeper of Hours teaches in the temple', 'Circle at Ironhold for the Aether-Works off-hands'],
    intro: 'Where the Inferno Glass Cannon commits to fire, the Starfall Archmage takes the four biggest ultimates in the game — Cataclysm, Elemental Convergence, Time Stop, Phoenix Flight — and fills the gaps with Intelligence nukes. Every passive is spell crit or spell damage; Endurance is 5.',
    playstyle: ['Time Stop the pack, then Cataclysm and Convergence into frozen targets.', 'Sunfall marks the elite for +20% damage.', 'Echo Bolt and Chain Spark while the ultimates come back.'],
    rotation: ['Sunfall', 'Time Stop', 'Cataclysm', 'Elemental Convergence', 'Frostfire Comet', 'Phoenix Flight', 'Echo Bolt / Chain Spark filler'],
    strengths: ['Four screen-clearing ultimates', 'Spell crit stacks from four sources'],
    weaknesses: ['Long cooldowns: a bad opener leaves you naked', 'Four teachers, one hidden'],
    leveling: [
      { range: '1–14', text: 'Ember Wren (Sunford) for Fireball while leveling; Magistra Iris in Silverbridge for Chain Spark. Pure INT.' },
      { range: '14–24', text: 'Spellweave, Everflame, Frostfire Comet; Cataclysm at 24.' },
      { range: '24–30', text: 'Keeper of Hours: Echo Bolt, Time Stop. Lightbringer for Sunfall and Searing Light; Elemental Convergence at 28.' }
    ]
  },
  {
    id: 'stone-colossus',
    name: 'Stone Colossus',
    tagline: 'An immortal wall of rock and ice. Knockback-immune, stun-proof, unkillable.',
    roles: ['Tank', 'Immortal', 'Bruiser'],
    difficulty: 1,
    classes: ['geo', 'frostwarden', 'aegis'],
    attrs: A(47, 5, 20, 35, 5, 5),
    actives: ['shieldSlam', 'frostCleave', 'seismicShock', 'sinkhole', 'geodeShell', 'tectonicRupture', 'holyBastion', 'tauntingCry'],
    passives: ['bedrock', 'earthenSkin', 'iceborn', 'unbreakable'],
    gear: { main: 'dragonSmasher', off: 'shieldOfTheFallen', head: 'ironcladHelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'forgeplateGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Shatter the Ironhold core: Order armourers sell T5 plate', 'Forge and upgrade the plate to +5 at a smith'],
    intro: 'Strength is armour here: Earthen Skin turns 25% of it into Armor, plate gets Strength\'s heavy-armour bonus, and every damage skill hits with it. Bedrock and Iceborn make you immune to knockback, Earthen Skin and Iceborn halve stuns, Unbreakable cuts damage by 25% on low health. Geode Shell soaks a burst and explodes.',
    playstyle: ['Walk into the middle, Taunting Cry, Seismic Shock.', 'Geode Shell before the big hit, Holy Bastion for a boss special.', 'Tectonic Rupture when they are all around you.'],
    rotation: ['Taunting Cry', 'Seismic Shock', 'Sinkhole', 'Shield Slam', 'Frost Cleave', 'Geode Shell', 'Tectonic Rupture', 'Holy Bastion'],
    strengths: ['Cannot be pushed, barely stunned', 'Armour in the hundreds', 'Simple'],
    weaknesses: ['Slow', 'Kills come from area skills, not speed'],
    leveling: [
      { range: '1–12', text: 'Harrow Flint and Ser Aldric, both in Sunford: Stone Spike, Shield Slam, Seismic Shock. STR, then END.' },
      { range: '12–23', text: 'Bedrock, Sinkhole, Earthen Skin, Taunting Cry; Frostwarden cage or test for Frost Cleave.' },
      { range: '23–30', text: 'Geode Shell, Iceborn, Tectonic Rupture, Unbreakable.' }
    ]
  },
  {
    id: 'thornwall-reflector',
    name: 'Thornwall Reflector',
    tagline: 'Let them hit you. Every block, every taunt, every bastion sends it back.',
    roles: ['Tank', 'Reflect', 'Immortal'],
    difficulty: 2,
    classes: ['aegis', 'frostwarden'],
    attrs: A(48, 5, 14, 35, 5, 10),
    actives: ['shieldSlam', 'shieldShove', 'shieldThrow', 'retribution', 'avalancheLeap', 'frostShatter', 'holyBastion', 'tauntingCry'],
    passives: ['bulwark', 'aegisAura', 'fortitude', 'frozenHeart'],
    gear: { main: 'smithMasterMithrilHammer', off: 'aegisTowerShield', head: 'wyrmguardGreathelm', body: 'armorOfTheTitan', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Defend Oakhaven for the master armourer', 'The Aegis Tower Shield (Tundra) reflects 20 on every block'],
    intro: 'A thorns build. Block chance comes from Strength and the shield, Bulwark adds 15% and reflects 50 per block, the Aegis Tower Shield 20 more, Holy Bastion reflects half of everything for 4 s, and Retribution pays back 150% of what you took. Every damage skill scales with Strength. The hammer is forged, not found — a smith\'s masterwork mithril.',
    playstyle: ['Taunt a pack and stand still: let the blocks do the work.', 'Holy Bastion right before a boss special.', 'Retribution when the counter is full.'],
    rotation: ['Taunting Cry', 'Holy Bastion', 'Shield Shove', 'Shield Slam', 'Retribution', 'Avalanche Leap', 'Frost Shatter'],
    strengths: ['The more enemies, the more damage', 'Very safe', 'Uses forged gear — no luck needed'],
    weaknesses: ['Weak against enemies that do not attack', 'Bosses with few big hits block less'],
    leveling: [
      { range: '1–10', text: 'Ser Aldric in Sunford. STR and END evenly; Wooden Buckler → Iron Shield.' },
      { range: '10–23', text: 'Shield Throw, Taunting Cry, Shield Shove, Holy Bastion, Bulwark. Mine ore and forge.' },
      { range: '23–30', text: 'Retribution; Frostwarden for Avalanche Leap and Frost Shatter.' }
    ]
  },
  {
    id: 'untouchable-monk',
    name: 'Untouchable',
    tagline: 'A tank that is never hit: 60% dodge, crane footwork, and fists that answer.',
    roles: ['Tank', 'Evasion', 'Melee'],
    difficulty: 2,
    classes: ['ironmonk', 'shadow', 'windrunner'],
    attrs: A(5, 50, 5, 37, 15, 5),
    actives: ['palmStrike', 'flyingKick', 'risingDragon', 'whirlwindKick', 'shadowstep', 'craneStance', 'smokeBomb', 'zephyrDash'],
    passives: ['evasion', 'cranesGrace', 'fleetfoot', 'ironBody'],
    gear: { main: 'vipinsStiletto', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'bandOfSwiftness', trinket2: 'ringOfAbsolutePower' },
    choices: ['Any — Iron Monk is taught openly in Silverbridge'],
    intro: 'Dodge is capped at 60%, and this build reaches it: Evasion 20%, Crane\'s Grace 10%, Fleetfoot 8%, Pathfinder-and-Horizon boots, plus Haste on every dodge. Iron Body and Endurance soak the 40% that still lands. Every damage skill scales with Dexterity, which also brings speed and crits.',
    playstyle: ['Crane Stance up at all times.', 'Fight in the crowd: every dodge gives Haste.', 'Smoke Bomb doubles the next Rising Dragon.'],
    rotation: ['Crane Stance', 'Flying Kick', 'Palm Strike', 'Whirlwind Kick', 'Smoke Bomb', 'Rising Dragon', 'Shadowstep / Zephyr Dash to reset'],
    strengths: ['Dodge cap', 'Good damage for a tank', 'Fast'],
    weaknesses: ['Unlucky streaks hurt', 'Area damage cannot be dodged'],
    leveling: [
      { range: '1–10', text: 'Master Oru in Silverbridge: Palm Strike, Flying Kick, Crane Stance. DEX and END.' },
      { range: '10–20', text: 'Shadowstep, Evasion, Smoke Bomb (Shadowblade); Rising Dragon, Crane\'s Grace.' },
      { range: '20–30', text: 'Whirlwind Kick; Sefa\'s test for Fleetfoot and Zephyr Dash.' }
    ]
  },
  {
    id: 'chrono-lich',
    name: 'Chrono-Lich',
    tagline: 'An immortal caster: rewind every mistake, delay every blow, freeze every foe.',
    roles: ['Immortal', 'Caster', 'Crowd Control'],
    difficulty: 3,
    classes: ['chrono', 'frostwarden', 'blood', 'lightbringer', 'elementalist'],
    attrs: A(9, 5, 46, 27, 25, 5),
    actives: ['chronoRewind', 'timeBubble', 'timeLoop', 'paradoxShift', 'frostArmor', 'essenceHarvest', 'rimeField', 'temporalStasis'],
    passives: ['timeDistort', 'foresight', 'haloWard', 'prismaticWard'],
    gear: { main: 'archmageWand', off: 'tomeOfNovices', head: 'seersCirclet', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Slay the oracle for the Timekeeper\'s Hourglass early', 'Keep the Circle friendly for the mana blessing'],
    intro: 'Immortality through Intelligence. Time Distort delays 30% of every hit, Halo Ward and Prismatic Ward cut damage, Frost Armor shields and slows attackers, Essence Harvest heals from damage dealt, Rime Field holds the pack, and Chrono Rewind undoes the last 4 seconds. All of it — damage and healing — rides on INT.',
    playstyle: ['Frost Armor up before the fight, Rime Field under the pack.', 'Time Bubble the pack, Paradox Shift to turn them on each other.', 'Chrono Rewind right after a hit you did not like.'],
    rotation: ['Frost Armor', 'Rime Field', 'Time Bubble', 'Paradox Shift', 'Time Loop', 'Essence Harvest', 'Temporal Stasis on the elite', 'Chrono Rewind on demand'],
    strengths: ['Survives what kills other casters', 'Undo button', 'Strong control'],
    weaknesses: ['Four teachers to find', 'Chrono opens late'],
    leveling: [
      { range: '1–16', text: 'Elementalist from Silverbridge for damage; Prismatic Ward at 21 is the early defence.' },
      { range: '16–24', text: 'Frostwarden cage or test for Frost Armor; Sangrel for Essence Harvest.' },
      { range: '24–30', text: 'Keeper of Hours: the Chrono line, ending with Chrono Rewind.' }
    ]
  },
  {
    id: 'sovereign-warlord',
    name: 'Sovereign of Armies',
    tagline: 'A pure Grand Sovereign: you never swing a sword. You command.',
    roles: ['Summoner', 'Commander', 'Pure Class'],
    difficulty: 1,
    classes: ['sovereign'],
    attrs: A(5, 5, 5, 37, 5, 60),
    actives: ['royalGuard', 'callArchers', 'armyOfTheRealm', 'summonChampion', 'commandFocus', 'royalRally', 'bannerOfVictory', 'royalDecree'],
    passives: ['inspiringPresence', 'warMarshal', 'loyalHearts', 'sovereignsTribute'],
    gear: { main: 'apprenticeStaff', off: 'shieldOfTheFallen', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'duelistsGrips', feet: 'stormstrideGreaves', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Defend Oakhaven: Lord Castellan keeps his hall', 'Give the throne to the Order — a Sovereign on a throne'],
    intro: 'All twelve skills from one class. Every summon scales with Charisma, and Charisma also cheapens every shop and trainer by up to 40% and raises quest gold. Loyal Hearts heals the army, Sovereign\'s Tribute moves 15% of your damage onto it, Royal Decree stuns and marks the pack for your soldiers.',
    playstyle: ['Banner of Victory down, guards and archers up.', 'Command Focus points the army at the elite.', 'Royal Decree stuns everything for the army to finish.'],
    rotation: ['Banner of Victory', 'Royal Guard', 'Call Archers', 'Command Focus', 'Royal Decree', 'Army of the Realm', 'Summon Champion', 'Royal Rally to heal'],
    strengths: ['Pure-class, all in Oakhaven or Silverbridge', 'Cheapest shopping in the game', 'Safe'],
    weaknesses: ['Army can be wiped by area bosses', 'Slow clear between summons'],
    leveling: [
      { range: '1–10', text: 'Lord Castellan (Oakhaven) or Lord Percival (Silverbridge). Pure CHA, END second.' },
      { range: '10–20', text: 'Tribute, Royal Rally, Banner, War Marshal, Royal Decree.' },
      { range: '20–30', text: 'Loyal Hearts, Army of the Realm, Summon Champion.' }
    ]
  },
  {
    id: 'turret-engineer',
    name: 'Turret Engineer',
    tagline: 'Build the kill-zone, stand behind it, upgrade your own suit.',
    roles: ['Summoner', 'Tech', 'Ranged'],
    difficulty: 2,
    classes: ['aether', 'windrunner', 'chrono'],
    attrs: A(5, 20, 14, 23, 50, 5),
    actives: ['deployTurret', 'aetherPistol', 'shockGrenade', 'orbitalBeam', 'exoSuit', 'rocketJump', 'galeSpirits', 'hasteField'],
    passives: ['coolantLoop', 'precisionOptics', 'thermalPlating', 'entropy'],
    gear: { main: 'aetherCarbine', off: 'aethericBattery', head: 'hatOfTheStarweaver', body: 'exoArmorChassis', hands: 'duelistsGrips', feet: 'stormstrideGreaves', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Give the Ironhold core to the Circle (18 INT): Tinker Voss sells aether-works'],
    intro: 'A Skill-based summoner: two turrets, Gale Spirits shooting beside you, and an Exo Suit with rockets. Entropy shortens every cooldown each time you cast, Haste Field speeds you and the guns up, Thermal Plating makes heat into armour. Everything that deals damage scales with Skill.',
    playstyle: ['Two turrets at a choke point, then Haste Field.', 'Shock Grenade stuns whatever reaches the turrets.', 'Exo Suit for the elite.'],
    rotation: ['Deploy Turret ×2', 'Haste Field', 'Gale Spirits', 'Shock Grenade', 'Orbital Beam', 'Aether Pistol filler', 'Exo Suit', 'Rocket Jump away'],
    strengths: ['Damage while you move', 'Very low cooldowns', 'Safe'],
    weaknesses: ['Turrets do not follow you', 'Needs the Keeper of Hours for Haste Field and Entropy'],
    leveling: [
      { range: '1–10', text: 'Gearwright Pim in Ironhold or Professor Sprocket: Aether Pistol, Deploy Turret. Pure SKL.' },
      { range: '10–20', text: 'Coolant Loop, Shock Grenade, Precision Optics, Orbital Beam.' },
      { range: '20–30', text: 'Gale Spirits (Windrunner), Exo Suit, Entropy and Haste Field (Chrono), Thermal Plating.' }
    ]
  },
  {
    id: 'rimebound-lich',
    name: 'Rimebound Lich',
    tagline: 'An Intelligence frost mage: everything slows, then freezes, then breaks.',
    roles: ['Caster', 'Crowd Control', 'Frost'],
    difficulty: 2,
    classes: ['frostwarden', 'elementalist', 'chrono'],
    attrs: A(9, 5, 50, 20, 28, 5),
    actives: ['rimeLance', 'frostArmor', 'rimeField', 'paradoxShift', 'frostLance', 'thunderSnow', 'timeBubble', 'frostfireComet'],
    passives: ['elementalHarmony', 'frozenMoment', 'spellweave', 'prismaticWard'],
    gear: { main: 'chronoBlade', off: 'tomeOfNovices', head: 'hatOfTheStarweaver', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Ivor Hask from the Tundra cage for Frostwarden lessons'],
    intro: 'The Frostwarden as a caster: Rime Lance, Rime Field and Frost Armor are its Intelligence half, and the Elementalist\'s Frost Lance, Thunder Snow and Frostfire Comet join them. Frozen Moment adds a 12% freeze on every hit; the Chrono Blade adds 10% more.',
    playstyle: ['Rime Field + Time Bubble: nothing walks out.', 'Frost Armor slows whatever hits you.', 'Paradox Shift turns the frozen pack on itself.'],
    rotation: ['Frost Armor', 'Rime Field', 'Time Bubble', 'Thunder Snow', 'Frost Lance', 'Rime Lance', 'Frostfire Comet', 'Paradox Shift'],
    strengths: ['Permanent slows and freezes', 'A shield and a confuse on top', 'Easy to play'],
    weaknesses: ['Damage is good, not great', 'Frost giants resist'],
    leveling: [
      { range: '1–13', text: 'Magistra Iris (Silverbridge): Prism Bolt, Frost Lance. INT, then SKL.' },
      { range: '13–22', text: 'Frostwarden via the Tundra cage or Halvard\'s test: Rime Lance, Frost Armor, Rime Field.' },
      { range: '22–30', text: 'Frozen Moment and Time Bubble (Chrono), Paradox Shift, Frostfire Comet.' }
    ]
  },
  {
    id: 'silver-tongue',
    name: 'Silver Tongue',
    tagline: 'Charm, sing, haggle. The richest hero in the realm, and the most popular.',
    roles: ['Role-play', 'Support', 'Crowd Control'],
    difficulty: 2,
    classes: ['bard', 'beastcaller'],
    attrs: A(5, 5, 5, 25, 27, 50),
    actives: ['sharpNote', 'crescendo', 'grandFinale', 'callHawk', 'wolfPounce', 'charmingSerenade', 'lullaby', 'marchingSong'],
    passives: ['stagePresence', 'standingOvation', 'longRefrain', 'virtuoso'],
    gear: { main: 'aetherCarbine', off: 'tomeOfNovices', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'duelistsGrips', feet: 'pathfindersBoots', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Spare the Goblin King with the pact (CHA 8)', 'Strike the dragon pact (CHA 25)', 'Every quest with a Charisma choice is yours'],
    intro: 'Charisma is the stat nobody else maxes. Here it is damage (Sharp Note, Crescendo, Grand Finale, the hawk and the wolf), 40% off every shop and trainer, more quest gold — and it opens every Charisma choice in the story. Lullaby and Charming Serenade keep the fight away from you.',
    playstyle: ['Lullaby the front, Serenade the elite.', 'Crescendo deals more the more allies stand near.', 'Grand Finale charms everything for 3 s.'],
    rotation: ['Marching Song', 'Lullaby', 'Charming Serenade', 'Call Hawk', 'Sharp Note', 'Wolf Pounce', 'Crescendo', 'Grand Finale'],
    strengths: ['Cheapest gear and skills in the game', 'Every dialogue option open', 'Strong control'],
    weaknesses: ['Damage depends on Crescendo and Finale', 'Beastcaller is a secret master'],
    leveling: [
      { range: '1–10', text: 'Lark Merriweather in Silverbridge: Sharp Note, Marching Song, Lullaby. Pure CHA.' },
      { range: '10–20', text: 'Charming Serenade, Long Refrain, Virtuoso; Rowan\'s test for Wolf Pounce and Call Hawk.' },
      { range: '20–30', text: 'Crescendo, Standing Ovation, Grand Finale.' }
    ]
  },
  {
    id: 'storm-caller',
    name: 'Storm Caller',
    tagline: 'Chain lightning, thunder-snow and sun-lances: every spell jumps to the next foe.',
    roles: ['Caster', 'Area Damage', 'Chain'],
    difficulty: 2,
    classes: ['elementalist', 'lightbringer', 'chrono'],
    attrs: A(5, 5, 55, 13, 23, 16),
    actives: ['chainSpark', 'thunderSnow', 'prismaticNova', 'elementalConvergence', 'sunbolt', 'lanceOfLight', 'echoBolt', 'timeLoop'],
    passives: ['spellweave', 'elementalHarmony', 'searingLight', 'foresight'],
    gear: { main: 'archmageWand', off: 'orbOfEternalFlame', head: 'hatOfTheStarweaver', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Circle at Ironhold for its off-hands and friendly trainers'],
    intro: 'A lightning mage. Chain Spark jumps four times, Lance of Light pierces a line, Thunder Snow strikes inside its storm, Echo Bolt and Time Loop repeat their damage. All Intelligence. Searing Light and Spellweave stack spell crit; Foresight shortens cooldowns.',
    playstyle: ['Thunder Snow first, then Chain Spark into it.', 'Line enemies up for Lance of Light.', 'Time Loop the elite and keep casting.'],
    rotation: ['Thunder Snow', 'Chain Spark', 'Lance of Light', 'Echo Bolt', 'Time Loop', 'Prismatic Nova', 'Elemental Convergence'],
    strengths: ['Great on spread-out packs', 'Short cooldowns', 'Strong crit'],
    weaknesses: ['Low defence', 'Two secret teachers'],
    leveling: [
      { range: '1–14', text: 'Magistra Iris in Silverbridge: Prism Bolt, Chain Spark, Thunder Snow.' },
      { range: '14–24', text: 'Spellweave, Prismatic Nova; Lightbringer for Sunbolt and Lance of Light.' },
      { range: '24–30', text: 'Searing Light; Keeper of Hours for Echo Bolt, Time Loop, Foresight; Convergence at 28.' }
    ]
  },
  {
    id: 'blood-rage-berserker',
    name: 'Blood-Rage Berserker',
    tagline: 'Endurance to the brim, then burn it: the lower you go, the harder you hit.',
    roles: ['Berserker', 'Lifesteal', 'High Risk'],
    difficulty: 3,
    classes: ['blood', 'aegis', 'ironmonk', 'beastcaller'],
    attrs: A(16, 8, 14, 60, 5, 14),
    actives: ['mutagenicRage', 'sanguineFlask', 'holyChains', 'homunculus', 'essenceWard', 'tigerStance', 'craneStance', 'packBond'],
    passives: ['adrenalCatalyst', 'hemophilia', 'thickHide', 'ironBody'],
    gear: { main: 'bloodForgedAxe', off: 'syringeOfTheAdept', head: 'wyrmguardGreathelm', body: 'bloodSoakedPlate', hands: 'duelistsGrips', feet: 'stormstrideGreaves', trinket1: 'ringOfTheVampyre', trinket2: 'heartOfTheMountain' },
    choices: ['Betray Oakhaven: Doctor Sangrel teaches from level 10'],
    intro: 'The berserker the old guide wanted to be. Every damage skill scales with Endurance — Holy Chains, Sanguine Flask, the Homunculus, Mutagenic Rage — so the health pool IS the weapon. Adrenal Catalyst adds 30% damage under 30% health, Hemophilia and the Vampyre ring drink it back, Thick Hide and Iron Body keep you standing.',
    playstyle: ['Mutagenic Rage + Tiger Stance, then Holy Chains the pack in.', 'Spend health on Sanguine Flasks until Adrenal Catalyst kicks in.', 'Essence Ward when you went too far.'],
    rotation: ['Tiger Stance', 'Mutagenic Rage', 'Holy Chains', 'Sanguine Flask ×2', 'Homunculus', 'Pack Bond', 'Essence Ward', 'Crane Stance to recover'],
    strengths: ['Enormous health pool', 'Life steal from three sources', 'Stance swapping'],
    weaknesses: ['Deliberately fights at low health', 'Blood class opens late'],
    leveling: [
      { range: '1–12', text: 'Iron Monk (Silverbridge): Tiger and Crane Stance, Iron Body. Pure END.' },
      { range: '12–20', text: 'Holy Chains (Aegis), Thick Hide, Pack Bond (Beastcaller test).' },
      { range: '20–30', text: 'Blood: Sanguine Flask, Hemophilia, Homunculus, Mutagenic Rage, Adrenal Catalyst.' }
    ]
  },
  {
    id: 'one-shot-sniper',
    name: 'One-Shot Sniper',
    tagline: 'Mark. Breathe. One arrow. Next.',
    roles: ['Single Target', 'Crit', 'Ranged'],
    difficulty: 2,
    classes: ['windrunner', 'shadow'],
    attrs: A(5, 55, 5, 17, 30, 5),
    actives: ['shadowMark', 'piercingGale', 'skyrender', 'galeArrow', 'grapplingHook', 'starFan', 'updraftLeap', 'smokeBomb'],
    passives: ['keenEye', 'skyHunter', 'lethality', 'silentStrike'],
    gear: { main: 'voidCannon', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'infiltratorsCharm', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Kestrel Vane (Ashen Crags cage) for early Windrunner lessons'],
    intro: 'Ranged assassination. Silent Strike and the Infiltrator\'s Charm let you approach unseen, Shadow Mark adds 25% damage taken, Smoke Bomb doubles the next hit — and the next hit is Skyrender. Lethality, Keen Eye and Sky Hunter stack crit chance and crit damage. All on Dexterity.',
    playstyle: ['Open from stealth range: Shadow Mark the elite.', 'Smoke Bomb, then Skyrender.', 'Gale Arrow pushes back anything that closes in.'],
    rotation: ['Shadow Mark', 'Smoke Bomb', 'Skyrender', 'Piercing Gale', 'Star Fan', 'Gale Arrow', 'Grappling Hook', 'Updraft Leap to escape'],
    strengths: ['Elites die before they move', 'Long range', 'Stealth openers'],
    weaknesses: ['Big packs are slow', 'Low health'],
    leveling: [
      { range: '1–9', text: 'Nettle Quickhand (Sunford): Star Fan, Lethality. Pure DEX.' },
      { range: '9–20', text: 'Grappling Hook, Smoke Bomb, Silent Strike, Shadow Mark; Windrunner via cage or test.' },
      { range: '20–30', text: 'Keen Eye, Sky Hunter, Skyrender.' }
    ]
  },
  {
    id: 'holy-avenger',
    name: 'Holy Avenger',
    tagline: 'A Charisma paladin who heals the army he leads.',
    roles: ['Healer', 'Summoner', 'Support'],
    difficulty: 1,
    classes: ['lightbringer', 'sovereign'],
    attrs: A(5, 5, 18, 28, 5, 56),
    actives: ['mendingLight', 'dawnShield', 'dawnSanctuary', 'royalGuard', 'callArchers', 'summonChampion', 'royalRally', 'bannerOfVictory'],
    passives: ['kindledHope', 'guardianLight', 'loyalHearts', 'inspiringPresence'],
    gear: { main: 'apprenticeStaff', off: 'shieldOfTheFallen', head: 'seersCirclet', body: 'vestmentsOfSovereign', hands: 'duelistsGrips', feet: 'stormstrideGreaves', trinket1: 'sovereignsSignet', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free Sister Aurelle (Sunken Temple cage) to learn Lightbringer in Sunford', 'Defend Oakhaven'],
    intro: 'The Lightbringer\'s healing half — Mending Light, Dawn Shield, Dawn Sanctuary — scales with Charisma, exactly like the Sovereign\'s summons. One stat heals you, shields you and powers your guards, archers and champion. Kindled Hope adds 20% healing, Loyal Hearts heals the army, Guardian Light saves you from death.',
    playstyle: ['Dawn Sanctuary under the army.', 'Royal Rally and Banner keep the soldiers alive.', 'Mending Light and Dawn Shield are for you.'],
    rotation: ['Royal Guard', 'Call Archers', 'Banner of Victory', 'Dawn Sanctuary', 'Summon Champion', 'Royal Rally', 'Dawn Shield', 'Mending Light'],
    strengths: ['Nearly unkillable with a living army', 'One stat for everything', 'Cheap shopping'],
    weaknesses: ['Little personal damage', 'Lightbringer is a secret class'],
    leveling: [
      { range: '1–12', text: 'Sovereign: Royal Guard, Call Archers. Pure CHA.' },
      { range: '12–20', text: 'Lightbringer via cage or Auriel\'s test: Mending Light, Kindled Hope, Dawn Shield, Dawn Sanctuary.' },
      { range: '20–30', text: 'Guardian Light, Loyal Hearts, Summon Champion.' }
    ]
  },
  {
    id: 'shadow-thief',
    name: 'Shadow Thief',
    tagline: 'In, out, unseen. A role-play rogue who picks fights only on his terms.',
    roles: ['Role-play', 'Stealth', 'Assassin'],
    difficulty: 2,
    classes: ['shadow', 'bard', 'windrunner'],
    attrs: A(5, 50, 5, 20, 26, 11),
    actives: ['shadowstep', 'starFan', 'grapplingHook', 'nightshadeMist', 'smokeBomb', 'venomousBlade', 'shadowMark', 'zephyrDash'],
    passives: ['silentStrike', 'evasion', 'fleetfoot', 'stagePresence'],
    gear: { main: 'vipinsStiletto', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'infiltratorsCharm', trinket2: 'ringOfAbsolutePower' },
    choices: ['Betray Oakhaven — a thief sides with the Syndicate', 'Ransom the Goblin King for the gold', 'Sell the Ironhold core to the Syndicate for 2,600 gold'],
    intro: 'A thief\'s kit: Silent Strike and the Infiltrator\'s Charm (40% quieter) mean packs notice you late, Smoke Bomb and Zephyr Dash end any fight you do not want, Venomous Blade poisons and Shadow Mark finds the weak spot. Stage Presence and Fleetfoot make you quick. Every damage skill is Dexterity.',
    playstyle: ['Pick off the stragglers first.', 'Venomous Blade on, Shadowstep behind, gone again.', 'Nightshade Mist if a pack notices you.'],
    rotation: ['Venomous Blade', 'Shadow Mark', 'Shadowstep', 'Smoke Bomb', 'Star Fan', 'Grappling Hook', 'Nightshade Mist', 'Zephyr Dash out'],
    strengths: ['Chooses every fight', 'Fast', 'The Syndicate route pays very well'],
    weaknesses: ['Weak in forced arena fights', 'Low health'],
    leveling: [
      { range: '1–10', text: 'Nettle Quickhand in Sunford, then The Whisper in Oakhaven. Pure DEX.' },
      { range: '10–20', text: 'Smoke Bomb, Silent Strike, Shadow Mark; Bard for Stage Presence.' },
      { range: '20–30', text: 'Nightshade Mist; Windrunner for Fleetfoot and Zephyr Dash.' }
    ]
  },
  {
    id: 'heatsink-juggernaut',
    name: 'Heatsink Juggernaut',
    tagline: 'A Skill tank in a walking forge: the hotter it runs, the harder it gets.',
    roles: ['Tank', 'Tech', 'Bruiser'],
    difficulty: 3,
    classes: ['aether', 'windrunner', 'chrono'],
    attrs: A(5, 15, 17, 25, 50, 5),
    actives: ['exoSuit', 'ventHeat', 'rocketJump', 'shockGrenade', 'aetherPistol', 'deployTurret', 'cycloneSnare', 'hasteField'],
    passives: ['thermalPlating', 'coolantLoop', 'thermalOverload', 'foresight'],
    gear: { main: 'aetherCarbine', off: 'aethericBattery', head: 'wyrmguardGreathelm', body: 'exoArmorChassis', hands: 'voidforgedGauntlets', feet: 'stormstrideGreaves', trinket1: 'heartOfTheMountain', trinket2: 'ringOfAbsolutePower' },
    choices: ['Circle at Ironhold for Tinker Voss\'s T5 works'],
    intro: 'Thermal Plating turns heat into 20% damage reduction, the Exo Suit adds 50 armour and rockets, the Exo Armor Chassis is plate built for a Skill hero. Run hot in melee range: Vent Heat for 250% in a cone, Shock Grenade to stun, Thermal Overload doubles crit damage at the cap.',
    playstyle: ['Exo Suit, walk in, fire until hot.', 'Vent Heat point-blank.', 'Cyclone Snare and turrets hold the pack on you.'],
    rotation: ['Exo Suit', 'Deploy Turret', 'Cyclone Snare', 'Aether Pistol to heat up', 'Shock Grenade', 'Vent Heat', 'Haste Field', 'Rocket Jump to reset'],
    strengths: ['Tank and damage on one stat', 'Unique heat dance', 'Turrets hold aggro'],
    weaknesses: ['Overheat lock at the wrong time', 'Gear spread across late zones'],
    leveling: [
      { range: '1–12', text: 'Gearwright Pim or Professor Sprocket: Aether Pistol, Deploy Turret, Rocket Jump, Vent Heat.' },
      { range: '12–22', text: 'Coolant Loop, Thermal Overload, Shock Grenade; Windrunner for Cyclone Snare.' },
      { range: '22–30', text: 'Exo Suit, Thermal Plating; Chrono for Haste Field and Foresight.' }
    ]
  },
  {
    id: 'plague-doctor',
    name: 'Plague Doctor',
    tagline: 'Tonics, wisps and slow fire. Nothing dies quickly; everything dies.',
    roles: ['Damage over time', 'Caster', 'Role-play'],
    difficulty: 2,
    classes: ['blood', 'soulwarden', 'pyro'],
    attrs: A(5, 5, 46, 22, 25, 14),
    actives: ['enfeeblingTonic', 'philosophersCrucible', 'wispSwarm', 'spiritLantern', 'ringOfFire', 'flamePillar', 'fireball', 'hauntingWail'],
    passives: ['everflame', 'wildfire', 'cauterize', 'smolderingCore'],
    gear: { main: 'archmageWand', off: 'syringeOfTheAdept', head: 'seersCirclet', body: 'scholarsRobe', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'castersEmblem', trinket2: 'ringOfAbsolutePower' },
    choices: ['Betray Oakhaven — the doctor\'s chapel opens early'],
    intro: 'Damage over time from three classes, all on Intelligence: Enfeebling Tonic weakens, the Crucible and Spirit Lantern burn the ground, Ring of Fire traps, burns spread through Wildfire. Cauterize makes burning enemies hit you 15% softer. Role-play the masked doctor of the Syndicate.',
    playstyle: ['Lay the ground first: Ring of Fire, Crucible, Lantern.', 'Haunting Wail fears them back into it.', 'Kite in circles and let the burns tick.'],
    rotation: ['Ring of Fire', 'Philosopher\'s Crucible', 'Spirit Lantern', 'Enfeebling Tonic', 'Flame Pillar', 'Wisp Swarm', 'Haunting Wail', 'Fireball filler'],
    strengths: ['Huge total damage on packs', 'Safe kiting', 'Cheap mana'],
    weaknesses: ['Slow burst', 'Weak in a race against a boss'],
    leveling: [
      { range: '1–12', text: 'Ember Wren (Sunford): Fireball, Flame Pillar. Pure INT.' },
      { range: '12–22', text: 'Warden Odalys: Spirit Lantern, Haunting Wail; Ring of Fire, Everflame.' },
      { range: '22–30', text: 'Blood: Enfeebling Tonic, Philosopher\'s Crucible; Wisp Swarm, Wildfire.' }
    ]
  },
  {
    id: 'soul-shepherd',
    name: 'Soul Shepherd',
    tagline: 'An undying necromancer: the dead fight for you, time rewinds for you.',
    roles: ['Summoner', 'Immortal', 'Necromancer'],
    difficulty: 2,
    classes: ['soulwarden', 'chrono', 'frostwarden'],
    attrs: A(9, 5, 40, 20, 25, 18),
    actives: ['callTheFallen', 'soulBond', 'releaseSouls', 'processionOfSouls', 'wispBolt', 'chronoRewind', 'frostArmor', 'timeBubble'],
    passives: ['restlessSouls', 'wardensVigil', 'kindredSpirits', 'timeDistort'],
    gear: { main: 'archmageWand', off: 'tomeOfNovices', head: 'seersCirclet', body: 'chronoWeaverCloak', hands: 'emberweaveGloves', feet: 'mistwalkerBoots', trinket1: 'timekeepersHourglass', trinket2: 'ringOfAbsolutePower' },
    choices: ['Free the oracle: the Keeper of Hours stays in the temple'],
    intro: 'A Soul Warden that will not die. The risen dead (Call the Fallen, Restless Souls) tank, Release Souls heals you by detonating them, Warden\'s Vigil cuts damage, Time Distort delays it, Frost Armor shields, and Chrono Rewind undoes the worst moment. Everything that deals damage is Intelligence.',
    playstyle: ['Kill a few, Call the Fallen, let them hold the line.', 'Time Bubble behind your spirits.', 'Release Souls when they are about to fade.'],
    rotation: ['Frost Armor', 'Wisp Bolt', 'Call the Fallen', 'Soul Bond', 'Time Bubble', 'Procession of Souls', 'Release Souls', 'Chrono Rewind'],
    strengths: ['An army and an undo button', 'Very safe once rolling'],
    weaknesses: ['Lone bosses give no corpses', 'Needs the hidden Chrono teacher'],
    leveling: [
      { range: '1–12', text: 'Warden Odalys (Silverbridge): Wisp Bolt, Call the Fallen, Kindred Spirits. Pure INT.' },
      { range: '12–22', text: 'Restless Souls, Warden\'s Vigil, Release Souls; Frost Armor (Frostwarden).' },
      { range: '22–30', text: 'Keeper of Hours: Time Distort, Time Bubble, Chrono Rewind; Procession of Souls at 27.' }
    ]
  },
  {
    id: 'gale-speedrunner',
    name: 'Gale Speedrunner',
    tagline: 'Built to clear zones faster than anyone. Move speed capped, cooldowns short.',
    roles: ['Speedrun', 'Mobility', 'Role-play'],
    difficulty: 2,
    classes: ['windrunner', 'ironmonk', 'shadow', 'bard'],
    attrs: A(5, 54, 5, 16, 22, 15),
    actives: ['updraftLeap', 'flyingKick', 'whirlwindKick', 'shadowstep', 'grapplingHook', 'galeArrow', 'zephyrDash', 'marchingSong'],
    passives: ['fleetfoot', 'stagePresence', 'swiftDraw', 'evasion'],
    gear: { main: 'vipinsStiletto', off: 'tomeOfNovices', head: 'stalkersHood', body: 'assassinsGarb', hands: 'gripsOfTheTempest', feet: 'treadsOfTheHorizon', trinket1: 'copperBand', trinket2: 'ringOfAbsolutePower' },
    choices: ['Skip every side errand you do not need — that is the point'],
    intro: 'Move speed is capped at 160%: Dexterity, Fleetfoot (10%), Stage Presence (6%), Marching Song (25%), Treads of the Horizon (10%), the Copper Band and Zephyr Dash all push it there. Six of the actives are also movement — Shadowstep, Flying Kick, Updraft Leap, the Grappling Hook — and every one of them hits on Dexterity.',
    playstyle: ['Marching Song before every clearing.', 'Never stop: Flying Kick into a pack, Whirlwind Kick, Updraft Leap out.', 'Run past packs you do not need.'],
    rotation: ['Marching Song', 'Zephyr Dash', 'Flying Kick', 'Whirlwind Kick', 'Updraft Leap', 'Shadowstep to the next', 'Gale Arrow / Grappling Hook on runners'],
    strengths: ['Fastest zone clears', 'Hard to pin down', 'Fun'],
    weaknesses: ['Not built for long boss fights', 'Four teachers'],
    leveling: [
      { range: '1–10', text: 'Shadowblade and Iron Monk: Shadowstep, Flying Kick. Pure DEX.' },
      { range: '10–20', text: 'Grappling Hook, Evasion; Windrunner for Gale Arrow, Fleetfoot, Zephyr Dash, Updraft Leap.' },
      { range: '20–30', text: 'Swift Draw, Whirlwind Kick; Bard for Stage Presence and Marching Song.' }
    ]
  },
  {
    id: 'sunford-brawler',
    name: 'Sunford Brawler',
    tagline: 'No secrets, no hidden masters: everything from the first town, and still a monster.',
    roles: ['Beginner', 'Melee', 'Bruiser'],
    difficulty: 1,
    classes: ['aegis', 'geo'],
    attrs: A(50, 5, 15, 37, 5, 5),
    actives: ['shieldSlam', 'radiantStrike', 'shieldThrow', 'stoneSpike', 'boulderRoll', 'seismicShock', 'sinkhole', 'tauntingCry'],
    passives: ['aegisAura', 'fortitude', 'bedrock', 'earthenSkin'],
    gear: { main: 'smithMasterGoldHammer', off: 'smithMasterGoldShield', head: 'smithMasterGoldHelm', body: 'smithMasterGoldPlate', hands: 'ironGauntlets', feet: 'smithMasterGoldGreaves', trinket1: 'ringOfMending', trinket2: 'copperBand' },
    choices: ['Any — nothing here depends on the story'],
    intro: 'The build for a second playthrough where you do not want to hunt anything. Ser Aldric and Harrow Flint teach every skill on the bar in Sunford; the gear is forged gold-masterwork plate from any smith plus shop rings. Everything hits on Strength, and Strength also makes the plate stronger. Strong from level 1 to the endgame.',
    playstyle: ['Taunting Cry, Seismic Shock, Sinkhole — the pack is on the floor.', 'Shield Slam stuns the elite.', 'Boulder Roll and Stone Spike for runners.'],
    rotation: ['Taunting Cry', 'Seismic Shock', 'Sinkhole', 'Shield Slam', 'Radiant Strike', 'Shield Throw', 'Boulder Roll', 'Stone Spike'],
    strengths: ['Everything in the first town', 'No luck needed for gear', 'Very safe'],
    weaknesses: ['No legendaries means a lower ceiling', 'No mobility'],
    leveling: [
      { range: '1–10', text: 'Ser Aldric and Harrow Flint in Sunford. Pure STR, END second.' },
      { range: '10–17', text: 'Shield Throw, Taunting Cry, Sinkhole, Earthen Skin. Mine gold ore and forge.' },
      { range: '17–30', text: 'Masterwork gold plate, then upgrade it to +5 at a smith.' }
    ]
  }
]

export const BUILD_BY_ID: Record<string, GuideBuild> = Object.fromEntries(BUILDS.map(b => [b.id, b]))
