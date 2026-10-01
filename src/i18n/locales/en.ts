// English source bundle. Single source of truth for translation keys — every
// new player-facing string gets a key here first; the per-language files in
// this folder mirror the shape. Vite ships each non-English locale as its own
// lazy chunk (see `src/i18n/index.ts`).
export default {
  'gameName': 'Mega Droid',
  'cancel': 'Cancel',
  'close': 'Close',
  'ok': 'Ok',
  'continue': 'Continue',
  'tapToContinue': 'Tap to continue',
  'clickToContinue': 'Click to continue',
  'rewards': 'REWARDS',
  'tip': 'Tip',
  'onlyAvailableOn': 'This game is only available on',

  // Accessible names for icon-only controls (read aloud, not seen).
  'ui': {
    'killcamCount': 'Kill-cams this mission: {n}',
    'killcamOff': 'Turn kill-cams off',
    'next': 'Next',
    'replay': 'Replay',
    'back': 'Back',
    'play': 'Play',
    'pause': 'Pause',
    'menu': 'Menu',
    'home': 'Home',
    'info': 'Info',
    'skip': 'Skip',
    // Beside the skip button: {key} is the space bar's name (pause.keys.space).
    'holdToSkip': 'Hold {key} to skip'
  },

  // ─── Combat call-outs (floating text in the 3D view) ─────────────────────
  // Short: they pop over enemies for under a second.
  'combat': {
    'tink': 'TINK!',
    'perfect': 'PERFECT!',
    'parry': 'PARRY!',
    'guardBreak': 'GUARD BREAK!',
    'guardCracked': 'Guard cracked!',
    'xp': '+{n} XP',
    'lastStand': 'Last Stand! Systems rebooted.',
    'weak': 'WEAK!',
    // A shot on a weak spot (a head, a back, a tail): a sound word, not
    // translated.
    'kranck': 'KRANCK!',
    'dizzy': 'DIZZY!',
    'dodge': 'DODGE!',
    'block': 'Block',
    'slide': 'Slide',
    'fire': 'Fire',
    'tank': 'Repair Gel',
    'noEnergy': 'Not enough weapon energy',
    // The gel button's accessible name: how many are carried, and the room.
    'tankCount': 'Repair Gel: {n} of {max}',
    // The borrowed weapon's button (accessible name) and the pickup toast.
    'borrowed': 'Borrowed {weapon}: {n} of {max} shots',
    'borrowedGet': '{weapon} ×{n}'
  },

  // ─── Flux's speech bubble (FluxBubble.vue) ────────────────────────────────
  // A hard hit made him lose control of his charge (sim/fumble.ts): one
  // short, silly line from a friendly robot. Two lines at most on a phone.
  'flux': {
    'fumble': {
      '1': 'Whoa-oh!',
      '2': 'Bzzt! Oops!',
      '3': "My arm's got hiccups!",
      '4': 'Error… wheee!',
      '5': 'Butter circuits!',
      '6': 'Wobble mode ON!'
    }
  },

  // Enemy display names (target frame, bestiary, job board).
  'enemy': {
    'polar': 'Polar Pup',
    'hardhat': 'Hardhat',
    'trooper': 'Shield Trooper',
    'heli': 'Rotor Drone',
    'hopper': 'Stomper',
    'roller': 'Gear Roller',
    'brute': 'Guardroid',
    'turret': 'Wall Cannon',
    'golem': 'Crate Golem',
    'elite': 'Elite',
    'level': 'Lv {n}'
  },

  // Plural forms for counts ("Destroy 7 Gear Rollers"): singular | plural.
  'enemyPlural': {
    'polar': 'Polar Pup | Polar Pups',
    'hardhat': 'Hardhat | Hardhats',
    'trooper': 'Shield Trooper | Shield Troopers',
    'heli': 'Rotor Drone | Rotor Drones',
    'hopper': 'Stomper | Stompers',
    'roller': 'Gear Roller | Gear Rollers',
    'brute': 'Guardroid | Guardroids',
    'turret': 'Wall Cannon | Wall Cannons',
    'golem': 'Crate Golem | Crate Golems'
  },

  'hud': {
    'help': 'Show controls',
    'mute': 'Mute sound',
    'unmute': 'Unmute sound',
    'bossUnknown': 'Unknown boss',
    'hp': 'Health',
    'we': 'Weapon energy',
    'power': 'Power',
    'bolts': 'Bolts',
    'level': 'Lv {n}',
    'beamOut': 'Beam out'
  },

  'boss': {
    'magnetMaster': 'Magnet Master',
    'stand': 'Scrapper',
    'scrapper': 'Scrapper',
    'blazeMaster': 'Blaze Master',
    'frostMaster': 'Frost Master',
    'voltMaster': 'Volt Master',
    'galeMaster': 'Gale Master',
    'vexMk1': 'Dr. Vex Mk-I'
  },

  'sector': {
    'magnet': 'Polarity Works',
    'scrapyard': 'Scrapyard',
    'blaze': 'Blaze Refinery',
    'cryo': 'Cryo Plant',
    'volt': 'Volt Tower',
    'gale': 'Sky Docks',
    'fortress': 'Vex Fortress'
  },

  // ─── Missions ─────────────────────────────────────────────────────────────
  'quest': {
    'tutorial': 'Wake-Up Call',
    'boss': 'Core Master Showdown',
    'bossTitle': 'Showdown: {boss}',
    'kill': 'Scrap Duty',
    'collect': 'Data Recovery',
    'rescue': 'Rescue Op',
    'elite': 'Elite Hunt',
    'supply': 'Supply Run',
    'purge': 'Sector Purge',
    'climb': 'Tower Run',
    'stage': 'Platform Stage',
    'stageName': { 'blaze': 'Meltdown Descent', 'cryo': 'Glacier Run', 'volt': 'Rail Rush', 'gale': 'Sky Docks', 'magnet': 'Polarity Works' },
    'rematch': 'Rematch: {boss}',
    'desc': {
      'tutorial': 'Fight through the Scrapyard and take down the Scrapper.',
      'boss': 'Break into the core of {sector} and defeat {boss}.',
      'kill': 'Destroy {n} {target} in {sector}.',
      'collect': 'Recover {n} data cores scattered through {sector}.',
      'rescue': 'A worker-bot is stranded in {sector}. Find it and beam it out.',
      'elite': 'An elite {target} is terrorising {sector}. Hunt it down.',
      'supply': 'Crack open {n} supply chests in {sector}.',
      'purge': 'Destroy every machine in {sector}.',
      'climb': 'Climb the tower of {sector} — stairs, ladders, lifts and pits — then drop into the arena for a rematch with {boss}.',
      'stage': 'Run, slide and ride through {sector} — ledges, pits and machines — to the arena, then defeat {boss}.'
    }
  },
  'objective': {
    'title': 'Objective',
    'complete': 'Objective complete',
    'beamOutHint': 'Beam out when you are ready.',
    'tutorial': 'Defeat {boss}',
    'boss': 'Defeat {boss}',
    'kill': 'Destroy {target}: {n}/{total}',
    'collect': 'Data cores: {n}/{total}',
    'rescue': 'Find the stranded worker-bot',
    'elite': 'Hunt down the elite {target}',
    'supply': 'Supply chests: {n}/{total}',
    'purge': 'Machines destroyed: {n}/{total}',
    'climb': 'Climb the tower, defeat {boss}',
    'stage': 'Reach the arena, defeat {boss}'
  },
  'mission': {
    'bossDown': '{boss} destroyed!',
    'objectiveDone': 'Objective complete!',
    'rescued': 'Worker-bot beamed to safety!',
    'bossDoor': 'The shutter grinds open…'
  },
  'interact': {
    'chest': 'Open',
    'rescue': 'Rescue',
    'bossDoor': 'Enter'
  },
  'progress': {
    'levelUp': 'Level {n}! Systems fully repaired.'
  },
  // Screen-reader sentences behind the control coach's wordless glyphs
  // (ControlHints, ControlsPanel). Never drawn on screen.
  'tips': {
    'moveTouch': 'Drag the left side to move, the right side to look. Tap the floor to walk there!',
    'moveKeys': '{keys} to move around.',
    'lookMouse': 'Move the mouse to look around.',
    'capture': 'Click the scene to take control of the camera.',
    'fireTouch': 'Machines ahead! Tap to shoot — hold, then release for a charge shot.',
    'fireKeys': 'Machines ahead! Left click to shoot — hold, then release for a charge shot.',
    'charge': 'Shields block pellets. A FULL charge shot breaks right through.',
    'blockTouch': 'Orange ring: hold the shield to block — press it as the ring closes to PARRY!',
    'blockKeys': 'Orange ring: hold the right mouse button to block — press it as the ring closes to PARRY!',
    'red': 'Red ring means unblockable — slide out of the way!',
    'dodgeKeys': 'Red ring means unblockable — press {slide} to slide out of the way!',
    // The slide key as the sentence above speaks it (inflected where the
    // language needs it); a rebound key is spoken by its letter instead.
    'spaceKey': 'Space',
    'chest': 'A supply chest! Tap it to open.',
    'tank': 'Running low? Repair Gel fixes you up completely.',
    'weapon': 'Use your copied weapon from the colored button!'
  },
  // Screen-reader sentences behind the wordless scene lessons (LessonLayer).
  'lesson': {
    'charge': "Hold to charge your cannon, then let go: only a charged shot breaks the training drone's shield.",
    'crate': 'Supply crates only break to a charged shot. Hold, then let go at the glowing crate.',
    'weaponKeys': 'Press {n} to fire your copied weapon: one shot takes all three drones.',
    'weaponTouch': 'Tap the glowing weapon button: one shot takes all three drones.',
    'gelKeys': 'Press {key} to use a Repair Gel: it repairs you completely.',
    'gelTouch': 'Tap the green Repair Gel button: it repairs you completely.'
  },
  // The one line of the tutorial walk: shown at a door held shut until
  // its room's lesson is done (DoorPrompt).
  'walk': {
    'finishLessonOn': 'Finish the lesson on {weapon}',
    'finishTutorial': 'Finish the Tutorial first',
    'finishLesson': 'Finish the lesson'
  },
  // Screen-reader sentences behind the first-visit upgrade tour (HubLesson).
  'hubLesson': {
    'earnBolts': 'Not enough bolts? Watch a short video for a top-up.',
    'catchUp': "Pip: Your cannon is falling behind the machines out there. Let's upgrade it!",
    'workshop': 'Open the Workshop.',
    'upgradeBuster': 'Spend bolts to upgrade your cannon: more damage.',
    'pickArmor': 'Now select your chest armor.',
    'upgradeArmor': 'Upgrade it too: more defense.',
    'deploy': 'All set — back to the missions!'
  },
  'loot': {
    // The loot card's badge when a find beats what is equipped.
    'upgrade': 'Upgrade!',
    'found': '{rarity} {item} found!',
    'tank': 'Repair Gel found!',
    'giftTank': 'Gift: +1 Repair Gel!'
  },

  // ─── Results / defeat / pause ─────────────────────────────────────────────
  'results': {
    'success': 'MISSION COMPLETE',
    'failed': 'MISSION FAILED',
    'xp': 'Experience',
    'bolts': 'Bolts',
    'kills': 'Machines destroyed',
    'chests': 'Chests opened',
    'time': 'Time',
    'levelUp': 'Level up! Now level {n}',
    'newWeapon': 'New weapon: {weapon}!',
    'newSector': 'New sector unlocked: {sector}',
    'items': 'Gear found',
    'triple': 'Triple bolts',
    'tripleAria': 'Watch a short video: triple your bolts to +{n}'
  },
  'defeat': {
    'title': 'SYSTEM DOWN',
    'body': 'Flux took too much damage.',
    'kept': 'You keep what you earned so far:',
    'useTank': 'Reboot with Repair Gel ({n})',
    'rebootAd': 'Reboot now',
    'retreat': 'Retreat to the lab'
  },
  // ─── The big moment banners (`BigBanner.vue`) ─────────────────────────────
  // One line across the screen, uppercased by CSS in cased scripts, sized to
  // fit: short and loud, like an "ENEMY FELLED".
  'banner': {
    'cleared': 'Level cleared',
    'bossDown': 'Enemy defeated!',
    'gameOver': 'Game Over!'
  },
  'pause': {
    'title': 'PAUSED',
    'resume': 'Resume',
    'abandon': 'Abandon mission',
    'controls': 'Controls',
    // The controls legend's visible verbs (ControlsPanel), one per row beside
    // the action's icon; the other rows reuse `combat.*`, `hud.*`, `hero.*`.
    // Short: a row shares a 320 px wide phone with two glyphs, and wraps to
    // two lines at most.
    'label': {
      'move': 'Move',
      'look': 'Look',
      'parry': 'Parry',
      'interact': 'Interact'
    },
    'touch': {
      'move': 'Left side: drag to move. Tap the floor to walk there.',
      'fire': 'In combat: tap to shoot, hold to charge, release to fire.',
      'block': 'Hold the shield to block — just as a ring closes to parry.',
      'use': 'Near a chest, a stranded bot or a door: tap it, or the button that pops up.'
    },
    'keys': {
      'move': '{keys} / arrows: move.',
      'look': 'Move the mouse to look. Click the scene to take control of the camera.',
      'fire': 'Left click: shoot — hold to charge, release to fire.',
      'block': 'Right click: block — just as a ring closes to parry.',
      'slide': '{slide}: slide · {tank}: Repair Gel · {use}: interact · {beam}: beam out',
      'more': '{w1} / {w2}: special weapons · {target}: switch target · Esc: pause',
      // The space bar's name, spoken where the slide key is still Space.
      'space': 'Space',
      // A one-key row, read aloud: "H: Repair Gel". `{key}` is the key's
      // letter on this keyboard, `{action}` the row's visible label.
      'press': '{key}: {action}'
    }
  },
  'levelUp': {
    'title': 'LEVEL UP!',
    'pick': 'Choose a system upgrade',
    'chip': '+1 Skill Chip for your circuits',
    'granted': '{stat} raised from {from} to {to}'
  },
  'attr': {
    'hp': { 'name': 'Frame', 'desc': 'Max health' },
    'we': { 'name': 'Reactor', 'desc': 'Weapon energy' },
    'power': { 'name': 'Servos', 'desc': 'Block & slide power' }
  },

  // ─── Hub ──────────────────────────────────────────────────────────────────
  'hub': {
    'tab': {
      'missions': 'Missions',
      'hero': 'Flux',
      'circuits': 'Circuits',
      'workshop': 'Workshop'
    },
    // The hero tab's spoken name. Its visible label is the name alone, and
    // "flux" is also a word, so the label says who he is.
    'heroTabAria': 'Flux, your combat android',
    'levelUpReady': 'Level up!',
    'levels': 'Lv {a}–{b}',
    'story': 'Story mission',
    'jobs': 'Jobs',
    'jobsHint': 'Repeatable — new ones arrive as you finish them',
    'lockedHint': 'Defeat {boss} to open this sector.',
    'sectorSecured': 'Sector secured. Its jobs are still on the board.',
    'deploy': 'Deploy',
    'reroll': 'New job',
    // The rewarded "+1 Repair Gel next mission" card on the Missions tab.
    'gift': {
      'name': 'Gel for the road',
      'desc': 'Watch a short video: +1 Repair Gel for your next mission, even over your limit.',
      'aria': 'Watch a short video for one extra Repair Gel on your next mission',
      'ready': 'Gift packed!',
      'readyDesc': '+1 Repair Gel for your next mission.'
    },
    // A locked lab menu (`hubUnlocks.ts`). `{n}` is how many more missions
    // it waits for; the plural forms follow the language (`i18n/plural.ts`:
    // three for ru/uk/pl, six for ar, one where the noun never changes).
    'unlock': {
      'hint': 'Complete {n} more mission to unlock | Complete {n} more missions to unlock',
      // The locked menu's spoken name; `{name}` is its visible label.
      'aria': '{name}, locked: complete {n} more mission | {name}, locked: complete {n} more missions'
    }
  },
  'hero': {
    // Under the name on the hero panel's name plate (the name itself is
    // `hub.tab.hero`): what he is, so the name reads as a name.
    'role': 'Your combat android',
    'weapons': 'Special weapons',
    'weaponSlot': 'Slot {n}',
    'weaponRank': 'Rank {n}',
    'noWeapons': 'Defeat Core Masters to copy their weapons.',
    'attrPending': 'Choose {n} system upgrade(s)!',
    'stats': 'Systems',
    'attributes': 'Upgrades',
    'stat': {
      'hp': 'Max health',
      'we': 'Weapon energy',
      'power': 'Power',
      'damage': 'Pellet damage',
      'charge': 'Charge shot',
      'armor': 'Armor',
      'crit': 'Critical chance',
      'tanks': 'Repair Gels'
    }
  },
  'workshop': {
    'upgradeAdDesc': 'Enough bolts for two upgrades of your best cannon.',
    'upgradeAdName': 'Upgrade Boost',
    'tanks': 'Supplies',
    'tankName': 'Repair Gel',
    'tankDesc': 'Fully restores health and power mid-mission.',
    'owned': 'Carried: {n}/{max}',
    'upgrade': 'Upgrade gear',
    'next': 'Next level',
    'upgradeBtn': 'Upgrade',
    'maxed': 'Fully upgraded',
    'dropName': 'Supply Drop',
    'dropDesc': 'A crate of spare bolts, beamed in from the lab.',
    'dropAria': 'Watch a short video for {n} bolts',
    'dropCooldown': 'Next drop in {t}'
  },

  // ─── Circuits (skills) ────────────────────────────────────────────────────
  'board': {
    'buster': 'Cannon',
    'armor': 'Armor',
    'core': 'Core'
  },
  'circuits': {
    'chips': 'Skill Chips: {n}',
    'rank': 'Rank {n}/{max}',
    'requires': 'Requires {name} rank {n}',
    'install': 'Install chip',
    'maxed': 'Fully powered',
    'respec': 'Reset circuits'
  },
  'skill': {
    'rapid': { 'name': 'Rapid Pellets', 'desc': 'Quick-shot damage +10% per chip.' },
    'quickCharge': { 'name': 'Quick Charge', 'desc': 'Charge time −10% per chip.' },
    'megaCharge': { 'name': 'Mega Charge', 'desc': 'Charged shot damage +12% per chip.' },
    'perfectTiming': { 'name': 'Perfect Timing', 'desc': 'Wider perfect-release window and stronger criticals.' },
    'piercing': { 'name': 'Piercing Core', 'desc': 'Half-charged shots break shields and helmets too.' },
    'giga': { 'name': 'Overcharge', 'desc': 'Keep holding past full charge for a devastating third level.' },
    'frame': { 'name': 'Reinforced Frame', 'desc': 'Max health +8% per chip.' },
    'barrier': { 'name': 'Barrier Tuning', 'desc': 'Blocking costs less power and lets less damage through.' },
    'autoRepair': { 'name': 'Auto-Repair', 'desc': 'Regenerate 1% health per second out of combat, per chip.' },
    'parry': { 'name': 'Parry Protocol', 'desc': 'Wider parry window; parried machines stay stunned longer.' },
    'spikes': { 'name': 'Spike Plating', 'desc': 'Reflect 15% of blocked damage per chip.' },
    'lastStand': { 'name': 'Last Stand', 'desc': 'Once per mission, survive a fatal hit with 1 health.' },
    'cells': { 'name': 'Energy Cells', 'desc': 'Weapon energy +3 per chip.' },
    'mastery': { 'name': 'Weapon Mastery', 'desc': 'Special weapon damage +10% per chip.' },
    'boosters': { 'name': 'Slide Boosters', 'desc': 'Faster slide cooldown, cheaper slides.' },
    'efficient': { 'name': 'Efficient Cores', 'desc': 'Special weapons cost 10% less energy per chip.' },
    'magnet': { 'name': 'Bolt Magnet', 'desc': 'More bolts and a longer pickup reach.' },
    'tankCap': { 'name': 'Gel Capacity', 'desc': 'Carry one more Repair Gel per chip.' }
  },

  // ─── Gear ─────────────────────────────────────────────────────────────────
  'rarity': {
    'standard': 'Standard',
    'tuned': 'Tuned',
    'prototype': 'Prototype',
    'legendary': 'Legendary'
  },
  'item': {
    'arm_standard': 'Standard Cannon',
    'arm_rapid': 'Rapid Cannon',
    'arm_heavy': 'Heavy Cannon',
    'arm_quick': 'Quick-Charge Cannon',
    'arm_nova': 'Nova Cannon',
    'helm_scout': 'Scout Helmet',
    'helm_guard': 'Guard Helmet',
    'helm_ace': 'Ace Helmet',
    'helm_royal': 'Royal Helmet',
    'body_light': 'Light Frame',
    'body_plated': 'Plated Frame',
    'body_reactor': 'Reactor Frame',
    'body_aegis': 'Aegis Frame',
    'boots_basic': 'Basic Boots',
    'boots_dash': 'Dash Boots',
    'boots_magnet': 'Magnet Boots',
    'boots_titan': 'Titan Boots',
    'chip_logic': 'Logic Chip',
    'chip_quantum': 'Quantum Chip'
  },
  'slot': {
    'buster': 'Cannon',
    'helmet': 'Helmet',
    'chest': 'Frame',
    'boots': 'Boots',
    'chip': 'Chip'
  },
  'gear': {
    'damage': 'Damage',
    'armor': 'Armor',
    'equip': 'Equip',
    'unequip': 'Remove',
    'equipped': 'Equipped',
    'new': 'NEW',
    'salvage': 'Salvage',
    'noAffixes': 'No bonus modules',
    'emptySlot': 'Nothing for this socket yet — open chests and finish jobs.'
  },
  // `{v}` arrives already signed and formatted ("+12", "+4.5%").
  'affix': {
    // The main stat of an arm cannon, as a signed change (the loot card).
    'damage': '{v} damage',
    'crit': '{v} critical chance',
    'critDmg': '{v} critical damage',
    'hp': '{v} max health',
    'armor': '{v} armor',
    'we': '{v} weapon energy',
    'power': '{v} power',
    'bolts': '{v} bolts found',
    'chargeSpeed': '{v} charge speed',
    'pelletDmg': '{v} pellet damage',
    'chargeDmg': '{v} charge shot damage',
    'moveSpeed': '{v} move speed',
    'special': '{v} special weapon damage',
    'regen': '{v} health regen / s (out of combat)',
    'magnet': '{v} pickup reach'
  },
  'weapon': {
    'rankUp': '{weapon} upgraded to rank {n}!',
    'scrapBurst': { 'name': 'Scrap Burst', 'desc': 'A three-way spray of scrap. Great against crowds.' },
    'flameWave': { 'name': 'Flame Wave', 'desc': 'A fireball rolls along the floor through every machine in its path and sets them burning.' },
    'iceLance': { 'name': 'Ice Lance', 'desc': 'A piercing lance that chills what it hits and slows it down.' },
    'thunderArc': { 'name': 'Thunder Arc', 'desc': 'Instant lightning that chains to nearby machines.' },
    'galeGuard': { 'name': 'Gale Guard', 'desc': 'Leaves orbit you, blocking shots and slicing machines. Use again to hurl them.' },
    'magnetPull': { 'name': 'Magnet Pull', 'desc': 'A homing horseshoe that cracks shields and shells and yanks flyers out of the air.' }
  },

  'options': {
    'killCams': 'Kill-cam',
    'gameplay': 'Gameplay',
    'title': 'Options',
    'general': 'General',
    'audio': 'Audio',
    'language': 'Language',
    'difficulty': 'Difficulty',
    'soundEffects': 'Sound Effects',
    'music': 'Music',
    'musicTrack': 'Music Track',
    'musicTracks': {
      'cozy': 'Calm Circuits',
      'trance': 'Overdrive'
    },
    'haptics': 'Vibration',
    'on': 'On',
    'off': 'Off',
    'close': 'Close',
    'replayIntro': 'Replay intro',
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
      'forward': 'Move forward',
      'back': 'Move back',
      'left': 'Strafe left',
      'right': 'Strafe right',
      'turnLeft': 'Turn left',
      'turnRight': 'Turn right',
      'slide': 'Slide',
      'block': 'Block',
      'interact': 'Interact',
      'beam': 'Beam out',
      'tank': 'Repair Gel',
      'weapon1': 'Special weapon 1',
      'weapon2': 'Special weapon 2',
      'weapon3': 'Borrowed weapon',
      'target': 'Switch target',
      'map': 'Map'
    },
    'lookSensitivity': 'Look Sensitivity',
    'difficulties': {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    },
    'difficultyHints': {
      'easy': 'Machines hit softer and go down faster.',
      'medium': 'The intended challenge.',
      'hard': 'Tougher machines that hit harder.'
    }
  },
  'adsBlocked': {
    'title': "Couldn't show ad",
    'body': 'We tried to show you a video so you could earn your reward, but something on your browser is blocking ads.',
    'allowPrefix': 'Please allow ads on',
    'allowSuffix': '(or pause your ad-blocker for this game) and try again.',
    'gotIt': 'Got it'
  },
  'saveStatus': {
    'restoredTitle': 'Cloud save restored',
    'restoredBody': '+{n} bonus bolts for the recovery',
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
    'failed': "Couldn't reach the leaderboard.",
    'loading': 'Loading…',
    'you': 'You',
    'yourRank': 'You are #{n} of {total}',
    'of': 'of {n} players',
    'tabGlobal': 'Global'
  },
  // ─── Story (the intro cutscene, story-arc.md § 1) ─────────────────────────
  // `intro.*` are screen-reader lines, one per shot: read aloud, never drawn.
  // `vex.*` is Dr. Vex's speech bubble: a pompous showman, CAPS for the
  // shouted word. `atlas.*` are Atlas's lines: calm, dry, short.
  'story': {
    'intro': {
      'coldOpen': 'Flux fights rogue machines on the neon streets of Ampere Valley.',
      'valley': 'Ampere Valley: a bright android city, linked by beams of light. Dr. Vex takes over its machines with a red signal.',
      'lab': "The signal reaches Prof. Gauss's lab. Gauss gives Flux the Atlas disc and wakes him.",
      'safeMode': 'Gauss freezes herself in a capsule to keep the signal out. She is still alive.',
      'wakeUp': 'Flux wakes at level 1, with Atlas online. The Vex Fortress is far stronger, so the Scrapyard comes first.',
      'beam': 'Flux beams out to the Scrapyard.'
    },
    'vex': {
      'diagnosis': 'Diagnosis: this valley is SICK. The cure… is ME!'
    },
    'atlas': {
      'logStart': 'Log start.',
      'goodMorning': 'Core online. Good morning, Flux.',
      'scrapyardFirst': 'Scrapyard first. One relay at a time.'
    }
  },
  // ─── Atlas, in the missions (sim/atlas.ts) ─────────────────────────────────
  // Flux's AI companion talking to him: tiny, warm, a little cheeky. One
  // short line each (they sit in a small speech bubble for 2–3 s). Each key is
  // also the name of its optional voice file (voice-todo.md).
  'atlas': {
    'help': {
      'weapon': 'Pick your new weapon and fire at the drones!',
      'gap': "Walk straight at the edge and you'll leap across!",
      'gel': 'Use a Repair Gel to heal up!',
      'slide': 'Slide away just before the red ring reaches you!',
      'block': 'Hold block when it fires. Just as it hits is perfect!',
      'charge': 'Hold fire until the cannon glows, then let go!',
    },
    'train': {
      'weapon': "Let's train your new weapon!",
      'gap': "Let's train jumping over gaps!",
      'gel': "Let's train the Repair Gel!",
      'slide': "Let's train the Slide!",
      'block': "Let's train the Perfect Block!",
      'charge': "Let's train the Charge Shot!",
    },
    'hint': {
      'magnet': {
        'panel': 'See that red-blue plate? Shoot it to flip the rail.',
        'rail': 'Magnet rail! The arrows show the pull. Push through, or ride it.',
      },
      'blaze': {
        // Meltdown Descent (blaze stage)
        'lava': "That's lava down there. Stay on the metal.",
        'leap': "Too wide to walk. Slide off the edge, you'll carry.",
        'vents': 'Hiss, then fire. Let the roar pass, then go.',
        'barrels': 'Barrels! Watch the lamps, cross between them.',
        'hammers': 'Forge hammers. Count the beat, then run.',
        'drop': 'Long way down. One ledge at a time.'
      },
      'cryo': {
        // Glacier Run (cryo stage)
        'ice': "Ice! Let go of the stick and you'll keep sliding.",
        'spikes': 'Spikes under that ice. Walk it straight, no sharp turns.',
        'frost': "Frost thrower. It glows and hisses first. Cross when it's quiet.",
        'icicles': 'Shadows on the floor? Icicles. Step out of the ring!',
        'pillar': "That pillar's cracked. Shoot it, and there's your shortcut.",
        'stairs': "Icy stairs. Go slow — the landing's small."
      },
      'volt': {
        // Rail Rush (volt stage)
        'panels': 'Those panels pulse. Wait on a dark row, then step.',
        'board': "Hands off the controls — I'll drive, you shoot.",
        'wave': 'Drones ahead! Shoot them before they swoop.',
        'dip': 'Big drop ahead. Hold on — keep shooting!',
        'arrive': 'End of the line. Hop off!'
      },
      'gale': {
        // Sky Docks (gale stage)
        'leap': "Gap's too wide to walk. Slide off the edge — you'll carry.",
        'down': "Nice leap. Now don't look down.",
        'shuttle': 'Shuttles. Step on when it docks, off at the other end.',
        'wind': 'Wait for the gust to die, then move. Or hide behind a pillar.',
        'bob': 'Bobbing platforms. Hop on at the bottom, ride it up.'
      }
    },
    'secret': {
      // secret-room puzzles
      'lights': "That panel shows a pattern. The lamps on the wall don't. Yet.",
      'color': 'That frame has a favourite colour. Only its lamps should shine.',
      'cycle': "Every hit changes a lamp's mind. The panel knows what it wants.",
      'solved': 'Well, well. Someone likes puzzles.'
    },
    'landed': "Touchdown! Let's go.",
    'brief': {
      'tutorial': "Training time. I'll guide you!",
      'job': 'Quick job. In and out!',
      'climb': 'Tower run! Up, up, up!',
      'story': "A Core Master waits. Let's free it!"
    },
    'story': {
      'magnet': 'Polarity Works. My compass spins!',
      'scrapyard': 'Scrapyard relay. Light it up!',
      'blaze': 'The Refinery. Hot, hot, hot!',
      'cryo': 'Cryo Plant. Brr! Keep moving.',
      'volt': 'Volt Tower. My circuits tingle!',
      'gale': "Sky Docks. Don't look down!",
      'fortress': 'The Fortress. We end this.'
    },
    'arc': {
      '10': "Shield's down. Vex is next!",
      '9': 'One Master left. Almost!',
      '8': 'Eight! Only two Masters left.',
      '7': 'Seven lit. Keep it up!',
      '6': 'Six relays! The city wakes up.',
      '1': 'One relay lit. Nine to go!',
      '2': 'Two relays! Vex is sulking.',
      '3': 'Three lit. Keep glowing!',
      '4': 'Four down. The grid hums again.',
      '5': 'Halfway there! Vex is sweating.',
    },
    'bossAhead': 'Boss ahead. Deep breath!',
    'bossDown': 'Master freed! Great job!',
    'vexDown': 'Vex is down. We did it!',
    'lowHp': 'Ouch! Careful, Flux!',
    'lowHpGel': 'Low health! Try a Repair Gel.',
    'lowWe': "Weapon energy's low!",
    'trap': 'Trap ahead. Watch the timing!',
    'plate': 'Pressure plate. Tiptoe!',
    'objective': 'Done! Now find the exit.',
    'exit': "Our ride's here!",
    'levelUp': "Level up! You're shining.",
    'idle': {
      '1': 'Beep. Just checking in.',
      '2': "You're doing great.",
      '3': 'Gauss would be proud.',
      '4': 'I like our team.'
    }
  },
  'train': {
    'todo': 'not done yet',
    'done': 'done',
    'checklist': 'Tutorials',
    'watch': "Watch how it's done",
    'card': {
      'weapon': "You copied a Core Master's weapon! Fire it with its button: weapon energy powers it, and some machines are weak against it.",
      'gel': 'Hurt? A Repair Gel restores your health. Use one whenever a fight turns bad.',
      'slide': "Red attacks can't be blocked. Slide to dash out of the way: nothing can hit you mid-slide.",
      'block': 'Hold block to raise your shield: it stops shots and hits from the front. Raise it just as a hit lands for a Perfect Block, which knocks the attacker out.',
      'charge': "A normal shot can't break a shield. Hold fire until your cannon glows, then let go: a Charge Shot breaks right through.",
    },
    'name': {
      'weapon': 'Weapon Lesson',
      'gap': 'Jump Tutorial',
      'gel': 'Repair Gel Tutorial',
      'slide': 'Slide Tutorial',
      'block': 'Shield Tutorial',
      'charge': 'Charge Shot Tutorial',
    },
  }
}
