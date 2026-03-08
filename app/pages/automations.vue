<template>
  <NuxtLayout name="dashboard">
    <div class="automations-page animate-fade-in">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-header__title">Automations</h1>
          <p class="page-header__sub">Rules that automatically send DMs based on triggers</p>
        </div>
        <button id="create-automation-btn" class="btn btn-primary" @click="showModal = true">
          ＋ New Automation
        </button>
      </div>

      <!-- Filter tabs -->
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span class="filter-tab__count">{{ tabCount(tab.value) }}</span>
        </button>
      </div>

      <!-- Automation cards -->
      <div class="automations-grid">
        <div
          v-for="auto in filteredAutomations"
          :key="auto.id"
          class="automation-card card"
          :class="{ 'automation-card--paused': auto.status === 'paused' }"
        >
          <div class="automation-card__header">
            <div class="automation-card__trigger-badge badge badge-purple">
              {{ triggerLabel(auto.trigger) }}
            </div>
            <div class="automation-card__actions">
              <!-- Toggle switch -->
              <label class="toggle" :for="`toggle-${auto.id}`">
                <input
                  :id="`toggle-${auto.id}`"
                  type="checkbox"
                  :checked="auto.status === 'active'"
                  @change="toggleStatus(auto)"
                />
                <span class="toggle__slider"></span>
              </label>
            </div>
          </div>

          <h3 class="automation-card__name">{{ auto.name }}</h3>

          <p class="automation-card__preview">{{ auto.message_template }}</p>

          <div class="automation-card__meta">
            <div class="automation-card__stat">
              <span class="stat-num">{{ auto.stats.sent.toLocaleString() }}</span>
              <span class="stat-lbl">Sent</span>
            </div>
            <div class="automation-card__stat">
              <span class="stat-num">{{ auto.stats.opened.toLocaleString() }}</span>
              <span class="stat-lbl">Opened</span>
            </div>
            <div class="automation-card__stat">
              <span class="stat-num">{{ auto.stats.replied.toLocaleString() }}</span>
              <span class="stat-lbl">Replied</span>
            </div>
          </div>

          <div class="automation-card__footer">
            <span class="badge" :class="auto.status === 'active' ? 'badge-green' : 'badge-orange'">
              <span class="status-dot" :class="auto.status"></span>
              {{ auto.status }}
            </span>
            <div class="automation-card__footer-actions">
              <button class="btn btn-ghost btn-sm" @click="editAuto(auto)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteAuto(auto.id)">Delete</button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="filteredAutomations.length === 0" class="empty-state">
          <div class="empty-state__icon">⚡</div>
          <h3>No automations yet</h3>
          <p>Create your first automation rule to start sending DMs automatically.</p>
          <button class="btn btn-primary" @click="showModal = true">Create Automation</button>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <Teleport to="body">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal animate-fade-in">
            <div class="modal__header">
              <h2>{{ editingAuto ? 'Edit Automation' : 'New Automation' }}</h2>
              <button class="modal__close" @click="closeModal">✕</button>
            </div>

            <form class="modal__body" @submit.prevent="saveAuto">
              <div class="form-row">
                <label class="form-label">Name</label>
                <input v-model="form.name" class="input" placeholder="e.g. Welcome DM" required />
              </div>

              <div class="form-row">
                <label class="form-label">Trigger</label>
                <select v-model="form.trigger" class="input">
                  <option value="new_follower">New Follower</option>
                  <option value="story_reply">Story Reply</option>
                  <option value="keyword_dm">Keyword in DM</option>
                  <option value="post_comment">Post Comment</option>
                  <option value="reel_comment">Reel Comment</option>
                </select>
              </div>

              <div class="form-row" v-if="form.trigger === 'keyword_dm'">
                <label class="form-label">Keywords (comma-separated)</label>
                <input v-model="form.keywords" class="input" placeholder="price, buy, info" />
              </div>

              <div class="form-row">
                <label class="form-label">Message Template</label>
                <textarea v-model="form.message_template" class="input" rows="4"
                  placeholder="Hey {{username}}! Thanks for following 🎉 Here's something special for you...">
                </textarea>
                <p class="form-hint">Use <code v-pre>{{username}}</code> to personalise messages.</p>
              </div>

              <div class="form-row">
                <label class="form-label">Send Delay (seconds)</label>
                <input v-model.number="form.delay_seconds" type="number" class="input" min="0" max="3600" placeholder="0" />
              </div>

              <div class="modal__footer">
                <button type="button" class="btn btn-ghost" @click="closeModal">Cancel</button>
                <button type="submit" class="btn btn-primary">
                  {{ editingAuto ? 'Save Changes' : 'Create Automation' }}
                </button>
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
useHead({ title: 'Automations — AutoDM' })

const tabs = [
  { label: 'All',    value: 'all'    },
  { label: 'Active', value: 'active' },
  { label: 'Paused', value: 'paused' },
]
const activeTab = ref('all')

const automations = ref([
  { id: '1', name: 'Welcome DM',        trigger: 'new_follower', status: 'active', message_template: 'Hey {{username}}! Thanks for the follow 🎉 We have something special for you — DM us "deal" to unlock it!', keywords: [], delay_seconds: 30,  stats: { sent: 1284, opened: 872, replied: 214 } },
  { id: '2', name: 'Story Reply',       trigger: 'story_reply',  status: 'active', message_template: 'Thanks for engaging with our story, {{username}}! 💬 Tap the link in bio to learn more.',                keywords: [], delay_seconds: 0,   stats: { sent: 342,  opened: 298, replied: 89  } },
  { id: '3', name: 'Price Keyword DM',  trigger: 'keyword_dm',   status: 'active', message_template: "Hey {{username}}, here's the pricing breakdown you asked for 👇",                                         keywords: ['price','cost','how much'], delay_seconds: 5, stats: { sent: 89, opened: 84, replied: 61 } },
  { id: '4', name: 'Post Comment Auto', trigger: 'post_comment', status: 'paused', message_template: 'Loved your comment, {{username}}! 🔥 DM me to learn more.',                                               keywords: [], delay_seconds: 60,  stats: { sent: 523,  opened: 400, replied: 102 } },
  { id: '5', name: 'Reel Commenter DM', trigger: 'reel_comment', status: 'active', message_template: "Hey {{username}}, thanks for watching! 🎬 Want the full tutorial? Drop \"yes\" and I'll send it over.",    keywords: [], delay_seconds: 15,  stats: { sent: 712,  opened: 600, replied: 311 } },
])

const filteredAutomations = computed(() =>
  activeTab.value === 'all'
    ? automations.value
    : automations.value.filter(a => a.status === activeTab.value)
)

function tabCount(val: string) {
  if (val === 'all') return automations.value.length
  return automations.value.filter(a => a.status === val).length
}

const triggerLabels: Record<string, string> = {
  new_follower: 'New Follower',
  story_reply:  'Story Reply',
  keyword_dm:   'Keyword DM',
  post_comment: 'Post Comment',
  reel_comment: 'Reel Comment',
}
function triggerLabel(t: string) { return triggerLabels[t] ?? t }

// Modal
const showModal  = ref(false)
const editingAuto = ref<any>(null)
const form = reactive({
  name: '', trigger: 'new_follower', message_template: '', keywords: '', delay_seconds: 0,
})

function editAuto(auto: any) {
  editingAuto.value = auto
  Object.assign(form, {
    name: auto.name,
    trigger: auto.trigger,
    message_template: auto.message_template,
    keywords: auto.keywords.join(', '),
    delay_seconds: auto.delay_seconds,
  })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingAuto.value = null
  Object.assign(form, { name: '', trigger: 'new_follower', message_template: '', keywords: '', delay_seconds: 0 })
}

function saveAuto() {
  if (editingAuto.value) {
    const idx = automations.value.findIndex(a => a.id === editingAuto.value.id)
    if (idx !== -1) Object.assign(automations.value[idx]!, { ...form, keywords: form.keywords.split(',').map(k => k.trim()) })
  } else {
    automations.value.push({
      id: Date.now().toString(), ...form,
      keywords: form.keywords.split(',').map(k => k.trim()),
      status: 'active',
      stats: { sent: 0, opened: 0, replied: 0 },
    })
  }
  closeModal()
}

function toggleStatus(auto: any) {
  auto.status = auto.status === 'active' ? 'paused' : 'active'
}

function deleteAuto(id: string) {
  automations.value = automations.value.filter(a => a.id !== id)
}
</script>

<style scoped>
.page-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 1.75rem;
}
.page-header__title { font-size: 1.75rem; margin-bottom: 0.25rem; }
.page-header__sub   { color: var(--color-text-muted); font-size: 0.9rem; }

/* Filter tabs */
.filter-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
.filter-tab {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 1rem; border-radius: var(--radius-full);
  background: var(--color-surface); border: 1px solid var(--color-border);
  color: var(--color-text-muted); font-size: 0.85rem; font-weight: 500; cursor: pointer;
  transition: all var(--transition);
}
.filter-tab:hover          { border-color: var(--color-accent); color: var(--color-text); }
.filter-tab--active        { background: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.4); color: var(--color-accent); }
.filter-tab__count {
  background: var(--color-surface-2); padding: 0.1rem 0.45rem;
  border-radius: var(--radius-full); font-size: 0.72rem; color: var(--color-text-muted);
}

/* Grid */
.automations-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem;
}

/* Card */
.automation-card { display: flex; flex-direction: column; gap: 0.85rem; }
.automation-card--paused { opacity: 0.65; }
.automation-card__header { display: flex; align-items: center; justify-content: space-between; }

/* Toggle */
.toggle { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle__slider {
  position: absolute; inset: 0;
  background: var(--color-surface-2); border-radius: var(--radius-full);
  transition: var(--transition); border: 1px solid var(--color-border);
}
.toggle__slider::before {
  content: ''; position: absolute; width: 18px; height: 18px;
  border-radius: 50%; background: var(--color-text-muted);
  left: 2px; top: 2px; transition: var(--transition);
}
.toggle input:checked + .toggle__slider { background: rgba(16,185,129,0.25); border-color: var(--color-success); }
.toggle input:checked + .toggle__slider::before { transform: translateX(20px); background: var(--color-success); }

.automation-card__name    { font-size: 1.05rem; font-weight: 700; }
.automation-card__preview { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.5; display: -webkit-box; line-clamp: 2; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.automation-card__meta    { display: flex; gap: 1.5rem; padding: 0.75rem 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
.automation-card__stat    { display: flex; flex-direction: column; gap: 0.1rem; }
.stat-num { font-size: 1.1rem; font-weight: 700; font-family: var(--font-display); }
.stat-lbl { font-size: 0.72rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.automation-card__footer { display: flex; align-items: center; justify-content: space-between; }
.automation-card__footer-actions { display: flex; gap: 0.5rem; }

.btn-sm { padding: 0.35rem 0.75rem; font-size: 0.78rem; }

/* Empty state */
.empty-state {
  grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.empty-state__icon { font-size: 3rem; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
  z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem;
}
.modal {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius-xl); width: 100%; max-width: 520px;
  box-shadow: var(--shadow-card), var(--shadow-glow);
}
.modal__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.5rem 1.75rem; border-bottom: 1px solid var(--color-border);
}
.modal__header h2 { font-size: 1.25rem; }
.modal__close {
  background: none; border: none; color: var(--color-text-muted); cursor: pointer;
  font-size: 1.1rem; padding: 0.25rem; transition: color var(--transition);
}
.modal__close:hover { color: var(--color-text); }
.modal__body { padding: 1.75rem; display: flex; flex-direction: column; gap: 1.25rem; }
.modal__footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-border); }

.form-row { display: flex; flex-direction: column; gap: 0.4rem; }
.form-hint { font-size: 0.78rem; color: var(--color-text-muted); }
.form-hint code { background: var(--color-surface-2); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.78rem; }
</style>
