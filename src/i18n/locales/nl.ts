// Dutch locale — mirrors the key shape of en.ts exactly.
export default {
  'gameName': 'Mega Droid',
  'cancel': 'Annuleren',
  'close': 'Sluiten',
  'ok': 'Ok',
  'continue': 'Doorgaan',
  'tapToContinue': 'Tik om door te gaan',
  'clickToContinue': 'Klik om door te gaan',
  'rewards': 'BELONINGEN',
  'tip': 'Tip',
  'onlyAvailableOn': 'Dit spel is alleen beschikbaar op',

  'ui': {
    'next': 'Volgende',
    'replay': 'Opnieuw',
    'back': 'Terug',
    'play': 'Spelen',
    'pause': 'Pauze',
    'menu': 'Menu',
    'home': 'Start',
    'info': 'Info',
    'skip': 'Overslaan',
    'holdToSkip': 'Houd {key} ingedrukt om over te slaan'
  },

  'combat': {
    'tink': 'TING!',
    'perfect': 'PERFECT!',
    'parry': 'GEPAREERD!',
    'guardBreak': 'DEKKING GEBROKEN!',
    'guardCracked': 'Dekking doorbroken!',
    'xp': '+{n} XP',
    'lastStand': 'Laatste adem! Systemen herstart.',
    'weak': 'ZWAKTE!',
    'kranck': 'KRANCK!',
    'dizzy': 'DUIZELIG!',
    'dodge': 'ONTWEKEN!',
    'block': 'Blokkeren',
    'slide': 'Glijden',
    'fire': 'Vuren',
    'tank': 'Reparatiegel',
    'noEnergy': 'Niet genoeg wapenenergie',
    'tankCount': 'Reparatiegel: {n} van {max}',
    'borrowed': 'Geleend wapen {weapon}: {n} van {max} schoten',
    'borrowedGet': '{weapon} ×{n}'
  },

  'flux': {
    'fumble': {
      '1': 'Oei-oei!',
      '2': 'Bzzt! Oeps!',
      '3': 'Mijn arm heeft de hik!',
      '4': 'Fout… wieee!',
      '5': 'Circuits van boter!',
      '6': 'Wiebelmodus AAN!'
    }
  },

  'enemy': {
    'hardhat': 'Bouwhelm',
    'trooper': 'Schildsoldaat',
    'heli': 'Rotordrone',
    'hopper': 'Stamper',
    'roller': 'Tandwielroller',
    'brute': 'Wachtdroid',
    'turret': 'Wandkanon',
    'golem': 'Kistgolem',
    'elite': 'Elite',
    'level': 'Lv. {n}'
  },

  'enemyPlural': {
    'hardhat': 'Bouwhelm | Bouwhelmen',
    'trooper': 'Schildsoldaat | Schildsoldaten',
    'heli': 'Rotordrone | Rotordrones',
    'hopper': 'Stamper | Stampers',
    'roller': 'Tandwielroller | Tandwielrollers',
    'brute': 'Wachtdroid | Wachtdroids',
    'turret': 'Wandkanon | Wandkanonnen',
    'golem': 'Kistgolem | Kistgolems'
  },

  'hud': {
    'help': 'Besturing tonen',
    'mute': 'Geluid uit',
    'unmute': 'Geluid aan',
    'bossUnknown': 'Onbekende baas',
    'hp': 'Gezondheid',
    'we': 'Wapenenergie',
    'power': 'Kracht',
    'bolts': 'Bouten',
    'level': 'Lv. {n}',
    'beamOut': 'Teleporteren'
  },

  'boss': {
    'stand': 'Sloper',
    'scrapper': 'Sloper',
    'blazeMaster': 'Gloedmeester',
    'frostMaster': 'Vorstmeester',
    'voltMaster': 'Voltmeester',
    'galeMaster': 'Stormmeester',
    'vexMk1': 'Dr. Vex Mk-I'
  },

  'sector': {
    'scrapyard': 'Schroothoop',
    'blaze': 'Gloedraffinaderij',
    'cryo': 'Cryocentrale',
    'volt': 'Volttoren',
    'gale': 'Luchtdokken',
    'fortress': 'Fort Vex'
  },

  'quest': {
    'tutorial': 'Wekroep',
    'boss': 'Kernmeesterduel',
    'bossTitle': 'Duel: {boss}',
    'kill': 'Schrootdienst',
    'collect': 'Databerging',
    'rescue': 'Reddingsactie',
    'elite': 'Elitejacht',
    'supply': 'Bevoorrading',
    'purge': 'Sectorzuivering',
    'climb': 'Torenrun',
    'stage': 'Platformlevel',
    'stageName': { 'blaze': 'Smeltafdaling', 'cryo': 'Gletsjerrun', 'volt': 'Railrace', 'gale': 'Hemeldokken' },
    'rematch': 'Revanche: {boss}',
    'desc': {
      'tutorial': 'Vecht je een weg door de Schroothoop en schakel de Sloper uit.',
      'boss': 'Dring door tot de kern van sector {sector} en versla {boss}.',
      'kill': 'Vernietig {n} {target} in sector {sector}.',
      'collect': 'Berg {n} datakernen die verspreid liggen in sector {sector}.',
      'rescue': 'Een werkbot zit vast in sector {sector}. Vind hem en teleporteer hem weg.',
      'elite': 'Een elitevijand ({target}) terroriseert sector {sector}. Maak er jacht op!',
      'supply': 'Kraak {n} voorraadkisten in sector {sector}.',
      'purge': 'Vernietig elke machine in sector {sector}.',
      'climb': 'Beklim de toren van sector {sector} — trappen, ladders, liften en afgronden — en daal af naar de arena voor een revanche tegen {boss}.',
      'stage': 'Ren, glijd en rijd door sector {sector} — richels, afgronden en machines — naar de arena, en versla daar {boss}.'
    }
  },
  'objective': {
    'title': 'Doel',
    'complete': 'Doel voltooid',
    'beamOutHint': 'Teleporteer weg zodra je klaar bent.',
    'tutorial': 'Versla {boss}',
    'boss': 'Versla {boss}',
    'kill': 'Vernietig {target}: {n}/{total}',
    'collect': 'Datakernen: {n}/{total}',
    'rescue': 'Vind de gestrande werkbot',
    'elite': 'Jaag op de elitevijand: {target}',
    'supply': 'Voorraadkisten: {n}/{total}',
    'purge': 'Machines vernietigd: {n}/{total}',
    'climb': 'Beklim de toren, versla {boss}',
    'stage': 'Bereik de arena, versla {boss}'
  },
  'mission': {
    'bossDown': '{boss} vernietigd!',
    'objectiveDone': 'Doel voltooid!',
    'rescued': 'Werkbot in veiligheid geteleporteerd!',
    'bossDoor': 'Het rolluik knarst open…'
  },
  'interact': {
    'chest': 'Openen',
    'rescue': 'Redden',
    'bossDoor': 'Binnengaan'
  },
  'progress': {
    'levelUp': 'Level {n}! Systemen volledig hersteld.'
  },
  'tips': {
    'moveTouch': 'Sleep links om te lopen en rechts om rond te kijken. Tik op de vloer om erheen te lopen!',
    'moveKeys': '{keys} om rond te lopen.',
    'lookMouse': 'Beweeg de muis om rond te kijken.',
    'capture': 'Klik op de scène om de camera over te nemen.',
    'fireTouch': 'Machines in zicht! Tik om te schieten — houd vast en laat los voor een geladen schot.',
    'fireKeys': 'Machines in zicht! Klik met de linkermuisknop om te schieten — houd vast en laat los voor een geladen schot.',
    'charge': 'Schilden blokkeren kogels. Een VOLLEDIG geladen schot knalt er dwars doorheen.',
    'blockTouch': 'Oranje ring: houd het schild vast om te blokkeren — druk als de ring sluit om te PAREREN!',
    'blockKeys': 'Oranje ring: houd de rechtermuisknop ingedrukt om te blokkeren — druk als de ring sluit om te PAREREN!',
    'red': 'Een rode ring is niet te blokkeren — glij opzij!',
    'dodgeKeys': 'Een rode ring is niet te blokkeren — druk op {slide} om opzij te glijden!',
    'spaceKey': 'spatie',
    'chest': 'Een voorraadkist! Tik erop om hem te openen.',
    'tank': 'Bijna op? Reparatiegel lapt je helemaal op.',
    'weapon': 'Gebruik je gekopieerde wapen via de gekleurde knop!'
  },
  'lesson': {
    'charge': 'Houd vast om je kanon op te laden en laat dan los: alleen een geladen schot breekt het schild van de trainingsdrone.',
    'crate': 'Voorraadkratten breken alleen door een geladen schot. Houd vast en laat los terwijl je op het gloeiende krat richt.',
    'weaponKeys': 'Druk op {n} om je gekopieerde wapen af te vuren: één schot raakt alle drie de drones.',
    'weaponTouch': 'Tik op de gloeiende wapenknop: één schot raakt alle drie de drones.',
    'gelKeys': 'Druk op {key} voor een reparatiegel: die lapt je helemaal op.',
    'gelTouch': 'Tik op de groene reparatiegelknop: die lapt je helemaal op.'
  },
  'walk': {
    'finishLesson': 'Maak de les af'
  },
  'hubLesson': {
    'workshop': 'Open de Werkplaats.',
    'upgradeBuster': 'Besteed bouten om je kanon te upgraden: meer schade.',
    'pickArmor': 'Kies nu je borstpantser.',
    'upgradeArmor': 'Upgrade dat ook: meer verdediging.',
    'deploy': 'Klaar — terug naar de missies!'
  },
  'loot': {
    'upgrade': 'Upgrade!',
    'found': '{item} ({rarity}) gevonden!',
    'tank': 'Reparatiegel gevonden!',
    'giftTank': 'Cadeau: +1 Reparatiegel!'
  },

  'results': {
    'success': 'MISSIE VOLTOOID',
    'failed': 'MISSIE MISLUKT',
    'xp': 'Ervaring',
    'bolts': 'Bouten',
    'kills': 'Machines vernietigd',
    'chests': 'Kisten geopend',
    'time': 'Tijd',
    'levelUp': 'Level omhoog! Nu level {n}',
    'newWeapon': 'Nieuw wapen: {weapon}!',
    'newSector': 'Nieuwe sector vrijgespeeld: {sector}',
    'items': 'Gevonden uitrusting',
    'triple': 'Bouten ×3',
    'tripleAria': 'Bekijk een korte video: verdrievoudig je bouten tot +{n}'
  },
  'defeat': {
    'title': 'SYSTEEMSTORING',
    'body': 'Flux heeft te veel schade opgelopen.',
    'kept': 'Wat je tot nu toe hebt verdiend, houd je:',
    'useTank': 'Herstart met reparatiegel ({n})',
    'rebootAd': 'Nu herstarten',
    'retreat': 'Terug naar het lab'
  },
  'banner': {
    'cleared': 'Level voltooid',
    'bossDown': 'Vijand verslagen!',
    'gameOver': 'Game over!'
  },
  'pause': {
    'title': 'GEPAUZEERD',
    'resume': 'Hervatten',
    'abandon': 'Missie afbreken',
    'controls': 'Besturing',
    'label': {
      'move': 'Lopen',
      'look': 'Kijken',
      'parry': 'Pareren',
      'interact': 'Interactie'
    },
    'touch': {
      'move': 'Linkerkant: sleep om te lopen. Tik op de vloer om erheen te lopen.',
      'fire': 'In gevecht: tik om te schieten, houd vast om op te laden, laat los om te vuren.',
      'block': 'Houd het schild vast om te blokkeren — precies als een ring sluit om te pareren.',
      'use': 'Bij een kist, een gestrande bot of een deur: tik erop, of op de knop die verschijnt.'
    },
    'keys': {
      'move': '{keys} / pijltjes: lopen.',
      'look': 'Beweeg de muis om te kijken. Klik op de scène om de camera over te nemen.',
      'fire': 'Linkermuisknop: schieten — vasthouden om op te laden, loslaten om te vuren.',
      'block': 'Rechtermuisknop: blokkeren — precies als een ring sluit om te pareren.',
      'slide': '{slide}: glijden · {tank}: reparatiegel · {use}: interactie · {beam}: teleporteren',
      'more': '{w1} / {w2}: speciale wapens · {target}: ander doelwit · Esc: pauze',
      'space': 'Spatie',
      'press': '{key}: {action}'
    }
  },
  'levelUp': {
    'title': 'LEVEL OMHOOG!',
    'pick': 'Kies een systeemupgrade',
    'chip': '+1 vaardigheidschip voor je circuits',
    'granted': '{stat} verhoogd van {from} naar {to}'
  },
  'attr': {
    'hp': { 'name': 'Chassis', 'desc': 'Max. gezondheid' },
    'we': { 'name': 'Reactor', 'desc': 'Wapenenergie' },
    'power': { 'name': "Servo's", 'desc': 'Kracht voor blokkeren en glijden' }
  },

  'hub': {
    'tab': {
      'missions': 'Missies',
      'hero': 'Flux',
      'circuits': 'Circuits',
      'workshop': 'Werkplaats'
    },
    'heroTabAria': 'Flux, jouw gevechtsandroïde',
    'levelUpReady': 'Level omhoog!',
    'levels': 'Lv. {a}–{b}',
    'story': 'Verhaalmissie',
    'jobs': 'Klussen',
    'jobsHint': 'Herhaalbaar — er komen nieuwe bij zodra je ze afrondt',
    'lockedHint': 'Versla {boss} om deze sector te openen.',
    'sectorSecured': 'Sector veiliggesteld. De klussen staan nog op het bord.',
    'deploy': 'Uitrukken',
    'reroll': 'Nieuwe klus',
    'gift': {
      'name': 'Gel voor onderweg',
      'desc': 'Bekijk een korte video: +1 Reparatiegel voor je volgende missie, zelfs boven je limiet.',
      'aria': 'Bekijk een korte video voor een extra Reparatiegel in je volgende missie',
      'ready': 'Cadeau ingepakt!',
      'readyDesc': '+1 Reparatiegel voor je volgende missie.'
    },
    'unlock': {
      'hint': 'Voltooi nog {n} missie om dit te ontgrendelen | Voltooi nog {n} missies om dit te ontgrendelen',
      'aria': '{name}, vergrendeld: voltooi nog {n} missie | {name}, vergrendeld: voltooi nog {n} missies'
    }
  },
  'hero': {
    'role': 'Jouw gevechtsandroïde',
    'weapons': 'Speciale wapens',
    'weaponSlot': 'Sleuf {n}',
    'weaponRank': 'Rang {n}',
    'noWeapons': 'Versla Kernmeesters om hun wapens te kopiëren.',
    'attrPending': 'Kies {n} systeemupgrade(s)!',
    'stats': 'Systemen',
    'attributes': 'Upgrades',
    'stat': {
      'hp': 'Max. gezondheid',
      'we': 'Wapenenergie',
      'power': 'Kracht',
      'damage': 'Kogelschade',
      'charge': 'Geladen schot',
      'armor': 'Pantser',
      'crit': 'Kritieke kans',
      'tanks': 'Reparatiegels'
    }
  },
  'workshop': {
    'tanks': 'Voorraad',
    'tankName': 'Reparatiegel',
    'tankDesc': 'Herstelt tijdens een missie je gezondheid en kracht volledig.',
    'owned': 'Op zak: {n}/{max}',
    'upgrade': 'Uitrusting upgraden',
    'next': 'Volgend niveau',
    'upgradeBtn': 'Upgraden',
    'maxed': 'Volledig geüpgraded',
    'dropName': 'Bevoorrading',
    'dropDesc': 'Een krat reservebouten, rechtstreeks uit het lab gestraald.',
    'dropAria': 'Bekijk een korte video voor {n} bouten',
    'dropCooldown': 'Volgende bevoorrading over {t}'
  },

  'board': {
    'buster': 'Kanon',
    'armor': 'Pantser',
    'core': 'Kern'
  },
  'circuits': {
    'chips': 'Vaardigheidschips: {n}',
    'rank': 'Rang {n}/{max}',
    'requires': 'Vereist {name} (rang {n})',
    'install': 'Chip plaatsen',
    'maxed': 'Volledig opgeladen',
    'respec': 'Circuits resetten'
  },
  'skill': {
    'rapid': { 'name': 'Snelle kogels', 'desc': 'Kogelschade +10% per chip.' },
    'quickCharge': { 'name': 'Snelladen', 'desc': 'Laadtijd −10% per chip.' },
    'megaCharge': { 'name': 'Megalading', 'desc': 'Schade van geladen schoten +12% per chip.' },
    'perfectTiming': { 'name': 'Perfecte timing', 'desc': 'Ruimer venster voor perfect loslaten en sterkere kritieke treffers.' },
    'piercing': { 'name': 'Doorborende kern', 'desc': 'Half geladen schoten breken ook door schilden en helmen.' },
    'giga': { 'name': 'Overlading', 'desc': 'Blijf na volle lading vasthouden voor een verwoestend derde niveau.' },
    'frame': { 'name': 'Versterkt chassis', 'desc': 'Max. gezondheid +8% per chip.' },
    'barrier': { 'name': 'Barrière-afstelling', 'desc': 'Blokkeren kost minder kracht en laat minder schade door.' },
    'autoRepair': { 'name': 'Auto-reparatie', 'desc': 'Herstel buiten gevechten 1% gezondheid per seconde, per chip.' },
    'parry': { 'name': 'Pareerprotocol', 'desc': 'Ruimer pareervenster; gepareerde machines blijven langer verdoofd.' },
    'spikes': { 'name': 'Stekelpantser', 'desc': 'Kaatst per chip 15% van de geblokkeerde schade terug.' },
    'lastStand': { 'name': 'Laatste adem', 'desc': 'Overleef één keer per missie een fatale treffer met 1 gezondheid.' },
    'cells': { 'name': 'Energiecellen', 'desc': 'Wapenenergie +3 per chip.' },
    'mastery': { 'name': 'Wapenmeesterschap', 'desc': 'Schade van speciale wapens +10% per chip.' },
    'boosters': { 'name': 'Glijboosters', 'desc': 'Snellere glij-afkoeltijd, goedkoper glijden.' },
    'efficient': { 'name': 'Efficiënte kernen', 'desc': 'Speciale wapens kosten per chip 10% minder energie.' },
    'magnet': { 'name': 'Boutmagneet', 'desc': 'Meer bouten en een groter oppakbereik.' },
    'tankCap': { 'name': 'Gelcapaciteit', 'desc': 'Neem per chip één reparatiegel extra mee.' }
  },

  'rarity': {
    'standard': 'Standaard',
    'tuned': 'Opgevoerd',
    'prototype': 'Prototype',
    'legendary': 'Legendarisch'
  },
  'item': {
    'arm_standard': 'Standaardkanon',
    'arm_rapid': 'Snelvuurkanon',
    'arm_heavy': 'Zwaar kanon',
    'arm_quick': 'Snellaadkanon',
    'arm_nova': 'Nova-kanon',
    'helm_scout': 'Verkennershelm',
    'helm_guard': 'Wachtershelm',
    'helm_ace': 'Sterhelm',
    'helm_royal': 'Koningshelm',
    'body_light': 'Licht chassis',
    'body_plated': 'Pantserchassis',
    'body_reactor': 'Reactorchassis',
    'body_aegis': 'Aegis-chassis',
    'boots_basic': 'Basislaarzen',
    'boots_dash': 'Sprintlaarzen',
    'boots_magnet': 'Magneetlaarzen',
    'boots_titan': 'Titanenlaarzen',
    'chip_logic': 'Logicachip',
    'chip_quantum': 'Kwantumchip'
  },
  'slot': {
    'buster': 'Kanon',
    'helmet': 'Helm',
    'chest': 'Chassis',
    'boots': 'Laarzen',
    'chip': 'Chip'
  },
  'gear': {
    'damage': 'Schade',
    'armor': 'Pantser',
    'equip': 'Uitrusten',
    'unequip': 'Verwijderen',
    'equipped': 'Uitgerust',
    'new': 'NIEUW',
    'salvage': 'Slopen',
    'noAffixes': 'Geen bonusmodules',
    'emptySlot': 'Nog niets voor deze sleuf — open kisten en voltooi klussen.'
  },
  'affix': {
    'damage': '{v} schade',
    'crit': '{v} kritieke kans',
    'critDmg': '{v} kritieke schade',
    'hp': '{v} max. gezondheid',
    'armor': '{v} pantser',
    'we': '{v} wapenenergie',
    'power': '{v} kracht',
    'bolts': '{v} gevonden bouten',
    'chargeSpeed': '{v} laadsnelheid',
    'pelletDmg': '{v} kogelschade',
    'chargeDmg': '{v} schade geladen schot',
    'moveSpeed': '{v} loopsnelheid',
    'special': '{v} schade speciale wapens',
    'regen': '{v} gezondheidsherstel/s (buiten gevecht)',
    'magnet': '{v} oppakbereik'
  },
  'weapon': {
    'rankUp': '{weapon} verbeterd naar rang {n}!',
    'scrapBurst': { 'name': 'Schrootsalvo', 'desc': 'Een schrootwaaier in drie richtingen. Ideaal tegen groepen.' },
    'flameWave': { 'name': 'Vlammengolf', 'desc': 'Een vuurbal rolt over de vloer, dwars door elke machine op zijn pad, en zet ze in brand.' },
    'iceLance': { 'name': 'IJslans', 'desc': 'Een doorborende lans die alles wat hij raakt onderkoelt en vertraagt.' },
    'thunderArc': { 'name': 'Donderboog', 'desc': 'Directe bliksem die overspringt op machines in de buurt.' },
    'galeGuard': { 'name': 'Stormschild', 'desc': 'Bladeren cirkelen om je heen, blokkeren schoten en snijden machines aan stukken. Gebruik opnieuw om ze weg te slingeren.' }
  },

  'options': {
    'title': 'Opties',
    'general': 'Algemeen',
    'audio': 'Audio',
    'language': 'Taal',
    'difficulty': 'Moeilijkheid',
    'soundEffects': 'Geluidseffecten',
    'music': 'Muziek',
    'musicTrack': 'Muzieknummer',
    'musicTracks': {
      'cozy': 'Rustige circuits',
      'trance': 'Overdrive'
    },
    'haptics': 'Trillen',
    'on': 'Aan',
    'off': 'Uit',
    'close': 'Sluiten',
    'replayIntro': 'Intro opnieuw bekijken',
    'keyboard': {
      'auto': 'Toetsenbordindeling detecteren',
      'layout': 'Toetsenbordindeling',
      'detected': 'Gedetecteerd: {layout}',
      'bindings': 'Toetstoewijzing',
      'press': 'Druk op een toets… (Esc om te annuleren)',
      'reset': 'Toetsen herstellen'
    },
    'actions': {
      'forward': 'Vooruit',
      'back': 'Achteruit',
      'left': 'Zijwaarts links',
      'right': 'Zijwaarts rechts',
      'turnLeft': 'Links draaien',
      'turnRight': 'Rechts draaien',
      'slide': 'Glijden',
      'block': 'Blokkeren',
      'interact': 'Gebruiken',
      'beam': 'Wegstralen',
      'tank': 'Reparatiegel',
      'weapon1': 'Speciaal wapen 1',
      'weapon2': 'Speciaal wapen 2',
      'weapon3': 'Geleend wapen',
      'target': 'Ander doelwit',
      'map': 'Kaart'
    },
    'lookSensitivity': 'Cameragevoeligheid',
    'difficulties': {
      'easy': 'Makkelijk',
      'medium': 'Gemiddeld',
      'hard': 'Moeilijk'
    },
    'difficultyHints': {
      'easy': 'Machines slaan zachter en gaan sneller neer.',
      'medium': 'De uitdaging zoals bedoeld.',
      'hard': 'Taaiere machines die harder slaan.'
    }
  },
  'adsBlocked': {
    'title': 'Advertentie kon niet worden getoond',
    'body': 'We wilden je een video tonen zodat je je beloning kon verdienen, maar iets in je browser blokkeert advertenties.',
    'allowPrefix': 'Sta advertenties toe op',
    'allowSuffix': '(of pauzeer je adblocker voor dit spel) en probeer het opnieuw.',
    'gotIt': 'Begrepen'
  },
  'saveStatus': {
    'restoredTitle': 'Cloudopslag hersteld',
    'restoredBody': '+{n} bonusbouten voor het herstel',
    'tap': 'tik',
    'pausedTitle': 'Cloudsync gepauzeerd',
    'pausedBody': 'Je speelt offline. Je voortgang wordt hier opgeslagen.',
    'retry': 'Opnieuw',
    'dismiss': 'sluiten'
  },
  'loading': {
    'tooLong': 'Duurt het laden te lang? Schakel je adblocker uit en ververs.'
  },
  'license': {
    'denied': 'Toegang geweigerd: koop een licentie.'
  },
  'leaderboard': {
    'title': 'Ranglijst',
    'rank': '#',
    'player': 'Speler',
    'score': 'Ervaring',
    'flair': 'Level',
    'empty': 'Nog niemand op het klassement. Wees de eerste!',
    'failed': 'Ranglijst niet bereikbaar.',
    'loading': 'Laden…',
    'you': 'Jij',
    'yourRank': 'Jij bent #{n} van {total}',
    'of': 'van {n} spelers',
    'tabGlobal': 'Wereldwijd'
  },

  'story': {
    'intro': {
      'coldOpen': 'Flux vecht tegen op hol geslagen machines in de neonstraten van Ampere Valley.',
      'valley': 'Ampere Valley: een stralende androïdenstad, verbonden door lichtstralen. Dr. Vex neemt de machines over met een rood signaal.',
      'lab': 'Het signaal bereikt het lab van Prof. Gauss. Zij geeft Flux de Atlas-schijf en wekt hem.',
      'safeMode': 'Gauss vriest zichzelf in in een capsule om het signaal buiten te houden. Ze leeft nog.',
      'wakeUp': 'Flux ontwaakt op niveau 1, met Atlas online. Fort Vex is veel sterker, dus eerst de Schroothoop.',
      'beam': 'Flux beamt naar de Schroothoop.'
    },
    'vex': {
      'diagnosis': 'Diagnose: deze vallei is ZIEK. Het medicijn… ben IK!'
    },
    'atlas': {
      'logStart': 'Log gestart.',
      'goodMorning': 'Kern online. Goedemorgen, Flux.',
      'scrapyardFirst': 'Eerst de Schroothoop. Eén relais tegelijk.'
    }
  },
  'atlas': {
    'hint': {
      'blaze': {
        // Meltdown Descent (blaze stage)
        'lava': 'Daar beneden is lava. Blijf op het metaal.',
        'leap': 'Te breed om te lopen. Glij over de rand, dan kom je er wel.',
        'vents': 'Eerst gesis, dan vuur. Wacht op het gebrul en ga dan.',
        'barrels': 'Vaten! Let op de lampjes en steek ertussendoor over.',
        'hammers': 'Smeedhamers. Tel de maat en ren dan.',
        'drop': 'Het is diep. Eén richel tegelijk.'
      },
      'cryo': {
        // Glacier Run (cryo stage)
        'ice': 'IJs! Laat de stick los en je glijdt door.',
        'spikes': 'Pinnen onder dat ijs. Loop rechtdoor, geen scherpe bochten.',
        'frost': 'Vorstwerper. Eerst gloeit en sist hij. Ga als hij stil is.',
        'icicles': 'Schaduwen op de vloer? IJspegels. Stap uit de ring!',
        'pillar': 'Die pilaar is gebarsten. Schiet erop en je hebt een kortere weg.',
        'stairs': 'IJzige trap. Rustig aan, het bordes is klein.'
      },
      'volt': {
        // Rail Rush (volt stage)
        'panels': 'Die panelen pulseren. Wacht op een donkere rij en stap dan door.',
        'board': 'Handen van de besturing — ik rijd, jij schiet.',
        'wave': 'Drones vooruit! Schiet ze neer voordat ze duiken.',
        'dip': 'Grote afdaling in zicht. Hou je vast — blijf schieten!',
        'arrive': 'Eindstation. Stap maar uit!'
      },
      'gale': {
        // Sky Docks (gale stage)
        'leap': 'Te breed om te lopen. Glij over de rand – je vaart draagt je.',
        'down': 'Mooie sprong. Nu niet naar beneden kijken.',
        'shuttle': 'Pendels. Stap op als hij aanmeert, aan de overkant eraf.',
        'wind': 'Wacht tot de windvlaag gaat liggen, dan lopen. Of schuil achter een pilaar.',
        'bob': 'Deinende platforms. Stap onderaan op en ga mee omhoog.'
      }
    },
    'secret': {
      // secret-room puzzles
      'lights': 'Dat paneel toont een patroon. De lampen aan de muur nog niet.',
      'color': 'Die lijst heeft een lievelingskleur. Alleen haar lampen horen te branden.',
      'cycle': 'Elk schot laat een lamp van gedachten veranderen. Het paneel weet wat het wil.',
      'solved': 'Kijk eens aan. Iemand houdt van puzzels.'
    },
    'landed': 'Geland! Daar gaan we.',
    'brief': {
      'tutorial': 'Training! Ik help je.',
      'job': 'Klusje. Erin en eruit!',
      'climb': 'Torenrace! Omhoog, omhoog!',
      'story': 'Een Kernmeester wacht. Laten we hem bevrijden!'
    },
    'story': {
      'scrapyard': 'Schroothoop-relais. Laat het stralen!',
      'blaze': 'De Raffinaderij. Heet, heet, heet!',
      'cryo': 'Cryocentrale. Brr! Blijf bewegen.',
      'volt': 'Volttoren. Mijn circuits tintelen!',
      'gale': 'Luchtdokken. Niet naar beneden kijken!',
      'fortress': 'Het Fort. We maken het af.'
    },
    'arc': {
      '1': 'Eén relais aan. Nog vier!',
      '2': 'Twee relais! Vex zit te mokken.',
      '3': 'Halverwege. Blijf stralen!',
      '4': 'Nog één Meester. Bijna!',
      '5': 'Schild weg. Nu Vex!'
    },
    'bossAhead': 'Baas in zicht. Diep ademhalen!',
    'bossDown': 'Meester bevrijd! Goed gedaan!',
    'vexDown': 'Vex is verslagen. Het is gelukt!',
    'lowHp': 'Au! Voorzichtig, Flux!',
    'lowHpGel': 'Lage gezondheid! Neem een reparatiegel.',
    'lowWe': 'Wapenenergie laag!',
    'trap': 'Val vooruit. Let op de timing!',
    'plate': 'Drukplaat. Op je tenen!',
    'objective': 'Klaar! Zoek nu de uitgang.',
    'exit': 'Onze lift is er!',
    'levelUp': 'Level omhoog! Je straalt.',
    'idle': {
      '1': 'Piep. Even checken.',
      '2': 'Je doet het super.',
      '3': 'Gauss zou trots zijn.',
      '4': 'Ik vind ons een fijn team.'
    }
  }
}
