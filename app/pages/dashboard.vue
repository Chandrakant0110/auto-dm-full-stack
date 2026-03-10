<template>
  <NuxtLayout name="dashboard">
    <div class="dashboard animate-fade-in">
      <div v-if="successMsg" class="success-banner">
        {{ successMsg }}
      </div>

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
        <!-- Profile & Recent automations -->
        <div class="card" v-if="profile">
          <div class="section-header">
            <div class="profile-header">
              <img v-if="profile.profile_picture_url" :src="profile.profile_picture_url" alt="Profile Picture" class="profile-pic" />
              <div>
                <h3>{{ profile.name || profile.username }}</h3>
                <p class="profile-meta">
                  @{{ profile.username }} • {{ profile.followers_count }} followers • {{ profile.follows_count }} following
                </p>
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
          <p style="color:red; font-size: 0.8rem">{{ igError }}</p>
        </div>

        <div class="card">
          <div class="section-header">
            <h3>Active Automations</h3>
            <NuxtLink to="/automations" class="btn btn-ghost" style="padding: 0.4rem 0.75rem; font-size:0.8rem;">
              View all →
            </NuxtLink>
          </div>
          <div class="automation-list">
            <div class="automation-item" v-for="auto in recentAutomations" :key="auto.id">
              <span class="status-dot" :class="auto.status"></span>
              <div class="automation-item__info">
                <span class="automation-item__name">{{ auto.name }}</span>
                <span class="automation-item__trigger">trigger: {{ auto.trigger }}</span>
              </div>
              <span class="badge" :class="auto.status === 'active' ? 'badge-green' : 'badge-orange'">
                {{ auto.status }}
              </span>
            </div>
          </div>
        </div>

        <!-- Recent DM activity -->
        <div class="card">
          <div class="section-header">
            <h3>Recent DM Activity</h3>
          </div>
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
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

useHead({ title: 'Dashboard — AutoDM' })

const user = useSupabaseUser()
const route = useRoute()
const { profile, loading, error: igError, fetchProfile } = useInstagram()

const successMsg = ref('')

onMounted(async () => {
  if (route.query.ig === 'connected') {
    successMsg.value = 'Successfully linked Instagram account!'
    // remove query param without refreshing
    const newQuery = { ...route.query }
    delete newQuery.ig
    useRouter().replace({ query: newQuery })
  }

  if (!user.value) {
    navigateTo('/login')
  } else {
    await fetchProfile()
  }
})

const reconnectInstagram = () => {
  const config = useRuntimeConfig()
  const clientId = config.public.instagramAppId
  const redirectUri = `${config.public.siteUrl}/api/auth/instagram/callback`

  window.location.href = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights&state=dashboard`
}

const stats = [
  { icon: '📨', label: 'DMs Sent Today',    value: '1,284', delta:  12.4 },
  { icon: '👤', label: 'New Followers',      value: '342',   delta:   8.1 },
  { icon: '💬', label: 'Conversations',      value: '89',    delta:  -2.3 },
  { icon: '⚡', label: 'Active Rules',       value: '7',     delta:  40.0 },
]

const recentAutomations = [
  { id: 1, name: 'Welcome DM',        trigger: 'new follower', status: 'active'  },
  { id: 2, name: 'Story Reply',       trigger: 'story reply',  status: 'active'  },
  { id: 3, name: 'Keyword Trigger',   trigger: '"price" DM',   status: 'active'  },
  { id: 4, name: 'Post Comment Auto', trigger: 'reel comment', status: 'paused'  },
]

const activity = [
  { id: 1, initials: 'JD', username: '@johndoe',    message: "What's the price?",    time: '2m ago'  },
  { id: 2, initials: 'MK', username: '@mary_k',     message: 'Thanks for replying!', time: '8m ago'  },
  { id: 3, initials: 'AL', username: '@alex_lens',  message: 'DM sent: welcome msg', time: '15m ago' },
  { id: 4, initials: 'RB', username: '@riya_b',     message: 'Triggered: keyword',   time: '22m ago' },
  { id: 5, initials: 'TN', username: '@tomn',       message: 'Story reply captured', time: '1h ago'  },
]
</script>

<style scoped>
.success-banner {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--color-success);
  padding: 0.8rem 1rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  font-weight: 500;
  text-align: center;
}

.stats-row { margin-bottom: 1.5rem; }

.stat-card { display: flex; flex-direction: column; gap: 0.4rem; }
.stat-card__icon  { font-size: 1.5rem; }
.stat-card__value { font-size: 2rem; font-weight: 800; font-family: var(--font-display); }
.stat-card__label { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-card__delta { font-size: 0.78rem; }
.stat-card__delta.up   { color: var(--color-success); }
.stat-card__delta.down { color: var(--color-danger); }

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}
.section-header h3 { font-size: 1rem; margin-bottom: 0.2rem; }

.profile-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}
.profile-pic {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--color-border);
}
.profile-meta {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.profile-bio {
  font-size: 0.85rem;
  color: var(--color-text);
  line-height: 1.4;
}

/* Automation list */
.automation-list { display: flex; flex-direction: column; gap: 0.75rem; }
.automation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
}
.automation-item__info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.automation-item__name    { font-size: 0.9rem; font-weight: 600; }
.automation-item__trigger { font-size: 0.78rem; color: var(--color-text-muted); }

/* Activity feed */
.activity-feed { display: flex; flex-direction: column; gap: 0.75rem; }
.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.activity-item__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}
.activity-item__body { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.activity-item__name { font-size: 0.85rem; font-weight: 600; }
.activity-item__msg  { font-size: 0.78rem; color: var(--color-text-muted); }
.activity-item__time { font-size: 0.75rem; color: var(--color-text-faint); white-space: nowrap; }

@media (max-width: 768px) {
  .dashboard__grid { grid-template-columns: 1fr; }
}
</style>
