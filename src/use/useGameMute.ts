import { computed } from 'vue'
import { mobileCheck } from '@/utils/function'
import { isMuted, toggleMute } from '@/use/useCrazyMuteSync'
import { isMobileAudioMuted, toggleMobileAudioMute } from '@/use/useMobileAudioMute'

/**
 * ─── The one mute the player sees ────────────────────────────────────────────
 *
 * The HUD's speaker button and F2 are the same switch, and it must be the SAME
 * switch as `FMuteButton` — two mutes that disagree about whether the game is
 * silent are worse than none. So this only picks between the two existing
 * models, it adds no state of its own:
 *
 *   • desktop — the volume mute (`useCrazyMuteSync`): zeroes the stored volumes
 *     and restores them, and tells CrazyGames' toolbar;
 *   • phone — the hard silence (`useMobileAudioMute`): the OS rocker owns the
 *     level there, so "mute" suspends the engine instead.
 */
const onMobile = mobileCheck()

export const gameMuted = computed<boolean>(() => (onMobile ? isMobileAudioMuted.value : isMuted.value))

export const toggleGameMute = (): void => {
  if (onMobile) toggleMobileAudioMute()
  else toggleMute()
}
