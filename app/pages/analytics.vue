<template>
  <NuxtLayout name="dashboard">
    <div class="analytics-page animate-fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-header__title">Analytics Overview</h1>
          <p class="page-header__sub">Track your automation performance and growth.</p>
        </div>
        <div class="header-actions">
          <select class="input select-period">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      <div class="grid-4 stats-row">
        <div class="card stat-card">
          <div class="stat-card__icon">📈</div>
          <div class="stat-card__value">12.5K</div>
          <div class="stat-card__label">Total Automations Fired</div>
          <div class="stat-card__delta up">↑ 24% vs last period</div>
        </div>
        <div class="card stat-card">
          <div class="stat-card__icon">📨</div>
          <div class="stat-card__value">8,432</div>
          <div class="stat-card__label">DMs Delivered</div>
          <div class="stat-card__delta up">↑ 18% vs last period</div>
        </div>
        <div class="card stat-card">
          <div class="stat-card__icon">🔥</div>
          <div class="stat-card__value">68%</div>
          <div class="stat-card__label">Avg Open Rate</div>
          <div class="stat-card__delta up">↑ 5% vs last period</div>
        </div>
        <div class="card stat-card">
          <div class="stat-card__icon">🗣️</div>
          <div class="stat-card__value">1,204</div>
          <div class="stat-card__label">Replies Received</div>
          <div class="stat-card__delta down">↓ 2% vs last period</div>
        </div>
      </div>

      <!-- Main grid -->
      <div class="dashboard__grid">
        <!-- Performance by Automation -->
        <div class="card">
          <div class="section-header">
            <h3>Top Performing Automations</h3>
          </div>
          <div class="automation-list">
            <div class="automation-item" v-for="auto in topAutomations" :key="auto.id">
              <div class="automation-item__info">
                <span class="automation-item__name">{{ auto.name }}</span>
                <span class="automation-item__trigger">Trigger: {{ auto.trigger }}</span>
              </div>
              <div class="automation-item__stats">
                <div class="progress-bar-container">
                  <div class="progress-bar" :style="{ width: auto.rate + '%' }"></div>
                </div>
                <span class="automation-item__rate">{{ auto.rate }}% conv.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Audience Growth -->
        <div class="card">
          <div class="section-header">
            <h3>Audience Growth</h3>
          </div>
          <div class="chart-container">
             <!-- Placeholder for a real chart, making a simple CSS bar chart representation -->
             <div class="css-chart">
               <div class="css-chart__bar" style="height: 40%"></div>
               <div class="css-chart__bar" style="height: 55%"></div>
               <div class="css-chart__bar" style="height: 50%"></div>
               <div class="css-chart__bar" style="height: 70%"></div>
               <div class="css-chart__bar" style="height: 85%"></div>
               <div class="css-chart__bar" style="height: 75%"></div>
               <div class="css-chart__bar" style="height: 100%; background: var(--grad-brand)"></div>
             </div>
             <div class="css-chart-labels">
               <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Analytics — AutoDM' })

const topAutomations = [
  { id: 1, name: 'Welcome DM', trigger: 'new follower', rate: 72 },
  { id: 2, name: 'Story Reply', trigger: 'story reply', rate: 65 },
  { id: 3, name: 'Keyword "Course"', trigger: 'keyword DM', rate: 48 },
  { id: 4, name: 'Reel Commenter', trigger: 'post comment', rate: 42 },
]
</script>

<style scoped>
.page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; }
.page-header__title { font-size: 1.75rem; margin-bottom: 0.25rem; font-weight: 700; }
.page-header__sub   { color: var(--color-text-muted); font-size: 0.95rem; }

.select-period {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  color: var(--color-text);
  font-family: var(--font-body);
  outline: none;
  cursor: pointer;
}
.select-period:hover { border-color: var(--color-accent); }

.stats-row { margin-bottom: 2rem; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
@media (max-width: 1024px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .stats-row { grid-template-columns: 1fr; } }

.stat-card { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.5rem; }
.stat-card__icon  { font-size: 1.75rem; margin-bottom: 0.5rem; }
.stat-card__value { font-size: 2.25rem; font-weight: 800; font-family: var(--font-display); }
.stat-card__label { font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-card__delta { font-size: 0.8rem; margin-top: 0.25rem; font-weight: 500; }
.stat-card__delta.up   { color: var(--color-success); }
.stat-card__delta.down { color: var(--color-danger); }

.dashboard__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 768px) { .dashboard__grid { grid-template-columns: 1fr; } }

.section-header { margin-bottom: 1.5rem; }
.section-header h3 { font-size: 1.1rem; font-weight: 600; }

.automation-list { display: flex; flex-direction: column; gap: 1rem; }
.automation-item { display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--color-surface-2); border-radius: var(--radius-md); border: 1px solid transparent; transition: border var(--transition); }
.automation-item:hover { border-color: var(--color-border); }
.automation-item__info { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
.automation-item__name { font-size: 0.95rem; font-weight: 600; }
.automation-item__trigger { font-size: 0.8rem; color: var(--color-text-muted); }

.automation-item__stats { width: 140px; display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; }
.progress-bar-container { width: 100%; height: 6px; background: var(--color-surface); border-radius: 3px; overflow: hidden; }
.progress-bar { height: 100%; background: var(--color-accent); border-radius: 3px; }
.automation-item__rate { font-size: 0.8rem; font-weight: 600; }

.chart-container { height: 280px; display: flex; flex-direction: column; justify-content: flex-end; padding-top: 1rem; }
.css-chart { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; padding: 0 1rem; border-bottom: 1px solid var(--color-border); gap: 1rem; }
.css-chart__bar { flex: 1; min-width: 20px; background: rgba(139, 92, 246, 0.3); border-radius: 4px 4px 0 0; transition: all 0.3s ease; cursor: pointer; }
.css-chart__bar:hover { background: var(--color-accent); transform: scaleY(1.02); }
.css-chart-labels { display: flex; justify-content: space-between; padding: 1rem 1rem 0; color: var(--color-text-muted); font-size: 0.8rem; font-weight: 500; }
</style>
