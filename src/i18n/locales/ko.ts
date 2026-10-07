// Korean locale — mirrors the key shape of en.ts exactly.
export default {
  gameName: 'Battlecross',
  cancel: '취소',
  close: '닫기',
  ok: '확인',
  continue: '계속',
  onlyAvailableOn: '이 게임은 다음에서만 이용할 수 있습니다:',
  ui: {
    next: '다음',
    replay: '다시하기',
    back: '뒤로',
    play: '플레이',
    pause: '일시정지',
    menu: '메뉴',
    home: '홈',
    info: '정보',
    help: '조작법',
    ok: '알겠어요',
    continue: '계속'
  },
  hud: {
    level: 'Lv.{n}',
    health: '체력 {n}/{max}',
    mana: '마나 {n}/{max}',
    heat: '열기',
    xp: '경험치',
    gold: '{n} 골드',
    potion: '체력 물약 ({n}개 남음)',
    manaPotion: '마나 물약 ({n}개 남음)',
    groups: '적 무리 {n}/{total} 처치',
    wave: '웨이브 {n} / {total}',
    roll: '구르기',
    elixir: '{name} ({n}개 남음)',
    elixirNext: '다음 엘릭서'
  },
  menu: {
    map: '월드맵',
    character: '영웅',
    skills: '스킬',
    inventory: '가방',
    journal: '일지'
  },
  combat: {
    dodge: '회피',
    block: '막음',
    immune: '면역'
  },
  level: {
    open: '열기',
    guarded: '지키는 중',
    locked: '잠김',
    potion: '물약 +1',
    manaPotion: '마나 물약 +1',
    leave: '떠나기',
    chestsLeft: '아직 닫힌 상자 {n}개'
  },
  status: {
    stun: '기절',
    knockup: '공중에 뜸',
    knockdown: '넘어짐',
    stasis: '정지',
    petrify: '석화',
    frozen: '빙결',
    fear: '공포',
    slow: '둔화',
    confuse: '혼란',
    taunt: '도발당함',
    armorShred: '방어도 파괴',
    weaken: '약화',
    vulnerable: '취약',
    burn: '화상',
    poison: '중독',
    bleed: '출혈',
    delayed: '지연 피해',
    haste: '가속',
    attackSpeed: '빠른 공격',
    damageUp: '강화',
    defenseUp: '방어 강화',
    regen: '재생',
    lifestealUp: '생명력 흡수',
    invulnerable: '무적',
    unkillable: '불사',
    stealth: '은신',
    reflect: '반사',
    envenom: '독 칼날',
    exosuit: '엑소 슈트',
    focus: '집중',
    accelerate: '시간 가속',
    overheat: '과열',
    enrage: '격노',
    ambush: '기습',
    elixirMight: '힘의 엘릭서',
    elixirIron: '무쇠 피부',
    elixirSwift: '신속',
    elixirMind: '맑은 정신',
    elixirVigor: '활력',
    elixirShadow: '갈망의 칼날'
  },
  toast: {
    item: '획득: {item}',
    levelUp: '레벨 {level}! 능력치 포인트 +3',
    boss: '{boss} 등장',
    wave: '웨이브 {n}',
    herb: '채집: {plant}',
    piece: '보물 지도 조각!'
  },
  coach: {
    move: {
      touch: '땅을 탭하면 그곳으로 걸어가요. 스틱으로도 움직일 수 있어요.',
      mouse: '땅을 클릭하면 그곳으로 걸어가요. 이동 키로도 움직일 수 있어요.'
    },
    target: {
      touch: '적을 탭하거나, 영웅에서 적까지 드래그해 공격하세요.',
      mouse: '적을 클릭해 공격하세요.'
    },
    skill: {
      touch: '스킬을 탭하면 대상에게 사용해요.',
      mouse: '스킬 키를 누르면 대상에게 사용해요.'
    },
    aim: {
      touch: '스킬을 전장으로 드래그해 조준하고, 손을 떼면 시전해요.',
      mouse: '스킬을 전장으로 드래그해 조준하고, 버튼을 놓으면 시전해요.'
    },
    potion: {
      touch: '물약을 탭해 회복하세요.',
      mouse: '물약 키를 눌러 회복하세요.'
    },
    mana: {
      touch: '파란 플라스크를 탭해 마나를 채우세요.',
      mouse: '마나 물약 키를 눌러 마나를 채우세요.'
    },
    chest: {
      touch: '상자를 탭해 열어 보세요.',
      mouse: '상자를 클릭해 열어 보세요.'
    },
    talk: {
      touch: '길을 따라 스승에게 가서 탭하면 말을 걸 수 있어요.',
      mouse: '길을 따라 스승에게 가서 클릭하면 말을 걸 수 있어요.'
    },
    teach: {
      touch: '「가르쳐 주세요」를 눌러서 이 스승이 무엇을 가르쳐 주는지 확인해 봐요.',
      mouse: '「가르쳐 주세요」를 클릭해서 이 스승이 무엇을 가르쳐 주는지 확인해 봐요.'
    },
    learn: {
      touch: '스킬을 탭한 다음 「배우기」를 탭하세요.',
      mouse: '스킬을 클릭한 다음 「배우기」를 클릭하세요.'
    },
    slot: {
      touch: '새 스킬을 탭한 다음 슬롯을 탭하면 전투에 가져갈 수 있어요.',
      mouse: '새 스킬을 슬롯으로 드래그하면 전투에 가져갈 수 있어요.'
    },
    equip: {
      touch: '새 장비를 탭해 초록색과 빨간색 숫자를 비교하고, 슬롯을 탭해 착용하세요.',
      mouse: '새 장비를 해당 슬롯으로 드래그해 착용하세요. 초록색 숫자는 오르고 빨간색은 내려가요.'
    },
    attr: {
      touch: '더하기를 탭해 능력치 포인트를 쓰세요.',
      mouse: '더하기를 클릭해 능력치 포인트를 쓰세요.'
    },
    travel: {
      touch: '지도에서 다음 장소를 탭한 다음 버튼을 탭하면 그곳으로 가요.',
      mouse: '지도에서 다음 장소를 클릭한 다음 버튼을 클릭하면 그곳으로 가요.'
    },
    buy: {
      touch: '물건을 탭해 가격을 확인하고 「구매」를 탭하세요.',
      mouse: '물건을 클릭해 가격을 확인하고 「구매」를 클릭하세요.'
    },
    exit: {
      touch: '지도 버튼을 탭하면 마을을 떠나 다음 모험을 시작해요.',
      mouse: '지도 버튼을 클릭하면 마을을 떠나 다음 모험을 시작해요.'
    },
    roll: {
      touch: '구르기 버튼을 탭해서 위험에서 벗어나세요. 구르는 동안에는 아무것도 당신을 다치게 할 수 없어요.',
      mouse: '구르기 키를 눌러서 위험에서 벗어나세요. 구르는 동안에는 아무것도 당신을 다치게 할 수 없어요.'
    }
  },
  goal: {
    dummy: '훈련용 허수아비 쓰러뜨리기',
    clear: '{place} 정리하기',
    boss: '{foe} 물리치기',
    exit: '전리품 챙겨 떠나기',
    wave: '웨이브 버티기',
    trainer: '스승과 대화하기',
    learn: '스킬 배우기',
    points: '포인트 쓰기',
    leave: '떠나기: {place}',
    travel: '이동: {place}',
    decide: '선택하기',
    explore: '왕국 탐험하기',
    fight: '전투에서 승리하기',
    show: '길 알려줘: {goal}',
    escort: '상단을 지켜요'
  },
  node: {
    sunford: {
      name: '선포드',
      desc: '평원 끝자락의 농촌 마을. 집과 대장간, 그리고 스승 두 명이 있다.'
    },
    plains: {
      name: '선포드 평원',
      desc: '고블린과 늑대, 도적이 탁 트인 길 위의 상단을 노린다.'
    },
    hollows: {
      name: '고블린 굴',
      desc: '언덕 아래의 동굴. 맨 밑바닥에서 고블린 왕이 기다린다.'
    },
    arena: {
      name: '콜로세움',
      desc: '웨이브가 이어질수록 더 거세진다. 어디까지 올라갈 수 있을까? 매주 월요일 새 순위표.'
    },
    woods: {
      name: '속삭이는 숲',
      desc: '걸어 다니는 고목들, 그 사이에 줄을 치는 거미들.'
    },
    outskirts: {
      name: '오크헤이븐 외곽',
      desc: '오크헤이븐 밖 농장들이 불타고 있다. 군벌의 군대가 성문 앞에 와 있다.'
    },
    oakhaven: {
      name: '오크헤이븐',
      desc: '성벽으로 둘러싸인 교역 도시. 어떤 곳이 될지는 당신에게 달렸다.'
    },
    crags: {
      name: '잿빛 바위산',
      desc: '검은 바위와 타오르는 불길. 광신도들이 불을 지핀다.'
    },
    mines: {
      name: '아이언홀드 광산',
      desc: '드워프들이 너무 깊이 파다가 빛나는 무언가를 깨웠다.'
    },
    ironhold: {
      name: '아이언홀드',
      desc: '산속의 대장간 도시. 왕국 최고의 강철이 여기서 벼려진다.'
    },
    tundra: {
      name: '동상의 툰드라',
      desc: '거인이 걷고 죽은 자가 잠들지 않는 하얀 황무지.'
    },
    temple: {
      name: '가라앉은 신전',
      desc: '물에 잠긴 나가의 전당, 그리고 모든 결말을 보는 신탁.'
    },
    citadel: {
      name: '공허의 성채',
      desc: '작년에는 없던 요새. 성벽이 낮게 웅웅거린다.'
    },
    peak: {
      name: '용의 봉우리',
      desc: '와이번이 정상을 맴돈다. 훨씬 더 큰 무언가가 그 위에서 잠들어 있다.'
    },
    fortress: {
      name: '공포의 요새',
      desc: '대악마의 거처이자, 모든 세력이 탐내는 왕좌가 있는 곳.'
    },
    rift: {
      name: '공허의 균열',
      desc: '악마들이 넘어온 상처. 건너편에서 공허의 군주가 기다린다.'
    },
    silverbridge: {
      name: '실버브리지',
      desc: '오래된 돌다리 위에 선 큰 강변 마을. 모든 직업의 스승이 이곳에서 가르친다.'
    }
  },
  map: {
    title: '왕국',
    town: '마을',
    levels: 'Lv.{min}–{max}',
    arenaBest: '최고: 웨이브 {n}',
    travel: '이동',
    again: '재도전',
    enter: '입장',
    fight: '전투',
    back: '마을로',
    locked: '이웃 지역을 클리어하면 길이 열린다.',
    lockedArena: '고블린 왕의 일이 정리되면 문이 열린다.',
    lockedRift: '공포의 요새 왕좌의 주인이 정해지면 열린다.',
    danger: {
      '1': '당신의 레벨보다 조금 높다.',
      '2': '지금 레벨로는 위험하다.',
      '3': '당신의 레벨보다 훨씬 높다.'
    },
    questOpen: '{quest}: 이곳에서 결정이 기다린다.',
    questDone: '{quest}: {choice}',
    trainer: '숨은 스승: {cls}',
    new: '신규',
    skip: '탭하여 건너뛰기',
    compass: {
      n: '북',
      e: '동',
      s: '남',
      w: '서'
    },
    region: {
      vale: '햇살 초원 계곡',
      hills: '고블린 언덕',
      peaks: '강철 봉우리',
      ash: '잿빛 대지',
      frost: '서리 변경',
      fields: '황금 들판',
      mere: '나가의 늪',
      reach: '공허의 끝',
      dread: '공포의 땅',
      sea: '사파이어 바다',
      bay: '상인의 만'
    },
    walkTouch: '지도를 탭해서 걸어가거나 스틱으로 조종하세요',
    walkMouse: '지도를 클릭해서 걸어가거나 WASD로 조종하세요'
  },
  encounter: {
    kicker: '길 위에서',
    title: {
      fight: '매복!',
      elite: '챔피언이 길을 막았다!',
      chest: '풀숲 속 상자!',
      merchant: '떠돌이 상인'
    },
    result: '{place} 근처의 길 위',
    gold: '+{n} 골드',
    xp: '+{n} 경험치'
  },
  travel: {
    to: '이동 중:',
    loading: '불러오는 중'
  },
  attr: {
    str: {
      name: '근력',
      short: '근력',
      desc: '근접 공격력, 막기 확률, 중갑.'
    },
    dex: {
      name: '민첩',
      short: '민첩',
      desc: '치명타, 공격 속도와 이동 속도.'
    },
    int: {
      name: '지능',
      short: '지능',
      desc: '주문력, 마나, 원소 저항.'
    },
    end: {
      name: '지구력',
      short: '지구',
      desc: '체력, 재생, 방어도, 기절 저항.'
    },
    skl: {
      name: '숙련',
      short: '숙련',
      desc: '치명타 피해, 쿨타임, 원거리 무기.'
    },
    cha: {
      name: '매력',
      short: '매력',
      desc: '하수인, 상점 가격, 보상, 대화 선택지.'
    }
  },
  stat: {
    damage: '피해량',
    health: '체력',
    mana: '마나',
    armor: '방어도',
    resist: '저항',
    crit: '치명타 확률',
    critDamage: '치명타 피해',
    attackSpeed: '공격 속도',
    moveSpeed: '이동 속도',
    cdr: '쿨타임 감소',
    block: '막기',
    dodge: '회피',
    hpRegen: '체력 / 초'
  },
  sheet: {
    points: '남은 포인트 {n}',
    raise: '{attr} 올리기',
    maxLevel: '최고 레벨 달성',
    next: '다음 포인트:'
  },
  heroChoice: {
    title: '영웅을 골라요',
    boy: '소년으로 플레이',
    girl: '소녀로 플레이',
    switch: '내 영웅'
  },
  skills: {
    active: '액티브 스킬',
    passive: '패시브 스킬',
    known: '배움',
    none: '아직 배운 것이 없다. 마을에서 스승을 찾아보자.',
    emptySlot: '빈 슬롯 {n}',
    equip: '장착',
    remove: '해제',
    unmet: '더 이상 요구 조건을 충족하지 못한다.',
    how: '스킬을 탭한 다음 슬롯을 탭하거나, 끌어다 놓으세요. 슬롯에서 끌어내면 뺄 수 있어요.',
    howSlot: '이제 슬롯을 탭해 넣으세요.',
    classCount: '{cls}: {total}개 중 {n}개 배움',
    hint: {
      met: '{place}의 {name}에게서 배울 수 있다.',
      unmet: '{place}의 스승이 이걸 가르쳐 준다.'
    }
  },
  class: {
    aegis: {
      name: '이지스 기사',
      desc: '방패와 성스러운 강철. 남들 대신 공격을 받아낸다.'
    },
    shadow: {
      name: '그림자 칼날',
      desc: '어둠에서 나타나 등 뒤를 찌르고 사라진다.'
    },
    pyro: {
      name: '화염술사',
      desc: '불이 모든 질문의 답이다. 태우고, 그다음 터뜨려라.'
    },
    sovereign: {
      name: '대군주',
      desc: '왜 혼자 싸우나? 근위병을 소환해 지휘하라.'
    },
    chrono: {
      name: '시간술사',
      desc: '적의 시간을 멈추고, 아군을 빠르게 하고, 실수를 되돌린다.'
    },
    blood: {
      name: '피의 연금술사',
      desc: '체력을 내고 힘을 얻은 뒤, 적에게서 다시 마셔 온다.'
    },
    aether: {
      name: '에테르 기술자',
      desc: '총과 포탑, 그리고 열기 게이지. 스킬이 잠기기 전에 방출하라.'
    },
    geo: {
      name: '대지술사',
      desc: '벽과 가시를 세우고 땅 자체를 부순다.'
    },
    windrunner: {
      name: '바람 질주자',
      desc: '활 한 자루와 등 뒤의 바람. 쏘고, 질주하고, 절대 멈추지 마라.'
    },
    frostwarden: {
      name: '서리 파수꾼',
      desc: '얼음 칼날과 차가운 심장. 느리게 하고, 얼리고, 산산조각 내라.'
    },
    lightbringer: {
      name: '빛의 인도자',
      desc: '아군을 치유하고 적의 눈을 멀게 하는 빛. 그 안에 서면 아무것도 막을 수 없다.'
    },
    beastcaller: {
      name: '야수 소환사',
      desc: '늑대 무리, 곰, 매가 곁에서 싸운다. 불러내고, 지휘하라.'
    },
    elementalist: {
      name: '원소술사',
      desc: '불, 서리, 번개, 바위. 섞으면 하나가 다음 것을 일으킨다.'
    },
    soulwarden: {
      name: '영혼 수호자',
      desc: '쓰러뜨린 적이 우호적인 영혼으로 일어나 곁에서 싸우고, 쉬러 집으로 돌아간다.'
    },
    ironmonk: {
      name: '강철 수도승',
      desc: '맨손과 빠른 발. 칠 때마다 기가 쌓인다. 모두 모아 강력한 일격에 쏟아라.'
    },
    bard: {
      name: '음유시인',
      desc: '아군의 힘을 북돋는 노래, 그리고 적을 잠재우거나 서로 싸우게 하는 선율.'
    }
  },
  skill: {
    kind: {
      active: '액티브',
      passive: '패시브'
    },
    cooldown: '쿨타임 {n}초',
    mana: '마나 {n}',
    hpCost: '체력 {n}%',
    heat: '열기 +{n}',
    aimed: '드래그로 조준',
    shieldSlam: {
      name: '방패 강타',
      desc: '대상을 내리쳐 근력의 {dmg}% 피해를 주고 {stun}초 동안 기절시킨다.'
    },
    aegisAura: {
      name: '이지스 오라',
      desc: '방어도 +{armor}%, 받는 물리 피해가 {reduce}% 줄어든다.'
    },
    radiantStrike: {
      name: '광휘의 일격',
      desc: '근력의 {dmg}% 피해를 주는 성스러운 일격. 준 피해의 {heal}%만큼 회복한다.'
    },
    fortitude: {
      name: '불굴',
      desc: '체력의 {hit}%를 넘는 공격을 받으면 체력의 {shield}%만큼 보호막을 {dur}초 동안 얻는다. {icd}초마다 한 번.'
    },
    tauntingCry: {
      name: '도발의 외침',
      desc: '{radius} m 안의 적이 {dur}초 동안 당신을 공격한다. 그동안 방어력 +{def}%.'
    },
    holyBastion: {
      name: '성스러운 보루',
      desc: '{dur}초 동안 무적. 공격한 적은 자기 피해의 {reflect}%를 돌려받는다.'
    },
    shadowstep: {
      name: '그림자 밟기',
      desc: '대상의 등 뒤에 나타나 민첩의 {dmg}% 피해로 뒤를 찌른다.'
    },
    lethality: {
      name: '치명',
      desc: '치명타 확률 +{crit}%, 치명타 피해 +{critDmg}%.'
    },
    venomousBlade: {
      name: '맹독 칼날',
      desc: '{dur}초 동안 공격이 {over}초에 걸쳐 민첩의 {poison}% 중독을 입힌다. 최대 {stacks}번 중첩.'
    },
    evasion: {
      name: '회피술',
      desc: '회피 +{dodge}%. 회피하면 {dur}초 동안 가속 {haste}%.'
    },
    smokeBomb: {
      name: '연막탄',
      desc: '{dur}초 동안 사라진다. 은신 상태에서의 다음 공격은 피해 +{bonus}%.'
    },
    danceOfBlades: {
      name: '칼날의 춤',
      desc: '{radius} m 안의 적 사이를 돌진하며 {hits}번 베어 민첩의 총 {dmg}% 피해를 준다. 춤추는 동안에는 맞지 않는다.'
    },
    fireball: {
      name: '화염구',
      desc: '불덩이가 터져 지능의 {dmg}% 피해를 주고, {burnDur}초에 걸쳐 {burn}% 더 화상을 입힌다.'
    },
    cauterize: {
      name: '소작',
      desc: '화상 상태의 적이 당신에게 주는 피해가 {reduce}% 줄어든다.'
    },
    flamePillar: {
      name: '불기둥',
      desc: '조준한 곳에 불기둥이 솟는다. {dur}초에 걸쳐 지능의 {dmg}% 피해. 휘말린 적은 공중으로 뜬다.'
    },
    pyromaniac: {
      name: '방화광',
      desc: '주문이 치명타로 적중하면 화염 스킬 쿨타임이 {cut}초 줄어든다.'
    },
    combustion: {
      name: '연소 폭발',
      desc: '{radius} m 안의 모든 화상을 터뜨린다. 남은 피해의 {pct}%가 폭발로 한 번에 들어간다.'
    },
    cataclysm: {
      name: '대격변',
      desc: '{dur}초 동안 유성 {meteors}개를 부른다. 하나마다 지능의 {dmg}% 피해.'
    },
    royalGuard: {
      name: '왕실 근위병',
      desc: '곁에서 싸우는 근위병을 소환한다. 매력의 {dmg}% 피해로 공격. 동시에 최대 {max}명.'
    },
    inspiringPresence: {
      name: '고무하는 위엄',
      desc: '하수인의 공격이 {speed}% 빨라지고 체력이 {hp}% 늘어난다.'
    },
    commandFocus: {
      name: '집중 공격 명령',
      desc: '모든 하수인이 대상에게 돌격한다. {dur}초 동안 이동 속도 +{move}%, 공격 속도 +{atk}%.'
    },
    sovereignsTribute: {
      name: '군주의 공물',
      desc: '받는 피해의 {share}%를 하수인이 대신 받는다.'
    },
    bannerOfVictory: {
      name: '승리의 깃발',
      desc: '{dur}초 동안 깃발을 꽂는다. 근처 아군은 피해 +{dmg}%, 초당 체력 {regen}% 재생.'
    },
    armyOfTheRealm: {
      name: '왕국의 군대',
      desc: '궁수 {archers}명, 근위병 {guards}명, 전투 마법사 1명을 {dur}초 동안 소환한다.'
    },
    temporalStasis: {
      name: '시간 정지',
      desc: '대상을 {dur}초 동안 시간 속에 가둔다. 행동할 수 없고 피해도 받지 않는다.'
    },
    hasteField: {
      name: '가속 지대',
      desc: '{dur}초 동안 당신과 근처 아군의 이동이 {move}%, 공격이 {speed}% 빨라진다.'
    },
    timeDistort: {
      name: '시간 왜곡',
      desc: '받는 피해의 {share}%가 지연되어 {over}초에 걸쳐 들어온다.'
    },
    paradoxShift: {
      name: '역설 전환',
      desc: '대상과 자리를 바꾼다. 대상은 지능의 {dmg}% 피해를 받고 주변 적은 {confuse}초 동안 혼란에 빠진다.'
    },
    entropy: {
      name: '엔트로피',
      desc: '스킬을 쓸 때마다 쿨타임이 {cdr}% 짧아진다. 최대 {stacks}번 중첩.'
    },
    chronoRewind: {
      name: '시간 되감기',
      desc: '{back}초 전에 서 있던 곳으로, 그때의 체력과 마나로 돌아간다.'
    },
    sanguineFlask: {
      name: '선혈의 플라스크',
      desc: '자기 피가 담긴 플라스크를 던진다. 범위에 지구력의 {dmg}% 피해, {shredDur}초 동안 방어도 {shred}% 파괴.'
    },
    bloodTransmutation: {
      name: '피의 변환',
      desc: '받은 물리 피해의 {share}%가 마나로 돌아온다.'
    },
    essenceHarvest: {
      name: '정수 수확',
      desc: '{radius} m 안의 모든 적에게서 빨아들여 지능의 {dmg}% 피해를 준다. 그 {heal}%만큼 회복한다.'
    },
    hemophilia: {
      name: '피의 갈증',
      desc: '생명력 착취가 {drain}% 강해진다. 출혈 중인 적을 맞히면 체력을 {heal}% 회복한다.'
    },
    mutagenicRage: {
      name: '변이의 분노',
      desc: '{dur}초 동안: 공격 속도 +{speed}%, 생명력 흡수 +{steal}%, 이동 속도 +{move}%.'
    },
    philosophersCrucible: {
      name: '현자의 도가니',
      desc: '{dur}초 동안 끓는 피 웅덩이를 만든다. 안의 적에게 지능의 {dmg}% 피해, 그 안에 서 있으면 회복한다.'
    },
    aetherPistol: {
      name: '에테르 권총',
      desc: '숙련의 {dmg}% 피해를 주는 빠른 사격. 열기가 {heat} 쌓인다.'
    },
    deployTurret: {
      name: '포탑 설치',
      desc: '숙련의 {dmg}% 피해로 쏘는 포탑을 {dur}초 동안 설치한다. 동시에 최대 {max}개.'
    },
    ventHeat: {
      name: '열기 방출',
      desc: '모든 열기를 부채꼴로 쏟아낸다. 숙련의 최대 {dmg}% 피해, 열기가 많을수록 강하다.'
    },
    thermalOverload: {
      name: '열 과부하',
      desc: '과열 중에는 사격의 치명타 피해 +{crit}%. 그래도 과열되면 스킬이 {lock}초 동안 잠긴다.'
    },
    orbitalBeam: {
      name: '궤도 광선',
      desc: '하늘에서 내려온 광선이 조준한 곳을 태운다. {dur}초에 걸쳐 숙련의 {dmg}% 피해.'
    },
    exoSuit: {
      name: '엑소 슈트',
      desc: '{dur}초 동안: 방어도 +{armor}%, 공격이 로켓이 되어 범위에 숙련의 {rocket}% 피해를 준다.'
    },
    stoneSpike: {
      name: '바위 가시',
      desc: '대상 발밑에서 가시가 솟는다. 근력의 {dmg}% 피해, {dur}초 동안 {slow}% 둔화.'
    },
    earthBarrier: {
      name: '대지의 장벽',
      desc: '{dur}초 동안 바위 벽을 세운다. 걸어서도, 쏴서도 통과할 수 없다.'
    },
    seismicShock: {
      name: '지진 충격',
      desc: '땅을 내리친다. {radius} m 안에 근력의 {dmg}% 피해, 적을 {down}초 동안 넘어뜨린다.'
    },
    earthenSkin: {
      name: '대지의 피부',
      desc: '근력의 {armor}%만큼 방어도를 얻는다. 당신이 받는 기절이 {cut}% 짧아진다.'
    },
    petrify: {
      name: '석화',
      desc: '대상을 {dur}초 동안 돌로 만든다. 돌이 깨질 때 받는 피해가 {vuln}% 늘어난다.'
    },
    tectonicRupture: {
      name: '지각 파열',
      desc: '전장을 찢어 연다. 근처 모든 것에 근력의 {dmg}% 피해, 잔해가 {dur}초 동안 둔화시킨다.'
    },
    scales: '{attr}에 비례',
    shieldThrow: {
      name: '방패 던지기',
      desc: '방패가 적 {bounces}명에게 튕긴다: 각각 근력의 {dmg}% 피해. 맞은 적은 {dur}초 동안 주는 피해가 {weak}% 줄어든다.'
    },
    shieldShove: {
      name: '방패 밀치기',
      desc: '앞에 있는 모두를 밀쳐 근력의 {dmg}% 피해를 준다. 적은 뒤로 날아가고 하던 행동을 멈춘다.'
    },
    holyChains: {
      name: '성스러운 사슬',
      desc: '빛의 사슬이 {radius} m 안의 모든 적을 끌어온다: 지구력의 {dmg}% 피해와 {slow}% 둔화.'
    },
    bulwark: {
      name: '철벽',
      desc: '막기 확률 +{block}%. 막을 때마다 공격자에게 {back} 피해를 돌려준다.'
    },
    retribution: {
      name: '응징',
      desc: '{dur}초 동안 {radius} m 안의 적은 당신만 공격해야 한다. 그 뒤 빛이 근력의 {dmg}% + 받은 피해의 {back}%를 준다.'
    },
    unbreakable: {
      name: '금강불괴',
      desc: '체력이 {hp}% 미만일 때 받는 피해가 {reduce}% 줄어든다.'
    },
    starFan: {
      name: '별 부채',
      desc: '그림자 별 {stars}개를 부채꼴로 던진다. 각각 민첩의 {dmg}% 피해.'
    },
    grapplingHook: {
      name: '갈고리 줄',
      desc: '대상을 끌어와 민첩의 {dmg}% 피해를 주고 {dur}초 동안 {slow}% 둔화시킨다. 큰 적에게는 당신이 끌려간다.'
    },
    silentStrike: {
      name: '소리 없는 일격',
      desc: '등 뒤 공격 피해 +{backstab}%. 적이 당신을 {notice}% 늦게 알아챈다.'
    },
    shadowMark: {
      name: '그림자 표식',
      desc: '대상이 {dur}초 동안 받는 피해가 {vuln}% 늘어난다. 다음 공격은 누구에게든 치명타가 되고 +{bonus}%.'
    },
    bladeRhythm: {
      name: '칼날의 리듬',
      desc: '치명타마다 모든 쿨타임이 {cut}초 줄어든다. 공격 속도 +{speed}%.'
    },
    nightshadeMist: {
      name: '독초 안개',
      desc: '{dur}초 동안 독 안개: 최대 민첩의 {dmg}% 피해. 안개에 갇힌 적은 {confuse}초 동안 혼란에 빠진다.'
    },
    firecracker: {
      name: '폭죽',
      desc: '대상에 폭죽을 붙인다. {delay}초 뒤 터져 지능의 {dmg}% 피해를 주고 주변 모두에게 화상을 입힌다.'
    },
    fanTheFlames: {
      name: '불길 부채질',
      desc: '{radius} m 안의 모든 화상이 {pct}% 더 강하게 타오르고 처음부터 다시 시작된다. {push} m 안의 적은 날아간다.'
    },
    ringOfFire: {
      name: '불의 고리',
      desc: '{dur}초 동안 불꽃 고리가 솟는다: 최대 지능의 {dmg}% 피해. 안의 적은 {slow}% 둔화.'
    },
    everflame: {
      name: '영원의 불꽃',
      desc: '화상이 {burn}% 강해지고, 주문의 치명타 확률이 +{crit}% 오른다.'
    },
    wildfire: {
      name: '들불',
      desc: '불타는 적이 쓰러지면 불꽃이 {radius} m 안의 모든 적에게 {dur}초 동안 옮겨붙는다.'
    },
    phoenixFlight: {
      name: '불사조 비행',
      desc: '불길을 남기며 불사조가 되어 난다: 착지한 곳에 지능의 {dmg}% 피해. {dur}초 동안 초당 {regen}% 회복.'
    },
    callArchers: {
      name: '궁수 소환',
      desc: '뒤에서 매력의 {dmg}% 피해로 쏘는 궁수를 소환한다. 동시에 최대 {max}명.'
    },
    royalRally: {
      name: '왕의 집결',
      desc: '하수인이 곁으로 달려와 체력을 {heal}% 회복한다. {dur}초 동안 모두 방어력 +{def}%.'
    },
    warMarshal: {
      name: '전쟁 원수',
      desc: '하수인이 주는 피해가 {dmg}% 늘어난다.'
    },
    royalDecree: {
      name: '왕의 칙령',
      desc: '{radius} m 안의 적이 무릎 꿇는다: {stun}초 동안 기절, 그 뒤 {dur}초 동안 받는 피해가 {vuln}% 늘어난다.'
    },
    loyalHearts: {
      name: '충성스러운 마음',
      desc: '하수인이 하나 쓰러질 때마다 체력의 {heal}%를 회복한다.'
    },
    summonChampion: {
      name: '용사 소환',
      desc: '왕국의 용사를 {dur}초 동안 부른다: 당신 체력의 {hp}%를 가진 거대한 기사로, 매력의 {dmg}%로 공격한다.'
    },
    echoBolt: {
      name: '메아리 화살',
      desc: '지능의 {dmg}% 피해를 주는 시간의 화살. {delay}초 뒤 {echo}%로 다시 맞힌다.'
    },
    foresight: {
      name: '예지',
      desc: '공격을 한발 앞서 본다: 회피 +{dodge}%, 쿨타임 {cdr}% 감소.'
    },
    timeBubble: {
      name: '시간 거품',
      desc: '{dur}초 동안 느린 시간의 거품: 안의 적은 {slow}% 느려지고 지능의 {dmg}% 피해를 받는다.'
    },
    timeLoop: {
      name: '시간 고리',
      desc: '{dur}초 뒤 대상이 원래 있던 곳으로 되돌아간다: 지능의 {dmg}% 피해와 그동안 잃은 체력의 {echo}%.'
    },
    frozenMoment: {
      name: '얼어붙은 순간',
      desc: '공격이 {chance}% 확률로 적을 {dur}초 동안 시간 속에 얼린다.'
    },
    timeStop: {
      name: '멈춘 세계',
      desc: '{radius} m 안의 시간을 {dur}초 동안 멈춘다. 다시 흐르면 각 적이 지능의 {dmg}% 피해를 받는다.'
    },
    essenceWard: {
      name: '정수 보호막',
      desc: '체력의 {hp}%를 그 {shield}%만큼의 빛나는 보호막으로 바꾼다. {dur}초 지속.'
    },
    vitalReserve: {
      name: '생명 비축',
      desc: '최대 체력 +{hp}%, 매초 체력 {regen} 회복.'
    },
    enfeeblingTonic: {
      name: '약화의 물약',
      desc: '물약을 던진다: 범위에 지능의 {dmg}% 피해. 맞은 적은 {dur}초 동안 주는 피해가 {weak}% 줄어든다.'
    },
    homunculus: {
      name: '호문쿨루스',
      desc: '체력의 {hp}%로 보글보글한 도우미를 {dur}초 동안 만든다. 새로 만들면 이전 도우미 생명의 {back}%가 돌아온다.'
    },
    adrenalCatalyst: {
      name: '아드레날린 촉매',
      desc: '체력이 낮을수록 피해가 커진다: 체력 {low}% 이하에서 최대 +{dmg}%.'
    },
    grandTransmutation: {
      name: '대변환',
      desc: '{radius} m 안의 적 생명의 {pct}%를 정수로 바꾼다. 그 {heal}%만큼 회복한다.'
    },
    rocketJump: {
      name: '로켓 점프',
      desc: '날아올라 조준한 곳에 착지한다: {radius} m 안에 숙련의 {dmg}% 피해. 열기가 {heat} 쌓인다.'
    },
    coolantLoop: {
      name: '냉각 순환',
      desc: '열기가 {cool}% 빨리 빠지고, 스킬이 쌓는 열기가 {cut}% 줄어든다.'
    },
    shockGrenade: {
      name: '충격 수류탄',
      desc: '수류탄을 던진다: {radius} m 안에 숙련의 {dmg}% 피해와 {stun}초 기절. 열기가 {heat} 쌓인다.'
    },
    precisionOptics: {
      name: '정밀 조준경',
      desc: '치명타 확률 +{crit}%. 사격이 적을 {pierce}명 더 관통한다.'
    },
    arcCoil: {
      name: '아크 코일',
      desc: '번개가 대상을 맞히고 적 {jumps}명에게 더 튄다: 각각 숙련의 {dmg}% 피해. 열기가 {heat} 쌓인다.'
    },
    thermalPlating: {
      name: '내열 장갑',
      desc: '열기가 {heat} 이상일 때 받는 피해가 {reduce}% 줄어든다.'
    },
    boulderRoll: {
      name: '바위 굴리기',
      desc: '앞으로 바위를 굴린다: 길에 있는 모두에게 근력의 {dmg}% 피해, {down}초 동안 넘어뜨린다.'
    },
    bedrock: {
      name: '기반암',
      desc: '밀려나지도, 넘어지지도, 공중에 뜨지도 않는다. 최대 체력 +{hp}%.'
    },
    sinkhole: {
      name: '싱크홀',
      desc: '땅이 꺼져 {dur}초 동안 적을 끌어들인 뒤 무너진다: 근력의 {dmg}% 피해.'
    },
    mountainBreaker: {
      name: '산 부수기',
      desc: '보스에게 주는 피해 +{boss}%, 방어도 +{armor}%.'
    },
    geodeShell: {
      name: '수정 껍질',
      desc: '수정 껍질이 {dur}초 동안 체력의 {shield}%만큼 피해를 흡수한 뒤 터져 최대 근력의 {dmg}% 피해를 준다.'
    },
    crumble: {
      name: '붕괴',
      desc: '둔화, 넘어짐, 석화 상태인 적에게 주는 피해가 {dmg}% 늘어난다.'
    }
  },
  slot: {
    main: '주 무기',
    off: '보조 손',
    head: '머리',
    body: '갑옷',
    hands: '손',
    feet: '발',
    trinket: '장신구'
  },
  tier: {
    '1': '일반',
    '2': '고급',
    '3': '희귀',
    '4': '에픽',
    '5': '영웅',
    '6': '전설'
  },
  weapon: {
    melee: '근접 · {attr} 비례',
    ranged: '원거리 · {attr} 비례',
    magic: '마법 · {attr} 비례'
  },
  source: {
    mob: '{zone}의 몬스터가 떨어뜨린다.',
    chest: '{zone}의 상자에서 나온다.',
    boss: '{zone}의 보스가 떨어뜨린다.',
    secret: '{zone}의 비밀 상자에 숨겨져 있다.'
  },
  mod: {
    str: '근력 +{n}',
    dex: '민첩 +{n}',
    int: '지능 +{n}',
    end: '지구력 +{n}',
    skl: '숙련 +{n}',
    cha: '매력 +{n}',
    allAttrs: '모든 능력치 +{n}',
    strOrDex: '근력과 민첩 중 높은 쪽 +{n}',
    armor: '방어도 {n}',
    armorPct: '방어도 +{n}%',
    armorFromStr: '근력으로 얻는 방어도: +{n}%',
    block: '막기 확률 +{n}%',
    dodge: '회피 +{n}%',
    damageReduction: '피해 감소 +{n}%',
    physReduction: '받는 물리 피해 {n}% 감소',
    maxHp: '최대 체력 +{n}',
    maxHpPct: '최대 체력 +{n}%',
    maxMana: '최대 마나 +{n}',
    hpRegen: '초당 체력 +{n}',
    stunDurationCut: '받는 기절이 {n}% 짧아진다',
    damagePct: '주는 피해 +{n}%',
    critChance: '치명타 확률 +{n}%',
    critDamage: '치명타 피해 +{n}%',
    spellCrit: '주문 치명타 확률 +{n}%',
    attackSpeed: '공격 속도 +{n}%',
    moveSpeed: '이동 속도 +{n}%',
    cdr: '쿨타임이 {n}% 짧아진다',
    manaDiscount: '주문의 마나 소모 {n}% 감소',
    lifesteal: '모든 피해에 생명력 흡수 +{n}%',
    physLifesteal: '물리 공격에 생명력 흡수 +{n}%',
    lifeDrainPct: '생명력 착취가 {n}% 강해진다',
    bossDamage: '보스에게 주는 피해 +{n}%',
    backstab: '뒤치기 피해 +{n}%',
    minionDamage: '하수인의 피해 +{n}%',
    minionAttackSpeed: '하수인의 공격이 {n}% 빨라진다',
    minionHp: '하수인의 체력 +{n}%',
    burnOnHit: '공격이 {n} 피해의 화상을 입힌다',
    freezeOnHit: '공격 시 {n}% 확률로 빙결',
    pierce: '탄환이 적 {n}명을 더 관통한다',
    critCooldown: '치명타 시 모든 쿨타임 {n}초 감소',
    extraBlastEvery: '{n}발마다 에너지 폭발 추가',
    reflectOnBlock: '막으면 {n} 피해를 반사한다',
    fatalSave: '치명적인 피해를 받는 대신 {n}초 동안 무적이 된다 (120초마다 한 번)',
    knockbackImmune: '밀쳐내기 면역',
    heatBuildCut: '열기가 {n}% 느리게 쌓인다',
    heatDissipation: '열기가 {n}% 빨리 식는다',
    flaskDamage: '선혈의 플라스크 피해 +{n}%',
    igniteBonus: '화염 주문의 화상이 {n}% 강해진다',
    stealthy: '조용히 움직인다: 적이 알아채는 거리 {n}% 감소',
    fortitude: '큰 공격을 받으면 체력 {n}%의 보호막',
    evasionHaste: '회피하면 가속 {n}%',
    cauterize: '화상 상태의 적이 주는 피해 {n}% 감소',
    pyromaniac: '주문 치명타 시 화염 쿨타임 {n}초 감소',
    tribute: '하수인이 당신이 받는 피해의 {n}%를 받는다',
    timeDistort: '받는 피해의 {n}%가 지연된다',
    entropy: '스킬을 쓰면 쿨타임 {n}% 감소',
    bloodToMana: '받은 물리 피해의 {n}%가 마나로 돌아온다',
    bleedHeal: '출혈 중인 적을 맞히면 체력 {n}% 회복',
    overheatCrit: '과열 중 치명타 피해 +{n}%'
  },
  item: {
    rustedShortsword: {
      name: '녹슨 숏소드'
    },
    apprenticeStaff: {
      name: '견습생의 지팡이'
    },
    scoutsHandgun: {
      name: '정찰병의 권총'
    },
    ironBroadsword: {
      name: '무쇠 대검'
    },
    vipinsStiletto: {
      name: '비핀의 스틸레토'
    },
    aetherCarbine: {
      name: '에테르 카빈'
    },
    ashenGreatsword: {
      name: '잿빛 양손검'
    },
    archmageWand: {
      name: '대마법사의 마법봉'
    },
    chronoBlade: {
      name: '시간의 칼날'
    },
    bloodForgedAxe: {
      name: '피로 벼린 도끼'
    },
    voidCannon: {
      name: '공허 대포'
    },
    dragonSmasher: {
      name: '용 분쇄기'
    },
    bladeOfTheUnbound: {
      name: '속박 없는 자의 검'
    },
    aetheriumDestroyer: {
      name: '에테륨 파괴자'
    },
    woodenBuckler: {
      name: '나무 버클러'
    },
    tomeOfNovices: {
      name: '초심자의 마법서'
    },
    ironShield: {
      name: '무쇠 방패'
    },
    syringeOfTheAdept: {
      name: '숙련자의 주사기'
    },
    aethericBattery: {
      name: '에테르 배터리'
    },
    aegisTowerShield: {
      name: '이지스 타워 실드'
    },
    orbOfEternalFlame: {
      name: '영원한 불꽃의 보주'
    },
    shieldOfTheFallen: {
      name: '쓰러진 자의 방패'
    },
    paddedTunic: {
      name: '누빔 튜닉'
    },
    leatherDoublet: {
      name: '가죽 더블릿'
    },
    chainmailVest: {
      name: '사슬 조끼'
    },
    scholarsRobe: {
      name: '학자의 로브'
    },
    reinforcedPlate: {
      name: '강화 판금 갑옷'
    },
    assassinsGarb: {
      name: '암살자의 복장'
    },
    chronoWeaverCloak: {
      name: '시간술사의 망토'
    },
    bloodSoakedPlate: {
      name: '피에 젖은 판금 갑옷'
    },
    exoArmorChassis: {
      name: '엑소 아머 섀시'
    },
    dragonscaleHauberk: {
      name: '용비늘 사슬 갑옷'
    },
    vestmentsOfSovereign: {
      name: '군주의 예복'
    },
    armorOfTheTitan: {
      name: '거신의 갑옷'
    },
    quiltedCap: {
      name: '누비 모자'
    },
    stalkersHood: {
      name: '추적자의 두건'
    },
    ironcladHelm: {
      name: '철갑 투구'
    },
    seersCirclet: {
      name: '예언자의 관'
    },
    wyrmguardGreathelm: {
      name: '용수호 대투구'
    },
    hatOfTheStarweaver: {
      name: '별직조사의 모자'
    },
    hideGloves: {
      name: '가죽 장갑'
    },
    ironGauntlets: {
      name: '철 건틀릿'
    },
    emberweaveGloves: {
      name: '잉걸불 직조 장갑'
    },
    duelistsGrips: {
      name: '결투가의 손보호대'
    },
    voidforgedGauntlets: {
      name: '공허로 벼린 건틀릿'
    },
    gripsOfTheTempest: {
      name: '폭풍의 손아귀'
    },
    trailBoots: {
      name: '여정의 장화'
    },
    pathfindersBoots: {
      name: '길잡이의 장화'
    },
    forgeplateGreaves: {
      name: '단조판 정강이갑'
    },
    mistwalkerBoots: {
      name: '안개 걸음 장화'
    },
    stormstrideGreaves: {
      name: '폭풍 질주 정강이갑'
    },
    treadsOfTheHorizon: {
      name: '지평선의 발걸음'
    },
    copperBand: {
      name: '구리 반지'
    },
    ringOfMending: {
      name: '치유의 반지'
    },
    bandOfSwiftness: {
      name: '신속의 반지'
    },
    castersEmblem: {
      name: '시전자의 문장'
    },
    infiltratorsCharm: {
      name: '잠입자의 부적'
    },
    timekeepersHourglass: {
      name: '시간지기의 모래시계'
    },
    ringOfTheVampyre: {
      name: '흡혈귀의 반지'
    },
    sovereignsSignet: {
      name: '군주의 인장 반지'
    },
    heartOfTheMountain: {
      name: '산의 심장'
    },
    ringOfAbsolutePower: {
      name: '절대 권능의 반지'
    }
  },
  bag: {
    equip: '장착',
    unequip: '해제',
    tooLow: '레벨 {n} 필요.',
    worn: '착용 중이다. 팔려면 먼저 벗자.',
    versus: '{item}와(과) 비교',
    hint: '아이템을 탭해 살펴보세요. 한 번 더 탭하거나 슬롯으로 드래그하면 착용해요.',
    empty: '가방에 이 종류의 물건이 없다.',
    slotEmpty: '{slot}: 비어 있음',
    slotHolds: '{slot}: {item}',
    filter: {
      all: '전체',
      weapons: '무기',
      armor: '방어구',
      trinkets: '장신구',
      herbs: '약초'
    },
    sort: {
      slot: '종류',
      tier: '품질',
      level: '레벨'
    },
    sortBy: '정렬: {by}',
    noHerbs: '아직 약초가 없어요. 야생에서 자라니, 위로 걸어가면 채집해요.',
    herbCount: '{plant}: {n}'
  },
  shop: {
    buy: '구매',
    sell: '판매',
    owned: '보유',
    empty: '오늘은 진열대가 비었다.',
    goods: '판매 중',
    price: '가격',
    value: '매입가',
    hint: '진열대나 가방의 물건을 탭하거나 끌어서 탁자 위에 올려 보세요.',
    buyBack: '오늘 판 물건',
    buyBackOne: '되사기',
    deal: '거래 성사!',
    say: {
      buy: '좋은 선택이야. 아껴 쓰면 얘도 널 지켜 줄 거야.',
      sell: '좋아. 갖고 싶어 할 사람이 있겠지.',
      back: '마음이 바뀌었어? 괜찮아, 여기 돌려줄게.',
      poor: '미안한데, 가진 돈이 조금 모자라네.'
    }
  },
  trainer: {
    learn: '배우기',
    known: '배움',
    friend: '{faction}은(는) 친구를 대접한다: 20% 할인.',
    fee: '수업료',
    hint: '수업을 고르세요. 테두리가 초록색이면 지금 배울 수 있어요.',
    block: {
      level: '레벨이 너무 낮다.',
      attrs: '능력치가 너무 낮다.',
      gold: '골드가 부족하다.'
    }
  },
  healer: {
    talk: '앉아서 좀 쉬세요. 물약병은 다시 가득 채워 놨어요. 원하시면 더 큰 벨트도 팔아 드릴 수 있어요.',
    note: '어느 지역이든 물약을 {n}개 들고 간다.',
    buy: '플라스크 추가 · {n}',
    full: '허리띠에 더는 못 건다.',
    belt: '물약 허리띠',
    mana: {
      title: '마나 물약',
      note: '재고: {n}/{max}개. 다음에 와도 남아 있어요.',
      buy: '마나 물약 1개 · {n}',
      full: '재고가 가득 찼어요.'
    }
  },
  faction: {
    order: '강철 기사단',
    syndicate: '잿빛 신디케이트',
    circle: '에테르 결사'
  },
  npc: {
    wanderer: {
      name: '떠돌이 Pip',
      talk: '갈 길은 먼데 지갑은 가볍죠? 조금씩 다 갖고 있어요.'
    },
    sunfordSmith: {
      name: '대장장이 브람',
      talk: '꾸밈없는 강철, 정직한 값이야. 천천히 봐.'
    },
    sunfordPeddler: {
      name: '행상 틸리',
      talk: '반지, 부적, 이것저것 다 있어요. 이건 진짜 행운을 가져다줄지도 몰라요.'
    },
    trainerAegis: {
      name: '알드릭 경'
    },
    trainerPyro: {
      name: '엠버 렌'
    },
    elderMara: {
      name: '마라 장로'
    },
    sunfordHealer: {
      name: '룬 수녀'
    },
    goblinTrader: {
      name: '장사꾼 그릭',
      talk: '이것들은 제 가족이 만들었습니다. 솜씨 좋고, 값은 공정합니다.'
    },
    captainHale: {
      name: '헤일 대장'
    },
    oakArmorer: {
      name: '갑옷장이 오도',
      talk: '재고의 절반은 성벽으로 나갔어요. 남은 거라도 맞으면 가져가요.'
    },
    oakMasterArmorer: {
      name: '명장 오도',
      talk: '좋은 판금 갑옷을 꺼냈소. 구경할 자격은 충분하오.'
    },
    oakWeapons: {
      name: '칼장수 세나',
      talk: '날카롭고, 균형 좋고, 값도 적당해. 칼날은 만지지 마.'
    },
    trainerShadow: {
      name: '속삭임'
    },
    trainerSovereign: {
      name: '카스텔란 경'
    },
    oakHealer: {
      name: '펜 수사'
    },
    blackMarket: {
      name: '장물아비',
      talk: '서로 캐묻지 않기야. 신디케이트가 몫을 챙기고, 넌 물건을 챙기고.'
    },
    trainerBlood: {
      name: '상그렐 박사'
    },
    syndicateBoss: {
      name: '마담 애시'
    },
    forgemaster: {
      name: '대장간 주인 도른'
    },
    ironWeapons: {
      name: '망치손 힐다',
      talk: '전부 드워프가 벼린 거야. 부러지는 게 있으면 왜 부러졌는지 알려 줘.'
    },
    ironAetherWorks: {
      name: '땜장이 포스',
      talk: '여기 물건은 전부 핵을 연구하다 나온 거야. 조심해, 대부분 장전돼 있어.'
    },
    ironArmor: {
      name: '무쇠배 가룬',
      talk: '갑옷은 선반에, 반지는 쟁반에.'
    },
    ironOrderArmor: {
      name: '기사단 보급관',
      talk: '필요한 걸 가져가라. 기사단은 자기 사람을 챙긴다.'
    },
    trainerGeo: {
      name: '돌발 영감'
    },
    trainerAether: {
      name: '톱니 기술자 핌'
    },
    ironHealer: {
      name: '브린야 수녀원장'
    },
    exiledSovereign: {
      name: '추방된 카스텔란 경'
    },
    trainerChrono: {
      name: '시간의 수호자'
    },
    mayorBrenna: {
      name: '브레나 퀼 시장'
    },
    sbHealer: {
      name: '안셀 수사'
    },
    sbArmorer: {
      name: '그레타 아이언베인',
      talk: '산의 강철을 강가 가격에. 마음껏 두드려 봐.'
    },
    sbWeapons: {
      name: '코르빈 애시비',
      talk: '애시비 명검점. 모든 날을 손으로 갈았죠. 바로 제 손으로요.'
    },
    sbJeweler: {
      name: '탐 말로',
      talk: '반지, 부적, 행운의 돌. 전부 진짜야. 음, 거의 전부.'
    },
    sbMasterAegis: {
      name: '헬가 스톰실드 경'
    },
    sbMasterPyro: {
      name: '마도사 이그나티우스 베일'
    },
    sbMasterShadow: {
      name: '닉스 할로웨이'
    },
    sbMasterSovereign: {
      name: '퍼시벌 애시컴 경'
    },
    sbMasterGeo: {
      name: '토바 딥루트 할머니'
    },
    sbMasterAether: {
      name: '퀸트 스프로킷 교수'
    },
    sbMasterChrono: {
      name: '시계지기 셀윈'
    },
    sbMasterBlood: {
      name: '베스퍼 크림슨리프'
    },
    sbAlchemist: {
      name: '고사리피리 오딜'
    },
    sbGambler: {
      name: '마담 펠'
    },
    sunfordGambler: {
      name: '재주꾼 도브'
    },
    oakGambler: {
      name: '비단결 렌'
    },
    sbCollector: {
      name: '앨더 베인',
      talk: '귀한 물건은 귀한 친구에게. 잼 묻은 손으로는 아무것도 만지지 말게.'
    },
    sbFence: {
      name: '미렐라 손',
      talk: '좋은 갑옷, 묻지도 따지지도 않아. 뭐, 아주 조금만 묻지.'
    }
  },
  quest: {
    final: '이 선택은 되돌릴 수 없다.',
    needsRep: '{faction} 평판 {n}',
    gold: '+{n} 골드',
    goblinKing: {
      title: '고블린 왕',
      slay: {
        label: '왕의 통치를 끝낸다.'
      },
      pact: {
        label: '선포드와의 교역 협정을 제안한다.'
      },
      ransom: {
        label: '보물을 챙기고 왕관은 남겨 준다.'
      }
    },
    siege: {
      title: '오크헤이븐 공성전',
      defend: {
        label: '오크헤이븐을 지킨다.'
      },
      betray: {
        label: '신디케이트에게 성문을 열어 준다.'
      }
    },
    core: {
      title: '아이언홀드의 심장',
      destroy: {
        label: '핵을 부순다.'
      },
      study: {
        label: '결사에 넘겨 연구하게 한다.'
      },
      sell: {
        label: '신디케이트에 판다.'
      }
    },
    oracle: {
      title: '물에 잠긴 신탁',
      free: {
        label: '사슬을 끊는다.'
      },
      slay: {
        label: '그녀가 지키는 모래시계를 가져간다.'
      }
    },
    dragon: {
      title: '공허의 용',
      slay: {
        label: '용을 처치한다.'
      },
      pact: {
        label: '대악마에 맞설 맹약을 맺는다.'
      }
    },
    throne: {
      title: '빈 왕좌',
      order: {
        label: '왕좌를 강철 기사단에 넘긴다.'
      },
      syndicate: {
        label: '왕좌를 잿빛 신디케이트에 넘긴다.'
      },
      circle: {
        label: '왕좌를 에테르 결사에 넘긴다.'
      },
      shatter: {
        label: '왕좌를 부순다.'
      },
      claim: {
        label: '직접 앉는다.'
      }
    }
  },
  dlg: {
    smalltalkSunford: {
      weather: {
        '1': '오늘 밤에 비가 오겠어. 무릎이 하루 종일 쑤시거든.',
        '2': '지난주에도 그 무릎이 그렇게 말했잖아.',
        '3': '그래서 비 왔잖아? 여기가 아니었을 뿐이지.'
      },
      harvest: {
        '1': '올해는 보리가 잘 됐어.',
        '2': '지킬 수 있으면 좋겠네.'
      },
      goblins: {
        '1': '고블린이 밀러 농장 암탉을 세 마리나 물어 갔대.',
        '2': '또? 이번 달에만 벌써 두 번째잖아.',
        '3': '누군가 저 굴을 어떻게든 해야 해.'
      },
      kingGone: {
        '1': '고블린 왕이 죽었다던데.',
        '2': '잘됐네. 이제 밤새 푹 잘 수 있겠어.'
      },
      pact: {
        '1': '오늘 아침에 고블린한테서 국자를 하나 샀어.',
        '2': '쓸 만해?',
        '3': '솔직히 내 거보다 나아. 아무한테도 말하지 마.'
      },
      bram: {
        '1': '브람이 해 뜨기 전부터 모루 앞에 붙어 있어.',
        '2': '걱정이 있으면 원래 저러잖아.'
      },
      pie: {
        '1': '이거 사과 파이 냄새 아니야?',
        '2': '아까까진 그랬지. 애들이 먼저 찾았거든.',
        '3': '다시 구울게. 이번엔 더 잘 숨겨야지.'
      },
      road: {
        '1': '평원 길로 일주일째 아무도 안 다니네.',
        '2': '산적이 있으니 누굴 탓하겠어.'
      },
      hero: {
        '1': '누가 평원 길의 산적을 쫓아냈대.',
        '2': '다행이다. 우리 언니가 다시 놀러 올 수 있겠네.'
      }
    },
    smalltalkOakhaven: {
      prices: {
        '1': '양배추 하나에 은화 두 닢. 두 닢!',
        '2': '요즘은 성문 지나는 물건은 뭐든 비싸.',
        '3': '그럼 직접 키우지 뭐. 지붕 위에서라도.'
      },
      watch: {
        '1': '성문 경비를 두 배로 늘렸대.',
        '2': '잘됐지. 덕분에 좀 더 편히 자.'
      },
      caravan: {
        '1': '향신료 상단이 또 늦네.',
        '2': '도적인가?',
        '3': '아니면 진흙이든가. 진흙이길 바라자.'
      },
      siege: {
        '1': '농장 너머에 군대가 진을 쳤어.',
        '2': '그럼 지금 지하 저장고를 채워 놔야겠네.'
      },
      saved: {
        '1': '포위가 풀릴 때 성벽에 있었어?',
        '2': '솔직히 난 침대 밑에 숨어 있었어.',
        '3': '마을 절반이 그랬지. 그래도 우린 아직 여기 있잖아.'
      },
      fountain: {
        '1': '행운을 빌려고 분수에 동전을 던졌어.',
        '2': '양배추 값 좀 내려가게 해 달라고 빌었길 바랄게.'
      },
      ash: {
        '1': '아직도 모든 게 연기 냄새가 나.',
        '2': '곧 사라질 거야. 결국엔 다 그래.'
      },
      hide: {
        '1': '어젯밤에 거리에서 발소리 들었어?',
        '2': '목소리 낮춰. 누가 듣고 있을지 몰라.',
        '3': '미안. 그냥... 미안.'
      },
      bread: {
        '1': '빵 반쪽을 찾았어. 자, 좀 나눠 먹자.',
        '2': '참 착한 사람이네. 고마워.'
      }
    },
    smalltalkIronhold: {
      ore: {
        '1': '사 층에 구리 광맥이 좋아.',
        '2': '구리네. 은이길 바랐는데.',
        '3': '구리는 집세를 내 주고, 은은 꿈값을 내 주지.'
      },
      forge: {
        '1': '큰 용광로는 백 년 동안 한 번도 식은 적이 없어.',
        '2': '우리 할아버지도 불 붙이는 걸 도왔다고.'
      },
      beard: {
        '1': '수염 다듬었네.',
        '2': '모루에 너무 가까이 갔다가.',
        '3': '다시 자랄 거야. 어차피 짧은 게 더 어울려.'
      },
      core: {
        '1': '깊은 갱도 아래에서 뭔가 빛나고 있어.',
        '2': '거기서 빛나는 건 좋은 게 없어. 위에 있어.'
      },
      order: {
        '1': '기사단 갑옷장이들은 일이 빨라. 그건 인정해.',
        '2': '빠르긴 하지. 얼마나 버틸지는 두고 봐야 알고.'
      },
      circle: {
        '1': '결사 사람들은 일하면서 콧노래를 불러.',
        '2': '적어도 네 노래보단 낫네.'
      },
      cold: {
        '1': '오늘 아침 지독하게 춥네.',
        '2': '그럼 용광로 옆으로 와서 서 있어.'
      }
    },
    smalltalkKids: {
      tag: {
        '1': '잡았다, 이제 네가 술래야!',
        '2': '치사해, 아직 준비 안 했단 말이야!'
      },
      dragon: {
        '1': '나 크면 드래곤 타고 다닐 거야.',
        '2': '드래곤은 사람을 안 태워 줘.',
        '3': '착한 드래곤이면 태워 줄지도 몰라.'
      },
      sword: {
        '1': '봐, 나 칼 주웠어!',
        '2': '그거 막대기잖아.'
      },
      frog: {
        '1': '우물 옆에 개구리가 있어.',
        '2': '우리 키워도 돼?',
        '3': '엄마가 이제 개구리는 안 된대.'
      }
    },
    ui: {
      overheard: '마을 사람',
      hero: '나',
      leave: '대화 끝내기',
      topics: '할 말',
      gotGold: '{n} 골드를 받았다',
      gotItem: '획득: {item}',
      hint: '지도에 표시됨: {zone}',
      needs: {
        attr: '{attr} {n} 필요',
        level: '레벨 {n} 필요',
        rep: '{faction} 평판 {n} 필요',
        gold: '{n} 골드 필요',
        full: '더 들 수 없다',
        other: '아직 안 된다'
      }
    },
    hero: {
      bye: '그럼 방해 안 할게요.',
      trade: '물건을 좀 볼 수 있을까요?',
      train: '가르쳐 주세요.',
      heal: '치료 좀 해 주실래요?',
      mana: '마나에 좋은 게 있나요?',
      who: '실례지만, 누구세요?',
      rumor: '요즘 들은 소식 있어요?',
      ready: '제가 더 배워도 될 것 같아요?',
      brew: '뭐 좀 만들어 주실래요?',
      play: '저도 낄게요.'
    },
    sunfordSmith: {
      hello: {
        '1': '처음 보는 얼굴이군. 길을 정리한 게 자네인가?',
        '2': '브람이야. 이 대장간은 내가 맡고 있지. 칼이 필요하면 나한테 와.'
      },
      kingDead: {
        '1': '고블린 왕이 죽었다더군. 그놈이 없어도 아쉽진 않아.'
      },
      kingPact: {
        '1': '이제 고블린들이 광장에서 장사를 하더군. 이런 날이 올 줄은 몰랐어.'
      },
      kingRansom: {
        '1': '고블린 왕한테 왕관을 남겨 줬다며. 그놈은 또 올 거야.'
      },
      ending: {
        '1': '온 왕국이 자네 얘기뿐이야. 그래도 숫돌은 필요한가?'
      },
      again: {
        '1': '또 왔나. 무슨 일이야?'
      },
      trade: {
        '1': '꾸밈없는 강철, 정직한 값이야. 한번 봐.'
      },
      who: {
        '1': '브람이야. 이 모루 앞에 선 지 얼추 삼십 년 됐지.',
        '2': '편자, 쟁기, 가끔 칼. 요즘은 거의 칼만 만들어.'
      },
      gear: {
        '1': '맞을 생각이면 방패야. 대부분은 맞거든.',
        '2': '무거운 강철엔 센 팔이 필요해. 근력부터 키워.',
        say: '밖에 나가려면 뭘 챙겨야 할까요?'
      },
      rumor: {
        plains: {
          '1': '평원 길에 산적이 있어. 내가 자네라면 거기부터 가겠어.'
        },
        hollows: {
          '1': '고블린은 평원 너머 굴에서 와. 그놈들 왕도 거기 있고.'
        },
        woods: {
          '1': '평원 동쪽이 속삭이는 숲이야. 나무가 움직인다더군.'
        },
        siege: {
          '1': '오크헤이븐 쪽에 연기가 보여. 외곽에 군대가 진을 쳤어.'
        },
        north: {
          '1': '아이언홀드 강철이 다시 길을 타고 내려오고 있어. 솔직히 내 것보다 나아.'
        }
      },
      shopBack: {
        '1': '아껴 써. 그러면 얘가 널 지켜 줄 거야.'
      },
      bye: {
        '1': '조심해서 가.'
      }
    },
    sunfordPeddler: {
      hello: {
        '1': '어머, 안녕하세요! 사실 거예요, 구경만 하실 거예요? 둘 다 좋아요.',
        '2': '전 틸리예요. 반지, 부적, 여기저기서 모은 잡동사니를 팔아요.'
      },
      rival: {
        '1': '고블린 가판대 보셨어요? 거기가 우리 가게보다 싸요. 너무 불공평해요.'
      },
      again: {
        '1': '오셨네요! 마음에 들어 하실 만한 걸 몇 개 따로 빼 놨어요.'
      },
      trade: {
        '1': '구경하세요. 이건 행운의 물건이에요. 아마도요.'
      },
      who: {
        '1': '길을 돌아다니면서 사람들이 버리고 싶어 하는 걸 사들여요.',
        '2': '가끔은 뭘 줍기도 해요. 산적들은 도망칠 때 정말 많이 흘리거든요.'
      },
      trinkets: {
        '1': '양손에 하나씩, 두 개를 낄 수 있어요. 밖에선 작은 게 다 쌓여요.',
        say: '장신구는 실제로 어디에 좋아요?'
      },
      stolen: {
        '1': '아. 질문 참 잘하시네요.',
        '2': '이 반지 드릴 테니까, 어디서 찾았는지는 더 묻지 마세요.',
        say: '이 물건들, 정말 다 어디서 났어요?'
      },
      rumor: {
        arenaShut: {
          '1': '여기서 남쪽에 오래된 콜로세움이 있어요. 고블린이 습격하는 동안은 꽉 닫혀 있고요.'
        },
        arenaOpen: {
          '1': '콜로세움이 다시 열렸어요. 여덟 라운드래요. 다들 내기를 하더라고요.'
        },
        east: {
          '1': '오크헤이븐은 반짝이는 건 뭐든 값을 잘 쳐 줘요. 동쪽, 숲 너머예요.'
        }
      },
      shopBack: {
        '1': '지갑이 두둑해지면 또 오세요!'
      },
      bye: {
        '1': '조심히 가세요. 밖에선 돈 꼭 쥐고 다니시고요.'
      }
    },
    trainerAegis: {
      hello: {
        '1': '똑바로 서라. 강철 기사단의 기사와 이야기하고 있다.',
        '2': '알드릭 경이다. 사람과 위험 사이에 서는 법을 가르친다.'
      },
      saved: {
        '1': '오크헤이븐은 건재하다. 성벽에 있었다고 들었다. 잘했다.'
      },
      fallen: {
        '1': '네가 오크헤이븐의 성문을 열었지. 잊은 척은 않겠다. 무슨 일이냐?'
      },
      dragon: {
        '1': '봉우리의 용을 잡았다고? 직접 보고 싶었군.'
      },
      friend: {
        '1': '기사단이 너를 좋게 보고 있다. 벗에게는 내 수업료도 낮아진다.'
      },
      foe: {
        '1': '기사단은 너를 적이라 부른다. 그래도 가르치겠다. 정한 건 나지, 그들이 아니다.'
      },
      again: {
        '1': '훈련하러 또 왔나?'
      },
      train: {
        '1': '좋다. 잘 봐라, 한 번만 보여 주겠다.'
      },
      class: {
        '1': '남을 향한 공격을 대신 받아 낸다. 단순하지만, 어렵다.',
        '2': '방패엔 근력이, 버티는 데는 지구력이 필요하다.',
        say: '이지스 기사는 실제로 뭘 하나요?'
      },
      ready: {
        strong: {
          '1': '내가 아는 대부분을 배울 힘은 된다. 지구력을 계속 키워라.'
        },
        able: {
          '1': '다음 수업을 받을 준비가 됐다. 우쭐하지는 마라.'
        },
        weak: {
          '1': '아직이다. 방패보다 네가 먼저 지친다. 근력과 지구력을 더 키워라.'
        }
      },
      order: {
        '1': '우리는 길의 안전과 법을 지킨다. 너무 엄하다고 하는 이도 있지.',
        '2': '우리 편에 서면 우리 갑옷장이와 스승들이 너를 기억할 것이다.',
        say: '강철 기사단에 대해 알려 주세요.'
      },
      trainBack: {
        '1': '지루해질 때까지 연습해라. 그러고 나서도 계속해라.'
      },
      bye: {
        '1': '조심히 가라.'
      }
    },
    trainerPyro: {
      hello: {
        '1': '어머, 제자예요? 좋네요. 조금만 뒤로 물러서 줄래요?',
        '2': '엠버 렌이에요. 불을 가르쳐요. 대개는 시키는 대로 해 줘요.'
      },
      core: {
        '1': '핵을 결사에 넘겼군요! 거기서 뭘 배울 수 있을지 기대돼서 못 참겠어요.'
      },
      friend: {
        '1': '결사가 당신을 좋게 말하던데요. 참고로 할인된다는 뜻이에요.'
      },
      foe: {
        '1': '결사는 당신한테 화가 나 있어요. 그래도 가르쳐 줄게요. 조용히요.'
      },
      again: {
        '1': '왔네요! 뭔가 불붙일 준비 됐어요?'
      },
      train: {
        '1': '자. 내 손을 잘 보고, 소매는 나한테서 떨어뜨려 놔요.'
      },
      class: {
        '1': '주로 불을 붙이죠. 그다음엔 불이 원하는 곳으로 번지게 하고요.',
        '2': '전부 지능에서 나와요. 머리가 날카로울수록 불꽃은 뜨거워지죠.',
        say: '화염술사는 정확히 뭘 하나요?'
      },
      ready: {
        strong: {
          '1': '솔직히요? 당신이 가르쳐도 되겠어요. 원하는 건 다 가져가요.'
        },
        able: {
          '1': '다음 주문을 배울 준비가 됐어요. 자, 보여 줄게요.'
        },
        weak: {
          '1': '아직은 안 돼요. 지능이 더 있어야 해요, 안 그러면 불이 주인 행세를 해요.'
        }
      },
      circle: {
        '1': '학자들이에요. 세상이 뭐로 이루어졌는지 연구하죠. 가끔은 폭발해요.',
        say: '에테르 결사가 누구예요?'
      },
      trainBack: {
        '1': '가서 연습해요. 불이 번지지 않는 곳에서요, 제발.'
      },
      bye: {
        '1': '몸조심해요!'
      }
    },
    elderMara: {
      hello: {
        '1': '자네가 길에서 왔다는 사람이로군. 이리 와 보게, 얼굴 좀 보세.',
        '2': '마라일세. 내가 이 마을을 돌본 지... 아, 사십 년이 됐구먼.'
      },
      slain: {
        '1': '굴이 조용해졌네. 쉬운 일이 아니었을 텐데, 우리가 잠들 수 있는 건 그 덕이야.'
      },
      pact: {
        '1': '내 광장에서 고블린이 물건을 팔더군. 자네가 설득한 거지?'
      },
      ransom: {
        '1': '그 왕의 금을 받고 왕관은 남겨 뒀더군. 실망하지 않았다고는 못 하겠네.'
      },
      saved: {
        '1': '오크헤이븐에서 소식이 왔네. 성문이 버텼다고. 자네가 거기 있어서 다행이야.'
      },
      fallen: {
        '1': '오크헤이븐이 불탔다더군. 어떻게 된 건지는 듣고 싶지 않네. 오늘은.'
      },
      ending: {
        '1': '자네가 공포의 요새의 운명을 정했다지. 우리 작은 길에서 거기까지 갔구먼.'
      },
      again: {
        '1': '잠깐 앉게. 길은 어디 안 가니까.'
      },
      reward: {
        '1': '민병대가 못 지킨 길을 자네가 지켰지. 마을에서 조금씩 모았네.',
        '2': '많진 않아. 우리가 낼 수 있는 만큼이네.',
        say: '저를 만나고 싶어 하신다고 들었어요.'
      },
      quest: {
        '1': '습격은 고블린 굴에서 오네. 놈들이 자기들끼리 왕을 세웠어.',
        '2': '그 왕을 죽이길 바라시는 거죠?',
        '3': '나는 습격이 멈추길 바랄 뿐이네. 어떻게 멈출지는... 거기 내려가서 자네가 정하게.',
        '4': '굴은 평원 바로 너머야. 부디 조심하게.',
        say: '선포드에 무슨 걱정거리가 있나요?'
      },
      king: {
        say: '고블린 왕에 대해서요...',
        slay: {
          '1': '그자가 사라지고 상단이 다시 다니는군. 기분이 어땠는지는 묻지 않겠네.'
        },
        pact: {
          '1': '교역 협정이라니. 우리 어머니가 들으셨으면 기절하셨을 걸세. 그래도 장례보단 교역이 낫지.'
        },
        ransom: {
          '1': '금은 금방 떨어지지만 원한은 안 떨어지네. 습격이 시작되면 이 말을 떠올리게.'
        }
      },
      town: {
        '1': '대부분 농부지. 대장장이 하나, 치료사 하나, 우리를 참아 주는 선생 둘.',
        '2': '여행 사이에는 여기서 쉬게. 집이 그러라고 있는 거니까.',
        say: '선포드에 대해 알려 주세요.'
      },
      next: {
        say: '다음엔 어디로 가야 하죠?',
        plains: {
          '1': '먼저 평원 길이지. 상단이 안 오면 우린 먹고살 수가 없네.'
        },
        hollows: {
          '1': '고블린 굴이네. 습격이 계속되는 한 다른 곳도 안전하지 않아.'
        },
        woods: {
          '1': '동쪽, 속삭이는 숲을 지나게. 오크헤이븐으로 가는 길이야.'
        },
        oakhaven: {
          '1': '오크헤이븐이 포위됐네. 외곽이 무너지면 마을도 함께 무너질 걸세.'
        },
        north: {
          '1': '북쪽이겠지. 잿빛 바위산, 그 너머가 아이언홀드야. 갈수록 험해질 걸세.'
        }
      },
      bye: {
        '1': '멀쩡히 돌아오게. 내가 바라는 건 그것뿐이네.'
      },
      map: {
        '1': '루크 대장의 지도로군! 고블린에게 잡히기 전에 지도를 찢어서 조각들을 숨겨 뒀지.',
        '2': '여섯 조각을 다 찾으면 X가 길을 알려 줄 걸세. 잿빛 바위산 어딘가지. 거기를 파면 금은 자네 것이네.',
        say: '오래된 지도 조각을 찾았어요.'
      }
    },
    sunfordHealer: {
      hello: {
        '1': '잠깐 가만히 있어 봐요. 아, 괜찮네요. 버릇이라서요, 미안해요.',
        '2': '룬 수녀예요. 길에서 망가진 건 뭐든 고쳐 드려요.'
      },
      again: {
        '1': '멀쩡히 돌아왔네요? 다행이에요. 그래도 앉아 봐요.'
      },
      heal: {
        '1': '앉아서 좀 쉬어요. 가기 전에 물약병을 채워 둘게요.'
      },
      mana: {
        '1': '이건 써요. 주문이 바닥나면 마시세요.'
      },
      potions: {
        '1': '싸움마다 물약병을 몇 개 들고 가죠. 필요해지기 전에 마셔요, 후가 아니라.',
        '2': '더 들고 다니고 싶으면 큰 벨트를 팔아 드릴게요.',
        say: '물약은 어떻게 쓰나요?'
      },
      rumor: {
        goblins: {
          '1': '고블린들은 투석용 돌에 뭔가를 발라요. 속이 메스꺼우면 다시 오세요.'
        },
        spiders: {
          '1': '이번 주에 숲에서 거미에 물린 사람을 셋이나 치료했어요. 거기선 발밑 조심하세요.'
        },
        burns: {
          '1': '북쪽에서 화상 입은 병사들이 계속 내려와요. 잿빛 바위산이라더군요.'
        }
      },
      healBack: {
        '1': '벨트는 가득 채우고, 머리는 낮추고요.'
      },
      bye: {
        '1': '밖에서 몸조심하세요.'
      }
    },
    goblinTrader: {
      hello: {
        '1': '당신이 협약을 맺은 분이군요. 우리 왕께서 당신을 환영한다고 하셨습니다.',
        '2': '저는 그릭입니다. 고블린이 만든 물건을 팝니다. 솜씨 좋고, 값은 공정합니다.'
      },
      again: {
        '1': '친구여. 다시 만나서 반갑습니다.'
      },
      trade: {
        '1': '보십시오. 이것들은 제 가족이 만들었습니다.'
      },
      king: {
        '1': '왕께서는 이제 잘 드십니다. 습격도 없습니다. 제 백성도 덜 굶주립니다.',
        '2': '왕께서는 당신 이야기를 자주 하십니다. 존경을 담아서요.',
        say: '왕은 어떻게 지내?'
      },
      town: {
        '1': '사람들은 아직 쳐다봅니다. 하지만 빵집 주인이 파이를 줍니다. 저는 그 파이가 좋습니다.',
        say: '선포드는 마음에 들어?'
      },
      rumor: {
        crags: {
          '1': '제 사촌들은 북쪽 검은 바위를 팝니다. 지금은 거기서 불이 걸어 다닌다고 합니다.'
        },
        deep: {
          '1': '깊은 곳에서 무언가가 깨어나고 있습니다. 고블린은 땅으로 느낍니다.'
        }
      },
      shopBack: {
        '1': '감사합니다. 또 오십시오.'
      },
      bye: {
        '1': '무사히 가십시오, 친구여.'
      }
    },
    captainHale: {
      hello: {
        '1': '검이 또 하나 늘었군. 좋아. 한 자루라도 아쉬운 판이니까.',
        '2': '헤일 대장이다. 오크헤이븐 수비대의 남은 병력을 지휘하고 있지.'
      },
      saved: {
        '1': '성문이 버텼어. 삼백 년에 한 해 더. 그 빚은 내가 졌군.'
      },
      ending: {
        '1': '공포의 요새의 향방을 정했다지. 그에 비하면 내 성벽은 작아 보이는군.'
      },
      again: {
        '1': '성벽은 아직 서 있어. 적어도 오늘은.'
      },
      after: {
        '1': '반갑군. 오크헤이븐은 잊지 않았어.'
      },
      quest: {
        '1': '나쁘지. 크라그라는 군벌이 우리를 포위했는데, 놈은 공짜로 싸우지 않아.',
        '2': '누가 돈을 대고 있죠?',
        '3': '잿빛 신디케이트요. 자기들만의 도시를 원하는데, 우리 도시엔 성벽이 있소.',
        '4': '오크헤이븐 외곽에 있는 놈의 진영을 쳐부수게. 거기서 끝이 나지, 어느 쪽으로든.',
        say: '상황이 얼마나 나쁜가요?'
      },
      siege: {
        '1': '마을의 삼분의 일을 제안받았겠지? 나한테는 사분의 일이었어.',
        '2': '이제 신디케이트가 자네를 쫓을 거야. 길에서 뒤를 조심하게.',
        say: '포위전에 대해서요...'
      },
      town: {
        '1': '교역 도시지. 평원과 산 사이를 오가는 물건은 전부 여기서 통행세를 내.',
        '2': '그래서 다들 탐내. 그래서 내가 못 넘겨주는 거고.',
        say: '오크헤이븐에 대해 알려 주세요.'
      },
      order: {
        '1': '나는 오크헤이븐에 속해 있네. 기사단과는 대체로 뜻이 맞아. 매일은 아니지만.',
        say: '강철 기사단의 지휘를 받으시나요?'
      },
      rumor: {
        crags: {
          '1': '숲 북쪽은 땅이 검게 타고 있어. 잿빛 바위산이지. 대부분 광신도들이야.'
        },
        mines: {
          '1': '아이언홀드가 강철을 안 보내고 있어. 광산에 뭔가 문제가 생겼겠지.'
        },
        north: {
          '1': '극북이 조용해졌어. 내 경험상 그건 절대 좋은 일이 아니야.'
        }
      },
      bye: {
        '1': '검은 가까이 둬.'
      }
    },
    oakArmorer: {
      hello: {
        '1': '투구를 찾으신다면 미안해요. 전부 성벽 위에 올라가 있어요.',
        '2': '오도예요. 갑옷을 만들죠. 요즘 잠을 통 못 자서요.'
      },
      again: {
        '1': '아직 여기 있어요. 여전히 거의 다 모자라고요.'
      },
      trade: {
        '1': '재고의 절반은 성벽으로 나갔어요. 남은 거라도 맞으면 가져가요.'
      },
      who: {
        '1': '이십 년 동안 이 마을 갑옷을 만들었어요. 전부 한꺼번에 입혀진 건 처음 봤고요.'
      },
      armor: {
        '1': '버티고 서 있을 거면 판금. 계속 움직일 거면 가죽. 몸이 빠르면 로브예요.',
        say: '어떤 갑옷을 입어야 할까요?'
      },
      rumor: {
        backRoom: {
          '1': '포위가 풀리면 뒷방을 열 거예요. 좋은 판금 갑옷은 거기 있어요.'
        }
      },
      shopBack: {
        '1': '버틸 거예요. 지금까지 버텨 왔으니까요.'
      },
      bye: {
        '1': '밖에선 고개 숙이고 다녀요.'
      }
    },
    oakMasterArmorer: {
      hello: {
        '1': '왔군! 들어와요. 뒷방이 열려 있어요, 당신을 위해서요.',
        '2': '이제 다들 명장 오도라고 불러요. 조금 평화로워지니 장사가 달라지네요.'
      },
      ending: {
        '1': '우리 성문에서 공포의 요새까지라니. 당신 갑옷을 내가 맞췄다고 만나는 사람마다 말하고 다녀요.'
      },
      again: {
        '1': '반가워요. 오늘은 뭘로 할까요?'
      },
      trade: {
        '1': '좋은 판금 갑옷을 꺼냈어요. 구경할 자격은 차고 넘치죠.'
      },
      town: {
        '1': '바쁘고, 시끄럽고, 통행세에 투덜대는 상인들로 가득해요.',
        '2': '멋지죠. 몇 주째 조용한 한 시간이 없어요.',
        say: '마을은 어떤가요?'
      },
      rumor: {
        mines: {
          '1': '내 강철은 아이언홀드에서 오는데 소식이 끊겼어요. 누가 광산을 살펴봐야 해요.'
        },
        tundra: {
          '1': '내가 다뤄 본 최고의 광석은 툰드라에서 나왔어요. 그걸 찾은 사람들은 돌아오지 않았지만요.'
        }
      },
      shopBack: {
        '1': '몸에 안 맞으면 가져와요. 고쳐 줄게요.'
      },
      bye: {
        '1': '언제든 환영이에요.'
      }
    },
    oakWeapons: {
      hello: {
        '1': '구경? 구매? 어느 쪽이든 괜찮아. 칼날만 만지지 마.',
        '2': '세나야. 칼을 팔아. 그걸로 뭘 하든 네 일이고.'
      },
      saved: {
        '1': '그럼 포위가 풀렸구나. 마을엔 잘됐지. 내 장사엔 전쟁이 더 나았지만.'
      },
      again: {
        '1': '더 날카로운 걸 찾으러 왔어요?'
      },
      trade: {
        '1': '날카롭고, 균형 좋고, 값도 적당해. 천천히 봐.'
      },
      who: {
        '1': '세 번의 전쟁에서 양쪽에 다 팔았어. 난 아직 여기 있고. 그들 대부분은 없지.'
      },
      rumor: {
        krag: {
          '1': '크라그 부하들은 좋은 강철을 들고 있어. 신디케이트 돈이지. 기회 되면 주워 갈 만해.'
        },
        which: {
          '1': '빠른 칼은 민첩, 활과 총은 숙련이야. 자기가 어느 쪽인지 알아 둬.'
        }
      },
      shopBack: {
        '1': '기름칠 해 둬. 녹은 뼈보다 빨리 좋은 날을 망치니까.'
      },
      bye: {
        '1': '나한테 빚진 채로 죽지는 마.'
      }
    },
    trainerShadow: {
      hello: {
        '1': '내가 뒤로 다가온 것도 못 들었지. 대부분 그래.',
        '2': '다들 나를 속삭임이라고 불러. 눈에 띄지 않는 법을 가르치지.'
      },
      fallen: {
        '1': '마을이 조용해졌어. 경비도 줄었고. 우리 중 몇몇한텐 일하기 쉬워졌지.'
      },
      friend: {
        '1': '신디케이트는 널 친구로 쳐. 친구는 덜 내지. 기억해 둬.'
      },
      foe: {
        '1': '신디케이트는 네 목숨을 원해. 난 가르치려고 돈 받은 거지 죽이려고 받은 게 아니야. 그래서, 수업이야.'
      },
      again: {
        '1': '아직도 너무 시끄러워. 그것부터 고치자.'
      },
      train: {
        '1': '그럼 조용히. 손 말고 내 발을 봐.'
      },
      class: {
        '1': '이미 네 뒤에 서 있는 사람. 들어가서, 한 번 베고, 사라지지.',
        '2': '민첩이 가장 중요해. 벤 게 제대로 먹히게 하려면 숙련도 필요하고.',
        say: '그림자 칼날이 뭔가요?'
      },
      ready: {
        strong: {
          '1': '이제 움직임이 좋아. 나머진 다 가져가. 연막엔 숙련을 좀 가져오고.'
        },
        able: {
          '1': '손은 충분히 빨라. 다음 단계로.'
        },
        weak: {
          '1': '아직이야. 발이 무거워. 민첩부터 키워.'
        }
      },
      syndicate: {
        '1': '법에 값이 있다는 걸 알아챈 사람들이지. 난 판단 안 해. 그냥 돈을 받을 뿐이야.',
        say: '잿빛 신디케이트가 누구죠?'
      },
      trainBack: {
        '1': '이제 아무도 못 보는 데서 연습해.'
      },
      bye: {
        '1': '나를 본 적 없는 거야.'
      }
    },
    trainerSovereign: {
      hello: {
        '1': '가까이 와도 좋다. 거기까지다, 그 정도면 충분히 가깝군.',
        '2': '오크헤이븐 가장 오랜 가문의 카스텔란 경이다. 나는 지휘하는 법을 가르친다.'
      },
      saved: {
        '1': '내 마을이 건재하고, 우리 가문의 이름도 지켜졌다. 감사한다. 진심으로.'
      },
      friend: {
        '1': '기사단의 벗이라. 수업료를 낮춰 주겠다. 소문내지는 말아 주게.'
      },
      foe: {
        '1': '기사단 명단에 자네 이름이 올라 있네. 그래도 가르치겠다. 돈은 돈이니까.'
      },
      again: {
        '1': '아, 또 자네로군. 계속해 볼까?'
      },
      train: {
        '1': '좋다. 명령이 어떻게 내려지고 어떻게 따라지는지 보게.'
      },
      class: {
        '1': '혼자 싸우지 않는 자지. 부르면 경비병이 와서 대신 싸운다.',
        '2': '매력이 필요하네. 목소리가 안 닿는 지도자를 따르는 자는 없으니.',
        say: '대군주가 뭔가요?'
      },
      ready: {
        strong: {
          '1': '이제 제법 위엄이 있군. 내 남은 수업을 모두 받게.'
        },
        able: {
          '1': '목소리가 멀리 닿는군. 다음 수업을 받을 준비가 됐네.'
        },
        weak: {
          '1': '안타깝지만 아직은 아무도 자네를 따르지 않겠군. 매력을 키우게.'
        }
      },
      family: {
        '1': '헤일 대장이 서 있는 성벽은 우리 가문이 쌓은 걸세. 그는 그걸 잊었지. 내가 상기시켜 주고 있고.',
        say: '당신의 가문에 대해 알려 주세요.'
      },
      trainBack: {
        '1': '그럼 가 보게. 누군가를 이끌어 보게나.'
      },
      bye: {
        '1': '잘 가게.'
      }
    },
    oakHealer: {
      hello: {
        '1': '다음 분! 아, 걸어서 오셨네요. 이거 반가운 변화군요.',
        '2': '펜 수사입니다. 성벽 위에 부상자가 마흔 명인데, 저는 한 명뿐이에요.'
      },
      saved: {
        '1': '사흘째 새 부상자가 없어요. 뭘 해야 할지 잘 모르겠네요.'
      },
      again: {
        '1': '또 오셨군요, 두 발로 멀쩡히. 좋습니다.'
      },
      heal: {
        '1': '여기 누우세요, 깨끗한 간이침대예요. 자. 물약병도 채웠으니 가셔도 돼요.'
      },
      mana: {
        '1': '마나 물약입니다. 오래된 동전 맛이 나지만 잘 들어요.'
      },
      potions: {
        '1': '벨트가 더 길면 가능하죠. 그건 팔아요. 물약병 채우는 건 공짜고요.',
        say: '물약을 더 들고 다닐 수 있나요?'
      },
      rumor: {
        archers: {
          '1': '크라그의 궁수들은 낮게 쏴요. 계속 움직이면 대부분 빗나가죠.'
        },
        north: {
          '1': '화상, 동상, 그리고 조각상한테 물렸다고 우기는 남자가 한 명 있어요.'
        }
      },
      healBack: {
        '1': '가세요. 다음엔 꿰매러 말고 수다 떨러 오시고요.'
      },
      bye: {
        '1': '몸조심하세요. 그리고 뭐라도 좀 드시고요.'
      }
    },
    blackMarket: {
      hello: {
        '1': '여기선 이름 안 불러. 하지만 누가 성문을 열었는지는 알아. 다들 알지.',
        '2': '장물아비라고 불러. 여기 있는 건 전부 어딘가에서 온 거야.'
      },
      foe: {
        '1': '신디케이트는 지금 널 좋아하지 않아. 그래도 네 돈은 환영이지.'
      },
      again: {
        '1': '또 왔네. 아무도 안 따라왔겠지?'
      },
      trade: {
        '1': '서로 캐묻지 않기야. 신디케이트가 몫을 챙기고, 넌 물건을 챙기고.'
      },
      who: {
        '1': '불이 나기 전엔 양초를 팔았어. 정직한 일이었지. 돈이 안 됐지만.'
      },
      armor: {
        '1': '갑옷장이들은 떠났어, 친구. 이유는 나보다 네가 더 잘 알겠지.',
        say: '파는 갑옷 있어요?'
      },
      rumor: {
        citadel: {
          '1': '작년에 극북에 요새가 하나 나타났어. 지은 사람이 아무도 없는데.'
        },
        crystals: {
          '1': '누군가 공허 수정을 보이는 대로 사들이고 있어. 우리가 아니야. 그게 불안해.'
        }
      },
      shopBack: {
        '1': '당신은 여기 온 적 없어.'
      },
      bye: {
        '1': '발밑 조심해. 잔해가 움직이거든.'
      }
    },
    trainerBlood: {
      hello: {
        '1': '손님이시군요. 항아리는 건드리지 말아 주세요.',
        '2': '상그렐 박사입니다. 오크헤이븐의 새 주인들은 제가 뭘 가르치는지 묻지 않아요. 평온하죠.'
      },
      found: {
        '1': '절 찾아내셨군요. 이런 곳에서 의사를 찾아오는 사람은 많지 않은데요.',
        '2': '상그렐 박사입니다. 마을은 저 같은 사람을 태워 버려서, 사람 없는 곳에서 일해요.'
      },
      friend: {
        '1': '신디케이트가 당신 편을 들더군요. 그쪽 친구에게는 수업료를 낮춥니다. 제 기준은 그대로고요.'
      },
      foe: {
        '1': '신디케이트는 당신 피에 후한 값을 치를 겁니다. 저는 그 피를 여기서 쓰시길 바라고요.'
      },
      again: {
        '1': '안색이 창백하군요. 좋아요. 이 일에 잘 어울립니다.'
      },
      train: {
        '1': '소매를 걷으세요. 아플 겁니다. 그게 요점이거든요.'
      },
      class: {
        '1': '자기 건강을 대가로 힘을 사고, 그걸 적에게서 되찾는 겁니다.',
        '2': '지구력은 쓸 수 있는 밑천이고, 지능은 그걸 얼마나 잘 쓰느냐입니다.',
        say: '피의 연금술사가 뭔가요?'
      },
      ready: {
        strong: {
          '1': '놀라운 체질이군요. 거의 전부 배울 수 있겠어요.'
        },
        able: {
          '1': '다음 수업을 받을 만큼은 튼튼하군요.'
        },
        weak: {
          '1': '첫 번째 절개에 기절하실 겁니다. 먼저 지구력을 키우세요, 부탁입니다.'
        }
      },
      jars: {
        '1': '표본입니다. 대부분은 기꺼이 내어 준 거고요.',
        say: '항아리에 뭐가 들었어요?'
      },
      trainBack: {
        '1': '꼭 기록을 남기세요. 어떻게 됐는지 듣고 싶으니까요.'
      },
      bye: {
        '1': '건강하세요. 진심입니다.'
      }
    },
    syndicateBoss: {
      hello: {
        '1': '성문을 연 사람이 당신이군. 앉아. 의자 정도는 받을 자격이 있어.',
        '2': '다들 나를 마담 애시라고 불러. 오크헤이븐은 이제 우리 거야. 일부는 당신 덕이지.'
      },
      throneOurs: {
        '1': '공포의 요새가 우리 손에 들어왔어. 동전 한 닢도 아깝지 않았지.'
      },
      throneLost: {
        '1': '왕좌를 다른 사람에게 줬더군. 그 얘기는 해야겠지. 오늘은 말고.'
      },
      foe: {
        '1': '우리에게 맞서 움직였더군. 그래도 앉아. 누구를 상대하는지는 알아 두고 싶어.'
      },
      again: {
        '1': '또 왔네. 신디케이트가 뭘 해 주면 될까?'
      },
      cut: {
        '1': '받게 될 거야. 지금은 폐허의 몫이지만. 이번 분기 몫이야.',
        '2': '커질 거야. 폐허도 유일한 시장을 쥐고 있으면 아주 잘 벌려.',
        say: '오크헤이븐의 몫을 주기로 약속하셨잖아요.'
      },
      syndicate: {
        '1': '모두가 원하는 것. 우린 아닌 척하지 않을 뿐이야.',
        '2': '사이좋게 지내면 속삭임과 박사도 수업료를 덜 받을 거야.',
        say: '신디케이트는 실제로 뭘 원하는 건가요?'
      },
      order: {
        '1': '당연하지. 당신이 그들의 마을 하나를 태웠으니까. 물약을 더 챙겨 둬.',
        say: '강철 기사단이 저를 쫓고 있어요.'
      },
      rumor: {
        core: {
          '1': '드워프들이 광산에서 뭔가를 찾았어. 핵이야. 우리한테 가져오면 값은 당신이 불러.'
        },
        sold: {
          '1': '핵은 무사히 도착했어. 자물쇠에 무슨 짓을 하는지 보면 놀랄 거야.'
        },
        north: {
          '1': '가치 있는 건 전부 북쪽으로 옮겨 갔어. 우리도 그렇고.'
        }
      },
      bye: {
        '1': '남처럼 굴지 마. 우린 낯선 사람은 눈여겨보거든.'
      }
    },
    forgemaster: {
      hello: {
        '1': '광산을 지나 올라왔군. 몸에서 먼지 냄새가 나.',
        '2': '도른이야. 아이언홀드의 대장간 주인이고. 산만 한 문제를 안고 있지.'
      },
      destroyed: {
        '1': '빛은 꺼졌고 골렘은 고철이 됐어. 어젯밤 광부들이 노래를 불렀지. 일 년 만에 처음이야.'
      },
      studied: {
        '1': '내 용광로엔 푸른 불꽃이, 내 홀엔 로브 입은 학자들이 있어. 그래도 일은 잘 돼.'
      },
      sold: {
        '1': '팔았군. 골렘은 아직 걸어 다니고 내 광산은 아직 무덤이야. 날 내버려 둬.'
      },
      ending: {
        '1': '왕좌 문제가 정리됐나. 좋아. 이제 다시 땅 파는 일로 돌아갈 수 있겠군.'
      },
      again: {
        '1': '뭐야? 용광로는 기다려 주지 않아.'
      },
      quest: {
        '1': '철을 캐다가 심장을 찾았어. 에테르 핵이야. 뛰는 게 느껴지지.',
        '2': '그럼 골렘은요?',
        '3': '그것들은 핵의 박동에 맞춰 움직여. 세 세력이 핵을 달라고 편지를 보냈어. 하나도 믿을 수 없고.',
        '4': '자네가 먼저 닿겠지, 아이언홀드 광산 맨 밑에서. 그다음은 자네에게 달렸어.',
        say: '광산 아래에서 무슨 일이 있었나요?'
      },
      core: {
        say: '핵에 대해서요...',
        destroy: {
          '1': '내 사람들을 구하려고 경이로운 걸 부쉈지. 기사단은 갑옷장이를 보냈고, 난 맥주를 보냈어.'
        },
        study: {
          '1': '결사 사람들은 별나지만 총은 똑바로 나가. 그 정도면 공평하지.'
        },
        sell: {
          '1': '금을 위해서 했군. 그게 자네를 따뜻하게 해 주길 바라네.'
        }
      },
      town: {
        '1': '광산이 돌아갈 때는 왕국 최고의 강철이 나오지.',
        '2': '돌발은 대지를, 핌은 기계를 가르치오. 둘 다 귀가 아프도록 떠든다오.',
        say: '아이언홀드에 대해 알려 주세요.'
      },
      rumor: {
        tundra: {
          '1': '바위산 동쪽부터는 땅이 하얗게 변해. 동상의 툰드라지. 거인과, 더한 것도 있어.'
        },
        citadel: {
          '1': '내 정찰병이 북쪽에서 작년엔 없던 요새를 봤어. 마음에 안 들어.'
        },
        fortress: {
          '1': '모든 게 공포의 요새에서 끝나. 북쪽으로 가는 길은 전부 거기로 통해.'
        }
      },
      bye: {
        '1': '잘 가게.'
      }
    },
    ironWeapons: {
      hello: {
        '1': '진열품 조심해. 양쪽 날이 다 날카로우니까.',
        '2': '망치손 힐다야. 여기 있는 건 전부 드워프의 손으로 벼렸어.'
      },
      dragon: {
        '1': '용을 잡았다고? 내 칼로 잡았길 바라는데.'
      },
      again: {
        '1': '제대로 된 강철 사러 돌아왔어?'
      },
      trade: {
        '1': '드워프 단조품이야. 이 중에 하나라도 부러지면 왜 그런지 알고 싶어.'
      },
      who: {
        '1': '우리 어머니는 왕들을 위해 벼렸어. 난 문으로 들어오는 누구든 위해 벼리고.'
      },
      rumor: {
        golems: {
          '1': '저 아래 골렘들은 우리 쇠로 만든 거야. 솔직히 속이 쓰려.'
        },
        arm: {
          '1': '좋은 칼은 일의 절반을 해 줘. 나머지는 네 근력이 해야 하고.'
        }
      },
      shopBack: {
        '1': '날이 무뎌져서 돌아오면 잘 썼다는 걸 알겠지.'
      },
      bye: {
        '1': '세게 내리쳐.'
      }
    },
    ironAetherWorks: {
      hello: {
        '1': '조심해, 그건 장전돼 있어. 사실 대부분 그렇지만.',
        '2': '땜장이 포스야. 결사가 핵을 연구하라고 보냈어. 덕분에 많이 배웠지.'
      },
      again: {
        '1': '아, 잘 왔어. 네가 지난번에 온 뒤로 몇 가지 손봤거든.'
      },
      trade: {
        '1': '여기 물건은 전부 핵을 연구하다 나왔어. 나한테만 겨누지 마.'
      },
      core: {
        '1': '그 금속은 조금 생각을 해. 너무 깊이 생각하지 않으려고 해.',
        say: '핵에서 뭘 배웠나요?'
      },
      rumor: {
        heat: {
          '1': '총은 숙련으로 돌아가고, 뜨거워져. 손 데기 전에 열에 대해선 핌한테 물어봐.'
        }
      },
      shopBack: {
        '1': '쓰는 느낌이 어떤지 알려 줘. 기록하고 있거든.'
      },
      bye: {
        '1': '반동 조심해.'
      }
    },
    ironArmor: {
      hello: {
        '1': '가룬. 갑옷은 선반에, 반지는 쟁반에.'
      },
      again: {
        '1': '왔나. 뭐가 필요해?'
      },
      trade: {
        '1': '이 판금이면 거인의 몽둥이도 막아. 봐.'
      },
      quiet: {
        '1': '할 말이 별로 없어.',
        say: '말씀이 별로 없으시네요?'
      },
      rumor: {
        giants: {
          '1': '툰드라엔 거인이 있어. 몽둥이가 통나무만 하지. 나라면 무거운 판금을 고르겠어.'
        },
        demons: {
          '1': '북쪽엔 악마가 있어. 불과 발톱이지. 나라면 무거운 판금을 고르겠어.'
        }
      },
      shopBack: {
        '1': '좋은 선택이야.'
      },
      bye: {
        '1': '조심해.'
      }
    },
    ironOrderArmor: {
      hello: {
        '1': '핵을 부순 사람이 너로군. 기사단은 그걸 기억한다.',
        '2': '이곳 기사단의 보급관이다. 우리 무기고는 너에게 열려 있다.'
      },
      throneOurs: {
        '1': '네 덕에 기사단이 공포의 요새를 쥐었다. 편히 있어라. 그럴 자격이 있다.'
      },
      foe: {
        '1': '기사단은 너를 명단에 올려 두었다. 하지만 내 명령은 너에게도 팔라는 것이다. 따르겠다.'
      },
      again: {
        '1': '뭐가 필요하냐?'
      },
      trade: {
        '1': '필요한 걸 가져가라. 기사단은 자기 사람을 챙긴다.'
      },
      order: {
        '1': '지금은 없다. 흔한 일이 아니지. 즐겨 둬라.',
        say: '기사단은 저에게 뭘 원하죠?'
      },
      rumor: {
        throne: {
          '1': '기사단은 공포의 요새의 왕좌를 원할 것이다. 누가 도왔는지는 기억할 것이고.'
        }
      },
      shopBack: {
        '1': '소중히 다뤄라. 그 안에서 피 흘리기 전까지는 기사단의 물품이다.'
      },
      bye: {
        '1': '임무를 계속하라.'
      }
    },
    trainerGeo: {
      hello: {
        '1': '천천히 하게. 산은 어디 안 가니까.',
        '2': '나를 돌발 영감이라 부르지. 땅의 소리를 듣는다네. 가끔은 대답도 해.'
      },
      core: {
        '1': '자네가 내려갔다 온 뒤로 산 느낌이 달라졌어. 더 고요해졌거나, 더 비었거나.'
      },
      dragon: {
        '1': '어제 용이 봉우리 위를 날아가면서 우릴 내버려 뒀어. 자네 덕이라더군.'
      },
      again: {
        '1': '왔구먼. 돌아올 줄 알았지.'
      },
      train: {
        '1': '발을 단단히 딛게. 느껴지나? 아니라고? 거기서부터 시작하는 걸세.'
      },
      class: {
        '1': '벽을 세우고, 가시를 불러내고, 필요하면 땅을 부수네.',
        '2': '돌을 움직이려면 근력이, 돌이 가고 싶어 하는 곳을 알려면 지능이 필요하지.',
        say: '대지술사는 뭘 하나요?'
      },
      ready: {
        strong: {
          '1': '이제 돌이 자네를 아는군. 나머지는 준비가 되면 배우게.'
        },
        able: {
          '1': '다음 수업을 받을 만큼 든든하게 섰군.'
        },
        weak: {
          '1': '아직이야. 돌이 자네를 위해 움직이질 않아. 근력을 키우게.'
        }
      },
      factions: {
        '1': '어느 쪽도 아니야. 기사단이니 길드니 오고 가지. 산은 남네.',
        say: '어느 세력을 섬기세요?'
      },
      trainBack: {
        '1': '천천히 하게. 땅은 참을성이 많으니까.'
      },
      bye: {
        '1': '조용히 걸어가게.'
      }
    },
    trainerAether: {
      hello: {
        '1': '아, 잠깐, 그거 만지지 마요! 그것도요. 깔개 위에 서요, 깔개는 안전해요.',
        '2': '톱니 기술자 핌이에요. 총이랑 포탑이랑 온도계를 잔뜩 만들어요.'
      },
      core: {
        '1': '핵을 결사에 넘겼군요! 그 뒤로 거의 못 잤어요. 좋은 의미로요.'
      },
      oracle: {
        '1': '결사는 신탁 일로 화가 났어요. 전 그냥 만들기만 해요. 엮이고 싶지 않아요.'
      },
      friend: {
        '1': '결사의 친구니까 수업료가 싸요. 서류는 제가 처리했어요.'
      },
      foe: {
        '1': '결사는 제가 당신을 가르치면 안 된대요. 그래도 가르칠 거예요. 그쪽엔 비밀이에요.'
      },
      again: {
        '1': '아, 다행이다, 손가락이 다 그대로 있네요.'
      },
      train: {
        '1': '좋아요. 안전이 먼저, 그다음이 시끄러운 부분이에요.'
      },
      class: {
        '1': '총, 포탑, 그리고 열 게이지. 쏘고, 짓고, 멈추기 전에 열을 빼요.',
        '2': '대부분은 숙련이에요. 큰 기계엔 지능도 조금 필요하고요.',
        say: '에테르 기술자가 뭐죠?'
      },
      ready: {
        strong: {
          '1': '이제 포탑은 능숙하게 다루네요. 큰 기계도 가져가요.'
        },
        able: {
          '1': '손이 안정적이네요. 다음 걸 배울 준비가 됐어요.'
        },
        weak: {
          '1': '조준이 아직 좀 떨려요. 숙련에 포인트를 넣어 봐요.'
        }
      },
      heat: {
        '1': '몇 초 동안 전부 멈춰요. 일찍, 자주 열을 빼요. 이건 믿어요.',
        say: '과열되면 어떻게 되죠?'
      },
      trainBack: {
        '1': '그리고 열이 당신을 터뜨리기 전에 열을 빼는 거 잊지 마요.'
      },
      bye: {
        '1': '밖에서 조심해요!'
      }
    },
    ironHealer: {
      hello: {
        '1': '문간에서 신발 벗어요. 방금 쓸었거든요.',
        '2': '브린야 수녀원장이에요. 이 산에서 부러진 뼈는 대부분 내가 맞췄죠.'
      },
      ending: {
        '1': '공포의 요새에 갔다가 돌아왔군요. 앉아요. 얼굴 좀 봅시다.'
      },
      again: {
        '1': '아직 살아 있네요. 좋아요. 앉아요.'
      },
      heal: {
        '1': '이거 마셔요, 그런 표정 짓지 말고. 물약병은 가득 찼어요.'
      },
      mana: {
        '1': '자요. 맛은 끔찍해요. 마력이 바닥나면 마셔요, 그 전에 말고.'
      },
      potions: {
        '1': '더 긴 벨트를 팔 수 있어요. 물약병 다섯 개가 달리면서 들 수 있는 한계예요.',
        say: '물약을 더 들고 다닐 수 있나요?'
      },
      rumor: {
        tundra: {
          '1': '툰드라는 손가락 발가락을 가져가요. 계속 움직이고, 눈 속에서 잠들지 말아요.'
        },
        temple: {
          '1': '툰드라 너머에 가라앉은 신전이 있어요. 거기 나가들은 포로를 안 잡아요.'
        },
        rift: {
          '1': '그 균열 속에 뭐가 있든 난 꿰맬 수 없어요. 당신 곁에 못 오게 해요.'
        }
      },
      healBack: {
        '1': '가요. 그리고 뭐라도 먹어요, 너무 말랐어요.'
      },
      bye: {
        '1': '멀쩡히 돌아와.'
      }
    },
    exiledSovereign: {
      hello: {
        '1': '너. 내 성문을 연 게 너로군.',
        '2': '나는 이제 지하실에서 가르친다. 먹고살아야 하니까. 용서로 착각하지 마라.'
      },
      ending: {
        '1': '왕좌는 정해졌고 오크헤이븐은 아직 잿더미로군. 그럴 가치가 있었길 바란다.'
      },
      again: {
        '1': '돌아왔군. 내 수업료는 그대로다.'
      },
      train: {
        '1': '지휘하는 법은 가르쳐 주겠다. 네가 그럴 자격이 있는지는 별개의 문제고.'
      },
      class: {
        '1': '남들이 따르는 자다. 부르면 경비병이 오고, 한마디에 싸운다.',
        '2': '매력으로 움직인다. 너에겐 있지. 그래서 용서하기 어려운 거다.',
        say: '대군주가 뭔가요?'
      },
      ready: {
        strong: {
          '1': '네게는 전부 해낼 위엄이 있다. 더 잘 썼더라면 좋았을 것을.'
        },
        able: {
          '1': '다음 수업을 받을 준비가 됐다. 기쁜 척은 하지 않겠다.'
        },
        weak: {
          '1': '아직은 아무도 너를 따르지 않는다. 매력을 키워라.'
        }
      },
      oakhaven: {
        '1': '삼백 년. 우리 가문이 그 성벽을 쌓았다.',
        '2': '설명은 하지 마라. 무슨 말을 해도 바로잡을 수 없다.',
        say: '오크헤이븐에 대해서...'
      },
      trainBack: {
        '1': '가라. 다른 사람한테 연습해라.'
      },
      bye: {
        '1': '그만 가 주게.'
      }
    },
    trainerChrono: {
      fled: {
        '1': '그분을 죽였군요. 몇 년 전부터 보고 있었는데, 그래도 아파요.',
        '2': '저는 시간의 수호자예요. 당신을 가르칠 거예요. 그분이 그렇게 될 거라고 하셨거든요.'
      },
      hello: {
        '1': '왔군요. 한참 전부터 당신을 기다렸어요. 아니, 기다렸을 거예요.',
        '2': '저는 시간의 수호자예요. 시간을 조금 구부리는 법을 가르쳐요.'
      },
      freed: {
        '1': '그분은 자유예요. 이번엔 저도 다음에 뭐가 일어날지 모르겠어요. 멋져요.'
      },
      friend: {
        '1': '결사가 당신을 좋게 보니까 수업료가 싸요. 지난주에 그렇게 정해졌어요.'
      },
      foe: {
        '1': '결사가 지금 당신에게 화가 나 있어요. 곧 풀릴 거예요. 그때까지는 조용히 해 둬요.'
      },
      again: {
        '1': '어서 와요. 딱 맞는 시간이에요.'
      },
      train: {
        '1': '잘 봐요. 그다음엔 잠깐 전으로 돌아가서 다시 봐요.'
      },
      class: {
        '1': '적을 시간 속에 멈춰 세우고, 아군을 재촉하고, 실수를 되돌려요.',
        '2': '실을 보려면 지능, 그걸 당기려면 숙련이 필요해요.',
        say: '시간술사가 뭔가요?'
      },
      ready: {
        strong: {
          '1': '실을 잘 쥐고 있네요. 나머지도 언제든 가져가요.'
        },
        able: {
          '1': '준비됐어요. 묻기 전부터 알았어요.'
        },
        weak: {
          '1': '실이 자꾸 미끄러지네요. 지능을 더, 숙련도 더요.'
        }
      },
      oracle: {
        say: '신탁에 대해 알려 주세요.',
        freed: {
          '1': '그분은 모든 결말을 봤지만 자기 결말만은 못 봤어요. 이제 그걸 알게 되겠죠.'
        },
        slain: {
          '1': '그분은 맞서지 않았어요. 이미 봤으니까요. 제발 다시 묻지 말아 줘요.'
        },
        waits: {
          '1': '그분은 모든 결말을 봐요. 짊어지기엔 무거운 일이에요. 잘해 드려요.'
        }
      },
      trainBack: {
        '1': '나중에 이해가 될 거예요. 보통 그래요.'
      },
      bye: {
        '1': '다시 만날 때까지요. 아니면 그 전에.'
      }
    },
    quest: {
      goblinKing: {
        ask: {
          '1': '멈춰라. 제발. 항복한다.',
          '2': '내 백성이 약탈하는 건 굶주렸기 때문이다. 그게 진실이다.',
          '3': '대신 거래를 하자. 너희 종족과 우리가.'
        },
        slay: {
          '1': '고블린 왕이 쓰러지고 굴은 비워진다.',
          '2': '선포드는 더 편히 잠들고, 강철 기사단은 당신의 이름을 듣게 된다.',
          say: '거래는 없다. 너희 습격은 여기서 끝이다.'
        },
        pact: {
          '1': '교역. 그래. 내 왕관을 걸고 맹세한다.',
          '2': '고블린 상인들이 선포드의 광장에 자리를 잡고, 그곳 대장장이는 만들 수 없는 물건을 판다.',
          say: '습격을 멈추고 대신 선포드와 교역해라. 맹세해.'
        },
        ransom: {
          '1': '전부? ...좋다. 가져가고 떠나라.',
          '2': '당신은 고블린의 금을 들고 떠난다. 습격은 다시 시작되겠지만, 신디케이트는 만족한다.',
          say: '보물을 내놓으면 왕관은 갖게 해 주마.'
        }
      },
      siege: {
        ask: {
          '1': '됐다. 잘 싸우는군, 그건 인정하지.',
          '2': '신디케이트는 저 마을이 줄 수 있는 것보다 훨씬 후하게 낸다.',
          '3': '오늘 밤 우리에게 성문을 열어라. 오크헤이븐의 삼 분의 일이 네 것이다.'
        },
        defend: {
          '1': '그럼 신디케이트가 모든 길에서 너를 사냥할 것이다. 내가 제안했다는 걸 기억해라.',
          '2': '성문은 버틴다. 오크헤이븐은 그 뒤에서 부유해지고, 갑옷장이들은 당신의 이름을 기억한다.',
          say: '성문은 닫힌 채다. 군대를 데리고 떠나라.'
        },
        betray: {
          '1': '현명하군. 마담 애시가 기뻐하겠어.',
          '2': '오크헤이븐이 불탄다. 폐허 속에 암시장이 열리고, 연금술사 한 명이 몰래 가르치기 시작한다.',
          '3': '갑옷장이들은 떠나고, 강철 기사단은 당신을 배신자라 부른다.',
          say: '마을의 삼분의 일이라. 좋아. 오늘 밤 성문을 열지.'
        }
      },
      core: {
        ask: {
          '1': '거상은 고철이 됐어. 내가 이걸 살아서 볼 줄은 몰랐지.',
          '2': '그리고 핵이 있어. 아직도 웅웅거려. 만져 보면 따뜻해.',
          '3': '자네가 먼저 닿았어. 그래서... 이걸 어떻게 하지?'
        },
        destroy: {
          '1': '빛이 꺼지고 골렘들은 선 자리에서 쓰러진다.',
          '2': '감사의 뜻으로 강철 기사단이 자기 갑옷장이들을 아이언홀드로 보낸다.',
          say: '물러서요. 이걸 부술 거예요.'
        },
        study: {
          '1': '자네는 핵을 깨우지 않고 옮길 만큼은 알고 있어.',
          '2': '한 계절 안에 아이언홀드의 용광로가 아무도 본 적 없는 에테르 장치를 만들어 낸다.',
          say: '결사가 연구해야 해요. 제가 안전하게 옮길 수 있을 것 같아요.'
        },
        sell: {
          '1': '금이라. 내 광부들을 죽인 물건에. 가져가고 가시오.',
          '2': '거금이 오간다. 핵은 계속 빛나고, 광산은 다시는 고요해지지 않는다.',
          say: '신디케이트가 가장 좋은 조건을 제시했어요.'
        }
      },
      oracle: {
        ask: {
          '1': '이 순간을 셀 수 없이 많이 봤어요.',
          '2': '절반에서는 당신이 저를 풀어 줘요. 나머지 절반에서는 제가 지키는 걸 가져가고요.',
          '3': '고르세요. 딱 한 번만이라도 다음에 뭐가 올지 모르고 싶어요.'
        },
        free: {
          '1': '아. 이건 못 봤어요. 정말로 못 봤어요.',
          '2': '신탁은 물을 가르며 떠올라 사라진다. 그녀의 제자는 남아서 가르친다.',
          say: '가만히 있어요. 사슬을 부술게요.'
        },
        slay: {
          '1': '그래요. 이게 나머지 절반이군요.',
          '2': '그녀는 저항하지 않는다. 시간의 수호자의 모래시계가 당신 것이 된다.',
          '3': '그녀의 마지막 제자는 신전에서 도망치고, 결사는 당신을 용서하지 않는다.',
          say: '모래시계를 가지러 왔어요.'
        }
      },
      dragon: {
        ask: {
          '1': '그만하라. 이빨이 있구나, 작은 것이.',
          '2': '요새의 악마가 내 동족을 사슬로 묶었다. 그놈이 불타는 걸 보고 싶다.',
          '3': '나를 죽이거나, 아니면 내가 돕게 해라.'
        },
        slay: {
          '1': '용이 쓰러지자 산이 흔들린다. 용의 보물은 당신 것이다.',
          '2': '강철 기사단은 용 사냥꾼을 노래한다.',
          say: '용과는 흥정하지 않는다.'
        },
        pact: {
          '1': '감히 청하는 이가 드물지. 좋다. 함께 사냥하자.',
          '2': '공포의 요새로 진군할 때 용 한 마리가 당신 위를 날 것이다.',
          say: '그럼 나와 함께 대악마와 싸워라.'
        }
      },
      throne: {
        ask: {
          '1': '그래. 끝이로군. 자네일 줄은 몰랐어.',
          '2': '내 왕좌는 비어 있지 않을 걸세. 앉는 자가 요새와 균열을 지휘하지.',
          '3': '이미 사절 셋이 내 문 앞에서 기다리고 있네. 다음에 누가 들어올지 고르게.'
        },
        order: {
          '1': '기사단이 요새에 주둔하고 봉인할 수 있는 건 봉인한다.',
          '2': '왕국은 안전해지고, 무엇을 해야 할지 지시받게 된다.',
          say: '강철 기사단이 지키게 하겠다.'
        },
        syndicate: {
          '1': '신디케이트는 동트기 전에 들어온다.',
          '2': '이제부터 모든 것에 값이 붙는다. 평화조차도.',
          say: '잿빛 신디케이트가 얻을 자격이 있다.'
        },
        circle: {
          '1': '결사는 요새를 균열 위의 학교로 바꾼다.',
          '2': '그들은 그걸 연구라 부른다. 다른 이들은 숨을 죽인다.',
          say: '에테르 결사가 갖게 하겠다.'
        },
        shatter: {
          '1': '당신은 제 손으로 왕좌를 부순다. 이제 아무도 여기서 통치하지 못한다.',
          '2': '사절들은 말없이 떠난다.',
          say: '아무도 못 가져. 내가 부술 거야.'
        },
        claim: {
          '1': '왕좌는 차갑고, 꼭 맞는다.',
          '2': '세 세력은 자신들에게 공통의 적이 있다는 걸 깨닫는다.',
          say: '내가 직접 차지하겠다.'
        }
      }
    },
    bark: {
      goblinKing: {
        charge: {
          '1': '짓밟아라, 터스커!'
        },
        horn: {
          '1': '내게로 모여라, 고블린들아!'
        },
        dismount: {
          '1': '가라, 터스커! 나머지는 내가 끝낸다!'
        },
        return: {
          '1': '터스커! 한 번 더!'
        }
      },
      dragon: {
        takeoff: {
          '1': '그만. 하늘이 너를 태우리라.'
        },
        flight2: {
          '1': '아직 끝나지 않았다!'
        }
      },
      archDemon: {
        gate: {
          '1': '문이 열렸다. 아무도 못 나간다.'
        },
        dive: {
          '1': '무릎 꿇어라.'
        }
      },
      frostJarl: {
        hammer: {
          '1': '가만히 있어라, 꼬마야.'
        },
        iceBreak: {
          '1': '호수가 널 삼킬 것이다!'
        }
      }
    },
    mayorBrenna: {
      hello: {
        '1': '수레 조심해요! 미안해요, 이 다리 위에선 전부 움직이거든요. 실버브리지에 온 걸 환영해요.',
        '2': '시장 브레나 퀼이에요. 잃어버리고, 망가지고, 늦은 건 전부 제 책상으로 와요.'
      },
      ending: {
        '1': '온 강이 당신 얘기뿐이에요. 장사가 이렇게 잘된 적이 없어요. 그러니까, 고마워요.'
      },
      again: {
        '1': '또 왔어요? 좋아요. 수레 길만 막지 말아 줘요.'
      },
      who: {
        '1': '시장 된 지 9년째예요. 그 전엔 밧줄을 팔았죠. 사실 같은 일이에요. 뭔가를 붙잡아 두는 거.',
        '2': '마을은 봄마다 투표해요. 아직까진 이 책상을 탐내는 사람이 없네요.'
      },
      town: {
        '1': '다리가 먼저였어요. 그다음 다리 위에 시장, 그다음 집, 그다음 그 집 위에 또 집.',
        '2': '분수 조심해요. 애들이 빠지거든요. 장날엔 어른들도요.',
        say: '실버브리지 얘기 좀 해 주세요.'
      },
      masters: {
        '1': '한 명도 빠짐없이요. 방패, 불, 그림자, 돌. 각각의 스승이 전부 한 다리 위에 있어요.',
        '2': '제자들이 사방에서 와요. 여관엔 좋은 일이죠. 우리 집 창문엔 별로고요.',
        say: '정말 모든 직업의 스승이 여기 있어요?'
      },
      river: {
        '1': '강이 실어 오는 건 뭐든요. 생선, 비단, 아이언홀드 강철, 가끔은 화난 닭 한 상자.',
        '2': '그리고 실버브리지의 상인이 전부 간판을 거는 건 아니에요. 눈 크게 뜨고 다녀요.',
        say: '여기선 뭘 사고팔아요?'
      },
      rumor: {
        crags: {
          '1': '북쪽에서 오던 배가 끊겼어요. 잿빛 바위산에서 뭔가 타고 있대요.'
        },
        mines: {
          '1': '이번 달엔 아이언홀드 강철이 안 왔어요. 드워프들 말로는 광산에 문제가 생겼대요.'
        },
        tundra: {
          '1': '모피 상인들이 이제 툰드라를 안 건너요. 거인들이 움직이고 있대요.'
        },
        far: {
          '1': '상인들은 이제 먼 북쪽 얘기를 속삭이기만 해요. 거기 뭐가 있든, 손님은 아니에요.'
        }
      },
      bye: {
        '1': '잘 가요. 누가 물으면, 다리 통행료는 아주 공정하다고 해 줘요.'
      }
    },
    sbHealer: {
      hello: {
        '1': '음? 아, 환자분이군요. 미안해요, 잠깐 눈을 쉬고 있었어요. 치유사들은 그래요.',
        '2': '안셀 수사예요. 들어와서 앉아요. 의자가 보기보다 편하답니다.'
      },
      again: {
        '1': '아, 또 왔군요. 이제 막 앉았는데.'
      },
      heal: {
        '1': '누워서 눈 감아요. 너무 오래는 말고요, 나까지 졸 테니까. 자, 물약병 가득 찼어요.'
      },
      mana: {
        '1': '빛버섯 강장제예요. 머리엔 좋고, 입 냄새엔 나빠요. 천천히 마셔요.'
      },
      potions: {
        '1': '궁지에 몰리기 전에 하나 마셔요. 영웅들은 항상 너무 오래 기다리더라고요.',
        '2': '더 많이 들고 다니고 싶으면 긴 벨트를 팔아요. 물약병 채우는 건 공짜고요.',
        say: '물약 쓰는 요령 있어요?'
      },
      sleep: {
        '1': '밤엔 못 자요. 온갖 직업의 제자들이 연습하거든요. 꼭 뭔가가 터져요.',
        say: '잠은 자긴 해요?'
      },
      healBack: {
        '1': '잘 가요. 다음엔 붕대 말고 차 마시러 와요.'
      },
      bye: {
        '1': '계단 조심해요. 내 환자 절반은 거기서 넘어졌을 뿐이에요.'
      }
    },
    sbArmorer: {
      hello: {
        '1': '하! 그 찌그러진 것 좀 봐. 그 갑옷, 환불은 받았길 바라.',
        '2': '그레타 아이언베인이야. 주인이랑 같이 집에 돌아오는 갑옷을 만들지. 지금까진 매번.'
      },
      again: {
        '1': '또 너구나! 아직 멀쩡하네. 내가 제일 좋아하는 손님이야.'
      },
      trade: {
        '1': '자, 두드려 봐. 세게 쳐도 돼.'
      },
      who: {
        '1': '산골 집안이야. 장사하러 강을 따라 내려왔다가 생선 때문에 눌러앉았지.'
      },
      steel: {
        '1': '두께가 아니야. 어디서 휘느냐지. 좋은 갑옷은 네가 굽히는 데서 휘어.',
        '2': '무거운 판금은 근력이 필요해. 근력 없이 입으면 오리처럼 뒤뚱거릴 거야.',
        say: '좋은 갑옷은 뭐가 달라요?'
      },
      shopBack: {
        '1': '잘 입어. 찌그러지면 가져와. 재밌는 얘기 듣는 거 좋아하거든.'
      },
      bye: {
        '1': '잘 가. 내가 안 덮어 준 데는 맞지 말고.'
      }
    },
    sbWeapons: {
      hello: {
        '1': '아, 안목 있는 손님이군요. 전 늘 알아봐요. 들어오는 걸음걸이에 다 보이거든요.',
        '2': '애시비 명검점의 코르빈 애시비입니다. 네, 그 애시비요. 당연히 들어 보셨겠죠.'
      },
      again: {
        '1': '벌써 오셨어요? 다들 결국 코르빈에게 돌아온답니다.'
      },
      trade: {
        '1': '모든 날을 손으로 갈았어요. 사실 제 손으로요. 비치는 모습에 놀라지 마세요.'
      },
      who: {
        '1': '강 전체에서 최고의 칼 장수죠. 아무한테나 물어보세요. 아니면 제 간판만 읽어도 돼요.'
      },
      blades: {
        '1': '자기한테 맞는 걸 고르세요. 빠른 손엔 가벼운 칼, 힘센 팔엔 무거운 칼.',
        '2': '그리고 멋져 보여야죠. 못생긴 칼을 든 영웅을 보고 도망치는 놈은 없으니까요.',
        say: '좋은 무기는 어떻게 골라요?'
      },
      shopBack: {
        '1': '훌륭한 선택이에요. 제 머리카락만큼은 아니지만, 거의요.'
      },
      bye: {
        '1': '어디서 샀는지 꼭 소문내 주세요.'
      }
    },
    sbJeweler: {
      hello: {
        '1': '저기! 여기, 여기! 반지, 부적, 행운의 돌. 다리에서 제일 좋은 가판대야.',
        '2': '난 탐 말로야. 키는 작지만, 가격은 더 작아.'
      },
      again: {
        '1': '내 최애 손님! 다른 손님들한텐 비밀이야.'
      },
      trade: {
        '1': '전부 진짜야. 대부분. 알았어, 그건 유리야. 근데 아주 좋은 유리라고.'
      },
      who: {
        '1': '이 다리에서 자랐어. 금 간 데, 고양이, 지름길까지 다 알아.'
      },
      gossip: {
        '1': '스프로킷 교수님이 또 눈썹을 날려 먹었대. 이번 달에만 세 번째야.',
        '2': '그리고 시장님은 간판 안 거는 상인들 얘길 알고 있어. 내가 알아보는 중이야.',
        say: '재밌는 소문 들은 거 있어?'
      },
      shopBack: {
        '1': '거래 즐거웠어! 친구들한테 알려 줘. 경비병만 빼고.'
      },
      bye: {
        '1': '또 봐! 난 바로 여기 있을게. 아마도.'
      }
    },
    sbMasterAegis: {
      hello: {
        '1': '하! 또 젊은 친구로군. 턱 들고, 어깨 펴. 방패는 웃으면서 들어야 더 잘 막아.',
        '2': '헬가 스톰실드 경이다. 한때 이 다리를 지켰지. 지금은 버티는 법을 가르쳐.'
      },
      again: {
        '1': '왔구나! 방패 들었어? 좋아. 웃고 있어? 더 좋아.'
      },
      train: {
        '1': '발 넓게. 몸을 앞으로. 내가 밀어도 꿈쩍하지 마. 준비됐지? 흡!'
      },
      class: {
        '1': '맨 앞에 서는 거야. 다른 사람들이 안 서도 되게. 세상에서 제일 좋은 일이지.',
        '2': '방패를 드는 근력. 저녁 먹을 때까지 버티는 지구력.',
        say: '이지스 기사는 진짜 뭘 해요?'
      },
      ready: {
        strong: {
          '1': '이제 제대로 된 벽이구나, 얘야. 아무 수업이나 골라.'
        },
        able: {
          '1': '다리가 튼튼해! 다음 수업 받을 준비가 됐어.'
        },
        weak: {
          '1': '아직이야. 한 번만 세게 밀어도 넘어지겠어. 근력이랑 지구력 좀 더.'
        }
      },
      bridge: {
        '1': '40년 전, 강 해적들을 상대로. 우리 여섯, 문 하나, 아주 긴 밤이었지.',
        '2': '제일 세게 때려서 이긴 게 아니야. 꿈쩍도 안 해서 이겼지. 기억해 둬.',
        say: '이 다리를 지켰다고요?'
      },
      trainBack: {
        '1': '잘했어! 이제 뭐 좀 먹어. 방패는 무겁거든.'
      },
      bye: {
        '1': '밖에서도 고개 들고 다녀!'
      }
    },
    sbMasterPyro: {
      hello: {
        '1': '들어오게. 메모 조심하고, 화로 근처에선 재채기하지 말아 주게.',
        '2': '마도사 이그나티우스 베일일세. 다리 위에서 불을 가르치지. 보다시피 물이 넉넉하니까.'
      },
      again: {
        '1': '시간 딱 맞췄군. 훌륭해. 지난번에 멈춘 데서 시작하지.'
      },
      train: {
        '1': '잘 보게. 작은 불꽃을 가만히 붙잡고 있지. 큰 불은 쉽네. 작은 불이 실력이야.'
      },
      class: {
        '1': '불은 누구나 붙이지. 화염술사는 불이 어디로 갈지, 어디서 멈출지를 정하네.',
        '2': '모든 건 지능에서 나오지. 나중에 불을 다룰 손이 필요할 땐 숙련이 돕고.',
        say: '화염술사는 진짜 뭘 해요?'
      },
      ready: {
        strong: {
          '1': '제어가 훌륭하군. 고칠 게 거의 없네. 마음껏 고르게.'
        },
        able: {
          '1': '괜찮군. 아니, 괜찮은 정도 이상이야. 다음 수업을 받아도 좋네.'
        },
        weak: {
          '1': '아직이네. 불꽃이 흔들려. 더 날카로운 머리가 필요해. 지능을 더 키우게.'
        }
      },
      sprocket: {
        '1': '뛰어난 사람이지. 시끄럽고, 덤벙대고, 뛰어나. 그 사람 문 옆엔 늘 양동이를 둔다네.',
        say: '스프로킷 교수님은 어때요?'
      },
      trainBack: {
        '1': '연습은 물가에서 하게. 꼭이야.'
      },
      bye: {
        '1': '좋은 하루 되게. 소매는 꼭 걷어 두고.'
      }
    },
    sbMasterShadow: {
      hello: {
        '1': '날 찾아? 분수대부터 계속 옆에 있었는데. 두 번이나 그냥 지나쳤어.',
        '2': '닉스 할로웨이. 숨기 제일 좋은 데는 인파 속이고, 여긴 세상에서 제일 붐비는 다리지.'
      },
      again: {
        '1': '또 왔네. 나 여기 꽤 오래 있었어. 알아챘어? 아니? 좋아.'
      },
      train: {
        '1': '첫 번째 수업: 원래 여기 있는 사람처럼 걸어. 그런 사람은 아무도 두 번 안 봐.'
      },
      class: {
        '1': '상대가 보는 곳엔 절대 없는 것. 쓱 들어가서 한 번 빠르게 치고, 다시 섞여 들어.',
        '2': '빠른 발과 손엔 민첩. 한 방이 제대로 먹히려면 숙련.',
        say: '좋은 그림자 칼날의 조건은 뭐예요?'
      },
      ready: {
        strong: {
          '1': '이제 진짜 은밀하네. 남은 거 다 가져가. 그럴 자격 있어.'
        },
        able: {
          '1': '발걸음이 가벼워! 다음 기술 배울 준비 됐어.'
        },
        weak: {
          '1': '아직이야. 분수대에서부터 네 발소리가 들려. 민첩을 더.'
        }
      },
      past: {
        '1': '옛날에 바로 이 다리에서 소매치기를 했어. 실력도 좋았지.',
        '2': '그러다 시장님한테 잡혔는데, 감옥 대신 일자리를 주더라. 내가 고마워한다는 건 비밀이야.',
        say: '이런 건 어떻게 배웠어요?'
      },
      trainBack: {
        '1': '이제 가서 연습해. 나한테 들키지 않게.'
      },
      bye: {
        '1': '또 봐. 뭐, 넌 날 못 보겠지만.'
      }
    },
    sbMasterSovereign: {
      hello: {
        '1': '오! 안녕하세요, 안녕하세요. 실례했어요, 경비병들과 얘기 중이었거든요. 참 잘 들어 주는 친구들이죠.',
        '2': '퍼시벌 애시컴입니다. 성에서도 가르칠 수 있지만, 이끄는 법은 사람들 곁에서만 배울 수 있죠.'
      },
      again: {
        '1': '친애하는 친구여! 계속할까요? 물론 원하신다면요.'
      },
      train: {
        '1': '자, 그럼. 좋은 명령은 분명하고, 친절하고, 딱 한 번만 내리는 거예요. 이렇게요.'
      },
      class: {
        '1': '지도자예요. 경비병들이 곁으로 와서 당신을 위해서만이 아니라, 당신과 함께 싸우죠.',
        '2': '매력이 전부예요. 사람들은 좋아하는 사람을 따르죠. 그리고 자기 이름을 기억해 주는 사람을요.',
        say: '대군주가 뭐예요?'
      },
      ready: {
        strong: {
          '1': '훌륭해요! 이제 사람들이 어디든 따라갈 거예요. 모든 수업을 받으세요.'
        },
        able: {
          '1': '경비병들이 당신 말을 들을 거예요. 다음 수업을 받을 준비가 됐어요.'
        },
        weak: {
          '1': '유감이지만 아직이에요. 매력이 조금만 더 있으면 사람들이 따를 거예요.'
        }
      },
      please: {
        '1': '항상요. 소리치면 복종을 얻고, 부탁하면 충성을 얻죠. 충성이 더 오래가요.',
        say: '경비병한테 정말 \'부탁해\'라고 해요?'
      },
      trainBack: {
        '1': '아주 잘했어요. 끝나고 꼭 고맙다고 해 주세요.'
      },
      bye: {
        '1': '몸조심하시고, 다들 잘 지내라고 전해 주세요.'
      }
    },
    sbMasterGeo: {
      hello: {
        '1': '이끼 조심하렴, 얘가 이번 주에 고생이 많았거든. 자, 어디 얼굴 좀 보자.',
        '2': '토바 딥루트 할머니란다. 여기 강바닥은 저 아래까지 전부 좋은 돌이야.'
      },
      again: {
        '1': '벌써 왔니? 앉으렴, 막 차를 끓였단다. 돌 차야. 거의 차지만.'
      },
      train: {
        '1': '손바닥을 땅에 쫙. 그렇게 말고. 졸린 강아지 쓰다듬듯이.'
      },
      class: {
        '1': '땅한테 도와 달라고 부탁하지. 필요할 땐 벽을, 누가 무례하게 굴면 가시를.',
        '2': '돌은 정원 같은 거야. 파는 데는 근력, 어디에 심을지 아는 데는 지능.',
        say: '대지술사는 뭘 해요?'
      },
      ready: {
        strong: {
          '1': '이제 땅이 널 좋아하는구나. 배우고 싶은 걸 마음껏 배우렴.'
        },
        able: {
          '1': '뿌리가 튼튼하구나! 다음 수업 받을 준비가 됐어.'
        },
        weak: {
          '1': '아직이란다, 얘야. 돌이 꿈쩍도 안 하는구나. 근력부터 더 키우렴.'
        }
      },
      garden: {
        '1': '40년이 걸렸지. 돌 하나하나 손으로 키웠어. 아니, 마법으로. 거의 손으로.',
        '2': '나가는 길에 조약돌 하나 가져가렴. 문 받침으로 아주 좋단다.',
        say: '그거 돌로 만든 정원이에요?'
      },
      trainBack: {
        '1': '잘했다. 이제 가서 뭐든 파 보렴. 살살.'
      },
      bye: {
        '1': '잘 가렴. 따뜻하게 입어, 강가는 축축하단다.'
      }
    },
    sbMasterAether: {
      hello: {
        '1': '어서 와, 어서 와! 마침 시연 시간이야. 귀 막아 주게.',
        '2': '퀸트 스프로킷 교수일세. 강이 공짜로 내 바퀴를 돌려 주지. 여기 말고 어디서 가르치겠나?'
      },
      again: {
        '1': '아, 내가 제일 아끼는 학생! 오늘 시연은 특히 시끄럽다네.'
      },
      train: {
        '1': '칠판을 보게. 이제 칠판은 잊고, 기계를 보게.'
      },
      class: {
        '1': '위기는 만들어서 빠져나가지. 권총, 포탑, 그리고 정직하게 만드는 열기 게이지.',
        '2': '조준엔 숙련, 영리한 장치엔 지능. 둘 다면 이상적이고.',
        say: '에테르 기술자는 실제로 뭘 해요?'
      },
      ready: {
        strong: {
          '1': '놀랍군! 내 강의도 하겠어. 그래도 하진 말게. 나머지를 가져가.'
        },
        able: {
          '1': '손이 안 떨리는군! 다음 기계로 갈 준비가 됐어.'
        },
        weak: {
          '1': '아직이야. 조준이 흔들려. 숙련을 더 키우고 다시 얘기하세.'
        }
      },
      eyebrows: {
        '1': '시연이 살짝 너무 잘됐지. 다시 자랄 거야. 늘 그랬거든.',
        say: '눈썹이 왜 그래요?'
      },
      trainBack: {
        '1': '훌륭해. 이제 가서 열기 좀 빼게. 되도록 밖에서.'
      },
      bye: {
        '1': '수업 끝! 계단 조심하게.'
      }
    },
    sbMasterChrono: {
      hello: {
        '1': '내 옛 제자, 시간의 수호자가 당신이 올 거라고 편지했어요. 바로 이 순간에요.',
        '2': '시계지기 셀윈입니다. 다리 시계를 지키죠. 이렇게 바쁜 마을은 늦을 여유가 없거든요.'
      },
      again: {
        '1': '7분 지났군요. 시작하기 좋은 시간이에요.'
      },
      train: {
        '1': '같이 세요. 하나, 둘, 그리고 멈춰요. 잘 붙잡으면 시간은 늘어나요.'
      },
      class: {
        '1': '시간을 정리하죠. 적은 느리게, 동료는 빠르게, 가끔 실수는 없던 일로.',
        '2': '이해하려면 지능. 아무것도 망가뜨리지 않고 만지려면 숙련.',
        say: '시간술사가 뭐예요?'
      },
      ready: {
        strong: {
          '1': '타이밍이 훌륭해요. 남은 수업은 편할 때 언제든 받으세요.'
        },
        able: {
          '1': '준비됐어요. 다음 수업은… 아, 지금 시작이에요.'
        },
        weak: {
          '1': '아직이에요. 늘 한 박자 늦어요. 지능을 더, 그리고 숙련도 더.'
        }
      },
      keeper: {
        '1': '오래전에 제가 가르쳤어요. 뛰어난 제자였죠. 늘 일찍 오거나 늦게 오고, 제시간엔 안 왔어요.',
        say: '시간의 수호자는 어떻게 알아요?'
      },
      trainBack: {
        '1': '매일 연습하세요. 되도록 매일 같은 시간에요.'
      },
      bye: {
        '1': '잘 가요. 늦지 말고요.'
      }
    },
    sbMasterBlood: {
      hello: {
        '1': '상그렐 박사가 당신 얘기를 편지로 썼어요. 기절하지 않았다더군요. 그 사람치곤 최고의 칭찬이죠.',
        '2': '베스퍼 크림슨리프예요. 세상 모든 약초가 이 다리 밑을 흘러가요. 여긴 호사스러운 곳이죠.'
      },
      again: {
        '1': '다시 왔군요. 오늘은 생기가 넘쳐 보여요. 전 늘 알아보거든요.'
      },
      train: {
        '1': '숨을 들이쉬어요. 힘이 느껴지죠? 이제 그걸 조금만 써 봐요. 현명하게.'
      },
      class: {
        '1': '자기 생명력을 써서 힘을 얻고, 그걸 적에게서 되찾아 오죠.',
        '2': '지구력은 지갑이에요. 그걸 얼마나 잘 쓰는지는 지능이 정하죠.',
        say: '피의 연금술사는 진짜 뭐예요?'
      },
      ready: {
        strong: {
          '1': '대단한 활력이에요! 제가 아는 거의 모든 걸 배울 준비가 됐어요.'
        },
        able: {
          '1': '정수가 힘차게 흐르네요. 다음 수업으로 가요.'
        },
        weak: {
          '1': '아직이에요. 주문 한 번에 지칠 거예요. 지구력부터 키우세요.'
        }
      },
      herbs: {
        '1': '대부분 강장제예요. 정수 조금, 박하 잔뜩. 박하는 뭐든 더 좋게 만들거든요.',
        '2': '밖에서 희귀한 식물을 찾으면 꼭 가져와 줘요. 정말 보고 싶거든요.',
        say: '이 약초들은 다 뭐에 써요?'
      },
      trainBack: {
        '1': '연습 후엔 쉬어요. 정수는 돌아오지만, 낮잠을 좋아하거든요.'
      },
      bye: {
        '1': '몸 잘 챙겨요. 물 마시고. 초록색 음식도 먹고요.'
      }
    },
    smalltalkSilverbridge: {
      barges: {
        '1': '오늘 아침에 바닷가에서 바지선이 세 척 들어왔어.',
        '2': '또 소금에 절인 생선이야?',
        '3': '웬일로 비단이야. 근데 나중에 손가락 냄새 맡아 봐.'
      },
      lesson: {
        '1': '수업 어땠어?',
        '2': '소매에 불이 붙었어. 스승님은 그게 발전이래.'
      },
      masters: {
        '1': '온 나라의 스승이 한 거리에서 가르친대.',
        '2': '그리고 다들 자기 직업이 최고라고 하지.',
        '3': '근데 다 맞는 말이라서, 그게 짜증 나.'
      },
      bridge: {
        '1': '이 다리가 마을보다 오래됐대.',
        '2': '삐걱대는 걸 보면 확실히 그래.'
      },
      fish: {
        '1': '뭐 좀 잡았어?',
        '2': '장화 한 짝.',
        '3': '그럼 한 켤레의 반은 건졌네.'
      },
      newMaster: {
        '1': '북쪽 거리에 새 스승이 왔어. 시간 얘기를 엄청 해.',
        '2': '분명 수업마다 지각할걸.'
      },
      siege: {
        '1': '오크헤이븐 소식이 안 좋아. 성벽에 도적 떼래.',
        '2': '그럼 바지선들은 여기로 오겠네. 딱하기도 하지.'
      }
    },
    sbAlchemist: {
      hello: {
        '1': '앗! 병 조심해요. 그거 물어요. 음, 살짝 깨무는 정도지만.',
        '2': '연금술사 고사리피리 오딜이에요. 약초를 가져오면 작은 용기를 병에 담아 줄게요.'
      },
      again: {
        '1': '또 왔네요! 초록색 뭐라도 가져왔어요?'
      },
      brew: {
        '1': '주머니 좀 봐요. 우와, 좋네요. 원하는 걸 골라요. 주전자 올려 둘게요.'
      },
      who: {
        '1': '데이지 한 송이로 엄마 정원에 불을 냈어요. 아무도 이유를 몰라서, 제가 배울 수밖에 없었죠.'
      },
      herbs: {
        '1': '바깥, 싸우는 곳 어디에나 있어요. 식물 위로 지나가기만 하면 바로 챙겨져요.',
        '2': '귀한 건 더 멀리서 자라요. 달방울꽃이랑 그림자가시는 숲 너머에 숨어 있죠.',
        say: '약초는 어디서 찾아요?'
      },
      elixirs: {
        '1': '전부 전투에서 꼬박 1분 동안 더 강하게 해 줘요. 더 센 공격, 더 단단한 피부, 더 빠른 발.',
        '2': '세 번째 물약병에 들어가요. 작은 화살표를 누르면 마실 걸 바꿀 수 있어요.',
        say: '엘릭서는 무슨 효과가 있어요?'
      },
      brewBack: {
        '1': '조심해요, 아직 따뜻하거든요. 주머니가 꽉 차면 또 와요!'
      },
      bye: {
        '1': '잘 가요! 보라색 꽃을 보면 두 송이 따요. 하나는 제 거예요.'
      }
    },
    sbGambler: {
      hello: {
        '1': '자자, 어서 와! 카드 열두 장, 모래시계 하나, 그리고 두 배가 될지도 모르는 돈주머니!',
        '2': '마담 펠이야. 난 한번 본 얼굴은 절대 안 잊어. 너도 카드를 안 잊을 수 있는지 볼까?'
      },
      again: {
        '1': '한 판 더 하러 왔니? 모래가 널 기다리고 있었단다.'
      },
      play: {
        '1': '동전은 천 위에, 눈은 카드에. 준비됐니? 모래시계를 뒤집어라!'
      },
      rules: {
        '1': '카드 두 장을 뒤집어. 짝이 맞으면 그대로 남아. 모래가 다 떨어지기 전에 모든 짝을 찾으면 두 배로 줄게.',
        '2': '또 이기면 모래시계가 더 빨라져. 다섯 번 연속으로 이기면 전설 상품을 줄게.',
        say: '어떻게 하는 거예요?'
      },
      who: {
        '1': '아홉 살에 떠돌이 서커스단을 따라 집을 나왔지. 알고 보니 그 서커스단, 셈이 아주 빨랐어.'
      },
      prize: {
        '1': '드워프 한 명이 받았지. 그 뒤로 그가 눈 깜빡이는 걸 본 사람이 없어.',
        say: '상품을 받은 사람이 있어요?'
      },
      playBack: {
        '1': '이기든 지든, 좋은 승부였어. 눈 좀 쉬고 다시 오렴.'
      },
      bye: {
        '1': '잘 가! 발을 어디에 뒀는지 잊지 말고.'
      }
    },
    sunfordGambler: {
      hello: {
        '1': '쉿. 그 가방에 잡동사니 좀 있어? 낡은 장화, 휘어진 칼 같은 거? 그걸 걸고 한판 하자.',
        '2': '재주꾼 도브야. 주로 재미로 하지. 그리고 장화 때문에.'
      },
      again: {
        '1': '또 왔구나! 그 멋진 잡동사니 더 있어?'
      },
      play: {
        '1': '참가비는 탁자 위에. 물건을 내려놔, 더 비싼 쪽이 1점이야.'
      },
      rules: {
        '1': '서로 아이템을 하나씩 내. 더 비싼 쪽이 1점. 2점이면 이기는 거야.',
        '2': '네가 낸 건 이기든 지든 내 거야. 대신 세 판 연속으로 이기면 특별한 걸 줄게.',
        say: '규칙이 뭐예요?'
      },
      who: {
        '1': '원래는 행상이었어. 그런데 다들 물건을 파는 것보다 거는 걸 더 좋아하더라고.'
      },
      luck: {
        '1': '맨날 지지! 그래도 집에 갈 땐 늘 새 장화 한 켤레가 생겨.',
        say: '아저씨도 져요?'
      },
      playBack: {
        '1': '좋은 승부였어! 네 물건들, 내 선반에 올려 두면 참 예쁘겠다.'
      },
      bye: {
        '1': '잡동사니 더 가져와! 잡동사니가 제일 좋아.'
      }
    },
    oakGambler: {
      hello: {
        '1': '처음 뵙는 분이군요. 앉으세요, 물지 않습니다. 제 가격은 좀 물지만요.',
        '2': '다들 저를 비단결 렌이라 부르죠. 멋진 물건을 모읍니다, 한 판에 하나씩.'
      },
      again: {
        '1': '아, 제가 제일 좋아하는 상대로군요. 시작할까요?'
      },
      play: {
        '1': '참가비를 주세요. 그리고 제 시간이 아깝지 않을 물건을 내놓으시죠.'
      },
      rules: {
        '1': '서로 하나씩, 최대 세 번까지. 더 귀한 물건이 1점을 가져갑니다. 2점이면 승리죠.',
        '2': '내신 물건은 어느 쪽이든 제가 갖습니다. 세 판 연속으로 이기시면 진짜 보물을 가지고 가실 겁니다.',
        say: '어떻게 해요?'
      },
      who: {
        '1': '희귀한 물건을 다루는 상인입니다. 찾아내고, 간직하고, 가끔은 하나를 잃기도 하죠.'
      },
      collection: {
        '1': '반짝이는 순서로 정리하죠. 가장 반짝이는 건 맨 위 선반, 찻잔 옆에 둡니다.',
        say: '그걸 다 어디에 써요?'
      },
      playBack: {
        '1': '즐거웠습니다. 가방이 더 무거워지면 또 오세요.'
      },
      bye: {
        '1': '밖에선 지갑 조심하세요. 모두가 정정당당하게 하진 않으니까요.'
      }
    },
    sbCollector: {
      hello: {
        '1': '문 좀 닫게, 바람이 들어와. 나방들이 내 태피스트리를 노리거든.',
        '2': '앨더 베인일세. 수집가라고들 부르지. 귀한 물건을 사서, 마음에 드는 이에게만 판다네.'
      },
      open: {
        '1': '친구! 어서 들어오게, 들어와. 자네 주려고 특별한 걸 먼지 털어 놨지.'
      },
      again: {
        '1': '또 왔군. 아직 내 부탁은 안 들어줬나 보군.'
      },
      trade: {
        '1': '진열장은 열려 있네. 최고의 물건뿐이고, 값은 하나하나 다 기억하지.'
      },
      favor: {
        '1': '낯선 이에겐 안 팔지. 하지만 부탁 하나 들어주면 우린 친구일세.',
        '2': '속삭이는 숲의 트렌트들이 내가 필요한 달방울꽃을 지키고 있네. 트렌트 여섯을 쓰러뜨리고 달방울꽃 세 송이를 가져다주게.',
        say: '뭐 파는 거 있어요?'
      },
      waiting: {
        '1': '트렌트 여섯, 달방울꽃 셋. 아쉽게도 꽃이 저절로 꺾여 오진 않지.',
        say: '그 부탁 말인데요...'
      },
      favorDone: {
        '1': '오, 아직 숲 냄새가 나는군! 훌륭해.',
        '2': '약속은 약속이지. 내 진열장은 언제든 마음껏 둘러보게.',
        say: '달방울꽃 가져왔어요.'
      },
      who: {
        '1': '여섯 살 때부터 모았지. 처음엔 단추였고, 지금은 웅웅 우는 검이라네.'
      },
      shopBack: {
        '1': '그건 살살 다루게. 우리 둘보다 나이가 많으니.'
      },
      bye: {
        '1': '나갈 때 문 닫게. 살살, 꽃병들이 덜컹거리거든.'
      }
    },
    sbFence: {
      hello: {
        '1': '뭘 그렇게 봐. 뭘 사든지, 빛 가리지 말고 비키든지.',
        '2': '미렐라 손. 사람들이 잃어버린 걸 찾아. 그리고 새 주인도 찾아 주지.'
      },
      open: {
        '1': '아, 내가 제일 좋아하는 영웅. 좋은 물건은 천 밑에 숨겨 뒀어.'
      },
      again: {
        '1': '또 왔어? 내가 부탁한 거 기억하지? 장사 얘긴 그다음이야.'
      },
      trade: {
        '1': '온갖 데서 온 갑옷이야. 어디서 났는지는 묻지 마. 이제 다 깨끗해, 약속해.'
      },
      favor: {
        '1': '좋은 갑옷. 친구용이지. 그리고 친구끼린 서로 부탁을 들어주는 법이야.',
        '2': '오크헤이븐 외곽의 도적들이 자꾸 내 배달품을 털어. 열다섯 명 쓰러뜨리고, 장신구 파는 꼬마한테 누가 보냈는지 물어봐.',
        say: '천 밑에 뭐가 있어요?'
      },
      waiting: {
        '1': '도적 열다섯, 그다음 장신구 꼬마랑 얘기 한마디. 자, 가 봐.',
        say: '그 도적들 말인데요...'
      },
      favorDone: {
        '1': '결국 그 수다쟁이였구나. 하! 신세 졌네.',
        '2': '천은 언제든 들춰 봐. 친구한테는 제일 먼저 고르게 해 주거든.',
        say: '도적들은 해치웠고, 누가 보냈는지도 알아냈어요.'
      },
      who: {
        '1': '이 강가 계단에서 자랐어. 떠내려오는 건 결국 다 내 손에 들어와.'
      },
      shopBack: {
        '1': '잘 입어. 누가 물으면 아이언홀드에서 샀다고 해.'
      },
      bye: {
        '1': '지갑 조심해. 여기 사람들이 다 나만큼 정직하진 않거든.'
      }
    }
  },
  enemy: {
    trainingDummy: '훈련용 허수아비',
    goblin: '고블린',
    goblinSlinger: '고블린 투석꾼',
    bandit: '도적',
    banditArcher: '도적 궁수',
    wolf: '늑대',
    banditChief: '도적 두목',
    goblinKing: '고블린 왕',
    treant: '트렌트',
    spider: '거대 거미',
    broodSpider: '새끼 거미',
    outlawCaptain: '무법자 대장',
    elderTreant: '고대 트렌트',
    warlord: '군벌 크라그',
    fireElemental: '불의 정령',
    ironGolem: '무쇠 골렘',
    cultist: '광신도',
    emberLord: '잉걸불 군주',
    ironColossus: '무쇠 거상',
    frostGiant: '서리 거인',
    naga: '나가',
    skeleton: '해골 병사',
    necromancer: '강령술사',
    frostJarl: '서리 족장',
    nagaOracle: '물에 잠긴 신탁',
    voidStalker: '공허 추적자',
    wyvern: '와이번',
    highDemon: '상급 악마',
    voidWarden: '공허의 감시자',
    voidDragon: '공허의 용',
    doomKnight: '파멸의 기사',
    imp: '임프',
    archDemon: '대악마',
    voidling: '공허 새끼',
    voidLord: '공허의 군주',
    orderGuard: '기사단 심문관',
    syndicateBlade: '신디케이트 칼잡이',
    goblinWarchief: '고블린 전쟁 족장',
    thornfather: '가시의 아버지',
    broodMother: '무리의 어미',
    banditBaron: '산적 남작',
    cinderGolem: '잉걸불 골렘',
    frostHowler: '서리 울부짖개',
    tideSerpent: '조수의 뱀',
    riftKnight: '균열의 기사',
    wyvernMatriarch: '와이번 여왕',
    tusker: '전투 멧돼지 터스커',
    tuskerCameo: '터스커',
    goblinTyrant: '고블린 폭군',
    voidDrake: '공허 드레이크',
    pitLord: '심연의 군주',
    frostThane: '서리 영주'
  },
  results: {
    victory: '승리!',
    defeat: '패배',
    retreat: '후퇴',
    firstClear: '첫 클리어!',
    waves: '버틴 웨이브: {n}',
    levelUp: '레벨 {n}!',
    points: '능력치 포인트 +{n}',
    xp: '경험치',
    gold: '골드',
    lost: '잃음',
    kills: '처치',
    chests: '상자',
    bosses: '보스',
    mastery: '지역 정복도',
    masteryPct: '{n}%',
    newBest: '최고 기록!',
    time: '시간',
    unlocked: '지도에 새로 열림: {places}',
    equipped: '장착 중',
    better: '지금 장비보다 좋아요',
    retry: '다시 도전',
    tip: '경험치와 전리품은 그대로 남는다. 포인트를 쓰고, 스승을 찾아가고, 더 강해져서 돌아오자.'
  },
  pause: {
    title: '일시정지',
    resume: '계속하기',
    controls: '조작법',
    retreat: '지도로 후퇴',
    retreatNote: '지금까지 얻은 것은 모두 남지만, 지역은 클리어되지 않는다.'
  },
  ending: {
    level: '레벨',
    more: '요새 아래에 공허의 균열이 열렸다. 콜로세움은 여전히 모든 도전자를 받는다.',
    order: {
      title: '강철의 평화',
      text: '공포의 요새 위로 강철 기사단의 깃발이 휘날린다. 길은 안전하고, 법은 많고, 성문 위에는 당신의 이름이 새겨져 있다.'
    },
    syndicate: {
      title: '잿빛 거래',
      text: '신디케이트는 요새의 그늘에서 다스린다. 이제 왕국에 금지된 것은 없다. 다만 비쌀 뿐이다.'
    },
    circle: {
      title: '에테르의 시대',
      text: '결사는 사로잡은 공허의 불로 요새를 밝힌다. 성문에서 경이로운 것들이 쏟아져 나오고, 그 대가를 묻는 이는 없다.'
    },
    free: {
      title: '왕은 없다',
      text: '왕좌는 산산조각 났고 요새는 비어 있다. 한 시대 만에 처음으로, 왕국은 그곳에 사는 사람들의 것이 되었다.'
    },
    unbound: {
      title: '속박 없는 자',
      text: '당신은 왕좌를 차지했다. 기사단과 신디케이트, 결사가 함께 당신에게 진군한다. 올 테면 오라지.'
    },
    note: {
      goblinPact: '고블린 장사꾼들은 지금도 선포드 광장에서 흥정을 벌인다.',
      goblinSlain: '고블린 굴은 비었고, 상단은 제때 다닌다.',
      goblinRansom: '고블린 왕은 다시 부자가 되었고, 다시 습격을 한다.',
      oakhavenSaved: '오크헤이븐의 성벽은 더 높아졌고 시장은 더 붐빈다.',
      oakhavenFallen: '오크헤이븐의 거리에는 잡초가 자란다. 암시장은 번창한다.',
      coreOrder: '아이언홀드의 광산은 조용해졌고, 드워프들은 다시 땅을 판다.',
      coreCircle: '아이언홀드의 대장간은 푸르게 빛나고, 그곳의 총은 왕국 최고다.',
      coreSold: '어딘가에서 핵은 여전히 웅웅거린다. 골렘들은 여전히 걷는다.',
      oracleFreed: '잔잔한 날이면 어부들이 먼 바다에서 신탁을 본다.',
      oracleSlain: '가라앉은 신전은 고요하다. 이제 누구도 다음에 올 일을 모른다.',
      dragonPact: '요새 지붕에 용이 둥지를 틀었다. 용은 단 하나의 이름에만 답한다.',
      dragonSlain: '기사단의 대전당에 용의 두개골이 걸려 있다.'
    }
  },
  options: {
    gameplay: '게임플레이',
    title: '설정',
    general: '일반',
    audio: '오디오',
    language: '언어',
    difficulty: '난이도',
    soundEffects: '효과음',
    music: '음악',
    mute: '음소거',
    musicTrack: '음악 트랙',
    musicTracks: {
      cozy: '잔잔함',
      trance: '모험'
    },
    haptics: '진동',
    on: '켜기',
    off: '끄기',
    close: '닫기',
    keyboard: {
      auto: '키보드 배열 자동 감지',
      layout: '키보드 배열',
      detected: '감지됨: {layout}',
      bindings: '키 설정',
      press: '키를 누르세요… (Esc로 취소)',
      reset: '키 초기화'
    },
    actions: {
      up: '위로 이동',
      down: '아래로 이동',
      left: '왼쪽 이동',
      right: '오른쪽 이동',
      skill1: '스킬 1',
      skill2: '스킬 2',
      skill3: '스킬 3',
      skill4: '스킬 4',
      skill5: '스킬 5',
      skill6: '스킬 6',
      potion: '물약 마시기',
      manaPotion: '마나 물약 마시기',
      leave: '승리한 지역 떠나기',
      interact: '대화',
      target: '다음 대상',
      map: '월드맵',
      character: '영웅',
      inventory: '가방',
      skills: '스킬',
      roll: '구르기',
      elixir: '엘릭서 마시기',
      elixirNext: '다음 엘릭서',
      skill7: '스킬 7',
      skill8: '스킬 8'
    },
    difficulties: {
      easy: '쉬움',
      medium: '보통',
      hard: '어려움'
    },
    difficultyHints: {
      easy: '적의 공격이 약하고 더 빨리 쓰러집니다.',
      medium: '의도된 난이도입니다.',
      hard: '적이 더 단단하고 더 세게 공격합니다.'
    }
  },
  adsBlocked: {
    title: '광고를 표시할 수 없습니다',
    body: '영상을 재생하려 했지만, 브라우저의 무언가가 광고를 차단하고 있습니다.',
    allowPrefix: '다음 사이트에서 광고를 허용해 주세요:',
    allowSuffix: '(또는 이 게임에 한해 광고 차단기를 일시 중지) 후 다시 시도하세요.',
    gotIt: '알겠습니다'
  },
  forcedDark: {
    title: '이 게임에서는 다크 모드를 꺼 주세요',
    body: '브라우저나 확장 프로그램이 이 페이지의 색을 바꾸고 있어요. 게임에는 자체 색상이 있어서 다크 모드 강제 변환과는 맞지 않아요.',
    waiting: '끄면 게임이 자동으로 이어져요.',
    continueAnyway: '위험을 감수하고 계속하기',
    hint: {
      darkReader: 'Dark Reader: 아이콘을 클릭해서 이 사이트에서는 꺼 주세요.',
      extension: '다크 모드 확장 프로그램을 열고 이 사이트에서는 꺼 주세요.',
      chromiumFlag: '{flagUrl} 주소를 열어 “Auto Dark Mode for Web Contents”를 Default로 바꾸거나, 브라우저 테마 설정에서 “dark theme for sites”를 꺼 주세요.',
      samsung: 'Samsung Internet: 메뉴를 열어 다크 모드를 끄거나, Labs에서 “Use website dark theme”를 켜 주세요.',
      forcedColors: 'Windows: 설정 → 접근성 → 대비 테마에서 대비 테마를 꺼 주세요.',
      firefoxColors: 'Firefox: 설정 → 색 → “페이지에서 지정한 색 무시”를 “안 함”으로 바꿔 주세요.'
    }
  },
  saveStatus: {
    restoredTitle: '클라우드 저장이 복원되었습니다',
    restoredBody: '복구 보너스 +{n} 골드',
    tap: '탭',
    pausedTitle: '클라우드 동기화 일시 중지',
    pausedBody: '오프라인으로 플레이 중입니다. 진행 상황은 여기에 저장됩니다.',
    retry: '다시 시도',
    dismiss: '닫기'
  },
  loading: {
    tooLong: '로딩이 너무 오래 걸리나요? 광고 차단기를 끄고 새로고침하세요.'
  },
  license: {
    denied: '접근이 거부되었습니다: 라이선스를 구매해 주세요.'
  },
  leaderboard: {
    title: '리더보드',
    rank: '#',
    player: '플레이어',
    score: '경험치',
    flair: '레벨',
    empty: '아직 순위표에 아무도 없어요. 첫 번째가 되어 보세요!',
    failed: '리더보드에 연결할 수 없습니다.',
    loading: '불러오는 중…',
    you: '나',
    yourRank: '{total}명 중 {n}위',
    of: '/ {n}명 중',
    tabGlobal: '전 세계'
  },
  wind: {
    title: '두 번째 숨',
    text: '쓰러졌어요. 체력 {n}%로 다시 일어나 전투를 끝낼까요?',
    once: '방문당 한 번만.',
    watch: '영상 보기',
    take: '다시 일어나기',
    decline: '괜찮아요'
  },
  purse: {
    offer: '지갑 3배: +{n}'
  },
  shelf: {
    title: '희귀 상품',
    restock: '새 상품',
    tomorrow: '내일 새 상품'
  },
  rested: {
    hud: '2× 경험치',
    banner: '돌아왔구나! 푹 쉬었으니 다음 전투에서 {time} 동안 경험치가 2배야.',
    hm: '{h}시간 {m}분',
    m: '{m}분',
    h: '{h}시간'
  },
  preset: {
    title: '빌드',
    name: '빌드 {n}',
    rename: '빌드 {n} 이름',
    save: '저장',
    load: '사용',
    saved: '{name} 저장 완료.',
    loaded: '{name} 적용 중.',
    skipped: '제외됨: {list}'
  },
  respec: {
    title: '수련 잊기',
    note: '쓴 능력치 포인트 {n}개를 모두 돌려받고 다시 쓸 수 있어요.',
    none: '아직 돌려받을 포인트가 없어요.',
    free: '잊기 (무료)',
    buy: '잊기 ({n} 골드)',
    confirm: '정말? 한 번 더 탭',
    bench: '이 스킬들은 선반으로 돌아가요: {list}',
    done: '자, 됐다. 포인트는 다시 네 것이니 마음껏 쓰렴.'
  },
  contract: {
    title: '의뢰 게시판',
    lead: '각 세력이 하루에 의뢰를 하나씩 올립니다. 플레이하는 동안 쌓이며, 아무 마을에서나 제출하세요.',
    slay: '처치: {enemy} — {place}',
    clear: '{place} 방문에서 승리',
    chests: '어디서든 상자 열기',
    rep: '평판 +1',
    handIn: '제출',
    handed: '오늘은 끝',
    thanks: '{name}: 고마워요!'
  },
  rep: {
    title: '평판',
    meter: '{name} 평판 {n}',
    giftAt: '평판 +{n}에 선물',
    giftClaim: '선물 받기',
    giftTaken: '선물 받음',
    giftGot: '선물: 300 골드와 {item}.',
    giftGold: '선물: 300 골드.',
    blessAt: '평판 +{n}에 축복',
    bless: {
      order: '축복: 체력 +5%',
      syndicate: '축복: 처치 시 골드 +10%',
      circle: '축복: 마나 회복 +10%'
    }
  },
  ladder: {
    tab: '콜로세움',
    wave: '웨이브',
    week: '이번 주: {mod}',
    weekBest: '이번 주 최고 기록: 웨이브 {n}',
    yourBest: '나의 이번 주 최고 기록: 웨이브 {n}',
    none: '이번 주에는 아직 도전 기록이 없어요.',
    mod: {
      fire: '전부 불꽃',
      nopotions: '포션 금지',
      glass: '유리',
      swarm: '떼거리',
      elites: '엘리트 행진',
      haste: '질주'
    },
    modDesc: {
      fire: '적의 모든 공격이 불꽃',
      nopotions: '포션 없음',
      glass: '모두가 50% 더 세게 때림',
      swarm: '적은 더 많이, 체력은 더 적게',
      elites: '웨이브마다 챔피언 등장',
      haste: '적이 더 빠르게 움직이고 공격함'
    }
  },
  forge: {
    upgrade: '강화 ({n} 골드)',
    max: '최대 강화: +{n}.',
    town: '어느 마을 대장장이든 강화해 줄 수 있어요.'
  },
  plant: {
    sunpetal: {
      name: '햇살꽃잎',
      desc: '밝은 노란 꽃이에요. 치유사들이 무척 아껴요.'
    },
    glowcap: {
      name: '빛버섯',
      desc: '어둠 속에서 빛나는 버섯이에요. 머리에 좋아요.'
    },
    swiftfern: {
      name: '날쌘고사리',
      desc: '가벼운 고사리예요. 신발에 문지르고 달려 보세요.'
    },
    ironmoss: {
      name: '무쇠이끼',
      desc: '돌에서 자라는 질긴 이끼예요. 피부를 단단하게 해요.'
    },
    emberbloom: {
      name: '불씨꽃',
      desc: '손에 쥐면 따뜻한 꽃이에요.'
    },
    frostmint: {
      name: '서리박하',
      desc: '차갑고 상쾌한 잎이에요. 머리가 맑아져요.'
    },
    moonbell: {
      name: '달방울꽃',
      desc: '눈을 밝게 해 주는 희귀하고 창백한 꽃이에요.'
    },
    shadowthorn: {
      name: '그림자가시',
      desc: '희귀한 검은 가시예요. 강하고, 조금 사악해요.'
    }
  },
  journal: {
    errands: '부탁',
    empty: '일지가 아직 비어 있어요. 마을 사람들이 도움을 청할 거예요.',
    from: '의뢰인: {npc}',
    ready: '완료! {npc}에게 돌아가요.',
    taken: '새 부탁: {title}',
    done: '부탁 완료: {title}',
    step: {
      slay: '{enemy} ×{n} 처치',
      slayAt: '{place}에서 {enemy} ×{n} 처치',
      slayAnyAt: '{place}에서 적 {n}명 처치',
      clear: '{place} 소탕',
      visit: '이동: {place}',
      gather: '{plant} ×{n} 채집',
      bring: '가져가기: {item}',
      pieces: '보물 지도 조각 {n}개 찾기',
      dig: '{place}에서 보물 파내기',
      talk: '대화하기: {npc}'
    }
  },
  board: {
    title: '{town} 게시판',
    read: '읽기',
    lead: '오늘의 할 일이에요. 다 하면 여기에 제출해요.',
    kind: {
      slay: '사냥',
      gather: '약초',
      escort: '상단'
    },
    slay: '{place}에서 {enemy} ×{n} 처치',
    gather: '{plant} ×{n} 가져오기',
    escort: '오크헤이븐 가는 길에서 상단 지키기',
    xp: '+{n} 경험치',
    setOut: '출발',
    thanks: '완료! 마을이 고마워해요.'
  },
  escort: {
    start: '길 끝까지 상단을 지켜요!',
    waiting: '상단이 기다리고 있어요.',
    arrived: '상단이 무사히 도착했어요!',
    lost: '상단을 잃었어요…'
  },
  elixir: {
    might: {
      name: '힘의 엘릭서',
      desc: '1분 동안 피해량 +{n}%'
    },
    iron: {
      name: '무쇠 피부 물약',
      desc: '1분 동안 방어도 +{n}%'
    },
    swift: {
      name: '신속의 강장제',
      desc: '1분 동안 이동 속도와 공격 속도 +{n}%'
    },
    mind: {
      name: '맑은 정신의 탕약',
      desc: '1분 동안 스킬이 {n}% 더 빨리 돌아옴'
    },
    vigor: {
      name: '활력의 엘릭서',
      desc: '1분 동안 매초 체력의 {n}% 회복'
    },
    shadow: {
      name: '갈망의 물약',
      desc: '1분 동안 준 피해의 {n}%만큼 체력 회복'
    }
  },
  alchemy: {
    talk: '약초를 넣으면 엘릭서가 나와요. 뭘 만들어 볼까요?',
    lead: '엘릭서는 전투에서 1분 동안 효과가 있어요. 세 번째 물약병으로 마셔요. 종류마다 {n}개까지 들 수 있어요.',
    brew: '제조 · {n}',
    carry: '이걸로 챙기기',
    carried: '물약병에 있음',
    count: '{n} / {max}',
    herb: '{plant}: {have}/{n}',
    done: '완성!',
    why: {
      full: '이건 더 들 수 없다.',
      herbs: '약초가 부족하다. 야외에서 더 캐 오자.',
      gold: '골드가 부족하다.'
    }
  },
  memory: {
    title: '기억력 카드 노점',
    lead: '모래가 다 떨어지기 전에 모든 짝을 찾으면 건 돈의 두 배를 받아요. 5연승하면 전설 상품도 받아요.',
    bet: '{n} 걸기',
    row: '연승: {n}/{max}',
    pairs: '{n}쌍 · {s}초',
    won: '모든 짝을 찾았어요! {n} 골드 획득.',
    lost: '모래가 다 떨어졌어요. 건 돈을 잃었어요.',
    again: '다시 하기',
    noGold: '걸 골드가 부족해요.',
    card: '카드 {n}'
  },
  battle: {
    title: '아이템 대결',
    lead: '도박꾼의 아이템에 맞서 내 아이템을 내세요. 판매 가격이 더 높은 쪽이 1점, 2점이면 승리해요. 낸 아이템은 이기든 지든 돌아오지 않아요. 3연승하면 에픽 상품도 받아요.',
    fee: '앉기 · {n}',
    row: '연승: {n}/{max}',
    needItems: '가방에 착용하지 않은 아이템이 {n}개 이상 필요해요.',
    noGold: '참가비로 낼 골드가 부족해요.',
    theirs: '도박꾼이 낸 것',
    pick: '낼 아이템을 고르세요',
    lay: '내기',
    value: '{n} 골드',
    score: '나 {a} · {b} 도박꾼',
    roundWon: '내 것이 더 비싸요. 내가 1점!',
    roundLost: '상대 것이 더 비싸요. 도박꾼이 1점.',
    won: '게임에서 이겼어요! +{n} 경험치',
    lost: '도박꾼이 게임에서 이겼어요.',
    again: '다시 하기'
  },
  gamble: {
    prize: '상품: {item}!',
    prizeGold: '이미 전부 가지고 있어서 대신 {n} 골드를 받아요!'
  },
  errand: {
    collectorFavor: {
      title: '수집가의 달방울꽃'
    },
    mirelaFavor: {
      title: '미렐라의 사라진 배달품'
    },
    treasureMap: {
      title: '루크 대장의 보물 지도'
    }
  }
}
