<template>
  <NuxtLayout name="dashboard">
    <div class="campaigns-page animate-fade-in">

      <div class="page-header">
        <div>
          <h1 class="page-header__title">Campaigns</h1>
          <p class="page-header__sub">Send bulk DMs to targeted audiences on schedule</p>
        </div>
        <button id="create-campaign-btn" class="btn btn-primary" @click="showModal = true">
          ＋ New Campaign
        </button>
      </div>

      <!-- Stats banner -->
      <div class="campaign-stats grid-4">
        <div class="stat-pill card" v-for="s in stats" :key="s.label">
          <span class="stat-pill__val">{{ s.val }}</span>
          <span class="stat-pill__label">{{ s.label }}</span>
        </div>
      </div>

      <!-- Campaign list -->
      <div class="campaign-list">
        <div class="campaign-item card" v-for="c in campaigns" :key="c.id">
          <div class="campaign-item__left">
            <div class="campaign-item__icon">📢</div>
            <div class="campaign-item__info">
              <h3 class="campaign-item__name">{{ c.name }}</h3>
              <p class="campaign-item__desc">{{ c.description }}</p>
            </div>
          </div>

          <div class="campaign-item__meta">
            <div class="campaign-meta-block">
              <span class="meta-val">{{ c.audience.toLocaleString() }}</span>
              <span class="meta-lbl">Audience</span>
            </div>
            <div class="campaign-meta-block">
              <span class="meta-val">{{ c.sent.toLocaleString() }}</span>
              <span class="meta-lbl">Sent</span>
            </div>
            <div class="campaign-meta-block">
              <span class="meta-val">{{ c.openRate }}%</span>
              <span class="meta-lbl">Open Rate</span>
            </div>
            <div class="campaign-meta-block">
              <span class="meta-val">{{ c.scheduledDate }}</span>
              <span class="meta-lbl">Scheduled</span>
            </div>
          </div>

          <div class="campaign-item__right">
            <span class="badge" :class="statusClass(c.status)">{{ c.status }}</span>
            <div class="campaign-item__actions">
              <button class="btn btn-ghost btn-sm" v-if="c.status === 'draft'" @click="launchCampaign(c)">Launch</button>
              <button class="btn btn-ghost btn-sm" v-if="c.status === 'running'" @click="pauseCampaign(c)">Pause</button>
              <button class="btn btn-ghost btn-sm" v-if="c.status === 'paused'" @click="launchCampaign(c)">Resume</button>
              <button class="btn btn-ghost btn-sm">Edit</button>
            </div>
          </div>
        </div>

        <div v-if="campaigns.length === 0" class="empty-state">
          <div class="empty-state__icon">📢</div>
          <h3>No campaigns yet</h3>
          <p>Create your first bulk DM campaign to reach your audience.</p>
          <button class="btn btn-primary" @click="showModal = true">Create Campaign</button>
        </div>
      </div>

      <!-- Create Modal -->
      <Teleport to="body">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal animate-fade-in">
            <div class="modal__header">
              <h2>New Campaign</h2>
              <button class="modal__close" @click="showModal = false">✕</button>
            </div>
            <form class="modal__body" @submit.prevent="createCampaign">
              <div class="form-row">
                <label class="form-label">Campaign Name</label>
                <input v-model="form.name" class="input" placeholder="e.g. Spring Sale Blast" required />
              </div>
              <div class="form-row">
                <label class="form-label">Description</label>
                <input v-model="form.description" class="input" placeholder="Short description..." />
              </div>
              <div class="form-row">
                <label class="form-label">Target Audience</label>
                <select v-model="form.audience" class="input">
                  <option value="all_followers">All Followers</option>
                  <option value="recent_followers">Recent Followers (30 days)</option>
                  <option value="story_viewers">Story Viewers</option>
                  <option value="post_likers">Post Likers</option>
                </select>
              </div>
              <div class="form-row">
                <label class="form-label">Message</label>
                <textarea v-model="form.message" class="input" rows="4"
                  placeholder="Hey {{username}}, we have an exclusive offer for you..."></textarea>
              </div>
              <div class="form-row">
                <label class="form-label">Schedule Date & Time</label>
                <input v-model="form.scheduledDate" class="input" type="datetime-local" />
              </div>
              <div class="modal__footer">
                <button type="button" class="btn btn-ghost" @click="showModal = false">Cancel</button>
                <button type="submit" class="btn btn-primary">Create Campaign</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Campaigns — AutoDM' })

const stats = [
  { val: '4',      label: 'Total Campaigns'  },
  { val: '18.4K',  label: 'Total DMs Sent'   },
  { val: '71.2%',  label: 'Avg Open Rate'    },
  { val: '2',      label: 'Running Now'      },
]

const campaigns = ref([
  { id: 1, name: 'Spring Promo',       description: 'Exclusive spring discount for all followers', audience: 12400, sent: 10200, openRate: 76, scheduledDate: 'Mar 1, 2026',  status: 'completed' },
  { id: 2, name: 'New Product Launch', description: 'Announcing our new flagship product',          audience: 8700,  sent: 4350,  openRate: 68, scheduledDate: 'Mar 7, 2026',  status: 'running'   },
  { id: 3, name: 'Flash Sale 24H',     description: '24-hour flash sale — limited quantities',      audience: 5600,  sent: 0,     openRate: 0,  scheduledDate: 'Mar 9, 2026',  status: 'draft'     },
  { id: 4, name: 'Referral Bonus',     description: 'Invite friends and earn rewards',              audience: 3300,  sent: 2800,  openRate: 82, scheduledDate: 'Feb 20, 2026', status: 'paused'    },
])

function statusClass(s: string) {
  return { draft: 'badge-orange', running: 'badge-green', completed: 'badge-purple', paused: 'badge-orange' }[s] ?? 'badge-purple'
}
function launchCampaign(c: any) { c.status = 'running' }
function pauseCampaign(c: any)  { c.status = 'paused'  }

const showModal = ref(false)
const form = reactive({ name: '', description: '', audience: 'all_followers', message: '', scheduledDate: '' })

function createCampaign() {
  campaigns.value.unshift({
    id: Date.now(),
    name: form.name,
    description: form.description,
    audience: 0,
    sent: 0,
    openRate: 0,
    scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD',
    status: 'draft',
  })
  showModal.value = false
  Object.assign(form, { name: '', description: '', audience: 'all_followers', message: '', scheduledDate: '' })
}
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.75rem; }
.page-header__title { font-size: 1.75rem; margin-bottom: 0.25rem; }
.page-header__sub   { color: var(--color-text-muted); font-size: 0.9rem; }

.campaign-stats { margin-bottom: 1.5rem; }
.stat-pill { text-align: center; }
.stat-pill__val   { display: block; font-size: 1.75rem; font-weight: 800; font-family: var(--font-display); }
.stat-pill__label { font-size: 0.78rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; }

.campaign-list { display: flex; flex-direction: column; gap: 1rem; }

.campaign-item {
  display: flex; align-items: center; gap: 1.5rem;
  flex-wrap: wrap;
}
.campaign-item__left  { display: flex; align-items: flex-start; gap: 1rem; flex: 1; min-width: 200px; }
.campaign-item__icon  { font-size: 1.75rem; width: 48px; height: 48px; background: var(--color-surface-2); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.campaign-item__name  { font-size: 1rem; font-weight: 700; margin-bottom: 0.2rem; }
.campaign-item__desc  { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.4; }

.campaign-item__meta  { display: flex; gap: 2rem; }
.campaign-meta-block  { display: flex; flex-direction: column; gap: 0.1rem; text-align: center; }
.meta-val { font-size: 1rem; font-weight: 700; font-family: var(--font-display); }
.meta-lbl { font-size: 0.7rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

.campaign-item__right { display: flex; align-items: center; gap: 0.75rem; }
.campaign-item__actions { display: flex; gap: 0.4rem; }

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }

.empty-state { text-align: center; padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.empty-state__icon { font-size: 3rem; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.modal { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-xl); width: 100%; max-width: 520px; box-shadow: var(--shadow-card), var(--shadow-glow); }
.modal__header { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 1.75rem; border-bottom: 1px solid var(--color-border); }
.modal__header h2 { font-size: 1.25rem; }
.modal__close { background: none; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 1.1rem; transition: color var(--transition); }
.modal__close:hover { color: var(--color-text); }
.modal__body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
.modal__footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border); }
.form-row { display: flex; flex-direction: column; gap: 0.4rem; }
</style>
