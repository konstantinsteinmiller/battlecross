// @vitest-environment jsdom
// The battle bar: six skill sockets and the belt's two flasks. The attributes
// the control lessons and the play-through script look for, what a tap
// queues, and the socket's states.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

const input = vi.hoisted(() => ({
  touched: false, anyPressed: false, device: 'touch',
  potionQueued: false, manaPotionQueued: false, elixirQueued: false, elixirNextQueued: false, rollQueued: false,
  skillTap: -1, aimSlot: -1, aimLive: false, aimX: 0, aimY: 0, aimDrop: -1, aimDropX: 0, aimDropY: 0
}))
vi.mock('@/game/boot', () => ({ input }))
vi.mock('@/game/engine/input', () => ({ touchFirst: () => true }))
vi.mock('@/game/engine/quality', () => ({ sceneQuality: () => 'full' }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ t: (k: string, p?: Record<string, unknown>) => (p ? `${k}:${JSON.stringify(p)}` : k), te: () => false }) }))

import SkillBar from '@/components/hud/SkillBar.vue'
import FSocket from '@/components/atoms/FSocket.vue'
import { hud, type SkillSlotView } from '@/game/state/hud'
import { profile } from '@/game/state/profile'

const slot = (id: string, over: Partial<SkillSlotView> = {}): SkillSlotView => ({ id, ready: true, noMana: false, locked: false, active: false, ...over })
const SIX = ['shieldSlam', 'fireball', 'flamePillar', 'royalGuard', 'stoneSpike', 'aetherPistol']

beforeEach(() => {
  // A player whose mana flask has arrived (a new player's comes with the
  // first mana potion: see the reveal case below).
  profile.tips = { onboard: 1, 'reveal:mana': 2 }
  hud.device = 'touch'
  hud.skills = SIX.map(id => slot(id))
  hud.potions = 3
  hud.potionsMax = 3
  hud.potionReady = true
  hud.manaPotions = 2
  hud.manaPotionMax = 3
  hud.manaPotionReady = true
  hud.elixir = ''
  hud.elixirs = 0
  hud.elixirKinds = 0
  hud.elixirReady = true
  input.potionQueued = false
  input.manaPotionQueued = false
  input.skillTap = -1
})

describe('SkillBar', () => {
  it('darkens the screen round the health flask while the potion stop is up (#154)', async () => {
    const w = mount(SkillBar, { attachTo: document.body })
    const btn = w.find('[data-potion]').element as HTMLElement
    btn.getBoundingClientRect = () => ({ left: 300, top: 500, right: 360, bottom: 560, width: 60, height: 60, x: 300, y: 500, toJSON: () => ({}) })
    hud.potionStop = true
    await nextTick(); await nextTick()
    const spot = document.body.querySelector('[data-potion-spot]')
    expect(spot).not.toBeNull()
    // the hole sits over the flask and the arrow above it, and takes no taps
    const hole = spot!.querySelector('.potion-spot__hole') as HTMLElement
    expect(parseFloat(hole.style.left)).toBeLessThan(300)
    expect(parseFloat(hole.style.top)).toBeLessThan(500 - 60)
    expect(parseFloat(hole.style.top) + parseFloat(hole.style.height)).toBeGreaterThanOrEqual(560)
    expect(spot!.textContent).toContain('hud.potionStop')
    hud.potionStop = false
    await nextTick()
    expect(document.body.querySelector('[data-potion-spot]')).toBeNull()
    w.unmount()
  })

  it('draws eight buttons: six skills and the two flasks', () => {
    const w = mount(SkillBar)
    expect(w.findAll('.slot')).toHaveLength(8)
    expect(w.findAll('[data-skill-slot]').map(b => b.attributes('data-skill-slot'))).toEqual(['0', '1', '2', '3', '4', '5'])
    expect(w.findAll('[data-potion]')).toHaveLength(1)
    expect(w.findAll('[data-mana-potion]')).toHaveLength(1)
    // The control lessons find the HEALTH flask by `data-potion`: only it has it.
    expect(w.find('[data-mana-potion]').attributes('data-potion')).toBeUndefined()
    expect(w.find('[data-mana-potion]').classes()).toEqual(expect.arrayContaining(['slot', 'slot--potion', 'slot--mana']))
  })

  it('draws only the filled skill slots, and keeps both flasks when the belt is empty', async () => {
    hud.skills = [slot('shieldSlam'), slot(''), slot('fireball'), slot(''), slot(''), slot('')]
    hud.potions = 0
    hud.manaPotions = 0
    const w = mount(SkillBar)
    expect(w.findAll('[data-skill-slot]').map(b => b.attributes('data-skill-slot'))).toEqual(['0', '2'])
    expect(w.find('[data-potion]').classes()).toContain('is-empty')
    expect(w.find('[data-mana-potion]').classes()).toContain('is-empty')
    expect(w.find('[data-mana-potion]').classes()).not.toContain('is-ready')
    expect(w.findAll('.slot')).toHaveLength(4)
  })

  it('a tap on a flask queues that flask', async () => {
    const w = mount(SkillBar)
    await w.find('[data-mana-potion]').trigger('pointerdown', { pointerType: 'touch' })
    expect(input.manaPotionQueued).toBe(true)
    expect(input.potionQueued).toBe(false)
    await w.find('[data-potion]').trigger('pointerdown', { pointerType: 'touch' })
    expect(input.potionQueued).toBe(true)
  })

  it('shows each flask\'s count, and the liquid stands as high as the belt is full', async () => {
    const w = mount(SkillBar)
    expect(w.find('[data-potion] .slot__count').text()).toBe('3')
    expect(w.find('[data-mana-potion] .slot__count').text()).toBe('2')
    const y = (sel: string): number => Number(/translateY\(([\d.]+)%\)/.exec((w.find(sel).element as HTMLElement).style.transform)?.[1])
    const full = y('[data-potion] .flask__liquid')
    const part = y('[data-mana-potion] .flask__liquid')
    expect(part).toBeGreaterThan(full)
    hud.manaPotions = 0
    await nextTick()
    expect(y('[data-mana-potion] .flask__liquid')).toBe(100)
  })

  it('a skill button wears its state as a class', () => {
    hud.skills = [slot('shieldSlam'), slot('fireball', { ready: false, noMana: true }), slot('flamePillar', { ready: false, locked: true, noMana: true }), slot(''), slot(''), slot('')]
    const w = mount(SkillBar)
    expect(w.find('[data-skill-slot="0"]').classes()).toContain('is-ready')
    expect(w.find('[data-skill-slot="1"]').classes()).toContain('is-nomana')
    // Locked wins over "no mana": one reason at a time.
    expect(w.find('[data-skill-slot="2"]').classes()).toContain('is-locked')
    expect(w.find('[data-skill-slot="2"]').classes()).not.toContain('is-nomana')
    expect(w.find('[data-skill-slot="2"] .slot__lock').exists()).toBe(true)
    // The mana price is on the button.
    expect(w.find('[data-skill-slot="1"] .slot__cost').exists()).toBe(true)
  })

  it('keeps a cooldown layer and a number per button for the ticker to write', () => {
    const w = mount(SkillBar)
    // Six skills, two flasks, and the dodge roll (#74).
    expect(w.findAll('.slot__cd')).toHaveLength(9)
    expect(w.findAll('.slot__num')).toHaveLength(9)
  })

  it('has a dodge roll button for every hero: a tap queues the roll (#74, D79)', async () => {
    const w = mount(SkillBar)
    const b = w.find('[data-roll]')
    expect(b.exists()).toBe(true)
    expect(b.attributes('aria-label')).toBe('hud.roll')
    expect(b.classes()).not.toContain('slot')
    await b.trigger('pointerdown')
    expect(input.rollQueued).toBe(true)
    input.rollQueued = false
  })
})

describe('SkillBar: the elixir flask (roadmap #87)', () => {
  it('is there only while an elixir is carried; a tap drinks, its arrow turns it when there is more than one kind', async () => {
    const w = mount(SkillBar)
    expect(w.find('[data-elixir]').exists()).toBe(false)
    hud.elixir = 'might'
    hud.elixirs = 2
    hud.elixirKinds = 1
    await nextTick()
    const f = w.find('[data-elixir]')
    expect(f.classes()).toEqual(expect.arrayContaining(['slot', 'slot--potion', 'slot--elixir', 'is-ready']))
    expect(f.find('.slot__count').text()).toBe('2')
    expect(f.find('.slot__swap').exists()).toBe(false)
    expect(w.findAll('.slot')).toHaveLength(9)
    await f.find('.slot__hit').trigger('pointerdown', { pointerType: 'touch' })
    expect(input.elixirQueued).toBe(true)
    hud.elixirKinds = 2
    await nextTick()
    await w.find('[data-elixir] .slot__swap').trigger('pointerdown', { pointerType: 'touch' })
    expect(input.elixirNextQueued).toBe(true)
  })
})

describe('SkillBar: the mana flask arrives when it first matters (roadmap #52)', () => {
  it('a new player has no mana flask until the first mana potion; it pops in glowing, and stops glowing once drunk', async () => {
    profile.tips = { onboard: 1 }
    const w = mount(SkillBar)
    expect(w.find('[data-mana-potion]').exists()).toBe(false)
    expect(w.findAll('.slot')).toHaveLength(7)
    profile.tips['reveal:mana'] = 1
    await nextTick()
    expect(w.find('[data-mana-potion]').classes()).toContain('is-glow')
    profile.tips['reveal:mana'] = 2
    await nextTick()
    expect(w.find('[data-mana-potion]').classes()).not.toContain('is-glow')
  })

  it('a returning player has it from the start', () => {
    profile.tips = { onboard: 2 }
    expect(mount(SkillBar).find('[data-mana-potion]').exists()).toBe(true)
  })
})

describe('FSocket', () => {
  it('is a frame round whatever is slotted in: square or round, with its tint', () => {
    const sq = mount(FSocket, { props: { tint: 'rgb(1, 2, 3)', gem: true }, slots: { default: '<i class="inside" />' } })
    expect(sq.classes()).toContain('f-socket--square')
    expect(sq.find('.f-socket__well .inside').exists()).toBe(true)
    expect((sq.element as HTMLElement).style.getPropertyValue('--tint')).toBe('rgb(1, 2, 3)')
    expect(sq.find('.f-socket__frame .g-base').exists()).toBe(true)
    const round = mount(FSocket, { props: { shape: 'round', cork: true } })
    expect(round.classes()).toContain('f-socket--round')
    expect(round.find('.f-socket__frame .c-cork').exists()).toBe(true)
  })

  it('an empty socket shows a ghost of what belongs in it', () => {
    const w = mount(FSocket, { props: { empty: true, ghost: 'sword' } })
    expect(w.classes()).toContain('is-empty')
    expect(w.find('.f-socket__ghost').exists()).toBe(true)
    expect(mount(FSocket, { props: { ghost: 'sword' } }).find('.f-socket__ghost').exists()).toBe(false)
  })

  it('a painted frame replaces the drawn one', () => {
    const w = mount(FSocket, { props: { artSrc: '/images/ui/skill-frame.webp' } })
    expect(w.classes()).toContain('has-art')
    expect(w.find('img.f-socket__art').attributes('src')).toBe('/images/ui/skill-frame.webp')
    expect(w.find('.f-socket__frame').exists()).toBe(false)
    // Named but not dropped in (the stub has no files): the drawn frame stands.
    expect(mount(FSocket, { props: { art: 'skill-frame' } }).find('.f-socket__frame').exists()).toBe(true)
  })
})
