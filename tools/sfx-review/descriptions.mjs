// ─── Where each sound plays (roadmap #118) ───────────────────────────────────
//
// Plain-English notes for the sound review page, read off the call sites
// (`modes/zoneMode.ts`, `gfx/levelProps.ts`, `talk.ts`, the screens). Skill
// casts and impacts get their skill lists added by `generate.mjs` from
// `data/skillSounds.ts`, so those stay current by themselves.
//
// `shot` is the screenshot context (`screenshots.mjs`): 'fight' (a generic
// fight), 'boss', 'town', 'arena', or 'class' (the fight scene of the first
// class whose skills use the sound).

export const CATEGORIES = ['Skill cast', 'Skill impact', 'Weapon', 'Hit', 'Ability', 'Enemy', 'Reward', 'Crowd', 'UI']

/** @type {Record<string, { category: string, where: string, shot: string }>} */
export const NOTES = {
  // Weapons: the basic attack, by what is in the hand (zoneMode `swingSound`).
  swing: { category: 'Weapon', shot: 'fight', where: 'Basic attack with a sword or other edged one-hand weapon (hero and humanoid enemies; enemies play it quieter).' },
  swingDagger: { category: 'Weapon', shot: 'fight', where: 'Basic attack with a dagger; also the bite or claw of small beasts (non-humanoid enemies).' },
  swingHeavy: { category: 'Weapon', shot: 'fight', where: 'Basic attack with a greatsword, axe or scythe, or any heavy blow. Also the cleave and dash effects, and the CAST sound of every physical skill.' },
  swingBlunt: { category: 'Weapon', shot: 'fight', where: 'Basic attack with a hammer, club, staff, cannon or bare fists; the swipe of dragons, wyverns and big beasts.' },
  shoot: { category: 'Weapon', shot: 'fight', where: 'Ranged basic attack with a gun, crossbow or other non-bow ranged weapon.' },
  shootBow: { category: 'Weapon', shot: 'fight', where: 'Ranged basic attack with a bow or sling.' },
  cast: { category: 'Weapon', shot: 'fight', where: 'Basic attack of a magic-style attacker (staff bolts, caster enemies).' },

  // Hits: every blow that lands plays one of these, skills included.
  hit: { category: 'Hit', shot: 'fight', where: 'The hero lands an edged blow (sword, axe). Plays UNDER every skill impact too, layered with the element sound.' },
  hitBlunt: { category: 'Hit', shot: 'fight', where: 'The hero lands a blunt blow (hammer, club, fists, staff). Also the training dummy being knocked, and a weak forge strike at the smith. Plays under skill impacts of blunt-weapon heroes.' },
  hitPierce: { category: 'Hit', shot: 'fight', where: 'The hero lands a piercing blow (arrows, bolts, spears, daggers). Plays under the impact of piercing skills.' },
  hitHeavy: { category: 'Hit', shot: 'fight', where: 'A heavy blow lands. Also the IMPACT sound of every physical skill and every command skill, and a strong forge strike at the smith.' },
  crit: { category: 'Hit', shot: 'fight', where: 'A critical hit by the hero (replaces the normal hit sound, under any skill impact).' },
  block: { category: 'Hit', shot: 'fight', where: 'An attack is blocked; also the anvil clang when an item is upgraded on the equipment page.' },
  dodge: { category: 'Hit', shot: 'fight', where: 'An attack misses or is dodged.' },
  hurt: { category: 'Hit', shot: 'fight', where: 'The hero takes damage.' },

  // Elements, as plain damage and as impacts.
  fire: { category: 'Hit', shot: 'fight', where: 'A non-skill fire hit (a burning weapon, fire damage type), quieter layer; also dragon breath.' },
  ice: { category: 'Hit', shot: 'fight', where: 'A non-skill frost hit; also icicle and geyser bursts.' },
  holy: { category: 'Skill impact', shot: 'class', where: 'Impact of holy skills; also non-skill holy damage.' },
  shadow: { category: 'Skill impact', shot: 'class', where: 'Impact of shadow skills; also non-skill shadow damage and curse bursts.' },
  poison: { category: 'Skill impact', shot: 'class', where: 'Impact of poison skills (flasks, venom); also non-skill poison/acid damage and flask/venom bursts.' },
  blood: { category: 'Skill impact', shot: 'class', where: 'Impact of blood skills; also non-skill blood damage.' },
  quake: { category: 'Skill impact', shot: 'class', where: 'Impact of earth skills; also slam, quake and spike effects, root bursts, walls rising in a level, and a pressure plate puzzle solved.' },
  beam: { category: 'Ability', shot: 'boss', where: 'A beam effect (boss and skill beams), and beam damage.' },
  explode: { category: 'Ability', shot: 'fight', where: 'A generic burst or explosion effect (grenades, bombs, any burst without its own sound).' },
  teleport: { category: 'Ability', shot: 'fight', where: 'Blink and rewind effects (teleports, time rewinds).' },

  // Abilities
  summon: { category: 'Ability', shot: 'fight', where: 'Something is summoned or deployed (pets, turrets, minions).' },
  heal: { category: 'Ability', shot: 'fight', where: 'A heal effect; also drinking from a healing spring in a level.' },
  shieldUp: { category: 'Ability', shot: 'fight', where: 'A shield, bastion or buff goes up; also the fatal-save that keeps the hero alive.' },
  roar: { category: 'Enemy', shot: 'boss', where: 'A boss enters a new phase; also roar effects.' },
  telegraph: { category: 'Enemy', shot: 'boss', where: 'An enemy starts winding up a special move (the warning before it lands).' },
  overheat: { category: 'Ability', shot: 'class', where: 'The Aether-Tech overheats (heat bar full).' },

  // Enemies
  alert: { category: 'Enemy', shot: 'fight', where: 'An enemy group wakes up and notices the hero; a colosseum wave starts; the world map raises an alarm.' },
  bossIntro: { category: 'Enemy', shot: 'boss', where: 'A boss wakes up (its entrance, with slow motion and the boss banner).' },
  death: { category: 'Enemy', shot: 'fight', where: 'An ordinary enemy dies.' },
  deathBig: { category: 'Enemy', shot: 'boss', where: 'A boss dies, the hero falls, or an escorted caravan is lost.' },

  // Rewards
  coin: { category: 'Reward', shot: 'fight', where: 'Gold is gained: coins dropped in a fight, a sale, a reward from a quest, contract or minigame; also an item upgrade.' },
  loot: { category: 'Reward', shot: 'fight', where: 'A common item drops, or an item is received in a dialogue.' },
  lootRare: { category: 'Reward', shot: 'fight', where: 'A rare (tier 3) item drops.' },
  lootEpic: { category: 'Reward', shot: 'fight', where: 'An epic (tier 4 to 5) item drops.' },
  lootLegend: { category: 'Reward', shot: 'boss', where: 'A legendary or mythic (tier 6+) item drops.' },
  chest: { category: 'Reward', shot: 'fight', where: 'A chest opens (in a level, after a victory, on the world map, at a trader); also the training dummy breaking apart.' },
  levelUp: { category: 'Reward', shot: 'fight', where: 'The hero levels up; also a quest or errand completed, captives freed from a cage, a caravan arriving, and a forge success.' },
  potion: { category: 'Reward', shot: 'fight', where: 'A potion is drunk, or bought from the alchemist or healer.' },

  // Crowd
  crowdCheer: { category: 'Crowd', shot: 'arena', where: 'The colosseum crowd cheers when a wave falls.' },
  crowdRoar: { category: 'Crowd', shot: 'arena', where: 'The colosseum crowd roars (with a horn call) when a milestone wave is reached and a mythic prize appears.' },

  // UI
  denied: { category: 'UI', shot: 'town', where: 'Anything refused: not enough gold, requirements not met, a locked cage or chest, a busy ore vein, a wrong plate in a puzzle, a lost minigame.' },
  uiClick: { category: 'UI', shot: 'town', where: 'Every button press, tab, select and list tap in the menus and HUD.' },
  uiOpen: { category: 'UI', shot: 'town', where: 'A window or screen opens; a chest starts opening; an errand is taken.' },
  uiClose: { category: 'UI', shot: 'town', where: 'A window or screen closes; an item is taken off.' },
  uiEquip: { category: 'UI', shot: 'town', where: 'An item or skill is equipped; ore, herbs or a cage key picked up in a level; a small potion pickup.' },
  uiBuy: { category: 'UI', shot: 'town', where: 'Buying at a trader; taking a contract; a reward claimed on the results screen.' },
  uiLearn: { category: 'UI', shot: 'town', where: 'A skill learned at a trainer, a treatment at the healer, a lore scroll found, a puzzle solved, a minigame won.' },
  uiPoint: { category: 'UI', shot: 'town', where: 'An attribute point spent; a goal ticked; places revealed on the world map; a pressure plate stepped on.' },
  uiChoice: { category: 'UI', shot: 'town', where: 'A choice made: a dialogue answer, the class pick, a character choice.' },
  mapMove: { category: 'UI', shot: 'town', where: 'Selecting or travelling to a place on the world map.' }
}
