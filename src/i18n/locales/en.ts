// English source bundle. Single source of truth for translation keys — every
// new player-facing string gets a key here first; the per-language files in
// this folder mirror the shape. Vite ships each non-English locale as its own
// lazy chunk (see `src/i18n/index.ts`).
//
// Numbers in `{braces}` are filled in by the game (a skill's description
// quotes the same table the simulation reads), so a balance change never
// leaves a stale number in a translation.
export default {
  'gameName': 'Battlecross',
  'cancel': 'Cancel',
  'close': 'Close',
  'ok': 'Ok',
  'continue': 'Continue',
  'onlyAvailableOn': 'This game is only available on',

  // Accessible names for icon-only controls, and the few shared button words.
  'ui': {
    'next': 'Next',
    'replay': 'Replay',
    'back': 'Back',
    'play': 'Play',
    'pause': 'Pause',
    'menu': 'Menu',
    'home': 'Home',
    'info': 'Info',
    'help': 'Controls',
    'ok': 'Got it',
    'continue': 'Continue'
  },

  // ─── HUD ──────────────────────────────────────────────────────────────────
  'hud': {
    'level': 'Lv {n}',
    'health': 'Health {n} of {max}',
    'mana': 'Mana {n} of {max}',
    'heat': 'Heat',
    'xp': 'XP',
    'gold': '{n} gold',
    'potion': 'Health potion ({n} left)',
    'groups': '{n} of {total} enemy groups defeated',
    'wave': 'Wave {n} / {total}'
  },
  'menu': {
    'map': 'World map',
    'character': 'Hero',
    'skills': 'Skills',
    'inventory': 'Bag'
  },

  // ─── Floating combat text: short, they pop for under a second ─────────────
  'combat': {
    'dodge': 'Dodge',
    'block': 'Blocked',
    'immune': 'Immune'
  },
  'status': {
    'stun': 'Stunned',
    'knockup': 'Airborne',
    'knockdown': 'Knocked down',
    'stasis': 'Stasis',
    'petrify': 'Petrified',
    'frozen': 'Frozen',
    'fear': 'Afraid',
    'slow': 'Slowed',
    'confuse': 'Confused',
    'taunt': 'Taunted',
    'armorShred': 'Armor broken',
    'weaken': 'Weakened',
    'vulnerable': 'Vulnerable',
    'burn': 'Burning',
    'poison': 'Poisoned',
    'bleed': 'Bleeding',
    'delayed': 'Delayed damage',
    'haste': 'Haste',
    'attackSpeed': 'Fast attacks',
    'damageUp': 'Empowered',
    'defenseUp': 'Fortified',
    'regen': 'Regenerating',
    'lifestealUp': 'Life steal',
    'invulnerable': 'Invulnerable',
    'unkillable': 'Unkillable',
    'stealth': 'Hidden',
    'reflect': 'Reflecting',
    'envenom': 'Venom blade',
    'exosuit': 'Exo-Suit',
    'focus': 'Focused',
    'accelerate': 'Accelerate',
    'overheat': 'Overheated',
    'enrage': 'Enraged',
    'ambush': 'Ambush'
  },
  'toast': {
    'item': 'Found: {item}',
    'levelUp': 'Level {level}! +3 attribute points',
    'boss': '{boss} appears',
    'wave': 'Wave {n}'
  },

  // ─── The control coach ────────────────────────────────────────────────────
  // Never drawn: these are the screen-reader sentences behind the wordless
  // glyphs, and the lines of the controls page.
  'coach': {
    'move': {
      'touch': 'Tap the ground to walk there, or use the stick.',
      'mouse': 'Click the ground to walk there, or steer with the movement keys.'
    },
    'target': {
      'touch': 'Tap an enemy, or drag from your hero onto it, to attack it.',
      'mouse': 'Click an enemy to attack it.'
    },
    'skill': {
      'touch': 'Tap a skill to use it on your target.',
      'mouse': 'Press a skill key to use it on your target.'
    },
    'aim': {
      'touch': 'Drag a skill onto the field to aim it, and let go to cast.',
      'mouse': 'Drag a skill onto the field to aim it, and let go to cast.'
    },
    'potion': {
      'touch': 'Tap the potion to heal.',
      'mouse': 'Press the potion key to heal.'
    }
  },

  // ─── The world ────────────────────────────────────────────────────────────
  'node': {
    'sunford': { 'name': 'Sunford', 'desc': 'A farming town at the edge of the plains. Home, a smith, and two trainers.' },
    'plains': { 'name': 'Sunford Plains', 'desc': 'Goblins, wolves and bandits pick at the caravans on the open road.' },
    'hollows': { 'name': 'Goblin Hollows', 'desc': 'The caves under the hills. The Goblin King holds court at the bottom.' },
    'arena': { 'name': 'The Colosseum', 'desc': 'Eight waves, each harder than the last. Gold and glory for whoever is left standing.' },
    'woods': { 'name': 'Whispering Woods', 'desc': 'Old trees that walk, and spiders that spin between them.' },
    'outskirts': { 'name': 'Oakhaven Outskirts', 'desc': 'The burning farms outside Oakhaven. A warlord\'s army is at the gate.' },
    'oakhaven': { 'name': 'Oakhaven', 'desc': 'A walled trade town. What it becomes is up to you.' },
    'crags': { 'name': 'Ashen Crags', 'desc': 'Black rock and open fire. Cultists feed the flames.' },
    'mines': { 'name': 'Ironhold Mines', 'desc': 'The dwarves dug too deep and woke something that glows.' },
    'ironhold': { 'name': 'Ironhold', 'desc': 'The mountain forge-town. The best steel in the realm is hammered here.' },
    'tundra': { 'name': 'Frostbite Tundra', 'desc': 'A white waste where giants walk and the dead do not stay down.' },
    'temple': { 'name': 'Sunken Temple', 'desc': 'Drowned halls of the naga, and an oracle who sees every ending.' },
    'citadel': { 'name': 'Citadel of the Void', 'desc': 'A fortress that was not there last year. Its walls hum.' },
    'peak': { 'name': 'Dragon\'s Peak', 'desc': 'Wyverns circle the summit. Something far larger sleeps on it.' },
    'fortress': { 'name': 'Dread Fortress', 'desc': 'The Arch-Demon\'s seat, and the throne every faction wants.' },
    'rift': { 'name': 'The Void Rift', 'desc': 'The wound the demons came through. The Void Lord waits on the far side.' }
  },
  'map': {
    'title': 'The Realm',
    'town': 'Town',
    'levels': 'Lv {min}–{max}',
    'arenaBest': 'Best: wave {n}',
    'travel': 'Travel',
    'again': 'Go again',
    'enter': 'Enter',
    'fight': 'Fight',
    'back': 'Back to town',
    'locked': 'Clear a neighbouring zone to open the road.',
    'lockedArena': 'Its gates open once the Goblin King is dealt with.',
    'lockedRift': 'It opens when the throne of the Dread Fortress is decided.',
    'danger': {
      '1': 'A little above your level.',
      '2': 'Dangerous at your level.',
      '3': 'Far above your level.'
    },
    'questOpen': '{quest}: a decision waits here.',
    'questDone': '{quest}: {choice}',
    'trainer': 'Hidden trainer: {cls}'
  },
  'travel': {
    'to': 'Travelling to',
    'loading': 'Loading'
  },

  // ─── Character sheet ──────────────────────────────────────────────────────
  'attr': {
    'str': { 'name': 'Strength', 'short': 'STR', 'desc': 'Melee power, block chance, heavy armor.' },
    'dex': { 'name': 'Dexterity', 'short': 'DEX', 'desc': 'Critical hits, attack and move speed.' },
    'int': { 'name': 'Intelligence', 'short': 'INT', 'desc': 'Spell power, mana, elemental resistance.' },
    'end': { 'name': 'Endurance', 'short': 'END', 'desc': 'Health, regeneration, armor, stun resistance.' },
    'skl': { 'name': 'Skill', 'short': 'SKL', 'desc': 'Critical damage, cooldowns, ranged weapons.' },
    'cha': { 'name': 'Charisma', 'short': 'CHA', 'desc': 'Minions, shop prices, rewards, dialogue options.' }
  },
  'stat': {
    'health': 'Health',
    'mana': 'Mana',
    'armor': 'Armor',
    'resist': 'Resistance',
    'crit': 'Crit chance',
    'critDamage': 'Crit damage',
    'attackSpeed': 'Attack speed',
    'moveSpeed': 'Move speed',
    'cdr': 'Cooldown cut',
    'block': 'Block',
    'dodge': 'Dodge',
    'hpRegen': 'Health / s'
  },
  'sheet': {
    'points': '{n} points to spend',
    'raise': 'Raise {attr}',
    'maxLevel': 'Highest level reached'
  },

  // ─── Skills ───────────────────────────────────────────────────────────────
  'skills': {
    'active': 'Active skills',
    'passive': 'Passive skills',
    'known': 'Learned',
    'none': 'Nothing learned yet. Find a trainer in a town.',
    'emptySlot': 'Empty slot {n}',
    'equip': 'Slot it',
    'remove': 'Remove',
    'unmet': 'You no longer meet its requirements.'
  },
  'class': {
    'aegis': { 'name': 'Aegis Knight', 'desc': 'Shield and holy steel. Takes the hits so nothing else has to.' },
    'shadow': { 'name': 'Shadowblade', 'desc': 'Steps out of the dark, strikes from behind, and is gone.' },
    'pyro': { 'name': 'Pyromancer', 'desc': 'Fire answers every question. Burn them, then blow them up.' },
    'sovereign': { 'name': 'Grand Sovereign', 'desc': 'Why fight alone? Summon guards and command them.' },
    'chrono': { 'name': 'Chrono-Weaver', 'desc': 'Stops enemies in time, speeds allies up, and undoes mistakes.' },
    'blood': { 'name': 'Blood Alchemist', 'desc': 'Pays in health for power, then drinks it back from the enemy.' },
    'aether': { 'name': 'Aether-Tech', 'desc': 'Guns, turrets and a heat gauge. Vent it before it locks you out.' },
    'geo': { 'name': 'Geomancer', 'desc': 'Raises walls and spikes, and breaks the ground itself.' }
  },
  'skill': {
    'kind': { 'active': 'Active', 'passive': 'Passive' },
    'cooldown': '{n}s cooldown',
    'mana': '{n} mana',
    'hpCost': '{n}% health',
    'heat': '+{n} heat',
    'aimed': 'Drag to aim',

    // Aegis Knight
    'shieldSlam': { 'name': 'Shield Slam', 'desc': 'Slam the target for {dmg}% Strength damage and stun it for {stun}s.' },
    'aegisAura': { 'name': 'Aegis Aura', 'desc': '+{armor}% Armor, and physical damage taken is reduced by {reduce}%.' },
    'radiantStrike': { 'name': 'Radiant Strike', 'desc': 'A holy blow for {dmg}% Strength damage that heals you for {heal}% of the damage dealt.' },
    'fortitude': { 'name': 'Fortitude', 'desc': 'A hit for more than {hit}% of your health grants a shield worth {shield}% of it for {dur}s. Once every {icd}s.' },
    'tauntingCry': { 'name': 'Taunting Cry', 'desc': 'Enemies within {radius} m attack you for {dur}s. You gain {def}% Defense while they do.' },
    'holyBastion': { 'name': 'Holy Bastion', 'desc': 'Invulnerable for {dur}s. Attackers take {reflect}% of their damage back.' },

    // Shadowblade
    'shadowstep': { 'name': 'Shadowstep', 'desc': 'Appear behind the target and backstab for {dmg}% Dexterity damage.' },
    'lethality': { 'name': 'Lethality', 'desc': '+{crit}% Critical Chance and +{critDmg}% Critical Damage.' },
    'venomousBlade': { 'name': 'Venomous Blade', 'desc': 'For {dur}s your attacks poison for {poison}% Dexterity over {over}s, stacking {stacks} times.' },
    'evasion': { 'name': 'Evasion', 'desc': '+{dodge}% Dodge. A dodge grants {haste}% Haste for {dur}s.' },
    'smokeBomb': { 'name': 'Smoke Bomb', 'desc': 'Vanish for {dur}s. Your next attack from hiding deals +{bonus}% damage.' },
    'danceOfBlades': { 'name': 'Dance of Blades', 'desc': 'Dash between enemies within {radius} m, striking {hits} times for {dmg}% Dexterity damage in total. You cannot be hit while dancing.' },

    // Pyromancer
    'fireball': { 'name': 'Fireball', 'desc': 'A ball of fire that bursts for {dmg}% Intelligence damage and burns for {burn}% more over {burnDur}s.' },
    'cauterize': { 'name': 'Cauterize', 'desc': 'Burning enemies deal {reduce}% less damage to you.' },
    'flamePillar': { 'name': 'Flame Pillar', 'desc': 'A pillar of fire erupts where you aim: {dmg}% Intelligence damage over {dur}s. Enemies caught in it are thrown into the air.' },
    'pyromaniac': { 'name': 'Pyromaniac', 'desc': 'A critical spell hit takes {cut}s off your fire cooldowns.' },
    'combustion': { 'name': 'Combustion', 'desc': 'Detonate every burn within {radius} m: each deals {pct}% of its remaining damage at once, as a blast.' },
    'cataclysm': { 'name': 'Cataclysm', 'desc': 'Call {meteors} meteors over {dur}s. Each lands for {dmg}% Intelligence damage.' },

    // Grand Sovereign
    'royalGuard': { 'name': 'Royal Guard', 'desc': 'Summon a guard who fights beside you, striking for {dmg}% Charisma damage. Up to {max} at a time.' },
    'inspiringPresence': { 'name': 'Inspiring Presence', 'desc': 'Your minions attack {speed}% faster and have {hp}% more health.' },
    'commandFocus': { 'name': 'Command Focus', 'desc': 'All minions charge the target: +{move}% move speed and +{atk}% attack speed for {dur}s.' },
    'sovereignsTribute': { 'name': 'Sovereign\'s Tribute', 'desc': '{share}% of the damage you take is passed on to your minions.' },
    'bannerOfVictory': { 'name': 'Banner of Victory', 'desc': 'Plant a banner for {dur}s. Allies near it deal +{dmg}% damage and regenerate {regen}% health per second.' },
    'armyOfTheRealm': { 'name': 'Army of the Realm', 'desc': 'Summon {archers} archers, {guards} guards and a battle mage for {dur}s.' },

    // Chrono-Weaver
    'temporalStasis': { 'name': 'Temporal Stasis', 'desc': 'Freeze the target in time for {dur}s. It cannot act and cannot be harmed.' },
    'hasteField': { 'name': 'Haste Field', 'desc': 'For {dur}s, you and allies nearby move {move}% faster and attack {speed}% faster.' },
    'timeDistort': { 'name': 'Time Distort', 'desc': '{share}% of the damage you take is delayed and dealt over {over}s instead.' },
    'paradoxShift': { 'name': 'Paradox Shift', 'desc': 'Swap places with the target. It takes {dmg}% Intelligence damage and enemies around it are confused for {confuse}s.' },
    'entropy': { 'name': 'Entropy', 'desc': 'Each cast makes your cooldowns {cdr}% shorter, stacking {stacks} times.' },
    'chronoRewind': { 'name': 'Chrono Rewind', 'desc': 'Return to where you stood {back}s ago, with the health and mana you had then.' },

    // Blood Alchemist
    'sanguineFlask': { 'name': 'Sanguine Flask', 'desc': 'Throw a flask of your own blood: {dmg}% Endurance damage in an area, and armor broken by {shred}% for {shredDur}s.' },
    'bloodTransmutation': { 'name': 'Blood Transmutation', 'desc': '{share}% of the physical damage you take returns as mana.' },
    'essenceHarvest': { 'name': 'Essence Harvest', 'desc': 'Drain every enemy within {radius} m for {dmg}% Intelligence damage. You are healed for {heal}% of it.' },
    'hemophilia': { 'name': 'Hemophilia', 'desc': 'Life drain is {drain}% stronger. Hitting a bleeding enemy heals {heal}% of your health.' },
    'mutagenicRage': { 'name': 'Mutagenic Rage', 'desc': 'For {dur}s: +{speed}% attack speed, +{steal}% life steal and +{move}% move speed.' },
    'philosophersCrucible': { 'name': 'Philosopher\'s Crucible', 'desc': 'A pool of boiling blood for {dur}s: {dmg}% Intelligence damage to enemies in it, and it heals you while you stand in it.' },

    // Aether-Tech
    'aetherPistol': { 'name': 'Aether Pistol', 'desc': 'A quick shot for {dmg}% Skill damage. Builds {heat} heat.' },
    'deployTurret': { 'name': 'Deploy Turret', 'desc': 'Place a turret that fires for {dmg}% Skill damage for {dur}s. Up to {max} at a time.' },
    'ventHeat': { 'name': 'Vent Heat', 'desc': 'Dump all heat in a cone: up to {dmg}% Skill damage, the more heat the more damage.' },
    'thermalOverload': { 'name': 'Thermal Overload', 'desc': 'While overheated your shots deal +{crit}% Critical Damage. Overheating still locks your skills for {lock}s.' },
    'orbitalBeam': { 'name': 'Orbital Beam', 'desc': 'A beam from the sky burns where you aim: {dmg}% Skill damage over {dur}s.' },
    'exoSuit': { 'name': 'Exo-Suit', 'desc': 'For {dur}s: +{armor}% Armor, and your attacks become rockets that deal {rocket}% Skill damage in an area.' },

    // Geomancer
    'stoneSpike': { 'name': 'Stone Spike', 'desc': 'A spike bursts under the target: {dmg}% Strength damage and {slow}% slow for {dur}s.' },
    'earthBarrier': { 'name': 'Earth Barrier', 'desc': 'Raise a wall of rock for {dur}s. Nothing walks or shoots through it.' },
    'seismicShock': { 'name': 'Seismic Shock', 'desc': 'Slam the ground: {dmg}% Strength damage within {radius} m, knocking enemies down for {down}s.' },
    'earthenSkin': { 'name': 'Earthen Skin', 'desc': 'Gain Armor equal to {armor}% of your Strength. Stuns on you are {cut}% shorter.' },
    'petrify': { 'name': 'Petrify', 'desc': 'Turn the target to stone for {dur}s. It takes {vuln}% more damage when it shatters free.' },
    'tectonicRupture': { 'name': 'Tectonic Rupture', 'desc': 'Tear the field open: {dmg}% Strength damage to everything near, and rubble that slows for {dur}s.' }
  },

  // ─── Items ────────────────────────────────────────────────────────────────
  'slot': {
    'main': 'Main hand',
    'off': 'Off hand',
    'body': 'Armor',
    'trinket': 'Trinket'
  },
  'tier': {
    '1': 'Tier 1',
    '2': 'Tier 2',
    '3': 'Tier 3',
    '4': 'Tier 4',
    '5': 'Tier 5',
    '6': 'Legendary'
  },
  'weapon': {
    'melee': 'Melee · scales with {attr}',
    'ranged': 'Ranged · scales with {attr}',
    'magic': 'Magic · scales with {attr}'
  },
  'source': {
    'mob': 'Dropped by the monsters of {zone}.',
    'chest': 'Found in the chests of {zone}.',
    'boss': 'Dropped by the boss of {zone}.',
    'secret': 'Hidden in a secret chest in {zone}.'
  },
  'mod': {
    'str': '+{n} Strength',
    'dex': '+{n} Dexterity',
    'int': '+{n} Intelligence',
    'end': '+{n} Endurance',
    'skl': '+{n} Skill',
    'cha': '+{n} Charisma',
    'allAttrs': '+{n} to every attribute',
    'strOrDex': '+{n} Strength or Dexterity, whichever is higher',
    'armor': '{n} Armor',
    'armorPct': '+{n}% Armor',
    'armorFromStr': 'Armor from Strength: +{n}%',
    'block': '+{n}% Block Chance',
    'dodge': '+{n}% Dodge',
    'damageReduction': '+{n}% Damage Reduction',
    'physReduction': '{n}% less physical damage taken',
    'maxHp': '+{n} Max Health',
    'maxHpPct': '+{n}% Max Health',
    'maxMana': '+{n} Max Mana',
    'hpRegen': '+{n} Health per second',
    'stunDurationCut': 'Stuns on you are {n}% shorter',
    'damagePct': '+{n}% Damage Dealt',
    'critChance': '+{n}% Critical Chance',
    'critDamage': '+{n}% Critical Damage',
    'spellCrit': '+{n}% Spell Critical Chance',
    'attackSpeed': '+{n}% Attack Speed',
    'moveSpeed': '+{n}% Move Speed',
    'cdr': 'Cooldowns are {n}% shorter',
    'manaDiscount': 'Spells cost {n}% less mana',
    'lifesteal': '+{n}% Life Steal on all damage',
    'physLifesteal': '+{n}% Life Steal on physical hits',
    'lifeDrainPct': 'Life drain is {n}% stronger',
    'bossDamage': '+{n}% damage against bosses',
    'backstab': '+{n}% Backstab Damage',
    'minionDamage': 'Minions deal +{n}% damage',
    'minionAttackSpeed': 'Minions attack {n}% faster',
    'minionHp': 'Minions have +{n}% health',
    'burnOnHit': 'Attacks apply a {n} damage Burn',
    'freezeOnHit': 'Attacks have a {n}% chance to freeze',
    'pierce': 'Shots pierce through {n} more enemies',
    'critCooldown': 'Critical hits cut all cooldowns by {n}s',
    'extraBlastEvery': 'An extra energy blast every {n} shots',
    'reflectOnBlock': 'A block reflects {n} damage',
    'fatalSave': 'Fatal damage instead makes you invulnerable for {n}s (once every 120s)',
    'knockbackImmune': 'Immune to knockback',
    'heatBuildCut': 'Heat builds {n}% slower',
    'heatDissipation': 'Heat drains {n}% faster',
    'flaskDamage': 'Sanguine Flask deals +{n}% damage',
    'igniteBonus': 'Fire spells burn {n}% harder',
    'stealthy': 'Moves silently: enemies notice you from {n}% less far',
    'fortitude': 'Big hits grant a shield of {n}% health',
    'evasionHaste': 'A dodge grants {n}% Haste',
    'cauterize': 'Burning enemies deal {n}% less damage to you',
    'pyromaniac': 'Critical spells cut fire cooldowns by {n}s',
    'tribute': 'Minions take {n}% of your damage',
    'timeDistort': '{n}% of damage taken is delayed',
    'entropy': 'Casts shorten cooldowns by {n}%',
    'bloodToMana': '{n}% of physical damage taken returns as mana',
    'bleedHeal': 'Hitting a bleeding enemy heals {n}% health',
    'overheatCrit': '+{n}% Critical Damage while overheated'
  },
  'item': {
    'rustedShortsword': { 'name': 'Rusted Shortsword' },
    'apprenticeStaff': { 'name': 'Apprentice Staff' },
    'scoutsHandgun': { 'name': 'Scout\'s Handgun' },
    'ironBroadsword': { 'name': 'Iron Broadsword' },
    'vipinsStiletto': { 'name': 'Vipin\'s Stiletto' },
    'aetherCarbine': { 'name': 'Aether Carbine' },
    'ashenGreatsword': { 'name': 'Ashen Greatsword' },
    'archmageWand': { 'name': 'Archmage Wand' },
    'chronoBlade': { 'name': 'Chrono Blade' },
    'bloodForgedAxe': { 'name': 'Blood Forged Axe' },
    'voidCannon': { 'name': 'Void Cannon' },
    'dragonSmasher': { 'name': 'Dragon Smasher' },
    'bladeOfTheUnbound': { 'name': 'Blade of the Unbound' },
    'aetheriumDestroyer': { 'name': 'Aetherium Destroyer' },
    'woodenBuckler': { 'name': 'Wooden Buckler' },
    'tomeOfNovices': { 'name': 'Tome of Novices' },
    'ironShield': { 'name': 'Iron Shield' },
    'syringeOfTheAdept': { 'name': 'Syringe of the Adept' },
    'aethericBattery': { 'name': 'Aetheric Battery' },
    'aegisTowerShield': { 'name': 'Aegis Tower Shield' },
    'orbOfEternalFlame': { 'name': 'Orb of Eternal Flame' },
    'shieldOfTheFallen': { 'name': 'Shield of the Fallen' },
    'paddedTunic': { 'name': 'Padded Tunic' },
    'leatherDoublet': { 'name': 'Leather Doublet' },
    'chainmailVest': { 'name': 'Chainmail Vest' },
    'scholarsRobe': { 'name': 'Scholar\'s Robe' },
    'reinforcedPlate': { 'name': 'Reinforced Plate' },
    'assassinsGarb': { 'name': 'Assassin\'s Garb' },
    'chronoWeaverCloak': { 'name': 'Chrono-Weaver Cloak' },
    'bloodSoakedPlate': { 'name': 'Blood-Soaked Plate' },
    'exoArmorChassis': { 'name': 'Exo-Armor Chassis' },
    'dragonscaleHauberk': { 'name': 'Dragonscale Hauberk' },
    'vestmentsOfSovereign': { 'name': 'Vestments of the Sovereign' },
    'armorOfTheTitan': { 'name': 'Armor of the Titan' },
    'copperBand': { 'name': 'Copper Band' },
    'ringOfMending': { 'name': 'Ring of Mending' },
    'bandOfSwiftness': { 'name': 'Band of Swiftness' },
    'castersEmblem': { 'name': 'Caster\'s Emblem' },
    'infiltratorsCharm': { 'name': 'Infiltrator\'s Charm' },
    'timekeepersHourglass': { 'name': 'Timekeeper\'s Hourglass' },
    'ringOfTheVampyre': { 'name': 'Ring of the Vampyre' },
    'sovereignsSignet': { 'name': 'Sovereign\'s Signet' },
    'heartOfTheMountain': { 'name': 'Heart of the Mountain' },
    'ringOfAbsolutePower': { 'name': 'Ring of Absolute Power' }
  },
  'bag': {
    'equip': 'Equip',
    'unequip': 'Take off',
    'tooLow': 'Needs level {n}.'
  },
  'shop': {
    'buy': 'Buy',
    'sell': 'Sell',
    'owned': 'Owned',
    'empty': 'Nothing on the shelves today.'
  },
  'trainer': {
    'learn': 'Learn',
    'known': 'Learned',
    'friend': '{faction} honours its friends: 20% off.',
    'block': {
      'level': 'Your level is too low.',
      'attrs': 'Your attributes are too low.',
      'gold': 'Not enough gold.'
    }
  },
  'healer': {
    'talk': 'Sit. Rest. You leave here whole, with every flask filled. If you want to carry more of them, that I can sell you.',
    'note': 'You carry {n} potions into every zone.',
    'buy': 'One more flask · {n}',
    'full': 'Your belt holds all it can.'
  },
  'talk': {
    'goal': 'It will be decided in {zone}.'
  },
  'faction': {
    'order': 'The Iron Order',
    'syndicate': 'The Ashen Syndicate',
    'circle': 'The Circle of Aether'
  },

  // ─── Townsfolk ────────────────────────────────────────────────────────────
  'npc': {
    'sunfordSmith': { 'name': 'Bram the Smith', 'talk': 'Plain steel, honest prices. It will keep a goblin off you.' },
    'sunfordPeddler': { 'name': 'Tilly the Peddler', 'talk': 'Rings! Charms! Things I found and definitely did not steal.' },
    'trainerAegis': { 'name': 'Ser Aldric' },
    'trainerPyro': { 'name': 'Ember Wren' },
    'elderMara': { 'name': 'Elder Mara', 'talk': 'You held the road today. The plains have not been this quiet in a year.' },
    'sunfordHealer': { 'name': 'Sister Lune' },
    'goblinTrader': { 'name': 'Grik the Trader', 'talk': 'King say trade, so Grik trade. Shiny for shiny. Good shiny.' },
    'captainHale': { 'name': 'Captain Hale', 'talk': 'Oakhaven has stood for three hundred years. I do not mean to be the captain who lost it.' },
    'oakArmorer': { 'name': 'Odo the Armorer', 'talk': 'Half my stock went up on the walls. Take what is left.' },
    'oakMasterArmorer': { 'name': 'Master Odo', 'talk': 'You saved this town. The good plate comes out of the back room for you.' },
    'oakWeapons': { 'name': 'Senna Blades', 'talk': 'Sharp, balanced, and sold to whoever pays. Today that is you.' },
    'trainerShadow': { 'name': 'The Whisper' },
    'trainerSovereign': { 'name': 'Lord Castellan' },
    'oakHealer': { 'name': 'Brother Fenn' },
    'blackMarket': { 'name': 'The Fence', 'talk': 'No names, no questions. The Syndicate takes its cut, you take the goods.' },
    'trainerBlood': { 'name': 'Doctor Sangrel' },
    'syndicateBoss': { 'name': 'Madam Ash', 'talk': 'Oakhaven is ours because of you. The Syndicate does not forget a friend. Or a debt.' },
    'forgemaster': { 'name': 'Forgemaster Dorn', 'talk': 'We dug for iron and struck a heart. It beats, down there in the dark, and the golems walk to its rhythm.' },
    'ironWeapons': { 'name': 'Hilda Hammerhand', 'talk': 'Dwarf-forged. If it breaks, it was you.' },
    'ironAetherWorks': { 'name': 'Tinker Voss', 'talk': 'The Circle\'s study of the core changed everything. Hold this. Do not point it at me.' },
    'ironArmor': { 'name': 'Garrun Ironside', 'talk': 'Plate that turns a giant\'s club. Rings for the rest of you.' },
    'ironOrderArmor': { 'name': 'Order Quartermaster', 'talk': 'The Order remembers who destroyed the core. Its armories are open to you.' },
    'trainerGeo': { 'name': 'Old Stonefoot' },
    'trainerAether': { 'name': 'Gearwright Pim' },
    'ironHealer': { 'name': 'Mother Brynja' },
    'exiledSovereign': { 'name': 'Lord Castellan, in exile' },
    'trainerChrono': { 'name': 'The Keeper of Hours' }
  },

  // ─── The six decisions ────────────────────────────────────────────────────
  // Each is made once and is permanent. `ask` is what the speaker says when
  // the fight is over; `result` what follows the choice (and what the quest
  // giver says about it afterwards).
  'quest': {
    'final': 'This choice is permanent.',
    'needsRep': '{faction} standing {n}',
    'gold': '+{n} gold',
    'goblinKing': {
      'title': 'The Goblin King',
      'intro': 'The raids come from the Hollows, where the goblins have crowned a king. End it, however you see fit.',
      'ask': 'Wait! Wait. King yields! Goblins only raid because goblins are hungry. Maybe tall one and King make a deal?',
      'slay': { 'label': 'End his reign.', 'result': 'The King falls, and the Hollows scatter. Sunford sleeps easier, and the Iron Order takes note of you.' },
      'pact': { 'label': 'Offer a trade pact with Sunford.', 'result': 'A silver tongue does what a sword could not. Goblin traders set up in Sunford\'s square, with wares no smith there could make.' },
      'ransom': { 'label': 'Take his treasure and leave him his crown.', 'result': 'You walk out heavy with goblin gold. The raids will start again, but that is Sunford\'s problem. The Syndicate approves.' }
    },
    'siege': {
      'title': 'The Siege of Oakhaven',
      'intro': 'A warlord\'s army has Oakhaven surrounded. The Ashen Syndicate paid for that army. Break the siege at the outskirts.',
      'ask': 'You fight well. The Syndicate pays better than that town ever will. Open the gate for us tonight, and a third of Oakhaven is yours.',
      'defend': { 'label': 'Defend Oakhaven.', 'result': 'The gate holds. Oakhaven grows rich behind it and its master armorers remember your name. The Ashen Syndicate now hunts you on every road.' },
      'betray': { 'label': 'Open the gate for the Syndicate.', 'result': 'Oakhaven burns. In its ruins a black market opens, and an alchemist who teaches forbidden arts. The armorers are gone, and the Iron Order calls you traitor.' }
    },
    'core': {
      'title': 'The Heart of Ironhold',
      'intro': 'An aether core drives the golems in our mines. Three powers want it, and every one of them has sent me a letter. You will reach it first.',
      'ask': 'The Colossus is scrap, and the core lies open in front of you, humming. It is warm to the touch. What becomes of it?',
      'destroy': { 'label': 'Shatter the core.', 'result': 'The light goes out and the golems drop where they stand. The Iron Order sends its own armorers to Ironhold in thanks.' },
      'study': { 'label': 'Give it to the Circle to study.', 'result': 'You understand enough of it to hand it over safely. Within a season Ironhold\'s forges turn out aether-works no one has seen before.' },
      'sell': { 'label': 'Sell it to the Syndicate.', 'result': 'A fortune changes hands. The core stays lit somewhere it should not be, and the mines will never be quiet again.' }
    },
    'oracle': {
      'title': 'The Drowned Oracle',
      'ask': 'I have seen this moment ten thousand times. In half of them you free me. In half you take what I guard. Choose, and let me finally not know what comes next.',
      'free': { 'label': 'Break her chains.', 'result': 'The oracle rises through the water and is gone. The Circle of Aether will speak of you kindly, and her keeper of hours stays to teach.' },
      'slay': { 'label': 'Take the hourglass she guards.', 'result': 'She does not resist. The Timekeeper\'s Hourglass is yours. Her last pupil flees the temple, and the Circle does not forgive.' }
    },
    'dragon': {
      'title': 'The Void Dragon',
      'ask': 'Enough. You have teeth, small one. The demon in the fortress chained my kin. I would see him burn. Kill me, or let me help you do it.',
      'slay': { 'label': 'Slay the dragon.', 'result': 'The mountain shakes as it falls. The Iron Order sings of the dragonslayer, and its hoard is yours.' },
      'pact': { 'label': 'Strike a pact against the Arch-Demon.', 'result': 'Few could have talked a dragon round. When you march on the Dread Fortress, it will be in the sky above you.' }
    },
    'throne': {
      'title': 'The Empty Throne',
      'ask': 'The Arch-Demon is dead and his throne stands empty. Whoever holds it commands the fortress, the rift beneath it, and the armies of both. Three envoys wait at the door.',
      'order': { 'label': 'Give the throne to the Iron Order.', 'result': 'The Order garrisons the fortress and seals what it can. The realm will be safe, and it will be told what to do.' },
      'syndicate': { 'label': 'Give the throne to the Ashen Syndicate.', 'result': 'The Syndicate moves in before dawn. Everything is for sale now, including the peace.' },
      'circle': { 'label': 'Give the throne to the Circle of Aether.', 'result': 'The Circle turns the fortress into a school above a rift. They call it research. Everyone else calls it a matter of time.' },
      'shatter': { 'label': 'Shatter the throne.', 'result': 'You break it with your own hands. No one rules from here again. The envoys leave without a word.' },
      'claim': { 'label': 'Sit on it yourself.', 'result': 'It is cold, and it fits. Three factions find they have a common enemy.' }
    }
  },

  // ─── Enemies and allies ───────────────────────────────────────────────────
  'enemy': {
    'goblin': 'Goblin',
    'goblinSlinger': 'Goblin Slinger',
    'bandit': 'Bandit',
    'banditArcher': 'Bandit Archer',
    'wolf': 'Wolf',
    'banditChief': 'Bandit Chief',
    'goblinKing': 'The Goblin King',
    'treant': 'Treant',
    'spider': 'Giant Spider',
    'broodSpider': 'Broodling',
    'outlawCaptain': 'Outlaw Captain',
    'elderTreant': 'Elder Treant',
    'warlord': 'Warlord Krag',
    'fireElemental': 'Fire Elemental',
    'ironGolem': 'Iron Golem',
    'cultist': 'Cultist',
    'emberLord': 'The Ember Lord',
    'ironColossus': 'The Iron Colossus',
    'frostGiant': 'Frost Giant',
    'naga': 'Naga',
    'skeleton': 'Skeleton',
    'necromancer': 'Necromancer',
    'frostJarl': 'The Frost Jarl',
    'nagaOracle': 'The Drowned Oracle',
    'voidStalker': 'Void Stalker',
    'wyvern': 'Wyvern',
    'highDemon': 'High Demon',
    'voidWarden': 'The Void Warden',
    'voidDragon': 'The Void Dragon',
    'doomKnight': 'Doom Knight',
    'imp': 'Imp',
    'archDemon': 'The Arch-Demon',
    'voidling': 'Voidling',
    'voidLord': 'The Void Lord',
    'orderGuard': 'Order Inquisitor',
    'syndicateBlade': 'Syndicate Blade'
  },

  // ─── End of a visit ───────────────────────────────────────────────────────
  'results': {
    'victory': 'Victory!',
    'defeat': 'Defeated',
    'retreat': 'Retreated',
    'firstClear': 'First clear!',
    'waves': 'Waves survived: {n}',
    'levelUp': 'Level {n}!',
    'points': '+{n} attribute points',
    'xp': 'Experience',
    'gold': 'Gold',
    'lost': 'Dropped',
    'kills': 'Defeated',
    'time': 'Time',
    'unlocked': 'New on the map: {places}',
    'retry': 'Try again',
    'tip': 'You keep the experience and the loot. Spend your points, visit a trainer, and come back stronger.'
  },
  'pause': {
    'title': 'Paused',
    'resume': 'Resume',
    'controls': 'Controls',
    'retreat': 'Retreat to the map',
    'retreatNote': 'You keep everything earned so far, but the zone is not cleared.'
  },
  'ending': {
    'level': 'Level',
    'more': 'The Void Rift has opened beneath the fortress. The Colosseum still takes all comers.',
    'order': { 'title': 'The Iron Peace', 'text': 'Banners of the Iron Order fly over the Dread Fortress. The roads are safe, the laws are many, and your name is carved above the gate.' },
    'syndicate': { 'title': 'The Ashen Bargain', 'text': 'The Syndicate rules from the shadows of the fortress. Nothing in the realm is forbidden any more. It is only expensive.' },
    'circle': { 'title': 'The Aether Age', 'text': 'The Circle lights the fortress with captured void-fire. Wonders pour out of its gates, and no one asks what they cost.' },
    'free': { 'title': 'No Kings', 'text': 'The throne lies in pieces and the fortress stands empty. For the first time in an age, the realm belongs to the people who live in it.' },
    'unbound': { 'title': 'The Unbound', 'text': 'You took the throne. Order, Syndicate and Circle march against you together. Let them come.' },
    'note': {
      'goblinPact': 'Goblin traders still haggle in Sunford\'s square.',
      'goblinSlain': 'The Hollows stand empty, and the caravans run on time.',
      'goblinRansom': 'The Goblin King is rich again, and raiding again.',
      'oakhavenSaved': 'Oakhaven\'s walls are taller now, and its markets fuller.',
      'oakhavenFallen': 'Weeds grow through Oakhaven\'s streets. The black market thrives.',
      'coreOrder': 'The mines of Ironhold are quiet, and the dwarves dig again.',
      'coreCircle': 'Ironhold\'s forges glow blue, and its guns are the best in the realm.',
      'coreSold': 'Somewhere, the core still hums. The golems still walk.',
      'oracleFreed': 'On calm days, fishermen see the oracle far out on the water.',
      'oracleSlain': 'The Sunken Temple is silent. No one knows what comes next any more.',
      'dragonPact': 'A dragon nests on the fortress roof, and answers to one name only.',
      'dragonSlain': 'A dragon\'s skull hangs in the Order\'s great hall.'
    }
  },

  // ─── Options ──────────────────────────────────────────────────────────────
  'options': {
    'gameplay': 'Gameplay',
    'title': 'Options',
    'general': 'General',
    'audio': 'Audio',
    'language': 'Language',
    'difficulty': 'Difficulty',
    'soundEffects': 'Sound Effects',
    'music': 'Music',
    'mute': 'Mute',
    'musicTrack': 'Music',
    'musicTracks': {
      'cozy': 'Calm',
      'trance': 'Adventure'
    },
    'haptics': 'Vibration',
    'on': 'On',
    'off': 'Off',
    'close': 'Close',
    // Options → Controls (desktop): keyboard layout and key rebinding.
    'keyboard': {
      'auto': 'Detect keyboard layout',
      'layout': 'Keyboard layout',
      'detected': 'Detected: {layout}',
      'bindings': 'Key bindings',
      'press': 'Press a key… (Esc to cancel)',
      'reset': 'Reset keys'
    },
    'actions': {
      'up': 'Move up',
      'down': 'Move down',
      'left': 'Move left',
      'right': 'Move right',
      'skill1': 'Skill 1',
      'skill2': 'Skill 2',
      'skill3': 'Skill 3',
      'skill4': 'Skill 4',
      'skill5': 'Skill 5',
      'skill6': 'Skill 6',
      'potion': 'Drink potion',
      'interact': 'Talk',
      'target': 'Next target',
      'map': 'World map',
      'character': 'Hero',
      'inventory': 'Bag',
      'skills': 'Skills'
    },
    'difficulties': {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    },
    'difficultyHints': {
      'easy': 'Enemies hit softer and go down faster.',
      'medium': 'The intended challenge.',
      'hard': 'Tougher enemies that hit harder.'
    }
  },
  'adsBlocked': {
    'title': 'Couldn\'t show ad',
    'body': 'We tried to show you a video, but something on your browser is blocking ads.',
    'allowPrefix': 'Please allow ads on',
    'allowSuffix': '(or pause your ad-blocker for this game) and try again.',
    'gotIt': 'Got it'
  },
  'saveStatus': {
    'restoredTitle': 'Cloud save restored',
    'restoredBody': '+{n} bonus gold for the recovery',
    'tap': 'tap',
    'pausedTitle': 'Cloud sync paused',
    'pausedBody': 'Playing offline. Your progress is saved here.',
    'retry': 'Retry',
    'dismiss': 'dismiss'
  },
  'loading': {
    'tooLong': 'Loading taking too long? Try disabling your ad blocker and refresh.'
  },
  'license': {
    'denied': 'Access Denied: Please purchase a license.'
  },
  // ─── Leaderboard ──────────────────────────────────────────────────────────
  // `score` is LIFETIME XP, `flair` the hero level. `{n}` and `{total}` arrive
  // PRE-FORMATTED (grouped for the locale): plain named interpolation, never
  // plural forms. `yourRank` keeps both numbers in one sentence so a locale
  // can order them; `of` is only the rank badge's tail after "#1,130".
  'leaderboard': {
    'title': 'Leaderboard',
    'rank': '#',
    'player': 'Player',
    'score': 'Experience',
    'flair': 'Level',
    'empty': 'No one is on the board yet. Be the first!',
    'failed': 'Couldn\'t reach the leaderboard.',
    'loading': 'Loading…',
    'you': 'You',
    'yourRank': 'You are #{n} of {total}',
    'of': 'of {n} players',
    'tabGlobal': 'Global'
  }
}
