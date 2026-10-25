// Spanish locale — mirrors the key shape of en.ts exactly.
export default {
  // ─── Afterplay phase 8: items, materials and capstones ───
  // ─── Afterplay phase 10: the prestige classes ───
  'prestige': { 'toast': { 'wanderer': "Un vagabundo misterioso espera en el fuerte." } },
  'relic': {
    'infernal': "{name} · Infernal",
    'set': "Con {item}:",
    'heroicBadge': "Heroico {n}",
    'heroic': "Heroico {n}: {gold} de oro, {glass} de cristal demoníaco",
    'heroicIchor': "Heroico {n}: {gold} de oro, {glass} de cristal demoníaco, {ichor} de icor",
    'heroicMax': "Todos los rangos heroicos alcanzados.",
    'infernalForge': "Forja infernal: {gold} de oro, {glass} de cristal demoníaco",
    'lens': "Lente del Oráculo: aquí espera {boss}.",
    'hydraKey': "Sellado. La llave de fuego de la Hidra abre el corazón de la Grieta.",
    'marksGlass': "Comprar {glass} de cristal demoníaco por {marks} marcas",
    'capstone': "Cumbre",
    'fortOnly': "Esta cumbre solo se enseña en el Paso del Bastión."
  },
  // ─── The fort's fair games (afterplay §9) ───
  'fair': {
    'fee': "Jugar · {n}",
    'again': "Jugar otra vez",
    'noGold': "No tienes suficiente oro.",
    'capped': "Zonas por despejar hasta que vuelvan los grandes premios: {n}",
    'top': "¡Premio mayor! +{gold} de oro, +{xp} PX",
    'topGold': "Premio mayor, solo en oro: +{n} de oro",
    'won': "¡Ganas! +{n} de oro",
    'lost': "Mala suerte. La racha empieza de cero.",
    'row': "Victorias seguidas: {n} de {max}",
    'mats': "+{n} de material Heroico+",
    'discount': "¡El herrero ahora te hace un {n} % de descuento en mejoras!"
  },
  'whack': {
    'title': "Aplasta-Diablillos",
    'lead': "Golpea 20 diablillos en 30 segundos. Deja en paz a los de armadura dorada: cada uno que golpees cuesta una vida.",
    'hits': "Diablillos: {n} / {max}",
    'lives': "Vidas: {n}",
    'time': "Tiempo: {n} s",
    'hint': "Toca los diablillos o pulsa del 1 al 9.",
    'barrel': "Barril {n}",
    'timeout': "¡Se acabó el tiempo!",
    'dead': "¡Sin vidas!"
  },
  'ring': {
    'title': "Aros a la Hidra",
    'lead': "Mantén para cargar fuerza y suelta para lanzar. Una cabeza solo atrapa el aro cerca del centro de su vaivén. Cada cabeza seguida vale un punto más.",
    'hint': "Mantén y suelta sobre la mesa, o mantén Espacio.",
    'rings': "Aros restantes: {n}",
    'score': "Puntos: {n}",
    'hit': "¡Dentro! +{n}",
    'miss': "¡Fallo!",
    'perfect': "¡Una ronda perfecta!",
    'nothing': "{n} puntos. Esta vez no hay premio.",
    'power': "Fuerza"
  },
  'arm': {
    'title': "Pulso",
    'lead': "Toca cuando el anillo toque el círculo para bajarle el brazo. La Fuerza ensancha el ritmo. Tres victorias seguidas dan un descuento de herrería, cinco dan material Heroico+.",
    'hint': "Toca la mesa o pulsa Espacio.",
    'good': "¡Empuja!",
    'off': "¡Fuera de ritmo!"
  },
  // ─── The Siege of Bastion (afterplay §8) ───
  'siege': {
    'title': "Asedio del Paso del Bastión",
    'lead': "Defiende la puerta durante diez oleadas. Entre oleadas, gasta marcas de asedio en defensas.",
    'story': "La horda está en la puerta. Resiste diez oleadas: este primer asedio no se puede perder.",
    'bell': "¡Suena la campana del asedio! La horda se reúne ante la puerta.",
    'mapBell': "¡Asedio!",
    'start': "Tocar la campana",
    'wins': "Victorias: {n}",
    'marksBank': "Marcas de asedio guardadas: {n}",
    'tier': {
      'normal': "Normal",
      'hard': "Difícil",
      'nightmare': "Pesadilla"
    },
    'tierDesc': {
      'normal': "Enemigos un nivel por encima del tuyo.",
      'hard': "Enemigos 3 niveles más altos, con un 30 % más de vida.",
      'nightmare': "Enemigos 6 niveles más altos y dos oleadas de élites míticos."
    },
    'locked': {
      'hard': "Primero gana un asedio normal.",
      'nightmare': "Se abre cuando la grieta esté sellada o se deje entreabierta."
    },
    'lord': "Señor del Asedio",
    'hud': {
      'wave': "Oleada {n}/{total}",
      'marks': "Marcas: {n}",
      'gate': "Puerta {pct} %",
      'build': "Oleada {n} en {s} s",
      'ready': "¡Listo!",
      'buy': "{name}: {n} marcas"
    },
    'def': {
      'ballista': {
        'name': "Balista",
        'desc': "Dispara un virote perforante por su carril cada 2 segundos."
      },
      'cauldron': {
        'name': "Caldero de fuego",
        'desc': "Prende fuego al paso estrecho de su carril."
      },
      'barricade': {
        'name': "Barricada",
        'desc': "Bloquea un carril durante 20 segundos."
      },
      'militia': {
        'name': "Milicia",
        'desc': "Dos guardias luchan a tu lado."
      },
      'repair': {
        'name': "Reparar la puerta",
        'desc': "Restaura una cuarta parte de la puerta."
      }
    },
    'block': {
      'marks': "No tienes suficientes marcas de asedio.",
      'full': "No cabe más.",
      'phase': "Solo entre oleadas."
    },
    'toast': {
      'cleared': "¡Oleada {n} resistida! +{marks} marcas",
      'clearedUnharmed': "¡Oleada {n} resistida y la puerta intacta! +{marks} marcas",
      'horn': "¡Suena el cuerno! A la puerta le queda un {pct} %.",
      'ram': "¡Un ariete! ¡Detenlo antes de que llegue a la puerta!",
      'rally': "¡En pie otra vez! ¡Defiende la puerta!"
    },
    'banner': {
      'wave': "Oleada {n}",
      'final': "¡El Señor del Asedio!"
    },
    'result': {
      'tier': "Asedio del Paso del Bastión: {tier}",
      'waves': "Oleadas resistidas: {n}/{total}",
      'marks': "Marcas de asedio conservadas: {banked} de {earned}",
      'glass': "Cristal demoníaco: +{n}"
    },
    'milestone': {
      'normal1': "Hito alcanzado: el Estandarte del Bastión.",
      'normal5': "Hito alcanzado: la Coraza del Guardamuros.",
      'hard1': "Hito alcanzado: Instinto de veterano, una quinta ranura pasiva.",
      'hard5': "Hito alcanzado: Rompepuertas.",
      'nightmare1': "Hito alcanzado: la Corona del Último Bastión.",
      'hardFlawless': "Hito alcanzado: la llave de una prueba de clase oculta."
    }
  },
  // ─── The Breaking (the afterplay's story) ───
  'breaking': {
    'title': "La Ruptura",
    'toast': {
      brk6: "El Maestro Herrero ha recuperado su forja. La forja infernal está abierta.",
      brk7: "La Esfinge ha muerto. La Lente del Oráculo muestra dónde acechan las grandes bestias.",
      brk8: "El Leviatán ha muerto. Su escama te deja caminar sobre los bajíos.",
      brk9: "La Hidra ha muerto. Su llave de fuego es tuya.",
      brk10: "El Dragón Ancestral ha muerto. La grieta está abierta.",
      sealed: "La grieta está sellada. Eres el Sellador de la Grieta.",
      ajar: "La grieta queda entreabierta. Los demonios pondrán a prueba las murallas y el coliseo.",
      'brk2': "Paso del Bastión te acoge. Su gente confía en ti ahora.",
      'rescued': "¡Supervivientes rescatados! Están a salvo en Paso del Bastión.",
      'brk3': "El camino está despejado. La gente de Sunford está a salvo.",
      'brk4': "La herbolaria se une al fuerte.",
      'brk5': "La horda de centauros está rota. El fuerte se prepara para un asedio.",
    },
  },
  // ─── The intro (#130): its skip, and its narrator's name ───
  intro: {
    narrator: 'El Cronista',
    skip: 'Saltar',
    holdKey: 'Mantén {key} para saltar',
    holdTouch: 'Mantén pulsado para saltar',
    replay: 'Ver la intro'
  },
  arena: {
    allWon: 'Todos los premios míticos son tuyos.',
    call: 'La historia ya está contada. Ahora demuestra tu build: sube todo lo que puedas y gana los premios míticos que nadie más te puede dar.',
    prize: '¡Premio conseguido: {item}!',
    milestone: '¡Oleada {n}!',
    next: 'Próximo premio en la oleada {at}: {item}',
    champion: 'Oleada del campeón',
    wave: 'Oleada {n}'
  },
  sellOre: {
    talk: 'Buen mineral, precio justo. ¿Cuánto me vendes?',
    lead: 'Elige cuántas pepitas de cada mineral vender. No se vende nada hasta que pulses Vender.',
    have: 'Tienes {n}',
    each: '{n} de oro cada una',
    none: 'Ninguno',
    all: 'Todo',
    less: 'Un {ore} menos',
    more: 'Un {ore} más',
    total: 'Recibes: {n} de oro',
    sell: 'Vender',
    selectAll: 'Seleccionar todo',
    empty: 'No te queda mineral para vender.'
  },
  smith: {
    why: {
      max: 'Tienes ambos, mejorados al máximo.',
      gold: 'No tienes suficiente oro.',
      ore: 'No tienes suficiente mineral.',
      metal: 'Extrae primero este mineral.',
      learn: 'Primero un herrero tiene que enseñarte.'
    },
    stamp: 'Forjado',
    take: 'Tomar',
    worked: '{item} mejorado hasta +{n}',
    made: '{item} +{n}',
    grade: {
      perfect: '¡Perfecto!',
      great: '¡Gran trabajo!',
      good: 'Buen trabajo',
      poor: 'Trabajo tosco'
    },
    hint: 'Toca «Golpea», o pulsa Espacio, cuando el brillo esté en la zona caliente.',
    strikes: 'Golpe {n} de {max}',
    strike: '¡Golpea!',
    forge: 'Forjar',
    gold: '{n} de oro',
    nuggets: '{ore}: {have} de {n}',
    master: 'Un gran golpe lo convierte en: {item}.',
    locked: 'Extrae primero {ore} para aprender sus piezas.',
    lead: 'Cada metal que extraes te revela sus piezas. Golpea el brillo donde está más caliente: tres golpes deciden la pieza.',
    talk: 'El hierro caliente no espera a nadie.'
  },
  gameName: 'Battlecross',
  cancel: 'Cancelar',
  close: 'Cerrar',
  ok: 'Ok',
  continue: 'Continuar',
  onlyAvailableOn: 'Este juego solo está disponible en',
  ui: {
    next: 'Siguiente',
    replay: 'Repetir',
    back: 'Atrás',
    play: 'Jugar',
    pause: 'Pausa',
    menu: 'Menú',
    home: 'Inicio',
    info: 'Info',
    help: 'Controles',
    ok: 'Entendido',
    continue: 'Continuar'
  },
  hud: {
    level: 'Nv. {n}',
    health: 'Vida {n} de {max}',
    mana: 'Maná {n} de {max}',
    heat: 'Calor',
    xp: 'XP',
    gold: '{n} de oro',
    potion: 'Poción de vida (quedan {n})',
    manaPotion: 'Poción de maná (quedan {n})',
    potionStop: 'Bebe una poción de salud para continuar',
    groups: '{n} de {total} grupos de enemigos derrotados',
    wave: 'Oleada {n} / {total}',
    roll: 'Voltereta',
    elixir: '{name} (quedan {n})',
    elixirNext: 'Siguiente elixir'
  },
  menu: {
    map: 'Mapa del mundo',
    character: 'Héroe',
    skills: 'Habilidades',
    inventory: 'Bolsa',
    journal: 'Diario'
  },
  combat: {
    dodge: 'Esquiva',
    block: 'Bloqueado',
    immune: 'Inmune'
  },
  level: {
    mine: 'Picar',
    open: 'Abrir',
    guarded: 'Vigilado',
    locked: 'Cerrado',
    potion: '+1 poción',
    manaPotion: '+1 poción de maná',
    leave: 'Salir',
    chestsLeft: 'Aún quedan {n} cofres cerrados aquí'
  },
  status: {
    stun: 'Aturdido',
    knockup: 'Por los aires',
    knockdown: 'Derribado',
    stasis: 'Estasis',
    petrify: 'Petrificado',
    frozen: 'Congelado',
    fear: 'Asustado',
    slow: 'Ralentizado',
    confuse: 'Confundido',
    taunt: 'Provocado',
    armorShred: 'Armadura rota',
    weaken: 'Debilitado',
    vulnerable: 'Vulnerable',
    burn: 'En llamas',
    poison: 'Envenenado',
    bleed: 'Sangrando',
    delayed: 'Daño retardado',
    haste: 'Celeridad',
    attackSpeed: 'Ataques rápidos',
    damageUp: 'Potenciado',
    defenseUp: 'Fortificado',
    regen: 'Regenerando',
    lifestealUp: 'Robo de vida',
    invulnerable: 'Invulnerable',
    unkillable: 'Inmortal',
    stealth: 'Oculto',
    reflect: 'Reflejando',
    envenom: 'Hoja venenosa',
    exosuit: 'Exotraje',
    focus: 'Concentrado',
    accelerate: 'Aceleración',
    overheat: 'Sobrecalentado',
    enrage: 'Enfurecido',
    ambush: 'Emboscada',
    elixirMight: 'Elixir de poder',
    elixirIron: 'Piel de hierro',
    elixirSwift: 'Celeridad',
    elixirMind: 'Mente clara',
    elixirVigor: 'Vigor',
    elixirShadow: 'Hoja sedienta',
    chi: 'Chi'
  },
  toast: {
    cageLocked: 'Cerrada. La llave tiene que estar en algún lugar de aquí.',
    cageKey: '¡Una llave! Debe de abrir la jaula.',
    ore: 'Extraído: {n} × {ore}',
    mineBusy: '¡No con enemigos cerca!',
    pressureUp: 'Tus enemigos se vuelven más feroces {skulls}',
    pressureDown: 'Tus enemigos aflojan {skulls}',
    item: 'Encontrado: {item}',
    levelUp: '¡Nivel {level}! +3 puntos de atributo',
    boss: 'Aparece {boss}',
    wave: 'Oleada {n}',
    herb: 'Recogido: {plant}',
    piece: '¡Un trozo del mapa del tesoro!'
  },
  coach: {
    move: {
      touch: 'Toca el suelo para caminar hasta allí, o usa el stick.',
      mouse: 'Haz clic en el suelo para caminar hasta allí, o muévete con las teclas de movimiento.'
    },
    target: {
      touch: 'Toca a un enemigo, o arrastra desde tu héroe hasta él, para atacarlo.',
      touch__f: 'Toca a un enemigo, o arrastra desde tu heroína hasta él, para atacarlo.',
      mouse: 'Haz clic en un enemigo para atacarlo.'
    },
    skill: {
      touch: 'Toca una habilidad para usarla contra tu objetivo.',
      mouse: 'Pulsa la tecla de una habilidad para usarla contra tu objetivo.'
    },
    aim: {
      touch: 'Arrastra una habilidad al campo para apuntar y suelta para lanzarla.',
      mouse: 'Arrastra una habilidad al campo para apuntar y suelta para lanzarla.'
    },
    potion: {
      touch: 'Toca la poción para curarte.',
      mouse: 'Pulsa la tecla de la poción para curarte.'
    },
    mana: {
      touch: 'Toca el frasco azul para recuperar tu maná.',
      mouse: 'Pulsa la tecla de la poción de maná para recuperar tu maná.'
    },
    chest: {
      touch: 'Toca un cofre para abrirlo.',
      mouse: 'Haz clic en un cofre para abrirlo.'
    },
    talk: {
      touch: 'Sigue el rastro hasta el maestro y tócalo para hablar.',
      mouse: 'Sigue el rastro hasta el maestro y haz clic en él para hablar.'
    },
    teach: {
      touch: 'Toca «¿Me enseñas algo?» para ver lo que enseña este maestro.',
      mouse: 'Haz clic en «¿Me enseñas algo?» para ver lo que enseña este maestro.'
    },
    learn: {
      touch: 'Toca una habilidad y luego toca Aprender.',
      mouse: 'Haz clic en una habilidad y luego en Aprender.'
    },
    slot: {
      touch: 'Toca tu nueva habilidad y luego una ranura para llevarla al combate.',
      mouse: 'Arrastra tu nueva habilidad a una ranura para llevarla al combate.'
    },
    equip: {
      touch: 'Toca el objeto nuevo, compara los números verdes y rojos y toca su ranura para equiparlo.',
      mouse: 'Arrastra el objeto nuevo a su ranura para equiparlo. Los números verdes suben y los rojos bajan.'
    },
    attr: {
      touch: 'Toca un más para gastar un punto de atributo.',
      mouse: 'Haz clic en un más para gastar un punto de atributo.'
    },
    travel: {
      touch: 'Toca el siguiente lugar en el mapa y luego el botón para viajar allí.',
      mouse: 'Haz clic en el siguiente lugar del mapa y luego en el botón para viajar allí.'
    },
    buy: {
      touch: 'Toca un objeto para ver su precio y luego toca Comprar.',
      mouse: 'Haz clic en un objeto para ver su precio y luego en Comprar.'
    },
    exit: {
      touch: 'Toca el botón del mapa para salir de la ciudad hacia tu próxima aventura.',
      mouse: 'Haz clic en el botón del mapa para salir de la ciudad hacia tu próxima aventura.'
    },
    roll: {
      touch: 'Toca el botón de voltereta para esquivar el peligro. Nada puede hacerte daño en plena voltereta.',
      mouse: 'Pulsa la tecla de voltereta para esquivar el peligro. Nada puede hacerte daño en plena voltereta.'
    }
  },
  goal: {
    dummy: 'Derriba el muñeco de entrenamiento',
    clear: 'Despeja {place}',
    boss: 'Derrota a {foe}',
    exit: 'Coge el botín y sal',
    wave: 'Sobrevive a las oleadas',
    trainer: 'Habla con un maestro',
    learn: 'Aprende una habilidad',
    points: 'Gasta tus puntos',
    leave: 'Sal hacia {place}',
    travel: 'Viaja a {place}',
    decide: 'Toma tu decisión',
    explore: 'Explora el reino',
    fight: 'Gana el combate',
    show: 'Muéstrame el camino: {goal}',
    escort: 'Protege la caravana'
  },
  node: {
    'bastion': {
      'name': "Paso del Bastión",
      'desc': "Un viejo fuerte fronterizo, los últimos muros en pie. Aquí se reúnen los supervivientes.",
    },
    sunford: {
      name: 'Sunford',
      desc: 'Un pueblo de granjeros al borde de las llanuras. Tu hogar, un herrero y dos maestros.'
    },
    plains: {
      name: 'Llanuras de Sunford',
      desc: 'Goblins, lobos y bandidos acosan a las caravanas en el camino abierto.'
    },
    hollows: {
      name: 'Hondonadas Goblin',
      desc: 'Las cuevas bajo las colinas. El Rey Goblin tiene su corte en el fondo.'
    },
    arena: {
      name: 'El Coliseo',
      desc: 'Oleada tras oleada, cada una más dura que la anterior. ¿Hasta dónde puedes llegar? Un ranking nuevo cada lunes.'
    },
    woods: {
      name: 'Bosque Susurrante',
      desc: 'Árboles viejos que caminan, y arañas que tejen entre ellos.'
    },
    outskirts: {
      name: 'Afueras de Oakhaven',
      desc: 'Las granjas en llamas a las afueras de Oakhaven. El ejército de un caudillo está a las puertas.'
    },
    oakhaven: {
      name: 'Oakhaven',
      desc: 'Una ciudad comercial amurallada. Lo que llegue a ser depende de ti.'
    },
    crags: {
      name: 'Riscos Cenicientos',
      desc: 'Roca negra y fuego abierto. Los cultistas alimentan las llamas.'
    },
    mines: {
      name: 'Minas de Ironhold',
      desc: 'Los enanos cavaron demasiado hondo y despertaron algo que brilla.'
    },
    ironhold: {
      name: 'Ironhold',
      desc: 'La ciudad-forja de la montaña. Aquí se martilla el mejor acero del reino.'
    },
    tundra: {
      name: 'Tundra Mordehielo',
      desc: 'Un páramo blanco donde caminan gigantes y los muertos no se quedan en el suelo.'
    },
    temple: {
      name: 'Templo Sumergido',
      desc: 'Salas anegadas de las nagas, y una oráculo que ve todos los finales.'
    },
    citadel: {
      name: 'Ciudadela del Vacío',
      desc: 'Una fortaleza que no estaba ahí el año pasado. Sus muros zumban.'
    },
    peak: {
      name: 'Pico del Dragón',
      desc: 'Los guivernos rodean la cima. Algo mucho más grande duerme en ella.'
    },
    fortress: {
      name: 'Fortaleza del Terror',
      desc: 'La sede del Archidemonio, y el trono que todas las facciones desean.'
    },
    rift: {
      name: 'La Grieta del Vacío',
      desc: 'La herida por la que llegaron los demonios. El Señor del Vacío espera al otro lado.'
    },
    silverbridge: {
      name: 'Silverbridge',
      desc: 'La gran ciudad del río, sobre el viejo puente de piedra. Aquí enseña un maestro de cada clase.'
    }
  },
  map: {
    title: 'El Reino',
    town: 'Pueblo',
    levels: 'Nv. {min}–{max}',
    arenaBest: 'Récord: oleada {n}',
    travel: 'Viajar',
    again: 'Repetir',
    enter: 'Entrar',
    fight: 'Luchar',
    back: 'Volver al pueblo',
    locked: 'Despeja una zona vecina para abrir el camino.',
    lockedArena: 'Sus puertas se abrirán cuando se resuelva lo del Rey Goblin.',
    lockedRift: 'Se abrirá cuando se decida el trono de la Fortaleza del Terror.',
    invaded: 'Invadida',
    invadedDesc: 'Los demonios dominan esta tierra. Sus pilones hacen que los enemigos cercanos golpeen más fuerte, las cicatrices de la grieta queman y ralentizan, y cada enemigo abatido aquí vale más.',
    lockedInvaded: 'Los demonios la tienen bien sujeta. Recupera primero {zone}.',
    danger: {
      '1': 'Un poco por encima de tu nivel.',
      '2': 'Peligroso para tu nivel.',
      '3': 'Muy por encima de tu nivel.'
    },
    questOpen: '{quest}: aquí te espera una decisión.',
    questDone: '{quest}: {choice}',
    trainer: 'Maestro oculto: {cls}',
    new: 'Nuevo',
    trueTest: 'La verdadera prueba',
    skip: 'Toca para saltar',
    compass: {
      n: 'N',
      e: 'E',
      s: 'S',
      w: 'O'
    },
    region: {
      vale: 'Valle Solprado',
      hills: 'Las Colinas Goblin',
      peaks: 'Los Picos de Hierro',
      ash: 'Las Tierras Cenicientas',
      frost: 'La Marca Gélida',
      fields: 'Los Campos Dorados',
      mere: 'El Pantano Naga',
      reach: 'Los Confines del Vacío',
      dread: 'Las Tierras del Terror',
      sea: 'El Mar Zafiro',
      bay: 'Bahía del Mercader'
    },
    walkTouch: 'Toca el mapa para caminar hasta allí, o guía con el joystick',
    walkMouse: 'Haz clic en el mapa para caminar hasta allí, o guía con WASD'
  },
  encounter: {
    kicker: 'En el camino',
    title: {
      fight: '¡Emboscada!',
      elite: '¡Un campeón corta el paso!',
      chest: '¡Un cofre en la hierba!',
      merchant: 'Un mercader ambulante'
    },
    result: 'En el camino, cerca de {place}',
    gold: '+{n} de oro',
    xp: '+{n} XP'
  },
  travel: {
    to: 'Viajando a',
    loading: 'Cargando'
  },
  attr: {
    str: {
      name: 'Fuerza',
      short: 'FUE',
      desc: 'Poder cuerpo a cuerpo, probabilidad de bloqueo, armadura pesada.'
    },
    dex: {
      name: 'Destreza',
      short: 'DES',
      desc: 'Golpes críticos, velocidad de ataque y de movimiento.'
    },
    int: {
      name: 'Inteligencia',
      short: 'INT',
      desc: 'Poder de hechizos, maná, resistencia elemental.'
    },
    end: {
      name: 'Aguante',
      short: 'AGU',
      desc: 'Vida, regeneración, armadura, resistencia al aturdimiento.'
    },
    skl: {
      name: 'Técnica',
      short: 'TEC',
      desc: 'Daño crítico, enfriamientos, armas a distancia.'
    },
    cha: {
      name: 'Carisma',
      short: 'CAR',
      desc: 'Esbirros, precios de tienda, recompensas, opciones de diálogo.'
    }
  },
  stat: {
    damage: 'Daño',
    health: 'Vida',
    mana: 'Maná',
    armor: 'Armadura',
    resist: 'Resistencia',
    crit: 'Prob. de crítico',
    critDamage: 'Daño crítico',
    attackSpeed: 'Vel. de ataque',
    moveSpeed: 'Vel. de movimiento',
    cdr: 'Reduc. de enfriamiento',
    block: 'Bloqueo',
    dodge: 'Esquiva',
    hpRegen: 'Vida / s'
  },
  sheet: {
    points: '{n} puntos por gastar',
    raise: 'Subir {attr}',
    maxLevel: 'Nivel máximo alcanzado',
    next: 'Siguiente punto:'
  },
  heroChoice: {
    title: 'Elige a tu héroe',
    boy: 'Jugar con el chico',
    girl: 'Jugar con la chica',
    switch: 'Tu héroe'
  },
  skills: {
    active: 'Habilidades activas',
    passive: 'Habilidades pasivas',
    known: 'Aprendidas',
    none: 'Aún no has aprendido nada. Busca a un maestro en un pueblo.',
    emptySlot: 'Ranura vacía {n}',
    equip: 'Asignar',
    remove: 'Quitar',
    unmet: 'Ya no cumples sus requisitos.',
    how: 'Toca una habilidad y luego una ranura, o arrástrala hasta allí. Arrástrala fuera de una ranura para quitarla.',
    howSlot: 'Ahora toca una ranura para colocarla.',
    classCount: '{cls}: {n} de {total} aprendidas',
    hint: {
      met: 'Apréndela con {name} en {place}.',
      unmet: 'Un maestro de {place} enseña esto.'
    }
  },
  class: {
    // ── The prestige classes (afterplay phase 10) ──
    'demonhunter': { 'name': "Cazademonios", 'desc': "Sombra y luz sagrada, juradas a una sola presa. Marca demonios, y los marcados caen rápido." },
    'dragoon': { 'name': "Dragontino", 'desc': "Viento bajo las botas, un escudo en el brazo. Salta desde el cielo y ensarta filas enteras." },
    'hexsmith': { 'name': "Forjamaleficios", 'desc': "Artesanía de éter alimentada con sangre. Construye torretas que drenan al enemigo para curar al herrero." },
    'tidecaller': { 'name': "Invocamareas", 'desc': "Escarcha y elementos, vertidos en el mar. Olas que empujan y empapan a los enemigos." },
    aegis: {
      name: 'Caballero de la Égida',
      desc: 'Escudo y acero sagrado. Recibe los golpes para que nadie más tenga que hacerlo.'
    },
    shadow: {
      name: 'Hoja Sombría',
      desc: 'Sale de la oscuridad, golpea por la espalda y desaparece.'
    },
    pyro: {
      name: 'Piromante',
      desc: 'El fuego responde a todas las preguntas. Quémalos y luego hazlos estallar.'
    },
    sovereign: {
      name: 'Gran Soberano',
      desc: '¿Para qué luchar a solas? Invoca guardias y dales órdenes.'
    },
    chrono: {
      name: 'Tejedor del Tiempo',
      desc: 'Detiene a los enemigos en el tiempo, acelera a los aliados y deshace errores.'
    },
    blood: {
      name: 'Alquimista de Sangre',
      desc: 'Paga el poder con vida y luego se la bebe al enemigo.'
    },
    aether: {
      name: 'Éter-Tec',
      desc: 'Armas de fuego, torretas y un medidor de calor. Libéralo antes de que te bloquee.'
    },
    geo: {
      name: 'Geomante',
      desc: 'Levanta muros y púas, y rompe el propio suelo.'
    },
    windrunner: {
      name: 'Corredor del Viento',
      desc: 'Un arco y el viento a tu espalda. Dispara, corre y no pares nunca.'
    },
    frostwarden: {
      name: 'Guardián de Escarcha',
      desc: 'Una hoja de hielo y un corazón frío. Ralentízalos, congélalos y luego hazlos añicos.'
    },
    lightbringer: {
      name: 'Portador de Luz',
      desc: 'Luz que cura a los amigos y ciega a los enemigos. Ponte en ella y nada podrá detenerte.'
    },
    beastcaller: {
      name: 'Domador de Bestias',
      desc: 'Una manada de lobos, un oso y un halcón luchan a tu lado. Llámalos y dales órdenes.'
    },
    elementalist: {
      name: 'Elementalista',
      desc: 'Fuego, escarcha, rayo y piedra. Combínalos y cada uno desata el siguiente.'
    },
    soulwarden: {
      name: 'Guardián de Almas',
      desc: 'Los enemigos vencidos se alzan como espíritus amigos, luchan a tu lado y luego vuelven a casa a descansar.'
    },
    ironmonk: {
      name: 'Monje de Hierro',
      desc: 'Manos desnudas, pies veloces. Cada golpe acumula chi; gástalo todo en un solo golpe poderoso.'
    },
    bard: {
      name: 'Bardo',
      desc: 'Canciones que animan a tu bando y melodías que duermen al otro o lo vuelven contra sí mismo.'
    }
  },
  skill: {
    // ── The prestige classes (afterplay phase 10) ──
    'huntersMark': { 'name': "Marca del cazador", 'desc': "Un virote sagrado de {dmg}% de daño de Destreza. Durante {dur} s el objetivo recibe {vuln}% más de daño, un demonio {demon}% más." },
    'demonsBane': { 'name': "Perdición demoníaca", 'desc': "+{bane}% de daño a demonios y {ward}% menos de daño de ellos." },
    'silverVolley': { 'name': "Andanada de plata", 'desc': "Virotes de plata en línea: {dmg}% de daño de Destreza, +{bane}% a demonios y enemigos marcados." },
    'skyfallLeap': { 'name': "Caída celeste", 'desc': "Salta fuera de alcance {air} s y cae en el sitio: {dmg}% de daño de Fuerza en {radius} m, enemigos derribados." },
    'dragonBlood': { 'name': "Sangre de dragón", 'desc': "+{boss}% de daño a jefes, +{hp}% de salud máxima, y nada te empuja." },
    'dragonLance': { 'name': "Lanza de dragón", 'desc': "Una estocada de lanza en línea: {dmg}% de daño de Destreza a cada enemigo en ella." },
    'hexTurret': { 'name': "Torreta maldita", 'desc': "Construye una torreta durante {dur} s. Cada segundo drena al enemigo más cercano en {radius} m por {dmg}% de daño de Técnica; te curas el {drain}%." },
    'soulForge': { 'name': "Forja de almas", 'desc': "+{hp}% de salud máxima, {regen} de salud por segundo y recibes {reduce}% menos de daño." },
    'hexBolt': { 'name': "Virote maldito", 'desc': "Paga {hp}% de salud: un virote de {dmg}% de daño de Técnica. Te curas el {heal}% y el enemigo inflige {weak}% menos de daño durante {dur} s." },
    'tidalWave': { 'name': "Maremoto", 'desc': "Una ola en línea: {dmg}% de daño de Inteligencia, enemigos empujados y empapados ({slow}% de lentitud durante {dur} s)." },
    'seaborn': { 'name': "Hijo del mar", 'desc': "+{bonus}% de daño a enemigos helados, {reduce}% menos de daño recibido, +{move}% de velocidad." },
    'undertow': { 'name': "Resaca", 'desc': "Un remolino durante {dur} s: {dmg}% de daño de Inteligencia en total en {radius} m. Atrae a los enemigos y los ralentiza un {slow}%." },
    'bastionWall': { 'name': "Muro del Bastión", 'desc': "Durante {dur} s, todo enemigo a {radius} m debe atacarte y recibes un {def}% menos. Luego la luz inflige {dmg}% de Fuerza +{back}% de los golpes recibidos." },
    'thousandCuts': { 'name': "Mil Cortes", 'desc': "Salta entre enemigos a {radius} m y golpea {hits} veces, cada golpe por {dmg}% de daño de Destreza. Un jefe solo recibe un golpe. Nada puede herirte mientras cortas." },
    'cinderSun': { 'name': "Sol de ceniza", 'desc': "Un sol moribundo se rompe durante {dur} s: {meteors} fragmentos ardientes, cada uno con {dmg}% de daño de Inteligencia." },
    'royalLegion': { 'name': "Legión real", 'desc': "Llama a la legión durante {dur} s: {archers} arqueros, {guards} guardias y {mages} magos de batalla." },
    'stoppedHour': { 'name': "Hora detenida", 'desc': "Detén la hora en {radius} m durante {dur} s. Cuando vuelve a correr, cada enemigo recibe {dmg}% de daño de Inteligencia." },
    'redCovenant': { 'name': "Pacto rojo", 'desc': "Toma el {pct}% de la vida de cada enemigo a {radius} m. Te curas el {heal}% de ello." },
    'orbitalLance': { 'name': "Lanza orbital", 'desc': "Una lanza de luz del cielo quema donde apuntas: {dmg}% de daño de Habilidad en {dur} s." },
    'tectonicHeart': { 'name': "Corazón tectónico", 'desc': "El corazón de la tierra se abre: {dmg}% de daño de Fuerza a todo lo cercano y escombros que ralentizan {dur} s." },
    'eyeOfTheGale': { 'name': "Ojo del vendaval", 'desc': "Una tormenta de flechas durante {dur} s: {dmg}% de daño de Habilidad en total y {slow}% de ralentización." },
    'endlessWinter': { 'name': "Invierno sin fin", 'desc': "Un invierno sin fin estalla desde ti: {dmg}% de daño de Inteligencia en {radius} m, congelando a todos {freeze} s." },
    'dawnbreak': { 'name': "Alborada", 'desc': "Sé el alba durante {dur} s: cada segundo, {dmg}% de daño de Inteligencia en {radius} m y te curas un {heal}%." },
    'alphasCall': { 'name': "Llamada del alfa", 'desc': "{wolves} lobos responden y corren contigo {dur} s. Toda la manada inflige +{dmg}% de daño y va un {move}% más rápido." },
    'prismStorm': { 'name': "Tormenta prismática", 'desc': "Durante {dur} s rugen los cuatro elementos: {strikes} golpes de {dmg}% de Inteligencia que se activan entre sí." },
    'ferryman': { 'name': "Barquero", 'desc': "Durante {dur} s, todo enemigo que cae cerca de ti se alza como tu espíritu, y los espíritus infligen un {atk}% más." },
    'unmovingMountain': { 'name': "Montaña inamovible", 'desc': "Gasta todo el chi: una montaña cae por {dmg}% de daño de Destreza, +{per}% por chi, y derriba a los enemigos." },
    'encore': { 'name': "Bis", 'desc': "Una vez más durante {dur} s (+{buff}% velocidad, daño, Defensa) y luego el último acorde: {dmg}% de Carisma, enemigos hechizados." },
    kind: {
      active: 'Activa',
      passive: 'Pasiva'
    },
    cooldown: 'Enfriamiento: {n}s',
    mana: '{n} de maná',
    hpCost: '{n}% de vida',
    heat: '+{n} de calor',
    aimed: 'Arrastra para apuntar',
    shieldSlam: {
      name: 'Golpe de escudo',
      desc: 'Embiste al objetivo: {dmg}% de daño de Fuerza y lo aturde durante {stun}s.'
    },
    aegisAura: {
      name: 'Aura de la Égida',
      desc: '+{armor}% de Armadura, y el daño físico recibido se reduce un {reduce}%.'
    },
    radiantStrike: {
      name: 'Golpe radiante',
      desc: 'Un golpe sagrado con {dmg}% de daño de Fuerza que te cura un {heal}% del daño infligido.'
    },
    fortitude: {
      name: 'Fortaleza',
      desc: 'Un golpe de más del {hit}% de tu vida te da un escudo del {shield}% de ella durante {dur}s. Una vez cada {icd}s.'
    },
    tauntingCry: {
      name: 'Grito provocador',
      desc: 'Los enemigos a menos de {radius} m te atacan durante {dur}s. Ganas {def}% de Defensa mientras lo hacen.'
    },
    holyBastion: {
      name: 'Bastión sagrado',
      desc: 'Invulnerable durante {dur}s. Los atacantes reciben de vuelta el {reflect}% de su daño.'
    },
    shadowstep: {
      name: 'Paso sombrío',
      desc: 'Aparece detrás del objetivo y apuñálalo por la espalda: {dmg}% de daño de Destreza.'
    },
    lethality: {
      name: 'Letalidad',
      desc: '+{crit}% de probabilidad de Crítico y +{critDmg}% de daño Crítico.'
    },
    venomousBlade: {
      name: 'Hoja venenosa',
      desc: 'Durante {dur}s tus ataques envenenan: {poison}% de la Destreza a lo largo de {over}s, acumulable {stacks} veces.'
    },
    evasion: {
      name: 'Evasión',
      desc: '+{dodge}% de Esquiva. Una esquiva otorga {haste}% de Celeridad durante {dur}s.'
    },
    smokeBomb: {
      name: 'Bomba de humo',
      desc: 'Desaparece durante {dur}s. Tu siguiente ataque desde el escondite inflige +{bonus}% de daño.'
    },
    danceOfBlades: {
      name: 'Danza de hojas',
      desc: 'Salta entre los enemigos a menos de {radius} m y golpea {hits} veces, cada golpe con {dmg}% de daño de Destreza. Un jefe solo recibe un golpe. Nada puede golpearte mientras danzas.'
    },
    fireball: {
      name: 'Bola de fuego',
      desc: 'Una bola de fuego que estalla con {dmg}% de daño de Inteligencia y quema un {burn}% más a lo largo de {burnDur}s.'
    },
    cauterize: {
      name: 'Cauterizar',
      desc: 'Los enemigos en llamas te infligen un {reduce}% menos de daño.'
    },
    flamePillar: {
      name: 'Pilar de llamas',
      desc: 'Un pilar de fuego brota donde apuntas: {dmg}% de daño de Inteligencia a lo largo de {dur}s. Los enemigos atrapados salen por los aires.'
    },
    pyromaniac: {
      name: 'Pirómano',
      desc: 'Un hechizo crítico resta {cut}s a tus enfriamientos de fuego.'
    },
    combustion: {
      name: 'Combustión',
      desc: 'Detona todas las quemaduras a menos de {radius} m: cada una inflige de golpe el {pct}% de su daño restante, como una explosión.'
    },
    cataclysm: {
      name: 'Cataclismo',
      desc: 'Invoca {meteors} meteoros a lo largo de {dur}s. Cada uno cae con {dmg}% de daño de Inteligencia.'
    },
    royalGuard: {
      name: 'Guardia real',
      desc: 'Invoca a un guardia que lucha a tu lado y golpea con {dmg}% de daño de Carisma. Hasta {max} a la vez.'
    },
    inspiringPresence: {
      name: 'Presencia inspiradora',
      desc: 'Tus esbirros atacan un {speed}% más rápido y tienen un {hp}% más de vida.'
    },
    commandFocus: {
      name: 'Orden de carga',
      desc: 'Todos los esbirros cargan contra el objetivo: +{move}% de velocidad de movimiento y +{atk}% de velocidad de ataque durante {dur}s.'
    },
    sovereignsTribute: {
      name: 'Tributo del Soberano',
      desc: 'El {share}% del daño que recibes pasa a tus esbirros.'
    },
    bannerOfVictory: {
      name: 'Estandarte de la victoria',
      desc: 'Planta un estandarte durante {dur}s. Los aliados cercanos infligen +{dmg}% de daño y regeneran un {regen}% de vida por segundo.'
    },
    armyOfTheRealm: {
      name: 'Ejército del reino',
      desc: 'Invoca {archers} arqueros, {guards} guardias y un mago de batalla durante {dur}s.'
    },
    temporalStasis: {
      name: 'Estasis temporal',
      desc: 'Congela al objetivo en el tiempo durante {dur}s. No puede actuar ni sufrir daño.'
    },
    hasteField: {
      name: 'Campo de celeridad',
      desc: 'Durante {dur}s, tú y los aliados cercanos os movéis un {move}% más rápido y atacáis un {speed}% más rápido.'
    },
    timeDistort: {
      name: 'Distorsión temporal',
      desc: 'El {share}% del daño que recibes se retrasa y se inflige a lo largo de {over}s.'
    },
    paradoxShift: {
      name: 'Salto paradójico',
      desc: 'Intercambia tu lugar con el objetivo. Recibe {dmg}% de daño de Inteligencia y los enemigos a su alrededor quedan confundidos durante {confuse}s.'
    },
    entropy: {
      name: 'Entropía',
      desc: 'Cada lanzamiento acorta tus enfriamientos un {cdr}%, acumulable {stacks} veces.'
    },
    chronoRewind: {
      name: 'Rebobinado crono',
      desc: 'Vuelve a donde estabas hace {back}s, con la vida y el maná que tenías entonces.'
    },
    sanguineFlask: {
      name: 'Frasco sanguíneo',
      desc: 'Lanza un frasco con tu propia sangre: {dmg}% de daño de Aguante en área, y armadura rota un {shred}% durante {shredDur}s.'
    },
    bloodTransmutation: {
      name: 'Transmutación de sangre',
      desc: 'El {share}% del daño físico que recibes vuelve como maná.'
    },
    essenceHarvest: {
      name: 'Cosecha de esencia',
      desc: 'Drena a todos los enemigos a menos de {radius} m: {dmg}% de daño de Inteligencia. Te curas un {heal}% de ese daño.'
    },
    hemophilia: {
      name: 'Hemofilia',
      desc: 'El drenaje de vida es un {drain}% más fuerte. Golpear a un enemigo que sangra te cura un {heal}% de tu vida.'
    },
    mutagenicRage: {
      name: 'Furia mutagénica',
      desc: 'Durante {dur}s: +{speed}% de velocidad de ataque, +{steal}% de robo de vida y +{move}% de velocidad de movimiento.'
    },
    philosophersCrucible: {
      name: 'Crisol filosofal',
      desc: 'Un charco de sangre hirviente durante {dur}s: {dmg}% de daño de Inteligencia a los enemigos que estén dentro, y te cura mientras estés en él.'
    },
    aetherPistol: {
      name: 'Pistola de éter',
      desc: 'Un disparo rápido con {dmg}% de daño de Técnica. Genera {heat} de calor.'
    },
    deployTurret: {
      name: 'Desplegar torreta',
      desc: 'Coloca una torreta que dispara con {dmg}% de daño de Técnica durante {dur}s. Hasta {max} a la vez.'
    },
    ventHeat: {
      name: 'Liberar calor',
      desc: 'Expulsa todo el calor en un cono: hasta {dmg}% de daño de Técnica; cuanto más calor, más daño.'
    },
    thermalOverload: {
      name: 'Sobrecarga térmica',
      desc: 'Mientras estás sobrecalentado, tus disparos infligen +{crit}% de daño Crítico. El sobrecalentamiento sigue bloqueando tus habilidades durante {lock}s.'
    },
    orbitalBeam: {
      name: 'Rayo orbital',
      desc: 'Un rayo del cielo quema donde apuntas: {dmg}% de daño de Técnica a lo largo de {dur}s.'
    },
    exoSuit: {
      name: 'Exotraje',
      desc: 'Durante {dur}s: +{armor}% de Armadura, y tus ataques se convierten en cohetes que infligen {rocket}% de daño de Técnica en área.'
    },
    stoneSpike: {
      name: 'Púa de piedra',
      desc: 'Una púa brota bajo el objetivo: {dmg}% de daño de Fuerza y {slow}% de ralentización durante {dur}s.'
    },
    earthBarrier: {
      name: 'Barrera de tierra',
      desc: 'Levanta un muro de roca durante {dur}s. Nada lo atraviesa, ni andando ni disparando.'
    },
    seismicShock: {
      name: 'Choque sísmico',
      desc: 'Golpea el suelo: {dmg}% de daño de Fuerza en {radius} m, y derriba a los enemigos durante {down}s.'
    },
    earthenSkin: {
      name: 'Piel de tierra',
      desc: 'Ganas Armadura igual al {armor}% de tu Fuerza. Los aturdimientos que sufres duran un {cut}% menos.'
    },
    petrify: {
      name: 'Petrificar',
      desc: 'Convierte al objetivo en piedra durante {dur}s. Recibe un {vuln}% más de daño cuando se libera en pedazos.'
    },
    tectonicRupture: {
      name: 'Ruptura tectónica',
      desc: 'Desgarra el campo: {dmg}% de daño de Fuerza a todo lo cercano, y escombros que ralentizan durante {dur}s.'
    },
    scales: 'Escala con {attr}',
    shieldThrow: {
      name: 'Lanzar escudo',
      desc: 'Tu escudo rebota en {bounces} enemigos: {dmg}% de daño de Fuerza a cada uno. Infligen un {weak}% menos durante {dur}s.'
    },
    shieldShove: {
      name: 'Empujón de escudo',
      desc: 'Empuja a todo lo que tengas delante: {dmg}% de daño de Fuerza. Salen volando y dejan lo que estaban haciendo.'
    },
    holyChains: {
      name: 'Cadenas sagradas',
      desc: 'Cadenas de luz atraen hacia ti a cada enemigo a menos de {radius} m: {dmg}% de daño de Aguante y ralentización del {slow}%.'
    },
    bulwark: {
      name: 'Baluarte',
      desc: '+{block}% de probabilidad de Bloqueo. Cada bloqueo devuelve {back} de daño al atacante.'
    },
    retribution: {
      name: 'Retribución',
      desc: 'Durante {dur}s, los enemigos a menos de {radius} m deben atacarte. Luego la luz inflige {dmg}% de Fuerza +{back}% de los golpes recibidos.'
    },
    unbreakable: {
      name: 'Inquebrantable',
      desc: 'Con menos del {hp}% de vida, recibes un {reduce}% menos de daño.'
    },
    starFan: {
      name: 'Abanico de estrellas',
      desc: 'Lanza {stars} estrellas sombrías en abanico; cada una inflige {dmg}% de daño de Destreza.'
    },
    grapplingHook: {
      name: 'Gancho',
      desc: 'Atrae al objetivo hacia ti con {dmg}% de daño de Destreza y lo ralentiza un {slow}% durante {dur}s. Los enemigos grandes te atraen a ti.'
    },
    silentStrike: {
      name: 'Golpe silencioso',
      desc: 'Las puñaladas por la espalda infligen +{backstab}% de daño, y los enemigos te detectan un {notice}% más tarde.'
    },
    shadowMark: {
      name: 'Marca sombría',
      desc: 'El objetivo recibe un {vuln}% más de daño durante {dur}s, y tu próximo golpe a quien sea es crítico con +{bonus}%.'
    },
    bladeRhythm: {
      name: 'Ritmo de hojas',
      desc: 'Los golpes críticos restan {cut}s a cada enfriamiento. +{speed}% de velocidad de ataque.'
    },
    nightshadeMist: {
      name: 'Niebla de belladona',
      desc: 'Una niebla venenosa durante {dur}s: hasta {dmg}% de daño de Destreza. Los enemigos atrapados quedan confundidos {confuse}s.'
    },
    firecracker: {
      name: 'Petardo',
      desc: 'Pega un petardo al objetivo. Tras {delay}s estalla con {dmg}% de daño de Inteligencia y quema todo lo cercano.'
    },
    fanTheFlames: {
      name: 'Avivar las llamas',
      desc: 'Cada quemadura a menos de {radius} m arde un {pct}% más fuerte y vuelve a empezar. Los enemigos a menos de {push} m salen despedidos.'
    },
    ringOfFire: {
      name: 'Anillo de fuego',
      desc: 'Un anillo de llamas se alza durante {dur}s: hasta {dmg}% de daño de Inteligencia. Los enemigos dentro se ralentizan un {slow}%.'
    },
    everflame: {
      name: 'Llama eterna',
      desc: 'Tus quemaduras son un {burn}% más fuertes, y tus hechizos ganan +{crit}% de probabilidad de Crítico.'
    },
    wildfire: {
      name: 'Incendio voraz',
      desc: 'Cuando un enemigo en llamas es derrotado, su fuego salta a cada enemigo a menos de {radius} m durante {dur}s.'
    },
    phoenixFlight: {
      name: 'Vuelo del fénix',
      desc: 'Vuela como un fénix dejando un rastro de fuego: {dmg}% de daño de Inteligencia donde aterrizas. Te curas un {regen}% por segundo durante {dur}s.'
    },
    callArchers: {
      name: 'Llamar arqueros',
      desc: 'Invoca a un arquero que dispara desde detrás de ti con {dmg}% de daño de Carisma. Hasta {max} a la vez.'
    },
    royalRally: {
      name: 'Reunión real',
      desc: 'Tus esbirros corren a tu lado y recuperan un {heal}% de vida. +{def}% de Defensa para todos durante {dur}s.'
    },
    warMarshal: {
      name: 'Mariscal de guerra',
      desc: 'Tus esbirros infligen un {dmg}% más de daño.'
    },
    royalDecree: {
      name: 'Decreto real',
      desc: 'Los enemigos a menos de {radius} m deben inclinarse: aturdidos {stun}s, y luego reciben un {vuln}% más de daño durante {dur}s.'
    },
    loyalHearts: {
      name: 'Corazones leales',
      desc: 'Cuando cae uno de tus esbirros, te curas un {heal}% de tu vida.'
    },
    summonChampion: {
      name: 'Invocar campeón',
      desc: 'Llama al campeón del reino durante {dur}s: un caballero gigante con el {hp}% de tu vida que golpea con {dmg}% de Carisma.'
    },
    echoBolt: {
      name: 'Rayo de eco',
      desc: 'Un rayo de tiempo con {dmg}% de daño de Inteligencia. {delay}s después golpea de nuevo con {echo}%.'
    },
    foresight: {
      name: 'Presciencia',
      desc: 'Ves venir los golpes un instante antes: +{dodge}% de Esquiva y enfriamientos un {cdr}% más cortos.'
    },
    timeBubble: {
      name: 'Burbuja temporal',
      desc: 'Una burbuja de tiempo lento durante {dur}s: los enemigos dentro se mueven un {slow}% más lento y reciben {dmg}% de daño de Inteligencia.'
    },
    timeLoop: {
      name: 'Bucle temporal',
      desc: 'Tras {dur}s el objetivo vuelve de golpe a donde estaba: {dmg}% de daño de Inteligencia más el {echo}% de lo que perdió.'
    },
    frozenMoment: {
      name: 'Instante congelado',
      desc: 'Tus ataques tienen un {chance}% de probabilidad de congelar al enemigo en el tiempo durante {dur}s.'
    },
    timeStop: {
      name: 'Detener el tiempo',
      desc: 'Detén el tiempo a menos de {radius} m durante {dur}s. Cuando vuelve a correr, cada enemigo recibe {dmg}% de daño de Inteligencia.'
    },
    essenceWard: {
      name: 'Escudo de esencia',
      desc: 'Convierte el {hp}% de tu vida en un escudo brillante que vale el {shield}% de eso, durante {dur}s.'
    },
    vitalReserve: {
      name: 'Reserva vital',
      desc: '+{hp}% de vida máxima, y recuperas {regen} de vida cada segundo.'
    },
    enfeeblingTonic: {
      name: 'Tónico debilitante',
      desc: 'Lanza un tónico: {dmg}% de daño de Inteligencia en área. Los enemigos alcanzados infligen un {weak}% menos de daño durante {dur}s.'
    },
    homunculus: {
      name: 'Homúnculo',
      desc: 'Prepara un ayudante burbujeante con el {hp}% de tu vida durante {dur}s. Preparar uno nuevo te devuelve el {back}% de su vida.'
    },
    adrenalCatalyst: {
      name: 'Catalizador de adrenalina',
      desc: 'Cuanta menos vida tengas, más daño infliges: hasta +{dmg}% con un {low}% de vida o menos.'
    },
    grandTransmutation: {
      name: 'Gran transmutación',
      desc: 'Convierte el {pct}% de la vida de los enemigos a menos de {radius} m en esencia. Te curas el {heal}% de ella.'
    },
    rocketJump: {
      name: 'Salto cohete',
      desc: 'Despega y aterriza donde apuntes: {dmg}% de daño de Técnica en {radius} m. Genera {heat} de calor.'
    },
    coolantLoop: {
      name: 'Circuito refrigerante',
      desc: 'El calor baja un {cool}% más rápido, y tus habilidades generan un {cut}% menos.'
    },
    shockGrenade: {
      name: 'Granada de choque',
      desc: 'Lanza una granada: {dmg}% de daño de Técnica y aturdimiento de {stun}s en {radius} m. Genera {heat} de calor.'
    },
    precisionOptics: {
      name: 'Óptica de precisión',
      desc: '+{crit}% de probabilidad de Crítico. Tus disparos atraviesan {pierce} enemigo más.'
    },
    arcCoil: {
      name: 'Bobina de arco',
      desc: 'Un rayo golpea al objetivo y salta a {jumps} enemigos más: {dmg}% de daño de Técnica a cada uno. Genera {heat} de calor.'
    },
    thermalPlating: {
      name: 'Blindaje térmico',
      desc: 'Mientras tu calor esté en {heat} o más, recibes un {reduce}% menos de daño.'
    },
    boulderRoll: {
      name: 'Roca rodante',
      desc: 'Haz rodar una roca hacia delante: {dmg}% de daño de Fuerza a todo lo que encuentre, y lo derriba durante {down}s.'
    },
    bedrock: {
      name: 'Roca madre',
      desc: 'Nada puede empujarte, derribarte ni lanzarte por los aires. +{hp}% de vida máxima.'
    },
    sinkhole: {
      name: 'Socavón',
      desc: 'El suelo se hunde y arrastra a los enemigos durante {dur}s, luego se derrumba: {dmg}% de daño de Fuerza.'
    },
    mountainBreaker: {
      name: 'Rompemontañas',
      desc: '+{boss}% de daño contra jefes y +{armor}% de Armadura.'
    },
    geodeShell: {
      name: 'Coraza de geoda',
      desc: 'Un caparazón de cristal absorbe el {shield}% de tu vida durante {dur}s y luego estalla con hasta {dmg}% de daño de Fuerza.'
    },
    crumble: {
      name: 'Desmoronar',
      desc: 'Infliges un {dmg}% más de daño a los enemigos ralentizados, derribados o convertidos en piedra.'
    },
    galeArrow: {
      name: 'Flecha de vendaval',
      desc: 'Una flecha a lomos de una ráfaga: {dmg}% de daño de Destreza, y el objetivo sale empujado.'
    },
    fleetfoot: {
      name: 'Pies ligeros',
      desc: '+{move}% de velocidad de movimiento y +{dodge}% de Esquiva.'
    },
    zephyrDash: {
      name: 'Carrera del céfiro',
      desc: 'Avanza hasta {dist} m hacia donde apuntes y luego corre un {move}% más rápido durante {dur}s.'
    },
    piercingGale: {
      name: 'Vendaval perforante',
      desc: 'Una flecha que atraviesa a todos los enemigos en línea: {dmg}% de daño de Destreza y ralentiza un {slow}% durante {dur}s.'
    },
    cycloneSnare: {
      name: 'Trampa ciclón',
      desc: 'Un torbellino atrae a los enemigos hacia su centro durante {dur}s y hace {dmg}% de daño de Técnica.'
    },
    keenEye: {
      name: 'Ojo certero',
      desc: '+{critDmg}% de Daño crítico. Tus disparos atraviesan {pierce} enemigo más.'
    },
    updraftLeap: {
      name: 'Salto ascendente',
      desc: 'Una ráfaga lanza por los aires a los enemigos a {radius} m: {dmg}% de daño de Destreza. Tú saltas {leap} m lejos.'
    },
    swiftDraw: {
      name: 'Tensado veloz',
      desc: 'Atacas un {speed}% más rápido y tus enfriamientos son un {cdr}% más cortos.'
    },
    arrowStorm: {
      name: 'Tormenta de flechas',
      desc: 'Llueven flechas sobre la zona durante {dur}s: {dmg}% de daño de Técnica en total, y ralentizan un {slow}%.'
    },
    galeSpirits: {
      name: 'Espíritus del viento',
      desc: 'Espíritus del viento vuelan contigo durante {dur}s y disparan {shots} flechas de {dmg}% de daño de Técnica. +{move}% de velocidad.'
    },
    skyHunter: {
      name: 'Cazador del cielo',
      desc: '+{boss}% de daño a jefes y +{crit}% de probabilidad de Crítico.'
    },
    skyrender: {
      name: 'Rasgacielos',
      desc: 'Una flecha de tormenta abre un camino: {dmg}% de daño de Destreza a todos en la línea, que salen volando hacia arriba y a un lado.'
    },
    frostCleave: {
      name: 'Tajo helado',
      desc: 'Barre delante de ti con tu hoja de hielo: {dmg}% de daño de Fuerza y ralentiza un {slow}% durante {dur}s.'
    },
    rimeLance: {
      name: 'Lanza de escarcha',
      desc: 'Lanza una lanza de hielo con {dmg}% de daño de Inteligencia. Ralentiza un {slow}% durante {dur}s.'
    },
    wintersBite: {
      name: 'Mordisco invernal',
      desc: 'Tus ataques ralentizan al enemigo un {slow}% durante {dur}s.'
    },
    frostArmor: {
      name: 'Armadura de escarcha',
      desc: 'Una armadura de hielo absorbe daño igual al {shield}% de tu Inteligencia durante {dur}s. Los enemigos cercanos se ralentizan un {slow}%.'
    },
    glacialCharge: {
      name: 'Carga glacial',
      desc: 'Embiste al objetivo: {dmg}% de daño de Fuerza, y lo congela durante {freeze}s.'
    },
    frozenHeart: {
      name: 'Corazón helado',
      desc: '+{hp}% de vida máxima, y todo el daño que recibes se reduce un {reduce}%.'
    },
    rimeField: {
      name: 'Campo de escarcha',
      desc: 'Suelo helado durante {dur}s: {dmg}% de daño de Inteligencia. Los enemigos enfriados en él se congelan durante {freeze}s.'
    },
    frostShatter: {
      name: 'Estallido helado',
      desc: '{dmg}% de daño de Fuerza a {radius} m: +{chilled}% a enemigos ralentizados, +{frozen}% a los congelados.'
    },
    shatterpoint: {
      name: 'Punto de quiebre',
      desc: 'Haces un {bonus}% más de daño a los enemigos ralentizados y congelados.'
    },
    avalancheLeap: {
      name: 'Salto avalancha',
      desc: 'Salta hacia donde apuntes y cae como una avalancha: {dmg}% de daño de Fuerza, y derriba a los enemigos.'
    },
    iceborn: {
      name: 'Sangre de hielo',
      desc: 'Nada puede empujarte ni lanzarte. Los aturdimientos sobre ti duran un {cut}% menos.'
    },
    absoluteZero: {
      name: 'Cero absoluto',
      desc: 'El invierno estalla desde ti: {dmg}% de daño de Inteligencia a {radius} m, y todo se congela durante {freeze}s.'
    },
    sunbolt: {
      name: 'Rayo solar',
      desc: 'Un rayo de sol con {dmg}% de daño de Inteligencia. El objetivo deslumbrado hace un {weaken}% menos durante {dur}s.'
    },
    mendingLight: {
      name: 'Luz sanadora',
      desc: 'Cura un {heal}% de Carisma al instante y luego un {regen}% de tu vida por segundo durante {dur}s.'
    },
    kindledHope: {
      name: 'Esperanza encendida',
      desc: 'Toda la curación que recibes es un {heal}% más fuerte.'
    },
    lanceOfLight: {
      name: 'Lanza de luz',
      desc: 'Un haz de luz: {dmg}% de daño de Inteligencia en línea. Cura un {heal}% de vida por cada enemigo alcanzado.'
    },
    dawnShield: {
      name: 'Escudo del alba',
      desc: 'Elimina todos tus efectos negativos y obtén un escudo del {shield}% de Carisma durante {dur}s.'
    },
    haloWard: {
      name: 'Halo protector',
      desc: 'Todo el daño que recibes se reduce un {reduce}%.'
    },
    dawnSanctuary: {
      name: 'Santuario del alba',
      desc: 'Suelo sagrado durante {dur}s: te cura un {heal}% de Carisma por segundo, y los enemigos reciben {dmg}% de Inteligencia.'
    },
    blindingFlash: {
      name: 'Destello cegador',
      desc: 'Un destello de luz: los enemigos a {radius} m huyen durante {fear}s y hacen un {weaken}% menos durante {dur}s.'
    },
    guardianLight: {
      name: 'Luz guardiana',
      desc: 'Un golpe que te derrotaría te deja con 1 de vida e intocable durante {dur}s. Una vez cada {icd}s.'
    },
    sunfall: {
      name: 'Caída solar',
      desc: 'Un pilar de luz solar cae sobre el objetivo: {dmg}% de daño de Inteligencia. Los enemigos reciben un {vuln}% más durante {dur}s.'
    },
    searingLight: {
      name: 'Luz abrasadora',
      desc: '+{crit}% de probabilidad de Crítico con hechizos y +{critDmg}% de Daño crítico.'
    },
    haloOfDawn: {
      name: 'Halo del alba',
      desc: 'Brilla durante {dur}s: cada segundo, {dmg}% de daño de Inteligencia a {radius} m, y te curas un {heal}% de vida.'
    },
    callWolf: {
      name: 'Llamar lobo',
      desc: 'Un lobo espiritual se une a ti y muerde con {dmg}% de daño de Carisma. Hasta {max} a la vez.'
    },
    wolfPounce: {
      name: 'Salto del lobo',
      desc: 'Tus lobos saltan sobre el objetivo: {dmg}% de daño de Carisma cada uno, y lo derriban durante {down}s.'
    },
    wildKinship: {
      name: 'Lazo salvaje',
      desc: 'Tus compañeros tienen un {hp}% más de vida y hacen un {dmg}% más de daño.'
    },
    callHawk: {
      name: 'Llamar halcón',
      desc: 'Un halcón se lanza sobre el objetivo: {dmg}% de daño de Carisma, y recibe un {vuln}% más durante {dur}s. Se queda {life}s.'
    },
    callBear: {
      name: 'Llamar oso',
      desc: 'Un oso espiritual se une a ti. Golpea con {dmg}% de daño y mantiene ocupados a los enemigos. Hasta {max}.'
    },
    thickHide: {
      name: 'Piel gruesa',
      desc: '+{hp}% de vida máxima y +{regen} de regeneración de vida por segundo.'
    },
    packBond: {
      name: 'Vínculo de manada',
      desc: 'Tú y tus compañeros a {radius} m regeneráis un {regen}% de vida por segundo y ganáis un {def}% de Defensa durante {dur}s.'
    },
    spiritStampede: {
      name: 'Estampida espiritual',
      desc: 'Una manada de bestias espirituales carga: {dmg}% de daño de Carisma en línea, y derriba a los enemigos.'
    },
    packTactics: {
      name: 'Tácticas de manada',
      desc: 'Haces un {bonus}% más de daño por cada compañero que tengas contigo, hasta {max}.'
    },
    alphaHowl: {
      name: 'Aullido alfa',
      desc: 'Tus compañeros se curan un {heal}% y luchan un {rage}% más fuerte durante {dur}s. Los enemigos cercanos huyen.'
    },
    leaderOfThePack: {
      name: 'Líder de la manada',
      desc: 'Tus compañeros atacan un {speed}% más rápido y hacen un {dmg}% más de daño.'
    },
    wildHunt: {
      name: 'Cacería salvaje',
      desc: '{wolves} lobos más corren contigo durante {dur}s. Toda la manada hace +{dmg}% de daño y se mueve un {move}% más rápido.'
    },
    prismBolt: {
      name: 'Rayo prismático',
      desc: 'Un proyectil de {dmg}% de daño de Inteligencia: escarcha si el objetivo arde, si no, fuego. Cada uno activa al otro.'
    },
    elementalHarmony: {
      name: 'Armonía elemental',
      desc: 'Tus reacciones (Fusión, Vapor, Quiebre, Sobrecarga, Cristal) son un {pct}% más fuertes.'
    },
    frostLance: {
      name: 'Lanza de hielo',
      desc: 'Hielo en línea: {dmg}% de daño de Inteligencia y ralentiza un {slow}% durante {dur}s. Los enemigos en llamas provocan Vapor.'
    },
    chainSpark: {
      name: 'Chispa en cadena',
      desc: 'Un rayo de {dmg}% de Inteligencia que salta a {jumps} enemigos más. Quiebra el hielo, sobrecarga el fuego.'
    },
    smolderingCore: {
      name: 'Núcleo ardiente',
      desc: 'Tus quemaduras hacen un {burn}% más de daño, y tienes {mana} más de maná.'
    },
    rollingBoulder: {
      name: 'Pedrusco rodante',
      desc: 'Rueda una roca: {dmg}% de daño de Inteligencia, derribo de {down}s. Los enemigos marcados te dan un escudo.'
    },
    thunderSnow: {
      name: 'Nevada de truenos',
      desc: 'Una tormenta de nieve durante {dur}s: {dmg}% de daño helado de Inteligencia, y un rayo cada segundo de {bolt}%.'
    },
    spellweave: {
      name: 'Tejehechizos',
      desc: '+{crit}% de probabilidad de Crítico con hechizos, y tus habilidades cuestan un {mana}% menos de maná.'
    },
    prismaticNova: {
      name: 'Nova prismática',
      desc: 'Golpea todo a {radius} m con {dmg}% de Inteligencia, a cada uno con el elemento con el que reacciona.'
    },
    prismaticWard: {
      name: 'Guarda prismática',
      desc: 'Recibes un {reduce}% menos de daño y tienes un {hp}% más de vida.'
    },
    frostfireComet: {
      name: 'Cometa de fuego helado',
      desc: 'Un cometa de fuego y hielo: {dmg}% de daño de Inteligencia. Los enemigos quedan ardiendo y ralentizados.'
    },
    elementalConvergence: {
      name: 'Convergencia elemental',
      desc: 'Durante {dur}s, cuatro elementos se turnan: {strikes} golpes de {dmg}% de Inteligencia que se activan entre sí.'
    },
    wispBolt: {
      name: 'Proyectil fatuo',
      desc: 'Un fuego fatuo con {dmg}% de daño de Inteligencia. El enemigo al que derrote se alza como tu espíritu durante {life}s.'
    },
    kindredSpirits: {
      name: 'Espíritus afines',
      desc: 'Tus espíritus y esbirros tienen un {hp}% más de vida y atacan un {speed}% más rápido.'
    },
    callTheFallen: {
      name: 'Llamar a los caídos',
      desc: 'Hasta {max} enemigos recién caídos a {radius} m se alzan como tus espíritus durante {life}s.'
    },
    soulBond: {
      name: 'Vínculo de almas',
      desc: 'Gánate a un enemigo: {chance}% ({low}% si está herido) de que se una a ti como espíritu {life}s. Si no, {dmg}% de daño.'
    },
    restlessSouls: {
      name: 'Almas inquietas',
      desc: 'Un enemigo que derrotas tiene un {chance}% de probabilidad de alzarse como tu espíritu durante {life}s.'
    },
    spiritLantern: {
      name: 'Farol de espíritus',
      desc: 'Un farol durante {dur}s: los enemigos en su luz reciben {dmg}% de Inteligencia, los amigos se curan, los caídos se alzan.'
    },
    hauntingWail: {
      name: 'Lamento fantasmal',
      desc: 'Un ¡BU! fantasmal: {dmg}% de daño de Inteligencia a {radius} m, y los enemigos huyen durante {fear}s.'
    },
    wardensVigil: {
      name: 'Vigilia del guardián',
      desc: 'Tus espíritus y esbirros hacen un {dmg}% más de daño, y tú recibes un {reduce}% menos.'
    },
    releaseSouls: {
      name: 'Liberar almas',
      desc: 'Tus espíritus vuelven a casa en destellos de luz: {dmg}% de Inteligencia alrededor de cada uno y recuperas un {heal}% de vida por cada uno.'
    },
    lanternKeeper: {
      name: 'Guardafaroles',
      desc: 'Enfriamientos un {cdr}% más cortos, y tus habilidades cuestan un {mana}% menos de maná.'
    },
    wispSwarm: {
      name: 'Enjambre fatuo',
      desc: '{wisps} fuegos fatuos se lanzan sobre los enemigos de la zona: {dmg}% de Inteligencia en total. Los que derrotan se alzan.'
    },
    processionOfSouls: {
      name: 'Procesión de almas',
      desc: 'Durante {dur}s, cada enemigo que cae cerca de ti se alza como tu espíritu, y los espíritus hacen un {atk}% más.'
    },
    palmStrike: {
      name: 'Golpe de palma',
      desc: 'Una palma veloz con {dmg}% de daño de Destreza que empuja al enemigo. Genera {chi} de chi.'
    },
    ironBody: {
      name: 'Cuerpo de hierro',
      desc: 'El daño físico que recibes se reduce un {reduce}%, y tienes un {hp}% más de vida.'
    },
    flyingKick: {
      name: 'Patada voladora',
      desc: 'Vuela hacia el objetivo y patea con {dmg}% de daño de Destreza; los enemigos en el camino reciben un {path}%. Genera {chi} de chi.'
    },
    tigerStance: {
      name: 'Postura del tigre',
      desc: 'Durante {dur}s: +{dmg}% de daño y +{speed}% de velocidad de ataque. Termina la Postura de la grulla.'
    },
    craneStance: {
      name: 'Postura de la grulla',
      desc: 'Durante {dur}s: +{def}% de Defensa, y te curas un {regen}% de vida por segundo. Termina la Postura del tigre.'
    },
    flowingFists: {
      name: 'Puños fluidos',
      desc: 'Tus ataques tienen un {chance}% de probabilidad de generar chi.'
    },
    hundredFists: {
      name: 'Cien puños',
      desc: 'Una ráfaga de {hits} golpes con {dmg}% de daño de Destreza en total. Genera {chi} de chi.'
    },
    risingDragon: {
      name: 'Dragón ascendente',
      desc: 'Gasta todo tu chi en un gancho: {dmg}% de daño de Destreza, +{per}% por cada chi. El enemigo sale volando.'
    },
    cranesGrace: {
      name: 'Gracia de la grulla',
      desc: '+{dodge}% de Esquiva, y los aturdimientos y derribos sobre ti duran un {cut}% menos.'
    },
    whirlwindKick: {
      name: 'Patada torbellino',
      desc: 'Patea dos veces todo lo que haya a {radius} m con {dmg}% de daño de Destreza en total. Genera hasta {chi} de chi.'
    },
    tigersFury: {
      name: 'Furia del tigre',
      desc: '+{crit}% de probabilidad de Crítico y +{speed}% de velocidad de ataque.'
    },
    mountainPalm: {
      name: 'Palma de la montaña',
      desc: 'Gasta todo tu chi: una palma gigante cae con {dmg}% de daño de Destreza, +{per}% por cada chi, y derriba a los enemigos.'
    },
    sharpNote: {
      name: 'Nota aguda',
      desc: 'Una nota aguda con {dmg}% de daño de Carisma. El enemigo hace un {weaken}% menos de daño durante {dur}s.'
    },
    stagePresence: {
      name: 'Presencia escénica',
      desc: 'Tus habilidades cuestan un {mana}% menos de maná, y te mueves un {move}% más rápido.'
    },
    marchingSong: {
      name: 'Canción de marcha',
      desc: 'Una canción durante {dur}s: tú y tus aliados a {radius} m os movéis un {move}% y atacáis un {speed}% más rápido.'
    },
    lullaby: {
      name: 'Nana',
      desc: 'Una melodía suave en cono: cada enemigo al que alcanza se duerme durante {dur}s.'
    },
    longRefrain: {
      name: 'Estribillo largo',
      desc: 'Tus canciones duran un {pct}% más.'
    },
    balladOfValor: {
      name: 'Balada del valor',
      desc: 'Una canción durante {dur}s: tú y tus aliados a {radius} m hacéis un {dmg}% más de daño y ganáis un {def}% de Defensa.'
    },
    charmingSerenade: {
      name: 'Serenata hechizante',
      desc: 'Hechiza al objetivo y a los enemigos a {radius} m: durante {dur}s, luchan entre ellos.'
    },
    virtuoso: {
      name: 'Virtuoso',
      desc: 'Enfriamientos un {cdr}% más cortos y +{critDmg}% de Daño crítico.'
    },
    hymnOfMending: {
      name: 'Himno sanador',
      desc: 'Elimina los efectos negativos y, durante {dur}s, tú y tus aliados a {radius} m os curáis un {regen}% de vida por segundo.'
    },
    crescendo: {
      name: 'Crescendo',
      desc: 'Una explosión de sonido a {radius} m: {dmg}% de daño de Carisma, +{per}% por cada canción que estés tocando.'
    },
    standingOvation: {
      name: 'Ovación en pie',
      desc: '+{dmg}% de daño, y recibes un {reduce}% menos de daño.'
    },
    grandFinale: {
      name: 'Gran final',
      desc: 'Tócalo todo durante {dur}s (+{buff}% de velocidad, daño y Defensa) y luego un último acorde: {dmg}% de Carisma, enemigos hechizados.'
    }
  },
  slot: {
    main: 'Mano principal',
    off: 'Mano secundaria',
    head: 'Cabeza',
    body: 'Armadura',
    hands: 'Manos',
    feet: 'Pies',
    trinket: 'Abalorio'
  },
  tier: {
    '7': 'Mítico',
    '1': 'Común',
    '2': 'Poco común',
    '3': 'Raro',
    '4': 'Épico',
    '5': 'Heroico',
    '6': 'Legendario'
  },
  weapon: {
    melee: 'Cuerpo a cuerpo · escala con {attr}',
    ranged: 'A distancia · escala con {attr}',
    magic: 'Magia · escala con {attr}'
  },
  source: {
    'siege': "Ganado en el Asedio del Paso del Bastión.",
    'infernal': "Un gemelo infernal: cae en {zone} invadido o lo forja un herrero.",
    arena: 'Ganado en el Coliseo.',
    smith: 'Forjado en una herrería.',
    mob: '{zone}: lo sueltan los monstruos.',
    chest: '{zone}: se encuentra en los cofres.',
    boss: '{zone}: lo suelta el jefe.',
    secret: '{zone}: oculto en un cofre secreto.'
  },
  mod: {
    'demonBane': "+{n}% de daño contra demonios",
    'demonLeech': "El {n}% del daño a demonios te cura",
    'beastBane': "+{n}% de daño contra bestias míticas",
    'fireWard': "{n}% menos de daño de fuego recibido",
    'shadowWard': "{n}% menos de daño de sombra recibido",
    'demonWard': "{n}% menos de daño de los demonios",
    'pylonBreaker': "+{n}% de daño contra pilones demoníacos",
    'glassFinder': "{n}% de probabilidad de que un demonio abatido deje cristal demoníaco extra",
    'waterWalk': "El agua no te ralentiza",
    str: '+{n} de Fuerza',
    dex: '+{n} de Destreza',
    int: '+{n} de Inteligencia',
    end: '+{n} de Aguante',
    skl: '+{n} de Técnica',
    cha: '+{n} de Carisma',
    allAttrs: '+{n} a todos los atributos',
    strOrDex: '+{n} de Fuerza o Destreza, la que sea mayor',
    armor: '{n} de Armadura',
    armorPct: '+{n}% de Armadura',
    armorFromStr: 'Armadura por Fuerza: +{n}%',
    block: '+{n}% de probabilidad de Bloqueo',
    dodge: '+{n}% de Esquiva',
    damageReduction: '+{n}% de reducción de daño',
    physReduction: '{n}% menos de daño físico recibido',
    maxHp: '+{n} de Vida máxima',
    maxHpPct: '+{n}% de Vida máxima',
    maxMana: '+{n} de Maná máximo',
    hpRegen: '+{n} de Vida por segundo',
    stunDurationCut: 'Los aturdimientos que sufres duran un {n}% menos',
    damagePct: '+{n}% de daño infligido',
    critChance: '+{n}% de probabilidad de Crítico',
    critDamage: '+{n}% de daño Crítico',
    spellCrit: '+{n}% de probabilidad de Crítico con hechizos',
    attackSpeed: '+{n}% de velocidad de ataque',
    moveSpeed: '+{n}% de velocidad de movimiento',
    cdr: 'Los enfriamientos duran un {n}% menos',
    manaDiscount: 'Los hechizos cuestan un {n}% menos de maná',
    lifesteal: '+{n}% de robo de vida con todo el daño',
    physLifesteal: '+{n}% de robo de vida con golpes físicos',
    lifeDrainPct: 'El drenaje de vida es un {n}% más fuerte',
    bossDamage: '+{n}% de daño contra jefes',
    backstab: '+{n}% de daño por la espalda',
    minionDamage: 'Los esbirros infligen +{n}% de daño',
    minionAttackSpeed: 'Los esbirros atacan un {n}% más rápido',
    minionHp: 'Los esbirros tienen +{n}% de vida',
    burnOnHit: 'Los ataques aplican una Quemadura de {n} de daño',
    freezeOnHit: 'Los ataques tienen un {n}% de probabilidad de congelar',
    pierce: 'Los disparos atraviesan a {n} enemigos más',
    critCooldown: 'Los golpes críticos reducen todos los enfriamientos en {n}s',
    extraBlastEvery: 'Una descarga de energía extra cada {n} disparos',
    reflectOnBlock: 'Un bloqueo refleja {n} de daño',
    fatalSave: 'El daño mortal te vuelve invulnerable durante {n}s en vez de matarte (una vez cada 120s)',
    knockbackImmune: 'Inmune al empuje',
    heatBuildCut: 'El calor sube un {n}% más despacio',
    heatDissipation: 'El calor baja un {n}% más rápido',
    flaskDamage: 'Frasco sanguíneo inflige +{n}% de daño',
    igniteBonus: 'Los hechizos de fuego queman un {n}% más',
    stealthy: 'Se mueve en silencio: los enemigos te detectan desde un {n}% menos de distancia',
    fortitude: 'Los golpes fuertes dan un escudo del {n}% de la vida',
    evasionHaste: 'Una esquiva otorga {n}% de Celeridad',
    cauterize: 'Los enemigos en llamas te infligen un {n}% menos de daño',
    pyromaniac: 'Los hechizos críticos reducen los enfriamientos de fuego en {n}s',
    tribute: 'Los esbirros reciben el {n}% de tu daño',
    timeDistort: 'El {n}% del daño recibido se retrasa',
    entropy: 'Lanzar hechizos acorta los enfriamientos un {n}%',
    bloodToMana: 'El {n}% del daño físico recibido vuelve como maná',
    bleedHeal: 'Golpear a un enemigo que sangra cura un {n}% de vida',
    overheatCrit: '+{n}% de daño Crítico mientras estás sobrecalentado',
    lowHealthDamage: 'Hasta +{n}% de daño a medida que baja tu salud',
    heatArmor: '{n}% menos de daño recibido mientras el calor esté a la mitad o más',
    crumble: '+{n}% de daño a enemigos ralentizados, derribados o petrificados',
    lastStand: '{n}% menos de daño recibido por debajo del 30% de salud',
    wildfire: 'Un enemigo en llamas que cae prende a los enemigos a {n} m',
    loyalty: 'Un esbirro caído te cura un {n}% de salud',
    chillOnHit: 'Los golpes básicos ralentizan un {n}% durante 2 s',
    chillDamage: '+{n}% de daño a enemigos ralentizados o congelados',
    healPower: 'La curación que recibes es un {n}% más fuerte',
    packDamage: '+{n}% de daño por cada compañero vivo (hasta 4)',
    reactionDamage: 'Las reacciones elementales son un {n}% más fuertes',
    soulRise: 'Los enemigos derrotados tienen un {n}% de probabilidad de alzarse como tu espíritu',
    chiOnHit: 'Los ataques tienen un {n}% de probabilidad de generar chi',
    songLength: 'Las canciones duran un {n}% más'
  },
  item: {
    'chimeraMane': { 'name': "Melena de quimera" },
    'triFang': { 'name': "Trícolmillo" },
    'warchiefsLongbowGun': { 'name': "Arco-fusil del caudillo" },
    'hoofbreakerGreaves': { 'name': "Grebas rompecascos" },
    'eyeOfTheDeep': { 'name': "Ojo de las profundidades" },
    'beamSplitter': { 'name': "Partehaces" },
    'riddleCrown': { 'name': "Corona del enigma" },
    'sandglassWand': { 'name': "Varita de reloj de arena" },
    'leviathanScale': { 'name': "Escama de leviatán" },
    'tidecallerStaff': { 'name': "Bastón del llamamareas" },
    'hydraScaleGauntlets': { 'name': "Guanteletes de escamas de hidra" },
    'manyHeadedFlail': { 'name': "Mangual de muchas cabezas" },
    'heartOfTheElderDragon': { 'name': "Corazón del Dragón Anciano" },
    'dragonboneGreatsword': { 'name': "Mandoble de hueso de dragón" },
    'bastionBanner': { 'name': "Estandarte del Bastión" },
    'wallwardensPlate': { 'name': "Coraza del guardamuros" },
    'gatebreaker': { 'name': "Rompepuertas" },
    'crownOfTheLastBastion': { 'name': "Corona del último Bastión" },
    heartOfTheArena: {
      name: 'Corazón de la Arena'
    },
    mantleOfTheUndefeated: {
      name: 'Coraza del Invicto'
    },
    crimsonBulwark: {
      name: 'Baluarte Carmesí'
    },
    sandstriderGreaves: {
      name: 'Grebas del Caminante de Arena'
    },
    gripsOfTheGladiator: {
      name: 'Guanteletes del Gladiador'
    },
    laurelOfTheVictor: {
      name: 'Laurel del Vencedor'
    },
    smithMasterMithrilGreaves: {
      name: 'Grebas de mithril magistrales'
    },
    smithMasterAdamantGreaves: {
      name: 'Grebas de adamantita magistrales'
    },
    smithMasterAetheriteGreaves: {
      name: 'Grebas de eterita magistrales'
    },
    smithMithrilGreaves: {
      name: 'Grebas de mithril'
    },
    smithAdamantGreaves: {
      name: 'Grebas de adamantita'
    },
    smithAetheriteGreaves: {
      name: 'Grebas de eterita'
    },
    smithMasterMithrilPlate: {
      name: 'Coraza de mithril magistral'
    },
    smithMasterAdamantPlate: {
      name: 'Coraza de adamantita magistral'
    },
    smithMasterAetheritePlate: {
      name: 'Coraza de eterita magistral'
    },
    smithMithrilPlate: {
      name: 'Coraza de mithril'
    },
    smithAdamantPlate: {
      name: 'Coraza de adamantita'
    },
    smithAetheritePlate: {
      name: 'Coraza de eterita'
    },
    smithMasterMithrilHelm: {
      name: 'Yelmo de mithril magistral'
    },
    smithMasterAdamantHelm: {
      name: 'Yelmo de adamantita magistral'
    },
    smithMasterAetheriteHelm: {
      name: 'Yelmo de eterita magistral'
    },
    smithMithrilHelm: {
      name: 'Yelmo de mithril'
    },
    smithAdamantHelm: {
      name: 'Yelmo de adamantita'
    },
    smithAetheriteHelm: {
      name: 'Yelmo de eterita'
    },
    smithMasterMithrilShield: {
      name: 'Escudo de mithril magistral'
    },
    smithMasterAdamantShield: {
      name: 'Escudo de adamantita magistral'
    },
    smithMasterAetheriteShield: {
      name: 'Escudo de eterita magistral'
    },
    smithMithrilShield: {
      name: 'Escudo de mithril'
    },
    smithAdamantShield: {
      name: 'Escudo de adamantita'
    },
    smithAetheriteShield: {
      name: 'Escudo de eterita'
    },
    smithMasterMithrilHammer: {
      name: 'Martillo de mithril magistral'
    },
    smithMasterAdamantHammer: {
      name: 'Martillo de adamantita magistral'
    },
    smithMasterAetheriteHammer: {
      name: 'Martillo de eterita magistral'
    },
    smithMithrilHammer: {
      name: 'Martillo de mithril'
    },
    smithAdamantHammer: {
      name: 'Martillo de adamantita'
    },
    smithAetheriteHammer: {
      name: 'Martillo de eterita'
    },
    smithMasterMithrilSword: {
      name: 'Espada de mithril magistral'
    },
    smithMasterAdamantSword: {
      name: 'Espada de adamantita magistral'
    },
    smithMasterAetheriteSword: {
      name: 'Espada de eterita magistral'
    },
    smithMithrilSword: {
      name: 'Espada de mithril'
    },
    smithAdamantSword: {
      name: 'Espada de adamantita'
    },
    smithAetheriteSword: {
      name: 'Espada de eterita'
    },
    smithMasterGoldGreaves: {
      name: 'Grebas de oro magistrales'
    },
    smithGoldGreaves: {
      name: 'Grebas de oro'
    },
    smithMasterGoldPlate: {
      name: 'Coraza de oro magistral'
    },
    smithGoldPlate: {
      name: 'Coraza de oro'
    },
    smithMasterGoldHelm: {
      name: 'Yelmo de oro magistral'
    },
    smithGoldHelm: {
      name: 'Yelmo de oro'
    },
    smithMasterGoldShield: {
      name: 'Escudo de oro magistral'
    },
    smithGoldShield: {
      name: 'Escudo de oro'
    },
    smithMasterGoldHammer: {
      name: 'Martillo de oro magistral'
    },
    smithGoldHammer: {
      name: 'Martillo de oro'
    },
    smithMasterGoldSword: {
      name: 'Espada de oro magistral'
    },
    smithGoldSword: {
      name: 'Espada de oro'
    },
    smithMasterSilverGreaves: {
      name: 'Grebas de plata magistrales'
    },
    smithSilverGreaves: {
      name: 'Grebas de plata'
    },
    smithMasterSilverPlate: {
      name: 'Coraza de plata magistral'
    },
    smithSilverPlate: {
      name: 'Coraza de plata'
    },
    smithMasterSilverHelm: {
      name: 'Yelmo de plata magistral'
    },
    smithSilverHelm: {
      name: 'Yelmo de plata'
    },
    smithMasterSilverShield: {
      name: 'Escudo de plata magistral'
    },
    smithSilverShield: {
      name: 'Escudo de plata'
    },
    smithMasterSilverHammer: {
      name: 'Martillo de plata magistral'
    },
    smithSilverHammer: {
      name: 'Martillo de plata'
    },
    smithMasterSilverSword: {
      name: 'Espada de plata magistral'
    },
    smithSilverSword: {
      name: 'Espada de plata'
    },
    smithMasterIronGreaves: {
      name: 'Grebas de hierro magistrales'
    },
    smithIronGreaves: {
      name: 'Grebas de hierro'
    },
    smithMasterIronPlate: {
      name: 'Coraza de hierro magistral'
    },
    smithIronPlate: {
      name: 'Coraza de hierro'
    },
    smithMasterIronHelm: {
      name: 'Yelmo de hierro magistral'
    },
    smithIronHelm: {
      name: 'Yelmo de hierro'
    },
    smithMasterIronShield: {
      name: 'Escudo de hierro magistral'
    },
    smithIronShield: {
      name: 'Escudo de hierro'
    },
    smithMasterIronHammer: {
      name: 'Martillo de hierro magistral'
    },
    smithIronHammer: {
      name: 'Martillo de hierro'
    },
    smithMasterIronSword: {
      name: 'Espada de hierro magistral'
    },
    smithMasterDexIronSword: {
      name: 'Daga de hierro magistral · DES'
    },
    smithDexIronSword: {
      name: 'Daga de hierro · DES'
    },
    smithMasterDexIronHammer: {
      name: 'Estoque de hierro magistral · DES'
    },
    smithDexIronHammer: {
      name: 'Estoque de hierro · DES'
    },
    smithMasterDexIronShield: {
      name: 'Broquel de hierro magistral · DES'
    },
    smithDexIronShield: {
      name: 'Broquel de hierro · DES'
    },
    smithMasterDexIronHelm: {
      name: 'Capucha de hierro magistral · DES'
    },
    smithDexIronHelm: {
      name: 'Capucha de hierro · DES'
    },
    smithMasterDexIronPlate: {
      name: 'Jubón de hierro magistral · DES'
    },
    smithDexIronPlate: {
      name: 'Jubón de hierro · DES'
    },
    smithMasterDexIronGreaves: {
      name: 'Botas de hierro magistral · DES'
    },
    smithDexIronGreaves: {
      name: 'Botas de hierro · DES'
    },
    smithMasterDexSilverSword: {
      name: 'Daga de plata magistral · DES'
    },
    smithDexSilverSword: {
      name: 'Daga de plata · DES'
    },
    smithMasterDexSilverHammer: {
      name: 'Estoque de plata magistral · DES'
    },
    smithDexSilverHammer: {
      name: 'Estoque de plata · DES'
    },
    smithMasterDexSilverShield: {
      name: 'Broquel de plata magistral · DES'
    },
    smithDexSilverShield: {
      name: 'Broquel de plata · DES'
    },
    smithMasterDexSilverHelm: {
      name: 'Capucha de plata magistral · DES'
    },
    smithDexSilverHelm: {
      name: 'Capucha de plata · DES'
    },
    smithMasterDexSilverPlate: {
      name: 'Jubón de plata magistral · DES'
    },
    smithDexSilverPlate: {
      name: 'Jubón de plata · DES'
    },
    smithMasterDexSilverGreaves: {
      name: 'Botas de plata magistral · DES'
    },
    smithDexSilverGreaves: {
      name: 'Botas de plata · DES'
    },
    smithMasterDexGoldSword: {
      name: 'Daga de oro magistral · DES'
    },
    smithDexGoldSword: {
      name: 'Daga de oro · DES'
    },
    smithMasterDexGoldHammer: {
      name: 'Estoque de oro magistral · DES'
    },
    smithDexGoldHammer: {
      name: 'Estoque de oro · DES'
    },
    smithMasterDexGoldShield: {
      name: 'Broquel de oro magistral · DES'
    },
    smithDexGoldShield: {
      name: 'Broquel de oro · DES'
    },
    smithMasterDexGoldHelm: {
      name: 'Capucha de oro magistral · DES'
    },
    smithDexGoldHelm: {
      name: 'Capucha de oro · DES'
    },
    smithMasterDexGoldPlate: {
      name: 'Jubón de oro magistral · DES'
    },
    smithDexGoldPlate: {
      name: 'Jubón de oro · DES'
    },
    smithMasterDexGoldGreaves: {
      name: 'Botas de oro magistral · DES'
    },
    smithDexGoldGreaves: {
      name: 'Botas de oro · DES'
    },
    smithMasterDexMithrilSword: {
      name: 'Daga de mithril magistral · DES'
    },
    smithMasterDexAdamantSword: {
      name: 'Daga de adamantita magistral · DES'
    },
    smithMasterDexAetheriteSword: {
      name: 'Daga de eterita magistral · DES'
    },
    smithDexMithrilSword: {
      name: 'Daga de mithril · DES'
    },
    smithDexAdamantSword: {
      name: 'Daga de adamantita · DES'
    },
    smithDexAetheriteSword: {
      name: 'Daga de eterita · DES'
    },
    smithMasterDexMithrilHammer: {
      name: 'Estoque de mithril magistral · DES'
    },
    smithMasterDexAdamantHammer: {
      name: 'Estoque de adamantita magistral · DES'
    },
    smithMasterDexAetheriteHammer: {
      name: 'Estoque de eterita magistral · DES'
    },
    smithDexMithrilHammer: {
      name: 'Estoque de mithril · DES'
    },
    smithDexAdamantHammer: {
      name: 'Estoque de adamantita · DES'
    },
    smithDexAetheriteHammer: {
      name: 'Estoque de eterita · DES'
    },
    smithMasterDexMithrilShield: {
      name: 'Broquel de mithril magistral · DES'
    },
    smithMasterDexAdamantShield: {
      name: 'Broquel de adamantita magistral · DES'
    },
    smithMasterDexAetheriteShield: {
      name: 'Broquel de eterita magistral · DES'
    },
    smithDexMithrilShield: {
      name: 'Broquel de mithril · DES'
    },
    smithDexAdamantShield: {
      name: 'Broquel de adamantita · DES'
    },
    smithDexAetheriteShield: {
      name: 'Broquel de eterita · DES'
    },
    smithMasterDexMithrilHelm: {
      name: 'Capucha de mithril magistral · DES'
    },
    smithMasterDexAdamantHelm: {
      name: 'Capucha de adamantita magistral · DES'
    },
    smithMasterDexAetheriteHelm: {
      name: 'Capucha de eterita magistral · DES'
    },
    smithDexMithrilHelm: {
      name: 'Capucha de mithril · DES'
    },
    smithDexAdamantHelm: {
      name: 'Capucha de adamantita · DES'
    },
    smithDexAetheriteHelm: {
      name: 'Capucha de eterita · DES'
    },
    smithMasterDexMithrilPlate: {
      name: 'Jubón de mithril magistral · DES'
    },
    smithMasterDexAdamantPlate: {
      name: 'Jubón de adamantita magistral · DES'
    },
    smithMasterDexAetheritePlate: {
      name: 'Jubón de eterita magistral · DES'
    },
    smithDexMithrilPlate: {
      name: 'Jubón de mithril · DES'
    },
    smithDexAdamantPlate: {
      name: 'Jubón de adamantita · DES'
    },
    smithDexAetheritePlate: {
      name: 'Jubón de eterita · DES'
    },
    smithMasterDexMithrilGreaves: {
      name: 'Botas de mithril magistral · DES'
    },
    smithMasterDexAdamantGreaves: {
      name: 'Botas de adamantita magistral · DES'
    },
    smithMasterDexAetheriteGreaves: {
      name: 'Botas de eterita magistral · DES'
    },
    smithDexMithrilGreaves: {
      name: 'Botas de mithril · DES'
    },
    smithDexAdamantGreaves: {
      name: 'Botas de adamantita · DES'
    },
    smithDexAetheriteGreaves: {
      name: 'Botas de eterita · DES'
    },
    smithMasterIntIronSword: {
      name: 'Varita de hierro magistral · INT'
    },
    smithIntIronSword: {
      name: 'Varita de hierro · INT'
    },
    smithMasterIntIronHammer: {
      name: 'Bastón de hierro magistral · INT'
    },
    smithIntIronHammer: {
      name: 'Bastón de hierro · INT'
    },
    smithMasterIntIronShield: {
      name: 'Tomo de hierro magistral · INT'
    },
    smithIntIronShield: {
      name: 'Tomo de hierro · INT'
    },
    smithMasterIntIronHelm: {
      name: 'Diadema de hierro magistral · INT'
    },
    smithIntIronHelm: {
      name: 'Diadema de hierro · INT'
    },
    smithMasterIntIronPlate: {
      name: 'Túnica de hierro magistral · INT'
    },
    smithIntIronPlate: {
      name: 'Túnica de hierro · INT'
    },
    smithMasterIntIronGreaves: {
      name: 'Botas de hierro magistral · INT'
    },
    smithIntIronGreaves: {
      name: 'Botas de hierro · INT'
    },
    smithMasterIntSilverSword: {
      name: 'Varita de plata magistral · INT'
    },
    smithIntSilverSword: {
      name: 'Varita de plata · INT'
    },
    smithMasterIntSilverHammer: {
      name: 'Bastón de plata magistral · INT'
    },
    smithIntSilverHammer: {
      name: 'Bastón de plata · INT'
    },
    smithMasterIntSilverShield: {
      name: 'Tomo de plata magistral · INT'
    },
    smithIntSilverShield: {
      name: 'Tomo de plata · INT'
    },
    smithMasterIntSilverHelm: {
      name: 'Diadema de plata magistral · INT'
    },
    smithIntSilverHelm: {
      name: 'Diadema de plata · INT'
    },
    smithMasterIntSilverPlate: {
      name: 'Túnica de plata magistral · INT'
    },
    smithIntSilverPlate: {
      name: 'Túnica de plata · INT'
    },
    smithMasterIntSilverGreaves: {
      name: 'Botas de plata magistral · INT'
    },
    smithIntSilverGreaves: {
      name: 'Botas de plata · INT'
    },
    smithMasterIntGoldSword: {
      name: 'Varita de oro magistral · INT'
    },
    smithIntGoldSword: {
      name: 'Varita de oro · INT'
    },
    smithMasterIntGoldHammer: {
      name: 'Bastón de oro magistral · INT'
    },
    smithIntGoldHammer: {
      name: 'Bastón de oro · INT'
    },
    smithMasterIntGoldShield: {
      name: 'Tomo de oro magistral · INT'
    },
    smithIntGoldShield: {
      name: 'Tomo de oro · INT'
    },
    smithMasterIntGoldHelm: {
      name: 'Diadema de oro magistral · INT'
    },
    smithIntGoldHelm: {
      name: 'Diadema de oro · INT'
    },
    smithMasterIntGoldPlate: {
      name: 'Túnica de oro magistral · INT'
    },
    smithIntGoldPlate: {
      name: 'Túnica de oro · INT'
    },
    smithMasterIntGoldGreaves: {
      name: 'Botas de oro magistral · INT'
    },
    smithIntGoldGreaves: {
      name: 'Botas de oro · INT'
    },
    smithMasterIntMithrilSword: {
      name: 'Varita de mithril magistral · INT'
    },
    smithMasterIntAdamantSword: {
      name: 'Varita de adamantita magistral · INT'
    },
    smithMasterIntAetheriteSword: {
      name: 'Varita de eterita magistral · INT'
    },
    smithIntMithrilSword: {
      name: 'Varita de mithril · INT'
    },
    smithIntAdamantSword: {
      name: 'Varita de adamantita · INT'
    },
    smithIntAetheriteSword: {
      name: 'Varita de eterita · INT'
    },
    smithMasterIntMithrilHammer: {
      name: 'Bastón de mithril magistral · INT'
    },
    smithMasterIntAdamantHammer: {
      name: 'Bastón de adamantita magistral · INT'
    },
    smithMasterIntAetheriteHammer: {
      name: 'Bastón de eterita magistral · INT'
    },
    smithIntMithrilHammer: {
      name: 'Bastón de mithril · INT'
    },
    smithIntAdamantHammer: {
      name: 'Bastón de adamantita · INT'
    },
    smithIntAetheriteHammer: {
      name: 'Bastón de eterita · INT'
    },
    smithMasterIntMithrilShield: {
      name: 'Tomo de mithril magistral · INT'
    },
    smithMasterIntAdamantShield: {
      name: 'Tomo de adamantita magistral · INT'
    },
    smithMasterIntAetheriteShield: {
      name: 'Tomo de eterita magistral · INT'
    },
    smithIntMithrilShield: {
      name: 'Tomo de mithril · INT'
    },
    smithIntAdamantShield: {
      name: 'Tomo de adamantita · INT'
    },
    smithIntAetheriteShield: {
      name: 'Tomo de eterita · INT'
    },
    smithMasterIntMithrilHelm: {
      name: 'Diadema de mithril magistral · INT'
    },
    smithMasterIntAdamantHelm: {
      name: 'Diadema de adamantita magistral · INT'
    },
    smithMasterIntAetheriteHelm: {
      name: 'Diadema de eterita magistral · INT'
    },
    smithIntMithrilHelm: {
      name: 'Diadema de mithril · INT'
    },
    smithIntAdamantHelm: {
      name: 'Diadema de adamantita · INT'
    },
    smithIntAetheriteHelm: {
      name: 'Diadema de eterita · INT'
    },
    smithMasterIntMithrilPlate: {
      name: 'Túnica de mithril magistral · INT'
    },
    smithMasterIntAdamantPlate: {
      name: 'Túnica de adamantita magistral · INT'
    },
    smithMasterIntAetheritePlate: {
      name: 'Túnica de eterita magistral · INT'
    },
    smithIntMithrilPlate: {
      name: 'Túnica de mithril · INT'
    },
    smithIntAdamantPlate: {
      name: 'Túnica de adamantita · INT'
    },
    smithIntAetheritePlate: {
      name: 'Túnica de eterita · INT'
    },
    smithMasterIntMithrilGreaves: {
      name: 'Botas de mithril magistral · INT'
    },
    smithMasterIntAdamantGreaves: {
      name: 'Botas de adamantita magistral · INT'
    },
    smithMasterIntAetheriteGreaves: {
      name: 'Botas de eterita magistral · INT'
    },
    smithIntMithrilGreaves: {
      name: 'Botas de mithril · INT'
    },
    smithIntAdamantGreaves: {
      name: 'Botas de adamantita · INT'
    },
    smithIntAetheriteGreaves: {
      name: 'Botas de eterita · INT'
    },
    smithMasterSklIronSword: {
      name: 'Pistola de hierro magistral · TEC'
    },
    smithSklIronSword: {
      name: 'Pistola de hierro · TEC'
    },
    smithMasterSklIronHammer: {
      name: 'Rifle de hierro magistral · TEC'
    },
    smithSklIronHammer: {
      name: 'Rifle de hierro · TEC'
    },
    smithMasterSklIronShield: {
      name: 'Batería de hierro magistral · TEC'
    },
    smithSklIronShield: {
      name: 'Batería de hierro · TEC'
    },
    smithMasterSklIronHelm: {
      name: 'Gorra de hierro magistral · TEC'
    },
    smithSklIronHelm: {
      name: 'Gorra de hierro · TEC'
    },
    smithMasterSklIronPlate: {
      name: 'Arnés de hierro magistral · TEC'
    },
    smithSklIronPlate: {
      name: 'Arnés de hierro · TEC'
    },
    smithMasterSklIronGreaves: {
      name: 'Botas de hierro magistral · TEC'
    },
    smithSklIronGreaves: {
      name: 'Botas de hierro · TEC'
    },
    smithMasterSklSilverSword: {
      name: 'Pistola de plata magistral · TEC'
    },
    smithSklSilverSword: {
      name: 'Pistola de plata · TEC'
    },
    smithMasterSklSilverHammer: {
      name: 'Rifle de plata magistral · TEC'
    },
    smithSklSilverHammer: {
      name: 'Rifle de plata · TEC'
    },
    smithMasterSklSilverShield: {
      name: 'Batería de plata magistral · TEC'
    },
    smithSklSilverShield: {
      name: 'Batería de plata · TEC'
    },
    smithMasterSklSilverHelm: {
      name: 'Gorra de plata magistral · TEC'
    },
    smithSklSilverHelm: {
      name: 'Gorra de plata · TEC'
    },
    smithMasterSklSilverPlate: {
      name: 'Arnés de plata magistral · TEC'
    },
    smithSklSilverPlate: {
      name: 'Arnés de plata · TEC'
    },
    smithMasterSklSilverGreaves: {
      name: 'Botas de plata magistral · TEC'
    },
    smithSklSilverGreaves: {
      name: 'Botas de plata · TEC'
    },
    smithMasterSklGoldSword: {
      name: 'Pistola de oro magistral · TEC'
    },
    smithSklGoldSword: {
      name: 'Pistola de oro · TEC'
    },
    smithMasterSklGoldHammer: {
      name: 'Rifle de oro magistral · TEC'
    },
    smithSklGoldHammer: {
      name: 'Rifle de oro · TEC'
    },
    smithMasterSklGoldShield: {
      name: 'Batería de oro magistral · TEC'
    },
    smithSklGoldShield: {
      name: 'Batería de oro · TEC'
    },
    smithMasterSklGoldHelm: {
      name: 'Gorra de oro magistral · TEC'
    },
    smithSklGoldHelm: {
      name: 'Gorra de oro · TEC'
    },
    smithMasterSklGoldPlate: {
      name: 'Arnés de oro magistral · TEC'
    },
    smithSklGoldPlate: {
      name: 'Arnés de oro · TEC'
    },
    smithMasterSklGoldGreaves: {
      name: 'Botas de oro magistral · TEC'
    },
    smithSklGoldGreaves: {
      name: 'Botas de oro · TEC'
    },
    smithMasterSklMithrilSword: {
      name: 'Pistola de mithril magistral · TEC'
    },
    smithMasterSklAdamantSword: {
      name: 'Pistola de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteSword: {
      name: 'Pistola de eterita magistral · TEC'
    },
    smithSklMithrilSword: {
      name: 'Pistola de mithril · TEC'
    },
    smithSklAdamantSword: {
      name: 'Pistola de adamantita · TEC'
    },
    smithSklAetheriteSword: {
      name: 'Pistola de eterita · TEC'
    },
    smithMasterSklMithrilHammer: {
      name: 'Rifle de mithril magistral · TEC'
    },
    smithMasterSklAdamantHammer: {
      name: 'Rifle de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteHammer: {
      name: 'Rifle de eterita magistral · TEC'
    },
    smithSklMithrilHammer: {
      name: 'Rifle de mithril · TEC'
    },
    smithSklAdamantHammer: {
      name: 'Rifle de adamantita · TEC'
    },
    smithSklAetheriteHammer: {
      name: 'Rifle de eterita · TEC'
    },
    smithMasterSklMithrilShield: {
      name: 'Batería de mithril magistral · TEC'
    },
    smithMasterSklAdamantShield: {
      name: 'Batería de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteShield: {
      name: 'Batería de eterita magistral · TEC'
    },
    smithSklMithrilShield: {
      name: 'Batería de mithril · TEC'
    },
    smithSklAdamantShield: {
      name: 'Batería de adamantita · TEC'
    },
    smithSklAetheriteShield: {
      name: 'Batería de eterita · TEC'
    },
    smithMasterSklMithrilHelm: {
      name: 'Gorra de mithril magistral · TEC'
    },
    smithMasterSklAdamantHelm: {
      name: 'Gorra de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteHelm: {
      name: 'Gorra de eterita magistral · TEC'
    },
    smithSklMithrilHelm: {
      name: 'Gorra de mithril · TEC'
    },
    smithSklAdamantHelm: {
      name: 'Gorra de adamantita · TEC'
    },
    smithSklAetheriteHelm: {
      name: 'Gorra de eterita · TEC'
    },
    smithMasterSklMithrilPlate: {
      name: 'Arnés de mithril magistral · TEC'
    },
    smithMasterSklAdamantPlate: {
      name: 'Arnés de adamantita magistral · TEC'
    },
    smithMasterSklAetheritePlate: {
      name: 'Arnés de eterita magistral · TEC'
    },
    smithSklMithrilPlate: {
      name: 'Arnés de mithril · TEC'
    },
    smithSklAdamantPlate: {
      name: 'Arnés de adamantita · TEC'
    },
    smithSklAetheritePlate: {
      name: 'Arnés de eterita · TEC'
    },
    smithMasterSklMithrilGreaves: {
      name: 'Botas de mithril magistral · TEC'
    },
    smithMasterSklAdamantGreaves: {
      name: 'Botas de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteGreaves: {
      name: 'Botas de eterita magistral · TEC'
    },
    smithSklMithrilGreaves: {
      name: 'Botas de mithril · TEC'
    },
    smithSklAdamantGreaves: {
      name: 'Botas de adamantita · TEC'
    },
    smithSklAetheriteGreaves: {
      name: 'Botas de eterita · TEC'
    },
    smithMasterChaIronSword: {
      name: 'Cetro de hierro magistral · CAR'
    },
    smithChaIronSword: {
      name: 'Cetro de hierro · CAR'
    },
    smithMasterChaIronHammer: {
      name: 'Estandarte de hierro magistral · CAR'
    },
    smithChaIronHammer: {
      name: 'Estandarte de hierro · CAR'
    },
    smithMasterChaIronShield: {
      name: 'Códice de hierro magistral · CAR'
    },
    smithChaIronShield: {
      name: 'Códice de hierro · CAR'
    },
    smithMasterChaIronHelm: {
      name: 'Corona de hierro magistral · CAR'
    },
    smithChaIronHelm: {
      name: 'Corona de hierro · CAR'
    },
    smithMasterChaIronPlate: {
      name: 'Tabardo de hierro magistral · CAR'
    },
    smithChaIronPlate: {
      name: 'Tabardo de hierro · CAR'
    },
    smithMasterChaIronGreaves: {
      name: 'Botas de hierro magistral · CAR'
    },
    smithChaIronGreaves: {
      name: 'Botas de hierro · CAR'
    },
    smithMasterChaSilverSword: {
      name: 'Cetro de plata magistral · CAR'
    },
    smithChaSilverSword: {
      name: 'Cetro de plata · CAR'
    },
    smithMasterChaSilverHammer: {
      name: 'Estandarte de plata magistral · CAR'
    },
    smithChaSilverHammer: {
      name: 'Estandarte de plata · CAR'
    },
    smithMasterChaSilverShield: {
      name: 'Códice de plata magistral · CAR'
    },
    smithChaSilverShield: {
      name: 'Códice de plata · CAR'
    },
    smithMasterChaSilverHelm: {
      name: 'Corona de plata magistral · CAR'
    },
    smithChaSilverHelm: {
      name: 'Corona de plata · CAR'
    },
    smithMasterChaSilverPlate: {
      name: 'Tabardo de plata magistral · CAR'
    },
    smithChaSilverPlate: {
      name: 'Tabardo de plata · CAR'
    },
    smithMasterChaSilverGreaves: {
      name: 'Botas de plata magistral · CAR'
    },
    smithChaSilverGreaves: {
      name: 'Botas de plata · CAR'
    },
    smithMasterChaGoldSword: {
      name: 'Cetro de oro magistral · CAR'
    },
    smithChaGoldSword: {
      name: 'Cetro de oro · CAR'
    },
    smithMasterChaGoldHammer: {
      name: 'Estandarte de oro magistral · CAR'
    },
    smithChaGoldHammer: {
      name: 'Estandarte de oro · CAR'
    },
    smithMasterChaGoldShield: {
      name: 'Códice de oro magistral · CAR'
    },
    smithChaGoldShield: {
      name: 'Códice de oro · CAR'
    },
    smithMasterChaGoldHelm: {
      name: 'Corona de oro magistral · CAR'
    },
    smithChaGoldHelm: {
      name: 'Corona de oro · CAR'
    },
    smithMasterChaGoldPlate: {
      name: 'Tabardo de oro magistral · CAR'
    },
    smithChaGoldPlate: {
      name: 'Tabardo de oro · CAR'
    },
    smithMasterChaGoldGreaves: {
      name: 'Botas de oro magistral · CAR'
    },
    smithChaGoldGreaves: {
      name: 'Botas de oro · CAR'
    },
    smithMasterChaMithrilSword: {
      name: 'Cetro de mithril magistral · CAR'
    },
    smithMasterChaAdamantSword: {
      name: 'Cetro de adamantita magistral · CAR'
    },
    smithMasterChaAetheriteSword: {
      name: 'Cetro de eterita magistral · CAR'
    },
    smithChaMithrilSword: {
      name: 'Cetro de mithril · CAR'
    },
    smithChaAdamantSword: {
      name: 'Cetro de adamantita · CAR'
    },
    smithChaAetheriteSword: {
      name: 'Cetro de eterita · CAR'
    },
    smithMasterChaMithrilHammer: {
      name: 'Estandarte de mithril magistral · CAR'
    },
    smithMasterChaAdamantHammer: {
      name: 'Estandarte de adamantita magistral · CAR'
    },
    smithMasterChaAetheriteHammer: {
      name: 'Estandarte de eterita magistral · CAR'
    },
    smithChaMithrilHammer: {
      name: 'Estandarte de mithril · CAR'
    },
    smithChaAdamantHammer: {
      name: 'Estandarte de adamantita · CAR'
    },
    smithChaAetheriteHammer: {
      name: 'Estandarte de eterita · CAR'
    },
    smithMasterChaMithrilShield: {
      name: 'Códice de mithril magistral · CAR'
    },
    smithMasterChaAdamantShield: {
      name: 'Códice de adamantita magistral · CAR'
    },
    smithMasterChaAetheriteShield: {
      name: 'Códice de eterita magistral · CAR'
    },
    smithChaMithrilShield: {
      name: 'Códice de mithril · CAR'
    },
    smithChaAdamantShield: {
      name: 'Códice de adamantita · CAR'
    },
    smithChaAetheriteShield: {
      name: 'Códice de eterita · CAR'
    },
    smithMasterChaMithrilHelm: {
      name: 'Corona de mithril magistral · CAR'
    },
    smithMasterChaAdamantHelm: {
      name: 'Corona de adamantita magistral · CAR'
    },
    smithMasterChaAetheriteHelm: {
      name: 'Corona de eterita magistral · CAR'
    },
    smithChaMithrilHelm: {
      name: 'Corona de mithril · CAR'
    },
    smithChaAdamantHelm: {
      name: 'Corona de adamantita · CAR'
    },
    smithChaAetheriteHelm: {
      name: 'Corona de eterita · CAR'
    },
    smithMasterChaMithrilPlate: {
      name: 'Tabardo de mithril magistral · CAR'
    },
    smithMasterChaAdamantPlate: {
      name: 'Tabardo de adamantita magistral · CAR'
    },
    smithMasterChaAetheritePlate: {
      name: 'Tabardo de eterita magistral · CAR'
    },
    smithChaMithrilPlate: {
      name: 'Tabardo de mithril · CAR'
    },
    smithChaAdamantPlate: {
      name: 'Tabardo de adamantita · CAR'
    },
    smithChaAetheritePlate: {
      name: 'Tabardo de eterita · CAR'
    },
    smithMasterChaMithrilGreaves: {
      name: 'Botas de mithril magistral · CAR'
    },
    smithMasterChaAdamantGreaves: {
      name: 'Botas de adamantita magistral · CAR'
    },
    smithMasterChaAetheriteGreaves: {
      name: 'Botas de eterita magistral · CAR'
    },
    smithChaMithrilGreaves: {
      name: 'Botas de mithril · CAR'
    },
    smithChaAdamantGreaves: {
      name: 'Botas de adamantita · CAR'
    },
    smithChaAetheriteGreaves: {
      name: 'Botas de eterita · CAR'
    },
    smithMasterEndIronSword: {
      name: 'Maza de hierro magistral · AGU'
    },
    smithEndIronSword: {
      name: 'Maza de hierro · AGU'
    },
    smithMasterEndIronHammer: {
      name: 'Hacha de hierro magistral · AGU'
    },
    smithEndIronHammer: {
      name: 'Hacha de hierro · AGU'
    },
    smithMasterEndIronShield: {
      name: 'Escudo de hierro magistral · AGU'
    },
    smithEndIronShield: {
      name: 'Escudo de hierro · AGU'
    },
    smithMasterEndIronHelm: {
      name: 'Yelmo de hierro magistral · AGU'
    },
    smithEndIronHelm: {
      name: 'Yelmo de hierro · AGU'
    },
    smithMasterEndIronPlate: {
      name: 'Coraza de hierro magistral · AGU'
    },
    smithEndIronPlate: {
      name: 'Coraza de hierro · AGU'
    },
    smithMasterEndIronGreaves: {
      name: 'Grebas de hierro magistrales · AGU'
    },
    smithEndIronGreaves: {
      name: 'Grebas de hierro · AGU'
    },
    smithMasterEndSilverSword: {
      name: 'Maza de plata magistral · AGU'
    },
    smithEndSilverSword: {
      name: 'Maza de plata · AGU'
    },
    smithMasterEndSilverHammer: {
      name: 'Hacha de plata magistral · AGU'
    },
    smithEndSilverHammer: {
      name: 'Hacha de plata · AGU'
    },
    smithMasterEndSilverShield: {
      name: 'Escudo de plata magistral · AGU'
    },
    smithEndSilverShield: {
      name: 'Escudo de plata · AGU'
    },
    smithMasterEndSilverHelm: {
      name: 'Yelmo de plata magistral · AGU'
    },
    smithEndSilverHelm: {
      name: 'Yelmo de plata · AGU'
    },
    smithMasterEndSilverPlate: {
      name: 'Coraza de plata magistral · AGU'
    },
    smithEndSilverPlate: {
      name: 'Coraza de plata · AGU'
    },
    smithMasterEndSilverGreaves: {
      name: 'Grebas de plata magistrales · AGU'
    },
    smithEndSilverGreaves: {
      name: 'Grebas de plata · AGU'
    },
    smithMasterEndGoldSword: {
      name: 'Maza de oro magistral · AGU'
    },
    smithEndGoldSword: {
      name: 'Maza de oro · AGU'
    },
    smithMasterEndGoldHammer: {
      name: 'Hacha de oro magistral · AGU'
    },
    smithEndGoldHammer: {
      name: 'Hacha de oro · AGU'
    },
    smithMasterEndGoldShield: {
      name: 'Escudo de oro magistral · AGU'
    },
    smithEndGoldShield: {
      name: 'Escudo de oro · AGU'
    },
    smithMasterEndGoldHelm: {
      name: 'Yelmo de oro magistral · AGU'
    },
    smithEndGoldHelm: {
      name: 'Yelmo de oro · AGU'
    },
    smithMasterEndGoldPlate: {
      name: 'Coraza de oro magistral · AGU'
    },
    smithEndGoldPlate: {
      name: 'Coraza de oro · AGU'
    },
    smithMasterEndGoldGreaves: {
      name: 'Grebas de oro magistrales · AGU'
    },
    smithEndGoldGreaves: {
      name: 'Grebas de oro · AGU'
    },
    smithMasterEndMithrilSword: {
      name: 'Maza de mithril magistral · AGU'
    },
    smithMasterEndAdamantSword: {
      name: 'Maza de adamantita magistral · AGU'
    },
    smithMasterEndAetheriteSword: {
      name: 'Maza de eterita magistral · AGU'
    },
    smithEndMithrilSword: {
      name: 'Maza de mithril · AGU'
    },
    smithEndAdamantSword: {
      name: 'Maza de adamantita · AGU'
    },
    smithEndAetheriteSword: {
      name: 'Maza de eterita · AGU'
    },
    smithMasterEndMithrilHammer: {
      name: 'Hacha de mithril magistral · AGU'
    },
    smithMasterEndAdamantHammer: {
      name: 'Hacha de adamantita magistral · AGU'
    },
    smithMasterEndAetheriteHammer: {
      name: 'Hacha de eterita magistral · AGU'
    },
    smithEndMithrilHammer: {
      name: 'Hacha de mithril · AGU'
    },
    smithEndAdamantHammer: {
      name: 'Hacha de adamantita · AGU'
    },
    smithEndAetheriteHammer: {
      name: 'Hacha de eterita · AGU'
    },
    smithMasterEndMithrilShield: {
      name: 'Escudo de mithril magistral · AGU'
    },
    smithMasterEndAdamantShield: {
      name: 'Escudo de adamantita magistral · AGU'
    },
    smithMasterEndAetheriteShield: {
      name: 'Escudo de eterita magistral · AGU'
    },
    smithEndMithrilShield: {
      name: 'Escudo de mithril · AGU'
    },
    smithEndAdamantShield: {
      name: 'Escudo de adamantita · AGU'
    },
    smithEndAetheriteShield: {
      name: 'Escudo de eterita · AGU'
    },
    smithMasterEndMithrilHelm: {
      name: 'Yelmo de mithril magistral · AGU'
    },
    smithMasterEndAdamantHelm: {
      name: 'Yelmo de adamantita magistral · AGU'
    },
    smithMasterEndAetheriteHelm: {
      name: 'Yelmo de eterita magistral · AGU'
    },
    smithEndMithrilHelm: {
      name: 'Yelmo de mithril · AGU'
    },
    smithEndAdamantHelm: {
      name: 'Yelmo de adamantita · AGU'
    },
    smithEndAetheriteHelm: {
      name: 'Yelmo de eterita · AGU'
    },
    smithMasterEndMithrilPlate: {
      name: 'Coraza de mithril magistral · AGU'
    },
    smithMasterEndAdamantPlate: {
      name: 'Coraza de adamantita magistral · AGU'
    },
    smithMasterEndAetheritePlate: {
      name: 'Coraza de eterita magistral · AGU'
    },
    smithEndMithrilPlate: {
      name: 'Coraza de mithril · AGU'
    },
    smithEndAdamantPlate: {
      name: 'Coraza de adamantita · AGU'
    },
    smithEndAetheritePlate: {
      name: 'Coraza de eterita · AGU'
    },
    smithMasterEndMithrilGreaves: {
      name: 'Grebas de mithril magistrales · AGU'
    },
    smithMasterEndAdamantGreaves: {
      name: 'Grebas de adamantita magistrales · AGU'
    },
    smithMasterEndAetheriteGreaves: {
      name: 'Grebas de eterita magistrales · AGU'
    },
    smithEndMithrilGreaves: {
      name: 'Grebas de mithril · AGU'
    },
    smithEndAdamantGreaves: {
      name: 'Grebas de adamantita · AGU'
    },
    smithEndAetheriteGreaves: {
      name: 'Grebas de eterita · AGU'
    },
    smithIronSword: {
      name: 'Espada de hierro'
    },
    rustedShortsword: {
      name: 'Espada corta oxidada'
    },
    apprenticeStaff: {
      name: 'Bastón de aprendiz'
    },
    scoutsHandgun: {
      name: 'Pistola de explorador'
    },
    ironBroadsword: {
      name: 'Espada ancha de hierro'
    },
    vipinsStiletto: {
      name: 'Estilete de Vipin'
    },
    aetherCarbine: {
      name: 'Carabina de éter'
    },
    ashenGreatsword: {
      name: 'Mandoble ceniciento'
    },
    archmageWand: {
      name: 'Varita de archimago'
    },
    chronoBlade: {
      name: 'Hoja crono'
    },
    bloodForgedAxe: {
      name: 'Hacha forjada en sangre'
    },
    voidCannon: {
      name: 'Cañón del Vacío'
    },
    dragonSmasher: {
      name: 'Aplastadragones'
    },
    bladeOfTheUnbound: {
      name: 'Hoja del Indomable'
    },
    aetheriumDestroyer: {
      name: 'Destructor de eterio'
    },
    woodenBuckler: {
      name: 'Rodela de madera'
    },
    tomeOfNovices: {
      name: 'Tomo de novicios'
    },
    ironShield: {
      name: 'Escudo de hierro'
    },
    syringeOfTheAdept: {
      name: 'Jeringa del adepto'
    },
    aethericBattery: {
      name: 'Batería etérea'
    },
    aegisTowerShield: {
      name: 'Pavés de la Égida'
    },
    orbOfEternalFlame: {
      name: 'Orbe de la llama eterna'
    },
    shieldOfTheFallen: {
      name: 'Escudo de los Caídos'
    },
    paddedTunic: {
      name: 'Túnica acolchada'
    },
    leatherDoublet: {
      name: 'Jubón de cuero'
    },
    chainmailVest: {
      name: 'Chaleco de malla'
    },
    scholarsRobe: {
      name: 'Toga de erudito'
    },
    reinforcedPlate: {
      name: 'Placas reforzadas'
    },
    assassinsGarb: {
      name: 'Atuendo de asesino'
    },
    chronoWeaverCloak: {
      name: 'Capa del Tejedor del Tiempo'
    },
    bloodSoakedPlate: {
      name: 'Placas empapadas de sangre'
    },
    exoArmorChassis: {
      name: 'Chasis de exoarmadura'
    },
    dragonscaleHauberk: {
      name: 'Cota de escamas de dragón'
    },
    vestmentsOfSovereign: {
      name: 'Vestiduras del Soberano'
    },
    armorOfTheTitan: {
      name: 'Armadura del Titán'
    },
    quiltedCap: {
      name: 'Gorro acolchado'
    },
    stalkersHood: {
      name: 'Capucha del acechador'
    },
    ironcladHelm: {
      name: 'Yelmo acorazado'
    },
    seersCirclet: {
      name: 'Diadema del vidente'
    },
    wyrmguardGreathelm: {
      name: 'Gran yelmo guardawyrm'
    },
    hatOfTheStarweaver: {
      name: 'Sombrero del Tejeestrellas'
    },
    hideGloves: {
      name: 'Guantes de cuero'
    },
    ironGauntlets: {
      name: 'Guanteletes de hierro'
    },
    emberweaveGloves: {
      name: 'Guantes de tejebrasa'
    },
    duelistsGrips: {
      name: 'Empuñaduras del duelista'
    },
    voidforgedGauntlets: {
      name: 'Guanteletes forjados en el Vacío'
    },
    gripsOfTheTempest: {
      name: 'Garras de la tempestad'
    },
    trailBoots: {
      name: 'Botas de sendero'
    },
    pathfindersBoots: {
      name: 'Botas del explorador'
    },
    forgeplateGreaves: {
      name: 'Grebas de forja'
    },
    mistwalkerBoots: {
      name: 'Botas del caminante de bruma'
    },
    stormstrideGreaves: {
      name: 'Grebas del paso de tormenta'
    },
    treadsOfTheHorizon: {
      name: 'Pasos del horizonte'
    },
    copperBand: {
      name: 'Aro de cobre'
    },
    ringOfMending: {
      name: 'Anillo de sanación'
    },
    bandOfSwiftness: {
      name: 'Aro de presteza'
    },
    castersEmblem: {
      name: 'Emblema del hechicero'
    },
    infiltratorsCharm: {
      name: 'Amuleto del infiltrado'
    },
    timekeepersHourglass: {
      name: 'Reloj de arena del Guardián del tiempo'
    },
    ringOfTheVampyre: {
      name: 'Anillo del Vampiro'
    },
    sovereignsSignet: {
      name: 'Sello del Soberano'
    },
    heraldsPin: {
      name: 'Broche del heraldo'
    },
    hymnalOfTheRoad: {
      name: 'Himnario del camino'
    },
    shepherdsCrook: {
      name: 'Cayado del pastor'
    },
    minstrelsHat: {
      name: 'Sombrero del juglar'
    },
    pilgrimsSandals: {
      name: 'Sandalias del peregrino'
    },
    falconersGloves: {
      name: 'Guantes del cetrero'
    },
    bellOfTheHerd: {
      name: 'Cencerro del rebaño'
    },
    bannerOfTheHost: {
      name: 'Estandarte de la hueste'
    },
    heraldsTabard: {
      name: 'Tabardo del heraldo'
    },
    codexOfOaths: {
      name: 'Códice de juramentos'
    },
    crownOfTheRightfulKing: {
      name: 'Corona del rey legítimo'
    },
    scepterOfTheFirstKing: {
      name: 'Cetro del primer rey'
    },
    pickpocketsKnife: {
      name: 'Cuchillo del carterista'
    },
    serpentsFang: {
      name: 'Colmillo de serpiente'
    },
    phantomRapier: {
      name: 'Estoque fantasma'
    },
    fangOfTheWindless: {
      name: 'Colmillo del Sinviento'
    },
    roguesBuckler: {
      name: 'Broquel del pícaro'
    },
    venomVial: {
      name: 'Vial de veneno'
    },
    swiftguardBuckler: {
      name: 'Broquel de guardia veloz'
    },
    nightshadeFlask: {
      name: 'Frasco de belladona'
    },
    windveilTarge: {
      name: 'Adarga del velo de viento'
    },
    shadowdancersBuckler: {
      name: 'Broquel del bailarín de sombras'
    },
    scoutsBandana: {
      name: 'Pañuelo de explorador'
    },
    nightcowl: {
      name: 'Capucha nocturna'
    },
    shadowveilHood: {
      name: 'Capucha del velo de sombras'
    },
    windrunnersCap: {
      name: 'Gorra del corredor del viento'
    },
    maskOfTheSilentWind: {
      name: 'Máscara del viento silente'
    },
    rangersJerkin: {
      name: 'Jubón de guardabosques'
    },
    nightstalkerLeathers: {
      name: 'Cueros del acechador nocturno'
    },
    windridersHarness: {
      name: 'Arnés del jinete del viento'
    },
    mantleOfTheShadowDancer: {
      name: 'Manto del bailarín de sombras'
    },
    thiefsGloves: {
      name: 'Guantes de ladrón'
    },
    cutpurseGloves: {
      name: 'Guantes de cortabolsas'
    },
    glovesOfTheGale: {
      name: 'Guantes del vendaval'
    },
    softSoledShoes: {
      name: 'Zapatos de suela blanda'
    },
    catStepBoots: {
      name: 'Botas de paso de gato'
    },
    shadowstepBoots: {
      name: 'Botas de paso de sombra'
    },
    windstrideBoots: {
      name: 'Botas de zancada del viento'
    },
    luckyCoin: {
      name: 'Moneda de la suerte'
    },
    shadowBand: {
      name: 'Banda de sombra'
    },
    sandglassOfTheSwift: {
      name: 'Reloj de arena del veloz'
    },
    talonCharm: {
      name: 'Amuleto de garra'
    },
    windheart: {
      name: 'Corazón de viento'
    },
    ashwallHeater: {
      name: 'Escudo Muro de Ceniza'
    },
    wyrmhidePavise: {
      name: 'Paves de piel de wyrm'
    },
    footmansKettleHat: {
      name: 'Sombrero de olla del soldado'
    },
    ironbrowSallet: {
      name: 'Celada de cejas de hierro'
    },
    warlordsBarbute: {
      name: 'Barbuta del señor de la guerra'
    },
    helmOfTheSunderedThrone: {
      name: 'Yelmo del trono quebrado'
    },
    recruitsCuirass: {
      name: 'Coraza de recluta'
    },
    stonecuttersMitts: {
      name: 'Manoplas del cantero'
    },
    ashforgedGauntlets: {
      name: 'Guanteletes forjados en ceniza'
    },
    warbringerGauntlets: {
      name: 'Guanteletes del belicoso'
    },
    titanfistGauntlets: {
      name: 'Guanteletes puño de titán'
    },
    footmansGreaves: {
      name: 'Grebas del soldado'
    },
    ironshodGreaves: {
      name: 'Grebas herradas'
    },
    warlordsSabatons: {
      name: 'Escarpes del señor de la guerra'
    },
    greavesOfTheMountainfall: {
      name: 'Grebas del desprendimiento'
    },
    sergeantsSignet: {
      name: 'Sello del sargento'
    },
    brawlersKnuckleRing: {
      name: 'Puño americano del pendenciero'
    },
    bloodiedWarMedal: {
      name: 'Medalla de guerra ensangrentada'
    },
    watchmansCudgel: {
      name: 'Porra del vigilante'
    },
    ironboundMace: {
      name: 'Maza reforzada de hierro'
    },
    stonehideCleaver: {
      name: 'Hendedor de piel de piedra'
    },
    bulwarkMaul: {
      name: 'Mazo del baluarte'
    },
    mountainsplitterAxe: {
      name: 'Hacha parte-montañas'
    },
    everstandWarmace: {
      name: 'Maza de guerra inquebrantable'
    },
    emberwallBastion: {
      name: 'Bastión del muro de brasas'
    },
    stonewardenHelm: {
      name: 'Yelmo del guardián de piedra'
    },
    colossusVisage: {
      name: 'Rostro del coloso'
    },
    diggersGauntlets: {
      name: 'Guanteletes del cavador'
    },
    bastionGauntlets: {
      name: 'Guanteletes del bastión'
    },
    glacierplateGauntlets: {
      name: 'Guanteletes de placas glaciares'
    },
    gauntletsOfEndlessVigil: {
      name: 'Guanteletes de la vigilia eterna'
    },
    hearthstoneCharm: {
      name: 'Amuleto de piedra del hogar'
    },
    ironheartPendant: {
      name: 'Colgante corazón de hierro'
    },
    hedgewizardsWand: {
      name: 'Varita del hechicero de seto'
    },
    frostglassStaff: {
      name: 'Bastón de cristal escarchado'
    },
    voidthreadWand: {
      name: 'Varita de hilo del vacío'
    },
    staffOfTheStarlessSky: {
      name: 'Bastón del cielo sin estrellas'
    },
    studentsGrimoire: {
      name: 'Grimorio del alumno'
    },
    frostfireOrb: {
      name: 'Orbe de fuego helado'
    },
    orbOfTheUnwrittenHour: {
      name: 'Orbe de la hora no escrita'
    },
    apprenticesPointedCap: {
      name: 'Gorro puntiagudo del aprendiz'
    },
    sagesCirclet: {
      name: 'Diadema del sabio'
    },
    cinderWizardsHat: {
      name: 'Sombrero del mago de ceniza'
    },
    voidseerCirclet: {
      name: 'Diadema del vidente del vacío'
    },
    apprenticesRobe: {
      name: 'Túnica del aprendiz'
    },
    cinderthreadRobe: {
      name: 'Túnica de hilo de ceniza'
    },
    voidwovenRobe: {
      name: 'Túnica tejida del vacío'
    },
    inkStainedGloves: {
      name: 'Guantes manchados de tinta'
    },
    spellthreadGloves: {
      name: 'Guantes de hilo de hechizo'
    },
    frostweaveGloves: {
      name: 'Guantes de tejido helado'
    },
    starlitGloves: {
      name: 'Guantes estrellados'
    },
    glovesOfTheLastWord: {
      name: 'Guantes de la última palabra'
    },
    scribesSlippers: {
      name: 'Zapatillas del escriba'
    },
    moonstepSlippers: {
      name: 'Zapatillas paso de luna'
    },
    emberstepBoots: {
      name: 'Botas paso de brasa'
    },
    voidwalkerBoots: {
      name: 'Botas del caminante del vacío'
    },
    bootsOfTheWanderingStar: {
      name: 'Botas de la estrella errante'
    },
    glowstonePendant: {
      name: 'Colgante de piedra luminosa'
    },
    scholarsSeal: {
      name: 'Sello del erudito'
    },
    eyeOfTheArchon: {
      name: 'Ojo del arconte'
    },
    cinderRepeater: {
      name: 'Repetidor de ceniza'
    },
    glacierMortar: {
      name: 'Mortero de mano glaciar'
    },
    sparkCell: {
      name: 'Célula de chispas'
    },
    arcCapacitor: {
      name: 'Condensador de arco'
    },
    aetherheartCell: {
      name: 'Célula corazón de éter'
    },
    marksmansVisor: {
      name: 'Visera del tirador'
    },
    sharpshootersCap: {
      name: 'Gorra del francotirador'
    },
    gunnersHarness: {
      name: 'Arnés del artillero'
    },
    steadyhandGloves: {
      name: 'Guantes de pulso firme'
    },
    gunsmithsGloves: {
      name: 'Guantes del armero'
    },
    scrappersBoots: {
      name: 'Botas del pendenciero'
    },
    sharpshooterBoots: {
      name: 'Botas del francotirador'
    },
    firingLineBoots: {
      name: 'Botas de línea de fuego'
    },
    steadyfootBoots: {
      name: 'Botas pie firme'
    },
    aetherstepBoots: {
      name: 'Botas paso de éter'
    },
    bootsOfTheLastShot: {
      name: 'Botas del último disparo'
    },
    brassCartridgeCharm: {
      name: 'Amuleto de cartucho de latón'
    },
    deadEyeLens: {
      name: 'Lente de ojo certero'
    },
    eagleEyeScope: {
      name: 'Mira de ojo de águila'
    },
    criersBaton: {
      name: 'Batuta del pregonero'
    },
    droversStandard: {
      name: 'Estandarte del vaquero'
    },
    marshalsSceptre: {
      name: 'Cetro del mariscal'
    },
    balladBook: {
      name: 'Libro de baladas'
    },
    chronicleOfHeroes: {
      name: 'Crónica de héroes'
    },
    psalterOfTheHost: {
      name: 'Salterio de la hueste'
    },
    tomeOfEternalReign: {
      name: 'Tomo del reinado eterno'
    },
    heraldsCap: {
      name: 'Gorra del heraldo'
    },
    singersCirclet: {
      name: 'Diadema del cantor'
    },
    diademOfTenThousandVoices: {
      name: 'Diadema de las diez mil voces'
    },
    travelersWaistcoat: {
      name: 'Chaleco del viajero'
    },
    minstrelsMotley: {
      name: 'Traje de remiendos del juglar'
    },
    troubadoursCoat: {
      name: 'Abrigo del trovador'
    },
    marshalsGreatcoat: {
      name: 'Gabán del mariscal'
    },
    buskersGloves: {
      name: 'Guantes del músico callejero'
    },
    drummersGloves: {
      name: 'Guantes del tamborilero'
    },
    standardBearersGloves: {
      name: 'Guantes del portaestandarte'
    },
    gildedParadeGloves: {
      name: 'Guantes de desfile dorados'
    },
    glovesOfTheCrownedHand: {
      name: 'Guantes de la mano coronada'
    },
    wayfarersShoes: {
      name: 'Zapatos del caminante'
    },
    troubadourBoots: {
      name: 'Botas del trovador'
    },
    heraldsRidingBoots: {
      name: 'Botas de montar del heraldo'
    },
    paradeBoots: {
      name: 'Botas de desfile'
    },
    bootsOfTheLongProcession: {
      name: 'Botas de la larga procesión'
    },
    silverWhistle: {
      name: 'Silbato de plata'
    },
    gatheringHorn: {
      name: 'Cuerno de convocatoria'
    },
    heartOfTheMountain: {
      name: 'Corazón de la montaña'
    },
    ringOfAbsolutePower: {
      name: 'Anillo del poder absoluto'
    }
  },
  bag: {
    oreCount: '{ore}: {n}',
    noOre: 'Aún no tienes mineral. Pica las vetas contra la roca, ahí fuera en la naturaleza.',
    equip: 'Equipar',
    unequip: 'Quitar',
    worn: 'Llevas esto puesto. Quítatelo para venderlo.',
    versus: 'Comparado con {item}',
    hint: 'Toca un objeto para verlo. Tócalo otra vez, o arrástralo a una ranura, para equiparlo.',
    empty: 'No hay nada de este tipo en la bolsa.',
    slotEmpty: '{slot}: vacío',
    slotHolds: '{slot}: {item}',
    filter: {
      ore: 'Mineral',
      all: 'Todo',
      weapons: 'Armas',
      armor: 'Armaduras',
      trinkets: 'Abalorios',
      herbs: 'Hierbas'
    },
    sort: {
      slot: 'Tipo',
      tier: 'Calidad',
      level: 'Nivel'
    },
    sortBy: 'Ordenar por: {by}',
    noHerbs: 'Aún no tienes hierbas. Crecen en la naturaleza: pasa por encima de una para recogerla.',
    herbCount: '{plant}: {n}'
  },
  shop: {
    buy: 'Comprar',
    sell: 'Vender',
    owned: 'En propiedad',
    empty: 'Hoy no hay nada en los estantes.',
    goods: 'En venta',
    price: 'Precio',
    value: 'Pagan',
    hint: 'Toca algo del estante o de tu bolsa para ponerlo en la mesa, o arrástralo hasta allí.',
    buyBack: 'Vendido hoy',
    buyBackOne: 'Recomprar',
    deal: '¡Trato hecho!',
    say: {
      buy: 'Buena elección. Cuídalo y él te cuidará a ti.',
      sell: 'De acuerdo. Alguien lo querrá.',
      back: '¿Has cambiado de idea? No pasa nada, aquí lo tienes.',
      poor: 'Me temo que es un poco más de lo que llevas encima.'
    }
  },
  trainer: {
    learn: 'Aprender',
    known: 'Aprendida',
    friend: '{faction} honra a sus amigos: 20% de descuento.',
    fee: 'Tarifa',
    rank: {
      label: 'Rango {n}',
      up: 'Subir de rango',
      effect: '+{effect}% de efecto, −{cd}% de enfriamiento',
      max: 'Rango máximo',
      level: 'El rango {n} requiere nivel {lvl}.'
    },
    hint: 'Elige una lección. Un borde verde significa que puedes aprenderla ahora.',
    block: {
      'trial': "No has superado la prueba de esta clase.",
      'parents': "Aprende primero una habilidad de {a} y otra de {b}.",
      level: 'Tu nivel es demasiado bajo.',
      attrs: 'Tus atributos son demasiado bajos.',
      gold: 'No tienes suficiente oro.'
    }
  },
  healer: {
    talk: 'Siéntate y descansa un rato. Tus frascos vuelven a estar llenos. Si quieres, puedo venderte un cinturón más grande.',
    note: 'Llevas {n} pociones a cada zona.',
    buy: 'Un frasco más · {n}',
    full: 'En tu cinturón no cabe ni uno más.',
    belt: 'Cinturón de pociones',
    slotTitle: 'Cinturón ampliado',
    slotBought: 'Un hueco de frasco más: ahora llevas {n} pociones de salud a cada zona y puedes guardar {n} pociones de maná.',
    mana: {
      title: 'Pociones de maná',
      note: 'En existencias: {n} de {max}. Se quedan contigo entre visitas.',
      buy: 'Una poción de maná · {n}',
      full: 'Tus existencias están llenas.'
    }
  },
  faction: {
    order: 'La Orden de Hierro',
    syndicate: 'El Sindicato Ceniciento',
    circle: 'El Círculo del Éter'
  },
  npc: {
    'mysteriousWanderer': { 'name': "Vagabundo misterioso" },
    'fairPip': { 'name': "Pip" },
    'fairBess': { 'name': "La vieja Bess" },
    'fairHob': { 'name': "Hob" },
    sunkenPriest: { name: "El Sacerdote Hundido" },
    'fortHale': {
      'name': "Capitán Hale",
    },
    'fortMara': {
      'name': "Anciana Mara",
    },
    'scoutWren': {
      'name': "Exploradora Wren",
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
      name: 'Hermana Aurelle'
    },
    freedPeddler: {
      talk: 'Todo lo que necesita un viajero. Casi nuevo, casi siempre.',
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
      name: 'Pip el Vagabundo',
      talk: '¿Camino largo y bolsa ligera? Llevo un poco de todo.'
    },
    sunfordSmith: {
      name: 'Bram el Herrero',
      talk: 'Acero sencillo, precios justos. Tómate tu tiempo.'
    },
    sunfordPeddler: {
      name: 'Tilly la Buhonera',
      talk: 'Anillos, amuletos, cachivaches. Ese quizá hasta dé suerte.'
    },
    trainerAegis: {
      name: 'Ser Aldric'
    },
    trainerPyro: {
      name: 'Ember Wren'
    },
    elderMara: {
      name: 'Anciana Mara'
    },
    sunfordHealer: {
      name: 'Hermana Lune'
    },
    goblinTrader: {
      name: 'Grik el Mercader',
      talk: 'Mi familia hizo esto. Buen trabajo, precio justo.'
    },
    captainHale: {
      name: 'Capitán Hale'
    },
    oakArmorer: {
      name: 'Odo el Armero',
      talk: 'La mitad de mi género se fue a la muralla. Llévate lo que quede, si te sirve.'
    },
    oakMasterArmorer: {
      name: 'Maestro Odo',
      talk: 'Las buenas placas están fuera. Te has ganado de sobra echarles un vistazo.'
    },
    oakWeapons: {
      name: 'Senna Blades',
      talk: 'Afiladas, equilibradas, a buen precio. No toques los filos.'
    },
    trainerShadow: {
      name: 'El Susurro'
    },
    trainerSovereign: {
      name: 'Lord Castellan'
    },
    oakHealer: {
      name: 'Hermano Fenn'
    },
    blackMarket: {
      name: 'El Perista',
      talk: 'Sin preguntas, para ninguno de los dos. El Sindicato se lleva su parte.'
    },
    trainerBlood: {
      name: 'Doctor Sangrel'
    },
    syndicateBoss: {
      name: 'Madame Ash'
    },
    forgemaster: {
      name: 'Maestro forjador Dorn'
    },
    ironWeapons: {
      name: 'Hilda Hammerhand',
      talk: 'Todo forjado por enanos. Si una pieza se rompe, quiero saber cómo.'
    },
    ironAetherWorks: {
      name: 'Voss el Inventor',
      talk: 'Todo esto salió de estudiar el núcleo. Cuidado, casi todo está cargado.'
    },
    ironArmor: {
      name: 'Garrun Ironside',
      talk: 'Armaduras en los soportes, anillos en la bandeja.'
    },
    ironOrderArmor: {
      name: 'Intendente de la Orden',
      talk: 'Coge lo que necesites. La Orden cuida de los suyos.'
    },
    trainerGeo: {
      name: 'Viejo Piedepiedra'
    },
    trainerAether: {
      name: 'Pim el Engranajero'
    },
    ironHealer: {
      name: 'Madre Brynja'
    },
    exiledSovereign: {
      name: 'Lord Castellan, en el exilio'
    },
    trainerChrono: {
      name: 'El Guardián de las Horas'
    },
    mayorBrenna: {
      name: 'Alcaldesa Brenna Quill'
    },
    sbHealer: {
      name: 'Hermano Ansel'
    },
    sbArmorer: {
      name: 'Greta Ironvein',
      talk: 'Acero de montaña a precios de río. Golpea lo que quieras.'
    },
    sbWeapons: {
      name: 'Corvin Ashby',
      talk: 'Hojas Finas de Ashby. Cada filo pulido a mano. A mi mano.'
    },
    sbJeweler: {
      name: 'Tam Marlow',
      talk: 'Anillos, amuletos, piedras de la suerte. Todo auténtico. Bueno, casi todo.'
    },
    sbMasterAegis: {
      name: 'Dama Helga Stormshield'
    },
    sbMasterPyro: {
      name: 'Magíster Ignatius Vale'
    },
    sbMasterShadow: {
      name: 'Nyx Halloway'
    },
    sbMasterSovereign: {
      name: 'Lord Percival Ashcombe'
    },
    sbMasterGeo: {
      name: 'Abuela Tova Deeproot'
    },
    sbMasterAether: {
      name: 'Profesor Quint Sprocket'
    },
    sbMasterChrono: {
      name: 'Guardarrelojes Selwyn'
    },
    sbMasterBlood: {
      name: 'Vesper Crimsonleaf'
    },
    sbAlchemist: {
      name: 'Odile Fernwhistle'
    },
    sbGambler: {
      name: 'Madame Pell'
    },
    sunfordGambler: {
      name: 'Dob Tumbler'
    },
    sunfordCups: {
      name: 'Nell Nimblefingers'
    },
    oakGambler: {
      name: 'Silky Ren'
    },
    sbCollector: {
      name: 'Alder Vane',
      talk: 'Piezas únicas, para amigos únicos. No toques nada con los dedos llenos de mermelada.'
    },
    sbFence: {
      name: 'Mirela Thorne',
      talk: 'Buenas armaduras, sin preguntas. Bueno, muy pocas preguntas.'
    },
    sbMasterWindrunner: {
      name: 'Sefa Galewing'
    },
    sbMasterFrostwarden: {
      name: 'Halvard Rimeheart'
    },
    sbMasterLightbringer: {
      name: 'Hermana Auriel Dawnmere'
    },
    sbMasterBeastcaller: {
      name: 'El viejo Rowan Thistlefoot'
    },
    sbMasterElementalist: {
      name: 'Magistra Iris Fourwinds'
    },
    sbMasterSoulwarden: {
      name: 'Guardiana Odalys Lanternlight'
    },
    sbMasterIronmonk: {
      name: 'Maestro Oru Stillwater'
    },
    sbMasterBard: {
      name: 'Lark Merriweather'
    }
  },
  quest: {
    final: 'Esta elección es permanente.',
    needsRep: 'Reputación {n} con: {faction}',
    gold: '+{n} de oro',
    goblinKing: {
      title: 'El Rey Goblin',
      slay: {
        label: 'Poner fin a su reinado.'
      },
      pact: {
        label: 'Ofrecer un pacto comercial con Sunford.'
      },
      ransom: {
        label: 'Quedarte con su tesoro y dejarle la corona.'
      }
    },
    siege: {
      title: 'El Asedio de Oakhaven',
      defend: {
        label: 'Defender Oakhaven.'
      },
      betray: {
        label: 'Abrir la puerta al Sindicato.'
      }
    },
    core: {
      title: 'El Corazón de Ironhold',
      destroy: {
        label: 'Hacer añicos el núcleo.'
      },
      study: {
        label: 'Dárselo al Círculo para que lo estudie.'
      },
      sell: {
        label: 'Vendérselo al Sindicato.'
      }
    },
    oracle: {
      title: 'La Oráculo Ahogada',
      free: {
        label: 'Romper sus cadenas.'
      },
      slay: {
        label: 'Llevarte el reloj de arena que guarda.'
      }
    },
    dragon: {
      title: 'El Dragón del Vacío',
      slay: {
        label: 'Matar al dragón.'
      },
      pact: {
        label: 'Sellar un pacto contra el Archidemonio.'
      }
    },
    throne: {
      title: 'El Trono Vacío',
      order: {
        label: 'Dar el trono a la Orden de Hierro.'
      },
      syndicate: {
        label: 'Dar el trono al Sindicato Ceniciento.'
      },
      circle: {
        label: 'Dar el trono al Círculo del Éter.'
      },
      shatter: {
        label: 'Hacer añicos el trono.'
      },
      claim: {
        label: 'Sentarte tú en él.'
      }
    }
  },
  dlg: {
    // ── The Mysterious Wanderer (afterplay phase 10) ──
    'mysteriousWanderer': {
      'hello': { '1': "Vaya. Hiciste lo que pocos lograron jamás. Lo sentí desde el otro lado de la grieta.", '2': "Enseño las viejas sendas que unen dos escuelas en una. Solo a quien se las gana." },
      'sealed': { '1': "La sellaste. Una lástima, en cierto modo. Me gustaban las vistas." },
      'ajar': { '1': "La dejaste entreabierta. Audaz. Los demonios te mantendrán alerta." },
      'again': { '1': "Otra vez aquí. El camino es largo, pero lo recorres bien." },
      'train': { '1': "Muéstrame las dos mitades de lo que eres y las haré una." },
      'trial': { 'say': "¿A qué pruebas te refieres?", '1': "Una puerta defendida sin un rasguño. Un dragón muerto sin una caída. Cinco forjas infernales y cinco victorias seguidas.", '2': "La muerte del Leviatán y una ronda perfecta en la hidra. Cada una abre una puerta que puedo mostrarte." },
      'who': { '1': "Un vagabundo. Recorría el borde de la grieta antes de que naciera tu abuelo. Los nombres se gastan." },
      'trainBack': { '1': "Practica. Dos escuelas pelean antes de ponerse de acuerdo." },
      'bye': { '1': "Camina con cuidado. Estaré aquí, hasta que no esté." }
    },
    'fairPip': {
      'hello': { '1': "¡Acérquense! Nueve barriles, una pandilla de diablillos y un mazo. ¡Mándalos de vuelta abajo!", '2': "Los diablillos salen de los barriles. Golpea veinte antes de que se acabe la arena.", '3': "Deja a los de armadura dorada, te cuestan una vida. Tres victorias seguidas y el gran premio es tuyo." },
      'again': { '1': "¿Más golpes? ¡Agarra el mazo!" },
      'play': { '1': "¡Mazo arriba! ¡Ahí vienen!" },
      'who': { '1': "Pip, cazador de diablillos de oficio. A estos los atrapé yo mismo. Muerden." },
      'playBack': { '1': "¡Ja! ¡Qué jaleo! ¿Otra?" },
      'bye': { '1': "¡Suelta ese brazo!" }
    },
    'fairBess': {
      'hello': { '1': "Cinco aros, tres cabezas, y ninguna muerde. La tallé yo misma, así que cuidado con la pintura.", '2': "Mantén para el impulso, suelta para lanzar. Una cabeza solo atrapa el aro cuando pasa por el centro.", '3': "Cada cabeza seguida cuenta uno más. Acierta las cinco y te pago como es debido." },
      'again': { '1': "¿Vuelves a probar suerte con mi vieja amiga?" },
      'play': { '1': "Aquí tienes tus aros. Lanza suave, cielo." },
      'who': { '1': "Cuarenta años por los caminos de feria. La hidra llegó con la guerra. Parecía oportuno." },
      'playBack': { '1': "Nada mal. Mi difunto marido lanzaba peor." },
      'bye': { '1': "Cuidado con la pintura al salir." }
    },
    'fairHob': {
      'hello': { '1': "Oh. Hola. ¿Quieres echar un pulso? Iré con cuidado. Lo intentaré.", '2': "Empuja cuando el anillo toque el círculo. Fuera de ritmo, resbalas.", '3': "Los brazos fuertes ayudan. Gáname tres veces seguidas y el Maestro Forjador te hará un descuento." },
      'again': { '1': "¿Otra ronda? Nadie vuelve nunca a por otra ronda." },
      'play': { '1': "El codo en la mesa. Cuando quieras." },
      'who': { '1': "Soy el aprendiz del Maestro Forjador. Dice que no conozco mi propia fuerza." },
      'playBack': { '1': "Buen pulso. Mañana me dolerá el brazo. Seguramente." },
      'bye': { '1': "Vuelve pronto. La forja está muy tranquila." }
    },
    // ── The Breaking (the afterplay, B0–B5) ──
    'story': {
      forge: { back: { '1': "Mi forja arde de nuevo, más que nunca. El hierro demoníaco se funde bien.", '2': "Tráeme lo que encuentres ahí fuera. Ahora puedo forjarlo infernal." } },
      oracle: { lens: { '1': "Una vez me liberaste. Ahora veré por ti. Toma mi Lente.", '2': "Mira a través de ella, y el mapa te mostrará dónde acechan las grandes bestias." } },
      priest: { lens: { '1': "El Oráculo ya no está, así que ahora guardo su templo. La Esfinge custodiaba esto.", '2': "Su Lente. Mira a través de ella, y el mapa te mostrará dónde acechan las grandes bestias." } },
      herbs: { scale: { '1': "¡Una escama del Leviatán! Ligera como una hoja, y flota.", '2': "Llévala, y los bajíos te sostendrán como tierra firme." } },
      ghost: { key: { '1': "Vaya, quien tomó mi trono. Mataste a mi Hidra. Bien.", '2': "Toma su llave de fuego. El corazón de la grieta arde, y solo el fuego lo abre." } },
      syndicate: { key: { '1': "¿La Hidra ha muerto? Entonces su llave de fuego es de quien pague. O tuya, supongo.", '2': "Abre el corazón de la grieta. Ve y ciérrala, antes de que se coma mi negocio." } },
      sealed: {
        sealed: { '1': "Y así la grieta fue sellada, y el mundo empezó a sanar.", '2': "Se reconstruyeron pueblos, se escribieron canciones, y un nombre estaba en todas." },
        ajar: { '1': "Y así la grieta quedó entreabierta, y el mundo aprendió a vivir a su lado.", '2': "Las murallas siguieron vigiladas, el coliseo siguió ruidoso, y el héroe siguió listo." },
      },
      'rift': {
        'scream': {
          '1': "El Señor del Vacío cae, y la grieta tras él grita.",
          '2': "Nunca fue su trono. Era su jaula, y él era la tapa.",
          '3': "Ahora la grieta está abierta, y todo lo que el vacío dormía despierta.",
        },
      },
      'wren': {
        'found': {
          '1': "¡Ahí estás! Soy Wren, exploradora. Te he buscado por todas partes.",
          '2': "Sunford arde. Todos los que pudieron huir fueron a Paso del Bastión.",
          '3': "Es el viejo fuerte en el camino a los Riscos Cenicientos. Date prisa, te necesitan.",
        },
      },
    },
    'scoutWren': {
      sealed: { '1': "¡El dragón ya no está! Los caminos ya se sienten más ligeros." },
      'hello': {
        '1': "¡Has venido! Sabía que vendrías. Bienvenido a Paso del Bastión.",
        '2': "Exploro los caminos para el capitán. Pregúntame dónde hay problemas.",
        '1__f': "¡Has venido! Sabía que vendrías. Bienvenida a Paso del Bastión.",
      },
      'again': {
        '1': "¿Ya de vuelta? Los caminos no se exploran solos.",
      },
      'who': {
        '1': "Wren. Llevaba mensajes para la guardia de Sunford, antes de que ardiera.",
      },
      'rumor': {
        'plains': {
          '1': "Los demonios controlan el camino de las llanuras de Sunford. Los maestros de Sunford están atrapados detrás.",
        },
        'hollows': {
          '1': "Las Hondonadas Goblin están llenas de perros infernales. Límpialas y la gente de Sunford podrá volver.",
        },
        'woods': {
          '1': "Algo con tres cabezas caza en el Bosque Susurrante. La herbolaria se esconde allí.",
        },
        'outskirts': {
          '1': "Hay centauros en las Afueras. Si llegan a nuestros muros, necesitaremos cada espada.",
        },
        'siege': {
          '1': "Su horda está rota, pero se reúnen más. El capitán prepara los muros.",
        },
      },
      'bye': {
        '1': "Vigila los caminos. Yo también los vigilaré.",
      },
    },
    'fortHale': {
      sealed: { '1': "El dragón ha muerto. Nunca creí que viviría para verlo. Gracias." },
      'siegeBack': { '1': "¿Todavía no? Descansa, entonces. Las murallas te esperarán." },
      'bell': { '1': "A la puerta, entonces. Dime con cuánta dureza la defendemos." },
      'hello': {
        '1': "Lo lograste. Bien. Necesitamos cada espada, ahora más que nunca.",
        '2': "Bienvenido a Paso del Bastión. Muros viejos, pero los únicos que siguen en pie.",
        '2__f': "Bienvenida a Paso del Bastión. Muros viejos, pero los únicos que siguen en pie.",
      },
      'road': {
        '1': "El camino a Sunford vuelve a estar abierto. Su gente está a salvo tras nuestros muros.",
      },
      'herbs': {
        '1': "La herbolaria ha vuelto, con sus hierbas. La enfermería puede respirar.",
      },
      'siege': {
        '1': "Rompiste a los centauros. Pero viene un ejército mayor, y viene a por estos muros.",
      },
      'again': {
        '1': "Seguimos en pie. Los muros, los hombres y yo.",
      },
      'fort': {
        '1': "Un viejo fuerte fronterizo. Vacío cincuenta años, hasta que el cielo se rasgó.",
        '2': "Ahora es el último lugar seguro entre las llanuras y las montañas.",
        'say': "¿Qué es este lugar?",
      },
      'rumor': {
        'road': {
          '1': "Limpia las Llanuras y las Hondonadas. La gente de Sunford está atrapada allí.",
        },
        'woods': {
          '1': "La herbolaria está en el Bosque Susurrante, y también una bestia de tres cabezas. Prepárate.",
        },
        'centaurs': {
          '1': "Centauros en las Afueras. Rompe su horda antes de que nos alcance.",
        },
        'siege': {
          '1': "Descansa. Cuando suene la campana del asedio, te necesitaré en el muro.",
        },
      },
      'bye': {
        '1': "Ten la espada a mano.",
      },
    },
    'fortMara': {
      sealed: { '1': "Lo lograste, criatura. Cada uno de nosotros te debe un hogar." },
      'siegeBack': { '1': "Descansa un poco, criatura. La campana volverá a sonar." },
      'bell': { '1': "Ahora me toca a mí guardar los muros del capitán. Elige cómo los defendemos." },
      'hello': {
        '1': "¡Niño! Estás vivo. Cuando Sunford ardió, temí lo peor.",
        '2': "Ahora somos invitados en un fuerte de soldados, ancianas incluidas.",
        '1__f': "¡Niña! Estás viva. Cuando Sunford ardió, temí lo peor.",
      },
      'command': {
        '1': "El capitán Hale cayó con Oakhaven. Así que el fuerte escucha a una vieja anciana.",
      },
      'home': {
        '1': "¡Sunford se reconstruye! Ya están los primeros tejados. Podría llorar.",
      },
      'again': {
        '1': "Aquí sigo, niño. Todavía contando cabezas.",
        '1__f': "Aquí sigo, niña. Todavía contando cabezas.",
      },
      'town': {
        '1': "Los demonios bajaron del cielo nocturno. Huimos con lo que pudimos cargar.",
        '2': "Algunos no lograron salir. Trae al resto a casa, si puedes.",
        'say': "¿Qué le pasó a Sunford?",
      },
      'rumor': {
        'road': {
          '1': "Nuestros maestros siguen en el camino de Sunford. Tráelos aquí, niño.",
          '1__f': "Nuestros maestros siguen en el camino de Sunford. Tráelos aquí, niña.",
        },
        'woods': {
          '1': "La herbolaria fue al Bosque Susurrante por hierbas y nunca volvió.",
        },
        'centaurs': {
          '1': "Jinetes en las Afueras. Cascos como truenos, cada noche.",
        },
        'siege': {
          '1': "Pronto pondrán a prueba los muros. Lo siento en mis viejos huesos.",
        },
      },
      'bye': {
        '1': "Ve con cuidado, niño.",
        '1__f': "Ve con cuidado, niña.",
      },
    },
    intro: {
      crossing: { 1: 'Todo camino lleva a una encrucijada… y cada encrucijada es una batalla.' },
      hero: { 1: 'Desde los campos de Sunford partió un joven héroe.' },
      fire: { 1: 'El fuego respondió. El acero aprendió un nombre nuevo.' },
      foes: { 1: 'Reyes goblin, jarls helados, un dragón del vacío… y el Archidemonio.' },
      begin: { 1: 'Tu leyenda comienza ahora.' }
    },
    frostDisciple: {
      bye: {
        '1': 'Abrígate.'
      },
      who: {
        '2': 'Las forjas de Ironhold son cálidas. Me gusta estar aquí.',
        '1': 'Cazaba en la tundra. Me enjaularon durante un invierno.'
      },
      trainBack: {
        '1': 'Practica. El frío es paciente. Sé tú igual.'
      },
      ready: {
        weak: {
          '1': 'Todavía no. Más fuerza en el brazo y en la mente.'
        },
        able: {
          '1__f': 'Estás lista. Siguiente lección.',
          '1': 'Estás listo. Siguiente lección.'
        },
        strong: {
          '1': 'Eres más fuerte de lo que yo era. Coge lo que necesites.'
        }
      },
      class: {
        say: '¿Qué es un Guardián de Escarcha?',
        '2': 'Fuerza para la hoja. Inteligencia para la escarcha.',
        '1': 'Enfríalos, congélalos y luego rompe el hielo.'
      },
      train: {
        '1__f': 'Quédate quieta. Deja que el frío venga a ti. Luego devuélvelo.',
        '1': 'Quédate quieto. Deja que el frío venga a ti. Luego devuélvelo.'
      },
      again: {
        '1': 'Vuelves. Bien.'
      },
      hello: {
        '2': 'Ivor Hask. Halvard Rimeheart me enseñó la escarcha. Ahora la enseño yo, aquí.',
        '1': 'Libre. Bien. El frío no pudo conmigo, y ellos tampoco.'
      }
    },
    windDisciple: {
      bye: {
        '1': 'No le quites el ojo al viento.'
      },
      who: {
        '2': 'Dile a Sefa que estoy vivo, ¿quieres? Se preocupa.',
        '1': 'Iba de camino a Silverbridge cuando los riscos me atraparon.'
      },
      trainBack: {
        '1': 'Ve a practicar. A algún sitio con viento.'
      },
      ready: {
        weak: {
          '1': 'Todavía no. Gana velocidad primero y luego vuelve.'
        },
        able: {
          '1__f': 'Estás lista para la siguiente. Mira con atención.',
          '1': 'Estás listo para la siguiente. Mira con atención.'
        },
        strong: {
          '1__f': 'Ya eres más rápida que yo. Coge lo que quieras.',
          '1': 'Ya eres más rápido que yo. Coge lo que quieras.'
        }
      },
      class: {
        say: '¿Qué hace un Corredor del Viento?',
        '2': 'Destreza para tener pies ligeros. Técnica, para que cada flecha acierte.',
        '1': 'Corre, dispara, vuelve a correr. Nunca estés donde apuntan.'
      },
      train: {
        '1': 'Pies separados. Suelta el aire. Deja que el viento la lleve.'
      },
      again: {
        '1': '¡Eh! Hoy hace buen viento. ¿Practicamos?'
      },
      hello: {
        '2': 'Kestrel Vane. Sefa Galewing me enseñó el arco. Puedo enseñarte lo que ella me enseñó.',
        '1': '¡Me sacaste de ahí! Te lo debo todo. Bueno, mucho.'
      }
    },
    freedFarmers: {
      bye: {
        '1': 'Ve con cuidado.'
      },
      who: {
        '2': 'Oakhaven nos acogió. Se lo pagamos en pan.',
        '1': 'Unos bandidos nos sacaron de nuestro campo y nos dejaron pudrirnos en el bosque.'
      },
      favorDone: {
        say: 'Los lobos no os molestarán más.',
        '2': 'Toma esto. No es mucho, pero es honrado.',
        '1': 'Noches tranquilas otra vez. Por fin podemos dormir.'
      },
      waiting: {
        say: 'Sobre esos lobos...',
        '1': 'Los lobos siguen rondando. Los oímos anoche.'
      },
      favor: {
        say: '¿Puedo ayudar en algo?',
        '2': '¿Podrías reducir su número? Con ocho deberían aprender.',
        '1': 'Los lobos del Bosque Susurrante no paran de llevarse nuestras ovejas.'
      },
      again: {
        '1__f': 'Ahí está nuestra heroína. ¿Vienes a comer algo?',
        '1': 'Ahí está nuestro héroe. ¿Vienes a comer algo?'
      },
      hello: {
        '2': 'Jory Toller. Ahora cultivamos fuera de las murallas. Bueno, lo intentamos.',
        '1': 'Sin ti estaríamos muertos. Mi chico y yo. Gracias.'
      }
    },
    freedHerbalist: {
      bye: {
        '1': 'Pisa con cuidado. Allí crecen cosas.'
      },
      who: {
        '2': 'No se equivocaban del todo.',
        '1': 'Una herbolaria de las colinas. Los goblins me tomaron por bruja.'
      },
      favorDone: {
        say: 'Aquí tienes tus pétalos solares.',
        '2': 'Toma, tu pago. Y gracias, otra vez.',
        '1': 'Oh, son perfectos. ¡Huele eso!'
      },
      waiting: {
        say: 'Sobre esos pétalos solares...',
        '1': '¿Sigues buscando? A los pétalos solares les encanta el sol abierto.'
      },
      favor: {
        say: '¿Puedo hacer algo por ti?',
        '2': 'Crecen en las llanuras. Te los pagaré bien.',
        '1': 'Perdí mis reservas en esa jaula. ¿Podrías traerme tres pétalos solares?'
      },
      again: {
        '1': 'Ah, hola otra vez. Tus botas huelen a musgo. Bien.'
      },
      hello: {
        '2': 'Soy Briar. Recojo y seco lo que crece. Silverbridge tuvo la bondad de acogerme.',
        '1': 'Sabía que vendría alguien. Los goblins nunca entendieron las hierbas. Ni la bondad.'
      }
    },
    lightDisciple: {
      bye: {
        '1': 'Camina en la luz.'
      },
      who: {
        '2': 'Sunford es luminoso y tranquilo. Necesitaba ambas cosas.',
        '1': 'Fui al Templo Sumergido a rezar. Las nagas tenían otros planes.'
      },
      trainBack: {
        '1': 'Ve con suavidad. Y deja que te vean llegar.'
      },
      ready: {
        weak: {
          '1': 'Todavía no. Primero, una mente más clara y un corazón más cálido.'
        },
        able: {
          '1__f': 'Estás lista para la siguiente lección. Ven, ponte en la luz.',
          '1': 'Estás listo para la siguiente lección. Ven, ponte en la luz.'
        },
        strong: {
          '1': 'Ahora brillas más que yo. Coge lo que necesites.'
        }
      },
      class: {
        say: '¿Qué hace un Portador de Luz?',
        '2': 'La Inteligencia hace fuerte la luz. El Carisma la hace cálida.',
        '1': 'Llevamos el alba. Luz para luchar, luz para sanar.'
      },
      train: {
        '1': 'Abre las manos. Deja que la luz pase a través de ellas, no que salga de ellas.'
      },
      again: {
        '1__f': 'Bienvenida de nuevo. El sol está amable hoy.',
        '1': 'Bienvenido de nuevo. El sol está amable hoy.'
      },
      hello: {
        '2': 'Soy Aurelle. La hermana Auriel me enseñó la luz. Ahora la enseño aquí.',
        '1': 'La luz sea contigo. Me encontraste en la oscuridad, y no lo olvidaré.'
      }
    },
    freedPeddler: {
      bye: {
        '1': 'Cuidado con los bandidos. No les gusta compartir.'
      },
      shopBack: {
        '1__f': 'Un placer hacer negocios, amiga.',
        '1': 'Un placer hacer negocios, amigo.'
      },
      who: {
        '2': 'Ahora vendo desde Sunford. Aquí es más seguro. Casi siempre.',
        '1': 'Unos bandidos se llevaron mi carro y me metieron en una caja. Qué groseros.'
      },
      trade: {
        '1': 'Anillos, guantes, botas. A mitad de precio para ti. Bueno, casi.'
      },
      again: {
        '1__f': '¡Mi salvadora! Ven, ven, te he guardado las cosas buenas.',
        '1': '¡Mi salvador! Ven, ven, te he guardado las cosas buenas.'
      },
      hello: {
        '2': 'Odo Marrow, a tu servicio. Buhonero, calderero y hombre muy agradecido.',
        '1': '¡Tú! ¡Tú eres quien abrió esa jaula! Me habría podrido ahí dentro.'
      }
    },
    sfShadowRoad: {
      hello: {
        '1': 'Teletransporte. ¿Te interesa?'
      },
      again: {
        '1': '¿Vuelves por otro truco?'
      },
      train: {
        '1': 'Mira bien. Un paso y estás en otro sitio.'
      },
      trainBack: {
        '1': 'Bien. Ahora ve a estar en otro lugar.'
      },
      bye: {
        '1': 'Que no te pillen.'
      }
    },
    sfShadow: {
      hello: {
        '1': 'No te oí entrar. Normalmente ese es mi truco.',
        '2': 'Nettle Quickhand. Enseño las artes silenciosas: dagas, sombras y marcharse pronto.'
      },
      again: {
        '1': '¿Otra vez por aquí? Bien. Nadie te ha visto, espero.'
      },
      train: {
        '1': 'Pies ligeros, manos rápidas. Intenta no tropezar con tu propia hoja.'
      },
      class: {
        '1': 'Golpear donde no miran y luego estar en otro sitio por completo.',
        '2': 'Todo depende de la Destreza. Manos rápidas, pies rápidos, salidas rápidas.',
        say: '¿Qué hace una Hoja Sombría?'
      },
      ready: {
        strong: {
          '1': 'Ya eres más rápido que yo. Coge lo que quieras, ni me daré cuenta.',
          '1__f': 'Ya eres más rápida que yo. Coge lo que quieras, ni me daré cuenta.'
        },
        able: {
          '1': 'Estás listo para el siguiente truco. Mira bien, solo lo hago una vez.',
          '1__f': 'Estás lista para el siguiente truco. Mira bien, solo lo hago una vez.'
        },
        weak: {
          '1': 'Aún no. Gana rapidez primero, o las sombras te harán tropezar.'
        }
      },
      town: {
        '1': 'Pueblo tranquilo, gente honrada. Nadie mira dos veces una capa de granjero. Perfecto.',
        say: '¿Por qué enseñas aquí, en Sunford?'
      },
      trainBack: {
        '1': 'Venga, vete. Practica donde los guardias no vean.'
      },
      bye: {
        '1': 'Cuida tu bolsa.'
      }
    },
    sfGeo: {
      hello: {
        '1': 'Cuidado con las rocas. Algunas están escuchando.',
        '2': 'Harrow Flint. Enseño la vieja magia de la tierra: piedra, raíces, un pequeño temblor.'
      },
      again: {
        '1': 'Ah, has vuelto. El suelo me dijo que venías.'
      },
      train: {
        '1': 'Pies planos, respira despacio. Siente el peso bajo tus pies. Bien.'
      },
      class: {
        '1': 'Pedir ayuda a la tierra. Muros cuando los necesitas, pinchos cuando los demás no los quieren.',
        '2': 'Fuerza para sostener la piedra, Inteligencia para darle forma. Necesitas las dos.',
        say: '¿Qué hace un geomante?'
      },
      ready: {
        strong: {
          '1': 'La piedra ya te responde antes que a mí. Coge lo que necesites.'
        },
        able: {
          '1': 'Estás listo para la siguiente lección. Pon la mano en el suelo. Escucha.',
          '1__f': 'Estás lista para la siguiente lección. Pon la mano en el suelo. Escucha.'
        },
        weak: {
          '1': 'Aún no. Más fuerza y la mente más clara, o la piedra no te escuchará.'
        }
      },
      farms: {
        '1': 'Cada primavera. La cebada crece un palmo más y nadie sabe por qué. No se lo digas.',
        say: '¿La tierra ayuda también a las granjas?'
      },
      trainBack: {
        '1': 'Anda, ve. Y devuelve esa piedra a donde la encontraste.'
      },
      bye: {
        '1': 'Camina con suavidad. El suelo recuerda.'
      }
    },
    smalltalkSunford: {
      weather: {
        '1': 'Esta noche llueve. Me duele la rodilla desde por la mañana.',
        '2': 'Tu rodilla dijo lo mismo la semana pasada.',
        '3': 'Y llovió, ¿no? Solo que aquí no.'
      },
      harvest: {
        '1': 'La cebada ha salido muy bien este año.',
        '2': 'A ver si nos dejan quedárnosla.'
      },
      goblins: {
        '1': 'Los goblins se llevaron tres gallinas de la granja del Molinero.',
        '2': '¿Otra vez? Es la segunda vez este mes.',
        '3': 'Alguien debería hacer algo con esas cuevas.'
      },
      kingGone: {
        '1': 'Dicen que el Rey Goblin ha muerto.',
        '2': 'Bien. Igual ahora duermo una noche entera.'
      },
      pact: {
        '1': 'Esta mañana le compré un cucharón a un goblin.',
        '2': '¿Y es bueno?',
        '3': 'Mejor que el mío, la verdad. No se lo digas a nadie.'
      },
      bram: {
        '1': 'Bram lleva en el yunque desde antes del amanecer.',
        '2': 'Se pone así cuando está preocupado.'
      },
      pie: {
        '1': '¿Eso que huelo es tarta de manzana?',
        '2': 'Lo era. Los niños la encontraron primero.',
        '3': 'Haré otra. Escóndela mejor esta vez.'
      },
      road: {
        '1': 'Hace una semana que nadie toma el camino de las llanuras.',
        '2': 'No con bandidos en él. No se les puede culpar.'
      },
      hero: {
        '1': 'Alguien ha despejado de bandidos el camino de las llanuras.',
        '2': 'Gracias al cielo. Mi hermana podrá volver a visitarnos.'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': 'Dos platas por una col. ¡Dos!',
        '2': 'Hoy en día nada pasa barato por la puerta.',
        '3': 'Pues cultivaré el mío. En el tejado, si hace falta.'
      },
      watch: {
        '1': 'Han duplicado la guardia en la puerta.',
        '2': 'Bien. Duermo algo más tranquilo.'
      },
      caravan: {
        '1': 'La caravana de las especias llega tarde otra vez.',
        '2': '¿Bandidos?',
        '3': 'O barro. Ojalá sea barro.'
      },
      siege: {
        '1': 'Hay un ejército acampado más allá de las granjas.',
        '2': 'Entonces llenemos la bodega mientras podamos.'
      },
      saved: {
        '1': '¿Estabas en la muralla cuando se rompió el asedio?',
        '2': 'Yo estaba escondido debajo de la cama, si te soy sincero.',
        '3': 'Como media ciudad. Pero aquí seguimos.'
      },
      fountain: {
        '1': 'Tiré una moneda a la fuente para tener suerte.',
        '2': 'Espero que hayas pedido coles más baratas.'
      },
      ash: {
        '1': 'Todo sigue oliendo a humo.',
        '2': 'Se irá. Todo se va al final.'
      },
      hide: {
        '1': '¿Oíste botas en la calle anoche?',
        '2': 'Más bajo. No sabes quién escucha.',
        '3': 'Perdona. Es que... perdona.'
      },
      bread: {
        '1': 'He encontrado media hogaza. Toma, coge un poco.',
        '2': 'Eres un buen alma. Gracias.'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': 'Buena veta de cobre en el cuarto nivel.',
        '2': 'Cobre. Esperaba plata.',
        '3': 'El cobre paga el alquiler. La plata paga sueños.'
      },
      forge: {
        '1': 'La gran forja lleva cien años sin enfriarse.',
        '2': 'Mi abuelo ayudó a encenderla, ¿sabes?'
      },
      beard: {
        '1': 'Te has recortado la barba.',
        '2': 'Me acerqué demasiado al yunque.',
        '3': 'Volverá a crecer. Y más corta te sienta mejor.'
      },
      core: {
        '1': 'Algo brilla allá abajo, en los pozos profundos.',
        '2': 'Nada bueno brilla ahí abajo. Quédate arriba.'
      },
      order: {
        '1': 'Los armeros de la Orden trabajan rápido, eso hay que reconocérselo.',
        '2': 'Rápido, sí. Ya veremos cuánto aguanta.'
      },
      circle: {
        '1': 'La gente del Círculo tararea mientras trabaja.',
        '2': 'Al menos es mejor que tu canto.'
      },
      cold: {
        '1': 'Qué frío hace esta mañana.',
        '2': 'Pues ven a ponerte junto a la forja.'
      }
    },
    smalltalkKids: {
      tag: {
        '1': '¡Te toca a ti, la quedas!',
        '2': '¡Eso no vale, no estaba listo!'
      },
      dragon: {
        '1': 'Cuando sea mayor voy a montar un dragón.',
        '2': 'Los dragones no dejan que los monten.',
        '3': 'Uno simpático quizá sí.'
      },
      sword: {
        '1': '¡Mira, he encontrado una espada!',
        '2': 'Eso es un palo.'
      },
      frog: {
        '1': 'Hay una rana junto al pozo.',
        '2': '¿Podemos quedárnosla?',
        '3': 'Mamá dijo que no más ranas.'
      }
    },
    ui: {
      overheard: 'Vecinos',
      hero: 'Tú',
      leave: 'Terminar la conversación',
      topics: '¿Qué decir?',
      gotGold: 'Recibido: {n} de oro',
      gotItem: 'Recibido: {item}',
      hint: 'Marcado en tu mapa: {zone}',
      needs: {
        attr: 'Requiere {n} de {attr}',
        level: 'Requiere nivel {n}',
        rep: 'Requiere reputación {n} con {faction}',
        gold: 'Requiere {n} de oro',
        full: 'Ya llevas todo lo que puedes',
        other: 'Todavía no'
      }
    },
    hero: {
      'siege': "Vamos a defender las murallas.",
      forge: 'Me gustaría usar tu forja.',
      learnSmith: '¿Podrías enseñarme a forjar?',
      ore: 'Tengo mineral para vender.',
      bye: 'Te dejo seguir con lo tuyo.',
      trade: '¿Puedo ver lo que tienes?',
      train: '¿Me enseñas algo?',
      heal: '¿Puedes curarme?',
      mana: '¿Tienes algo para el maná?',
      who: '¿Quién eres, si no te importa que pregunte?',
      rumor: '¿Has oído algo últimamente?',
      ready: '¿Crees que puedo aprender más?',
      brew: '¿Puedes prepararme algo?',
      play: 'Reparte, que juego.'
    },
    sunfordSmith: {
      forge: {
        '1': 'La forja está caliente. Cuidado con los dedos.'
      },
      learnSmith: {
        '2': 'Golpea cuando el metal brille más. Si fallas, es chatarra. Venga.',
        '1': '¿Forjar? Hm. Sujeta el martillo así, no como un garrote.'
      },
      ore: { '1': '¿Mineral, eh? Enséñamelo. Pago por pepita, peso justo.' },
      sellBack: { '1': 'Peso justo, moneda justa. Trae más cuando encuentres.' },
      forgeBack: {
        '1': 'No está mal. Tampoco está bien. Sigue así.'
      },
      hello: {
        '1': 'A ti no te había visto. ¿Eres quien despejó el camino?',
        '2': 'Bram. Yo llevo la forja. Si necesitas una hoja, ven a verme.'
      },
      kingDead: {
        '1': 'He oído que el Rey Goblin ha muerto. No lo echaré de menos.'
      },
      kingPact: {
        '1': 'Goblins comerciando en la plaza. Nunca pensé que lo vería.'
      },
      kingRansom: {
        '1': 'Dejaste que el Rey Goblin conservara la corona. Volverá, ya verás.'
      },
      ending: {
        '1': 'Todo el reino habla de ti. ¿Aun así necesitas una piedra de afilar?'
      },
      again: {
        '1': 'Otra vez por aquí. ¿Qué puedo hacer por ti?'
      },
      trade: {
        '1': 'Acero sencillo, precios justos. Echa un vistazo.'
      },
      who: {
        '1': 'Bram. Treinta años en este yunque, más o menos.',
        '2': 'Herraduras, arados, alguna espada. Últimamente, sobre todo espadas.'
      },
      gear: {
        '1': 'Un escudo, si piensas que te van a golpear. A casi todos les pasa.',
        '2': 'El acero pesado pide un brazo fuerte. Trabaja primero tu Fuerza.',
        say: '¿Qué debería llevarme ahí fuera?'
      },
      rumor: {
        plains: {
          '1': 'Hay bandidos en el camino de las llanuras. Yo empezaría por ahí, en tu lugar.'
        },
        hollows: {
          '1': 'Los goblins vienen de las Hondonadas, pasadas las llanuras. Su rey está allí abajo.'
        },
        woods: {
          '1': 'Al este de las llanuras está el Bosque Susurrante. Dicen que los árboles se mueven.'
        },
        siege: {
          '1': 'Hay humo hacia Oakhaven. Un ejército acampa en las afueras.'
        },
        north: {
          '1': 'El acero de Ironhold vuelve a bajar por el camino. Mejor que el mío, si soy sincero.'
        }
      },
      shopBack: {
        '1': 'Cuídalo y él te cuidará a ti.'
      },
      bye: {
        '1': 'Ve con cuidado.'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': '¡Oh, hola! ¿Compras o solo miras? Las dos cosas valen.',
        '2': 'Soy Tilly. Anillos, amuletos, cachivaches de todas partes.'
      },
      rival: {
        '1': '¿Has visto el puesto del goblin? Sus precios son más bajos que los míos. No es justo.'
      },
      again: {
        '1': '¡Aquí estás! He apartado unas cosas que creo que te gustarán.'
      },
      trade: {
        '1': 'Mira. Ese da suerte. Seguramente.'
      },
      who: {
        '1': 'Recorro los caminos y compro lo que la gente quiere quitarse de encima.',
        '2': 'Y a veces encuentro cosas. Los bandidos sueltan un montón cuando huyen.'
      },
      trinkets: {
        '1': 'Puedes llevar dos, uno en cada mano. Todo suma ahí fuera.',
        say: '¿Para qué sirven en realidad los abalorios?'
      },
      stolen: {
        '1': 'Ah. Tienes una forma de preguntar, ¿eh?',
        '2': 'Toma este anillo y no hablemos de dónde lo encontré.',
        say: '¿De dónde ha salido todo esto, de verdad?'
      },
      rumor: {
        arenaShut: {
          '1': 'Hay un viejo coliseo al sur. Cerrado a cal y canto mientras los goblins saquean.'
        },
        arenaOpen: {
          '1': 'El coliseo ha vuelto a abrir. Ocho oleadas, dicen. La gente apuesta por ello.'
        },
        east: {
          '1': 'Oakhaven paga bien por cualquier cosa que brille. Está al este, pasado el bosque.'
        }
      },
      shopBack: {
        '1': '¡Vuelve cuando lleves la bolsa más pesada!'
      },
      bye: {
        '1': 'Buen viaje. Agarra bien tus monedas ahí fuera.'
      }
    },
    trainerAegis: {
      hello: {
        '1': 'Ponte recto. Hablas con un caballero de la Orden de Hierro.',
        '1__f': 'Ponte recta. Hablas con un caballero de la Orden de Hierro.',
        '2': 'Ser Aldric. Enseño a ponerse entre los demás y el peligro.'
      },
      saved: {
        '1': 'Oakhaven sigue en pie, y me han dicho que estabas en su muralla. Bien hecho.'
      },
      fallen: {
        '1': 'Abriste la puerta de Oakhaven. No fingiré que lo he olvidado. ¿Qué quieres?'
      },
      dragon: {
        '1': '¿Mataste al dragón del pico? Me habría gustado verlo.'
      },
      friend: {
        '1': 'La Orden piensa bien de ti. Para sus amigos, mis lecciones cuestan menos.'
      },
      foe: {
        '1': 'La Orden te llama enemigo. Te enseñaré igualmente. Es decisión mía, no suya.',
        '1__f': 'La Orden te llama enemiga. Te enseñaré igualmente. Es decisión mía, no suya.'
      },
      again: {
        '1': '¿Vuelves para más ejercicios?'
      },
      train: {
        '1': 'Bien. Mira con atención, solo lo enseñaré una vez.'
      },
      class: {
        '1': 'Recibimos los golpes destinados a otros. Es sencillo, y es duro.',
        '2': 'Necesitarás Fuerza para el escudo y Aguante para sostenerlo.',
        say: '¿Qué hace exactamente un Caballero de la Égida?'
      },
      ready: {
        strong: {
          '1': 'Tienes fuerza para casi todo lo que sé. Sigue con tu Aguante.'
        },
        able: {
          '1': 'Estás listo para la siguiente lección. Que no se te suba a la cabeza.',
          '1__f': 'Estás lista para la siguiente lección. Que no se te suba a la cabeza.'
        },
        weak: {
          '1': 'Todavía no. Te cansarías antes que el escudo. Más Fuerza, más Aguante.'
        }
      },
      order: {
        '1': 'Mantenemos los caminos seguros y la ley en la mano. Algunos dicen que con demasiada firmeza.',
        '2': 'Ponte de nuestro lado y nuestros armeros y maestros te recordarán.',
        say: 'Háblame de la Orden de Hierro.'
      },
      trainBack: {
        '1': 'Practica hasta que aburra. Y luego sigue.'
      },
      bye: {
        '1': 'Ve con cuidado.'
      }
    },
    trainerPyro: {
      hello: {
        '1': 'Oh, ¿un alumno? Estupendo. Quizá deberías apartarte un poco.',
        '1__f': 'Oh, ¿una alumna? Estupendo. Quizá deberías apartarte un poco.',
        '2': 'Soy Ember Wren. Enseño fuego. Casi siempre hace lo que le pido.'
      },
      core: {
        '1': '¡Le diste el núcleo al Círculo! Me muero de ganas de ver qué aprendemos de él.'
      },
      friend: {
        '1': 'El Círculo habla bien de ti. Eso significa descuento, por cierto.'
      },
      foe: {
        '1': 'El Círculo no está contento contigo. Te enseñaré igualmente. En voz baja.'
      },
      again: {
        '1': '¡Has vuelto! ¿Listo para encender algo?',
        '1__f': '¡Has vuelto! ¿Lista para encender algo?'
      },
      train: {
        '1': 'Bien. Mira mis manos y mantén las mangas lejos de mí.'
      },
      class: {
        '1': 'Prender cosas, sobre todo. Y luego hacer que el fuego se extienda adonde quieras.',
        '2': 'Todo viene de la Inteligencia. Cuanto más afilada la mente, más caliente la llama.',
        say: '¿Qué hace exactamente un piromante?'
      },
      ready: {
        strong: {
          '1': '¿Sinceramente? Podrías enseñar parte de esto. Coge lo que quieras.'
        },
        able: {
          '1': 'Estás listo para el siguiente hechizo. Vamos, te lo enseño.',
          '1__f': 'Estás lista para el siguiente hechizo. Vamos, te lo enseño.'
        },
        weak: {
          '1': 'Aún no, me temo. Necesitas más Inteligencia, o el fuego te domina.'
        }
      },
      circle: {
        '1': 'Eruditos. Estudiamos de qué está hecho el mundo. Parte de ello explota.',
        say: '¿Quiénes son el Círculo del Éter?'
      },
      trainBack: {
        '1': 'Ve a practicar. En algún sitio donde no prenda nada, por favor.'
      },
      bye: {
        '1': '¡Cuídate!'
      }
    },
    elderMara: {
      hello: {
        '1': 'Así que eres el del camino. Ven, déjame mirarte.',
        '1__f': 'Así que eres la del camino. Ven, déjame mirarte.',
        '2': 'Soy Mara. Cuido de este pueblo desde hace... oh, cuarenta años ya.'
      },
      slain: {
        '1': 'Las Hondonadas están en silencio. Lo que hiciste fue duro, pero gracias a ello dormimos.'
      },
      pact: {
        '1': 'Goblins vendiendo en mi plaza. Los convenciste tú, ¿verdad?'
      },
      ransom: {
        '1': 'Cogiste su oro y le dejaste la corona. No fingiré que no estoy decepcionada.'
      },
      saved: {
        '1': 'Llegaron noticias de Oakhaven. La puerta resistió. Me alegro de que estuvieras allí.'
      },
      fallen: {
        '1': 'Dicen que Oakhaven ardió. Prefiero no oír cómo. Hoy no.'
      },
      ending: {
        '1': 'Dicen que decidiste el destino de la Fortaleza del Terror. De nuestro pequeño camino a eso.'
      },
      again: {
        '1': 'Siéntate un momento. El camino seguirá ahí.'
      },
      reward: {
        '1': 'Mantuviste el camino cuando nuestra milicia no pudo. El pueblo ha reunido un poco.',
        '2': 'No es mucho. Es lo que pudimos dar.',
        say: '¿Alguien dijo que querías verme?'
      },
      quest: {
        '1': 'Las incursiones vienen de las Hondonadas Goblin. Se han coronado un rey.',
        '2': '¿Y quieres que muera?',
        '3': 'Quiero que las incursiones paren. Cómo... eso lo decidirás tú, allí abajo.',
        '4': 'Las Hondonadas están justo pasadas las llanuras. Por favor, ten cuidado.',
        say: '¿Qué preocupa a Sunford?'
      },
      king: {
        say: 'Sobre el Rey Goblin...',
        slay: {
          '1': 'Ya no está, y las caravanas circulan de nuevo. No te preguntaré cómo se sintió.'
        },
        pact: {
          '1': 'Un pacto comercial. Mi madre se habría desmayado. Aun así, el comercio es mejor que los funerales.'
        },
        ransom: {
          '1': 'El oro se acaba pronto. Los rencores, no. Recuérdalo cuando empiecen las incursiones.'
        }
      },
      town: {
        '1': 'Sobre todo granjeros. Un herrero, una curandera, dos maestros que nos aguantan.',
        '2': 'Descansa aquí entre viajes. Para eso sirve un hogar.',
        say: 'Háblame de Sunford.'
      },
      next: {
        say: '¿Adónde debería ir ahora?',
        plains: {
          '1': 'El camino de las llanuras, primero. Sin las caravanas, no comemos.'
        },
        hollows: {
          '1': 'Las Hondonadas Goblin. Nada es seguro mientras sigan las incursiones.'
        },
        woods: {
          '1': 'Al este, por el Bosque Susurrante. Ese es el camino a Oakhaven.'
        },
        oakhaven: {
          '1': 'Oakhaven está sitiada. Si caen las afueras, cae el pueblo con ellas.'
        },
        north: {
          '1': 'Al norte, creo. Los Riscos Cenicientos, y más allá Ironhold. Solo se pone más difícil.'
        }
      },
      bye: {
        '1': 'Vuelve a nosotros de una pieza. Es todo lo que pido.'
      },
      map: {
        '1': '¡El mapa del capitán Rook! Lo rompió y escondió los trozos antes de que los goblins lo atraparan.',
        '2': "Encuentra seis de los trozos y la X te mostrará el camino: en algún lugar de los Riscos Cenicientos. Cava allí para el oro.",
        say: 'He encontrado un trozo de un mapa antiguo.'
      }
    },
    sunfordHealer: {
      hello: {
        '1': 'Quieto un momento. No, estás bien. La costumbre, perdona.',
        '1__f': 'Quieta un momento. No, estás bien. La costumbre, perdona.',
        '2': 'Soy la Hermana Lune. Remiendo lo que el camino rompe.'
      },
      again: {
        '1': '¿Todavía de una pieza? Bien. Siéntate igualmente.'
      },
      heal: {
        '1': 'Siéntate, descansa un rato. Te llenaré los frascos antes de que te vayas.'
      },
      mana: {
        '1': 'Esta es amarga. Bébela cuando se te acaben los hechizos.'
      },
      brew: {
        '1': 'Enséñame tus hierbas. Prepararé algo que sepa mejor que mi tónico de maná.'
      },
      potions: {
        '1': 'Llevas unos cuantos frascos a cada combate. Bebe antes de necesitarlo, no después.',
        '2': 'Si quieres llevar más, puedo venderte un cinturón más grande.',
        say: '¿Cómo funcionan las pociones?'
      },
      rumor: {
        goblins: {
          '1': 'Los goblins untan sus piedras de honda con algo. Si te sientes mal, vuelve.'
        },
        spiders: {
          '1': 'Esta semana he tratado tres picaduras de araña del Bosque. Ten cuidado allí.'
        },
        burns: {
          '1': 'Siguen bajando soldados del norte con quemaduras. Los Riscos Cenicientos, dicen.'
        }
      },
      healBack: {
        '1': 'Mantén el cinturón lleno y la cabeza gacha.'
      },
      brewBack: {
        '1': 'Con cuidado, están calientes. No te los bebas todos de golpe.'
      },
      bye: {
        '1': 'Cuídate ahí fuera.'
      }
    },
    goblinTrader: {
      hello: {
        '1': 'Eres quien hizo el pacto. Mi rey dice que eres bienvenido aquí.',
        '1__f': 'Eres quien hizo el pacto. Mi rey dice que eres bienvenida aquí.',
        '2': 'Soy Grik. Vendo lo que hacen los goblins. Buen trabajo, precio justo.'
      },
      again: {
        '1': 'Amigo. Me alegro de verte otra vez.',
        '1__f': 'Amiga. Me alegro de verte otra vez.'
      },
      trade: {
        '1': 'Mira, por favor. Mi familia hizo esto.'
      },
      king: {
        '1': 'Ahora come bien. No más incursiones. Mi pueblo tiene menos hambre.',
        '2': 'Habla a menudo de ti. Con respeto.',
        say: '¿Cómo está tu rey?'
      },
      town: {
        '1': 'La gente aún mira. Pero el panadero me da tarta. Me gusta la tarta.',
        say: '¿Qué te parece Sunford?'
      },
      rumor: {
        crags: {
          '1': 'Mis primos cavan en la roca negra del norte. Dicen que ahora el fuego camina allí.'
        },
        deep: {
          '1': 'Algo despierta en los lugares profundos. Los goblins lo sienten en el suelo.'
        }
      },
      shopBack: {
        '1': 'Gracias. Vuelve.'
      },
      bye: {
        '1': 'Ve seguro, amigo.',
        '1__f': 'Ve segura, amiga.'
      }
    },
    captainHale: {
      hello: {
        '1': 'Otra espada. Bien. Necesitamos todas las que podamos.',
        '2': 'Capitán Hale. Mando lo que queda de la guardia de Oakhaven.'
      },
      saved: {
        '1': 'La puerta resistió. Trescientos años, y uno más. Te lo debo.'
      },
      ending: {
        '1': 'Dicen que decidiste lo de la Fortaleza del Terror. Mis murallas parecen pequeñas a su lado.'
      },
      again: {
        '1': 'Las murallas siguen en pie. Por hoy, al menos.'
      },
      after: {
        '1': 'Me alegra verte. Oakhaven no ha olvidado.'
      },
      quest: {
        '1': 'Mal. Un señor de la guerra llamado Krag nos tiene rodeados, y no lucha gratis.',
        '2': '¿Quién le paga?',
        '3': 'El Sindicato Ceniciento. Quieren una ciudad propia, y la nuestra tiene murallas.',
        '4': 'Destruye su campamento en las Afueras de Oakhaven. Ahí acaba esto, de un modo u otro.',
        say: '¿Cómo de mal está?'
      },
      siege: {
        '1': 'Te ofrecieron un tercio del pueblo, ¿verdad? A mí me ofrecieron un cuarto.',
        '2': 'El Sindicato irá tras de ti ahora. Cúbrete las espaldas en los caminos.',
        say: 'Sobre el asedio...'
      },
      town: {
        '1': 'Una ciudad comercial. Todo lo que va de las llanuras a las montañas paga peaje aquí.',
        '2': 'Por eso todos la quieren. Y por eso yo no la suelto.',
        say: 'Háblame de Oakhaven.'
      },
      order: {
        '1': 'Respondo ante Oakhaven. La Orden y yo estamos de acuerdo casi siempre. No siempre.',
        say: '¿Respondes ante la Orden de Hierro?'
      },
      rumor: {
        crags: {
          '1': 'Al norte del bosque el suelo es negro y arde. Los Riscos Cenicientos. Sobre todo cultistas.'
        },
        mines: {
          '1': 'Ironhold ha dejado de enviar acero. Algo va mal en sus minas.'
        },
        north: {
          '1': 'El extremo norte se ha quedado en silencio. Por mi experiencia, eso nunca es bueno.'
        }
      },
      bye: {
        '1': 'Ten tu espada a mano.'
      }
    },
    oakArmorer: {
      forge: {
        '1': 'El yunque es tuyo. Haz algo que aguante.'
      },
      learnSmith: {
        '2': 'Mira el brillo. Golpea en su corazón, tres veces, y el metal lo recuerda.',
        '1': '¿Quieres aprender el oficio? Bien. Oakhaven necesita cada martillo.'
      },
      ore: { '1': '¡Mineral en bruto! A la armería nunca le basta. Véndeme lo que te sobre.' },
      sellBack: { '1': 'Cada pepita va a la muralla. Gracias.' },
      forgeBack: {
        '1': 'Buen acero. Las murallas te lo agradecen.'
      },
      hello: {
        '1': 'Si buscas un casco, lo siento. Están todos en la muralla.',
        '2': 'Odo. Hago armaduras. No he dormido mucho últimamente.'
      },
      again: {
        '1': 'Sigo aquí. Sigo escaso de casi todo.'
      },
      trade: {
        '1': 'La mitad de mi género se fue a la muralla. Llévate lo que quede, si te sirve.'
      },
      who: {
        '1': 'Llevo veinte años armando a este pueblo. Nunca lo había visto todo puesto a la vez.'
      },
      armor: {
        '1': 'Placas, si aguantas pie firme. Cuero, si te mueves. Túnicas, si eres rápido.',
        '1__f': 'Placas, si aguantas pie firme. Cuero, si te mueves. Túnicas, si eres rápida.',
        say: '¿Qué armadura debería llevar?'
      },
      rumor: {
        backRoom: {
          '1': 'Si el asedio se rompe, abriré la trastienda. Las buenas placas están ahí.'
        }
      },
      shopBack: {
        '1': 'Aguantará. Ha aguantado hasta ahora.'
      },
      bye: {
        '1': 'Cabeza gacha ahí fuera.'
      }
    },
    oakMasterArmorer: {
      forge: {
        '1': 'El fuego está avivado y esperando. Adelante.'
      },
      learnSmith: {
        '2': 'Tres golpes, cada uno en el corazón del brillo. Ese es todo el secreto.',
        '1': 'Desde el asedio enseño a cualquiera que lo pida. Ven, ponte aquí.'
      },
      ore: { '1': '¿Más mineral para las murallas? Pago cada pepita que puedas darme.' },
      sellBack: { '1': 'Bendito seas. Eso son más placas para las murallas.' },
      forgeBack: {
        '1': 'Cada golpe te hace mejor. Vuelve cuando quieras.'
      },
      hello: {
        '1': '¡Ahí estás! Pasa. La trastienda está abierta, y abierta para ti.',
        '2': 'Maestro Odo, me llaman ahora. Qué curioso lo que un poco de paz hace por el negocio.'
      },
      ending: {
        '1': 'De nuestra puerta a la Fortaleza del Terror. Les digo a todos que yo ajusté tu armadura.'
      },
      again: {
        '1': 'Me alegra verte. ¿Qué va a ser hoy?'
      },
      trade: {
        '1': 'Las buenas placas están fuera. Te has ganado de sobra echarles un vistazo.'
      },
      town: {
        '1': 'Ajetreada. Ruidosa. Llena de mercaderes quejándose del peaje.',
        '2': 'Es maravilloso. Hace semanas que no tengo una hora tranquila.',
        say: '¿Cómo va el pueblo?'
      },
      rumor: {
        mines: {
          '1': 'Mi acero viene de Ironhold, y se han quedado callados. Alguien debería revisar sus minas.'
        },
        tundra: {
          '1': 'El mejor mineral que trabajé salió de la tundra. Los hombres que lo encontraron no volvieron.'
        }
      },
      shopBack: {
        '1': 'Si no te sienta bien, tráelo. Lo arreglaré.'
      },
      bye: {
        '1': 'Aquí siempre eres bienvenido.',
        '1__f': 'Aquí siempre eres bienvenida.'
      }
    },
    oakWeapons: {
      hello: {
        '1': '¿Miras o compras? Cualquiera de las dos vale. Solo no toques los filos.',
        '2': 'Senna. Vendo hojas. Lo que hagas con ellas es cosa tuya.'
      },
      saved: {
        '1': 'Así que el asedio se rompió. Bien para el pueblo. Aunque la guerra era mejor para mi negocio.'
      },
      again: {
        '1': '¿Vuelves por algo más afilado?'
      },
      trade: {
        '1': 'Afiladas, equilibradas y a buen precio. Tómate tu tiempo.'
      },
      who: {
        '1': 'He vendido a los dos bandos de tres guerras. Sigo aquí. La mayoría de ellos no.'
      },
      rumor: {
        krag: {
          '1': 'Los hombres de Krag llevan buen acero. Dinero del Sindicato. Merece la pena cogerlo, si puedes.'
        },
        which: {
          '1': 'Las hojas rápidas quieren Destreza. Los arcos y las armas de fuego, Técnica. Sabe cuál eres.'
        }
      },
      shopBack: {
        '1': 'Mantenla aceitada. El óxido arruina un buen filo más rápido que el hueso.'
      },
      bye: {
        '1': 'Procura no morir debiéndome dinero.'
      }
    },
    trainerShadow: {
      hello: {
        '1': 'No me oíste llegar. La mayoría no.',
        '2': 'Me llaman el Susurro. Enseño a que no te vean.'
      },
      fallen: {
        '1': 'El pueblo está más tranquilo ahora. Menos guardias. Trabajo más fácil, para algunos de nosotros.'
      },
      friend: {
        '1': 'El Sindicato te cuenta como amigo. Los amigos pagan menos. Recuérdalo.',
        '1__f': 'El Sindicato te cuenta como amiga. Los amigos pagan menos. Recuérdalo.'
      },
      foe: {
        '1': 'El Sindicato te quiere muerto. A mí me pagaron para enseñar, no para matar. Así que, lecciones.',
        '1__f': 'El Sindicato te quiere muerta. A mí me pagaron para enseñar, no para matar. Así que, lecciones.'
      },
      again: {
        '1': 'Sigues siendo demasiado ruidoso. Trabajaremos en ello.',
        '1__f': 'Sigues siendo demasiado ruidosa. Trabajaremos en ello.'
      },
      train: {
        '1': 'En silencio, entonces. Mira mis pies, no mis manos.'
      },
      class: {
        '1': 'Alguien que ya está detrás de ti. Entra, un corte y fuera.',
        '2': 'Lo que más cuenta es la Destreza. Técnica, si quieres que el corte importe.',
        say: '¿Qué es una Hoja Sombría?'
      },
      ready: {
        strong: {
          '1': 'Ya te mueves bien. Coge el resto. Trae algo de Técnica para el humo.'
        },
        able: {
          '1': 'Tus manos son lo bastante rápidas. Siguiente paso.'
        },
        weak: {
          '1': 'Todavía no. Pisas pesado. Trabaja tu Destreza.'
        }
      },
      syndicate: {
        '1': 'Gente que se dio cuenta de que la ley tiene precio. No juzgo. Solo me pagan.',
        say: '¿Quiénes son el Sindicato Ceniciento?'
      },
      trainBack: {
        '1': 'Ahora practica donde nadie te vea.'
      },
      bye: {
        '1': 'Nunca me viste.'
      }
    },
    trainerSovereign: {
      hello: {
        '1': 'Puedes acercarte. Ahí, eso es suficiente.',
        '2': 'Lord Castellan, de la familia más antigua de Oakhaven. Enseño el mando.'
      },
      saved: {
        '1': 'Mi ciudad sigue en pie, y con ella el nombre de mi familia. Tienes mi gratitud. De veras.'
      },
      friend: {
        '1': 'Un amigo de la Orden. Reduciré mis honorarios. Por favor, no lo vayas contando.',
        '1__f': 'Una amiga de la Orden. Reduciré mis honorarios. Por favor, no lo vayas contando.'
      },
      foe: {
        '1': 'La Orden tiene tu nombre en una lista. Te enseñaré igualmente. Una moneda es una moneda.'
      },
      again: {
        '1': 'Ah, tú otra vez. ¿Continuamos?'
      },
      train: {
        '1': 'Muy bien. Observa cómo se da una orden, y cómo se sigue.'
      },
      class: {
        '1': 'Alguien que no lucha solo. Llamas a los guardias y luchan por ti.',
        '2': 'Requiere Carisma. Nadie sigue a un líder al que no puede oír.',
        say: '¿Qué es un Gran Soberano?'
      },
      ready: {
        strong: {
          '1': 'Ya tienes verdadera presencia. Toma el resto de mis lecciones.'
        },
        able: {
          '1': 'Tu voz llega lejos. Estás listo para la siguiente lección.',
          '1__f': 'Tu voz llega lejos. Estás lista para la siguiente lección.'
        },
        weak: {
          '1': 'Me temo que aún nadie te seguiría. Trabaja tu Carisma.'
        }
      },
      family: {
        '1': 'Construimos las murallas sobre las que se alza el Capitán Hale. Lo olvida. Yo se lo recuerdo.',
        say: 'Háblame de tu familia.'
      },
      trainBack: {
        '1': 'Ve, pues. Dirige a alguien.'
      },
      bye: {
        '1': 'Buen día.'
      }
    },
    oakHealer: {
      hello: {
        '1': '¡Siguiente! Oh, vienes andando. Eso es un cambio agradable.',
        '2': 'Hermano Fenn. Cuarenta heridos en la muralla, y solo uno de mí.'
      },
      saved: {
        '1': 'Tres días sin heridos nuevos. Apenas sé qué hacer conmigo mismo.'
      },
      again: {
        '1': 'Tú otra vez, y sobre tus propios pies. Bien.'
      },
      heal: {
        '1': 'Túmbate aquí, en el catre limpio. Ya. Frascos llenos, andando.'
      },
      mana: {
        '1': 'Poción de maná. Sabe a monedas viejas, pero funciona.'
      },
      potions: {
        '1': 'Con un cinturón más largo, sí. Los vendo. Llenar los frascos es gratis.',
        say: '¿Puedo llevar más pociones?'
      },
      rumor: {
        archers: {
          '1': 'Los arqueros de Krag apuntan bajo. Sigue moviéndote y casi siempre fallarán.'
        },
        north: {
          '1': 'Veo quemaduras, congelaciones y a un hombre que jura que una estatua lo mordió.'
        }
      },
      healBack: {
        '1': 'Andando. La próxima vez ven a charlar en lugar de a que te cosa.'
      },
      bye: {
        '1': 'Cuídate. Y come algo.'
      }
    },
    blackMarket: {
      hello: {
        '1': 'Aquí no hay nombres. Pero sé quién abrió la puerta. Todo el mundo lo sabe.',
        '2': 'Puedes llamarme el Perista. Todo lo que hay aquí vino de alguna parte.'
      },
      foe: {
        '1': 'Ahora mismo no le caes bien al Sindicato. Tu oro, en cambio, es bienvenido.'
      },
      again: {
        '1': 'Otra vez por aquí. ¿Nadie te ha seguido, espero?'
      },
      trade: {
        '1': 'Sin preguntas, para ninguno de los dos. El Sindicato se lleva su parte, tú te llevas la mercancía.'
      },
      who: {
        '1': 'Antes del incendio vendía velas. Trabajo honrado. No daba dinero.'
      },
      armor: {
        '1': 'Los armeros se han ido, amigo. Tú sabrás mejor que yo por qué.',
        '1__f': 'Los armeros se han ido, amiga. Tú sabrás mejor que yo por qué.',
        say: '¿Vendéis armaduras?'
      },
      rumor: {
        citadel: {
          '1': 'El año pasado apareció una fortaleza en el extremo norte. Nadie la construyó.'
        },
        crystals: {
          '1': 'Alguien compra todos los cristales del Vacío que encuentra. Nosotros no. Eso me preocupa.'
        }
      },
      shopBack: {
        '1': 'Nunca estuviste aquí.'
      },
      bye: {
        '1': 'Mira dónde pisas. Los escombros se mueven.'
      }
    },
    trainerBlood: {
      hello: {
        '1': 'Una visita. Por favor, no toques los frascos.',
        '2': 'Doctor Sangrel. Los nuevos dueños de Oakhaven no preguntan qué enseño. Es relajante.'
      },
      found: {
        '1': 'Me encontraste. No muchos buscan a un doctor en un lugar como este.',
        '2': 'Doctor Sangrel. Los pueblos queman a gente como yo, así que trabajo donde no hay ninguno.'
      },
      friend: {
        '1': 'El Sindicato responde por ti. A sus amigos les cobro menos. Mis exigencias siguen igual.'
      },
      foe: {
        '1': 'El Sindicato pagaría bien por tu sangre. Prefiero que la gastes aquí.'
      },
      again: {
        '1': 'Estás pálido. Bien. Le sienta al trabajo.',
        '1__f': 'Estás pálida. Bien. Le sienta al trabajo.'
      },
      train: {
        '1': 'Arremángate. Dolerá. Ese es más o menos el objetivo.'
      },
      class: {
        '1': 'Pagas el poder con tu propia salud, y luego se lo quitas a tus enemigos.',
        '2': 'El Aguante es lo que tienes para gastar. La Inteligencia es lo bien que lo gastas.',
        say: '¿Qué es un Alquimista de Sangre?'
      },
      ready: {
        strong: {
          '1': 'Una constitución notable. Puedes aprender casi todo.'
        },
        able: {
          '1': 'Eres lo bastante resistente para la siguiente lección.'
        },
        weak: {
          '1': 'Te desmayarías en el primer corte. Primero desarrolla tu Aguante, por favor.'
        }
      },
      jars: {
        '1': 'Muestras. Entregadas libremente, en su mayoría.',
        say: '¿Qué hay en los frascos?'
      },
      trainBack: {
        '1': 'Toma notas, eso sí. Me gustaría saber cómo va.'
      },
      bye: {
        '1': 'Mantente sano. Lo digo en serio.'
      }
    },
    syndicateBoss: {
      hello: {
        '1': 'Así que eres quien abrió la puerta. Siéntate. Te has ganado una silla.',
        '2': 'Me llaman Madame Ash. Oakhaven es nuestra ahora. En parte gracias a ti.'
      },
      throneOurs: {
        '1': 'La Fortaleza del Terror, en nuestras manos. Valiste cada moneda.'
      },
      throneLost: {
        '1': 'Le diste el trono a otro. Hablaremos de eso. Hoy no.'
      },
      foe: {
        '1': 'Has trabajado contra nosotros. Siéntate igualmente. Me gusta saber con quién trato.'
      },
      again: {
        '1': 'Otra vez por aquí. ¿Qué puede hacer el Sindicato por ti?'
      },
      cut: {
        '1': 'Y la tendrás. Una parte de unas ruinas, por ahora. Aquí tienes la de esta temporada.',
        '2': 'Crecerá. Unas ruinas rinden muy bien cuando eres dueño de su único mercado.',
        say: 'Me prometieron una parte de Oakhaven.'
      },
      syndicate: {
        '1': 'Lo que quiere todo el mundo. Nosotros solo no fingimos lo contrario.',
        '2': 'Sigue siendo amistoso y el Susurro y el Doctor te cobrarán menos.',
        say: '¿Qué quiere realmente el Sindicato?'
      },
      order: {
        '1': 'Claro que sí. Quemaste una de sus ciudades. Lleva pociones de más.',
        say: 'La Orden de Hierro va tras de mí.'
      },
      rumor: {
        core: {
          '1': 'Los enanos han encontrado algo en sus minas. Un núcleo. Tráelo y pon tu precio.'
        },
        sold: {
          '1': 'El núcleo llegó sano y salvo. Te sorprendería lo que le hace a una cerradura.'
        },
        north: {
          '1': 'Todo lo que vale la pena se ha ido al norte. Nosotros también.'
        }
      },
      bye: {
        '1': 'No seas un extraño. A los extraños los vigilamos.',
        '1__f': 'No seas una extraña. A los extraños los vigilamos.'
      }
    },
    forgemaster: {
      hello: {
        '1': 'Has subido por las minas. Te huelo el polvo.',
        '2': 'Dorn. Maestro forjador de Ironhold. Y tengo un problema del tamaño de una montaña.'
      },
      destroyed: {
        '1': 'La luz se apagó y los golems son chatarra. Mis mineros cantaron anoche. La primera vez en un año.'
      },
      studied: {
        '1': 'Fuego azul en mis forjas y eruditos con túnica en mis salas. Al menos el trabajo es bueno.'
      },
      sold: {
        '1': 'Lo vendiste. Los golems siguen andando, y mis minas siguen siendo una tumba. Déjame en paz.'
      },
      ending: {
        '1': 'Así que el trono está decidido. Bien. Quizá ahora podamos volver a cavar.'
      },
      again: {
        '1': '¿Qué pasa? La forja no espera.'
      },
      quest: {
        '1': 'Cavamos buscando hierro y encontramos un corazón. Un núcleo de éter. Se le siente latir.',
        '2': '¿Y los gólems?',
        '3': 'Se mueven a su ritmo. Tres poderes han escrito pidiéndolo. No me fío de ninguno.',
        '4': 'Llegarás tú primero, al fondo de las Minas de Ironhold. Lo que pase entonces depende de ti.',
        say: '¿Qué pasó abajo en las minas?'
      },
      core: {
        say: 'Sobre el núcleo...',
        destroy: {
          '1': 'Rompiste una maravilla para salvar a mi pueblo. La Orden envió armeros. Yo envié cerveza.'
        },
        study: {
          '1': 'La gente del Círculo es rara, pero sus armas disparan derecho. Vale.'
        },
        sell: {
          '1': 'Lo hiciste por oro. Espero que te dé calor.'
        }
      },
      town: {
        '1': 'El mejor acero del reino, cuando las minas funcionan.',
        '2': 'Piedepiedra enseña la tierra, Pim las máquinas. Los dos te dejarán sin oídos.',
        say: 'Háblame de Ironhold.'
      },
      rumor: {
        tundra: {
          '1': 'Al este de los Riscos la tierra se vuelve blanca. La Tundra Mordehielo. Gigantes, y cosas peores.'
        },
        citadel: {
          '1': 'Mis exploradores vieron una fortaleza al norte que el año pasado no estaba. No me gusta.'
        },
        fortress: {
          '1': 'Todo acaba en la Fortaleza del Terror. Todos los caminos del norte llevan allí.'
        }
      },
      bye: {
        '1': 'Que te vaya bien.'
      }
    },
    ironWeapons: {
      forge: {
        '1': 'Cuidado con las chispas, y no toques mi martillo bueno.'
      },
      learnSmith: {
        '2': 'El brillo te dice cuándo. Tu brazo te dice con qué fuerza. Tres golpes.',
        '1__f': '¿Una de la superficie en el yunque? Bueno, todo el mundo empieza por algún sitio.',
        '1': '¿Uno de la superficie en el yunque? Bueno, todo el mundo empieza por algún sitio.'
      },
      ore: { '1': 'Buen metal, honrado. Ponlo aquí, pago por pepita.' },
      sellBack: { '1': 'Trato justo. Ironhold siempre paga el buen metal.' },
      forgeBack: {
        '1': 'Un enano lo habría hecho mejor. Pero no mucho mejor.'
      },
      hello: {
        '1': 'Cuidado con la exposición. Esas cortan por ambos filos.',
        '2': 'Hilda Hammerhand. Cada pieza de aquí fue forjada por manos enanas.'
      },
      dragon: {
        '1': '¿Mataste al dragón? Espero que fuera con una de mis hojas.'
      },
      again: {
        '1': '¿Vuelves por acero de verdad?'
      },
      trade: {
        '1': 'Forjado por enanos. Si una de estas se rompe, querré saber cómo.'
      },
      who: {
        '1': 'Mi madre forjaba para reyes. Yo forjo para quien cruce la puerta.'
      },
      rumor: {
        golems: {
          '1': 'Esos golems de ahí abajo están hechos de nuestro propio hierro. Duele, te lo aseguro.'
        },
        arm: {
          '1': 'Una buena hoja hace la mitad del trabajo. Tu Fuerza tiene que hacer el resto.'
        }
      },
      shopBack: {
        '1': 'Tráela desafilada y sabré que la has usado bien.'
      },
      bye: {
        '1': 'Golpea fuerte.'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': 'Cuidado, esa está cargada. La mayoría lo están, en realidad.',
        '2': 'Voss el Inventor. El Círculo me envió a estudiar el núcleo. Nos ha enseñado tanto.'
      },
      again: {
        '1': 'Ah, bien. He hecho unos cambios desde tu última visita.'
      },
      trade: {
        '1': 'Todo esto salió de estudiar el núcleo. Solo no me apuntes con ello.'
      },
      core: {
        '1': 'Ese metal puede pensar, un poco. Intento no darle vueltas.',
        say: '¿Qué te enseñó el núcleo?'
      },
      rumor: {
        heat: {
          '1': 'Las armas de fuego funcionan con Técnica, y se calientan. Pregúntale a Pim por el calor antes de quemarte una mano.'
        }
      },
      shopBack: {
        '1': 'Dime cómo se maneja. Estoy tomando notas.'
      },
      bye: {
        '1': 'Cuidado con el retroceso.'
      }
    },
    ironArmor: {
      forge: {
        '1': 'La forja está lista cuando tú lo estés.'
      },
      learnSmith: {
        '2': 'Calentar, golpear, girar. Tres golpes, justo en el brillo. Luego dejar enfriar.',
        '1': 'Las placas son un trabajo de paciencia. Te enseñaré lo básico.'
      },
      ore: { '1': 'Déjame pesarlo. Elige qué vendes, yo cuento las monedas.' },
      sellBack: { '1': 'Pesado y pagado. Bien.' },
      forgeBack: {
        '1': 'Deja que se enfríe antes de ponértela.'
      },
      hello: {
        '1': 'Garrun. Armaduras en los soportes, anillos en la bandeja.'
      },
      again: {
        '1': 'Otra vez. ¿Qué necesitas?'
      },
      trade: {
        '1': 'Esa placa detendrá la maza de un gigante. Echa un vistazo.'
      },
      quiet: {
        '1': 'No hay mucho que valga la pena decir.',
        say: 'No hablas mucho, ¿eh?'
      },
      rumor: {
        giants: {
          '1': 'Gigantes en la tundra. Mazas como troncos. Yo cogería la placa pesada.'
        },
        demons: {
          '1': 'Demonios en el norte. Fuego y garras. Yo cogería la placa pesada.'
        }
      },
      shopBack: {
        '1': 'Buena elección.'
      },
      bye: {
        '1': 'Cuídate.'
      }
    },
    ironOrderArmor: {
      forge: {
        '1': 'Usa la forja de la Orden con honor.'
      },
      learnSmith: {
        '2': 'Disciplina en el yunque, como en el campo. Tres golpes, fieles al brillo.',
        '1': 'La Orden arma a sus amigos. Te enseñaré.'
      },
      ore: { '1': 'La Orden compra mineral para la guerra. Vende lo que te sobre.' },
      sellBack: { '1': 'Tu pago queda anotado. La Orden te lo agradece.' },
      forgeBack: {
        '1': 'Bien forjado. Sirve bien con ella.'
      },
      hello: {
        '1': 'Eres quien destruyó el núcleo. La Orden lo recuerda.',
        '2': 'Soy el intendente de la Orden aquí. Nuestras armerías están abiertas para ti.'
      },
      throneOurs: {
        '1': 'La Orden tiene la Fortaleza del Terror, gracias a ti. Descansa. Te lo has ganado.'
      },
      foe: {
        '1': 'La Orden te tiene en una lista. Mis órdenes dicen que te venda igualmente. Las cumpliré.'
      },
      again: {
        '1': '¿Qué necesitas?'
      },
      trade: {
        '1': 'Coge lo que necesites. La Orden cuida de los suyos.'
      },
      order: {
        '1': 'Nada, por ahora. Eso no pasa a menudo. Disfrútalo.',
        say: '¿Qué quiere la Orden de mí?'
      },
      rumor: {
        throne: {
          '1': 'La Orden querrá el trono de la Fortaleza del Terror. Recordará quién ayudó.'
        }
      },
      shopBack: {
        '1': 'Cuídalo. Es propiedad de la Orden hasta que hayas sangrado con él.'
      },
      bye: {
        '1': 'Continúa.'
      }
    },
    trainerGeo: {
      hello: {
        '1': 'Despacio. La montaña no se va a ir a ninguna parte.',
        '2': 'Me llaman Viejo Piedepiedra. Escucho el suelo. A veces responde.'
      },
      core: {
        '1': 'La montaña se siente distinta desde que bajaste allí. Más calmada, o más vacía.'
      },
      dragon: {
        '1': 'Ayer un dragón sobrevoló el pico y nos dejó en paz. Obra tuya, me dicen.'
      },
      again: {
        '1': 'Aquí estás. Pensé que volverías.'
      },
      train: {
        '1': 'Planta los pies. ¿Lo sientes? ¿No? Ahí empezamos.'
      },
      class: {
        '1': 'Levantamos muros, hacemos surgir púas y rompemos el suelo cuando hace falta.',
        '2': 'Fuerza para mover la piedra. Inteligencia para saber adónde quiere ir.',
        say: '¿Qué hace un Geomante?'
      },
      ready: {
        strong: {
          '1': 'La piedra ya te conoce. Aprende el resto cuando estés listo.',
          '1__f': 'La piedra ya te conoce. Aprende el resto cuando estés lista.'
        },
        able: {
          '1': 'Estás lo bastante firme para la siguiente lección.'
        },
        weak: {
          '1': 'Todavía no. La piedra no se moverá por ti. Desarrolla tu Fuerza.'
        }
      },
      factions: {
        '1': 'Ninguna. Órdenes y gremios van y vienen. La montaña se queda.',
        say: '¿A qué facción sirves?'
      },
      trainBack: {
        '1': 'Tómate tu tiempo. El suelo es paciente.'
      },
      bye: {
        '1': 'Camina suave.'
      }
    },
    trainerAether: {
      hello: {
        '1': '¡Ah, espera, no toques eso! Ni eso. Ponte en la alfombra, la alfombra es segura.',
        '2': 'Pim el Engranajero. Construyo armas de fuego, torretas y un montón de indicadores de calor.'
      },
      core: {
        '1': '¡Le diste el núcleo al Círculo! Casi no he dormido desde entonces. Para bien.'
      },
      oracle: {
        '1': 'El Círculo está furioso por lo del oráculo. Yo solo construyo cosas. Prefiero no meterme.'
      },
      friend: {
        '1': 'Eres amigo del Círculo, así que tus lecciones salen más baratas. Yo hice el papeleo.',
        '1__f': 'Eres amiga del Círculo, así que tus lecciones salen más baratas. Yo hice el papeleo.'
      },
      foe: {
        '1': 'El Círculo dice que no debería enseñarte. Lo haré igualmente. No se lo digas.'
      },
      again: {
        '1': 'Oh, qué bien, todavía tienes todos los dedos.'
      },
      train: {
        '1': 'Bien. Primero la seguridad, luego la parte ruidosa.'
      },
      class: {
        '1': 'Armas de fuego, torretas y un indicador de calor. Disparar, construir y ventilar antes de bloquearse.',
        '2': 'Sobre todo Técnica. Un poco de Inteligencia para las máquinas grandes.',
        say: '¿Qué es un Éter-Tec?'
      },
      ready: {
        strong: {
          '1': 'Ya te manejas con una torreta. Coge las máquinas grandes.'
        },
        able: {
          '1': 'Manos firmes. Estás listo para la siguiente.',
          '1__f': 'Manos firmes. Estás lista para la siguiente.'
        },
        weak: {
          '1': 'Tu puntería aún tiembla un poco. Pon algunos puntos en Técnica.'
        }
      },
      heat: {
        '1': 'Todo se bloquea unos segundos. Ventila pronto, ventila a menudo. Confía en mí.',
        say: '¿Qué pasa si me sobrecaliento?'
      },
      trainBack: {
        '1': 'Y recuerda ventilar el calor antes de que él te ventile a ti.'
      },
      bye: {
        '1': '¡Ten cuidado ahí fuera!'
      }
    },
    ironHealer: {
      hello: {
        '1': 'Las botas en la puerta, por favor. Acabo de barrer.',
        '2': 'Madre Brynja. He recompuesto la mayoría de los huesos rotos de esta montaña.'
      },
      ending: {
        '1': 'Fuiste a la Fortaleza del Terror y volviste. Siéntate. Déjame mirarte.'
      },
      again: {
        '1': 'Aún vivo. Bien. Siéntate.',
        '1__f': 'Aún viva. Bien. Siéntate.'
      },
      heal: {
        '1': 'Bebe esto, y no pongas esa cara. Tus frascos están llenos.'
      },
      mana: {
        '1': 'Toma. Sabe horrible. Bébela cuando se te acabe la magia, no antes.'
      },
      potions: {
        '1': 'Puedo venderte un cinturón más largo. Cinco frascos es todo lo que se puede llevar y aun así correr.',
        say: '¿Puedo llevar más pociones?'
      },
      rumor: {
        tundra: {
          '1': 'La tundra se lleva dedos de manos y pies. Sigue moviéndote y no te duermas en la nieve.'
        },
        temple: {
          '1': 'Hay un templo sumergido más allá de la tundra. Las nagas de allí no hacen prisioneros.'
        },
        rift: {
          '1': 'Sea lo que sea lo que hay en esa grieta, yo no lo puedo coser. No dejes que te alcance.'
        }
      },
      healBack: {
        '1': 'Andando. Y come algo, estás demasiado delgado.',
        '1__f': 'Andando. Y come algo, estás demasiado delgada.'
      },
      bye: {
        '1': 'Vuelve de una pieza.'
      }
    },
    exiledSovereign: {
      hello: {
        '1': 'Tú. Tú eres quien abrió mi puerta.',
        '2': 'Ahora enseño en un sótano, porque tengo que comer. No lo tomes por perdón.'
      },
      ending: {
        '1': 'Así que el trono está decidido, y Oakhaven sigue siendo cenizas. Espero que valiera la pena.'
      },
      again: {
        '1': 'Has vuelto. Mis honorarios no han cambiado.'
      },
      train: {
        '1': 'Te enseñaré a mandar. Si lo mereces es otra cuestión.'
      },
      class: {
        '1': 'Alguien a quien otros siguen. Los guardias acuden cuando llamas y luchan a tu palabra.',
        '2': 'Funciona con Carisma. Tú tienes. Por eso es tan difícil perdonarte.',
        say: '¿Qué es un Gran Soberano?'
      },
      ready: {
        strong: {
          '1': 'Tienes presencia para todo. Ojalá la hubieras usado mejor.'
        },
        able: {
          '1': 'Estás listo para la siguiente lección. No fingiré que me alegro.',
          '1__f': 'Estás lista para la siguiente lección. No fingiré que me alegro.'
        },
        weak: {
          '1': 'Aún nadie te seguiría. Trabaja tu Carisma.'
        }
      },
      oakhaven: {
        '1': 'Trescientos años. Mi familia levantó esas murallas.',
        '2': 'Por favor, no expliques. Nada de lo que digas lo arreglará.',
        say: 'Sobre Oakhaven...'
      },
      trainBack: {
        '1': 'Ve. Practica con otro.'
      },
      bye: {
        '1': 'Déjame, por favor.'
      }
    },
    trainerChrono: {
      fled: {
        '1': 'La mataste. Lo vi venir durante años, y aun así duele.',
        '2': 'Soy el Guardián de las Horas. Te enseñaré. Ella me dijo que lo haría.'
      },
      hello: {
        '1': 'Ahí estás. Te llevo esperando un buen rato. O te habré esperado.',
        '2': 'Soy el Guardián de las Horas. Enseño a doblar un poco el tiempo.'
      },
      freed: {
        '1': 'Es libre. Por una vez no sé qué pasará después. Es maravilloso.'
      },
      friend: {
        '1': 'El Círculo piensa bien de ti, así que las lecciones cuestan menos. Lo decidieron la semana pasada.'
      },
      foe: {
        '1': 'El Círculo está enfadado contigo ahora. Pasa. Hasta entonces, lo mantendremos en silencio.'
      },
      again: {
        '1': 'Bienvenido de nuevo. Llegas justo a tiempo.',
        '1__f': 'Bienvenida de nuevo. Llegas justo a tiempo.'
      },
      train: {
        '1': 'Mira bien. Luego mira otra vez, un instante antes.'
      },
      class: {
        '1': 'Detenemos a un enemigo en el tiempo, apresuramos a un amigo y deshacemos un error.',
        '2': 'Inteligencia para ver el hilo. Técnica para tirar de él.',
        say: '¿Qué es un Tejedor del Tiempo?'
      },
      ready: {
        strong: {
          '1': 'Sujetas bien el hilo. Toma el resto cuando quieras.'
        },
        able: {
          '1': 'Estás listo. Lo supe antes de que preguntaras.',
          '1__f': 'Estás lista. Lo supe antes de que preguntaras.'
        },
        weak: {
          '1': 'El hilo se te escapa. Más Inteligencia, y más Técnica.'
        }
      },
      oracle: {
        say: 'Háblame del oráculo.',
        freed: {
          '1': 'Veía todos los finales menos el suyo. Ahora lo descubrirá.'
        },
        slain: {
          '1': 'No se resistió. Ya lo había visto. Por favor, no me lo preguntes otra vez.'
        },
        waits: {
          '1': 'Ve todos los finales. Es una carga pesada. Sé amable con ella.'
        }
      },
      trainBack: {
        '1': 'Tendrá sentido más adelante. Suele tenerlo.'
      },
      bye: {
        '1': 'Hasta que nos volvamos a ver. O antes.'
      }
    },
    quest: {
      seal: {
        ask: { '1': "El Dragón Ancestral ha muerto, y la grieta se abre ante ti.", '2': "Podrías sellarla ahora, para siempre. Las bestias volverían a dormir.", '3': "O podrías dejarla entreabierta, y que los más valientes se midan con lo que salga." },
        seal: { say: "Séllala. Para siempre.", '1': "La grieta se cierra como una herida que sana, y el cielo se calla." },
        ajar: { say: "Déjala entreabierta. Estaremos listos.", '1': "La grieta queda abierta una rendija, y algo tras ella se ríe." },
      },
      goblinKing: {
        ask: {
          '1': 'Para. Por favor. Me rindo.',
          '2': 'Mi pueblo saquea porque tiene hambre. Esa es la verdad.',
          '3': 'Hagamos un trato en su lugar. Los tuyos y los míos.'
        },
        slay: {
          '1': 'El Rey Goblin cae, y las Hondonadas se vacían.',
          '2': 'Sunford duerme más tranquilo, y la Orden de Hierro oye tu nombre.',
          say: 'Nada de tratos. Tus incursiones acaban aquí.'
        },
        pact: {
          '1': 'Comercio. Sí. Lo juro, por mi corona.',
          '2': 'Comerciantes goblin se instalan en la plaza de Sunford y venden lo que ningún herrero de allí sabría hacer.',
          say: 'Detén las incursiones y comercia con Sunford. Júralo.'
        },
        ransom: {
          '1': '¿Todo? ...Está bien. Tómalo y vete.',
          '2': 'Te vas con oro goblin. Las incursiones volverán a empezar, pero el Sindicato lo aprueba.',
          say: 'Dame tu tesoro y puedes quedarte con la corona.'
        }
      },
      siege: {
        ask: {
          '1': 'Basta. Luchas bien, eso te lo concedo.',
          '2': 'El Sindicato paga mucho mejor de lo que ese pueblo pagará jamás.',
          '3': 'Ábrenos la puerta esta noche, y un tercio de Oakhaven es tuyo.'
        },
        defend: {
          '1': 'Entonces el Sindicato te cazará en todos los caminos. Recuerda que lo ofrecí.',
          '2': 'La puerta resiste. Oakhaven se enriquece tras ella, y sus armeros recuerdan tu nombre.',
          say: 'La puerta sigue cerrada. Llévate a tu ejército y vete.'
        },
        betray: {
          '1': 'Sensato. Madame Ash se alegrará de oírlo.',
          '2': 'Oakhaven arde. Entre las ruinas se abre un mercado negro, y un alquimista enseña en secreto.',
          '3': 'Los armeros se han ido, y la Orden de Hierro te llama traidor.',
          say: 'Un tercio del pueblo. Está bien. La puerta se abre esta noche.'
        }
      },
      core: {
        ask: {
          '1': 'El Coloso es chatarra. Nunca pensé que viviría para verlo.',
          '2': 'Y ahí está el núcleo. Aún zumba. Está caliente si lo tocas.',
          '3': 'Llegaste primero. Entonces... ¿qué hacemos con él?'
        },
        destroy: {
          '1': 'La luz se apaga, y los gólems caen donde están.',
          '2': 'En agradecimiento, la Orden de Hierro envía a sus propios armeros a Ironhold.',
          say: 'Atrás. Voy a romperlo.'
        },
        study: {
          '1': 'Sabes lo bastante para mover el núcleo sin despertarlo.',
          '2': 'En una temporada, las forjas de Ironhold fabrican ingenios de éter que nadie ha visto antes.',
          say: 'El Círculo debería estudiarlo. Creo que puedo sacarlo sin peligro.'
        },
        sell: {
          '1': 'Oro. Por la cosa que mató a mis mineros. Tómalo y vete.',
          '2': 'Una fortuna cambia de manos. El núcleo sigue encendido, y las minas nunca volverán a estar en calma.',
          say: 'El Sindicato hizo la mejor oferta.'
        }
      },
      oracle: {
        ask: {
          '1': 'He visto este momento más veces de las que puedo contar.',
          '2': 'En la mitad me liberas. En la otra mitad te llevas lo que guardo.',
          '3': 'Elige. Me gustaría, solo una vez, no saber qué viene después.'
        },
        free: {
          '1': 'Oh. Eso no lo vi. De verdad que no lo vi.',
          '2': 'La oráculo se eleva a través del agua y desaparece. Su alumno se queda a enseñar.',
          say: 'Quieta. Voy a romper tus cadenas.'
        },
        slay: {
          '1': 'Sí. Esta es la otra mitad.',
          '2': 'No se resiste. El Reloj de arena del Guardián del tiempo es tuyo.',
          '3': 'Su último alumno huye del templo, y el Círculo no te perdonará.',
          say: 'Vine por el reloj de arena.'
        }
      },
      dragon: {
        ask: {
          '1': 'Basta. Tienes colmillos, criatura.',
          '2': 'El demonio de la fortaleza encadenó a los míos. Quiero verlo arder.',
          '3': 'Mátame, o déjame ayudarte a hacerlo.'
        },
        slay: {
          '1': 'La montaña tiembla al caer el dragón. Su tesoro es tuyo.',
          '2': 'La Orden de Hierro canta al matadragones.',
          say: 'No regateo con dragones.'
        },
        pact: {
          '1': 'Pocos se atreverían a pedirlo. Muy bien. Cazaremos juntos.',
          '2': 'Cuando marches sobre la Fortaleza del Terror, un dragón volará sobre ti.',
          say: 'Entonces lucha conmigo contra el Archidemonio.'
        }
      },
      throne: {
        ask: {
          '1': 'Así que. Se acaba. No pensé que serías tú.',
          '2': 'Mi trono no se quedará vacío. Quien lo tome manda sobre la fortaleza y la grieta.',
          '3': 'Tres enviados ya esperan a mi puerta. Elige quién viene después.'
        },
        order: {
          '1': 'La Orden guarnece la fortaleza y sella lo que puede.',
          '2': 'El reino estará a salvo, y se le dirá qué hacer.',
          say: 'La Orden de Hierro lo tendrá.'
        },
        syndicate: {
          '1': 'El Sindicato se instala antes del amanecer.',
          '2': 'De ahora en adelante todo tiene precio, incluso la paz.',
          say: 'El Sindicato Ceniciento se lo ha ganado.'
        },
        circle: {
          '1': 'El Círculo convierte la fortaleza en una escuela sobre la grieta.',
          '2': 'Lo llaman investigación. Todos los demás contienen el aliento.',
          say: 'Que el Círculo del Éter se lo quede.'
        },
        shatter: {
          '1': 'Rompes el trono con tus propias manos. Nadie volverá a gobernar desde aquí.',
          '2': 'Los enviados se van sin una palabra.',
          say: 'Nadie lo tendrá. Voy a romperlo.'
        },
        claim: {
          '1': 'El trono está frío, y te queda bien.',
          '2': 'Tres facciones descubren que tienen un enemigo común.',
          say: 'Lo tomaré yo mismo.',
          say__f: 'Lo tomaré yo misma.'
        }
      }
    },
    bark: {
      sphinx: {
        intro: { '1': "Respóndeme, pequeño, o te enterrará mi arena." },
        riddle: { '1': "Un acertijo, entonces. Pisa donde te muestre, en ese orden." },
        sand: { '1': "Cinco esta vez. Y mi arena no esperará." },
        death: { '1': "Has respondido bien. La arena es tuya." },
      },
      leviathan: {
        intro: { '1': "Ahora caminas en mi agua." },
        sink: { '1': "Tus islitas se hunden." },
        grab: { '1': "¡Baja conmigo a las profundidades!" },
        death: { '1': "La marea se va, y no vuelve." },
      },
      hydra: {
        intro: { '1': "¡Corta una cabeza, y crecerán dos!" },
        heads: { '1': "¡Más cabezas, más dientes!" },
        rage: { '1': "¿Quemarnos? ¡Entonces arde con nosotros!" },
        death: { '1': "No más cabezas. Nunca más." },
      },
      elderDragon: {
        intro: { '1': "Yo dormía bajo el mundo antes de que los tuyos conocieran el fuego." },
        flight: { '1': "Escóndete tras tus piedrecitas, entonces." },
        rift: { '1': "La grieta me arrastra de vuelta. ¡Aún no!" },
        death: { '1': "Séllala, pues. Estoy cansado de la oscuridad." },
      },
      'siegeHale': {
        'start': {
          '1': "¡Ahí vienen! ¡Defended la puerta!"
        },
        'ram': {
          '1': "¡Un ariete! ¡Matadlo antes de que llegue a la puerta!"
        },
        'horn50': {
          '1': "¡Media puerta ha caído! ¡Aguantad!"
        },
        'horn25': {
          '1': "¡La puerta no aguantará mucho más!"
        },
        'won': {
          '1': "¡Están rotos! ¡El Bastión resiste!"
        }
      },
      'siegeMara': {
        'start': {
          '1': "¡Ya vienen! ¡Firmes, todos!"
        },
        'ram': {
          '1': "¡Un ariete! ¡Detenedlo antes de que rompa la puerta!"
        },
        'horn50': {
          '1': "Ha caído media puerta. ¡Aguantad!"
        },
        'horn25': {
          '1': "¡La puerta cede! ¡Hacedlos retroceder!"
        },
        'won': {
          '1': "¡Huyen! ¡El fuerte sigue en pie!"
        }
      },
      banditChief: {
        whistle: {
          1: '¡Arriba, muchachos! ¡Muérdanlos!'
        }
      },
      lightDisciple: {
        freed: {
          '1': 'La luz te ha enviado. Soy la hermana Aurelle. Búscame en Sunford, te enseñaré la senda del Portador de Luz.'
        }
      },
      trainerAegis: {
        freed: {
          '1': '¡Gracias por librarnos de los bandidos! Ven junto al fuego: todos te enseñaremos, y la primera lección es gratis.'
        },
        road: { '1': '¡Nos has encontrado! Los demonios nos atraparon en el camino de Sunford. Iremos al Paso del Bastión: búscanos en el fuerte.' }
      },
      sfShadow: {
        road: { '1': 'Ya era hora de que alguien viniera. Nos vamos al Paso del Bastión. Búscanos en el fuerte.' }
      },
      frostDisciple: {
        freed: {
          '1': '¿Viniste por mí? Ivor Hask, discípulo del Guardián de Escarcha. Ven a Ironhold y te enseñaré.'
        }
      },
      windDisciple: {
        freed: {
          '1': '¡Libre por fin! Kestrel Vane, de la senda del Corredor del Viento. Búscame en Oakhaven y te enseñaré.'
        }
      },
      freedFarmers: {
        freed: {
          '1': '¡Nos salvaste! Somos los Toller, granjeros. Búscanos en Oakhaven, hay problemas en casa.'
        }
      },
      freedHerbalist: {
        freed: {
          '1': '¡Ay, gracias! Soy Briar, herbolaria. Ven a verme a Silverbridge. Me vendría bien tu ayuda.'
        }
      },
      freedPeddler: {
        freed: {
          '1': '¡Benditas sean tus botas! Odo Marrow, buhonero. Búscame en Sunford, tendré mercancía para ti.'
        }
      },
      goblinKing: {
        charge: {
          '1': '¡Arrolla, Tusker!'
        },
        horn: {
          '1': '¡A mí, muchachos! ¡Goblins, a mí!'
        },
        dismount: {
          '1': '¡Vamos, Tusker, corre! ¡Yo acabaré esto solo!'
        },
        return: {
          '1': '¡Tusker! ¡Una vez más!'
        }
      },
      dragon: {
        takeoff: {
          '1': 'Basta. Que el cielo te abrase.'
        },
        flight2: {
          '1': '¡Aún no he acabado contigo!'
        }
      },
      archDemon: {
        gate: {
          '1': 'La puerta está abierta. Nadie sale.'
        },
        dive: {
          '1': 'De rodillas.'
        }
      },
      chimera: {
        intro: {
          '1': "Tres cabezas, una sola hambre. ¿Quién de nosotras muerde primero?"
        },
        twin: {
          '1': "Ahora somos dos. Elige bien tu lado."
        },
        tail: {
          '1': "¡Mi cola! ¡Me las pagarás!"
        },
        death: {
          '1': "Tres cabezas, y ninguna lo vio venir."
        }
      },
      centaurWarchief: {
        intro: {
          '1': "Corre si quieres. Mis flechas corren más."
        },
        raiders: {
          '1': "¡Jinetes! ¡Arrolladlos!"
        },
        rear: {
          '1': "Basta de flechas. ¡Te voy a aplastar!"
        },
        death: {
          '1': "Las llanuras recordarán mis cascos."
        }
      },
      cyclops: {
        intro: {
          '1': "Hay algo pequeño aquí. Acércate. Déjame ver."
        },
        cover: {
          '1': "Se acabó mirar. ¡No tendrás mi ojo!"
        },
        blind: {
          '1': "No te veo, ¡pero te oigo!"
        },
        death: {
          '1': "Oscuro. Todo se ha vuelto oscuro."
        }
      },
      frostJarl: {
        hammer: {
          '1': 'Quieto, pequeño.',
          '1__f': 'Quieta, pequeña.'
        },
        iceBreak: {
          '1': '¡El lago te tragará!'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': '¡Cuidado con el carro! Perdona, en este puente todo se mueve. Bienvenido a Silverbridge.',
        '2': 'Soy la alcaldesa Brenna Quill. Si algo se pierde, se rompe o llega tarde, acaba en mi mesa.'
      },
      ending: {
        '1': 'Todo el río habla de ti. El comercio nunca ha ido mejor. Así que gracias.'
      },
      again: {
        '1': '¿Otra vez por aquí? Bien. Intenta no cortarles el paso a los carros.'
      },
      who: {
        '1': 'Alcaldesa desde hace nueve años. Antes vendía cuerda. En el fondo, es el mismo trabajo: mantener todo atado.',
        '2': 'La ciudad vota cada primavera. Hasta ahora, nadie más quiere mi mesa.'
      },
      town: {
        '1': 'Primero fue el puente. Luego un mercado encima, luego casas, y luego casas encima de esas.',
        '2': 'Cuidado con las fuentes. Los niños se caen dentro. Y los mayores también, en día de mercado.',
        say: 'Háblame de Silverbridge.'
      },
      masters: {
        '1': 'Para todas y cada una. Escudo, fuego, sombra, piedra. Un maestro de cada, todos en un puente.',
        '2': 'Vienen alumnos de todas partes. Es bueno para las posadas. No tanto para mis ventanas.',
        say: '¿De verdad hay un maestro para cada clase?'
      },
      river: {
        '1': 'Con lo que traiga el río. Pescado, seda, acero de Ironhold, alguna caja de gallinas enfadadas.',
        '2': 'Y no todos los mercaderes de Silverbridge cuelgan un cartel. Mantén los ojos abiertos.',
        say: '¿Con qué se comercia aquí?'
      },
      rumor: {
        crags: {
          '1': 'Los barcos del norte ya no llegan. Algo arde allá arriba, en los Riscos Cenicientos.'
        },
        mines: {
          '1': 'Este mes no hay acero de Ironhold. Los enanos dicen que algo ha salido mal en sus minas.'
        },
        tundra: {
          '1': 'Los peleteros ya no cruzan la tundra. Dicen que los gigantes se están moviendo.'
        },
        far: {
          '1': 'Los mercaderes ya solo susurran sobre el lejano norte. Lo que haya allí, no está comprando.'
        }
      },
      bye: {
        '1': 'Venga, en marcha. Y si alguien pregunta, el peaje del puente es muy justo.'
      }
    },
    sbHealer: {
      hello: {
        '1': '¿Mm? Ah, un paciente. Perdona, estaba descansando la vista. Los sanadores hacemos eso.',
        '2': 'Hermano Ansel. Pasa, siéntate. La silla es más cómoda de lo que parece.'
      },
      again: {
        '1': 'Ah, has vuelto. Y yo que me acababa de sentar.'
      },
      heal: {
        '1': 'Recuéstate, cierra los ojos. No mucho rato, o me dormiré yo también. Listo, frascos llenos.'
      },
      mana: {
        '1': 'Tónico de brillaseta. Bueno para la mente, malo para el aliento. Bébelo despacio.'
      },
      potions: {
        '1': 'Bébete una antes de estar desesperado. Los héroes siempre esperan demasiado.',
        '2': 'Si quieres llevar más, vendo cinturones más largos. Rellenar los frascos es gratis.',
        say: '¿Algún consejo sobre pociones?'
      },
      sleep: {
        '1': 'Por la noche, no. Alumnos de todas las clases practicando. Siempre explota algo.',
        say: '¿Tú duermes alguna vez?'
      },
      healBack: {
        '1': 'Venga, en marcha. La próxima vez, ven a tomar té en vez de por vendas.'
      },
      bye: {
        '1': 'Cuidado con los escalones. La mitad de mis pacientes solo tropezaron con ellos.'
      }
    },
    sbArmorer: {
      forge: {
        '1': 'Usa la forja cuando quieras. Grita si algo se prende fuego.'
      },
      learnSmith: {
        '2': 'Golpea cuando brille más caliente. Tres buenos golpes hacen una buena pieza.',
        '1__f': '¿Quieres probar el martillo tú misma? No me importa compartir la forja.',
        '1': '¿Quieres probar el martillo tú mismo? No me importa compartir la forja.'
      },
      ore: { '1': 'Bonito mineral. Enséñame qué vendes, pago por pepita.' },
      sellBack: { '1': 'Un placer. Silverbridge siempre paga un precio justo.' },
      forgeBack: {
        '1': '¡Mira eso! Tienes un talento natural.'
      },
      hello: {
        '1': '¡Ja! Mira esa abolladura. Espero que te devolvieran el dinero de esa armadura.',
        '2': 'Greta Ironvein. Hago armaduras que vuelven a casa con su dueño. Todas las veces, de momento.'
      },
      again: {
        '1': '¡Tú otra vez! Todavía de una pieza. Mi tipo de cliente favorito.'
      },
      trade: {
        '1': 'Venga, dale un golpe. Tan fuerte como quieras.'
      },
      who: {
        '1': 'Familia de montaña. Bajé por el río por el comercio y me quedé por el pescado.'
      },
      steel: {
        '1': 'No es lo gruesa que sea. Es dónde se dobla. Una buena armadura se dobla donde te doblas tú.',
        '2': 'Ojo, la placa pesada pide Fuerza. Sin ella, andarás como un pato.',
        say: '¿Qué hace buena a una armadura?'
      },
      shopBack: {
        '1': 'Llévala con orgullo. Tráeme las abolladuras, me encanta una buena historia.'
      },
      bye: {
        '1': 'Venga, en marcha. Que no te den donde no te he cubierto.'
      }
    },
    sbWeapons: {
      hello: {
        '1': 'Ah, un cliente con buen gusto. Siempre lo noto. Se ve en cómo entras.',
        '2': 'Corvin Ashby, de Hojas Finas de Ashby. Sí, ese Ashby. Seguro que has oído hablar de mí.'
      },
      again: {
        '1': '¿Ya de vuelta? Siempre vuelven a Corvin.'
      },
      trade: {
        '1': 'Cada hoja pulida a mano. A mi mano, de hecho. Cuidado con el reflejo.'
      },
      who: {
        '1': 'El mejor vendedor de espadas del río. Pregunta a quien quieras. O lee mi cartel.'
      },
      blades: {
        '1': 'Elige una que te vaya. Manos rápidas, hoja ligera. Brazos fuertes, hoja pesada.',
        '2': 'Y tiene que quedar bien. Nadie huye de un héroe con una espada fea.',
        say: '¿Cómo elijo un arma buena?'
      },
      shopBack: {
        '1': 'Una elección exquisita. No tanto como mi pelo, pero casi.'
      },
      bye: {
        '1': 'Cuéntale a todo el mundo dónde la compraste.'
      }
    },
    sbJeweler: {
      hello: {
        '1': '¡Pss! ¡Aquí! Anillos, amuletos, piedras de la suerte. El mejor puesto del puente.',
        '2': 'Me llamo Tam Marlow. Soy bajito, pero mis precios son más bajos todavía.'
      },
      again: {
        '1': '¡Mi cliente favorito! No les digas a los demás que he dicho eso.'
      },
      trade: {
        '1': 'Todo auténtico. Casi siempre. Vale, ese es de cristal, pero es un cristal muy bonito.'
      },
      who: {
        '1': 'Me crie en este puente. Conozco cada grieta, cada gato y cada atajo.'
      },
      gossip: {
        '1': 'El profesor Sprocket se ha vuelto a volar las cejas. Tercera vez este mes.',
        '2': 'Y la alcaldesa sabe de mercaderes que no cuelgan cartel. Estoy en ello.',
        say: '¿Algún cotilleo bueno?'
      },
      shopBack: {
        '1': '¡Un placer hacer negocios! Díselo a tus amigos. A los guardias, no.'
      },
      bye: {
        '1': '¡Nos vemos! Estaré aquí mismo. Seguramente.'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': '¡Ja! Otro jovencito. Barbilla arriba, hombros atrás. Los escudos funcionan mejor con una sonrisa.',
        '2': 'Dama Helga Stormshield. Una vez defendí este puente. Ahora enseño a otros a mantenerse firmes.'
      },
      again: {
        '1': '¡Ahí estás! ¿Escudo arriba? Bien. ¿Sonriendo? Mejor aún.'
      },
      train: {
        '1': 'Pies separados. Inclínate. Cuando empuje, no te mueves. ¿Listo? ¡Hop!'
      },
      class: {
        '1': 'Te pones delante para que los demás no tengan que hacerlo. El mejor trabajo que hay.',
        '2': 'Fuerza para levantar el escudo. Aguante para sostenerlo hasta la cena.',
        say: '¿Qué hace de verdad un Caballero de la Égida?'
      },
      ready: {
        strong: {
          '1': 'Ya eres un muro de verdad, cielo. Elige la lección que quieras.'
        },
        able: {
          '1': '¡Piernas firmes! Estás listo para la siguiente.'
        },
        weak: {
          '1': 'Todavía no. Un buen empujón y te caes. Más Fuerza y Aguante, por favor.'
        }
      },
      bridge: {
        '1': 'Hace cuarenta años, contra piratas del río. Seis de nosotros, una puerta, una noche larguísima.',
        '2': 'No ganamos pegando más fuerte. Ganamos sin movernos. Recuérdalo.',
        say: '¿Defendiste este puente?'
      },
      trainBack: {
        '1': '¡Buen trabajo! Ahora come algo. Los escudos pesan.'
      },
      bye: {
        '1': '¡Ahí fuera, la barbilla bien alta!'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': 'Pasa, por favor. Cuidado con las notas, y no estornudes cerca del brasero.',
        '2': 'Magíster Ignatius Vale. Enseño fuego sobre un puente. Hay agua de sobra, ¿comprendes?'
      },
      again: {
        '1': 'Puntual. Excelente. Seguiremos donde lo dejamos.'
      },
      train: {
        '1': 'Observa. Una llama pequeña, bien quieta. Las llamas grandes son fáciles. Las pequeñas requieren talento.'
      },
      class: {
        '1': 'Cualquiera enciende un fuego. Un piromante decide adónde va y dónde se detiene.',
        '2': 'Todo sale de la Inteligencia. Más adelante ayuda la Técnica, cuando el fuego pide pulso firme.',
        say: '¿Qué hace de verdad un piromante?'
      },
      ready: {
        strong: {
          '1': 'Tu control es excelente. Apenas me queda nada que corregir. Elige con libertad.'
        },
        able: {
          '1': 'Aceptable. Más que aceptable, en realidad. Puedes pasar a la siguiente lección.'
        },
        weak: {
          '1': 'Todavía no. Tu llama tiembla. Una mente más aguda, por favor. Más Inteligencia.'
        }
      },
      sprocket: {
        '1': 'Un hombre brillante. Ruidoso, descuidado y brillante. Tengo un cubo junto a su puerta.',
        say: '¿Qué opinas del profesor Sprocket?'
      },
      trainBack: {
        '1': 'Practica cerca del agua. Insisto.'
      },
      bye: {
        '1': 'Buenos días. Y lleva siempre las mangas remangadas.'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': '¿Me buscabas? Estoy a tu lado desde la fuente. Has pasado por delante de mí dos veces.',
        '2': 'Nyx Halloway. El mejor escondite es una multitud, y este es el puente más concurrido que hay.'
      },
      again: {
        '1': 'Hola otra vez. Llevo un rato aquí. ¿Te diste cuenta? ¿No? Bien.'
      },
      train: {
        '1': 'Lección uno: camina como si fueras de aquí. Nadie mira dos veces a alguien que es de aquí.'
      },
      class: {
        '1': 'No estar nunca donde miran. Colarse, un golpe rápido y volver a fundirse con la gente.',
        '2': 'Destreza para tener pies y manos rápidos. Técnica, para que el golpe cuente.',
        say: '¿Qué hace buena a una Hoja Sombría?'
      },
      ready: {
        strong: {
          '1': 'Ya eres sigiloso de verdad. Llévate lo que queda, te lo has ganado.'
        },
        able: {
          '1': '¡Qué pies tan ligeros! Estás listo para el siguiente truco.'
        },
        weak: {
          '1': 'Todavía no. Te oigo venir desde la fuente. Más Destreza.'
        }
      },
      past: {
        '1': 'Antes robaba carteras en este mismo puente. Y se me daba bien.',
        '2': 'Entonces la alcaldesa me pilló y me dio un trabajo, no una celda. No le digas que estoy agradecido.',
        say: '¿Cómo aprendiste todo esto?'
      },
      trainBack: {
        '1': 'Ahora ve a practicar. Intenta que no te pille.'
      },
      bye: {
        '1': 'Nos vemos. Bueno, tú a mí no.'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': '¡Oh! Hola, hola. Perdóname, estaba charlando con mis guardias. Qué bien escuchan.',
        '2': 'Percival Ashcombe. Podría enseñar en un castillo, pero a liderar solo se aprende donde hay gente.'
      },
      again: {
        '1': '¡Mi querido amigo! ¿Seguimos? Solo si te apetece, claro.'
      },
      train: {
        '1': 'Bien. Una buena orden es clara, amable y se da una sola vez. Así.'
      },
      class: {
        '1': 'Un líder. Tus guardias acuden a tu lado y luchan contigo, no solo por ti.',
        '2': 'El Carisma lo es todo. La gente sigue a quien le cae bien. Y a quien recuerda su nombre.',
        say: '¿Qué es un Gran Soberano?'
      },
      ready: {
        strong: {
          '1': '¡Espléndido! Ahora la gente te seguiría a cualquier parte. Toma todas las lecciones.'
        },
        able: {
          '1': 'Tus guardias te harían caso. Estás listo para la siguiente lección.'
        },
        weak: {
          '1': 'Aún no del todo, me temo. Un poco más de Carisma y vendrán.'
        }
      },
      please: {
        '1': 'Siempre. Gritando consigues obediencia. Con un por favor consigues lealtad, y la lealtad dura más.',
        say: '¿De verdad les pides las cosas por favor a tus guardias?'
      },
      trainBack: {
        '1': 'Un trabajo precioso. Acuérdate de darles las gracias después.'
      },
      bye: {
        '1': 'Cuídate mucho, y saluda a todos de mi parte.'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': 'Cuidado con el musgo, cielo, ha tenido una semana muy larga. A ver, déjame que te mire.',
        '2': 'Abuela Tova Deeproot. El lecho del río aquí es piedra preciosa, hasta el fondo.'
      },
      again: {
        '1': '¿Ya de vuelta? Siéntate, acabo de hacer té. Té de piedra. Casi todo es té.'
      },
      train: {
        '1': 'Manos planas en el suelo. Así no. Como si acariciaras a un perro dormido.'
      },
      class: {
        '1': 'Le pedimos ayuda al suelo. Un muro cuando lo necesitas, una púa cuando alguien es grosero.',
        '2': 'La piedra es como un huerto. Fuerza para cavar, Inteligencia para saber dónde plantar.',
        say: '¿Qué hace un Geomante?'
      },
      ready: {
        strong: {
          '1': 'Ahora le gustas al suelo. Aprende lo que quieras, cielo.'
        },
        able: {
          '1': '¡Buenas raíces! Estás listo para la siguiente lección.'
        },
        weak: {
          '1': 'Todavía no, cariño. La piedra no se mueve por ti. Primero, más Fuerza.'
        }
      },
      garden: {
        '1': 'Cuarenta años de trabajo. Cada roca cultivada a mano. Bueno, con magia. Casi siempre a mano.',
        '2': 'Llévate un guijarro al salir. Son unos topes de puerta preciosos.',
        say: '¿Eso es un jardín de piedra?'
      },
      trainBack: {
        '1': 'Precioso. Ahora ve a cavar algo. Con suavidad.'
      },
      bye: {
        '1': 'Venga, en marcha. Abrígate, que junto al río hay humedad.'
      }
    },
    sbMasterAether: {
      hello: {
        '1': '¡Bienvenido, bienvenido! Llegas justo a tiempo para la demostración. Tápate los oídos, por favor.',
        '2': 'Profesor Quint Sprocket. El río mueve mis ruedas gratis. ¿Dónde iba a enseñar si no?'
      },
      again: {
        '1': '¡Ah, mi alumno favorito! La demostración de hoy es extrarruidosa.'
      },
      train: {
        '1': 'Fíjate en la pizarra. Ahora olvida la pizarra y mira la máquina.'
      },
      class: {
        '1': 'Salimos de los líos construyendo. Una pistola, una torreta y un medidor de calor que te mantiene a raya.',
        '2': 'Técnica para apuntar, Inteligencia para las partes ingeniosas. Lo ideal, las dos.',
        say: '¿Qué hace en realidad un Éter-Tec?'
      },
      ready: {
        strong: {
          '1': '¡Maravilloso! Podrías dar mis clases. Pero no lo hagas, por favor. Toma el resto.'
        },
        able: {
          '1': '¡Buen pulso! Estás listo para la siguiente máquina.'
        },
        weak: {
          '1': 'Todavía no. Tu puntería se desvía. Más Técnica y luego hablamos.'
        }
      },
      eyebrows: {
        '1': 'Una demostración salió un poquito demasiado bien. Volverán a crecer. Siempre lo hacen.',
        say: '¿Qué les pasó a tus cejas?'
      },
      trainBack: {
        '1': 'Espléndido. Ahora ve a soltar ese calor. Fuera, a ser posible.'
      },
      bye: {
        '1': '¡Se acabó la clase! Cuidado con los escalones.'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': 'Mi antiguo alumno, el Guardián de las Horas, me escribió que vendrías. Justo en este minuto, de hecho.',
        '2': 'Guardarrelojes Selwyn. Cuido el reloj del puente. Una ciudad tan ajetreada no puede llegar tarde.'
      },
      again: {
        '1': 'Y siete minutos. Buena hora para empezar.'
      },
      train: {
        '1': 'Cuenta conmigo. Uno, dos, y aguanta. El tiempo se estira si lo sujetas bien.'
      },
      class: {
        '1': 'Ordenamos el tiempo. Frenar a un enemigo, darle prisa a un amigo, deshacer algún que otro error.',
        '2': 'Inteligencia para entenderlo. Técnica para tocarlo sin romper nada.',
        say: '¿Qué es un Tejedor del Tiempo?'
      },
      ready: {
        strong: {
          '1': 'Un ritmo excelente. Toma el resto de mis lecciones cuando te venga bien.'
        },
        able: {
          '1': 'Estás listo. La siguiente lección empieza... oh, ahora.'
        },
        weak: {
          '1': 'Todavía no. Siempre vas un compás por detrás. Más Inteligencia, y más Técnica.'
        }
      },
      keeper: {
        '1': 'Fui su maestro, hace años. Un alumno brillante. Siempre pronto o tarde, nunca puntual.',
        say: '¿De qué conoces al Guardián de las Horas?'
      },
      trainBack: {
        '1': 'Practica cada día. A la misma hora cada día, si no es molestia.'
      },
      bye: {
        '1': 'Venga, en marcha. No llegues tarde.'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': 'El doctor Sangrel me escribió sobre ti. Dice que no te desmayaste. Viniendo de él, es todo un elogio.',
        '2': 'Vesper Crimsonleaf. Todas las hierbas del mundo pasan flotando bajo este puente. Aquí estoy muy mimada.'
      },
      again: {
        '1': 'Bienvenido de nuevo. Hoy te veo con mucha vida. Siempre lo noto.'
      },
      train: {
        '1': 'Respira hondo. ¿Notas tu fuerza? Ahora gasta un poco. Con cabeza.'
      },
      class: {
        '1': 'Gastamos nuestra propia fuerza vital a cambio de poder, y luego se la quitamos a los enemigos.',
        '2': 'El Aguante es tu bolsa. La Inteligencia decide lo bien que la gastas.',
        say: '¿Qué es en realidad un Alquimista de Sangre?'
      },
      ready: {
        strong: {
          '1': '¡Qué vitalidad! Estás listo para casi todo lo que sé.'
        },
        able: {
          '1': 'Tu esencia fluye con fuerza. A la siguiente lección.'
        },
        weak: {
          '1': 'Todavía no. Te cansarías tras un solo hechizo. Primero sube tu Aguante.'
        }
      },
      herbs: {
        '1': 'Sobre todo para tónicos. Un poco de esencia, mucha menta. La menta lo mejora todo.',
        '2': 'Si encuentras plantas raras por ahí, tráemelas. Me encantaría verlas.',
        say: '¿Para qué son todas estas hierbas?'
      },
      trainBack: {
        '1': 'Descansa después de practicar. La esencia vuelve, pero le gusta echarse la siesta.'
      },
      bye: {
        '1': 'Cuídate. Bebe agua. Come algo verde.'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': 'Esta mañana han llegado tres barcazas de la costa.',
        '2': '¿Pescado salado otra vez?',
        '3': 'Seda, para variar. Aunque luego huélete los dedos.'
      },
      lesson: {
        '1': '¿Qué tal tu lección?',
        '2': 'Me prendí fuego a la manga. El maestro dice que eso es progresar.'
      },
      masters: {
        '1': 'Todos los maestros del reino enseñan en una sola calle.',
        '2': 'Y cada uno dice que su clase es la mejor.',
        '3': 'Y todos tienen razón, que es lo más fastidioso.'
      },
      bridge: {
        '1': 'Dicen que el puente es más viejo que la ciudad.',
        '2': 'Desde luego, cruje como si lo fuera.'
      },
      fish: {
        '1': '¿Has pescado algo?',
        '2': 'Una bota.',
        '3': 'Bueno, ya tienes medio par.'
      },
      newMaster: {
        '1': 'Hay un maestro nuevo en la calle norte. Habla mucho del tiempo.',
        '2': 'Seguro que llega tarde a todas las lecciones.'
      },
      siege: {
        '1': 'Llegan malas noticias de Oakhaven. Bandidos ante las murallas.',
        '2': 'Entonces las barcazas vendrán aquí. Pobre gente.'
      }
    },
    sbAlchemist: {
      hello: {
        '1': '¡Oh! Cuidado con los tarros. Ese muerde. Bueno, mordisquea.',
        '2': 'Odile Fernwhistle, alquimista. Tráeme hierbas y te embotellaré un poquito de valor.'
      },
      again: {
        '1': '¡Has vuelto! ¿Me traes algo verde?'
      },
      brew: {
        '1': 'A ver esa bolsa. Oh, qué maravilla. Elige lo que quieras y pongo la tetera al fuego.'
      },
      who: {
        '1': 'Le prendí fuego al jardín de mi madre con una margarita. Nadie supo explicarlo, así que tuve que aprender.'
      },
      herbs: {
        '1': 'Ahí fuera, en la naturaleza, en todos los sitios donde luchas. Pasa por encima de una planta y es tuya.',
        '2': 'Las raras son caprichosas. Las campanillas lunares se abren en el Bosque Susurrante; la espina sombría busca los lugares oscuros.',
        say: '¿Dónde encuentro hierbas?'
      },
      elixirs: {
        '1': 'Cada uno te hace más fuerte en combate durante 5 minutos enteros. Golpes más fuertes, piel más dura, pies más ligeros.',
        '2': 'Van en tu tercer frasco. Toca la flechita para cambiar cuál te bebes.',
        say: '¿Qué hacen los elixires?'
      },
      brewBack: {
        '1': 'Cuidado, que aún están calientes. ¡Vuelve cuando tengas la bolsa llena!'
      },
      bye: {
        '1': '¡Hasta luego! Si ves una flor morada, recoge dos. Una para mí.'
      }
    },
    sbGambler: {
      hello: {
        '1': '¡Acércate, acércate! Doce cartas, un reloj de arena y una bolsa que podría duplicarse.',
        '2': 'Madame Pell. Nunca olvido una cara. Veamos si tú nunca olvidas una carta.'
      },
      again: {
        '1': '¿Vuelves a por otra ronda? La arena te estaba esperando.'
      },
      play: {
        '1': 'Monedas sobre el paño, ojos en las cartas. ¿Empezamos? ¡Dale la vuelta al reloj!'
      },
      rules: {
        '1': 'Gira dos cartas. Si son pareja, se quedan boca arriba. Encuentra todas las parejas antes de que se acabe la arena y te pago el doble.',
        '2': 'Si vuelves a ganar, el reloj va más rápido. Gana cinco seguidas y te daré un premio legendario.',
        say: '¿Cómo funciona?'
      },
      who: {
        '1': 'Me escapé con el circo ambulante a los nueve años. Resultó ser un cálculo excelente.'
      },
      prize: {
        '1': 'Un enano, una vez. Nadie le ha visto parpadear desde entonces.',
        say: '¿Alguien ha ganado alguna vez el premio?'
      },
      playBack: {
        '1': 'Ganes o pierdas, ha sido una buena partida. Vuelve cuando tengas los ojos descansados.'
      },
      bye: {
        '1': '¡Hasta luego! Acuérdate de dónde pones los pies.'
      }
    },
    sunfordGambler: {
      hello: {
        '1': 'Psst. ¿Llevas trastos en la bolsa? ¿Botas viejas, espadas torcidas? Te los juego.',
        '2': 'Dob Tumbler. Juego por diversión, sobre todo. Y por botas.'
      },
      again: {
        '1': '¡Otra vez tú! ¿Tienes más de esos trastos tan bonitos?'
      },
      play: {
        '1': 'La tarifa sobre la mesa. Pon tus cosas, el precio más alto se lleva el punto.'
      },
      rules: {
        '1': 'Cada uno pone un objeto. El más caro se lleva el punto. Dos puntos ganan la partida.',
        '2': 'Lo que pongas es mío, ganes o pierdas. Pero si ganas tres partidas seguidas, tengo algo especial.',
        say: '¿Cuáles son las reglas?'
      },
      who: {
        '1': 'Antes era buhonero. Resulta que la gente prefiere apostar sus cosas a venderlas.'
      },
      luck: {
        '1': '¡Todo el rato! Pero siempre vuelvo a casa con un par de botas nuevas.',
        say: '¿Pierdes alguna vez?'
      },
      playBack: {
        '1': '¡Buena partida! Tus cosas quedarán preciosas en mi estante.'
      },
      bye: {
        '1': '¡Trae más trastos! Los trastos son lo que más me gusta.'
      }
    },
    sunfordCups: {
      hello: {
        1: '¡Acércate! Tres vasos, una gema, ¡y tu primera ronda va por la casa!',
        2: 'Nell Nimblefingers. Nadie ha engañado aún a mis manos. ¿Quieres probar?'
      },
      again: {
        1: '¿Otra vez por aquí? ¡Abre bien los ojos!'
      },
      play: {
        1: 'Ojo a la gema, amigo. ¡No parpadees!'
      },
      rules: {
        1: 'Escondo la gema bajo un vaso y los mezclo. Tú señalas el vaso que la esconde.',
        2: 'Cada victoria seguida paga más. Tres victorias traen un premio, cinco un tesoro. La primera ronda de cada día es gratis.',
        say: '¿Cómo funciona?'
      },
      who: {
        1: 'Aprendí a barajar antes de aprender a andar. Mamá dice que eso lo explica todo.'
      },
      luck: {
        1: '¡A veces! Entonces gimo muy fuerte y el público se compadece de mí.',
        say: '¿Alguna vez pierdes?'
      },
      playBack: {
        1: '¡Gran ronda! Vuelve mañana, la primera siempre es gratis.'
      },
      bye: {
        1: '¡Hasta luego! Mantén los ojos abiertos ahí fuera.'
      }
    },
    oakGambler: {
      hello: {
        '1': 'Una cara nueva. Siéntate, no muerdo. Mis precios sí, un poco.',
        '2': 'Me llaman Silky Ren. Colecciono cosas finas, partida a partida.'
      },
      again: {
        '1': 'Ah, qué gusto verte otra vez. ¿Jugamos?'
      },
      play: {
        '1': 'La tarifa, por favor. Luego pon algo que merezca la pena.'
      },
      rules: {
        '1': 'Un objeto cada uno, tres veces como mucho. La pieza más fina se lleva el punto. Dos puntos se llevan la partida.',
        '2': 'Tus piezas se quedan conmigo pase lo que pase. Gana tres partidas seguidas y te irás con un tesoro de verdad.',
        say: '¿Cómo se juega?'
      },
      who: {
        '1': 'Un tratante de cosas raras. Las encuentro, me las quedo y, de vez en cuando, pierdo una.'
      },
      collection: {
        '1': 'Lo ordeno por brillo. Lo más brillante va en el estante de arriba, junto a mis tazas de té.',
        say: '¿Qué haces con todo eso?'
      },
      playBack: {
        '1': 'Un placer. Vuelve cuando tu bolsa pese más.'
      },
      bye: {
        '1': 'Cuida tu bolsa ahí fuera. No todo el mundo juega limpio.'
      }
    },
    sbCollector: {
      hello: {
        '1': 'Cierra la puerta, que hay corriente. Las polillas van a por mis tapices.',
        '2': 'Alder Vane. Algunos me llaman el Coleccionista. Compro cosas raras y se las vendo a la gente que me cae bien.'
      },
      open: {
        '1': '¡Ah, ya estás aquí! Pasa, pasa. He desempolvado algo especial para ti.'
      },
      again: {
        '1': 'Otra vez tú. Veo que aún no me has hecho ese favor.'
      },
      trade: {
        '1': 'Las vitrinas están abiertas. Solo lo mejor, y recuerdo cada precio.'
      },
      favor: {
        '1': 'A desconocidos, no. Pero hazme un favor y seremos amigos.',
        '2': 'Unos ents del Bosque Susurrante protegen las campanillas lunares que necesito. Vence a cuatro y tráeme dos campanillas lunares.',
        say: '¿Vendes algo?'
      },
      waiting: {
        '1': 'Cuatro ents, dos campanillas lunares. Por desgracia, las campanillas no se recogen solas.',
        say: 'Sobre ese favor...'
      },
      favorDone: {
        '1': '¡Oh, aún huelen a bosque! Maravilloso.',
        '2': 'Un trato es un trato. Mis vitrinas están abiertas para ti cuando quieras.',
        say: 'Te traigo tus campanillas lunares.'
      },
      who: {
        '1': 'Colecciono desde los seis años. Primero fueron botones. Ahora, espadas que zumban.'
      },
      shopBack: {
        '1': 'Trata bien esa pieza. Es más antigua que nosotros dos.'
      },
      bye: {
        '1': 'Cierra la puerta al salir. Con cuidado, que los jarrones tiemblan.'
      }
    },
    sbFence: {
      hello: {
        '1': 'Me estás mirando fijamente. O compras algo o te apartas de mi luz.',
        '2': 'Mirela Thorne. Encuentro lo que la gente pierde. Y luego le busco un nuevo dueño.'
      },
      open: {
        '1': 'Ah, aquí estás. Te he guardado lo bueno debajo de la tela.'
      },
      again: {
        '1': '¿Has vuelto? Recuerda lo que te pedí. Luego hablaremos de negocios.'
      },
      trade: {
        '1': 'Armaduras de todas partes. No preguntes de dónde. Ahora está todo limpio, te lo prometo.'
      },
      favor: {
        '1': 'Buenas armaduras. Para amigos. Y los amigos se hacen favores.',
        '2': 'Unos bandidos de las Afueras de Oakhaven no paran de robar mis envíos. Vence a quince y luego pregúntale al chico de las baratijas quién los envía.',
        say: '¿Qué hay debajo de la tela?'
      },
      waiting: {
        '1': 'Quince bandidos y luego unas palabras con el chico de las baratijas. ¡En marcha!',
        say: 'Sobre esos bandidos...'
      },
      favorDone: {
        '1': 'Así que era cosa del chismoso desde el principio. ¡Ja! Te debo una.',
        '2': 'Levanta la tela cuando quieras. Los amigos eligen primero.',
        say: 'Los bandidos están vencidos, y sé quién los enviaba.'
      },
      who: {
        '1': 'Crecí en estas escaleras del río. Todo lo que flota acaba en mis manos, tarde o temprano.'
      },
      shopBack: {
        '1': 'Que te dure. Y si alguien pregunta, lo compraste en Ironhold.'
      },
      bye: {
        '1': 'Cuida tu bolsa. Aquí no todos son tan honrados como yo.'
      }
    },
    sbMasterWindrunner: {
      hello: {
        '1': '¡Ay, hola! Perdona, no puedo parar. Estoy esperando a que cambie el viento. En cualquier momento.',
        '2': 'Sefa Galewing. Disparo flechas y persigo al viento. Normalmente gana el viento.'
      },
      open: {
        '1': '¡Ahí estás! ¿Empezamos? ¡Pues claro! ¡Vamos, vamos!'
      },
      again: {
        '1': '¡Hola otra vez! Sigo aquí. Bueno, casi. Mis pies no paran de irse por ahí.'
      },
      train: {
        '1': '¿Notas el viento en la mejilla? Apunta un poco a la izquierda de donde crees. ¡Ahora suelta!'
      },
      favor: {
        '1': 'Solo a quien pueda seguirme el ritmo. ¿Puedes? Vamos a averiguarlo.',
        '2': 'Derrota a ocho arqueros bandidos en las Afueras de Oakhaven y luego tráeme dos helechos veloces.',
        say: '¿Enseñas tiro con arco?'
      },
      waiting: {
        '1': 'Ocho arqueros bandidos, dos helechos veloces. ¡Venga! Aquí te espero. Dando saltitos.',
        say: 'Sobre tu prueba...'
      },
      favorDone: {
        '1': '¡Ja! ¡Me has seguido el ritmo de verdad! ¡Nadie lo consigue!',
        '2': 'Bien, desde ahora entrenas conmigo. Una regla: en mis clases no se sienta nadie.',
        say: 'Los arqueros están derrotados, y aquí tienes tus helechos veloces.'
      },
      class: {
        '1': 'Disparar, correr, volver a disparar. Si te pillan, es que no te has movido en mucho rato.',
        '2': 'Destreza para pies rápidos y un arco rápido. Técnica, para que cada flecha dé en el blanco.',
        say: '¿Qué hace un Corredor del Viento?'
      },
      ready: {
        strong: {
          '1': 'Ya corres como el viento. Bueno, casi. ¡Elige la lección que quieras!'
        },
        able: {
          '1': '¡Pies ligeros! Ya puedes con la siguiente. ¡Vamos, vamos!'
        },
        weak: {
          '1': 'Todavía no. Corres como si llevaras un sofá a cuestas. Más Destreza, por favor.'
        }
      },
      who: {
        '1': 'Vivo arriba del viejo molino junto al río. La mejor vista del viento de todo el pueblo.',
        '2': 'Doscientos escalones hasta arriba. Un entrenamiento genial. Los he contado todos.'
      },
      trainBack: {
        '1': '¡Bien! Ahora vuelve a casa corriendo. Nada de andar. Correr también cuenta como entrenamiento.'
      },
      bye: {
        '1': '¡Hasta luego! Cuidado con las ramas bajas. Yo nunca lo tengo.'
      }
    },
    sbMasterFrostwarden: {
      hello: {
        '1': 'Hm. Has pasado tres veces por delante de mí. ¿Te has perdido o tienes curiosidad?',
        '2': 'Halvard Rimeheart. Vine al sur desde las nieves. Aquí hace calor. Demasiado.'
      },
      open: {
        '1': 'Ah, tú. Bien. El hielo está listo, y yo también.'
      },
      again: {
        '1': 'Tú otra vez. Bien. No hablo mucho. Quédate igualmente.'
      },
      train: {
        '1': 'Suelta el aire despacio. ¿Ves el vaho? Ahora ponlo en la hoja.'
      },
      favor: {
        '1': 'Lo es. Solo lo enseño a quien mantiene la cabeza fría en un lugar caliente.',
        '2': 'Apaga a siete elementales de fuego en los Riscos Cenicientos. Luego tráeme dos ramitas de menta helada.',
        say: '¿Esa espada es de hielo?'
      },
      waiting: {
        '1': 'Siete elementales de fuego. Dos ramitas de menta helada. Tómate tu tiempo. No demasiado.',
        say: 'Sobre tu prueba...'
      },
      favorDone: {
        '1': 'Hm. Ni una quemadura. Bien.',
        '2': 'Has mantenido la cabeza fría. Esa era la primera lección. Te enseñaré el resto.',
        say: 'Los elementales de fuego están apagados. Aquí tienes tu menta helada.'
      },
      class: {
        '1': 'Un caballero del frío. Los enfrías, los congelas y luego rompes el hielo.',
        '2': 'Fuerza para la hoja. Inteligencia para la escarcha. Necesitas las dos.',
        say: '¿Qué es un Guardián de Escarcha?'
      },
      ready: {
        strong: {
          '1': 'Ya llevas dentro el frío del norte. Elige cualquier lección.'
        },
        able: {
          '1': 'Bien. Firme. La siguiente lección es tuya.'
        },
        weak: {
          '1': 'Todavía no. Tu escarcha se derrite muy rápido. Más Inteligencia, y más Fuerza.'
        }
      },
      who: {
        '1': 'Guardaba un paso de montaña en el norte. Luego quise ver un río que no se congela.'
      },
      trainBack: {
        '1': 'Bien. Ahora descansa. El hielo no tiene prisa. Tú tampoco deberías.'
      },
      bye: {
        '1': 'Buen camino. Mantén la calma.'
      }
    },
    sbMasterLightbringer: {
      hello: {
        '1': 'Mm-hm-hmm... ¡Ay! Perdona, cielo, estaba tarareando. ¿Te he tarareado encima? Me pasa a menudo.',
        '2': 'Hermana Auriel Dawnmere. Mantengo encendida la lamparita al final del puente.'
      },
      open: {
        '1': '¡Aquí está mi rayito de sol! Ven a ponerte un momento en la luz. Te lo has ganado.'
      },
      again: {
        '1': '¡Hola otra vez! Sigo aquí, sigo tarareando. A la lámpara le gusta la compañía.'
      },
      train: {
        '1': 'Manos abiertas, barbilla arriba. Piensa en la mejor mañana de tu vida. Eso. ¿Lo notas?'
      },
      favor: {
        '1': 'Todo el mundo lleva una lucecita dentro. Yo enseño a dejarla salir, cuando llega el momento.',
        '2': 'Derrota a siete cultistas en los Riscos Cenicientos y luego tráeme tres pétalos solares para mi lámpara.',
        say: '¿Esa lámpara es mágica?'
      },
      waiting: {
        '1': 'Siete cultistas, tres pétalos solares. Derrótalos con cariño. Todo el mundo merece una segunda oportunidad.',
        say: 'Sobre tu prueba...'
      },
      favorDone: {
        '1': '¡Ay, míralos! La lámpara brillará dorada durante un mes.',
        '2': 'Y tú también, cielo. Me encantará enseñarte.',
        say: 'Los cultistas están derrotados. Aquí tienes tus pétalos solares.'
      },
      class: {
        '1': 'Llevamos el amanecer. Luz para luchar, luz para curar, luz tras la que esconderse.',
        '2': 'La Inteligencia hace fuerte la luz. El Carisma la hace cálida. Querrás las dos.',
        say: '¿Qué hace un Portador de Luz?'
      },
      ready: {
        strong: {
          '1': 'Brillas como un amanecer, cielo. Elige la lección que quieras.'
        },
        able: {
          '1': '¡Qué bonito brillas! Ya puedes con la siguiente.'
        },
        weak: {
          '1': 'Todavía no, cielo. Tu luz está algo apagada. Más Carisma, y brillarás.'
        }
      },
      who: {
        '1': 'Una vez canté en un gran templo. Pero mi lámpara, aquí fuera, guía a las barcas a casa. Eso es mejor.'
      },
      trainBack: {
        '1': 'Precioso. Ahora ve a alegrarle el día a alguien. Órdenes de la Hermana.'
      },
      bye: {
        '1': 'Hala, ve, cielo. Y sonríe a los rincones oscuros. Lo odian.'
      }
    },
    sbMasterBeastcaller: {
      hello: {
        '1': 'Cuidado dónde pisas. Esa es Bramble. Ella llegó primero.',
        '2': 'Rowan Thistlefoot. Me gustan los animales. Las personas, todavía lo estoy pensando.'
      },
      open: {
        '1': 'Ah, eres tú. Bramble te esperaba. Yo también. Un poco.'
      },
      again: {
        '1': 'Tú otra vez. A Bramble le caes bien. Yo aún lo estoy pensando.'
      },
      train: {
        '1': 'Agáchate. Más despacio. Extiende la mano y deja que vengan a ti. Bien.'
      },
      favor: {
        '1': '¿Hablar? Escucho. Ese es el truco que casi nadie aprende.',
        '2': 'Las arañas gigantes están llenando de telarañas los senderos de los animales en el Bosque Susurrante. Acaba con ocho.',
        '3': 'Luego tráeme dos campanillas lunares para mi guarida. Bramble duerme mejor cerca de ellas.',
        say: '¿Puedes hablar con los animales?'
      },
      waiting: {
        '1': 'Ocho arañas, dos campanillas lunares. Los animales esperan. Y Bramble también.',
        say: 'Sobre tu prueba...'
      },
      favorDone: {
        '1': 'Hm. Los ciervos bajaron al río esta mañana. Ya me imaginaba que eras tú.',
        '2': 'Vale. Te enseñaré. Sin alborotos. Bramble, deja de mover la cola.',
        say: 'Los senderos están despejados, y aquí tienes tus campanillas lunares.'
      },
      class: {
        '1': 'Llamas a lo salvaje, y lo salvaje viene. Lobos, un halcón, un oso. Amigos, no mascotas.',
        '2': 'Carisma, para que quieran venir. Aguante, para seguirles el ritmo.',
        say: '¿Qué es un Domador de Bestias?'
      },
      ready: {
        strong: {
          '1': 'Ahora toda la manada confía en ti. Coge lo que quieras.'
        },
        able: {
          '1': 'Les caes bien a los lobos. Ya puedes con la siguiente.'
        },
        weak: {
          '1': 'Todavía no. No se fían de ti. Más Carisma, y mucha más paciencia.'
        }
      },
      who: {
        '1': 'Encontré a Bramble en una trampa hace años. Tres patas y mucho carácter. Desde entonces vamos juntos.',
        '2': 'Duermo en el pajar del establo. Los caballos roncan menos que la gente.'
      },
      trainBack: {
        '1': 'Bien. Venga, ve. Y saluda a los cuervos. Se acuerdan.'
      },
      bye: {
        '1': 'Venga, ve. Bramble te dice adiós.'
      }
    },
    sbMasterElementalist: {
      hello: {
        '1': '¡Hola! Un segundo, estoy haciendo malabares. Fuego, escarcha, chispa, piedra y... ¡atrapados! ¡Hola!',
        '2': 'Magistra Iris Fourwinds. Enseño los cuatro elementos. Mezclarlos es lo divertido.'
      },
      again: {
        '1': '¡Has vuelto! Bien, necesitaba público. Mira esto. ¡Tachán!'
      },
      train: {
        '1': 'Coge dos orbes. Los que quieras. Ahora haz que choquen. ¡Con cuidado! ¿Ves? ¡Una reacción!'
      },
      class: {
        '1': '¡Mezclamos! Escarcha y luego fuego: se derrite. Fuego y luego rayo: ¡bum! Cada pareja hace algo.',
        '2': 'Inteligencia para cada hechizo. Técnica, porque los buenos piden manos rápidas.',
        say: '¿Qué hace un Elementalista?'
      },
      ready: {
        strong: {
          '1': '¡Ya mezclas de maravilla! Elige cualquier lección. ¡Elige dos!'
        },
        able: {
          '1': '¡Uy, qué buena chispa! Ya puedes con la siguiente.'
        },
        weak: {
          '1': '¡Todavía no! Tus elementos se apagan solos. Más Inteligencia, por favor.'
        }
      },
      sleeve: {
        '1': '¡Ay! Pues sí. Espera... Ya está.',
        '2': 'Fuego y luego escarcha. En realidad era una lección. ¡De nada!',
        say: 'Esto... se te está quemando la manga.'
      },
      trainBack: {
        '1': '¡Genial! Ahora practica fuera, por favor. Las cortinas son nuevas.'
      },
      bye: {
        '1': '¡Adiós! Si huele a humo, seguramente soy yo. ¡No te preocupes!'
      }
    },
    sbMasterSoulwarden: {
      hello: {
        '1': 'Chis, tranquilos, son buenos. Ay, tú no. Hablaba con los fuegos fatuos.',
        '2': 'Guardiana Odalys Lanternlight. Ayudo a los espíritus perdidos a encontrar el camino a casa.'
      },
      again: {
        '1': 'Hola otra vez. Los fuegos fatuos se acuerdan de ti. Ese te está saludando.'
      },
      train: {
        '1': 'Sostén el farol bajo y habla bajito. Lo que se pierde acude a una voz amable.'
      },
      class: {
        '1': 'Cuando derrotas a un enemigo, su espíritu se pierde un poco. Lo ayudamos, y él nos ayuda a nosotros.',
        '2': 'Inteligencia para guiar la luz. Carisma, para que los espíritus quieran quedarse un rato.',
        say: '¿Qué hace un Guardián de Almas?'
      },
      ready: {
        strong: {
          '1': 'Ahora hasta los espíritus más tímidos acuden a ti. Elige cualquier lección.'
        },
        able: {
          '1': 'Los fuegos fatuos confían en ti. Ya puedes con la siguiente lección.'
        },
        weak: {
          '1': 'Todavía no. Aún son tímidos contigo. Más Inteligencia, y un poco de Carisma.'
        }
      },
      wisps: {
        '1': '¡Más o menos! Son espíritus que se perdieron. Este es Fidget. Le gusta el lado calentito.',
        '2': 'Ningún espíritu es malo, ¿sabes? Solo está perdido. Vuelven a casa cuando están listos.',
        say: '¿Las lucecitas de tu farol están vivas?'
      },
      trainBack: {
        '1': 'Muy bien. Ahora déjalos ir con suavidad. Han tenido un día largo.'
      },
      bye: {
        '1': 'Cuídate. Y si ves una lucecita perdida, salúdala.'
      }
    },
    sbMasterIronmonk: {
      hello: {
        '1': 'Siéntate. Respira. No, respiras como si llegaras tarde a algo. Otra vez.',
        '2': 'Maestro Oru Stillwater. Enseño la mano abierta. Puños de hierro, corazón en calma.'
      },
      again: {
        '1': 'Ah. Has vuelto. El río también. Cada día.'
      },
      train: {
        '1': 'Pies como raíces, manos como lluvia. Golpea. Otra vez. El que cuenta es el número cien.'
      },
      class: {
        '1': 'Sin hoja. Manos, pies, aliento. Cada golpe prepara el siguiente, hasta el grande.',
        '2': 'Destreza para manos rápidas. Aguante para mantener la calma mientras a los demás les falta el aire.',
        say: '¿Qué es un Monje de Hierro?'
      },
      ready: {
        strong: {
          '1': 'Pronto serás tú quien me enseñe a mí. No se lo digas a nadie. Elige cualquier lección.'
        },
        able: {
          '1': 'Bien. La taza se va llenando. Toma la siguiente lección.'
        },
        weak: {
          '1': 'Todavía no. Un árbol de raíces cortas cae con el viento. Más Aguante.'
        }
      },
      noodles: {
        '1': 'Lo es. El caldo ha hervido a fuego lento dos días. Por favor, no le respires encima.',
        '2': 'Un buen cuenco enseña paciencia. Un gran cuenco enseña todo lo demás.',
        say: '¿Eso es un cuenco de fideos?'
      },
      trainBack: {
        '1': 'Bien. Ahora come algo caliente. La fuerza sale del cuenco.'
      },
      bye: {
        '1': 'Buen camino. Pisa suave. Patea fuerte.'
      }
    },
    sbMasterBard: {
      hello: {
        '1': '¡Pasa, pasa, que aquí dentro se está mejor, junto al fuego y al calor! Ay, eso ha rimado. Me pasa.',
        '2': 'Lark Merriweather. Toco junto al fuego y enseño a tocar el laúd a quien quiera escuchar.'
      },
      again: {
        '1': '¡Mi público favorito! Acércate un taburete. Cuidado con la gata, es la crítica.'
      },
      train: {
        '1': 'Rasguea conmigo. Uno, dos y tres... No te mires los dedos. ¡Siéntelo!'
      },
      class: {
        '1': 'Canciones que hacen más valiente a tu bando, melodías que hacen dormir al otro.',
        '2': 'Carisma para ganarte al público. Técnica, para que tus dedos sigan a tu corazón.',
        say: '¿Qué hace un Bardo?'
      },
      ready: {
        strong: {
          '1': '¡Ya llenarías cualquier taberna! Llévate todas mis canciones.'
        },
        able: {
          '1': '¡Qué bonita melodía! Ya puedes con la siguiente estrofa.'
        },
        weak: {
          '1': 'Todavía no. El público sigue bostezando. Más Carisma, colega.'
        }
      },
      story: {
        '1': 'Una vez, un caballero cruzó este mismo puente sin nada más que una espada y una canción...',
        '2': 'Espera, con música queda mejor. La-la-la, el caballero se fue... ¿Por dónde iba?',
        '3': 'Bah, da igual. Bonita canción, ¿verdad?',
        say: '¿Me cuentas una historia?'
      },
      trainBack: {
        '1': '¡Bravo! Practica cada día. Aunque suene fatal. Sobre todo entonces.'
      },
      bye: {
        '1': '¡Que te vaya bien, y vuelve pronto también! Uy. Otra rima. ¡Chao!'
      }
    }
  },
  invasion: {
    pylonsDown: '¡Cae el último pilón y su tesoro se desparrama!',
    reborn: {
      tusker: 'Tusker renacido',
      emberLord: 'El Señor de las Ascuas infernal',
      frostJarl: 'El Jarl de la Escarcha renacido',
      voidDragon: 'El Dragón del Vacío renacido'
    }
  },
  enemy: {
    sphinx: "La Esfinge",
    leviathan: "El Leviatán",
    hydra: "La Hidra",
    elderDragon: "El Dragón Ancestral",
    trainingDummy: 'Muñeco de entrenamiento',
    goblin: 'Goblin',
    goblinSlinger: 'Goblin hondero',
    bandit: 'Bandido',
    banditArcher: 'Arquero bandido',
    wolf: 'Lobo',
    banditChief: 'Jefe bandido',
    gnome: 'Gnomo',
    goblinKing: 'El Rey Goblin',
    treant: 'Ent',
    spider: 'Araña gigante',
    broodSpider: 'Cría de araña',
    outlawCaptain: 'Capitán forajido',
    elderTreant: 'Ent anciano',
    warlord: 'Caudillo Krag',
    fireElemental: 'Elemental de fuego',
    ironGolem: 'Gólem de hierro',
    cultist: 'Cultista',
    emberLord: 'El Señor de las Ascuas',
    ironColossus: 'El Coloso de Hierro',
    frostGiant: 'Gigante de escarcha',
    naga: 'Naga',
    skeleton: 'Esqueleto',
    necromancer: 'Nigromante',
    chimera: "La Quimera",
    chimeraTail: "Cola de serpiente",
    centaurWarchief: "El Caudillo centauro",
    cyclops: "El Cíclope",
    frostJarl: 'El Jarl de la Escarcha',
    nagaOracle: 'La Oráculo Ahogada',
    voidStalker: 'Acechador del Vacío',
    wyvern: 'Guiverno',
    highDemon: 'Alto demonio',
    voidWarden: 'El Custodio del Vacío',
    voidDragon: 'El Dragón del Vacío',
    doomKnight: 'Caballero de la perdición',
    imp: 'Diablillo',
    archDemon: 'El Archidemonio',
    voidling: 'Engendro del Vacío',
    voidLord: 'El Señor del Vacío',
    demonPylon: 'Pilón demoníaco',
    orderGuard: 'Inquisidor de la Orden',
    syndicateBlade: 'Hoja del Sindicato',
    goblinWarchief: 'Caudillo Goblin',
    thornfather: 'Padre de las Espinas',
    broodMother: 'Madre de la Nidada',
    banditBaron: 'Barón Bandido',
    cinderGolem: 'Gólem de Brasa',
    frostHowler: 'Aullador de Escarcha',
    tideSerpent: 'Serpiente de la Marea',
    riftKnight: 'Caballero de la Grieta',
    wyvernMatriarch: 'Matriarca Guiverno',
    tusker: 'Tusker, el Jabalí de Guerra',
    tuskerCameo: 'Tusker',
    goblinTyrant: 'Tirano Goblin',
    voidDrake: 'Draco del Vacío',
    pitLord: 'Señor del Abismo',
    frostThane: 'Thane de la Escarcha',
    hellhound: 'Can infernal',
    frostHellhound: 'Can infernal de escarcha',
    gargoyle: 'Gárgola',
    harpy: 'Arpía',
    corruptedTreant: 'Ent corrupto',
    centaurRaider: 'Centauro saqueador',
    cyclopsBrute: 'Bruto cíclope',
    demonMiner: 'Minero demoníaco',
    sphinxAcolyte: 'Acólito de la esfinge',
    seaDemon: 'Demonio marino',
    drakeHatchling: 'Cría de draco',
    hydraSpawn: 'Engendro de hidra'
  },
  results: {
    careful: 'Victoria cuidadosa ×{mult}',
    victory: '¡Victoria!',
    defeat: 'Derrota',
    retreat: 'Retirada',
    firstClear: '¡Primera victoria!',
    waves: 'Oleadas superadas: {n}',
    levelUp: '¡Nivel {n}!',
    points: '+{n} puntos de atributo',
    xp: 'Experiencia',
    gold: 'Oro',
    lost: 'Perdido',
    kills: 'Derrotados',
    chests: 'Cofres',
    bosses: 'Jefes',
    mastery: 'Dominio de la zona',
    masteryPct: '{n} %',
    newBest: '¡Nuevo récord!',
    time: 'Tiempo',
    unlocked: 'Nuevo en el mapa: {places}',
    equipped: 'Equipado',
    better: 'Mejor que lo que llevas',
    retry: 'Reintentar',
    tip: 'Conservas la experiencia y el botín. Gasta tus puntos, visita a un maestro y vuelve con más fuerza.'
  },
  pause: {
    title: 'En pausa',
    resume: 'Reanudar',
    controls: 'Controles',
    retreat: 'Retirarse al mapa',
    retreatNote: 'Conservas todo lo ganado hasta ahora, pero la zona no queda despejada.'
  },
  ending: {
    more: 'El Archidemonio ha caído, pero el reino aún no está a salvo. Queda una gran amenaza para el mundo, y espera dentro de la Grieta del Vacío.',
    order: {
      title: 'La Paz de Hierro',
      text: 'Los estandartes de la Orden de Hierro ondean sobre la Fortaleza del Terror. Los caminos son seguros, las leyes son muchas, y tu nombre está grabado sobre la puerta.'
    },
    syndicate: {
      title: 'El Trato Ceniciento',
      text: 'El Sindicato gobierna desde las sombras de la fortaleza. Ya nada está prohibido en el reino. Solo es caro.'
    },
    circle: {
      title: 'La Era del Éter',
      text: 'El Círculo ilumina la fortaleza con fuego del Vacío capturado. De sus puertas salen maravillas a raudales, y nadie pregunta cuánto cuestan.'
    },
    free: {
      title: 'Sin reyes',
      text: 'El trono yace hecho pedazos y la fortaleza está vacía. Por primera vez en una era, el reino pertenece a la gente que vive en él.'
    },
    unbound: {
      title: 'Indomable',
      text: 'Tomaste el trono. La Orden, el Sindicato y el Círculo marchan juntos contra ti. Que vengan.'
    },
    note: {
      goblinPact: 'Los mercaderes goblin siguen regateando en la plaza de Sunford.',
      goblinSlain: 'Las Hondonadas están vacías, y las caravanas llegan a su hora.',
      goblinRansom: 'El Rey Goblin vuelve a ser rico, y vuelve a saquear.',
      oakhavenSaved: 'Las murallas de Oakhaven son ahora más altas, y sus mercados están más llenos.',
      oakhavenFallen: 'La maleza crece por las calles de Oakhaven. El mercado negro prospera.',
      coreOrder: 'Las minas de Ironhold están tranquilas, y los enanos vuelven a cavar.',
      coreCircle: 'Las forjas de Ironhold brillan en azul, y sus armas de fuego son las mejores del reino.',
      coreSold: 'En algún lugar, el núcleo sigue zumbando. Los gólems siguen caminando.',
      oracleFreed: 'En los días de calma, los pescadores ven a la oráculo mar adentro.',
      oracleSlain: 'El Templo Sumergido guarda silencio. Ya nadie sabe qué viene después.',
      dragonPact: 'Un dragón anida en el tejado de la fortaleza, y solo responde a un nombre.',
      dragonSlain: 'Un cráneo de dragón cuelga en el gran salón de la Orden.'
    }
  },
  options: {
    saves: {
      save: 'Guardar',
      load: 'Cargar',
      newGame: 'Empezar partida nueva',
      newGameWarn: 'Tu partida actual se sustituye por una nueva. Guárdala antes en una ranura si quieres conservarla.',
      confirm: '¿Seguro? Toca otra vez',
      slot: 'Ranura {n}',
      empty: 'Vacía',
      level: 'Nivel {n}',
      levelAt: '{level} · {place}',
      overwriteAsk: 'Sobrescribir',
      saved: '¡Guardado!',
      loadWarn: 'Cargar sustituye tu partida actual. Guárdala antes en una ranura si quieres conservarla.',
      saveHint: 'Tu partida se guarda sola mientras juegas. Guarda aquí una copia para volver a ella más tarde, por ejemplo para probar otra build.',
      loadHint: 'Carga una copia guardada. La partida se reinicia desde ella.'
    },
    gameplay: 'Jugabilidad',
    title: 'Opciones',
    general: 'General',
    audio: 'Audio',
    language: 'Idioma',
    difficulty: 'Dificultad',
    soundEffects: 'Efectos de sonido',
    music: 'Música',
    mute: 'Silenciar',
    musicTrack: 'Pista de música',
    musicTracks: {
      cozy: 'Tranquila',
      trance: 'Aventura'
    },
    haptics: 'Vibración',
    on: 'Activado',
    off: 'Desactivado',
    close: 'Cerrar',
    keyboard: {
      auto: 'Detectar distribución del teclado',
      layout: 'Distribución del teclado',
      detected: 'Detectada: {layout}',
      bindings: 'Asignación de teclas',
      press: 'Pulsa una tecla… (Esc para cancelar)',
      reset: 'Restablecer teclas'
    },
    actions: {
      up: 'Mover arriba',
      down: 'Mover abajo',
      left: 'Mover a la izquierda',
      right: 'Mover a la derecha',
      skill1: 'Habilidad 1',
      skill2: 'Habilidad 2',
      skill3: 'Habilidad 3',
      skill4: 'Habilidad 4',
      skill5: 'Habilidad 5',
      skill6: 'Habilidad 6',
      potion: 'Beber poción',
      manaPotion: 'Beber poción de maná',
      leave: 'Salir de una zona ganada',
      interact: 'Hablar',
      target: 'Siguiente objetivo',
      map: 'Mapa del mundo',
      character: 'Héroe',
      inventory: 'Bolsa',
      skills: 'Habilidades',
      roll: 'Voltereta de esquiva',
      elixir: 'Beber elixir',
      elixirNext: 'Siguiente elixir',
      skill7: 'Habilidad 7',
      skill8: 'Habilidad 8'
    },
    difficulties: {
      easy: 'Fácil',
      medium: 'Media',
      hard: 'Difícil'
    },
    difficultyHints: {
      easy: 'Los enemigos golpean más flojo y caen antes.',
      medium: 'El desafío tal y como se diseñó.',
      hard: 'Enemigos más duros que golpean más fuerte.'
    }
  },
  adsBlocked: {
    title: 'No se pudo mostrar el anuncio',
    body: 'Intentamos mostrarte un vídeo, pero algo en tu navegador bloquea los anuncios.',
    allowPrefix: 'Permite los anuncios en',
    allowSuffix: '(o pausa tu bloqueador para este juego) e inténtalo de nuevo.',
    gotIt: 'Entendido'
  },
  forcedDark: {
    title: 'Desactiva el modo oscuro para este juego, por favor',
    body: 'Tu navegador o una extensión está cambiando los colores de esta página. El juego tiene sus propios colores y no funciona con modos oscuros forzados.',
    waiting: 'El juego continúa solo en cuanto lo desactives.',
    continueAnyway: 'Continuar bajo mi riesgo',
    hint: {
      darkReader: 'Dark Reader: pulsa su icono y desactívalo para este sitio.',
      extension: 'Abre tu extensión de modo oscuro y desactívala para este sitio.',
      chromiumFlag: 'Abre {flagUrl} y pon «Auto Dark Mode for Web Contents» en Default, o desactiva «tema oscuro para sitios» en los ajustes de tema del navegador.',
      samsung: 'Samsung Internet: abre el menú y desactiva el modo oscuro, o activa Labs → «Use website dark theme».',
      forcedColors: 'Windows: desactiva los temas de contraste en Configuración → Accesibilidad → Temas de contraste.',
      firefoxColors: 'Firefox: Ajustes → Colores → pon «Reemplazar los colores especificados por la página» en Nunca.'
    }
  },
  samsungFix: {
    title: 'Prueba rápida de color',
    body: 'Algunos teléfonos cambian los colores de las páginas web. Compara los dos cuadrados de abajo.',
    question: '¿Se ven iguales los dos cuadrados?',
    refSquare: 'Cuadrado de referencia',
    pageSquare: 'Cuadrado de la página',
    yes: 'Sí, son iguales',
    no: 'No, se ven distintos',
    option: 'Corregir colores (modo oscuro de Samsung)',
    optionHint: 'Actívalo si los menús se ven oscuros o el texto cuesta leerlo.',
    recheck: 'Repetir la prueba de color'
  },
  saveStatus: {
    restoredTitle: 'Guardado en la nube restaurado',
    restoredBody: '+{n} de oro de bonificación por la recuperación',
    tap: 'toca',
    pausedTitle: 'Sincronización pausada',
    pausedBody: 'Jugando sin conexión. Tu progreso se guarda aquí.',
    retry: 'Reintentar',
    dismiss: 'descartar'
  },
  loading: {
    tooLong: '¿La carga tarda demasiado? Desactiva tu bloqueador de anuncios y recarga.'
  },
  license: {
    denied: 'Acceso denegado: adquiere una licencia.'
  },
  leaderboard: {
    title: 'Clasificación',
    rank: '#',
    player: 'Jugador',
    score: 'Experiencia',
    flair: 'Nivel',
    empty: 'Aún no hay nadie en la clasificación. ¡Sé el primero!',
    failed: 'No se pudo cargar la clasificación.',
    loading: 'Cargando…',
    you: 'Tú',
    yourRank: 'Eres #{n} de {total}',
    of: 'de {n} jugadores',
    tabGlobal: 'Global'
  },
  wind: {
    title: 'Segundo aliento',
    text: 'Caíste. ¿Te levantas con el {n}% de tu salud y terminas el combate?',
    once: 'Una vez por visita.',
    watch: 'Ver un vídeo',
    take: 'Levantarte',
    decline: 'No, gracias'
  },
  purse: {
    offer: 'Triplica la bolsa: +{n}'
  },
  shelf: {
    title: 'Mercancía rara',
    restock: 'Género nuevo',
    tomorrow: 'Género nuevo mañana'
  },
  rested: {
    hud: '2× XP',
    banner: '¡Bienvenido de vuelta! Estás descansado: {time} de XP doble en tus próximos combates.',
    banner__f: '¡Bienvenida de vuelta! Estás descansada: {time} de XP doble en tus próximos combates.',
    hm: '{h} h {m} min',
    m: '{m} min',
    h: '{h} h'
  },
  preset: {
    title: 'Builds',
    name: 'Build {n}',
    rename: 'Nombre de la build {n}',
    save: 'Guardar',
    load: 'Usar',
    saved: '{name} guardada.',
    loaded: '{name} activada.',
    skipped: 'Se quedó fuera: {list}'
  },
  respec: {
    title: 'Olvida tu entrenamiento',
    note: 'Recupera los {n} puntos de atributo que gastaste y vuelve a gastarlos.',
    none: 'Aún no tienes puntos que recuperar.',
    free: 'Olvidar (gratis)',
    buy: 'Olvidar ({n} de oro)',
    confirm: '¿Seguro? Toca otra vez',
    bench: 'Estas habilidades vuelven al estante: {list}',
    done: 'Listo. Tus puntos vuelven a ser tuyos para gastarlos.'
  },
  contract: {
    title: 'Tablón de encargos',
    lead: 'Cada facción publica un trabajo al día. Cuentan mientras juegas; entrégalos en cualquier pueblo.',
    slay: 'Derrota a: {enemy} — {place}',
    clear: 'Gana una visita a {place}',
    chests: 'Abre cofres en cualquier lugar',
    rep: '+1 reputación',
    handIn: 'Entregar',
    handed: 'Hecho por hoy',
    thanks: '{name} te da las gracias.'
  },
  rep: {
    title: 'Reputación',
    meter: '{name}: reputación {n}',
    giftAt: 'Regalo en +{n}',
    giftClaim: 'Recoger regalo',
    giftTaken: 'Regalo recogido',
    giftGot: 'Un regalo para ti: 300 de oro y {item}.',
    giftGold: 'Un regalo para ti: 300 de oro.',
    blessAt: 'Bendición en +{n}',
    bless: {
      order: 'Bendecido: +5 % de vida',
      syndicate: 'Bendecido: +10 % de oro por bajas',
      circle: 'Bendecido: +10 % de regeneración de maná',
      order__f: 'Bendecida: +5 % de vida',
      syndicate__f: 'Bendecida: +10 % de oro por bajas',
      circle__f: 'Bendecida: +10 % de regeneración de maná'
    }
  },
  ladder: {
    tab: 'Coliseo',
    wave: 'Oleada',
    week: 'Esta semana: {mod}',
    weekBest: 'Mejor de esta semana: oleada {n}',
    yourBest: 'Tu mejor de esta semana: oleada {n}',
    none: 'Aún no hay ascenso esta semana.',
    mod: {
      fire: 'Todo fuego',
      nopotions: 'Sin pociones',
      glass: 'Cristal',
      swarm: 'Enjambre',
      elites: 'Desfile de élite',
      haste: 'Prisa'
    },
    modDesc: {
      fire: 'cada golpe enemigo es de fuego',
      nopotions: 'sin pociones',
      glass: 'todos pegan un 50 % más fuerte',
      swarm: 'más enemigos, con menos salud cada uno',
      elites: 'un campeón en cada oleada',
      haste: 'los enemigos se mueven y golpean más rápido'
    }
  },
  forge: {
    upgrade: 'Mejorar ({n} de oro)',
    next: 'Siguiente +{level}: +{pct}% de estadísticas',
    town: 'Cualquier herrero de una ciudad puede mejorarlo.'
  },
  ore: {
    'demonglass': { 'name': "Cristal demoníaco" },
    'ichor': { 'name': "Icor mítico" },
    iron: {
      name: 'Mineral de hierro'
    },
    silver: {
      name: 'Mineral de plata'
    },
    gold: {
      name: 'Mineral de oro'
    },
    mithril: {
      name: 'Mineral de mithril'
    },
    adamant: {
      name: 'Mineral de adamantita'
    },
    aetherite: {
      name: 'Mineral de eterita'
    }
  },
  plant: {
    sunpetal: {
      name: 'Pétalo solar',
      desc: 'Una flor de un amarillo vivo. Los curanderos confían en ella.'
    },
    glowcap: {
      name: 'Brillaseta',
      desc: 'Una seta que brilla en la oscuridad. Buena para la mente.'
    },
    swiftfern: {
      name: 'Helecho veloz',
      desc: 'Un helecho ligero. Frótalo en tus botas y corre.'
    },
    ironmoss: {
      name: 'Musgo de hierro',
      desc: 'Musgo duro de las piedras. Endurece la piel.'
    },
    emberbloom: {
      name: 'Flor de brasa',
      desc: 'Una flor que se siente cálida en la mano.'
    },
    frostmint: {
      name: 'Menta helada',
      desc: 'Hojas frías y frescas. Te despejan la cabeza.'
    },
    moonbell: {
      name: 'Campanilla lunar',
      desc: 'Una flor pálida y rara que agudiza la vista.'
    },
    shadowthorn: {
      name: 'Espina sombría',
      desc: 'Una espina oscura y rara. Fuerte, y un poco malvada.'
    }
  },
  journal: {
    errands: 'Recados',
    empty: 'Tu diario aún está vacío. La gente del pueblo te pedirá ayuda.',
    from: 'Para {npc}',
    ready: '¡Hecho! Vuelve con {npc}.',
    taken: 'Nuevo recado: {title}',
    done: 'Recado hecho: {title}',
    step: {
      slay: 'Derrota a {n} × {enemy}',
      slayAt: 'Derrota a {n} × {enemy} en {place}',
      slayAnyAt: 'Derrota a {n} enemigos en {place}',
      clear: 'Despeja {place}',
      visit: 'Ve a {place}',
      gather: 'Recoge {n} × {plant}',
      bring: 'Lleva {item}',
      pieces: 'Encuentra {n} trozos del mapa del tesoro',
      dig: 'Excava en busca del tesoro en {place}',
      talk: 'Habla con {npc}'
    }
  },
  board: {
    title: 'Tablón de anuncios de {town}',
    read: 'Leer',
    lead: 'Las tareas de hoy. Entrégalas aquí cuando estén hechas.',
    kind: {
      slay: 'Caza',
      gather: 'Hierbas',
      escort: 'Caravana'
    },
    slay: 'Derrota a {n} × {enemy} en {place}',
    gather: 'Trae {n} × {plant}',
    escort: 'Protege la caravana en el camino a Oakhaven',
    xp: '+{n} XP',
    setOut: 'En marcha',
    thanks: '¡Hecho! El pueblo te lo agradece.'
  },
  escort: {
    start: '¡Protege la caravana hasta el final del camino!',
    waiting: 'La caravana te espera.',
    arrived: '¡La caravana ha llegado!',
    lost: 'La caravana se ha perdido…'
  },
  elixir: {
    might: {
      name: 'Elixir de poder',
      desc: '+{n}% de daño durante 5 minutos'
    },
    iron: {
      name: 'Brebaje piel de hierro',
      desc: '+{n}% de armadura durante 5 minutos'
    },
    swift: {
      name: 'Tónico de celeridad',
      desc: '+{n}% de velocidad y velocidad de ataque durante 5 minutos'
    },
    mind: {
      name: 'Infusión de mente clara',
      desc: 'Las habilidades se recargan un {n}% más rápido durante 5 minutos'
    },
    vigor: {
      name: 'Elixir de vigor',
      desc: 'Cura un {n}% de tu vida cada segundo durante 5 minutos'
    },
    shadow: {
      name: 'Brebaje sediento',
      desc: 'Tus golpes te curan un {n}% de su daño durante 5 minutos'
    }
  },
  alchemy: {
    talk: 'Entran hierbas, salen elixires. ¿Cuál preparamos?',
    lead: 'Cada elixir dura 5 minutos en combate. Bébelo de tu tercer frasco. Puedes llevar {n} de cada uno.',
    brew: 'Preparar · {n}',
    carry: 'Llevar este',
    carried: 'En tu frasco',
    count: '{n} / {max}',
    herb: '{plant}: {have} de {n}',
    done: '¡Preparado!',
    why: {
      full: 'Ya llevas todos los que puedes de este.',
      herbs: 'No tienes suficientes hierbas. Recoge más en la naturaleza.',
      gold: 'No tienes suficiente oro.'
    }
  },
  memory: {
    title: 'El puesto de la memoria',
    lead: 'Encuentra todas las parejas antes de que se acabe la arena y gana el doble de tu apuesta. Cinco victorias seguidas añaden un premio legendario.',
    bet: 'Apostar {n}',
    row: 'Victorias seguidas: {n} de {max}',
    pairs: '{n} parejas · {s} segundos',
    won: '¡Todas las parejas encontradas! Ganas {n} de oro.',
    lost: 'Se acabó la arena. La apuesta se ha perdido.',
    again: 'Jugar otra vez',
    noGold: 'No tienes suficiente oro para esa apuesta.',
    card: 'Carta {n}'
  },
  cups: {
    title: 'Puesto de vasos',
    lead: 'Mira la gema, sigue su vaso y luego elígelo. Cada victoria seguida paga más. La tercera trae una pieza de premio, la quinta un tesoro.',
    free: 'Ronda gratis',
    fee: 'Jugar · {n}',
    row: 'Victorias seguidas: {n} de {max}',
    next: 'Próxima victoria: {n} de oro',
    watch: '¡Mira la gema!',
    follow: 'Síguela…',
    pick: '¡Elige un vaso!',
    hint: 'Toca un vaso o pulsa su número.',
    won: '¡La encontraste! +{n} de oro',
    lost: 'Ese no era. La racha empieza de nuevo.',
    near: '¡Por poco! Estaba justo al lado.',
    timeout: '¡Demasiado lento! La racha empieza de nuevo.',
    again: 'Jugar otra vez',
    noGold: 'No hay oro suficiente. Mañana tu primera ronda es gratis.',
    cup: 'Vaso {n}'
  },
  battle: {
    title: 'Duelo de objetos',
    lead: 'Pon un objeto contra el del apostador: el precio de venta más alto se lleva el punto, dos puntos ganan. Tus objetos se pierden pase lo que pase. Tres victorias seguidas traen una pieza de premio.',
    fee: 'Sentarse · {n}',
    row: 'Victorias seguidas: {n} de {max}',
    needItems: 'Necesitas al menos {n} objetos sin equipar en la bolsa.',
    noGold: 'No tienes suficiente oro para la tarifa.',
    theirs: 'El apostador pone',
    pick: 'Elige un objeto',
    lay: 'Ponerlo',
    value: '{n} de oro',
    score: 'Tú {a} · {b} Apostador',
    roundWon: 'El tuyo vale más. ¡Punto para ti!',
    roundLost: 'El otro vale más. Punto para el apostador.',
    won: '¡Ganas la partida! +{n} XP',
    lost: 'El apostador gana la partida.',
    again: 'Jugar otra vez'
  },
  gamble: {
    prize: 'Premio: ¡{item}!',
    prizeGold: 'Ya los tienes todos, así que te llevas {n} de oro en su lugar.'
  },
  errand: {
    farmersFavor: {
      title: 'Los lobos de los Toller'
    },
    herbalistFavor: {
      title: 'Los pétalos solares de Briar'
    },
    collectorFavor: {
      title: 'Las campanillas lunares del Coleccionista'
    },
    mirelaFavor: {
      title: 'Los envíos perdidos de Mirela'
    },
    treasureMap: {
      title: 'El mapa del tesoro del capitán Rook'
    },
    windrunnerTest: {
      title: 'La prueba: Corredor del Viento'
    },
    frostwardenTest: {
      title: 'La prueba: Guardián de Escarcha'
    },
    lightbringerTest: {
      title: 'La prueba: Portador de Luz'
    },
    beastcallerTest: {
      title: 'La prueba: Domador de Bestias'
    }
  }
}
