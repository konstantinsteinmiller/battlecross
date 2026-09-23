// English source bundle. Single source of truth for translation keys — every
// new player-facing string gets a key here first; the per-language files in
// this folder mirror the shape. Vite ships each non-English locale as its own
// lazy chunk (see `src/i18n/index.ts`).
export default {
  'gameName': 'Mega Adventure',
  'cancel': 'Cancel',
  'close': 'Close',
  'ok': 'Ok',
  'continue': 'Continue',
  'tapToContinue': 'Tap to continue',
  'clickToContinue': 'Click to continue',
  'rewards': 'REWARDS',
  'tip': 'Tip',
  'crazyGamesOnly': 'This game is only available on',

  // Accessible names for icon-only controls (read aloud, not seen).
  'ui': {
    'next': 'Next',
    'replay': 'Replay',
    'back': 'Back',
    'play': 'Play',
    'pause': 'Pause',
    'menu': 'Menu',
    'home': 'Home',
    'info': 'Info'
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
    'block': 'Block',
    'slide': 'Slide',
    'fire': 'Fire',
    'tank': 'Repair Tank',
    'noEnergy': 'Not enough weapon energy'
  },

  // Enemy display names (target frame, bestiary, job board).
  'enemy': {
    'hardhat': 'Hardhat',
    'trooper': 'Shield Trooper',
    'heli': 'Rotor Drone',
    'hopper': 'Stomper',
    'roller': 'Gear Roller',
    'brute': 'Guardroid',
    'turret': 'Wall Cannon',
    'elite': 'Elite',
    'level': 'Lv {n}'
  },

  // Plural forms for counts ("Destroy 7 Gear Rollers"): singular | plural.
  'enemyPlural': {
    'hardhat': 'Hardhat | Hardhats',
    'trooper': 'Shield Trooper | Shield Troopers',
    'heli': 'Rotor Drone | Rotor Drones',
    'hopper': 'Stomper | Stompers',
    'roller': 'Gear Roller | Gear Rollers',
    'brute': 'Guardroid | Guardroids',
    'turret': 'Wall Cannon | Wall Cannons'
  },

  'hud': {
    'hp': 'Health',
    'we': 'Weapon energy',
    'power': 'Power',
    'bolts': 'Bolts',
    'level': 'Lv {n}',
    'beamOut': 'Beam out'
  },

  'boss': {
    'stand': 'Scrapper',
    'scrapper': 'Scrapper',
    'blazeMaster': 'Blaze Master',
    'frostMaster': 'Frost Master',
    'voltMaster': 'Volt Master',
    'galeMaster': 'Gale Master',
    'vexMk1': 'Dr. Vex Mk-I'
  },

  'sector': {
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
    'desc': {
      'tutorial': 'Fight through the Scrapyard and take down the Scrapper.',
      'boss': 'Break into the core of {sector} and defeat {boss}.',
      'kill': 'Destroy {n} {target} in {sector}.',
      'collect': 'Recover {n} data cores scattered through {sector}.',
      'rescue': 'A worker-bot is stranded in {sector}. Find it and beam it out.',
      'elite': 'An elite {target} is terrorising {sector}. Hunt it down.',
      'supply': 'Crack open {n} supply chests in {sector}.',
      'purge': 'Destroy every machine in {sector}.'
    }
  },
  'objective': {
    'title': 'Objective',
    'complete': 'Objective complete',
    'beamOutHint': 'Beam out when you are ready.',
    'tutorial': 'Defeat the Scrapper',
    'boss': 'Defeat the Core Master',
    'kill': 'Destroy {target}: {n}/{total}',
    'collect': 'Data cores: {n}/{total}',
    'rescue': 'Find the stranded worker-bot',
    'elite': 'Hunt down the elite {target}',
    'supply': 'Supply chests: {n}/{total}',
    'purge': 'Machines destroyed: {n}/{total}'
  },
  'mission': {
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
  'loot': {
    'found': '{rarity} {item} found!',
    'tank': 'Repair Tank found!'
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
    'double': 'Double bolts (+{n})'
  },
  'defeat': {
    'title': 'SYSTEM DOWN',
    'body': 'Cobalt took too much damage.',
    'kept': 'You keep the {xp} XP and {bolts} bolts earned so far.',
    'useTank': 'Reboot with Repair Tank ({n})',
    'rebootAd': 'Reboot now',
    'retreat': 'Retreat to the lab'
  },
  'pause': {
    'title': 'PAUSED',
    'resume': 'Resume',
    'abandon': 'Abandon mission',
    'controls': 'Controls',
    'touch': {
      'move': 'Left side: drag to move. Tap the floor to walk there.',
      'look': 'Right side: drag to look around.',
      'fire': 'In combat: tap to shoot, hold to charge, release to fire.',
      'block': 'Hold the shield to block — just as a ring closes to parry.'
    },
    'keys': {
      'move': 'WASD / arrows: move. Click the floor to walk there.',
      'look': 'Drag the mouse to look.',
      'fire': 'Left click or Space: shoot — hold to charge.',
      'block': 'Right click or Shift: block — just as a ring closes to parry.',
      'slide': 'Q: slide · H: Repair Tank · E: interact',
      'more': '1 / 2: special weapons · Tab: switch target · Esc: pause'
    }
  },
  'levelUp': {
    'title': 'LEVEL UP!',
    'pick': 'Choose a system upgrade',
    'chip': '+1 Skill Chip for your circuits'
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
      'hero': 'Cobalt',
      'circuits': 'Circuits',
      'workshop': 'Workshop'
    },
    'levelUpReady': 'Level up!',
    'levels': 'Lv {a}–{b}',
    'story': 'Story mission',
    'jobs': 'Jobs',
    'jobsHint': 'Repeatable — new ones arrive as you finish them',
    'lockedHint': 'Defeat {boss} to open this sector.',
    'sectorSecured': 'Sector secured. Its jobs are still on the board.',
    'deploy': 'Deploy',
    'reroll': 'New job'
  },
  'hero': {
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
      'tanks': 'Repair Tanks'
    }
  },
  'workshop': {
    'tanks': 'Supplies',
    'tankName': 'Repair Tank',
    'tankDesc': 'Fully restores health and power mid-mission.',
    'owned': 'Carried: {n}/{max}',
    'upgrade': 'Upgrade gear',
    'next': 'Next level',
    'upgradeBtn': 'Upgrade',
    'maxed': 'Fully upgraded'
  },

  // ─── Circuits (skills) ────────────────────────────────────────────────────
  'board': {
    'buster': 'Buster',
    'armor': 'Armor',
    'core': 'Core'
  },
  'circuits': {
    'chips': 'Skill Chips: {n}',
    'rank': 'Rank {n}/{max}',
    'requires': 'Requires {name} rank {n}',
    'install': 'Install chip',
    'maxed': 'Fully powered',
    'respec': 'Reset circuits ({n} bolts)'
  },
  'skill': {
    'rapid': { 'name': 'Rapid Pellets', 'desc': 'Quick-shot damage +10% per chip.' },
    'quickCharge': { 'name': 'Quick Charge', 'desc': 'Charge time −10% per chip.' },
    'megaCharge': { 'name': 'Mega Charge', 'desc': 'Charged shot damage +12% per chip.' },
    'perfectTiming': { 'name': 'Perfect Timing', 'desc': 'Wider perfect-release window and stronger criticals.' },
    'piercing': { 'name': 'Piercing Core', 'desc': 'Half-charged shots break shields and helmets too.' },
    'giga': { 'name': 'Giga Buster', 'desc': 'Keep holding past full charge for a devastating third level.' },
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
    'tankCap': { 'name': 'Tank Capacity', 'desc': 'Carry one more Repair Tank per chip.' }
  },

  // ─── Gear ─────────────────────────────────────────────────────────────────
  'rarity': {
    'standard': 'Standard',
    'tuned': 'Tuned',
    'prototype': 'Prototype',
    'legendary': 'Legendary'
  },
  'item': {
    'arm_standard': 'Standard Buster',
    'arm_rapid': 'Rapid Buster',
    'arm_heavy': 'Heavy Buster',
    'arm_quick': 'Quick-Charge Buster',
    'arm_nova': 'Nova Buster',
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
    'buster': 'Buster',
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
    'salvage': 'Salvage (+{n})',
    'noAffixes': 'No bonus modules',
    'emptySlot': 'Nothing for this socket yet — open chests and finish jobs.'
  },
  // `{v}` arrives already signed and formatted ("+12", "+4.5%").
  'affix': {
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
    'scrapBurst': { 'name': 'Scrap Burst' },
    'flameWave': { 'name': 'Flame Wave' },
    'iceLance': { 'name': 'Ice Lance' },
    'thunderArc': { 'name': 'Thunder Arc' },
    'galeGuard': { 'name': 'Gale Guard' }
  },

  'options': {
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
      'trance': 'Mega Drive'
    },
    'haptics': 'Vibration',
    'on': 'On',
    'off': 'Off',
    'close': 'Save & Close',
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
  }
}
