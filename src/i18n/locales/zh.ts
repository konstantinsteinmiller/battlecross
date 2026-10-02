// Simplified Chinese locale — mirrors the key shape of en.ts exactly.
export default {
  'gameName': 'Battlecross',
  'cancel': '取消',
  'close': '关闭',
  'ok': '确定',
  'continue': '继续',
  'onlyAvailableOn': '本游戏仅在以下平台提供：',

  'ui': {
    'next': '下一个',
    'replay': '重玩',
    'back': '返回',
    'play': '开始',
    'pause': '暂停',
    'menu': '菜单',
    'home': '主页',
    'info': '信息',
    'help': '操作说明',
    'ok': '知道了',
    'continue': '继续'
  },

  'hud': {
    'level': '{n}级',
    'health': '生命 {n}/{max}',
    'mana': '法力 {n}/{max}',
    'heat': '热量',
    'xp': '经验',
    'gold': '{n} 金币',
    'potion': '生命药水（剩余 {n} 瓶）',
    'groups': '已击败 {n}/{total} 群敌人',
    'wave': '第 {n} / {total} 波'
  },
  'menu': {
    'map': '世界地图',
    'character': '英雄',
    'skills': '技能',
    'inventory': '背包'
  },

  'combat': {
    'dodge': '闪避',
    'block': '格挡',
    'immune': '免疫'
  },
  'level': {
    'open': '打开',
    'guarded': '有守卫',
    'locked': '已锁住',
    'potion': '药水 +1',
    'manaPotion': '法力药水 +1'
  },
  'status': {
    'stun': '眩晕',
    'knockup': '击飞',
    'knockdown': '击倒',
    'stasis': '静滞',
    'petrify': '石化',
    'frozen': '冰冻',
    'fear': '恐惧',
    'slow': '减速',
    'confuse': '混乱',
    'taunt': '被嘲讽',
    'armorShred': '破甲',
    'weaken': '虚弱',
    'vulnerable': '易伤',
    'burn': '灼烧',
    'poison': '中毒',
    'bleed': '流血',
    'delayed': '延迟伤害',
    'haste': '急速',
    'attackSpeed': '攻速提升',
    'damageUp': '强化',
    'defenseUp': '坚固',
    'regen': '再生',
    'lifestealUp': '生命偷取',
    'invulnerable': '无敌',
    'unkillable': '不死',
    'stealth': '隐身',
    'reflect': '反射',
    'envenom': '淬毒之刃',
    'exosuit': '外骨骼战甲',
    'focus': '专注',
    'accelerate': '加速',
    'overheat': '过热',
    'enrage': '狂怒',
    'ambush': '伏击'
  },
  'toast': {
    'item': '获得：{item}',
    'levelUp': '升到 {level} 级！属性点 +3',
    'boss': '{boss}出现了',
    'wave': '第 {n} 波'
  },

  'coach': {
    'move': {
      'touch': '点击地面走过去，或使用摇杆。',
      'mouse': '点击地面走过去，或用移动键控制方向。'
    },
    'target': {
      'touch': '点击敌人，或从英雄拖到敌人身上，即可攻击。',
      'mouse': '点击敌人即可攻击。'
    },
    'skill': {
      'touch': '点击技能，对目标使用。',
      'mouse': '按下技能键，对目标使用。'
    },
    'aim': {
      'touch': '把技能拖到场地上瞄准，松手即可施放。',
      'mouse': '把技能拖到场地上瞄准，松开即可施放。'
    },
    'potion': {
      'touch': '点击药水回复生命。',
      'mouse': '按下药水键回复生命。'
    }
  },

  'node': {
    'sunford': { 'name': '桑福德', 'desc': '平原边上的农业小镇。这里有家、一位铁匠和两位导师。' },
    'plains': { 'name': '桑福德平原', 'desc': '哥布林、野狼和强盗在大路上打劫商队。' },
    'hollows': { 'name': '哥布林洞窟', 'desc': '山丘下的洞穴。哥布林王在最深处坐镇。' },
    'arena': { 'name': '斗技场', 'desc': '八波敌人，一波比一波难。站到最后的人赢得金币和荣耀。' },
    'woods': { 'name': '低语森林', 'desc': '会走路的古树，还有在树间结网的蜘蛛。' },
    'outskirts': { 'name': '奥克黑文郊外', 'desc': '奥克黑文城外的农场在燃烧。军阀的大军已到城门前。' },
    'oakhaven': { 'name': '奥克黑文', 'desc': '有城墙的贸易小城。它会变成什么样，由你决定。' },
    'crags': { 'name': '灰烬峭壁', 'desc': '黑色的岩石和熊熊烈火。邪教徒在给火焰添柴。' },
    'mines': { 'name': '艾恩霍尔德矿井', 'desc': '矮人挖得太深，唤醒了某个会发光的东西。' },
    'ironhold': { 'name': '艾恩霍尔德', 'desc': '山中的锻造之城。王国最好的钢就在这里打造。' },
    'tundra': { 'name': '霜噬冻原', 'desc': '白茫茫的荒原，巨人在此行走，死者不肯安息。' },
    'temple': { 'name': '沉没神殿', 'desc': '被水淹没的娜迦殿堂，还有一位看见所有结局的先知。' },
    'citadel': { 'name': '虚空城塞', 'desc': '去年这里还没有这座要塞。它的墙在嗡嗡作响。' },
    'peak': { 'name': '巨龙之巅', 'desc': '双足飞龙在山顶盘旋。上面还睡着一个大得多的家伙。' },
    'fortress': { 'name': '恐惧要塞', 'desc': '大恶魔的老巢，也是每个阵营都想要的王座所在。' },
    'rift': { 'name': '虚空裂隙', 'desc': '恶魔就是从这道伤口来的。虚空领主在另一头等着。' }
  },
  'map': {
    'title': '王国',
    'town': '城镇',
    'levels': '{min}–{max}级',
    'arenaBest': '最佳：第 {n} 波',
    'travel': '前往',
    'again': '再来一次',
    'enter': '进入',
    'fight': '战斗',
    'back': '回城',
    'locked': '通关相邻区域即可打开道路。',
    'lockedArena': '解决哥布林王之后，大门就会打开。',
    'lockedRift': '恐惧要塞的王座有了归属后才会开启。',
    'danger': {
      '1': '略高于你的等级。',
      '2': '以你的等级来说很危险。',
      '3': '远高于你的等级。'
    },
    'questOpen': '{quest}：有个抉择在这里等你。',
    'questDone': '{quest}：{choice}',
    'trainer': '隐藏导师：{cls}'
  },
  'travel': {
    'to': '正在前往',
    'loading': '加载中'
  },

  'attr': {
    'str': { 'name': '力量', 'short': '力量', 'desc': '近战威力、格挡几率、重甲。' },
    'dex': { 'name': '敏捷', 'short': '敏捷', 'desc': '暴击、攻击速度和移动速度。' },
    'int': { 'name': '智力', 'short': '智力', 'desc': '法术强度、法力、元素抗性。' },
    'end': { 'name': '耐力', 'short': '耐力', 'desc': '生命、回复、护甲、眩晕抗性。' },
    'skl': { 'name': '技巧', 'short': '技巧', 'desc': '暴击伤害、冷却、远程武器。' },
    'cha': { 'name': '魅力', 'short': '魅力', 'desc': '随从、商店价格、奖励、对话选项。' }
  },
  'stat': {
    'health': '生命',
    'mana': '法力',
    'armor': '护甲',
    'resist': '抗性',
    'crit': '暴击率',
    'critDamage': '暴击伤害',
    'attackSpeed': '攻击速度',
    'moveSpeed': '移动速度',
    'cdr': '冷却缩减',
    'block': '格挡',
    'dodge': '闪避',
    'hpRegen': '生命 / 秒'
  },
  'sheet': {
    'points': '可用点数：{n}',
    'raise': '提升{attr}',
    'maxLevel': '已达最高等级'
  },

  'skills': {
    'active': '主动技能',
    'passive': '被动技能',
    'known': '已学会',
    'none': '还什么都没学。去城镇里找位导师吧。',
    'emptySlot': '空栏位 {n}',
    'equip': '装上',
    'remove': '卸下',
    'unmet': '你已不再满足它的要求。'
  },
  'class': {
    'aegis': { 'name': '神盾骑士', 'desc': '盾牌与神圣之钢。把攻击都扛下来，让别人不用挨打。' },
    'shadow': { 'name': '影刃', 'desc': '从黑暗中现身，背后一击，随即消失。' },
    'pyro': { 'name': '炎术师', 'desc': '火焰能回答一切问题。先点燃，再引爆。' },
    'sovereign': { 'name': '大君主', 'desc': '何必独自战斗？召唤卫兵，指挥他们。' },
    'chrono': { 'name': '织时者', 'desc': '把敌人定在时间里，给队友加速，还能撤销失误。' },
    'blood': { 'name': '鲜血炼金师', 'desc': '用生命换取力量，再从敌人身上喝回来。' },
    'aether': { 'name': '以太技师', 'desc': '枪械、炮塔和热量槽。在技能被锁之前把热量排掉。' },
    'geo': { 'name': '地术师', 'desc': '升起石墙和尖刺，连大地本身也能打碎。' }
  },
  'skill': {
    'kind': { 'active': '主动', 'passive': '被动' },
    'cooldown': '冷却 {n}秒',
    'mana': '{n} 法力',
    'hpCost': '{n}% 生命',
    'heat': '+{n} 热量',
    'aimed': '拖动瞄准',

    'shieldSlam': { 'name': '盾牌猛击', 'desc': '猛击目标，造成{dmg}%力量伤害，并使其眩晕{stun}秒。' },
    'aegisAura': { 'name': '神盾光环', 'desc': '护甲+{armor}%，受到的物理伤害降低{reduce}%。' },
    'radiantStrike': { 'name': '光辉打击', 'desc': '神圣一击，造成{dmg}%力量伤害，并按所造成伤害的{heal}%治疗你。' },
    'fortitude': { 'name': '坚毅', 'desc': '单次受到超过生命{hit}%的伤害时，获得相当于生命{shield}%的护盾，持续{dur}秒。每{icd}秒一次。' },
    'tauntingCry': { 'name': '嘲讽怒吼', 'desc': '{radius} m内的敌人在{dur}秒内攻击你。期间你获得{def}%防御。' },
    'holyBastion': { 'name': '神圣壁垒', 'desc': '无敌{dur}秒。攻击者会被反弹自身伤害的{reflect}%。' },

    'shadowstep': { 'name': '暗影步', 'desc': '出现在目标身后并背刺，造成{dmg}%敏捷伤害。' },
    'lethality': { 'name': '致命', 'desc': '暴击率+{crit}%，暴击伤害+{critDmg}%。' },
    'venomousBlade': { 'name': '剧毒之刃', 'desc': '{dur}秒内你的攻击会使敌人中毒，在{over}秒内造成{poison}%敏捷伤害，可叠加{stacks}次。' },
    'evasion': { 'name': '闪躲', 'desc': '闪避+{dodge}%。闪避成功后获得{haste}%急速，持续{dur}秒。' },
    'smokeBomb': { 'name': '烟雾弹', 'desc': '隐身{dur}秒。隐身中的下一次攻击伤害+{bonus}%。' },
    'danceOfBlades': { 'name': '刀锋之舞', 'desc': '在{radius} m内的敌人之间冲刺，攻击{hits}次，总共造成{dmg}%敏捷伤害。起舞时你不会被击中。' },

    'fireball': { 'name': '火球术', 'desc': '火球炸开，造成{dmg}%智力伤害，并在{burnDur}秒内再灼烧{burn}%。' },
    'cauterize': { 'name': '烧灼', 'desc': '被灼烧的敌人对你造成的伤害降低{reduce}%。' },
    'flamePillar': { 'name': '烈焰之柱', 'desc': '在瞄准处喷出火柱：{dur}秒内造成{dmg}%智力伤害。被卷入的敌人会被击飞。' },
    'pyromaniac': { 'name': '纵火狂', 'desc': '法术暴击命中时，火系技能的冷却减少{cut}秒。' },
    'combustion': { 'name': '爆燃', 'desc': '引爆{radius} m内的所有灼烧：每个灼烧立刻以爆炸造成其剩余伤害的{pct}%。' },
    'cataclysm': { 'name': '天灾', 'desc': '在{dur}秒内召唤{meteors}颗陨石。每颗造成{dmg}%智力伤害。' },

    'royalGuard': { 'name': '皇家卫兵', 'desc': '召唤一名卫兵在你身边战斗，每击造成{dmg}%魅力伤害。最多同时{max}名。' },
    'inspiringPresence': { 'name': '鼓舞之姿', 'desc': '你的随从攻击加快{speed}%，生命提高{hp}%。' },
    'commandFocus': { 'name': '集火号令', 'desc': '所有随从冲向目标：移动速度+{move}%，攻击速度+{atk}%，持续{dur}秒。' },
    'sovereignsTribute': { 'name': '君主的贡品', 'desc': '你受到的伤害有{share}%转给随从承担。' },
    'bannerOfVictory': { 'name': '胜利战旗', 'desc': '插下战旗，持续{dur}秒。附近的友军伤害+{dmg}%，每秒回复{regen}%生命。' },
    'armyOfTheRealm': { 'name': '王国大军', 'desc': '召唤{archers}名弓箭手、{guards}名卫兵和一名战斗法师，持续{dur}秒。' },

    'temporalStasis': { 'name': '时间静滞', 'desc': '把目标冻结在时间里{dur}秒。它无法行动，也不会受伤。' },
    'hasteField': { 'name': '急速领域', 'desc': '{dur}秒内，你和附近友军移动加快{move}%，攻击加快{speed}%。' },
    'timeDistort': { 'name': '时间扭曲', 'desc': '你受到的伤害有{share}%被延后，改为在{over}秒内分摊。' },
    'paradoxShift': { 'name': '悖论换位', 'desc': '与目标交换位置。它受到{dmg}%智力伤害，周围的敌人混乱{confuse}秒。' },
    'entropy': { 'name': '熵', 'desc': '每次施法使你的冷却缩短{cdr}%，可叠加{stacks}次。' },
    'chronoRewind': { 'name': '时光倒流', 'desc': '回到{back}秒前所在的位置，并恢复当时的生命和法力。' },

    'sanguineFlask': { 'name': '鲜血药瓶', 'desc': '扔出一瓶自己的血：范围内造成{dmg}%耐力伤害，并破甲{shred}%，持续{shredDur}秒。' },
    'bloodTransmutation': { 'name': '血液转化', 'desc': '你受到的物理伤害有{share}%转化为法力返还。' },
    'essenceHarvest': { 'name': '精华收割', 'desc': '吸取{radius} m内的所有敌人，造成{dmg}%智力伤害。你回复其中的{heal}%。' },
    'hemophilia': { 'name': '嗜血症', 'desc': '生命汲取增强{drain}%。命中流血的敌人会回复你{heal}%的生命。' },
    'mutagenicRage': { 'name': '变异狂怒', 'desc': '{dur}秒内：攻击速度+{speed}%，生命偷取+{steal}%，移动速度+{move}%。' },
    'philosophersCrucible': { 'name': '贤者坩埚', 'desc': '制造一池沸腾的血，持续{dur}秒：对其中的敌人造成{dmg}%智力伤害，你站在里面时会回复生命。' },

    'aetherPistol': { 'name': '以太手枪', 'desc': '快速射击，造成{dmg}%技巧伤害。积累{heat}点热量。' },
    'deployTurret': { 'name': '部署炮塔', 'desc': '放置一座炮塔，每发造成{dmg}%技巧伤害，持续{dur}秒。最多同时{max}座。' },
    'ventHeat': { 'name': '排放热量', 'desc': '把全部热量呈扇形喷出：最多造成{dmg}%技巧伤害，热量越多伤害越高。' },
    'thermalOverload': { 'name': '热能过载', 'desc': '过热时你的射击暴击伤害+{crit}%。过热仍会锁住技能{lock}秒。' },
    'orbitalBeam': { 'name': '轨道光束', 'desc': '从天而降的光束灼烧瞄准处：{dur}秒内造成{dmg}%技巧伤害。' },
    'exoSuit': { 'name': '外骨骼战甲', 'desc': '{dur}秒内：护甲+{armor}%，你的攻击变成火箭，在范围内造成{rocket}%技巧伤害。' },

    'stoneSpike': { 'name': '岩石尖刺', 'desc': '尖刺从目标脚下刺出：造成{dmg}%力量伤害，并减速{slow}%，持续{dur}秒。' },
    'earthBarrier': { 'name': '大地屏障', 'desc': '升起一道岩墙，持续{dur}秒。谁也走不过去，也射不穿它。' },
    'seismicShock': { 'name': '地震冲击', 'desc': '猛击地面：对{radius} m内造成{dmg}%力量伤害，并击倒敌人{down}秒。' },
    'earthenSkin': { 'name': '大地之肤', 'desc': '获得相当于力量{armor}%的护甲。你受到的眩晕缩短{cut}%。' },
    'petrify': { 'name': '石化术', 'desc': '把目标变成石头{dur}秒。它破石而出时受到的伤害提高{vuln}%。' },
    'tectonicRupture': { 'name': '地壳撕裂', 'desc': '撕开战场：对附近的一切造成{dmg}%力量伤害，碎石会减速{dur}秒。' }
  },

  'slot': {
    'main': '主手',
    'off': '副手',
    'body': '护甲',
    'trinket': '饰品'
  },
  'tier': {
    '1': '1阶',
    '2': '2阶',
    '3': '3阶',
    '4': '4阶',
    '5': '5阶',
    '6': '传说'
  },
  'weapon': {
    'melee': '近战 · 随{attr}成长',
    'ranged': '远程 · 随{attr}成长',
    'magic': '魔法 · 随{attr}成长'
  },
  'source': {
    'mob': '由{zone}的怪物掉落。',
    'chest': '可在{zone}的宝箱里找到。',
    'boss': '由{zone}的首领掉落。',
    'secret': '藏在{zone}的一个秘密宝箱里。'
  },
  'mod': {
    'str': '+{n} 力量',
    'dex': '+{n} 敏捷',
    'int': '+{n} 智力',
    'end': '+{n} 耐力',
    'skl': '+{n} 技巧',
    'cha': '+{n} 魅力',
    'allAttrs': '所有属性 +{n}',
    'strOrDex': '力量和敏捷中较高的一项 +{n}',
    'armor': '{n} 护甲',
    'armorPct': '+{n}% 护甲',
    'armorFromStr': '来自力量的护甲：+{n}%',
    'block': '+{n}% 格挡几率',
    'dodge': '+{n}% 闪避',
    'damageReduction': '+{n}% 伤害减免',
    'physReduction': '受到的物理伤害降低{n}%',
    'maxHp': '+{n} 最大生命',
    'maxHpPct': '+{n}% 最大生命',
    'maxMana': '+{n} 最大法力',
    'hpRegen': '每秒 +{n} 生命',
    'stunDurationCut': '你受到的眩晕缩短{n}%',
    'damagePct': '+{n}% 造成的伤害',
    'critChance': '+{n}% 暴击率',
    'critDamage': '+{n}% 暴击伤害',
    'spellCrit': '+{n}% 法术暴击率',
    'attackSpeed': '+{n}% 攻击速度',
    'moveSpeed': '+{n}% 移动速度',
    'cdr': '冷却缩短{n}%',
    'manaDiscount': '法术的法力消耗降低{n}%',
    'lifesteal': '所有伤害 +{n}% 生命偷取',
    'physLifesteal': '物理攻击 +{n}% 生命偷取',
    'lifeDrainPct': '生命汲取增强{n}%',
    'bossDamage': '对首领的伤害 +{n}%',
    'backstab': '+{n}% 背刺伤害',
    'minionDamage': '随从的伤害 +{n}%',
    'minionAttackSpeed': '随从攻击加快{n}%',
    'minionHp': '随从的生命 +{n}%',
    'burnOnHit': '攻击附带{n}点伤害的灼烧',
    'freezeOnHit': '攻击有{n}%几率冰冻敌人',
    'pierce': '射击可多穿透{n}个敌人',
    'critCooldown': '暴击使所有冷却减少{n}秒',
    'extraBlastEvery': '每{n}次射击额外发出一道能量冲击',
    'reflectOnBlock': '格挡时反弹{n}点伤害',
    'fatalSave': '受到致命伤害时改为无敌{n}秒（每120秒一次）',
    'knockbackImmune': '免疫击退',
    'heatBuildCut': '热量积累减慢{n}%',
    'heatDissipation': '热量消散加快{n}%',
    'flaskDamage': '鲜血药瓶的伤害 +{n}%',
    'igniteBonus': '火系法术的灼烧增强{n}%',
    'stealthy': '行动无声：敌人发现你的距离缩短{n}%',
    'fortitude': '受到重击时获得{n}%生命的护盾',
    'evasionHaste': '闪避成功后获得{n}%急速',
    'cauterize': '被灼烧的敌人对你造成的伤害降低{n}%',
    'pyromaniac': '法术暴击使火系冷却减少{n}秒',
    'tribute': '随从替你承受{n}%的伤害',
    'timeDistort': '受到的伤害有{n}%被延后',
    'entropy': '施法使冷却缩短{n}%',
    'bloodToMana': '受到的物理伤害有{n}%转化为法力',
    'bleedHeal': '命中流血的敌人回复{n}%生命',
    'overheatCrit': '过热时暴击伤害 +{n}%'
  },
  'item': {
    'rustedShortsword': { 'name': '生锈的短剑' },
    'apprenticeStaff': { 'name': '学徒法杖' },
    'scoutsHandgun': { 'name': '斥候手枪' },
    'ironBroadsword': { 'name': '铁制阔剑' },
    'vipinsStiletto': { 'name': '维平的细刃匕首' },
    'aetherCarbine': { 'name': '以太卡宾枪' },
    'ashenGreatsword': { 'name': '灰烬巨剑' },
    'archmageWand': { 'name': '大法师魔杖' },
    'chronoBlade': { 'name': '时光之刃' },
    'bloodForgedAxe': { 'name': '血铸战斧' },
    'voidCannon': { 'name': '虚空加农炮' },
    'dragonSmasher': { 'name': '碎龙锤' },
    'bladeOfTheUnbound': { 'name': '无缚者之刃' },
    'aetheriumDestroyer': { 'name': '以太晶毁灭者' },
    'woodenBuckler': { 'name': '木制小圆盾' },
    'tomeOfNovices': { 'name': '新手魔典' },
    'ironShield': { 'name': '铁盾' },
    'syringeOfTheAdept': { 'name': '行家的注射器' },
    'aethericBattery': { 'name': '以太电池' },
    'aegisTowerShield': { 'name': '神盾塔盾' },
    'orbOfEternalFlame': { 'name': '永恒烈焰宝珠' },
    'shieldOfTheFallen': { 'name': '阵亡者之盾' },
    'paddedTunic': { 'name': '棉甲短衣' },
    'leatherDoublet': { 'name': '皮制紧身衣' },
    'chainmailVest': { 'name': '锁甲背心' },
    'scholarsRobe': { 'name': '学者长袍' },
    'reinforcedPlate': { 'name': '强化板甲' },
    'assassinsGarb': { 'name': '刺客装束' },
    'chronoWeaverCloak': { 'name': '织时者斗篷' },
    'bloodSoakedPlate': { 'name': '浸血板甲' },
    'exoArmorChassis': { 'name': '外骨骼装甲机架' },
    'dragonscaleHauberk': { 'name': '龙鳞锁子甲' },
    'vestmentsOfSovereign': { 'name': '君主法衣' },
    'armorOfTheTitan': { 'name': '泰坦之甲' },
    'copperBand': { 'name': '铜指环' },
    'ringOfMending': { 'name': '愈合之戒' },
    'bandOfSwiftness': { 'name': '迅捷指环' },
    'castersEmblem': { 'name': '施法者徽记' },
    'infiltratorsCharm': { 'name': '潜入者护符' },
    'timekeepersHourglass': { 'name': '守时者沙漏' },
    'ringOfTheVampyre': { 'name': '吸血鬼之戒' },
    'sovereignsSignet': { 'name': '君主印戒' },
    'heartOfTheMountain': { 'name': '山脉之心' },
    'ringOfAbsolutePower': { 'name': '绝对力量之戒' }
  },
  'bag': {
    'equip': '装备',
    'unequip': '卸下',
    'tooLow': '需要 {n} 级。'
  },
  'shop': {
    'buy': '购买',
    'sell': '出售',
    'owned': '已拥有',
    'empty': '今天货架上什么都没有。'
  },
  'trainer': {
    'learn': '学习',
    'known': '已学会',
    'friend': '{faction}厚待朋友：八折优惠。',
    'block': {
      'level': '你的等级太低。',
      'attrs': '你的属性太低。',
      'gold': '金币不够。'
    }
  },
  'healer': {
    'talk': '坐下，歇一歇。离开这里时你会完好如初，药瓶也都装满。想多带几瓶的话，这个我可以卖给你。',
    'note': '你每次进入区域都带着 {n} 瓶药水。',
    'buy': '多带一瓶 · {n}',
    'full': '你的腰带已经挂满了。'
  },
  'talk': {
    'goal': '一切将在{zone}见分晓。'
  },
  'faction': {
    'order': '铁之骑士团',
    'syndicate': '灰烬商会',
    'circle': '以太议会'
  },

  'npc': {
    'sunfordSmith': { 'name': '铁匠布拉姆', 'talk': '朴实的钢，公道的价。挡个哥布林没问题。' },
    'sunfordPeddler': { 'name': '货郎蒂莉', 'talk': '戒指！护符！都是我捡来的，绝对不是偷的。' },
    'trainerAegis': { 'name': '奥德里克爵士' },
    'trainerPyro': { 'name': '安珀·雷恩' },
    'elderMara': { 'name': '玛拉长老', 'talk': '今天你守住了大路。平原已经一年没这么安静了。' },
    'sunfordHealer': { 'name': '露恩修女' },
    'goblinTrader': { 'name': '商人格里克', 'talk': '大王说做买卖，格里克就做买卖。亮晶晶换亮晶晶。好亮晶晶。' },
    'captainHale': { 'name': '黑尔队长', 'talk': '奥克黑文已经屹立三百年。我可不想当丢掉它的那个队长。' },
    'oakArmorer': { 'name': '护甲匠奥多', 'talk': '我一半的存货都上了城墙。剩下的你拿去吧。' },
    'oakMasterArmorer': { 'name': '奥多大师', 'talk': '你救了这座城。里屋的好板甲，为你拿出来。' },
    'oakWeapons': { 'name': '刀剑商塞娜', 'talk': '锋利，趁手，谁付钱就卖给谁。今天是你。' },
    'trainerShadow': { 'name': '“低语”' },
    'trainerSovereign': { 'name': '卡斯特兰勋爵' },
    'oakHealer': { 'name': '芬恩修士' },
    'blackMarket': { 'name': '销赃人', 'talk': '不问名字，不问来路。商会抽成，货归你。' },
    'trainerBlood': { 'name': '桑格雷尔医生' },
    'syndicateBoss': { 'name': '灰烬夫人', 'talk': '多亏了你，奥克黑文归我们了。商会不会忘记朋友，也不会忘记欠债。' },
    'forgemaster': { 'name': '锻造大师多恩', 'talk': '我们挖的是铁，却挖到了一颗心脏。它在下面的黑暗里跳动，魔像就踩着它的节拍走。' },
    'ironWeapons': { 'name': '“锤手”希尔达', 'talk': '矮人打造。要是断了，那是你的问题。' },
    'ironAetherWorks': { 'name': '工匠沃斯', 'talk': '议会对核心的研究改变了一切。拿着这个。别对着我。' },
    'ironArmor': { 'name': '“铁壁”加伦', 'talk': '能挡住巨人大棒的板甲。其他人嘛，有戒指。' },
    'ironOrderArmor': { 'name': '骑士团军需官', 'talk': '骑士团记得是谁毁掉了核心。军械库为你敞开。' },
    'trainerGeo': { 'name': '石足老爹' },
    'trainerAether': { 'name': '齿轮匠皮姆' },
    'ironHealer': { 'name': '布琳雅嬷嬷' },
    'exiledSovereign': { 'name': '流亡的卡斯特兰勋爵' },
    'trainerChrono': { 'name': '时辰守护者' }
  },

  'quest': {
    'final': '这个选择无法更改。',
    'needsRep': '{faction}声望 {n}',
    'gold': '+{n} 金币',
    'goblinKing': {
      'title': '哥布林王',
      'intro': '劫掠都是从洞窟来的，哥布林在那里立了个王。去了结这件事吧，怎么做由你决定。',
      'ask': '等等！等等。大王投降！哥布林抢东西，是因为哥布林肚子饿。大个子和大王，做个交易好不好？',
      'slay': { 'label': '终结他的统治。', 'result': '哥布林王倒下了，洞窟里的哥布林四散而逃。桑福德睡得更安稳，铁之骑士团也注意到了你。' },
      'pact': { 'label': '提议与桑福德订立贸易协定。', 'result': '一张巧嘴办成了刀剑办不到的事。哥布林商人在桑福德的广场上摆起摊，卖的货连那里的铁匠都做不出来。' },
      'ransom': { 'label': '拿走他的财宝，把王冠留给他。', 'result': '你带着沉甸甸的哥布林金币走了出来。劫掠还会再来，但那是桑福德的麻烦。商会对此很满意。' }
    },
    'siege': {
      'title': '奥克黑文围城战',
      'intro': '军阀的大军包围了奥克黑文。出钱养这支军队的是灰烬商会。去郊外打破包围。',
      'ask': '你很能打。商会给的钱，可比那座城给的多得多。今晚替我们打开城门，奥克黑文的三分之一就归你。',
      'defend': { 'label': '保卫奥克黑文。', 'result': '城门守住了。奥克黑文在城墙后日渐富裕，护甲大师们记住了你的名字。从此灰烬商会在每条路上追杀你。' },
      'betray': { 'label': '为商会打开城门。', 'result': '奥克黑文陷入火海。废墟里开起了黑市，还来了一位传授禁术的炼金师。护甲匠都走了，铁之骑士团称你为叛徒。' }
    },
    'core': {
      'title': '艾恩霍尔德之心',
      'intro': '一颗以太核心在驱动我们矿井里的魔像。三方势力都想要它，每一方都给我写了信。你会最先找到它。',
      'ask': '巨像成了一堆废铁，核心就敞开在你面前，嗡嗡作响。摸上去是温热的。要怎么处置它？',
      'destroy': { 'label': '击碎核心。', 'result': '光芒熄灭，魔像纷纷原地倒下。铁之骑士团派出自己的护甲匠来到艾恩霍尔德，以表谢意。' },
      'study': { 'label': '交给议会研究。', 'result': '你对它的了解足够把它安全地交出去。不出一季，艾恩霍尔德的熔炉就造出了前所未见的以太器械。' },
      'sell': { 'label': '卖给商会。', 'result': '一大笔钱易了手。核心在不该在的地方继续亮着，矿井再也不会安宁。' }
    },
    'oracle': {
      'title': '溺水先知',
      'ask': '这一刻我已看过一万次。一半的结局里你放了我，另一半里你夺走我守护的东西。选吧，让我终于不知道接下来会发生什么。',
      'free': { 'label': '打碎她的锁链。', 'result': '先知穿过水面升起，消失了。以太议会将对你赞誉有加，她的时辰守护者留下来授课。' },
      'slay': { 'label': '夺走她守护的沙漏。', 'result': '她没有反抗。守时者沙漏归你了。她最后的弟子逃离了神殿，议会不会原谅你。' }
    },
    'dragon': {
      'title': '虚空巨龙',
      'ask': '够了。你有利齿，小家伙。要塞里的恶魔用锁链锁住了我的同族。我想看他被烧成灰。杀了我，或者让我帮你做到。',
      'slay': { 'label': '屠龙。', 'result': '巨龙倒下，群山震动。铁之骑士团传唱屠龙者的事迹，龙的宝藏归你所有。' },
      'pact': { 'label': '结盟对抗大恶魔。', 'result': '能说服一头龙的人可不多。当你进军恐惧要塞时，它会在你头顶的天空中。' }
    },
    'throne': {
      'title': '空王座',
      'ask': '大恶魔死了，他的王座空着。谁坐上去，谁就掌控要塞、要塞下的裂隙，以及两边的军队。三位使者正在门口等候。',
      'order': { 'label': '把王座交给铁之骑士团。', 'result': '骑士团驻守要塞，能封的都封上。王国会很安全，也会被人指挥着过日子。' },
      'syndicate': { 'label': '把王座交给灰烬商会。', 'result': '商会在天亮前就搬了进来。现在什么都能买卖，包括和平。' },
      'circle': { 'label': '把王座交给以太议会。', 'result': '议会把要塞变成了一所建在裂隙上的学院。他们管这叫研究。其他人都说出事只是时间问题。' },
      'shatter': { 'label': '击碎王座。', 'result': '你亲手把它砸碎。再也没有人能在这里发号施令。使者们一言不发地离开了。' },
      'claim': { 'label': '自己坐上去。', 'result': '很冷，但很合身。三个阵营发现他们有了共同的敌人。' }
    }
  },

  'enemy': {
    'goblin': '哥布林',
    'goblinSlinger': '哥布林投石手',
    'bandit': '强盗',
    'banditArcher': '强盗弓手',
    'wolf': '野狼',
    'banditChief': '强盗头目',
    'goblinKing': '哥布林王',
    'treant': '树人',
    'spider': '巨型蜘蛛',
    'broodSpider': '幼蛛',
    'outlawCaptain': '亡命徒队长',
    'elderTreant': '古树人',
    'warlord': '军阀克拉格',
    'fireElemental': '火元素',
    'ironGolem': '铁魔像',
    'cultist': '邪教徒',
    'emberLord': '余烬领主',
    'ironColossus': '钢铁巨像',
    'frostGiant': '冰霜巨人',
    'naga': '娜迦',
    'skeleton': '骷髅',
    'necromancer': '死灵法师',
    'frostJarl': '冰霜领主',
    'nagaOracle': '溺水先知',
    'voidStalker': '虚空潜行者',
    'wyvern': '双足飞龙',
    'highDemon': '高阶恶魔',
    'voidWarden': '虚空典狱长',
    'voidDragon': '虚空巨龙',
    'doomKnight': '末日骑士',
    'imp': '小恶魔',
    'archDemon': '大恶魔',
    'voidling': '虚空幼体',
    'voidLord': '虚空领主',
    'orderGuard': '骑士团审判官',
    'syndicateBlade': '商会刀客'
  },

  'results': {
    'victory': '胜利！',
    'defeat': '战败',
    'retreat': '已撤退',
    'firstClear': '首次通关！',
    'waves': '撑过的波数：{n}',
    'levelUp': '升到 {n} 级！',
    'points': '+{n} 属性点',
    'xp': '经验',
    'gold': '金币',
    'lost': '损失',
    'kills': '击败',
    'chests': '宝箱',
    'time': '用时',
    'unlocked': '地图新增：{places}',
    'retry': '再试一次',
    'tip': '经验和战利品都会保留。用掉属性点，拜访导师，变强后再回来。'
  },
  'pause': {
    'title': '已暂停',
    'resume': '继续',
    'controls': '操作说明',
    'retreat': '撤回地图',
    'retreatNote': '到目前为止获得的东西都会保留，但该区域不算通关。'
  },
  'ending': {
    'level': '等级',
    'more': '虚空裂隙已在要塞下方开启。斗技场依然欢迎所有挑战者。',
    'order': { 'title': '钢铁和平', 'text': '铁之骑士团的旗帜在恐惧要塞上飘扬。道路安全，律法繁多，你的名字刻在城门之上。' },
    'syndicate': { 'title': '灰烬交易', 'text': '商会在要塞的阴影里统治。王国里再没有什么是禁止的，只是很贵。' },
    'circle': { 'title': '以太时代', 'text': '议会用捕获的虚空之火点亮了要塞。奇迹从它的大门里源源涌出，没有人问代价是什么。' },
    'free': { 'title': '不要国王', 'text': '王座碎了一地，要塞空无一人。许久以来第一次，王国属于生活在其中的人们。' },
    'unbound': { 'title': '无缚者', 'text': '你坐上了王座。骑士团、商会和议会联手向你进军。让他们来吧。' },
    'note': {
      'goblinPact': '哥布林商人还在桑福德的广场上讨价还价。',
      'goblinSlain': '洞窟空无一物，商队准时往来。',
      'goblinRansom': '哥布林王又有钱了，也又开始劫掠了。',
      'oakhavenSaved': '奥克黑文的城墙更高了，集市也更热闹了。',
      'oakhavenFallen': '奥克黑文的街道长满杂草。黑市生意兴隆。',
      'coreOrder': '艾恩霍尔德的矿井安静了，矮人又开始挖矿。',
      'coreCircle': '艾恩霍尔德的熔炉泛着蓝光，它的枪是王国里最好的。',
      'coreSold': '在某个地方，核心仍在嗡鸣。魔像仍在行走。',
      'oracleFreed': '风平浪静的日子里，渔夫能在远处的水面上看见先知。',
      'oracleSlain': '沉没神殿一片寂静。再也没有人知道接下来会发生什么。',
      'dragonPact': '一头龙在要塞屋顶筑了巢，只听一个名字的召唤。',
      'dragonSlain': '一颗龙的头骨挂在骑士团的大厅里。'
    }
  },

  'options': {
    'gameplay': '玩法',
    'title': '选项',
    'general': '通用',
    'audio': '音频',
    'language': '语言',
    'difficulty': '难度',
    'soundEffects': '音效',
    'music': '音乐',
    'mute': '静音',
    'musicTrack': '音乐曲目',
    'musicTracks': {
      'cozy': '宁静',
      'trance': '冒险'
    },
    'haptics': '震动',
    'on': '开',
    'off': '关',
    'close': '关闭',
    'keyboard': {
      'auto': '自动检测键盘布局',
      'layout': '键盘布局',
      'detected': '已检测：{layout}',
      'bindings': '按键绑定',
      'press': '请按一个键…（Esc 取消）',
      'reset': '重置按键'
    },
    'actions': {
      'up': '向上移动',
      'down': '向下移动',
      'left': '向左移动',
      'right': '向右移动',
      'skill1': '技能 1',
      'skill2': '技能 2',
      'skill3': '技能 3',
      'skill4': '技能 4',
      'skill5': '技能 5',
      'skill6': '技能 6',
      'potion': '喝药水',
      'manaPotion': '喝法力药水',
      'interact': '交谈',
      'target': '下一个目标',
      'map': '世界地图',
      'character': '英雄',
      'inventory': '背包',
      'skills': '技能'
    },
    'difficulties': {
      'easy': '简单',
      'medium': '普通',
      'hard': '困难'
    },
    'difficultyHints': {
      'easy': '敌人攻击更弱，也更容易被击倒。',
      'medium': '预设的标准挑战。',
      'hard': '敌人更耐打，攻击也更猛。'
    }
  },
  'adsBlocked': {
    'title': '无法显示广告',
    'body': '我们本想为你播放一段视频，但你的浏览器中有内容拦截了广告。',
    'allowPrefix': '请在以下网站允许广告：',
    'allowSuffix': '（或为本游戏暂停广告拦截器）然后重试。',
    'gotIt': '知道了'
  },
  'saveStatus': {
    'restoredTitle': '云存档已恢复',
    'restoredBody': '恢复奖励 +{n} 金币',
    'tap': '点击',
    'pausedTitle': '云同步已暂停',
    'pausedBody': '正在离线游戏。你的进度会保存在本地。',
    'retry': '重试',
    'dismiss': '忽略'
  },
  'loading': {
    'tooLong': '加载太久？请关闭广告拦截器并刷新页面。'
  },
  'license': {
    'denied': '访问被拒绝：请购买许可证。'
  },
  'leaderboard': {
    'title': '排行榜',
    'rank': '#',
    'player': '玩家',
    'score': '经验',
    'flair': '等级',
    'empty': '排行榜上还没有人。来当第一个吧！',
    'failed': '无法连接排行榜。',
    'loading': '加载中…',
    'you': '你',
    'yourRank': '{total} 人中你排第 {n}',
    'of': '/ 共 {n} 名玩家',
    'tabGlobal': '全球'
  }
}
