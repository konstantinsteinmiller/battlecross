// ─── useFullVersion no-op stub (every build except the iOS store build) ─────
// `flow.ts` and the map import `useFullVersion` statically, so its Tauri
// command names would live in every web bundle. Aliased away
// in `vite.config.ts` unless `VITE_APP_IAP_UNLOCK=true`. The gate is never on.
import { computed, ref } from 'vue'

export type PurchaseStatus = 'idle' | 'busy' | 'pending' | 'failed' | 'restoreNone' | 'thanks'

export const iapPlatformOn = (): boolean => false
export const gateOn = ref(false)
export const isFullVersion = ref(true)
export const price = ref('')
export const purchaseStatus = ref<PurchaseStatus>('idle')
export const gateActive = computed(() => false)
export const ignorePurchase = ref(false)
export const setIgnorePurchase = (_on: boolean): void => {}
export const adsRemoved = computed(() => false)
export const isNodeLockedByDemo = (_id: string): boolean => false
export const refreshGate = (): void => {}
export const loadProduct = async (): Promise<boolean> => false
export const verifyEntitlement = async (): Promise<void> => {}
export const initFullVersion = async (): Promise<void> => {}
export const buy = async (): Promise<boolean> => false
export const restore = async (): Promise<boolean> => false
export const resetPurchaseStatus = (): void => {}
