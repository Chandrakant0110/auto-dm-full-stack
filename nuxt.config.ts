// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // Modules
  modules: [
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
  ],

  // Supabase config (reads from .env)
  supabase: {
    redirect: false, // We'll handle auth redirects manually
  },

  // Runtime config (server-side secrets + public env vars)
  runtimeConfig: {
    // Server-only
    instagramAppSecret: '',
    supabaseServiceRoleKey: '',
    redisUrl: '',
    // Public (exposed to client)
    public: {
      instagramAppId: '',
      siteUrl: '',
    },
  },

  // Auto-imports
  imports: {
    dirs: [
      'stores',
      'composables',
      'utils',
    ],
  },

  // Global CSS
  css: ['~/assets/css/main.css'],

  // Nitro (server-side engine) config
  nitro: {
    // Enable compression
    compressPublicAssets: true,
  },

  // App-level head defaults
  app: {
    head: {
      title: 'AutoDM – Instagram Auto DM Service',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Automate Instagram DMs with smart rules, keyword triggers, and AI-powered personalisation.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
})
