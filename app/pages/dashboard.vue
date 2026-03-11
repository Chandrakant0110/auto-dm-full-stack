<template>
  <NuxtLayout name="dashboard">
    <div class="dashboard animate-fade-in">
      <!-- Banners -->
      <div v-if="successMsg" class="success-banner">{{ successMsg }}</div>
      <div v-if="errorMsg"   class="error-banner">{{ errorMsg }}</div>

      <!-- Stats row -->
      <div class="grid-4 stats-row">
        <div class="card stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-card__icon">{{ stat.icon }}</div>
          <div class="stat-card__value">{{ stat.value }}</div>
          <div class="stat-card__label">{{ stat.label }}</div>
          <div class="stat-card__delta" :class="stat.delta > 0 ? 'up' : 'down'">
            {{ stat.delta > 0 ? '↑' : '↓' }} {{ Math.abs(stat.delta) }}% vs last week
          </div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="dashboard__grid">
        <!-- Profile card -->
        <div class="card" v-if="profile">
          <div class="section-header">
            <div class="profile-header">
              <img v-if="profile.profile_picture_url" :src="profile.profile_picture_url" alt="Profile Picture" class="profile-pic" />
              <div>
                <h3>{{ profile.name || profile.username }}</h3>
                <p class="profile-meta">@{{ profile.username }} • {{ profile.followers_count }} followers • {{ profile.follows_count }} following</p>
              </div>
            </div>
            <p v-if="profile.biography" class="profile-bio">{{ profile.biography }}</p>
          </div>
        </div>

        <div class="card" v-else-if="igError">
          <div class="section-header">
            <h3>Instagram Disconnected</h3>
            <button @click="reconnectInstagram" class="btn btn-primary" style="padding: 0.4rem 0.75rem; font-size:0.8rem;">
              Reconnect →
            </button>
          </div>
          <p style="color:var(--color-danger); font-size: 0.8rem">{{ igError }}</p>
        </div>

        <!-- Active Automations -->
        <div class="card">
          <div class="section-header">
            <h3>Active Automations</h3>
            <NuxtLink to="/automations" class="btn btn-ghost" style="padding: 0.4rem 0.75rem; font-size:0.8rem;">View all →</NuxtLink>
          </div>
          <div class="automation-list">
            <div class="automation-item" v-for="auto in recentAutomations" :key="auto.id">
              <span class="status-dot" :class="auto.status"></span>
              <div class="automation-item__info">
                <span class="automation-item__name">{{ auto.name }}</span>
                <span class="automation-item__trigger">trigger: {{ auto.trigger }}</span>
              </div>
              <span class="badge" :class="auto.status === 'active' ? 'badge-green' : 'badge-orange'">{{ auto.status }}</span>
            </div>
          </div>
        </div>

        <!-- Recent DM activity -->
        <div class="card">
          <div class="section-header"><h3>Recent DM Activity</h3></div>
          <div class="activity-feed">
            <div class="activity-item" v-for="item in activity" :key="item.id">
              <div class="activity-item__avatar">{{ item.initials }}</div>
              <div class="activity-item__body">
                <span class="activity-item__name">{{ item.username }}</span>
                <span class="activity-item__msg">{{ item.message }}</span>
              </div>
              <span class="activity-item__time">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── Instagram Token Modal ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showTokenModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card">
          <div class="modal-header">
            <h2>📸 Instagram Token Manager</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <!-- Generated token section -->
          <div v-if="pendingToken" class="modal-section">
            <p class="modal-label">✅ Long-lived token generated (60 days)</p>
            <div class="token-display">
              <code class="token-code">{{ pendingToken }}</code>
              <button class="btn-icon" @click="copyToken(pendingToken)" :title="copied ? 'Copied!' : 'Copy'">
                {{ copied ? '✅' : '📋' }}
              </button>
            </div>
            <div class="modal-actions">
              <button class="btn btn-primary" :disabled="saving" @click="saveToken(pendingToken)">
                {{ saving ? 'Saving…' : '💾 Save to Account' }}
              </button>
            </div>
          </div>

          <div class="modal-divider">or enter a custom token</div>

          <!-- Manual token entry -->
          <div class="modal-section">
            <p class="modal-label">Enter Instagram Long-Lived Access Token</p>
            <textarea
              v-model="customToken"
              class="token-input"
              rows="3"
              placeholder="Paste your long-lived Instagram access token here…"
            />
            <div class="modal-actions">
              <button class="btn btn-primary" :disabled="!customToken.trim() || saving" @click="saveToken(customToken.trim())">
                {{ saving ? 'Saving…' : '💾 Save Custom Token' }}
              </button>
              <button class="btn btn-ghost" @click="copyToken(customToken.trim())" :disabled="!customToken.trim()">
                📋 Copy
              </button>
            </div>
          </div>

          <div v-if="modalError"   class="modal-error">{{ modalError }}</div>
          <div v-if="modalSuccess" class="modal-success">{{ modalSuccess }}</div>
        </div>
      </div>
    </Teleport>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Dashboard — AutoDM' })

const user    = useSupabaseUser()
const supabase = useSupabaseClient()
const route   = useRoute()
const { profile, loading, error: igError, fetchProfile } = useInstagram()

const successMsg = ref('')
const errorMsg   = ref('')

// Token modal state
const showTokenModal = ref(false)
const pendingToken   = ref('')
const pendingIgUserId   = ref('')
const pendingExpiresIn  = ref(5184000)
const customToken    = ref('')
const copied         = ref(false)
const saving         = ref(false)
const modalError     = ref('')
const modalSuccess   = ref('')

onMounted(async () => {
  if (!user.value) return navigateTo('/login')

  const ig = route.query.ig as string | undefined
  useRouter().replace({ query: {} }) // always clean up URL

  if (ig === 'pending') {
    // Fetch the token from the httpOnly cookie via server
    try {
      const res = await $fetch<{ found: boolean; token?: string; igUserId?: string; expiresIn?: number }>(
        '/api/auth/instagram/pending-token'
      )
      if (res.found && res.token) {
        pendingToken.value   = res.token
        pendingIgUserId.value  = res.igUserId || ''
        pendingExpiresIn.value = res.expiresIn || 5184000
        showTokenModal.value = true
      } else {
        errorMsg.value = 'Token exchange succeeded but the token could not be retrieved. Please try reconnecting.'
      }
    } catch {
      errorMsg.value = 'Failed to retrieve the generated token.'
    }
  } else if (ig === 'connected') {
    successMsg.value = '✅ Instagram account connected successfully!'
  } else if (route.query.error) {
    errorMsg.value = route.query.error as string
  }

  await fetchProfile()
})

async function saveToken(token: string) {
  if (!token) return
  saving.value     = true
  modalError.value = ''
  modalSuccess.value = ''

  try {
    // Get the current Supabase session's JWT to send as Authorization header
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      modalError.value = 'You must be logged in to save a token.'
      return
    }

    await $fetch('/api/auth/instagram/save-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` },
      body: {
        token,
        igUserId  : pendingIgUserId.value || 'unknown',
        expiresIn : pendingExpiresIn.value,
      },
    })

    modalSuccess.value = '✅ Token saved to your account successfully!'
    pendingToken.value = ''
    customToken.value  = ''
    successMsg.value   = '✅ Instagram account connected!'
    setTimeout(() => { showTokenModal.value = false }, 2000)
    await fetchProfile()
  } catch (err: any) {
    modalError.value = err?.data?.message || err?.message || 'Failed to save token.'
  } finally {
    saving.value = false
  }
}

function copyToken(token: string) {
  if (!token) return
  navigator.clipboard.writeText(token)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function closeModal() {
  showTokenModal.value = false
}

const reconnectInstagram = () => {
  const config = useRuntimeConfig()
  const redirectUri = `${config.public.siteUrl}/api/auth/instagram/callback`
  window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${config.public.instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&state=dashboard`
}

const stats = [
  { icon: '📨', label: 'DMs Sent Today',   value: '1,284', delta:  12.4 },
  { icon: '👤', label: 'New Followers',     value: '342',   delta:   8.1 },
  { icon: '💬', label: 'Conversations',     value: '89',    delta:  -2.3 },
  { icon: '⚡', label: 'Active Rules',      value: '7',     delta:  40.0 },
]
const recentAutomations = [
  { id: 1, name: 'Welcome DM',        trigger: 'new follower', status: 'active'  },
  { id: 2, name: 'Story Reply',       trigger: 'story reply',  status: 'active'  },
  { id: 3, name: 'Keyword Trigger',   trigger: '"price" DM',   status: 'active'  },
  { id: 4, name: 'Post Comment Auto', trigger: 'reel comment', status: 'paused'  },
]
const activity = [
  { id: 1, initials: 'JD', username: '@johndoe',   message: "What's the price?",    time: '2m ago'  },
  { id: 2, initials: 'MK', username: '@mary_k',    message: 'Thanks for replying!', time: '8m ago'  },
  { id: 3, initials: 'AL', username: '@alex_lens', message: 'DM sent: welcome msg', time: '15m ago' },
  { id: 4, initials: 'RB', username: '@riya_b',    message: 'Triggered: keyword',   time: '22m ago' },
  { id: 5, initials: 'TN', username: '@tomn',      message: 'Story reply captured', time: '1h ago'  },
]
</script>

<style scoped>
/* ── Banners ────────────────────────────────────────────────────────────────── */
.success-banner {
  background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
  color: var(--color-success); padding: 0.8rem 1rem; border-radius: var(--radius-md);
  font-size: 0.9rem; margin-bottom: 1.5rem; font-weight: 500; text-align: center;
}
.error-banner {
  background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
  color: var(--color-danger); padding: 0.8rem 1rem; border-radius: var(--radius-md);
  font-size: 0.9rem; margin-bottom: 1.5rem; text-align: center;
}

/* ── Stats ──────────────────────────────────────────────────────────────────── */
.stats-row { margin-bottom: 1.5rem; }
.stat-card { display: flex; flex-direction: column; gap: 0.4rem; }
.stat-card__icon  { font-size: 1.5rem; }
.stat-card__value { font-size: 2rem; font-weight: 800; font-family: var(--font-display); }
.stat-card__label { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-card__delta { font-size: 0.78rem; }
.stat-card__delta.up   { color: var(--color-success); }
.stat-card__delta.down { color: var(--color-danger); }

/* ── Grid ───────────────────────────────────────────────────────────────────── */
.dashboard__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.section-header  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.section-header h3 { font-size: 1rem; margin-bottom: 0.2rem; }

/* ── Profile ────────────────────────────────────────────────────────────────── */
.profile-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.profile-pic    { width: 54px; height: 54px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-border); }
.profile-meta   { font-size: 0.8rem; color: var(--color-text-muted); }
.profile-bio    { font-size: 0.85rem; color: var(--color-text); line-height: 1.4; }

/* ── Automations ────────────────────────────────────────────────────────────── */
.automation-list { display: flex; flex-direction: column; gap: 0.75rem; }
.automation-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--color-surface-2); border-radius: var(--radius-md); }
.automation-item__info    { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.automation-item__name    { font-size: 0.9rem; font-weight: 600; }
.automation-item__trigger { font-size: 0.78rem; color: var(--color-text-muted); }

/* ── Activity ───────────────────────────────────────────────────────────────── */
.activity-feed { display: flex; flex-direction: column; gap: 0.75rem; }
.activity-item { display: flex; align-items: center; gap: 0.75rem; }
.activity-item__avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--grad-brand); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.activity-item__body { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.activity-item__name { font-size: 0.85rem; font-weight: 600; }
.activity-item__msg  { font-size: 0.78rem; color: var(--color-text-muted); }
.activity-item__time { font-size: 0.75rem; color: var(--color-text-faint); white-space: nowrap; }

/* ── Modal ──────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px); display: flex; align-items: center;
  justify-content: center; z-index: 1000; padding: 1rem;
}
.modal-card {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); padding: 2rem; width: 100%; max-width: 560px;
  display: flex; flex-direction: column; gap: 1.25rem;
  box-shadow: 0 24px 60px rgba(0,0,0,0.4);
  animation: slideUp 0.25s ease-out;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-header h2 { font-size: 1.2rem; font-weight: 700; margin: 0; }
.modal-close { background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--color-text-muted); padding: 0.25rem; }
.modal-close:hover { color: var(--color-text); }

.modal-section  { display: flex; flex-direction: column; gap: 0.75rem; }
.modal-label    { font-size: 0.85rem; color: var(--color-text-muted); margin: 0; }
.modal-divider  { text-align: center; font-size: 0.8rem; color: var(--color-text-faint); position: relative; }
.modal-divider::before, .modal-divider::after {
  content: ''; position: absolute; top: 50%; width: 40%; height: 1px;
  background: var(--color-border);
}
.modal-divider::before { left: 0; }
.modal-divider::after  { right: 0; }
.modal-actions  { display: flex; gap: 0.75rem; }

.token-display {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--color-surface-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 0.75rem;
}
.token-code {
  flex: 1; font-size: 0.72rem; font-family: 'Courier New', monospace;
  color: var(--color-success); word-break: break-all; white-space: pre-wrap;
  max-height: 80px; overflow-y: auto;
}
.btn-icon {
  background: none; border: none; cursor: pointer; font-size: 1.1rem;
  flex-shrink: 0; padding: 0.25rem; transition: transform 0.15s;
}
.btn-icon:hover { transform: scale(1.2); }

.token-input {
  width: 100%; background: var(--color-surface-2); border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 0.75rem; color: var(--color-text);
  font-size: 0.82rem; font-family: 'Courier New', monospace; resize: vertical;
  transition: border-color 0.2s;
}
.token-input:focus { outline: none; border-color: var(--color-primary); }

.modal-error   { color: var(--color-danger);  font-size: 0.85rem; text-align: center; }
.modal-success { color: var(--color-success); font-size: 0.85rem; text-align: center; }

@media (max-width: 768px) {
  .dashboard__grid { grid-template-columns: 1fr; }
}
</style>
