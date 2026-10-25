// @vitest-environment jsdom
// The iOS demo's unlock offer: the storefront price on the button, a restore
// link (App Review), "Not now", and the status lines.

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const act = vi.hoisted(() => ({ decline: 0, accept: 0, buy: 0, restore: 0 }))
const gate = vi.hoisted(() => ({
  price: null as unknown as { value: string },
  status: null as unknown as { value: string },
  owned: null as unknown as { value: boolean }
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (k: string, p?: Record<string, unknown>) => (p ? `${k}|${Object.values(p).join(',')}` : k),
    te: () => false
  })
}))
vi.mock('@/game/audio/sfx', () => ({ sfx: () => {} }))
vi.mock('@/game/flow', () => ({
  declineUnlock: () => { act.decline++ },
  acceptUnlock: () => { act.accept++ }
}))
vi.mock('@/use/useFullVersion', () => {
  gate.price = ref('')
  gate.status = ref('idle')
  gate.owned = ref(false)
  return {
    price: gate.price,
    purchaseStatus: gate.status,
    isFullVersion: gate.owned,
    loadProduct: async () => true,
    buy: async () => { act.buy++; return false },
    restore: async () => { act.restore++; return false }
  }
})

// jsdom has no ResizeObserver (FModal measures its header with one).
vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })

import UnlockModal from '@/components/modals/UnlockModal.vue'

const open = () => mount(UnlockModal, { attachTo: document.body })
const q = (sel: string): HTMLElement | null => document.body.querySelector(sel)

beforeEach(() => {
  document.body.innerHTML = ''
  act.decline = act.accept = act.buy = act.restore = 0
  gate.price.value = '$2.99'
  gate.status.value = 'idle'
  gate.owned.value = false
})

describe('the unlock modal', () => {
  it('names the price the store returned on the Unlock button', () => {
    gate.price.value = '2,99 €'
    open()
    expect(q('[data-unlock-buy]')!.textContent).toContain('iap.unlock|2,99 €')
  })

  it('falls back to a price-less label while the store has not answered', () => {
    gate.price.value = ''
    open()
    expect(q('[data-unlock-buy]')!.textContent).toContain('iap.unlockNoPrice')
  })

  it('has Unlock, Restore purchases and Not now', async () => {
    open()
    q('[data-unlock-buy]')!.click()
    q('[data-unlock-restore]')!.click()
    expect(q('[data-unlock-restore]')!.textContent).toContain('iap.restore')
    const notNow = [...document.body.querySelectorAll('button')].find(b => b.textContent?.includes('iap.notNow'))!
    notNow.click()
    expect([act.buy, act.restore, act.decline]).toEqual([1, 1, 1])
  })

  it('says what is going on: pending, failed, nothing to restore', async () => {
    const w = open()
    gate.status.value = 'pending'
    await w.vm.$nextTick()
    expect(q('[data-unlock-status]')!.textContent).toContain('iap.pending')
    gate.status.value = 'failed'
    await w.vm.$nextTick()
    expect(q('[data-unlock-status]')!.textContent).toContain('iap.failed')
    gate.status.value = 'restoreNone'
    await w.vm.$nextTick()
    expect(q('[data-unlock-status]')!.textContent).toContain('iap.restoreNone')
  })

  it('locks its buttons while the store is working', async () => {
    const w = open()
    gate.status.value = 'busy'
    await w.vm.$nextTick()
    expect(q('[data-unlock-restore]')!.hasAttribute('disabled')).toBe(true)
    expect(q('[data-unlock-buy]')!.hasAttribute('disabled')).toBe(true)
  })

  it('thanks the buyer and goes on with Continue once the full version is owned', async () => {
    const w = open()
    gate.owned.value = true
    await w.vm.$nextTick()
    expect(q('[data-unlock-thanks]')!.textContent).toContain('iap.thanks')
    expect(q('[data-unlock-buy]')).toBeNull()
    q('[data-unlock-continue]')!.click()
    expect(act.accept).toBe(1)
  })
})
