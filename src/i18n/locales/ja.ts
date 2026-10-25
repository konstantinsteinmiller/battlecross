// Japanese locale — mirrors the key shape of en.ts exactly.
export default {
  // ─── Afterplay phase 8: items, materials and capstones ───
  // ─── Afterplay phase 10: the prestige classes ───
  'prestige': { 'toast': { 'wanderer': "謎の放浪者が砦で待っている。" } },
  'relic': {
    'infernal': "{name}・業火",
    'set': "{item}と同時装備：",
    'heroicBadge': "英雄{n}",
    'heroic': "英雄{n}：{gold}ゴールド、魔硝子{glass}",
    'heroicIchor': "英雄{n}：{gold}ゴールド、魔硝子{glass}、イコル{ichor}",
    'heroicMax': "英雄ランクはすべて取得済み。",
    'infernalForge': "業火の鍛造：{gold}ゴールド、魔硝子{glass}",
    'lens': "神託者のレンズ：ここで{boss}が待つ。",
    'hydraKey': "封印されている。ヒュドラの炎の鍵が裂け目の心臓を開く。",
    'marksGlass': "攻城章{marks}で魔硝子{glass}を買う",
    'capstone': "極意",
    'fortOnly': "この極意はバスティオン・クロッシングでしか教わらない。"
  },
  // ─── The fort's fair games (afterplay §9) ───
  'fair': {
    'fee': "プレイ · {n}",
    'again': "もう一度",
    'noGold': "ゴールドが足りません。",
    'capped': "大賞が戻るまでにクリアするゾーン：{n}",
    'top': "大賞！ +{gold} ゴールド、+{xp} XP",
    'topGold': "大賞（ゴールドのみ）：+{n} ゴールド",
    'won': "勝ち！ +{n} ゴールド",
    'lost': "残念。連勝は最初から。",
    'row': "連勝：{n} / {max}",
    'mats': "英雄+素材 +{n}",
    'discount': "鍛冶屋の強化が {n}% 引きになった！"
  },
  'whack': {
    'title': "インプたたき",
    'lead': "30秒でインプを20匹たたこう。金の鎧のインプには手を出すな：たたくとライフが減る。",
    'hits': "インプ：{n} / {max}",
    'lives': "ライフ：{n}",
    'time': "時間：{n} 秒",
    'hint': "インプをタップ、または1〜9キー。",
    'barrel': "樽 {n}",
    'timeout': "時間切れ！",
    'dead': "ライフ切れ！"
  },
  'ring': {
    'title': "ヒドラの輪投げ",
    'lead': "長押しで力をため、離して投げる。首は揺れの真ん中近くでしか輪をとらない。続けて入れるたびに1点ずつ増える。",
    'hint': "テーブルで長押しして離す、またはスペース長押し。",
    'rings': "残りの輪：{n}",
    'score': "スコア：{n}",
    'hit': "入った！ +{n}",
    'miss': "外れ！",
    'perfect': "パーフェクト！",
    'nothing': "スコア {n}。今回は賞品なし。",
    'power': "力"
  },
  'arm': {
    'title': "腕相撲",
    'lead': "輪が円に重なった瞬間にタップして腕を押し倒そう。筋力でタイミングの幅が広がる。3連勝で鍛冶の割引、5連勝で英雄+素材。",
    'hint': "テーブルをタップ、またはスペース。",
    'good': "押せ！",
    'off': "リズムがずれた！"
  },
  // ─── The Siege of Bastion (afterplay §8) ───
  'siege': {
    'title': "バスティオン・クロッシング攻防戦",
    'lead': "10波のあいだ門を守り抜け。波の合間に攻城章で防備を整えよう。",
    'story': "大群が門に迫っている。10波を耐えろ。この最初の攻防戦で負けることはない。",
    'bell': "攻城の鐘が鳴る！大群が門の前に集まっている。",
    'mapBell': "攻防戦！",
    'start': "鐘を鳴らす",
    'wins': "勝利：{n}",
    'marksBank': "蓄えた攻城章：{n}",
    'tier': {
      'normal': "ノーマル",
      'hard': "ハード",
      'nightmare': "ナイトメア"
    },
    'tierDesc': {
      'normal': "敵はあなたより1レベル上。",
      'hard': "敵は3レベル上で、体力が30%多い。",
      'nightmare': "敵は6レベル上で、神話級エリートの波が2回来る。"
    },
    'locked': {
      'hard': "まずノーマルの攻防戦に勝とう。",
      'nightmare': "裂け目を封じるか、開けたままにすると解放される。"
    },
    'lord': "攻城の王",
    'hud': {
      'wave': "第{n}波/{total}",
      'marks': "攻城章：{n}",
      'gate': "門 {pct}%",
      'build': "第{n}波まで{s}秒",
      'ready': "準備完了！",
      'buy': "{name}：攻城章{n}"
    },
    'def': {
      'ballista': {
        'name': "バリスタ",
        'desc': "2秒ごとに自分のレーンへ貫通する矢を放つ。"
      },
      'cauldron': {
        'name': "火の大釜",
        'desc': "レーンの狭い場所を炎で包む。"
      },
      'barricade': {
        'name': "バリケード",
        'desc': "レーンを20秒間ふさぐ。"
      },
      'militia': {
        'name': "民兵",
        'desc': "2人の衛兵があなたと共に戦う。"
      },
      'repair': {
        'name': "門の修理",
        'desc': "門の4分の1を修復する。"
      }
    },
    'block': {
      'marks': "攻城章が足りない。",
      'full': "これ以上置けない。",
      'phase': "波の合間だけ。"
    },
    'toast': {
      'cleared': "第{n}波を退けた！ 攻城章+{marks}",
      'clearedUnharmed': "第{n}波を退け、門は無傷！ 攻城章+{marks}",
      'horn': "角笛が鳴る！ 門の耐久は残り{pct}%。",
      'ram': "破城槌だ！ 門に着く前に止めろ！",
      'rally': "立ち上がった！ 門を守れ！"
    },
    'banner': {
      'wave': "第{n}波",
      'final': "攻城の王！"
    },
    'result': {
      'tier': "バスティオン・クロッシング攻防戦：{tier}",
      'waves': "退けた波：{n}/{total}",
      'marks': "残した攻城章：{earned}のうち{banked}",
      'glass': "魔硝子：+{n}"
    },
    'milestone': {
      'normal1': "節目達成：バスティオンの旗。",
      'normal5': "節目達成：城壁守りの胸甲。",
      'hard1': "節目達成：古参の勘、5つ目のパッシブ枠。",
      'hard5': "節目達成：門砕き。",
      'nightmare1': "節目達成：最後の砦の冠。",
      'hardFlawless': "節目達成：隠されたクラス試練の鍵。"
    }
  },
  // ─── The Breaking (the afterplay's story) ───
  'breaking': {
    'title': "大いなる裂け目",
    'toast': {
      brk6: "鍛冶頭が鍛冶場を取り戻した。インファーナル鍛冶が解禁された。",
      brk7: "スフィンクスは倒れた。オラクルのレンズが、大いなる獣のありかを示す。",
      brk8: "リヴァイアサンは倒れた。その鱗があれば浅瀬を歩ける。",
      brk9: "ヒュドラは倒れた。その炎の鍵はあなたのものだ。",
      brk10: "古の竜は倒れた。裂け目が口を開けている。",
      sealed: "裂け目は封じられた。あなたは「裂け目を封じし者」となった。",
      ajar: "裂け目は少しだけ開いたまま。悪魔たちが城壁と闘技場を試しに来るだろう。",
      'brk2': "バスティオン・クロッシングが君を迎え入れた。人々は今、君を頼りにしている。",
      'rescued': "生存者を救出した！バスティオン・クロッシングで無事だ。",
      'brk3': "道が開けた。サンフォードの人々は無事だ。",
      'brk4': "薬草師が砦に加わった。",
      'brk5': "ケンタウロスの軍勢は崩れた。砦は包囲戦に備えている。",
    },
  },
  // ─── The intro (#130): its skip, and its narrator's name ───
  intro: {
    narrator: '語り部',
    skip: 'スキップ',
    holdKey: '{key}長押しでスキップ',
    holdTouch: '長押しでスキップ',
    replay: 'イントロを見る'
  },
  arena: {
    allWon: 'ミシックの賞品をすべて手に入れた。',
    call: '物語は語り終えた。今こそビルドを証明しよう。どこまでも勝ち上がり、ここでしか手に入らないミシックの賞品を勝ち取れ。',
    prize: '{item}を手に入れた！',
    milestone: 'ウェーブ{n}！',
    next: '次の賞品はウェーブ{at}：{item}',
    champion: 'チャンピオンウェーブ',
    wave: 'ウェーブ {n}'
  },
  sellOre: {
    talk: '良い鉱石だ、値は公正だよ。どれだけ売る？',
    lead: '鉱石ごとに売る数を選んでください。「売る」を押すまで何も売られません。',
    have: '所持 {n}',
    each: '1個 {n}ゴールド',
    none: 'なし',
    all: '全部',
    less: '{ore}を1つ減らす',
    more: '{ore}を1つ増やす',
    total: '受け取り：{n}ゴールド',
    sell: '売る',
    selectAll: 'すべて選択',
    empty: '売れる鉱石がもうありません。'
  },
  smith: {
    why: {
      max: '両方とも所持済み、最大まで鍛えてある。',
      gold: 'ゴールドが足りない。',
      ore: '鉱石が足りない。',
      metal: 'まずこの鉱石を採掘しよう。',
      learn: 'まず鍛冶屋に教わる必要がある。'
    },
    stamp: '鍛造品',
    take: '受け取る',
    worked: '{item}を+{n}まで鍛えた',
    made: '{item} +{n}',
    grade: {
      perfect: '完璧！',
      great: '見事な出来！',
      good: '良い出来',
      poor: '粗い出来'
    },
    hint: '輝きがホットスポットにある間に「打て」をタップ、またはスペースキーを押す。',
    strikes: '{n}/{max}打目',
    strike: '打て！',
    forge: '鍛造',
    gold: '{n}ゴールド',
    nuggets: '{ore}: {have}/{n}',
    master: '会心の一打で{item}になる。',
    locked: 'まず{ore}を採掘して、作れる品を覚えよう。',
    lead: '採掘した金属ごとに、作れる品がわかる。輝きが最も熱い所を打て。三打で品の出来が決まる。',
    talk: '熱い鉄は誰も待ってくれない。'
  },
  gameName: 'Battlecross',
  cancel: 'キャンセル',
  close: '閉じる',
  ok: '了解',
  continue: '続ける',
  onlyAvailableOn: 'このゲームは以下でのみプレイできます：',
  ui: {
    next: '次へ',
    replay: 'もう一度',
    back: '戻る',
    play: 'プレイ',
    pause: '一時停止',
    menu: 'メニュー',
    home: 'ホーム',
    info: '情報',
    help: '操作方法',
    ok: 'わかった',
    continue: '続ける'
  },
  hud: {
    level: 'Lv.{n}',
    health: '体力 {n}/{max}',
    mana: 'マナ {n}/{max}',
    heat: 'ヒート',
    xp: '経験値',
    gold: '{n} ゴールド',
    potion: '回復ポーション（残り{n}個）',
    manaPotion: 'マナポーション（残り{n}個）',
    potionStop: '回復薬を飲んで先へ進もう',
    groups: '敵グループ {n}/{total} 撃破',
    wave: 'ウェーブ {n} / {total}',
    roll: 'ローリング',
    elixir: '{name}（残り{n}個）',
    elixirNext: '次のエリクサー'
  },
  menu: {
    map: 'ワールドマップ',
    character: 'ヒーロー',
    skills: 'スキル',
    inventory: 'バッグ',
    journal: '日誌'
  },
  combat: {
    dodge: '回避',
    block: 'ブロック',
    immune: '無効'
  },
  level: {
    mine: '掘る',
    open: '開ける',
    guarded: '守られている',
    locked: 'ロック中',
    potion: 'ポーション +1',
    manaPotion: 'マナポーション +1',
    leave: '立ち去る',
    chestsLeft: 'まだ閉じた宝箱が{n}個ある'
  },
  status: {
    stun: 'スタン',
    knockup: '打ち上げ',
    knockdown: 'ダウン',
    stasis: 'ステイシス',
    petrify: '石化',
    frozen: '凍結',
    fear: '恐怖',
    slow: '鈍足',
    confuse: '混乱',
    taunt: '挑発',
    armorShred: 'アーマー破壊',
    weaken: '弱体',
    vulnerable: '脆弱',
    burn: '燃焼',
    poison: '毒',
    bleed: '出血',
    delayed: '遅延ダメージ',
    haste: 'ヘイスト',
    attackSpeed: '攻撃速度アップ',
    damageUp: '攻撃力アップ',
    defenseUp: '防御力アップ',
    regen: '再生',
    lifestealUp: 'ライフスティール',
    invulnerable: '無敵',
    unkillable: '不死',
    stealth: '潜伏',
    reflect: '反射',
    envenom: '毒の刃',
    exosuit: 'エクソスーツ',
    focus: '集中',
    accelerate: '加速',
    overheat: 'オーバーヒート',
    enrage: '激怒',
    ambush: '奇襲',
    elixirMight: '力のエリクサー',
    elixirIron: '鉄の肌',
    elixirSwift: '俊足',
    elixirMind: '明晰',
    elixirVigor: '活力',
    elixirShadow: '渇きの刃',
    chi: '気'
  },
  toast: {
    cageLocked: '鍵がかかっている。鍵はこの場所のどこかにあるはずだ。',
    cageKey: '鍵だ！きっと檻の鍵だ。',
    ore: '採掘した：{n} × {ore}',
    mineBusy: '敵が近くにいる！',
    pressureUp: '敵が手強くなった {skulls}',
    pressureDown: '敵の勢いが弱まった {skulls}',
    item: '入手：{item}',
    levelUp: 'レベル{level}！ 能力ポイント+3',
    boss: '{boss}が現れた',
    wave: 'ウェーブ {n}',
    herb: '摘んだ：{plant}',
    piece: '宝の地図のかけら！'
  },
  coach: {
    move: {
      touch: '地面をタップするとそこへ歩きます。スティックでも動けます。',
      mouse: '地面をクリックするとそこへ歩きます。移動キーでも動けます。'
    },
    target: {
      touch: '敵をタップするか、ヒーローから敵へドラッグして攻撃します。',
      mouse: '敵をクリックして攻撃します。'
    },
    skill: {
      touch: 'スキルをタップするとターゲットに使います。',
      mouse: 'スキルキーを押すとターゲットに使います。'
    },
    aim: {
      touch: 'スキルをフィールドへドラッグして狙い、指を離して発動します。',
      mouse: 'スキルをフィールドへドラッグして狙い、ボタンを離して発動します。'
    },
    potion: {
      touch: 'ポーションをタップして回復します。',
      mouse: 'ポーションキーを押して回復します。'
    },
    mana: {
      touch: '青いフラスコをタップしてマナを回復しよう。',
      mouse: 'マナポーションのキーを押してマナを回復しよう。'
    },
    chest: {
      touch: '宝箱をタップして開けよう。',
      mouse: '宝箱をクリックして開けよう。'
    },
    talk: {
      touch: '道しるべをたどって師範のところへ行き、タップして話しかけよう。',
      mouse: '道しるべをたどって師範のところへ行き、クリックして話しかけよう。'
    },
    teach: {
      touch: '「教えてくれ」をタップすると、この師匠が教えてくれるものが見られるよ。',
      mouse: '「教えてくれ」をクリックすると、この師匠が教えてくれるものが見られるよ。'
    },
    learn: {
      touch: 'スキルをタップして、「習得」をタップしよう。',
      mouse: 'スキルをクリックして、「習得」をクリックしよう。'
    },
    slot: {
      touch: '新しいスキルをタップして、スロットをタップすると戦いに持っていける。',
      mouse: '新しいスキルをスロットへドラッグすると戦いに持っていける。'
    },
    equip: {
      touch: '新しい装備をタップして緑と赤の数字を見比べ、スロットをタップして身につけよう。',
      mouse: '新しい装備をスロットへドラッグして身につけよう。緑の数字は上がり、赤は下がる。'
    },
    attr: {
      touch: '＋をタップして能力ポイントを使おう。',
      mouse: '＋をクリックして能力ポイントを使おう。'
    },
    travel: {
      touch: 'マップで次の場所をタップして、ボタンをタップすると向かえる。',
      mouse: 'マップで次の場所をクリックして、ボタンをクリックすると向かえる。'
    },
    buy: {
      touch: '品物をタップして値段を見て、「買う」をタップしよう。',
      mouse: '品物をクリックして値段を見て、「買う」をクリックしよう。'
    },
    exit: {
      touch: 'マップボタンをタップして、町を出て次の冒険へ向かおう。',
      mouse: 'マップボタンをクリックして、町を出て次の冒険へ向かおう。'
    },
    roll: {
      touch: 'ローリングボタンをタップして、危険をよけましょう。ローリング中は、何があっても傷つきません。',
      mouse: 'ローリングのキーを押して、危険をよけましょう。ローリング中は、何があっても傷つきません。'
    }
  },
  goal: {
    dummy: '訓練用のかかしを倒そう',
    clear: '{place}をクリアしよう',
    boss: '{foe}を倒そう',
    exit: '戦利品を持って出よう',
    wave: 'ウェーブを生き延びよう',
    trainer: '師範と話そう',
    learn: 'スキルを習得しよう',
    points: 'ポイントを使おう',
    leave: '{place}へ出発しよう',
    travel: '{place}へ向かおう',
    decide: '決断しよう',
    explore: '王国を探索しよう',
    fight: '戦いに勝とう',
    show: '道を教えて：{goal}',
    escort: '隊商を守ろう'
  },
  node: {
    'bastion': {
      'name': "バスティオン・クロッシング",
      'desc': "古い国境の砦。まだ立っている最後の城壁だ。生き残った者たちが集まっている。",
    },
    sunford: {
      name: 'サンフォード',
      desc: '平原のはずれにある農村。わが家と鍛冶屋、そして二人の師範がいる。'
    },
    plains: {
      name: 'サンフォード平原',
      desc: 'ゴブリンに狼、山賊が、街道をゆく隊商を狙っている。'
    },
    hollows: {
      name: 'ゴブリンの洞穴',
      desc: '丘の下に広がる洞窟。いちばん奥でゴブリンキングが待っている。'
    },
    arena: {
      name: 'コロシアム',
      desc: 'ウェーブを重ねるごとに手ごわくなる。どこまで登れる? ランキングは毎週月曜に更新。'
    },
    woods: {
      name: 'ささやきの森',
      desc: '歩きまわる古木と、そのあいだに巣を張るクモたち。'
    },
    outskirts: {
      name: 'オークヘイヴン郊外',
      desc: 'オークヘイヴンの外で農場が燃えている。戦将の軍勢が門に迫る。'
    },
    oakhaven: {
      name: 'オークヘイヴン',
      desc: '城壁に囲まれた交易の町。その行く末はあなた次第。'
    },
    crags: {
      name: '灰の岩山',
      desc: '黒い岩と燃えさかる炎。教団員たちが火をくべている。'
    },
    mines: {
      name: 'アイアンホールド鉱山',
      desc: 'ドワーフは深く掘りすぎて、光る何かを目覚めさせた。'
    },
    ironhold: {
      name: 'アイアンホールド',
      desc: '山の鍛冶の町。王国一の鋼はここで打たれる。'
    },
    tundra: {
      name: '凍傷のツンドラ',
      desc: '巨人が歩き、死者が眠らない白い荒野。'
    },
    temple: {
      name: '沈んだ神殿',
      desc: '水に沈んだナーガの広間と、すべての結末を見通す神託の巫女。'
    },
    citadel: {
      name: '虚無の城塞',
      desc: '去年はなかったはずの要塞。壁が低くうなっている。'
    },
    peak: {
      name: '竜の峰',
      desc: '山頂をワイバーンが舞う。そこには、はるかに大きな何かが眠っている。'
    },
    fortress: {
      name: '恐怖の要塞',
      desc: 'アークデーモンの居城。どの勢力も欲しがる玉座がある。'
    },
    rift: {
      name: '虚無の裂け目',
      desc: '悪魔たちがやって来た傷口。その向こうで虚無の王が待つ。'
    },
    silverbridge: {
      name: 'シルバーブリッジ',
      desc: '古い石橋の上にある、大きな川の町。全クラスの師匠がここで教えている。'
    }
  },
  map: {
    title: '王国',
    town: '町',
    levels: 'Lv.{min}–{max}',
    arenaBest: '最高：ウェーブ{n}',
    travel: '出発',
    again: '再挑戦',
    enter: '入る',
    fight: '戦う',
    back: '町へ戻る',
    locked: '隣のゾーンをクリアすると道が開く。',
    lockedArena: 'ゴブリンキングの件が片づくと門が開く。',
    lockedRift: '恐怖の要塞の玉座の行方が決まると開く。',
    invaded: '侵略中',
    invadedDesc: '悪魔がこの地を支配している。悪魔の柱は近くの敵の攻撃を強め、裂け目の傷跡は焼き、足を鈍らせる。ここで倒した敵はより多くの見返りをくれる。',
    lockedInvaded: '悪魔の支配が固い。まず{zone}を取り戻そう。',
    danger: {
      '1': 'あなたのレベルより少し上。',
      '2': '今のレベルでは危険。',
      '3': 'あなたのレベルよりはるかに上。'
    },
    questOpen: '{quest}：ここで決断が待っている。',
    questDone: '{quest}：{choice}',
    trainer: '隠れた師範：{cls}',
    new: '新',
    trueTest: '真の試練',
    skip: 'タップでスキップ',
    compass: {
      n: '北',
      e: '東',
      s: '南',
      w: '西'
    },
    region: {
      vale: '日だまりの谷',
      hills: 'ゴブリンの丘',
      peaks: '鉄の峰',
      ash: '灰の大地',
      frost: '霜の辺境',
      fields: '黄金の野',
      mere: 'ナーガの沼',
      reach: '虚無の果て',
      dread: '恐怖の地',
      sea: 'サファイアの海',
      bay: '商人の湾'
    },
    walkTouch: 'マップをタップしてそこへ歩こう。スティックでも操作できるよ',
    walkMouse: 'マップをクリックしてそこへ歩こう。WASDでも操作できるよ'
  },
  encounter: {
    kicker: '道中',
    title: {
      fight: '待ち伏せ！',
      elite: 'チャンピオンが行く手を阻む！',
      chest: '草むらに宝箱！',
      merchant: '旅の商人'
    },
    result: '{place}の近くの道中',
    gold: '+{n} ゴールド',
    xp: '+{n} 経験値'
  },
  travel: {
    to: '移動中：',
    loading: '読み込み中'
  },
  attr: {
    str: {
      name: '筋力',
      short: '筋力',
      desc: '近接攻撃力、ブロック率、重装備。'
    },
    dex: {
      name: '器用さ',
      short: '器用',
      desc: 'クリティカル、攻撃速度と移動速度。'
    },
    int: {
      name: '知力',
      short: '知力',
      desc: '魔法攻撃力、マナ、属性耐性。'
    },
    end: {
      name: '耐久力',
      short: '耐久',
      desc: '体力、自然回復、アーマー、スタン耐性。'
    },
    skl: {
      name: '技量',
      short: '技量',
      desc: 'クリティカルダメージ、クールダウン、遠距離武器。'
    },
    cha: {
      name: '魅力',
      short: '魅力',
      desc: 'ミニオン、店の値段、報酬、会話の選択肢。'
    }
  },
  stat: {
    damage: 'ダメージ',
    health: '体力',
    mana: 'マナ',
    armor: 'アーマー',
    resist: '耐性',
    crit: 'クリティカル率',
    critDamage: 'クリティカルDMG',
    attackSpeed: '攻撃速度',
    moveSpeed: '移動速度',
    cdr: 'クールダウン短縮',
    block: 'ブロック',
    dodge: '回避',
    hpRegen: '体力 / 秒'
  },
  sheet: {
    points: '残り{n}ポイント',
    raise: '{attr}を上げる',
    maxLevel: '最高レベルに到達',
    next: '次のポイント：'
  },
  heroChoice: {
    title: 'ヒーローをえらぼう',
    boy: '男の子であそぶ',
    girl: '女の子であそぶ',
    switch: 'きみのヒーロー'
  },
  skills: {
    active: 'アクティブスキル',
    passive: 'パッシブスキル',
    known: '習得済み',
    none: 'まだ何も覚えていない。町で師範を探そう。',
    emptySlot: '空きスロット{n}',
    equip: 'セット',
    remove: '外す',
    unmet: '必要条件を満たさなくなった。',
    how: 'スキルをタップして、スロットをタップ（またはドラッグ）。スロットから外へドラッグすると外せる。',
    howSlot: '次はスロットをタップしてセットしよう。',
    classCount: '{cls}：{total}個中{n}個習得',
    hint: {
      met: '{place}の{name}から習得できる。',
      unmet: '{place}の師範がこれを教えてくれる。'
    }
  },
  class: {
    // ── The prestige classes (afterplay phase 10) ──
    'demonhunter': { 'name': "デーモンハンター", 'desc': "影と聖なる光、ひとつの獲物に誓いを立てた者。悪魔に印を刻み、印された者は速やかに倒れる。" },
    'dragoon': { 'name': "ドラグーン", 'desc': "足元に風、腕に盾。空から跳びかかり、隊列ごと槍で貫く。" },
    'hexsmith': { 'name': "ヘクスミス", 'desc': "血で養うエーテルの技。敵の命を吸い、鍛冶師を癒やすタレットを築く。" },
    'tidecaller': { 'name': "タイドコーラー", 'desc': "氷と元素を海へ注ぐ者。敵を押し返し、ずぶ濡れにする波を操る。" },
    aegis: {
      name: 'イージスナイト',
      desc: '盾と聖なる鋼。仲間の代わりに攻撃を受け止める。'
    },
    shadow: {
      name: 'シャドウブレード',
      desc: '闇から現れ、背後から斬り、また消える。'
    },
    pyro: {
      name: 'パイロマンサー',
      desc: '炎がすべての答え。燃やして、それから爆発させる。'
    },
    sovereign: {
      name: 'グランドソブリン',
      desc: 'ひとりで戦う必要はない。衛兵を呼び出して指揮しよう。'
    },
    chrono: {
      name: 'クロノウィーバー',
      desc: '敵の時を止め、味方を加速し、失敗を巻き戻す。'
    },
    blood: {
      name: 'ブラッドアルケミスト',
      desc: '体力を払って力を得て、敵から吸い戻す。'
    },
    aether: {
      name: 'エーテルテック',
      desc: '銃とタレットとヒートゲージ。使えなくなる前に排熱を。'
    },
    geo: {
      name: 'ジオマンサー',
      desc: '壁とトゲを生み出し、大地そのものを割る。'
    },
    windrunner: {
      name: 'ウィンドランナー',
      desc: '弓と追い風。撃って、駆けて、決して止まらない。'
    },
    frostwarden: {
      name: 'フロストウォーデン',
      desc: '氷の刃と冷たい心。鈍らせ、凍らせ、そして砕く。'
    },
    lightbringer: {
      name: 'ライトブリンガー',
      desc: '仲間を癒やし、敵の目をくらませる光。その中に立てば、誰にも止められない。'
    },
    beastcaller: {
      name: 'ビーストコーラー',
      desc: 'オオカミの群れ、クマ、タカが共に戦う。呼び出して指揮しよう。'
    },
    elementalist: {
      name: 'エレメンタリスト',
      desc: '炎、氷、雷、岩。組み合わせれば、ひとつが次を引き起こす。'
    },
    soulwarden: {
      name: 'ソウルウォーデン',
      desc: '倒した敵が味方の魂としてよみがえり、共に戦ってから安らかに帰っていく。'
    },
    ironmonk: {
      name: 'アイアンモンク',
      desc: '素手と速い足。一撃ごとに気がたまる。すべてを強烈な一撃に込めよう。'
    },
    bard: {
      name: 'バード',
      desc: '味方を元気づける歌と、敵を眠らせたり同士討ちさせたりする旋律。'
    }
  },
  skill: {
    // ── The prestige classes (afterplay phase 10) ──
    'huntersMark': { 'name': "狩人の刻印", 'desc': "器用さの{dmg}%の聖なるボルト。{dur}秒間、標的が受けるダメージが{vuln}%増え、悪魔なら{demon}%増える。" },
    'demonsBane': { 'name': "悪魔の災い", 'desc': "悪魔へのダメージ+{bane}%、悪魔から受けるダメージ-{ward}%。" },
    'silverVolley': { 'name': "銀の斉射", 'desc': "一直線に銀のボルト：器用さの{dmg}%のダメージ。悪魔と刻印された敵には+{bane}%。" },
    'skyfallLeap': { 'name': "天墜跳躍", 'desc': "{air}秒間届かない高さへ跳び、その場へ落下：半径{radius}mに筋力の{dmg}%のダメージ、敵を転倒させる。" },
    'dragonBlood': { 'name': "竜の血", 'desc': "ボスへのダメージ+{boss}%、最大HP+{hp}%、何にも押し返されない。" },
    'dragonLance': { 'name': "竜槍", 'desc': "一直線の槍の突き：線上の敵すべてに器用さの{dmg}%のダメージ。" },
    'hexTurret': { 'name': "呪いのタレット", 'desc': "{dur}秒間タレットを築く。毎秒、半径{radius}m以内の最も近い敵から技量の{dmg}%のダメージで吸い取り、その{drain}%を回復する。" },
    'soulForge': { 'name': "魂の炉", 'desc': "最大HP+{hp}%、毎秒{regen}回復、受けるダメージ-{reduce}%。" },
    'hexBolt': { 'name': "呪いのボルト", 'desc': "HPを{hp}%支払う：技量の{dmg}%のボルト。その{heal}%を回復し、敵は{dur}秒間与えるダメージが{weak}%減る。" },
    'tidalWave': { 'name': "大津波", 'desc': "一直線の波：知力の{dmg}%のダメージ、敵を押し返しずぶ濡れにする（{dur}秒間{slow}%減速）。" },
    'seaborn': { 'name': "海より生まれし者", 'desc': "冷えた敵へのダメージ+{bonus}%、受けるダメージ-{reduce}%、移動速度+{move}%。" },
    'undertow': { 'name': "引き潮", 'desc': "{dur}秒間の渦潮：半径{radius}m内に合計で知力の{dmg}%のダメージ。敵を引き込み{slow}%減速させる。" },
    'bastionWall': { 'name': "砦の壁", 'desc': "{dur}秒間、{radius} m以内の敵はすべて自分を攻撃し、受けるダメージが{def}%減る。その後、光が力の{dmg}%+受けた攻撃の{back}%のダメージ。" },
    'thousandCuts': { 'name': "千の斬撃", 'desc': "{radius} m以内の敵の間を駆け、{hits}回斬りつける。1回ごとに器用さの{dmg}%のダメージ。ボスには1回しか当たらない。斬っている間は何も当たらない。" },
    'cinderSun': { 'name': "灰の太陽", 'desc': "死にゆく太陽が{dur}秒かけて砕ける：燃える欠片が{meteors}個、1個ごとに知力の{dmg}%のダメージ。" },
    'royalLegion': { 'name': "王の軍団", 'desc': "{dur}秒間、軍団を呼ぶ：弓兵{archers}人、衛兵{guards}人、戦闘魔術師{mages}人。" },
    'stoppedHour': { 'name': "止まった刻", 'desc': "{radius} m以内の刻を{dur}秒止める。再び動き出すと、敵それぞれに知力の{dmg}%のダメージ。" },
    'redCovenant': { 'name': "紅の契約", 'desc': "{radius} m以内の敵それぞれから生命の{pct}%を奪う。その{heal}%で回復する。" },
    'orbitalLance': { 'name': "軌道の槍", 'desc': "空からの光の槍が狙った場所を焼く：{dur}秒で技量の{dmg}%のダメージ。" },
    'tectonicHeart': { 'name': "地殻の心臓", 'desc': "大地の心臓が割れる：周囲すべてに力の{dmg}%のダメージ、瓦礫が{dur}秒間足を鈍らせる。" },
    'eyeOfTheGale': { 'name': "疾風の眼", 'desc': "{dur}秒間の矢の嵐：合計で技量の{dmg}%のダメージと{slow}%の減速。" },
    'endlessWinter': { 'name': "終わらぬ冬", 'desc': "終わらない冬が噴き出す：{radius} m以内に知力の{dmg}%のダメージ、全員を{freeze}秒凍らせる。" },
    'dawnbreak': { 'name': "夜明け", 'desc': "{dur}秒間、夜明けとなる：毎秒{radius} m以内に知力の{dmg}%のダメージ、体力{heal}%回復。" },
    'alphasCall': { 'name': "群れの長の呼び声", 'desc': "{wolves}匹の狼が応え、{dur}秒間共に駆ける。群れ全体のダメージ+{dmg}%、移動速度+{move}%。" },
    'prismStorm': { 'name': "プリズムストーム", 'desc': "{dur}秒間、四大元素が荒れ狂う：互いに誘発し合う知力{dmg}%の一撃が{strikes}回。" },
    'ferryman': { 'name': "渡し守", 'desc': "{dur}秒間、近くで倒れた敵はすべて自分の霊として蘇り、霊のダメージが{atk}%増える。" },
    'unmovingMountain': { 'name': "不動の山", 'desc': "気をすべて使う：山が落ちて器用さの{dmg}%のダメージ、気1つにつき+{per}%、敵を転倒させる。" },
    'encore': { 'name': "アンコール", 'desc': "もう一度{dur}秒間（速度・ダメージ・防御+{buff}%）、そして最後の和音：魅力の{dmg}%、敵は魅了される。" },
    kind: {
      active: 'アクティブ',
      passive: 'パッシブ'
    },
    cooldown: 'クールダウン{n}秒',
    mana: 'マナ{n}',
    hpCost: '体力{n}%',
    heat: 'ヒート+{n}',
    aimed: 'ドラッグで狙う',
    shieldSlam: {
      name: 'シールドスラム',
      desc: '盾を叩きつけ、筋力の{dmg}%のダメージを与えて{stun}秒スタンさせる。'
    },
    aegisAura: {
      name: 'イージスオーラ',
      desc: 'アーマー+{armor}%。受ける物理ダメージが{reduce}%減る。'
    },
    radiantStrike: {
      name: 'ラディアントストライク',
      desc: '筋力の{dmg}%のダメージを与える聖なる一撃。与えたダメージの{heal}%ぶん回復する。'
    },
    fortitude: {
      name: '不屈',
      desc: '体力の{hit}%を超える一撃を受けると、体力の{shield}%ぶんのシールドを{dur}秒得る。{icd}秒に1回。'
    },
    tauntingCry: {
      name: '挑発の雄叫び',
      desc: '{radius} m以内の敵が{dur}秒あなたを狙う。そのあいだ防御力+{def}%。'
    },
    holyBastion: {
      name: '聖なる砦',
      desc: '{dur}秒無敵になる。攻撃してきた敵にダメージの{reflect}%を跳ね返す。'
    },
    shadowstep: {
      name: 'シャドウステップ',
      desc: 'ターゲットの背後に現れ、器用さの{dmg}%のダメージで背中を刺す。'
    },
    lethality: {
      name: '必殺',
      desc: 'クリティカル率+{crit}%、クリティカルダメージ+{critDmg}%。'
    },
    venomousBlade: {
      name: '猛毒の刃',
      desc: '{dur}秒間、攻撃が毒を与える。{over}秒かけて器用さの{poison}%、最大{stacks}回重なる。'
    },
    evasion: {
      name: '見切り',
      desc: '回避率+{dodge}%。回避すると{dur}秒間ヘイスト{haste}%。'
    },
    smokeBomb: {
      name: '煙玉',
      desc: '{dur}秒姿を消す。潜伏からの次の攻撃はダメージ+{bonus}%。'
    },
    danceOfBlades: {
      name: '刃の舞',
      desc: '{radius} m以内の敵のあいだを駆け抜け、{hits}回斬る。1回ごとに器用さの{dmg}%のダメージ。ボスには1回しか当たらない。舞っているあいだは攻撃を受けない。'
    },
    fireball: {
      name: 'ファイアボール',
      desc: '火の玉が弾けて知力の{dmg}%のダメージ。さらに{burnDur}秒かけて{burn}%の燃焼ダメージ。'
    },
    cauterize: {
      name: '焼灼',
      desc: '燃焼中の敵から受けるダメージが{reduce}%減る。'
    },
    flamePillar: {
      name: 'フレイムピラー',
      desc: '狙った場所に火柱が噴き上がる。{dur}秒かけて知力の{dmg}%のダメージ。巻き込まれた敵は打ち上げられる。'
    },
    pyromaniac: {
      name: '炎狂い',
      desc: '魔法がクリティカルすると、炎スキルのクールダウンが{cut}秒縮む。'
    },
    combustion: {
      name: '爆燃',
      desc: '{radius} m以内の燃焼をすべて起爆。残りダメージの{pct}%が爆発として一気に入る。'
    },
    cataclysm: {
      name: 'カタクリズム',
      desc: '{dur}秒かけて隕石を{meteors}個呼ぶ。1個ごとに知力の{dmg}%のダメージ。'
    },
    royalGuard: {
      name: 'ロイヤルガード',
      desc: 'そばで戦う衛兵を呼び出す。魅力の{dmg}%のダメージで攻撃。同時に{max}体まで。'
    },
    inspiringPresence: {
      name: '鼓舞する威光',
      desc: 'ミニオンの攻撃速度が{speed}%上がり、体力が{hp}%増える。'
    },
    commandFocus: {
      name: '集中攻撃命令',
      desc: 'ミニオン全員がターゲットへ突撃。{dur}秒間、移動速度+{move}%、攻撃速度+{atk}%。'
    },
    sovereignsTribute: {
      name: '君主への貢ぎ物',
      desc: '受けるダメージの{share}%をミニオンが肩代わりする。'
    },
    bannerOfVictory: {
      name: '勝利の旗',
      desc: '{dur}秒間、旗を立てる。近くの味方はダメージ+{dmg}%、毎秒体力を{regen}%回復。'
    },
    armyOfTheRealm: {
      name: '王国の軍勢',
      desc: '弓兵{archers}人、衛兵{guards}人、戦闘魔道士1人を{dur}秒間呼び出す。'
    },
    temporalStasis: {
      name: 'テンポラルステイシス',
      desc: 'ターゲットの時を{dur}秒止める。行動できず、ダメージも受けない。'
    },
    hasteField: {
      name: 'ヘイストフィールド',
      desc: '{dur}秒間、自分と近くの味方の移動速度が{move}%、攻撃速度が{speed}%上がる。'
    },
    timeDistort: {
      name: '時のゆがみ',
      desc: '受けるダメージの{share}%が遅れて、{over}秒かけて入る。'
    },
    paradoxShift: {
      name: 'パラドックスシフト',
      desc: 'ターゲットと位置を入れ替える。知力の{dmg}%のダメージを与え、周りの敵を{confuse}秒混乱させる。'
    },
    entropy: {
      name: 'エントロピー',
      desc: 'スキルを使うたびにクールダウンが{cdr}%短くなる。最大{stacks}回重なる。'
    },
    chronoRewind: {
      name: 'クロノリワインド',
      desc: '{back}秒前にいた場所へ、その時の体力とマナで戻る。'
    },
    sanguineFlask: {
      name: '鮮血のフラスコ',
      desc: '自分の血のフラスコを投げる。範囲に耐久力の{dmg}%のダメージ、{shredDur}秒間アーマーを{shred}%破壊。'
    },
    bloodTransmutation: {
      name: '血の変成',
      desc: '受けた物理ダメージの{share}%がマナとして戻る。'
    },
    essenceHarvest: {
      name: '精気の収穫',
      desc: '{radius} m以内のすべての敵から吸い取り、知力の{dmg}%のダメージ。その{heal}%ぶん回復する。'
    },
    hemophilia: {
      name: '血の渇き',
      desc: 'ライフドレインが{drain}%強くなる。出血中の敵に当てると体力を{heal}%回復。'
    },
    mutagenicRage: {
      name: '変異の怒り',
      desc: '{dur}秒間：攻撃速度+{speed}%、ライフスティール+{steal}%、移動速度+{move}%。'
    },
    philosophersCrucible: {
      name: '賢者のるつぼ',
      desc: '{dur}秒間、煮えたぎる血の池を作る。中の敵に知力の{dmg}%のダメージ。自分が立っていると回復する。'
    },
    aetherPistol: {
      name: 'エーテルピストル',
      desc: '技量の{dmg}%のダメージの早撃ち。ヒートが{heat}たまる。'
    },
    deployTurret: {
      name: 'タレット設置',
      desc: '技量の{dmg}%のダメージで撃つタレットを{dur}秒間置く。同時に{max}台まで。'
    },
    ventHeat: {
      name: '排熱',
      desc: 'ヒートをすべて扇状に放出。技量の最大{dmg}%のダメージ。ヒートが多いほど強い。'
    },
    thermalOverload: {
      name: 'サーマルオーバーロード',
      desc: 'オーバーヒート中は射撃のクリティカルダメージ+{crit}%。ただしスキルは{lock}秒使えなくなる。'
    },
    orbitalBeam: {
      name: 'オービタルビーム',
      desc: '空からのビームが狙った場所を焼く。{dur}秒かけて技量の{dmg}%のダメージ。'
    },
    exoSuit: {
      name: 'エクソスーツ',
      desc: '{dur}秒間：アーマー+{armor}%。攻撃がロケットになり、範囲に技量の{rocket}%のダメージ。'
    },
    stoneSpike: {
      name: 'ストーンスパイク',
      desc: 'ターゲットの足元から岩のトゲが突き出す。筋力の{dmg}%のダメージ、{dur}秒間{slow}%鈍足。'
    },
    earthBarrier: {
      name: 'アースバリア',
      desc: '{dur}秒間、岩の壁を立てる。歩いても撃っても通れない。'
    },
    seismicShock: {
      name: 'サイズミックショック',
      desc: '地面を叩く。{radius} m以内に筋力の{dmg}%のダメージ、敵を{down}秒ダウンさせる。'
    },
    earthenSkin: {
      name: '大地の肌',
      desc: '筋力の{armor}%ぶんのアーマーを得る。受けるスタンが{cut}%短くなる。'
    },
    petrify: {
      name: '石化',
      desc: 'ターゲットを{dur}秒石に変える。石が砕けるとき、受けるダメージが{vuln}%増える。'
    },
    tectonicRupture: {
      name: 'テクトニックラプチャー',
      desc: '大地を引き裂く。近くのすべてに筋力の{dmg}%のダメージ。がれきが{dur}秒間鈍足にする。'
    },
    scales: '{attr}で強化',
    shieldThrow: {
      name: 'シールドスロー',
      desc: '盾が{bounces}体の敵に跳ね返り、それぞれ筋力の{dmg}%のダメージ。{dur}秒間、敵の与えるダメージが{weak}%減る。'
    },
    shieldShove: {
      name: 'シールドプッシュ',
      desc: '前方のすべてを押し出し、筋力の{dmg}%のダメージ。吹き飛ばされた敵は行動が止まる。'
    },
    holyChains: {
      name: '聖なる鎖',
      desc: '光の鎖が{radius} m以内の敵をすべて引き寄せる。耐久力の{dmg}%のダメージと{slow}%鈍足。'
    },
    bulwark: {
      name: '鉄壁',
      desc: 'ブロック率+{block}%。ブロックするたびに、攻撃してきた敵に{back}のダメージを返す。'
    },
    retribution: {
      name: '報復',
      desc: '{dur}秒間、{radius} m以内の敵はあなたを攻撃するしかない。その後、光が筋力の{dmg}%＋受けたダメージの{back}%を与える。'
    },
    unbreakable: {
      name: '不壊',
      desc: '体力が{hp}%未満のあいだ、受けるダメージが{reduce}%減る。'
    },
    starFan: {
      name: 'スターファン',
      desc: '影の星を{stars}個、扇状に投げる。それぞれ器用さの{dmg}%のダメージ。'
    },
    grapplingHook: {
      name: 'グラップリングフック',
      desc: 'ターゲットを引き寄せ、器用さの{dmg}%のダメージと{dur}秒間{slow}%鈍足。大きな敵には自分が引き寄せられる。'
    },
    silentStrike: {
      name: 'サイレントストライク',
      desc: '背後からの攻撃のダメージ+{backstab}%。敵があなたに気づくのが{notice}%遅くなる。'
    },
    shadowMark: {
      name: 'シャドウマーク',
      desc: 'ターゲットが受けるダメージが{dur}秒間{vuln}%増える。次に誰かに当てた攻撃はクリティカルになり、+{bonus}%。'
    },
    bladeRhythm: {
      name: '刃のリズム',
      desc: 'クリティカルのたびに全クールダウンが{cut}秒縮む。攻撃速度+{speed}%。'
    },
    nightshadeMist: {
      name: '夜影の毒霧',
      desc: '{dur}秒間、毒の霧を出す。器用さの最大{dmg}%のダメージ。霧に包まれた敵は{confuse}秒混乱する。'
    },
    firecracker: {
      name: '爆竹',
      desc: 'ターゲットに爆竹を貼りつける。{delay}秒後に弾けて知力の{dmg}%のダメージ、周りをすべて燃やす。'
    },
    fanTheFlames: {
      name: '炎あおり',
      desc: '{radius} m以内の燃焼がすべて{pct}%強く燃え上がり、最初からやり直す。{push} m以内の敵は吹き飛ばされる。'
    },
    ringOfFire: {
      name: '炎の輪',
      desc: '{dur}秒間、炎の輪が立ち上る。知力の最大{dmg}%のダメージ。中の敵は{slow}%鈍足。'
    },
    everflame: {
      name: '不滅の炎',
      desc: '燃焼が{burn}%強くなり、魔法のクリティカル率+{crit}%。'
    },
    wildfire: {
      name: '野火',
      desc: '燃焼中の敵を倒すと、その炎が{radius} m以内のすべての敵に{dur}秒間燃え移る。'
    },
    phoenixFlight: {
      name: '不死鳥の飛翔',
      desc: '炎の跡を残して不死鳥となって飛ぶ。着地点に知力の{dmg}%のダメージ。{dur}秒間、毎秒{regen}%回復。'
    },
    callArchers: {
      name: '弓兵召集',
      desc: '後ろから魅力の{dmg}%のダメージで撃つ弓兵を呼び出す。同時に{max}人まで。'
    },
    royalRally: {
      name: '王の集結',
      desc: 'ミニオンがそばに駆けつけ、体力を{heal}%回復。{dur}秒間、全員の防御力+{def}%。'
    },
    warMarshal: {
      name: '元帥',
      desc: 'ミニオンのダメージが{dmg}%増える。'
    },
    royalDecree: {
      name: '王の勅令',
      desc: '{radius} m以内の敵がひれ伏す。{stun}秒スタンし、その後{dur}秒間、受けるダメージが{vuln}%増える。'
    },
    loyalHearts: {
      name: '忠義の心',
      desc: 'ミニオンが1体倒れるたびに、体力を{heal}%回復する。'
    },
    summonChampion: {
      name: 'チャンピオン召喚',
      desc: '王国の勇者を{dur}秒間呼び出す。あなたの体力の{hp}%を持つ巨大な騎士で、魅力の{dmg}%で攻撃する。'
    },
    echoBolt: {
      name: 'エコーボルト',
      desc: '時の矢で知力の{dmg}%のダメージ。{delay}秒後にもう一度{echo}%のダメージ。'
    },
    foresight: {
      name: '先見',
      desc: '攻撃が来るのが一瞬早く見える。回避+{dodge}%、クールダウン{cdr}%短縮。'
    },
    timeBubble: {
      name: 'タイムバブル',
      desc: '{dur}秒間、時の遅い泡を作る。中の敵は{slow}%遅くなり、知力の{dmg}%のダメージを受ける。'
    },
    timeLoop: {
      name: 'タイムループ',
      desc: '{dur}秒後、ターゲットが元の場所に引き戻される。知力の{dmg}%のダメージに加え、失った体力の{echo}%。'
    },
    frozenMoment: {
      name: '凍てつく瞬間',
      desc: '攻撃が{chance}%の確率で、敵の時を{dur}秒止める。'
    },
    timeStop: {
      name: 'タイムストップ',
      desc: '{radius} m以内の時を{dur}秒止める。時が動き出すと、敵それぞれに知力の{dmg}%のダメージ。'
    },
    essenceWard: {
      name: '精気の守り',
      desc: '体力の{hp}%を、その{shield}%ぶんの光る守りに変える。{dur}秒間続く。'
    },
    vitalReserve: {
      name: '生命の蓄え',
      desc: '最大体力+{hp}%。毎秒体力を{regen}回復する。'
    },
    enfeeblingTonic: {
      name: '弱体の薬',
      desc: '薬を投げる。範囲に知力の{dmg}%のダメージ。当たった敵は{dur}秒間、与えるダメージが{weak}%減る。'
    },
    homunculus: {
      name: 'ホムンクルス',
      desc: '体力の{hp}%から泡立つ助っ人を{dur}秒間作る。新しく作ると、前の助っ人の命の{back}%が戻る。'
    },
    adrenalCatalyst: {
      name: 'アドレナリン触媒',
      desc: '体力が低いほどダメージが上がる。体力{low}%以下で最大+{dmg}%。'
    },
    grandTransmutation: {
      name: '大変成',
      desc: '{radius} m以内の敵の命の{pct}%を精気に変える。その{heal}%ぶん回復する。'
    },
    rocketJump: {
      name: 'ロケットジャンプ',
      desc: '飛び上がって狙った場所に着地。{radius} m以内に技量の{dmg}%のダメージ。ヒートが{heat}たまる。'
    },
    coolantLoop: {
      name: '冷却ループ',
      desc: 'ヒートが{cool}%速く下がり、スキルでたまるヒートが{cut}%減る。'
    },
    shockGrenade: {
      name: 'ショックグレネード',
      desc: 'グレネードを投げる。{radius} m以内に技量の{dmg}%のダメージと{stun}秒スタン。ヒートが{heat}たまる。'
    },
    precisionOptics: {
      name: '精密スコープ',
      desc: 'クリティカル率+{crit}%。射撃が敵を{pierce}体余分に貫通する。'
    },
    arcCoil: {
      name: 'アークコイル',
      desc: '雷がターゲットに当たり、さらに{jumps}体の敵へ跳ぶ。それぞれ技量の{dmg}%のダメージ。ヒートが{heat}たまる。'
    },
    thermalPlating: {
      name: '耐熱装甲',
      desc: 'ヒートが{heat}以上のあいだ、受けるダメージが{reduce}%減る。'
    },
    boulderRoll: {
      name: '大岩転がし',
      desc: '前に大岩を転がす。通り道のすべてに筋力の{dmg}%のダメージ、{down}秒ダウンさせる。'
    },
    bedrock: {
      name: '岩盤',
      desc: 'ノックバック、ダウン、打ち上げを受けない。最大体力+{hp}%。'
    },
    sinkhole: {
      name: 'シンクホール',
      desc: '地面が沈み、{dur}秒間敵を引きずり込んでから崩れ落ちる。筋力の{dmg}%のダメージ。'
    },
    mountainBreaker: {
      name: '山崩し',
      desc: 'ボスへのダメージ+{boss}%、アーマー+{armor}%。'
    },
    geodeShell: {
      name: '晶洞の殻',
      desc: '水晶の殻が{dur}秒間、体力の{shield}%ぶんのダメージを吸収し、その後弾けて筋力の最大{dmg}%のダメージ。'
    },
    crumble: {
      name: '崩壊',
      desc: '鈍足、ダウン、石化した敵へのダメージが{dmg}%増える。'
    },
    galeArrow: {
      name: '疾風の矢',
      desc: '突風に乗る矢。器用さの{dmg}%のダメージを与え、ターゲットを押し戻す。'
    },
    fleetfoot: {
      name: '韋駄天',
      desc: '移動速度+{move}%、回避+{dodge}%。'
    },
    zephyrDash: {
      name: 'そよ風ダッシュ',
      desc: '狙った方向へ最大{dist}mダッシュし、{dur}秒間{move}%速く走る。'
    },
    piercingGale: {
      name: '貫く疾風',
      desc: '一直線上の敵をすべて貫く矢。器用さの{dmg}%のダメージと、{dur}秒間{slow}%の鈍足。'
    },
    cycloneSnare: {
      name: '旋風の罠',
      desc: '{dur}秒間つむじ風が敵を中心へ引き寄せ、技量の{dmg}%のダメージを与える。'
    },
    keenEye: {
      name: '鷹の目',
      desc: 'クリティカルダメージ+{critDmg}%。射撃が敵を{pierce}体余分に貫通する。'
    },
    updraftLeap: {
      name: '上昇気流跳び',
      desc: '{radius}m以内の敵を突風で打ち上げ、器用さの{dmg}%のダメージ。自分は{leap}m跳びのく。'
    },
    swiftDraw: {
      name: '早撃ち',
      desc: '攻撃が{speed}%速くなり、クールダウンが{cdr}%短くなる。'
    },
    arrowStorm: {
      name: 'アローストーム',
      desc: '{dur}秒間、範囲に矢の雨。合計で技量の{dmg}%のダメージと{slow}%の鈍足。'
    },
    galeSpirits: {
      name: '風の精霊',
      desc: '{dur}秒間、風の精霊が一緒に飛び、技量の{dmg}%の矢を{shots}本放つ。移動速度+{move}%。'
    },
    skyHunter: {
      name: '天空の狩人',
      desc: 'ボスへのダメージ+{boss}%、クリティカル率+{crit}%。'
    },
    skyrender: {
      name: '天裂き',
      desc: '嵐の矢が道を切り裂く。一直線上の全員に器用さの{dmg}%のダメージを与え、上と横へ吹き飛ばす。'
    },
    frostCleave: {
      name: 'フロストクリーヴ',
      desc: '氷の刃で前方を薙ぎ払う。筋力の{dmg}%のダメージと、{dur}秒間{slow}%の鈍足。'
    },
    rimeLance: {
      name: '霧氷の槍',
      desc: '氷の槍を投げ、知力の{dmg}%のダメージ。{dur}秒間{slow}%の鈍足を与える。'
    },
    wintersBite: {
      name: '冬の牙',
      desc: '攻撃が敵を{dur}秒間{slow}%鈍足にする。'
    },
    frostArmor: {
      name: 'フロストアーマー',
      desc: '{dur}秒間、氷の鎧が知力の{shield}%のダメージを吸収。近くの敵は{slow}%鈍足になる。'
    },
    glacialCharge: {
      name: '氷河の突撃',
      desc: 'ターゲットに突撃して筋力の{dmg}%のダメージを与え、{freeze}秒凍結させる。'
    },
    frozenHeart: {
      name: '凍てつく心',
      desc: '最大体力+{hp}%。受けるダメージがすべて{reduce}%減る。'
    },
    rimeField: {
      name: '霧氷の大地',
      desc: '{dur}秒間、地面を凍らせて知力の{dmg}%のダメージ。鈍足の敵は{freeze}秒凍結する。'
    },
    frostShatter: {
      name: 'フロストシャター',
      desc: '{radius}m以内に筋力の{dmg}%のダメージ。鈍足の敵に+{chilled}%、凍結した敵に+{frozen}%。'
    },
    shatterpoint: {
      name: '砕きどころ',
      desc: '鈍足や凍結した敵に{bonus}%多くダメージを与える。'
    },
    avalancheLeap: {
      name: '雪崩跳び',
      desc: '狙った場所へ跳び、雪崩のように着地。筋力の{dmg}%のダメージを与え、敵をダウンさせる。'
    },
    iceborn: {
      name: '氷の申し子',
      desc: '押されることも吹き飛ばされることもない。受けるスタンが{cut}%短くなる。'
    },
    absoluteZero: {
      name: '絶対零度',
      desc: '冬が体からほとばしる。{radius}m以内に知力の{dmg}%のダメージを与え、全員を{freeze}秒凍結させる。'
    },
    sunbolt: {
      name: 'サンボルト',
      desc: '陽光の矢で知力の{dmg}%のダメージ。目がくらんだターゲットは{dur}秒間、与えるダメージが{weaken}%減る。'
    },
    mendingLight: {
      name: '癒やしの光',
      desc: '魅力の{heal}%をすぐに回復し、さらに{dur}秒間、毎秒体力の{regen}%を回復する。'
    },
    kindledHope: {
      name: '灯る希望',
      desc: '受ける回復がすべて{heal}%強くなる。'
    },
    lanceOfLight: {
      name: '光の槍',
      desc: '光線が一直線に知力の{dmg}%のダメージ。命中した敵1体ごとに体力を{heal}%回復。'
    },
    dawnShield: {
      name: '暁の盾',
      desc: '自分の悪い効果をすべて消し、{dur}秒間、魅力の{shield}%のシールドを得る。'
    },
    haloWard: {
      name: '光輪の守り',
      desc: '受けるダメージがすべて{reduce}%減る。'
    },
    dawnSanctuary: {
      name: '暁の聖域',
      desc: '{dur}秒間の聖なる大地。毎秒魅力の{heal}%を回復し、敵は知力の{dmg}%のダメージを受ける。'
    },
    blindingFlash: {
      name: '目くらまし',
      desc: '閃光。{radius}m以内の敵が{fear}秒逃げ出し、{dur}秒間、与えるダメージが{weaken}%減る。'
    },
    guardianLight: {
      name: '守護の光',
      desc: '倒されるはずの一撃を体力1で耐え、{dur}秒間無敵になる。{icd}秒に1回。'
    },
    sunfall: {
      name: 'サンフォール',
      desc: '陽光の柱がターゲットに落ち、知力の{dmg}%のダメージ。{dur}秒間、敵の受けるダメージが{vuln}%増える。'
    },
    searingLight: {
      name: '灼熱の光',
      desc: '魔法のクリティカル率+{crit}%、クリティカルダメージ+{critDmg}%。'
    },
    haloOfDawn: {
      name: '暁の光輪',
      desc: '{dur}秒間輝く。毎秒{radius}m以内に知力の{dmg}%のダメージを与え、体力を{heal}%回復。'
    },
    callWolf: {
      name: 'オオカミ召喚',
      desc: '精霊のオオカミが仲間になり、魅力の{dmg}%のダメージでかみつく。同時に{max}匹まで。'
    },
    wolfPounce: {
      name: 'オオカミの飛びかかり',
      desc: 'オオカミたちがターゲットに飛びかかる。それぞれ魅力の{dmg}%のダメージを与え、{down}秒ダウンさせる。'
    },
    wildKinship: {
      name: '野生の絆',
      desc: '仲間の体力が{hp}%増え、与えるダメージが{dmg}%増える。'
    },
    callHawk: {
      name: 'タカ召喚',
      desc: 'タカがターゲットに急降下し、魅力の{dmg}%のダメージ。{dur}秒間、受けるダメージが{vuln}%増える。{life}秒とどまる。'
    },
    callBear: {
      name: 'クマ召喚',
      desc: '精霊のクマが仲間になる。{dmg}%のダメージで攻撃し、敵を引きつける。{max}頭まで。'
    },
    thickHide: {
      name: '厚い毛皮',
      desc: '最大体力+{hp}%、毎秒の体力再生+{regen}。'
    },
    packBond: {
      name: '群れの絆',
      desc: '{dur}秒間、自分と{radius}m以内の仲間が毎秒体力を{regen}%回復し、防御力+{def}%。'
    },
    spiritStampede: {
      name: '精霊の大暴走',
      desc: '精霊の獣の群れが突進。一直線上に魅力の{dmg}%のダメージを与え、敵をダウンさせる。'
    },
    packTactics: {
      name: '群れの戦術',
      desc: '一緒にいる仲間1体ごとに与えるダメージが{bonus}%増える（最大{max}体）。'
    },
    alphaHowl: {
      name: '群れの長の遠吠え',
      desc: '仲間が{heal}%回復し、{dur}秒間{rage}%激しく戦う。近くの敵は逃げ出す。'
    },
    leaderOfThePack: {
      name: '群れのリーダー',
      desc: '仲間の攻撃が{speed}%速くなり、与えるダメージが{dmg}%増える。'
    },
    wildHunt: {
      name: 'ワイルドハント',
      desc: '{dur}秒間、オオカミが{wolves}匹増えて一緒に走る。群れ全体のダメージ+{dmg}%、移動が{move}%速くなる。'
    },
    prismBolt: {
      name: 'プリズムボルト',
      desc: '知力の{dmg}%のダメージの弾。燃えている敵には氷、それ以外には炎。互いに反応を起こす。'
    },
    elementalHarmony: {
      name: '属性の調和',
      desc: '反応（融解、蒸気、粉砕、過負荷、結晶）が{pct}%強くなる。'
    },
    frostLance: {
      name: 'フロストランス',
      desc: '一直線に氷が走る。知力の{dmg}%のダメージと、{dur}秒間{slow}%の鈍足。燃えている敵は蒸気反応。'
    },
    chainSpark: {
      name: '連鎖の火花',
      desc: '知力の{dmg}%の雷が、さらに{jumps}体の敵へ跳ぶ。氷は粉砕、炎は過負荷を起こす。'
    },
    smolderingCore: {
      name: 'くすぶる核',
      desc: '燃焼のダメージが{burn}%増え、マナが{mana}増える。'
    },
    rollingBoulder: {
      name: '転がる大岩',
      desc: '大岩が転がり出る。知力の{dmg}%のダメージと{down}秒のダウン。印のついた敵からシールドを得る。'
    },
    thunderSnow: {
      name: '雷雪',
      desc: '{dur}秒間の吹雪。知力の{dmg}%の氷ダメージに加え、毎秒{bolt}%の雷が落ちる。'
    },
    spellweave: {
      name: '呪文織り',
      desc: '魔法のクリティカル率+{crit}%。スキルのマナ消費が{mana}%減る。'
    },
    prismaticNova: {
      name: 'プリズムノヴァ',
      desc: '{radius}m以内のすべてに知力の{dmg}%のダメージ。それぞれ反応する属性で攻撃する。'
    },
    prismaticWard: {
      name: 'プリズムの守り',
      desc: '受けるダメージが{reduce}%減り、体力が{hp}%増える。'
    },
    frostfireComet: {
      name: '氷炎の彗星',
      desc: '炎と氷の彗星。知力の{dmg}%のダメージを与え、敵を燃焼と鈍足にする。'
    },
    elementalConvergence: {
      name: '四元素の収束',
      desc: '{dur}秒間、4つの属性が順番に攻撃。知力の{dmg}%の攻撃を{strikes}回、互いに反応を起こす。'
    },
    wispBolt: {
      name: 'ウィスプボルト',
      desc: 'ウィスプで知力の{dmg}%のダメージ。これで倒した敵は{life}秒間、あなたの精霊としてよみがえる。'
    },
    kindredSpirits: {
      name: '通じ合う魂',
      desc: '精霊とミニオンの体力が{hp}%増え、攻撃が{speed}%速くなる。'
    },
    callTheFallen: {
      name: '倒れし者の召喚',
      desc: '{radius}m以内で倒れたばかりの敵を最大{max}体、{life}秒間あなたの精霊としてよみがえらせる。'
    },
    soulBond: {
      name: '魂の絆',
      desc: '敵と仲良くなる。{chance}%（弱っていれば{low}%）の確率で{life}秒間精霊として仲間に。失敗なら{dmg}%のダメージ。'
    },
    restlessSouls: {
      name: 'さまよう魂',
      desc: '倒した敵が{chance}%の確率で、{life}秒間あなたの精霊としてよみがえる。'
    },
    spiritLantern: {
      name: '魂のランタン',
      desc: '{dur}秒間のランタン。光の中の敵は知力の{dmg}%のダメージ、味方は回復、倒れた者はよみがえる。'
    },
    hauntingWail: {
      name: '亡霊の叫び',
      desc: 'おばけの「ばあっ！」{radius}m以内に知力の{dmg}%のダメージ。敵は{fear}秒逃げ出す。'
    },
    wardensVigil: {
      name: '番人の見守り',
      desc: '精霊とミニオンの与えるダメージが{dmg}%増え、自分の受けるダメージが{reduce}%減る。'
    },
    releaseSouls: {
      name: '魂の解放',
      desc: '精霊たちが光となって家へ帰る。それぞれ周囲に知力の{dmg}%のダメージ、体力を{heal}%回復。'
    },
    lanternKeeper: {
      name: 'ランタンの守り手',
      desc: 'クールダウンが{cdr}%短くなり、スキルのマナ消費が{mana}%減る。'
    },
    wispSwarm: {
      name: 'ウィスプの群れ',
      desc: '{wisps}体のウィスプが範囲の敵に飛びかかり、合計で知力の{dmg}%のダメージ。倒した敵はよみがえる。'
    },
    processionOfSouls: {
      name: '魂の行列',
      desc: '{dur}秒間、近くで倒れた敵はすべてあなたの精霊としてよみがえる。精霊のダメージ+{atk}%。'
    },
    palmStrike: {
      name: '掌底',
      desc: 'すばやい掌底で器用さの{dmg}%のダメージを与え、敵を押し戻す。気が{chi}たまる。'
    },
    ironBody: {
      name: '鉄身',
      desc: '受ける物理ダメージが{reduce}%減り、体力が{hp}%増える。'
    },
    flyingKick: {
      name: '飛び蹴り',
      desc: 'ターゲットへ飛んで蹴り、器用さの{dmg}%のダメージ。途中の敵は{path}%。気が{chi}たまる。'
    },
    tigerStance: {
      name: '虎の構え',
      desc: '{dur}秒間、ダメージ+{dmg}%、攻撃速度+{speed}%。鶴の構えは解ける。'
    },
    craneStance: {
      name: '鶴の構え',
      desc: '{dur}秒間、防御力+{def}%、毎秒体力を{regen}%回復。虎の構えは解ける。'
    },
    flowingFists: {
      name: '流水の拳',
      desc: '攻撃が{chance}%の確率で気をためる。'
    },
    hundredFists: {
      name: '百裂拳',
      desc: '{hits}連打で合計、器用さの{dmg}%のダメージ。気が{chi}たまる。'
    },
    risingDragon: {
      name: '昇竜',
      desc: '気をすべて使うアッパー。器用さの{dmg}%のダメージ、気1つにつき+{per}%。敵は宙に舞う。'
    },
    cranesGrace: {
      name: '鶴の舞',
      desc: '回避+{dodge}%。受けるスタンとダウンが{cut}%短くなる。'
    },
    whirlwindKick: {
      name: '旋風脚',
      desc: '{radius}m以内のすべてを2回蹴り、合計で器用さの{dmg}%のダメージ。気が最大{chi}たまる。'
    },
    tigersFury: {
      name: '猛虎の怒り',
      desc: 'クリティカル率+{crit}%、攻撃速度+{speed}%。'
    },
    mountainPalm: {
      name: '山岳掌',
      desc: '気をすべて使う。巨大な掌が落ち、器用さの{dmg}%のダメージ、気1つにつき+{per}%。敵をダウンさせる。'
    },
    sharpNote: {
      name: '鋭い音色',
      desc: '鋭い音で魅力の{dmg}%のダメージ。敵は{dur}秒間、与えるダメージが{weaken}%減る。'
    },
    stagePresence: {
      name: '舞台の華',
      desc: 'スキルのマナ消費が{mana}%減り、移動が{move}%速くなる。'
    },
    marchingSong: {
      name: '行進曲',
      desc: '{dur}秒間の歌。自分と{radius}m以内の味方の移動が{move}%、攻撃が{speed}%速くなる。'
    },
    lullaby: {
      name: '子守歌',
      desc: '扇状に広がるやさしい調べ。届いた敵はすべて{dur}秒眠る。'
    },
    longRefrain: {
      name: '長いリフレイン',
      desc: '歌の効果が{pct}%長く続く。'
    },
    balladOfValor: {
      name: '勇気のバラード',
      desc: '{dur}秒間の歌。自分と{radius}m以内の味方のダメージが{dmg}%増え、防御力+{def}%。'
    },
    charmingSerenade: {
      name: '魅惑のセレナーデ',
      desc: 'ターゲットと{radius}m以内の敵を魅了。{dur}秒間、敵どうしで戦う。'
    },
    virtuoso: {
      name: '名演奏家',
      desc: 'クールダウンが{cdr}%短くなり、クリティカルダメージ+{critDmg}%。'
    },
    hymnOfMending: {
      name: '癒やしの賛歌',
      desc: '悪い効果を消し、{dur}秒間、自分と{radius}m以内の味方が毎秒体力を{regen}%回復。'
    },
    crescendo: {
      name: 'クレッシェンド',
      desc: '{radius}m以内に音の衝撃。魅力の{dmg}%のダメージ、演奏中の歌1曲ごとに+{per}%。'
    },
    standingOvation: {
      name: 'スタンディングオベーション',
      desc: 'ダメージ+{dmg}%、受けるダメージが{reduce}%減る。'
    },
    grandFinale: {
      name: 'グランドフィナーレ',
      desc: '{dur}秒間すべてを奏で（速度・ダメージ・防御力+{buff}%）、最後の和音で魅力の{dmg}%、敵を魅了。'
    }
  },
  slot: {
    main: '利き手',
    off: '逆の手',
    head: '頭',
    body: '鎧',
    hands: '手',
    feet: '足',
    trinket: '装飾品'
  },
  tier: {
    '7': 'ミシック',
    '1': 'コモン',
    '2': 'アンコモン',
    '3': 'レア',
    '4': 'エピック',
    '5': 'ヒロイック',
    '6': 'レジェンド'
  },
  weapon: {
    melee: '近接 · {attr}で強化',
    ranged: '遠距離 · {attr}で強化',
    magic: '魔法 · {attr}で強化'
  },
  source: {
    'siege': "バスティオン・クロッシング攻防戦で獲得。",
    'infernal': "業火の双子：侵略された{zone}で落ちるか、鍛冶屋が鍛える。",
    arena: 'コロシアムの勝ち抜き戦で勝ち取った品。',
    smith: '鍛冶場で鍛えられた品。',
    mob: '{zone}のモンスターが落とす。',
    chest: '{zone}の宝箱で見つかる。',
    boss: '{zone}のボスが落とす。',
    secret: '{zone}の隠し宝箱に眠っている。'
  },
  mod: {
    'demonBane': "悪魔へのダメージ+{n}%",
    'demonLeech': "悪魔に与えたダメージの{n}%で回復",
    'beastBane': "神話の獣へのダメージ+{n}%",
    'fireWard': "受ける炎ダメージ-{n}%",
    'shadowWard': "受ける闇ダメージ-{n}%",
    'demonWard': "悪魔から受けるダメージ-{n}%",
    'pylonBreaker': "悪魔の柱へのダメージ+{n}%",
    'glassFinder': "倒した悪魔が魔硝子を余分に落とす確率{n}%",
    'waterWalk': "水で足が遅くならない",
    str: '筋力+{n}',
    dex: '器用さ+{n}',
    int: '知力+{n}',
    end: '耐久力+{n}',
    skl: '技量+{n}',
    cha: '魅力+{n}',
    allAttrs: 'すべての能力+{n}',
    strOrDex: '筋力か器用さの高いほうに+{n}',
    armor: 'アーマー{n}',
    armorPct: 'アーマー+{n}%',
    armorFromStr: '筋力によるアーマー：+{n}%',
    block: 'ブロック率+{n}%',
    dodge: '回避率+{n}%',
    damageReduction: 'ダメージ軽減+{n}%',
    physReduction: '受ける物理ダメージ-{n}%',
    maxHp: '最大体力+{n}',
    maxHpPct: '最大体力+{n}%',
    maxMana: '最大マナ+{n}',
    hpRegen: '毎秒体力+{n}',
    stunDurationCut: '受けるスタンが{n}%短くなる',
    damagePct: '与えるダメージ+{n}%',
    critChance: 'クリティカル率+{n}%',
    critDamage: 'クリティカルダメージ+{n}%',
    spellCrit: '魔法クリティカル率+{n}%',
    attackSpeed: '攻撃速度+{n}%',
    moveSpeed: '移動速度+{n}%',
    cdr: 'クールダウンが{n}%短くなる',
    manaDiscount: '魔法のマナ消費-{n}%',
    lifesteal: 'すべてのダメージでライフスティール+{n}%',
    physLifesteal: '物理攻撃でライフスティール+{n}%',
    lifeDrainPct: 'ライフドレインが{n}%強くなる',
    bossDamage: 'ボスへのダメージ+{n}%',
    backstab: '背後攻撃ダメージ+{n}%',
    minionDamage: 'ミニオンのダメージ+{n}%',
    minionAttackSpeed: 'ミニオンの攻撃が{n}%速くなる',
    minionHp: 'ミニオンの体力+{n}%',
    burnOnHit: '攻撃が{n}ダメージの燃焼を与える',
    freezeOnHit: '攻撃が{n}%の確率で凍結させる',
    pierce: '弾がさらに{n}体の敵を貫通する',
    critCooldown: 'クリティカルで全クールダウンが{n}秒縮む',
    extraBlastEvery: '{n}発ごとにエネルギー弾を追加',
    reflectOnBlock: 'ブロックすると{n}ダメージを反射',
    fatalSave: '致命的なダメージを受ける代わりに{n}秒無敵になる（120秒に1回）',
    knockbackImmune: 'ノックバック無効',
    heatBuildCut: 'ヒートのたまりが{n}%遅くなる',
    heatDissipation: 'ヒートが{n}%速く冷める',
    flaskDamage: '鮮血のフラスコのダメージ+{n}%',
    igniteBonus: '炎の魔法の燃焼が{n}%強くなる',
    stealthy: '静かに動く：敵に気づかれる距離が{n}%縮む',
    fortitude: '大きな一撃を受けると体力{n}%のシールド',
    evasionHaste: '回避するとヘイスト{n}%',
    cauterize: '燃焼中の敵から受けるダメージ-{n}%',
    pyromaniac: '魔法クリティカルで炎のクールダウンが{n}秒縮む',
    tribute: 'ミニオンがあなたのダメージの{n}%を受ける',
    timeDistort: '受けるダメージの{n}%が遅れて入る',
    entropy: 'スキルを使うとクールダウンが{n}%縮む',
    bloodToMana: '受けた物理ダメージの{n}%がマナで戻る',
    bleedHeal: '出血中の敵に当てると体力{n}%回復',
    overheatCrit: 'オーバーヒート中クリティカルダメージ+{n}%',
    lowHealthDamage: '体力が減るほど最大+{n}%のダメージ',
    heatArmor: '熱が半分以上の間、受けるダメージ-{n}%',
    crumble: '減速・転倒・石化した敵へのダメージ+{n}%',
    lastStand: '体力30%未満で受けるダメージ-{n}%',
    wildfire: '燃えている敵が倒れると{n}m以内の敵に延焼',
    loyalty: '倒れた手下が体力を{n}%回復',
    chillOnHit: '通常攻撃が2秒間{n}%減速させる',
    chillDamage: '減速・凍結した敵へのダメージ+{n}%',
    healPower: '受ける回復量+{n}%',
    packDamage: '生存している仲間1体ごとにダメージ+{n}%（最大4体）',
    reactionDamage: '元素反応+{n}%',
    soulRise: '倒した敵が{n}%の確率であなたの霊として蘇る',
    chiOnHit: '攻撃が{n}%の確率で気を溜める',
    songLength: '歌の持続時間+{n}%'
  },
  item: {
    'chimeraMane': { 'name': "キマイラのたてがみ" },
    'triFang': { 'name': "トライファング" },
    'warchiefsLongbowGun': { 'name': "将軍のロングボウ銃" },
    'hoofbreakerGreaves': { 'name': "蹄砕きのグリーヴ" },
    'eyeOfTheDeep': { 'name': "深淵の眼" },
    'beamSplitter': { 'name': "ビームスプリッター" },
    'riddleCrown': { 'name': "謎かけの冠" },
    'sandglassWand': { 'name': "砂時計のワンド" },
    'leviathanScale': { 'name': "リヴァイアサンの鱗" },
    'tidecallerStaff': { 'name': "潮呼びの杖" },
    'hydraScaleGauntlets': { 'name': "ヒュドラ鱗の篭手" },
    'manyHeadedFlail': { 'name': "多頭のフレイル" },
    'heartOfTheElderDragon': { 'name': "古竜の心臓" },
    'dragonboneGreatsword': { 'name': "竜骨の大剣" },
    'bastionBanner': { 'name': "砦の軍旗" },
    'wallwardensPlate': { 'name': "城壁守りの鎧" },
    'gatebreaker': { 'name': "門砕き" },
    'crownOfTheLastBastion': { 'name': "最後の砦の冠" },
    heartOfTheArena: {
      name: '闘技場の心臓'
    },
    mantleOfTheUndefeated: {
      name: '不敗の鎧'
    },
    crimsonBulwark: {
      name: '真紅の大盾'
    },
    sandstriderGreaves: {
      name: '砂駆けの脛当て'
    },
    gripsOfTheGladiator: {
      name: '剣闘士の籠手'
    },
    laurelOfTheVictor: {
      name: '勝者の月桂冠'
    },
    smithMasterMithrilGreaves: {
      name: '名工のミスリルの脛当て'
    },
    smithMasterAdamantGreaves: {
      name: '名工のアダマントの脛当て'
    },
    smithMasterAetheriteGreaves: {
      name: '名工のエーテライトの脛当て'
    },
    smithMithrilGreaves: {
      name: 'ミスリルの脛当て'
    },
    smithAdamantGreaves: {
      name: 'アダマントの脛当て'
    },
    smithAetheriteGreaves: {
      name: 'エーテライトの脛当て'
    },
    smithMasterMithrilPlate: {
      name: '名工のミスリルのプレート'
    },
    smithMasterAdamantPlate: {
      name: '名工のアダマントのプレート'
    },
    smithMasterAetheritePlate: {
      name: '名工のエーテライトのプレート'
    },
    smithMithrilPlate: {
      name: 'ミスリルのプレート'
    },
    smithAdamantPlate: {
      name: 'アダマントのプレート'
    },
    smithAetheritePlate: {
      name: 'エーテライトのプレート'
    },
    smithMasterMithrilHelm: {
      name: '名工のミスリルの兜'
    },
    smithMasterAdamantHelm: {
      name: '名工のアダマントの兜'
    },
    smithMasterAetheriteHelm: {
      name: '名工のエーテライトの兜'
    },
    smithMithrilHelm: {
      name: 'ミスリルの兜'
    },
    smithAdamantHelm: {
      name: 'アダマントの兜'
    },
    smithAetheriteHelm: {
      name: 'エーテライトの兜'
    },
    smithMasterMithrilShield: {
      name: '名工のミスリルの盾'
    },
    smithMasterAdamantShield: {
      name: '名工のアダマントの盾'
    },
    smithMasterAetheriteShield: {
      name: '名工のエーテライトの盾'
    },
    smithMithrilShield: {
      name: 'ミスリルの盾'
    },
    smithAdamantShield: {
      name: 'アダマントの盾'
    },
    smithAetheriteShield: {
      name: 'エーテライトの盾'
    },
    smithMasterMithrilHammer: {
      name: '名工のミスリルの戦鎚'
    },
    smithMasterAdamantHammer: {
      name: '名工のアダマントの戦鎚'
    },
    smithMasterAetheriteHammer: {
      name: '名工のエーテライトの戦鎚'
    },
    smithMithrilHammer: {
      name: 'ミスリルの戦鎚'
    },
    smithAdamantHammer: {
      name: 'アダマントの戦鎚'
    },
    smithAetheriteHammer: {
      name: 'エーテライトの戦鎚'
    },
    smithMasterMithrilSword: {
      name: '名工のミスリルの剣'
    },
    smithMasterAdamantSword: {
      name: '名工のアダマントの剣'
    },
    smithMasterAetheriteSword: {
      name: '名工のエーテライトの剣'
    },
    smithMithrilSword: {
      name: 'ミスリルの剣'
    },
    smithAdamantSword: {
      name: 'アダマントの剣'
    },
    smithAetheriteSword: {
      name: 'エーテライトの剣'
    },
    smithMasterGoldGreaves: {
      name: '名工の金の脛当て'
    },
    smithGoldGreaves: {
      name: '金の脛当て'
    },
    smithMasterGoldPlate: {
      name: '名工の金のプレート'
    },
    smithGoldPlate: {
      name: '金のプレート'
    },
    smithMasterGoldHelm: {
      name: '名工の金の兜'
    },
    smithGoldHelm: {
      name: '金の兜'
    },
    smithMasterGoldShield: {
      name: '名工の金の盾'
    },
    smithGoldShield: {
      name: '金の盾'
    },
    smithMasterGoldHammer: {
      name: '名工の金の戦鎚'
    },
    smithGoldHammer: {
      name: '金の戦鎚'
    },
    smithMasterGoldSword: {
      name: '名工の金の剣'
    },
    smithGoldSword: {
      name: '金の剣'
    },
    smithMasterSilverGreaves: {
      name: '名工の銀の脛当て'
    },
    smithSilverGreaves: {
      name: '銀の脛当て'
    },
    smithMasterSilverPlate: {
      name: '名工の銀のプレート'
    },
    smithSilverPlate: {
      name: '銀のプレート'
    },
    smithMasterSilverHelm: {
      name: '名工の銀の兜'
    },
    smithSilverHelm: {
      name: '銀の兜'
    },
    smithMasterSilverShield: {
      name: '名工の銀の盾'
    },
    smithSilverShield: {
      name: '銀の盾'
    },
    smithMasterSilverHammer: {
      name: '名工の銀の戦鎚'
    },
    smithSilverHammer: {
      name: '銀の戦鎚'
    },
    smithMasterSilverSword: {
      name: '名工の銀の剣'
    },
    smithSilverSword: {
      name: '銀の剣'
    },
    smithMasterIronGreaves: {
      name: '名工の鉄の脛当て'
    },
    smithIronGreaves: {
      name: '鉄の脛当て'
    },
    smithMasterIronPlate: {
      name: '名工の鉄のプレート'
    },
    smithIronPlate: {
      name: '鉄のプレート'
    },
    smithMasterIronHelm: {
      name: '名工の鉄の兜'
    },
    smithIronHelm: {
      name: '鉄の兜'
    },
    smithMasterIronShield: {
      name: '名工の鉄の盾'
    },
    smithIronShield: {
      name: '鉄の盾'
    },
    smithMasterIronHammer: {
      name: '名工の鉄の戦鎚'
    },
    smithIronHammer: {
      name: '鉄の戦鎚'
    },
    smithMasterIronSword: {
      name: '名工の鉄の剣'
    },
    smithMasterDexIronSword: {
      name: '名工の鉄のダガー · 器用'
    },
    smithDexIronSword: {
      name: '鉄のダガー · 器用'
    },
    smithMasterDexIronHammer: {
      name: '名工の鉄のレイピア · 器用'
    },
    smithDexIronHammer: {
      name: '鉄のレイピア · 器用'
    },
    smithMasterDexIronShield: {
      name: '名工の鉄のバックラー · 器用'
    },
    smithDexIronShield: {
      name: '鉄のバックラー · 器用'
    },
    smithMasterDexIronHelm: {
      name: '名工の鉄のフード · 器用'
    },
    smithDexIronHelm: {
      name: '鉄のフード · 器用'
    },
    smithMasterDexIronPlate: {
      name: '名工の鉄の革鎧 · 器用'
    },
    smithDexIronPlate: {
      name: '鉄の革鎧 · 器用'
    },
    smithMasterDexIronGreaves: {
      name: '名工の鉄のブーツ · 器用'
    },
    smithDexIronGreaves: {
      name: '鉄のブーツ · 器用'
    },
    smithMasterDexSilverSword: {
      name: '名工の銀のダガー · 器用'
    },
    smithDexSilverSword: {
      name: '銀のダガー · 器用'
    },
    smithMasterDexSilverHammer: {
      name: '名工の銀のレイピア · 器用'
    },
    smithDexSilverHammer: {
      name: '銀のレイピア · 器用'
    },
    smithMasterDexSilverShield: {
      name: '名工の銀のバックラー · 器用'
    },
    smithDexSilverShield: {
      name: '銀のバックラー · 器用'
    },
    smithMasterDexSilverHelm: {
      name: '名工の銀のフード · 器用'
    },
    smithDexSilverHelm: {
      name: '銀のフード · 器用'
    },
    smithMasterDexSilverPlate: {
      name: '名工の銀の革鎧 · 器用'
    },
    smithDexSilverPlate: {
      name: '銀の革鎧 · 器用'
    },
    smithMasterDexSilverGreaves: {
      name: '名工の銀のブーツ · 器用'
    },
    smithDexSilverGreaves: {
      name: '銀のブーツ · 器用'
    },
    smithMasterDexGoldSword: {
      name: '名工の金のダガー · 器用'
    },
    smithDexGoldSword: {
      name: '金のダガー · 器用'
    },
    smithMasterDexGoldHammer: {
      name: '名工の金のレイピア · 器用'
    },
    smithDexGoldHammer: {
      name: '金のレイピア · 器用'
    },
    smithMasterDexGoldShield: {
      name: '名工の金のバックラー · 器用'
    },
    smithDexGoldShield: {
      name: '金のバックラー · 器用'
    },
    smithMasterDexGoldHelm: {
      name: '名工の金のフード · 器用'
    },
    smithDexGoldHelm: {
      name: '金のフード · 器用'
    },
    smithMasterDexGoldPlate: {
      name: '名工の金の革鎧 · 器用'
    },
    smithDexGoldPlate: {
      name: '金の革鎧 · 器用'
    },
    smithMasterDexGoldGreaves: {
      name: '名工の金のブーツ · 器用'
    },
    smithDexGoldGreaves: {
      name: '金のブーツ · 器用'
    },
    smithMasterDexMithrilSword: {
      name: '名工のミスリルのダガー · 器用'
    },
    smithMasterDexAdamantSword: {
      name: '名工のアダマントのダガー · 器用'
    },
    smithMasterDexAetheriteSword: {
      name: '名工のエーテライトのダガー · 器用'
    },
    smithDexMithrilSword: {
      name: 'ミスリルのダガー · 器用'
    },
    smithDexAdamantSword: {
      name: 'アダマントのダガー · 器用'
    },
    smithDexAetheriteSword: {
      name: 'エーテライトのダガー · 器用'
    },
    smithMasterDexMithrilHammer: {
      name: '名工のミスリルのレイピア · 器用'
    },
    smithMasterDexAdamantHammer: {
      name: '名工のアダマントのレイピア · 器用'
    },
    smithMasterDexAetheriteHammer: {
      name: '名工のエーテライトのレイピア · 器用'
    },
    smithDexMithrilHammer: {
      name: 'ミスリルのレイピア · 器用'
    },
    smithDexAdamantHammer: {
      name: 'アダマントのレイピア · 器用'
    },
    smithDexAetheriteHammer: {
      name: 'エーテライトのレイピア · 器用'
    },
    smithMasterDexMithrilShield: {
      name: '名工のミスリルのバックラー · 器用'
    },
    smithMasterDexAdamantShield: {
      name: '名工のアダマントのバックラー · 器用'
    },
    smithMasterDexAetheriteShield: {
      name: '名工のエーテライトのバックラー · 器用'
    },
    smithDexMithrilShield: {
      name: 'ミスリルのバックラー · 器用'
    },
    smithDexAdamantShield: {
      name: 'アダマントのバックラー · 器用'
    },
    smithDexAetheriteShield: {
      name: 'エーテライトのバックラー · 器用'
    },
    smithMasterDexMithrilHelm: {
      name: '名工のミスリルのフード · 器用'
    },
    smithMasterDexAdamantHelm: {
      name: '名工のアダマントのフード · 器用'
    },
    smithMasterDexAetheriteHelm: {
      name: '名工のエーテライトのフード · 器用'
    },
    smithDexMithrilHelm: {
      name: 'ミスリルのフード · 器用'
    },
    smithDexAdamantHelm: {
      name: 'アダマントのフード · 器用'
    },
    smithDexAetheriteHelm: {
      name: 'エーテライトのフード · 器用'
    },
    smithMasterDexMithrilPlate: {
      name: '名工のミスリルの革鎧 · 器用'
    },
    smithMasterDexAdamantPlate: {
      name: '名工のアダマントの革鎧 · 器用'
    },
    smithMasterDexAetheritePlate: {
      name: '名工のエーテライトの革鎧 · 器用'
    },
    smithDexMithrilPlate: {
      name: 'ミスリルの革鎧 · 器用'
    },
    smithDexAdamantPlate: {
      name: 'アダマントの革鎧 · 器用'
    },
    smithDexAetheritePlate: {
      name: 'エーテライトの革鎧 · 器用'
    },
    smithMasterDexMithrilGreaves: {
      name: '名工のミスリルのブーツ · 器用'
    },
    smithMasterDexAdamantGreaves: {
      name: '名工のアダマントのブーツ · 器用'
    },
    smithMasterDexAetheriteGreaves: {
      name: '名工のエーテライトのブーツ · 器用'
    },
    smithDexMithrilGreaves: {
      name: 'ミスリルのブーツ · 器用'
    },
    smithDexAdamantGreaves: {
      name: 'アダマントのブーツ · 器用'
    },
    smithDexAetheriteGreaves: {
      name: 'エーテライトのブーツ · 器用'
    },
    smithMasterIntIronSword: {
      name: '名工の鉄のワンド · 知力'
    },
    smithIntIronSword: {
      name: '鉄のワンド · 知力'
    },
    smithMasterIntIronHammer: {
      name: '名工の鉄のスタッフ · 知力'
    },
    smithIntIronHammer: {
      name: '鉄のスタッフ · 知力'
    },
    smithMasterIntIronShield: {
      name: '名工の鉄の魔導書 · 知力'
    },
    smithIntIronShield: {
      name: '鉄の魔導書 · 知力'
    },
    smithMasterIntIronHelm: {
      name: '名工の鉄のサークレット · 知力'
    },
    smithIntIronHelm: {
      name: '鉄のサークレット · 知力'
    },
    smithMasterIntIronPlate: {
      name: '名工の鉄のローブ · 知力'
    },
    smithIntIronPlate: {
      name: '鉄のローブ · 知力'
    },
    smithMasterIntIronGreaves: {
      name: '名工の鉄のブーツ · 知力'
    },
    smithIntIronGreaves: {
      name: '鉄のブーツ · 知力'
    },
    smithMasterIntSilverSword: {
      name: '名工の銀のワンド · 知力'
    },
    smithIntSilverSword: {
      name: '銀のワンド · 知力'
    },
    smithMasterIntSilverHammer: {
      name: '名工の銀のスタッフ · 知力'
    },
    smithIntSilverHammer: {
      name: '銀のスタッフ · 知力'
    },
    smithMasterIntSilverShield: {
      name: '名工の銀の魔導書 · 知力'
    },
    smithIntSilverShield: {
      name: '銀の魔導書 · 知力'
    },
    smithMasterIntSilverHelm: {
      name: '名工の銀のサークレット · 知力'
    },
    smithIntSilverHelm: {
      name: '銀のサークレット · 知力'
    },
    smithMasterIntSilverPlate: {
      name: '名工の銀のローブ · 知力'
    },
    smithIntSilverPlate: {
      name: '銀のローブ · 知力'
    },
    smithMasterIntSilverGreaves: {
      name: '名工の銀のブーツ · 知力'
    },
    smithIntSilverGreaves: {
      name: '銀のブーツ · 知力'
    },
    smithMasterIntGoldSword: {
      name: '名工の金のワンド · 知力'
    },
    smithIntGoldSword: {
      name: '金のワンド · 知力'
    },
    smithMasterIntGoldHammer: {
      name: '名工の金のスタッフ · 知力'
    },
    smithIntGoldHammer: {
      name: '金のスタッフ · 知力'
    },
    smithMasterIntGoldShield: {
      name: '名工の金の魔導書 · 知力'
    },
    smithIntGoldShield: {
      name: '金の魔導書 · 知力'
    },
    smithMasterIntGoldHelm: {
      name: '名工の金のサークレット · 知力'
    },
    smithIntGoldHelm: {
      name: '金のサークレット · 知力'
    },
    smithMasterIntGoldPlate: {
      name: '名工の金のローブ · 知力'
    },
    smithIntGoldPlate: {
      name: '金のローブ · 知力'
    },
    smithMasterIntGoldGreaves: {
      name: '名工の金のブーツ · 知力'
    },
    smithIntGoldGreaves: {
      name: '金のブーツ · 知力'
    },
    smithMasterIntMithrilSword: {
      name: '名工のミスリルのワンド · 知力'
    },
    smithMasterIntAdamantSword: {
      name: '名工のアダマントのワンド · 知力'
    },
    smithMasterIntAetheriteSword: {
      name: '名工のエーテライトのワンド · 知力'
    },
    smithIntMithrilSword: {
      name: 'ミスリルのワンド · 知力'
    },
    smithIntAdamantSword: {
      name: 'アダマントのワンド · 知力'
    },
    smithIntAetheriteSword: {
      name: 'エーテライトのワンド · 知力'
    },
    smithMasterIntMithrilHammer: {
      name: '名工のミスリルのスタッフ · 知力'
    },
    smithMasterIntAdamantHammer: {
      name: '名工のアダマントのスタッフ · 知力'
    },
    smithMasterIntAetheriteHammer: {
      name: '名工のエーテライトのスタッフ · 知力'
    },
    smithIntMithrilHammer: {
      name: 'ミスリルのスタッフ · 知力'
    },
    smithIntAdamantHammer: {
      name: 'アダマントのスタッフ · 知力'
    },
    smithIntAetheriteHammer: {
      name: 'エーテライトのスタッフ · 知力'
    },
    smithMasterIntMithrilShield: {
      name: '名工のミスリルの魔導書 · 知力'
    },
    smithMasterIntAdamantShield: {
      name: '名工のアダマントの魔導書 · 知力'
    },
    smithMasterIntAetheriteShield: {
      name: '名工のエーテライトの魔導書 · 知力'
    },
    smithIntMithrilShield: {
      name: 'ミスリルの魔導書 · 知力'
    },
    smithIntAdamantShield: {
      name: 'アダマントの魔導書 · 知力'
    },
    smithIntAetheriteShield: {
      name: 'エーテライトの魔導書 · 知力'
    },
    smithMasterIntMithrilHelm: {
      name: '名工のミスリルのサークレット · 知力'
    },
    smithMasterIntAdamantHelm: {
      name: '名工のアダマントのサークレット · 知力'
    },
    smithMasterIntAetheriteHelm: {
      name: '名工のエーテライトのサークレット · 知力'
    },
    smithIntMithrilHelm: {
      name: 'ミスリルのサークレット · 知力'
    },
    smithIntAdamantHelm: {
      name: 'アダマントのサークレット · 知力'
    },
    smithIntAetheriteHelm: {
      name: 'エーテライトのサークレット · 知力'
    },
    smithMasterIntMithrilPlate: {
      name: '名工のミスリルのローブ · 知力'
    },
    smithMasterIntAdamantPlate: {
      name: '名工のアダマントのローブ · 知力'
    },
    smithMasterIntAetheritePlate: {
      name: '名工のエーテライトのローブ · 知力'
    },
    smithIntMithrilPlate: {
      name: 'ミスリルのローブ · 知力'
    },
    smithIntAdamantPlate: {
      name: 'アダマントのローブ · 知力'
    },
    smithIntAetheritePlate: {
      name: 'エーテライトのローブ · 知力'
    },
    smithMasterIntMithrilGreaves: {
      name: '名工のミスリルのブーツ · 知力'
    },
    smithMasterIntAdamantGreaves: {
      name: '名工のアダマントのブーツ · 知力'
    },
    smithMasterIntAetheriteGreaves: {
      name: '名工のエーテライトのブーツ · 知力'
    },
    smithIntMithrilGreaves: {
      name: 'ミスリルのブーツ · 知力'
    },
    smithIntAdamantGreaves: {
      name: 'アダマントのブーツ · 知力'
    },
    smithIntAetheriteGreaves: {
      name: 'エーテライトのブーツ · 知力'
    },
    smithMasterSklIronSword: {
      name: '名工の鉄のピストル · 技量'
    },
    smithSklIronSword: {
      name: '鉄のピストル · 技量'
    },
    smithMasterSklIronHammer: {
      name: '名工の鉄のライフル · 技量'
    },
    smithSklIronHammer: {
      name: '鉄のライフル · 技量'
    },
    smithMasterSklIronShield: {
      name: '名工の鉄のバッテリー · 技量'
    },
    smithSklIronShield: {
      name: '鉄のバッテリー · 技量'
    },
    smithMasterSklIronHelm: {
      name: '名工の鉄のキャップ · 技量'
    },
    smithSklIronHelm: {
      name: '鉄のキャップ · 技量'
    },
    smithMasterSklIronPlate: {
      name: '名工の鉄のハーネス · 技量'
    },
    smithSklIronPlate: {
      name: '鉄のハーネス · 技量'
    },
    smithMasterSklIronGreaves: {
      name: '名工の鉄のブーツ · 技量'
    },
    smithSklIronGreaves: {
      name: '鉄のブーツ · 技量'
    },
    smithMasterSklSilverSword: {
      name: '名工の銀のピストル · 技量'
    },
    smithSklSilverSword: {
      name: '銀のピストル · 技量'
    },
    smithMasterSklSilverHammer: {
      name: '名工の銀のライフル · 技量'
    },
    smithSklSilverHammer: {
      name: '銀のライフル · 技量'
    },
    smithMasterSklSilverShield: {
      name: '名工の銀のバッテリー · 技量'
    },
    smithSklSilverShield: {
      name: '銀のバッテリー · 技量'
    },
    smithMasterSklSilverHelm: {
      name: '名工の銀のキャップ · 技量'
    },
    smithSklSilverHelm: {
      name: '銀のキャップ · 技量'
    },
    smithMasterSklSilverPlate: {
      name: '名工の銀のハーネス · 技量'
    },
    smithSklSilverPlate: {
      name: '銀のハーネス · 技量'
    },
    smithMasterSklSilverGreaves: {
      name: '名工の銀のブーツ · 技量'
    },
    smithSklSilverGreaves: {
      name: '銀のブーツ · 技量'
    },
    smithMasterSklGoldSword: {
      name: '名工の金のピストル · 技量'
    },
    smithSklGoldSword: {
      name: '金のピストル · 技量'
    },
    smithMasterSklGoldHammer: {
      name: '名工の金のライフル · 技量'
    },
    smithSklGoldHammer: {
      name: '金のライフル · 技量'
    },
    smithMasterSklGoldShield: {
      name: '名工の金のバッテリー · 技量'
    },
    smithSklGoldShield: {
      name: '金のバッテリー · 技量'
    },
    smithMasterSklGoldHelm: {
      name: '名工の金のキャップ · 技量'
    },
    smithSklGoldHelm: {
      name: '金のキャップ · 技量'
    },
    smithMasterSklGoldPlate: {
      name: '名工の金のハーネス · 技量'
    },
    smithSklGoldPlate: {
      name: '金のハーネス · 技量'
    },
    smithMasterSklGoldGreaves: {
      name: '名工の金のブーツ · 技量'
    },
    smithSklGoldGreaves: {
      name: '金のブーツ · 技量'
    },
    smithMasterSklMithrilSword: {
      name: '名工のミスリルのピストル · 技量'
    },
    smithMasterSklAdamantSword: {
      name: '名工のアダマントのピストル · 技量'
    },
    smithMasterSklAetheriteSword: {
      name: '名工のエーテライトのピストル · 技量'
    },
    smithSklMithrilSword: {
      name: 'ミスリルのピストル · 技量'
    },
    smithSklAdamantSword: {
      name: 'アダマントのピストル · 技量'
    },
    smithSklAetheriteSword: {
      name: 'エーテライトのピストル · 技量'
    },
    smithMasterSklMithrilHammer: {
      name: '名工のミスリルのライフル · 技量'
    },
    smithMasterSklAdamantHammer: {
      name: '名工のアダマントのライフル · 技量'
    },
    smithMasterSklAetheriteHammer: {
      name: '名工のエーテライトのライフル · 技量'
    },
    smithSklMithrilHammer: {
      name: 'ミスリルのライフル · 技量'
    },
    smithSklAdamantHammer: {
      name: 'アダマントのライフル · 技量'
    },
    smithSklAetheriteHammer: {
      name: 'エーテライトのライフル · 技量'
    },
    smithMasterSklMithrilShield: {
      name: '名工のミスリルのバッテリー · 技量'
    },
    smithMasterSklAdamantShield: {
      name: '名工のアダマントのバッテリー · 技量'
    },
    smithMasterSklAetheriteShield: {
      name: '名工のエーテライトのバッテリー · 技量'
    },
    smithSklMithrilShield: {
      name: 'ミスリルのバッテリー · 技量'
    },
    smithSklAdamantShield: {
      name: 'アダマントのバッテリー · 技量'
    },
    smithSklAetheriteShield: {
      name: 'エーテライトのバッテリー · 技量'
    },
    smithMasterSklMithrilHelm: {
      name: '名工のミスリルのキャップ · 技量'
    },
    smithMasterSklAdamantHelm: {
      name: '名工のアダマントのキャップ · 技量'
    },
    smithMasterSklAetheriteHelm: {
      name: '名工のエーテライトのキャップ · 技量'
    },
    smithSklMithrilHelm: {
      name: 'ミスリルのキャップ · 技量'
    },
    smithSklAdamantHelm: {
      name: 'アダマントのキャップ · 技量'
    },
    smithSklAetheriteHelm: {
      name: 'エーテライトのキャップ · 技量'
    },
    smithMasterSklMithrilPlate: {
      name: '名工のミスリルのハーネス · 技量'
    },
    smithMasterSklAdamantPlate: {
      name: '名工のアダマントのハーネス · 技量'
    },
    smithMasterSklAetheritePlate: {
      name: '名工のエーテライトのハーネス · 技量'
    },
    smithSklMithrilPlate: {
      name: 'ミスリルのハーネス · 技量'
    },
    smithSklAdamantPlate: {
      name: 'アダマントのハーネス · 技量'
    },
    smithSklAetheritePlate: {
      name: 'エーテライトのハーネス · 技量'
    },
    smithMasterSklMithrilGreaves: {
      name: '名工のミスリルのブーツ · 技量'
    },
    smithMasterSklAdamantGreaves: {
      name: '名工のアダマントのブーツ · 技量'
    },
    smithMasterSklAetheriteGreaves: {
      name: '名工のエーテライトのブーツ · 技量'
    },
    smithSklMithrilGreaves: {
      name: 'ミスリルのブーツ · 技量'
    },
    smithSklAdamantGreaves: {
      name: 'アダマントのブーツ · 技量'
    },
    smithSklAetheriteGreaves: {
      name: 'エーテライトのブーツ · 技量'
    },
    smithMasterChaIronSword: {
      name: '名工の鉄のセプター · 魅力'
    },
    smithChaIronSword: {
      name: '鉄のセプター · 魅力'
    },
    smithMasterChaIronHammer: {
      name: '名工の鉄のバナー · 魅力'
    },
    smithChaIronHammer: {
      name: '鉄のバナー · 魅力'
    },
    smithMasterChaIronShield: {
      name: '名工の鉄の法典 · 魅力'
    },
    smithChaIronShield: {
      name: '鉄の法典 · 魅力'
    },
    smithMasterChaIronHelm: {
      name: '名工の鉄の王冠 · 魅力'
    },
    smithChaIronHelm: {
      name: '鉄の王冠 · 魅力'
    },
    smithMasterChaIronPlate: {
      name: '名工の鉄のタバード · 魅力'
    },
    smithChaIronPlate: {
      name: '鉄のタバード · 魅力'
    },
    smithMasterChaIronGreaves: {
      name: '名工の鉄のブーツ · 魅力'
    },
    smithChaIronGreaves: {
      name: '鉄のブーツ · 魅力'
    },
    smithMasterChaSilverSword: {
      name: '名工の銀のセプター · 魅力'
    },
    smithChaSilverSword: {
      name: '銀のセプター · 魅力'
    },
    smithMasterChaSilverHammer: {
      name: '名工の銀のバナー · 魅力'
    },
    smithChaSilverHammer: {
      name: '銀のバナー · 魅力'
    },
    smithMasterChaSilverShield: {
      name: '名工の銀の法典 · 魅力'
    },
    smithChaSilverShield: {
      name: '銀の法典 · 魅力'
    },
    smithMasterChaSilverHelm: {
      name: '名工の銀の王冠 · 魅力'
    },
    smithChaSilverHelm: {
      name: '銀の王冠 · 魅力'
    },
    smithMasterChaSilverPlate: {
      name: '名工の銀のタバード · 魅力'
    },
    smithChaSilverPlate: {
      name: '銀のタバード · 魅力'
    },
    smithMasterChaSilverGreaves: {
      name: '名工の銀のブーツ · 魅力'
    },
    smithChaSilverGreaves: {
      name: '銀のブーツ · 魅力'
    },
    smithMasterChaGoldSword: {
      name: '名工の金のセプター · 魅力'
    },
    smithChaGoldSword: {
      name: '金のセプター · 魅力'
    },
    smithMasterChaGoldHammer: {
      name: '名工の金のバナー · 魅力'
    },
    smithChaGoldHammer: {
      name: '金のバナー · 魅力'
    },
    smithMasterChaGoldShield: {
      name: '名工の金の法典 · 魅力'
    },
    smithChaGoldShield: {
      name: '金の法典 · 魅力'
    },
    smithMasterChaGoldHelm: {
      name: '名工の金の王冠 · 魅力'
    },
    smithChaGoldHelm: {
      name: '金の王冠 · 魅力'
    },
    smithMasterChaGoldPlate: {
      name: '名工の金のタバード · 魅力'
    },
    smithChaGoldPlate: {
      name: '金のタバード · 魅力'
    },
    smithMasterChaGoldGreaves: {
      name: '名工の金のブーツ · 魅力'
    },
    smithChaGoldGreaves: {
      name: '金のブーツ · 魅力'
    },
    smithMasterChaMithrilSword: {
      name: '名工のミスリルのセプター · 魅力'
    },
    smithMasterChaAdamantSword: {
      name: '名工のアダマントのセプター · 魅力'
    },
    smithMasterChaAetheriteSword: {
      name: '名工のエーテライトのセプター · 魅力'
    },
    smithChaMithrilSword: {
      name: 'ミスリルのセプター · 魅力'
    },
    smithChaAdamantSword: {
      name: 'アダマントのセプター · 魅力'
    },
    smithChaAetheriteSword: {
      name: 'エーテライトのセプター · 魅力'
    },
    smithMasterChaMithrilHammer: {
      name: '名工のミスリルのバナー · 魅力'
    },
    smithMasterChaAdamantHammer: {
      name: '名工のアダマントのバナー · 魅力'
    },
    smithMasterChaAetheriteHammer: {
      name: '名工のエーテライトのバナー · 魅力'
    },
    smithChaMithrilHammer: {
      name: 'ミスリルのバナー · 魅力'
    },
    smithChaAdamantHammer: {
      name: 'アダマントのバナー · 魅力'
    },
    smithChaAetheriteHammer: {
      name: 'エーテライトのバナー · 魅力'
    },
    smithMasterChaMithrilShield: {
      name: '名工のミスリルの法典 · 魅力'
    },
    smithMasterChaAdamantShield: {
      name: '名工のアダマントの法典 · 魅力'
    },
    smithMasterChaAetheriteShield: {
      name: '名工のエーテライトの法典 · 魅力'
    },
    smithChaMithrilShield: {
      name: 'ミスリルの法典 · 魅力'
    },
    smithChaAdamantShield: {
      name: 'アダマントの法典 · 魅力'
    },
    smithChaAetheriteShield: {
      name: 'エーテライトの法典 · 魅力'
    },
    smithMasterChaMithrilHelm: {
      name: '名工のミスリルの王冠 · 魅力'
    },
    smithMasterChaAdamantHelm: {
      name: '名工のアダマントの王冠 · 魅力'
    },
    smithMasterChaAetheriteHelm: {
      name: '名工のエーテライトの王冠 · 魅力'
    },
    smithChaMithrilHelm: {
      name: 'ミスリルの王冠 · 魅力'
    },
    smithChaAdamantHelm: {
      name: 'アダマントの王冠 · 魅力'
    },
    smithChaAetheriteHelm: {
      name: 'エーテライトの王冠 · 魅力'
    },
    smithMasterChaMithrilPlate: {
      name: '名工のミスリルのタバード · 魅力'
    },
    smithMasterChaAdamantPlate: {
      name: '名工のアダマントのタバード · 魅力'
    },
    smithMasterChaAetheritePlate: {
      name: '名工のエーテライトのタバード · 魅力'
    },
    smithChaMithrilPlate: {
      name: 'ミスリルのタバード · 魅力'
    },
    smithChaAdamantPlate: {
      name: 'アダマントのタバード · 魅力'
    },
    smithChaAetheritePlate: {
      name: 'エーテライトのタバード · 魅力'
    },
    smithMasterChaMithrilGreaves: {
      name: '名工のミスリルのブーツ · 魅力'
    },
    smithMasterChaAdamantGreaves: {
      name: '名工のアダマントのブーツ · 魅力'
    },
    smithMasterChaAetheriteGreaves: {
      name: '名工のエーテライトのブーツ · 魅力'
    },
    smithChaMithrilGreaves: {
      name: 'ミスリルのブーツ · 魅力'
    },
    smithChaAdamantGreaves: {
      name: 'アダマントのブーツ · 魅力'
    },
    smithChaAetheriteGreaves: {
      name: 'エーテライトのブーツ · 魅力'
    },
    smithMasterEndIronSword: {
      name: '名工の鉄のメイス · 耐久'
    },
    smithEndIronSword: {
      name: '鉄のメイス · 耐久'
    },
    smithMasterEndIronHammer: {
      name: '名工の鉄の斧 · 耐久'
    },
    smithEndIronHammer: {
      name: '鉄の斧 · 耐久'
    },
    smithMasterEndIronShield: {
      name: '名工の鉄の盾 · 耐久'
    },
    smithEndIronShield: {
      name: '鉄の盾 · 耐久'
    },
    smithMasterEndIronHelm: {
      name: '名工の鉄の兜 · 耐久'
    },
    smithEndIronHelm: {
      name: '鉄の兜 · 耐久'
    },
    smithMasterEndIronPlate: {
      name: '名工の鉄のプレート · 耐久'
    },
    smithEndIronPlate: {
      name: '鉄のプレート · 耐久'
    },
    smithMasterEndIronGreaves: {
      name: '名工の鉄の脛当て · 耐久'
    },
    smithEndIronGreaves: {
      name: '鉄の脛当て · 耐久'
    },
    smithMasterEndSilverSword: {
      name: '名工の銀のメイス · 耐久'
    },
    smithEndSilverSword: {
      name: '銀のメイス · 耐久'
    },
    smithMasterEndSilverHammer: {
      name: '名工の銀の斧 · 耐久'
    },
    smithEndSilverHammer: {
      name: '銀の斧 · 耐久'
    },
    smithMasterEndSilverShield: {
      name: '名工の銀の盾 · 耐久'
    },
    smithEndSilverShield: {
      name: '銀の盾 · 耐久'
    },
    smithMasterEndSilverHelm: {
      name: '名工の銀の兜 · 耐久'
    },
    smithEndSilverHelm: {
      name: '銀の兜 · 耐久'
    },
    smithMasterEndSilverPlate: {
      name: '名工の銀のプレート · 耐久'
    },
    smithEndSilverPlate: {
      name: '銀のプレート · 耐久'
    },
    smithMasterEndSilverGreaves: {
      name: '名工の銀の脛当て · 耐久'
    },
    smithEndSilverGreaves: {
      name: '銀の脛当て · 耐久'
    },
    smithMasterEndGoldSword: {
      name: '名工の金のメイス · 耐久'
    },
    smithEndGoldSword: {
      name: '金のメイス · 耐久'
    },
    smithMasterEndGoldHammer: {
      name: '名工の金の斧 · 耐久'
    },
    smithEndGoldHammer: {
      name: '金の斧 · 耐久'
    },
    smithMasterEndGoldShield: {
      name: '名工の金の盾 · 耐久'
    },
    smithEndGoldShield: {
      name: '金の盾 · 耐久'
    },
    smithMasterEndGoldHelm: {
      name: '名工の金の兜 · 耐久'
    },
    smithEndGoldHelm: {
      name: '金の兜 · 耐久'
    },
    smithMasterEndGoldPlate: {
      name: '名工の金のプレート · 耐久'
    },
    smithEndGoldPlate: {
      name: '金のプレート · 耐久'
    },
    smithMasterEndGoldGreaves: {
      name: '名工の金の脛当て · 耐久'
    },
    smithEndGoldGreaves: {
      name: '金の脛当て · 耐久'
    },
    smithMasterEndMithrilSword: {
      name: '名工のミスリルのメイス · 耐久'
    },
    smithMasterEndAdamantSword: {
      name: '名工のアダマントのメイス · 耐久'
    },
    smithMasterEndAetheriteSword: {
      name: '名工のエーテライトのメイス · 耐久'
    },
    smithEndMithrilSword: {
      name: 'ミスリルのメイス · 耐久'
    },
    smithEndAdamantSword: {
      name: 'アダマントのメイス · 耐久'
    },
    smithEndAetheriteSword: {
      name: 'エーテライトのメイス · 耐久'
    },
    smithMasterEndMithrilHammer: {
      name: '名工のミスリルの斧 · 耐久'
    },
    smithMasterEndAdamantHammer: {
      name: '名工のアダマントの斧 · 耐久'
    },
    smithMasterEndAetheriteHammer: {
      name: '名工のエーテライトの斧 · 耐久'
    },
    smithEndMithrilHammer: {
      name: 'ミスリルの斧 · 耐久'
    },
    smithEndAdamantHammer: {
      name: 'アダマントの斧 · 耐久'
    },
    smithEndAetheriteHammer: {
      name: 'エーテライトの斧 · 耐久'
    },
    smithMasterEndMithrilShield: {
      name: '名工のミスリルの盾 · 耐久'
    },
    smithMasterEndAdamantShield: {
      name: '名工のアダマントの盾 · 耐久'
    },
    smithMasterEndAetheriteShield: {
      name: '名工のエーテライトの盾 · 耐久'
    },
    smithEndMithrilShield: {
      name: 'ミスリルの盾 · 耐久'
    },
    smithEndAdamantShield: {
      name: 'アダマントの盾 · 耐久'
    },
    smithEndAetheriteShield: {
      name: 'エーテライトの盾 · 耐久'
    },
    smithMasterEndMithrilHelm: {
      name: '名工のミスリルの兜 · 耐久'
    },
    smithMasterEndAdamantHelm: {
      name: '名工のアダマントの兜 · 耐久'
    },
    smithMasterEndAetheriteHelm: {
      name: '名工のエーテライトの兜 · 耐久'
    },
    smithEndMithrilHelm: {
      name: 'ミスリルの兜 · 耐久'
    },
    smithEndAdamantHelm: {
      name: 'アダマントの兜 · 耐久'
    },
    smithEndAetheriteHelm: {
      name: 'エーテライトの兜 · 耐久'
    },
    smithMasterEndMithrilPlate: {
      name: '名工のミスリルのプレート · 耐久'
    },
    smithMasterEndAdamantPlate: {
      name: '名工のアダマントのプレート · 耐久'
    },
    smithMasterEndAetheritePlate: {
      name: '名工のエーテライトのプレート · 耐久'
    },
    smithEndMithrilPlate: {
      name: 'ミスリルのプレート · 耐久'
    },
    smithEndAdamantPlate: {
      name: 'アダマントのプレート · 耐久'
    },
    smithEndAetheritePlate: {
      name: 'エーテライトのプレート · 耐久'
    },
    smithMasterEndMithrilGreaves: {
      name: '名工のミスリルの脛当て · 耐久'
    },
    smithMasterEndAdamantGreaves: {
      name: '名工のアダマントの脛当て · 耐久'
    },
    smithMasterEndAetheriteGreaves: {
      name: '名工のエーテライトの脛当て · 耐久'
    },
    smithEndMithrilGreaves: {
      name: 'ミスリルの脛当て · 耐久'
    },
    smithEndAdamantGreaves: {
      name: 'アダマントの脛当て · 耐久'
    },
    smithEndAetheriteGreaves: {
      name: 'エーテライトの脛当て · 耐久'
    },
    smithIronSword: {
      name: '鉄の剣'
    },
    rustedShortsword: {
      name: '錆びたショートソード'
    },
    apprenticeStaff: {
      name: '見習いの杖'
    },
    scoutsHandgun: {
      name: '斥候のハンドガン'
    },
    ironBroadsword: {
      name: '鉄のブロードソード'
    },
    vipinsStiletto: {
      name: 'ヴィピンのスティレット'
    },
    aetherCarbine: {
      name: 'エーテルカービン'
    },
    ashenGreatsword: {
      name: '灰の大剣'
    },
    archmageWand: {
      name: '大魔道士のワンド'
    },
    chronoBlade: {
      name: 'クロノブレード'
    },
    bloodForgedAxe: {
      name: '血鍛えの斧'
    },
    voidCannon: {
      name: 'ヴォイドキャノン'
    },
    dragonSmasher: {
      name: 'ドラゴンスマッシャー'
    },
    bladeOfTheUnbound: {
      name: '縛られざる者の剣'
    },
    aetheriumDestroyer: {
      name: 'エーテリウムデストロイヤー'
    },
    woodenBuckler: {
      name: '木のバックラー'
    },
    tomeOfNovices: {
      name: '初心者の魔道書'
    },
    ironShield: {
      name: '鉄の盾'
    },
    syringeOfTheAdept: {
      name: '達人の注射器'
    },
    aethericBattery: {
      name: 'エーテルバッテリー'
    },
    aegisTowerShield: {
      name: 'イージスの大盾'
    },
    orbOfEternalFlame: {
      name: '永遠の炎のオーブ'
    },
    shieldOfTheFallen: {
      name: '斃れし者の盾'
    },
    paddedTunic: {
      name: '綿入りのチュニック'
    },
    leatherDoublet: {
      name: '革のダブレット'
    },
    chainmailVest: {
      name: 'チェインメイルベスト'
    },
    scholarsRobe: {
      name: '学者のローブ'
    },
    reinforcedPlate: {
      name: '強化プレート'
    },
    assassinsGarb: {
      name: '暗殺者の装束'
    },
    chronoWeaverCloak: {
      name: 'クロノウィーバーの外套'
    },
    bloodSoakedPlate: {
      name: '血染めのプレート'
    },
    exoArmorChassis: {
      name: 'エクソアーマーシャーシ'
    },
    dragonscaleHauberk: {
      name: '竜鱗のホーバーク'
    },
    vestmentsOfSovereign: {
      name: '君主の礼服'
    },
    armorOfTheTitan: {
      name: 'タイタンの鎧'
    },
    quiltedCap: {
      name: 'キルトの帽子'
    },
    stalkersHood: {
      name: '追跡者のフード'
    },
    ironcladHelm: {
      name: '鉄張りの兜'
    },
    seersCirclet: {
      name: '予見者の額冠'
    },
    wyrmguardGreathelm: {
      name: 'ワームガードの大兜'
    },
    hatOfTheStarweaver: {
      name: '星織りの帽子'
    },
    hideGloves: {
      name: 'なめし革の手袋'
    },
    ironGauntlets: {
      name: '鉄のガントレット'
    },
    emberweaveGloves: {
      name: '残り火織りの手袋'
    },
    duelistsGrips: {
      name: '決闘者の籠手'
    },
    voidforgedGauntlets: {
      name: '虚無鍛えのガントレット'
    },
    gripsOfTheTempest: {
      name: '嵐の籠手'
    },
    trailBoots: {
      name: '旅路のブーツ'
    },
    pathfindersBoots: {
      name: '道を拓く者のブーツ'
    },
    forgeplateGreaves: {
      name: '鍛造板金の脛当て'
    },
    mistwalkerBoots: {
      name: '霧渡りのブーツ'
    },
    stormstrideGreaves: {
      name: '嵐駆けの脛当て'
    },
    treadsOfTheHorizon: {
      name: '地平線の足跡'
    },
    copperBand: {
      name: '銅の指輪'
    },
    ringOfMending: {
      name: '癒しの指輪'
    },
    bandOfSwiftness: {
      name: '俊足の指輪'
    },
    castersEmblem: {
      name: '術者の紋章'
    },
    infiltratorsCharm: {
      name: '潜入者のお守り'
    },
    timekeepersHourglass: {
      name: '時守の砂時計'
    },
    ringOfTheVampyre: {
      name: '吸血鬼の指輪'
    },
    sovereignsSignet: {
      name: '君主の印章指輪'
    },
    heraldsPin: {
      name: '伝令のピン'
    },
    hymnalOfTheRoad: {
      name: '旅路の賛美歌集'
    },
    shepherdsCrook: {
      name: '羊飼いの杖'
    },
    minstrelsHat: {
      name: '吟遊詩人の帽子'
    },
    pilgrimsSandals: {
      name: '巡礼者のサンダル'
    },
    falconersGloves: {
      name: '鷹匠の手袋'
    },
    bellOfTheHerd: {
      name: '群れの鈴'
    },
    bannerOfTheHost: {
      name: '軍勢の旗'
    },
    heraldsTabard: {
      name: '伝令の陣羽織'
    },
    codexOfOaths: {
      name: '誓約の写本'
    },
    crownOfTheRightfulKing: {
      name: '正統なる王の冠'
    },
    scepterOfTheFirstKing: {
      name: '始まりの王の王笏'
    },
    pickpocketsKnife: {
      name: 'スリのナイフ'
    },
    serpentsFang: {
      name: '蛇の牙'
    },
    phantomRapier: {
      name: '幻影のレイピア'
    },
    fangOfTheWindless: {
      name: '無風の牙'
    },
    roguesBuckler: {
      name: 'ならず者の小盾'
    },
    venomVial: {
      name: '毒の小瓶'
    },
    swiftguardBuckler: {
      name: '俊敏な衛兵の小盾'
    },
    nightshadeFlask: {
      name: 'ベラドンナの小瓶'
    },
    windveilTarge: {
      name: '風のヴェールの盾'
    },
    shadowdancersBuckler: {
      name: '影舞い手の小盾'
    },
    scoutsBandana: {
      name: '斥候のバンダナ'
    },
    nightcowl: {
      name: '夜のずきん'
    },
    shadowveilHood: {
      name: '影のヴェールのフード'
    },
    windrunnersCap: {
      name: '風走りの帽子'
    },
    maskOfTheSilentWind: {
      name: '静かな風の仮面'
    },
    rangersJerkin: {
      name: 'レンジャーのジャーキン'
    },
    nightstalkerLeathers: {
      name: '夜行狩人の革鎧'
    },
    windridersHarness: {
      name: '風乗りの馬具'
    },
    mantleOfTheShadowDancer: {
      name: '影舞い手のマント'
    },
    thiefsGloves: {
      name: '盗賊の手袋'
    },
    cutpurseGloves: {
      name: 'スリの手袋'
    },
    glovesOfTheGale: {
      name: '疾風の手袋'
    },
    softSoledShoes: {
      name: '柔らかい靴'
    },
    catStepBoots: {
      name: '猫足のブーツ'
    },
    shadowstepBoots: {
      name: '影歩きのブーツ'
    },
    windstrideBoots: {
      name: '風歩きのブーツ'
    },
    luckyCoin: {
      name: '幸運のコイン'
    },
    shadowBand: {
      name: '影の指輪'
    },
    sandglassOfTheSwift: {
      name: '俊足の砂時計'
    },
    talonCharm: {
      name: '鉤爪のお守り'
    },
    windheart: {
      name: '風の心臓'
    },
    ashwallHeater: {
      name: '灰壁のヒーターシールド'
    },
    wyrmhidePavise: {
      name: 'ワイバーン皮の大盾'
    },
    footmansKettleHat: {
      name: '歩兵の鍋帽子'
    },
    ironbrowSallet: {
      name: '鉄眉のサレット'
    },
    warlordsBarbute: {
      name: '軍団長のバルビュート'
    },
    helmOfTheSunderedThrone: {
      name: '砕けた玉座の兜'
    },
    recruitsCuirass: {
      name: '新兵の胸当て'
    },
    stonecuttersMitts: {
      name: '石工のミトン'
    },
    ashforgedGauntlets: {
      name: '灰で鍛えた籠手'
    },
    warbringerGauntlets: {
      name: '戦を運ぶ者の籠手'
    },
    titanfistGauntlets: {
      name: '巨人の拳の籠手'
    },
    footmansGreaves: {
      name: '歩兵の脛当て'
    },
    ironshodGreaves: {
      name: '鉄張りの脛当て'
    },
    warlordsSabatons: {
      name: '軍団長のサバトン'
    },
    greavesOfTheMountainfall: {
      name: '山崩れの脛当て'
    },
    sergeantsSignet: {
      name: '軍曹の印章指輪'
    },
    brawlersKnuckleRing: {
      name: '喧嘩屋のメリケンサック'
    },
    bloodiedWarMedal: {
      name: '血に濡れた戦功章'
    },
    watchmansCudgel: {
      name: '番人の警棒'
    },
    ironboundMace: {
      name: '鉄輪のメイス'
    },
    stonehideCleaver: {
      name: '石肌の鉈'
    },
    bulwarkMaul: {
      name: '防壁の大槌'
    },
    mountainsplitterAxe: {
      name: '山割りの斧'
    },
    everstandWarmace: {
      name: '不動の戦鎚'
    },
    emberwallBastion: {
      name: '熾火壁の砦盾'
    },
    stonewardenHelm: {
      name: '石の番人の兜'
    },
    colossusVisage: {
      name: '巨像の面'
    },
    diggersGauntlets: {
      name: '穴掘りの籠手'
    },
    bastionGauntlets: {
      name: '砦の籠手'
    },
    glacierplateGauntlets: {
      name: '氷河板の籠手'
    },
    gauntletsOfEndlessVigil: {
      name: '終わりなき見張りの籠手'
    },
    hearthstoneCharm: {
      name: '炉石のお守り'
    },
    ironheartPendant: {
      name: '鉄心のペンダント'
    },
    hedgewizardsWand: {
      name: '生垣魔術師の杖'
    },
    frostglassStaff: {
      name: '霜ガラスの杖'
    },
    voidthreadWand: {
      name: '虚無糸の杖'
    },
    staffOfTheStarlessSky: {
      name: '星なき空の杖'
    },
    studentsGrimoire: {
      name: '生徒の魔導書'
    },
    frostfireOrb: {
      name: '霜炎のオーブ'
    },
    orbOfTheUnwrittenHour: {
      name: '書かれざる刻のオーブ'
    },
    apprenticesPointedCap: {
      name: '見習いのとんがり帽子'
    },
    sagesCirclet: {
      name: '賢者のサークレット'
    },
    cinderWizardsHat: {
      name: '灰の魔術師の帽子'
    },
    voidseerCirclet: {
      name: '虚無視者のサークレット'
    },
    apprenticesRobe: {
      name: '見習いのローブ'
    },
    cinderthreadRobe: {
      name: '灰糸のローブ'
    },
    voidwovenRobe: {
      name: '虚無織りのローブ'
    },
    inkStainedGloves: {
      name: 'インク染みの手袋'
    },
    spellthreadGloves: {
      name: '呪文糸の手袋'
    },
    frostweaveGloves: {
      name: '霜織りの手袋'
    },
    starlitGloves: {
      name: '星明かりの手袋'
    },
    glovesOfTheLastWord: {
      name: '最後の言葉の手袋'
    },
    scribesSlippers: {
      name: '書記のスリッパ'
    },
    moonstepSlippers: {
      name: '月歩きのスリッパ'
    },
    emberstepBoots: {
      name: '熾火歩きのブーツ'
    },
    voidwalkerBoots: {
      name: '虚無の放浪者のブーツ'
    },
    bootsOfTheWanderingStar: {
      name: 'さまよう星のブーツ'
    },
    glowstonePendant: {
      name: '光る石のペンダント'
    },
    scholarsSeal: {
      name: '学者の印章'
    },
    eyeOfTheArchon: {
      name: 'アルコンの瞳'
    },
    cinderRepeater: {
      name: '灰の連発銃'
    },
    glacierMortar: {
      name: '氷河の手持ち迫撃砲'
    },
    sparkCell: {
      name: '火花セル'
    },
    arcCapacitor: {
      name: 'アークコンデンサ'
    },
    aetherheartCell: {
      name: 'エーテル心臓セル'
    },
    marksmansVisor: {
      name: '射手のバイザー'
    },
    sharpshootersCap: {
      name: '狙撃手の帽子'
    },
    gunnersHarness: {
      name: '砲手のハーネス'
    },
    steadyhandGloves: {
      name: '安定の手の手袋'
    },
    gunsmithsGloves: {
      name: '銃職人の手袋'
    },
    scrappersBoots: {
      name: '喧嘩屋のブーツ'
    },
    sharpshooterBoots: {
      name: '狙撃手のブーツ'
    },
    firingLineBoots: {
      name: '射線のブーツ'
    },
    steadyfootBoots: {
      name: '不動足のブーツ'
    },
    aetherstepBoots: {
      name: 'エーテル歩きのブーツ'
    },
    bootsOfTheLastShot: {
      name: '最後の一発のブーツ'
    },
    brassCartridgeCharm: {
      name: '真鍮薬莢のお守り'
    },
    deadEyeLens: {
      name: '鋭き目のレンズ'
    },
    eagleEyeScope: {
      name: '鷹の目の望遠鏡'
    },
    criersBaton: {
      name: '触れ役の警棒'
    },
    droversStandard: {
      name: '牧童の旗標'
    },
    marshalsSceptre: {
      name: '元帥の笏'
    },
    balladBook: {
      name: 'バラッドの書'
    },
    chronicleOfHeroes: {
      name: '英雄年代記'
    },
    psalterOfTheHost: {
      name: '軍勢の詩篇'
    },
    tomeOfEternalReign: {
      name: '永遠の治世の書'
    },
    heraldsCap: {
      name: '伝令の帽子'
    },
    singersCirclet: {
      name: '歌い手のサークレット'
    },
    diademOfTenThousandVoices: {
      name: '一万の声のディアデム'
    },
    travelersWaistcoat: {
      name: '旅人のベスト'
    },
    minstrelsMotley: {
      name: '吟遊詩人の継ぎ接ぎ服'
    },
    troubadoursCoat: {
      name: 'トルバドゥールのコート'
    },
    marshalsGreatcoat: {
      name: '元帥のグレートコート'
    },
    buskersGloves: {
      name: '大道芸人の手袋'
    },
    drummersGloves: {
      name: 'ドラマーの手袋'
    },
    standardBearersGloves: {
      name: '旗手の手袋'
    },
    gildedParadeGloves: {
      name: '金張りの式典手袋'
    },
    glovesOfTheCrownedHand: {
      name: '戴冠の手の手袋'
    },
    wayfarersShoes: {
      name: '旅人の靴'
    },
    troubadourBoots: {
      name: 'トルバドゥールのブーツ'
    },
    heraldsRidingBoots: {
      name: '伝令の乗馬ブーツ'
    },
    paradeBoots: {
      name: '式典ブーツ'
    },
    bootsOfTheLongProcession: {
      name: '長き行列のブーツ'
    },
    silverWhistle: {
      name: '銀の笛'
    },
    gatheringHorn: {
      name: '召集の角笛'
    },
    heartOfTheMountain: {
      name: '山の心臓'
    },
    ringOfAbsolutePower: {
      name: '絶対なる力の指輪'
    }
  },
  bag: {
    oreCount: '{ore}: {n}',
    noOre: 'まだ鉱石がない。野外の岩場で、岩肌の鉱脈を掘ろう。',
    equip: '装備',
    unequip: '外す',
    worn: '身につけている。売るには外そう。',
    versus: '{item}と比較',
    hint: 'アイテムをタップして確認。もう一度タップするか、スロットへドラッグで装備。',
    empty: 'この種類のものはバッグにない。',
    slotEmpty: '{slot}：なし',
    slotHolds: '{slot}：{item}',
    filter: {
      ore: '鉱石',
      all: 'すべて',
      weapons: '武器',
      armor: '防具',
      trinkets: '装飾品',
      herbs: '薬草'
    },
    sort: {
      slot: '種類',
      tier: '品質',
      level: 'レベル'
    },
    sortBy: '並び順：{by}',
    noHerbs: 'まだ薬草がない。野に生えているので、上を歩けば摘める。',
    herbCount: '{plant}：{n}'
  },
  shop: {
    buy: '買う',
    sell: '売る',
    owned: '所持',
    empty: '今日は棚に何もない。',
    goods: '売り物',
    price: '値段',
    value: '買取額',
    hint: '棚かバッグの品をタップするか、ドラッグでテーブルに置こう。',
    buyBack: '本日売却分',
    buyBackOne: '買い戻す',
    deal: '成立！',
    say: {
      buy: 'いい選択だ。大事に使えば、きっと守ってくれる。',
      sell: 'いいだろう。欲しがる人はいるさ。',
      back: 'やっぱりやめる？ いいよ、ほら、返すね。',
      poor: '悪いけど、ちょっとお金が足りないみたいだ。'
    }
  },
  trainer: {
    learn: '習得',
    known: '習得済み',
    friend: '{faction}は友を大切にする：20%引き。',
    fee: '料金',
    rank: {
      label: 'ランク{n}',
      up: 'ランクアップ',
      effect: '効果+{effect}%、クールダウン−{cd}%',
      max: '最高ランク',
      level: 'ランク{n}にはレベル{lvl}が必要。'
    },
    hint: 'レッスンを選ぼう。縁が緑なら今すぐ習得できる。',
    block: {
      'trial': "このクラスの試練をまだ突破していない。",
      'parents': "まず{a}と{b}のスキルをひとつずつ覚えよう。",
      level: 'レベルが足りない。',
      attrs: '能力値が足りない。',
      gold: 'ゴールドが足りない。'
    }
  },
  healer: {
    talk: 'ここでしばらく休んでいって。フラスコはまた満タンよ。よければ、もっと大きなベルトも売ってあげる。',
    note: 'どのゾーンにもポーションを{n}個持っていける。',
    buy: 'フラスコを追加 · {n}',
    full: 'ベルトはもういっぱいです。',
    belt: 'ポーションベルト',
    slotTitle: 'ベルトを拡張',
    slotBought: 'ポーション枠が1つ増えた：各エリアに回復薬を{n}本持ち込め、マナ薬を{n}本まで蓄えられる。',
    mana: {
      title: 'マナポーション',
      note: '在庫：{n}/{max}個。次に来るときも持ち越せる。',
      buy: 'マナポーション1個 · {n}',
      full: 'もう持てません。'
    }
  },
  faction: {
    order: '鉄の騎士団',
    syndicate: '灰のシンジケート',
    circle: 'エーテル結社'
  },
  npc: {
    'mysteriousWanderer': { 'name': "謎の放浪者" },
    'fairPip': { 'name': "ピップ" },
    'fairBess': { 'name': "ベスばあさん" },
    'fairHob': { 'name': "ホブ" },
    sunkenPriest: { name: "沈みし司祭" },
    'fortHale': {
      'name': "ヘイル隊長",
    },
    'fortMara': {
      'name': "マーラ長老",
    },
    'scoutWren': {
      'name': "斥候レン",
    },
    frostDisciple: {
      name: 'アイヴァー・ハスク'
    },
    windDisciple: {
      name: 'ケストレル・ヴェイン'
    },
    freedFarmers: {
      name: 'ジョリー・トーラー'
    },
    freedHerbalist: {
      name: 'ブライア・ホロウェル'
    },
    lightDisciple: {
      name: 'シスター・オーレル'
    },
    freedPeddler: {
      talk: '旅人に要るものは何でもそろってるよ。ほぼ新品さ、だいたいはね。',
      name: 'オド・マロウ'
    },
    sfShadowRoad: {
      name: 'ネトル・クイックハンド'
    },
    sfShadow: {
      name: 'ネトル・クイックハンド'
    },
    sfGeo: {
      name: 'ハロウ・フリント'
    },
    wanderer: {
      name: '旅人のPip',
      talk: '長旅で財布が軽いのかい？ 何でも少しずつ持ってるよ。'
    },
    sunfordSmith: {
      name: '鍛冶屋のブラム',
      talk: '飾りのない鋼を、まっとうな値段でな。ゆっくり見てくれ。'
    },
    sunfordPeddler: {
      name: '行商人のティリー',
      talk: '指輪にお守りに、いろんな小物があるよ。これ、本当に幸運を呼ぶかもよ。'
    },
    trainerAegis: {
      name: 'サー・アルドリック'
    },
    trainerPyro: {
      name: 'エンバー・レン'
    },
    elderMara: {
      name: 'マーラ長老'
    },
    sunfordHealer: {
      name: 'シスター・ルーン'
    },
    goblinTrader: {
      name: '商人のグリク',
      talk: 'これは家族が作りました。よい品を、適正な値段で。'
    },
    captainHale: {
      name: 'ヘイル隊長'
    },
    oakArmorer: {
      name: '防具屋のオド',
      talk: '在庫の半分は城壁行きになってね。残りでよければ、合うものを持っていきな。'
    },
    oakMasterArmorer: {
      name: 'オド親方',
      talk: 'いい板金鎧を出したよ。見る資格は十分あるさ。'
    },
    oakWeapons: {
      name: '刃物屋のセナ',
      talk: '鋭くて、バランスがよくて、値段も良心的。刃には触らないでね。'
    },
    trainerShadow: {
      name: '「ささやき」'
    },
    trainerSovereign: {
      name: 'カステラン卿'
    },
    oakHealer: {
      name: 'ブラザー・フェン'
    },
    blackMarket: {
      name: '故買屋',
      talk: 'どっちも詮索はなし。シンジケートが取り分をもらう。'
    },
    trainerBlood: {
      name: 'サングレル博士'
    },
    syndicateBoss: {
      name: 'マダム・アッシュ'
    },
    forgemaster: {
      name: '鍛冶頭ドルン'
    },
    ironWeapons: {
      name: '鉄槌のヒルダ',
      talk: '全部ドワーフの手打ちだよ。もし折れたら、どうしてか教えとくれ。'
    },
    ironAetherWorks: {
      name: '細工師ヴォス',
      talk: 'ここの品は全部コアの研究から生まれたんだ。気をつけて、ほとんど弾が入ってる。'
    },
    ironArmor: {
      name: '鉄腹のガルン',
      talk: '鎧は棚に、指輪は皿の上だ。'
    },
    ironOrderArmor: {
      name: '騎士団の補給係',
      talk: '必要なものを持っていけ。騎士団は身内を大事にする。'
    },
    trainerGeo: {
      name: '石足じいさん'
    },
    trainerAether: {
      name: '歯車技師ピム'
    },
    ironHealer: {
      name: 'マザー・ブリュンヤ'
    },
    exiledSovereign: {
      name: '追放されたカステラン卿'
    },
    trainerChrono: {
      name: '時の番人'
    },
    mayorBrenna: {
      name: 'ブレナ・クイル町長'
    },
    sbHealer: {
      name: '修道士アンセル'
    },
    sbArmorer: {
      name: 'グレタ・アイアンヴェイン',
      talk: '山の鋼を、川の値段で。好きなだけ叩いてみな。'
    },
    sbWeapons: {
      name: 'コルヴィン・アシュビー',
      talk: 'アシュビー名刀店。刃はすべて手磨き。この私の手でね。'
    },
    sbJeweler: {
      name: 'タム・マーロウ',
      talk: '指輪にお守り、幸運の石。ぜんぶ本物。まあ、ほぼぜんぶ。'
    },
    sbMasterAegis: {
      name: 'デイム・ヘルガ・ストームシールド'
    },
    sbMasterPyro: {
      name: '魔導師イグナティウス・ヴェイル'
    },
    sbMasterShadow: {
      name: 'ニクス・ハロウェイ'
    },
    sbMasterSovereign: {
      name: 'パーシヴァル・アシュコム卿'
    },
    sbMasterGeo: {
      name: 'トーヴァ・ディープルートおばあさん'
    },
    sbMasterAether: {
      name: 'クイント・スプロケット教授'
    },
    sbMasterChrono: {
      name: '時計番セルウィン'
    },
    sbMasterBlood: {
      name: 'ヴェスパー・クリムゾンリーフ'
    },
    sbAlchemist: {
      name: 'シダ笛のオディール'
    },
    sbGambler: {
      name: 'マダム・ペル'
    },
    sunfordGambler: {
      name: 'ころがし屋のドッブ'
    },
    sunfordCups: {
      name: 'すばやい指のネル'
    },
    oakGambler: {
      name: '絹のレン'
    },
    sbCollector: {
      name: 'アルダー・ヴェイン',
      talk: '珍しい品は、珍しい友だちに。ジャムのついた指でさわらんでくれよ。'
    },
    sbFence: {
      name: 'ミレラ・ソーン',
      talk: '上等な鎧、詮索なし。まあ、ほとんどなしね。'
    },
    sbMasterWindrunner: {
      name: '疾風のセファ'
    },
    sbMasterFrostwarden: {
      name: '霜心のハルヴァルド'
    },
    sbMasterLightbringer: {
      name: '暁のシスター・オーリエル'
    },
    sbMasterBeastcaller: {
      name: 'アザミ足のローワンじいさん'
    },
    sbMasterElementalist: {
      name: '四風の魔導師アイリス'
    },
    sbMasterSoulwarden: {
      name: '灯火の番人オダリス'
    },
    sbMasterIronmonk: {
      name: '静水のオル老師'
    },
    sbMasterBard: {
      name: '晴れ空のラーク'
    }
  },
  quest: {
    final: 'この選択はやり直せない。',
    needsRep: '{faction}の評判 {n}',
    gold: '+{n} ゴールド',
    goblinKing: {
      title: 'ゴブリンキング',
      slay: {
        label: '王の支配を終わらせる。'
      },
      pact: {
        label: 'サンフォードとの交易協定を持ちかける。'
      },
      ransom: {
        label: '財宝をもらい、王冠は残してやる。'
      }
    },
    siege: {
      title: 'オークヘイヴン包囲戦',
      defend: {
        label: 'オークヘイヴンを守る。'
      },
      betray: {
        label: 'シンジケートのために門を開ける。'
      }
    },
    core: {
      title: 'アイアンホールドの心臓',
      destroy: {
        label: 'コアを砕く。'
      },
      study: {
        label: '結社に渡して研究させる。'
      },
      sell: {
        label: 'シンジケートに売る。'
      }
    },
    oracle: {
      title: '沈んだ神託の巫女',
      free: {
        label: '鎖を断ち切る。'
      },
      slay: {
        label: '彼女が守る砂時計を奪う。'
      }
    },
    dragon: {
      title: '虚無の竜',
      slay: {
        label: '竜を討つ。'
      },
      pact: {
        label: 'アークデーモンを倒す盟約を結ぶ。'
      }
    },
    throne: {
      title: '空の玉座',
      order: {
        label: '玉座を鉄の騎士団に渡す。'
      },
      syndicate: {
        label: '玉座を灰のシンジケートに渡す。'
      },
      circle: {
        label: '玉座をエーテル結社に渡す。'
      },
      shatter: {
        label: '玉座を砕く。'
      },
      claim: {
        label: '自分で座る。'
      }
    }
  },
  dlg: {
    // ── The Mysterious Wanderer (afterplay phase 10) ──
    'mysteriousWanderer': {
      'hello': { '1': "ほう。ほとんど誰も成し得なかったことをやったな。裂け目の向こう側から感じたぞ。", '2': "二つの流派をひとつにする古い道を教えている。それに値する者にだけな。" },
      'sealed': { '1': "封じたか。ある意味では惜しい。あの眺めは好きだった。" },
      'ajar': { '1': "開けたままにしたか。大胆だな。悪魔どもがお前を鈍らせはしまい。" },
      'again': { '1': "また来たか。道は長いが、お前はよく歩いている。" },
      'train': { '1': "お前の二つの半身を見せてみろ。ひとつにしてやろう。" },
      'trial': { 'say': "試練って何のこと？", '1': "傷ひとつなく守り抜いた門。一度も倒れずに討った竜。五つの獄炎の鍛造と五連勝。", '2': "リヴァイアサンの死と、ヒュドラでの完璧な一投。どれもが、私の見せられる扉を開く。" },
      'who': { '1': "ただの放浪者だ。お前の祖父が生まれる前から裂け目の縁を歩いてきた。名など擦り切れる。" },
      'trainBack': { '1': "鍛錬せよ。二つの流派は折り合う前にぶつかり合うものだ。" },
      'bye': { '1': "気をつけて行け。私はここにいる。いなくなるまではな。" }
    },
    'fairPip': {
      'hello': { '1': "さあさあ寄ってらっしゃい！樽が九つ、インプがわんさか、木槌がひとつ。たたき戻してやれ！", '2': "インプが樽から飛び出す。砂が落ちきる前に二十匹たたくんだ。", '3': "金の鎧のやつはほっとけ、ライフが減るぞ。三連勝で大賞はあんたのものだ。" },
      'again': { '1': "またたたきに来たのかい？木槌を持ちな！" },
      'play': { '1': "木槌を構えて！来るぞ！" },
      'who': { '1': "ピップ、本業はインプ捕り。こいつらはおれが自分で捕まえた。かみつくぞ。" },
      'playBack': { '1': "はは！すごい騒ぎだ！もう一回？" },
      'bye': { '1': "木槌の腕は力を抜いてな！" }
    },
    'fairBess': {
      'hello': { '1': "輪が五つ、首が三つ、かみつく首はひとつもないよ。あたしが自分で彫ったんだ、塗装に気をつけな。", '2': "長押しで勢いをため、離して投げる。首は真ん中に揺れてきたときしか輪をとらないよ。", '3': "続けて入れるたびに一つずつ増える。五つ全部入れたら、ちゃんと払ってやるよ。" },
      'again': { '1': "またうちのばあさんに挑みに来たのかい？" },
      'play': { '1': "ほら、輪だよ。やさしく投げな。" },
      'who': { '1': "祭りの道を四十年。ヒドラは戦と一緒にやってきた。ちょうどいいと思ってね。" },
      'playBack': { '1': "悪くない。死んだ亭主はもっと下手だったよ。" },
      'bye': { '1': "帰りに塗装に気をつけな。" }
    },
    'fairHob': {
      'hello': { '1': "あ…こんにちは。腕相撲、する？手加減するよ。たぶん。", '2': "輪が円に重なったら押して。リズムを外すと滑るよ。", '3': "腕が強いと楽になる。三回続けて勝ったら、親方が割引してくれるよ。" },
      'again': { '1': "もう一回？もう一回って言う人、いないんだ。" },
      'play': { '1': "ひじをテーブルに。いつでもいいよ。" },
      'who': { '1': "ぼくは鍛冶の親方の弟子。親方は、ぼくが自分の力をわかってないって言うんだ。" },
      'playBack': { '1': "いい勝負だった。明日は腕が痛いかも。たぶん。" },
      'bye': { '1': "また来てね。鍛冶場はすごく静かなんだ。" }
    },
    // ── The Breaking (the afterplay, B0–B5) ──
    'story': {
      forge: { back: { '1': "わしの鍛冶場がまた燃えとる。前より熱くな。悪魔の鉄はよく溶けるわい。", '2': "外で見つけたものを持ってこい。今ならインファーナルに鍛えられる。" } },
      oracle: { lens: { '1': "あなたはかつてわたしを解き放った。今度はわたしがあなたの目になる。このレンズを。", '2': "これを覗けば、地図が大いなる獣のありかを示すでしょう。" } },
      priest: { lens: { '1': "オラクルはもういない。だから今はわたしがその神殿を守る。これはスフィンクスが守っていたものだ。", '2': "彼女のレンズだ。これを覗けば、地図が大いなる獣のありかを示すだろう。" } },
      herbs: { scale: { '1': "リヴァイアサンの鱗！葉っぱみたいに軽くて、水に浮くの。", '2': "身につければ、浅瀬が固い地面のようにあなたを支えてくれるわ。" } },
      ghost: { key: { '1': "ほう、わが玉座を奪った者か。わがヒュドラを殺したな。よかろう。", '2': "その炎の鍵を持っていけ。裂け目の心臓は燃えており、炎だけがそれを開く。" } },
      syndicate: { key: { '1': "ヒュドラが死んだ？なら炎の鍵は払う者のもの。まあ、あなたでもいいわ。", '2': "それは裂け目の心臓を開く鍵。閉じてきなさい、わたしの商売が呑まれる前に。" } },
      sealed: {
        sealed: { '1': "こうして裂け目は封じられ、世界は癒えはじめた。", '2': "町は建て直され、歌が作られ、そのどれにもひとつの名があった。" },
        ajar: { '1': "こうして裂け目は少しだけ開いたまま残され、世界はそれと共に生きることを学んだ。", '2': "城壁には見張りが立ち、闘技場は賑わい、英雄は備えを怠らなかった。" },
      },
      'rift': {
        'scream': {
          '1': "虚無の王が倒れ、その背後の裂け目が叫び声を上げる。",
          '2': "あれは王座ではなかった。檻であり、彼はそのふただったのだ。",
          '3': "今や裂け目は開き、虚無が眠らせていたものすべてが目を覚ます。",
        },
      },
      'wren': {
        'found': {
          '1': "いた！わたしはレン、斥候よ。ずっと探してたの。",
          '2': "サンフォードが燃えてる。逃げられた人はみんなバスティオン・クロッシングへ行ったわ。",
          '3': "灰の岩山へ向かう道にある古い砦よ。急いで、みんなあなたを待ってる。",
        },
      },
    },
    'scoutWren': {
      sealed: { '1': "竜がいなくなった！もう道が軽く感じるよ！" },
      'hello': {
        '1': "来てくれた！きっと来ると思ってた。バスティオン・クロッシングへようこそ。",
        '2': "わたしは隊長のために道を偵察してるの。どこが危ないか聞いて。",
      },
      'again': {
        '1': "もう戻ったの？道は勝手に偵察されないわよ。",
      },
      'who': {
        '1': "レンよ。サンフォードが燃えるまでは、見張りの伝令をしてたの。",
      },
      'rumor': {
        'plains': {
          '1': "サンフォード平原の道は悪魔に押さえられてる。その先にサンフォードの先生たちが閉じ込められてるわ。",
        },
        'hollows': {
          '1': "ゴブリンの洞穴には地獄の猟犬がうじゃうじゃいる。片づければ、サンフォードの人たちは帰れるわ。",
        },
        'woods': {
          '1': "ささやきの森で、頭が三つある何かが狩りをしてる。薬草師はそこに隠れてるの。",
        },
        'outskirts': {
          '1': "オークヘイヴン郊外をケンタウロスが駆けてる。城壁まで来たら、剣が一本でも多く要るわ。",
        },
        'siege': {
          '1': "あいつらの軍勢は崩れたけど、また集まってる。隊長が城壁を固めてるわ。",
        },
      },
      'bye': {
        '1': "道に気をつけて。わたしも見張ってるから。",
      },
    },
    'fortHale': {
      sealed: { '1': "竜が死んだ。生きてこの日を見られるとは思わなかった。ありがとう。" },
      'siegeBack': { '1': "まだか？ なら休め。城壁は待っている。" },
      'bell': { '1': "では門へ。どれほど固く守るか、言ってくれ。" },
      'hello': {
        '1': "よく来た。助かる。今こそ剣が一本でも多く必要だ。",
        '2': "バスティオン・クロッシングへようこそ。古い城壁だが、まだ立っているのはここだけだ。",
      },
      'road': {
        '1': "サンフォードへの道がまた開いた。人々はこの城壁の内側で無事だ。",
      },
      'herbs': {
        '1': "薬草師が戻った。薬草も一緒だ。救護所もひと息つける。",
      },
      'siege': {
        '1': "ケンタウロスを打ち破ったな。だがもっと大きな軍勢が、この城壁を狙ってやって来る。",
      },
      'again': {
        '1': "まだ立っている。城壁も、兵も、私もな。",
      },
      'fort': {
        '1': "古い国境の砦だ。空が裂けるまで、五十年も無人だった。",
        '2': "今では平原と山のあいだで、最後の安全な場所だ。",
        'say': "ここはどんな場所なの？",
      },
      'rumor': {
        'road': {
          '1': "平原と洞穴を片づけてくれ。サンフォードの人々がそこに取り残されている。",
        },
        'woods': {
          '1': "薬草師はささやきの森にいる。そして頭が三つある獣もだ。油断するな。",
        },
        'centaurs': {
          '1': "郊外にケンタウロスがいる。ここへ来る前に軍勢を打ち破れ。",
        },
        'siege': {
          '1': "休んでおけ。包囲の鐘が鳴ったら、城壁で君が必要だ。",
        },
      },
      'bye': {
        '1': "剣を手放すなよ。",
      },
    },
    'fortMara': {
      sealed: { '1': "よくやったね、あんた。わたしたちみんな、あんたのおかげで帰る家がある。" },
      'siegeBack': { '1': "少しお休み。鐘はまた鳴るよ。" },
      'bell': { '1': "隊長の城壁は今、私が預かっている。どう守るか選びなさい。" },
      'hello': {
        '1': "まあ、あなた！生きていたのね。サンフォードが燃えたとき、最悪のことを覚悟したわ。",
        '2': "今では兵士の砦のお客さま。年寄りの女も含めてね。",
      },
      'command': {
        '1': "ヘイル隊長はオークヘイヴンと共に倒れたわ。だから今、砦は年寄りの長老の言うことを聞くの。",
      },
      'home': {
        '1': "サンフォードが再建されてる！最初の屋根が上がったわ。泣いてしまいそう。",
      },
      'again': {
        '1': "まだここにいるわよ。まだ人数を数えてるの。",
      },
      'town': {
        '1': "夜空から悪魔がやって来たの。私たちは持てるだけ持って逃げたわ。",
        '2': "逃げ遅れた人もいる。できるなら、残りのみんなを連れて帰ってきて。",
        'say': "サンフォードに何があったの？",
      },
      'rumor': {
        'road': {
          '1': "先生たちはまだサンフォードの道にいるの。ここへ連れてきてちょうだい。",
        },
        'woods': {
          '1': "薬草師は薬草を摘みにささやきの森へ行って、それきり戻らないの。",
        },
        'centaurs': {
          '1': "郊外に騎馬の群れ。毎晩、雷のような蹄の音よ。",
        },
        'siege': {
          '1': "もうすぐ城壁が試されるわ。この古い骨でそれを感じるの。",
        },
      },
      'bye': {
        '1': "気をつけて行くのよ。",
      },
    },
    intro: {
      crossing: { 1: 'すべての道は十字路で交わる…そして十字路は戦場となる。' },
      hero: { 1: 'サンフォードの静かな畑から、ひとりの若き英雄が旅立った。' },
      fire: { 1: '炎は呼び声に応え、鋼は新たな名を知った。' },
      foes: { 1: 'ゴブリンの王、霜の族長、虚無の竜…そしてアークデーモン。' },
      begin: { 1: '君の伝説は、いま始まる。' }
    },
    frostDisciple: {
      bye: {
        '1': '体を冷やすな。'
      },
      who: {
        '2': 'アイアンホールドの炉は暖かい。ここは気に入っている。',
        '1': 'ツンドラで狩りをしていた。奴らにひと冬、檻に入れられた。'
      },
      trainBack: {
        '1': '鍛えろ。寒さは辛抱強い。お前もそうあれ。'
      },
      ready: {
        weak: {
          '1': 'まだだ。腕も心も、もっと強く。'
        },
        able: {
          '1': '準備はできている。次の教えだ。'
        },
        strong: {
          '1': 'かつての私より強い。必要なものを取れ。'
        }
      },
      class: {
        say: 'フロストウォーデンって何？',
        '2': '筋力は刃のために。知力は霜のために。',
        '1': '冷やし、凍らせ、そして氷を砕く。'
      },
      train: {
        '1': 'じっと立て。寒さを引き寄せろ。そして送り返せ。'
      },
      again: {
        '1': '戻ったか。いい。'
      },
      hello: {
        '2': 'アイヴァー・ハスクだ。霜心のハルヴァルドに霜を教わった。今はここで、私が教える。',
        '1': '自由か。いい。寒さも私を奪えなかった。奴らもだ。'
      }
    },
    windDisciple: {
      bye: {
        '1': '風から目を離さないで。'
      },
      who: {
        '2': 'セファに僕は生きてるって伝えてくれる？心配性なんだ。',
        '1': 'シルバーブリッジへ向かう途中で、岩山で捕まっちゃったんだ。'
      },
      trainBack: {
        '1': '練習してきなよ。どこか風の強いところでね。'
      },
      ready: {
        weak: {
          '1': 'まだだね。まずはもっと素早くなってから、また来て。'
        },
        able: {
          '1': '次の技に進めるよ。よく見てて。'
        },
        strong: {
          '1': 'もう僕より速いね。好きなのを持っていって。'
        }
      },
      class: {
        say: 'ウィンドランナーって何をするの？',
        '2': '器用さで素早い足を。技量で、どの矢も当てるんだ。',
        '1': '走って、撃って、また走る。狙われた場所には絶対にいないこと。'
      },
      train: {
        '1': '足を開いて。息を吐いて。あとは風に運ばせるんだ。'
      },
      again: {
        '1': 'やあ！今日はいい風だ。練習しようか？'
      },
      hello: {
        '2': 'ケストレル・ヴェイン。疾風のセファに弓を教わったんだ。彼女に教わったことを君にも教えられるよ。',
        '1': '出してくれたんだ！君には何もかも借りがあるよ。まあ、たくさんね。'
      }
    },
    freedFarmers: {
      bye: {
        '1': '気をつけて行けよ。'
      },
      who: {
        '2': 'オークヘイヴンが受け入れてくれた。恩はパンで返してるよ。',
        '1': '山賊に畑からさらわれて、森に置き去りにされたんだ。朽ち果てろってな。'
      },
      favorDone: {
        say: 'もう狼に悩まされることはないよ。',
        '2': 'これを受け取ってくれ。大したもんじゃないが、真っ当に稼いだもんだ。',
        '1': 'また静かな夜が戻った。やっとぐっすり眠れる。'
      },
      waiting: {
        say: '狼のことだけど……',
        '1': '狼はまだうろついてる。昨夜も遠吠えが聞こえた。'
      },
      favor: {
        say: '何か手伝えることはある？',
        '2': '数を減らしてくれないか？八匹もやれば懲りるだろう。',
        '1': 'ささやきの森から出てくる狼どもが、うちの羊をさらっていくんだ。'
      },
      again: {
        '1': 'おお、英雄さんのお出ましだ。何か食ってくか？'
      },
      hello: {
        '2': 'ジョリー・トーラーだ。今は城壁の外で畑をやってる。まあ、やろうとはしてる。',
        '1': 'あんたがいなきゃ死んでた。俺も息子もな。ありがとう。'
      }
    },
    freedHerbalist: {
      bye: {
        '1': 'そっと歩いてね。そこにも命が育っているから。'
      },
      who: {
        '2': 'まあ、まるっきり間違いというわけでもないけれど。',
        '1': '丘から来た薬草師です。ゴブリンたちは私を魔女だと思い込んで。'
      },
      favorDone: {
        say: 'はい、ヒナタバナだよ。',
        '2': 'はい、お礼です。それと、改めてありがとう。',
        '1': 'まあ、申し分ないわ。この香り、嗅いでみて！'
      },
      waiting: {
        say: 'ヒナタバナのことだけど……',
        '1': 'まだ探しているの？ヒナタバナは開けた日なたが大好きなんです。'
      },
      favor: {
        say: '何か手伝えることはある？',
        '2': '平原に生えています。お礼ははずみますね。',
        '1': '蓄えはあの檻で全部なくしてしまって。ヒナタバナを三つ持ってきてもらえますか？'
      },
      again: {
        '1': 'あら、また会えましたね。あなたのブーツ、苔の匂いがします。いいことです。'
      },
      hello: {
        '2': 'ブライアです。育つものを摘んで、干しています。シルバーブリッジが快く迎え入れてくれました。',
        '1': '誰かが来てくれると信じていました。ゴブリンには薬草のことなんて分からない。優しさのことも。'
      }
    },
    lightDisciple: {
      bye: {
        '1': '光の中を歩んでください。'
      },
      who: {
        '2': 'サンフォードは明るくて静か。私にはその両方が必要でした。',
        '1': '沈んだ神殿へ祈りに行ったのです。でもナーガたちには別の考えがありました。'
      },
      trainBack: {
        '1': '穏やかに行ってください。そして、あなたが来るのを皆に見せてあげて。'
      },
      ready: {
        weak: {
          '1': 'まだです。まずはもっと澄んだ心と、温かい心を。'
        },
        able: {
          '1': '次の教えを受ける準備ができましたね。さあ、光の中に立って。'
        },
        strong: {
          '1': 'あなたはもう私より明るく輝いています。必要なものを何でも持っていって。'
        }
      },
      class: {
        say: 'ライトブリンガーって何をするの？',
        '2': '知力は光を強くし、魅力は光を温かくします。',
        '1': '私たちは夜明けを運ぶ者。戦うための光、癒すための光です。'
      },
      train: {
        '1': '手を開いて。光を手から出すのではなく、手を通して流すのです。'
      },
      again: {
        '1': 'おかえりなさい。今日はお日さまが優しいですね。'
      },
      hello: {
        '2': 'オーレルです。シスター・オーリエルに光を教わりました。今はここで、それを教えています。',
        '1': '光があなたと共にありますように。暗闇の中で私を見つけてくれたこと、決して忘れません。'
      }
    },
    freedPeddler: {
      bye: {
        '1': '山賊には気をつけな。あいつらは分け合うのが嫌いじゃからの。'
      },
      shopBack: {
        '1': 'いい取引じゃった、友よ。'
      },
      who: {
        '2': '今はサンフォードで商いしとる。ここのほうが安全じゃ。だいたいはな。',
        '1': '山賊どもに荷車を奪われて、箱に放り込まれたんじゃ。まったく無礼な連中よ。'
      },
      trade: {
        '1': '指輪、手袋、ブーツ。あんたには半額じゃ。まあ、ほぼな。'
      },
      again: {
        '1': '命の恩人！さあさあ、いい品はあんたのために取っておいたぞ。'
      },
      hello: {
        '2': 'オド・マロウ、何なりとお申しつけを。行商人で、修理屋で、大いに感謝しとる男じゃ。',
        '1': 'おお、あんたか！あの檻を開けてくれたのは！あのままじゃ朽ち果てとったわい。'
      }
    },
    sfShadowRoad: {
      hello: {
        '1': 'テレポート。興味ある？'
      },
      again: {
        '1': 'また新しい技を覚えに来たの？'
      },
      train: {
        '1': 'よく見てて。一歩で、もう別の場所よ。'
      },
      trainBack: {
        '1': 'いいわ。じゃあ、どこか別の場所へ行きなさい。'
      },
      bye: {
        '1': '捕まらないようにね。'
      }
    },
    sfShadow: {
      hello: {
        '1': '入ってきたの、気づかなかった。それ、普段はあたしの得意技なんだけど。',
        '2': 'ネトル・クイックハンドよ。静かな技を教えてる。短剣、影、それと早めに消えること。'
      },
      again: {
        '1': 'また来たの？ いいわ。誰にも見られてないといいけど。'
      },
      train: {
        '1': '足は軽く、手は素早く。自分の刃につまずかないでね。'
      },
      class: {
        '1': '相手が見てないところを突いて、次の瞬間にはまったく別の場所にいるの。',
        '2': '全部、器用さ次第よ。素早い手、素早い足、素早い逃げ足。',
        say: 'シャドウブレードって何をするの？'
      },
      ready: {
        strong: {
          '1': 'もうあたしより速いわね。好きなものを持っていって。どうせ気づかないから。'
        },
        able: {
          '1': '次の技に進めるわ。よく見てて、一度しかやらないから。'
        },
        weak: {
          '1': 'まだね。もっと速くなりなさい。じゃないと影に足をすくわれるわよ。'
        }
      },
      town: {
        '1': '静かな町に、正直な人たち。農夫のマントなんて誰も二度見しない。完璧よ。',
        say: 'どうしてサンフォードで教えてるの？'
      },
      trainBack: {
        '1': 'さあ、行って。練習は衛兵の目の届かないところでね。'
      },
      bye: {
        '1': '財布に気をつけて。'
      }
    },
    sfGeo: {
      hello: {
        '1': '岩に気をつけるんじゃ。中には聞き耳を立てとるのもおる。',
        '2': 'ハロウ・フリントじゃ。古い大地の魔法を教えておる。石、根、それに小さな地震を少々。'
      },
      again: {
        '1': 'おお、戻ったか。お前さんが来ると、大地が教えてくれたわ。'
      },
      train: {
        '1': '足を平らに、ゆっくり息をせい。足元の重みを感じるんじゃ。よし。'
      },
      class: {
        '1': '大地に助けを請うのじゃ。守りたいときは壁を、壁で足りんときは棘をな。',
        '2': '石を支えるには筋力、形作るには知力。両方が要る。',
        say: 'ジオマンサーって何をするの？'
      },
      ready: {
        strong: {
          '1': '今では石はわしより先にお前さんに応える。必要なものは何でも持っていけ。'
        },
        able: {
          '1': '次の授業に進めるぞ。地面に手を置いて、耳を澄ませ。'
        },
        weak: {
          '1': 'まだじゃな。もっと筋力をつけて頭を澄ませんと、石は耳を貸さん。'
        }
      },
      farms: {
        '1': '毎年春にな。大麦が手のひらひとつ分高く育つが、誰も理由を知らん。内緒じゃぞ。',
        say: '大地は畑も助けてくれるの？'
      },
      trainBack: {
        '1': '行け。それと、その石は元の場所に戻しておけ。'
      },
      bye: {
        '1': '静かに歩け。大地は覚えておるぞ。'
      }
    },
    smalltalkSunford: {
      weather: {
        '1': '今夜は雨だな。膝が一日じゅう痛むんだ。',
        '2': '先週も同じことを言ってたわよ、その膝。',
        '3': 'で、降っただろ？ ここじゃなかっただけさ。'
      },
      harvest: {
        '1': '今年は大麦の出来がいいね。',
        '2': 'ちゃんと収穫できるといいんだけど。'
      },
      goblins: {
        '1': 'ミラー農場の鶏が三羽、ゴブリンにさらわれたよ。',
        '2': 'また？ 今月、これで二回目じゃないか。',
        '3': '誰かがあの洞穴をどうにかしなきゃな。'
      },
      kingGone: {
        '1': 'ゴブリンキングが死んだらしいよ。',
        '2': 'よかった。これで朝まで眠れるかもな。'
      },
      pact: {
        '1': '今朝、ゴブリンからお玉を買ったの。',
        '2': '使えそう？',
        '3': '正直、うちのよりいいわ。内緒にしてね。'
      },
      bram: {
        '1': 'ブラムは日の出前からずっと金床に向かってるよ。',
        '2': '心配事があると、ああなるのよね。'
      },
      pie: {
        '1': 'あれ、アップルパイのにおいじゃない？',
        '2': 'さっきまではね。子どもたちに先に見つかっちゃって。',
        '3': 'また焼くよ。今度はもっとうまく隠さなきゃ。'
      },
      road: {
        '1': '平原の街道、もう一週間誰も通ってないな。',
        '2': '山賊がいたんじゃ無理もないさ。'
      },
      hero: {
        '1': '誰かが平原の街道の山賊を追い払ってくれたってさ。',
        '2': 'ありがたいわ。これで姉さんが遊びに来られる。'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': 'キャベツ一個が銀貨二枚。二枚だよ！',
        '2': '最近は、門を通るものは何だって高いわね。',
        '3': 'なら自分で育てるさ。屋根の上でもね。'
      },
      watch: {
        '1': '門の見張り、倍に増やしたんだって。',
        '2': 'いいことだよ。おかげで少しは安心して眠れる。'
      },
      caravan: {
        '1': '香辛料の隊商、また遅れてるな。',
        '2': '山賊かい？',
        '3': 'ぬかるみのほうだといいけどな。'
      },
      siege: {
        '1': '農場の向こうに、軍隊が陣を張ってるぞ。',
        '2': 'なら、今のうちに地下室を食料でいっぱいにしないとね。'
      },
      saved: {
        '1': '包囲が破れたとき、城壁にいたの？',
        '2': '正直に言うと、ベッドの下に隠れてた。',
        '3': '町の半分がそうだったよ。でも、こうして生きてる。'
      },
      fountain: {
        '1': '幸運を願って噴水にコインを投げたの。',
        '2': 'キャベツが安くなるようにお願いしたかい？'
      },
      ash: {
        '1': 'まだ何もかも煙のにおいがするね。',
        '2': 'そのうち薄れるさ。結局、何だってそうだよ。'
      },
      hide: {
        '1': 'ゆうべ、通りで足音がしなかった？',
        '2': '声が大きいよ。誰が聞いてるか分からないんだから。',
        '3': 'ごめん。ただ、その……ごめん。'
      },
      bread: {
        '1': 'パンが半分見つかったんだ。ほら、分けるよ。',
        '2': 'あんたはいい人だね。ありがとう。'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': '四層目に銅のいい鉱脈があるぞ。',
        '2': '銅か。銀だったらよかったのにな。',
        '3': '銅は家賃を払ってくれる。銀は夢を払ってくれるだけだ。'
      },
      forge: {
        '1': '大炉は百年間、一度も冷めたことがないんだ。',
        '2': 'うちのじいさんも、火入れを手伝ったんだぞ。'
      },
      beard: {
        '1': 'ひげを切ったな。',
        '2': '金床に近づきすぎてな。',
        '3': 'また伸びるさ。短いほうが似合ってるぞ。'
      },
      core: {
        '1': '深い坑道の底で、何か光ってるぞ。',
        '2': 'あそこで光るものにろくなものはない。上にいろ。'
      },
      order: {
        '1': '騎士団の鎧職人は仕事が早い。そこは認めるよ。',
        '2': '早いのはな。長持ちするかは見ものだ。'
      },
      circle: {
        '1': '結社の連中は、働きながら鼻歌を歌うんだな。',
        '2': '少なくともおまえの歌よりはましだ。'
      },
      cold: {
        '1': '今朝はひどい寒さだな。',
        '2': 'なら炉のそばに来いよ。'
      }
    },
    smalltalkKids: {
      tag: {
        '1': 'タッチ、次はおまえが鬼だよ！',
        '2': 'ずるい、まだ準備してなかったのに！'
      },
      dragon: {
        '1': '大きくなったら、ドラゴンに乗るんだ。',
        '2': 'ドラゴンは人を乗せてくれないよ。',
        '3': 'やさしいドラゴンなら乗せてくれるかも。'
      },
      sword: {
        '1': '見て、剣を見つけた！',
        '2': 'それ、ただの棒だよ。'
      },
      frog: {
        '1': '井戸のそばにカエルがいるよ。',
        '2': '飼ってもいい？',
        '3': 'お母さんが、もうカエルはだめって。'
      }
    },
    ui: {
      overheard: '町の人',
      hero: 'あなた',
      leave: '会話を終える',
      topics: '話すこと',
      gotGold: '{n}ゴールドを受け取った',
      gotItem: '入手：{item}',
      hint: 'マップに印をつけた：{zone}',
      needs: {
        attr: '{attr}{n}が必要',
        level: 'レベル{n}が必要',
        rep: '{faction}の評判{n}が必要',
        gold: '{n}ゴールドが必要',
        full: 'これ以上持てない',
        other: 'まだ早い'
      }
    },
    hero: {
      'siege': "城壁につこう。",
      forge: '炉を使わせてほしい。',
      learnSmith: '鍛冶を教えてもらえないか？',
      ore: '鉱石を売りたいんだ。',
      bye: 'じゃあ、邪魔しないよ。',
      trade: '品物を見せてもらえる？',
      train: '教えてくれ。',
      heal: '手当てしてもらえる？',
      mana: 'マナに効くものはある？',
      who: '失礼だけど、あなたは誰？',
      rumor: '最近、何か聞いた？',
      ready: 'もっと先に進めると思う？',
      brew: '何か調合してもらえる？',
      play: '乗った。'
    },
    sunfordSmith: {
      forge: {
        '1': '炉は熱い。指に気をつけろ。'
      },
      learnSmith: {
        '2': '金属が一番明るく光ったときに打て。外せばくず鉄だ。さあ、やれ。',
        '1': '鍛冶だと？ふむ。ハンマーはこう持て。棍棒みたいに握るな。'
      },
      ore: { '1': '鉱石か。見せてみろ。一個ずつ、正直な目方で買う。' },
      sellBack: { '1': '正直な目方に正直な金だ。見つけたらまた持ってこい。' },
      forgeBack: {
        '1': '悪くない。良くもないがな。続けろ。'
      },
      hello: {
        '1': '見ない顔だな。街道を片づけたのはあんたか？',
        '2': 'ブラムだ。ここの鍛冶屋をやってる。剣が要るなら、俺のところへ来い。'
      },
      kingDead: {
        '1': 'ゴブリンキングが死んだそうだな。いなくなっても寂しくはないさ。'
      },
      kingPact: {
        '1': '広場でゴブリンが商売してやがる。こんな日が来るとはな。'
      },
      kingRansom: {
        '1': 'ゴブリンキングに王冠を残してやったのか。あいつはまた来るぞ。'
      },
      ending: {
        '1': '国じゅうがあんたの噂だ。それでも砥石は要るのか？'
      },
      again: {
        '1': 'また来たか。何の用だ？'
      },
      trade: {
        '1': '飾りのない鋼を、まっとうな値段でな。見ていってくれ。'
      },
      who: {
        '1': 'ブラムだ。この金床に向かって、かれこれ三十年になる。',
        '2': '蹄鉄に鋤、たまに剣。最近はほとんど剣ばかりだ。'
      },
      gear: {
        '1': '殴られる気があるなら盾だな。たいていの奴はそうだ。',
        '2': '重い鋼には強い腕が要る。まずは筋力を鍛えろ。',
        say: '外へ出るなら、何を持っていけばいい？'
      },
      rumor: {
        plains: {
          '1': '平原の街道に山賊が出る。俺ならまずそこから行くね。'
        },
        hollows: {
          '1': 'ゴブリンは平原の先の洞穴から来る。王もそこにいるはずだ。'
        },
        woods: {
          '1': '平原の東がささやきの森だ。木が動くって話だぞ。'
        },
        siege: {
          '1': 'オークヘイヴンの方角に煙が見える。郊外に軍が陣を張ってるんだ。'
        },
        north: {
          '1': 'アイアンホールドの鋼がまた街道を下ってきてる。正直、俺のより出来がいい。'
        }
      },
      shopBack: {
        '1': '大事にしろよ。そうすりゃ守ってくれる。'
      },
      bye: {
        '1': '気をつけてな。'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': 'あら、こんにちは！ お買い物？ 見るだけ？ どっちでも大歓迎だよ。',
        '2': 'あたしはティリー。指輪にお守りに、あちこちの小物を扱ってるの。'
      },
      rival: {
        '1': 'ゴブリンの屋台、見た？ あっちのほうがうちより安いの。ずるいよ。'
      },
      again: {
        '1': '待ってたよ！ きっと気に入るものを、いくつか取っておいたんだ。'
      },
      trade: {
        '1': '見てって。これは幸運のお守りだよ。たぶんね。'
      },
      who: {
        '1': '街道を歩いて、みんなが手放したいものを買い取ってるの。',
        '2': 'それに、ときどき拾い物もするんだ。山賊って、逃げるときにいろいろ落とすのよ。'
      },
      trinkets: {
        '1': '左右の手に一つずつ、二つ着けられるよ。外では、小さな力もばかにならないんだ。',
        say: '装飾品って、実際何の役に立つの？'
      },
      stolen: {
        '1': 'あー。聞き方がうまいね、あなた。',
        '2': 'この指輪をあげるから、どこで見つけたかはもう聞かないで。',
        say: 'これ、本当はどこから集めてきたの？'
      },
      rumor: {
        arenaShut: {
          '1': 'ここから南に古いコロッセウムがあるよ。ゴブリンの襲撃のあいだは固く閉まってるの。'
        },
        arenaOpen: {
          '1': 'コロッセウム、また開いたよ。八ラウンドだって。みんな賭けてるみたい。'
        },
        east: {
          '1': 'オークヘイヴンは、光り物ならいい値で買ってくれるよ。森の先の東にあるの。'
        }
      },
      shopBack: {
        '1': 'お財布が重くなったら、また来てね！'
      },
      bye: {
        '1': '気をつけてね。外ではお金をしっかり握ってて。'
      }
    },
    trainerAegis: {
      hello: {
        '1': '背筋を伸ばせ。鉄の騎士団の騎士と話しているのだぞ。',
        '2': 'サー・アルドリックだ。人と危険のあいだに立つ方法を教えている。'
      },
      saved: {
        '1': 'オークヘイヴンは健在だ。城壁にいたのは君だと聞いた。見事だった。'
      },
      fallen: {
        '1': '君はオークヘイヴンの門を開けた。忘れたふりはしない。何の用だ？'
      },
      dragon: {
        '1': '峰の竜を倒したのか？ この目で見たかったな。'
      },
      friend: {
        '1': '騎士団は君を高く評価している。友人には、稽古の料金も安くなる。'
      },
      foe: {
        '1': '騎士団は君を敵と呼ぶ。それでも私は教えよう。決めたのは私で、彼らではない。'
      },
      again: {
        '1': 'また訓練か？'
      },
      train: {
        '1': 'よし。よく見ていろ、一度しか見せないぞ。'
      },
      class: {
        '1': '他人に向けられた攻撃を、代わりに受ける。単純で、そして難しい。',
        '2': '盾には筋力、構え続けるには耐久力が要る。',
        say: 'イージスナイトは、実際何をするんだ？'
      },
      ready: {
        strong: {
          '1': '私の技の大半を学べるだけの力はある。耐久力を磨き続けろ。'
        },
        able: {
          '1': '次の稽古に進んでいい。ただし、思い上がるな。'
        },
        weak: {
          '1': 'まだだ。盾より先に君が疲れてしまう。筋力と耐久力をもっと上げろ。'
        }
      },
      order: {
        '1': '我々は街道の安全と法を守っている。厳しすぎると言う者もいるがな。',
        '2': '我々の側に立つなら、鎧職人も師匠たちも君を覚えているだろう。',
        say: '鉄の騎士団について教えて。'
      },
      trainBack: {
        '1': '飽きるまで練習しろ。それから、さらに続けるんだ。'
      },
      bye: {
        '1': '慎重にな。'
      }
    },
    trainerPyro: {
      hello: {
        '1': 'あら、生徒さん？ いいわね。ちょっと下がっててくれる？',
        '2': 'エンバー・レンよ。火を教えてるの。たいてい、言うことを聞いてくれるわ。'
      },
      core: {
        '1': 'コアを結社に渡したのね！ そこから何が分かるのか、楽しみで仕方ないわ。'
      },
      friend: {
        '1': '結社はあなたを高く買ってるわよ。ちなみに、割引になるわ。'
      },
      foe: {
        '1': '結社はあなたに怒ってるの。でも教えてあげる。こっそりね。'
      },
      again: {
        '1': '戻ってきたのね！ 何か燃やす準備はいい？'
      },
      train: {
        '1': 'いい？ 私の手をよく見て。それと、袖は私から離しておいてね。'
      },
      class: {
        '1': 'だいたいは、ものに火をつけること。それから、火を思いどおりの方向に広げるの。',
        '2': '全部、知力が元よ。頭が鋭いほど、炎は熱くなるの。',
        say: 'パイロマンサーって、具体的に何をするの？'
      },
      ready: {
        strong: {
          '1': '正直に言うと、あなたも教える側になれそう。好きなものを持っていって。'
        },
        able: {
          '1': '次の呪文に進めるわ。おいで、見せてあげる。'
        },
        weak: {
          '1': 'ごめんね、まだなの。もっと知力がないと、火に飲み込まれちゃう。'
        }
      },
      circle: {
        '1': '学者の集まりよ。世界が何でできているかを調べてるの。ときどき爆発するけどね。',
        say: 'エーテル結社って誰？'
      },
      trainBack: {
        '1': '練習してきてね。燃え移らない場所でお願い。'
      },
      bye: {
        '1': '気をつけてね！'
      }
    },
    elderMara: {
      hello: {
        '1': 'おまえさんが街道から来た人かい。こっちへおいで、顔をよく見せておくれ。',
        '2': 'マーラだよ。この町の面倒を見て、もう……そうだね、四十年になるかね。'
      },
      slain: {
        '1': '洞穴は静かだよ。つらいことをしてくれたね。でも、おかげで私たちは眠れるんだ。'
      },
      pact: {
        '1': '私の広場でゴブリンが物を売ってるよ。あんたが話をつけたんだろう？'
      },
      ransom: {
        '1': 'あの王の金を取って、王冠は残したんだね。がっかりしてないとは言えないよ。'
      },
      saved: {
        '1': 'オークヘイヴンから知らせが来たよ。門は持ちこたえたって。あんたがいてくれてよかった。'
      },
      fallen: {
        '1': 'オークヘイヴンが燃えたそうだね。どうしてかは聞きたくないよ。今日はね。'
      },
      ending: {
        '1': '恐怖の要塞の運命を決めたそうじゃないか。うちの小さな街道から、そこまで行ったんだねえ。'
      },
      again: {
        '1': '少し座っておいき。街道は逃げやしないよ。'
      },
      reward: {
        '1': '民兵にできなかった街道の守りを、あんたがやってくれた。町でささやかに集めたんだよ。',
        '2': '大したものじゃないけどね。出せるだけ出したんだ。',
        say: '私に会いたいって聞いたんだけど？'
      },
      quest: {
        '1': '襲撃はゴブリンの洞穴から来るんだよ。あいつら、自分たちで王を立てたのさ。',
        '2': 'それで、その王を倒してほしいの？',
        '3': '私は襲撃が止まってほしいだけだよ。どうやってかは……向こうで、あんたが決めておくれ。',
        '4': '洞穴は平原のすぐ先だよ。どうか、気をつけてね。',
        say: 'サンフォードは何に困ってるの？'
      },
      king: {
        say: 'ゴブリンキングのことだけど……',
        slay: {
          '1': 'いなくなって、隊商がまた動いてるよ。どんな気持ちだったかは聞かないでおくよ。'
        },
        pact: {
          '1': '交易の約束かい。うちの母さんなら気絶したろうね。でも、葬式よりは交易がいいさ。'
        },
        ransom: {
          '1': '金はすぐなくなる。恨みはなくならないよ。襲撃が始まったら思い出しておくれ。'
        }
      },
      town: {
        '1': 'ほとんどは農夫だよ。鍛冶屋が一人、治療師が一人、それと私たちに付き合ってくれる先生が二人。',
        '2': '旅の合間はここで休むといいよ。家って、そのためにあるんだから。',
        say: 'サンフォードについて教えて。'
      },
      next: {
        say: '次はどこへ行けばいい？',
        plains: {
          '1': 'まず平原の街道だね。隊商が来ないと、私たちは食べていけないんだ。'
        },
        hollows: {
          '1': 'ゴブリンの洞穴だよ。襲撃が続くかぎり、ほかのどこも安全じゃないからね。'
        },
        woods: {
          '1': '東の、ささやきの森を抜けるんだよ。オークヘイヴンへ行く道さ。'
        },
        oakhaven: {
          '1': 'オークヘイヴンは包囲されてる。郊外が落ちたら、町ごと持っていかれるよ。'
        },
        north: {
          '1': '北だろうね。灰の岩山と、その先のアイアンホールド。そこからはもっと厳しくなるよ。'
        }
      },
      bye: {
        '1': '無事に帰っておいで。私の願いはそれだけだよ。'
      },
      map: {
        '1': 'ルーク隊長の地図だよ！ゴブリンに捕まる前に、地図を破いてかけらを隠したのさ。',
        '2': "かけらを六つ見つければ、Xが道を教えてくれる。灰の岩山のどこかだよ。そこを掘れば金が出るさ。",
        say: '古い地図のかけらを見つけたんだ。'
      }
    },
    sunfordHealer: {
      hello: {
        '1': 'ちょっと動かないで。……ううん、大丈夫そう。癖なの、ごめんね。',
        '2': 'シスター・ルーンよ。道で壊れたものなら、何でも直すわ。'
      },
      again: {
        '1': '無事に戻ったのね。よかった。それでも座って。'
      },
      heal: {
        '1': '座って、少し休んでいって。出かける前にフラスコを満たしておくわ。'
      },
      mana: {
        '1': 'これは苦いわよ。呪文が尽きたときに飲んでね。'
      },
      brew: {
        '1': '薬草を見せて。私のマナ・トニックよりおいしいものを調合してあげるわ。'
      },
      potions: {
        '1': 'どの戦いにも何本かフラスコを持っていくでしょう。必要になる前に飲むの、後じゃなくてね。',
        '2': 'もっと持ち歩きたいなら、大きなベルトを売ってあげるわ。',
        say: 'ポーションはどう使うの？'
      },
      rumor: {
        goblins: {
          '1': 'ゴブリンは投石の石に何かを塗ってるの。気分が悪くなったら、戻ってきてね。'
        },
        spiders: {
          '1': '今週、森でクモに咬まれた人を三人診たわ。足元に気をつけてね。'
        },
        burns: {
          '1': '北から、やけどをした兵士が次々に下りてくるの。灰の岩山だって聞いたわ。'
        }
      },
      healBack: {
        '1': 'ベルトはいっぱいにして、頭は低くね。'
      },
      brewBack: {
        '1': '気をつけて、熱いわよ。一度に全部飲まないでね。'
      },
      bye: {
        '1': '外では気をつけてね。'
      }
    },
    goblinTrader: {
      hello: {
        '1': 'あなたが約束を結んだ方ですね。我らの王は、あなたを歓迎すると申しております。',
        '2': '私はグリク。ゴブリンの作ったものを売っています。よい品を、適正な値段で。'
      },
      again: {
        '1': '友よ。また会えてうれしい。'
      },
      trade: {
        '1': 'どうぞ、見てください。これは私の家族が作りました。'
      },
      king: {
        '1': '王はいまよく食べています。襲撃もありません。私の民も、飢えが和らぎました。',
        '2': '王はよくあなたの話をします。敬意を込めて。',
        say: '王さまは元気？'
      },
      town: {
        '1': 'まだじろじろ見られます。でも、パン屋がパイをくれる。私はあのパイが好きです。',
        say: 'サンフォードは気に入った？'
      },
      rumor: {
        crags: {
          '1': '私の従兄弟たちは、北の黒い岩を掘っています。いま、あそこは火が歩いていると聞きました。'
        },
        deep: {
          '1': '深いところで、何かが目覚めつつあります。ゴブリンには、地面から伝わるのです。'
        }
      },
      shopBack: {
        '1': 'ありがとうございます。またどうぞ。'
      },
      bye: {
        '1': '道中ご無事で、友よ。'
      }
    },
    captainHale: {
      hello: {
        '1': 'また一本、剣が増えたか。いいことだ。一本でも多く欲しい。',
        '2': '隊長のヘイルだ。オークヘイヴンの守備隊の、残りを預かっている。'
      },
      saved: {
        '1': '門は持ちこたえた。三百年に、もう一年だ。その借りは返せそうにない。'
      },
      ending: {
        '1': '恐怖の要塞の行方を決めたそうだな。そこまで行くと、俺の城壁も小さく見える。'
      },
      again: {
        '1': '城壁はまだ立っている。少なくとも、今日はな。'
      },
      after: {
        '1': 'よく来た。オークヘイヴンは忘れていないぞ。'
      },
      quest: {
        '1': '悪い。クラグという軍閥の長に包囲されている。しかも奴はただでは戦わん。',
        '2': '誰が金を払ってるの？',
        '3': '灰のシンジケートだ。自分たちの町が欲しい。うちには城壁がある。',
        '4': 'オークヘイヴン郊外の奴の野営地を潰してくれ。決着はそこでつく、どちらに転ぶにせよな。',
        say: '状況はどのくらい悪いの？'
      },
      siege: {
        '1': '町の三分の一を提示されただろう？ 俺には四分の一だった。',
        '2': 'これでシンジケートはあんたを追うぞ。街道では背後に気をつけろ。',
        say: '包囲のことだけど……'
      },
      town: {
        '1': '交易の町だ。平原と山のあいだを行き来するものは、ここで通行料を払う。',
        '2': 'だから誰もがここを欲しがる。そして、だから俺は手放さない。',
        say: 'オークヘイヴンについて教えて。'
      },
      order: {
        '1': '俺が従うのはオークヘイヴンだ。騎士団とは、たいてい意見が合う。毎日ではないがな。',
        say: '鉄の騎士団の指揮下にあるの？'
      },
      rumor: {
        crags: {
          '1': '森の北は、地面が黒く燃えている。灰の岩山だ。ほとんどは狂信者どもだな。'
        },
        mines: {
          '1': 'アイアンホールドが鋼を送ってこなくなった。鉱山で何かあったんだろう。'
        },
        north: {
          '1': '極北が静まり返っている。俺の経験では、そういうときはろくなことがない。'
        }
      },
      bye: {
        '1': '剣は手元に置いておけ。'
      }
    },
    oakArmorer: {
      forge: {
        '1': '金床は好きに使って。持ちこたえる物を作っておくれ。'
      },
      learnSmith: {
        '2': '輝きを見て。その芯を三度打てば、金属が覚えてくれる。',
        '1': '技を学びたいって？いいね。オークヘイヴンにはハンマーが一本でも多く要る。'
      },
      ore: { '1': '原鉱だ！武具庫はいつも足りない。譲れる分だけ売ってくれ。' },
      sellBack: { '1': '一つ残らず城壁になる。ありがとう。' },
      forgeBack: {
        '1': 'いい鋼だ。城壁が礼を言うよ。'
      },
      hello: {
        '1': '兜が欲しいなら、すまないね。全部、城壁に上がってるよ。',
        '2': 'オドだ。鎧を作ってる。最近はあまり眠れていなくてね。'
      },
      again: {
        '1': 'まだここにいるよ。相変わらず、ほとんど何も足りないがね。'
      },
      trade: {
        '1': '在庫の半分は城壁行きになってね。残りでよければ、合うものを持っていきな。'
      },
      who: {
        '1': '二十年、この町の鎧を作ってきた。全部が一度に着られてるのは、初めて見たよ。'
      },
      armor: {
        '1': '踏ん張って戦うなら板金。動き回るなら革。素早いならローブだ。',
        say: 'どんな防具を着ればいい？'
      },
      rumor: {
        backRoom: {
          '1': '包囲が破れたら、奥の部屋を開けるよ。いい板金鎧はそこにある。'
        }
      },
      shopBack: {
        '1': 'もつさ。ここまでもってきたんだからね。'
      },
      bye: {
        '1': '外では頭を低くしてな。'
      }
    },
    oakMasterArmorer: {
      forge: {
        '1': '火は埋めて待たせてあるよ。さあ、どうぞ。'
      },
      learnSmith: {
        '2': '三打、どれも輝きの芯に。秘訣はそれだけさ。',
        '1': '包囲戦のあとは、頼まれれば誰にでも教えてるよ。さあ、ここにお立ち。'
      },
      ore: { '1': '城壁のための鉱石かね？譲れる分は一つずつ買い取ろう。' },
      sellBack: { '1': 'ありがたい。城壁の鎧板がまた増える。' },
      forgeBack: {
        '1': '打つたびに腕が上がるね。いつでもおいで。'
      },
      hello: {
        '1': '来たな！ 入っておくれ。奥の部屋は開いてるよ。あんたのためにね。',
        '2': '今じゃ親方オドなんて呼ばれてる。ちょっと平和になっただけで商売が変わるもんだ。'
      },
      ending: {
        '1': 'うちの門から恐怖の要塞まで。あんたの鎧を仕立てたのは私だって、みんなに言ってるんだ。'
      },
      again: {
        '1': 'よく来たね。今日は何にする？'
      },
      trade: {
        '1': 'いい板金鎧を出したよ。見る資格は十分すぎるほどあるさ。'
      },
      town: {
        '1': '忙しくて、うるさくて、通行料に文句を言う商人でいっぱいだよ。',
        '2': '最高じゃないか。ここ何週間も、静かな時間なんて一時間もないよ。',
        say: '町の様子はどう？'
      },
      rumor: {
        mines: {
          '1': 'うちの鋼はアイアンホールドのものなんだが、連絡が途絶えてる。誰かが鉱山を見に行くべきだな。'
        },
        tundra: {
          '1': '今まで扱った中で最高の鉱石は、ツンドラから出たものだった。見つけた連中は戻らなかったがね。'
        }
      },
      shopBack: {
        '1': 'しっくりこなかったら持ってきな。直してやるよ。'
      },
      bye: {
        '1': 'いつでも歓迎だよ。'
      }
    },
    oakWeapons: {
      hello: {
        '1': '見るだけ？ 買う？ どっちでもいいよ。刃には触らないでね。',
        '2': 'セナ。刃物を売ってる。使い道はあなたの勝手よ。'
      },
      saved: {
        '1': '包囲が破れたのね。町にはいいことよ。まあ、商売には戦争のほうがよかったけど。'
      },
      again: {
        '1': 'もっと鋭いのをお探し？'
      },
      trade: {
        '1': '切れ味よし、バランスよし、値段も良心的。ゆっくり見て。'
      },
      who: {
        '1': '三つの戦争で、両方の側に売ってきたの。私はまだここにいる。大半の客はいないけどね。'
      },
      rumor: {
        krag: {
          '1': 'クラグの手下はいい鋼を持ってるわ。シンジケートの金ね。機会があれば拾う価値あり。'
        },
        which: {
          '1': '素早い刃には器用さ、弓と銃には技量。自分がどっちか、知っておくことね。'
        }
      },
      shopBack: {
        '1': '油は切らさないで。錆は骨より早く、いい刃を駄目にするから。'
      },
      bye: {
        '1': 'うちに借金したまま死なないでね。'
      }
    },
    trainerShadow: {
      hello: {
        '1': '後ろに回ったのに気づかなかっただろう。たいていの奴はそうだ。',
        '2': '俺は「ささやき」と呼ばれてる。見つからない方法を教えてる。'
      },
      fallen: {
        '1': '町は静かになったな。見張りも減った。俺たちの中には、仕事がしやすくなった奴もいる。'
      },
      friend: {
        '1': 'シンジケートはあんたを友と見てる。友は安く済む。覚えておけ。'
      },
      foe: {
        '1': 'シンジケートはあんたの首を欲しがってる。俺は教えるために雇われたんだ。殺すためじゃない。だから、稽古だ。'
      },
      again: {
        '1': 'まだ音が大きいな。そこを直していこう。'
      },
      train: {
        '1': 'では静かに。手じゃなくて、足を見て。'
      },
      class: {
        '1': 'もう背後にいる者のことだ。入って、一太刀、そして消える。',
        '2': '何より大事なのは器用さ。切りつけを効かせたいなら、技量もだ。',
        say: 'シャドウブレードって何？'
      },
      ready: {
        strong: {
          '1': 'もう動きがいい。残りも持っていけ。煙玉には、技量も持ってこい。'
        },
        able: {
          '1': '手は十分速い。次へ行こう。'
        },
        weak: {
          '1': 'まだだ。足取りが重い。器用さを鍛えろ。'
        }
      },
      syndicate: {
        '1': '法には値段があると気づいた連中さ。俺は裁かない。ただ報酬をもらうだけだ。',
        say: '灰のシンジケートって誰？'
      },
      trainBack: {
        '1': '今度は誰にも見られない場所で練習しろ。'
      },
      bye: {
        '1': '私に会ってないわよね。'
      }
    },
    trainerSovereign: {
      hello: {
        '1': '近づいてよい。それ以上は近づくな。',
        '2': 'オークヘイヴン最古の家柄、カステラン卿だ。私は指揮の仕方を教えている。'
      },
      saved: {
        '1': '私の町は無事で、家の名も守られた。礼を言う。心からだ。'
      },
      friend: {
        '1': '騎士団の友人か。料金は下げよう。ただし、言いふらさないでくれ。'
      },
      foe: {
        '1': '騎士団の名簿に、君の名が載っている。だが教えてやろう。金は金だ。'
      },
      again: {
        '1': 'ああ、また君か。続けるとしようか。'
      },
      train: {
        '1': 'よろしい。命令がどう出され、どう従われるかを見ていなさい。'
      },
      class: {
        '1': '一人では戦わない者だ。衛兵を呼べば、彼らが代わりに戦う。',
        '2': '魅力が要る。声の届かない指導者に、誰もついてはいかない。',
        say: 'グランドソブリンとは？'
      },
      ready: {
        strong: {
          '1': '君には確かな存在感がある。私の稽古は、残りもすべて受けなさい。'
        },
        able: {
          '1': '声がよく通るようになった。次の稽古に進んでよい。'
        },
        weak: {
          '1': '残念ながら、今の君にはまだ誰もついてこない。魅力を磨きなさい。'
        }
      },
      family: {
        '1': 'ヘイル隊長が立っている城壁は、我が家が築いたものだ。彼は忘れている。私が思い出させている。',
        say: 'あなたの家について教えて。'
      },
      trainBack: {
        '1': 'では行きなさい。誰かを導いてみるのだ。'
      },
      bye: {
        '1': 'ごきげんよう。'
      }
    },
    oakHealer: {
      hello: {
        '1': '次の方！ おや、歩いてきたのか。これは珍しい。',
        '2': 'ブラザー・フェンです。城壁に負傷者が四十人、なのに私は一人きりで。'
      },
      saved: {
        '1': '三日間、新しい負傷者がいなくてね。何をしていいか分からないくらいですよ。'
      },
      again: {
        '1': 'また来ましたね、自分の足で。いいことです。'
      },
      heal: {
        '1': 'ここに横になって、清潔なほうの簡易寝台です。はい。フラスコは満たしました、行っていいですよ。'
      },
      mana: {
        '1': 'マナの薬です。古い硬貨みたいな味ですが、効きます。'
      },
      potions: {
        '1': 'ベルトが長ければ、ええ。それは売っています。フラスコの補充は無料です。',
        say: 'ポーションをもっと持てる？'
      },
      rumor: {
        archers: {
          '1': 'クラグの弓兵は低く狙ってきます。動き続ければ、たいてい外れますよ。'
        },
        north: {
          '1': 'やけど、凍傷、それから像に噛まれたと言い張る男が一人。そんな患者ばかりです。'
        }
      },
      healBack: {
        '1': 'さあ、行って。今度は縫う用事じゃなく、おしゃべりに来てください。'
      },
      bye: {
        '1': 'お大事に。それと、何か食べてくださいね。'
      }
    },
    blackMarket: {
      hello: {
        '1': 'ここじゃ名前は出さない。だが、誰が門を開けたかは知ってる。みんな知ってるさ。',
        '2': '故買屋とでも呼んでくれ。ここの品は全部、どこかから来たものだ。'
      },
      foe: {
        '1': 'シンジケートは今、あんたを好いちゃいない。でもあんたの金なら、歓迎だ。'
      },
      again: {
        '1': 'また来たのか。誰にもつけられてないだろうな？'
      },
      trade: {
        '1': 'どっちも詮索なしだ。シンジケートが取り分をもらい、あんたは品物をもらう。'
      },
      who: {
        '1': '火事の前は、ろうそくを売ってた。まっとうな商売さ。儲からなかったがな。'
      },
      armor: {
        '1': '鎧職人はもういないぞ、友よ。理由は、俺よりあんたのほうが詳しいだろう。',
        say: '防具は売ってる？'
      },
      rumor: {
        citadel: {
          '1': '去年、極北に要塞が現れた。誰が建てたわけでもないのにな。'
        },
        crystals: {
          '1': '誰かが虚無のクリスタルを手当たりしだいに買い集めてる。うちじゃない。それが気になるんだ。'
        }
      },
      shopBack: {
        '1': 'あんたはここに来てない。'
      },
      bye: {
        '1': '足元に気をつけな。がれきは動くからな。'
      }
    },
    trainerBlood: {
      hello: {
        '1': 'お客さんですか。瓶には触らないでくださいね。',
        '2': 'サングレル博士です。オークヘイヴンの新しい持ち主は、何を教えているかを聞きません。心安らぎます。'
      },
      found: {
        '1': '見つけましたか。こんな場所で医者を訪ねてくる人は、そういませんよ。',
        '2': 'サングレル博士です。私のような者は町に焼かれるので、人のいない所で働いています。'
      },
      friend: {
        '1': 'シンジケートがあなたを推しています。その友人には安くしますが、水準は変えません。'
      },
      foe: {
        '1': 'シンジケートは、あなたの血に高値をつけるでしょう。私は、ここで使っていただきたいですね。'
      },
      again: {
        '1': '顔色が悪いですね。結構。この仕事にはお似合いです。'
      },
      train: {
        '1': '袖をまくってください。痛みます。そこが肝心なのですよ。'
      },
      class: {
        '1': '自分の体力を力の代価にして、それを敵から取り戻すのです。',
        '2': '耐久力は、使える元手です。知力は、その使い方のうまさです。',
        say: 'ブラッドアルケミストとは？'
      },
      ready: {
        strong: {
          '1': '素晴らしい体質です。ほぼ全部を学べますよ。'
        },
        able: {
          '1': '次の稽古に進めるだけの丈夫さはありますね。'
        },
        weak: {
          '1': '最初の一太刀で気を失ってしまいますよ。まず耐久力を鍛えてください。'
        }
      },
      jars: {
        '1': '標本です。ほとんどは、快く提供していただいたものですよ。',
        say: '瓶の中身は何？'
      },
      trainBack: {
        '1': 'ぜひ記録をつけてください。どうなったか、聞かせてほしいので。'
      },
      bye: {
        '1': '健康でいてくださいね。本心ですよ。'
      }
    },
    syndicateBoss: {
      hello: {
        '1': 'あなたが門を開けた人ね。座って。椅子くらいは当然よ。',
        '2': 'マダム・アッシュと呼ばれてるわ。オークヘイヴンはもう私たちのもの。あなたのおかげでもあるわね。'
      },
      throneOurs: {
        '1': '恐怖の要塞が私たちの手に。一枚残らず、払った甲斐があったわ。'
      },
      throneLost: {
        '1': '玉座を別の誰かに渡したのね。それは話し合いましょう。今日じゃなくて。'
      },
      foe: {
        '1': '私たちに逆らって動いていたのね。それでも座って。誰を相手にしてるか知っておきたいの。'
      },
      again: {
        '1': 'また来たのね。シンジケートに何ができるかしら？'
      },
      cut: {
        '1': 'ええ、受け取れるわ。今のところは廃墟の分け前だけど。これが今季の分よ。',
        '2': '増えていくわ。廃墟だって、唯一の市場を握っていれば、とてもよく稼ぐの。',
        say: 'オークヘイヴンの分け前をくれる約束だったよね。'
      },
      syndicate: {
        '1': 'みんなが欲しがるものよ。私たちは、そうじゃないふりをしないだけ。',
        '2': '仲良くしていれば、ささやきと博士の稽古も安くなるわ。',
        say: 'シンジケートは、本当は何が欲しいの？'
      },
      order: {
        '1': '当然よ。あなたは彼らの町を一つ燃やしたんだもの。ポーションは多めに持ち歩くことね。',
        say: '鉄の騎士団に追われてる。'
      },
      rumor: {
        core: {
          '1': 'ドワーフが鉱山で何かを見つけたの。コアよ。うちに持ってきて、値段を言いなさい。'
        },
        sold: {
          '1': 'コアは無事に届いたわ。錠前にどう効くか、驚くわよ。'
        },
        north: {
          '1': '価値あるものは、みんな北へ移ったわ。私たちもよ。'
        }
      },
      bye: {
        '1': '他人行儀はなしよ。よそ者には目を光らせてるけどね。'
      }
    },
    forgemaster: {
      hello: {
        '1': '鉱山を抜けてきたな。体に粉塵のにおいが付いてる。',
        '2': 'ドルンだ。アイアンホールドの鍛冶頭だ。山ほどでかい問題を抱えてる。'
      },
      destroyed: {
        '1': '光は消え、ゴーレムはくず鉄だ。ゆうべ、坑夫たちが歌った。一年ぶりにな。'
      },
      studied: {
        '1': '炉には青い炎、広間にはローブの学者たち。まあ、仕事の出来はいい。'
      },
      sold: {
        '1': '売ったのか。ゴーレムはまだ歩き、鉱山はまだ墓場だ。ほっといてくれ。'
      },
      ending: {
        '1': '玉座の件は片づいたか。よし。これでやっと掘り仕事に戻れる。'
      },
      again: {
        '1': '何だ？ 炉は待ってくれんぞ。'
      },
      quest: {
        '1': '鉄を掘っていたら、心臓が出てきた。エーテルコアだ。脈打つのが分かる。',
        '2': 'それで、ゴーレムは？',
        '3': 'ゴーレムはその拍動に合わせて動く。三つの勢力が、欲しいと手紙をよこした。どれも信用できん。',
        '4': '先にたどり着くのはあんただ、アイアンホールド鉱山の底でな。そこからどうするかは、あんた次第だ。',
        say: '鉱山の底で何があったの？'
      },
      core: {
        say: 'コアのことだけど……',
        destroy: {
          '1': '仲間を救うために、奇跡を壊してくれたな。騎士団は鎧職人を送ってきた。俺は麦酒を送った。'
        },
        study: {
          '1': '結社の連中は変わり者だが、銃はまっすぐ飛ぶ。まあ、悪くない。'
        },
        sell: {
          '1': '金のためにやったんだな。それで体が温まるといいがな。'
        }
      },
      town: {
        '1': '鉱山が動いてるときは、この国で最高の鋼だ。',
        '2': '石足は大地、ピムは機械を教える。どっちも長話だぞ。',
        say: 'アイアンホールドについて教えて。'
      },
      rumor: {
        tundra: {
          '1': '岩山の東は、土地が白くなる。凍傷のツンドラだ。巨人と、もっとひどいものがいる。'
        },
        citadel: {
          '1': 'うちの斥候が、北に去年はなかった要塞を見た。気に食わんな。'
        },
        fortress: {
          '1': 'すべては恐怖の要塞で終わる。北へ向かう道は、全部そこへ通じてる。'
        }
      },
      bye: {
        '1': '達者でな。'
      }
    },
    ironWeapons: {
      forge: {
        '1': '火花に気をつけろ。それと、わしの上等なハンマーには触るな。'
      },
      learnSmith: {
        '2': 'いつ打つかは輝きが教える。どれだけ強くかは腕が教える。三打だ。',
        '1': '地上の者が金床に？まあ、誰にでも最初はあるもんだ。'
      },
      ore: { '1': 'いい、正直な金属だ。並べな、一個ずつ払う。' },
      sellBack: { '1': '公正な取引だ。アイアンホールドはいい金属に必ず払う。' },
      forgeBack: {
        '1': 'ドワーフならもっとうまくやった。だが大差はない。'
      },
      hello: {
        '1': '展示品には気をつけて。どれも両刃で、よく切れるよ。',
        '2': '鉄槌のヒルダだ。ここの品は全部、ドワーフの手で鍛えたものさ。'
      },
      dragon: {
        '1': '竜を倒したのかい？ うちの剣を使ってくれたんならいいんだけどね。'
      },
      again: {
        '1': '本物の鋼を買いに戻ったかい？'
      },
      trade: {
        '1': 'ドワーフ鍛えさ。もしどれかが折れたら、どうしてか教えとくれ。'
      },
      who: {
        '1': '母は王様たちのために鍛えてた。私は、戸口をくぐる誰のためにでも鍛えるよ。'
      },
      rumor: {
        golems: {
          '1': 'あそこのゴーレムは、うちの鉄でできてるんだ。正直、こたえるよ。'
        },
        arm: {
          '1': 'いい剣は仕事の半分をしてくれる。残りは、あんたの筋力しだいさ。'
        }
      },
      shopBack: {
        '1': '刃こぼれして戻ってきたら、しっかり使ったんだなって分かるよ。'
      },
      bye: {
        '1': '思いっきり打ち込みな。'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': '気をつけて、それは弾が入ってるよ。というか、ほとんどそうなんだけど。',
        '2': '細工師ヴォスだよ。結社の命でコアを調べに来たんだ。おかげでたくさん学べたよ。'
      },
      again: {
        '1': 'ああ、よかった。前に来てから、少し手を加えたんだ。'
      },
      trade: {
        '1': 'ここの品は全部、コアの研究から生まれたんだ。ただ、僕には向けないでね。'
      },
      core: {
        '1': 'あの金属、少しだけ考えるんだ。あまり深く考えないようにしてるけどね。',
        say: 'コアから何を学んだの？'
      },
      rumor: {
        heat: {
          '1': '銃は技量で動いて、熱くなるんだ。手をやけどする前に、熱のことをピムに聞いてみて。'
        }
      },
      shopBack: {
        '1': '使い心地を教えてね。記録をつけてるんだ。'
      },
      bye: {
        '1': '反動に気をつけて。'
      }
    },
    ironArmor: {
      forge: {
        '1': '炉はいつでも使える。お前次第だ。'
      },
      learnSmith: {
        '2': '熱し、打ち、返す。輝きのど真ん中に三打。それから冷ます。',
        '1': '板金は根気の仕事だ。基本を教えよう。'
      },
      ore: { '1': '量らせてくれ。売る分を選べ、金は俺が数える。' },
      sellBack: { '1': '量って、払った。よし。' },
      forgeBack: {
        '1': '身につける前に冷ませ。'
      },
      hello: {
        '1': 'ガルンだ。鎧は棚に、指輪は皿の上。'
      },
      again: {
        '1': '戻ったか。何が要る？'
      },
      trade: {
        '1': 'この板金なら、巨人の棍棒も止まる。見てみろ。'
      },
      quiet: {
        '1': '言うほどのことはない。',
        say: 'あまりしゃべらないんだね？'
      },
      rumor: {
        giants: {
          '1': 'ツンドラには巨人がいる。棍棒は丸太のようだ。俺なら重い板金を選ぶ。'
        },
        demons: {
          '1': '北には悪魔がいる。炎と爪だ。俺なら重い板金を選ぶ。'
        }
      },
      shopBack: {
        '1': 'いい選択だ。'
      },
      bye: {
        '1': '気をつけろ。'
      }
    },
    ironOrderArmor: {
      forge: {
        '1': '騎士団の炉を、名誉をもって使え。'
      },
      learnSmith: {
        '2': '戦場と同じく、金床でも規律だ。輝きに忠実に、三打。',
        '1': '騎士団は友を武装させる。君に教えよう。'
      },
      ore: { '1': '騎士団は戦のために鉱石を買う。譲れる分を売ってくれ。' },
      sellBack: { '1': '支払いは記録した。騎士団が感謝する。' },
      forgeBack: {
        '1': '見事な鍛えだ。それを着て立派に務めよ。'
      },
      hello: {
        '1': 'コアを壊したのは君だな。騎士団はそれを覚えている。',
        '2': '騎士団の補給係だ。我らの武具庫は、君に開かれている。'
      },
      throneOurs: {
        '1': '君のおかげで、騎士団が恐怖の要塞を握った。楽にしてくれ。それだけの働きをしたのだから。'
      },
      foe: {
        '1': '騎士団は君を名簿に載せている。だが、命令は君にも売れと言っている。従うまでだ。'
      },
      again: {
        '1': '何が必要だ？'
      },
      trade: {
        '1': '必要なものを持っていけ。騎士団は身内を大事にする。'
      },
      order: {
        '1': '今は何もない。珍しいことだ。味わっておくといい。',
        say: '騎士団は私に何を求めてるの？'
      },
      rumor: {
        throne: {
          '1': '騎士団は恐怖の要塞の玉座を求めるだろう。誰が手を貸したかは、忘れまい。'
        }
      },
      shopBack: {
        '1': '大切に扱え。その中で血を流すまでは、騎士団の備品だ。'
      },
      bye: {
        '1': '任務を続けろ。'
      }
    },
    trainerGeo: {
      hello: {
        '1': 'ゆっくりだ。山はどこへも行かんよ。',
        '2': '石足じいさんと呼ばれとる。地面の声を聞くんじゃ。ときどき、答えてくれる。'
      },
      core: {
        '1': 'おまえさんが下へ行ってから、山の感じが変わった。穏やかになったか、空っぽになったか。'
      },
      dragon: {
        '1': '昨日、竜が峰の上を飛んで、わしらを放っていったよ。おまえさんの仕業だそうだな。'
      },
      again: {
        '1': '来たな。戻ってくると思っておった。'
      },
      train: {
        '1': '足を踏ん張れ。感じるか？ いや？ そこから始めるんだ。'
      },
      class: {
        '1': '壁を立て、杭を呼び起こし、必要なら大地を砕く。',
        '2': '石を動かすには筋力、石の行きたい先を知るには知力だ。',
        say: 'ジオマンサーは何をするの？'
      },
      ready: {
        strong: {
          '1': '石はもうおまえさんを知っておる。残りは、その気になったときに学べ。'
        },
        able: {
          '1': '次の稽古に進めるほど、足腰は据わってきたな。'
        },
        weak: {
          '1': 'まだだ。石はおまえさんのためには動かん。筋力をつけなさい。'
        }
      },
      factions: {
        '1': 'どれにもつかん。騎士団も結社も、来ては去る。山は残る。',
        say: 'どの勢力に仕えてるの？'
      },
      trainBack: {
        '1': 'ゆっくりやるといい。大地は辛抱強いからな。'
      },
      bye: {
        '1': 'そっと歩きなされ。'
      }
    },
    trainerAether: {
      hello: {
        '1': 'あっ、待って、それ触らないで！ それもだめ。ラグの上に立って、そこなら安全だから。',
        '2': '歯車技師ピムだよ。銃とタレットと、熱ゲージをいっぱい作ってるんだ。'
      },
      core: {
        '1': 'コアを結社に渡したんだね！ あれからほとんど眠れてないよ。いい意味でね。'
      },
      oracle: {
        '1': '結社は神託の巫女のことで怒ってるよ。僕は作るだけ。巻き込まれたくないな。'
      },
      friend: {
        '1': '結社の友人だから、稽古は安くなるよ。書類は僕が出しておいた。'
      },
      foe: {
        '1': '結社は、君に教えるなって言うんだ。それでも教えるよ。彼らには内緒ね。'
      },
      again: {
        '1': 'よかった、指は全部そろってるね。'
      },
      train: {
        '1': 'よし。まず安全確認、それからうるさい部分だよ。'
      },
      class: {
        '1': '銃にタレットに熱ゲージ。撃って、組み立てて、固まる前に排熱するんだ。',
        '2': 'ほとんどは技量。大きい機械には、ちょっと知力も要るよ。',
        say: 'エーテルテックって何？'
      },
      ready: {
        strong: {
          '1': 'もうタレットの扱いは任せられるね。大きい機械も持っていって。'
        },
        able: {
          '1': '手が安定してるね。次に進めるよ。'
        },
        weak: {
          '1': 'まだ狙いがちょっとぶれてるね。技量にポイントを振ってみて。'
        }
      },
      heat: {
        '1': '数秒間、全部固まっちゃうんだ。早めに、こまめに排熱して。これは信じて。',
        say: 'オーバーヒートするとどうなるの？'
      },
      trainBack: {
        '1': 'それと、熱に吹き飛ばされる前に、熱を逃がすのを忘れずにね。'
      },
      bye: {
        '1': '気をつけてね！'
      }
    },
    ironHealer: {
      hello: {
        '1': '入口でブーツは脱いでおくれ。さっき掃いたばかりなんだよ。',
        '2': 'マザー・ブリュンヤだよ。この山の折れた骨は、たいてい私が直してきたのさ。'
      },
      ending: {
        '1': '恐怖の要塞へ行って、帰ってきたんだね。お座り。顔を見せてごらん。'
      },
      again: {
        '1': 'まだ生きてるね。結構。お座り。'
      },
      heal: {
        '1': 'これをお飲み。そんな顔をするんじゃないよ。フラスコは満タンだ。'
      },
      mana: {
        '1': 'ほら。ひどい味だよ。魔力が尽きたときに飲むんだ、その前じゃなくてね。'
      },
      potions: {
        '1': '長いベルトも売れるよ。フラスコは五本が、走れる限界だよ。',
        say: 'ポーションをもっと持てる？'
      },
      rumor: {
        tundra: {
          '1': 'ツンドラは指やつま先を持っていくよ。動き続けて、雪の中で眠っちゃいけない。'
        },
        temple: {
          '1': 'ツンドラの先に、沈んだ神殿がある。そこのナーガは捕虜を取らないよ。'
        },
        rift: {
          '1': 'あの裂け目にあるものは、私にも縫えやしない。近づかせちゃだめだよ。'
        }
      },
      healBack: {
        '1': 'さあ、お行き。それと何か食べなさい、痩せすぎだよ。'
      },
      bye: {
        '1': '無事に戻っておいで。'
      }
    },
    exiledSovereign: {
      hello: {
        '1': 'おまえか。私の門を開けたのは。',
        '2': '今は地下室で教えている。食べていかねばならんからだ。許したとは思うな。'
      },
      ending: {
        '1': '玉座は決まり、オークヘイヴンはまだ灰のままか。それだけの価値があったのならいいが。'
      },
      again: {
        '1': '戻ったか。私の料金は変わっていない。'
      },
      train: {
        '1': '指揮の仕方は教えよう。おまえにその資格があるかは、別の話だ。'
      },
      class: {
        '1': '人がついてくる者だ。呼べば衛兵が来て、言葉ひとつで戦う。',
        '2': '魅力で動く。おまえにはある。だから、許しがたいのだ。',
        say: 'グランドソブリンとは？'
      },
      ready: {
        strong: {
          '1': 'おまえには、すべてをこなす存在感がある。もっとよい使い方をしてくれていればな。'
        },
        able: {
          '1': '次の稽古に進んでよい。うれしいとは言わんぞ。'
        },
        weak: {
          '1': 'まだ誰もおまえにはついてこん。魅力を磨け。'
        }
      },
      oakhaven: {
        '1': '三百年。我が家があの城壁を築いた。',
        '2': '説明はやめてくれ。何を言われても、償いにはならん。',
        say: 'オークヘイヴンのことだけど……'
      },
      trainBack: {
        '1': '行け。ほかの誰かで練習しろ。'
      },
      bye: {
        '1': 'もう放っておいてくれ。'
      }
    },
    trainerChrono: {
      fled: {
        '1': '彼女を倒したんだね。何年も前から分かっていたのに、それでも胸が痛むよ。',
        '2': '私は時の番人。君に教えよう。彼女が、そうなると言っていたから。'
      },
      hello: {
        '1': '来たね。ずっと君を待っていたよ。あるいは、待っていたことになるよ。',
        '2': '私は時の番人。時間を少しだけ曲げる方法を教えているよ。'
      },
      freed: {
        '1': '彼女は自由だ。初めて、この先どうなるか私にも分からない。すばらしいよ。'
      },
      friend: {
        '1': '結社は君を高く評価しているから、稽古は安くなるよ。先週、そう決まったんだ。'
      },
      foe: {
        '1': '結社は今、君に怒っている。いずれ収まるよ。それまでは、ここだけの話にしておこう。'
      },
      again: {
        '1': 'おかえり。ちょうどいい時間だよ。'
      },
      train: {
        '1': 'よく見ていて。それから、少し前のところをもう一度見て。'
      },
      class: {
        '1': '敵を時間の中で止め、味方を急がせ、失敗を取り消すんだ。',
        '2': '糸を見るには知力、それを引くには技量だよ。',
        say: 'クロノウィーバーとは？'
      },
      ready: {
        strong: {
          '1': '糸の扱いがうまいね。残りも、いつでも持っていっていいよ。'
        },
        able: {
          '1': '準備はできているね。聞かれる前から分かっていたよ。'
        },
        weak: {
          '1': '糸がすぐ滑ってしまうね。知力をもっと、技量ももっとだよ。'
        }
      },
      oracle: {
        say: '巫女について教えて。',
        freed: {
          '1': '彼女はあらゆる結末を見てきたのに、自分の結末だけは見えなかった。これから、それを知ることになる。'
        },
        slain: {
          '1': '彼女は抵抗しなかった。もう見ていたから。お願いだ、二度と聞かないでほしい。'
        },
        waits: {
          '1': '彼女はすべての結末を見通す。背負うには重いものだよ。やさしくしてあげて。'
        }
      },
      trainBack: {
        '1': 'あとで意味が分かるよ。たいていはそうなんだ。'
      },
      bye: {
        '1': 'また会う日まで。あるいは、その前に。'
      }
    },
    quest: {
      seal: {
        ask: { '1': "古の竜は倒れ、裂け目があなたの前に口を開けている。", '2': "今ならこれを永遠に封じられる。獣たちは再び眠りにつくだろう。", '3': "あるいは少しだけ開いたままにして、勇者たちに、そこから来るものと腕を競わせることもできる。" },
        seal: { say: "封じる。永遠に。", '1': "裂け目は傷が癒えるように閉じ、空は静まり返った。" },
        ajar: { say: "少し開けておこう。備えはできている。", '1': "裂け目はわずかに開いたまま。その向こうで何かが笑っている。" },
      },
      goblinKing: {
        ask: {
          '1': '待ってくれ。頼む。降参する。',
          '2': '我が民が襲うのは、飢えているからだ。それが真実だ。',
          '3': '代わりに取引をしよう。おまえたちの種族と、我らとで。'
        },
        slay: {
          '1': 'ゴブリンキングは倒れ、洞穴は空になる。',
          '2': 'サンフォードは安らかに眠り、鉄の騎士団はあなたの名を耳にする。',
          say: '取引はなしだ。襲撃はここで終わりにする。'
        },
        pact: {
          '1': '交易。そうしよう。我が王冠にかけて誓う。',
          '2': 'ゴブリンの商人がサンフォードの広場に店を出し、あの町の鍛冶屋には作れないものを売る。',
          say: '襲撃をやめて、代わりにサンフォードと交易しろ。誓うんだ。'
        },
        ransom: {
          '1': '全部か？ ……分かった。持っていけ、そして去れ。',
          '2': 'あなたはゴブリンの金を手に去る。襲撃はまた始まるが、シンジケートは満足する。',
          say: '財宝を渡せば、王冠は持たせておいてやる。'
        }
      },
      siege: {
        ask: {
          '1': 'もういい。よく戦うな、それは認めよう。',
          '2': 'シンジケートは、あの町よりずっといい金を払う。',
          '3': '今夜、門を開けてくれ。オークヘイヴンの三分の一はお前のものだ。'
        },
        defend: {
          '1': 'ならばシンジケートは、あらゆる街道であなたを狩る。誘ったことは覚えておけ。',
          '2': '門は持ちこたえる。オークヘイヴンはその内側で豊かになり、鎧職人たちはあなたの名を覚えている。',
          say: '門は閉じたままだ。軍を連れて立ち去れ。'
        },
        betray: {
          '1': '賢明だ。マダム・アッシュも喜ぶだろう。',
          '2': 'オークヘイヴンは燃える。廃墟の中に闇市が開き、一人の錬金術師が密かに教え始める。',
          '3': '鎧職人たちは去り、鉄の騎士団はあなたを裏切り者と呼ぶ。',
          say: '町の三分の一か。いいだろう。今夜、門を開ける。'
        }
      },
      core: {
        ask: {
          '1': 'コロッサスはくず鉄だ。この目で見る日が来るとは思わなかった。',
          '2': 'それに、コアがある。まだ唸っている。触ると温かい。',
          '3': '先に着いたのは君だ。さて……どうする？'
        },
        destroy: {
          '1': '光は消え、ゴーレムはその場に崩れ落ちる。',
          '2': '感謝のしるしに、鉄の騎士団が自前の鎧職人をアイアンホールドへ送る。',
          say: '下がっていて。これを壊す。'
        },
        study: {
          '1': '君なら、コアを起こさずに動かせるだけの知識がある。',
          '2': '一季のうちに、アイアンホールドの炉は誰も見たことのないエーテル細工を作り始める。',
          say: '結社に研究させよう。安全に運び出せると思う。'
        },
        sell: {
          '1': '金か。坑夫たちを殺したあれに。持って行け。',
          '2': '大金が動く。コアは光り続け、鉱山に静けさは二度と戻らない。',
          say: 'シンジケートの条件が一番よかった。'
        }
      },
      oracle: {
        ask: {
          '1': 'この瞬間を、数えきれないほど見てきました。',
          '2': '半分では、あなたは私を自由にします。残りの半分では、私が守るものを奪います。',
          '3': '選んでください。一度だけでいいから、次に何が来るか知らずにいたいのです。'
        },
        free: {
          '1': 'まあ。これは見えていませんでした。本当に、見えていなかった。',
          '2': '神託の巫女は水を昇って消える。弟子は、教えるためにここに残る。',
          say: 'じっとして。鎖を壊す。'
        },
        slay: {
          '1': 'ええ。これがもう半分。',
          '2': '彼女は抵抗しない。時守の砂時計は、あなたのものになる。',
          '3': '最後の弟子は神殿から逃げ出し、結社はあなたを許さない。',
          say: '砂時計をもらいに来た。'
        }
      },
      dragon: {
        ask: {
          '1': 'もうよい。牙があるな、小さき者よ。',
          '2': '要塞の悪魔が我が同族を鎖につないだ。奴が燃えるのを見たい。',
          '3': '我を殺すか、それとも我に手伝わせるか。'
        },
        slay: {
          '1': '竜が倒れ、山が震える。竜の財宝はあなたのものだ。',
          '2': '鉄の騎士団は竜殺しを歌にする。',
          say: '竜とは取引しない。'
        },
        pact: {
          '1': '頼む者などほとんどおらん。よかろう。共に狩るとしよう。',
          '2': '恐怖の要塞へ進軍するとき、一頭の竜があなたの上を飛ぶ。',
          say: 'なら、大悪魔と戦うために力を貸してくれ。'
        }
      },
      throne: {
        ask: {
          '1': 'そうか。終わりだな。君だとは思わなかった。',
          '2': '私の玉座は空のままではいない。手にした者が、要塞と裂け目を支配する。',
          '3': 'すでに三人の使者が戸口で待っている。次に来るのは誰か、君が選べ。'
        },
        order: {
          '1': '騎士団は要塞に兵を置き、封じられるものは封じる。',
          '2': '王国は安全になる。そして、何をすべきか指図されるようになる。',
          say: '鉄の騎士団が守る。'
        },
        syndicate: {
          '1': 'シンジケートは夜明け前に入りこむ。',
          '2': 'これからは何にでも値がつく。平和でさえもだ。',
          say: '灰のシンジケートにふさわしい。'
        },
        circle: {
          '1': '結社は要塞を、裂け目の上に建つ学校に変える。',
          '2': '彼らは研究と呼ぶ。ほかの者は息をひそめる。',
          say: 'エーテル結社に任せよう。'
        },
        shatter: {
          '1': 'あなたは自らの手で玉座を砕く。もう誰も、ここから支配することはない。',
          '2': '使者たちは何も言わずに去る。',
          say: '誰にも渡さない。これは壊す。'
        },
        claim: {
          '1': '玉座は冷たい。そして、ぴったりだ。',
          '2': '三つの勢力は、共通の敵がいることに気づく。',
          say: '自分で手に入れる。'
        }
      }
    },
    bark: {
      sphinx: {
        intro: { '1': "答えなさい、小さき者。さもなくば砂に埋もれるがいい。" },
        riddle: { '1': "では謎かけを。わたしが示す場所を、その順に踏みなさい。" },
        sand: { '1': "今度は五つ。わたしの砂は待ってくれない。" },
        death: { '1': "見事な答えだ。砂はもうあなたのもの。" },
      },
      leviathan: {
        intro: { '1': "おまえは今、わたしの水の中を歩いている。" },
        sink: { '1': "おまえの小さな島々が沈んでいくぞ。" },
        grab: { '1': "わたしと共に深みへ来い！" },
        death: { '1': "潮は引き、二度と戻らぬ。" },
      },
      hydra: {
        intro: { '1': "首をひとつ斬れば、ふたつ生える！" },
        heads: { '1': "首が増えれば、牙も増える！" },
        rage: { '1': "我らを焼くか？ならば共に燃えろ！" },
        death: { '1': "もう首はない。もう……ない。" },
      },
      elderDragon: {
        intro: { '1': "おまえたちが火を知る前から、わたしは世界の下で眠っていた。" },
        flight: { '1': "ならば、その小さな石の陰に隠れるがいい。" },
        rift: { '1': "裂け目がわたしを引き戻す。まだだ！" },
        death: { '1': "ならば封じよ。闇にはもう飽いた。" },
      },
      'siegeHale': {
        'start': {
          '1': "来たぞ！ 門を守れ！"
        },
        'ram': {
          '1': "破城槌だ！ 門に着く前に仕留めろ！"
        },
        'horn50': {
          '1': "門の半分がやられた！ 踏ん張れ！"
        },
        'horn25': {
          '1': "門はもう長くはもたない！"
        },
        'won': {
          '1': "奴らは総崩れだ！ 砦は健在だ！"
        }
      },
      'siegeMara': {
        'start': {
          '1': "来るよ！ みんな、踏みとどまって！"
        },
        'ram': {
          '1': "破城槌だよ！ 門を壊される前に止めて！"
        },
        'horn50': {
          '1': "門の半分が崩れた。こらえて！"
        },
        'horn25': {
          '1': "門がもたない！ 押し返して！"
        },
        'won': {
          '1': "逃げていく！ 砦はまだ立っているよ！"
        }
      },
      banditChief: {
        whistle: {
          1: '行け、野郎ども！噛みついてやれ！'
        }
      },
      lightDisciple: {
        freed: {
          '1': '光があなたを導いたのですね。私はシスター・オーレル。サンフォードで待っています。ライトブリンガーの道を教えましょう。'
        }
      },
      trainerAegis: {
        freed: {
          '1': '山賊から救ってくれて感謝する！焚き火へ来い。我ら皆で教えよう、最初の教えは無償だ。'
        },
        road: { '1': '見つけてくれたか！サンフォードへの道で悪魔に捕まったのだ。我らはバスティオン・クロッシングへ向かう。砦で会おう。' }
      },
      sfShadow: {
        road: { '1': 'やっと誰か来たか。俺たちはバスティオン・クロッシングへ行く。砦で探してくれ。' }
      },
      frostDisciple: {
        freed: {
          '1': '俺を助けに来たのか？フロストウォーデンの弟子、アイヴァー・ハスクだ。アイアンホールドに来い、教えてやる。'
        }
      },
      windDisciple: {
        freed: {
          '1': 'ついに自由だ！ウィンドランナーの道を行く、ケストレル・ヴェインだ。オークヘイヴンで待ってる、教えてやるよ。'
        }
      },
      freedFarmers: {
        freed: {
          '1': '助かった！わしらは農家のトーラー一家だ。オークヘイヴンに来てくれ、家で困ったことがあるんだ。'
        }
      },
      freedHerbalist: {
        freed: {
          '1': 'まあ、ありがとう！薬草師のブライアよ。シルバーブリッジに会いに来て。あなたの力を借りたいの。'
        }
      },
      freedPeddler: {
        freed: {
          '1': 'なんとありがたい！行商人のオド・マロウだ。サンフォードに来てくれ、いい品を用意しておくよ。'
        }
      },
      goblinKing: {
        charge: {
          '1': 'ひき殺せ、タスカー！'
        },
        horn: {
          '1': '集まれ、野郎ども！ゴブリンども、俺のもとへ！'
        },
        dismount: {
          '1': '行け、タスカー、走れ！あとは俺がやる！'
        },
        return: {
          '1': 'タスカー！もう一度だ！'
        }
      },
      dragon: {
        takeoff: {
          '1': 'もうたくさんだ。空に焼かれるがいい。'
        },
        flight2: {
          '1': 'まだ終わっておらんぞ！'
        }
      },
      archDemon: {
        gate: {
          '1': '門は開いた。誰も出さん。'
        },
        dive: {
          '1': 'ひざまずけ。'
        }
      },
      chimera: {
        intro: {
          '1': "三つの頭に、一つの飢え。最初に噛みつくのはどれだ？"
        },
        twin: {
          '1': "今度は二つだ。立つ場所をよく選べ。"
        },
        tail: {
          '1': "わが尾が！その報いを受けろ！"
        },
        death: {
          '1': "三つの頭がありながら、誰も見抜けなかったとは。"
        }
      },
      centaurWarchief: {
        intro: {
          '1': "走って逃げろ。私の矢はもっと速いぞ。"
        },
        raiders: {
          '1': "騎兵ども！踏み潰せ！"
        },
        rear: {
          '1': "撃ち合いは終わりだ。踏み潰してやる！"
        },
        death: {
          '1': "この平原は、わが蹄を忘れぬだろう。"
        }
      },
      cyclops: {
        intro: {
          '1': "小さいのがいるな。もっと近くへ。よく見せろ。"
        },
        cover: {
          '1': "もう見せてやらん。この目は渡さん！"
        },
        blind: {
          '1': "見えぬ……だが、聞こえるぞ！"
        },
        death: {
          '1': "暗い。何もかも、暗くなった。"
        }
      },
      frostJarl: {
        hammer: {
          '1': 'じっとしていろ、小さき者よ。'
        },
        iceBreak: {
          '1': '湖がお前をのみ込むぞ！'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': '荷車に気をつけて！ごめんね、この橋の上は何でも動いてるの。シルバーブリッジへようこそ。',
        '2': '町長のブレナ・クイルよ。なくした物、壊れた物、遅れた物は、ぜんぶ私の机に来るの。'
      },
      ending: {
        '1': '川じゅうがあなたの噂でもちきりよ。商売もかつてないほど順調。だから、ありがとう。'
      },
      again: {
        '1': 'また来たの？いいわね。荷車の邪魔だけはしないでね。'
      },
      who: {
        '1': '町長になって九年。その前は縄を売ってたわ。仕事は同じよ。物をつなぎとめておくの。',
        '2': '町長選は毎年春。今のところ、この机を欲しがる人は他にいないわ。'
      },
      town: {
        '1': '最初に橋ができたの。次に橋の上に市場、それから家、そのまた上に家。',
        '2': '噴水に気をつけて。子どもがよく落ちるの。市場の日には大人もね。',
        say: 'シルバーブリッジについて教えて。'
      },
      masters: {
        '1': '一人残らずね。盾、炎、影、石。それぞれの師匠が、みんなひとつの橋の上よ。',
        '2': '弟子はあちこちから来るわ。宿屋は大喜び。うちの窓ガラスはそうでもないけど。',
        say: '本当に全クラスの先生がいるの？'
      },
      river: {
        '1': '川が運んでくるものなら何でも。魚、絹、アイアンホールドの鋼、たまに怒ったニワトリの箱。',
        '2': 'それと、シルバーブリッジの商人がみんな看板を出してるとは限らないわ。目を光らせておいて。',
        say: 'ここでは何を売り買いしてるの？'
      },
      rumor: {
        crags: {
          '1': '北からの船が止まったの。灰の岩山で何かが燃えてるらしいわ。'
        },
        mines: {
          '1': '今月はアイアンホールドの鋼が届かないの。ドワーフたちは鉱山で何かあったって。'
        },
        tundra: {
          '1': '毛皮商人がもうツンドラを渡らないの。巨人たちが動き出したんですって。'
        },
        far: {
          '1': '商人たちは、はるか北の話をひそひそ声でしかしなくなったわ。あそこに何がいるにせよ、客じゃないわね。'
        }
      },
      bye: {
        '1': 'いってらっしゃい。誰かに聞かれたら、橋の通行料はとても良心的だって言ってね。'
      }
    },
    sbHealer: {
      hello: {
        '1': 'ん？ああ、患者さんですね。すみません、目を休めていたんです。治療師にはよくあることで。',
        '2': '修道士アンセルです。どうぞ、お座りなさい。その椅子、見た目より座り心地がいいんですよ。'
      },
      again: {
        '1': 'おや、また来ましたか。ちょうど腰を下ろしたところだったのに。'
      },
      heal: {
        '1': '横になって、目を閉じて。長くはだめですよ、私まで寝てしまいます。はい、フラスコは満タンです。'
      },
      mana: {
        '1': 'ヒカリダケの薬湯です。頭にはいいが、息には悪い。ゆっくり飲んでくださいね。'
      },
      potions: {
        '1': '追いつめられる前に一本飲むこと。英雄というのは、いつも待ちすぎるんです。',
        '2': 'もっと持ち歩きたいなら、長いベルトを売っていますよ。フラスコを満たすのは無料です。',
        say: 'ポーションのコツってある？'
      },
      sleep: {
        '1': '夜は無理ですね。全クラスの弟子が練習していて、いつもどこかで何かが爆発しますから。',
        say: 'ちゃんと寝てるの？'
      },
      healBack: {
        '1': 'いってらっしゃい。次は包帯じゃなくて、お茶を飲みに来てくださいね。'
      },
      bye: {
        '1': '階段に気をつけて。患者さんの半分は、あそこでつまずいただけなんです。'
      }
    },
    sbArmorer: {
      forge: {
        '1': '炉は好きに使いな。何か燃えだしたら叫んでおくれ。'
      },
      learnSmith: {
        '2': '一番熱く光ったときに打つんだ。いい三打で、いい品ができる。',
        '1': '自分でハンマーを振ってみたいかい？炉なら喜んで貸すよ。'
      },
      ore: { '1': 'きれいな鉱石ね。売る分を見せて、一個ずつ払うわ。' },
      sellBack: { '1': 'ありがとう。シルバーブリッジはいつも公正な値を払うわ。' },
      forgeBack: {
        '1': '見てごらん！あんた、筋がいいよ。'
      },
      hello: {
        '1': 'はっ！なんだいそのへこみ。その鎧の代金、返してもらえたといいけどね。',
        '2': 'グレタ・アイアンヴェインだ。持ち主と一緒に帰ってくる鎧を作ってる。今のところ毎回ね。'
      },
      again: {
        '1': 'また来たね！まだ五体満足だ。そういう客がいちばん好きさ。'
      },
      trade: {
        '1': 'ほら、叩いてみな。思いっきりでいいよ。'
      },
      who: {
        '1': '山の生まれさ。商売で川を下ってきて、魚がうまいから居着いたんだ。'
      },
      steel: {
        '1': '厚さじゃない。どこで曲がるかさ。いい鎧は、あんたが曲がる所で曲がるんだ。',
        '2': 'ただし重い板金鎧には筋力がいる。足りないまま着たら、アヒルみたいによちよち歩きだよ。',
        say: 'いい鎧ってどんなの？'
      },
      shopBack: {
        '1': '大事に着なよ。へこみは持ってきな、いい話を聞くのが好きなんだ。'
      },
      bye: {
        '1': 'いってきな。私が守ってない所には当たらないようにね。'
      }
    },
    sbWeapons: {
      hello: {
        '1': 'おや、お目が高いお客様ですね。私にはすぐわかります。入ってくる歩き方でね。',
        '2': 'アシュビー名刀店のコルヴィン・アシュビーです。ええ、あのアシュビーです。ご存じでしょう？'
      },
      again: {
        '1': 'もうお戻りで？皆さん、結局コルヴィンのところへ戻ってくるんですよ。'
      },
      trade: {
        '1': '刃はすべて手磨き。実はこの私の手で。映り込みにご注意を。'
      },
      who: {
        '1': '川沿いでいちばんの刀剣商ですよ。誰に聞いてもそう言います。看板を読むだけでもわかります。'
      },
      blades: {
        '1': '自分に合うものを選ぶことです。素早い手には軽い刃、たくましい腕には重い刃を。',
        '2': 'それに見た目も大事です。ダサい剣の英雄から逃げる者はいませんからね。',
        say: 'いい武器の選び方は？'
      },
      shopBack: {
        '1': '素晴らしい選択です。私の髪ほどではありませんが、いい線いってますよ。'
      },
      bye: {
        '1': 'どこで買ったか、ぜひ皆さんに教えてあげてくださいね。'
      }
    },
    sbJeweler: {
      hello: {
        '1': 'おーい！こっちこっち！指輪にお守り、幸運の石。橋でいちばんの屋台だよ。',
        '2': 'タム・マーロウだよ。背は小さいけど、値段はもっと小さいんだ。'
      },
      again: {
        '1': 'いちばんのお得意さん！他の客には内緒だよ。'
      },
      trade: {
        '1': 'ぜんぶ本物。たぶんね。わかったよ、それはガラス。でもすっごくいいガラスだよ。'
      },
      who: {
        '1': 'この橋で育ったんだ。ひび割れも猫も近道も、ぜんぶ知ってるよ。'
      },
      gossip: {
        '1': 'スプロケット教授がまた眉毛を吹っ飛ばしたって。今月三回目だよ。',
        '2': 'それと町長は、看板を出さない商人のことを知ってるよ。今、調べてるとこ。',
        say: '何かおもしろい噂ある？'
      },
      shopBack: {
        '1': 'まいどあり！友達に教えてね。衛兵にはナイショで。'
      },
      bye: {
        '1': 'またね！ずっとここにいるからさ。たぶん。'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': 'はっは！また若いのが来たね。あごを上げて、胸を張りな。盾は笑顔で持つとよく効くのさ。',
        '2': 'デイム・ヘルガ・ストームシールドだ。昔この橋を守り抜いた。今は踏ん張り方を教えてるよ。'
      },
      again: {
        '1': '来たね！盾は構えた？よし。笑ってる？もっといいね。'
      },
      train: {
        '1': '足を広げて。前に体重をかけて。私が押しても動かないこと。いいかい？それっ！'
      },
      class: {
        '1': 'みんなの前に立つのさ。仲間が立たなくて済むようにね。これ以上の仕事はないよ。',
        '2': '盾を持ち上げる筋力。夕飯まで構え続ける耐久力。',
        say: 'イージスナイトって本当は何をするの？'
      },
      ready: {
        strong: {
          '1': 'もう立派な壁だね、あんた。好きな稽古を選びな。'
        },
        able: {
          '1': '足腰がしっかりしてる！次の稽古に進めるよ。'
        },
        weak: {
          '1': 'まだだね。ひと押しで転んじまう。筋力と耐久力をもっとおくれ。'
        }
      },
      bridge: {
        '1': '四十年前、川の海賊相手にね。六人で、門ひとつ、とても長い夜だった。',
        '2': 'いちばん強く殴ったから勝ったんじゃない。動かなかったから勝ったんだ。覚えておきな。',
        say: 'この橋を守ったの？'
      },
      trainBack: {
        '1': 'よくやった！さあ何か食べな。盾は重いからね。'
      },
      bye: {
        '1': '外でも胸を張っていきな！'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': '入りたまえ。メモに気をつけて。それと、火鉢のそばでくしゃみはしないでくれたまえ。',
        '2': '魔導師イグナティウス・ヴェイルだ。橋の上で炎を教えている。水がたっぷりあるのでね。'
      },
      again: {
        '1': '時間どおりだ。結構。前回の続きから始めよう。'
      },
      train: {
        '1': '見たまえ。小さな炎を、じっと保つ。大きな炎は簡単だ。小さな炎こそ腕がいる。'
      },
      class: {
        '1': '火をつけるだけなら誰にでもできる。パイロマンサーは火の行き先と、止まる場所を決めるのだ。',
        '2': 'すべては知力から生まれる。あとで炎に確かな手が要るとき、技量が助けになる。',
        say: 'パイロマンサーって本当は何をするの？'
      },
      ready: {
        strong: {
          '1': '見事な制御だ。直すところはほとんどない。自由に選びたまえ。'
        },
        able: {
          '1': '及第点だ。いや、及第点以上だな。次の稽古に進んでよろしい。'
        },
        weak: {
          '1': 'まだだ。炎がぐらついている。もっと鋭い頭を。知力を上げたまえ。'
        }
      },
      sprocket: {
        '1': '天才だよ。うるさくて、そそっかしくて、天才だ。彼の部屋の前にはバケツを置いてある。',
        say: 'スプロケット教授のことどう思う？'
      },
      trainBack: {
        '1': '練習は水のそばで。これは絶対だ。'
      },
      bye: {
        '1': 'ごきげんよう。袖はまくっておきたまえ。'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': '探してる？噴水からずっと隣にいたけど。二回も素通りしたよね。',
        '2': 'ニクス・ハロウェイ。隠れるなら人混みがいちばん。で、ここはいちばん混んでる橋なんだ。'
      },
      again: {
        '1': 'やあ、また。けっこう前からここにいたよ。気づいた？いいや？ならよし。'
      },
      train: {
        '1': 'まず一つ目。ここにいて当然って顔で歩くこと。そういう人は誰も二度見しない。'
      },
      class: {
        '1': '相手が見てる場所に、絶対いないこと。すっと入って一撃、また人混みに溶ける。',
        '2': '素早い足と手には器用さ。一撃を決めるには技量。',
        say: 'いいシャドウブレードの条件は？'
      },
      ready: {
        strong: {
          '1': 'もう立派にこっそり屋だね。残りも持っていきな。もう資格はある。'
        },
        able: {
          '1': '足取りが軽い！次の技に進めるよ。'
        },
        weak: {
          '1': 'まだだね。噴水のとこから足音が聞こえる。器用さをもっと。'
        }
      },
      past: {
        '1': '昔、まさにこの橋でスリをやってたんだ。腕もよかったよ。',
        '2': 'そしたら町長に捕まって、牢屋じゃなく仕事をくれた。感謝してるって、本人には言わないでね。',
        say: 'どうやってこれを覚えたの？'
      },
      trainBack: {
        '1': 'さあ、練習してきな。私に見つからないようにね。'
      },
      bye: {
        '1': 'じゃあね。まあ、私の姿は見えないだろうけど。'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': 'おや！こんにちは、こんにちは。失礼、衛兵たちと話していまして。素敵な聞き手なんですよ。',
        '2': 'パーシヴァル・アシュコムです。城でも教えられますが、人を導くことは人のいる所でしか学べません。'
      },
      again: {
        '1': '我が友よ！続けましょうか？もちろん、あなたがよければですが。'
      },
      train: {
        '1': 'では。良い命令とは、はっきりと、やさしく、一度だけ。こんなふうに。'
      },
      class: {
        '1': '導く者です。衛兵たちはそばに駆けつけ、あなたのためだけでなく、あなたと共に戦います。',
        '2': '魅力がすべてです。人は好きな相手についていく。そして名前を覚えてくれる相手にね。',
        say: 'グランドソブリンって何？'
      },
      ready: {
        strong: {
          '1': 'お見事！今なら皆、どこへでもついていきますよ。すべての稽古をどうぞ。'
        },
        able: {
          '1': '衛兵たちもあなたの言葉を聞くでしょう。次の稽古に進めますよ。'
        },
        weak: {
          '1': '残念ながら、まだですね。もう少し魅力があれば、皆ついてきますよ。'
        }
      },
      please: {
        '1': 'いつもです。怒鳴れば従ってはくれる。お願いすれば忠誠が得られる。忠誠のほうが長続きします。',
        say: '衛兵に本当に「お願い」って言うの？'
      },
      trainBack: {
        '1': '素晴らしい。あとで彼らにお礼を言うのを忘れずに。'
      },
      bye: {
        '1': 'どうぞお気をつけて。皆さんによろしく。'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': '苔を踏まないでおくれ、この子は今週大変だったんだよ。さて、あんたをよく見せてごらん。',
        '2': 'トーヴァ・ディープルートおばあさんだよ。ここの川底は、ずうっと下までいい石なんだ。'
      },
      again: {
        '1': 'もう来たのかい？お座り、お茶をいれたところさ。石のお茶。ほとんどはお茶だよ。'
      },
      train: {
        '1': '手のひらを地面にぺたっと。そうじゃない。眠そうな犬をなでるみたいにね。'
      },
      class: {
        '1': '大地に手伝いを頼むのさ。必要なときは壁を、失礼なやつにはトゲをね。',
        '2': '石は庭みたいなもの。掘るには筋力、どこに植えるかわかるには知力さ。',
        say: 'ジオマンサーって何をするの？'
      },
      ready: {
        strong: {
          '1': '大地はもうあんたが気に入ってるよ。好きなものを学びな。'
        },
        able: {
          '1': 'いい根っこだ！次の稽古に進めるよ。'
        },
        weak: {
          '1': 'まだだよ、おまえさん。石がびくともしない。まずは筋力をもっとね。'
        }
      },
      garden: {
        '1': '四十年がかりさ。石はひとつ残らず手で育てた。いや、魔法でね。まあ、だいたい手で。',
        '2': '帰りに小石をひとつ持っておいき。いいドアストッパーになるよ。',
        say: 'それって石でできた庭？'
      },
      trainBack: {
        '1': '上出来。さあ、何か掘っておいで。やさしくね。'
      },
      bye: {
        '1': 'いっておいで。あったかくしてな、川べりは湿っぽいから。'
      }
    },
    sbMasterAether: {
      hello: {
        '1': 'ようこそ、ようこそ！ちょうど実演の時間だ。耳をふさいでくれたまえ。',
        '2': 'クイント・スプロケット教授だ。川がタダで歯車を回してくれる。ここ以外で教える理由があるかね？'
      },
      again: {
        '1': 'おお、お気に入りの生徒よ！今日の実演はいつもより大きな音がするぞ。'
      },
      train: {
        '1': '黒板を見たまえ。では黒板のことは忘れて、機械を見たまえ。'
      },
      class: {
        '1': 'ピンチは作って切り抜ける。ピストル、タレット、そして正直さを保つヒートゲージだ。',
        '2': '狙いには技量、賢い仕掛けには知力。理想は両方だね。',
        say: 'エーテルテックって実際何をするの？'
      },
      ready: {
        strong: {
          '1': 'すばらしい！私の講義だってできそうだ。いや、やめてくれたまえ。残りを持っていきなさい。'
        },
        able: {
          '1': '手がぶれない！次の機械に進めるぞ。'
        },
        weak: {
          '1': 'まだだ。狙いがぶれている。技量を上げてから、また話そう。'
        }
      },
      eyebrows: {
        '1': '実演がちょっとうまくいきすぎてね。また生えてくるさ。いつもそうだ。',
        say: '眉毛、どうしたの？'
      },
      trainBack: {
        '1': '上出来だ。さあ、熱を逃がしてきなさい。できれば外でね。'
      },
      bye: {
        '1': '授業終わり！階段に気をつけたまえ。'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': '昔の教え子の時の番人が、あなたが来ると書いてきました。まさにこの分に、ね。',
        '2': '時計番のセルウィンです。橋の時計を守っています。これほど忙しい町は、遅れるわけにいきません。'
      },
      again: {
        '1': '七分過ぎ。始めるにはちょうどいい時間です。'
      },
      train: {
        '1': '一緒に数えて。いち、に、そして止める。上手に持てば、時間は伸びるんです。'
      },
      class: {
        '1': '時間を片づけるのです。敵を遅らせ、味方を急がせ、ちょっとした失敗をなかったことに。',
        '2': '理解するには知力。何も壊さずに触れるには技量。',
        say: 'クロノウィーバーって何？'
      },
      ready: {
        strong: {
          '1': '見事なタイミングです。残りの稽古は、都合のいいときにどうぞ。'
        },
        able: {
          '1': '準備はできています。次の稽古が始まるのは……ほら、今です。'
        },
        weak: {
          '1': 'まだです。いつも一拍遅れています。知力と、技量をもっと。'
        }
      },
      keeper: {
        '1': '何年も前に教えました。優秀な弟子でしたよ。いつも早いか遅いかで、時間どおりには来ませんでしたが。',
        say: '時の番人とはどういう知り合い？'
      },
      trainBack: {
        '1': '毎日練習を。できれば、毎日同じ時間に。'
      },
      bye: {
        '1': 'いってらっしゃい。遅れないように。'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': 'サングレル博士から手紙が来ました。あなたは気絶しなかったそうですね。彼にしては最高のほめ言葉です。',
        '2': 'ヴェスパー・クリムゾンリーフです。世界中の薬草がこの橋の下を流れてくる。ここは贅沢な場所です。'
      },
      again: {
        '1': 'おかえりなさい。今日は元気そうですね。私にはわかるんです。'
      },
      train: {
        '1': '息を吸って。力を感じますか？では、それを少しだけ使って。賢くね。'
      },
      class: {
        '1': '自分の生命力を払って力を得て、それを敵から取り返すのです。',
        '2': '耐久力はお財布。知力は、それをどれだけ上手に使うかを決めます。',
        say: 'ブラッドアルケミストって本当は何？'
      },
      ready: {
        strong: {
          '1': 'なんという活力！私の知ることのほとんどを学べますよ。'
        },
        able: {
          '1': 'あなたの精気は力強く流れています。次の稽古へ進みましょう。'
        },
        weak: {
          '1': 'まだです。呪文ひとつで疲れてしまいますよ。まず耐久力を鍛えてください。'
        }
      },
      herbs: {
        '1': 'ほとんどは薬湯です。精気を少し、ミントをたっぷり。ミントは何でもおいしくしますから。',
        '2': '外で珍しい植物を見つけたら、ぜひ持ってきてください。ぜひ見てみたいので。',
        say: 'この薬草、全部何に使うの？'
      },
      trainBack: {
        '1': '練習のあとは休んでくださいね。精気は戻りますが、お昼寝が好きなんです。'
      },
      bye: {
        '1': 'お体を大事に。水を飲んで。緑のものを食べてくださいね。'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': '今朝、海から荷船が三隻入ったよ。',
        '2': 'また塩漬けの魚？',
        '3': '今回は絹だよ。でも、あとで指のにおいをかいでみな。'
      },
      lesson: {
        '1': '稽古はどうだった？',
        '2': '袖に火がついちゃった。師匠は進歩だってさ。'
      },
      masters: {
        '1': '国じゅうの師匠が、ひとつの通りで教えてるんだ。',
        '2': 'で、みんな自分のクラスがいちばんだって言うんだよな。',
        '3': 'しかも全員正しいってのが、腹立つとこなんだよ。'
      },
      bridge: {
        '1': 'この橋、町より古いんだってさ。',
        '2': '確かに、それっぽくギシギシいうよな。'
      },
      fish: {
        '1': '何か釣れた？',
        '2': '長靴。',
        '3': 'じゃあ、あと片っぽだな。'
      },
      newMaster: {
        '1': '北通りに新しい師匠が来たよ。時間の話ばっかりしてる。',
        '2': 'きっと毎回、稽古に遅刻するんだろうな。'
      },
      siege: {
        '1': 'オークヘイヴンからの知らせはよくない。城壁に盗賊だって。',
        '2': 'じゃあ荷船はこっちに来るな。気の毒に。'
      }
    },
    sbAlchemist: {
      hello: {
        '1': 'あっ！瓶に気をつけて。それ、噛むのよ。まあ、かじる程度だけど。',
        '2': 'シダ笛のオディール、錬金術師よ。薬草を持ってきてくれたら、ちょっぴりの勇気を瓶に詰めてあげる。'
      },
      again: {
        '1': 'おかえり！何か緑のもの、持ってきてくれた？'
      },
      brew: {
        '1': 'ポーチを見せて。わあ、すてき。好きなのを選んで。お湯を沸かしておくわ。'
      },
      who: {
        '1': 'ヒナギク一本でママの庭を燃やしちゃったの。誰にも説明できなかったから、自分で学ぶしかなかったのよ。'
      },
      herbs: {
        '1': '外よ。戦う場所ならどこにでも生えてるわ。植物の上を歩くだけで、あなたのもの。',
        '2': '珍しいのは気難しいの。ツキスズはささやきの森で咲くし、カゲイバラは暗い場所を好むわ。',
        say: '薬草はどこで見つかる？'
      },
      elixirs: {
        '1': 'どれも戦いの間、まる5分強くしてくれるの。重い一撃、硬い肌、速い足。',
        '2': '3本目のフラスコに入ってるわ。小さな矢印をタップすれば、飲むのを切り替えられるの。',
        say: 'エリクサーにはどんな効果があるの？'
      },
      brewBack: {
        '1': '気をつけて、まだ温かいから。ポーチがいっぱいになったらまた来てね！'
      },
      bye: {
        '1': 'またね！紫の花を見つけたら、二本摘んで。一本はわたしの分よ。'
      }
    },
    sbGambler: {
      hello: {
        '1': 'さあさあ、寄ってらっしゃい！カードが12枚、砂時計がひとつ、そして倍になるかもしれないお財布！',
        '2': 'マダム・ペルよ。人の顔は決して忘れないの。あなたはカードを忘れずにいられるかしら？'
      },
      again: {
        '1': 'もうひと勝負しに来たの？砂があなたを待ちわびていたわ。'
      },
      play: {
        '1': 'コインは布の上に、目はカードに。準備はいい？砂時計をひっくり返すわよ！'
      },
      rules: {
        '1': 'カードを2枚めくるの。そろったペアは表のまま。砂が落ちきる前に全部のペアを見つけたら、賭け金の倍を払うわ。',
        '2': '勝つたびに砂時計は速くなる。5連勝したら、レジェンドの賞品をあげるわ。',
        say: 'どうやって遊ぶの？'
      },
      who: {
        '1': '9歳のとき、旅のサーカス団についていったの。それがね、とっても算数が得意な一座だったのよ。'
      },
      prize: {
        '1': 'ドワーフがひとりだけ。それ以来、彼がまばたきするのを見た人はいないわ。',
        say: '賞品を取った人はいるの？'
      },
      playBack: {
        '1': '勝っても負けても、いい勝負だったわ。目を休めたら、また来てちょうだい。'
      },
      bye: {
        '1': 'いってらっしゃい！自分の足をどこに置いたか、忘れないでね。'
      }
    },
    sunfordGambler: {
      hello: {
        '1': 'おい、ちょっと。そのバッグにガラクタはないか？古いブーツとか、曲がった剣とか。それを賭けて勝負しようぜ。',
        '2': 'ころがし屋のドッブだ。遊びで賭けてるのさ、だいたいはな。あとはブーツのためさ。'
      },
      again: {
        '1': 'また来たな！あの素敵なガラクタ、まだあるかい？'
      },
      play: {
        '1': '参加料はテーブルに。品物を出しな、値段の高いほうが1ポイントだ。'
      },
      rules: {
        '1': 'お互いにアイテムを1つずつ出す。高いほうが1ポイント。2ポイントで勝ちだ。',
        '2': '出した品は勝っても負けてもオレのもの。でも3連勝したら、とっておきのものをやるよ。',
        say: 'ルールは？'
      },
      who: {
        '1': '昔は行商人だったんだ。ところがみんな、品物を売るより賭けるほうが好きだったのさ。'
      },
      luck: {
        '1': 'しょっちゅうさ！でも帰るときは、いつも新しいブーツを一足持ってるんだ。',
        say: '負けることはあるの？'
      },
      playBack: {
        '1': 'いい勝負だった！おまえさんの品、オレの棚によく似合いそうだ。'
      },
      bye: {
        '1': 'もっとガラクタを持ってきてくれよ！ガラクタは大好物なんだ。'
      }
    },
    sunfordCups: {
      hello: {
        1: 'いらっしゃい！カップ三つ、宝石ひとつ、最初の一回はサービスだよ！',
        2: 'すばやい指のネル。私の手を騙せた人はまだいないの。やってみる？'
      },
      again: {
        1: 'また来たの？目をしっかり開けてね！'
      },
      play: {
        1: '宝石から目を離さないでね。まばたき禁止！'
      },
      rules: {
        1: '宝石をカップの下に隠してシャッフルするよ。隠れているカップを指さしてね。',
        2: '連勝するほど払いが増えるよ。三連勝で賞品、五連勝で宝物。一日の最初の一回は無料。',
        say: 'どうやって遊ぶの？'
      },
      who: {
        1: '歩くより先にシャッフルを覚えたの。お母さんは、それで色々納得だって。'
      },
      luck: {
        1: 'たまにね！そしたら大声でうめくの。お客さんが同情してくれるのよ。',
        say: '負けることもあるの？'
      },
      playBack: {
        1: 'いい勝負だった！明日も来てね、最初の一回はいつも無料よ。'
      },
      bye: {
        1: 'またね！外でも目をしっかり開けてね。'
      }
    },
    oakGambler: {
      hello: {
        '1': '新しいお客様ですね。どうぞお座りを、噛みつきはしませんよ。値段のほうは、少々噛みつきますが。',
        '2': '絹のレンと呼ばれております。素敵な品を集めているのです、ひと勝負ずつね。'
      },
      again: {
        '1': 'ああ、お気に入りの対戦相手だ。始めましょうか？'
      },
      play: {
        '1': '参加料をどうぞ。それから、私が本気になれる品をお出しください。'
      },
      rules: {
        '1': 'お互いに品を一つずつ、最大3回まで。より上等な品が1ポイント。2ポイントで勝ちです。',
        '2': '出した品は、どちらにせよ私がお預かりします。3連勝なされば、本物のお宝をお持ち帰りいただけますよ。',
        say: 'どうやって遊ぶの？'
      },
      who: {
        '1': '珍しい品を扱う商人です。見つけて、しまっておいて、ときどき勝負で一つ手放すのです。'
      },
      collection: {
        '1': '輝きの順に並べています。いちばん輝くものは、ティーカップの隣の最上段へ。',
        say: '集めた品はどうするの？'
      },
      playBack: {
        '1': '実に愉快でした。バッグが重くなったら、またどうぞ。'
      },
      bye: {
        '1': '外ではお財布にお気をつけて。皆が正々堂々と遊ぶわけではありませんから。'
      }
    },
    sbCollector: {
      hello: {
        '1': 'ドアを閉めておくれ、すきま風が入る。蛾がわしのタペストリーを狙っておるんじゃ。',
        '2': 'アルダー・ヴェインじゃ。「収集家」と呼ぶ者もおる。珍しい品を買って、気に入った者にだけ売っておる。'
      },
      open: {
        '1': 'おお、友よ！さあ入って、入って。とっておきの品のほこりを払っておいたぞ。'
      },
      again: {
        '1': 'また来たのか。まだ頼みごとは済んでおらんようじゃな。'
      },
      trade: {
        '1': '棚は開いておるよ。最高の品ばかりじゃ。値段はひとつ残らず覚えておるぞ。'
      },
      favor: {
        '1': '見知らぬ者には売らん。だが、頼みをひとつ聞いてくれたら友だちじゃ。',
        '2': 'ささやきの森のトレントが、わしの欲しいツキスズを守っておる。トレントを4体倒して、ツキスズを2つ持ってきておくれ。',
        say: '何か売ってくれる？'
      },
      waiting: {
        '1': 'トレント4体、ツキスズ2つ。残念ながら、ツキスズは勝手に摘まれてはくれんのじゃ。',
        say: '頼みごとのことだけど…'
      },
      favorDone: {
        '1': 'おお、まだ森の香りがする！すばらしい。',
        '2': '約束は約束じゃ。わしの棚は、いつでも好きに見ておくれ。',
        say: 'ツキスズを持ってきたよ。'
      },
      who: {
        '1': '6歳のころから集めておる。最初はボタン。今ではうなる剣じゃ。'
      },
      shopBack: {
        '1': 'それは大事に扱っておくれ。わしらふたりよりも年上なんじゃ。'
      },
      bye: {
        '1': '出るときはドアを閉めておくれ。そっとな、花びんがカタカタ鳴るでの。'
      }
    },
    sbFence: {
      hello: {
        '1': 'じろじろ見ないで。何か買うか、光をさえぎるのをやめるか、どっちかにして。',
        '2': 'ミレラ・ソーン。人がなくした物を見つけるの。それから新しい持ち主もね。'
      },
      open: {
        '1': 'あら、お気に入りの英雄さん。いい物は布の下に取っておいたよ。'
      },
      again: {
        '1': 'また来たの？頼んだこと、覚えてるよね。商売の話はそれからよ。'
      },
      trade: {
        '1': 'あちこちから来た鎧よ。出どころは聞かないで。今はもう全部きれいな品だから、約束する。'
      },
      favor: {
        '1': 'いい鎧よ。友だち用のね。で、友だちってのは助け合うものでしょ。',
        '2': 'オークヘイヴン郊外の山賊が、あたしの荷を何度も奪うの。15人倒して、それから装飾品売りの子に、誰が差し向けたか聞いてきて。',
        say: '布の下には何があるの？'
      },
      waiting: {
        '1': '山賊15人、それから装飾品売りの子とひと話。さ、行ってらっしゃい。',
        say: '山賊のことだけど…'
      },
      favorDone: {
        '1': '結局、あのおしゃべりだったってわけね。ふん！借りができたわ。',
        '2': '布はいつでもめくっていいよ。友だちは一番に選べるの。',
        say: '山賊は倒した。差し向けたやつもわかったよ。'
      },
      who: {
        '1': 'この川の石段で育ったの。流れてくる物は、遅かれ早かれ全部あたしのところに来る。'
      },
      shopBack: {
        '1': '大事に着てね。誰かに聞かれたら、アイアンホールドで買ったって言っといて。'
      },
      bye: {
        '1': '財布に気をつけて。ここの人がみんな、あたしみたいに正直とは限らないから。'
      }
    },
    sbMasterWindrunner: {
      hello: {
        '1': 'あ、どうも！ごめん、止まれないの。風向きが変わるのを待ってるんだ。もうすぐだよ。',
        '2': '疾風のセファ。矢を撃って、風を追いかけてる。だいたい風の勝ちだけどね。'
      },
      open: {
        '1': '来たね、私の走り手！準備いい？いいに決まってるか。行こう、行こう！'
      },
      again: {
        '1': 'また来たね！まだここにいるよ。まあ、だいたいね。足が勝手にどっか行っちゃうの。'
      },
      train: {
        '1': 'ほっぺに風を感じる？思ったより少し左を狙って。はい、放して！'
      },
      favor: {
        '1': 'ついてこられる人だけにね。ついてこられる？試してみよう。',
        '2': 'オークヘイヴン郊外で山賊の弓兵を8人倒して、ハヤテシダを2本持ってきて。',
        say: '弓を教えてるの？'
      },
      waiting: {
        '1': '山賊の弓兵8人、ハヤテシダ2本。ほら行って！ここで待ってる。ぴょんぴょんしながら。',
        say: '試験のことだけど…'
      },
      favorDone: {
        '1': 'あはっ！本当についてこられた！誰もついてこられないのに！',
        '2': 'よし、今日から私の弟子だよ。ルールはひとつ。稽古中は座らないこと。',
        say: '弓兵は倒したよ。はい、ハヤテシダ。'
      },
      class: {
        '1': '撃って、走って、また撃つ。捕まったら、それは止まりすぎってこと。',
        '2': '速い足と速い弓には器用さ。どの矢も当てるには技量。',
        say: 'ウィンドランナーって何をするの？'
      },
      ready: {
        strong: {
          '1': 'もう風みたいに速いね。まあ、ほぼね。好きな稽古を選んで！'
        },
        able: {
          '1': '足が軽い！次の稽古に進めるよ。ほら、行って行って！'
        },
        weak: {
          '1': 'まだだね。ソファを背負って走ってるみたい。器用さをもっとお願い。'
        }
      },
      who: {
        '1': '川沿いの古い風車小屋の上に住んでるの。町でいちばん風がよく見えるんだ。',
        '2': 'てっぺんまで階段200段。いい練習になるよ。一段残らず数えたもん。'
      },
      trainBack: {
        '1': 'いいね！じゃあ走って帰って。歩いちゃだめ。走るのも練習のうち。'
      },
      bye: {
        '1': 'またね！低い枝に気をつけて。私はいつもぶつかるけど。'
      }
    },
    sbMasterFrostwarden: {
      hello: {
        '1': 'む。私の前を三度通ったな。迷子か、それとも興味があるのか？',
        '2': '霜心のハルヴァルドだ。雪の国から南へ来た。ここは暖かい。暖かすぎる。'
      },
      open: {
        '1': '弟子か。よし。氷の準備はできている。私もだ。'
      },
      again: {
        '1': 'また来たか。よし。私は口数が少ない。それでもいていい。'
      },
      train: {
        '1': 'ゆっくり息を吐け。白い息が見えるか？それを刃に込めろ。'
      },
      favor: {
        '1': 'そうだ。熱い場所でも頭を冷やしていられる者にだけ教える。',
        '2': '灰の岩山でファイアエレメンタルを7体消してこい。それからシモハッカを2枝持ってこい。',
        say: 'その剣、氷でできてるの？'
      },
      waiting: {
        '1': 'ファイアエレメンタル7体。シモハッカ2枝。急がなくていい。だが、のんびりしすぎるな。',
        say: '試験のことだけど…'
      },
      favorDone: {
        '1': 'む。焦げ跡ひとつない。よし。',
        '2': '頭を冷やしていられたな。それが最初の教えだ。残りは私が教えよう。',
        say: 'ファイアエレメンタルは消したよ。はい、シモハッカ。'
      },
      class: {
        '1': '冷気の騎士だ。冷やし、凍らせ、そして氷を砕く。',
        '2': '刃には筋力。霜には知力。両方いる。',
        say: 'フロストウォーデンって何？'
      },
      ready: {
        strong: {
          '1': 'もう北の地のように冷たいな。どの稽古でも選べ。'
        },
        able: {
          '1': 'よし。落ち着いている。次の稽古はおまえのものだ。'
        },
        weak: {
          '1': 'まだだ。霜がすぐ溶ける。知力をもっと、筋力ももっとだ。'
        }
      },
      who: {
        '1': '北の山の峠を守っていた。そのうち、凍らない川を見てみたくなった。'
      },
      trainBack: {
        '1': 'よし。今は休め。氷は急がない。おまえも急ぐな。'
      },
      bye: {
        '1': '達者でな。頭は冷やしておけ。'
      }
    },
    sbMasterLightbringer: {
      hello: {
        '1': 'ふん、ふふん…あら！ごめんなさいね、鼻歌を歌ってたの。あなたに向かって歌っちゃった？よくやるのよ。',
        '2': '暁のシスター・オーリエルよ。橋のたもとの小さなランプを灯し続けているの。'
      },
      open: {
        '1': '来たわね、私の輝く子！少しだけ光の中に立ってごらんなさい。それだけのことはしたわ。'
      },
      again: {
        '1': 'また来てくれたのね！まだここで鼻歌中よ。ランプもお客さんがうれしいみたい。'
      },
      train: {
        '1': '手を開いて、あごを上げて。今までで最高の朝を思い出して。ほら。感じる？'
      },
      favor: {
        '1': '誰の中にも小さな光があるの。準備ができた人に、それを外へ出す方法を教えているのよ。',
        '2': '灰の岩山で教団員を7人倒して、ランプ用のヒナタバナを3本持ってきてちょうだい。',
        say: 'そのランプって魔法なの？'
      },
      waiting: {
        '1': '教団員7人、ヒナタバナ3本。やさしく倒してあげてね。誰にだってやり直すチャンスはあるもの。',
        say: '試験のことだけど…'
      },
      favorDone: {
        '1': 'まあ、見て！これでランプがひと月は金色に輝くわ。',
        '2': 'あなたもよ。喜んで教えてあげるわ。',
        say: '教団員は倒したよ。はい、ヒナタバナ。'
      },
      class: {
        '1': '夜明けを運ぶの。戦うための光、癒やすための光、身を隠すための光。',
        '2': '知力は光を強くして、魅力は光を温かくする。両方ほしいわね。',
        say: 'ライトブリンガーって何をするの？'
      },
      ready: {
        strong: {
          '1': '朝日みたいに輝いてるわ。好きな稽古を選んでね。'
        },
        able: {
          '1': 'いい輝きね！次の稽古に進めるわ。'
        },
        weak: {
          '1': 'まだよ。光が少しかすかね。魅力をもっと上げれば輝けるわ。'
        }
      },
      who: {
        '1': '昔は大きな神殿で歌っていたの。でもここのランプは船を家まで導くのよ。こっちのほうがいいわ。'
      },
      trainBack: {
        '1': 'すてき。さあ、誰かの一日を明るくしてらっしゃい。シスターの命令よ。'
      },
      bye: {
        '1': 'いってらっしゃい。暗い隅っこにはにっこり笑ってあげて。あれが大嫌いなのよ。'
      }
    },
    sbMasterBeastcaller: {
      hello: {
        '1': '足元に気をつけな。そいつはブランブル。先にいたのはそいつだ。',
        '2': 'アザミ足のローワンだ。動物は好きだ。人間は、まだ考え中だ。'
      },
      open: {
        '1': 'ああ、おまえか。ブランブルが待ってたぞ。わしもな。少しは。'
      },
      again: {
        '1': 'また来たか。ブランブルはおまえが気に入ってる。わしはまだ考え中だ。'
      },
      train: {
        '1': 'しゃがめ。もっとゆっくり。手を差し出して、向こうから来させるんだ。よし。'
      },
      favor: {
        '1': '話す？わしは聞くんだ。ほとんどのやつが一生覚えないコツさ。',
        '2': 'ささやきの森で大グモが獣道を巣だらけにしてる。8匹片づけてこい。',
        '3': 'それから、わしのねぐらにツキスズを2本持ってこい。そばにあるとブランブルがよく眠る。',
        say: '動物と話せるの？'
      },
      waiting: {
        '1': 'クモ8匹、ツキスズ2本。動物たちが待ってる。ブランブルもな。',
        say: '試験のことだけど…'
      },
      favorDone: {
        '1': 'ふむ。今朝、シカが川まで下りてきた。おまえのおかげかと思ってな。',
        '2': 'いいだろう。教えてやる。大げさに喜ぶな。ブランブル、しっぽを振るのはやめろ。',
        say: '道はきれいになったよ。はい、ツキスズ。'
      },
      class: {
        '1': '野生を呼べば、野生が来る。オオカミ、タカ、クマ。ペットじゃない、友だちだ。',
        '2': '来たいと思わせる魅力。あいつらについていく耐久力。',
        say: 'ビーストコーラーって何？'
      },
      ready: {
        strong: {
          '1': 'もう群れ全体がおまえを信じてる。好きなのを持っていけ。'
        },
        able: {
          '1': 'オオカミたちはおまえが好きだ。次の稽古に進めるぞ。'
        },
        weak: {
          '1': 'まだだ。あいつらはおまえを信じてない。魅力をもっと、我慢はもっとたくさんだ。'
        }
      },
      who: {
        '1': '何年も前、罠にかかってたブランブルを見つけた。足は三本、気の強さは満点。それからずっと相棒だ。',
        '2': '馬小屋の干し草置き場で寝てる。馬のいびきは人間より静かだ。'
      },
      trainBack: {
        '1': 'よし。じゃあ行け。カラスにあいさつしていけよ。あいつらは覚えてるぞ。'
      },
      bye: {
        '1': '行ってこい。ブランブルもまたなってさ。'
      }
    },
    sbMasterElementalist: {
      hello: {
        '1': 'やあ！ちょっと待って、ジャグリング中なの。炎、氷、火花、石と…キャッチ！こんにちは！',
        '2': '四風の魔導師アイリスよ。四つの属性を全部教えてるの。混ぜるのがいちばん楽しいところ。'
      },
      again: {
        '1': 'また来た！よかった、見てくれる人が欲しかったの。見てて。じゃーん！'
      },
      train: {
        '1': '玉を二つ選んで。どれでもいいよ。じゃあぶつけてみて。そっとね！ほら？反応した！'
      },
      class: {
        '1': '混ぜるの！氷のあとに炎なら溶ける。炎のあとに雷なら、どかーん。どの組み合わせも何か起きるよ。',
        '2': 'どの呪文にも知力。技量もね。いい呪文ほど手の速さがいるから。',
        say: 'エレメンタリストって何をするの？'
      },
      ready: {
        strong: {
          '1': 'もう達人みたいに混ぜられるね！どの稽古でもどうぞ。二つでもいいよ！'
        },
        able: {
          '1': 'おお、いい火花！次の稽古に進めるよ。'
        },
        weak: {
          '1': 'まだだね！属性がすぐしぼんじゃう。知力をもっとお願い。'
        }
      },
      sleeve: {
        '1': 'あっ！本当だ。ちょっと待って…はい。',
        '2': '炎のあとに氷。今のも実は授業だったの。どういたしまして！',
        say: 'あの、袖が燃えてるよ。'
      },
      trainBack: {
        '1': 'すばらしい！練習は外でお願いね。カーテン、新しいの。'
      },
      bye: {
        '1': 'じゃあね！焦げくさかったら、たぶん私。気にしないで！'
      }
    },
    sbMasterSoulwarden: {
      hello: {
        '1': 'しーっ、大丈夫、怖くないよ。あ、あなたじゃなくて。ウィスプたちに話してたの。',
        '2': '灯火の番人オダリスよ。迷子の精霊が家へ帰る手伝いをしているの。'
      },
      again: {
        '1': 'また会えたね。ウィスプたちもあなたを覚えてる。ほら、あの子が手を振ってる。'
      },
      train: {
        '1': 'ランタンを低く持って、そっと話しかけて。迷子はやさしい声に寄ってくるの。'
      },
      class: {
        '1': '敵が倒れると、その魂は少し迷子になるの。私たちが助けると、向こうも助けてくれる。',
        '2': '光を導く知力。精霊がしばらくいたくなる魅力。',
        say: 'ソウルウォーデンって何をするの？'
      },
      ready: {
        strong: {
          '1': 'いちばん恥ずかしがりな精霊まで寄ってくるね。好きな稽古を選んで。'
        },
        able: {
          '1': 'ウィスプたちはあなたを信じてる。次の稽古に進めるよ。'
        },
        weak: {
          '1': 'まだね。みんなまだ人見知りしてる。知力をもっと、魅力も少し。'
        }
      },
      wisps: {
        '1': 'まあね！さまよい出た精霊たちなの。この子はソワソワ。暖かい側がお気に入り。',
        '2': '悪い精霊なんていないのよ。迷子なだけ。準備ができたら家へ帰るの。',
        say: 'ランタンの中の小さな光って生きてるの？'
      },
      trainBack: {
        '1': 'よくできました。さあ、そっと放してあげて。みんな長い一日だったから。'
      },
      bye: {
        '1': '気をつけてね。迷子の小さな光を見かけたら、あいさつしてあげて。'
      }
    },
    sbMasterIronmonk: {
      hello: {
        '1': '座りなさい。息をしなさい。いや、遅刻しそうな人の息だ。もう一度。',
        '2': '静水のオルだ。開いた手の道を教えている。鉄の拳に、静かな心。'
      },
      again: {
        '1': 'ほう。弟子が戻ってきた。川も戻ってくる。毎日な。'
      },
      train: {
        '1': '足は根のように、手は雨のように。打て。もう一度。百本目が大事だ。'
      },
      class: {
        '1': '刃は使わぬ。手と足と息。一撃ごとに次がたまり、やがて大技になる。',
        '2': '速い手には器用さ。皆が息切れしても落ち着いていられる耐久力。',
        say: 'アイアンモンクって何？'
      },
      ready: {
        strong: {
          '1': '弟子が師になった。誰にも言うなよ。どの稽古でも選びなさい。'
        },
        able: {
          '1': 'よし。器が満ちてきた。次の稽古に進みなさい。'
        },
        weak: {
          '1': 'まだだ。根の浅い木は風で倒れる。耐久力をもっと。'
        }
      },
      noodles: {
        '1': 'そうだ。スープを二日煮込んだ。息を吹きかけないでくれ。',
        '2': 'よい一杯は忍耐を教える。極上の一杯は、それ以外のすべてを教える。',
        say: 'それってラーメン？'
      },
      trainBack: {
        '1': 'よし。さあ、温かいものを食べなさい。力はどんぶりから生まれる。'
      },
      bye: {
        '1': '達者でな。静かに歩き、強く蹴れ。'
      }
    },
    sbMasterBard: {
      hello: {
        '1': 'ようこそ、ようこそ、寒さを抜けて火のそばへ！おっと、韻を踏んじゃった。よくあるんだ。',
        '2': '晴れ空のラーク。暖炉のそばで演奏して、聞いてくれる人なら誰にでもリュートを教えてるよ。'
      },
      again: {
        '1': '大好きなお客さん！椅子を持ってきて。猫に気をつけて、あの子は批評家だから。'
      },
      train: {
        '1': '一緒にかき鳴らそう。ワン、ツー、スリー…指を見ないで。感じるんだ！'
      },
      class: {
        '1': '味方を勇気づける歌に、相手を眠らせる調べさ。',
        '2': '観客をつかむ魅力。心に指が追いつくための技量。',
        say: 'バードって何をするの？'
      },
      ready: {
        strong: {
          '1': 'もうどんな酒場でも満員にできるよ！ぼくの歌、全部持っていって。'
        },
        able: {
          '1': 'すてきな曲！次の一節に進めるよ。'
        },
        weak: {
          '1': 'まだだね。お客さんがあくびしてる。魅力をもっと、友よ。'
        }
      },
      story: {
        '1': '昔々、ひとりの騎士が剣と歌だけを持って、まさにこの橋を渡った…',
        '2': '待って、音楽つきのほうがいい。ラララ、騎士は進んだ…どこまで話したっけ？',
        '3': 'まあ、いいや。いい歌だったでしょ？',
        say: 'お話を聞かせてくれる？'
      },
      trainBack: {
        '1': 'ブラボー！毎日練習してね。ひどい音のときも。そういうときこそ。'
      },
      bye: {
        '1': 'さらば、さらば、また会う日まで！おっと、また韻を踏んじゃった。バイバイ！'
      }
    }
  },
  invasion: {
    pylonsDown: '最後の柱が倒れ、宝があふれ出た！',
    reborn: {
      tusker: '蘇りし戦猪タスカー',
      emberLord: '業火の残り火の王',
      frostJarl: '蘇りし霜の族長',
      voidDragon: '蘇りし虚無の竜'
    }
  },
  enemy: {
    sphinx: "スフィンクス",
    leviathan: "リヴァイアサン",
    hydra: "ヒュドラ",
    elderDragon: "古の竜",
    trainingDummy: '訓練用のかかし',
    goblin: 'ゴブリン',
    goblinSlinger: 'ゴブリン投石兵',
    bandit: '山賊',
    banditArcher: '山賊の弓兵',
    wolf: '狼',
    banditChief: '山賊の頭',
    gnome: 'ノーム',
    goblinKing: 'ゴブリンキング',
    treant: 'トレント',
    spider: '大グモ',
    broodSpider: '子グモ',
    outlawCaptain: '無法者の隊長',
    elderTreant: 'エルダートレント',
    warlord: '戦将クラッグ',
    fireElemental: 'ファイアエレメンタル',
    ironGolem: 'アイアンゴーレム',
    cultist: '教団員',
    emberLord: '残り火の王',
    ironColossus: 'アイアンコロッサス',
    frostGiant: 'フロストジャイアント',
    naga: 'ナーガ',
    skeleton: 'スケルトン',
    necromancer: 'ネクロマンサー',
    chimera: "キマイラ",
    chimeraTail: "蛇の尾",
    centaurWarchief: "ケンタウロスの大族長",
    cyclops: "サイクロプス",
    frostJarl: '霜の族長',
    nagaOracle: '沈んだ神託の巫女',
    voidStalker: 'ヴォイドストーカー',
    wyvern: 'ワイバーン',
    highDemon: 'ハイデーモン',
    voidWarden: '虚無の番人',
    voidDragon: '虚無の竜',
    doomKnight: 'ドゥームナイト',
    imp: 'インプ',
    archDemon: 'アークデーモン',
    voidling: 'ヴォイドリング',
    voidLord: '虚無の王',
    demonPylon: '悪魔の柱',
    orderGuard: '騎士団の審問官',
    syndicateBlade: 'シンジケートの刺客',
    goblinWarchief: 'ゴブリンの戦長',
    thornfather: 'いばらの父',
    broodMother: '群れの母',
    banditBaron: '山賊男爵',
    cinderGolem: '燠火のゴーレム',
    frostHowler: '霜の咆哮獣',
    tideSerpent: '潮の大蛇',
    riftKnight: '裂け目の騎士',
    wyvernMatriarch: 'ワイバーンの女王',
    tusker: '戦猪タスカー',
    tuskerCameo: 'タスカー',
    goblinTyrant: 'ゴブリンの暴君',
    voidDrake: 'ヴォイドドレイク',
    pitLord: '奈落の王',
    frostThane: 'フロストセイン',
    hellhound: 'ヘルハウンド',
    frostHellhound: 'フロストヘルハウンド',
    gargoyle: 'ガーゴイル',
    harpy: 'ハーピー',
    corruptedTreant: '堕ちたトレント',
    centaurRaider: 'ケンタウロスの略奪者',
    cyclopsBrute: 'サイクロプスの荒くれ',
    demonMiner: '悪魔の坑夫',
    sphinxAcolyte: 'スフィンクスの侍祭',
    seaDemon: '海魔',
    drakeHatchling: 'ドレイクの雛',
    hydraSpawn: 'ヒュドラの落とし子'
  },
  results: {
    careful: '慎重な勝利 ×{mult}',
    victory: '勝利！',
    defeat: '敗北',
    retreat: '撤退',
    firstClear: '初クリア！',
    waves: '生き残ったウェーブ：{n}',
    levelUp: 'レベル{n}！',
    points: '能力ポイント+{n}',
    xp: '経験値',
    gold: 'ゴールド',
    lost: '失った分',
    kills: '撃破数',
    chests: '宝箱',
    bosses: 'ボス',
    mastery: 'エリア制覇',
    masteryPct: '{n}%',
    newBest: '自己ベスト更新！',
    time: 'タイム',
    unlocked: 'マップに追加：{places}',
    equipped: '装備中',
    better: '今の装備より強い',
    retry: 'もう一度',
    tip: '経験値と戦利品はそのまま残る。ポイントを振り、師範を訪ねて、強くなって戻ってこよう。'
  },
  pause: {
    title: 'ポーズ中',
    resume: '再開',
    controls: '操作方法',
    retreat: 'マップへ撤退',
    retreatNote: 'ここまでに得たものは残るが、ゾーンはクリアにならない。'
  },
  ending: {
    more: '大悪魔は倒れた。だが王国はまだ安全ではない。世界に残された大いなる脅威はただ一つ、それは虚無の裂け目の奥で待っている。',
    order: {
      title: '鉄の平和',
      text: '恐怖の要塞に鉄の騎士団の旗がひるがえる。街道は安全で、掟は山ほどあり、門の上にはあなたの名が刻まれている。'
    },
    syndicate: {
      title: '灰の取引',
      text: 'シンジケートは要塞の影から王国を治める。もう禁じられたものは何もない。ただ、高くつくだけだ。'
    },
    circle: {
      title: 'エーテルの時代',
      text: '結社は捕らえた虚無の炎で要塞を照らす。門からは驚異があふれ出し、その代償を問う者はいない。'
    },
    free: {
      title: '王はいらない',
      text: '玉座は砕け、要塞は空っぽだ。長い時代のなかで初めて、王国はそこに暮らす人々のものになった。'
    },
    unbound: {
      title: '縛られざる者',
      text: 'あなたは玉座を手にした。騎士団、シンジケート、結社が手を組んで攻めてくる。来るなら来い。'
    },
    note: {
      goblinPact: 'ゴブリンの商人は今もサンフォードの広場で値切り合っている。',
      goblinSlain: '洞穴は空っぽになり、隊商は時間どおりに走る。',
      goblinRansom: 'ゴブリンキングはまた金持ちになり、また襲撃を始めた。',
      oakhavenSaved: 'オークヘイヴンの城壁は高くなり、市場はにぎわいを増した。',
      oakhavenFallen: 'オークヘイヴンの通りには雑草が生えている。闇市は大繁盛だ。',
      coreOrder: 'アイアンホールドの鉱山は静かになり、ドワーフはまた掘りはじめた。',
      coreCircle: 'アイアンホールドの炉は青く輝き、その銃は王国一だ。',
      coreSold: 'どこかで、コアは今もうなっている。ゴーレムは今も歩いている。',
      oracleFreed: '穏やかな日には、漁師たちがはるか沖に巫女の姿を見る。',
      oracleSlain: '沈んだ神殿は静まり返っている。この先を知る者はもういない。',
      dragonPact: '要塞の屋根に竜が巣を作った。竜が応える名はただひとつ。',
      dragonSlain: '騎士団の大広間に竜の頭骨が飾られている。'
    }
  },
  options: {
    saves: {
      save: 'セーブ',
      load: 'ロード',
      newGame: 'ニューゲーム',
      newGameWarn: '今のゲームは新しいゲームに置き換わります。残したい場合は、先にスロットにセーブしてください。',
      confirm: '本当に？もう一度タップ',
      slot: 'スロット{n}',
      empty: '空き',
      level: 'レベル{n}',
      levelAt: '{level}・{place}',
      overwriteAsk: '上書き',
      saved: 'セーブしました！',
      loadWarn: 'ロードすると今のゲームは置き換わります。残したい場合は、先にスロットにセーブしてください。',
      saveHint: 'ゲームはプレイ中に自動でセーブされます。あとで戻れるように、ここにコピーをセーブしましょう。別のビルドを試すときなどに便利です。',
      loadHint: 'セーブしたコピーをロードします。ゲームはそこから再開します。'
    },
    gameplay: 'ゲームプレイ',
    title: '設定',
    general: '一般',
    audio: 'オーディオ',
    language: '言語',
    difficulty: '難易度',
    soundEffects: '効果音',
    music: '音楽',
    mute: 'ミュート',
    musicTrack: '楽曲',
    musicTracks: {
      cozy: '穏やか',
      trance: '冒険'
    },
    haptics: 'バイブレーション',
    on: 'オン',
    off: 'オフ',
    close: '閉じる',
    keyboard: {
      auto: 'キーボード配列を自動検出',
      layout: 'キーボード配列',
      detected: '検出: {layout}',
      bindings: 'キー割り当て',
      press: 'キーを押してください…（Escでキャンセル）',
      reset: 'キーをリセット'
    },
    actions: {
      up: '上へ移動',
      down: '下へ移動',
      left: '左へ移動',
      right: '右へ移動',
      skill1: 'スキル1',
      skill2: 'スキル2',
      skill3: 'スキル3',
      skill4: 'スキル4',
      skill5: 'スキル5',
      skill6: 'スキル6',
      potion: 'ポーションを飲む',
      manaPotion: 'マナポーションを飲む',
      leave: '勝利したエリアを去る',
      interact: '話す',
      target: '次のターゲット',
      map: 'ワールドマップ',
      character: 'ヒーロー',
      inventory: 'バッグ',
      skills: 'スキル',
      roll: 'ローリング',
      elixir: 'エリクサーを飲む',
      elixirNext: '次のエリクサー',
      skill7: 'スキル7',
      skill8: 'スキル8'
    },
    difficulties: {
      easy: 'イージー',
      medium: 'ノーマル',
      hard: 'ハード'
    },
    difficultyHints: {
      easy: '敵の攻撃が弱く、倒れやすい。',
      medium: '想定どおりの手ごたえ。',
      hard: '敵がタフになり、攻撃も痛い。'
    }
  },
  adsBlocked: {
    title: '広告を表示できませんでした',
    body: '動画を表示しようとしましたが、ブラウザの何かが広告をブロックしています。',
    allowPrefix: '次のサイトで広告を許可してください：',
    allowSuffix: '（またはこのゲームのみ広告ブロッカーを一時停止）してから再試行してください。',
    gotIt: 'わかりました'
  },
  forcedDark: {
    title: 'このゲームではダークモードをオフにしてください',
    body: 'ブラウザまたは拡張機能がこのページの色を変えています。このゲームには専用の配色があり、ダークモードの強制変更には対応していません。',
    waiting: 'オフにすると、ゲームは自動で再開します。',
    continueAnyway: '自己責任で続ける',
    hint: {
      darkReader: 'Dark Reader：アイコンをクリックして、このサイトでオフにしてください。',
      extension: 'ダークモードの拡張機能を開いて、このサイトでオフにしてください。',
      chromiumFlag: '{flagUrl} を開いて「Auto Dark Mode for Web Contents」をDefaultにするか、ブラウザのテーマ設定で「dark theme for sites」をオフにしてください。',
      samsung: 'Samsung Internet：メニューを開いてダークモードをオフにするか、Labsで「Use website dark theme」をオンにしてください。',
      forcedColors: 'Windows：設定 → アクセシビリティ → コントラストテーマ で、コントラストテーマをオフにしてください。',
      firefoxColors: 'Firefox：設定 → 色 → 「ページが指定した色を上書きする」を「しない」にしてください。'
    }
  },
  privacy: {
    policy: 'プライバシーポリシー',
    settings: 'プライバシー設定'
  },
  samsungFix: {
    title: 'かんたんな色チェック',
    body: '一部のスマートフォンはウェブページの色を変えてしまいます。下の2つの四角を見比べてください。',
    question: '2つの四角は同じに見えますか？',
    refSquare: '基準の四角',
    pageSquare: 'ページの四角',
    yes: 'はい、同じです',
    no: 'いいえ、違って見えます',
    option: '色を補正する（Samsungのダークモード）',
    optionHint: 'メニューが暗く見えたり、文字が読みにくいときはオンにしてください。',
    recheck: '色チェックをもう一度行う'
  },
  saveStatus: {
    restoredTitle: 'クラウドセーブを復元しました',
    restoredBody: '復元ボーナス +{n} ゴールド',
    tap: 'タップ',
    pausedTitle: 'クラウド同期を一時停止中',
    pausedBody: 'オフラインでプレイ中です。進行状況はここに保存されます。',
    retry: '再試行',
    dismiss: '閉じる'
  },
  loading: {
    tooLong: '読み込みが長すぎますか？ 広告ブロッカーを無効にして再読み込みしてください。'
  },
  license: {
    denied: 'アクセスが拒否されました：ライセンスをご購入ください。'
  },
  leaderboard: {
    title: 'ランキング',
    rank: '#',
    player: 'プレイヤー',
    score: '経験値',
    flair: 'レベル',
    empty: 'まだ誰もランキングにいません。一番乗りしよう！',
    failed: 'ランキングに接続できません。',
    loading: '読み込み中…',
    you: 'あなた',
    yourRank: '{total} 人中 #{n} 位',
    of: '/ {n}人中',
    tabGlobal: '世界'
  },
  wind: {
    title: 'セカンドウィンド',
    text: '倒れてしまった。体力{n}%で立ち上がって、戦いを続ける？',
    once: '1回の訪問につき1回だけ。',
    watch: '動画を見る',
    take: '立ち上がる',
    decline: 'いいえ'
  },
  purse: {
    offer: '財布を3倍に: +{n}'
  },
  shelf: {
    title: 'レア商品',
    restock: '新商品',
    tomorrow: '明日、新商品'
  },
  rested: {
    hud: '2× 経験値',
    banner: 'おかえり！ しっかり休めたね。次の戦いで{time}のあいだ経験値が2倍になるよ。',
    hm: '{h}時間{m}分',
    m: '{m}分',
    h: '{h}時間'
  },
  preset: {
    title: 'ビルド',
    name: 'ビルド{n}',
    rename: 'ビルド{n}の名前',
    save: '保存',
    load: '使う',
    saved: '{name}を保存しました。',
    loaded: '{name}を使用中です。',
    skipped: '外れたもの：{list}'
  },
  respec: {
    title: '修行を忘れる',
    note: '使った能力ポイント{n}を全部取り戻して、もう一度振り分けられます。',
    none: 'まだ取り戻せるポイントがありません。',
    free: '忘れる（無料）',
    buy: '忘れる（{n} ゴールド）',
    confirm: '本当に？もう一度タップ',
    bench: 'これらのスキルは棚に戻ります：{list}',
    done: 'さあ、できたよ。ポイントはまた好きに使えるよ。'
  },
  contract: {
    title: '依頼ボード',
    lead: '各勢力が1日に1つ依頼を出します。プレイ中にカウントされ、どの町でも提出できます。',
    slay: '倒す：{enemy}（{place}）',
    clear: '{place}の探索に勝利する',
    chests: 'どこでも宝箱を開ける',
    rep: '評判+1',
    handIn: '提出',
    handed: '本日分は完了',
    thanks: '{name}が感謝しています。'
  },
  rep: {
    title: '評判',
    meter: '{name}の評判：{n}',
    giftAt: '評判+{n}で贈り物',
    giftClaim: '贈り物を受け取る',
    giftTaken: '贈り物を受け取った',
    giftGot: '贈り物：300ゴールドと{item}。',
    giftGold: '贈り物：300ゴールド。',
    blessAt: '評判+{n}で祝福',
    bless: {
      order: '祝福：体力+5%',
      syndicate: '祝福：倒した敵からのゴールド+10%',
      circle: '祝福：マナ回復+10%'
    }
  },
  ladder: {
    tab: 'コロシアム',
    wave: 'ウェーブ',
    week: '今週: {mod}',
    weekBest: '今週のベスト: ウェーブ{n}',
    yourBest: 'あなたの今週のベスト: ウェーブ{n}',
    none: '今週はまだ挑戦していません。',
    mod: {
      fire: '全部炎',
      nopotions: 'ポーション禁止',
      glass: 'ガラス',
      swarm: '大群',
      elites: 'エリート行進',
      haste: 'ヘイスト'
    },
    modDesc: {
      fire: '敵の攻撃はすべて炎',
      nopotions: 'ポーションなし',
      glass: '全員のダメージが50%アップ',
      swarm: '敵が増える代わりに、体力は少なめ',
      elites: '毎ウェーブにチャンピオンが登場',
      haste: '敵の移動と攻撃が速い'
    }
  },
  forge: {
    upgrade: '強化（{n} ゴールド）',
    next: '次の+{level}：ステータス+{pct}%',
    town: 'どの町の鍛冶屋でも強化できます。'
  },
  ore: {
    'demonglass': { 'name': "魔硝子" },
    'ichor': { 'name': "神話のイコル" },
    iron: {
      name: '鉄鉱石'
    },
    silver: {
      name: '銀鉱石'
    },
    gold: {
      name: '金鉱石'
    },
    mithril: {
      name: 'ミスリル鉱石'
    },
    adamant: {
      name: 'アダマント鉱石'
    },
    aetherite: {
      name: 'エーテライト鉱石'
    }
  },
  plant: {
    sunpetal: {
      name: 'ヒナタバナ',
      desc: '明るい黄色の花。癒し手のお墨付き。'
    },
    glowcap: {
      name: 'ヒカリダケ',
      desc: '暗闇で光るキノコ。頭の働きによい。'
    },
    swiftfern: {
      name: 'ハヤテシダ',
      desc: '軽いシダ。ブーツにこすりつけて走ろう。'
    },
    ironmoss: {
      name: 'テツゴケ',
      desc: '石に生える丈夫なコケ。肌を硬くする。'
    },
    emberbloom: {
      name: 'ヒダネバナ',
      desc: '手に持つとあたたかい花。'
    },
    frostmint: {
      name: 'シモハッカ',
      desc: '冷たくさわやかな葉。頭がすっきりする。'
    },
    moonbell: {
      name: 'ツキスズ',
      desc: '目を鋭くする、めずらしい青白い花。'
    },
    shadowthorn: {
      name: 'カゲイバラ',
      desc: 'めずらしい黒いトゲ。強いけれど、少しよこしま。'
    }
  },
  journal: {
    errands: '依頼',
    empty: '日誌はまだ空っぽ。町の人たちが助けを求めてくるよ。',
    from: '{npc}の依頼',
    ready: '達成！{npc}のところへ戻ろう。',
    taken: '新しい依頼：{title}',
    done: '依頼達成：{title}',
    step: {
      slay: '{enemy} ×{n}を倒す',
      slayAt: '{place}で{enemy} ×{n}を倒す',
      slayAnyAt: '{place}で敵を{n}体倒す',
      clear: '{place}を制圧する',
      visit: '{place}へ行く',
      gather: '{plant} ×{n}を集める',
      bring: '{item}を届ける',
      pieces: '宝の地図のかけらを{n}枚見つける',
      dig: '{place}で宝を掘り出す',
      talk: '{npc}と話す'
    }
  },
  board: {
    title: '{town}の掲示板',
    read: '読む',
    lead: '今日の依頼。終わったらここで報告しよう。',
    kind: {
      slay: '討伐',
      gather: '薬草',
      escort: '隊商'
    },
    slay: '{place}で{enemy} ×{n}を倒す',
    gather: '{plant} ×{n}を届ける',
    escort: 'オークヘイヴンへの道で隊商を守る',
    xp: '+{n} 経験値',
    setOut: '出発',
    thanks: '達成！町のみんなが感謝しているよ。'
  },
  escort: {
    start: '道の終わりまで隊商を守り抜こう！',
    waiting: '隊商が君を待っている。',
    arrived: '隊商が無事に着いた！',
    lost: '隊商がやられてしまった…'
  },
  elixir: {
    might: {
      name: '力のエリクサー',
      desc: '5分間ダメージ+{n}%'
    },
    iron: {
      name: '鉄肌の薬',
      desc: '5分間アーマー+{n}%'
    },
    swift: {
      name: '俊足のトニック',
      desc: '5分間、移動速度と攻撃速度+{n}%'
    },
    mind: {
      name: '明晰の薬湯',
      desc: '5分間、スキルの回復が{n}%速くなる'
    },
    vigor: {
      name: '活力のエリクサー',
      desc: '5分間、毎秒体力の{n}%を回復'
    },
    shadow: {
      name: '渇きの薬',
      desc: '5分間、与えたダメージの{n}%ぶん体力を回復'
    }
  },
  alchemy: {
    talk: '薬草を入れれば、エリクサーのできあがり。どれを作る？',
    lead: 'エリクサーは戦闘中5分間効きます。3本目のフラスコから飲みます。各種{n}個まで持てます。',
    brew: '調合 · {n}',
    carry: 'これを持つ',
    carried: 'フラスコにセット中',
    count: '{n} / {max}',
    herb: '{plant}：{have}/{n}',
    done: '完成！',
    why: {
      full: 'これはもう持てるだけ持っています。',
      herbs: '薬草が足りない。野外でもっと摘もう。',
      gold: 'ゴールドが足りない。'
    }
  },
  memory: {
    title: '記憶カードの屋台',
    lead: '砂が落ちきる前にすべてのペアを見つければ、賭け金が2倍に。5連勝するとレジェンドの賞品もついてくる。',
    bet: '{n}賭ける',
    row: '連勝：{n}／{max}',
    pairs: '{n}ペア・{s}秒',
    won: 'ペアを全部見つけた！{n} ゴールド獲得。',
    lost: '砂が落ちきった。賭け金は没収だ。',
    again: 'もう一度',
    noGold: '賭けるゴールドが足りない。',
    card: 'カード{n}'
  },
  cups: {
    title: 'カップ屋台',
    lead: '宝石を見て、そのカップを目で追って、選ぼう。連勝するほど払いが増える。三連勝で賞品、五連勝で宝物。',
    free: '無料の一回',
    fee: '遊ぶ · {n}',
    row: '連勝：{n} / {max}',
    next: '次の勝ち：{n} ゴールド',
    watch: '宝石を見て！',
    follow: '目で追って…',
    pick: 'カップを選んで！',
    hint: 'カップをタップするか、番号キーを押そう。',
    won: '見つけた！ +{n} ゴールド',
    lost: '外れ。連勝はリセットだよ。',
    near: '惜しい！ちょうど隣だったよ。',
    timeout: '遅すぎ！連勝はリセットだよ。',
    again: 'もう一回',
    noGold: 'ゴールドが足りません。明日の最初の一回は無料です。',
    cup: 'カップ {n}'
  },
  battle: {
    title: 'アイテムバトル',
    lead: 'ギャンブラーの品に自分のアイテムをぶつけよう。売値が高いほうが1ポイント、2ポイントで勝ち。出したアイテムは勝っても負けても戻らない。3連勝すると賞品のアイテムがもらえる。',
    fee: '席につく・{n}',
    row: '連勝：{n}／{max}',
    needItems: '装備していないアイテムがバッグに{n}個以上必要だ。',
    noGold: '参加料のゴールドが足りない。',
    theirs: 'ギャンブラーの手',
    pick: '出すアイテムを選ぼう',
    lay: 'これを出す',
    value: '{n} ゴールド',
    score: 'あなた {a}・{b} ギャンブラー',
    roundWon: 'こっちのほうが高い。あなたに1ポイント！',
    roundLost: '向こうのほうが高い。ギャンブラーに1ポイント。',
    won: 'ゲームに勝った！+{n} 経験値',
    lost: 'ギャンブラーの勝ち。',
    again: 'もう一度'
  },
  gamble: {
    prize: '賞品：{item}！',
    prizeGold: '全部持っているので、代わりに{n} ゴールド！'
  },
  errand: {
    farmersFavor: {
      title: 'トーラー一家の狼'
    },
    herbalistFavor: {
      title: 'ブライアのヒナタバナ'
    },
    collectorFavor: {
      title: '収集家のツキスズ'
    },
    mirelaFavor: {
      title: 'ミレラの消えた荷物'
    },
    treasureMap: {
      title: 'ルーク隊長の宝の地図'
    },
    windrunnerTest: {
      title: 'ウィンドランナーの試練'
    },
    frostwardenTest: {
      title: 'フロストウォーデンの試練'
    },
    lightbringerTest: {
      title: 'ライトブリンガーの試練'
    },
    beastcallerTest: {
      title: 'ビーストコーラーの試練'
    }
  }
}
