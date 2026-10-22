// Simplified Chinese locale — mirrors the key shape of en.ts exactly.
export default {
  // ─── Afterplay phase 8: items, materials and capstones ───
  // ─── Afterplay phase 10: the prestige classes ───
  'prestige': { 'toast': { 'wanderer': "一位神秘旅人在要塞等候。" } },
  'relic': {
    'infernal': "{name}·炼狱",
    'set': "与{item}同时装备：",
    'heroicBadge': "英雄{n}",
    'heroic': "英雄{n}：{gold}金币，{glass}恶魔玻璃",
    'heroicIchor': "英雄{n}：{gold}金币，{glass}恶魔玻璃，{ichor}灵液",
    'heroicMax': "所有英雄阶级均已获得。",
    'infernalForge': "炼狱锻造：{gold}金币，{glass}恶魔玻璃",
    'lens': "神谕之镜：{boss}在此等候。",
    'hydraKey': "已封印。九头蛇的火焰钥匙能开启裂隙之心。",
    'marksGlass': "用{marks}枚徽记购买{glass}恶魔玻璃",
    'capstone': "奥义",
    'fortOnly': "此奥义只在堡垒渡口传授。"
  },
  // ─── The fort's fair games (afterplay §9) ───
  'fair': {
    'fee': "游戏 · {n}",
    'again': "再玩一次",
    'noGold': "金币不足。",
    'capped': "距大奖恢复还需清理的区域：{n}",
    'top': "大奖！+{gold} 金币，+{xp} 经验",
    'topGold': "大奖（仅金币）：+{n} 金币",
    'won': "赢了！+{n} 金币",
    'lost': "运气不好，连胜重新开始。",
    'row': "连胜：{n} / {max}",
    'mats': "+{n} 英雄+材料",
    'discount': "铁匠现在给你强化打 {n}% 折扣！"
  },
  'whack': {
    'title': "打小鬼",
    'lead': "30 秒内打中 20 只小鬼。别碰金甲小鬼：打中一只就扣一条命。",
    'hits': "小鬼：{n} / {max}",
    'lives': "生命：{n}",
    'time': "时间：{n} 秒",
    'hint': "点击小鬼，或按 1 到 9。",
    'barrel': "木桶 {n}",
    'timeout': "时间到！",
    'dead': "生命耗尽！"
  },
  'ring': {
    'title': "九头蛇套圈",
    'lead': "按住蓄力，松开投掷。蛇头只有摆到中间附近时才能套中。连续套中，每个头多得一分。",
    'hint': "在桌上按住并松开，或按住空格键。",
    'rings': "剩余圈数：{n}",
    'score': "得分：{n}",
    'hit': "套中！+{n}",
    'miss': "没中！",
    'perfect': "完美一轮！",
    'nothing': "得分 {n}，这次没有奖品。",
    'power': "力量"
  },
  'arm': {
    'title': "掰手腕",
    'lead': "圆环与圆圈重合时点击，把他的手压下去。力量会放宽节拍。连胜三次获得锻造折扣，连胜五次获得英雄+材料。",
    'hint': "点击桌面，或按空格键。",
    'good': "压！",
    'off': "节拍错了！"
  },
  // ─── The Siege of Bastion (afterplay §8) ───
  'siege': {
    'title': "堡垒渡口攻防战",
    'lead': "守住城门十波。每波之间，用攻城徽记修建防御。",
    'story': "大军已到城门。坚持十波：这第一场攻防战不会失败。",
    'bell': "攻城钟声响起！大军正在城门前集结。",
    'mapBell': "攻防战！",
    'start': "敲响钟声",
    'wins': "胜利：{n}",
    'marksBank': "已存攻城徽记：{n}",
    'tier': {
      'normal': "普通",
      'hard': "困难",
      'nightmare': "噩梦"
    },
    'tierDesc': {
      'normal': "敌人比你高一级。",
      'hard': "敌人高3级，生命多30%。",
      'nightmare': "敌人高6级，并有两波神话精英。"
    },
    'locked': {
      'hard': "先赢下一场普通攻防战。",
      'nightmare': "封印裂隙或让它半开之后开放。"
    },
    'lord': "攻城领主",
    'hud': {
      'wave': "第{n}/{total}波",
      'marks': "徽记：{n}",
      'gate': "城门 {pct}%",
      'build': "{s}秒后第{n}波",
      'ready': "准备好了！",
      'buy': "{name}：{n}枚徽记"
    },
    'def': {
      'ballista': {
        'name': "弩车",
        'desc': "每2秒沿自己的通道射出一支穿透弩箭。"
      },
      'cauldron': {
        'name': "火焰大锅",
        'desc': "点燃所在通道的狭窄处。"
      },
      'barricade': {
        'name': "路障",
        'desc': "封锁一条通道20秒。"
      },
      'militia': {
        'name': "民兵",
        'desc': "两名卫兵在你身边作战。"
      },
      'repair': {
        'name': "修理城门",
        'desc': "恢复城门的四分之一。"
      }
    },
    'block': {
      'marks': "攻城徽记不足。",
      'full': "没有位置了。",
      'phase': "只能在两波之间。"
    },
    'toast': {
      'cleared': "守住第{n}波！徽记+{marks}",
      'clearedUnharmed': "守住第{n}波，城门无损！徽记+{marks}",
      'horn': "号角响起！城门只剩{pct}%。",
      'ram': "攻城槌！在它到达城门前拦住它！",
      'rally': "重新站起来了！守住城门！"
    },
    'banner': {
      'wave': "第{n}波",
      'final': "攻城领主！"
    },
    'result': {
      'tier': "堡垒渡口攻防战：{tier}",
      'waves': "守住的波数：{n}/{total}",
      'marks': "保留的攻城徽记：{banked}/{earned}",
      'glass': "恶魔玻璃：+{n}"
    },
    'milestone': {
      'normal1': "达成里程碑：堡垒战旗。",
      'normal5': "达成里程碑：城墙守卫胸甲。",
      'hard1': "达成里程碑：老兵直觉，第五个被动栏位。",
      'hard5': "达成里程碑：破门者。",
      'nightmare1': "达成里程碑：最后堡垒之冠。",
      'hardFlawless': "达成里程碑：隐藏职业试炼的钥匙。"
    }
  },
  // ─── The Breaking (the afterplay's story) ───
  'breaking': {
    'title': "大崩裂",
    'toast': {
      brk6: "锻造大师夺回了他的锻炉。地狱锻造已开放。",
      brk7: "斯芬克斯死了。神谕者的透镜能显示巨兽潜伏之处。",
      brk8: "利维坦死了。它的鳞片让你能在浅水上行走。",
      brk9: "九头蛇死了。它的火焰钥匙归你了。",
      brk10: "上古巨龙死了。裂隙敞开着。",
      sealed: "裂隙已被封印。你成为了“封隙者”。",
      ajar: "裂隙仍留着一道缝。恶魔会来考验城墙和斗技场。",
      'brk2': "堡垒渡口接纳了你。这里的人们如今都指望着你。",
      'rescued': "幸存者获救！他们在堡垒渡口很安全。",
      'brk3': "道路已经畅通。桑福德的人们安全了。",
      'brk4': "草药师加入了要塞。",
      'brk5': "半人马战团被击溃了。要塞正准备迎接围攻。",
    },
  },
  // ─── The intro (#130): its skip, and its narrator's name ───
  intro: {
    narrator: '说书人',
    skip: '跳过',
    holdKey: '按住{key}跳过',
    holdTouch: '按住跳过',
    replay: '观看开场'
  },
  arena: {
    allWon: '所有神话奖品都归你了。',
    call: '故事已经讲完。现在证明你的构筑吧：尽你所能往上爬，赢取别处无人能给你的神话奖品。',
    prize: '{item}归你了！',
    milestone: '第{n}波！',
    next: '下一个奖品在第{at}波：{item}',
    champion: '冠军波',
    wave: '第{n}波'
  },
  sellOre: {
    talk: '好矿石，公道价。你要卖多少？',
    lead: '选择每种矿石要卖几块。按下“出售”前不会卖出任何东西。',
    have: '拥有 {n}',
    each: '每块 {n} 金币',
    none: '不卖',
    all: '全部',
    less: '{ore}减一块',
    more: '{ore}加一块',
    total: '你将获得：{n} 金币',
    sell: '出售',
    selectAll: '全选',
    empty: '你没有可卖的矿石了。'
  },
  smith: {
    why: {
      max: '两件都已拥有，且已锻到顶。',
      gold: '金币不足。',
      ore: '矿石不足。',
      metal: '先开采这种矿石。',
      learn: '得先有铁匠教你。'
    },
    stamp: '锻造',
    take: '收下',
    worked: '{item}已锻至+{n}',
    made: '{item} +{n}',
    grade: {
      perfect: '完美！',
      great: '出色之作！',
      good: '不错之作',
      poor: '粗糙之作'
    },
    hint: '光芒处于热点时，点击“敲”或按空格键。',
    strikes: '第{n}/{max}击',
    strike: '敲！',
    forge: '锻造',
    gold: '{n}金币',
    nuggets: '{ore}：{have}/{n}',
    master: '一记绝佳的敲击能让它成为{item}。',
    locked: '先开采{ore}，才能学会用它打造的物件。',
    lead: '你开采的每种金属都会解锁能用它打造的物件。在光芒最炽热处敲击：三次敲击决定成品。',
    talk: '趁热打铁，铁可不等人。'
  },
  gameName: 'Battlecross',
  cancel: '取消',
  close: '关闭',
  ok: '确定',
  continue: '继续',
  onlyAvailableOn: '本游戏仅在以下平台提供：',
  ui: {
    next: '下一个',
    replay: '重玩',
    back: '返回',
    play: '开始',
    pause: '暂停',
    menu: '菜单',
    home: '主页',
    info: '信息',
    help: '操作说明',
    ok: '知道了',
    continue: '继续'
  },
  hud: {
    level: '{n}级',
    health: '生命 {n}/{max}',
    mana: '法力 {n}/{max}',
    heat: '热量',
    xp: '经验',
    gold: '{n} 金币',
    potion: '生命药水（剩余 {n} 瓶）',
    manaPotion: '法力药水（剩余 {n} 瓶）',
    potionStop: '喝下生命药水以继续',
    groups: '已击败 {n}/{total} 群敌人',
    wave: '第 {n} / {total} 波',
    roll: '翻滚',
    elixir: '{name}（剩余 {n} 瓶）',
    elixirNext: '下一种灵药'
  },
  menu: {
    map: '世界地图',
    character: '英雄',
    skills: '技能',
    inventory: '背包',
    journal: '日志'
  },
  combat: {
    dodge: '闪避',
    block: '格挡',
    immune: '免疫'
  },
  level: {
    mine: '开采',
    open: '打开',
    guarded: '有守卫',
    locked: '已锁住',
    potion: '药水 +1',
    manaPotion: '法力药水 +1',
    leave: '离开',
    chestsLeft: '这里还有 {n} 个宝箱未开'
  },
  status: {
    stun: '眩晕',
    knockup: '击飞',
    knockdown: '击倒',
    stasis: '静滞',
    petrify: '石化',
    frozen: '冰冻',
    fear: '恐惧',
    slow: '减速',
    confuse: '混乱',
    taunt: '被嘲讽',
    armorShred: '破甲',
    weaken: '虚弱',
    vulnerable: '易伤',
    burn: '灼烧',
    poison: '中毒',
    bleed: '流血',
    delayed: '延迟伤害',
    haste: '急速',
    attackSpeed: '攻速提升',
    damageUp: '强化',
    defenseUp: '坚固',
    regen: '再生',
    lifestealUp: '生命偷取',
    invulnerable: '无敌',
    unkillable: '不死',
    stealth: '隐身',
    reflect: '反射',
    envenom: '淬毒之刃',
    exosuit: '外骨骼战甲',
    focus: '专注',
    accelerate: '加速',
    overheat: '过热',
    enrage: '狂怒',
    ambush: '伏击',
    elixirMight: '力量灵药',
    elixirIron: '铁肤',
    elixirSwift: '迅捷',
    elixirMind: '清心',
    elixirVigor: '活力',
    elixirShadow: '渴血之刃',
    chi: '气'
  },
  toast: {
    cageLocked: '锁着。钥匙一定就在这附近某处。',
    cageKey: '一把钥匙！一定能打开笼子。',
    ore: '采到：{n} × {ore}',
    mineBusy: '敌人就在附近！',
    pressureUp: '敌人变得更凶猛了 {skulls}',
    pressureDown: '敌人的攻势缓和了 {skulls}',
    item: '获得：{item}',
    levelUp: '升到 {level} 级！属性点 +3',
    boss: '{boss}出现了',
    wave: '第 {n} 波',
    herb: '采到：{plant}',
    piece: '藏宝图的碎片！'
  },
  coach: {
    move: {
      touch: '点击地面走过去，或使用摇杆。',
      mouse: '点击地面走过去，或用移动键控制方向。'
    },
    target: {
      touch: '点击敌人，或从英雄拖到敌人身上，即可攻击。',
      mouse: '点击敌人即可攻击。'
    },
    skill: {
      touch: '点击技能，对目标使用。',
      mouse: '按下技能键，对目标使用。'
    },
    aim: {
      touch: '把技能拖到场地上瞄准，松手即可施放。',
      mouse: '把技能拖到场地上瞄准，松开即可施放。'
    },
    potion: {
      touch: '点击药水回复生命。',
      mouse: '按下药水键回复生命。'
    },
    mana: {
      touch: '点击蓝色药瓶，回复法力。',
      mouse: '按下法力药水键，回复法力。'
    },
    chest: {
      touch: '点击宝箱即可打开。',
      mouse: '点击宝箱即可打开。'
    },
    talk: {
      touch: '沿着路径找到导师，点击他就能交谈。',
      mouse: '沿着路径找到导师，点击他就能交谈。'
    },
    teach: {
      touch: '点一下“教教我”，看看这位师傅能教你什么。',
      mouse: '点击“教教我”，看看这位师傅能教你什么。'
    },
    learn: {
      touch: '点击一个技能，再点击“学习”。',
      mouse: '点击一个技能，再点击“学习”。'
    },
    slot: {
      touch: '点击新技能，再点击一个栏位，就能带它上战场。',
      mouse: '把新技能拖到栏位上，就能带它上战场。'
    },
    equip: {
      touch: '点击新装备，对比绿色和红色的数字，再点击对应栏位穿上它。',
      mouse: '把新装备拖到对应栏位上穿戴。绿色数字上升，红色数字下降。'
    },
    attr: {
      touch: '点击加号，花掉一点属性点。',
      mouse: '点击加号，花掉一点属性点。'
    },
    travel: {
      touch: '点击地图上的下一个地点，再点击按钮前往。',
      mouse: '点击地图上的下一个地点，再点击按钮前往。'
    },
    buy: {
      touch: '点击物品查看价格，再点击“购买”。',
      mouse: '点击物品查看价格，再点击“购买”。'
    },
    exit: {
      touch: '点击地图按钮，离开城镇踏上下一段冒险。',
      mouse: '点击地图按钮，离开城镇踏上下一段冒险。'
    },
    roll: {
      touch: '点击翻滚按钮，就能躲开危险。翻滚的时候，什么都伤不到你。',
      mouse: '按下翻滚键，就能躲开危险。翻滚的时候，什么都伤不到你。'
    }
  },
  goal: {
    dummy: '打倒训练木桩',
    clear: '清理{place}',
    boss: '击败{foe}',
    exit: '带上战利品离开',
    wave: '撑过所有波次',
    trainer: '找导师谈谈',
    learn: '学会一项技能',
    points: '用掉你的点数',
    leave: '动身去{place}',
    travel: '前往{place}',
    decide: '做出你的选择',
    explore: '探索王国',
    fight: '赢下这场战斗',
    show: '给我指路：{goal}',
    escort: '护送商队'
  },
  node: {
    'bastion': {
      'name': "堡垒渡口",
      'desc': "古老的边境要塞，仍然屹立的最后城墙。幸存者们聚集于此。",
    },
    sunford: {
      name: '桑福德',
      desc: '平原边上的农业小镇。这里有家、一位铁匠和两位导师。'
    },
    plains: {
      name: '桑福德平原',
      desc: '哥布林、野狼和强盗在大路上打劫商队。'
    },
    hollows: {
      name: '哥布林洞窟',
      desc: '山丘下的洞穴。哥布林王在最深处坐镇。'
    },
    arena: {
      name: '斗技场',
      desc: '一波接一波，一波比一波强。你能爬到多高？每周一更新新排行榜。'
    },
    woods: {
      name: '低语森林',
      desc: '会走路的古树，还有在树间结网的蜘蛛。'
    },
    outskirts: {
      name: '奥克黑文郊外',
      desc: '奥克黑文城外的农场在燃烧。军阀的大军已到城门前。'
    },
    oakhaven: {
      name: '奥克黑文',
      desc: '有城墙的贸易小城。它会变成什么样，由你决定。'
    },
    crags: {
      name: '灰烬峭壁',
      desc: '黑色的岩石和熊熊烈火。邪教徒在给火焰添柴。'
    },
    mines: {
      name: '艾恩霍尔德矿井',
      desc: '矮人挖得太深，唤醒了某个会发光的东西。'
    },
    ironhold: {
      name: '艾恩霍尔德',
      desc: '山中的锻造之城。王国最好的钢就在这里打造。'
    },
    tundra: {
      name: '霜噬冻原',
      desc: '白茫茫的荒原，巨人在此行走，死者不肯安息。'
    },
    temple: {
      name: '沉没神殿',
      desc: '被水淹没的娜迦殿堂，还有一位看见所有结局的先知。'
    },
    citadel: {
      name: '虚空城塞',
      desc: '去年这里还没有这座要塞。它的墙在嗡嗡作响。'
    },
    peak: {
      name: '巨龙之巅',
      desc: '双足飞龙在山顶盘旋。上面还睡着一个大得多的家伙。'
    },
    fortress: {
      name: '恐惧要塞',
      desc: '大恶魔的老巢，也是每个阵营都想要的王座所在。'
    },
    rift: {
      name: '虚空裂隙',
      desc: '恶魔就是从这道伤口来的。虚空领主在另一头等着。'
    },
    silverbridge: {
      name: '西尔弗布里奇',
      desc: '建在古老石桥上的大河镇。每个职业的大师都在这里授课。'
    }
  },
  map: {
    title: '王国',
    town: '城镇',
    levels: '{min}–{max}级',
    arenaBest: '最佳：第 {n} 波',
    travel: '前往',
    again: '再来一次',
    enter: '进入',
    fight: '战斗',
    back: '回城',
    locked: '通关相邻区域即可打开道路。',
    lockedArena: '解决哥布林王之后，大门就会打开。',
    lockedRift: '恐惧要塞的王座有了归属后才会开启。',
    invaded: '被侵占',
    invadedDesc: '恶魔占据了这片土地。它们的塔柱会让附近的敌人攻击更猛，裂隙伤痕会灼烧并减速，而在此击败的每个敌人都更有价值。',
    lockedInvaded: '恶魔牢牢占据着这里。先夺回{zone}。',
    danger: {
      '1': '略高于你的等级。',
      '2': '以你的等级来说很危险。',
      '3': '远高于你的等级。'
    },
    questOpen: '{quest}：有个抉择在这里等你。',
    questDone: '{quest}：{choice}',
    trainer: '隐藏导师：{cls}',
    new: '新',
    trueTest: '真正的考验',
    skip: '点击跳过',
    compass: {
      n: '北',
      e: '东',
      s: '南',
      w: '西'
    },
    region: {
      vale: '朝阳草谷',
      hills: '哥布林丘陵',
      peaks: '铁峰山脉',
      ash: '灰烬之地',
      frost: '霜境边疆',
      fields: '金色原野',
      mere: '娜迦沼泽',
      reach: '虚空边境',
      dread: '恐惧之地',
      sea: '蓝宝石海',
      bay: '商人海湾'
    },
    walkTouch: '点击地图走过去，或用摇杆操控',
    walkMouse: '点击地图走过去，或用 WASD 操控'
  },
  encounter: {
    kicker: '途中',
    title: {
      fight: '伏击！',
      elite: '一位冠军拦住了去路！',
      chest: '草丛里有个宝箱！',
      merchant: '流浪商人'
    },
    result: '在{place}附近的路上',
    gold: '+{n} 金币',
    xp: '+{n} 经验'
  },
  travel: {
    to: '正在前往',
    loading: '加载中'
  },
  attr: {
    str: {
      name: '力量',
      short: '力量',
      desc: '近战威力、格挡几率、重甲。'
    },
    dex: {
      name: '敏捷',
      short: '敏捷',
      desc: '暴击、攻击速度和移动速度。'
    },
    int: {
      name: '智力',
      short: '智力',
      desc: '法术强度、法力、元素抗性。'
    },
    end: {
      name: '耐力',
      short: '耐力',
      desc: '生命、回复、护甲、眩晕抗性。'
    },
    skl: {
      name: '技巧',
      short: '技巧',
      desc: '暴击伤害、冷却、远程武器。'
    },
    cha: {
      name: '魅力',
      short: '魅力',
      desc: '随从、商店价格、奖励、对话选项。'
    }
  },
  stat: {
    damage: '伤害',
    health: '生命',
    mana: '法力',
    armor: '护甲',
    resist: '抗性',
    crit: '暴击率',
    critDamage: '暴击伤害',
    attackSpeed: '攻击速度',
    moveSpeed: '移动速度',
    cdr: '冷却缩减',
    block: '格挡',
    dodge: '闪避',
    hpRegen: '生命 / 秒'
  },
  sheet: {
    points: '可用点数：{n}',
    raise: '提升{attr}',
    maxLevel: '已达最高等级',
    next: '下一点：'
  },
  heroChoice: {
    title: '选择你的英雄',
    boy: '扮演男孩',
    girl: '扮演女孩',
    switch: '你的英雄'
  },
  skills: {
    active: '主动技能',
    passive: '被动技能',
    known: '已学会',
    none: '还什么都没学。去城镇里找位导师吧。',
    emptySlot: '空栏位 {n}',
    equip: '装上',
    remove: '卸下',
    unmet: '你已不再满足它的要求。',
    how: '点击技能，再点击栏位，或直接拖过去。把它从栏位拖开即可卸下。',
    howSlot: '现在点击一个栏位，把它放进去。',
    classCount: '{cls}：已学会 {n}/{total}',
    hint: {
      met: '可在{place}向{name}学习。',
      unmet: '{place}的一位导师会教这个。'
    }
  },
  class: {
    // ── The prestige classes (afterplay phase 10) ──
    'demonhunter': { 'name': "猎魔人", 'desc': "暗影与圣光，誓追同一猎物。标记恶魔，被标记者迅速倒下。" },
    'dragoon': { 'name': "龙骑兵", 'desc': "靴下生风，臂挽盾牌。自天而降，一枪贯穿整列敌人。" },
    'hexsmith': { 'name': "咒铁匠", 'desc': "以鲜血滋养的以太工艺。建造炮塔吸取敌人生命，治疗铁匠。" },
    'tidecaller': { 'name': "唤潮者", 'desc': "冰霜与元素倾入大海。巨浪击退并浸透敌人。" },
    aegis: {
      name: '神盾骑士',
      desc: '盾牌与神圣之钢。把攻击都扛下来，让别人不用挨打。'
    },
    shadow: {
      name: '影刃',
      desc: '从黑暗中现身，背后一击，随即消失。'
    },
    pyro: {
      name: '炎术师',
      desc: '火焰能回答一切问题。先点燃，再引爆。'
    },
    sovereign: {
      name: '大君主',
      desc: '何必独自战斗？召唤卫兵，指挥他们。'
    },
    chrono: {
      name: '织时者',
      desc: '把敌人定在时间里，给队友加速，还能撤销失误。'
    },
    blood: {
      name: '鲜血炼金师',
      desc: '用生命换取力量，再从敌人身上喝回来。'
    },
    aether: {
      name: '以太技师',
      desc: '枪械、炮塔和热量槽。在技能被锁之前把热量排掉。'
    },
    geo: {
      name: '地术师',
      desc: '升起石墙和尖刺，连大地本身也能打碎。'
    },
    windrunner: {
      name: '疾风行者',
      desc: '一把弓，背后有风。射击、冲刺，永不停下。'
    },
    frostwarden: {
      name: '寒霜卫士',
      desc: '冰之刃，冷之心。减速他们，冻住他们，再把他们击碎。'
    },
    lightbringer: {
      name: '光明使者',
      desc: '治愈朋友、致盲敌人的光。站在光里，没有什么能阻挡你。'
    },
    beastcaller: {
      name: '唤兽师',
      desc: '狼群、巨熊和猎鹰在你身边战斗。召唤它们，指挥它们。'
    },
    elementalist: {
      name: '元素使',
      desc: '火、冰、雷、石。把它们混合，一个会引发下一个。'
    },
    soulwarden: {
      name: '灵魂守望者',
      desc: '被击败的敌人化作友好的灵魂，在你身边战斗，然后回家安息。'
    },
    ironmonk: {
      name: '钢铁武僧',
      desc: '赤手空拳，脚步如飞。每次出击都积攒气，全部用在一记强力重击上。'
    },
    bard: {
      name: '吟游诗人',
      desc: '歌声鼓舞己方，曲调让对手入睡或自相残杀。'
    }
  },
  skill: {
    // ── The prestige classes (afterplay phase 10) ──
    'huntersMark': { 'name': "猎人印记", 'desc': "一发圣光弩矢，造成{dmg}%敏捷伤害。{dur}秒内目标受到的伤害提高{vuln}%，恶魔提高{demon}%。" },
    'demonsBane': { 'name': "恶魔克星", 'desc': "对恶魔的伤害+{bane}%，受到恶魔的伤害降低{ward}%。" },
    'silverVolley': { 'name': "白银齐射", 'desc': "沿直线射出白银弩矢：{dmg}%敏捷伤害，对恶魔和被标记的敌人+{bane}%。" },
    'skyfallLeap': { 'name': "天坠跃击", 'desc': "跃至够不着的高处{air}秒，再原地坠下：{radius}米内造成{dmg}%力量伤害，击倒敌人。" },
    'dragonBlood': { 'name': "龙之血", 'desc': "对首领的伤害+{boss}%，最大生命+{hp}%，且不会被击退。" },
    'dragonLance': { 'name': "龙枪", 'desc': "沿直线一记枪刺：对线上每个敌人造成{dmg}%敏捷伤害。" },
    'hexTurret': { 'name': "咒术炮塔", 'desc': "建造一座炮塔，持续{dur}秒。每秒吸取{radius}米内最近的敌人，造成{dmg}%技巧伤害；你回复其中的{drain}%。" },
    'soulForge': { 'name': "灵魂熔炉", 'desc': "最大生命+{hp}%，每秒回复{regen}生命，受到的伤害降低{reduce}%。" },
    'hexBolt': { 'name': "咒术弩矢", 'desc': "支付{hp}%生命：一发造成{dmg}%技巧伤害的弩矢。你回复其中的{heal}%，敌人在{dur}秒内造成的伤害降低{weak}%。" },
    'tidalWave': { 'name': "潮汐巨浪", 'desc': "沿直线掀起巨浪：{dmg}%智力伤害，敌人被击退并浸透（{dur}秒内减速{slow}%）。" },
    'seaborn': { 'name': "海之子", 'desc': "对受寒的敌人伤害+{bonus}%，受到的伤害降低{reduce}%，移动速度+{move}%。" },
    'undertow': { 'name': "暗流", 'desc': "持续{dur}秒的漩涡：在{radius}米内共造成{dmg}%智力伤害。将敌人卷入并减速{slow}%。" },
    'bastionWall': { 'name': "堡垒之墙", 'desc': "{dur}秒内，{radius} m内所有敌人都必须攻击你，你受到的伤害降低{def}%。之后圣光造成{dmg}%力量+{back}%所受打击的伤害。" },
    'thousandCuts': { 'name': "千刃", 'desc': "在{radius} m内的敌人之间穿梭，出手{hits}次，每次造成{dmg}%敏捷伤害。首领只会受到一击。挥砍期间无法被击中。" },
    'cinderSun': { 'name': "余烬之日", 'desc': "一颗垂死的太阳在{dur}秒内崩碎：{meteors}块燃烧的碎片，每块造成{dmg}%智力伤害。" },
    'royalLegion': { 'name': "皇家军团", 'desc': "召唤军团{dur}秒：{archers}名弓手、{guards}名卫兵和{mages}名战斗法师。" },
    'stoppedHour': { 'name': "停滞之时", 'desc': "让{radius} m内的时间停止{dur}秒。时间恢复时，每个敌人受到{dmg}%智力伤害。" },
    'redCovenant': { 'name': "血红盟约", 'desc': "夺取{radius} m内每个敌人{pct}%的生命。你恢复其中的{heal}%。" },
    'orbitalLance': { 'name': "轨道之枪", 'desc': "一柄来自天空的光之枪灼烧你瞄准之处：{dur}秒内造成{dmg}%技巧伤害。" },
    'tectonicHeart': { 'name': "地脉之心", 'desc': "大地之心裂开：对附近一切造成{dmg}%力量伤害，碎石减速{dur}秒。" },
    'eyeOfTheGale': { 'name': "风暴之眼", 'desc': "持续{dur}秒的箭雨风暴：共{dmg}%技巧伤害，并减速{slow}%。" },
    'endlessWinter': { 'name': "无尽寒冬", 'desc': "无尽的寒冬从你身上爆发：{radius} m内造成{dmg}%智力伤害，冻结所有敌人{freeze}秒。" },
    'dawnbreak': { 'name': "破晓", 'desc': "化身黎明{dur}秒：每秒对{radius} m内造成{dmg}%智力伤害，并恢复{heal}%生命。" },
    'alphasCall': { 'name': "头狼之唤", 'desc': "{wolves}匹狼响应召唤，与你同奔{dur}秒。整个狼群伤害+{dmg}%，移速提高{move}%。" },
    'prismStorm': { 'name': "棱光风暴", 'desc': "{dur}秒内四大元素肆虐：{strikes}次{dmg}%智力打击，彼此引发。" },
    'ferryman': { 'name': "摆渡人", 'desc': "{dur}秒内，在你附近倒下的每个敌人都会化为你的灵魂起身，灵魂伤害提高{atk}%。" },
    'unmovingMountain': { 'name': "不动之山", 'desc': "耗尽全部气：一座山压下，造成{dmg}%敏捷伤害，每点气+{per}%，并击倒敌人。" },
    'encore': { 'name': "安可", 'desc': "再来一次，持续{dur}秒（速度、伤害、防御+{buff}%），然后是最后一个和弦：{dmg}%魅力，敌人被魅惑。" },
    kind: {
      active: '主动',
      passive: '被动'
    },
    cooldown: '冷却 {n}秒',
    mana: '{n} 法力',
    hpCost: '{n}% 生命',
    heat: '+{n} 热量',
    aimed: '拖动瞄准',
    shieldSlam: {
      name: '盾牌猛击',
      desc: '猛击目标，造成{dmg}%力量伤害，并使其眩晕{stun}秒。'
    },
    aegisAura: {
      name: '神盾光环',
      desc: '护甲+{armor}%，受到的物理伤害降低{reduce}%。'
    },
    radiantStrike: {
      name: '光辉打击',
      desc: '神圣一击，造成{dmg}%力量伤害，并按所造成伤害的{heal}%治疗你。'
    },
    fortitude: {
      name: '坚毅',
      desc: '单次受到超过生命{hit}%的伤害时，获得相当于生命{shield}%的护盾，持续{dur}秒。每{icd}秒一次。'
    },
    tauntingCry: {
      name: '嘲讽怒吼',
      desc: '{radius} m内的敌人在{dur}秒内攻击你。期间你获得{def}%防御。'
    },
    holyBastion: {
      name: '神圣壁垒',
      desc: '无敌{dur}秒。攻击者会被反弹自身伤害的{reflect}%。'
    },
    shadowstep: {
      name: '暗影步',
      desc: '出现在目标身后并背刺，造成{dmg}%敏捷伤害。'
    },
    lethality: {
      name: '致命',
      desc: '暴击率+{crit}%，暴击伤害+{critDmg}%。'
    },
    venomousBlade: {
      name: '剧毒之刃',
      desc: '{dur}秒内你的攻击会使敌人中毒，在{over}秒内造成{poison}%敏捷伤害，可叠加{stacks}次。'
    },
    evasion: {
      name: '闪躲',
      desc: '闪避+{dodge}%。闪避成功后获得{haste}%急速，持续{dur}秒。'
    },
    smokeBomb: {
      name: '烟雾弹',
      desc: '隐身{dur}秒。隐身中的下一次攻击伤害+{bonus}%。'
    },
    danceOfBlades: {
      name: '刀锋之舞',
      desc: '在{radius} m内的敌人之间冲刺，攻击{hits}次，每次造成{dmg}%敏捷伤害。首领只会受到一击。起舞时你不会被击中。'
    },
    fireball: {
      name: '火球术',
      desc: '火球炸开，造成{dmg}%智力伤害，并在{burnDur}秒内再灼烧{burn}%。'
    },
    cauterize: {
      name: '烧灼',
      desc: '被灼烧的敌人对你造成的伤害降低{reduce}%。'
    },
    flamePillar: {
      name: '烈焰之柱',
      desc: '在瞄准处喷出火柱：{dur}秒内造成{dmg}%智力伤害。被卷入的敌人会被击飞。'
    },
    pyromaniac: {
      name: '纵火狂',
      desc: '法术暴击命中时，火系技能的冷却减少{cut}秒。'
    },
    combustion: {
      name: '爆燃',
      desc: '引爆{radius} m内的所有灼烧：每个灼烧立刻以爆炸造成其剩余伤害的{pct}%。'
    },
    cataclysm: {
      name: '天灾',
      desc: '在{dur}秒内召唤{meteors}颗陨石。每颗造成{dmg}%智力伤害。'
    },
    royalGuard: {
      name: '皇家卫兵',
      desc: '召唤一名卫兵在你身边战斗，每击造成{dmg}%魅力伤害。最多同时{max}名。'
    },
    inspiringPresence: {
      name: '鼓舞之姿',
      desc: '你的随从攻击加快{speed}%，生命提高{hp}%。'
    },
    commandFocus: {
      name: '集火号令',
      desc: '所有随从冲向目标：移动速度+{move}%，攻击速度+{atk}%，持续{dur}秒。'
    },
    sovereignsTribute: {
      name: '君主的贡品',
      desc: '你受到的伤害有{share}%转给随从承担。'
    },
    bannerOfVictory: {
      name: '胜利战旗',
      desc: '插下战旗，持续{dur}秒。附近的友军伤害+{dmg}%，每秒回复{regen}%生命。'
    },
    armyOfTheRealm: {
      name: '王国大军',
      desc: '召唤{archers}名弓箭手、{guards}名卫兵和一名战斗法师，持续{dur}秒。'
    },
    temporalStasis: {
      name: '时间静滞',
      desc: '把目标冻结在时间里{dur}秒。它无法行动，也不会受伤。'
    },
    hasteField: {
      name: '急速领域',
      desc: '{dur}秒内，你和附近友军移动加快{move}%，攻击加快{speed}%。'
    },
    timeDistort: {
      name: '时间扭曲',
      desc: '你受到的伤害有{share}%被延后，改为在{over}秒内分摊。'
    },
    paradoxShift: {
      name: '悖论换位',
      desc: '与目标交换位置。它受到{dmg}%智力伤害，周围的敌人混乱{confuse}秒。'
    },
    entropy: {
      name: '熵',
      desc: '每次施法使你的冷却缩短{cdr}%，可叠加{stacks}次。'
    },
    chronoRewind: {
      name: '时光倒流',
      desc: '回到{back}秒前所在的位置，并恢复当时的生命和法力。'
    },
    sanguineFlask: {
      name: '鲜血药瓶',
      desc: '扔出一瓶自己的血：范围内造成{dmg}%耐力伤害，并破甲{shred}%，持续{shredDur}秒。'
    },
    bloodTransmutation: {
      name: '血液转化',
      desc: '你受到的物理伤害有{share}%转化为法力返还。'
    },
    essenceHarvest: {
      name: '精华收割',
      desc: '吸取{radius} m内的所有敌人，造成{dmg}%智力伤害。你回复其中的{heal}%。'
    },
    hemophilia: {
      name: '嗜血症',
      desc: '生命汲取增强{drain}%。命中流血的敌人会回复你{heal}%的生命。'
    },
    mutagenicRage: {
      name: '变异狂怒',
      desc: '{dur}秒内：攻击速度+{speed}%，生命偷取+{steal}%，移动速度+{move}%。'
    },
    philosophersCrucible: {
      name: '贤者坩埚',
      desc: '制造一池沸腾的血，持续{dur}秒：对其中的敌人造成{dmg}%智力伤害，你站在里面时会回复生命。'
    },
    aetherPistol: {
      name: '以太手枪',
      desc: '快速射击，造成{dmg}%技巧伤害。积累{heat}点热量。'
    },
    deployTurret: {
      name: '部署炮塔',
      desc: '放置一座炮塔，每发造成{dmg}%技巧伤害，持续{dur}秒。最多同时{max}座。'
    },
    ventHeat: {
      name: '排放热量',
      desc: '把全部热量呈扇形喷出：最多造成{dmg}%技巧伤害，热量越多伤害越高。'
    },
    thermalOverload: {
      name: '热能过载',
      desc: '过热时你的射击暴击伤害+{crit}%。过热仍会锁住技能{lock}秒。'
    },
    orbitalBeam: {
      name: '轨道光束',
      desc: '从天而降的光束灼烧瞄准处：{dur}秒内造成{dmg}%技巧伤害。'
    },
    exoSuit: {
      name: '外骨骼战甲',
      desc: '{dur}秒内：护甲+{armor}%，你的攻击变成火箭，在范围内造成{rocket}%技巧伤害。'
    },
    stoneSpike: {
      name: '岩石尖刺',
      desc: '尖刺从目标脚下刺出：造成{dmg}%力量伤害，并减速{slow}%，持续{dur}秒。'
    },
    earthBarrier: {
      name: '大地屏障',
      desc: '升起一道岩墙，持续{dur}秒。谁也走不过去，也射不穿它。'
    },
    seismicShock: {
      name: '地震冲击',
      desc: '猛击地面：对{radius} m内造成{dmg}%力量伤害，并击倒敌人{down}秒。'
    },
    earthenSkin: {
      name: '大地之肤',
      desc: '获得相当于力量{armor}%的护甲。你受到的眩晕缩短{cut}%。'
    },
    petrify: {
      name: '石化术',
      desc: '把目标变成石头{dur}秒。它破石而出时受到的伤害提高{vuln}%。'
    },
    tectonicRupture: {
      name: '地壳撕裂',
      desc: '撕开战场：对附近的一切造成{dmg}%力量伤害，碎石会减速{dur}秒。'
    },
    scales: '随{attr}提升',
    shieldThrow: {
      name: '盾牌投掷',
      desc: '你的盾牌在{bounces}个敌人间弹跳，每个造成{dmg}%力量伤害。它们的伤害降低{weak}%，持续{dur}秒。'
    },
    shieldShove: {
      name: '盾牌推撞',
      desc: '推开你面前的所有敌人，造成{dmg}%力量伤害。它们被击退，正在做的事也被打断。'
    },
    holyChains: {
      name: '神圣锁链',
      desc: '光之锁链把{radius} m内的所有敌人拉到你身边：造成{dmg}%耐力伤害，并减速{slow}%。'
    },
    bulwark: {
      name: '铜墙铁壁',
      desc: '+{block}%格挡几率。每次格挡对攻击者反弹{back}点伤害。'
    },
    retribution: {
      name: '惩戒',
      desc: '{dur}秒内，{radius} m内的敌人必须攻击你。之后圣光造成{dmg}%力量伤害，外加所受伤害的{back}%。'
    },
    unbreakable: {
      name: '坚不可摧',
      desc: '生命低于{hp}%时，你受到的伤害降低{reduce}%。'
    },
    starFan: {
      name: '星镖扇',
      desc: '呈扇形掷出{stars}枚暗影星镖，每枚造成{dmg}%敏捷伤害。'
    },
    grapplingHook: {
      name: '钩爪',
      desc: '把目标拉到你身边，造成{dmg}%敏捷伤害，并减速{slow}%，持续{dur}秒。大型敌人会把你拉过去。'
    },
    silentStrike: {
      name: '无声一击',
      desc: '背刺伤害+{backstab}%，敌人发现你的时间推迟{notice}%。'
    },
    shadowMark: {
      name: '暗影印记',
      desc: '目标在{dur}秒内受到的伤害提高{vuln}%，你对任何人的下一击必定暴击，伤害+{bonus}%。'
    },
    bladeRhythm: {
      name: '刀锋韵律',
      desc: '暴击使所有冷却减少{cut}秒。攻击速度+{speed}%。'
    },
    nightshadeMist: {
      name: '颠茄毒雾',
      desc: '释放毒雾，持续{dur}秒：最多造成{dmg}%敏捷伤害。困在其中的敌人混乱{confuse}秒。'
    },
    firecracker: {
      name: '爆竹',
      desc: '在目标身上贴一个爆竹。{delay}秒后炸开，造成{dmg}%智力伤害，并点燃附近的一切。'
    },
    fanTheFlames: {
      name: '煽风点火',
      desc: '{radius} m内的所有灼烧增强{pct}%并重新开始。{push} m内的敌人被吹飞。'
    },
    ringOfFire: {
      name: '火焰之环',
      desc: '升起一圈火焰，持续{dur}秒：最多造成{dmg}%智力伤害。圈内的敌人减速{slow}%。'
    },
    everflame: {
      name: '永恒之火',
      desc: '你的灼烧增强{burn}%，法术暴击率+{crit}%。'
    },
    wildfire: {
      name: '野火',
      desc: '灼烧中的敌人被击败时，火焰会蔓延到{radius} m内的所有敌人，持续{dur}秒。'
    },
    phoenixFlight: {
      name: '凤凰飞翔',
      desc: '化作凤凰飞行，留下火焰轨迹：在落点造成{dmg}%智力伤害。{dur}秒内每秒回复{regen}%生命。'
    },
    callArchers: {
      name: '召唤弓箭手',
      desc: '召唤一名弓箭手在你身后射击，造成{dmg}%魅力伤害。最多同时{max}名。'
    },
    royalRally: {
      name: '王者集结',
      desc: '你的随从冲到你身边，回复{heal}%生命。你们全体防御+{def}%，持续{dur}秒。'
    },
    warMarshal: {
      name: '战争元帅',
      desc: '你的随从造成的伤害提高{dmg}%。'
    },
    royalDecree: {
      name: '王室诏令',
      desc: '{radius} m内的敌人必须鞠躬：眩晕{stun}秒，然后在{dur}秒内受到的伤害提高{vuln}%。'
    },
    loyalHearts: {
      name: '忠诚之心',
      desc: '每当你的一名随从倒下，你回复{heal}%生命。'
    },
    summonChampion: {
      name: '召唤勇士',
      desc: '召唤王国的勇士，持续{dur}秒：一名巨人骑士，拥有你{hp}%的生命，每击造成{dmg}%魅力伤害。'
    },
    echoBolt: {
      name: '回响飞弹',
      desc: '一道时间飞弹，造成{dmg}%智力伤害。{delay}秒后再次命中，造成{echo}%伤害。'
    },
    foresight: {
      name: '预见',
      desc: '你能提前一瞬看到攻击：闪避+{dodge}%，冷却缩短{cdr}%。'
    },
    timeBubble: {
      name: '时间泡泡',
      desc: '制造一个慢时间泡泡，持续{dur}秒：其中的敌人移动减慢{slow}%，并受到{dmg}%智力伤害。'
    },
    timeLoop: {
      name: '时间循环',
      desc: '{dur}秒后，目标被拉回原来的位置：造成{dmg}%智力伤害，外加它这段时间所失生命的{echo}%。'
    },
    frozenMoment: {
      name: '凝固瞬间',
      desc: '你的攻击有{chance}%几率把敌人冻结在时间里{dur}秒。'
    },
    timeStop: {
      name: '时间停止',
      desc: '让{radius} m内的时间停止{dur}秒。时间恢复时，每个敌人受到{dmg}%智力伤害。'
    },
    essenceWard: {
      name: '精华结界',
      desc: '把{hp}%的生命化作价值其{shield}%的发光结界，持续{dur}秒。'
    },
    vitalReserve: {
      name: '生命储备',
      desc: '最大生命+{hp}%，每秒回复{regen}点生命。'
    },
    enfeeblingTonic: {
      name: '虚弱药剂',
      desc: '扔出一瓶药剂：在范围内造成{dmg}%智力伤害。被击中的敌人造成的伤害降低{weak}%，持续{dur}秒。'
    },
    homunculus: {
      name: '人造小人',
      desc: '用{hp}%的生命炼出一个冒泡的小帮手，持续{dur}秒。炼制新的会返还旧帮手{back}%的生命。'
    },
    adrenalCatalyst: {
      name: '肾上腺催化',
      desc: '生命越低，伤害越高：生命在{low}%或以下时最多+{dmg}%。'
    },
    grandTransmutation: {
      name: '大嬗变',
      desc: '把{radius} m内敌人{pct}%的生命化为精华。你回复其中的{heal}%。'
    },
    rocketJump: {
      name: '火箭跳',
      desc: '腾空而起，落在瞄准处：对{radius} m内造成{dmg}%技巧伤害。积累{heat}点热量。'
    },
    coolantLoop: {
      name: '冷却循环',
      desc: '热量消散加快{cool}%，技能积累的热量减少{cut}%。'
    },
    shockGrenade: {
      name: '电击手雷',
      desc: '投出一枚手雷：对{radius} m内造成{dmg}%技巧伤害，并眩晕{stun}秒。积累{heat}点热量。'
    },
    precisionOptics: {
      name: '精密瞄具',
      desc: '+{crit}%暴击率。你的射击可额外穿透{pierce}个敌人。'
    },
    arcCoil: {
      name: '电弧线圈',
      desc: '闪电击中目标，再跳向{jumps}个敌人：每个造成{dmg}%技巧伤害。积累{heat}点热量。'
    },
    thermalPlating: {
      name: '隔热装甲',
      desc: '热量达到{heat}或以上时，你受到的伤害降低{reduce}%。'
    },
    boulderRoll: {
      name: '滚石',
      desc: '向前滚出一块巨石：对路径上的一切造成{dmg}%力量伤害，并击倒{down}秒。'
    },
    bedrock: {
      name: '基岩',
      desc: '任何东西都无法把你击退、击倒或击飞。最大生命+{hp}%。'
    },
    sinkhole: {
      name: '天坑',
      desc: '地面下陷，把敌人吸入{dur}秒，然后坍塌：造成{dmg}%力量伤害。'
    },
    mountainBreaker: {
      name: '裂山',
      desc: '对首领的伤害+{boss}%，护甲+{armor}%。'
    },
    geodeShell: {
      name: '晶洞之壳',
      desc: '水晶外壳在{dur}秒内吸收相当于生命{shield}%的伤害，然后爆裂，最多造成{dmg}%力量伤害。'
    },
    crumble: {
      name: '崩解',
      desc: '你对被减速、被击倒或被石化的敌人造成的伤害提高{dmg}%。'
    },
    galeArrow: {
      name: '疾风箭',
      desc: '乘风而行的一箭：造成{dmg}%敏捷伤害，并击退目标。'
    },
    fleetfoot: {
      name: '飞毛腿',
      desc: '移动速度+{move}%，闪避+{dodge}%。'
    },
    zephyrDash: {
      name: '和风冲刺',
      desc: '向瞄准方向冲刺最多{dist} m，之后{dur}秒内奔跑加快{move}%。'
    },
    piercingGale: {
      name: '穿透狂风',
      desc: '一箭贯穿直线上的所有敌人：造成{dmg}%敏捷伤害，并减速{slow}%，持续{dur}秒。'
    },
    cycloneSnare: {
      name: '旋风陷阱',
      desc: '旋风持续{dur}秒，把敌人拉向风眼，造成{dmg}%技巧伤害。'
    },
    keenEye: {
      name: '鹰眼',
      desc: '暴击伤害+{critDmg}%。你的射击可额外穿透{pierce}个敌人。'
    },
    updraftLeap: {
      name: '上升气流跃',
      desc: '一阵风把{radius} m内的敌人掀上天，造成{dmg}%敏捷伤害。你向后跃开{leap} m。'
    },
    swiftDraw: {
      name: '快速拉弓',
      desc: '攻击加快{speed}%，冷却缩短{cdr}%。'
    },
    arrowStorm: {
      name: '箭雨风暴',
      desc: '箭雨覆盖区域{dur}秒：共造成{dmg}%技巧伤害，并减速{slow}%。'
    },
    galeSpirits: {
      name: '疾风之灵',
      desc: '风之灵伴你飞行{dur}秒，射出{shots}支箭，每支造成{dmg}%技巧伤害。移动速度+{move}%。'
    },
    skyHunter: {
      name: '天空猎手',
      desc: '对首领的伤害+{boss}%，暴击率+{crit}%。'
    },
    skyrender: {
      name: '裂空箭',
      desc: '风暴之箭撕开一条路：对直线上所有敌人造成{dmg}%敏捷伤害，并把它们掀飞到一旁。'
    },
    frostCleave: {
      name: '冰霜劈砍',
      desc: '向前横扫冰刃：造成{dmg}%力量伤害，并减速{slow}%，持续{dur}秒。'
    },
    rimeLance: {
      name: '白霜长枪',
      desc: '掷出冰枪，造成{dmg}%智力伤害，并减速{slow}%，持续{dur}秒。'
    },
    wintersBite: {
      name: '寒冬之咬',
      desc: '你的攻击使敌人减速{slow}%，持续{dur}秒。'
    },
    frostArmor: {
      name: '冰霜护甲',
      desc: '冰甲吸收相当于{shield}%智力的伤害，持续{dur}秒。身边的敌人减速{slow}%。'
    },
    glacialCharge: {
      name: '冰川冲锋',
      desc: '冲向目标，造成{dmg}%力量伤害，并冰冻{freeze}秒。'
    },
    frozenHeart: {
      name: '冰封之心',
      desc: '最大生命+{hp}%，受到的所有伤害降低{reduce}%。'
    },
    rimeField: {
      name: '白霜之地',
      desc: '冰冻地面持续{dur}秒：造成{dmg}%智力伤害。其中被减速的敌人会冰冻{freeze}秒。'
    },
    frostShatter: {
      name: '冰霜碎裂',
      desc: '对{radius} m内造成{dmg}%力量伤害：对减速的敌人+{chilled}%，对冰冻的敌人+{frozen}%。'
    },
    shatterpoint: {
      name: '碎裂点',
      desc: '你对减速和冰冻的敌人多造成{bonus}%伤害。'
    },
    avalancheLeap: {
      name: '雪崩跃击',
      desc: '跃向瞄准处，像雪崩一样落地：造成{dmg}%力量伤害，并击倒敌人。'
    },
    iceborn: {
      name: '生于寒冰',
      desc: '任何东西都无法击退或击飞你。你受到的眩晕缩短{cut}%。'
    },
    absoluteZero: {
      name: '绝对零度',
      desc: '寒冬从你身上爆发：对{radius} m内造成{dmg}%智力伤害，并冰冻所有敌人{freeze}秒。'
    },
    sunbolt: {
      name: '日光弹',
      desc: '一道阳光，造成{dmg}%智力伤害。被晃花眼的目标{dur}秒内伤害降低{weaken}%。'
    },
    mendingLight: {
      name: '治愈之光',
      desc: '立即回复相当于{heal}%魅力的生命，之后{dur}秒内每秒回复{regen}%生命。'
    },
    kindledHope: {
      name: '点燃希望',
      desc: '你受到的所有治疗效果增强{heal}%。'
    },
    lanceOfLight: {
      name: '光之长枪',
      desc: '一道光束：对直线造成{dmg}%智力伤害。每命中一个敌人回复{heal}%生命。'
    },
    dawnShield: {
      name: '黎明之盾',
      desc: '清除你身上所有负面效果，并获得相当于{shield}%魅力的护盾，持续{dur}秒。'
    },
    haloWard: {
      name: '光环守护',
      desc: '你受到的所有伤害降低{reduce}%。'
    },
    dawnSanctuary: {
      name: '黎明圣域',
      desc: '圣地持续{dur}秒：每秒为你回复相当于{heal}%魅力的生命，敌人受到{dmg}%智力伤害。'
    },
    blindingFlash: {
      name: '致盲闪光',
      desc: '一道闪光：{radius} m内的敌人逃跑{fear}秒，并在{dur}秒内伤害降低{weaken}%。'
    },
    guardianLight: {
      name: '守护之光',
      desc: '本会击败你的一击会让你剩下1点生命，并无敌{dur}秒。每{icd}秒一次。'
    },
    sunfall: {
      name: '落日',
      desc: '一道日光之柱落在目标上：造成{dmg}%智力伤害。敌人{dur}秒内受到的伤害增加{vuln}%。'
    },
    searingLight: {
      name: '灼目之光',
      desc: '法术暴击率+{crit}%，暴击伤害+{critDmg}%。'
    },
    haloOfDawn: {
      name: '黎明光环',
      desc: '闪耀{dur}秒：每秒对{radius} m内造成{dmg}%智力伤害，并回复{heal}%生命。'
    },
    callWolf: {
      name: '召唤狼',
      desc: '一只灵狼加入你，撕咬造成{dmg}%魅力伤害。最多同时{max}只。'
    },
    wolfPounce: {
      name: '群狼扑击',
      desc: '你的狼扑向目标：每只造成{dmg}%魅力伤害，并将其击倒{down}秒。'
    },
    wildKinship: {
      name: '野性亲缘',
      desc: '你的伙伴生命提高{hp}%，伤害提高{dmg}%。'
    },
    callHawk: {
      name: '召唤猎鹰',
      desc: '猎鹰俯冲目标，造成{dmg}%魅力伤害：目标{dur}秒内受到的伤害增加{vuln}%。停留{life}秒。'
    },
    callBear: {
      name: '召唤熊',
      desc: '一头灵熊加入你。它造成{dmg}%伤害，并缠住敌人。最多{max}头。'
    },
    thickHide: {
      name: '厚皮',
      desc: '最大生命+{hp}%，每秒生命回复+{regen}。'
    },
    packBond: {
      name: '兽群羁绊',
      desc: '你和{radius} m内的伙伴每秒回复{regen}%生命，并获得{def}%防御，持续{dur}秒。'
    },
    spiritStampede: {
      name: '灵兽奔腾',
      desc: '一群灵兽冲锋：对直线造成{dmg}%魅力伤害，并击倒敌人。'
    },
    packTactics: {
      name: '兽群战术',
      desc: '身边每有一个伙伴，你的伤害提高{bonus}%，最多{max}个。'
    },
    alphaHowl: {
      name: '头狼长嚎',
      desc: '你的伙伴回复{heal}%生命，{dur}秒内战斗力提高{rage}%。你身边的敌人会逃跑。'
    },
    leaderOfThePack: {
      name: '兽群之首',
      desc: '你的伙伴攻击加快{speed}%，伤害提高{dmg}%。'
    },
    wildHunt: {
      name: '狂野狩猎',
      desc: '又有{wolves}只狼与你同奔{dur}秒。整个兽群伤害+{dmg}%，移动加快{move}%。'
    },
    prismBolt: {
      name: '棱光弹',
      desc: '一发法弹，造成{dmg}%智力伤害：目标灼烧时为冰霜，否则为火焰。两者会互相引发反应。'
    },
    elementalHarmony: {
      name: '元素和谐',
      desc: '你的反应（融化、蒸汽、碎裂、超载、结晶）增强{pct}%。'
    },
    frostLance: {
      name: '冰霜长矛',
      desc: '冰贯穿一条直线：造成{dmg}%智力伤害，并减速{slow}%，持续{dur}秒。灼烧的敌人产生蒸汽。'
    },
    chainSpark: {
      name: '连锁电火',
      desc: '闪电造成{dmg}%智力伤害，并跳向另外{jumps}个敌人。使冰碎裂，使火超载。'
    },
    smolderingCore: {
      name: '闷燃之核',
      desc: '你的灼烧伤害提高{burn}%，法力上限+{mana}。'
    },
    rollingBoulder: {
      name: '滚石',
      desc: '巨石滚出：造成{dmg}%智力伤害，击倒{down}秒。被标记的敌人会给你护盾。'
    },
    thunderSnow: {
      name: '雷雪',
      desc: '暴风雪持续{dur}秒：造成{dmg}%智力冰霜伤害，并每秒落下造成{bolt}%伤害的闪电。'
    },
    spellweave: {
      name: '法术编织',
      desc: '法术暴击率+{crit}%，技能消耗的法力减少{mana}%。'
    },
    prismaticNova: {
      name: '棱彩新星',
      desc: '对{radius} m内的一切造成{dmg}%智力伤害，每个目标都受到能引发其反应的元素。'
    },
    prismaticWard: {
      name: '棱彩守护',
      desc: '你受到的伤害降低{reduce}%，生命提高{hp}%。'
    },
    frostfireComet: {
      name: '霜火彗星',
      desc: '冰与火的彗星：造成{dmg}%智力伤害。敌人会被灼烧并减速。'
    },
    elementalConvergence: {
      name: '元素汇聚',
      desc: '{dur}秒内四种元素轮流出击：{strikes}次打击，每次{dmg}%智力伤害，并互相引发反应。'
    },
    wispBolt: {
      name: '幽光弹',
      desc: '一团幽光，造成{dmg}%智力伤害。被它击败的敌人会化为你的灵魂，持续{life}秒。'
    },
    kindredSpirits: {
      name: '同心之灵',
      desc: '你的灵魂和随从生命提高{hp}%，攻击加快{speed}%。'
    },
    callTheFallen: {
      name: '召唤倒下者',
      desc: '{radius} m内刚倒下的最多{max}个敌人化为你的灵魂，持续{life}秒。'
    },
    soulBond: {
      name: '灵魂羁绊',
      desc: '与敌人交朋友：有{chance}%几率（受伤时{low}%）化为你的灵魂{life}秒。否则造成{dmg}%伤害。'
    },
    restlessSouls: {
      name: '不安之魂',
      desc: '你击败的敌人有{chance}%几率化为你的灵魂，持续{life}秒。'
    },
    spiritLantern: {
      name: '灵魂提灯',
      desc: '提灯持续{dur}秒：灯光中的敌人受到{dmg}%智力伤害，伙伴得到治疗，倒下者重新站起。'
    },
    hauntingWail: {
      name: '幽魂哀嚎',
      desc: '幽灵般的“哇！”：对{radius} m内造成{dmg}%智力伤害，敌人逃跑{fear}秒。'
    },
    wardensVigil: {
      name: '守望者的警戒',
      desc: '你的灵魂和随从伤害提高{dmg}%，你受到的伤害降低{reduce}%。'
    },
    releaseSouls: {
      name: '释放灵魂',
      desc: '你的灵魂化作光芒回家：每个在周围造成{dmg}%智力伤害，每个为你回复{heal}%生命。'
    },
    lanternKeeper: {
      name: '守灯人',
      desc: '冷却缩短{cdr}%，技能消耗的法力减少{mana}%。'
    },
    wispSwarm: {
      name: '幽光群',
      desc: '{wisps}团幽光扑向区域内的敌人，共造成{dmg}%智力伤害。被它们击败的敌人会站起来。'
    },
    processionOfSouls: {
      name: '灵魂游行',
      desc: '{dur}秒内，在你附近倒下的每个敌人都会化为你的灵魂，灵魂伤害提高{atk}%。'
    },
    palmStrike: {
      name: '掌击',
      desc: '迅捷一掌，造成{dmg}%敏捷伤害并击退敌人。积攒{chi}点气。'
    },
    ironBody: {
      name: '铁布衫',
      desc: '受到的物理伤害降低{reduce}%，生命提高{hp}%。'
    },
    flyingKick: {
      name: '飞踢',
      desc: '飞向目标踢出一脚，造成{dmg}%敏捷伤害；路上的敌人受到{path}%。积攒{chi}点气。'
    },
    tigerStance: {
      name: '虎式',
      desc: '{dur}秒内：伤害+{dmg}%，攻击速度+{speed}%。结束鹤式。'
    },
    craneStance: {
      name: '鹤式',
      desc: '{dur}秒内：防御+{def}%，每秒回复{regen}%生命。结束虎式。'
    },
    flowingFists: {
      name: '行云流水拳',
      desc: '你的攻击有{chance}%几率积攒气。'
    },
    hundredFists: {
      name: '百裂拳',
      desc: '连出{hits}拳，共造成{dmg}%敏捷伤害。积攒{chi}点气。'
    },
    risingDragon: {
      name: '升龙拳',
      desc: '耗尽所有气打出上勾拳：造成{dmg}%敏捷伤害，每点气+{per}%。敌人被打上天。'
    },
    cranesGrace: {
      name: '鹤之优雅',
      desc: '闪避+{dodge}%，你受到的眩晕和击倒缩短{cut}%。'
    },
    whirlwindKick: {
      name: '旋风腿',
      desc: '对{radius} m内的一切连踢两次，共造成{dmg}%敏捷伤害。最多积攒{chi}点气。'
    },
    tigersFury: {
      name: '猛虎之怒',
      desc: '暴击率+{crit}%，攻击速度+{speed}%。'
    },
    mountainPalm: {
      name: '排山掌',
      desc: '耗尽所有气：巨掌落下，造成{dmg}%敏捷伤害，每点气+{per}%，并击倒敌人。'
    },
    sharpNote: {
      name: '尖锐音符',
      desc: '一个尖锐的音符，造成{dmg}%魅力伤害。敌人{dur}秒内伤害降低{weaken}%。'
    },
    stagePresence: {
      name: '舞台魅力',
      desc: '技能消耗的法力减少{mana}%，移动加快{move}%。'
    },
    marchingSong: {
      name: '进行曲',
      desc: '歌声持续{dur}秒：你和{radius} m内的友军移动加快{move}%，攻击加快{speed}%。'
    },
    lullaby: {
      name: '摇篮曲',
      desc: '锥形范围内的轻柔曲调：被它触及的每个敌人都会睡着{dur}秒。'
    },
    longRefrain: {
      name: '悠长副歌',
      desc: '你的歌曲持续时间延长{pct}%。'
    },
    balladOfValor: {
      name: '英勇叙事曲',
      desc: '歌声持续{dur}秒：你和{radius} m内的友军伤害提高{dmg}%，并获得{def}%防御。'
    },
    charmingSerenade: {
      name: '魅惑小夜曲',
      desc: '魅惑目标和{radius} m内的敌人：{dur}秒内它们互相攻击。'
    },
    virtuoso: {
      name: '演奏大师',
      desc: '冷却缩短{cdr}%，暴击伤害+{critDmg}%。'
    },
    hymnOfMending: {
      name: '治愈圣歌',
      desc: '清除负面效果，之后{dur}秒内你和{radius} m内的友军每秒回复{regen}%生命。'
    },
    crescendo: {
      name: '渐强',
      desc: '{radius} m内的音爆：造成{dmg}%魅力伤害，你每在演奏一首歌+{per}%。'
    },
    standingOvation: {
      name: '全场起立',
      desc: '伤害+{dmg}%，受到的伤害降低{reduce}%。'
    },
    grandFinale: {
      name: '华丽终章',
      desc: '全力演奏{dur}秒（速度、伤害、防御+{buff}%），最后一个和弦：{dmg}%魅力伤害，魅惑敌人。'
    }
  },
  slot: {
    main: '主手',
    off: '副手',
    head: '头部',
    body: '护甲',
    hands: '双手',
    feet: '双脚',
    trinket: '饰品'
  },
  tier: {
    '7': '神话',
    '1': '普通',
    '2': '优秀',
    '3': '稀有',
    '4': '史诗',
    '5': '英雄',
    '6': '传说'
  },
  weapon: {
    melee: '近战 · 随{attr}成长',
    ranged: '远程 · 随{attr}成长',
    magic: '魔法 · 随{attr}成长'
  },
  source: {
    'siege': "在堡垒渡口攻防战中赢得。",
    'infernal': "炼狱双生：在被入侵的{zone}掉落，或由铁匠锻造。",
    arena: '在斗技场的天梯中赢得。',
    smith: '在铁匠铺锻造。',
    mob: '由{zone}的怪物掉落。',
    chest: '可在{zone}的宝箱里找到。',
    boss: '由{zone}的首领掉落。',
    secret: '藏在{zone}的一个秘密宝箱里。'
  },
  mod: {
    'demonBane': "对恶魔伤害+{n}%",
    'demonLeech': "对恶魔造成伤害的{n}%治疗你",
    'beastBane': "对神话野兽伤害+{n}%",
    'fireWard': "受到的火焰伤害-{n}%",
    'shadowWard': "受到的暗影伤害-{n}%",
    'demonWard': "受到恶魔的伤害-{n}%",
    'pylonBreaker': "对恶魔塔伤害+{n}%",
    'glassFinder': "被击杀的恶魔有{n}%几率额外留下恶魔玻璃",
    'waterWalk': "水不会让你减速",
    str: '+{n} 力量',
    dex: '+{n} 敏捷',
    int: '+{n} 智力',
    end: '+{n} 耐力',
    skl: '+{n} 技巧',
    cha: '+{n} 魅力',
    allAttrs: '所有属性 +{n}',
    strOrDex: '力量和敏捷中较高的一项 +{n}',
    armor: '{n} 护甲',
    armorPct: '+{n}% 护甲',
    armorFromStr: '来自力量的护甲：+{n}%',
    block: '+{n}% 格挡几率',
    dodge: '+{n}% 闪避',
    damageReduction: '+{n}% 伤害减免',
    physReduction: '受到的物理伤害降低{n}%',
    maxHp: '+{n} 最大生命',
    maxHpPct: '+{n}% 最大生命',
    maxMana: '+{n} 最大法力',
    hpRegen: '每秒 +{n} 生命',
    stunDurationCut: '你受到的眩晕缩短{n}%',
    damagePct: '+{n}% 造成的伤害',
    critChance: '+{n}% 暴击率',
    critDamage: '+{n}% 暴击伤害',
    spellCrit: '+{n}% 法术暴击率',
    attackSpeed: '+{n}% 攻击速度',
    moveSpeed: '+{n}% 移动速度',
    cdr: '冷却缩短{n}%',
    manaDiscount: '法术的法力消耗降低{n}%',
    lifesteal: '所有伤害 +{n}% 生命偷取',
    physLifesteal: '物理攻击 +{n}% 生命偷取',
    lifeDrainPct: '生命汲取增强{n}%',
    bossDamage: '对首领的伤害 +{n}%',
    backstab: '+{n}% 背刺伤害',
    minionDamage: '随从的伤害 +{n}%',
    minionAttackSpeed: '随从攻击加快{n}%',
    minionHp: '随从的生命 +{n}%',
    burnOnHit: '攻击附带{n}点伤害的灼烧',
    freezeOnHit: '攻击有{n}%几率冰冻敌人',
    pierce: '射击可多穿透{n}个敌人',
    critCooldown: '暴击使所有冷却减少{n}秒',
    extraBlastEvery: '每{n}次射击额外发出一道能量冲击',
    reflectOnBlock: '格挡时反弹{n}点伤害',
    fatalSave: '受到致命伤害时改为无敌{n}秒（每120秒一次）',
    knockbackImmune: '免疫击退',
    heatBuildCut: '热量积累减慢{n}%',
    heatDissipation: '热量消散加快{n}%',
    flaskDamage: '鲜血药瓶的伤害 +{n}%',
    igniteBonus: '火系法术的灼烧增强{n}%',
    stealthy: '行动无声：敌人发现你的距离缩短{n}%',
    fortitude: '受到重击时获得{n}%生命的护盾',
    evasionHaste: '闪避成功后获得{n}%急速',
    cauterize: '被灼烧的敌人对你造成的伤害降低{n}%',
    pyromaniac: '法术暴击使火系冷却减少{n}秒',
    tribute: '随从替你承受{n}%的伤害',
    timeDistort: '受到的伤害有{n}%被延后',
    entropy: '施法使冷却缩短{n}%',
    bloodToMana: '受到的物理伤害有{n}%转化为法力',
    bleedHeal: '命中流血的敌人回复{n}%生命',
    overheatCrit: '过热时暴击伤害 +{n}%',
    lowHealthDamage: '生命越低伤害越高，最多+{n}%',
    heatArmor: '热量达到一半或以上时，受到的伤害-{n}%',
    crumble: '对减速、击倒或石化的敌人伤害+{n}%',
    lastStand: '生命低于30%时,受到的伤害-{n}%',
    wildfire: '燃烧的敌人倒下时点燃{n}米内的敌人',
    loyalty: '倒下的仆从为你恢复{n}%生命',
    chillOnHit: '普通攻击减速{n}%，持续2秒',
    chillDamage: '对减速或冰冻的敌人伤害+{n}%',
    healPower: '受到的治疗+{n}%',
    packDamage: '每有一名存活的同伴，伤害+{n}%（最多4名）',
    reactionDamage: '元素反应+{n}%',
    soulRise: '被击败的敌人有{n}%几率化为你的灵魂复起',
    chiOnHit: '攻击有{n}%几率积攒气',
    songLength: '歌曲持续时间+{n}%'
  },
  item: {
    'chimeraMane': { 'name': "奇美拉鬃毛" },
    'triFang': { 'name': "三叉牙" },
    'warchiefsLongbowGun': { 'name': "军阀长弓枪" },
    'hoofbreakerGreaves': { 'name': "碎蹄护胫" },
    'eyeOfTheDeep': { 'name': "深渊之眼" },
    'beamSplitter': { 'name': "分光盾" },
    'riddleCrown': { 'name': "谜语之冠" },
    'sandglassWand': { 'name': "沙漏魔杖" },
    'leviathanScale': { 'name': "利维坦之鳞" },
    'tidecallerStaff': { 'name': "唤潮者法杖" },
    'hydraScaleGauntlets': { 'name': "九头蛇鳞铁手套" },
    'manyHeadedFlail': { 'name': "多头连枷" },
    'heartOfTheElderDragon': { 'name': "远古巨龙之心" },
    'dragonboneGreatsword': { 'name': "龙骨巨剑" },
    'bastionBanner': { 'name': "堡垒战旗" },
    'wallwardensPlate': { 'name': "护墙者板甲" },
    'gatebreaker': { 'name': "破门锤" },
    'crownOfTheLastBastion': { 'name': "最后堡垒之冠" },
    heartOfTheArena: {
      name: '斗技场之心'
    },
    mantleOfTheUndefeated: {
      name: '不败者板甲'
    },
    crimsonBulwark: {
      name: '赤红壁盾'
    },
    sandstriderGreaves: {
      name: '踏沙胫甲'
    },
    gripsOfTheGladiator: {
      name: '角斗士护手'
    },
    laurelOfTheVictor: {
      name: '胜者桂冠'
    },
    smithMasterMithrilGreaves: {
      name: '精工秘银胫甲'
    },
    smithMasterAdamantGreaves: {
      name: '精工艾达曼胫甲'
    },
    smithMasterAetheriteGreaves: {
      name: '精工以太晶胫甲'
    },
    smithMithrilGreaves: {
      name: '秘银胫甲'
    },
    smithAdamantGreaves: {
      name: '艾达曼胫甲'
    },
    smithAetheriteGreaves: {
      name: '以太晶胫甲'
    },
    smithMasterMithrilPlate: {
      name: '精工秘银板甲'
    },
    smithMasterAdamantPlate: {
      name: '精工艾达曼板甲'
    },
    smithMasterAetheritePlate: {
      name: '精工以太晶板甲'
    },
    smithMithrilPlate: {
      name: '秘银板甲'
    },
    smithAdamantPlate: {
      name: '艾达曼板甲'
    },
    smithAetheritePlate: {
      name: '以太晶板甲'
    },
    smithMasterMithrilHelm: {
      name: '精工秘银盔'
    },
    smithMasterAdamantHelm: {
      name: '精工艾达曼盔'
    },
    smithMasterAetheriteHelm: {
      name: '精工以太晶盔'
    },
    smithMithrilHelm: {
      name: '秘银盔'
    },
    smithAdamantHelm: {
      name: '艾达曼盔'
    },
    smithAetheriteHelm: {
      name: '以太晶盔'
    },
    smithMasterMithrilShield: {
      name: '精工秘银盾'
    },
    smithMasterAdamantShield: {
      name: '精工艾达曼盾'
    },
    smithMasterAetheriteShield: {
      name: '精工以太晶盾'
    },
    smithMithrilShield: {
      name: '秘银盾'
    },
    smithAdamantShield: {
      name: '艾达曼盾'
    },
    smithAetheriteShield: {
      name: '以太晶盾'
    },
    smithMasterMithrilHammer: {
      name: '精工秘银锤'
    },
    smithMasterAdamantHammer: {
      name: '精工艾达曼锤'
    },
    smithMasterAetheriteHammer: {
      name: '精工以太晶锤'
    },
    smithMithrilHammer: {
      name: '秘银锤'
    },
    smithAdamantHammer: {
      name: '艾达曼锤'
    },
    smithAetheriteHammer: {
      name: '以太晶锤'
    },
    smithMasterMithrilSword: {
      name: '精工秘银剑'
    },
    smithMasterAdamantSword: {
      name: '精工艾达曼剑'
    },
    smithMasterAetheriteSword: {
      name: '精工以太晶剑'
    },
    smithMithrilSword: {
      name: '秘银剑'
    },
    smithAdamantSword: {
      name: '艾达曼剑'
    },
    smithAetheriteSword: {
      name: '以太晶剑'
    },
    smithMasterGoldGreaves: {
      name: '精工金胫甲'
    },
    smithGoldGreaves: {
      name: '金胫甲'
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
      name: '精工金锤'
    },
    smithGoldHammer: {
      name: '金锤'
    },
    smithMasterGoldSword: {
      name: '精工金剑'
    },
    smithGoldSword: {
      name: '金剑'
    },
    smithMasterSilverGreaves: {
      name: '精工银胫甲'
    },
    smithSilverGreaves: {
      name: '银胫甲'
    },
    smithMasterSilverPlate: {
      name: '精工银板甲'
    },
    smithSilverPlate: {
      name: '银板甲'
    },
    smithMasterSilverHelm: {
      name: '精工银盔'
    },
    smithSilverHelm: {
      name: '银盔'
    },
    smithMasterSilverShield: {
      name: '精工银盾'
    },
    smithSilverShield: {
      name: '银盾'
    },
    smithMasterSilverHammer: {
      name: '精工银锤'
    },
    smithSilverHammer: {
      name: '银锤'
    },
    smithMasterSilverSword: {
      name: '精工银剑'
    },
    smithSilverSword: {
      name: '银剑'
    },
    smithMasterIronGreaves: {
      name: '精工铁胫甲'
    },
    smithIronGreaves: {
      name: '铁胫甲'
    },
    smithMasterIronPlate: {
      name: '精工铁板甲'
    },
    smithIronPlate: {
      name: '铁板甲'
    },
    smithMasterIronHelm: {
      name: '精工铁盔'
    },
    smithIronHelm: {
      name: '铁盔'
    },
    smithMasterIronShield: {
      name: '精工铁盾'
    },
    smithIronShield: {
      name: '铁盾'
    },
    smithMasterIronHammer: {
      name: '精工铁锤'
    },
    smithIronHammer: {
      name: '铁锤'
    },
    smithMasterIronSword: {
      name: '精工铁剑'
    },
    smithMasterDexIronSword: {
      name: '精工铁匕首 · 敏捷'
    },
    smithDexIronSword: {
      name: '铁匕首 · 敏捷'
    },
    smithMasterDexIronHammer: {
      name: '精工铁细剑 · 敏捷'
    },
    smithDexIronHammer: {
      name: '铁细剑 · 敏捷'
    },
    smithMasterDexIronShield: {
      name: '精工铁小圆盾 · 敏捷'
    },
    smithDexIronShield: {
      name: '铁小圆盾 · 敏捷'
    },
    smithMasterDexIronHelm: {
      name: '精工铁兜帽 · 敏捷'
    },
    smithDexIronHelm: {
      name: '铁兜帽 · 敏捷'
    },
    smithMasterDexIronPlate: {
      name: '精工铁皮甲 · 敏捷'
    },
    smithDexIronPlate: {
      name: '铁皮甲 · 敏捷'
    },
    smithMasterDexIronGreaves: {
      name: '精工铁靴子 · 敏捷'
    },
    smithDexIronGreaves: {
      name: '铁靴子 · 敏捷'
    },
    smithMasterDexSilverSword: {
      name: '精工银匕首 · 敏捷'
    },
    smithDexSilverSword: {
      name: '银匕首 · 敏捷'
    },
    smithMasterDexSilverHammer: {
      name: '精工银细剑 · 敏捷'
    },
    smithDexSilverHammer: {
      name: '银细剑 · 敏捷'
    },
    smithMasterDexSilverShield: {
      name: '精工银小圆盾 · 敏捷'
    },
    smithDexSilverShield: {
      name: '银小圆盾 · 敏捷'
    },
    smithMasterDexSilverHelm: {
      name: '精工银兜帽 · 敏捷'
    },
    smithDexSilverHelm: {
      name: '银兜帽 · 敏捷'
    },
    smithMasterDexSilverPlate: {
      name: '精工银皮甲 · 敏捷'
    },
    smithDexSilverPlate: {
      name: '银皮甲 · 敏捷'
    },
    smithMasterDexSilverGreaves: {
      name: '精工银靴子 · 敏捷'
    },
    smithDexSilverGreaves: {
      name: '银靴子 · 敏捷'
    },
    smithMasterDexGoldSword: {
      name: '精工金匕首 · 敏捷'
    },
    smithDexGoldSword: {
      name: '金匕首 · 敏捷'
    },
    smithMasterDexGoldHammer: {
      name: '精工金细剑 · 敏捷'
    },
    smithDexGoldHammer: {
      name: '金细剑 · 敏捷'
    },
    smithMasterDexGoldShield: {
      name: '精工金小圆盾 · 敏捷'
    },
    smithDexGoldShield: {
      name: '金小圆盾 · 敏捷'
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
      name: '精工秘银匕首 · 敏捷'
    },
    smithMasterDexAdamantSword: {
      name: '精工艾达曼匕首 · 敏捷'
    },
    smithMasterDexAetheriteSword: {
      name: '精工以太晶匕首 · 敏捷'
    },
    smithDexMithrilSword: {
      name: '秘银匕首 · 敏捷'
    },
    smithDexAdamantSword: {
      name: '艾达曼匕首 · 敏捷'
    },
    smithDexAetheriteSword: {
      name: '以太晶匕首 · 敏捷'
    },
    smithMasterDexMithrilHammer: {
      name: '精工秘银细剑 · 敏捷'
    },
    smithMasterDexAdamantHammer: {
      name: '精工艾达曼细剑 · 敏捷'
    },
    smithMasterDexAetheriteHammer: {
      name: '精工以太晶细剑 · 敏捷'
    },
    smithDexMithrilHammer: {
      name: '秘银细剑 · 敏捷'
    },
    smithDexAdamantHammer: {
      name: '艾达曼细剑 · 敏捷'
    },
    smithDexAetheriteHammer: {
      name: '以太晶细剑 · 敏捷'
    },
    smithMasterDexMithrilShield: {
      name: '精工秘银小圆盾 · 敏捷'
    },
    smithMasterDexAdamantShield: {
      name: '精工艾达曼小圆盾 · 敏捷'
    },
    smithMasterDexAetheriteShield: {
      name: '精工以太晶小圆盾 · 敏捷'
    },
    smithDexMithrilShield: {
      name: '秘银小圆盾 · 敏捷'
    },
    smithDexAdamantShield: {
      name: '艾达曼小圆盾 · 敏捷'
    },
    smithDexAetheriteShield: {
      name: '以太晶小圆盾 · 敏捷'
    },
    smithMasterDexMithrilHelm: {
      name: '精工秘银兜帽 · 敏捷'
    },
    smithMasterDexAdamantHelm: {
      name: '精工艾达曼兜帽 · 敏捷'
    },
    smithMasterDexAetheriteHelm: {
      name: '精工以太晶兜帽 · 敏捷'
    },
    smithDexMithrilHelm: {
      name: '秘银兜帽 · 敏捷'
    },
    smithDexAdamantHelm: {
      name: '艾达曼兜帽 · 敏捷'
    },
    smithDexAetheriteHelm: {
      name: '以太晶兜帽 · 敏捷'
    },
    smithMasterDexMithrilPlate: {
      name: '精工秘银皮甲 · 敏捷'
    },
    smithMasterDexAdamantPlate: {
      name: '精工艾达曼皮甲 · 敏捷'
    },
    smithMasterDexAetheritePlate: {
      name: '精工以太晶皮甲 · 敏捷'
    },
    smithDexMithrilPlate: {
      name: '秘银皮甲 · 敏捷'
    },
    smithDexAdamantPlate: {
      name: '艾达曼皮甲 · 敏捷'
    },
    smithDexAetheritePlate: {
      name: '以太晶皮甲 · 敏捷'
    },
    smithMasterDexMithrilGreaves: {
      name: '精工秘银靴子 · 敏捷'
    },
    smithMasterDexAdamantGreaves: {
      name: '精工艾达曼靴子 · 敏捷'
    },
    smithMasterDexAetheriteGreaves: {
      name: '精工以太晶靴子 · 敏捷'
    },
    smithDexMithrilGreaves: {
      name: '秘银靴子 · 敏捷'
    },
    smithDexAdamantGreaves: {
      name: '艾达曼靴子 · 敏捷'
    },
    smithDexAetheriteGreaves: {
      name: '以太晶靴子 · 敏捷'
    },
    smithMasterIntIronSword: {
      name: '精工铁魔杖 · 智力'
    },
    smithIntIronSword: {
      name: '铁魔杖 · 智力'
    },
    smithMasterIntIronHammer: {
      name: '精工铁法杖 · 智力'
    },
    smithIntIronHammer: {
      name: '铁法杖 · 智力'
    },
    smithMasterIntIronShield: {
      name: '精工铁魔法书 · 智力'
    },
    smithIntIronShield: {
      name: '铁魔法书 · 智力'
    },
    smithMasterIntIronHelm: {
      name: '精工铁头环 · 智力'
    },
    smithIntIronHelm: {
      name: '铁头环 · 智力'
    },
    smithMasterIntIronPlate: {
      name: '精工铁长袍 · 智力'
    },
    smithIntIronPlate: {
      name: '铁长袍 · 智力'
    },
    smithMasterIntIronGreaves: {
      name: '精工铁靴子 · 智力'
    },
    smithIntIronGreaves: {
      name: '铁靴子 · 智力'
    },
    smithMasterIntSilverSword: {
      name: '精工银魔杖 · 智力'
    },
    smithIntSilverSword: {
      name: '银魔杖 · 智力'
    },
    smithMasterIntSilverHammer: {
      name: '精工银法杖 · 智力'
    },
    smithIntSilverHammer: {
      name: '银法杖 · 智力'
    },
    smithMasterIntSilverShield: {
      name: '精工银魔法书 · 智力'
    },
    smithIntSilverShield: {
      name: '银魔法书 · 智力'
    },
    smithMasterIntSilverHelm: {
      name: '精工银头环 · 智力'
    },
    smithIntSilverHelm: {
      name: '银头环 · 智力'
    },
    smithMasterIntSilverPlate: {
      name: '精工银长袍 · 智力'
    },
    smithIntSilverPlate: {
      name: '银长袍 · 智力'
    },
    smithMasterIntSilverGreaves: {
      name: '精工银靴子 · 智力'
    },
    smithIntSilverGreaves: {
      name: '银靴子 · 智力'
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
      name: '精工金魔法书 · 智力'
    },
    smithIntGoldShield: {
      name: '金魔法书 · 智力'
    },
    smithMasterIntGoldHelm: {
      name: '精工金头环 · 智力'
    },
    smithIntGoldHelm: {
      name: '金头环 · 智力'
    },
    smithMasterIntGoldPlate: {
      name: '精工金长袍 · 智力'
    },
    smithIntGoldPlate: {
      name: '金长袍 · 智力'
    },
    smithMasterIntGoldGreaves: {
      name: '精工金靴子 · 智力'
    },
    smithIntGoldGreaves: {
      name: '金靴子 · 智力'
    },
    smithMasterIntMithrilSword: {
      name: '精工秘银魔杖 · 智力'
    },
    smithMasterIntAdamantSword: {
      name: '精工艾达曼魔杖 · 智力'
    },
    smithMasterIntAetheriteSword: {
      name: '精工以太晶魔杖 · 智力'
    },
    smithIntMithrilSword: {
      name: '秘银魔杖 · 智力'
    },
    smithIntAdamantSword: {
      name: '艾达曼魔杖 · 智力'
    },
    smithIntAetheriteSword: {
      name: '以太晶魔杖 · 智力'
    },
    smithMasterIntMithrilHammer: {
      name: '精工秘银法杖 · 智力'
    },
    smithMasterIntAdamantHammer: {
      name: '精工艾达曼法杖 · 智力'
    },
    smithMasterIntAetheriteHammer: {
      name: '精工以太晶法杖 · 智力'
    },
    smithIntMithrilHammer: {
      name: '秘银法杖 · 智力'
    },
    smithIntAdamantHammer: {
      name: '艾达曼法杖 · 智力'
    },
    smithIntAetheriteHammer: {
      name: '以太晶法杖 · 智力'
    },
    smithMasterIntMithrilShield: {
      name: '精工秘银魔法书 · 智力'
    },
    smithMasterIntAdamantShield: {
      name: '精工艾达曼魔法书 · 智力'
    },
    smithMasterIntAetheriteShield: {
      name: '精工以太晶魔法书 · 智力'
    },
    smithIntMithrilShield: {
      name: '秘银魔法书 · 智力'
    },
    smithIntAdamantShield: {
      name: '艾达曼魔法书 · 智力'
    },
    smithIntAetheriteShield: {
      name: '以太晶魔法书 · 智力'
    },
    smithMasterIntMithrilHelm: {
      name: '精工秘银头环 · 智力'
    },
    smithMasterIntAdamantHelm: {
      name: '精工艾达曼头环 · 智力'
    },
    smithMasterIntAetheriteHelm: {
      name: '精工以太晶头环 · 智力'
    },
    smithIntMithrilHelm: {
      name: '秘银头环 · 智力'
    },
    smithIntAdamantHelm: {
      name: '艾达曼头环 · 智力'
    },
    smithIntAetheriteHelm: {
      name: '以太晶头环 · 智力'
    },
    smithMasterIntMithrilPlate: {
      name: '精工秘银长袍 · 智力'
    },
    smithMasterIntAdamantPlate: {
      name: '精工艾达曼长袍 · 智力'
    },
    smithMasterIntAetheritePlate: {
      name: '精工以太晶长袍 · 智力'
    },
    smithIntMithrilPlate: {
      name: '秘银长袍 · 智力'
    },
    smithIntAdamantPlate: {
      name: '艾达曼长袍 · 智力'
    },
    smithIntAetheritePlate: {
      name: '以太晶长袍 · 智力'
    },
    smithMasterIntMithrilGreaves: {
      name: '精工秘银靴子 · 智力'
    },
    smithMasterIntAdamantGreaves: {
      name: '精工艾达曼靴子 · 智力'
    },
    smithMasterIntAetheriteGreaves: {
      name: '精工以太晶靴子 · 智力'
    },
    smithIntMithrilGreaves: {
      name: '秘银靴子 · 智力'
    },
    smithIntAdamantGreaves: {
      name: '艾达曼靴子 · 智力'
    },
    smithIntAetheriteGreaves: {
      name: '以太晶靴子 · 智力'
    },
    smithMasterSklIronSword: {
      name: '精工铁手枪 · 技巧'
    },
    smithSklIronSword: {
      name: '铁手枪 · 技巧'
    },
    smithMasterSklIronHammer: {
      name: '精工铁步枪 · 技巧'
    },
    smithSklIronHammer: {
      name: '铁步枪 · 技巧'
    },
    smithMasterSklIronShield: {
      name: '精工铁能量电池 · 技巧'
    },
    smithSklIronShield: {
      name: '铁能量电池 · 技巧'
    },
    smithMasterSklIronHelm: {
      name: '精工铁软帽 · 技巧'
    },
    smithSklIronHelm: {
      name: '铁软帽 · 技巧'
    },
    smithMasterSklIronPlate: {
      name: '精工铁皮具 · 技巧'
    },
    smithSklIronPlate: {
      name: '铁皮具 · 技巧'
    },
    smithMasterSklIronGreaves: {
      name: '精工铁靴子 · 技巧'
    },
    smithSklIronGreaves: {
      name: '铁靴子 · 技巧'
    },
    smithMasterSklSilverSword: {
      name: '精工银手枪 · 技巧'
    },
    smithSklSilverSword: {
      name: '银手枪 · 技巧'
    },
    smithMasterSklSilverHammer: {
      name: '精工银步枪 · 技巧'
    },
    smithSklSilverHammer: {
      name: '银步枪 · 技巧'
    },
    smithMasterSklSilverShield: {
      name: '精工银能量电池 · 技巧'
    },
    smithSklSilverShield: {
      name: '银能量电池 · 技巧'
    },
    smithMasterSklSilverHelm: {
      name: '精工银软帽 · 技巧'
    },
    smithSklSilverHelm: {
      name: '银软帽 · 技巧'
    },
    smithMasterSklSilverPlate: {
      name: '精工银皮具 · 技巧'
    },
    smithSklSilverPlate: {
      name: '银皮具 · 技巧'
    },
    smithMasterSklSilverGreaves: {
      name: '精工银靴子 · 技巧'
    },
    smithSklSilverGreaves: {
      name: '银靴子 · 技巧'
    },
    smithMasterSklGoldSword: {
      name: '精工金手枪 · 技巧'
    },
    smithSklGoldSword: {
      name: '金手枪 · 技巧'
    },
    smithMasterSklGoldHammer: {
      name: '精工金步枪 · 技巧'
    },
    smithSklGoldHammer: {
      name: '金步枪 · 技巧'
    },
    smithMasterSklGoldShield: {
      name: '精工金能量电池 · 技巧'
    },
    smithSklGoldShield: {
      name: '金能量电池 · 技巧'
    },
    smithMasterSklGoldHelm: {
      name: '精工金软帽 · 技巧'
    },
    smithSklGoldHelm: {
      name: '金软帽 · 技巧'
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
      name: '精工秘银手枪 · 技巧'
    },
    smithMasterSklAdamantSword: {
      name: '精工艾达曼手枪 · 技巧'
    },
    smithMasterSklAetheriteSword: {
      name: '精工以太晶手枪 · 技巧'
    },
    smithSklMithrilSword: {
      name: '秘银手枪 · 技巧'
    },
    smithSklAdamantSword: {
      name: '艾达曼手枪 · 技巧'
    },
    smithSklAetheriteSword: {
      name: '以太晶手枪 · 技巧'
    },
    smithMasterSklMithrilHammer: {
      name: '精工秘银步枪 · 技巧'
    },
    smithMasterSklAdamantHammer: {
      name: '精工艾达曼步枪 · 技巧'
    },
    smithMasterSklAetheriteHammer: {
      name: '精工以太晶步枪 · 技巧'
    },
    smithSklMithrilHammer: {
      name: '秘银步枪 · 技巧'
    },
    smithSklAdamantHammer: {
      name: '艾达曼步枪 · 技巧'
    },
    smithSklAetheriteHammer: {
      name: '以太晶步枪 · 技巧'
    },
    smithMasterSklMithrilShield: {
      name: '精工秘银能量电池 · 技巧'
    },
    smithMasterSklAdamantShield: {
      name: '精工艾达曼能量电池 · 技巧'
    },
    smithMasterSklAetheriteShield: {
      name: '精工以太晶能量电池 · 技巧'
    },
    smithSklMithrilShield: {
      name: '秘银能量电池 · 技巧'
    },
    smithSklAdamantShield: {
      name: '艾达曼能量电池 · 技巧'
    },
    smithSklAetheriteShield: {
      name: '以太晶能量电池 · 技巧'
    },
    smithMasterSklMithrilHelm: {
      name: '精工秘银软帽 · 技巧'
    },
    smithMasterSklAdamantHelm: {
      name: '精工艾达曼软帽 · 技巧'
    },
    smithMasterSklAetheriteHelm: {
      name: '精工以太晶软帽 · 技巧'
    },
    smithSklMithrilHelm: {
      name: '秘银软帽 · 技巧'
    },
    smithSklAdamantHelm: {
      name: '艾达曼软帽 · 技巧'
    },
    smithSklAetheriteHelm: {
      name: '以太晶软帽 · 技巧'
    },
    smithMasterSklMithrilPlate: {
      name: '精工秘银皮具 · 技巧'
    },
    smithMasterSklAdamantPlate: {
      name: '精工艾达曼皮具 · 技巧'
    },
    smithMasterSklAetheritePlate: {
      name: '精工以太晶皮具 · 技巧'
    },
    smithSklMithrilPlate: {
      name: '秘银皮具 · 技巧'
    },
    smithSklAdamantPlate: {
      name: '艾达曼皮具 · 技巧'
    },
    smithSklAetheritePlate: {
      name: '以太晶皮具 · 技巧'
    },
    smithMasterSklMithrilGreaves: {
      name: '精工秘银靴子 · 技巧'
    },
    smithMasterSklAdamantGreaves: {
      name: '精工艾达曼靴子 · 技巧'
    },
    smithMasterSklAetheriteGreaves: {
      name: '精工以太晶靴子 · 技巧'
    },
    smithSklMithrilGreaves: {
      name: '秘银靴子 · 技巧'
    },
    smithSklAdamantGreaves: {
      name: '艾达曼靴子 · 技巧'
    },
    smithSklAetheriteGreaves: {
      name: '以太晶靴子 · 技巧'
    },
    smithMasterChaIronSword: {
      name: '精工铁权杖 · 魅力'
    },
    smithChaIronSword: {
      name: '铁权杖 · 魅力'
    },
    smithMasterChaIronHammer: {
      name: '精工铁战旗 · 魅力'
    },
    smithChaIronHammer: {
      name: '铁战旗 · 魅力'
    },
    smithMasterChaIronShield: {
      name: '精工铁法典 · 魅力'
    },
    smithChaIronShield: {
      name: '铁法典 · 魅力'
    },
    smithMasterChaIronHelm: {
      name: '精工铁王冠 · 魅力'
    },
    smithChaIronHelm: {
      name: '铁王冠 · 魅力'
    },
    smithMasterChaIronPlate: {
      name: '精工铁战袍 · 魅力'
    },
    smithChaIronPlate: {
      name: '铁战袍 · 魅力'
    },
    smithMasterChaIronGreaves: {
      name: '精工铁靴子 · 魅力'
    },
    smithChaIronGreaves: {
      name: '铁靴子 · 魅力'
    },
    smithMasterChaSilverSword: {
      name: '精工银权杖 · 魅力'
    },
    smithChaSilverSword: {
      name: '银权杖 · 魅力'
    },
    smithMasterChaSilverHammer: {
      name: '精工银战旗 · 魅力'
    },
    smithChaSilverHammer: {
      name: '银战旗 · 魅力'
    },
    smithMasterChaSilverShield: {
      name: '精工银法典 · 魅力'
    },
    smithChaSilverShield: {
      name: '银法典 · 魅力'
    },
    smithMasterChaSilverHelm: {
      name: '精工银王冠 · 魅力'
    },
    smithChaSilverHelm: {
      name: '银王冠 · 魅力'
    },
    smithMasterChaSilverPlate: {
      name: '精工银战袍 · 魅力'
    },
    smithChaSilverPlate: {
      name: '银战袍 · 魅力'
    },
    smithMasterChaSilverGreaves: {
      name: '精工银靴子 · 魅力'
    },
    smithChaSilverGreaves: {
      name: '银靴子 · 魅力'
    },
    smithMasterChaGoldSword: {
      name: '精工金权杖 · 魅力'
    },
    smithChaGoldSword: {
      name: '金权杖 · 魅力'
    },
    smithMasterChaGoldHammer: {
      name: '精工金战旗 · 魅力'
    },
    smithChaGoldHammer: {
      name: '金战旗 · 魅力'
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
      name: '精工金战袍 · 魅力'
    },
    smithChaGoldPlate: {
      name: '金战袍 · 魅力'
    },
    smithMasterChaGoldGreaves: {
      name: '精工金靴子 · 魅力'
    },
    smithChaGoldGreaves: {
      name: '金靴子 · 魅力'
    },
    smithMasterChaMithrilSword: {
      name: '精工秘银权杖 · 魅力'
    },
    smithMasterChaAdamantSword: {
      name: '精工艾达曼权杖 · 魅力'
    },
    smithMasterChaAetheriteSword: {
      name: '精工以太晶权杖 · 魅力'
    },
    smithChaMithrilSword: {
      name: '秘银权杖 · 魅力'
    },
    smithChaAdamantSword: {
      name: '艾达曼权杖 · 魅力'
    },
    smithChaAetheriteSword: {
      name: '以太晶权杖 · 魅力'
    },
    smithMasterChaMithrilHammer: {
      name: '精工秘银战旗 · 魅力'
    },
    smithMasterChaAdamantHammer: {
      name: '精工艾达曼战旗 · 魅力'
    },
    smithMasterChaAetheriteHammer: {
      name: '精工以太晶战旗 · 魅力'
    },
    smithChaMithrilHammer: {
      name: '秘银战旗 · 魅力'
    },
    smithChaAdamantHammer: {
      name: '艾达曼战旗 · 魅力'
    },
    smithChaAetheriteHammer: {
      name: '以太晶战旗 · 魅力'
    },
    smithMasterChaMithrilShield: {
      name: '精工秘银法典 · 魅力'
    },
    smithMasterChaAdamantShield: {
      name: '精工艾达曼法典 · 魅力'
    },
    smithMasterChaAetheriteShield: {
      name: '精工以太晶法典 · 魅力'
    },
    smithChaMithrilShield: {
      name: '秘银法典 · 魅力'
    },
    smithChaAdamantShield: {
      name: '艾达曼法典 · 魅力'
    },
    smithChaAetheriteShield: {
      name: '以太晶法典 · 魅力'
    },
    smithMasterChaMithrilHelm: {
      name: '精工秘银王冠 · 魅力'
    },
    smithMasterChaAdamantHelm: {
      name: '精工艾达曼王冠 · 魅力'
    },
    smithMasterChaAetheriteHelm: {
      name: '精工以太晶王冠 · 魅力'
    },
    smithChaMithrilHelm: {
      name: '秘银王冠 · 魅力'
    },
    smithChaAdamantHelm: {
      name: '艾达曼王冠 · 魅力'
    },
    smithChaAetheriteHelm: {
      name: '以太晶王冠 · 魅力'
    },
    smithMasterChaMithrilPlate: {
      name: '精工秘银战袍 · 魅力'
    },
    smithMasterChaAdamantPlate: {
      name: '精工艾达曼战袍 · 魅力'
    },
    smithMasterChaAetheritePlate: {
      name: '精工以太晶战袍 · 魅力'
    },
    smithChaMithrilPlate: {
      name: '秘银战袍 · 魅力'
    },
    smithChaAdamantPlate: {
      name: '艾达曼战袍 · 魅力'
    },
    smithChaAetheritePlate: {
      name: '以太晶战袍 · 魅力'
    },
    smithMasterChaMithrilGreaves: {
      name: '精工秘银靴子 · 魅力'
    },
    smithMasterChaAdamantGreaves: {
      name: '精工艾达曼靴子 · 魅力'
    },
    smithMasterChaAetheriteGreaves: {
      name: '精工以太晶靴子 · 魅力'
    },
    smithChaMithrilGreaves: {
      name: '秘银靴子 · 魅力'
    },
    smithChaAdamantGreaves: {
      name: '艾达曼靴子 · 魅力'
    },
    smithChaAetheriteGreaves: {
      name: '以太晶靴子 · 魅力'
    },
    smithMasterEndIronSword: {
      name: '精工铁钉头锤 · 耐力'
    },
    smithEndIronSword: {
      name: '铁钉头锤 · 耐力'
    },
    smithMasterEndIronHammer: {
      name: '精工铁战斧 · 耐力'
    },
    smithEndIronHammer: {
      name: '铁战斧 · 耐力'
    },
    smithMasterEndIronShield: {
      name: '精工铁盾 · 耐力'
    },
    smithEndIronShield: {
      name: '铁盾 · 耐力'
    },
    smithMasterEndIronHelm: {
      name: '精工铁盔 · 耐力'
    },
    smithEndIronHelm: {
      name: '铁盔 · 耐力'
    },
    smithMasterEndIronPlate: {
      name: '精工铁板甲 · 耐力'
    },
    smithEndIronPlate: {
      name: '铁板甲 · 耐力'
    },
    smithMasterEndIronGreaves: {
      name: '精工铁胫甲 · 耐力'
    },
    smithEndIronGreaves: {
      name: '铁胫甲 · 耐力'
    },
    smithMasterEndSilverSword: {
      name: '精工银钉头锤 · 耐力'
    },
    smithEndSilverSword: {
      name: '银钉头锤 · 耐力'
    },
    smithMasterEndSilverHammer: {
      name: '精工银战斧 · 耐力'
    },
    smithEndSilverHammer: {
      name: '银战斧 · 耐力'
    },
    smithMasterEndSilverShield: {
      name: '精工银盾 · 耐力'
    },
    smithEndSilverShield: {
      name: '银盾 · 耐力'
    },
    smithMasterEndSilverHelm: {
      name: '精工银盔 · 耐力'
    },
    smithEndSilverHelm: {
      name: '银盔 · 耐力'
    },
    smithMasterEndSilverPlate: {
      name: '精工银板甲 · 耐力'
    },
    smithEndSilverPlate: {
      name: '银板甲 · 耐力'
    },
    smithMasterEndSilverGreaves: {
      name: '精工银胫甲 · 耐力'
    },
    smithEndSilverGreaves: {
      name: '银胫甲 · 耐力'
    },
    smithMasterEndGoldSword: {
      name: '精工金钉头锤 · 耐力'
    },
    smithEndGoldSword: {
      name: '金钉头锤 · 耐力'
    },
    smithMasterEndGoldHammer: {
      name: '精工金战斧 · 耐力'
    },
    smithEndGoldHammer: {
      name: '金战斧 · 耐力'
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
      name: '精工金胫甲 · 耐力'
    },
    smithEndGoldGreaves: {
      name: '金胫甲 · 耐力'
    },
    smithMasterEndMithrilSword: {
      name: '精工秘银钉头锤 · 耐力'
    },
    smithMasterEndAdamantSword: {
      name: '精工艾达曼钉头锤 · 耐力'
    },
    smithMasterEndAetheriteSword: {
      name: '精工以太晶钉头锤 · 耐力'
    },
    smithEndMithrilSword: {
      name: '秘银钉头锤 · 耐力'
    },
    smithEndAdamantSword: {
      name: '艾达曼钉头锤 · 耐力'
    },
    smithEndAetheriteSword: {
      name: '以太晶钉头锤 · 耐力'
    },
    smithMasterEndMithrilHammer: {
      name: '精工秘银战斧 · 耐力'
    },
    smithMasterEndAdamantHammer: {
      name: '精工艾达曼战斧 · 耐力'
    },
    smithMasterEndAetheriteHammer: {
      name: '精工以太晶战斧 · 耐力'
    },
    smithEndMithrilHammer: {
      name: '秘银战斧 · 耐力'
    },
    smithEndAdamantHammer: {
      name: '艾达曼战斧 · 耐力'
    },
    smithEndAetheriteHammer: {
      name: '以太晶战斧 · 耐力'
    },
    smithMasterEndMithrilShield: {
      name: '精工秘银盾 · 耐力'
    },
    smithMasterEndAdamantShield: {
      name: '精工艾达曼盾 · 耐力'
    },
    smithMasterEndAetheriteShield: {
      name: '精工以太晶盾 · 耐力'
    },
    smithEndMithrilShield: {
      name: '秘银盾 · 耐力'
    },
    smithEndAdamantShield: {
      name: '艾达曼盾 · 耐力'
    },
    smithEndAetheriteShield: {
      name: '以太晶盾 · 耐力'
    },
    smithMasterEndMithrilHelm: {
      name: '精工秘银盔 · 耐力'
    },
    smithMasterEndAdamantHelm: {
      name: '精工艾达曼盔 · 耐力'
    },
    smithMasterEndAetheriteHelm: {
      name: '精工以太晶盔 · 耐力'
    },
    smithEndMithrilHelm: {
      name: '秘银盔 · 耐力'
    },
    smithEndAdamantHelm: {
      name: '艾达曼盔 · 耐力'
    },
    smithEndAetheriteHelm: {
      name: '以太晶盔 · 耐力'
    },
    smithMasterEndMithrilPlate: {
      name: '精工秘银板甲 · 耐力'
    },
    smithMasterEndAdamantPlate: {
      name: '精工艾达曼板甲 · 耐力'
    },
    smithMasterEndAetheritePlate: {
      name: '精工以太晶板甲 · 耐力'
    },
    smithEndMithrilPlate: {
      name: '秘银板甲 · 耐力'
    },
    smithEndAdamantPlate: {
      name: '艾达曼板甲 · 耐力'
    },
    smithEndAetheritePlate: {
      name: '以太晶板甲 · 耐力'
    },
    smithMasterEndMithrilGreaves: {
      name: '精工秘银胫甲 · 耐力'
    },
    smithMasterEndAdamantGreaves: {
      name: '精工艾达曼胫甲 · 耐力'
    },
    smithMasterEndAetheriteGreaves: {
      name: '精工以太晶胫甲 · 耐力'
    },
    smithEndMithrilGreaves: {
      name: '秘银胫甲 · 耐力'
    },
    smithEndAdamantGreaves: {
      name: '艾达曼胫甲 · 耐力'
    },
    smithEndAetheriteGreaves: {
      name: '以太晶胫甲 · 耐力'
    },
    smithIronSword: {
      name: '铁剑'
    },
    rustedShortsword: {
      name: '生锈的短剑'
    },
    apprenticeStaff: {
      name: '学徒法杖'
    },
    scoutsHandgun: {
      name: '斥候手枪'
    },
    ironBroadsword: {
      name: '铁制阔剑'
    },
    vipinsStiletto: {
      name: '维平的细刃匕首'
    },
    aetherCarbine: {
      name: '以太卡宾枪'
    },
    ashenGreatsword: {
      name: '灰烬巨剑'
    },
    archmageWand: {
      name: '大法师魔杖'
    },
    chronoBlade: {
      name: '时光之刃'
    },
    bloodForgedAxe: {
      name: '血铸战斧'
    },
    voidCannon: {
      name: '虚空加农炮'
    },
    dragonSmasher: {
      name: '碎龙锤'
    },
    bladeOfTheUnbound: {
      name: '无缚者之刃'
    },
    aetheriumDestroyer: {
      name: '以太晶毁灭者'
    },
    woodenBuckler: {
      name: '木制小圆盾'
    },
    tomeOfNovices: {
      name: '新手魔典'
    },
    ironShield: {
      name: '铁盾'
    },
    syringeOfTheAdept: {
      name: '行家的注射器'
    },
    aethericBattery: {
      name: '以太电池'
    },
    aegisTowerShield: {
      name: '神盾塔盾'
    },
    orbOfEternalFlame: {
      name: '永恒烈焰宝珠'
    },
    shieldOfTheFallen: {
      name: '阵亡者之盾'
    },
    paddedTunic: {
      name: '棉甲短衣'
    },
    leatherDoublet: {
      name: '皮制紧身衣'
    },
    chainmailVest: {
      name: '锁甲背心'
    },
    scholarsRobe: {
      name: '学者长袍'
    },
    reinforcedPlate: {
      name: '强化板甲'
    },
    assassinsGarb: {
      name: '刺客装束'
    },
    chronoWeaverCloak: {
      name: '织时者斗篷'
    },
    bloodSoakedPlate: {
      name: '浸血板甲'
    },
    exoArmorChassis: {
      name: '外骨骼装甲机架'
    },
    dragonscaleHauberk: {
      name: '龙鳞锁子甲'
    },
    vestmentsOfSovereign: {
      name: '君主法衣'
    },
    armorOfTheTitan: {
      name: '泰坦之甲'
    },
    quiltedCap: {
      name: '绗缝软帽'
    },
    stalkersHood: {
      name: '潜猎者兜帽'
    },
    ironcladHelm: {
      name: '铁甲头盔'
    },
    seersCirclet: {
      name: '先知头环'
    },
    wyrmguardGreathelm: {
      name: '龙卫大盔'
    },
    hatOfTheStarweaver: {
      name: '织星者之帽'
    },
    hideGloves: {
      name: '兽皮手套'
    },
    ironGauntlets: {
      name: '铁护手'
    },
    emberweaveGloves: {
      name: '余烬织纹手套'
    },
    duelistsGrips: {
      name: '决斗者握套'
    },
    voidforgedGauntlets: {
      name: '虚空锻造护手'
    },
    gripsOfTheTempest: {
      name: '风暴之握'
    },
    trailBoots: {
      name: '旅途靴'
    },
    pathfindersBoots: {
      name: '开路者之靴'
    },
    forgeplateGreaves: {
      name: '锻板胫甲'
    },
    mistwalkerBoots: {
      name: '雾行者之靴'
    },
    stormstrideGreaves: {
      name: '踏风暴胫甲'
    },
    treadsOfTheHorizon: {
      name: '地平线之步'
    },
    copperBand: {
      name: '铜指环'
    },
    ringOfMending: {
      name: '愈合之戒'
    },
    bandOfSwiftness: {
      name: '迅捷指环'
    },
    castersEmblem: {
      name: '施法者徽记'
    },
    infiltratorsCharm: {
      name: '潜入者护符'
    },
    timekeepersHourglass: {
      name: '守时者沙漏'
    },
    ringOfTheVampyre: {
      name: '吸血鬼之戒'
    },
    sovereignsSignet: {
      name: '君主印戒'
    },
    heraldsPin: {
      name: '传令官胸针'
    },
    hymnalOfTheRoad: {
      name: '旅途圣歌集'
    },
    shepherdsCrook: {
      name: '牧羊人之杖'
    },
    minstrelsHat: {
      name: '吟游诗人之帽'
    },
    pilgrimsSandals: {
      name: '朝圣者凉鞋'
    },
    falconersGloves: {
      name: '驯鹰人手套'
    },
    bellOfTheHerd: {
      name: '畜群之铃'
    },
    bannerOfTheHost: {
      name: '大军之旗'
    },
    heraldsTabard: {
      name: '传令官罩袍'
    },
    codexOfOaths: {
      name: '誓约法典'
    },
    crownOfTheRightfulKing: {
      name: '正统之王的王冠'
    },
    scepterOfTheFirstKing: {
      name: '初代国王的权杖'
    },
    pickpocketsKnife: {
      name: '扒手之刀'
    },
    serpentsFang: {
      name: '蛇牙'
    },
    phantomRapier: {
      name: '幻影细剑'
    },
    fangOfTheWindless: {
      name: '无风之牙'
    },
    roguesBuckler: {
      name: '恶棍小圆盾'
    },
    venomVial: {
      name: '毒药瓶'
    },
    swiftguardBuckler: {
      name: '迅捷卫士小圆盾'
    },
    nightshadeFlask: {
      name: '颠茄瓶'
    },
    windveilTarge: {
      name: '风幕盾'
    },
    shadowdancersBuckler: {
      name: '影舞者小圆盾'
    },
    scoutsBandana: {
      name: '斥候头巾'
    },
    nightcowl: {
      name: '夜之兜帽'
    },
    shadowveilHood: {
      name: '影幕兜帽'
    },
    windrunnersCap: {
      name: '逐风者便帽'
    },
    maskOfTheSilentWind: {
      name: '静风面具'
    },
    rangersJerkin: {
      name: '游侠皮甲'
    },
    nightstalkerLeathers: {
      name: '夜猎者皮革'
    },
    windridersHarness: {
      name: '驭风者束带'
    },
    mantleOfTheShadowDancer: {
      name: '影舞者斗篷'
    },
    thiefsGloves: {
      name: '盗贼手套'
    },
    cutpurseGloves: {
      name: '扒手手套'
    },
    glovesOfTheGale: {
      name: '疾风手套'
    },
    softSoledShoes: {
      name: '软底鞋'
    },
    catStepBoots: {
      name: '猫步靴'
    },
    shadowstepBoots: {
      name: '影步靴'
    },
    windstrideBoots: {
      name: '风步靴'
    },
    luckyCoin: {
      name: '幸运硬币'
    },
    shadowBand: {
      name: '暗影指环'
    },
    sandglassOfTheSwift: {
      name: '迅捷者的沙漏'
    },
    talonCharm: {
      name: '利爪护符'
    },
    windheart: {
      name: '风之心'
    },
    ashwallHeater: {
      name: '灰壁鸢盾'
    },
    wyrmhidePavise: {
      name: '飞龙皮重盾'
    },
    footmansKettleHat: {
      name: '步兵锅盔'
    },
    ironbrowSallet: {
      name: '铁眉轻盔'
    },
    warlordsBarbute: {
      name: '军阀巴比特盔'
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
      name: '灰烬锻造护手'
    },
    warbringerGauntlets: {
      name: '引战者护手'
    },
    titanfistGauntlets: {
      name: '泰坦之拳护手'
    },
    footmansGreaves: {
      name: '步兵胫甲'
    },
    ironshodGreaves: {
      name: '铁钉胫甲'
    },
    warlordsSabatons: {
      name: '军阀铁靴'
    },
    greavesOfTheMountainfall: {
      name: '山崩胫甲'
    },
    sergeantsSignet: {
      name: '军士印戒'
    },
    brawlersKnuckleRing: {
      name: '斗殴者指虎'
    },
    bloodiedWarMedal: {
      name: '染血战功章'
    },
    watchmansCudgel: {
      name: '守卫警棍'
    },
    ironboundMace: {
      name: '铁箍钉头锤'
    },
    stonehideCleaver: {
      name: '石肤砍刀'
    },
    bulwarkMaul: {
      name: '壁垒重锤'
    },
    mountainsplitterAxe: {
      name: '裂山斧'
    },
    everstandWarmace: {
      name: '不动战锤'
    },
    emberwallBastion: {
      name: '余烬之墙堡垒盾'
    },
    stonewardenHelm: {
      name: '石卫头盔'
    },
    colossusVisage: {
      name: '巨像之容'
    },
    diggersGauntlets: {
      name: '掘地者护手'
    },
    bastionGauntlets: {
      name: '堡垒护手'
    },
    glacierplateGauntlets: {
      name: '冰川板护手'
    },
    gauntletsOfEndlessVigil: {
      name: '永夜守望护手'
    },
    hearthstoneCharm: {
      name: '炉石护符'
    },
    ironheartPendant: {
      name: '铁心吊坠'
    },
    hedgewizardsWand: {
      name: '篱笆术士之杖'
    },
    frostglassStaff: {
      name: '霜玻璃法杖'
    },
    voidthreadWand: {
      name: '虚空丝线之杖'
    },
    staffOfTheStarlessSky: {
      name: '无星天空之杖'
    },
    studentsGrimoire: {
      name: '学徒魔典'
    },
    frostfireOrb: {
      name: '霜火宝珠'
    },
    orbOfTheUnwrittenHour: {
      name: '未书之时宝珠'
    },
    apprenticesPointedCap: {
      name: '学徒尖帽'
    },
    sagesCirclet: {
      name: '贤者额环'
    },
    cinderWizardsHat: {
      name: '灰烬法师之帽'
    },
    voidseerCirclet: {
      name: '虚空先知额环'
    },
    apprenticesRobe: {
      name: '学徒长袍'
    },
    cinderthreadRobe: {
      name: '灰丝长袍'
    },
    voidwovenRobe: {
      name: '虚空织造长袍'
    },
    inkStainedGloves: {
      name: '墨渍手套'
    },
    spellthreadGloves: {
      name: '咒线手套'
    },
    frostweaveGloves: {
      name: '霜织手套'
    },
    starlitGloves: {
      name: '星光手套'
    },
    glovesOfTheLastWord: {
      name: '最后之言手套'
    },
    scribesSlippers: {
      name: '书记员拖鞋'
    },
    moonstepSlippers: {
      name: '月步拖鞋'
    },
    emberstepBoots: {
      name: '余烬步靴'
    },
    voidwalkerBoots: {
      name: '虚空漫行者之靴'
    },
    bootsOfTheWanderingStar: {
      name: '流浪星辰之靴'
    },
    glowstonePendant: {
      name: '辉石吊坠'
    },
    scholarsSeal: {
      name: '学者印章'
    },
    eyeOfTheArchon: {
      name: '执政官之眼'
    },
    cinderRepeater: {
      name: '灰烬连发枪'
    },
    glacierMortar: {
      name: '冰川手持迫击炮'
    },
    sparkCell: {
      name: '火花电池'
    },
    arcCapacitor: {
      name: '电弧电容器'
    },
    aetherheartCell: {
      name: '以太之心电池'
    },
    marksmansVisor: {
      name: '射手面甲'
    },
    sharpshootersCap: {
      name: '狙击手帽'
    },
    gunnersHarness: {
      name: '炮手背带'
    },
    steadyhandGloves: {
      name: '稳手手套'
    },
    gunsmithsGloves: {
      name: '枪匠手套'
    },
    scrappersBoots: {
      name: '斗殴者之靴'
    },
    sharpshooterBoots: {
      name: '狙击手之靴'
    },
    firingLineBoots: {
      name: '射击线之靴'
    },
    steadyfootBoots: {
      name: '稳足之靴'
    },
    aetherstepBoots: {
      name: '以太步靴'
    },
    bootsOfTheLastShot: {
      name: '最后一枪之靴'
    },
    brassCartridgeCharm: {
      name: '黄铜弹壳护符'
    },
    deadEyeLens: {
      name: '准眼透镜'
    },
    eagleEyeScope: {
      name: '鹰眼望远镜'
    },
    criersBaton: {
      name: '传令官短杖'
    },
    droversStandard: {
      name: '牧人旗帜'
    },
    marshalsSceptre: {
      name: '元帅权杖'
    },
    balladBook: {
      name: '歌谣集'
    },
    chronicleOfHeroes: {
      name: '英雄编年史'
    },
    psalterOfTheHost: {
      name: '军团圣咏集'
    },
    tomeOfEternalReign: {
      name: '永恒统治之卷'
    },
    heraldsCap: {
      name: '传令官帽'
    },
    singersCirclet: {
      name: '歌者额环'
    },
    diademOfTenThousandVoices: {
      name: '万声王冠'
    },
    travelersWaistcoat: {
      name: '旅人背心'
    },
    minstrelsMotley: {
      name: '吟游诗人补丁衣'
    },
    troubadoursCoat: {
      name: '游吟诗人外套'
    },
    marshalsGreatcoat: {
      name: '元帅大衣'
    },
    buskersGloves: {
      name: '街头乐手手套'
    },
    drummersGloves: {
      name: '鼓手手套'
    },
    standardBearersGloves: {
      name: '旗手手套'
    },
    gildedParadeGloves: {
      name: '镀金阅兵手套'
    },
    glovesOfTheCrownedHand: {
      name: '加冕之手手套'
    },
    wayfarersShoes: {
      name: '旅人之鞋'
    },
    troubadourBoots: {
      name: '游吟诗人之靴'
    },
    heraldsRidingBoots: {
      name: '传令官马靴'
    },
    paradeBoots: {
      name: '阅兵靴'
    },
    bootsOfTheLongProcession: {
      name: '长行列之靴'
    },
    silverWhistle: {
      name: '银哨'
    },
    gatheringHorn: {
      name: '集结号角'
    },
    heartOfTheMountain: {
      name: '山脉之心'
    },
    ringOfAbsolutePower: {
      name: '绝对力量之戒'
    }
  },
  bag: {
    oreCount: '{ore}：{n}',
    noOre: '还没有矿石。去野外开采岩壁上的矿脉吧。',
    equip: '装备',
    unequip: '卸下',
    worn: '你正穿着它。先脱下才能出售。',
    versus: '与{item}对比',
    hint: '点击物品查看。再点一次，或拖到栏位上，即可穿戴。',
    empty: '背包里没有这类物品。',
    slotEmpty: '{slot}：空',
    slotHolds: '{slot}：{item}',
    filter: {
      ore: '矿石',
      all: '全部',
      weapons: '武器',
      armor: '护甲',
      trinkets: '饰品',
      herbs: '草药'
    },
    sort: {
      slot: '类型',
      tier: '品质',
      level: '等级'
    },
    sortBy: '排序：{by}',
    noHerbs: '还没有草药。它们长在野外：从上面走过就能采下。',
    herbCount: '{plant}：{n}'
  },
  shop: {
    buy: '购买',
    sell: '出售',
    owned: '已拥有',
    empty: '今天货架上什么都没有。',
    goods: '在售',
    price: '价格',
    value: '收购价',
    hint: '点击货架或背包里的东西，把它放到桌上，也可以直接拖过去。',
    buyBack: '今日已售',
    buyBackOne: '买回',
    deal: '成交！',
    say: {
      buy: '眼光不错。好好爱惜它，它也会护着你。',
      sell: '行。总会有人想要的。',
      back: '改主意了？没事，还给你。',
      poor: '恐怕你带的钱还差一点。'
    }
  },
  trainer: {
    learn: '学习',
    known: '已学会',
    friend: '{faction}厚待朋友：八折优惠。',
    fee: '学费',
    rank: {
      label: '{n}阶',
      up: '升阶',
      effect: '效果+{effect}%，冷却−{cd}%',
      max: '已达最高阶',
      level: '{n}阶需要等级{lvl}。'
    },
    hint: '选一堂课。边缘是绿色就表示现在可以学。',
    block: {
      'trial': "你还没有通过这个职业的试炼。",
      'parents': "先学会{a}和{b}各一个技能。",
      level: '你的等级太低。',
      attrs: '你的属性太低。',
      gold: '金币不够。'
    }
  },
  healer: {
    talk: '坐下歇一会儿吧。你的药瓶又满了。要是愿意，我还能卖你一条更大的腰带。',
    note: '你每次进入区域都带着 {n} 瓶药水。',
    buy: '多带一瓶 · {n}',
    full: '你的腰带已经挂满了。',
    belt: '药水腰带',
    slotTitle: '腰带已扩充',
    slotBought: '多了一个药瓶槽：现在每次进入区域都带 {n} 瓶生命药水，并可储存 {n} 瓶法力药水。',
    mana: {
      title: '法力药水',
      note: '库存：{n}/{max}。下次来也还在。',
      buy: '一瓶法力药水 · {n}',
      full: '你的库存满了。'
    }
  },
  faction: {
    order: '铁之骑士团',
    syndicate: '灰烬商会',
    circle: '以太议会'
  },
  npc: {
    'mysteriousWanderer': { 'name': "神秘旅人" },
    'fairPip': { 'name': "皮普" },
    'fairBess': { 'name': "老贝丝" },
    'fairHob': { 'name': "霍布" },
    sunkenPriest: { name: "沉没祭司" },
    'fortHale': {
      'name': "黑尔队长",
    },
    'fortMara': {
      'name': "玛拉长老",
    },
    'scoutWren': {
      'name': "斥候雷恩",
    },
    frostDisciple: {
      name: '艾弗·哈斯克'
    },
    windDisciple: {
      name: '凯斯特雷尔·韦恩'
    },
    freedFarmers: {
      name: '乔里·托勒'
    },
    freedHerbalist: {
      name: '布莱尔·霍洛韦尔'
    },
    lightDisciple: {
      name: '奥蕾尔修女'
    },
    freedPeddler: {
      talk: '旅人需要的，这儿应有尽有。几乎全新，大多是吧。',
      name: '奥多·马罗'
    },
    sfShadowRoad: {
      name: '妮特尔·奎克汉德'
    },
    sfShadow: {
      name: '妮特尔·奎克汉德'
    },
    sfGeo: {
      name: '哈罗·弗林特'
    },
    wanderer: {
      name: '流浪者 Pip',
      talk: '路途遥远，钱包却很轻？我这儿什么都有一点。'
    },
    sunfordSmith: {
      name: '铁匠布拉姆',
      talk: '实打实的钢，公道的价。慢慢挑。'
    },
    sunfordPeddler: {
      name: '货郎蒂莉',
      talk: '戒指、护符、各种小玩意儿。这件说不定还真能带来好运。'
    },
    trainerAegis: {
      name: '奥德里克爵士'
    },
    trainerPyro: {
      name: '安珀·雷恩'
    },
    elderMara: {
      name: '玛拉长老'
    },
    sunfordHealer: {
      name: '露恩修女'
    },
    goblinTrader: {
      name: '商人格里克',
      talk: '这些是我家人做的。做工好，价钱公道。'
    },
    captainHale: {
      name: '黑尔队长'
    },
    oakArmorer: {
      name: '护甲匠奥多',
      talk: '我一半的存货都送上城墙了。剩下的你看着拿，合身就行。'
    },
    oakMasterArmorer: {
      name: '奥多大师',
      talk: '好的板甲拿出来了。你绝对有资格看一看。'
    },
    oakWeapons: {
      name: '刀剑商塞娜',
      talk: '锋利、顺手、价钱实在。别摸刀刃。'
    },
    trainerShadow: {
      name: '“低语”'
    },
    trainerSovereign: {
      name: '卡斯特兰勋爵'
    },
    oakHealer: {
      name: '芬恩修士'
    },
    blackMarket: {
      name: '销赃人',
      talk: '两边都不问来路。商会抽成，你拿货。'
    },
    trainerBlood: {
      name: '桑格雷尔医生'
    },
    syndicateBoss: {
      name: '灰烬夫人'
    },
    forgemaster: {
      name: '锻造大师多恩'
    },
    ironWeapons: {
      name: '“锤手”希尔达',
      talk: '件件都是矮人亲手锻的。要是有哪件断了，我得知道怎么断的。'
    },
    ironAetherWorks: {
      name: '工匠沃斯',
      talk: '这里的东西全是研究核心研究出来的。小心点，大多是上了膛的。'
    },
    ironArmor: {
      name: '“铁壁”加伦',
      talk: '甲在架子上，戒指在盘子里。'
    },
    ironOrderArmor: {
      name: '骑士团军需官',
      talk: '需要什么就拿。骑士团照顾自己人。'
    },
    trainerGeo: {
      name: '石足老爹'
    },
    trainerAether: {
      name: '齿轮匠皮姆'
    },
    ironHealer: {
      name: '布琳雅嬷嬷'
    },
    exiledSovereign: {
      name: '流亡的卡斯特兰勋爵'
    },
    trainerChrono: {
      name: '时辰守护者'
    },
    mayorBrenna: {
      name: '布伦娜·奎尔镇长'
    },
    sbHealer: {
      name: '安塞尔修士'
    },
    sbArmorer: {
      name: '格蕾塔·艾恩维恩',
      talk: '山里的钢，河边的价。随便敲敲看。'
    },
    sbWeapons: {
      name: '科尔文·阿什比',
      talk: '阿什比精品刀剑。每道刃都是手工打磨。用我的手。'
    },
    sbJeweler: {
      name: '塔姆·马洛',
      talk: '戒指、护符、幸运石。全是真的。好吧，差不多全是。'
    },
    sbMasterAegis: {
      name: '海尔加·斯托姆希尔德女爵士'
    },
    sbMasterPyro: {
      name: '魔导师伊格内修斯·维尔'
    },
    sbMasterShadow: {
      name: '尼克斯·哈洛韦'
    },
    sbMasterSovereign: {
      name: '珀西瓦尔·阿什科姆勋爵'
    },
    sbMasterGeo: {
      name: '托娃·迪普鲁特奶奶'
    },
    sbMasterAether: {
      name: '昆特·斯普罗基特教授'
    },
    sbMasterChrono: {
      name: '守钟人塞尔温'
    },
    sbMasterBlood: {
      name: '维斯珀·克里姆森利夫'
    },
    sbAlchemist: {
      name: '“蕨笛”奥迪尔'
    },
    sbGambler: {
      name: '佩尔夫人'
    },
    sunfordGambler: {
      name: '“筋斗”多布'
    },
    sunfordCups: {
      name: '“快手”奈尔'
    },
    oakGambler: {
      name: '“丝绒”伦'
    },
    sbCollector: {
      name: '奥尔德·维恩',
      talk: '稀罕的宝贝，只给稀罕的朋友。手上沾着果酱可什么都别碰。'
    },
    sbFence: {
      name: '米蕾拉·索恩',
      talk: '上好的护甲，什么都不问。好吧，问得很少。'
    },
    sbMasterWindrunner: {
      name: '“风翼”塞法'
    },
    sbMasterFrostwarden: {
      name: '“霜心”哈尔瓦德'
    },
    sbMasterLightbringer: {
      name: '“晨湖”奥瑞尔修女'
    },
    sbMasterBeastcaller: {
      name: '“蓟足”罗文老爹'
    },
    sbMasterElementalist: {
      name: '魔导师“四风”艾瑞丝'
    },
    sbMasterSoulwarden: {
      name: '守望者“灯火”奥达莉丝'
    },
    sbMasterIronmonk: {
      name: '“静水”奥鲁大师'
    },
    sbMasterBard: {
      name: '“好天气”拉克'
    }
  },
  quest: {
    final: '这个选择无法更改。',
    needsRep: '{faction}声望 {n}',
    gold: '+{n} 金币',
    goblinKing: {
      title: '哥布林王',
      slay: {
        label: '终结他的统治。'
      },
      pact: {
        label: '提议与桑福德订立贸易协定。'
      },
      ransom: {
        label: '拿走他的财宝，把王冠留给他。'
      }
    },
    siege: {
      title: '奥克黑文围城战',
      defend: {
        label: '保卫奥克黑文。'
      },
      betray: {
        label: '为商会打开城门。'
      }
    },
    core: {
      title: '艾恩霍尔德之心',
      destroy: {
        label: '击碎核心。'
      },
      study: {
        label: '交给议会研究。'
      },
      sell: {
        label: '卖给商会。'
      }
    },
    oracle: {
      title: '溺水先知',
      free: {
        label: '打碎她的锁链。'
      },
      slay: {
        label: '夺走她守护的沙漏。'
      }
    },
    dragon: {
      title: '虚空巨龙',
      slay: {
        label: '屠龙。'
      },
      pact: {
        label: '结盟对抗大恶魔。'
      }
    },
    throne: {
      title: '空王座',
      order: {
        label: '把王座交给铁之骑士团。'
      },
      syndicate: {
        label: '把王座交给灰烬商会。'
      },
      circle: {
        label: '把王座交给以太议会。'
      },
      shatter: {
        label: '击碎王座。'
      },
      claim: {
        label: '自己坐上去。'
      }
    }
  },
  dlg: {
    // ── The Mysterious Wanderer (afterplay phase 10) ──
    'mysteriousWanderer': {
      'hello': { '1': "嗯。你做到了极少有人做到的事。我在裂隙的另一边感觉到了。", '2': "我传授将两派合而为一的古老之道。只传给配得上的人。" },
      'sealed': { '1': "你封印了它。某种意义上，可惜了。我挺喜欢那景色。" },
      'ajar': { '1': "你让它半开着。真大胆。恶魔会让你时刻警醒。" },
      'again': { '1': "又来了。路很长，但你走得不错。" },
      'train': { '1': "给我看看你的两半，我会让它们合而为一。" },
      'trial': { 'say': "你说的是什么试炼？", '1': "毫发无损地守住城门。一次不倒地斩杀巨龙。五次炼狱锻造，连胜五场。", '2': "利维坦之死，以及九头蛇前的一轮完美投掷。每一样都会打开一扇我能指给你看的门。" },
      'who': { '1': "一个旅人。你祖父出生前，我就走在裂隙边缘了。名字会磨损的。" },
      'trainBack': { '1': "多练。两派总要先争吵，才会和解。" },
      'bye': { '1': "小心前行。我会在这里，直到我不在为止。" }
    },
    'fairPip': {
      'hello': { '1': "快来看！九个木桶，一群小鬼，一把木槌。把它们敲回去！", '2': "小鬼会从木桶里冒出来。在沙漏流完前打中二十只。", '3': "别碰金甲的，会扣命。连胜三次，大奖就是你的。" },
      'again': { '1': "还想敲？拿起木槌！" },
      'play': { '1': "举起木槌！它们来了！" },
      'who': { '1': "皮普，专业抓小鬼的。这些都是我亲手抓的。会咬人哦。" },
      'playBack': { '1': "哈！好热闹！再来？" },
      'bye': { '1': "握槌的手放松点！" }
    },
    'fairBess': {
      'hello': { '1': "五个圈，三个头，没有一个会咬人。是我亲手雕的，小心油漆。", '2': "按住蓄劲，松手投掷。蛇头摆到中间时才接得住圈。", '3': "连续套中，每个头多算一分。五个全中，我好好付你。" },
      'again': { '1': "又来跟我这老姑娘较量？" },
      'play': { '1': "给你圈。轻轻扔，乖孩子。" },
      'who': { '1': "在集市路上走了四十年。九头蛇是跟着战争来的。挺应景。" },
      'playBack': { '1': "不错。我死去的老伴扔得更差。" },
      'bye': { '1': "出去时小心油漆。" }
    },
    'fairHob': {
      'hello': { '1': "哦。你好。想掰手腕吗？我会轻点。我尽量。", '2': "圆环和圆圈重合时用力。节拍不对就会滑。", '3': "手臂有力会轻松些。连赢我三次，锻造大师就给你打折。" },
      'again': { '1': "再来一局？从来没人要再来一局。" },
      'play': { '1': "手肘放桌上。你准备好就开始。" },
      'who': { '1': "我是锻造大师的学徒。他说我不知道自己有多大力气。" },
      'playBack': { '1': "好比赛。明天胳膊会酸。大概吧。" },
      'bye': { '1': "早点再来。铁匠铺很安静。" }
    },
    // ── The Breaking (the afterplay, B0–B5) ──
    'story': {
      forge: { back: { '1': "我的锻炉又烧起来了，比以前更旺。恶魔的铁很好熔。", '2': "把你在外面找到的东西带来。我现在能锻造地狱之物了。" } },
      oracle: { lens: { '1': "你曾解救过我。现在我替你去看。收下我的透镜吧。", '2': "透过它看，地图会显示巨兽潜伏之处。" } },
      priest: { lens: { '1': "神谕者不在了，所以现在由我守护她的神殿。这是斯芬克斯守护的东西。", '2': "她的透镜。透过它看，地图会显示巨兽潜伏之处。" } },
      herbs: { scale: { '1': "利维坦的鳞片！轻得像片叶子，还能浮在水上。", '2': "穿上它，浅水就会像坚实的地面一样托住你。" } },
      ghost: { key: { '1': "哦，夺走我王座的人。你杀了我的九头蛇。很好。", '2': "拿走它的火焰钥匙。裂隙之心在燃烧，只有火焰能打开它。" } },
      syndicate: { key: { '1': "九头蛇死了？那它的火焰钥匙就归出价的人。或者归你吧，我猜。", '2': "它能打开裂隙之心。去把它关上，免得它吞了我的生意。" } },
      sealed: {
        sealed: { '1': "就这样，裂隙被封印，世界开始愈合。", '2': "城镇得以重建，歌谣得以传唱，每一首里都有同一个名字。" },
        ajar: { '1': "就这样，裂隙留下了一道缝，世界学会了与它比邻而居。", '2': "城墙仍有人把守，斗技场依旧喧闹，英雄始终严阵以待。" },
      },
      'rift': {
        'scream': {
          '1': "虚空领主倒下了，他身后的裂隙发出尖啸。",
          '2': "那从来不是他的王座。那是他的牢笼，而他就是盖子。",
          '3': "如今裂隙已开，虚空沉睡的一切都在苏醒。",
        },
      },
      'wren': {
        'found': {
          '1': "你在这儿！我是雷恩，一名斥候。我到处找你。",
          '2': "桑福德在燃烧。能逃的人都去了堡垒渡口。",
          '3': "那是通往灰烬峭壁路上的旧要塞。快点，他们需要你。",
        },
      },
    },
    'scoutWren': {
      sealed: { '1': "龙没了！道路已经感觉轻松多了。" },
      'hello': {
        '1': "你来了！我就知道。欢迎来到堡垒渡口。",
        '2': "我替队长侦察道路。问我哪里有麻烦。",
      },
      'again': {
        '1': "已经回来了？路可不会自己侦察。",
      },
      'who': {
        '1': "雷恩。桑福德被烧之前，我替守卫送信。",
      },
      'rumor': {
        'plains': {
          '1': "恶魔占据了桑福德平原的道路。桑福德的导师们被困在后面。",
        },
        'hollows': {
          '1': "哥布林洞窟里满是地狱犬。清理掉它们，桑福德的人就能回家。",
        },
        'woods': {
          '1': "低语森林里有个三头怪物在狩猎。草药师就躲在那里。",
        },
        'outskirts': {
          '1': "半人马在奥克黑文郊外驰骋。要是它们打到城墙，我们需要每一把剑。",
        },
        'siege': {
          '1': "它们的战团被打散了，但更多的正在集结。队长在加固城墙。",
        },
      },
      'bye': {
        '1': "留意道路。我也会盯着。",
      },
    },
    'fortHale': {
      sealed: { '1': "龙死了。我从没想过能活着看到这一天。谢谢你。" },
      'siegeBack': { '1': "还没准备好？那就休息吧。城墙会等你。" },
      'bell': { '1': "那就去城门。告诉我要守得多硬。" },
      'hello': {
        '1': "你来了。很好。我们需要每一把剑，现在比任何时候都需要。",
        '2': "欢迎来到堡垒渡口。城墙虽旧，却是唯一还屹立的。",
      },
      'road': {
        '1': "通往桑福德的路又通了。那里的人在我们城墙后很安全。",
      },
      'herbs': {
        '1': "草药师回来了，药草也带回来了。医务所终于能喘口气。",
      },
      'siege': {
        '1': "你击溃了半人马。但更大的军队要来了，冲着这些城墙来的。",
      },
      'again': {
        '1': "还站着。城墙、士兵，还有我。",
      },
      'fort': {
        '1': "一座旧边境要塞。五十年无人驻守，直到天空被撕裂。",
        '2': "如今它是平原与群山之间最后的安全之地。",
        'say': "这是什么地方？",
      },
      'rumor': {
        'road': {
          '1': "清理平原和洞窟。桑福德的人被困在外面。",
        },
        'woods': {
          '1': "草药师在低语森林，那里还有一头三头巨兽。做好准备。",
        },
        'centaurs': {
          '1': "郊外有半人马。在它们打到这里之前击溃它们的战团。",
        },
        'siege': {
          '1': "休息一下。攻城钟响时，我需要你上城墙。",
        },
      },
      'bye': {
        '1': "剑别离手。",
      },
    },
    'fortMara': {
      sealed: { '1': "你做到了，孩子。我们每个人都欠你一个家。" },
      'siegeBack': { '1': "歇一会儿吧，孩子。钟声还会再响的。" },
      'bell': { '1': "队长的城墙现在由我看守。选吧，我们怎么守。" },
      'hello': {
        '1': "孩子！你还活着。桑福德被烧时，我以为最坏的事发生了。",
        '2': "我们现在是士兵要塞里的客人，老太婆也一样。",
      },
      'command': {
        '1': "黑尔队长与奥克黑文一同陨落了。所以现在要塞听一位老长老的。",
      },
      'home': {
        '1': "桑福德在重建！第一批屋顶已经盖好了。我都要哭了。",
      },
      'again': {
        '1': "还在这里，孩子。还在清点人数。",
      },
      'town': {
        '1': "恶魔从夜空中降下。我们带着能带的东西逃了出来。",
        '2': "有些人没能逃出来。如果可以，把其余的人带回家。",
        'say': "桑福德发生了什么？",
      },
      'rumor': {
        'road': {
          '1': "我们的导师还在桑福德的路上。把他们带到这里来，孩子。",
        },
        'woods': {
          '1': "草药师去低语森林采药，再也没有回来。",
        },
        'centaurs': {
          '1': "郊外有骑手。每晚蹄声如雷。",
        },
        'siege': {
          '1': "城墙很快就要经受考验了。我这把老骨头能感觉到。",
        },
      },
      'bye': {
        '1': "小心前行，孩子。",
      },
    },
    intro: {
      crossing: { 1: '每条道路都通向十字路口……而每个路口，都是战场。' },
      hero: { 1: '一位年轻的英雄，从桑福德的田野出发。' },
      fire: { 1: '烈火回应了召唤。钢铁记住了新的名字。' },
      foes: { 1: '哥布林王，冰霜领主，虚空巨龙……还有大恶魔。' },
      begin: { 1: '你的传奇，此刻开始。' }
    },
    frostDisciple: {
      bye: {
        '1': '注意保暖。'
      },
      who: {
        '2': '艾恩霍尔德的熔炉很暖和。我喜欢这里。',
        '1': '我在冻原打猎。他们把我关了一整个冬天。'
      },
      trainBack: {
        '1': '去练。寒冷很有耐心。你也要一样。'
      },
      ready: {
        weak: {
          '1': '还不行。臂力和心志都要更强。'
        },
        able: {
          '1': '你准备好了。下一课。'
        },
        strong: {
          '1': '你比当年的我更强。需要什么就拿。'
        }
      },
      class: {
        say: '寒霜卫士是什么？',
        '2': '力量用于剑刃。智力用于寒霜。',
        '1': '冷却他们，冻住他们，然后击碎冰。'
      },
      train: {
        '1': '站稳。让寒冷来找你。然后把它送回去。'
      },
      again: {
        '1': '你回来了。很好。'
      },
      hello: {
        '2': '艾弗·哈斯克。“霜心”哈尔瓦德教会了我寒霜。现在我在这里传授它。',
        '1': '自由了。很好。寒冷没能带走我，他们也没能。'
      }
    },
    windDisciple: {
      bye: {
        '1': '盯紧风向。'
      },
      who: {
        '2': '能告诉塞法我还活着吗？她会担心的。',
        '1': '我在去西尔弗布里奇的路上，被困在了峭壁那边。'
      },
      trainBack: {
        '1': '去练练吧。找个风大的地方。'
      },
      ready: {
        weak: {
          '1': '还不行。先变快一点，再回来。'
        },
        able: {
          '1': '你可以学下一招了。看仔细。'
        },
        strong: {
          '1': '你现在比我还快了。喜欢什么就拿吧。'
        }
      },
      class: {
        say: '疾风行者是做什么的？',
        '2': '敏捷让脚步更快。技巧让每支箭都命中。',
        '1': '跑，射，再跑。永远别待在他们瞄准的地方。'
      },
      train: {
        '1': '两脚分开。呼气。让风带着它走。'
      },
      again: {
        '1': '嘿！今天风不错。练一练吗？'
      },
      hello: {
        '2': '凯斯特雷尔·韦恩。“风翼”塞法教我射箭。她教我的，我都能教你。',
        '1': '你把我救出来了！我欠你一切。嗯，欠你很多。'
      }
    },
    freedFarmers: {
      bye: {
        '1': '路上小心。'
      },
      who: {
        '2': '奥克黑文收留了我们。我们用面包报答它。',
        '1': '强盗把我们从田里抓走，扔在林子里等死。'
      },
      favorDone: {
        say: '狼不会再来烦你们了。',
        '2': '拿着这个。不多，但来得清白。',
        '1': '夜里又安静了。我们终于能睡个好觉。'
      },
      waiting: {
        say: '关于那些狼……',
        '1': '狼还在附近。昨晚我们还听见了。'
      },
      favor: {
        say: '有什么我能帮忙的吗？',
        '2': '帮忙减少一些，好吗？杀八只应该能给它们个教训。',
        '1': '低语森林里跑出来的狼老是叼走我们的羊。'
      },
      again: {
        '1': '我们的英雄来了。来吃点东西吗？'
      },
      hello: {
        '2': '乔里·托勒。我们现在在城墙外种地。嗯，算是在努力吧。',
        '1': '没有你，我们早就死了。我和我儿子都是。谢谢你。'
      }
    },
    freedHerbalist: {
      bye: {
        '1': '轻点走。那里有东西在生长。'
      },
      who: {
        '2': '他们也不全错。',
        '1': '我是山里来的草药师。哥布林把我当成了女巫。'
      },
      favorDone: {
        say: '这是你要的日光瓣。',
        '2': '给，你的报酬。再次谢谢你。',
        '1': '哦，这些太完美了。闻闻看！'
      },
      waiting: {
        say: '关于那些日光瓣……',
        '1': '还在找吗？日光瓣喜欢开阔的阳光。'
      },
      favor: {
        say: '有什么我能为你做的吗？',
        '2': '它们长在平原上。我会付你好价钱。',
        '1': '我的存货都丢在那个笼子里了。你能给我带三朵日光瓣吗？'
      },
      again: {
        '1': '啊，又见面了。你的靴子有青苔的味道。很好。'
      },
      hello: {
        '2': '我是布莱尔。我采集、晾晒生长的东西。西尔弗布里奇好心收留了我。',
        '1': '我就知道会有人来。哥布林从来不懂草药。也不懂善意。'
      }
    },
    lightDisciple: {
      bye: {
        '1': '愿你行于光中。'
      },
      who: {
        '2': '桑福德明亮又安静。这两样我都需要。',
        '1': '我去沉没神殿祈祷。娜迦却另有打算。'
      },
      trainBack: {
        '1': '温和地去吧。也让他们看见你到来。'
      },
      ready: {
        weak: {
          '1': '还不行。先要更清明的头脑和更温暖的心。'
        },
        able: {
          '1': '你已经准备好学下一课了。来，站到光里。'
        },
        strong: {
          '1': '你现在比我更耀眼了。需要什么尽管拿。'
        }
      },
      class: {
        say: '光明使者是做什么的？',
        '2': '智力让光更强大。魅力让光更温暖。',
        '1': '我们承载着黎明。用来战斗的光，用来治愈的光。'
      },
      train: {
        '1': '张开双手。让光从手中穿过，而不是从手里发出。'
      },
      again: {
        '1': '欢迎回来。今天的阳光很温柔。'
      },
      hello: {
        '2': '我是奥蕾尔。奥瑞尔修女教会了我光。现在我在这里传授它。',
        '1': '愿光与你同在。你在黑暗中找到了我，我不会忘记。'
      }
    },
    freedPeddler: {
      bye: {
        '1': '小心强盗。他们可不爱分享。'
      },
      shopBack: {
        '1': '跟你做生意真愉快，朋友。'
      },
      who: {
        '2': '现在我在桑福德做买卖。这里更安全。大体上。',
        '1': '强盗抢了我的货车，把我塞进一个箱子里。太没礼貌了。'
      },
      trade: {
        '1': '戒指、手套、靴子。给你半价。嗯，差不多吧。'
      },
      again: {
        '1': '我的救命恩人！来来来，好东西我都给你留着呢。'
      },
      hello: {
        '2': '奥多·马罗，乐意效劳。货郎、补锅匠，还是个感激不尽的人。',
        '1': '你！就是你打开了那个笼子！不然我早烂在里面了。'
      }
    },
    sfShadowRoad: {
      hello: {
        '1': '瞬移。有兴趣吗？'
      },
      again: {
        '1': '又来学新把戏了？'
      },
      train: {
        '1': '看仔细。一步，你就已经在别处了。'
      },
      trainBack: {
        '1': '很好。现在去别的地方吧。'
      },
      bye: {
        '1': '别被抓住了。'
      }
    },
    sfShadow: {
      hello: {
        '1': '没听见你进来。这通常是我的把戏。',
        '2': '我是妮特尔·奎克汉德。我教安静的技艺：匕首、暗影，还有提前开溜。'
      },
      again: {
        '1': '又来了？很好。希望没人看见你。'
      },
      train: {
        '1': '脚步要轻，手要快。别被自己的刀绊倒。'
      },
      class: {
        '1': '趁对方不注意时出手，然后人早已在别处。',
        '2': '一切都靠敏捷。手快，脚快，溜得也快。',
        say: '影刃是做什么的？'
      },
      ready: {
        strong: {
          '1': '你现在比我还快了。想拿什么就拿吧，我都不会察觉。'
        },
        able: {
          '1': '你可以学下一招了。看仔细，我只演示一次。'
        },
        weak: {
          '1': '还不行。先练得更快些，不然影子会绊倒你。'
        }
      },
      town: {
        '1': '安静的小镇，老实的人。没人会多看一眼农夫的斗篷。完美。',
        say: '为什么在桑福德这里教？'
      },
      trainBack: {
        '1': '去吧。找个守卫看不见的地方练习。'
      },
      bye: {
        '1': '看好你的钱袋。'
      }
    },
    sfGeo: {
      hello: {
        '1': '小心那些石头。有些正在听着呢。',
        '2': '我是哈罗·弗林特。我教古老的大地魔法：岩石、根须，还有一点小地震。'
      },
      again: {
        '1': '啊，你回来了。大地早就告诉我你要来。'
      },
      train: {
        '1': '双脚踩平，慢慢呼吸。感受脚下的分量。很好。'
      },
      class: {
        '1': '向大地求助。需要时筑墙，墙挡不住时就用尖刺。',
        '2': '力量用来托住岩石，智力用来塑造它。两者缺一不可。',
        say: '地术师是做什么的？'
      },
      ready: {
        strong: {
          '1': '如今岩石比我先回应你了。需要什么尽管拿。'
        },
        able: {
          '1': '你可以上下一课了。把手放在地上。听。'
        },
        weak: {
          '1': '还不行。力量再多些，头脑再清醒些，否则岩石不会听你的。'
        }
      },
      farms: {
        '1': '每年春天都会。大麦长高一掌，却没人知道为什么。别告诉他们。',
        say: '大地也会帮助农田吗？'
      },
      trainBack: {
        '1': '去吧。还有，把那块石头放回原处。'
      },
      bye: {
        '1': '脚步放轻。大地会记得。'
      }
    },
    smalltalkSunford: {
      weather: {
        '1': '今晚要下雨。我这膝盖疼了一整天了。',
        '2': '你这膝盖上周也这么说过。',
        '3': '那不是下雨了吗？只是没下在这儿。'
      },
      harvest: {
        '1': '今年大麦长得真好。',
        '2': '但愿我们能留得住。'
      },
      goblins: {
        '1': '哥布林从米勒农场叼走了三只母鸡。',
        '2': '又来了？这个月都第二回了。',
        '3': '总得有人去管管那些洞窟。'
      },
      kingGone: {
        '1': '听说哥布林王死了。',
        '2': '好啊。说不定我今后能一觉睡到天亮了。'
      },
      pact: {
        '1': '我今早从一个哥布林那儿买了把汤勺。',
        '2': '好用吗？',
        '3': '说实话，比我那把还好。别告诉别人。'
      },
      bram: {
        '1': '布拉姆天亮前就守在铁砧边了。',
        '2': '他一担心事就这样。'
      },
      pie: {
        '1': '我是不是闻到苹果派的香味了？',
        '2': '刚才还有呢。孩子们先找到了。',
        '3': '我再烤一个。这回得藏好点。'
      },
      road: {
        '1': '平原那条路一个礼拜没人走了。',
        '2': '有强盗在，也怪不得谁。'
      },
      hero: {
        '1': '有人把平原路上的强盗清走了。',
        '2': '谢天谢地。我姐姐又能来看我了。'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': '一棵卷心菜两个银币。两个！',
        '2': '现在什么东西进城门都便宜不了。',
        '3': '那我自己种好了。屋顶上种也行。'
      },
      watch: {
        '1': '城门的守卫加了一倍。',
        '2': '好事。我睡得安稳多了。'
      },
      caravan: {
        '1': '香料商队又晚了。',
        '2': '是强盗吗？',
        '3': '也可能是泥。希望是泥吧。'
      },
      siege: {
        '1': '农田那边扎了一支军队。',
        '2': '那我们得趁现在把地窖装满。'
      },
      saved: {
        '1': '围城解的时候你在城墙上吗？',
        '2': '说实话，我躲在床底下。',
        '3': '半个镇子都是。不过我们还在这儿呢。'
      },
      fountain: {
        '1': '我往喷泉里扔了枚硬币祈福。',
        '2': '希望你许的愿是让卷心菜便宜点。'
      },
      ash: {
        '1': '什么东西闻着都还是烟味。',
        '2': '会散的。到头来什么都会散。'
      },
      hide: {
        '1': '昨晚你听见街上有靴子声了吗？',
        '2': '小声点。你不知道谁在听。',
        '3': '对不起。我只是……对不起。'
      },
      bread: {
        '1': '我找到了半个面包。来，分你一点。',
        '2': '你真是个好人。谢谢你。'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': '第四层有一条不错的铜矿脉。',
        '2': '是铜。我还指望是银呢。',
        '3': '铜能付房租，银只能付梦想。'
      },
      forge: {
        '1': '那座大熔炉一百年没熄过火。',
        '2': '我爷爷还帮着点过火呢，你知道吧。'
      },
      beard: {
        '1': '你把胡子修短了。',
        '2': '离铁砧太近，烧着了。',
        '3': '会长回来的。再说短点更适合你。'
      },
      core: {
        '1': '深井底下有东西在发光。',
        '2': '那底下发光的没一样是好东西。待在上面。'
      },
      order: {
        '1': '骑士团的甲匠干活真快，这点我得承认。',
        '2': '快是快。能不能经久耐用，等着瞧。'
      },
      circle: {
        '1': '议会那帮人干活时哼着小曲。',
        '2': '至少比你唱得好听。'
      },
      cold: {
        '1': '今早冷得刺骨。',
        '2': '那就过来站炉子边上。'
      }
    },
    smalltalkKids: {
      tag: {
        '1': '抓到你啦，该你当鬼了！',
        '2': '不公平，我还没准备好呢！'
      },
      dragon: {
        '1': '我长大了要骑龙。',
        '2': '龙不会让人骑的。',
        '3': '好心的龙说不定会。'
      },
      sword: {
        '1': '快看，我捡到一把剑！',
        '2': '那是根棍子。'
      },
      frog: {
        '1': '井边有只青蛙。',
        '2': '我们能养它吗？',
        '3': '妈妈说不许再抓青蛙了。'
      }
    },
    ui: {
      overheard: '镇民',
      hero: '你',
      leave: '结束对话',
      topics: '说点什么',
      gotGold: '获得 {n} 金币',
      gotItem: '获得：{item}',
      hint: '已在地图上标记：{zone}',
      needs: {
        attr: '需要{attr} {n}',
        level: '需要 {n} 级',
        rep: '需要{faction}声望 {n}',
        gold: '需要 {n} 金币',
        full: '你已带满了',
        other: '还不行'
      }
    },
    hero: {
      'siege': "我们上城墙吧。",
      forge: '我想用一下你的熔炉。',
      learnSmith: '你能教我打铁吗？',
      ore: '我有些矿石要卖。',
      bye: '那我不打扰你了。',
      trade: '能看看你的货吗？',
      train: '教教我。',
      heal: '能帮我疗疗伤吗？',
      mana: '你这儿有补法力的东西吗？',
      who: '冒昧问一句，你是谁？',
      rumor: '最近听到什么消息吗？',
      ready: '你觉得我可以学更多了吗？',
      brew: '能帮我熬点什么吗？',
      play: '算我一个。'
    },
    sunfordSmith: {
      forge: {
        '1': '炉子热着。当心手指。'
      },
      learnSmith: {
        '2': '金属最亮的时候敲。敲偏了就是废铁。去吧。',
        '1': '打铁？哼。锤子要这么握，别像握棍子。'
      },
      ore: { '1': '矿石，嗯？给我看看。按块付钱，分量公道。' },
      sellBack: { '1': '分量公道，钱也公道。再找到就拿来。' },
      forgeBack: {
        '1': '不坏。也不算好。继续练。'
      },
      hello: {
        '1': '以前没见过你。清了那条路的就是你？',
        '2': '布拉姆，这炉子归我管。要用刀剑，来找我。'
      },
      kingDead: {
        '1': '听说哥布林王死了。我可不会想他。'
      },
      kingPact: {
        '1': '哥布林现在都在广场上做买卖了。真没想到还能看到这一天。'
      },
      kingRansom: {
        '1': '你让哥布林王留着王冠。他还会回来的，你知道吧。'
      },
      ending: {
        '1': '全国都在谈论你。不过，你还要磨刀石吗？'
      },
      again: {
        '1': '又来了。要点什么？'
      },
      trade: {
        '1': '实打实的钢，公道的价。看看吧。'
      },
      who: {
        '1': '布拉姆。守着这铁砧，差不多三十年了。',
        '2': '马蹄铁、犁头，偶尔打把剑。最近基本全是剑。'
      },
      gear: {
        '1': '打算挨揍就带面盾。大多数人都得挨。',
        '2': '重钢得有力气使。先练力量。',
        say: '出去的话，我该带点什么？'
      },
      rumor: {
        plains: {
          '1': '平原路上有强盗。换了我，就从那儿开始。'
        },
        hollows: {
          '1': '哥布林来自平原那边的洞窟。他们的王就在底下。'
        },
        woods: {
          '1': '平原往东是低语森林。听说那些树会动。'
        },
        siege: {
          '1': '奥克黑文那边有烟。一支军队在郊外扎营了。'
        },
        north: {
          '1': '艾恩霍尔德的钢又顺着路运下来了。说实话，比我打的好。'
        }
      },
      shopBack: {
        '1': '好好爱惜，它就会护着你。'
      },
      bye: {
        '1': '路上当心。'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': '哎呀，你好！要买还是随便看看？都行呀。',
        '2': '我是蒂莉。戒指、护符，各地来的小玩意儿，我都有。'
      },
      rival: {
        '1': '你见过那个哥布林的摊子吗？他的价比我的还低。太不公平了。'
      },
      again: {
        '1': '你可来了！我留了几样东西，你应该会喜欢。'
      },
      trade: {
        '1': '随便看。这件很灵，大概吧。'
      },
      who: {
        '1': '我走遍各条路，收人家想扔掉的东西。',
        '2': '有时候也能捡到好东西。强盗逃跑的时候，掉得可多了。'
      },
      trinkets: {
        '1': '可以戴两件，每只手一件。在外头，点点滴滴都有用。',
        say: '饰品到底有什么用？'
      },
      stolen: {
        '1': '啊。你还真会问话。',
        '2': '这枚戒指给你，咱们别聊我是在哪儿找到的。',
        say: '这些东西到底是哪儿来的？'
      },
      rumor: {
        arenaShut: {
          '1': '这儿往南有座老斗技场。哥布林袭击期间，关得严严实实。'
        },
        arenaOpen: {
          '1': '斗技场又开了。听说要打八轮。大家都在下注。'
        },
        east: {
          '1': '奥克黑文对闪亮的东西出价可高了。就在东边，穿过森林。'
        }
      },
      shopBack: {
        '1': '等钱包鼓了再来哦！'
      },
      bye: {
        '1': '一路平安。在外面把钱看紧点。'
      }
    },
    trainerAegis: {
      hello: {
        '1': '站直了。你面前的是铁之骑士团的骑士。',
        '2': '奥德里克爵士。我教人挡在别人和伤害之间。'
      },
      saved: {
        '1': '奥克黑文还在，听说你当时就在城墙上。干得好。'
      },
      fallen: {
        '1': '你打开了奥克黑文的城门。我不会假装忘了。你想要什么？'
      },
      dragon: {
        '1': '你杀了山巅那条龙？真想亲眼看看。'
      },
      friend: {
        '1': '骑士团对你评价很高。对朋友，我的课收费更低。'
      },
      foe: {
        '1': '骑士团称你为敌人。我还是会教你。这是我的决定，不是他们的。'
      },
      again: {
        '1': '又来练习了？'
      },
      train: {
        '1': '好。看仔细，我只演示一遍。'
      },
      class: {
        '1': '我们替别人挨下本该落在他们身上的攻击。道理简单，做起来难。',
        '2': '举盾要力量，撑得住要耐力。',
        say: '神盾骑士到底是做什么的？'
      },
      ready: {
        strong: {
          '1': '我会的大部分你都学得动了。继续练耐力。'
        },
        able: {
          '1': '你可以学下一课了。别骄傲。'
        },
        weak: {
          '1': '还不行。你会比盾先累倒。再练练力量和耐力。'
        }
      },
      order: {
        '1': '我们守护道路，维持法纪。有人说我们太严厉。',
        '2': '站在我们这边，我们的甲匠和师傅都会记住你。',
        say: '给我讲讲铁之骑士团。'
      },
      trainBack: {
        '1': '练到腻为止。然后继续练。'
      },
      bye: {
        '1': '小心点。'
      }
    },
    trainerPyro: {
      hello: {
        '1': '哎，来学徒了？太好了。不过，你最好站远一点。',
        '2': '我是安珀·雷恩，教火焰术。大多数时候，它都听我的。'
      },
      core: {
        '1': '你把核心交给议会了！真等不及想看看我们能从里面学到什么。'
      },
      friend: {
        '1': '议会对你评价很高。顺便说一句，这意味着打折。'
      },
      foe: {
        '1': '议会对你不太高兴。不过我还是会教你，悄悄地。'
      },
      again: {
        '1': '你回来啦！准备好点点什么了吗？'
      },
      train: {
        '1': '好了。看我的手，还有，把你的袖子离我远点。'
      },
      class: {
        '1': '主要是点火。然后让火按你的意思蔓延。',
        '2': '全靠智力。头脑越敏锐，火焰越炽热。',
        say: '炎术师到底是做什么的？'
      },
      ready: {
        strong: {
          '1': '说真的？你都能教教别人了。想学什么随便拿。'
        },
        able: {
          '1': '你可以学下一个法术了。来，我教你。'
        },
        weak: {
          '1': '恐怕还不行。智力不够，火就会失控。'
        }
      },
      circle: {
        '1': '学者们。我们研究世界是由什么构成的。有些东西会爆炸。',
        say: '以太议会是什么人？'
      },
      trainBack: {
        '1': '去练习吧。找个不会着火的地方，拜托。'
      },
      bye: {
        '1': '照顾好自己！'
      }
    },
    elderMara: {
      hello: {
        '1': '原来你就是从那条路来的人。过来，让我好好看看你。',
        '2': '我是玛拉。我照看这个镇子……哎呀，有四十年了。'
      },
      slain: {
        '1': '洞窟安静了。你做的事不容易，可我们能睡个安稳觉，全靠它。'
      },
      pact: {
        '1': '哥布林在我的广场上卖东西。是你说服他们的，对吧？'
      },
      ransom: {
        '1': '你收了他的金子，却让他留着王冠。我不会假装自己不失望。'
      },
      saved: {
        '1': '奥克黑文传来消息，城门守住了。你在那儿，我很高兴。'
      },
      fallen: {
        '1': '听说奥克黑文烧了。我不想听是怎么回事。今天不想。'
      },
      ending: {
        '1': '听说是你决定了恐惧要塞的命运。从我们这条小路，走到了那里。'
      },
      again: {
        '1': '坐一会儿吧。路又不会跑。'
      },
      reward: {
        '1': '民兵守不住的那条路，是你守住的。镇上凑了一点心意。',
        '2': '不多。是我们能拿出来的。',
        say: '听说你想见我？'
      },
      quest: {
        '1': '袭击来自哥布林洞窟。他们给自己加冕了一个王。',
        '2': '你想让我杀了他？',
        '3': '我只想让袭击停下来。怎么停……那得你到了底下自己决定。',
        '4': '洞窟就在平原那边。一定要小心。',
        say: '桑福德遇上什么麻烦了？'
      },
      king: {
        say: '关于哥布林王……',
        slay: {
          '1': '他没了，商队又能走了。我就不问你是什么感觉了。'
        },
        pact: {
          '1': '一份贸易协定。我母亲要是听了得晕过去。不过，做买卖总比办丧事强。'
        },
        ransom: {
          '1': '金子很快就花完，怨恨可不会。袭击再来时，记住这句话。'
        }
      },
      town: {
        '1': '大多是农夫。一个铁匠，一个治疗师，还有两位肯迁就我们的老师。',
        '2': '旅途之间就在这儿歇着。家，不就是干这个的嘛。',
        say: '给我讲讲桑福德。'
      },
      next: {
        say: '我接下来该去哪？',
        plains: {
          '1': '先走平原那条路。没有商队，我们就没饭吃。'
        },
        hollows: {
          '1': '哥布林洞窟。袭击不停，别的地方都不安全。'
        },
        woods: {
          '1': '往东，穿过低语森林。那是去奥克黑文的路。'
        },
        oakhaven: {
          '1': '奥克黑文被围了。郊外要是失守，镇子也保不住。'
        },
        north: {
          '1': '我想是往北。灰烬峭壁，再过去是艾恩霍尔德。只会越来越难。'
        }
      },
      bye: {
        '1': '完完整整地回来。我只求这个。'
      },
      map: {
        '1': '这是鲁克队长的地图！他在被哥布林抓住之前，把它撕碎，把碎片藏了起来。',
        '2': "找到六块碎片，X就会指路：就在灰烬峭壁的某处。在那儿挖，就有金子。",
        say: '我找到了一块旧地图的碎片。'
      }
    },
    sunfordHealer: {
      hello: {
        '1': '别动，一下就好。不，你没事。习惯了，抱歉。',
        '2': '我是露恩修女。路上弄坏的东西，我都能修补。'
      },
      again: {
        '1': '还好好的？那就好。反正先坐下。'
      },
      heal: {
        '1': '坐下歇一会儿。你走之前，我把药瓶都装满。'
      },
      mana: {
        '1': '这瓶挺苦的。法术用完的时候再喝。'
      },
      brew: {
        '1': '让我看看你的草药。我来调点比我的魔力补药好喝的东西。'
      },
      potions: {
        '1': '每场战斗你都带几瓶药。要在需要之前喝，别等到之后。',
        '2': '想多带点的话，我可以卖你一条更大的腰带。',
        say: '药水怎么用？'
      },
      rumor: {
        goblins: {
          '1': '哥布林在投石上涂了东西。要是觉得恶心，就回来找我。'
        },
        spiders: {
          '1': '这周我治了三个被森林里的蜘蛛咬伤的人。那边留神脚下。'
        },
        burns: {
          '1': '总有士兵从北边下来，带着烧伤。听说是灰烬峭壁那边。'
        }
      },
      healBack: {
        '1': '腰带装满，头低一点。'
      },
      brewBack: {
        '1': '小心，很烫。别一次全喝光。'
      },
      bye: {
        '1': '在外面照顾好自己。'
      }
    },
    goblinTrader: {
      hello: {
        '1': '你就是缔结盟约的人。我们的王说，欢迎你来这里。',
        '2': '我是格里克。我卖哥布林做的东西。做工好，价钱公道。'
      },
      again: {
        '1': '朋友。很高兴再见到你。'
      },
      trade: {
        '1': '请看。这些是我家人做的。'
      },
      king: {
        '1': '他现在吃得好了。不再有袭击。我的族人也没那么饿了。',
        '2': '他常常提起你，带着敬意。',
        say: '你们的大王还好吗？'
      },
      town: {
        '1': '人们还是会盯着我看。但是面包师给我派吃。我喜欢那个派。',
        say: '你喜欢桑福德吗？'
      },
      rumor: {
        crags: {
          '1': '我的表兄弟们在北边的黑岩里挖矿。他们说，那里现在有火在行走。'
        },
        deep: {
          '1': '有什么东西正在深处苏醒。哥布林能从地面感觉到。'
        }
      },
      shopBack: {
        '1': '谢谢。欢迎再来。'
      },
      bye: {
        '1': '一路平安，朋友。'
      }
    },
    captainHale: {
      hello: {
        '1': '又多了一把剑。很好。多一把是一把。',
        '2': '黑尔队长。奥克黑文守卫队剩下的人，归我指挥。'
      },
      saved: {
        '1': '城门守住了。三百年了，又多撑了一年。这份情我欠你的。'
      },
      ending: {
        '1': '听说是你决定了恐惧要塞的归属。跟那比起来，我这些城墙都显得小了。'
      },
      again: {
        '1': '城墙还立着。至少今天是。'
      },
      after: {
        '1': '见到你真好。奥克黑文没有忘记。'
      },
      quest: {
        '1': '很糟。一个叫克拉格的军阀把我们围住了，而且他可不白打仗。',
        '2': '谁在给他出钱？',
        '3': '灰烬商会。他们想要一座自己的城，而我们的有城墙。',
        '4': '去端了他在奥克黑文郊外的营地。一切就在那儿了结，不管怎么了结。',
        say: '情况有多糟？'
      },
      siege: {
        '1': '他们是不是许你镇子的三分之一？给我的是四分之一。',
        '2': '商会现在会找上你。在路上小心背后。',
        say: '关于围城……'
      },
      town: {
        '1': '一座贸易镇。平原和山区之间来往的货物，都得在这儿交过路费。',
        '2': '所以人人都想要它。也所以我不会放手。',
        say: '给我讲讲奥克黑文。'
      },
      order: {
        '1': '我对奥克黑文负责。骑士团和我大多数时候意见一致。不是每天。',
        say: '你听命于铁之骑士团吗？'
      },
      rumor: {
        crags: {
          '1': '森林以北，地面又黑又在燃烧。那是灰烬峭壁。多半是邪教徒。'
        },
        mines: {
          '1': '艾恩霍尔德不再送钢来了。他们的矿井里出了问题。'
        },
        north: {
          '1': '极北那边安静下来了。以我的经验，这从来不是好事。'
        }
      },
      bye: {
        '1': '剑别离手。'
      }
    },
    oakArmorer: {
      forge: {
        '1': '铁砧归你了。打点结实耐用的东西。'
      },
      learnSmith: {
        '2': '盯着光芒。敲它的中心，敲三次，金属就会记住。',
        '1': '想学这门手艺？好。奥克黑文需要每一把锤子。'
      },
      ore: { '1': '原矿！军械库从来不够用。能匀多少就卖多少。' },
      sellBack: { '1': '每一块都会砌进城墙。谢谢你。' },
      forgeBack: {
        '1': '好钢。城墙谢谢你。'
      },
      hello: {
        '1': '要是想买头盔，抱歉。都在城墙上呢。',
        '2': '奥多。我做护甲。最近没怎么睡。'
      },
      again: {
        '1': '还在这儿。还是什么都缺。'
      },
      trade: {
        '1': '我一半的存货都送上城墙了。剩下的你看着拿，合身就行。'
      },
      who: {
        '1': '我给这个镇子做了二十年护甲。从没见过全部同时穿在身上。'
      },
      armor: {
        '1': '站着不动硬扛，穿板甲。到处跑动，穿皮甲。身手快，穿长袍。',
        say: '我该穿哪种护甲？'
      },
      rumor: {
        backRoom: {
          '1': '围城要是解了，我就开后屋。好的板甲都在里面。'
        }
      },
      shopBack: {
        '1': '能扛住的。到现在不是一直扛着吗。'
      },
      bye: {
        '1': '在外面低着点头。'
      }
    },
    oakMasterArmorer: {
      forge: {
        '1': '炉火已经封好等着了。动手吧。'
      },
      learnSmith: {
        '2': '三击，每一击都落在光芒中心。秘诀就这么多。',
        '1': '自从围城之后，谁来问我都教。来，站这儿。'
      },
      ore: { '1': '还有矿石给城墙？你能匀出的每一块我都买。' },
      sellBack: { '1': '愿你得福。城墙又能多几块甲板了。' },
      forgeBack: {
        '1': '每一击都让你更进一步。随时再来。'
      },
      hello: {
        '1': '你来啦！快进来。后屋开着，专门为你开的。',
        '2': '现在大家都叫我奥多大师了。有点太平日子，生意就是不一样。'
      },
      ending: {
        '1': '从我们的城门到恐惧要塞。我逢人就说，那身护甲是我给你量身做的。'
      },
      again: {
        '1': '见到你真好。今天要点什么？'
      },
      trade: {
        '1': '好的板甲拿出来了。你绝对有资格看一看。'
      },
      town: {
        '1': '热闹，吵嚷，满街商人都在抱怨过路费。',
        '2': '太棒了。我已经好几个星期没安静过一个钟头了。',
        say: '镇子现在怎么样？'
      },
      rumor: {
        mines: {
          '1': '我的钢来自艾恩霍尔德，他们没消息了。该有人去看看他们的矿井。'
        },
        tundra: {
          '1': '我打过的最好的矿石出自冻原。发现它的人再没回来过。'
        }
      },
      shopBack: {
        '1': '要是穿着不合适，拿回来，我给你改。'
      },
      bye: {
        '1': '随时欢迎你来。'
      }
    },
    oakWeapons: {
      hello: {
        '1': '看还是买？都行。就是别摸刀刃。',
        '2': '塞娜。我卖刀剑。你拿它们做什么，是你的事。'
      },
      saved: {
        '1': '围城解了啊。对镇子是好事。不过对我的生意来说，打仗还好些。'
      },
      again: {
        '1': '回来找更锋利的？'
      },
      trade: {
        '1': '锋利，平衡，价格公道。慢慢看。'
      },
      who: {
        '1': '三场战争，我两边都卖过。我还在这儿。他们大多数可不在了。'
      },
      rumor: {
        krag: {
          '1': '克拉格的人拿着好钢。商会的钱买的。有机会的话，值得捡一把。'
        },
        which: {
          '1': '快剑看敏捷。弓和枪看技巧。得清楚自己属于哪种。'
        }
      },
      shopBack: {
        '1': '记得上油。生锈毁掉好刃，比骨头还快。'
      },
      bye: {
        '1': '别欠着我的钱就死了。'
      }
    },
    trainerShadow: {
      hello: {
        '1': '我走到你背后，你都没听见。大多数人都这样。',
        '2': '他们叫我“低语”。我教人怎么不被看见。'
      },
      fallen: {
        '1': '镇上安静多了。守卫少了。对我们有些人来说，活儿更好干了。'
      },
      friend: {
        '1': '商会把你当朋友。朋友付得少。记住这点。'
      },
      foe: {
        '1': '商会想要你的命。我拿钱是来教人的，不是来杀人的。所以，上课。'
      },
      again: {
        '1': '你还是太吵。我们来改。'
      },
      train: {
        '1': '那就安静点。看我的脚，别看我的手。'
      },
      class: {
        '1': '就是已经站在你背后的那个人。进去，一刀，消失。',
        '2': '敏捷最要紧。想让那一刀见效，还得有技巧。',
        say: '影刃是什么？'
      },
      ready: {
        strong: {
          '1': '你现在动作不错。剩下的都拿去吧。放烟幕，带点技巧来。'
        },
        able: {
          '1': '你的手够快了。下一步。'
        },
        weak: {
          '1': '还不行。你脚步太重。练练敏捷。'
        }
      },
      syndicate: {
        '1': '发现法律是有价格的人。我不评判。我只收钱。',
        say: '灰烬商会是什么人？'
      },
      trainBack: {
        '1': '现在去没人看得见的地方练。'
      },
      bye: {
        '1': '你从没见过我。'
      }
    },
    trainerSovereign: {
      hello: {
        '1': '你可以走近些。就到那儿，够近了。',
        '2': '卡斯特兰勋爵，出自奥克黑文最古老的家族。我教授统御之道。'
      },
      saved: {
        '1': '我的镇子还在，我家族的名声也在。我谢谢你。是真心的。'
      },
      friend: {
        '1': '骑士团的朋友。我会降低费用。请别到处宣扬。'
      },
      foe: {
        '1': '骑士团的名单上有你的名字。我还是会教你。钱就是钱。'
      },
      again: {
        '1': '啊，又是你。我们继续？'
      },
      train: {
        '1': '很好。看看命令是怎么下达的，又是怎么被执行的。'
      },
      class: {
        '1': '不独自作战的人。你一声召唤，卫兵就替你作战。',
        '2': '靠魅力。没人会追随一个听不见声音的领袖。',
        say: '大君主是什么？'
      },
      ready: {
        strong: {
          '1': '你现在有真正的气场了。把我剩下的课都学了吧。'
        },
        able: {
          '1': '你的声音传得开了。可以学下一课了。'
        },
        weak: {
          '1': '恐怕现在还没人会追随你。练练魅力。'
        }
      },
      family: {
        '1': '黑尔队长脚下的城墙是我们家族建的。他忘了。我来提醒他。',
        say: '给我讲讲你的家族。'
      },
      trainBack: {
        '1': '去吧。试着带领一个人。'
      },
      bye: {
        '1': '再会。'
      }
    },
    oakHealer: {
      hello: {
        '1': '下一位！哦，你是走着来的。这可真难得。',
        '2': '芬恩修士。城墙上四十个伤员，却只有我一个人。'
      },
      saved: {
        '1': '三天没有新伤员了。我都不知道该干什么好了。'
      },
      again: {
        '1': '你又来了，还是自己走来的。很好。'
      },
      heal: {
        '1': '躺这儿，干净的那张床。好了。药瓶都装满了，走吧。'
      },
      mana: {
        '1': '法力药剂。尝起来像旧硬币，但管用。'
      },
      potions: {
        '1': '腰带更长的话，可以。那个我卖。装满药瓶是免费的。',
        say: '我能多带些药水吗？'
      },
      rumor: {
        archers: {
          '1': '克拉格的弓箭手瞄得低。一直移动，他们大多射不中。'
        },
        north: {
          '1': '我见到的是烧伤、冻伤，还有一个发誓被雕像咬了的人。'
        }
      },
      healBack: {
        '1': '走吧。下次来聊聊天，别来缝针了。'
      },
      bye: {
        '1': '保重。还有，吃点东西。'
      }
    },
    blackMarket: {
      hello: {
        '1': '这儿不报名字。不过谁开的城门，我知道。人人都知道。',
        '2': '叫我销赃人就行。这儿的东西都是从某处来的。'
      },
      foe: {
        '1': '商会现在不太喜欢你。不过，你的金币我们欢迎。'
      },
      again: {
        '1': '又来了。没人跟着你吧？'
      },
      trade: {
        '1': '两边都不问来路。商会抽成，你拿货。'
      },
      who: {
        '1': '那场火之前我卖蜡烛。老实生意。可不赚钱。'
      },
      armor: {
        '1': '甲匠都走了，朋友。原因你比我清楚。',
        say: '有护甲卖吗？'
      },
      rumor: {
        citadel: {
          '1': '去年极北冒出一座要塞。没人建过它。'
        },
        crystals: {
          '1': '有人在收购所有能找到的虚空水晶。不是我们。这让我不安。'
        }
      },
      shopBack: {
        '1': '你从没来过这儿。'
      },
      bye: {
        '1': '脚下小心。瓦砾会动。'
      }
    },
    trainerBlood: {
      hello: {
        '1': '来客人了。请别碰那些罐子。',
        '2': '桑格雷尔医生。奥克黑文的新主人不问我教什么。很清静。'
      },
      found: {
        '1': '你找到我了。在这种地方，没几个人会来找医生。',
        '2': '桑格雷尔医生。镇子会烧掉我这样的人，所以我在没人的地方工作。'
      },
      friend: {
        '1': '商会替你说话。对他们的朋友我收费低一些。我的标准不变。'
      },
      foe: {
        '1': '商会愿意花高价买你的血。我更希望你把它花在这儿。'
      },
      again: {
        '1': '你脸色发白。很好。适合这行。'
      },
      train: {
        '1': '把袖子卷起来。会疼。这正是重点。'
      },
      class: {
        '1': '你用自己的健康换取力量，再从敌人身上夺回来。',
        '2': '耐力是你能花的本钱。智力决定你花得多聪明。',
        say: '鲜血炼金师是什么？'
      },
      ready: {
        strong: {
          '1': '出色的体质。你几乎可以全部学会。'
        },
        able: {
          '1': '你已经结实到可以学下一课了。'
        },
        weak: {
          '1': '第一刀你就会晕过去。请先把耐力练起来。'
        }
      },
      jars: {
        '1': '标本。大多是自愿捐赠的。',
        say: '罐子里是什么？'
      },
      trainBack: {
        '1': '请记好笔记。我想听听结果如何。'
      },
      bye: {
        '1': '保持健康。我是认真的。'
      }
    },
    syndicateBoss: {
      hello: {
        '1': '原来你就是开了城门的人。坐吧。你配得上一把椅子。',
        '2': '他们叫我灰烬夫人。奥克黑文现在归我们了。你也有一份功劳。'
      },
      throneOurs: {
        '1': '恐惧要塞落在我们手里。你值每一枚金币。'
      },
      throneLost: {
        '1': '你把王座给了别人。这事我们得谈谈。不是今天。'
      },
      foe: {
        '1': '你一直在跟我们作对。还是坐吧。我喜欢知道自己在跟谁打交道。'
      },
      again: {
        '1': '又来了。商会能为你做点什么？'
      },
      cut: {
        '1': '你会拿到的。眼下是一片废墟的份额。这是这一季的。',
        '2': '会涨的。废墟要是只有你一个市场，赚得可多了。',
        say: '你答应过给我奥克黑文的一份。'
      },
      syndicate: {
        '1': '人人都想要的东西。我们只是不装模作样。',
        '2': '保持友好，“低语”和医生收你的费用也会低些。',
        say: '商会到底想要什么？'
      },
      order: {
        '1': '当然。你烧了他们一座镇子。多带些药水。',
        say: '铁之骑士团在追我。'
      },
      rumor: {
        core: {
          '1': '矮人在矿井里找到了东西。一颗核心。带给我们，开个价。'
        },
        sold: {
          '1': '核心平安到了。你想不到它对一把锁能做什么。'
        },
        north: {
          '1': '值钱的东西都往北去了。我们也是。'
        }
      },
      bye: {
        '1': '别生分。我们对陌生人可是盯得紧的。'
      }
    },
    forgemaster: {
      hello: {
        '1': '你是从矿井里上来的。我能闻到你身上的粉尘味。',
        '2': '多恩，艾恩霍尔德的锻造大师。我有个山那么大的麻烦。'
      },
      destroyed: {
        '1': '光灭了，魔像成了废铁。昨晚我的矿工们唱歌了。一年来头一回。'
      },
      studied: {
        '1': '炉里是蓝色的火，厅里是穿长袍的学者。至少活儿干得不错。'
      },
      sold: {
        '1': '你卖了它。魔像还在走，矿井还是坟墓。别烦我。'
      },
      ending: {
        '1': '这么说王座定了。好。也许现在我们能回去挖矿了。'
      },
      again: {
        '1': '什么事？炉子可不等人。'
      },
      quest: {
        '1': '我们挖铁，却挖出了一颗心脏。以太核心。你能感觉到它在跳动。',
        '2': '那魔像呢？',
        '3': '它们随着它的节奏行动。三方势力写信来要它。我一个都不信。',
        '4': '你会先到，就在艾恩霍尔德矿井的最底层。接下来怎么办，由你决定。',
        say: '矿井下面出什么事了？'
      },
      core: {
        say: '关于核心……',
        destroy: {
          '1': '你为了救我的族人，毁掉了一件奇迹。骑士团派来了甲匠。我送了麦酒。'
        },
        study: {
          '1': '议会的人古怪，但他们的枪打得准。也算公平。'
        },
        sell: {
          '1': '你是为了金币才这么做的。但愿它能让你暖和。'
        }
      },
      town: {
        '1': '矿井开工的时候，这里出全国最好的钢。',
        '2': '石足教大地，皮姆教机械。两个都能把你耳朵说烂。',
        say: '给我讲讲艾恩霍尔德。'
      },
      rumor: {
        tundra: {
          '1': '峭壁以东，大地变成一片白。霜噬冻原。有巨人，还有更糟的。'
        },
        citadel: {
          '1': '我的斥候在北边看到一座要塞，去年还不在那儿。我不喜欢这个。'
        },
        fortress: {
          '1': '一切都在恐惧要塞了结。往北的每条路都通向那里。'
        }
      },
      bye: {
        '1': '一路顺风。'
      }
    },
    ironWeapons: {
      forge: {
        '1': '小心火星，别碰我那把好锤子。'
      },
      learnSmith: {
        '2': '光芒告诉你何时敲。手臂告诉你多用力。三击。',
        '1': '地面上的人来打铁？好吧，谁都得有个开头。'
      },
      ore: { '1': '好金属，实在货。摆出来，按块付钱。' },
      sellBack: { '1': '公平交易。艾恩霍尔德从不亏待好金属。' },
      forgeBack: {
        '1': '换个矮人会做得更好。不过也好不了多少。'
      },
      hello: {
        '1': '小心展示品。两边的刃都很锋利。',
        '2': '“锤手”希尔达。这里每一件都出自矮人之手。'
      },
      dragon: {
        '1': '你杀了那条龙？希望是用我的刀剑杀的。'
      },
      again: {
        '1': '回来买真家伙了？'
      },
      trade: {
        '1': '矮人锻造。要是哪件断了，我得知道是怎么断的。'
      },
      who: {
        '1': '我母亲为国王锻造。我为任何走进门的人锻造。'
      },
      rumor: {
        golems: {
          '1': '下面那些魔像是用我们自己的铁做的。说实话，心里难受。'
        },
        arm: {
          '1': '好剑干了一半的活。剩下的得靠你的力量。'
        }
      },
      shopBack: {
        '1': '拿回来的时候刃钝了，我就知道你用得好。'
      },
      bye: {
        '1': '狠狠地砍。'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': '小心，那个上了膛。其实大多数都是。',
        '2': '工匠沃斯。议会派我来研究核心。我们学到了好多。'
      },
      again: {
        '1': '啊，太好了。你上次来之后，我改了几处。'
      },
      trade: {
        '1': '这里的一切都来自对核心的研究。只是别对着我。'
      },
      core: {
        '1': '那种金属有一点思考能力。我尽量不去想这个。',
        say: '核心教了你什么？'
      },
      rumor: {
        heat: {
          '1': '枪靠技巧运转，而且会发热。烧到手之前，先去问问皮姆热量的事。'
        }
      },
      shopBack: {
        '1': '用起来怎么样，告诉我。我在做记录。'
      },
      bye: {
        '1': '当心后坐力。'
      }
    },
    ironArmor: {
      forge: {
        '1': '你准备好了，熔炉就准备好了。'
      },
      learnSmith: {
        '2': '加热，敲击，翻面。三击，正落在光芒里。然后让它冷却。',
        '1': '板甲是耐心活。我教你些基础。'
      },
      ore: { '1': '让我称一称。选好要卖的，钱我来数。' },
      sellBack: { '1': '称好了，付清了。好。' },
      forgeBack: {
        '1': '先晾凉再穿。'
      },
      hello: {
        '1': '加伦。甲在架子上，戒指在盘子里。'
      },
      again: {
        '1': '回来了。要什么？'
      },
      trade: {
        '1': '这副板甲能挡住巨人的棒子。看看。'
      },
      quiet: {
        '1': '没什么值得说的。',
        say: '你话不多，是吧？'
      },
      rumor: {
        giants: {
          '1': '冻原有巨人。棒子像树干。我会选重板甲。'
        },
        demons: {
          '1': '北边有恶魔。火焰和利爪。我会选重板甲。'
        }
      },
      shopBack: {
        '1': '好选择。'
      },
      bye: {
        '1': '保重。'
      }
    },
    ironOrderArmor: {
      forge: {
        '1': '以荣誉使用骑士团的熔炉。'
      },
      learnSmith: {
        '2': '铁砧前要守纪律，如同在战场上。三击，紧随光芒。',
        '1': '骑士团为朋友提供武装。我来教你。'
      },
      ore: { '1': '骑士团为战争收购矿石。能匀多少就卖多少。' },
      sellBack: { '1': '你的报酬已记录。骑士团感谢你。' },
      forgeBack: {
        '1': '锻得好。穿上它好好效力。'
      },
      hello: {
        '1': '毁掉核心的就是你。骑士团记得这件事。',
        '2': '我是骑士团驻此地的军需官。我们的军械库向你敞开。'
      },
      throneOurs: {
        '1': '多亏了你，骑士团掌控了恐惧要塞。稍息。这是你应得的。'
      },
      foe: {
        '1': '骑士团把你列在名单上。但我接到的命令是照样卖给你。我会照办。'
      },
      again: {
        '1': '需要什么？'
      },
      trade: {
        '1': '需要什么就拿。骑士团照顾自己人。'
      },
      order: {
        '1': '暂时没有。这不常有。好好享受。',
        say: '骑士团想让我做什么？'
      },
      rumor: {
        throne: {
          '1': '骑士团会想要恐惧要塞的王座。它会记得谁帮过忙。'
        }
      },
      shopBack: {
        '1': '好好爱惜。在里面流过血之前，它都是骑士团的财产。'
      },
      bye: {
        '1': '继续执行任务。'
      }
    },
    trainerGeo: {
      hello: {
        '1': '慢点。山哪儿也不会去。',
        '2': '他们叫我石足老爹。我倾听大地。有时它会回答。'
      },
      core: {
        '1': '自从你下去过，山的感觉不一样了。更平静了，或者说更空了。'
      },
      dragon: {
        '1': '昨天有条龙飞过山顶，没来招惹我们。听说是你的功劳。'
      },
      again: {
        '1': '来了。我就知道你会回来。'
      },
      train: {
        '1': '把脚站稳。感觉到了吗？没有？那就从这儿开始。'
      },
      class: {
        '1': '我们筑起墙，唤出尖刺，必要时把大地震裂。',
        '2': '要力量来移动石头，要智力来知道它想去哪儿。',
        say: '地术师是做什么的？'
      },
      ready: {
        strong: {
          '1': '石头现在认得你了。等你准备好了，再学剩下的。'
        },
        able: {
          '1': '你站得够稳了，可以学下一课。'
        },
        weak: {
          '1': '还不行。石头不会为你动。先练力量。'
        }
      },
      factions: {
        '1': '哪个都不属于。骑士团、行会，来了又走。山一直在。',
        say: '你效力于哪个阵营？'
      },
      trainBack: {
        '1': '慢慢来。大地有耐心。'
      },
      bye: {
        '1': '轻轻地走。'
      }
    },
    trainerAether: {
      hello: {
        '1': '啊，等等，别碰那个！那个也别碰。站在地毯上，地毯是安全的。',
        '2': '齿轮匠皮姆。我造枪、炮塔，还有一大堆热量计。'
      },
      core: {
        '1': '你把核心交给议会了！从那以后我几乎没睡过。是好的那种。'
      },
      oracle: {
        '1': '议会为先知的事生气了。我只是造东西的。我不想卷进去。'
      },
      friend: {
        '1': '你是议会的朋友，所以课便宜点。手续我办好了。'
      },
      foe: {
        '1': '议会说我不该教你。我还是要教。别告诉他们。'
      },
      again: {
        '1': '太好了，你的手指还齐全。'
      },
      train: {
        '1': '好。先讲安全，再上吵的那部分。'
      },
      class: {
        '1': '枪、炮塔，加一个热量计。开火、建造，在卡死之前散热。',
        '2': '主要靠技巧。大型机器再加一点智力。',
        say: '以太技师是什么？'
      },
      ready: {
        strong: {
          '1': '你现在摆弄炮塔很在行了。大型机器也拿去学吧。'
        },
        able: {
          '1': '手很稳。你可以学下一个了。'
        },
        weak: {
          '1': '你的准头还有点抖。往技巧上加点吧。'
        }
      },
      heat: {
        '1': '所有东西会卡死几秒钟。早散热，常散热。相信我。',
        say: '过热了会怎样？'
      },
      trainBack: {
        '1': '还有，记得在热量把你炸飞之前先散热。'
      },
      bye: {
        '1': '在外面小心点！'
      }
    },
    ironHealer: {
      hello: {
        '1': '请在门口把靴子脱了。我刚扫过地。',
        '2': '布琳雅嬷嬷。这座山里大多数断骨，都是我接的。'
      },
      ending: {
        '1': '你去了恐惧要塞，还回来了。坐下。让我看看你。'
      },
      again: {
        '1': '还活着。好。坐。'
      },
      heal: {
        '1': '把这个喝了，别做那副表情。你的药瓶满了。'
      },
      mana: {
        '1': '给。味道很糟。魔力用完了再喝，别提前喝。'
      },
      potions: {
        '1': '我可以卖你一条更长的腰带。五个药瓶，是一个人带着还能跑的极限了。',
        say: '我能多带些药水吗？'
      },
      rumor: {
        tundra: {
          '1': '冻原会夺走手指和脚趾。一直走动，别在雪里睡着。'
        },
        temple: {
          '1': '冻原过去有座沉没的神殿。那里的娜迦不留俘虏。'
        },
        rift: {
          '1': '那道裂隙里不管是什么，我都缝不了。别让它碰到你。'
        }
      },
      healBack: {
        '1': '走吧。还有，吃点东西，你太瘦了。'
      },
      bye: {
        '1': '完完整整地回来。'
      }
    },
    exiledSovereign: {
      hello: {
        '1': '你。就是你打开了我的城门。',
        '2': '我现在在地窖里教课，因为我得吃饭。别把这当成原谅。'
      },
      ending: {
        '1': '这么说王座有了归属，奥克黑文却依然是一片灰烬。希望这值得。'
      },
      again: {
        '1': '你回来了。我的费用没变。'
      },
      train: {
        '1': '我会教你统御。你配不配，是另一回事。'
      },
      class: {
        '1': '让别人追随的人。你一召唤卫兵就来，你一句话他们就战斗。',
        '2': '靠魅力。你有。正因如此才难以原谅。',
        say: '大君主是什么？'
      },
      ready: {
        strong: {
          '1': '你有足够的气场应付一切。真希望你当初用得更好。'
        },
        able: {
          '1': '你可以学下一课了。我不会假装高兴。'
        },
        weak: {
          '1': '现在还没人会追随你。练练魅力。'
        }
      },
      oakhaven: {
        '1': '三百年。我的家族建了那些城墙。',
        '2': '请别解释。你说什么都弥补不了。',
        say: '关于奥克黑文……'
      },
      trainBack: {
        '1': '走吧。去拿别人练手。'
      },
      bye: {
        '1': '请离开吧。'
      }
    },
    trainerChrono: {
      fled: {
        '1': '你杀了她。我多年前就看到会这样，可还是痛。',
        '2': '我是时辰守护者。我会教你。她告诉过我我会的。'
      },
      hello: {
        '1': '你来了。我等你很久了。或者说，将会等了很久。',
        '2': '我是时辰守护者。我教人稍微扭转时间。'
      },
      freed: {
        '1': '她自由了。这一次，我也看不出接下来会发生什么。真好。'
      },
      friend: {
        '1': '议会对你评价很高，所以课便宜些。他们上周就定了。'
      },
      foe: {
        '1': '议会现在对你很生气。会过去的。在那之前，我们低调些。'
      },
      again: {
        '1': '欢迎回来。你来得正是时候。'
      },
      train: {
        '1': '仔细看。然后再看一遍，提前一小会儿。'
      },
      class: {
        '1': '我们让敌人在时间里静止，让朋友加快，把犯下的错取消。',
        '2': '要智力才看得见那根线，要技巧才拉得动它。',
        say: '织时者是什么？'
      },
      ready: {
        strong: {
          '1': '那根线你握得很稳。剩下的随时拿去吧。'
        },
        able: {
          '1': '你准备好了。你没问我就知道了。'
        },
        weak: {
          '1': '线一直在滑。多点智力，再多点技巧。'
        }
      },
      oracle: {
        say: '给我讲讲先知。',
        freed: {
          '1': '她看过每一种结局，唯独没看到自己的。现在她可以去弄明白了。'
        },
        slain: {
          '1': '她没有反抗。她早就看见了。请别再问我。'
        },
        waits: {
          '1': '她看得见每一种结局。这是个沉重的负担。对她好一点。'
        }
      },
      trainBack: {
        '1': '以后你会明白的。通常都是这样。'
      },
      bye: {
        '1': '后会有期。或者，在那之前。'
      }
    },
    quest: {
      seal: {
        ask: { '1': "上古巨龙死了，裂隙就在你面前敞开着。", '2': "你可以现在就将它永远封印。巨兽们会再度沉睡。", '3': "或者你可以留下一道缝，让最勇敢的人去迎战从中出来的东西。" },
        seal: { say: "封印它。永远。", '1': "裂隙像伤口愈合般闭合，天空安静了下来。" },
        ajar: { say: "留一道缝吧。我们会做好准备。", '1': "裂隙留着一道缝，后面有什么东西在笑。" },
      },
      goblinKing: {
        ask: {
          '1': '住手。求你了。我投降。',
          '2': '我的族人劫掠，是因为他们饿。这是实话。',
          '3': '我们换个办法，做笔交易吧。你们的族群和我们的。'
        },
        slay: {
          '1': '哥布林王倒下，洞窟空了。',
          '2': '桑福德睡得更安稳，铁之骑士团听到了你的名字。',
          say: '没有交易。你们的袭击到此为止。'
        },
        pact: {
          '1': '贸易。好。我以王冠起誓。',
          '2': '哥布林商人在桑福德的广场上摆摊，卖那里的铁匠做不出来的东西。',
          say: '停止袭击，改和桑福德做买卖。发誓。'
        },
        ransom: {
          '1': '全部？……好吧。拿走，然后走。',
          '2': '你带着哥布林的金子离开。袭击会再次开始，但商会很满意。',
          say: '交出你的财宝，王冠就让你留着。'
        }
      },
      siege: {
        ask: {
          '1': '够了。你打得不错，这点我承认。',
          '2': '商会给的钱，比那座镇子能给的多得多。',
          '3': '今晚替我们打开城门，奥克黑文的三分之一就归你。'
        },
        defend: {
          '1': '那商会会在每条路上追杀你。记住是我先开的价。',
          '2': '城门守住了。奥克黑文在它后面变得富裕，甲匠们记得你的名字。',
          say: '城门不会开。带着你的军队滚吧。'
        },
        betray: {
          '1': '明智。灰烬夫人会很高兴听到这个。',
          '2': '奥克黑文燃烧。废墟中，一个黑市开张，一位炼金师开始秘密授课。',
          '3': '甲匠们走了，铁之骑士团称你为叛徒。',
          say: '镇子的三分之一。好吧。今晚城门会开。'
        }
      },
      core: {
        ask: {
          '1': '巨像成了废铁。我从没想过自己能活着看到这一天。',
          '2': '还有核心。还在嗡嗡响。摸上去是温的。',
          '3': '你先到了。那么……它该怎么处置？'
        },
        destroy: {
          '1': '光芒熄灭，魔像纷纷原地倒下。',
          '2': '为表感谢，铁之骑士团派出自己的甲匠前往艾恩霍尔德。',
          say: '退后。我要把它砸了。'
        },
        study: {
          '1': '你懂得足够多，能在不惊醒核心的情况下移动它。',
          '2': '一季之内，艾恩霍尔德的熔炉就在制造无人见过的以太装置。',
          say: '议会应该研究它。我想我能安全地把它带出去。'
        },
        sell: {
          '1': '金子。为了那个害死我矿工的东西。拿去，走吧。',
          '2': '一大笔钱易了手。核心继续亮着，矿井再也不会安宁。',
          say: '商会开的价最高。'
        }
      },
      oracle: {
        ask: {
          '1': '这一刻，我已经见过无数次。',
          '2': '其中一半，你放我自由。另一半，你夺走我守护的东西。',
          '3': '选吧。我想，就这一次，不知道接下来会发生什么。'
        },
        free: {
          '1': '哦。这个我没看到。我真的没看到。',
          '2': '先知从水中升起，消失了。她的弟子留下来教课。',
          say: '别动。我来砸开你的锁链。'
        },
        slay: {
          '1': '是的。这是另一半。',
          '2': '她没有抵抗。时辰守护者的沙漏归你了。',
          '3': '她最后的弟子逃离了神殿，议会不会原谅你。',
          say: '我是为沙漏来的。'
        }
      },
      dragon: {
        ask: {
          '1': '够了。你有牙齿，小家伙。',
          '2': '要塞里的恶魔锁住了我的族人。我想看他燃烧。',
          '3': '杀了我，或者让我帮你做到。'
        },
        slay: {
          '1': '巨龙倒下，群山震动。龙的宝藏归你所有。',
          '2': '铁之骑士团传唱屠龙者的事迹。',
          say: '我不和龙讨价还价。'
        },
        pact: {
          '1': '没几个敢开这个口。很好。我们一起狩猎。',
          '2': '你进军恐惧要塞时，会有一条龙在你头顶飞翔。',
          say: '那就和我一起对抗大恶魔。'
        }
      },
      throne: {
        ask: {
          '1': '这么说，结束了。我没想到会是你。',
          '2': '我的王座不会一直空着。谁坐上去，谁就统御要塞和裂隙。',
          '3': '三位使者已经在我门口等着了。选谁接下来进来。'
        },
        order: {
          '1': '骑士团驻守要塞，能封的都封上。',
          '2': '王国会很安全，也会被人指挥着过日子。',
          say: '铁之骑士团来守着它。'
        },
        syndicate: {
          '1': '商会在天亮前就搬了进来。',
          '2': '从今往后，一切都有价码，连和平也不例外。',
          say: '灰烬商会应得此位。'
        },
        circle: {
          '1': '议会把要塞变成了裂隙之上的学院。',
          '2': '他们称之为研究。其他人都屏住呼吸。',
          say: '让以太议会拥有它。'
        },
        shatter: {
          '1': '你亲手砸碎了王座。从此再没有人能从这里统治。',
          '2': '使者们一言不发地离开了。',
          say: '谁也别想得到。我要把它砸了。'
        },
        claim: {
          '1': '王座很冷，但很合身。',
          '2': '三方势力发现，他们有了共同的敌人。',
          say: '我自己来拿。'
        }
      }
    },
    bark: {
      sphinx: {
        intro: { '1': "回答我，小家伙，否则就被我的沙子掩埋。" },
        riddle: { '1': "那就出个谜题。按我指示的顺序，踩上去。" },
        sand: { '1': "这次是五个。我的沙子可不会等你。" },
        death: { '1': "答得好。沙子归你了。" },
      },
      leviathan: {
        intro: { '1': "现在你走在我的水里了。" },
        sink: { '1': "你的小岛正在下沉。" },
        grab: { '1': "跟我一起沉入深渊吧！" },
        death: { '1': "潮水退去，再也不会回来。" },
      },
      hydra: {
        intro: { '1': "砍掉一个头，就会长出两个！" },
        heads: { '1': "头更多，牙更多！" },
        rage: { '1': "要烧我们？那就和我们一起燃烧吧！" },
        death: { '1': "没有头了。再也没有了。" },
      },
      elderDragon: {
        intro: { '1': "在你们的种族学会用火之前，我就在世界之下沉睡了。" },
        flight: { '1': "那就躲到你的小石头后面去吧。" },
        rift: { '1': "裂隙在把我拉回去。还不行！" },
        death: { '1': "那就封印它吧。我厌倦黑暗了。" },
      },
      'siegeHale': {
        'start': {
          '1': "他们来了！守住城门！"
        },
        'ram': {
          '1': "攻城槌！在它到城门前干掉它！"
        },
        'horn50': {
          '1': "城门已毁了一半！顶住！"
        },
        'horn25': {
          '1': "城门撑不了多久了！"
        },
        'won': {
          '1': "他们溃败了！堡垒屹立不倒！"
        }
      },
      'siegeMara': {
        'start': {
          '1': "他们来了！大家站稳！"
        },
        'ram': {
          '1': "攻城槌！在它撞破城门前拦住它！"
        },
        'horn50': {
          '1': "城门塌了一半。撑住！"
        },
        'horn25': {
          '1': "城门要垮了！把他们打回去！"
        },
        'won': {
          '1': "他们逃了！要塞还在！"
        }
      },
      banditChief: {
        whistle: {
          1: '起来，小子们！咬他们！'
        }
      },
      lightDisciple: {
        freed: {
          '1': '是光指引你来的。我是奥蕾尔修女。到桑福德来找我，我会教你光明使者之道。'
        }
      },
      trainerAegis: {
        freed: {
          '1': '谢谢你把我们从强盗手里救出来！到火堆旁来吧：我们都会教你，第一堂课免费。'
        }
      },
      frostDisciple: {
        freed: {
          '1': '你是来救我的？我是艾弗·哈斯克，寒霜卫士的弟子。来艾恩霍尔德，我来教你。'
        }
      },
      windDisciple: {
        freed: {
          '1': '终于自由了！我是凯斯特雷尔·韦恩，走疾风行者之道。来奥克黑文找我，我来教你。'
        }
      },
      freedFarmers: {
        freed: {
          '1': '你救了我们！我们是托勒一家，种地的。到奥克黑文找我们，家里出事了。'
        }
      },
      freedHerbalist: {
        freed: {
          '1': '哦，谢谢你！我是草药师布莱尔。来西尔弗布里奇看看我吧，我正需要你帮忙。'
        }
      },
      freedPeddler: {
        freed: {
          '1': '愿你的靴子蒙福！我是货郎奥多·马罗。来桑福德找我，我会给你备好货。'
        }
      },
      goblinKing: {
        charge: {
          '1': '冲垮他们，獠牙！'
        },
        horn: {
          '1': '兄弟们，到我这里来！哥布林，到我这里来！'
        },
        dismount: {
          '1': '快跑，獠牙！剩下的我自己来！'
        },
        return: {
          '1': '獠牙！再来一次！'
        }
      },
      dragon: {
        takeoff: {
          '1': '够了。让天空烧了你。'
        },
        flight2: {
          '1': '我还没跟你算完！'
        }
      },
      archDemon: {
        gate: {
          '1': '大门开了。谁也别想离开。'
        },
        dive: {
          '1': '跪下。'
        }
      },
      chimera: {
        intro: {
          '1': "三个头，一种饥饿。谁先咬下去？"
        },
        twin: {
          '1': "现在是两个了。选好你的一边。"
        },
        tail: {
          '1': "我的尾巴！你要为此付出代价！"
        },
        death: {
          '1': "三个头，竟没有一个看到这一幕。"
        }
      },
      centaurWarchief: {
        intro: {
          '1': "想跑就跑吧。我的箭比你更快。"
        },
        raiders: {
          '1': "骑手们！把他们踏平！"
        },
        rear: {
          '1': "箭射够了。我要把你踩扁！"
        },
        death: {
          '1': "这片平原会记住我的蹄声。"
        }
      },
      cyclops: {
        intro: {
          '1': "这里有个小东西。靠近点。让我看看。"
        },
        cover: {
          '1': "不许再看了。我的眼睛你别想得到！"
        },
        blind: {
          '1': "我看不见你，但我听得见你！"
        },
        death: {
          '1': "黑了。一切都黑了。"
        }
      },
      frostJarl: {
        hammer: {
          '1': '站着别动，小家伙。'
        },
        iceBreak: {
          '1': '湖水会把你吞掉！'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': '小心推车！抱歉，这座桥上什么都在动。欢迎来到西尔弗布里奇。',
        '2': '我是布伦娜·奎尔镇长。东西丢了、坏了、迟了，最后都会堆到我桌上。'
      },
      ending: {
        '1': '整条河都在谈论你。生意从没这么好过。所以，谢谢你。'
      },
      again: {
        '1': '又来啦？好。尽量别挡着推车。'
      },
      who: {
        '1': '当镇长九年了。以前我卖绳子。其实是一样的活儿：把东西拢在一起。',
        '2': '镇上每年春天投票。到现在，还没人想抢这张桌子。'
      },
      town: {
        '1': '先有的桥。然后桥上有了集市，再有了房子，房子上面又盖了房子。',
        '2': '小心喷泉。小孩常掉进去。赶集的日子，大人也会。',
        say: '跟我说说西尔弗布里奇吧。'
      },
      masters: {
        '1': '一个不少。盾、火、影、石。每门都有大师，全在一座桥上。',
        '2': '学徒从四面八方赶来。旅店乐坏了。我的窗户可就遭殃了。',
        say: '这里真的每个职业都有老师吗？'
      },
      river: {
        '1': '河水带来什么就卖什么。鱼、丝绸、艾恩霍尔德的钢，偶尔还有一箱生气的鸡。',
        '2': '还有，西尔弗布里奇的商人可不是个个都挂招牌。眼睛放亮点。',
        say: '这里的人都买卖什么？'
      },
      rumor: {
        crags: {
          '1': '北边来的船停了。灰烬峭壁那边有什么东西在烧。'
        },
        mines: {
          '1': '这个月没有艾恩霍尔德的钢。矮人说他们的矿井出事了。'
        },
        tundra: {
          '1': '毛皮商再也不肯穿过冻原了。他们说巨人开始行动了。'
        },
        far: {
          '1': '现在商人们说起遥远的北方都压低声音。不管那里有什么，反正不是来做生意的。'
        }
      },
      bye: {
        '1': '去吧。要是有人问，过桥费公道得很。'
      }
    },
    sbHealer: {
      hello: {
        '1': '嗯？哦，来病人了。抱歉，我在让眼睛休息一下。治疗师都这样。',
        '2': '我是安塞尔修士。进来，坐吧。这椅子比看上去舒服。'
      },
      again: {
        '1': '啊，你又来了。我才刚坐下。'
      },
      heal: {
        '1': '躺下，闭上眼。别太久，不然我也要打瞌睡了。好了，药瓶都满了。'
      },
      mana: {
        '1': '荧光菇补剂。对脑子好，对口气不好。慢慢喝。'
      },
      potions: {
        '1': '别等到走投无路才喝。英雄们总是等太久。',
        '2': '想多带几瓶的话，我这儿卖更长的腰带。装满药瓶是免费的。',
        say: '关于药水有什么建议吗？'
      },
      sleep: {
        '1': '晚上不睡。各个职业的学徒都在练习，总有东西会爆炸。',
        say: '你真的睡过觉吗？'
      },
      healBack: {
        '1': '去吧。下次来喝茶，别再来要绷带了。'
      },
      bye: {
        '1': '小心台阶。我一半的病人只是在那儿绊倒的。'
      }
    },
    sbArmorer: {
      forge: {
        '1': '熔炉随便用。要是什么着火了就喊一声。'
      },
      learnSmith: {
        '2': '在它最亮最热时敲。三下好的敲击，就是一件好东西。',
        '1': '想自己试试锤子吗？我不介意和你共用熔炉。'
      },
      ore: { '1': '漂亮的矿石。给我看看你要卖什么，按块付钱。' },
      sellBack: { '1': '很高兴。西尔弗布里奇向来出价公道。' },
      forgeBack: {
        '1': '瞧瞧！你真是天生的好手。'
      },
      hello: {
        '1': '哈！瞧瞧这个凹坑。希望你买这身盔甲的钱要回来了。',
        '2': '格蕾塔·艾恩维恩。我做的盔甲会跟主人一起回家。到目前为止，次次都是。'
      },
      again: {
        '1': '又是你！还完完整整的。我最喜欢这种客人。'
      },
      trade: {
        '1': '来，敲一敲。想多用力都行。'
      },
      who: {
        '1': '山里人家出身。顺着河下来做生意，为了这里的鱼就留下了。'
      },
      steel: {
        '1': '不在厚不厚，在于哪里能弯。好盔甲会在你弯的地方弯。',
        '2': '不过重板甲要力量。力量不够还硬穿，走起路来就像鸭子一样摇摇摆摆。',
        say: '好盔甲好在哪里？'
      },
      shopBack: {
        '1': '好好穿。凹坑带回来给我看，我爱听好故事。'
      },
      bye: {
        '1': '去吧。别让我没护住的地方挨打。'
      }
    },
    sbWeapons: {
      hello: {
        '1': '啊，一位有品位的客人。我一眼就看得出来。从你走进来的样子就知道。',
        '2': '阿什比精品刀剑的科尔文·阿什比。没错，就是那个阿什比。你肯定听说过我。'
      },
      again: {
        '1': '这么快就回来了？大家最后总会回到科尔文这儿。'
      },
      trade: {
        '1': '每把刀都是手工打磨的。其实就是我的手。小心别被反光晃到。'
      },
      who: {
        '1': '这条河上最好的刀剑商人。随便问谁都行。或者看看我的招牌。'
      },
      blades: {
        '1': '挑适合你的。手快就用轻刀，臂力大就用重刀。',
        '2': '还得好看。没人会被拿着丑剑的英雄吓跑。',
        say: '怎么挑一把好武器？'
      },
      shopBack: {
        '1': '好眼光。没我的头发那么好，但也差不多了。'
      },
      bye: {
        '1': '一定要告诉别人你是在哪儿买的。'
      }
    },
    sbJeweler: {
      hello: {
        '1': '嘿！这边！戒指、护符、幸运石。桥上最好的摊子。',
        '2': '我叫塔姆·马洛。我个子小，价钱更小。'
      },
      again: {
        '1': '我最喜欢的客人！别告诉其他人我这么说过。'
      },
      trade: {
        '1': '全是真的。大部分是。好吧，那颗是玻璃，但是很漂亮的玻璃。'
      },
      who: {
        '1': '我在这座桥上长大。每条裂缝、每只猫、每条近路我都知道。'
      },
      gossip: {
        '1': '斯普罗基特教授又把眉毛炸没了。这个月第三次了。',
        '2': '还有，镇长知道那些不挂招牌的商人。我正在打听。',
        say: '听到什么好玩的八卦吗？'
      },
      shopBack: {
        '1': '合作愉快！告诉你的朋友。别告诉卫兵。'
      },
      bye: {
        '1': '回头见！我就在这儿。大概吧。'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': '哈！又来一个年轻人。抬起下巴，挺起肩膀。笑着举盾，效果更好。',
        '2': '海尔加·斯托姆希尔德女爵士。我曾守住这座桥。现在我教别人怎么站稳脚跟。'
      },
      again: {
        '1': '你来啦！盾举起来了？好。在笑吗？更好。'
      },
      train: {
        '1': '双脚分开。身体前倾。我推你，你不能动。准备好了吗？嘿！'
      },
      class: {
        '1': '你站在最前面，这样别人就不用站。这是世上最好的差事。',
        '2': '力量用来举盾。耐力让你一直举到吃晚饭。',
        say: '神盾骑士到底是做什么的？'
      },
      ready: {
        strong: {
          '1': '孩子，你现在是一堵像样的墙了。想学哪课就学哪课。'
        },
        able: {
          '1': '腿站得真稳！你可以学下一课了。'
        },
        weak: {
          '1': '还不行。我一推你就倒。请多练力量和耐力。'
        }
      },
      bridge: {
        '1': '四十年前，对抗河盗。我们六个人，一道门，一个很长很长的夜晚。',
        '2': '我们赢，不是因为打得最狠，而是因为寸步不让。记住这一点。',
        say: '你守过这座桥？'
      },
      trainBack: {
        '1': '干得好！现在去吃点东西。盾牌可重了。'
      },
      bye: {
        '1': '出去也要抬起头来！'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': '请进。小心笔记，还有，请别在火盆旁边打喷嚏。',
        '2': '魔导师伊格内修斯·维尔。我在桥上教火焰。你看，周围水多得是。'
      },
      again: {
        '1': '很准时。非常好。我们从上次停下的地方开始。'
      },
      train: {
        '1': '看好。一小簇火焰，稳稳托住。大火很容易，小火才需要功夫。'
      },
      class: {
        '1': '谁都能点火。炎术师决定火往哪儿烧，又在哪儿停。',
        '2': '一切都来自智力。之后火焰需要一双稳手时，技巧会帮上忙。',
        say: '炎术师到底是做什么的？'
      },
      ready: {
        strong: {
          '1': '你的控制力很出色。我几乎没什么可纠正的了。随意挑选吧。'
        },
        able: {
          '1': '合格。其实不只是合格。你可以学下一课了。'
        },
        weak: {
          '1': '还不行。你的火苗在晃。头脑要更敏锐。多提升智力。'
        }
      },
      sprocket: {
        '1': '天才。吵闹、马虎，又是天才。我在他门口常备一桶水。',
        say: '你觉得斯普罗基特教授怎么样？'
      },
      trainBack: {
        '1': '去水边练习。这点我坚持。'
      },
      bye: {
        '1': '日安。袖子记得卷起来。'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': '在找我？从喷泉那儿起我就在你旁边。你从我身边走过去两次了。',
        '2': '尼克斯·哈洛韦。最好的藏身处是人群，而这是世上最热闹的桥。'
      },
      again: {
        '1': '又见面了。我在这儿有一会儿了。你发现了吗？没有？很好。'
      },
      train: {
        '1': '第一课：走路要像你本来就属于这里。没人会多看这样的人一眼。'
      },
      class: {
        '1': '永远不在别人看着的地方。溜进去，快速一击，再混回人群。',
        '2': '敏捷让手脚更快。技巧让这一击算数。',
        say: '怎样才算好的影刃？'
      },
      ready: {
        strong: {
          '1': '你现在真够鬼祟的了。剩下的都拿去吧，这是你应得的。'
        },
        able: {
          '1': '脚步真轻！你可以学下一招了。'
        },
        weak: {
          '1': '还不行。你在喷泉那儿我就听见你来了。多练敏捷。'
        }
      },
      past: {
        '1': '我以前就在这座桥上扒口袋。还挺拿手的。',
        '2': '后来镇长抓住了我，给了我一份工作，而不是一间牢房。别告诉她我很感激。',
        say: '这些你是怎么学会的？'
      },
      trainBack: {
        '1': '现在去练吧。尽量别让我逮到你。'
      },
      bye: {
        '1': '回见。不过，你是见不到我的。'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': '哦！你好，你好。请原谅，我刚在跟我的卫兵聊天。他们是很棒的听众。',
        '2': '珀西瓦尔·阿什科姆。我本可以在城堡里教，但只有在人群中才能学会领导。'
      },
      again: {
        '1': '我亲爱的朋友！我们继续吧？当然，前提是你愿意。'
      },
      train: {
        '1': '那么。好的命令要清楚、友善，而且只说一次。就像这样。'
      },
      class: {
        '1': '领袖。你的卫兵会来到你身边，和你一起战斗，而不只是为你战斗。',
        '2': '魅力就是一切。人们追随自己喜欢的人，还有记得他们名字的人。',
        say: '什么是大君主？'
      },
      ready: {
        strong: {
          '1': '太棒了！现在人们愿意跟你去任何地方。所有课程都拿去吧。'
        },
        able: {
          '1': '你的卫兵会听你的。你可以学下一课了。'
        },
        weak: {
          '1': '恐怕还差一点。再多一点魅力，他们就会来了。'
        }
      },
      please: {
        '1': '一直都说。吼叫换来服从，说“请”换来忠诚，而忠诚更长久。',
        say: '你真的对卫兵说“请”吗？'
      },
      trainBack: {
        '1': '做得很好。记得事后谢谢他们。'
      },
      bye: {
        '1': '请多保重，代我向大家问好。'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': '小心青苔，孩子，它这周可累坏了。来，让我好好看看你。',
        '2': '我是托娃·迪普鲁特奶奶。这里的河床是上好的石头，一直到最底下。'
      },
      again: {
        '1': '这么快又来了？坐吧，我刚泡了茶。石头茶。主要还是茶。'
      },
      train: {
        '1': '手掌平放在地上。不是那样。就像在拍一只犯困的小狗。'
      },
      class: {
        '1': '我们请大地帮忙。需要时来一堵墙，有人无礼时来一根尖刺。',
        '2': '石头就像花园。力量用来挖，智力用来知道该种在哪儿。',
        say: '地术师是做什么的？'
      },
      ready: {
        strong: {
          '1': '大地现在喜欢你了。想学什么就学什么吧，孩子。'
        },
        able: {
          '1': '根扎得好！你可以学下一课了。'
        },
        weak: {
          '1': '还不行，乖孩子。石头不肯为你动一动。先多练力量。'
        }
      },
      garden: {
        '1': '四十年的心血。每块石头都是亲手种出来的。好吧，靠魔法。大部分是亲手。',
        '2': '走的时候拿颗小石子吧。用来挡门可好了。',
        say: '那是石头做的花园吗？'
      },
      trainBack: {
        '1': '真好。现在去挖点什么吧。轻轻地。'
      },
      bye: {
        '1': '去吧。穿暖和点，河边潮。'
      }
    },
    sbMasterAether: {
      hello: {
        '1': '欢迎，欢迎！你来得正好，演示马上开始。请捂住耳朵。',
        '2': '昆特·斯普罗基特教授。河水免费帮我转轮子。我还能去哪儿教书呢？'
      },
      again: {
        '1': '啊，我最喜欢的学生！今天的演示格外响。'
      },
      train: {
        '1': '看黑板。现在把黑板忘掉，看机器。'
      },
      class: {
        '1': '我们靠造东西摆脱麻烦。一把手枪，一座炮塔，还有一个让你老实点的热量表。',
        '2': '技巧负责瞄准，智力负责巧妙的部分。最好两样都有。',
        say: '以太技师到底是做什么的？'
      },
      ready: {
        strong: {
          '1': '了不起！你都能替我讲课了。不过千万别。剩下的都拿去吧。'
        },
        able: {
          '1': '手真稳！你可以学下一台机器了。'
        },
        weak: {
          '1': '还不行。你的准头在飘。多练技巧，然后再说。'
        }
      },
      eyebrows: {
        '1': '一次演示有点太成功了。会长回来的。一向如此。',
        say: '你的眉毛怎么了？'
      },
      trainBack: {
        '1': '太好了。现在去把热量散掉。最好在外面。'
      },
      bye: {
        '1': '下课！小心台阶。'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': '我的老学生时辰守护者写信说你会来。而且就是这一分钟。',
        '2': '守钟人塞尔温。我照看桥上的钟。这么忙的镇子，可迟到不起。'
      },
      again: {
        '1': '过了七分。正是开始的好时候。'
      },
      train: {
        '1': '跟我一起数。一，二，停住。拿捏得当，时间就会被拉长。'
      },
      class: {
        '1': '我们整理时间。让敌人慢下来，让朋友快起来，偶尔撤销一个小错误。',
        '2': '智力用来理解时间。技巧让你碰它时什么都不弄坏。',
        say: '什么是织时者？'
      },
      ready: {
        strong: {
          '1': '时机把握得很好。剩下的课，你方便时随时来学。'
        },
        able: {
          '1': '你准备好了。下一课开始于……嗯，现在。'
        },
        weak: {
          '1': '还不行。你总是慢半拍。多练智力，也多练技巧。'
        }
      },
      keeper: {
        '1': '多年前我教过他。很出色的学生。总是早到或迟到，从不准时。',
        say: '你怎么认识时辰守护者的？'
      },
      trainBack: {
        '1': '每天练习。如果可以，每天同一时间。'
      },
      bye: {
        '1': '去吧。别迟到。'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': '桑格雷尔医生写信跟我提过你。他说你没晕倒。在他嘴里，这可是高度赞扬。',
        '2': '维斯珀·克里姆森利夫。世上所有草药都会漂过这座桥。我在这儿真是被宠坏了。'
      },
      again: {
        '1': '欢迎回来。你今天看起来很有精神。我总看得出来。'
      },
      train: {
        '1': '吸气。感觉到你的力量了吗？现在花掉一点。要花得明智。'
      },
      class: {
        '1': '我们用自己的生命力换取力量，再从敌人身上夺回来。',
        '2': '耐力是你的钱包。智力决定你花得好不好。',
        say: '鲜血炼金师到底是什么？'
      },
      ready: {
        strong: {
          '1': '好旺盛的生命力！我会的几乎所有东西，你都可以学了。'
        },
        able: {
          '1': '你的精华流动得很强劲。去学下一课吧。'
        },
        weak: {
          '1': '还不行。施一个法术你就会累。先把耐力练起来。'
        }
      },
      herbs: {
        '1': '大多是补剂。一点精华，好多薄荷。薄荷让一切都变好。',
        '2': '要是你在外面找到稀有的植物，一定带过来。我很想看看。',
        say: '这些草药都是做什么用的？'
      },
      trainBack: {
        '1': '练完要休息。精华会回来的，但它喜欢先睡个午觉。'
      },
      bye: {
        '1': '照顾好自己。多喝水。吃点绿色的东西。'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': '今天早上从海边来了三艘驳船。',
        '2': '又是咸鱼？',
        '3': '难得是丝绸。不过之后闻闻你的手指。'
      },
      lesson: {
        '1': '你的课上得怎么样？',
        '2': '我把袖子点着了。大师说这是进步。'
      },
      masters: {
        '1': '全国的大师都在同一条街上教课。',
        '2': '而且每个人都说自己的职业最好。',
        '3': '他们说得都对，这才气人。'
      },
      bridge: {
        '1': '听说这座桥比镇子还老。',
        '2': '听它嘎吱响，确实像。'
      },
      fish: {
        '1': '钓到什么了吗？',
        '2': '一只靴子。',
        '3': '嗯，已经凑齐半双了。'
      },
      newMaster: {
        '1': '北街来了个新大师。老是在讲时间。',
        '2': '我打赌他每节课都迟到。'
      },
      siege: {
        '1': '奥克黑文传来的消息不妙。强盗都打到城墙下了。',
        '2': '那驳船就会改来这儿了。真是可怜人。'
      }
    },
    sbAlchemist: {
      hello: {
        '1': '哎呀！小心那些罐子。那个会咬人。好吧，是轻轻啃一下。',
        '2': '我是“蕨笛”奥迪尔，炼金术士。给我带草药来，我就给你装一瓶小小的勇气。'
      },
      again: {
        '1': '你回来啦！有没有给我带点绿色的东西？'
      },
      brew: {
        '1': '让我看看你的小袋子。哇，真不错。挑你想要的，我去烧水。'
      },
      who: {
        '1': '我用一朵雏菊把我妈妈的花园点着了。谁也解释不了，所以我只好自己去学。'
      },
      herbs: {
        '1': '在野外，你战斗的地方到处都有。从植物上走过去，它就归你了。',
        '2': '稀有的很挑剔。月铃花在低语森林里开放；影棘偏爱阴暗的地方。',
        say: '去哪儿找草药？'
      },
      elixirs: {
        '1': '每一种都能让你在战斗中变强整整五分钟。打得更狠，皮更硬，脚更快。',
        '2': '它们放在你的第三个药瓶里。点一下小箭头，就能换要喝的那种。',
        say: '灵药有什么用？'
      },
      brewBack: {
        '1': '小心，还热着呢。袋子装满了再来找我！'
      },
      bye: {
        '1': '再见啦！看到紫色的花就摘两朵。一朵给我。'
      }
    },
    sbGambler: {
      hello: {
        '1': '快来瞧一瞧！十二张牌，一个沙漏，还有一袋可能翻倍的钱！',
        '2': '我是佩尔夫人。见过的脸我从不忘记。来看看你能不能记住每一张牌。'
      },
      again: {
        '1': '又来玩一局？沙子可一直在等你呢。'
      },
      play: {
        '1': '钱放布上，眼睛看牌。准备好了吗？翻沙漏！'
      },
      rules: {
        '1': '每次翻两张牌。配成对的就一直朝上。在沙子漏完前找出所有配对，我就付你双倍。',
        '2': '再赢一局，沙漏就会变快。连赢五局，我就送你一件传说奖品。',
        say: '这个怎么玩？'
      },
      who: {
        '1': '我九岁就跟着巡回马戏团跑了。结果那个马戏团，算账可厉害了。'
      },
      prize: {
        '1': '有过一个矮人。从那以后，再没人见他眨过眼。',
        say: '有人赢过奖品吗？'
      },
      playBack: {
        '1': '不管输赢，这局都很精彩。等眼睛歇够了再来吧。'
      },
      bye: {
        '1': '去吧！可别忘了自己的脚放在哪儿。'
      }
    },
    sunfordGambler: {
      hello: {
        '1': '嘘。你包里有破烂吗？旧靴子、弯掉的剑？我拿它们跟你赌一把。',
        '2': '我是“筋斗”多布。我赌着玩，大多是这样。还有就是为了靴子。'
      },
      again: {
        '1': '又是你！还有那些可爱的破烂吗？'
      },
      play: {
        '1': '入场费放桌上。把东西摆出来，价高的得一分。'
      },
      rules: {
        '1': '我们各出一件物品。贵的那件得一分。先得两分就赢。',
        '2': '不管输赢，你出的东西都归我。不过要是连赢三局，我有件特别的东西给你。',
        say: '规则是什么？'
      },
      who: {
        '1': '以前是个货郎。后来发现，大家宁愿拿东西来赌，也不愿意卖。'
      },
      luck: {
        '1': '总是输！不过我回家时，总能多一双新靴子。',
        say: '你会输吗？'
      },
      playBack: {
        '1': '打得好！你那些东西摆在我架子上一定很好看。'
      },
      bye: {
        '1': '多带点破烂来！破烂是我的最爱。'
      }
    },
    sunfordCups: {
      hello: {
        1: '快来看！三个杯子，一颗宝石，第一局免费！',
        2: '“快手”奈尔。还没人骗得过我的手。想试试吗？'
      },
      again: {
        1: '又来啦？眼睛放亮点！'
      },
      play: {
        1: '盯紧宝石，朋友。别眨眼！'
      },
      rules: {
        1: '我把宝石藏在一个杯子下面，然后换来换去。你指出藏着它的杯子就行。',
        2: '连胜越多赢得越多。三连胜有奖品，五连胜有宝藏。每天第一局免费。',
        say: '怎么玩？'
      },
      who: {
        1: '我还不会走路就会洗牌了。我妈说这能解释很多事。'
      },
      luck: {
        1: '偶尔！那我就大声哀叹，观众就会同情我。',
        say: '你也会输吗？'
      },
      playBack: {
        1: '这一局真棒！明天再来，第一局永远免费。'
      },
      bye: {
        1: '回见！在外面也要眼观六路。'
      }
    },
    oakGambler: {
      hello: {
        '1': '新面孔啊。请坐，我不咬人。不过我的价钱嘛，会咬一点点。',
        '2': '大家叫我“丝绒”伦。我收藏好东西，一局一件。'
      },
      again: {
        '1': '啊，我最喜欢的对手。我们开始吧？'
      },
      play: {
        '1': '请先付入场费。然后，拿出点值得我出手的东西。'
      },
      rules: {
        '1': '每人每次出一件，最多三次。更精良的那件得一分。先得两分者获胜。',
        '2': '不管怎样，你的东西都留在我这儿。连赢三局，你就能带着真正的宝物离开。',
        say: '我们怎么玩？'
      },
      who: {
        '1': '我是做稀有货的商人。找到它们，收好它们，偶尔也会输掉一件。'
      },
      collection: {
        '1': '按闪亮的程度排好。最闪的放在最上层，挨着我的茶杯。',
        say: '这些东西你都拿来做什么？'
      },
      playBack: {
        '1': '真愉快。等你的背包重一些，再来吧。'
      },
      bye: {
        '1': '出门小心钱袋。不是每个人都玩得公平。'
      }
    },
    sbCollector: {
      hello: {
        '1': '把门关上，有风钻进来。蛾子老惦记着我的挂毯。',
        '2': '我是奥尔德·维恩，有人叫我“收藏家”。我收购稀罕东西，只卖给我喜欢的人。'
      },
      open: {
        '1': '我的朋友！快进来，快进来。我给你擦好了一件特别的宝贝。'
      },
      again: {
        '1': '又是你。看来你还没帮我那个忙。'
      },
      trade: {
        '1': '柜子都打开了。只有最好的货，每个价钱我都记得。'
      },
      favor: {
        '1': '不卖给陌生人。不过帮我个忙，我们就是朋友了。',
        '2': '低语森林里的树人守着我要的月铃花。打败四个树人，再给我带两朵月铃花来。',
        say: '你卖东西吗？'
      },
      waiting: {
        '1': '四个树人，两朵月铃花。可惜，月铃花不会自己摘下来呀。',
        say: '关于那个忙……'
      },
      favorDone: {
        '1': '哦，还带着森林的香味！太好了。',
        '2': '说话算话。我的柜子随时让你看个够。',
        say: '我把月铃花带来了。'
      },
      who: {
        '1': '我六岁就开始收藏了。起初是纽扣，现在是会嗡嗡响的剑。'
      },
      shopBack: {
        '1': '好好对待它。它比我们俩年纪都大。'
      },
      bye: {
        '1': '出去时把门带上。轻点，花瓶会晃得叮当响。'
      }
    },
    sbFence: {
      hello: {
        '1': '盯着看什么？要么买点东西，要么别挡着我的光。',
        '2': '我是米蕾拉·索恩。我专找别人丢的东西，再给它们找新主人。'
      },
      open: {
        '1': '啊，我最喜欢的英雄。好东西我都藏在布底下留给你了。'
      },
      again: {
        '1': '又来了？记住我要你办的事。办完再谈生意。'
      },
      trade: {
        '1': '各地来的护甲。别问从哪来。现在全都干干净净，我保证。'
      },
      favor: {
        '1': '好护甲。只给朋友。朋友嘛，就该互相帮忙。',
        '2': '奥克黑文郊外的强盗老是抢我的货。打败十五个，再去问问卖饰品的小家伙，是谁派他们来的。',
        say: '布底下是什么？'
      },
      waiting: {
        '1': '十五个强盗，然后跟卖饰品的小家伙聊一句。去吧。',
        say: '关于那些强盗……'
      },
      favorDone: {
        '1': '原来一直是那个大嘴巴。哈！我欠你一个人情。',
        '2': '随时掀开布看看。朋友先挑。',
        say: '强盗打败了，我也知道是谁派的了。'
      },
      who: {
        '1': '我在这条河的石阶上长大。漂过的东西，迟早都会落到我手里。'
      },
      shopBack: {
        '1': '好好穿着。要是有人问，就说是在艾恩霍尔德买的。'
      },
      bye: {
        '1': '看好你的钱袋。这里可不是人人都像我这么老实。'
      }
    },
    sbMasterWindrunner: {
      hello: {
        '1': '哦，嗨！抱歉，我停不下来。我在等风转向。马上就转了。',
        '2': '我是“风翼”塞法。我射箭，还追着风跑。通常是风赢。'
      },
      open: {
        '1': '我的小飞毛腿来啦！准备好了吗？当然准备好了。走走走！'
      },
      again: {
        '1': '又见面啦！我还在这儿。嗯，大部分还在。我的脚老是自己溜走。'
      },
      train: {
        '1': '感觉到风吹在脸上了吗？往你以为的地方再偏左一点瞄。好，放！'
      },
      favor: {
        '1': '只教跟得上我的人。你跟得上吗？试试就知道。',
        '2': '在奥克黑文郊外打败八个强盗弓手，再给我带两株疾风蕨来。',
        say: '你教射箭吗？'
      },
      waiting: {
        '1': '八个强盗弓手，两株疾风蕨。快去！我就在这儿。蹦蹦跳跳地等。',
        say: '关于你的考验……'
      },
      favorDone: {
        '1': '哈！你居然跟上了！从来没人跟得上！',
        '2': '好，现在你是我的徒弟了。只有一条规矩：上课不许坐下。',
        say: '弓手都打败了，这是你要的疾风蕨。'
      },
      class: {
        '1': '射箭，跑，再射箭。要是被抓住，就是你站着不动太久了。',
        '2': '敏捷让脚快、弓也快。技巧让每支箭都命中。',
        say: '疾风行者是做什么的？'
      },
      ready: {
        strong: {
          '1': '你现在和风一样快了。嗯，差不多吧。想学哪课就学哪课！'
        },
        able: {
          '1': '脚步真轻！你可以学下一课了。快去快去！'
        },
        weak: {
          '1': '还不行。你跑起来像背着一张沙发。请多练敏捷。'
        }
      },
      who: {
        '1': '我住在河边那座老风车上面。全镇看风最好的地方。',
        '2': '到顶上有两百级台阶。超棒的练习。每一级我都数过。'
      },
      trainBack: {
        '1': '很好！现在跑回家。别走路。跑步也算练习。'
      },
      bye: {
        '1': '回见！小心低处的树枝。我就从来不小心。'
      }
    },
    sbMasterFrostwarden: {
      hello: {
        '1': '嗯。你从我身边走过三次了。迷路了，还是好奇？',
        '2': '我是“霜心”哈尔瓦德。我从雪地来到南方。这里很暖和。太暖和了。'
      },
      open: {
        '1': '徒弟。很好。冰准备好了，我也是。'
      },
      again: {
        '1': '又是你。很好。我话不多。你还是留下吧。'
      },
      train: {
        '1': '慢慢呼气。看到白雾了吗？现在把它送进剑刃里。'
      },
      favor: {
        '1': '是的。我只教在热地方也能保持冷静的人。',
        '2': '去灰烬峭壁扑灭七个火元素。再给我带两枝霜薄荷来。',
        say: '那把剑是冰做的吗？'
      },
      waiting: {
        '1': '七个火元素。两枝霜薄荷。慢慢来。也别太慢。',
        say: '关于你的考验……'
      },
      favorDone: {
        '1': '嗯。连一点焦都没有。很好。',
        '2': '你保持了冷静。这就是第一课。剩下的我来教你。',
        say: '火元素都灭了。这是你要的霜薄荷。'
      },
      class: {
        '1': '寒冷的骑士。先让敌人发冷，再冻住，然后把冰打碎。',
        '2': '力量用来挥剑。智力用来驭霜。两样都要。',
        say: '寒霜卫士是什么？'
      },
      ready: {
        strong: {
          '1': '你现在和北方一样冷了。哪课都可以学。'
        },
        able: {
          '1': '很好。很稳。下一课是你的了。'
        },
        weak: {
          '1': '还不行。你的霜化得太快。多练智力，也多练力量。'
        }
      },
      who: {
        '1': '我曾在北方守卫一道山口。后来，我想看看一条不会结冰的河。'
      },
      trainBack: {
        '1': '很好。现在休息。冰从不着急。你也别急。'
      },
      bye: {
        '1': '一路顺风。保持冷静。'
      }
    },
    sbMasterLightbringer: {
      hello: {
        '1': '嗯嗯嗯～……哦！抱歉，孩子，我在哼歌。我对着你哼了吗？我常这样。',
        '2': '我是奥瑞尔修女，大家叫我“晨湖”。桥头那盏小灯一直是我在点着。'
      },
      open: {
        '1': '我的小太阳来啦！来，在光里站一会儿。这是你应得的。'
      },
      again: {
        '1': '又见面啦！我还在，还在哼歌。这盏灯喜欢有人陪。'
      },
      train: {
        '1': '张开双手，抬起下巴。想想你最美好的一个早晨。好了。感觉到了吗？'
      },
      favor: {
        '1': '每个人心里都有一点光。等他们准备好了，我就教他们把光放出来。',
        '2': '在灰烬峭壁打败七个邪教徒，再给我的灯带三片日光瓣来。',
        say: '那盏灯是魔法灯吗？'
      },
      waiting: {
        '1': '七个邪教徒，三片日光瓣。打的时候温柔点。每个人都值得第二次机会。',
        say: '关于你的考验……'
      },
      favorDone: {
        '1': '哦，看看它们！这盏灯能金灿灿地亮一个月。',
        '2': '你也会这样闪亮的，孩子。我很乐意教你。',
        say: '邪教徒都打败了。这是你要的日光瓣。'
      },
      class: {
        '1': '我们带来黎明。用光战斗，用光治疗，也躲在光后面。',
        '2': '智力让光更强。魅力让光更暖。两样你都需要。',
        say: '光明使者是做什么的？'
      },
      ready: {
        strong: {
          '1': '你像日出一样闪耀，孩子。想学哪课就学哪课。'
        },
        able: {
          '1': '亮得真好看！你可以学下一课了。'
        },
        weak: {
          '1': '还不行，孩子。你的光有点暗。多一点魅力，你就会发光。'
        }
      },
      who: {
        '1': '我以前在一座大神殿里唱歌。可我在这儿的灯能指引船只回家。这样更好。'
      },
      trainBack: {
        '1': '真好。现在去照亮别人的一天吧。这是修女的命令。'
      },
      bye: {
        '1': '去吧，孩子。对着黑暗的角落笑一笑。它们最讨厌这个。'
      }
    },
    sbMasterBeastcaller: {
      hello: {
        '1': '小心脚下。那是布兰波。她先来的。',
        '2': '我是“蓟足”罗文。我喜欢动物。人嘛，我还在考虑。'
      },
      open: {
        '1': '哦，是你啊。布兰波一直在等你。我也是。有一点。'
      },
      again: {
        '1': '又是你。布兰波喜欢你。我还在想。'
      },
      train: {
        '1': '蹲下。再慢点。伸出手，让它们自己过来。很好。'
      },
      favor: {
        '1': '说话？我是在听。这个诀窍大多数人一辈子都学不会。',
        '2': '低语森林里的巨型蜘蛛正在用网堵住动物的小路。清掉八只。',
        '3': '然后给我的窝带两朵月铃花来。布兰波在它们旁边睡得更香。',
        say: '你能和动物说话吗？'
      },
      waiting: {
        '1': '八只蜘蛛，两朵月铃花。动物们在等。布兰波也在等。',
        say: '关于你的考验……'
      },
      favorDone: {
        '1': '嗯。今天早上鹿下到河边来了。我就猜可能是你干的。',
        '2': '行吧。我教你。别大惊小怪的。布兰波，别摇尾巴了。',
        say: '小路清干净了，这是你要的月铃花。'
      },
      class: {
        '1': '你呼唤荒野，荒野就会回应。狼、鹰、熊。是朋友，不是宠物。',
        '2': '魅力让它们愿意来。耐力让你跟得上它们。',
        say: '唤兽师是什么？'
      },
      ready: {
        strong: {
          '1': '整个兽群现在都信任你了。想学什么就学什么。'
        },
        able: {
          '1': '狼喜欢你。你可以学下一课了。'
        },
        weak: {
          '1': '还不行。它们还不信任你。多练魅力，还要多很多耐心。'
        }
      },
      who: {
        '1': '几年前我在一个陷阱里发现了布兰波。三条腿，满身脾气。从那以后我们就是一对了。',
        '2': '我睡在马厩的草料棚里。马打呼比人少。'
      },
      trainBack: {
        '1': '很好。去吧。替我跟乌鸦打个招呼。它们记性好。'
      },
      bye: {
        '1': '去吧。布兰波说再见。'
      }
    },
    sbMasterElementalist: {
      hello: {
        '1': '嗨！等一下，我在抛球。火、冰、电、石，还有……接住了！你好！',
        '2': '我是魔导师“四风”艾瑞丝。我教全部四种元素。把它们混在一起才最好玩。'
      },
      again: {
        '1': '又来啦！太好了，我正需要有人看。看这个。当当！'
      },
      train: {
        '1': '挑两个法球。随便哪两个。让它们碰一碰。轻点！看到了吗？反应！'
      },
      class: {
        '1': '我们会混合！先冰后火，就融化了。先火后电，轰！每一对都有效果。',
        '2': '每个法术都靠智力。还要技巧，因为好法术需要快手。',
        say: '元素使是做什么的？'
      },
      ready: {
        strong: {
          '1': '你现在混得像个大师了！哪课都能学。学两课也行！'
        },
        able: {
          '1': '哦，好漂亮的火花！你可以学下一课了。'
        },
        weak: {
          '1': '还不行！你的元素老是噗地熄掉。请多练智力。'
        }
      },
      sleeve: {
        '1': '哦！还真是。等一下……好了。',
        '2': '先火后冰。其实这是一堂课。不用谢！',
        say: '呃，你的袖子着火了。'
      },
      trainBack: {
        '1': '太棒了！现在请去外面练习。窗帘是新的。'
      },
      bye: {
        '1': '拜拜！要是闻到烟味，多半是我。别担心！'
      }
    },
    sbMasterSoulwarden: {
      hello: {
        '1': '嘘，没事的，它们很友好。哦，不是说你。我在跟幽光说话。',
        '2': '我是守望者“灯火”奥达莉丝。我帮迷路的灵魂找到回家的路。'
      },
      again: {
        '1': '又见面了。幽光们还记得你。那一个在挥手呢。'
      },
      train: {
        '1': '把提灯放低，轻声说话。迷路的东西会走向温柔的声音。'
      },
      class: {
        '1': '敌人被打败后，它的灵魂会有点迷路。我们帮它，它也会回过头来帮我们。',
        '2': '智力用来引导光。魅力让灵魂愿意多留一会儿。',
        say: '灵魂守望者是做什么的？'
      },
      ready: {
        strong: {
          '1': '连最害羞的灵魂现在都会来找你了。哪课都可以学。'
        },
        able: {
          '1': '幽光们信任你。你可以学下一课了。'
        },
        weak: {
          '1': '还不行。它们还有点怕你。多练智力，再加一点魅力。'
        }
      },
      wisps: {
        '1': '算是吧！它们是走丢的灵魂。这个叫菲吉特。他喜欢暖和的那一边。',
        '2': '你知道吗，灵魂从来都不坏。只是迷路了。准备好了，它们就会回家。',
        say: '你提灯里的小光点是活的吗？'
      },
      trainBack: {
        '1': '做得好。现在轻轻放它们走吧。它们累了一整天了。'
      },
      bye: {
        '1': '保重。要是看见迷路的小光点，跟它打个招呼。'
      }
    },
    sbMasterIronmonk: {
      hello: {
        '1': '坐。呼吸。不对，你呼吸得像赶时间。再来。',
        '2': '我是“静水”奥鲁大师。我教空手之道。铁拳，静心。'
      },
      again: {
        '1': '啊。徒弟回来了。河水也会回来。每天都是。'
      },
      train: {
        '1': '脚如树根，手如雨点。出拳。再来。第一百拳才算数。'
      },
      class: {
        '1': '不用刀剑。手、脚、呼吸。每一击都为下一击蓄力，直到最强的那一击。',
        '2': '敏捷让手快。耐力让你在别人喘不过气时保持冷静。',
        say: '钢铁武僧是什么？'
      },
      ready: {
        strong: {
          '1': '徒弟变成了师父。别告诉别人。哪课都可以学。'
        },
        able: {
          '1': '很好。杯子正在装满。去学下一课吧。'
        },
        weak: {
          '1': '还不行。根浅的树会被风吹倒。多练耐力。'
        }
      },
      noodles: {
        '1': '是的。汤熬了两天。请别对着它呼气。',
        '2': '一碗好面教人耐心。一碗绝世好面教人其余的一切。',
        say: '那是一碗面吗？'
      },
      trainBack: {
        '1': '很好。现在去吃点热的。力量来自碗里。'
      },
      bye: {
        '1': '一路顺风。脚步要轻。踢得要狠。'
      }
    },
    sbMasterBard: {
      hello: {
        '1': '欢迎欢迎，快从冷风里进来，别在外面待！哎呀，又押韵了。它总这样。',
        '2': '我是“好天气”拉克。我在炉火边弹琴，谁愿意听，我就教谁弹鲁特琴。'
      },
      again: {
        '1': '我最喜欢的听众！拉张凳子来。小心猫，她是评论家。'
      },
      train: {
        '1': '跟我一起弹。一、二、三……别看手指。用心感受！'
      },
      class: {
        '1': '唱让自己人更勇敢的歌，弹让对面睡着的曲子。',
        '2': '魅力用来赢得观众。技巧让你的手指跟得上你的心。',
        say: '吟游诗人是做什么的？'
      },
      ready: {
        strong: {
          '1': '你现在能让任何酒馆座无虚席！我的歌全都拿去吧。'
        },
        able: {
          '1': '好听的曲子！你可以学下一段了。'
        },
        weak: {
          '1': '还不行。观众还在打哈欠。多练魅力，我的朋友。'
        }
      },
      story: {
        '1': '从前，有位骑士走过这座桥，身上只有一把剑和一首歌……',
        '2': '等等，配上音乐更好听。啦啦啦，骑士走啊走……我讲到哪儿了？',
        '3': '哦，算了。不过这首歌挺好听的，对吧？',
        say: '你能给我讲个故事吗？'
      },
      trainBack: {
        '1': '好极了！每天练习。就算弹得很难听也要练。尤其是难听的时候。'
      },
      bye: {
        '1': '再会，愿你一路平安，开开心心！哎呀。又押韵了。拜拜！'
      }
    }
  },
  invasion: {
    pylonsDown: '最后一根塔柱倒下，宝藏散落一地！',
    reborn: {
      tusker: '重生的獠牙',
      emberLord: '炼狱余烬领主',
      frostJarl: '重生的冰霜领主',
      voidDragon: '重生的虚空巨龙'
    }
  },
  enemy: {
    sphinx: "斯芬克斯",
    leviathan: "利维坦",
    hydra: "九头蛇",
    elderDragon: "上古巨龙",
    trainingDummy: '训练木桩',
    goblin: '哥布林',
    goblinSlinger: '哥布林投石手',
    bandit: '强盗',
    banditArcher: '强盗弓手',
    wolf: '野狼',
    banditChief: '强盗头目',
    gnome: '地精',
    goblinKing: '哥布林王',
    treant: '树人',
    spider: '巨型蜘蛛',
    broodSpider: '幼蛛',
    outlawCaptain: '亡命徒队长',
    elderTreant: '古树人',
    warlord: '军阀克拉格',
    fireElemental: '火元素',
    ironGolem: '铁魔像',
    cultist: '邪教徒',
    emberLord: '余烬领主',
    ironColossus: '钢铁巨像',
    frostGiant: '冰霜巨人',
    naga: '娜迦',
    skeleton: '骷髅',
    necromancer: '死灵法师',
    chimera: "奇美拉",
    chimeraTail: "蛇尾",
    centaurWarchief: "半人马督军",
    cyclops: "独眼巨人",
    frostJarl: '冰霜领主',
    nagaOracle: '溺水先知',
    voidStalker: '虚空潜行者',
    wyvern: '双足飞龙',
    highDemon: '高阶恶魔',
    voidWarden: '虚空典狱长',
    voidDragon: '虚空巨龙',
    doomKnight: '末日骑士',
    imp: '小恶魔',
    archDemon: '大恶魔',
    voidling: '虚空幼体',
    voidLord: '虚空领主',
    demonPylon: '恶魔塔柱',
    orderGuard: '骑士团审判官',
    syndicateBlade: '商会刀客',
    goblinWarchief: '哥布林督军',
    thornfather: '荆棘之父',
    broodMother: '巢母',
    banditBaron: '盗匪男爵',
    cinderGolem: '余烬魔像',
    frostHowler: '霜嚎兽',
    tideSerpent: '潮汐巨蛇',
    riftKnight: '裂隙骑士',
    wyvernMatriarch: '双足飞龙女王',
    tusker: '獠牙，战争野猪',
    tuskerCameo: '獠牙',
    goblinTyrant: '哥布林暴君',
    voidDrake: '虚空幼龙',
    pitLord: '深渊领主',
    frostThane: '冰霜族长',
    hellhound: '地狱犬',
    frostHellhound: '冰霜地狱犬',
    gargoyle: '石像鬼',
    harpy: '鹰身女妖',
    corruptedTreant: '腐化树人',
    centaurRaider: '半人马掠夺者',
    cyclopsBrute: '独眼巨人蛮兵',
    demonMiner: '恶魔矿工',
    sphinxAcolyte: '人面狮身侍祭',
    seaDemon: '海魔',
    drakeHatchling: '幼龙',
    hydraSpawn: '九头蛇幼体'
  },
  results: {
    careful: '谨慎通关 ×{mult}',
    victory: '胜利！',
    defeat: '战败',
    retreat: '已撤退',
    firstClear: '首次通关！',
    waves: '撑过的波数：{n}',
    levelUp: '升到 {n} 级！',
    points: '+{n} 属性点',
    xp: '经验',
    gold: '金币',
    lost: '损失',
    kills: '击败',
    chests: '宝箱',
    bosses: '首领',
    mastery: '区域精通',
    masteryPct: '{n}%',
    newBest: '新纪录！',
    time: '用时',
    unlocked: '地图新增：{places}',
    equipped: '已装备',
    better: '比你身上的更好',
    retry: '再试一次',
    tip: '经验和战利品都会保留。用掉属性点，拜访导师，变强后再回来。'
  },
  pause: {
    title: '已暂停',
    resume: '继续',
    controls: '操作说明',
    retreat: '撤回地图',
    retreatNote: '到目前为止获得的东西都会保留，但该区域不算通关。'
  },
  ending: {
    level: '等级',
    more: '虚空裂隙已在要塞下方开启。但对你力量真正的考验在斗技场等着你：一波波向上攀登，赢取唯有其冠军才拥有的神话奖品。',
    order: {
      title: '钢铁和平',
      text: '铁之骑士团的旗帜在恐惧要塞上飘扬。道路安全，律法繁多，你的名字刻在城门之上。'
    },
    syndicate: {
      title: '灰烬交易',
      text: '商会在要塞的阴影里统治。王国里再没有什么是禁止的，只是很贵。'
    },
    circle: {
      title: '以太时代',
      text: '议会用捕获的虚空之火点亮了要塞。奇迹从它的大门里源源涌出，没有人问代价是什么。'
    },
    free: {
      title: '不要国王',
      text: '王座碎了一地，要塞空无一人。许久以来第一次，王国属于生活在其中的人们。'
    },
    unbound: {
      title: '无缚者',
      text: '你坐上了王座。骑士团、商会和议会联手向你进军。让他们来吧。'
    },
    note: {
      goblinPact: '哥布林商人还在桑福德的广场上讨价还价。',
      goblinSlain: '洞窟空无一物，商队准时往来。',
      goblinRansom: '哥布林王又有钱了，也又开始劫掠了。',
      oakhavenSaved: '奥克黑文的城墙更高了，集市也更热闹了。',
      oakhavenFallen: '奥克黑文的街道长满杂草。黑市生意兴隆。',
      coreOrder: '艾恩霍尔德的矿井安静了，矮人又开始挖矿。',
      coreCircle: '艾恩霍尔德的熔炉泛着蓝光，它的枪是王国里最好的。',
      coreSold: '在某个地方，核心仍在嗡鸣。魔像仍在行走。',
      oracleFreed: '风平浪静的日子里，渔夫能在远处的水面上看见先知。',
      oracleSlain: '沉没神殿一片寂静。再也没有人知道接下来会发生什么。',
      dragonPact: '一头龙在要塞屋顶筑了巢，只听一个名字的召唤。',
      dragonSlain: '一颗龙的头骨挂在骑士团的大厅里。'
    }
  },
  options: {
    saves: {
      save: '保存',
      load: '读取',
      newGame: '开始新游戏',
      newGameWarn: '当前游戏将被新游戏取代。如果想保留，请先保存到一个存档位。',
      confirm: '确定吗？再点一次',
      slot: '存档位 {n}',
      empty: '空',
      level: '等级 {n}',
      levelAt: '{level} · {place}',
      overwriteAsk: '覆盖',
      saved: '已保存！',
      loadWarn: '读取会取代当前游戏。如果想保留，请先保存到一个存档位。',
      saveHint: '游戏会在你游玩时自动保存。在这里保存一份副本，以后可以回到它，比如尝试不同的流派。',
      loadHint: '读取已保存的副本。游戏将从那里重新开始。'
    },
    gameplay: '玩法',
    title: '选项',
    general: '通用',
    audio: '音频',
    language: '语言',
    difficulty: '难度',
    soundEffects: '音效',
    music: '音乐',
    mute: '静音',
    musicTrack: '音乐曲目',
    musicTracks: {
      cozy: '宁静',
      trance: '冒险'
    },
    haptics: '震动',
    on: '开',
    off: '关',
    close: '关闭',
    keyboard: {
      auto: '自动检测键盘布局',
      layout: '键盘布局',
      detected: '已检测：{layout}',
      bindings: '按键绑定',
      press: '请按一个键…（Esc 取消）',
      reset: '重置按键'
    },
    actions: {
      up: '向上移动',
      down: '向下移动',
      left: '向左移动',
      right: '向右移动',
      skill1: '技能 1',
      skill2: '技能 2',
      skill3: '技能 3',
      skill4: '技能 4',
      skill5: '技能 5',
      skill6: '技能 6',
      potion: '喝药水',
      manaPotion: '喝法力药水',
      leave: '离开已胜利的区域',
      interact: '交谈',
      target: '下一个目标',
      map: '世界地图',
      character: '英雄',
      inventory: '背包',
      skills: '技能',
      roll: '翻滚',
      elixir: '喝灵药',
      elixirNext: '下一种灵药',
      skill7: '技能 7',
      skill8: '技能 8'
    },
    difficulties: {
      easy: '简单',
      medium: '普通',
      hard: '困难'
    },
    difficultyHints: {
      easy: '敌人攻击更弱，也更容易被击倒。',
      medium: '预设的标准挑战。',
      hard: '敌人更耐打，攻击也更猛。'
    }
  },
  adsBlocked: {
    title: '无法显示广告',
    body: '我们本想为你播放一段视频，但你的浏览器中有内容拦截了广告。',
    allowPrefix: '请在以下网站允许广告：',
    allowSuffix: '（或为本游戏暂停广告拦截器）然后重试。',
    gotIt: '知道了'
  },
  forcedDark: {
    title: '请为本游戏关闭深色模式',
    body: '你的浏览器或某个扩展正在给这个页面重新上色。游戏有自己的配色，无法配合深色模式的强制改色。',
    waiting: '一旦关闭，游戏会自动继续。',
    continueAnyway: '风险自负，继续',
    hint: {
      darkReader: 'Dark Reader：点击它的图标，针对本网站将其关闭。',
      extension: '打开你的深色模式扩展，针对本网站将其关闭。',
      chromiumFlag: '打开 {flagUrl}，把“Auto Dark Mode for Web Contents”设为 Default，或在浏览器的主题设置中关闭“dark theme for sites”。',
      samsung: 'Samsung Internet：打开菜单关闭深色模式，或在 Labs 中开启“Use website dark theme”。',
      forcedColors: 'Windows：在 设置 → 辅助功能 → 对比度主题 中关闭对比度主题。',
      firefoxColors: 'Firefox：设置 → 颜色 → 把“覆盖页面指定的颜色”设为“从不”。'
    }
  },
  samsungFix: {
    title: '快速颜色检查',
    body: '部分手机会改变网页的颜色。请对比下面两个方块。',
    question: '两个方块看起来一样吗？',
    refSquare: '参考方块',
    pageSquare: '页面方块',
    yes: '是的，一样',
    no: '不，看起来不同',
    option: '修正颜色（三星深色模式）',
    optionHint: '如果菜单显得很暗或文字难以阅读，请开启。',
    recheck: '重新进行颜色检查'
  },
  saveStatus: {
    restoredTitle: '云存档已恢复',
    restoredBody: '恢复奖励 +{n} 金币',
    tap: '点击',
    pausedTitle: '云同步已暂停',
    pausedBody: '正在离线游戏。你的进度会保存在本地。',
    retry: '重试',
    dismiss: '忽略'
  },
  loading: {
    tooLong: '加载太久？请关闭广告拦截器并刷新页面。'
  },
  license: {
    denied: '访问被拒绝：请购买许可证。'
  },
  leaderboard: {
    title: '排行榜',
    rank: '#',
    player: '玩家',
    score: '经验',
    flair: '等级',
    empty: '排行榜上还没有人。来当第一个吧！',
    failed: '无法连接排行榜。',
    loading: '加载中…',
    you: '你',
    yourRank: '{total} 人中你排第 {n}',
    of: '/ 共 {n} 名玩家',
    tabGlobal: '全球'
  },
  wind: {
    title: '重新振作',
    text: '你倒下了。要以 {n}% 的生命值站起来，把这场战斗打完吗？',
    once: '每次访问限一次。',
    watch: '观看视频',
    take: '重新站起',
    decline: '不用了'
  },
  purse: {
    offer: '钱袋三倍:+{n}'
  },
  shelf: {
    title: '稀有商品',
    restock: '新商品',
    tomorrow: '明天有新商品'
  },
  rested: {
    hud: '2× 经验',
    banner: '欢迎回来！你精力充沛：接下来的战斗中有{time}的双倍经验。',
    hm: '{h}小时{m}分钟',
    m: '{m}分钟',
    h: '{h}小时'
  },
  preset: {
    title: '配置',
    name: '配置 {n}',
    rename: '配置 {n} 的名称',
    save: '保存',
    load: '使用',
    saved: '已保存 {name}。',
    loaded: '已启用 {name}。',
    skipped: '被略过：{list}'
  },
  respec: {
    title: '忘掉你的修炼',
    note: '拿回你花掉的全部 {n} 属性点，再重新分配。',
    none: '你还没有可以拿回的点数。',
    free: '忘掉（免费）',
    buy: '忘掉（{n} 金币）',
    confirm: '确定吗？再点一次',
    bench: '这些技能会放回架上：{list}',
    done: '好了。点数又是你的了，可以重新分配。'
  },
  contract: {
    title: '委托公告板',
    lead: '每个势力每天会张贴一项委托。游玩时就会累计；可在任何城镇提交。',
    slay: '击败：{enemy}（{place}）',
    clear: '在{place}的探访中获胜',
    chests: '在任何地方开宝箱',
    rep: '声望 +1',
    handIn: '提交',
    handed: '今日已完成',
    thanks: '{name}向你道谢。'
  },
  rep: {
    title: '声望',
    meter: '{name}声望：{n}',
    giftAt: '声望 +{n} 时的礼物',
    giftClaim: '领取礼物',
    giftTaken: '已领取礼物',
    giftGot: '送你的礼物：300 金币和{item}。',
    giftGold: '送你的礼物：300 金币。',
    blessAt: '声望 +{n} 时的祝福',
    bless: {
      order: '祝福：生命 +5%',
      syndicate: '祝福：击杀获得的金币 +10%',
      circle: '祝福：法力回复 +10%'
    }
  },
  ladder: {
    tab: '斗技场',
    wave: '波',
    week: '本周：{mod}',
    weekBest: '本周最佳：第 {n} 波',
    yourBest: '你的本周最佳：第 {n} 波',
    none: '本周还没有挑战记录。',
    mod: {
      fire: '全是火焰',
      nopotions: '禁用药水',
      glass: '玻璃',
      swarm: '蜂拥',
      elites: '精英游行',
      haste: '加速'
    },
    modDesc: {
      fire: '敌人的每次攻击都是火焰',
      nopotions: '没有药水',
      glass: '所有人的攻击力提高 50%',
      swarm: '敌人更多，但各自的生命更少',
      elites: '每一波都有一位冠军',
      haste: '敌人移动和攻击都更快'
    }
  },
  forge: {
    upgrade: '升级（{n} 金币）',
    next: '下一级 +{level}：属性 +{pct}%',
    town: '任何城镇的铁匠都能升级它。'
  },
  ore: {
    'demonglass': { 'name': "恶魔玻璃" },
    'ichor': { 'name': "神话灵液" },
    iron: {
      name: '铁矿石'
    },
    silver: {
      name: '银矿石'
    },
    gold: {
      name: '金矿石'
    },
    mithril: {
      name: '秘银矿石'
    },
    adamant: {
      name: '艾达曼矿石'
    },
    aetherite: {
      name: '以太晶矿石'
    }
  },
  plant: {
    sunpetal: {
      name: '日光瓣',
      desc: '一朵明黄色的花。治疗师们对它赞不绝口。'
    },
    glowcap: {
      name: '荧光菇',
      desc: '一种在黑暗中发光的蘑菇。对头脑有益。'
    },
    swiftfern: {
      name: '疾风蕨',
      desc: '一种轻盈的蕨草。擦在靴子上，跑起来吧。'
    },
    ironmoss: {
      name: '铁苔',
      desc: '长在石头上的坚韧苔藓。能让皮肤变硬。'
    },
    emberbloom: {
      name: '余烬花',
      desc: '握在手里暖暖的花。'
    },
    frostmint: {
      name: '霜薄荷',
      desc: '清凉新鲜的叶子。能让头脑清醒。'
    },
    moonbell: {
      name: '月铃花',
      desc: '一种罕见的苍白花朵，能让眼神更敏锐。'
    },
    shadowthorn: {
      name: '影棘',
      desc: '一种罕见的暗色荆棘。很强，还有点邪门。'
    }
  },
  journal: {
    errands: '委托',
    empty: '日志里还什么都没有。镇上的人会来请你帮忙。',
    from: '委托人：{npc}',
    ready: '完成！回去找{npc}。',
    taken: '新委托：{title}',
    done: '委托完成：{title}',
    step: {
      slay: '击败 {enemy} ×{n}',
      slayAt: '在{place}击败 {enemy} ×{n}',
      slayAnyAt: '在{place}击败 {n} 个敌人',
      clear: '肃清{place}',
      visit: '前往{place}',
      gather: '采集 {plant} ×{n}',
      bring: '带来{item}',
      pieces: '找到 {n} 块藏宝图碎片',
      dig: '在{place}挖出宝藏',
      talk: '和{npc}交谈'
    }
  },
  board: {
    title: '{town}告示板',
    read: '查看',
    lead: '今日任务。完成后回这里交付。',
    kind: {
      slay: '狩猎',
      gather: '草药',
      escort: '商队'
    },
    slay: '在{place}击败 {enemy} ×{n}',
    gather: '上交 {plant} ×{n}',
    escort: '在通往奥克黑文的路上护卫商队',
    xp: '+{n} 经验',
    setOut: '出发',
    thanks: '完成！全镇向你致谢。'
  },
  escort: {
    start: '护送商队走到路的尽头！',
    waiting: '商队在等你。',
    arrived: '商队平安抵达！',
    lost: '商队覆没了……'
  },
  elixir: {
    might: {
      name: '力量灵药',
      desc: '五分钟内伤害 +{n}%'
    },
    iron: {
      name: '铁肤药剂',
      desc: '五分钟内护甲 +{n}%'
    },
    swift: {
      name: '迅捷补剂',
      desc: '五分钟内移动速度和攻击速度 +{n}%'
    },
    mind: {
      name: '清心药汤',
      desc: '五分钟内技能冷却加快 {n}%'
    },
    vigor: {
      name: '活力灵药',
      desc: '五分钟内每秒恢复 {n}% 生命'
    },
    shadow: {
      name: '渴血药剂',
      desc: '五分钟内攻击按伤害的 {n}% 为你回血'
    }
  },
  alchemy: {
    talk: '草药放进去，灵药倒出来。我们来熬哪一种？',
    lead: '每种灵药在战斗中生效五分钟。用第三个药瓶来喝。每种最多带 {n} 瓶。',
    brew: '熬制 · {n}',
    carry: '带上这个',
    carried: '已装进药瓶',
    count: '{n} / {max}',
    herb: '{plant}：{have}/{n}',
    done: '熬好了！',
    why: {
      full: '这种你已经带满了。',
      herbs: '草药不够。去野外多采一些。',
      gold: '金币不够。'
    }
  },
  memory: {
    title: '记忆卡牌摊',
    lead: '在沙子漏完前找出所有配对，就能赢回双倍赌注。连赢五局，还有一件传说奖品。',
    bet: '下注 {n}',
    row: '连胜：{n}/{max}',
    pairs: '{n} 对 · {s} 秒',
    won: '全部配对找到了！赢得 {n} 金币。',
    lost: '沙子漏完了。赌注输掉了。',
    again: '再玩一次',
    noGold: '金币不够下这个注。',
    card: '卡牌 {n}'
  },
  cups: {
    title: '杯子摊',
    lead: '看着宝石，跟住它的杯子，然后选出来。连胜越多赢得越多。第三胜有奖品，第五胜有宝藏。',
    free: '免费一局',
    fee: '开始 · {n}',
    row: '连胜：{n} / {max}',
    next: '下一胜：{n} 金币',
    watch: '看好宝石！',
    follow: '跟住它……',
    pick: '选一个杯子！',
    hint: '点一下杯子，或按它的数字键。',
    won: '找到了！+{n} 金币',
    lost: '不是这个。连胜重新计算。',
    near: '好可惜！就在旁边。',
    timeout: '太慢了！连胜重新计算。',
    again: '再来一局',
    noGold: '金币不够。明天的第一局免费。',
    cup: '杯子 {n}'
  },
  battle: {
    title: '物品对决',
    lead: '拿你的物品和赌徒的比一比：售价高的得一分，先得两分者获胜。不管输赢，你出的物品都拿不回来。连赢三局，还能得到一件奖品。',
    fee: '入座 · {n}',
    row: '连胜：{n}/{max}',
    needItems: '背包里至少需要 {n} 件未穿戴的物品。',
    noGold: '金币不够付入场费。',
    theirs: '赌徒出的是',
    pick: '选一件物品出牌',
    lay: '就出它',
    value: '{n} 金币',
    score: '你 {a} · {b} 赌徒',
    roundWon: '你的比较值钱。你得一分！',
    roundLost: '对方的比较值钱。赌徒得一分。',
    won: '你赢了这局！+{n} 经验',
    lost: '赌徒赢了这局。',
    again: '再玩一次'
  },
  gamble: {
    prize: '奖品：{item}！',
    prizeGold: '这些你都有了，所以改给你 {n} 金币！'
  },
  errand: {
    farmersFavor: {
      title: '托勒家的狼'
    },
    herbalistFavor: {
      title: '布莱尔的日光瓣'
    },
    collectorFavor: {
      title: '收藏家的月铃花'
    },
    mirelaFavor: {
      title: '米蕾拉丢失的货物'
    },
    treasureMap: {
      title: '鲁克队长的藏宝图'
    },
    windrunnerTest: {
      title: '疾风行者的试炼'
    },
    frostwardenTest: {
      title: '寒霜卫士的试炼'
    },
    lightbringerTest: {
      title: '光明使者的试炼'
    },
    beastcallerTest: {
      title: '唤兽师的试炼'
    }
  }
}
