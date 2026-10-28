// The iOS free demo and its one-time "full version" unlock (roadmap
// #Store-IAP). Policy lives here; the store itself is the Tauri plugin at
// `src-tauri/plugins/tauri-plugin-iap` (StoreKit 2).
//
// ## When is the gate on?
//
// Only on the iOS store build: the build flag `VITE_APP_IAP_UNLOCK=true` AND a
// native shell AND an Apple touch device at runtime. `.env.tauri` is shared by
// the Android build, so the flag alone is not enough; the user agent decides
// the rest. Everywhere else `gateOn` stays false and nothing here does
// anything (web portals do not even bundle this file: `useFullVersion.stub.ts`
// replaces it, see `vite.config.ts`).
//
// ## The entitlement
//
//   • `isFullVersion` starts from the cached `FULL_VERSION_KEY` in the save,
//     so the game works offline after one successful check;
//   • on every start the store is asked again (`verifyEntitlement`): a
//     confirmed answer overwrites the cache both ways (a refund takes the
//     unlock back), a failed call (offline, plugin missing) leaves it alone;
//   • a purchase or a restore sets it at once, and the plugin's
//     `entitlement-changed` event (Ask to Buy approvals, another device)
//     keeps it current while the app runs.
//
// `@tauri-apps/api` is only reachable through the build-time
// `VITE_APP_NATIVE` literal below, like `LevelPlayProvider`, so no web bundle
// links the Tauri runtime.
import { computed, ref } from 'vue'
import type { invoke as TauriInvoke, addPluginListener as TauriAddPluginListener } from '@tauri-apps/api/core'
import { FULL_VERSION_KEY } from '@/keys'
import { getState, setState } from '@/use/useGameState'
import { isAppleTouch } from '@/use/deviceProfile'
import { isLockedNode } from '@/game/data/fullVersion'

type TauriCore = { invoke: typeof TauriInvoke; addPluginListener: typeof TauriAddPluginListener }
let _tauriPromise: Promise<TauriCore> | null = null

const loadTauri: () => Promise<TauriCore> =
  import.meta.env.VITE_APP_NATIVE === 'true'
    ? () => {
      if (!_tauriPromise) {
        _tauriPromise = import('@tauri-apps/api/core').then((m) => ({
          invoke: m.invoke,
          addPluginListener: m.addPluginListener
        }))
      }
      return _tauriPromise
    }
    : () => Promise.reject(new Error('[iap] @tauri-apps/api is only available on native builds'))

const invoke = async <T>(cmd: string): Promise<T> => {
  const t = await loadTauri()
  return t.invoke<T>(`plugin:iap|${cmd}`)
}

/** What the unlock modal shows under its buttons. */
export type PurchaseStatus = 'idle' | 'busy' | 'pending' | 'failed' | 'restoreNone' | 'thanks'

interface ProductReply { supported: boolean; id: string; price?: string | null; error?: string | null }
interface PurchaseReply { supported: boolean; status: string; entitled: boolean; error?: string | null }
interface EntitlementReply { supported: boolean; checked: boolean; entitled: boolean; error?: string | null }

/** The build and the device are those of the iOS demo. Pure, for the tests. */
export const iapPlatformOn = (buildFlag: boolean, native: boolean, appleDevice: boolean): boolean =>
  buildFlag && native && appleDevice

const platformOn = (): boolean =>
  iapPlatformOn(import.meta.env.VITE_APP_IAP_UNLOCK === 'true', import.meta.env.VITE_APP_NATIVE === 'true', isAppleTouch())

/** The demo applies on this device (iOS store build). Set at load, refreshed by `initFullVersion`. */
export const gateOn = ref(false)
/** The store (or the cache of an earlier answer) says the full version is bought. */
export const isFullVersion = ref(false)
/** The storefront's own price string ("$2.99", "2,99 €"); '' until the store answered. */
export const price = ref('')
export const purchaseStatus = ref<PurchaseStatus>('idle')

/** The lock applies right now: the demo build, and not bought. */
export const gateActive = computed(() => gateOn.value && !isFullVersion.value)

/** The unlock is owned on a store build: no ad of any kind plays, and the rewarded perks are free. */
export const adsRemoved = computed(() => gateOn.value && isFullVersion.value)

/** Is this place shut by the demo? The single check the flow and the map use. */
export const isNodeLockedByDemo = (id: string): boolean => gateActive.value && isLockedNode(id)

/** TestFlight testing: a non-consumable cannot be un-bought, so the owner can switch the app to ignore the purchase. Kept on the device, never in the save. */
const IGNORE_KEY = 'bc_ignore_purchase'
const readIgnore = (): boolean => { try { return localStorage.getItem(IGNORE_KEY) === '1' } catch { return false } }
export const ignorePurchase = ref(readIgnore())

const readCache = (): boolean => getState<unknown>(FULL_VERSION_KEY) === true

/** `force`: the owner acted (bought, restored), so the ignore switch goes off. */
const setEntitled = (entitled: boolean, force = false): void => {
  if (force && entitled && ignorePurchase.value) setIgnorePurchase(false)
  isFullVersion.value = entitled && !ignorePurchase.value
  if (readCache() !== entitled) setState(FULL_VERSION_KEY, entitled)
}

/** Read the platform and the cached entitlement (synchronous; also the test seam). */
export const refreshGate = (): void => {
  gateOn.value = platformOn()
  isFullVersion.value = gateOn.value && readCache() && !ignorePurchase.value
}

/** Pretend the purchase is not there (on), or ask the store again (off). */
export function setIgnorePurchase(on: boolean): void {
  ignorePurchase.value = on
  try { localStorage.setItem(IGNORE_KEY, on ? '1' : '0') } catch { /* private mode */ }
  if (on) isFullVersion.value = false
  else void verifyEntitlement().then(() => { if (!isFullVersion.value) isFullVersion.value = gateOn.value && readCache() })
}

/** Ask the store for the product and its price. Never throws. */
export const loadProduct = async (): Promise<boolean> => {
  if (!gateOn.value) return false
  try {
    const r = await invoke<ProductReply>('get_product')
    if (r.supported && r.price) { price.value = r.price; return true }
  } catch (e) {
    console.warn('[iap] get_product failed', e)
  }
  return false
}

/** Ask the store who owns what; a confirmed answer replaces the cache. Never throws. */
export const verifyEntitlement = async (): Promise<void> => {
  if (!gateOn.value) return
  try {
    const r = await invoke<EntitlementReply>('get_entitlement')
    if (r.supported && r.checked) setEntitled(r.entitled)
  } catch (e) {
    console.warn('[iap] get_entitlement failed', e)
  }
}

let listening = false
const listen = async (): Promise<void> => {
  if (listening) return
  listening = true
  try {
    const t = await loadTauri()
    await t.addPluginListener('iap', 'entitlement-changed', (p: { entitled?: boolean }) => {
      if (typeof p?.entitled !== 'boolean') return
      const was = isFullVersion.value
      setEntitled(p.entitled)
      if (p.entitled && !was) purchaseStatus.value = 'thanks'
    })
  } catch (e) {
    listening = false
    console.warn('[iap] listener failed', e)
  }
}

/** Boot hook (`main.ts`): the cache is already in, now the store is asked. Never throws. */
export const initFullVersion = async (): Promise<void> => {
  refreshGate()
  if (!gateOn.value) return
  void listen()
  await Promise.all([verifyEntitlement(), loadProduct()])
}

/** Buy the full version. Resolves true when it is owned afterwards. */
export const buy = async (): Promise<boolean> => {
  if (!gateOn.value || purchaseStatus.value === 'busy') return isFullVersion.value
  purchaseStatus.value = 'busy'
  try {
    const r = await invoke<PurchaseReply>('purchase')
    if (r.status === 'purchased' && r.entitled) { setEntitled(true, true); purchaseStatus.value = 'thanks'; return true }
    purchaseStatus.value = r.status === 'pending' ? 'pending' : r.status === 'cancelled' ? 'idle' : 'failed'
  } catch (e) {
    console.warn('[iap] purchase failed', e)
    purchaseStatus.value = 'failed'
  }
  return isFullVersion.value
}

/** "Restore purchases" (App Review requires the button). Resolves true when owned afterwards. */
export const restore = async (): Promise<boolean> => {
  if (!gateOn.value || purchaseStatus.value === 'busy') return isFullVersion.value
  purchaseStatus.value = 'busy'
  try {
    const r = await invoke<EntitlementReply>('restore')
    if (r.supported && r.entitled) { setEntitled(true, true); purchaseStatus.value = 'thanks'; return true }
    purchaseStatus.value = r.supported && r.checked ? 'restoreNone' : 'failed'
  } catch (e) {
    console.warn('[iap] restore failed', e)
    purchaseStatus.value = 'failed'
  }
  return isFullVersion.value
}

/** Back to the idle line when the modal opens again. */
export const resetPurchaseStatus = (): void => { if (purchaseStatus.value !== 'busy') purchaseStatus.value = 'idle' }

// Synchronous: the first flow decision must not wait for an effect.
refreshGate()
