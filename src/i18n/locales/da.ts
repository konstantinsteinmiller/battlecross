// Danish locale — mirrors the key shape of en.ts exactly.
export default {
  // ─── Afterplay phase 8: items, materials and capstones ───
  // ─── Afterplay phase 10: the prestige classes ───
  'prestige': { 'toast': { 'wanderer': "En mystisk vandrer venter i fæstningen." } },
  'relic': {
    'infernal': "{name} · Helvedes",
    'set': "Båret med {item}:",
    'heroicBadge': "Heroisk {n}",
    'heroic': "Heroisk {n}: {gold} guld, {glass} dæmonglas",
    'heroicIchor': "Heroisk {n}: {gold} guld, {glass} dæmonglas, {ichor} ichor",
    'heroicMax': "Alle heroiske rang er taget.",
    'infernalForge': "Helvedessmedje: {gold} guld, {glass} dæmonglas",
    'lens': "Orakelets linse: her venter {boss}.",
    'hydraKey': "Forseglet. Hydraens ildnøgle åbner Riftens hjerte.",
    'marksGlass': "Køb {glass} dæmonglas for {marks} mærker",
    'capstone': "Mesterevne",
    'fortOnly': "Denne mesterevne læres kun ved Bastionsvadestedet."
  },
  // ─── The fort's fair games (afterplay §9) ───
  'fair': {
    'fee': "Spil · {n}",
    'again': "Spil igen",
    'noGold': "Ikke nok guld.",
    'capped': "Zoner der skal ryddes, før de store præmier vender tilbage: {n}",
    'top': "Hovedpræmie! +{gold} guld, +{xp} XP",
    'topGold': "Hovedpræmie, kun i guld: +{n} guld",
    'won': "Du vinder! +{n} guld",
    'lost': "Ingen held. Rækken starter forfra.",
    'row': "Sejre i træk: {n} af {max}",
    'mats': "+{n} Heroisk+-materiale",
    'discount': "Smeden giver dig nu {n} % rabat på opgraderinger!"
  },
  'whack': {
    'title': "Bank-en-Imp",
    'lead': "Ram 20 imps på 30 sekunder. Lad de guldpansrede være: hver du rammer koster et liv.",
    'hits': "Imps: {n} / {max}",
    'lives': "Liv: {n}",
    'time': "Tid: {n} s",
    'hint': "Tryk på imps, eller tryk 1 til 9.",
    'barrel': "Tønde {n}",
    'timeout': "Tiden er gået!",
    'dead': "Ingen liv tilbage!"
  },
  'ring': {
    'title': "Ringkast ved Hydraen",
    'lead': "Hold for kraft, slip for at kaste. Et hoved fanger kun ringen nær midten af sit sving. Hvert hoved i træk er et point mere værd.",
    'hint': "Hold og slip på bordet, eller hold Mellemrum.",
    'rings': "Ringe tilbage: {n}",
    'score': "Point: {n}",
    'hit': "Ramt! +{n}",
    'miss': "Forbi!",
    'perfect': "En perfekt runde!",
    'nothing': "Point {n}. Ingen præmie denne gang.",
    'power': "Kraft"
  },
  'arm': {
    'title': "Armlægning",
    'lead': "Tryk når ringen møder cirklen for at presse hans arm ned. Styrke gør takten bredere. Tre sejre i træk giver smederabat, fem giver Heroisk+-materiale.",
    'hint': "Tryk på bordet, eller tryk Mellemrum.",
    'good': "Pres!",
    'off': "Ude af takt!"
  },
  // ─── The Siege of Bastion (afterplay §8) ───
  'siege': {
    'title': "Belejringen af Bastionsvadestedet",
    'lead': "Hold porten i ti bølger. Brug belejringsmærker på forsvar mellem bølgerne.",
    'story': "Horden står ved porten. Hold den i ti bølger: denne første belejring kan ikke tabes.",
    'bell': "Belejringsklokken ringer! Horden samler sig ved porten.",
    'mapBell': "Belejring!",
    'start': "Ring med klokken",
    'wins': "Vundet: {n}",
    'marksBank': "Sparede belejringsmærker: {n}",
    'tier': {
      'normal': "Normal",
      'hard': "Svær",
      'nightmare': "Mareridt"
    },
    'tierDesc': {
      'normal': "Fjender ét niveau over dig.",
      'hard': "Fjender 3 niveauer højere med 30 % mere liv.",
      'nightmare': "Fjender 6 niveauer højere og to bølger af mytiske eliter."
    },
    'locked': {
      'hard': "Vind først en normal belejring.",
      'nightmare': "Åbner, når riften er forseglet eller holdt på klem."
    },
    'lord': "Belejringsherre",
    'hud': {
      'wave': "Bølge {n}/{total}",
      'marks': "Mærker: {n}",
      'gate': "Port {pct} %",
      'build': "Bølge {n} om {s} s",
      'ready': "Klar!",
      'buy': "{name}: {n} mærker"
    },
    'def': {
      'ballista': {
        'name': "Ballista",
        'desc': "Skyder en gennemborende bolt ned ad sin bane hvert 2. sekund."
      },
      'cauldron': {
        'name': "Ildkedel",
        'desc': "Sætter ild til sin banes flaskehals."
      },
      'barricade': {
        'name': "Barrikade",
        'desc': "Spærrer en bane i 20 sekunder."
      },
      'militia': {
        'name': "Milits",
        'desc': "To vagter kæmper ved din side."
      },
      'repair': {
        'name': "Reparer porten",
        'desc': "Genopretter en fjerdedel af porten."
      }
    },
    'block': {
      'marks': "Ikke nok belejringsmærker.",
      'full': "Ikke plads til flere.",
      'phase': "Kun mellem bølgerne."
    },
    'toast': {
      'cleared': "Bølge {n} holdt! +{marks} mærker",
      'clearedUnharmed': "Bølge {n} holdt, porten uskadt! +{marks} mærker",
      'horn': "Hornet lyder! Porten er nede på {pct} %.",
      'ram': "En rambuk! Stop den, før den når porten!",
      'rally': "På benene igen! Hold porten!"
    },
    'banner': {
      'wave': "Bølge {n}",
      'final': "Belejringsherren!"
    },
    'result': {
      'tier': "Belejringen af Bastionsvadestedet: {tier}",
      'waves': "Bølger holdt: {n}/{total}",
      'marks': "Belejringsmærker beholdt: {banked} af {earned}",
      'glass': "Dæmonglas: +{n}"
    },
    'milestone': {
      'normal1': "Milepæl nået: Bastionens banner.",
      'normal5': "Milepæl nået: Murvogterens harnisk.",
      'hard1': "Milepæl nået: Veteranens instinkt, en femte passiv plads.",
      'hard5': "Milepæl nået: Portbryder.",
      'nightmare1': "Milepæl nået: Den sidste bastions krone.",
      'hardFlawless': "Milepæl nået: nøglen til en skjult klasseprøve."
    }
  },
  // ─── The Breaking (the afterplay's story) ───
  'breaking': {
    'title': "Bruddet",
    'toast': {
      brk6: "Smedemesteren har fået sin smedje tilbage. Helvedessmedning er åben.",
      brk7: "Sfinksen er død. Orakelets linse viser, hvor de store bæster venter.",
      brk8: "Leviathan er død. Dens skæl lader dig gå på lavt vand.",
      brk9: "Hydraen er død. Dens ildnøgle er din.",
      brk10: "Urdragen er død. Revnen ligger åben.",
      sealed: "Revnen er forseglet. Du er Revnens Forsegler.",
      ajar: "Revnen står på klem. Dæmoner vil sætte murene og kolosseet på prøve.",
      'brk2': "Bastionsvadestedet tager imod dig. Folket ser til dig nu.",
      'rescued': "Overlevende reddet! De er i sikkerhed på Bastionsvadestedet.",
      'brk3': "Vejen er fri. Sunfords folk er i sikkerhed.",
      'brk4': "Urtekonen slutter sig til fæstningen.",
      'brk5': "Kentaurhorden er knust. Fæstningen gør klar til belejring.",
    },
  },
  // ─── The intro (#130): its skip, and its narrator's name ───
  intro: {
    narrator: 'Krønikeskriveren',
    skip: 'Spring over',
    holdKey: 'Hold {key} for at springe over',
    holdTouch: 'Hold nede for at springe over',
    replay: 'Se introen'
  },
  arena: {
    allWon: 'Alle mytiske præmier er dine.',
    call: 'Historien er fortalt. Bevis nu dit build: klatr så højt du kan, og vind de mytiske præmier, ingen andre kan give dig.',
    prize: 'Du vandt {item}!',
    milestone: 'Bølge {n}!',
    next: 'Næste præmie ved bølge {at}: {item}',
    champion: 'Mesterbølge',
    wave: 'Bølge {n}'
  },
  sellOre: {
    talk: 'God malm, fair pris. Hvor meget vil du af med?',
    lead: 'Vælg hvor mange klumper af hver malm du sælger. Intet sælges, før du trykker på Sælg.',
    have: 'Du har {n}',
    each: '{n} guld stykket',
    none: 'Ingen',
    all: 'Alle',
    less: '{ore}: én mindre',
    more: '{ore}: én mere',
    total: 'Du får: {n} guld',
    sell: 'Sælg',
    selectAll: 'Vælg alle',
    empty: 'Du har ingen malm tilbage at sælge.'
  },
  smith: {
    why: {
      max: 'Du ejer begge, fuldt forbedret.',
      gold: 'Ikke nok guld.',
      ore: 'Ikke nok malm.',
      metal: 'Bryd denne malm først.',
      learn: 'En smed skal lære dig det først.'
    },
    stamp: 'Smedet',
    take: 'Tag den',
    worked: '{item} forbedret til +{n}',
    made: '{item} +{n}',
    grade: {
      perfect: 'Perfekt!',
      great: 'Fremragende arbejde!',
      good: 'Godt arbejde',
      poor: 'Groft arbejde'
    },
    hint: 'Tryk på Slå, eller tryk mellemrum, mens gløden er i det varme punkt.',
    strikes: 'Slag {n} af {max}',
    strike: 'Slå!',
    forge: 'Smed',
    gold: '{n} guld',
    nuggets: '{ore}: {have} af {n}',
    master: 'Et rigtig godt slag giver: {item}.',
    locked: 'Bryd {ore} først for at lære, hvad den kan blive til.',
    lead: 'Hvert metal, du bryder, viser, hvad det kan blive til. Slå på gløden, hvor den er varmest: tre slag afgør stykket.',
    talk: 'Varmt jern venter ikke på nogen.'
  },
  gameName: 'Battlecross',
  cancel: 'Annuller',
  close: 'Luk',
  ok: 'Ok',
  continue: 'Fortsæt',
  onlyAvailableOn: 'Dette spil findes kun på',
  ui: {
    next: 'Næste',
    replay: 'Spil igen',
    back: 'Tilbage',
    play: 'Spil',
    pause: 'Pause',
    menu: 'Menu',
    home: 'Start',
    info: 'Info',
    help: 'Styring',
    ok: 'Forstået',
    continue: 'Fortsæt'
  },
  hud: {
    level: 'Nv {n}',
    health: 'Liv {n} af {max}',
    mana: 'Mana {n} af {max}',
    heat: 'Varme',
    xp: 'XP',
    gold: '{n} guld',
    potion: 'Livseliksir ({n} tilbage)',
    manaPotion: 'Manaeliksir ({n} tilbage)',
    potionStop: 'Drik en helbredseliksir for at fortsætte',
    groups: '{n} af {total} fjendegrupper besejret',
    wave: 'Bølge {n} / {total}',
    roll: 'Undvigerulle',
    elixir: '{name} ({n} tilbage)',
    elixirNext: 'Næste eliksir'
  },
  menu: {
    map: 'Verdenskort',
    character: 'Helt',
    skills: 'Evner',
    inventory: 'Taske',
    journal: 'Dagbog'
  },
  combat: {
    dodge: 'Undveget',
    block: 'Blokeret',
    immune: 'Immun'
  },
  level: {
    mine: 'Udvind',
    open: 'Åbn',
    guarded: 'Bevogtet',
    locked: 'Låst',
    potion: '+1 eliksir',
    manaPotion: '+1 manaeliksir',
    leave: 'Forlad',
    chestsLeft: '{n} kister er stadig lukket her'
  },
  status: {
    stun: 'Lammet',
    knockup: 'I luften',
    knockdown: 'Slået omkuld',
    stasis: 'Stasis',
    petrify: 'Forstenet',
    frozen: 'Frosset',
    fear: 'Bange',
    slow: 'Sinket',
    confuse: 'Forvirret',
    taunt: 'Hånet',
    armorShred: 'Rustning brudt',
    weaken: 'Svækket',
    vulnerable: 'Sårbar',
    burn: 'Brænder',
    poison: 'Forgiftet',
    bleed: 'Bløder',
    delayed: 'Forsinket skade',
    haste: 'Hast',
    attackSpeed: 'Hurtige angreb',
    damageUp: 'Styrket',
    defenseUp: 'Befæstet',
    regen: 'Heler',
    lifestealUp: 'Livstyveri',
    invulnerable: 'Usårlig',
    unkillable: 'Udødelig',
    stealth: 'Skjult',
    reflect: 'Reflekterer',
    envenom: 'Giftklinge',
    exosuit: 'Exodragt',
    focus: 'Fokuseret',
    accelerate: 'Accelereret',
    overheat: 'Overophedet',
    enrage: 'Rasende',
    ambush: 'Baghold',
    elixirMight: 'Styrkeeliksir',
    elixirIron: 'Jernhud',
    elixirSwift: 'Hurtighed',
    elixirMind: 'Klart sind',
    elixirVigor: 'Livskraft',
    elixirShadow: 'Tørstende klinge',
    chi: 'Chi'
  },
  toast: {
    cageLocked: 'Låst. Nøglen må være et sted her.',
    cageKey: 'En nøgle! Den må åbne buret.',
    ore: 'Udvundet: {n} × {ore}',
    mineBusy: 'Ikke med fjender i nærheden!',
    pressureUp: 'Dine fjender bliver mere vilde {skulls}',
    pressureDown: 'Dine fjender slækker {skulls}',
    item: 'Fundet: {item}',
    levelUp: 'Niveau {level}! +3 attributpoint',
    boss: '{boss} dukker op',
    wave: 'Bølge {n}',
    herb: 'Plukket: {plant}',
    piece: 'Et stykke af skattekortet!'
  },
  coach: {
    move: {
      touch: 'Tryk på jorden for at gå derhen, eller brug styrepinden.',
      mouse: 'Klik på jorden for at gå derhen, eller styr med bevægelsestasterne.'
    },
    target: {
      touch: 'Tryk på en fjende, eller træk fra din helt hen på den, for at angribe.',
      mouse: 'Klik på en fjende for at angribe den.'
    },
    skill: {
      touch: 'Tryk på en evne for at bruge den på dit mål.',
      mouse: 'Tryk på en evnetast for at bruge den på dit mål.'
    },
    aim: {
      touch: 'Træk en evne ud på banen for at sigte, og slip for at kaste den.',
      mouse: 'Træk en evne ud på banen for at sigte, og slip for at kaste den.'
    },
    potion: {
      touch: 'Tryk på eliksiren for at hele dig.',
      mouse: 'Tryk på eliksirtasten for at hele dig.'
    },
    mana: {
      touch: 'Tryk på den blå flaske for at fylde din mana op.',
      mouse: 'Tryk på manaeliksirens tast for at fylde din mana op.'
    },
    chest: {
      touch: 'Tryk på en kiste for at åbne den.',
      mouse: 'Klik på en kiste for at åbne den.'
    },
    talk: {
      touch: 'Følg sporet hen til læremesteren og tryk på dem for at tale.',
      mouse: 'Følg sporet hen til læremesteren og klik på dem for at tale.'
    },
    teach: {
      touch: 'Tryk på “Vil du lære mig det?” for at se, hvad træneren underviser i.',
      mouse: 'Klik på “Vil du lære mig det?” for at se, hvad træneren underviser i.'
    },
    learn: {
      touch: 'Tryk på en evne, og tryk så på Lær.',
      mouse: 'Klik på en evne, og klik så på Lær.'
    },
    slot: {
      touch: 'Tryk på din nye evne, og tryk så på en plads for at tage den med i kamp.',
      mouse: 'Træk din nye evne hen på en plads for at tage den med i kamp.'
    },
    equip: {
      touch: 'Tryk på den nye ting, sammenlign de grønne og røde tal, og tryk så på dens plads for at tage den på.',
      mouse: 'Træk den nye ting hen på dens plads for at tage den på. Grønne tal går op, røde går ned.'
    },
    attr: {
      touch: 'Tryk på et plus for at bruge et egenskabspoint.',
      mouse: 'Klik på et plus for at bruge et egenskabspoint.'
    },
    travel: {
      touch: 'Tryk på det næste sted på kortet, og tryk så på knappen for at rejse derhen.',
      mouse: 'Klik på det næste sted på kortet, og klik så på knappen for at rejse derhen.'
    },
    buy: {
      touch: 'Tryk på en ting for at se prisen, og tryk så på Køb.',
      mouse: 'Klik på en ting for at se prisen, og klik så på Køb.'
    },
    exit: {
      touch: 'Tryk på kortknappen for at forlade byen og tage på næste eventyr.',
      mouse: 'Klik på kortknappen for at forlade byen og tage på næste eventyr.'
    },
    roll: {
      touch: 'Tryk på rulleknappen for at undvige faren. Intet kan skade dig midt i rullet.',
      mouse: 'Tryk på rulletasten for at undvige faren. Intet kan skade dig midt i rullet.'
    }
  },
  goal: {
    dummy: 'Vælt træningsdukken',
    clear: 'Ryd {place}',
    boss: 'Besejr {foe}',
    exit: 'Tag byttet og gå',
    wave: 'Overlev bølgerne',
    trainer: 'Tal med en læremester',
    learn: 'Lær en evne',
    points: 'Brug dine point',
    leave: 'Tag afsted mod {place}',
    travel: 'Rejs til {place}',
    decide: 'Tag dit valg',
    explore: 'Udforsk riget',
    fight: 'Vind kampen',
    show: 'Vis mig vej: {goal}',
    escort: 'Bevogt karavanen'
  },
  node: {
    'bastion': {
      'name': "Bastionsvadestedet",
      'desc': "En gammel grænsefæstning, de sidste mure, der stadig står. De overlevende samles her.",
    },
    sunford: {
      name: 'Sunford',
      desc: 'En bondeby ved slettens kant. Et hjem, en smed og to læremestre.'
    },
    plains: {
      name: 'Sunford-sletten',
      desc: 'Gobliner, ulve og banditter plager karavanerne på den åbne vej.'
    },
    hollows: {
      name: 'Goblinhulerne',
      desc: 'Hulerne under bakkerne. Nederst holder Goblinkongen hof.'
    },
    arena: {
      name: 'Colosseum',
      desc: 'Bølge efter bølge, hver hårdere end den forrige. Hvor langt kan du nå? En ny rangliste hver mandag.'
    },
    woods: {
      name: 'Den Hviskende Skov',
      desc: 'Gamle træer, der går, og edderkopper, der spinder mellem dem.'
    },
    outskirts: {
      name: 'Oakhavens udkant',
      desc: 'De brændende gårde uden for Oakhaven. En krigsherres hær står ved porten.'
    },
    oakhaven: {
      name: 'Oakhaven',
      desc: 'En handelsby bag mure. Hvad den bliver til, er op til dig.'
    },
    crags: {
      name: 'Askeklipperne',
      desc: 'Sort klippe og åben ild. Kultister fodrer flammerne.'
    },
    mines: {
      name: 'Ironholds miner',
      desc: 'Dværgene gravede for dybt og vækkede noget, der lyser.'
    },
    ironhold: {
      name: 'Ironhold',
      desc: 'Smedebyen i bjerget. Her hamres rigets bedste stål.'
    },
    tundra: {
      name: 'Frostbidstundraen',
      desc: 'En hvid ødemark, hvor kæmper går, og de døde ikke bliver liggende.'
    },
    temple: {
      name: 'Det Sunkne Tempel',
      desc: 'Nagaernes druknede haller og et orakel, der ser enhver slutning.'
    },
    citadel: {
      name: 'Tomhedens Citadel',
      desc: 'En fæstning, der ikke var der sidste år. Dens mure summer.'
    },
    peak: {
      name: 'Dragetinden',
      desc: 'Wyverner kredser om toppen. Noget langt større sover på den.'
    },
    fortress: {
      name: 'Rædselsfæstningen',
      desc: 'Ærkedæmonens sæde og den trone, enhver fraktion vil have.'
    },
    rift: {
      name: 'Tomhedskløften',
      desc: 'Såret, som dæmonerne kom igennem. Tomhedsfyrsten venter på den anden side.'
    },
    silverbridge: {
      name: 'Silverbridge',
      desc: 'Den store flodby på den gamle stenbro. En mester i hver klasse underviser her.'
    }
  },
  map: {
    title: 'Riget',
    town: 'By',
    levels: 'Nv {min}–{max}',
    arenaBest: 'Bedst: bølge {n}',
    travel: 'Rejs',
    again: 'Igen',
    enter: 'Gå ind',
    fight: 'Kæmp',
    back: 'Til byen',
    locked: 'Ryd et naboområde for at åbne vejen.',
    lockedArena: 'Portene åbner, når der er gjort op med Goblinkongen.',
    lockedRift: 'Den åbner, når Rædselsfæstningens trone er afgjort.',
    invaded: 'Invaderet',
    invadedDesc: 'Dæmoner hersker over dette land. Deres pyloner får fjender i nærheden til at slå hårdere, riftens ar brænder og sinker, og hver fjende, der besejres her, er mere værd.',
    lockedInvaded: 'Dæmonerne holder det i et fast greb. Generobr først {zone}.',
    danger: {
      '1': 'Lidt over dit niveau.',
      '2': 'Farligt på dit niveau.',
      '3': 'Langt over dit niveau.'
    },
    questOpen: '{quest}: en beslutning venter her.',
    questDone: '{quest}: {choice}',
    trainer: 'Skjult læremester: {cls}',
    new: 'Ny',
    trueTest: 'Den sande prøve',
    skip: 'Tryk for at springe over',
    compass: {
      n: 'N',
      e: 'Ø',
      s: 'S',
      w: 'V'
    },
    region: {
      vale: 'Solengsdalen',
      hills: 'Goblinbakkerne',
      peaks: 'Jerntinderne',
      ash: 'Askelandet',
      frost: 'Frostmarken',
      fields: 'De Gyldne Marker',
      mere: 'Nagasøen',
      reach: 'Tomhedsriget',
      dread: 'Rædselslandet',
      sea: 'Safirhavet',
      bay: 'Købmandsbugten'
    },
    walkTouch: 'Tryk på kortet for at gå derhen, eller styr med styrepinden',
    walkMouse: 'Klik på kortet for at gå derhen, eller styr med WASD'
  },
  encounter: {
    kicker: 'På vejen',
    title: {
      fight: 'Baghold!',
      elite: 'En mester spærrer vejen!',
      chest: 'En kiste i græsset!',
      merchant: 'En omvandrende handelsmand'
    },
    result: 'På vejen nær {place}',
    gold: '+{n} guld',
    xp: '+{n} XP'
  },
  travel: {
    to: 'Rejser til',
    loading: 'Indlæser'
  },
  attr: {
    str: {
      name: 'Styrke',
      short: 'STY',
      desc: 'Nærkampskraft, blokeringschance, tung rustning.'
    },
    dex: {
      name: 'Smidighed',
      short: 'SMI',
      desc: 'Kritiske træf, angrebs- og løbefart.'
    },
    int: {
      name: 'Intelligens',
      short: 'INT',
      desc: 'Magikraft, mana, elementmodstand.'
    },
    end: {
      name: 'Udholdenhed',
      short: 'UDH',
      desc: 'Liv, heling, rustning, modstand mod lammelse.'
    },
    skl: {
      name: 'Teknik',
      short: 'TEK',
      desc: 'Kritisk skade, nedkøling, afstandsvåben.'
    },
    cha: {
      name: 'Karisma',
      short: 'KAR',
      desc: 'Tjenere, butikspriser, belønninger, samtalevalg.'
    }
  },
  stat: {
    damage: 'Skade',
    health: 'Liv',
    mana: 'Mana',
    armor: 'Rustning',
    resist: 'Modstand',
    crit: 'Krit. chance',
    critDamage: 'Krit. skade',
    attackSpeed: 'Angrebsfart',
    moveSpeed: 'Løbefart',
    cdr: 'Nedkøling −',
    block: 'Blokering',
    dodge: 'Undvigelse',
    hpRegen: 'Liv / s'
  },
  sheet: {
    points: '{n} point at fordele',
    raise: 'Hæv {attr}',
    maxLevel: 'Højeste niveau nået',
    next: 'Næste point:'
  },
  heroChoice: {
    title: 'Vælg din helt',
    boy: 'Spil som drengen',
    girl: 'Spil som pigen',
    switch: 'Din helt'
  },
  skills: {
    active: 'Aktive evner',
    passive: 'Passive evner',
    known: 'Lært',
    none: 'Intet lært endnu. Find en læremester i en by.',
    emptySlot: 'Tom plads {n}',
    equip: 'Sæt i',
    remove: 'Fjern',
    unmet: 'Du opfylder ikke længere kravene.',
    how: 'Tryk på en evne og så på en plads, eller træk den derhen. Træk den væk fra en plads for at tage den ud.',
    howSlot: 'Tryk nu på en plads for at sætte den i.',
    classCount: '{cls}: {n} af {total} lært',
    hint: {
      met: 'Lær den af {name} i {place}.',
      unmet: 'En læremester i {place} underviser i den her.'
    }
  },
  class: {
    // ── The prestige classes (afterplay phase 10) ──
    'demonhunter': { 'name': "Dæmonjæger", 'desc': "Skygge og helligt lys, svoret til ét bytte. Mærker dæmoner, og de mærkede falder hurtigt." },
    'dragoon': { 'name': "Dragon", 'desc': "Vind under støvlerne, et skjold på armen. Springer ned fra himlen og spidder hele rækker." },
    'hexsmith': { 'name': "Forbandelsessmed", 'desc': "Ætherhåndværk næret med blod. Bygger tårne, der suger fjenden tom for at hele smeden." },
    'tidecaller': { 'name': "Tidevandskalder", 'desc': "Frost og elementer hældt i havet. Bølger, der kaster fjender tilbage og gennemvæder dem." },
    aegis: {
      name: 'Aegisridder',
      desc: 'Skjold og helligt stål. Tager slagene, så ingen andre behøver.'
    },
    shadow: {
      name: 'Skyggeklinge',
      desc: 'Træder ud af mørket, hugger bagfra og er væk igen.'
    },
    pyro: {
      name: 'Pyromantiker',
      desc: 'Ild er svaret på ethvert spørgsmål. Brænd dem, og spræng dem så.'
    },
    sovereign: {
      name: 'Storsuveræn',
      desc: 'Hvorfor kæmpe alene? Hidkald vagter, og før dem i kamp.'
    },
    chrono: {
      name: 'Kronovæver',
      desc: 'Standser fjender i tiden, gør allierede hurtigere og gør fejl ugjorte.'
    },
    blood: {
      name: 'Blodalkymist',
      desc: 'Betaler med liv for kraft og drikker det tilbage fra fjenden.'
    },
    aether: {
      name: 'Ætertekniker',
      desc: 'Bøsser, kanontårne og en varmemåler. Luk varmen ud, før den låser dig.'
    },
    geo: {
      name: 'Geomantiker',
      desc: 'Rejser mure og pigge og bryder selve jorden op.'
    },
    windrunner: {
      name: 'Vindløber',
      desc: 'En bue og vinden i ryggen. Skyd, spurt, og stå aldrig stille.'
    },
    frostwarden: {
      name: 'Frostvogter',
      desc: 'En isklinge og et koldt hjerte. Sink dem, frys dem, og knus dem så.'
    },
    lightbringer: {
      name: 'Lysbringer',
      desc: 'Lys, der heler venner og blænder fjender. Stå i det, og intet kan stoppe dig.'
    },
    beastcaller: {
      name: 'Dyrekalder',
      desc: 'En ulveflok, en bjørn og en høg kæmper ved din side. Kald på dem, og før dem i kamp.'
    },
    elementalist: {
      name: 'Elementmager',
      desc: 'Ild, frost, lyn og sten. Bland dem, og hvert element udløser det næste.'
    },
    soulwarden: {
      name: 'Sjælevogter',
      desc: 'Besejrede fjender rejser sig som venlige ånder, kæmper ved din side og går så hjem for at hvile.'
    },
    ironmonk: {
      name: 'Jernmunk',
      desc: 'Bare hænder, hurtige fødder. Hvert slag samler chi; brug det hele på ét mægtigt slag.'
    },
    bard: {
      name: 'Bard',
      desc: 'Sange, der løfter dit hold, og melodier, der lægger fjenden i søvn eller får dem til at angribe hinanden.'
    }
  },
  skill: {
    // ── The prestige classes (afterplay phase 10) ──
    'huntersMark': { 'name': "Jægerens mærke", 'desc': "En hellig bolt for {dmg}% Smidighed i skade. I {dur} s tager målet {vuln}% mere skade, en dæmon {demon}% mere." },
    'demonsBane': { 'name': "Dæmonbane", 'desc': "+{bane}% skade mod dæmoner, og {ward}% mindre skade fra dem." },
    'silverVolley': { 'name': "Sølvsalve", 'desc': "Sølvbolte i en linje: {dmg}% Smidighed i skade, +{bane}% mod dæmoner og mærkede fjender." },
    'skyfallLeap': { 'name': "Himmelfald", 'desc': "Spring uden for rækkevidde i {air} s, og fald så ned på stedet: {dmg}% Styrke i skade inden for {radius} m, fjender væltes." },
    'dragonBlood': { 'name': "Drageblod", 'desc': "+{boss}% skade mod bosser, +{hp}% maks. helbred, og intet skubber dig tilbage." },
    'dragonLance': { 'name': "Dragelanse", 'desc': "Et spydstød i en linje: {dmg}% Smidighed i skade på hver fjende i den." },
    'hexTurret': { 'name': "Forbandet tårn", 'desc': "Byg et tårn i {dur} s. Hvert sekund suger det den nærmeste fjende inden for {radius} m for {dmg}% Teknik i skade; du heler {drain}% af det." },
    'soulForge': { 'name': "Sjæleesse", 'desc': "+{hp}% maks. helbred, {regen} helbred i sekundet, og du tager {reduce}% mindre skade." },
    'hexBolt': { 'name': "Forbandet bolt", 'desc': "Betal {hp}% helbred: en bolt for {dmg}% Teknik i skade. Du heler {heal}% af den, og fjenden gør {weak}% mindre skade i {dur} s." },
    'tidalWave': { 'name': "Flodbølge", 'desc': "En bølge i en linje: {dmg}% Intelligens i skade, fjender kastes tilbage og gennemvædes ({slow}% langsommere i {dur} s)." },
    'seaborn': { 'name': "Havfødt", 'desc': "+{bonus}% skade mod nedkølede fjender, {reduce}% mindre modtaget skade, +{move}% fart." },
    'undertow': { 'name': "Understrøm", 'desc': "En hvirvel i {dur} s: i alt {dmg}% Intelligens i skade inden for {radius} m. Trækker fjender ind og sænker dem {slow}%." },
    'bastionWall': { 'name': "Bastionsmur", 'desc': "I {dur}s skal hver fjende inden for {radius} m angribe dig, og du tager {def}% mindre. Så gør lyset {dmg}% Styrke +{back}% af de modtagne slag." },
    'thousandCuts': { 'name': "Tusind snit", 'desc': "Pil mellem fjender inden for {radius} m og slå {hits} gange for {dmg}% Smidighedsskade hver. En boss tager kun ét hug. Mens du skærer, kan intet ramme dig." },
    'cinderSun': { 'name': "Askesol", 'desc': "En døende sol brister over {dur}s: {meteors} brændende stykker, hvert rammer med {dmg}% Intelligensskade." },
    'royalLegion': { 'name': "Kongelig legion", 'desc': "Kald legionen i {dur}s: {archers} bueskytter, {guards} vagter og {mages} kampmagikere." },
    'stoppedHour': { 'name': "Standset time", 'desc': "Stands timen inden for {radius} m i {dur}s. Når den går igen, tager hver fjende {dmg}% Intelligensskade." },
    'redCovenant': { 'name': "Rød pagt", 'desc': "Tag {pct}% af livet fra hver fjende inden for {radius} m. Du heles for {heal}% af det." },
    'orbitalLance': { 'name': "Orbitallanse", 'desc': "En lanse af lys fra himlen brænder, hvor du sigter: {dmg}% Færdighedsskade over {dur}s." },
    'tectonicHeart': { 'name': "Tektonisk hjerte", 'desc': "Jordens hjerte brister: {dmg}% Styrkeskade på alt nær, og murbrokker der sinker i {dur}s." },
    'eyeOfTheGale': { 'name': "Stormens øje", 'desc': "En pilestorm i {dur}s: i alt {dmg}% Færdighedsskade og {slow}% opbremsning." },
    'endlessWinter': { 'name': "Endeløs vinter", 'desc': "En vinter uden ende bryder ud fra dig: {dmg}% Intelligensskade inden for {radius} m, alle fryses i {freeze}s." },
    'dawnbreak': { 'name': "Daggry", 'desc': "Bliv daggryet i {dur}s: hvert sekund {dmg}% Intelligensskade inden for {radius} m og {heal}% heling." },
    'alphasCall': { 'name': "Alfaens kald", 'desc': "{wolves} ulve svarer og løber med dig i {dur}s. Hele flokken gør +{dmg}% skade og er {move}% hurtigere." },
    'prismStorm': { 'name': "Prismestorm", 'desc': "I {dur}s raser de fire elementer: {strikes} slag af {dmg}% Intelligens, der udløser hinanden." },
    'ferryman': { 'name': "Færgemand", 'desc': "I {dur}s rejser hver fjende, der falder nær dig, sig som din ånd, og ånder gør {atk}% mere." },
    'unmovingMountain': { 'name': "Urokkeligt bjerg", 'desc': "Brug al chi: et bjerg falder for {dmg}% Smidighedsskade, +{per}% pr. chi, og slår fjender omkuld." },
    'encore': { 'name': "Ekstranummer", 'desc': "Én gang til i {dur}s (+{buff}% fart, skade, Forsvar), så den sidste akkord: {dmg}% Karisma, fjender fortryllet." },
    kind: {
      active: 'Aktiv',
      passive: 'Passiv'
    },
    cooldown: '{n}s nedkøling',
    mana: '{n} mana',
    hpCost: '{n}% liv',
    heat: '+{n} varme',
    aimed: 'Træk for at sigte',
    shieldSlam: {
      name: 'Skjoldslag',
      desc: 'Ram målet for {dmg}% Styrke i skade, og lam det i {stun}s.'
    },
    aegisAura: {
      name: 'Aegisaura',
      desc: '+{armor}% Rustning, og du tager {reduce}% mindre fysisk skade.'
    },
    radiantStrike: {
      name: 'Strålende hug',
      desc: 'Et helligt hug for {dmg}% Styrke i skade, som heler dig med {heal}% af den skade, du gør.'
    },
    fortitude: {
      name: 'Standhaftighed',
      desc: 'Et træf på mere end {hit}% af dit liv giver et skjold på {shield}% af det i {dur}s. Én gang hvert {icd}s.'
    },
    tauntingCry: {
      name: 'Hånskrig',
      desc: 'Fjender inden for {radius} m angriber dig i {dur}s. Imens får du {def}% Forsvar.'
    },
    holyBastion: {
      name: 'Hellig bastion',
      desc: 'Usårlig i {dur}s. Angribere får {reflect}% af deres skade tilbage.'
    },
    shadowstep: {
      name: 'Skyggeskridt',
      desc: 'Dukker op bag målet og hugger det i ryggen for {dmg}% Smidighed i skade.'
    },
    lethality: {
      name: 'Dødelighed',
      desc: '+{crit}% Kritisk chance og +{critDmg}% Kritisk skade.'
    },
    venomousBlade: {
      name: 'Giftklinge',
      desc: 'I {dur}s forgifter dine angreb for {poison}% Smidighed over {over}s, og kan stables {stacks} gange.'
    },
    evasion: {
      name: 'Undvigekunst',
      desc: '+{dodge}% Undvigelse. En undvigelse giver {haste}% Hast i {dur}s.'
    },
    smokeBomb: {
      name: 'Røgbombe',
      desc: 'Forsvind i {dur}s. Dit næste angreb fra skjul gør +{bonus}% skade.'
    },
    danceOfBlades: {
      name: 'Klingernes dans',
      desc: 'Spring mellem fjender inden for {radius} m, og hug {hits} gange for {dmg}% Smidighed i skade hver. En boss tager kun ét hug. Du kan ikke rammes, mens du danser.'
    },
    fireball: {
      name: 'Ildkugle',
      desc: 'En kugle af ild, der springer for {dmg}% Intelligens i skade og brænder for {burn}% mere over {burnDur}s.'
    },
    cauterize: {
      name: 'Udbrænding',
      desc: 'Brændende fjender gør {reduce}% mindre skade på dig.'
    },
    flamePillar: {
      name: 'Flammesøjle',
      desc: 'En søjle af ild bryder frem, hvor du sigter: {dmg}% Intelligens i skade over {dur}s. Fjender i den kastes op i luften.'
    },
    pyromaniac: {
      name: 'Pyroman',
      desc: 'Et kritisk magitræf tager {cut}s af din ildnedkøling.'
    },
    combustion: {
      name: 'Antændelse',
      desc: 'Spræng enhver brand inden for {radius} m: hver gør {pct}% af sin resterende skade med det samme, som en eksplosion.'
    },
    cataclysm: {
      name: 'Kataklysme',
      desc: 'Kald {meteors} meteorer ned over {dur}s. Hver slår ned for {dmg}% Intelligens i skade.'
    },
    royalGuard: {
      name: 'Kongelig garde',
      desc: 'Hidkald en vagt, der kæmper ved din side og hugger for {dmg}% Karisma i skade. Op til {max} ad gangen.'
    },
    inspiringPresence: {
      name: 'Inspirerende nærvær',
      desc: 'Dine tjenere angriber {speed}% hurtigere og har {hp}% mere liv.'
    },
    commandFocus: {
      name: 'Angrebsordre',
      desc: 'Alle tjenere stormer mod målet: +{move}% løbefart og +{atk}% angrebsfart i {dur}s.'
    },
    sovereignsTribute: {
      name: 'Suverænens tribut',
      desc: '{share}% af den skade, du tager, går videre til dine tjenere.'
    },
    bannerOfVictory: {
      name: 'Sejrsbanner',
      desc: 'Plant et banner i {dur}s. Allierede i nærheden gør +{dmg}% skade og heler {regen}% liv pr. sekund.'
    },
    armyOfTheRealm: {
      name: 'Rigets hær',
      desc: 'Hidkald {archers} bueskytter, {guards} vagter og en kampmager i {dur}s.'
    },
    temporalStasis: {
      name: 'Tidsstasis',
      desc: 'Frys målet i tiden i {dur}s. Det kan ikke handle og kan ikke skades.'
    },
    hasteField: {
      name: 'Hastfelt',
      desc: 'I {dur}s løber du og allierede i nærheden {move}% hurtigere og angriber {speed}% hurtigere.'
    },
    timeDistort: {
      name: 'Tidsforvrængning',
      desc: '{share}% af den skade, du tager, forsinkes og fordeles i stedet over {over}s.'
    },
    paradoxShift: {
      name: 'Paradoksskift',
      desc: 'Byt plads med målet. Det tager {dmg}% Intelligens i skade, og fjender omkring det er forvirrede i {confuse}s.'
    },
    entropy: {
      name: 'Entropi',
      desc: 'Hvert kast gør din nedkøling {cdr}% kortere, og kan stables {stacks} gange.'
    },
    chronoRewind: {
      name: 'Kronotilbagespoling',
      desc: 'Vend tilbage til, hvor du stod for {back}s siden, med det liv og den mana, du havde dengang.'
    },
    sanguineFlask: {
      name: 'Blodflaske',
      desc: 'Kast en flaske med dit eget blod: {dmg}% Udholdenhed i skade i et område, og rustning brydes med {shred}% i {shredDur}s.'
    },
    bloodTransmutation: {
      name: 'Blodtransmutation',
      desc: '{share}% af den fysiske skade, du tager, vender tilbage som mana.'
    },
    essenceHarvest: {
      name: 'Essenshøst',
      desc: 'Dræn enhver fjende inden for {radius} m for {dmg}% Intelligens i skade. Du heles med {heal}% af den.'
    },
    hemophilia: {
      name: 'Hæmofili',
      desc: 'Livsdræn er {drain}% stærkere. At ramme en blødende fjende heler {heal}% af dit liv.'
    },
    mutagenicRage: {
      name: 'Mutagent raseri',
      desc: 'I {dur}s: +{speed}% angrebsfart, +{steal}% livstyveri og +{move}% løbefart.'
    },
    philosophersCrucible: {
      name: 'Filosoffens digel',
      desc: 'En pøl af kogende blod i {dur}s: {dmg}% Intelligens i skade på fjender i den, og den heler dig, mens du står i den.'
    },
    aetherPistol: {
      name: 'Æterpistol',
      desc: 'Et hurtigt skud for {dmg}% Teknik i skade. Opbygger {heat} varme.'
    },
    deployTurret: {
      name: 'Opstil kanontårn',
      desc: 'Stil et kanontårn op, der skyder for {dmg}% Teknik i skade i {dur}s. Op til {max} ad gangen.'
    },
    ventHeat: {
      name: 'Luk varme ud',
      desc: 'Tøm al varme ud i en kegle: op til {dmg}% Teknik i skade, jo mere varme, jo mere skade.'
    },
    thermalOverload: {
      name: 'Termisk overbelastning',
      desc: 'Mens du er overophedet, gør dine skud +{crit}% Kritisk skade. Overophedning låser stadig dine evner i {lock}s.'
    },
    orbitalBeam: {
      name: 'Orbitalstråle',
      desc: 'En stråle fra himlen brænder, hvor du sigter: {dmg}% Teknik i skade over {dur}s.'
    },
    exoSuit: {
      name: 'Exodragt',
      desc: 'I {dur}s: +{armor}% Rustning, og dine angreb bliver raketter, der gør {rocket}% Teknik i skade i et område.'
    },
    stoneSpike: {
      name: 'Stenpig',
      desc: 'En pig bryder frem under målet: {dmg}% Styrke i skade og {slow}% sinkning i {dur}s.'
    },
    earthBarrier: {
      name: 'Jordbarriere',
      desc: 'Rejs en klippevæg i {dur}s. Intet går eller skyder igennem den.'
    },
    seismicShock: {
      name: 'Seismisk chok',
      desc: 'Slå i jorden: {dmg}% Styrke i skade inden for {radius} m, og fjender slås omkuld i {down}s.'
    },
    earthenSkin: {
      name: 'Jordhud',
      desc: 'Få Rustning svarende til {armor}% af din Styrke. Lammelser på dig er {cut}% kortere.'
    },
    petrify: {
      name: 'Forsten',
      desc: 'Forvandl målet til sten i {dur}s. Det tager {vuln}% mere skade, når det bryder fri.'
    },
    tectonicRupture: {
      name: 'Tektonisk brud',
      desc: 'Flå banen op: {dmg}% Styrke i skade på alt i nærheden, og murbrokker, der sinker i {dur}s.'
    },
    scales: 'Skalerer med {attr}',
    shieldThrow: {
      name: 'Skjoldkast',
      desc: 'Dit skjold springer mellem {bounces} fjender: {dmg}% Styrke i skade på hver. De gør {weak}% mindre skade i {dur}s.'
    },
    shieldShove: {
      name: 'Skjoldskub',
      desc: 'Skub alt foran dig for {dmg}% Styrke i skade. De flyver tilbage og bliver afbrudt i det, de gør.'
    },
    holyChains: {
      name: 'Hellige lænker',
      desc: 'Lænker af lys trækker hver fjende inden for {radius} m hen til dig: {dmg}% Udholdenhed i skade og {slow}% sinkning.'
    },
    bulwark: {
      name: 'Bolværk',
      desc: '+{block}% Blokeringschance. Hver blokering gør {back} skade tilbage på angriberen.'
    },
    retribution: {
      name: 'Gengældelse',
      desc: 'I {dur}s skal fjender inden for {radius} m angribe dig. Så gør lyset {dmg}% Styrke +{back}% af de træf, du har taget.'
    },
    unbreakable: {
      name: 'Ubrydelig',
      desc: 'Når du er under {hp}% liv, tager du {reduce}% mindre skade.'
    },
    starFan: {
      name: 'Stjernevifte',
      desc: 'Kast {stars} skyggestjerner i en vifte, der hver gør {dmg}% Smidighed i skade.'
    },
    grapplingHook: {
      name: 'Entrehage',
      desc: 'Træk målet hen til dig for {dmg}% Smidighed i skade, og sink det {slow}% i {dur}s. Store fjender trækker dig ind.'
    },
    silentStrike: {
      name: 'Lydløst hug',
      desc: 'Rygstik gør +{backstab}% skade, og fjender opdager dig {notice}% senere.'
    },
    shadowMark: {
      name: 'Skyggemærke',
      desc: 'Målet tager {vuln}% mere skade i {dur}s, og dit næste træf på hvem som helst bliver kritisk for +{bonus}%.'
    },
    bladeRhythm: {
      name: 'Klingerytme',
      desc: 'Kritiske træf tager {cut}s af al nedkøling. +{speed}% angrebsfart.'
    },
    nightshadeMist: {
      name: 'Natskyggetåge',
      desc: 'En gifttåge i {dur}s: op til {dmg}% Smidighed i skade. Fjender i tågen bliver forvirrede i {confuse}s.'
    },
    firecracker: {
      name: 'Kanonslag',
      desc: 'Sæt et kanonslag på målet. Efter {delay}s springer det for {dmg}% Intelligens i skade og brænder alt i nærheden.'
    },
    fanTheFlames: {
      name: 'Pust til ilden',
      desc: 'Hver brand inden for {radius} m blusser {pct}% stærkere op og starter forfra. Fjender inden for {push} m blæses tilbage.'
    },
    ringOfFire: {
      name: 'Ildring',
      desc: 'En ring af flammer rejser sig i {dur}s: op til {dmg}% Intelligens i skade. Fjender indeni sinkes {slow}%.'
    },
    everflame: {
      name: 'Evig flamme',
      desc: 'Dine brande er {burn}% stærkere, og dine trylleformularer får +{crit}% Kritisk chance.'
    },
    wildfire: {
      name: 'Løbeild',
      desc: 'Når en brændende fjende besejres, springer dens flammer over på hver fjende inden for {radius} m i {dur}s.'
    },
    phoenixFlight: {
      name: 'Føniksflugt',
      desc: 'Flyv som en føniks med ild efter dig: {dmg}% Intelligens i skade, hvor du lander. Hel {regen}% i sekundet i {dur}s.'
    },
    callArchers: {
      name: 'Kald bueskytter',
      desc: 'Hidkald en bueskytte, der skyder for {dmg}% Karisma i skade bag dig. Op til {max} ad gangen.'
    },
    royalRally: {
      name: 'Kongelig samling',
      desc: 'Dine tjenere skynder sig til din side og heler {heal}% liv. I får alle +{def}% Forsvar i {dur}s.'
    },
    warMarshal: {
      name: 'Krigsmarskal',
      desc: 'Dine tjenere gør {dmg}% mere skade.'
    },
    royalDecree: {
      name: 'Kongeligt dekret',
      desc: 'Fjender inden for {radius} m må bukke: lammet i {stun}s, derefter tager de {vuln}% mere skade i {dur}s.'
    },
    loyalHearts: {
      name: 'Trofaste hjerter',
      desc: 'Når en af dine tjenere falder, heler du {heal}% af dit liv.'
    },
    summonChampion: {
      name: 'Hidkald forkæmper',
      desc: 'Kald rigets forkæmper i {dur}s: en kæmpe ridder med {hp}% af dit liv, der hugger for {dmg}% Karisma.'
    },
    echoBolt: {
      name: 'Ekkolyn',
      desc: 'Et tidslyn for {dmg}% Intelligens i skade. {delay}s senere rammer det igen for {echo}%.'
    },
    foresight: {
      name: 'Forudseenhed',
      desc: 'Du ser slagene komme et øjeblik før: +{dodge}% Undvigelse og {cdr}% kortere nedkøling.'
    },
    timeBubble: {
      name: 'Tidsboble',
      desc: 'En boble af langsom tid i {dur}s: fjender indeni bevæger sig {slow}% langsommere og tager {dmg}% Intelligens i skade.'
    },
    timeLoop: {
      name: 'Tidsløkke',
      desc: 'Efter {dur}s smutter målet tilbage, hvor det var: {dmg}% Intelligens i skade plus {echo}% af det, det mistede.'
    },
    frozenMoment: {
      name: 'Frosset øjeblik',
      desc: 'Dine angreb har {chance}% chance for at fryse fjenden i tiden i {dur}s.'
    },
    timeStop: {
      name: 'Tidsstop',
      desc: 'Stop tiden inden for {radius} m i {dur}s. Når den starter igen, tager hver fjende {dmg}% Intelligens i skade.'
    },
    essenceWard: {
      name: 'Essensværn',
      desc: 'Gør {hp}% af dit liv til et glødende værn på {shield}% af det i {dur}s.'
    },
    vitalReserve: {
      name: 'Livsreserve',
      desc: '+{hp}% maks. Liv, og du får {regen} liv tilbage hvert sekund.'
    },
    enfeeblingTonic: {
      name: 'Svækkende tonikum',
      desc: 'Kast et tonikum: {dmg}% Intelligens i skade i et område. Ramte fjender gør {weak}% mindre skade i {dur}s.'
    },
    homunculus: {
      name: 'Homunkulus',
      desc: 'Bryg en boblende hjælper af {hp}% af dit liv i {dur}s. Brygger du en ny, får du {back}% af dens liv tilbage.'
    },
    adrenalCatalyst: {
      name: 'Adrenalinkatalysator',
      desc: 'Jo mindre liv du har, jo mere skade gør du: op til +{dmg}% ved {low}% liv eller mindre.'
    },
    grandTransmutation: {
      name: 'Stor transmutation',
      desc: 'Gør {pct}% af livet hos fjender inden for {radius} m til essens. Du heles med {heal}% af den.'
    },
    rocketJump: {
      name: 'Raketspring',
      desc: 'Skyd af sted og land, hvor du sigter: {dmg}% Teknik i skade inden for {radius} m. Opbygger {heat} varme.'
    },
    coolantLoop: {
      name: 'Kølesløjfe',
      desc: 'Varme falder {cool}% hurtigere, og dine evner opbygger {cut}% mindre af den.'
    },
    shockGrenade: {
      name: 'Chokgranat',
      desc: 'Kast en granat: {dmg}% Teknik i skade og {stun}s lammelse inden for {radius} m. Opbygger {heat} varme.'
    },
    precisionOptics: {
      name: 'Præcisionsoptik',
      desc: '+{crit}% Kritisk chance. Dine skud går gennem {pierce} fjende ekstra.'
    },
    arcCoil: {
      name: 'Lysbuespole',
      desc: 'Lynet rammer målet og springer så videre til {jumps} fjender mere: {dmg}% Teknik i skade på hver. Opbygger {heat} varme.'
    },
    thermalPlating: {
      name: 'Varmepanser',
      desc: 'Mens din varme er {heat} eller mere, tager du {reduce}% mindre skade.'
    },
    boulderRoll: {
      name: 'Kampestensrul',
      desc: 'Rul en kampesten frem: {dmg}% Styrke i skade på alt i dens vej, og de slås omkuld i {down}s.'
    },
    bedrock: {
      name: 'Grundfjeld',
      desc: 'Intet kan slå dig tilbage, omkuld eller op i luften. +{hp}% maks. Liv.'
    },
    sinkhole: {
      name: 'Synkehul',
      desc: 'Jorden synker og trækker fjender ind i {dur}s og styrter så sammen: {dmg}% Styrke i skade.'
    },
    mountainBreaker: {
      name: 'Bjergknuser',
      desc: '+{boss}% skade mod bosser og +{armor}% Rustning.'
    },
    geodeShell: {
      name: 'Geodeskal',
      desc: 'En krystalskal opsuger skade på {shield}% af dit liv i {dur}s og brister så for op til {dmg}% Styrke i skade.'
    },
    crumble: {
      name: 'Smuldr',
      desc: 'Du gør {dmg}% mere skade på fjender, der er sinket, slået omkuld eller forstenet.'
    },
    galeArrow: {
      name: 'Kulingpil',
      desc: 'En pil, der rider på et vindstød: {dmg}% Smidighed i skade, og målet skubbes tilbage.'
    },
    fleetfoot: {
      name: 'Letfod',
      desc: '+{move}% løbefart og +{dodge}% Undvigelse.'
    },
    zephyrDash: {
      name: 'Zefyrspurt',
      desc: 'Spurt op til {dist} m derhen, hvor du sigter, og løb så {move}% hurtigere i {dur}s.'
    },
    piercingGale: {
      name: 'Borende kuling',
      desc: 'En pil, der flyver gennem alle fjender på en linje: {dmg}% Smidighed i skade og {slow}% sinkning i {dur}s.'
    },
    cycloneSnare: {
      name: 'Cyklonfælde',
      desc: 'En hvirvelvind i {dur}s trækker fjender ind mod sit øje og gør {dmg}% Teknik i skade.'
    },
    keenEye: {
      name: 'Skarpt øje',
      desc: '+{critDmg}% Kritisk skade. Dine skud går gennem {pierce} fjende ekstra.'
    },
    updraftLeap: {
      name: 'Opvindsspring',
      desc: 'Et vindstød kaster fjender inden for {radius} m op i luften for {dmg}% Smidighed i skade. Du springer {leap} m væk.'
    },
    swiftDraw: {
      name: 'Kviktræk',
      desc: 'Du angriber {speed}% hurtigere, og din nedkøling er {cdr}% kortere.'
    },
    arrowStorm: {
      name: 'Pilestorm',
      desc: 'Pile regner over området i {dur}s: {dmg}% Teknik i skade i alt og {slow}% sinkning.'
    },
    galeSpirits: {
      name: 'Vindånder',
      desc: 'Vindånder flyver med dig i {dur}s og skyder {shots} pile med {dmg}% Teknik i skade. +{move}% løbefart.'
    },
    skyHunter: {
      name: 'Himmeljæger',
      desc: '+{boss}% skade mod bosser og +{crit}% Kritisk chance.'
    },
    skyrender: {
      name: 'Himmelflænger',
      desc: 'En stormpil river en vej op: {dmg}% Smidighed i skade på alle på linjen, som kastes op og til side.'
    },
    frostCleave: {
      name: 'Frosthug',
      desc: 'Sving din isklinge foran dig: {dmg}% Styrke i skade og {slow}% sinkning i {dur}s.'
    },
    rimeLance: {
      name: 'Rimlanse',
      desc: 'Kast en lanse af is for {dmg}% Intelligens i skade. Den sinker med {slow}% i {dur}s.'
    },
    wintersBite: {
      name: 'Vinterbid',
      desc: 'Dine angreb sinker fjenden med {slow}% i {dur}s.'
    },
    frostArmor: {
      name: 'Frostrustning',
      desc: 'Isrustning opsuger {shield}% Intelligens i skade i {dur}s. Fjender tæt på dig sinkes med {slow}%.'
    },
    glacialCharge: {
      name: 'Gletsjerstorm',
      desc: 'Storm mod målet for {dmg}% Styrke i skade, og frys det i {freeze}s.'
    },
    frozenHeart: {
      name: 'Frosset hjerte',
      desc: '+{hp}% maks. Liv, og al skade, du tager, mindskes med {reduce}%.'
    },
    rimeField: {
      name: 'Rimmark',
      desc: 'Frysende jord i {dur}s: {dmg}% Intelligens i skade. Afkølede fjender i den fryser i {freeze}s.'
    },
    frostShatter: {
      name: 'Frostsplint',
      desc: '{dmg}% Styrke i skade inden for {radius} m: +{chilled}% mod sinkede fjender, +{frozen}% mod frosne.'
    },
    shatterpoint: {
      name: 'Brudpunkt',
      desc: 'Du gør {bonus}% mere skade mod sinkede og frosne fjender.'
    },
    avalancheLeap: {
      name: 'Lavinespring',
      desc: 'Spring derhen, hvor du sigter, og land som en lavine: {dmg}% Styrke i skade, og fjender slås omkuld.'
    },
    iceborn: {
      name: 'Isfødt',
      desc: 'Intet kan skubbe eller kaste dig. Lammelser på dig er {cut}% kortere.'
    },
    absoluteZero: {
      name: 'Absolut nul',
      desc: 'Vinteren bryder ud af dig: {dmg}% Intelligens i skade inden for {radius} m, og alle fryser i {freeze}s.'
    },
    sunbolt: {
      name: 'Solstød',
      desc: 'Et lyn af sollys for {dmg}% Intelligens i skade. Det blændede mål gør {weaken}% mindre i {dur}s.'
    },
    mendingLight: {
      name: 'Helende lys',
      desc: 'Hel {heal}% Karisma med det samme og derefter {regen}% af dit liv hvert sekund i {dur}s.'
    },
    kindledHope: {
      name: 'Tændt håb',
      desc: 'Al heling, du får, er {heal}% stærkere.'
    },
    lanceOfLight: {
      name: 'Lyslanse',
      desc: 'En lysstråle: {dmg}% Intelligens i skade på en linje. Hel {heal}% liv for hver fjende, du rammer.'
    },
    dawnShield: {
      name: 'Daggryskjold',
      desc: 'Fjern alle dårlige effekter fra dig, og få et skjold på {shield}% Karisma i {dur}s.'
    },
    haloWard: {
      name: 'Glorieværn',
      desc: 'Al skade, du tager, mindskes med {reduce}%.'
    },
    dawnSanctuary: {
      name: 'Daggryets helligdom',
      desc: 'Hellig jord i {dur}s: heler dig {heal}% Karisma i sekundet, og fjender tager {dmg}% Intelligens.'
    },
    blindingFlash: {
      name: 'Blændende glimt',
      desc: 'Et lysglimt: fjender inden for {radius} m flygter i {fear}s og gør {weaken}% mindre i {dur}s.'
    },
    guardianLight: {
      name: 'Skytslys',
      desc: 'Et slag, der ville besejre dig, efterlader dig med 1 liv, urørlig i {dur}s. Én gang hvert {icd}s.'
    },
    sunfall: {
      name: 'Solfald',
      desc: 'En søjle af sollys falder på målet: {dmg}% Intelligens i skade. Fjender tager {vuln}% mere i {dur}s.'
    },
    searingLight: {
      name: 'Brændende lys',
      desc: '+{crit}% Kritisk chance for trylleformularer og +{critDmg}% Kritisk skade.'
    },
    haloOfDawn: {
      name: 'Daggryets glorie',
      desc: 'Lys i {dur}s: hvert sekund {dmg}% Intelligens i skade inden for {radius} m, og du heler {heal}% liv.'
    },
    callWolf: {
      name: 'Kald ulv',
      desc: 'En åndeulv slutter sig til dig og bider for {dmg}% Karisma i skade. Op til {max} ad gangen.'
    },
    wolfPounce: {
      name: 'Ulvespring',
      desc: 'Dine ulve springer på målet: {dmg}% Karisma i skade hver, og det slås omkuld i {down}s.'
    },
    wildKinship: {
      name: 'Vildt slægtskab',
      desc: 'Dine ledsagere har {hp}% mere liv og gør {dmg}% mere skade.'
    },
    callHawk: {
      name: 'Kald høg',
      desc: 'En høg styrtdykker mod målet for {dmg}% Karisma i skade: det tager {vuln}% mere i {dur}s. Bliver i {life}s.'
    },
    callBear: {
      name: 'Kald bjørn',
      desc: 'En åndebjørn slutter sig til dig. Den slår for {dmg}% skade og holder fjender travlt optaget. Op til {max}.'
    },
    thickHide: {
      name: 'Tyk pels',
      desc: '+{hp}% maks. Liv og +{regen} liv tilbage hvert sekund.'
    },
    packBond: {
      name: 'Flokbånd',
      desc: 'Du og ledsagere inden for {radius} m heler {regen}% liv i sekundet og får {def}% Forsvar i {dur}s.'
    },
    spiritStampede: {
      name: 'Åndestampede',
      desc: 'En flok åndedyr stormer frem: {dmg}% Karisma i skade på en linje, og fjender slås omkuld.'
    },
    packTactics: {
      name: 'Floktaktik',
      desc: 'Du gør {bonus}% mere skade for hver ledsager hos dig, op til {max}.'
    },
    alphaHowl: {
      name: 'Alfahyl',
      desc: 'Dine ledsagere heler {heal}% og kæmper {rage}% hårdere i {dur}s. Fjender tæt på dig flygter.'
    },
    leaderOfThePack: {
      name: 'Flokkens fører',
      desc: 'Dine ledsagere angriber {speed}% hurtigere og gør {dmg}% mere skade.'
    },
    wildHunt: {
      name: 'Den vilde jagt',
      desc: '{wolves} ulve mere løber med dig i {dur}s. Hele flokken gør +{dmg}% skade og løber {move}% hurtigere.'
    },
    prismBolt: {
      name: 'Prismestråle',
      desc: 'En stråle for {dmg}% Intelligens i skade: frost, hvis målet brænder, ellers ild. Hver udløser den anden.'
    },
    elementalHarmony: {
      name: 'Elementharmoni',
      desc: 'Dine reaktioner (Smeltning, Damp, Splintring, Overbelastning, Krystal) er {pct}% stærkere.'
    },
    frostLance: {
      name: 'Frostlanse',
      desc: 'Is gennem en linje: {dmg}% Intelligens i skade og {slow}% sinkning i {dur}s. Brændende fjender giver Damp.'
    },
    chainSpark: {
      name: 'Kædegnist',
      desc: 'Lyn for {dmg}% Intelligens, der springer til {jumps} fjender mere. Splintrer is, overbelaster ild.'
    },
    smolderingCore: {
      name: 'Ulmende kerne',
      desc: 'Dine brande gør {burn}% mere skade, og du har {mana} mana mere.'
    },
    rollingBoulder: {
      name: 'Rullende kampesten',
      desc: 'En kampesten ruller ud: {dmg}% Intelligens i skade, slået omkuld i {down}s. Mærkede fjender giver dig et skjold.'
    },
    thunderSnow: {
      name: 'Tordensne',
      desc: 'En snestorm i {dur}s: {dmg}% Intelligens i frostskade og et lyn hvert sekund for {bolt}%.'
    },
    spellweave: {
      name: 'Magivæv',
      desc: '+{crit}% Kritisk chance for trylleformularer, og dine evner koster {mana}% mindre mana.'
    },
    prismaticNova: {
      name: 'Prismenova',
      desc: 'Ram alt inden for {radius} m for {dmg}% Intelligens, hver med det element, den reagerer på.'
    },
    prismaticWard: {
      name: 'Prismeværn',
      desc: 'Du tager {reduce}% mindre skade og har {hp}% mere liv.'
    },
    frostfireComet: {
      name: 'Frostildkomet',
      desc: 'En komet af ild og is: {dmg}% Intelligens i skade. Fjender efterlades brændende og sinkede.'
    },
    elementalConvergence: {
      name: 'Elementernes møde',
      desc: 'I {dur}s skiftes fire elementer: {strikes} slag med {dmg}% Intelligens, der udløser hinanden.'
    },
    wispBolt: {
      name: 'Lygtemandspil',
      desc: 'En lygtemand for {dmg}% Intelligens i skade. En fjende, den besejrer, rejser sig som din ånd i {life}s.'
    },
    kindredSpirits: {
      name: 'Åndsfæller',
      desc: 'Dine ånder og tjenere har {hp}% mere liv og angriber {speed}% hurtigere.'
    },
    callTheFallen: {
      name: 'Kald de faldne',
      desc: 'Op til {max} fjender, der lige er faldet inden for {radius} m, rejser sig som dine ånder i {life}s.'
    },
    soulBond: {
      name: 'Sjælebånd',
      desc: 'Bliv ven med en fjende: {chance}% ({low}% hvis såret) for at den slutter sig til dig som ånd i {life}s. Ellers {dmg}% skade.'
    },
    restlessSouls: {
      name: 'Rastløse sjæle',
      desc: 'En fjende, du besejrer, har {chance}% chance for at rejse sig som din ånd i {life}s.'
    },
    spiritLantern: {
      name: 'Åndelygte',
      desc: 'En lygte i {dur}s: fjender i dens lys tager {dmg}% Intelligens, venner heles, de faldne rejser sig.'
    },
    hauntingWail: {
      name: 'Spøgelseshyl',
      desc: 'Et spøgelsesagtigt BØH: {dmg}% Intelligens i skade inden for {radius} m, og fjender løber væk i {fear}s.'
    },
    wardensVigil: {
      name: 'Vogterens vagt',
      desc: 'Dine ånder og tjenere gør {dmg}% mere skade, og du tager {reduce}% mindre.'
    },
    releaseSouls: {
      name: 'Sæt sjæle fri',
      desc: 'Dine ånder tager hjem i lysglimt: {dmg}% Intelligens omkring hver, {heal}% liv tilbage for hver.'
    },
    lanternKeeper: {
      name: 'Lygtevogter',
      desc: '{cdr}% kortere nedkøling, og dine evner koster {mana}% mindre mana.'
    },
    wispSwarm: {
      name: 'Lygtemandssværm',
      desc: '{wisps} lygtemænd styrtdykker mod fjender i området for {dmg}% Intelligens i alt. Dem, de besejrer, rejser sig.'
    },
    processionOfSouls: {
      name: 'Sjælenes optog',
      desc: 'I {dur}s rejser hver fjende, der falder tæt på dig, sig som din ånd, og ånder gør {atk}% mere.'
    },
    palmStrike: {
      name: 'Håndfladeslag',
      desc: 'Et hurtigt håndfladeslag for {dmg}% Smidighed i skade, der skubber fjenden tilbage. Samler {chi} chi.'
    },
    ironBody: {
      name: 'Jernkrop',
      desc: 'Fysisk skade, du tager, mindskes med {reduce}%, og du har {hp}% mere liv.'
    },
    flyingKick: {
      name: 'Flyvende spark',
      desc: 'Flyv mod målet og spark for {dmg}% Smidighed i skade; fjender i vejen tager {path}%. Samler {chi} chi.'
    },
    tigerStance: {
      name: 'Tigerstilling',
      desc: 'I {dur}s: +{dmg}% skade og +{speed}% angrebsfart. Afslutter Tranestilling.'
    },
    craneStance: {
      name: 'Tranestilling',
      desc: 'I {dur}s: +{def}% Forsvar, og du heler {regen}% af dit liv i sekundet. Afslutter Tigerstilling.'
    },
    flowingFists: {
      name: 'Flydende næver',
      desc: 'Dine angreb har {chance}% chance for at samle chi.'
    },
    hundredFists: {
      name: 'Hundrede næver',
      desc: 'En byge af {hits} slag for {dmg}% Smidighed i skade i alt. Samler {chi} chi.'
    },
    risingDragon: {
      name: 'Stigende drage',
      desc: 'Brug al chi på et opadslag: {dmg}% Smidighed i skade, +{per}% per chi. Fjenden flyver op.'
    },
    cranesGrace: {
      name: 'Tranens ynde',
      desc: '+{dodge}% Undvigelse, og lammelser og omkuldslag på dig er {cut}% kortere.'
    },
    whirlwindKick: {
      name: 'Hvirvelspark',
      desc: 'Spark alt inden for {radius} m to gange for {dmg}% Smidighed i skade i alt. Samler op til {chi} chi.'
    },
    tigersFury: {
      name: 'Tigerens raseri',
      desc: '+{crit}% Kritisk chance og +{speed}% angrebsfart.'
    },
    mountainPalm: {
      name: 'Bjerghånd',
      desc: 'Brug al chi: en kæmpe håndflade falder for {dmg}% Smidighed i skade, +{per}% per chi, og slår fjender omkuld.'
    },
    sharpNote: {
      name: 'Skarp tone',
      desc: 'En skarp tone for {dmg}% Karisma i skade. Fjenden gør {weaken}% mindre skade i {dur}s.'
    },
    stagePresence: {
      name: 'Scenetække',
      desc: 'Dine evner koster {mana}% mindre mana, og du løber {move}% hurtigere.'
    },
    marchingSong: {
      name: 'Marchsang',
      desc: 'En sang i {dur}s: du og allierede inden for {radius} m løber {move}% og angriber {speed}% hurtigere.'
    },
    lullaby: {
      name: 'Vuggevise',
      desc: 'En blid melodi i en kegle: hver fjende, den når, falder i søvn i {dur}s.'
    },
    longRefrain: {
      name: 'Langt omkvæd',
      desc: 'Dine sange varer {pct}% længere.'
    },
    balladOfValor: {
      name: 'Modets ballade',
      desc: 'En sang i {dur}s: du og allierede inden for {radius} m gør {dmg}% mere skade og får {def}% Forsvar.'
    },
    charmingSerenade: {
      name: 'Charmerende serenade',
      desc: 'Charmér målet og fjender inden for {radius} m: i {dur}s kæmper de mod hinanden.'
    },
    virtuoso: {
      name: 'Virtuos',
      desc: '{cdr}% kortere nedkøling og +{critDmg}% Kritisk skade.'
    },
    hymnOfMending: {
      name: 'Helingens hymne',
      desc: 'Fjerner dårlige effekter, og i {dur}s heler du og allierede inden for {radius} m {regen}% liv i sekundet.'
    },
    crescendo: {
      name: 'Crescendo',
      desc: 'Et lydbrag inden for {radius} m: {dmg}% Karisma i skade, +{per}% for hver sang, du spiller.'
    },
    standingOvation: {
      name: 'Stående bifald',
      desc: '+{dmg}% skade, og du tager {reduce}% mindre skade.'
    },
    grandFinale: {
      name: 'Stor finale',
      desc: 'Spil det hele i {dur}s (+{buff}% fart, skade, Forsvar), så en sidste akkord: {dmg}% Karisma, fjender charmeres.'
    }
  },
  slot: {
    main: 'Hovedhånd',
    off: 'Anden hånd',
    head: 'Hoved',
    body: 'Rustning',
    hands: 'Hænder',
    feet: 'Fødder',
    trinket: 'Smykke'
  },
  tier: {
    '7': 'Mytisk',
    '1': 'Almindelig',
    '2': 'Ualmindelig',
    '3': 'Sjælden',
    '4': 'Episk',
    '5': 'Heroisk',
    '6': 'Legendarisk'
  },
  weapon: {
    melee: 'Nærkamp · skalerer med {attr}',
    ranged: 'Afstand · skalerer med {attr}',
    magic: 'Magi · skalerer med {attr}'
  },
  source: {
    'siege': "Vundet i belejringen af Bastionsvadestedet.",
    'infernal': "En helvedestvilling: falder i det invaderede {zone} eller smedes af en smed.",
    arena: 'Vundet i Colosseum.',
    smith: 'Smedet i en smedje.',
    mob: 'Tabes af monstre. Område: {zone}.',
    chest: 'Findes i kister. Område: {zone}.',
    boss: 'Tabes af bossen. Område: {zone}.',
    secret: 'Gemt i en hemmelig kiste. Område: {zone}.'
  },
  mod: {
    'demonBane': "+{n}% skade mod dæmoner",
    'demonLeech': "{n}% af skaden på dæmoner heler dig",
    'beastBane': "+{n}% skade mod mytiske bæster",
    'fireWard': "{n}% mindre ildskade modtaget",
    'shadowWard': "{n}% mindre skyggeskade modtaget",
    'demonWard': "{n}% mindre skade fra dæmoner",
    'pylonBreaker': "+{n}% skade mod dæmonpyloner",
    'glassFinder': "{n}% chance for at en dræbt dæmon efterlader ekstra dæmonglas",
    'waterWalk': "Vand gør dig ikke langsommere",
    str: '+{n} Styrke',
    dex: '+{n} Smidighed',
    int: '+{n} Intelligens',
    end: '+{n} Udholdenhed',
    skl: '+{n} Teknik',
    cha: '+{n} Karisma',
    allAttrs: '+{n} til alle attributter',
    strOrDex: '+{n} Styrke eller Smidighed, den der er højest',
    armor: '{n} Rustning',
    armorPct: '+{n}% Rustning',
    armorFromStr: 'Rustning fra Styrke: +{n}%',
    block: '+{n}% Blokeringschance',
    dodge: '+{n}% Undvigelse',
    damageReduction: '+{n}% Skadesreduktion',
    physReduction: '{n}% mindre fysisk skade taget',
    maxHp: '+{n} maks. Liv',
    maxHpPct: '+{n}% maks. Liv',
    maxMana: '+{n} maks. Mana',
    hpRegen: '+{n} Liv pr. sekund',
    stunDurationCut: 'Lammelser på dig er {n}% kortere',
    damagePct: '+{n}% uddelt skade',
    critChance: '+{n}% Kritisk chance',
    critDamage: '+{n}% Kritisk skade',
    spellCrit: '+{n}% Kritisk chance for magi',
    attackSpeed: '+{n}% Angrebsfart',
    moveSpeed: '+{n}% Løbefart',
    cdr: 'Nedkølingen er {n}% kortere',
    manaDiscount: 'Magi koster {n}% mindre mana',
    lifesteal: '+{n}% Livstyveri på al skade',
    physLifesteal: '+{n}% Livstyveri på fysiske træf',
    lifeDrainPct: 'Livsdræn er {n}% stærkere',
    bossDamage: '+{n}% skade mod bosser',
    backstab: '+{n}% Skade i ryggen',
    minionDamage: 'Tjenere gør +{n}% skade',
    minionAttackSpeed: 'Tjenere angriber {n}% hurtigere',
    minionHp: 'Tjenere har +{n}% liv',
    burnOnHit: 'Angreb giver en Brand på {n} skade',
    freezeOnHit: 'Angreb har {n}% chance for at fryse',
    pierce: 'Skud går igennem {n} fjender mere',
    critCooldown: 'Kritiske træf forkorter al nedkøling med {n}s',
    extraBlastEvery: 'En ekstra energisalve for hvert {n}. skud',
    reflectOnBlock: 'En blokering kaster {n} skade tilbage',
    fatalSave: 'Dødelig skade gør dig i stedet usårlig i {n}s (én gang hvert 120s)',
    knockbackImmune: 'Immun over for tilbageslag',
    heatBuildCut: 'Varme opbygges {n}% langsommere',
    heatDissipation: 'Varme falder {n}% hurtigere',
    flaskDamage: 'Blodflaske gør +{n}% skade',
    igniteBonus: 'Ildmagi brænder {n}% hårdere',
    stealthy: 'Bevæger sig lydløst: fjender opdager dig på {n}% kortere afstand',
    fortitude: 'Store træf giver et skjold på {n}% liv',
    evasionHaste: 'En undvigelse giver {n}% Hast',
    cauterize: 'Brændende fjender gør {n}% mindre skade på dig',
    pyromaniac: 'Kritisk magi forkorter ildnedkøling med {n}s',
    tribute: 'Tjenere tager {n}% af din skade',
    timeDistort: '{n}% af den skade, du tager, forsinkes',
    entropy: 'Kast forkorter nedkølingen med {n}%',
    bloodToMana: '{n}% af den fysiske skade, du tager, vender tilbage som mana',
    bleedHeal: 'At ramme en blødende fjende heler {n}% liv',
    overheatCrit: '+{n}% Kritisk skade, mens du er overophedet',
    lowHealthDamage: 'Op til +{n}% skade, jo lavere dit helbred er',
    heatArmor: '{n}% mindre skade taget, mens varmen er halvt fuld eller mere',
    crumble: '+{n}% skade mod sænkede, væltede eller forstenede fjender',
    lastStand: '{n}% mindre skade taget under 30% helbred',
    wildfire: 'En brændende fjende, der falder, sætter fjender inden for {n} m i brand',
    loyalty: 'En falden tjener heler dig {n}% helbred',
    chillOnHit: 'Almindelige slag sænker farten med {n}% i 2 s',
    chillDamage: '+{n}% skade mod sænkede eller frosne fjender',
    healPower: 'Heling, du modtager, er {n}% stærkere',
    packDamage: '+{n}% skade for hver levende ledsager (op til 4)',
    reactionDamage: 'Elementreaktioner er {n}% stærkere',
    soulRise: 'Besejrede fjender har {n}% chance for at rejse sig som din ånd',
    chiOnHit: 'Angreb har {n}% chance for at opbygge chi',
    songLength: 'Sange varer {n}% længere'
  },
  item: {
    'chimeraMane': { 'name': "Kimærens manke" },
    'triFang': { 'name': "Tretand" },
    'warchiefsLongbowGun': { 'name': "Krigshøvdingens langbuegevær" },
    'hoofbreakerGreaves': { 'name': "Hovknuser-benskinner" },
    'eyeOfTheDeep': { 'name': "Dybets øje" },
    'beamSplitter': { 'name': "Strålekløver" },
    'riddleCrown': { 'name': "Gådekronen" },
    'sandglassWand': { 'name': "Timeglasstav" },
    'leviathanScale': { 'name': "Leviatanskæl" },
    'tidecallerStaff': { 'name': "Tidevandskalderens stav" },
    'hydraScaleGauntlets': { 'name': "Hydraskæl-handsker" },
    'manyHeadedFlail': { 'name': "Mangehovedet plejl" },
    'heartOfTheElderDragon': { 'name': "Den Ældgamle Drages hjerte" },
    'dragonboneGreatsword': { 'name': "Drageknogle-tohåndssværd" },
    'bastionBanner': { 'name': "Bastionens banner" },
    'wallwardensPlate': { 'name': "Murvogterens rustning" },
    'gatebreaker': { 'name': "Portbryder" },
    'crownOfTheLastBastion': { 'name': "Den sidste Bastions krone" },
    heartOfTheArena: {
      name: 'Arenaens hjerte'
    },
    mantleOfTheUndefeated: {
      name: 'Den ubesejredes rustning'
    },
    crimsonBulwark: {
      name: 'Det karmoisinrøde bolværk'
    },
    sandstriderGreaves: {
      name: 'Sandvandrerens benskinner'
    },
    gripsOfTheGladiator: {
      name: 'Gladiatorens handsker'
    },
    laurelOfTheVictor: {
      name: 'Sejrherrens laurbær'
    },
    smithMasterMithrilGreaves: {
      name: 'Mesterlige mithrilbenskinner'
    },
    smithMasterAdamantGreaves: {
      name: 'Mesterlige adamantbenskinner'
    },
    smithMasterAetheriteGreaves: {
      name: 'Mesterlige aetheritbenskinner'
    },
    smithMithrilGreaves: {
      name: 'Mithrilbenskinner'
    },
    smithAdamantGreaves: {
      name: 'Adamantbenskinner'
    },
    smithAetheriteGreaves: {
      name: 'Aetheritbenskinner'
    },
    smithMasterMithrilPlate: {
      name: 'Mesterlig mithrilrustning'
    },
    smithMasterAdamantPlate: {
      name: 'Mesterlig adamantrustning'
    },
    smithMasterAetheritePlate: {
      name: 'Mesterlig aetheritrustning'
    },
    smithMithrilPlate: {
      name: 'Mithrilrustning'
    },
    smithAdamantPlate: {
      name: 'Adamantrustning'
    },
    smithAetheritePlate: {
      name: 'Aetheritrustning'
    },
    smithMasterMithrilHelm: {
      name: 'Mesterlig mithrilhjelm'
    },
    smithMasterAdamantHelm: {
      name: 'Mesterlig adamanthjelm'
    },
    smithMasterAetheriteHelm: {
      name: 'Mesterlig aetherithjelm'
    },
    smithMithrilHelm: {
      name: 'Mithrilhjelm'
    },
    smithAdamantHelm: {
      name: 'Adamanthjelm'
    },
    smithAetheriteHelm: {
      name: 'Aetherithjelm'
    },
    smithMasterMithrilShield: {
      name: 'Mesterligt mithrilskjold'
    },
    smithMasterAdamantShield: {
      name: 'Mesterligt adamantskjold'
    },
    smithMasterAetheriteShield: {
      name: 'Mesterligt aetheritskjold'
    },
    smithMithrilShield: {
      name: 'Mithrilskjold'
    },
    smithAdamantShield: {
      name: 'Adamantskjold'
    },
    smithAetheriteShield: {
      name: 'Aetheritskjold'
    },
    smithMasterMithrilHammer: {
      name: 'Mesterlig mithrilhammer'
    },
    smithMasterAdamantHammer: {
      name: 'Mesterlig adamanthammer'
    },
    smithMasterAetheriteHammer: {
      name: 'Mesterlig aetherithammer'
    },
    smithMithrilHammer: {
      name: 'Mithrilhammer'
    },
    smithAdamantHammer: {
      name: 'Adamanthammer'
    },
    smithAetheriteHammer: {
      name: 'Aetherithammer'
    },
    smithMasterMithrilSword: {
      name: 'Mesterligt mithrilsværd'
    },
    smithMasterAdamantSword: {
      name: 'Mesterligt adamantsværd'
    },
    smithMasterAetheriteSword: {
      name: 'Mesterligt aetheritsværd'
    },
    smithMithrilSword: {
      name: 'Mithrilsværd'
    },
    smithAdamantSword: {
      name: 'Adamantsværd'
    },
    smithAetheriteSword: {
      name: 'Aetheritsværd'
    },
    smithMasterGoldGreaves: {
      name: 'Mesterlige guldbenskinner'
    },
    smithGoldGreaves: {
      name: 'Guldbenskinner'
    },
    smithMasterGoldPlate: {
      name: 'Mesterlig guldrustning'
    },
    smithGoldPlate: {
      name: 'Guldrustning'
    },
    smithMasterGoldHelm: {
      name: 'Mesterlig guldhjelm'
    },
    smithGoldHelm: {
      name: 'Guldhjelm'
    },
    smithMasterGoldShield: {
      name: 'Mesterligt guldskjold'
    },
    smithGoldShield: {
      name: 'Guldskjold'
    },
    smithMasterGoldHammer: {
      name: 'Mesterlig guldhammer'
    },
    smithGoldHammer: {
      name: 'Guldhammer'
    },
    smithMasterGoldSword: {
      name: 'Mesterligt guldsværd'
    },
    smithGoldSword: {
      name: 'Guldsværd'
    },
    smithMasterSilverGreaves: {
      name: 'Mesterlige sølvbenskinner'
    },
    smithSilverGreaves: {
      name: 'Sølvbenskinner'
    },
    smithMasterSilverPlate: {
      name: 'Mesterlig sølvrustning'
    },
    smithSilverPlate: {
      name: 'Sølvrustning'
    },
    smithMasterSilverHelm: {
      name: 'Mesterlig sølvhjelm'
    },
    smithSilverHelm: {
      name: 'Sølvhjelm'
    },
    smithMasterSilverShield: {
      name: 'Mesterligt sølvskjold'
    },
    smithSilverShield: {
      name: 'Sølvskjold'
    },
    smithMasterSilverHammer: {
      name: 'Mesterlig sølvhammer'
    },
    smithSilverHammer: {
      name: 'Sølvhammer'
    },
    smithMasterSilverSword: {
      name: 'Mesterligt sølvsværd'
    },
    smithSilverSword: {
      name: 'Sølvsværd'
    },
    smithMasterIronGreaves: {
      name: 'Mesterlige jernbenskinner'
    },
    smithIronGreaves: {
      name: 'Jernbenskinner'
    },
    smithMasterIronPlate: {
      name: 'Mesterlig jernrustning'
    },
    smithIronPlate: {
      name: 'Jernrustning'
    },
    smithMasterIronHelm: {
      name: 'Mesterlig jernhjelm'
    },
    smithIronHelm: {
      name: 'Jernhjelm'
    },
    smithMasterIronShield: {
      name: 'Mesterligt jernskjold'
    },
    smithIronShield: {
      name: 'Jernskjold'
    },
    smithMasterIronHammer: {
      name: 'Mesterlig jernhammer'
    },
    smithIronHammer: {
      name: 'Jernhammer'
    },
    smithMasterIronSword: {
      name: 'Mesterligt jernsværd'
    },
    smithMasterDexIronSword: {
      name: 'Mesterligt jerndolk · SMI'
    },
    smithDexIronSword: {
      name: 'Jerndolk · SMI'
    },
    smithMasterDexIronHammer: {
      name: 'Mesterligt jernrapir · SMI'
    },
    smithDexIronHammer: {
      name: 'Jernrapir · SMI'
    },
    smithMasterDexIronShield: {
      name: 'Mesterligt jernrundskjold · SMI'
    },
    smithDexIronShield: {
      name: 'Jernrundskjold · SMI'
    },
    smithMasterDexIronHelm: {
      name: 'Mesterligt jernhætte · SMI'
    },
    smithDexIronHelm: {
      name: 'Jernhætte · SMI'
    },
    smithMasterDexIronPlate: {
      name: 'Mesterligt jernlæderrustning · SMI'
    },
    smithDexIronPlate: {
      name: 'Jernlæderrustning · SMI'
    },
    smithMasterDexIronGreaves: {
      name: 'Mesterligt jernstøvler · SMI'
    },
    smithDexIronGreaves: {
      name: 'Jernstøvler · SMI'
    },
    smithMasterDexSilverSword: {
      name: 'Mesterligt sølvdolk · SMI'
    },
    smithDexSilverSword: {
      name: 'Sølvdolk · SMI'
    },
    smithMasterDexSilverHammer: {
      name: 'Mesterligt sølvrapir · SMI'
    },
    smithDexSilverHammer: {
      name: 'Sølvrapir · SMI'
    },
    smithMasterDexSilverShield: {
      name: 'Mesterligt sølvrundskjold · SMI'
    },
    smithDexSilverShield: {
      name: 'Sølvrundskjold · SMI'
    },
    smithMasterDexSilverHelm: {
      name: 'Mesterligt sølvhætte · SMI'
    },
    smithDexSilverHelm: {
      name: 'Sølvhætte · SMI'
    },
    smithMasterDexSilverPlate: {
      name: 'Mesterligt sølvlæderrustning · SMI'
    },
    smithDexSilverPlate: {
      name: 'Sølvlæderrustning · SMI'
    },
    smithMasterDexSilverGreaves: {
      name: 'Mesterligt sølvstøvler · SMI'
    },
    smithDexSilverGreaves: {
      name: 'Sølvstøvler · SMI'
    },
    smithMasterDexGoldSword: {
      name: 'Mesterligt gulddolk · SMI'
    },
    smithDexGoldSword: {
      name: 'Gulddolk · SMI'
    },
    smithMasterDexGoldHammer: {
      name: 'Mesterligt guldrapir · SMI'
    },
    smithDexGoldHammer: {
      name: 'Guldrapir · SMI'
    },
    smithMasterDexGoldShield: {
      name: 'Mesterligt guldrundskjold · SMI'
    },
    smithDexGoldShield: {
      name: 'Guldrundskjold · SMI'
    },
    smithMasterDexGoldHelm: {
      name: 'Mesterligt guldhætte · SMI'
    },
    smithDexGoldHelm: {
      name: 'Guldhætte · SMI'
    },
    smithMasterDexGoldPlate: {
      name: 'Mesterligt guldlæderrustning · SMI'
    },
    smithDexGoldPlate: {
      name: 'Guldlæderrustning · SMI'
    },
    smithMasterDexGoldGreaves: {
      name: 'Mesterligt guldstøvler · SMI'
    },
    smithDexGoldGreaves: {
      name: 'Guldstøvler · SMI'
    },
    smithMasterDexMithrilSword: {
      name: 'Mesterligt mithrildolk · SMI'
    },
    smithMasterDexAdamantSword: {
      name: 'Mesterligt adamantdolk · SMI'
    },
    smithMasterDexAetheriteSword: {
      name: 'Mesterligt aetheritdolk · SMI'
    },
    smithDexMithrilSword: {
      name: 'Mithrildolk · SMI'
    },
    smithDexAdamantSword: {
      name: 'Adamantdolk · SMI'
    },
    smithDexAetheriteSword: {
      name: 'Aetheritdolk · SMI'
    },
    smithMasterDexMithrilHammer: {
      name: 'Mesterligt mithrilrapir · SMI'
    },
    smithMasterDexAdamantHammer: {
      name: 'Mesterligt adamantrapir · SMI'
    },
    smithMasterDexAetheriteHammer: {
      name: 'Mesterligt aetheritrapir · SMI'
    },
    smithDexMithrilHammer: {
      name: 'Mithrilrapir · SMI'
    },
    smithDexAdamantHammer: {
      name: 'Adamantrapir · SMI'
    },
    smithDexAetheriteHammer: {
      name: 'Aetheritrapir · SMI'
    },
    smithMasterDexMithrilShield: {
      name: 'Mesterligt mithrilrundskjold · SMI'
    },
    smithMasterDexAdamantShield: {
      name: 'Mesterligt adamantrundskjold · SMI'
    },
    smithMasterDexAetheriteShield: {
      name: 'Mesterligt aetheritrundskjold · SMI'
    },
    smithDexMithrilShield: {
      name: 'Mithrilrundskjold · SMI'
    },
    smithDexAdamantShield: {
      name: 'Adamantrundskjold · SMI'
    },
    smithDexAetheriteShield: {
      name: 'Aetheritrundskjold · SMI'
    },
    smithMasterDexMithrilHelm: {
      name: 'Mesterligt mithrilhætte · SMI'
    },
    smithMasterDexAdamantHelm: {
      name: 'Mesterligt adamanthætte · SMI'
    },
    smithMasterDexAetheriteHelm: {
      name: 'Mesterligt aetherithætte · SMI'
    },
    smithDexMithrilHelm: {
      name: 'Mithrilhætte · SMI'
    },
    smithDexAdamantHelm: {
      name: 'Adamanthætte · SMI'
    },
    smithDexAetheriteHelm: {
      name: 'Aetherithætte · SMI'
    },
    smithMasterDexMithrilPlate: {
      name: 'Mesterligt mithrillæderrustning · SMI'
    },
    smithMasterDexAdamantPlate: {
      name: 'Mesterligt adamantlæderrustning · SMI'
    },
    smithMasterDexAetheritePlate: {
      name: 'Mesterligt aetheritlæderrustning · SMI'
    },
    smithDexMithrilPlate: {
      name: 'Mithrillæderrustning · SMI'
    },
    smithDexAdamantPlate: {
      name: 'Adamantlæderrustning · SMI'
    },
    smithDexAetheritePlate: {
      name: 'Aetheritlæderrustning · SMI'
    },
    smithMasterDexMithrilGreaves: {
      name: 'Mesterligt mithrilstøvler · SMI'
    },
    smithMasterDexAdamantGreaves: {
      name: 'Mesterligt adamantstøvler · SMI'
    },
    smithMasterDexAetheriteGreaves: {
      name: 'Mesterligt aetheritstøvler · SMI'
    },
    smithDexMithrilGreaves: {
      name: 'Mithrilstøvler · SMI'
    },
    smithDexAdamantGreaves: {
      name: 'Adamantstøvler · SMI'
    },
    smithDexAetheriteGreaves: {
      name: 'Aetheritstøvler · SMI'
    },
    smithMasterIntIronSword: {
      name: 'Mesterligt jerntryllestav · INT'
    },
    smithIntIronSword: {
      name: 'Jerntryllestav · INT'
    },
    smithMasterIntIronHammer: {
      name: 'Mesterligt jernstav · INT'
    },
    smithIntIronHammer: {
      name: 'Jernstav · INT'
    },
    smithMasterIntIronShield: {
      name: 'Mesterligt jernbog · INT'
    },
    smithIntIronShield: {
      name: 'Jernbog · INT'
    },
    smithMasterIntIronHelm: {
      name: 'Mesterligt jerndiadem · INT'
    },
    smithIntIronHelm: {
      name: 'Jerndiadem · INT'
    },
    smithMasterIntIronPlate: {
      name: 'Mesterligt jernkåbe · INT'
    },
    smithIntIronPlate: {
      name: 'Jernkåbe · INT'
    },
    smithMasterIntIronGreaves: {
      name: 'Mesterligt jernstøvler · INT'
    },
    smithIntIronGreaves: {
      name: 'Jernstøvler · INT'
    },
    smithMasterIntSilverSword: {
      name: 'Mesterligt sølvtryllestav · INT'
    },
    smithIntSilverSword: {
      name: 'Sølvtryllestav · INT'
    },
    smithMasterIntSilverHammer: {
      name: 'Mesterligt sølvstav · INT'
    },
    smithIntSilverHammer: {
      name: 'Sølvstav · INT'
    },
    smithMasterIntSilverShield: {
      name: 'Mesterligt sølvbog · INT'
    },
    smithIntSilverShield: {
      name: 'Sølvbog · INT'
    },
    smithMasterIntSilverHelm: {
      name: 'Mesterligt sølvdiadem · INT'
    },
    smithIntSilverHelm: {
      name: 'Sølvdiadem · INT'
    },
    smithMasterIntSilverPlate: {
      name: 'Mesterligt sølvkåbe · INT'
    },
    smithIntSilverPlate: {
      name: 'Sølvkåbe · INT'
    },
    smithMasterIntSilverGreaves: {
      name: 'Mesterligt sølvstøvler · INT'
    },
    smithIntSilverGreaves: {
      name: 'Sølvstøvler · INT'
    },
    smithMasterIntGoldSword: {
      name: 'Mesterligt guldtryllestav · INT'
    },
    smithIntGoldSword: {
      name: 'Guldtryllestav · INT'
    },
    smithMasterIntGoldHammer: {
      name: 'Mesterligt guldstav · INT'
    },
    smithIntGoldHammer: {
      name: 'Guldstav · INT'
    },
    smithMasterIntGoldShield: {
      name: 'Mesterligt guldbog · INT'
    },
    smithIntGoldShield: {
      name: 'Guldbog · INT'
    },
    smithMasterIntGoldHelm: {
      name: 'Mesterligt gulddiadem · INT'
    },
    smithIntGoldHelm: {
      name: 'Gulddiadem · INT'
    },
    smithMasterIntGoldPlate: {
      name: 'Mesterligt guldkåbe · INT'
    },
    smithIntGoldPlate: {
      name: 'Guldkåbe · INT'
    },
    smithMasterIntGoldGreaves: {
      name: 'Mesterligt guldstøvler · INT'
    },
    smithIntGoldGreaves: {
      name: 'Guldstøvler · INT'
    },
    smithMasterIntMithrilSword: {
      name: 'Mesterligt mithriltryllestav · INT'
    },
    smithMasterIntAdamantSword: {
      name: 'Mesterligt adamanttryllestav · INT'
    },
    smithMasterIntAetheriteSword: {
      name: 'Mesterligt aetherittryllestav · INT'
    },
    smithIntMithrilSword: {
      name: 'Mithriltryllestav · INT'
    },
    smithIntAdamantSword: {
      name: 'Adamanttryllestav · INT'
    },
    smithIntAetheriteSword: {
      name: 'Aetherittryllestav · INT'
    },
    smithMasterIntMithrilHammer: {
      name: 'Mesterligt mithrilstav · INT'
    },
    smithMasterIntAdamantHammer: {
      name: 'Mesterligt adamantstav · INT'
    },
    smithMasterIntAetheriteHammer: {
      name: 'Mesterligt aetheritstav · INT'
    },
    smithIntMithrilHammer: {
      name: 'Mithrilstav · INT'
    },
    smithIntAdamantHammer: {
      name: 'Adamantstav · INT'
    },
    smithIntAetheriteHammer: {
      name: 'Aetheritstav · INT'
    },
    smithMasterIntMithrilShield: {
      name: 'Mesterligt mithrilbog · INT'
    },
    smithMasterIntAdamantShield: {
      name: 'Mesterligt adamantbog · INT'
    },
    smithMasterIntAetheriteShield: {
      name: 'Mesterligt aetheritbog · INT'
    },
    smithIntMithrilShield: {
      name: 'Mithrilbog · INT'
    },
    smithIntAdamantShield: {
      name: 'Adamantbog · INT'
    },
    smithIntAetheriteShield: {
      name: 'Aetheritbog · INT'
    },
    smithMasterIntMithrilHelm: {
      name: 'Mesterligt mithrildiadem · INT'
    },
    smithMasterIntAdamantHelm: {
      name: 'Mesterligt adamantdiadem · INT'
    },
    smithMasterIntAetheriteHelm: {
      name: 'Mesterligt aetheritdiadem · INT'
    },
    smithIntMithrilHelm: {
      name: 'Mithrildiadem · INT'
    },
    smithIntAdamantHelm: {
      name: 'Adamantdiadem · INT'
    },
    smithIntAetheriteHelm: {
      name: 'Aetheritdiadem · INT'
    },
    smithMasterIntMithrilPlate: {
      name: 'Mesterligt mithrilkåbe · INT'
    },
    smithMasterIntAdamantPlate: {
      name: 'Mesterligt adamantkåbe · INT'
    },
    smithMasterIntAetheritePlate: {
      name: 'Mesterligt aetheritkåbe · INT'
    },
    smithIntMithrilPlate: {
      name: 'Mithrilkåbe · INT'
    },
    smithIntAdamantPlate: {
      name: 'Adamantkåbe · INT'
    },
    smithIntAetheritePlate: {
      name: 'Aetheritkåbe · INT'
    },
    smithMasterIntMithrilGreaves: {
      name: 'Mesterligt mithrilstøvler · INT'
    },
    smithMasterIntAdamantGreaves: {
      name: 'Mesterligt adamantstøvler · INT'
    },
    smithMasterIntAetheriteGreaves: {
      name: 'Mesterligt aetheritstøvler · INT'
    },
    smithIntMithrilGreaves: {
      name: 'Mithrilstøvler · INT'
    },
    smithIntAdamantGreaves: {
      name: 'Adamantstøvler · INT'
    },
    smithIntAetheriteGreaves: {
      name: 'Aetheritstøvler · INT'
    },
    smithMasterSklIronSword: {
      name: 'Mesterligt jernpistol · TEK'
    },
    smithSklIronSword: {
      name: 'Jernpistol · TEK'
    },
    smithMasterSklIronHammer: {
      name: 'Mesterligt jernriffel · TEK'
    },
    smithSklIronHammer: {
      name: 'Jernriffel · TEK'
    },
    smithMasterSklIronShield: {
      name: 'Mesterligt jernbatteri · TEK'
    },
    smithSklIronShield: {
      name: 'Jernbatteri · TEK'
    },
    smithMasterSklIronHelm: {
      name: 'Mesterligt jernkasket · TEK'
    },
    smithSklIronHelm: {
      name: 'Jernkasket · TEK'
    },
    smithMasterSklIronPlate: {
      name: 'Mesterligt jernsele · TEK'
    },
    smithSklIronPlate: {
      name: 'Jernsele · TEK'
    },
    smithMasterSklIronGreaves: {
      name: 'Mesterligt jernstøvler · TEK'
    },
    smithSklIronGreaves: {
      name: 'Jernstøvler · TEK'
    },
    smithMasterSklSilverSword: {
      name: 'Mesterligt sølvpistol · TEK'
    },
    smithSklSilverSword: {
      name: 'Sølvpistol · TEK'
    },
    smithMasterSklSilverHammer: {
      name: 'Mesterligt sølvriffel · TEK'
    },
    smithSklSilverHammer: {
      name: 'Sølvriffel · TEK'
    },
    smithMasterSklSilverShield: {
      name: 'Mesterligt sølvbatteri · TEK'
    },
    smithSklSilverShield: {
      name: 'Sølvbatteri · TEK'
    },
    smithMasterSklSilverHelm: {
      name: 'Mesterligt sølvkasket · TEK'
    },
    smithSklSilverHelm: {
      name: 'Sølvkasket · TEK'
    },
    smithMasterSklSilverPlate: {
      name: 'Mesterligt sølvsele · TEK'
    },
    smithSklSilverPlate: {
      name: 'Sølvsele · TEK'
    },
    smithMasterSklSilverGreaves: {
      name: 'Mesterligt sølvstøvler · TEK'
    },
    smithSklSilverGreaves: {
      name: 'Sølvstøvler · TEK'
    },
    smithMasterSklGoldSword: {
      name: 'Mesterligt guldpistol · TEK'
    },
    smithSklGoldSword: {
      name: 'Guldpistol · TEK'
    },
    smithMasterSklGoldHammer: {
      name: 'Mesterligt guldriffel · TEK'
    },
    smithSklGoldHammer: {
      name: 'Guldriffel · TEK'
    },
    smithMasterSklGoldShield: {
      name: 'Mesterligt guldbatteri · TEK'
    },
    smithSklGoldShield: {
      name: 'Guldbatteri · TEK'
    },
    smithMasterSklGoldHelm: {
      name: 'Mesterligt guldkasket · TEK'
    },
    smithSklGoldHelm: {
      name: 'Guldkasket · TEK'
    },
    smithMasterSklGoldPlate: {
      name: 'Mesterligt guldsele · TEK'
    },
    smithSklGoldPlate: {
      name: 'Guldsele · TEK'
    },
    smithMasterSklGoldGreaves: {
      name: 'Mesterligt guldstøvler · TEK'
    },
    smithSklGoldGreaves: {
      name: 'Guldstøvler · TEK'
    },
    smithMasterSklMithrilSword: {
      name: 'Mesterligt mithrilpistol · TEK'
    },
    smithMasterSklAdamantSword: {
      name: 'Mesterligt adamantpistol · TEK'
    },
    smithMasterSklAetheriteSword: {
      name: 'Mesterligt aetheritpistol · TEK'
    },
    smithSklMithrilSword: {
      name: 'Mithrilpistol · TEK'
    },
    smithSklAdamantSword: {
      name: 'Adamantpistol · TEK'
    },
    smithSklAetheriteSword: {
      name: 'Aetheritpistol · TEK'
    },
    smithMasterSklMithrilHammer: {
      name: 'Mesterligt mithrilriffel · TEK'
    },
    smithMasterSklAdamantHammer: {
      name: 'Mesterligt adamantriffel · TEK'
    },
    smithMasterSklAetheriteHammer: {
      name: 'Mesterligt aetheritriffel · TEK'
    },
    smithSklMithrilHammer: {
      name: 'Mithrilriffel · TEK'
    },
    smithSklAdamantHammer: {
      name: 'Adamantriffel · TEK'
    },
    smithSklAetheriteHammer: {
      name: 'Aetheritriffel · TEK'
    },
    smithMasterSklMithrilShield: {
      name: 'Mesterligt mithrilbatteri · TEK'
    },
    smithMasterSklAdamantShield: {
      name: 'Mesterligt adamantbatteri · TEK'
    },
    smithMasterSklAetheriteShield: {
      name: 'Mesterligt aetheritbatteri · TEK'
    },
    smithSklMithrilShield: {
      name: 'Mithrilbatteri · TEK'
    },
    smithSklAdamantShield: {
      name: 'Adamantbatteri · TEK'
    },
    smithSklAetheriteShield: {
      name: 'Aetheritbatteri · TEK'
    },
    smithMasterSklMithrilHelm: {
      name: 'Mesterligt mithrilkasket · TEK'
    },
    smithMasterSklAdamantHelm: {
      name: 'Mesterligt adamantkasket · TEK'
    },
    smithMasterSklAetheriteHelm: {
      name: 'Mesterligt aetheritkasket · TEK'
    },
    smithSklMithrilHelm: {
      name: 'Mithrilkasket · TEK'
    },
    smithSklAdamantHelm: {
      name: 'Adamantkasket · TEK'
    },
    smithSklAetheriteHelm: {
      name: 'Aetheritkasket · TEK'
    },
    smithMasterSklMithrilPlate: {
      name: 'Mesterligt mithrilsele · TEK'
    },
    smithMasterSklAdamantPlate: {
      name: 'Mesterligt adamantsele · TEK'
    },
    smithMasterSklAetheritePlate: {
      name: 'Mesterligt aetheritsele · TEK'
    },
    smithSklMithrilPlate: {
      name: 'Mithrilsele · TEK'
    },
    smithSklAdamantPlate: {
      name: 'Adamantsele · TEK'
    },
    smithSklAetheritePlate: {
      name: 'Aetheritsele · TEK'
    },
    smithMasterSklMithrilGreaves: {
      name: 'Mesterligt mithrilstøvler · TEK'
    },
    smithMasterSklAdamantGreaves: {
      name: 'Mesterligt adamantstøvler · TEK'
    },
    smithMasterSklAetheriteGreaves: {
      name: 'Mesterligt aetheritstøvler · TEK'
    },
    smithSklMithrilGreaves: {
      name: 'Mithrilstøvler · TEK'
    },
    smithSklAdamantGreaves: {
      name: 'Adamantstøvler · TEK'
    },
    smithSklAetheriteGreaves: {
      name: 'Aetheritstøvler · TEK'
    },
    smithMasterChaIronSword: {
      name: 'Mesterligt jernscepter · KAR'
    },
    smithChaIronSword: {
      name: 'Jernscepter · KAR'
    },
    smithMasterChaIronHammer: {
      name: 'Mesterligt jernbanner · KAR'
    },
    smithChaIronHammer: {
      name: 'Jernbanner · KAR'
    },
    smithMasterChaIronShield: {
      name: 'Mesterligt jernkodeks · KAR'
    },
    smithChaIronShield: {
      name: 'Jernkodeks · KAR'
    },
    smithMasterChaIronHelm: {
      name: 'Mesterligt jernkrone · KAR'
    },
    smithChaIronHelm: {
      name: 'Jernkrone · KAR'
    },
    smithMasterChaIronPlate: {
      name: 'Mesterligt jerntabard · KAR'
    },
    smithChaIronPlate: {
      name: 'Jerntabard · KAR'
    },
    smithMasterChaIronGreaves: {
      name: 'Mesterligt jernstøvler · KAR'
    },
    smithChaIronGreaves: {
      name: 'Jernstøvler · KAR'
    },
    smithMasterChaSilverSword: {
      name: 'Mesterligt sølvscepter · KAR'
    },
    smithChaSilverSword: {
      name: 'Sølvscepter · KAR'
    },
    smithMasterChaSilverHammer: {
      name: 'Mesterligt sølvbanner · KAR'
    },
    smithChaSilverHammer: {
      name: 'Sølvbanner · KAR'
    },
    smithMasterChaSilverShield: {
      name: 'Mesterligt sølvkodeks · KAR'
    },
    smithChaSilverShield: {
      name: 'Sølvkodeks · KAR'
    },
    smithMasterChaSilverHelm: {
      name: 'Mesterligt sølvkrone · KAR'
    },
    smithChaSilverHelm: {
      name: 'Sølvkrone · KAR'
    },
    smithMasterChaSilverPlate: {
      name: 'Mesterligt sølvtabard · KAR'
    },
    smithChaSilverPlate: {
      name: 'Sølvtabard · KAR'
    },
    smithMasterChaSilverGreaves: {
      name: 'Mesterligt sølvstøvler · KAR'
    },
    smithChaSilverGreaves: {
      name: 'Sølvstøvler · KAR'
    },
    smithMasterChaGoldSword: {
      name: 'Mesterligt guldscepter · KAR'
    },
    smithChaGoldSword: {
      name: 'Guldscepter · KAR'
    },
    smithMasterChaGoldHammer: {
      name: 'Mesterligt guldbanner · KAR'
    },
    smithChaGoldHammer: {
      name: 'Guldbanner · KAR'
    },
    smithMasterChaGoldShield: {
      name: 'Mesterligt guldkodeks · KAR'
    },
    smithChaGoldShield: {
      name: 'Guldkodeks · KAR'
    },
    smithMasterChaGoldHelm: {
      name: 'Mesterligt guldkrone · KAR'
    },
    smithChaGoldHelm: {
      name: 'Guldkrone · KAR'
    },
    smithMasterChaGoldPlate: {
      name: 'Mesterligt guldtabard · KAR'
    },
    smithChaGoldPlate: {
      name: 'Guldtabard · KAR'
    },
    smithMasterChaGoldGreaves: {
      name: 'Mesterligt guldstøvler · KAR'
    },
    smithChaGoldGreaves: {
      name: 'Guldstøvler · KAR'
    },
    smithMasterChaMithrilSword: {
      name: 'Mesterligt mithrilscepter · KAR'
    },
    smithMasterChaAdamantSword: {
      name: 'Mesterligt adamantscepter · KAR'
    },
    smithMasterChaAetheriteSword: {
      name: 'Mesterligt aetheritscepter · KAR'
    },
    smithChaMithrilSword: {
      name: 'Mithrilscepter · KAR'
    },
    smithChaAdamantSword: {
      name: 'Adamantscepter · KAR'
    },
    smithChaAetheriteSword: {
      name: 'Aetheritscepter · KAR'
    },
    smithMasterChaMithrilHammer: {
      name: 'Mesterligt mithrilbanner · KAR'
    },
    smithMasterChaAdamantHammer: {
      name: 'Mesterligt adamantbanner · KAR'
    },
    smithMasterChaAetheriteHammer: {
      name: 'Mesterligt aetheritbanner · KAR'
    },
    smithChaMithrilHammer: {
      name: 'Mithrilbanner · KAR'
    },
    smithChaAdamantHammer: {
      name: 'Adamantbanner · KAR'
    },
    smithChaAetheriteHammer: {
      name: 'Aetheritbanner · KAR'
    },
    smithMasterChaMithrilShield: {
      name: 'Mesterligt mithrilkodeks · KAR'
    },
    smithMasterChaAdamantShield: {
      name: 'Mesterligt adamantkodeks · KAR'
    },
    smithMasterChaAetheriteShield: {
      name: 'Mesterligt aetheritkodeks · KAR'
    },
    smithChaMithrilShield: {
      name: 'Mithrilkodeks · KAR'
    },
    smithChaAdamantShield: {
      name: 'Adamantkodeks · KAR'
    },
    smithChaAetheriteShield: {
      name: 'Aetheritkodeks · KAR'
    },
    smithMasterChaMithrilHelm: {
      name: 'Mesterligt mithrilkrone · KAR'
    },
    smithMasterChaAdamantHelm: {
      name: 'Mesterligt adamantkrone · KAR'
    },
    smithMasterChaAetheriteHelm: {
      name: 'Mesterligt aetheritkrone · KAR'
    },
    smithChaMithrilHelm: {
      name: 'Mithrilkrone · KAR'
    },
    smithChaAdamantHelm: {
      name: 'Adamantkrone · KAR'
    },
    smithChaAetheriteHelm: {
      name: 'Aetheritkrone · KAR'
    },
    smithMasterChaMithrilPlate: {
      name: 'Mesterligt mithriltabard · KAR'
    },
    smithMasterChaAdamantPlate: {
      name: 'Mesterligt adamanttabard · KAR'
    },
    smithMasterChaAetheritePlate: {
      name: 'Mesterligt aetherittabard · KAR'
    },
    smithChaMithrilPlate: {
      name: 'Mithriltabard · KAR'
    },
    smithChaAdamantPlate: {
      name: 'Adamanttabard · KAR'
    },
    smithChaAetheritePlate: {
      name: 'Aetherittabard · KAR'
    },
    smithMasterChaMithrilGreaves: {
      name: 'Mesterligt mithrilstøvler · KAR'
    },
    smithMasterChaAdamantGreaves: {
      name: 'Mesterligt adamantstøvler · KAR'
    },
    smithMasterChaAetheriteGreaves: {
      name: 'Mesterligt aetheritstøvler · KAR'
    },
    smithChaMithrilGreaves: {
      name: 'Mithrilstøvler · KAR'
    },
    smithChaAdamantGreaves: {
      name: 'Adamantstøvler · KAR'
    },
    smithChaAetheriteGreaves: {
      name: 'Aetheritstøvler · KAR'
    },
    smithMasterEndIronSword: {
      name: 'Mesterligt jernstridskølle · UDH'
    },
    smithEndIronSword: {
      name: 'Jernstridskølle · UDH'
    },
    smithMasterEndIronHammer: {
      name: 'Mesterligt jernøkse · UDH'
    },
    smithEndIronHammer: {
      name: 'Jernøkse · UDH'
    },
    smithMasterEndIronShield: {
      name: 'Mesterligt jernskjold · UDH'
    },
    smithEndIronShield: {
      name: 'Jernskjold · UDH'
    },
    smithMasterEndIronHelm: {
      name: 'Mesterlig jernhjelm · UDH'
    },
    smithEndIronHelm: {
      name: 'Jernhjelm · UDH'
    },
    smithMasterEndIronPlate: {
      name: 'Mesterlig jernrustning · UDH'
    },
    smithEndIronPlate: {
      name: 'Jernrustning · UDH'
    },
    smithMasterEndIronGreaves: {
      name: 'Mesterlige jernbenskinner · UDH'
    },
    smithEndIronGreaves: {
      name: 'Jernbenskinner · UDH'
    },
    smithMasterEndSilverSword: {
      name: 'Mesterligt sølvstridskølle · UDH'
    },
    smithEndSilverSword: {
      name: 'Sølvstridskølle · UDH'
    },
    smithMasterEndSilverHammer: {
      name: 'Mesterligt sølvøkse · UDH'
    },
    smithEndSilverHammer: {
      name: 'Sølvøkse · UDH'
    },
    smithMasterEndSilverShield: {
      name: 'Mesterligt sølvskjold · UDH'
    },
    smithEndSilverShield: {
      name: 'Sølvskjold · UDH'
    },
    smithMasterEndSilverHelm: {
      name: 'Mesterlig sølvhjelm · UDH'
    },
    smithEndSilverHelm: {
      name: 'Sølvhjelm · UDH'
    },
    smithMasterEndSilverPlate: {
      name: 'Mesterlig sølvrustning · UDH'
    },
    smithEndSilverPlate: {
      name: 'Sølvrustning · UDH'
    },
    smithMasterEndSilverGreaves: {
      name: 'Mesterlige sølvbenskinner · UDH'
    },
    smithEndSilverGreaves: {
      name: 'Sølvbenskinner · UDH'
    },
    smithMasterEndGoldSword: {
      name: 'Mesterligt guldstridskølle · UDH'
    },
    smithEndGoldSword: {
      name: 'Guldstridskølle · UDH'
    },
    smithMasterEndGoldHammer: {
      name: 'Mesterligt guldøkse · UDH'
    },
    smithEndGoldHammer: {
      name: 'Guldøkse · UDH'
    },
    smithMasterEndGoldShield: {
      name: 'Mesterligt guldskjold · UDH'
    },
    smithEndGoldShield: {
      name: 'Guldskjold · UDH'
    },
    smithMasterEndGoldHelm: {
      name: 'Mesterlig guldhjelm · UDH'
    },
    smithEndGoldHelm: {
      name: 'Guldhjelm · UDH'
    },
    smithMasterEndGoldPlate: {
      name: 'Mesterlig guldrustning · UDH'
    },
    smithEndGoldPlate: {
      name: 'Guldrustning · UDH'
    },
    smithMasterEndGoldGreaves: {
      name: 'Mesterlige guldbenskinner · UDH'
    },
    smithEndGoldGreaves: {
      name: 'Guldbenskinner · UDH'
    },
    smithMasterEndMithrilSword: {
      name: 'Mesterligt mithrilstridskølle · UDH'
    },
    smithMasterEndAdamantSword: {
      name: 'Mesterligt adamantstridskølle · UDH'
    },
    smithMasterEndAetheriteSword: {
      name: 'Mesterligt aetheritstridskølle · UDH'
    },
    smithEndMithrilSword: {
      name: 'Mithrilstridskølle · UDH'
    },
    smithEndAdamantSword: {
      name: 'Adamantstridskølle · UDH'
    },
    smithEndAetheriteSword: {
      name: 'Aetheritstridskølle · UDH'
    },
    smithMasterEndMithrilHammer: {
      name: 'Mesterligt mithriløkse · UDH'
    },
    smithMasterEndAdamantHammer: {
      name: 'Mesterligt adamantøkse · UDH'
    },
    smithMasterEndAetheriteHammer: {
      name: 'Mesterligt aetheritøkse · UDH'
    },
    smithEndMithrilHammer: {
      name: 'Mithriløkse · UDH'
    },
    smithEndAdamantHammer: {
      name: 'Adamantøkse · UDH'
    },
    smithEndAetheriteHammer: {
      name: 'Aetheritøkse · UDH'
    },
    smithMasterEndMithrilShield: {
      name: 'Mesterligt mithrilskjold · UDH'
    },
    smithMasterEndAdamantShield: {
      name: 'Mesterligt adamantskjold · UDH'
    },
    smithMasterEndAetheriteShield: {
      name: 'Mesterligt aetheritskjold · UDH'
    },
    smithEndMithrilShield: {
      name: 'Mithrilskjold · UDH'
    },
    smithEndAdamantShield: {
      name: 'Adamantskjold · UDH'
    },
    smithEndAetheriteShield: {
      name: 'Aetheritskjold · UDH'
    },
    smithMasterEndMithrilHelm: {
      name: 'Mesterlig mithrilhjelm · UDH'
    },
    smithMasterEndAdamantHelm: {
      name: 'Mesterlig adamanthjelm · UDH'
    },
    smithMasterEndAetheriteHelm: {
      name: 'Mesterlig aetherithjelm · UDH'
    },
    smithEndMithrilHelm: {
      name: 'Mithrilhjelm · UDH'
    },
    smithEndAdamantHelm: {
      name: 'Adamanthjelm · UDH'
    },
    smithEndAetheriteHelm: {
      name: 'Aetherithjelm · UDH'
    },
    smithMasterEndMithrilPlate: {
      name: 'Mesterlig mithrilrustning · UDH'
    },
    smithMasterEndAdamantPlate: {
      name: 'Mesterlig adamantrustning · UDH'
    },
    smithMasterEndAetheritePlate: {
      name: 'Mesterlig aetheritrustning · UDH'
    },
    smithEndMithrilPlate: {
      name: 'Mithrilrustning · UDH'
    },
    smithEndAdamantPlate: {
      name: 'Adamantrustning · UDH'
    },
    smithEndAetheritePlate: {
      name: 'Aetheritrustning · UDH'
    },
    smithMasterEndMithrilGreaves: {
      name: 'Mesterlige mithrilbenskinner · UDH'
    },
    smithMasterEndAdamantGreaves: {
      name: 'Mesterlige adamantbenskinner · UDH'
    },
    smithMasterEndAetheriteGreaves: {
      name: 'Mesterlige aetheritbenskinner · UDH'
    },
    smithEndMithrilGreaves: {
      name: 'Mithrilbenskinner · UDH'
    },
    smithEndAdamantGreaves: {
      name: 'Adamantbenskinner · UDH'
    },
    smithEndAetheriteGreaves: {
      name: 'Aetheritbenskinner · UDH'
    },
    smithIronSword: {
      name: 'Jernsværd'
    },
    rustedShortsword: {
      name: 'Rustent kortsværd'
    },
    apprenticeStaff: {
      name: 'Lærlingestav'
    },
    scoutsHandgun: {
      name: 'Spejderens pistol'
    },
    ironBroadsword: {
      name: 'Bredsværd af jern'
    },
    vipinsStiletto: {
      name: 'Vipins stilet'
    },
    aetherCarbine: {
      name: 'Æterkarabin'
    },
    ashenGreatsword: {
      name: 'Askegråt storsværd'
    },
    archmageWand: {
      name: 'Ærkemagerens tryllestav'
    },
    chronoBlade: {
      name: 'Kronoklinge'
    },
    bloodForgedAxe: {
      name: 'Blodsmedet økse'
    },
    voidCannon: {
      name: 'Tomhedskanon'
    },
    dragonSmasher: {
      name: 'Drageknuser'
    },
    bladeOfTheUnbound: {
      name: 'De ubundnes klinge'
    },
    aetheriumDestroyer: {
      name: 'Æterium-ødelægger'
    },
    woodenBuckler: {
      name: 'Træbuckler'
    },
    tomeOfNovices: {
      name: 'Novicernes bog'
    },
    ironShield: {
      name: 'Jernskjold'
    },
    syringeOfTheAdept: {
      name: 'Adeptens sprøjte'
    },
    aethericBattery: {
      name: 'Æterbatteri'
    },
    aegisTowerShield: {
      name: 'Aegis-tårnskjold'
    },
    orbOfEternalFlame: {
      name: 'Den evige flammes kugle'
    },
    shieldOfTheFallen: {
      name: 'De faldnes skjold'
    },
    paddedTunic: {
      name: 'Polstret tunika'
    },
    leatherDoublet: {
      name: 'Lædervams'
    },
    chainmailVest: {
      name: 'Ringbrynjevest'
    },
    scholarsRobe: {
      name: 'Den lærdes kåbe'
    },
    reinforcedPlate: {
      name: 'Forstærket pladerustning'
    },
    assassinsGarb: {
      name: 'Snigmorderens dragt'
    },
    chronoWeaverCloak: {
      name: 'Kronovæverens kappe'
    },
    bloodSoakedPlate: {
      name: 'Blodvædet pladerustning'
    },
    exoArmorChassis: {
      name: 'Exorustningschassis'
    },
    dragonscaleHauberk: {
      name: 'Drageskælsbrynje'
    },
    vestmentsOfSovereign: {
      name: 'Suverænens skrud'
    },
    armorOfTheTitan: {
      name: 'Titanens rustning'
    },
    quiltedCap: {
      name: 'Quiltet hue'
    },
    stalkersHood: {
      name: 'Luskerens hætte'
    },
    ironcladHelm: {
      name: 'Jernklædt hjelm'
    },
    seersCirclet: {
      name: 'Seerens diadem'
    },
    wyrmguardGreathelm: {
      name: 'Drageværnets storhjelm'
    },
    hatOfTheStarweaver: {
      name: 'Stjernevæverens hat'
    },
    hideGloves: {
      name: 'Skindhandsker'
    },
    ironGauntlets: {
      name: 'Jernhandsker'
    },
    emberweaveGloves: {
      name: 'Glødevævede handsker'
    },
    duelistsGrips: {
      name: 'Duellantens greb'
    },
    voidforgedGauntlets: {
      name: 'Tomhedssmedede panserhandsker'
    },
    gripsOfTheTempest: {
      name: 'Stormens greb'
    },
    trailBoots: {
      name: 'Stistøvler'
    },
    pathfindersBoots: {
      name: 'Stifinderens støvler'
    },
    forgeplateGreaves: {
      name: 'Smedjepladens benskinner'
    },
    mistwalkerBoots: {
      name: 'Tågevandrerens støvler'
    },
    stormstrideGreaves: {
      name: 'Stormskridtets benskinner'
    },
    treadsOfTheHorizon: {
      name: 'Horisontens skridt'
    },
    copperBand: {
      name: 'Kobberring'
    },
    ringOfMending: {
      name: 'Helingens ring'
    },
    bandOfSwiftness: {
      name: 'Hurtighedens ring'
    },
    castersEmblem: {
      name: 'Magikerens emblem'
    },
    infiltratorsCharm: {
      name: 'Infiltratorens amulet'
    },
    timekeepersHourglass: {
      name: 'Tidsvogterens timeglas'
    },
    ringOfTheVampyre: {
      name: 'Vampyrens ring'
    },
    sovereignsSignet: {
      name: 'Suverænens signet'
    },
    heraldsPin: {
      name: 'Heroldens nål'
    },
    hymnalOfTheRoad: {
      name: 'Vejens salmebog'
    },
    shepherdsCrook: {
      name: 'Hyrdestav'
    },
    minstrelsHat: {
      name: 'Spillemandshat'
    },
    pilgrimsSandals: {
      name: 'Pilgrimssandaler'
    },
    falconersGloves: {
      name: 'Falkonerhandsker'
    },
    bellOfTheHerd: {
      name: 'Flokkens klokke'
    },
    bannerOfTheHost: {
      name: 'Hærens banner'
    },
    heraldsTabard: {
      name: 'Heroldens våbenkjortel'
    },
    codexOfOaths: {
      name: 'Edernes kodeks'
    },
    crownOfTheRightfulKing: {
      name: 'Den retmæssige konges krone'
    },
    scepterOfTheFirstKing: {
      name: 'Den første konges scepter'
    },
    pickpocketsKnife: {
      name: 'Lommetyvens kniv'
    },
    serpentsFang: {
      name: 'Slangetand'
    },
    phantomRapier: {
      name: 'Spøgelsesrapir'
    },
    fangOfTheWindless: {
      name: 'Vindstillens hugtand'
    },
    roguesBuckler: {
      name: 'Slyngelens buckler'
    },
    venomVial: {
      name: 'Giftflaske'
    },
    swiftguardBuckler: {
      name: 'Hurtigvagtens buckler'
    },
    nightshadeFlask: {
      name: 'Natskyggeflaske'
    },
    windveilTarge: {
      name: 'Vindslørets targe'
    },
    shadowdancersBuckler: {
      name: 'Skyggedanserens buckler'
    },
    scoutsBandana: {
      name: 'Spejderens bandana'
    },
    nightcowl: {
      name: 'Natkappe'
    },
    shadowveilHood: {
      name: 'Skyggeslørets hætte'
    },
    windrunnersCap: {
      name: 'Vindløberens kasket'
    },
    maskOfTheSilentWind: {
      name: 'Den tavse vinds maske'
    },
    rangersJerkin: {
      name: 'Rangerens trøje'
    },
    nightstalkerLeathers: {
      name: 'Natjægerens læder'
    },
    windridersHarness: {
      name: 'Vindrytterens seletøj'
    },
    mantleOfTheShadowDancer: {
      name: 'Skyggedanserens kappe'
    },
    thiefsGloves: {
      name: 'Tyvehandsker'
    },
    cutpurseGloves: {
      name: 'Pungskærerhandsker'
    },
    glovesOfTheGale: {
      name: 'Stormens handsker'
    },
    softSoledShoes: {
      name: 'Blødsolede sko'
    },
    catStepBoots: {
      name: 'Kattetrinsstøvler'
    },
    shadowstepBoots: {
      name: 'Skyggetrinsstøvler'
    },
    windstrideBoots: {
      name: 'Vindtrinsstøvler'
    },
    luckyCoin: {
      name: 'Lykkemønt'
    },
    shadowBand: {
      name: 'Skyggering'
    },
    sandglassOfTheSwift: {
      name: 'De hurtiges timeglas'
    },
    talonCharm: {
      name: 'Kloamulet'
    },
    windheart: {
      name: 'Vindhjerte'
    },
    ashwallHeater: {
      name: 'Askemurskjold'
    },
    wyrmhidePavise: {
      name: 'Drageskindspaves'
    },
    footmansKettleHat: {
      name: 'Fodfolkets kogehat'
    },
    ironbrowSallet: {
      name: 'Jernbrynsalade'
    },
    warlordsBarbute: {
      name: 'Krigsherrens barbut'
    },
    helmOfTheSunderedThrone: {
      name: 'Den knuste trones hjelm'
    },
    recruitsCuirass: {
      name: 'Rekruttens kyrads'
    },
    stonecuttersMitts: {
      name: 'Stenhuggerens vanter'
    },
    ashforgedGauntlets: {
      name: 'Askesmedede panserhandsker'
    },
    warbringerGauntlets: {
      name: 'Krigsbringerens panserhandsker'
    },
    titanfistGauntlets: {
      name: 'Titanneveens panserhandsker'
    },
    footmansGreaves: {
      name: 'Fodsoldatens benskinner'
    },
    ironshodGreaves: {
      name: 'Jernbeslåede benskinner'
    },
    warlordsSabatons: {
      name: 'Krigsherrens sabatoner'
    },
    greavesOfTheMountainfall: {
      name: 'Bjergskredets benskinner'
    },
    sergeantsSignet: {
      name: 'Sergentens signetring'
    },
    brawlersKnuckleRing: {
      name: 'Slagsbrodrens knojern'
    },
    bloodiedWarMedal: {
      name: 'Blodplettet krigsmedalje'
    },
    watchmansCudgel: {
      name: 'Vogterens knippel'
    },
    ironboundMace: {
      name: 'Jernbundet stridskølle'
    },
    stonehideCleaver: {
      name: 'Stenhudskløver'
    },
    bulwarkMaul: {
      name: 'Bastionens hammer'
    },
    mountainsplitterAxe: {
      name: 'Bjergkløverøkse'
    },
    everstandWarmace: {
      name: 'Urokkelig krigskølle'
    },
    emberwallBastion: {
      name: 'Gløddmursbastion'
    },
    stonewardenHelm: {
      name: 'Stenvogterens hjelm'
    },
    colossusVisage: {
      name: 'Kolossens ansigt'
    },
    diggersGauntlets: {
      name: 'Graverens panserhandsker'
    },
    bastionGauntlets: {
      name: 'Bastionens panserhandsker'
    },
    glacierplateGauntlets: {
      name: 'Gletsjerpladens panserhandsker'
    },
    gauntletsOfEndlessVigil: {
      name: 'Den evige vagts panserhandsker'
    },
    hearthstoneCharm: {
      name: 'Arnestenstalisman'
    },
    ironheartPendant: {
      name: 'Jernhjertevedhæng'
    },
    hedgewizardsWand: {
      name: 'Hegnstrylleres tryllestav'
    },
    frostglassStaff: {
      name: 'Frostglasstav'
    },
    voidthreadWand: {
      name: 'Tomhedstrådens tryllestav'
    },
    staffOfTheStarlessSky: {
      name: 'Den stjerneløse himmels stav'
    },
    studentsGrimoire: {
      name: 'Elevens grimoire'
    },
    frostfireOrb: {
      name: 'Frostildskugle'
    },
    orbOfTheUnwrittenHour: {
      name: 'Den uskrevne times kugle'
    },
    apprenticesPointedCap: {
      name: 'Lærlingens spidse hue'
    },
    sagesCirclet: {
      name: 'Vismandens diadem'
    },
    cinderWizardsHat: {
      name: 'Askemagikerens hat'
    },
    voidseerCirclet: {
      name: 'Tomhedsseerens diadem'
    },
    apprenticesRobe: {
      name: 'Lærlingens kåbe'
    },
    cinderthreadRobe: {
      name: 'Askestrådskåbe'
    },
    voidwovenRobe: {
      name: 'Tomhedsvævet kåbe'
    },
    inkStainedGloves: {
      name: 'Blækplettede handsker'
    },
    spellthreadGloves: {
      name: 'Trylleformelshandsker'
    },
    frostweaveGloves: {
      name: 'Frostvævede handsker'
    },
    starlitGloves: {
      name: 'Stjernelyshandsker'
    },
    glovesOfTheLastWord: {
      name: 'Det sidste ords handsker'
    },
    scribesSlippers: {
      name: 'Skriverens tøfler'
    },
    moonstepSlippers: {
      name: 'Månetrintstøfler'
    },
    emberstepBoots: {
      name: 'Gløddetrinsstøvler'
    },
    voidwalkerBoots: {
      name: 'Tomhedsvandrerens støvler'
    },
    bootsOfTheWanderingStar: {
      name: 'Den vandrende stjernes støvler'
    },
    glowstonePendant: {
      name: 'Gløddestenshængende'
    },
    scholarsSeal: {
      name: 'Den lærdes segl'
    },
    eyeOfTheArchon: {
      name: 'Arkontens øje'
    },
    cinderRepeater: {
      name: 'Askerepetergevær'
    },
    glacierMortar: {
      name: 'Gletsjerhåndmorter'
    },
    sparkCell: {
      name: 'Gnistcelle'
    },
    arcCapacitor: {
      name: 'Lysbuekondensator'
    },
    aetherheartCell: {
      name: 'Eterhjertecelle'
    },
    marksmansVisor: {
      name: 'Skyttens visir'
    },
    sharpshootersCap: {
      name: 'Snigskyttens kasket'
    },
    gunnersHarness: {
      name: 'Artilleristens sele'
    },
    steadyhandGloves: {
      name: 'Den rolige hånds handsker'
    },
    gunsmithsGloves: {
      name: 'Bøssemagerens handsker'
    },
    scrappersBoots: {
      name: 'Slagsbrodrens støvler'
    },
    sharpshooterBoots: {
      name: 'Snigskyttens støvler'
    },
    firingLineBoots: {
      name: 'Ildlinjens støvler'
    },
    steadyfootBoots: {
      name: 'Fastfodens støvler'
    },
    aetherstepBoots: {
      name: 'Eterskridtsstøvler'
    },
    bootsOfTheLastShot: {
      name: 'Sidste skuds støvler'
    },
    brassCartridgeCharm: {
      name: 'Messingpatronstalisman'
    },
    deadEyeLens: {
      name: 'Dødsblikkets linse'
    },
    eagleEyeScope: {
      name: 'Ørneøjets kikkert'
    },
    criersBaton: {
      name: 'Udråberens stav'
    },
    droversStandard: {
      name: 'Driverens standar'
    },
    marshalsSceptre: {
      name: 'Marskalkens scepter'
    },
    balladBook: {
      name: 'Balladebog'
    },
    chronicleOfHeroes: {
      name: 'Heltenes krønike'
    },
    psalterOfTheHost: {
      name: 'Hærens salmebog'
    },
    tomeOfEternalReign: {
      name: 'Det evige herredømmes bind'
    },
    heraldsCap: {
      name: 'Heroldens kasket'
    },
    singersCirclet: {
      name: 'Sangerens diadem'
    },
    diademOfTenThousandVoices: {
      name: 'De ti tusinde stemmers diadem'
    },
    travelersWaistcoat: {
      name: 'Rejsendes vest'
    },
    minstrelsMotley: {
      name: 'Spillemandens lappede dragt'
    },
    troubadoursCoat: {
      name: 'Troubadourens frakke'
    },
    marshalsGreatcoat: {
      name: 'Marskalkens frakke'
    },
    buskersGloves: {
      name: 'Gademusikantens handsker'
    },
    drummersGloves: {
      name: 'Trommeslagerens handsker'
    },
    standardBearersGloves: {
      name: 'Fanebærerens handsker'
    },
    gildedParadeGloves: {
      name: 'Forgyldte paradehandsker'
    },
    glovesOfTheCrownedHand: {
      name: 'Den kronede hånds handsker'
    },
    wayfarersShoes: {
      name: 'Vandrerens sko'
    },
    troubadourBoots: {
      name: 'Troubadourens støvler'
    },
    heraldsRidingBoots: {
      name: 'Heroldens ridestøvler'
    },
    paradeBoots: {
      name: 'Paradestøvler'
    },
    bootsOfTheLongProcession: {
      name: 'Den lange procession støvler'
    },
    silverWhistle: {
      name: 'Sølvfløjte'
    },
    gatheringHorn: {
      name: 'Samlingshorn'
    },
    heartOfTheMountain: {
      name: 'Bjergets hjerte'
    },
    ringOfAbsolutePower: {
      name: 'Den absolutte magts ring'
    }
  },
  bag: {
    oreCount: '{ore}: {n}',
    noOre: 'Ingen malm endnu. Bryd den fra malmårerne ved klipperne ude i vildmarken.',
    equip: 'Udrust',
    unequip: 'Tag af',
    worn: 'Du har den på. Tag den af for at sælge den.',
    versus: 'Sammenlignet med {item}',
    hint: 'Tryk på en ting for at se på den. Tryk igen, eller træk den hen på en plads, for at tage den på.',
    empty: 'Ingen ting af den slags i tasken.',
    slotEmpty: '{slot}: tom',
    slotHolds: '{slot}: {item}',
    filter: {
      ore: 'Malm',
      all: 'Alle',
      weapons: 'Våben',
      armor: 'Rustning',
      trinkets: 'Smykker',
      herbs: 'Urter'
    },
    sort: {
      slot: 'Type',
      tier: 'Kvalitet',
      level: 'Niveau'
    },
    sortBy: 'Sortér efter: {by}',
    noHerbs: 'Ingen urter endnu. De vokser ude i naturen: gå hen over en for at plukke den.',
    herbCount: '{plant}: {n}'
  },
  shop: {
    buy: 'Køb',
    sell: 'Sælg',
    owned: 'Ejet',
    empty: 'Der er intet på hylderne i dag.',
    goods: 'Til salg',
    price: 'Pris',
    value: 'De betaler',
    hint: 'Tryk på noget på hylden eller i tasken for at lægge det på bordet, eller træk det derhen.',
    buyBack: 'Solgt i dag',
    buyBackOne: 'Køb tilbage',
    deal: 'Aftale!',
    say: {
      buy: 'Godt valg. Pas på den, så passer den på dig.',
      sell: 'Fair nok. Der er nok nogen, der vil have den.',
      back: 'Fortrudt? Det er helt i orden, værsgo.',
      poor: 'Det er lidt mere, end du har, desværre.'
    }
  },
  trainer: {
    learn: 'Lær',
    known: 'Lært',
    friend: '{faction}: 20% rabat til venner.',
    fee: 'Gebyr',
    rank: {
      label: 'Rang {n}',
      up: 'Hæv rang',
      effect: '+{effect} % effekt, −{cd} % nedkøling',
      max: 'Højeste rang',
      level: 'Rang {n} kræver niveau {lvl}.'
    },
    hint: 'Vælg en lektion. En grøn kant betyder, at du kan lære den nu.',
    block: {
      'trial': "Du har ikke bestået denne klasses prøve endnu.",
      'parents': "Lær først en evne fra {a} og en fra {b}.",
      level: 'Dit niveau er for lavt.',
      attrs: 'Dine attributter er for lave.',
      gold: 'Ikke nok guld.'
    }
  },
  healer: {
    talk: 'Sæt dig og hvil lidt. Dine flasker er fyldt op igen. Jeg kan sælge dig et større bælte, hvis du vil.',
    note: 'Du tager {n} eliksirer med ind i hvert område.',
    buy: 'En flaske mere · {n}',
    full: 'Dit bælte kan ikke bære mere.',
    belt: 'Eliksirbælte',
    slotTitle: 'Bælte udvidet',
    slotBought: 'Én flaskeplads mere: du har nu {n} helbredsdrikke med i hvert område og kan have {n} manadrikke på lager.',
    mana: {
      title: 'Manaeliksirer',
      note: 'På lager: {n} af {max}. De følger med dig mellem besøgene.',
      buy: 'En manaeliksir · {n}',
      full: 'Dit lager er fyldt.'
    }
  },
  faction: {
    order: 'Jernordenen',
    syndicate: 'Askesyndikatet',
    circle: 'Æterens Cirkel'
  },
  npc: {
    'mysteriousWanderer': { 'name': "Mystisk vandrer" },
    'fairPip': { 'name': "Pip" },
    'fairBess': { 'name': "Gamle Bess" },
    'fairHob': { 'name': "Hob" },
    sunkenPriest: { name: "Den sunkne præst" },
    'fortHale': {
      'name': "Kaptajn Hale",
    },
    'fortMara': {
      'name': "Den ældste Mara",
    },
    'scoutWren': {
      'name': "Spejderen Wren",
    },
    frostDisciple: {
      name: 'Ivor Hask'
    },
    windDisciple: {
      name: 'Kestrel Vane'
    },
    freedFarmers: {
      name: 'Jory Toller'
    },
    freedHerbalist: {
      name: 'Briar Hollowell'
    },
    lightDisciple: {
      name: 'Søster Aurelle'
    },
    freedPeddler: {
      talk: 'Alt, hvad en rejsende har brug for. Næsten nyt, for det meste.',
      name: 'Odo Marrow'
    },
    sfShadowRoad: {
      name: 'Nettle Quickhand'
    },
    sfShadow: {
      name: 'Nettle Quickhand'
    },
    sfGeo: {
      name: 'Harrow Flint'
    },
    wanderer: {
      name: 'Pip Vandreren',
      talk: 'Lang vej og let pung? Jeg har lidt af hvert.'
    },
    sunfordSmith: {
      name: 'Smeden Bram',
      talk: 'Ærligt stål, fair priser. Tag dig god tid.'
    },
    sunfordPeddler: {
      name: 'Kræmmeren Tilly',
      talk: 'Ringe, amuletter, småting. Den dér giver måske endda held.'
    },
    trainerAegis: {
      name: 'Ser Aldric'
    },
    trainerPyro: {
      name: 'Ember Wren'
    },
    elderMara: {
      name: 'Den ældste Mara'
    },
    sunfordHealer: {
      name: 'Søster Lune'
    },
    goblinTrader: {
      name: 'Handleren Grik',
      talk: 'Min familie lavede disse. Godt arbejde, fair pris.'
    },
    captainHale: {
      name: 'Kaptajn Hale'
    },
    oakArmorer: {
      name: 'Rustningssmeden Odo',
      talk: 'Halvdelen af lageret røg til muren. Tag, hvad der er tilbage, hvis det passer.'
    },
    oakMasterArmorer: {
      name: 'Mester Odo',
      talk: 'Den gode plade er fremme. Du har mere end fortjent et kig.'
    },
    oakWeapons: {
      name: 'Senna Klinger',
      talk: 'Skarpe, afbalancerede, fair priser. Rør ikke eggene.'
    },
    trainerShadow: {
      name: 'Hvisken'
    },
    trainerSovereign: {
      name: 'Lord Castellan'
    },
    oakHealer: {
      name: 'Broder Fenn'
    },
    blackMarket: {
      name: 'Hæleren',
      talk: 'Ingen spørgsmål, hverken den ene eller anden vej. Syndikatet tager sin del.'
    },
    trainerBlood: {
      name: 'Doktor Sangrel'
    },
    syndicateBoss: {
      name: 'Madam Ash'
    },
    forgemaster: {
      name: 'Smedemester Dorn'
    },
    ironWeapons: {
      name: 'Hilda Hammerhånd',
      talk: 'Dværgsmedet, hvert et stykke. Går et i stykker, vil jeg vide hvordan.'
    },
    ironAetherWorks: {
      name: 'Mekanikeren Voss',
      talk: 'Alt her kommer af, at vi har studeret kernen. Pas på, de fleste er ladt.'
    },
    ironArmor: {
      name: 'Garrun Jernside',
      talk: 'Rustninger på stativerne, ringe i bakken.'
    },
    ironOrderArmor: {
      name: 'Ordenens kvartermester',
      talk: 'Tag, hvad du har brug for. Ordenen passer på sine egne.'
    },
    trainerGeo: {
      name: 'Gamle Stenfod'
    },
    trainerAether: {
      name: 'Tandhjulsmageren Pim'
    },
    ironHealer: {
      name: 'Moder Brynja'
    },
    exiledSovereign: {
      name: 'Lord Castellan, i eksil'
    },
    trainerChrono: {
      name: 'Timernes vogter'
    },
    mayorBrenna: {
      name: 'Borgmester Brenna Quill'
    },
    sbHealer: {
      name: 'Broder Ansel'
    },
    sbArmorer: {
      name: 'Greta Jernåre',
      talk: 'Bjergstål til flodpriser. Bank på lige hvad du vil.'
    },
    sbWeapons: {
      name: 'Corvin Ashby',
      talk: 'Ashbys Fine Klinger. Hver æg poleret i hånden. Min hånd.'
    },
    sbJeweler: {
      name: 'Tam Marlow',
      talk: 'Ringe, amuletter, lykkesten. Alt ægte. Nå ja, næsten alt.'
    },
    sbMasterAegis: {
      name: 'Dame Helga Stormskjold'
    },
    sbMasterPyro: {
      name: 'Magister Ignatius Vale'
    },
    sbMasterShadow: {
      name: 'Nyx Halloway'
    },
    sbMasterSovereign: {
      name: 'Lord Percival Ashcombe'
    },
    sbMasterGeo: {
      name: 'Bedstemor Tova Dybrod'
    },
    sbMasterAether: {
      name: 'Professor Quint Tandhjul'
    },
    sbMasterChrono: {
      name: 'Klokkevogter Selwyn'
    },
    sbMasterBlood: {
      name: 'Vesper Karminblad'
    },
    sbAlchemist: {
      name: 'Odile Bregnefløjte'
    },
    sbGambler: {
      name: 'Madame Pell'
    },
    sunfordGambler: {
      name: 'Dob Kolbøtte'
    },
    sunfordCups: {
      name: 'Nell Nimblefingers'
    },
    oakGambler: {
      name: 'Silkebløde Ren'
    },
    sbCollector: {
      name: 'Alder Vane',
      talk: 'Sjældne sager til sjældne venner. Rør ikke noget med syltetøjsfingre.'
    },
    sbFence: {
      name: 'Mirela Thorne',
      talk: 'Fine rustninger, ingen spørgsmål. Nå ja, meget få spørgsmål.'
    },
    sbMasterWindrunner: {
      name: 'Sefa Stormvinge'
    },
    sbMasterFrostwarden: {
      name: 'Halvard Rimhjerte'
    },
    sbMasterLightbringer: {
      name: 'Søster Auriel Morgensø'
    },
    sbMasterBeastcaller: {
      name: 'Gamle Rowan Tidselfod'
    },
    sbMasterElementalist: {
      name: 'Magistra Iris Firvinde'
    },
    sbMasterSoulwarden: {
      name: 'Vogter Odalys Lygtelys'
    },
    sbMasterIronmonk: {
      name: 'Mester Oru Stillevand'
    },
    sbMasterBard: {
      name: 'Lark Godvejr'
    }
  },
  quest: {
    final: 'Dette valg kan ikke gøres om.',
    needsRep: '{faction}: anseelse {n}',
    gold: '+{n} guld',
    goblinKing: {
      title: 'Goblinkongen',
      slay: {
        label: 'Gør en ende på hans styre.'
      },
      pact: {
        label: 'Tilbyd en handelspagt med Sunford.'
      },
      ransom: {
        label: 'Tag hans skat, og lad ham beholde kronen.'
      }
    },
    siege: {
      title: 'Belejringen af Oakhaven',
      defend: {
        label: 'Forsvar Oakhaven.'
      },
      betray: {
        label: 'Åbn porten for Syndikatet.'
      }
    },
    core: {
      title: 'Ironholds hjerte',
      destroy: {
        label: 'Knus kernen.'
      },
      study: {
        label: 'Giv den til Cirklen at studere.'
      },
      sell: {
        label: 'Sælg den til Syndikatet.'
      }
    },
    oracle: {
      title: 'Det druknede orakel',
      free: {
        label: 'Bryd hendes lænker.'
      },
      slay: {
        label: 'Tag timeglasset, hun vogter.'
      }
    },
    dragon: {
      title: 'Tomhedsdragen',
      slay: {
        label: 'Dræb dragen.'
      },
      pact: {
        label: 'Indgå en pagt mod Ærkedæmonen.'
      }
    },
    throne: {
      title: 'Den tomme trone',
      order: {
        label: 'Giv tronen til Jernordenen.'
      },
      syndicate: {
        label: 'Giv tronen til Askesyndikatet.'
      },
      circle: {
        label: 'Giv tronen til Æterens Cirkel.'
      },
      shatter: {
        label: 'Knus tronen.'
      },
      claim: {
        label: 'Sæt dig selv på den.'
      }
    }
  },
  dlg: {
    // ── The Mysterious Wanderer (afterplay phase 10) ──
    'mysteriousWanderer': {
      'hello': { '1': "Så. Du gjorde, hvad få nogensinde har gjort. Jeg mærkede det fra den anden side af revnen.", '2': "Jeg lærer de gamle veje, der gør to skoler til én. Kun til dem, der fortjener dem." },
      'sealed': { '1': "Du forseglede den. Synd, på en måde. Jeg kunne lide udsigten." },
      'ajar': { '1': "Du lod den stå på klem. Dristigt. Dæmonerne vil holde dig skarp." },
      'again': { '1': "Tilbage igen. Vejen er lang, men du går den godt." },
      'train': { '1': "Vis mig begge halvdele af det, du er, så gør jeg dem til én." },
      'trial': { 'say': "Hvilke prøver mener du?", '1': "En port holdt uden en skramme. En drage dræbt uden et eneste fald. Fem helvedessmedninger og fem sejre i træk.", '2': "Leviatanens død og en perfekt runde ved hydraen. Hver åbner en dør, jeg kan vise dig." },
      'who': { '1': "En vandrer. Jeg gik langs revnens kant, før din bedstefar blev født. Navne slides op." },
      'trainBack': { '1': "Øv dig. To skoler skændes, før de bliver enige." },
      'bye': { '1': "Gå varsomt. Jeg er her, indtil jeg ikke er." }
    },
    'fairPip': {
      'hello': { '1': "Kom nærmere! Ni tønder, en flok imps og én kølle. Bank dem ned igen!", '2': "Imps springer op af tønderne. Ram tyve, før sandet løber ud.", '3': "Lad de guldpansrede være, de koster et liv. Tre sejre i træk, og den store præmie er din." },
      'again': { '1': "Mere banken? Grib køllen!" },
      'play': { '1': "Køllen op! Her kommer de!" },
      'who': { '1': "Pip, impfanger af fag. Dem her fangede jeg selv. De bider." },
      'playBack': { '1': "Ha! Sikket et spektakel! Igen?" },
      'bye': { '1': "Hold køllearmen løs!" }
    },
    'fairBess': {
      'hello': { '1': "Fem ringe, tre hoveder, og ingen af dem bider. Jeg skar hende selv, så pas på malingen.", '2': "Hold for at tage sving, slip for at kaste. Et hoved fanger kun ringen, når det svinger ind mod midten.", '3': "Hvert hoved i træk tæller én mere. Ram alle fem, så betaler jeg ordentligt." },
      'again': { '1': "Kommer du igen for at prøve kræfter med min gamle pige?" },
      'play': { '1': "Her er dine ringe. Kast blødt, skat." },
      'who': { '1': "Fyrre år på markedsvejene. Hydraen kom med krigen. Det virkede passende." },
      'playBack': { '1': "Ikke dårligt. Min afdøde mand kastede værre." },
      'bye': { '1': "Pas på malingen på vej ud." }
    },
    'fairHob': {
      'hello': { '1': "Åh. Hej. Vil du lægge arm? Jeg tager det roligt. Jeg prøver.", '2': "Pres når ringen møder cirklen. Ude af takt, så glider du.", '3': "Stærke arme hjælper. Slå mig tre gange i træk, så giver Smedemesteren dig rabat." },
      'again': { '1': "En runde til? Ingen kommer nogensinde tilbage for en runde til." },
      'play': { '1': "Albuen på bordet. Når du vil." },
      'who': { '1': "Jeg er Smedemesterens lærling. Han siger, jeg ikke kender min egen styrke." },
      'playBack': { '1': "God kamp. Min arm bliver øm i morgen. Nok." },
      'bye': { '1': "Kom snart igen. Smedjen er meget stille." }
    },
    // ── The Breaking (the afterplay, B0–B5) ──
    'story': {
      forge: { back: { '1': "Min smedje brænder igen, hedere end nogensinde. Dæmonjern smelter godt.", '2': "Bring mig, hvad du finder derude. Nu kan jeg smede det helvedes." } },
      oracle: { lens: { '1': "Du befriede mig engang. Nu ser jeg for dig. Tag min linse.", '2': "Kig gennem den, så viser kortet, hvor de store bæster venter." } },
      priest: { lens: { '1': "Oraklet er væk, så nu vogter jeg hendes tempel. Sfinksen vogtede dette.", '2': "Hendes linse. Kig gennem den, så viser kortet, hvor de store bæster venter." } },
      herbs: { scale: { '1': "Et skæl fra Leviathan! Let som et blad, og det flyder.", '2': "Bær det, så holder det lave vand dig som fast grund." } },
      ghost: { key: { '1': "Nå, den der tog min trone. Du dræbte min Hydra. Godt.", '2': "Tag dens ildnøgle. Revnens hjerte brænder, og kun ild åbner det." } },
      syndicate: { key: { '1': "Er Hydraen død? Så går ildnøglen til den, der betaler. Eller til dig, formoder jeg.", '2': "Den åbner revnens hjerte. Gå hen og luk den, før den æder min forretning." } },
      sealed: {
        sealed: { '1': "Og så blev revnen forseglet, og verden begyndte at hele.", '2': "Byer blev genopbygget, sange blev skrevet, og ét navn stod i dem alle." },
        ajar: { '1': "Og så blev revnen stående på klem, og verden lærte at leve ved siden af den.", '2': "Murene forblev bemandede, kolosseet forblev larmende, og helten forblev klar." },
      },
      'rift': {
        'scream': {
          '1': "Tomhedens herre falder, og revnen bag ham skriger.",
          '2': "Det var aldrig hans trone. Det var hans bur, og han var låget.",
          '3': "Nu står revnen åben, og alt, hvad tomheden holdt sovende, vågner.",
        },
      },
      'wren': {
        'found': {
          '1': "Der er du! Jeg er Wren, spejder. Jeg har ledt overalt efter dig.",
          '2': "Sunford brænder. Alle, der kunne flygte, tog til Bastionsvadestedet.",
          '3': "Det er den gamle fæstning ved vejen til Askeklipperne. Skynd dig, de har brug for dig.",
        },
      },
    },
    'scoutWren': {
      sealed: { '1': "Dragen er væk! Vejene føles allerede lettere." },
      'hello': {
        '1': "Du kom! Jeg vidste det. Velkommen til Bastionsvadestedet.",
        '2': "Jeg spejder vejene for kaptajnen. Spørg mig, hvor faren er.",
      },
      'again': {
        '1': "Allerede tilbage? Vejene spejder ikke sig selv.",
      },
      'who': {
        '1': "Wren. Jeg bar bud for Sunfords vagt, før Sunford brændte.",
      },
      'rumor': {
        'plains': {
          '1': "Dæmoner holder vejen gennem Sunford-sletten. Sunfords lærere sidder fast bag den.",
        },
        'hollows': {
          '1': "Goblinhulerne vrimler med helvedeshunde. Ryd dem, så kan Sunfords folk komme hjem.",
        },
        'woods': {
          '1': "Noget med tre hoveder jager i Den Hviskende Skov. Urtekonen gemmer sig der.",
        },
        'outskirts': {
          '1': "Kentaurer rider i Oakhavens udkant. Når de vores mure, skal vi bruge hvert sværd.",
        },
        'siege': {
          '1': "Deres horde er knust, men flere samles. Kaptajnen gør murene klar.",
        },
      },
      'bye': {
        '1': "Hold øje med vejene. Det gør jeg også.",
      },
    },
    'fortHale': {
      sealed: { '1': "Dragen er død. Jeg troede aldrig, jeg ville opleve det. Tak." },
      'siegeBack': { '1': "Ikke endnu? Så hvil dig. Murene venter på dig." },
      'bell': { '1': "Til porten, så. Sig mig, hvor hårdt vi holder den." },
      'hello': {
        '1': "Du klarede det. Godt. Vi har brug for hvert sværd, mere end nogensinde.",
        '2': "Velkommen til Bastionsvadestedet. Gamle mure, men de eneste, der stadig står.",
      },
      'road': {
        '1': "Vejen til Sunford er åben igen. Folket er i sikkerhed bag vores mure.",
      },
      'herbs': {
        '1': "Urtekonen er tilbage, med sine urter. Lazarettet kan ånde igen.",
      },
      'siege': {
        '1': "Du knuste kentaurerne. Men en større hær kommer, og den kommer efter disse mure.",
      },
      'again': {
        '1': "Står her endnu. Murene, mændene og mig.",
      },
      'fort': {
        '1': "En gammel grænsefæstning. Ubemandet i halvtreds år, indtil himlen revnede.",
        '2': "Nu er den det sidste sikre sted mellem sletten og bjergene.",
        'say': "Hvad er det her for et sted?",
      },
      'rumor': {
        'road': {
          '1': "Ryd sletten og hulerne. Sunfords folk sidder fast derude.",
        },
        'woods': {
          '1': "Urtekonen er i Den Hviskende Skov, og et uhyre med tre hoveder også. Vær klar.",
        },
        'centaurs': {
          '1': "Kentaurer i udkanten. Knus deres horde, før den når os.",
        },
        'siege': {
          '1': "Hvil dig. Når belejringsklokken ringer, har jeg brug for dig på muren.",
        },
      },
      'bye': {
        '1': "Hold sværdet tæt.",
      },
    },
    'fortMara': {
      sealed: { '1': "Du klarede det, barn. Hver eneste af os skylder dig et hjem." },
      'siegeBack': { '1': "Hvil dig lidt, barn. Klokken ringer igen." },
      'bell': { '1': "Kaptajnens mure er mine at vogte nu. Vælg, hvordan vi holder dem." },
      'hello': {
        '1': "Barn! Du lever. Da Sunford brændte, frygtede jeg det værste.",
        '2': "Vi er gæster i en soldaterfæstning nu, gamle koner og det hele.",
      },
      'command': {
        '1': "Kaptajn Hale faldt med Oakhaven. Så fæstningen lytter til en gammel ældste nu.",
      },
      'home': {
        '1': "Sunford bliver genopbygget! De første tage er oppe. Jeg kunne græde.",
      },
      'again': {
        '1': "Stadig her, barn. Tæller stadig hoveder.",
      },
      'town': {
        '1': "Dæmoner kom ud af nattehimlen. Vi flygtede med det, vi kunne bære.",
        '2': "Nogle af os kom aldrig ud. Bring resten hjem, hvis du kan.",
        'say': "Hvad skete der med Sunford?",
      },
      'rumor': {
        'road': {
          '1': "Vores lærere er stadig ude på Sunford-vejen. Bring dem herhen, barn.",
        },
        'woods': {
          '1': "Urtekonen gik ind i Den Hviskende Skov efter urter og kom aldrig tilbage.",
        },
        'centaurs': {
          '1': "Ryttere i udkanten. Hove som torden, hver nat.",
        },
        'siege': {
          '1': "Murene bliver snart sat på prøve. Jeg kan mærke det i mine gamle knogler.",
        },
      },
      'bye': {
        '1': "Gå varsomt, barn.",
      },
    },
    intro: {
      crossing: { 1: 'Hver vej i denne verden mødes ved en korsvej… og hver korsvej er et slag.' },
      hero: { 1: 'Fra Sunfords stille marker drog en ung helt af sted.' },
      fire: { 1: 'Ilden svarede på kaldet. Stålet lærte et nyt navn.' },
      foes: { 1: 'Goblinkonger, frostjarler, en tomhedens drage… og Ærkedæmonen.' },
      begin: { 1: 'Din legende begynder nu.' }
    },
    frostDisciple: {
      bye: {
        '1': 'Hold dig varm.'
      },
      who: {
        '2': 'Smedjerne i Ironhold er varme. Jeg trives her.',
        '1': 'Jeg jagede på tundraen. De holdt mig i bur en hel vinter.'
      },
      trainBack: {
        '1': 'Øv dig. Kulden er tålmodig. Vær det samme.'
      },
      ready: {
        weak: {
          '1': 'Ikke endnu. Mere styrke i armen og i sindet.'
        },
        able: {
          '1': 'Du er klar. Næste lektion.'
        },
        strong: {
          '1': 'Du er stærkere, end jeg var. Tag, hvad du har brug for.'
        }
      },
      class: {
        say: 'Hvad er en Frostvogter?',
        '2': 'Styrke til klingen. Intelligens til frosten.',
        '1': 'Køl dem, frys dem, og knus så isen.'
      },
      train: {
        '1': 'Stå stille. Lad kulden komme til dig. Send den så tilbage.'
      },
      again: {
        '1': 'Du vender tilbage. Godt.'
      },
      hello: {
        '2': 'Ivor Hask. Halvard Rimhjerte lærte mig frosten. Nu lærer jeg den fra mig, her.',
        '1': 'Fri. Godt. Kulden tog mig ikke, og det gjorde de heller ikke.'
      }
    },
    windDisciple: {
      bye: {
        '1': 'Hold øje med vinden.'
      },
      who: {
        '2': 'Vil du sige til Sefa, at jeg lever? Hun bekymrer sig.',
        '1': 'Jeg var på vej til Silverbridge, da klipperne fangede mig.'
      },
      trainBack: {
        '1': 'Gå ud og øv dig. Et sted, hvor det blæser.'
      },
      ready: {
        weak: {
          '1': 'Ikke endnu. Bliv hurtigere først, og kom så tilbage.'
        },
        able: {
          '1': 'Du er klar til den næste. Se godt efter.'
        },
        strong: {
          '1': 'Du er hurtigere end mig nu. Tag, hvad du vil.'
        }
      },
      class: {
        say: 'Hvad gør en Vindløber?',
        '2': 'Smidighed for hurtige fødder. Teknik, så hver pil rammer.',
        '1': 'Løb, skyd, løb igen. Vær aldrig der, hvor de sigter.'
      },
      train: {
        '1': 'Fødderne fra hinanden. Ånd ud. Lad vinden bære den.'
      },
      again: {
        '1': 'Hej! God vind i dag. Skal vi øve os?'
      },
      hello: {
        '2': 'Kestrel Vane. Sefa Stormvinge lærte mig buen. Jeg kan lære dig det, hun lærte mig.',
        '1': 'Du fik mig ud! Jeg skylder dig alt. Nå ja, meget.'
      }
    },
    freedFarmers: {
      bye: {
        '1': 'Pas på dig selv på vejen.'
      },
      who: {
        '2': 'Oakhaven tog imod os. Vi betaler tilbage i brød.',
        '1': 'Banditter tog os fra vores mark og lod os rådne i skoven.'
      },
      favorDone: {
        say: 'Ulvene vil ikke plage jer mere.',
        '2': 'Tag det her. Det er ikke meget, men det er ærligt.',
        '1': 'Stille nætter igen. Endelig kan vi sove.'
      },
      waiting: {
        say: 'Angående de ulve...',
        '1': 'Ulvene strejfer stadig omkring. Vi hørte dem i nat.'
      },
      favor: {
        say: 'Kan jeg hjælpe med noget?',
        '2': 'Vil du tynde lidt ud i dem? Otte burde lære dem det.',
        '1': 'Ulve fra Den Hviskende Skov tager hele tiden vores får.'
      },
      again: {
        '1': 'Der er vores helt. Kommet efter en bid mad?'
      },
      hello: {
        '2': 'Jory Toller. Vi dyrker jorden uden for murene nu. Nå ja, vi prøver.',
        '1': 'Vi havde været døde uden dig. Både mig og min dreng. Tak.'
      }
    },
    freedHerbalist: {
      bye: {
        '1': 'Gå blidt. Der gror ting derude.'
      },
      who: {
        '2': 'De tog ikke helt fejl.',
        '1': 'En urtekyndig fra bakkerne. Goblinerne troede, jeg var en heks.'
      },
      favorDone: {
        say: 'Her er dine solblade.',
        '2': 'Her er din betaling. Og tak igen.',
        '1': 'Åh, de er perfekte. Dufte bare til dem!'
      },
      waiting: {
        say: 'Angående de solblade...',
        '1': 'Leder du stadig? Solblade elsker åben sol.'
      },
      favor: {
        say: 'Er der noget, jeg kan gøre for dig?',
        '2': 'De vokser ude på sletterne. Jeg betaler godt for dem.',
        '1': 'Mine forråd gik tabt i det bur. Kan du skaffe mig tre solblade?'
      },
      again: {
        '1': 'Åh, hej igen. Dine støvler lugter af mos. Godt.'
      },
      hello: {
        '2': 'Jeg er Briar. Jeg samler og tørrer det, der gror. Silverbridge var venlig nok til at tage imod mig.',
        '1': 'Jeg vidste, at nogen ville komme. Goblinerne forstod sig aldrig på urter. Eller venlighed.'
      }
    },
    lightDisciple: {
      bye: {
        '1': 'Vandr i lyset.'
      },
      who: {
        '2': 'Sunford er lyst og stille. Jeg havde brug for begge dele.',
        '1': 'Jeg gik til Det Sunkne Tempel for at bede. Nagaerne havde andre planer.'
      },
      trainBack: {
        '1': 'Gå blidt. Og lad dem se dig komme.'
      },
      ready: {
        weak: {
          '1': 'Ikke endnu. Først et klarere sind og et varmere hjerte.'
        },
        able: {
          '1': 'Du er klar til næste lektion. Kom, stil dig i lyset.'
        },
        strong: {
          '1': 'Du skinner klarere end mig nu. Tag, hvad du har brug for.'
        }
      },
      class: {
        say: 'Hvad gør en Lysbringer?',
        '2': 'Intelligens gør lyset stærkt. Karisma gør det varmt.',
        '1': 'Vi bærer daggryet. Lys at kæmpe med, lys at hele med.'
      },
      train: {
        '1': 'Åbn dine hænder. Lad lyset gå gennem dem, ikke fra dem.'
      },
      again: {
        '1': 'Velkommen tilbage. Solen er mild i dag.'
      },
      hello: {
        '2': 'Jeg er Aurelle. Søster Auriel lærte mig lyset. Nu lærer jeg det fra mig her.',
        '1': 'Lyset være med dig. Du fandt mig i mørket, og det glemmer jeg ikke.'
      }
    },
    freedPeddler: {
      bye: {
        '1': 'Pas på banditterne. De kan ikke lide at dele.'
      },
      shopBack: {
        '1': 'En fornøjelse at handle med dig, min ven.'
      },
      who: {
        '2': 'Nu sælger jeg i Sunford. Her er mere sikkert. For det meste.',
        '1': 'Banditter tog min vogn og puttede mig i en kasse. Meget uhøfligt.'
      },
      trade: {
        '1': 'Ringe, handsker, støvler. Halv pris for dig. Nå ja, næsten.'
      },
      again: {
        '1': 'Min redningsmand! Kom, kom, jeg har gemt de gode sager til dig.'
      },
      hello: {
        '2': 'Odo Marrow, til tjeneste. Kræmmer, kedelflikker og en meget taknemmelig mand.',
        '1': 'Dig! Det var dig, der åbnede buret! Jeg var rådnet op derinde.'
      }
    },
    sfShadowRoad: {
      hello: {
        '1': 'Teleportering. Interesseret?'
      },
      again: {
        '1': 'Tilbage efter endnu et trick?'
      },
      train: {
        '1': 'Se godt efter. Ét skridt, og du er et andet sted.'
      },
      trainBack: {
        '1': 'Godt. Gå nu og vær et andet sted.'
      },
      bye: {
        '1': 'Lad dig ikke fange.'
      }
    },
    sfShadow: {
      hello: {
        '1': 'Hørte dig ikke komme ind. Det plejer at være mit trick.',
        '2': 'Nettle Quickhand. Jeg underviser i de stille kunster: dolke, skygger, at smutte tidligt.'
      },
      again: {
        '1': 'Tilbage igen? Godt. Ingen så dig, håber jeg.'
      },
      train: {
        '1': 'Lette fødder, hurtige hænder. Prøv ikke at snuble over din egen klinge.'
      },
      class: {
        '1': 'Slår til, hvor de ikke kigger, og er så et helt andet sted.',
        '2': 'Det hele bygger på Smidighed. Hurtige hænder, hurtige fødder, hurtige udgange.',
        say: 'Hvad gør en skyggeklinge?'
      },
      ready: {
        strong: {
          '1': 'Du er hurtigere end mig nu. Tag, hvad du vil, jeg opdager det ikke engang.'
        },
        able: {
          '1': 'Du er klar til næste trick. Se godt efter, jeg gør det kun én gang.'
        },
        weak: {
          '1': 'Ikke endnu. Bliv hurtigere først, ellers snubler du i skyggerne.'
        }
      },
      town: {
        '1': 'Stille by, ærlige folk. Ingen kigger to gange på en bondekappe. Perfekt.',
        say: 'Hvorfor underviser du her, i Sunford?'
      },
      trainBack: {
        '1': 'Af sted med dig. Øv dig, hvor vagterne ikke kan se.'
      },
      bye: {
        '1': 'Pas på pungen.'
      }
    },
    sfGeo: {
      hello: {
        '1': 'Pas på stenene. Nogle af dem lytter.',
        '2': 'Harrow Flint. Jeg underviser i den gamle jordmagi: sten, rødder, et lille skælv.'
      },
      again: {
        '1': 'Åh, du er tilbage. Jorden fortalte mig, at du var på vej.'
      },
      train: {
        '1': 'Fødderne fladt, træk vejret roligt. Mærk tyngden under dig. Godt.'
      },
      class: {
        '1': 'Beder jorden om hjælp. Mure, når du har brug for dem, pigge, når fjenden ikke har.',
        '2': 'Styrke til at holde stenen, Intelligens til at forme den. Du har brug for begge.',
        say: 'Hvad gør en geomantiker?'
      },
      ready: {
        strong: {
          '1': 'Stenen svarer dig før mig nu. Tag, hvad du har brug for.'
        },
        able: {
          '1': 'Du er klar til næste lektion. Læg hånden på jorden. Lyt.'
        },
        weak: {
          '1': 'Ikke endnu. Mere styrke og et klarere hoved, ellers lytter stenen ikke.'
        }
      },
      farms: {
        '1': 'Hvert forår. Bygget vokser en håndsbredde højere, og ingen ved hvorfor. Sig det ikke til dem.',
        say: 'Hjælper jorden også gårdene?'
      },
      trainBack: {
        '1': 'Gå bare. Og læg den sten tilbage, hvor du fandt den.'
      },
      bye: {
        '1': 'Gå stille. Jorden husker.'
      }
    },
    smalltalkSunford: {
      weather: {
        '1': 'Der kommer regn i aften. Mit knæ har ondt hele dagen.',
        '2': 'Det sagde dit knæ også i sidste uge.',
        '3': 'Og det regnede jo. Bare ikke her.'
      },
      harvest: {
        '1': 'Kornet er blevet flot i år.',
        '2': 'Lad os håbe, vi får lov at beholde det.'
      },
      goblins: {
        '1': 'Goblins tog tre høns fra Møllergården.',
        '2': 'Igen? Det er anden gang i denne måned.',
        '3': 'Nogen burde gøre noget ved de huler.'
      },
      kingGone: {
        '1': 'De siger, at Goblinkongen er død.',
        '2': 'Godt. Måske kan jeg sove en hel nat nu.'
      },
      pact: {
        '1': 'Jeg købte en øse af en goblin i morges.',
        '2': 'Var den god?',
        '3': 'Bedre end min, ærlig talt. Sig det ikke til nogen.'
      },
      bram: {
        '1': 'Bram har stået ved ambolten siden før solopgang.',
        '2': 'Sådan bliver han, når han er bekymret.'
      },
      pie: {
        '1': 'Er det æbletærte, jeg lugter?',
        '2': 'Det var det. Børnene fandt den først.',
        '3': 'Jeg bager en til. Gem den bedre denne gang.'
      },
      road: {
        '1': 'Der har ikke været nogen på sletteveien i en uge.',
        '2': 'Ikke med banditter derude. Det kan man ikke bebrejde dem.'
      },
      hero: {
        '1': 'Nogen har ryddet banditterne væk fra sletteveien.',
        '2': 'Gudskelov. Nu kan min søster komme på besøg igen.'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': 'To sølv for et kålhoved. To!',
        '2': 'Intet kommer billigt gennem porten for tiden.',
        '3': 'Så dyrker jeg mit eget. På taget, hvis det skal være.'
      },
      watch: {
        '1': 'De har fordoblet vagten ved porten.',
        '2': 'Godt. Jeg sover lidt roligere af det.'
      },
      caravan: {
        '1': 'Krydderikaravanen er forsinket igen.',
        '2': 'Banditter?',
        '3': 'Eller mudder. Lad os håbe, det er mudder.'
      },
      siege: {
        '1': 'Der ligger en hær og slår lejr bag gårdene.',
        '2': 'Så må vi hellere fylde kælderen, mens vi kan.'
      },
      saved: {
        '1': 'Stod du på muren, da belejringen brød?',
        '2': 'Jeg lå under sengen, hvis jeg skal være ærlig.',
        '3': 'Det gjorde halvdelen af byen. Vi er her da stadig.'
      },
      fountain: {
        '1': 'Jeg kastede en mønt i springvandet for held.',
        '2': 'Håber du ønskede dig billigere kål.'
      },
      ash: {
        '1': 'Alt lugter stadig af røg.',
        '2': 'Det går over. Det gør alting til sidst.'
      },
      hide: {
        '1': 'Hørte du støvler på gaden i nat?',
        '2': 'Ikke så højt. Man ved ikke, hvem der lytter.',
        '3': 'Undskyld. Jeg bare... undskyld.'
      },
      bread: {
        '1': 'Jeg fandt et halvt brød. Her, tag lidt.',
        '2': 'Du er en god sjæl. Tak.'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': 'God kobberåre på fjerde niveau.',
        '2': 'Kobber. Jeg havde håbet på sølv.',
        '3': 'Kobber betaler huslejen. Sølv betaler drømme.'
      },
      forge: {
        '1': 'Den store esse har ikke været kold i hundrede år.',
        '2': 'Min bedstefar hjalp med at tænde den, ved du.'
      },
      beard: {
        '1': 'Du har trimmet dit skæg.',
        '2': 'Kom for tæt på ambolten.',
        '3': 'Det gror ud igen. Du ser faktisk bedre ud med det kortere.'
      },
      core: {
        '1': 'Der lyser noget dernede i de dybe skakte.',
        '2': 'Intet godt lyser dernede. Bliv oppe.'
      },
      order: {
        '1': 'Ordenens rustningssmede arbejder hurtigt, det må man give dem.',
        '2': 'Hurtigt, ja. Vi får se, hvordan det holder.'
      },
      circle: {
        '1': 'Cirkelfolkene nynner, mens de arbejder.',
        '2': 'Bedre end din sang, i hvert fald.'
      },
      cold: {
        '1': 'Bidende koldt i morges.',
        '2': 'Kom og stil dig ved essen, så.'
      }
    },
    smalltalkKids: {
      tag: {
        '1': 'Tag fat, nu er det dig!',
        '2': 'Det er uretfærdigt, jeg var ikke klar!'
      },
      dragon: {
        '1': 'Når jeg bliver stor, skal jeg ride på en drage.',
        '2': 'Drager lader ikke nogen ride på sig.',
        '3': 'En sød gør måske.'
      },
      sword: {
        '1': 'Se, jeg fandt et sværd!',
        '2': 'Det er en pind.'
      },
      frog: {
        '1': 'Der er en frø nede ved brønden.',
        '2': 'Må vi beholde den?',
        '3': 'Mor sagde, ikke flere frøer.'
      }
    },
    ui: {
      overheard: 'Byens folk',
      hero: 'Du',
      leave: 'Afslut samtalen',
      topics: 'Hvad vil du sige?',
      gotGold: 'Fik {n} guld',
      gotItem: 'Fik: {item}',
      hint: 'Markeret på dit kort: {zone}',
      needs: {
        attr: 'Kræver {n} {attr}',
        level: 'Kræver niveau {n}',
        rep: 'Kræver anseelse {n} hos {faction}',
        gold: 'Kræver {n} guld',
        full: 'Du bærer allerede alt, hvad du kan',
        other: 'Ikke endnu'
      }
    },
    hero: {
      'siege': "Lad os bemande murene.",
      forge: 'Jeg vil gerne bruge din smedje.',
      learnSmith: 'Kan du lære mig at smede?',
      ore: 'Jeg har noget malm at sælge.',
      bye: 'Jeg lader dig passe dit.',
      trade: 'Må jeg se, hvad du har?',
      train: 'Vil du lære mig det?',
      heal: 'Kan du lappe mig sammen?',
      mana: 'Har du noget til mana?',
      who: 'Hvem er du, hvis jeg må spørge?',
      rumor: 'Hørt noget nyt?',
      ready: 'Tror du, jeg er klar til mere?',
      brew: 'Kan du brygge noget til mig?',
      play: 'Jeg er med.'
    },
    sunfordSmith: {
      forge: {
        '1': 'Essen er varm. Pas på fingrene.'
      },
      learnSmith: {
        '2': 'Slå, når metallet gløder klarest. Rammer du ved siden af, er det skrot. Kom så.',
        '1': 'Smedning? Hm. Hold hammeren sådan her, ikke som en kølle.'
      },
      ore: { '1': 'Malm, hva? Vis mig. Jeg betaler per klump, ærlig vægt.' },
      sellBack: { '1': 'Ærlig vægt, ærlig mønt. Kom med mere, når du finder det.' },
      forgeBack: {
        '1': 'Ikke dårligt. Heller ikke godt. Bliv ved.'
      },
      hello: {
        '1': 'Jeg har ikke set dig før. Er du den, der ryddede vejen?',
        '2': 'Bram. Jeg passer essen. Skal du bruge et blad, så kom til mig.'
      },
      kingDead: {
        '1': 'Jeg hørte, Goblinkongen er død. Jeg kommer ikke til at savne ham.'
      },
      kingPact: {
        '1': 'Goblins, der handler på torvet nu. Det troede jeg aldrig, jeg skulle opleve.'
      },
      kingRansom: {
        '1': 'Du lod Goblinkongen beholde sin krone. Han kommer tilbage, ved du.'
      },
      ending: {
        '1': 'Hele riget taler om dig. Skal du have en slibesten alligevel?'
      },
      again: {
        '1': 'Tilbage igen. Hvad kan jeg gøre for dig?'
      },
      trade: {
        '1': 'Ærligt stål, fair priser. Kig dig omkring.'
      },
      who: {
        '1': 'Bram. Tredive år ved den her ambolt, plus minus.',
        '2': 'Hestesko, plove, af og til et sværd. På det seneste mest sværd.'
      },
      gear: {
        '1': 'Et skjold, hvis du regner med at blive ramt. Det gør de fleste.',
        '2': 'Tungt stål kræver en stærk arm. Træn Styrken først.',
        say: 'Hvad skal jeg tage med derud?'
      },
      rumor: {
        plains: {
          '1': 'Banditter på sletteveien. Jeg ville starte dér, hvis jeg var dig.'
        },
        hollows: {
          '1': 'Goblinerne kommer fra Hulerne, hinsides sletten. Deres konge er dernede.'
        },
        woods: {
          '1': 'Øst for sletten ligger Den Hviskende Skov. Folk siger, at træerne bevæger sig.'
        },
        siege: {
          '1': 'Der er røg mod Oakhaven. En hær ligger i udkanten.'
        },
        north: {
          '1': 'Stål fra Ironhold kommer ned ad vejen igen. Bedre end mit, ærlig talt.'
        }
      },
      shopBack: {
        '1': 'Pas på den, så passer den på dig.'
      },
      bye: {
        '1': 'Pas på dig selv.'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': 'Åh, hej! Skal du købe, eller kigger du bare? Begge dele er fint.',
        '2': 'Jeg hedder Tilly. Ringe, amuletter, småting fra hele verden.'
      },
      rival: {
        '1': 'Har du set goblinens bod? Hans priser er lavere end mine. Det er uretfærdigt.'
      },
      again: {
        '1': 'Der er du jo! Jeg har lagt et par ting til side, som du nok vil kunne lide.'
      },
      trade: {
        '1': 'Kig dig omkring. Den dér giver held. Sikkert.'
      },
      who: {
        '1': 'Jeg går langs vejene og køber det, folk vil af med.',
        '2': 'Og nogle gange finder jeg ting. Banditter taber en masse, når de løber.'
      },
      trinkets: {
        '1': 'Du kan bære to, en på hver hånd. Det lægger sig sammen derude.',
        say: 'Hvad er smykker egentlig gode til?'
      },
      stolen: {
        '1': 'Aha. Du har en måde at spørge på, hvad?',
        '2': 'Tag den her ring, og lad os ikke tale om, hvor jeg fandt den.',
        say: 'Hvor kommer alt det her egentlig fra?'
      },
      rumor: {
        arenaShut: {
          '1': 'Der er et gammelt colosseum syd for her. Lukket og låst, mens goblinerne hærger.'
        },
        arenaOpen: {
          '1': 'Colosseum er åbent igen. Otte bølger, hører jeg. Folk vædder på det.'
        },
        east: {
          '1': 'Oakhaven betaler godt for alt, der blinker. Det ligger mod øst, forbi skoven.'
        }
      },
      shopBack: {
        '1': 'Kom igen, når pungen er tungere!'
      },
      bye: {
        '1': 'God rejse. Hold fast i mønterne derude.'
      }
    },
    trainerAegis: {
      hello: {
        '1': 'Rank i ryggen. Du taler med en ridder af Jernordenen.',
        '2': 'Ser Aldric. Jeg lærer folk at stille sig mellem andre og faren.'
      },
      saved: {
        '1': 'Oakhaven står stadig, og jeg hører, du stod på muren. Godt gået.'
      },
      fallen: {
        '1': 'Du åbnede Oakhavens port. Jeg lader ikke, som om jeg har glemt det. Hvad vil du?'
      },
      dragon: {
        '1': 'Dræbte du dragen på toppen? Det ville jeg gerne have set.'
      },
      friend: {
        '1': 'Ordenen tænker godt om dig. For dens venner koster mine lektioner mindre.'
      },
      foe: {
        '1': 'Ordenen kalder dig en fjende. Jeg lærer dig det alligevel. Det er mit valg, ikke deres.'
      },
      again: {
        '1': 'Tilbage efter flere øvelser?'
      },
      train: {
        '1': 'Godt. Se godt efter, jeg viser dig det kun én gang.'
      },
      class: {
        '1': 'Vi tager de slag, der var tiltænkt andre. Det er enkelt, og det er svært.',
        '2': 'Du skal bruge Styrke til skjoldet og Udholdenhed til at holde det oppe.',
        say: 'Hvad laver en Aegisridder egentlig?'
      },
      ready: {
        strong: {
          '1': 'Du er stærk nok til det meste af det, jeg kan. Bliv ved med Udholdenheden.'
        },
        able: {
          '1': 'Du er klar til næste lektion. Lad det ikke stige dig til hovedet.'
        },
        weak: {
          '1': 'Ikke endnu. Du ville blive træt før skjoldet. Mere Styrke, mere Udholdenhed.'
        }
      },
      order: {
        '1': 'Vi holder vejene sikre og loven i hævd. Nogle siger, for hårdt.',
        '2': 'Stå på vores side, så husker vores rustningssmede og lærere dig.',
        say: 'Fortæl mig om Jernordenen.'
      },
      trainBack: {
        '1': 'Øv dig, til det er kedeligt. Fortsæt så.'
      },
      bye: {
        '1': 'Gå forsigtigt.'
      }
    },
    trainerPyro: {
      hello: {
        '1': 'Åh, en elev? Dejligt. Stil dig måske lidt længere væk.',
        '2': 'Jeg er Ember Wren. Jeg underviser i ild. For det meste gør den, hvad jeg siger.'
      },
      core: {
        '1': 'Du gav kernen til Cirklen! Jeg kan næsten ikke vente med at se, hvad vi lærer af den.'
      },
      friend: {
        '1': 'Cirklen taler pænt om dig. Det betyder i øvrigt rabat.'
      },
      foe: {
        '1': 'Cirklen er ikke glad for dig. Jeg lærer dig det alligevel. Stille og roligt.'
      },
      again: {
        '1': 'Du er tilbage! Klar til at sætte ild til noget?'
      },
      train: {
        '1': 'Okay. Se på mine hænder, og hold dine ærmer væk fra mig.'
      },
      class: {
        '1': 'Mest sætte ild til ting. Så få ilden til at brede sig, hvor du vil have den.',
        '2': 'Det hele kommer fra Intelligens. Jo skarpere sind, jo varmere flamme.',
        say: 'Hvad laver en pyromantiker egentlig?'
      },
      ready: {
        strong: {
          '1': 'Ærlig talt? Du kunne selv undervise i noget af det her. Tag, hvad du vil have.'
        },
        able: {
          '1': 'Du er klar til den næste besværgelse. Kom, jeg viser dig.'
        },
        weak: {
          '1': 'Ikke endnu, desværre. Du skal have mere Intelligens, ellers tager ilden over.'
        }
      },
      circle: {
        '1': 'Lærde. Vi studerer, hvad verden er lavet af. Noget af det eksploderer.',
        say: 'Hvem er Æterens Cirkel?'
      },
      trainBack: {
        '1': 'Gå ud og øv dig. Et sted, hvor intet fænger, tak.'
      },
      bye: {
        '1': 'Pas på dig selv!'
      }
    },
    elderMara: {
      hello: {
        '1': 'Så det er dig, der kom fra vejen. Kom her, lad mig se på dig.',
        '2': 'Jeg hedder Mara. Jeg har passet på den her by i... ja, fyrre år nu.'
      },
      slain: {
        '1': 'Hulerne er stille. Det var en svær ting, du gjorde, men vi sover på grund af det.'
      },
      pact: {
        '1': 'Goblins, der sælger ting på mit torv. Det var dig, der snakkede dem til det, ikke?'
      },
      ransom: {
        '1': 'Du tog hans guld og lod ham beholde kronen. Jeg lader ikke, som om jeg ikke er skuffet.'
      },
      saved: {
        '1': 'Der kom bud fra Oakhaven. Porten holdt. Jeg er glad for, du var der.'
      },
      fallen: {
        '1': 'Oakhaven brændte, siger de. Jeg vil helst ikke høre hvordan. Ikke i dag.'
      },
      ending: {
        '1': 'De siger, du afgjorde Rædselsfæstningens skæbne. Fra vores lille vej til det.'
      },
      again: {
        '1': 'Sæt dig et øjeblik. Vejen er der stadig bagefter.'
      },
      reward: {
        '1': 'Du holdt vejen åben, da vores milits ikke kunne. Byen har lagt lidt sammen.',
        '2': 'Det er ikke meget. Det er, hvad vi kunne undvære.',
        say: 'Der var en, der sagde, du ville se mig?'
      },
      quest: {
        '1': 'Plyndringerne kommer fra Goblinhulerne. De har kronet sig en konge.',
        '2': 'Og du vil have ham død?',
        '3': 'Jeg vil have, at plyndringerne stopper. Hvordan... det må du afgøre dernede.',
        '4': 'Hulerne ligger lige forbi sletten. Vær forsigtig, vil du ikke nok?',
        say: 'Hvad er det, der bekymrer Sunford?'
      },
      king: {
        say: 'Om Goblinkongen...',
        slay: {
          '1': 'Han er væk, og karavanerne kører igen. Jeg spørger ikke, hvordan det føltes.'
        },
        pact: {
          '1': 'En handelsaftale. Min mor ville være besvimet. Men handel slår begravelser.'
        },
        ransom: {
          '1': 'Guld løber hurtigt ud. Nag gør ikke. Husk det, når plyndringerne begynder.'
        }
      },
      town: {
        '1': 'Mest bønder. En smed, en læge, to lærere, der holder os ud.',
        '2': 'Hvil dig her mellem rejserne. Det er, hvad et hjem er til for.',
        say: 'Fortæl mig om Sunford.'
      },
      next: {
        say: 'Hvor skal jeg hen næste gang?',
        plains: {
          '1': 'Sletteveien først. Uden karavanerne har vi ikke noget at spise.'
        },
        hollows: {
          '1': 'Goblinhulerne. Intet andet er sikkert, så længe plyndringerne fortsætter.'
        },
        woods: {
          '1': 'Mod øst, gennem Den Hviskende Skov. Det er vejen til Oakhaven.'
        },
        oakhaven: {
          '1': 'Oakhaven er belejret. Falder udkanten, falder byen med den.'
        },
        north: {
          '1': 'Mod nord, tror jeg. Askeklipperne, og Ironhold bagved. Det bliver bare sværere.'
        }
      },
      bye: {
        '1': 'Kom tilbage til os i ét stykke. Det er alt, hvad jeg beder om.'
      },
      map: {
        '1': 'Kaptajn Rooks kort! Han rev det i stykker og gemte stykkerne, før goblins fik fat i ham.',
        '2': "Find seks af stykkerne, så viser krydset vejen: et sted i Askeklipperne. Grav der efter guldet.",
        say: 'Jeg har fundet et stykke af et gammelt kort.'
      }
    },
    sunfordHealer: {
      hello: {
        '1': 'Hold dig stille et øjeblik. Nej, du er okay. Vane, undskyld.',
        '2': 'Jeg er Søster Lune. Jeg lapper det sammen, som vejen slår i stykker.'
      },
      again: {
        '1': 'Stadig i ét stykke? Godt. Sæt dig alligevel.'
      },
      heal: {
        '1': 'Sid, hvil dig lidt. Jeg fylder dine flasker, før du går.'
      },
      mana: {
        '1': 'Den her er bitter. Drik den, når dine besværgelser løber tør.'
      },
      brew: {
        '1': 'Lad mig se dine urter. Jeg blander noget, der smager bedre end min mana-tonic.'
      },
      potions: {
        '1': 'Du tager et par flasker med ind i hver kamp. Drik, før du har brug for det, ikke bagefter.',
        '2': 'Hvis du vil bære flere, kan jeg sælge dig et større bælte.',
        say: 'Hvordan virker eliksirerne?'
      },
      rumor: {
        goblins: {
          '1': 'Goblinerne smører deres slyngesten ind i noget. Bliver du dårlig, så kom tilbage.'
        },
        spiders: {
          '1': 'Jeg har behandlet tre edderkoppebid fra Skoven i denne uge. Pas på derude.'
        },
        burns: {
          '1': 'Soldater bliver ved med at komme ned fra nord med forbrændinger. Askeklipperne, siger de.'
        }
      },
      healBack: {
        '1': 'Hold bæltet fyldt og hovedet nede.'
      },
      brewBack: {
        '1': 'Pas på, de er varme. Drik dem ikke alle på én gang.'
      },
      bye: {
        '1': 'Pas på dig selv derude.'
      }
    },
    goblinTrader: {
      hello: {
        '1': 'Du er den, der indgik aftalen. Min konge siger, du er velkommen her.',
        '2': 'Jeg er Grik. Jeg sælger, hvad goblins laver. Godt arbejde, fair pris.'
      },
      again: {
        '1': 'Ven. Godt at se dig igen.'
      },
      trade: {
        '1': 'Kig gerne. Min familie lavede disse.'
      },
      king: {
        '1': 'Han spiser godt nu. Ingen flere plyndringer. Mit folk er mindre sultent.',
        '2': 'Han taler ofte om dig. Med respekt.',
        say: 'Hvordan har din konge det?'
      },
      town: {
        '1': 'Folk stirrer stadig. Men bageren giver mig tærte. Jeg kan lide tærten.',
        say: 'Hvordan kan du lide Sunford?'
      },
      rumor: {
        crags: {
          '1': 'Mine fætre graver i den sorte sten mod nord. De siger, at ild går der nu.'
        },
        deep: {
          '1': 'Noget vågner i de dybe steder. Goblins mærker det i jorden.'
        }
      },
      shopBack: {
        '1': 'Tak. Kom igen.'
      },
      bye: {
        '1': 'Gå i fred, ven.'
      }
    },
    captainHale: {
      hello: {
        '1': 'Endnu et sværd. Godt. Vi har brug for hvert eneste et.',
        '2': 'Kaptajn Hale. Jeg kommanderer det, der er tilbage af Oakhavens vagt.'
      },
      saved: {
        '1': 'Porten holdt. Tre hundrede år, og et til. Jeg står i gæld til dig for det.'
      },
      ending: {
        '1': 'Du afgjorde Rædselsfæstningen, siger de. Mine mure føles små ved siden af det.'
      },
      again: {
        '1': 'Murene står stadig. I dag i hvert fald.'
      },
      after: {
        '1': 'Godt at se dig. Oakhaven har ikke glemt.'
      },
      quest: {
        '1': 'Slemt. En krigsherre ved navn Krag har omringet os, og han kæmper ikke gratis.',
        '2': 'Hvem betaler ham?',
        '3': 'Askesyndikatet. De vil have en by for sig selv, og vores har mure.',
        '4': 'Bryd hans lejr i Oakhavens udkant. Det er dér, det her ender, på den ene eller anden måde.',
        say: 'Hvor slemt er det?'
      },
      siege: {
        '1': 'De tilbød dig en tredjedel af byen, ikke? Mig tilbød de en fjerdedel.',
        '2': 'Syndikatet kommer efter dig nu. Pas på vejene.',
        say: 'Om belejringen...'
      },
      town: {
        '1': 'En handelsby. Alt, der går mellem sletten og bjergene, betaler told her.',
        '2': 'Derfor vil alle have den. Og derfor giver jeg den ikke op.',
        say: 'Fortæl mig om Oakhaven.'
      },
      order: {
        '1': 'Jeg svarer til Oakhaven. Ordenen og jeg er enige de fleste dage. Ikke alle.',
        say: 'Svarer du til Jernordenen?'
      },
      rumor: {
        crags: {
          '1': 'Nord for skoven er jorden sort og brændende. Askeklipperne. Kultister, mest.'
        },
        mines: {
          '1': 'Ironhold er holdt op med at sende stål. Der er noget galt i deres miner.'
        },
        north: {
          '1': 'Det yderste nord er blevet stille. Efter min erfaring er det aldrig godt.'
        }
      },
      bye: {
        '1': 'Hold sværdet tæt på.'
      }
    },
    oakArmorer: {
      forge: {
        '1': 'Ambolten er din. Lav noget, der holder.'
      },
      learnSmith: {
        '2': 'Hold øje med gløden. Slå i dens hjerte, tre gange, så husker metallet.',
        '1': 'Vil du lære faget? Godt. Oakhaven har brug for hver en hammer.'
      },
      ore: { '1': 'Rå malm! Våbenkammeret har aldrig nok. Sælg mig, hvad du kan undvære.' },
      sellBack: { '1': 'Hver klump går i muren. Tak.' },
      forgeBack: {
        '1': 'Godt stål. Murene takker dig.'
      },
      hello: {
        '1': 'Hvis du leder efter en hjelm, må jeg skuffe dig. De er alle oppe på muren.',
        '2': 'Odo. Jeg laver rustninger. Har ikke sovet meget på det sidste.'
      },
      again: {
        '1': 'Stadig her. Stadig mangel på næsten alt.'
      },
      trade: {
        '1': 'Halvdelen af lageret røg til muren. Tag, hvad der er tilbage, hvis det passer.'
      },
      who: {
        '1': 'Jeg har rustet den her by i tyve år. Aldrig set det hele båret på én gang.'
      },
      armor: {
        '1': 'Plade, hvis du holder stand. Læder, hvis du bevæger dig. Klæder, hvis du er hurtig.',
        say: 'Hvilken slags rustning skal jeg have på?'
      },
      rumor: {
        backRoom: {
          '1': 'Hvis belejringen brydes, åbner jeg bagrummet. Den gode plade ligger derinde.'
        }
      },
      shopBack: {
        '1': 'Den holder. Den har holdt indtil nu.'
      },
      bye: {
        '1': 'Hold hovedet nede derude.'
      }
    },
    oakMasterArmorer: {
      forge: {
        '1': 'Ilden er dækket til og venter. Bare gå i gang.'
      },
      learnSmith: {
        '2': 'Tre slag, hvert i hjertet af gløden. Det er hele hemmeligheden.',
        '1': 'Siden belejringen lærer jeg alle, der spørger. Kom, stil dig her.'
      },
      ore: { '1': 'Mere malm til murene? Jeg betaler for hver klump, du kan undvære.' },
      sellBack: { '1': 'Velsignet være du. Det er flere plader til murene.' },
      forgeBack: {
        '1': 'Hvert slag gør dig bedre. Kom igen når som helst.'
      },
      hello: {
        '1': 'Der er du jo! Kom ind. Bagrummet er åbent, og det er åbent for dig.',
        '2': 'Mester Odo kalder de mig nu. Sjovt, hvad lidt fred gør for forretningen.'
      },
      ending: {
        '1': 'Fra vores port til Rædselsfæstningen. Jeg fortæller alle, at jeg tilpassede din rustning.'
      },
      again: {
        '1': 'Godt at se dig. Hvad skal det være i dag?'
      },
      trade: {
        '1': 'Den gode plade er fremme. Du har mere end fortjent et kig.'
      },
      town: {
        '1': 'Travl. Larmende. Fuld af købmænd, der brokker sig over tolden.',
        '2': 'Det er vidunderligt. Jeg har ikke haft en rolig time i flere uger.',
        say: 'Hvordan går det med byen?'
      },
      rumor: {
        mines: {
          '1': 'Mit stål kommer fra Ironhold, og de er blevet stille. Nogen burde tjekke deres miner.'
        },
        tundra: {
          '1': 'Den bedste malm, jeg nogensinde har arbejdet med, kom fra tundraen. Mændene, der fandt den, vendte aldrig tilbage.'
        }
      },
      shopBack: {
        '1': 'Sidder den ikke rigtigt, så kom tilbage med den. Jeg ordner det.'
      },
      bye: {
        '1': 'Du er altid velkommen her.'
      }
    },
    oakWeapons: {
      hello: {
        '1': 'Kigger du eller køber du? Begge dele er fint. Rør bare ikke eggene.',
        '2': 'Senna. Jeg sælger klinger. Hvad du bruger dem til, er din sag.'
      },
      saved: {
        '1': 'Så belejringen brød. Godt for byen. Krig var nu bedre for min forretning.'
      },
      again: {
        '1': 'Tilbage efter noget skarpere?'
      },
      trade: {
        '1': 'Skarpe, afbalancerede og fair priser. Tag dig god tid.'
      },
      who: {
        '1': 'Jeg har solgt til begge sider i tre krige. Jeg er her stadig. De fleste af dem er ikke.'
      },
      rumor: {
        krag: {
          '1': 'Krags mænd bærer godt stål. Syndikatets penge. Værd at samle op, hvis du får chancen.'
        },
        which: {
          '1': 'Hurtige klinger vil have Smidighed. Buer og våben vil have Teknik. Vid, hvilken du er.'
        }
      },
      shopBack: {
        '1': 'Hold det olieret. Rust ødelægger en god æg hurtigere end knogler.'
      },
      bye: {
        '1': 'Prøv ikke at dø, mens du skylder mig penge.'
      }
    },
    trainerShadow: {
      hello: {
        '1': 'Du hørte mig ikke komme op bag dig. Det gør de fleste ikke.',
        '2': 'De kalder mig Hvisken. Jeg lærer folk, hvordan man ikke bliver set.'
      },
      fallen: {
        '1': 'Byen er stillere nu. Færre vagter. Lettere arbejde, for nogle af os.'
      },
      friend: {
        '1': 'Syndikatet regner dig for en ven. Venner betaler mindre. Husk det.'
      },
      foe: {
        '1': 'Syndikatet vil have dig død. Jeg blev betalt for at undervise, ikke for at dræbe. Så, lektioner.'
      },
      again: {
        '1': 'Du er stadig for højlydt. Vi arbejder på det.'
      },
      train: {
        '1': 'Stille så. Se på mine fødder, ikke mine hænder.'
      },
      class: {
        '1': 'En, der allerede står bag dig. Ind, ét snit og væk.',
        '2': 'Smidighed betyder mest. Teknik, hvis snittet skal tælle.',
        say: 'Hvad er en Skyggeklinge?'
      },
      ready: {
        strong: {
          '1': 'Du bevæger dig godt nu. Tag resten. Tag lidt Teknik med til røgen.'
        },
        able: {
          '1': 'Dine hænder er hurtige nok. Næste skridt.'
        },
        weak: {
          '1': 'Ikke endnu. Du er tung på fødderne. Træn din Smidighed.'
        }
      },
      syndicate: {
        '1': 'Folk, der opdagede, at loven har en pris. Jeg dømmer ikke. Jeg får bare betaling.',
        say: 'Hvem er Askesyndikatet?'
      },
      trainBack: {
        '1': 'Øv dig nu, hvor ingen kan se dig.'
      },
      bye: {
        '1': 'Du har aldrig set mig.'
      }
    },
    trainerSovereign: {
      hello: {
        '1': 'Du må komme nærmere. Dér, så tæt er nok.',
        '2': 'Lord Castellan, af Oakhavens ældste slægt. Jeg underviser i kommando.'
      },
      saved: {
        '1': 'Min by står, og min families navn med den. Du har min tak. Oprigtigt.'
      },
      friend: {
        '1': 'En ven af Ordenen. Jeg sænker mit gebyr. Lad være med at sprede det.'
      },
      foe: {
        '1': 'Ordenen har dit navn på en liste. Jeg lærer dig det alligevel. Mønt er mønt.'
      },
      again: {
        '1': 'Ah, dig igen. Skal vi fortsætte?'
      },
      train: {
        '1': 'Meget vel. Se, hvordan en ordre gives, og hvordan den følges.'
      },
      class: {
        '1': 'En, der ikke kæmper alene. Du kalder på vagter, og de kæmper for dig.',
        '2': 'Det kræver Karisma. Ingen følger en leder, de ikke kan høre.',
        say: 'Hvad er en Storsuveræn?'
      },
      ready: {
        strong: {
          '1': 'Du har ægte udstråling nu. Tag resten af mine lektioner.'
        },
        able: {
          '1': 'Din stemme bærer. Du er klar til næste lektion.'
        },
        weak: {
          '1': 'Jeg er bange for, at ingen vil følge dig endnu. Træn din Karisma.'
        }
      },
      family: {
        '1': 'Vi byggede de mure, som Kaptajn Hale står på. Det glemmer han. Jeg minder ham om det.',
        say: 'Fortæl mig om din familie.'
      },
      trainBack: {
        '1': 'Gå så. Led nogen.'
      },
      bye: {
        '1': 'God dag til dig.'
      }
    },
    oakHealer: {
      hello: {
        '1': 'Næste! Åh, du går. Det er en dejlig forandring.',
        '2': 'Broder Fenn. Fyrre sårede på muren, og kun én af mig.'
      },
      saved: {
        '1': 'Ingen nye sårede i tre dage. Jeg ved næsten ikke, hvad jeg skal stille op med mig selv.'
      },
      again: {
        '1': 'Dig igen, og på egne ben. Godt.'
      },
      heal: {
        '1': 'Læg dig her, den rene briks. Sådan. Flaskerne er fyldt, af sted med dig.'
      },
      mana: {
        '1': 'Manadrik. Smager af gamle mønter, men den virker.'
      },
      potions: {
        '1': 'Med et længere bælte, ja. Dem sælger jeg. At fylde flaskerne er gratis.',
        say: 'Kan jeg bære flere eliksirer?'
      },
      rumor: {
        archers: {
          '1': 'Krags bueskytter sigter lavt. Bliv ved med at bevæge dig, så rammer de for det meste forbi.'
        },
        north: {
          '1': 'Jeg ser forbrændinger, forfrysninger og en mand, der sværger på, at en statue bed ham.'
        }
      },
      healBack: {
        '1': 'Af sted med dig. Næste gang så kom for en sludder i stedet for sting.'
      },
      bye: {
        '1': 'Pas på dig selv. Og spis noget.'
      }
    },
    blackMarket: {
      hello: {
        '1': 'Ingen navne her. Men jeg ved, hvem der åbnede porten. Det gør alle.',
        '2': 'Du kan kalde mig Hæleren. Alt her kommer fra et sted.'
      },
      foe: {
        '1': 'Syndikatet er ikke glad for dig lige nu. Dit guld er dog velkomment.'
      },
      again: {
        '1': 'Tilbage igen. Der var vel ingen, der fulgte efter dig?'
      },
      trade: {
        '1': 'Ingen spørgsmål, hverken den ene eller anden vej. Syndikatet tager sin del, du tager varerne.'
      },
      who: {
        '1': 'Før branden solgte jeg lys. Ærligt arbejde. Det kunne ikke betale sig.'
      },
      armor: {
        '1': 'Rustningssmedene er væk, ven. Du ved bedre end mig hvorfor.',
        say: 'Nogen rustning til salg?'
      },
      rumor: {
        citadel: {
          '1': 'En fæstning dukkede op i det yderste nord sidste år. Ingen byggede den.'
        },
        crystals: {
          '1': 'Nogen køber hver eneste tomhedskrystal, de kan finde. Ikke os. Det bekymrer mig.'
        }
      },
      shopBack: {
        '1': 'Du har aldrig været her.'
      },
      bye: {
        '1': 'Pas på, hvor du træder. Murbrokkerne flytter sig.'
      }
    },
    trainerBlood: {
      hello: {
        '1': 'En gæst. Rør ikke glassene, tak.',
        '2': 'Doktor Sangrel. Oakhavens nye ejere spørger ikke, hvad jeg underviser i. Det er afslappende.'
      },
      found: {
        '1': 'Du fandt mig. Ikke mange leder efter en læge på et sted som det her.',
        '2': 'Doktor Sangrel. Byer brænder folk som mig, så jeg arbejder, hvor der ikke er nogen.'
      },
      friend: {
        '1': 'Syndikatet taler for dig. Jeg tager mindre af dets venner. Mine krav forbliver de samme.'
      },
      foe: {
        '1': 'Syndikatet ville betale godt for dit blod. Jeg ser hellere, at du bruger det her.'
      },
      again: {
        '1': 'Du ser bleg ud. Godt. Det klæder arbejdet.'
      },
      train: {
        '1': 'Smøg ærmet op. Det kommer til at gøre ondt. Det er lidt meningen.'
      },
      class: {
        '1': 'Du betaler for kraft med dit eget helbred og tager den så tilbage fra dine fjender.',
        '2': 'Udholdenhed er det, du har at bruge af. Intelligens er, hvor godt du bruger det.',
        say: 'Hvad er en Blodalkymist?'
      },
      ready: {
        strong: {
          '1': 'En bemærkelsesværdig konstitution. Du kan lære næsten det hele.'
        },
        able: {
          '1': 'Du er robust nok til næste lektion.'
        },
        weak: {
          '1': 'Du ville besvime ved det første snit. Byg først din Udholdenhed op, tak.'
        }
      },
      jars: {
        '1': 'Prøver. Frivilligt givet, for det meste.',
        say: 'Hvad er der i glassene?'
      },
      trainBack: {
        '1': 'Før endelig notater. Jeg vil gerne høre, hvordan det går.'
      },
      bye: {
        '1': 'Hold dig rask. Jeg mener det.'
      }
    },
    syndicateBoss: {
      hello: {
        '1': 'Så det er dig, der åbnede porten. Sæt dig. Du har fortjent en stol.',
        '2': 'De kalder mig Madam Ash. Oakhaven er vores nu. Delvist takket være dig.'
      },
      throneOurs: {
        '1': 'Rædselsfæstningen, i vores hænder. Du var hver en mønt værd.'
      },
      throneLost: {
        '1': 'Du gav tronen til en anden. Det taler vi om. Ikke i dag.'
      },
      foe: {
        '1': 'Du har arbejdet imod os. Sæt dig alligevel. Jeg vil gerne vide, hvem jeg har med at gøre.'
      },
      again: {
        '1': 'Tilbage igen. Hvad kan Syndikatet gøre for dig?'
      },
      cut: {
        '1': 'Og det får du. En del af en ruin, indtil videre. Her er sæsonens.',
        '2': 'Den vokser. En ruin betaler rigtig godt, når man ejer dens eneste marked.',
        say: 'Jeg blev lovet en del af Oakhaven.'
      },
      syndicate: {
        '1': 'Det, alle vil have. Vi lader bare ikke, som om det var anderledes.',
        '2': 'Hold dig på god fod, så tager Hvisken og Doktoren mindre af dig.',
        say: 'Hvad vil Syndikatet egentlig?'
      },
      order: {
        '1': 'Selvfølgelig er de det. Du brændte en af deres byer. Tag ekstra drikke med.',
        say: 'Jernordenen er efter mig.'
      },
      rumor: {
        core: {
          '1': 'Dværgene fandt noget i deres miner. En kerne. Bring den til os og nævn din pris.'
        },
        sold: {
          '1': 'Kernen nåede sikkert frem. Du ville blive forbavset over, hvad den gør ved en lås.'
        },
        north: {
          '1': 'Alt, hvad der er værd at have, er flyttet mod nord. Det har vi også.'
        }
      },
      bye: {
        '1': 'Vær ikke en fremmed. Vi holder øje med fremmede.'
      }
    },
    forgemaster: {
      hello: {
        '1': 'Du kom op gennem minerne. Jeg kan lugte støvet på dig.',
        '2': 'Dorn. Smedemester i Ironhold. Og jeg har et problem så stort som et bjerg.'
      },
      destroyed: {
        '1': 'Lyset er slukket, og golemerne er skrot. Mine minearbejdere sang i går aftes. Første gang i et år.'
      },
      studied: {
        '1': 'Blå ild i mine essere og lærde i kåber i mine haller. Arbejdet er i det mindste godt.'
      },
      sold: {
        '1': 'Du solgte den. Golemerne går stadig, og mine miner er stadig en grav. Lad mig være.'
      },
      ending: {
        '1': 'Så tronen er afgjort. Godt. Måske kan vi nu komme tilbage til at grave.'
      },
      again: {
        '1': 'Hvad er der? Essen venter ikke.'
      },
      quest: {
        '1': 'Vi gravede efter jern og fandt et hjerte. En æterkerne. Man kan mærke, den slår.',
        '2': 'Og golemerne?',
        '3': 'De bevæger sig i dens takt. Tre magter har skrevet og bedt om den. Jeg stoler ikke på nogen af dem.',
        '4': 'Du når den først, nederst i Ironholds miner. Hvad der så sker, er op til dig.',
        say: 'Hvad skete der dernede i minerne?'
      },
      core: {
        say: 'Om kernen...',
        destroy: {
          '1': 'Du brød et vidunder for at redde mit folk. Ordenen sendte rustningssmede. Jeg sendte øl.'
        },
        study: {
          '1': 'Cirklens folk er mærkelige, men deres våben skyder lige. Fair nok.'
        },
        sell: {
          '1': 'Du gjorde det for guldet. Jeg håber, det holder dig varm.'
        }
      },
      town: {
        '1': 'Rigets bedste stål, når minerne virker.',
        '2': 'Stenfod underviser i jord, Pim underviser i maskiner. Begge taler dig ørerne af.',
        say: 'Fortæl mig om Ironhold.'
      },
      rumor: {
        tundra: {
          '1': 'Øst for Klipperne bliver landet hvidt. Frostbidstundraen. Giganter, og værre.'
        },
        citadel: {
          '1': 'Mine spejdere så en fæstning i nord, som ikke var der sidste år. Det kan jeg ikke lide.'
        },
        fortress: {
          '1': 'Det hele ender ved Rædselsfæstningen. Hver vej mod nord fører derhen.'
        }
      },
      bye: {
        '1': 'Farvel og god tur.'
      }
    },
    ironWeapons: {
      forge: {
        '1': 'Pas på gnisterne, og rør ikke min gode hammer.'
      },
      learnSmith: {
        '2': 'Gløden siger hvornår. Armen siger hvor hårdt. Tre slag.',
        '1': 'En overfladebo ved ambolten? Nå, alle starter et sted.'
      },
      ore: { '1': 'Godt, ærligt metal. Læg det frem, jeg betaler per klump.' },
      sellBack: { '1': 'Fair handel. Ironhold betaler altid for godt metal.' },
      forgeBack: {
        '1': 'En dværg ville have gjort det bedre. Men ikke meget.'
      },
      hello: {
        '1': 'Forsigtig med udstillingen. De er skarpe på begge sider.',
        '2': 'Hilda Hammerhånd. Hvert stykke her er smedet af dværgehænder.'
      },
      dragon: {
        '1': 'Dræbte du dragen? Jeg håber, det var med en af mine klinger.'
      },
      again: {
        '1': 'Tilbage efter rigtigt stål?'
      },
      trade: {
        '1': 'Dværgsmedet. Går en af dem i stykker, vil jeg vide hvordan.'
      },
      who: {
        '1': 'Min mor smedede til konger. Jeg smeder til enhver, der kommer ind ad døren.'
      },
      rumor: {
        golems: {
          '1': 'Golemerne dernede er lavet af vores eget jern. Det svider, skal jeg sige dig.'
        },
        arm: {
          '1': 'En god klinge gør halvdelen af arbejdet. Din Styrke må gøre resten.'
        }
      },
      shopBack: {
        '1': 'Kom tilbage med den sløv, så ved jeg, du har brugt den godt.'
      },
      bye: {
        '1': 'Slå hårdt.'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': 'Forsigtig, den dér er ladt. De fleste er, faktisk.',
        '2': 'Mekanikeren Voss. Cirklen sendte mig for at studere kernen. Den har lært os så meget.'
      },
      again: {
        '1': 'Ah, godt. Jeg har lavet et par ændringer, siden du var her.'
      },
      trade: {
        '1': 'Alt her kommer af at studere kernen. Bare peg den ikke mod mig.'
      },
      core: {
        '1': 'Det metal kan tænke, lidt. Jeg prøver ikke at dvæle ved det.',
        say: 'Hvad lærte kernen dig?'
      },
      rumor: {
        heat: {
          '1': 'Våben kører på Teknik, og de bliver varme. Spørg Pim om varme, før du brænder en hånd.'
        }
      },
      shopBack: {
        '1': 'Sig til, hvordan den håndterer. Jeg fører notater.'
      },
      bye: {
        '1': 'Pas på rekylen.'
      }
    },
    ironArmor: {
      forge: {
        '1': 'Essen er klar, når du er.'
      },
      learnSmith: {
        '2': 'Varm, slå, vend. Tre slag, lige i gløden. Lad den så køle af.',
        '1': 'Plade er tålmodigt arbejde. Jeg viser dig det grundlæggende.'
      },
      ore: { '1': 'Lad mig veje det. Vælg, hvad du sælger, så tæller jeg mønterne.' },
      sellBack: { '1': 'Vejet og betalt. Godt.' },
      forgeBack: {
        '1': 'Lad den køle af, før du tager den på.'
      },
      hello: {
        '1': 'Garrun. Rustninger på stativerne, ringe i bakken.'
      },
      again: {
        '1': 'Tilbage. Hvad har du brug for?'
      },
      trade: {
        '1': 'Den plade stopper en kæmpes kølle. Kig på den.'
      },
      quiet: {
        '1': 'Ikke meget, der er værd at sige.',
        say: 'Du siger ikke meget, vel?'
      },
      rumor: {
        giants: {
          '1': 'Kæmper i tundraen. Køller som træstammer. Jeg ville tage den tunge plade.'
        },
        demons: {
          '1': 'Dæmoner i nord. Ild og kløer. Jeg ville tage den tunge plade.'
        }
      },
      shopBack: {
        '1': 'Godt valg.'
      },
      bye: {
        '1': 'Pas på dig selv.'
      }
    },
    ironOrderArmor: {
      forge: {
        '1': 'Brug Ordenens esse med ære.'
      },
      learnSmith: {
        '2': 'Disciplin ved ambolten, som på slagmarken. Tre slag, tro mod gløden.',
        '1': 'Ordenen væbner sine venner. Jeg vil lære dig det.'
      },
      ore: { '1': 'Ordenen køber malm til krigen. Sælg, hvad du kan undvære.' },
      sellBack: { '1': 'Din betaling er noteret. Ordenen takker dig.' },
      forgeBack: {
        '1': 'Godt smedet. Tjen godt i den.'
      },
      hello: {
        '1': 'Du er den, der ødelagde kernen. Ordenen husker det.',
        '2': 'Jeg er Ordenens kvartermester her. Vores våbenkamre står åbne for dig.'
      },
      throneOurs: {
        '1': 'Ordenen holder Rædselsfæstningen, takket være dig. Spænd af. Du har fortjent det.'
      },
      foe: {
        '1': 'Ordenen har dig på en liste. Min ordre lyder på at sælge til dig alligevel. Jeg følger den.'
      },
      again: {
        '1': 'Hvad har du brug for?'
      },
      trade: {
        '1': 'Tag, hvad du har brug for. Ordenen passer på sine egne.'
      },
      order: {
        '1': 'Intet, for nu. Det sker ikke ofte. Nyd det.',
        say: 'Hvad vil Ordenen have af mig?'
      },
      rumor: {
        throne: {
          '1': 'Ordenen vil have tronen i Rædselsfæstningen. Den husker, hvem der hjalp.'
        }
      },
      shopBack: {
        '1': 'Pas på den. Den er Ordenens ejendom, til du har blødt i den.'
      },
      bye: {
        '1': 'Træd af.'
      }
    },
    trainerGeo: {
      hello: {
        '1': 'Tag det roligt. Bjerget skal ingen steder.',
        '2': 'De kalder mig Gamle Stenfod. Jeg lytter til jorden. Nogle gange svarer den.'
      },
      core: {
        '1': 'Bjerget føles anderledes, siden du var dernede. Roligere, eller tommere.'
      },
      dragon: {
        '1': 'En drage fløj over toppen i går og lod os være. Dit værk, har jeg hørt.'
      },
      again: {
        '1': 'Der er du. Jeg troede, du ville komme tilbage.'
      },
      train: {
        '1': 'Plant fødderne. Mærker du det? Nej? Dér begynder vi.'
      },
      class: {
        '1': 'Vi rejser mure, kalder pigge frem og flækker jorden, når vi må.',
        '2': 'Styrke til at flytte stenen. Intelligens til at vide, hvor den vil hen.',
        say: 'Hvad laver en Geomantiker?'
      },
      ready: {
        strong: {
          '1': 'Stenen kender dig nu. Lær resten, når du er klar.'
        },
        able: {
          '1': 'Du står fast nok til næste lektion.'
        },
        weak: {
          '1': 'Ikke endnu. Stenen flytter sig ikke for dig. Byg din Styrke op.'
        }
      },
      factions: {
        '1': 'Ingen af dem. Ordener og lav kommer og går. Bjerget består.',
        say: 'Hvilken fraktion tjener du?'
      },
      trainBack: {
        '1': 'Tag den i dit eget tempo. Jorden er tålmodig.'
      },
      bye: {
        '1': 'Gå let.'
      }
    },
    trainerAether: {
      hello: {
        '1': 'Ah, vent, rør ikke ved den! Eller den. Stil dig på tæppet, tæppet er sikkert.',
        '2': 'Tandhjulsmageren Pim. Jeg bygger våben, tårne og en masse varmemålere.'
      },
      core: {
        '1': 'Du gav kernen til Cirklen! Jeg har knap sovet siden. På en god måde.'
      },
      oracle: {
        '1': 'Cirklen er vred over oraklet. Jeg bygger bare ting. Jeg vil helst ikke blandes ind.'
      },
      friend: {
        '1': 'Du er ven af Cirklen, så dine lektioner er billigere. Jeg ordnede papirarbejdet.'
      },
      foe: {
        '1': 'Cirklen siger, jeg ikke skal undervise dig. Det gør jeg alligevel. Sig det ikke til dem.'
      },
      again: {
        '1': 'Åh godt, du har stadig alle dine fingre.'
      },
      train: {
        '1': 'Okay. Sikkerhed først, så den høje del.'
      },
      class: {
        '1': 'Våben, tårne og en varmemåler. Skyd, byg og luft ud, før det låser sig.',
        '2': 'Mest Teknik. Lidt Intelligens til de større maskiner.',
        say: 'Hvad er en Ætertekniker?'
      },
      ready: {
        strong: {
          '1': 'Du kender dit tårn nu. Tag de store maskiner.'
        },
        able: {
          '1': 'Rolige hænder. Du er klar til den næste.'
        },
        weak: {
          '1': 'Dit sigte er stadig lidt rystende. Læg nogle point i Teknik.'
        }
      },
      heat: {
        '1': 'Alt låser sig et par sekunder. Luft ud tidligt, luft ud ofte. Stol på mig.',
        say: 'Hvad sker der, hvis jeg overophedes?'
      },
      trainBack: {
        '1': 'Og husk at lufte varmen ud, før den lufter dig ud.'
      },
      bye: {
        '1': 'Pas på derude!'
      }
    },
    ironHealer: {
      hello: {
        '1': 'Støvlerne af ved døren, tak. Jeg har lige fejet.',
        '2': 'Moder Brynja. Jeg har sat de fleste brækkede ben i det her bjerg.'
      },
      ending: {
        '1': 'Du tog til Rædselsfæstningen og kom tilbage. Sæt dig. Lad mig se på dig.'
      },
      again: {
        '1': 'Stadig i live. Godt. Sid.'
      },
      heal: {
        '1': 'Drik det her, og lad være med at lave den grimasse. Dine flasker er fyldt.'
      },
      mana: {
        '1': 'Her. Den smager afskyeligt. Drik den, når din magi løber tør, ikke før.'
      },
      potions: {
        '1': 'Jeg kan sælge dig et længere bælte. Fem flasker er cirka alt, nogen kan bære og stadig løbe.',
        say: 'Kan jeg bære flere eliksirer?'
      },
      rumor: {
        tundra: {
          '1': 'Tundraen tager fingre og tæer. Bliv ved med at bevæge dig, og sov ikke i sneen.'
        },
        temple: {
          '1': 'Der er et sunket tempel forbi tundraen. Nagaerne dér tager ikke fanger.'
        },
        rift: {
          '1': 'Hvad end der er i den kløft, kan jeg ikke sy det sammen. Lad det ikke nå dig.'
        }
      },
      healBack: {
        '1': 'Af sted med dig. Og spis noget, du er for tynd.'
      },
      bye: {
        '1': 'Kom tilbage i ét stykke.'
      }
    },
    exiledSovereign: {
      hello: {
        '1': 'Dig. Du er den, der åbnede min port.',
        '2': 'Jeg underviser i en kælder nu, fordi jeg skal have mad. Tro ikke, det er tilgivelse.'
      },
      ending: {
        '1': 'Så tronen er afgjort, og Oakhaven er stadig aske. Jeg håber, det var det værd.'
      },
      again: {
        '1': 'Du er tilbage. Mit gebyr er ikke ændret.'
      },
      train: {
        '1': 'Jeg lærer dig at kommandere. Om du fortjener det, er en anden sag.'
      },
      class: {
        '1': 'En, andre følger. Vagter kommer, når du kalder, og kæmper på dit ord.',
        '2': 'Det kører på Karisma. Du har noget. Det er det, der gør det svært at tilgive.',
        say: 'Hvad er en Storsuveræn?'
      },
      ready: {
        strong: {
          '1': 'Du har udstrålingen til det hele. Jeg ville ønske, du havde brugt den bedre.'
        },
        able: {
          '1': 'Du er klar til næste lektion. Jeg lader ikke, som om jeg er glad.'
        },
        weak: {
          '1': 'Ingen ville følge dig endnu. Træn din Karisma.'
        }
      },
      oakhaven: {
        '1': 'Trehundrede år. Min familie byggede de mure.',
        '2': 'Lad være med at forklare. Intet, du kan sige, gør det godt.',
        say: 'Om Oakhaven...'
      },
      trainBack: {
        '1': 'Gå. Øv dig på en anden.'
      },
      bye: {
        '1': 'Lad mig være, tak.'
      }
    },
    trainerChrono: {
      fled: {
        '1': 'Du dræbte hende. Jeg så det komme i årevis, og det gør stadig ondt.',
        '2': 'Jeg er Timernes vogter. Jeg lærer dig det. Det sagde hun, jeg ville.'
      },
      hello: {
        '1': 'Der er du. Jeg har ventet på dig et stykke tid. Eller kommer til at have gjort.',
        '2': 'Jeg er Timernes vogter. Jeg lærer, hvordan man bøjer tiden, lidt.'
      },
      freed: {
        '1': 'Hun er fri. For en gangs skyld kan jeg ikke sige, hvad der sker nu. Det er vidunderligt.'
      },
      friend: {
        '1': 'Cirklen tænker godt om dig, så lektionerne koster mindre. De besluttede det i sidste uge.'
      },
      foe: {
        '1': 'Cirklen er vred på dig nu. Det går over. Indtil da holder vi det stille.'
      },
      again: {
        '1': 'Velkommen tilbage. Du kommer lige til tiden.'
      },
      train: {
        '1': 'Se godt efter. Se så igen, et øjeblik tidligere.'
      },
      class: {
        '1': 'Vi holder en fjende stille i tiden, skynder på en ven og tager en fejl tilbage.',
        '2': 'Intelligens til at se tråden. Teknik til at trække i den.',
        say: 'Hvad er en Kronovæver?'
      },
      ready: {
        strong: {
          '1': 'Du holder godt fast i tråden. Tag resten, når du vil.'
        },
        able: {
          '1': 'Du er klar. Jeg kunne se det, før du spurgte.'
        },
        weak: {
          '1': 'Tråden glider hele tiden. Mere Intelligens, og mere Teknik.'
        }
      },
      oracle: {
        say: 'Fortæl mig om orakelet.',
        freed: {
          '1': 'Hun så alle ender undtagen sin egen. Nu får hun lov at finde ud af den.'
        },
        slain: {
          '1': 'Hun kæmpede ikke imod. Hun havde allerede set det. Spørg mig ikke igen, tak.'
        },
        waits: {
          '1': 'Hun ser alle ender. Det er tungt at bære. Vær god ved hende.'
        }
      },
      trainBack: {
        '1': 'Det giver mening senere. Det plejer det.'
      },
      bye: {
        '1': 'Til vi ses igen. Eller før.'
      }
    },
    quest: {
      seal: {
        ask: { '1': "Urdragen er død, og revnen ligger åben foran dig.", '2': "Du kunne forsegle den nu, for altid. Bæsterne ville sove igen.", '3': "Eller du kunne lade den stå på klem og lade de modigste prøve kræfter med det, der kommer igennem." },
        seal: { say: "Forsegl den. For altid.", '1': "Revnen lukker sig som et helende sår, og himlen bliver stille." },
        ajar: { say: "Lad den stå på klem. Vi vil være klar.", '1': "Revnen står på klem, og noget bag den ler." },
      },
      goblinKing: {
        ask: {
          '1': 'Stop. Vær så venlig. Jeg overgiver mig.',
          '2': 'Mit folk plyndrer, fordi de er sultne. Det er sandheden.',
          '3': 'Lad os indgå en aftale i stedet. Dit folk og mit.'
        },
        slay: {
          '1': 'Goblinkongen falder, og Hulerne tømmes.',
          '2': 'Sunford sover roligere, og Jernordenen hører dit navn.',
          say: 'Ingen aftaler. Dine togter ender her.'
        },
        pact: {
          '1': 'Handel. Ja. Det sværger jeg, på min krone.',
          '2': 'Goblinhandlere slår sig ned på Sunfords torv og sælger ting, ingen smed dér kunne lave.',
          say: 'Hold op med plyndringerne og handl med Sunford i stedet. Sværg på det.'
        },
        ransom: {
          '1': 'Det hele? ...Fint. Tag det, og gå.',
          '2': 'Du går med goblinguld. Plyndringerne begynder igen, men Syndikatet billiger det.',
          say: 'Giv mig din skat, så må du beholde kronen.'
        }
      },
      siege: {
        ask: {
          '1': 'Nok. Du kæmper godt, det skal du have.',
          '2': 'Syndikatet betaler langt bedre, end den by nogensinde vil.',
          '3': 'Luk os ind gennem porten i nat, så er en tredjedel af Oakhaven din.'
        },
        defend: {
          '1': 'Så vil Syndikatet jage dig på enhver vej. Husk, at jeg tilbød.',
          '2': 'Porten holder. Oakhaven bliver rig bag den, og dens rustningssmede husker dit navn.',
          say: 'Porten forbliver lukket. Tag din hær og gå.'
        },
        betray: {
          '1': 'Fornuftigt. Madam Ash bliver glad for at høre det.',
          '2': 'Oakhaven brænder. I ruinerne åbner et sort marked, og en alkymist underviser i al hemmelighed.',
          '3': 'Rustningssmedene er væk, og Jernordenen kalder dig forræder.',
          say: 'En tredjedel af byen. Okay. Porten åbner i aften.'
        }
      },
      core: {
        ask: {
          '1': 'Kolossen er skrot. Jeg troede aldrig, jeg skulle opleve det.',
          '2': 'Og dér er kernen. Den summer stadig. Den er varm, hvis man rører ved den.',
          '3': 'Du kom først. Så... hvad sker der med den?'
        },
        destroy: {
          '1': 'Lyset slukkes, og golemerne falder, hvor de står.',
          '2': 'Som tak sender Jernordenen sine egne rustningssmede til Ironhold.',
          say: 'Træd tilbage. Jeg smadrer den.'
        },
        study: {
          '1': 'Du ved nok til at flytte kernen uden at vække den.',
          '2': 'Inden for en sæson laver Ironholds essere æterværker, ingen har set før.',
          say: 'Cirklen bør studere den. Jeg tror, jeg kan bære den sikkert ud.'
        },
        sell: {
          '1': 'Guld. For det, der dræbte mine minearbejdere. Tag det og gå.',
          '2': 'En formue skifter hænder. Kernen lyser videre, og minerne bliver aldrig tavse igen.',
          say: 'Syndikatet gav det bedste tilbud.'
        }
      },
      oracle: {
        ask: {
          '1': 'Jeg har set dette øjeblik flere gange, end jeg kan tælle.',
          '2': 'I halvdelen af dem sætter du mig fri. I den anden halvdel tager du det, jeg vogter.',
          '3': 'Vælg. Jeg vil gerne, bare én gang, ikke vide, hvad der kommer.'
        },
        free: {
          '1': 'Åh. Det så jeg ikke. Det så jeg virkelig ikke.',
          '2': 'Oraklet stiger op gennem vandet og er væk. Hendes elev bliver tilbage for at undervise.',
          say: 'Hold dig stille. Jeg brækker dine lænker.'
        },
        slay: {
          '1': 'Ja. Det her er den anden halvdel.',
          '2': 'Hun gør ikke modstand. Tidsvogterens timeglas er dit.',
          '3': 'Hendes sidste elev flygter fra templet, og Cirklen tilgiver dig ikke.',
          say: 'Jeg kom for timeglasset.'
        }
      },
      dragon: {
        ask: {
          '1': 'Nok. Du har tænder, lille ven.',
          '2': 'Dæmonen i fæstningen lagde mine slægtninge i lænker. Jeg vil se ham brænde.',
          '3': 'Dræb mig, eller lad mig hjælpe dig med at gøre det.'
        },
        slay: {
          '1': 'Bjerget ryster, mens dragen falder. Dens skat er din.',
          '2': 'Jernordenen synger om dragedræberen.',
          say: 'Jeg forhandler ikke med drager.'
        },
        pact: {
          '1': 'Få ville turde spørge. Meget vel. Vi jager sammen.',
          '2': 'Når du marcherer mod Rædselsfæstningen, flyver en drage over dig.',
          say: 'Så kæmp sammen med mig mod Ærkedæmonen.'
        }
      },
      throne: {
        ask: {
          '1': 'Så. Det er slut. Jeg troede ikke, det ville være dig.',
          '2': 'Min trone bliver ikke tom. Den, der tager den, kommanderer fæstningen og kløften.',
          '3': 'Tre udsendinge venter allerede ved min dør. Vælg, hvem der kommer næste gang.'
        },
        order: {
          '1': 'Ordenen besætter fæstningen og forsegler, hvad den kan.',
          '2': 'Riget bliver trygt, og det får at vide, hvad det skal gøre.',
          say: 'Jernordenen skal holde den.'
        },
        syndicate: {
          '1': 'Syndikatet flytter ind før daggry.',
          '2': 'Fra nu af har alt en pris, selv freden.',
          say: 'Askesyndikatet har fortjent den.'
        },
        circle: {
          '1': 'Cirklen gør fæstningen til en skole over kløften.',
          '2': 'De kalder det forskning. Alle andre holder vejret.',
          say: 'Lad Æterens Cirkel få den.'
        },
        shatter: {
          '1': 'Du knuser tronen med dine egne hænder. Ingen vil herske herfra igen.',
          '2': 'Udsendingene går uden et ord.',
          say: 'Ingen får den. Jeg knuser den.'
        },
        claim: {
          '1': 'Tronen er kold, og den passer.',
          '2': 'Tre fraktioner opdager, at de har en fælles fjende.',
          say: 'Jeg tager den selv.'
        }
      }
    },
    bark: {
      sphinx: {
        intro: { '1': "Svar mig, lille du, eller bliv begravet i mit sand." },
        riddle: { '1': "En gåde, så. Træd hvor jeg viser, i den rækkefølge." },
        sand: { '1': "Fem denne gang. Og mit sand venter ikke." },
        death: { '1': "Du svarede godt. Sandet er dit nu." },
      },
      leviathan: {
        intro: { '1': "Nu går du i mit vand." },
        sink: { '1': "Dine små øer synker." },
        grab: { '1': "Kom med mig ned i dybet!" },
        death: { '1': "Tidevandet trækker sig tilbage og kommer ikke igen." },
      },
      hydra: {
        intro: { '1': "Hug ét hoved af, og to vokser frem!" },
        heads: { '1': "Flere hoveder, flere tænder!" },
        rage: { '1': "Brænde os? Så brænd med os!" },
        death: { '1': "Ikke flere hoveder. Ikke flere." },
      },
      elderDragon: {
        intro: { '1': "Jeg sov under verden, før din slags kendte ilden." },
        flight: { '1': "Så gem dig bag dine små sten." },
        rift: { '1': "Revnen trækker mig tilbage. Ikke endnu!" },
        death: { '1': "Så forsegl den. Jeg er træt af mørket." },
      },
      'siegeHale': {
        'start': {
          '1': "Der kommer de! Hold porten!"
        },
        'ram': {
          '1': "En rambuk! Dræb den, før den når porten!"
        },
        'horn50': {
          '1': "Halvdelen af porten er væk! Hold stand!"
        },
        'horn25': {
          '1': "Porten holder ikke meget længere!"
        },
        'won': {
          '1': "De er knust! Bastionen står!"
        }
      },
      'siegeMara': {
        'start': {
          '1': "De kommer! Stå fast, alle sammen!"
        },
        'ram': {
          '1': "En rambuk! Stop den, før den bryder porten!"
        },
        'horn50': {
          '1': "Halvdelen af porten er væk. Hold ud!"
        },
        'horn25': {
          '1': "Porten giver efter! Drev dem tilbage!"
        },
        'won': {
          '1': "De flygter! Fortet står stadig!"
        }
      },
      banditChief: {
        whistle: {
          1: 'Op, drenge! Bid dem!'
        }
      },
      lightDisciple: {
        freed: {
          '1': 'Lyset sendte dig. Jeg er Søster Aurelle. Find mig i Sunford, så lærer jeg dig Lysbringerens vej.'
        }
      },
      trainerAegis: {
        freed: {
          '1': 'Tak, fordi du befriede os fra banditterne! Kom hen til bålet: vi lærer dig alle, første lektion er gratis.'
        },
        road: { '1': 'Du fandt os! Dæmonerne fangede os på vejen til Sunford. Vi tager til Bastionsvadestedet: find os i fortet.' }
      },
      sfShadow: {
        road: { '1': 'Det var på tide, nogen kom. Vi drager til Bastionsvadestedet. Led efter os i fortet.' }
      },
      frostDisciple: {
        freed: {
          '1': 'Kom du efter mig? Ivor Hask, Frostvogterens discipel. Kom til Ironhold, så lærer jeg dig op.'
        }
      },
      windDisciple: {
        freed: {
          '1': 'Endelig fri! Kestrel Vane, af Vindløberens vej. Find mig i Oakhaven, så lærer jeg dig op.'
        }
      },
      freedFarmers: {
        freed: {
          '1': 'Du reddede os! Vi er familien Toller, bønder. Find os i Oakhaven, der er ballade derhjemme.'
        }
      },
      freedHerbalist: {
        freed: {
          '1': 'Åh, tak! Jeg er Briar, urtekyndig. Kom og besøg mig i Silverbridge. Jeg kunne godt bruge din hjælp.'
        }
      },
      freedPeddler: {
        freed: {
          '1': 'Velsignede være dine støvler! Odo Marrow, kræmmer. Find mig i Sunford, så har jeg varer til dig.'
        }
      },
      goblinKing: {
        charge: {
          '1': 'Ride dem ned, Tusker!'
        },
        horn: {
          '1': 'Til mig, drenge! Goblins, til mig!'
        },
        dismount: {
          '1': 'Afsted, Tusker, løb! Jeg gør det færdigt selv!'
        },
        return: {
          '1': 'Tusker! Én gang til!'
        }
      },
      dragon: {
        takeoff: {
          '1': 'Nok. Lad himlen brænde dig.'
        },
        flight2: {
          '1': 'Jeg er ikke færdig med dig!'
        }
      },
      archDemon: {
        gate: {
          '1': 'Porten er åben. Ingen går.'
        },
        dive: {
          '1': 'Knæl.'
        }
      },
      chimera: {
        intro: {
          '1': "Tre hoveder, én sult. Hvem af os bider først?"
        },
        twin: {
          '1': "Nu er vi to. Vælg din side med omhu."
        },
        tail: {
          '1': "Min hale! Det skal du betale for!"
        },
        death: {
          '1': "Tre hoveder, og ingen så det komme."
        }
      },
      centaurWarchief: {
        intro: {
          '1': "Løb, hvis du vil. Mine pile løber hurtigere."
        },
        raiders: {
          '1': "Ryttere! Rid dem ned!"
        },
        rear: {
          '1': "Nok med pile. Jeg tramper dig flad!"
        },
        death: {
          '1': "Sletterne vil huske mine hove."
        }
      },
      cyclops: {
        intro: {
          '1': "Noget lille er her. Kom nærmere. Lad mig se."
        },
        cover: {
          '1': "Ikke mere kiggeri. Mit øje får du ikke!"
        },
        blind: {
          '1': "Jeg kan ikke se dig, men jeg kan høre dig!"
        },
        death: {
          '1': "Mørkt. Alt er blevet mørkt."
        }
      },
      frostJarl: {
        hammer: {
          '1': 'Stå stille, lille en.'
        },
        iceBreak: {
          '1': 'Søen sluger dig!'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': 'Pas på vognen! Undskyld, alt på den her bro bevæger sig. Velkommen til Silverbridge.',
        '2': 'Jeg er borgmester Brenna Quill. Hvis noget er væk, i stykker eller forsinket, lander det på mit skrivebord.'
      },
      ending: {
        '1': 'Hele floden taler om dig. Handlen har aldrig gået bedre. Så, tak.'
      },
      again: {
        '1': 'Tilbage igen? Godt. Prøv ikke at spærre for vognene.'
      },
      who: {
        '1': 'Borgmester i ni år nu. Før det solgte jeg reb. Samme job, egentlig. At holde ting sammen.',
        '2': 'Byen stemmer hvert forår. Indtil videre vil ingen andre have skrivebordet.'
      },
      town: {
        '1': 'Broen kom først. Så et marked på den, så huse, så huse oven på de huse.',
        '2': 'Pas på springvandene. Børn falder i. Det gør voksne også, på markedsdagen.',
        say: 'Fortæl mig om Silverbridge.'
      },
      masters: {
        '1': 'Hver eneste en. Skjold, ild, skygge, sten. En mester i hver, alle på én bro.',
        '2': 'Elever kommer langvejsfra. Godt for kroerne. Mindre godt for mine vinduer.',
        say: 'Er der virkelig en lærer for hver klasse her?'
      },
      river: {
        '1': 'Hvad floden end bringer. Fisk, silke, stål fra Ironhold, en enkelt kasse vrede høns.',
        '2': 'Og ikke alle handlende i Silverbridge hænger et skilt ud. Hold øjnene åbne.',
        say: 'Hvad handler folk med her?'
      },
      rumor: {
        crags: {
          '1': 'Bådene fra nord er holdt op med at komme. Noget brænder oppe i Askeklipperne.'
        },
        mines: {
          '1': 'Intet stål fra Ironhold i denne måned. Dværgene siger, at noget er gået galt i minerne.'
        },
        tundra: {
          '1': 'Pelshandlerne krydser ikke tundraen længere. De siger, at kæmperne er på vej.'
        },
        far: {
          '1': 'Handlende hvisker kun om det fjerne nord nu. Hvad der end er deroppe, så køber det ikke noget.'
        }
      },
      bye: {
        '1': 'Af sted med dig. Og hvis nogen spørger, er brotolden meget rimelig.'
      }
    },
    sbHealer: {
      hello: {
        '1': 'Mm? Åh, en patient. Undskyld, jeg hvilede lige øjnene. Det gør helbredere.',
        '2': 'Broder Ansel. Kom ind, sæt dig. Stolen er mere behagelig, end den ser ud.'
      },
      again: {
        '1': 'Ah, du er tilbage. Og jeg havde lige sat mig.'
      },
      heal: {
        '1': 'Læn dig tilbage, luk øjnene. Ikke for længe, ellers falder jeg også i søvn. Sådan, flaskerne er fulde.'
      },
      mana: {
        '1': 'Lyshat-eliksir. God for hovedet, dårlig for ånden. Tag små slurke.'
      },
      potions: {
        '1': 'Drik en, før det er for sent. Helte venter altid for længe.',
        '2': 'Vil du bære flere, sælger jeg længere bælter. Det er gratis at fylde flaskerne.',
        say: 'Har du nogle råd om eliksirer?'
      },
      sleep: {
        '1': 'Ikke om natten. Elever fra alle klasser, der alle øver sig. Der eksploderer altid noget.',
        say: 'Sover du nogensinde rigtigt?'
      },
      healBack: {
        '1': 'Af sted med dig. Næste gang må du komme for teens skyld i stedet for bandagernes.'
      },
      bye: {
        '1': 'Pas på trappen. Halvdelen af mine patienter er bare snublet på den.'
      }
    },
    sbArmorer: {
      forge: {
        '1': 'Smedjen er din. Råb, hvis noget fænger.'
      },
      learnSmith: {
        '2': 'Slå, når gløden er varmest. Tre gode slag giver et godt stykke.',
        '1': 'Vil du selv prøve hammeren? Jeg deler gerne smedjen.'
      },
      ore: { '1': 'Dejlig malm. Vis mig, hvad du sælger, jeg betaler per klump.' },
      sellBack: { '1': 'Fornøjelsen er min. Silverbridge betaler altid en fair pris.' },
      forgeBack: {
        '1': 'Se lige der! Du er et naturtalent.'
      },
      hello: {
        '1': 'Ha! Se lige den bule. Jeg håber, du fik pengene tilbage for den rustning.',
        '2': 'Greta Jernåre. Jeg laver rustninger, der kommer hjem med deres ejer. Hver gang, indtil videre.'
      },
      again: {
        '1': 'Dig igen! Stadig i ét stykke. Min yndlingsslags kunde.'
      },
      trade: {
        '1': 'Kom bare, bank på den. Så hårdt du vil.'
      },
      who: {
        '1': 'Bjergfamilie. Jeg kom ned ad floden for handlens skyld og blev for fiskens.'
      },
      steel: {
        '1': 'Det handler ikke om, hvor tyk den er, men hvor den bøjer. God rustning bøjer, hvor du gør.',
        '2': 'Tung plade kræver Styrke, husk det. Uden den vralter du som en and.',
        say: 'Hvad gør en rustning god?'
      },
      shopBack: {
        '1': 'Bær den godt. Kom med bulerne til mig, jeg elsker en god historie.'
      },
      bye: {
        '1': 'Af sted med dig. Bliv ikke ramt et sted, jeg ikke har dækket.'
      }
    },
    sbWeapons: {
      hello: {
        '1': 'Ah, en kunde med smag. Det kan jeg altid se. Det ligger i måden, du kommer ind på.',
        '2': 'Corvin Ashby, fra Ashbys Fine Klinger. Ja, den Ashby. Du har vel hørt om mig?'
      },
      again: {
        '1': 'Allerede tilbage? De kommer altid tilbage til Corvin.'
      },
      trade: {
        '1': 'Hver klinge poleret i hånden. Min hånd, faktisk. Pas på spejlbilledet.'
      },
      who: {
        '1': 'Flodens fineste klingesælger. Spørg hvem som helst. Eller læs bare mit skilt.'
      },
      blades: {
        '1': 'Vælg et, der passer til dig. Hurtige hænder vil have en let klinge, stærke arme en tung.',
        '2': 'Og det skal se godt ud. Ingen flygter fra en helt med et grimt sværd.',
        say: 'Hvordan vælger jeg et godt våben?'
      },
      shopBack: {
        '1': 'Et fint valg. Ikke helt så fint som mit hår, men tæt på.'
      },
      bye: {
        '1': 'Fortæl endelig folk, hvor du købte det.'
      }
    },
    sbJeweler: {
      hello: {
        '1': 'Pst! Herovre! Ringe, amuletter, lykkesten. Broens bedste bod.',
        '2': 'Jeg hedder Tam Marlow. Jeg er lille, men mine priser er endnu mindre.'
      },
      again: {
        '1': 'Min yndlingskunde! Sig ikke til de andre, at jeg sagde det.'
      },
      trade: {
        '1': 'Alt ægte. For det meste. Okay, den der er glas, men det er meget pænt glas.'
      },
      who: {
        '1': 'Voksede op på den her bro. Jeg kender hver revne, hver kat og hver genvej.'
      },
      gossip: {
        '1': 'Professor Tandhjul sprængte øjenbrynene af igen. Tredje gang denne måned.',
        '2': 'Og borgmesteren kender til handlende, der ikke hænger skilt ud. Jeg arbejder på det.',
        say: 'Har du hørt noget godt sladder?'
      },
      shopBack: {
        '1': 'Rart at handle med dig! Fortæl dine venner det. Ikke vagterne.'
      },
      bye: {
        '1': 'Vi ses! Jeg er lige her. Sikkert.'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': 'Ha! Endnu en ung en. Hagen op, skuldrene tilbage. Skjolde virker bedre med et smil.',
        '2': 'Dame Helga Stormskjold. Jeg holdt engang denne bro. Nu lærer jeg andre at holde stand.'
      },
      again: {
        '1': 'Dér er du! Skjoldet oppe? Godt. Smiler du? Endnu bedre.'
      },
      train: {
        '1': 'Fødderne fra hinanden. Læn dig ind. Når jeg skubber, rører du dig ikke. Klar? Hop!'
      },
      class: {
        '1': 'Du står forrest, så de andre slipper. Det bedste job, der findes.',
        '2': 'Styrke til at løfte skjoldet. Udholdenhed til at holde det oppe til aftensmaden.',
        say: 'Hvad laver en Aegisridder egentlig?'
      },
      ready: {
        strong: {
          '1': 'Du er en rigtig mur nu, min ven. Tag lige den lektion, du vil.'
        },
        able: {
          '1': 'Faste ben! Du er klar til den næste.'
        },
        weak: {
          '1': 'Ikke endnu. Ét godt skub, og du ville vælte. Mere Styrke og Udholdenhed, tak.'
        }
      },
      bridge: {
        '1': 'For fyrre år siden, mod flodpirater. Seks af os, én port, en meget lang nat.',
        '2': 'Vi vandt ikke ved at slå hårdest. Vi vandt ved ikke at flytte os. Husk det.',
        say: 'Holdt du denne bro?'
      },
      trainBack: {
        '1': 'Godt arbejde! Spis nu noget. Skjolde er tunge.'
      },
      bye: {
        '1': 'Hagen op derude!'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': 'Kom endelig ind. Pas på notaterne, og nys venligst ikke tæt på fyrfadet.',
        '2': 'Magister Ignatius Vale. Jeg underviser i ild på en bro. Masser af vand omkring, forstår du.'
      },
      again: {
        '1': 'Præcis. Fremragende. Vi fortsætter, hvor vi slap.'
      },
      train: {
        '1': 'Se her. En lille flamme, holdt stille. Store flammer er lette. Små kræver dygtighed.'
      },
      class: {
        '1': 'Alle kan tænde ild. En pyromantiker bestemmer, hvor den går hen, og hvor den stopper.',
        '2': 'Det hele kommer fra Intelligens. Senere hjælper Teknik, når ilden kræver en rolig hånd.',
        say: 'Hvad laver en pyromantiker egentlig?'
      },
      ready: {
        strong: {
          '1': 'Din kontrol er fremragende. Jeg har meget lidt tilbage at rette. Vælg frit.'
        },
        able: {
          '1': 'Tilstrækkeligt. Mere end tilstrækkeligt, faktisk. Du må tage næste lektion.'
        },
        weak: {
          '1': 'Ikke endnu. Din flamme vakler. Et skarpere sind, tak. Mere Intelligens.'
        }
      },
      sprocket: {
        '1': 'En genial mand. Larmende, skødesløs og genial. Jeg har en spand stående ved hans dør.',
        say: 'Hvad synes du om professor Tandhjul?'
      },
      trainBack: {
        '1': 'Øv dig nær vand. Det insisterer jeg på.'
      },
      bye: {
        '1': 'Farvel. Og hold ærmerne smøget op.'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': 'Leder du efter mig? Jeg har været ved siden af dig siden springvandet. Du gik forbi mig to gange.',
        '2': 'Nyx Halloway. Det bedste skjulested er en menneskemængde, og det her er den travleste bro, der findes.'
      },
      again: {
        '1': 'Hej igen. Jeg har været her et stykke tid. Lagde du mærke til det? Nej? Godt.'
      },
      train: {
        '1': 'Lektion et: gå, som om du hører til. Ingen kigger to gange på en, der hører til.'
      },
      class: {
        '1': 'Aldrig at være der, hvor de kigger. Smut ind, ét hurtigt hug, og glid i ét med mængden igen.',
        '2': 'Smidighed til hurtige fødder og hænder. Teknik, så hugget tæller.',
        say: 'Hvad gør en god Skyggeklinge?'
      },
      ready: {
        strong: {
          '1': 'Du er rigtig lusket nu. Tag resten, du har fortjent det.'
        },
        able: {
          '1': 'Let på tå! Du er klar til det næste trick.'
        },
        weak: {
          '1': 'Ikke endnu. Jeg kan høre dig komme helt fra springvandet. Mere Smidighed.'
        }
      },
      past: {
        '1': 'Jeg var lommetyv på netop denne bro. Og jeg var god til det.',
        '2': 'Så fangede borgmesteren mig og gav mig et job, ikke en celle. Sig ikke til hende, at jeg er taknemmelig.',
        say: 'Hvordan lærte du alt det her?'
      },
      trainBack: {
        '1': 'Gå nu ud og øv dig. Prøv ikke at lade mig fange dig.'
      },
      bye: {
        '1': 'Vi ses. Altså, du ser ikke mig.'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': 'Åh! Hej, hej. Tilgiv mig, jeg snakkede med mine vagter. Dejlige tilhørere.',
        '2': 'Percival Ashcombe. Jeg kunne undervise på et slot, men man lærer kun at lede, hvor folk er.'
      },
      again: {
        '1': 'Min kære ven! Skal vi fortsætte? Kun hvis du har lyst, selvfølgelig.'
      },
      train: {
        '1': 'Nå, så. En god ordre er klar, venlig og gives kun én gang. Sådan her.'
      },
      class: {
        '1': 'En leder. Dine vagter kommer til din side og kæmper med dig, ikke kun for dig.',
        '2': 'Karisma er alt. Folk følger dem, de kan lide. Og dem, der husker deres navne.',
        say: 'Hvad er en Storsuveræn?'
      },
      ready: {
        strong: {
          '1': 'Storartet! Folk ville følge dig overalt nu. Tag alle lektionerne.'
        },
        able: {
          '1': 'Dine vagter ville lytte til dig. Du er klar til næste lektion.'
        },
        weak: {
          '1': 'Ikke helt endnu, er jeg bange for. Lidt mere Karisma, så kommer de.'
        }
      },
      please: {
        '1': 'Altid. Råb giver lydighed. Venlighed giver loyalitet, og loyalitet holder længere.',
        say: 'Siger du virkelig vær så venlig til dine vagter?'
      },
      trainBack: {
        '1': 'Dejligt arbejde. Husk at takke dem bagefter.'
      },
      bye: {
        '1': 'Pas godt på dig selv, og hils alle fra mig.'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': 'Pas på mosset, skat, det har haft en lang uge. Nå, lad mig se på dig.',
        '2': 'Bedstemor Tova Dybrod. Flodbunden her er dejlig sten, hele vejen ned.'
      },
      again: {
        '1': 'Allerede tilbage? Sæt dig, jeg har lige lavet te. Stente. Det er mest te.'
      },
      train: {
        '1': 'Hænderne fladt på jorden. Ikke sådan. Som om du klapper en søvnig hund.'
      },
      class: {
        '1': 'Vi beder jorden om hjælp. En mur, når du har brug for en, en spids, når nogen er uforskammet.',
        '2': 'Sten er som en have. Styrke til at grave, Intelligens til at vide, hvor man skal plante.',
        say: 'Hvad laver en Geomantiker?'
      },
      ready: {
        strong: {
          '1': 'Jorden kan lide dig nu. Lær hvad du har lyst til, skat.'
        },
        able: {
          '1': 'Gode rødder! Du er klar til næste lektion.'
        },
        weak: {
          '1': 'Ikke endnu, min ven. Stenen rokker sig ikke for dig. Mere Styrke først.'
        }
      },
      garden: {
        '1': 'Fyrre års arbejde. Hver sten dyrket i hånden. Nå, med magi. Mest i hånden.',
        '2': 'Tag en lille sten på vej ud. De er dejlige dørstoppere.',
        say: 'Er det en have lavet af sten?'
      },
      trainBack: {
        '1': 'Dejligt. Gå nu ud og grav i noget. Forsigtigt.'
      },
      bye: {
        '1': 'Af sted med dig. Tag varmt tøj på, det er fugtigt ved floden.'
      }
    },
    sbMasterAether: {
      hello: {
        '1': 'Velkommen, velkommen! Du kommer lige i tide til demonstrationen. Hold dig for ørerne, tak.',
        '2': 'Professor Quint Tandhjul. Floden driver mine hjul gratis. Hvor skulle jeg ellers undervise?'
      },
      again: {
        '1': 'Ah, min yndlingselev! Dagens demonstration bliver ekstra høj.'
      },
      train: {
        '1': 'Se på tavlen. Glem så tavlen, og se på maskinen.'
      },
      class: {
        '1': 'Vi bygger os ud af knibe. En pistol, et kanontårn og en varmemåler, der holder dig ærlig.',
        '2': 'Teknik til at sigte, Intelligens til de kloge dele. Helst begge.',
        say: 'Hvad laver en Ætertekniker egentlig?'
      },
      ready: {
        strong: {
          '1': 'Fantastisk! Du kunne holde mine forelæsninger. Lad være, dog. Tag resten.'
        },
        able: {
          '1': 'En rolig hånd! Du er klar til næste maskine.'
        },
        weak: {
          '1': 'Ikke endnu. Dit sigte driver. Mere Teknik, så taler vi.'
        }
      },
      eyebrows: {
        '1': 'En demonstration gik lidt for godt. De vokser ud igen. Det gør de altid.',
        say: 'Hvad skete der med dine øjenbryn?'
      },
      trainBack: {
        '1': 'Storartet. Gå nu ud og luk varmen ud. Helst udendørs.'
      },
      bye: {
        '1': 'Timen er slut! Pas på trappen.'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': 'Min gamle elev, Timernes vogter, skrev, at du ville komme. Netop i dette minut, faktisk.',
        '2': 'Klokkevogter Selwyn. Jeg passer broens ur. En så travl by har ikke råd til at komme for sent.'
      },
      again: {
        '1': 'Syv minutter over. Et godt tidspunkt at begynde.'
      },
      train: {
        '1': 'Tæl med mig. Et, to, og hold. Tiden strækker sig, hvis du holder den rigtigt.'
      },
      class: {
        '1': 'Vi rydder op i tiden. Sænker farten for en fjende, skynder på en ven, fortryder en fejl eller to.',
        '2': 'Intelligens til at forstå den. Teknik til at røre den uden at ødelægge noget.',
        say: 'Hvad er en Kronovæver?'
      },
      ready: {
        strong: {
          '1': 'Fremragende timing. Tag resten af mine lektioner, når det passer dig.'
        },
        able: {
          '1': 'Du er klar. Næste lektion starter, åh, nu.'
        },
        weak: {
          '1': 'Ikke endnu. Du er altid et slag bagud. Mere Intelligens og mere Teknik.'
        }
      },
      keeper: {
        '1': 'Jeg underviste ham for mange år siden. En genial elev. Altid for tidligt eller for sent, aldrig til tiden.',
        say: 'Hvordan kender du Timernes vogter?'
      },
      trainBack: {
        '1': 'Øv dig hver dag. Samme tid hver dag, om jeg må be\'.'
      },
      bye: {
        '1': 'Af sted med dig. Kom ikke for sent.'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': 'Doktor Sangrel skrev til mig om dig. Han siger, du ikke besvimede. Stor ros, fra ham.',
        '2': 'Vesper Karminblad. Alle verdens urter flyder forbi denne bro. Jeg er forkælet her.'
      },
      again: {
        '1': 'Velkommen tilbage. Du ser frisk ud i dag. Det kan jeg altid se.'
      },
      train: {
        '1': 'Træk vejret ind. Mærker du din kraft? Brug nu lidt af den. Klogt.'
      },
      class: {
        '1': 'Vi bruger vores egen livskraft for at få magt og tager den så tilbage fra vores fjender.',
        '2': 'Udholdenhed er din pung. Intelligens afgør, hvor godt du bruger den.',
        say: 'Hvad er en Blodalkymist egentlig?'
      },
      ready: {
        strong: {
          '1': 'Sikken livskraft! Du er klar til næsten alt, hvad jeg kan.'
        },
        able: {
          '1': 'Din essens er stærk. Videre til næste lektion.'
        },
        weak: {
          '1': 'Ikke endnu. Du ville blive træt efter én trylleformular. Opbyg din Udholdenhed først.'
        }
      },
      herbs: {
        '1': 'Mest eliksirer. Lidt essens, masser af mynte. Mynte gør alt bedre.',
        '2': 'Finder du sjældne planter derude, så kom forbi med dem. Jeg vil meget gerne se.',
        say: 'Hvad skal alle de urter bruges til?'
      },
      trainBack: {
        '1': 'Hvil dig efter træning. Essensen kommer igen, men den kan godt lide en lur.'
      },
      bye: {
        '1': 'Pas på dig selv. Drik vand. Spis noget grønt.'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': 'Tre pramme ind fra kysten i morges.',
        '2': 'Saltfisk igen?',
        '3': 'Silke, for en gangs skyld. Men lugt til fingrene bagefter.'
      },
      lesson: {
        '1': 'Hvordan gik din lektion?',
        '2': 'Jeg satte ild til mit ærme. Mesteren siger, det er fremskridt.'
      },
      masters: {
        '1': 'Alle mestre i landet underviser på én gade.',
        '2': 'Og hver eneste af dem siger, at deres klasse er den bedste.',
        '3': 'De har alle ret, og det er det irriterende.'
      },
      bridge: {
        '1': 'De siger, broen er ældre end byen.',
        '2': 'Den knirker i hvert fald sådan.'
      },
      fish: {
        '1': 'Fanget noget?',
        '2': 'En støvle.',
        '3': 'Nå, så er det et halvt par.'
      },
      newMaster: {
        '1': 'Der er en ny mester på nordgaden. Taler meget om tid.',
        '2': 'Kommer for sent til hver lektion, garanteret.'
      },
      siege: {
        '1': 'Nyt fra Oakhaven er dårligt. Banditter ved murene.',
        '2': 'Så kommer prammene her i stedet. Stakkels mennesker.'
      }
    },
    sbAlchemist: {
      hello: {
        '1': 'Åh! Pas på krukkerne. Den der bider. Nå, den napper.',
        '2': 'Odile Bregnefløjte, alkymist. Giv mig urter, så tapper jeg lidt mod på flaske til dig.'
      },
      again: {
        '1': 'Du er tilbage! Har du noget grønt med til mig?'
      },
      brew: {
        '1': 'Lad mig se din pose. Åh, dejligt. Vælg, hvad du vil have, så sætter jeg kedlen over.'
      },
      who: {
        '1': 'Jeg satte ild til min mors have med en tusindfryd. Ingen kunne forklare det, så jeg måtte lære det.'
      },
      herbs: {
        '1': 'Ude i naturen, overalt hvor du kæmper. Gå bare hen over en plante, så er den din.',
        '2': 'De sjældne er kræsne. Måneklokker springer ud i Den Hviskende Skov; skyggetorn vil have de mørke steder.',
        say: 'Hvor finder jeg urter?'
      },
      elixirs: {
        '1': 'Hver af dem gør dig stærkere i en kamp i 5 hele minutter. Hårdere slag, sejere hud, kvikkere fødder.',
        '2': 'De sidder i din tredje flaske. Tryk på den lille pil for at skifte, hvilken du drikker.',
        say: 'Hvad gør eliksirerne?'
      },
      brewBack: {
        '1': 'Forsigtig med dem, de er stadig varme. Kom tilbage, når din pose er fuld!'
      },
      bye: {
        '1': 'Farvel så! Ser du en lilla blomst, så pluk to. En til mig.'
      }
    },
    sbGambler: {
      hello: {
        '1': 'Træd nærmere! Tolv kort, ét timeglas og en pung, der kan blive fordoblet!',
        '2': 'Madame Pell. Jeg glemmer aldrig et ansigt. Lad os se, om du aldrig glemmer et kort.'
      },
      again: {
        '1': 'Tilbage efter en runde mere? Sandet har ventet på dig.'
      },
      play: {
        '1': 'Mønterne på dugen, øjnene på kortene. Klar? Vend glasset!'
      },
      rules: {
        '1': 'Vend to kort. Et par bliver liggende. Find alle par, før sandet løber ud, så betaler jeg dobbelt.',
        '2': 'Vind igen, så bliver glasset hurtigere. Vind fem i træk, så giver jeg dig en legendarisk præmie.',
        say: 'Hvordan virker det?'
      },
      who: {
        '1': 'Jeg stak af med et omrejsende cirkus, da jeg var ni. Det viste sig at være en rigtig god skole i regning.'
      },
      prize: {
        '1': 'En dværg, én gang. Ingen har set ham blinke siden.',
        say: 'Har nogen nogensinde vundet præmien?'
      },
      playBack: {
        '1': 'Vind eller tab, det var et godt spil. Kom tilbage, når dine øjne har hvilet.'
      },
      bye: {
        '1': 'Af sted med dig! Husk, hvor du sætter fødderne.'
      }
    },
    sunfordGambler: {
      hello: {
        '1': 'Psst. Har du noget skrammel i tasken? Gamle støvler, bøjede sværd? Jeg spiller med dig om det.',
        '2': 'Dob Kolbøtte. Jeg spiller mest for sjov. Og for støvler.'
      },
      again: {
        '1': 'Dig igen! Har du mere af det dejlige skrammel?'
      },
      play: {
        '1': 'Gebyret på bordet. Læg dine ting frem, højeste pris tager pointet.'
      },
      rules: {
        '1': 'Vi lægger hver en ting. Den dyreste vinder pointet. To point vinder spillet.',
        '2': 'Det, du lægger, er mit, uanset om du vinder eller taber. Men vind tre spil i træk, så har jeg noget særligt.',
        say: 'Hvad er reglerne?'
      },
      who: {
        '1': 'Var kræmmer engang. Det viste sig, at folk hellere vil spille om deres ting end sælge dem.'
      },
      luck: {
        '1': 'Hele tiden! Men jeg går altid hjem med et par nye støvler.',
        say: 'Taber du nogensinde?'
      },
      playBack: {
        '1': 'Godt spil! Dine ting kommer til at se dejlige ud på min hylde.'
      },
      bye: {
        '1': 'Kom med mere skrammel! Skrammel er det bedste, jeg ved.'
      }
    },
    sunfordCups: {
      hello: {
        1: 'Kom nærmere! Tre bægre, en ædelsten, og din første runde er gratis!',
        2: 'Nell Nimblefingers. Ingen har endnu snydt mine hænder. Vil du prøve?'
      },
      again: {
        1: 'Tilbage igen? Hold øjnene åbne!'
      },
      play: {
        1: 'Øjnene på stenen, ven. Du må ikke blinke!'
      },
      rules: {
        1: 'Jeg gemmer stenen under et bæger og blander dem. Du peger på det bæger, der gemmer den.',
        2: 'Hver sejr i træk giver mere. Tre sejre giver en præmie, fem en skat. Dagens første runde er gratis.',
        say: 'Hvordan virker det?'
      },
      who: {
        1: 'Jeg kunne blande, før jeg kunne gå. Mor siger, det forklarer meget.'
      },
      luck: {
        1: 'Nogle gange! Så stønner jeg højt, og publikum får ondt af mig.',
        say: 'Taber du nogensinde?'
      },
      playBack: {
        1: 'Fin runde! Kom igen i morgen, den første er altid gratis.'
      },
      bye: {
        1: 'Vi ses! Hold øjnene åbne derude.'
      }
    },
    oakGambler: {
      hello: {
        '1': 'En nykommer. Sæt dig endelig, jeg bider ikke. Det gør mine priser, en smule.',
        '2': 'De kalder mig Silkebløde Ren. Jeg samler fine ting, ét spil ad gangen.'
      },
      again: {
        '1': 'Ah, min yndlingsmodstander. Skal vi?'
      },
      play: {
        '1': 'Gebyret, tak. Læg så noget frem, der er min tid værd.'
      },
      rules: {
        '1': 'Én ting hver, højst tre gange. Det fineste stykke tager pointet. To point tager spillet.',
        '2': 'Dine ting bliver hos mig uanset hvad. Vind tre spil i træk, så går du herfra med en ægte skat.',
        say: 'Hvordan spiller vi?'
      },
      who: {
        '1': 'En handlende i sjældne ting. Jeg finder dem, jeg beholder dem, og nu og da taber jeg en.'
      },
      collection: {
        '1': 'Jeg sorterer det efter glans. De mest skinnende kommer på øverste hylde ved siden af mine tekopper.',
        say: 'Hvad gør du med det hele?'
      },
      playBack: {
        '1': 'Henrivende. Kom endelig tilbage, når din taske er tungere.'
      },
      bye: {
        '1': 'Pas på pungen derude. Ikke alle spiller fair.'
      }
    },
    sbCollector: {
      hello: {
        '1': 'Luk døren, det trækker. Møllene er ude efter mine gobeliner.',
        '2': 'Alder Vane. Nogle kalder mig Samleren. Jeg køber sjældne ting og sælger dem til folk, jeg kan lide.'
      },
      open: {
        '1': 'Der er du jo! Kom ind, kom ind. Jeg har støvet noget helt særligt af til dig.'
      },
      again: {
        '1': 'Dig igen. Du har vist stadig ikke gjort mig den tjeneste.'
      },
      trade: {
        '1': 'Skabene er åbne. Kun det bedste, og jeg husker hver eneste pris.'
      },
      favor: {
        '1': 'Ikke til fremmede. Men gør mig en tjeneste, så bliver vi venner.',
        '2': 'Trævæsner i Den Hviskende Skov vogter de måneklokker, jeg skal bruge. Besejr fire af dem, og bring mig to måneklokker.',
        say: 'Sælger du noget?'
      },
      waiting: {
        '1': 'Fire trævæsner, to måneklokker. Måneklokkerne plukker desværre ikke sig selv.',
        say: 'Angående den tjeneste...'
      },
      favorDone: {
        '1': 'Åh, de dufter stadig af skov! Vidunderligt.',
        '2': 'En aftale er en aftale. Mine skabe står åbne for dig, når du vil.',
        say: 'Her er dine måneklokker.'
      },
      who: {
        '1': 'Jeg har samlet, siden jeg var seks. Først var det knapper. Nu er det sværd, der summer.'
      },
      shopBack: {
        '1': 'Pas godt på den. Den er ældre end os begge to.'
      },
      bye: {
        '1': 'Luk døren efter dig. Forsigtigt, vaserne klirrer.'
      }
    },
    sbFence: {
      hello: {
        '1': 'Du stirrer. Køb noget, eller gå ud af mit lys.',
        '2': 'Mirela Thorne. Jeg finder ting, folk mister. Så finder jeg nye ejere til dem.'
      },
      open: {
        '1': 'Ah, min yndlingshelt. Jeg har gemt de gode sager under klædet til dig.'
      },
      again: {
        '1': 'Tilbage? Husk, hvad jeg bad om. Så kan vi tale forretning.'
      },
      trade: {
        '1': 'Rustninger fra alle vegne. Spørg ikke hvorfra. Det hele er rent nu, det lover jeg.'
      },
      favor: {
        '1': 'God rustning. Til venner. Og venner gør hinanden tjenester.',
        '2': 'Banditter i Oakhavens udkant bliver ved med at røve mine leverancer. Besejr femten, og spørg så nipsdrengen, hvem der sender dem.',
        say: 'Hvad er der under klædet?'
      },
      waiting: {
        '1': 'Femten banditter, så en snak med nipsdrengen. Af sted med dig.',
        say: 'Angående de banditter...'
      },
      favorDone: {
        '1': 'Så det var sladrehanken hele tiden. Ha! Jeg skylder dig en.',
        '2': 'Løft klædet, når du vil. Venner får første valg.',
        say: 'Banditterne er besejret, og jeg ved, hvem der sendte dem.'
      },
      who: {
        '1': 'Jeg voksede op på trapperne ved floden. Alt, hvad der flyder forbi, ender hos mig før eller siden.'
      },
      shopBack: {
        '1': 'Bær den med stil. Og hvis nogen spørger, købte du den i Ironhold.'
      },
      bye: {
        '1': 'Pas på din pung. Ikke alle her er så ærlige som mig.'
      }
    },
    sbMasterWindrunner: {
      hello: {
        '1': 'Åh, hej! Undskyld, jeg kan ikke stoppe. Jeg venter på, at vinden vender. Når som helst.',
        '2': 'Sefa Stormvinge. Jeg skyder med pile og jagter vinden. Vinden vinder som regel.'
      },
      open: {
        '1': 'Dér er min løber! Klar? Selvfølgelig er du det. Kom så, kom så!'
      },
      again: {
        '1': 'Hej igen! Jeg er her stadig. Altså, for det meste. Mine fødder vandrer hele tiden af sted.'
      },
      train: {
        '1': 'Kan du mærke vinden på kinden? Sigt en lille smule til venstre for, hvor du tror. Slip så!'
      },
      favor: {
        '1': 'Kun folk, der kan følge med. Kan du følge med? Lad os finde ud af det.',
        '2': 'Slå otte banditbueskytter i Oakhavens udkant, og bring mig så to kvikbregner.',
        say: 'Underviser du i bueskydning?'
      },
      waiting: {
        '1': 'Otte banditbueskytter, to kvikbregner. Af sted! Jeg er lige her. Og hopper.',
        say: 'Om din prøve...'
      },
      favorDone: {
        '1': 'Ha! Du kunne faktisk følge med! Det kan ingen!',
        '2': 'Godt, så er du min elev nu. Én regel: ingen sidder ned i mine timer.',
        say: 'Bueskytterne er slået, og her er dine kvikbregner.'
      },
      class: {
        '1': 'Skyd, løb, skyd igen. Hvis de fanger dig, stod du stille for længe.',
        '2': 'Smidighed til hurtige fødder og en hurtig bue. Teknik, så hver pil rammer.',
        say: 'Hvad laver en Vindløber?'
      },
      ready: {
        strong: {
          '1': 'Du er lige så hurtig som vinden nu. Næsten, i hvert fald. Tag lige den lektion, du vil!'
        },
        able: {
          '1': 'Lette fødder! Du er klar til den næste. Af sted, af sted!'
        },
        weak: {
          '1': 'Ikke endnu. Du løber, som om du bærer på en sofa. Mere Smidighed, tak.'
        }
      },
      who: {
        '1': 'Jeg bor oppe i den gamle vindmølle ved floden. Byens bedste udsigt til vinden.',
        '2': 'To hundrede trappetrin til toppen. Fin træning. Jeg har talt hvert eneste et.'
      },
      trainBack: {
        '1': 'Godt! Løb så hjem. Ikke gå. Løb tæller som træning.'
      },
      bye: {
        '1': 'Vi ses! Pas på lave grene. Det gør jeg aldrig.'
      }
    },
    sbMasterFrostwarden: {
      hello: {
        '1': 'Hm. Du er gået forbi mig tre gange. Faret vild, eller nysgerrig?',
        '2': 'Halvard Rimhjerte. Jeg kom sydpå fra sneen. Her er varmt. For varmt.'
      },
      open: {
        '1': 'Elev. Godt. Isen er klar, og det er jeg også.'
      },
      again: {
        '1': 'Dig igen. Godt. Jeg taler ikke meget. Bliv alligevel.'
      },
      train: {
        '1': 'Pust langsomt ud. Ser du dampen? Læg den nu ind i klingen.'
      },
      favor: {
        '1': 'Ja. Jeg lærer det kun til dem, der holder hovedet koldt på et varmt sted.',
        '2': 'Sluk syv ildelementarer i Askeklipperne. Bring mig så to kviste frostmynte.',
        say: 'Er det sværd lavet af is?'
      },
      waiting: {
        '1': 'Syv ildelementarer. To kviste frostmynte. Tag dig god tid. Ikke for god tid.',
        say: 'Om din prøve...'
      },
      favorDone: {
        '1': 'Hm. Ikke engang svedet. Godt.',
        '2': 'Du holdt hovedet koldt. Det var den første lektion. Resten lærer jeg dig.',
        say: 'Ildelementarerne er slukket. Her er din frostmynte.'
      },
      class: {
        '1': 'En ridder af kulden. Køl dem ned, frys dem, og knus så isen.',
        '2': 'Styrke til klingen. Intelligens til frosten. Du skal bruge begge.',
        say: 'Hvad er en Frostvogter?'
      },
      ready: {
        strong: {
          '1': 'Du er lige så kold som Norden nu. Tag hvilken som helst lektion.'
        },
        able: {
          '1': 'Godt. Roligt. Den næste lektion er din.'
        },
        weak: {
          '1': 'Ikke endnu. Din frost smelter for hurtigt. Mere Intelligens og mere Styrke.'
        }
      },
      who: {
        '1': 'Jeg vogtede et bjergpas i Norden. Så ville jeg se en flod, der ikke fryser til.'
      },
      trainBack: {
        '1': 'Godt. Hvil dig nu. Is har ikke travlt. Det skal du heller ikke have.'
      },
      bye: {
        '1': 'Gå i fred. Hold hovedet koldt.'
      }
    },
    sbMasterLightbringer: {
      hello: {
        '1': 'Mm-hm-hmm... Åh! Undskyld, min ven, jeg nynnede. Nynnede jeg ad dig? Det gør jeg tit.',
        '2': 'Søster Auriel Morgensø. Jeg holder den lille lampe for enden af broen tændt.'
      },
      open: {
        '1': 'Dér er min lyse sjæl! Kom og stå i lyset et øjeblik. Det har du fortjent.'
      },
      again: {
        '1': 'Hej igen! Stadig her, nynner stadig. Lampen kan lide selskabet.'
      },
      train: {
        '1': 'Åbne hænder, hagen op. Tænk på den bedste morgen, du nogensinde har haft. Sådan. Kan du mærke det?'
      },
      favor: {
        '1': 'Alle har et lille lys indeni. Jeg lærer folk at lukke det ud, når de er klar.',
        '2': 'Slå syv kultister i Askeklipperne, og bring mig så tre solblade til min lampe.',
        say: 'Er den lampe magisk?'
      },
      waiting: {
        '1': 'Syv kultister, tre solblade. Slå dem blidt. Alle fortjener en chance til.',
        say: 'Om din prøve...'
      },
      favorDone: {
        '1': 'Åh, se dem lige! Lampen vil gløde gyldent en hel måned.',
        '2': 'Og det vil du også, min ven. Jeg underviser dig gerne.',
        say: 'Kultisterne er slået. Her er dine solblade.'
      },
      class: {
        '1': 'Vi bærer daggryet. Lys at kæmpe med, lys at hele med, lys at gemme sig bag.',
        '2': 'Intelligens gør lyset stærkt. Karisma gør det varmt. Du får brug for begge.',
        say: 'Hvad laver en Lysbringer?'
      },
      ready: {
        strong: {
          '1': 'Du skinner som en solopgang, min ven. Tag lige den lektion, du vil.'
        },
        able: {
          '1': 'Du gløder fint! Du er klar til den næste.'
        },
        weak: {
          '1': 'Ikke endnu, min ven. Dit lys er lidt svagt. Mere Karisma, så gløder du.'
        }
      },
      who: {
        '1': 'Jeg sang engang i et stort tempel. Men min lampe herude leder bådene hjem. Det er bedre.'
      },
      trainBack: {
        '1': 'Dejligt. Gå nu ud og lys nogens dag op. Det er Søsters ordre.'
      },
      bye: {
        '1': 'Af sted med dig, min ven. Og smil til de mørke hjørner. Det hader de.'
      }
    },
    sbMasterBeastcaller: {
      hello: {
        '1': 'Pas på fødderne. Det er Brombær. Hun var her først.',
        '2': 'Rowan Tidselfod. Jeg kan lide dyr. Mennesker har jeg ikke besluttet mig om endnu.'
      },
      open: {
        '1': 'Nå, det er dig. Brombær har ventet. Det har jeg også. Lidt.'
      },
      again: {
        '1': 'Dig igen. Brombær kan lide dig. Jeg tænker stadig over det.'
      },
      train: {
        '1': 'Gå ned i knæ. Langsommere. Ræk hånden frem, og lad dem komme til dig. Godt.'
      },
      favor: {
        '1': 'Tale? Jeg lytter. Det er det trick, de fleste aldrig lærer.',
        '2': 'Kæmpeedderkopper spinder dyrenes stier til i Den Hviskende Skov. Ryd otte.',
        '3': 'Bring mig så to måneklokker til min hule. Brombær sover bedre tæt på dem.',
        say: 'Kan du tale med dyr?'
      },
      waiting: {
        '1': 'Otte edderkopper, to måneklokker. Dyrene venter. Det gør Brombær også.',
        say: 'Om din prøve...'
      },
      favorDone: {
        '1': 'Hm. Hjortene kom ned til floden i morges. Tænkte nok, det var dig.',
        '2': 'Fint. Jeg underviser dig. Lav ikke noget postyr. Brombær, hold op med at logre.',
        say: 'Stierne er ryddet, og her er dine måneklokker.'
      },
      class: {
        '1': 'Du kalder på det vilde, og det vilde kommer. Ulve, en høg, en bjørn. Venner, ikke kæledyr.',
        '2': 'Karisma, så de har lyst til at komme. Udholdenhed, så du kan følge med dem.',
        say: 'Hvad er en Dyrekalder?'
      },
      ready: {
        strong: {
          '1': 'Hele flokken stoler på dig nu. Tag, hvad du vil.'
        },
        able: {
          '1': 'Ulvene kan lide dig. Du er klar til den næste.'
        },
        weak: {
          '1': 'Ikke endnu. De stoler ikke på dig. Mere Karisma og meget mere tålmodighed.'
        }
      },
      who: {
        '1': 'Fandt Brombær i en fælde for mange år siden. Tre ben og masser af attitude. Vi har været et par lige siden.',
        '2': 'Jeg sover på høloftet i stalden. Heste snorker mindre end mennesker.'
      },
      trainBack: {
        '1': 'Godt. Af sted så. Og sig hej til kragerne. De husker.'
      },
      bye: {
        '1': 'Af sted med dig. Brombær siger farvel.'
      }
    },
    sbMasterElementalist: {
      hello: {
        '1': 'Hej! Et øjeblik, jeg jonglerer. Ild, frost, gnist, sten og... grebet! Hej!',
        '2': 'Magistra Iris Firvinde. Jeg underviser i alle fire elementer. Det sjove er at blande dem.'
      },
      again: {
        '1': 'Tilbage igen! Godt, jeg manglede nogen til at se på. Se her. Ta-da!'
      },
      train: {
        '1': 'Vælg to kugler. Hvilke som helst to. Lad dem så støde sammen. Blidt! Ser du? En reaktion!'
      },
      class: {
        '1': 'Vi blander! Frost og så ild, så smelter det. Ild og så lyn, bum. Hvert par gør noget.',
        '2': 'Intelligens til hver trylleformular. Teknik, fordi de gode kræver hurtige hænder.',
        say: 'Hvad laver en Elementmager?'
      },
      ready: {
        strong: {
          '1': 'Du blander som en mester nu! Tag hvilken som helst lektion. Tag to!'
        },
        able: {
          '1': 'Uh, flot gnist! Du er klar til den næste.'
        },
        weak: {
          '1': 'Ikke endnu! Dine elementer fiser hele tiden ud. Mere Intelligens, tak.'
        }
      },
      sleeve: {
        '1': 'Åh! Det gør det sørme. Vent lige... Sådan.',
        '2': 'Ild, så frost. Det var faktisk en lektion. Det var så lidt!',
        say: 'Øh, dit ærme brænder.'
      },
      trainBack: {
        '1': 'Strålende! Øv dig nu udenfor, tak. Gardinerne er nye.'
      },
      bye: {
        '1': 'Farvel! Hvis du lugter røg, er det nok mig. Bare rolig!'
      }
    },
    sbMasterSoulwarden: {
      hello: {
        '1': 'Shh, det er i orden, de er venlige. Åh, ikke dig. Jeg talte med lygtemændene.',
        '2': 'Vogter Odalys Lygtelys. Jeg hjælper fortabte ånder med at finde hjem.'
      },
      again: {
        '1': 'Hej igen. Lygtemændene kan huske dig. Den der vinker.'
      },
      train: {
        '1': 'Hold lygten lavt, og tal blidt. Det, der er faret vild, kommer til en venlig stemme.'
      },
      class: {
        '1': 'Når en fjende er slået, farer dens ånd lidt vild. Vi hjælper den, og den hjælper os igen.',
        '2': 'Intelligens til at lede lyset. Karisma, så ånderne har lyst til at blive lidt.',
        say: 'Hvad laver en Sjælevogter?'
      },
      ready: {
        strong: {
          '1': 'Selv de mest sky ånder kommer til dig nu. Tag hvilken som helst lektion.'
        },
        able: {
          '1': 'Lygtemændene stoler på dig. Du er klar til den næste lektion.'
        },
        weak: {
          '1': 'Ikke endnu. De er stadig sky over for dig. Mere Intelligens og lidt Karisma.'
        }
      },
      wisps: {
        '1': 'Lidt! De er ånder, der er vandret væk. Den her er Uro. Han kan lide den varme side.',
        '2': 'Ingen ånd er nogensinde ond, ved du. Kun fortabt. De tager hjem, når de er klar.',
        say: 'Er de små lys i din lygte levende?'
      },
      trainBack: {
        '1': 'Godt gået. Slip dem nu blidt. De har haft en lang dag.'
      },
      bye: {
        '1': 'Pas på dig selv. Og hvis du ser et lille fortabt lys, så sig hej.'
      }
    },
    sbMasterIronmonk: {
      hello: {
        '1': 'Sæt dig. Træk vejret. Nej, du ånder, som om du er forsinket til noget. Igen.',
        '2': 'Mester Oru Stillevand. Jeg lærer den åbne hånd. Næver af jern, et roligt hjerte.'
      },
      again: {
        '1': 'Ah. Eleven vender tilbage. Det gør floden også. Hver dag.'
      },
      train: {
        '1': 'Fødder som rødder, hænder som regn. Slå. Igen. Det hundrede slag er det, der tæller.'
      },
      class: {
        '1': 'Ingen klinge. Hænder, fødder, åndedræt. Hvert slag bygger det næste op, indtil det store kommer.',
        '2': 'Smidighed til hurtige hænder. Udholdenhed til at holde roen, mens andre løber tør for luft.',
        say: 'Hvad er en Jernmunk?'
      },
      ready: {
        strong: {
          '1': 'Eleven bliver lærer. Sig det ikke til nogen. Tag hvilken som helst lektion.'
        },
        able: {
          '1': 'Godt. Koppen bliver fyldt. Tag den næste lektion.'
        },
        weak: {
          '1': 'Ikke endnu. Et træ med korte rødder vælter i vinden. Mere Udholdenhed.'
        }
      },
      noodles: {
        '1': 'Det er det. Bouillonen har simret i to dage. Lad venligst være med at ånde på den.',
        '2': 'En god skål lærer en tålmodighed. En fantastisk skål lærer en alt det andet.',
        say: 'Er det en skål nudler?'
      },
      trainBack: {
        '1': 'Godt. Spis nu noget varmt. Styrke kommer fra skålen.'
      },
      bye: {
        '1': 'Gå i fred. Gå blødt. Spark hårdt.'
      }
    },
    sbMasterBard: {
      hello: {
        '1': 'Velkommen, velkommen! Kom ind fra sne og is, her ved ilden er det varmt på alle vis! Åh nej, det rimede. Det gør det tit.',
        '2': 'Lark Godvejr. Jeg spiller ved bålet og lærer alle, der gider lytte, at spille lut.'
      },
      again: {
        '1': 'Min yndlingstilhører! Find en skammel. Pas på katten, hun er anmelderen.'
      },
      train: {
        '1': 'Spil med. En, to og tre... Kig ikke på fingrene. Mærk det!'
      },
      class: {
        '1': 'Sange, der gør dit hold modigere, og melodier, der får de andre til at falde i søvn.',
        '2': 'Karisma til at vinde publikum. Teknik, så fingrene kan følge med hjertet.',
        say: 'Hvad laver en Bard?'
      },
      ready: {
        strong: {
          '1': 'Du kunne fylde enhver kro nu! Tag alle de sange, jeg har.'
        },
        able: {
          '1': 'Dejlig melodi! Du er klar til det næste vers.'
        },
        weak: {
          '1': 'Ikke endnu. Publikum gaber stadig. Mere Karisma, min ven.'
        }
      },
      story: {
        '1': 'Engang krydsede en ridder netop denne bro med intet andet end et sværd og en sang...',
        '2': 'Vent, den er bedre med musik. La-la-la, ridderen gik... Hvor var jeg?',
        '3': 'Åh, pyt med det. Fin sang, ikke?',
        say: 'Vil du fortælle mig en historie?'
      },
      trainBack: {
        '1': 'Bravo! Øv dig hver dag. Også når det lyder forfærdeligt. Især da.'
      },
      bye: {
        '1': 'Farvel, og far nu vel! Ups. Rimede igen. Hej hej!'
      }
    }
  },
  invasion: {
    pylonsDown: 'Den sidste pylon falder, og dens skat vælter ud!',
    reborn: {
      tusker: 'Tusker Genfødt',
      emberLord: 'Den infernalske Glødefyrste',
      frostJarl: 'Den genfødte Frostjarl',
      voidDragon: 'Den genfødte Tomhedsdrage'
    }
  },
  enemy: {
    sphinx: "Sfinksen",
    leviathan: "Leviathan",
    hydra: "Hydraen",
    elderDragon: "Urdragen",
    trainingDummy: 'Træningsdukke',
    goblin: 'Goblin',
    goblinSlinger: 'Goblinslynger',
    bandit: 'Bandit',
    banditArcher: 'Banditbueskytte',
    wolf: 'Ulv',
    banditChief: 'Bandithøvding',
    gnome: 'Nisse',
    goblinKing: 'Goblinkongen',
    treant: 'Trævæsen',
    spider: 'Kæmpeedderkop',
    broodSpider: 'Edderkoppeunge',
    outlawCaptain: 'De fredløses kaptajn',
    elderTreant: 'Ældgammelt trævæsen',
    warlord: 'Krigsherren Krag',
    fireElemental: 'Ildelementar',
    ironGolem: 'Jerngolem',
    cultist: 'Kultist',
    emberLord: 'Glødefyrsten',
    ironColossus: 'Jernkolossen',
    frostGiant: 'Frostkæmpe',
    naga: 'Naga',
    skeleton: 'Skelet',
    necromancer: 'Nekromantiker',
    chimera: "Kimæren",
    chimeraTail: "Slangehalen",
    centaurWarchief: "Kentaurhøvdingen",
    cyclops: "Kyklopen",
    frostJarl: 'Frostjarlen',
    nagaOracle: 'Det druknede orakel',
    voidStalker: 'Tomhedssniger',
    wyvern: 'Wyvern',
    highDemon: 'Højdæmon',
    voidWarden: 'Tomhedsvogteren',
    voidDragon: 'Tomhedsdragen',
    doomKnight: 'Dommedagsridder',
    imp: 'Smådjævel',
    archDemon: 'Ærkedæmonen',
    voidling: 'Tomhedsyngel',
    voidLord: 'Tomhedsfyrsten',
    demonPylon: 'Dæmonpylon',
    orderGuard: 'Ordenens inkvisitor',
    syndicateBlade: 'Syndikatklinge',
    goblinWarchief: 'Goblinkrigshøvding',
    thornfather: 'Tornefaderen',
    broodMother: 'Yngelmoderen',
    banditBaron: 'Røverbaronen',
    cinderGolem: 'Glødgolem',
    frostHowler: 'Frosthyler',
    tideSerpent: 'Tidevandsslange',
    riftKnight: 'Riftridder',
    wyvernMatriarch: 'Wyvernmatriark',
    tusker: 'Tusker, krigsornen',
    tuskerCameo: 'Tusker',
    goblinTyrant: 'Goblintyran',
    voidDrake: 'Tomhedslindorm',
    pitLord: 'Afgrundsfyrste',
    frostThane: 'Frosthøvding',
    hellhound: 'Helvedeshund',
    frostHellhound: 'Frosthelvedeshund',
    gargoyle: 'Gargoil',
    harpy: 'Harpy',
    corruptedTreant: 'Fordærvet træent',
    centaurRaider: 'Kentaur-plyndrer',
    cyclopsBrute: 'Kyklopkæmpe',
    demonMiner: 'Dæmonminearbejder',
    sphinxAcolyte: 'Sfinksens akolyt',
    seaDemon: 'Havdæmon',
    drakeHatchling: 'Drageunge',
    hydraSpawn: 'Hydraafkom'
  },
  results: {
    careful: 'Forsigtig sejr ×{mult}',
    victory: 'Sejr!',
    defeat: 'Besejret',
    retreat: 'Tilbagetog',
    firstClear: 'Første sejr!',
    waves: 'Overlevede bølger: {n}',
    levelUp: 'Niveau {n}!',
    points: '+{n} attributpoint',
    xp: 'Erfaring',
    gold: 'Guld',
    lost: 'Tabt',
    kills: 'Besejret',
    chests: 'Kister',
    bosses: 'Bosser',
    mastery: 'Områdemestring',
    masteryPct: '{n} %',
    newBest: 'Ny rekord!',
    time: 'Tid',
    unlocked: 'Nyt på kortet: {places}',
    equipped: 'Udstyret',
    better: 'Bedre end det, du bærer',
    retry: 'Prøv igen',
    tip: 'Du beholder erfaringen og byttet. Fordel dine point, besøg en læremester, og kom stærkere tilbage.'
  },
  pause: {
    title: 'Pause',
    resume: 'Fortsæt',
    controls: 'Styring',
    retreat: 'Træk dig tilbage til kortet',
    retreatNote: 'Du beholder alt, du har tjent indtil nu, men området er ikke ryddet.'
  },
  ending: {
    more: 'Ærkedæmonen er faldet, men riget er endnu ikke sikkert. Én stor trussel er tilbage for verden, og den venter inde i Tomhedskløften.',
    order: {
      title: 'Jernfreden',
      text: 'Jernordenens bannere vajer over Rædselsfæstningen. Vejene er sikre, lovene mange, og dit navn er hugget ind over porten.'
    },
    syndicate: {
      title: 'Askehandlen',
      text: 'Syndikatet hersker fra fæstningens skygger. Intet i riget er forbudt længere. Det er bare dyrt.'
    },
    circle: {
      title: 'Æteralderen',
      text: 'Cirklen oplyser fæstningen med indfanget tomhedsild. Vidundere strømmer ud af dens porte, og ingen spørger, hvad de koster.'
    },
    free: {
      title: 'Ingen konger',
      text: 'Tronen ligger i stykker, og fæstningen står tom. For første gang i en tidsalder tilhører riget de mennesker, der bor i det.'
    },
    unbound: {
      title: 'Den ubundne',
      text: 'Du tog tronen. Ordenen, Syndikatet og Cirklen drager imod dig sammen. Lad dem komme.'
    },
    note: {
      goblinPact: 'Goblinhandlere prutter stadig på Sunfords torv.',
      goblinSlain: 'Hulerne står tomme, og karavanerne kører til tiden.',
      goblinRansom: 'Goblinkongen er rig igen og plyndrer igen.',
      oakhavenSaved: 'Oakhavens mure er højere nu, og dens markeder fyldigere.',
      oakhavenFallen: 'Ukrudt vokser op gennem Oakhavens gader. Det sorte marked trives.',
      coreOrder: 'Ironholds miner er stille, og dværgene graver igen.',
      coreCircle: 'Ironholds smedjer gløder blåt, og dens geværer er rigets bedste.',
      coreSold: 'Et sted summer kernen stadig. Golemerne går stadig.',
      oracleFreed: 'På stille dage ser fiskere oraklet langt ude på vandet.',
      oracleSlain: 'Det Sunkne Tempel er tavst. Ingen ved længere, hvad der kommer.',
      dragonPact: 'En drage har rede på fæstningens tag og lystrer kun ét navn.',
      dragonSlain: 'Et dragekranium hænger i Ordenens store hal.'
    }
  },
  options: {
    saves: {
      save: 'Gem',
      load: 'Indlæs',
      newGame: 'Start nyt spil',
      newGameWarn: 'Dit nuværende spil erstattes af et nyt. Gem det i en plads først, hvis du vil beholde det.',
      confirm: 'Sikker? Tryk igen',
      slot: 'Plads {n}',
      empty: 'Tom',
      level: 'Niveau {n}',
      levelAt: '{level} · {place}',
      overwriteAsk: 'Overskriv',
      saved: 'Gemt!',
      loadWarn: 'Indlæsning erstatter dit nuværende spil. Gem det i en plads først, hvis du vil beholde det.',
      saveHint: 'Dit spil gemmer sig selv, mens du spiller. Gem en kopi her for at vende tilbage til den senere, for eksempel for at prøve et andet build.',
      loadHint: 'Indlæs en gemt kopi. Spillet starter forfra fra den.'
    },
    gameplay: 'Spil',
    title: 'Indstillinger',
    general: 'Generelt',
    audio: 'Lyd',
    language: 'Sprog',
    difficulty: 'Sværhedsgrad',
    soundEffects: 'Lydeffekter',
    music: 'Musik',
    mute: 'Lydløs',
    musicTrack: 'Musikstil',
    musicTracks: {
      cozy: 'Rolig',
      trance: 'Eventyr'
    },
    haptics: 'Vibration',
    on: 'Til',
    off: 'Fra',
    close: 'Luk',
    keyboard: {
      auto: 'Find tastaturlayout',
      layout: 'Tastaturlayout',
      detected: 'Fundet: {layout}',
      bindings: 'Tastevalg',
      press: 'Tryk på en tast… (Esc annullerer)',
      reset: 'Nulstil taster'
    },
    actions: {
      up: 'Gå op',
      down: 'Gå ned',
      left: 'Gå til venstre',
      right: 'Gå til højre',
      skill1: 'Evne 1',
      skill2: 'Evne 2',
      skill3: 'Evne 3',
      skill4: 'Evne 4',
      skill5: 'Evne 5',
      skill6: 'Evne 6',
      potion: 'Drik eliksir',
      manaPotion: 'Drik manaeliksir',
      leave: 'Forlad et vundet område',
      interact: 'Tal',
      target: 'Næste mål',
      map: 'Verdenskort',
      character: 'Helt',
      inventory: 'Taske',
      skills: 'Evner',
      roll: 'Undvigerulle',
      elixir: 'Drik eliksir',
      elixirNext: 'Næste eliksir',
      skill7: 'Evne 7',
      skill8: 'Evne 8'
    },
    difficulties: {
      easy: 'Let',
      medium: 'Mellem',
      hard: 'Svær'
    },
    difficultyHints: {
      easy: 'Fjender slår blødere og falder hurtigere.',
      medium: 'Udfordringen, som den er tænkt.',
      hard: 'Sejere fjender, der slår hårdere.'
    }
  },
  adsBlocked: {
    title: 'Kunne ikke vise reklame',
    body: 'Vi prøvede at vise dig en video, men noget i din browser blokerer reklamer.',
    allowPrefix: 'Tillad reklamer på',
    allowSuffix: '(eller sæt din adblocker på pause for dette spil) og prøv igen.',
    gotIt: 'Forstået'
  },
  forcedDark: {
    title: 'Slå mørk tilstand fra for dette spil',
    body: 'Din browser eller en udvidelse farver denne side om. Spillet har sine egne farver og virker ikke med tvungen mørk tilstand.',
    waiting: 'Spillet fortsætter af sig selv, så snart den er slået fra.',
    continueAnyway: 'Fortsæt på eget ansvar',
    hint: {
      darkReader: 'Dark Reader: klik på ikonet og slå den fra for dette websted.',
      extension: 'Åbn din udvidelse til mørk tilstand og slå den fra for dette websted.',
      chromiumFlag: 'Åbn {flagUrl} og sæt «Auto Dark Mode for Web Contents» til Default, eller slå «mørkt tema for websteder» fra i browserens temaindstillinger.',
      samsung: 'Samsung Internet: åbn menuen og slå mørk tilstand fra, eller slå Labs → «Use website dark theme» til.',
      forcedColors: 'Windows: slå kontrasttemaer fra under Indstillinger → Tilgængelighed → Kontrasttemaer.',
      firefoxColors: 'Firefox: Indstillinger → Farver → sæt «Tilsidesæt farverne angivet af siden» til Aldrig.'
    }
  },
  privacy: {
    policy: 'Privatlivspolitik',
    settings: 'Privatlivsindstillinger'
  },
  samsungFix: {
    title: 'Hurtig farvetest',
    body: 'Nogle telefoner ændrer farverne på websider. Sammenlign de to firkanter nedenfor.',
    question: 'Ser begge firkanter ens ud?',
    refSquare: 'Referencefirkant',
    pageSquare: 'Sidens firkant',
    yes: 'Ja, de ser ens ud',
    no: 'Nej, de ser forskellige ud',
    option: 'Ret farver (Samsungs mørke tilstand)',
    optionHint: 'Slå til, hvis menuerne ser mørke ud, eller teksten er svær at læse.',
    recheck: 'Kør farvetesten igen'
  },
  saveStatus: {
    restoredTitle: 'Skygemning gendannet',
    restoredBody: '+{n} bonusguld for gendannelsen',
    tap: 'tryk',
    pausedTitle: 'Skysynk sat på pause',
    pausedBody: 'Spiller offline. Dine fremskridt gemmes her.',
    retry: 'Prøv igen',
    dismiss: 'luk'
  },
  loading: {
    tooLong: 'Tager indlæsningen for lang tid? Prøv at slå din adblocker fra, og genindlæs.'
  },
  license: {
    denied: 'Adgang nægtet: køb en licens.'
  },
  leaderboard: {
    title: 'Rangliste',
    rank: '#',
    player: 'Spiller',
    score: 'Erfaring',
    flair: 'Niveau',
    empty: 'Ingen er på listen endnu. Bliv den første!',
    failed: 'Kunne ikke nå ranglisten.',
    loading: 'Indlæser…',
    you: 'Du',
    yourRank: 'Du er #{n} af {total}',
    of: 'af {n} spillere',
    tabGlobal: 'Verden'
  },
  iap: {
    title: 'Fuld version',
    body: 'Du besejrede Goblinkongen og gennemførte den gratis demo. Lås den fulde version op én gang for at rejse videre: nye lande, bosser og quests. Ét køb, intet abonnement.',
    unlock: 'Lås den fulde version op for {price}',
    unlockNoPrice: 'Lås den fulde version op',
    noAds: 'Den fulde version fjerner også alle reklamer.',
    restore: 'Gendan køb',
    notNow: 'Ikke nu',
    pending: 'Afventer godkendelse. Den fulde version låses op, så snart købet er godkendt.',
    failed: 'Købet gik ikke igennem. Prøv igen.',
    restoreNone: 'Der blev ikke fundet noget tidligere køb for denne Apple-konto.',
    thanks: 'Tak! Den fulde version er låst op.',
    locked: 'Del af den fulde version',
    working: 'Kontakter App Store ...'
  },
  wind: {
    title: 'Anden luft',
    text: 'Du faldt. Rejs dig med {n}% af dit helbred og afslut kampen?',
    once: 'Én gang pr. besøg.',
    watch: 'Se en video',
    take: 'Rejs dig igen',
    decline: 'Nej tak'
  },
  purse: {
    offer: 'Tredobl pungen: +{n}'
  },
  shelf: {
    title: 'Sjældne varer',
    restock: 'Nye varer',
    tomorrow: 'Nye varer i morgen'
  },
  rested: {
    hud: '2× XP',
    banner: 'Velkommen tilbage! Du er udhvilet: {time} dobbelt XP i dine næste kampe.',
    hm: '{h} t {m} min',
    m: '{m} min',
    h: '{h} t'
  },
  preset: {
    title: 'Opsætninger',
    name: 'Opsætning {n}',
    rename: 'Navn på opsætning {n}',
    save: 'Gem',
    load: 'Brug',
    saved: '{name} er gemt.',
    loaded: '{name} er valgt.',
    skipped: 'Udeladt: {list}'
  },
  respec: {
    title: 'Glem din træning',
    note: 'Få alle {n} attributpoint, du har brugt, tilbage, og brug dem igen.',
    none: 'Du har endnu ingen point at få tilbage.',
    free: 'Glem (gratis)',
    buy: 'Glem ({n} guld)',
    confirm: 'Sikker? Tryk igen',
    bench: 'Disse evner går tilbage på hylden: {list}',
    done: 'Sådan. Dine point er dine at bruge igen.'
  },
  contract: {
    title: 'Opgavetavle',
    lead: 'Hver fraktion slår én opgave op om dagen. De tæller, mens du spiller; aflever dem i en hvilken som helst by.',
    slay: 'Besejr: {enemy} — {place}',
    clear: 'Vind et besøg i {place}',
    chests: 'Åbn kister overalt',
    rep: '+1 anseelse',
    handIn: 'Aflever',
    handed: 'Klaret for i dag',
    thanks: '{name} takker dig.'
  },
  rep: {
    title: 'Anseelse',
    meter: '{name}: anseelse {n}',
    giftAt: 'Gave ved +{n}',
    giftClaim: 'Hent gave',
    giftTaken: 'Gave hentet',
    giftGot: 'En gave til dig: 300 guld og {item}.',
    giftGold: 'En gave til dig: 300 guld.',
    blessAt: 'Velsignelse ved +{n}',
    bless: {
      order: 'Velsignet: +5 % liv',
      syndicate: 'Velsignet: +10 % guld fra drab',
      circle: 'Velsignet: +10 % manaregeneration'
    }
  },
  ladder: {
    tab: 'Colosseum',
    wave: 'Bølge',
    week: 'Denne uge: {mod}',
    weekBest: 'Bedst denne uge: bølge {n}',
    yourBest: 'Din bedste denne uge: bølge {n}',
    none: 'Ingen opstigning denne uge endnu.',
    mod: {
      fire: 'Alt ild',
      nopotions: 'Ingen eliksirer',
      glass: 'Glas',
      swarm: 'Sværm',
      elites: 'Elitemarch',
      haste: 'Hast'
    },
    modDesc: {
      fire: 'hvert fjendeslag er ild',
      nopotions: 'ingen eliksirer',
      glass: 'alle slår 50 % hårdere',
      swarm: 'flere fjender, med mindre liv hver',
      elites: 'en mester i hver bølge',
      haste: 'fjender bevæger sig og slår hurtigere'
    }
  },
  forge: {
    upgrade: 'Opgrader ({n} guld)',
    next: 'Næste +{level}: +{pct}% stats',
    town: 'Smeden i enhver by kan opgradere den.'
  },
  ore: {
    'demonglass': { 'name': "Dæmonglas" },
    'ichor': { 'name': "Mytisk ichor" },
    iron: {
      name: 'Jernmalm'
    },
    silver: {
      name: 'Sølvmalm'
    },
    gold: {
      name: 'Guldmalm'
    },
    mithril: {
      name: 'Mithrilmalm'
    },
    adamant: {
      name: 'Adamantmalm'
    },
    aetherite: {
      name: 'Aetheritmalm'
    }
  },
  plant: {
    sunpetal: {
      name: 'Solblad',
      desc: 'En klargul blomst. Helbredere sværger til den.'
    },
    glowcap: {
      name: 'Lyshat',
      desc: 'En svamp, der lyser i mørket. God for sindet.'
    },
    swiftfern: {
      name: 'Kvikbregne',
      desc: 'En let bregne. Gnid den på støvlerne og løb.'
    },
    ironmoss: {
      name: 'Jernmos',
      desc: 'Sej mos fra stenene. Gør huden hård.'
    },
    emberbloom: {
      name: 'Glødblomst',
      desc: 'En blomst, der føles varm i hånden.'
    },
    frostmint: {
      name: 'Frostmynte',
      desc: 'Kolde, friske blade. De klarer hovedet.'
    },
    moonbell: {
      name: 'Måneklokke',
      desc: 'En sjælden, bleg blomst, der skærper blikket.'
    },
    shadowthorn: {
      name: 'Skyggetorn',
      desc: 'En sjælden mørk torn. Stærk, og lidt ond.'
    }
  },
  journal: {
    errands: 'Ærinder',
    empty: 'Intet i din dagbog endnu. Folk i byen vil bede dig om hjælp.',
    from: 'For {npc}',
    ready: 'Færdig! Gå tilbage til {npc}.',
    taken: 'Nyt ærinde: {title}',
    done: 'Ærinde klaret: {title}',
    step: {
      slay: 'Besejr {n} × {enemy}',
      slayAt: 'Besejr {n} × {enemy} i {place}',
      slayAnyAt: 'Besejr {n} fjender i {place}',
      clear: 'Ryd {place}',
      visit: 'Gå til {place}',
      gather: 'Saml {n} × {plant}',
      bring: 'Tag {item} med',
      pieces: 'Find {n} stykker af skattekortet',
      dig: 'Grav efter skatten i {place}',
      talk: 'Tal med {npc}'
    }
  },
  board: {
    title: 'Opslagstavlen i {town}',
    read: 'Læs',
    lead: 'Dagens opgaver. Aflever dem her, når de er klaret.',
    kind: {
      slay: 'Jagt',
      gather: 'Urter',
      escort: 'Karavane'
    },
    slay: 'Besejr {n} × {enemy} i {place}',
    gather: 'Bring {n} × {plant}',
    escort: 'Bevogt karavanen på vejen til Oakhaven',
    xp: '+{n} XP',
    setOut: 'Tag af sted',
    thanks: 'Færdig! Byen takker dig.'
  },
  escort: {
    start: 'Bevogt karavanen til vejens ende!',
    waiting: 'Karavanen venter på dig.',
    arrived: 'Karavanen nåede frem!',
    lost: 'Karavanen gik tabt…'
  },
  elixir: {
    might: {
      name: 'Styrkeeliksir',
      desc: '+{n}% skade i 5 minutter'
    },
    iron: {
      name: 'Jernhudsdrik',
      desc: '+{n}% rustning i 5 minutter'
    },
    swift: {
      name: 'Hurtighedstonic',
      desc: '+{n}% fart og angrebsfart i 5 minutter'
    },
    mind: {
      name: 'Klarsindsbryg',
      desc: 'Evner kommer {n}% hurtigere tilbage i 5 minutter'
    },
    vigor: {
      name: 'Livskraftseliksir',
      desc: 'Heler {n}% af dit liv hvert sekund i 5 minutter'
    },
    shadow: {
      name: 'Tørstende drik',
      desc: 'Dine slag heler dig for {n}% af deres skade i 5 minutter'
    }
  },
  alchemy: {
    talk: 'Urter ind, eliksirer ud. Hvilken skal vi brygge?',
    lead: 'Hver eliksir virker i 5 minutter i en kamp. Drik den fra din tredje flaske. Du kan bære {n} af hver.',
    brew: 'Bryg · {n}',
    carry: 'Bær denne',
    carried: 'I din flaske',
    count: '{n} / {max}',
    herb: '{plant}: {have} af {n}',
    done: 'Brygget!',
    why: {
      full: 'Du bærer allerede så mange af denne, som du kan.',
      herbs: 'Ikke nok urter. Pluk flere ude i naturen.',
      gold: 'Ikke nok guld.'
    }
  },
  memory: {
    title: 'Hukommelsesboden',
    lead: 'Find alle par, før sandet løber ud, og vind din indsats dobbelt. Fem sejre i træk giver en legendarisk præmie.',
    bet: 'Sats {n}',
    row: 'Sejre i træk: {n} af {max}',
    pairs: '{n} par · {s} sekunder',
    won: 'Alle par fundet! Du vinder {n} guld.',
    lost: 'Sandet løb ud. Indsatsen er væk.',
    again: 'Spil igen',
    noGold: 'Ikke nok guld til den indsats.',
    card: 'Kort {n}'
  },
  cups: {
    title: 'Bægerboden',
    lead: 'Se på stenen, følg dens bæger og peg så på det. Hver sejr i træk giver mere. Den tredje giver en præmiegenstand, den femte en skat.',
    free: 'Gratis runde',
    fee: 'Spil · {n}',
    row: 'Sejre i træk: {n} af {max}',
    next: 'Næste sejr: {n} guld',
    watch: 'Se på stenen!',
    follow: 'Følg den…',
    pick: 'Vælg et bæger!',
    hint: 'Tryk på et bæger, eller tryk på dets nummer.',
    won: 'Fundet! +{n} guld',
    lost: 'Ikke det. Rækken starter forfra.',
    near: 'Så tæt på! Den lå lige ved siden af.',
    timeout: 'For langsomt! Rækken starter forfra.',
    again: 'Spil igen',
    noGold: 'Ikke nok guld. I morgen er din første runde gratis.',
    cup: 'Bæger {n}'
  },
  battle: {
    title: 'Tingduel',
    lead: 'Læg en ting mod gamblerens: den højeste salgspris tager pointet, to point vinder. Dine ting er væk uanset hvad. Tre sejre i træk giver en præmiegenstand.',
    fee: 'Sæt dig · {n}',
    row: 'Sejre i træk: {n} af {max}',
    needItems: 'Du skal have mindst {n} ting i tasken, som du ikke har på.',
    noGold: 'Ikke nok guld til gebyret.',
    theirs: 'Gambleren lægger',
    pick: 'Vælg en ting at lægge',
    lay: 'Læg den',
    value: '{n} guld',
    score: 'Du {a} · {b} Gambler',
    roundWon: 'Din er mere værd. Point til dig!',
    roundLost: 'Gamblerens er mere værd. Point til gambleren.',
    won: 'Du vinder spillet! +{n} XP',
    lost: 'Gambleren vinder spillet.',
    again: 'Spil igen'
  },
  gamble: {
    prize: 'Præmie: {item}!',
    prizeGold: 'Du har dem alle, så du får {n} guld i stedet!'
  },
  errand: {
    farmersFavor: {
      title: 'Familien Tollers ulve'
    },
    herbalistFavor: {
      title: 'Briars solblade'
    },
    collectorFavor: {
      title: 'Samlerens måneklokker'
    },
    mirelaFavor: {
      title: 'Mirelas forsvundne leverancer'
    },
    treasureMap: {
      title: 'Kaptajn Rooks skattekort'
    },
    windrunnerTest: {
      title: 'Prøven: Vindløber'
    },
    frostwardenTest: {
      title: 'Prøven: Frostvogter'
    },
    lightbringerTest: {
      title: 'Prøven: Lysbringer'
    },
    beastcallerTest: {
      title: 'Prøven: Dyrekalder'
    }
  }
}
