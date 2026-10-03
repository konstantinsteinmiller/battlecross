// Japanese locale — mirrors the key shape of en.ts exactly.
export default {
  'gameName': 'Battlecross',
  'cancel': 'キャンセル',
  'close': '閉じる',
  'ok': '了解',
  'continue': '続ける',
  'onlyAvailableOn': 'このゲームは以下でのみプレイできます：',

  'ui': {
    'next': '次へ',
    'replay': 'もう一度',
    'back': '戻る',
    'play': 'プレイ',
    'pause': '一時停止',
    'menu': 'メニュー',
    'home': 'ホーム',
    'info': '情報',
    'help': '操作方法',
    'ok': 'わかった',
    'continue': '続ける'
  },

  'hud': {
    'level': 'Lv.{n}',
    'health': '体力 {n}/{max}',
    'mana': 'マナ {n}/{max}',
    'heat': 'ヒート',
    'xp': '経験値',
    'gold': '{n} ゴールド',
    'potion': '回復ポーション（残り{n}個）',
    'groups': '敵グループ {n}/{total} 撃破',
    'wave': 'ウェーブ {n} / {total}'
  },
  'menu': {
    'map': 'ワールドマップ',
    'character': 'ヒーロー',
    'skills': 'スキル',
    'inventory': 'バッグ'
  },

  'combat': {
    'dodge': '回避',
    'block': 'ブロック',
    'immune': '無効'
  },
  'level': {
    'open': '開ける',
    'guarded': '守られている',
    'locked': 'ロック中',
    'potion': 'ポーション +1',
    'manaPotion': 'マナポーション +1',
    'leave': '立ち去る',
    'chestsLeft': 'まだ閉じた宝箱が{n}個ある'
  },
  'status': {
    'stun': 'スタン',
    'knockup': '打ち上げ',
    'knockdown': 'ダウン',
    'stasis': 'ステイシス',
    'petrify': '石化',
    'frozen': '凍結',
    'fear': '恐怖',
    'slow': '鈍足',
    'confuse': '混乱',
    'taunt': '挑発',
    'armorShred': 'アーマー破壊',
    'weaken': '弱体',
    'vulnerable': '脆弱',
    'burn': '燃焼',
    'poison': '毒',
    'bleed': '出血',
    'delayed': '遅延ダメージ',
    'haste': 'ヘイスト',
    'attackSpeed': '攻撃速度アップ',
    'damageUp': '攻撃力アップ',
    'defenseUp': '防御力アップ',
    'regen': '再生',
    'lifestealUp': 'ライフスティール',
    'invulnerable': '無敵',
    'unkillable': '不死',
    'stealth': '潜伏',
    'reflect': '反射',
    'envenom': '毒の刃',
    'exosuit': 'エクソスーツ',
    'focus': '集中',
    'accelerate': '加速',
    'overheat': 'オーバーヒート',
    'enrage': '激怒',
    'ambush': '奇襲'
  },
  'toast': {
    'item': '入手：{item}',
    'levelUp': 'レベル{level}！ 能力ポイント+3',
    'boss': '{boss}が現れた',
    'wave': 'ウェーブ {n}'
  },

  'coach': {
    'move': {
      'touch': '地面をタップするとそこへ歩きます。スティックでも動けます。',
      'mouse': '地面をクリックするとそこへ歩きます。移動キーでも動けます。'
    },
    'target': {
      'touch': '敵をタップするか、ヒーローから敵へドラッグして攻撃します。',
      'mouse': '敵をクリックして攻撃します。'
    },
    'skill': {
      'touch': 'スキルをタップするとターゲットに使います。',
      'mouse': 'スキルキーを押すとターゲットに使います。'
    },
    'aim': {
      'touch': 'スキルをフィールドへドラッグして狙い、指を離して発動します。',
      'mouse': 'スキルをフィールドへドラッグして狙い、ボタンを離して発動します。'
    },
    'potion': {
      'touch': 'ポーションをタップして回復します。',
      'mouse': 'ポーションキーを押して回復します。'
    }
  },

  'node': {
    'sunford': { 'name': 'サンフォード', 'desc': '平原のはずれにある農村。わが家と鍛冶屋、そして二人の師範がいる。' },
    'plains': { 'name': 'サンフォード平原', 'desc': 'ゴブリンに狼、山賊が、街道をゆく隊商を狙っている。' },
    'hollows': { 'name': 'ゴブリンの洞穴', 'desc': '丘の下に広がる洞窟。いちばん奥でゴブリンキングが待っている。' },
    'arena': { 'name': 'コロシアム', 'desc': '全8ウェーブ、進むほど手ごわい。最後まで立っていた者に金と栄光を。' },
    'woods': { 'name': 'ささやきの森', 'desc': '歩きまわる古木と、そのあいだに巣を張るクモたち。' },
    'outskirts': { 'name': 'オークヘイヴン郊外', 'desc': 'オークヘイヴンの外で農場が燃えている。戦将の軍勢が門に迫る。' },
    'oakhaven': { 'name': 'オークヘイヴン', 'desc': '城壁に囲まれた交易の町。その行く末はあなた次第。' },
    'crags': { 'name': '灰の岩山', 'desc': '黒い岩と燃えさかる炎。教団員たちが火をくべている。' },
    'mines': { 'name': 'アイアンホールド鉱山', 'desc': 'ドワーフは深く掘りすぎて、光る何かを目覚めさせた。' },
    'ironhold': { 'name': 'アイアンホールド', 'desc': '山の鍛冶の町。王国一の鋼はここで打たれる。' },
    'tundra': { 'name': '凍傷のツンドラ', 'desc': '巨人が歩き、死者が眠らない白い荒野。' },
    'temple': { 'name': '沈んだ神殿', 'desc': '水に沈んだナーガの広間と、すべての結末を見通す神託の巫女。' },
    'citadel': { 'name': '虚無の城塞', 'desc': '去年はなかったはずの要塞。壁が低くうなっている。' },
    'peak': { 'name': '竜の峰', 'desc': '山頂をワイバーンが舞う。そこには、はるかに大きな何かが眠っている。' },
    'fortress': { 'name': '恐怖の要塞', 'desc': 'アークデーモンの居城。どの勢力も欲しがる玉座がある。' },
    'rift': { 'name': '虚無の裂け目', 'desc': '悪魔たちがやって来た傷口。その向こうで虚無の王が待つ。' }
  },
  'map': {
    'title': '王国',
    'town': '町',
    'levels': 'Lv.{min}–{max}',
    'arenaBest': '最高：ウェーブ{n}',
    'travel': '出発',
    'again': '再挑戦',
    'enter': '入る',
    'fight': '戦う',
    'back': '町へ戻る',
    'locked': '隣のゾーンをクリアすると道が開く。',
    'lockedArena': 'ゴブリンキングの件が片づくと門が開く。',
    'lockedRift': '恐怖の要塞の玉座の行方が決まると開く。',
    'danger': {
      '1': 'あなたのレベルより少し上。',
      '2': '今のレベルでは危険。',
      '3': 'あなたのレベルよりはるかに上。'
    },
    'questOpen': '{quest}：ここで決断が待っている。',
    'questDone': '{quest}：{choice}',
    'trainer': '隠れた師範：{cls}'
  },
  'travel': {
    'to': '移動中：',
    'loading': '読み込み中'
  },

  'attr': {
    'str': { 'name': '筋力', 'short': '筋力', 'desc': '近接攻撃力、ブロック率、重装備。' },
    'dex': { 'name': '器用さ', 'short': '器用', 'desc': 'クリティカル、攻撃速度と移動速度。' },
    'int': { 'name': '知力', 'short': '知力', 'desc': '魔法攻撃力、マナ、属性耐性。' },
    'end': { 'name': '耐久力', 'short': '耐久', 'desc': '体力、自然回復、アーマー、スタン耐性。' },
    'skl': { 'name': '技量', 'short': '技量', 'desc': 'クリティカルダメージ、クールダウン、遠距離武器。' },
    'cha': { 'name': '魅力', 'short': '魅力', 'desc': 'ミニオン、店の値段、報酬、会話の選択肢。' }
  },
  'stat': {
    'health': '体力',
    'mana': 'マナ',
    'armor': 'アーマー',
    'resist': '耐性',
    'crit': 'クリティカル率',
    'critDamage': 'クリティカルDMG',
    'attackSpeed': '攻撃速度',
    'moveSpeed': '移動速度',
    'cdr': 'クールダウン短縮',
    'block': 'ブロック',
    'dodge': '回避',
    'hpRegen': '体力 / 秒'
  },
  'sheet': {
    'points': '残り{n}ポイント',
    'raise': '{attr}を上げる',
    'maxLevel': '最高レベルに到達'
  },

  'skills': {
    'active': 'アクティブスキル',
    'passive': 'パッシブスキル',
    'known': '習得済み',
    'none': 'まだ何も覚えていない。町で師範を探そう。',
    'emptySlot': '空きスロット{n}',
    'equip': 'セット',
    'remove': '外す',
    'unmet': '必要条件を満たさなくなった。'
  },
  'class': {
    'aegis': { 'name': 'イージスナイト', 'desc': '盾と聖なる鋼。仲間の代わりに攻撃を受け止める。' },
    'shadow': { 'name': 'シャドウブレード', 'desc': '闇から現れ、背後から斬り、また消える。' },
    'pyro': { 'name': 'パイロマンサー', 'desc': '炎がすべての答え。燃やして、それから爆発させる。' },
    'sovereign': { 'name': 'グランドソブリン', 'desc': 'ひとりで戦う必要はない。衛兵を呼び出して指揮しよう。' },
    'chrono': { 'name': 'クロノウィーバー', 'desc': '敵の時を止め、味方を加速し、失敗を巻き戻す。' },
    'blood': { 'name': 'ブラッドアルケミスト', 'desc': '体力を払って力を得て、敵から吸い戻す。' },
    'aether': { 'name': 'エーテルテック', 'desc': '銃とタレットとヒートゲージ。使えなくなる前に排熱を。' },
    'geo': { 'name': 'ジオマンサー', 'desc': '壁とトゲを生み出し、大地そのものを割る。' }
  },
  'skill': {
    'kind': { 'active': 'アクティブ', 'passive': 'パッシブ' },
    'cooldown': 'クールダウン{n}秒',
    'mana': 'マナ{n}',
    'hpCost': '体力{n}%',
    'heat': 'ヒート+{n}',
    'aimed': 'ドラッグで狙う',

    'shieldSlam': { 'name': 'シールドスラム', 'desc': '盾を叩きつけ、筋力の{dmg}%のダメージを与えて{stun}秒スタンさせる。' },
    'aegisAura': { 'name': 'イージスオーラ', 'desc': 'アーマー+{armor}%。受ける物理ダメージが{reduce}%減る。' },
    'radiantStrike': { 'name': 'ラディアントストライク', 'desc': '筋力の{dmg}%のダメージを与える聖なる一撃。与えたダメージの{heal}%ぶん回復する。' },
    'fortitude': { 'name': '不屈', 'desc': '体力の{hit}%を超える一撃を受けると、体力の{shield}%ぶんのシールドを{dur}秒得る。{icd}秒に1回。' },
    'tauntingCry': { 'name': '挑発の雄叫び', 'desc': '{radius} m以内の敵が{dur}秒あなたを狙う。そのあいだ防御力+{def}%。' },
    'holyBastion': { 'name': '聖なる砦', 'desc': '{dur}秒無敵になる。攻撃してきた敵にダメージの{reflect}%を跳ね返す。' },

    'shadowstep': { 'name': 'シャドウステップ', 'desc': 'ターゲットの背後に現れ、器用さの{dmg}%のダメージで背中を刺す。' },
    'lethality': { 'name': '必殺', 'desc': 'クリティカル率+{crit}%、クリティカルダメージ+{critDmg}%。' },
    'venomousBlade': { 'name': '猛毒の刃', 'desc': '{dur}秒間、攻撃が毒を与える。{over}秒かけて器用さの{poison}%、最大{stacks}回重なる。' },
    'evasion': { 'name': '見切り', 'desc': '回避率+{dodge}%。回避すると{dur}秒間ヘイスト{haste}%。' },
    'smokeBomb': { 'name': '煙玉', 'desc': '{dur}秒姿を消す。潜伏からの次の攻撃はダメージ+{bonus}%。' },
    'danceOfBlades': { 'name': '刃の舞', 'desc': '{radius} m以内の敵のあいだを駆け抜け、{hits}回斬って合計で器用さの{dmg}%のダメージ。舞っているあいだは攻撃を受けない。' },

    'fireball': { 'name': 'ファイアボール', 'desc': '火の玉が弾けて知力の{dmg}%のダメージ。さらに{burnDur}秒かけて{burn}%の燃焼ダメージ。' },
    'cauterize': { 'name': '焼灼', 'desc': '燃焼中の敵から受けるダメージが{reduce}%減る。' },
    'flamePillar': { 'name': 'フレイムピラー', 'desc': '狙った場所に火柱が噴き上がる。{dur}秒かけて知力の{dmg}%のダメージ。巻き込まれた敵は打ち上げられる。' },
    'pyromaniac': { 'name': '炎狂い', 'desc': '魔法がクリティカルすると、炎スキルのクールダウンが{cut}秒縮む。' },
    'combustion': { 'name': '爆燃', 'desc': '{radius} m以内の燃焼をすべて起爆。残りダメージの{pct}%が爆発として一気に入る。' },
    'cataclysm': { 'name': 'カタクリズム', 'desc': '{dur}秒かけて隕石を{meteors}個呼ぶ。1個ごとに知力の{dmg}%のダメージ。' },

    'royalGuard': { 'name': 'ロイヤルガード', 'desc': 'そばで戦う衛兵を呼び出す。魅力の{dmg}%のダメージで攻撃。同時に{max}体まで。' },
    'inspiringPresence': { 'name': '鼓舞する威光', 'desc': 'ミニオンの攻撃速度が{speed}%上がり、体力が{hp}%増える。' },
    'commandFocus': { 'name': '集中攻撃命令', 'desc': 'ミニオン全員がターゲットへ突撃。{dur}秒間、移動速度+{move}%、攻撃速度+{atk}%。' },
    'sovereignsTribute': { 'name': '君主への貢ぎ物', 'desc': '受けるダメージの{share}%をミニオンが肩代わりする。' },
    'bannerOfVictory': { 'name': '勝利の旗', 'desc': '{dur}秒間、旗を立てる。近くの味方はダメージ+{dmg}%、毎秒体力を{regen}%回復。' },
    'armyOfTheRealm': { 'name': '王国の軍勢', 'desc': '弓兵{archers}人、衛兵{guards}人、戦闘魔道士1人を{dur}秒間呼び出す。' },

    'temporalStasis': { 'name': 'テンポラルステイシス', 'desc': 'ターゲットの時を{dur}秒止める。行動できず、ダメージも受けない。' },
    'hasteField': { 'name': 'ヘイストフィールド', 'desc': '{dur}秒間、自分と近くの味方の移動速度が{move}%、攻撃速度が{speed}%上がる。' },
    'timeDistort': { 'name': '時のゆがみ', 'desc': '受けるダメージの{share}%が遅れて、{over}秒かけて入る。' },
    'paradoxShift': { 'name': 'パラドックスシフト', 'desc': 'ターゲットと位置を入れ替える。知力の{dmg}%のダメージを与え、周りの敵を{confuse}秒混乱させる。' },
    'entropy': { 'name': 'エントロピー', 'desc': 'スキルを使うたびにクールダウンが{cdr}%短くなる。最大{stacks}回重なる。' },
    'chronoRewind': { 'name': 'クロノリワインド', 'desc': '{back}秒前にいた場所へ、その時の体力とマナで戻る。' },

    'sanguineFlask': { 'name': '鮮血のフラスコ', 'desc': '自分の血のフラスコを投げる。範囲に耐久力の{dmg}%のダメージ、{shredDur}秒間アーマーを{shred}%破壊。' },
    'bloodTransmutation': { 'name': '血の変成', 'desc': '受けた物理ダメージの{share}%がマナとして戻る。' },
    'essenceHarvest': { 'name': '精気の収穫', 'desc': '{radius} m以内のすべての敵から吸い取り、知力の{dmg}%のダメージ。その{heal}%ぶん回復する。' },
    'hemophilia': { 'name': '血の渇き', 'desc': 'ライフドレインが{drain}%強くなる。出血中の敵に当てると体力を{heal}%回復。' },
    'mutagenicRage': { 'name': '変異の怒り', 'desc': '{dur}秒間：攻撃速度+{speed}%、ライフスティール+{steal}%、移動速度+{move}%。' },
    'philosophersCrucible': { 'name': '賢者のるつぼ', 'desc': '{dur}秒間、煮えたぎる血の池を作る。中の敵に知力の{dmg}%のダメージ。自分が立っていると回復する。' },

    'aetherPistol': { 'name': 'エーテルピストル', 'desc': '技量の{dmg}%のダメージの早撃ち。ヒートが{heat}たまる。' },
    'deployTurret': { 'name': 'タレット設置', 'desc': '技量の{dmg}%のダメージで撃つタレットを{dur}秒間置く。同時に{max}台まで。' },
    'ventHeat': { 'name': '排熱', 'desc': 'ヒートをすべて扇状に放出。技量の最大{dmg}%のダメージ。ヒートが多いほど強い。' },
    'thermalOverload': { 'name': 'サーマルオーバーロード', 'desc': 'オーバーヒート中は射撃のクリティカルダメージ+{crit}%。ただしスキルは{lock}秒使えなくなる。' },
    'orbitalBeam': { 'name': 'オービタルビーム', 'desc': '空からのビームが狙った場所を焼く。{dur}秒かけて技量の{dmg}%のダメージ。' },
    'exoSuit': { 'name': 'エクソスーツ', 'desc': '{dur}秒間：アーマー+{armor}%。攻撃がロケットになり、範囲に技量の{rocket}%のダメージ。' },

    'stoneSpike': { 'name': 'ストーンスパイク', 'desc': 'ターゲットの足元から岩のトゲが突き出す。筋力の{dmg}%のダメージ、{dur}秒間{slow}%鈍足。' },
    'earthBarrier': { 'name': 'アースバリア', 'desc': '{dur}秒間、岩の壁を立てる。歩いても撃っても通れない。' },
    'seismicShock': { 'name': 'サイズミックショック', 'desc': '地面を叩く。{radius} m以内に筋力の{dmg}%のダメージ、敵を{down}秒ダウンさせる。' },
    'earthenSkin': { 'name': '大地の肌', 'desc': '筋力の{armor}%ぶんのアーマーを得る。受けるスタンが{cut}%短くなる。' },
    'petrify': { 'name': '石化', 'desc': 'ターゲットを{dur}秒石に変える。石が砕けるとき、受けるダメージが{vuln}%増える。' },
    'tectonicRupture': { 'name': 'テクトニックラプチャー', 'desc': '大地を引き裂く。近くのすべてに筋力の{dmg}%のダメージ。がれきが{dur}秒間鈍足にする。' }
  },

  'slot': {
    'main': '利き手',
    'off': '逆の手',
    'body': '鎧',
    'trinket': '装飾品'
  },
  'tier': {
    '1': 'ティア1',
    '2': 'ティア2',
    '3': 'ティア3',
    '4': 'ティア4',
    '5': 'ティア5',
    '6': 'レジェンド'
  },
  'weapon': {
    'melee': '近接 · {attr}で強化',
    'ranged': '遠距離 · {attr}で強化',
    'magic': '魔法 · {attr}で強化'
  },
  'source': {
    'mob': '{zone}のモンスターが落とす。',
    'chest': '{zone}の宝箱で見つかる。',
    'boss': '{zone}のボスが落とす。',
    'secret': '{zone}の隠し宝箱に眠っている。'
  },
  'mod': {
    'str': '筋力+{n}',
    'dex': '器用さ+{n}',
    'int': '知力+{n}',
    'end': '耐久力+{n}',
    'skl': '技量+{n}',
    'cha': '魅力+{n}',
    'allAttrs': 'すべての能力+{n}',
    'strOrDex': '筋力か器用さの高いほうに+{n}',
    'armor': 'アーマー{n}',
    'armorPct': 'アーマー+{n}%',
    'armorFromStr': '筋力によるアーマー：+{n}%',
    'block': 'ブロック率+{n}%',
    'dodge': '回避率+{n}%',
    'damageReduction': 'ダメージ軽減+{n}%',
    'physReduction': '受ける物理ダメージ-{n}%',
    'maxHp': '最大体力+{n}',
    'maxHpPct': '最大体力+{n}%',
    'maxMana': '最大マナ+{n}',
    'hpRegen': '毎秒体力+{n}',
    'stunDurationCut': '受けるスタンが{n}%短くなる',
    'damagePct': '与えるダメージ+{n}%',
    'critChance': 'クリティカル率+{n}%',
    'critDamage': 'クリティカルダメージ+{n}%',
    'spellCrit': '魔法クリティカル率+{n}%',
    'attackSpeed': '攻撃速度+{n}%',
    'moveSpeed': '移動速度+{n}%',
    'cdr': 'クールダウンが{n}%短くなる',
    'manaDiscount': '魔法のマナ消費-{n}%',
    'lifesteal': 'すべてのダメージでライフスティール+{n}%',
    'physLifesteal': '物理攻撃でライフスティール+{n}%',
    'lifeDrainPct': 'ライフドレインが{n}%強くなる',
    'bossDamage': 'ボスへのダメージ+{n}%',
    'backstab': '背後攻撃ダメージ+{n}%',
    'minionDamage': 'ミニオンのダメージ+{n}%',
    'minionAttackSpeed': 'ミニオンの攻撃が{n}%速くなる',
    'minionHp': 'ミニオンの体力+{n}%',
    'burnOnHit': '攻撃が{n}ダメージの燃焼を与える',
    'freezeOnHit': '攻撃が{n}%の確率で凍結させる',
    'pierce': '弾がさらに{n}体の敵を貫通する',
    'critCooldown': 'クリティカルで全クールダウンが{n}秒縮む',
    'extraBlastEvery': '{n}発ごとにエネルギー弾を追加',
    'reflectOnBlock': 'ブロックすると{n}ダメージを反射',
    'fatalSave': '致命的なダメージを受ける代わりに{n}秒無敵になる（120秒に1回）',
    'knockbackImmune': 'ノックバック無効',
    'heatBuildCut': 'ヒートのたまりが{n}%遅くなる',
    'heatDissipation': 'ヒートが{n}%速く冷める',
    'flaskDamage': '鮮血のフラスコのダメージ+{n}%',
    'igniteBonus': '炎の魔法の燃焼が{n}%強くなる',
    'stealthy': '静かに動く：敵に気づかれる距離が{n}%縮む',
    'fortitude': '大きな一撃を受けると体力{n}%のシールド',
    'evasionHaste': '回避するとヘイスト{n}%',
    'cauterize': '燃焼中の敵から受けるダメージ-{n}%',
    'pyromaniac': '魔法クリティカルで炎のクールダウンが{n}秒縮む',
    'tribute': 'ミニオンがあなたのダメージの{n}%を受ける',
    'timeDistort': '受けるダメージの{n}%が遅れて入る',
    'entropy': 'スキルを使うとクールダウンが{n}%縮む',
    'bloodToMana': '受けた物理ダメージの{n}%がマナで戻る',
    'bleedHeal': '出血中の敵に当てると体力{n}%回復',
    'overheatCrit': 'オーバーヒート中クリティカルダメージ+{n}%'
  },
  'item': {
    'rustedShortsword': { 'name': '錆びたショートソード' },
    'apprenticeStaff': { 'name': '見習いの杖' },
    'scoutsHandgun': { 'name': '斥候のハンドガン' },
    'ironBroadsword': { 'name': '鉄のブロードソード' },
    'vipinsStiletto': { 'name': 'ヴィピンのスティレット' },
    'aetherCarbine': { 'name': 'エーテルカービン' },
    'ashenGreatsword': { 'name': '灰の大剣' },
    'archmageWand': { 'name': '大魔道士のワンド' },
    'chronoBlade': { 'name': 'クロノブレード' },
    'bloodForgedAxe': { 'name': '血鍛えの斧' },
    'voidCannon': { 'name': 'ヴォイドキャノン' },
    'dragonSmasher': { 'name': 'ドラゴンスマッシャー' },
    'bladeOfTheUnbound': { 'name': '縛られざる者の剣' },
    'aetheriumDestroyer': { 'name': 'エーテリウムデストロイヤー' },
    'woodenBuckler': { 'name': '木のバックラー' },
    'tomeOfNovices': { 'name': '初心者の魔道書' },
    'ironShield': { 'name': '鉄の盾' },
    'syringeOfTheAdept': { 'name': '達人の注射器' },
    'aethericBattery': { 'name': 'エーテルバッテリー' },
    'aegisTowerShield': { 'name': 'イージスの大盾' },
    'orbOfEternalFlame': { 'name': '永遠の炎のオーブ' },
    'shieldOfTheFallen': { 'name': '斃れし者の盾' },
    'paddedTunic': { 'name': '綿入りのチュニック' },
    'leatherDoublet': { 'name': '革のダブレット' },
    'chainmailVest': { 'name': 'チェインメイルベスト' },
    'scholarsRobe': { 'name': '学者のローブ' },
    'reinforcedPlate': { 'name': '強化プレート' },
    'assassinsGarb': { 'name': '暗殺者の装束' },
    'chronoWeaverCloak': { 'name': 'クロノウィーバーの外套' },
    'bloodSoakedPlate': { 'name': '血染めのプレート' },
    'exoArmorChassis': { 'name': 'エクソアーマーシャーシ' },
    'dragonscaleHauberk': { 'name': '竜鱗のホーバーク' },
    'vestmentsOfSovereign': { 'name': '君主の礼服' },
    'armorOfTheTitan': { 'name': 'タイタンの鎧' },
    'copperBand': { 'name': '銅の指輪' },
    'ringOfMending': { 'name': '癒しの指輪' },
    'bandOfSwiftness': { 'name': '俊足の指輪' },
    'castersEmblem': { 'name': '術者の紋章' },
    'infiltratorsCharm': { 'name': '潜入者のお守り' },
    'timekeepersHourglass': { 'name': '時守の砂時計' },
    'ringOfTheVampyre': { 'name': '吸血鬼の指輪' },
    'sovereignsSignet': { 'name': '君主の印章指輪' },
    'heartOfTheMountain': { 'name': '山の心臓' },
    'ringOfAbsolutePower': { 'name': '絶対なる力の指輪' }
  },
  'bag': {
    'equip': '装備',
    'unequip': '外す',
    'tooLow': 'レベル{n}が必要。'
  },
  'shop': {
    'buy': '買う',
    'sell': '売る',
    'owned': '所持',
    'empty': '今日は棚に何もない。'
  },
  'trainer': {
    'learn': '習得',
    'known': '習得済み',
    'friend': '{faction}は友を大切にする：20%引き。',
    'block': {
      'level': 'レベルが足りない。',
      'attrs': '能力値が足りない。',
      'gold': 'ゴールドが足りない。'
    }
  },
  'healer': {
    'talk': 'お座りなさい。休みなさい。ここを出るときは傷ひとつなく、フラスコも満タンです。もっと持ち歩きたいなら、お売りしますよ。',
    'note': 'どのゾーンにもポーションを{n}個持っていける。',
    'buy': 'フラスコを追加 · {n}',
    'full': 'ベルトはもういっぱいです。'
  },
  'talk': {
    'goal': '{zone}で決着がつく。'
  },
  'faction': {
    'order': '鉄の騎士団',
    'syndicate': '灰のシンジケート',
    'circle': 'エーテル結社'
  },

  'npc': {
    'sunfordSmith': { 'name': '鍛冶屋のブラム', 'talk': '飾り気のない鋼を、まっとうな値段で。ゴブリンくらいは追い払えるさ。' },
    'sunfordPeddler': { 'name': '行商人のティリー', 'talk': '指輪！お守り！拾っただけで、ぜったい盗んでない品だよ。' },
    'trainerAegis': { 'name': 'サー・アルドリック' },
    'trainerPyro': { 'name': 'エンバー・レン' },
    'elderMara': { 'name': 'マーラ長老', 'talk': '今日は街道を守ってくれたね。平原がこんなに静かなのは一年ぶりだよ。' },
    'sunfordHealer': { 'name': 'シスター・ルーン' },
    'goblinTrader': { 'name': '商人のグリク', 'talk': '王さま、とりひきしろ言う。だからグリク、とりひきする。ピカピカとピカピカ、こうかん。いいピカピカ。' },
    'captainHale': { 'name': 'ヘイル隊長', 'talk': 'オークヘイヴンは三百年守られてきた。それを失った隊長になるつもりはない。' },
    'oakArmorer': { 'name': '防具屋のオド', 'talk': '在庫の半分は城壁の上に持っていかれた。残りを持っていけ。' },
    'oakMasterArmorer': { 'name': 'オド親方', 'talk': 'あんたはこの町を救った。奥の部屋のいい鎧を出してこよう。' },
    'oakWeapons': { 'name': '刃物屋のセナ', 'talk': '鋭くて、バランスがよくて、払ってくれる人に売る。今日はあなたね。' },
    'trainerShadow': { 'name': '「ささやき」' },
    'trainerSovereign': { 'name': 'カステラン卿' },
    'oakHealer': { 'name': 'ブラザー・フェン' },
    'blackMarket': { 'name': '故買屋', 'talk': '名前は聞かない、質問もしない。シンジケートが取り分を取り、あんたは品物を取る。' },
    'trainerBlood': { 'name': 'サングレル博士' },
    'syndicateBoss': { 'name': 'マダム・アッシュ', 'talk': 'オークヘイヴンが私たちのものになったのは、あなたのおかげ。シンジケートは友を忘れない。借りもね。' },
    'forgemaster': { 'name': '鍛冶頭ドルン', 'talk': '鉄を掘っていたら、心臓を掘り当てた。暗い底で脈打っていて、ゴーレムはその鼓動に合わせて歩くんだ。' },
    'ironWeapons': { 'name': '鉄槌のヒルダ', 'talk': 'ドワーフが鍛えた品だ。壊れたなら、あんたのせいさ。' },
    'ironAetherWorks': { 'name': '細工師ヴォス', 'talk': '結社がコアを研究して、すべてが変わった。これを持って。こっちに向けないで。' },
    'ironArmor': { 'name': '鉄腹のガルン', 'talk': '巨人の棍棒もはじく板金鎧だ。ほかの連中には指輪もある。' },
    'ironOrderArmor': { 'name': '騎士団の補給係', 'talk': '騎士団は、誰がコアを壊したかを覚えている。武具庫はあなたに開かれている。' },
    'trainerGeo': { 'name': '石足じいさん' },
    'trainerAether': { 'name': '歯車技師ピム' },
    'ironHealer': { 'name': 'マザー・ブリュンヤ' },
    'exiledSovereign': { 'name': '追放されたカステラン卿' },
    'trainerChrono': { 'name': '時の番人' }
  },

  'quest': {
    'final': 'この選択はやり直せない。',
    'needsRep': '{faction}の評判 {n}',
    'gold': '+{n} ゴールド',
    'goblinKing': {
      'title': 'ゴブリンキング',
      'intro': '襲撃は洞穴からやって来る。ゴブリンたちがそこで王を立てたんだ。やり方は任せるから、終わらせておくれ。',
      'ask': 'まって！まって。王さま、こうさん！ゴブリン、はらぺこだから おそうだけ。のっぽと王さま、とりひきする？',
      'slay': { 'label': '王の支配を終わらせる。', 'result': '王は倒れ、洞穴のゴブリンは散り散りになった。サンフォードは安心して眠り、鉄の騎士団があなたに目をとめる。' },
      'pact': { 'label': 'サンフォードとの交易協定を持ちかける。', 'result': '剣にできないことを、巧みな言葉がやってのけた。ゴブリンの商人がサンフォードの広場に店を出し、町の鍛冶屋には作れない品を並べる。' },
      'ransom': { 'label': '財宝をもらい、王冠は残してやる。', 'result': 'ゴブリンの金でずっしり重い袋を抱えて外へ出る。襲撃はまた始まるが、それはサンフォードの問題だ。シンジケートは満足している。' }
    },
    'siege': {
      'title': 'オークヘイヴン包囲戦',
      'intro': '戦将の軍勢がオークヘイヴンを取り囲んでいる。その軍に金を出したのは灰のシンジケートだ。郊外で包囲を破れ。',
      'ask': 'いい腕だ。シンジケートは、あの町よりずっと気前がいい。今夜、門を開けてくれ。そうすればオークヘイヴンの三分の一はお前のものだ。',
      'defend': { 'label': 'オークヘイヴンを守る。', 'result': '門は持ちこたえた。オークヘイヴンは壁の内側で豊かになり、腕利きの防具職人たちはあなたの名を忘れない。灰のシンジケートは今や、あらゆる道であなたを狙う。' },
      'betray': { 'label': 'シンジケートのために門を開ける。', 'result': 'オークヘイヴンは燃えた。廃墟には闇市が開き、禁じられた術を教える錬金術師が現れる。防具職人たちは去り、鉄の騎士団はあなたを裏切り者と呼ぶ。' }
    },
    'core': {
      'title': 'アイアンホールドの心臓',
      'intro': 'エーテルコアが鉱山のゴーレムを動かしている。三つの勢力がそれを欲しがり、どこも私に手紙をよこした。最初にたどり着くのは君だ。',
      'ask': 'コロッサスは鉄くずになり、目の前でコアがむき出しのままうなっている。触れると温かい。これをどうする？',
      'destroy': { 'label': 'コアを砕く。', 'result': '光が消え、ゴーレムはその場に崩れ落ちた。鉄の騎士団は感謝のしるしに、自分たちの防具職人をアイアンホールドへ送る。' },
      'study': { 'label': '結社に渡して研究させる。', 'result': '安全に引き渡せるくらいには、あなたもコアを理解している。ひと季節のうちに、アイアンホールドの炉は誰も見たことのないエーテル細工を生み出す。' },
      'sell': { 'label': 'シンジケートに売る。', 'result': '大金が動いた。コアはあるべきでない場所で光り続け、鉱山に静けさが戻ることは二度とない。' }
    },
    'oracle': {
      'title': '沈んだ神託の巫女',
      'ask': 'この瞬間を一万回見ました。その半分であなたは私を解き放ち、半分では私の守るものを奪う。選びなさい。そしてようやく、この先を知らない私にしてください。',
      'free': { 'label': '鎖を断ち切る。', 'result': '巫女は水の中を昇り、姿を消した。エーテル結社はあなたをよく言うだろう。彼女の時の番人は残り、教えを授ける。' },
      'slay': { 'label': '彼女が守る砂時計を奪う。', 'result': '彼女は抗わない。時守の砂時計はあなたのものだ。最後の弟子は神殿から逃げ出し、結社はあなたを許さない。' }
    },
    'dragon': {
      'title': '虚無の竜',
      'ask': 'もうよい。牙を持っているな、小さき者よ。要塞の悪魔は我が同族を鎖につないだ。奴が燃えるのを見たい。我を殺すか、それとも我に手伝わせるか。',
      'slay': { 'label': '竜を討つ。', 'result': '竜が倒れ、山が震える。鉄の騎士団は竜殺しを歌にし、竜の財宝はあなたのものになる。' },
      'pact': { 'label': 'アークデーモンを倒す盟約を結ぶ。', 'result': '竜を説き伏せられる者はそういない。あなたが恐怖の要塞へ進むとき、竜は頭上の空にいる。' }
    },
    'throne': {
      'title': '空の玉座',
      'ask': 'アークデーモンは死に、玉座は空いている。そこに座る者が、要塞とその下の裂け目、そして両方の軍勢を従える。扉の前で三人の使者が待っている。',
      'order': { 'label': '玉座を鉄の騎士団に渡す。', 'result': '騎士団は要塞に兵を置き、封じられるものは封じる。王国は安全になる。そして、何をすべきか指図されるようになる。' },
      'syndicate': { 'label': '玉座を灰のシンジケートに渡す。', 'result': 'シンジケートは夜明け前に入りこむ。今では何もかもが売り物だ。平和さえも。' },
      'circle': { 'label': '玉座をエーテル結社に渡す。', 'result': '結社は要塞を、裂け目の上の学校に変える。彼らはそれを研究と呼ぶ。ほかの誰もが、時間の問題だと言う。' },
      'shatter': { 'label': '玉座を砕く。', 'result': 'あなたは自分の手で玉座を壊す。ここから支配する者はもう現れない。使者たちは何も言わずに去る。' },
      'claim': { 'label': '自分で座る。', 'result': '冷たい。そして、ぴったりだ。三つの勢力は、共通の敵ができたことに気づく。' }
    }
  },

  'enemy': {
    'goblin': 'ゴブリン',
    'goblinSlinger': 'ゴブリン投石兵',
    'bandit': '山賊',
    'banditArcher': '山賊の弓兵',
    'wolf': '狼',
    'banditChief': '山賊の頭',
    'goblinKing': 'ゴブリンキング',
    'treant': 'トレント',
    'spider': '大グモ',
    'broodSpider': '子グモ',
    'outlawCaptain': '無法者の隊長',
    'elderTreant': 'エルダートレント',
    'warlord': '戦将クラッグ',
    'fireElemental': 'ファイアエレメンタル',
    'ironGolem': 'アイアンゴーレム',
    'cultist': '教団員',
    'emberLord': '残り火の王',
    'ironColossus': 'アイアンコロッサス',
    'frostGiant': 'フロストジャイアント',
    'naga': 'ナーガ',
    'skeleton': 'スケルトン',
    'necromancer': 'ネクロマンサー',
    'frostJarl': '霜の族長',
    'nagaOracle': '沈んだ神託の巫女',
    'voidStalker': 'ヴォイドストーカー',
    'wyvern': 'ワイバーン',
    'highDemon': 'ハイデーモン',
    'voidWarden': '虚無の番人',
    'voidDragon': '虚無の竜',
    'doomKnight': 'ドゥームナイト',
    'imp': 'インプ',
    'archDemon': 'アークデーモン',
    'voidling': 'ヴォイドリング',
    'voidLord': '虚無の王',
    'orderGuard': '騎士団の審問官',
    'syndicateBlade': 'シンジケートの刺客'
  },

  'results': {
    'victory': '勝利！',
    'defeat': '敗北',
    'retreat': '撤退',
    'firstClear': '初クリア！',
    'waves': '生き残ったウェーブ：{n}',
    'levelUp': 'レベル{n}！',
    'points': '能力ポイント+{n}',
    'xp': '経験値',
    'gold': 'ゴールド',
    'lost': '失った分',
    'kills': '撃破数',
    'chests': '宝箱',
    'time': 'タイム',
    'unlocked': 'マップに追加：{places}',
    'retry': 'もう一度',
    'tip': '経験値と戦利品はそのまま残る。ポイントを振り、師範を訪ねて、強くなって戻ってこよう。'
  },
  'pause': {
    'title': 'ポーズ中',
    'resume': '再開',
    'controls': '操作方法',
    'retreat': 'マップへ撤退',
    'retreatNote': 'ここまでに得たものは残るが、ゾーンはクリアにならない。'
  },
  'ending': {
    'level': 'レベル',
    'more': '要塞の下で虚無の裂け目が開いた。コロシアムは今も挑戦者を待っている。',
    'order': { 'title': '鉄の平和', 'text': '恐怖の要塞に鉄の騎士団の旗がひるがえる。街道は安全で、掟は山ほどあり、門の上にはあなたの名が刻まれている。' },
    'syndicate': { 'title': '灰の取引', 'text': 'シンジケートは要塞の影から王国を治める。もう禁じられたものは何もない。ただ、高くつくだけだ。' },
    'circle': { 'title': 'エーテルの時代', 'text': '結社は捕らえた虚無の炎で要塞を照らす。門からは驚異があふれ出し、その代償を問う者はいない。' },
    'free': { 'title': '王はいらない', 'text': '玉座は砕け、要塞は空っぽだ。長い時代のなかで初めて、王国はそこに暮らす人々のものになった。' },
    'unbound': { 'title': '縛られざる者', 'text': 'あなたは玉座を手にした。騎士団、シンジケート、結社が手を組んで攻めてくる。来るなら来い。' },
    'note': {
      'goblinPact': 'ゴブリンの商人は今もサンフォードの広場で値切り合っている。',
      'goblinSlain': '洞穴は空っぽになり、隊商は時間どおりに走る。',
      'goblinRansom': 'ゴブリンキングはまた金持ちになり、また襲撃を始めた。',
      'oakhavenSaved': 'オークヘイヴンの城壁は高くなり、市場はにぎわいを増した。',
      'oakhavenFallen': 'オークヘイヴンの通りには雑草が生えている。闇市は大繁盛だ。',
      'coreOrder': 'アイアンホールドの鉱山は静かになり、ドワーフはまた掘りはじめた。',
      'coreCircle': 'アイアンホールドの炉は青く輝き、その銃は王国一だ。',
      'coreSold': 'どこかで、コアは今もうなっている。ゴーレムは今も歩いている。',
      'oracleFreed': '穏やかな日には、漁師たちがはるか沖に巫女の姿を見る。',
      'oracleSlain': '沈んだ神殿は静まり返っている。この先を知る者はもういない。',
      'dragonPact': '要塞の屋根に竜が巣を作った。竜が応える名はただひとつ。',
      'dragonSlain': '騎士団の大広間に竜の頭骨が飾られている。'
    }
  },

  'options': {
    'gameplay': 'ゲームプレイ',
    'title': '設定',
    'general': '一般',
    'audio': 'オーディオ',
    'language': '言語',
    'difficulty': '難易度',
    'soundEffects': '効果音',
    'music': '音楽',
    'mute': 'ミュート',
    'musicTrack': '楽曲',
    'musicTracks': {
      'cozy': '穏やか',
      'trance': '冒険'
    },
    'haptics': 'バイブレーション',
    'on': 'オン',
    'off': 'オフ',
    'close': '閉じる',
    'keyboard': {
      'auto': 'キーボード配列を自動検出',
      'layout': 'キーボード配列',
      'detected': '検出: {layout}',
      'bindings': 'キー割り当て',
      'press': 'キーを押してください…（Escでキャンセル）',
      'reset': 'キーをリセット'
    },
    'actions': {
      'up': '上へ移動',
      'down': '下へ移動',
      'left': '左へ移動',
      'right': '右へ移動',
      'skill1': 'スキル1',
      'skill2': 'スキル2',
      'skill3': 'スキル3',
      'skill4': 'スキル4',
      'skill5': 'スキル5',
      'skill6': 'スキル6',
      'potion': 'ポーションを飲む',
      'manaPotion': 'マナポーションを飲む',
      'leave': '勝利したエリアを去る',
      'interact': '話す',
      'target': '次のターゲット',
      'map': 'ワールドマップ',
      'character': 'ヒーロー',
      'inventory': 'バッグ',
      'skills': 'スキル'
    },
    'difficulties': {
      'easy': 'イージー',
      'medium': 'ノーマル',
      'hard': 'ハード'
    },
    'difficultyHints': {
      'easy': '敵の攻撃が弱く、倒れやすい。',
      'medium': '想定どおりの手ごたえ。',
      'hard': '敵がタフになり、攻撃も痛い。'
    }
  },
  'adsBlocked': {
    'title': '広告を表示できませんでした',
    'body': '動画を表示しようとしましたが、ブラウザの何かが広告をブロックしています。',
    'allowPrefix': '次のサイトで広告を許可してください：',
    'allowSuffix': '（またはこのゲームのみ広告ブロッカーを一時停止）してから再試行してください。',
    'gotIt': 'わかりました'
  },
  'saveStatus': {
    'restoredTitle': 'クラウドセーブを復元しました',
    'restoredBody': '復元ボーナス +{n} ゴールド',
    'tap': 'タップ',
    'pausedTitle': 'クラウド同期を一時停止中',
    'pausedBody': 'オフラインでプレイ中です。進行状況はここに保存されます。',
    'retry': '再試行',
    'dismiss': '閉じる'
  },
  'loading': {
    'tooLong': '読み込みが長すぎますか？ 広告ブロッカーを無効にして再読み込みしてください。'
  },
  'license': {
    'denied': 'アクセスが拒否されました：ライセンスをご購入ください。'
  },
  'leaderboard': {
    'title': 'ランキング',
    'rank': '#',
    'player': 'プレイヤー',
    'score': '経験値',
    'flair': 'レベル',
    'empty': 'まだ誰もランキングにいません。一番乗りしよう！',
    'failed': 'ランキングに接続できません。',
    'loading': '読み込み中…',
    'you': 'あなた',
    'yourRank': '{total} 人中 #{n} 位',
    'of': '/ {n}人中',
    'tabGlobal': '世界'
  }
}
