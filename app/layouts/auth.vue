<template>
  <div class="auth-shell">
    <div class="auth-bg">
      <div class="auth-bg__orb auth-bg__orb--1"></div>
      <div class="auth-bg__orb auth-bg__orb--2"></div>
      <div class="auth-bg__orb auth-bg__orb--3"></div>
    </div>
    <div class="auth-card animate-fade-in">
      <div class="auth-card__logo">
        <span>⚡</span>
        <span class="grad-text">AutoDM</span>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Gradient orbs */
.auth-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.auth-bg__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}
.auth-bg__orb--1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
  top: -100px; left: -100px;
  animation: float1 8s ease-in-out infinite;
}
.auth-bg__orb--2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, #ec4899 0%, transparent 70%);
  bottom: -50px; right: -50px;
  animation: float2 10s ease-in-out infinite;
}
.auth-bg__orb--3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #f97316 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation: float3 12s ease-in-out infinite;
}

@keyframes float1 {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(30px, 20px); }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(-20px, -30px); }
}
@keyframes float3 {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50%       { transform: translate(-50%, -50%) scale(1.1); }
}

/* Auth card */
.auth-card {
  position: relative;
  z-index: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: var(--shadow-card), var(--shadow-glow);
}
.auth-card__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 2rem;
}
</style>
