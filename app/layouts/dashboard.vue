<template>
  <div class="app-shell">
    <!-- Sidebar Nav -->
    <aside class="sidebar" :class="{ 'sidebar--collapsed': sidebarCollapsed }">
      <div class="sidebar__logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text" v-if="!sidebarCollapsed">AutoDM</span>
      </div>

      <nav class="sidebar__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
        >
          <span class="nav-item__icon">{{ item.icon }}</span>
          <span class="nav-item__label" v-if="!sidebarCollapsed">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <button class="sidebar__collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
        {{ sidebarCollapsed ? '›' : '‹' }}
      </button>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Top bar -->
      <header class="topbar">
        <div class="topbar__left">
          <h2 class="topbar__title">{{ pageTitle }}</h2>
        </div>
        <div class="topbar__right">
          <div class="topbar__status">
            <span class="status-dot active"></span>
            <span class="status-label">Connected</span>
          </div>
          <div class="topbar__avatar">CK</div>
        </div>
      </header>

      <!-- Page slot -->
      <div class="page-body">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const sidebarCollapsed = ref(false)
const route = useRoute()

const navItems = [
  { to: '/dashboard',    icon: '📊', label: 'Dashboard'    },
  { to: '/automations',  icon: '⚡', label: 'Automations'  },
  { to: '/campaigns',    icon: '📢', label: 'Campaigns'    },
  { to: '/conversations',icon: '💬', label: 'Conversations'},
  { to: '/analytics',    icon: '📈', label: 'Analytics'    },
  { to: '/settings',     icon: '⚙️', label: 'Settings'    },
]

const pageTitles: Record<string, string> = {
  '/dashboard':     'Dashboard',
  '/automations':   'Automations',
  '/campaigns':     'Campaigns',
  '/conversations': 'Conversations',
  '/analytics':     'Analytics',
  '/settings':      'Settings',
}

const pageTitle = computed(() => pageTitles[route.path] ?? 'AutoDM')
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-bg);
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0.75rem;
  position: sticky;
  top: 0;
  height: 100vh;
  transition: width var(--transition);
  flex-shrink: 0;
  overflow: hidden;
}
.sidebar--collapsed { width: 68px; }

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 0.5rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 1rem;
  white-space: nowrap;
  overflow: hidden;
}
.logo-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.logo-text {
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 800;
  background: var(--grad-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition);
  text-decoration: none;
}
.nav-item:hover {
  background: var(--color-surface-2);
  color: var(--color-text);
  opacity: 1;
}
.nav-item--active {
  background: rgba(139,92,246,0.15);
  color: var(--color-accent);
  border: 1px solid rgba(139,92,246,0.2);
  opacity: 1;
}

.nav-item__icon { font-size: 1.1rem; flex-shrink: 0; }

.sidebar__collapse-btn {
  margin-top: auto;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  transition: all var(--transition);
}
.sidebar__collapse-btn:hover { border-color: var(--color-accent); color: var(--color-text); }

/* Main */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* Topbar */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--color-border);
  background: rgba(10,10,15,0.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
}
.topbar__title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}
.topbar__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.topbar__status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
.status-label { color: var(--color-success); font-weight: 500; }
.topbar__avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: var(--grad-brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}

/* Page body */
.page-body {
  padding: 2rem;
  flex: 1;
}
</style>
