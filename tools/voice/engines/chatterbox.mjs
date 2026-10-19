// Chatterbox Multilingual v3 (local): it designs no voice, so it clones Qwen3's
// reference clip (the English one for every language: one voice per speaker); the tone sets its exaggeration (see py/run_chatterbox.py).
import { makeLocal } from './local.mjs'

export default makeLocal({ name: 'chatterbox', label: 'Chatterbox Multilingual v3 (local)', designer: 'qwen', refLang: 'en' })
