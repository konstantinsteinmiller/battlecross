/** SHORT — the Goblin King falls (Hollows, a Pyromancer): fire clears the court, the King goes down on a freeze-frame. */
import { win } from './_boss.mjs'
export default win({ id: 'short-king-win', label: 'The Goblin King falls', node: 'hollows', cls: 'pyro', level: 8, bossHp: 0.6, firstPhase: ['tusker'] })
