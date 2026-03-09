<template>
  <div class="auth-loading-container">
    <div class="loading-content animate-fade-in">
      <div class="spinner"></div>
      <h2>Connecting your Instagram Account...</h2>
      <p>We are securely exchanging tokens and setting up your connection. Please do not close this tab.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page acts as a visual holding screen while the client invokes the real auth exchange in the background.
// It is hit directly via the Instagram Callback.

const route = useRoute()

onMounted(async () => {
  const code = route.query.code

  if (!code) {
    navigateTo('/login?error=missing_code')
    return
  }

  try {
    // Call our internal API endpoint to actually do the heavy lifting asynchronously
    const res = await $fetch('/api/auth/instagram/exchange', {
      method: 'POST',
      body: { code }
    })
    
    // The API will tell the client where to route based on if they are an existing user or pending registration
    if (res.redirectTo) {
      window.location.href = res.redirectTo
    } else {
      window.location.href = '/dashboard?ig=connected'
    }

  } catch (err: any) {
    console.error('Failed to connect:', err)
    // If there is an explicit error message string from our endpoint, pass it to the URL
    const msg = err.data?.message || err.message || 'unknown_error'
    navigateTo(`/login?error=${encodeURIComponent(msg)}`)
  }
})
</script>

<style scoped>
.auth-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  padding: 2rem;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 400px;
}

.loading-content h2 {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.loading-content p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
}

/* Custom animated spinner */
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
