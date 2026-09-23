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

  'hud': {
    'hp': 'Health',
    'we': 'Weapon energy',
    'power': 'Power',
    'bolts': 'Bolts',
    'level': 'Lv {n}'
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
