<template>
  <NuxtLayout name="auth">
    <div class="register-page animate-fade-in">
      <h1 class="register-page__title">Create an account</h1>
      <p class="register-page__sub">Start automating your Instagram DMs in minutes</p>

      <div v-if="route.query.ig === 'connected'" class="ig-success-banner">
        🎉 Instagram connected successfully! Create your account to save it.
      </div>

      <form class="register-form" @submit.prevent="handleRegister">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input
            id="name"
            v-model="name"
            type="text"
            class="input"
            placeholder="Jane Doe"
            autocomplete="name"
            required
          />
        </div>

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
            autocomplete="new-password"
            required
          />
          <p class="form-hint">Must be at least 8 characters.</p>
        </div>

        <div v-if="error" class="error-banner">{{ error }}</div>

        <button id="register-btn" type="submit" class="btn btn-primary register-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Creating account…' : 'Create Account' }}
        </button>
      </form>

      <div class="divider"><span>or signup with</span></div>

      <button id="instagram-register-btn" class="btn btn-ghost instagram-btn" @click="handleInstagramOAuth">
        <span>📸</span> Continue with Instagram
      </button>

      <p class="register-page__footer">
        Already have an account?
        <NuxtLink to="/login" class="text-accent">Sign in →</NuxtLink>
      </p>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Create Account — AutoDM' })

const name     = ref('')
const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

const supabase = useSupabaseClient()
const router   = useRouter()
const route    = useRoute()

async function handleRegister() {
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long.'
    return
  }

  loading.value = true
  error.value   = ''
  
  const { error: err } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
    options: {
      data: {
        full_name: name.value
      }
    }
  })
  
  loading.value = false
  
  if (err) { 
    error.value = err.message
    return 
  }
  
  // Account created! Now tie their Instagram account to their new user via the pending cookies
  try {
    await $fetch('/api/auth/link-instagram', { method: 'POST' })
  } catch (linkErr) {
    console.error('Failed to link Instagram on register:', linkErr)
  }

  // Redirect to dashboard
  router.push('/dashboard')
}

async function handleInstagramOAuth() {
  window.location.href = '/api/auth/instagram/login'
}
</script>

<style scoped>
.register-page { display: flex; flex-direction: column; gap: 1.25rem; }
.register-page__title { font-size: 1.6rem; text-align: center; font-weight: 700; }
.register-page__sub   { text-align: center; font-size: 0.9rem; color: var(--color-text-muted); margin-top: -0.75rem; }

.register-form { display: flex; flex-direction: column; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.4rem; }
.form-label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted); }
.form-hint { font-size: 0.75rem; color: var(--color-text-faint); margin-top: 0.2rem; }

.input { 
  background: var(--color-surface); 
  border: 1px solid var(--color-border); 
  border-radius: var(--radius-md); 
  padding: 0.8rem 1rem; 
  color: var(--color-text); 
  font-family: var(--font-body); 
  font-size: 0.95rem; 
  outline: none; 
  transition: border var(--transition); 
}
.input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }

.error-banner {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger);
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
}

.register-btn { width: 100%; justify-content: center; padding: 0.8rem; font-weight: 600; }

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  margin-right: 0.5rem;
}
@keyframes spin { to { transform: rotate(360deg); } }

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: var(--color-text-faint);
  font-size: 0.8rem;
  margin: 0.5rem 0;
}
.divider::before, .divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}
.divider span { padding: 0 1rem; }

.instagram-btn { width: 100%; justify-content: center; border: 1px solid var(--color-border); }

.register-page__footer {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-top: 0.5rem;
}
.text-accent { color: var(--color-accent); font-weight: 500; text-decoration: none; transition: opacity var(--transition); }
.text-accent:hover { opacity: 0.8; }

.ig-success-banner {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--color-success, #10b981);
  padding: 0.8rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: -0.5rem;
}
</style>
