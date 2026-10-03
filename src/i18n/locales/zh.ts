// Simplified Chinese locale — mirrors the key shape of en.ts exactly.
export default {
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
    groups: '已击败 {n}/{total} 群敌人',
    wave: '第 {n} / {total} 波'
  },
  menu: {
    map: '世界地图',
    character: '英雄',
    skills: '技能',
    inventory: '背包'
  },
  combat: {
    dodge: '闪避',
    block: '格挡',
    immune: '免疫'
  },
  level: {
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
    ambush: '伏击'
  },
  toast: {
    item: '获得：{item}',
    levelUp: '升到 {level} 级！属性点 +3',
    boss: '{boss}出现了',
    wave: '第 {n} 波'
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
    show: '给我指路：{goal}'
  },
  node: {
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
      desc: '八波敌人，一波比一波难。站到最后的人赢得金币和荣耀。'
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
    danger: {
      '1': '略高于你的等级。',
      '2': '以你的等级来说很危险。',
      '3': '远高于你的等级。'
    },
    questOpen: '{quest}：有个抉择在这里等你。',
    questDone: '{quest}：{choice}',
    trainer: '隐藏导师：{cls}',
    new: '新',
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
    }
  },
  skill: {
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
      desc: '在{radius} m内的敌人之间冲刺，攻击{hits}次，总共造成{dmg}%敏捷伤害。起舞时你不会被击中。'
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
    '1': '1阶',
    '2': '2阶',
    '3': '3阶',
    '4': '4阶',
    '5': '5阶',
    '6': '传说'
  },
  weapon: {
    melee: '近战 · 随{attr}成长',
    ranged: '远程 · 随{attr}成长',
    magic: '魔法 · 随{attr}成长'
  },
  source: {
    mob: '由{zone}的怪物掉落。',
    chest: '可在{zone}的宝箱里找到。',
    boss: '由{zone}的首领掉落。',
    secret: '藏在{zone}的一个秘密宝箱里。'
  },
  mod: {
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
    overheatCrit: '过热时暴击伤害 +{n}%'
  },
  item: {
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
    heartOfTheMountain: {
      name: '山脉之心'
    },
    ringOfAbsolutePower: {
      name: '绝对力量之戒'
    }
  },
  bag: {
    equip: '装备',
    unequip: '卸下',
    tooLow: '需要 {n} 级。',
    worn: '你正穿着它。先脱下才能出售。',
    versus: '与{item}对比',
    hint: '点击物品查看。再点一次，或拖到栏位上，即可穿戴。',
    empty: '背包里没有这类物品。',
    slotEmpty: '{slot}：空',
    slotHolds: '{slot}：{item}',
    filter: {
      all: '全部',
      weapons: '武器',
      armor: '护甲',
      trinkets: '饰品'
    },
    sort: {
      slot: '类型',
      tier: '阶',
      level: '等级'
    },
    sortBy: '排序：{by}'
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
    hint: '选一堂课。边缘是绿色就表示现在可以学。',
    block: {
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
      bye: '那我不打扰你了。',
      trade: '能看看你的货吗？',
      train: '教教我。',
      heal: '能帮我疗疗伤吗？',
      mana: '你这儿有补法力的东西吗？',
      who: '冒昧问一句，你是谁？',
      rumor: '最近听到什么消息吗？',
      ready: '你觉得我可以学更多了吗？'
    },
    sunfordSmith: {
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
    }
  },
  enemy: {
    trainingDummy: '训练木桩',
    goblin: '哥布林',
    goblinSlinger: '哥布林投石手',
    bandit: '强盗',
    banditArcher: '强盗弓手',
    wolf: '野狼',
    banditChief: '强盗头目',
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
    wyvernMatriarch: '双足飞龙女王'
  },
  results: {
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
    more: '虚空裂隙已在要塞下方开启。斗技场依然欢迎所有挑战者。',
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
      skills: '技能'
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
  }
}
