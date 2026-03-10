<template>
  <NuxtLayout name="auth">
    <div class="login-page">
      <h1 class="login-page__title">Welcome back</h1>
      <p class="login-page__sub">Sign in to manage your Instagram automations</p>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="input"
            placeholder="you@example.com"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="input"
            placeholder="••••••••"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <button id="login-btn" type="submit" class="btn btn-primary login-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <div class="divider"></div>

      <button id="instagram-login-btn" class="btn btn-ghost instagram-btn" @click="handleInstagramOAuth">
        <span>📸</span> Continue with Instagram
      </button>

      <p class="login-page__footer">
        Don't have an account?
        <NuxtLink to="/register">Create one →</NuxtLink>
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false,
})

const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

const supabase = useSupabaseClient()
const router   = useRouter()
const route    = useRoute()

onMounted(() => {
  if (route.query.error) {
    error.value = route.query.error as string
  }
})

async function handleLogin() {
  loading.value = true
  error.value   = ''
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false
  if (err) { error.value = err.message; return }
  router.push('/dashboard')
}

async function handleInstagramOAuth() {
  const config = useRuntimeConfig()
  const clientId = '1902341750660120'
  // const clientId = config.public.instagramAppId
  const redirectUri = `${config.public.siteUrl}/api/auth/instagram/callback`

  window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&state=login`
}
</script>

<style scoped>
.login-page { display: flex; flex-direction: column; gap: 1.25rem; }
.login-page__title { font-size: 1.6rem; text-align: center; }
.login-page__sub   { text-align: center; font-size: 0.9rem; color: var(--color-text-muted); margin-top: -0.75rem; }

.login-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted); }

.error-banner {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger);
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.login-btn { width: 100%; justify-content: center; padding: 0.8rem; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.instagram-btn { width: 100%; justify-content: center; }

.login-page__footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
