import { ref } from 'vue'

export type GlitchLicenseStatus = 'pending' | 'ok' | 'denied'

export const glitchLicenseStatus = ref<GlitchLicenseStatus>('pending')

/** Why Glitch denied play (e.g. TRIAL_EXPIRED, NETWORK); null while pending/ok. */
export const glitchLicenseReason = ref<string | null>(null)
