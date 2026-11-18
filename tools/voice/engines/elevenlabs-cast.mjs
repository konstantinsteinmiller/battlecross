// The German cast for `pnpm voice:gen --engine elevenlabs --lang de` (roadmap #219):
// one native German ElevenLabs library voice per speaker, so the words are
// pronounced the German way (not by an English voice reading German). Voices
// are shared-library "German / standard accent" voices that free users may use
// by API; picked by gender, age and manner from the speakers' cards
// (src/game/audio/voiceCards.ts). Several speakers share a voice where the
// library is short (the player meets them in different towns).

/** name → voice id (ElevenLabs shared library, German, standard accent). */
export const DE_VOICES = {
  Nils: 'mk8kciAPymSDlinAde1e', // young man, clear, neutral
  Ben: 'aTTiK3YzK3dXETpuDE2h', // young man, casual, confident
  Gruber: 'J5U94vRbS9drxnawJcoc', // young man, crisp
  Mila: 'dCnu06FiOZma2KVNUoPZ', // young woman, confident
  Ela: 'NE7AIW5DoJ7lUosXV2KR', // young woman, cheerful
  Anna: 'DEZHhPbmb8LVZmWufkCh', // young woman, excited
  Lea: '7eVMgwCnXydb3CikjV7a', // woman, clear storyteller
  Leonie: 'uvysWDLbKpA4XvpD3GI6', // woman, clear, engaging
  Annika: 'ViKqgJNeCiWZlYgHiAOO', // woman, calm, confident
  Petra: 'lzvBSKYbNWDD0a6BaJSK', // woman, confident, pleasant
  LauraSharp: 'zKHQdbB8oaQ7roNTiDTK', // woman, sharp, professional
  Sabrina: 'cqPdIo76zSHFDcSZpFov', // woman, authentic
  Yvonne: 'fBs1tCpaSMsPcbMkLQlk', // woman, casual, natural
  Carla: 'rKiu7lQ4c5P3az3745s3', // woman, confident
  Irene: '8wPhfH9uUzEMHTmRkoAR', // older woman, warm, smart
  Heidi: 'kMdYHZK2wkocJnpZxE08', // woman, unique, clear
  Ramona: 'yUy9CCX9brt8aPVvIWy3', // woman, calm, soothing
  Otto: 'FTNCalFNG5bRnkkaP5Ug', // man, casual, normal
  Mark: 'fzqS9sNPYJhLlhsfDm0l', // man, interesting, fun
  Marc: 'gGjaVIGkCSfKUIBYtNT2', // man, pleasant, confident
  Stephan: 'IWm8DnJ4NGjFI7QAM5lM', // man, warm, friendly
  Thomas: 'Fghah4fztZORbiKfIGAs', // man, authoritative, calm
  Anton: 'Ay1WwRHxUsu3hEeAp8JZ', // man, formal, strong
  Johannes: 'r8MyP4qUsq5WFFSkPdfV', // man, clear, neutral
  Tristan: 'sx7WD8TJIOrk5RQOptDH', // man, trustworthy
  Manuel: 'JH302OKVzGGJc47f08ex', // man, deep, strong
  LeonStern: 're2r5d74PqDzicySNW0I', // man, rich, deep
  Felix: 'rDmv3mOhK6TnhYWckFaD', // man, calm, trustworthy
  Hermann: 'b0JqlN5qkeuPi5BoQiHn', // man, sympathetic
  Konrad: 'NlRO8ABjJNJNYaRaLiPJ', // man, deep, warm storyteller
  Rene: 'muSxG4dqYjBCkbpXqbEl', // man, trustworthy, calm
  Dan: 'utkd5fchbspYG3Ld0zt0', // man, radio host, excited
  Michael: '87AwpS6yC86wa2WglbsK', // old man, deep, soulful
  William: 'oae6GCCzwoEbfc5FHdEu', // old man, soothing
  HelmutDeep: '5KvpaGteYkNayiswuX2h', // old man, deep, distinctive
  HelmutEpic: 'g1jpii0iyvtRs8fqXsd1', // old man, epic trailer voice
  CaptainComedy: '8tJgFGd1nr7H5KLTvjjt', // vibrant character voice
  Freddie: 'U0W3edavfdI8ibPeeteQ' // sweet, young, character
}

/** speaker → voice name above. */
export const DE_CAST = {
  hero: 'Nils', heroine: 'Mila',
  chronicler: 'Michael', scoutWren: 'Mila', elderMara: 'Irene',
  freedPeddler: 'Otto', lightDisciple: 'Annika', sfShadow: 'LauraSharp', smalltalkIronhold: 'Manuel',
  sunfordSmith: 'Konrad', sunfordPeddler: 'Ela', trainerAegis: 'Anton', trainerPyro: 'Anna', sfGeo: 'William',
  sunfordHealer: 'Lea', goblinTrader: 'Freddie', sunfordGambler: 'Marc', sunfordCups: 'Ela', freedFarmers: 'Hermann',
  windDisciple: 'Ben', captainHale: 'Thomas', oakArmorer: 'Stephan', oakWeapons: 'Carla', trainerShadow: 'Ramona',
  trainerSovereign: 'LeonStern', oakHealer: 'Felix', blackMarket: 'Rene', trainerBlood: 'Johannes', syndicateBoss: 'Sabrina',
  oakGambler: 'Mark', frostDisciple: 'Tristan', forgemaster: 'Manuel', ironWeapons: 'Petra', ironAetherWorks: 'Leonie',
  ironArmor: 'Konrad', ironOrderArmor: 'Yvonne', trainerGeo: 'William', trainerAether: 'Ben', ironHealer: 'Heidi',
  trainerChrono: 'Felix', freedHerbalist: 'Lea', mayorBrenna: 'Carla', sbHealer: 'Hermann', sbAlchemist: 'Anna',
  sbGambler: 'Sabrina', sbCollector: 'William', sbFence: 'LauraSharp', sbArmorer: 'Petra', sbWeapons: 'Marc',
  sbJeweler: 'Gruber', sbMasterAegis: 'Heidi', sbMasterPyro: 'Stephan', sbMasterShadow: 'Mila', sbMasterSovereign: 'Otto',
  sbMasterGeo: 'Irene', sbMasterAether: 'Mark', sbMasterChrono: 'Johannes', sbMasterBlood: 'Leonie', sbMasterWindrunner: 'Ela',
  sbMasterFrostwarden: 'Tristan', sbMasterLightbringer: 'Annika', sbMasterBeastcaller: 'HelmutDeep', sbMasterElementalist: 'Yvonne',
  sbMasterSoulwarden: 'Ramona', sbMasterIronmonk: 'Rene', sbMasterBard: 'Dan',
  goblinKing: 'CaptainComedy', warlord: 'Anton', oracle: 'Lea', dragon: 'HelmutDeep', archDemon: 'HelmutEpic',
  sunkenPriest: 'Michael', fairPip: 'Dan', fairBess: 'Heidi', fairHob: 'Gruber', mysteriousWanderer: 'Konrad',
  smalltalkSunford: 'Heidi', townsfolk: 'Marc', smalltalkOakhaven: 'Petra', smalltalkSilverbridge: 'Susi', smalltalkKids: 'Freddie',
  kidFriend: 'Ela', banditChief: 'Mark', frostJarl: 'HelmutDeep', chimera: 'Irene', centaurWarchief: 'Manuel', cyclops: 'HelmutDeep',
  sphinx: 'Annika', leviathan: 'HelmutDeep', hydra: 'Sabrina', elderDragon: 'HelmutDeep', rebelGoblin: 'CaptainComedy',
  rebelGnome: 'Freddie', pyroCry: 'Marc', narrator: 'Lea'
}
DE_VOICES.Susi = 'v3V1d2rk6528UrLKRuy8' // woman, effortless, confident

/** Which speakers are voiced first when the credits run out (the tutorial path before the late game). */
export const DE_FIRST = ['chronicler', 'scoutWren', 'elderMara', 'banditChief', 'captainHale', 'hero', 'heroine']
