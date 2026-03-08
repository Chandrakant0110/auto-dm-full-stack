<template>
  <NuxtLayout name="dashboard">
    <div class="settings-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-header__title">Settings</h1>
          <p class="page-header__sub">Manage your account, preferences, and integrations.</p>
        </div>
      </div>

      <div class="settings-layout">
        <aside class="settings-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="settings-nav__item"
            :class="{ 'settings-nav__item--active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="settings-nav__icon">{{ tab.icon }}</span> 
            <span>{{ tab.label }}</span>
          </button>
        </aside>

        <main class="settings-content">
          <!-- Profile Settings -->
          <div v-if="activeTab === 'profile'" class="card animate-fade-in">
            <h3>Profile Information</h3>
            <p class="text-muted mb-4">Update your account details and personal info.</p>
            
            <div class="avatar-section mb-4">
              <div class="avatar-circle">CK</div>
              <button class="btn btn-outline btn-sm">Change Avatar</button>
            </div>

            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="input" value="Chandrakant" />
            </div>
            <div class="form-group mt-3">
              <label>Email Address</label>
              <input type="email" class="input" value="hello@example.com" />
            </div>
            
            <div class="form-actions mt-5">
              <button class="btn btn-primary">Save Changes</button>
            </div>
          </div>

          <!-- Integrations -->
          <div v-if="activeTab === 'integrations'" class="card animate-fade-in">
            <h3>Connected Accounts</h3>
            <p class="text-muted mb-4">Manage your social media integrations.</p>
            
            <div class="integration-card">
              <div class="integration-icon">IG</div>
              <div class="integration-info">
                <h4>Instagram Professional Account</h4>
                <p>Connected as @autodm_creator</p>
              </div>
              <button class="btn btn-ghost text-danger">Disconnect</button>
            </div>

            <div class="integration-card mt-3">
              <div class="integration-icon fb">FB</div>
              <div class="integration-info">
                <h4>Facebook Page</h4>
                <p>Not connected</p>
              </div>
              <button class="btn btn-outline">Connect</button>
            </div>
          </div>

          <!-- Billing -->
          <div v-if="activeTab === 'billing'" class="card animate-fade-in">
            <h3>Subscription Plan</h3>
            <p class="text-muted mb-4">Manage your subscription and billing details.</p>

            <div class="billing-summary">
              <div class="plan-details">
                <span class="badge badge-purple mb-2">Pro Plan</span>
                <h4>$49 <span style="font-size: 1rem; color: var(--color-text-muted); font-weight: normal;">/ month</span></h4>
                <p class="text-muted mt-2">Renews on Oct 12, 2026</p>
              </div>
              <button class="btn btn-outline">Manage Billing</button>
            </div>

            <h3 class="mt-5 mb-3" style="font-size: 1.1rem;">Payment Method</h3>
            <div class="payment-card">
              <div class="payment-icon">💳</div>
              <div class="payment-info">
                <h4>Visa ending in 4242</h4>
                <p>Expires 12/28</p>
              </div>
              <button class="btn btn-ghost">Update</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Settings — AutoDM' })

const tabs = [
  { id: 'profile', icon: '👤', label: 'My Profile' },
  { id: 'integrations', icon: '🔗', label: 'Integrations' },
  { id: 'billing', icon: '💳', label: 'Billing & Plan' },
]

const activeTab = ref('profile')
</script>

<style scoped>
.page-header { margin-bottom: 2rem; }
.page-header__title { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
.page-header__sub { color: var(--color-text-muted); font-size: 0.95rem; }

.settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 2rem; align-items: start; }
@media (max-width: 768px) { .settings-layout { grid-template-columns: 1fr; gap: 1.5rem; } }

.settings-nav { display: flex; flex-direction: column; gap: 0.4rem; }
.settings-nav__item { display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; background: none; border: none; font-size: 0.95rem; color: var(--color-text-muted); font-weight: 500; cursor: pointer; border-radius: var(--radius-md); text-align: left; transition: all var(--transition); border: 1px solid transparent; }
.settings-nav__item:hover { background: var(--color-surface-2); color: var(--color-text); }
.settings-nav__item--active { background: rgba(139, 92, 246, 0.1); color: var(--color-accent); font-weight: 600; border-color: rgba(139, 92, 246, 0.3); }
.settings-nav__icon { font-size: 1.1rem; }

.settings-content .card { padding: 2rem; min-height: 400px; }
.settings-content h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.5rem; }
.text-muted { color: var(--color-text-muted); font-size: 0.9rem; }
.mb-2 { margin-bottom: 0.5rem; display: inline-block; }
.mb-3 { margin-bottom: 1rem; }
.mb-4 { margin-bottom: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }
.mt-5 { margin-top: 2rem; }
.text-danger { color: var(--color-danger); }
.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }

.avatar-section { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
.avatar-circle { width: 72px; height: 72px; border-radius: 50%; background: var(--grad-brand); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: 700; border: 3px solid var(--color-surface); box-shadow: 0 0 0 2px var(--color-border); }

.form-group { display: flex; flex-direction: column; gap: 0.5rem; max-width: 440px; }
.form-group label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-muted); }
.input { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 0.8rem 1rem; color: var(--color-text); font-family: var(--font-body); font-size: 0.95rem; outline: none; transition: border var(--transition); }
.input:focus { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }

.integration-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface-2); transition: border var(--transition); }
.integration-card:hover { border-color: rgba(255, 255, 255, 0.15); }
.integration-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
.integration-icon.fb { background: #1877F2; }
.integration-info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.integration-info h4 { font-size: 1rem; font-weight: 600; }
.integration-info p { font-size: 0.85rem; color: var(--color-text-muted); }

.billing-summary { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface-2); transition: border var(--transition); }
.billing-summary:hover { border-color: var(--color-accent); }
.plan-details h4 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }

.payment-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border: 1px solid var(--color-border); border-radius: var(--radius-lg); background: var(--color-surface-2); }
.payment-icon { width: 42px; height: 32px; background: #fff; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0; border: 1px solid #ccc; }
.payment-info { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.payment-info h4 { font-size: 0.95rem; font-weight: 600; }
.payment-info p { font-size: 0.85rem; color: var(--color-text-muted); }
</style>
