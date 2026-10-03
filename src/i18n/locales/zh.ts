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
      touch: '点击“教教我”，看看这位导师能教什么。',
      mouse: '点击“教教我”，看看这位导师能教什么。'
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
    }
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
    }
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
      buy: '好眼光。好好爱惜它。',
      sell: '我会给它找个好归宿。',
      back: '改主意了？喏，原样没动。',
      poor: '带着更鼓的钱袋再来吧。'
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
    talk: '坐下，歇一歇。离开这里时你会完好如初，药瓶也都装满。想多带几瓶的话，这个我可以卖给你。',
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
    sunfordSmith: {
      name: '铁匠布拉姆',
      talk: '朴实的钢，公道的价。挡个哥布林没问题。'
    },
    sunfordPeddler: {
      name: '货郎蒂莉',
      talk: '戒指！护符！都是我捡来的，绝对不是偷的。'
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
      talk: '大王说做买卖，格里克就做买卖。亮晶晶换亮晶晶。好亮晶晶。'
    },
    captainHale: {
      name: '黑尔队长'
    },
    oakArmorer: {
      name: '护甲匠奥多',
      talk: '我一半的存货都上了城墙。剩下的你拿去吧。'
    },
    oakMasterArmorer: {
      name: '奥多大师',
      talk: '你救了这座城。里屋的好板甲，为你拿出来。'
    },
    oakWeapons: {
      name: '刀剑商塞娜',
      talk: '锋利，趁手，谁付钱就卖给谁。今天是你。'
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
      talk: '不问名字，不问来路。商会抽成，货归你。'
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
      talk: '矮人打造。要是断了，那是你的问题。'
    },
    ironAetherWorks: {
      name: '工匠沃斯',
      talk: '议会对核心的研究改变了一切。拿着这个。别对着我。'
    },
    ironArmor: {
      name: '“铁壁”加伦',
      talk: '能挡住巨人大棒的板甲。其他人嘛，有戒指。'
    },
    ironOrderArmor: {
      name: '骑士团军需官',
      talk: '骑士团记得是谁毁掉了核心。军械库为你敞开。'
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
        '1': '今晚要下雨，我的膝盖说的。',
        '2': '你的膝盖上周也这么说。',
        '3': '后来不也下了吗？在某个地方。'
      },
      harvest: {
        '1': '这是这些年来最好的大麦。',
        '2': '你每年都这么说。'
      },
      goblins: {
        '1': '哥布林从米勒农场叼走了三只母鸡。',
        '2': '才三只？它们变懒了。',
        '3': '或者是吃饱了。'
      },
      kingGone: {
        '1': '听说哥布林王再也回不来了。',
        '2': '那是谁一直在偷我的萝卜？'
      },
      pact: {
        '1': '今天有个哥布林卖给我一把勺子。',
        '2': '是你自己的勺子吗？',
        '3': '是啊。不过价钱不错。'
      },
      bram: {
        '1': '布拉姆又在敲打了。从天亮就开始！',
        '2': '稳得像心跳，那个人。'
      },
      pie: {
        '1': '我是不是闻到苹果派的香味了？',
        '2': '有过。过去式。',
        '3': '你全吃了？又来？'
      },
      road: {
        '1': '现在没人走平原大路了。',
        '2': '路上有强盗，当然没人走。'
      },
      hero: {
        '1': '有人清理了平原大路！',
        '2': '总算。我表哥还欠我一辆马车呢。'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': '一棵卷心菜两个银币。两个！',
        '2': '那可是一棵非常漂亮的卷心菜。',
        '3': '也没那么漂亮。'
      },
      watch: {
        '1': '巡逻队把守门的卫兵加了一倍。',
        '2': '好事。我睡得安稳多了。'
      },
      caravan: {
        '1': '香料商队又晚了。',
        '2': '是强盗吗？',
        '3': '或者车夫找到了一家酒馆。'
      },
      siege: {
        '1': '听说城外驻扎了一支军队。',
        '2': '那我们最好给地窖多备点粮。'
      },
      saved: {
        '1': '你看到围城被打破了吗？太壮观了！',
        '2': '我是在床底下看的。',
        '3': '那也算看到了。'
      },
      fountain: {
        '1': '我往喷泉里扔了枚硬币祈福。',
        '2': '我又给捞出来了。谢啦！'
      },
      ash: {
        '1': '什么东西都有一股灰烬味。',
        '2': '总比什么味道都没有强。'
      },
      hide: {
        '1': '你昨晚听到外面的脚步声了吗？',
        '2': '嘘。小点声。',
        '3': '对不起。对不起。'
      },
      bread: {
        '1': '我找到了半个面包。咱们分着吃。',
        '2': '你真是个好人。谢谢你。'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': '第四层有一条不错的铜矿脉。',
        '2': '铜？我要金子。',
        '3': '你更想要的是睡一觉吧。'
      },
      forge: {
        '1': '那座大熔炉一百年没熄过火。',
        '2': '我爷爷的烟斗也一样。'
      },
      beard: {
        '1': '你把胡子修短了！',
        '2': '在铁砧边着火了。',
        '3': '不过挺适合你。'
      },
      core: {
        '1': '现在深层矿井里有东西在发光。',
        '2': '那下面发光的东西没一样是好的。'
      },
      order: {
        '1': '骑士团的护甲匠干活真快。',
        '2': '快是快。可不如我们做得好。'
      },
      circle: {
        '1': '议会的法师干活时会哼歌。',
        '2': '我想总比我们唱得好听。'
      },
      cold: {
        '1': '今早这上面真冷。',
        '2': '那就站近熔炉点。'
      }
    },
    smalltalkKids: {
      tag: {
        '1': '该你抓人啦！',
        '2': '不公平，我还没准备好！'
      },
      dragon: {
        '1': '我长大以后要骑龙。',
        '2': '龙才不让你骑呢。',
        '3': '好心的龙就让！'
      },
      sword: {
        '1': '看，真正的剑棍！',
        '2': '那只是根树枝。'
      },
      frog: {
        '1': '我在井边发现了一只青蛙。',
        '2': '我们能养它吗？',
        '3': '我觉得是它在养我们。'
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
      bye: '暂时就这些。',
      trade: '让我看看你的货。',
      train: '教教我。',
      heal: '帮我疗伤。',
      mana: '我的法力需要补充。',
      who: '你是谁？',
      rumor: '最近听到什么消息吗？',
      ready: '我准备好学更多了吗？'
    },
    sunfordSmith: {
      hello: {
        '1': '嗯。生面孔。你就是守住平原大路的人。',
        '2': '我是布拉姆，打钢的。你看起来需要点钢。'
      },
      kingDead: {
        '1': '听说哥布林王死了。好。商队的车轮上能少几个要我敲平的凹坑。'
      },
      kingPact: {
        '1': '哥布林在广场上做买卖。从没想过会看到。不过他们的铁是废物。'
      },
      kingRansom: {
        '1': '听说你拿了王的金子，还把王冠留给他。劫掠又要回来了。'
      },
      ending: {
        '1': '全王国都在谈那个王座。你还照样来我这买东西。嗯。'
      },
      again: {
        '1': '又来了。好。钢自己可不会卖出去。'
      },
      trade: {
        '1': '朴实的钢，公道的价。随便看。'
      },
      who: {
        '1': '布拉姆。在这铁砧前三十年了。',
        '2': '我给马钉掌，修犁，给你这样的傻瓜造武器。就这个顺序。'
      },
      gear: {
        '1': '打算挨打，就要盾。不想挨打，就要大点的剑。',
        '2': '是力量在挥我的钢。买重家伙之前，先把点数加在那上面。',
        say: '我出去该带什么？'
      },
      rumor: {
        plains: {
          '1': '平原大路上有哥布林。先清掉他们，再考虑买什么花哨的东西。'
        },
        hollows: {
          '1': '劫掠者从哥布林洞窟爬出来，就在平原那头。他们的王坐在最底下。'
        },
        woods: {
          '1': '平原以东就是低语森林。那里的树会走。带把斧头。'
        },
        siege: {
          '1': '奥克黑文那边冒烟了。听说有个军阀在城外扎了营。'
        },
        north: {
          '1': '艾恩霍尔德的钢又上路了。想要比我的更好的，往北去。'
        }
      },
      shopBack: {
        '1': '愿它陪你平安。或者至少，陪你。'
      },
      bye: {
        '1': '路上小心。'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': '哇，客人！或者是卫兵？你不是卫兵吧？',
        '2': '我是蒂莉。戒指、护符、幸运小物。都是捡的，绝没偷过。'
      },
      rival: {
        '1': '你看到格里克的摊子了吗？哥布林小玩意儿！我完了。买点什么吧。可怜可怜我。'
      },
      again: {
        '1': '我最喜欢的客人！这话我对谁都说，但对你是真心的。'
      },
      trade: {
        '1': '戒指！护符！都是我捡的，绝对不是偷的。'
      },
      who: {
        '1': '我走遍大路，捡路上落下的东西。',
        '2': '强盗逃跑时，最好的东西掉得最多。'
      },
      trinkets: {
        '1': '一次戴两个，每只手一个。一点小优势也是优势。',
        say: '饰品有什么用？'
      },
      stolen: {
        '1': '嘘！小声点。好吧。好啦好啦。',
        '2': '收下这枚戒指，咱们就没聊过。这是枚好戒指。大部分是铜。',
        say: '这些全是你偷来的，对吧？'
      },
      rumor: {
        arenaShut: {
          '1': '这儿南边有座斗技场，大门锈死了。哥布林的麻烦一结束，它就会打开。'
        },
        arenaOpen: {
          '1': '斗技场开了！听说有八波呢。我卖好运。你会需要的。'
        },
        east: {
          '1': '奥克黑文的集市，闪亮的东西都给双倍价。往东，穿过森林。'
        }
      },
      shopBack: {
        '1': '等你更有钱了再来！'
      },
      bye: {
        '1': '出门当心口袋！我是说别在我身边丢。去别处。'
      }
    },
    trainerAegis: {
      hello: {
        '1': '站直了。你面前是铁之骑士团的骑士。',
        '2': '奥德里克爵士。我向那些愿意挡在别人身前的人传授盾术。'
      },
      saved: {
        '1': '奥克黑文还在，是因为你站了出来。我所教的，全部就是这个。'
      },
      fallen: {
        '1': '是你打开了奥克黑文的城门。为更小的事，我也埋葬过人。说明来意。'
      },
      dragon: {
        '1': '一位屠龙者来到我的训练场。大厅里会传唱这件事。'
      },
      friend: {
        '1': '骑士团对你评价很高。对朋友，我的课收费更低。'
      },
      foe: {
        '1': '骑士团把你列为敌人。我依然教你。荣誉不是他们能收回的。'
      },
      again: {
        '1': '举盾。你需要什么？'
      },
      train: {
        '1': '那就专心。我只演示一遍。'
      },
      class: {
        '1': '会走路的墙。我们替别人扛下这一击，让谁都不必挨打。',
        '2': '手臂靠力量，其余靠耐力。光明尽力而为。',
        say: '神盾骑士是什么？'
      },
      ready: {
        strong: {
          '1': '你的手臂足以承载我大部分所学。留意耐力，把剩下的也学了。'
        },
        able: {
          '1': '你可以学下一课了。别因此冲昏头。'
        },
        weak: {
          '1': '还不行。你臂力不足，又容易累。多练力量，多练耐力。'
        }
      },
      order: {
        '1': '我们守护道路与律法。有人说两样都管得太多。',
        '2': '与骑士团并肩，它的护甲匠和导师都会记得你。',
        say: '给我讲讲铁之骑士团。'
      },
      trainBack: {
        '1': '练到你厌烦为止。然后再多练。'
      },
      bye: {
        '1': '愿光明与你同行。'
      }
    },
    trainerPyro: {
      hello: {
        '1': '哎呀！学生？退后一点。再退一点。',
        '2': '安珀·雷恩，炎术师。眉毛基本都会长回来。'
      },
      core: {
        '1': '你把核心交给了议会！你知道现在我们能点着多少东西吗？'
      },
      friend: {
        '1': '以太议会喜欢你！这意味着有折扣，还少填好多表格。'
      },
      foe: {
        '1': '议会想把你烧成灰。好尴尬！我还是会教你。火不挑人。'
      },
      again: {
        '1': '你回来啦！而且什么都没着火。这个我们可以改。'
      },
      train: {
        '1': '好！仔细看。别看得那么近。'
      },
      class: {
        '1': '火能回答一切问题。先把它们烧着，再把烧着的炸掉。',
        '2': '全靠智力。还有源源不断的长袍。',
        say: '炎术师是做什么的？'
      },
      ready: {
        strong: {
          '1': '你能熔掉一个魔像！把我会的全拿去吧。难的那些要留意技巧。'
        },
        able: {
          '1': '你的脑子热得够用了，可以学下一个法术。来吧！'
        },
        weak: {
          '1': '嗯。智力还不够。到时候是火在用你，而不是你用火。'
        }
      },
      circle: {
        '1': '学者。我们研究世界是由什么构成的。其中有些会爆炸。',
        say: '以太议会是什么人？'
      },
      trainBack: {
        '1': '去点点什么吧！点个活该被点的东西。'
      },
      bye: {
        '1': '注意保暖！'
      }
    },
    elderMara: {
      hello: {
        '1': '原来你就是路上来的那位。走近些，我这眼睛已经不如从前了。',
        '2': '我是玛拉。我替这座镇子管了四十年的账簿和太平。'
      },
      slain: {
        '1': '洞窟安静了。你做了件难事，桑福德能安睡，全靠它。'
      },
      pact: {
        '1': '哥布林在我的广场上卖小玩意儿。孩子，你可真会说话。希望能长久。'
      },
      ransom: {
        '1': '你拿了他的金子，却把王冠留给了他。我年纪太大，装不出不失望的样子。'
      },
      saved: {
        '1': '奥克黑文传来消息。城门守住了。我很高兴我们的人在那里。'
      },
      fallen: {
        '1': '奥克黑文烧毁了，据说是你举的火把。别告诉我。我宁愿不知道。'
      },
      ending: {
        '1': '听说是你决定了谁坐上恐惧要塞。从桑福德的大路走到那里。真想不到。'
      },
      again: {
        '1': '坐一会儿吧。路会等着你的。'
      },
      reward: {
        '1': '我们的民兵守不住大路，你守住了。镇上给你凑了一份心意。',
        '2': '不多。是我们能拿出的每一枚硬币。',
        say: '您想见我？'
      },
      quest: {
        '1': '劫掠都是从哥布林洞窟来的。哥布林们立了个王。',
        '2': '您想让他死。',
        '3': '我只想让劫掠停下。怎么做，由你在那些洞穴的最深处决定。',
        '4': '洞窟就在平原那边。小心点去。',
        say: '桑福德遇到什么麻烦了？'
      },
      king: {
        say: '关于哥布林王……',
        slay: {
          '1': '一位王死了，我的商队也准时了。我就不问你当时什么感受了。'
        },
        pact: {
          '1': '协定！我母亲听了会晕过去。不过，做买卖总比办葬礼强。'
        },
        ransom: {
          '1': '金子花得快，怨恨可不会。劫掠回来的时候，记着这话。'
        }
      },
      town: {
        '1': '大多是农户。一个铁匠，一位治疗师，还有两位愿意忍耐我们的老师。',
        '2': '在这里歇息，用掉点数，变强了再出去。家，就是为这个存在的。',
        say: '给我讲讲桑福德。'
      },
      next: {
        say: '我接下来该去哪？',
        plains: {
          '1': '先去平原大路。商队过不去，我们就没饭吃。'
        },
        hollows: {
          '1': '先去哥布林洞窟。劫掠不停，别处都不安全。'
        },
        woods: {
          '1': '往东，穿过低语森林。去奥克黑文的路就在那些树下。'
        },
        oakhaven: {
          '1': '奥克黑文被围了。城外要是失守，城就守不住了。'
        },
        north: {
          '1': '往北，孩子。灰烬峭壁，再往前是艾恩霍尔德。越往前，麻烦越大。'
        }
      },
      bye: {
        '1': '活着回来。这是我对每个人唯一的要求。'
      }
    },
    sunfordHealer: {
      hello: {
        '1': '别动。不，你没事。习惯了。',
        '2': '露恩修女。路上弄坏的，我来修。'
      },
      again: {
        '1': '还是完整的一个人？我都有点失望了。'
      },
      heal: {
        '1': '坐下，歇着。你离开时会完好无损，药瓶也都满上。'
      },
      mana: {
        '1': '蓝色药瓶，味道苦。法术用光时喝一口。'
      },
      potions: {
        '1': '你每次进区域都带几瓶药。要在需要之前喝，别等需要了才喝。',
        '2': '想多带点的话，我可以卖你一条更长的腰带。',
        say: '药水怎么用？'
      },
      rumor: {
        goblins: {
          '1': '哥布林在投石上涂毒。要是你变绿了，马上回来。'
        },
        spiders: {
          '1': '森林里的蜘蛛咬伤，这周三例了。请尽量别被咬。'
        },
        burns: {
          '1': '北边来的士兵带着烧伤。说是灰烬峭壁。会走路的火。'
        }
      },
      healBack: {
        '1': '腰带装满，脑袋放低。'
      },
      bye: {
        '1': '尽量别把血弄到重要的东西上。'
      }
    },
    goblinTrader: {
      hello: {
        '1': '大个子！大个子订了协定。大王说，对大个子好点。',
        '2': '格里克好人。格里克有亮晶晶。大个子有金子。很配。'
      },
      again: {
        '1': '大个子回来了！格里克就知道。亮晶晶在叫大个子。'
      },
      trade: {
        '1': '大王说做买卖，格里克就做买卖。亮晶晶换亮晶晶。好亮晶晶。'
      },
      king: {
        '1': '大王又胖又高兴。不抢了。抢东西太累。',
        '2': '大王说大个子会说话。这是哥布林最高的夸奖。差不多吧。',
        say: '你们的大王还好吗？'
      },
      town: {
        '1': '人类洗太多。不过有派！格里克不知道有派。',
        say: '你喜欢桑福德吗？'
      },
      rumor: {
        crags: {
          '1': '格里克的表亲在北边黑石头里挖。说火在那里走。格里克待这儿。'
        },
        deep: {
          '1': '深的地方在醒，大个子。哥布林用脚能感觉到。'
        }
      },
      shopBack: {
        '1': '好买卖！大个子还会来，对吧？'
      },
      bye: {
        '1': '再见，大个子！别死。死人什么都不买。'
      }
    },
    captainHale: {
      hello: {
        '1': '又一把剑。好。我已经不问他们从哪来了。',
        '2': '黑尔队长。我统领奥克黑文巡逻队剩下的人。'
      },
      saved: {
        '1': '城门守住了。三百年了，又多了一次。我欠你一座城。'
      },
      ending: {
        '1': '你定下了恐惧要塞的王座。我的城墙看着比从前小了。'
      },
      again: {
        '1': '城墙还立着。今天还是。'
      },
      after: {
        '1': '奥克黑文记得，朋友。我也记得。'
      },
      quest: {
        '1': '一个军阀的大军把我们围住了。克拉格。他不白打仗。',
        '2': '谁给他钱？',
        '3': '灰烬商会。他们想要一座自己的城，而我们的有城墙。',
        '4': '在奥克黑文郊外击溃他。胜负就在那里。',
        say: '现在是什么情况？'
      },
      siege: {
        '1': '他们开价把城的三分之一给你。我知道。他们给我的是四分之一。',
        '2': '商会现在在每条路上追杀你。在外面小心背后。',
        say: '关于围城……'
      },
      town: {
        '1': '一座贸易城。平原和山脉之间来往的一切，都要在这里交过路费。',
        '2': '所以人人都想要它。所以我不会放手。',
        say: '给我讲讲奥克黑文。'
      },
      order: {
        '1': '我效忠奥克黑文。骑士团和我大多数时候意见一致。但这不是一回事。',
        say: '你效忠铁之骑士团吗？'
      },
      rumor: {
        crags: {
          '1': '森林以北，地面又黑又烫。灰烬峭壁。邪教徒在给火添柴。'
        },
        mines: {
          '1': '艾恩霍尔德不再送钢来了。矿井里出了问题。'
        },
        north: {
          '1': '极北安静了下来。据我的经验，安静更糟。'
        }
      },
      bye: {
        '1': '剑要拔得出来。'
      }
    },
    oakArmorer: {
      hello: {
        '1': '想要头盔的话，晚了。全都在城墙上。',
        '2': '奥多。护甲匠。累。'
      },
      again: {
        '1': '还在。存货还是不够。'
      },
      trade: {
        '1': '我一半存货上了城墙。剩下的你拿去。'
      },
      who: {
        '1': '二十年来我给这座城打造护甲。从没想过会看到它们同时穿在身上。'
      },
      armor: {
        '1': '站着不动就穿板甲。要跑就穿皮甲。想找死就穿长袍。',
        say: '我该穿什么护甲？'
      },
      rumor: {
        backRoom: {
          '1': '围城一破，我就开里屋。那里是好板甲。帮我打破它，行吗？'
        }
      },
      shopBack: {
        '1': '能撑住。大概。'
      },
      bye: {
        '1': '把头低下。'
      }
    },
    oakMasterArmorer: {
      hello: {
        '1': '是你！进来。里屋开着，专门为你开的。',
        '2': '如今大家叫我奥多大师。城镇活着，生意就好。'
      },
      ending: {
        '1': '从我的城门到恐惧要塞。我逢人就说你的护甲是我配的。'
      },
      again: {
        '1': '城门的英雄。今天要点什么？'
      },
      trade: {
        '1': '你救了这座城。里屋的好板甲，为你拿出来。'
      },
      town: {
        '1': '富裕，吵闹，满是抱怨过路费的商人。',
        '2': '太棒了。我一个礼拜没睡了。',
        say: '城里怎么样？'
      },
      rumor: {
        mines: {
          '1': '我的钢来自艾恩霍尔德，可艾恩霍尔德没了声息。该有人去看看它的矿井。'
        },
        tundra: {
          '1': '我见过最好的矿石出自冻原。运矿石的人再没回去过。'
        }
      },
      shopBack: {
        '1': '不合身就回来。我给你改到合身。'
      },
      bye: {
        '1': '奥克黑文的城门永远为你敞开。只为你。'
      }
    },
    oakWeapons: {
      hello: {
        '1': '买还是看？看不要钱。摸要一根手指。',
        '2': '塞娜。我卖锋刃。不问它们是干什么用的。'
      },
      saved: {
        '1': '围城破了。可惜。战争对生意好。和平对收债好。'
      },
      again: {
        '1': '回来找更锋利的？'
      },
      trade: {
        '1': '锋利，平衡，卖给付钱的人。今天是你。'
      },
      who: {
        '1': '三场战争，我把剑卖给了双方。我还在这儿。他们大多不在了。'
      },
      rumor: {
        krag: {
          '1': '克拉格的人拿着好钢。商会的钱。能夺就夺过来。'
        },
        which: {
          '1': '快刃要敏捷。枪和弓要技巧。付钱之前，先弄清你是哪种。'
        }
      },
      shopBack: {
        '1': '血能擦掉。锈擦不掉。记得上油。'
      },
      bye: {
        '1': '别欠着我的钱死了。'
      }
    },
    trainerShadow: {
      hello: {
        '1': '别回头。开玩笑的。回头吧。',
        '2': '他们叫我“低语”。我教人悄无声息地到来。'
      },
      fallen: {
        '1': '镇上安静多了。卫兵也少了。我挺喜欢的。'
      },
      friend: {
        '1': '商会把你算作朋友。朋友付得少。朋友也知道得太多。'
      },
      foe: {
        '1': '商会要你的命。我拿钱是来教的，不是来杀的。你走运。'
      },
      again: {
        '1': '你比上次吵。我们来改改。'
      },
      train: {
        '1': '那就安静点。看我的脚，别看我的手。'
      },
      class: {
        '1': '一把已经在你背后的刀。从暗处走出，一击，消失。',
        '2': '首先是敏捷。想让那一刀见效，还要技巧。',
        say: '影刃是什么？'
      },
      ready: {
        strong: {
          '1': '身手不错。把我会的都拿去。烟雾要带上技巧。'
        },
        able: {
          '1': '好。你的手够快，可以迈下一步。'
        },
        weak: {
          '1': '你走路像辆大车。多练敏捷。然后再谈。'
        }
      },
      syndicate: {
        '1': '发现法律可以买卖的人。我不评判。我开发票。',
        say: '灰烬商会是什么人？'
      },
      trainBack: {
        '1': '现在去没人看见的地方试试。'
      },
      bye: {
        '1': '你从没见过我。'
      }
    },
    trainerSovereign: {
      hello: {
        '1': '你可以上前。不必靠那么近。',
        '2': '卡斯特兰勋爵，奥克黑文古老血脉。我教授统御。'
      },
      saved: {
        '1': '我的城还在，我家的名声也在。你得到了一位领主的感激。它很值钱。'
      },
      friend: {
        '1': '骑士团的朋友。我会降低学费。别对任何人提起。'
      },
      foe: {
        '1': '骑士团贴出了你的名字。我照样教你。钱就是钱，可惜。'
      },
      again: {
        '1': '啊。我最有前途的学生。'
      },
      train: {
        '1': '很好。看看下命令该怎么下。'
      },
      class: {
        '1': '既然别人能替你战斗，何必独自上阵？召唤卫兵，指挥他们。',
        '2': '需要魅力。含糊嘟囔可带不了兵。',
        say: '大君主是什么？'
      },
      ready: {
        strong: {
          '1': '你有气度。把我其余的课都学了，还有，站直了。'
        },
        able: {
          '1': '你的声音传得远。可以学下一课了。'
        },
        weak: {
          '1': '没人会跟你去面包店。多练魅力。'
        }
      },
      family: {
        '1': '黑尔队长站的那段城墙是我们家建的。他忘了。我提醒他。经常。',
        say: '给我讲讲你的家族。'
      },
      trainBack: {
        '1': '现在去让人服从你吧。'
      },
      bye: {
        '1': '退下。'
      }
    },
    oakHealer: {
      hello: {
        '1': '下一位！哦。你能走路。这可真是难得。',
        '2': '芬恩修士。城墙上四十个伤员，我只有一个。'
      },
      saved: {
        '1': '三天没有新伤员了！我都不知道手该往哪放。'
      },
      again: {
        '1': '又是你，还能走路。我赞成。'
      },
      heal: {
        '1': '躺下。不，干净的那张。好。药瓶都满了。去吧。'
      },
      mana: {
        '1': '法力药剂！有铜钱味。不过管用。'
      },
      potions: {
        '1': '更长的腰带能挂更多药瓶。腰带我卖。药瓶我免费装。',
        say: '我能多带些药水吗？'
      },
      rumor: {
        archers: {
          '1': '克拉格的弓手专射腿。在外面一直动，他们就射不中。'
        },
        north: {
          '1': '烧伤、冻伤，还有个人发誓说被一座雕像咬了。北边可不友善。'
        }
      },
      healBack: {
        '1': '去吧。下次来聊天，别来缝针。'
      },
      bye: {
        '1': '走一走就好了！这是医嘱。'
      }
    },
    blackMarket: {
      hello: {
        '1': '不问名字。不过你就是打开城门的那位。这个我认得。',
        '2': '叫我销赃人。这里的东西全是从马车上掉下来的。'
      },
      foe: {
        '1': '商会今天不喜欢你。但你的金子，它还是喜欢的。'
      },
      again: {
        '1': '啊。我最好的客人。没人跟着你吧？好。'
      },
      trade: {
        '1': '不问名字，不问来路。商会抽成，货归你。'
      },
      who: {
        '1': '火灾以前我卖蜡烛。合法的。糟透了。'
      },
      armor: {
        '1': '护甲匠们没了，朋友。被烧走了。你应该清楚。',
        say: '有护甲卖吗？'
      },
      rumor: {
        citadel: {
          '1': '去年极北冒出一座要塞。没人建过它。它的墙在嗡嗡响。'
        },
        crystals: {
          '1': '有人在收购市面上所有的虚空水晶。不是我们。这让我不安。'
        }
      },
      shopBack: {
        '1': '你从没来过这儿。'
      },
      bye: {
        '1': '当心瓦砾。'
      }
    },
    trainerBlood: {
      hello: {
        '1': '有客人。请当心那些罐子。',
        '2': '桑格雷尔医生。奥克黑文的新主人不问我教什么。真令人耳目一新。'
      },
      found: {
        '1': '你找到我了。很少有人会在这种地方找医生。',
        '2': '桑格雷尔医生。城镇会烧死我这类人，所以我在没有城镇的地方工作。'
      },
      friend: {
        '1': '商会为你作保。商会的朋友学费更低。我的标准可不降。'
      },
      foe: {
        '1': '商会会花钱买你的血。我更希望你把它花在我的课上。'
      },
      again: {
        '1': '你脸色苍白。很好。适合这门功课。'
      },
      train: {
        '1': '卷起袖子。会疼的。这正是重点。'
      },
      class: {
        '1': '你用自己的健康换取力量，然后再从敌人身上喝回来。',
        '2': '耐力是你的钱包。智力决定你花得多巧妙。',
        say: '鲜血炼金师是什么？'
      },
      ready: {
        strong: {
          '1': '出色的体质。你几乎可以全部学会。'
        },
        able: {
          '1': '你的血够强，可以学下一课。'
        },
        weak: {
          '1': '第一刀你就会晕倒。请多练耐力。'
        }
      },
      jars: {
        '1': '志愿者。大部分是。',
        say: '罐子里是什么？'
      },
      trainBack: {
        '1': '记得做笔记。为了科学。'
      },
      bye: {
        '1': '保重身体。不然你对我没用。'
      }
    },
    syndicateBoss: {
      hello: {
        '1': '所以。就是你打开了城门。坐吧。你配得上一把椅子。',
        '2': '他们叫我灰烬夫人。奥克黑文现在是我的。部分也是你的。'
      },
      throneOurs: {
        '1': '恐惧要塞的王座。归我们。你是我做过最好的投资。'
      },
      throneLost: {
        '1': '你把王座送人了。送给了别人。这事我们要谈。不是今天。'
      },
      foe: {
        '1': '你一直在跟我们作对。还是坐下吧。我喜欢先看看问题，再解决它。'
      },
      again: {
        '1': '我最爱的叛徒。商会能为你做点什么？'
      },
      cut: {
        '1': '三分之一的废墟，亲爱的。这是这一季的分成。',
        '2': '它会增长的。握着唯一的市场，废墟可是很赚钱的。',
        say: '你答应过给我奥克黑文的三分之一。'
      },
      syndicate: {
        '1': '大家都想要的东西。我们只是不假装不想要。',
        '2': '继续做我们的朋友，“低语”和医生都会少收你的钱。忠诚也有价目表。',
        say: '商会想要什么？'
      },
      order: {
        '1': '当然。你烧了它的一座城。多带点药水。',
        say: '铁之骑士团在追捕我。'
      },
      rumor: {
        core: {
          '1': '矮人在矿井里发现了东西。一颗核心。我要它。带来给我们，开个价。'
        },
        sold: {
          '1': '核心安全到手了。你该看看它对锁做了什么。'
        },
        north: {
          '1': '所有值得偷的东西都搬到北边了。我们也是。'
        }
      },
      bye: {
        '1': '别当外人。外人会被跟踪。'
      }
    },
    forgemaster: {
      hello: {
        '1': '你穿过了矿井。我闻得到你身上的灰尘。',
        '2': '多恩。艾恩霍尔德的锻造大师。我有个山一样大的麻烦。'
      },
      destroyed: {
        '1': '光灭了，魔像成了废铁。我的矿工昨晚唱歌了。一年来头一回。'
      },
      studied: {
        '1': '熔炉里是蓝色火焰，大厅里是长袍。活干得不错。长袍我会习惯的。'
      },
      sold: {
        '1': '你卖了它。魔像还在走，我的矿井还是坟墓。从我眼前消失。'
      },
      ending: {
        '1': '王座定了。好。现在王国又能回去争论铁了。'
      },
      again: {
        '1': '说吧。熔炉不等人。'
      },
      quest: {
        '1': '我们挖铁，却挖到了一颗心脏。一颗以太核心。它在下面的黑暗里跳动。',
        '2': '那魔像呢？',
        '3': '它们踩着它的节拍走。三方势力给我写信要它。都很客气。我一个都不信。',
        '4': '你会最先到达，在艾恩霍尔德矿井的最深处。然后由你来了结。',
        say: '矿井里发生了什么？'
      },
      core: {
        say: '关于核心……',
        destroy: {
          '1': '你为了救我的族人，毁掉了一件奇迹。骑士团派来了护甲匠道谢。我送了麦酒。'
        },
        study: {
          '1': '议会的工匠是疯子，但他们的枪打得直。公平的交易。'
        },
        sell: {
          '1': '金子。你为了金子这么做。希望它能让你暖和。'
        }
      },
      town: {
        '1': '矿井开工的时候，这里的钢是王国最好的。',
        '2': '石足教大地，皮姆教机械。两个都能把你耳朵说烂。',
        say: '给我讲讲艾恩霍尔德。'
      },
      rumor: {
        tundra: {
          '1': '峭壁以东，大地一片白。霜噬冻原。有巨人，还有倒下又爬起来的死者。'
        },
        citadel: {
          '1': '我的斥候在北边看到一座要塞，去年还没有。我不喜欢新冒出来的山。'
        },
        fortress: {
          '1': '恐惧要塞是一切的终点。每条向北的路都通向它的大门。'
        }
      },
      bye: {
        '1': '一锤定音。'
      }
    },
    ironWeapons: {
      hello: {
        '1': '别碰展品。两头都是锋利的。',
        '2': '希尔达·锤手。件件矮人打造。'
      },
      dragon: {
        '1': '你杀了那条龙？用我的货？没有？那骗我一下。就说是我的。'
      },
      again: {
        '1': '回来买真家伙？'
      },
      trade: {
        '1': '矮人打造。要是断了，那是你的问题。'
      },
      who: {
        '1': '我母亲为国王打铁。我给走进来的任何人打铁。时代变了。'
      },
      rumor: {
        golems: {
          '1': '矿井里的魔像是用我们自己的铁做的。老实说，真丢人。'
        },
        arm: {
          '1': '刀刃只出一半力。另一半靠你的力量。别怪刀刃。'
        }
      },
      shopBack: {
        '1': '拿回来要是钝了，我一看就知道你用过。'
      },
      bye: {
        '1': '狠狠地打。'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': '小心！那个上了膛。那个也是。其实大部分都是。',
        '2': '工匠沃斯。议会派我来看核心能教我们什么。结果是，一切。'
      },
      again: {
        '1': '哦太好了，试用者。我是说，顾客。'
      },
      trade: {
        '1': '议会对核心的研究改变了一切。拿着这个。别对着我。'
      },
      core: {
        '1': '那块铁会思考，一点点。我尽量不去细想。',
        say: '核心教了你什么？'
      },
      rumor: {
        heat: {
          '1': '枪靠技巧运转，而且会发烫。在你烫坏手之前，问问齿轮匠皮姆关于热量的事。'
        }
      },
      shopBack: {
        '1': '有爆炸请汇报！为了做记录。'
      },
      bye: {
        '1': '当心后坐力！'
      }
    },
    ironArmor: {
      hello: {
        '1': '加伦。护甲。戒指在托盘里。'
      },
      again: {
        '1': '嗯。'
      },
      trade: {
        '1': '能挡巨人大棒的板甲。你们其他人，戒指。'
      },
      quiet: {
        '1': '不。',
        say: '你话不多啊。'
      },
      rumor: {
        giants: {
          '1': '冻原有巨人。大棒像树干。买重板甲。'
        },
        demons: {
          '1': '北边有恶魔。火和爪子。买重板甲。'
        }
      },
      shopBack: {
        '1': '好。'
      },
      bye: {
        '1': '嗯。'
      }
    },
    ironOrderArmor: {
      hello: {
        '1': '姓名，来意。不用了。我知道你的名字。你毁掉了核心。',
        '2': '铁之骑士团军需官。它的军械库向你敞开。'
      },
      throneOurs: {
        '1': '骑士团因你之手掌握了恐惧要塞。稍息。这是命令。'
      },
      foe: {
        '1': '骑士团把你列在名单上。我的命令是照样卖给你。我不喜欢这命令。'
      },
      again: {
        '1': '领用？'
      },
      trade: {
        '1': '骑士团记得是谁毁掉了核心。需要什么，自己挑。'
      },
      order: {
        '1': '什么都不要。这很罕见。好好享受。',
        say: '骑士团想让我做什么？'
      },
      rumor: {
        throne: {
          '1': '骑士团会想要恐惧要塞的王座。它会记得谁曾与它并肩。'
        }
      },
      shopBack: {
        '1': '在这里签字。开玩笑的。骑士团不开玩笑。解散。'
      },
      bye: {
        '1': '解散。'
      }
    },
    trainerGeo: {
      hello: {
        '1': '慢点。山哪儿也不会去。',
        '2': '他们叫我石足老爹。我倾听大地。有时它会回答。'
      },
      core: {
        '1': '山的心跳变了。是你干的。它注意到了。'
      },
      dragon: {
        '1': '昨天有条龙飞过山顶，没有烧我们。听说是你的功劳。'
      },
      again: {
        '1': '又是你。石头说你会来。'
      },
      train: {
        '1': '站稳脚。感觉到了吗？没有？那就从这儿开始。'
      },
      class: {
        '1': '我们筑墙，召唤尖刺，需要时把地面劈开。',
        '2': '用力量搬动石头，用智力好好地求它。',
        say: '地术师是什么？'
      },
      ready: {
        strong: {
          '1': '石头现在认得你了。把剩下的也学了。'
        },
        able: {
          '1': '你够重了，可以学下一课。这是夸奖。'
        },
        weak: {
          '1': '石头还听不见你。多练力量。'
        }
      },
      factions: {
        '1': '哪个都不。骑士团、商会、议会。山比它们都长久。',
        say: '你效力于哪个阵营？'
      },
      trainBack: {
        '1': '先轻轻地。然后不轻轻地。'
      },
      bye: {
        '1': '轻轻地走。'
      }
    },
    trainerAether: {
      hello: {
        '1': '别碰那个！那个也别碰。其实，站在地毯上。地毯是安全的。',
        '2': '齿轮匠皮姆！枪，炮塔，热量表。主要是热量表。'
      },
      core: {
        '1': '你把核心给了我们！我九天没睡了。看我的手。别看我的手。'
      },
      oracle: {
        '1': '议会为先知的事气炸了。我只是造东西。请别告诉他们是我教你的。'
      },
      friend: {
        '1': '议会的朋友！给你便宜点的课。表格我亲手填的。'
      },
      foe: {
        '1': '议会说我不能教你。议会还说不能在室内试火箭。'
      },
      again: {
        '1': '哦太好了，你的手指还齐全。'
      },
      train: {
        '1': '好！安全第一。然后是响的那部分。'
      },
      class: {
        '1': '枪、炮塔和热量表。射击，建造，在被锁死之前排热。',
        '2': '全靠技巧。大机器再加一点智力。',
        say: '以太技师是什么？'
      },
      ready: {
        strong: {
          '1': '你蒙着眼都能拆炮塔！大机器也拿去吧。'
        },
        able: {
          '1': '手很稳！可以学下一个小装置了。'
        },
        weak: {
          '1': '你的手在抖。我也抖，不过原因不同。多练技巧。'
        }
      },
      heat: {
        '1': '所有东西会锁住几秒。早排热。常排热。我身上有疤。',
        say: '过热了会怎样？'
      },
      trainBack: {
        '1': '记住：排热！排。热。'
      },
      bye: {
        '1': '别炸了！'
      }
    },
    ironHealer: {
      hello: {
        '1': '靴子脱掉。我可不让我的地板沾你的灰。',
        '2': '布琳雅嬷嬷。这座山里每一根断骨，我都接过两回。'
      },
      ending: {
        '1': '你去了恐惧要塞，还走着回来了。坐下。我想好好看看你。'
      },
      again: {
        '1': '还活着。听说是我的功劳。'
      },
      heal: {
        '1': '坐下。把这个喝了。别做那种表情。你的药瓶都装满了。'
      },
      mana: {
        '1': '给。味道难闻。魔力用光再喝，别提前。'
      },
      potions: {
        '1': '从我这买条更长的腰带。人身上带五个药瓶，还能跑，就是极限了。',
        say: '我能多带些药水吗？'
      },
      rumor: {
        tundra: {
          '1': '冻原会拿走手指。在外面一直动，别在雪里睡觉。'
        },
        temple: {
          '1': '冻原那边有座沉没的神殿。娜迦不留俘虏。'
        },
        rift: {
          '1': '那道虚空裂隙里不管是什么，都缝不上。快点了结它。'
        }
      },
      healBack: {
        '1': '去吧。还有，吃点东西。'
      },
      bye: {
        '1': '完完整整地回来。'
      }
    },
    exiledSovereign: {
      hello: {
        '1': '你。是你打开了我的城门。',
        '2': '我如今在矮人的地窖里教课，因为我得吃饭。别误以为这是原谅。'
      },
      ending: {
        '1': '王座有了归属，奥克黑文却还是灰烬。再告诉我一遍，这有什么值得。'
      },
      again: {
        '1': '叛徒回来了。我的学费没降。'
      },
      train: {
        '1': '我教你统御。我教不了你配不配。'
      },
      class: {
        '1': '被人追随的人。卫兵闻声而来，听你的话作战。',
        '2': '靠魅力。你有一些。这才是悲剧。',
        say: '大君主是什么？'
      },
      ready: {
        strong: {
          '1': '你有气度学全部。王国也因此更穷了。'
        },
        able: {
          '1': '你可以学下一课了。我并不乐意。'
        },
        weak: {
          '1': '连叛徒的卫兵也不会跟随那种声音。多练魅力。'
        }
      },
      oakhaven: {
        '1': '三百年。我的家族建了那些城墙。',
        '2': '别解释。没有什么代价能解释它。',
        say: '关于奥克黑文……'
      },
      trainBack: {
        '1': '去吧。去指挥别人。'
      },
      bye: {
        '1': '别打扰我。'
      }
    },
    trainerChrono: {
      fled: {
        '1': '你杀了她。这事发生前我看了一千遍，可它还是让我心痛。',
        '2': '我是时辰守护者。我会教你。她告诉过我，我会的。'
      },
      hello: {
        '1': '你来晚了。或者早了。这话我好像已经说过了。',
        '2': '我是时辰守护者。我传授织时之术。我们刚刚才开始。'
      },
      freed: {
        '1': '她自由了。我第一次不知道你接下来会说什么。真美妙。'
      },
      friend: {
        '1': '议会会称你为朋友。已经称了？那折扣就是现在。'
      },
      foe: {
        '1': '在我见过的未来里，议会会原谅你。在那之前，我悄悄教你。'
      },
      again: {
        '1': '欢迎回来。欢迎。回来。'
      },
      train: {
        '1': '看好。我会演示我曾演示过的。'
      },
      class: {
        '1': '我们把敌人定在时间里，催朋友快走，把错误收回。',
        '2': '用智力看见丝线，用技巧拉动它。',
        say: '织时者是什么？'
      },
      ready: {
        strong: {
          '1': '你把丝线握得很好。想学的时候，其余的都是你的。'
        },
        able: {
          '1': '你准备好了。明天你也准备好了。'
        },
        weak: {
          '1': '丝线从你指间滑走了。多练智力。多练技巧。'
        }
      },
      oracle: {
        say: '给我讲讲先知。',
        freed: {
          '1': '她看见了每一个结局，没有一个是她自己的。现在有了。'
        },
        slain: {
          '1': '她没有反抗。她也早就看见了。请别再问我。'
        },
        waits: {
          '1': '她看得见每个结局。那是可怕的天赋。到最后，对她好一点。'
        }
      },
      trainBack: {
        '1': '这一切都会是值得的。'
      },
      bye: {
        '1': '直到从前。'
      }
    },
    quest: {
      goblinKing: {
        ask: {
          '1': '等等！等等。大王投降！',
          '2': '哥布林抢东西，是因为哥布林肚子饿。是真的！',
          '3': '大个子和大王，做个交易好不好？'
        },
        slay: {
          '1': '哥布林王倒下了，洞窟里的哥布林四散而逃。',
          '2': '桑福德睡得更安稳，铁之骑士团也注意到了你。',
          say: '没得谈。你的统治到此为止。'
        },
        pact: {
          '1': '做买卖？大王发誓！大王喜欢做买卖！',
          '2': '哥布林商人在桑福德的广场上摆起摊，卖的货连那里的铁匠都做不出来。',
          say: '停止劫掠，改和桑福德做买卖。发誓。'
        },
        ransom: {
          '1': '全部？大王讨厌大个子。拿走。拿走快走。',
          '2': '你带着沉甸甸的哥布林金币走了出来。劫掠还会再来。商会对此很满意。',
          say: '交出你的财宝，王冠留给你。'
        }
      },
      siege: {
        ask: {
          '1': '够了。你很能打。',
          '2': '商会给的钱，可比那座城给的多得多。',
          '3': '今晚替我们打开城门，奥克黑文的三分之一就归你。'
        },
        defend: {
          '1': '那商会会在每条路上追杀你。记住是我给过你机会。',
          '2': '城门守住了。奥克黑文在城墙后日渐富裕，护甲大师们记住了你的名字。',
          say: '城门不会开。带着你的军队滚吧。'
        },
        betray: {
          '1': '明智。我会让灰烬夫人给你备一把椅子。',
          '2': '奥克黑文陷入火海。废墟里开起了黑市，还来了一位传授禁术的炼金师。',
          '3': '护甲匠都走了，铁之骑士团称你为叛徒。',
          say: '城的三分之一。今晚，城门会开。'
        }
      },
      core: {
        ask: {
          '1': '巨像成了废铁。我从没想过能看到这一幕。',
          '2': '它就躺在那里。核心。还在嗡嗡作响。摸上去是温热的。',
          '3': '是你最先到达。要怎么处置它？'
        },
        destroy: {
          '1': '光芒熄灭，魔像纷纷原地倒下。',
          '2': '铁之骑士团派出自己的护甲匠来到艾恩霍尔德，以表谢意。',
          say: '退后。我要把它击碎。'
        },
        study: {
          '1': '你对核心的了解，足够把它交出去而不惊醒它。',
          '2': '不出一季，艾恩霍尔德的熔炉就造出了前所未见的以太器械。',
          say: '该让议会研究它。我能安全地把它带出去。'
        },
        sell: {
          '1': '金子。为了那个害死我矿工的东西。拿去，走吧。',
          '2': '一大笔钱易了手。核心继续亮着，矿井再也不会安宁。',
          say: '商会开的价最高。'
        }
      },
      oracle: {
        ask: {
          '1': '这一刻我已看过一万次。',
          '2': '一半的结局里你放了我，另一半里你夺走我守护的东西。',
          '3': '选吧。让我终于不知道接下来会发生什么。'
        },
        free: {
          '1': '哦。我没看到这个。完全没看到。',
          '2': '先知穿过水面升起，消失了。她的时辰守护者留下来授课。',
          say: '别动。我来打碎你的锁链。'
        },
        slay: {
          '1': '是的。这是另一半。',
          '2': '她没有反抗。守时者沙漏归你了。',
          '3': '她最后的弟子逃离了神殿，议会不会原谅你。',
          say: '我是为沙漏来的。'
        }
      },
      dragon: {
        ask: {
          '1': '够了。你有利齿，小家伙。',
          '2': '要塞里的恶魔用锁链锁住了我的同族。我想看他被烧成灰。',
          '3': '杀了我，或者让我帮你做到。'
        },
        slay: {
          '1': '巨龙倒下，群山震动。龙的宝藏归你所有。',
          '2': '铁之骑士团传唱屠龙者的事迹。',
          say: '不和龙做交易。'
        },
        pact: {
          '1': '能这样开口还活着的人不多。好吧，小家伙。我们一起狩猎。',
          '2': '当你进军恐惧要塞时，会有一头龙在你头顶的天空中。',
          say: '那就与我并肩飞去对抗大恶魔。'
        }
      },
      throne: {
        ask: {
          '1': '原来如此。终结了。我没想到会是你。',
          '2': '我的王座不会一直空着，小英雄。它掌控要塞、裂隙，以及两边的军队。',
          '3': '三位使者已在我门前等候。选一个继承我的锁链。'
        },
        order: {
          '1': '骑士团驻守要塞，能封的都封上。',
          '2': '王国会很安全，也会被人指挥着过日子。',
          say: '铁之骑士团来守着它。'
        },
        syndicate: {
          '1': '商会在天亮前就搬了进来。',
          '2': '现在什么都能买卖，包括和平。',
          say: '灰烬商会应得此位。'
        },
        circle: {
          '1': '议会把要塞变成了一所建在裂隙上的学院。',
          '2': '他们管这叫研究。其他人都说出事只是时间问题。',
          say: '让以太议会拥有它。'
        },
        shatter: {
          '1': '你亲手把王座砸碎。再也没有人能在这里发号施令。',
          '2': '使者们一言不发地离开了。',
          say: '谁也不继承。我要把它砸碎。'
        },
        claim: {
          '1': '王座很冷，但很合身。',
          '2': '三个阵营发现他们有了共同的敌人。',
          say: '我自己来坐。'
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
    syndicateBlade: '商会刀客'
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
    time: '用时',
    unlocked: '地图新增：{places}',
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
