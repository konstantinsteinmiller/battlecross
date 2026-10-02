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
    'manaPotion': 'Mana potion ({n} left)',
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
  // ─── Chests and what a zone holds beside its fights ───────────────────────
  // `open` is the prompt over a chest; the rest are words that pop over the
  // chest or the hero for under a second.
  'level': {
    'open': 'Open',
    'guarded': 'Guarded',
    'locked': 'Locked',
    'potion': '+1 potion',
    'manaPotion': '+1 mana potion'
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
    'trainer': 'Hidden trainer: {cls}',
    'new': 'New',
    'skip': 'Tap to skip',
    'compass': { 'n': 'N', 'e': 'E', 's': 'S', 'w': 'W' },
    'region': {
      'vale': 'Sunmeadow Vale',
      'hills': 'The Goblin Hills',
      'peaks': 'The Ironpeaks',
      'ash': 'The Ashlands',
      'frost': 'The Frostmarch',
      'fields': 'The Golden Fields',
      'mere': 'The Naga Mere',
      'reach': 'The Voidreach',
      'dread': 'The Dreadlands',
      'sea': 'The Sapphire Sea',
      'bay': 'Merchant\'s Bay'
    }
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
    'elderMara': { 'name': 'Elder Mara' },
    'sunfordHealer': { 'name': 'Sister Lune' },
    'goblinTrader': { 'name': 'Grik the Trader', 'talk': 'King say trade, so Grik trade. Shiny for shiny. Good shiny.' },
    'captainHale': { 'name': 'Captain Hale' },
    'oakArmorer': { 'name': 'Odo the Armorer', 'talk': 'Half my stock went up on the walls. Take what is left.' },
    'oakMasterArmorer': { 'name': 'Master Odo', 'talk': 'You saved this town. The good plate comes out of the back room for you.' },
    'oakWeapons': { 'name': 'Senna Blades', 'talk': 'Sharp, balanced, and sold to whoever pays. Today that is you.' },
    'trainerShadow': { 'name': 'The Whisper' },
    'trainerSovereign': { 'name': 'Lord Castellan' },
    'oakHealer': { 'name': 'Brother Fenn' },
    'blackMarket': { 'name': 'The Fence', 'talk': 'No names, no questions. The Syndicate takes its cut, you take the goods.' },
    'trainerBlood': { 'name': 'Doctor Sangrel' },
    'syndicateBoss': { 'name': 'Madam Ash' },
    'forgemaster': { 'name': 'Forgemaster Dorn' },
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
  // Each is made once and is permanent. `title` and the choices' `label`s are
  // what the map shows; the conversation itself is `dlg.quest.<id>`.
  'quest': {
    'final': 'This choice is permanent.',
    'needsRep': '{faction} standing {n}',
    'gold': '+{n} gold',
    'goblinKing': {
      'title': 'The Goblin King',
      'slay': { 'label': 'End his reign.' },
      'pact': { 'label': 'Offer a trade pact with Sunford.' },
      'ransom': { 'label': 'Take his treasure and leave him his crown.' }
    },
    'siege': {
      'title': 'The Siege of Oakhaven',
      'defend': { 'label': 'Defend Oakhaven.' },
      'betray': { 'label': 'Open the gate for the Syndicate.' }
    },
    'core': {
      'title': 'The Heart of Ironhold',
      'destroy': { 'label': 'Shatter the core.' },
      'study': { 'label': 'Give it to the Circle to study.' },
      'sell': { 'label': 'Sell it to the Syndicate.' }
    },
    'oracle': {
      'title': 'The Drowned Oracle',
      'free': { 'label': 'Break her chains.' },
      'slay': { 'label': 'Take the hourglass she guards.' }
    },
    'dragon': {
      'title': 'The Void Dragon',
      'slay': { 'label': 'Slay the dragon.' },
      'pact': { 'label': 'Strike a pact against the Arch-Demon.' }
    },
    'throne': {
      'title': 'The Empty Throne',
      'order': { 'label': 'Give the throne to the Iron Order.' },
      'syndicate': { 'label': 'Give the throne to the Ashen Syndicate.' },
      'circle': { 'label': 'Give the throne to the Circle of Aether.' },
      'shatter': { 'label': 'Shatter the throne.' },
      'claim': { 'label': 'Sit on it yourself.' }
    }
  },

  // ─── Conversations (D37) ──────────────────────────────────────────────────
  // Every spoken line. A line's key is its id: the dialogue data names it
  // (`src/game/data/dialogs/`), the voice manifest lists it, and its recording
  // is `public/audio/voice/<lang>/<key>.ogg`. So each line is ONE whole
  // sentence or two, said by one person: never glue lines together, and never
  // reuse a key for another text. `say` is what the hero says (it is also the
  // label of the choice); numbered lines are the exchange that follows.
  // Keep each speaker's voice: Bram is gruff, Tilly chatters, Grik is a goblin
  // ("tall one"), the Keeper of Hours muddles his tenses on purpose.
  'dlg': {
    'ui': {
      'hero': 'You',
      'leave': 'End the conversation',
      'topics': 'What to say',
      'gotGold': 'Received {n} gold',
      'gotItem': 'Received: {item}',
      'hint': 'Marked on your map: {zone}',
      'needs': {
        'attr': 'Needs {n} {attr}',
        'level': 'Needs level {n}',
        'rep': 'Needs {faction} standing {n}',
        'gold': 'Needs {n} gold',
        'full': 'You carry all you can',
        'other': 'Not yet'
      }
    },

    // The hero's stock lines, shared by every conversation.
    'hero': {
      'bye': 'That is all for now.',
      'trade': 'Show me your goods.',
      'train': 'Teach me.',
      'heal': 'Patch me up.',
      'mana': 'I need something for my mana.',
      'who': 'Who are you?',
      'rumor': 'Heard anything lately?',
      'ready': 'Am I ready for more?'
    },

    // ── Sunford ──
    'sunfordSmith': {
      'hello': { '1': 'Hm. New face. You are the one who held the plains road.', '2': 'I am Bram. I make steel. You look like you need some.' },
      'kingDead': { '1': 'Heard the Goblin King is dead. Good. Fewer dents to hammer out of caravan wheels.' },
      'kingPact': { '1': 'Goblins trading in the square. Never thought I would see it. Their iron is rubbish, mind.' },
      'kingRansom': { '1': 'They say you took the King\'s gold and left him his crown. The raids will be back.' },
      'ending': { '1': 'The whole realm talks about that throne. And you still buy from me. Hm.' },
      'again': { '1': 'Back again. Good. Steel does not sell itself.' },
      'trade': { '1': 'Plain steel, honest prices. Look all you like.' },
      'who': { '1': 'Bram. Thirty years at this anvil.', '2': 'I shoe horses, mend ploughs, and arm fools like you. In that order.' },
      'gear': {
        'say': 'What should I carry out there?',
        '1': 'A shield, if you mean to be hit. A bigger sword, if you do not.',
        '2': 'Strength swings my steel. Put your points there before you buy heavy.'
      },
      'rumor': {
        'plains': { '1': 'Goblins on the plains road. Clear them out before you shop for anything fancy.' },
        'hollows': { '1': 'The raiders crawl out of the Goblin Hollows, past the plains. Their king sits at the bottom.' },
        'woods': { '1': 'East of the plains the Whispering Woods begin. The trees walk there. Bring an axe.' },
        'siege': { '1': 'Smoke over Oakhaven way. A warlord has his camp on the outskirts, they say.' },
        'north': { '1': 'Ironhold steel is on the road again. Go north if you want better than mine.' }
      },
      'shopBack': { '1': 'Wear it in good health. Or at all.' },
      'bye': { '1': 'Mind the road.' }
    },
    'sunfordPeddler': {
      'hello': { '1': 'Ooh, a customer! Or a guard. You are not a guard, are you?', '2': 'I am Tilly. Rings, charms, lucky things. All found, never stolen.' },
      'rival': { '1': 'Have you seen Grik\'s stall? Goblin trinkets! I am ruined. Buy something. Pity me.' },
      'again': { '1': 'My favourite customer! I say that to everyone, but with you I mean it.' },
      'trade': { '1': 'Rings! Charms! Things I found and definitely did not steal.' },
      'who': { '1': 'I walk the roads and pick up what the roads leave behind.', '2': 'Bandits drop the nicest things when they run.' },
      'trinkets': { 'say': 'What are trinkets good for?', '1': 'You wear two at a time, one on each hand. A small edge is still an edge.' },
      'stolen': {
        'say': 'You stole all of this, didn\'t you?',
        '1': 'Shh! Not so loud. Fine. FINE.',
        '2': 'Take this ring and we never spoke. It is a nice ring. Mostly copper.'
      },
      'rumor': {
        'arenaShut': { '1': 'There is a colosseum south of here with its gates rusted shut. They would open if the goblin trouble ended.' },
        'arenaOpen': { '1': 'The Colosseum is open! Eight waves, they say. I sell luck. You will want luck.' },
        'east': { '1': 'Oakhaven\'s markets pay double for anything shiny. Go east, past the woods.' }
      },
      'shopBack': { '1': 'Come back when you are richer!' },
      'bye': { '1': 'Mind your pockets out there! Not near me, I mean. Elsewhere.' }
    },
    'trainerAegis': {
      'hello': { '1': 'Stand straight. You face a knight of the Iron Order.', '2': 'Ser Aldric. I teach the shield to those who would stand in front of others.' },
      'saved': { '1': 'Oakhaven stands because you stood. That is the whole of what I teach.' },
      'fallen': { '1': 'You opened Oakhaven\'s gate. I have buried men for less. State your business.' },
      'dragon': { '1': 'A dragonslayer in my yard. They will sing of it in the great hall.' },
      'friend': { '1': 'The Order speaks well of you. For its friends, my lessons cost less.' },
      'foe': { '1': 'The Order names you an enemy. I will teach you still. Honour is not theirs to revoke.' },
      'again': { '1': 'Shield up. What do you need?' },
      'train': { '1': 'Then pay attention. I show a thing once.' },
      'class': {
        'say': 'What is an Aegis Knight?',
        '1': 'A wall that walks. We take the blow so that nothing else must.',
        '2': 'Strength for the arm, Endurance for the rest. The light does what it can.'
      },
      'ready': {
        'strong': { '1': 'You have the arm for most of what I know. Mind your Endurance and take the rest.' },
        'able': { '1': 'You are ready for the next lesson. Do not let it go to your head.' },
        'weak': { '1': 'Not yet. Your arm is weak and you tire fast. More Strength, more Endurance.' }
      },
      'order': {
        'say': 'Tell me about the Iron Order.',
        '1': 'We keep the roads and the law. Some say too much of both.',
        '2': 'Stand with the Order, and its armourers and its teachers remember you.'
      },
      'trainBack': { '1': 'Practise it until it bores you. Then practise more.' },
      'bye': { '1': 'Go with the light.' }
    },
    'trainerPyro': {
      'hello': { '1': 'Oh! A student? Stand back a little. A little more.', '2': 'Ember Wren, pyromancer. The eyebrows grow back, mostly.' },
      'core': { '1': 'You gave the core to the Circle! Do you know how many things we can set on fire now?' },
      'friend': { '1': 'The Circle of Aether likes you! That means a discount. And fewer forms to sign.' },
      'foe': { '1': 'The Circle wants you turned to ash. Awkward! I will still teach you. Fire is not picky.' },
      'again': { '1': 'You are back! And nothing is burning. We can fix that.' },
      'train': { '1': 'Yes! Watch closely. Not that closely.' },
      'class': {
        'say': 'What does a Pyromancer do?',
        '1': 'Fire answers every question. Burn them first, then blow up the ones that are burning.',
        '2': 'It all runs on Intelligence. And a steady supply of robes.'
      },
      'ready': {
        'strong': { '1': 'You could melt a golem! Take everything I have. Mind your Skill for the tricky ones.' },
        'able': { '1': 'Your mind is warm enough for the next spell. Come on!' },
        'weak': { '1': 'Hmm. Not enough Intelligence yet. The fire would use you, not the other way round.' }
      },
      'circle': { 'say': 'Who are the Circle of Aether?', '1': 'Scholars. We study what the world is made of. Some of it explodes.' },
      'trainBack': { '1': 'Go and set something on fire! Something that deserves it.' },
      'bye': { '1': 'Stay warm!' }
    },
    'elderMara': {
      'hello': { '1': 'So you are the one from the road. Come closer, my eyes are not what they were.', '2': 'I am Mara. I have kept this town\'s ledger and its peace for forty years.' },
      'slain': { '1': 'The Hollows are quiet. You did a hard thing, and Sunford sleeps because of it.' },
      'pact': { '1': 'Goblins selling trinkets in my square. You have a silver tongue, child. I hope it holds.' },
      'ransom': { '1': 'You took his gold and left him his crown. I am too old to pretend I am not disappointed.' },
      'saved': { '1': 'Word came from Oakhaven. The gate held. I am glad one of ours was there.' },
      'fallen': { '1': 'Oakhaven is burned, and they say you held the torch. Do not tell me. I would rather not know.' },
      'ending': { '1': 'They say you decided who sits in the Dread Fortress. From Sunford\'s road to that. Imagine.' },
      'again': { '1': 'Sit a moment. The road will wait.' },
      'reward': {
        'say': 'You wanted to see me?',
        '1': 'You held the road when our militia could not. The town took up a collection.',
        '2': 'It is not much. It is every coin we could spare.'
      },
      'quest': {
        'say': 'What is troubling Sunford?',
        '1': 'The raids come from the Goblin Hollows. The goblins have crowned a king.',
        '2': 'And you want him dead.',
        '3': 'I want the raids to end. How is for you to decide, at the bottom of those caves.',
        '4': 'The Hollows lie just beyond the plains. Go carefully.'
      },
      'king': {
        'say': 'About the Goblin King…',
        'slay': { '1': 'A king is dead and my caravans run on time. I will not ask how it felt.' },
        'pact': { '1': 'A pact! My mother would have fainted. Still, trade is better than funerals.' },
        'ransom': { '1': 'Gold spends fast. Grudges do not. Remember that when the raids return.' }
      },
      'town': {
        'say': 'Tell me about Sunford.',
        '1': 'Farmers, mostly. A smith, a healer, and two teachers who put up with us.',
        '2': 'Rest here, spend your points, and go back out stronger. That is what a home is for.'
      },
      'next': {
        'say': 'Where should I go next?',
        'plains': { '1': 'The plains road, before anything else. We cannot eat if the caravans cannot pass.' },
        'hollows': { '1': 'The Goblin Hollows first. Nothing else is safe while the raids go on.' },
        'woods': { '1': 'East, through the Whispering Woods. The road to Oakhaven runs under those trees.' },
        'oakhaven': { '1': 'Oakhaven is under siege. If its outskirts fall, the town falls.' },
        'north': { '1': 'North, child. The Ashen Crags, and Ironhold beyond. The trouble grows the further you go.' }
      },
      'bye': { '1': 'Come back alive. That is all I ask of anyone.' }
    },
    'sunfordHealer': {
      'hello': { '1': 'Hold still. No, you are fine. Force of habit.', '2': 'Sister Lune. I mend what the road breaks.' },
      'again': { '1': 'Still in one piece? I am almost disappointed.' },
      'heal': { '1': 'Sit. Rest. You leave here whole, with every flask filled.' },
      'mana': { '1': 'Blue flask, bitter taste. Sip it when your spells run dry.' },
      'potions': {
        'say': 'How do the potions work?',
        '1': 'You carry a few flasks into every zone. Drink before you need one, not after.',
        '2': 'If you want to carry more, I can sell you a longer belt.'
      },
      'rumor': {
        'goblins': { '1': 'The goblins poison their sling stones. If you turn green, come straight back.' },
        'spiders': { '1': 'Spider bites from the Woods. Three this week. Do try not to get bitten.' },
        'burns': { '1': 'Soldiers come down from the north with burns. The Ashen Crags, they say. Fire that walks.' }
      },
      'healBack': { '1': 'Keep the belt full and your head down.' },
      'bye': { '1': 'Try not to bleed on anything important.' }
    },
    'goblinTrader': {
      'hello': { '1': 'Tall one! Tall one made the pact. King say be nice to tall one.', '2': 'Grik is nice. Grik has shinies. Tall one has gold. Is good match.' },
      'again': { '1': 'Tall one comes back! Grik knew. Shinies call to tall one.' },
      'trade': { '1': 'King say trade, so Grik trade. Shiny for shiny. Good shiny.' },
      'king': {
        'say': 'How is your king?',
        '1': 'King is fat and happy. No more raiding. Raiding is hard work.',
        '2': 'King says tall one has good tongue. Is highest goblin praise. Almost.'
      },
      'town': { 'say': 'How do you like Sunford?', '1': 'Humans wash too much. But pies! Grik did not know about pies.' },
      'rumor': {
        'crags': { '1': 'Grik\'s cousins dig north, in black rock. They say fire walks there. Grik stays here.' },
        'deep': { '1': 'Deep places are waking up, tall one. Goblins feel it in the feet.' }
      },
      'shopBack': { '1': 'Good trade! Tall one comes again, yes?' },
      'bye': { '1': 'Bye, tall one! Do not die. Dead ones buy nothing.' }
    },

    // ── Oakhaven ──
    'captainHale': {
      'hello': { '1': 'Another sword. Good. I stopped asking where they come from.', '2': 'Captain Hale. I command what is left of Oakhaven\'s watch.' },
      'saved': { '1': 'The gate held. Three hundred years, and now one more. I owe you my town.' },
      'ending': { '1': 'You settled the throne of the Dread Fortress. My walls feel smaller than they did.' },
      'again': { '1': 'The walls still stand. For today.' },
      'after': { '1': 'Oakhaven remembers, friend. So do I.' },
      'quest': {
        'say': 'What is the situation?',
        '1': 'A warlord\'s army has us surrounded. Krag. He does not fight for free.',
        '2': 'Who pays him?',
        '3': 'The Ashen Syndicate. They want a town of their own, and ours has walls.',
        '4': 'Break him at the Oakhaven Outskirts. That is where it will be decided.'
      },
      'siege': {
        'say': 'About the siege…',
        '1': 'They offered you a third of the town. I know. They offered me a quarter.',
        '2': 'The Syndicate hunts you now, on every road. Watch your back out there.'
      },
      'town': {
        'say': 'Tell me about Oakhaven.',
        '1': 'A trade town. Everything that moves between the plains and the mountains pays a toll here.',
        '2': 'That is why everyone wants it. That is why I will not give it up.'
      },
      'order': { 'say': 'Do you serve the Iron Order?', '1': 'I serve Oakhaven. The Order and I agree, most days. It is not the same thing.' },
      'rumor': {
        'crags': { '1': 'North of the woods the ground is black and burning. The Ashen Crags. Cultists feed the fires.' },
        'mines': { '1': 'Ironhold has stopped sending steel. Something is wrong in its mines.' },
        'north': { '1': 'The far north has gone quiet. In my experience, quiet is worse.' }
      },
      'bye': { '1': 'Keep your sword loose.' }
    },
    'oakArmorer': {
      'hello': { '1': 'If you want a helmet, you are late. They are all on the wall.', '2': 'Odo. Armourer. Tired.' },
      'again': { '1': 'Still here. Still short of stock.' },
      'trade': { '1': 'Half my stock went up on the walls. Take what is left.' },
      'who': { '1': 'Twenty years I have armoured this town. I never thought to see all of it worn at once.' },
      'armor': { 'say': 'What armour should I wear?', '1': 'Plate if you stand still. Leather if you do not. Robes if you enjoy dying.' },
      'rumor': { 'backRoom': { '1': 'If the siege breaks, I open the back room. The good plate. Break it for me, will you?' } },
      'shopBack': { '1': 'It will hold. Probably.' },
      'bye': { '1': 'Keep your head down.' }
    },
    'oakMasterArmorer': {
      'hello': { '1': 'You! Get in here. The back room is open, and it is open for YOU.', '2': 'Master Odo, they call me now. Business is good when a town is alive.' },
      'ending': { '1': 'From my gate to the Dread Fortress. I tell everyone I fitted your armour.' },
      'again': { '1': 'The hero of the gate. What will it be today?' },
      'trade': { '1': 'You saved this town. The good plate comes out of the back room for you.' },
      'town': {
        'say': 'How is the town?',
        '1': 'Rich. Loud. Full of merchants who complain about the toll.',
        '2': 'It is wonderful. I have not slept in a week.'
      },
      'rumor': {
        'mines': { '1': 'My steel comes from Ironhold, and Ironhold has gone silent. Someone should look at its mines.' },
        'tundra': { '1': 'The best ore I ever saw came out of the tundra. The men who brought it never went back.' }
      },
      'shopBack': { '1': 'If it does not fit, come back. I will make it fit.' },
      'bye': { '1': 'Oakhaven\'s gate is always open to you. Just to you.' }
    },
    'oakWeapons': {
      'hello': { '1': 'Buying or looking? Looking costs nothing. Touching costs a finger.', '2': 'Senna. I sell edges. I do not ask what they are for.' },
      'saved': { '1': 'The siege broke. Shame. War is good for business. Peace is good for collecting debts.' },
      'again': { '1': 'Back for something sharper?' },
      'trade': { '1': 'Sharp, balanced, and sold to whoever pays. Today that is you.' },
      'who': { '1': 'I sold swords to both sides of three wars. I am still here. They mostly are not.' },
      'rumor': {
        'krag': { '1': 'Krag\'s men carry good steel. Syndicate money. Take it off them if you can.' },
        'which': { '1': 'Fast blades want Dexterity. Guns and bows want Skill. Know which you are before you pay me.' }
      },
      'shopBack': { '1': 'Blood wipes off. Rust does not. Oil it.' },
      'bye': { '1': 'Do not die owing me money.' }
    },
    'trainerShadow': {
      'hello': { '1': 'Do not turn around. I am joking. Turn around.', '2': 'They call me the Whisper. I teach people to arrive unnoticed.' },
      'fallen': { '1': 'The town is quieter now. Fewer guards. I rather like it.' },
      'friend': { '1': 'The Syndicate counts you a friend. Friends pay less. Friends also know too much.' },
      'foe': { '1': 'The Syndicate wants you dead. I was paid to teach, not to kill. Lucky you.' },
      'again': { '1': 'You are louder than last time. We will work on it.' },
      'train': { '1': 'Quietly, then. Watch my feet, not my hands.' },
      'class': {
        'say': 'What is a Shadowblade?',
        '1': 'A knife that is already behind you. Step out of the dark, strike, and be gone.',
        '2': 'Dexterity above all. Skill, when you want the cut to count.'
      },
      'ready': {
        'strong': { '1': 'You move well. Take what I know. Bring Skill for the smoke.' },
        'able': { '1': 'Good. Your hands are quick enough for the next step.' },
        'weak': { '1': 'You walk like a cart. More Dexterity. Then we talk.' }
      },
      'syndicate': { 'say': 'Who are the Ashen Syndicate?', '1': 'People who noticed that laws are for sale. I do not judge. I invoice.' },
      'trainBack': { '1': 'Now go and do it where nobody sees.' },
      'bye': { '1': 'You never saw me.' }
    },
    'trainerSovereign': {
      'hello': { '1': 'You may approach. Not that close.', '2': 'Lord Castellan, of the old blood of Oakhaven. I teach command.' },
      'saved': { '1': 'My town stands, and my family\'s name with it. You have a lord\'s gratitude. It is worth a great deal.' },
      'friend': { '1': 'A friend of the Order. I shall reduce my fee. Do not mention it to anyone.' },
      'foe': { '1': 'The Order has posted your name. I shall teach you anyway. Coin is coin, alas.' },
      'again': { '1': 'Ah. My most promising subject.' },
      'train': { '1': 'Very well. Observe how one gives an order.' },
      'class': {
        'say': 'What is a Grand Sovereign?',
        '1': 'Why fight alone when others can do it for you? Summon guards. Command them.',
        '2': 'It takes Charisma. One cannot lead by mumbling.'
      },
      'ready': {
        'strong': { '1': 'You have presence. Take the rest of my lessons, and do stand up straight.' },
        'able': { '1': 'Your voice carries. You are ready for the next lesson.' },
        'weak': { '1': 'Nobody would follow you to a bakery. More Charisma.' }
      },
      'family': { 'say': 'Tell me about your family.', '1': 'We built the walls Captain Hale stands on. He forgets. I remind him. Often.' },
      'trainBack': { '1': 'Now go and be obeyed.' },
      'bye': { '1': 'You are dismissed.' }
    },
    'oakHealer': {
      'hello': { '1': 'Next! Oh. You can walk. That makes a nice change.', '2': 'Brother Fenn. Forty wounded on the wall, and one of me.' },
      'saved': { '1': 'No new wounded in three days! I do not know what to do with my hands.' },
      'again': { '1': 'You again, and still walking. I approve.' },
      'heal': { '1': 'Lie down. No, the clean cot. There. Every flask filled. Off you go.' },
      'mana': { '1': 'A mana draught! Tastes of pennies. Works, though.' },
      'potions': { 'say': 'Can I carry more potions?', '1': 'A longer belt holds more flasks. I sell those. The flasks I fill for free.' },
      'rumor': {
        'archers': { '1': 'Krag\'s archers aim for the legs. Keep moving out there and they miss.' },
        'north': { '1': 'Burns, frostbite, and one man who swears a statue bit him. The north is not kind.' }
      },
      'healBack': { '1': 'Go on. Next time come for a chat, not a stitch.' },
      'bye': { '1': 'Walk it off! That is medical advice.' }
    },
    'blackMarket': {
      'hello': { '1': 'No names. You are the one who opened the gate, though. That one I know.', '2': 'Call me the Fence. Everything here fell off a cart.' },
      'foe': { '1': 'The Syndicate does not like you today. Your gold, it still likes.' },
      'again': { '1': 'Ah. My best customer. Nobody followed you? Good.' },
      'trade': { '1': 'No names, no questions. The Syndicate takes its cut, you take the goods.' },
      'who': { '1': 'Before the fire I sold candles. Legally. It was dreadful.' },
      'armor': { 'say': 'Any armour for sale?', '1': 'The armourers are gone, friend. Burned out. You would know.' },
      'rumor': {
        'citadel': { '1': 'A fortress appeared in the far north last year. Nobody built it. Its walls hum.' },
        'crystals': { '1': 'Somebody is buying every void crystal on the market. Not us. That worries me.' }
      },
      'shopBack': { '1': 'You were never here.' },
      'bye': { '1': 'Mind the rubble.' }
    },
    'trainerBlood': {
      'hello': { '1': 'A visitor. Do mind the jars.', '2': 'Doctor Sangrel. Oakhaven\'s new owners do not ask what I teach. Refreshing.' },
      'found': { '1': 'You found me. Few look for a doctor in a place like this.', '2': 'Doctor Sangrel. The towns burn my kind, so I work where there are none.' },
      'friend': { '1': 'The Syndicate vouches for you. My fee is lower for its friends. My standards are not.' },
      'foe': { '1': 'The Syndicate would pay me for your blood. I prefer you spend it on my lessons.' },
      'again': { '1': 'You are pale. Good. It suits the work.' },
      'train': { '1': 'Roll up your sleeve. This will hurt. That is the point.' },
      'class': {
        'say': 'What is a Blood Alchemist?',
        '1': 'You pay for power in your own health. Then you drink it back from the enemy.',
        '2': 'Endurance is your purse. Intelligence decides how well you spend it.'
      },
      'ready': {
        'strong': { '1': 'A remarkable constitution. You may learn nearly all of it.' },
        'able': { '1': 'Your blood is strong enough for the next lesson.' },
        'weak': { '1': 'You would faint at the first cut. More Endurance, please.' }
      },
      'jars': { 'say': 'What is in the jars?', '1': 'Volunteers. Mostly.' },
      'trainBack': { '1': 'Do keep notes. For science.' },
      'bye': { '1': 'Stay healthy. You are no use to me otherwise.' }
    },
    'syndicateBoss': {
      'hello': { '1': 'So. The one who opened the gate. Sit. You have earned a chair.', '2': 'They call me Madam Ash. Oakhaven is mine now. In part, yours.' },
      'throneOurs': { '1': 'The throne of the Dread Fortress. Ours. You are the best investment I ever made.' },
      'throneLost': { '1': 'You gave the throne away. To someone else. We will speak of that. Not today.' },
      'foe': { '1': 'You have been crossing us. Sit anyway. I like to look at a problem before I solve it.' },
      'again': { '1': 'My favourite traitor. What can the Syndicate do for you?' },
      'cut': {
        'say': 'You promised me a third of Oakhaven.',
        '1': 'A third of a ruin, darling. Here is this season\'s share.',
        '2': 'It will grow. A ruin is very profitable when you own its only market.'
      },
      'syndicate': {
        'say': 'What does the Syndicate want?',
        '1': 'What everyone wants. We simply do not pretend otherwise.',
        '2': 'Stay our friend, and the Whisper and the Doctor charge you less. Loyalty has a price list.'
      },
      'order': { 'say': 'The Iron Order is hunting me.', '1': 'Of course it is. You burned one of its towns. Carry more potions.' },
      'rumor': {
        'core': { '1': 'The dwarves found something in their mines. A core. I want it. Bring it to us and name a number.' },
        'sold': { '1': 'The core arrived safely. You should see what it does to a lock.' },
        'north': { '1': 'Everything worth stealing has moved north. So have we.' }
      },
      'bye': { '1': 'Do not be a stranger. Strangers get followed.' }
    },

    // ── Ironhold ──
    'forgemaster': {
      'hello': { '1': 'You came through the mines. I can smell the dust on you.', '2': 'Dorn. Forgemaster of Ironhold. I have a problem the size of a mountain.' },
      'destroyed': { '1': 'The light is out and the golems are scrap. My miners sang last night. First time in a year.' },
      'studied': { '1': 'Blue fire in my forges and robes in my halls. The work is good. I will get used to the robes.' },
      'sold': { '1': 'You sold it. The golems still walk and my mines are still a grave. Get out of my light.' },
      'ending': { '1': 'So the throne is settled. Good. Now the realm can go back to arguing about iron.' },
      'again': { '1': 'Speak. The forge does not wait.' },
      'quest': {
        'say': 'What happened in the mines?',
        '1': 'We dug for iron and struck a heart. An aether core. It beats, down there in the dark.',
        '2': 'And the golems?',
        '3': 'They walk to its rhythm. Three powers have written to me for it. All polite. I trust none.',
        '4': 'You will reach it first, at the bottom of the Ironhold Mines. Then it is yours to settle.'
      },
      'core': {
        'say': 'About the core…',
        'destroy': { '1': 'You broke a wonder to save my people. The Order sent armourers in thanks. I sent ale.' },
        'study': { '1': 'The Circle\'s tinkers are mad, but their guns shoot straight. A fair bargain.' },
        'sell': { '1': 'Gold. You did it for gold. I hope it keeps you warm.' }
      },
      'town': {
        'say': 'Tell me about Ironhold.',
        '1': 'The best steel in the realm, when the mines run.',
        '2': 'Stonefoot teaches earth, Pim teaches machines. Both will talk your ear off.'
      },
      'rumor': {
        'tundra': { '1': 'East of the Crags the land goes white. Frostbite Tundra. Giants, and dead that do not stay down.' },
        'citadel': { '1': 'My scouts saw a fortress in the north that was not there last year. I do not like new mountains.' },
        'fortress': { '1': 'The Dread Fortress is where this ends. Every road north leads to its gate.' }
      },
      'bye': { '1': 'Strike true.' }
    },
    'ironWeapons': {
      'hello': { '1': 'Hands off the display. Those are sharp at both ends.', '2': 'Hilda Hammerhand. Dwarf-forged, every piece.' },
      'dragon': { '1': 'You killed the dragon? With one of MINE? No? Lie to me. Say it was one of mine.' },
      'again': { '1': 'Back for real steel?' },
      'trade': { '1': 'Dwarf-forged. If it breaks, it was you.' },
      'who': { '1': 'My mother forged for kings. I forge for whoever walks in. Times change.' },
      'rumor': {
        'golems': { '1': 'The golems in the mines are made of our own iron. It is embarrassing, frankly.' },
        'arm': { '1': 'A blade does half the work. Your Strength does the rest. Do not blame the blade.' }
      },
      'shopBack': { '1': 'Bring it back dull and I will know you used it.' },
      'bye': { '1': 'Hit them hard.' }
    },
    'ironAetherWorks': {
      'hello': { '1': 'Careful! That one is loaded. So is that one. Most of them, really.', '2': 'Tinker Voss. The Circle sent me to see what the core could teach us. Everything, it turns out.' },
      'again': { '1': 'Oh good, a tester. I mean, a customer.' },
      'trade': { '1': 'The Circle\'s study of the core changed everything. Hold this. Do not point it at me.' },
      'core': { 'say': 'What did the core teach you?', '1': 'That iron can think, a little. I try not to dwell on it.' },
      'rumor': { 'heat': { '1': 'Guns run on Skill, and they run hot. Ask Gearwright Pim about heat before you melt your hand.' } },
      'shopBack': { '1': 'Report any explosions! For the notes.' },
      'bye': { '1': 'Mind the recoil!' }
    },
    'ironArmor': {
      'hello': { '1': 'Garrun. Armour. Rings in the tray.' },
      'again': { '1': 'Hm.' },
      'trade': { '1': 'Plate that turns a giant\'s club. Rings for the rest of you.' },
      'quiet': { 'say': 'You do not talk much.', '1': 'No.' },
      'rumor': {
        'giants': { '1': 'Giants in the tundra. Clubs like tree trunks. Buy the heavy plate.' },
        'demons': { '1': 'Demons up north. Fire and claws. Buy the heavy plate.' }
      },
      'shopBack': { '1': 'Good.' },
      'bye': { '1': 'Aye.' }
    },
    'ironOrderArmor': {
      'hello': { '1': 'Name and business. No. I know your name. You destroyed the core.', '2': 'Quartermaster of the Iron Order. Its armouries are open to you.' },
      'throneOurs': { '1': 'The Order holds the Dread Fortress by your hand. Stand easy. That is an order.' },
      'foe': { '1': 'The Order has you on a list. My orders are to sell to you regardless. I do not like them.' },
      'again': { '1': 'Requisition?' },
      'trade': { '1': 'The Order remembers who destroyed the core. Choose what you need.' },
      'order': { 'say': 'What does the Order want from me?', '1': 'Nothing. That is rare. Enjoy it.' },
      'rumor': { 'throne': { '1': 'The Order will want the throne in the Dread Fortress. It will remember who stood with it.' } },
      'shopBack': { '1': 'Sign here. I am joking. The Order does not joke. Dismissed.' },
      'bye': { '1': 'Dismissed.' }
    },
    'trainerGeo': {
      'hello': { '1': 'Slow down. The mountain is not going anywhere.', '2': 'They call me Old Stonefoot. I listen to the ground. Sometimes it answers.' },
      'core': { '1': 'The mountain\'s heartbeat changed. That was you. It noticed.' },
      'dragon': { '1': 'A dragon flew over the peak yesterday and did not burn us. Your doing, I hear.' },
      'again': { '1': 'You again. The stones said you would come.' },
      'train': { '1': 'Plant your feet. Feel that? No? We will start there.' },
      'class': {
        'say': 'What is a Geomancer?',
        '1': 'We raise walls, call spikes, and break the ground when it is needed.',
        '2': 'Strength to move the stone, Intelligence to ask it nicely.'
      },
      'ready': {
        'strong': { '1': 'The stone knows you now. Learn the rest.' },
        'able': { '1': 'You are heavy enough for the next lesson. That is a compliment.' },
        'weak': { '1': 'The stone does not hear you yet. More Strength.' }
      },
      'factions': { 'say': 'Which faction do you serve?', '1': 'None. Orders, syndicates, circles. The mountain outlasts all of them.' },
      'trainBack': { '1': 'Go gently. Then not gently.' },
      'bye': { '1': 'Walk softly.' }
    },
    'trainerAether': {
      'hello': { '1': 'Do not touch that! Or that. Actually, stand on the rug. The rug is safe.', '2': 'Gearwright Pim! Guns, turrets, heat gauges. Mostly heat gauges.' },
      'core': { '1': 'You gave us the core! I have not slept in nine days. Look at my hands. Do not look at my hands.' },
      'oracle': { '1': 'The Circle is furious about the oracle. I just build things. Please do not tell them I taught you.' },
      'friend': { '1': 'A friend of the Circle! Cheaper lessons for you. I filled in the form myself.' },
      'foe': { '1': 'The Circle says I must not teach you. The Circle also says not to test rockets indoors.' },
      'again': { '1': 'Oh good, you still have all your fingers.' },
      'train': { '1': 'Right! Safety first. Then the loud part.' },
      'class': {
        'say': 'What is an Aether-Tech?',
        '1': 'Guns, turrets and a heat gauge. Shoot, build, and vent before it locks you out.',
        '2': 'It all runs on Skill. A bit of Intelligence for the big machines.'
      },
      'ready': {
        'strong': { '1': 'You could strip a turret blind! Take the big machines.' },
        'able': { '1': 'Steady hands! You are ready for the next gadget.' },
        'weak': { '1': 'Your hands shake. Mine too, but for other reasons. More Skill.' }
      },
      'heat': { 'say': 'What happens if I overheat?', '1': 'Everything locks for a few seconds. Vent early. Vent often. I have the scars.' },
      'trainBack': { '1': 'Remember: vent the heat! VENT. THE. HEAT.' },
      'bye': { '1': 'Do not blow up!' }
    },
    'ironHealer': {
      'hello': { '1': 'Boots off. I will not have mine dust on my floor.', '2': 'Mother Brynja. I have set every broken bone in this mountain twice.' },
      'ending': { '1': 'You went to the Dread Fortress and walked back. Sit. I want to look at you.' },
      'again': { '1': 'Still alive. I am told that is my doing.' },
      'heal': { '1': 'Sit. Drink this. Do not make that face. Your flasks are filled.' },
      'mana': { '1': 'Here. It tastes foul. Drink it when your magic runs out, not before.' },
      'potions': { 'say': 'Can I carry more potions?', '1': 'Buy a longer belt from me. Five flasks is all a body can carry and still run.' },
      'rumor': {
        'tundra': { '1': 'The tundra takes fingers. Keep moving out there, and do not sleep in the snow.' },
        'temple': { '1': 'There is a drowned temple past the tundra. The naga do not take prisoners.' },
        'rift': { '1': 'Whatever is in that Void Rift, it cannot be stitched. Finish it quickly.' }
      },
      'healBack': { '1': 'Off with you. And eat something.' },
      'bye': { '1': 'Come back in one piece.' }
    },
    'exiledSovereign': {
      'hello': { '1': 'You. You opened my gate.', '2': 'I teach from a dwarf\'s cellar now, because I must eat. Do not mistake it for forgiveness.' },
      'ending': { '1': 'A throne was decided, and Oakhaven is still ash. Tell me again how it was worth it.' },
      'again': { '1': 'The traitor returns. My fee has not gone down.' },
      'train': { '1': 'I will teach you to command. I cannot teach you to deserve it.' },
      'class': {
        'say': 'What is a Grand Sovereign?',
        '1': 'One who is followed. Guards answer the call and fight at your word.',
        '2': 'It runs on Charisma. You have some. That is the tragedy.'
      },
      'ready': {
        'strong': { '1': 'You have the presence for all of it. The realm is poorer for that.' },
        'able': { '1': 'You are ready for the next lesson. I take no pleasure in it.' },
        'weak': { '1': 'Not even a traitor\'s guard would follow that voice. More Charisma.' }
      },
      'oakhaven': {
        'say': 'About Oakhaven…',
        '1': 'Three hundred years. My family built those walls.',
        '2': 'Do not explain. There is no price that explains it.'
      },
      'trainBack': { '1': 'Go. Command someone else.' },
      'bye': { '1': 'Leave me.' }
    },
    'trainerChrono': {
      'fled': { '1': 'You killed her. I saw it a thousand times before it happened, and still it hurts.', '2': 'I am the Keeper of Hours. I will teach you. She told me I would.' },
      'hello': { '1': 'You are late. Or early. I told you this already, I think.', '2': 'I am the Keeper of Hours. I teach the weaving of time. We began a moment ago.' },
      'freed': { '1': 'She is free. For the first time, I do not know what you will say next. It is wonderful.' },
      'friend': { '1': 'The Circle will name you its friend. It already has? Then the discount is now.' },
      'foe': { '1': 'The Circle will forgive you, in a future I have seen. Until then, I teach you quietly.' },
      'again': { '1': 'Welcome back. Welcome. Back.' },
      'train': { '1': 'Watch. I will show you what I showed you.' },
      'class': {
        'say': 'What is a Chrono-Weaver?',
        '1': 'We stop a foe in time, hurry a friend along, and take back a mistake.',
        '2': 'Intelligence to see the thread, Skill to pull it.'
      },
      'ready': {
        'strong': { '1': 'You hold the thread well. The rest is yours when you want it.' },
        'able': { '1': 'You are ready. You were ready tomorrow as well.' },
        'weak': { '1': 'The thread slips through your fingers. More Intelligence. More Skill.' }
      },
      'oracle': {
        'say': 'Tell me about the oracle.',
        'freed': { '1': 'She saw every ending, and none of them was hers. Now one is.' },
        'slain': { '1': 'She did not resist. She had seen that too. Please do not ask me again.' },
        'waits': { '1': 'She sees every ending. It is a terrible gift. Be kind to her, at the end.' }
      },
      'trainBack': { '1': 'It will have been worth it.' },
      'bye': { '1': 'Until before.' }
    },

    // ── The six decisions ──
    // `ask` is put by whoever the fight left standing; `say` is the hero's
    // answer (the choice); the numbered lines after it tell what follows.
    'quest': {
      'goblinKing': {
        'ask': { '1': 'Wait! Wait. King yields!', '2': 'Goblins only raid because goblins are hungry. Is true!', '3': 'Maybe tall one and King make a deal?' },
        'slay': {
          'say': 'No deal. Your reign ends here.',
          '1': 'The King falls, and the Hollows scatter.',
          '2': 'Sunford sleeps easier, and the Iron Order takes note of you.'
        },
        'pact': {
          'say': 'Stop the raids and trade with Sunford instead. Swear it.',
          '1': 'Trade? King swears! King LIKES trade!',
          '2': 'Goblin traders set up in Sunford\'s square, with wares no smith there could make.'
        },
        'ransom': {
          'say': 'Hand over your treasure, and you keep your crown.',
          '1': 'All of it? King hates tall one. Take it. Take it and go.',
          '2': 'You walk out heavy with goblin gold. The raids will start again. The Syndicate approves.'
        }
      },
      'siege': {
        'ask': { '1': 'Enough. You fight well.', '2': 'The Syndicate pays better than that town ever will.', '3': 'Open the gate for us tonight, and a third of Oakhaven is yours.' },
        'defend': {
          'say': 'The gate stays shut. Take your army and go.',
          '1': 'Then the Syndicate will hunt you on every road. Remember that I offered.',
          '2': 'The gate holds. Oakhaven grows rich behind it, and its master armourers remember your name.'
        },
        'betray': {
          'say': 'A third of the town. Tonight, the gate opens.',
          '1': 'Wise. I will tell Madam Ash to set a chair for you.',
          '2': 'Oakhaven burns. In its ruins a black market opens, and an alchemist teaches forbidden arts.',
          '3': 'The armourers are gone, and the Iron Order calls you traitor.'
        }
      },
      'core': {
        'ask': { '1': 'The Colossus is scrap. I never thought I would see it.', '2': 'And there it lies. The core. Still humming. Warm to the touch.', '3': 'You reached it first. What becomes of it?' },
        'destroy': {
          'say': 'Stand back. I am breaking it.',
          '1': 'The light goes out, and the golems drop where they stand.',
          '2': 'The Iron Order sends its own armourers to Ironhold in thanks.'
        },
        'study': {
          'say': 'The Circle should study it. I can carry it out safely.',
          '1': 'You understand enough of the core to hand it over without waking it.',
          '2': 'Within a season, Ironhold\'s forges turn out aether-works no one has seen before.'
        },
        'sell': {
          'say': 'The Syndicate made the best offer.',
          '1': 'Gold. For the thing that killed my miners. Take it and go.',
          '2': 'A fortune changes hands. The core stays lit, and the mines will never be quiet again.'
        }
      },
      'oracle': {
        'ask': { '1': 'I have seen this moment ten thousand times.', '2': 'In half of them you free me. In half you take what I guard.', '3': 'Choose. Let me finally not know what comes next.' },
        'free': {
          'say': 'Hold still. I am breaking your chains.',
          '1': 'Oh. I did not see that. I did not see that at all.',
          '2': 'The oracle rises through the water and is gone. Her keeper of hours stays to teach.'
        },
        'slay': {
          'say': 'I came for the hourglass.',
          '1': 'Yes. This is the other half.',
          '2': 'She does not resist. The Timekeeper\'s Hourglass is yours.',
          '3': 'Her last pupil flees the temple, and the Circle does not forgive.'
        }
      },
      'dragon': {
        'ask': { '1': 'Enough. You have teeth, small one.', '2': 'The demon in the fortress chained my kin. I would see him burn.', '3': 'Kill me, or let me help you do it.' },
        'slay': {
          'say': 'No bargains with dragons.',
          '1': 'The mountain shakes as the dragon falls. Its hoard is yours.',
          '2': 'The Iron Order sings of the dragonslayer.'
        },
        'pact': {
          'say': 'Then fly with me against the Arch-Demon.',
          '1': 'Few could have asked that and lived. Very well, small one. We hunt together.',
          '2': 'When you march on the Dread Fortress, a dragon will be in the sky above you.'
        }
      },
      'throne': {
        'ask': { '1': 'So. It ends. I did not think it would be you.', '2': 'My throne does not stay empty, little hero. It commands the fortress, the rift, and the armies of both.', '3': 'Three envoys already wait at my door. Choose who inherits my chains.' },
        'order': {
          'say': 'The Iron Order will hold it.',
          '1': 'The Order garrisons the fortress and seals what it can.',
          '2': 'The realm will be safe, and it will be told what to do.'
        },
        'syndicate': {
          'say': 'The Ashen Syndicate has earned it.',
          '1': 'The Syndicate moves in before dawn.',
          '2': 'Everything is for sale now, including the peace.'
        },
        'circle': {
          'say': 'Let the Circle of Aether have it.',
          '1': 'The Circle turns the fortress into a school above a rift.',
          '2': 'They call it research. Everyone else calls it a matter of time.'
        },
        'shatter': {
          'say': 'Nobody inherits. I am breaking it.',
          '1': 'You break the throne with your own hands. No one rules from here again.',
          '2': 'The envoys leave without a word.'
        },
        'claim': {
          'say': 'I will sit on it myself.',
          '1': 'The throne is cold, and it fits.',
          '2': 'Three factions find they have a common enemy.'
        }
      }
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
    'chests': 'Chests',
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
    'musicTrack': 'Music style',
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
      'manaPotion': 'Drink mana potion',
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
