// Portuguese (Brazil) locale — mirrors the key shape of en.ts exactly.
export default {
  // ─── Afterplay phase 8: items, materials and capstones ───
  // ─── Afterplay phase 10: the prestige classes ───
  'prestige': { 'toast': { 'wanderer': "Um andarilho misterioso espera no forte." } },
  'relic': {
    'infernal': "{name} · Infernal",
    'set': "Usado com {item}:",
    'heroicBadge': "Heroico {n}",
    'heroic': "Heroico {n}: {gold} de ouro, {glass} de vidro demoníaco",
    'heroicIchor': "Heroico {n}: {gold} de ouro, {glass} de vidro demoníaco, {ichor} de icor",
    'heroicMax': "Todas as patentes heroicas alcançadas.",
    'infernalForge': "Forja infernal: {gold} de ouro, {glass} de vidro demoníaco",
    'lens': "Lente do Oráculo: {boss} espera aqui.",
    'hydraKey': "Selado. A chave de fogo da Hidra abre o coração da Fenda.",
    'marksGlass': "Comprar {glass} de vidro demoníaco por {marks} marcas",
    'capstone': "Ápice",
    'fortOnly': "Este ápice só é ensinado no Passo do Bastião."
  },
  // ─── The fort's fair games (afterplay §9) ───
  'fair': {
    'fee': "Jogar · {n}",
    'again': "Jogar de novo",
    'noGold': "Ouro insuficiente.",
    'capped': "Zonas a limpar até os grandes prêmios voltarem: {n}",
    'top': "Prêmio máximo! +{gold} de ouro, +{xp} XP",
    'topGold': "Prêmio máximo, só em ouro: +{n} de ouro",
    'won': "Você venceu! +{n} de ouro",
    'lost': "Sem sorte. A sequência recomeça.",
    'row': "Vitórias seguidas: {n} de {max}",
    'mats': "+{n} de material Heroico+",
    'discount': "O ferreiro agora te dá {n}% de desconto nas melhorias!"
  },
  'whack': {
    'title': "Acerte o Diabrete",
    'lead': "Acerte 20 diabretes em 30 segundos. Deixe os de armadura dourada em paz: cada um que você acertar custa uma vida.",
    'hits': "Diabretes: {n} / {max}",
    'lives': "Vidas: {n}",
    'time': "Tempo: {n} s",
    'hint': "Toque nos diabretes ou aperte 1 a 9.",
    'barrel': "Barril {n}",
    'timeout': "O tempo acabou!",
    'dead': "Sem vidas!"
  },
  'ring': {
    'title': "Argolas na Hidra",
    'lead': "Segure para ganhar força, solte para arremessar. Uma cabeça só pega a argola perto do meio do balanço. Cada cabeça seguida vale um ponto a mais.",
    'hint': "Segure e solte na mesa, ou segure Espaço.",
    'rings': "Argolas restantes: {n}",
    'score': "Pontos: {n}",
    'hit': "Acertou! +{n}",
    'miss': "Errou!",
    'perfect': "Uma rodada perfeita!",
    'nothing': "{n} pontos. Sem prêmio desta vez.",
    'power': "Força"
  },
  'arm': {
    'title': "Queda de Braço",
    'lead': "Toque quando o anel encontrar o círculo para baixar o braço dele. Força alarga o ritmo. Três vitórias seguidas dão desconto na forja, cinco dão material Heroico+.",
    'hint': "Toque na mesa ou aperte Espaço.",
    'good': "Empurra!",
    'off': "Fora do ritmo!"
  },
  // ─── The Siege of Bastion (afterplay §8) ───
  'siege': {
    'title': "Cerco do Passo do Bastião",
    'lead': "Segure o portão por dez ondas. Entre as ondas, gaste Marcas de Cerco em defesas.",
    'story': "A horda está no portão. Resista a dez ondas: este primeiro cerco não pode ser perdido.",
    'bell': "O sino do cerco toca! A horda se reúne diante do portão.",
    'mapBell': "Cerco!",
    'start': "Tocar o sino",
    'wins': "Vitórias: {n}",
    'marksBank': "Marcas de Cerco guardadas: {n}",
    'tier': {
      'normal': "Normal",
      'hard': "Difícil",
      'nightmare': "Pesadelo"
    },
    'tierDesc': {
      'normal': "Inimigos um nível acima do seu.",
      'hard': "Inimigos 3 níveis acima, com 30% mais vida.",
      'nightmare': "Inimigos 6 níveis acima e duas ondas de elites míticos."
    },
    'locked': {
      'hard': "Vença primeiro um cerco normal.",
      'nightmare': "Abre quando a fenda for selada ou deixada entreaberta."
    },
    'lord': "Senhor do Cerco",
    'hud': {
      'wave': "Onda {n}/{total}",
      'marks': "Marcas: {n}",
      'gate': "Portão {pct}%",
      'build': "Onda {n} em {s} s",
      'ready': "Pronto!",
      'buy': "{name}: {n} Marcas"
    },
    'def': {
      'ballista': {
        'name': "Balista",
        'desc': "Dispara um virote perfurante pela sua pista a cada 2 segundos."
      },
      'cauldron': {
        'name': "Caldeirão de fogo",
        'desc': "Põe fogo no gargalo da sua pista."
      },
      'barricade': {
        'name': "Barricada",
        'desc': "Bloqueia uma pista por 20 segundos."
      },
      'militia': {
        'name': "Milícia",
        'desc': "Dois guardas lutam ao seu lado."
      },
      'repair': {
        'name': "Consertar o portão",
        'desc': "Restaura um quarto do portão."
      }
    },
    'block': {
      'marks': "Marcas de Cerco insuficientes.",
      'full': "Não cabe mais.",
      'phase': "Só entre as ondas."
    },
    'toast': {
      'cleared': "Onda {n} contida! +{marks} Marcas",
      'clearedUnharmed': "Onda {n} contida, portão intacto! +{marks} Marcas",
      'horn': "A trombeta soa! O portão está em {pct}%.",
      'ram': "Um aríete! Pare-o antes que chegue ao portão!",
      'rally': "De pé de novo! Segure o portão!"
    },
    'banner': {
      'wave': "Onda {n}",
      'final': "O Senhor do Cerco!"
    },
    'result': {
      'tier': "Cerco do Passo do Bastião: {tier}",
      'waves': "Ondas contidas: {n}/{total}",
      'marks': "Marcas de Cerco mantidas: {banked} de {earned}",
      'glass': "Vidro demoníaco: +{n}"
    },
    'milestone': {
      'normal1': "Marco alcançado: o Estandarte do Bastião.",
      'normal5': "Marco alcançado: a Couraça do Guardião das Muralhas.",
      'hard1': "Marco alcançado: Instinto de Veterano, um quinto espaço passivo.",
      'hard5': "Marco alcançado: Quebra-Portões.",
      'nightmare1': "Marco alcançado: a Coroa do Último Bastião.",
      'hardFlawless': "Marco alcançado: a chave de uma prova de classe oculta."
    }
  },
  // ─── The Breaking (the afterplay's story) ───
  'breaking': {
    'title': "A Ruptura",
    'toast': {
      brk6: "O Mestre Ferreiro recuperou sua forja. A forja infernal está aberta.",
      brk7: "A Esfinge está morta. A Lente do Oráculo mostra onde as grandes feras esperam.",
      brk8: "O Leviatã está morto. Sua escama deixa você andar sobre as águas rasas.",
      brk9: "A Hidra está morta. A chave de fogo dela é sua.",
      brk10: "O Dragão Ancestral está morto. A fenda está aberta.",
      sealed: "A fenda está selada. Você é o Selador da Fenda.",
      ajar: "A fenda continua entreaberta. Demônios vão testar as muralhas e o coliseu.",
      'brk2': "O Passo do Bastião te acolhe. Seu povo agora conta com você.",
      'rescued': "Sobreviventes resgatados! Estão seguros no Passo do Bastião.",
      'brk3': "O caminho está livre. O povo de Sunford está seguro.",
      'brk4': "A herbalista se junta ao forte.",
      'brk5': "A horda dos centauros foi quebrada. O forte se prepara para um cerco.",
    },
  },
  // ─── The intro (#130): its skip, and its narrator's name ───
  intro: {
    narrator: 'O Cronista',
    skip: 'Pular',
    holdKey: 'Segure {key} para pular',
    holdTouch: 'Segure para pular',
    replay: 'Ver a introdução'
  },
  arena: {
    allWon: 'Todos os prêmios míticos são seus.',
    call: 'A história foi contada. Agora prove o seu build: suba o mais alto que puder e conquiste os prêmios míticos que ninguém mais pode lhe dar.',
    prize: 'Prêmio conquistado: {item}!',
    milestone: 'Onda {n}!',
    next: 'Próximo prêmio na onda {at}: {item}',
    champion: 'Onda do campeão',
    wave: 'Onda {n}'
  },
  sellOre: {
    talk: 'Bom minério, preço justo. Quanto você vai vender?',
    lead: 'Escolha quantas pepitas de cada minério vender. Nada é vendido até você tocar em Vender.',
    have: 'Você tem {n}',
    each: '{n} de ouro cada',
    none: 'Nenhum',
    all: 'Tudo',
    less: '{ore}: um a menos',
    more: '{ore}: um a mais',
    total: 'Você recebe: {n} de ouro',
    sell: 'Vender',
    selectAll: 'Selecionar tudo',
    empty: 'Você não tem mais minério para vender.'
  },
  smith: {
    why: {
      max: 'Você tem os dois, aprimorados ao máximo.',
      gold: 'Ouro insuficiente.',
      ore: 'Minério insuficiente.',
      metal: 'Minere este minério primeiro.',
      learn: 'Primeiro um ferreiro precisa ensinar você.'
    },
    stamp: 'Forjado',
    take: 'Pegar',
    worked: '{item} aprimorado até +{n}',
    made: '{item} +{n}',
    grade: {
      perfect: 'Perfeito!',
      great: 'Ótimo trabalho!',
      good: 'Bom trabalho',
      poor: 'Trabalho tosco'
    },
    hint: 'Toque em “Golpear”, ou pressione Espaço, enquanto o brilho estiver na zona quente.',
    strikes: 'Golpe {n} de {max}',
    strike: 'Golpear!',
    forge: 'Forjar',
    gold: '{n} de ouro',
    nuggets: '{ore}: {have} de {n}',
    master: 'Um grande golpe o transforma em: {item}.',
    locked: 'Minere {ore} primeiro para aprender suas peças.',
    lead: 'Cada metal que você minera revela suas peças. Golpeie o brilho onde ele está mais quente: três golpes decidem a peça.',
    talk: 'Ferro quente não espera ninguém.'
  },
  gameName: 'Battlecross',
  cancel: 'Cancelar',
  close: 'Fechar',
  ok: 'Ok',
  continue: 'Continuar',
  onlyAvailableOn: 'Este jogo só está disponível em',
  ui: {
    next: 'Próximo',
    replay: 'Repetir',
    back: 'Voltar',
    play: 'Jogar',
    pause: 'Pausa',
    menu: 'Menu',
    home: 'Início',
    info: 'Info',
    help: 'Controles',
    ok: 'Entendi',
    continue: 'Continuar'
  },
  hud: {
    level: 'Nv. {n}',
    health: 'Vida {n} de {max}',
    mana: 'Mana {n} de {max}',
    heat: 'Calor',
    xp: 'XP',
    gold: '{n} de ouro',
    potion: 'Poção de vida (restam {n})',
    manaPotion: 'Poção de mana (restam {n})',
    potionStop: 'Beba uma poção de vida para continuar',
    groups: '{n} de {total} grupos de inimigos derrotados',
    wave: 'Onda {n} / {total}',
    roll: 'Rolamento',
    elixir: '{name} (restam {n})',
    elixirNext: 'Próximo elixir'
  },
  menu: {
    map: 'Mapa do mundo',
    character: 'Herói',
    skills: 'Habilidades',
    inventory: 'Bolsa',
    journal: 'Diário'
  },
  combat: {
    dodge: 'Esquiva',
    block: 'Bloqueado',
    immune: 'Imune'
  },
  level: {
    mine: 'Minerar',
    open: 'Abrir',
    guarded: 'Vigiado',
    locked: 'Trancado',
    potion: '+1 poção',
    manaPotion: '+1 poção de mana',
    leave: 'Sair',
    chestsLeft: 'Ainda há {n} baús fechados aqui'
  },
  status: {
    stun: 'Atordoado',
    knockup: 'No ar',
    knockdown: 'Derrubado',
    stasis: 'Estase',
    petrify: 'Petrificado',
    frozen: 'Congelado',
    fear: 'Com medo',
    slow: 'Lento',
    confuse: 'Confuso',
    taunt: 'Provocado',
    armorShred: 'Armadura quebrada',
    weaken: 'Enfraquecido',
    vulnerable: 'Vulnerável',
    burn: 'Queimando',
    poison: 'Envenenado',
    bleed: 'Sangrando',
    delayed: 'Dano atrasado',
    haste: 'Celeridade',
    attackSpeed: 'Ataques rápidos',
    damageUp: 'Fortalecido',
    defenseUp: 'Fortificado',
    regen: 'Regenerando',
    lifestealUp: 'Roubo de vida',
    invulnerable: 'Invulnerável',
    unkillable: 'Imortal',
    stealth: 'Oculto',
    reflect: 'Refletindo',
    envenom: 'Lâmina venenosa',
    exosuit: 'Exotraje',
    focus: 'Concentrado',
    accelerate: 'Aceleração',
    overheat: 'Superaquecido',
    enrage: 'Enfurecido',
    ambush: 'Emboscada',
    elixirMight: 'Elixir do poder',
    elixirIron: 'Pele de ferro',
    elixirSwift: 'Ligeireza',
    elixirMind: 'Mente clara',
    elixirVigor: 'Vigor',
    elixirShadow: 'Lâmina sedenta',
    chi: 'Chi'
  },
  toast: {
    cageLocked: 'Trancada. A chave deve estar em algum lugar por aqui.',
    cageKey: 'Uma chave! Ela deve abrir a jaula.',
    ore: 'Minerado: {n} × {ore}',
    mineBusy: 'Não com inimigos por perto!',
    pressureUp: 'Seus inimigos ficam mais ferozes {skulls}',
    pressureDown: 'Seus inimigos dão uma trégua {skulls}',
    item: 'Encontrado: {item}',
    levelUp: 'Nível {level}! +3 pontos de atributo',
    boss: 'Surge: {boss}',
    wave: 'Onda {n}',
    herb: 'Colhido: {plant}',
    piece: 'Um pedaço do mapa do tesouro!'
  },
  coach: {
    move: {
      touch: 'Toque no chão para andar até lá, ou use o direcional.',
      mouse: 'Clique no chão para andar até lá, ou ande com as teclas de movimento.'
    },
    target: {
      touch: 'Toque em um inimigo, ou arraste do seu herói até ele, para atacá-lo.',
      touch__f: 'Toque em um inimigo, ou arraste da sua heroína até ele, para atacá-lo.',
      mouse: 'Clique em um inimigo para atacá-lo.'
    },
    skill: {
      touch: 'Toque em uma habilidade para usá-la no seu alvo.',
      mouse: 'Pressione a tecla de uma habilidade para usá-la no seu alvo.'
    },
    aim: {
      touch: 'Arraste uma habilidade para o campo para mirar e solte para lançar.',
      mouse: 'Arraste uma habilidade para o campo para mirar e solte para lançar.'
    },
    potion: {
      touch: 'Toque na poção para se curar.',
      mouse: 'Pressione a tecla da poção para se curar.'
    },
    mana: {
      touch: 'Toque no frasco azul para recuperar sua mana.',
      mouse: 'Pressione a tecla da poção de mana para recuperar sua mana.'
    },
    chest: {
      touch: 'Toque em um baú para abri-lo.',
      mouse: 'Clique em um baú para abri-lo.'
    },
    talk: {
      touch: 'Siga o rastro até o mestre e toque nele para conversar.',
      mouse: 'Siga o rastro até o mestre e clique nele para conversar.'
    },
    teach: {
      touch: 'Toque em «Pode me ensinar algo?» para ver o que este mestre ensina.',
      mouse: 'Clique em «Pode me ensinar algo?» para ver o que este mestre ensina.'
    },
    learn: {
      touch: 'Toque em uma habilidade e depois em Aprender.',
      mouse: 'Clique em uma habilidade e depois em Aprender.'
    },
    slot: {
      touch: 'Toque na sua nova habilidade e depois em um espaço para levá-la à batalha.',
      mouse: 'Arraste sua nova habilidade para um espaço para levá-la à batalha.'
    },
    equip: {
      touch: 'Toque no item novo, compare os números verdes e vermelhos e toque no espaço dele para equipá-lo.',
      mouse: 'Arraste o item novo para o espaço dele para equipá-lo. Os números verdes sobem, os vermelhos descem.'
    },
    attr: {
      touch: 'Toque em um mais para gastar um ponto de atributo.',
      mouse: 'Clique em um mais para gastar um ponto de atributo.'
    },
    travel: {
      touch: 'Toque no próximo lugar do mapa e depois no botão para viajar até lá.',
      mouse: 'Clique no próximo lugar do mapa e depois no botão para viajar até lá.'
    },
    buy: {
      touch: 'Toque em um item para ver o preço e depois em Comprar.',
      mouse: 'Clique em um item para ver o preço e depois em Comprar.'
    },
    exit: {
      touch: 'Toque no botão do mapa para sair da cidade rumo à próxima aventura.',
      mouse: 'Clique no botão do mapa para sair da cidade rumo à próxima aventura.'
    },
    roll: {
      touch: 'Toque no botão de rolamento para escapar do perigo. Nada pode machucar você durante o rolamento.',
      mouse: 'Pressione a tecla de rolamento para escapar do perigo. Nada pode machucar você durante o rolamento.'
    }
  },
  goal: {
    dummy: 'Derrube o boneco de treino',
    clear: 'Limpe {place}',
    boss: 'Derrote {foe}',
    exit: 'Pegue o saque e saia',
    wave: 'Sobreviva às ondas',
    trainer: 'Fale com um treinador',
    learn: 'Aprenda uma habilidade',
    points: 'Gaste seus pontos',
    leave: 'Parta para {place}',
    travel: 'Viaje até {place}',
    decide: 'Faça sua escolha',
    explore: 'Explore o reino',
    fight: 'Vença a luta',
    show: 'Mostre o caminho: {goal}',
    escort: 'Proteja a caravana'
  },
  node: {
    'bastion': {
      'name': "Passo do Bastião",
      'desc': "Um velho forte de fronteira, as últimas muralhas ainda de pé. Os sobreviventes se reúnem aqui.",
    },
    sunford: {
      name: 'Sunford',
      desc: 'Uma cidadezinha de lavradores na beira das planícies. Seu lar, um ferreiro e dois treinadores.'
    },
    plains: {
      name: 'Planícies de Sunford',
      desc: 'Goblins, lobos e bandidos atacam as caravanas na estrada aberta.'
    },
    hollows: {
      name: 'Grutas dos Goblins',
      desc: 'As cavernas sob as colinas. O Rei Goblin reúne sua corte lá no fundo.'
    },
    arena: {
      name: 'O Coliseu',
      desc: 'Onda após onda, cada uma mais difícil que a anterior. Até onde você consegue subir? Um novo ranking toda segunda-feira.'
    },
    woods: {
      name: 'Bosque Sussurrante',
      desc: 'Árvores velhas que andam, e aranhas que tecem entre elas.'
    },
    outskirts: {
      name: 'Arredores de Oakhaven',
      desc: 'As fazendas em chamas fora de Oakhaven. O exército de um senhor da guerra está no portão.'
    },
    oakhaven: {
      name: 'Oakhaven',
      desc: 'Uma cidade mercante murada. O que ela vai se tornar depende de você.'
    },
    crags: {
      name: 'Penhascos de Cinza',
      desc: 'Rocha negra e fogo a céu aberto. Os cultistas alimentam as chamas.'
    },
    mines: {
      name: 'Minas de Ironhold',
      desc: 'Os anões cavaram fundo demais e acordaram algo que brilha.'
    },
    ironhold: {
      name: 'Ironhold',
      desc: 'A cidade-forja da montanha. O melhor aço do reino é martelado aqui.'
    },
    tundra: {
      name: 'Tundra Gélida',
      desc: 'Um deserto branco onde gigantes caminham e os mortos não ficam no chão.'
    },
    temple: {
      name: 'Templo Submerso',
      desc: 'Salões alagados das nagas, e uma oráculo que vê todos os finais.'
    },
    citadel: {
      name: 'Cidadela do Vazio',
      desc: 'Uma fortaleza que não estava ali no ano passado. Suas muralhas zumbem.'
    },
    peak: {
      name: 'Pico do Dragão',
      desc: 'Serpes circulam o cume. Algo muito maior dorme lá em cima.'
    },
    fortress: {
      name: 'Fortaleza do Pavor',
      desc: 'A sede do Arquidemônio, e o trono que toda facção quer.'
    },
    rift: {
      name: 'A Fenda do Vazio',
      desc: 'A ferida por onde os demônios vieram. O Senhor do Vazio espera do outro lado.'
    },
    silverbridge: {
      name: 'Silverbridge',
      desc: 'A grande cidade do rio, sobre a velha ponte de pedra. Um mestre de cada classe ensina aqui.'
    }
  },
  map: {
    title: 'O Reino',
    town: 'Cidade',
    levels: 'Nv. {min}–{max}',
    arenaBest: 'Recorde: onda {n}',
    travel: 'Viajar',
    again: 'De novo',
    enter: 'Entrar',
    fight: 'Lutar',
    back: 'Voltar à cidade',
    locked: 'Limpe uma zona vizinha para abrir a estrada.',
    lockedArena: 'Seus portões se abrem quando o caso do Rei Goblin for resolvido.',
    lockedRift: 'Ela se abre quando o trono da Fortaleza do Pavor for decidido.',
    invaded: 'Invadida',
    invadedDesc: 'Demônios dominam esta terra. Seus pilares fazem os inimigos próximos baterem mais forte, as cicatrizes da fenda queimam e retardam, e cada inimigo abatido aqui vale mais.',
    lockedInvaded: 'Os demônios a dominam com força. Reconquiste {zone} primeiro.',
    danger: {
      '1': 'Um pouco acima do seu nível.',
      '2': 'Perigoso no seu nível.',
      '3': 'Muito acima do seu nível.'
    },
    questOpen: '{quest}: uma decisão espera aqui.',
    questDone: '{quest}: {choice}',
    trainer: 'Treinador oculto: {cls}',
    new: 'Novo',
    trueTest: 'O verdadeiro teste',
    skip: 'Toque para pular',
    compass: {
      n: 'N',
      e: 'L',
      s: 'S',
      w: 'O'
    },
    region: {
      vale: 'Vale Prado-Sol',
      hills: 'As Colinas dos Goblins',
      peaks: 'Os Picos de Ferro',
      ash: 'As Terras de Cinza',
      frost: 'A Marca Gélida',
      fields: 'Os Campos Dourados',
      mere: 'O Pântano dos Nagas',
      reach: 'Os Confins do Vazio',
      dread: 'As Terras do Pavor',
      sea: 'O Mar de Safira',
      bay: 'Baía dos Mercadores'
    },
    walkTouch: 'Toque no mapa para andar até lá, ou guie com o direcional',
    walkMouse: 'Clique no mapa para andar até lá, ou guie com WASD'
  },
  encounter: {
    kicker: 'Na estrada',
    title: {
      fight: 'Emboscada!',
      elite: 'Um campeão bloqueia o caminho!',
      chest: 'Um baú na grama!',
      merchant: 'Um mercador ambulante'
    },
    result: 'Na estrada, perto de {place}',
    gold: '+{n} de ouro',
    xp: '+{n} XP'
  },
  travel: {
    to: 'Viajando para',
    loading: 'Carregando'
  },
  attr: {
    str: {
      name: 'Força',
      short: 'FOR',
      desc: 'Poder corpo a corpo, chance de bloqueio, armadura pesada.'
    },
    dex: {
      name: 'Destreza',
      short: 'DES',
      desc: 'Acertos críticos, velocidade de ataque e de movimento.'
    },
    int: {
      name: 'Inteligência',
      short: 'INT',
      desc: 'Poder mágico, mana, resistência elemental.'
    },
    end: {
      name: 'Vigor',
      short: 'VIG',
      desc: 'Vida, regeneração, armadura, resistência a atordoamento.'
    },
    skl: {
      name: 'Técnica',
      short: 'TEC',
      desc: 'Dano crítico, recargas, armas à distância.'
    },
    cha: {
      name: 'Carisma',
      short: 'CAR',
      desc: 'Lacaios, preços de loja, recompensas, opções de diálogo.'
    }
  },
  stat: {
    damage: 'Dano',
    health: 'Vida',
    mana: 'Mana',
    armor: 'Armadura',
    resist: 'Resistência',
    crit: 'Chance de crítico',
    critDamage: 'Dano crítico',
    attackSpeed: 'Vel. de ataque',
    moveSpeed: 'Vel. de movimento',
    cdr: 'Red. de recarga',
    block: 'Bloqueio',
    dodge: 'Esquiva',
    hpRegen: 'Vida / s'
  },
  sheet: {
    points: '{n} pontos para gastar',
    raise: 'Aumentar {attr}',
    maxLevel: 'Nível máximo alcançado',
    next: 'Próximo ponto:'
  },
  heroChoice: {
    title: 'Escolha seu herói',
    boy: 'Jogar com o menino',
    girl: 'Jogar com a menina',
    switch: 'Seu herói'
  },
  skills: {
    active: 'Habilidades ativas',
    passive: 'Habilidades passivas',
    known: 'Aprendidas',
    none: 'Nada aprendido ainda. Procure um treinador em uma cidade.',
    emptySlot: 'Espaço vazio {n}',
    equip: 'Atribuir',
    remove: 'Remover',
    unmet: 'Você não cumpre mais os requisitos dela.',
    how: 'Toque em uma habilidade e depois em um espaço, ou arraste-a até lá. Arraste-a para fora de um espaço para removê-la.',
    howSlot: 'Agora toque em um espaço para colocá-la.',
    classCount: '{cls}: {n} de {total} aprendidas',
    hint: {
      met: 'Aprenda com {name} em {place}.',
      unmet: 'Um mestre em {place} ensina isto.'
    }
  },
  class: {
    // ── The prestige classes (afterplay phase 10) ──
    'demonhunter': { 'name': "Caçador de demônios", 'desc': "Sombra e luz sagrada, juradas a uma única presa. Marca demônios, e os marcados caem rápido." },
    'dragoon': { 'name': "Dragão", 'desc': "Vento sob as botas, um escudo no braço. Salta do céu e espeta fileiras inteiras." },
    'hexsmith': { 'name': "Ferreiro do feitiço", 'desc': "Arte do éter alimentada com sangue. Constrói torretas que drenam o inimigo para curar o ferreiro." },
    'tidecaller': { 'name': "Chamador das marés", 'desc': "Gelo e elementos, derramados no mar. Ondas que empurram e encharcam os inimigos." },
    aegis: {
      name: 'Cavaleiro da Égide',
      desc: 'Escudo e aço sagrado. Leva os golpes para que ninguém mais precise levar.'
    },
    shadow: {
      name: 'Lâmina Sombria',
      desc: 'Sai da escuridão, ataca pelas costas e some.'
    },
    pyro: {
      name: 'Piromante',
      desc: 'O fogo responde a todas as perguntas. Queime-os, depois exploda-os.'
    },
    sovereign: {
      name: 'Grão-Soberano',
      desc: 'Por que lutar sozinho? Invoque guardas e comande-os.'
    },
    chrono: {
      name: 'Tecelão do Tempo',
      desc: 'Para os inimigos no tempo, acelera os aliados e desfaz erros.'
    },
    blood: {
      name: 'Alquimista de Sangue',
      desc: 'Paga pelo poder com vida, depois a bebe de volta do inimigo.'
    },
    aether: {
      name: 'Éter-Tec',
      desc: 'Armas de fogo, torretas e um medidor de calor. Libere-o antes que ele trave você.'
    },
    geo: {
      name: 'Geomante',
      desc: 'Ergue muralhas e espinhos, e quebra o próprio chão.'
    },
    windrunner: {
      name: 'Corredor do Vento',
      desc: 'Um arco e o vento a seu favor. Atire, avance e não pare nunca.'
    },
    frostwarden: {
      name: 'Guardião do Gelo',
      desc: 'Uma lâmina de gelo e um coração frio. Deixe-os lentos, congele-os e depois despedace-os.'
    },
    lightbringer: {
      name: 'Portador da Luz',
      desc: 'Luz que cura amigos e cega inimigos. Fique nela e nada poderá deter você.'
    },
    beastcaller: {
      name: 'Domador de Feras',
      desc: 'Uma alcateia de lobos, um urso e um falcão lutam ao seu lado. Chame-os e comande-os.'
    },
    elementalist: {
      name: 'Elementalista',
      desc: 'Fogo, gelo, raio e pedra. Combine-os, e cada um dispara o próximo.'
    },
    soulwarden: {
      name: 'Guardião das Almas',
      desc: 'Inimigos derrotados se erguem como espíritos amigos, lutam ao seu lado e depois voltam para casa para descansar.'
    },
    ironmonk: {
      name: 'Monge de Ferro',
      desc: 'Mãos nuas, pés rápidos. Cada golpe acumula chi; gaste tudo em um único golpe poderoso.'
    },
    bard: {
      name: 'Bardo',
      desc: 'Canções que animam o seu lado e melodias que fazem o outro dormir ou se voltar contra si mesmo.'
    }
  },
  skill: {
    // ── The prestige classes (afterplay phase 10) ──
    'huntersMark': { 'name': "Marca do caçador", 'desc': "Um virote sagrado de {dmg}% de dano de Destreza. Por {dur} s o alvo sofre {vuln}% mais dano, um demônio {demon}% mais." },
    'demonsBane': { 'name': "Ruína demoníaca", 'desc': "+{bane}% de dano a demônios e {ward}% menos dano vindo deles." },
    'silverVolley': { 'name': "Rajada de prata", 'desc': "Virotes de prata em linha: {dmg}% de dano de Destreza, +{bane}% contra demônios e inimigos marcados." },
    'skyfallLeap': { 'name': "Queda celeste", 'desc': "Salte para fora de alcance por {air} s e caia no local: {dmg}% de dano de Força em {radius} m, inimigos derrubados." },
    'dragonBlood': { 'name': "Sangue de dragão", 'desc': "+{boss}% de dano a chefes, +{hp}% de vida máxima, e nada te empurra." },
    'dragonLance': { 'name': "Lança do dragão", 'desc': "Uma estocada de lança em linha: {dmg}% de dano de Destreza a cada inimigo nela." },
    'hexTurret': { 'name': "Torreta maldita", 'desc': "Construa uma torreta por {dur} s. A cada segundo ela drena o inimigo mais próximo em {radius} m por {dmg}% de dano de Técnica; você cura {drain}% disso." },
    'soulForge': { 'name': "Forja de almas", 'desc': "+{hp}% de vida máxima, {regen} de vida por segundo, e você sofre {reduce}% menos dano." },
    'hexBolt': { 'name': "Virote maldito", 'desc': "Pague {hp}% de vida: um virote de {dmg}% de dano de Técnica. Você cura {heal}% disso, e o inimigo causa {weak}% menos dano por {dur} s." },
    'tidalWave': { 'name': "Maremoto", 'desc': "Uma onda em linha: {dmg}% de dano de Inteligência, inimigos empurrados e encharcados ({slow}% de lentidão por {dur} s)." },
    'seaborn': { 'name': "Filho do mar", 'desc': "+{bonus}% de dano a inimigos gelados, {reduce}% menos dano sofrido, +{move}% de velocidade." },
    'undertow': { 'name': "Ressaca", 'desc': "Um redemoinho por {dur} s: {dmg}% de dano de Inteligência no total em {radius} m. Puxa os inimigos e os deixa {slow}% mais lentos." },
    'bastionWall': { 'name': "Muralha do Bastião", 'desc': "Por {dur} s, todo inimigo a {radius} m precisa atacar você, e você recebe {def}% menos. Depois a luz causa {dmg}% de Força +{back}% dos golpes recebidos." },
    'thousandCuts': { 'name': "Mil Cortes", 'desc': "Salte entre inimigos a {radius} m, golpeando {hits} vezes, cada golpe para {dmg}% de dano de Destreza. Um chefe só recebe um golpe. Nada atinge você enquanto corta." },
    'cinderSun': { 'name': "Sol de cinzas", 'desc': "Um sol moribundo se despedaça por {dur} s: {meteors} fragmentos em chamas, cada um causando {dmg}% de dano de Inteligência." },
    'royalLegion': { 'name': "Legião real", 'desc': "Chame a legião por {dur} s: {archers} arqueiros, {guards} guardas e {mages} magos de batalha." },
    'stoppedHour': { 'name': "Hora parada", 'desc': "Pare a hora num raio de {radius} m por {dur} s. Quando ela volta a correr, cada inimigo sofre {dmg}% de dano de Inteligência." },
    'redCovenant': { 'name': "Pacto vermelho", 'desc': "Tome {pct}% da vida de cada inimigo a {radius} m. Você cura {heal}% disso." },
    'orbitalLance': { 'name': "Lança orbital", 'desc': "Uma lança de luz do céu queima onde você mira: {dmg}% de dano de Perícia em {dur} s." },
    'tectonicHeart': { 'name': "Coração tectônico", 'desc': "O coração da terra se rompe: {dmg}% de dano de Força a tudo por perto, e escombros que deixam lento por {dur} s." },
    'eyeOfTheGale': { 'name': "Olho do vendaval", 'desc': "Uma tempestade de flechas por {dur} s: {dmg}% de dano de Perícia no total e {slow}% de lentidão." },
    'endlessWinter': { 'name': "Inverno sem fim", 'desc': "Um inverno sem fim irrompe de você: {dmg}% de dano de Inteligência num raio de {radius} m, congelando todos por {freeze} s." },
    'dawnbreak': { 'name': "Alvorada", 'desc': "Torne-se a aurora por {dur} s: a cada segundo, {dmg}% de dano de Inteligência num raio de {radius} m e cura de {heal}%." },
    'alphasCall': { 'name': "Chamado do alfa", 'desc': "{wolves} lobos respondem e correm com você por {dur} s. A matilha inteira causa +{dmg}% de dano e fica {move}% mais rápida." },
    'prismStorm': { 'name': "Tempestade prismática", 'desc': "Por {dur} s os quatro elementos rugem: {strikes} golpes de {dmg}% de Inteligência que se ativam entre si." },
    'ferryman': { 'name': "Barqueiro", 'desc': "Por {dur} s, todo inimigo que cai perto de você se ergue como seu espírito, e os espíritos causam {atk}% a mais." },
    'unmovingMountain': { 'name': "Montanha inabalável", 'desc': "Gaste todo o chi: uma montanha desaba para {dmg}% de dano de Destreza, +{per}% por chi, e derruba os inimigos." },
    'encore': { 'name': "Bis", 'desc': "Mais uma vez por {dur} s (+{buff}% de velocidade, dano, Defesa), e então o último acorde: {dmg}% de Carisma, inimigos encantados." },
    kind: {
      active: 'Ativa',
      passive: 'Passiva'
    },
    cooldown: 'Recarga: {n}s',
    mana: '{n} de mana',
    hpCost: '{n}% de vida',
    heat: '+{n} de calor',
    aimed: 'Arraste para mirar',
    shieldSlam: {
      name: 'Golpe de escudo',
      desc: 'Acerte o alvo com o escudo: {dmg}% de dano de Força e atordoamento por {stun}s.'
    },
    aegisAura: {
      name: 'Aura da Égide',
      desc: '+{armor}% de Armadura, e o dano físico recebido é reduzido em {reduce}%.'
    },
    radiantStrike: {
      name: 'Golpe radiante',
      desc: 'Um golpe sagrado de {dmg}% de dano de Força que cura você em {heal}% do dano causado.'
    },
    fortitude: {
      name: 'Fortitude',
      desc: 'Um golpe acima de {hit}% da sua vida concede um escudo de {shield}% dela por {dur}s. Uma vez a cada {icd}s.'
    },
    tauntingCry: {
      name: 'Grito provocador',
      desc: 'Inimigos a até {radius} m atacam você por {dur}s. Você ganha {def}% de Defesa enquanto isso.'
    },
    holyBastion: {
      name: 'Bastião sagrado',
      desc: 'Invulnerável por {dur}s. Quem ataca recebe de volta {reflect}% do próprio dano.'
    },
    shadowstep: {
      name: 'Passo sombrio',
      desc: 'Apareça atrás do alvo e apunhale-o pelas costas: {dmg}% de dano de Destreza.'
    },
    lethality: {
      name: 'Letalidade',
      desc: '+{crit}% de chance de Crítico e +{critDmg}% de dano Crítico.'
    },
    venomousBlade: {
      name: 'Lâmina venenosa',
      desc: 'Por {dur}s seus ataques envenenam: {poison}% da Destreza ao longo de {over}s, acumulando {stacks} vezes.'
    },
    evasion: {
      name: 'Evasão',
      desc: '+{dodge}% de Esquiva. Uma esquiva concede {haste}% de Celeridade por {dur}s.'
    },
    smokeBomb: {
      name: 'Bomba de fumaça',
      desc: 'Desapareça por {dur}s. Seu próximo ataque vindo do esconderijo causa +{bonus}% de dano.'
    },
    danceOfBlades: {
      name: 'Dança das lâminas',
      desc: 'Avance entre os inimigos a até {radius} m, golpeando {hits} vezes, cada golpe com {dmg}% de dano de Destreza. Um chefe só recebe um golpe. Nada atinge você enquanto dança.'
    },
    fireball: {
      name: 'Bola de fogo',
      desc: 'Uma bola de fogo que explode com {dmg}% de dano de Inteligência e queima mais {burn}% ao longo de {burnDur}s.'
    },
    cauterize: {
      name: 'Cauterizar',
      desc: 'Inimigos queimando causam {reduce}% menos dano a você.'
    },
    flamePillar: {
      name: 'Pilar de chamas',
      desc: 'Um pilar de fogo irrompe onde você mira: {dmg}% de dano de Inteligência ao longo de {dur}s. Os inimigos pegos nele são lançados ao ar.'
    },
    pyromaniac: {
      name: 'Piromaníaco',
      desc: 'Uma magia crítica tira {cut}s das suas recargas de fogo.'
    },
    combustion: {
      name: 'Combustão',
      desc: 'Detone todas as queimaduras a até {radius} m: cada uma causa de uma vez {pct}% do dano restante, como uma explosão.'
    },
    cataclysm: {
      name: 'Cataclismo',
      desc: 'Invoque {meteors} meteoros ao longo de {dur}s. Cada um cai com {dmg}% de dano de Inteligência.'
    },
    royalGuard: {
      name: 'Guarda real',
      desc: 'Invoque um guarda que luta ao seu lado, golpeando com {dmg}% de dano de Carisma. Até {max} ao mesmo tempo.'
    },
    inspiringPresence: {
      name: 'Presença inspiradora',
      desc: 'Seus lacaios atacam {speed}% mais rápido e têm {hp}% mais vida.'
    },
    commandFocus: {
      name: 'Ordem de investida',
      desc: 'Todos os lacaios investem contra o alvo: +{move}% de velocidade de movimento e +{atk}% de velocidade de ataque por {dur}s.'
    },
    sovereignsTribute: {
      name: 'Tributo do Soberano',
      desc: '{share}% do dano que você recebe é repassado aos seus lacaios.'
    },
    bannerOfVictory: {
      name: 'Estandarte da vitória',
      desc: 'Finque um estandarte por {dur}s. Aliados perto dele causam +{dmg}% de dano e regeneram {regen}% de vida por segundo.'
    },
    armyOfTheRealm: {
      name: 'Exército do reino',
      desc: 'Invoque {archers} arqueiros, {guards} guardas e um mago de batalha por {dur}s.'
    },
    temporalStasis: {
      name: 'Estase temporal',
      desc: 'Congele o alvo no tempo por {dur}s. Ele não pode agir nem ser ferido.'
    },
    hasteField: {
      name: 'Campo de celeridade',
      desc: 'Por {dur}s, você e os aliados próximos se movem {move}% mais rápido e atacam {speed}% mais rápido.'
    },
    timeDistort: {
      name: 'Distorção temporal',
      desc: '{share}% do dano que você recebe é atrasado e causado ao longo de {over}s.'
    },
    paradoxShift: {
      name: 'Salto paradoxal',
      desc: 'Troque de lugar com o alvo. Ele recebe {dmg}% de dano de Inteligência e os inimigos ao redor ficam confusos por {confuse}s.'
    },
    entropy: {
      name: 'Entropia',
      desc: 'Cada conjuração deixa suas recargas {cdr}% mais curtas, acumulando {stacks} vezes.'
    },
    chronoRewind: {
      name: 'Retrocesso crono',
      desc: 'Volte para onde você estava há {back}s, com a vida e o mana que tinha então.'
    },
    sanguineFlask: {
      name: 'Frasco sanguíneo',
      desc: 'Arremesse um frasco com seu próprio sangue: {dmg}% de dano de Vigor em área, e armadura quebrada em {shred}% por {shredDur}s.'
    },
    bloodTransmutation: {
      name: 'Transmutação de sangue',
      desc: '{share}% do dano físico que você recebe volta como mana.'
    },
    essenceHarvest: {
      name: 'Colheita de essência',
      desc: 'Drene todos os inimigos a até {radius} m: {dmg}% de dano de Inteligência. Você é curado em {heal}% desse dano.'
    },
    hemophilia: {
      name: 'Hemofilia',
      desc: 'O dreno de vida fica {drain}% mais forte. Acertar um inimigo sangrando cura {heal}% da sua vida.'
    },
    mutagenicRage: {
      name: 'Fúria mutagênica',
      desc: 'Por {dur}s: +{speed}% de velocidade de ataque, +{steal}% de roubo de vida e +{move}% de velocidade de movimento.'
    },
    philosophersCrucible: {
      name: 'Cadinho filosofal',
      desc: 'Uma poça de sangue fervente por {dur}s: {dmg}% de dano de Inteligência aos inimigos dentro dela, e ela cura você enquanto estiver nela.'
    },
    aetherPistol: {
      name: 'Pistola de éter',
      desc: 'Um tiro rápido de {dmg}% de dano de Técnica. Gera {heat} de calor.'
    },
    deployTurret: {
      name: 'Montar torreta',
      desc: 'Posicione uma torreta que atira com {dmg}% de dano de Técnica por {dur}s. Até {max} ao mesmo tempo.'
    },
    ventHeat: {
      name: 'Liberar calor',
      desc: 'Despeje todo o calor em um cone: até {dmg}% de dano de Técnica; quanto mais calor, mais dano.'
    },
    thermalOverload: {
      name: 'Sobrecarga térmica',
      desc: 'Enquanto superaquecido, seus tiros causam +{crit}% de dano Crítico. O superaquecimento ainda trava suas habilidades por {lock}s.'
    },
    orbitalBeam: {
      name: 'Raio orbital',
      desc: 'Um raio vindo do céu queima onde você mira: {dmg}% de dano de Técnica ao longo de {dur}s.'
    },
    exoSuit: {
      name: 'Exotraje',
      desc: 'Por {dur}s: +{armor}% de Armadura, e seus ataques viram foguetes que causam {rocket}% de dano de Técnica em área.'
    },
    stoneSpike: {
      name: 'Espinho de pedra',
      desc: 'Um espinho irrompe sob o alvo: {dmg}% de dano de Força e {slow}% de lentidão por {dur}s.'
    },
    earthBarrier: {
      name: 'Barreira de terra',
      desc: 'Erga uma muralha de rocha por {dur}s. Nada passa por ela, nem andando nem atirando.'
    },
    seismicShock: {
      name: 'Choque sísmico',
      desc: 'Golpeie o chão: {dmg}% de dano de Força em {radius} m, derrubando os inimigos por {down}s.'
    },
    earthenSkin: {
      name: 'Pele de terra',
      desc: 'Ganhe Armadura igual a {armor}% da sua Força. Atordoamentos em você duram {cut}% menos.'
    },
    petrify: {
      name: 'Petrificar',
      desc: 'Transforme o alvo em pedra por {dur}s. Ele recebe {vuln}% mais dano quando se liberta aos estilhaços.'
    },
    tectonicRupture: {
      name: 'Ruptura tectônica',
      desc: 'Rasgue o campo: {dmg}% de dano de Força em tudo que está perto, e escombros que deixam lento por {dur}s.'
    },
    scales: 'Escala com {attr}',
    shieldThrow: {
      name: 'Arremesso de escudo',
      desc: 'Seu escudo ricocheteia em {bounces} inimigos: {dmg}% de dano de Força em cada. Eles causam {weak}% menos por {dur}s.'
    },
    shieldShove: {
      name: 'Empurrão de escudo',
      desc: 'Empurre tudo à sua frente com {dmg}% de dano de Força. Eles voam para trás e param o que estavam fazendo.'
    },
    holyChains: {
      name: 'Correntes sagradas',
      desc: 'Correntes de luz puxam até você cada inimigo a até {radius} m: {dmg}% de dano de Vigor e lentidão de {slow}%.'
    },
    bulwark: {
      name: 'Baluarte',
      desc: '+{block}% de chance de Bloqueio. Cada bloqueio devolve {back} de dano ao atacante.'
    },
    retribution: {
      name: 'Retribuição',
      desc: 'Por {dur}s, inimigos a até {radius} m precisam atacar você. Depois a luz causa {dmg}% de Força +{back}% dos golpes recebidos.'
    },
    unbreakable: {
      name: 'Inquebrável',
      desc: 'Com menos de {hp}% de vida, você recebe {reduce}% menos dano.'
    },
    starFan: {
      name: 'Leque de estrelas',
      desc: 'Arremesse {stars} estrelas sombrias em leque, cada uma causando {dmg}% de dano de Destreza.'
    },
    grapplingHook: {
      name: 'Gancho',
      desc: 'Puxe o alvo até você com {dmg}% de dano de Destreza e deixe-o {slow}% mais lento por {dur}s. Inimigos grandes puxam você.'
    },
    silentStrike: {
      name: 'Golpe silencioso',
      desc: 'Ataques pelas costas causam +{backstab}% de dano, e os inimigos notam você {notice}% mais tarde.'
    },
    shadowMark: {
      name: 'Marca sombria',
      desc: 'O alvo recebe {vuln}% mais dano por {dur}s, e seu próximo golpe em qualquer um é crítico com +{bonus}%.'
    },
    bladeRhythm: {
      name: 'Ritmo das lâminas',
      desc: 'Acertos críticos tiram {cut}s de cada recarga. +{speed}% de velocidade de ataque.'
    },
    nightshadeMist: {
      name: 'Névoa de beladona',
      desc: 'Uma névoa venenosa por {dur}s: até {dmg}% de dano de Destreza. Inimigos pegos nela ficam confusos por {confuse}s.'
    },
    firecracker: {
      name: 'Rojão',
      desc: 'Grude um rojão no alvo. Após {delay}s ele estoura com {dmg}% de dano de Inteligência e queima tudo por perto.'
    },
    fanTheFlames: {
      name: 'Atiçar as chamas',
      desc: 'Cada queimadura a até {radius} m fica {pct}% mais forte e recomeça. Inimigos a até {push} m são arremessados para trás.'
    },
    ringOfFire: {
      name: 'Anel de fogo',
      desc: 'Um anel de chamas se ergue por {dur}s: até {dmg}% de dano de Inteligência. Inimigos dentro ficam {slow}% mais lentos.'
    },
    everflame: {
      name: 'Chama eterna',
      desc: 'Suas queimaduras ficam {burn}% mais fortes, e seus feitiços ganham +{crit}% de chance de Crítico.'
    },
    wildfire: {
      name: 'Incêndio',
      desc: 'Quando um inimigo em chamas é derrotado, o fogo dele salta para cada inimigo a até {radius} m por {dur}s.'
    },
    phoenixFlight: {
      name: 'Voo da fênix',
      desc: 'Voe como uma fênix deixando um rastro de fogo: {dmg}% de dano de Inteligência onde pousar. Cura {regen}% por segundo por {dur}s.'
    },
    callArchers: {
      name: 'Chamar arqueiros',
      desc: 'Invoque um arqueiro que atira atrás de você com {dmg}% de dano de Carisma. Até {max} ao mesmo tempo.'
    },
    royalRally: {
      name: 'Reunião real',
      desc: 'Seus lacaios correm para o seu lado e curam {heal}% da vida. Todos ganham +{def}% de Defesa por {dur}s.'
    },
    warMarshal: {
      name: 'Marechal de guerra',
      desc: 'Seus lacaios causam {dmg}% mais dano.'
    },
    royalDecree: {
      name: 'Decreto real',
      desc: 'Inimigos a até {radius} m precisam se curvar: atordoados por {stun}s, depois recebem {vuln}% mais dano por {dur}s.'
    },
    loyalHearts: {
      name: 'Corações leais',
      desc: 'Quando um dos seus lacaios cai, você cura {heal}% da sua vida.'
    },
    summonChampion: {
      name: 'Invocar campeão',
      desc: 'Chame o campeão do reino por {dur}s: um cavaleiro gigante com {hp}% da sua vida, golpeando com {dmg}% de Carisma.'
    },
    echoBolt: {
      name: 'Disparo de eco',
      desc: 'Um disparo de tempo com {dmg}% de dano de Inteligência. {delay}s depois ele acerta de novo com {echo}%.'
    },
    foresight: {
      name: 'Presciência',
      desc: 'Você vê os golpes chegando um instante antes: +{dodge}% de Esquiva e recargas {cdr}% mais curtas.'
    },
    timeBubble: {
      name: 'Bolha temporal',
      desc: 'Uma bolha de tempo lento por {dur}s: inimigos dentro se movem {slow}% mais devagar e recebem {dmg}% de dano de Inteligência.'
    },
    timeLoop: {
      name: 'Laço temporal',
      desc: 'Após {dur}s o alvo volta de repente para onde estava: {dmg}% de dano de Inteligência mais {echo}% do que perdeu.'
    },
    frozenMoment: {
      name: 'Instante congelado',
      desc: 'Seus ataques têm {chance}% de chance de congelar o inimigo no tempo por {dur}s.'
    },
    timeStop: {
      name: 'Parar o tempo',
      desc: 'Pare o tempo a até {radius} m por {dur}s. Quando ele volta, cada inimigo recebe {dmg}% de dano de Inteligência.'
    },
    essenceWard: {
      name: 'Escudo de essência',
      desc: 'Transforme {hp}% da sua vida em um escudo brilhante que vale {shield}% disso, por {dur}s.'
    },
    vitalReserve: {
      name: 'Reserva vital',
      desc: '+{hp}% de vida máxima, e você recupera {regen} de vida a cada segundo.'
    },
    enfeeblingTonic: {
      name: 'Tônico enfraquecedor',
      desc: 'Arremesse um tônico: {dmg}% de dano de Inteligência em área. Inimigos atingidos causam {weak}% menos dano por {dur}s.'
    },
    homunculus: {
      name: 'Homúnculo',
      desc: 'Prepare um ajudante borbulhante com {hp}% da sua vida por {dur}s. Preparar um novo devolve {back}% da vida dele.'
    },
    adrenalCatalyst: {
      name: 'Catalisador de adrenalina',
      desc: 'Quanto menos vida você tem, mais dano causa: até +{dmg}% com {low}% de vida ou menos.'
    },
    grandTransmutation: {
      name: 'Grande transmutação',
      desc: 'Transforme {pct}% da vida dos inimigos a até {radius} m em essência. Você cura {heal}% disso.'
    },
    rocketJump: {
      name: 'Salto-foguete',
      desc: 'Decole e pouse onde mirar: {dmg}% de dano de Técnica em {radius} m. Gera {heat} de calor.'
    },
    coolantLoop: {
      name: 'Circuito de resfriamento',
      desc: 'O calor cai {cool}% mais rápido, e suas habilidades geram {cut}% menos dele.'
    },
    shockGrenade: {
      name: 'Granada de choque',
      desc: 'Lance uma granada: {dmg}% de dano de Técnica e atordoamento de {stun}s em {radius} m. Gera {heat} de calor.'
    },
    precisionOptics: {
      name: 'Óptica de precisão',
      desc: '+{crit}% de chance de Crítico. Seus tiros atravessam {pierce} inimigo a mais.'
    },
    arcCoil: {
      name: 'Bobina de arco',
      desc: 'Um raio atinge o alvo e salta para mais {jumps} inimigos: {dmg}% de dano de Técnica em cada. Gera {heat} de calor.'
    },
    thermalPlating: {
      name: 'Blindagem térmica',
      desc: 'Enquanto seu calor estiver em {heat} ou mais, você recebe {reduce}% menos dano.'
    },
    boulderRoll: {
      name: 'Pedra rolante',
      desc: 'Role uma pedra gigante para a frente: {dmg}% de dano de Força a todos no caminho, derrubando-os por {down}s.'
    },
    bedrock: {
      name: 'Rocha firme',
      desc: 'Nada pode empurrar você, derrubar você ou jogar você no ar. +{hp}% de vida máxima.'
    },
    sinkhole: {
      name: 'Sumidouro',
      desc: 'O chão afunda, puxando os inimigos por {dur}s, e depois desaba: {dmg}% de dano de Força.'
    },
    mountainBreaker: {
      name: 'Quebra-montanhas',
      desc: '+{boss}% de dano contra chefes e +{armor}% de Armadura.'
    },
    geodeShell: {
      name: 'Casca de geodo',
      desc: 'Uma casca de cristal absorve {shield}% da sua vida por {dur}s e depois explode com até {dmg}% de dano de Força.'
    },
    crumble: {
      name: 'Esfarelar',
      desc: 'Você causa {dmg}% mais dano a inimigos lentos, derrubados ou transformados em pedra.'
    },
    galeArrow: {
      name: 'Flecha do vendaval',
      desc: 'Uma flecha levada por uma rajada: {dmg}% de dano de Destreza, e o alvo é empurrado para trás.'
    },
    fleetfoot: {
      name: 'Pés ligeiros',
      desc: '+{move}% de velocidade de movimento e +{dodge}% de Esquiva.'
    },
    zephyrDash: {
      name: 'Disparada do zéfiro',
      desc: 'Avance até {dist} m para onde mirar e depois corra {move}% mais rápido por {dur}s.'
    },
    piercingGale: {
      name: 'Vendaval perfurante',
      desc: 'Uma flecha que atravessa todos os inimigos em linha: {dmg}% de dano de Destreza e {slow}% de lentidão por {dur}s.'
    },
    cycloneSnare: {
      name: 'Laço do ciclone',
      desc: 'Um redemoinho por {dur}s puxa os inimigos para o seu olho e causa {dmg}% de dano de Técnica.'
    },
    keenEye: {
      name: 'Olho certeiro',
      desc: '+{critDmg}% de Dano crítico. Seus tiros atravessam mais {pierce} inimigo.'
    },
    updraftLeap: {
      name: 'Salto da corrente',
      desc: 'Uma rajada joga os inimigos a até {radius} m para o ar com {dmg}% de dano de Destreza. Você salta {leap} m para longe.'
    },
    swiftDraw: {
      name: 'Saque veloz',
      desc: 'Você ataca {speed}% mais rápido e suas recargas são {cdr}% mais curtas.'
    },
    arrowStorm: {
      name: 'Tempestade de flechas',
      desc: 'Chovem flechas na área por {dur}s: {dmg}% de dano de Técnica no total e {slow}% de lentidão.'
    },
    galeSpirits: {
      name: 'Espíritos do vento',
      desc: 'Espíritos do vento voam com você por {dur}s e disparam {shots} flechas de {dmg}% de dano de Técnica. +{move}% de velocidade de movimento.'
    },
    skyHunter: {
      name: 'Caçador do céu',
      desc: '+{boss}% de dano contra chefes e +{crit}% de Chance de crítico.'
    },
    skyrender: {
      name: 'Rasga-céus',
      desc: 'Uma flecha de tempestade abre caminho: {dmg}% de dano de Destreza a todos na linha, jogados para cima e para o lado.'
    },
    frostCleave: {
      name: 'Talho gélido',
      desc: 'Gire sua lâmina de gelo à sua frente: {dmg}% de dano de Força e {slow}% de lentidão por {dur}s.'
    },
    rimeLance: {
      name: 'Lança de geada',
      desc: 'Arremesse uma lança de gelo com {dmg}% de dano de Inteligência. Ela deixa lento em {slow}% por {dur}s.'
    },
    wintersBite: {
      name: 'Mordida do inverno',
      desc: 'Seus ataques deixam o inimigo {slow}% mais lento por {dur}s.'
    },
    frostArmor: {
      name: 'Armadura de gelo',
      desc: 'Uma armadura de gelo absorve {shield}% de Inteligência em dano por {dur}s. Inimigos perto de você ficam {slow}% mais lentos.'
    },
    glacialCharge: {
      name: 'Investida glacial',
      desc: 'Avance contra o alvo com {dmg}% de dano de Força e congele-o por {freeze}s.'
    },
    frozenHeart: {
      name: 'Coração gelado',
      desc: '+{hp}% de vida máxima, e todo dano que você recebe é reduzido em {reduce}%.'
    },
    rimeField: {
      name: 'Campo de geada',
      desc: 'Chão congelante por {dur}s: {dmg}% de dano de Inteligência. Inimigos lentos nele congelam por {freeze}s.'
    },
    frostShatter: {
      name: 'Estilhaço gélido',
      desc: '{dmg}% de dano de Força a até {radius} m: +{chilled}% contra inimigos lentos, +{frozen}% contra congelados.'
    },
    shatterpoint: {
      name: 'Ponto de ruptura',
      desc: 'Você causa {bonus}% mais dano a inimigos lentos e congelados.'
    },
    avalancheLeap: {
      name: 'Salto avalanche',
      desc: 'Salte para onde mirar e caia como uma avalanche: {dmg}% de dano de Força, derrubando os inimigos.'
    },
    iceborn: {
      name: 'Nascido do gelo',
      desc: 'Nada empurra nem arremessa você. Atordoamentos em você duram {cut}% menos.'
    },
    absoluteZero: {
      name: 'Zero absoluto',
      desc: 'O inverno explode de você: {dmg}% de dano de Inteligência a até {radius} m, congelando todos por {freeze}s.'
    },
    sunbolt: {
      name: 'Raio solar',
      desc: 'Um raio de sol com {dmg}% de dano de Inteligência. O alvo ofuscado causa {weaken}% menos por {dur}s.'
    },
    mendingLight: {
      name: 'Luz curativa',
      desc: 'Cure {heal}% de Carisma de uma vez e depois {regen}% da sua vida por segundo por {dur}s.'
    },
    kindledHope: {
      name: 'Esperança acesa',
      desc: 'Toda cura que você recebe é {heal}% mais forte.'
    },
    lanceOfLight: {
      name: 'Lança de luz',
      desc: 'Um feixe de luz: {dmg}% de dano de Inteligência em linha. Cure {heal}% de vida por inimigo atingido.'
    },
    dawnShield: {
      name: 'Escudo da aurora',
      desc: 'Remova todos os efeitos ruins em você e ganhe um escudo de {shield}% de Carisma por {dur}s.'
    },
    haloWard: {
      name: 'Halo protetor',
      desc: 'Todo dano que você recebe é reduzido em {reduce}%.'
    },
    dawnSanctuary: {
      name: 'Santuário da aurora',
      desc: 'Chão sagrado por {dur}s: cura você em {heal}% de Carisma por segundo, e os inimigos recebem {dmg}% de Inteligência.'
    },
    blindingFlash: {
      name: 'Clarão cegante',
      desc: 'Um clarão de luz: inimigos a até {radius} m fogem por {fear}s e causam {weaken}% menos por {dur}s.'
    },
    guardianLight: {
      name: 'Luz guardiã',
      desc: 'Um golpe que derrotaria você deixa você com 1 de vida, intocável por {dur}s. Uma vez a cada {icd}s.'
    },
    sunfall: {
      name: 'Queda do sol',
      desc: 'Um pilar de sol cai sobre o alvo: {dmg}% de dano de Inteligência. Os inimigos recebem {vuln}% mais por {dur}s.'
    },
    searingLight: {
      name: 'Luz abrasadora',
      desc: '+{crit}% de Chance de crítico com magias e +{critDmg}% de Dano crítico.'
    },
    haloOfDawn: {
      name: 'Halo da aurora',
      desc: 'Brilhe por {dur}s: a cada segundo, {dmg}% de dano de Inteligência a até {radius} m e cure {heal}% de vida.'
    },
    callWolf: {
      name: 'Chamar lobo',
      desc: 'Um lobo espiritual se junta a você e morde com {dmg}% de dano de Carisma. Até {max} ao mesmo tempo.'
    },
    wolfPounce: {
      name: 'Bote do lobo',
      desc: 'Seus lobos pulam no alvo: {dmg}% de dano de Carisma cada, derrubando-o por {down}s.'
    },
    wildKinship: {
      name: 'Laço selvagem',
      desc: 'Seus companheiros têm {hp}% mais vida e causam {dmg}% mais dano.'
    },
    callHawk: {
      name: 'Chamar falcão',
      desc: 'Um falcão mergulha no alvo com {dmg}% de dano de Carisma: ele recebe {vuln}% mais por {dur}s. Fica {life}s.'
    },
    callBear: {
      name: 'Chamar urso',
      desc: 'Um urso espiritual se junta a você. Ele causa {dmg}% de dano e mantém os inimigos ocupados. Até {max}.'
    },
    thickHide: {
      name: 'Couro grosso',
      desc: '+{hp}% de vida máxima e +{regen} de regeneração de vida por segundo.'
    },
    packBond: {
      name: 'Laço da matilha',
      desc: 'Você e os companheiros a até {radius} m regeneram {regen}% de vida por segundo e ganham {def}% de Defesa por {dur}s.'
    },
    spiritStampede: {
      name: 'Estouro espiritual',
      desc: 'Uma manada de feras espirituais avança: {dmg}% de dano de Carisma em linha, derrubando os inimigos.'
    },
    packTactics: {
      name: 'Tática da matilha',
      desc: 'Você causa {bonus}% mais dano para cada companheiro com você, até {max}.'
    },
    alphaHowl: {
      name: 'Uivo alfa',
      desc: 'Seus companheiros curam {heal}% e lutam {rage}% mais forte por {dur}s. Inimigos perto de você fogem.'
    },
    leaderOfThePack: {
      name: 'Líder da matilha',
      desc: 'Seus companheiros atacam {speed}% mais rápido e causam {dmg}% mais dano.'
    },
    wildHunt: {
      name: 'Caçada selvagem',
      desc: 'Mais {wolves} lobos correm com você por {dur}s. A matilha toda causa +{dmg}% de dano e se move {move}% mais rápido.'
    },
    prismBolt: {
      name: 'Raio prismático',
      desc: 'Um raio com {dmg}% de dano de Inteligência: gelo se o alvo queima, senão fogo. Um ativa o outro.'
    },
    elementalHarmony: {
      name: 'Harmonia elemental',
      desc: 'Suas reações (Derretimento, Vapor, Estilhaço, Sobrecarga, Cristal) são {pct}% mais fortes.'
    },
    frostLance: {
      name: 'Lança de gelo',
      desc: 'Gelo em linha: {dmg}% de dano de Inteligência e {slow}% de lentidão por {dur}s. Inimigos queimando viram Vapor.'
    },
    chainSpark: {
      name: 'Faísca em cadeia',
      desc: 'Um raio de {dmg}% de Inteligência que salta para mais {jumps} inimigos. Estilhaça o gelo, sobrecarrega o fogo.'
    },
    smolderingCore: {
      name: 'Núcleo em brasa',
      desc: 'Suas queimaduras causam {burn}% mais dano, e você tem {mana} de mana a mais.'
    },
    rollingBoulder: {
      name: 'Pedra rolante',
      desc: 'Uma pedra rola: {dmg}% de dano de Inteligência, derrubada de {down}s. Inimigos marcados dão um escudo a você.'
    },
    thunderSnow: {
      name: 'Nevasca trovejante',
      desc: 'Uma nevasca por {dur}s: {dmg}% de dano de gelo de Inteligência, e um raio a cada segundo de {bolt}%.'
    },
    spellweave: {
      name: 'Tecer magias',
      desc: '+{crit}% de Chance de crítico com magias, e suas habilidades custam {mana}% menos mana.'
    },
    prismaticNova: {
      name: 'Nova prismática',
      desc: 'Atinge tudo a até {radius} m com {dmg}% de Inteligência, cada um com o elemento ao qual reage.'
    },
    prismaticWard: {
      name: 'Guarda prismática',
      desc: 'Você recebe {reduce}% menos dano e tem {hp}% mais vida.'
    },
    frostfireComet: {
      name: 'Cometa de fogo e gelo',
      desc: 'Um cometa de fogo e gelo: {dmg}% de dano de Inteligência. Os inimigos ficam queimando e lentos.'
    },
    elementalConvergence: {
      name: 'Convergência elemental',
      desc: 'Por {dur}s quatro elementos se revezam: {strikes} golpes de {dmg}% de Inteligência que ativam uns aos outros.'
    },
    wispBolt: {
      name: 'Raio de fogo-fátuo',
      desc: 'Um fogo-fátuo com {dmg}% de dano de Inteligência. Um inimigo que ele derrota volta como seu espírito por {life}s.'
    },
    kindredSpirits: {
      name: 'Espíritos afins',
      desc: 'Seus espíritos e lacaios têm {hp}% mais vida e atacam {speed}% mais rápido.'
    },
    callTheFallen: {
      name: 'Chamar os caídos',
      desc: 'Até {max} inimigos que acabaram de cair a até {radius} m voltam como seus espíritos por {life}s.'
    },
    soulBond: {
      name: 'Laço de almas',
      desc: 'Faça amizade com um inimigo: {chance}% ({low}% se ferido) de virar seu espírito por {life}s. Senão, {dmg}% de dano.'
    },
    restlessSouls: {
      name: 'Almas inquietas',
      desc: 'Um inimigo que você derrota tem {chance}% de chance de voltar como seu espírito por {life}s.'
    },
    spiritLantern: {
      name: 'Lanterna espiritual',
      desc: 'Uma lanterna por {dur}s: inimigos na luz recebem {dmg}% de Inteligência, amigos se curam, os caídos voltam.'
    },
    hauntingWail: {
      name: 'Lamento assombrado',
      desc: 'Um BUU fantasmagórico: {dmg}% de dano de Inteligência a até {radius} m, e os inimigos fogem por {fear}s.'
    },
    wardensVigil: {
      name: 'Vigília do guardião',
      desc: 'Seus espíritos e lacaios causam {dmg}% mais dano, e você recebe {reduce}% menos.'
    },
    releaseSouls: {
      name: 'Libertar almas',
      desc: 'Seus espíritos voltam para casa em explosões de luz: {dmg}% de Inteligência em volta de cada um, {heal}% de vida para você por cada.'
    },
    lanternKeeper: {
      name: 'Guardião da lanterna',
      desc: 'Recargas {cdr}% mais curtas, e suas habilidades custam {mana}% menos mana.'
    },
    wispSwarm: {
      name: 'Enxame de fogos-fátuos',
      desc: '{wisps} fogos-fátuos mergulham nos inimigos da área com {dmg}% de Inteligência no total. Quem eles derrotam volta.'
    },
    processionOfSouls: {
      name: 'Procissão de almas',
      desc: 'Por {dur}s todo inimigo que cai perto de você volta como seu espírito, e os espíritos causam {atk}% mais.'
    },
    palmStrike: {
      name: 'Golpe de palma',
      desc: 'Uma palma rápida com {dmg}% de dano de Destreza que empurra o inimigo para trás. Gera {chi} de chi.'
    },
    ironBody: {
      name: 'Corpo de ferro',
      desc: 'O dano físico recebido é reduzido em {reduce}%, e você tem {hp}% mais vida.'
    },
    flyingKick: {
      name: 'Chute voador',
      desc: 'Voe até o alvo e chute com {dmg}% de dano de Destreza; inimigos no caminho recebem {path}%. Gera {chi} de chi.'
    },
    tigerStance: {
      name: 'Postura do tigre',
      desc: 'Por {dur}s: +{dmg}% de dano e +{speed}% de velocidade de ataque. Encerra a Postura da garça.'
    },
    craneStance: {
      name: 'Postura da garça',
      desc: 'Por {dur}s: +{def}% de Defesa, e você cura {regen}% da sua vida por segundo. Encerra a Postura do tigre.'
    },
    flowingFists: {
      name: 'Punhos fluidos',
      desc: 'Seus ataques têm {chance}% de chance de gerar chi.'
    },
    hundredFists: {
      name: 'Cem punhos',
      desc: 'Uma rajada de {hits} golpes com {dmg}% de dano de Destreza no total. Gera {chi} de chi.'
    },
    risingDragon: {
      name: 'Dragão ascendente',
      desc: 'Gaste todo o chi num gancho: {dmg}% de dano de Destreza, +{per}% por chi. O inimigo voa para o alto.'
    },
    cranesGrace: {
      name: 'Graça da garça',
      desc: '+{dodge}% de Esquiva, e atordoamentos e derrubadas em você duram {cut}% menos.'
    },
    whirlwindKick: {
      name: 'Chute redemoinho',
      desc: 'Chute tudo a até {radius} m duas vezes com {dmg}% de dano de Destreza no total. Gera até {chi} de chi.'
    },
    tigersFury: {
      name: 'Fúria do tigre',
      desc: '+{crit}% de Chance de crítico e +{speed}% de velocidade de ataque.'
    },
    mountainPalm: {
      name: 'Palma da montanha',
      desc: 'Gaste todo o chi: uma palma gigante cai com {dmg}% de dano de Destreza, +{per}% por chi, e derruba os inimigos.'
    },
    sharpNote: {
      name: 'Nota aguda',
      desc: 'Uma nota aguda com {dmg}% de dano de Carisma. O inimigo causa {weaken}% menos dano por {dur}s.'
    },
    stagePresence: {
      name: 'Presença de palco',
      desc: 'Suas habilidades custam {mana}% menos mana, e você se move {move}% mais rápido.'
    },
    marchingSong: {
      name: 'Canção de marcha',
      desc: 'Uma canção por {dur}s: você e aliados a até {radius} m se movem {move}% e atacam {speed}% mais rápido.'
    },
    lullaby: {
      name: 'Canção de ninar',
      desc: 'Uma melodia suave em cone: todo inimigo que ela alcança adormece por {dur}s.'
    },
    longRefrain: {
      name: 'Refrão longo',
      desc: 'Suas canções duram {pct}% mais.'
    },
    balladOfValor: {
      name: 'Balada do valor',
      desc: 'Uma canção por {dur}s: você e aliados a até {radius} m causam {dmg}% mais dano e ganham {def}% de Defesa.'
    },
    charmingSerenade: {
      name: 'Serenata encantadora',
      desc: 'Encante o alvo e os inimigos a até {radius} m: por {dur}s eles lutam entre si.'
    },
    virtuoso: {
      name: 'Virtuose',
      desc: 'Recargas {cdr}% mais curtas e +{critDmg}% de Dano crítico.'
    },
    hymnOfMending: {
      name: 'Hino da cura',
      desc: 'Remove efeitos ruins, depois por {dur}s você e aliados a até {radius} m curam {regen}% de vida por segundo.'
    },
    crescendo: {
      name: 'Crescendo',
      desc: 'Uma explosão de som a até {radius} m: {dmg}% de dano de Carisma, +{per}% por cada canção que você toca.'
    },
    standingOvation: {
      name: 'Aplausos de pé',
      desc: '+{dmg}% de dano, e você recebe {reduce}% menos dano.'
    },
    grandFinale: {
      name: 'Grande final',
      desc: 'Toque tudo por {dur}s (+{buff}% de velocidade, dano, Defesa), e um último acorde: {dmg}% de Carisma, inimigos encantados.'
    }
  },
  slot: {
    main: 'Mão principal',
    off: 'Mão secundária',
    head: 'Cabeça',
    body: 'Armadura',
    hands: 'Mãos',
    feet: 'Pés',
    trinket: 'Berloque'
  },
  tier: {
    '7': 'Mítico',
    '1': 'Comum',
    '2': 'Incomum',
    '3': 'Raro',
    '4': 'Épico',
    '5': 'Heroico',
    '6': 'Lendário'
  },
  weapon: {
    melee: 'Corpo a corpo · escala com {attr}',
    ranged: 'À distância · escala com {attr}',
    magic: 'Magia · escala com {attr}'
  },
  source: {
    'siege': "Conquistado no Cerco do Passo do Bastião.",
    'infernal': "Um gêmeo infernal: cai em {zone} invadido, ou é forjado por um ferreiro.",
    arena: 'Conquistado no Coliseu.',
    smith: 'Forjado em uma ferraria.',
    mob: '{zone}: cai dos monstros.',
    chest: '{zone}: encontrado nos baús.',
    boss: '{zone}: cai do chefe.',
    secret: '{zone}: escondido em um baú secreto.'
  },
  mod: {
    'demonBane': "+{n}% de dano contra demônios",
    'demonLeech': "{n}% do dano causado a demônios cura você",
    'beastBane': "+{n}% de dano contra bestas míticas",
    'fireWard': "{n}% menos dano de fogo recebido",
    'shadowWard': "{n}% menos dano sombrio recebido",
    'demonWard': "{n}% menos dano de demônios",
    'pylonBreaker': "+{n}% de dano contra pilares demoníacos",
    'glassFinder': "{n}% de chance de um demônio abatido deixar vidro demoníaco extra",
    'waterWalk': "A água não deixa você mais lento",
    str: '+{n} de Força',
    dex: '+{n} de Destreza',
    int: '+{n} de Inteligência',
    end: '+{n} de Vigor',
    skl: '+{n} de Técnica',
    cha: '+{n} de Carisma',
    allAttrs: '+{n} em todos os atributos',
    strOrDex: '+{n} de Força ou Destreza, o que for maior',
    armor: '{n} de Armadura',
    armorPct: '+{n}% de Armadura',
    armorFromStr: 'Armadura vinda da Força: +{n}%',
    block: '+{n}% de chance de Bloqueio',
    dodge: '+{n}% de Esquiva',
    damageReduction: '+{n}% de redução de dano',
    physReduction: '{n}% menos dano físico recebido',
    maxHp: '+{n} de Vida máxima',
    maxHpPct: '+{n}% de Vida máxima',
    maxMana: '+{n} de Mana máximo',
    hpRegen: '+{n} de Vida por segundo',
    stunDurationCut: 'Atordoamentos em você duram {n}% menos',
    damagePct: '+{n}% de dano causado',
    critChance: '+{n}% de chance de Crítico',
    critDamage: '+{n}% de dano Crítico',
    spellCrit: '+{n}% de chance de Crítico com magias',
    attackSpeed: '+{n}% de velocidade de ataque',
    moveSpeed: '+{n}% de velocidade de movimento',
    cdr: 'As recargas ficam {n}% mais curtas',
    manaDiscount: 'Magias custam {n}% menos mana',
    lifesteal: '+{n}% de roubo de vida em todo dano',
    physLifesteal: '+{n}% de roubo de vida em golpes físicos',
    lifeDrainPct: 'O dreno de vida fica {n}% mais forte',
    bossDamage: '+{n}% de dano contra chefes',
    backstab: '+{n}% de dano pelas costas',
    minionDamage: 'Lacaios causam +{n}% de dano',
    minionAttackSpeed: 'Lacaios atacam {n}% mais rápido',
    minionHp: 'Lacaios têm +{n}% de vida',
    burnOnHit: 'Ataques aplicam uma Queimadura de {n} de dano',
    freezeOnHit: 'Ataques têm {n}% de chance de congelar',
    pierce: 'Os tiros atravessam mais {n} inimigos',
    critCooldown: 'Acertos críticos cortam {n}s de todas as recargas',
    extraBlastEvery: 'Um disparo extra de energia a cada {n} tiros',
    reflectOnBlock: 'Um bloqueio reflete {n} de dano',
    fatalSave: 'Dano fatal, em vez de matar, deixa você invulnerável por {n}s (uma vez a cada 120s)',
    knockbackImmune: 'Imune a empurrão',
    heatBuildCut: 'O calor sobe {n}% mais devagar',
    heatDissipation: 'O calor baixa {n}% mais rápido',
    flaskDamage: 'Frasco sanguíneo causa +{n}% de dano',
    igniteBonus: 'Magias de fogo queimam {n}% mais forte',
    stealthy: 'Anda em silêncio: os inimigos notam você de {n}% menos longe',
    fortitude: 'Golpes fortes concedem um escudo de {n}% da vida',
    evasionHaste: 'Uma esquiva concede {n}% de Celeridade',
    cauterize: 'Inimigos queimando causam {n}% menos dano a você',
    pyromaniac: 'Magias críticas cortam {n}s das recargas de fogo',
    tribute: 'Os lacaios recebem {n}% do seu dano',
    timeDistort: '{n}% do dano recebido é atrasado',
    entropy: 'Conjurar encurta as recargas em {n}%',
    bloodToMana: '{n}% do dano físico recebido volta como mana',
    bleedHeal: 'Acertar um inimigo sangrando cura {n}% de vida',
    overheatCrit: '+{n}% de dano Crítico enquanto superaquecido',
    lowHealthDamage: 'Até +{n}% de dano conforme sua vida cai',
    heatArmor: '{n}% menos dano recebido enquanto o calor estiver na metade ou mais',
    crumble: '+{n}% de dano contra inimigos lentos, derrubados ou petrificados',
    lastStand: '{n}% menos dano recebido abaixo de 30% de vida',
    wildfire: 'Um inimigo em chamas que cai incendeia inimigos a até {n} m',
    loyalty: 'Um lacaio caído cura você em {n}% de vida',
    chillOnHit: 'Golpes básicos deixam lento em {n}% por 2 s',
    chillDamage: '+{n}% de dano contra inimigos lentos ou congelados',
    healPower: 'A cura que você recebe é {n}% mais forte',
    packDamage: '+{n}% de dano para cada companheiro vivo (até 4)',
    reactionDamage: 'Reações elementais são {n}% mais fortes',
    soulRise: 'Inimigos derrotados têm {n}% de chance de se erguer como seu espírito',
    chiOnHit: 'Ataques têm {n}% de chance de gerar chi',
    songLength: 'As canções duram {n}% mais'
  },
  item: {
    'chimeraMane': { 'name': "Juba de quimera" },
    'triFang': { 'name': "Tripla Presa" },
    'warchiefsLongbowGun': { 'name': "Arco-arma do chefe guerreiro" },
    'hoofbreakerGreaves': { 'name': "Grevas quebra-cascos" },
    'eyeOfTheDeep': { 'name': "Olho das profundezas" },
    'beamSplitter': { 'name': "Parte-raios" },
    'riddleCrown': { 'name': "Coroa do enigma" },
    'sandglassWand': { 'name': "Varinha da ampulheta" },
    'leviathanScale': { 'name': "Escama de leviatã" },
    'tidecallerStaff': { 'name': "Cajado do chamador das marés" },
    'hydraScaleGauntlets': { 'name': "Manoplas de escamas de hidra" },
    'manyHeadedFlail': { 'name': "Mangual de muitas cabeças" },
    'heartOfTheElderDragon': { 'name': "Coração do Dragão Ancestral" },
    'dragonboneGreatsword': { 'name': "Montante de osso de dragão" },
    'bastionBanner': { 'name': "Estandarte do Bastião" },
    'wallwardensPlate': { 'name': "Couraça do guarda-muralhas" },
    'gatebreaker': { 'name': "Quebra-portões" },
    'crownOfTheLastBastion': { 'name': "Coroa do último Bastião" },
    heartOfTheArena: {
      name: 'Coração da Arena'
    },
    mantleOfTheUndefeated: {
      name: 'Couraça do Invicto'
    },
    crimsonBulwark: {
      name: 'Baluarte Carmesim'
    },
    sandstriderGreaves: {
      name: 'Grevas do Andarilho das Areias'
    },
    gripsOfTheGladiator: {
      name: 'Manoplas do Gladiador'
    },
    laurelOfTheVictor: {
      name: 'Louro do Vencedor'
    },
    smithMasterMithrilGreaves: {
      name: 'Grevas de mithril magistrais'
    },
    smithMasterAdamantGreaves: {
      name: 'Grevas de adamantita magistrais'
    },
    smithMasterAetheriteGreaves: {
      name: 'Grevas de eterita magistrais'
    },
    smithMithrilGreaves: {
      name: 'Grevas de mithril'
    },
    smithAdamantGreaves: {
      name: 'Grevas de adamantita'
    },
    smithAetheriteGreaves: {
      name: 'Grevas de eterita'
    },
    smithMasterMithrilPlate: {
      name: 'Couraça de mithril magistral'
    },
    smithMasterAdamantPlate: {
      name: 'Couraça de adamantita magistral'
    },
    smithMasterAetheritePlate: {
      name: 'Couraça de eterita magistral'
    },
    smithMithrilPlate: {
      name: 'Couraça de mithril'
    },
    smithAdamantPlate: {
      name: 'Couraça de adamantita'
    },
    smithAetheritePlate: {
      name: 'Couraça de eterita'
    },
    smithMasterMithrilHelm: {
      name: 'Elmo de mithril magistral'
    },
    smithMasterAdamantHelm: {
      name: 'Elmo de adamantita magistral'
    },
    smithMasterAetheriteHelm: {
      name: 'Elmo de eterita magistral'
    },
    smithMithrilHelm: {
      name: 'Elmo de mithril'
    },
    smithAdamantHelm: {
      name: 'Elmo de adamantita'
    },
    smithAetheriteHelm: {
      name: 'Elmo de eterita'
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
      name: 'Martelo de mithril magistral'
    },
    smithMasterAdamantHammer: {
      name: 'Martelo de adamantita magistral'
    },
    smithMasterAetheriteHammer: {
      name: 'Martelo de eterita magistral'
    },
    smithMithrilHammer: {
      name: 'Martelo de mithril'
    },
    smithAdamantHammer: {
      name: 'Martelo de adamantita'
    },
    smithAetheriteHammer: {
      name: 'Martelo de eterita'
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
      name: 'Grevas de ouro magistrais'
    },
    smithGoldGreaves: {
      name: 'Grevas de ouro'
    },
    smithMasterGoldPlate: {
      name: 'Couraça de ouro magistral'
    },
    smithGoldPlate: {
      name: 'Couraça de ouro'
    },
    smithMasterGoldHelm: {
      name: 'Elmo de ouro magistral'
    },
    smithGoldHelm: {
      name: 'Elmo de ouro'
    },
    smithMasterGoldShield: {
      name: 'Escudo de ouro magistral'
    },
    smithGoldShield: {
      name: 'Escudo de ouro'
    },
    smithMasterGoldHammer: {
      name: 'Martelo de ouro magistral'
    },
    smithGoldHammer: {
      name: 'Martelo de ouro'
    },
    smithMasterGoldSword: {
      name: 'Espada de ouro magistral'
    },
    smithGoldSword: {
      name: 'Espada de ouro'
    },
    smithMasterSilverGreaves: {
      name: 'Grevas de prata magistrais'
    },
    smithSilverGreaves: {
      name: 'Grevas de prata'
    },
    smithMasterSilverPlate: {
      name: 'Couraça de prata magistral'
    },
    smithSilverPlate: {
      name: 'Couraça de prata'
    },
    smithMasterSilverHelm: {
      name: 'Elmo de prata magistral'
    },
    smithSilverHelm: {
      name: 'Elmo de prata'
    },
    smithMasterSilverShield: {
      name: 'Escudo de prata magistral'
    },
    smithSilverShield: {
      name: 'Escudo de prata'
    },
    smithMasterSilverHammer: {
      name: 'Martelo de prata magistral'
    },
    smithSilverHammer: {
      name: 'Martelo de prata'
    },
    smithMasterSilverSword: {
      name: 'Espada de prata magistral'
    },
    smithSilverSword: {
      name: 'Espada de prata'
    },
    smithMasterIronGreaves: {
      name: 'Grevas de ferro magistrais'
    },
    smithIronGreaves: {
      name: 'Grevas de ferro'
    },
    smithMasterIronPlate: {
      name: 'Couraça de ferro magistral'
    },
    smithIronPlate: {
      name: 'Couraça de ferro'
    },
    smithMasterIronHelm: {
      name: 'Elmo de ferro magistral'
    },
    smithIronHelm: {
      name: 'Elmo de ferro'
    },
    smithMasterIronShield: {
      name: 'Escudo de ferro magistral'
    },
    smithIronShield: {
      name: 'Escudo de ferro'
    },
    smithMasterIronHammer: {
      name: 'Martelo de ferro magistral'
    },
    smithIronHammer: {
      name: 'Martelo de ferro'
    },
    smithMasterIronSword: {
      name: 'Espada de ferro magistral'
    },
    smithMasterDexIronSword: {
      name: 'Adaga de ferro magistral · DES'
    },
    smithDexIronSword: {
      name: 'Adaga de ferro · DES'
    },
    smithMasterDexIronHammer: {
      name: 'Florete de ferro magistral · DES'
    },
    smithDexIronHammer: {
      name: 'Florete de ferro · DES'
    },
    smithMasterDexIronShield: {
      name: 'Broquel de ferro magistral · DES'
    },
    smithDexIronShield: {
      name: 'Broquel de ferro · DES'
    },
    smithMasterDexIronHelm: {
      name: 'Capuz de ferro magistral · DES'
    },
    smithDexIronHelm: {
      name: 'Capuz de ferro · DES'
    },
    smithMasterDexIronPlate: {
      name: 'Gibão de ferro magistral · DES'
    },
    smithDexIronPlate: {
      name: 'Gibão de ferro · DES'
    },
    smithMasterDexIronGreaves: {
      name: 'Botas de ferro magistral · DES'
    },
    smithDexIronGreaves: {
      name: 'Botas de ferro · DES'
    },
    smithMasterDexSilverSword: {
      name: 'Adaga de prata magistral · DES'
    },
    smithDexSilverSword: {
      name: 'Adaga de prata · DES'
    },
    smithMasterDexSilverHammer: {
      name: 'Florete de prata magistral · DES'
    },
    smithDexSilverHammer: {
      name: 'Florete de prata · DES'
    },
    smithMasterDexSilverShield: {
      name: 'Broquel de prata magistral · DES'
    },
    smithDexSilverShield: {
      name: 'Broquel de prata · DES'
    },
    smithMasterDexSilverHelm: {
      name: 'Capuz de prata magistral · DES'
    },
    smithDexSilverHelm: {
      name: 'Capuz de prata · DES'
    },
    smithMasterDexSilverPlate: {
      name: 'Gibão de prata magistral · DES'
    },
    smithDexSilverPlate: {
      name: 'Gibão de prata · DES'
    },
    smithMasterDexSilverGreaves: {
      name: 'Botas de prata magistral · DES'
    },
    smithDexSilverGreaves: {
      name: 'Botas de prata · DES'
    },
    smithMasterDexGoldSword: {
      name: 'Adaga de ouro magistral · DES'
    },
    smithDexGoldSword: {
      name: 'Adaga de ouro · DES'
    },
    smithMasterDexGoldHammer: {
      name: 'Florete de ouro magistral · DES'
    },
    smithDexGoldHammer: {
      name: 'Florete de ouro · DES'
    },
    smithMasterDexGoldShield: {
      name: 'Broquel de ouro magistral · DES'
    },
    smithDexGoldShield: {
      name: 'Broquel de ouro · DES'
    },
    smithMasterDexGoldHelm: {
      name: 'Capuz de ouro magistral · DES'
    },
    smithDexGoldHelm: {
      name: 'Capuz de ouro · DES'
    },
    smithMasterDexGoldPlate: {
      name: 'Gibão de ouro magistral · DES'
    },
    smithDexGoldPlate: {
      name: 'Gibão de ouro · DES'
    },
    smithMasterDexGoldGreaves: {
      name: 'Botas de ouro magistral · DES'
    },
    smithDexGoldGreaves: {
      name: 'Botas de ouro · DES'
    },
    smithMasterDexMithrilSword: {
      name: 'Adaga de mithril magistral · DES'
    },
    smithMasterDexAdamantSword: {
      name: 'Adaga de adamantita magistral · DES'
    },
    smithMasterDexAetheriteSword: {
      name: 'Adaga de eterita magistral · DES'
    },
    smithDexMithrilSword: {
      name: 'Adaga de mithril · DES'
    },
    smithDexAdamantSword: {
      name: 'Adaga de adamantita · DES'
    },
    smithDexAetheriteSword: {
      name: 'Adaga de eterita · DES'
    },
    smithMasterDexMithrilHammer: {
      name: 'Florete de mithril magistral · DES'
    },
    smithMasterDexAdamantHammer: {
      name: 'Florete de adamantita magistral · DES'
    },
    smithMasterDexAetheriteHammer: {
      name: 'Florete de eterita magistral · DES'
    },
    smithDexMithrilHammer: {
      name: 'Florete de mithril · DES'
    },
    smithDexAdamantHammer: {
      name: 'Florete de adamantita · DES'
    },
    smithDexAetheriteHammer: {
      name: 'Florete de eterita · DES'
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
      name: 'Capuz de mithril magistral · DES'
    },
    smithMasterDexAdamantHelm: {
      name: 'Capuz de adamantita magistral · DES'
    },
    smithMasterDexAetheriteHelm: {
      name: 'Capuz de eterita magistral · DES'
    },
    smithDexMithrilHelm: {
      name: 'Capuz de mithril · DES'
    },
    smithDexAdamantHelm: {
      name: 'Capuz de adamantita · DES'
    },
    smithDexAetheriteHelm: {
      name: 'Capuz de eterita · DES'
    },
    smithMasterDexMithrilPlate: {
      name: 'Gibão de mithril magistral · DES'
    },
    smithMasterDexAdamantPlate: {
      name: 'Gibão de adamantita magistral · DES'
    },
    smithMasterDexAetheritePlate: {
      name: 'Gibão de eterita magistral · DES'
    },
    smithDexMithrilPlate: {
      name: 'Gibão de mithril · DES'
    },
    smithDexAdamantPlate: {
      name: 'Gibão de adamantita · DES'
    },
    smithDexAetheritePlate: {
      name: 'Gibão de eterita · DES'
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
      name: 'Varinha de ferro magistral · INT'
    },
    smithIntIronSword: {
      name: 'Varinha de ferro · INT'
    },
    smithMasterIntIronHammer: {
      name: 'Cajado de ferro magistral · INT'
    },
    smithIntIronHammer: {
      name: 'Cajado de ferro · INT'
    },
    smithMasterIntIronShield: {
      name: 'Tomo de ferro magistral · INT'
    },
    smithIntIronShield: {
      name: 'Tomo de ferro · INT'
    },
    smithMasterIntIronHelm: {
      name: 'Diadema de ferro magistral · INT'
    },
    smithIntIronHelm: {
      name: 'Diadema de ferro · INT'
    },
    smithMasterIntIronPlate: {
      name: 'Manto de ferro magistral · INT'
    },
    smithIntIronPlate: {
      name: 'Manto de ferro · INT'
    },
    smithMasterIntIronGreaves: {
      name: 'Botas de ferro magistral · INT'
    },
    smithIntIronGreaves: {
      name: 'Botas de ferro · INT'
    },
    smithMasterIntSilverSword: {
      name: 'Varinha de prata magistral · INT'
    },
    smithIntSilverSword: {
      name: 'Varinha de prata · INT'
    },
    smithMasterIntSilverHammer: {
      name: 'Cajado de prata magistral · INT'
    },
    smithIntSilverHammer: {
      name: 'Cajado de prata · INT'
    },
    smithMasterIntSilverShield: {
      name: 'Tomo de prata magistral · INT'
    },
    smithIntSilverShield: {
      name: 'Tomo de prata · INT'
    },
    smithMasterIntSilverHelm: {
      name: 'Diadema de prata magistral · INT'
    },
    smithIntSilverHelm: {
      name: 'Diadema de prata · INT'
    },
    smithMasterIntSilverPlate: {
      name: 'Manto de prata magistral · INT'
    },
    smithIntSilverPlate: {
      name: 'Manto de prata · INT'
    },
    smithMasterIntSilverGreaves: {
      name: 'Botas de prata magistral · INT'
    },
    smithIntSilverGreaves: {
      name: 'Botas de prata · INT'
    },
    smithMasterIntGoldSword: {
      name: 'Varinha de ouro magistral · INT'
    },
    smithIntGoldSword: {
      name: 'Varinha de ouro · INT'
    },
    smithMasterIntGoldHammer: {
      name: 'Cajado de ouro magistral · INT'
    },
    smithIntGoldHammer: {
      name: 'Cajado de ouro · INT'
    },
    smithMasterIntGoldShield: {
      name: 'Tomo de ouro magistral · INT'
    },
    smithIntGoldShield: {
      name: 'Tomo de ouro · INT'
    },
    smithMasterIntGoldHelm: {
      name: 'Diadema de ouro magistral · INT'
    },
    smithIntGoldHelm: {
      name: 'Diadema de ouro · INT'
    },
    smithMasterIntGoldPlate: {
      name: 'Manto de ouro magistral · INT'
    },
    smithIntGoldPlate: {
      name: 'Manto de ouro · INT'
    },
    smithMasterIntGoldGreaves: {
      name: 'Botas de ouro magistral · INT'
    },
    smithIntGoldGreaves: {
      name: 'Botas de ouro · INT'
    },
    smithMasterIntMithrilSword: {
      name: 'Varinha de mithril magistral · INT'
    },
    smithMasterIntAdamantSword: {
      name: 'Varinha de adamantita magistral · INT'
    },
    smithMasterIntAetheriteSword: {
      name: 'Varinha de eterita magistral · INT'
    },
    smithIntMithrilSword: {
      name: 'Varinha de mithril · INT'
    },
    smithIntAdamantSword: {
      name: 'Varinha de adamantita · INT'
    },
    smithIntAetheriteSword: {
      name: 'Varinha de eterita · INT'
    },
    smithMasterIntMithrilHammer: {
      name: 'Cajado de mithril magistral · INT'
    },
    smithMasterIntAdamantHammer: {
      name: 'Cajado de adamantita magistral · INT'
    },
    smithMasterIntAetheriteHammer: {
      name: 'Cajado de eterita magistral · INT'
    },
    smithIntMithrilHammer: {
      name: 'Cajado de mithril · INT'
    },
    smithIntAdamantHammer: {
      name: 'Cajado de adamantita · INT'
    },
    smithIntAetheriteHammer: {
      name: 'Cajado de eterita · INT'
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
      name: 'Manto de mithril magistral · INT'
    },
    smithMasterIntAdamantPlate: {
      name: 'Manto de adamantita magistral · INT'
    },
    smithMasterIntAetheritePlate: {
      name: 'Manto de eterita magistral · INT'
    },
    smithIntMithrilPlate: {
      name: 'Manto de mithril · INT'
    },
    smithIntAdamantPlate: {
      name: 'Manto de adamantita · INT'
    },
    smithIntAetheritePlate: {
      name: 'Manto de eterita · INT'
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
      name: 'Pistola de ferro magistral · TEC'
    },
    smithSklIronSword: {
      name: 'Pistola de ferro · TEC'
    },
    smithMasterSklIronHammer: {
      name: 'Rifle de ferro magistral · TEC'
    },
    smithSklIronHammer: {
      name: 'Rifle de ferro · TEC'
    },
    smithMasterSklIronShield: {
      name: 'Bateria de ferro magistral · TEC'
    },
    smithSklIronShield: {
      name: 'Bateria de ferro · TEC'
    },
    smithMasterSklIronHelm: {
      name: 'Boné de ferro magistral · TEC'
    },
    smithSklIronHelm: {
      name: 'Boné de ferro · TEC'
    },
    smithMasterSklIronPlate: {
      name: 'Arnês de ferro magistral · TEC'
    },
    smithSklIronPlate: {
      name: 'Arnês de ferro · TEC'
    },
    smithMasterSklIronGreaves: {
      name: 'Botas de ferro magistral · TEC'
    },
    smithSklIronGreaves: {
      name: 'Botas de ferro · TEC'
    },
    smithMasterSklSilverSword: {
      name: 'Pistola de prata magistral · TEC'
    },
    smithSklSilverSword: {
      name: 'Pistola de prata · TEC'
    },
    smithMasterSklSilverHammer: {
      name: 'Rifle de prata magistral · TEC'
    },
    smithSklSilverHammer: {
      name: 'Rifle de prata · TEC'
    },
    smithMasterSklSilverShield: {
      name: 'Bateria de prata magistral · TEC'
    },
    smithSklSilverShield: {
      name: 'Bateria de prata · TEC'
    },
    smithMasterSklSilverHelm: {
      name: 'Boné de prata magistral · TEC'
    },
    smithSklSilverHelm: {
      name: 'Boné de prata · TEC'
    },
    smithMasterSklSilverPlate: {
      name: 'Arnês de prata magistral · TEC'
    },
    smithSklSilverPlate: {
      name: 'Arnês de prata · TEC'
    },
    smithMasterSklSilverGreaves: {
      name: 'Botas de prata magistral · TEC'
    },
    smithSklSilverGreaves: {
      name: 'Botas de prata · TEC'
    },
    smithMasterSklGoldSword: {
      name: 'Pistola de ouro magistral · TEC'
    },
    smithSklGoldSword: {
      name: 'Pistola de ouro · TEC'
    },
    smithMasterSklGoldHammer: {
      name: 'Rifle de ouro magistral · TEC'
    },
    smithSklGoldHammer: {
      name: 'Rifle de ouro · TEC'
    },
    smithMasterSklGoldShield: {
      name: 'Bateria de ouro magistral · TEC'
    },
    smithSklGoldShield: {
      name: 'Bateria de ouro · TEC'
    },
    smithMasterSklGoldHelm: {
      name: 'Boné de ouro magistral · TEC'
    },
    smithSklGoldHelm: {
      name: 'Boné de ouro · TEC'
    },
    smithMasterSklGoldPlate: {
      name: 'Arnês de ouro magistral · TEC'
    },
    smithSklGoldPlate: {
      name: 'Arnês de ouro · TEC'
    },
    smithMasterSklGoldGreaves: {
      name: 'Botas de ouro magistral · TEC'
    },
    smithSklGoldGreaves: {
      name: 'Botas de ouro · TEC'
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
      name: 'Bateria de mithril magistral · TEC'
    },
    smithMasterSklAdamantShield: {
      name: 'Bateria de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteShield: {
      name: 'Bateria de eterita magistral · TEC'
    },
    smithSklMithrilShield: {
      name: 'Bateria de mithril · TEC'
    },
    smithSklAdamantShield: {
      name: 'Bateria de adamantita · TEC'
    },
    smithSklAetheriteShield: {
      name: 'Bateria de eterita · TEC'
    },
    smithMasterSklMithrilHelm: {
      name: 'Boné de mithril magistral · TEC'
    },
    smithMasterSklAdamantHelm: {
      name: 'Boné de adamantita magistral · TEC'
    },
    smithMasterSklAetheriteHelm: {
      name: 'Boné de eterita magistral · TEC'
    },
    smithSklMithrilHelm: {
      name: 'Boné de mithril · TEC'
    },
    smithSklAdamantHelm: {
      name: 'Boné de adamantita · TEC'
    },
    smithSklAetheriteHelm: {
      name: 'Boné de eterita · TEC'
    },
    smithMasterSklMithrilPlate: {
      name: 'Arnês de mithril magistral · TEC'
    },
    smithMasterSklAdamantPlate: {
      name: 'Arnês de adamantita magistral · TEC'
    },
    smithMasterSklAetheritePlate: {
      name: 'Arnês de eterita magistral · TEC'
    },
    smithSklMithrilPlate: {
      name: 'Arnês de mithril · TEC'
    },
    smithSklAdamantPlate: {
      name: 'Arnês de adamantita · TEC'
    },
    smithSklAetheritePlate: {
      name: 'Arnês de eterita · TEC'
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
      name: 'Cetro de ferro magistral · CAR'
    },
    smithChaIronSword: {
      name: 'Cetro de ferro · CAR'
    },
    smithMasterChaIronHammer: {
      name: 'Estandarte de ferro magistral · CAR'
    },
    smithChaIronHammer: {
      name: 'Estandarte de ferro · CAR'
    },
    smithMasterChaIronShield: {
      name: 'Códice de ferro magistral · CAR'
    },
    smithChaIronShield: {
      name: 'Códice de ferro · CAR'
    },
    smithMasterChaIronHelm: {
      name: 'Coroa de ferro magistral · CAR'
    },
    smithChaIronHelm: {
      name: 'Coroa de ferro · CAR'
    },
    smithMasterChaIronPlate: {
      name: 'Tabardo de ferro magistral · CAR'
    },
    smithChaIronPlate: {
      name: 'Tabardo de ferro · CAR'
    },
    smithMasterChaIronGreaves: {
      name: 'Botas de ferro magistral · CAR'
    },
    smithChaIronGreaves: {
      name: 'Botas de ferro · CAR'
    },
    smithMasterChaSilverSword: {
      name: 'Cetro de prata magistral · CAR'
    },
    smithChaSilverSword: {
      name: 'Cetro de prata · CAR'
    },
    smithMasterChaSilverHammer: {
      name: 'Estandarte de prata magistral · CAR'
    },
    smithChaSilverHammer: {
      name: 'Estandarte de prata · CAR'
    },
    smithMasterChaSilverShield: {
      name: 'Códice de prata magistral · CAR'
    },
    smithChaSilverShield: {
      name: 'Códice de prata · CAR'
    },
    smithMasterChaSilverHelm: {
      name: 'Coroa de prata magistral · CAR'
    },
    smithChaSilverHelm: {
      name: 'Coroa de prata · CAR'
    },
    smithMasterChaSilverPlate: {
      name: 'Tabardo de prata magistral · CAR'
    },
    smithChaSilverPlate: {
      name: 'Tabardo de prata · CAR'
    },
    smithMasterChaSilverGreaves: {
      name: 'Botas de prata magistral · CAR'
    },
    smithChaSilverGreaves: {
      name: 'Botas de prata · CAR'
    },
    smithMasterChaGoldSword: {
      name: 'Cetro de ouro magistral · CAR'
    },
    smithChaGoldSword: {
      name: 'Cetro de ouro · CAR'
    },
    smithMasterChaGoldHammer: {
      name: 'Estandarte de ouro magistral · CAR'
    },
    smithChaGoldHammer: {
      name: 'Estandarte de ouro · CAR'
    },
    smithMasterChaGoldShield: {
      name: 'Códice de ouro magistral · CAR'
    },
    smithChaGoldShield: {
      name: 'Códice de ouro · CAR'
    },
    smithMasterChaGoldHelm: {
      name: 'Coroa de ouro magistral · CAR'
    },
    smithChaGoldHelm: {
      name: 'Coroa de ouro · CAR'
    },
    smithMasterChaGoldPlate: {
      name: 'Tabardo de ouro magistral · CAR'
    },
    smithChaGoldPlate: {
      name: 'Tabardo de ouro · CAR'
    },
    smithMasterChaGoldGreaves: {
      name: 'Botas de ouro magistral · CAR'
    },
    smithChaGoldGreaves: {
      name: 'Botas de ouro · CAR'
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
      name: 'Coroa de mithril magistral · CAR'
    },
    smithMasterChaAdamantHelm: {
      name: 'Coroa de adamantita magistral · CAR'
    },
    smithMasterChaAetheriteHelm: {
      name: 'Coroa de eterita magistral · CAR'
    },
    smithChaMithrilHelm: {
      name: 'Coroa de mithril · CAR'
    },
    smithChaAdamantHelm: {
      name: 'Coroa de adamantita · CAR'
    },
    smithChaAetheriteHelm: {
      name: 'Coroa de eterita · CAR'
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
      name: 'Maça de ferro magistral · VIG'
    },
    smithEndIronSword: {
      name: 'Maça de ferro · VIG'
    },
    smithMasterEndIronHammer: {
      name: 'Machado de ferro magistral · VIG'
    },
    smithEndIronHammer: {
      name: 'Machado de ferro · VIG'
    },
    smithMasterEndIronShield: {
      name: 'Escudo de ferro magistral · VIG'
    },
    smithEndIronShield: {
      name: 'Escudo de ferro · VIG'
    },
    smithMasterEndIronHelm: {
      name: 'Elmo de ferro magistral · VIG'
    },
    smithEndIronHelm: {
      name: 'Elmo de ferro · VIG'
    },
    smithMasterEndIronPlate: {
      name: 'Couraça de ferro magistral · VIG'
    },
    smithEndIronPlate: {
      name: 'Couraça de ferro · VIG'
    },
    smithMasterEndIronGreaves: {
      name: 'Grevas de ferro magistrais · VIG'
    },
    smithEndIronGreaves: {
      name: 'Grevas de ferro · VIG'
    },
    smithMasterEndSilverSword: {
      name: 'Maça de prata magistral · VIG'
    },
    smithEndSilverSword: {
      name: 'Maça de prata · VIG'
    },
    smithMasterEndSilverHammer: {
      name: 'Machado de prata magistral · VIG'
    },
    smithEndSilverHammer: {
      name: 'Machado de prata · VIG'
    },
    smithMasterEndSilverShield: {
      name: 'Escudo de prata magistral · VIG'
    },
    smithEndSilverShield: {
      name: 'Escudo de prata · VIG'
    },
    smithMasterEndSilverHelm: {
      name: 'Elmo de prata magistral · VIG'
    },
    smithEndSilverHelm: {
      name: 'Elmo de prata · VIG'
    },
    smithMasterEndSilverPlate: {
      name: 'Couraça de prata magistral · VIG'
    },
    smithEndSilverPlate: {
      name: 'Couraça de prata · VIG'
    },
    smithMasterEndSilverGreaves: {
      name: 'Grevas de prata magistrais · VIG'
    },
    smithEndSilverGreaves: {
      name: 'Grevas de prata · VIG'
    },
    smithMasterEndGoldSword: {
      name: 'Maça de ouro magistral · VIG'
    },
    smithEndGoldSword: {
      name: 'Maça de ouro · VIG'
    },
    smithMasterEndGoldHammer: {
      name: 'Machado de ouro magistral · VIG'
    },
    smithEndGoldHammer: {
      name: 'Machado de ouro · VIG'
    },
    smithMasterEndGoldShield: {
      name: 'Escudo de ouro magistral · VIG'
    },
    smithEndGoldShield: {
      name: 'Escudo de ouro · VIG'
    },
    smithMasterEndGoldHelm: {
      name: 'Elmo de ouro magistral · VIG'
    },
    smithEndGoldHelm: {
      name: 'Elmo de ouro · VIG'
    },
    smithMasterEndGoldPlate: {
      name: 'Couraça de ouro magistral · VIG'
    },
    smithEndGoldPlate: {
      name: 'Couraça de ouro · VIG'
    },
    smithMasterEndGoldGreaves: {
      name: 'Grevas de ouro magistrais · VIG'
    },
    smithEndGoldGreaves: {
      name: 'Grevas de ouro · VIG'
    },
    smithMasterEndMithrilSword: {
      name: 'Maça de mithril magistral · VIG'
    },
    smithMasterEndAdamantSword: {
      name: 'Maça de adamantita magistral · VIG'
    },
    smithMasterEndAetheriteSword: {
      name: 'Maça de eterita magistral · VIG'
    },
    smithEndMithrilSword: {
      name: 'Maça de mithril · VIG'
    },
    smithEndAdamantSword: {
      name: 'Maça de adamantita · VIG'
    },
    smithEndAetheriteSword: {
      name: 'Maça de eterita · VIG'
    },
    smithMasterEndMithrilHammer: {
      name: 'Machado de mithril magistral · VIG'
    },
    smithMasterEndAdamantHammer: {
      name: 'Machado de adamantita magistral · VIG'
    },
    smithMasterEndAetheriteHammer: {
      name: 'Machado de eterita magistral · VIG'
    },
    smithEndMithrilHammer: {
      name: 'Machado de mithril · VIG'
    },
    smithEndAdamantHammer: {
      name: 'Machado de adamantita · VIG'
    },
    smithEndAetheriteHammer: {
      name: 'Machado de eterita · VIG'
    },
    smithMasterEndMithrilShield: {
      name: 'Escudo de mithril magistral · VIG'
    },
    smithMasterEndAdamantShield: {
      name: 'Escudo de adamantita magistral · VIG'
    },
    smithMasterEndAetheriteShield: {
      name: 'Escudo de eterita magistral · VIG'
    },
    smithEndMithrilShield: {
      name: 'Escudo de mithril · VIG'
    },
    smithEndAdamantShield: {
      name: 'Escudo de adamantita · VIG'
    },
    smithEndAetheriteShield: {
      name: 'Escudo de eterita · VIG'
    },
    smithMasterEndMithrilHelm: {
      name: 'Elmo de mithril magistral · VIG'
    },
    smithMasterEndAdamantHelm: {
      name: 'Elmo de adamantita magistral · VIG'
    },
    smithMasterEndAetheriteHelm: {
      name: 'Elmo de eterita magistral · VIG'
    },
    smithEndMithrilHelm: {
      name: 'Elmo de mithril · VIG'
    },
    smithEndAdamantHelm: {
      name: 'Elmo de adamantita · VIG'
    },
    smithEndAetheriteHelm: {
      name: 'Elmo de eterita · VIG'
    },
    smithMasterEndMithrilPlate: {
      name: 'Couraça de mithril magistral · VIG'
    },
    smithMasterEndAdamantPlate: {
      name: 'Couraça de adamantita magistral · VIG'
    },
    smithMasterEndAetheritePlate: {
      name: 'Couraça de eterita magistral · VIG'
    },
    smithEndMithrilPlate: {
      name: 'Couraça de mithril · VIG'
    },
    smithEndAdamantPlate: {
      name: 'Couraça de adamantita · VIG'
    },
    smithEndAetheritePlate: {
      name: 'Couraça de eterita · VIG'
    },
    smithMasterEndMithrilGreaves: {
      name: 'Grevas de mithril magistrais · VIG'
    },
    smithMasterEndAdamantGreaves: {
      name: 'Grevas de adamantita magistrais · VIG'
    },
    smithMasterEndAetheriteGreaves: {
      name: 'Grevas de eterita magistrais · VIG'
    },
    smithEndMithrilGreaves: {
      name: 'Grevas de mithril · VIG'
    },
    smithEndAdamantGreaves: {
      name: 'Grevas de adamantita · VIG'
    },
    smithEndAetheriteGreaves: {
      name: 'Grevas de eterita · VIG'
    },
    smithIronSword: {
      name: 'Espada de ferro'
    },
    rustedShortsword: {
      name: 'Espada curta enferrujada'
    },
    apprenticeStaff: {
      name: 'Cajado de aprendiz'
    },
    scoutsHandgun: {
      name: 'Pistola de batedor'
    },
    ironBroadsword: {
      name: 'Espada larga de ferro'
    },
    vipinsStiletto: {
      name: 'Estilete de Vipin'
    },
    aetherCarbine: {
      name: 'Carabina de éter'
    },
    ashenGreatsword: {
      name: 'Montante de cinzas'
    },
    archmageWand: {
      name: 'Varinha de arquimago'
    },
    chronoBlade: {
      name: 'Lâmina crono'
    },
    bloodForgedAxe: {
      name: 'Machado forjado em sangue'
    },
    voidCannon: {
      name: 'Canhão do Vazio'
    },
    dragonSmasher: {
      name: 'Esmaga-dragões'
    },
    bladeOfTheUnbound: {
      name: 'Lâmina do Indomável'
    },
    aetheriumDestroyer: {
      name: 'Destruidor de etério'
    },
    woodenBuckler: {
      name: 'Broquel de madeira'
    },
    tomeOfNovices: {
      name: 'Tomo dos noviços'
    },
    ironShield: {
      name: 'Escudo de ferro'
    },
    syringeOfTheAdept: {
      name: 'Seringa do adepto'
    },
    aethericBattery: {
      name: 'Bateria etérea'
    },
    aegisTowerShield: {
      name: 'Escudo-torre da Égide'
    },
    orbOfEternalFlame: {
      name: 'Orbe da chama eterna'
    },
    shieldOfTheFallen: {
      name: 'Escudo dos Caídos'
    },
    paddedTunic: {
      name: 'Túnica acolchoada'
    },
    leatherDoublet: {
      name: 'Gibão de couro'
    },
    chainmailVest: {
      name: 'Colete de malha'
    },
    scholarsRobe: {
      name: 'Manto de erudito'
    },
    reinforcedPlate: {
      name: 'Placas reforçadas'
    },
    assassinsGarb: {
      name: 'Traje de assassino'
    },
    chronoWeaverCloak: {
      name: 'Capa do Tecelão do Tempo'
    },
    bloodSoakedPlate: {
      name: 'Placas encharcadas de sangue'
    },
    exoArmorChassis: {
      name: 'Chassi de exoarmadura'
    },
    dragonscaleHauberk: {
      name: 'Cota de escamas de dragão'
    },
    vestmentsOfSovereign: {
      name: 'Vestes do Soberano'
    },
    armorOfTheTitan: {
      name: 'Armadura do Titã'
    },
    quiltedCap: {
      name: 'Gorro Acolchoado'
    },
    stalkersHood: {
      name: 'Capuz do Espreitador'
    },
    ironcladHelm: {
      name: 'Elmo Revestido de Ferro'
    },
    seersCirclet: {
      name: 'Diadema do Vidente'
    },
    wyrmguardGreathelm: {
      name: 'Grande Elmo Guarda-Serpente'
    },
    hatOfTheStarweaver: {
      name: 'Chapéu do Tecelão de Estrelas'
    },
    hideGloves: {
      name: 'Luvas de Couro'
    },
    ironGauntlets: {
      name: 'Manoplas de Ferro'
    },
    emberweaveGloves: {
      name: 'Luvas de Trama de Brasa'
    },
    duelistsGrips: {
      name: 'Punhos do Duelista'
    },
    voidforgedGauntlets: {
      name: 'Manoplas Forjadas no Vazio'
    },
    gripsOfTheTempest: {
      name: 'Garras da Tempestade'
    },
    trailBoots: {
      name: 'Botas de Trilha'
    },
    pathfindersBoots: {
      name: 'Botas do Desbravador'
    },
    forgeplateGreaves: {
      name: 'Grevas de Forja'
    },
    mistwalkerBoots: {
      name: 'Botas do Andarilho da Névoa'
    },
    stormstrideGreaves: {
      name: 'Grevas do Passo da Tormenta'
    },
    treadsOfTheHorizon: {
      name: 'Passos do Horizonte'
    },
    copperBand: {
      name: 'Aro de cobre'
    },
    ringOfMending: {
      name: 'Anel da cura'
    },
    bandOfSwiftness: {
      name: 'Aro da rapidez'
    },
    castersEmblem: {
      name: 'Emblema do conjurador'
    },
    infiltratorsCharm: {
      name: 'Amuleto do infiltrador'
    },
    timekeepersHourglass: {
      name: 'Ampulheta do Guardião do tempo'
    },
    ringOfTheVampyre: {
      name: 'Anel do Vampiro'
    },
    sovereignsSignet: {
      name: 'Sinete do Soberano'
    },
    heraldsPin: {
      name: 'Broche do arauto'
    },
    hymnalOfTheRoad: {
      name: 'Hinário da estrada'
    },
    shepherdsCrook: {
      name: 'Cajado do pastor'
    },
    minstrelsHat: {
      name: 'Chapéu do menestrel'
    },
    pilgrimsSandals: {
      name: 'Sandálias do peregrino'
    },
    falconersGloves: {
      name: 'Luvas do falcoeiro'
    },
    bellOfTheHerd: {
      name: 'Sino do rebanho'
    },
    bannerOfTheHost: {
      name: 'Estandarte da hoste'
    },
    heraldsTabard: {
      name: 'Tabardo do arauto'
    },
    codexOfOaths: {
      name: 'Códice dos juramentos'
    },
    crownOfTheRightfulKing: {
      name: 'Coroa do rei legítimo'
    },
    scepterOfTheFirstKing: {
      name: 'Cetro do primeiro rei'
    },
    pickpocketsKnife: {
      name: 'Faca do batedor de carteiras'
    },
    serpentsFang: {
      name: 'Presa de serpente'
    },
    phantomRapier: {
      name: 'Rapieira fantasma'
    },
    fangOfTheWindless: {
      name: 'Presa do Sem-Vento'
    },
    roguesBuckler: {
      name: 'Broquel do patife'
    },
    venomVial: {
      name: 'Frasco de veneno'
    },
    swiftguardBuckler: {
      name: 'Broquel da guarda veloz'
    },
    nightshadeFlask: {
      name: 'Frasco de beladona'
    },
    windveilTarge: {
      name: 'Targa do véu de vento'
    },
    shadowdancersBuckler: {
      name: 'Broquel do dançarino das sombras'
    },
    scoutsBandana: {
      name: 'Bandana de batedor'
    },
    nightcowl: {
      name: 'Capuz noturno'
    },
    shadowveilHood: {
      name: 'Capuz do véu das sombras'
    },
    windrunnersCap: {
      name: 'Boné do corredor do vento'
    },
    maskOfTheSilentWind: {
      name: 'Máscara do vento silencioso'
    },
    rangersJerkin: {
      name: 'Gibão de patrulheiro'
    },
    nightstalkerLeathers: {
      name: 'Couros do espreitador noturno'
    },
    windridersHarness: {
      name: 'Arreio do cavaleiro do vento'
    },
    mantleOfTheShadowDancer: {
      name: 'Manto do dançarino das sombras'
    },
    thiefsGloves: {
      name: 'Luvas de ladrão'
    },
    cutpurseGloves: {
      name: 'Luvas de gatuno'
    },
    glovesOfTheGale: {
      name: 'Luvas da rajada'
    },
    softSoledShoes: {
      name: 'Sapatos de sola macia'
    },
    catStepBoots: {
      name: 'Botas de passo de gato'
    },
    shadowstepBoots: {
      name: 'Botas de passo sombrio'
    },
    windstrideBoots: {
      name: 'Botas de passada do vento'
    },
    luckyCoin: {
      name: 'Moeda da sorte'
    },
    shadowBand: {
      name: 'Anel de sombra'
    },
    sandglassOfTheSwift: {
      name: 'Ampulheta do veloz'
    },
    talonCharm: {
      name: 'Amuleto de garra'
    },
    windheart: {
      name: 'Coração de vento'
    },
    ashwallHeater: {
      name: 'Escudo Muralha de Cinzas'
    },
    wyrmhidePavise: {
      name: 'Pavês de pele de dragão-serpente'
    },
    footmansKettleHat: {
      name: 'Chapéu de panela do soldado'
    },
    ironbrowSallet: {
      name: 'Celada de sobrancelhas de ferro'
    },
    warlordsBarbute: {
      name: 'Barbuta do senhor da guerra'
    },
    helmOfTheSunderedThrone: {
      name: 'Elmo do trono despedaçado'
    },
    recruitsCuirass: {
      name: 'Couraça de recruta'
    },
    stonecuttersMitts: {
      name: 'Luvas do canteiro'
    },
    ashforgedGauntlets: {
      name: 'Manoplas forjadas em cinzas'
    },
    warbringerGauntlets: {
      name: 'Manoplas do belicoso'
    },
    titanfistGauntlets: {
      name: 'Manoplas punho de titã'
    },
    footmansGreaves: {
      name: 'Grevas do soldado'
    },
    ironshodGreaves: {
      name: 'Grevas ferradas'
    },
    warlordsSabatons: {
      name: 'Escarpes do senhor da guerra'
    },
    greavesOfTheMountainfall: {
      name: 'Grevas do desabamento'
    },
    sergeantsSignet: {
      name: 'Sinete do sargento'
    },
    brawlersKnuckleRing: {
      name: 'Soqueira do brigão'
    },
    bloodiedWarMedal: {
      name: 'Medalha de guerra ensanguentada'
    },
    watchmansCudgel: {
      name: 'Cassetete do vigia'
    },
    ironboundMace: {
      name: 'Maça reforçada a ferro'
    },
    stonehideCleaver: {
      name: 'Cutelo de pele de pedra'
    },
    bulwarkMaul: {
      name: 'Malho do baluarte'
    },
    mountainsplitterAxe: {
      name: 'Machado racha-montanhas'
    },
    everstandWarmace: {
      name: 'Maça de guerra inabalável'
    },
    emberwallBastion: {
      name: 'Bastião do muro de brasas'
    },
    stonewardenHelm: {
      name: 'Elmo do guardião de pedra'
    },
    colossusVisage: {
      name: 'Rosto do colosso'
    },
    diggersGauntlets: {
      name: 'Manoplas do cavador'
    },
    bastionGauntlets: {
      name: 'Manoplas do bastião'
    },
    glacierplateGauntlets: {
      name: 'Manoplas de placas glaciais'
    },
    gauntletsOfEndlessVigil: {
      name: 'Manoplas da vigília eterna'
    },
    hearthstoneCharm: {
      name: 'Amuleto de pedra do lar'
    },
    ironheartPendant: {
      name: 'Pingente coração de ferro'
    },
    hedgewizardsWand: {
      name: 'Varinha do feiticeiro de sebe'
    },
    frostglassStaff: {
      name: 'Cajado de vidro gelado'
    },
    voidthreadWand: {
      name: 'Varinha de fio do vazio'
    },
    staffOfTheStarlessSky: {
      name: 'Cajado do céu sem estrelas'
    },
    studentsGrimoire: {
      name: 'Grimório do estudante'
    },
    frostfireOrb: {
      name: 'Orbe de fogo gelado'
    },
    orbOfTheUnwrittenHour: {
      name: 'Orbe da hora não escrita'
    },
    apprenticesPointedCap: {
      name: 'Chapéu pontudo do aprendiz'
    },
    sagesCirclet: {
      name: 'Diadema do sábio'
    },
    cinderWizardsHat: {
      name: 'Chapéu do mago de cinzas'
    },
    voidseerCirclet: {
      name: 'Diadema do vidente do vazio'
    },
    apprenticesRobe: {
      name: 'Túnica do aprendiz'
    },
    cinderthreadRobe: {
      name: 'Túnica de fio de cinzas'
    },
    voidwovenRobe: {
      name: 'Túnica tecida do vazio'
    },
    inkStainedGloves: {
      name: 'Luvas manchadas de tinta'
    },
    spellthreadGloves: {
      name: 'Luvas de fio de feitiço'
    },
    frostweaveGloves: {
      name: 'Luvas de tecido gelado'
    },
    starlitGloves: {
      name: 'Luvas estreladas'
    },
    glovesOfTheLastWord: {
      name: 'Luvas da última palavra'
    },
    scribesSlippers: {
      name: 'Chinelos do escriba'
    },
    moonstepSlippers: {
      name: 'Chinelos passo de lua'
    },
    emberstepBoots: {
      name: 'Botas passo de brasa'
    },
    voidwalkerBoots: {
      name: 'Botas do andarilho do vazio'
    },
    bootsOfTheWanderingStar: {
      name: 'Botas da estrela errante'
    },
    glowstonePendant: {
      name: 'Pingente de pedra luminosa'
    },
    scholarsSeal: {
      name: 'Selo do erudito'
    },
    eyeOfTheArchon: {
      name: 'Olho do arconte'
    },
    cinderRepeater: {
      name: 'Repetidora de cinzas'
    },
    glacierMortar: {
      name: 'Morteiro de mão glacial'
    },
    sparkCell: {
      name: 'Célula de faíscas'
    },
    arcCapacitor: {
      name: 'Capacitor de arco'
    },
    aetherheartCell: {
      name: 'Célula coração de éter'
    },
    marksmansVisor: {
      name: 'Viseira do atirador'
    },
    sharpshootersCap: {
      name: 'Boné do franco-atirador'
    },
    gunnersHarness: {
      name: 'Arnês do artilheiro'
    },
    steadyhandGloves: {
      name: 'Luvas de mão firme'
    },
    gunsmithsGloves: {
      name: 'Luvas do armeiro'
    },
    scrappersBoots: {
      name: 'Botas do brigão'
    },
    sharpshooterBoots: {
      name: 'Botas do franco-atirador'
    },
    firingLineBoots: {
      name: 'Botas da linha de tiro'
    },
    steadyfootBoots: {
      name: 'Botas pé firme'
    },
    aetherstepBoots: {
      name: 'Botas passo de éter'
    },
    bootsOfTheLastShot: {
      name: 'Botas do último tiro'
    },
    brassCartridgeCharm: {
      name: 'Amuleto de cartucho de latão'
    },
    deadEyeLens: {
      name: 'Lente do olho certeiro'
    },
    eagleEyeScope: {
      name: 'Luneta olho de águia'
    },
    criersBaton: {
      name: 'Bastão do pregoeiro'
    },
    droversStandard: {
      name: 'Estandarte do boiadeiro'
    },
    marshalsSceptre: {
      name: 'Cetro do marechal'
    },
    balladBook: {
      name: 'Livro de baladas'
    },
    chronicleOfHeroes: {
      name: 'Crônica dos heróis'
    },
    psalterOfTheHost: {
      name: 'Saltério da hoste'
    },
    tomeOfEternalReign: {
      name: 'Tomo do reinado eterno'
    },
    heraldsCap: {
      name: 'Boina do arauto'
    },
    singersCirclet: {
      name: 'Diadema do cantor'
    },
    diademOfTenThousandVoices: {
      name: 'Diadema das dez mil vozes'
    },
    travelersWaistcoat: {
      name: 'Colete do viajante'
    },
    minstrelsMotley: {
      name: 'Traje de retalhos do menestrel'
    },
    troubadoursCoat: {
      name: 'Casaco do trovador'
    },
    marshalsGreatcoat: {
      name: 'Capote do marechal'
    },
    buskersGloves: {
      name: 'Luvas do artista de rua'
    },
    drummersGloves: {
      name: 'Luvas do tamboreiro'
    },
    standardBearersGloves: {
      name: 'Luvas do porta-estandarte'
    },
    gildedParadeGloves: {
      name: 'Luvas de desfile douradas'
    },
    glovesOfTheCrownedHand: {
      name: 'Luvas da mão coroada'
    },
    wayfarersShoes: {
      name: 'Sapatos do andarilho'
    },
    troubadourBoots: {
      name: 'Botas do trovador'
    },
    heraldsRidingBoots: {
      name: 'Botas de montaria do arauto'
    },
    paradeBoots: {
      name: 'Botas de desfile'
    },
    bootsOfTheLongProcession: {
      name: 'Botas da longa procissão'
    },
    silverWhistle: {
      name: 'Apito de prata'
    },
    gatheringHorn: {
      name: 'Trompa de convocação'
    },
    heartOfTheMountain: {
      name: 'Coração da montanha'
    },
    ringOfAbsolutePower: {
      name: 'Anel do poder absoluto'
    }
  },
  bag: {
    oreCount: '{ore}: {n}',
    noOre: 'Ainda sem minério. Minere os veios contra a rocha, lá fora na natureza.',
    equip: 'Equipar',
    unequip: 'Tirar',
    worn: 'Você está usando isto. Tire para vender.',
    versus: 'Comparado com {item}',
    hint: 'Toque em um item para vê-lo. Toque de novo, ou arraste-o para um espaço, para equipá-lo.',
    empty: 'Nada deste tipo na bolsa.',
    slotEmpty: '{slot}: vazio',
    slotHolds: '{slot}: {item}',
    filter: {
      ore: 'Minério',
      all: 'Tudo',
      weapons: 'Armas',
      armor: 'Armaduras',
      trinkets: 'Berloques',
      herbs: 'Ervas'
    },
    sort: {
      slot: 'Tipo',
      tier: 'Qualidade',
      level: 'Nível'
    },
    sortBy: 'Ordenar por: {by}',
    noHerbs: 'Nenhuma erva ainda. Elas crescem na natureza: passe por cima de uma para colhê-la.',
    herbCount: '{plant}: {n}'
  },
  shop: {
    buy: 'Comprar',
    sell: 'Vender',
    owned: 'Você tem',
    empty: 'Nada nas prateleiras hoje.',
    goods: 'À venda',
    price: 'Preço',
    value: 'Eles pagam',
    hint: 'Toque em algo da prateleira ou da sua bolsa para pôr na mesa, ou arraste até lá.',
    buyBack: 'Vendido hoje',
    buyBackOne: 'Recomprar',
    deal: 'Fechado!',
    say: {
      buy: 'Boa escolha. Cuide bem dele que ele cuida de você.',
      sell: 'Tudo bem. Alguém vai querer.',
      back: 'Mudou de ideia? Sem problema, aqui está.',
      poor: 'Receio que seja um pouco mais do que você tem aí.'
    }
  },
  trainer: {
    learn: 'Aprender',
    known: 'Aprendida',
    friend: 'Desconto de 20% para os amigos desta facção: {faction}.',
    fee: 'Taxa',
    rank: {
      label: 'Grau {n}',
      up: 'Subir de grau',
      effect: '+{effect}% de efeito, −{cd}% de recarga',
      max: 'Grau máximo',
      level: 'O grau {n} exige o nível {lvl}.'
    },
    hint: 'Escolha uma lição. Uma borda verde significa que você pode aprendê-la agora.',
    block: {
      'trial': "Você não passou na prova desta classe.",
      'parents': "Primeiro aprenda uma habilidade de {a} e uma de {b}.",
      level: 'Seu nível é baixo demais.',
      attrs: 'Seus atributos são baixos demais.',
      gold: 'Ouro insuficiente.'
    }
  },
  healer: {
    talk: 'Sente-se e descanse um pouco. Seus frascos estão cheios de novo. Posso vender um cinto maior, se quiser.',
    note: 'Você leva {n} poções para cada zona.',
    buy: 'Mais um frasco · {n}',
    full: 'Seu cinto não aguenta mais nenhum.',
    belt: 'Cinto de poções',
    slotTitle: 'Cinto ampliado',
    slotBought: 'Mais um espaço de frasco: agora você leva {n} poções de vida para cada zona e pode guardar {n} poções de mana.',
    mana: {
      title: 'Poções de mana',
      note: 'Em estoque: {n} de {max}. Ficam com você entre as visitas.',
      buy: 'Uma poção de mana · {n}',
      full: 'Seu estoque está cheio.'
    }
  },
  faction: {
    order: 'A Ordem de Ferro',
    syndicate: 'O Sindicato das Cinzas',
    circle: 'O Círculo do Éter'
  },
  npc: {
    'mysteriousWanderer': { 'name': "Andarilho misterioso" },
    'fairPip': { 'name': "Pip" },
    'fairBess': { 'name': "Velha Bess" },
    'fairHob': { 'name': "Hob" },
    sunkenPriest: { name: "O Sacerdote Submerso" },
    'fortHale': {
      'name': "Capitão Hale",
    },
    'fortMara': {
      'name': "Anciã Mara",
    },
    'scoutWren': {
      'name': "Batedora Wren",
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
      name: 'Irmã Aurelle'
    },
    freedPeddler: {
      talk: 'Tudo o que um viajante precisa. Quase novo, quase sempre.',
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
      name: 'Pip, o Andarilho',
      talk: 'Estrada longa e bolsa leve? Levo um pouco de tudo.'
    },
    sunfordSmith: {
      name: 'Bram, o Ferreiro',
      talk: 'Aço simples, preço justo. Fique à vontade.'
    },
    sunfordPeddler: {
      name: 'Tilly, a Mascate',
      talk: 'Anéis, amuletos, miudezas. Aquele ali talvez até dê sorte.'
    },
    trainerAegis: {
      name: 'Ser Aldric'
    },
    trainerPyro: {
      name: 'Ember Wren'
    },
    elderMara: {
      name: 'Anciã Mara'
    },
    sunfordHealer: {
      name: 'Irmã Lune'
    },
    goblinTrader: {
      name: 'Grik, o Mercador',
      talk: 'Minha família fez isto. Bom trabalho, preço justo.'
    },
    captainHale: {
      name: 'Capitão Hale'
    },
    oakArmorer: {
      name: 'Odo, o Armeiro',
      talk: 'Metade do meu estoque foi para a muralha. Leve o que sobrou, se servir.'
    },
    oakMasterArmorer: {
      name: 'Mestre Odo',
      talk: 'A armadura boa está na vitrine. Você mais do que merece dar uma olhada.'
    },
    oakWeapons: {
      name: 'Senna Blades',
      talk: 'Afiadas, equilibradas, preço justo. Não toque nos gumes.'
    },
    trainerShadow: {
      name: 'O Sussurro'
    },
    trainerSovereign: {
      name: 'Lorde Castellan'
    },
    oakHealer: {
      name: 'Irmão Fenn'
    },
    blackMarket: {
      name: 'O Receptador',
      talk: 'Sem perguntas, dos dois lados. O Sindicato leva a parte dele.'
    },
    trainerBlood: {
      name: 'Doutor Sangrel'
    },
    syndicateBoss: {
      name: 'Madame Ash'
    },
    forgemaster: {
      name: 'Mestre da Forja Dorn'
    },
    ironWeapons: {
      name: 'Hilda Hammerhand',
      talk: 'Tudo forjado por anões. Se uma peça quebrar, quero saber como.'
    },
    ironAetherWorks: {
      name: 'Voss, o Inventor',
      talk: 'Tudo aqui nasceu do estudo do núcleo. Cuidado, quase tudo está carregado.'
    },
    ironArmor: {
      name: 'Garrun Ironside',
      talk: 'Armaduras nos suportes, anéis na bandeja.'
    },
    ironOrderArmor: {
      name: 'Intendente da Ordem',
      talk: 'Leve o que precisar. A Ordem cuida dos seus.'
    },
    trainerGeo: {
      name: 'Velho Pé-de-Pedra'
    },
    trainerAether: {
      name: 'Pim, o Mecânico'
    },
    ironHealer: {
      name: 'Madre Brynja'
    },
    exiledSovereign: {
      name: 'Lorde Castellan, no exílio'
    },
    trainerChrono: {
      name: 'O Guardião das Horas'
    },
    mayorBrenna: {
      name: 'Prefeita Brenna Quill'
    },
    sbHealer: {
      name: 'Irmão Ansel'
    },
    sbArmorer: {
      name: 'Greta Ironvein',
      talk: 'Aço da montanha, preço de rio. Pode bater no que quiser.'
    },
    sbWeapons: {
      name: 'Corvin Ashby',
      talk: 'Lâminas Finas de Ashby. Cada fio polido à mão. A minha mão.'
    },
    sbJeweler: {
      name: 'Tam Marlow',
      talk: 'Anéis, amuletos, pedras da sorte. Tudo verdadeiro. Bom, quase tudo.'
    },
    sbMasterAegis: {
      name: 'Dama Helga Stormshield'
    },
    sbMasterPyro: {
      name: 'Magister Ignatius Vale'
    },
    sbMasterShadow: {
      name: 'Nyx Halloway'
    },
    sbMasterSovereign: {
      name: 'Lorde Percival Ashcombe'
    },
    sbMasterGeo: {
      name: 'Vovó Tova Deeproot'
    },
    sbMasterAether: {
      name: 'Professor Quint Sprocket'
    },
    sbMasterChrono: {
      name: 'Guardião do Relógio Selwyn'
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
      talk: 'Peças raras, para amigos raros. Não toque em nada com os dedos sujos de geleia.'
    },
    sbFence: {
      name: 'Mirela Thorne',
      talk: 'Armaduras finas, sem perguntas. Bom, pouquíssimas perguntas.'
    },
    sbMasterWindrunner: {
      name: 'Sefa Galewing'
    },
    sbMasterFrostwarden: {
      name: 'Halvard Rimeheart'
    },
    sbMasterLightbringer: {
      name: 'Irmã Auriel Dawnmere'
    },
    sbMasterBeastcaller: {
      name: 'Velho Rowan Thistlefoot'
    },
    sbMasterElementalist: {
      name: 'Magistra Iris Fourwinds'
    },
    sbMasterSoulwarden: {
      name: 'Guardiã Odalys Lanternlight'
    },
    sbMasterIronmonk: {
      name: 'Mestre Oru Stillwater'
    },
    sbMasterBard: {
      name: 'Lark Merriweather'
    }
  },
  quest: {
    final: 'Esta escolha é permanente.',
    needsRep: 'Reputação {n} necessária: {faction}',
    gold: '+{n} de ouro',
    goblinKing: {
      title: 'O Rei Goblin',
      slay: {
        label: 'Acabar com o reinado dele.'
      },
      pact: {
        label: 'Oferecer um pacto comercial com Sunford.'
      },
      ransom: {
        label: 'Levar o tesouro e deixar a coroa com ele.'
      }
    },
    siege: {
      title: 'O Cerco de Oakhaven',
      defend: {
        label: 'Defender Oakhaven.'
      },
      betray: {
        label: 'Abrir o portão para o Sindicato.'
      }
    },
    core: {
      title: 'O Coração de Ironhold',
      destroy: {
        label: 'Estilhaçar o núcleo.'
      },
      study: {
        label: 'Entregar ao Círculo para estudo.'
      },
      sell: {
        label: 'Vender ao Sindicato.'
      }
    },
    oracle: {
      title: 'A Oráculo Afogada',
      free: {
        label: 'Quebrar as correntes dela.'
      },
      slay: {
        label: 'Levar a ampulheta que ela guarda.'
      }
    },
    dragon: {
      title: 'O Dragão do Vazio',
      slay: {
        label: 'Matar o dragão.'
      },
      pact: {
        label: 'Firmar um pacto contra o Arquidemônio.'
      }
    },
    throne: {
      title: 'O Trono Vazio',
      order: {
        label: 'Dar o trono à Ordem de Ferro.'
      },
      syndicate: {
        label: 'Dar o trono ao Sindicato das Cinzas.'
      },
      circle: {
        label: 'Dar o trono ao Círculo do Éter.'
      },
      shatter: {
        label: 'Estilhaçar o trono.'
      },
      claim: {
        label: 'Sentar nele você mesmo.'
      }
    }
  },
  dlg: {
    // ── The Mysterious Wanderer (afterplay phase 10) ──
    'mysteriousWanderer': {
      'hello': { '1': "Então. Você fez o que poucos já fizeram. Senti isso do outro lado da fenda.", '2': "Ensino os velhos caminhos que unem duas escolas em uma. Só a quem os merece." },
      'sealed': { '1': "Você a selou. Uma pena, de certo modo. Eu gostava da vista." },
      'ajar': { '1': "Você a deixou entreaberta. Ousado. Os demônios vão te manter afiado." },
      'again': { '1': "De volta. A estrada é longa, mas você a percorre bem." },
      'train': { '1': "Mostre-me as duas metades do que você é, e eu as farei uma." },
      'trial': { 'say': "De que provas você fala?", '1': "Um portão mantido sem um arranhão. Um dragão morto sem uma queda. Cinco forjas infernais e cinco vitórias seguidas.", '2': "A morte do Leviatã e uma rodada perfeita na hidra. Cada uma abre uma porta que posso te mostrar." },
      'who': { '1': "Um andarilho. Eu andava à beira da fenda antes de seu avô nascer. Nomes se desgastam." },
      'trainBack': { '1': "Pratique. Duas escolas brigam antes de concordar." },
      'bye': { '1': "Ande com cuidado. Estarei aqui, até não estar." }
    },
    'fairPip': {
      'hello': { '1': "Cheguem mais! Nove barris, um bando de diabretes e um martelo. Mande eles de volta pra baixo!", '2': "Os diabretes saem dos barris. Acerte vinte antes da areia acabar.", '3': "Deixe os de armadura dourada, eles custam uma vida. Três vitórias seguidas e o grande prêmio é seu." },
      'again': { '1': "Quer bater mais? Pegue o martelo!" },
      'play': { '1': "Martelo pra cima! Lá vêm eles!" },
      'who': { '1': "Pip, caçador de diabretes por ofício. Esses eu mesmo peguei. Eles mordem." },
      'playBack': { '1': "Rá! Que barulheira! De novo?" },
      'bye': { '1': "Solte esse braço!" }
    },
    'fairBess': {
      'hello': { '1': "Cinco argolas, três cabeças, e nenhuma morde. Eu mesma entalhei, então cuidado com a tinta.", '2': "Segure pra pegar impulso, solte pra jogar. Uma cabeça só pega a argola quando passa pelo meio.", '3': "Cada cabeça seguida conta um a mais. Acerte as cinco e eu pago direitinho." },
      'again': { '1': "Voltou pra tentar a sorte com a minha velhinha?" },
      'play': { '1': "Aqui estão suas argolas. Jogue com jeito, meu bem." },
      'who': { '1': "Quarenta anos nas estradas das feiras. A hidra veio com a guerra. Pareceu apropriado." },
      'playBack': { '1': "Nada mal. Meu falecido marido jogava pior." },
      'bye': { '1': "Cuidado com a tinta na saída." }
    },
    'fairHob': {
      'hello': { '1': "Ah. Oi. Quer uma queda de braço? Vou com calma. Vou tentar.", '2': "Empurre quando o anel encontrar o círculo. Fora do ritmo, você escorrega.", '3': "Braços fortes ajudam. Me vença três vezes seguidas e o Mestre Ferreiro te dá um desconto." },
      'again': { '1': "Mais uma rodada? Ninguém nunca volta pra mais uma rodada." },
      'play': { '1': "Cotovelo na mesa. Quando quiser." },
      'who': { '1': "Sou o aprendiz do Mestre Ferreiro. Ele diz que eu não conheço a minha própria força." },
      'playBack': { '1': "Boa disputa. Meu braço vai doer amanhã. Provavelmente." },
      'bye': { '1': "Volte logo. A forja fica muito quieta." }
    },
    // ── The Breaking (the afterplay, B0–B5) ──
    'story': {
      forge: { back: { '1': "Minha forja queima de novo, mais quente que nunca. Ferro demoníaco derrete bem.", '2': "Traga o que você achar lá fora. Agora posso forjar tudo infernal." } },
      oracle: { lens: { '1': "Você me libertou uma vez. Agora vou enxergar por você. Pegue minha Lente.", '2': "Olhe através dela, e o mapa mostrará onde as grandes feras esperam." } },
      priest: { lens: { '1': "O Oráculo se foi, então agora eu guardo o templo dela. A Esfinge protegia isto.", '2': "A Lente dela. Olhe através dela, e o mapa mostrará onde as grandes feras esperam." } },
      herbs: { scale: { '1': "Uma escama do Leviatã! Leve como uma folha, e ela flutua.", '2': "Use-a, e as águas rasas vão segurar você como chão firme." } },
      ghost: { key: { '1': "Ora, quem tomou meu trono. Você matou minha Hidra. Ótimo.", '2': "Pegue a chave de fogo dela. O coração da fenda arde, e só o fogo o abre." } },
      syndicate: { key: { '1': "A Hidra morreu? Então a chave de fogo é de quem pagar. Ou sua, imagino.", '2': "Ela abre o coração da fenda. Vá fechá-la, antes que ela engula meus negócios." } },
      sealed: {
        sealed: { '1': "E assim a fenda foi selada, e o mundo começou a se curar.", '2': "Cidades foram reconstruídas, canções foram escritas, e um nome estava em todas." },
        ajar: { '1': "E assim a fenda ficou entreaberta, e o mundo aprendeu a viver ao lado dela.", '2': "As muralhas seguiram guardadas, o coliseu seguiu barulhento, e o herói seguiu pronto." },
      },
      'rift': {
        'scream': {
          '1': "O Senhor do Vazio cai, e a fenda atrás dele grita.",
          '2': "Nunca foi o trono dele. Era a jaula dele, e ele era a tampa.",
          '3': "Agora a fenda está aberta, e tudo o que o vazio mantinha adormecido está despertando.",
        },
      },
      'wren': {
        'found': {
          '1': "Aí está você! Sou Wren, batedora. Procurei você por toda parte.",
          '2': "Sunford está em chamas. Todos que conseguiram fugir foram para o Passo do Bastião.",
          '3': "É o velho forte na estrada para os Penhascos de Cinza. Depressa, precisam de você.",
        },
      },
    },
    'scoutWren': {
      sealed: { '1': "O dragão se foi! As estradas já parecem mais leves." },
      'hello': {
        '1': "Você veio! Eu sabia. Bem-vindo ao Passo do Bastião.",
        '2': "Eu patrulho as estradas para o capitão. Pergunte onde está o perigo.",
        '1__f': "Você veio! Eu sabia. Bem-vinda ao Passo do Bastião.",
      },
      'again': {
        '1': "Já voltou? As estradas não se patrulham sozinhas.",
      },
      'who': {
        '1': "Wren. Eu levava recados para a guarda de Sunford, antes de Sunford queimar.",
      },
      'rumor': {
        'plains': {
          '1': "Demônios dominam a estrada das Planícies de Sunford. Os mestres de Sunford estão presos do outro lado.",
        },
        'hollows': {
          '1': "As Grutas dos Goblins estão cheias de cães infernais. Limpe-as, e o povo de Sunford pode voltar.",
        },
        'woods': {
          '1': "Algo com três cabeças caça no Bosque Sussurrante. A herbalista está escondida lá.",
        },
        'outskirts': {
          '1': "Centauros cavalgam pelos Arredores. Se chegarem às muralhas, precisaremos de cada espada.",
        },
        'siege': {
          '1': "A horda deles foi quebrada, mas outros estão se reunindo. O capitão prepara as muralhas.",
        },
      },
      'bye': {
        '1': "Fique de olho nas estradas. Eu também vou ficar.",
      },
    },
    'fortHale': {
      sealed: { '1': "O dragão está morto. Nunca pensei que viveria para ver isso. Obrigado." },
      'siegeBack': { '1': "Ainda não? Então descanse. As muralhas vão esperar por você." },
      'bell': { '1': "Para o portão, então. Diga com que força vamos segurá-lo." },
      'hello': {
        '1': "Você conseguiu. Ótimo. Precisamos de cada espada, agora mais do que nunca.",
        '2': "Bem-vindo ao Passo do Bastião. Muralhas velhas, mas as únicas ainda de pé.",
        '2__f': "Bem-vinda ao Passo do Bastião. Muralhas velhas, mas as únicas ainda de pé.",
      },
      'road': {
        '1': "A estrada para Sunford está aberta de novo. O povo dela está seguro atrás das muralhas.",
      },
      'herbs': {
        '1': "A herbalista voltou, com as ervas dela. A enfermaria pode respirar.",
      },
      'siege': {
        '1': "Você quebrou os centauros. Mas um exército maior vem aí, e vem atrás destas muralhas.",
      },
      'again': {
        '1': "Ainda de pé. As muralhas, os homens e eu.",
      },
      'fort': {
        '1': "Um velho forte de fronteira. Vazio por cinquenta anos, até o céu se rasgar.",
        '2': "Agora é o último lugar seguro entre as planícies e as montanhas.",
        'say': "Que lugar é este?",
      },
      'rumor': {
        'road': {
          '1': "Limpe as Planícies e as Grutas. O povo de Sunford está preso lá fora.",
        },
        'woods': {
          '1': "A herbalista está no Bosque Sussurrante, e uma fera de três cabeças também. Fique atento.",
          '1__f': "A herbalista está no Bosque Sussurrante, e uma fera de três cabeças também. Fique atenta.",
        },
        'centaurs': {
          '1': "Centauros nos Arredores. Quebre a horda deles antes que nos alcance.",
        },
        'siege': {
          '1': "Descanse. Quando o sino do cerco tocar, preciso de você na muralha.",
        },
      },
      'bye': {
        '1': "Mantenha a espada por perto.",
      },
    },
    'fortMara': {
      sealed: { '1': "Você conseguiu, criança. Cada um de nós lhe deve um lar." },
      'siegeBack': { '1': "Descanse um pouco, criança. O sino vai tocar de novo." },
      'bell': { '1': "Agora cabe a mim guardar as muralhas do capitão. Escolha como vamos segurá-las." },
      'hello': {
        '1': "Criança! Você está vivo. Quando Sunford queimou, temi o pior.",
        '2': "Agora somos hóspedes num forte de soldados, velhas e tudo.",
        '1__f': "Criança! Você está viva. Quando Sunford queimou, temi o pior.",
      },
      'command': {
        '1': "O capitão Hale caiu com Oakhaven. Então o forte ouve uma velha anciã agora.",
      },
      'home': {
        '1': "Sunford está sendo reconstruída! Os primeiros telhados já estão de pé. Eu poderia chorar.",
      },
      'again': {
        '1': "Ainda aqui, criança. Ainda contando cabeças.",
      },
      'town': {
        '1': "Demônios desceram do céu noturno. Fugimos com o que dava para carregar.",
        '2': "Alguns de nós nunca saíram. Traga o resto para casa, se puder.",
        'say': "O que aconteceu com Sunford?",
      },
      'rumor': {
        'road': {
          '1': "Nossos mestres ainda estão na estrada de Sunford. Traga-os aqui, criança.",
        },
        'woods': {
          '1': "A herbalista foi ao Bosque Sussurrante buscar ervas e nunca voltou.",
        },
        'centaurs': {
          '1': "Cavaleiros nos Arredores. Cascos como trovões, toda noite.",
        },
        'siege': {
          '1': "As muralhas logo serão postas à prova. Sinto isso nos meus velhos ossos.",
        },
      },
      'bye': {
        '1': "Vá com cuidado, criança.",
      },
    },
    intro: {
      crossing: { 1: 'Todos os caminhos deste mundo se encontram numa encruzilhada… e toda encruzilhada é uma batalha.' },
      hero: { 1: 'Dos campos tranquilos de Sunford, um jovem herói partiu.' },
      fire: { 1: 'O fogo atendeu ao chamado. O aço aprendeu um novo nome.' },
      foes: { 1: 'Reis goblins, jarls do gelo, um dragão do vazio… e o Arquidemônio.' },
      begin: { 1: 'Sua lenda começa agora.' }
    },
    frostDisciple: {
      bye: {
        '1': 'Se agasalhe.'
      },
      who: {
        '2': 'As forjas de Ironhold são quentes. Gosto daqui.',
        '1': 'Eu caçava na tundra. Me enjaularam por um inverno.'
      },
      trainBack: {
        '1': 'Pratique. O frio é paciente. Seja também.'
      },
      ready: {
        weak: {
          '1': 'Ainda não. Mais força no braço e na mente.'
        },
        able: {
          '1__f': 'Você está pronta. Próxima lição.',
          '1': 'Você está pronto. Próxima lição.'
        },
        strong: {
          '1': 'Você é mais forte do que eu era. Pegue o que precisar.'
        }
      },
      class: {
        say: 'O que é um Guardião do Gelo?',
        '2': 'Força para a lâmina. Inteligência para o gelo.',
        '1': 'Esfrie-os, congele-os, depois quebre o gelo.'
      },
      train: {
        '1__f': 'Fique parada. Deixe o frio vir até você. Depois mande-o de volta.',
        '1': 'Fique parado. Deixe o frio vir até você. Depois mande-o de volta.'
      },
      again: {
        '1': 'Você voltou. Bom.'
      },
      hello: {
        '2': 'Ivor Hask. Halvard Rimeheart me ensinou o gelo. Agora eu ensino, aqui.',
        '1': 'Livre. Bom. O frio não me pegou, e eles também não.'
      }
    },
    windDisciple: {
      bye: {
        '1': 'Fique de olho no vento.'
      },
      who: {
        '2': 'Diga à Sefa que estou vivo, pode ser? Ela se preocupa.',
        '1': 'Eu estava a caminho de Silverbridge quando os penhascos me pegaram.'
      },
      trainBack: {
        '1': 'Vá praticar. Em algum lugar com vento.'
      },
      ready: {
        weak: {
          '1': 'Ainda não. Ganhe velocidade primeiro, depois volte.'
        },
        able: {
          '1__f': 'Você está pronta para a próxima. Preste atenção.',
          '1': 'Você está pronto para a próxima. Preste atenção.'
        },
        strong: {
          '1__f': 'Você já é mais rápida que eu. Pegue o que quiser.',
          '1': 'Você já é mais rápido que eu. Pegue o que quiser.'
        }
      },
      class: {
        say: 'O que faz um Corredor do Vento?',
        '2': 'Destreza para pés ligeiros. Técnica, para que toda flecha acerte.',
        '1': 'Corra, atire, corra de novo. Nunca esteja onde eles miram.'
      },
      train: {
        '1': 'Pés afastados. Solte o ar. Deixe o vento levá-la.'
      },
      again: {
        '1': 'Ei! O vento está bom hoje. Vamos treinar?'
      },
      hello: {
        '2': 'Kestrel Vane. Sefa Galewing me ensinou o arco. Posso ensinar a você o que ela me ensinou.',
        '1': 'Você me tirou de lá! Devo tudo a você. Bom, bastante.'
      }
    },
    freedFarmers: {
      bye: {
        '1': 'Vá com cuidado.'
      },
      who: {
        '2': 'Oakhaven nos acolheu. Pagamos de volta com pão.',
        '1': 'Bandidos nos tiraram do nosso campo e nos deixaram apodrecendo na floresta.'
      },
      favorDone: {
        say: 'Os lobos não vão mais incomodar vocês.',
        '2': 'Tome isto. Não é muito, mas é honesto.',
        '1': 'Noites tranquilas de novo. Finalmente podemos dormir.'
      },
      waiting: {
        say: 'Sobre aqueles lobos...',
        '1': 'Os lobos ainda estão por aí. Ouvimos eles ontem à noite.'
      },
      favor: {
        say: 'Posso ajudar com alguma coisa?',
        '2': 'Dá para diminuir o bando? Oito devem servir de lição.',
        '1': 'Lobos do Bosque Sussurrante vivem levando nossas ovelhas.'
      },
      again: {
        '1__f': 'Olha a nossa heroína. Veio comer alguma coisa?',
        '1': 'Olha o nosso herói. Veio comer alguma coisa?'
      },
      hello: {
        '2': 'Jory Toller. Agora cultivamos fora das muralhas. Bom, a gente tenta.',
        '1': 'Estaríamos mortos sem você. Eu e meu menino. Obrigado.'
      }
    },
    freedHerbalist: {
      bye: {
        '1': 'Pise com cuidado. Coisas crescem por lá.'
      },
      who: {
        '2': 'Eles não estavam totalmente errados.',
        '1': 'Uma herbalista das colinas. Os goblins me tomaram por bruxa.'
      },
      favorDone: {
        say: 'Aqui estão suas pétalas-do-sol.',
        '2': 'Aqui, seu pagamento. E obrigada, mais uma vez.',
        '1': 'Ah, estão perfeitas. Sinta esse cheiro!'
      },
      waiting: {
        say: 'Sobre aquelas pétalas-do-sol...',
        '1': 'Ainda procurando? As pétalas-do-sol adoram sol aberto.'
      },
      favor: {
        say: 'Posso fazer alguma coisa por você?',
        '2': 'Elas crescem lá nas planícies. Eu pago bem por elas.',
        '1': 'Perdi minhas reservas naquela jaula. Você poderia me trazer três pétalas-do-sol?'
      },
      again: {
        '1': 'Ah, olá de novo. Suas botas cheiram a musgo. Ótimo.'
      },
      hello: {
        '2': 'Sou Briar. Colho e seco o que cresce. Silverbridge foi gentil o bastante para me acolher.',
        '1': 'Eu sabia que alguém viria. Os goblins nunca entenderam de ervas. Nem de bondade.'
      }
    },
    lightDisciple: {
      bye: {
        '1': 'Caminhe na luz.'
      },
      who: {
        '2': 'Sunford é clara e tranquila. Eu precisava das duas coisas.',
        '1': 'Fui rezar no Templo Submerso. As nagas tinham outros planos.'
      },
      trainBack: {
        '1': 'Vá com suavidade. E deixe que vejam você chegando.'
      },
      ready: {
        weak: {
          '1': 'Ainda não. Primeiro uma mente mais clara e um coração mais caloroso.'
        },
        able: {
          '1__f': 'Você está pronta para a próxima lição. Venha, fique na luz.',
          '1': 'Você está pronto para a próxima lição. Venha, fique na luz.'
        },
        strong: {
          '1': 'Você brilha mais do que eu agora. Pegue o que precisar.'
        }
      },
      class: {
        say: 'O que faz um Portador da Luz?',
        '2': 'A Inteligência deixa a luz forte. O Carisma a deixa calorosa.',
        '1': 'Nós carregamos a aurora. Luz para lutar, luz para curar.'
      },
      train: {
        '1': 'Abra as mãos. Deixe a luz passar através delas, não sair delas.'
      },
      again: {
        '1__f': 'Bem-vinda de volta. O sol está gentil hoje.',
        '1': 'Bem-vindo de volta. O sol está gentil hoje.'
      },
      hello: {
        '2': 'Sou Aurelle. A Irmã Auriel me ensinou a luz. Agora eu a ensino aqui.',
        '1': 'A luz esteja com você. Você me encontrou no escuro, e eu não vou esquecer.'
      }
    },
    freedPeddler: {
      bye: {
        '1': 'Cuidado com os bandidos. Eles não gostam de dividir.'
      },
      shopBack: {
        '1__f': 'Foi um prazer fazer negócio, amiga.',
        '1': 'Foi um prazer fazer negócio, amigo.'
      },
      who: {
        '2': 'Agora eu vendo em Sunford. É mais seguro aqui. Quase sempre.',
        '1': 'Bandidos levaram minha carroça e me enfiaram numa caixa. Que falta de educação.'
      },
      trade: {
        '1': 'Anéis, luvas, botas. Pela metade do preço para você. Bom, quase.'
      },
      again: {
        '1__f': 'Minha salvadora! Venha, venha, guardei as coisas boas para você.',
        '1': 'Meu salvador! Venha, venha, guardei as coisas boas para você.'
      },
      hello: {
        '2': 'Odo Marrow, a seu dispor. Mascate, funileiro e um homem muito grato.',
        '1': 'Você! Foi você quem abriu aquela jaula! Eu teria apodrecido lá dentro.'
      }
    },
    sfShadowRoad: {
      hello: {
        '1': 'Teletransporte. Tem interesse?'
      },
      again: {
        '1': 'Voltou para outro truque?'
      },
      train: {
        '1': 'Olhe bem. Um passo, e você está em outro lugar.'
      },
      trainBack: {
        '1': 'Bom. Agora vá estar em outro lugar.'
      },
      bye: {
        '1': 'Não se deixe pegar.'
      }
    },
    sfShadow: {
      hello: {
        '1': 'Não ouvi você entrar. Normalmente esse é o meu truque.',
        '2': 'Nettle Quickhand. Ensino as artes silenciosas: adagas, sombras e sair cedo.'
      },
      again: {
        '1': 'Voltou? Ótimo. Ninguém viu você, espero.'
      },
      train: {
        '1': 'Pés leves, mãos rápidas. Tente não tropeçar na própria lâmina.'
      },
      class: {
        '1': 'Ataca onde ninguém está olhando, e depois está em outro lugar completamente.',
        '2': 'Tudo depende da Destreza. Mãos rápidas, pés rápidos, saídas rápidas.',
        say: 'O que faz uma Lâmina Sombria?'
      },
      ready: {
        strong: {
          '1': 'Você já é mais rápido que eu. Pegue o que quiser, eu nem vou notar.',
          '1__f': 'Você já é mais rápida que eu. Pegue o que quiser, eu nem vou notar.'
        },
        able: {
          '1': 'Está pronto para o próximo truque. Preste atenção, só faço uma vez.',
          '1__f': 'Está pronta para o próximo truque. Preste atenção, só faço uma vez.'
        },
        weak: {
          '1': 'Ainda não. Fique mais rápido primeiro, ou as sombras derrubam você.',
          '1__f': 'Ainda não. Fique mais rápida primeiro, ou as sombras derrubam você.'
        }
      },
      town: {
        '1': 'Cidade tranquila, gente honesta. Ninguém olha duas vezes para uma capa de fazendeiro. Perfeito.',
        say: 'Por que ensinar aqui, em Sunford?'
      },
      trainBack: {
        '1': 'Pode ir. Pratique onde os guardas não vejam.'
      },
      bye: {
        '1': 'Cuidado com a bolsa.'
      }
    },
    sfGeo: {
      hello: {
        '1': 'Cuidado com as pedras. Algumas estão ouvindo.',
        '2': 'Harrow Flint. Ensino a velha magia da terra: pedra, raízes, um pequeno tremor.'
      },
      again: {
        '1': 'Ah, você voltou. O chão me disse que você vinha.'
      },
      train: {
        '1': 'Pés firmes, respire devagar. Sinta o peso embaixo de você. Isso.'
      },
      class: {
        '1': 'Pede ajuda à terra. Muros quando você precisa, espinhos quando os outros não querem.',
        '2': 'Força para segurar a pedra, Inteligência para moldá-la. Você precisa das duas.',
        say: 'O que faz um geomante?'
      },
      ready: {
        strong: {
          '1': 'A pedra já responde a você antes de mim. Pegue o que precisar.'
        },
        able: {
          '1': 'Está pronto para a próxima lição. Ponha a mão no chão. Escute.',
          '1__f': 'Está pronta para a próxima lição. Ponha a mão no chão. Escute.'
        },
        weak: {
          '1': 'Ainda não. Mais força e a cabeça mais clara, ou a pedra não vai escutar.'
        }
      },
      farms: {
        '1': 'Toda primavera. A cevada cresce um palmo a mais e ninguém sabe por quê. Não conte a eles.',
        say: 'A terra ajuda as fazendas também?'
      },
      trainBack: {
        '1': 'Vá. E devolva essa pedra onde a encontrou.'
      },
      bye: {
        '1': 'Pise leve. O chão se lembra.'
      }
    },
    smalltalkSunford: {
      weather: {
        '1': 'Vai chover hoje à noite. Meu joelho dói o dia inteiro.',
        '2': 'Seu joelho disse isso semana passada também.',
        '3': 'E choveu, não choveu? Só não aqui.'
      },
      harvest: {
        '1': 'A cevada vingou bem este ano.',
        '2': 'Vamos torcer para podermos ficar com ela.'
      },
      goblins: {
        '1': 'Os goblins levaram três galinhas da fazenda do Moleiro.',
        '2': 'De novo? É a segunda vez este mês.',
        '3': 'Alguém devia fazer alguma coisa com aquelas cavernas.'
      },
      kingGone: {
        '1': 'Dizem que o Rei Goblin morreu.',
        '2': 'Ótimo. Quem sabe agora eu durmo uma noite inteira.'
      },
      pact: {
        '1': 'Comprei uma concha de um goblin hoje cedo.',
        '2': 'É boa?',
        '3': 'Melhor que a minha, sinceramente. Não conte pra ninguém.'
      },
      bram: {
        '1': 'O Bram está na bigorna desde antes do amanhecer.',
        '2': 'Ele fica assim quando está preocupado.'
      },
      pie: {
        '1': 'Esse cheiro é de torta de maçã?',
        '2': 'Era. As crianças acharam primeiro.',
        '3': 'Faço outra. Esconda melhor desta vez.'
      },
      road: {
        '1': 'Faz uma semana que ninguém pega a estrada das planícies.',
        '2': 'Não com bandidos lá. Não dá pra culpar ninguém.'
      },
      hero: {
        '1': 'Alguém limpou os bandidos da estrada das planícies.',
        '2': 'Graças a Deus. Minha irmã pode voltar a nos visitar.'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': 'Duas pratas por um repolho. Duas!',
        '2': 'Hoje em dia nada passa pelo portão barato.',
        '3': 'Então eu planto o meu. No telhado, se precisar.'
      },
      watch: {
        '1': 'Dobraram a guarda no portão.',
        '2': 'Ótimo. Durmo um pouco mais tranquilo.'
      },
      caravan: {
        '1': 'A caravana das especiarias está atrasada de novo.',
        '2': 'Bandidos?',
        '3': 'Ou lama. Tomara que seja lama.'
      },
      siege: {
        '1': 'Tem um exército acampado depois das fazendas.',
        '2': 'Então vamos encher o porão enquanto dá.'
      },
      saved: {
        '1': 'Você estava na muralha quando o cerco acabou?',
        '2': 'Eu estava escondido debaixo da cama, pra ser sincero.',
        '3': 'Metade da cidade também. Mas ainda estamos aqui.'
      },
      fountain: {
        '1': 'Joguei uma moeda na fonte para dar sorte.',
        '2': 'Espero que você tenha desejado repolho mais barato.'
      },
      ash: {
        '1': 'Tudo ainda cheira a fumaça.',
        '2': 'Vai passar. Tudo passa, no fim.'
      },
      hide: {
        '1': 'Você ouviu botas na rua ontem à noite?',
        '2': 'Fale baixo. Você não sabe quem está ouvindo.',
        '3': 'Desculpe. É que... desculpe.'
      },
      bread: {
        '1': 'Achei meio pão. Tome, pegue um pouco.',
        '2': 'Você é uma boa alma. Obrigado.'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': 'Bela veia de cobre no quarto nível.',
        '2': 'Cobre. Eu esperava prata.',
        '3': 'Cobre paga o aluguel. Prata paga sonhos.'
      },
      forge: {
        '1': 'A grande forja não esfria há cem anos.',
        '2': 'Meu avô ajudou a acendê-la, sabia?'
      },
      beard: {
        '1': 'Você aparou a barba.',
        '2': 'Cheguei perto demais da bigorna.',
        '3': 'Cresce de novo. E curta combina mais com você, aliás.'
      },
      core: {
        '1': 'Alguma coisa está brilhando lá nos poços fundos.',
        '2': 'Nada de bom brilha lá embaixo. Fique por cima.'
      },
      order: {
        '1': 'Os armeiros da Ordem trabalham rápido, isso eu admito.',
        '2': 'Rápido, sim. Vamos ver quanto aguenta.'
      },
      circle: {
        '1': 'O pessoal do Círculo cantarola enquanto trabalha.',
        '2': 'Pelo menos é melhor que o seu canto.'
      },
      cold: {
        '1': 'Que frio danado esta manhã.',
        '2': 'Então venha ficar perto da forja.'
      }
    },
    smalltalkKids: {
      tag: {
        '1': 'Pega-pega, é você!',
        '2': 'Não vale, eu não estava pronto!'
      },
      dragon: {
        '1': 'Quando eu crescer vou montar num dragão.',
        '2': 'Dragão não deixa ninguém montar.',
        '3': 'Um bonzinho talvez deixe.'
      },
      sword: {
        '1': 'Olha, achei uma espada!',
        '2': 'Isso é um graveto.'
      },
      frog: {
        '1': 'Tem um sapo perto do poço.',
        '2': 'Podemos ficar com ele?',
        '3': 'A mamãe disse chega de sapos.'
      }
    },
    ui: {
      overheard: 'Moradores',
      hero: 'Você',
      leave: 'Encerrar a conversa',
      topics: 'O que dizer?',
      gotGold: 'Recebido: {n} de ouro',
      gotItem: 'Recebido: {item}',
      hint: 'Marcado no seu mapa: {zone}',
      needs: {
        attr: 'Requer {n} de {attr}',
        level: 'Requer nível {n}',
        rep: 'Requer reputação {n} com {faction}',
        gold: 'Requer {n} de ouro',
        full: 'Você já carrega tudo o que pode',
        other: 'Ainda não'
      }
    },
    hero: {
      'siege': "Vamos guarnecer as muralhas.",
      forge: 'Eu gostaria de usar a sua forja.',
      learnSmith: 'Você poderia me ensinar a forjar?',
      ore: 'Tenho minério para vender.',
      bye: 'Não vou atrapalhar mais.',
      trade: 'Posso ver o que você tem?',
      train: 'Pode me ensinar algo?',
      heal: 'Pode me dar um remendo?',
      mana: 'Você tem algo para mana?',
      who: 'Quem é você, se não se importa que eu pergunte?',
      rumor: 'Ouviu algo ultimamente?',
      ready: 'Acha que estou pronto para mais?',
      ready__f: 'Acha que estou pronta para mais?',
      brew: 'Pode me preparar alguma coisa?',
      play: 'Estou dentro.'
    },
    sunfordSmith: {
      forge: {
        '1': 'A forja está quente. Cuidado com os dedos.'
      },
      learnSmith: {
        '2': 'Golpeie quando o metal brilhar mais. Errou, e vira sucata. Vai.',
        '1': 'Forjar? Hum. Segure o martelo assim, não como um porrete.'
      },
      ore: { '1': 'Minério, é? Mostra aí. Pago por pepita, peso justo.' },
      sellBack: { '1': 'Peso justo, moeda justa. Traga mais quando achar.' },
      forgeBack: {
        '1': 'Nada mal. Nada bom também. Continue.'
      },
      hello: {
        '1': 'Nunca vi você por aqui. Foi você que limpou a estrada?',
        '2': 'Bram. A forja é minha. Se precisar de uma lâmina, venha falar comigo.'
      },
      kingDead: {
        '1': 'Ouvi dizer que o Rei Goblin morreu. Não vou sentir falta.'
      },
      kingPact: {
        '1': 'Goblins negociando na praça. Nunca pensei que veria isso.'
      },
      kingRansom: {
        '1': 'Você deixou o Rei Goblin ficar com a coroa. Ele volta, sabia?'
      },
      ending: {
        '1': 'O reino inteiro fala de você. Ainda precisa de uma pedra de amolar?'
      },
      again: {
        '1': 'De volta. Em que posso ajudar?'
      },
      trade: {
        '1': 'Aço simples, preço justo. Dê uma olhada.'
      },
      who: {
        '1': 'Bram. Uns trinta anos nesta bigorna.',
        '2': 'Ferraduras, arados, uma espada de vez em quando. Ultimamente, quase só espadas.'
      },
      gear: {
        '1': 'Um escudo, se pretende apanhar. A maioria apanha.',
        '2': 'Aço pesado pede braço forte. Trabalhe a Força primeiro.',
        say: 'O que devo levar lá fora?'
      },
      rumor: {
        plains: {
          '1': 'Bandidos na estrada das planícies. Eu começaria por lá, se fosse você.'
        },
        hollows: {
          '1': 'Os goblins vêm das Grutas, depois das planícies. O rei deles está lá embaixo.'
        },
        woods: {
          '1': 'A leste das planícies fica o Bosque Sussurrante. Dizem que as árvores se mexem.'
        },
        siege: {
          '1': 'Tem fumaça na direção de Oakhaven. Um exército acampou nos arredores.'
        },
        north: {
          '1': 'O aço de Ironhold está descendo a estrada de novo. Melhor que o meu, pra ser sincero.'
        }
      },
      shopBack: {
        '1': 'Cuide bem dele que ele cuida de você.'
      },
      bye: {
        '1': 'Vá com cuidado.'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': 'Ah, olá! Vai comprar ou só olhar? As duas coisas servem.',
        '2': 'Sou a Tilly. Anéis, amuletos, miudezas de todo canto.'
      },
      rival: {
        '1': 'Viu a barraca do goblin? Os preços dele são menores que os meus. Não é justo.'
      },
      again: {
        '1': 'Aí está você! Separei umas coisas que acho que você vai gostar.'
      },
      trade: {
        '1': 'Dê uma olhada. Esse aí dá sorte. Provavelmente.'
      },
      who: {
        '1': 'Eu ando pelas estradas e compro o que as pessoas querem se livrar.',
        '2': 'E às vezes eu acho coisas. Bandido deixa muita coisa cair quando foge.'
      },
      trinkets: {
        '1': 'Dá pra usar dois, um em cada mão. Tudo soma lá fora.',
        say: 'Pra que servem os berloques, afinal?'
      },
      stolen: {
        '1': 'Ah. Você tem um jeito de perguntar, hein?',
        '2': 'Fique com este anel e não vamos falar de onde eu o achei.',
        say: 'De onde veio tudo isso, de verdade?'
      },
      rumor: {
        arenaShut: {
          '1': 'Tem um coliseu antigo ao sul. Trancado enquanto os goblins atacam.'
        },
        arenaOpen: {
          '1': 'O coliseu abriu de novo. Oito ondas, dizem. O povo aposta nisso.'
        },
        east: {
          '1': 'Oakhaven paga bem por qualquer coisa que brilhe. Fica a leste, depois do bosque.'
        }
      },
      shopBack: {
        '1': 'Volte quando a bolsa estiver mais pesada!'
      },
      bye: {
        '1': 'Boa viagem. Segure bem o seu dinheiro lá fora.'
      }
    },
    trainerAegis: {
      hello: {
        '1': 'Endireite-se. Você fala com um cavaleiro da Ordem de Ferro.',
        '2': 'Ser Aldric. Eu ensino a ficar entre os outros e o perigo.'
      },
      saved: {
        '1': 'Oakhaven continua de pé, e soube que você estava na muralha. Muito bem.'
      },
      fallen: {
        '1': 'Você abriu o portão de Oakhaven. Não vou fingir que esqueci. O que quer?'
      },
      dragon: {
        '1': 'Você matou o dragão do pico? Eu gostaria de ter visto.'
      },
      friend: {
        '1': 'A Ordem tem boa opinião de você. Para os amigos dela, minhas lições custam menos.'
      },
      foe: {
        '1': 'A Ordem chama você de inimigo. Eu ensino mesmo assim. A escolha é minha, não dela.',
        '1__f': 'A Ordem chama você de inimiga. Eu ensino mesmo assim. A escolha é minha, não dela.'
      },
      again: {
        '1': 'Voltou para mais treino?'
      },
      train: {
        '1': 'Bom. Observe bem, só vou mostrar uma vez.'
      },
      class: {
        '1': 'Recebemos os golpes que eram para os outros. É simples, e é difícil.',
        '2': 'Você vai precisar de Força para o escudo e Vigor para segurá-lo.',
        say: 'O que um Cavaleiro da Égide faz, exatamente?'
      },
      ready: {
        strong: {
          '1': 'Você é forte o bastante para quase tudo que sei. Continue com o Vigor.'
        },
        able: {
          '1': 'Está pronto para a próxima lição. Não suba à cabeça.',
          '1__f': 'Está pronta para a próxima lição. Não suba à cabeça.'
        },
        weak: {
          '1': 'Ainda não. Você cansaria antes do escudo. Mais Força, mais Vigor.'
        }
      },
      order: {
        '1': 'Mantemos as estradas seguras e a lei em mãos. Alguns dizem que com mão pesada demais.',
        '2': 'Fique do nosso lado, e nossos armeiros e mestres vão se lembrar de você.',
        say: 'Fale-me da Ordem de Ferro.'
      },
      trainBack: {
        '1': 'Treine até ficar chato. Depois continue.'
      },
      bye: {
        '1': 'Vá com cuidado.'
      }
    },
    trainerPyro: {
      hello: {
        '1': 'Ah, um aluno? Maravilha. Talvez dê um passo para trás.',
        '1__f': 'Ah, uma aluna? Maravilha. Talvez dê um passo para trás.',
        '2': 'Sou a Ember Wren. Ensino fogo. Quase sempre ele faz o que eu peço.'
      },
      core: {
        '1': 'Você deu o núcleo ao Círculo! Mal posso esperar para ver o que vamos aprender.'
      },
      friend: {
        '1': 'O Círculo fala bem de você. Isso quer dizer desconto, aliás.'
      },
      foe: {
        '1': 'O Círculo não está contente com você. Eu ensino mesmo assim. Em silêncio.'
      },
      again: {
        '1': 'Voltou! Pronto para acender alguma coisa?',
        '1__f': 'Voltou! Pronta para acender alguma coisa?'
      },
      train: {
        '1': 'Certo. Olhe minhas mãos e mantenha as mangas longe de mim.'
      },
      class: {
        '1': 'Pôr fogo nas coisas, na maioria. Depois fazer o fogo se espalhar para onde você quer.',
        '2': 'Vem tudo da Inteligência. Quanto mais afiada a mente, mais quente a chama.',
        say: 'O que um piromante faz, exatamente?'
      },
      ready: {
        strong: {
          '1': 'Sinceramente? Você poderia ensinar parte disso. Pegue o que quiser.'
        },
        able: {
          '1': 'Está pronto para o próximo feitiço. Venha, eu mostro.',
          '1__f': 'Está pronta para o próximo feitiço. Venha, eu mostro.'
        },
        weak: {
          '1': 'Ainda não, receio. Falta Inteligência, ou o fogo assume o controle.'
        }
      },
      circle: {
        '1': 'Estudiosos. Estudamos do que o mundo é feito. Parte disso explode.',
        say: 'Quem são os do Círculo do Éter?'
      },
      trainBack: {
        '1': 'Vá praticar. Num lugar que não pegue fogo, por favor.'
      },
      bye: {
        '1': 'Se cuide!'
      }
    },
    elderMara: {
      hello: {
        '1': 'Então é você o da estrada. Venha cá, deixe eu olhar.',
        '1__f': 'Então é você a da estrada. Venha cá, deixe eu olhar.',
        '2': 'Sou a Mara. Cuido desta cidade há... ah, uns quarenta anos.'
      },
      slain: {
        '1': 'As Grutas estão quietas. Foi uma coisa dura, mas dormimos por causa dela.'
      },
      pact: {
        '1': 'Goblins vendendo na minha praça. Foi você que convenceu eles, não foi?'
      },
      ransom: {
        '1': 'Você pegou o ouro dele e deixou a coroa. Não vou fingir que não fiquei decepcionada.'
      },
      saved: {
        '1': 'Chegou notícia de Oakhaven. O portão resistiu. Fico feliz que você estava lá.'
      },
      fallen: {
        '1': 'Dizem que Oakhaven queimou. Prefiro não ouvir como. Hoje não.'
      },
      ending: {
        '1': 'Dizem que você decidiu o destino da Fortaleza do Pavor. Da nossa estradinha até isso.'
      },
      again: {
        '1': 'Sente um instante. A estrada vai continuar lá.'
      },
      reward: {
        '1': 'Você segurou a estrada quando nossa milícia não conseguiu. A cidade juntou um pouco.',
        '2': 'Não é muito. É o que pudemos dar.',
        say: 'Disseram que você queria me ver?'
      },
      quest: {
        '1': 'Os ataques vêm das Grutas dos Goblins. Eles se coroaram um rei.',
        '2': 'E você quer ele morto?',
        '3': 'Quero que os ataques parem. Como... isso é você que decide, lá embaixo.',
        '4': 'As Grutas ficam logo depois das planícies. Por favor, tenha cuidado.',
        say: 'O que preocupa Sunford?'
      },
      king: {
        say: 'Sobre o Rei Goblin...',
        slay: {
          '1': 'Ele se foi, e as caravanas voltaram a rodar. Não vou perguntar como foi.'
        },
        pact: {
          '1': 'Um pacto de comércio. Minha mãe teria desmaiado. Mesmo assim, comércio é melhor que funeral.'
        },
        ransom: {
          '1': 'Ouro acaba rápido. Rancor não. Lembre disso quando os ataques recomeçarem.'
        }
      },
      town: {
        '1': 'Fazendeiros, na maioria. Um ferreiro, uma curandeira, dois mestres que nos aguentam.',
        '2': 'Descanse aqui entre as viagens. É pra isso que serve um lar.',
        say: 'Fale-me de Sunford.'
      },
      next: {
        say: 'Para onde devo ir agora?',
        plains: {
          '1': 'A estrada das planícies, primeiro. Sem as caravanas, a gente não come.'
        },
        hollows: {
          '1': 'As Grutas dos Goblins. Nada está seguro enquanto os ataques continuarem.'
        },
        woods: {
          '1': 'Para leste, pelo Bosque Sussurrante. Esse é o caminho para Oakhaven.'
        },
        oakhaven: {
          '1': 'Oakhaven está sitiada. Se os arredores caírem, a cidade cai junto.'
        },
        north: {
          '1': 'Ao norte, acho. Os Penhascos de Cinza, e Ironhold mais além. Só fica mais difícil.'
        }
      },
      bye: {
        '1': 'Volte para nós inteiro. É só o que peço.',
        '1__f': 'Volte para nós inteira. É só o que peço.'
      },
      map: {
        '1': 'O mapa do Capitão Rook! Ele rasgou o mapa e escondeu os pedaços antes que os goblins o pegassem.',
        '2': "Encontre seis dos pedaços, e o X mostra o caminho: em algum lugar dos Penhascos de Cinza. Cave lá pelo ouro.",
        say: 'Encontrei um pedaço de um mapa antigo.'
      }
    },
    sunfordHealer: {
      hello: {
        '1': 'Fique parado um instante. Não, você está bem. Hábito, desculpe.',
        '1__f': 'Fique parada um instante. Não, você está bem. Hábito, desculpe.',
        '2': 'Sou a Irmã Lune. Remendo tudo que a estrada quebra.'
      },
      again: {
        '1': 'Ainda inteiro? Ótimo. Sente-se mesmo assim.',
        '1__f': 'Ainda inteira? Ótimo. Sente-se mesmo assim.'
      },
      heal: {
        '1': 'Sente-se, descanse um pouco. Encho seus frascos antes de você ir.'
      },
      mana: {
        '1': 'Este é amargo. Beba quando seus feitiços acabarem.'
      },
      brew: {
        '1': 'Mostre suas ervas. Vou misturar algo com gosto melhor que o do meu tônico de mana.'
      },
      potions: {
        '1': 'Você leva alguns frascos para cada luta. Beba antes de precisar, não depois.',
        '2': 'Se quiser levar mais, posso vender um cinto maior.',
        say: 'Como funcionam as poções?'
      },
      rumor: {
        goblins: {
          '1': 'Os goblins passam alguma coisa nas pedras das fundas. Se passar mal, volte aqui.'
        },
        spiders: {
          '1': 'Esta semana tratei três picadas de aranha vindas do Bosque. Cuidado lá.'
        },
        burns: {
          '1': 'Soldados não param de descer do norte com queimaduras. Os Penhascos de Cinza, dizem.'
        }
      },
      healBack: {
        '1': 'Mantenha o cinto cheio e a cabeça baixa.'
      },
      brewBack: {
        '1': 'Cuidado, estão quentes. Não beba todos de uma vez.'
      },
      bye: {
        '1': 'Se cuide lá fora.'
      }
    },
    goblinTrader: {
      hello: {
        '1': 'Você é o que fez o pacto. Meu rei diz que você é bem-vindo aqui.',
        '1__f': 'Você é a que fez o pacto. Meu rei diz que você é bem-vinda aqui.',
        '2': 'Sou Grik. Vendo o que goblins fazem. Bom trabalho, preço justo.'
      },
      again: {
        '1': 'Amigo. Bom ver você de novo.',
        '1__f': 'Amiga. Bom ver você de novo.'
      },
      trade: {
        '1': 'Olhe, por favor. Minha família fez isto.'
      },
      king: {
        '1': 'Ele come bem agora. Sem mais ataques. Meu povo tem menos fome.',
        '2': 'Ele fala de você com frequência. Com respeito.',
        say: 'Como vai o seu rei?'
      },
      town: {
        '1': 'O povo ainda encara. Mas o padeiro me dá torta. Eu gosto de torta.',
        say: 'Está gostando de Sunford?'
      },
      rumor: {
        crags: {
          '1': 'Meus primos cavam na rocha negra ao norte. Dizem que agora o fogo anda por lá.'
        },
        deep: {
          '1': 'Algo está acordando nos lugares fundos. Goblins sentem no chão.'
        }
      },
      shopBack: {
        '1': 'Obrigado. Volte sempre.'
      },
      bye: {
        '1': 'Vá em segurança, amigo.',
        '1__f': 'Vá em segurança, amiga.'
      }
    },
    captainHale: {
      hello: {
        '1': 'Mais uma espada. Ótimo. Precisamos de todas que pudermos.',
        '2': 'Capitão Hale. Comando o que resta da guarda de Oakhaven.'
      },
      saved: {
        '1': 'O portão resistiu. Trezentos anos, e mais um. Eu devo isso a você.'
      },
      ending: {
        '1': 'Dizem que você decidiu a Fortaleza do Pavor. Minhas muralhas parecem pequenas perto disso.'
      },
      again: {
        '1': 'As muralhas ainda estão de pé. Por hoje, pelo menos.'
      },
      after: {
        '1': 'Bom ver você. Oakhaven não esqueceu.'
      },
      quest: {
        '1': 'Ruim. Um senhor da guerra chamado Krag nos cercou, e ele não luta de graça.',
        '2': 'Quem está pagando?',
        '3': 'O Sindicato das Cinzas. Querem uma cidade só deles, e a nossa tem muralhas.',
        '4': 'Destrua o acampamento dele nos Arredores de Oakhaven. É lá que isso termina, de um jeito ou de outro.',
        say: 'Quão ruim está?'
      },
      siege: {
        '1': 'Ofereceram a você um terço da cidade, não foi? A mim ofereceram um quarto.',
        '2': 'O Sindicato vai atrás de você agora. Cuidado com as costas nas estradas.',
        say: 'Sobre o cerco...'
      },
      town: {
        '1': 'Uma cidade de comércio. Tudo que vai das planícies às montanhas paga pedágio aqui.',
        '2': 'Por isso todo mundo a quer. E por isso eu não largo.',
        say: 'Fale-me de Oakhaven.'
      },
      order: {
        '1': 'Respondo a Oakhaven. A Ordem e eu concordamos quase sempre. Não sempre.',
        say: 'Você responde à Ordem de Ferro?'
      },
      rumor: {
        crags: {
          '1': 'Ao norte do bosque o chão é negro e arde. Os Penhascos de Cinza. Cultistas, na maioria.'
        },
        mines: {
          '1': 'Ironhold parou de mandar aço. Tem algo errado nas minas deles.'
        },
        north: {
          '1': 'O extremo norte ficou quieto. Pela minha experiência, isso nunca é bom.'
        }
      },
      bye: {
        '1': 'Mantenha a espada por perto.'
      }
    },
    oakArmorer: {
      forge: {
        '1': 'A bigorna é sua. Faça algo que aguente.'
      },
      learnSmith: {
        '2': 'Observe o brilho. Golpeie no coração dele, três vezes, e o metal se lembra.',
        '1': 'Quer aprender o ofício? Ótimo. Oakhaven precisa de cada martelo.'
      },
      ore: { '1': 'Minério bruto! O arsenal nunca tem o bastante. Me venda o que puder.' },
      sellBack: { '1': 'Cada pepita vai para a muralha. Obrigado.' },
      forgeBack: {
        '1': 'Bom aço. As muralhas agradecem.'
      },
      hello: {
        '1': 'Se procura um elmo, sinto muito. Estão todos na muralha.',
        '2': 'Odo. Faço armaduras. Não tenho dormido muito.'
      },
      again: {
        '1': 'Ainda aqui. Ainda sem quase tudo.'
      },
      trade: {
        '1': 'Metade do meu estoque foi para a muralha. Leve o que sobrou, se servir.'
      },
      who: {
        '1': 'Visto esta cidade há vinte anos. Nunca vi tudo sendo usado ao mesmo tempo.'
      },
      armor: {
        '1': 'Placas, se você aguenta firme. Couro, se se mexe. Mantos, se é rápido.',
        '1__f': 'Placas, se você aguenta firme. Couro, se se mexe. Mantos, se é rápida.',
        say: 'Que armadura devo usar?'
      },
      rumor: {
        backRoom: {
          '1': 'Se o cerco acabar, abro o depósito dos fundos. As placas boas estão lá.'
        }
      },
      shopBack: {
        '1': 'Vai aguentar. Até agora aguentou.'
      },
      bye: {
        '1': 'Cabeça baixa lá fora.'
      }
    },
    oakMasterArmorer: {
      forge: {
        '1': 'O fogo está aceso e esperando. Pode ir.'
      },
      learnSmith: {
        '2': 'Três golpes, cada um no coração do brilho. Esse é todo o segredo.',
        '1': 'Desde o cerco, ensino qualquer um que pedir. Venha, fique aqui.'
      },
      ore: { '1': 'Mais minério para as muralhas? Pago cada pepita que você puder dar.' },
      sellBack: { '1': 'Deus te abençoe. São mais placas para as muralhas.' },
      forgeBack: {
        '1': 'Cada golpe deixa você melhor. Volte quando quiser.'
      },
      hello: {
        '1': 'Aí está você! Entre. O depósito dos fundos está aberto, e aberto para você.',
        '2': 'Mestre Odo, me chamam agora. Engraçado o que um pouco de paz faz pelos negócios.'
      },
      ending: {
        '1': 'Do nosso portão até a Fortaleza do Pavor. Conto pra todo mundo que ajustei a sua armadura.'
      },
      again: {
        '1': 'Bom ver você. O que vai ser hoje?'
      },
      trade: {
        '1': 'A armadura boa está na vitrine. Você mais do que merece dar uma olhada.'
      },
      town: {
        '1': 'Agitada. Barulhenta. Cheia de mercadores reclamando do pedágio.',
        '2': 'É maravilhoso. Faz semanas que não tenho uma hora de sossego.',
        say: 'Como vai a cidade?'
      },
      rumor: {
        mines: {
          '1': 'Meu aço vem de Ironhold, e eles ficaram calados. Alguém devia ver as minas deles.'
        },
        tundra: {
          '1': 'O melhor minério que já trabalhei veio da tundra. Os homens que o acharam não voltaram.'
        }
      },
      shopBack: {
        '1': 'Se não ficar bom, traga de volta. Eu ajeito.'
      },
      bye: {
        '1': 'Você é sempre bem-vindo aqui.',
        '1__f': 'Você é sempre bem-vinda aqui.'
      }
    },
    oakWeapons: {
      hello: {
        '1': 'Olhando ou comprando? Tanto faz. Só não toque nos gumes.',
        '2': 'Senna. Vendo lâminas. O que você faz com elas é problema seu.'
      },
      saved: {
        '1': 'Então o cerco acabou. Bom para a cidade. A guerra era melhor para o meu negócio, veja bem.'
      },
      again: {
        '1': 'Voltou atrás de algo mais afiado?'
      },
      trade: {
        '1': 'Afiadas, equilibradas e com preço justo. Fique à vontade.'
      },
      who: {
        '1': 'Vendi para os dois lados de três guerras. Ainda estou aqui. A maioria deles não.'
      },
      rumor: {
        krag: {
          '1': 'Os homens do Krag carregam bom aço. Dinheiro do Sindicato. Vale pegar, se tiver chance.'
        },
        which: {
          '1': 'Lâminas rápidas querem Destreza. Arcos e armas de fogo querem Técnica. Saiba qual você é.'
        }
      },
      shopBack: {
        '1': 'Mantenha oleada. Ferrugem estraga um bom gume mais rápido que osso.'
      },
      bye: {
        '1': 'Tente não morrer me devendo dinheiro.'
      }
    },
    trainerShadow: {
      hello: {
        '1': 'Você não me ouviu chegar. A maioria não ouve.',
        '2': 'Me chamam de Sussurro. Ensino a não ser visto.'
      },
      fallen: {
        '1': 'A cidade está mais quieta agora. Menos guardas. Trabalho mais fácil, para alguns de nós.'
      },
      friend: {
        '1': 'O Sindicato conta você como amigo. Amigos pagam menos. Lembre disso.',
        '1__f': 'O Sindicato conta você como amiga. Amigos pagam menos. Lembre disso.'
      },
      foe: {
        '1': 'O Sindicato quer você morto. Me pagaram para ensinar, não para matar. Então, lições.',
        '1__f': 'O Sindicato quer você morta. Me pagaram para ensinar, não para matar. Então, lições.'
      },
      again: {
        '1': 'Você ainda faz barulho demais. Vamos trabalhar nisso.'
      },
      train: {
        '1': 'Em silêncio, então. Olhe meus pés, não minhas mãos.'
      },
      class: {
        '1': 'Alguém que já está atrás de você. Entra, um corte, e some.',
        '2': 'Destreza importa mais. Técnica, se quiser que o corte conte.',
        say: 'O que é uma Lâmina Sombria?'
      },
      ready: {
        strong: {
          '1': 'Você se move bem agora. Leve o resto. Traga um pouco de Técnica para a fumaça.'
        },
        able: {
          '1': 'Suas mãos são rápidas o bastante. Próximo passo.'
        },
        weak: {
          '1': 'Ainda não. Você pisa pesado. Trabalhe a Destreza.'
        }
      },
      syndicate: {
        '1': 'Gente que percebeu que a lei tem preço. Não julgo. Só recebo.',
        say: 'Quem são os do Sindicato das Cinzas?'
      },
      trainBack: {
        '1': 'Agora pratique onde ninguém possa ver.'
      },
      bye: {
        '1': 'Você nunca me viu.'
      }
    },
    trainerSovereign: {
      hello: {
        '1': 'Pode se aproximar. Aí, está perto o bastante.',
        '2': 'Lorde Castellan, da família mais antiga de Oakhaven. Ensino comando.'
      },
      saved: {
        '1': 'Minha cidade está de pé, e com ela o nome da minha família. Você tem minha gratidão. De verdade.'
      },
      friend: {
        '1': 'Um amigo da Ordem. Vou reduzir meu preço. Por favor, não espalhe isso.',
        '1__f': 'Uma amiga da Ordem. Vou reduzir meu preço. Por favor, não espalhe isso.'
      },
      foe: {
        '1': 'A Ordem tem seu nome numa lista. Ensino mesmo assim. Moeda é moeda.'
      },
      again: {
        '1': 'Ah, você de novo. Continuamos?'
      },
      train: {
        '1': 'Muito bem. Observe como se dá uma ordem, e como se segue.'
      },
      class: {
        '1': 'Alguém que não luta sozinho. Você chama os guardas, e eles lutam por você.',
        '2': 'Exige Carisma. Ninguém segue um líder que não consegue ouvir.',
        say: 'O que é um Grão-Soberano?'
      },
      ready: {
        strong: {
          '1': 'Você tem presença de verdade agora. Leve o resto das minhas lições.'
        },
        able: {
          '1': 'Sua voz alcança longe. Está pronto para a próxima lição.',
          '1__f': 'Sua voz alcança longe. Está pronta para a próxima lição.'
        },
        weak: {
          '1': 'Receio que ninguém ainda o seguiria. Trabalhe o Carisma.',
          '1__f': 'Receio que ninguém ainda a seguiria. Trabalhe o Carisma.'
        }
      },
      family: {
        '1': 'Construímos as muralhas onde o Capitão Hale se apoia. Ele esquece. Eu lembro.',
        say: 'Fale-me da sua família.'
      },
      trainBack: {
        '1': 'Vá, então. Lidere alguém.'
      },
      bye: {
        '1': 'Bom dia.'
      }
    },
    oakHealer: {
      hello: {
        '1': 'Próximo! Ah, você veio andando. Que mudança agradável.',
        '2': 'Irmão Fenn. Quarenta feridos na muralha, e só um de mim.'
      },
      saved: {
        '1': 'Nenhum ferido novo há três dias. Mal sei o que fazer comigo.'
      },
      again: {
        '1': 'Você de novo, e nas próprias pernas. Ótimo.'
      },
      heal: {
        '1': 'Deite aqui, na cama limpa. Pronto. Frascos cheios, pode ir.'
      },
      mana: {
        '1': 'Poção de mana. Tem gosto de moeda velha, mas funciona.'
      },
      potions: {
        '1': 'Com um cinto mais longo, sim. Eu vendo. Encher os frascos é de graça.',
        say: 'Posso levar mais poções?'
      },
      rumor: {
        archers: {
          '1': 'Os arqueiros do Krag miram baixo. Continue se mexendo e quase sempre vão errar.'
        },
        north: {
          '1': 'Estou vendo queimaduras, congelamento e um homem que jura que uma estátua o mordeu.'
        }
      },
      healBack: {
        '1': 'Pode ir. Da próxima vez, venha bater papo em vez de levar ponto.'
      },
      bye: {
        '1': 'Se cuide. E coma alguma coisa.'
      }
    },
    blackMarket: {
      hello: {
        '1': 'Aqui não tem nomes. Mas sei quem abriu o portão. Todo mundo sabe.',
        '2': 'Pode me chamar de Receptador. Tudo aqui veio de algum lugar.'
      },
      foe: {
        '1': 'O Sindicato não gosta de você no momento. Seu ouro, porém, é bem-vindo.'
      },
      again: {
        '1': 'De volta. Ninguém seguiu você, espero?'
      },
      trade: {
        '1': 'Sem perguntas, dos dois lados. O Sindicato leva a parte dele, você leva a mercadoria.'
      },
      who: {
        '1': 'Antes do incêndio eu vendia velas. Trabalho honesto. Não dava dinheiro.'
      },
      armor: {
        '1': 'Os armeiros se foram, amigo. Você sabe melhor que eu por quê.',
        '1__f': 'Os armeiros se foram, amiga. Você sabe melhor que eu por quê.',
        say: 'Tem armaduras à venda?'
      },
      rumor: {
        citadel: {
          '1': 'Uma fortaleza apareceu no extremo norte ano passado. Ninguém a construiu.'
        },
        crystals: {
          '1': 'Alguém está comprando todo cristal do Vazio que encontra. Não somos nós. Isso me preocupa.'
        }
      },
      shopBack: {
        '1': 'Você nunca esteve aqui.'
      },
      bye: {
        '1': 'Olhe onde pisa. Os escombros se mexem.'
      }
    },
    trainerBlood: {
      hello: {
        '1': 'Uma visita. Por favor, não toque nos potes.',
        '2': 'Doutor Sangrel. Os novos donos de Oakhaven não perguntam o que ensino. É relaxante.'
      },
      found: {
        '1': 'Você me encontrou. Poucos vêm procurar um doutor num lugar assim.',
        '2': 'Doutor Sangrel. Cidades queimam gente como eu, então trabalho onde não há nenhuma.'
      },
      friend: {
        '1': 'O Sindicato fala por você. Aos amigos dele cobro menos. Meus padrões continuam os mesmos.'
      },
      foe: {
        '1': 'O Sindicato pagaria bem pelo seu sangue. Prefiro que você o gaste aqui.'
      },
      again: {
        '1': 'Você está pálido. Ótimo. Combina com o trabalho.',
        '1__f': 'Você está pálida. Ótimo. Combina com o trabalho.'
      },
      train: {
        '1': 'Arregace a manga. Vai doer. É meio que esse o objetivo.'
      },
      class: {
        '1': 'Você paga pelo poder com a própria saúde, e depois toma de volta dos inimigos.',
        '2': 'Vigor é o que você tem para gastar. Inteligência é o quão bem você gasta.',
        say: 'O que é um Alquimista de Sangue?'
      },
      ready: {
        strong: {
          '1': 'Uma constituição notável. Pode aprender quase tudo.'
        },
        able: {
          '1': 'Você está resistente o bastante para a próxima lição.'
        },
        weak: {
          '1': 'Você desmaiaria no primeiro corte. Desenvolva o Vigor primeiro, por favor.'
        }
      },
      jars: {
        '1': 'Amostras. Dadas de bom grado, na maioria.',
        say: 'O que tem nos potes?'
      },
      trainBack: {
        '1': 'Anote tudo, por favor. Gostaria de saber como vai.'
      },
      bye: {
        '1': 'Mantenha-se saudável. Falo sério.'
      }
    },
    syndicateBoss: {
      hello: {
        '1': 'Então é você que abriu o portão. Sente-se. Você merece uma cadeira.',
        '2': 'Me chamam de Madame Ash. Oakhaven é nossa agora. Em parte graças a você.'
      },
      throneOurs: {
        '1': 'A Fortaleza do Pavor, em nossas mãos. Você valeu cada moeda.'
      },
      throneLost: {
        '1': 'Você deu o trono a outra pessoa. Vamos conversar sobre isso. Hoje não.'
      },
      foe: {
        '1': 'Você trabalhou contra nós. Sente-se mesmo assim. Gosto de saber com quem lido.'
      },
      again: {
        '1': 'De volta. O que o Sindicato pode fazer por você?'
      },
      cut: {
        '1': 'E você vai ter. Uma parte de uma ruína, por ora. Aqui está a desta temporada.',
        '2': 'Vai crescer. Uma ruína rende muito bem quando você é dono do único mercado dela.',
        say: 'Me prometeram uma parte de Oakhaven.'
      },
      syndicate: {
        '1': 'O que todo mundo quer. Só não fingimos o contrário.',
        '2': 'Continue amigável, e o Sussurro e o Doutor cobram menos de você.',
        say: 'O que o Sindicato realmente quer?'
      },
      order: {
        '1': 'Claro que estão. Você queimou uma cidade deles. Leve poções extras.',
        say: 'A Ordem de Ferro está atrás de mim.'
      },
      rumor: {
        core: {
          '1': 'Os anões acharam algo nas minas. Um núcleo. Traga para nós e diga seu preço.'
        },
        sold: {
          '1': 'O núcleo chegou em segurança. Você ficaria surpreso com o que ele faz com uma fechadura.',
          '1__f': 'O núcleo chegou em segurança. Você ficaria surpresa com o que ele faz com uma fechadura.'
        },
        north: {
          '1': 'Tudo que vale a pena foi para o norte. Nós também.'
        }
      },
      bye: {
        '1': 'Não seja um estranho. Estranhos a gente vigia.',
        '1__f': 'Não seja uma estranha. Estranhos a gente vigia.'
      }
    },
    forgemaster: {
      hello: {
        '1': 'Você subiu pelas minas. Sinto o pó em você.',
        '2': 'Dorn. Mestre da Forja de Ironhold. E tenho um problema do tamanho de uma montanha.'
      },
      destroyed: {
        '1': 'A luz apagou e os golens viraram sucata. Meus mineiros cantaram ontem à noite. Primeira vez em um ano.'
      },
      studied: {
        '1': 'Fogo azul nas minhas forjas e eruditos de manto nos meus salões. Pelo menos o trabalho é bom.'
      },
      sold: {
        '1': 'Você vendeu. Os golens ainda andam, e minhas minas ainda são um túmulo. Me deixe em paz.'
      },
      ending: {
        '1': 'Então o trono está decidido. Bom. Quem sabe agora a gente volta a cavar.'
      },
      again: {
        '1': 'O que foi? A forja não espera.'
      },
      quest: {
        '1': 'Cavamos atrás de ferro e achamos um coração. Um núcleo de éter. Dá pra sentir batendo.',
        '2': 'E os golens?',
        '3': 'Eles se movem no ritmo dele. Três poderes escreveram pedindo. Não confio em nenhum.',
        '4': 'Você chega primeiro, no fundo das Minas de Ironhold. O que acontece depois é com você.',
        say: 'O que aconteceu lá embaixo nas minas?'
      },
      core: {
        say: 'Sobre o núcleo...',
        destroy: {
          '1': 'Você quebrou uma maravilha para salvar meu povo. A Ordem mandou armeiros. Eu mandei cerveja.'
        },
        study: {
          '1': 'O pessoal do Círculo é estranho, mas as armas deles atiram reto. Tudo bem.'
        },
        sell: {
          '1': 'Você fez isso por ouro. Espero que ele te esquente.'
        }
      },
      town: {
        '1': 'O melhor aço do reino, quando as minas funcionam.',
        '2': 'Pé-de-Pedra ensina a terra, Pim as máquinas. Os dois vão encher seu ouvido.',
        say: 'Fale-me de Ironhold.'
      },
      rumor: {
        tundra: {
          '1': 'A leste dos Penhascos a terra fica branca. A Tundra Gélida. Gigantes, e coisa pior.'
        },
        citadel: {
          '1': 'Meus batedores viram uma fortaleza ao norte que não existia ano passado. Não gosto disso.'
        },
        fortress: {
          '1': 'Tudo termina na Fortaleza do Pavor. Toda estrada ao norte leva até lá.'
        }
      },
      bye: {
        '1': 'Vá bem.'
      }
    },
    ironWeapons: {
      forge: {
        '1': 'Cuidado com as faíscas, e não toque no meu martelo bom.'
      },
      learnSmith: {
        '2': 'O brilho diz quando. Seu braço diz com que força. Três golpes.',
        '1__f': 'Uma moradora da superfície na bigorna? Bem, todo mundo começa de algum lugar.',
        '1': 'Um morador da superfície na bigorna? Bem, todo mundo começa de algum lugar.'
      },
      ore: { '1': 'Metal bom e honesto. Põe aqui, pago por pepita.' },
      sellBack: { '1': 'Troca justa. Ironhold sempre paga por metal bom.' },
      forgeBack: {
        '1': 'Um anão teria feito melhor. Mas não muito.'
      },
      hello: {
        '1': 'Cuidado com a vitrine. Essas têm fio dos dois lados.',
        '2': 'Hilda Hammerhand. Cada peça aqui foi forjada por mãos de anão.'
      },
      dragon: {
        '1': 'Você matou o dragão? Espero que tenha sido com uma das minhas lâminas.'
      },
      again: {
        '1': 'Voltou atrás de aço de verdade?'
      },
      trade: {
        '1': 'Forjado por anões. Se uma dessas quebrar, vou querer saber como.'
      },
      who: {
        '1': 'Minha mãe forjava para reis. Eu forjo para quem entrar pela porta.'
      },
      rumor: {
        golems: {
          '1': 'Aqueles golens lá embaixo são feitos do nosso próprio ferro. Dói, eu garanto.'
        },
        arm: {
          '1': 'Uma boa lâmina faz metade do trabalho. Sua Força tem que fazer o resto.'
        }
      },
      shopBack: {
        '1': 'Traga de volta cega e vou saber que você usou bem.'
      },
      bye: {
        '1': 'Golpeie forte.'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': 'Cuidado, essa está carregada. A maioria está, na verdade.',
        '2': 'Voss, o Inventor. O Círculo me mandou estudar o núcleo. Ele nos ensinou tanto.'
      },
      again: {
        '1': 'Ah, ótimo. Fiz algumas mudanças desde a sua última visita.'
      },
      trade: {
        '1': 'Tudo aqui saiu do estudo do núcleo. Só não aponte para mim.'
      },
      core: {
        '1': 'Aquele metal consegue pensar, um pouco. Tento não pensar nisso.',
        say: 'O que o núcleo ensinou a você?'
      },
      rumor: {
        heat: {
          '1': 'Armas de fogo funcionam com Técnica, e esquentam. Pergunte ao Pim sobre calor antes de queimar a mão.'
        }
      },
      shopBack: {
        '1': 'Me diga como ela se comporta. Estou fazendo anotações.'
      },
      bye: {
        '1': 'Cuidado com o coice.'
      }
    },
    ironArmor: {
      forge: {
        '1': 'A forja está pronta quando você estiver.'
      },
      learnSmith: {
        '2': 'Aquecer, golpear, virar. Três golpes, bem no brilho. Depois deixe esfriar.',
        '1': 'Placas são um trabalho de paciência. Vou mostrar o básico.'
      },
      ore: { '1': 'Deixa eu pesar. Escolha o que vai vender, eu conto as moedas.' },
      sellBack: { '1': 'Pesado e pago. Bom.' },
      forgeBack: {
        '1': 'Deixe esfriar antes de vestir.'
      },
      hello: {
        '1': 'Garrun. Armaduras nos suportes, anéis na bandeja.'
      },
      again: {
        '1': 'De volta. Do que precisa?'
      },
      trade: {
        '1': 'Essa placa segura o porrete de um gigante. Dê uma olhada.'
      },
      quiet: {
        '1': 'Pouca coisa que valha a pena dizer.',
        say: 'Você fala pouco, né?'
      },
      rumor: {
        giants: {
          '1': 'Gigantes na tundra. Porretes feito troncos. Eu levaria a placa pesada.'
        },
        demons: {
          '1': 'Demônios no norte. Fogo e garras. Eu levaria a placa pesada.'
        }
      },
      shopBack: {
        '1': 'Boa escolha.'
      },
      bye: {
        '1': 'Se cuide.'
      }
    },
    ironOrderArmor: {
      forge: {
        '1': 'Use a forja da Ordem com honra.'
      },
      learnSmith: {
        '2': 'Disciplina na bigorna, como no campo. Três golpes, fiéis ao brilho.',
        '1': 'A Ordem arma seus amigos. Vou ensinar você.'
      },
      ore: { '1': 'A Ordem compra minério para a guerra. Venda o que puder.' },
      sellBack: { '1': 'Seu pagamento foi registrado. A Ordem agradece.' },
      forgeBack: {
        '1': 'Bem forjado. Sirva bem com isso.'
      },
      hello: {
        '1': 'Foi você que destruiu o núcleo. A Ordem lembra disso.',
        '2': 'Sou o intendente da Ordem aqui. Nossos arsenais estão abertos para você.'
      },
      throneOurs: {
        '1': 'A Ordem mantém a Fortaleza do Pavor, graças a você. À vontade. Você merece.'
      },
      foe: {
        '1': 'A Ordem tem você numa lista. Minhas ordens dizem para vender a você mesmo assim. Eu cumpro.'
      },
      again: {
        '1': 'Do que precisa?'
      },
      trade: {
        '1': 'Leve o que precisar. A Ordem cuida dos seus.'
      },
      order: {
        '1': 'Nada, por ora. Isso não acontece sempre. Aproveite.',
        say: 'O que a Ordem quer de mim?'
      },
      rumor: {
        throne: {
          '1': 'A Ordem vai querer o trono da Fortaleza do Pavor. Vai lembrar de quem ajudou.'
        }
      },
      shopBack: {
        '1': 'Cuide bem. É propriedade da Ordem até você sangrar nela.'
      },
      bye: {
        '1': 'Prossiga.'
      }
    },
    trainerGeo: {
      hello: {
        '1': 'Devagar. A montanha não vai a lugar nenhum.',
        '2': 'Chamam-me Velho Pé-de-Pedra. Escuto o chão. Às vezes ele responde.'
      },
      core: {
        '1': 'A montanha parece diferente desde que você desceu lá. Mais calma, ou mais vazia.'
      },
      dragon: {
        '1': 'Ontem um dragão passou sobre o pico e nos deixou em paz. Obra sua, me disseram.'
      },
      again: {
        '1': 'Aí está você. Achei que voltaria.'
      },
      train: {
        '1': 'Finque os pés. Sente isso? Não? É por aí que começamos.'
      },
      class: {
        '1': 'Erguemos muros, fazemos brotar espinhos e quebramos o chão quando preciso.',
        '2': 'Força para mover a pedra. Inteligência para saber para onde ela quer ir.',
        say: 'O que um Geomante faz?'
      },
      ready: {
        strong: {
          '1': 'A pedra já conhece você. Aprenda o resto quando estiver pronto.',
          '1__f': 'A pedra já conhece você. Aprenda o resto quando estiver pronta.'
        },
        able: {
          '1': 'Você está firme o bastante para a próxima lição.'
        },
        weak: {
          '1': 'Ainda não. A pedra não se move por você. Desenvolva a Força.'
        }
      },
      factions: {
        '1': 'Nenhuma. Ordens e guildas vêm e vão. A montanha fica.',
        say: 'A qual facção você serve?'
      },
      trainBack: {
        '1': 'Sem pressa. O chão é paciente.'
      },
      bye: {
        '1': 'Ande com leveza.'
      }
    },
    trainerAether: {
      hello: {
        '1': 'Ah, espere, não toque nisso! Nem nisso. Fique no tapete, o tapete é seguro.',
        '2': 'Pim, o Mecânico. Construo armas de fogo, torres e um monte de medidores de calor.'
      },
      core: {
        '1': 'Você deu o núcleo ao Círculo! Quase não durmo desde então. No bom sentido.'
      },
      oracle: {
        '1': 'O Círculo está furioso por causa do oráculo. Eu só construo coisas. Prefiro não me meter.'
      },
      friend: {
        '1': 'Você é amigo do Círculo, então suas lições saem mais baratas. Eu cuidei da papelada.',
        '1__f': 'Você é amiga do Círculo, então suas lições saem mais baratas. Eu cuidei da papelada.'
      },
      foe: {
        '1': 'O Círculo diz que eu não devia ensinar você. Vou ensinar mesmo assim. Não conte a eles.'
      },
      again: {
        '1': 'Ah, que bom, você ainda tem todos os dedos.'
      },
      train: {
        '1': 'Certo. Segurança primeiro, depois a parte barulhenta.'
      },
      class: {
        '1': 'Armas de fogo, torres e um medidor de calor. Atirar, construir e aliviar antes de travar.',
        '2': 'Principalmente Técnica. Um pouco de Inteligência para as máquinas maiores.',
        say: 'O que é um Éter-Tec?'
      },
      ready: {
        strong: {
          '1': 'Você já manda bem com uma torre. Leve as máquinas grandes.'
        },
        able: {
          '1': 'Mãos firmes. Está pronto para a próxima.',
          '1__f': 'Mãos firmes. Está pronta para a próxima.'
        },
        weak: {
          '1': 'Sua mira ainda está meio trêmula. Ponha uns pontos em Técnica.'
        }
      },
      heat: {
        '1': 'Tudo trava por alguns segundos. Alivie cedo, alivie sempre. Confie em mim.',
        say: 'O que acontece se eu superaquecer?'
      },
      trainBack: {
        '1': 'E lembre de aliviar o calor antes que ele alivie você.'
      },
      bye: {
        '1': 'Tome cuidado lá fora!'
      }
    },
    ironHealer: {
      hello: {
        '1': 'Botas na porta, por favor. Acabei de varrer.',
        '2': 'Madre Brynja. Já consertei a maioria dos ossos quebrados desta montanha.'
      },
      ending: {
        '1': 'Você foi à Fortaleza do Pavor e voltou. Sente-se. Deixe eu olhar você.'
      },
      again: {
        '1': 'Ainda vivo. Ótimo. Sente.',
        '1__f': 'Ainda viva. Ótimo. Sente.'
      },
      heal: {
        '1': 'Beba isto, e não faça essa cara. Seus frascos estão cheios.'
      },
      mana: {
        '1': 'Tome. Tem gosto horrível. Beba quando a magia acabar, não antes.'
      },
      potions: {
        '1': 'Posso vender um cinto mais longo. Cinco frascos é o máximo que dá pra carregar e ainda correr.',
        say: 'Posso levar mais poções?'
      },
      rumor: {
        tundra: {
          '1': 'A tundra leva dedos das mãos e dos pés. Continue se mexendo, e não durma na neve.'
        },
        temple: {
          '1': 'Tem um templo submerso depois da tundra. As nagas de lá não fazem prisioneiros.'
        },
        rift: {
          '1': 'O que quer que esteja naquela fenda, não consigo costurar. Não deixe chegar em você.'
        }
      },
      healBack: {
        '1': 'Pode ir. E coma alguma coisa, você está magro demais.',
        '1__f': 'Pode ir. E coma alguma coisa, você está magra demais.'
      },
      bye: {
        '1': 'Volte inteiro.',
        '1__f': 'Volte inteira.'
      }
    },
    exiledSovereign: {
      hello: {
        '1': 'Você. Foi você que abriu meu portão.',
        '2': 'Agora ensino num porão, porque preciso comer. Não confunda isso com perdão.'
      },
      ending: {
        '1': 'Então o trono está decidido, e Oakhaven continua cinzas. Espero que tenha valido a pena.'
      },
      again: {
        '1': 'Voltou. Meu preço não mudou.'
      },
      train: {
        '1': 'Vou ensinar você a comandar. Se merece, é outra questão.'
      },
      class: {
        '1': 'Alguém que os outros seguem. Guardas vêm quando você chama e lutam à sua palavra.',
        '2': 'Funciona com Carisma. Você tem. É isso que torna tão difícil perdoar.',
        say: 'O que é um Grão-Soberano?'
      },
      ready: {
        strong: {
          '1': 'Você tem presença para tudo isso. Queria que a tivesse usado melhor.'
        },
        able: {
          '1': 'Está pronto para a próxima lição. Não vou fingir que estou contente.',
          '1__f': 'Está pronta para a próxima lição. Não vou fingir que estou contente.'
        },
        weak: {
          '1': 'Ninguém ainda seguiria você. Trabalhe o Carisma.'
        }
      },
      oakhaven: {
        '1': 'Trezentos anos. Minha família construiu aquelas muralhas.',
        '2': 'Por favor, não explique. Nada que você diga vai consertar isso.',
        say: 'Sobre Oakhaven...'
      },
      trainBack: {
        '1': 'Vá. Pratique em outra pessoa.'
      },
      bye: {
        '1': 'Me deixe, por favor.'
      }
    },
    trainerChrono: {
      fled: {
        '1': 'Você a matou. Vi isso chegando por anos, e ainda dói.',
        '2': 'Sou o Guardião das Horas. Vou ensinar você. Ela me disse que eu ensinaria.'
      },
      hello: {
        '1': 'Aí está você. Espero você há um tempo. Ou terei esperado.',
        '2': 'Sou o Guardião das Horas. Ensino a dobrar o tempo, um pouco.'
      },
      freed: {
        '1': 'Ela está livre. Pela primeira vez não sei o que vem depois. É maravilhoso.'
      },
      friend: {
        '1': 'O Círculo tem boa opinião de você, então as lições custam menos. Decidiram isso semana passada.'
      },
      foe: {
        '1': 'O Círculo está com raiva de você agora. Passa. Até lá, vamos manter isso quieto.'
      },
      again: {
        '1': 'Bem-vindo de volta. Você chegou na hora certa.',
        '1__f': 'Bem-vinda de volta. Você chegou na hora certa.'
      },
      train: {
        '1': 'Observe bem. Depois observe de novo, um instante antes.'
      },
      class: {
        '1': 'Seguramos um inimigo no tempo, apressamos um amigo e desfazemos um erro.',
        '2': 'Inteligência para ver o fio. Técnica para puxá-lo.',
        say: 'O que é um Tecelão do Tempo?'
      },
      ready: {
        strong: {
          '1': 'Você segura bem o fio. Leve o resto quando quiser.'
        },
        able: {
          '1': 'Está pronto. Percebi antes de você perguntar.',
          '1__f': 'Está pronta. Percebi antes de você perguntar.'
        },
        weak: {
          '1': 'O fio não para de escorregar. Mais Inteligência, e mais Técnica.'
        }
      },
      oracle: {
        say: 'Fale-me do oráculo.',
        freed: {
          '1': 'Ela via todos os finais, menos o dela. Agora vai descobrir.'
        },
        slain: {
          '1': 'Ela não resistiu. Já tinha visto. Por favor, não me pergunte de novo.'
        },
        waits: {
          '1': 'Ela vê todos os finais. É um peso para carregar. Seja gentil com ela.'
        }
      },
      trainBack: {
        '1': 'Vai fazer sentido depois. Costuma fazer.'
      },
      bye: {
        '1': 'Até nos encontrarmos de novo. Ou antes.'
      }
    },
    quest: {
      seal: {
        ask: { '1': "O Dragão Ancestral está morto, e a fenda se abre diante de você.", '2': "Você pode selá-la agora, para sempre. As feras voltariam a dormir.", '3': "Ou pode deixá-la entreaberta, e deixar os mais bravos se testarem contra o que passar por ela." },
        seal: { say: "Sele-a. Para sempre.", '1': "A fenda se fecha como uma ferida que cicatriza, e o céu silencia." },
        ajar: { say: "Deixe-a entreaberta. Estaremos prontos.", '1': "A fenda fica aberta uma fresta, e algo atrás dela ri." },
      },
      goblinKing: {
        ask: {
          '1': 'Pare. Por favor. Eu me rendo.',
          '2': 'Meu povo ataca porque tem fome. Essa é a verdade.',
          '3': 'Façamos um acordo em vez disso. O seu povo e o meu.'
        },
        slay: {
          '1': 'O Rei Goblin cai, e as Grutas se esvaziam.',
          '2': 'Sunford dorme mais tranquila, e a Ordem de Ferro ouve seu nome.',
          say: 'Sem acordos. Seus ataques terminam aqui.'
        },
        pact: {
          '1': 'Comércio. Sim. Eu juro, pela minha coroa.',
          '2': 'Comerciantes goblins se instalam na praça de Sunford, vendendo coisas que nenhum ferreiro de lá saberia fazer.',
          say: 'Pare os ataques e comercie com Sunford. Jure.'
        },
        ransom: {
          '1': 'Tudo? ...Está bem. Pegue e vá.',
          '2': 'Você sai com ouro goblin. Os ataques vão recomeçar, mas o Sindicato aprova.',
          say: 'Me dê seu tesouro e você fica com a coroa.'
        }
      },
      siege: {
        ask: {
          '1': 'Chega. Você luta bem, isso eu admito.',
          '2': 'O Sindicato paga muito melhor do que aquela cidade jamais pagará.',
          '3': 'Abra o portão para nós esta noite, e um terço de Oakhaven é seu.'
        },
        defend: {
          '1': 'Então o Sindicato vai caçar você em todas as estradas. Lembre que eu ofereci.',
          '2': 'O portão resiste. Oakhaven enriquece atrás dele, e seus armeiros lembram seu nome.',
          say: 'O portão fica fechado. Leve seu exército e vá embora.'
        },
        betray: {
          '1': 'Sensato. A Madame Ash vai gostar de saber.',
          '1__f': 'Sensata. A Madame Ash vai gostar de saber.',
          '2': 'Oakhaven queima. Nas ruínas abre um mercado negro, e um alquimista ensina em segredo.',
          '3': 'Os armeiros se foram, e a Ordem de Ferro chama você de traidor.',
          '3__f': 'Os armeiros se foram, e a Ordem de Ferro chama você de traidora.',
          say: 'Um terço da cidade. Tudo bem. O portão abre esta noite.'
        }
      },
      core: {
        ask: {
          '1': 'O Colosso é sucata. Nunca pensei que viveria para ver isso.',
          '2': 'E aí está o núcleo. Ainda zumbindo. Está quente, se você tocar.',
          '3': 'Você chegou primeiro. Então... o que fazemos com ele?'
        },
        destroy: {
          '1': 'A luz se apaga, e os golens caem onde estão.',
          '2': 'Em agradecimento, a Ordem de Ferro manda seus próprios armeiros a Ironhold.',
          say: 'Afaste-se. Vou quebrá-lo.'
        },
        study: {
          '1': 'Você sabe o bastante para mover o núcleo sem despertá-lo.',
          '2': 'Em uma estação, as forjas de Ironhold fabricam engenhos de éter que ninguém nunca viu.',
          say: 'O Círculo deveria estudá-lo. Acho que consigo carregá-lo com segurança.'
        },
        sell: {
          '1': 'Ouro. Pela coisa que matou meus mineiros. Pegue e vá.',
          '2': 'Uma fortuna muda de mãos. O núcleo continua aceso, e as minas nunca mais ficarão quietas.',
          say: 'O Sindicato fez a melhor oferta.'
        }
      },
      oracle: {
        ask: {
          '1': 'Vi este momento mais vezes do que consigo contar.',
          '2': 'Em metade delas, você me liberta. Na outra metade, leva o que eu guardo.',
          '3': 'Escolha. Eu gostaria, só uma vez, de não saber o que vem depois.'
        },
        free: {
          '1': 'Oh. Isso eu não vi. Realmente não vi.',
          '2': 'A oráculo sobe pela água e desaparece. Seu aluno fica para ensinar.',
          say: 'Fique parada. Vou quebrar suas correntes.'
        },
        slay: {
          '1': 'Sim. Esta é a outra metade.',
          '2': 'Ela não resiste. A Ampulheta do Guardião do tempo é sua.',
          '3': 'Seu último aluno foge do templo, e o Círculo não vai perdoar você.',
          say: 'Vim pela ampulheta.'
        }
      },
      dragon: {
        ask: {
          '1': 'Chega. Você tem dentes, criatura.',
          '2': 'O demônio da fortaleza acorrentou os meus. Quero vê-lo arder.',
          '3': 'Mate-me, ou deixe-me ajudar você a fazê-lo.'
        },
        slay: {
          '1': 'A montanha treme quando o dragão cai. O tesouro dele é seu.',
          '2': 'A Ordem de Ferro canta o matador de dragões.',
          say: 'Não barganho com dragões.'
        },
        pact: {
          '1': 'Poucos ousariam pedir. Muito bem. Caçamos juntos.',
          '2': 'Quando você marchar sobre a Fortaleza do Pavor, um dragão voará acima de você.',
          say: 'Então lute comigo contra o Arquidemônio.'
        }
      },
      throne: {
        ask: {
          '1': 'Então. Acaba. Não pensei que seria você.',
          '2': 'Meu trono não vai ficar vazio. Quem o tomar comanda a fortaleza e a fenda.',
          '3': 'Três enviados já esperam à minha porta. Escolha quem vem em seguida.'
        },
        order: {
          '1': 'A Ordem guarnece a fortaleza e sela o que puder.',
          '2': 'O reino ficará seguro, e lhe dirão o que fazer.',
          say: 'A Ordem de Ferro o manterá.'
        },
        syndicate: {
          '1': 'O Sindicato se instala antes do amanhecer.',
          '2': 'A partir de agora tudo tem preço, até a paz.',
          say: 'O Sindicato das Cinzas mereceu.'
        },
        circle: {
          '1': 'O Círculo transforma a fortaleza numa escola sobre a fenda.',
          '2': 'Eles chamam de pesquisa. Todo o resto prende a respiração.',
          say: 'Que o Círculo do Éter fique com ele.'
        },
        shatter: {
          '1': 'Você quebra o trono com as próprias mãos. Ninguém mais governará daqui.',
          '2': 'Os enviados saem sem uma palavra.',
          say: 'Ninguém fica com ele. Eu vou quebrar.'
        },
        claim: {
          '1': 'O trono está frio, e serve em você.',
          '2': 'Três facções descobrem que têm um inimigo em comum.',
          say: 'Eu mesmo fico com ele.',
          say__f: 'Eu mesma fico com ele.'
        }
      }
    },
    bark: {
      sphinx: {
        intro: { '1': "Responda-me, pequenino, ou seja enterrado na minha areia." },
        riddle: { '1': "Um enigma, então. Pise onde eu mostrar, nessa ordem." },
        sand: { '1': "Cinco desta vez. E minha areia não vai esperar." },
        death: { '1': "Você respondeu bem. A areia agora é sua." },
      },
      leviathan: {
        intro: { '1': "Agora você anda na minha água." },
        sink: { '1': "Suas ilhazinhas estão afundando." },
        grab: { '1': "Desça às profundezas comigo!" },
        death: { '1': "A maré vai embora e não volta." },
      },
      hydra: {
        intro: { '1': "Corte uma cabeça, e duas vão crescer!" },
        heads: { '1': "Mais cabeças, mais dentes!" },
        rage: { '1': "Nos queimar? Então queime conosco!" },
        death: { '1': "Sem mais cabeças. Nunca mais." },
      },
      elderDragon: {
        intro: { '1': "Eu dormia sob o mundo antes de sua gente conhecer o fogo." },
        flight: { '1': "Então se esconda atrás das suas pedrinhas." },
        rift: { '1': "A fenda está me puxando de volta. Ainda não!" },
        death: { '1': "Sele-a, então. Estou cansado do escuro." },
      },
      'siegeHale': {
        'start': {
          '1': "Lá vêm eles! Segurem o portão!"
        },
        'ram': {
          '1': "Um aríete! Matem-no antes que chegue ao portão!"
        },
        'horn50': {
          '1': "Metade do portão já era! Aguentem!"
        },
        'horn25': {
          '1': "O portão não vai durar muito mais!"
        },
        'won': {
          '1': "Eles foram derrotados! O Bastião está de pé!"
        }
      },
      'siegeMara': {
        'start': {
          '1': "Eles estão vindo! Firmes, todos vocês!"
        },
        'ram': {
          '1': "Um aríete! Parem-no antes que quebre o portão!"
        },
        'horn50': {
          '1': "Metade do portão caiu. Aguentem!"
        },
        'horn25': {
          '1': "O portão está cedendo! Empurrem-nos de volta!"
        },
        'won': {
          '1': "Eles estão fugindo! O forte ainda está de pé!"
        }
      },
      banditChief: {
        whistle: {
          1: 'De pé, rapazes! Mordam-nos!'
        }
      },
      lightDisciple: {
        freed: {
          '1': 'A luz enviou você. Eu sou a Irmã Aurelle. Me procure em Sunford, vou te ensinar o caminho do Portador da Luz.'
        }
      },
      trainerAegis: {
        freed: {
          '1': 'Obrigado por nos libertar dos bandidos! Venha para a fogueira: todos vamos te ensinar, a primeira lição é grátis.'
        },
        road: { '1': 'Você nos encontrou! Os demônios nos pegaram na estrada de Sunford. Vamos para o Passo do Bastião: procure-nos no forte.' }
      },
      sfShadow: {
        road: { '1': 'Já não era sem tempo. Estamos indo para o Passo do Bastião. Procure-nos no forte.' }
      },
      frostDisciple: {
        freed: {
          '1': 'Você veio me buscar? Ivor Hask, discípulo do Guardião do Gelo. Venha a Ironhold e eu vou te ensinar.'
        }
      },
      windDisciple: {
        freed: {
          '1': 'Livre, finalmente! Kestrel Vane, do caminho do Corredor do Vento. Me procure em Oakhaven e eu vou te ensinar.'
        }
      },
      freedFarmers: {
        freed: {
          '1': 'Você nos salvou! Somos os Toller, fazendeiros. Procure a gente em Oakhaven, tem problema em casa.'
        }
      },
      freedHerbalist: {
        freed: {
          '1': 'Ah, obrigada! Sou Briar, herbalista. Venha me ver em Silverbridge. Sua ajuda viria bem a calhar.'
        }
      },
      freedPeddler: {
        freed: {
          '1': 'Benditas sejam suas botas! Odo Marrow, mascate. Me procure em Sunford, vou ter mercadorias para você.'
        }
      },
      goblinKing: {
        charge: {
          '1': 'Atropele eles, Tusker!'
        },
        horn: {
          '1': 'Comigo, rapazes! Goblins, comigo!'
        },
        dismount: {
          '1': 'Corra, Tusker! Eu termino isto sozinho!'
        },
        return: {
          '1': 'Tusker! Mais uma vez!'
        }
      },
      dragon: {
        takeoff: {
          '1': 'Chega. Que o céu queime você.'
        },
        flight2: {
          '1': 'Ainda não terminei com você!'
        }
      },
      archDemon: {
        gate: {
          '1': 'O portão está aberto. Ninguém sai.'
        },
        dive: {
          '1': 'De joelhos.'
        }
      },
      chimera: {
        intro: {
          '1': "Três cabeças, uma só fome. Qual de nós morde primeiro?"
        },
        twin: {
          '1': "Agora somos duas. Escolha bem o seu lado."
        },
        tail: {
          '1': "Minha cauda! Você vai pagar por isso!"
        },
        death: {
          '1': "Três cabeças, e nenhuma viu isso chegando."
        }
      },
      centaurWarchief: {
        intro: {
          '1': "Corra, se quiser. Minhas flechas correm mais."
        },
        raiders: {
          '1': "Cavaleiros! Atropelem eles!"
        },
        rear: {
          '1': "Chega de flechas. Vou te esmagar com os cascos!"
        },
        death: {
          '1': "As planícies vão lembrar dos meus cascos."
        }
      },
      cyclops: {
        intro: {
          '1': "Tem algo pequeno aqui. Chegue mais perto. Deixe-me ver."
        },
        cover: {
          '1': "Chega de olhar. Meu olho você não vai ter!"
        },
        blind: {
          '1': "Não consigo te ver, mas consigo te ouvir!"
        },
        death: {
          '1': "Escuro. Ficou tudo escuro."
        }
      },
      frostJarl: {
        hammer: {
          '1': 'Fique parado, pequeno.',
          '1__f': 'Fique parada, pequena.'
        },
        iceBreak: {
          '1': 'O lago vai engolir você!'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': 'Cuidado com a carroça! Desculpe, nesta ponte tudo se mexe. Bem-vindo a Silverbridge.',
        '2': 'Sou a prefeita Brenna Quill. Se algo se perde, quebra ou atrasa, vai parar na minha mesa.'
      },
      ending: {
        '1': 'O rio inteiro fala de você. O comércio nunca esteve tão bom. Então, obrigada.'
      },
      again: {
        '1': 'De volta? Ótimo. Tente não bloquear as carroças.'
      },
      who: {
        '1': 'Prefeita há nove anos. Antes eu vendia corda. No fundo, é o mesmo trabalho: manter tudo amarrado.',
        '2': 'A cidade vota toda primavera. Até agora, ninguém mais quer a mesa.'
      },
      town: {
        '1': 'Primeiro veio a ponte. Depois um mercado em cima, depois casas, depois casas em cima das casas.',
        '2': 'Cuidado com as fontes. As crianças caem dentro. Os adultos também, em dia de feira.',
        say: 'Fale sobre Silverbridge.'
      },
      masters: {
        '1': 'Para todas. Escudo, fogo, sombra, pedra. Um mestre de cada, todos numa só ponte.',
        '2': 'Vêm alunos de todo lugar. É bom para as estalagens. Nem tanto para as minhas janelas.',
        say: 'Tem mesmo um mestre para cada classe aqui?'
      },
      river: {
        '1': 'O que o rio trouxer. Peixe, seda, aço de Ironhold, de vez em quando um caixote de galinhas bravas.',
        '2': 'E nem todo comerciante de Silverbridge pendura uma placa. Fique de olhos abertos.',
        say: 'O que se negocia aqui?'
      },
      rumor: {
        crags: {
          '1': 'Os barcos do norte pararam de vir. Tem algo queimando lá em cima, nos Penhascos de Cinza.'
        },
        mines: {
          '1': 'Nada de aço de Ironhold este mês. Os anões dizem que algo deu errado nas minas deles.'
        },
        tundra: {
          '1': 'Os comerciantes de peles não atravessam mais a tundra. Dizem que os gigantes estão se mexendo.'
        },
        far: {
          '1': 'Os comerciantes só cochicham sobre o extremo norte agora. O que quer que esteja lá, não está comprando.'
        }
      },
      bye: {
        '1': 'Pode ir. E se alguém perguntar, o pedágio da ponte é muito justo.'
      }
    },
    sbHealer: {
      hello: {
        '1': 'Hum? Ah, um paciente. Desculpe, eu estava descansando os olhos. Curandeiros fazem isso.',
        '2': 'Irmão Ansel. Entre, sente-se. A cadeira é mais confortável do que parece.'
      },
      again: {
        '1': 'Ah, você voltou. E eu tinha acabado de me sentar.'
      },
      heal: {
        '1': 'Deite-se, feche os olhos. Não por muito tempo, senão eu cochilo também. Pronto, frascos cheios.'
      },
      mana: {
        '1': 'Tônico de chapéu-luz. Bom para a mente, ruim para o hálito. Beba devagar.'
      },
      potions: {
        '1': 'Beba uma antes de ficar desesperado. Heróis sempre esperam demais.',
        '2': 'Se quiser carregar mais, vendo cintos maiores. Encher os frascos é de graça.',
        say: 'Algum conselho sobre poções?'
      },
      sleep: {
        '1': 'À noite, não. Alunos de todas as classes, todos treinando. Sempre tem algo explodindo.',
        say: 'Você chega a dormir?'
      },
      healBack: {
        '1': 'Pode ir. Da próxima vez, venha para um chá em vez de curativos.'
      },
      bye: {
        '1': 'Cuidado com os degraus. Metade dos meus pacientes só tropeçou neles.'
      }
    },
    sbArmorer: {
      forge: {
        '1': 'Fique à vontade com a forja. Grite se alguma coisa pegar fogo.'
      },
      learnSmith: {
        '2': 'Golpeie quando brilhar mais quente. Três bons golpes fazem uma boa peça.',
        '1__f': 'Quer experimentar o martelo você mesma? Não me importo de dividir a forja.',
        '1': 'Quer experimentar o martelo você mesmo? Não me importo de dividir a forja.'
      },
      ore: { '1': 'Minério lindo. Mostre o que vai vender, pago por pepita.' },
      sellBack: { '1': 'Um prazer. Silverbridge sempre paga um preço justo.' },
      forgeBack: {
        '1': 'Olha só! Você leva jeito.'
      },
      hello: {
        '1': 'Rá! Olha esse amassado. Espero que tenham devolvido seu dinheiro por essa armadura.',
        '2': 'Greta Ironvein. Faço armaduras que voltam para casa com o dono. Todas as vezes, até agora.'
      },
      again: {
        '1': 'Você de novo! Ainda inteiro. Meu tipo favorito de cliente.'
      },
      trade: {
        '1': 'Vai, bate nela. Com toda a força que quiser.'
      },
      who: {
        '1': 'Família da montanha. Desci o rio pelo comércio e fiquei pelo peixe.'
      },
      steel: {
        '1': 'Não é a espessura. É onde ela dobra. Uma boa armadura dobra onde você dobra.',
        '2': 'Mas placa pesada pede Força. Sem ela, você vai andar que nem um pato.',
        say: 'O que faz uma boa armadura?'
      },
      shopBack: {
        '1': 'Use com orgulho. Traga os amassados, eu adoro uma boa história.'
      },
      bye: {
        '1': 'Pode ir. Não leve golpe onde eu não te protegi.'
      }
    },
    sbWeapons: {
      hello: {
        '1': 'Ah, um cliente de bom gosto. Eu sempre percebo. Está no jeito como você entra.',
        '2': 'Corvin Ashby, das Lâminas Finas de Ashby. Sim, aquele Ashby. Com certeza já ouviu falar de mim.'
      },
      again: {
        '1': 'Já de volta? Sempre voltam para o Corvin.'
      },
      trade: {
        '1': 'Cada lâmina polida à mão. Pela minha mão, aliás. Cuidado com o reflexo.'
      },
      who: {
        '1': 'O melhor vendedor de lâminas do rio. Pergunte a qualquer um. Ou só leia a minha placa.'
      },
      blades: {
        '1': 'Escolha uma que combine com você. Mãos rápidas, lâmina leve. Braços fortes, lâmina pesada.',
        '2': 'E ela precisa ficar bonita. Ninguém foge de um herói com uma espada feia.',
        say: 'Como escolho uma boa arma?'
      },
      shopBack: {
        '1': 'Ótima escolha. Não tão ótima quanto o meu cabelo, mas quase.'
      },
      bye: {
        '1': 'Conte para todo mundo onde você comprou.'
      }
    },
    sbJeweler: {
      hello: {
        '1': 'Psiu! Aqui! Anéis, amuletos, pedras da sorte. A melhor barraca da ponte.',
        '2': 'Meu nome é Tam Marlow. Sou pequeno, mas meus preços são menores.'
      },
      again: {
        '1': 'Meu cliente favorito! Não conte aos outros que eu disse isso.'
      },
      trade: {
        '1': 'Tudo verdadeiro. Quase sempre. Tá, essa aí é de vidro, mas é um vidro muito bonito.'
      },
      who: {
        '1': 'Cresci nesta ponte. Conheço cada rachadura, cada gato e cada atalho.'
      },
      gossip: {
        '1': 'O professor Sprocket queimou as sobrancelhas de novo. Terceira vez este mês.',
        '2': 'E a prefeita sabe dos comerciantes sem placa. Estou trabalhando nisso.',
        say: 'Ouviu alguma fofoca boa?'
      },
      shopBack: {
        '1': 'Foi um prazer fazer negócio! Conte aos seus amigos. Aos guardas, não.'
      },
      bye: {
        '1': 'Até mais! Vou estar bem aqui. Provavelmente.'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': 'Rá! Mais um jovem. Queixo erguido, ombros para trás. Escudos funcionam melhor com um sorriso.',
        '2': 'Dama Helga Stormshield. Já defendi esta ponte. Agora ensino os outros a não recuar.'
      },
      again: {
        '1': 'Aí está você! Escudo erguido? Bom. Sorrindo? Melhor ainda.'
      },
      train: {
        '1': 'Pés afastados. Incline-se. Quando eu empurrar, você não se mexe. Pronto? Hup!'
      },
      class: {
        '1': 'Você fica na frente, para os outros não precisarem. O melhor trabalho que existe.',
        '2': 'Força para erguer o escudo. Vigor para mantê-lo erguido até a janta.',
        say: 'O que um Cavaleiro da Égide faz de verdade?'
      },
      ready: {
        strong: {
          '1': 'Agora você é uma muralha de verdade, querido. Escolha a lição que quiser.'
        },
        able: {
          '1': 'Pernas firmes! Você está pronto para a próxima.'
        },
        weak: {
          '1': 'Ainda não. Um bom empurrão e você cai. Mais Força e Vigor, por favor.'
        }
      },
      bridge: {
        '1': 'Há quarenta anos, contra piratas do rio. Seis de nós, um portão, uma noite muito longa.',
        '2': 'Não vencemos batendo mais forte. Vencemos sem sair do lugar. Lembre-se disso.',
        say: 'Você defendeu esta ponte?'
      },
      trainBack: {
        '1': 'Bom trabalho! Agora coma alguma coisa. Escudos são pesados.'
      },
      bye: {
        '1': 'Cabeça erguida lá fora!'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': 'Entre, por favor. Cuidado com as anotações, e não espirre perto do braseiro.',
        '2': 'Magister Ignatius Vale. Ensino fogo numa ponte. Tem água de sobra por perto, sabe.'
      },
      again: {
        '1': 'Pontual. Excelente. Vamos continuar de onde paramos.'
      },
      train: {
        '1': 'Observe. Uma chama pequena, parada. Chamas grandes são fáceis. As pequenas exigem habilidade.'
      },
      class: {
        '1': 'Qualquer um acende um fogo. Um piromante decide para onde ele vai, e onde ele para.',
        '2': 'Tudo vem da Inteligência. Depois a Técnica ajuda, quando o fogo precisa de mão firme.',
        say: 'O que um piromante faz de verdade?'
      },
      ready: {
        strong: {
          '1': 'Seu controle é excelente. Quase não tenho mais o que corrigir. Escolha à vontade.'
        },
        able: {
          '1': 'Satisfatório. Mais que satisfatório, na verdade. Pode ter a próxima lição.'
        },
        weak: {
          '1': 'Ainda não. Sua chama treme. Uma mente mais afiada, por favor. Mais Inteligência.'
        }
      },
      sprocket: {
        '1': 'Um homem brilhante. Barulhento, descuidado e brilhante. Deixo um balde ao lado da porta dele.',
        say: 'O que você acha do professor Sprocket?'
      },
      trainBack: {
        '1': 'Pratique perto da água. Eu insisto.'
      },
      bye: {
        '1': 'Tenha um bom dia. E mantenha as mangas arregaçadas.'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': 'Procurando por mim? Estou do seu lado desde a fonte. Você passou por mim duas vezes.',
        '2': 'Nyx Halloway. O melhor esconderijo é a multidão, e esta é a ponte mais movimentada que existe.'
      },
      again: {
        '1': 'Oi de novo. Estou aqui faz um tempinho. Percebeu? Não? Ótimo.'
      },
      train: {
        '1': 'Lição um: ande como se fosse daqui. Ninguém olha duas vezes para quem é daqui.'
      },
      class: {
        '1': 'Nunca estar onde estão olhando. Entrar de fininho, um golpe rápido e sumir na multidão.',
        '2': 'Destreza para pés e mãos ágeis. Técnica, para o golpe valer.',
        say: 'O que faz uma boa Lâmina Sombria?'
      },
      ready: {
        strong: {
          '1': 'Agora você é sorrateiro de verdade. Pegue o que falta, você mereceu.'
        },
        able: {
          '1': 'Pés leves! Você está pronto para o próximo truque.'
        },
        weak: {
          '1': 'Ainda não. Dá para ouvir você chegando lá da fonte. Mais Destreza.'
        }
      },
      past: {
        '1': 'Eu batia carteiras nesta mesma ponte. E era bom nisso, viu.',
        '2': 'Aí a prefeita me pegou e me deu um emprego, não uma cela. Não conte a ela que sou grato.',
        say: 'Como você aprendeu tudo isso?'
      },
      trainBack: {
        '1': 'Agora vá treinar. Tente não deixar que eu te pegue.'
      },
      bye: {
        '1': 'Até mais. Bom, você não vai me ver.'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': 'Oh! Olá, olá. Perdoe-me, eu estava conversando com meus guardas. Ótimos ouvintes.',
        '2': 'Percival Ashcombe. Eu poderia ensinar num castelo, mas só se aprende a liderar onde há gente.'
      },
      again: {
        '1': 'Meu caro amigo! Vamos continuar? Só se você quiser, é claro.'
      },
      train: {
        '1': 'Muito bem. Uma boa ordem é clara, gentil e dada uma só vez. Assim.'
      },
      class: {
        '1': 'Um líder. Seus guardas vêm para o seu lado e lutam com você, não só por você.',
        '2': 'Carisma é tudo. As pessoas seguem quem elas gostam. E quem lembra o nome delas.',
        say: 'O que é um Grão-Soberano?'
      },
      ready: {
        strong: {
          '1': 'Esplêndido! Agora as pessoas te seguiriam a qualquer lugar. Pegue todas as lições.'
        },
        able: {
          '1': 'Seus guardas te ouviriam. Você está pronto para a próxima lição.'
        },
        weak: {
          '1': 'Ainda não, receio. Um pouco mais de Carisma, e eles virão.'
        }
      },
      please: {
        '1': 'Sempre. Gritando, você ganha obediência. Com por favor, ganha lealdade, e lealdade dura mais.',
        say: 'Você diz mesmo por favor aos seus guardas?'
      },
      trainBack: {
        '1': 'Belo trabalho. Lembre-se de agradecer a eles depois.'
      },
      bye: {
        '1': 'Cuide-se bem, e mande lembranças a todos.'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': 'Cuidado com o musgo, querido, ele teve uma semana longa. Agora, deixe-me dar uma olhada em você.',
        '2': 'Vovó Tova Deeproot. O leito do rio aqui é uma pedra linda, até lá embaixo.'
      },
      again: {
        '1': 'Já de volta? Sente-se, acabei de fazer chá. Chá de pedra. É quase todo chá.'
      },
      train: {
        '1': 'Mãos espalmadas no chão. Assim não. Como se estivesse fazendo carinho num cachorro sonolento.'
      },
      class: {
        '1': 'Pedimos ajuda ao chão. Um muro quando você precisa, um espinho quando alguém é grosseiro.',
        '2': 'Pedra é como uma horta. Força para cavar, Inteligência para saber onde plantar.',
        say: 'O que um Geomante faz?'
      },
      ready: {
        strong: {
          '1': 'Agora o chão gosta de você. Aprenda o que quiser, querido.'
        },
        able: {
          '1': 'Boas raízes! Você está pronto para a próxima lição.'
        },
        weak: {
          '1': 'Ainda não, meu bem. A pedra não se mexe por você. Primeiro, mais Força.'
        }
      },
      garden: {
        '1': 'Quarenta anos de trabalho. Cada rocha cultivada à mão. Bom, com magia. Quase sempre à mão.',
        '2': 'Leve uma pedrinha ao sair. São ótimos pesos de porta.',
        say: 'Isso é um jardim de pedra?'
      },
      trainBack: {
        '1': 'Lindo. Agora vá cavar alguma coisa. Com cuidado.'
      },
      bye: {
        '1': 'Pode ir. Agasalhe-se, perto do rio é úmido.'
      }
    },
    sbMasterAether: {
      hello: {
        '1': 'Bem-vindo, bem-vindo! Chegou bem a tempo da demonstração. Tape os ouvidos, por favor.',
        '2': 'Professor Quint Sprocket. O rio gira minhas rodas de graça. Onde mais eu ensinaria?'
      },
      again: {
        '1': 'Ah, meu aluno favorito! A demonstração de hoje é extrabarulhenta.'
      },
      train: {
        '1': 'Observe o quadro-negro. Agora esqueça o quadro e olhe a máquina.'
      },
      class: {
        '1': 'Saímos das encrencas construindo. Uma pistola, uma torreta e um medidor de calor para manter você na linha.',
        '2': 'Técnica para a mira, Inteligência para as partes engenhosas. O ideal é as duas.',
        say: 'O que um Éter-Tec faz, afinal?'
      },
      ready: {
        strong: {
          '1': 'Maravilhoso! Você poderia dar minhas aulas. Mas não dê, por favor. Pegue o resto.'
        },
        able: {
          '1': 'Mão firme! Você está pronto para a próxima máquina.'
        },
        weak: {
          '1': 'Ainda não. Sua mira desvia. Mais Técnica, depois a gente conversa.'
        }
      },
      eyebrows: {
        '1': 'Uma demonstração deu um pouquinho certo demais. Elas crescem de novo. Sempre crescem.',
        say: 'O que aconteceu com suas sobrancelhas?'
      },
      trainBack: {
        '1': 'Esplêndido. Agora vá liberar esse calor. Lá fora, de preferência.'
      },
      bye: {
        '1': 'Aula encerrada! Cuidado com os degraus.'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': 'Meu antigo aluno, o Guardião das Horas, escreveu que você viria. Exatamente neste minuto, aliás.',
        '2': 'Guardião do Relógio Selwyn. Cuido do relógio da ponte. Uma cidade tão agitada não pode se atrasar.'
      },
      again: {
        '1': 'Sete minutos depois da hora. Um bom momento para começar.'
      },
      train: {
        '1': 'Conte comigo. Um, dois, e segure. O tempo estica, se você o segura direito.'
      },
      class: {
        '1': 'Arrumamos o tempo. Frear um inimigo, apressar um amigo, desfazer um ou outro erro.',
        '2': 'Inteligência para entendê-lo. Técnica para tocá-lo sem quebrar nada.',
        say: 'O que é um Tecelão do Tempo?'
      },
      ready: {
        strong: {
          '1': 'Ótimo senso de tempo. Pegue o resto das minhas lições quando for melhor para você.'
        },
        able: {
          '1': 'Você está pronto. A próxima lição começa... ah, agora.'
        },
        weak: {
          '1': 'Ainda não. Você está sempre um compasso atrasado. Mais Inteligência, e mais Técnica.'
        }
      },
      keeper: {
        '1': 'Fui professor dele, anos atrás. Um aluno brilhante. Sempre adiantado ou atrasado, nunca na hora.',
        say: 'Como você conhece o Guardião das Horas?'
      },
      trainBack: {
        '1': 'Pratique todo dia. Sempre no mesmo horário, por gentileza.'
      },
      bye: {
        '1': 'Pode ir. Não se atrase.'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': 'O doutor Sangrel me escreveu sobre você. Disse que você não desmaiou. Vindo dele, é um grande elogio.',
        '2': 'Vesper Crimsonleaf. Todas as ervas do mundo passam boiando por esta ponte. Aqui eu sou mimada.'
      },
      again: {
        '1': 'Bem-vindo de volta. Você parece cheio de vida hoje. Eu sempre percebo.'
      },
      train: {
        '1': 'Inspire. Sente sua força? Agora gaste um pouco dela. Com sabedoria.'
      },
      class: {
        '1': 'Gastamos nossa própria força vital em troca de poder, depois a tomamos de volta dos inimigos.',
        '2': 'O Vigor é a sua bolsa. A Inteligência decide se você gasta bem.',
        say: 'O que é um Alquimista de Sangue, afinal?'
      },
      ready: {
        strong: {
          '1': 'Quanta vitalidade! Você está pronto para quase tudo o que eu sei.'
        },
        able: {
          '1': 'Sua essência corre forte. Vamos à próxima lição.'
        },
        weak: {
          '1': 'Ainda não. Você se cansaria depois de um feitiço. Primeiro aumente seu Vigor.'
        }
      },
      herbs: {
        '1': 'Tônicos, quase sempre. Um pouco de essência, muita hortelã. Hortelã melhora tudo.',
        '2': 'Se achar plantas raras por aí, traga para mim. Eu adoraria dar uma olhada.',
        say: 'Para que servem todas essas ervas?'
      },
      trainBack: {
        '1': 'Descanse depois do treino. A essência volta, mas ela gosta de uma soneca.'
      },
      bye: {
        '1': 'Cuide-se. Beba água. Coma algo verde.'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': 'Três barcaças chegaram da costa hoje de manhã.',
        '2': 'Peixe salgado de novo?',
        '3': 'Seda, para variar. Mas cheire os dedos depois.'
      },
      lesson: {
        '1': 'Como foi sua lição?',
        '2': 'Pus fogo na minha manga. O mestre disse que é progresso.'
      },
      masters: {
        '1': 'Todos os mestres do reino ensinam numa rua só.',
        '2': 'E cada um diz que a sua classe é a melhor.',
        '3': 'E todos têm razão, que é a parte irritante.'
      },
      bridge: {
        '1': 'Dizem que a ponte é mais velha que a cidade.',
        '2': 'Pelo rangido, deve ser mesmo.'
      },
      fish: {
        '1': 'Pegou alguma coisa?',
        '2': 'Uma bota.',
        '3': 'Bom, já é meio par.'
      },
      newMaster: {
        '1': 'Tem um mestre novo na rua norte. Fala muito sobre o tempo.',
        '2': 'Aposto que chega atrasado em toda aula.'
      },
      siege: {
        '1': 'As notícias de Oakhaven são ruins. Bandidos nas muralhas.',
        '2': 'Então as barcaças vão vir para cá. Coitados.'
      }
    },
    sbAlchemist: {
      hello: {
        '1': 'Ah! Cuidado com os potes. Aquele morde. Bom, mordisca.',
        '2': 'Odile Fernwhistle, alquimista. Me traga ervas e eu engarrafo um pouquinho de coragem pra você.'
      },
      again: {
        '1': 'Você voltou! Trouxe alguma coisa verde pra mim?'
      },
      brew: {
        '1': 'Deixa eu ver sua bolsinha. Ooh, que lindo. Escolha o que quiser que eu ponho a chaleira no fogo.'
      },
      who: {
        '1': 'Eu pus fogo no jardim da minha mãe com uma margarida. Ninguém conseguiu explicar, então tive que aprender.'
      },
      herbs: {
        '1': 'Lá fora, na natureza, em todo lugar onde você luta. É só passar por cima de uma planta e ela é sua.',
        '2': 'As raras são exigentes. Os sinos-lunares se abrem no Bosque Sussurrante; o espinho-sombrio quer os lugares escuros.',
        say: 'Onde encontro ervas?'
      },
      elixirs: {
        '1': 'Cada um deixa você mais forte em combate por 5 minutos inteiros. Golpes mais duros, pele mais grossa, pés mais rápidos.',
        '2': 'Eles ficam no seu terceiro frasco. Toque na setinha para trocar qual você bebe.',
        say: 'O que os elixires fazem?'
      },
      brewBack: {
        '1': 'Cuidado, ainda estão quentinhos. Volte quando sua bolsa estiver cheia!'
      },
      bye: {
        '1': 'Tchau! Se vir uma flor roxa, pegue duas. Uma é pra mim.'
      }
    },
    sbGambler: {
      hello: {
        '1': 'Chegue mais, chegue mais! Doze cartas, uma ampulheta e uma bolsa que pode dobrar!',
        '2': 'Madame Pell. Nunca esqueço um rosto. Vamos ver se você nunca esquece uma carta.'
      },
      again: {
        '1': 'Voltou para mais uma rodada? A areia estava esperando por você.'
      },
      play: {
        '1': 'Moedas no pano, olhos nas cartas. Vamos lá? Vire a ampulheta!'
      },
      rules: {
        '1': 'Vire duas cartas. Um par fica aberto. Encontre todos os pares antes que a areia acabe e eu pago o dobro.',
        '2': 'Ganhe de novo e a ampulheta fica mais rápida. Ganhe cinco seguidas e eu te dou um prêmio lendário.',
        say: 'Como funciona?'
      },
      who: {
        '1': 'Fugi com o circo itinerante aos nove anos. Acabou sendo uma ótima conta.'
      },
      prize: {
        '1': 'Um anão, uma vez. Ninguém viu ele piscar desde então.',
        say: 'Alguém já ganhou o prêmio?'
      },
      playBack: {
        '1': 'Ganhando ou perdendo, foi uma boa partida. Volte quando seus olhos estiverem descansados.'
      },
      bye: {
        '1': 'Pode ir! Lembre onde você pisa.'
      }
    },
    sunfordGambler: {
      hello: {
        '1': 'Psiu. Tem alguma tralha nessa bolsa? Botas velhas, espadas tortas? Eu jogo com você por elas.',
        '2': 'Dob Tumbler. Jogo mais por diversão. E por botas.'
      },
      again: {
        '1': 'Você de novo! Tem mais daquela tralha linda?'
      },
      play: {
        '1': 'Taxa na mesa. Coloque suas coisas, o maior preço leva o ponto.'
      },
      rules: {
        '1': 'Cada um coloca um item. O mais caro leva o ponto. Dois pontos vencem a partida.',
        '2': 'O que você colocar é meu, ganhando ou perdendo. Mas vença três partidas seguidas e eu tenho algo especial.',
        say: 'Quais são as regras?'
      },
      who: {
        '1': 'Eu era mascate. Descobri que o pessoal prefere apostar suas coisas a vendê-las.'
      },
      luck: {
        '1': 'O tempo todo! Mas sempre volto para casa com um par de botas novo.',
        say: 'Você já perdeu alguma vez?'
      },
      playBack: {
        '1': 'Boa partida! Suas coisas vão ficar lindas na minha prateleira.'
      },
      bye: {
        '1': 'Traga mais tralha! Tralha é o que eu mais gosto.'
      }
    },
    sunfordCups: {
      hello: {
        1: 'Cheguem mais! Três copos, uma gema, e a sua primeira rodada é por conta da casa!',
        2: 'Nell Nimblefingers. Ninguém enganou minhas mãos ainda. Quer tentar?'
      },
      again: {
        1: 'De volta? Abra bem os olhos!'
      },
      play: {
        1: 'Olho na gema, amigo. Não pisque!'
      },
      rules: {
        1: 'Eu escondo a gema sob um copo e embaralho. Você aponta o copo que a esconde.',
        2: 'Cada vitória seguida paga mais. Três vitórias trazem um prêmio, cinco um tesouro. A primeira rodada do dia é grátis.',
        say: 'Como funciona?'
      },
      who: {
        1: 'Aprendi a embaralhar antes de andar. Mamãe diz que isso explica muita coisa.'
      },
      luck: {
        1: 'Às vezes! Aí eu gemo bem alto e a plateia sente pena de mim.',
        say: 'Você já perde?'
      },
      playBack: {
        1: 'Ótima rodada! Volte amanhã, a primeira é sempre grátis.'
      },
      bye: {
        1: 'Até logo! Mantenha os olhos abertos por aí.'
      }
    },
    oakGambler: {
      hello: {
        '1': 'Um rosto novo. Sente-se, eu não mordo. Meus preços mordem, um pouquinho.',
        '2': 'Me chamam de Silky Ren. Coleciono coisas finas, uma partida de cada vez.'
      },
      again: {
        '1': 'Ah, que bom te ver de novo. Vamos?'
      },
      play: {
        '1': 'A taxa, por favor. Depois coloque algo que valha a pena.'
      },
      rules: {
        '1': 'Um item cada, no máximo três vezes. A peça mais fina leva o ponto. Dois pontos levam a partida.',
        '2': 'Suas peças ficam comigo de qualquer jeito. Vença três partidas seguidas e você sai daqui com um tesouro de verdade.',
        say: 'Como a gente joga?'
      },
      who: {
        '1': 'Um negociante de coisas raras. Eu as encontro, eu as guardo e, de vez em quando, perco uma.'
      },
      collection: {
        '1': 'Separo por brilho. As mais brilhantes vão na prateleira de cima, ao lado das minhas xícaras de chá.',
        say: 'O que você faz com tudo isso?'
      },
      playBack: {
        '1': 'Que delícia de partida. Volte quando sua bolsa estiver mais pesada.'
      },
      bye: {
        '1': 'Cuidado com a bolsa lá fora. Nem todo mundo joga limpo.'
      }
    },
    sbCollector: {
      hello: {
        '1': 'Feche a porta, está ventando. As traças estão de olho nas minhas tapeçarias.',
        '2': 'Alder Vane. Alguns me chamam de Colecionador. Compro coisas raras e vendo para quem eu gosto.'
      },
      open: {
        '1': 'Aí está você! Entre, entre. Tirei o pó de algo especial para você.'
      },
      again: {
        '1': 'Você de novo. Pelo jeito ainda não me fez aquele favor.'
      },
      trade: {
        '1': 'As vitrines estão abertas. Só o melhor, e eu lembro de cada preço.'
      },
      favor: {
        '1': 'Não para estranhos. Mas me faça um favor e seremos amigos.',
        '2': 'Ents no Bosque Sussurrante guardam os sinos-lunares de que preciso. Derrote quatro deles e me traga dois sinos-lunares.',
        say: 'Você vende alguma coisa?'
      },
      waiting: {
        '1': 'Quatro ents, dois sinos-lunares. Infelizmente, os sinos-lunares não se colhem sozinhos.',
        say: 'Sobre aquele favor...'
      },
      favorDone: {
        '1': 'Ah, ainda têm cheiro de floresta! Maravilha.',
        '2': 'Trato é trato. Minhas vitrines estão abertas para você, quando quiser.',
        say: 'Trouxe seus sinos-lunares.'
      },
      who: {
        '1': 'Coleciono desde os seis anos. Primeiro foram botões. Agora são espadas que zumbem.'
      },
      shopBack: {
        '1': 'Cuide bem dessa peça. Ela é mais velha que nós dois.'
      },
      bye: {
        '1': 'Feche a porta ao sair. Com cuidado, os vasos chacoalham.'
      }
    },
    sbFence: {
      hello: {
        '1': 'Você está me encarando. Compre alguma coisa ou saia da minha luz.',
        '2': 'Mirela Thorne. Eu acho o que as pessoas perdem. Depois, acho um novo dono para isso.'
      },
      open: {
        '1': 'Ah, aí está você. Guardei as coisas boas debaixo do pano para você.'
      },
      again: {
        '1': 'Voltou? Lembre do que eu pedi. Depois a gente fala de negócios.'
      },
      trade: {
        '1': 'Armaduras de todo canto. Não pergunte de onde. Agora está tudo limpo, prometo.'
      },
      favor: {
        '1': 'Armaduras boas. Para amigos. E amigos fazem favores uns aos outros.',
        '2': 'Bandidos nos Arredores de Oakhaven vivem roubando minhas entregas. Derrote quinze e depois pergunte ao garoto das bugigangas quem os mandou.',
        say: 'O que tem debaixo do pano?'
      },
      waiting: {
        '1': 'Quinze bandidos, depois uma conversa com o garoto das bugigangas. Vai lá.',
        say: 'Sobre aqueles bandidos...'
      },
      favorDone: {
        '1': 'Então era o fofoqueiro o tempo todo. Rá! Te devo uma.',
        '2': 'Levante o pano quando quiser. Amigos escolhem primeiro.',
        say: 'Os bandidos foram derrotados, e sei quem os mandou.'
      },
      who: {
        '1': 'Cresci nestes degraus do rio. Tudo o que flutua por aqui acaba comigo, cedo ou tarde.'
      },
      shopBack: {
        '1': 'Use com orgulho. E se alguém perguntar, foi comprado em Ironhold.'
      },
      bye: {
        '1': 'Cuidado com a bolsa. Nem todo mundo aqui é tão honesto quanto eu.'
      }
    },
    sbMasterWindrunner: {
      hello: {
        '1': 'Ah, oi! Desculpe, não posso parar. Estou esperando o vento virar. Já, já.',
        '2': 'Sefa Galewing. Eu atiro flechas e corro atrás do vento. Quase sempre o vento ganha.'
      },
      open: {
        '1': 'Olha quem chegou para correr! Tudo pronto? Claro que sim. Vamos, vamos!'
      },
      again: {
        '1': 'Oi de novo! Ainda estou aqui. Bom, quase. Meus pés vivem querendo ir embora.'
      },
      train: {
        '1': 'Sente o vento no rosto? Mire um pouquinho à esquerda de onde acha. Agora solte!'
      },
      favor: {
        '1': 'Só para quem consegue me acompanhar. Você consegue? Vamos descobrir.',
        '2': 'Vença oito arqueiros bandidos nos Arredores de Oakhaven e me traga duas samambaias-velozes.',
        say: 'Você ensina arco e flecha?'
      },
      waiting: {
        '1': 'Oito arqueiros bandidos, duas samambaias-velozes. Vai! Estou bem aqui. Pulando.',
        say: 'Sobre o seu teste...'
      },
      favorDone: {
        '1': 'Rá! Você conseguiu me acompanhar! Ninguém consegue!',
        '2': 'Certo, agora você treina comigo. Uma regra: nada de sentar nas minhas aulas.',
        say: 'Os arqueiros foram vencidos, e aqui estão suas samambaias-velozes.'
      },
      class: {
        '1': 'Atira, corre, atira de novo. Se te pegarem, você parou tempo demais.',
        '2': 'Destreza para pés rápidos e arco rápido. Técnica, para cada flecha acertar.',
        say: 'O que um Corredor do Vento faz?'
      },
      ready: {
        strong: {
          '1': 'Agora você tem a rapidez do vento. Bom, quase. Escolha a aula que quiser!'
        },
        able: {
          '1': 'Pés leves! Já dá para a próxima. Vai, vai!'
        },
        weak: {
          '1': 'Ainda não. Você corre como quem carrega um sofá. Mais Destreza, por favor.'
        }
      },
      who: {
        '1': 'Moro lá em cima no velho moinho perto do rio. A melhor vista do vento da cidade.',
        '2': 'Duzentos degraus até o topo. Ótimo treino. Já contei cada um.'
      },
      trainBack: {
        '1': 'Boa! Agora volte correndo para casa. Nada de andar. Correr conta como treino.'
      },
      bye: {
        '1': 'Até mais! Cuidado com os galhos baixos. Eu nunca tenho.'
      }
    },
    sbMasterFrostwarden: {
      hello: {
        '1': 'Hum. Você passou por mim três vezes. Se perdeu, ou é curiosidade?',
        '2': 'Halvard Rimeheart. Vim da neve, lá do norte. Aqui é quente. Quente demais.'
      },
      open: {
        '1': 'Aprendiz. Bom. O gelo está pronto, e eu também.'
      },
      again: {
        '1': 'Você de novo. Bom. Eu não falo muito. Fique mesmo assim.'
      },
      train: {
        '1': 'Solte o ar devagar. Vê a névoa? Agora coloque-a na lâmina.'
      },
      favor: {
        '1': 'É. Só ensino a quem mantém a cabeça fria num lugar quente.',
        '2': 'Apague sete elementais de fogo nos Penhascos de Cinza. Depois me traga dois raminhos de menta-gelada.',
        say: 'Essa espada é feita de gelo?'
      },
      waiting: {
        '1': 'Sete elementais de fogo. Dois raminhos de menta-gelada. Sem pressa. Mas sem demora.',
        say: 'Sobre o seu teste...'
      },
      favorDone: {
        '1': 'Hum. Nem chamuscou. Bom.',
        '2': 'Você manteve a cabeça fria. Essa foi a primeira lição. Eu ensino o resto.',
        say: 'Os elementais de fogo estão apagados. Aqui está sua menta-gelada.'
      },
      class: {
        '1': 'Um cavaleiro do frio. Esfrie, congele, depois quebre o gelo.',
        '2': 'Força para a lâmina. Inteligência para o gelo. Você precisa das duas.',
        say: 'O que é um Guardião do Gelo?'
      },
      ready: {
        strong: {
          '1': 'Agora há em você o frio do norte. Escolha qualquer lição.'
        },
        able: {
          '1': 'Bom. Firme. A próxima lição é sua.'
        },
        weak: {
          '1': 'Ainda não. Seu gelo derrete rápido demais. Mais Inteligência, e mais Força.'
        }
      },
      who: {
        '1': 'Eu guardava um desfiladeiro no norte. Aí quis ver um rio que não congela.'
      },
      trainBack: {
        '1': 'Bom. Agora descanse. O gelo não tem pressa. Você também não deveria ter.'
      },
      bye: {
        '1': 'Vá bem. Mantenha a calma.'
      }
    },
    sbMasterLightbringer: {
      hello: {
        '1': 'Hm-hm-hmm... Ah! Desculpe, meu bem, eu estava cantarolando. Cantarolei para você? Eu faço isso.',
        '2': 'Irmã Auriel Dawnmere. Eu mantenho acesa a lamparina no fim da ponte.'
      },
      open: {
        '1': 'Aí está minha luzinha! Venha ficar um pouco na luz. Você mereceu.'
      },
      again: {
        '1': 'Olá de novo! Ainda aqui, ainda cantarolando. A lamparina gosta da companhia.'
      },
      train: {
        '1': 'Mãos abertas, queixo erguido. Pense na melhor manhã que você já teve. Isso. Sentiu?'
      },
      favor: {
        '1': 'Todo mundo tem uma luzinha por dentro. Eu ensino a soltá-la, quando a pessoa está pronta.',
        '2': 'Vença sete cultistas nos Penhascos de Cinza e me traga três pétalas-do-sol para minha lamparina.',
        say: 'Essa lamparina é mágica?'
      },
      waiting: {
        '1': 'Sete cultistas, três pétalas-do-sol. Vença-os com gentileza. Todo mundo merece uma segunda chance.',
        say: 'Sobre o seu teste...'
      },
      favorDone: {
        '1': 'Ah, olhe só para elas! A lamparina vai brilhar dourada por um mês.',
        '2': 'E você também, meu bem. Vou adorar te ensinar.',
        say: 'Os cultistas foram vencidos. Aqui estão suas pétalas-do-sol.'
      },
      class: {
        '1': 'Nós levamos a aurora. Luz para lutar, luz para curar, luz para se esconder atrás.',
        '2': 'A Inteligência deixa a luz forte. O Carisma a deixa quentinha. Você vai querer os dois.',
        say: 'O que um Portador da Luz faz?'
      },
      ready: {
        strong: {
          '1': 'Você brilha como um nascer do sol, meu bem. Escolha a lição que quiser.'
        },
        able: {
          '1': 'Brilhando bonito! Já dá para a próxima.'
        },
        weak: {
          '1': 'Ainda não, meu bem. Sua luz está meio fraquinha. Mais Carisma, e você vai brilhar.'
        }
      },
      who: {
        '1': 'Eu já cantei num grande templo. Mas minha lamparina aqui guia os barcos para casa. Isso é melhor.'
      },
      trainBack: {
        '1': 'Que lindo. Agora vá alegrar o dia de alguém. Ordens da Irmã.'
      },
      bye: {
        '1': 'Pode ir, meu bem. E sorria para os cantos escuros. Eles detestam isso.'
      }
    },
    sbMasterBeastcaller: {
      hello: {
        '1': 'Cuidado onde pisa. Essa é a Amora. Ela chegou primeiro.',
        '2': 'Rowan Thistlefoot. Gosto de animais. Gente, ainda estou decidindo.'
      },
      open: {
        '1': 'Ah, é você. A Amora estava esperando. Eu também. Um pouco.'
      },
      again: {
        '1': 'Você de novo. A Amora gosta de você. Eu ainda estou pensando.'
      },
      train: {
        '1': 'Abaixe-se. Mais devagar. Estenda a mão e deixe que eles venham até você. Isso.'
      },
      favor: {
        '1': 'Falar? Eu escuto. Esse é o truque que quase ninguém aprende.',
        '2': 'Aranhas gigantes estão enchendo de teias as trilhas dos animais no Bosque Sussurrante. Tire oito.',
        '3': 'Depois me traga dois sinos-lunares para a minha toca. A Amora dorme melhor perto deles.',
        say: 'Você fala com os animais?'
      },
      waiting: {
        '1': 'Oito aranhas, dois sinos-lunares. Os animais estão esperando. A Amora também.',
        say: 'Sobre o seu teste...'
      },
      favorDone: {
        '1': 'Hum. Os cervos desceram até o rio hoje de manhã. Achei que podia ser coisa sua.',
        '2': 'Tá bom. Eu te ensino. Nada de festa. Amora, para de abanar o rabo.',
        say: 'As trilhas estão livres, e aqui estão seus sinos-lunares.'
      },
      class: {
        '1': 'Você chama a natureza, e ela vem. Lobos, um falcão, um urso. Amigos, não bichos de estimação.',
        '2': 'Carisma, para que eles queiram vir. Vigor, para você acompanhar o ritmo deles.',
        say: 'O que é um Domador de Feras?'
      },
      ready: {
        strong: {
          '1': 'A matilha toda confia em você agora. Pegue o que quiser.'
        },
        able: {
          '1': 'Os lobos gostam de você. Já dá para a próxima.'
        },
        weak: {
          '1': 'Ainda não. Eles não confiam em você. Mais Carisma, e muito mais paciência.'
        }
      },
      who: {
        '1': 'Achei a Amora numa armadilha anos atrás. Três patas, muita atitude. Desde então somos uma dupla.',
        '2': 'Durmo no palheiro do estábulo. Cavalo ronca menos que gente.'
      },
      trainBack: {
        '1': 'Bom. Pode ir, então. E dê um oi para os corvos. Eles não esquecem.'
      },
      bye: {
        '1': 'Pode ir. A Amora mandou tchau.'
      }
    },
    sbMasterElementalist: {
      hello: {
        '1': 'Oi! Um segundo, estou fazendo malabarismo. Fogo, gelo, faísca, pedra e... peguei! Olá!',
        '2': 'Magistra Iris Fourwinds. Ensino os quatro elementos. Misturar é a parte divertida.'
      },
      again: {
        '1': 'Voltou! Ótimo, eu precisava de plateia. Olha só. Tcharam!'
      },
      train: {
        '1': 'Escolha duas esferas. Quaisquer duas. Agora deixe que elas se esbarrem. Devagar! Viu? Uma reação!'
      },
      class: {
        '1': 'A gente mistura! Gelo e depois fogo, derrete. Fogo e depois raio, bum. Todo par faz alguma coisa.',
        '2': 'Inteligência para toda magia. Técnica, porque as boas pedem mãos rápidas.',
        say: 'O que um Elementalista faz?'
      },
      ready: {
        strong: {
          '1': 'Agora você mistura com maestria! Escolha qualquer lição. Escolha duas!'
        },
        able: {
          '1': 'Uuh, que faísca bonita! Já dá para a próxima.'
        },
        weak: {
          '1': 'Ainda não! Seus elementos vivem apagando. Mais Inteligência, por favor.'
        }
      },
      sleeve: {
        '1': 'Ah! Está mesmo. Espere aí... Pronto.',
        '2': 'Fogo, depois gelo. Na verdade, isso foi uma lição. De nada!',
        say: 'Hã, sua manga está pegando fogo.'
      },
      trainBack: {
        '1': 'Brilhante! Agora pratique lá fora, por favor. As cortinas são novas.'
      },
      bye: {
        '1': 'Tchau! Se sentir cheiro de fumaça, provavelmente sou eu. Não se preocupe!'
      }
    },
    sbMasterSoulwarden: {
      hello: {
        '1': 'Shh, está tudo bem, eles são bonzinhos. Ah, não é com você. Eu estava falando com os fogos-fátuos.',
        '2': 'Guardiã Odalys Lanternlight. Eu ajudo espíritos perdidos a achar o caminho de casa.'
      },
      again: {
        '1': 'Olá de novo. Os fogos-fátuos se lembram de você. Aquele ali está acenando.'
      },
      train: {
        '1': 'Segure a lanterna baixa e fale baixinho. O que está perdido vem até uma voz gentil.'
      },
      class: {
        '1': 'Quando um inimigo é vencido, o espírito dele fica meio perdido. Nós o ajudamos, e ele nos ajuda de volta.',
        '2': 'Inteligência para guiar a luz. Carisma, para os espíritos quererem ficar um pouco.',
        say: 'O que um Guardião das Almas faz?'
      },
      ready: {
        strong: {
          '1': 'Até os espíritos mais tímidos vêm até você agora. Escolha qualquer lição.'
        },
        able: {
          '1': 'Os fogos-fátuos confiam em você. Já dá para a próxima lição.'
        },
        weak: {
          '1': 'Ainda não. Eles ainda têm vergonha de você. Mais Inteligência, e um pouco de Carisma.'
        }
      },
      wisps: {
        '1': 'Mais ou menos! São espíritos que se perderam. Este é o Inquieto. Ele gosta do lado quentinho.',
        '2': 'Nenhum espírito é mau, sabia? Só perdido. Eles voltam para casa quando estão prontos.',
        say: 'As luzinhas na sua lanterna estão vivas?'
      },
      trainBack: {
        '1': 'Muito bem. Agora solte-os com carinho. Eles tiveram um dia longo.'
      },
      bye: {
        '1': 'Cuide-se. E se vir uma luzinha perdida, diga olá.'
      }
    },
    sbMasterIronmonk: {
      hello: {
        '1': 'Sente-se. Respire. Não, você respira como quem está atrasado. De novo.',
        '2': 'Mestre Oru Stillwater. Ensino a mão aberta. Punhos de ferro, coração calmo.'
      },
      again: {
        '1': 'Ah. O aprendiz volta. O rio também. Todo dia.'
      },
      train: {
        '1': 'Pés como raízes, mãos como chuva. Golpeie. De novo. O centésimo é o que conta.'
      },
      class: {
        '1': 'Nada de lâmina. Mãos, pés, respiração. Cada golpe prepara o próximo, até o grande.',
        '2': 'Destreza para mãos rápidas. Vigor para manter a calma enquanto os outros perdem o fôlego.',
        say: 'O que é um Monge de Ferro?'
      },
      ready: {
        strong: {
          '1': 'O aprendiz vira mestre. Não conte a ninguém. Escolha qualquer lição.'
        },
        able: {
          '1': 'Bom. A xícara está enchendo. Faça a próxima lição.'
        },
        weak: {
          '1': 'Ainda não. Árvore de raiz curta cai com o vento. Mais Vigor.'
        }
      },
      noodles: {
        '1': 'É. O caldo cozinhou dois dias. Por favor, não respire em cima.',
        '2': 'Uma boa tigela ensina paciência. Uma ótima tigela ensina todo o resto.',
        say: 'Isso é uma tigela de macarrão?'
      },
      trainBack: {
        '1': 'Bom. Agora coma algo quente. A força vem da tigela.'
      },
      bye: {
        '1': 'Vá bem. Pise de leve. Chute forte.'
      }
    },
    sbMasterBard: {
      hello: {
        '1': 'Boas-vindas! Venha do frio pro calor, entre, por favor! Opa, rimou. Acontece.',
        '2': 'Lark Merriweather. Toco junto à lareira e ensino alaúde a quem quiser ouvir.'
      },
      again: {
        '1': 'Minha plateia favorita! Puxe um banquinho. Cuidado com a gata, ela é a crítica.'
      },
      train: {
        '1': 'Toque comigo. Um, dois e três... Não olhe para os dedos. Sinta!'
      },
      class: {
        '1': 'Canções que deixam o seu lado mais corajoso, melodias que fazem o outro lado dormir.',
        '2': 'Carisma para conquistar o público. Técnica, para os dedos acompanharem o coração.',
        say: 'O que um Bardo faz?'
      },
      ready: {
        strong: {
          '1': 'Agora você lotaria qualquer taverna! Leve todas as minhas canções.'
        },
        able: {
          '1': 'Que bela melodia! Já dá para o próximo verso.'
        },
        weak: {
          '1': 'Ainda não. O público ainda está bocejando. Mais Carisma, camarada.'
        }
      },
      story: {
        '1': 'Certa vez, um cavaleiro atravessou esta mesma ponte só com uma espada e uma canção...',
        '2': 'Espere, fica melhor com música. Lá-lá-lá, o cavaleiro foi... Onde eu estava?',
        '3': 'Ah, deixa pra lá. Mas a canção foi bonita, não foi?',
        say: 'Você me conta uma história?'
      },
      trainBack: {
        '1': 'Bravo! Pratique todo dia. Mesmo quando soar horrível. Principalmente aí.'
      },
      bye: {
        '1': 'Até mais, vá em paz! Opa. Rimou de novo. Tchau!'
      }
    }
  },
  invasion: {
    pylonsDown: 'O último pilar cai e seu tesouro se espalha!',
    reborn: {
      tusker: 'Tusker Renascido',
      emberLord: 'O Senhor das Brasas Infernal',
      frostJarl: 'O Jarl do Gelo Renascido',
      voidDragon: 'O Dragão do Vazio Renascido'
    }
  },
  enemy: {
    sphinx: "A Esfinge",
    leviathan: "O Leviatã",
    hydra: "A Hidra",
    elderDragon: "O Dragão Ancestral",
    trainingDummy: 'Boneco de Treino',
    goblin: 'Goblin',
    goblinSlinger: 'Goblin fundeiro',
    bandit: 'Bandido',
    banditArcher: 'Arqueiro bandido',
    wolf: 'Lobo',
    banditChief: 'Chefe dos bandidos',
    gnome: 'Gnomo',
    goblinKing: 'O Rei Goblin',
    treant: 'Ent',
    spider: 'Aranha gigante',
    broodSpider: 'Filhote de aranha',
    outlawCaptain: 'Capitão fora da lei',
    elderTreant: 'Ent ancião',
    warlord: 'Senhor da guerra Krag',
    fireElemental: 'Elemental de fogo',
    ironGolem: 'Golem de ferro',
    cultist: 'Cultista',
    emberLord: 'O Senhor das Brasas',
    ironColossus: 'O Colosso de Ferro',
    frostGiant: 'Gigante de gelo',
    naga: 'Naga',
    skeleton: 'Esqueleto',
    necromancer: 'Necromante',
    chimera: "A Quimera",
    chimeraTail: "Cauda de serpente",
    centaurWarchief: "O Chefe de Guerra Centauro",
    cyclops: "O Ciclope",
    frostJarl: 'O Jarl do Gelo',
    nagaOracle: 'A Oráculo Afogada',
    voidStalker: 'Espreitador do Vazio',
    wyvern: 'Serpe',
    highDemon: 'Alto demônio',
    voidWarden: 'O Carcereiro do Vazio',
    voidDragon: 'O Dragão do Vazio',
    doomKnight: 'Cavaleiro da perdição',
    imp: 'Diabrete',
    archDemon: 'O Arquidemônio',
    voidling: 'Cria do Vazio',
    voidLord: 'O Senhor do Vazio',
    demonPylon: 'Pilar Demoníaco',
    orderGuard: 'Inquisidor da Ordem',
    syndicateBlade: 'Lâmina do Sindicato',
    goblinWarchief: 'Caudilho Goblin',
    thornfather: 'Pai dos Espinhos',
    broodMother: 'Mãe da Ninhada',
    banditBaron: 'Barão Bandido',
    cinderGolem: 'Golem de Brasa',
    frostHowler: 'Uivador da Geada',
    tideSerpent: 'Serpente da Maré',
    riftKnight: 'Cavaleiro da Fenda',
    wyvernMatriarch: 'Matriarca Serpe',
    tusker: 'Tusker, o Javali de Guerra',
    tuskerCameo: 'Tusker',
    goblinTyrant: 'Tirano Goblin',
    voidDrake: 'Draco do Vazio',
    pitLord: 'Senhor do Abismo',
    frostThane: 'Thane do Gelo',
    hellhound: 'Cão infernal',
    frostHellhound: 'Cão infernal de gelo',
    gargoyle: 'Gárgula',
    harpy: 'Harpia',
    corruptedTreant: 'Ent corrompido',
    centaurRaider: 'Centauro saqueador',
    cyclopsBrute: 'Bruto ciclope',
    demonMiner: 'Minerador demoníaco',
    sphinxAcolyte: 'Acólito da esfinge',
    seaDemon: 'Demônio marinho',
    drakeHatchling: 'Filhote de dragão',
    hydraSpawn: 'Cria de hidra'
  },
  results: {
    careful: 'Vitória cuidadosa ×{mult}',
    victory: 'Vitória!',
    defeat: 'Derrota',
    retreat: 'Retirada',
    firstClear: 'Primeira vitória!',
    waves: 'Ondas vencidas: {n}',
    levelUp: 'Nível {n}!',
    points: '+{n} pontos de atributo',
    xp: 'Experiência',
    gold: 'Ouro',
    lost: 'Perdido',
    kills: 'Derrotados',
    chests: 'Baús',
    bosses: 'Chefes',
    mastery: 'Domínio da zona',
    masteryPct: '{n}%',
    newBest: 'Novo recorde!',
    time: 'Tempo',
    unlocked: 'Novo no mapa: {places}',
    equipped: 'Equipado',
    better: 'Melhor que o que você usa',
    retry: 'Tentar de novo',
    tip: 'Você fica com a experiência e o saque. Gaste seus pontos, visite um treinador e volte com mais força.'
  },
  pause: {
    title: 'Pausado',
    resume: 'Retomar',
    controls: 'Controles',
    retreat: 'Recuar para o mapa',
    retreatNote: 'Você fica com tudo o que ganhou até aqui, mas a zona não conta como limpa.'
  },
  ending: {
    more: 'O Arquidemônio caiu, mas o reino ainda não está a salvo. Resta uma grande ameaça ao mundo, e ela espera dentro da Fenda do Vazio.',
    order: {
      title: 'A Paz de Ferro',
      text: 'Os estandartes da Ordem de Ferro tremulam sobre a Fortaleza do Pavor. As estradas são seguras, as leis são muitas, e o seu nome está gravado acima do portão.'
    },
    syndicate: {
      title: 'A Barganha das Cinzas',
      text: 'O Sindicato governa das sombras da fortaleza. Nada mais é proibido no reino. Só é caro.'
    },
    circle: {
      title: 'A Era do Éter',
      text: 'O Círculo ilumina a fortaleza com fogo do Vazio capturado. Maravilhas jorram de seus portões, e ninguém pergunta quanto custam.'
    },
    free: {
      title: 'Sem reis',
      text: 'O trono está em pedaços e a fortaleza está vazia. Pela primeira vez em uma era, o reino pertence às pessoas que vivem nele.'
    },
    unbound: {
      title: 'Indomável',
      text: 'Você tomou o trono. Ordem, Sindicato e Círculo marcham juntos contra você. Que venham.'
    },
    note: {
      goblinPact: 'Mercadores goblins ainda pechincham na praça de Sunford.',
      goblinSlain: 'As Grutas estão vazias, e as caravanas chegam no horário.',
      goblinRansom: 'O Rei Goblin está rico de novo, e saqueando de novo.',
      oakhavenSaved: 'As muralhas de Oakhaven estão mais altas agora, e seus mercados mais cheios.',
      oakhavenFallen: 'O mato cresce pelas ruas de Oakhaven. O mercado negro prospera.',
      coreOrder: 'As minas de Ironhold estão quietas, e os anões voltaram a cavar.',
      coreCircle: 'As forjas de Ironhold brilham em azul, e suas armas de fogo são as melhores do reino.',
      coreSold: 'Em algum lugar, o núcleo ainda zumbe. Os golens ainda andam.',
      oracleFreed: 'Em dias calmos, pescadores veem a oráculo lá longe sobre a água.',
      oracleSlain: 'O Templo Submerso está em silêncio. Ninguém mais sabe o que vem depois.',
      dragonPact: 'Um dragão faz ninho no telhado da fortaleza, e só atende por um nome.',
      dragonSlain: 'Um crânio de dragão está pendurado no grande salão da Ordem.'
    }
  },
  options: {
    saves: {
      save: 'Salvar',
      load: 'Carregar',
      newGame: 'Começar novo jogo',
      newGameWarn: 'Seu jogo atual será substituído por um novo. Salve-o antes em um slot se quiser mantê-lo.',
      confirm: 'Certeza? Toque de novo',
      slot: 'Slot {n}',
      empty: 'Vazio',
      level: 'Nível {n}',
      levelAt: '{level} · {place}',
      overwriteAsk: 'Sobrescrever',
      saved: 'Salvo!',
      loadWarn: 'Carregar substitui seu jogo atual. Salve-o antes em um slot se quiser mantê-lo.',
      saveHint: 'Seu jogo se salva sozinho enquanto você joga. Salve uma cópia aqui para voltar a ela depois, por exemplo para testar outra build.',
      loadHint: 'Carregue uma cópia salva. O jogo recomeça a partir dela.'
    },
    gameplay: 'Jogabilidade',
    title: 'Opções',
    general: 'Geral',
    audio: 'Áudio',
    language: 'Idioma',
    difficulty: 'Dificuldade',
    soundEffects: 'Efeitos sonoros',
    music: 'Música',
    mute: 'Sem som',
    musicTrack: 'Faixa musical',
    musicTracks: {
      cozy: 'Calma',
      trance: 'Aventura'
    },
    haptics: 'Vibração',
    on: 'Ligado',
    off: 'Desligado',
    close: 'Fechar',
    keyboard: {
      auto: 'Detectar layout do teclado',
      layout: 'Layout do teclado',
      detected: 'Detectado: {layout}',
      bindings: 'Atalhos de teclas',
      press: 'Pressione uma tecla… (Esc para cancelar)',
      reset: 'Redefinir teclas'
    },
    actions: {
      up: 'Mover para cima',
      down: 'Mover para baixo',
      left: 'Mover à esquerda',
      right: 'Mover à direita',
      skill1: 'Habilidade 1',
      skill2: 'Habilidade 2',
      skill3: 'Habilidade 3',
      skill4: 'Habilidade 4',
      skill5: 'Habilidade 5',
      skill6: 'Habilidade 6',
      potion: 'Beber poção',
      manaPotion: 'Beber poção de mana',
      leave: 'Sair de uma zona vencida',
      interact: 'Falar',
      target: 'Próximo alvo',
      map: 'Mapa do mundo',
      character: 'Herói',
      inventory: 'Bolsa',
      skills: 'Habilidades',
      roll: 'Rolamento',
      elixir: 'Beber elixir',
      elixirNext: 'Próximo elixir',
      skill7: 'Habilidade 7',
      skill8: 'Habilidade 8'
    },
    difficulties: {
      easy: 'Fácil',
      medium: 'Médio',
      hard: 'Difícil'
    },
    difficultyHints: {
      easy: 'Os inimigos batem mais fraco e caem mais rápido.',
      medium: 'O desafio como foi planejado.',
      hard: 'Inimigos mais resistentes que batem mais forte.'
    }
  },
  adsBlocked: {
    title: 'Não foi possível exibir o anúncio',
    body: 'Tentamos mostrar um vídeo, mas algo no seu navegador está bloqueando anúncios.',
    allowPrefix: 'Permita anúncios em',
    allowSuffix: '(ou pause seu bloqueador para este jogo) e tente novamente.',
    gotIt: 'Entendi'
  },
  forcedDark: {
    title: 'Desative o modo escuro para este jogo',
    body: 'Seu navegador ou uma extensão está recolorindo esta página. O jogo tem as próprias cores e não funciona com modos escuros forçados.',
    waiting: 'O jogo continua sozinho assim que for desativado.',
    continueAnyway: 'Continuar por minha conta e risco',
    hint: {
      darkReader: 'Dark Reader: clique no ícone dele e desative para este site.',
      extension: 'Abra sua extensão de modo escuro e desative para este site.',
      chromiumFlag: 'Abra {flagUrl} e defina «Auto Dark Mode for Web Contents» como Default, ou desative «tema escuro para sites» nas configurações de tema do navegador.',
      samsung: 'Samsung Internet: abra o menu e desative o modo escuro, ou ative Labs → «Use website dark theme».',
      forcedColors: 'Windows: desative os temas de contraste em Configurações → Acessibilidade → Temas de contraste.',
      firefoxColors: 'Firefox: Configurações → Cores → defina «Substituir as cores especificadas pela página» como Nunca.'
    }
  },
  privacy: {
    policy: 'Política de privacidade',
    settings: 'Configurações de privacidade'
  },
  samsungFix: {
    title: 'Teste rápido de cores',
    body: 'Alguns celulares alteram as cores das páginas da web. Compare os dois quadrados abaixo.',
    question: 'Os dois quadrados parecem iguais?',
    refSquare: 'Quadrado de referência',
    pageSquare: 'Quadrado da página',
    yes: 'Sim, são iguais',
    no: 'Não, parecem diferentes',
    option: 'Corrigir cores (modo escuro da Samsung)',
    optionHint: 'Ative se os menus parecerem escuros ou o texto for difícil de ler.',
    recheck: 'Refazer o teste de cores'
  },
  saveStatus: {
    restoredTitle: 'Salvamento na nuvem restaurado',
    restoredBody: '+{n} de ouro de bônus pela recuperação',
    tap: 'toque',
    pausedTitle: 'Sincronização pausada',
    pausedBody: 'Jogando offline. Seu progresso está salvo aqui.',
    retry: 'Tentar de novo',
    dismiss: 'dispensar'
  },
  loading: {
    tooLong: 'O carregamento está demorando? Desative seu bloqueador de anúncios e recarregue.'
  },
  license: {
    denied: 'Acesso negado: adquira uma licença.'
  },
  leaderboard: {
    title: 'Classificação',
    rank: '#',
    player: 'Jogador',
    score: 'Experiência',
    flair: 'Nível',
    empty: 'Ainda não há ninguém no ranking. Seja o primeiro!',
    failed: 'Não foi possível carregar a classificação.',
    loading: 'Carregando…',
    you: 'Você',
    yourRank: 'Você é #{n} de {total}',
    of: 'de {n} jogadores',
    tabGlobal: 'Global'
  },
  iap: {
    title: 'Versão completa',
    body: 'Você derrotou o Rei Goblin e terminou a demo gratuita. Desbloqueie a versão completa uma única vez para continuar: novas terras, chefes e missões. Uma compra, sem assinatura.',
    unlock: 'Desbloquear versão completa por {price}',
    unlockNoPrice: 'Desbloquear versão completa',
    noAds: 'A versão completa também remove todos os anúncios.',
    ignore: 'Ignorar a compra da versão completa',
    ignoreHint: 'Para testes: os bloqueios da demo e os anúncios voltam. Desative para usar a sua compra de novo.',
    restore: 'Restaurar compras',
    notNow: 'Agora não',
    pending: 'Aguardando aprovação. A versão completa é desbloqueada assim que a compra for aprovada.',
    failed: 'A compra não foi concluída. Tente novamente.',
    restoreNone: 'Nenhuma compra anterior foi encontrada nesta conta Apple.',
    thanks: 'Obrigado! A versão completa está desbloqueada.',
    locked: 'Parte da versão completa',
    working: 'Conectando à App Store...'
  },
  wind: {
    title: 'Segundo fôlego',
    text: 'Você caiu. Quer se levantar com {n}% da sua saúde e terminar a luta?',
    once: 'Uma vez por visita.',
    watch: 'Assistir a um vídeo',
    take: 'Levantar',
    decline: 'Não, obrigado'
  },
  purse: {
    offer: 'Triplique a bolsa: +{n}'
  },
  shelf: {
    title: 'Itens raros',
    restock: 'Itens novos',
    tomorrow: 'Itens novos amanhã'
  },
  rested: {
    hud: '2× XP',
    banner: 'Bem-vindo de volta! Você está descansado: {time} de XP em dobro nas próximas lutas.',
    banner__f: 'Bem-vinda de volta! Você está descansada: {time} de XP em dobro nas próximas lutas.',
    hm: '{h} h {m} min',
    m: '{m} min',
    h: '{h} h'
  },
  preset: {
    title: 'Builds',
    name: 'Build {n}',
    rename: 'Nome da build {n}',
    save: 'Salvar',
    load: 'Usar',
    saved: '{name} salva.',
    loaded: '{name} ativada.',
    skipped: 'Ficou de fora: {list}'
  },
  respec: {
    title: 'Esqueça seu treinamento',
    note: 'Recupere os {n} pontos de atributo que você gastou e gaste de novo.',
    none: 'Você ainda não tem pontos para recuperar.',
    free: 'Esquecer (grátis)',
    buy: 'Esquecer ({n} de ouro)',
    confirm: 'Tem certeza? Toque de novo',
    bench: 'Estas habilidades voltam para a prateleira: {list}',
    done: 'Pronto. Seus pontos são seus de novo para gastar.'
  },
  contract: {
    title: 'Quadro de contratos',
    lead: 'Cada facção posta um trabalho por dia. Eles contam enquanto você joga; entregue em qualquer cidade.',
    slay: 'Derrote: {enemy} — {place}',
    clear: 'Vença uma visita a {place}',
    chests: 'Abra baús em qualquer lugar',
    rep: '+1 reputação',
    handIn: 'Entregar',
    handed: 'Feito por hoje',
    thanks: '{name} agradece a você.'
  },
  rep: {
    title: 'Reputação',
    meter: '{name}: reputação {n}',
    giftAt: 'Presente em +{n}',
    giftClaim: 'Pegar presente',
    giftTaken: 'Presente pego',
    giftGot: 'Um presente para você: 300 de ouro e {item}.',
    giftGold: 'Um presente para você: 300 de ouro.',
    blessAt: 'Bênção em +{n}',
    bless: {
      order: 'Abençoado: +5% de vida',
      syndicate: 'Abençoado: +10% de ouro dos abates',
      circle: 'Abençoado: +10% de regeneração de mana',
      order__f: 'Abençoada: +5% de vida',
      syndicate__f: 'Abençoada: +10% de ouro dos abates',
      circle__f: 'Abençoada: +10% de regeneração de mana'
    }
  },
  ladder: {
    tab: 'Coliseu',
    wave: 'Onda',
    week: 'Esta semana: {mod}',
    weekBest: 'Melhor da semana: onda {n}',
    yourBest: 'Seu melhor desta semana: onda {n}',
    none: 'Ainda sem subida esta semana.',
    mod: {
      fire: 'Tudo fogo',
      nopotions: 'Sem poções',
      glass: 'Vidro',
      swarm: 'Enxame',
      elites: 'Desfile de elite',
      haste: 'Pressa'
    },
    modDesc: {
      fire: 'cada golpe inimigo é de fogo',
      nopotions: 'sem poções',
      glass: 'todo mundo bate 50% mais forte',
      swarm: 'mais inimigos, com menos vida cada um',
      elites: 'um campeão em cada onda',
      haste: 'os inimigos se movem e batem mais rápido'
    }
  },
  forge: {
    upgrade: 'Melhorar ({n} de ouro)',
    next: 'Próximo +{level}: +{pct}% de atributos',
    town: 'Qualquer ferreiro de uma cidade pode melhorar isto.'
  },
  ore: {
    'demonglass': { 'name': "Vidro demoníaco" },
    'ichor': { 'name': "Icor mítico" },
    iron: {
      name: 'Minério de ferro'
    },
    silver: {
      name: 'Minério de prata'
    },
    gold: {
      name: 'Minério de ouro'
    },
    mithril: {
      name: 'Minério de mithril'
    },
    adamant: {
      name: 'Minério de adamantita'
    },
    aetherite: {
      name: 'Minério de eterita'
    }
  },
  plant: {
    sunpetal: {
      name: 'Pétala-do-sol',
      desc: 'Uma flor amarelo-viva. Os curandeiros juram por ela.'
    },
    glowcap: {
      name: 'Chapéu-luz',
      desc: 'Um cogumelo que brilha no escuro. Bom para a mente.'
    },
    swiftfern: {
      name: 'Samambaia-veloz',
      desc: 'Uma samambaia leve. Esfregue nas botas e corra.'
    },
    ironmoss: {
      name: 'Musgo-de-ferro',
      desc: 'Musgo duro das pedras. Deixa a pele rígida.'
    },
    emberbloom: {
      name: 'Flor-de-brasa',
      desc: 'Uma flor que parece quente na mão.'
    },
    frostmint: {
      name: 'Menta-gelada',
      desc: 'Folhas frias e frescas. Elas clareiam a cabeça.'
    },
    moonbell: {
      name: 'Sino-lunar',
      desc: 'Uma flor pálida e rara que aguça a visão.'
    },
    shadowthorn: {
      name: 'Espinho-sombrio',
      desc: 'Um espinho escuro e raro. Forte, e um pouco malvado.'
    }
  },
  journal: {
    errands: 'Pedidos',
    empty: 'Seu diário ainda está vazio. O pessoal da cidade vai pedir sua ajuda.',
    from: 'Para {npc}',
    ready: 'Pronto! Volte até {npc}.',
    taken: 'Novo pedido: {title}',
    done: 'Pedido concluído: {title}',
    step: {
      slay: 'Derrote {n} × {enemy}',
      slayAt: 'Derrote {n} × {enemy} em {place}',
      slayAnyAt: 'Derrote {n} inimigos em {place}',
      clear: 'Limpe {place}',
      visit: 'Vá até {place}',
      gather: 'Colete {n} × {plant}',
      bring: 'Leve {item}',
      pieces: 'Encontre {n} pedaços do mapa do tesouro',
      dig: 'Cave atrás do tesouro em {place}',
      talk: 'Fale com {npc}'
    }
  },
  board: {
    title: 'Mural de {town}',
    read: 'Ler',
    lead: 'As tarefas de hoje. Entregue aqui quando terminar.',
    kind: {
      slay: 'Caça',
      gather: 'Ervas',
      escort: 'Caravana'
    },
    slay: 'Derrote {n} × {enemy} em {place}',
    gather: 'Traga {n} × {plant}',
    escort: 'Proteja a caravana na estrada para Oakhaven',
    xp: '+{n} XP',
    setOut: 'Partir',
    thanks: 'Pronto! A cidade agradece.'
  },
  escort: {
    start: 'Proteja a caravana até o fim da estrada!',
    waiting: 'A caravana está esperando você.',
    arrived: 'A caravana chegou!',
    lost: 'A caravana se perdeu…'
  },
  elixir: {
    might: {
      name: 'Elixir do poder',
      desc: '+{n}% de dano por 5 minutos'
    },
    iron: {
      name: 'Trago pele de ferro',
      desc: '+{n}% de armadura por 5 minutos'
    },
    swift: {
      name: 'Tônico da ligeireza',
      desc: '+{n}% de velocidade e velocidade de ataque por 5 minutos'
    },
    mind: {
      name: 'Infusão da mente clara',
      desc: 'Habilidades recarregam {n}% mais rápido por 5 minutos'
    },
    vigor: {
      name: 'Elixir do vigor',
      desc: 'Cura {n}% da sua vida a cada segundo por 5 minutos'
    },
    shadow: {
      name: 'Trago sedento',
      desc: 'Seus golpes curam você em {n}% do dano causado por 5 minutos'
    }
  },
  alchemy: {
    talk: 'Entram ervas, saem elixires. Qual vamos preparar?',
    lead: 'Cada elixir age por 5 minutos em combate. Beba do seu terceiro frasco. Você pode levar {n} de cada.',
    brew: 'Preparar · {n}',
    carry: 'Levar este',
    carried: 'No seu frasco',
    count: '{n} / {max}',
    herb: '{plant}: {have} de {n}',
    done: 'Pronto!',
    why: {
      full: 'Você já leva o máximo deste.',
      herbs: 'Ervas insuficientes. Colete mais na natureza.',
      gold: 'Ouro insuficiente.'
    }
  },
  memory: {
    title: 'A Banca da Memória',
    lead: 'Encontre todos os pares antes que a areia acabe e ganhe o dobro da sua aposta. Cinco vitórias seguidas somam um prêmio lendário.',
    bet: 'Apostar {n}',
    row: 'Vitórias seguidas: {n} de {max}',
    pairs: '{n} pares · {s} segundos',
    won: 'Todos os pares encontrados! Você ganha {n} de ouro.',
    lost: 'A areia acabou. A aposta já era.',
    again: 'Jogar de novo',
    noGold: 'Ouro insuficiente para essa aposta.',
    card: 'Carta {n}'
  },
  cups: {
    title: 'Barraca dos copos',
    lead: 'Veja a gema, siga o copo dela e depois escolha. Cada vitória seguida paga mais. A terceira traz uma peça de prêmio, a quinta um tesouro.',
    free: 'Rodada grátis',
    fee: 'Jogar · {n}',
    row: 'Vitórias seguidas: {n} de {max}',
    next: 'Próxima vitória: {n} de ouro',
    watch: 'Olhe a gema!',
    follow: 'Siga-a…',
    pick: 'Escolha um copo!',
    hint: 'Toque num copo ou aperte o número dele.',
    won: 'Achou! +{n} de ouro',
    lost: 'Esse não. A sequência recomeça.',
    near: 'Quase! Estava bem ao lado.',
    timeout: 'Muito lento! A sequência recomeça.',
    again: 'Jogar de novo',
    noGold: 'Ouro insuficiente. Amanhã sua primeira rodada é grátis.',
    cup: 'Copo {n}'
  },
  battle: {
    title: 'Duelo de Itens',
    lead: 'Coloque um item contra o do apostador: o maior preço de venda leva o ponto, dois pontos vencem. Seus itens se vão de qualquer jeito. Três vitórias seguidas trazem uma peça de prêmio.',
    fee: 'Sentar · {n}',
    row: 'Vitórias seguidas: {n} de {max}',
    needItems: 'Você precisa de pelo menos {n} itens não equipados na bolsa.',
    noGold: 'Ouro insuficiente para a taxa.',
    theirs: 'O apostador coloca',
    pick: 'Escolha um item',
    lay: 'Colocar',
    value: '{n} de ouro',
    score: 'Você {a} · {b} Apostador',
    roundWon: 'O seu vale mais. Ponto para você!',
    roundLost: 'O outro vale mais. Ponto para o apostador.',
    won: 'Você venceu a partida! +{n} XP',
    lost: 'O apostador venceu a partida.',
    again: 'Jogar de novo'
  },
  gamble: {
    prize: 'Prêmio: {item}!',
    prizeGold: 'Você já tem todos, então ganha {n} de ouro no lugar!'
  },
  errand: {
    farmersFavor: {
      title: 'Os lobos dos Toller'
    },
    herbalistFavor: {
      title: 'As pétalas-do-sol de Briar'
    },
    collectorFavor: {
      title: 'Os sinos-lunares do Colecionador'
    },
    mirelaFavor: {
      title: 'As entregas sumidas de Mirela'
    },
    treasureMap: {
      title: 'O mapa do tesouro do Capitão Rook'
    },
    windrunnerTest: {
      title: 'A prova: Corredor do Vento'
    },
    frostwardenTest: {
      title: 'A prova: Guardião do Gelo'
    },
    lightbringerTest: {
      title: 'A prova: Portador da Luz'
    },
    beastcallerTest: {
      title: 'A prova: Domador de Feras'
    }
  }
}
