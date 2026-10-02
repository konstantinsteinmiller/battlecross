/** Status colours, by family: control is gold, harm is red, the elements keep
 *  their own, boons are green / blue. */
const HARM = '#ff6b5a'
const CONTROL = '#ffd24a'
const BOON = '#67e08a'
const TINTS: Record<string, string> = {
  stun: CONTROL, knockup: CONTROL, knockdown: CONTROL, stasis: '#7fd8ff', petrify: '#b9a58a', frozen: '#9fdcff', fear: '#c08aff',
  slow: '#9fdcff', confuse: '#c08aff', taunt: HARM, armorShred: HARM, weaken: HARM, vulnerable: HARM,
  burn: '#ff8a2a', poison: '#8dff5a', bleed: '#ff4a6a', delayed: '#7fd8ff',
  haste: BOON, attackSpeed: BOON, damageUp: '#ffb04a', defenseUp: '#50aaff', regen: BOON, lifestealUp: '#ff4a6a',
  invulnerable: '#ffe9a8', unkillable: '#ffe9a8', stealth: '#9c7bff', reflect: '#50aaff', envenom: '#8dff5a',
  exosuit: '#4ff0c8', focus: '#ffd24a', accelerate: '#7fd8ff', overheat: '#ff7a2a', enrage: HARM, ambush: '#c08aff'
}
export const statusTint = (id: string): string => TINTS[id] ?? '#7fd8ff'
