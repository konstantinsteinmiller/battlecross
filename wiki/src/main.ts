import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

// Absolute: a url() inside a custom property resolves against the stylesheet's folder.
document.documentElement.style.setProperty('--bgimg', `url(${new URL('img/ui/map.webp', location.href).href})`)
createApp(App).mount('#app')
