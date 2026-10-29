// Traditional Chinese, Taiwan (zh-TW) bundle — mirrors en.ts.
export default {
  // ─── Afterplay phase 8: items, materials and capstones ───
  // ─── Afterplay phase 10: the prestige classes ───
  'prestige': { 'toast': { 'wanderer': "一位神秘旅人在要塞等候。" } },
  'relic': {
    'infernal': "{name}·煉獄",
    'set': "與{item}同時裝備：",
    'heroicBadge': "英雄{n}",
    'heroic': "英雄{n}：{gold}金幣，{glass}惡魔玻璃",
    'heroicIchor': "英雄{n}：{gold}金幣，{glass}惡魔玻璃，{ichor}靈液",
    'heroicMax': "所有英雄階級均已獲得。",
    'infernalForge': "煉獄鍛造：{gold}金幣，{glass}惡魔玻璃",
    'lens': "神諭之鏡：{boss}在此等候。",
    'hydraKey': "已封印。九頭蛇的火焰鑰匙能開啟裂隙之心。",
    'marksGlass': "用{marks}枚徽記購買{glass}惡魔玻璃",
    'capstone': "奧義",
    'fortOnly': "此奧義只在堡壘渡口傳授。"
  },
  // ─── The fort's fair games (afterplay §9) ───
  'fair': {
    'fee': "遊戲 · {n}",
    'again': "再玩一次",
    'noGold': "金幣不足。",
    'capped': "距大獎恢復還需清理的區域：{n}",
    'top': "大獎！+{gold} 金幣，+{xp} 經驗",
    'topGold': "大獎（僅金幣）：+{n} 金幣",
    'won': "贏了！+{n} 金幣",
    'lost': "運氣不好，連勝重新開始。",
    'row': "連勝：{n} / {max}",
    'mats': "+{n} 英雄+材料",
    'discount': "鐵匠現在給你強化打 {n}% 折扣！"
  },
  'whack': {
    'title': "打小鬼",
    'lead': "30 秒內打中 20 隻小鬼。別碰金甲小鬼：打中一隻就扣一條命。",
    'hits': "小鬼：{n} / {max}",
    'lives': "生命：{n}",
    'time': "時間：{n} 秒",
    'hint': "點擊小鬼，或按 1 到 9。",
    'barrel': "木桶 {n}",
    'timeout': "時間到！",
    'dead': "生命耗盡！"
  },
  'ring': {
    'title': "九頭蛇套圈",
    'lead': "按住蓄力，放開投擲。蛇頭只有擺到中間附近時才能套中。連續套中，每個頭多得一分。",
    'hint': "在桌上按住並放開，或按住空白鍵。",
    'rings': "剩餘圈數：{n}",
    'score': "得分：{n}",
    'hit': "套中！+{n}",
    'miss': "沒中！",
    'perfect': "完美一輪！",
    'nothing': "得分 {n}，這次沒有獎品。",
    'power': "力量"
  },
  'arm': {
    'title': "比腕力",
    'lead': "圓環與圓圈重合時點擊，把他的手壓下去。力量會放寬節拍。連勝三次獲得鍛造折扣，連勝五次獲得英雄+材料。",
    'hint': "點擊桌面，或按空白鍵。",
    'good': "壓！",
    'off': "節拍錯了！"
  },
  // ─── The Siege of Bastion (afterplay §8) ───
  'siege': {
    'title': "堡壘渡口攻防戰",
    'lead': "守住城門十波。每波之間，用攻城徽記修建防禦。",
    'story': "大軍已到城門。撐過十波：這第一場攻防戰不會失敗。",
    'bell': "攻城鐘聲響起！大軍正在城門前集結。",
    'mapBell': "攻防戰！",
    'start': "敲響鐘聲",
    'wins': "勝利：{n}",
    'marksBank': "已存攻城徽記：{n}",
    'tier': {
      'normal': "普通",
      'hard': "困難",
      'nightmare': "噩夢"
    },
    'tierDesc': {
      'normal': "敵人比你高一級。",
      'hard': "敵人高3級，生命多30%。",
      'nightmare': "敵人高6級，並有兩波神話菁英。"
    },
    'locked': {
      'hard': "先贏下一場普通攻防戰。",
      'nightmare': "封印裂隙或讓它半開之後開放。"
    },
    'lord': "攻城領主",
    'hud': {
      'wave': "第{n}/{total}波",
      'marks': "徽記：{n}",
      'gate': "城門 {pct}%",
      'build': "{s}秒後第{n}波",
      'ready': "準備好了！",
      'buy': "{name}：{n}枚徽記"
    },
    'def': {
      'ballista': {
        'name': "弩車",
        'desc': "每2秒沿自己的通道射出一支穿透弩箭。"
      },
      'cauldron': {
        'name': "火焰大鍋",
        'desc': "點燃所在通道的狹窄處。"
      },
      'barricade': {
        'name': "路障",
        'desc': "封鎖一條通道20秒。"
      },
      'militia': {
        'name': "民兵",
        'desc': "兩名衛兵在你身邊作戰。"
      },
      'repair': {
        'name': "修理城門",
        'desc': "恢復城門的四分之一。"
      }
    },
    'block': {
      'marks': "攻城徽記不足。",
      'full': "沒有位置了。",
      'phase': "只能在兩波之間。"
    },
    'toast': {
      'cleared': "守住第{n}波！徽記+{marks}",
      'clearedUnharmed': "守住第{n}波，城門無損！徽記+{marks}",
      'horn': "號角響起！城門只剩{pct}%。",
      'ram': "攻城槌！在它抵達城門前攔住它！",
      'rally': "重新站起來了！守住城門！"
    },
    'banner': {
      'wave': "第{n}波",
      'final': "攻城領主！"
    },
    'result': {
      'tier': "堡壘渡口攻防戰：{tier}",
      'waves': "守住的波數：{n}/{total}",
      'marks': "保留的攻城徽記：{banked}/{earned}",
      'glass': "惡魔玻璃：+{n}"
    },
    'milestone': {
      'normal1': "達成里程碑：堡壘戰旗。",
      'normal5': "達成里程碑：城牆守衛胸甲。",
      'hard1': "達成里程碑：老兵直覺，第五個被動欄位。",
      'hard5': "達成里程碑：破門者。",
      'nightmare1': "達成里程碑：最後堡壘之冠。",
      'hardFlawless': "達成里程碑：隱藏職業試煉的鑰匙。"
    }
  },
  // ─── The Breaking (the afterplay's story) ───
  'breaking': {
    'title': "大崩裂",
    'toast': {
      brk6: "鍛造大師奪回了他的鍛爐。地獄鍛造已開放。",
      brk7: "斯芬克斯死了。神諭者的透鏡能顯示巨獸潛伏之處。",
      brk8: "利維坦死了。牠的鱗片讓你能在淺水上行走。",
      brk9: "九頭蛇死了。牠的火焰鑰匙歸你了。",
      brk10: "上古巨龍死了。裂隙敞開著。",
      sealed: "裂隙已被封印。你成為了「封隙者」。",
      ajar: "裂隙仍留著一道縫。惡魔會來考驗城牆和鬥技場。",
      'brk2': "堡壘渡口接納了你。這裡的人們如今都指望著你。",
      'rescued': "倖存者獲救！他們在堡壘渡口很安全。",
      'brk3': "道路已經暢通。桑佛德的人們安全了。",
      'brk4': "草藥師加入了要塞。",
      'brk5': "半人馬戰團被擊潰了。要塞正準備迎接圍攻。",
    },
  },
  // ─── The intro (#130): its skip, and its narrator's name ───
  intro: {
    narrator: '說書人',
    skip: '跳過',
    holdKey: '按住{key}跳過',
    holdTouch: '按住跳過',
    replay: '觀看開場'
  },
  arena: {
    allWon: '所有神話獎品都歸你了。',
    call: '故事已經說完。現在證明你的配置吧：盡你所能往上爬，贏得別處無人能給你的神話獎品。',
    prize: '{item}歸你了！',
    milestone: '第{n}波！',
    next: '下一個獎品在第{at}波：{item}',
    champion: '冠軍波',
    wave: '第{n}波'
  },
  sellOre: {
    talk: '好礦石，公道價。你要賣多少？',
    lead: '選擇每種礦石要賣幾塊。按下「出售」前不會賣出任何東西。',
    have: '擁有 {n}',
    each: '每塊 {n} 金幣',
    none: '不賣',
    all: '全部',
    less: '{ore}減一塊',
    more: '{ore}加一塊',
    total: '你將獲得：{n} 金幣',
    sell: '出售',
    selectAll: '全選',
    empty: '你沒有可賣的礦石了。'
  },
  smith: {
    why: {
      max: '兩件都已擁有，且已鍛到頂。',
      gold: '金幣不足。',
      ore: '礦石不足。',
      metal: '先開採這種礦石。',
      learn: '得先有鐵匠教你。'
    },
    stamp: '鍛造',
    take: '收下',
    worked: '{item}已鍛至+{n}',
    made: '{item} +{n}',
    grade: {
      perfect: '完美！',
      great: '出色之作！',
      good: '不錯之作',
      poor: '粗糙之作'
    },
    hint: '光芒位於熱點時，點擊「敲」或按空白鍵。',
    strikes: '第{n}/{max}擊',
    strike: '敲！',
    forge: '鍛造',
    gold: '{n}金幣',
    nuggets: '{ore}：{have}/{n}',
    master: '一記絕佳的敲擊能讓它成為{item}。',
    locked: '先開採{ore}，才能學會用它打造的物件。',
    lead: '你開採的每種金屬都會解鎖能用它打造的物件。在光芒最熾熱處敲擊：三次敲擊決定成品。',
    talk: '打鐵要趁熱，鐵可不等人。'
  },
  gameName: 'Battlecross',
  cancel: '取消',
  close: '關閉',
  ok: '確定',
  continue: '繼續',
  onlyAvailableOn: '本遊戲僅在以下平台提供：',
  ui: {
    next: '下一個',
    replay: '重玩',
    back: '返回',
    play: '開始',
    pause: '暫停',
    menu: '選單',
    home: '首頁',
    info: '資訊',
    help: '操作說明',
    ok: '知道了',
    continue: '繼續'
  },
  hud: {
    level: 'Lv.{n}',
    health: '生命 {n}/{max}',
    mana: '魔力 {n}/{max}',
    heat: '熱量',
    xp: '經驗',
    gold: '{n} 金幣',
    potion: '生命藥水（剩 {n} 瓶）',
    manaPotion: '魔力藥水（剩 {n} 瓶）',
    potionStop: '喝下生命藥水以繼續',
    groups: '已擊敗 {n}/{total} 群敵人',
    wave: '第 {n} / {total} 波',
    roll: '翻滾',
    elixir: '{name}（剩 {n} 瓶）',
    elixirNext: '下一種靈藥'
  },
  menu: {
    map: '世界地圖',
    character: '英雄',
    skills: '技能',
    inventory: '背包',
    journal: '日誌'
  },
  combat: {
    dodge: '閃避',
    block: '格擋',
    immune: '免疫'
  },
  level: {
    mine: '開採',
    open: '打開',
    guarded: '有守衛',
    locked: '已鎖住',
    potion: '藥水 +1',
    manaPotion: '魔力藥水 +1',
    leave: '離開',
    chestsLeft: '這裡還有 {n} 個寶箱未開'
  },
  status: {
    stun: '暈眩',
    knockup: '擊飛',
    knockdown: '擊倒',
    stasis: '靜滯',
    petrify: '石化',
    frozen: '冰凍',
    fear: '恐懼',
    slow: '緩速',
    confuse: '混亂',
    taunt: '被嘲諷',
    armorShred: '破甲',
    weaken: '虛弱',
    vulnerable: '易傷',
    burn: '燃燒',
    poison: '中毒',
    bleed: '流血',
    delayed: '延遲傷害',
    haste: '加速',
    attackSpeed: '攻速提升',
    damageUp: '強化',
    defenseUp: '堅守',
    regen: '再生',
    lifestealUp: '生命竊取',
    invulnerable: '無敵',
    unkillable: '不死',
    stealth: '隱匿',
    reflect: '反射',
    envenom: '淬毒之刃',
    exosuit: '外骨骼裝甲',
    focus: '專注',
    accelerate: '時間加速',
    overheat: '過熱',
    enrage: '狂怒',
    ambush: '伏擊',
    elixirMight: '力量靈藥',
    elixirIron: '鐵膚',
    elixirSwift: '迅捷',
    elixirMind: '清心',
    elixirVigor: '活力',
    elixirShadow: '渴血之刃',
    chi: '氣'
  },
  toast: {
    cageLocked: '鎖住了。鑰匙一定就在這附近某處。',
    cageKey: '一把鑰匙！一定能打開籠子。',
    ore: '採到：{n} × {ore}',
    mineBusy: '敵人就在附近！',
    pressureUp: '敵人變得更兇猛了 {skulls}',
    pressureDown: '敵人的攻勢緩和了 {skulls}',
    item: '獲得：{item}',
    levelUp: '升上 {level} 級！屬性點 +3',
    boss: '{boss}現身',
    wave: '第 {n} 波',
    herb: '採到：{plant}',
    piece: '藏寶圖的碎片！'
  },
  coach: {
    move: {
      touch: '點一下地面就會走過去，也可以用搖桿。',
      mouse: '點一下地面就會走過去，也可以用移動鍵控制方向。'
    },
    target: {
      touch: '點一下敵人，或從英雄拖曳到敵人身上，就能攻擊。',
      mouse: '點一下敵人就能攻擊。'
    },
    skill: {
      touch: '點一下技能，對目標施放。',
      mouse: '按下技能鍵，對目標施放。'
    },
    aim: {
      touch: '把技能拖曳到場上瞄準，放開手指就會施放。',
      mouse: '把技能拖曳到場上瞄準，放開按鍵就會施放。'
    },
    potion: {
      touch: '點一下藥水來補血。',
      mouse: '按下藥水鍵來補血。'
    },
    mana: {
      touch: '點一下藍色藥瓶，回復魔力。',
      mouse: '按下魔力藥水鍵，回復魔力。'
    },
    chest: {
      touch: '點一下寶箱就能打開。',
      mouse: '點一下寶箱就能打開。'
    },
    talk: {
      touch: '沿著路徑找到導師，點一下他就能交談。',
      mouse: '沿著路徑找到導師，點一下他就能交談。'
    },
    teach: {
      touch: '點一下「教教我」，看看這位師傅能教你什麼。',
      mouse: '點擊「教教我」，看看這位師傅能教你什麼。'
    },
    learn: {
      touch: '點一下技能，再點「學習」。',
      mouse: '點一下技能，再點「學習」。'
    },
    slot: {
      touch: '點一下新技能，再點一個欄位，就能帶它上戰場。',
      mouse: '把新技能拖曳到欄位上，就能帶它上戰場。'
    },
    equip: {
      touch: '點一下新裝備，比較綠色和紅色的數字，再點對應欄位穿上它。',
      mouse: '把新裝備拖曳到對應欄位上穿戴。綠色數字上升，紅色數字下降。'
    },
    attr: {
      touch: '點一下加號，花掉一點屬性點。',
      mouse: '點一下加號，花掉一點屬性點。'
    },
    travel: {
      touch: '點一下地圖上的下一個地點，再點按鈕前往。',
      mouse: '點一下地圖上的下一個地點，再點按鈕前往。'
    },
    buy: {
      touch: '點一下物品查看價格，再點「購買」。',
      mouse: '點一下物品查看價格，再點「購買」。'
    },
    exit: {
      touch: '點一下地圖按鈕，離開城鎮踏上下一段冒險。',
      mouse: '點一下地圖按鈕，離開城鎮踏上下一段冒險。'
    },
    roll: {
      touch: '點一下翻滾按鈕，就能閃開危險。翻滾的時候，什麼都傷不到你。',
      mouse: '按下翻滾鍵，就能閃開危險。翻滾的時候，什麼都傷不到你。'
    }
  },
  goal: {
    dummy: '打倒訓練木樁',
    clear: '清理{place}',
    boss: '擊敗{foe}',
    exit: '帶上戰利品離開',
    wave: '撐過所有波次',
    trainer: '找導師談談',
    learn: '學會一項技能',
    points: '用掉你的點數',
    leave: '動身去{place}',
    travel: '前往{place}',
    decide: '做出你的選擇',
    explore: '探索王國',
    fight: '贏下這場戰鬥',
    show: '幫我指路：{goal}',
    escort: '護送商隊'
  },
  node: {
    'bastion': {
      'name': "堡壘渡口",
      'desc': "古老的邊境要塞，仍然屹立的最後城牆。倖存者們聚集於此。",
    },
    sunford: {
      name: '桑佛德',
      desc: '平原邊緣的農村小鎮。這裡有家、一位鐵匠和兩位導師。'
    },
    plains: {
      name: '桑佛德平原',
      desc: '哥布林、野狼和盜賊在大路上騷擾商隊。'
    },
    hollows: {
      name: '哥布林洞窟',
      desc: '山丘底下的洞穴。哥布林王就在最深處。'
    },
    arena: {
      name: '競技場',
      desc: '一波接一波，一波比一波強。你能爬到多高？每週一更新新排行榜。'
    },
    woods: {
      name: '低語森林',
      desc: '會走路的老樹，還有在樹與樹之間結網的蜘蛛。'
    },
    outskirts: {
      name: '奧克赫文郊外',
      desc: '奧克赫文城外的農場正在燃燒。軍閥的大軍已兵臨城下。'
    },
    oakhaven: {
      name: '奧克赫文',
      desc: '有城牆環繞的貿易城鎮。它的未來由你決定。'
    },
    crags: {
      name: '灰燼峭壁',
      desc: '黑色岩石與熊熊烈火。邪教徒不斷替火焰添柴。'
    },
    mines: {
      name: '艾恩霍德礦坑',
      desc: '矮人挖得太深，吵醒了某個會發光的東西。'
    },
    ironhold: {
      name: '艾恩霍德',
      desc: '山裡的鍛造之城。王國最好的鋼鐵都在這裡打造。'
    },
    tundra: {
      name: '霜噬凍原',
      desc: '一片白茫茫的荒地，巨人在此遊蕩，死者不肯安息。'
    },
    temple: {
      name: '沉沒神殿',
      desc: '泡在水裡的納迦殿堂，還有一位看得見所有結局的神諭者。'
    },
    citadel: {
      name: '虛空堡壘',
      desc: '去年這裡還沒有這座堡壘。它的牆壁嗡嗡作響。'
    },
    peak: {
      name: '龍之巔',
      desc: '飛龍在山頂盤旋。上頭還睡著一個大得多的傢伙。'
    },
    fortress: {
      name: '恐懼要塞',
      desc: '大惡魔的巢穴，也是每個陣營都想搶的王座所在。'
    },
    rift: {
      name: '虛空裂隙',
      desc: '惡魔就是從這道傷口過來的。虛空領主在另一頭等著。'
    },
    silverbridge: {
      name: '西爾弗布里奇',
      desc: '建在古老石橋上的大河鎮。每個職業的大師都在這裡授課。'
    }
  },
  map: {
    title: '王國',
    town: '城鎮',
    levels: 'Lv.{min}–{max}',
    arenaBest: '最佳：第 {n} 波',
    travel: '前往',
    again: '再挑戰',
    enter: '進入',
    fight: '開戰',
    back: '回城鎮',
    locked: '通關相鄰的區域就能打通道路。',
    lockedArena: '解決哥布林王之後，大門就會開啟。',
    lockedRift: '恐懼要塞的王座有了歸屬後才會開啟。',
    invaded: '被侵佔',
    invadedDesc: '惡魔佔據了這片土地。牠們的塔柱會讓附近的敵人攻擊更猛，裂隙傷痕會灼燒並減速，而在此擊敗的每個敵人都更有價值。',
    lockedInvaded: '惡魔牢牢佔據著這裡。先奪回{zone}。',
    danger: {
      '1': '比你的等級高一點。',
      '2': '以你的等級來說很危險。',
      '3': '遠遠超過你的等級。'
    },
    questOpen: '{quest}：這裡有個抉擇等著你。',
    questDone: '{quest}：{choice}',
    trainer: '隱藏導師：{cls}',
    new: '新',
    trueTest: '真正的考驗',
    skip: '點一下跳過',
    compass: {
      n: '北',
      e: '東',
      s: '南',
      w: '西'
    },
    region: {
      vale: '朝陽草谷',
      hills: '哥布林丘陵',
      peaks: '鐵峰山脈',
      ash: '灰燼之地',
      frost: '霜境邊疆',
      fields: '金色原野',
      mere: '納迦沼澤',
      reach: '虛空邊境',
      dread: '恐懼之地',
      sea: '藍寶石海',
      bay: '商人海灣'
    },
    walkTouch: '點擊地圖走過去，或用搖桿操控',
    walkMouse: '點擊地圖走過去，或用 WASD 操控'
  },
  encounter: {
    kicker: '途中',
    title: {
      fight: '伏擊！',
      elite: '一位冠軍擋住了去路！',
      chest: '草叢裡有個寶箱！',
      merchant: '流浪商人'
    },
    result: '在{place}附近的路上',
    gold: '+{n} 金幣',
    xp: '+{n} 經驗'
  },
  travel: {
    to: '正在前往',
    loading: '載入中'
  },
  attr: {
    str: {
      name: '力量',
      short: '力量',
      desc: '近戰威力、格擋機率、重甲。'
    },
    dex: {
      name: '敏捷',
      short: '敏捷',
      desc: '爆擊、攻擊速度與移動速度。'
    },
    int: {
      name: '智力',
      short: '智力',
      desc: '法術強度、魔力、元素抗性。'
    },
    end: {
      name: '耐力',
      short: '耐力',
      desc: '生命、回復、護甲、暈眩抗性。'
    },
    skl: {
      name: '技巧',
      short: '技巧',
      desc: '爆擊傷害、冷卻、遠程武器。'
    },
    cha: {
      name: '魅力',
      short: '魅力',
      desc: '手下、商店價格、獎勵、對話選項。'
    }
  },
  stat: {
    damage: '傷害',
    health: '生命',
    mana: '魔力',
    armor: '護甲',
    resist: '抗性',
    crit: '爆擊率',
    critDamage: '爆擊傷害',
    attackSpeed: '攻擊速度',
    moveSpeed: '移動速度',
    cdr: '冷卻縮減',
    block: '格擋',
    dodge: '閃避',
    hpRegen: '生命 / 秒'
  },
  sheet: {
    points: '可分配點數：{n}',
    raise: '提升{attr}',
    maxLevel: '已達最高等級',
    next: '下一點：'
  },
  heroChoice: {
    title: '選擇你的英雄',
    boy: '扮演男孩',
    girl: '扮演女孩',
    switch: '你的英雄'
  },
  skills: {
    active: '主動技能',
    passive: '被動技能',
    known: '已學會',
    none: '還沒學會任何技能。到城鎮裡找導師吧。',
    emptySlot: '空欄位 {n}',
    equip: '裝上',
    remove: '卸下',
    unmet: '你已不符合它的需求。',
    how: '點一下技能，再點一個欄位，或直接拖曳過去。把它從欄位拖開即可卸下。',
    howSlot: '現在點一個欄位，把它放進去。',
    classCount: '{cls}：已學會 {n}/{total}',
    hint: {
      met: '可在{place}向{name}學習。',
      unmet: '{place}的一位導師會教這個。'
    }
  },
  class: {
    // ── The prestige classes (afterplay phase 10) ──
    'demonhunter': { 'name': "獵魔人", 'desc': "暗影與聖光，誓追同一獵物。標記惡魔，被標記者迅速倒下。" },
    'dragoon': { 'name': "龍騎兵", 'desc': "靴下生風，臂挽盾牌。自天而降，一槍貫穿整列敵人。" },
    'hexsmith': { 'name': "咒鐵匠", 'desc': "以鮮血滋養的以太工藝。建造砲塔吸取敵人生命，治療鐵匠。" },
    'tidecaller': { 'name': "喚潮者", 'desc': "冰霜與元素傾入大海。巨浪擊退並浸透敵人。" },
    aegis: {
      name: '神盾騎士',
      desc: '盾牌與神聖之鋼。把攻擊全扛下來，別人就不必挨打。'
    },
    shadow: {
      name: '影刃',
      desc: '從黑暗中現身，背後一擊，然後消失無蹤。'
    },
    pyro: {
      name: '火焰術士',
      desc: '任何問題，火焰都能解決。先點燃，再引爆。'
    },
    sovereign: {
      name: '大君主',
      desc: '何必單打獨鬥？召喚衛兵，指揮他們上場。'
    },
    chrono: {
      name: '織時者',
      desc: '讓敵人停在時間裡，替隊友加速，還能把失誤倒轉回去。'
    },
    blood: {
      name: '鮮血鍊金師',
      desc: '拿生命換力量，再從敵人身上吸回來。'
    },
    aether: {
      name: '乙太技師',
      desc: '槍械、砲塔加上熱量條。在技能被鎖住之前把熱量排掉。'
    },
    geo: {
      name: '地術師',
      desc: '升起石牆和尖刺，連大地都能打碎。'
    },
    windrunner: {
      name: '疾風行者',
      desc: '一把弓，背後有風。射擊、衝刺，永不停下。'
    },
    frostwarden: {
      name: '寒霜衛士',
      desc: '冰之刃，冷之心。緩速他們，凍住他們，再把他們擊碎。'
    },
    lightbringer: {
      name: '光明使者',
      desc: '治癒朋友、讓敵人目盲的光。站在光裡，沒有什麼能擋住你。'
    },
    beastcaller: {
      name: '喚獸師',
      desc: '狼群、巨熊和獵鷹在你身邊戰鬥。召喚牠們，指揮牠們。'
    },
    elementalist: {
      name: '元素使',
      desc: '火、冰、雷、石。把它們混在一起，一個會引發下一個。'
    },
    soulwarden: {
      name: '靈魂守望者',
      desc: '被打倒的敵人化為友善的靈魂，在你身邊戰鬥，然後回家安息。'
    },
    ironmonk: {
      name: '鋼鐵武僧',
      desc: '赤手空拳，腳步如飛。每次出擊都累積氣，全部灌進一記強力重擊。'
    },
    bard: {
      name: '吟遊詩人',
      desc: '歌聲鼓舞己方，曲調讓對手睡著或自相殘殺。'
    }
  },
  skill: {
    // ── The prestige classes (afterplay phase 10) ──
    'huntersMark': { 'name': "獵人印記", 'desc': "一發聖光弩矢，造成{dmg}%敏捷傷害。{dur}秒內目標受到的傷害提高{vuln}%，惡魔提高{demon}%。" },
    'demonsBane': { 'name': "惡魔剋星", 'desc': "對惡魔的傷害+{bane}%，受到惡魔的傷害降低{ward}%。" },
    'silverVolley': { 'name': "白銀齊射", 'desc': "沿直線射出白銀弩矢：{dmg}%敏捷傷害，對惡魔與被標記的敵人+{bane}%。" },
    'skyfallLeap': { 'name': "天墜躍擊", 'desc': "躍至搆不著的高處{air}秒，再原地墜下：{radius}公尺內造成{dmg}%力量傷害，擊倒敵人。" },
    'dragonBlood': { 'name': "龍之血", 'desc': "對首領的傷害+{boss}%，最大生命+{hp}%，且不會被擊退。" },
    'dragonLance': { 'name': "龍槍", 'desc': "沿直線一記槍刺：對線上每個敵人造成{dmg}%敏捷傷害。" },
    'hexTurret': { 'name': "咒術砲塔", 'desc': "建造一座砲塔，持續{dur}秒。每秒吸取{radius}公尺內最近的敵人，造成{dmg}%技巧傷害；你回復其中的{drain}%。" },
    'soulForge': { 'name': "靈魂熔爐", 'desc': "最大生命+{hp}%，每秒回復{regen}生命，受到的傷害降低{reduce}%。" },
    'hexBolt': { 'name': "咒術弩矢", 'desc': "支付{hp}%生命：一發造成{dmg}%技巧傷害的弩矢。你回復其中的{heal}%，敵人在{dur}秒內造成的傷害降低{weak}%。" },
    'tidalWave': { 'name': "潮汐巨浪", 'desc': "沿直線掀起巨浪：{dmg}%智力傷害，敵人被擊退並浸透（{dur}秒內減速{slow}%）。" },
    'seaborn': { 'name': "海之子", 'desc': "對受寒的敵人傷害+{bonus}%，受到的傷害降低{reduce}%，移動速度+{move}%。" },
    'undertow': { 'name': "暗流", 'desc': "持續{dur}秒的漩渦：在{radius}公尺內共造成{dmg}%智力傷害。將敵人捲入並減速{slow}%。" },
    'bastionWall': { 'name': "堡壘之牆", 'desc': "{dur}秒內，{radius} m內所有敵人都必須攻擊你，你受到的傷害降低{def}%。之後聖光造成{dmg}%力量+{back}%所受打擊的傷害。" },
    'thousandCuts': { 'name': "千刃", 'desc': "在{radius} m內的敵人之間穿梭，出手{hits}次，每次造成{dmg}%敏捷傷害。首領只會受到一擊。揮砍期間無法被擊中。" },
    'cinderSun': { 'name': "餘燼之日", 'desc': "一顆垂死的太陽在{dur}秒內崩碎：{meteors}塊燃燒的碎片，每塊造成{dmg}%智力傷害。" },
    'royalLegion': { 'name': "皇家軍團", 'desc': "召喚軍團{dur}秒：{archers}名弓手、{guards}名衛兵和{mages}名戰鬥法師。" },
    'stoppedHour': { 'name': "停滯之時", 'desc': "讓{radius} m內的時間停止{dur}秒。時間恢復時，每個敵人受到{dmg}%智力傷害。" },
    'redCovenant': { 'name': "血紅盟約", 'desc': "奪取{radius} m內每個敵人{pct}%的生命。你恢復其中的{heal}%。" },
    'orbitalLance': { 'name': "軌道之槍", 'desc': "一柄來自天空的光之槍灼燒你瞄準之處：{dur}秒內造成{dmg}%技巧傷害。" },
    'tectonicHeart': { 'name': "地脈之心", 'desc': "大地之心裂開：對附近一切造成{dmg}%力量傷害，碎石減速{dur}秒。" },
    'eyeOfTheGale': { 'name': "風暴之眼", 'desc': "持續{dur}秒的箭雨風暴：共{dmg}%技巧傷害，並減速{slow}%。" },
    'endlessWinter': { 'name': "無盡寒冬", 'desc': "無盡的寒冬從你身上爆發：{radius} m內造成{dmg}%智力傷害，凍結所有敵人{freeze}秒。" },
    'dawnbreak': { 'name': "破曉", 'desc': "化身黎明{dur}秒：每秒對{radius} m內造成{dmg}%智力傷害，並恢復{heal}%生命。" },
    'alphasCall': { 'name': "頭狼之喚", 'desc': "{wolves}匹狼響應召喚，與你同奔{dur}秒。整個狼群傷害+{dmg}%，移速提高{move}%。" },
    'prismStorm': { 'name': "稜光風暴", 'desc': "{dur}秒內四大元素肆虐：{strikes}次{dmg}%智力打擊，彼此引發。" },
    'ferryman': { 'name': "擺渡人", 'desc': "{dur}秒內，在你附近倒下的每個敵人都會化為你的靈魂起身，靈魂傷害提高{atk}%。" },
    'unmovingMountain': { 'name': "不動之山", 'desc': "耗盡全部氣：一座山壓下，造成{dmg}%敏捷傷害，每點氣+{per}%，並擊倒敵人。" },
    'encore': { 'name': "安可", 'desc': "再來一次，持續{dur}秒（速度、傷害、防禦+{buff}%），然後是最後一個和弦：{dmg}%魅力，敵人被魅惑。" },
    kind: {
      active: '主動',
      passive: '被動'
    },
    cooldown: '冷卻 {n}秒',
    mana: '{n} 魔力',
    hpCost: '{n}% 生命',
    heat: '+{n} 熱量',
    aimed: '拖曳瞄準',
    shieldSlam: {
      name: '盾牌猛擊',
      desc: '猛擊目標，造成{dmg}%力量傷害，並使其暈眩{stun}秒。'
    },
    aegisAura: {
      name: '神盾光環',
      desc: '護甲+{armor}%，受到的物理傷害降低{reduce}%。'
    },
    radiantStrike: {
      name: '光輝打擊',
      desc: '神聖的一擊，造成{dmg}%力量傷害，並依造成傷害的{heal}%為你補血。'
    },
    fortitude: {
      name: '堅毅',
      desc: '單次受到超過生命{hit}%的傷害時，獲得等同生命{shield}%的護盾，持續{dur}秒。每{icd}秒一次。'
    },
    tauntingCry: {
      name: '嘲諷戰吼',
      desc: '{radius} m內的敵人會攻擊你{dur}秒。這段期間你獲得{def}%防禦。'
    },
    holyBastion: {
      name: '神聖壁壘',
      desc: '無敵{dur}秒。攻擊你的敵人會被反彈自身傷害的{reflect}%。'
    },
    shadowstep: {
      name: '暗影步',
      desc: '出現在目標背後並背刺，造成{dmg}%敏捷傷害。'
    },
    lethality: {
      name: '致命',
      desc: '爆擊率+{crit}%，爆擊傷害+{critDmg}%。'
    },
    venomousBlade: {
      name: '劇毒之刃',
      desc: '{dur}秒內你的攻擊會讓敵人中毒，在{over}秒內造成{poison}%敏捷傷害，可疊加{stacks}次。'
    },
    evasion: {
      name: '迴避',
      desc: '閃避+{dodge}%。閃避成功後獲得{haste}%加速，持續{dur}秒。'
    },
    smokeBomb: {
      name: '煙霧彈',
      desc: '隱匿{dur}秒。隱匿中的下一次攻擊傷害+{bonus}%。'
    },
    danceOfBlades: {
      name: '刀鋒之舞',
      desc: '在{radius} m內的敵人之間衝刺，攻擊{hits}次，每次造成{dmg}%敏捷傷害。首領只會受到一擊。舞動期間你不會被打中。'
    },
    fireball: {
      name: '火球術',
      desc: '火球炸開，造成{dmg}%智力傷害，並在{burnDur}秒內再燃燒{burn}%。'
    },
    cauterize: {
      name: '燒灼',
      desc: '燃燒中的敵人對你造成的傷害降低{reduce}%。'
    },
    flamePillar: {
      name: '烈焰之柱',
      desc: '在瞄準處噴出火柱：{dur}秒內造成{dmg}%智力傷害。被捲入的敵人會被擊飛。'
    },
    pyromaniac: {
      name: '縱火狂',
      desc: '法術爆擊命中時，火系技能的冷卻減少{cut}秒。'
    },
    combustion: {
      name: '爆燃',
      desc: '引爆{radius} m內的所有燃燒：每個燃燒立刻以爆炸造成剩餘傷害的{pct}%。'
    },
    cataclysm: {
      name: '天災',
      desc: '在{dur}秒內召喚{meteors}顆隕石。每顆造成{dmg}%智力傷害。'
    },
    royalGuard: {
      name: '皇家衛兵',
      desc: '召喚一名衛兵在你身旁作戰，每擊造成{dmg}%魅力傷害。最多同時{max}名。'
    },
    inspiringPresence: {
      name: '鼓舞風範',
      desc: '你的手下攻擊加快{speed}%，生命提高{hp}%。'
    },
    commandFocus: {
      name: '集火號令',
      desc: '所有手下衝向目標：移動速度+{move}%、攻擊速度+{atk}%，持續{dur}秒。'
    },
    sovereignsTribute: {
      name: '君主的貢品',
      desc: '你受到的傷害有{share}%轉由手下承擔。'
    },
    bannerOfVictory: {
      name: '勝利戰旗',
      desc: '插下戰旗，持續{dur}秒。附近的隊友傷害+{dmg}%，每秒回復{regen}%生命。'
    },
    armyOfTheRealm: {
      name: '王國大軍',
      desc: '召喚{archers}名弓箭手、{guards}名衛兵和一名戰鬥法師，持續{dur}秒。'
    },
    temporalStasis: {
      name: '時間靜滯',
      desc: '把目標凍結在時間裡{dur}秒。它無法行動，也不會受傷。'
    },
    hasteField: {
      name: '加速領域',
      desc: '{dur}秒內，你和附近隊友的移動加快{move}%，攻擊加快{speed}%。'
    },
    timeDistort: {
      name: '時間扭曲',
      desc: '你受到的傷害有{share}%會延後，改在{over}秒內分攤。'
    },
    paradoxShift: {
      name: '悖論換位',
      desc: '和目標交換位置。它受到{dmg}%智力傷害，周圍的敵人混亂{confuse}秒。'
    },
    entropy: {
      name: '熵',
      desc: '每次施法讓你的冷卻縮短{cdr}%，可疊加{stacks}次。'
    },
    chronoRewind: {
      name: '時光倒流',
      desc: '回到{back}秒前所在的位置，並恢復當時的生命和魔力。'
    },
    sanguineFlask: {
      name: '鮮血藥瓶',
      desc: '丟出一瓶自己的血：範圍內造成{dmg}%耐力傷害，並破甲{shred}%，持續{shredDur}秒。'
    },
    bloodTransmutation: {
      name: '血液轉化',
      desc: '你受到的物理傷害有{share}%轉成魔力回到身上。'
    },
    essenceHarvest: {
      name: '精華收割',
      desc: '吸取{radius} m內的所有敵人，造成{dmg}%智力傷害。你回復其中的{heal}%。'
    },
    hemophilia: {
      name: '嗜血症',
      desc: '生命汲取增強{drain}%。打中流血的敵人會回復你{heal}%的生命。'
    },
    mutagenicRage: {
      name: '突變狂怒',
      desc: '{dur}秒內：攻擊速度+{speed}%、生命竊取+{steal}%、移動速度+{move}%。'
    },
    philosophersCrucible: {
      name: '賢者坩堝',
      desc: '做出一池沸騰的血，持續{dur}秒：對裡面的敵人造成{dmg}%智力傷害，你站在裡面時會補血。'
    },
    aetherPistol: {
      name: '乙太手槍',
      desc: '快速射擊，造成{dmg}%技巧傷害。累積{heat}點熱量。'
    },
    deployTurret: {
      name: '架設砲塔',
      desc: '放置一座砲塔，每發造成{dmg}%技巧傷害，持續{dur}秒。最多同時{max}座。'
    },
    ventHeat: {
      name: '排放熱量',
      desc: '把所有熱量以扇形噴出：最多造成{dmg}%技巧傷害，熱量越多傷害越高。'
    },
    thermalOverload: {
      name: '熱能超載',
      desc: '過熱時你的射擊爆擊傷害+{crit}%。過熱還是會把技能鎖住{lock}秒。'
    },
    orbitalBeam: {
      name: '軌道光束',
      desc: '從天而降的光束灼燒瞄準處：{dur}秒內造成{dmg}%技巧傷害。'
    },
    exoSuit: {
      name: '外骨骼裝甲',
      desc: '{dur}秒內：護甲+{armor}%，你的攻擊變成火箭，在範圍內造成{rocket}%技巧傷害。'
    },
    stoneSpike: {
      name: '岩石尖刺',
      desc: '尖刺從目標腳下刺出：造成{dmg}%力量傷害，並緩速{slow}%，持續{dur}秒。'
    },
    earthBarrier: {
      name: '大地屏障',
      desc: '升起一道岩牆，持續{dur}秒。誰都走不過去，也射不穿。'
    },
    seismicShock: {
      name: '地震衝擊',
      desc: '重擊地面：對{radius} m內造成{dmg}%力量傷害，並擊倒敵人{down}秒。'
    },
    earthenSkin: {
      name: '大地之膚',
      desc: '獲得等同力量{armor}%的護甲。你受到的暈眩縮短{cut}%。'
    },
    petrify: {
      name: '石化術',
      desc: '把目標變成石頭{dur}秒。它破石而出時受到的傷害提高{vuln}%。'
    },
    tectonicRupture: {
      name: '地殼撕裂',
      desc: '撕開戰場：對附近的一切造成{dmg}%力量傷害，碎石會緩速{dur}秒。'
    },
    scales: '隨{attr}提升',
    shieldThrow: {
      name: '盾牌投擲',
      desc: '你的盾牌在{bounces}個敵人間彈跳，每個造成{dmg}%力量傷害。它們的傷害降低{weak}%，持續{dur}秒。'
    },
    shieldShove: {
      name: '盾牌推撞',
      desc: '推開你面前的所有敵人，造成{dmg}%力量傷害。它們被擊退，正在做的事也被打斷。'
    },
    holyChains: {
      name: '神聖鎖鏈',
      desc: '光之鎖鏈把{radius} m內的所有敵人拉到你身邊：造成{dmg}%耐力傷害，並緩速{slow}%。'
    },
    bulwark: {
      name: '銅牆鐵壁',
      desc: '+{block}%格擋機率。每次格擋都對攻擊者反彈{back}點傷害。'
    },
    retribution: {
      name: '懲戒',
      desc: '{dur}秒內，{radius} m內的敵人必須攻擊你。之後聖光造成{dmg}%力量傷害，外加所受傷害的{back}%。'
    },
    unbreakable: {
      name: '堅不可摧',
      desc: '生命低於{hp}%時，你受到的傷害降低{reduce}%。'
    },
    starFan: {
      name: '星鏢扇',
      desc: '呈扇形擲出{stars}枚暗影星鏢，每枚造成{dmg}%敏捷傷害。'
    },
    grapplingHook: {
      name: '鉤爪',
      desc: '把目標拉到你身邊，造成{dmg}%敏捷傷害，並緩速{slow}%，持續{dur}秒。大型敵人會把你拉過去。'
    },
    silentStrike: {
      name: '無聲一擊',
      desc: '背刺傷害+{backstab}%，敵人發現你的時間延後{notice}%。'
    },
    shadowMark: {
      name: '暗影印記',
      desc: '目標在{dur}秒內受到的傷害提高{vuln}%，你對任何人的下一擊必定爆擊，傷害+{bonus}%。'
    },
    bladeRhythm: {
      name: '刀鋒韻律',
      desc: '爆擊讓所有冷卻減少{cut}秒。攻擊速度+{speed}%。'
    },
    nightshadeMist: {
      name: '顛茄毒霧',
      desc: '釋放毒霧，持續{dur}秒：最多造成{dmg}%敏捷傷害。困在其中的敵人混亂{confuse}秒。'
    },
    firecracker: {
      name: '鞭炮',
      desc: '在目標身上黏一串鞭炮。{delay}秒後炸開，造成{dmg}%智力傷害，並點燃附近的一切。'
    },
    fanTheFlames: {
      name: '煽風點火',
      desc: '{radius} m內的所有燃燒增強{pct}%並重新開始。{push} m內的敵人被吹飛。'
    },
    ringOfFire: {
      name: '火焰之環',
      desc: '升起一圈火焰，持續{dur}秒：最多造成{dmg}%智力傷害。圈內的敵人緩速{slow}%。'
    },
    everflame: {
      name: '永恆之火',
      desc: '你的燃燒增強{burn}%，法術爆擊率+{crit}%。'
    },
    wildfire: {
      name: '野火',
      desc: '燃燒中的敵人被打倒時，火焰會蔓延到{radius} m內的所有敵人，持續{dur}秒。'
    },
    phoenixFlight: {
      name: '鳳凰飛翔',
      desc: '化作鳳凰飛行，留下火焰軌跡：在落點造成{dmg}%智力傷害。{dur}秒內每秒回復{regen}%生命。'
    },
    callArchers: {
      name: '召喚弓箭手',
      desc: '召喚一名弓箭手在你身後射擊，造成{dmg}%魅力傷害。最多同時{max}名。'
    },
    royalRally: {
      name: '王者集結',
      desc: '你的手下衝到你身邊，回復{heal}%生命。你們全體防禦+{def}%，持續{dur}秒。'
    },
    warMarshal: {
      name: '戰爭元帥',
      desc: '你的手下造成的傷害提高{dmg}%。'
    },
    royalDecree: {
      name: '王室詔令',
      desc: '{radius} m內的敵人必須鞠躬：暈眩{stun}秒，然後在{dur}秒內受到的傷害提高{vuln}%。'
    },
    loyalHearts: {
      name: '忠誠之心',
      desc: '每當你的一名手下倒下，你回復{heal}%生命。'
    },
    summonChampion: {
      name: '召喚勇士',
      desc: '召喚王國的勇士，持續{dur}秒：一名巨人騎士，擁有你{hp}%的生命，每擊造成{dmg}%魅力傷害。'
    },
    echoBolt: {
      name: '回響飛彈',
      desc: '一道時間飛彈，造成{dmg}%智力傷害。{delay}秒後再次命中，造成{echo}%傷害。'
    },
    foresight: {
      name: '預見',
      desc: '你能提前一瞬看到攻擊：閃避+{dodge}%，冷卻縮短{cdr}%。'
    },
    timeBubble: {
      name: '時間泡泡',
      desc: '製造一個慢時間泡泡，持續{dur}秒：其中的敵人移動減慢{slow}%，並受到{dmg}%智力傷害。'
    },
    timeLoop: {
      name: '時間循環',
      desc: '{dur}秒後，目標被拉回原本的位置：造成{dmg}%智力傷害，外加它這段時間所失生命的{echo}%。'
    },
    frozenMoment: {
      name: '凝結瞬間',
      desc: '你的攻擊有{chance}%機率把敵人凍結在時間裡{dur}秒。'
    },
    timeStop: {
      name: '時間停止',
      desc: '讓{radius} m內的時間停止{dur}秒。時間恢復時，每個敵人受到{dmg}%智力傷害。'
    },
    essenceWard: {
      name: '精華結界',
      desc: '把{hp}%的生命化為價值其{shield}%的發光結界，持續{dur}秒。'
    },
    vitalReserve: {
      name: '生命儲備',
      desc: '最大生命+{hp}%，每秒回復{regen}點生命。'
    },
    enfeeblingTonic: {
      name: '虛弱藥劑',
      desc: '扔出一瓶藥劑：在範圍內造成{dmg}%智力傷害。被擊中的敵人造成的傷害降低{weak}%，持續{dur}秒。'
    },
    homunculus: {
      name: '人造小人',
      desc: '用{hp}%的生命煉出一個冒泡的小幫手，持續{dur}秒。煉製新的會返還舊幫手{back}%的生命。'
    },
    adrenalCatalyst: {
      name: '腎上腺催化',
      desc: '生命越低，傷害越高：生命在{low}%或以下時最多+{dmg}%。'
    },
    grandTransmutation: {
      name: '大嬗變',
      desc: '把{radius} m內敵人{pct}%的生命化為精華。你回復其中的{heal}%。'
    },
    rocketJump: {
      name: '火箭跳',
      desc: '騰空而起，落在瞄準處：對{radius} m內造成{dmg}%技巧傷害。累積{heat}點熱量。'
    },
    coolantLoop: {
      name: '冷卻循環',
      desc: '熱量消散加快{cool}%，技能累積的熱量減少{cut}%。'
    },
    shockGrenade: {
      name: '電擊手榴彈',
      desc: '投出一枚手榴彈：對{radius} m內造成{dmg}%技巧傷害，並暈眩{stun}秒。累積{heat}點熱量。'
    },
    precisionOptics: {
      name: '精密瞄具',
      desc: '+{crit}%爆擊率。你的射擊可額外穿透{pierce}個敵人。'
    },
    arcCoil: {
      name: '電弧線圈',
      desc: '閃電擊中目標，再跳向{jumps}個敵人：每個造成{dmg}%技巧傷害。累積{heat}點熱量。'
    },
    thermalPlating: {
      name: '隔熱裝甲',
      desc: '熱量達到{heat}或以上時，你受到的傷害降低{reduce}%。'
    },
    boulderRoll: {
      name: '滾石',
      desc: '向前滾出一塊巨石：對路徑上的一切造成{dmg}%力量傷害，並擊倒{down}秒。'
    },
    bedrock: {
      name: '基岩',
      desc: '任何東西都無法把你擊退、擊倒或擊飛。最大生命+{hp}%。'
    },
    sinkhole: {
      name: '天坑',
      desc: '地面下陷，把敵人吸入{dur}秒，然後坍塌：造成{dmg}%力量傷害。'
    },
    mountainBreaker: {
      name: '裂山',
      desc: '對頭目的傷害+{boss}%，護甲+{armor}%。'
    },
    geodeShell: {
      name: '晶洞之殼',
      desc: '水晶外殼在{dur}秒內吸收相當於生命{shield}%的傷害，然後爆裂，最多造成{dmg}%力量傷害。'
    },
    crumble: {
      name: '崩解',
      desc: '你對被緩速、被擊倒或被石化的敵人造成的傷害提高{dmg}%。'
    },
    galeArrow: {
      name: '疾風箭',
      desc: '乘著狂風的一箭：造成{dmg}%敏捷傷害，並把目標擊退。'
    },
    fleetfoot: {
      name: '飛毛腿',
      desc: '移動速度+{move}%，閃避+{dodge}%。'
    },
    zephyrDash: {
      name: '和風衝刺',
      desc: '朝瞄準方向衝刺最多{dist} m，之後{dur}秒內奔跑速度加快{move}%。'
    },
    piercingGale: {
      name: '穿雲疾風',
      desc: '一箭穿透直線上所有敵人：造成{dmg}%敏捷傷害，並緩速{slow}%，持續{dur}秒。'
    },
    cycloneSnare: {
      name: '旋風陷阱',
      desc: '旋風持續{dur}秒，把敵人吸向風眼，造成{dmg}%技巧傷害。'
    },
    keenEye: {
      name: '銳利之眼',
      desc: '爆擊傷害+{critDmg}%。你的射擊可多穿透{pierce}個敵人。'
    },
    updraftLeap: {
      name: '升風躍',
      desc: '一陣風把{radius} m內的敵人吹上天，造成{dmg}%敏捷傷害。你向後躍開{leap} m。'
    },
    swiftDraw: {
      name: '快手拉弓',
      desc: '攻擊加快{speed}%，冷卻縮短{cdr}%。'
    },
    arrowStorm: {
      name: '箭雨風暴',
      desc: '箭矢如雨落在區域內{dur}秒：共造成{dmg}%技巧傷害，並緩速{slow}%。'
    },
    galeSpirits: {
      name: '疾風之靈',
      desc: '風之靈陪你飛行{dur}秒，射出{shots}支箭，每支造成{dmg}%技巧傷害。移動速度+{move}%。'
    },
    skyHunter: {
      name: '天空獵手',
      desc: '對首領傷害+{boss}%，爆擊率+{crit}%。'
    },
    skyrender: {
      name: '裂空箭',
      desc: '風暴之箭撕開一條路：對直線上所有敵人造成{dmg}%敏捷傷害，並把它們拋向空中、甩到一旁。'
    },
    frostCleave: {
      name: '寒霜劈砍',
      desc: '向前揮出冰刃：造成{dmg}%力量傷害，並緩速{slow}%，持續{dur}秒。'
    },
    rimeLance: {
      name: '霧凇長槍',
      desc: '擲出冰槍，造成{dmg}%智力傷害，並緩速{slow}%，持續{dur}秒。'
    },
    wintersBite: {
      name: '寒冬之咬',
      desc: '你的攻擊使敵人緩速{slow}%，持續{dur}秒。'
    },
    frostArmor: {
      name: '冰霜護甲',
      desc: '冰甲吸收{shield}%智力的傷害，持續{dur}秒。你附近的敵人緩速{slow}%。'
    },
    glacialCharge: {
      name: '冰河衝鋒',
      desc: '衝向目標，造成{dmg}%力量傷害，並將其冰凍{freeze}秒。'
    },
    frozenHeart: {
      name: '冰封之心',
      desc: '最大生命+{hp}%，受到的所有傷害降低{reduce}%。'
    },
    rimeField: {
      name: '霧凇之地',
      desc: '冰凍地面持續{dur}秒：造成{dmg}%智力傷害。其中被緩速的敵人會冰凍{freeze}秒。'
    },
    frostShatter: {
      name: '碎冰擊',
      desc: '對{radius} m內造成{dmg}%力量傷害：對緩速的敵人+{chilled}%，對冰凍的敵人+{frozen}%。'
    },
    shatterpoint: {
      name: '破冰點',
      desc: '你對緩速和冰凍的敵人造成的傷害提高{bonus}%。'
    },
    avalancheLeap: {
      name: '雪崩躍擊',
      desc: '躍向瞄準處，像雪崩般落地：造成{dmg}%力量傷害，並擊倒敵人。'
    },
    iceborn: {
      name: '冰雪之子',
      desc: '沒有東西能推動或拋飛你。你受到的暈眩縮短{cut}%。'
    },
    absoluteZero: {
      name: '絕對零度',
      desc: '寒冬從你身上爆發：對{radius} m內造成{dmg}%智力傷害，並冰凍所有敵人{freeze}秒。'
    },
    sunbolt: {
      name: '日光彈',
      desc: '一道陽光造成{dmg}%智力傷害。目標被晃得眼花，{dur}秒內傷害降低{weaken}%。'
    },
    mendingLight: {
      name: '癒合之光',
      desc: '立即回復{heal}%魅力的生命，之後{dur}秒內每秒回復{regen}%生命。'
    },
    kindledHope: {
      name: '希望之火',
      desc: '你受到的所有治療效果提高{heal}%。'
    },
    lanceOfLight: {
      name: '光之槍',
      desc: '一道光束：對直線造成{dmg}%智力傷害。每命中一個敵人回復{heal}%生命。'
    },
    dawnShield: {
      name: '黎明之盾',
      desc: '清除你身上所有負面效果，並獲得{shield}%魅力的護盾，持續{dur}秒。'
    },
    haloWard: {
      name: '光環守護',
      desc: '你受到的所有傷害降低{reduce}%。'
    },
    dawnSanctuary: {
      name: '黎明聖域',
      desc: '神聖之地持續{dur}秒：每秒為你回復{heal}%魅力的生命，敵人受到{dmg}%智力傷害。'
    },
    blindingFlash: {
      name: '致盲閃光',
      desc: '一道閃光：{radius} m內的敵人逃跑{fear}秒，且{dur}秒內傷害降低{weaken}%。'
    },
    guardianLight: {
      name: '守護之光',
      desc: '本會擊倒你的一擊讓你留下1點生命，並無敵{dur}秒。每{icd}秒一次。'
    },
    sunfall: {
      name: '日落之柱',
      desc: '一道日光柱落在目標上：造成{dmg}%智力傷害。敵人{dur}秒內受到的傷害提高{vuln}%。'
    },
    searingLight: {
      name: '灼熱之光',
      desc: '法術爆擊率+{crit}%，爆擊傷害+{critDmg}%。'
    },
    haloOfDawn: {
      name: '黎明光環',
      desc: '發光{dur}秒：每秒對{radius} m內造成{dmg}%智力傷害，並回復{heal}%生命。'
    },
    callWolf: {
      name: '召喚狼',
      desc: '一隻靈狼加入你，咬擊造成{dmg}%魅力傷害。最多同時{max}隻。'
    },
    wolfPounce: {
      name: '群狼撲擊',
      desc: '你的狼撲向目標：每隻造成{dmg}%魅力傷害，並將其擊倒{down}秒。'
    },
    wildKinship: {
      name: '荒野之緣',
      desc: '你的夥伴生命提高{hp}%，傷害提高{dmg}%。'
    },
    callHawk: {
      name: '召喚鷹',
      desc: '一隻鷹俯衝目標，造成{dmg}%魅力傷害：目標{dur}秒內受到的傷害提高{vuln}%。停留{life}秒。'
    },
    callBear: {
      name: '召喚熊',
      desc: '一隻靈熊加入你。它造成{dmg}%傷害，並牽制敵人。最多{max}隻。'
    },
    thickHide: {
      name: '厚實毛皮',
      desc: '最大生命+{hp}%，每秒生命再生+{regen}。'
    },
    packBond: {
      name: '群體羈絆',
      desc: '你和{radius} m內的夥伴每秒再生{regen}%生命，並獲得{def}%防禦，持續{dur}秒。'
    },
    spiritStampede: {
      name: '靈獸奔騰',
      desc: '一群靈獸衝鋒：對直線造成{dmg}%魅力傷害，並擊倒敵人。'
    },
    packTactics: {
      name: '群狼戰術',
      desc: '身邊每有一個夥伴，你的傷害提高{bonus}%，最多{max}個。'
    },
    alphaHowl: {
      name: '頭狼嚎叫',
      desc: '你的夥伴回復{heal}%生命，{dur}秒內戰力提高{rage}%。你附近的敵人會逃跑。'
    },
    leaderOfThePack: {
      name: '群獸之首',
      desc: '你的夥伴攻擊加快{speed}%，傷害提高{dmg}%。'
    },
    wildHunt: {
      name: '荒野狩獵',
      desc: '再多{wolves}隻狼陪你奔跑{dur}秒。整個獸群傷害+{dmg}%，移動加快{move}%。'
    },
    prismBolt: {
      name: '稜光彈',
      desc: '造成{dmg}%智力傷害：目標燃燒時為冰霜，否則為火焰。兩者會互相引發。'
    },
    elementalHarmony: {
      name: '元素和諧',
      desc: '你的反應（融化、蒸汽、碎冰、超載、結晶）增強{pct}%。'
    },
    frostLance: {
      name: '寒冰長槍',
      desc: '冰貫穿一條直線：造成{dmg}%智力傷害，並緩速{slow}%，持續{dur}秒。燃燒的敵人會產生蒸汽。'
    },
    chainSpark: {
      name: '連鎖火花',
      desc: '閃電造成{dmg}%智力傷害，並跳向另外{jumps}個敵人。擊碎冰、使火焰超載。'
    },
    smolderingCore: {
      name: '悶燃之核',
      desc: '你的燃燒傷害提高{burn}%，魔力多{mana}點。'
    },
    rollingBoulder: {
      name: '滾石',
      desc: '巨石滾出：造成{dmg}%智力傷害，擊倒{down}秒。被標記的敵人會給你護盾。'
    },
    thunderSnow: {
      name: '雷雪暴',
      desc: '暴風雪持續{dur}秒：造成{dmg}%智力冰霜傷害，每秒還有閃電造成{bolt}%。'
    },
    spellweave: {
      name: '織法',
      desc: '法術爆擊率+{crit}%，技能消耗的魔力減少{mana}%。'
    },
    prismaticNova: {
      name: '稜光新星',
      desc: '攻擊{radius} m內的一切，造成{dmg}%智力傷害，各自使用會起反應的元素。'
    },
    prismaticWard: {
      name: '稜光守護',
      desc: '你受到的傷害減少{reduce}%，生命提高{hp}%。'
    },
    frostfireComet: {
      name: '冰火彗星',
      desc: '冰與火的彗星：造成{dmg}%智力傷害。敵人會燃燒並被緩速。'
    },
    elementalConvergence: {
      name: '元素匯聚',
      desc: '{dur}秒內四種元素輪流出擊：{strikes}次{dmg}%智力打擊，彼此互相引發。'
    },
    wispBolt: {
      name: '幽光彈',
      desc: '一團幽光造成{dmg}%智力傷害。被它擊倒的敵人會化為你的靈魂{life}秒。'
    },
    kindredSpirits: {
      name: '同心之靈',
      desc: '你的靈魂和手下生命提高{hp}%，攻擊加快{speed}%。'
    },
    callTheFallen: {
      name: '召喚倒下者',
      desc: '{radius} m內剛倒下的敵人，最多{max}個，會化為你的靈魂{life}秒。'
    },
    soulBond: {
      name: '靈魂羈絆',
      desc: '與敵人交朋友：有{chance}%機率（受傷時{low}%）化為你的靈魂{life}秒。否則造成{dmg}%傷害。'
    },
    restlessSouls: {
      name: '不安的靈魂',
      desc: '你擊倒的敵人有{chance}%機率化為你的靈魂{life}秒。'
    },
    spiritLantern: {
      name: '靈魂提燈',
      desc: '提燈持續{dur}秒：光中的敵人受到{dmg}%智力傷害，夥伴回復生命，倒下者站起。'
    },
    hauntingWail: {
      name: '幽魂哀號',
      desc: '幽靈般的一聲「嚇！」：對{radius} m內造成{dmg}%智力傷害，敵人逃跑{fear}秒。'
    },
    wardensVigil: {
      name: '守望者之警',
      desc: '你的靈魂和手下傷害提高{dmg}%，你受到的傷害減少{reduce}%。'
    },
    releaseSouls: {
      name: '釋放靈魂',
      desc: '你的靈魂化作光芒回家：每個在周圍造成{dmg}%智力傷害，並為你回復{heal}%生命。'
    },
    lanternKeeper: {
      name: '守燈人',
      desc: '冷卻縮短{cdr}%，技能消耗的魔力減少{mana}%。'
    },
    wispSwarm: {
      name: '幽光群',
      desc: '{wisps}團幽光俯衝區域內的敵人，共造成{dmg}%智力傷害。被擊倒者會站起。'
    },
    processionOfSouls: {
      name: '靈魂行列',
      desc: '{dur}秒內，你附近每個倒下的敵人都會化為你的靈魂，靈魂傷害提高{atk}%。'
    },
    palmStrike: {
      name: '掌擊',
      desc: '迅捷一掌，造成{dmg}%敏捷傷害並擊退敵人。累積{chi}點氣。'
    },
    ironBody: {
      name: '鐵布衫',
      desc: '受到的物理傷害降低{reduce}%，生命提高{hp}%。'
    },
    flyingKick: {
      name: '飛踢',
      desc: '飛向目標踢擊，造成{dmg}%敏捷傷害；路上的敵人受到{path}%。累積{chi}點氣。'
    },
    tigerStance: {
      name: '虎式',
      desc: '{dur}秒內：傷害+{dmg}%，攻擊速度+{speed}%。會結束鶴式。'
    },
    craneStance: {
      name: '鶴式',
      desc: '{dur}秒內：防禦+{def}%，每秒回復{regen}%生命。會結束虎式。'
    },
    flowingFists: {
      name: '流水拳',
      desc: '你的攻擊有{chance}%機率累積氣。'
    },
    hundredFists: {
      name: '百裂拳',
      desc: '連打{hits}拳，共造成{dmg}%敏捷傷害。累積{chi}點氣。'
    },
    risingDragon: {
      name: '升龍拳',
      desc: '用光所有氣打出上勾拳：造成{dmg}%敏捷傷害，每點氣+{per}%。敵人飛上天。'
    },
    cranesGrace: {
      name: '鶴之優雅',
      desc: '閃避+{dodge}%，你受到的暈眩和擊倒縮短{cut}%。'
    },
    whirlwindKick: {
      name: '旋風腿',
      desc: '對{radius} m內的一切踢兩次，共造成{dmg}%敏捷傷害。最多累積{chi}點氣。'
    },
    tigersFury: {
      name: '猛虎之怒',
      desc: '爆擊率+{crit}%，攻擊速度+{speed}%。'
    },
    mountainPalm: {
      name: '泰山掌',
      desc: '用光所有氣：巨掌落下造成{dmg}%敏捷傷害，每點氣+{per}%，並擊倒敵人。'
    },
    sharpNote: {
      name: '尖銳音符',
      desc: '尖銳的音符造成{dmg}%魅力傷害。敵人{dur}秒內傷害降低{weaken}%。'
    },
    stagePresence: {
      name: '舞台魅力',
      desc: '技能消耗的魔力減少{mana}%，移動加快{move}%。'
    },
    marchingSong: {
      name: '進行曲',
      desc: '歌聲持續{dur}秒：你和{radius} m內的盟友移動加快{move}%，攻擊加快{speed}%。'
    },
    lullaby: {
      name: '搖籃曲',
      desc: '錐形範圍內的溫柔曲調：聽到的敵人會睡著{dur}秒。'
    },
    longRefrain: {
      name: '悠長副歌',
      desc: '你的歌曲持續時間延長{pct}%。'
    },
    balladOfValor: {
      name: '勇氣敘事曲',
      desc: '歌聲持續{dur}秒：你和{radius} m內的盟友傷害提高{dmg}%，並獲得{def}%防禦。'
    },
    charmingSerenade: {
      name: '魅惑小夜曲',
      desc: '魅惑目標和{radius} m內的敵人：{dur}秒內它們會互相攻擊。'
    },
    virtuoso: {
      name: '演奏大師',
      desc: '冷卻縮短{cdr}%，爆擊傷害+{critDmg}%。'
    },
    hymnOfMending: {
      name: '癒合聖歌',
      desc: '清除負面效果，之後{dur}秒內你和{radius} m內的盟友每秒回復{regen}%生命。'
    },
    crescendo: {
      name: '漸強',
      desc: '{radius} m內的音爆：造成{dmg}%魅力傷害，你每在演奏一首歌+{per}%。'
    },
    standingOvation: {
      name: '全場起立',
      desc: '傷害+{dmg}%，受到的傷害減少{reduce}%。'
    },
    grandFinale: {
      name: '壯麗終曲',
      desc: '全力演奏{dur}秒（速度、傷害、防禦+{buff}%），最後一個和弦：{dmg}%魅力傷害，魅惑敵人。'
    }
  },
  slot: {
    main: '主手',
    off: '副手',
    head: '頭部',
    body: '護甲',
    hands: '雙手',
    feet: '雙腳',
    trinket: '飾品'
  },
  tier: {
    '7': '神話',
    '1': '普通',
    '2': '優良',
    '3': '稀有',
    '4': '史詩',
    '5': '英雄',
    '6': '傳說'
  },
  weapon: {
    melee: '近戰 · 依{attr}加成',
    ranged: '遠程 · 依{attr}加成',
    magic: '魔法 · 依{attr}加成'
  },
  source: {
    'siege': "在堡壘渡口攻防戰中贏得。",
    'infernal': "煉獄雙生：在被入侵的{zone}掉落，或由鐵匠鍛造。",
    arena: '在競技場的天梯中贏得。',
    smith: '在鐵匠鋪鍛造。',
    mob: '由{zone}的怪物掉落。',
    chest: '可在{zone}的寶箱中找到。',
    boss: '由{zone}的頭目掉落。',
    secret: '藏在{zone}的一個祕密寶箱裡。'
  },
  mod: {
    'demonBane': "對惡魔傷害+{n}%",
    'demonLeech': "對惡魔造成傷害的{n}%治療你",
    'beastBane': "對神話野獸傷害+{n}%",
    'fireWard': "受到的火焰傷害-{n}%",
    'shadowWard': "受到的暗影傷害-{n}%",
    'demonWard': "受到惡魔的傷害-{n}%",
    'pylonBreaker': "對惡魔塔傷害+{n}%",
    'glassFinder': "被擊殺的惡魔有{n}%機率額外留下惡魔玻璃",
    'waterWalk': "水不會讓你減速",
    str: '+{n} 力量',
    dex: '+{n} 敏捷',
    int: '+{n} 智力',
    end: '+{n} 耐力',
    skl: '+{n} 技巧',
    cha: '+{n} 魅力',
    allAttrs: '所有屬性 +{n}',
    strOrDex: '力量與敏捷中較高的一項 +{n}',
    armor: '{n} 護甲',
    armorPct: '+{n}% 護甲',
    armorFromStr: '來自力量的護甲：+{n}%',
    block: '+{n}% 格擋機率',
    dodge: '+{n}% 閃避',
    damageReduction: '+{n}% 傷害減免',
    physReduction: '受到的物理傷害降低{n}%',
    maxHp: '+{n} 最大生命',
    maxHpPct: '+{n}% 最大生命',
    maxMana: '+{n} 最大魔力',
    hpRegen: '每秒 +{n} 生命',
    stunDurationCut: '你受到的暈眩縮短{n}%',
    damagePct: '+{n}% 造成的傷害',
    critChance: '+{n}% 爆擊率',
    critDamage: '+{n}% 爆擊傷害',
    spellCrit: '+{n}% 法術爆擊率',
    attackSpeed: '+{n}% 攻擊速度',
    moveSpeed: '+{n}% 移動速度',
    cdr: '冷卻縮短{n}%',
    manaDiscount: '法術的魔力消耗降低{n}%',
    lifesteal: '所有傷害 +{n}% 生命竊取',
    physLifesteal: '物理攻擊 +{n}% 生命竊取',
    lifeDrainPct: '生命汲取增強{n}%',
    bossDamage: '對頭目的傷害 +{n}%',
    backstab: '+{n}% 背刺傷害',
    minionDamage: '手下的傷害 +{n}%',
    minionAttackSpeed: '手下攻擊加快{n}%',
    minionHp: '手下的生命 +{n}%',
    burnOnHit: '攻擊附帶{n}點傷害的燃燒',
    freezeOnHit: '攻擊有{n}%機率冰凍敵人',
    pierce: '射擊可多貫穿{n}個敵人',
    critCooldown: '爆擊讓所有冷卻減少{n}秒',
    extraBlastEvery: '每{n}次射擊額外發出一道能量衝擊',
    reflectOnBlock: '格擋時反彈{n}點傷害',
    fatalSave: '受到致命傷害時改為無敵{n}秒（每120秒一次）',
    knockbackImmune: '免疫擊退',
    heatBuildCut: '熱量累積變慢{n}%',
    heatDissipation: '熱量散得快{n}%',
    flaskDamage: '鮮血藥瓶的傷害 +{n}%',
    igniteBonus: '火系法術的燃燒增強{n}%',
    stealthy: '行動無聲：敵人發現你的距離縮短{n}%',
    fortitude: '受到重擊時獲得{n}%生命的護盾',
    evasionHaste: '閃避成功後獲得{n}%加速',
    cauterize: '燃燒中的敵人對你造成的傷害降低{n}%',
    pyromaniac: '法術爆擊讓火系冷卻減少{n}秒',
    tribute: '手下替你承受{n}%的傷害',
    timeDistort: '受到的傷害有{n}%會延後',
    entropy: '施法讓冷卻縮短{n}%',
    bloodToMana: '受到的物理傷害有{n}%轉成魔力',
    bleedHeal: '打中流血的敵人回復{n}%生命',
    overheatCrit: '過熱時爆擊傷害 +{n}%',
    lowHealthDamage: '生命越低傷害越高，最多+{n}%',
    heatArmor: '熱量達到一半或以上時，受到的傷害-{n}%',
    crumble: '對緩速、擊倒或石化的敵人傷害+{n}%',
    lastStand: '生命低於30%時,受到的傷害-{n}%',
    wildfire: '燃燒的敵人倒下時點燃{n}公尺內的敵人',
    loyalty: '倒下的僕從為你恢復{n}%生命',
    chillOnHit: '普通攻擊緩速{n}%，持續2秒',
    chillDamage: '對緩速或冰凍的敵人傷害+{n}%',
    healPower: '受到的治療+{n}%',
    packDamage: '每有一名存活的同伴，傷害+{n}%（最多4名）',
    reactionDamage: '元素反應+{n}%',
    soulRise: '被擊敗的敵人有{n}%機率化為你的靈魂復起',
    chiOnHit: '攻擊有{n}%機率積攢氣',
    songLength: '歌曲持續時間+{n}%'
  },
  item: {
    'chimeraMane': { 'name': "奇美拉鬃毛" },
    'triFang': { 'name': "三叉牙" },
    'warchiefsLongbowGun': { 'name': "軍閥長弓槍" },
    'hoofbreakerGreaves': { 'name': "碎蹄護脛" },
    'eyeOfTheDeep': { 'name': "深淵之眼" },
    'beamSplitter': { 'name': "分光盾" },
    'riddleCrown': { 'name': "謎語之冠" },
    'sandglassWand': { 'name': "沙漏魔杖" },
    'leviathanScale': { 'name': "利維坦之鱗" },
    'tidecallerStaff': { 'name': "喚潮者法杖" },
    'hydraScaleGauntlets': { 'name': "九頭蛇鱗鐵手套" },
    'manyHeadedFlail': { 'name': "多頭連枷" },
    'heartOfTheElderDragon': { 'name': "遠古巨龍之心" },
    'dragonboneGreatsword': { 'name': "龍骨巨劍" },
    'bastionBanner': { 'name': "堡壘戰旗" },
    'wallwardensPlate': { 'name': "護牆者板甲" },
    'gatebreaker': { 'name': "破門錘" },
    'crownOfTheLastBastion': { 'name': "最後堡壘之冠" },
    heartOfTheArena: {
      name: '競技場之心'
    },
    mantleOfTheUndefeated: {
      name: '不敗者板甲'
    },
    crimsonBulwark: {
      name: '赤紅壁盾'
    },
    sandstriderGreaves: {
      name: '踏沙脛甲'
    },
    gripsOfTheGladiator: {
      name: '角鬥士護手'
    },
    laurelOfTheVictor: {
      name: '勝者桂冠'
    },
    smithMasterMithrilGreaves: {
      name: '精工秘銀脛甲'
    },
    smithMasterAdamantGreaves: {
      name: '精工艾達曼脛甲'
    },
    smithMasterAetheriteGreaves: {
      name: '精工以太晶脛甲'
    },
    smithMithrilGreaves: {
      name: '秘銀脛甲'
    },
    smithAdamantGreaves: {
      name: '艾達曼脛甲'
    },
    smithAetheriteGreaves: {
      name: '以太晶脛甲'
    },
    smithMasterMithrilPlate: {
      name: '精工秘銀板甲'
    },
    smithMasterAdamantPlate: {
      name: '精工艾達曼板甲'
    },
    smithMasterAetheritePlate: {
      name: '精工以太晶板甲'
    },
    smithMithrilPlate: {
      name: '秘銀板甲'
    },
    smithAdamantPlate: {
      name: '艾達曼板甲'
    },
    smithAetheritePlate: {
      name: '以太晶板甲'
    },
    smithMasterMithrilHelm: {
      name: '精工秘銀盔'
    },
    smithMasterAdamantHelm: {
      name: '精工艾達曼盔'
    },
    smithMasterAetheriteHelm: {
      name: '精工以太晶盔'
    },
    smithMithrilHelm: {
      name: '秘銀盔'
    },
    smithAdamantHelm: {
      name: '艾達曼盔'
    },
    smithAetheriteHelm: {
      name: '以太晶盔'
    },
    smithMasterMithrilShield: {
      name: '精工秘銀盾'
    },
    smithMasterAdamantShield: {
      name: '精工艾達曼盾'
    },
    smithMasterAetheriteShield: {
      name: '精工以太晶盾'
    },
    smithMithrilShield: {
      name: '秘銀盾'
    },
    smithAdamantShield: {
      name: '艾達曼盾'
    },
    smithAetheriteShield: {
      name: '以太晶盾'
    },
    smithMasterMithrilHammer: {
      name: '精工秘銀錘'
    },
    smithMasterAdamantHammer: {
      name: '精工艾達曼錘'
    },
    smithMasterAetheriteHammer: {
      name: '精工以太晶錘'
    },
    smithMithrilHammer: {
      name: '秘銀錘'
    },
    smithAdamantHammer: {
      name: '艾達曼錘'
    },
    smithAetheriteHammer: {
      name: '以太晶錘'
    },
    smithMasterMithrilSword: {
      name: '精工秘銀劍'
    },
    smithMasterAdamantSword: {
      name: '精工艾達曼劍'
    },
    smithMasterAetheriteSword: {
      name: '精工以太晶劍'
    },
    smithMithrilSword: {
      name: '秘銀劍'
    },
    smithAdamantSword: {
      name: '艾達曼劍'
    },
    smithAetheriteSword: {
      name: '以太晶劍'
    },
    smithMasterGoldGreaves: {
      name: '精工金脛甲'
    },
    smithGoldGreaves: {
      name: '金脛甲'
    },
    smithMasterGoldPlate: {
      name: '精工金板甲'
    },
    smithGoldPlate: {
      name: '金板甲'
    },
    smithMasterGoldHelm: {
      name: '精工金盔'
    },
    smithGoldHelm: {
      name: '金盔'
    },
    smithMasterGoldShield: {
      name: '精工金盾'
    },
    smithGoldShield: {
      name: '金盾'
    },
    smithMasterGoldHammer: {
      name: '精工金錘'
    },
    smithGoldHammer: {
      name: '金錘'
    },
    smithMasterGoldSword: {
      name: '精工金劍'
    },
    smithGoldSword: {
      name: '金劍'
    },
    smithMasterSilverGreaves: {
      name: '精工銀脛甲'
    },
    smithSilverGreaves: {
      name: '銀脛甲'
    },
    smithMasterSilverPlate: {
      name: '精工銀板甲'
    },
    smithSilverPlate: {
      name: '銀板甲'
    },
    smithMasterSilverHelm: {
      name: '精工銀盔'
    },
    smithSilverHelm: {
      name: '銀盔'
    },
    smithMasterSilverShield: {
      name: '精工銀盾'
    },
    smithSilverShield: {
      name: '銀盾'
    },
    smithMasterSilverHammer: {
      name: '精工銀錘'
    },
    smithSilverHammer: {
      name: '銀錘'
    },
    smithMasterSilverSword: {
      name: '精工銀劍'
    },
    smithSilverSword: {
      name: '銀劍'
    },
    smithMasterIronGreaves: {
      name: '精工鐵脛甲'
    },
    smithIronGreaves: {
      name: '鐵脛甲'
    },
    smithMasterIronPlate: {
      name: '精工鐵板甲'
    },
    smithIronPlate: {
      name: '鐵板甲'
    },
    smithMasterIronHelm: {
      name: '精工鐵盔'
    },
    smithIronHelm: {
      name: '鐵盔'
    },
    smithMasterIronShield: {
      name: '精工鐵盾'
    },
    smithIronShield: {
      name: '鐵盾'
    },
    smithMasterIronHammer: {
      name: '精工鐵錘'
    },
    smithIronHammer: {
      name: '鐵錘'
    },
    smithMasterIronSword: {
      name: '精工鐵劍'
    },
    smithMasterDexIronSword: {
      name: '精工鐵匕首 · 敏捷'
    },
    smithDexIronSword: {
      name: '鐵匕首 · 敏捷'
    },
    smithMasterDexIronHammer: {
      name: '精工鐵細劍 · 敏捷'
    },
    smithDexIronHammer: {
      name: '鐵細劍 · 敏捷'
    },
    smithMasterDexIronShield: {
      name: '精工鐵小圓盾 · 敏捷'
    },
    smithDexIronShield: {
      name: '鐵小圓盾 · 敏捷'
    },
    smithMasterDexIronHelm: {
      name: '精工鐵兜帽 · 敏捷'
    },
    smithDexIronHelm: {
      name: '鐵兜帽 · 敏捷'
    },
    smithMasterDexIronPlate: {
      name: '精工鐵皮甲 · 敏捷'
    },
    smithDexIronPlate: {
      name: '鐵皮甲 · 敏捷'
    },
    smithMasterDexIronGreaves: {
      name: '精工鐵靴子 · 敏捷'
    },
    smithDexIronGreaves: {
      name: '鐵靴子 · 敏捷'
    },
    smithMasterDexSilverSword: {
      name: '精工銀匕首 · 敏捷'
    },
    smithDexSilverSword: {
      name: '銀匕首 · 敏捷'
    },
    smithMasterDexSilverHammer: {
      name: '精工銀細劍 · 敏捷'
    },
    smithDexSilverHammer: {
      name: '銀細劍 · 敏捷'
    },
    smithMasterDexSilverShield: {
      name: '精工銀小圓盾 · 敏捷'
    },
    smithDexSilverShield: {
      name: '銀小圓盾 · 敏捷'
    },
    smithMasterDexSilverHelm: {
      name: '精工銀兜帽 · 敏捷'
    },
    smithDexSilverHelm: {
      name: '銀兜帽 · 敏捷'
    },
    smithMasterDexSilverPlate: {
      name: '精工銀皮甲 · 敏捷'
    },
    smithDexSilverPlate: {
      name: '銀皮甲 · 敏捷'
    },
    smithMasterDexSilverGreaves: {
      name: '精工銀靴子 · 敏捷'
    },
    smithDexSilverGreaves: {
      name: '銀靴子 · 敏捷'
    },
    smithMasterDexGoldSword: {
      name: '精工金匕首 · 敏捷'
    },
    smithDexGoldSword: {
      name: '金匕首 · 敏捷'
    },
    smithMasterDexGoldHammer: {
      name: '精工金細劍 · 敏捷'
    },
    smithDexGoldHammer: {
      name: '金細劍 · 敏捷'
    },
    smithMasterDexGoldShield: {
      name: '精工金小圓盾 · 敏捷'
    },
    smithDexGoldShield: {
      name: '金小圓盾 · 敏捷'
    },
    smithMasterDexGoldHelm: {
      name: '精工金兜帽 · 敏捷'
    },
    smithDexGoldHelm: {
      name: '金兜帽 · 敏捷'
    },
    smithMasterDexGoldPlate: {
      name: '精工金皮甲 · 敏捷'
    },
    smithDexGoldPlate: {
      name: '金皮甲 · 敏捷'
    },
    smithMasterDexGoldGreaves: {
      name: '精工金靴子 · 敏捷'
    },
    smithDexGoldGreaves: {
      name: '金靴子 · 敏捷'
    },
    smithMasterDexMithrilSword: {
      name: '精工秘銀匕首 · 敏捷'
    },
    smithMasterDexAdamantSword: {
      name: '精工艾達曼匕首 · 敏捷'
    },
    smithMasterDexAetheriteSword: {
      name: '精工以太晶匕首 · 敏捷'
    },
    smithDexMithrilSword: {
      name: '秘銀匕首 · 敏捷'
    },
    smithDexAdamantSword: {
      name: '艾達曼匕首 · 敏捷'
    },
    smithDexAetheriteSword: {
      name: '以太晶匕首 · 敏捷'
    },
    smithMasterDexMithrilHammer: {
      name: '精工秘銀細劍 · 敏捷'
    },
    smithMasterDexAdamantHammer: {
      name: '精工艾達曼細劍 · 敏捷'
    },
    smithMasterDexAetheriteHammer: {
      name: '精工以太晶細劍 · 敏捷'
    },
    smithDexMithrilHammer: {
      name: '秘銀細劍 · 敏捷'
    },
    smithDexAdamantHammer: {
      name: '艾達曼細劍 · 敏捷'
    },
    smithDexAetheriteHammer: {
      name: '以太晶細劍 · 敏捷'
    },
    smithMasterDexMithrilShield: {
      name: '精工秘銀小圓盾 · 敏捷'
    },
    smithMasterDexAdamantShield: {
      name: '精工艾達曼小圓盾 · 敏捷'
    },
    smithMasterDexAetheriteShield: {
      name: '精工以太晶小圓盾 · 敏捷'
    },
    smithDexMithrilShield: {
      name: '秘銀小圓盾 · 敏捷'
    },
    smithDexAdamantShield: {
      name: '艾達曼小圓盾 · 敏捷'
    },
    smithDexAetheriteShield: {
      name: '以太晶小圓盾 · 敏捷'
    },
    smithMasterDexMithrilHelm: {
      name: '精工秘銀兜帽 · 敏捷'
    },
    smithMasterDexAdamantHelm: {
      name: '精工艾達曼兜帽 · 敏捷'
    },
    smithMasterDexAetheriteHelm: {
      name: '精工以太晶兜帽 · 敏捷'
    },
    smithDexMithrilHelm: {
      name: '秘銀兜帽 · 敏捷'
    },
    smithDexAdamantHelm: {
      name: '艾達曼兜帽 · 敏捷'
    },
    smithDexAetheriteHelm: {
      name: '以太晶兜帽 · 敏捷'
    },
    smithMasterDexMithrilPlate: {
      name: '精工秘銀皮甲 · 敏捷'
    },
    smithMasterDexAdamantPlate: {
      name: '精工艾達曼皮甲 · 敏捷'
    },
    smithMasterDexAetheritePlate: {
      name: '精工以太晶皮甲 · 敏捷'
    },
    smithDexMithrilPlate: {
      name: '秘銀皮甲 · 敏捷'
    },
    smithDexAdamantPlate: {
      name: '艾達曼皮甲 · 敏捷'
    },
    smithDexAetheritePlate: {
      name: '以太晶皮甲 · 敏捷'
    },
    smithMasterDexMithrilGreaves: {
      name: '精工秘銀靴子 · 敏捷'
    },
    smithMasterDexAdamantGreaves: {
      name: '精工艾達曼靴子 · 敏捷'
    },
    smithMasterDexAetheriteGreaves: {
      name: '精工以太晶靴子 · 敏捷'
    },
    smithDexMithrilGreaves: {
      name: '秘銀靴子 · 敏捷'
    },
    smithDexAdamantGreaves: {
      name: '艾達曼靴子 · 敏捷'
    },
    smithDexAetheriteGreaves: {
      name: '以太晶靴子 · 敏捷'
    },
    smithMasterIntIronSword: {
      name: '精工鐵魔杖 · 智力'
    },
    smithIntIronSword: {
      name: '鐵魔杖 · 智力'
    },
    smithMasterIntIronHammer: {
      name: '精工鐵法杖 · 智力'
    },
    smithIntIronHammer: {
      name: '鐵法杖 · 智力'
    },
    smithMasterIntIronShield: {
      name: '精工鐵魔法書 · 智力'
    },
    smithIntIronShield: {
      name: '鐵魔法書 · 智力'
    },
    smithMasterIntIronHelm: {
      name: '精工鐵頭環 · 智力'
    },
    smithIntIronHelm: {
      name: '鐵頭環 · 智力'
    },
    smithMasterIntIronPlate: {
      name: '精工鐵長袍 · 智力'
    },
    smithIntIronPlate: {
      name: '鐵長袍 · 智力'
    },
    smithMasterIntIronGreaves: {
      name: '精工鐵靴子 · 智力'
    },
    smithIntIronGreaves: {
      name: '鐵靴子 · 智力'
    },
    smithMasterIntSilverSword: {
      name: '精工銀魔杖 · 智力'
    },
    smithIntSilverSword: {
      name: '銀魔杖 · 智力'
    },
    smithMasterIntSilverHammer: {
      name: '精工銀法杖 · 智力'
    },
    smithIntSilverHammer: {
      name: '銀法杖 · 智力'
    },
    smithMasterIntSilverShield: {
      name: '精工銀魔法書 · 智力'
    },
    smithIntSilverShield: {
      name: '銀魔法書 · 智力'
    },
    smithMasterIntSilverHelm: {
      name: '精工銀頭環 · 智力'
    },
    smithIntSilverHelm: {
      name: '銀頭環 · 智力'
    },
    smithMasterIntSilverPlate: {
      name: '精工銀長袍 · 智力'
    },
    smithIntSilverPlate: {
      name: '銀長袍 · 智力'
    },
    smithMasterIntSilverGreaves: {
      name: '精工銀靴子 · 智力'
    },
    smithIntSilverGreaves: {
      name: '銀靴子 · 智力'
    },
    smithMasterIntGoldSword: {
      name: '精工金魔杖 · 智力'
    },
    smithIntGoldSword: {
      name: '金魔杖 · 智力'
    },
    smithMasterIntGoldHammer: {
      name: '精工金法杖 · 智力'
    },
    smithIntGoldHammer: {
      name: '金法杖 · 智力'
    },
    smithMasterIntGoldShield: {
      name: '精工金魔法書 · 智力'
    },
    smithIntGoldShield: {
      name: '金魔法書 · 智力'
    },
    smithMasterIntGoldHelm: {
      name: '精工金頭環 · 智力'
    },
    smithIntGoldHelm: {
      name: '金頭環 · 智力'
    },
    smithMasterIntGoldPlate: {
      name: '精工金長袍 · 智力'
    },
    smithIntGoldPlate: {
      name: '金長袍 · 智力'
    },
    smithMasterIntGoldGreaves: {
      name: '精工金靴子 · 智力'
    },
    smithIntGoldGreaves: {
      name: '金靴子 · 智力'
    },
    smithMasterIntMithrilSword: {
      name: '精工秘銀魔杖 · 智力'
    },
    smithMasterIntAdamantSword: {
      name: '精工艾達曼魔杖 · 智力'
    },
    smithMasterIntAetheriteSword: {
      name: '精工以太晶魔杖 · 智力'
    },
    smithIntMithrilSword: {
      name: '秘銀魔杖 · 智力'
    },
    smithIntAdamantSword: {
      name: '艾達曼魔杖 · 智力'
    },
    smithIntAetheriteSword: {
      name: '以太晶魔杖 · 智力'
    },
    smithMasterIntMithrilHammer: {
      name: '精工秘銀法杖 · 智力'
    },
    smithMasterIntAdamantHammer: {
      name: '精工艾達曼法杖 · 智力'
    },
    smithMasterIntAetheriteHammer: {
      name: '精工以太晶法杖 · 智力'
    },
    smithIntMithrilHammer: {
      name: '秘銀法杖 · 智力'
    },
    smithIntAdamantHammer: {
      name: '艾達曼法杖 · 智力'
    },
    smithIntAetheriteHammer: {
      name: '以太晶法杖 · 智力'
    },
    smithMasterIntMithrilShield: {
      name: '精工秘銀魔法書 · 智力'
    },
    smithMasterIntAdamantShield: {
      name: '精工艾達曼魔法書 · 智力'
    },
    smithMasterIntAetheriteShield: {
      name: '精工以太晶魔法書 · 智力'
    },
    smithIntMithrilShield: {
      name: '秘銀魔法書 · 智力'
    },
    smithIntAdamantShield: {
      name: '艾達曼魔法書 · 智力'
    },
    smithIntAetheriteShield: {
      name: '以太晶魔法書 · 智力'
    },
    smithMasterIntMithrilHelm: {
      name: '精工秘銀頭環 · 智力'
    },
    smithMasterIntAdamantHelm: {
      name: '精工艾達曼頭環 · 智力'
    },
    smithMasterIntAetheriteHelm: {
      name: '精工以太晶頭環 · 智力'
    },
    smithIntMithrilHelm: {
      name: '秘銀頭環 · 智力'
    },
    smithIntAdamantHelm: {
      name: '艾達曼頭環 · 智力'
    },
    smithIntAetheriteHelm: {
      name: '以太晶頭環 · 智力'
    },
    smithMasterIntMithrilPlate: {
      name: '精工秘銀長袍 · 智力'
    },
    smithMasterIntAdamantPlate: {
      name: '精工艾達曼長袍 · 智力'
    },
    smithMasterIntAetheritePlate: {
      name: '精工以太晶長袍 · 智力'
    },
    smithIntMithrilPlate: {
      name: '秘銀長袍 · 智力'
    },
    smithIntAdamantPlate: {
      name: '艾達曼長袍 · 智力'
    },
    smithIntAetheritePlate: {
      name: '以太晶長袍 · 智力'
    },
    smithMasterIntMithrilGreaves: {
      name: '精工秘銀靴子 · 智力'
    },
    smithMasterIntAdamantGreaves: {
      name: '精工艾達曼靴子 · 智力'
    },
    smithMasterIntAetheriteGreaves: {
      name: '精工以太晶靴子 · 智力'
    },
    smithIntMithrilGreaves: {
      name: '秘銀靴子 · 智力'
    },
    smithIntAdamantGreaves: {
      name: '艾達曼靴子 · 智力'
    },
    smithIntAetheriteGreaves: {
      name: '以太晶靴子 · 智力'
    },
    smithMasterSklIronSword: {
      name: '精工鐵手槍 · 技巧'
    },
    smithSklIronSword: {
      name: '鐵手槍 · 技巧'
    },
    smithMasterSklIronHammer: {
      name: '精工鐵步槍 · 技巧'
    },
    smithSklIronHammer: {
      name: '鐵步槍 · 技巧'
    },
    smithMasterSklIronShield: {
      name: '精工鐵能量電池 · 技巧'
    },
    smithSklIronShield: {
      name: '鐵能量電池 · 技巧'
    },
    smithMasterSklIronHelm: {
      name: '精工鐵軟帽 · 技巧'
    },
    smithSklIronHelm: {
      name: '鐵軟帽 · 技巧'
    },
    smithMasterSklIronPlate: {
      name: '精工鐵皮具 · 技巧'
    },
    smithSklIronPlate: {
      name: '鐵皮具 · 技巧'
    },
    smithMasterSklIronGreaves: {
      name: '精工鐵靴子 · 技巧'
    },
    smithSklIronGreaves: {
      name: '鐵靴子 · 技巧'
    },
    smithMasterSklSilverSword: {
      name: '精工銀手槍 · 技巧'
    },
    smithSklSilverSword: {
      name: '銀手槍 · 技巧'
    },
    smithMasterSklSilverHammer: {
      name: '精工銀步槍 · 技巧'
    },
    smithSklSilverHammer: {
      name: '銀步槍 · 技巧'
    },
    smithMasterSklSilverShield: {
      name: '精工銀能量電池 · 技巧'
    },
    smithSklSilverShield: {
      name: '銀能量電池 · 技巧'
    },
    smithMasterSklSilverHelm: {
      name: '精工銀軟帽 · 技巧'
    },
    smithSklSilverHelm: {
      name: '銀軟帽 · 技巧'
    },
    smithMasterSklSilverPlate: {
      name: '精工銀皮具 · 技巧'
    },
    smithSklSilverPlate: {
      name: '銀皮具 · 技巧'
    },
    smithMasterSklSilverGreaves: {
      name: '精工銀靴子 · 技巧'
    },
    smithSklSilverGreaves: {
      name: '銀靴子 · 技巧'
    },
    smithMasterSklGoldSword: {
      name: '精工金手槍 · 技巧'
    },
    smithSklGoldSword: {
      name: '金手槍 · 技巧'
    },
    smithMasterSklGoldHammer: {
      name: '精工金步槍 · 技巧'
    },
    smithSklGoldHammer: {
      name: '金步槍 · 技巧'
    },
    smithMasterSklGoldShield: {
      name: '精工金能量電池 · 技巧'
    },
    smithSklGoldShield: {
      name: '金能量電池 · 技巧'
    },
    smithMasterSklGoldHelm: {
      name: '精工金軟帽 · 技巧'
    },
    smithSklGoldHelm: {
      name: '金軟帽 · 技巧'
    },
    smithMasterSklGoldPlate: {
      name: '精工金皮具 · 技巧'
    },
    smithSklGoldPlate: {
      name: '金皮具 · 技巧'
    },
    smithMasterSklGoldGreaves: {
      name: '精工金靴子 · 技巧'
    },
    smithSklGoldGreaves: {
      name: '金靴子 · 技巧'
    },
    smithMasterSklMithrilSword: {
      name: '精工秘銀手槍 · 技巧'
    },
    smithMasterSklAdamantSword: {
      name: '精工艾達曼手槍 · 技巧'
    },
    smithMasterSklAetheriteSword: {
      name: '精工以太晶手槍 · 技巧'
    },
    smithSklMithrilSword: {
      name: '秘銀手槍 · 技巧'
    },
    smithSklAdamantSword: {
      name: '艾達曼手槍 · 技巧'
    },
    smithSklAetheriteSword: {
      name: '以太晶手槍 · 技巧'
    },
    smithMasterSklMithrilHammer: {
      name: '精工秘銀步槍 · 技巧'
    },
    smithMasterSklAdamantHammer: {
      name: '精工艾達曼步槍 · 技巧'
    },
    smithMasterSklAetheriteHammer: {
      name: '精工以太晶步槍 · 技巧'
    },
    smithSklMithrilHammer: {
      name: '秘銀步槍 · 技巧'
    },
    smithSklAdamantHammer: {
      name: '艾達曼步槍 · 技巧'
    },
    smithSklAetheriteHammer: {
      name: '以太晶步槍 · 技巧'
    },
    smithMasterSklMithrilShield: {
      name: '精工秘銀能量電池 · 技巧'
    },
    smithMasterSklAdamantShield: {
      name: '精工艾達曼能量電池 · 技巧'
    },
    smithMasterSklAetheriteShield: {
      name: '精工以太晶能量電池 · 技巧'
    },
    smithSklMithrilShield: {
      name: '秘銀能量電池 · 技巧'
    },
    smithSklAdamantShield: {
      name: '艾達曼能量電池 · 技巧'
    },
    smithSklAetheriteShield: {
      name: '以太晶能量電池 · 技巧'
    },
    smithMasterSklMithrilHelm: {
      name: '精工秘銀軟帽 · 技巧'
    },
    smithMasterSklAdamantHelm: {
      name: '精工艾達曼軟帽 · 技巧'
    },
    smithMasterSklAetheriteHelm: {
      name: '精工以太晶軟帽 · 技巧'
    },
    smithSklMithrilHelm: {
      name: '秘銀軟帽 · 技巧'
    },
    smithSklAdamantHelm: {
      name: '艾達曼軟帽 · 技巧'
    },
    smithSklAetheriteHelm: {
      name: '以太晶軟帽 · 技巧'
    },
    smithMasterSklMithrilPlate: {
      name: '精工秘銀皮具 · 技巧'
    },
    smithMasterSklAdamantPlate: {
      name: '精工艾達曼皮具 · 技巧'
    },
    smithMasterSklAetheritePlate: {
      name: '精工以太晶皮具 · 技巧'
    },
    smithSklMithrilPlate: {
      name: '秘銀皮具 · 技巧'
    },
    smithSklAdamantPlate: {
      name: '艾達曼皮具 · 技巧'
    },
    smithSklAetheritePlate: {
      name: '以太晶皮具 · 技巧'
    },
    smithMasterSklMithrilGreaves: {
      name: '精工秘銀靴子 · 技巧'
    },
    smithMasterSklAdamantGreaves: {
      name: '精工艾達曼靴子 · 技巧'
    },
    smithMasterSklAetheriteGreaves: {
      name: '精工以太晶靴子 · 技巧'
    },
    smithSklMithrilGreaves: {
      name: '秘銀靴子 · 技巧'
    },
    smithSklAdamantGreaves: {
      name: '艾達曼靴子 · 技巧'
    },
    smithSklAetheriteGreaves: {
      name: '以太晶靴子 · 技巧'
    },
    smithMasterChaIronSword: {
      name: '精工鐵權杖 · 魅力'
    },
    smithChaIronSword: {
      name: '鐵權杖 · 魅力'
    },
    smithMasterChaIronHammer: {
      name: '精工鐵戰旗 · 魅力'
    },
    smithChaIronHammer: {
      name: '鐵戰旗 · 魅力'
    },
    smithMasterChaIronShield: {
      name: '精工鐵法典 · 魅力'
    },
    smithChaIronShield: {
      name: '鐵法典 · 魅力'
    },
    smithMasterChaIronHelm: {
      name: '精工鐵王冠 · 魅力'
    },
    smithChaIronHelm: {
      name: '鐵王冠 · 魅力'
    },
    smithMasterChaIronPlate: {
      name: '精工鐵戰袍 · 魅力'
    },
    smithChaIronPlate: {
      name: '鐵戰袍 · 魅力'
    },
    smithMasterChaIronGreaves: {
      name: '精工鐵靴子 · 魅力'
    },
    smithChaIronGreaves: {
      name: '鐵靴子 · 魅力'
    },
    smithMasterChaSilverSword: {
      name: '精工銀權杖 · 魅力'
    },
    smithChaSilverSword: {
      name: '銀權杖 · 魅力'
    },
    smithMasterChaSilverHammer: {
      name: '精工銀戰旗 · 魅力'
    },
    smithChaSilverHammer: {
      name: '銀戰旗 · 魅力'
    },
    smithMasterChaSilverShield: {
      name: '精工銀法典 · 魅力'
    },
    smithChaSilverShield: {
      name: '銀法典 · 魅力'
    },
    smithMasterChaSilverHelm: {
      name: '精工銀王冠 · 魅力'
    },
    smithChaSilverHelm: {
      name: '銀王冠 · 魅力'
    },
    smithMasterChaSilverPlate: {
      name: '精工銀戰袍 · 魅力'
    },
    smithChaSilverPlate: {
      name: '銀戰袍 · 魅力'
    },
    smithMasterChaSilverGreaves: {
      name: '精工銀靴子 · 魅力'
    },
    smithChaSilverGreaves: {
      name: '銀靴子 · 魅力'
    },
    smithMasterChaGoldSword: {
      name: '精工金權杖 · 魅力'
    },
    smithChaGoldSword: {
      name: '金權杖 · 魅力'
    },
    smithMasterChaGoldHammer: {
      name: '精工金戰旗 · 魅力'
    },
    smithChaGoldHammer: {
      name: '金戰旗 · 魅力'
    },
    smithMasterChaGoldShield: {
      name: '精工金法典 · 魅力'
    },
    smithChaGoldShield: {
      name: '金法典 · 魅力'
    },
    smithMasterChaGoldHelm: {
      name: '精工金王冠 · 魅力'
    },
    smithChaGoldHelm: {
      name: '金王冠 · 魅力'
    },
    smithMasterChaGoldPlate: {
      name: '精工金戰袍 · 魅力'
    },
    smithChaGoldPlate: {
      name: '金戰袍 · 魅力'
    },
    smithMasterChaGoldGreaves: {
      name: '精工金靴子 · 魅力'
    },
    smithChaGoldGreaves: {
      name: '金靴子 · 魅力'
    },
    smithMasterChaMithrilSword: {
      name: '精工秘銀權杖 · 魅力'
    },
    smithMasterChaAdamantSword: {
      name: '精工艾達曼權杖 · 魅力'
    },
    smithMasterChaAetheriteSword: {
      name: '精工以太晶權杖 · 魅力'
    },
    smithChaMithrilSword: {
      name: '秘銀權杖 · 魅力'
    },
    smithChaAdamantSword: {
      name: '艾達曼權杖 · 魅力'
    },
    smithChaAetheriteSword: {
      name: '以太晶權杖 · 魅力'
    },
    smithMasterChaMithrilHammer: {
      name: '精工秘銀戰旗 · 魅力'
    },
    smithMasterChaAdamantHammer: {
      name: '精工艾達曼戰旗 · 魅力'
    },
    smithMasterChaAetheriteHammer: {
      name: '精工以太晶戰旗 · 魅力'
    },
    smithChaMithrilHammer: {
      name: '秘銀戰旗 · 魅力'
    },
    smithChaAdamantHammer: {
      name: '艾達曼戰旗 · 魅力'
    },
    smithChaAetheriteHammer: {
      name: '以太晶戰旗 · 魅力'
    },
    smithMasterChaMithrilShield: {
      name: '精工秘銀法典 · 魅力'
    },
    smithMasterChaAdamantShield: {
      name: '精工艾達曼法典 · 魅力'
    },
    smithMasterChaAetheriteShield: {
      name: '精工以太晶法典 · 魅力'
    },
    smithChaMithrilShield: {
      name: '秘銀法典 · 魅力'
    },
    smithChaAdamantShield: {
      name: '艾達曼法典 · 魅力'
    },
    smithChaAetheriteShield: {
      name: '以太晶法典 · 魅力'
    },
    smithMasterChaMithrilHelm: {
      name: '精工秘銀王冠 · 魅力'
    },
    smithMasterChaAdamantHelm: {
      name: '精工艾達曼王冠 · 魅力'
    },
    smithMasterChaAetheriteHelm: {
      name: '精工以太晶王冠 · 魅力'
    },
    smithChaMithrilHelm: {
      name: '秘銀王冠 · 魅力'
    },
    smithChaAdamantHelm: {
      name: '艾達曼王冠 · 魅力'
    },
    smithChaAetheriteHelm: {
      name: '以太晶王冠 · 魅力'
    },
    smithMasterChaMithrilPlate: {
      name: '精工秘銀戰袍 · 魅力'
    },
    smithMasterChaAdamantPlate: {
      name: '精工艾達曼戰袍 · 魅力'
    },
    smithMasterChaAetheritePlate: {
      name: '精工以太晶戰袍 · 魅力'
    },
    smithChaMithrilPlate: {
      name: '秘銀戰袍 · 魅力'
    },
    smithChaAdamantPlate: {
      name: '艾達曼戰袍 · 魅力'
    },
    smithChaAetheritePlate: {
      name: '以太晶戰袍 · 魅力'
    },
    smithMasterChaMithrilGreaves: {
      name: '精工秘銀靴子 · 魅力'
    },
    smithMasterChaAdamantGreaves: {
      name: '精工艾達曼靴子 · 魅力'
    },
    smithMasterChaAetheriteGreaves: {
      name: '精工以太晶靴子 · 魅力'
    },
    smithChaMithrilGreaves: {
      name: '秘銀靴子 · 魅力'
    },
    smithChaAdamantGreaves: {
      name: '艾達曼靴子 · 魅力'
    },
    smithChaAetheriteGreaves: {
      name: '以太晶靴子 · 魅力'
    },
    smithMasterEndIronSword: {
      name: '精工鐵釘頭錘 · 耐力'
    },
    smithEndIronSword: {
      name: '鐵釘頭錘 · 耐力'
    },
    smithMasterEndIronHammer: {
      name: '精工鐵戰斧 · 耐力'
    },
    smithEndIronHammer: {
      name: '鐵戰斧 · 耐力'
    },
    smithMasterEndIronShield: {
      name: '精工鐵盾 · 耐力'
    },
    smithEndIronShield: {
      name: '鐵盾 · 耐力'
    },
    smithMasterEndIronHelm: {
      name: '精工鐵盔 · 耐力'
    },
    smithEndIronHelm: {
      name: '鐵盔 · 耐力'
    },
    smithMasterEndIronPlate: {
      name: '精工鐵板甲 · 耐力'
    },
    smithEndIronPlate: {
      name: '鐵板甲 · 耐力'
    },
    smithMasterEndIronGreaves: {
      name: '精工鐵脛甲 · 耐力'
    },
    smithEndIronGreaves: {
      name: '鐵脛甲 · 耐力'
    },
    smithMasterEndSilverSword: {
      name: '精工銀釘頭錘 · 耐力'
    },
    smithEndSilverSword: {
      name: '銀釘頭錘 · 耐力'
    },
    smithMasterEndSilverHammer: {
      name: '精工銀戰斧 · 耐力'
    },
    smithEndSilverHammer: {
      name: '銀戰斧 · 耐力'
    },
    smithMasterEndSilverShield: {
      name: '精工銀盾 · 耐力'
    },
    smithEndSilverShield: {
      name: '銀盾 · 耐力'
    },
    smithMasterEndSilverHelm: {
      name: '精工銀盔 · 耐力'
    },
    smithEndSilverHelm: {
      name: '銀盔 · 耐力'
    },
    smithMasterEndSilverPlate: {
      name: '精工銀板甲 · 耐力'
    },
    smithEndSilverPlate: {
      name: '銀板甲 · 耐力'
    },
    smithMasterEndSilverGreaves: {
      name: '精工銀脛甲 · 耐力'
    },
    smithEndSilverGreaves: {
      name: '銀脛甲 · 耐力'
    },
    smithMasterEndGoldSword: {
      name: '精工金釘頭錘 · 耐力'
    },
    smithEndGoldSword: {
      name: '金釘頭錘 · 耐力'
    },
    smithMasterEndGoldHammer: {
      name: '精工金戰斧 · 耐力'
    },
    smithEndGoldHammer: {
      name: '金戰斧 · 耐力'
    },
    smithMasterEndGoldShield: {
      name: '精工金盾 · 耐力'
    },
    smithEndGoldShield: {
      name: '金盾 · 耐力'
    },
    smithMasterEndGoldHelm: {
      name: '精工金盔 · 耐力'
    },
    smithEndGoldHelm: {
      name: '金盔 · 耐力'
    },
    smithMasterEndGoldPlate: {
      name: '精工金板甲 · 耐力'
    },
    smithEndGoldPlate: {
      name: '金板甲 · 耐力'
    },
    smithMasterEndGoldGreaves: {
      name: '精工金脛甲 · 耐力'
    },
    smithEndGoldGreaves: {
      name: '金脛甲 · 耐力'
    },
    smithMasterEndMithrilSword: {
      name: '精工秘銀釘頭錘 · 耐力'
    },
    smithMasterEndAdamantSword: {
      name: '精工艾達曼釘頭錘 · 耐力'
    },
    smithMasterEndAetheriteSword: {
      name: '精工以太晶釘頭錘 · 耐力'
    },
    smithEndMithrilSword: {
      name: '秘銀釘頭錘 · 耐力'
    },
    smithEndAdamantSword: {
      name: '艾達曼釘頭錘 · 耐力'
    },
    smithEndAetheriteSword: {
      name: '以太晶釘頭錘 · 耐力'
    },
    smithMasterEndMithrilHammer: {
      name: '精工秘銀戰斧 · 耐力'
    },
    smithMasterEndAdamantHammer: {
      name: '精工艾達曼戰斧 · 耐力'
    },
    smithMasterEndAetheriteHammer: {
      name: '精工以太晶戰斧 · 耐力'
    },
    smithEndMithrilHammer: {
      name: '秘銀戰斧 · 耐力'
    },
    smithEndAdamantHammer: {
      name: '艾達曼戰斧 · 耐力'
    },
    smithEndAetheriteHammer: {
      name: '以太晶戰斧 · 耐力'
    },
    smithMasterEndMithrilShield: {
      name: '精工秘銀盾 · 耐力'
    },
    smithMasterEndAdamantShield: {
      name: '精工艾達曼盾 · 耐力'
    },
    smithMasterEndAetheriteShield: {
      name: '精工以太晶盾 · 耐力'
    },
    smithEndMithrilShield: {
      name: '秘銀盾 · 耐力'
    },
    smithEndAdamantShield: {
      name: '艾達曼盾 · 耐力'
    },
    smithEndAetheriteShield: {
      name: '以太晶盾 · 耐力'
    },
    smithMasterEndMithrilHelm: {
      name: '精工秘銀盔 · 耐力'
    },
    smithMasterEndAdamantHelm: {
      name: '精工艾達曼盔 · 耐力'
    },
    smithMasterEndAetheriteHelm: {
      name: '精工以太晶盔 · 耐力'
    },
    smithEndMithrilHelm: {
      name: '秘銀盔 · 耐力'
    },
    smithEndAdamantHelm: {
      name: '艾達曼盔 · 耐力'
    },
    smithEndAetheriteHelm: {
      name: '以太晶盔 · 耐力'
    },
    smithMasterEndMithrilPlate: {
      name: '精工秘銀板甲 · 耐力'
    },
    smithMasterEndAdamantPlate: {
      name: '精工艾達曼板甲 · 耐力'
    },
    smithMasterEndAetheritePlate: {
      name: '精工以太晶板甲 · 耐力'
    },
    smithEndMithrilPlate: {
      name: '秘銀板甲 · 耐力'
    },
    smithEndAdamantPlate: {
      name: '艾達曼板甲 · 耐力'
    },
    smithEndAetheritePlate: {
      name: '以太晶板甲 · 耐力'
    },
    smithMasterEndMithrilGreaves: {
      name: '精工秘銀脛甲 · 耐力'
    },
    smithMasterEndAdamantGreaves: {
      name: '精工艾達曼脛甲 · 耐力'
    },
    smithMasterEndAetheriteGreaves: {
      name: '精工以太晶脛甲 · 耐力'
    },
    smithEndMithrilGreaves: {
      name: '秘銀脛甲 · 耐力'
    },
    smithEndAdamantGreaves: {
      name: '艾達曼脛甲 · 耐力'
    },
    smithEndAetheriteGreaves: {
      name: '以太晶脛甲 · 耐力'
    },
    smithIronSword: {
      name: '鐵劍'
    },
    rustedShortsword: {
      name: '生鏽的短劍'
    },
    apprenticeStaff: {
      name: '學徒法杖'
    },
    scoutsHandgun: {
      name: '斥候手槍'
    },
    ironBroadsword: {
      name: '鐵製闊劍'
    },
    vipinsStiletto: {
      name: '維平的細刃匕首'
    },
    aetherCarbine: {
      name: '乙太卡賓槍'
    },
    ashenGreatsword: {
      name: '灰燼巨劍'
    },
    archmageWand: {
      name: '大法師魔杖'
    },
    chronoBlade: {
      name: '時光之刃'
    },
    bloodForgedAxe: {
      name: '血鑄戰斧'
    },
    voidCannon: {
      name: '虛空加農砲'
    },
    dragonSmasher: {
      name: '碎龍鎚'
    },
    bladeOfTheUnbound: {
      name: '無縛者之刃'
    },
    aetheriumDestroyer: {
      name: '乙太晶毀滅者'
    },
    woodenBuckler: {
      name: '木製小圓盾'
    },
    tomeOfNovices: {
      name: '新手魔典'
    },
    ironShield: {
      name: '鐵盾'
    },
    syringeOfTheAdept: {
      name: '行家的針筒'
    },
    aethericBattery: {
      name: '乙太電池'
    },
    aegisTowerShield: {
      name: '神盾塔盾'
    },
    orbOfEternalFlame: {
      name: '永恆烈焰寶珠'
    },
    shieldOfTheFallen: {
      name: '陣亡者之盾'
    },
    paddedTunic: {
      name: '鋪棉短衣'
    },
    leatherDoublet: {
      name: '皮製緊身衣'
    },
    chainmailVest: {
      name: '鎖子甲背心'
    },
    scholarsRobe: {
      name: '學者長袍'
    },
    reinforcedPlate: {
      name: '強化板甲'
    },
    assassinsGarb: {
      name: '刺客裝束'
    },
    chronoWeaverCloak: {
      name: '織時者斗篷'
    },
    bloodSoakedPlate: {
      name: '浴血板甲'
    },
    exoArmorChassis: {
      name: '外骨骼裝甲機架'
    },
    dragonscaleHauberk: {
      name: '龍鱗鎖子甲'
    },
    vestmentsOfSovereign: {
      name: '君主法衣'
    },
    armorOfTheTitan: {
      name: '泰坦之甲'
    },
    quiltedCap: {
      name: '絎縫軟帽'
    },
    stalkersHood: {
      name: '潛獵者兜帽'
    },
    ironcladHelm: {
      name: '鐵甲頭盔'
    },
    seersCirclet: {
      name: '先知頭環'
    },
    wyrmguardGreathelm: {
      name: '龍衛大盔'
    },
    hatOfTheStarweaver: {
      name: '織星者之帽'
    },
    hideGloves: {
      name: '獸皮手套'
    },
    ironGauntlets: {
      name: '鐵護手'
    },
    emberweaveGloves: {
      name: '餘燼織紋手套'
    },
    duelistsGrips: {
      name: '決鬥者護手'
    },
    voidforgedGauntlets: {
      name: '虛空鍛造護手'
    },
    gripsOfTheTempest: {
      name: '風暴之握'
    },
    trailBoots: {
      name: '旅途靴'
    },
    pathfindersBoots: {
      name: '開路者之靴'
    },
    forgeplateGreaves: {
      name: '鍛板脛甲'
    },
    mistwalkerBoots: {
      name: '霧行者之靴'
    },
    stormstrideGreaves: {
      name: '踏風暴脛甲'
    },
    treadsOfTheHorizon: {
      name: '地平線之步'
    },
    copperBand: {
      name: '銅指環'
    },
    ringOfMending: {
      name: '癒合之戒'
    },
    bandOfSwiftness: {
      name: '迅捷指環'
    },
    castersEmblem: {
      name: '施法者徽記'
    },
    infiltratorsCharm: {
      name: '潛入者護符'
    },
    timekeepersHourglass: {
      name: '守時者沙漏'
    },
    ringOfTheVampyre: {
      name: '吸血鬼之戒'
    },
    sovereignsSignet: {
      name: '君主印戒'
    },
    heraldsPin: {
      name: '傳令官胸針'
    },
    hymnalOfTheRoad: {
      name: '旅途聖歌集'
    },
    shepherdsCrook: {
      name: '牧羊人之杖'
    },
    minstrelsHat: {
      name: '吟遊詩人之帽'
    },
    pilgrimsSandals: {
      name: '朝聖者涼鞋'
    },
    falconersGloves: {
      name: '馴鷹人手套'
    },
    bellOfTheHerd: {
      name: '畜群之鈴'
    },
    bannerOfTheHost: {
      name: '大軍之旗'
    },
    heraldsTabard: {
      name: '傳令官罩袍'
    },
    codexOfOaths: {
      name: '誓約法典'
    },
    crownOfTheRightfulKing: {
      name: '正統之王的王冠'
    },
    scepterOfTheFirstKing: {
      name: '初代國王的權杖'
    },
    pickpocketsKnife: {
      name: '扒手之刀'
    },
    serpentsFang: {
      name: '蛇牙'
    },
    phantomRapier: {
      name: '幻影細劍'
    },
    fangOfTheWindless: {
      name: '無風之牙'
    },
    roguesBuckler: {
      name: '惡棍小圓盾'
    },
    venomVial: {
      name: '毒藥瓶'
    },
    swiftguardBuckler: {
      name: '迅捷衛士小圓盾'
    },
    nightshadeFlask: {
      name: '顛茄瓶'
    },
    windveilTarge: {
      name: '風幕盾'
    },
    shadowdancersBuckler: {
      name: '影舞者小圓盾'
    },
    scoutsBandana: {
      name: '斥候頭巾'
    },
    nightcowl: {
      name: '夜之兜帽'
    },
    shadowveilHood: {
      name: '影幕兜帽'
    },
    windrunnersCap: {
      name: '逐風者便帽'
    },
    maskOfTheSilentWind: {
      name: '靜風面具'
    },
    rangersJerkin: {
      name: '遊俠皮甲'
    },
    nightstalkerLeathers: {
      name: '夜獵者皮革'
    },
    windridersHarness: {
      name: '馭風者束帶'
    },
    mantleOfTheShadowDancer: {
      name: '影舞者斗篷'
    },
    thiefsGloves: {
      name: '盜賊手套'
    },
    cutpurseGloves: {
      name: '扒手手套'
    },
    glovesOfTheGale: {
      name: '疾風手套'
    },
    softSoledShoes: {
      name: '軟底鞋'
    },
    catStepBoots: {
      name: '貓步靴'
    },
    shadowstepBoots: {
      name: '影步靴'
    },
    windstrideBoots: {
      name: '風步靴'
    },
    luckyCoin: {
      name: '幸運硬幣'
    },
    shadowBand: {
      name: '暗影指環'
    },
    sandglassOfTheSwift: {
      name: '迅捷者的沙漏'
    },
    talonCharm: {
      name: '利爪護符'
    },
    windheart: {
      name: '風之心'
    },
    ashwallHeater: {
      name: '灰壁鳶盾'
    },
    wyrmhidePavise: {
      name: '飛龍皮重盾'
    },
    footmansKettleHat: {
      name: '步兵鍋盔'
    },
    ironbrowSallet: {
      name: '鐵眉輕盔'
    },
    warlordsBarbute: {
      name: '軍閥巴比特盔'
    },
    helmOfTheSunderedThrone: {
      name: '破碎王座之盔'
    },
    recruitsCuirass: {
      name: '新兵胸甲'
    },
    stonecuttersMitts: {
      name: '石匠手套'
    },
    ashforgedGauntlets: {
      name: '灰燼鍛造護手'
    },
    warbringerGauntlets: {
      name: '引戰者護手'
    },
    titanfistGauntlets: {
      name: '泰坦之拳護手'
    },
    footmansGreaves: {
      name: '步兵脛甲'
    },
    ironshodGreaves: {
      name: '鐵釘脛甲'
    },
    warlordsSabatons: {
      name: '軍閥鐵靴'
    },
    greavesOfTheMountainfall: {
      name: '山崩脛甲'
    },
    sergeantsSignet: {
      name: '軍士印戒'
    },
    brawlersKnuckleRing: {
      name: '鬥毆者指虎'
    },
    bloodiedWarMedal: {
      name: '染血戰功章'
    },
    watchmansCudgel: {
      name: '守衛警棍'
    },
    ironboundMace: {
      name: '鐵箍釘頭錘'
    },
    stonehideCleaver: {
      name: '石膚砍刀'
    },
    bulwarkMaul: {
      name: '壁壘重錘'
    },
    mountainsplitterAxe: {
      name: '裂山斧'
    },
    everstandWarmace: {
      name: '不動戰錘'
    },
    emberwallBastion: {
      name: '餘燼之牆堡壘盾'
    },
    stonewardenHelm: {
      name: '石衛頭盔'
    },
    colossusVisage: {
      name: '巨像之容'
    },
    diggersGauntlets: {
      name: '掘地者護手'
    },
    bastionGauntlets: {
      name: '堡壘護手'
    },
    glacierplateGauntlets: {
      name: '冰川板護手'
    },
    gauntletsOfEndlessVigil: {
      name: '永夜守望護手'
    },
    hearthstoneCharm: {
      name: '爐石護符'
    },
    ironheartPendant: {
      name: '鐵心吊墜'
    },
    hedgewizardsWand: {
      name: '籬笆術士之杖'
    },
    frostglassStaff: {
      name: '霜玻璃法杖'
    },
    voidthreadWand: {
      name: '虛空絲線之杖'
    },
    staffOfTheStarlessSky: {
      name: '無星天空之杖'
    },
    studentsGrimoire: {
      name: '學徒魔典'
    },
    frostfireOrb: {
      name: '霜火寶珠'
    },
    orbOfTheUnwrittenHour: {
      name: '未書之時寶珠'
    },
    apprenticesPointedCap: {
      name: '學徒尖帽'
    },
    sagesCirclet: {
      name: '賢者額環'
    },
    cinderWizardsHat: {
      name: '灰燼法師之帽'
    },
    voidseerCirclet: {
      name: '虛空先知額環'
    },
    apprenticesRobe: {
      name: '學徒長袍'
    },
    cinderthreadRobe: {
      name: '灰絲長袍'
    },
    voidwovenRobe: {
      name: '虛空織造長袍'
    },
    inkStainedGloves: {
      name: '墨漬手套'
    },
    spellthreadGloves: {
      name: '咒線手套'
    },
    frostweaveGloves: {
      name: '霜織手套'
    },
    starlitGloves: {
      name: '星光手套'
    },
    glovesOfTheLastWord: {
      name: '最後之言手套'
    },
    scribesSlippers: {
      name: '書記員拖鞋'
    },
    moonstepSlippers: {
      name: '月步拖鞋'
    },
    emberstepBoots: {
      name: '餘燼步靴'
    },
    voidwalkerBoots: {
      name: '虛空漫行者之靴'
    },
    bootsOfTheWanderingStar: {
      name: '流浪星辰之靴'
    },
    glowstonePendant: {
      name: '輝石吊墜'
    },
    scholarsSeal: {
      name: '學者印章'
    },
    eyeOfTheArchon: {
      name: '執政官之眼'
    },
    cinderRepeater: {
      name: '灰燼連發槍'
    },
    glacierMortar: {
      name: '冰川手持迫擊砲'
    },
    sparkCell: {
      name: '火花電池'
    },
    arcCapacitor: {
      name: '電弧電容器'
    },
    aetherheartCell: {
      name: '以太之心電池'
    },
    marksmansVisor: {
      name: '射手面甲'
    },
    sharpshootersCap: {
      name: '狙擊手帽'
    },
    gunnersHarness: {
      name: '砲手背帶'
    },
    steadyhandGloves: {
      name: '穩手手套'
    },
    gunsmithsGloves: {
      name: '槍匠手套'
    },
    scrappersBoots: {
      name: '鬥毆者之靴'
    },
    sharpshooterBoots: {
      name: '狙擊手之靴'
    },
    firingLineBoots: {
      name: '射擊線之靴'
    },
    steadyfootBoots: {
      name: '穩足之靴'
    },
    aetherstepBoots: {
      name: '以太步靴'
    },
    bootsOfTheLastShot: {
      name: '最後一槍之靴'
    },
    brassCartridgeCharm: {
      name: '黃銅彈殼護符'
    },
    deadEyeLens: {
      name: '準眼透鏡'
    },
    eagleEyeScope: {
      name: '鷹眼望遠鏡'
    },
    criersBaton: {
      name: '傳令官短杖'
    },
    droversStandard: {
      name: '牧人旗幟'
    },
    marshalsSceptre: {
      name: '元帥權杖'
    },
    balladBook: {
      name: '歌謠集'
    },
    chronicleOfHeroes: {
      name: '英雄編年史'
    },
    psalterOfTheHost: {
      name: '軍團聖詠集'
    },
    tomeOfEternalReign: {
      name: '永恆統治之卷'
    },
    heraldsCap: {
      name: '傳令官帽'
    },
    singersCirclet: {
      name: '歌者額環'
    },
    diademOfTenThousandVoices: {
      name: '萬聲王冠'
    },
    travelersWaistcoat: {
      name: '旅人背心'
    },
    minstrelsMotley: {
      name: '吟遊詩人補丁衣'
    },
    troubadoursCoat: {
      name: '遊吟詩人外套'
    },
    marshalsGreatcoat: {
      name: '元帥大衣'
    },
    buskersGloves: {
      name: '街頭樂手手套'
    },
    drummersGloves: {
      name: '鼓手手套'
    },
    standardBearersGloves: {
      name: '旗手手套'
    },
    gildedParadeGloves: {
      name: '鍍金閱兵手套'
    },
    glovesOfTheCrownedHand: {
      name: '加冕之手手套'
    },
    wayfarersShoes: {
      name: '旅人之鞋'
    },
    troubadourBoots: {
      name: '遊吟詩人之靴'
    },
    heraldsRidingBoots: {
      name: '傳令官馬靴'
    },
    paradeBoots: {
      name: '閱兵靴'
    },
    bootsOfTheLongProcession: {
      name: '長行列之靴'
    },
    silverWhistle: {
      name: '銀哨'
    },
    gatheringHorn: {
      name: '集結號角'
    },
    heartOfTheMountain: {
      name: '山脈之心'
    },
    ringOfAbsolutePower: {
      name: '絕對力量之戒'
    }
  },
  bag: {
    oreCount: '{ore}：{n}',
    noOre: '還沒有礦石。到野外開採岩壁上的礦脈吧。',
    equip: '裝備',
    unequip: '卸下',
    worn: '你正穿著它。先脫下才能賣出。',
    versus: '與{item}比較',
    hint: '點一下物品查看。再點一次，或拖曳到欄位上，就能穿戴。',
    empty: '背包裡沒有這類物品。',
    slotEmpty: '{slot}：空',
    slotHolds: '{slot}：{item}',
    filter: {
      ore: '礦石',
      all: '全部',
      weapons: '武器',
      armor: '護甲',
      trinkets: '飾品',
      herbs: '草藥'
    },
    sort: {
      slot: '類型',
      tier: '品質',
      level: '等級'
    },
    sortBy: '排序：{by}',
    noHerbs: '還沒有草藥。它們長在野外：從上面走過就能採下。',
    herbCount: '{plant}：{n}'
  },
  shop: {
    buy: '購買',
    sell: '賣出',
    owned: '已擁有',
    empty: '今天架上什麼都沒有。',
    goods: '販售中',
    price: '價格',
    value: '收購價',
    hint: '點一下架上或背包裡的東西，把它放到桌上，也可以直接拖曳過去。',
    buyBack: '今日已賣出',
    buyBackOne: '買回',
    deal: '成交！',
    say: {
      buy: '好眼光。好好愛惜它，它也會護著你。',
      sell: '行。總會有人想要的。',
      back: '改變主意了？沒關係，還給你。',
      poor: '恐怕你帶的錢還差一點。'
    }
  },
  trainer: {
    learn: '學習',
    known: '已學會',
    friend: '{faction}善待朋友：打八折。',
    fee: '學費',
    rank: {
      label: '{n}階',
      up: '升階',
      effect: '效果+{effect}%，冷卻−{cd}%',
      max: '已達最高階',
      level: '{n}階需要等級{lvl}。'
    },
    hint: '選一堂課。邊緣是綠色就表示現在可以學。',
    block: {
      'trial': "你還沒有通過這個職業的試煉。",
      'parents': "先學會{a}和{b}各一個技能。",
      level: '你的等級不夠。',
      attrs: '你的屬性不夠。',
      gold: '金幣不夠。'
    }
  },
  healer: {
    talk: '坐下來歇一會兒吧。你的藥瓶又滿了。要是願意，我還能賣你一條更大的腰帶。',
    note: '你每次進入區域都會帶 {n} 瓶藥水。',
    buy: '多帶一瓶 · {n}',
    full: '你的腰帶已經掛滿了。',
    belt: '藥水腰帶',
    slotTitle: '腰帶已擴充',
    slotBought: '多了一個藥瓶槽：現在每次進入區域都帶 {n} 瓶生命藥水，並可儲存 {n} 瓶法力藥水。',
    mana: {
      title: '魔力藥水',
      note: '庫存：{n}/{max}。下次來也還在。',
      buy: '一瓶魔力藥水 · {n}',
      full: '你的庫存滿了。'
    }
  },
  faction: {
    order: '鐵之騎士團',
    syndicate: '灰燼商會',
    circle: '乙太議會'
  },
  npc: {
    'mysteriousWanderer': { 'name': "神秘旅人" },
    'fairPip': { 'name': "皮普" },
    'fairBess': { 'name': "老貝絲" },
    'fairHob': { 'name': "霍布" },
    sunkenPriest: { name: "沉沒祭司" },
    'fortHale': {
      'name': "海爾隊長",
    },
    'fortMara': {
      'name': "瑪拉長老",
    },
    'scoutWren': {
      'name': "斥候雷恩",
    },
    frostDisciple: {
      name: '艾佛·哈斯克'
    },
    windDisciple: {
      name: '凱斯崔爾·韋恩'
    },
    freedFarmers: {
      name: '喬里·托勒'
    },
    freedHerbalist: {
      name: '布萊爾·霍洛韋爾'
    },
    lightDisciple: {
      name: '奧蕾爾修女'
    },
    freedPeddler: {
      talk: '旅人需要的，這兒應有盡有。幾乎全新，大多是啦。',
      name: '奧多·馬羅'
    },
    sfShadowRoad: {
      name: '妮特爾·奎克漢德'
    },
    sfShadow: {
      name: '妮特爾·奎克漢德'
    },
    sfGeo: {
      name: '哈洛·弗林特'
    },
    wanderer: {
      name: '流浪者 Pip',
      talk: '路途遙遠，錢包卻很輕？我這裡什麼都有一點。'
    },
    sunfordSmith: {
      name: '鐵匠布拉姆',
      talk: '實在的鋼，公道的價。慢慢挑。'
    },
    sunfordPeddler: {
      name: '小販蒂莉',
      talk: '戒指、護符、各種小玩意兒。這件說不定還真能帶來好運。'
    },
    trainerAegis: {
      name: '奧德里克爵士'
    },
    trainerPyro: {
      name: '安珀·雷恩'
    },
    elderMara: {
      name: '瑪拉長老'
    },
    sunfordHealer: {
      name: '露恩修女'
    },
    goblinTrader: {
      name: '商人格里克',
      talk: '這些是我家人做的。做工好，價錢公道。'
    },
    captainHale: {
      name: '海爾隊長'
    },
    oakArmorer: {
      name: '護甲匠奧多',
      talk: '我一半的存貨都送上城牆了。剩下的你看著拿，合身就行。'
    },
    oakMasterArmorer: {
      name: '奧多大師',
      talk: '好的板甲拿出來了。你絕對有資格看一看。'
    },
    oakWeapons: {
      name: '刀劍商賽娜',
      talk: '鋒利、順手、價錢實在。別摸刀刃。'
    },
    trainerShadow: {
      name: '「低語」'
    },
    trainerSovereign: {
      name: '卡斯特蘭勛爵'
    },
    oakHealer: {
      name: '芬恩修士'
    },
    blackMarket: {
      name: '銷贓人',
      talk: '兩邊都不問來路。商會抽成，你拿貨。'
    },
    trainerBlood: {
      name: '桑格雷爾醫生'
    },
    syndicateBoss: {
      name: '灰燼夫人'
    },
    forgemaster: {
      name: '鍛造大師多恩'
    },
    ironWeapons: {
      name: '「鎚手」希爾妲',
      talk: '件件都是矮人親手鍛的。要是有哪件斷了，我得知道怎麼斷的。'
    },
    ironAetherWorks: {
      name: '工匠沃斯',
      talk: '這裡的東西全是研究核心研究出來的。小心點，大多是上了膛的。'
    },
    ironArmor: {
      name: '「鐵壁」加倫',
      talk: '甲在架子上，戒指在盤子裡。'
    },
    ironOrderArmor: {
      name: '騎士團軍需官',
      talk: '需要什麼就拿。騎士團照顧自己人。'
    },
    trainerGeo: {
      name: '石腳老爹'
    },
    trainerAether: {
      name: '齒輪匠皮姆'
    },
    ironHealer: {
      name: '布琳雅嬤嬤'
    },
    exiledSovereign: {
      name: '流亡的卡斯特蘭勛爵'
    },
    trainerChrono: {
      name: '時辰守護者'
    },
    mayorBrenna: {
      name: '布倫娜·奎爾鎮長'
    },
    sbHealer: {
      name: '安塞爾修士'
    },
    sbArmorer: {
      name: '葛蕾塔·艾恩維恩',
      talk: '山裡的鋼，河邊的價。隨便敲敲看。'
    },
    sbWeapons: {
      name: '科爾文·阿什比',
      talk: '阿什比精品刀劍。每道刃都是手工打磨。用我的手。'
    },
    sbJeweler: {
      name: '塔姆·馬洛',
      talk: '戒指、護符、幸運石。全是真的。好吧，差不多全是。'
    },
    sbMasterAegis: {
      name: '海爾嘉·斯托姆希爾德女爵士'
    },
    sbMasterPyro: {
      name: '魔導師伊格內修斯·維爾'
    },
    sbMasterShadow: {
      name: '尼克斯·哈洛威'
    },
    sbMasterSovereign: {
      name: '珀西瓦爾·阿什科姆勛爵'
    },
    sbMasterGeo: {
      name: '托娃·迪普魯特奶奶'
    },
    sbMasterAether: {
      name: '昆特·斯普羅基特教授'
    },
    sbMasterChrono: {
      name: '守鐘人塞爾溫'
    },
    sbMasterBlood: {
      name: '維斯珀·克里姆森利夫'
    },
    sbAlchemist: {
      name: '「蕨笛」奧迪爾'
    },
    sbGambler: {
      name: '佩爾夫人'
    },
    sunfordGambler: {
      name: '「筋斗」多布'
    },
    sunfordCups: {
      name: '「快手」奈爾'
    },
    oakGambler: {
      name: '「絲絨」倫'
    },
    sbCollector: {
      name: '奧爾德·維恩',
      talk: '稀罕的寶貝，只給稀罕的朋友。手上沾著果醬可什麼都別碰。'
    },
    sbFence: {
      name: '米蕾拉·索恩',
      talk: '上好的護甲，什麼都不問。好吧，問得很少。'
    },
    sbMasterWindrunner: {
      name: '「疾風翼」塞法'
    },
    sbMasterFrostwarden: {
      name: '「霜心」哈爾瓦德'
    },
    sbMasterLightbringer: {
      name: '「晨湖」奧瑞爾修女'
    },
    sbMasterBeastcaller: {
      name: '「薊足」羅文老爹'
    },
    sbMasterElementalist: {
      name: '「四風」艾莉絲導師'
    },
    sbMasterSoulwarden: {
      name: '「燈光」守望者奧達莉絲'
    },
    sbMasterIronmonk: {
      name: '「靜水」歐魯大師'
    },
    sbMasterBard: {
      name: '「晴天」拉克'
    }
  },
  quest: {
    final: '這個選擇無法反悔。',
    needsRep: '{faction}聲望 {n}',
    gold: '+{n} 金幣',
    goblinKing: {
      title: '哥布林王',
      slay: {
        label: '終結他的統治。'
      },
      pact: {
        label: '提議和桑佛德簽訂貿易協定。'
      },
      ransom: {
        label: '拿走他的財寶，把王冠留給他。'
      }
    },
    siege: {
      title: '奧克赫文圍城戰',
      defend: {
        label: '保衛奧克赫文。'
      },
      betray: {
        label: '替商會打開城門。'
      }
    },
    core: {
      title: '艾恩霍德之心',
      destroy: {
        label: '擊碎核心。'
      },
      study: {
        label: '交給議會研究。'
      },
      sell: {
        label: '賣給商會。'
      }
    },
    oracle: {
      title: '沉溺的神諭者',
      free: {
        label: '打斷她的鎖鏈。'
      },
      slay: {
        label: '奪走她守護的沙漏。'
      }
    },
    dragon: {
      title: '虛空巨龍',
      slay: {
        label: '屠龍。'
      },
      pact: {
        label: '結盟對抗大惡魔。'
      }
    },
    throne: {
      title: '空王座',
      order: {
        label: '把王座交給鐵之騎士團。'
      },
      syndicate: {
        label: '把王座交給灰燼商會。'
      },
      circle: {
        label: '把王座交給乙太議會。'
      },
      shatter: {
        label: '擊碎王座。'
      },
      claim: {
        label: '自己坐上去。'
      }
    }
  },
  dlg: {
    // ── The Mysterious Wanderer (afterplay phase 10) ──
    'mysteriousWanderer': {
      'hello': { '1': "嗯。你做到了極少有人做到的事。我在裂隙的另一邊感覺到了。", '2': "我傳授將兩派合而為一的古老之道。只傳給配得上的人。" },
      'sealed': { '1': "你封印了它。某種意義上，可惜了。我挺喜歡那景色。" },
      'ajar': { '1': "你讓它半開著。真大膽。惡魔會讓你時刻警醒。" },
      'again': { '1': "又來了。路很長，但你走得不錯。" },
      'train': { '1': "給我看看你的兩半，我會讓它們合而為一。" },
      'trial': { 'say': "你說的是什麼試煉？", '1': "毫髮無傷地守住城門。一次不倒地斬殺巨龍。五次煉獄鍛造，連勝五場。", '2': "利維坦之死，以及九頭蛇前的一輪完美投擲。每一樣都會打開一扇我能指給你看的門。" },
      'who': { '1': "一個旅人。你祖父出生前，我就走在裂隙邊緣了。名字會磨損的。" },
      'trainBack': { '1': "多練。兩派總要先爭吵，才會和解。" },
      'bye': { '1': "小心前行。我會在這裡，直到我不在為止。" }
    },
    'fairPip': {
      'hello': { '1': "快來看！九個木桶，一群小鬼，一把木槌。把牠們敲回去！", '2': "小鬼會從木桶裡冒出來。在沙漏流完前打中二十隻。", '3': "別碰金甲的，會扣命。連勝三次，大獎就是你的。" },
      'again': { '1': "還想敲？拿起木槌！" },
      'play': { '1': "舉起木槌！牠們來了！" },
      'who': { '1': "皮普，專業抓小鬼的。這些都是我親手抓的。會咬人喔。" },
      'playBack': { '1': "哈！好熱鬧！再來？" },
      'bye': { '1': "握槌的手放鬆點！" }
    },
    'fairBess': {
      'hello': { '1': "五個圈，三個頭，沒有一個會咬人。是我親手雕的，小心油漆。", '2': "按住蓄勁，放手投擲。蛇頭擺到中間時才接得住圈。", '3': "連續套中，每個頭多算一分。五個全中，我好好付你。" },
      'again': { '1': "又來跟我這老姑娘較量？" },
      'play': { '1': "給你圈。輕輕丟，乖孩子。" },
      'who': { '1': "在市集路上走了四十年。九頭蛇是跟著戰爭來的。挺應景。" },
      'playBack': { '1': "不錯。我過世的老伴丟得更差。" },
      'bye': { '1': "出去時小心油漆。" }
    },
    'fairHob': {
      'hello': { '1': "喔。你好。想比腕力嗎？我會輕一點。我盡量。", '2': "圓環和圓圈重合時用力。節拍不對就會滑。", '3': "手臂有力會輕鬆些。連贏我三次，鍛造大師就給你打折。" },
      'again': { '1': "再來一局？從來沒人要再來一局。" },
      'play': { '1': "手肘放桌上。你準備好就開始。" },
      'who': { '1': "我是鍛造大師的學徒。他說我不知道自己有多大力氣。" },
      'playBack': { '1': "好比賽。明天手臂會痠。大概吧。" },
      'bye': { '1': "早點再來。鐵匠鋪很安靜。" }
    },
    // ── The Breaking (the afterplay, B0–B5) ──
    'story': {
      forge: { back: { '1': "我的鍛爐又燒起來了，比以前更旺。惡魔的鐵很好熔。", '2': "把你在外面找到的東西帶來。我現在能鍛造地獄之物了。" } },
      oracle: { lens: { '1': "你曾解救過我。現在我替你去看。收下我的透鏡吧。", '2': "透過它看，地圖會顯示巨獸潛伏之處。" } },
      priest: { lens: { '1': "神諭者不在了，所以現在由我守護她的神殿。這是斯芬克斯守護的東西。", '2': "她的透鏡。透過它看，地圖會顯示巨獸潛伏之處。" } },
      herbs: { scale: { '1': "利維坦的鱗片！輕得像片葉子，還能浮在水上。", '2': "穿上它，淺水就會像堅實的地面一樣托住你。" } },
      ghost: { key: { '1': "哦，奪走我王座的人。你殺了我的九頭蛇。很好。", '2': "拿走牠的火焰鑰匙。裂隙之心在燃燒，只有火焰能打開它。" } },
      syndicate: { key: { '1': "九頭蛇死了？那牠的火焰鑰匙就歸出價的人。或者歸你吧，我猜。", '2': "它能打開裂隙之心。去把它關上，免得它吞了我的生意。" } },
      sealed: {
        sealed: { '1': "就這樣，裂隙被封印，世界開始癒合。", '2': "城鎮得以重建，歌謠得以傳唱，每一首裡都有同一個名字。" },
        ajar: { '1': "就這樣，裂隙留下了一道縫，世界學會了與它比鄰而居。", '2': "城牆仍有人把守，鬥技場依舊喧鬧，英雄始終嚴陣以待。" },
      },
      'rift': {
        'scream': {
          '1': "虛空領主倒下了，他身後的裂隙發出尖嘯。",
          '2': "那從來不是他的王座。那是他的牢籠，而他就是蓋子。",
          '3': "如今裂隙已開，虛空沉睡的一切都在甦醒。",
        },
      },
      'wren': {
        'found': {
          '1': "你在這兒！我是雷恩，一名斥候。我到處找你。",
          '2': "桑佛德在燃燒。能逃的人都去了堡壘渡口。",
          '3': "那是通往灰燼峭壁路上的舊要塞。快點，他們需要你。",
        },
      },
    },
    'scoutWren': {
      sealed: { '1': "龍沒了！道路已經感覺輕鬆多了。" },
      'hello': {
        '1': "你來了！我就知道。歡迎來到堡壘渡口。",
        '2': "我替隊長偵察道路。問我哪裡有麻煩。",
      },
      'again': {
        '1': "已經回來了？路可不會自己偵察。",
      },
      'who': {
        '1': "雷恩。桑佛德被燒之前，我替守衛送信。",
      },
      'rumor': {
        'plains': {
          '1': "惡魔占據了桑佛德平原的道路。桑佛德的導師們被困在後面。",
        },
        'hollows': {
          '1': "哥布林洞窟裡滿是地獄犬。清理掉牠們，桑佛德的人就能回家。",
        },
        'woods': {
          '1': "低語森林裡有個三頭怪物在狩獵。草藥師就躲在那裡。",
        },
        'outskirts': {
          '1': "半人馬在奧克赫文郊外馳騁。要是牠們打到城牆，我們需要每一把劍。",
        },
        'siege': {
          '1': "牠們的戰團被打散了，但更多的正在集結。隊長在加固城牆。",
        },
      },
      'bye': {
        '1': "留意道路。我也會盯著。",
      },
    },
    'fortHale': {
      sealed: { '1': "龍死了。我從沒想過能活著看到這一天。謝謝你。" },
      'siegeBack': { '1': "還沒準備好？那就休息吧。城牆會等你。" },
      'bell': { '1': "那就去城門。告訴我要守得多硬。" },
      'hello': {
        '1': "你來了。很好。我們需要每一把劍，現在比任何時候都需要。",
        '2': "歡迎來到堡壘渡口。城牆雖舊，卻是唯一還屹立的。",
      },
      'road': {
        '1': "通往桑佛德的路又通了。那裡的人在我們城牆後很安全。",
      },
      'herbs': {
        '1': "草藥師回來了，藥草也帶回來了。醫務所終於能喘口氣。",
      },
      'siege': {
        '1': "你擊潰了半人馬。但更大的軍隊要來了，衝著這些城牆來的。",
      },
      'again': {
        '1': "還站著。城牆、士兵，還有我。",
      },
      'fort': {
        '1': "一座舊邊境要塞。五十年無人駐守，直到天空被撕裂。",
        '2': "如今它是平原與群山之間最後的安全之地。",
        'say': "這是什麼地方？",
      },
      'rumor': {
        'road': {
          '1': "清理平原和洞窟。桑佛德的人被困在外面。",
        },
        'woods': {
          '1': "草藥師在低語森林，那裡還有一頭三頭巨獸。做好準備。",
        },
        'centaurs': {
          '1': "郊外有半人馬。在牠們打到這裡之前擊潰牠們的戰團。",
        },
        'siege': {
          '1': "休息一下。攻城鐘響時，我需要你上城牆。",
        },
      },
      'bye': {
        '1': "劍別離手。",
      },
    },
    'fortMara': {
      sealed: { '1': "你做到了，孩子。我們每個人都欠你一個家。" },
      'siegeBack': { '1': "歇一會兒吧，孩子。鐘聲還會再響的。" },
      'bell': { '1': "隊長的城牆現在由我看守。選吧，我們怎麼守。" },
      'hello': {
        '1': "孩子！你還活著。桑佛德被燒時，我以為最壞的事發生了。",
        '2': "我們現在是士兵要塞裡的客人，老太婆也一樣。",
      },
      'command': {
        '1': "海爾隊長與奧克赫文一同殞落了。所以現在要塞聽一位老長老的。",
      },
      'home': {
        '1': "桑佛德在重建！第一批屋頂已經蓋好了。我都要哭了。",
      },
      'again': {
        '1': "還在這裡，孩子。還在清點人數。",
      },
      'town': {
        '1': "惡魔從夜空中降下。我們帶著能帶的東西逃了出來。",
        '2': "有些人沒能逃出來。如果可以，把其餘的人帶回家。",
        'say': "桑佛德發生了什麼事？",
      },
      'rumor': {
        'road': {
          '1': "我們的導師還在桑佛德的路上。把他們帶到這裡來，孩子。",
        },
        'woods': {
          '1': "草藥師去低語森林採藥，再也沒有回來。",
        },
        'centaurs': {
          '1': "郊外有騎手。每晚蹄聲如雷。",
        },
        'siege': {
          '1': "城牆很快就要經受考驗了。我這把老骨頭能感覺到。",
        },
      },
      'bye': {
        '1': "小心前行，孩子。",
      },
    },
    intro: {
      crossing: { 1: '這個世界的每條道路都交會於十字路口……而每個十字路口，都是一場戰鬥。' },
      hero: { 1: '從桑佛德寧靜的田野，一位年輕的英雄踏上了旅程。' },
      fire: { 1: '烈火回應了召喚。鋼鐵記住了新的名字。' },
      foes: { 1: '哥布林王，冰霜領主，虛空巨龍……還有大惡魔。' },
      begin: { 1: '你的傳奇，此刻開始。' }
    },
    frostDisciple: {
      bye: {
        '1': '注意保暖。'
      },
      who: {
        '2': '艾恩霍德的熔爐很暖和。我喜歡這裡。',
        '1': '我在凍原打獵。他們把我關了一整個冬天。'
      },
      trainBack: {
        '1': '去練。寒冷很有耐心。你也要一樣。'
      },
      ready: {
        weak: {
          '1': '還不行。臂力和心志都要更強。'
        },
        able: {
          '1': '你準備好了。下一課。'
        },
        strong: {
          '1': '你比當年的我更強。需要什麼就拿。'
        }
      },
      class: {
        say: '寒霜衛士是什麼？',
        '2': '力量用於劍刃。智力用於寒霜。',
        '1': '冷卻他們，凍住他們，然後擊碎冰。'
      },
      train: {
        '1': '站穩。讓寒冷來找你。然後把它送回去。'
      },
      again: {
        '1': '你回來了。很好。'
      },
      hello: {
        '2': '艾佛·哈斯克。「霜心」哈爾瓦德教會了我寒霜。現在我在這裡傳授它。',
        '1': '自由了。很好。寒冷沒能帶走我，他們也沒能。'
      }
    },
    windDisciple: {
      bye: {
        '1': '盯緊風向。'
      },
      who: {
        '2': '能告訴塞法我還活著嗎？她會擔心的。',
        '1': '我在去西爾弗布里奇的路上，被困在峭壁那邊。'
      },
      trainBack: {
        '1': '去練練吧。找個風大的地方。'
      },
      ready: {
        weak: {
          '1': '還不行。先變快一點，再回來。'
        },
        able: {
          '1': '你可以學下一招了。看仔細。'
        },
        strong: {
          '1': '你現在比我還快了。喜歡什麼就拿吧。'
        }
      },
      class: {
        say: '疾風行者是做什麼的？',
        '2': '敏捷讓腳步更快。技巧讓每支箭都命中。',
        '1': '跑，射，再跑。永遠別待在他們瞄準的地方。'
      },
      train: {
        '1': '兩腳分開。吐氣。讓風帶著它走。'
      },
      again: {
        '1': '嘿！今天風不錯。練一練嗎？'
      },
      hello: {
        '2': '凱斯崔爾·韋恩。「疾風翼」塞法教我射箭。她教我的，我都能教你。',
        '1': '你把我救出來了！我欠你一切。嗯，欠你很多。'
      }
    },
    freedFarmers: {
      bye: {
        '1': '路上小心。'
      },
      who: {
        '2': '奧克赫文收留了我們。我們用麵包報答它。',
        '1': '強盜把我們從田裡抓走，丟在林子裡等死。'
      },
      favorDone: {
        say: '狼不會再來煩你們了。',
        '2': '拿著這個。不多，但來得清白。',
        '1': '夜裡又安靜了。我們終於能睡個好覺。'
      },
      waiting: {
        say: '關於那些狼……',
        '1': '狼還在附近。昨晚我們還聽見了。'
      },
      favor: {
        say: '有什麼我能幫忙的嗎？',
        '2': '幫忙減少一些，好嗎？殺八隻應該能給牠們個教訓。',
        '1': '低語森林跑出來的狼老是叼走我們的羊。'
      },
      again: {
        '1': '我們的英雄來了。來吃點東西嗎？'
      },
      hello: {
        '2': '喬里·托勒。我們現在在城牆外種田。嗯，算是在努力啦。',
        '1': '沒有你，我們早就死了。我和我兒子都是。謝謝你。'
      }
    },
    freedHerbalist: {
      bye: {
        '1': '輕點走。那裡有東西在生長。'
      },
      who: {
        '2': '他們也不全錯。',
        '1': '我是山裡來的草藥師。哥布林把我當成了女巫。'
      },
      favorDone: {
        say: '這是你要的日光瓣。',
        '2': '給，你的報酬。再次謝謝你。',
        '1': '哦，這些太完美了。聞聞看！'
      },
      waiting: {
        say: '關於那些日光瓣……',
        '1': '還在找嗎？日光瓣喜歡開闊的陽光。'
      },
      favor: {
        say: '有什麼我能為你做的嗎？',
        '2': '它們長在平原上。我會付你好價錢。',
        '1': '我的存貨都丟在那個籠子裡了。你能幫我帶三朵日光瓣嗎？'
      },
      again: {
        '1': '啊，又見面了。你的靴子有青苔的味道。很好。'
      },
      hello: {
        '2': '我是布萊爾。我採集、晾乾生長的東西。西爾弗布里奇好心收留了我。',
        '1': '我就知道會有人來。哥布林從來不懂草藥。也不懂善意。'
      }
    },
    lightDisciple: {
      bye: {
        '1': '願你行於光中。'
      },
      who: {
        '2': '桑佛德明亮又安靜。這兩樣我都需要。',
        '1': '我去沉沒神殿祈禱。納迦卻另有打算。'
      },
      trainBack: {
        '1': '溫和地去吧。也讓他們看見你到來。'
      },
      ready: {
        weak: {
          '1': '還不行。先要更清明的頭腦和更溫暖的心。'
        },
        able: {
          '1': '你已經準備好學下一課了。來，站到光裡。'
        },
        strong: {
          '1': '你現在比我更耀眼了。需要什麼儘管拿。'
        }
      },
      class: {
        say: '光明使者是做什麼的？',
        '2': '智力讓光更強大。魅力讓光更溫暖。',
        '1': '我們承載著黎明。用來戰鬥的光，用來療癒的光。'
      },
      train: {
        '1': '張開雙手。讓光從手中穿過，而不是從手裡發出。'
      },
      again: {
        '1': '歡迎回來。今天的陽光很溫柔。'
      },
      hello: {
        '2': '我是奧蕾爾。奧瑞爾修女教會了我光。現在我在這裡傳授它。',
        '1': '願光與你同在。你在黑暗中找到了我，我不會忘記。'
      }
    },
    freedPeddler: {
      bye: {
        '1': '小心強盜。他們可不愛分享。'
      },
      shopBack: {
        '1': '跟你做生意真愉快，朋友。'
      },
      who: {
        '2': '現在我在桑佛德做買賣。這裡比較安全。大致上啦。',
        '1': '強盜搶了我的貨車，把我塞進一個箱子裡。真沒禮貌。'
      },
      trade: {
        '1': '戒指、手套、靴子。給你半價。嗯，差不多啦。'
      },
      again: {
        '1': '我的救命恩人！來來來，好東西我都替你留著呢。'
      },
      hello: {
        '2': '奧多·馬羅，樂意效勞。小販、補鍋匠，還是個感激不盡的人。',
        '1': '你！就是你打開了那個籠子！不然我早就爛在裡面了。'
      }
    },
    sfShadowRoad: {
      hello: {
        '1': '瞬間移動。有興趣嗎？'
      },
      again: {
        '1': '又來學新把戲了？'
      },
      train: {
        '1': '看仔細。一步，你就已經在別處了。'
      },
      trainBack: {
        '1': '很好。現在去別的地方吧。'
      },
      bye: {
        '1': '別被抓到了。'
      }
    },
    sfShadow: {
      hello: {
        '1': '沒聽見你進來。這通常是我的把戲。',
        '2': '我是妮特爾·奎克漢德。我教安靜的技藝：匕首、暗影，還有提早開溜。'
      },
      again: {
        '1': '又來了？很好。希望沒人看見你。'
      },
      train: {
        '1': '腳步要輕，手要快。別被自己的刀絆倒。'
      },
      class: {
        '1': '趁對方不注意時出手，然後人早已在別處。',
        '2': '一切都靠敏捷。手快，腳快，溜得也快。',
        say: '影刃是做什麼的？'
      },
      ready: {
        strong: {
          '1': '你現在比我還快了。想拿什麼就拿吧，我都不會察覺。'
        },
        able: {
          '1': '你可以學下一招了。看仔細，我只示範一次。'
        },
        weak: {
          '1': '還不行。先練得更快些，不然影子會絆倒你。'
        }
      },
      town: {
        '1': '安靜的小鎮，老實的人。沒人會多看一眼農夫的斗篷。完美。',
        say: '為什麼在桑佛德這裡教？'
      },
      trainBack: {
        '1': '去吧。找個守衛看不見的地方練習。'
      },
      bye: {
        '1': '看好你的錢袋。'
      }
    },
    sfGeo: {
      hello: {
        '1': '小心那些石頭。有些正在聽著呢。',
        '2': '我是哈洛·弗林特。我教古老的大地魔法：岩石、根鬚，還有一點小地震。'
      },
      again: {
        '1': '啊，你回來了。大地早就告訴我你要來。'
      },
      train: {
        '1': '雙腳踩平，慢慢呼吸。感受腳下的重量。很好。'
      },
      class: {
        '1': '向大地求助。需要時築牆，牆擋不住時就用尖刺。',
        '2': '力量用來托住岩石，智力用來塑造它。兩者缺一不可。',
        say: '地術師是做什麼的？'
      },
      ready: {
        strong: {
          '1': '如今岩石比我先回應你了。需要什麼儘管拿。'
        },
        able: {
          '1': '你可以上下一課了。把手放在地上。聽。'
        },
        weak: {
          '1': '還不行。力量再多些，頭腦再清醒些，否則岩石不會聽你的。'
        }
      },
      farms: {
        '1': '每年春天都會。大麥長高一掌，卻沒人知道為什麼。別告訴他們。',
        say: '大地也會幫助農田嗎？'
      },
      trainBack: {
        '1': '去吧。還有，把那塊石頭放回原處。'
      },
      bye: {
        '1': '腳步放輕。大地會記得。'
      }
    },
    smalltalkSunford: {
      weather: {
        '1': '今晚要下雨。我這膝蓋痛了一整天了。',
        '2': '你這膝蓋上禮拜也這麼說過。',
        '3': '那不是下雨了嗎？只是沒下在這裡。'
      },
      harvest: {
        '1': '今年大麥長得真好。',
        '2': '但願我們留得住。'
      },
      goblins: {
        '1': '哥布林從米勒農場叼走了三隻母雞。',
        '2': '又來了？這個月都第二次了。',
        '3': '總得有人去管管那些洞窟。'
      },
      kingGone: {
        '1': '聽說哥布林王死了。',
        '2': '太好了。說不定我以後能一覺睡到天亮了。'
      },
      pact: {
        '1': '我今天早上跟一個哥布林買了支湯勺。',
        '2': '好用嗎？',
        '3': '老實說，比我那支還好。別告訴別人。'
      },
      bram: {
        '1': '布拉姆天亮前就守在鐵砧邊了。',
        '2': '他一擔心事情就這樣。'
      },
      pie: {
        '1': '我是不是聞到蘋果派的香味了？',
        '2': '剛才還有呢。孩子們先找到了。',
        '3': '我再烤一個。這次得藏好一點。'
      },
      road: {
        '1': '平原那條路一個禮拜沒人走了。',
        '2': '有強盜在，也不能怪誰。'
      },
      hero: {
        '1': '有人把平原路上的強盜清走了。',
        '2': '謝天謝地。我姊姊又能來看我了。'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': '一顆高麗菜兩個銀幣。兩個！',
        '2': '現在什麼東西進城門都便宜不了。',
        '3': '那我自己種好了。種在屋頂上也行。'
      },
      watch: {
        '1': '城門的守衛加了一倍。',
        '2': '好事。我睡得安穩多了。'
      },
      caravan: {
        '1': '香料商隊又晚了。',
        '2': '是盜賊嗎？',
        '3': '也可能是爛泥。希望是爛泥吧。'
      },
      siege: {
        '1': '農田那邊紮了一支軍隊。',
        '2': '那我們得趁現在把地窖裝滿。'
      },
      saved: {
        '1': '圍城解除的時候你在城牆上嗎？',
        '2': '老實說，我躲在床底下。',
        '3': '半個鎮上的人都是。不過我們還在這裡呢。'
      },
      fountain: {
        '1': '我往噴泉丟了一枚硬幣祈福。',
        '2': '希望你許的願是讓高麗菜便宜一點。'
      },
      ash: {
        '1': '什麼東西聞起來都還是煙味。',
        '2': '會散的。到頭來什麼都會散。'
      },
      hide: {
        '1': '昨晚你有聽到街上有靴子聲嗎？',
        '2': '小聲點。你不知道誰在聽。',
        '3': '對不起。我只是……對不起。'
      },
      bread: {
        '1': '我找到了半個麵包。來，分你一點。',
        '2': '你真是好人。謝謝你。'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': '第四層有一條不錯的銅礦脈。',
        '2': '是銅。我還指望是銀呢。',
        '3': '銅能付房租，銀只能付夢想。'
      },
      forge: {
        '1': '那座大熔爐一百年沒熄過火。',
        '2': '我爺爺還幫忙點過火呢，你知道吧。'
      },
      beard: {
        '1': '你把鬍子修短了。',
        '2': '離鐵砧太近，燒到了。',
        '3': '會長回來的。而且短一點更適合你。'
      },
      core: {
        '1': '深井底下有東西在發光。',
        '2': '那底下發光的沒一樣是好東西。待在上面。'
      },
      order: {
        '1': '騎士團的甲匠幹活真快，這點我得承認。',
        '2': '快是快。耐不耐用，等著瞧。'
      },
      circle: {
        '1': '議會那幫人工作時會哼小曲。',
        '2': '至少比你唱得好聽。'
      },
      cold: {
        '1': '今早冷得刺骨。',
        '2': '那就過來站爐子旁邊。'
      }
    },
    smalltalkKids: {
      tag: {
        '1': '抓到你囉，換你當鬼！',
        '2': '不公平，我還沒準備好啦！'
      },
      dragon: {
        '1': '我長大以後要騎龍。',
        '2': '龍才不會讓人騎。',
        '3': '好心的龍說不定會。'
      },
      sword: {
        '1': '快看，我撿到一把劍！',
        '2': '那是根棍子。'
      },
      frog: {
        '1': '井邊有一隻青蛙。',
        '2': '我們可以養牠嗎？',
        '3': '媽媽說不可以再抓青蛙了。'
      }
    },
    ui: {
      overheard: '鎮民',
      hero: '你',
      leave: '結束對話',
      topics: '說點什麼',
      gotGold: '獲得 {n} 金幣',
      gotItem: '獲得：{item}',
      hint: '已在地圖上標記：{zone}',
      needs: {
        attr: '需要{attr} {n}',
        level: '需要 {n} 級',
        rep: '需要{faction}聲望 {n}',
        gold: '需要 {n} 金幣',
        full: '你已經帶滿了',
        other: '還不行'
      }
    },
    hero: {
      'siege': "我們上城牆吧。",
      forge: '我想用一下你的熔爐。',
      learnSmith: '你能教我打鐵嗎？',
      ore: '我有些礦石要賣。',
      bye: '那我不打擾你了。',
      trade: '可以看看你的貨嗎？',
      train: '教教我。',
      heal: '可以幫我療傷嗎？',
      mana: '你這裡有補魔力的東西嗎？',
      who: '冒昧問一下，你是誰？',
      rumor: '最近有聽到什麼消息嗎？',
      ready: '你覺得我可以學更多了嗎？',
      brew: '可以幫我熬點什麼嗎？',
      play: '算我一個。'
    },
    sunfordSmith: {
      forge: {
        '1': '爐子熱著。當心手指。'
      },
      learnSmith: {
        '2': '金屬最亮的時候敲。敲偏了就是廢鐵。去吧。',
        '1': '打鐵？哼。鎚子要這樣握，別像握棍子。'
      },
      ore: { '1': '礦石，嗯？給我看看。按塊付錢，分量公道。' },
      sellBack: { '1': '分量公道，錢也公道。再找到就拿來。' },
      forgeBack: {
        '1': '不壞。也不算好。繼續練。'
      },
      hello: {
        '1': '以前沒見過你。清掉那條路的就是你？',
        '2': '布拉姆，這座爐子歸我管。要用刀劍，來找我。'
      },
      kingDead: {
        '1': '聽說哥布林王死了。我可不會想他。'
      },
      kingPact: {
        '1': '哥布林現在都在廣場上做生意了。真沒想到還能看到這一天。'
      },
      kingRansom: {
        '1': '你讓哥布林王留著王冠。他還會回來的，你知道吧。'
      },
      ending: {
        '1': '全國都在談論你。不過，你還要磨刀石嗎？'
      },
      again: {
        '1': '又來了。要點什麼？'
      },
      trade: {
        '1': '實在的鋼，公道的價。看看吧。'
      },
      who: {
        '1': '布拉姆。守著這個鐵砧，差不多三十年了。',
        '2': '馬蹄鐵、犁頭，偶爾打把劍。最近幾乎全是劍。'
      },
      gear: {
        '1': '打算挨揍就帶面盾。大多數人都得挨。',
        '2': '重鋼得有力氣用。先練力量。',
        say: '出去的話，我該帶點什麼？'
      },
      rumor: {
        plains: {
          '1': '平原路上有強盜。換作我，就從那裡開始。'
        },
        hollows: {
          '1': '哥布林來自平原那邊的洞窟。他們的王就在底下。'
        },
        woods: {
          '1': '平原往東是低語森林。聽說那些樹會動。'
        },
        siege: {
          '1': '奧克赫文那邊有煙。一支軍隊在郊外紮營了。'
        },
        north: {
          '1': '艾恩霍德的鋼又順著路運下來了。老實說，比我打的好。'
        }
      },
      shopBack: {
        '1': '好好愛惜，它就會護著你。'
      },
      bye: {
        '1': '路上小心。'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': '哎呀，你好！要買還是隨便看看？都可以喔。',
        '2': '我是蒂莉。戒指、護符，各地來的小東西，我都有。'
      },
      rival: {
        '1': '你看過那個哥布林的攤子嗎？他的價錢比我還低。太不公平了。'
      },
      again: {
        '1': '你終於來了！我留了幾樣東西，你應該會喜歡。'
      },
      trade: {
        '1': '隨便看。這件很靈，大概吧。'
      },
      who: {
        '1': '我走遍各條路，收人家想丟掉的東西。',
        '2': '有時候也會撿到好東西。強盜逃跑的時候，掉得可多了。'
      },
      trinkets: {
        '1': '可以戴兩件，每隻手一件。在外面，點點滴滴都有用。',
        say: '飾品到底有什麼用？'
      },
      stolen: {
        '1': '啊。你還真會問話。',
        '2': '這枚戒指給你，我們別聊我是在哪裡找到的。',
        say: '這些東西到底是哪裡來的？'
      },
      rumor: {
        arenaShut: {
          '1': '這裡往南有座老競技場。哥布林襲擊期間，關得緊緊的。'
        },
        arenaOpen: {
          '1': '競技場又開了。聽說要打八輪。大家都在下注。'
        },
        east: {
          '1': '奧克赫文對閃亮的東西出價可高了。就在東邊，穿過森林。'
        }
      },
      shopBack: {
        '1': '等錢包鼓了再來喔！'
      },
      bye: {
        '1': '一路平安。在外面把錢看緊一點。'
      }
    },
    trainerAegis: {
      hello: {
        '1': '站直。你面前的是鐵之騎士團的騎士。',
        '2': '奧德里克爵士。我教人擋在別人與傷害之間。'
      },
      saved: {
        '1': '奧克赫文還在，聽說你當時就在城牆上。幹得好。'
      },
      fallen: {
        '1': '你打開了奧克赫文的城門。我不會假裝忘了。你想要什麼？'
      },
      dragon: {
        '1': '你殺了山巔那條龍？真想親眼看看。'
      },
      friend: {
        '1': '騎士團對你評價很高。對朋友，我的課收費比較低。'
      },
      foe: {
        '1': '騎士團稱你為敵人。我還是會教你。這是我的決定，不是他們的。'
      },
      again: {
        '1': '又來練習了？'
      },
      train: {
        '1': '好。看仔細，我只示範一次。'
      },
      class: {
        '1': '我們替別人擋下本來落在他們身上的攻擊。道理簡單，做起來難。',
        '2': '舉盾要力量，撐得住要耐力。',
        say: '神盾騎士到底是做什麼的？'
      },
      ready: {
        strong: {
          '1': '我會的大部分你都學得動了。繼續練耐力。'
        },
        able: {
          '1': '你可以學下一課了。別驕傲。'
        },
        weak: {
          '1': '還不行。你會比盾先累倒。再練練力量和耐力。'
        }
      },
      order: {
        '1': '我們守護道路，維持法紀。有人說我們太嚴厲。',
        '2': '站在我們這邊，我們的甲匠和師傅都會記住你。',
        say: '跟我說說鐵之騎士團。'
      },
      trainBack: {
        '1': '練到膩為止。然後繼續練。'
      },
      bye: {
        '1': '小心點。'
      }
    },
    trainerPyro: {
      hello: {
        '1': '咦，來學徒了？太好了。不過，你最好站遠一點。',
        '2': '我是安珀·雷恩，教火焰術。大多數時候，它都聽我的。'
      },
      core: {
        '1': '你把核心交給議會了！真等不及想看看我們能從裡面學到什麼。'
      },
      friend: {
        '1': '議會對你評價很高。順帶一提，這代表有折扣。'
      },
      foe: {
        '1': '議會對你不太高興。不過我還是會教你，悄悄地。'
      },
      again: {
        '1': '你回來啦！準備好點燃些什麼了嗎？'
      },
      train: {
        '1': '好了。看我的手，還有，把你的袖子離我遠一點。'
      },
      class: {
        '1': '主要是點火。然後讓火照你的意思蔓延。',
        '2': '全靠智力。頭腦越敏銳，火焰越熾熱。',
        say: '火焰術士到底是做什麼的？'
      },
      ready: {
        strong: {
          '1': '說真的？你都能教別人了。想學什麼儘管拿。'
        },
        able: {
          '1': '你可以學下一個法術了。來，我教你。'
        },
        weak: {
          '1': '恐怕還不行。智力不夠，火就會失控。'
        }
      },
      circle: {
        '1': '學者們。我們研究世界是由什麼構成的。有些東西會爆炸。',
        say: '乙太議會是什麼人？'
      },
      trainBack: {
        '1': '去練習吧。找個不會著火的地方，拜託。'
      },
      bye: {
        '1': '照顧好自己！'
      }
    },
    elderMara: {
      hello: {
        '1': '原來你就是從那條路來的人。過來，讓我好好看看你。',
        '2': '我是瑪拉。我照看這個鎮子……哎呀，有四十年了。'
      },
      slain: {
        '1': '洞窟安靜了。你做的事不容易，可我們能睡個安穩覺，全靠它。'
      },
      pact: {
        '1': '哥布林在我的廣場上賣東西。是你說服他們的，對吧？'
      },
      ransom: {
        '1': '你收了他的金子，卻讓他留著王冠。我不會假裝自己不失望。'
      },
      saved: {
        '1': '奧克赫文傳來消息，城門守住了。你在那裡，我很高興。'
      },
      fallen: {
        '1': '聽說奧克赫文燒掉了。我不想聽是怎麼回事。今天不想。'
      },
      ending: {
        '1': '聽說是你決定了恐懼要塞的命運。從我們這條小路，走到了那裡。'
      },
      again: {
        '1': '坐一會兒吧。路又不會跑掉。'
      },
      reward: {
        '1': '民兵守不住的那條路，是你守住的。鎮上湊了一點心意。',
        '2': '不多。是我們拿得出來的。',
        say: '聽說你想見我？'
      },
      quest: {
        '1': '襲擊來自哥布林洞窟。他們替自己加冕了一個王。',
        '2': '你想要我殺了他？',
        '3': '我只想讓襲擊停下來。怎麼停……那得你到了底下自己決定。',
        '4': '洞窟就在平原那邊。一定要小心。',
        say: '桑佛德遇上什麼麻煩了？'
      },
      king: {
        say: '關於哥布林王……',
        slay: {
          '1': '他不在了，商隊又能走了。我就不問你是什麼感覺了。'
        },
        pact: {
          '1': '一份貿易協定。我母親要是聽了會昏過去。不過，做買賣總比辦喪事好。'
        },
        ransom: {
          '1': '金子很快就花完，怨恨可不會。襲擊再來時，記住這句話。'
        }
      },
      town: {
        '1': '大多是農夫。一個鐵匠，一個治療師，還有兩位肯遷就我們的老師。',
        '2': '旅途之間就在這裡歇著。家，不就是為了這個嘛。',
        say: '跟我說說桑佛德。'
      },
      next: {
        say: '我接下來該去哪？',
        plains: {
          '1': '先走平原那條路。沒有商隊，我們就沒飯吃。'
        },
        hollows: {
          '1': '哥布林洞窟。襲擊不停，別的地方都不安全。'
        },
        woods: {
          '1': '往東，穿過低語森林。那是通往奧克赫文的路。'
        },
        oakhaven: {
          '1': '奧克赫文被圍了。郊外要是失守，鎮子也保不住。'
        },
        north: {
          '1': '我想是往北。灰燼峭壁，再過去是艾恩霍德。只會越來越難。'
        }
      },
      bye: {
        '1': '完完整整地回來。我只求這個。'
      },
      map: {
        '1': '這是魯克隊長的地圖！他在被哥布林抓住之前，把它撕碎，把碎片藏了起來。',
        '2': "找到六塊碎片，X就會指路：就在灰燼峭壁的某處。在那裡挖，就有金子。",
        say: '我找到了一塊舊地圖的碎片。'
      }
    },
    sunfordHealer: {
      hello: {
        '1': '別動，一下就好。不，你沒事。習慣了，抱歉。',
        '2': '我是露恩修女。路上弄壞的東西，我都能修補。'
      },
      again: {
        '1': '還好好的？那就好。反正先坐下。'
      },
      heal: {
        '1': '坐下歇一會兒。你走之前，我把藥瓶都裝滿。'
      },
      mana: {
        '1': '這瓶滿苦的。法術用完的時候再喝。'
      },
      brew: {
        '1': '讓我看看你的草藥。我來調一點比我的魔力補藥好喝的東西。'
      },
      potions: {
        '1': '每場戰鬥你都帶幾瓶藥。要在需要之前喝，別等到之後。',
        '2': '想多帶一點的話，我可以賣你一條更大的腰帶。',
        say: '藥水要怎麼用？'
      },
      rumor: {
        goblins: {
          '1': '哥布林在投石上塗了東西。要是覺得噁心，就回來找我。'
        },
        spiders: {
          '1': '這週我治了三個被森林裡的蜘蛛咬傷的人。那邊小心腳下。'
        },
        burns: {
          '1': '一直有士兵從北邊下來，帶著燒傷。聽說是灰燼峭壁那邊。'
        }
      },
      healBack: {
        '1': '腰帶裝滿，頭低一點。'
      },
      brewBack: {
        '1': '小心，很燙。別一次全喝光。'
      },
      bye: {
        '1': '在外面照顧好自己。'
      }
    },
    goblinTrader: {
      hello: {
        '1': '你就是締結盟約的人。我們的王說，歡迎你來這裡。',
        '2': '我是格里克。我賣哥布林做的東西。做工好，價錢公道。'
      },
      again: {
        '1': '朋友。很高興再見到你。'
      },
      trade: {
        '1': '請看。這些是我家人做的。'
      },
      king: {
        '1': '他現在吃得好了。不再有襲擊。我的族人也沒那麼餓了。',
        '2': '他常常提起你，帶著敬意。',
        say: '你們的大王還好嗎？'
      },
      town: {
        '1': '人們還是會盯著我看。但是麵包師給我派吃。我喜歡那個派。',
        say: '你喜歡桑佛德嗎？'
      },
      rumor: {
        crags: {
          '1': '我的表兄弟們在北邊的黑岩裡挖礦。他們說，那裡現在有火在行走。'
        },
        deep: {
          '1': '有什麼東西正在深處甦醒。哥布林能從地面感覺到。'
        }
      },
      shopBack: {
        '1': '謝謝。歡迎再來。'
      },
      bye: {
        '1': '一路平安，朋友。'
      }
    },
    captainHale: {
      hello: {
        '1': '又多了一把劍。很好。多一把是一把。',
        '2': '海爾隊長。奧克赫文守衛隊剩下的人，歸我指揮。'
      },
      saved: {
        '1': '城門守住了。三百年了，又多撐了一年。這份情我欠你的。'
      },
      ending: {
        '1': '聽說是你決定了恐懼要塞的歸屬。跟那比起來，我這些城牆都顯得小了。'
      },
      again: {
        '1': '城牆還立著。至少今天是。'
      },
      after: {
        '1': '見到你真好。奧克赫文沒有忘記。'
      },
      quest: {
        '1': '很糟。一個叫克拉格的軍閥把我們圍住了，而且他可不白打仗。',
        '2': '誰在給他出錢？',
        '3': '灰燼商會。他們想要一座自己的城，而我們的有城牆。',
        '4': '去端了他在奧克赫文郊外的營地。一切就在那裡了結，不管怎麼了結。',
        say: '情況有多糟？'
      },
      siege: {
        '1': '他們是不是答應給你鎮子的三分之一？給我的是四分之一。',
        '2': '商會現在會找上你。在路上小心背後。',
        say: '關於圍城……'
      },
      town: {
        '1': '一座貿易鎮。平原和山區之間來往的貨物，都得在這裡繳過路費。',
        '2': '所以人人都想要它。也所以我不會放手。',
        say: '跟我說說奧克赫文。'
      },
      order: {
        '1': '我對奧克赫文負責。騎士團和我大多數時候意見一致。不是每天。',
        say: '你聽命於鐵之騎士團嗎？'
      },
      rumor: {
        crags: {
          '1': '森林以北，地面又黑又在燃燒。那是灰燼峭壁。多半是邪教徒。'
        },
        mines: {
          '1': '艾恩霍德不再送鋼來了。他們的礦坑出了問題。'
        },
        north: {
          '1': '極北那邊安靜下來了。就我的經驗，這從來不是好事。'
        }
      },
      bye: {
        '1': '劍別離手。'
      }
    },
    oakArmorer: {
      forge: {
        '1': '鐵砧歸你了。打點結實耐用的東西。'
      },
      learnSmith: {
        '2': '盯著光芒。敲它的中心，敲三次，金屬就會記住。',
        '1': '想學這門手藝？好。奧克赫文需要每一把鎚子。'
      },
      ore: { '1': '原礦！軍械庫從來不夠用。能勻多少就賣多少。' },
      sellBack: { '1': '每一塊都會砌進城牆。謝謝你。' },
      forgeBack: {
        '1': '好鋼。城牆謝謝你。'
      },
      hello: {
        '1': '要是想買頭盔，抱歉。都在城牆上了。',
        '2': '奧多。我做護甲。最近沒怎麼睡。'
      },
      again: {
        '1': '還在這裡。還是什麼都缺。'
      },
      trade: {
        '1': '我一半的存貨都送上城牆了。剩下的你看著拿，合身就行。'
      },
      who: {
        '1': '我替這個鎮子做了二十年護甲。從沒見過全部同時穿在身上。'
      },
      armor: {
        '1': '站著不動硬扛，穿板甲。到處跑動，穿皮甲。身手快，穿長袍。',
        say: '我該穿哪種護甲？'
      },
      rumor: {
        backRoom: {
          '1': '圍城要是解除了，我就開後屋。好的板甲都在裡面。'
        }
      },
      shopBack: {
        '1': '撐得住的。到現在不是一直撐著嗎。'
      },
      bye: {
        '1': '在外面把頭壓低。'
      }
    },
    oakMasterArmorer: {
      forge: {
        '1': '爐火已經封好等著了。動手吧。'
      },
      learnSmith: {
        '2': '三擊，每一擊都落在光芒中心。祕訣就這麼多。',
        '1': '自從圍城之後，誰來問我都教。來，站這兒。'
      },
      ore: { '1': '還有礦石給城牆？你能勻出的每一塊我都買。' },
      sellBack: { '1': '願你得福。城牆又能多幾塊甲板了。' },
      forgeBack: {
        '1': '每一擊都讓你更進一步。隨時再來。'
      },
      hello: {
        '1': '你來啦！快進來。後屋開著，專門為你開的。',
        '2': '現在大家都叫我奧多大師了。稍微太平一點，生意就是不一樣。'
      },
      ending: {
        '1': '從我們的城門到恐懼要塞。我逢人就說，那身護甲是我替你量身做的。'
      },
      again: {
        '1': '見到你真好。今天要點什麼？'
      },
      trade: {
        '1': '好的板甲拿出來了。你絕對有資格看一看。'
      },
      town: {
        '1': '熱鬧，吵嚷，滿街商人都在抱怨過路費。',
        '2': '太棒了。我已經好幾個星期沒安靜過一個鐘頭了。',
        say: '鎮子現在怎麼樣？'
      },
      rumor: {
        mines: {
          '1': '我的鋼來自艾恩霍德，他們沒消息了。該有人去看看他們的礦坑。'
        },
        tundra: {
          '1': '我打過最好的礦石出自凍原。發現它的人再也沒回來過。'
        }
      },
      shopBack: {
        '1': '要是穿起來不合適，拿回來，我幫你改。'
      },
      bye: {
        '1': '隨時歡迎你來。'
      }
    },
    oakWeapons: {
      hello: {
        '1': '看還是買？都行。就是別摸刀刃。',
        '2': '賽娜。我賣刀劍。你拿它們做什麼，是你的事。'
      },
      saved: {
        '1': '圍城解除了啊。對鎮子是好事。不過對我的生意來說，打仗還比較好。'
      },
      again: {
        '1': '回來找更鋒利的？'
      },
      trade: {
        '1': '鋒利，平衡，價格公道。慢慢看。'
      },
      who: {
        '1': '三場戰爭，我兩邊都賣過。我還在這裡。他們大多數可不在了。'
      },
      rumor: {
        krag: {
          '1': '克拉格的人拿著好鋼。商會的錢買的。有機會的話，值得撿一把。'
        },
        which: {
          '1': '快劍看敏捷。弓和槍看技巧。得清楚自己屬於哪一種。'
        }
      },
      shopBack: {
        '1': '記得上油。生鏽毀掉好刃，比骨頭還快。'
      },
      bye: {
        '1': '別欠著我的錢就死了。'
      }
    },
    trainerShadow: {
      hello: {
        '1': '我走到你背後，你都沒聽見。大多數人都這樣。',
        '2': '他們叫我「低語」。我教人怎麼不被看見。'
      },
      fallen: {
        '1': '鎮上安靜多了。守衛少了。對我們有些人來說，活兒更好幹了。'
      },
      friend: {
        '1': '商會把你當朋友。朋友付得少。記住這點。'
      },
      foe: {
        '1': '商會想要你的命。我拿錢是來教人的，不是來殺人的。所以，上課。'
      },
      again: {
        '1': '你還是太吵。我們來改。'
      },
      train: {
        '1': '那就安靜點。看我的腳，別看我的手。'
      },
      class: {
        '1': '就是已經站在你背後的那個人。進去，一刀，消失。',
        '2': '敏捷最要緊。想讓那一刀見效，還得有技巧。',
        say: '影刃是什麼？'
      },
      ready: {
        strong: {
          '1': '你現在動作不錯。剩下的都拿去吧。放煙幕，帶點技巧來。'
        },
        able: {
          '1': '你的手夠快了。下一步。'
        },
        weak: {
          '1': '還不行。你腳步太重。練練敏捷。'
        }
      },
      syndicate: {
        '1': '發現法律是有價格的人。我不評判。我只收錢。',
        say: '灰燼商會是什麼人？'
      },
      trainBack: {
        '1': '現在去沒人看得見的地方練。'
      },
      bye: {
        '1': '你從沒見過我。'
      }
    },
    trainerSovereign: {
      hello: {
        '1': '你可以走近些。到那裡就好，夠近了。',
        '2': '卡斯特蘭勛爵，出自奧克赫文最古老的家族。我教授統御之道。'
      },
      saved: {
        '1': '我的鎮子還在，我家族的名聲也在。我謝謝你。是真心的。'
      },
      friend: {
        '1': '騎士團的朋友。我會降低費用。請別到處宣揚。'
      },
      foe: {
        '1': '騎士團的名單上有你的名字。我還是會教你。錢就是錢。'
      },
      again: {
        '1': '啊，又是你。我們繼續？'
      },
      train: {
        '1': '很好。看看命令是怎麼下達的，又是怎麼被執行的。'
      },
      class: {
        '1': '不獨自作戰的人。你一聲召喚，衛兵就替你作戰。',
        '2': '靠魅力。沒有人會追隨一個聽不見聲音的領袖。',
        say: '大君主是什麼？'
      },
      ready: {
        strong: {
          '1': '你現在有真正的氣場了。把我剩下的課都學了吧。'
        },
        able: {
          '1': '你的聲音傳得開了。可以學下一課了。'
        },
        weak: {
          '1': '恐怕現在還沒有人會追隨你。練練魅力。'
        }
      },
      family: {
        '1': '海爾隊長腳下的城牆是我們家族建的。他忘了。我來提醒他。',
        say: '跟我說說你的家族。'
      },
      trainBack: {
        '1': '去吧。試著帶領一個人。'
      },
      bye: {
        '1': '再會。'
      }
    },
    oakHealer: {
      hello: {
        '1': '下一位！哦，你是走著來的。這可真難得。',
        '2': '芬恩修士。城牆上四十個傷員，卻只有我一個人。'
      },
      saved: {
        '1': '三天沒有新傷員了。我都不知道該做什麼好了。'
      },
      again: {
        '1': '你又來了，還是自己走來的。很好。'
      },
      heal: {
        '1': '躺這裡，乾淨的那張床。好了。藥瓶都裝滿了，走吧。'
      },
      mana: {
        '1': '魔力藥劑。嘗起來像舊硬幣，但有效。'
      },
      potions: {
        '1': '腰帶更長的話，可以。那個我有賣。裝滿藥瓶是免費的。',
        say: '我能多帶些藥水嗎？'
      },
      rumor: {
        archers: {
          '1': '克拉格的弓箭手瞄得低。一直移動，他們大多射不中。'
        },
        north: {
          '1': '我看到的是燒傷、凍傷，還有一個發誓被雕像咬了的人。'
        }
      },
      healBack: {
        '1': '走吧。下次來聊聊天，別來縫針了。'
      },
      bye: {
        '1': '保重。還有，吃點東西。'
      }
    },
    blackMarket: {
      hello: {
        '1': '這裡不報名字。不過誰開的城門，我知道。人人都知道。',
        '2': '叫我銷贓人就行。這裡的東西都是從某處來的。'
      },
      foe: {
        '1': '商會現在不太喜歡你。不過，你的金幣我們歡迎。'
      },
      again: {
        '1': '又來了。沒有人跟著你吧？'
      },
      trade: {
        '1': '兩邊都不問來路。商會抽成，你拿貨。'
      },
      who: {
        '1': '那場火之前我賣蠟燭。老實生意。可不賺錢。'
      },
      armor: {
        '1': '甲匠都走了，朋友。原因你比我清楚。',
        say: '有護甲賣嗎？'
      },
      rumor: {
        citadel: {
          '1': '去年極北冒出一座要塞。沒有人建過它。'
        },
        crystals: {
          '1': '有人在收購所有能找到的虛空水晶。不是我們。這讓我不安。'
        }
      },
      shopBack: {
        '1': '你從沒來過這裡。'
      },
      bye: {
        '1': '腳下小心。瓦礫會動。'
      }
    },
    trainerBlood: {
      hello: {
        '1': '有客人來了。請別碰那些罐子。',
        '2': '桑格雷爾醫生。奧克赫文的新主人不問我教什麼。很清靜。'
      },
      found: {
        '1': '你找到我了。在這種地方，沒幾個人會來找醫生。',
        '2': '桑格雷爾醫生。鎮子會燒掉我這樣的人，所以我在沒有人的地方工作。'
      },
      friend: {
        '1': '商會替你說話。對他們的朋友我收費低一些。我的標準不變。'
      },
      foe: {
        '1': '商會願意花高價買你的血。我更希望你把它花在這裡。'
      },
      again: {
        '1': '你臉色發白。很好。適合這一行。'
      },
      train: {
        '1': '把袖子捲起來。會痛。這正是重點。'
      },
      class: {
        '1': '你用自己的健康換取力量，再從敵人身上奪回來。',
        '2': '耐力是你能花的本錢。智力決定你花得多聰明。',
        say: '鮮血鍊金師是什麼？'
      },
      ready: {
        strong: {
          '1': '出色的體質。你幾乎可以全部學會。'
        },
        able: {
          '1': '你已經結實到可以學下一課了。'
        },
        weak: {
          '1': '第一刀你就會昏過去。請先把耐力練起來。'
        }
      },
      jars: {
        '1': '標本。大多是自願捐贈的。',
        say: '罐子裡是什麼？'
      },
      trainBack: {
        '1': '請記好筆記。我想聽聽結果如何。'
      },
      bye: {
        '1': '保持健康。我是認真的。'
      }
    },
    syndicateBoss: {
      hello: {
        '1': '原來你就是開了城門的人。坐吧。你配得上一張椅子。',
        '2': '他們叫我灰燼夫人。奧克赫文現在歸我們了。你也有一份功勞。'
      },
      throneOurs: {
        '1': '恐懼要塞落在我們手裡。你值每一枚金幣。'
      },
      throneLost: {
        '1': '你把王座給了別人。這件事我們得談談。不是今天。'
      },
      foe: {
        '1': '你一直在跟我們作對。還是坐吧。我喜歡知道自己在跟誰打交道。'
      },
      again: {
        '1': '又來了。商會能為你做點什麼？'
      },
      cut: {
        '1': '你會拿到的。眼下是一片廢墟的份額。這是這一季的。',
        '2': '會漲的。廢墟要是只有你一個市場，賺得可多了。',
        say: '你答應過給我奧克赫文的一份。'
      },
      syndicate: {
        '1': '人人都想要的東西。我們只是不裝模作樣。',
        '2': '保持友好，「低語」和醫生收你的費用也會低一些。',
        say: '商會到底想要什麼？'
      },
      order: {
        '1': '當然。你燒了他們一座鎮子。多帶些藥水。',
        say: '鐵之騎士團在追我。'
      },
      rumor: {
        core: {
          '1': '矮人在礦坑裡找到了東西。一顆核心。帶給我們，開個價。'
        },
        sold: {
          '1': '核心平安到了。你想不到它對一把鎖能做什麼。'
        },
        north: {
          '1': '值錢的東西都往北去了。我們也是。'
        }
      },
      bye: {
        '1': '別生分。我們對陌生人可是盯得很緊的。'
      }
    },
    forgemaster: {
      hello: {
        '1': '你是從礦坑裡上來的。我聞得到你身上的粉塵味。',
        '2': '多恩，艾恩霍德的鍛造大師。我有個山那麼大的麻煩。'
      },
      destroyed: {
        '1': '光滅了，魔像成了廢鐵。昨晚我的礦工們唱歌了。一年來頭一回。'
      },
      studied: {
        '1': '爐裡是藍色的火，廳裡是穿長袍的學者。至少活兒幹得不錯。'
      },
      sold: {
        '1': '你把它賣了。魔像還在走，礦坑還是墳墓。別煩我。'
      },
      ending: {
        '1': '這麼說王座定了。好。也許現在我們能回去挖礦了。'
      },
      again: {
        '1': '什麼事？爐子可不等人。'
      },
      quest: {
        '1': '我們挖鐵，卻挖出了一顆心臟。乙太核心。你能感覺到它在跳動。',
        '2': '那魔像呢？',
        '3': '它們隨著它的節奏行動。三方勢力寫信來要它。我一個都不信。',
        '4': '你會先到，就在艾恩霍德礦坑的最底層。接下來怎麼辦，由你決定。',
        say: '礦坑下面出什麼事了？'
      },
      core: {
        say: '關於核心……',
        destroy: {
          '1': '你為了救我的族人，毀掉了一件奇蹟。騎士團派來了甲匠。我送了麥酒。'
        },
        study: {
          '1': '議會的人古怪，但他們的槍打得準。也算公平。'
        },
        sell: {
          '1': '你是為了金幣才這麼做的。但願它能讓你暖和。'
        }
      },
      town: {
        '1': '礦坑開工的時候，這裡出全國最好的鋼。',
        '2': '石腳教大地，皮姆教機械。兩個都能把你耳朵說爛。',
        say: '跟我說說艾恩霍德。'
      },
      rumor: {
        tundra: {
          '1': '峭壁以東，大地變成一片白。霜噬凍原。有巨人，還有更糟的。'
        },
        citadel: {
          '1': '我的斥候在北邊看到一座要塞，去年還不在那裡。我不喜歡這個。'
        },
        fortress: {
          '1': '一切都在恐懼要塞了結。往北的每條路都通向那裡。'
        }
      },
      bye: {
        '1': '一路順風。'
      }
    },
    ironWeapons: {
      forge: {
        '1': '小心火星，別碰我那把好鎚子。'
      },
      learnSmith: {
        '2': '光芒告訴你何時敲。手臂告訴你多用力。三擊。',
        '1': '地面上的人來打鐵？好吧，誰都得有個開頭。'
      },
      ore: { '1': '好金屬，實在貨。擺出來，按塊付錢。' },
      sellBack: { '1': '公平交易。艾恩霍德從不虧待好金屬。' },
      forgeBack: {
        '1': '換個矮人會做得更好。不過也好不了多少。'
      },
      hello: {
        '1': '小心展示品。兩邊的刃都很鋒利。',
        '2': '「鎚手」希爾妲。這裡每一件都出自矮人之手。'
      },
      dragon: {
        '1': '你殺了那條龍？希望是用我的刀劍殺的。'
      },
      again: {
        '1': '回來買真傢伙了？'
      },
      trade: {
        '1': '矮人鍛造。要是哪件斷了，我得知道是怎麼斷的。'
      },
      who: {
        '1': '我母親為國王鍛造。我為任何走進門的人鍛造。'
      },
      rumor: {
        golems: {
          '1': '下面那些魔像是用我們自己的鐵做的。老實說，心裡難受。'
        },
        arm: {
          '1': '好劍幹了一半的活。剩下的得靠你的力量。'
        }
      },
      shopBack: {
        '1': '拿回來的時候刃鈍了，我就知道你用得好。'
      },
      bye: {
        '1': '狠狠地砍。'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': '小心，那個上了膛。其實大多數都是。',
        '2': '工匠沃斯。議會派我來研究核心。我們學到了好多。'
      },
      again: {
        '1': '啊，太好了。你上次來之後，我改了幾處。'
      },
      trade: {
        '1': '這裡的一切都來自對核心的研究。只是別對著我。'
      },
      core: {
        '1': '那種金屬有一點思考能力。我盡量不去想這個。',
        say: '核心教了你什麼？'
      },
      rumor: {
        heat: {
          '1': '槍靠技巧運轉，而且會發熱。燒到手之前，先去問問皮姆熱量的事。'
        }
      },
      shopBack: {
        '1': '用起來怎麼樣，告訴我。我在做記錄。'
      },
      bye: {
        '1': '小心後座力。'
      }
    },
    ironArmor: {
      forge: {
        '1': '你準備好了，熔爐就準備好了。'
      },
      learnSmith: {
        '2': '加熱，敲擊，翻面。三擊，正落在光芒裡。然後讓它冷卻。',
        '1': '板甲是耐心活。我教你些基礎。'
      },
      ore: { '1': '讓我秤一秤。選好要賣的，錢我來數。' },
      sellBack: { '1': '秤好了，付清了。好。' },
      forgeBack: {
        '1': '先放涼再穿。'
      },
      hello: {
        '1': '加倫。甲在架子上，戒指在盤子裡。'
      },
      again: {
        '1': '回來了。要什麼？'
      },
      trade: {
        '1': '這副板甲能擋住巨人的棒子。看看。'
      },
      quiet: {
        '1': '沒什麼值得說的。',
        say: '你話不多，對吧？'
      },
      rumor: {
        giants: {
          '1': '凍原有巨人。棒子像樹幹。我會選重板甲。'
        },
        demons: {
          '1': '北邊有惡魔。火焰和利爪。我會選重板甲。'
        }
      },
      shopBack: {
        '1': '好選擇。'
      },
      bye: {
        '1': '保重。'
      }
    },
    ironOrderArmor: {
      forge: {
        '1': '以榮譽使用騎士團的熔爐。'
      },
      learnSmith: {
        '2': '鐵砧前要守紀律，如同在戰場上。三擊，緊隨光芒。',
        '1': '騎士團為朋友提供武裝。我來教你。'
      },
      ore: { '1': '騎士團為戰爭收購礦石。能勻多少就賣多少。' },
      sellBack: { '1': '你的報酬已記錄。騎士團感謝你。' },
      forgeBack: {
        '1': '鍛得好。穿上它好好效力。'
      },
      hello: {
        '1': '毀掉核心的就是你。騎士團記得這件事。',
        '2': '我是騎士團駐此地的軍需官。我們的軍械庫向你敞開。'
      },
      throneOurs: {
        '1': '多虧了你，騎士團掌控了恐懼要塞。稍息。這是你應得的。'
      },
      foe: {
        '1': '騎士團把你列在名單上。但我接到的命令是照樣賣給你。我會照辦。'
      },
      again: {
        '1': '需要什麼？'
      },
      trade: {
        '1': '需要什麼就拿。騎士團照顧自己人。'
      },
      order: {
        '1': '暫時沒有。這不常有。好好享受。',
        say: '騎士團想要我做什麼？'
      },
      rumor: {
        throne: {
          '1': '騎士團會想要恐懼要塞的王座。它會記得誰幫過忙。'
        }
      },
      shopBack: {
        '1': '好好愛惜。在裡面流過血之前，它都是騎士團的財產。'
      },
      bye: {
        '1': '繼續執行任務。'
      }
    },
    trainerGeo: {
      hello: {
        '1': '慢點。山哪裡也不會去。',
        '2': '他們叫我石腳老爹。我傾聽大地。有時它會回答。'
      },
      core: {
        '1': '自從你下去過，山的感覺不一樣了。更平靜了，或者說更空了。'
      },
      dragon: {
        '1': '昨天有條龍飛過山頂，沒來招惹我們。聽說是你的功勞。'
      },
      again: {
        '1': '來了。我就知道你會回來。'
      },
      train: {
        '1': '把腳站穩。感覺到了嗎？沒有？那就從這裡開始。'
      },
      class: {
        '1': '我們築起牆，喚出尖刺，必要時把大地震裂。',
        '2': '要力量來移動石頭，要智力來知道它想去哪裡。',
        say: '地術師是做什麼的？'
      },
      ready: {
        strong: {
          '1': '石頭現在認得你了。等你準備好了，再學剩下的。'
        },
        able: {
          '1': '你站得夠穩了，可以學下一課。'
        },
        weak: {
          '1': '還不行。石頭不會為你動。先練力量。'
        }
      },
      factions: {
        '1': '哪個都不屬於。騎士團、公會，來了又走。山一直都在。',
        say: '你效力於哪個陣營？'
      },
      trainBack: {
        '1': '慢慢來。大地有耐心。'
      },
      bye: {
        '1': '輕輕地走。'
      }
    },
    trainerAether: {
      hello: {
        '1': '啊，等等，別碰那個！那個也別碰。站在地毯上，地毯是安全的。',
        '2': '齒輪匠皮姆。我造槍、砲塔，還有一大堆熱量計。'
      },
      core: {
        '1': '你把核心交給議會了！從那之後我幾乎沒睡過。是好的那種。'
      },
      oracle: {
        '1': '議會為神諭者的事生氣了。我只是造東西的。我不想捲進去。'
      },
      friend: {
        '1': '你是議會的朋友，所以課便宜一點。手續我辦好了。'
      },
      foe: {
        '1': '議會說我不該教你。我還是要教。別告訴他們。'
      },
      again: {
        '1': '太好了，你的手指還齊全。'
      },
      train: {
        '1': '好。先講安全，再上吵的那部分。'
      },
      class: {
        '1': '槍、砲塔，加一個熱量計。開火、建造，在卡死之前散熱。',
        '2': '主要靠技巧。大型機器再加一點智力。',
        say: '乙太技師是什麼？'
      },
      ready: {
        strong: {
          '1': '你現在擺弄砲塔很在行了。大型機器也拿去學吧。'
        },
        able: {
          '1': '手很穩。你可以學下一個了。'
        },
        weak: {
          '1': '你的準頭還有點抖。往技巧上加點吧。'
        }
      },
      heat: {
        '1': '所有東西會卡死幾秒鐘。早散熱，常散熱。相信我。',
        say: '過熱了會怎樣？'
      },
      trainBack: {
        '1': '還有，記得在熱量把你炸飛之前先散熱。'
      },
      bye: {
        '1': '在外面小心點！'
      }
    },
    ironHealer: {
      hello: {
        '1': '請在門口把靴子脫了。我剛掃過地。',
        '2': '布琳雅嬤嬤。這座山裡大多數斷骨，都是我接的。'
      },
      ending: {
        '1': '你去了恐懼要塞，還回來了。坐下。讓我看看你。'
      },
      again: {
        '1': '還活著。好。坐。'
      },
      heal: {
        '1': '把這個喝了，別做那副表情。你的藥瓶滿了。'
      },
      mana: {
        '1': '給。味道很糟。魔力用完了再喝，別提前喝。'
      },
      potions: {
        '1': '我可以賣你一條更長的腰帶。五個藥瓶，是一個人帶著還能跑的極限了。',
        say: '我能多帶些藥水嗎？'
      },
      rumor: {
        tundra: {
          '1': '凍原會奪走手指和腳趾。一直走動，別在雪裡睡著。'
        },
        temple: {
          '1': '凍原過去有座沉沒的神殿。那裡的娜迦不留俘虜。'
        },
        rift: {
          '1': '那道裂隙裡不管是什麼，我都縫不了。別讓它碰到你。'
        }
      },
      healBack: {
        '1': '走吧。還有，吃點東西，你太瘦了。'
      },
      bye: {
        '1': '完完整整地回來。'
      }
    },
    exiledSovereign: {
      hello: {
        '1': '你。就是你打開了我的城門。',
        '2': '我現在在地窖裡教課，因為我得吃飯。別把這當成原諒。'
      },
      ending: {
        '1': '這麼說王座有了歸屬，奧克赫文卻依然是一片灰燼。希望這值得。'
      },
      again: {
        '1': '你回來了。我的費用沒變。'
      },
      train: {
        '1': '我會教你統御。你配不配，是另一回事。'
      },
      class: {
        '1': '讓別人追隨的人。你一召喚衛兵就來，你一句話他們就戰鬥。',
        '2': '靠魅力。你有。正因如此才難以原諒。',
        say: '大君主是什麼？'
      },
      ready: {
        strong: {
          '1': '你有足夠的氣場應付一切。真希望你當初用得更好。'
        },
        able: {
          '1': '你可以學下一課了。我不會假裝高興。'
        },
        weak: {
          '1': '現在還沒有人會追隨你。練練魅力。'
        }
      },
      oakhaven: {
        '1': '三百年。我的家族蓋了那些城牆。',
        '2': '請別解釋。你說什麼都彌補不了。',
        say: '關於奧克赫文……'
      },
      trainBack: {
        '1': '走吧。去拿別人練手。'
      },
      bye: {
        '1': '請離開吧。'
      }
    },
    trainerChrono: {
      fled: {
        '1': '你殺了她。我多年前就看到會這樣，可還是痛。',
        '2': '我是時辰守護者。我會教你。她告訴過我我會的。'
      },
      hello: {
        '1': '你來了。我等你很久了。或者說，將會等了很久。',
        '2': '我是時辰守護者。我教人稍微扭轉時間。'
      },
      freed: {
        '1': '她自由了。這一次，我也看不出接下來會發生什麼。真好。'
      },
      friend: {
        '1': '議會對你評價很高，所以課便宜一些。他們上週就定了。'
      },
      foe: {
        '1': '議會現在對你很生氣。會過去的。在那之前，我們低調一點。'
      },
      again: {
        '1': '歡迎回來。你來得正是時候。'
      },
      train: {
        '1': '仔細看。然後再看一遍，提前一小會兒。'
      },
      class: {
        '1': '我們讓敵人在時間裡靜止，讓朋友加快，把犯下的錯取消。',
        '2': '要智力才看得見那條線，要技巧才拉得動它。',
        say: '織時者是什麼？'
      },
      ready: {
        strong: {
          '1': '那條線你握得很穩。剩下的隨時拿去吧。'
        },
        able: {
          '1': '你準備好了。你沒問我就知道了。'
        },
        weak: {
          '1': '線一直在滑。多一點智力，再多一點技巧。'
        }
      },
      oracle: {
        say: '跟我說說神諭者。',
        freed: {
          '1': '她看過每一種結局，唯獨沒看到自己的。現在她可以去弄明白了。'
        },
        slain: {
          '1': '她沒有反抗。她早就看見了。請別再問我。'
        },
        waits: {
          '1': '她看得見每一種結局。這是個沉重的負擔。對她好一點。'
        }
      },
      trainBack: {
        '1': '以後你會明白的。通常都是這樣。'
      },
      bye: {
        '1': '後會有期。或者，在那之前。'
      }
    },
    quest: {
      seal: {
        ask: { '1': "上古巨龍死了，裂隙就在你面前敞開著。", '2': "你可以現在就將它永遠封印。巨獸們會再度沉睡。", '3': "或者你可以留下一道縫，讓最勇敢的人去迎戰從中出來的東西。" },
        seal: { say: "封印它。永遠。", '1': "裂隙像傷口癒合般閉合，天空安靜了下來。" },
        ajar: { say: "留一道縫吧。我們會做好準備。", '1': "裂隙留著一道縫，後面有什麼東西在笑。" },
      },
      goblinKing: {
        ask: {
          '1': '住手。求你了。我投降。',
          '2': '我的族人劫掠，是因為他們餓。這是實話。',
          '3': '我們換個辦法，做筆交易吧。你們的族群和我們的。'
        },
        slay: {
          '1': '哥布林王倒下，洞窟空了。',
          '2': '桑佛德睡得更安穩，鐵之騎士團聽到了你的名字。',
          say: '沒有交易。你們的襲擊到此為止。'
        },
        pact: {
          '1': '貿易。好。我以王冠起誓。',
          '2': '哥布林商人在桑佛德的廣場上擺攤，賣那裡的鐵匠做不出來的東西。',
          say: '停止襲擊，改和桑佛德做買賣。發誓。'
        },
        ransom: {
          '1': '全部？……好吧。拿走，然後走。',
          '2': '你帶著哥布林的金子離開。襲擊會再次開始，但商會很滿意。',
          say: '交出你的財寶，王冠就讓你留著。'
        }
      },
      siege: {
        ask: {
          '1': '夠了。你打得不錯，這點我承認。',
          '2': '商會給的錢，比那座鎮子能給的多得多。',
          '3': '今晚替我們打開城門，奧克赫文的三分之一就歸你。'
        },
        defend: {
          '1': '那商會會在每條路上追殺你。記住是我先開的價。',
          '2': '城門守住了。奧克赫文在它後面變得富裕，甲匠們記得你的名字。',
          say: '城門不會開。帶著你的軍隊滾吧。'
        },
        betray: {
          '1': '明智。灰燼夫人會很高興聽到這個。',
          '2': '奧克赫文燃燒。廢墟中，一個黑市開張，一位鍊金師開始祕密授課。',
          '3': '甲匠們走了，鐵之騎士團稱你為叛徒。',
          say: '鎮子的三分之一。好吧。今晚城門會開。'
        }
      },
      core: {
        ask: {
          '1': '巨像成了廢鐵。我從沒想過自己能活著看到這一天。',
          '2': '還有核心。還在嗡嗡響。摸上去是溫的。',
          '3': '你先到了。那麼……它該怎麼處置？'
        },
        destroy: {
          '1': '光芒熄滅，魔像紛紛原地倒下。',
          '2': '為表感謝，鐵之騎士團派出自己的甲匠前往艾恩霍德。',
          say: '退後。我要把它砸了。'
        },
        study: {
          '1': '你懂得夠多，能在不驚醒核心的情況下移動它。',
          '2': '一季之內，艾恩霍德的熔爐就在製造無人見過的乙太裝置。',
          say: '議會應該研究它。我想我能安全地把它帶出去。'
        },
        sell: {
          '1': '金子。為了那個害死我礦工的東西。拿去，走吧。',
          '2': '一大筆錢易了手。核心繼續亮著，礦坑再也不會安寧。',
          say: '商會開的價最高。'
        }
      },
      oracle: {
        ask: {
          '1': '這一刻，我已經見過無數次。',
          '2': '其中一半，你放我自由。另一半，你奪走我守護的東西。',
          '3': '選吧。我想，就這一次，不知道接下來會發生什麼。'
        },
        free: {
          '1': '哦。這個我沒看到。我真的沒看到。',
          '2': '神諭者從水中升起，消失了。她的弟子留下來教課。',
          say: '別動。我來砸開你的鎖鏈。'
        },
        slay: {
          '1': '是的。這是另一半。',
          '2': '她沒有抵抗。時辰守護者的沙漏歸你了。',
          '3': '她最後的弟子逃離了神殿，議會不會原諒你。',
          say: '我是為沙漏來的。'
        }
      },
      dragon: {
        ask: {
          '1': '夠了。你有牙齒，小傢伙。',
          '2': '要塞裡的惡魔鎖住了我的族人。我想看他燃燒。',
          '3': '殺了我，不然就讓我幫你。'
        },
        slay: {
          '1': '巨龍倒下，群山震動。龍的寶藏歸你所有。',
          '2': '鐵之騎士團傳唱屠龍者的事蹟。',
          say: '我不和龍討價還價。'
        },
        pact: {
          '1': '沒幾個敢開這個口。很好。我們一起狩獵。',
          '2': '你進軍恐懼要塞時，會有一條龍在你頭頂飛翔。',
          say: '那就和我一起對抗大惡魔。'
        }
      },
      throne: {
        ask: {
          '1': '這麼說，結束了。我沒想到會是你。',
          '2': '我的王座不會一直空著。誰坐上去，誰就統御要塞和裂隙。',
          '3': '三位使者已經在我門口等著了。選誰接下來進來。'
        },
        order: {
          '1': '騎士團駐守要塞，能封的都封上。',
          '2': '王國會很安全，也會被人指揮著過日子。',
          say: '鐵之騎士團來守著它。'
        },
        syndicate: {
          '1': '商會在天亮前就搬了進來。',
          '2': '從今往後，一切都有價碼，連和平也不例外。',
          say: '灰燼商會應得此位。'
        },
        circle: {
          '1': '議會把要塞變成了裂隙之上的學院。',
          '2': '他們稱之為研究。其他人都屏住呼吸。',
          say: '讓乙太議會擁有它。'
        },
        shatter: {
          '1': '你親手砸碎了王座。從此再沒有人能從這裡統治。',
          '2': '使者們一言不發地離開了。',
          say: '誰也別想得到。我要把它砸了。'
        },
        claim: {
          '1': '王座很冷，但很合身。',
          '2': '三方勢力發現，他們有了共同的敵人。',
          say: '我自己來拿。'
        }
      }
    },
    bark: {
      sphinx: {
        intro: { '1': "回答我，小傢伙，否則就被我的沙子掩埋。" },
        riddle: { '1': "那就出個謎題。照我指示的順序，踩上去。" },
        sand: { '1': "這次是五個。我的沙子可不會等你。" },
        death: { '1': "答得好。沙子歸你了。" },
      },
      leviathan: {
        intro: { '1': "現在你走在我的水裡了。" },
        sink: { '1': "你的小島正在下沉。" },
        grab: { '1': "跟我一起沉入深淵吧！" },
        death: { '1': "潮水退去，再也不會回來。" },
      },
      hydra: {
        intro: { '1': "砍掉一個頭，就會長出兩個！" },
        heads: { '1': "頭更多，牙更多！" },
        rage: { '1': "要燒我們？那就和我們一起燃燒吧！" },
        death: { '1': "沒有頭了。再也沒有了。" },
      },
      elderDragon: {
        intro: { '1': "在你們的種族學會用火之前，我就在世界之下沉睡了。" },
        flight: { '1': "那就躲到你的小石頭後面去吧。" },
        rift: { '1': "裂隙在把我拉回去。還不行！" },
        death: { '1': "那就封印它吧。我厭倦黑暗了。" },
      },
      'siegeHale': {
        'start': {
          '1': "他們來了！守住城門！"
        },
        'ram': {
          '1': "攻城槌！在它到城門前幹掉它！"
        },
        'horn50': {
          '1': "城門已毀了一半！頂住！"
        },
        'horn25': {
          '1': "城門撐不了多久了！"
        },
        'won': {
          '1': "他們潰敗了！堡壘屹立不倒！"
        }
      },
      'siegeMara': {
        'start': {
          '1': "他們來了！大家站穩！"
        },
        'ram': {
          '1': "攻城槌！在它撞破城門前攔住它！"
        },
        'horn50': {
          '1': "城門塌了一半。撐住！"
        },
        'horn25': {
          '1': "城門要垮了！把他們打回去！"
        },
        'won': {
          '1': "他們逃了！要塞還在！"
        }
      },
      banditChief: {
        whistle: {
          1: '起來，小子們！咬他們！'
        }
      },
      lightDisciple: {
        freed: {
          '1': '是光指引你來的。我是奧蕾爾修女。到桑佛德來找我，我會教你光明使者之道。'
        }
      },
      trainerAegis: {
        freed: {
          '1': '謝謝你把我們從強盜手裡救出來！到火堆旁來吧：我們都會教你，第一堂課免費。'
        },
        road: { '1': '你找到我們了！惡魔在通往桑福德的路上抓住了我們。我們要去堡壘渡口，到要塞來找我們吧。' }
      },
      sfShadow: {
        road: { '1': '總算有人來了。我們這就去堡壘渡口，到要塞來找我們。' }
      },
      frostDisciple: {
        freed: {
          '1': '你是來救我的？我是艾佛·哈斯克，寒霜衛士的弟子。來艾恩霍德，我來教你。'
        }
      },
      windDisciple: {
        freed: {
          '1': '終於自由了！我是凱斯崔爾·韋恩，走疾風行者之道。來奧克赫文找我，我來教你。'
        }
      },
      freedFarmers: {
        freed: {
          '1': '你救了我們！我們是托勒一家，務農的。到奧克赫文找我們，家裡出事了。'
        }
      },
      freedHerbalist: {
        freed: {
          '1': '哦，謝謝你！我是草藥師布萊爾。來西爾弗布里奇看看我吧，我正需要你幫忙。'
        }
      },
      freedPeddler: {
        freed: {
          '1': '願你的靴子蒙福！我是小販奧多·馬羅。來桑佛德找我，我會幫你備好貨。'
        }
      },
      goblinKing: {
        charge: {
          '1': '撞垮他們，獠牙！'
        },
        horn: {
          '1': '兄弟們，到我這裡來！哥布林，到我這裡來！'
        },
        dismount: {
          '1': '快跑，獠牙！剩下的我自己來！'
        },
        return: {
          '1': '獠牙！再來一次！'
        }
      },
      dragon: {
        takeoff: {
          '1': '夠了。讓天空燒了你。'
        },
        flight2: {
          '1': '我還沒跟你算完！'
        }
      },
      archDemon: {
        gate: {
          '1': '大門開了。誰也別想離開。'
        },
        dive: {
          '1': '跪下。'
        }
      },
      chimera: {
        intro: {
          '1': "三個頭，一種飢餓。誰先咬下去？"
        },
        twin: {
          '1': "現在是兩個了。選好你的一邊。"
        },
        tail: {
          '1': "我的尾巴！你要為此付出代價！"
        },
        death: {
          '1': "三個頭，竟沒有一個看到這一幕。"
        }
      },
      centaurWarchief: {
        intro: {
          '1': "想跑就跑吧。我的箭比你更快。"
        },
        raiders: {
          '1': "騎手們！把他們踏平！"
        },
        rear: {
          '1': "箭射夠了。我要把你踩扁！"
        },
        death: {
          '1': "這片平原會記住我的蹄聲。"
        }
      },
      cyclops: {
        intro: {
          '1': "這裡有個小東西。靠近點。讓我看看。"
        },
        cover: {
          '1': "不許再看了。我的眼睛你別想得到！"
        },
        blind: {
          '1': "我看不見你，但我聽得見你！"
        },
        death: {
          '1': "黑了。一切都黑了。"
        }
      },
      frostJarl: {
        hammer: {
          '1': '站著別動，小傢伙。'
        },
        iceBreak: {
          '1': '湖水會把你吞掉！'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': '小心推車！抱歉，這座橋上什麼都在動。歡迎來到西爾弗布里奇。',
        '2': '我是布倫娜·奎爾鎮長。東西丟了、壞了、遲了，最後都會堆到我桌上。'
      },
      ending: {
        '1': '整條河都在談論你。生意從沒這麼好過。所以，謝謝你。'
      },
      again: {
        '1': '又來啦？好。盡量別擋著推車。'
      },
      who: {
        '1': '當鎮長九年了。以前我賣繩子。其實是一樣的工作：把東西綁在一起。',
        '2': '鎮上每年春天投票。到現在，還沒人想搶這張桌子。'
      },
      town: {
        '1': '先有的橋。然後橋上有了市集，再有了房子，房子上面又蓋了房子。',
        '2': '小心噴泉。小孩常掉進去。市集日的時候，大人也會。',
        say: '跟我說說西爾弗布里奇吧。'
      },
      masters: {
        '1': '一個不少。盾、火、影、石。每門都有大師，全在一座橋上。',
        '2': '學徒從四面八方趕來。旅店樂壞了。我的窗戶可就遭殃了。',
        say: '這裡真的每個職業都有老師嗎？'
      },
      river: {
        '1': '河水帶來什麼就賣什麼。魚、絲綢、艾恩霍德的鋼，偶爾還有一箱生氣的雞。',
        '2': '還有，西爾弗布里奇的商人可不是個個都掛招牌。眼睛放亮點。',
        say: '這裡的人都買賣什麼？'
      },
      rumor: {
        crags: {
          '1': '北邊來的船停了。灰燼峭壁那邊有什麼東西在燒。'
        },
        mines: {
          '1': '這個月沒有艾恩霍德的鋼。矮人說他們的礦坑出事了。'
        },
        tundra: {
          '1': '毛皮商再也不肯穿過凍原了。他們說巨人開始行動了。'
        },
        far: {
          '1': '現在商人們說起遙遠的北方都壓低聲音。不管那裡有什麼，反正不是來做生意的。'
        }
      },
      bye: {
        '1': '去吧。要是有人問，過橋費公道得很。'
      }
    },
    sbHealer: {
      hello: {
        '1': '嗯？喔，來病人了。抱歉，我在讓眼睛休息一下。治療師都這樣。',
        '2': '我是安塞爾修士。進來，坐吧。這椅子比看起來舒服。'
      },
      again: {
        '1': '啊，你又來了。我才剛坐下。'
      },
      heal: {
        '1': '躺下，閉上眼。別太久，不然我也要打瞌睡了。好了，藥瓶都滿了。'
      },
      mana: {
        '1': '螢光菇補劑。對腦袋好，對口氣不好。慢慢喝。'
      },
      potions: {
        '1': '別等到走投無路才喝。英雄們總是等太久。',
        '2': '想多帶幾瓶的話，我這裡賣更長的腰帶。裝滿藥瓶是免費的。',
        say: '關於藥水有什麼建議嗎？'
      },
      sleep: {
        '1': '晚上不睡。各個職業的學徒都在練習，總有東西會爆炸。',
        say: '你真的睡過覺嗎？'
      },
      healBack: {
        '1': '去吧。下次來喝茶，別再來要繃帶了。'
      },
      bye: {
        '1': '小心台階。我一半的病人只是在那裡絆倒的。'
      }
    },
    sbArmorer: {
      forge: {
        '1': '熔爐隨便用。要是什麼著火了就喊一聲。'
      },
      learnSmith: {
        '2': '在它最亮最熱時敲。三下好的敲擊，就是一件好東西。',
        '1': '想自己試試鎚子嗎？我不介意和你共用熔爐。'
      },
      ore: { '1': '漂亮的礦石。給我看看你要賣什麼，按塊付錢。' },
      sellBack: { '1': '很高興。西爾弗布里奇向來出價公道。' },
      forgeBack: {
        '1': '瞧瞧！你真是天生的好手。'
      },
      hello: {
        '1': '哈！瞧瞧這個凹痕。希望你買這身盔甲的錢有要回來。',
        '2': '葛蕾塔·艾恩維恩。我做的盔甲會跟主人一起回家。到目前為止，次次都是。'
      },
      again: {
        '1': '又是你！還完完整整的。我最喜歡這種客人。'
      },
      trade: {
        '1': '來，敲一敲。想多用力都行。'
      },
      who: {
        '1': '山裡人家出身。順著河下來做生意，為了這裡的魚就留下了。'
      },
      steel: {
        '1': '不在厚不厚，在於哪裡能彎。好盔甲會在你彎的地方彎。',
        '2': '不過重板甲要力量。力量不夠還硬穿，走起路來就像鴨子一樣搖搖擺擺。',
        say: '好盔甲好在哪裡？'
      },
      shopBack: {
        '1': '好好穿。凹痕帶回來給我看，我愛聽好故事。'
      },
      bye: {
        '1': '去吧。別讓我沒護住的地方挨打。'
      }
    },
    sbWeapons: {
      hello: {
        '1': '啊，一位有品味的客人。我一眼就看得出來。從你走進來的樣子就知道。',
        '2': '阿什比精品刀劍的科爾文·阿什比。沒錯，就是那個阿什比。你一定聽說過我。'
      },
      again: {
        '1': '這麼快就回來了？大家最後總會回到科爾文這裡。'
      },
      trade: {
        '1': '每把刀都是手工打磨的。其實就是我的手。小心別被反光晃到。'
      },
      who: {
        '1': '這條河上最好的刀劍商人。隨便問誰都行。或者看看我的招牌。'
      },
      blades: {
        '1': '挑適合你的。手快就用輕刀，臂力大就用重刀。',
        '2': '還得好看。沒人會被拿著醜劍的英雄嚇跑。',
        say: '怎麼挑一把好武器？'
      },
      shopBack: {
        '1': '好眼光。沒我的頭髮那麼好，但也差不多了。'
      },
      bye: {
        '1': '一定要告訴別人你是在哪裡買的。'
      }
    },
    sbJeweler: {
      hello: {
        '1': '嘿！這邊！戒指、護符、幸運石。橋上最好的攤子。',
        '2': '我叫塔姆·馬洛。我個子小，價錢更小。'
      },
      again: {
        '1': '我最喜歡的客人！別告訴其他人我這麼說過。'
      },
      trade: {
        '1': '全是真的。大部分是。好吧，那顆是玻璃，但是很漂亮的玻璃。'
      },
      who: {
        '1': '我在這座橋上長大。每條裂縫、每隻貓、每條捷徑我都知道。'
      },
      gossip: {
        '1': '斯普羅基特教授又把眉毛炸沒了。這個月第三次了。',
        '2': '還有，鎮長知道那些不掛招牌的商人。我正在打聽。',
        say: '聽到什麼好玩的八卦嗎？'
      },
      shopBack: {
        '1': '合作愉快！告訴你的朋友。別告訴衛兵。'
      },
      bye: {
        '1': '回頭見！我就在這裡。大概吧。'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': '哈！又來一個年輕人。抬起下巴，挺起肩膀。笑著舉盾，效果更好。',
        '2': '海爾嘉·斯托姆希爾德女爵士。我曾守住這座橋。現在我教別人怎麼站穩腳跟。'
      },
      again: {
        '1': '你來啦！盾舉起來了？好。在笑嗎？更好。'
      },
      train: {
        '1': '雙腳分開。身體前傾。我推你，你不能動。準備好了嗎？嘿！'
      },
      class: {
        '1': '你站在最前面，這樣別人就不用站。這是世上最好的差事。',
        '2': '力量用來舉盾。耐力讓你一直舉到吃晚飯。',
        say: '神盾騎士到底是做什麼的？'
      },
      ready: {
        strong: {
          '1': '孩子，你現在是一堵像樣的牆了。想學哪課就學哪課。'
        },
        able: {
          '1': '腿站得真穩！你可以學下一課了。'
        },
        weak: {
          '1': '還不行。我一推你就倒。請多練力量和耐力。'
        }
      },
      bridge: {
        '1': '四十年前，對抗河盜。我們六個人，一道門，一個很長很長的夜晚。',
        '2': '我們贏，不是因為打得最狠，而是因為寸步不讓。記住這一點。',
        say: '你守過這座橋？'
      },
      trainBack: {
        '1': '做得好！現在去吃點東西。盾牌可重了。'
      },
      bye: {
        '1': '出去也要抬起頭來！'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': '請進。小心筆記，還有，請別在火盆旁邊打噴嚏。',
        '2': '魔導師伊格內修斯·維爾。我在橋上教火焰。你看，周圍水多得是。'
      },
      again: {
        '1': '很準時。非常好。我們從上次停下的地方開始。'
      },
      train: {
        '1': '看好。一小簇火焰，穩穩托住。大火很容易，小火才需要功夫。'
      },
      class: {
        '1': '誰都能點火。火焰術士決定火往哪裡燒，又在哪裡停。',
        '2': '一切都來自智力。之後火焰需要一雙穩手時，技巧會幫上忙。',
        say: '火焰術士到底是做什麼的？'
      },
      ready: {
        strong: {
          '1': '你的控制力很出色。我幾乎沒什麼可糾正的了。隨意挑選吧。'
        },
        able: {
          '1': '合格。其實不只是合格。你可以學下一課了。'
        },
        weak: {
          '1': '還不行。你的火苗在晃。頭腦要更敏銳。多提升智力。'
        }
      },
      sprocket: {
        '1': '天才。吵鬧、粗心，又是天才。我在他門口常備一桶水。',
        say: '你覺得斯普羅基特教授怎麼樣？'
      },
      trainBack: {
        '1': '去水邊練習。這點我堅持。'
      },
      bye: {
        '1': '日安。袖子記得捲起來。'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': '在找我？從噴泉那裡起我就在你旁邊。你從我身邊走過去兩次了。',
        '2': '尼克斯·哈洛威。最好的藏身處是人群，而這是世上最熱鬧的橋。'
      },
      again: {
        '1': '又見面了。我在這裡有一會兒了。你發現了嗎？沒有？很好。'
      },
      train: {
        '1': '第一課：走路要像你本來就屬於這裡。沒人會多看這樣的人一眼。'
      },
      class: {
        '1': '永遠不在別人看著的地方。溜進去，快速一擊，再混回人群。',
        '2': '敏捷讓手腳更快。技巧讓這一擊算數。',
        say: '怎樣才算好的影刃？'
      },
      ready: {
        strong: {
          '1': '你現在真夠鬼祟了。剩下的都拿去吧，這是你應得的。'
        },
        able: {
          '1': '腳步真輕！你可以學下一招了。'
        },
        weak: {
          '1': '還不行。你在噴泉那裡我就聽見你來了。多練敏捷。'
        }
      },
      past: {
        '1': '我以前就在這座橋上扒口袋。還挺拿手的。',
        '2': '後來鎮長抓到我，給了我一份工作，而不是一間牢房。別告訴她我很感激。',
        say: '這些你是怎麼學會的？'
      },
      trainBack: {
        '1': '現在去練吧。盡量別讓我逮到你。'
      },
      bye: {
        '1': '回頭見。不過，你是見不到我的。'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': '喔！你好，你好。請原諒，我剛在跟我的衛兵聊天。他們是很棒的聽眾。',
        '2': '珀西瓦爾·阿什科姆。我本可以在城堡裡教，但只有在人群中才能學會領導。'
      },
      again: {
        '1': '我親愛的朋友！我們繼續吧？當然，前提是你願意。'
      },
      train: {
        '1': '那麼。好的命令要清楚、友善，而且只說一次。就像這樣。'
      },
      class: {
        '1': '領袖。你的衛兵會來到你身邊，和你一起戰鬥，而不只是為你戰鬥。',
        '2': '魅力就是一切。人們追隨自己喜歡的人，還有記得他們名字的人。',
        say: '什麼是大君主？'
      },
      ready: {
        strong: {
          '1': '太棒了！現在人們願意跟你去任何地方。所有課程都拿去吧。'
        },
        able: {
          '1': '你的衛兵會聽你的。你可以學下一課了。'
        },
        weak: {
          '1': '恐怕還差一點。再多一點魅力，他們就會來了。'
        }
      },
      please: {
        '1': '一直都說。吼叫換來服從，說「請」換來忠誠，而忠誠更長久。',
        say: '你真的對衛兵說「請」嗎？'
      },
      trainBack: {
        '1': '做得很好。記得事後謝謝他們。'
      },
      bye: {
        '1': '請多保重，代我向大家問好。'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': '小心青苔，孩子，它這週可累壞了。來，讓我好好看看你。',
        '2': '我是托娃·迪普魯特奶奶。這裡的河床是上好的石頭，一直到最底下。'
      },
      again: {
        '1': '這麼快又來了？坐吧，我剛泡了茶。石頭茶。主要還是茶。'
      },
      train: {
        '1': '手掌平放在地上。不是那樣。就像在拍一隻想睡的小狗。'
      },
      class: {
        '1': '我們請大地幫忙。需要時來一堵牆，有人無禮時來一根尖刺。',
        '2': '石頭就像花園。力量用來挖，智力用來知道該種在哪裡。',
        say: '地術師是做什麼的？'
      },
      ready: {
        strong: {
          '1': '大地現在喜歡你了。想學什麼就學什麼吧，孩子。'
        },
        able: {
          '1': '根扎得好！你可以學下一課了。'
        },
        weak: {
          '1': '還不行，乖孩子。石頭不肯為你動一動。先多練力量。'
        }
      },
      garden: {
        '1': '四十年的心血。每塊石頭都是親手種出來的。好吧，靠魔法。大部分是親手。',
        '2': '走的時候拿顆小石子吧。用來擋門可好了。',
        say: '那是石頭做的花園嗎？'
      },
      trainBack: {
        '1': '真好。現在去挖點什麼吧。輕輕地。'
      },
      bye: {
        '1': '去吧。穿暖和點，河邊潮濕。'
      }
    },
    sbMasterAether: {
      hello: {
        '1': '歡迎，歡迎！你來得正好，示範馬上開始。請摀住耳朵。',
        '2': '昆特·斯普羅基特教授。河水免費幫我轉輪子。我還能去哪裡教書呢？'
      },
      again: {
        '1': '啊，我最喜歡的學生！今天的示範格外響。'
      },
      train: {
        '1': '看黑板。現在把黑板忘掉，看機器。'
      },
      class: {
        '1': '我們靠造東西擺脫麻煩。一把手槍，一座砲塔，還有一個讓你老實點的熱量表。',
        '2': '技巧負責瞄準，智力負責巧妙的部分。最好兩樣都有。',
        say: '乙太技師到底是做什麼的？'
      },
      ready: {
        strong: {
          '1': '了不起！你都能替我講課了。不過千萬別。剩下的都拿去吧。'
        },
        able: {
          '1': '手真穩！你可以學下一台機器了。'
        },
        weak: {
          '1': '還不行。你的準頭在飄。多練技巧，然後再說。'
        }
      },
      eyebrows: {
        '1': '一次示範有點太成功了。會長回來的。一向如此。',
        say: '你的眉毛怎麼了？'
      },
      trainBack: {
        '1': '太好了。現在去把熱量散掉。最好在外面。'
      },
      bye: {
        '1': '下課！小心台階。'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': '我的老學生時辰守護者寫信說你會來。而且就是這一分鐘。',
        '2': '守鐘人塞爾溫。我照看橋上的鐘。這麼忙的鎮子，可遲到不起。'
      },
      again: {
        '1': '過了七分。正是開始的好時候。'
      },
      train: {
        '1': '跟我一起數。一，二，停住。拿捏得當，時間就會被拉長。'
      },
      class: {
        '1': '我們整理時間。讓敵人慢下來，讓朋友快起來，偶爾撤銷一個小錯誤。',
        '2': '智力用來理解時間。技巧讓你碰它時什麼都不弄壞。',
        say: '什麼是織時者？'
      },
      ready: {
        strong: {
          '1': '時機把握得很好。剩下的課，你方便時隨時來學。'
        },
        able: {
          '1': '你準備好了。下一課開始於……嗯，現在。'
        },
        weak: {
          '1': '還不行。你總是慢半拍。多練智力，也多練技巧。'
        }
      },
      keeper: {
        '1': '多年前我教過他。很出色的學生。總是早到或遲到，從不準時。',
        say: '你怎麼認識時辰守護者的？'
      },
      trainBack: {
        '1': '每天練習。如果可以，每天同一時間。'
      },
      bye: {
        '1': '去吧。別遲到。'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': '桑格雷爾醫生寫信跟我提過你。他說你沒昏倒。從他嘴裡說出來，這可是高度讚揚。',
        '2': '維斯珀·克里姆森利夫。世上所有草藥都會漂過這座橋。我在這裡真是被寵壞了。'
      },
      again: {
        '1': '歡迎回來。你今天看起來很有精神。我總看得出來。'
      },
      train: {
        '1': '吸氣。感覺到你的力量了嗎？現在花掉一點。要花得明智。'
      },
      class: {
        '1': '我們用自己的生命力換取力量，再從敵人身上奪回來。',
        '2': '耐力是你的錢包。智力決定你花得好不好。',
        say: '鮮血鍊金師到底是什麼？'
      },
      ready: {
        strong: {
          '1': '好旺盛的生命力！我會的幾乎所有東西，你都可以學了。'
        },
        able: {
          '1': '你的精華流動得很強勁。去學下一課吧。'
        },
        weak: {
          '1': '還不行。施一個法術你就會累。先把耐力練起來。'
        }
      },
      herbs: {
        '1': '大多是補劑。一點精華，好多薄荷。薄荷讓一切都變好。',
        '2': '要是你在外面找到稀有的植物，一定帶過來。我很想看看。',
        say: '這些草藥都是做什麼用的？'
      },
      trainBack: {
        '1': '練完要休息。精華會回來的，但它喜歡先睡個午覺。'
      },
      bye: {
        '1': '照顧好自己。多喝水。吃點綠色的東西。'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': '今天早上從海邊來了三艘駁船。',
        '2': '又是鹹魚？',
        '3': '難得是絲綢。不過之後聞聞你的手指。'
      },
      lesson: {
        '1': '你的課上得怎麼樣？',
        '2': '我把袖子點著了。大師說這是進步。'
      },
      masters: {
        '1': '全國的大師都在同一條街上教課。',
        '2': '而且每個人都說自己的職業最好。',
        '3': '他們說得都對，這才氣人。'
      },
      bridge: {
        '1': '聽說這座橋比鎮子還老。',
        '2': '聽它嘎吱響，確實像。'
      },
      fish: {
        '1': '釣到什麼了嗎？',
        '2': '一隻靴子。',
        '3': '嗯，已經湊齊半雙了。'
      },
      newMaster: {
        '1': '北街來了個新大師。老是在講時間。',
        '2': '我打賭他每堂課都遲到。'
      },
      siege: {
        '1': '奧克赫文傳來的消息不妙。強盜都打到城牆下了。',
        '2': '那駁船就會改來這裡了。真是可憐人。'
      }
    },
    sbAlchemist: {
      hello: {
        '1': '哎呀！小心那些罐子。那個會咬人。好啦，是輕輕啃一下。',
        '2': '我是「蕨笛」奧迪爾，鍊金術士。幫我帶草藥來，我就幫你裝一瓶小小的勇氣。'
      },
      again: {
        '1': '你回來啦！有沒有幫我帶點綠色的東西？'
      },
      brew: {
        '1': '讓我看看你的小袋子。哇，真不錯。挑你想要的，我去燒水。'
      },
      who: {
        '1': '我用一朵雛菊把我媽媽的花園點著了。誰也解釋不了，所以我只好自己去學。'
      },
      herbs: {
        '1': '在野外，你戰鬥的地方到處都有。從植物上走過去，它就歸你了。',
        '2': '稀有的很挑剔。月鈴花在低語森林裡開放；影棘偏愛陰暗的地方。',
        say: '去哪裡找草藥？'
      },
      elixirs: {
        '1': '每一種都能讓你在戰鬥中變強整整五分鐘。打得更狠，皮更硬，腳更快。',
        '2': '它們放在你的第三個藥瓶裡。點一下小箭頭，就能換要喝的那種。',
        say: '靈藥有什麼用？'
      },
      brewBack: {
        '1': '小心，還熱著呢。袋子裝滿了再來找我！'
      },
      bye: {
        '1': '再見啦！看到紫色的花就摘兩朵。一朵給我。'
      }
    },
    sbGambler: {
      hello: {
        '1': '快來瞧一瞧！十二張牌，一個沙漏，還有一袋可能翻倍的錢！',
        '2': '我是佩爾夫人。見過的臉我從不忘記。來看看你能不能記住每一張牌。'
      },
      again: {
        '1': '又來玩一局？沙子可一直在等你呢。'
      },
      play: {
        '1': '錢放布上，眼睛看牌。準備好了嗎？翻沙漏！'
      },
      rules: {
        '1': '每次翻兩張牌。配成對的就一直朝上。在沙子漏完前找出所有配對，我就付你雙倍。',
        '2': '再贏一局，沙漏就會變快。連贏五局，我就送你一件傳說獎品。',
        say: '這個怎麼玩？'
      },
      who: {
        '1': '我九歲就跟著巡迴馬戲團跑了。結果那個馬戲團，算帳可厲害了。'
      },
      prize: {
        '1': '有過一個矮人。從那以後，再沒人見他眨過眼。',
        say: '有人贏過獎品嗎？'
      },
      playBack: {
        '1': '不管輸贏，這局都很精彩。等眼睛休息夠了再來吧。'
      },
      bye: {
        '1': '去吧！可別忘了自己的腳放在哪裡。'
      }
    },
    sunfordGambler: {
      hello: {
        '1': '噓。你包包裡有破爛嗎？舊靴子、彎掉的劍？我拿它們跟你賭一把。',
        '2': '我是「筋斗」多布。我賭著玩，大多是這樣。還有就是為了靴子。'
      },
      again: {
        '1': '又是你！還有那些可愛的破爛嗎？'
      },
      play: {
        '1': '入場費放桌上。把東西擺出來，價高的得一分。'
      },
      rules: {
        '1': '我們各出一件物品。貴的那件得一分。先得兩分就贏。',
        '2': '不管輸贏，你出的東西都歸我。不過要是連贏三局，我有件特別的東西給你。',
        say: '規則是什麼？'
      },
      who: {
        '1': '以前是個小販。後來發現，大家寧願拿東西來賭，也不願意賣。'
      },
      luck: {
        '1': '常常輸！不過我回家時，總能多一雙新靴子。',
        say: '你會輸嗎？'
      },
      playBack: {
        '1': '打得好！你那些東西擺在我架子上一定很好看。'
      },
      bye: {
        '1': '多帶點破爛來！破爛是我的最愛。'
      }
    },
    sunfordCups: {
      hello: {
        1: '快來看！三個杯子，一顆寶石，第一局免費！',
        2: '「快手」奈爾。還沒人騙得過我的手。想試試嗎？'
      },
      again: {
        1: '又來啦？眼睛放亮一點！'
      },
      play: {
        1: '盯緊寶石，朋友。別眨眼！'
      },
      rules: {
        1: '我把寶石藏在一個杯子下面，然後換來換去。你指出藏著它的杯子就行。',
        2: '連勝越多贏得越多。三連勝有獎品，五連勝有寶藏。每天第一局免費。',
        say: '怎麼玩？'
      },
      who: {
        1: '我還不會走路就會洗牌了。我媽說這能解釋很多事。'
      },
      luck: {
        1: '偶爾！那我就大聲哀嘆，觀眾就會同情我。',
        say: '你也會輸嗎？'
      },
      playBack: {
        1: '這一局真棒！明天再來，第一局永遠免費。'
      },
      bye: {
        1: '回見！在外面也要眼觀四面。'
      }
    },
    oakGambler: {
      hello: {
        '1': '新面孔啊。請坐，我不咬人。不過我的價錢嘛，會咬一點點。',
        '2': '大家叫我「絲絨」倫。我收藏好東西，一局一件。'
      },
      again: {
        '1': '啊，我最喜歡的對手。我們開始吧？'
      },
      play: {
        '1': '請先付入場費。然後，拿出點值得我出手的東西。'
      },
      rules: {
        '1': '每人每次出一件，最多三次。更精良的那件得一分。先得兩分者獲勝。',
        '2': '不管怎樣，你的東西都留在我這裡。連贏三局，你就能帶著真正的寶物離開。',
        say: '我們怎麼玩？'
      },
      who: {
        '1': '我是做稀有貨的商人。找到它們，收好它們，偶爾也會輸掉一件。'
      },
      collection: {
        '1': '按閃亮的程度排好。最閃的放在最上層，挨著我的茶杯。',
        say: '這些東西你都拿來做什麼？'
      },
      playBack: {
        '1': '真愉快。等你的背包重一些，再來吧。'
      },
      bye: {
        '1': '出門小心錢袋。不是每個人都玩得公平。'
      }
    },
    sbCollector: {
      hello: {
        '1': '把門關上，有風鑽進來。蛾子老惦記著我的掛毯。',
        '2': '我是奧爾德·維恩，有人叫我「收藏家」。我收購稀罕東西，只賣給我喜歡的人。'
      },
      open: {
        '1': '我的朋友！快進來，快進來。我幫你擦好了一件特別的寶貝。'
      },
      again: {
        '1': '又是你。看來你還沒幫我那個忙。'
      },
      trade: {
        '1': '櫃子都打開了。只有最好的貨，每個價錢我都記得。'
      },
      favor: {
        '1': '不賣給陌生人。不過幫我個忙，我們就是朋友了。',
        '2': '低語森林裡的樹人守著我要的月鈴花。打敗四個樹人，再幫我帶兩朵月鈴花來。',
        say: '你有賣東西嗎？'
      },
      waiting: {
        '1': '四個樹人，兩朵月鈴花。可惜，月鈴花不會自己摘下來呀。',
        say: '關於那個忙……'
      },
      favorDone: {
        '1': '哦，還帶著森林的香味！太好了。',
        '2': '說話算話。我的櫃子隨時讓你看個夠。',
        say: '我把月鈴花帶來了。'
      },
      who: {
        '1': '我六歲就開始收藏了。起初是鈕扣，現在是會嗡嗡響的劍。'
      },
      shopBack: {
        '1': '好好對待它。它比我們倆年紀都大。'
      },
      bye: {
        '1': '出去時把門帶上。輕一點，花瓶會晃得叮噹響。'
      }
    },
    sbFence: {
      hello: {
        '1': '盯著看什麼？要嘛買點東西，要嘛別擋著我的光。',
        '2': '我是米蕾拉·索恩。我專找別人弄丟的東西，再幫它們找新主人。'
      },
      open: {
        '1': '啊，我最喜歡的英雄。好東西我都藏在布底下留給你了。'
      },
      again: {
        '1': '又來了？記住我要你辦的事。辦完再談生意。'
      },
      trade: {
        '1': '各地來的護甲。別問從哪來。現在全都乾乾淨淨，我保證。'
      },
      favor: {
        '1': '好護甲。只給朋友。朋友嘛，就該互相幫忙。',
        '2': '奧克赫文郊外的盜賊老是搶我的貨。打敗十五個，再去問問賣飾品的小傢伙，是誰派他們來的。',
        say: '布底下是什麼？'
      },
      waiting: {
        '1': '十五個盜賊，然後跟賣飾品的小傢伙聊一句。去吧。',
        say: '關於那些盜賊……'
      },
      favorDone: {
        '1': '原來一直是那個大嘴巴。哈！我欠你一個人情。',
        '2': '隨時掀開布看看。朋友先挑。',
        say: '盜賊打敗了，我也知道是誰派的了。'
      },
      who: {
        '1': '我在這條河的石階上長大。漂過的東西，遲早都會落到我手裡。'
      },
      shopBack: {
        '1': '好好穿著。要是有人問，就說是在艾恩霍德買的。'
      },
      bye: {
        '1': '看好你的錢袋。這裡可不是人人都像我這麼老實。'
      }
    },
    sbMasterWindrunner: {
      hello: {
        '1': '喔，嗨！抱歉，停不下來。我在等風轉向。隨時都會轉。',
        '2': '我是塞法，人稱疾風翼。我射箭，也追風。通常是風贏。'
      },
      open: {
        '1': '我的跑者來啦！準備好了？當然好了。走吧走吧！'
      },
      again: {
        '1': '又見面啦！我還在這裡。嗯，大部分還在。我的腳老是自己跑掉。'
      },
      train: {
        '1': '感覺到臉頰上的風嗎？往你以為的位置再偏左一點瞄。放！'
      },
      favor: {
        '1': '只教跟得上的人。你跟得上嗎？來試試看。',
        '2': '在奧克赫文郊外打敗八個盜賊弓手，再帶兩株疾風蕨給我。',
        say: '你教射箭嗎？'
      },
      waiting: {
        '1': '八個盜賊弓手，兩株疾風蕨。快去！我就在這裡等。一邊跳一邊等。',
        say: '關於你的考驗……'
      },
      favorDone: {
        '1': '哈！你真的跟上了！從來沒人跟得上！',
        '2': '好，你現在是我的徒弟了。只有一條規矩：上課不准坐下。',
        say: '弓手都打敗了，這是你要的疾風蕨。'
      },
      class: {
        '1': '射、跑、再射。要是被抓到，就是你站太久了。',
        '2': '敏捷讓腳快、弓也快。技巧讓每一箭都射中。',
        say: '疾風行者是做什麼的？'
      },
      ready: {
        strong: {
          '1': '你現在跟風一樣快了。嗯，差不多啦。想學哪課就學哪課！'
        },
        able: {
          '1': '腳步真輕！你可以學下一課了。快去，快去！'
        },
        weak: {
          '1': '還不行。你跑起來像扛著一張沙發。請多練敏捷。'
        }
      },
      who: {
        '1': '我住在河邊那座老風車上面。鎮上看風最好的地方。',
        '2': '爬到頂要兩百階。超好的練習。每一階我都數過。'
      },
      trainBack: {
        '1': '很好！現在跑回家。不准用走的。跑步也算練習。'
      },
      bye: {
        '1': '再見！小心低矮的樹枝。我從來都不小心。'
      }
    },
    sbMasterFrostwarden: {
      hello: {
        '1': '嗯。你從我面前走過三次了。迷路了，還是好奇？',
        '2': '我是哈爾瓦德，人稱霜心。我從雪地南下而來。這裡很暖。太暖了。'
      },
      open: {
        '1': '徒弟。很好。冰準備好了，我也是。'
      },
      again: {
        '1': '又是你。很好。我話不多。還是留下吧。'
      },
      train: {
        '1': '慢慢吐氣。看到白霧了嗎？現在把它送進劍裡。'
      },
      favor: {
        '1': '是的。我只教在炎熱之地還能保持冷靜的人。',
        '2': '去灰燼峭壁熄滅七個火元素。然後帶兩枝霜薄荷給我。',
        say: '那把劍是冰做的嗎？'
      },
      waiting: {
        '1': '七個火元素。兩枝霜薄荷。慢慢來。別太慢。',
        say: '關於你的考驗……'
      },
      favorDone: {
        '1': '嗯。連一點焦都沒有。很好。',
        '2': '你保持了冷靜。那就是第一課。剩下的我來教你。',
        say: '火元素都熄滅了。這是你的霜薄荷。'
      },
      class: {
        '1': '寒冷的騎士。讓敵人變冷，把它們凍住，再把冰打碎。',
        '2': '力量用來揮劍。智力用來凝霜。兩樣都要。',
        say: '寒霜衛士是什麼？'
      },
      ready: {
        strong: {
          '1': '你現在跟北方一樣冷了。想學哪課都可以。'
        },
        able: {
          '1': '很好。很穩。下一課是你的了。'
        },
        weak: {
          '1': '還不行。你的霜融得太快。多練智力，也多練力量。'
        }
      },
      who: {
        '1': '我在北方守過一條山道。後來我想看看一條不會結冰的河。'
      },
      trainBack: {
        '1': '很好。現在休息。冰不急。你也不必急。'
      },
      bye: {
        '1': '一路順風。保持冷靜。'
      }
    },
    sbMasterLightbringer: {
      hello: {
        '1': '嗯～嗯嗯～……喔！抱歉，孩子，我在哼歌。我對著你哼了嗎？我常這樣。',
        '2': '我是晨湖的奧瑞爾修女。我負責讓橋頭那盞小燈一直亮著。'
      },
      open: {
        '1': '我閃亮的孩子來啦！過來在光裡站一會兒。這是你應得的。'
      },
      again: {
        '1': '又見面了！我還在這裡，還在哼歌。燈也喜歡有人陪。'
      },
      train: {
        '1': '雙手張開，抬起下巴。想想你最美好的一個早晨。對了。感覺到了嗎？'
      },
      favor: {
        '1': '每個人心裡都有一點光。等大家準備好了，我就教他們把光放出來。',
        '2': '在灰燼峭壁打敗七個邪教徒，再帶三朵日光瓣給我的燈。',
        say: '那盞燈是魔法燈嗎？'
      },
      waiting: {
        '1': '七個邪教徒，三朵日光瓣。下手輕一點。每個人都值得第二次機會。',
        say: '關於你的考驗……'
      },
      favorDone: {
        '1': '喔，看看它們！這盞燈會發出金光整整一個月。',
        '2': '你也會的，孩子。我很樂意教你。',
        say: '邪教徒都打敗了。這是你的日光瓣。'
      },
      class: {
        '1': '我們帶來黎明。光可以戰鬥，光可以治療，光還能讓你躲在後面。',
        '2': '智力讓光變強。魅力讓光變暖。兩樣你都會需要。',
        say: '光明使者是做什麼的？'
      },
      ready: {
        strong: {
          '1': '你像日出一樣閃耀，孩子。想學哪課就學哪課。'
        },
        able: {
          '1': '亮得真好看！你可以學下一課了。'
        },
        weak: {
          '1': '還不行，孩子。你的光有點暗。多練魅力，你就會發光。'
        }
      },
      who: {
        '1': '我以前在一座大神殿唱歌。可是我在這裡的燈能引船回家。這樣更好。'
      },
      trainBack: {
        '1': '真棒。現在去照亮別人的一天吧。這是修女的命令。'
      },
      bye: {
        '1': '去吧，孩子。對著黑暗的角落笑一笑。它們最討厭這樣。'
      }
    },
    sbMasterBeastcaller: {
      hello: {
        '1': '看著腳下。那是荊棘。她先來的。',
        '2': '我是羅文，人稱薊足。我喜歡動物。至於人，我還在考慮。'
      },
      open: {
        '1': '喔，是你。荊棘一直在等你。我也是。有一點點。'
      },
      again: {
        '1': '又是你。荊棘喜歡你。我還在考慮。'
      },
      train: {
        '1': '蹲下。再慢一點。伸出手，讓牠們自己過來。很好。'
      },
      favor: {
        '1': '說話？我是聽。這是大多數人一輩子都學不會的訣竅。',
        '2': '巨型蜘蛛在低語森林的獸徑上到處結網。清掉八隻。',
        '3': '然後帶兩朵月鈴花給我的窩。荊棘睡在旁邊比較好睡。',
        say: '你能跟動物說話嗎？'
      },
      waiting: {
        '1': '八隻蜘蛛，兩朵月鈴花。動物們在等。荊棘也在等。',
        say: '關於你的考驗……'
      },
      favorDone: {
        '1': '嗯。今天早上鹿下到河邊來了。我就猜是你。',
        '2': '好吧。我教你。別大驚小怪。荊棘，別搖尾巴了。',
        say: '獸徑清乾淨了，這是你的月鈴花。'
      },
      class: {
        '1': '你呼喚荒野，荒野就會來。狼、鷹、熊。是朋友，不是寵物。',
        '2': '魅力讓牠們想來。耐力讓你跟得上牠們。',
        say: '喚獸師是什麼？'
      },
      ready: {
        strong: {
          '1': '現在整個獸群都信任你了。想學什麼就拿去。'
        },
        able: {
          '1': '狼喜歡你。你可以學下一課了。'
        },
        weak: {
          '1': '還不行。牠們還不信任你。多練魅力，還要多很多耐心。'
        }
      },
      who: {
        '1': '很多年前在陷阱裡發現荊棘。三條腿，滿身脾氣。從那以後我們就是一對。',
        '2': '我睡在馬廄的草料閣樓。馬打呼比人少。'
      },
      trainBack: {
        '1': '很好。去吧。順便跟烏鴉打聲招呼。牠們記性很好。'
      },
      bye: {
        '1': '去吧。荊棘說再見。'
      }
    },
    sbMasterElementalist: {
      hello: {
        '1': '嗨！等一下，我在拋球。火、冰、電、石，還有……接住了！哈囉！',
        '2': '我是艾莉絲導師，人稱四風。四種元素我都教。把它們混在一起才好玩。'
      },
      again: {
        '1': '又來啦！太好了，我正需要觀眾。看好喔。噹噹！'
      },
      train: {
        '1': '選兩顆球。哪兩顆都行。現在讓它們碰一下。輕輕的！看到了嗎？反應！'
      },
      class: {
        '1': '我們混合！先冰後火，會融化。先火後電，砰。每一對都有效果。',
        '2': '智力用在每個法術上。技巧，因為厲害的法術需要一雙快手。',
        say: '元素使是做什麼的？'
      },
      ready: {
        strong: {
          '1': '你現在混得像大師一樣了！想學哪課就學哪課。學兩課也行！'
        },
        able: {
          '1': '哇，好漂亮的火花！你可以學下一課了。'
        },
        weak: {
          '1': '還不行！你的元素一直熄火。請多練智力。'
        }
      },
      sleeve: {
        '1': '喔！真的耶。等一下……好了。',
        '2': '先火後冰。其實這也是一課喔。不用謝！',
        say: '呃，你的袖子著火了。'
      },
      trainBack: {
        '1': '太棒了！現在請去外面練習。窗簾是新的。'
      },
      bye: {
        '1': '拜拜！如果聞到煙味，大概是我。別擔心！'
      }
    },
    sbMasterSoulwarden: {
      hello: {
        '1': '噓，沒事的，它們很友善。喔，不是說你。我在跟幽光說話。',
        '2': '我是守望者奧達莉絲，人稱燈光。我幫迷路的靈魂找到回家的路。'
      },
      again: {
        '1': '又見面了。幽光們記得你。那一團在跟你揮手。'
      },
      train: {
        '1': '把提燈放低，輕聲說話。迷路的東西會靠近溫柔的聲音。'
      },
      class: {
        '1': '敵人被打敗時，它的靈魂會有點迷路。我們幫它，它也會回報我們。',
        '2': '智力用來引導光。魅力讓靈魂願意多留一會兒。',
        say: '靈魂守望者是做什麼的？'
      },
      ready: {
        strong: {
          '1': '現在連最害羞的靈魂都會來找你了。想學哪課都可以。'
        },
        able: {
          '1': '幽光們信任你。你可以學下一課了。'
        },
        weak: {
          '1': '還不行。它們還在怕你。多練智力，再加一點魅力。'
        }
      },
      wisps: {
        '1': '算是吧！它們是走失的靈魂。這個叫扭扭。他喜歡暖的那一邊。',
        '2': '你知道嗎，沒有靈魂是壞的。只是迷路了。等它們準備好就會回家。',
        say: '你提燈裡的小光點是活的嗎？'
      },
      trainBack: {
        '1': '做得好。現在輕輕放它們走。它們今天也累了。'
      },
      bye: {
        '1': '保重。如果看到迷路的小光點，跟它打聲招呼。'
      }
    },
    sbMasterIronmonk: {
      hello: {
        '1': '坐下。呼吸。不對，你呼吸得像要遲到一樣。再來。',
        '2': '我是歐魯大師，人稱靜水。我教空手之道。鐵拳，靜心。'
      },
      again: {
        '1': '啊。徒弟回來了。河水也是。每天都回來。'
      },
      train: {
        '1': '腳如樹根，手如雨點。出拳。再來。第一百拳才算數。'
      },
      class: {
        '1': '不用刀劍。手、腳、呼吸。每一擊為下一擊蓄力，直到最強的那一擊。',
        '2': '敏捷讓手快。耐力讓你在別人喘不過氣時保持冷靜。',
        say: '鋼鐵武僧是什麼？'
      },
      ready: {
        strong: {
          '1': '徒弟成了師父。別告訴別人。想學哪課都可以。'
        },
        able: {
          '1': '很好。杯子正在裝滿。去學下一課吧。'
        },
        weak: {
          '1': '還不行。根淺的樹，風一吹就倒。多練耐力。'
        }
      },
      noodles: {
        '1': '是的。湯頭熬了兩天。請不要對著它呼氣。',
        '2': '好麵教人耐心。絕頂好麵教人其他一切。',
        say: '那是一碗麵嗎？'
      },
      trainBack: {
        '1': '很好。現在去吃點熱的。力量來自碗裡。'
      },
      bye: {
        '1': '慢走。腳步要輕。踢得要重。'
      }
    },
    sbMasterBard: {
      hello: {
        '1': '歡迎歡迎，快進來別受寒！哎呀，又押韻了。總是這樣。',
        '2': '我是拉克，人稱晴天。我在爐火旁彈琴，誰肯聽我就教誰彈魯特琴。'
      },
      again: {
        '1': '我最喜歡的聽眾！拉張凳子過來。小心那隻貓，她是評審。'
      },
      train: {
        '1': '跟我一起撥弦。一、二、三……別盯著手指。用心感受！'
      },
      class: {
        '1': '唱歌讓自己人更勇敢，奏曲讓對手睡著。',
        '2': '魅力用來征服聽眾。技巧讓你的手指跟得上你的心。',
        say: '吟遊詩人是做什麼的？'
      },
      ready: {
        strong: {
          '1': '你現在能讓任何酒館客滿！我會的歌全都拿去吧。'
        },
        able: {
          '1': '好美的曲子！你可以學下一段了。'
        },
        weak: {
          '1': '還不行。聽眾還在打哈欠。多練魅力吧，朋友。'
        }
      },
      story: {
        '1': '從前，有位騎士只帶著一把劍和一首歌，走過了這座橋……',
        '2': '等等，配上音樂更好聽。啦啦啦，騎士走啊走……我講到哪了？',
        '3': '喔，算了。不過這首歌很好聽吧？',
        say: '你能講個故事給我聽嗎？'
      },
      trainBack: {
        '1': '好極了！每天都要練。就算很難聽也要練。尤其是很難聽的時候。'
      },
      bye: {
        '1': '再會了，一路平安又燦爛！哎呀。又押韻了。拜拜！'
      }
    }
  },
  invasion: {
    pylonsDown: '最後一根塔柱倒下，寶藏散落一地！',
    reborn: {
      tusker: '重生的獠牙',
      emberLord: '煉獄餘燼領主',
      frostJarl: '重生的冰霜領主',
      voidDragon: '重生的虛空巨龍'
    }
  },
  enemy: {
    sphinx: "斯芬克斯",
    leviathan: "利維坦",
    hydra: "九頭蛇",
    elderDragon: "上古巨龍",
    trainingDummy: '訓練木樁',
    goblin: '哥布林',
    goblinSlinger: '哥布林投石手',
    bandit: '盜賊',
    banditArcher: '盜賊弓手',
    wolf: '野狼',
    banditChief: '盜賊頭子',
    gnome: '地精',
    goblinKing: '哥布林王',
    treant: '樹人',
    spider: '巨型蜘蛛',
    broodSpider: '幼蛛',
    outlawCaptain: '亡命之徒隊長',
    elderTreant: '古樹人',
    warlord: '軍閥克拉格',
    fireElemental: '火元素',
    ironGolem: '鐵魔像',
    cultist: '邪教徒',
    emberLord: '餘燼領主',
    ironColossus: '鋼鐵巨像',
    frostGiant: '冰霜巨人',
    naga: '納迦',
    skeleton: '骷髏',
    necromancer: '死靈法師',
    chimera: "奇美拉",
    chimeraTail: "蛇尾",
    centaurWarchief: "半人馬督軍",
    cyclops: "獨眼巨人",
    frostJarl: '冰霜領主',
    nagaOracle: '沉溺的神諭者',
    voidStalker: '虛空潛獵者',
    wyvern: '飛龍',
    highDemon: '高階惡魔',
    voidWarden: '虛空典獄長',
    voidDragon: '虛空巨龍',
    doomKnight: '末日騎士',
    imp: '小惡魔',
    archDemon: '大惡魔',
    voidling: '虛空幼體',
    voidLord: '虛空領主',
    demonPylon: '惡魔塔柱',
    orderGuard: '騎士團審判官',
    syndicateBlade: '商會刀客',
    goblinWarchief: '哥布林督軍',
    thornfather: '荊棘之父',
    broodMother: '巢母',
    banditBaron: '盜匪男爵',
    cinderGolem: '餘燼魔像',
    frostHowler: '霜嚎獸',
    tideSerpent: '潮汐巨蛇',
    riftKnight: '裂隙騎士',
    wyvernMatriarch: '雙足飛龍女王',
    tusker: '獠牙，戰爭野豬',
    tuskerCameo: '獠牙',
    goblinTyrant: '哥布林暴君',
    voidDrake: '虛空幼龍',
    pitLord: '深淵領主',
    frostThane: '冰霜族長',
    hellhound: '地獄犬',
    frostHellhound: '冰霜地獄犬',
    gargoyle: '石像鬼',
    harpy: '鷹身女妖',
    corruptedTreant: '腐化樹人',
    centaurRaider: '半人馬掠奪者',
    cyclopsBrute: '獨眼巨人蠻兵',
    demonMiner: '惡魔礦工',
    sphinxAcolyte: '人面獅身侍祭',
    seaDemon: '海魔',
    drakeHatchling: '幼龍',
    hydraSpawn: '九頭蛇幼體'
  },
  results: {
    careful: '謹慎通關 ×{mult}',
    victory: '勝利！',
    defeat: '戰敗',
    retreat: '已撤退',
    firstClear: '首次通關！',
    waves: '撐過的波數：{n}',
    levelUp: '升上 {n} 級！',
    points: '+{n} 屬性點',
    xp: '經驗',
    gold: '金幣',
    lost: '損失',
    kills: '擊敗',
    chests: '寶箱',
    bosses: '首領',
    mastery: '區域精通',
    masteryPct: '{n}%',
    newBest: '新紀錄！',
    time: '時間',
    unlocked: '地圖新增：{places}',
    equipped: '已裝備',
    better: '比你身上的更好',
    retry: '再試一次',
    tip: '經驗和戰利品都會保留。把點數用掉，去找導師，變強之後再回來。'
  },
  pause: {
    title: '已暫停',
    resume: '繼續',
    controls: '操作說明',
    retreat: '撤回地圖',
    retreatNote: '目前拿到的東西都會保留，但這個區域不算通關。'
  },
  ending: {
    more: '大惡魔已經倒下，但王國仍未安全。世界上只剩下一個巨大的威脅，它就在虛空裂隙之中等待著。',
    order: {
      title: '鋼鐵和平',
      text: '鐵之騎士團的旗幟在恐懼要塞上飄揚。道路平安，法條繁多，你的名字刻在城門上方。'
    },
    syndicate: {
      title: '灰燼交易',
      text: '商會躲在要塞的陰影裡統治。王國裡再也沒有什麼是禁止的，只是很貴。'
    },
    circle: {
      title: '乙太時代',
      text: '議會用捕捉到的虛空之火照亮要塞。奇蹟從大門不斷湧出，沒有人問代價是什麼。'
    },
    free: {
      title: '不要國王',
      text: '王座碎了一地，要塞空無一人。這麼久以來第一次，王國屬於住在裡面的人們。'
    },
    unbound: {
      title: '無縛者',
      text: '你坐上了王座。騎士團、商會和議會聯手向你進軍。儘管來吧。'
    },
    note: {
      goblinPact: '哥布林商人還在桑佛德的廣場上討價還價。',
      goblinSlain: '洞窟空蕩蕩的，商隊準時往來。',
      goblinRansom: '哥布林王又有錢了，也又開始掠奪了。',
      oakhavenSaved: '奧克赫文的城牆更高了，市集也更熱鬧了。',
      oakhavenFallen: '奧克赫文的街道長滿雜草。黑市生意興隆。',
      coreOrder: '艾恩霍德的礦坑安靜下來，矮人又開始挖礦。',
      coreCircle: '艾恩霍德的熔爐泛著藍光，那裡的槍是全王國最好的。',
      coreSold: '在某個地方，核心還在嗡嗡響。魔像還在走動。',
      oracleFreed: '風平浪靜的日子，漁夫會在遠遠的水面上看見神諭者。',
      oracleSlain: '沉沒神殿一片死寂。再也沒有人知道接下來會怎樣。',
      dragonPact: '一條龍在要塞屋頂築了巢，只聽一個名字的召喚。',
      dragonSlain: '一顆龍的頭骨掛在騎士團的大廳裡。'
    }
  },
  options: {
    saves: {
      save: '儲存',
      load: '讀取',
      newGame: '開始新遊戲',
      newGameWarn: '目前的遊戲將被新遊戲取代。如果想保留，請先儲存到一個存檔欄位。',
      confirm: '確定嗎？再點一次',
      slot: '存檔欄位 {n}',
      empty: '空',
      level: '等級 {n}',
      levelAt: '{level} · {place}',
      overwriteAsk: '覆寫',
      saved: '已儲存！',
      loadWarn: '讀取會取代目前的遊戲。如果想保留，請先儲存到一個存檔欄位。',
      saveHint: '遊戲會在你遊玩時自動儲存。在這裡儲存一份副本，之後可以回到它，例如嘗試不同的流派。',
      loadHint: '讀取已儲存的副本。遊戲將從那裡重新開始。'
    },
    gameplay: '遊戲玩法',
    title: '選項',
    general: '一般',
    audio: '音訊',
    language: '語言',
    difficulty: '難度',
    soundEffects: '音效',
    music: '音樂',
    mute: '靜音',
    musicTrack: '音樂曲目',
    musicTracks: {
      cozy: '寧靜',
      trance: '冒險'
    },
    haptics: '震動',
    on: '開',
    off: '關',
    close: '關閉',
    keyboard: {
      auto: '自動偵測鍵盤配置',
      layout: '鍵盤配置',
      detected: '已偵測：{layout}',
      bindings: '按鍵設定',
      press: '請按一個鍵…（Esc 取消）',
      reset: '重設按鍵'
    },
    actions: {
      up: '向上移動',
      down: '向下移動',
      left: '向左移動',
      right: '向右移動',
      skill1: '技能 1',
      skill2: '技能 2',
      skill3: '技能 3',
      skill4: '技能 4',
      skill5: '技能 5',
      skill6: '技能 6',
      potion: '喝藥水',
      manaPotion: '喝魔力藥水',
      leave: '離開已勝利的區域',
      interact: '交談',
      target: '下一個目標',
      map: '世界地圖',
      character: '英雄',
      inventory: '背包',
      skills: '技能',
      roll: '翻滾',
      elixir: '喝靈藥',
      elixirNext: '下一種靈藥',
      skill7: '技能 7',
      skill8: '技能 8'
    },
    difficulties: {
      easy: '簡單',
      medium: '普通',
      hard: '困難'
    },
    difficultyHints: {
      easy: '敵人攻擊較弱，也更容易被擊倒。',
      medium: '原汁原味的標準挑戰。',
      hard: '敵人更耐打，攻擊也更猛。'
    }
  },
  adsBlocked: {
    title: '無法顯示廣告',
    body: '我們本來想為你播放一段影片，但你的瀏覽器中有東西擋住了廣告。',
    allowPrefix: '請在以下網站允許廣告：',
    allowSuffix: '（或在本遊戲暫停廣告封鎖程式）然後再試一次。',
    gotIt: '知道了'
  },
  forcedDark: {
    title: '請為本遊戲關閉深色模式',
    body: '你的瀏覽器或某個擴充功能正在為這個頁面重新上色。遊戲有自己的配色，無法配合深色模式的強制改色。',
    waiting: '一旦關閉，遊戲會自動繼續。',
    continueAnyway: '風險自負，繼續',
    hint: {
      darkReader: 'Dark Reader：點一下它的圖示，針對本網站將其關閉。',
      extension: '開啟你的深色模式擴充功能，針對本網站將其關閉。',
      chromiumFlag: '開啟 {flagUrl}，把「Auto Dark Mode for Web Contents」設為 Default，或在瀏覽器的主題設定中關閉「dark theme for sites」。',
      samsung: 'Samsung Internet：開啟選單關閉深色模式，或在 Labs 中開啟「Use website dark theme」。',
      forcedColors: 'Windows：在 設定 → 協助工具 → 對比主題 中關閉對比主題。',
      firefoxColors: 'Firefox：設定 → 色彩 → 把「覆寫頁面指定的色彩」設為「永不」。'
    }
  },
  privacy: {
    policy: '隱私權政策',
    settings: '隱私設定'
  },
  samsungFix: {
    title: '快速顏色檢查',
    body: '部分手機會改變網頁的顏色。請比較下面兩個方塊。',
    question: '兩個方塊看起來一樣嗎？',
    refSquare: '參考方塊',
    pageSquare: '頁面方塊',
    yes: '是，一樣',
    no: '不，看起來不同',
    option: '修正顏色（三星深色模式）',
    optionHint: '如果選單看起來很暗或文字難以閱讀，請開啟。',
    recheck: '重新進行顏色檢查'
  },
  saveStatus: {
    restoredTitle: '雲端存檔已還原',
    restoredBody: '還原獎勵 +{n} 金幣',
    tap: '輕觸',
    pausedTitle: '雲端同步已暫停',
    pausedBody: '正在離線遊玩。你的進度會儲存在這台裝置上。',
    retry: '重試',
    dismiss: '忽略'
  },
  loading: {
    tooLong: '載入太久了？請停用廣告封鎖程式並重新整理頁面。'
  },
  license: {
    denied: '拒絕存取：請購買授權。'
  },
  leaderboard: {
    title: '排行榜',
    rank: '#',
    player: '玩家',
    score: '經驗',
    flair: '等級',
    empty: '排行榜上還沒有人。來當第一名吧！',
    failed: '無法連線到排行榜。',
    loading: '載入中…',
    you: '你',
    yourRank: '你在 {total} 人中排第 {n} 名',
    of: '/ 共 {n} 名玩家',
    tabGlobal: '全球'
  },
  iap: {
    title: '完整版',
    body: '你擊敗了哥布林之王，通關了免費試玩。一次性解鎖完整版即可繼續前進：新的土地、首領與任務。一次購買，無需訂閱。',
    unlock: '以 {price} 解鎖完整版',
    unlockNoPrice: '解鎖完整版',
    noAds: '完整版還會移除所有廣告。',
    ignore: '忽略完整版購買',
    ignoreHint: '用於測試：試玩版的鎖定和廣告會回來。關閉後即可再次使用你的購買。',
    restore: '恢復購買',
    notNow: '暫不',
    pending: '等待核准中。購買一經核准，完整版將立即解鎖。',
    failed: '購買未能完成，請再試一次。',
    restoreNone: '此 Apple 帳號下找不到過往購買紀錄。',
    thanks: '謝謝！完整版已解鎖。',
    locked: '完整版內容',
    working: '正在連接 App Store……'
  },
  wind: {
    title: '重新振作',
    text: '你倒下了。要以 {n}% 的生命值站起來，把這場戰鬥打完嗎？',
    once: '每次造訪限一次。',
    watch: '觀看影片',
    take: '重新站起',
    decline: '不用了'
  },
  purse: {
    offer: '錢袋三倍:+{n}'
  },
  shelf: {
    title: '稀有商品',
    restock: '新商品',
    tomorrow: '明天有新商品'
  },
  rested: {
    hud: '2× 經驗',
    banner: '歡迎回來！你精神飽滿：接下來的戰鬥中有{time}的雙倍經驗。',
    hm: '{h}小時{m}分鐘',
    m: '{m}分鐘',
    h: '{h}小時'
  },
  preset: {
    title: '配置',
    name: '配置 {n}',
    rename: '配置 {n} 的名稱',
    save: '儲存',
    load: '使用',
    saved: '已儲存 {name}。',
    loaded: '已啟用 {name}。',
    skipped: '被略過：{list}'
  },
  respec: {
    title: '忘掉你的修練',
    note: '拿回你花掉的全部 {n} 屬性點，再重新分配。',
    none: '你還沒有可以拿回的點數。',
    free: '忘掉（免費）',
    buy: '忘掉（{n} 金幣）',
    confirm: '確定嗎？再點一次',
    bench: '這些技能會放回架上：{list}',
    done: '好了。點數又是你的了，可以重新分配。'
  },
  contract: {
    title: '委託公告板',
    lead: '每個勢力每天會張貼一項委託。遊玩時就會累計；可在任何城鎮繳交。',
    slay: '擊敗：{enemy}（{place}）',
    clear: '在{place}的探訪中獲勝',
    chests: '在任何地方開寶箱',
    rep: '聲望 +1',
    handIn: '繳交',
    handed: '今日已完成',
    thanks: '{name}向你道謝。'
  },
  rep: {
    title: '聲望',
    meter: '{name}聲望：{n}',
    giftAt: '聲望 +{n} 時的禮物',
    giftClaim: '領取禮物',
    giftTaken: '已領取禮物',
    giftGot: '送你的禮物：300 金幣和{item}。',
    giftGold: '送你的禮物：300 金幣。',
    blessAt: '聲望 +{n} 時的祝福',
    bless: {
      order: '祝福：生命 +5%',
      syndicate: '祝福：擊殺獲得的金幣 +10%',
      circle: '祝福：魔力回復 +10%'
    }
  },
  ladder: {
    tab: '競技場',
    wave: '波',
    week: '本週：{mod}',
    weekBest: '本週最佳：第 {n} 波',
    yourBest: '你的本週最佳：第 {n} 波',
    none: '本週還沒有挑戰紀錄。',
    mod: {
      fire: '全是火焰',
      nopotions: '禁用藥水',
      glass: '玻璃',
      swarm: '蜂擁',
      elites: '菁英遊行',
      haste: '加速'
    },
    modDesc: {
      fire: '敵人的每次攻擊都是火焰',
      nopotions: '沒有藥水',
      glass: '所有人的攻擊力提高 50%',
      swarm: '敵人更多，但各自的生命更少',
      elites: '每一波都有一位冠軍',
      haste: '敵人移動和攻擊都更快'
    }
  },
  forge: {
    upgrade: '升級（{n} 金幣）',
    next: '下一級 +{level}：屬性 +{pct}%',
    town: '任何城鎮的鐵匠都能升級它。'
  },
  ore: {
    'demonglass': { 'name': "惡魔玻璃" },
    'ichor': { 'name': "神話靈液" },
    iron: {
      name: '鐵礦石'
    },
    silver: {
      name: '銀礦石'
    },
    gold: {
      name: '金礦石'
    },
    mithril: {
      name: '秘銀礦石'
    },
    adamant: {
      name: '艾達曼礦石'
    },
    aetherite: {
      name: '以太晶礦石'
    }
  },
  plant: {
    sunpetal: {
      name: '日光瓣',
      desc: '一朵明黃色的花。治療師們對它讚不絕口。'
    },
    glowcap: {
      name: '螢光菇',
      desc: '一種在黑暗中發光的蘑菇。對頭腦有益。'
    },
    swiftfern: {
      name: '疾風蕨',
      desc: '一種輕盈的蕨草。擦在靴子上，跑起來吧。'
    },
    ironmoss: {
      name: '鐵苔',
      desc: '長在石頭上的堅韌苔蘚。能讓皮膚變硬。'
    },
    emberbloom: {
      name: '餘燼花',
      desc: '握在手裡暖暖的花。'
    },
    frostmint: {
      name: '霜薄荷',
      desc: '清涼新鮮的葉子。能讓頭腦清醒。'
    },
    moonbell: {
      name: '月鈴花',
      desc: '一種罕見的蒼白花朵，能讓眼神更敏銳。'
    },
    shadowthorn: {
      name: '影棘',
      desc: '一種罕見的暗色荊棘。很強，還有點邪門。'
    }
  },
  journal: {
    errands: '委託',
    empty: '日誌裡還什麼都沒有。鎮上的人會來請你幫忙。',
    from: '委託人：{npc}',
    ready: '完成！回去找{npc}。',
    taken: '新委託：{title}',
    done: '委託完成：{title}',
    step: {
      slay: '擊敗 {enemy} ×{n}',
      slayAt: '在{place}擊敗 {enemy} ×{n}',
      slayAnyAt: '在{place}擊敗 {n} 個敵人',
      clear: '肅清{place}',
      visit: '前往{place}',
      gather: '採集 {plant} ×{n}',
      bring: '帶來{item}',
      pieces: '找到 {n} 塊藏寶圖碎片',
      dig: '在{place}挖出寶藏',
      talk: '和{npc}交談'
    }
  },
  board: {
    title: '{town}佈告欄',
    read: '查看',
    lead: '今日任務。完成後回這裡交付。',
    kind: {
      slay: '狩獵',
      gather: '草藥',
      escort: '商隊'
    },
    slay: '在{place}擊敗 {enemy} ×{n}',
    gather: '上交 {plant} ×{n}',
    escort: '在通往奧克赫文的路上護衛商隊',
    xp: '+{n} 經驗',
    setOut: '出發',
    thanks: '完成！全鎮向你致謝。'
  },
  escort: {
    start: '護送商隊走到路的盡頭！',
    waiting: '商隊在等你。',
    arrived: '商隊平安抵達！',
    lost: '商隊覆沒了……'
  },
  elixir: {
    might: {
      name: '力量靈藥',
      desc: '五分鐘內傷害 +{n}%'
    },
    iron: {
      name: '鐵膚藥劑',
      desc: '五分鐘內護甲 +{n}%'
    },
    swift: {
      name: '迅捷補劑',
      desc: '五分鐘內移動速度和攻擊速度 +{n}%'
    },
    mind: {
      name: '清心藥湯',
      desc: '五分鐘內技能冷卻加快 {n}%'
    },
    vigor: {
      name: '活力靈藥',
      desc: '五分鐘內每秒恢復 {n}% 生命'
    },
    shadow: {
      name: '渴血藥劑',
      desc: '五分鐘內攻擊按傷害的 {n}% 為你回血'
    }
  },
  alchemy: {
    talk: '草藥放進去，靈藥倒出來。我們來熬哪一種？',
    lead: '每種靈藥在戰鬥中生效五分鐘。用第三個藥瓶來喝。每種最多帶 {n} 瓶。',
    brew: '熬製 · {n}',
    carry: '帶上這個',
    carried: '已裝進藥瓶',
    count: '{n} / {max}',
    herb: '{plant}：{have}/{n}',
    done: '熬好了！',
    why: {
      full: '這種你已經帶滿了。',
      herbs: '草藥不夠。去野外多採一些。',
      gold: '金幣不夠。'
    }
  },
  memory: {
    title: '記憶卡牌攤',
    lead: '在沙子漏完前找出所有配對，就能贏回雙倍賭注。連贏五局，還有一件傳說獎品。',
    bet: '下注 {n}',
    row: '連勝：{n}/{max}',
    pairs: '{n} 對 · {s} 秒',
    won: '全部配對找到了！贏得 {n} 金幣。',
    lost: '沙子漏完了。賭注輸掉了。',
    again: '再玩一次',
    noGold: '金幣不夠下這個注。',
    card: '卡牌 {n}'
  },
  cups: {
    title: '杯子攤',
    lead: '看著寶石，跟住它的杯子，然後選出來。連勝越多贏得越多。第三勝有獎品，第五勝有寶藏。',
    free: '免費一局',
    fee: '開始 · {n}',
    row: '連勝：{n} / {max}',
    next: '下一勝：{n} 金幣',
    watch: '看好寶石！',
    follow: '跟住它……',
    pick: '選一個杯子！',
    hint: '點一下杯子，或按它的數字鍵。',
    won: '找到了！+{n} 金幣',
    lost: '不是這個。連勝重新計算。',
    near: '好可惜！就在旁邊。',
    timeout: '太慢了！連勝重新計算。',
    again: '再來一局',
    noGold: '金幣不夠。明天的第一局免費。',
    cup: '杯子 {n}'
  },
  battle: {
    title: '物品對決',
    lead: '拿你的物品和賭徒的比一比：售價高的得一分，先得兩分者獲勝。不管輸贏，你出的物品都拿不回來。連贏三局，還能得到一件獎品。',
    fee: '入座 · {n}',
    row: '連勝：{n}/{max}',
    needItems: '背包裡至少需要 {n} 件未穿戴的物品。',
    noGold: '金幣不夠付入場費。',
    theirs: '賭徒出的是',
    pick: '選一件物品出牌',
    lay: '就出它',
    value: '{n} 金幣',
    score: '你 {a} · {b} 賭徒',
    roundWon: '你的比較值錢。你得一分！',
    roundLost: '對方的比較值錢。賭徒得一分。',
    won: '你贏了這局！+{n} 經驗',
    lost: '賭徒贏了這局。',
    again: '再玩一次'
  },
  gamble: {
    prize: '獎品：{item}！',
    prizeGold: '這些你都有了，所以改給你 {n} 金幣！'
  },
  errand: {
    farmersFavor: {
      title: '托勒家的狼'
    },
    herbalistFavor: {
      title: '布萊爾的日光瓣'
    },
    collectorFavor: {
      title: '收藏家的月鈴花'
    },
    mirelaFavor: {
      title: '米蕾拉遺失的貨物'
    },
    treasureMap: {
      title: '魯克隊長的藏寶圖'
    },
    windrunnerTest: {
      title: '疾風行者的試煉'
    },
    frostwardenTest: {
      title: '寒霜衛士的試煉'
    },
    lightbringerTest: {
      title: '光明使者的試煉'
    },
    beastcallerTest: {
      title: '喚獸師的試煉'
    }
  }
}
