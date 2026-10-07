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
    'elixir': '{name} ({n} left)',
    'elixirNext': 'Next elixir',
    'groups': '{n} of {total} enemy groups defeated',
    'wave': 'Wave {n} / {total}',
    'roll': 'Dodge roll'
  },
  'menu': {
    'map': 'World map',
    'character': 'Hero',
    'skills': 'Skills',
    'inventory': 'Bag',
    'journal': 'Journal'
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
    'manaPotion': '+1 mana potion',
    'leave': 'Leave',
    'chestsLeft': '{n} chests still closed here'
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
    'ambush': 'Ambush',
    'elixirMight': 'Elixir of Might',
    'elixirIron': 'Ironskin',
    'elixirSwift': 'Swiftness',
    'elixirMind': 'Clear Mind',
    'elixirVigor': 'Vigour',
    'elixirShadow': 'Thirsting Blade'
  },
  'toast': {
    'item': 'Found: {item}',
    'herb': 'Picked: {plant}',
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
    },
    'mana': {
      'touch': 'Tap the blue flask to refill your mana.',
      'mouse': 'Press the mana potion key to refill your mana.'
    },
    'chest': {
      'touch': 'Tap a chest to open it.',
      'mouse': 'Click a chest to open it.'
    },
    'talk': {
      'touch': 'Follow the trail to the trainer and tap them to talk.',
      'mouse': 'Follow the trail to the trainer and click them to talk.'
    },
    'teach': {
      'touch': 'Tap "Will you teach me?" to see what this trainer teaches.',
      'mouse': 'Click "Will you teach me?" to see what this trainer teaches.'
    },
    'learn': {
      'touch': 'Tap a skill, then tap Learn.',
      'mouse': 'Click a skill, then click Learn.'
    },
    'slot': {
      'touch': 'Tap your new skill, then tap a slot to take it into battle.',
      'mouse': 'Drag your new skill onto a slot to take it into battle.'
    },
    'equip': {
      'touch': 'Tap the new item, compare the green and red numbers, then tap its slot to wear it.',
      'mouse': 'Drag the new item onto its slot to wear it. Green numbers go up, red ones go down.'
    },
    'attr': {
      'touch': 'Tap a plus to spend an attribute point.',
      'mouse': 'Click a plus to spend an attribute point.'
    },
    'travel': {
      'touch': 'Tap the next place on the map, then tap the button to travel there.',
      'mouse': 'Click the next place on the map, then click the button to travel there.'
    },
    'buy': {
      'touch': 'Tap an item to see its price, then tap Buy.',
      'mouse': 'Click an item to see its price, then click Buy.'
    },
    'exit': {
      'touch': 'Tap the map button to leave town for your next adventure.',
      'mouse': 'Click the map button to leave town for your next adventure.'
    },
    'roll': {
      'touch': 'Tap the roll button to dodge out of danger. Nothing can hurt you mid-roll.',
      'mouse': 'Press the roll key to dodge out of danger. Nothing can hurt you mid-roll.'
    }
  },

  // ─── The goal tracker (one short goal under the place's name) ─────────────
  'goal': {
    'dummy': 'Knock down the training dummy',
    'clear': 'Clear {place}',
    'boss': 'Beat {foe}',
    'exit': 'Take your loot and leave',
    'wave': 'Survive the waves',
    'trainer': 'Talk to a trainer',
    'learn': 'Learn a skill',
    'points': 'Spend your points',
    'leave': 'Leave for {place}',
    'travel': 'Travel to {place}',
    'decide': 'Make your choice',
    'explore': 'Explore the realm',
    'fight': 'Win the fight',
    'escort': 'Guard the caravan',
    'show': 'Show me the way: {goal}'
  },

  // ─── The world ────────────────────────────────────────────────────────────
  'node': {
    'sunford': { 'name': 'Sunford', 'desc': 'A farming town at the edge of the plains. Home, a smith, and two trainers.' },
    'plains': { 'name': 'Sunford Plains', 'desc': 'Goblins, wolves and bandits pick at the caravans on the open road.' },
    'hollows': { 'name': 'Goblin Hollows', 'desc': 'The caves under the hills. The Goblin King holds court at the bottom.' },
    'arena': { 'name': 'The Colosseum', 'desc': 'Wave after wave, each harder than the last. How far can you climb? A new board every Monday.' },
    'woods': { 'name': 'Whispering Woods', 'desc': 'Old trees that walk, and spiders that spin between them.' },
    'outskirts': { 'name': 'Oakhaven Outskirts', 'desc': 'The burning farms outside Oakhaven. A warlord\'s army is at the gate.' },
    'oakhaven': { 'name': 'Oakhaven', 'desc': 'A walled trade town. What it becomes is up to you.' },
    'crags': { 'name': 'Ashen Crags', 'desc': 'Black rock and open fire. Cultists feed the flames.' },
    'mines': { 'name': 'Ironhold Mines', 'desc': 'The dwarves dug too deep and woke something that glows.' },
    'ironhold': { 'name': 'Ironhold', 'desc': 'The mountain forge-town. The best steel in the realm is hammered here.' },
    'silverbridge': { 'name': 'Silverbridge', 'desc': 'The big river town on the old stone bridge. A master of every class teaches here.' },
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
    },
    'walkTouch': 'Tap the map to walk there, or steer with the stick',
    'walkMouse': 'Click the map to walk there, or steer with WASD'
  },
  'encounter': {
    'kicker': 'On the road',
    'title': {
      'fight': 'Ambush!',
      'elite': 'A champion bars the way!',
      'chest': 'A chest in the grass!',
      'merchant': 'A wandering merchant'
    },
    'result': 'On the road near {place}',
    'gold': '+{n} gold',
    'xp': '+{n} XP'
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
    'damage': 'Damage',
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
    'maxLevel': 'Highest level reached',
    'next': 'Next point:'
  },
  // The hero choice on a new save's first boot, and its toggle on the
  // character page (roadmap #71). `boy` / `girl` are the portraits' names
  // for screen readers.
  'heroChoice': {
    'title': 'Choose your hero',
    'boy': 'Play as the boy',
    'girl': 'Play as the girl',
    'switch': 'Your hero'
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
    'unmet': 'You no longer meet its requirements.',
    'how': 'Tap a skill, then a slot, or drag it there. Drag it off a slot to take it out.',
    'howSlot': 'Now tap a slot to put it in.',
    'classCount': '{cls}: {n} of {total} learned',
    'hint': {
      'met': 'Learn it from {name} in {place}.',
      'unmet': 'A trainer in {place} teaches this.'
    }
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
    'head': 'Head',
    'body': 'Armor',
    'hands': 'Hands',
    'feet': 'Feet',
    'trinket': 'Trinket'
  },
  'tier': {
    '1': 'Common',
    '2': 'Uncommon',
    '3': 'Rare',
    '4': 'Epic',
    '5': 'Heroic',
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
    'quiltedCap': { 'name': 'Quilted Cap' },
    'stalkersHood': { 'name': 'Stalker\'s Hood' },
    'ironcladHelm': { 'name': 'Ironclad Helm' },
    'seersCirclet': { 'name': 'Seer\'s Circlet' },
    'wyrmguardGreathelm': { 'name': 'Wyrmguard Greathelm' },
    'hatOfTheStarweaver': { 'name': 'Hat of the Starweaver' },
    'hideGloves': { 'name': 'Hide Gloves' },
    'ironGauntlets': { 'name': 'Iron Gauntlets' },
    'emberweaveGloves': { 'name': 'Emberweave Gloves' },
    'duelistsGrips': { 'name': 'Duelist\'s Grips' },
    'voidforgedGauntlets': { 'name': 'Voidforged Gauntlets' },
    'gripsOfTheTempest': { 'name': 'Grips of the Tempest' },
    'trailBoots': { 'name': 'Trail Boots' },
    'pathfindersBoots': { 'name': 'Pathfinder\'s Boots' },
    'forgeplateGreaves': { 'name': 'Forgeplate Greaves' },
    'mistwalkerBoots': { 'name': 'Mistwalker Boots' },
    'stormstrideGreaves': { 'name': 'Stormstride Greaves' },
    'treadsOfTheHorizon': { 'name': 'Treads of the Horizon' },
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
    'tooLow': 'Needs level {n}.',
    'worn': 'You are wearing this. Take it off to sell it.',
    'versus': 'Compared with {item}',
    'hint': 'Tap an item to look at it. Tap it again, or drag it onto a slot, to wear it.',
    'empty': 'Nothing of this kind in the bag.',
    'slotEmpty': '{slot}: empty',
    'slotHolds': '{slot}: {item}',
    'filter': { 'all': 'All', 'weapons': 'Weapons', 'armor': 'Armor', 'trinkets': 'Trinkets', 'herbs': 'Herbs' },
    'noHerbs': 'No herbs yet. They grow out in the wild: walk over one to pick it.',
    'herbCount': '{plant}: {n}',
    'sort': { 'slot': 'Type', 'tier': 'Quality', 'level': 'Level' },
    'sortBy': 'Sort by: {by}'
  },
  'shop': {
    'buy': 'Buy',
    'sell': 'Sell',
    'owned': 'Owned',
    'empty': 'Nothing on the shelves today.',
    'goods': 'For sale',
    'price': 'Price',
    'value': 'They pay',
    'hint': 'Tap something on the shelf or in your bag to put it on the table, or drag it across.',
    'buyBack': 'Sold today',
    'buyBackOne': 'Buy back',
    'deal': 'Deal!',
    'say': {
      'buy': 'Good choice. Look after it and it\'ll look after you.',
      'sell': 'Fair enough. Someone will want it.',
      'back': 'Changed your mind? That\'s fine, here it is.',
      'poor': 'That\'s a bit more than you\'ve got, I\'m afraid.'
    }
  },
  'trainer': {
    'learn': 'Learn',
    'known': 'Learned',
    'friend': '{faction} honours its friends: 20% off.',
    'fee': 'Fee',
    'hint': 'Choose a lesson. A green edge means you can learn it now.',
    'block': {
      'level': 'Your level is too low.',
      'attrs': 'Your attributes are too low.',
      'gold': 'Not enough gold.'
    }
  },
  'healer': {
    'talk': 'Sit and rest a while. Your flasks are full again. I can sell you a bigger belt, if you like.',
    'note': 'You carry {n} potions into every zone.',
    'buy': 'One more flask · {n}',
    'full': 'Your belt holds all it can.',
    'belt': 'Potion belt',
    'mana': {
      'title': 'Mana potions',
      'note': 'In stock: {n} of {max}. They stay with you between visits.',
      'buy': 'One mana potion · {n}',
      'full': 'Your stock is full.'
    }
  },
  'faction': {
    'order': 'The Iron Order',
    'syndicate': 'The Ashen Syndicate',
    'circle': 'The Circle of Aether'
  },

  // ─── Herbs (roadmap #88): picked in the wild, brewed by the alchemist ─────
  // The alchemist's elixirs (#87): `{n}` is the strength in per cent.
  'elixir': {
    'might': { 'name': 'Elixir of Might', 'desc': '+{n}% damage for a minute' },
    'iron': { 'name': 'Ironskin Draught', 'desc': '+{n}% armour for a minute' },
    'swift': { 'name': 'Swiftness Tonic', 'desc': '+{n}% speed and attack speed for a minute' },
    'mind': { 'name': 'Clear Mind Brew', 'desc': 'Skills come back {n}% faster for a minute' },
    'vigor': { 'name': 'Vigour Elixir', 'desc': 'Heals {n}% of your health every second for a minute' },
    'shadow': { 'name': 'Thirsting Draught', 'desc': 'Your hits heal you for {n}% of their damage for a minute' }
  },
  // The gamblers' tables (#91, #92).
  'memory': {
    'title': 'The Memory Stand',
    'lead': 'Find every pair before the sand runs out and win double your bet. Five wins in a row add a legendary prize.',
    'bet': 'Bet {n}',
    'row': 'Wins in a row: {n} of {max}',
    'pairs': '{n} pairs · {s} seconds',
    'won': 'Every pair found! You win {n} gold.',
    'lost': 'The sand ran out. The bet is gone.',
    'again': 'Play again',
    'noGold': 'Not enough gold for that bet.',
    'card': 'Card {n}'
  },
  'battle': {
    'title': 'Item Battle',
    'lead': 'Lay an item against the gambler\'s: the higher sale price takes the point, two points win. Your items are gone either way. Three wins in a row add an epic prize.',
    'fee': 'Sit down · {n}',
    'row': 'Wins in a row: {n} of {max}',
    'needItems': 'You need at least {n} unworn items in your bag.',
    'noGold': 'Not enough gold for the fee.',
    'theirs': 'The gambler lays',
    'pick': 'Pick an item to lay',
    'lay': 'Lay it',
    'value': '{n} gold',
    'score': 'You {a} · {b} Gambler',
    'roundWon': 'Yours is worth more. Point to you!',
    'roundLost': 'Theirs is worth more. Point to the gambler.',
    'won': 'You win the game! +{n} XP',
    'lost': 'The gambler wins the game.',
    'again': 'Play again'
  },
  'gamble': {
    'prize': 'Prize: {item}!',
    'prizeGold': 'You own them all, so you get {n} gold instead!'
  },
  'alchemy': {
    'talk': 'Herbs in, elixirs out. Which one shall we brew?',
    'lead': 'Each elixir works for a minute in a fight. Drink it from your third flask. You can carry {n} of each.',
    'brew': 'Brew · {n}',
    'carry': 'Carry this',
    'carried': 'In your flask',
    'count': '{n} / {max}',
    'herb': '{plant}: {have} of {n}',
    'done': 'Brewed!',
    'why': {
      'full': 'You carry all you can of this one.',
      'herbs': 'Not enough herbs. Pick more in the wild.',
      'gold': 'Not enough gold.'
    }
  },
  'plant': {
    'sunpetal': { 'name': 'Sunpetal', 'desc': 'A bright yellow flower. Healers swear by it.' },
    'glowcap': { 'name': 'Glowcap', 'desc': 'A mushroom that glows in the dark. Good for the mind.' },
    'swiftfern': { 'name': 'Swiftfern', 'desc': 'A light fern. Rub it on your boots and run.' },
    'ironmoss': { 'name': 'Ironmoss', 'desc': 'Tough moss from the stones. Makes skin hard.' },
    'emberbloom': { 'name': 'Emberbloom', 'desc': 'A flower that feels warm in the hand.' },
    'frostmint': { 'name': 'Frostmint', 'desc': 'Cold, fresh leaves. They clear your head.' },
    'moonbell': { 'name': 'Moonbell', 'desc': 'A rare pale flower that sharpens the eye.' },
    'shadowthorn': { 'name': 'Shadowthorn', 'desc': 'A rare dark thorn. Strong, and a little wicked.' }
  },

  // ─── Townsfolk ────────────────────────────────────────────────────────────
  'npc': {
    // Met on the world map's roads (a random encounter), not in a town.
    'wanderer': { 'name': 'Pip the Wanderer', 'talk': 'Long road, light purse? I carry a little of everything.' },
    'sunfordSmith': { 'name': 'Bram the Smith', 'talk': 'Plain steel, fair prices. Take your time.' },
    'sunfordPeddler': { 'name': 'Tilly the Peddler', 'talk': 'Rings, charms, bits and pieces. That one might even be lucky.' },
    'trainerAegis': { 'name': 'Ser Aldric' },
    'trainerPyro': { 'name': 'Ember Wren' },
    'elderMara': { 'name': 'Elder Mara' },
    'sunfordHealer': { 'name': 'Sister Lune' },
    'goblinTrader': { 'name': 'Grik the Trader', 'talk': 'My family made these. Good work, fair price.' },
    'captainHale': { 'name': 'Captain Hale' },
    'oakArmorer': { 'name': 'Odo the Armorer', 'talk': 'Half my stock went to the wall. Take what\'s left, if it fits.' },
    'oakMasterArmorer': { 'name': 'Master Odo', 'talk': 'The good plate\'s out. You\'ve more than earned a look.' },
    'oakWeapons': { 'name': 'Senna Blades', 'talk': 'Sharp, balanced, fairly priced. Don\'t touch the edges.' },
    'trainerShadow': { 'name': 'The Whisper' },
    'trainerSovereign': { 'name': 'Lord Castellan' },
    'oakHealer': { 'name': 'Brother Fenn' },
    'blackMarket': { 'name': 'The Fence', 'talk': 'No questions either way. The Syndicate takes its cut.' },
    'trainerBlood': { 'name': 'Doctor Sangrel' },
    'syndicateBoss': { 'name': 'Madam Ash' },
    'forgemaster': { 'name': 'Forgemaster Dorn' },
    'ironWeapons': { 'name': 'Hilda Hammerhand', 'talk': 'Dwarf-forged, every piece. If one breaks, I want to know how.' },
    'ironAetherWorks': { 'name': 'Tinker Voss', 'talk': 'Everything here came out of studying the core. Careful, most are loaded.' },
    'ironArmor': { 'name': 'Garrun Ironside', 'talk': 'Armour on the racks, rings in the tray.' },
    'ironOrderArmor': { 'name': 'Order Quartermaster', 'talk': 'Take what you need. The Order looks after its own.' },
    'trainerGeo': { 'name': 'Old Stonefoot' },
    'trainerAether': { 'name': 'Gearwright Pim' },
    'ironHealer': { 'name': 'Mother Brynja' },
    'exiledSovereign': { 'name': 'Lord Castellan, in exile' },
    // ── Silverbridge ──
    // `talk` is only for shops: it is the line on the trade screen
    // (TradeScreen.vue reads `npc.<id>.talk`); the healer screen uses `healer.talk`.
    'mayorBrenna': { 'name': 'Mayor Brenna Quill' },
    'sbHealer': { 'name': 'Friar Ansel' },
    'sbAlchemist': { 'name': 'Odile Fernwhistle' },
    'sbGambler': { 'name': 'Madame Pell' },
    'sunfordGambler': { 'name': 'Dob Tumbler' },
    'oakGambler': { 'name': 'Silky Ren' },
    'sbArmorer': { 'name': 'Greta Ironvein', 'talk': 'Mountain steel, river prices. Knock on anything you like.' },
    'sbWeapons': { 'name': 'Corvin Ashby', 'talk': 'Ashby\'s Fine Blades. Every edge polished by hand. My hand.' },
    'sbJeweler': { 'name': 'Tam Marlow', 'talk': 'Rings, charms, lucky stones. All real. Well, nearly all.' },
    'sbMasterAegis': { 'name': 'Dame Helga Stormshield' },
    'sbMasterPyro': { 'name': 'Magister Ignatius Vale' },
    'sbMasterShadow': { 'name': 'Nyx Halloway' },
    'sbMasterSovereign': { 'name': 'Lord Percival Ashcombe' },
    'sbMasterGeo': { 'name': 'Grandmother Tova Deeproot' },
    'sbMasterAether': { 'name': 'Professor Quint Sprocket' },
    'sbMasterChrono': { 'name': 'Clockwarden Selwyn' },
    'sbMasterBlood': { 'name': 'Vesper Crimsonleaf' },
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
  // People talk like people: contractions, short replies, answering what was
  // said. Humour comes from character, at most a light touch per conversation,
  // never shouted capitals or catchphrases. Each keeps a believable voice: Bram
  // terse and kind, Tilly chatty, Grik plain Common spoken with dignity, the
  // Keeper of Hours only slightly out of step with time.
  'dlg': {
    // Overheard small talk (`data/dialogs/smalltalk.ts`): two townsfolk chatting.
    // Ordinary talk about weather, prices, family, a sore back: a breath each.
    // ── Silverbridge ──
    'mayorBrenna': {
      'hello': { '1': 'Mind the cart! Sorry, everything on this bridge moves. Welcome to Silverbridge.', '2': 'I\'m Mayor Brenna Quill. If it\'s lost, broken or late, it ends up on my desk.' },
      'ending': { '1': 'The whole river\'s talking about you. Trade\'s never been better. So, thank you.' },
      'again': { '1': 'Back again? Good. Try not to block the carts.' },
      'who': { '1': 'Mayor, nine years now. Before that I sold rope. Same job, really. Holding things together.', '2': 'The town votes every spring. So far, nobody else wants the desk.' },
      'town': {
        'say': 'Tell me about Silverbridge.',
        '1': 'The bridge came first. Then a market on it, then houses, then houses on top of those.',
        '2': 'Mind the fountains. Children fall in. So do grown-ups, on market day.'
      },
      'masters': {
        'say': 'Is there really a teacher for every class here?',
        '1': 'Every single one. Shield, fire, shadow, stone. A master of each, all on one bridge.',
        '2': 'Pupils come from all over. It\'s good for the inns. Less good for my windows.'
      },
      'river': {
        'say': 'What do people trade here?',
        '1': 'Whatever the river brings. Fish, silk, Ironhold steel, the odd crate of angry chickens.',
        '2': 'And not every trader in Silverbridge hangs out a sign. Keep your eyes open.'
      },
      'rumor': {
        'crags': { '1': 'The boats from the north have stopped. Something\'s burning up in the Ashen Crags.' },
        'mines': { '1': 'No Ironhold steel this month. The dwarves say something\'s gone wrong in their mines.' },
        'tundra': { '1': 'The fur traders won\'t cross the tundra anymore. They say the giants are on the move.' },
        'far': { '1': 'Traders only whisper about the far north now. Whatever\'s up there, it isn\'t buying.' }
      },
      'bye': { '1': 'Off you go. And if anyone asks, the bridge toll is very fair.' }
    },
    'sbHealer': {
      'hello': { '1': 'Mm? Oh, a patient. Sorry, I was resting my eyes. Healers do that.', '2': 'Friar Ansel. Come in, sit down. The chair\'s comfier than it looks.' },
      'again': { '1': 'Ah, you\'re back. And I\'d only just sat down.' },
      'heal': { '1': 'Lie back, close your eyes. Not for long, or I\'ll nod off too. There, flasks full.' },
      'mana': { '1': 'Glowcap tonic. Good for the mind, bad for the breath. Sip it slowly.' },
      'potions': {
        'say': 'Any advice on potions?',
        '1': 'Drink one before you\'re desperate. Heroes always wait too long.',
        '2': 'If you want to carry more, I sell longer belts. Filling the flasks is free.'
      },
      'sleep': { 'say': 'Do you ever actually sleep?', '1': 'Not at night. Pupils from every class, all practising. Something always explodes.' },
      'healBack': { '1': 'Off you go. Next time, come for tea instead of bandages.' },
      'bye': { '1': 'Mind the steps. Half my patients only tripped on them.' }
    },
    'sbGambler': {
      'hello': { '1': 'Step right up! Twelve cards, one hourglass, and a purse that could double!', '2': 'Madame Pell. I never forget a face. Let\'s see if you never forget a card.' },
      'again': { '1': 'Back for another round? The sand\'s been waiting for you.' },
      'play': { '1': 'Coins on the cloth, eyes on the cards. Ready? Turn the glass!' },
      'rules': {
        'say': 'How does it work?',
        '1': 'Turn two cards. A pair stays up. Find every pair before the sand runs out and I pay double.',
        '2': 'Win again and the glass gets quicker. Win five in a row and I\'ll hand you a legendary prize.'
      },
      'who': { '1': 'I ran away with the travelling circus at nine. It turned out to be very good at maths.' },
      'prize': { 'say': 'Has anyone ever won the prize?', '1': 'A dwarf, once. Nobody has seen him blink since.' },
      'playBack': { '1': 'Win or lose, that was a good game. Come back when your eyes are rested.' },
      'bye': { '1': 'Off you go! Remember where you put your feet.' }
    },
    'sunfordGambler': {
      'hello': { '1': 'Psst. Got any junk in that bag? Old boots, bent swords? I\'ll play you for it.', '2': 'Dob Tumbler. I play for fun, mostly. And for boots.' },
      'again': { '1': 'You again! Got any more of that lovely junk?' },
      'play': { '1': 'Fee on the table. Lay your things down, highest price takes the point.' },
      'rules': {
        'say': 'What are the rules?',
        '1': 'We each lay an item. The pricier one wins the point. Two points wins the game.',
        '2': 'Whatever you lay is mine, win or lose. Win three games in a row, though, and I\'ve got something special.'
      },
      'who': { '1': 'Used to be a pedlar. Turns out people would rather bet their stuff than sell it.' },
      'luck': { 'say': 'Do you ever lose?', '1': 'All the time! But I always go home with a new pair of boots.' },
      'playBack': { '1': 'Good game! That stuff of yours will look lovely on my shelf.' },
      'bye': { '1': 'Bring more junk! Junk is my favourite.' }
    },
    'oakGambler': {
      'hello': { '1': 'A newcomer. Do sit down, I don\'t bite. My prices do, a little.', '2': 'They call me Silky Ren. I collect fine things, one game at a time.' },
      'again': { '1': 'Ah, my favourite opponent. Shall we?' },
      'play': { '1': 'The fee, please. Then lay something worth my while.' },
      'rules': {
        'say': 'How do we play?',
        '1': 'One item each, three times at most. The finer piece takes the point. Two points take the game.',
        '2': 'Your pieces stay with me either way. Win three games running and you\'ll leave with a real treasure.'
      },
      'who': { '1': 'A dealer in rare things. I find them, I keep them, and now and then I lose one.' },
      'collection': { 'say': 'What do you do with it all?', '1': 'I sort it by shine. The shiniest go on the top shelf, next to my teacups.' },
      'playBack': { '1': 'Delightful. Do come back when your bag is heavier.' },
      'bye': { '1': 'Mind your purse out there. Not everyone plays fair.' }
    },
    'sbAlchemist': {
      'hello': { '1': 'Oh! Mind the jars. That one bites. Well, it nibbles.', '2': 'Odile Fernwhistle, alchemist. Bring me herbs and I\'ll bottle you a little courage.' },
      'again': { '1': 'You\'re back! Did you bring me anything green?' },
      'brew': { '1': 'Let\'s see your pouch. Ooh, lovely. Pick what you want and I\'ll get the kettle on.' },
      'who': { '1': 'I set my mum\'s garden on fire with a daisy. Nobody could explain it, so I had to learn.' },
      'herbs': {
        'say': 'Where do I find herbs?',
        '1': 'Out in the wild, everywhere you fight. Just walk over a plant and it\'s yours.',
        '2': 'The rare ones grow further out. Moonbells and shadowthorn hide past the woods.'
      },
      'elixirs': {
        'say': 'What do the elixirs do?',
        '1': 'Each one makes you stronger in a fight for a whole minute. Harder hits, tougher skin, quicker feet.',
        '2': 'They sit in your third flask. Tap the little arrow to swap which one you drink.'
      },
      'brewBack': { '1': 'Careful with those, they\'re still warm. Come back when your pouch is full!' },
      'bye': { '1': 'Bye now! If you see a purple flower, pick two. One for me.' }
    },
    'sbArmorer': {
      'hello': { '1': 'Ha! Look at that dent. I hope you got your money back for that armour.', '2': 'Greta Ironvein. I make armour that comes home with its owner. Every time, so far.' },
      'again': { '1': 'You again! Still in one piece. My favourite kind of customer.' },
      'trade': { '1': 'Go on, knock on it. Hard as you like.' },
      'who': { '1': 'Mountain family. I came downriver for the trade and stayed for the fish.' },
      'steel': {
        'say': 'What makes good armour?',
        '1': 'It\'s not how thick it is. It\'s where it bends. Good armour bends where you do.',
        '2': 'Heavy plate wants Strength, mind. Wear it without and you\'ll waddle like a duck.'
      },
      'shopBack': { '1': 'Wear it well. Bring me the dents, I like a good story.' },
      'bye': { '1': 'Off you go. Don\'t get hit anywhere I haven\'t covered.' }
    },
    'sbWeapons': {
      'hello': { '1': 'Ah, a customer with taste. I can always tell. It\'s in the way you walk in.', '2': 'Corvin Ashby, of Ashby\'s Fine Blades. Yes, that Ashby. You\'ve heard of me, surely.' },
      'again': { '1': 'Back already? They always come back to Corvin.' },
      'trade': { '1': 'Every blade polished by hand. My hand, in fact. Mind the reflection.' },
      'who': { '1': 'The finest blade seller on the river. Ask anyone. Or just read my sign.' },
      'blades': {
        'say': 'How do I pick a good weapon?',
        '1': 'Pick one that suits you. Quick hands want a light blade, strong arms a heavy one.',
        '2': 'And it should look good. Nobody runs from a hero with an ugly sword.'
      },
      'shopBack': { '1': 'A fine choice. Not quite as fine as my hair, but close.' },
      'bye': { '1': 'Do tell people where you bought it.' }
    },
    'sbJeweler': {
      'hello': { '1': 'Psst! Over here! Rings, charms, lucky stones. Best stall on the bridge.', '2': 'Name\'s Tam Marlow. I\'m small, but my prices are smaller.' },
      'again': { '1': 'My favourite customer! Don\'t tell the others I said that.' },
      'trade': { '1': 'All real. Mostly. Fine, that one\'s glass, but it\'s very nice glass.' },
      'who': { '1': 'Grew up on this bridge. I know every crack, every cat and every shortcut.' },
      'gossip': {
        'say': 'Heard any good gossip?',
        '1': 'Professor Sprocket blew his eyebrows off again. Third time this month.',
        '2': 'And the mayor knows about traders who don\'t hang out a sign. I\'m working on it.'
      },
      'shopBack': { '1': 'Pleasure doing business! Tell your friends. Not the guards.' },
      'bye': { '1': 'See you around! I\'ll be right here. Probably.' }
    },
    'sbMasterAegis': {
      'hello': { '1': 'Ha! Another young one. Chin up, shoulders back. Shields work better with a smile.', '2': 'Dame Helga Stormshield. I held this bridge once. Now I teach others to hold their ground.' },
      'again': { '1': 'There you are! Shield up? Good. Smiling? Even better.' },
      'train': { '1': 'Feet wide. Lean in. When I push, you don\'t move. Ready? Hup!' },
      'class': {
        'say': 'What does an Aegis Knight really do?',
        '1': 'You stand in front, so the others don\'t have to. Best job there is.',
        '2': 'Strength to lift the shield. Endurance to keep it up until supper.'
      },
      'ready': {
        'strong': { '1': 'You\'re a proper wall now, dear. Take any lesson you like.' },
        'able': { '1': 'Steady legs! You\'re ready for the next one.' },
        'weak': { '1': 'Not yet. One good push and you\'d topple. More Strength and Endurance, please.' }
      },
      'bridge': {
        'say': 'You held this bridge?',
        '1': 'Forty years ago, against river pirates. Six of us, one gate, a very long night.',
        '2': 'We didn\'t win by hitting hardest. We won by not moving. Remember that.'
      },
      'trainBack': { '1': 'Good work! Now eat something. Shields are heavy.' },
      'bye': { '1': 'Chin up out there!' }
    },
    'sbMasterPyro': {
      'hello': { '1': 'Do come in. Mind the notes, and please don\'t sneeze near the brazier.', '2': 'Magister Ignatius Vale. I teach fire on a bridge. Plenty of water about, you see.' },
      'again': { '1': 'Punctual. Excellent. We\'ll begin where we stopped.' },
      'train': { '1': 'Observe. A small flame, held still. Big flames are easy. Small ones take skill.' },
      'class': {
        'say': 'What does a pyromancer really do?',
        '1': 'Anyone can start a fire. A pyromancer decides where it goes, and where it stops.',
        '2': 'It all comes from Intelligence. Later, Skill helps, when the fire needs a steady hand.'
      },
      'ready': {
        'strong': { '1': 'Your control is excellent. I\'ve very little left to correct. Choose freely.' },
        'able': { '1': 'Adequate. More than adequate, actually. You may have the next lesson.' },
        'weak': { '1': 'Not yet. Your flame wobbles. A sharper mind, please. More Intelligence.' }
      },
      'sprocket': { 'say': 'What do you think of Professor Sprocket?', '1': 'Brilliant man. Loud, careless and brilliant. I keep a bucket by his door.' },
      'trainBack': { '1': 'Practise near water. I insist.' },
      'bye': { '1': 'Good day. Do keep your sleeves rolled up.' }
    },
    'sbMasterShadow': {
      'hello': { '1': 'Looking for me? I\'ve been next to you since the fountain. You walked past me twice.', '2': 'Nyx Halloway. The best place to hide is a crowd, and this is the busiest bridge there is.' },
      'again': { '1': 'Hi again. I\'ve been here a while. You noticed? No? Good.' },
      'train': { '1': 'Lesson one: walk like you belong. Nobody looks twice at someone who belongs.' },
      'class': {
        'say': 'What makes a good Shadowblade?',
        '1': 'Never being where they\'re looking. Slip in, one quick strike, and blend back in.',
        '2': 'Dexterity for quick feet and hands. Skill, so the strike counts.'
      },
      'ready': {
        'strong': { '1': 'You\'re properly sneaky now. Take what\'s left, you\'ve earned it.' },
        'able': { '1': 'Light on your feet! You\'re ready for the next trick.' },
        'weak': { '1': 'Not yet. I can hear you coming from the fountain. More Dexterity.' }
      },
      'past': {
        'say': 'How did you learn all this?',
        '1': 'I used to pick pockets on this very bridge. I was good at it, too.',
        '2': 'Then the mayor caught me and gave me a job, not a cell. Don\'t tell her I\'m grateful.'
      },
      'trainBack': { '1': 'Now go and practise. Try not to let me catch you.' },
      'bye': { '1': 'See you. Well, you won\'t see me.' }
    },
    'sbMasterSovereign': {
      'hello': { '1': 'Oh! Hello, hello. Do forgive me, I was chatting with my guards. Lovely listeners.', '2': 'Percival Ashcombe. I could teach in a castle, but you only learn to lead where people are.' },
      'again': { '1': 'My dear friend! Shall we carry on? Only if you\'d like to, of course.' },
      'train': { '1': 'Right then. A good order is clear, kind, and only given once. Like so.' },
      'class': {
        'say': 'What is a Grand Sovereign?',
        '1': 'A leader. Your guards come to your side and fight with you, not just for you.',
        '2': 'Charisma is everything. People follow those they like. And who remember their names.'
      },
      'ready': {
        'strong': { '1': 'Splendid! People would follow you anywhere now. Take all the lessons.' },
        'able': { '1': 'Your guards would listen to you. You\'re ready for the next lesson.' },
        'weak': { '1': 'Not quite yet, I\'m afraid. A little more Charisma, and they\'ll come.' }
      },
      'please': { 'say': 'Do you really say please to your guards?', '1': 'Always. Shouting gets you obeyed. Please gets you loyalty, and loyalty lasts longer.' },
      'trainBack': { '1': 'Lovely work. Remember to thank them afterwards.' },
      'bye': { '1': 'Do take care, and give my regards to everyone.' }
    },
    'sbMasterGeo': {
      'hello': { '1': 'Mind the moss, dear, it\'s had a long week. Now, let\'s have a look at you.', '2': 'Grandmother Tova Deeproot. The river bed here is lovely stone, all the way down.' },
      'again': { '1': 'Back already? Sit, I\'ve just made tea. Stone tea. It\'s mostly tea.' },
      'train': { '1': 'Hands flat on the ground. Not like that. Like you\'re patting a sleepy dog.' },
      'class': {
        'say': 'What does a Geomancer do?',
        '1': 'We ask the ground for help. A wall when you need one, a spike when someone\'s rude.',
        '2': 'Stone\'s like a garden. Strength to dig, Intelligence to know where to plant.'
      },
      'ready': {
        'strong': { '1': 'The ground likes you now. Learn whatever you please, dear.' },
        'able': { '1': 'Good roots! You\'re ready for the next lesson.' },
        'weak': { '1': 'Not yet, love. The stone won\'t budge for you. More Strength first.' }
      },
      'garden': {
        'say': 'Is that a garden made of stone?',
        '1': 'Forty years of work. Every rock grown by hand. Well, by magic. Mostly by hand.',
        '2': 'Take a pebble on your way out. They make lovely doorstops.'
      },
      'trainBack': { '1': 'Lovely. Now go and dig something. Gently.' },
      'bye': { '1': 'Off you go. Wrap up warm, it\'s damp by the river.' }
    },
    'sbMasterAether': {
      'hello': { '1': 'Welcome, welcome! You\'re just in time for the demonstration. Cover your ears, please.', '2': 'Professor Quint Sprocket. The river turns my wheels for free. Where else would I teach?' },
      'again': { '1': 'Ah, my favourite pupil! Today\'s demonstration is extra loud.' },
      'train': { '1': 'Observe the blackboard. Now forget the blackboard, and watch the machine.' },
      'class': {
        'say': 'What does an Aether-Tech actually do?',
        '1': 'We build our way out of trouble. A pistol, a turret, and a heat gauge to keep you honest.',
        '2': 'Skill for the aim, Intelligence for the clever bits. Ideally both.'
      },
      'ready': {
        'strong': { '1': 'Marvellous! You could give my lectures. Please don\'t, though. Take the rest.' },
        'able': { '1': 'A steady hand! You\'re ready for the next machine.' },
        'weak': { '1': 'Not yet. Your aim drifts. More Skill, then we\'ll talk.' }
      },
      'eyebrows': { 'say': 'What happened to your eyebrows?', '1': 'A demonstration went slightly too well. They\'ll grow back. They always do.' },
      'trainBack': { '1': 'Splendid. Now go and vent that heat. Outside, ideally.' },
      'bye': { '1': 'Class dismissed! Do mind the steps.' }
    },
    'sbMasterChrono': {
      'hello': { '1': 'My old pupil, the Keeper of Hours, wrote that you\'d come. At this very minute, in fact.', '2': 'Clockwarden Selwyn. I keep the bridge clock. A town this busy can\'t afford to be late.' },
      'again': { '1': 'Seven minutes past. A good time to begin.' },
      'train': { '1': 'Count with me. One, two, and hold. Time stretches, if you hold it right.' },
      'class': {
        'say': 'What is a Chrono-Weaver?',
        '1': 'We tidy up time. Slow a foe down, hurry a friend along, undo the odd mistake.',
        '2': 'Intelligence to understand it. Skill to touch it without breaking anything.'
      },
      'ready': {
        'strong': { '1': 'Excellent timing. Take the rest of my lessons whenever it suits you.' },
        'able': { '1': 'You\'re ready. The next lesson starts, oh, now.' },
        'weak': { '1': 'Not yet. You\'re always a beat behind. More Intelligence, and more Skill.' }
      },
      'keeper': { 'say': 'How do you know the Keeper of Hours?', '1': 'I taught him, years ago. A brilliant pupil. Always early or late, never on time.' },
      'trainBack': { '1': 'Practise every day. Same time each day, if you please.' },
      'bye': { '1': 'Off you go. Don\'t be late.' }
    },
    'sbMasterBlood': {
      'hello': { '1': 'Doctor Sangrel wrote to me about you. He says you didn\'t faint. High praise, from him.', '2': 'Vesper Crimsonleaf. Every herb in the world floats past this bridge. I\'m spoiled here.' },
      'again': { '1': 'Welcome back. You look lively today. I can always tell.' },
      'train': { '1': 'Breathe in. Feel your strength? Now spend a little of it. Wisely.' },
      'class': {
        'say': 'What is a Blood Alchemist, really?',
        '1': 'We spend our own life force for power, then take it back from our foes.',
        '2': 'Endurance is your purse. Intelligence decides how well you spend it.'
      },
      'ready': {
        'strong': { '1': 'Such vitality! You\'re ready for nearly everything I know.' },
        'able': { '1': 'Your essence runs strong. On to the next lesson.' },
        'weak': { '1': 'Not yet. You\'d tire after one spell. Build up your Endurance first.' }
      },
      'herbs': {
        'say': 'What are all these herbs for?',
        '1': 'Tonics, mostly. A little essence, a lot of mint. Mint makes everything better.',
        '2': 'If you find rare plants out there, do bring them by. I\'d love a look.'
      },
      'trainBack': { '1': 'Rest after practice. Essence comes back, but it likes a nap.' },
      'bye': { '1': 'Look after yourself. Drink water. Eat something green.' }
    },
    'smalltalkSunford': {
      'weather': { '1': 'Rain tonight. My knee\'s been aching all day.', '2': 'Your knee said that last week too.', '3': 'And it rained, didn\'t it? Just not here.' },
      'harvest': { '1': 'The barley\'s come up well this year.', '2': 'Let\'s hope we get to keep it.' },
      'goblins': { '1': 'Goblins took three hens off the Miller farm.', '2': 'Again? That\'s the second time this month.', '3': 'Somebody ought to do something about those caves.' },
      'kingGone': { '1': 'They say the Goblin King\'s dead.', '2': 'Good. Maybe I\'ll sleep through a whole night now.' },
      'pact': { '1': 'I bought a ladle off a goblin this morning.', '2': 'Any good?', '3': 'Better than mine, honestly. Don\'t tell anyone.' },
      'bram': { '1': 'Bram\'s been at the anvil since before sunrise.', '2': 'He gets like that when he\'s worried.' },
      'pie': { '1': 'Is that apple pie I can smell?', '2': 'It was. The children found it first.', '3': 'I\'ll bake another. Hide it better this time.' },
      'road': { '1': 'Nobody\'s taken the plains road in a week.', '2': 'Not with bandits on it. Can\'t blame them.' },
      'hero': { '1': 'Somebody cleared the bandits off the plains road.', '2': 'Thank goodness. My sister can visit again.' }
    },
    'smalltalkOakhaven': {
      'prices': { '1': 'Two silver for a cabbage. Two!', '2': 'Nothing gets through the gate cheap these days.', '3': 'I\'ll grow my own, then. On the roof, if I must.' },
      'watch': { '1': 'They\'ve doubled the guard on the gate.', '2': 'Good. I sleep a bit easier for it.' },
      'caravan': { '1': 'The spice caravan\'s late again.', '2': 'Bandits?', '3': 'Or mud. Let\'s hope it\'s mud.' },
      'siege': { '1': 'There\'s an army camped out past the farms.', '2': 'Then we\'d better fill the cellar while we can.' },
      'saved': { '1': 'Were you on the wall when the siege broke?', '2': 'I was hiding under my bed, if I\'m honest.', '3': 'So was half the town. We\'re still here, though.' },
      'fountain': { '1': 'I threw a coin in the fountain for luck.', '2': 'Hope you wished for cheaper cabbages.' },
      'ash': { '1': 'Everything still smells of smoke.', '2': 'It\'ll fade. Everything does, in the end.' },
      'hide': { '1': 'Did you hear boots in the street last night?', '2': 'Not so loud. You don\'t know who\'s listening.', '3': 'Sorry. I just... sorry.' },
      'bread': { '1': 'I found half a loaf. Here, take some.', '2': 'You\'re a good soul. Thank you.' }
    },
    'smalltalkIronhold': {
      'ore': { '1': 'Good seam of copper on the fourth level.', '2': 'Copper. I was hoping for silver.', '3': 'Copper pays the rent. Silver pays for dreams.' },
      'forge': { '1': 'The great forge hasn\'t gone cold in a hundred years.', '2': 'My grandfather helped light it, you know.' },
      'beard': { '1': 'You\'ve trimmed your beard.', '2': 'Got too close to the anvil.', '3': 'It\'ll grow back. Suits you shorter, anyway.' },
      'core': { '1': 'Something\'s glowing down in the deep shafts.', '2': 'Nothing good glows down there. Stay up top.' },
      'order': { '1': 'The Order\'s armourers work fast, I\'ll give them that.', '2': 'Fast, aye. We\'ll see how it holds up.' },
      'circle': { '1': 'The Circle folk hum while they work.', '2': 'Better than your singing, at least.' },
      'cold': { '1': 'Bitter cold this morning.', '2': 'Come and stand by the forge, then.' }
    },
    'smalltalkSilverbridge': {
      'barges': { '1': 'Three barges in from the coast this morning.', '2': 'Salt fish again?', '3': 'Silk, for once. Smell your fingers after, though.' },
      'lesson': { '1': 'How was your lesson?', '2': 'I set my sleeve on fire. The master says that\'s progress.' },
      'masters': { '1': 'Every master in the land teaches on one street.', '2': 'And every one of them says theirs is the best class.', '3': 'They\'re all right, which is the annoying part.' },
      'bridge': { '1': 'They say the bridge is older than the town.', '2': 'It certainly creaks like it.' },
      'fish': { '1': 'Caught anything?', '2': 'A boot.', '3': 'Well, that\'s half a pair.' },
      'newMaster': { '1': 'A new master moved in up the street. Talks about time a lot.', '2': 'Late for every lesson, I bet.' },
      'siege': { '1': 'Word from Oakhaven is bad. Bandits at the walls.', '2': 'Then the barges will come here instead. Poor souls.' }
    },
    'smalltalkKids': {
      'tag': { '1': 'Tag, you\'re it!', '2': 'That\'s not fair, I wasn\'t ready!' },
      'dragon': { '1': 'When I\'m big I\'m going to ride a dragon.', '2': 'Dragons don\'t let people ride them.', '3': 'A nice one might.' },
      'sword': { '1': 'Look, I found a sword!', '2': 'That\'s a stick.' },
      'frog': { '1': 'There\'s a frog down by the well.', '2': 'Can we keep it?', '3': 'Mum said no more frogs.' }
    },
    'ui': {
      'overheard': 'Townsfolk',
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
      'bye': 'I\'ll let you get on.',
      'trade': 'Can I see what you\'ve got?',
      'train': 'Will you teach me?',
      'heal': 'Could you patch me up?',
      'brew': 'Could you brew me something?',
      'play': 'Deal me in.',
      'mana': 'Do you have anything for mana?',
      'who': 'Who are you, if you don\'t mind me asking?',
      'rumor': 'Heard anything lately?',
      'ready': 'Do you think I\'m ready for more?'
    },

    // ── Sunford ──
    'sunfordSmith': {
      'hello': { '1': 'Haven\'t seen you before. You\'re the one who cleared the road?', '2': 'Bram. I keep the forge. If you need a blade, come to me.' },
      'kingDead': { '1': 'Heard the Goblin King\'s dead. Can\'t say I\'ll miss him.' },
      'kingPact': { '1': 'Goblins trading in the square now. Never thought I\'d see it.' },
      'kingRansom': { '1': 'You let the Goblin King keep his crown. He\'ll be back, you know.' },
      'ending': { '1': 'Whole realm\'s talking about you. Still need a whetstone, though?' },
      'again': { '1': 'Back again. What can I do for you?' },
      'trade': { '1': 'Plain steel, fair prices. Have a look.' },
      'who': { '1': 'Bram. Thirty years at this anvil, give or take.', '2': 'Horseshoes, ploughs, the odd sword. Lately, mostly swords.' },
      'gear': {
        'say': 'What should I take with me out there?',
        '1': 'A shield, if you plan on getting hit. Most people do.',
        '2': 'Heavy steel needs a strong arm. Work on your Strength first.'
      },
      'rumor': {
        'plains': { '1': 'Bandits on the plains road. I\'d start there, if I were you.' },
        'hollows': { '1': 'The goblins come from the Hollows, past the plains. Their king\'s down there.' },
        'woods': { '1': 'East of the plains are the Whispering Woods. Folk say the trees move.' },
        'siege': { '1': 'There\'s smoke toward Oakhaven. An army\'s camped on the outskirts.' },
        'north': { '1': 'Ironhold steel\'s coming down the road again. Better than mine, if I\'m honest.' }
      },
      'shopBack': { '1': 'Look after it and it\'ll look after you.' },
      'bye': { '1': 'Mind how you go.' }
    },
    'sunfordPeddler': {
      'hello': { '1': 'Oh, hello! Are you buying, or just looking? Both are fine.', '2': 'I\'m Tilly. Rings, charms, bits and pieces from all over.' },
      'rival': { '1': 'Have you seen the goblin\'s stall? His prices are lower than mine. It\'s not fair.' },
      'again': { '1': 'There you are! I put a few things aside I think you\'ll like.' },
      'trade': { '1': 'Have a look. That one\'s lucky. Probably.' },
      'who': { '1': 'I walk the roads and buy what people want to get rid of.', '2': 'And sometimes I find things. Bandits drop a lot when they run.' },
      'trinkets': { 'say': 'What are trinkets actually good for?', '1': 'You can wear two, one on each hand. It all adds up out there.' },
      'stolen': {
        'say': 'Where did all this come from, really?',
        '1': 'Ah. You\'ve got a way of asking, haven\'t you?',
        '2': 'Take this ring and let\'s not talk about where I found it.'
      },
      'rumor': {
        'arenaShut': { '1': 'There\'s an old colosseum south of here. Shut tight while the goblins raid.' },
        'arenaOpen': { '1': 'The colosseum\'s open again. Eight waves, I hear. People bet on it.' },
        'east': { '1': 'Oakhaven pays well for anything shiny. It\'s east, past the woods.' }
      },
      'shopBack': { '1': 'Come back when your purse is heavier!' },
      'bye': { '1': 'Safe travels. Hold on to your coin out there.' }
    },
    'trainerAegis': {
      'hello': { '1': 'Stand up straight. You\'re speaking to a knight of the Iron Order.', '2': 'Ser Aldric. I teach people to stand between others and harm.' },
      'saved': { '1': 'Oakhaven still stands, and I hear you were on its wall. Well done.' },
      'fallen': { '1': 'You opened Oakhaven\'s gate. I won\'t pretend I\'ve forgotten. What do you want?' },
      'dragon': { '1': 'You killed the dragon on the peak? I\'d have liked to see that.' },
      'friend': { '1': 'The Order thinks well of you. For its friends, my lessons cost less.' },
      'foe': { '1': 'The Order calls you an enemy. I\'ll still teach you. That\'s my choice, not theirs.' },
      'again': { '1': 'Back for more drills?' },
      'train': { '1': 'Good. Watch closely, I\'ll only show you once.' },
      'class': {
        'say': 'What does an Aegis Knight actually do?',
        '1': 'We take the blows meant for others. It\'s simple, and it\'s hard.',
        '2': 'You\'ll need Strength for the shield and Endurance to keep it up.'
      },
      'ready': {
        'strong': { '1': 'You\'re strong enough for most of what I know. Keep at your Endurance.' },
        'able': { '1': 'You\'re ready for the next lesson. Don\'t let it go to your head.' },
        'weak': { '1': 'Not yet. You\'d tire before the shield did. More Strength, more Endurance.' }
      },
      'order': {
        'say': 'Tell me about the Iron Order.',
        '1': 'We keep the roads safe and the law in hand. Some say too firmly.',
        '2': 'Stand with us, and our armourers and teachers will remember you.'
      },
      'trainBack': { '1': 'Practise until it\'s boring. Then keep going.' },
      'bye': { '1': 'Go carefully.' }
    },
    'trainerPyro': {
      'hello': { '1': 'Oh, a student? Lovely. Maybe stand back a little.', '2': 'I\'m Ember Wren. I teach fire. Mostly it does what I ask.' },
      'core': { '1': 'You gave the core to the Circle! I can\'t wait to see what we learn from it.' },
      'friend': { '1': 'The Circle speaks highly of you. That means a discount, by the way.' },
      'foe': { '1': 'The Circle isn\'t happy with you. I\'ll still teach you, though. Quietly.' },
      'again': { '1': 'You\'re back! Ready to light something?' },
      'train': { '1': 'Right. Watch my hands, and keep your sleeves away from me.' },
      'class': {
        'say': 'What does a pyromancer do, exactly?',
        '1': 'Set things alight, mostly. Then make the fire spread where you want it.',
        '2': 'It all comes from Intelligence. The sharper the mind, the hotter the flame.'
      },
      'ready': {
        'strong': { '1': 'Honestly? You could teach some of this. Take whatever you like.' },
        'able': { '1': 'You\'re ready for the next spell. Come on, I\'ll show you.' },
        'weak': { '1': 'Not yet, I\'m afraid. You need more Intelligence, or the fire takes over.' }
      },
      'circle': { 'say': 'Who are the Circle of Aether?', '1': 'Scholars. We study what the world\'s made of. Some of it explodes.' },
      'trainBack': { '1': 'Go and practise. Somewhere that won\'t catch, please.' },
      'bye': { '1': 'Take care of yourself!' }
    },
    'elderMara': {
      'hello': { '1': 'So you\'re the one from the road. Come here, let me look at you.', '2': 'I\'m Mara. I\'ve looked after this town for... oh, forty years now.' },
      'slain': { '1': 'The Hollows are quiet. It was a hard thing you did, but we sleep because of it.' },
      'pact': { '1': 'Goblins selling things in my square. You talked them into that, didn\'t you?' },
      'ransom': { '1': 'You took his gold and left him his crown. I won\'t pretend I\'m not disappointed.' },
      'saved': { '1': 'Word came from Oakhaven. The gate held. I\'m glad you were there.' },
      'fallen': { '1': 'Oakhaven burned, they say. I\'d rather not hear how. Not today.' },
      'ending': { '1': 'They say you decided the fate of the Dread Fortress. From our little road to that.' },
      'again': { '1': 'Sit for a moment. The road will still be there.' },
      'reward': {
        'say': 'Someone said you wanted to see me?',
        '1': 'You held the road when our militia couldn\'t. The town put a little together.',
        '2': 'It isn\'t much. It\'s what we could spare.'
      },
      'quest': {
        'say': 'What\'s troubling Sunford?',
        '1': 'The raids come from the Goblin Hollows. They\'ve crowned themselves a king.',
        '2': 'And you want him dead?',
        '3': 'I want the raids to stop. How... well, that\'s for you to decide, down there.',
        '4': 'The Hollows are just past the plains. Please, be careful.'
      },
      'king': {
        'say': 'About the Goblin King...',
        'slay': { '1': 'He\'s gone, and the caravans run again. I won\'t ask how it felt.' },
        'pact': { '1': 'A trade pact. My mother would have fainted. Still, trade beats funerals.' },
        'ransom': { '1': 'Gold runs out quickly. Grudges don\'t. Remember that when the raids start.' }
      },
      'town': {
        'say': 'Tell me about Sunford.',
        '1': 'Farmers, mostly. A smith, a healer, two teachers who put up with us.',
        '2': 'Rest here between journeys. That\'s what home is for.'
      },
      'next': {
        'say': 'Where should I go next?',
        'plains': { '1': 'The plains road, first. Without the caravans, we don\'t eat.' },
        'hollows': { '1': 'The Goblin Hollows. Nothing else is safe while the raids go on.' },
        'woods': { '1': 'East, through the Whispering Woods. That\'s the road to Oakhaven.' },
        'oakhaven': { '1': 'Oakhaven is under siege. If the outskirts fall, the town goes with them.' },
        'north': { '1': 'North, I think. The Ashen Crags, and Ironhold beyond. It only gets harder.' }
      },
      'bye': { '1': 'Come back to us in one piece. That\'s all I ask.' }
    },
    'sunfordHealer': {
      'hello': { '1': 'Hold still a moment. No, you\'re fine. Habit, sorry.', '2': 'I\'m Sister Lune. I patch up whatever the road breaks.' },
      'again': { '1': 'Still in one piece? Good. Sit down anyway.' },
      'heal': { '1': 'Sit, rest a while. I\'ll fill your flasks before you go.' },
      'mana': { '1': 'This one\'s bitter. Drink it when your spells run dry.' },
      'potions': {
        'say': 'How do the potions work?',
        '1': 'You take a few flasks into every fight. Drink before you need to, not after.',
        '2': 'If you want to carry more, I can sell you a bigger belt.'
      },
      'rumor': {
        'goblins': { '1': 'The goblins coat their sling stones in something. If you feel sick, come back.' },
        'spiders': { '1': 'I\'ve treated three spider bites from the Woods this week. Watch your step there.' },
        'burns': { '1': 'Soldiers keep coming down from the north with burns. The Ashen Crags, they say.' }
      },
      'healBack': { '1': 'Keep your belt full and your head down.' },
      'bye': { '1': 'Look after yourself out there.' }
    },
    'goblinTrader': {
      'hello': { '1': 'You are the one who made the pact. My king says you are welcome here.', '2': 'I am Grik. I sell what goblins make. Good work, fair price.' },
      'again': { '1': 'Friend. Good to see you again.' },
      'trade': { '1': 'Look, please. My family made these.' },
      'king': {
        'say': 'How is your king?',
        '1': 'He eats well now. No more raids. My people are less hungry.',
        '2': 'He speaks of you often. With respect.'
      },
      'town': { 'say': 'How do you like Sunford?', '1': 'People still stare. But the baker gives me pie. I like the pie.' },
      'rumor': {
        'crags': { '1': 'My cousins dig in the black rock to the north. They say fire walks there now.' },
        'deep': { '1': 'Something is waking in the deep places. Goblins feel it in the ground.' }
      },
      'shopBack': { '1': 'Thank you. Come again.' },
      'bye': { '1': 'Go safely, friend.' }
    },

    // ── Oakhaven ──
    'captainHale': {
      'hello': { '1': 'Another sword. Good. We need every one we can get.', '2': 'Captain Hale. I command what\'s left of Oakhaven\'s watch.' },
      'saved': { '1': 'The gate held. Three hundred years, and one more. I owe you for that.' },
      'ending': { '1': 'You decided the Dread Fortress, they say. My walls feel small next to that.' },
      'again': { '1': 'Walls are still standing. For today, anyway.' },
      'after': { '1': 'Good to see you. Oakhaven hasn\'t forgotten.' },
      'quest': {
        'say': 'How bad is it?',
        '1': 'Bad. A warlord called Krag has us surrounded, and he doesn\'t fight for free.',
        '2': 'Who\'s paying him?',
        '3': 'The Ashen Syndicate. They want a town of their own, and ours has walls.',
        '4': 'Break his camp on the Oakhaven Outskirts. That\'s where this ends, one way or another.'
      },
      'siege': {
        'say': 'About the siege...',
        '1': 'They offered you a third of the town, didn\'t they? They offered me a quarter.',
        '2': 'The Syndicate will be after you now. Watch your back on the roads.'
      },
      'town': {
        'say': 'Tell me about Oakhaven.',
        '1': 'A trade town. Anything going between the plains and the mountains pays a toll here.',
        '2': 'That\'s why everyone wants it. And why I won\'t give it up.'
      },
      'order': { 'say': 'Do you answer to the Iron Order?', '1': 'I answer to Oakhaven. The Order and I agree most days. Not every day.' },
      'rumor': {
        'crags': { '1': 'North of the woods the ground\'s black and burning. The Ashen Crags. Cultists, mostly.' },
        'mines': { '1': 'Ironhold\'s stopped sending steel. Something\'s wrong in their mines.' },
        'north': { '1': 'The far north\'s gone quiet. In my experience, that\'s never good.' }
      },
      'bye': { '1': 'Keep your sword close.' }
    },
    'oakArmorer': {
      'hello': { '1': 'If you\'re after a helmet, I\'m sorry. They\'re all up on the wall.', '2': 'Odo. I make armour. Haven\'t slept much lately.' },
      'again': { '1': 'Still here. Still short of nearly everything.' },
      'trade': { '1': 'Half my stock went to the wall. Take what\'s left, if it fits.' },
      'who': { '1': 'I\'ve armoured this town for twenty years. Never seen all of it worn at once.' },
      'armor': { 'say': 'What sort of armour should I wear?', '1': 'Plate, if you stand your ground. Leather, if you keep moving. Robes, if you\'re quick.' },
      'rumor': { 'backRoom': { '1': 'If the siege breaks, I\'ll open the back room. The good plate\'s in there.' } },
      'shopBack': { '1': 'It\'ll hold. It\'s held so far.' },
      'bye': { '1': 'Keep your head down out there.' }
    },
    'oakMasterArmorer': {
      'hello': { '1': 'There you are! Come in. The back room\'s open, and it\'s open for you.', '2': 'Master Odo, they call me now. Funny what a little peace does for business.' },
      'ending': { '1': 'From our gate to the Dread Fortress. I tell everyone I fitted your armour.' },
      'again': { '1': 'Good to see you. What\'ll it be today?' },
      'trade': { '1': 'The good plate\'s out. You\'ve more than earned a look at it.' },
      'town': {
        'say': 'How\'s the town doing?',
        '1': 'Busy. Loud. Full of merchants grumbling about the toll.',
        '2': 'It\'s wonderful. I haven\'t had a quiet hour in weeks.'
      },
      'rumor': {
        'mines': { '1': 'My steel comes from Ironhold, and they\'ve gone quiet. Someone should check their mines.' },
        'tundra': { '1': 'Best ore I ever worked came out of the tundra. The men who found it didn\'t go back.' }
      },
      'shopBack': { '1': 'If it doesn\'t sit right, bring it back. I\'ll fix it.' },
      'bye': { '1': 'You\'re always welcome here.' }
    },
    'oakWeapons': {
      'hello': { '1': 'Looking or buying? Either\'s fine. Just don\'t touch the edges.', '2': 'Senna. I sell blades. What you do with them is your business.' },
      'saved': { '1': 'So the siege broke. Good for the town. War was better for my trade, mind.' },
      'again': { '1': 'Back for something sharper?' },
      'trade': { '1': 'Sharp, balanced, and fairly priced. Take your time.' },
      'who': { '1': 'I\'ve sold to both sides of three wars. I\'m still here. Most of them aren\'t.' },
      'rumor': {
        'krag': { '1': 'Krag\'s men carry good steel. Syndicate money. Worth picking up, if you get the chance.' },
        'which': { '1': 'Quick blades want Dexterity. Bows and guns want Skill. Know which you are.' }
      },
      'shopBack': { '1': 'Keep it oiled. Rust ruins a good edge faster than bone.' },
      'bye': { '1': 'Try not to die owing me money.' }
    },
    'trainerShadow': {
      'hello': { '1': 'You didn\'t hear me come up behind you. Most people don\'t.', '2': 'They call me the Whisper. I teach people how not to be seen.' },
      'fallen': { '1': 'Town\'s quieter now. Fewer guards. Easier work, for some of us.' },
      'friend': { '1': 'The Syndicate counts you as a friend. Friends pay less. Remember that.' },
      'foe': { '1': 'The Syndicate wants you dead. I was paid to teach, not to kill. So, lessons.' },
      'again': { '1': 'You\'re still too loud. We\'ll work on it.' },
      'train': { '1': 'Quietly, then. Watch my feet, not my hands.' },
      'class': {
        'say': 'What is a Shadowblade?',
        '1': 'Someone who\'s already behind you. In, one cut, and gone.',
        '2': 'Dexterity matters most. Skill, if you want the cut to count.'
      },
      'ready': {
        'strong': { '1': 'You move well now. Take the rest. Bring some Skill for the smoke.' },
        'able': { '1': 'Your hands are quick enough. Next step.' },
        'weak': { '1': 'Not yet. You\'re heavy on your feet. Work on your Dexterity.' }
      },
      'syndicate': { 'say': 'Who are the Ashen Syndicate?', '1': 'People who noticed the law has a price. I don\'t judge. I just get paid.' },
      'trainBack': { '1': 'Now practise where nobody can see you.' },
      'bye': { '1': 'You never saw me.' }
    },
    'trainerSovereign': {
      'hello': { '1': 'You may come closer. That\'s close enough.', '2': 'Lord Castellan, of Oakhaven\'s oldest family. I teach command.' },
      'saved': { '1': 'My town stands, and my family\'s name with it. You have my thanks. Truly.' },
      'friend': { '1': 'A friend of the Order. I\'ll lower my fee. Please don\'t spread that around.' },
      'foe': { '1': 'The Order has your name on a list. I\'ll teach you anyway. Coin is coin.' },
      'again': { '1': 'Ah, you again. Shall we continue?' },
      'train': { '1': 'Very well. Watch how an order is given, and how it\'s followed.' },
      'class': {
        'say': 'What is a Grand Sovereign?',
        '1': 'Someone who doesn\'t fight alone. You call guards, and they fight for you.',
        '2': 'It takes Charisma. Nobody follows a leader they can\'t hear.'
      },
      'ready': {
        'strong': { '1': 'You have real presence now. Take the rest of my lessons.' },
        'able': { '1': 'Your voice carries. You\'re ready for the next lesson.' },
        'weak': { '1': 'I\'m afraid no one would follow you yet. Work on your Charisma.' }
      },
      'family': { 'say': 'Tell me about your family.', '1': 'We built the walls Captain Hale stands on. He forgets that. I remind him.' },
      'trainBack': { '1': 'Go on, then. Lead someone.' },
      'bye': { '1': 'Good day to you.' }
    },
    'oakHealer': {
      'hello': { '1': 'Next! Oh, you\'re walking. That makes a nice change.', '2': 'Brother Fenn. Forty wounded on the wall, and only one of me.' },
      'saved': { '1': 'No new wounded in three days. I barely know what to do with myself.' },
      'again': { '1': 'You again, and on your own two feet. Good.' },
      'heal': { '1': 'Lie down here, the clean cot. There. Flasks filled, off you go.' },
      'mana': { '1': 'Mana draught. Tastes like old coins, but it works.' },
      'potions': { 'say': 'Can I carry more potions?', '1': 'With a longer belt, yes. I sell those. Filling the flasks is free.' },
      'rumor': {
        'archers': { '1': 'Krag\'s archers aim low. Keep moving and they\'ll mostly miss.' },
        'north': { '1': 'I\'m seeing burns, frostbite, and one man who swears a statue bit him.' }
      },
      'healBack': { '1': 'Off you go. Next time, come for a chat instead of stitches.' },
      'bye': { '1': 'Take care. And eat something.' }
    },
    'blackMarket': {
      'hello': { '1': 'No names here. But I know who opened the gate. Everyone does.', '2': 'You can call me the Fence. Everything here came from somewhere.' },
      'foe': { '1': 'The Syndicate isn\'t fond of you right now. Your gold, though, is welcome.' },
      'again': { '1': 'Back again. Nobody followed you, I hope?' },
      'trade': { '1': 'No questions either way. The Syndicate takes its cut, you take the goods.' },
      'who': { '1': 'Before the fire I sold candles. Honest work. It didn\'t pay.' },
      'armor': { 'say': 'Any armour for sale?', '1': 'The armourers are gone, friend. You\'d know why better than me.' },
      'rumor': {
        'citadel': { '1': 'A fortress turned up in the far north last year. Nobody built it.' },
        'crystals': { '1': 'Someone\'s buying every void crystal they can find. Not us. That worries me.' }
      },
      'shopBack': { '1': 'You were never here.' },
      'bye': { '1': 'Watch your step. The rubble shifts.' }
    },
    'trainerBlood': {
      'hello': { '1': 'A visitor. Please don\'t touch the jars.', '2': 'Doctor Sangrel. Oakhaven\'s new owners don\'t ask what I teach. It\'s restful.' },
      'found': { '1': 'You found me. Not many come looking for a doctor in a place like this.', '2': 'Doctor Sangrel. Towns burn people like me, so I work where there aren\'t any.' },
      'friend': { '1': 'The Syndicate speaks for you. I charge its friends less. My standards stay the same.' },
      'foe': { '1': 'The Syndicate would pay well for your blood. I\'d rather you spent it here.' },
      'again': { '1': 'You look pale. Good. It suits the work.' },
      'train': { '1': 'Roll up your sleeve. It will hurt. That\'s rather the point.' },
      'class': {
        'say': 'What is a Blood Alchemist?',
        '1': 'You pay for power with your own health, then take it back from your enemies.',
        '2': 'Endurance is what you have to spend. Intelligence is how well you spend it.'
      },
      'ready': {
        'strong': { '1': 'A remarkable constitution. You may learn nearly all of it.' },
        'able': { '1': 'You\'re sturdy enough for the next lesson.' },
        'weak': { '1': 'You\'d faint at the first cut. Build your Endurance first, please.' }
      },
      'jars': { 'say': 'What\'s in the jars?', '1': 'Samples. Freely given, for the most part.' },
      'trainBack': { '1': 'Do keep notes. I\'d like to hear how it goes.' },
      'bye': { '1': 'Stay healthy. I mean that.' }
    },
    'syndicateBoss': {
      'hello': { '1': 'So you\'re the one who opened the gate. Sit down. You\'ve earned a chair.', '2': 'They call me Madam Ash. Oakhaven is ours now. Partly thanks to you.' },
      'throneOurs': { '1': 'The Dread Fortress, in our hands. You were worth every coin.' },
      'throneLost': { '1': 'You gave the throne to someone else. We\'ll talk about that. Not today.' },
      'foe': { '1': 'You\'ve been working against us. Sit anyway. I like to know who I\'m dealing with.' },
      'again': { '1': 'Back again. What can the Syndicate do for you?' },
      'cut': {
        'say': 'I was promised a share of Oakhaven.',
        '1': 'And you\'ll have it. A share of a ruin, for now. Here\'s this season\'s.',
        '2': 'It\'ll grow. A ruin pays very well when you own its only market.'
      },
      'syndicate': {
        'say': 'What does the Syndicate actually want?',
        '1': 'What everyone wants. We just don\'t pretend otherwise.',
        '2': 'Stay friendly, and the Whisper and the Doctor will charge you less.'
      },
      'order': { 'say': 'The Iron Order is after me.', '1': 'Of course they are. You burned one of their towns. Carry extra potions.' },
      'rumor': {
        'core': { '1': 'The dwarves found something in their mines. A core. Bring it to us and name your price.' },
        'sold': { '1': 'The core arrived safely. You\'d be amazed what it does to a lock.' },
        'north': { '1': 'Everything worth having has moved north. So have we.' }
      },
      'bye': { '1': 'Don\'t be a stranger. We keep an eye on strangers.' }
    },

    // ── Ironhold ──
    'forgemaster': {
      'hello': { '1': 'You came up through the mines. I can smell the dust on you.', '2': 'Dorn. Forgemaster of Ironhold. And I\'ve got a problem the size of a mountain.' },
      'destroyed': { '1': 'The light\'s out and the golems are scrap. My miners sang last night. First time in a year.' },
      'studied': { '1': 'Blue fire in my forges and robed scholars in my halls. The work is good, at least.' },
      'sold': { '1': 'You sold it. The golems still walk, and my mines are still a grave. Leave me be.' },
      'ending': { '1': 'So the throne\'s settled. Good. Maybe now we can get back to digging.' },
      'again': { '1': 'What is it? The forge won\'t wait.' },
      'quest': {
        'say': 'What happened down in the mines?',
        '1': 'We dug for iron and found a heart. An aether core. You can feel it beating.',
        '2': 'And the golems?',
        '3': 'They move to its rhythm. Three powers have written asking for it. I trust none of them.',
        '4': 'You\'ll reach it first, at the bottom of the Ironhold Mines. What happens then is up to you.'
      },
      'core': {
        'say': 'About the core...',
        'destroy': { '1': 'You broke a wonder to save my people. The Order sent armourers. I sent ale.' },
        'study': { '1': 'The Circle\'s people are odd, but their guns shoot straight. Fair enough.' },
        'sell': { '1': 'You did it for gold. I hope it keeps you warm.' }
      },
      'town': {
        'say': 'Tell me about Ironhold.',
        '1': 'The best steel in the realm, when the mines are working.',
        '2': 'Stonefoot teaches earth, Pim teaches machines. Both will talk your ear off.'
      },
      'rumor': {
        'tundra': { '1': 'East of the Crags the land turns white. Frostbite Tundra. Giants, and worse.' },
        'citadel': { '1': 'My scouts saw a fortress up north that wasn\'t there last year. I don\'t like that.' },
        'fortress': { '1': 'It all ends at the Dread Fortress. Every road north leads there.' }
      },
      'bye': { '1': 'Go well.' }
    },
    'ironWeapons': {
      'hello': { '1': 'Careful with the display. Those are sharp on both edges.', '2': 'Hilda Hammerhand. Every piece here was forged by dwarven hands.' },
      'dragon': { '1': 'You killed the dragon? I hope it was with one of my blades.' },
      'again': { '1': 'Back for proper steel?' },
      'trade': { '1': 'Dwarf-forged. If one of these breaks, I\'ll want to know how.' },
      'who': { '1': 'My mother forged for kings. I forge for whoever comes through the door.' },
      'rumor': {
        'golems': { '1': 'Those golems down there are made of our own iron. It stings, I\'ll tell you.' },
        'arm': { '1': 'A good blade does half the work. Your Strength has to do the rest.' }
      },
      'shopBack': { '1': 'Bring it back blunt and I\'ll know you\'ve used it well.' },
      'bye': { '1': 'Strike hard.' }
    },
    'ironAetherWorks': {
      'hello': { '1': 'Careful, that one\'s loaded. Most of them are, actually.', '2': 'Tinker Voss. The Circle sent me to study the core. It\'s taught us so much.' },
      'again': { '1': 'Ah, good. I\'ve made a few changes since you were here.' },
      'trade': { '1': 'Everything here came out of studying the core. Just don\'t point it at me.' },
      'core': { 'say': 'What did the core teach you?', '1': 'That metal can think, a little. I try not to dwell on that.' },
      'rumor': { 'heat': { '1': 'Guns run on Skill, and they run hot. Ask Pim about heat before you burn a hand.' } },
      'shopBack': { '1': 'Let me know how it handles. I\'m keeping notes.' },
      'bye': { '1': 'Mind the recoil.' }
    },
    'ironArmor': {
      'hello': { '1': 'Garrun. Armour on the racks, rings in the tray.' },
      'again': { '1': 'Back. What do you need?' },
      'trade': { '1': 'That plate will turn a giant\'s club. Have a look.' },
      'quiet': { 'say': 'You don\'t say much, do you?', '1': 'Not much worth saying.' },
      'rumor': {
        'giants': { '1': 'Giants in the tundra. Clubs like tree trunks. I\'d take the heavy plate.' },
        'demons': { '1': 'Demons up north. Fire and claws. I\'d take the heavy plate.' }
      },
      'shopBack': { '1': 'Good choice.' },
      'bye': { '1': 'Take care.' }
    },
    'ironOrderArmor': {
      'hello': { '1': 'You\'re the one who destroyed the core. The Order remembers that.', '2': 'I\'m the Order\'s quartermaster here. Our armouries are open to you.' },
      'throneOurs': { '1': 'The Order holds the Dread Fortress, thanks to you. At ease. You\'ve earned it.' },
      'foe': { '1': 'The Order has you on a list. My orders say to sell to you anyway. I\'ll follow them.' },
      'again': { '1': 'What do you need?' },
      'trade': { '1': 'Take what you need. The Order looks after its own.' },
      'order': { 'say': 'What does the Order want from me?', '1': 'Nothing, for now. That doesn\'t happen often. Enjoy it.' },
      'rumor': { 'throne': { '1': 'The Order will want the throne in the Dread Fortress. It\'ll remember who helped.' } },
      'shopBack': { '1': 'Look after it. It\'s Order property until you\'ve bled in it.' },
      'bye': { '1': 'Carry on.' }
    },
    'trainerGeo': {
      'hello': { '1': 'Slow down. The mountain isn\'t going anywhere.', '2': 'They call me Old Stonefoot. I listen to the ground. Sometimes it answers.' },
      'core': { '1': 'The mountain feels different since you went down there. Calmer, or emptier.' },
      'dragon': { '1': 'A dragon flew over the peak yesterday and left us alone. Your doing, I\'m told.' },
      'again': { '1': 'There you are. I thought you\'d be back.' },
      'train': { '1': 'Plant your feet. Feel that? No? That\'s where we start.' },
      'class': {
        'say': 'What does a Geomancer do?',
        '1': 'We raise walls, call up spikes, and break the ground when we have to.',
        '2': 'Strength to move the stone. Intelligence to know where it wants to go.'
      },
      'ready': {
        'strong': { '1': 'The stone knows you now. Learn the rest when you\'re ready.' },
        'able': { '1': 'You\'re steady enough for the next lesson.' },
        'weak': { '1': 'Not yet. The stone won\'t move for you. Build your Strength.' }
      },
      'factions': { 'say': 'Which faction do you serve?', '1': 'None of them. Orders and guilds come and go. The mountain stays.' },
      'trainBack': { '1': 'Take your time with it. The ground\'s patient.' },
      'bye': { '1': 'Walk softly.' }
    },
    'trainerAether': {
      'hello': { '1': 'Ah, wait, don\'t touch that! Or that. Stand on the rug, the rug\'s safe.', '2': 'Gearwright Pim. I build guns, turrets, and a lot of heat gauges.' },
      'core': { '1': 'You gave the core to the Circle! I\'ve hardly slept since. In a good way.' },
      'oracle': { '1': 'The Circle\'s angry about the oracle. I just build things. I\'d rather not get involved.' },
      'friend': { '1': 'You\'re a friend of the Circle, so your lessons are cheaper. I did the paperwork.' },
      'foe': { '1': 'The Circle says I shouldn\'t teach you. I\'m going to anyway. Don\'t tell them.' },
      'again': { '1': 'Oh good, you\'ve still got all your fingers.' },
      'train': { '1': 'Right. Safety first, then the loud part.' },
      'class': {
        'say': 'What is an Aether-Tech?',
        '1': 'Guns, turrets, and a heat gauge. Shoot, build, and vent before you lock up.',
        '2': 'Mostly it\'s Skill. A bit of Intelligence for the bigger machines.'
      },
      'ready': {
        'strong': { '1': 'You know your way around a turret now. Take the big machines.' },
        'able': { '1': 'Steady hands. You\'re ready for the next one.' },
        'weak': { '1': 'Your aim\'s a bit shaky still. Put some points into Skill.' }
      },
      'heat': { 'say': 'What happens if I overheat?', '1': 'Everything locks up for a few seconds. Vent early, vent often. Trust me on that.' },
      'trainBack': { '1': 'And remember to vent the heat before it vents you.' },
      'bye': { '1': 'Be careful out there!' }
    },
    'ironHealer': {
      'hello': { '1': 'Boots off at the door, please. I\'ve only just swept.', '2': 'Mother Brynja. I\'ve set most of the broken bones in this mountain.' },
      'ending': { '1': 'You went to the Dread Fortress and came back. Sit down. Let me look at you.' },
      'again': { '1': 'Still alive. Good. Sit.' },
      'heal': { '1': 'Drink this, and don\'t make that face. Your flasks are full.' },
      'mana': { '1': 'Here. It tastes awful. Drink it when your magic runs out, not before.' },
      'potions': { 'say': 'Can I carry more potions?', '1': 'I can sell you a longer belt. Five flasks is about all anyone can carry and still run.' },
      'rumor': {
        'tundra': { '1': 'The tundra takes fingers and toes. Keep moving, and don\'t fall asleep in the snow.' },
        'temple': { '1': 'There\'s a drowned temple past the tundra. The naga there don\'t take prisoners.' },
        'rift': { '1': 'Whatever\'s in that rift, I can\'t stitch it. Don\'t let it reach you.' }
      },
      'healBack': { '1': 'Off you go. And eat something, you\'re too thin.' },
      'bye': { '1': 'Come back in one piece.' }
    },
    'exiledSovereign': {
      'hello': { '1': 'You. You\'re the one who opened my gate.', '2': 'I teach in a cellar now, because I have to eat. Don\'t take it for forgiveness.' },
      'ending': { '1': 'So the throne\'s decided, and Oakhaven is still ashes. I hope it was worth it.' },
      'again': { '1': 'You\'re back. My fee hasn\'t changed.' },
      'train': { '1': 'I\'ll teach you to command. Whether you deserve it is another matter.' },
      'class': {
        'say': 'What is a Grand Sovereign?',
        '1': 'Someone others follow. Guards come when you call and fight at your word.',
        '2': 'It runs on Charisma. You have some. That\'s what makes it hard to forgive.'
      },
      'ready': {
        'strong': { '1': 'You have the presence for all of it. I wish you\'d used it better.' },
        'able': { '1': 'You\'re ready for the next lesson. I won\'t pretend I\'m glad.' },
        'weak': { '1': 'No one would follow you yet. Work on your Charisma.' }
      },
      'oakhaven': {
        'say': 'About Oakhaven...',
        '1': 'Three hundred years. My family built those walls.',
        '2': 'Please don\'t explain. Nothing you could say would make it right.'
      },
      'trainBack': { '1': 'Go. Practise on someone else.' },
      'bye': { '1': 'Leave me, please.' }
    },
    'trainerChrono': {
      'fled': { '1': 'You killed her. I saw it coming for years, and it still hurts.', '2': 'I\'m the Keeper of Hours. I\'ll teach you. She told me I would.' },
      'hello': { '1': 'There you are. I\'ve been expecting you for a while. Or will have been.', '2': 'I\'m the Keeper of Hours. I teach how to bend time, a little.' },
      'freed': { '1': 'She\'s free. For once I can\'t tell what happens next. It\'s wonderful.' },
      'friend': { '1': 'The Circle thinks well of you, so the lessons cost less. They decided that last week.' },
      'foe': { '1': 'The Circle\'s angry with you now. It passes. Until then, we\'ll keep this quiet.' },
      'again': { '1': 'Welcome back. You\'re right on time.' },
      'train': { '1': 'Watch closely. Then watch again, a moment earlier.' },
      'class': {
        'say': 'What is a Chrono-Weaver?',
        '1': 'We hold a foe still in time, hurry a friend along, and take back a mistake.',
        '2': 'Intelligence to see the thread. Skill to pull it.'
      },
      'ready': {
        'strong': { '1': 'You hold the thread well. Take the rest whenever you like.' },
        'able': { '1': 'You\'re ready. I could tell before you asked.' },
        'weak': { '1': 'The thread keeps slipping. More Intelligence, and more Skill.' }
      },
      'oracle': {
        'say': 'Tell me about the oracle.',
        'freed': { '1': 'She saw every ending except her own. Now she gets to find out.' },
        'slain': { '1': 'She didn\'t fight it. She\'d seen it already. Please don\'t ask me again.' },
        'waits': { '1': 'She sees every ending. It\'s a heavy thing to carry. Be kind to her.' }
      },
      'trainBack': { '1': 'It\'ll make sense later. It usually does.' },
      'bye': { '1': 'Until we meet again. Or before.' }
    },

    // ── The six decisions ──
    // `ask` is put by whoever the fight left standing; `say` is the hero's
    // answer (the choice); the numbered lines after it tell what follows.
    'quest': {
      'goblinKing': {
        'ask': { '1': 'Stop. Please. I yield.', '2': 'My people raid because they are hungry. That is the truth.', '3': 'Let us make a deal instead. Your kind and mine.' },
        'slay': {
          'say': 'No deals. Your raids end here.',
          '1': 'The Goblin King falls, and the Hollows empty.',
          '2': 'Sunford sleeps easier, and the Iron Order hears your name.'
        },
        'pact': {
          'say': 'Stop the raids and trade with Sunford instead. Swear to it.',
          '1': 'Trade. Yes. I swear it, on my crown.',
          '2': 'Goblin traders set up in Sunford\'s square, selling things no smith there could make.'
        },
        'ransom': {
          'say': 'Give me your treasure and you can keep your crown.',
          '1': 'All of it? ...Fine. Take it, and go.',
          '2': 'You leave with goblin gold. The raids will start again, but the Syndicate approves.'
        }
      },
      'siege': {
        'ask': { '1': 'Enough. You fight well, I\'ll give you that.', '2': 'The Syndicate pays far better than that town ever will.', '3': 'Open the gate for us tonight, and a third of Oakhaven is yours.' },
        'defend': {
          'say': 'The gate stays shut. Take your army and go.',
          '1': 'Then the Syndicate will hunt you on every road. Remember I offered.',
          '2': 'The gate holds. Oakhaven grows rich behind it, and its armourers remember your name.'
        },
        'betray': {
          'say': 'A third of the town. All right. The gate opens tonight.',
          '1': 'Sensible. Madam Ash will be pleased to hear it.',
          '2': 'Oakhaven burns. In the ruins, a black market opens, and an alchemist teaches in secret.',
          '3': 'The armourers are gone, and the Iron Order calls you a traitor.'
        }
      },
      'core': {
        'ask': { '1': 'The Colossus is scrap. I never thought I\'d live to see it.', '2': 'And there\'s the core. Still humming. It\'s warm, if you touch it.', '3': 'You got here first. So... what happens to it?' },
        'destroy': {
          'say': 'Stand back. I\'m going to break it.',
          '1': 'The light goes out, and the golems drop where they stand.',
          '2': 'In thanks, the Iron Order sends its own armourers to Ironhold.'
        },
        'study': {
          'say': 'The Circle should study it. I think I can carry it out safely.',
          '1': 'You know enough to move the core without waking it.',
          '2': 'Within a season, Ironhold\'s forges are making aether-works no one has seen before.'
        },
        'sell': {
          'say': 'The Syndicate made the best offer.',
          '1': 'Gold. For the thing that killed my miners. Take it and go.',
          '2': 'A fortune changes hands. The core stays lit, and the mines will never be quiet again.'
        }
      },
      'oracle': {
        'ask': { '1': 'I\'ve seen this moment more times than I can count.', '2': 'In half of them, you set me free. In the other half, you take what I guard.', '3': 'Choose. I\'d like, just once, not to know what comes next.' },
        'free': {
          'say': 'Hold still. I\'m breaking your chains.',
          '1': 'Oh. I didn\'t see that. I really didn\'t see that.',
          '2': 'The oracle rises through the water and is gone. Her pupil stays behind to teach.'
        },
        'slay': {
          'say': 'I came for the hourglass.',
          '1': 'Yes. This is the other half.',
          '2': 'She doesn\'t resist. The Timekeeper\'s Hourglass is yours.',
          '3': 'Her last pupil flees the temple, and the Circle won\'t forgive you.'
        }
      },
      'dragon': {
        'ask': { '1': 'Enough. You have teeth, little one.', '2': 'The demon in the fortress chained my kin. I want to see him burn.', '3': 'Kill me, or let me help you do it.' },
        'slay': {
          'say': 'I don\'t bargain with dragons.',
          '1': 'The mountain shakes as the dragon falls. Its hoard is yours.',
          '2': 'The Iron Order sings of the dragonslayer.'
        },
        'pact': {
          'say': 'Then fight with me against the Arch-Demon.',
          '1': 'Few would dare ask. Very well. We hunt together.',
          '2': 'When you march on the Dread Fortress, a dragon will fly above you.'
        }
      },
      'throne': {
        'ask': { '1': 'So. It ends. I didn\'t think it would be you.', '2': 'My throne won\'t stay empty. Whoever takes it commands the fortress and the rift.', '3': 'Three envoys are already waiting at my door. Choose who comes next.' },
        'order': {
          'say': 'The Iron Order will hold it.',
          '1': 'The Order garrisons the fortress and seals what it can.',
          '2': 'The realm will be safe, and it will be told what to do.'
        },
        'syndicate': {
          'say': 'The Ashen Syndicate has earned it.',
          '1': 'The Syndicate moves in before dawn.',
          '2': 'From now on everything has a price, even the peace.'
        },
        'circle': {
          'say': 'Let the Circle of Aether have it.',
          '1': 'The Circle turns the fortress into a school above the rift.',
          '2': 'They call it research. Everyone else holds their breath.'
        },
        'shatter': {
          'say': 'No one gets it. I\'m breaking it.',
          '1': 'You break the throne with your own hands. No one will rule from here again.',
          '2': 'The envoys leave without a word.'
        },
        'claim': {
          'say': 'I\'ll take it myself.',
          '1': 'The throne is cold, and it fits.',
          '2': 'Three factions discover they have a common enemy.'
        }
      }
    },
    'bark': {
      'goblinKing': {
        'charge': {
          '1': 'Run them down, Tusker!'
        },
        'horn': {
          '1': 'To me, lads! Goblins, to me!'
        },
        'dismount': {
          '1': 'Go on, Tusker, run! I\'ll finish this myself!'
        },
        'return': {
          '1': 'Tusker! One more time!'
        }
      },
      'dragon': {
        'takeoff': {
          '1': 'Enough. Let the sky burn you.'
        },
        'flight2': {
          '1': 'I am not finished with you!'
        }
      },
      'archDemon': {
        'gate': {
          '1': 'The gate is open. No one leaves.'
        },
        'dive': {
          '1': 'Kneel.'
        }
      },
      'frostJarl': {
        'hammer': {
          '1': 'Stand still, little one.'
        },
        'iceBreak': {
          '1': 'The lake will swallow you!'
        }
      }
    }
  },

  // ─── Enemies and allies ───────────────────────────────────────────────────
  'enemy': {
    'trainingDummy': 'Training Dummy',
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
    'syndicateBlade': 'Syndicate Blade',
    'goblinWarchief': 'Goblin Warchief',
    'thornfather': 'Thornfather',
    'broodMother': 'Brood Mother',
    'banditBaron': 'Bandit Baron',
    'cinderGolem': 'Cinder Golem',
    'frostHowler': 'Frost Howler',
    'tideSerpent': 'Tide Serpent',
    'riftKnight': 'Rift Knight',
    'wyvernMatriarch': 'Wyvern Matriarch',
    'tusker': 'Tusker, the War Boar',
    'tuskerCameo': 'Tusker',
    'goblinTyrant': 'Goblin Tyrant',
    'voidDrake': 'Void Drake',
    'pitLord': 'Pit Lord',
    'frostThane': 'Frost Thane'
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
    'bosses': 'Bosses',
    'mastery': 'Zone mastery',
    'masteryPct': '{n}%',
    'newBest': 'New best!',
    'time': 'Time',
    'unlocked': 'New on the map: {places}',
    'equipped': 'Equipped',
    'better': 'Better than what you wear',
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
      'elixir': 'Drink elixir',
      'elixirNext': 'Next elixir',
      'leave': 'Leave a won zone',
      'interact': 'Talk',
      'target': 'Next target',
      'map': 'World map',
      'character': 'Hero',
      'inventory': 'Bag',
      'skills': 'Skills',
      'roll': 'Dodge roll'
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
  // ─── Forced dark mode notice ──────────────────────────────────────────────
  // Shown while a dark-mode extension or the browser's forced dark mode repaints
  // the page. `{flagUrl}` is a browser-internal URL (chrome://flags/…): never
  // translate it. Product and setting names ("Dark Reader", "Auto Dark Mode for
  // Web Contents") stay in English, which is how the player's browser shows them.
  'forcedDark': {
    'title': 'Please turn off dark mode for this game',
    'body': 'Your browser or an extension is recolouring this page. The game has its own colours and doesn\'t work with dark-mode overrides.',
    'waiting': 'The game continues automatically as soon as it\'s off.',
    'continueAnyway': 'Continue at own risk',
    'hint': {
      'darkReader': 'Dark Reader: click its icon and switch it off for this site.',
      'extension': 'Open your dark-mode extension and turn it off for this site.',
      'chromiumFlag': 'Open {flagUrl} and set "Auto Dark Mode for Web Contents" to Default, or turn off "dark theme for sites" in your browser\'s theme settings.',
      'samsung': 'Samsung Internet: open the menu and turn off Dark mode, or turn on Labs → "Use website dark theme".',
      'forcedColors': 'Windows: turn off Contrast themes in Settings → Accessibility → Contrast themes.',
      'firefoxColors': 'Firefox: Settings → Colors → set "Override the colors specified by the page" to Never.'
    }
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
  },
  'wind': {
    'title': 'Second wind',
    'text': 'You fell. Get back up with {n}% of your health and finish the fight?',
    'once': 'Once per visit.',
    'watch': 'Watch a video',
    'take': 'Get back up',
    'decline': 'No thanks'
  },
  'purse': {
    'offer': 'Triple the purse: +{n}'
  },
  'shelf': {
    'title': 'Rare wares',
    'restock': 'New wares',
    'tomorrow': 'New wares tomorrow'
  },
  'rested': {
    'hud': '2× XP',
    'banner': 'Welcome back! You are rested: {time} of double XP in your next fights.',
    'hm': '{h} h {m} min',
    'h': '{h} h',
    'm': '{m} min'
  },
  'preset': {
    'title': 'Builds',
    'name': 'Build {n}',
    'rename': 'Name of build {n}',
    'save': 'Save',
    'load': 'Use',
    'saved': '{name} saved.',
    'loaded': '{name} is on.',
    'skipped': 'Left out: {list}'
  },
  'respec': {
    'title': 'Forget your training',
    'note': 'Get back all {n} attribute points you spent, and spend them again.',
    'none': 'You have no points to take back yet.',
    'free': 'Forget (free)',
    'buy': 'Forget ({n} gold)',
    'confirm': 'Sure? Tap again',
    'bench': 'These skills go back on the shelf: {list}',
    'done': 'There. Your points are yours to spend again.'
  },
  'forge': {
    'upgrade': 'Upgrade ({n} gold)',
    'max': 'Fully upgraded: +{n}.',
    'town': 'Any town\'s smith can upgrade this.'
  },
  // ─── The town square's notice board (roadmap #85) ─────────────────────────
  'board': {
    'title': '{town} notice board',
    'read': 'Read',
    'lead': 'Today\'s tasks. Hand them in here when they are done.',
    'kind': { 'slay': 'Hunt', 'gather': 'Herbs', 'escort': 'Caravan' },
    'slay': 'Defeat {n} × {enemy} in {place}',
    'gather': 'Bring {n} × {plant}',
    'escort': 'Guard the caravan on the road to Oakhaven',
    'xp': '+{n} XP',
    'setOut': 'Set out',
    'thanks': 'Done! The town thanks you.'
  },
  // ─── The caravan on the road (roadmap #85) ────────────────────────────────
  'escort': {
    'start': 'Guard the caravan to the end of the road!',
    'waiting': 'The caravan waits for you.',
    'arrived': 'The caravan made it!',
    'lost': 'The caravan is lost…'
  },
  // ─── The journal (roadmap #85, #86, #89): errands and how far they are ────
  'journal': {
    'errands': 'Errands',
    'empty': 'Nothing in your journal yet. People in town will ask for your help.',
    'from': 'For {npc}',
    'ready': 'Done! Go back to {npc}.',
    'taken': 'New errand: {title}',
    'done': 'Errand done: {title}',
    'step': {
      'slay': 'Defeat {n} × {enemy}',
      'slayAt': 'Defeat {n} × {enemy} in {place}',
      'slayAnyAt': 'Defeat {n} enemies in {place}',
      'clear': 'Clear {place}',
      'visit': 'Go to {place}',
      'gather': 'Gather {n} × {plant}',
      'bring': 'Bring {item}',
      'pieces': 'Find {n} pieces of the treasure map',
      'dig': 'Dig for the treasure in {place}',
      'talk': 'Talk to {npc}'
    }
  },
  'contract': {
    'title': 'Contract board',
    'lead': 'Each faction posts one job a day. They count as you play; hand them in at any town.',
    'slay': 'Defeat {enemy} in {place}',
    'clear': 'Win a visit to {place}',
    'chests': 'Open chests anywhere',
    'rep': '+1 standing',
    'handIn': 'Hand in',
    'handed': 'Done for today',
    'thanks': '{name} thanks you.'
  },
  'rep': {
    'title': 'Standing',
    'meter': '{name}: standing {n}',
    'giftAt': 'Gift at +{n}',
    'giftClaim': 'Collect gift',
    'giftTaken': 'Gift collected',
    'giftGot': 'A gift for you: 300 gold and {item}.',
    'giftGold': 'A gift for you: 300 gold.',
    'blessAt': 'Blessing at +{n}',
    'bless': {
      'order': 'Blessed: +5% health',
      'syndicate': 'Blessed: +10% gold from kills',
      'circle': 'Blessed: +10% mana regeneration'
    }
  },
  'ladder': {
    'tab': 'Colosseum',
    'wave': 'Wave',
    'week': 'This week: {mod}',
    'weekBest': 'Best this week: wave {n}',
    'yourBest': 'Your best this week: wave {n}',
    'none': 'No climb this week yet.',
    'mod': {
      'fire': 'All fire',
      'nopotions': 'No potions',
      'glass': 'Glass',
      'swarm': 'Swarm',
      'elites': 'Elite parade',
      'haste': 'Haste'
    },
    'modDesc': {
      'fire': 'every enemy blow is fire',
      'nopotions': 'no potions',
      'glass': 'everyone hits 50% harder',
      'swarm': 'more enemies, less health each',
      'elites': 'a champion in every wave',
      'haste': 'enemies move and strike faster'
    }
  }
}
