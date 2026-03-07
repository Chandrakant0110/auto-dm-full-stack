// app/plugins/pinia.ts
// Manual Pinia setup for Nuxt 4 compatibility
import { createPinia } from 'pinia'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)
})
